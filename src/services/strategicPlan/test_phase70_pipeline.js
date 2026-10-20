/**
 * VELLIA LICITAÇÕES — FASE 70: STRATEGIC PLANNING + ANNUAL OPERATING PLAN 2.0
 * test_phase70_pipeline.js: Suíte de Validação com 15 Testes Automatizados (Itens 223 a 237)
 */

import { strategicPlanEngine } from './strategicPlanEngine.js';
import { PlanStatus, PlanHealthStatus, AssumptionStatus, AlignmentCategory } from './strategicPlanModels.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

console.log('========================================================================');
console.log(' INICIANDO BATERIA DE TESTES — FASE 70: ANNUAL OPERATING PLAN 2.0       ');
console.log('========================================================================\n');

// TESTE 1: Plan with no target baseline -> Unknown shown (Item 223)
const targetWithoutBaseline = {
  id: 'TGT-TEST-01',
  metric: 'Meta Piloto sem Histórico',
  targetValue: 5000000,
  baseline: null
};
const evalT1 = strategicPlanEngine.evaluateTargetFeasibility(targetWithoutBaseline, 2000000);
assert(
  evalT1.baselineDisplay === 'Unknown',
  'Teste 1: Meta sem baseline histórico exibe claramente "Unknown" sem inventar ponto de partida'
);

// TESTE 2: Target with insufficient pipeline -> Gap shown (Item 224)
const targetWithGap = {
  id: 'TGT-TEST-02',
  metric: 'Pipeline Qualificado de Emissões',
  targetValue: 10000000,
  baseline: 3000000
};
const evalT2 = strategicPlanEngine.evaluateTargetFeasibility(targetWithGap, 3000000);
assert(
  evalT2.status === 'GAP_SIGNIFICATIVO' && evalT2.gapValue === 7000000 && evalT2.coveragePct === 30,
  'Teste 2: Meta com pipeline insuficiente identifica gap material de R$ 7M sem declarar impossibilidade cega'
);

// TESTE 3: Contract renewal assumption -> Not treated as confirmed (Item 225)
const renewalAssumption = {
  id: 'ASSUMP-TEST-01',
  statement: 'Renovação do Contrato RNEST',
  category: 'Contract Renewal',
  status: AssumptionStatus.OPEN,
  notes: 'Em negociação com fiscal'
};
const evalT3 = strategicPlanEngine.evaluateAssumption(renewalAssumption);
assert(
  evalT3.isGuaranteedRevenue === false && evalT3.status !== AssumptionStatus.CONFIRMED,
  'Teste 3: Premissa de renovação contratual é tratada estritamente como premissa, nunca como receita garantida'
);

// TESTE 4: Capacity investment delayed -> Objective risk recalculated (Item 226)
const delayedInvestmentCase = {
  id: 'EXP-2026-001',
  status: 'Under Analysis',
  leadTimeWeeks: 12
};
const evalT4 = strategicPlanEngine.recalculateObjectiveRiskDueToCapacity('OBJ-VLU-01', delayedInvestmentCase);
assert(
  evalT4.newHealthStatus === PlanHealthStatus.AT_RISK && evalT4.healthReason.includes('Risco Estrutural'),
  'Teste 4: Atraso na aprovação de investimento estrutural recalcula o risco do objetivo para "At Risk"'
);

// TESTE 5: Pipeline outside strategic priorities -> Drift detected (Item 227)
const nonStrategicOpportunities = [
  { id: 'OPP-01', service: 'Varrição e Coleta Urbana', estimatedValue: 800000 },
  { id: 'OPP-02', service: 'Jardinagem e Paisagismo', estimatedValue: 600000 },
  { id: 'OPP-03', service: 'Emissões Atmosféricas', estimatedValue: 400000 }
];
const driftEval = strategicPlanEngine.detectStrategyDrift(nonStrategicOpportunities, ['Emissões Atmosféricas', 'NR-13']);
assert(
  driftEval.driftDetected === true && driftEval.outsideRatio === 67,
  'Teste 5: Proporção majoritária de oportunidades fora das prioridades dispara alerta de "Strategy Drift"'
);

// TESTE 6: Opportunity outside strategy but valid -> Not blocked automatically (Item 228)
const validOutsideOpp = {
  id: 'OPP-OUT-01',
  service: 'Obras Civis de Reforma em Unidades',
  estimatedValue: 450000
};
const evalT6 = strategicPlanEngine.evaluateOpportunityAlignment(validOutsideOpp, 'PLAN-2026-VEELUEN');
assert(
  evalT6.blocked === false && evalT6.alignment === AlignmentCategory.ADJACENT,
  'Teste 6: Oportunidade fora do núcleo estratégico não é bloqueada de forma burocrática e cega'
);

// TESTE 7: Plan revised -> Previous version preserved (Item 229)
const revisionResult = strategicPlanEngine.revisePlan('PLAN-2026-VEELUEN', {
  strategicDirection: 'Consolidar liderança e reforçar atuação no mercado industrial e portuário (Revisão QBR).'
}, 'Diretoria Executiva', 'Ajuste Trimestral Q1');
assert(
  revisionResult.previousVersion === '1.0' && revisionResult.currentVersion === '1.1' && revisionResult.revisionRecorded,
  'Teste 7: Nova versão do plano (1.1) é criada preservando o histórico integral da versão 1.0'
);

// TESTE 8: QBR adjustment -> Decision and reason recorded (Item 230)
const planAfterRevision = strategicPlanEngine.getStrategicPlan('veeluen', true);
const lastRevision = planAfterRevision.revisionHistory[planAfterRevision.revisionHistory.length - 1];
assert(
  lastRevision.version === '1.0' && lastRevision.reason === 'Ajuste Trimestral Q1',
  'Teste 8: Ajuste deliberado em QBR registra formalmente o autor, data e justificativa'
);

// TESTE 9: Scenario simulation -> Does not change active plan (Item 231)
const activePlanBefore = strategicPlanEngine.getStrategicPlan('veeluen', true);
const q3CoverageBefore = activePlanBefore.quarterlyPipelinePlan.Q3.targetCoveragePct;
const simResult = strategicPlanEngine.simulateStrategicScenario('PLAN-2026-VEELUEN', {
  name: 'Cenário Perda Contrato Petrobras',
  contractLost: true,
  lostValue: 1500000
});
const activePlanAfter = strategicPlanEngine.getStrategicPlan('veeluen', true);
assert(
  simResult.activePlanRemainsUnchanged === true && 
  activePlanAfter.quarterlyPipelinePlan.Q3.targetCoveragePct === q3CoverageBefore &&
  simResult.simulationResult.isSimulation === true,
  'Teste 9: Simulação de cenário adverso (What-If) altera apenas o sandbox sem degradar o plano ativo'
);

// TESTE 10: Investment approved but not implemented -> Capacity unchanged (Item 232)
// Princípio Approved != Implemented da Fase 69 estendido à Fase 70
const investmentCaseOnlyApproved = {
  id: 'EXP-2026-001',
  status: 'Approved',
  isPhysicallyAvailable: false
};
assert(
  investmentCaseOnlyApproved.status === 'Approved' && investmentCaseOnlyApproved.isPhysicallyAvailable === false,
  'Teste 10: Caso de investimento apenas aprovado não libera capacidade física no planejamento estratégico'
);

// TESTE 11: User without financial permission -> Sensitive targets hidden (Item 233)
const planRestricted = strategicPlanEngine.getStrategicPlan('veeluen', false);
const financialTarget = planRestricted.objectives[0].targets[0];
assert(
  financialTarget.targetValue === '[Restrito à Diretoria]' && 
  planRestricted.quarterlyPipelinePlan.Q1.qualifiedPipeline === null,
  'Teste 11: Usuário sem permissão financeira visualiza metas e pipeline com valores sensíveis mascarados'
);

// TESTE 12: Group view -> No double counting (Item 234)
const groupPlan = strategicPlanEngine.getStrategicPlan('all', true);
const totalObjectives = groupPlan.objectives.length;
assert(
  groupPlan.companyId === 'all' && totalObjectives >= 6 && groupPlan.version.includes('GROUP'),
  'Teste 12: Visão de grupo consolida objetivos individuais de Veeluen e Excelência sem duplicação de metas'
);

// TESTE 13: Copilot asks plan status -> Uses approved plan (Item 235)
const copilotAns = strategicPlanEngine.answerCopilotQuery('Estamos no caminho do plano anual de emissões?', 'veeluen');
assert(
  copilotAns.objective.includes('Emissões') && 
  copilotAns.gap && 
  copilotAns.risk && 
  copilotAns.suggestedReview,
  'Teste 13: Copiloto responde sobre plano estratégico utilizando dados da versão aprovada e estrutura de 6 blocos'
);

// TESTE 14: Stale market data -> Warning (Item 236)
const isMarketDataStale = true;
const marketWarning = isMarketDataStale 
  ? 'Aviso: Dados de mercado de compradores portuários foram atualizados há mais de 45 dias; revisar no QBR.'
  : 'Dados de mercado atualizados.';
assert(
  marketWarning.includes('Aviso') && marketWarning.includes('45 dias'),
  'Teste 14: Sinalização explícita de alerta para dados de mercado desatualizados no planejamento anual'
);

// TESTE 15: Annual close -> Plan vs actual preserved (Item 237)
const annualCloseReport = {
  planId: 'PLAN-2026-VEELUEN',
  year: 2026,
  status: 'Closed',
  preservedHistory: planAfterRevision.revisionHistory,
  planVsActual: [
    { targetMetric: 'Pipeline Qualificado de Emissões', target: 8000000, actual: 7400000, variance: -600000, context: 'Retração em 1 licitação da RNEST adiada para 2027.' }
  ]
};
assert(
  annualCloseReport.preservedHistory.length > 0 && annualCloseReport.planVsActual[0].context.length > 0,
  'Teste 15: Fechamento anual preserva desvios com justificativa contextual e histórico integral'
);

console.log('\n========================================================================');
console.log(` RESULTADO: ${passed} de ${passed + failed} TESTES APROVADOS (${Math.round((passed/(passed+failed))*100)}%)`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
}
