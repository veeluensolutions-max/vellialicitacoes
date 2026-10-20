/**
 * VELLIA LICITAÇÕES — FASE 62: PARTNER & CONSORTIUM INTELLIGENCE
 * test_phase62_pipeline.js: Suíte de Validação Factual dos 14 Testes Críticos
 */

import { partnerStrategyService } from './partnerStrategyService.js';
import {
  ParticipationType,
  ParticipationStructureStatus,
  EditalRuleStatus,
  CommercialTermsStatus,
  PartnerCommitmentStatus,
  CommitmentEvidenceType
} from './partnerStrategyModels.js';

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

export function runPhase62Tests() {
  console.log('\n======================================================');
  console.log(' INICIANDO BATERIA DE TESTES — FASE 62: PARTNER STRATEGY');
  console.log('======================================================\n');

  // TESTE 1: Solo atende requisitos -> Sistema não força parceria
  const caaporaScenarios = partnerStrategyService.compareScenarios('OPP-CAAPORA-PB');
  assert(
    caaporaScenarios.solo.feasible === true && caaporaScenarios.solo.capabilityScore >= 80,
    'Solo atende requisitos -> Sistema não força parceria e reconhece viabilidade solo',
    `Score Solo: ${caaporaScenarios.solo.capabilityScore}`
  );

  // TESTE 2: Gap existe e consórcio proibido -> Não sugerir consórcio
  const suapeRules = partnerStrategyService.checkEditalRules('7004319802');
  const suapeScenarios = partnerStrategyService.compareScenarios('7004319802');
  assert(
    suapeRules.consortium.status === EditalRuleStatus.NOT_ALLOWED &&
    suapeScenarios.consortium.feasible === false &&
    suapeScenarios.consortium.riskLevel.includes('INABILITAÇÃO CERTA'),
    'Gap existe e consórcio proibido pelo edital -> Não sugerir consórcio e marcar como inviável',
    suapeRules.consortium.details
  );

  // TESTE 3: Subcontratação condicional -> Needs Review / Conditional com limite
  const rnestRules = partnerStrategyService.checkEditalRules('7004321234');
  assert(
    rnestRules.subcontracting.status === EditalRuleStatus.CONDITIONAL &&
    rnestRules.subcontracting.details.includes('30%'),
    'Subcontratação condicional -> Regra estruturada com percentual limite (30%) e escopo restrito',
    rnestRules.subcontracting.clause
  );

  // TESTE 4: Partner capability sem evidência -> Não considerar completo
  const matches = partnerStrategyService.matchPartners({
    requiredCapabilities: ['Emissões', 'Análises Ambientais'],
    region: 'Bahia'
  });
  const bioSondaMatch = matches.find(m => m.partner.id === 'PARTNER-005');
  assert(
    bioSondaMatch && bioSondaMatch.hasEvidenceGaps === true && bioSondaMatch.dimensions.capabilityFit.includes('PARCIAL'),
    'Partner capability sem evidência comprovada (autodeclaração) -> Não considerar completo, sinalizar pendência',
    bioSondaMatch?.dimensions?.capabilityFit
  );

  // TESTE 5: Partner doc expired -> Readiness gap
  const vencidaMatch = matches.find(m => m.partner.id === 'PARTNER-006');
  assert(
    vencidaMatch && vencidaMatch.hasExpiredDocuments === true && vencidaMatch.dimensions.documentationFit.includes('PENDÊNCIA'),
    'Partner doc expired -> Documentação vencida detectada, gerando pendência impeditiva de habilitação',
    vencidaMatch?.dimensions?.documentationFit
  );

  // TESTE 6: Partner withdrawal -> Readiness recalculado
  const withdrawalRes = partnerStrategyService.handlePartnerWithdrawal(
    'PART-STRUCT-001',
    'PARTNER-002',
    'Indisponibilidade de sondas para a data',
    'Diretoria Técnica'
  );
  assert(
    withdrawalRes.recalculatedReadiness < 60 &&
    withdrawalRes.structure.status === ParticipationStructureStatus.UNDER_REVIEW &&
    withdrawalRes.structure.withdrawalAlert.hasWithdrawnPartner === true,
    'Partner withdrawal -> Readiness recalculado imediatamente e status alterado para UNDER_REVIEW',
    `Novo Readiness: ${withdrawalRes.recalculatedReadiness}%`
  );

  // TESTE 7: New partner cost -> Margin updated in scenario
  const updatedStructure = partnerStrategyService.handlePartnerCostChange(
    'PART-STRUCT-001',
    'PARTNER-002',
    180000,
    false,
    'Comercial'
  );
  assert(
    updatedStructure.commercialTerms.subcontractorCostFixed === 180000 &&
    updatedStructure.commercialTerms.status === CommercialTermsStatus.NEGOTIATING,
    'New partner cost -> Custo e termos atualizados no cenário correspondente',
    `Novo Custo: R$ ${updatedStructure.commercialTerms.subcontractorCostFixed}`
  );

  // TESTE 8: Price already approved -> Material change requires review
  const materialChangeStructure = partnerStrategyService.handlePartnerCostChange(
    'PART-STRUCT-002',
    'PARTNER-004',
    420000, // Aumento de 340k para 420k
    true,   // Preço já estava aprovado!
    'Comercial'
  );
  assert(
    materialChangeStructure.priceApprovalInvalidated === true &&
    materialChangeStructure.priceApprovalInvalidationReason.includes('Exige revalidação de alçada'),
    'Price already approved -> Alteração material de custo de parceiro invalida aprovação prévia',
    materialChangeStructure.priceApprovalInvalidationReason
  );

  // TESTE 9: Consortium comparison -> No automatic winner
  const scenariosComparison = partnerStrategyService.compareScenarios('OPP-CAAPORA-PB');
  assert(
    scenariosComparison.consortium.feasible === true &&
    scenariosComparison.partnerSupport.feasible === true &&
    scenariosComparison.solo.feasible === true &&
    !scenariosComparison.winner, // Nenhum atributo 'winner' fixo
    'Consortium comparison -> Apresenta trade-offs equilibrados sem eleger vencedor automático',
    `Solo: ${scenariosComparison.solo.marginPct}% vs Parceiro: ${scenariosComparison.partnerSupport.marginPct}%`
  );

  // TESTE 10: Cross-company capability -> Não transferir documento automaticamente
  // Regra 142: Veeluen e Excelência separadas; uso de acervo mútuo requer estrutura formal de consórcio ou subcontratação
  const rnestStructure = partnerStrategyService.getStructureByOpportunity('7004321234');
  assert(
    rnestStructure.companyId === 'excelencia' &&
    rnestStructure.responsibilityMatrix.some(r => r.ourCompany.includes('Líder')) &&
    !rnestStructure.gaps.some(g => g.description.includes('Veeluen cede atestado sem consórcio')),
    'Cross-company capability -> Proibida transferência automática de atestados entre empresas sem consórcio formal',
    'Isolamento multiempresa preservado'
  );

  // TESTE 11: User without financial access -> Commercial terms hidden
  const reportWithoutFin = partnerStrategyService.generatePartnerStrategyReport('7004321234', false, 'EXECUTIVE');
  const reportWithFin = partnerStrategyService.generatePartnerStrategyReport('7004321234', true, 'EXECUTIVE');
  assert(
    reportWithoutFin.commercialOverview.status === 'ACESSO RESTRITO' &&
    !!reportWithoutFin.commercialOverview.restrictedNotice &&
    reportWithFin.commercialOverview.ourSharePct !== undefined,
    'User without financial access -> Termos comerciais sensíveis e margens ocultos com aviso de restrição',
    reportWithoutFin.commercialOverview.restrictedNotice
  );

  // TESTE 12: External invite -> Confirmation required
  let commitmentError = false;
  try {
    // Tenta registrar como CONFIRMED sem anexo/evidência formal
    partnerStrategyService.registerPartnerCommitment('PART-STRUCT-001', 'PARTNER-002', {
      status: PartnerCommitmentStatus.CONFIRMED,
      evidenceDocRef: '' // Sem evidência!
    });
  } catch (e) {
    commitmentError = true;
  }
  assert(
    commitmentError,
    'Registro de compromisso como CONFIRMED sem evidência formal -> Bloqueado com exceção de governança',
    'Bloqueio confirmado'
  );

  // TESTE 13: Copilot -> Does not select partner as definitive
  const copilotResp = partnerStrategyService.askPartnerCopilot('Quais parceiros cadastrados atendem ao requisito?');
  assert(
    copilotResp.options.includes('parceiros compatíveis') &&
    !copilotResp.options.includes('escolha o parceiro') &&
    !!copilotResp.requirement && !!copilotResp.gap && !!copilotResp.risk,
    'Copilot responde em Requirement, Gap, Options, Evidence, Risk sem escolher parceiro definitivo',
    copilotResp.options
  );

  // TESTE 14: Ambiguous edital clause -> Legal review recommended
  const ambiguousRules = partnerStrategyService.checkEditalRules('OPP-SUDEMA-AMBIGUOUS');
  assert(
    ambiguousRules.consortium.status === EditalRuleStatus.UNCLEAR &&
    ambiguousRules.consortium.alertLegalReview.includes('REVISÃO JURÍDICA RECOMENDADA'),
    'Ambiguous edital clause -> Alerta explícito de "REVISÃO JURÍDICA RECOMENDADA" sem parecer definitivo precipitado',
    ambiguousRules.consortium.alertLegalReview
  );

  console.log(`\n======================================================`);
  console.log(` RESULTADO: ${passedTests} de ${totalTests} TESTES APROVADOS (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log('======================================================\n');

  return { passedTests, totalTests, success: passedTests === totalTests };
}

// Execução direta se rodado via Node/terminal
if (typeof process !== 'undefined' && process.release?.name === 'node') {
  runPhase62Tests();
}
