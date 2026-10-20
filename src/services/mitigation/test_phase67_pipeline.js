/**
 * VELLIA LICITAÇÕES — FASE 67
 * test_phase67_pipeline.js: Bateria Automatizada de Testes do Recovery Planner & Mitigação Prescritiva
 */

import { mitigationPlannerEngine } from './mitigationPlannerEngine.js';
import {
  OptionViability,
  PlanStatus,
  ActionStatus,
  MitigationEffectiveness
} from './mitigationModels.js';

let passedTests = 0;
let totalTests = 14;

console.log('================================================================');
console.log(' INICIANDO BATERIA DE TESTES — FASE 67: PRESCRIPTIVE MITIGATION ');
console.log('================================================================\n');

try {
  // Teste 1: Risco alto com blocker documental -> Mitigação válida gerada
  const plan1 = mitigationPlannerEngine.generateMitigationPlan({
    opportunityId: 'TEST-OPP-01',
    opportunityTitle: 'Pregão Teste Documentos',
    hoursToDeadline: 30,
    criticalBlockers: ['Certidão Negativa de Débitos Mobiliários']
  });
  const docOpt = plan1.options.find(o => o.title.includes('Tratamento Documental'));
  if (docOpt && docOpt.viability === OptionViability.VIABLE) {
    console.log('[PASS] Teste 1: Risco com blocker documental gerou mitigação válida');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 1: Falha ao gerar mitigação documental válida');
  }

  // Teste 2: Mitigação impossível devido a prazo curto (< 48h para CAT) -> Marcada como Unlikely
  const plan2 = mitigationPlannerEngine.generateMitigationPlan({
    opportunityId: 'TEST-OPP-02',
    opportunityTitle: 'Pregão Prazo Curto',
    hoursToDeadline: 8,
    criticalBlockers: ['Certidão de Acervo Técnico (CAT)']
  });
  const catOpt = plan2.options.find(o => o.title.includes('CAT') || o.description.includes('acervo'));
  if (catOpt && catOpt.viability === OptionViability.UNLIKELY) {
    console.log('[PASS] Teste 2: Mitigação com lead time inviável classificada categoricamente como Unlikely');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 2: Opção com prazo impossível não foi classificada como Unlikely');
  }

  // Teste 3: Mitigação de parceiro destrava pricing -> Dependência e unlocks atualizados
  const plan3 = mitigationPlannerEngine.generateMitigationPlan({
    opportunityId: 'TEST-OPP-03',
    hoursToDeadline: 20,
    partnerConfirmed: false
  });
  const partnerOpt = plan3.options.find(o => o.type.includes('Partner Action'));
  if (partnerOpt && partnerOpt.unlocks.includes('Pricing Gate') && partnerOpt.leverageCount >= 2) {
    console.log('[PASS] Teste 3: Mitigação de parceiro mapeia corretamente o destravamento do Pricing Gate');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 3: Dependência de pricing não foi mapeada na ação de parceiro');
  }

  // Teste 4: Mitigação cria conflito de capacidade em outro lugar -> Cross-impact exibido
  const plan4 = mitigationPlannerEngine.generateMitigationPlan({
    opportunityId: 'TEST-OPP-04',
    partnerConfirmed: false,
    capacityConflict: true
  });
  const crossOpt = plan4.options.find(o => o.crossImpact && o.crossImpact.hasImpact);
  if (crossOpt && crossOpt.crossImpact.details.includes('sobreposição')) {
    console.log('[PASS] Teste 4: Conflito de alocação externa mapeado com alerta transparente de Cross-Impact');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 4: Cross-impact não detectado para recurso com sobreposição');
  }

  // Teste 5: Custo desconhecido -> Nenhum valor inventado (null / source UNKNOWN)
  if (partnerOpt && partnerOpt.cost.amount === null && partnerOpt.cost.source.includes('Desconhecido')) {
    console.log('[PASS] Teste 5: Custo desconhecido preservado sem alucinação de números financeiros fictícios');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 5: Custo desconhecido foi preenchido indevidamente');
  }

  // Teste 6: Risco melhora após conclusão de ação -> Trajetória recalculada
  const actionRes = mitigationPlannerEngine.recordActionCompletion(
    plan1.id,
    plan1.chosenPlanSequence.now[0].id,
    'Engenheiro Coordenador'
  );
  if (actionRes.newRiskLevel.includes('Moderado') && actionRes.trajectory.includes('Melhorando')) {
    console.log('[PASS] Teste 6: Conclusão de ação recalculou risco e atualizou trajetória para Melhorando');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 6: Risco não recalculou após conclusão da ação');
  }

  // Teste 7: Contexto muda materialmente -> Plano versionado sem apagar histórico
  const v2Plan = mitigationPlannerEngine.versionPlanOnContextChange(plan1.id, 'Prazo editalício prorrogado em 24h');
  if (v2Plan.version === 2 && plan1.status.includes('Expired')) {
    console.log('[PASS] Teste 7: Mudança material gerou nova versão do plano preservando o histórico anterior');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 7: Versionamento de plano falhou ao atualizar contexto');
  }

  // Teste 8: Fallback existe mas NÃO é executado automaticamente sem confirmação humana
  let fallbackBlocked = false;
  try {
    mitigationPlannerEngine.triggerFallbackOption(plan1.id, 'ACT-FB-FAKE-01', null);
  } catch (err) {
    fallbackBlocked = err.message.includes('Guardrail Ativo');
  }
  if (fallbackBlocked) {
    console.log('[PASS] Teste 8: Acionamento autônomo de fallback bloqueado; exige decisão humana expressa');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 8: Fallback disparou sem autorização humana');
  }

  // Teste 9: Usuário sem permissão "mitigation.approve" -> Bloqueado de aprovar ação material
  let permissionBlocked = false;
  try {
    mitigationPlannerEngine.approveMaterialAction(plan1.id, 'ACT-01', {
      name: 'Operador Estagiário',
      role: 'OPERATOR',
      permissions: ['mitigation.view']
    });
  } catch (err) {
    permissionBlocked = err.message.includes('Acesso negado');
  }
  if (permissionBlocked) {
    console.log('[PASS] Teste 9: Usuário sem permissão bloqueado de aprovar ações materiais');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 9: Ação material foi aprovada por usuário sem permissão');
  }

  // Teste 10: Urgência alta -> Guardrails permanecem ativos
  const simUrgent = mitigationPlannerEngine.simulateMitigation(plan2, catOpt.id);
  if (simUrgent.projectedRiskLevel.includes('Crítico') && simUrgent.criticalPathImpact.includes('Inviável')) {
    console.log('[PASS] Teste 10: Urgência extrema não flexibiliza guardrails nem inventa viabilidade mágica');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 10: Guardrails de viabilidade foram relaxados sob urgência');
  }

  // Teste 11: Múltiplos riscos relacionados -> Consolidam em 1 plano integrado
  const planMulti = mitigationPlannerEngine.generateMitigationPlan({
    opportunityId: 'TEST-OPP-MULTI',
    criticalBlockers: ['Atestado Pendente'],
    pendingApprovalsCount: 2,
    partnerConfirmed: false
  });
  if (planMulti.options.length >= 3 && planMulti.chosenPlanSequence.now.length > 0) {
    console.log('[PASS] Teste 11: Riscos documentais, aprovações e parcerias consolidados em plano integrado único');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 11: Múltiplos riscos geraram planos dispersos ou incompletos');
  }

  // Teste 12: Causa raiz desconhecida -> Sem falsa certeza
  if (planMulti.rootCause.isConfirmed === false) {
    console.log('[PASS] Teste 12: Causa raiz inferida não rotulada falsamente como verdade absoluta');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 12: Causa raiz presumida foi marcada como definitiva sem evidência');
  }

  // Teste 13: Opção de retirada estratégica (Strategic Withdrawal) presente exigindo decisão humana
  const withdrawOpt = planMulti.options.find(o => o.type.includes('Withdrawal Review'));
  if (withdrawOpt && withdrawOpt.requiresApproval === true) {
    console.log('[PASS] Teste 13: Retirada estratégica oferecida como alternativa deliberada sujeita à diretoria');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 13: Opção de retirada estratégica ausente ou executável sem deliberação');
  }

  // Teste 14: Revisão pós-evento -> Efetividade registrada separadamente de Win/Loss
  const review = mitigationPlannerEngine.recordPostEventReview({
    planId: 'RMP-TEST',
    opportunityId: 'TEST-OPP-HIST',
    effectiveness: MitigationEffectiveness.EFFECTIVE,
    restoredReadiness: true,
    submissionSuccessful: true,
    winLossOutcome: 'LOST', // Perdeu na fase de lances, mas mitigação do processo foi 100% eficaz
    notes: 'A mitigação permitiu submissão perfeita antes do deadline, perda ocorreu por lance de terceiro.'
  });
  if (review.effectiveness.includes('Efetivo') && review.winLossOutcome === 'LOST') {
    console.log('[PASS] Teste 14: Efetividade de mitigação avaliada pelo processo e desacoplada do Win/Loss comercial');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 14: Efetividade atrelada erroneamente apenas ao resultado de vitória');
  }

} catch (err) {
  console.error('ERRO FATAL NA EXECUÇÃO DOS TESTES:', err);
}

console.log('\n================================================================');
console.log(` RESULTADO: ${passedTests} de ${totalTests} TESTES APROVADOS (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
