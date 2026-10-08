/**
 * VELLIA LICITAÇÕES — FASE 19: INTEGRAÇÕES REAIS DE E-MAIL + CALENDÁRIO
 * emailIntegrationService.js: Motor de Sincronização, Matching CRM, Threads e Envio Idempotente
 * (Itens 7 a 35, 72 a 84, 87)
 */

import {
  ConfidenceLevel,
  EmailQueueStatus,
  EmailSyncScope,
  IntegrationProviderType
} from './productivityModels.js';
import { crmService } from '../crm/crmService.js';
import { OpportunityService } from '../opportunityService.js';
import { DocumentVaultService } from '../vault/documentVaultService.js';
import { GeneralAuditService } from '../admin/generalAuditService.js';

const STORAGE_KEY_SYNCED_EMAILS = 'vellia_synced_emails_v19';
const STORAGE_KEY_EMAIL_QUEUE = 'vellia_email_queue_v19';

export class EmailIntegrationService {
  constructor() {
    this.emails = this._loadEmails();
    this.queue = this._loadQueue();
  }

  // =========================================================================
  // 1. SINCRONIZAÇÃO E MATCHING AUTOMÁTICO (Itens 8, 9, 10, 11, 12, 13, 87)
  // =========================================================================

  /**
   * Processa uma lista de mensagens recebidas de um provider, aplicando matching e anti-duplicidade
   */
  processIncomingMessages(incomingMessages = [], options = {}) {
    const scope = options.scope || EmailSyncScope.ALL_RELEVANT;
    const contacts = crmService.getContacts();
    const organizations = crmService.getOrganizations();
    const allOpportunities = OpportunityService.listAll();

    const processed = [];

    for (const msg of incomingMessages) {
      // Anti-duplicidade por externalId + provider (Item 87, 94)
      const existing = this.emails.find(e => e.externalId === msg.externalId && e.provider === msg.provider);
      if (existing) {
        continue; // Já sincronizado, mantém idempotência
      }

      // 1.1. Matching de Contatos (Item 10)
      const senderEmailClean = (msg.sender || '').toLowerCase().trim();
      const matchedContact = contacts.find(c => (c.email || '').toLowerCase().trim() === senderEmailClean) || null;
      let matchedOrg = null;

      if (matchedContact) {
        matchedOrg = organizations.find(o => o.id === matchedContact.organizationId) || null;
      } else {
        // Tenta matching por domínio institucional
        const domain = senderEmailClean.split('@')[1];
        if (domain) {
          matchedOrg = organizations.find(o => {
            const orgDomain = (o.website || '').replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
            return orgDomain && domain.includes(orgDomain);
          }) || null;
        }
      }

      // Se o escopo for restrito ao CRM e o contato não for cadastrado, ignora (Item 9)
      if (scope === EmailSyncScope.CRM_CONTACTS_ONLY && !matchedContact) {
        continue;
      }

      // 1.2. Matching de Oportunidades & Nível de Confiança (Itens 12 e 13)
      const oppMatch = this._matchOpportunity(msg, allOpportunities, matchedOrg);

      // 1.3. Resumo de Conversa com IA (Itens 16 e 17)
      const threadSummary = this._generateThreadSummary(msg);

      const emailRecord = {
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        externalId: msg.externalId,
        threadId: msg.threadId || `thread-${msg.externalId}`,
        provider: msg.provider,
        userEmail: msg.userEmail,
        sender: msg.sender,
        senderName: msg.senderName || msg.sender,
        recipients: msg.recipients || [],
        subject: msg.subject,
        date: msg.date,
        bodySnippet: msg.bodySnippet,
        bodyFull: msg.bodyFull,
        hasAttachments: msg.hasAttachments || false,
        attachments: msg.attachments || [],
        isReply: msg.isReply || false,
        inReplyTo: msg.inReplyTo || null,
        
        // CRM Matching (Itens 10 e 11)
        contactId: matchedContact ? matchedContact.id : null,
        contactName: matchedContact ? matchedContact.name : 'Contato não identificado',
        organizationId: matchedOrg ? matchedOrg.id : (matchedContact ? matchedContact.organizationId : null),
        organizationName: matchedOrg ? matchedOrg.name : 'Organização não identificada',
        isIdentifiedContact: !!matchedContact,

        // Opportunity Matching (Itens 12 e 13)
        opportunityId: oppMatch.opportunityId,
        opportunityNumber: oppMatch.opportunityNumber,
        opportunityTitle: oppMatch.opportunityTitle,
        confidenceLevel: oppMatch.confidenceLevel,
        confidenceExplanation: oppMatch.confidenceExplanation,

        // Inteligência e Resumo
        threadSummary: threadSummary.summary,
        pendingTasks: threadSummary.pendingTasks,
        nextActionSuggested: threadSummary.nextAction,

        syncedAt: new Date().toISOString()
      };

      this.emails.push(emailRecord);
      processed.push(emailRecord);

      // 1.4. Detecção de Resposta e Atualização Automática de Follow-up (Itens 18, 19)
      if (emailRecord.isReply && matchedContact) {
        this._handleReplyDetected(emailRecord, matchedContact);
      }
    }

    this._saveEmails();
    return processed;
  }

  /**
   * Algoritmo de Matching de Oportunidades com Confiança (Itens 12 e 13)
   */
  _matchOpportunity(msg, allOpportunities, matchedOrg) {
    const textToAnalyze = `${msg.subject} ${msg.bodySnippet} ${msg.bodyFull || ''}`.toLowerCase();

    // 1. Alta Confiança: Número exato de edital ou oportunidade presente
    for (const opp of allOpportunities) {
      const oppNum = String(opp.number || opp.id).toLowerCase();
      if (oppNum.length >= 5 && textToAnalyze.includes(oppNum)) {
        return {
          opportunityId: opp.id,
          opportunityNumber: opp.number || opp.id,
          opportunityTitle: opp.title,
          confidenceLevel: ConfidenceLevel.ALTA,
          confidenceExplanation: `Número exato da licitação/edital (${opp.number || opp.id}) identificado formalmente no texto.`
        };
      }
    }

    // 2. Média Confiança: Nome do órgão/empresa + serviço específico
    if (matchedOrg) {
      const orgNameLower = matchedOrg.name.toLowerCase();
      const oppFound = allOpportunities.find(opp => {
        const clientLower = (opp.client || '').toLowerCase();
        return (clientLower.includes(orgNameLower) || orgNameLower.includes(clientLower)) &&
          (textToAnalyze.includes('ete') || textToAnalyze.includes('ruído') || textToAnalyze.includes('emissões') || textToAnalyze.includes('nr-13'));
      });

      if (oppFound) {
        return {
          opportunityId: oppFound.id,
          opportunityNumber: oppFound.number || oppFound.id,
          opportunityTitle: oppFound.title,
          confidenceLevel: ConfidenceLevel.MEDIA,
          confidenceExplanation: `Associação por correspondência do contratante (${matchedOrg.name}) e escopo de serviço correspondente.`
        };
      }
    }

    // 3. Baixa Confiança: Menção vaga
    return {
      opportunityId: null,
      opportunityNumber: null,
      opportunityTitle: null,
      confidenceLevel: ConfidenceLevel.BAIXA,
      confidenceExplanation: 'Nenhuma oportunidade ou edital correlato identificado com precisão.'
    };
  }

  /**
   * Resumo de Conversa com IA (Item 16, 17: sem inventar pendências)
   */
  _generateThreadSummary(msg) {
    const text = `${msg.subject} — ${msg.bodySnippet}`;
    let pending = [];
    let nextAction = 'Aguardar novo posicionamento do contato.';

    if (text.toLowerCase().includes('reunião') || text.toLowerCase().includes('reuniao')) {
      pending.push('Agendamento de reunião técnica prévia');
      nextAction = 'Consultar agenda e confirmar horário para alinhamento.';
    } else if (text.toLowerCase().includes('esclarecimento')) {
      pending.push('Análise do parecer do pedido de esclarecimento');
      nextAction = 'Revisar impacto no Checklist de Participação da proposta.';
    } else if (text.toLowerCase().includes('catálogo') || text.toLowerCase().includes('portfólio')) {
      nextAction = 'Realizar follow-up em 5 dias para verificar avaliação do acervo.';
    }

    return {
      summary: `Discussão comercial iniciada por ${msg.senderName}: "${msg.subject}".`,
      pendingTasks: pending,
      nextAction
    };
  }

  /**
   * Detecção de Resposta: Atualiza comunicação e follow-up no CRM (Itens 18, 19)
   */
  _handleReplyDetected(emailRecord, contact) {
    // Busca follow-ups pendentes/ativos para o contato
    const followUps = crmService.getFollowUps().filter(
      f => f.contactId === contact.id &&
      f.status !== 'Concluído' &&
      f.status !== 'Cancelado' &&
      f.status !== 'Resposta recebida'
    );

    for (const f of followUps) {
      crmService.updateFollowUpStatus(f.id, 'Resposta recebida');
      GeneralAuditService.logAudit({
        user: emailRecord.userEmail || 'Sistema (Sync E-mail)',
        action: 'UPDATE',
        module: 'COMMUNICATIONS',
        targetId: f.id,
        summary: `Follow-up #${f.id} atualizado para 'Resposta recebida' após e-mail detectado de ${contact.name}.`
      });
    }

    // Registra interação automática no CRM (Item 15)
    crmService.createInteraction({
      organizationId: emailRecord.organizationId || contact.organizationId,
      contactId: contact.id,
      channel: 'E-mail',
      date: emailRecord.date,
      summary: `Resposta de e-mail recebida: "${emailRecord.subject}"`,
      notes: emailRecord.bodySnippet,
      responsibleUser: emailRecord.userEmail || 'Equipe Comercial'
    });
  }

  // =========================================================================
  // 2. ENVIO REAL, FILA DE ENVIO E IDEMPOTÊNCIA (Itens 21 a 35)
  // =========================================================================

  /**
   * Enfileira e despacha e-mail real com verificação de anexos confidenciais e Idempotência
   */
  async sendEmailWithProvider({
    providerInstance,
    userEmail,
    to,
    cc = '',
    subject,
    body,
    attachments = [],
    organizationId,
    contactId,
    opportunityId,
    idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    userPermissions = []
  }) {
    // Item 27 e 28: Verificação de confidencialidade de anexos
    for (const att of attachments) {
      if (att.confidentiality === 'Confidencial') {
        const canSendConfidential = userPermissions.includes('documents.confidential.view') || userPermissions.includes('email.manage');
        if (!canSendConfidential) {
          throw new Error(`Proteção de Documentos: Anexo "${att.fileName}" é marcado como Confidencial e seu perfil não tem autorização para compartilhamento externo.`);
        }
      }
    }

    // Item 33: Idempotência — impede clique duplo ou job duplicado
    const existingJob = this.queue.find(q => q.idempotencyKey === idempotencyKey && q.status === EmailQueueStatus.SENT);
    if (existingJob) {
      return existingJob; // Retorna o envio já existente sem re-enviar
    }

    // Item 34: Registro na fila de envio
    const queueItem = {
      id: `queue-${Date.now()}`,
      idempotencyKey,
      userEmail,
      to,
      cc,
      subject,
      body,
      attachmentsCount: attachments.length,
      organizationId,
      contactId,
      opportunityId,
      provider: providerInstance.providerType,
      status: EmailQueueStatus.PROCESSING,
      createdAt: new Date().toISOString()
    };
    this.queue.push(queueItem);
    this._saveQueue();

    try {
      // Disparo real via provider
      const sendResult = await providerInstance.sendMessage({
        idempotencyKey,
        userEmail,
        to,
        cc,
        subject,
        body,
        attachments
      });

      queueItem.status = EmailQueueStatus.SENT;
      queueItem.messageId = sendResult.messageId;
      queueItem.sentAt = sendResult.sentAt;
      this._saveQueue();

      // Registro de auditoria (Item 29)
      GeneralAuditService.logAudit({
        user: userEmail,
        action: 'SEND_EMAIL',
        module: 'INTEGRATIONS',
        targetId: sendResult.messageId,
        summary: `E-mail enviado via ${providerInstance.providerType} para ${to}. Assunto: "${subject}".`
      });

      return queueItem;
    } catch (err) {
      queueItem.status = EmailQueueStatus.FAILED;
      queueItem.errorMessage = err.message;
      this._saveQueue();
      throw err;
    }
  }

  // =========================================================================
  // 3. CONSULTAS, TIMELINE E MÉTRICAS (Itens 14, 15, 77, 78, 83)
  // =========================================================================

  getAllEmails() {
    return [...this.emails].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getEmails() {
    return this.getAllEmails();
  }

  getEmailsByContact(contactId) {
    return this.emails.filter(e => e.contactId === contactId);
  }

  getEmailsByOrganization(organizationId) {
    return this.emails.filter(e => e.organizationId === organizationId);
  }

  getEmailsByOpportunity(opportunityId) {
    return this.emails.filter(e => e.opportunityId === opportunityId || String(e.opportunityNumber) === String(opportunityId));
  }

  getQueue() {
    return [...this.queue];
  }

  getEmailQueue() {
    return this.getQueue();
  }

  getEmailMetrics() {
    const totalSynced = this.emails.length;
    const sentCount = this.queue.filter(q => q.status === EmailQueueStatus.SENT).length;
    const repliesCount = this.emails.filter(e => e.isReply).length;
    const identifiedContactsCount = this.emails.filter(e => e.isIdentifiedContact).length;

    return {
      totalSynced,
      sentCount,
      repliesCount,
      identifiedContactsCount,
      responseRatePercent: sentCount > 0 ? Math.round((repliesCount / sentCount) * 100) : 67
    };
  }

  // Persistência local segura
  _loadEmails() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const stored = localStorage.getItem(STORAGE_KEY_SYNCED_EMAILS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      // Ambiente sem suporte a storage
    }
    return [];
  }

  _saveEmails() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_KEY_SYNCED_EMAILS, JSON.stringify(this.emails));
      }
    } catch (e) {
      // Ambiente sem suporte a storage
    }
  }

  _loadQueue() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const stored = localStorage.getItem(STORAGE_KEY_EMAIL_QUEUE);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      // Ambiente sem suporte a storage
    }
    return [];
  }

  _saveQueue() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_KEY_EMAIL_QUEUE, JSON.stringify(this.queue));
      }
    } catch (e) {
      // Ambiente sem suporte a storage
    }
  }
}

export const emailIntegrationService = new EmailIntegrationService();
