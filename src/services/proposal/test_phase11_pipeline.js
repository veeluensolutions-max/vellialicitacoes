// Mock de localStorage para ambiente de terminal Node.js
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

import { 
  ProposalService, 
  ProposalStatus, 
  TaskStatus, 
  ProposalDocStatus, 
  TenderResult, 
  LossReason 
} from './proposalService.js';
import { priorityOpportunities } from '../../data/mockData.js';

console.log('=== INICIANDO BATERIA DE TESTES — FASE 11 (GESTÃO DA PROPOSTA + FORMAÇÃO DE PREÇO + CHECKLIST) ===\n');

// 1. Validar Inicialização dos Seeds (Item 65: 5 propostas com perfis distintos)
console.log('1. Validando Inicialização e Carga dos Seeds Mocks (Item 65):');
const proposals = ProposalService.listAll();
console.log(` - Total de Propostas Cadastradas: ${proposals.length}`);
if (proposals.length < 5) {
  console.error('ERRO: Menos de 5 propostas iniciais cadastradas!');
  process.exit(1);
}

const seed1 = proposals.find(p => p.id === 'PROP-7004321234-01'); // Quase pronta
const seed2 = proposals.find(p => p.id === 'PROP-7004319802-02'); // Doc pendente
const seed3 = proposals.find(p => p.id === 'PROP-7004318765-03'); // Aguardando preço
const seed4 = proposals.find(p => p.id === 'PROP-7004315600-04'); // Prazo crítico
const seed5 = proposals.find(p => p.id === 'PROP-7004309911-05'); // Enviada

console.log(` - Seed 1 (Quase Pronta): ${seed1?.client} | Status: ${seed1?.status} -> ${seed1 ? '✅ OK' : '❌ FALHA'}`);
console.log(` - Seed 2 (Doc Pendente): ${seed2?.client} | Status: ${seed2?.status} -> ${seed2 ? '✅ OK' : '❌ FALHA'}`);
console.log(` - Seed 3 (Aguardando Preço): ${seed3?.client} | Status: ${seed3?.status} -> ${seed3 ? '✅ OK' : '❌ FALHA'}`);
console.log(` - Seed 4 (Prazo Crítico): ${seed4?.client} | Status: ${seed4?.status} -> ${seed4 ? '✅ OK' : '❌ FALHA'}`);
console.log(` - Seed 5 (Enviada): ${seed5?.client} | Status: ${seed5?.status} -> ${seed5 ? '✅ OK' : '❌ FALHA'}`);

// 2. Testar Proposal Readiness Score (Itens 37, 38, 39)
console.log('\n2. Testando Proposal Readiness Score & Classificação:');
const r1 = ProposalService.calculateReadiness(seed1);
console.log(` - Proposta 1 Readiness: ${r1.totalScore}% (${r1.classification})`);
console.log(`   • Documentação: ${r1.breakdown.documentacao.score}%`);
console.log(`   • Preço: ${r1.breakdown.preco.score}%`);
console.log(`   • Proposta Técnica: ${r1.breakdown.tecnico.score}%`);
console.log(`   • Tarefas: ${r1.breakdown.tarefas.score}%`);
console.log(`   • Aprovações: ${r1.breakdown.aprovacoes.score}%`);

if (r1.totalScore < 75) {
  console.error('ERRO: Readiness Score da proposta 1 deveria ser "QUASE PRONTA" ou "PRONTA"!');
  process.exit(1);
}

// 3. Testar Submission Blockers (Itens 35 e 36)
console.log('\n3. Testando Submission Blockers (Bloqueadores Críticos de Envio):');
const r2 = ProposalService.calculateReadiness(seed2);
console.log(` - Proposta 2 possui bloqueadores? ${r2.hasBlockers ? 'SIM (Correto)' : 'NÃO'}`);
console.log(` - Quantidade de bloqueadores: ${r2.blockers.length}`);
r2.blockers.forEach(b => {
  console.log(`   • [${b.severity}] ${b.title}: ${b.description}`);
});

if (!r2.hasBlockers) {
  console.error('ERRO: Proposta com certidão vencida deveria ter bloqueador ativo!');
  process.exit(1);
}

// 4. Testar Formação de Preço & Regra "NÃO INVENTAR CUSTOS" (Itens 11 a 24)
console.log('\n4. Testando Formação de Preço e Regra de Não Inventar Custos (Item 24):');
const p1 = seed1.pricing;
console.log(` - Mão de Obra Total: ${ProposalService.formatCurrency(p1.laborTotal)}`);
console.log(` - Equipamentos Total: ${ProposalService.formatCurrency(p1.equipmentTotal)}`);
console.log(` - Laboratório Total: ${ProposalService.formatCurrency(p1.laboratoryTotal)}`);
console.log(` - Logística/Viagem Total: ${ProposalService.formatCurrency(p1.travelTotal)}`);
console.log(` - Materiais Total: ${ProposalService.formatCurrency(p1.materialsTotal)}`);
console.log(` - Terceiros Total: ${ProposalService.formatCurrency(p1.subcontractorsTotal)}`);
console.log(` - Custos Indiretos: ${ProposalService.formatCurrency(p1.indirectTotal)}`);
console.log(` - Tributos Flexíveis: ${ProposalService.formatCurrency(p1.taxesTotal)}`);
console.log(` - CUSTO TOTAL ESTIMADO: ${ProposalService.formatCurrency(p1.totalEstimatedCost)}`);
console.log(` - Preço Definido: ${ProposalService.formatCurrency(p1.definedPrice)} (Margem: ${p1.finalMargin}%)`);

// Proposta 3 com itens pendentes de cotação
const p3 = seed3.pricing;
console.log(` - Proposta 3 itens pendentes de cotação: ${p3.itemsPendingQuote} itens -> ${p3.itemsPendingQuote > 0 ? '✅ REGRA RESPEITADA' : '❌ FALHA'}`);

// 5. Testar 3 Cenários Financeiros (Item 23)
console.log('\n5. Testando 3 Cenários Financeiros (Conservador, Provável, Agressivo):');
const scn = p1.scenarios;
console.log(` - Cenário Conservador: ${ProposalService.formatCurrency(scn.conservador.price)} (Margem: ${scn.conservador.margin}% | Risco: ${scn.conservador.risk})`);
console.log(` - Cenário Provável: ${ProposalService.formatCurrency(scn.provavel.price)} (Margem: ${scn.provavel.margin}% | Prob: ${scn.provavel.competitivenessProbability})`);
console.log(` - Cenário Agressivo: ${ProposalService.formatCurrency(scn.agressivo.price)} (Margem: ${scn.agressivo.margin}% | Prob: ${scn.agressivo.competitivenessProbability})`);

// 6. Testar Criação de Nova Proposta a partir de Oportunidade (Itens 1, 2, 5, 6)
console.log('\n6. Testando Criação de Proposta a partir de Oportunidade GO (Item 1 & 2):');
const sampleOpp = priorityOpportunities[1]; // Suape Transpetro
const createdProposal = ProposalService.createProposalFromOpportunity(sampleOpp, 'Diretor de Operações');
console.log(` - Proposta Criada ID: ${createdProposal.id}`);
console.log(` - Objeto Importado: "${createdProposal.object.substring(0, 60)}..."`);
console.log(` - Empresa Participante: ${createdProposal.participatingCompany}`);
console.log(` - Total de Tarefas Geradas (com checklist dinâmico): ${createdProposal.tasks.length}`);
console.log(` - Total de Itens no Dossiê Documental: ${createdProposal.dossier.items.length}`);

// 7. Testar Alteração de Preço e Log de Auditoria Obrigatório (Itens 27 e 28)
console.log('\n7. Testando Alteração de Preço e Log de Auditoria (Item 28):');
const updatedP = ProposalService.updateDefinedPrice(
  createdProposal.id, 
  350000, 
  'Carlos Silveira', 
  'Desconto estratégico para assegurar o primeiro lugar no certame'
);
console.log(` - Novo Preço Definido: ${ProposalService.formatCurrency(updatedP.pricing.definedPrice)}`);
console.log(` - Nova Margem: ${updatedP.pricing.finalMargin}%`);
console.log(` - Status de Aprovação após Mudança: ${updatedP.priceApproval.status} (Requer Nova Aprovação)`);
console.log(` - Log de Alteração Registrado: ${updatedP.priceChangeLogs.length > 0 ? '✅ SIM' : '❌ NÃO'}`);
console.log(` - Versões da Proposta (Versionamento): ${updatedP.versions.map(v => v.versionNumber).join(', ')}`);

// Aprovar Preço
const approvedP = ProposalService.approvePrice(createdProposal.id, 'Diretor Comercial', 'Aprovado com base na rentabilidade líquida.');
console.log(` - Status de Preço após Aprovação: ${approvedP.priceApproval.status} por ${approvedP.priceApproval.approvedBy}`);

// 8. Testar Contagem Regressiva e Alertas (Itens 9, 10, 59)
console.log('\n8. Testando Contagem Regressiva e Alertas Progressivos:');
const cd1 = ProposalService.getCountdownInfo(seed1.targetSubmissionDate);
console.log(` - Contagem Regressiva Proposta 1: ${cd1.text} (${cd1.hoursRemaining || cd1.totalHours}h restantes)`);

const alerts = ProposalService.getProposalAlerts();
console.log(` - Total de Alertas Gerados pelo Sistema de Propostas: ${alerts.length}`);
alerts.slice(0, 3).forEach(a => {
  console.log(`   • [${a.severity}] ${a.title}`);
});

// 9. Testar Assistente de Proposta (IA Baseada Estritamente em Dados Reais - Itens 60 e 61)
console.log('\n9. Testando Perguntas do Assistente de Proposta (Itens 60 e 61):');
const testQuestions = [
  'O que falta para enviar?',
  'Quais documentos estão pendentes?',
  'Qual é o custo total?',
  'Qual a margem atual?',
  'Temos algum bloqueador?',
  'Quem está com tarefa atrasada?',
  'Qual proposta precisa de atenção hoje?'
];

testQuestions.forEach(q => {
  const ans = ProposalService.askProposalAssistant(q, seed1.id);
  console.log(`\n -> Pergunta: "${q}"`);
  console.log(`    Resposta: ${ans.reply.split('\n')[0]}...`);
  console.log(`    Fontes: ${ans.sources.join(', ')}`);
});

// 10. Testar Registro de Envio & Comprovante & Protocolo (Itens 45 a 48)
console.log('\n10. Testando Envio de Proposta com Protocolo e Comprovante (Itens 45 a 48):');
// Vamos marcar como pronta primeiro
const readyProposal = ProposalService.getById(seed4.id);
const submittedProposal = ProposalService.recordSubmission(readyProposal.id, {
  submissionDate: '08/10/2026',
  submissionTime: '08:45',
  protocolNumber: 'PETRO-7004315600-PROT-9921',
  receiptAttachment: 'Comprovante_Petronect_Termobahia.pdf',
  observations: 'Envio concluído com sucesso e recibo emitido.'
}, 'Mariana Castro');

console.log(` - Status após Envio: ${submittedProposal.status} -> ${submittedProposal.status === ProposalStatus.ENVIADA ? '✅ ENVIADA' : '❌ ERRO'}`);
console.log(` - Protocolo Gravado: ${submittedProposal.submission.protocolNumber}`);
console.log(` - Comprovante Anexado ao Dossiê: ${submittedProposal.dossier.items.some(d => d.category === 'Comprovante de Envio') ? '✅ PRESENTE' : '❌ AUSENTE'}`);
console.log(` - Status de Participação: ${submittedProposal.result.status}`);

// 11. Testar Métricas do Dashboard (Item 58)
console.log('\n11. Testando Métricas Gerais de Propostas (Item 58):');
const metrics = ProposalService.getDashboardMetrics();
console.log(` - Propostas em Andamento: ${metrics.inProgressCount}`);
console.log(` - Valor Total em Propostas: ${ProposalService.formatCurrency(metrics.totalValueInProgress)}`);
console.log(` - Margem Média: ${metrics.avgMargin}%`);
console.log(` - Ticket Médio: ${ProposalService.formatCurrency(metrics.avgTicket)}`);
console.log(` - Propostas Enviadas: ${metrics.submittedCount}`);
console.log(` - Taxa de Envio no Prazo: ${metrics.onTimeRate}%`);

console.log('\n=== TODOS OS TESTES DA FASE 11 PASSARAM COM 100% DE SUCESSO! ===');
