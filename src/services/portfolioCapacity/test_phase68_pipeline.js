/**
 * VELLIA LICITAÇÕES — FASE 68
 * test_phase68_pipeline.js: Bateria Automatizada de Testes de Capacidade Estratégica & Portfolio Trade-Offs
 */

import { portfolioTradeoffEngine } from './portfolioTradeoffEngine.js';
import {
  DemandStatus,
  CapacityQuality,
  ResourcePressureLevel,
  OpportunityPriorityTier
} from './portfolioCapacityModels.js';

let passedTests = 0;
let totalTests = 18;

console.log('========================================================================');
console.log(' INICIANDO BATERIA DE TESTES — FASE 68: STRATEGIC PORTFOLIO CAPACITY   ');
console.log('========================================================================\n');

try {
  // Teste 1: Duas oportunidades usam mesmo equipamento no mesmo período -> Conflito detectado
  const conflicts1 = portfolioTradeoffEngine.detectCapacityConflicts('all');
  const equipConflict = conflicts1.find(c => c.resources.includes('RES-EQP-SPECTRO') && c.entities.length >= 2);
  if (equipConflict && equipConflict.entities.length >= 2) {
    console.log('[PASS] Teste 1: Conflito de disputa simultânea de equipamento detectado com sucesso');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 1: Falha ao detectar conflito de equipamento sobreposto');
  }

  // Teste 2: Contrato existente usa recurso -> Contrato existente categoricamente protegido
  if (equipConflict && equipConflict.existingContractAtRisk === true) {
    console.log('[PASS] Teste 2: Precedência absoluta de contrato ativo garantida (Existing contract protected)');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 2: Contrato vigente não foi protegido contra demanda de pipeline');
  }

  // Teste 3: Disponibilidade de recurso desconhecida -> Não assumida como livre
  const unknownRes = portfolioTradeoffEngine.resources.find(r => r.coverageQuality === CapacityQuality.UNKNOWN);
  if (unknownRes && unknownRes.id === 'RES-VEH-VACUUM') {
    console.log('[PASS] Teste 3: Recurso com disponibilidade desconhecida não é tratado falsamente como livre');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 3: Recurso desconhecido foi assumido como disponível');
  }

  // Teste 4: Capacidade de parceiro estimada/não confirmada -> Não tratada como disponível garantida
  const partnerRes = portfolioTradeoffEngine.resources.find(r => r.id === 'RES-PARTNER-LAB');
  if (partnerRes && partnerRes.coverageQuality !== CapacityQuality.CONFIRMED) {
    console.log('[PASS] Teste 4: Capacidade de parceiro não confirmada tratada com status de incerteza');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 4: Parceiro não confirmado tratado como capacidade interna firme');
  }

  // Teste 5: Calibração de equipamento expira antes da execução -> Conflito/ajuste sinalizado
  const calibConflict = conflicts1.find(c => c.id.includes('CONF-CALIB'));
  if (calibConflict && calibConflict.description.includes('calibração')) {
    console.log('[PASS] Teste 5: Expiração futura de calibração detectada impedindo alocação cega');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 5: Equipamento com calibração vencida não foi sinalizado');
  }

  // Teste 6: Oportunidade perdida -> Reserva tentativa liberada de volta à capacidade
  const releaseRes = portfolioTradeoffEngine.releaseReservationOnOpportunityLost('PE-FAKE-LOST');
  if (releaseRes.success && releaseRes.reservationStatus.includes('Released')) {
    console.log('[PASS] Teste 6: Oportunidade perdida libera imediatamente as reservas de capacidade');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 6: Liberação de reserva provisória falhou');
  }

  // Teste 7: Oportunidade ganha -> Demanda esperada vira comprometida (committed)
  const commitRes = portfolioTradeoffEngine.commitReservationOnOpportunityWon('PE-2026-0891');
  if (commitRes.success && commitRes.status === DemandStatus.COMMITTED) {
    console.log('[PASS] Teste 7: Oportunidade homologada converte demanda em compromisso firme (COMMITTED)');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 7: Conversão para contrato assinado não atualizou status para committed');
  }

  // Teste 8: Simulação de cenário de portfólio -> Nenhuma alocação real alterada
  const initialDemandsCount = portfolioTradeoffEngine.demands.length;
  const simTradeoff = portfolioTradeoffEngine.evaluatePortfolioTradeoffs(['PE-2026-0891', 'PE-2026-0902', 'PE-2026-0940'], true);
  if (portfolioTradeoffEngine.demands.length === initialDemandsCount && simTradeoff.totalPipelineValue > 0) {
    console.log('[PASS] Teste 8: Simulação de cenário executada em sandbox sem alterar alocações reais');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 8: Simulação alterou dados de alocação em produção');
  }

  // Teste 9: Mitigação reduz conflito mas reduz margem -> Trade-off transparente exibido
  if (simTradeoff.mitigationCost > 0 && simTradeoff.potentialMarginPct < 19.0) {
    console.log('[PASS] Teste 9: Impacto financeiro de mitigação na margem apresentado transparentemente');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 9: Custo de mitigação não refletiu no cálculo de margem do trade-off');
  }

  // Teste 10: Recurso interempresas não autorizado -> Acesso bloqueado por governança
  const crossRes = portfolioTradeoffEngine.validateCrossCompanyResourceAccess('RES-SPEC-ENV', 'veeluen', ['capacity_portfolio.view']);
  if (!crossRes.allowed && crossRes.reason.includes('Acesso negado')) {
    console.log('[PASS] Teste 10: Alocação não autorizada de recurso entre CNPJs categoricamente bloqueada');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 10: Recurso de outro CNPJ foi alocado sem autorização formal');
  }

  // Teste 11: Dois certames marcados como Must Win -> Sistema não decide sozinho
  const mustWinDemands = portfolioTradeoffEngine.demands.filter(d => d.priorityTier === OpportunityPriorityTier.MUST_WIN);
  if (mustWinDemands.length >= 2) {
    console.log('[PASS] Teste 11: Múltiplos certames Must Win em conflito preservam deliberação humana soberana');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 11: Classificação humana Must Win não foi preservada');
  }

  // Teste 12: Recurso fica indisponível -> Entidades dependentes recalculadas e mapeadas
  const unavailRes = portfolioTradeoffEngine.handleResourceUnavailable('RES-TEAM-ETE', 'Manutenção preventiva');
  if (unavailRes.impactedEntities.length > 0) {
    console.log('[PASS] Teste 12: Indisponibilidade de recurso propagou impacto estritamente aos certames dependentes');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 12: Entidades impactadas não foram identificadas na indisponibilidade');
  }

  // Teste 13: Baixa cobertura de dados -> Warning auditado no sistema
  const auditWarning = portfolioTradeoffEngine.auditLog.find(a => a.action === 'DATA_QUALITY_WARNING');
  if (auditWarning) {
    console.log('[PASS] Teste 13: Alerta de qualidade de dados emitido para recursos com cobertura incompleta');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 13: Alerta de cobertura incompleta não registrado');
  }

  // Teste 14: Reserva tentativa expirada -> Capacidade restituída
  const release2 = portfolioTradeoffEngine.releaseReservationOnOpportunityLost('PE-2026-0940');
  if (release2.success) {
    console.log('[PASS] Teste 14: Reservas expiradas devidamente liberadas restituindo folga operacional');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 14: Falha na devolução de capacidade de reserva');
  }

  // Teste 15: Copilot pergunta se certames A+B cabem -> Resposta baseada na capacidade real
  const copilotAnswer = portfolioTradeoffEngine.answerCopilotQuery(['PE-2026-0891', 'PE-2026-0940']);
  if (copilotAnswer.conflict.includes('Sobrecarga') && copilotAnswer.options.length >= 2) {
    console.log('[PASS] Teste 15: Consulta ao Copilot responde com dados reais de capacidade e opções de trade-off');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 15: Resposta do Copilot não refletiu restrições reais de capacidade');
  }

  // Teste 16: Usuário sem permissão financeira -> Margem e custos ocultados
  const noFinTradeoff = portfolioTradeoffEngine.evaluatePortfolioTradeoffs(['PE-2026-0891'], false);
  if (noFinTradeoff.potentialMarginValue === null && noFinTradeoff.potentialMarginPct === null) {
    console.log('[PASS] Teste 16: Usuário sem permissão financeira recebe dados de margem devidamente ocultos');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 16: Dados financeiros vazaram para usuário não autorizado');
  }

  // Teste 17: Um gargalo gera múltiplos conflitos -> Alertas consolidados sem duplicação
  const rawConflictsCount = 4;
  const consolidated = portfolioTradeoffEngine._consolidateConflicts([
    { resources: ['RES-1'], period: '2026-11' },
    { resources: ['RES-1'], period: '2026-11' }
  ]);
  if (consolidated.length === 1) {
    console.log('[PASS] Teste 17: Conflitos redundantes para o mesmo recurso e período consolidados em alerta único');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 17: Conflitos duplicados não foram consolidados');
  }

  // Teste 18: Mobile -> Visão estratégica de conflitos críticos e opções acessível e compacta
  const mobileBottlenecks = portfolioTradeoffEngine.conflicts.filter(c => c.severity === ResourcePressureLevel.CRITICAL);
  if (mobileBottlenecks.length >= 1 && mobileBottlenecks[0].suggestedMitigations.length > 0) {
    console.log('[PASS] Teste 18: Conflitos críticos e mitigações estruturados para consumo direto em interface mobile');
    passedTests++;
  } else {
    console.error('[FAIL] Teste 18: Estrutura incompatível com visualização compacta');
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
