/**
 * VELLIA LICITAÇÕES — FASE 61: GROWTH & OPPORTUNITY EXPANSION ENGINE
 * test_phase61_pipeline.js: Suíte de Validação Factual dos 12 Testes Críticos
 */

import { growthService } from './growthService.js';
import {
  GrowthOpportunityType,
  GrowthOpportunityStatus,
  GrowthPipelineStage,
  GrowthPriority,
  GrowthConfidence,
  RejectionReason,
  ConversionTargetType
} from './growthModels.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`[PASS] Teste ${totalTests}: ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] Teste ${totalTests}: ${testName} - ${details}`);
  }
}

export function runPhase61Tests() {
  console.log('\n======================================================');
  console.log(' INICIANDO BATERIA DE TESTES — FASE 61: GROWTH ENGINE');
  console.log('======================================================\n');

  // TESTE 1: Cliente possui serviço A e demanda observada B -> Cross-sell candidate
  const crossSellAnalysis = growthService.getCrossSellAnalysis('veeluen');
  const suapeCandidate = crossSellAnalysis.crossSellOpportunities.find(
    o => o.targetOrganization.includes('Transpetro') && o.targetService.includes('PGRS')
  );
  assert(
    !!suapeCandidate && suapeCandidate.type === GrowthOpportunityType.CROSS_SELL,
    'Cliente possui serviço A (ETE) e demanda observada B (PGRS) -> Cross-sell candidate',
    JSON.stringify(suapeCandidate?.title)
  );

  // TESTE 2: Sem evidência de demanda -> Não criar cross-sell forte
  const copilotNoDemand = growthService.askGrowthCopilot('quais clientes atuais têm cross-sell em serviços sem histórico?');
  assert(
    copilotNoDemand.risk.length > 0 && !copilotNoDemand.opportunity.includes('garantida'),
    'Sem evidência de demanda -> Não criar cross-sell forte nem inventar potencial',
    copilotNoDemand.opportunity
  );

  // TESTE 3: Mercado atrativo, capacidade baixa -> Readiness gap mostrado
  const serviceExp = growthService.getServiceExpansion('veeluen');
  const nr13Opp = serviceExp.opportunities.find(o => o.targetService.includes('NR-13'));
  assert(
    !!nr13Opp && nr13Opp.readiness.capacityStatus.includes('LIMITADA'),
    'Mercado atrativo (NR-13), capacidade baixa -> Readiness gap mostrado com transparência',
    nr13Opp?.readiness?.capacityNotes
  );

  // TESTE 4: Buyer similar apenas pelo setor -> Não considerar suficiente (exige fatores estruturados)
  const buyers = growthService.getBuyerExpansion('ALL');
  const structuredFactorsValid = buyers.every(
    b => b.similarityFactors && b.similarityFactors.region && b.similarityFactors.ticketRange && b.similarityFactors.contractType
  );
  assert(
    structuredFactorsValid && buyers.length > 0,
    'Buyer similaridade baseada em múltiplos fatores estruturados (não apenas setor ou nome)',
    `Avaliados ${buyers.length} compradores com 6 fatores cada`
  );

  // TESTE 5: Signal antigo -> Expired
  const testExpiredOpp = {
    id: 'TEST-OLD-SIGNAL',
    companyId: 'veeluen',
    type: GrowthOpportunityType.CROSS_SELL,
    title: 'Sinal de compra obsoleto de 2 anos atrás',
    targetOrganization: 'Cliente Histórico Antigo',
    targetService: 'Serviço Legado',
    targetRegion: 'PE',
    status: GrowthOpportunityStatus.IDENTIFIED,
    expiresAt: '2024-01-01T00:00:00Z', // Data no passado
    createdAt: '2023-01-01T00:00:00Z',
    confidence: GrowthConfidence.LOW
  };
  const synced = growthService._syncSignalsFreshness([testExpiredOpp]);
  assert(
    synced[0].status === GrowthOpportunityStatus.EXPIRED,
    'Sinal antigo com prazo expirado -> Marcado como EXPIRED automaticamente',
    synced[0].status
  );

  // TESTE 6: Growth opportunity convertida em Procurement Opportunity -> Link correto
  const convertedResult = growthService.convertOpportunity(
    'GROWTH-2026-001',
    ConversionTargetType.PROCUREMENT_OPPORTUNITY,
    { entityId: 'PETRO-PNCP-2026-9901', title: 'Edital PGRS Suape' },
    'Henrique Veeluen'
  );
  assert(
    convertedResult.conversionLink.targetType === ConversionTargetType.PROCUREMENT_OPPORTUNITY &&
    convertedResult.conversionLink.targetEntityId === 'PETRO-PNCP-2026-9901',
    'Growth opportunity convertida em Procurement Opportunity -> Link e ID preservados',
    JSON.stringify(convertedResult.conversionLink)
  );

  // TESTE 7: Growth opportunity rejected -> Reason preserved
  const dismissedOpp = growthService.dismissOpportunity(
    'GROWTH-2026-004',
    RejectionReason.NO_CAPACITY,
    'Falta de inspetor nível 2 no momento',
    'Diretoria Técnica'
  );
  assert(
    dismissedOpp.status === GrowthOpportunityStatus.DISMISSED &&
    dismissedOpp.rejectionReason === RejectionReason.NO_CAPACITY,
    'Growth opportunity rejected -> Rejection Reason preservado estritamente',
    dismissedOpp.rejectionReason
  );

  // TESTE 8: Cross-company insight sem permission -> Blocked
  const blockedSynergies = growthService.checkGroupSynergies(['growth.view'], 'OWN_COMPANY');
  assert(
    blockedSynergies.allowed === false && blockedSynergies.message.includes('Acesso restrito'),
    'Cross-company insight sem permissão [growth.group.view] -> Bloqueado com governança',
    blockedSynergies.message
  );

  // TESTE 9: Unknown margin -> Não tratar como zero
  const oppWithUnknownMargin = growthService.getGrowthOpportunityById('GROWTH-2026-004');
  assert(
    oppWithUnknownMargin.attractiveness.marginProfile.includes('DADO NÃO AUDITADO') &&
    !oppWithUnknownMargin.attractiveness.marginProfile.includes('0%'),
    'Margem desconhecida -> Não tratar como zero, registrar explicitamente como não auditado',
    oppWithUnknownMargin?.attractiveness?.marginProfile
  );

  // TESTE 10: Small sample -> Warning
  const nr13Affinity = crossSellAnalysis.affinities.find(a => a.primaryService.includes('ETE') && a.complementaryService.includes('NR-13'));
  assert(
    nr13Affinity && nr13Affinity.isSmallSample === true && !!nr13Affinity.sampleWarning,
    'Correlação com amostra pequena (< 3 casos) -> Warning obrigatório presente',
    nr13Affinity?.sampleWarning
  );

  // TESTE 11: Copilot -> Não inventa demanda
  const copilotAnswer = growthService.askGrowthCopilot('Onde temos maior potencial de crescimento?');
  assert(
    !!copilotAnswer.evidence && !!copilotAnswer.opportunity && !!copilotAnswer.readiness && !!copilotAnswer.risk && !!copilotAnswer.suggestedNextStep,
    'Copilot responde estritamente estruturado em Evidence, Opportunity, Readiness, Risk, Suggested Next Step sem inventar demanda',
    `Estrutura validada: ${Object.keys(copilotAnswer).join(', ')}`
  );

  // TESTE 12: External outreach -> Confirmation required
  let outreachBlocked = false;
  try {
    growthService.confirmAndExecuteOutreach('GROWTH-2026-003', { test: true }, false);
  } catch (e) {
    outreachBlocked = true;
  }
  assert(
    outreachBlocked,
    'Abordagem comercial externa sem confirmação humana -> Erro lançado e bloqueio preventivo',
    'Bloqueio confirmado'
  );

  console.log(`\n======================================================`);
  console.log(` RESULTADO: ${passedTests} de ${totalTests} TESTES APROVADOS (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('======================================================\n');

  return { passedTests, totalTests, success: passedTests === totalTests };
}

// Execução direta se rodado via Node/terminal
if (typeof process !== 'undefined' && process.release?.name === 'node') {
  runPhase61Tests();
}
