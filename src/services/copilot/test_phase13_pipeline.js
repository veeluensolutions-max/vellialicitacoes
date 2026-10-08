/**
 * TESTE DE VALIDAÇÃO DA FASE 13 — VELLIA LICITAÇÕES
 * Valida a arquitetura completa do Copiloto Vellia (Vellia Intelligence)
 * Conforme itens 3, 5, 8, 9, 10, 11, 12, 30, 46, 49, 50, 59, 60, 61 e 62.
 */

import { CopilotService } from './copilotService.js';
import { QueryPlanner, CopilotIntent } from './queryPlanner.js';
import { PermissionFilter, UserRole } from './permissionFilter.js';
import { ConversationService } from './conversationService.js';
import { AuditService } from './auditService.js';

console.log('====================================================');
console.log('INICIANDO BATERIA DE TESTES — FASE 13 (COPILOTO VELLIA)');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Validar QueryPlanner e Intenções (Item 5)
console.log('--- 1. Validação de Intenções e Entidades ---');
const plan1 = QueryPlanner.plan('Qual é nossa melhor oportunidade hoje?');
assert(plan1.intent === CopilotIntent.OPPORTUNITY_SEARCH, 'Detectar OPPORTUNITY_SEARCH para "melhor oportunidade"');

const plan2 = QueryPlanner.plan('Quais licitações estão encerrando esta semana?');
assert(plan2.intent === CopilotIntent.DEADLINE_QUERY, 'Detectar DEADLINE_QUERY para encerramento de prazos');

const plan3 = QueryPlanner.plan('Quais documentos e certidões estão vencendo?');
assert(plan3.intent === CopilotIntent.DOCUMENT_QUERY, 'Detectar DOCUMENT_QUERY para documentos vencendo');

const plan4 = QueryPlanner.plan('Temos atestado para operação de ETE?');
assert(plan4.intent === CopilotIntent.CERTIFICATE_QUERY, 'Detectar CERTIFICATE_QUERY para atestados');
assert(plan4.entities.service === 'Operação de ETE', 'Extrair entidade serviço ETE');

const plan5 = QueryPlanner.plan('Vale a pena participar da oportunidade 7004128831?');
assert(plan5.intent === CopilotIntent.GO_NOGO_QUERY, 'Detectar GO_NOGO_QUERY para "vale a pena participar"');
assert(plan5.entities.targetOpportunityId === '7004128831', 'Extrair ID de oportunidade 7004128831');

const plan6 = QueryPlanner.plan('Quem é nosso maior concorrente contra nós?');
assert(plan6.intent === CopilotIntent.COMPETITOR_QUERY, 'Detectar COMPETITOR_QUERY para concorrentes');

const plan7 = QueryPlanner.plan('Qual nosso Win Rate e por que estamos perdendo?');
assert(plan7.intent === CopilotIntent.PERFORMANCE_QUERY, 'Detectar PERFORMANCE_QUERY para taxa de vitória');

const plan8 = QueryPlanner.plan('Compare a oportunidade A com a B');
assert(plan8.intent === CopilotIntent.OPPORTUNITY_COMPARE, 'Detectar OPPORTUNITY_COMPARE para comparação');

const plan9 = QueryPlanner.plan('Gerar briefing de hoje');
assert(plan9.intent === CopilotIntent.BRIEFING_TODAY, 'Detectar BRIEFING_TODAY para resumo do dia');

// 2. Validar Execução Multimódulo da Pergunta Principal (Item 8)
console.log('\n--- 2. Execução da Pergunta Executiva Principal ---');
const resBest = CopilotService.ask({
  query: 'Qual é nossa melhor oportunidade hoje?',
  userRole: UserRole.GESTAO_COMERCIAL
});

assert(resBest.message !== null, 'Copilot deve retornar mensagem estruturada');
assert(resBest.message.title.includes('Melhor Oportunidade'), 'Título deve indicar melhor oportunidade');
assert(resBest.message.facts.length > 0, 'Deve conter fatos estruturados');
assert(resBest.message.estimates.length > 0, 'Deve conter estimativas identificadas');
assert(resBest.message.recommendations.length > 0, 'Deve conter recomendações');
assert(resBest.message.sources.length > 0, 'Deve conter fontes internas identificadas (Item 9)');
assert(resBest.message.actions.length > 0, 'Deve oferecer atalhos de ação (Item 32)');

// 3. Validar Controle de Acesso e Permissões (Itens 49, 50, 60)
console.log('\n--- 3. Teste de Permissões e Segurança de Dados ---');
// Usuário Comercial (com acesso financeiro)
const resFinanceManager = CopilotService.ask({
  query: 'Quanto estamos cobrando e qual a margem de preços?',
  userRole: UserRole.GESTAO_COMERCIAL
});
assert(
  resFinanceManager.message.facts.some(f => f.includes('R$') || f.includes('Ticket médio')),
  'Gestor comercial deve ter acesso a parâmetros financeiros'
);

// Usuário Operacional (sem acesso financeiro)
const resOperacional = CopilotService.ask({
  query: 'Quanto estamos cobrando e qual a margem de preços?',
  userRole: UserRole.OPERACIONAL
});
assert(
  resOperacional.message.facts.some(f => f.includes('restrita') || f.includes('AVISO DE SEGURANÇA')),
  'Usuário operacional deve receber aviso de restrição de segurança sem expor margem líquida'
);

// 4. Validar Ausência de Dados (Item 10 e 61 - NUNCA INVENTAR)
console.log('\n--- 4. Teste de Ausência de Dados (Sem Alucinações) ---');
const resNotFound = CopilotService.ask({
  query: 'Existe alguma oportunidade de usina nuclear em Fernando de Noronha?',
  userRole: UserRole.GESTAO_COMERCIAL
});
assert(
  resNotFound.message.summary.includes('Não encontrei') || resNotFound.message.title.includes('Nenhuma Oportunidade'),
  'Quando dado inexiste, Copilot deve responder claramente que não encontrou sem inventar'
);

// 5. Validar Memória de Conversa e Contexto Multi-Turn (Itens 30 e 62)
console.log('\n--- 5. Teste de Memória da Conversa e Contexto ---');
const conv = ConversationService.createConversation('Teste Multi-Turn');

const turn1 = CopilotService.ask({
  query: 'Qual é nossa melhor oportunidade hoje?',
  conversationId: conv.id
});
assert(turn1.message.targetOpportunityId !== null, 'Turno 1 deve guardar ID da oportunidade referenciada');

const turn2 = CopilotService.ask({
  query: 'E qual o prazo dela?',
  conversationId: conv.id
});
assert(
  turn2.message.facts.some(f => f.includes('dia(s)') || f.includes('Prazo')),
  'Turno 2 deve responder o prazo herdando a oportunidade do Turno 1 sem pedir repetição'
);

// 6. Validar Briefing Automático do Dia (Itens 35 a 38)
console.log('\n--- 6. Teste do Briefing Executivo do Dia ---');
const briefing = CopilotService.generateDailyBriefing({ userRole: UserRole.DIRETORIA });
assert(briefing.message.title === 'Briefing Executivo de Hoje', 'Título do briefing deve estar correto');
assert(briefing.message.priorities && briefing.message.priorities.length > 0, 'Briefing deve listar prioridades hierarquizadas');

// 7. Validar Command Center Data (Item 39)
console.log('\n--- 7. Teste de Dados do Command Center ---');
const cmdData = CopilotService.getCommandCenterData({ userRole: UserRole.DIRETORIA });
assert(cmdData.agentStatus.active === true, 'Command Center: Agente ativo');
assert(cmdData.kpis.monitoredOpportunities > 0, 'Command Center: Oportunidades monitoradas');
assert(cmdData.kpis.winRatePercent > 0, 'Command Center: Win Rate');
assert(cmdData.recentAlerts.length > 0, 'Command Center: Alertas recentes');

// 8. Validar Registro de Auditoria e Feedback (Itens 46 e 47)
console.log('\n--- 8. Teste de Auditoria e Feedback ---');
const allLogs = AuditService.listLogs();
assert(allLogs.length > 0, 'Auditoria deve registrar consultas realizadas');
const lastLogId = allLogs[0].id;
const feedbackOk = CopilotService.recordFeedback(lastLogId, true, 'Resposta muito precisa e rápida!');
assert(feedbackOk === true, 'Feedback útil deve ser registrado com sucesso');

// 9. Validar Histórico Agrupado de Conversas (Item 42, 43, 44)
console.log('\n--- 9. Teste de Histórico de Conversas e Favoritos ---');
const grouped = ConversationService.getGroupedConversations();
assert(grouped.today.length > 0, 'Conversas de hoje devem estar presentes no grupo');
const favStatus = ConversationService.toggleFavorite(conv.id);
assert(favStatus === true, 'Conversa deve ser favoritada com sucesso');

console.log('\n====================================================');
console.log(`TODOS OS TESTES CONCLUÍDOS COM SUCESSO: ${passedTests}/${totalTests}`);
console.log('====================================================\n');
