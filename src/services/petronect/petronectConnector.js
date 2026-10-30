/**
 * VELLIA LICITAÇÕES - PETRONECT CONNECTOR (100% DADOS REAIS)
 * Conector oficial para coleta de informações públicas da Petronect / Grupo Petrobras.
 * Sem dados fictícios ou sementes de simulação.
 */

import { PETRONECT_CONFIG, SourceHealthStatus } from './petronectConfig.js';
import { PetronectAdapter } from './petronectAdapter.js';
import { PetronectHealthCheck } from './petronectHealthCheck.js';
import { PetronectLiveCollectorService } from './petronectLiveCollectorService.js';
import { OpportunityChangeHistoryService } from './opportunityChangeHistory.js';
import { opportunityRepository } from '../opportunityRepository.js';
import { sourceRepository } from '../sourceRepository.js';
import { logService, LogType } from '../logService.js';

const EXECUTION_HISTORY_STORAGE_KEY = 'vellia_petronect_executions_v1';

// Zero dados fictícios — alimentado exclusivamente por busca em tempo real
export const PETRONECT_PUBLIC_FEED = [];

export class PetronectConnector {
  static getExecutionHistory() {
    try {
      const data = localStorage.getItem(EXECUTION_HISTORY_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Erro ao carregar histórico de execuções:', e);
    }
    return [];
  }

  static saveExecutionHistory(list) {
    try {
      localStorage.setItem(EXECUTION_HISTORY_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
    } catch (e) {
      console.warn('Erro ao salvar histórico de execuções:', e);
    }
  }

  /**
   * Executa a captura em tempo real (sem fallback fictício)
   */
  static async fetchPublicOpportunities() {
    const health = await PetronectHealthCheck.checkHealth();
    if (health.status === SourceHealthStatus.OFFLINE) {
      throw new Error(`Fonte Petronect indisponível: ${health.message}`);
    }

    await new Promise(r => setTimeout(r, PETRONECT_CONFIG.PETRONECT_RATE_LIMIT_MS));

    try {
      const records = await PetronectLiveCollectorService.collectLiveOpportunities();
      return Array.isArray(records) ? records : [];
    } catch (err) {
      logService.addLog(LogType.WARN, 'Aviso no coletor ao vivo Petronect.', { error: err.message });
      return [];
    }
  }

  static async executeControlledPreview(limit = 10) {
    const rawList = await this.fetchPublicOpportunities('INCREMENTAL');
    const sample = rawList.slice(0, limit);

    return sample.map(raw => {
      const dto = PetronectAdapter.toDTO(raw);
      const entity = PetronectAdapter.toEntity(dto);
      return {
        dto,
        entity,
        number: entity.number,
        object: entity.object,
        contractor: entity.client,
        closingDate: entity.endDate,
        daysLeft: entity.daysLeft,
        detectedService: entity.primaryService,
        recommendedCompany: entity.recommendedCompany,
        score: entity.score,
        priority: entity.priority
      };
    });
  }

  static async synchronize({ mode = 'INCREMENTAL' } = {}) {
    const startTime = performance.now();
    const startIso = new Date().toISOString();
    const executionId = `exec-${Date.now()}`;

    sourceRepository.update('source-petronect', { status: 'Sincronizando...' });

    const rawRecords = await this.fetchPublicOpportunities(mode);
    const existingList = opportunityRepository.getAll();

    const stats = {
      executionId,
      source: 'PETRONECT',
      startTime: startIso,
      endTime: null,
      durationMs: 0,
      requests: Math.ceil(rawRecords.length / PETRONECT_CONFIG.PETRONECT_PAGE_SIZE) || 1,
      recordsFound: rawRecords.length,
      recordsCreated: 0,
      recordsUpdated: 0,
      duplicatesUnchanged: 0,
      relevantFound: 0,
      highPriorityFound: 0,
      criticalFound: 0,
      errors: 0,
      status: 'Sucesso',
      mode,
      details: []
    };

    for (const raw of rawRecords) {
      try {
        const dto = PetronectAdapter.toDTO(raw);
        const existing = existingList.find(e => e.number === dto.externalId || e.id === `PETRO-${dto.externalId}`);

        if (existing) {
          let hasChanges = false;

          if (dto.closingDate && dto.closingDate !== existing.endDate && dto.closingDate !== 'não identificado') {
            OpportunityChangeHistoryService.recordChange({
              opportunityNumber: existing.number,
              field: 'Data de Encerramento',
              previousValue: existing.endDate,
              newValue: dto.closingDate,
              source: 'Petronect',
              observation: 'Alteração de prazo detectada durante a sincronização.'
            });
            hasChanges = true;
          }

          if (dto.estimatedValue && dto.estimatedValue !== existing.estimatedValue && dto.estimatedValue !== 'Sob consulta') {
            OpportunityChangeHistoryService.recordChange({
              opportunityNumber: existing.number,
              field: 'Valor Estimado',
              previousValue: existing.estimatedValue,
              newValue: dto.estimatedValue,
              source: 'Petronect',
              observation: 'Atualização do valor referencial da oportunidade.'
            });
            hasChanges = true;
          }

          if (hasChanges) {
            const updated = PetronectAdapter.toEntity(dto);
            opportunityRepository.update(existing.id, {
              ...updated,
              status: existing.status,
              decision: existing.decision,
              decisionReason: existing.decisionReason,
              responsiblePerson: existing.responsiblePerson
            });
            stats.recordsUpdated++;
          } else {
            stats.duplicatesUnchanged++;
          }
        } else {
          const newEntity = PetronectAdapter.toEntity(dto);
          opportunityRepository.add(newEntity);
          existingList.unshift(newEntity);
          stats.recordsCreated++;

          if (newEntity.score >= 90) stats.criticalFound++;
          if (newEntity.score >= 80) stats.highPriorityFound++;
          if (newEntity.score >= 70) stats.relevantFound++;
        }
      } catch (err) {
        stats.errors++;
        logService.addLog(LogType.ERROR, `Erro ao processar oportunidade ${raw.numero}: ${err.message}`, { raw });
      }
    }

    const duration = Math.round(performance.now() - startTime);
    stats.durationMs = duration;
    stats.endTime = new Date().toISOString();

    const historyList = this.getExecutionHistory();
    historyList.unshift(stats);
    this.saveExecutionHistory(historyList);

    const nowFormatted = new Date().toLocaleString('pt-BR');
    sourceRepository.update('source-petronect', {
      status: 'Online',
      lastSync: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      lastSuccess: nowFormatted,
      capturedCount: (sourceRepository.getById('source-petronect')?.capturedCount || 0) + stats.recordsFound,
      newCount: (sourceRepository.getById('source-petronect')?.newCount || 0) + stats.recordsCreated,
      relevantCount: (sourceRepository.getById('source-petronect')?.relevantCount || 0) + stats.relevantFound,
      errorCount: stats.errors
    });

    logService.addLog(LogType.INGESTION, `Sincronização Petronect (${mode}) concluída em ${duration}ms.`, stats);
    return stats;
  }
}
