/**
 * VELLIA LICITAÇÕES — FASE 13: COPILOTO VELLIA
 * DataRetriever: Recuperação Seletiva e Rápida de Dados do Ecossistema (Itens 6 e 51).
 * 
 * Regras:
 * - Evita carregar o banco completo; busca seletivamente apenas os módulos necessários.
 * - Conecta com Oportunidades, Decisão, Propostas, Resultados, Cofre Documental e Editais.
 */

import { OpportunityService } from '../opportunityService.js';
import { DecisionService } from '../decision/decisionService.js';
import { ProposalService } from '../proposal/proposalService.js';
import { ResultsIntelligenceService } from '../results/resultsIntelligenceService.js';
import { DocumentVaultService } from '../vault/documentVaultService.js';
import { EditalAnalysisEngine } from '../edital/editalAnalysisEngine.js';
import { earlyRadarService } from '../earlyradar/earlyRadarService.js';
import { contractMonitoringService } from '../earlyradar/contractMonitoringService.js';
import { crmService } from '../crm/crmService.js';
import { communicationService } from '../communications/communicationService.js';
import { emailIntegrationService } from '../productivity/emailIntegrationService.js';
import { calendarIntegrationService } from '../productivity/calendarIntegrationService.js';
import { productivityIntegrationManager } from '../productivity/productivityIntegrationManager.js';
import { executiveService } from '../executive/executiveService.js';

export class DataRetriever {
  /**
   * Recupera lista de oportunidades com filtros contextuais
   */
  static getOpportunities({ company, service, portal, state, minScore, maxDays }) {
    let list = OpportunityService.listAll();

    if (company && company !== 'TODAS') {
      const cLower = company.toLowerCase();
      list = list.filter(o => 
        (o.recommendedCompany && o.recommendedCompany.toLowerCase().includes(cLower)) ||
        (o.client && o.client.toLowerCase().includes(cLower))
      );
    }

    if (service) {
      const sLower = service.toLowerCase();
      list = list.filter(o => 
        (o.identifiedService && o.identifiedService.toLowerCase().includes(sLower)) ||
        (o.title && o.title.toLowerCase().includes(sLower)) ||
        (o.description && o.description.toLowerCase().includes(sLower))
      );
    }

    if (portal) {
      const pLower = portal.toLowerCase();
      list = list.filter(o => o.portal && o.portal.toLowerCase().includes(pLower));
    }

    if (state) {
      const stLower = state.toLowerCase();
      list = list.filter(o => o.location && o.location.toLowerCase().includes(stLower));
    }

    if (minScore) {
      list = list.filter(o => (o.score || 0) >= minScore);
    }

    if (maxDays !== undefined && maxDays !== null) {
      list = list.filter(o => (o.daysLeft !== undefined ? o.daysLeft <= maxDays : true));
    }

    return list;
  }

  /**
   * Busca oportunidade específica por ID ou número
   */
  static getOpportunityById(idOrNumber) {
    if (!idOrNumber) return null;
    const all = OpportunityService.listAll();
    const str = String(idOrNumber).trim();
    return all.find(o => String(o.id) === str || String(o.number) === str) || null;
  }

  /**
   * Recupera análise completa de decisão GO/NO-GO
   */
  static getOpportunityDecision(opportunity) {
    if (!opportunity) return null;
    return DecisionService.calculateDecision(opportunity);
  }

  /**
   * Recupera lista de propostas em andamento
   */
  static getProposals({ company, status, hasBlockers }) {
    let list = ProposalService.listAll();

    if (company && company !== 'TODAS') {
      const cLower = company.toLowerCase();
      list = list.filter(p => p.participatingCompany && p.participatingCompany.toLowerCase().includes(cLower));
    }

    if (status) {
      list = list.filter(p => p.status === status);
    }

    if (hasBlockers) {
      list = list.filter(p => {
        const r = ProposalService.calculateReadiness(p);
        return r.hasBlockers;
      });
    }

    return list;
  }

  /**
   * Busca proposta por ID ou número de oportunidade
   */
  static getProposalByOppNumber(oppNumber) {
    const all = ProposalService.listAll();
    const str = String(oppNumber);
    return all.find(p => String(p.opportunityNumber) === str || String(p.id) === str) || null;
  }

  /**
   * Recupera documentos com vencimento próximo (Item 25)
   */
  static getExpiringDocuments(maxDays = 30) {
    try {
      const allDocs = DocumentVaultService.listDocuments();
      return allDocs.filter(d => {
        const days = d.daysUntilExpiry;
        return days !== null && days !== undefined && days >= 0 && days <= maxDays;
      }).sort((a, b) => (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999));
    } catch {
      return [];
    }
  }

  /**
   * Recupera atestados técnicos por serviço ou palavra-chave
   */
  static getCertificatesForService(serviceKeyword) {
    try {
      const certs = DocumentVaultService.listAttestations();
      if (!serviceKeyword) return certs;

      const kw = serviceKeyword.toLowerCase();
      return certs.filter(c => 
        (c.object && c.object.toLowerCase().includes(kw)) ||
        (c.serviceDescription && c.serviceDescription.toLowerCase().includes(kw)) ||
        (c.client && c.client.toLowerCase().includes(kw)) ||
        (c.relatedServices && c.relatedServices.some(s => s.toLowerCase().includes(kw)))
      );
    } catch {
      return [];
    }
  }

  /**
   * Recupera resultados históricos e Win Rate
   */
  static getResultsIntelligence(period = 'ALL') {
    ResultsIntelligenceService.initSeedData();
    return {
      metrics: ResultsIntelligenceService.getExecutiveMetrics(period),
      funnel: ResultsIntelligenceService.getCommercialFunnel(period),
      lossBreakdown: ResultsIntelligenceService.getLossReasonsAnalysis(period),
      servicePerformance: ResultsIntelligenceService.getServicePerformance(),
      competitorsRanking: ResultsIntelligenceService.getHeadToHeadRanking(),
      benchmarks: ResultsIntelligenceService.getInternalPriceBenchmarks()
    };
  }

  /**
   * Recupera dados de um concorrente específico
   */
  static getCompetitorData(competitorName) {
    ResultsIntelligenceService.initSeedData();
    const competitors = ResultsIntelligenceService.listCompetitors();
    const h2h = ResultsIntelligenceService.getHeadToHeadRanking();
    const cLower = (competitorName || '').toLowerCase();

    const comp = competitors.find(c => 
      c.name.toLowerCase().includes(cLower) || 
      c.tradeName.toLowerCase().includes(cLower)
    );

    if (!comp) return null;

    const headRecord = h2h.find(h => h.id === comp.id) || {
      totalConfrontations: comp.totalParticipations || 0,
      ourWins: 0,
      theirWins: comp.totalWins || 0,
      avgTheirPrice: null
    };

    return {
      ...comp,
      headRecord
    };
  }

  /**
   * Recupera análise do edital
   */
  static getEditalAnalysis(opportunityId) {
    const analysis = EditalAnalysisEngine.getAnalysis(opportunityId);
    return analysis;
  }

  /**
   * Recupera dados do Radar Antecipado (Fase 16)
   */
  static getEarlyRadarData() {
    return {
      clusters: earlyRadarService.getSignalClusters(),
      pcas: earlyRadarService.getAllPcas(),
      expiringContracts: contractMonitoringService.getAllContracts(),
      buyingPatterns: earlyRadarService.getBuyingPatterns(),
      commercialActions: earlyRadarService.getCommercialActions()
    };
  }

  /**
   * Recupera dados do CRM de Relacionamento (Fase 17)
   */
  static getCrmData() {
    return {
      organizations: crmService.getOrganizations(),
      contacts: crmService.getContacts(),
      interactions: crmService.getInteractions(),
      followUps: crmService.getFollowUps(),
      followUpAlerts: crmService.getFollowUpAlerts(),
      pipelineCards: crmService.getPipelineCards(),
      manualSignals: crmService.getManualSignals()
    };
  }

  /**
   * Recupera dados de Comunicações & Follow-ups Assistidos (Fase 18)
   */
  static getCommunicationsData() {
    return {
      outbox: communicationService.getAllOutbox(),
      followUps: communicationService.getIntelligentFollowUps(),
      metrics: communicationService.getCommunicationMetrics(),
      campaigns: communicationService.getCampaigns(),
      templates: communicationService.getTemplates()
    };
  }

  /**
   * Recupera dados de Produtividade: E-mails sincronizados, Agenda e Integrações (Fase 19)
   */
  static getProductivityData() {
    return {
      emails: emailIntegrationService.getEmails(),
      queue: emailIntegrationService.getEmailQueue(),
      events: calendarIntegrationService.getEvents(),
      agendaToday: calendarIntegrationService.getMyAgendaToday(),
      integrations: productivityIntegrationManager.listIntegrations(),
      metrics: productivityIntegrationManager.getProductivityMetrics()
    };
  }

  /**
   * Recupera dados consolidados do Centro de Comando Executivo, Forecast e Metas (Fase 20)
   */
  static getExecutiveData() {
    return executiveService.getExecutiveDashboardData({ company: 'TODAS' });
  }
}

export default DataRetriever;
