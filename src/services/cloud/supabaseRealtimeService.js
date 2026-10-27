/**
 * VELLIA LICITAÇÕES — SERVIÇO WEBSOCKET REALTIME SUPABASE
 * Sincronização instantânea em sub-segundo entre múltiplos navegadores e usuários.
 * Implementação nativa via protocolo Phoenix Channels do Supabase sem dependências extras.
 */

import { supabaseClient } from './supabaseClient.js';
import { opportunityRepository } from '../opportunityRepository.js';
import { EventBus, VELLIA_EVENTS } from '../eventBus.js';
import { logService, LogType } from '../logService.js';

export const REALTIME_STATUS = {
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  SUBSCRIBED: 'SUBSCRIBED',
  RECONNECTING: 'RECONNECTING',
  ERROR: 'ERROR'
};

class SupabaseRealtimeService {
  constructor() {
    this.socket = null;
    this.status = REALTIME_STATUS.DISCONNECTED;
    this.heartbeatInterval = null;
    this.reconnectTimeout = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.msgRef = 1;
    this.joinedTopic = 'realtime:public:opportunities';
    this.listeners = new Set();
    this.lastEventTime = null;
    this.totalEventsReceived = 0;
  }

  /**
   * Converte URL HTTP(S) do Supabase em WebSocket WSS
   */
  getWebSocketUrl() {
    const config = supabaseClient.config;
    if (!config.url || !config.anonKey) return null;

    let wsBase = config.url.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
    return `${wsBase}/realtime/v1/websocket?apikey=${encodeURIComponent(config.anonKey)}&vsn=1.0.0`;
  }

  /**
   * Inicia a conexão WebSocket em tempo real
   */
  connect() {
    if (!supabaseClient.isConfigured()) {
      this.status = REALTIME_STATUS.DISCONNECTED;
      this.emitStatus();
      return;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    if (!wsUrl) return;

    this.status = REALTIME_STATUS.CONNECTING;
    this.emitStatus();

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.status = REALTIME_STATUS.CONNECTED;
        this.reconnectAttempts = 0;
        this.emitStatus();
        this.startHeartbeat();
        this.joinChannel();
        logService.addLog(LogType.SYNC, 'Supabase Realtime: Conexão WebSocket estabelecida com sucesso.');
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.socket.onclose = (event) => {
        this.stopHeartbeat();
        this.status = REALTIME_STATUS.DISCONNECTED;
        this.emitStatus();
        
        // Tenta reconectar se não foi encerramento voluntário
        if (event.code !== 1000) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (err) => {
        console.warn('[SupabaseRealtime] Erro no WebSocket:', err);
        this.status = REALTIME_STATUS.ERROR;
        this.emitStatus();
      };

    } catch (e) {
      console.warn('[SupabaseRealtime] Falha ao instanciar WebSocket:', e);
      this.status = REALTIME_STATUS.ERROR;
      this.emitStatus();
      this.scheduleReconnect();
    }
  }

  /**
   * Envia mensagem no formato Phoenix Channel
   */
  send(topic, event, payload = {}) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    const ref = String(this.msgRef++);
    const msg = JSON.stringify({
      topic,
      event,
      payload,
      ref
    });
    this.socket.send(msg);
  }

  /**
   * Assina o canal de mudanças da tabela opportunities
   */
  joinChannel() {
    this.send(this.joinedTopic, 'phx_join', {
      config: {
        broadcast: { ack: true, self: false },
        postgres_changes: [
          {
            event: '*',
            schema: 'public',
            table: 'opportunities'
          }
        ]
      }
    });
    this.status = REALTIME_STATUS.SUBSCRIBED;
    this.emitStatus();
  }

  /**
   * Mantém o heartbeat do WebSocket
   */
  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      this.send('phoenix', 'heartbeat', {});
    }, 25000);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Agenda reconexão com backoff exponencial
   */
  scheduleReconnect() {
    if (this.reconnectTimeout) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('[SupabaseRealtime] Limite de tentativas de reconexão atingido.');
      return;
    }

    this.reconnectAttempts++;
    this.status = REALTIME_STATUS.RECONNECTING;
    this.emitStatus();

    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  /**
   * Processa mensagens recebidas do Supabase
   */
  handleMessage(rawData) {
    try {
      const msg = JSON.parse(rawData);
      if (!msg) return;

      // Resposta ao heartbeat ou join
      if (msg.event === 'phx_reply' || msg.event === 'phx_close') return;

      // Mudanças de banco de dados PostgreSQL
      if (msg.event === 'postgres_changes') {
        this.handlePostgresChange(msg.payload);
      } else if (msg.event === 'broadcast') {
        this.handleBroadcast(msg.payload);
      }
    } catch (e) {
      console.warn('[SupabaseRealtime] Falha ao processar mensagem do socket:', e);
    }
  }

  /**
   * Processa eventos INSERT, UPDATE ou DELETE do PostgreSQL
   */
  handlePostgresChange(payload) {
    if (!payload || !payload.data) return;

    this.totalEventsReceived++;
    this.lastEventTime = new Date().toISOString();
    const { eventType, record, old_record } = payload.data;

    if (eventType === 'INSERT' && record) {
      const mapped = supabaseClient.mapFromDb(record);
      const exists = opportunityRepository.getById(mapped.id) || opportunityRepository.getById(mapped.number);
      if (!exists) {
        opportunityRepository.add(mapped);
        logService.addLog(LogType.SYNC, `Realtime: Novo certame sincronizado na nuvem (${mapped.number}).`);
        EventBus.emit('vellia-realtime-opportunity-inserted', mapped);
      }
    } else if (eventType === 'UPDATE' && record) {
      const mapped = supabaseClient.mapFromDb(record);
      const existing = opportunityRepository.getById(mapped.id);
      if (existing) {
        opportunityRepository.update(existing.id, mapped);
        logService.addLog(LogType.SYNC, `Realtime: Atualização recebida para o certame (${mapped.number}).`);
        EventBus.emit('vellia-realtime-opportunity-updated', mapped);
      }
    } else if (eventType === 'DELETE' && old_record) {
      opportunityRepository.delete(old_record.id);
      EventBus.emit('vellia-realtime-opportunity-deleted', old_record.id);
    }

    this.emitStatus();
    EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, {});
  }

  /**
   * Processa mensagens de broadcast colaborativo (ex: voto em Go/No-Go por outro colega)
   */
  handleBroadcast(payload) {
    if (!payload) return;
    EventBus.emit('vellia-realtime-broadcast-received', payload);
  }

  /**
   * Envia broadcast colaborativo instantâneo
   */
  sendBroadcast(eventName, data = {}) {
    if (this.status !== REALTIME_STATUS.SUBSCRIBED) return;
    this.send(this.joinedTopic, 'broadcast', {
      event: eventName,
      payload: {
        ...data,
        senderAt: new Date().toISOString()
      }
    });
  }

  /**
   * Desconecta
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close(1000, 'User initiated disconnect');
      this.socket = null;
    }
    this.status = REALTIME_STATUS.DISCONNECTED;
    this.emitStatus();
  }

  getState() {
    return {
      status: this.status,
      isSubscribed: this.status === REALTIME_STATUS.SUBSCRIBED,
      isConnected: this.status === REALTIME_STATUS.CONNECTED || this.status === REALTIME_STATUS.SUBSCRIBED,
      totalEventsReceived: this.totalEventsReceived,
      lastEventTime: this.lastEventTime,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  emitStatus() {
    EventBus.emit('vellia-supabase-realtime-status-changed', this.getState());
  }
}

export const supabaseRealtimeService = new SupabaseRealtimeService();
export default supabaseRealtimeService;
