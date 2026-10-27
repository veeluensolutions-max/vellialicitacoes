/**
 * VELLIA LICITAÇÕES — WORKER DE INGESTÃO CONTÍNUA COMPRAS.GOV.BR (COMPRASNET)
 * Monitoramento autônomo em background de compras públicas federais.
 * 
 * Funcionalidades:
 * - Varredura periódica e autônoma em background (sem travamento de UI)
 * - Coleta ao vivo via ComprasGovLiveCollectorService
 * - Normalização via ComprasGovAdapter (DTO + Entity)
 * - Enriquecimento semântico com cálculo de aderência Veeluen vs Excelência
 * - Deduplicação automática por UASG, processo e hash
 * - Geração de Alertas Imediatos no AlertService para certames relevantes (>= 75%)
 * - Notificações em tempo real via EventBus
 * - Persistência do histórico de execuções no localStorage
 */

import { ComprasGovLiveCollectorService } from './comprasGovLiveCollectorService.js';
import { ComprasGovAdapter } from '../multisource/comprasGovAdapter.js';
import { opportunityRepository } from '../opportunityRepository.js';
import { OpportunityService } from '../opportunityService.js';
import { sourceRepository } from '../sourceRepository.js';
import { AlertService, AlertType, AlertLevel } from '../agent/alertService.js';
import { logService, LogType } from '../logService.js';
import { EventBus, VELLIA_EVENTS } from '../eventBus.js';

export const COMPRAS_GOV_WORKER_STATUS = {
  ACTIVE: 'ACTIVE',
  INGESTING: 'INGESTING',
  PAUSED: 'PAUSED',
  ERROR: 'ERROR'
};

const STORAGE_KEY = 'vellia_comprasgov_ingestion_worker_v1';

class ComprasGovContinuousIngestionWorker {
  constructor() {
    this.timerId = null;
    this.status = COMPRAS_GOV_WORKER_STATUS.PAUSED;
    this.intervalMinutes = 15; // Padrão: 15 minutos
    this.lastRunAt = null;
    this.nextRunAt = null;
    this.lastDurationMs = 0;
    this.totalRuns = 0;
    this.totalCaptured = 0;
    this.totalNew = 0;
    this.totalRelevant = 0;
    this.history = [];
    this.lastError = null;
    this.lastLogMessage = 'Worker Compras.gov.br inicializado e pronto para operação.';

    this.loadState();
  }

  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.intervalMinutes = parsed.intervalMinutes || 15;
          this.totalRuns = parsed.totalRuns || 0;
          this.totalCaptured = parsed.totalCaptured || 0;
          this.totalNew = parsed.totalNew || 0;
          this.totalRelevant = parsed.totalRelevant || 0;
          this.history = Array.isArray(parsed.history) ? parsed.history : [];
          this.lastRunAt = parsed.lastRunAt || null;
          this.lastDurationMs = parsed.lastDurationMs || 0;
          this.lastLogMessage = parsed.lastLogMessage || this.lastLogMessage;
        }
      }
    } catch (e) {
      console.warn('[ComprasGovWorker] Falha ao carregar estado persistido:', e);
    }
  }

  saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const payload = {
          intervalMinutes: this.intervalMinutes,
          totalRuns: this.totalRuns,
          totalCaptured: this.totalCaptured,
          totalNew: this.totalNew,
          totalRelevant: this.totalRelevant,
          history: this.history.slice(0, 20),
          lastRunAt: this.lastRunAt,
          lastDurationMs: this.lastDurationMs,
          lastLogMessage: this.lastLogMessage
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (e) {
      console.warn('[ComprasGovWorker] Falha ao salvar estado:', e);
    }
  }

  getState() {
    return {
      status: this.status,
      intervalMinutes: this.intervalMinutes,
      lastRunAt: this.lastRunAt,
      nextRunAt: this.nextRunAt,
      lastDurationMs: this.lastDurationMs,
      totalRuns: this.totalRuns,
      totalCaptured: this.totalCaptured,
      totalNew: this.totalNew,
      totalRelevant: this.totalRelevant,
      history: [...this.history],
      lastError: this.lastError,
      lastLogMessage: this.lastLogMessage
    };
  }

  start(intervalMinutes = null) {
    if (intervalMinutes && intervalMinutes > 0) {
      this.intervalMinutes = intervalMinutes;
    }

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.status = COMPRAS_GOV_WORKER_STATUS.ACTIVE;
    this.lastError = null;
    this.lastLogMessage = `Worker Compras.gov.br ATIVO. Varredura a cada ${this.intervalMinutes} min.`;
    
    this.scheduleNextRun();
    this.emitStatus();

    this.runIngestionCycle();

    const intervalMs = Math.max(this.intervalMinutes * 60 * 1000, 30000);
    this.timerId = setInterval(() => {
      this.runIngestionCycle();
    }, intervalMs);

    logService.addLog(LogType.SYNC, `Worker Compras.gov.br iniciado com frequência de ${this.intervalMinutes} min.`);
  }

  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.status = COMPRAS_GOV_WORKER_STATUS.PAUSED;
    this.nextRunAt = null;
    this.lastLogMessage = 'Worker Compras.gov.br pausado pelo operador.';
    this.saveState();
    this.emitStatus();
    logService.addLog(LogType.SYNC, 'Worker Compras.gov.br pausado.');
  }

  setIntervalMinutes(minutes) {
    const val = Number(minutes);
    if (!val || val < 1) return;
    this.intervalMinutes = val;
    this.saveState();
    if (this.status === COMPRAS_GOV_WORKER_STATUS.ACTIVE) {
      this.start(val);
    } else {
      this.emitStatus();
    }
  }

  async triggerImmediateIngestion() {
    if (this.status === COMPRAS_GOV_WORKER_STATUS.INGESTING) {
      return { skipped: true, reason: 'Varredura Compras.gov.br já em andamento.' };
    }
    return await this.runIngestionCycle();
  }

  scheduleNextRun() {
    const nextDate = new Date(Date.now() + this.intervalMinutes * 60 * 1000);
    this.nextRunAt = nextDate.toISOString();
  }

  emitStatus() {
    EventBus.emit('vellia-comprasgov-worker-status-changed', this.getState());
  }

  async runIngestionCycle() {
    const startTime = performance.now();
    const previousStatus = this.status;
    this.status = COMPRAS_GOV_WORKER_STATUS.INGESTING;
    this.emitStatus();

    let rawRecords = [];
    let fetchSourceInfo = 'Compras.gov.br (Dados Abertos)';

    try {
      rawRecords = await ComprasGovLiveCollectorService.collectLiveOpportunities();
      fetchSourceInfo = `Compras.gov.br Live (${rawRecords.length} certames)`;

      const currentList = opportunityRepository.getAll();
      let newCount = 0;
      let updatedCount = 0;
      let relevantCount = 0;
      const newlyAddedTenders = [];

      for (const raw of rawRecords) {
        if (!raw) continue;

        try {
          const dto = ComprasGovAdapter.toDTO(raw);
          if (!dto) continue;

          const existing = currentList.find(e => 
            e.number === dto.externalId || 
            e.id === `CGOV-${dto.externalId}` ||
            (e.processNumber && dto.processNumber && e.processNumber === dto.processNumber)
          );

          if (existing) {
            // Atualiza prazos e valores caso tenham mudado
            if (dto.closingDate && dto.closingDate !== existing.endDate) {
              existing.endDate = dto.closingDate;
              opportunityRepository.update(existing.id, existing);
              updatedCount++;
            }
          } else {
            const newEntity = ComprasGovAdapter.toEntity(dto);
            const enriched = OpportunityService.enrichOpportunity(newEntity, 'Compras.gov.br (Worker Contínuo)');
            
            opportunityRepository.add(enriched);
            currentList.unshift(enriched);
            newCount++;
            newlyAddedTenders.push(enriched);

            const adherenceScore = enriched.score || enriched.adherenceScore || 0;
            if (adherenceScore >= 75 || enriched.priority === 'Crítica') {
              relevantCount++;
              
              AlertService.createAlert({
                type: AlertType.NEW_CRITICAL,
                level: adherenceScore >= 85 ? AlertLevel.CRITICAL : AlertLevel.HIGH,
                title: `🏛️ NOVO CERTAME COMPRAS.GOV (${adherenceScore}% ADERÊNCIA) — ${enriched.client}`,
                opportunityNumber: String(enriched.number || enriched.id),
                opportunityTitle: enriched.title || enriched.object,
                client: enriched.client,
                company: enriched.recommendedCompany || 'Veeluen Solutions / Excelência Ambiental',
                service: enriched.primaryService || 'Engenharia / Serviços Ambientais',
                adherence: adherenceScore,
                daysLeft: enriched.daysLeft || 14,
                message: `Capturado pelo Worker Compras.gov.br: "${enriched.object?.slice(0, 130)}...". Estimado: ${enriched.estimatedValue || 'Sob Consulta'}.`,
                portal: 'Compras.gov.br (Governo Federal)'
              });
            }
          }
        } catch (itemErr) {
          console.warn('[ComprasGovWorker] Erro ao processar oportunidade raw:', itemErr);
        }
      }

      const durationMs = Math.round(performance.now() - startTime);
      this.lastDurationMs = durationMs;
      this.lastRunAt = new Date().toISOString();
      this.totalRuns += 1;
      this.totalCaptured += rawRecords.length;
      this.totalNew += newCount;
      this.totalRelevant += relevantCount;
      this.status = previousStatus === COMPRAS_GOV_WORKER_STATUS.PAUSED ? COMPRAS_GOV_WORKER_STATUS.PAUSED : COMPRAS_GOV_WORKER_STATUS.ACTIVE;
      this.lastError = null;

      this.lastLogMessage = `Varredura Compras.gov.br concluída. Processados: ${rawRecords.length} | Novos: ${newCount} | Relevantes: ${relevantCount} (${durationMs}ms)`;

      const runRecord = {
        id: `RUN-CGOV-${Date.now()}`,
        timestamp: this.lastRunAt,
        durationMs,
        source: fetchSourceInfo,
        totalScanned: rawRecords.length,
        newCount,
        updatedCount,
        relevantCount,
        status: 'Sucesso'
      };

      this.history.unshift(runRecord);
      if (this.history.length > 20) this.history = this.history.slice(0, 20);

      this.scheduleNextRun();
      this.saveState();
      this.emitStatus();

      const nowFormatted = new Date().toLocaleString('pt-BR');
      sourceRepository.update('source-comprasgov', {
        status: 'Online',
        lastSync: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        lastSuccess: nowFormatted,
        capturedCount: (sourceRepository.getById('source-comprasgov')?.capturedCount || 0) + rawRecords.length,
        newCount: (sourceRepository.getById('source-comprasgov')?.newCount || 0) + newCount,
        relevantCount: (sourceRepository.getById('source-comprasgov')?.relevantCount || 0) + relevantCount,
        isActive: true
      });

      if (newCount > 0 || updatedCount > 0) {
        EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, {
          source: 'ComprasGovWorker',
          newCount,
          updatedCount,
          newOpportunities: newlyAddedTenders
        });
      }

      EventBus.emit(VELLIA_EVENTS.SYNC_COMPLETED, {
        source: 'ComprasGovWorker',
        timestamp: this.lastRunAt,
        runRecord
      });

      logService.addLog(LogType.INGESTION, this.lastLogMessage, runRecord);
      return runRecord;

    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      this.lastDurationMs = durationMs;
      this.status = COMPRAS_GOV_WORKER_STATUS.ERROR;
      this.lastError = err.message;
      this.lastLogMessage = `Erro na varredura Compras.gov.br: ${err.message}`;

      const errorRecord = {
        id: `RUN-CGOV-${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationMs,
        source: fetchSourceInfo,
        totalScanned: 0,
        newCount: 0,
        updatedCount: 0,
        relevantCount: 0,
        status: 'Falha',
        error: err.message
      };

      this.history.unshift(errorRecord);
      this.scheduleNextRun();
      this.saveState();
      this.emitStatus();

      logService.addLog(LogType.ERROR, `Falha no ciclo do Worker Compras.gov.br: ${err.message}`, { error: err.stack });
      return errorRecord;
    }
  }
}

export const comprasGovContinuousIngestionWorker = new ComprasGovContinuousIngestionWorker();
export default comprasGovContinuousIngestionWorker;
