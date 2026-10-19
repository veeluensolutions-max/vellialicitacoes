/**
 * VELLIA LICITAÇÕES — FASE 36
 * GOVERNANÇA DE DECISÕES + ALÇADAS + APROVAÇÕES + EXCEÇÕES
 * 
 * Definições de Tipos, Enums e Estruturas de Dados do Sistema de Governança
 */

export const ApprovalType = {
  GO_NO_GO: 'GO_NO_GO',
  PRECO: 'PRECO',
  MARGEM: 'MARGEM',
  FLOOR_PRICE_OVERRIDE: 'FLOOR_PRICE_OVERRIDE',
  PROPOSTA: 'PROPOSTA',
  DOSSIE: 'DOSSIE',
  BLOCKER_OVERRIDE: 'BLOCKER_OVERRIDE',
  RISCO_ELEVADO: 'RISCO_ELEVADO',
  ENVIO: 'ENVIO',
  ALTERACAO_POS_APROVACAO: 'ALTERACAO_POS_APROVACAO',
  CONTRATO: 'CONTRATO',
  EXCECAO_DOCUMENTAL: 'EXCECAO_DOCUMENTAL'
};

export const ApprovalTypeLabels = {
  [ApprovalType.GO_NO_GO]: 'Decisão GO / NO-GO',
  [ApprovalType.PRECO]: 'Aprovação de Preço',
  [ApprovalType.MARGEM]: 'Aprovação de Margem',
  [ApprovalType.FLOOR_PRICE_OVERRIDE]: 'Override de Floor Price',
  [ApprovalType.PROPOSTA]: 'Proposta Comercial Final',
  [ApprovalType.DOSSIE]: 'Dossiê de Habilitação',
  [ApprovalType.BLOCKER_OVERRIDE]: 'Override de Blocker Documental',
  [ApprovalType.RISCO_ELEVADO]: 'Participação com Risco Elevado',
  [ApprovalType.ENVIO]: 'Autorização de Envio (Gate 4)',
  [ApprovalType.ALTERACAO_POS_APROVACAO]: 'Alteração Material Pós-Aprovação',
  [ApprovalType.CONTRATO]: 'Handoff de Contrato Ganho',
  [ApprovalType.EXCECAO_DOCUMENTAL]: 'Exceção Documental Temporária'
};

export const ApprovalStatus = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  APPROVED_WITH_CONDITIONS: 'APPROVED_WITH_CONDITIONS',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  SUPERSEDED: 'SUPERSEDED'
};

export const ApprovalStatusLabels = {
  [ApprovalStatus.DRAFT]: 'Rascunho',
  [ApprovalStatus.PENDING]: 'Pendente de Aprovação',
  [ApprovalStatus.APPROVED]: 'Aprovado',
  [ApprovalStatus.APPROVED_WITH_CONDITIONS]: 'Aprovado com Condições',
  [ApprovalStatus.CHANGES_REQUESTED]: 'Ajustes Solicitados',
  [ApprovalStatus.REJECTED]: 'Rejeitado',
  [ApprovalStatus.CANCELLED]: 'Cancelado',
  [ApprovalStatus.EXPIRED]: 'SLA Expirado',
  [ApprovalStatus.SUPERSEDED]: 'Substituído (Material Change)'
};

export const ApprovalPriority = {
  BAIXA: 'BAIXA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  CRITICA: 'CRITICA'
};

export const ApproverRole = {
  GESTOR_COMERCIAL: 'GESTOR_COMERCIAL',
  GERENCIA_LICITACOES: 'GERENCIA_LICITACOES',
  CONTROLADORIA_FINANCEIRO: 'CONTROLADORIA_FINANCEIRO',
  RESPONSAVEL_TECNICO: 'RESPONSAVEL_TECNICO',
  DIRETORIA_EXECUTIVA: 'DIRETORIA_EXECUTIVA',
  ADMIN: 'ADMIN'
};

export const ApproverRoleLabels = {
  [ApproverRole.GESTOR_COMERCIAL]: 'Gestor Comercial',
  [ApproverRole.GERENCIA_LICITACOES]: 'Gerência de Licitações',
  [ApproverRole.CONTROLADORIA_FINANCEIRO]: 'Controladoria & Financeiro',
  [ApproverRole.RESPONSAVEL_TECNICO]: 'Responsável Técnico (Engenharia)',
  [ApproverRole.DIRETORIA_EXECUTIVA]: 'Diretoria Executiva',
  [ApproverRole.ADMIN]: 'Administrador de Governança'
};

export const DecisionGate = {
  GATE_1_PARTICIPATION: 'GATE_1_PARTICIPATION',
  GATE_2_PRICE: 'GATE_2_PRICE',
  GATE_3_DOSSIER: 'GATE_3_DOSSIER',
  GATE_4_SUBMISSION: 'GATE_4_SUBMISSION',
  GATE_5_CONTRACT: 'GATE_5_CONTRACT'
};

export const DecisionGateLabels = {
  [DecisionGate.GATE_1_PARTICIPATION]: 'Gate 1 — Participação (Go/No-Go)',
  [DecisionGate.GATE_2_PRICE]: 'Gate 2 — Preço e Margem',
  [DecisionGate.GATE_3_DOSSIER]: 'Gate 3 — Dossiê de Habilitação',
  [DecisionGate.GATE_4_SUBMISSION]: 'Gate 4 — Autorização de Envio',
  [DecisionGate.GATE_5_CONTRACT]: 'Gate 5 — Contrato e Handoff'
};

export const RejectionReasonCodes = [
  'Margem Operacional Inadequada',
  'Risco Jurídico / Contratual Excessivo',
  'Documentação Técnica Insuficiente',
  'Preço Desalinhado da Concorrência',
  'Capacidade Interna Excedida (Sobrecarga de Equipe)',
  'Incompatibilidade de Escopo com Objeto Social',
  'Falta de Certidão / Blocker Insuperável',
  'Outro (Especificar na Justificativa)'
];

export const ExceptionReasonCodes = [
  'Cliente Âncora Prioritário na Região',
  'Certidão em Renovação com Protocolo Válido',
  'Margem Compensada em Aditivo ou Contrato Derivado',
  'Mitigação Técnica Garantida por Subcontratação Aprovada',
  'Defesa de Posição / Bloqueio a Concorrente Agressivo',
  'Autorização Estratégica da Diretoria (Override)'
];
