/**
 * VELLIA LICITAÇÕES — FASE 13: COPILOTO VELLIA
 * CopilotService: Orquestrador Central da Central de Inteligência (Vellia Intelligence)
 * 
 * "Pergunte ao Vellia. Decida com dados."
 */

import { QueryPlanner } from './queryPlanner.js';
import { ContextBuilder } from './contextBuilder.js';
import { ResponseGenerator, ResponseMode } from './responseGenerator.js';
import { ConversationService } from './conversationService.js';
import { AuditService } from './auditService.js';
import { UserRole } from './permissionFilter.js';
import { DataRetriever } from './dataRetriever.js';

export class CopilotService {
  /**
   * Executa uma consulta completa no Copiloto Vellia
   */
  static ask({
    query = '',
    conversationId = null,
    userRole = UserRole.GESTAO_COMERCIAL,
    mode = ResponseMode.EXECUTIVE,
    userName = 'Operador Comercial'
  }) {
    if (!query || query.trim() === '') {
      throw new Error('A pergunta não pode estar vazia.');
    }

    // 1. Obter ou criar conversa
    let conversation = conversationId ? ConversationService.getById(conversationId) : null;
    if (!conversation) {
      conversation = ConversationService.getActiveConversation();
    }

    // 2. Extrair histórico recente de contexto da sessão
    const recentMessages = conversation.messages || [];
    const sessionContext = {
      lastDiscussedOpportunityId: null
    };

    // Procura no histórico recente alguma oportunidade citada
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      if (msg.targetOpportunityId) {
        sessionContext.lastDiscussedOpportunityId = msg.targetOpportunityId;
        break;
      }
    }

    // 3. Planejar consulta (QueryPlanner)
    const plan = QueryPlanner.plan(query, sessionContext);

    // 4. Construir contexto e buscar dados seletivos (DataRetriever + ContextBuilder + PermissionFilter)
    const { contextData, updatedSession } = ContextBuilder.buildContext({
      plan,
      userRole,
      sessionState: sessionContext
    });

    // 5. Gerar resposta executiva (ResponseGenerator)
    const responsePayload = ResponseGenerator.generate({
      plan,
      contextData,
      mode,
      userRole
    });

    // 6. Registrar interação no log de auditoria (AuditService)
    const auditId = AuditService.logInteraction({
      user: userName,
      role: userRole,
      query,
      intent: plan.intent,
      modulesConsulted: plan.modules,
      responseSummary: responsePayload.summary,
      actionsAvailable: responsePayload.actions || []
    });

    // 7. Persistir mensagens na conversa (ConversationService)
    ConversationService.addMessage(conversation.id, {
      sender: 'user',
      text: query
    });

    const botMessage = ConversationService.addMessage(conversation.id, {
      sender: 'assistant',
      title: responsePayload.title,
      summary: responsePayload.summary,
      facts: responsePayload.facts,
      estimates: responsePayload.estimates,
      recommendations: responsePayload.recommendations,
      priorities: responsePayload.priorities || null,
      table: responsePayload.table || null,
      badge: responsePayload.badge || null,
      sources: responsePayload.sources || [],
      actions: responsePayload.actions || [],
      auditId,
      intent: plan.intent,
      targetOpportunityId: updatedSession.lastDiscussedOpportunityId
    });

    return {
      conversationId: conversation.id,
      message: botMessage,
      auditId
    };
  }

  /**
   * Gera o briefing executivo do dia diretamente (Itens 35 e 36)
   */
  static generateDailyBriefing({ userRole = UserRole.GESTAO_COMERCIAL, userName = 'Diretoria' } = {}) {
    return this.ask({
      query: 'Gerar briefing de hoje',
      userRole,
      userName,
      mode: ResponseMode.EXECUTIVE
    });
  }

  /**
   * Consolida dados para visualização em modo Command Center (Item 39)
   */
  static getCommandCenterData({ userRole = UserRole.GESTAO_COMERCIAL } = {}) {
    const opps = DataRetriever.getOpportunities({});
    const criticalOpps = opps.filter(o => (o.score || 0) >= 85 || (o.daysLeft !== undefined && o.daysLeft <= 5));
    const proposals = DataRetriever.getProposals({});
    const expiringDocs = DataRetriever.getExpiringDocuments(30);
    const resultsData = DataRetriever.getResultsIntelligence('ALL');

    return {
      agentStatus: {
        active: true,
        portal: 'Petronect Público',
        frequency: 'Varredura automática contínua',
        lastSync: 'Há 12 minutos'
      },
      kpis: {
        monitoredOpportunities: opps.length,
        criticalCount: criticalOpps.length,
        activeProposalsCount: proposals.length,
        expiringDocsCount: expiringDocs.length,
        winRatePercent: resultsData.metrics.winRatePercent,
        totalWonValue: userRole === UserRole.OPERACIONAL ? null : resultsData.metrics.totalWonValue
      },
      topCriticalOpportunities: criticalOpps.slice(0, 3),
      urgentProposals: proposals.slice(0, 3),
      expiringDocuments: expiringDocs.slice(0, 3),
      recentAlerts: [
        { id: 'al-1', title: 'Edital 7004128831 com encerramento em 2 dias', severity: 'Alta' },
        { id: 'al-2', title: 'Certidão Negativa Federal vence em 14 dias', severity: 'Média' },
        { id: 'al-3', title: 'Proposta #018 aguardando aprovação de preço', severity: 'Alta' }
      ]
    };
  }

  /**
   * Registra feedback sobre utilidade da resposta (Item 47)
   */
  static recordFeedback(auditId, isHelpful, comment = '') {
    return AuditService.recordFeedback(auditId, isHelpful, comment);
  }

  /**
   * Lista conversas agrupadas
   */
  static getGroupedConversations() {
    return ConversationService.getGroupedConversations();
  }

  /**
   * Cria nova conversa
   */
  static createNewConversation(title) {
    return ConversationService.createConversation(title);
  }

  /**
   * Alterna favorito
   */
  static toggleFavorite(conversationId) {
    return ConversationService.toggleFavorite(conversationId);
  }

  /**
   * Arquiva conversa
   */
  static archiveConversation(conversationId) {
    return ConversationService.archiveConversation(conversationId);
  }
}

export default CopilotService;
