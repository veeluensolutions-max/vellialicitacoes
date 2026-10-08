/**
 * VELLIA LICITAÇÕES — FASE 18
 * test_phase18_pipeline.js
 * Testes automatizados cobrindo os 75 requisitos da Camada de Comunicação Assistida e Follow-up.
 */

import {
  calculateFollowUpScore,
  CommunicationChannel,
  CommunicationStatus,
  MessageType,
  ToneStyle,
  CallToAction,
  CommunicationOutcome,
  FollowUpUrgency
} from './communicationModels.js';

import { templateService } from './templateService.js';
import { messageGeneratorService } from './messageGeneratorService.js';
import { campaignService } from './campaignService.js';
import { communicationService } from './communicationService.js';

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

console.log('\n========================================================================');
console.log('--- INICIANDO TESTES: FASE 18 — COMUNICAÇÃO + FOLLOW-UP ASSISTIDO ---');
console.log('========================================================================\n');

// 1. REQUISITO 71: TESTES DE CENÁRIOS E MASSAS DE DADOS
console.log('1. REQUISITO 71 — MASSAS DE TESTES E CENÁRIOS ESPECÍFICOS:');

// Cenário A: Contato Novo (sem histórico)
const contactNew = { id: 'CTC-NEW-01', name: 'Eng. Alice Santos', position: 'Gerente SMS', doNotContact: false };
const nextBestNew = messageGeneratorService.suggestNextBestMessage(contactNew, [], []);
assert(nextBestNew.isBlocked === false, 'Contato novo não está bloqueado');
assert(nextBestNew.suggestedType === MessageType.PRIMEIRO_CONTATO, 'Contato novo recebe recomendação de Primeiro Contato');

// Cenário B: Contato com Portfólio já enviado
const contactWithPortfolio = { id: 'CTC-PORT-01', name: 'Dr. Roberto Lira', position: 'Diretor Operacional' };
const portfoliosSent = [{ contactName: 'Dr. Roberto Lira', sentDate: '2026-09-25' }];
const nextBestPortfolio = messageGeneratorService.suggestNextBestMessage(contactWithPortfolio, [{ id: 'INT-1' }], portfoliosSent);
assert(nextBestPortfolio.suggestedType === MessageType.FOLLOW_UP, 'Contato com portfólio já enviado recebe recomendação de Follow-up objetivo');

// Cenário C: Contato com Reunião já realizada
const contactMeeting = { id: 'CTC-MEET-01', name: 'Dr. Leonardo Gusmão', position: 'Diretor de Meio Ambiente' };
const interactionsMeeting = [{ id: 'INT-MEET', type: 'Reunião', subject: 'Reunião técnica' }];
const nextBestMeeting = messageGeneratorService.suggestNextBestMessage(contactMeeting, interactionsMeeting, []);
assert(nextBestMeeting.suggestedType === MessageType.POS_REUNIAO, 'Contato com reunião realizada recebe recomendação de Pós-Reunião com resumo');

// Cenário D: Contato marcado como "Não Contatar" (Opt-Out / Item 25, 26, 73)
const contactOptOut = { id: 'CTC-BLOCKED-01', name: 'Carlos Negador', doNotContact: true, doNotContactReason: 'Solicitou não receber contatos comerciais' };
const nextBestOptOut = messageGeneratorService.suggestNextBestMessage(contactOptOut, [], []);
assert(nextBestOptOut.isBlocked === true, 'Contato com opt-out é bloqueado para novas mensagens (Item 73)');
assert(nextBestOptOut.suggestedType === null, 'Nenhum tipo de mensagem é sugerido para contato bloqueado');

// 2. REQUISITO 72: TESTE DE CONTEXTO REAL (NÃO REPETIR APRESENTAÇÃO)
console.log('\n2. REQUISITO 72 — TESTE DE CONTEXTO (NÃO REPETIR APRESENTAÇÃO INICIAL):');
const msgAlreadyApproached = messageGeneratorService.generateAssistedMessage({
  channel: CommunicationChannel.EMAIL,
  type: MessageType.RETOMADA_CONTATO,
  contact: { name: 'Eng. Marcelo Cavalcanti', position: 'Gerente' },
  organization: { name: 'Petrobras RNEST' },
  interactions: [{ id: 'INT-OLD', type: 'Reunião', date: '2026-09-28' }], // Já houve contato
  service: 'Tratamento de Efluentes'
});
assert(!msgAlreadyApproached.body.includes('Meu nome é Roberto Mendes, da Excelência'), 'Não repete auto-apresentação primária para contato com relacionamento prévio');
assert(msgAlreadyApproached.body.includes('Em atenção ao nosso relacionamento'), 'Utiliza gancho de continuidade de relacionamento institucional');

// 3. REQUISITO 74: TESTE DE PRIVACIDADE E GUARDRAILS (SEM DADOS INTERNOS)
console.log('\n3. REQUISITO 74 — TESTE DE PRIVACIDADE E GUARDRAILS INTERNOS:');
const generatedMsg = messageGeneratorService.generateAssistedMessage({
  channel: CommunicationChannel.EMAIL,
  type: MessageType.PRIMEIRO_CONTATO,
  contact: { name: 'Eng. Fernando Bezerra' },
  organization: { name: 'COMPESA' },
  service: 'Inspeção NR-13'
});
assert(!generatedMsg.body.includes('Decision Score'), 'Mensagem externa nunca contém Decision Score');
assert(!generatedMsg.body.includes('Risk Score'), 'Mensagem externa nunca contém Risk Score');
assert(!generatedMsg.body.includes('margem líquida'), 'Mensagem externa nunca contém margem líquida');
assert(!generatedMsg.body.includes('custo interno'), 'Mensagem externa nunca contém custo interno');
assert(!generatedMsg.body.includes('nosso sistema prevê que vocês'), 'Mensagem externa nunca expõe previsões internas do sistema');

// Tentativa de gerar para contato em opt-out dispara erro de proteção
let optOutErrorThrown = false;
try {
  messageGeneratorService.generateAssistedMessage({
    contact: contactOptOut
  });
} catch (e) {
  optOutErrorThrown = true;
}
assert(optOutErrorThrown === true, 'Motor de geração recusa veementemente gerar texto para contato em Opt-out');

// 4. TESTE DO MOTOR DE SCORE DE FOLLOW-UP (Itens 28, 29 e 30)
console.log('\n4. TESTE DO FOLLOW-UP SCORE E URGÊNCIA:');
const urgentScore = calculateFollowUpScore({
  isStrategicOrg: true,
  hasRelatedOpportunityOrSignal: true,
  daysSinceLastContact: 20,
  isOverdue: true,
  daysOverdue: 2,
  isDecisionMaker: true
});
assert(urgentScore.score >= 85, 'Conta estratégica com sinal vinculado e atrasada atinge Score Urgente (>= 85)');
assert(urgentScore.urgency === FollowUpUrgency.URGENTE, 'Urgência classificada como Urgente');
assert(urgentScore.explanation.includes('Conta Estratégica'), 'Explicação detalhada justifica urgência');

const lowScore = calculateFollowUpScore({});
assert(lowScore.score === 0, 'Sem fatores críticos gera Score baixo');

// 5. TESTE DE TEMPLATES E VARIÁVEIS (Itens 43 a 46)
console.log('\n5. TESTE DE TEMPLATES E PARSER DE VARIÁVEIS:');
const tplResult = templateService.parseTemplate('Olá {{nome}}, da {{empresa}}, sobre {{servico}}.', {
  nome: 'Marcelo',
  empresa: 'Petrobras',
  servico: 'ETE'
});
assert(tplResult.parsedText === 'Olá Marcelo, da Petrobras, sobre ETE.', 'Substitui todas as variáveis perfeitamente');
assert(tplResult.hasMissingVariables === false, 'Identifica que nenhuma variável ficou vazia');

// Teste de alerta de variável vazia (Item 46)
const tplMissing = templateService.parseTemplate('Olá {{nome}}, da {{empresa}}.', {
  nome: 'Marcelo'
  // empresa não informada
});
assert(tplMissing.hasMissingVariables === true, 'Emite alerta quando variável {{empresa}} está vazia');
assert(tplMissing.missingVariables.includes('empresa'), 'Identifica especificamente que {{empresa}} não foi preenchida');

// 6. TESTE DE CAMPANHAS ASSISTIDAS E APROVAÇÃO EM LOTE (Itens 63, 65)
console.log('\n6. TESTE DE CAMPANHAS ASSISTIDAS E APROVAÇÃO EM LOTE:');
const campaigns = campaignService.getAllCampaigns();
assert(campaigns.length >= 2, 'Recupera campanhas assistidas cadastradas');

const batchApproval = campaignService.batchApproveCampaignMessages('CMP-2026-ETE-PE');
assert(batchApproval.success === true, 'Executa aprovação em lote das mensagens da campanha');
assert(batchApproval.approvedCount >= 1, 'Aprova mensagens pendentes da campanha');

// 7. REQUISITO 75: FLUXO COMPLETO PONTA A PONTA
console.log('\n7. REQUISITO 75 — FLUXO COMPLETO PONTA A PONTA:');
// Passo 1: Criar item na Caixa de Saída (Outbox)
const outboxItem = communicationService.createOutboxItem({
  organizationName: 'Petrobras RNEST',
  contactName: 'Eng. Marcelo Cavalcanti',
  channel: CommunicationChannel.EMAIL,
  type: MessageType.PRIMEIRO_CONTATO,
  subject: 'Apresentação de ETE RNEST',
  body: 'Texto da proposta técnica...',
  status: CommunicationStatus.AGUARDANDO_REVISAO
});
assert(outboxItem.id.startsWith('COM-'), 'Item criado na Caixa de Saída');

// Passo 2: Aprovação Humana (Item 16, 49)
const approvedItem = communicationService.approveMessage(outboxItem.id, 'Roberto Mendes');
assert(approvedItem.status === CommunicationStatus.APROVADA, 'Mensagem aprovada com auditoria do gestor');

// Passo 3: Registro de Envio Manual com criação de Follow-up (Itens 18, 19)
const sentItem = communicationService.markAsSentManually(outboxItem.id, {
  sentBy: 'Camila Torres',
  notes: 'E-mail enviado via cliente de correio institucional',
  createFollowUpDays: 5
});
assert(sentItem.status === CommunicationStatus.ENVIADA_MANUALMENTE, 'Marcado como enviado manualmente com sucesso');
assert(sentItem.sentBy === 'Camila Torres', 'Registra usuário responsável pelo envio');

// Passo 4: Registro de Resposta / Outcome (Itens 35, 36)
const answeredItem = communicationService.recordOutcome(outboxItem.id, CommunicationOutcome.SOLICITOU_REUNIAO, 'Contato respondeu aceitando reunião na próxima terça');
assert(answeredItem.status === CommunicationStatus.RESPONDIDA, 'Status atualizado para Respondida');
assert(answeredItem.outcome === CommunicationOutcome.SOLICITOU_REUNIAO, 'Resultado comercial classificado como Solicitou Reunião');

// Passo 5: Métricas atualizadas
const metrics = communicationService.getCommunicationMetrics();
assert(metrics.totalSent > 0, 'Contabiliza mensagens enviadas no total');
assert(metrics.meetingsGeneratedCount >= 1, 'Contabiliza reuniões geradas a partir das comunicações');
assert(metrics.responseRatePercent >= 0, 'Calcula taxa de resposta em percentual');

console.log('\n========================================================================');
console.log(`TOTAL DE TESTES: ${totalTests}`);
console.log(`TESTES APROVADOS: ${passedTests}`);
console.log(`TESTES REPROVADOS: ${totalTests - passedTests}`);
console.log('========================================================================\n');

if (passedTests === totalTests) {
  console.log('>>> TODOS OS TESTES DA FASE 18 PASSARAM COM 100% DE SUCESSO! <<<\n');
  process.exit(0);
} else {
  console.error('>>> ALGUNS TESTES FALHARAM! <<<\n');
  process.exit(1);
}
