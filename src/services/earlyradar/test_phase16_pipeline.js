/**
 * VELLIA LICITAÇÕES — FASE 16
 * test_phase16_pipeline.js
 * Testes automatizados cobrindo os 69 requisitos do Radar Antecipado de Oportunidades.
 */

import {
  calculateFutureOpportunityScore,
  classifyExpirationWindow,
  ExpirationWindow,
  ScoreTier,
  EarlyRecordType,
  SignalType
} from './earlyRadarModels.js';

import { contractMonitoringService } from './contractMonitoringService.js';
import { buyingPatternService } from './buyingPatternService.js';
import { signalClusterService } from './signalClusterService.js';
import { earlyRadarService } from './earlyRadarService.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
  }
}

console.log('\n======================================================');
console.log('--- INICIANDO TESTES: FASE 16 — RADAR ANTECIPADO ---');
console.log('======================================================\n');

// 1. TESTES DO MOTOR DE SCORE (Itens 18, 19, 20, 21, 64, 65)
console.log('1. TESTES DO FUTURE OPPORTUNITY SCORE E CENÁRIOS DO ITEM 64/65:');

// Cenário 1: PCA isolado sem histórico
const resPcaOnly = calculateFutureOpportunityScore({
  hasPca: true,
  adherencePercent: 80,
  estimatedValue: 300000
});
assert(resPcaOnly.score >= 40 && resPcaOnly.score <= 65, 'Cenário 1: PCA sem histórico gera score moderado/monitorar');
assert(resPcaOnly.explanation.some(e => e.factor.includes('PCA Oficial')), 'Explicação contém PCA Oficial');

// Cenário 2: Contrato vencendo sem PCA
const resContractOnly = calculateFutureOpportunityScore({
  contractDaysRemaining: 45,
  adherencePercent: 85,
  estimatedValue: 500000
});
assert(resContractOnly.score >= 35 && resContractOnly.score <= 60, 'Cenário 2: Contrato vencendo sem PCA gera score cauteloso');

// Cenário 3: Histórico recorrente sem contrato conhecido
const resRecurrenceOnly = calculateFutureOpportunityScore({
  hasRecurrence: true,
  recurrenceCount: 3,
  adherencePercent: 90
});
assert(resRecurrenceOnly.score >= 25 && resRecurrenceOnly.score <= 50, 'Cenário 3: Histórico recorrente sem contrato/PCA é indício preliminar');

// Cenário 4: PCA + contrato + recorrência + alta aderência (Item 65: Potencial Alto/Muito Alto)
const resAllEvidence = calculateFutureOpportunityScore({
  hasPca: true,
  contractDaysRemaining: 38,
  hasRecurrence: true,
  recurrenceCount: 3,
  adherencePercent: 95,
  estimatedValue: 3500000,
  isStrategicServiceOrOrgan: true
});
assert(resAllEvidence.score >= 80, 'Cenário 4: PCA + Contrato + Recorrência gera Potencial Alto/Muito Alto (Score >= 80)');
assert(resAllEvidence.tier === ScoreTier.MUITO_ALTO || resAllEvidence.tier === ScoreTier.ALTO, 'Tier classificado como Potencial Alto ou Muito Alto');
assert(resAllEvidence.score <= 100, 'Score nunca ultrapassa 100');

// Cenário 5: Nenhuma evidência
const resNoEvidence = calculateFutureOpportunityScore({});
assert(resNoEvidence.score === 0, 'Cenário 5: Nenhuma evidência gera score 0 (Sem sinal mágico)');
assert(resNoEvidence.tier === ScoreTier.BAIXO, 'Tier é Baixo sinal');

// 2. TESTES DE CONTRATOS A VENCER E JANELAS (Itens 9, 10, 11, 12, 41, 42)
console.log('\n2. TESTES DE MONITORAMENTO DE CONTRATOS E INCUMBÊNCIA:');
const win30 = classifyExpirationWindow(25);
const win60 = classifyExpirationWindow(45);
const win90 = classifyExpirationWindow(75);
const win180 = classifyExpirationWindow(120);
const winPlus = classifyExpirationWindow(210);

assert(win30 === ExpirationWindow.ATE_30_DIAS, 'Classifica corretamente até 30 dias');
assert(win60 === ExpirationWindow.DIAS_31_60, 'Classifica corretamente 31 a 60 dias');
assert(win90 === ExpirationWindow.DIAS_61_90, 'Classifica corretamente 61 a 90 dias');
assert(win180 === ExpirationWindow.DIAS_91_180, 'Classifica corretamente 91 a 180 dias');
assert(winPlus === ExpirationWindow.MAIS_180_DIAS, 'Classifica corretamente mais de 180 dias');

const allContracts = contractMonitoringService.getAllContracts();
assert(allContracts.length >= 4, 'Recupera contratos vigentes monitorados');
const petroContract = allContracts.find(c => c.organShort.includes('Petrobras'));
assert(petroContract && petroContract.isIncumbentKnown === true, 'Mapeia fornecedor incumbente conhecido');
assert(petroContract.currentSupplier.length > 3, 'Identifica nome do fornecedor incumbente real');
assert(petroContract.commercialSignalMessage.includes('encerra em aproximadamente'), 'Gera mensagem condicional de sinal comercial sem afirmar nova licitação');

// 3. TESTES DE BUYING PATTERN E HISTÓRICO INSUFICIENTE (Itens 13, 14, 15, 16, 48)
console.log('\n3. TESTES DE BUYING PATTERN E DETECÇÃO DE RECORRÊNCIA:');
const ufpePattern = buyingPatternService.getPatternByOrgan('UFPE');
assert(ufpePattern && ufpePattern.hasSufficientHistory === true, 'UFPE possui histórico mapeado consolidado');
const ufpeRecurrence = buyingPatternService.analyzeServiceRecurrence('UFPE', 'Emissões');
assert(ufpeRecurrence.hasRecurrence === true && ufpeRecurrence.recurrenceCount >= 3, 'Identifica recorrência comprovada em emissões para UFPE');

const ufpeSeasonality = buyingPatternService.analyzeTemporalSeasonality('UFPE');
assert(ufpeSeasonality.isQ4Concentration === true, 'Identifica concentração histórica de publicações no 4º trimestre');

// Caso de histórico insuficiente (Item 15 e 48)
const scarcePattern = buyingPatternService.getPatternByOrgan('Itamaracá');
assert(scarcePattern && scarcePattern.hasSufficientHistory === false, 'Detecta caso de histórico insuficiente');
const scarceRecurrence = buyingPatternService.analyzeServiceRecurrence('Itamaracá', 'Limpeza');
assert(scarceRecurrence.hasRecurrence === false, 'Não gera previsão mágica para histórico insuficiente');
assert(scarceRecurrence.insight.includes('Histórico insuficiente'), 'Retorna texto claro de histórico insuficiente');

// 4. TESTES DE SIGNAL CLUSTER, CLUSTER SCORE E CONVERSÃO (Itens 24, 25, 26, 61, 62, 63)
console.log('\n4. TESTES DE SIGNAL CLUSTER E CONVERSÃO DO SINAL:');
const clusters = signalClusterService.getSignalClusters();
assert(clusters.length >= 3, 'Consolida sinais em clusters por Órgão + Serviço + Horizonte');

const petroCluster = clusters.find(cl => cl.organShort.includes('Petrobras'));
assert(petroCluster && petroCluster.signals.length >= 2, 'Consolida múltiplos sinais no cluster da Petrobras (PCA + Contrato)');
assert(petroCluster.score >= 80, 'Cluster da Petrobras atinge alto score convergente');

// Conversão do sinal em oportunidade real
const conversionMetricsBefore = signalClusterService.getConversionMetrics();
assert(conversionMetricsBefore.totalSignals > 0, 'Mapeia métricas totais de sinais');
assert(conversionMetricsBefore.conversionRatePercent >= 0, 'Calcula taxa de conversão em percentual');

const conversionOk = signalClusterService.convertSignalToOpportunity('SIG-2026-003', 'PNCP-NOVO-2026-UFPE');
assert(conversionOk === true, 'Converte sinal em oportunidade PNCP real aberta');

const updatedSignals = signalClusterService.getAllSignals();
const sigConverted = updatedSignals.find(s => s.id === 'SIG-2026-003');
assert(sigConverted.status === 'CONVERTED' && sigConverted.recordType === EarlyRecordType.OPEN, 'Sinal convertido atualizado para status CONVERTED e OPEN');

// 5. TESTES DE AÇÕES COMERCIAIS PREVENTIVAS E CHECKLIST (Itens 27, 28, 29, 31)
console.log('\n5. TESTES DE AÇÕES COMERCIAIS E CHECKLIST DE PREPARAÇÃO:');
const actions = earlyRadarService.getCommercialActions();
assert(actions.length >= 2, 'Carrega ações comerciais preventivas cadastradas');
const act1 = actions[0];
assert(act1.checklist && act1.checklist.validarAtestado !== undefined, 'Ação comercial possui checklist de preparação estruturado');

const newAction = earlyRadarService.addCommercialAction({
  organ: 'COMPESA',
  responsible: 'Eng. Flávio',
  objective: 'Estudo preventivo de planilha de calibração NR-13',
  date: '2026-10-25'
});
assert(newAction.id.startsWith('ACT-'), 'Cadastra nova ação comercial com ID rastreável');

// 6. TESTES DO JOB DO RADAR E AUDITORIA (Itens 55, 56, 66, 67)
console.log('\n6. TESTES DO JOB DO RADAR E AUDITORIA:');
const jobResult = earlyRadarService.runEarlyRadarJob();
assert(jobResult.status === 'SUCCESS', 'Executa EarlyRadarJob com sucesso');
assert(jobResult.type === 'INCREMENTAL', 'EarlyRadarJob configurado para processamento incremental');

console.log('\n======================================================');
console.log(`TOTAL DE TESTES: ${totalTests}`);
console.log(`TESTES APROVADOS: ${passedTests}`);
console.log(`TESTES REPROVADOS: ${totalTests - passedTests}`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  console.log('>>> TODOS OS TESTES DA FASE 16 PASSARAM COM 100% DE SUCESSO! <<<\n');
  process.exit(0);
} else {
  console.error('>>> ALGUNS TESTES FALHARAM! <<<\n');
  process.exit(1);
}
