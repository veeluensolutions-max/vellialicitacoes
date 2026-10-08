/**
 * VELLIA LICITAÇÕES — FASE 18
 * communicationService.js
 * Fachada Central de Comunicações, Caixa de Saída (Outbox), Histórico 360,
 * Central de Follow-ups e Métricas de Conversão.
 */

import {
  CommunicationChannel,
  CommunicationStatus,
  MessageType,
  CommunicationOutcome,
  calculateFollowUpScore
} from './communicationModels.js';
import { templateService } from './templateService.js';
import { messageGeneratorService } from './messageGeneratorService.js';
import { campaignService } from './campaignService.js';
import { crmService } from '../crm/crmService.js';
import { followUpService } from '../crm/followUpService.js';

const STORAGE_KEY_OUTBOX = 'vellia_communication_outbox_v18';

export const INITIAL_OUTBOX = [
  {
    id: 'COM-2026-001',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    contactId: 'CTC-PETRO-001',
    contactName: 'Eng. Marcelo Cavalcanti',
    channel: CommunicationChannel.EMAIL,
    type: MessageType.POS_REUNIAO,
    subject: 'Agradecimento e Encaminhamento de Acervo Técnico de ETE — RNEST',
    body: `Prezado Eng. Marcelo Cavalcanti,

Agradeço a excelente reunião técnica realizada no dia 28/09. Conforme acordado, disponibilizamos o catálogo com as CATs de operação contínua de ETE industrial para sua apreciação.

Ficamos à disposição para os esclarecimentos técnicos complementares.

Atenciosamente,
Roberto Mendes
Excelência Ambiental`,
    status: CommunicationStatus.ENVIADA_MANUALMENTE,
    outcome: CommunicationOutcome.RESPONDEU,
    outcomeNotes: 'Engenheiro confirmou recebimento e solicitou agendamento de nova conversa técnica.',
    sentAt: '2026-09-30T10:15:00Z',
    sentBy: 'Camila Torres',
    approvedBy: 'Roberto Mendes (Diretor Comercial)',
    createdAt: '2026-09-29T16:00:00Z'
  },
  {
    id: 'COM-2026-002',
    organizationId: 'ORG-UFPE',
    organizationName: 'Universidade Federal de Pernambuco (UFPE)',
    contactId: 'CTC-UFPE-002',
    contactName: 'Bárbara Lins',
    channel: CommunicationChannel.WHATSAPP,
    type: MessageType.CONTATO_PRE_EDITAL,
    subject: 'Alinhamento Preventivo de Amostragem de Emissões',
    body: `Olá, Bárbara, tudo bem? Aqui é Camila Torres da Excelência Ambiental. Passando para confirmar se você recebeu nosso catálogo de calibração de chaminés. Ficamos à disposição caso sua equipe precise de parâmetros técnicos para a consulta do edital anual! Um ótimo dia!`,
    status: CommunicationStatus.ENVIADA_MANUALMENTE,
    outcome: CommunicationOutcome.SOLICITOU_REUNIAO,
    outcomeNotes: 'Bárbara respondeu solicitando videoconferência para detalhar exigências do CPRH.',
    sentAt: '2026-10-02T15:00:00Z',
    sentBy: 'Camila Torres',
    approvedBy: 'Roberto Mendes',
    createdAt: '2026-10-02T14:30:00Z'
  },
  {
    id: 'COM-2026-003',
    organizationId: 'ORG-COMPESA',
    organizationName: 'Companhia Pernambucana de Saneamento (COMPESA)',
    contactId: 'CTC-COMP-001',
    contactName: 'Eng. Fernando Bezerra',
    channel: CommunicationChannel.EMAIL,
    type: MessageType.PRIMEIRO_CONTATO,
    subject: 'Apresentação de Capacidade Técnica em Caldeiras e NR-13 — COMPESA',
    body: `Prezado Eng. Fernando Bezerra,\n\nA Veeluen Solutions gostaria de colocar sua equipe de engenheiros residentes à disposição da COMPESA para apresentação de soluções em inspeção de conformidade NR-13 e laudos estruturais.\n\nAtenciosamente,\nFlávio Caldas`,
    status: CommunicationStatus.AGUARDANDO_REVISAO,
    outcome: null,
    sentAt: null,
    sentBy: null,
    approvedBy: null,
    createdAt: '2026-10-06T11:00:00Z'
  },
  {
    id: 'COM-2026-004',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Complexo Industrial Portuário de Suape',
    contactId: 'CTC-SUAPE-001',
    contactName: 'Dr. Leonardo Gusmão',
    channel: CommunicationChannel.EMAIL,
    type: MessageType.ENVIO_PORTFOLIO,
    subject: 'Envio de Apresentação Executiva em Gestão de Resíduos Industriais',
    body: `Prezado Dr. Leonardo Gusmão,\n\nConforme conversamos durante a visita ao porto, encaminhamos nossa apresentação institucional sobre rastreamento de manifestos MTR e logística de resíduos perigosos Classe I.\n\nCordialmente,\nRoberto Mendes`,
    status: CommunicationStatus.ENVIADA_MANUALMENTE,
    outcome: CommunicationOutcome.SOLICITOU_PROPOSTA,
    outcomeNotes: 'Cliente solicitou encaminhamento da proposta na fase oficial do pregão.',
    sentAt: '2026-09-30T14:00:00Z',
    sentBy: 'Roberto Mendes',
    approvedBy: 'Roberto Mendes',
    createdAt: '2026-09-30T11:00:00Z'
  },
  {
    id: 'COM-2026-005',
    organizationId: 'ORG-CHESF',
    organizationName: 'Eletrobras Chesf',
    contactId: 'CTC-CHESF-001',
    contactName: 'Eng. Renato Fagundes',
    channel: CommunicationChannel.LINKEDIN,
    type: MessageType.PRIMEIRO_CONTATO,
    subject: 'Conexão Profissional LinkedIn',
    body: `Olá, Eng. Renato! Acompanho os projetos da Chesf na bacia do São Francisco. Atuo na Excelência Ambiental com licenciamento e monitoramento aquático. Um prazer conectar por aqui!`,
    status: CommunicationStatus.ENVIADA_MANUALMENTE,
    outcome: CommunicationOutcome.SEM_RESPOSTA,
    outcomeNotes: 'Mensagem enviada sem retorno há 50 dias.',
    sentAt: '2026-08-15T10:00:00Z',
    sentBy: 'Camila Torres',
    approvedBy: 'Camila Torres',
    createdAt: '2026-08-15T09:30:00Z'
  }
];

class CommunicationService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[CommunicationService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[CommunicationService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_OUTBOX);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_OUTBOX, INITIAL_OUTBOX);
    }
  }

  // --- 1. CAIXA DE SAÍDA (OUTBOX) ---
  getAllOutbox() {
    return this._safeGetStorage(STORAGE_KEY_OUTBOX) || INITIAL_OUTBOX;
  }

  getOutboxItemById(id) {
    const all = this.getAllOutbox();
    return all.find(m => m.id === id) || null;
  }

  createOutboxItem(data = {}) {
    const all = this.getAllOutbox();
    const newItem = {
      id: data.id || `COM-${Date.now()}`,
      organizationId: data.organizationId || '',
      organizationName: data.organizationName || 'Organização Alvo',
      contactId: data.contactId || '',
      contactName: data.contactName || 'Contato Profissional',
      channel: data.channel || CommunicationChannel.EMAIL,
      type: data.type || MessageType.PRIMEIRO_CONTATO,
      subject: data.subject || 'Assunto da Mensagem',
      body: data.body || '',
      status: data.status || CommunicationStatus.AGUARDANDO_REVISAO,
      outcome: null,
      outcomeNotes: '',
      sentAt: null,
      sentBy: null,
      approvedBy: data.approvedBy || null,
      createdAt: new Date().toISOString()
    };

    all.unshift(newItem);
    this._safeSetStorage(STORAGE_KEY_OUTBOX, all);
    return newItem;
  }

  approveMessage(id, approverName = 'Roberto Mendes (Diretor Comercial)') {
    const all = this.getAllOutbox();
    const item = all.find(m => m.id === id);
    if (item) {
      item.status = CommunicationStatus.APROVADA;
      item.approvedBy = approverName;
      item.approvedAt = new Date().toISOString();
      this._safeSetStorage(STORAGE_KEY_OUTBOX, all);
      return item;
    }
    return null;
  }

  /**
   * Registro Manual de Envio (Item 18 e 19)
   * Marca como enviada manualmente e permite criar follow-up interno imediato.
   */
  markAsSentManually(id, { sentBy = 'Usuário Comercial', notes = '', createFollowUpDays = null }) {
    const all = this.getAllOutbox();
    const item = all.find(m => m.id === id);
    if (item) {
      item.status = CommunicationStatus.ENVIADA_MANUALMENTE;
      item.sentAt = new Date().toISOString();
      item.sentBy = sentBy;
      item.sentNotes = notes;

      // Cria follow-up se solicitado (Item 19)
      if (createFollowUpDays) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + Number(createFollowUpDays));
        const dateStr = targetDate.toISOString().split('T')[0];

        followUpService.addFollowUp({
          title: `Follow-up pós-envio: ${item.subject} (${item.organizationName})`,
          organizationId: item.organizationId,
          organizationName: item.organizationName,
          contactId: item.contactId,
          contactName: item.contactName,
          responsible: sentBy,
          date: dateStr,
          time: '14:00',
          reason: `Verificar retorno da mensagem enviada via ${item.channel}.`
        });
      }

      this._safeSetStorage(STORAGE_KEY_OUTBOX, all);
      return item;
    }
    return null;
  }

  /**
   * Registro do desfecho/resposta (Itens 35, 36)
   */
  recordOutcome(id, outcome, outcomeNotes = '') {
    const all = this.getAllOutbox();
    const item = all.find(m => m.id === id);
    if (item) {
      item.outcome = outcome;
      item.outcomeNotes = outcomeNotes;
      item.status = outcome === CommunicationOutcome.SEM_RESPOSTA ? CommunicationStatus.SEM_RESPOSTA : CommunicationStatus.RESPONDIDA;
      item.answeredAt = new Date().toISOString();
      this._safeSetStorage(STORAGE_KEY_OUTBOX, all);
      return item;
    }
    return null;
  }

  // --- 2. CENTRAL DE FOLLOW-UPS INTELIGENTE (Itens 27 a 30) ---
  getIntelligentFollowUps() {
    const rawFollowUps = followUpService.getAllFollowUps();
    const orgs = crmService.getOrganizations();

    return rawFollowUps.map(f => {
      const org = orgs.find(o => o.id === f.organizationId || o.name === f.organizationName);
      const isStrategic = org ? org.strategicClassification === 'Estratégico' : false;
      const isOverdue = f.status === 'Atrasado';

      const scoreResult = calculateFollowUpScore({
        isStrategicOrg: isStrategic,
        hasRelatedOpportunityOrSignal: !!f.relatedSignalId || !!f.relatedOpportunityId,
        daysSinceLastContact: isOverdue ? 25 : 10,
        isOverdue,
        daysOverdue: isOverdue ? 2 : 0,
        isDecisionMaker: true
      });

      return {
        ...f,
        score: scoreResult.score,
        urgency: scoreResult.urgency,
        urgencyColor: scoreResult.badgeColor,
        scoreExplanation: scoreResult.explanation
      };
    }).sort((a, b) => b.score - a.score);
  }

  // --- 3. MÉTRICAS CONSOLIDADAS (Itens 38 a 42) ---
  getCommunicationMetrics() {
    const all = this.getAllOutbox();
    const sent = all.filter(m => m.status === CommunicationStatus.ENVIADA_MANUALMENTE || m.sentAt);
    const answered = all.filter(m => m.outcome && m.outcome !== CommunicationOutcome.SEM_RESPOSTA);
    const meetingsGenerated = all.filter(m => m.outcome === CommunicationOutcome.SOLICITOU_REUNIAO);
    const proposalsGenerated = all.filter(m => m.outcome === CommunicationOutcome.SOLICITOU_PROPOSTA);

    const totalSent = sent.length;
    const totalAnswered = answered.length;
    const responseRate = totalSent > 0 ? ((totalAnswered / totalSent) * 100).toFixed(1) : '0.0';
    const meetingRate = totalSent > 0 ? ((meetingsGenerated.length / totalSent) * 100).toFixed(1) : '0.0';

    // Por Canal
    const byChannel = {
      email: { sent: all.filter(m => m.channel === CommunicationChannel.EMAIL && m.sentAt).length, answered: all.filter(m => m.channel === CommunicationChannel.EMAIL && m.outcome && m.outcome !== CommunicationOutcome.SEM_RESPOSTA).length },
      whatsapp: { sent: all.filter(m => m.channel === CommunicationChannel.WHATSAPP && m.sentAt).length, answered: all.filter(m => m.channel === CommunicationChannel.WHATSAPP && m.outcome && m.outcome !== CommunicationOutcome.SEM_RESPOSTA).length },
      linkedin: { sent: all.filter(m => m.channel === CommunicationChannel.LINKEDIN && m.sentAt).length, answered: all.filter(m => m.channel === CommunicationChannel.LINKEDIN && m.outcome && m.outcome !== CommunicationOutcome.SEM_RESPOSTA).length }
    };

    return {
      totalPrepared: all.length,
      totalSent,
      totalAnswered,
      responseRatePercent: Number(responseRate),
      meetingsGeneratedCount: meetingsGenerated.length,
      meetingRatePercent: Number(meetingRate),
      proposalsGeneratedCount: proposalsGenerated.length,
      byChannel
    };
  }

  // Delegados de Templates e Campanhas
  getTemplates(channel) {
    return templateService.getTemplatesByChannel(channel);
  }

  parseTemplate(text, vars) {
    return templateService.parseTemplate(text, vars);
  }

  suggestNextBestMessage(contact, interactions, portfolios) {
    return messageGeneratorService.suggestNextBestMessage(contact, interactions, portfolios);
  }

  generateAssistedMessage(params) {
    return messageGeneratorService.generateAssistedMessage(params);
  }

  getCampaigns() {
    return campaignService.getAllCampaigns();
  }

  batchApproveCampaign(campaignId) {
    return campaignService.batchApproveCampaignMessages(campaignId);
  }
}

export const communicationService = new CommunicationService();
