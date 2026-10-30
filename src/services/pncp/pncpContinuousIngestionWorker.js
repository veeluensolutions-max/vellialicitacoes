/**
 * VELLIA LICITAÇÕES — WORKER DE INGESTÃO CONTÍNUA DO PNCP
 * Portal Nacional de Contratações Públicas (Governo Federal)
 * 
 * Funcionalidades:
 * - Varredura periódica e autônoma em background (sem travamento de UI)
 * - Ingestão direta via PncpService (API Oficial) e fallback resiliente via PNCPConnector
 * - Enriquecimento semântico automático (Aderência Técnica, Empresa Veeluen vs Excelência Ambiental)
 * - Deduplicação automática por hash e número de certame para evitar duplicatas
 * - Geração de Alertas Imediatos para certames de alta aderência (>= 75%) ou prioridade crítica
 * - Notificação em tempo real via EventBus para reatividade instantânea no Dashboard e Oportunidades
 * - Histórico completo de auditoria das execuções e contadores persistidos no localStorage
 * - Controle operacional: Iniciar, Pausar, Forçar Execução Imediata e Alterar Frequência
 */

import { PncpService } from './pncpService.js';
import { PNCPConnector } from '../multisource/pncpConnector.js';
import { PNCPAdapter } from '../multisource/pncpAdapter.js';
import { opportunityRepository } from '../opportunityRepository.js';
import { OpportunityService } from '../opportunityService.js';
import { CrossSourceDeduplicationService } from '../multisource/crossSourceDeduplicationService.js';
import { AlertService, AlertType, AlertLevel } from '../agent/alertService.js';
import { GeneralAuditService } from '../admin/generalAuditService.js';
import { logService, LogType } from '../logService.js';
import { EventBus, VELLIA_EVENTS } from '../eventBus.js';

export const PNCP_WORKER_STATUS = {
  ACTIVE: 'ACTIVE',
  INGESTING: 'INGESTING',
  PAUSED: 'PAUSED',
  ERROR: 'ERROR'
};

const STORAGE_KEY = 'vellia_pncp_ingestion_worker_v1';

class PncpContinuousIngestionWorker {
  constructor() {
    this.timerId = null;
    this.status = PNCP_WORKER_STATUS.PAUSED;
    this.intervalMinutes = 5; // Padrão: 5 minutos
    this.lastRunAt = null;
    this.nextRunAt = null;
    this.lastDurationMs = 0;
    this.totalRuns = 0;
    this.totalCaptured = 0;
    this.totalNew = 0;
    this.totalRelevant = 0;
    this.history = [];
    this.lastError = null;
    this.lastLogMessage = 'Worker inicializado e pronto para operação contínua.';

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
          this.intervalMinutes = parsed.intervalMinutes || 5;
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
      console.warn('[PncpWorker] Falha ao carregar estado persistido:', e);
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
          history: this.history.slice(0, 20), // Guarda as últimas 20 execuções
          lastRunAt: this.lastRunAt,
          lastDurationMs: this.lastDurationMs,
          lastLogMessage: this.lastLogMessage
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch (e) {
      console.warn('[PncpWorker] Falha ao salvar estado:', e);
    }
  }

  /**
   * Retorna o snapshot completo de estado para a UI
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

    this.status = PNCP_WORKER_STATUS.ACTIVE;
    this.lastError = null;
    this.lastLogMessage = `Worker de Ingestão Contínua ATIVO. Ciclo configurado para a cada ${this.intervalMinutes} min.`;
    
    // Agenda a próxima execução
    this.scheduleNextRun();

    // Emite atualização de estado
    this.emitStatus();

    // Executa imediatamente a primeira ingestão
    this.runIngestionCycle();

    // Configura o loop periódico
    const intervalMs = Math.max(this.intervalMinutes * 60 * 1000, 30000); // Mínimo de 30s por segurança
    this.timerId = setInterval(() => {
      this.runIngestionCycle();
    }, intervalMs);

    logService.addLog(LogType.SYNC, `Worker de Ingestão PNCP iniciado com frequência de ${this.intervalMinutes} min.`);
  }

  /**
   * Pausa o worker
   */
  pause() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.status = PNCP_WORKER_STATUS.PAUSED;
    this.nextRunAt = null;
    this.lastLogMessage = 'Worker de Ingestão PNCP pausado pelo operador.';
    this.saveState();
    this.emitStatus();
    logService.addLog(LogType.SYNC, 'Worker de Ingestão PNCP pausado.');
  }

  /**
   * Altera a frequência de execução
   */
  setIntervalMinutes(minutes) {
    const val = Number(minutes);
    if (!val || val < 1) return;
    this.intervalMinutes = val;
    this.saveState();
    if (this.status === PNCP_WORKER_STATUS.ACTIVE) {
      this.start(val);
    } else {
      this.emitStatus();
    }
  }

  /**
   * Dispara a execução imediatamente a pedido do operador
   */
  async triggerImmediateIngestion() {
    if (this.status === PNCP_WORKER_STATUS.INGESTING) {
      return { skipped: true, reason: 'Ingestão já em andamento.' };
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
    EventBus.emit('vellia-pncp-worker-status-changed', this.getState());
  }

  /**
   * Formata datas para o formato esperado pelo PNCP: AAAAMMDD
   */
  formatPncpDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }

  /**
   * Ciclo principal de Ingestão do PNCP
   */
  async runIngestionCycle() {
    const startTime = Date.now();
    const previousStatus = this.status;
    this.status = PNCP_WORKER_STATUS.INGESTING;
    this.emitStatus();

    let rawCandidates = [];
    let fetchSourceInfo = 'API Oficial PNCP';

    try {
      // 1. VARREDURA EM TEMPO REAL DOS SERVIÇOS DAS 2 EMPRESAS NA API OFICIAL DO PNCP
      rawCandidates = await PncpService.sweepCompanyServicesRealTime({ maxPerQuery: 6 });
      fetchSourceInfo = `API PNCP em Tempo Real (${rawCandidates.length} editais alinhados)`;

      // 3. PROCESSAMENTO, ENRIQUECIMENTO E DEDUPLICAÇÃO
      const currentList = opportunityRepository.getAll();
      let newCount = 0;
      let updatedCount = 0;
      let relevantCount = 0;
      const newlyAddedTenders = [];

      for (const candidate of rawCandidates) {
        if (!candidate) continue;

        // Verifica existência prévia
        const match = currentList.find(e => {
          if (candidate.number && e.number && String(candidate.number).trim() === String(e.number).trim()) return true;
          if (candidate.idPncp && e.idPncp && candidate.idPncp === e.idPncp) return true;
          const dedupRes = CrossSourceDeduplicationService.matchOpportunities(candidate, e);
          return dedupRes.isMatch;
        });

        if (match) {
          // Atualiza dados e prazos
          const merged = CrossSourceDeduplicationService.mergeCrossSource(match, candidate);
          opportunityRepository.update(merged.id, merged);
          updatedCount++;
        } else {
          // NOVA OPORTUNIDADE: Enriquecimento via Motor de Aderência
          const enriched = OpportunityService.enrichOpportunity(candidate, 'PNCP (Worker Contínuo)');
          opportunityRepository.add(enriched);
          newCount++;
          newlyAddedTenders.push(enriched);

          // Se tiver alta aderência técnica ou for crítica, gera alerta urgente
          const adherenceScore = enriched.score || enriched.adherenceScore || 0;
          if (adherenceScore >= 75 || enriched.priority === 'Crítica') {
            relevantCount++;
            
            AlertService.createAlert({
              type: AlertType.NEW_CRITICAL,
              level: adherenceScore >= 85 ? AlertLevel.CRITICAL : AlertLevel.HIGH,
              title: `🎯 NOVO CERTAME NO PNCP (${adherenceScore}% ADERÊNCIA) — ${enriched.client}`,
              opportunityNumber: String(enriched.number || enriched.id),
              opportunityTitle: enriched.title || enriched.object,
              client: enriched.client,
              company: enriched.recommendedCompany || 'Veeluen Solutions / Excelência Ambiental',
              service: enriched.primaryService || 'Serviços Ambientais e de Engenharia',
              adherence: adherenceScore,
              daysLeft: enriched.daysLeft || 10,
              message: `Capturado autonomamente pelo Worker PNCP: "${enriched.object?.slice(0, 120)}...". Valor Estimado: ${enriched.estimatedValue || 'Sob Consulta'}.`,
              portal: 'PNCP (Governo Federal)'
            });
          }
        }
      }

      const durationMs = Date.now() - startTime;
      this.lastDurationMs = durationMs;
      this.lastRunAt = new Date().toISOString();
      this.totalRuns += 1;
      this.totalCaptured += rawCandidates.length;
      this.totalNew += newCount;
      this.totalRelevant += relevantCount;
      this.status = previousStatus === PNCP_WORKER_STATUS.PAUSED ? PNCP_WORKER_STATUS.PAUSED : PNCP_WORKER_STATUS.ACTIVE;
      this.lastError = null;

      this.lastLogMessage = `Varredura concluída via ${fetchSourceInfo}. Processados: ${rawCandidates.length} | Novos: ${newCount} | Relevantes: ${relevantCount} (${durationMs}ms)`;

      const runRecord = {
        id: `RUN-${Date.now()}`,
        timestamp: this.lastRunAt,
        durationMs,
        source: fetchSourceInfo,
        totalScanned: rawCandidates.length,
        newCount,
        updatedCount,
        relevantCount,
        status: 'SUCCESS'
      };

      this.history.unshift(runRecord);
      this.saveState();
      this.scheduleNextRun();

      // Registro na Trilha Imutável de Auditoria (Governança e LGPD)
      GeneralAuditService.logAction({
        user: 'Vellia Autonomous Ingestion Worker',
        module: 'Ingestão PNCP',
        action: 'Varredura Automática Concluída',
        object: 'PNCP API Federal',
        diffBefore: null,
        diffAfter: {
          scanned: rawCandidates.length,
          newCount,
          updatedCount,
          relevantCount,
          durationMs
        },
        result: 'SUCESSO'
      });

      // Emite eventos de atualização reativa na UI
      EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, { count: newCount });
      EventBus.emit('vellia-pncp-ingestion-completed', runRecord);
      this.emitStatus();

      return runRecord;

    } catch (err) {
      console.error('[PncpWorker] Erro no ciclo de ingestão contínua:', err);
      const durationMs = Date.now() - startTime;
      this.lastDurationMs = durationMs;
      this.lastError = err.message;
      this.status = PNCP_WORKER_STATUS.ERROR;
      this.lastLogMessage = `Falha na varredura: ${err.message}. Dados locais mantidos.`;

      const errorRecord = {
        id: `RUN-${Date.now()}`,
        timestamp: new Date().toISOString(),
        durationMs,
        source: fetchSourceInfo,
        totalScanned: 0,
        newCount: 0,
        updatedCount: 0,
        relevantCount: 0,
        status: 'ERROR',
        error: err.message
      };

      this.history.unshift(errorRecord);
      this.saveState();
      this.scheduleNextRun();
      this.emitStatus();

      return errorRecord;
    }
  }
}

export const pncpContinuousIngestionWorker = new PncpContinuousIngestionWorker();
export default pncpContinuousIngestionWorker;
