/**
 * VELLIA LICITAÇÕES — FASE 65: TESTES AUTOMATIZADOS DO PIPELINE
 * test_phase65_pipeline.js: Validação Completa dos 15 Cenários de Outcome Intelligence
 */

import { outcomeIntelligenceService } from './outcomeIntelligenceService.js';
import { OutcomeResultType, PatternStatus, ContractExecutionOutcome } from './outcomeModels.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failed++;
  }
}

console.log('======================================================');
console.log(' INICIANDO BATERIA DE TESTES — FASE 65: OUTCOME INTEL ');
console.log('======================================================\n');

async function runTests() {
  // TESTE 1: Won/Lost calculation -> Cancelled excluded correctly
  const fullMetrics = outcomeIntelligenceService.calculateOutcomeMetrics();
  // No dataset, há 12 records: 4 Won, 4 Lost, 1 Disqualified, 1 Cancelled, 2 No Submission.
  // Denominador competitivo = 4 + 4 + 1 = 9. Cancelled (1) e No Submission (2) NÃO entram no denominador do Win Rate!
  const expectedCompetitiveDenominator = fullMetrics.outcomes.won + fullMetrics.outcomes.lost + fullMetrics.outcomes.disqualified;
  assert(
    fullMetrics.rates.competitiveDenominator === expectedCompetitiveDenominator &&
    fullMetrics.outcomes.cancelled === 1 &&
    fullMetrics.rates.winRatePct === Math.round((fullMetrics.outcomes.won / expectedCompetitiveDenominator) * 100),
    'Teste 1: Cálculo de Won/Lost exclui Cancelled do denominador competitivo corretamente',
    `Denominador: ${fullMetrics.rates.competitiveDenominator}, Canceladas: ${fullMetrics.outcomes.cancelled}`
  );

  // TESTE 2: Small sample -> Warning gerado
  const smallSampleMetrics = outcomeIntelligenceService.calculateOutcomeMetrics({
    serviceCategory: 'Inventários e Modelagem', // Apenas 1 registro no dataset
    minSampleThreshold: 5
  });
  assert(
    smallSampleMetrics.isSmallSample === true &&
    smallSampleMetrics.smallSampleWarning.includes('Low confidence due to limited sample'),
    'Teste 2: Pequena amostra gera warning explícito (Low confidence due to limited sample)',
    smallSampleMetrics.smallSampleWarning
  );

  // TESTE 3: Missing price -> Coverage displayed
  assert(
    fullMetrics.dataQuality.priceDataCoveragePct > 0 &&
    fullMetrics.dataQuality.status !== null,
    'Teste 3: Cobertura de dados de preço mensurada e status de cobertura exibido',
    `Cobertura: ${fullMetrics.dataQuality.priceDataCoveragePct}% (${fullMetrics.dataQuality.status})`
  );

  // TESTE 4: Readiness lead time comparison -> Correct
  const timingAnalysis = outcomeIntelligenceService.getTimingAndReadinessAnalysis();
  assert(
    timingAnalysis.winsMedianLeadTimeHours > timingAnalysis.lossesMedianLeadTimeHours &&
    timingAnalysis.analyticalStatement.includes('aparece associada a melhores resultados') &&
    !timingAnalysis.analyticalStatement.includes('causou a vitória'),
    'Teste 4: Comparação de Readiness Lead Time aponta associação sem alegar causalidade',
    `Wins: ${timingAnalysis.winsMedianLeadTimeHours}h vs Losses: ${timingAnalysis.lossesMedianLeadTimeHours}h`
  );

  // TESTE 5: Lost with no official reason -> No invented cause
  const lostRecords = outcomeIntelligenceService.getOutcomeRecords().filter(r => r.resultType === OutcomeResultType.LOST);
  const withoutOfficial = lostRecords.find(r => r.lossDetails?.hasOfficialReason === false);
  assert(
    withoutOfficial && withoutOfficial.lossDetails.category.includes('Inferido'),
    'Teste 5: Perda sem motivo oficial não inventa causa definitiva e é rotulada como inferida',
    withoutOfficial?.lossDetails?.reasonText
  );

  // TESTE 6: Partner vs Solo -> Sample visible
  const partnerComparison = outcomeIntelligenceService.getPartnerStructureComparison();
  const soloItem = partnerComparison.find(p => p.structure.includes('Solo'));
  const consortiumItem = partnerComparison.find(p => p.structure.includes('Consórcio'));
  assert(
    soloItem && consortiumItem && soloItem.sampleSize > 0 && consortiumItem.sampleSize > 0,
    'Teste 6: Comparação Partner vs Solo exibe o tamanho da amostra (sample size) para cada modalidade',
    `Solo sample: ${soloItem?.sampleSize}, Consórcio sample: ${consortiumItem?.sampleSize}`
  );

  // TESTE 7: Group view -> No duplicates
  const groupMetrics = outcomeIntelligenceService.getGroupConsolidatedMetrics(['outcomes.group.view', 'outcomes.financial.view']);
  assert(
    groupMetrics.companyScope === 'GRUPO_VELLIA_CONSOLIDADO' &&
    groupMetrics.uniqueOpportunitiesCount > 0 &&
    groupMetrics.deduplicatedCount === 0,
    'Teste 7: Visão do Grupo consolida métricas de forma unificada sem somar certames duplicados',
    `Unicidade: ${groupMetrics.uniqueOpportunitiesCount} certames`
  );

  // TESTE 8: User without financial permission -> Margin hidden
  const nonFinancialMetrics = outcomeIntelligenceService.calculateOutcomeMetrics({}, ['outcomes.analytics.view']);
  const nonFinancialPartnerComp = outcomeIntelligenceService.getPartnerStructureComparison({}, ['outcomes.analytics.view']);
  assert(
    nonFinancialMetrics.privacy.isMarginHidden === true &&
    nonFinancialPartnerComp[0].observedAvgMarginPct === null,
    'Teste 8: Usuário sem permissão financeira tem margens e dados comerciais sensíveis ocultados',
    `Margin hidden: ${nonFinancialMetrics.privacy.isMarginHidden}`
  );

  // TESTE 9: Cancelled opportunity -> Not counted as loss
  const cancelledRecord = outcomeIntelligenceService.getOutcomeRecords().find(r => r.resultType === OutcomeResultType.CANCELLED);
  assert(
    cancelledRecord && cancelledRecord.resultType !== OutcomeResultType.LOST && fullMetrics.outcomes.cancelled === 1,
    'Teste 9: Oportunidade revogada/anulada categorizada como CANCELLED e não como LOSS'
  );

  // TESTE 10: No Submission after GO -> Correct category
  const noSubRecords = outcomeIntelligenceService.getOutcomeRecords().filter(r => r.resultType === OutcomeResultType.NO_SUBMISSION);
  const noSubAnalysis = outcomeIntelligenceService.getNoSubmissionBreakdown();
  assert(
    noSubRecords.length === 2 &&
    noSubAnalysis.totalNoSubmissionCount === 2 &&
    noSubAnalysis.breakdown.some(b => b.reason.includes('Gargalo Documental')),
    'Teste 10: Oportunidades com GO não submetidas categorizadas em NO_SUBMISSION com motivos estruturados',
    `Motivos: ${noSubAnalysis.breakdown.map(b => b.reason).join(', ')}`
  );

  // TESTE 11: Historical pattern from old process -> Marked stale/deprecated
  const patterns = outcomeIntelligenceService.getPatterns();
  const legacyPattern = patterns.find(p => p.id === 'PAT-004');
  assert(
    legacyPattern && legacyPattern.status === PatternStatus.DEPRECATED && legacyPattern.validationNotes.includes('DEPRECATED'),
    'Teste 11: Padrão histórico de processo antigo superado é marcado como DEPRECATED (Pattern Decay)',
    legacyPattern?.status
  );

  // TESTE 12: Copilot asks "why are we losing?" -> Presents patterns, not causal certainty
  const copilotAnswer = outcomeIntelligenceService.answerCopilotQuery('por que estamos perdendo mais');
  assert(
    copilotAnswer.sample.includes('Amostra') &&
    copilotAnswer.period.includes('Período') &&
    copilotAnswer.limitations.includes('não indica causalidade') &&
    copilotAnswer.evidence.length > 10,
    'Teste 12: Copilot responde estruturado em Sample, Period, Evidence e Limitations sem certeza causal',
    copilotAnswer.limitations
  );

  // TESTE 13: Missing loss reason widespread -> Data quality insight
  assert(
    fullMetrics.dataQuality.missingReasonRatePct > 0 &&
    fullMetrics.dataQuality.missingReasonInsight !== null,
    'Teste 13: Ausência massiva de reason code oficial gera insight de melhoria de qualidade de dados',
    fullMetrics.dataQuality.missingReasonInsight
  );

  // TESTE 14: Win but contract underperformed -> Bid and contract outcomes separated
  const winErosionRecord = outcomeIntelligenceService.getOutcomeRecords().find(r => r.contractOutcome?.status === ContractExecutionOutcome.MARGIN_EROSION);
  assert(
    winErosionRecord &&
    winErosionRecord.resultType === OutcomeResultType.WON &&
    winErosionRecord.contractOutcome.status === ContractExecutionOutcome.MARGIN_EROSION &&
    winErosionRecord.contractOutcome.realizedMarginPct < winErosionRecord.pricing.ourMarginPct,
    'Teste 14: Vitória com deterioração separa Bid Outcome (WON) de Contract Outcome (MARGIN_EROSION)',
    `Orçado: ${winErosionRecord?.pricing?.ourMarginPct}% vs Realizado: ${winErosionRecord?.contractOutcome?.realizedMarginPct}%`
  );

  // TESTE 15: Comparable cases -> Only pre-decision variables used
  const sampleOpp = {
    serviceCategory: 'Emissões Atmosféricas',
    valueRange: '> 1M',
    region: 'Pernambuco'
  };
  const comparables = outcomeIntelligenceService.getHistoricalComparables(sampleOpp);
  assert(
    comparables.label === 'Historical Comparables' &&
    comparables.sampleSize > 0 &&
    comparables.similarityFactors.includes('Serviço / Escopo') &&
    !comparables.similarityFactors.includes('Winning Price Delta'), // Pre-decision only!
    'Teste 15: Casos comparáveis utilizam estritamente variáveis pré-decisão, evitando future leakage',
    `Comparáveis encontrados: ${comparables.sampleSize}`
  );

  console.log('\n======================================================');
  console.log(` RESULTADO: ${passed} de 15 TESTES APROVADOS (${Math.round((passed / 15) * 100)}%)`);
  console.log('======================================================\n');
}

runTests();
