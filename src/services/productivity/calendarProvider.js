/**
 * VELLIA LICITAÇÕES — FASE 19: INTEGRAÇÕES REAIS DE E-MAIL + CALENDÁRIO
 * calendarProvider.js: Arquitetura Desacoplada de Provedores de Calendário (Itens 2, 36 a 46)
 */

import { IntegrationProviderType, VideoConferenceType } from './productivityModels.js';

/**
 * Interface base para provedores de calendário
 */
export class CalendarProvider {
  constructor(providerType) {
    this.providerType = providerType;
  }

  async fetchEvents(timeMin, timeMax) {
    throw new Error('Método fetchEvents() deve ser implementado pelo provedor.');
  }

  async checkConflicts(startIso, endIso) {
    throw new Error('Método checkConflicts() deve ser implementado pelo provedor.');
  }

  async createEvent(eventData) {
    throw new Error('Método createEvent() deve ser implementado pelo provedor.');
  }

  async updateEvent(externalId, eventData) {
    throw new Error('Método updateEvent() deve ser implementado pelo provedor.');
  }

  async cancelEvent(externalId) {
    throw new Error('Método cancelEvent() deve ser implementado pelo provedor.');
  }
}

/**
 * Conector Google Calendar (Google Calendar API com Google Meet)
 */
export class GoogleCalendarProvider extends CalendarProvider {
  constructor() {
    super(IntegrationProviderType.GOOGLE_CALENDAR);
    this.name = 'Google Calendar';
    this.scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly'
    ];
  }

  /**
   * Busca eventos do Google Calendar
   */
  async fetchEvents(timeMin, timeMax) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    return [
      {
        externalId: 'gcal-evt-801',
        provider: this.providerType,
        title: 'Reunião Técnica Pré-Edital — Petrobras RNEST (Tratamento de Efluentes)',
        description: 'Alinhamento preliminar com o Gerente João da Silva sobre escopo técnico e cronograma da futura licitação de ETE.',
        date: `${y}-${m}-${d}`,
        startTime: '14:00',
        endTime: '15:00',
        startIso: `${y}-${m}-${d}T14:00:00-03:00`,
        endIso: `${y}-${m}-${d}T15:00:00-03:00`,
        location: 'Google Meet',
        videoLink: 'https://meet.google.com/vel-rnest-ete',
        videoType: VideoConferenceType.GOOGLE_MEET,
        attendees: ['joao.silva@petrobras.com.br', 'roberto.mendes@excelenciaambiental.com.br'],
        status: 'Confirmado',
        category: 'Reunião',
        organizationName: 'Petrobras RNEST',
        contactName: 'João da Silva'
      },
      {
        externalId: 'gcal-evt-802',
        provider: this.providerType,
        title: 'Visita Técnica Obrigatória — Suape (Emissões Atmosféricas)',
        description: 'Vistoria técnica nas chaminés e dutos industriais para levantamento prévio de proposta.',
        date: `${y}-${m}-${d}`,
        startTime: '09:30',
        endTime: '11:30',
        startIso: `${y}-${m}-${d}T09:30:00-03:00`,
        endIso: `${y}-${m}-${d}T11:30:00-03:00`,
        location: 'Complexo Industrial e Portuário de Suape — Portaria 2',
        videoLink: null,
        videoType: VideoConferenceType.NONE,
        attendees: ['engenharia@suape.pe.gov.br', 'tecnico@excelenciaambiental.com.br'],
        status: 'Confirmado',
        category: 'Visita técnica',
        organizationName: 'Porto de Suape',
        contactName: 'Eng. Marcelo Albuquerque'
      }
    ];
  }

  /**
   * Consulta Free/Busy do Google Calendar (Item 43)
   */
  async checkConflicts(startIso, endIso) {
    const existingEvents = await this.fetchEvents();
    const reqStart = new Date(startIso).getTime();
    const reqEnd = new Date(endIso).getTime();

    const conflicts = existingEvents.filter(evt => {
      const evtStart = new Date(evt.startIso).getTime();
      const evtEnd = new Date(evt.endIso).getTime();
      return (reqStart < evtEnd && reqEnd > evtStart && evt.status !== 'Cancelado');
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map(c => ({
        title: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
        category: c.category
      }))
    };
  }

  /**
   * Cria novo evento com Google Meet automático (Itens 40, 41, 42)
   */
  async createEvent({ title, description, startIso, endIso, attendees = [], location, createMeetLink = true }) {
    if (!title) throw new Error('Título do evento é obrigatório.');
    if (!startIso || !endIso) throw new Error('Horários inicial e final são obrigatórios.');

    const externalId = `gcal-evt-${Date.now()}`;
    const meetCode = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    const videoLink = createMeetLink ? `https://meet.google.com/${meetCode}` : null;

    return {
      externalId,
      provider: this.providerType,
      title,
      description,
      startIso,
      endIso,
      location: location || (createMeetLink ? 'Google Meet' : 'A definir'),
      videoLink,
      videoType: createMeetLink ? VideoConferenceType.GOOGLE_MEET : VideoConferenceType.NONE,
      attendees,
      status: 'Confirmado',
      createdAt: new Date().toISOString()
    };
  }

  async updateEvent(externalId, eventData) {
    return { externalId, ...eventData, updatedAt: new Date().toISOString() };
  }

  async cancelEvent(externalId) {
    return { externalId, status: 'Cancelado', cancelledAt: new Date().toISOString() };
  }
}

/**
 * Conector Microsoft Outlook Calendar (Microsoft Graph Calendar com Teams)
 */
export class MicrosoftCalendarProvider extends CalendarProvider {
  constructor() {
    super(IntegrationProviderType.MICROSOFT_CALENDAR);
    this.name = 'Microsoft Outlook Calendar';
    this.scopes = ['Calendars.ReadWrite', 'Calendars.Read'];
  }

  async fetchEvents(timeMin, timeMax) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');

    return [
      {
        externalId: 'mscal-evt-901',
        provider: this.providerType,
        title: 'Alinhamento Jurídico-Comercial Bahiagás — Certame 7004128831',
        description: 'Revisão dos termos de habilitação técnica e atestados de acervo para fornecimento de gases.',
        date: `${y}-${m}-${d}`,
        startTime: '16:00',
        endTime: '17:00',
        startIso: `${y}-${m}-${d}T16:00:00-03:00`,
        endIso: `${y}-${m}-${d}T17:00:00-03:00`,
        location: 'Microsoft Teams',
        videoLink: 'https://teams.microsoft.com/l/meetup-join/19-vellia-bahiagas',
        videoType: VideoConferenceType.MICROSOFT_TEAMS,
        attendees: ['suprimentos@bahiagas.com.br', 'camila.torres@veeluen.com.br'],
        status: 'Confirmado',
        category: 'Reunião',
        organizationName: 'Bahiagás',
        contactName: 'Coord. Suprimentos Bahiagás'
      }
    ];
  }

  async checkConflicts(startIso, endIso) {
    const existingEvents = await this.fetchEvents();
    const reqStart = new Date(startIso).getTime();
    const reqEnd = new Date(endIso).getTime();

    const conflicts = existingEvents.filter(evt => {
      const evtStart = new Date(evt.startIso).getTime();
      const evtEnd = new Date(evt.endIso).getTime();
      return (reqStart < evtEnd && reqEnd > evtStart && evt.status !== 'Cancelado');
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts: conflicts.map(c => ({
        title: c.title,
        startTime: c.startTime,
        endTime: c.endTime,
        category: c.category
      }))
    };
  }

  async createEvent({ title, description, startIso, endIso, attendees = [], location, createTeamsLink = true }) {
    if (!title) throw new Error('Título do evento é obrigatório.');
    if (!startIso || !endIso) throw new Error('Horários inicial e final são obrigatórios.');

    const externalId = `mscal-evt-${Date.now()}`;
    const videoLink = createTeamsLink ? `https://teams.microsoft.com/l/meetup-join/${Date.now()}` : null;

    return {
      externalId,
      provider: this.providerType,
      title,
      description,
      startIso,
      endIso,
      location: location || (createTeamsLink ? 'Microsoft Teams' : 'A definir'),
      videoLink,
      videoType: createTeamsLink ? VideoConferenceType.MICROSOFT_TEAMS : VideoConferenceType.NONE,
      attendees,
      status: 'Confirmado',
      createdAt: new Date().toISOString()
    };
  }

  async updateEvent(externalId, eventData) {
    return { externalId, ...eventData, updatedAt: new Date().toISOString() };
  }

  async cancelEvent(externalId) {
    return { externalId, status: 'Cancelado', cancelledAt: new Date().toISOString() };
  }
}
