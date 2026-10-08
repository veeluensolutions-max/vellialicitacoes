/**
 * VELLIA LICITAÇÕES — FASE 17
 * followUpService.js
 * Gerenciamento de Follow-ups, Alertas de Prazos, Agenda Comercial e Tarefas Preventivas.
 */

import { FollowUpStatus, FollowUpPriority } from './crmModels.js';

const STORAGE_KEY_FOLLOWUPS = 'vellia_crm_followups_v17';

// Hoje no mock simulado é aproximadamente 2026-10-08
export const INITIAL_FOLLOWUPS = [
  {
    id: 'FOL-001',
    title: 'Follow-up de CATs de ETE com Eng. Marcelo (Petrobras RNEST)',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras RNEST',
    contactId: 'CTC-PETRO-001',
    contactName: 'Eng. Marcelo Cavalcanti',
    responsible: 'Roberto Mendes (Diretor Comercial)',
    date: '2026-10-08', // HOJE
    time: '14:00',
    priority: FollowUpPriority.ALTA,
    reason: 'Verificar se o acervo técnico enviado atende aos pré-requisitos da minuta do edital.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-001',
    status: FollowUpStatus.HOJE,
    notes: 'Prioridade máxima: contrato incumbente vence em 38 dias.',
    createdAt: '2026-09-28T16:00:00Z'
  },
  {
    id: 'FOL-002',
    title: 'Checagem de pré-edital de Emissões com Bárbara Lins (UFPE)',
    organizationId: 'ORG-UFPE',
    organizationName: 'UFPE',
    contactId: 'CTC-UFPE-002',
    contactName: 'Bárbara Lins',
    responsible: 'Camila Torres (Engenheira Ambiental)',
    date: '2026-10-08', // HOJE
    time: '16:30',
    priority: FollowUpPriority.ALTA,
    reason: 'Confirmar data estimada de publicação do Pregão Eletrônico no Compras.gov.br.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-003',
    status: FollowUpStatus.HOJE,
    notes: 'Verificar se haverá visita técnica obrigatória.',
    createdAt: '2026-10-02T16:00:00Z'
  },
  {
    id: 'FOL-003',
    title: 'Apresentação de planilha comparativa NR-13 (COMPESA)',
    organizationId: 'ORG-COMPESA',
    organizationName: 'COMPESA',
    contactId: 'CTC-COMP-001',
    contactName: 'Eng. Fernando Bezerra',
    responsible: 'Flávio Caldas (Eng. Mecânico)',
    date: '2026-10-06', // ATRASADO
    time: '10:00',
    priority: FollowUpPriority.ALTA,
    reason: 'Enviar memória técnica de custos horários para subsidiar ETP.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-005',
    status: FollowUpStatus.ATRASADO,
    notes: 'Urgente: reagendar contato imediatamente.',
    createdAt: '2026-09-25T12:00:00Z'
  },
  {
    id: 'FOL-004',
    title: 'Alinhamento sobre pré-requisitos de frota MTR (Porto de Suape)',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Porto de Suape',
    contactId: 'CTC-SUAPE-001',
    contactName: 'Dr. Leonardo Gusmão',
    responsible: 'Roberto Mendes',
    date: '2026-10-09', // AMANHÃ
    time: '09:30',
    priority: FollowUpPriority.MEDIA,
    reason: 'Confirmar se os caminhões a vácuo precisam ter licença do CPRH e ANTT averbadas.',
    relatedOpportunityId: 'OPP-PNCP-2026-0991',
    relatedSignalId: 'SIG-2026-006',
    status: FollowUpStatus.PENDENTE,
    notes: 'Pregão PNCP já publicado, fase de preparação de proposta.',
    createdAt: '2026-09-30T12:00:00Z'
  },
  {
    id: 'FOL-005',
    title: 'Consulta sobre cronograma do PCA 2027 (Chesf)',
    organizationId: 'ORG-CHESF',
    organizationName: 'Eletrobras Chesf',
    contactId: 'CTC-CHESF-001',
    contactName: 'Eng. Renato Fagundes',
    responsible: 'Camila Torres',
    date: '2026-10-14', // Próximos 7 dias
    time: '11:00',
    priority: FollowUpPriority.BAIXA,
    reason: 'Sondagem sobre aprovação do plano de contratação de estudos de ictiofauna.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    status: FollowUpStatus.PENDENTE,
    notes: 'Escopo plurianual.',
    createdAt: '2026-08-10T16:00:00Z'
  },
  {
    id: 'FOL-006',
    title: 'Validação de certidão negativa de falência estadual (COMPESA)',
    organizationId: 'ORG-COMPESA',
    organizationName: 'COMPESA',
    contactId: 'CTC-COMP-002',
    contactName: 'Mariana Duarte',
    responsible: 'Lucas Andrade',
    date: '2026-10-12',
    time: '15:00',
    priority: FollowUpPriority.MEDIA,
    reason: 'Checar modelo aceito no PE Integrado.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    status: FollowUpStatus.PENDENTE,
    notes: 'Preparação documental preventiva.',
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'FOL-007',
    title: 'Ligação de cortesia e agradecimento de visita (Suape)',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Porto de Suape',
    contactId: 'CTC-SUAPE-002',
    contactName: 'Juliana Fontes',
    responsible: 'Camila Torres',
    date: '2026-10-02',
    time: '14:00',
    priority: FollowUpPriority.MEDIA,
    reason: 'Confirmar recebimento do portfólio digital enviado por e-mail.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    status: FollowUpStatus.CONCLUIDO,
    notes: 'Contato confirmou recebimento e gostou do case de tratamento.',
    createdAt: '2026-09-30T10:00:00Z'
  },
  {
    id: 'FOL-008',
    title: 'Revisão de equipe técnica para licitação RNEST (Petrobras)',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras RNEST',
    contactId: 'CTC-PETRO-001',
    contactName: 'Eng. Marcelo Cavalcanti',
    responsible: 'Roberto Mendes',
    date: '2026-10-15',
    time: '10:30',
    priority: FollowUpPriority.ALTA,
    reason: 'Verificar se haverá exigência de engenheiro de segurança residente full-time.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-001',
    status: FollowUpStatus.PENDENTE,
    notes: 'Impacto direto na composição de custos do BDI.',
    createdAt: '2026-10-01T14:00:00Z'
  },
  {
    id: 'FOL-009',
    title: 'Confirmação de homologação de cadastro Petronect',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras RNEST',
    contactId: 'CTC-PETRO-002',
    contactName: 'Dra. Patrícia Albuquerque',
    responsible: 'Camila Torres',
    date: '2026-09-16',
    time: '11:00',
    priority: FollowUpPriority.BAIXA,
    reason: 'Checar linha de fornecimento cadastrada no sistema.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    status: FollowUpStatus.CONCLUIDO,
    notes: 'Cadastro confirmado com nota técnica máxima.',
    createdAt: '2026-09-15T10:00:00Z'
  },
  {
    id: 'FOL-010',
    title: 'Visita ao laboratório central da UFPE com Dra. Bárbara',
    organizationId: 'ORG-UFPE',
    organizationName: 'UFPE',
    contactId: 'CTC-UFPE-002',
    contactName: 'Bárbara Lins',
    responsible: 'Camila Torres',
    date: '2026-10-20',
    time: '14:00',
    priority: FollowUpPriority.MEDIA,
    reason: 'Inspeção prévia dos dutos para cálculo de andaimes necessários.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-003',
    status: FollowUpStatus.PENDENTE,
    notes: 'Ação preventiva para evitar custos imprevistos na proposta.',
    createdAt: '2026-10-03T09:00:00Z'
  }
];

class FollowUpService {
  constructor() {
    this._inMemory = [...INITIAL_FOLLOWUPS];
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        // Ignora
      }
    }
    return this._inMemory;
  }

  _safeSetStorage(key, val) {
    this._inMemory = val;
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        // Ignora
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_FOLLOWUPS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_FOLLOWUPS, INITIAL_FOLLOWUPS);
    }
  }

  /**
   * Retorna todos os follow-ups com status temporal atualizado dinamicamente
   */
  getAllFollowUps() {
    const list = this._safeGetStorage(STORAGE_KEY_FOLLOWUPS) || this._inMemory || INITIAL_FOLLOWUPS;
    const todayStr = '2026-10-08'; // Base de referência consistente com o contexto

    return list.map(f => {
      let dynamicStatus = f.status;
      if (
        f.status !== FollowUpStatus.CONCLUIDO &&
        f.status !== FollowUpStatus.CANCELADO &&
        f.status !== 'Resposta recebida' &&
        f.status !== 'Convertido em Agenda'
      ) {
        if (f.date < todayStr) dynamicStatus = FollowUpStatus.ATRASADO;
        else if (f.date === todayStr) dynamicStatus = FollowUpStatus.HOJE;
        else dynamicStatus = FollowUpStatus.PENDENTE;
      }
      return { ...f, status: dynamicStatus };
    });
  }

  /**
   * Alertas de Follow-up (Item 18): Hoje, Atrasado, Amanhã, Próximos 7 dias
   */
  getFollowUpAlerts() {
    const all = this.getAllFollowUps();
    const todayStr = '2026-10-08';
    const tomorrowStr = '2026-10-09';
    const next7DaysStr = '2026-10-15';

    return {
      today: all.filter(f => f.status === FollowUpStatus.HOJE),
      overdue: all.filter(f => f.status === FollowUpStatus.ATRASADO),
      tomorrow: all.filter(f => f.date === tomorrowStr && f.status !== FollowUpStatus.CONCLUIDO),
      next7Days: all.filter(f => f.date > tomorrowStr && f.date <= next7DaysStr && f.status !== FollowUpStatus.CONCLUIDO)
    };
  }

  /**
   * Cria follow-up a partir de um sinal do Radar Antecipado (Item 19)
   */
  createFromRadarSignal(signal = {}) {
    const todayStr = '2026-10-08';
    const newFollowUp = {
      id: `FOL-${Date.now()}`,
      title: `Prospecção Preventiva: ${signal.relatedService || signal.title} (${signal.organShort || signal.organ})`,
      organizationId: signal.organizationId || `ORG-${(signal.organShort || 'ORGAO').toUpperCase().replace(/\s+/g, '_')}`,
      organizationName: signal.organShort || signal.organ || 'Órgão Público',
      contactId: signal.contactId || '',
      contactName: signal.contactName || 'Contato a identificar',
      responsible: signal.responsible || 'Roberto Mendes (Diretor Comercial)',
      date: todayStr,
      time: '14:00',
      priority: FollowUpPriority.ALTA,
      reason: `Sinal identificado no Radar: ${signal.description || 'Contrato vigente próximo do término ou inclusão no PCA.'}`,
      relatedOpportunityId: signal.convertedOpportunityId || null,
      relatedSignalId: signal.id || null,
      status: FollowUpStatus.HOJE,
      notes: 'Gerado preventivamente a partir do Radar Antecipado.',
      createdAt: new Date().toISOString()
    };

    const all = this.getAllFollowUps();
    all.unshift(newFollowUp);
    this._safeSetStorage(STORAGE_KEY_FOLLOWUPS, all);
    return newFollowUp;
  }

  /**
   * Cadastra novo follow-up
   */
  addFollowUp(data = {}) {
    const all = this.getAllFollowUps();
    const newEntry = {
      id: data.id || `FOL-${Date.now()}`,
      title: data.title || 'Follow-up Comercial',
      organizationId: data.organizationId || '',
      organizationName: data.organizationName || '',
      contactId: data.contactId || '',
      contactName: data.contactName || '',
      responsible: data.responsible || 'Equipe Comercial',
      date: data.date || '2026-10-08',
      time: data.time || '10:00',
      priority: data.priority || FollowUpPriority.MEDIA,
      reason: data.reason || '',
      relatedOpportunityId: data.relatedOpportunityId || null,
      relatedSignalId: data.relatedSignalId || null,
      status: data.status || FollowUpStatus.PENDENTE,
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };

    all.unshift(newEntry);
    this._safeSetStorage(STORAGE_KEY_FOLLOWUPS, all);
    return newEntry;
  }

  /**
   * Atualiza status de um follow-up (Concluir, Reagendar, etc.)
   */
  updateStatus(id, newStatus, patch = {}) {
    const all = this.getAllFollowUps();
    const idx = all.findIndex(f => f.id === id);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        ...patch,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      this._safeSetStorage(STORAGE_KEY_FOLLOWUPS, all);
      return all[idx];
    }
    return null;
  }
}

export const followUpService = new FollowUpService();
