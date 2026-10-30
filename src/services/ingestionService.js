/**
 * VELLIA LICITAÇÕES - INGESTION SERVICE (FASE 5)
 * Teste e simulação de ingestão de dados públicos do portal Petronect.
 * Executa deduplicação, análise semântica em lote, geração de métricas e relatório.
 */

import { opportunityRepository } from './opportunityRepository';
import { OpportunityService } from './opportunityService';
import { DeduplicationService } from './deduplicationService';
import { sourceRepository } from './sourceRepository';
import { logService, LogType } from './logService';

// Lote de teste estático desativado: o sistema opera 100% com editais reais sincronizados em tempo real
export const PETRONECT_TEST_BATCH = [];

export class IngestionService {
  /**
   * Executa o teste de ingestão simulada do Petronect
   */
  static runPetronectTest() {
    const rawBatch = PETRONECT_TEST_BATCH;
    const currentList = opportunityRepository.getAll();

    const report = {
      received: rawBatch.length,
      newCount: 0,
      updatedCount: 0,
      duplicateCount: 0,
      relevantCount: 0, // Score >= 70%
      highPriorityCount: 0, // Score >= 80%
      discardedCount: 0, // Score < 50%
      errorCount: 0,
      executionTimeMs: 0,
      timestamp: new Date().toISOString(),
      itemsReport: []
    };

    const startTime = performance.now();

    for (const raw of rawBatch) {
      try {
        const dupCheck = DeduplicationService.findDuplicate(raw, currentList);

        if (dupCheck.isDuplicate) {
          const merged = DeduplicationService.mergeOpportunity(dupCheck.existingItem, raw);
          opportunityRepository.update(dupCheck.existingItem.id, merged);
          report.duplicateCount++;
          report.updatedCount++;

          if (merged.score >= 80) report.highPriorityCount++;
          if (merged.score >= 70) report.relevantCount++;
          if (merged.score < 50) report.discardedCount++;

          report.itemsReport.push({
            number: merged.number,
            title: merged.title,
            score: merged.score,
            company: merged.recommendedCompany,
            classification: merged.score >= 90 ? 'Crítica' : merged.score >= 80 ? 'Alta' : merged.score >= 70 ? 'Média' : 'Baixa',
            status: 'Atualizado (Duplicado Detectado)'
          });
        } else {
          const enriched = OpportunityService.enrichOpportunity(raw, 'Petronect');
          opportunityRepository.add(enriched);
          currentList.unshift(enriched);
          report.newCount++;

          if (enriched.score >= 80) report.highPriorityCount++;
          if (enriched.score >= 70) report.relevantCount++;
          if (enriched.score < 50) report.discardedCount++;

          report.itemsReport.push({
            number: enriched.number,
            title: enriched.title,
            score: enriched.score,
            company: enriched.recommendedCompany,
            classification: enriched.priority,
            status: 'Novo Ingerido'
          });
        }
      } catch (err) {
        report.errorCount++;
        logService.addLog(LogType.ERROR, `Erro ao processar item do pacote de teste: ${err.message}`, { raw });
      }
    }

    report.executionTimeMs = Math.round(performance.now() - startTime);

    // Atualiza a fonte Petronect no SourceRepository
    const nowFormatted = new Date().toLocaleString('pt-BR');
    sourceRepository.update('source-petronect', {
      status: 'Ativo',
      lastSync: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      lastSuccess: nowFormatted,
      capturedCount: (sourceRepository.getById('source-petronect')?.capturedCount || 0) + report.received,
      newCount: (sourceRepository.getById('source-petronect')?.newCount || 0) + report.newCount,
      relevantCount: (sourceRepository.getById('source-petronect')?.relevantCount || 0) + report.relevantCount,
      errorCount: report.errorCount
    });

    logService.addLog(LogType.INGESTION, `Teste de ingestão Petronect finalizado: ${report.received} recebidos, ${report.newCount} novos, ${report.duplicateCount} duplicados.`, report);

    return report;
  }
}
