/**
 * VELLIA LICITAÇÕES — WORKER DE INGESTÃO CONTÍNUA DA PETRONECT / PETROBRAS
 * Conector Autônomo para Oportunidades Públicas do Portal Petronect
 * 
 * Funcionalidades:
 * - Varredura periódica e autônoma em background (sem travamento de UI)
 * - Ingestão direta via PetronectLiveCollectorService e PetronectConnector
 * - Enriquecimento semântico automático (Aderência Técnica Veeluen Soluções vs Excelência Ambiental)
 * - Deduplicação automática por hash e número de oportunidade
 * - Detecção automática de aditivos, prorrogações de prazos e alterações de valor
 * - Geração de Alertas Imediatos para certames de alta aderência (>= 75%) ou prioridade crítica
 * - Notificação em tempo real via EventBus para reatividade instantânea no Dashboard e Oportunidades
 * - Histórico completo de auditoria das execuções persistido no localStorage
 * - Controle operacional: Iniciar, Pausar, Forçar Execução Imediata e Alterar Frequência
 */

import { PetronectConnector } from './petronectConnector.js';
import { PetronectAdapter } from './petronectAdapter.js';
import { PetronectLiveCollectorService } from './petronectLiveCollectorService.js';
import { OpportunityChangeHistoryService } from './opportunityChangeHistory.js';
import { opportunityRepository } from '../opportunityRepository.js';
import { OpportunityService } from '../opportunityService.js';
import { sourceRepository } from '../sourceRepository.js';
import { AlertService, AlertType, AlertLevel } from '../agent/alertService.js';
import { logService, LogType } from '../logService.js';
import { EventBus, VELLIA_EVENTS } from '../eventBus.js';

export const PETRONECT_WORKER_STATUS = {
  ACTIVE: 'ACTIVE',
  INGESTING: 'INGESTING',
  PAUSED: 'PAUSED',
  ERROR: 'ERROR'
};

const STORAGE_KEY = 'vellia_petronect_ingestion_worker_v1';

class PetronectContinuousIngestionWorker {
  constructor() {
    this.timerId = null;
    this.status = PETRONECT_WORKER_STATUS.PAUSED;
    this.intervalMinutes = 10; // Padrão: 10 minutos
    this.lastRunAt = null;
    this.nextRunAt = null;
    this.lastDurationMs = 0;
    this.totalRuns = 0;
    this.totalCaptured = 0;
    this.totalNew = 0;
    this.totalRelevant = 0;
    this.history = [];
    this.lastError = null;
    this.lastLogMessage = 'Worker Petronect inicializado e pronto para operação contínua.';

    this.loadState();
  }

  /**
   * Carrega estado persistido do localStorage
   */
  loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          this.intervalMinutes = parsed.intervalMinutes || 10;
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
      console.warn('[PetronectWorker] Falha ao carregar estado persistido:', e);
    }
  }

  /**
   * Salva estado no localStorage
   */
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
      console.warn('[PetronectWorker] Falha ao salvar estado:', e);
    }
  }

  /**
   * Retorna snapshot do estado atual
   */
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

  /**
   * Inicia o worker com intervalo configurado
   */
  start(intervalMinutes = null) {
    if (intervalMinutes && intervalMinutes > 0) {
      this.intervalMinutes = intervalMinutes;
    }

    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.status = PETRONECT_WORKER_STATUS.ACTIVE;
    this.lastError = null;
    this.lastLogMessage = `Worker Petronect ATIVO. Varredura pública configurada a cada ${this.intervalMinutes} min.`;
    
    this.scheduleNextRun();
    this.emitStatus();

    // Executa a primeira varredura em background
    this.runIngestionCycle();

    // Configura o loop periódico
    const intervalMs = Math.max(this.intervalMinutes * 60 * 1000, 30000);
    this.timerId = setInterval(() => {
      this.runIngestionCycle();
    }, intervalMs);

    logService.addLog(LogType.SYNC, `Worker de Ingestão Petronect iniciado com frequência de ${this.intervalMinutes} min.`);
  }

  /**
   * Pausa o worker
   */
  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.status = PETRONECT_WORKER_STATUS.PAUSED;
    this.nextRunAt = null;
    this.lastLogMessage = 'Worker Petronect pausado pelo operador.';
    this.saveState();
    this.emitStatus();
    logService.addLog(LogType.SYNC, 'Worker Petronect pausado.');
  }

  /**
   * Altera a frequência de execução
   */
  setIntervalMinutes(minutes) {
    const val = Number(minutes);
    if (!val || val < 1) return;
    this.intervalMinutes = val;
    this.saveState();
    if (this.status === PETRONECT_WORKER_STATUS.ACTIVE) {
      this.start(val);
    } else {
      this.emitStatus();
    }
  }

  /**
   * Dispara a execução imediatamente a pedido do operador
   */
  async triggerImmediateIngestion() {
    if (this.status === PETRONECT_WORKER_STATUS.INGESTING) {
      return { skipped: true, reason: 'Varredura Petronect já em andamento.' };
    }
    return await this.runIngestionCycle();
  }

  /**
   * Calcula e armazena o próximo horário de execução
   */
  scheduleNextRun() {
    const nextDate = new Date(Date.now() + this.intervalMinutes * 60 * 1000);
    this.nextRunAt = nextDate.toISOString();
  }

  /**
   * Emite evento global de mudança de status
   */
  emitStatus() {
    EventBus.emit('vellia-petronect-worker-status-changed', this.getState());
  }

  /**
   * Ciclo principal de Ingestão da Petronect
   */
  async runIngestionCycle() {
    const startTime = performance.now();
    const previousStatus = this.status;
    this.status = PETRONECT_WORKER_STATUS.INGESTING;
    this.emitStatus();

    let rawRecords = [];
    let fetchSourceInfo = 'Área Pública Petronect / Petrobras';

    try {
      // 1. COLETA AO VIVO DA ÁREA PÚBLICA PETRONECT / GRUPO PETROBRAS
      rawRecords = await PetronectLiveCollectorService.collectLiveOpportunities();
      fetchSourceInfo = `Petronect Coletor ao Vivo (${rawRecords.length} certames)`;

      // 2. PROCESSAMENTO, ENRIQUECIMENTO E DEDUPLICAÇÃO
      const currentList = opportunityRepository.getAll();
      let newCount = 0;
      let updatedCount = 0;
      let relevantCount = 0;
      const newlyAddedTenders = [];

      for (const raw of rawRecords) {
        if (!raw) continue;

        try {
          const dto = PetronectAdapter.toDTO(raw);
          const existing = currentList.find(e => 
            e.number === dto.externalId || 
            e.id === `PETRO-${dto.externalId}` ||
            (e.url && dto.url && e.url === dto.url)
          );

          if (existing) {
            // Verifica alterações críticas (Data de encerramento, aditivos ou valor)
            let hasChanges = false;

            if (dto.closingDate && dto.closingDate !== existing.endDate && dto.closingDate !== 'não identificado') {
              OpportunityChangeHistoryService.recordChange({
                opportunityNumber: existing.number,
                field: 'Data de Encerramento',
                previousValue: existing.endDate,
                newValue: dto.closingDate,
                source: 'Petronect',
                observation: 'Prorrogação de prazo ou retificação capturada autonomamente pelo Worker Petronect.'
              });
              existing.endDate = dto.closingDate;
              hasChanges = true;
            }

            if (dto.estimatedValue && dto.estimatedValue !== existing.estimatedValue && dto.estimatedValue !== 'Sob consulta') {
              OpportunityChangeHistoryService.recordChange({
                opportunityNumber: existing.number,
                field: 'Valor Estimado',
                previousValue: existing.estimatedValue,
                newValue: dto.estimatedValue,
                source: 'Petronect',
                observation: 'Atualização do valor referencial.'
              });
              existing.estimatedValue = dto.estimatedValue;
              hasChanges = true;
            }

            if (hasChanges) {
              opportunityRepository.update(existing.id, existing);
              updatedCount++;
            }
          } else {
            // Nova oportunidade detectada
            const newEntity = PetronectAdapter.toEntity(dto);
            opportunityRepository.add(newEntity);
            currentList.unshift(newEntity);
            newCount++;
            newlyAddedTenders.push(newEntity);

            // Se tiver alta aderência técnica (>= 75%) ou for crítica, gera alerta urgente
            const adherenceScore = newEntity.score || newEntity.adherenceScore || 0;
            if (adherenceScore >= 75 || newEntity.priority === 'Crítica') {
              relevantCount++;
              
              AlertService.createAlert({
                type: AlertType.NEW_CRITICAL,
                level: adherenceScore >= 85 ? AlertLevel.CRITICAL : AlertLevel.HIGH,
                title: `🛢️ NOVO CERTAME PETRONECT (${adherenceScore}% ADERÊNCIA) — ${newEntity.client}`,
                opportunityNumber: String(newEntity.number || newEntity.id),
                opportunityTitle: newEntity.title || newEntity.object,
                client: newEntity.client,
                company: newEntity.recommendedCompany || 'Veeluen Solutions / Excelência Ambiental',
                service: newEntity.primaryService || 'Engenharia / Monitoramento Ambiental',
                adherence: adherenceScore,
                daysLeft: newEntity.daysLeft || 12,
                message: `Capturado autonomamente pelo Worker Petronect: "${newEntity.object?.slice(0, 130)}...". Estimado: ${newEntity.estimatedValue || 'Sob Consulta'}.`,
                portal: 'Petronect (Grupo Petrobras)'
              });
            }
          }
        } catch (itemErr) {
          console.warn('[PetronectWorker] Erro ao processar oportunidade raw:', itemErr);
        }
      }

      const durationMs = Math.round(performance.now() - startTime);
      this.lastDurationMs = durationMs;
      this.lastRunAt = new Date().toISOString();
      this.totalRuns += 1;
      this.totalCaptured += rawRecords.length;
      this.totalNew += newCount;
      this.totalRelevant += relevantCount;
      this.status = previousStatus === PETRONECT_WORKER_STATUS.PAUSED ? PETRONECT_WORKER_STATUS.PAUSED : PETRONECT_WORKER_STATUS.ACTIVE;
      this.lastError = null;

      this.lastLogMessage = `Varredura Petronect concluída. Processados: ${rawRecords.length} | Novos: ${newCount} | Relevantes: ${relevantCount} (${durationMs}ms)`;

      const runRecord = {
        id: `RUN-PETRO-${Date.now()}`,
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

      // Atualiza SourceRepository
      const nowFormatted = new Date().toLocaleString('pt-BR');
      sourceRepository.update('source-petronect', {
        status: 'Online',
        lastSync: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        lastSuccess: nowFormatted,
        capturedCount: (sourceRepository.getById('source-petronect')?.capturedCount || 0) + rawRecords.length,
        newCount: (sourceRepository.getById('source-petronect')?.newCount || 0) + newCount,
        relevantCount: (sourceRepository.getById('source-petronect')?.relevantCount || 0) + relevantCount
      });

      // Se houveram novidades, emite notificação reativa no EventBus
      if (newCount > 0 || updatedCount > 0) {
        EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, {
          source: 'PetronectWorker',
          newCount,
          updatedCount,
          newOpportunities: newlyAddedTenders
        });
      }

      EventBus.emit(VELLIA_EVENTS.SYNC_COMPLETED, {
        source: 'PetronectWorker',
        timestamp: this.lastRunAt,
        runRecord
      });

      logService.addLog(LogType.INGESTION, this.lastLogMessage, runRecord);
      return runRecord;

    } catch (err) {
      const durationMs = Math.round(performance.now() - startTime);
      this.lastDurationMs = durationMs;
      this.status = PETRONECT_WORKER_STATUS.ERROR;
      this.lastError = err.message;
      this.lastLogMessage = `Erro na varredura Petronect: ${err.message}`;

      const errorRecord = {
        id: `RUN-PETRO-${Date.now()}`,
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

      logService.addLog(LogType.ERROR, `Falha no ciclo do Worker Petronect: ${err.message}`, { error: err.stack });
      return errorRecord;
    }
  }
}

export const petronectContinuousIngestionWorker = new PetronectContinuousIngestionWorker();
export default petronectContinuousIngestionWorker;
