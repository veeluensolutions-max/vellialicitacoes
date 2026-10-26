/**
 * VELLIA LICITAÇÕES — SERVIÇO DE SINCRONIZAÇÃO EM NUVEM (CLOUD SYNC SERVICE)
 * Garante sincronização bidirecional em tempo real entre o repositório local e o Supabase.
 * Multi-usuário: atualizações feitas pela Diretoria refletem na equipe e vice-versa.
 */

import { supabaseClient } from './supabaseClient.js';
import { opportunityRepository } from '../opportunityRepository.js';
import { EventBus, VELLIA_EVENTS } from '../eventBus.js';
import { GeneralAuditService } from '../admin/generalAuditService.js';
import { logService, LogType } from '../logService.js';

export const CLOUD_SYNC_STATUS = {
  UNCONFIGURED: 'UNCONFIGURED',
  CONNECTED: 'CONNECTED',
  SYNCING: 'SYNCING',
  OFFLINE: 'OFFLINE',
  ERROR: 'ERROR'
};

const STORAGE_KEY_STATE = 'vellia_cloud_sync_state_v1';

class CloudSyncService {
  constructor() {
    this.status = CLOUD_SYNC_STATUS.UNCONFIGURED;
    this.timerId = null;
    this.pollIntervalSeconds = 30; // Polling a cada 30 segundos
    this.lastSyncedAt = null;
    this.lastLatencyMs = 0;
    this.totalSyncedCount = 0;
    this.lastError = null;
    this.isSyncing = false;

    this.loadState();
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_STATE);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.lastSyncedAt = parsed.lastSyncedAt || null;
          this.totalSyncedCount = parsed.totalSyncedCount || 0;
          this.lastLatencyMs = parsed.lastLatencyMs || 0;
        }
      }
    } catch {}

    if (supabaseClient.isConfigured()) {
      this.status = CLOUD_SYNC_STATUS.CONNECTED;
    } else {
      this.status = CLOUD_SYNC_STATUS.UNCONFIGURED;
    }
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify({
          lastSyncedAt: this.lastSyncedAt,
          totalSyncedCount: this.totalSyncedCount,
          lastLatencyMs: this.lastLatencyMs
        }));
      }
    } catch {}
  }

  getState() {
    return {
      status: this.status,
      isConfigured: supabaseClient.isConfigured(),
      lastSyncedAt: this.lastSyncedAt,
      lastLatencyMs: this.lastLatencyMs,
      totalSyncedCount: this.totalSyncedCount,
      lastError: this.lastError,
      pollIntervalSeconds: this.pollIntervalSeconds,
      config: {
        url: supabaseClient.config.url,
        hasKey: Boolean(supabaseClient.config.anonKey)
      }
    };
  }

  emitStatus() {
    EventBus.emit('vellia-cloud-sync-status-changed', this.getState());
  }

  /**
   * Inicia o monitor de sincronização periódica com a nuvem
   */
  start(intervalSeconds = 30) {
    this.pollIntervalSeconds = intervalSeconds;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    if (!supabaseClient.isConfigured()) {
      this.status = CLOUD_SYNC_STATUS.UNCONFIGURED;
      this.emitStatus();
      return;
    }

    this.status = CLOUD_SYNC_STATUS.CONNECTED;
    this.emitStatus();

    // Executa uma sincronização inicial suave
    this.pullRemoteChanges().catch(err => {
      console.warn('[CloudSync] Falha suave na sincronização inicial:', err.message);
    });

    // Inicia o timer periódico
    const intervalMs = Math.max(this.pollIntervalSeconds * 1000, 10000);
    this.timerId = setInterval(() => {
      this.pullRemoteChanges().catch(e => console.warn('[CloudSync] Erro no polling de nuvem:', e.message));
    }, intervalMs);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Salva novas credenciais e reestabelece conexão
   */
  async updateCredentials(url, anonKey) {
    supabaseClient.saveConfig(url, anonKey);
    const testRes = await supabaseClient.testConnection();

    if (testRes.success) {
      this.status = CLOUD_SYNC_STATUS.CONNECTED;
      this.lastLatencyMs = testRes.latencyMs;
      this.lastError = null;
      this.start(this.pollIntervalSeconds);
    } else {
      this.status = CLOUD_SYNC_STATUS.ERROR;
      this.lastError = testRes.message;
    }

    this.emitStatus();
    return testRes;
  }

  /**
   * Envia uma oportunidade individual para o Supabase (chamado após add/update local)
   */
  async pushLocalOpportunity(opp) {
    if (!supabaseClient.isConfigured()) return null;

    try {
      const res = await supabaseClient.upsertOpportunity(opp);
      this.totalSyncedCount += 1;
      this.lastSyncedAt = new Date().toISOString();
      this.saveState();
      this.emitStatus();
      return res;
    } catch (err) {
      console.warn('[CloudSync] Falha ao enviar oportunidade para a nuvem:', err.message);
      this.lastError = err.message;
      this.status = CLOUD_SYNC_STATUS.ERROR;
      this.emitStatus();
      return null;
    }
  }

  /**
   * Busca alterações da nuvem feitas por outros usuários (Pull)
   */
  async pullRemoteChanges() {
    if (!supabaseClient.isConfigured() || this.isSyncing) return { updated: 0, newAdded: 0 };

    this.isSyncing = true;
    const previousStatus = this.status;
    this.status = CLOUD_SYNC_STATUS.SYNCING;
    this.emitStatus();

    try {
      const startTime = Date.now();
      const remoteOpps = await supabaseClient.fetchOpportunities(100);
      const latencyMs = Date.now() - startTime;
      this.lastLatencyMs = latencyMs;

      let updatedCount = 0;
      let newCount = 0;

      if (Array.isArray(remoteOpps) && remoteOpps.length > 0) {
        const currentLocals = opportunityRepository.getAll();

        for (const remote of remoteOpps) {
          const matchIndex = currentLocals.findIndex(l => l.id === remote.id || l.number === remote.number);

          if (matchIndex === -1) {
            // Nova oportunidade que outra pessoa cadastrou na nuvem
            opportunityRepository.add(remote);
            newCount++;
          } else {
            const local = currentLocals[matchIndex];
            // Resolução por timestamp (Last-Write-Wins)
            const localTime = new Date(local.lastUpdated || 0).getTime();
            const remoteTime = new Date(remote.lastUpdated || 0).getTime();

            if (remoteTime > localTime) {
              opportunityRepository.update(local.id, remote);
              updatedCount++;
            }
          }
        }
      }

      this.status = CLOUD_SYNC_STATUS.CONNECTED;
      this.lastSyncedAt = new Date().toISOString();
      this.lastError = null;
      this.saveState();
      this.emitStatus();

      if (newCount > 0 || updatedCount > 0) {
        logService.addLog(LogType.SYNC, `Sincronização em Nuvem: +${newCount} novos, ${updatedCount} atualizados via Supabase.`);
      }

      return { updated: updatedCount, newAdded: newCount, latencyMs };
    } catch (err) {
      this.status = CLOUD_SYNC_STATUS.ERROR;
      this.lastError = err.message;
      this.emitStatus();
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Upload Inicial Completo da Base Local para o Supabase
   */
  async fullSyncUpload() {
    if (!supabaseClient.isConfigured()) {
      throw new Error('Supabase não configurado. Insira a URL e Chave nas configurações.');
    }

    this.isSyncing = true;
    this.status = CLOUD_SYNC_STATUS.SYNCING;
    this.emitStatus();

    try {
      const allLocal = opportunityRepository.getAll();
      const res = await supabaseClient.bulkUpsert(allLocal);

      this.lastSyncedAt = new Date().toISOString();
      this.totalSyncedCount += res.count;
      this.status = CLOUD_SYNC_STATUS.CONNECTED;
      this.lastError = null;
      this.saveState();
      this.emitStatus();

      GeneralAuditService.logAction({
        user: 'Diretoria / Usuário Atual',
        module: 'Sincronização Nuvem',
        action: 'Upload Completo para Supabase',
        object: 'Tabela public.opportunities',
        diffBefore: null,
        diffAfter: { count: res.count },
        result: 'SUCESSO'
      });

      return { success: true, count: res.count };
    } catch (err) {
      this.status = CLOUD_SYNC_STATUS.ERROR;
      this.lastError = err.message;
      this.emitStatus();
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Baixar Toda a Base da Nuvem para a Máquina Local
   */
  async fullSyncDownload() {
    if (!supabaseClient.isConfigured()) {
      throw new Error('Supabase não configurado.');
    }

    this.isSyncing = true;
    this.status = CLOUD_SYNC_STATUS.SYNCING;
    this.emitStatus();

    try {
      const remoteOpps = await supabaseClient.fetchOpportunities(500);

      if (Array.isArray(remoteOpps) && remoteOpps.length > 0) {
        opportunityRepository.save(remoteOpps);
        this.lastSyncedAt = new Date().toISOString();
        this.status = CLOUD_SYNC_STATUS.CONNECTED;
        this.lastError = null;
        this.saveState();
        this.emitStatus();

        EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, { count: remoteOpps.length });

        return { success: true, count: remoteOpps.length };
      }

      return { success: true, count: 0 };
    } catch (err) {
      this.status = CLOUD_SYNC_STATUS.ERROR;
      this.lastError = err.message;
      this.emitStatus();
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }
}

export const cloudSyncService = new CloudSyncService();
export default cloudSyncService;
