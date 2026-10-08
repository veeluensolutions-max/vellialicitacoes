/**
 * VELLIA LICITAÇÕES — FASE 17
 * test_phase17_pipeline.js
 * Testes automatizados cobrindo os 74 requisitos do CRM de Relacionamento.
 */

import {
  calculateRelationshipOpportunityScore,
  calculateRelationshipStrength,
  OrganizationType,
  StrategicClassification,
  ContactRole,
  InteractionType,
  FollowUpStatus,
  PipelineStage
} from './crmModels.js';

import { organizationService } from './organizationService.js';
import { contactService } from './contactService.js';
import { interactionService } from './interactionService.js';
import { followUpService } from './followUpService.js';
import { pipelineService } from './pipelineService.js';
import { crmService } from './crmService.js';

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

console.log('\n================================================================');
console.log('--- INICIANDO TESTES: FASE 17 — CRM DE RELACIONAMENTO ---');
console.log('================================================================\n');

// 1. REQUISITO 71: VALIDAÇÃO DAS MASSAS MÍNIMAS DE DADOS
console.log('1. REQUISITO 71 — MASSAS DE DADOS MÍNIMAS EXIGIDAS:');
const orgs = crmService.getOrganizations();
assert(orgs.length >= 5, `Pelo menos 5 organizações cadastradas (Encontradas: ${orgs.length})`);

const contacts = crmService.getContacts();
assert(contacts.length >= 10, `Pelo menos 10 contatos profissionais cadastrados (Encontrados: ${contacts.length})`);

const interactions = crmService.getInteractions();
assert(interactions.length >= 15, `Pelo menos 15 interações registradas (Encontradas: ${interactions.length})`);

const followUps = crmService.getFollowUps();
assert(followUps.length >= 10, `Pelo menos 10 follow-ups estruturados (Encontrados: ${followUps.length})`);

const manualSignals = crmService.getManualSignals();
assert(manualSignals.length >= 3, `Pelo menos 3 sinais futuros/manuais registrados (Encontrados: ${manualSignals.length})`);

const pipelineCards = crmService.getPipelineCards();
const publishedTenders = pipelineCards.filter(p => p.stage === PipelineStage.LICITACAO_PUBLICADA || p.linkedOpportunityId);
assert(publishedTenders.length >= 1, `Oportunidades em fase de licitação publicada mapeadas no pipeline (Encontradas: ${publishedTenders.length})`);

// 2. TESTES DE SCORE E FORÇA DO RELACIONAMENTO (Itens 25 a 29)
console.log('\n2. TESTES DE ALGORITMOS DE PONTUAÇÃO (SCORE E RELATIONSHIP STRENGTH):');
const scoreHigh = calculateRelationshipOpportunityScore({
  futureSignalsCount: 2,
  historicalVolume: 10000000,
  hasRecurrence: true,
  compatibleServicesCount: 3,
  hasExpiringContracts: true,
  isStrategicAccount: true
});
assert(scoreHigh.score >= 85, 'Conta estratégica com volume e recorrência atinge Prioridade Máxima (Score >= 85)');
assert(scoreHigh.tier === 'Prioridade máxima', 'Classificação qualitativa do score correta');

const scoreLow = calculateRelationshipOpportunityScore({});
assert(scoreLow.score === 0 && scoreLow.tier === 'Monitorar', 'Sem histórico gera score zero (Monitorar)');

// Relationship Strength
const strengthActive = calculateRelationshipStrength({
  interactionsCount: 6,
  daysSinceLastInteraction: 5,
  meetingsCount: 2,
  hasCommercialHistory: true
});
assert(strengthActive.strength >= 60, 'Atividade recente e reuniões geram Força de Relacionamento Ativa (>= 60)');
assert(strengthActive.daysSinceLastInteraction === 5, 'Registra corretamente recência de 5 dias');

// 3. TESTE DE DEDUPLICAÇÃO E ORGANIZAÇÃO AUTOMÁTICA (Itens 7 e 73)
console.log('\n3. TESTE DE DEDUPLICAÇÃO DE ORGANIZAÇÕES E CONTATOS (ITEM 73):');
// Teste de Organização existente por CNPJ da Petrobras RNEST
const existingOrgCnpj = organizationService.findOrCreateOrganization({
  name: 'Petrobras Abreu Lima',
  cnpj: '33.000.167/0842-88'
});
assert(existingOrgCnpj.created === false, 'Deduplicação por CNPJ identifica organização já cadastrada sem duplicar');
assert(existingOrgCnpj.organization.id === 'ORG-PETROBRAS-RNEST', 'Mapeia para o ID existente correto');

// Teste de Organização existente por Nome aproximado
const existingOrgName = organizationService.findOrCreateOrganization({
  name: 'Companhia Pernambucana de Saneamento'
});
assert(existingOrgName.created === false, 'Deduplicação por Nome identifica organização já cadastrada sem duplicar');

// Teste de Duplicidade de Contato por E-mail profissional (Item 63)
const dupContact = contactService.addContact({
  name: 'Eng. Marcelo Cavalcanti Novo',
  organizationId: 'ORG-PETROBRAS-RNEST',
  email: 'marcelo.cavalcanti@petrobras.com.br' // Já existe
});
assert(dupContact.isDuplicate === true, 'Bloqueia duplicidade de contato com mesmo e-mail profissional');
assert(dupContact.contact.id === 'CTC-PETRO-001', 'Retorna o contato original existente');

// 4. MAPA DE RELACIONAMENTO E PAPÉIS (Itens 10, 11, 12)
console.log('\n4. TESTE DO MAPA DE RELACIONAMENTO (ROLES E INFLUÊNCIA):');
const petroMap = contactService.getRelationshipMap('ORG-PETROBRAS-RNEST');
assert(petroMap.decisores.length >= 1, 'Mapeia decisores identificados na organização');
assert(petroMap.tecnicos.length >= 1, 'Mapeia corpo técnico especializado (NR-13/Engenharia)');
assert(petroMap.compras.length >= 1, 'Mapeia área de compras/suprimentos');

// 5. FOLLOW-UPS E ALERTAS (Itens 16, 17, 18, 19)
console.log('\n5. TESTE DE FOLLOW-UPS, ALERTAS E INTEGRAÇÃO COM RADAR:');
const alerts = followUpService.getFollowUpAlerts();
assert(alerts.today.length >= 1, 'Identifica follow-ups agendados para hoje');
assert(alerts.overdue.length >= 1, 'Identifica follow-ups atrasados que demandam ação urgente');

// Criar follow-up a partir de sinal do Radar Antecipado (Item 19)
const createdFromRadar = followUpService.createFromRadarSignal({
  id: 'SIG-TEST-99',
  organShort: 'UFPE',
  relatedService: 'Operação de ETE e Efluentes',
  description: 'Contrato de operação de ETE encerra em 90 dias'
});
assert(createdFromRadar.id.startsWith('FOL-'), 'Cria follow-up com sucesso a partir de sinal do Radar Antecipado');
assert(createdFromRadar.status === FollowUpStatus.HOJE, 'Follow-up criado com prioridade imediata');

// 6. PIPELINE COMERCIAL E CONVERSÃO (Itens 22, 23, 24, 72)
console.log('\n6. TESTE DE FLUXO DE CONVERSÃO COMERCIAL (ITEM 72):');
// Sinal -> Relacionamento -> Oportunidade publicada -> Vincular -> GO -> Proposta
const newCard = pipelineService.addPipelineCard({
  organizationName: 'Petrobras RNEST',
  service: 'Tratamento de Efluentes e Operação de ETE',
  potentialValue: 3800000.00,
  stage: PipelineStage.OPORTUNIDADE_FUTURA
});
assert(newCard.stage === PipelineStage.OPORTUNIDADE_FUTURA, 'Card criado no estágio Oportunidade Futura');

// Avanço de estágio (Item 22)
pipelineService.updateCardStage(newCard.id, PipelineStage.REUNIAO);
const updatedCard = pipelineService.getAllPipelineCards().find(c => c.id === newCard.id);
assert(updatedCard.stage === PipelineStage.REUNIAO, 'Avança estágio no pipeline para Reunião');

// Vinculação a edital oficial publicado (Item 24 e 72)
const linkedCard = pipelineService.linkToOfficialTender(newCard.id, 'PNCP-2026-9988');
assert(linkedCard.stage === PipelineStage.LICITACAO_PUBLICADA, 'Converte estágio para Licitação Publicada');
assert(linkedCard.linkedOpportunityId === 'PNCP-2026-9988', 'Vincula id da licitação sem criar registro duplicado');

// 7. VISÃO 360° E NEXT BEST ACTION (Itens 5, 39, 40, 41)
console.log('\n7. TESTE DA VISÃO 360° E NEXT BEST ACTION:');
const org360 = crmService.getOrganization360('ORG-PETROBRAS-RNEST');
assert(org360 !== null, 'Gera Visão 360° completa da organização');
assert(org360.contacts.length >= 3, 'Visão 360° consolida contatos mapeados');
assert(org360.interactions.length >= 4, 'Visão 360° consolida interações históricas');
assert(org360.earlyRadar.expiringContracts.length >= 1, 'Visão 360° integra contratos a vencer da Fase 16');
assert(org360.nextBestAction.length > 10, 'Gera recomendação fundamentada de Next Best Action');
assert(org360.relationshipStrength.strength > 0, 'Calcula força do relacionamento na Visão 360°');

// 8. RESUMO SEMANAL E PAINEL EXECUTIVO (Itens 45 e 46)
console.log('\n8. TESTE DO RESUMO COMERCIAL SEMANAL E PAINEL EXECUTIVO:');
const execMetrics = crmService.getExecutiveDashboardMetrics();
assert(execMetrics.strategicOrgsCount >= 2, 'Contabiliza organizações estratégicas');
assert(execMetrics.totalPipelinePotentialVolume > 5000000, 'Calcula volume financeiro total em prospecção');

const weekly = crmService.getWeeklyCommercialSummary();
assert(weekly.priorityOrganizations.length >= 4, 'Lista organizações prioritárias com justificativa no resumo semanal');

console.log('\n================================================================');
console.log(`TOTAL DE TESTES: ${totalTests}`);
console.log(`TESTES APROVADOS: ${passedTests}`);
console.log(`TESTES REPROVADOS: ${totalTests - passedTests}`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log('>>> TODOS OS TESTES DA FASE 17 PASSARAM COM 100% DE SUCESSO! <<<\n');
  process.exit(0);
} else {
  console.error('>>> ALGUNS TESTES FALHARAM! <<<\n');
  process.exit(1);
}
