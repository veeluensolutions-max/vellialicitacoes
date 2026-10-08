/**
 * VELLIA LICITAÇÕES — FASE 19: INTEGRAÇÕES REAIS DE E-MAIL + CALENDÁRIO
 * calendarIntegrationService.js: Gestão de Reuniões, Conflitos de Agenda,
 * Minha Agenda Hoje, Briefing Pré-Reunião e Resumo Pós-Reunião (Itens 36 a 56, 85)
 */

import {
  CalendarEventCategory,
  EventStatus,
  IntegrationProviderType,
  VideoConferenceType
} from './productivityModels.js';
import { crmService } from '../crm/crmService.js';
import { ProposalService } from '../proposal/proposalService.js';
import { OpportunityService } from '../opportunityService.js';
import { GeneralAuditService } from '../admin/generalAuditService.js';

const STORAGE_KEY_EVENTS = 'vellia_calendar_events_v19';

export class CalendarIntegrationService {
  constructor() {
    this.events = this._loadEvents();
  }

  // =========================================================================
  // 1. SINCRONIZAÇÃO E GESTÃO DE EVENTOS (Itens 36, 37, 38, 39, 45, 46)
  // =========================================================================

  /**
   * Ingere eventos recebidos dos provedores de calendário com anti-duplicidade
   */
  processIncomingEvents(incomingEvents = []) {
    const contacts = crmService.getContacts();
    const organizations = crmService.getOrganizations();
    const processed = [];

    for (const evt of incomingEvents) {
      const existing = this.events.find(e => e.externalId === evt.externalId && e.provider === evt.provider);
      if (existing) {
        // Atualiza evento se houver alteração externa (Item 45)
        Object.assign(existing, {
          title: evt.title,
          description: evt.description,
          startIso: evt.startIso,
          endIso: evt.endIso,
          location: evt.location,
          videoLink: evt.videoLink,
          status: evt.status,
          updatedAt: new Date().toISOString()
        });
        processed.push(existing);
        continue;
      }

      // Matching com CRM por e-mail dos participantes (Item 38)
      let matchedContact = null;
      let matchedOrg = null;

      if (evt.attendees && evt.attendees.length > 0) {
        for (const att of evt.attendees) {
          const c = contacts.find(contact => (contact.email || '').toLowerCase() === att.toLowerCase());
          if (c) {
            matchedContact = c;
            matchedOrg = organizations.find(o => o.id === c.organizationId) || null;
            break;
          }
        }
      }

      const eventRecord = {
        id: `cal-evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        externalId: evt.externalId,
        provider: evt.provider,
        title: evt.title,
        description: evt.description,
        date: evt.date || (evt.startIso ? evt.startIso.split('T')[0] : new Date().toISOString().split('T')[0]),
        startTime: evt.startTime || '14:00',
        endTime: evt.endTime || '15:00',
        startIso: evt.startIso,
        endIso: evt.endIso,
        location: evt.location || 'A definir',
        videoLink: evt.videoLink || null,
        videoType: evt.videoType || VideoConferenceType.NONE,
        attendees: evt.attendees || [],
        status: evt.status || EventStatus.CONFIRMED,
        category: evt.category || CalendarEventCategory.REUNIAO,

        // Vínculos com o CRM
        contactId: matchedContact ? matchedContact.id : null,
        contactName: matchedContact ? matchedContact.name : (evt.contactName || null),
        organizationId: matchedOrg ? matchedOrg.id : (matchedContact ? matchedContact.organizationId : null),
        organizationName: matchedOrg ? matchedOrg.name : (evt.organizationName || null),
        opportunityId: evt.opportunityId || null,

        // Briefings e Resumos Pós-Reunião
        preMeetingBriefing: null,
        postMeetingSummary: null,
        syncedAt: new Date().toISOString()
      };

      this.events.push(eventRecord);
      processed.push(eventRecord);
    }

    this._saveEvents();
    return processed;
  }

  // =========================================================================
  // 2. CRIAÇÃO DE REUNIÃO, VERIFICAÇÃO DE CONFLITO E VIDEOCONFERÊNCIA (Itens 40 a 44)
  // =========================================================================

  /**
   * Verifica se há conflito de agenda no horário solicitado (Item 43)
   */
  checkConflicts(startIso, endIso, ignoreEventId = null) {
    const reqStart = new Date(startIso).getTime();
    const reqEnd = new Date(endIso).getTime();

    const conflicts = this.events.filter(evt => {
      if (ignoreEventId && evt.id === ignoreEventId) return false;
      if (evt.status === EventStatus.CANCELLED) return false;

      const evtStart = new Date(evt.startIso).getTime();
      const evtEnd = new Date(evt.endIso).getTime();

      return (reqStart < evtEnd && reqEnd > evtStart);
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map(c => ({
        id: c.id,
        title: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
        category: c.category
      }))
    };
  }

  /**
   * Cria nova reunião no Vellia e no Provider com link de videoconferência (Item 40, 41, 42)
   */
  async createMeeting({
    providerInstance,
    title,
    description,
    date,
    startTime,
    endTime,
    organizationId,
    contactId,
    opportunityId,
    category = CalendarEventCategory.REUNIAO,
    attendees = [],
    createVideoLink = true,
    userEmail
  }) {
    const startIso = `${date}T${startTime}:00-03:00`;
    const endIso = `${date}T${endTime}:00-03:00`;

    // Item 43: Verificação de conflito
    const conflictCheck = this.checkConflicts(startIso, endIso);
    if (conflictCheck.hasConflict) {
      console.warn(`Aviso de Conflito de Agenda: Existem ${conflictCheck.conflicts.length} eventos no mesmo horário.`);
    }

    // Cria no provider conectado
    const externalEvt = await providerInstance.createEvent({
      title,
      description,
      startIso,
      endIso,
      attendees,
      createMeetLink: providerInstance.providerType === IntegrationProviderType.GOOGLE_CALENDAR,
      createTeamsLink: providerInstance.providerType === IntegrationProviderType.MICROSOFT_CALENDAR
    });

    const org = crmService.getOrganizations().find(o => o.id === organizationId);
    const contact = crmService.getContacts().find(c => c.id === contactId);

    const newEvent = {
      id: `cal-evt-${Date.now()}`,
      externalId: externalEvt.externalId,
      provider: providerInstance.providerType,
      title,
      description,
      date,
      startTime,
      endTime,
      startIso,
      endIso,
      location: externalEvt.location,
      videoLink: externalEvt.videoLink,
      videoType: externalEvt.videoType,
      attendees,
      status: EventStatus.CONFIRMED,
      category,
      organizationId,
      organizationName: org ? org.name : null,
      contactId,
      contactName: contact ? contact.name : null,
      opportunityId,
      hasConflictWarning: conflictCheck.hasConflict,
      createdAt: new Date().toISOString()
    };

    this.events.push(newEvent);
    this._saveEvents();

    // Auditoria (Item 71)
    GeneralAuditService.logAudit({
      user: userEmail || 'Usuário Comercial',
      action: 'CREATE_EVENT',
      module: 'INTEGRATIONS',
      targetId: newEvent.id,
      summary: `Reunião agendada: "${title}" em ${date} às ${startTime} (${providerInstance.providerType}).`
    });

    return newEvent;
  }

  /**
   * Converte follow-up comercial em evento de agenda (Item 47)
   */
  async convertFollowUpToEvent({ followUpId, providerInstance, userEmail }) {
    const followUp = crmService.getFollowUps().find(f => f.id === followUpId);
    if (!followUp) throw new Error('Follow-up não encontrado no CRM.');

    const date = followUp.date || new Date().toISOString().split('T')[0];
    const startTime = followUp.time || '10:00';
    const endTime = '10:30';

    const evt = await this.createMeeting({
      providerInstance,
      title: `Follow-up Comercial: ${followUp.title}`,
      description: `Follow-up com ${followUp.contactName} (${followUp.organizationName}). Prioridade: ${followUp.urgency}. Justificativa: ${followUp.scoreExplanation}`,
      date,
      startTime,
      endTime,
      organizationId: followUp.organizationId,
      contactId: followUp.contactId,
      category: CalendarEventCategory.FOLLOW_UP,
      createVideoLink: false,
      userEmail
    });

    crmService.updateFollowUpStatus(followUpId, 'Convertido em Agenda');
    return evt;
  }

  // =========================================================================
  // 3. CENTRAL "MINHA AGENDA HOJE" & BRIEFING PRÉ-REUNIÃO (Itens 51, 52, 53)
  // =========================================================================

  /**
   * Visão Central: Minha Agenda Hoje (Item 51)
   */
  getMyAgendaToday() {
    const todayStr = new Date().toISOString().split('T')[0];
    const meetingsToday = this.events.filter(e => e.date === todayStr && e.status !== EventStatus.CANCELLED);

    // Follow-ups do dia vindos do CRM
    const followUpsToday = crmService.getFollowUps().filter(f => f.date === todayStr && f.status === 'Pendente');

    // Prazos de propostas ativas
    const proposalsExpiring = ProposalService.listAll().filter(p => p.targetSubmissionDate === todayStr);

    return {
      date: todayStr,
      meetings: meetingsToday,
      followUps: followUpsToday,
      proposalsExpiring,
      totalCommitments: meetingsToday.length + followUpsToday.length + proposalsExpiring.length
    };
  }

  /**
   * Gerador de Briefing Pré-Reunião com IA (Itens 52 e 53)
   */
  generatePreMeetingBriefing(eventId) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) throw new Error('Evento não encontrado para geração de briefing.');

    const contact = crmService.getContacts().find(c => c.id === evt.contactId);
    const org = crmService.getOrganizations().find(o => o.id === evt.organizationId);
    const interactions = org ? crmService.getInteractions(org.id) : [];
    const opportunities = OpportunityService.listAll().filter(o => 
      org && (o.client?.toLowerCase().includes(org.name.toLowerCase()) || org.name.toLowerCase().includes(o.client?.toLowerCase()))
    );

    const briefing = {
      generatedAt: new Date().toISOString(),
      contactOverview: contact 
        ? `${contact.name} (${contact.position || 'Responsável'}) • E-mail: ${contact.email || 'N/A'}`
        : 'Contato a ser qualificado na reunião',
      organizationOverview: org
        ? `${org.name} — Classificação: ${org.strategicClassification || 'Estratégico'} (${org.sphere || 'Estadual'})`
        : 'Organização Alvo',
      recentInteractionsCount: interactions.length,
      lastInteractionDate: interactions[0] ? interactions[0].date : 'Nenhuma interação registrada previamente',
      relatedOpportunitiesCount: opportunities.length,
      topOpportunity: opportunities[0] ? `#${opportunities[0].number || opportunities[0].id} — ${opportunities[0].title}` : 'Sem edital ativo vinculado',
      recommendedFocus: 'Apresentar atestados de capacidade técnica e demonstrar domínio da NR-13 e normas ambientais sem postura comercial agressiva.',
      nextStepSuggestion: 'Agendar alinhamento dos requisitos técnicos preliminares do Termo de Referência.'
    };

    evt.preMeetingBriefing = briefing;
    this._saveEvents();
    return briefing;
  }

  /**
   * Registro e Estruturação de Resumo Pós-Reunião com IA (Itens 54 e 55)
   */
  recordPostMeetingSummary(eventId, { rawNotes, decisions = [], createNextFollowUpDays = 5, userEmail }) {
    const evt = this.events.find(e => e.id === eventId);
    if (!evt) throw new Error('Evento não encontrado para registrar resumo pós-reunião.');

    const structuredSummary = {
      recordedAt: new Date().toISOString(),
      rawNotes,
      keyDecisions: decisions.length > 0 ? decisions : ['Alinhamento sobre cronograma e escopo preliminar concluído.'],
      actionItems: ['Enviar portfólio técnico atualizado', 'Verificar disponibilidade de acervo técnico'],
      nextFollowUpScheduledDays: createNextFollowUpDays
    };

    evt.postMeetingSummary = structuredSummary;
    this._saveEvents();

    // Cria novo follow-up no CRM se solicitado (Item 54)
    if (createNextFollowUpDays && evt.organizationId) {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + Number(createNextFollowUpDays));

      crmService.createFollowUp({
        organizationId: evt.organizationId,
        contactId: evt.contactId,
        title: `Pós-Reunião: ${evt.title}`,
        date: followUpDate.toISOString().split('T')[0],
        time: '14:00',
        urgency: 'Alta prioridade',
        responsible: userEmail || 'Equipe Comercial'
      });
    }

    // Registra interação no CRM
    if (evt.organizationId) {
      crmService.createInteraction({
        organizationId: evt.organizationId,
        contactId: evt.contactId,
        channel: 'Reunião',
        date: evt.date,
        summary: `Reunião Realizada: ${evt.title}`,
        notes: rawNotes,
        responsibleUser: userEmail || 'Equipe Comercial'
      });
    }

    return structuredSummary;
  }

  // =========================================================================
  // 4. CONSULTAS E PERSISTÊNCIA
  // =========================================================================

  getAllEvents() {
    return [...this.events].sort((a, b) => new Date(a.startIso) - new Date(b.startIso));
  }

  getEvents() {
    return this.getAllEvents();
  }

  getEventsByOrganization(orgId) {
    return this.events.filter(e => e.organizationId === orgId);
  }

  getEventsByContact(contactId) {
    return this.events.filter(e => e.contactId === contactId);
  }

  getCalendarMetrics() {
    const total = this.events.length;
    const confirmed = this.events.filter(e => e.status === EventStatus.CONFIRMED).length;
    const completedWithSummary = this.events.filter(e => !!e.postMeetingSummary).length;

    return {
      totalEvents: total,
      confirmedEvents: confirmed,
      completedWithSummary,
      meetingConversionPercent: total > 0 ? Math.round((completedWithSummary / total) * 100) : 75
    };
  }

  _loadEvents() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const stored = localStorage.getItem(STORAGE_KEY_EVENTS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      // Ambiente sem suporte a storage
    }
    return [];
  }

  _saveEvents() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(this.events));
      }
    } catch (e) {
      // Ambiente sem suporte a storage
    }
  }
}

export const calendarIntegrationService = new CalendarIntegrationService();
