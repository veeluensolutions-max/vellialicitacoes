/**
 * VELLIA LICITAÇÕES — FASE 69
 * test_phase69_pipeline.js: Bateria Automatizada de Testes do Capability Investment Planner
 */

import { capabilityInvestmentEngine } from './capabilityInvestmentEngine.js';
import {
  InvestmentCaseStatus,
  ExpansionOptionType,
  CostSourceType,
  RootConstraintType
} from './capabilityInvestmentModels.js';

let passedTests = 0;
let totalTests = 16;

console.log('========================================================================');
console.log(' INICIANDO BATERIA DE TESTES — FASE 69: CAPABILITY EXPANSION PLANNER    ');
console.log('========================================================================\n');

try {
  // Teste 1: Gargalo isolado único -> Não gera recomendação de investimento estrutural
  const sigIso = capabilityInvestmentEngine.evaluateInvestmentSignal('SIG-2026-03');
  if (!sigIso.isInvestmentWarranted && sigIso.status === 'MONITOR_ONLY') {
    console.log('[PASS] Teste 1: Gargalo isolado único não gera recomendação cega de investimento estrutural');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 1: Incidente isolado gerou recomendação indevida de investimento');
  }

  // Teste 2: Gargalo recorrente com demanda comprovada -> Caso de investimento sugerido
  const sigRec = capabilityInvestmentEngine.evaluateInvestmentSignal('SIG-2026-01');
  if (sigRec.isInvestmentWarranted && sigRec.status === 'INVESTMENT_CASE_RECOMMENDED') {
    console.log('[PASS] Teste 2: Gargalo recorrente com histórico e volume abre recomendação de caso estruturado');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 2: Falha ao recomendar caso para gargalo recorrente comprovado');
  }

  // Teste 3: Demanda baixa / incerta -> Risco de subutilização apontado nas opções de compra
  const case1 = capabilityInvestmentEngine.cases[0];
  const buyOpt = case1.options.find(o => o.type === ExpansionOptionType.BUY);
  if (buyOpt && buyOpt.risks.includes('subutilização')) {
    console.log('[PASS] Teste 3: Risco de ociosidade e subutilização explicitado na opção de aquisição própria');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 3: Risco de subutilização não documentado');
  }

  // Teste 4: Custo desconhecido -> Nenhum ROI/payback calculado ficticiamente
  const fakeUnknownOpt = {
    estimatedCost: { upfront: null, source: CostSourceType.UNKNOWN },
    type: ExpansionOptionType.BUY
  };
  const fakeRentOpt = {
    estimatedCost: { variablePerUse: 15000, source: CostSourceType.QUOTATION },
    type: ExpansionOptionType.RENT
  };
  const beUnknown = capabilityInvestmentEngine.calculateBreakEven(fakeUnknownOpt, fakeRentOpt);
  if (!beUnknown.isCalculable && beUnknown.reason.includes('não suficientemente conhecidos')) {
    console.log('[PASS] Teste 4: Custos desconhecidos impedem cálculo matemático fictício de Payback/ROI');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 4: Sistema inventou cálculo de retorno sobre custo desconhecido');
  }

  // Teste 5: Buy vs Rent com custos válidos -> Break-even calculado corretamente
  const realRentOpt = case1.options.find(o => o.type === ExpansionOptionType.RENT);
  const beReal = capabilityInvestmentEngine.calculateBreakEven(buyOpt, realRentOpt);
  if (beReal.isCalculable && beReal.breakEvenUses === 11) {
    console.log('[PASS] Teste 5: Ponto de equilíbrio (break-even: 11 usos) calculado com rigor sobre custos conhecidos');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 5: Erro no cálculo de break-even de aquisição vs locação');
  }

  // Teste 6: Valores de pipeline afetado -> Não chamados de "receita perdida"
  const sigEvidence = capabilityInvestmentEngine.signals[0];
  if (sigEvidence.pipelineValueAffected > 0 && !JSON.stringify(sigEvidence).includes('receitaPerdida')) {
    console.log('[PASS] Teste 6: Métrica expressa corretamente como Pipeline Value Affected (sem falsa certeza de receita)');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 6: Pipeline afetado tratado indevidamente como perda financeira garantida');
  }

  // Teste 7: Equipamento atual subutilizado (<40%) -> Problema de agendamento/processo detectado antes de compra
  const sigUnderutil = capabilityInvestmentEngine.evaluateInvestmentSignal('SIG-2026-04');
  if (!sigUnderutil.isInvestmentWarranted && sigUnderutil.rootConstraint === RootConstraintType.SCHEDULING_ISSUE) {
    console.log('[PASS] Teste 7: Ativo com baixa ocupação (28%) diagnosticado como gargalo de agendamento antes de comprar');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 7: Equipamento subutilizado gerou recomendação de compra indevida');
  }

  // Teste 8: Opção de parceiro -> Trade-off de dependência e margem claramente exibido
  const partnerOpt = case1.options.find(o => o.type === ExpansionOptionType.PARTNER);
  if (partnerOpt && partnerOpt.tradeOffNotes.includes('rentabilidade') && partnerOpt.risks.includes('dependência')) {
    console.log('[PASS] Teste 8: Alternativa de parceiro documenta perda de margem e dependência operacional');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 8: Trade-off da opção de parceria não foi demonstrado');
  }

  // Teste 9: Investimento aprovado formalmente -> Capacidade na Fase 68 NÃO é alterada até confirmação física
  const approvalRes = capabilityInvestmentEngine.approveInvestmentCase('CASE-2026-001', {
    name: 'Diretor Financeiro',
    role: 'ADMIN',
    permissions: ['capability_investment.approve']
  });
  if (approvalRes.status === InvestmentCaseStatus.APPROVED && approvalRes.capacityUpdated === false) {
    console.log('[PASS] Teste 9: Aprovação formal não atualiza capacidade da Fase 68 de imediato (Approved != Implemented)');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 9: Capacidade operacional foi liberada antes da implementação física do ativo');
  }

  // Teste 10: Treinamento/ativo concluído -> Capacidade atualizada após evidência
  const implRes = capabilityInvestmentEngine.confirmImplementation('CASE-2026-001', 'Espectrômetro recebido e certificado RBC atestado');
  if (implRes.status === InvestmentCaseStatus.IMPLEMENTED && implRes.capacityAvailable === true) {
    console.log('[PASS] Teste 10: Capacidade formalmente liberada após comprovação física e documental de implementação');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 10: Implementação de capacidade concluída falhou ao registrar disponibilidade');
  }

  // Teste 11: Premissa falha no pós-investimento -> Preservada na revisão histórica auditável
  const postRev = capabilityInvestmentEngine.recordPostInvestmentReview({
    caseId: 'CASE-2026-001',
    reviewPeriod: '3 Meses',
    capacityImpact: 'Ativo operando em 1 frente',
    utilizationObservedPct: 35, // Abaixo dos 80% projetados
    assumptionsValidated: false,
    notes: 'Volume de certames no trimestre foi inferior ao projetado. Premissa de 11 usos anualizados postergada.'
  });
  if (postRev.assumptionsValidated === false && postRev.utilizationObservedPct === 35) {
    console.log('[PASS] Teste 11: Desvio de premissa no pós-investimento registrado transparentemente para aprendizado');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 11: Falha ao registrar revisão pós-investimento com desvio de premissas');
  }

  // Teste 12: Ativo interempresas sem governança expressa -> Bloqueado de compartilhamento automático
  const crossComp = capabilityInvestmentEngine.validateCrossCompanyAsset('CASE-2026-001', 'excelencia', ['capability_investment.view']);
  if (!crossComp.allowed && crossComp.reason.includes('Acesso negado')) {
    console.log('[PASS] Teste 12: Ativo adquirido por uma empresa bloqueado de compartilhamento contábil com outro CNPJ');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 12: Ativo interempresas foi compartilhado sem governança autorizada');
  }

  // Teste 13: Usuário sem permissão financeira -> Custos e break-even permanecem ocultos
  const compNoFin = capabilityInvestmentEngine.compareExpansionOptions('CASE-2026-001', false);
  const buyOptNoFin = compNoFin.options.find(o => o.type === ExpansionOptionType.BUY);
  if (buyOptNoFin.estimatedCost.upfront === null && buyOptNoFin.breakEvenUses === null) {
    console.log('[PASS] Teste 13: Usuário sem permissão financeira recebe dados de custos e break-even ocultados');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 13: Custos financeiros vazaram para usuário não autorizado');
  }

  // Teste 14: Copilot consulta buy vs rent com dados analisados -> Declara limitação e premissas
  const copilotAnswer = capabilityInvestmentEngine.answerCopilotQuery('Vale mais comprar ou locar o equipamento FTIR?');
  if (copilotAnswer.text.includes('ponto de equilíbrio') && copilotAnswer.dataGaps.includes('confirmar')) {
    console.log('[PASS] Teste 14: Copilot explica premissas econômicas e declara lacunas sem inventar certezas');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 14: Resposta do Copilot omitiu lacunas de dados ou inventou certezas');
  }

  // Teste 15: Investimento apoia crescimento estratégico -> Vínculo com objetivo estratégico explícito
  if (case1.strategicObjectiveId && case1.strategicObjectiveId.includes('EXPANSAO')) {
    console.log('[PASS] Teste 15: Caso de investimento vinculado formalmente a objetivo estratégico do portfólio');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 15: Caso de investimento criado sem vínculo estratégico');
  }

  // Teste 16: Cenário Do Nothing -> Incluído com justiça e equilíbrio, sem coerção
  const doNothingOpt = case1.options.find(o => o.type === ExpansionOptionType.DO_NOTHING);
  if (doNothingOpt && doNothingOpt.estimatedCost.upfront === 0 && doNothingOpt.status === 'BASE_SCENARIO') {
    console.log('[PASS] Teste 16: Cenário "Do Nothing" incluído de forma equilibrada como alternativa legítima de decisão');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 16: Cenário "Do Nothing" ausente ou distorcido');
  }

} catch (err) {
  console.error('ERRO FATAL NA EXECUÇÃO DOS TESTES:', err);
}

console.log('\n========================================================================');
console.log(` RESULTADO: ${passedTests} de ${totalTests} TESTES APROVADOS (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('========================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
