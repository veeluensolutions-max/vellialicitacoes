/**
 * VELLIA LICITAÇÕES — FASE 37
 * EVENT BUS & ORQUESTRADOR CENTRAL DE EVENTOS
 * 
 * Responsável por:
 * - Publicação de eventos de negócio com rastreabilidade
 * - Idempotência estrita (rejeição de eventId duplicado)
 * - Prevenção de loop infinito de workflows (Max Depth & Correlation Tracking)
 * - Fila de persistência e Dead Letter Queue
 */

import { createDomainEvent } from './domainEvents.js';

const STORAGE_KEYS = {
  EVENT_HISTORY: 'vellia_event_history_v37',
  PROCESSED_EVENT_IDS: 'vellia_processed_event_ids_v37',
  DEAD_LETTER_QUEUE: 'vellia_dead_letter_queue_v37'
};

const memoryStore = {};
function getStorage(key, fallback) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const val = localStorage.getItem(key);
      if (val) return JSON.parse(val);
    }
  } catch {}
  return memoryStore[key] ? memoryStore[key] : fallback;
}

function setStorage(key, value) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
  memoryStore[key] = value;
}

export class EventBus {
  static listeners = new Map();
  static correlationDepth = new Map();
  static MAX_CORRELATION_DEPTH = 5;

  /**
   * Inscreve um handler para um tipo específico de evento ou '*' (todos)
   */
  static subscribe(eventType, handler) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(handler);
    return () => this.unsubscribe(eventType, handler);
  }

  static unsubscribe(eventType, handler) {
    if (!this.listeners.has(eventType)) return;
    const list = this.listeners.get(eventType);
    const idx = list.indexOf(handler);
    if (idx !== -1) list.splice(idx, 1);
  }

  /**
   * Publica um evento de domínio no barramento (Itens 2 a 11)
   */
  static publish(eventInput) {
    const event = eventInput.eventId ? eventInput : createDomainEvent(eventInput);

    // 1. VERIFICAÇÃO DE IDEMPOTÊNCIA (Itens 8 e 9)
    const processedIds = getStorage(STORAGE_KEYS.PROCESSED_EVENT_IDS, []);
    if (processedIds.includes(event.eventId)) {
      console.warn(`[EventBus] Evento ${event.eventId} já processado anteriormente. Descartado por Idempotência.`);
      return {
        success: true,
        idempotentBypass: true,
        event,
        message: 'Evento descartado com sucesso por idempotência.'
      };
    }

    // 2. PREVENÇÃO DE LOOP INFINITO (Itens 122 a 124)
    const currentDepth = (this.correlationDepth.get(event.correlationId) || 0) + 1;
    if (currentDepth > this.MAX_CORRELATION_DEPTH) {
      console.error(`[EventBus] Loop de eventos prevenido para correlationId ${event.correlationId} (Profundidade ${currentDepth} > ${this.MAX_CORRELATION_DEPTH}).`);
      this.sendToDeadLetter(event, `Loop infinito interrompido: profundidade excedeu ${this.MAX_CORRELATION_DEPTH}`);
      return {
        success: false,
        loopPrevented: true,
        event,
        error: 'Cadeia de eventos interrompida para evitar loop infinito.'
      };
    }
    this.correlationDepth.set(event.correlationId, currentDepth);

    // 3. REGISTRO NO HISTÓRICO DE EVENTOS
    const history = getStorage(STORAGE_KEYS.EVENT_HISTORY, []);
    history.unshift(event);
    setStorage(STORAGE_KEYS.EVENT_HISTORY, history.slice(0, 100));

    // Marca eventId como processado
    processedIds.unshift(event.eventId);
    setStorage(STORAGE_KEYS.PROCESSED_EVENT_IDS, processedIds.slice(0, 200));

    // 4. DISPARO DE LISTENERS
    const matchingHandlers = [
      ...(this.listeners.get(event.eventType) || []),
      ...(this.listeners.get('*') || [])
    ];

    const results = [];
    for (const handler of matchingHandlers) {
      try {
        const result = handler(event);
        results.push({ handlerSuccess: true, result });
      } catch (err) {
        console.error(`[EventBus] Erro ao executar handler para evento ${event.eventType}:`, err);
        results.push({ handlerSuccess: false, error: err.message });
        this.sendToDeadLetter(event, err.message);
      }
    }

    return {
      success: true,
      event,
      dispatchedHandlersCount: matchingHandlers.length,
      results
    };
  }

  /**
   * Encaminha falha para a Dead Letter Queue (Itens 115 e 116)
   */
  static sendToDeadLetter(event, reason) {
    try {
      const dlq = getStorage(STORAGE_KEYS.DEAD_LETTER_QUEUE, []);
      dlq.unshift({
        event,
        failedAt: new Date().toISOString(),
        reason
      });
      setStorage(STORAGE_KEYS.DEAD_LETTER_QUEUE, dlq.slice(0, 50));
    } catch {}
  }

  static getEventHistory(filterType = null) {
    const list = getStorage(STORAGE_KEYS.EVENT_HISTORY, []);
    if (!filterType) return list;
    return list.filter(e => e.eventType === filterType);
  }

  static getDeadLetterQueue() {
    return getStorage(STORAGE_KEYS.DEAD_LETTER_QUEUE, []);
  }

  static clearCachesForTesting() {
    this.correlationDepth.clear();
  }
}

export const eventBus = EventBus;
export default eventBus;
