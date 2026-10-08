/**
 * VELLIA LICITAÇÕES — FASE 13: COPILOTO VELLIA
 * ContextBuilder: Construção de Contexto Estruturado e Memória de Sessão (Itens 30 e 31).
 * 
 * Regras:
 * - Unifica os dados recuperados seletivamente pelo DataRetriever.
 * - Mantém memória de curto prazo da conversa (última oportunidade referenciada, última empresa).
 * - Não confunde memória conversacional com dados permanentes de negócio (Item 31).
 * - Aplica PermissionFilter para remover campos financeiros restritos se o perfil não tiver permissão.
 */

import { DataRetriever } from './dataRetriever.js';
import { PermissionFilter, UserRole } from './permissionFilter.js';
import { SourceReferenceService, SourceType } from './sourceReferenceService.js';

export class ContextBuilder {
  /**
   * Constrói o pacote de contexto para o ResponseGenerator
   */
  static buildContext({
    plan,
    userRole = UserRole.GESTAO_COMERCIAL,
    sessionState = {}
  }) {
    const { intent, entities, modules } = plan;
    const contextData = {
      intent,
      entities,
      userRole,
      sources: [],
      data: {}
    };

    // 1. Oportunidades & Decisão
    if (modules.includes('OPPORTUNITIES') || modules.includes('DECISION')) {
      if (entities.targetOpportunityId) {
        const opp = DataRetriever.getOpportunityById(entities.targetOpportunityId);
        if (opp) {
          contextData.data.targetOpportunity = opp;
          contextData.data.decision = DataRetriever.getOpportunityDecision(opp);
          
          contextData.sources.push(
            SourceReferenceService.createReference(
              SourceType.OPPORTUNITY, 
              `Edital #${opp.number || opp.id} (${opp.portal})`,
              { docId: opp.id, actionType: 'OPEN_OPPORTUNITY', actionId: opp.id }
            )
          );

          if (contextData.data.decision) {
            contextData.sources.push(
              SourceReferenceService.createReference(
                SourceType.DECISION_ENGINE, 
                `Matriz de Decisão GO/NO-GO (Score: ${contextData.data.decision.decisionScore}%)`
              )
            );
          }
        }
      } else {
        const opps = DataRetriever.getOpportunities({
          company: entities.company,
          service: entities.service,
          portal: entities.portal,
          state: entities.state,
          minScore: entities.minScore,
          maxDays: entities.maxDays
        });

        // Ordena por prioridade (Score de aderência decrescente e prazo crescente)
        opps.sort((a, b) => (b.score || 0) - (a.score || 0));

        contextData.data.opportunities = opps;
        if (opps.length > 0) {
          const topOpp = entities.isSecondBest && opps.length > 1 ? opps[1] : opps[0];
          contextData.data.primaryOpportunity = topOpp;
          contextData.data.primaryDecision = DataRetriever.getOpportunityDecision(topOpp);

          contextData.sources.push(
            SourceReferenceService.createReference(
              SourceType.OPPORTUNITY, 
              `Edital #${topOpp.number || topOpp.id} - ${topOpp.title}`,
              { docId: topOpp.id, actionType: 'OPEN_OPPORTUNITY', actionId: topOpp.id }
            )
          );
        }
      }
    }

    // 2. Propostas
    if (modules.includes('PROPOSALS')) {
      const proposals = DataRetriever.getProposals({
        company: entities.company,
        hasBlockers: false
      });
      contextData.data.proposals = PermissionFilter.filterFinancialData(proposals, userRole);

      if (entities.targetOpportunityId) {
        const prop = DataRetriever.getProposalByOppNumber(entities.targetOpportunityId);
        if (prop) {
          contextData.data.targetProposal = PermissionFilter.filterFinancialData(prop, userRole);
          contextData.sources.push(
            SourceReferenceService.createReference(
              SourceType.PROPOSAL,
              `Proposta #${prop.id} (${prop.participatingCompany})`,
              { docId: prop.id, actionType: 'OPEN_PROPOSAL', actionId: prop.id }
            )
          );
        }
      }
    }

    // 3. Documentos & Atestados
    if (modules.includes('DOCUMENTS')) {
      const expiringDocs = DataRetriever.getExpiringDocuments(30);
      contextData.data.expiringDocuments = expiringDocs;

      if (entities.service) {
        const certs = DataRetriever.getCertificatesForService(entities.service);
        contextData.data.matchingCertificates = certs;
        if (certs.length > 0) {
          contextData.sources.push(
            SourceReferenceService.createReference(
              SourceType.CERTIFICATE,
              `Atestados de Capacidade Técnica (${certs.length} disponíveis)`
            )
          );
        }
      }

      if (expiringDocs.length > 0) {
        contextData.sources.push(
          SourceReferenceService.createReference(
            SourceType.DOCUMENT_VAULT,
            `Cofre de Documentos (${expiringDocs.length} certidões com vencimento em até 30 dias)`
          )
        );
      }
    }

    // 4. Resultados & Concorrentes
    if (modules.includes('RESULTS')) {
      const resultsData = DataRetriever.getResultsIntelligence('ALL');
      contextData.data.resultsIntelligence = PermissionFilter.filterFinancialData(resultsData, userRole);

      if (entities.competitor) {
        const comp = DataRetriever.getCompetitorData(entities.competitor);
        contextData.data.targetCompetitor = comp;
        if (comp) {
          contextData.sources.push(
            SourceReferenceService.createReference(
              SourceType.COMPETITOR_DATABASE,
              `Base Oficial: ${comp.tradeName || comp.name}`
            )
          );
        }
      }

      contextData.sources.push(
        SourceReferenceService.createReference(
          SourceType.RESULTS_HISTORY,
          `Histórico Oficial (Win Rate: ${resultsData.metrics.winRatePercent}%)`
        )
      );
    }

    // 5. Radar Antecipado (Fase 16)
    if (modules.includes('EARLY_RADAR')) {
      const earlyData = DataRetriever.getEarlyRadarData();
      contextData.data.earlyRadar = earlyData;
      contextData.sources.push(
        SourceReferenceService.createReference(
          SourceType.OPPORTUNITY,
          `Radar Antecipado (${earlyData.clusters.length} oportunidades futuras / PCAs / contratos)`
        )
      );
    }

    // 6. CRM de Relacionamento (Fase 17)
    if (modules.includes('CRM')) {
      const crmData = DataRetriever.getCrmData();
      contextData.data.crm = crmData;
      contextData.sources.push(
        SourceReferenceService.createReference(
          SourceType.OPPORTUNITY,
          `CRM de Relacionamento (${crmData.organizations.length} organizações / ${crmData.contacts.length} contatos)`
        )
      );
    }

    // 7. Automação de Comunicação & Follow-up Assistido (Fase 18)
    if (modules.includes('COMMUNICATIONS')) {
      const commsData = DataRetriever.getCommunicationsData();
      contextData.data.communications = commsData;
      contextData.sources.push(
        SourceReferenceService.createReference(
          SourceType.OPPORTUNITY,
          `Comunicações & Follow-ups (${commsData.followUps.length} follow-ups / ${commsData.outbox.length} mensagens)`
        )
      );
    }

    // 8. Produtividade & Mensageria Real: E-mail e Calendário (Fase 19)
    if (modules.includes('PRODUCTIVITY')) {
      const prodData = DataRetriever.getProductivityData();
      contextData.data.productivity = prodData;
      contextData.sources.push(
        SourceReferenceService.createReference(
          SourceType.OPPORTUNITY,
          `Produtividade Conectada (${prodData.emails.length} e-mails / ${prodData.events.length} reuniões na agenda)`
        )
      );
    }

    // 9. Centro de Comando Executivo, Forecast & Metas (Fase 20)
    if (modules.includes('EXECUTIVE')) {
      const execData = DataRetriever.getExecutiveData();
      contextData.data.executive = execData;
      contextData.sources.push(
        SourceReferenceService.createReference(
          SourceType.RESULTS_HISTORY,
          `Centro de Comando Executivo (Pipeline: R$ ${(execData.pipeline.kpis.grossPipeline / 1000000).toFixed(1)}M | Win Rate: ${execData.pipeline.kpis.winRate}%)`
        )
      );
    }

    // Atualiza estado de memória da sessão (Item 30)
    const updatedSession = { ...sessionState };
    if (contextData.data.targetOpportunity) {
      updatedSession.lastDiscussedOpportunityId = contextData.data.targetOpportunity.id || contextData.data.targetOpportunity.number;
    } else if (contextData.data.primaryOpportunity) {
      updatedSession.lastDiscussedOpportunityId = contextData.data.primaryOpportunity.id || contextData.data.primaryOpportunity.number;
    }

    return {
      contextData,
      updatedSession
    };
  }
}

export default ContextBuilder;
