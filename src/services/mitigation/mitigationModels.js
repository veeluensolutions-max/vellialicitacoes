/**
 * VELLIA LICITAÇÕES — FASE 67: PRESCRIPTIVE RISK MITIGATION + RECOVERY PLANNER
 * mitigationModels.js: Modelos Canônicos, Enums e Estruturas de Mitigação de Risco
 */

export const PlanStatus = {
  DRAFT: 'Draft (Rascunho)',
  UNDER_REVIEW: 'Under Review (Em Análise)',
  APPROVED: 'Approved (Aprovado)',
  IN_PROGRESS: 'In Progress (Em Execução)',
  COMPLETED: 'Completed (Concluído)',
  FAILED: 'Failed (Falhou)',
  EXPIRED: 'Expired (Expirado)',
  CANCELLED: 'Cancelled (Cancelado)'
};

export const OptionType = {
  DOCUMENT_RESOLUTION: 'Document Resolution',
  APPROVAL_ESCALATION: 'Approval Escalation',
  PARTNER_ACTION: 'Partner Action',
  CAPACITY_ADJUSTMENT: 'Capacity Adjustment',
  PRICING_REVIEW: 'Pricing Review',
  SCOPE_REVIEW: 'Scope Review',
  DEADLINE_CLARIFICATION: 'Deadline Clarification',
  ALTERNATIVE_STRATEGY: 'Alternative Strategy',
  WITHDRAWAL_REVIEW: 'Withdrawal Review',
  MANUAL_INVESTIGATION: 'Manual Investigation'
};

export const ExpectedImpact = {
  HIGH: 'High (Alto)',
  MEDIUM: 'Medium (Médio)',
  LOW: 'Low (Baixo)'
};

export const EffortLevel = {
  LOW: 'Low (Baixo)',
  MEDIUM: 'Medium (Médio)',
  HIGH: 'High (Alto)'
};

export const UrgencyLevel = {
  IMMEDIATE: 'Imediata (< 6h)',
  HIGH: 'Alta (< 24h)',
  MODERATE: 'Moderada (< 48h)',
  LOW: 'Baixa (> 48h)'
};

export const OptionViability = {
  VIABLE: 'Viable (Viável)',
  AT_RISK: 'At Risk (Em Risco)',
  UNLIKELY: 'Unlikely (Pouco Provável / Inviável no Prazo)',
  UNKNOWN: 'Unknown (Indeterminada)'
};

export const RecoveryWindowStatus = {
  OPEN: 'Open (Aberta > 48h)',
  NARROW: 'Narrow (Estreita 18h - 36h)',
  CRITICAL: 'Critical (Crítica < 18h)',
  LIKELY_CLOSED: 'Likely Closed (Provavelmente Fechada)',
  UNKNOWN: 'Unknown (Indeterminada)'
};

export const ActionStatus = {
  PENDING: 'Pending (Pendente)',
  IN_PROGRESS: 'In Progress (Em Execução)',
  COMPLETED: 'Completed (Concluída)',
  BLOCKED: 'Blocked (Bloqueada)',
  CANCELLED: 'Cancelled (Cancelada)'
};

export const MitigationEffectiveness = {
  EFFECTIVE: 'Efetivo (Restaurou Prontidão)',
  PARTIALLY_EFFECTIVE: 'Parcialmente Efetivo',
  INEFFECTIVE: 'Inefetivo (Não removeu o gargalo)',
  UNKNOWN: 'Não Avaliado'
};

export const CostSource = {
  QUOTATION: 'Cotação Formal',
  HISTORICAL: 'Base Histórica de Certames',
  MANUAL_ASSUMPTION: 'Premissa Manual do Gestor',
  UNKNOWN: 'Desconhecido / Não Aplicável'
};
