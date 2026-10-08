/**
 * VELLIA LICITAÇÕES — FASE 17
 * crmService.js
 * Fachada central de inteligência do CRM de Relacionamento com Órgãos e Empresas.
 * Constrói a Visão 360°, Painel Comercial, Resumo Semanal e Agenda Integrada.
 */

import { organizationService } from './organizationService.js';
import { contactService } from './contactService.js';
import { interactionService } from './interactionService.js';
import { followUpService } from './followUpService.js';
import { pipelineService } from './pipelineService.js';
import { calculateRelationshipStrength } from './crmModels.js';
import { earlyRadarService } from '../earlyradar/earlyRadarService.js';
import { contractMonitoringService } from '../earlyradar/contractMonitoringService.js';
import { buyingPatternService } from '../earlyradar/buyingPatternService.js';
import { ProposalService } from '../proposal/proposalService.js';
import { ResultsIntelligenceService } from '../results/resultsIntelligenceService.js';

class CrmService {
  // Delegados diretos
  getOrganizations() {
    return organizationService.getAllOrganizations();
  }

  getOrganizationById(id) {
    return organizationService.getOrganizationById(id);
  }

  updateOrganization(id, patch) {
    return organizationService.updateOrganization(id, patch);
  }

  toggleFavoriteOrg(id) {
    return organizationService.toggleFavorite(id);
  }

  getContacts(organizationId) {
    if (organizationId) return contactService.getContactsByOrganization(organizationId);
    return contactService.getAllContacts();
  }

  addContact(data) {
    return contactService.addContact(data);
  }

  getInteractions(organizationId) {
    if (organizationId) return interactionService.getInteractionsByOrganization(organizationId);
    return interactionService.getAllInteractions();
  }

  addInteraction(data) {
    return interactionService.addInteraction(data);
  }

  createInteraction(data) {
    return this.addInteraction(data);
  }

  getFollowUps() {
    return followUpService.getAllFollowUps();
  }

  getFollowUpAlerts() {
    return followUpService.getFollowUpAlerts();
  }

  addFollowUp(data) {
    return followUpService.addFollowUp(data);
  }

  createFollowUp(data) {
    return this.addFollowUp(data);
  }

  updateFollowUpStatus(id, newStatus, patch) {
    return followUpService.updateStatus(id, newStatus, patch);
  }

  createFollowUpFromRadar(signal) {
    return followUpService.createFromRadarSignal(signal);
  }

  getPipelineCards() {
    return pipelineService.getAllPipelineCards();
  }

  updatePipelineCardStage(cardId, newStage) {
    return pipelineService.updateCardStage(cardId, newStage);
  }

  linkPipelineToTender(cardId, tenderId) {
    return pipelineService.linkToOfficialTender(cardId, tenderId);
  }

  addPipelineCard(cardData) {
    return pipelineService.addPipelineCard(cardData);
  }

  getManualSignals() {
    return interactionService.getAllManualSignals();
  }

  addManualSignal(signalData) {
    return interactionService.addManualSignal(signalData);
  }

  getPortfolios() {
    return interactionService.getAllPortfolios();
  }

  registerSentPortfolio(data) {
    return interactionService.registerSentPortfolio(data);
  }

  /**
   * VISÃO 360° DA ORGANIZAÇÃO (Organization 360 - Requisito Item 5, 39 e 40)
   * Consolida dados institucionais, mapa de relacionamento, timeline,
   * sinais do Radar Antecipado, contratos a vencer, propostas e métricas históricas.
   */
  getOrganization360(organizationId) {
    const org = organizationService.getOrganizationById(organizationId);
    if (!org) return null;

    const contacts = contactService.getContactsByOrganization(organizationId);
    const relationshipMap = contactService.getRelationshipMap(organizationId);
    const interactions = interactionService.getInteractionsByOrganization(organizationId);
    const followUps = followUpService.getAllFollowUps().filter(f => f.organizationId === organizationId);
    const pipelineCards = pipelineService.getAllPipelineCards().filter(p => p.organizationId === organizationId);
    const manualSignals = interactionService.getAllManualSignals().filter(s => s.organizationId === organizationId);
    const portfolios = interactionService.getAllPortfolios().filter(p => p.organizationId === organizationId);

    // Integração com Radar Antecipado (Fase 16)
    const organQuery = org.name.replace(/Petrobras|UFPE|COMPESA|Porto de Suape|Chesf/i, (m) => m).trim();
    const organPattern = buyingPatternService.getPatternByOrgan(org.name) || buyingPatternService.getPatternByOrgan(org.id);
    const expiringContracts = contractMonitoringService.findMatchingContracts(org.name, '');
    const pcas = earlyRadarService.getAllPcas().filter(p => 
      p.organ.toLowerCase().includes(org.name.toLowerCase()) || 
      org.name.toLowerCase().includes(p.organShort.toLowerCase())
    );

    // Cálculo da Força do Relacionamento (Item 27 e 28)
    const lastInteraction = interactions[0];
    let daysSinceLast = 999;
    if (lastInteraction && lastInteraction.date) {
      const diffTime = Math.abs(new Date('2026-10-08') - new Date(lastInteraction.date));
      daysSinceLast = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const meetings = interactions.filter(i => i.type === 'Reunião' || i.type === 'Videoconferência' || i.type === 'Visita');
    const strengthResult = calculateRelationshipStrength({
      interactionsCount: interactions.length,
      daysSinceLastInteraction: daysSinceLast,
      meetingsCount: meetings.length,
      hasCommercialHistory: org.historicalVolume > 0
    });

    // Próxima Melhor Ação Recomendada (Next Best Action - Item 41)
    let nextBestAction = 'Manter rotina de follow-up e acompanhar publicações oficiais.';
    if (expiringContracts.length > 0 && expiringContracts[0].estimatedDaysRemaining <= 45) {
      nextBestAction = `Contrato de "${expiringContracts[0].relatedService}" vence em ${expiringContracts[0].estimatedDaysRemaining} dias. Recomenda-se validar acervo de CATs e contatar o gestor técnico.`;
    } else if (pcas.length > 0) {
      nextBestAction = `Planejamento (PCA) identificado para "${pcas[0].targetService}". Agendar reunião institucional prévia antes da publicação do edital.`;
    } else if (daysSinceLast > 30) {
      nextBestAction = `Há mais de 30 dias sem interação com este cliente estratégico. Recomenda-se envio de apresentação institucional atualizada.`;
    }

    return {
      organization: org,
      contactsCount: contacts.length,
      contacts,
      relationshipMap,
      interactions,
      followUps,
      pipelineCards,
      manualSignals,
      portfolios,
      earlyRadar: {
        pattern: organPattern,
        expiringContracts,
        pcas
      },
      relationshipStrength: strengthResult,
      nextBestAction,
      winRate: organPattern ? organPattern.internalWinRate : 35.0,
      historicalVolume: org.historicalVolume
    };
  }

  /**
   * PAINEL COMERCIAL EXECUTIVO (Item 45)
   */
  getExecutiveDashboardMetrics() {
    const orgs = organizationService.getAllOrganizations();
    const followUpAlerts = followUpService.getFollowUpAlerts();
    const interactions = interactionService.getAllInteractions();
    const pipelineCards = pipelineService.getAllPipelineCards();
    const manualSignals = interactionService.getAllManualSignals();

    return {
      strategicOrgsCount: orgs.filter(o => o.strategicClassification === 'Estratégico').length,
      followUpsTodayCount: followUpAlerts.today.length,
      followUpsOverdueCount: followUpAlerts.overdue.length,
      totalPipelinePotentialVolume: pipelineCards.reduce((acc, c) => acc + (c.potentialValue || 0), 0),
      activeInteractionsCount: interactions.length,
      meetingsCompletedCount: interactions.filter(i => i.type === 'Reunião' || i.type === 'Videoconferência' || i.type === 'Visita').length,
      manualSignalsCount: manualSignals.length
    };
  }

  /**
   * RESUMO COMERCIAL SEMANAL (Item 46)
   */
  getWeeklyCommercialSummary() {
    const interactions = interactionService.getAllInteractions();
    const followUps = followUpService.getAllFollowUps();
    const pipelineCards = pipelineService.getAllPipelineCards();
    const alerts = followUpService.getFollowUpAlerts();

    return {
      period: 'Semana de 05 a 11 de Outubro de 2026',
      interactionsThisWeek: interactions.filter(i => i.date >= '2026-10-01').length,
      meetingsConducted: interactions.filter(i => (i.type === 'Reunião' || i.type === 'Visita') && i.date >= '2026-10-01').length,
      completedFollowUps: followUps.filter(f => f.status === 'Concluído').length,
      pendingCriticalFollowUps: alerts.today.length + alerts.overdue.length,
      priorityOrganizations: [
        { name: 'Petrobras RNEST', reason: 'Vencimento iminente de contrato de ETE em 38 dias.', owner: 'Roberto Mendes' },
        { name: 'UFPE', reason: 'Planejamento oficial de monitoramento de chaminés no 4º trimestre.', owner: 'Camila Torres' },
        { name: 'COMPESA', reason: 'Pesquisa mercadológica de calibração NR-13 para novo certame.', owner: 'Flávio Caldas' },
        { name: 'Porto de Suape', reason: 'Pregão aberto de resíduos perigosos já em fase de proposta.', owner: 'Roberto Mendes' }
      ]
    };
  }

  /**
   * VISÃO "MINHA CARTEIRA" (Item 60)
   */
  getMyPortfolio(responsibleName = 'Roberto Mendes') {
    const orgs = organizationService.getAllOrganizations().filter(o => 
      o.accountOwner.includes(responsibleName) || (o.coOwners && o.coOwners.some(c => c.includes(responsibleName)))
    );
    const followUps = followUpService.getAllFollowUps().filter(f => f.responsible.includes(responsibleName));
    const pipelineCards = pipelineService.getAllPipelineCards().filter(p => p.responsible.includes(responsibleName));

    return {
      responsible: responsibleName,
      organizations: orgs,
      followUps,
      pipelineCards,
      overdueFollowUps: followUps.filter(f => f.status === 'Atrasado')
    };
  }
}

export const crmService = new CrmService();
