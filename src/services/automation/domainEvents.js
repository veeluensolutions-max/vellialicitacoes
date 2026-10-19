/**
 * VELLIA LICITAÇÕES — FASE 37
 * EVENTOS DE DOMÍNIO & MODELO DE EVENTO (Domain Events)
 * 
 * Estrutura e tipagem de eventos de negócio do sistema Vellia Licitações.
 */

export const DomainEventType = {
  // Oportunidades & Radar
  OPPORTUNITY_CREATED: 'OPPORTUNITY_CREATED',
  OPPORTUNITY_UPDATED: 'OPPORTUNITY_UPDATED',
  OPPORTUNITY_DEADLINE_CHANGED: 'OPPORTUNITY_DEADLINE_CHANGED',
  
  // Documentos & Dossiê
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_EXPIRING: 'DOCUMENT_EXPIRING',
  DOCUMENT_EXPIRED: 'DOCUMENT_EXPIRED',
  EDITAL_UPDATED: 'EDITAL_UPDATED',
  REQUIREMENTS_CHANGED: 'REQUIREMENTS_CHANGED',
  DOSSIER_READY: 'DOSSIER_READY',
  DOSSIER_BLOCKED: 'DOSSIER_BLOCKED',
  
  // Go/No-Go & Propostas
  GO_APPROVED: 'GO_APPROVED',
  GO_REJECTED: 'GO_REJECTED',
  PROPOSAL_CREATED: 'PROPOSAL_CREATED',
  PRICE_READY: 'PRICE_READY',
  PRICE_APPROVED: 'PRICE_APPROVED',
  READY_FOR_FINAL_REVIEW: 'READY_FOR_FINAL_REVIEW',
  
  // Participação & Sala de Guerra
  SUBMISSION_RECORDED: 'SUBMISSION_RECORDED',
  SESSION_UPCOMING: 'SESSION_UPCOMING',
  DILIGENCE_CREATED: 'DILIGENCE_CREATED',
  RESULT_WON: 'RESULT_WON',
  RESULT_LOST: 'RESULT_LOST',
  
  // Governança & Aprovações (Fase 36)
  APPROVAL_REQUESTED: 'APPROVAL_REQUESTED',
  APPROVAL_COMPLETED: 'APPROVAL_COMPLETED',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  
  // Contratos & Pós-Vitória (Fase 31)
  CONTRACT_CREATED: 'CONTRACT_CREATED',
  CONTRACT_SIGNED: 'CONTRACT_SIGNED',
  CONTRACT_EXPIRING: 'CONTRACT_EXPIRING',
  RENEWAL_SIGNAL_CREATED: 'RENEWAL_SIGNAL_CREATED',
  
  // Relacionamento & CRM (Fases 27 e 33)
  CONTACT_REPLIED: 'CONTACT_REPLIED',
  FOLLOWUP_OVERDUE: 'FOLLOWUP_OVERDUE',
  MEETING_COMPLETED: 'MEETING_COMPLETED'
};

export const DomainEventTypeLabels = {
  [DomainEventType.OPPORTUNITY_CREATED]: 'Nova Oportunidade Ingerida',
  [DomainEventType.OPPORTUNITY_UPDATED]: 'Oportunidade Atualizada',
  [DomainEventType.OPPORTUNITY_DEADLINE_CHANGED]: 'Prazo da Licitação Alterado',
  [DomainEventType.DOCUMENT_UPLOADED]: 'Documento / Edital Carregado',
  [DomainEventType.DOCUMENT_EXPIRING]: 'Certidão ou Atestado Vencendo',
  [DomainEventType.DOCUMENT_EXPIRED]: 'Certidão Vencida',
  [DomainEventType.EDITAL_UPDATED]: 'Adendo ou Retificação de Edital',
  [DomainEventType.REQUIREMENTS_CHANGED]: 'Requisitos Técnicos Alterados',
  [DomainEventType.DOSSIER_READY]: 'Dossiê de Habilitação Concluído',
  [DomainEventType.DOSSIER_BLOCKED]: 'Blocker Identificado no Dossiê',
  [DomainEventType.GO_APPROVED]: 'Decisão GO Aprovada',
  [DomainEventType.GO_REJECTED]: 'Decisão NO-GO Registrada',
  [DomainEventType.PROPOSAL_CREATED]: 'Proposta Comercial Criada',
  [DomainEventType.PRICE_READY]: 'Preço e Margem Calculados',
  [DomainEventType.PRICE_APPROVED]: 'Preço Aprovado em Alçada',
  [DomainEventType.READY_FOR_FINAL_REVIEW]: 'Pronto para Revisão Final (Gate 4)',
  [DomainEventType.SUBMISSION_RECORDED]: 'Proposta Submetida no Portal',
  [DomainEventType.SESSION_UPCOMING]: 'Sessão de Disputa em Breve (< 2h)',
  [DomainEventType.DILIGENCE_CREATED]: 'Diligência ou Esclarecimento Recebido',
  [DomainEventType.RESULT_WON]: 'Licitação Vencida (Resultado Ganho)',
  [DomainEventType.RESULT_LOST]: 'Licitação Perdida / Arquivada',
  [DomainEventType.APPROVAL_REQUESTED]: 'Solicitação de Aprovação Aberta',
  [DomainEventType.APPROVAL_COMPLETED]: 'Aprovação Concedida em Governança',
  [DomainEventType.APPROVAL_REJECTED]: 'Aprovação Rejeitada',
  [DomainEventType.CONTRACT_CREATED]: 'Contrato Preparado (Pós-Adjudicação)',
  [DomainEventType.CONTRACT_SIGNED]: 'Contrato Assinado Formalmente',
  [DomainEventType.CONTRACT_EXPIRING]: 'Contrato Ativo Vencendo',
  [DomainEventType.RENEWAL_SIGNAL_CREATED]: 'Sinal de Renovação no Radar Antecipado',
  [DomainEventType.CONTACT_REPLIED]: 'Resposta de Contato / Cliente Recebida',
  [DomainEventType.FOLLOWUP_OVERDUE]: 'Follow-up Comercial em Atraso',
  [DomainEventType.MEETING_COMPLETED]: 'Reunião Comercial Concluída'
};

export const ActionMode = {
  AUTO: 'AUTO', // Execução direta interna (Criar Task, Alerta, Timeline)
  REQUIRES_CONFIRMATION: 'REQUIRES_CONFIRMATION', // Prepara e exige aceite humano (Enviar e-mail, solicitar aprovação)
  MANUAL: 'MANUAL' // Nunca dispara automaticamente (Dar lance, assinar contrato)
};

export const WorkflowStatus = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived'
};

/**
 * Cria uma instância de evento padronizada e imutável (Itens 3 a 9)
 */
export function createDomainEvent({
  eventType,
  entityType,
  entityId,
  companyId = 'veeluen-matriz',
  source = 'SYSTEM',
  actor = 'System Orchestrator',
  payload = {},
  correlationId = null
}) {
  const eventId = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  return {
    eventId,
    eventType,
    entityType,
    entityId,
    companyId,
    timestamp: new Date().toISOString(),
    source,
    actor,
    payload,
    correlationId: correlationId || eventId,
    schemaVersion: '1.0.0'
  };
}
