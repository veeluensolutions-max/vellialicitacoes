/**
 * VELLIA LICITAÇÕES — FASE 65: OUTCOME INTELLIGENCE
 * outcomeModels.js: Enums, Tipos e Modelos Canônicos de Aprendizado sobre Resultados
 */

export const OutcomeResultType = {
  WON: 'Vencida (Won)',
  LOST: 'Perdida (Lost)',
  CANCELLED: 'Revogada / Anulada (Cancelled)',
  WITHDRAWN: 'Retirada Estratégica (Withdrawn)',
  DISQUALIFIED: 'Desclassificada / Inabilitada (Disqualified)',
  NO_SUBMISSION: 'Não Submetida após GO (No Submission)',
  UNKNOWN: 'Resultado Não Informado (Unknown)'
};

export const DisqualificationReason = {
  DOCUMENT: 'Falha ou Ausência Documental',
  TECHNICAL: 'Incompatibilidade de Capacidade Técnica / Atestado',
  COMMERCIAL: 'Erro em Planilha de Custos / Proposta Comercial',
  DEADLINE: 'Perda de Prazo na Sessão de Lances / Envio',
  PORTAL: 'Instabilidade Técnica do Portal Licitatório',
  OTHER: 'Outro Motivo Formal'
};

export const NoSubmissionReason = {
  DEADLINE: 'Falta de Tempo Hábil / Prazo Exíguo',
  DOCUMENT_GAP: 'Gargalo Documental / Certidão Ausente',
  APPROVAL_DELAY: 'Atraso na Aprovação de Alçada / Preço',
  PRICING: 'Inviabilidade de Margem na Precificação Final',
  CAPACITY: 'Restrição de Equipe ou Equipamento',
  PARTNER: 'Desistência ou Indisponibilidade do Parceiro',
  PORTAL_FAILURE: 'Indisponibilidade do Portal de Submissão',
  STRATEGIC_WITHDRAWAL: 'Decisão Estratégica Deliberada de Não Participar'
};

export const LossReasonCategory = {
  OFFICIAL_REASON: 'Razão Oficial em Ata / Relatório do Pregoeiro',
  INTERNAL_ASSESSMENT: 'Avaliação Crítica Interna (Post-Mortem)',
  INFERRED_SIGNAL: 'Sinal Analítico Inferido por Dados de Mercado'
};

export const PatternStatus = {
  CANDIDATE: 'Padrão em Observação (Candidate)',
  VALIDATED: 'Padrão Validado por Repetição (Validated)',
  DEPRECATED: 'Padrão Obsoleto / Processo Alterado (Deprecated)'
};

export const ContractExecutionOutcome = {
  SUCCESSFUL: 'Execução Bem-Sucedida (Meta de Margem Atingida)',
  MARGIN_EROSION: 'Erosão de Margem durante Execução',
  SLA_INCIDENT: 'Incidente Crítico de SLA / Notificação',
  EXECUTION_ISSUES: 'Problemas Operacionais / Rebalanceamento Forçado',
  NOT_APPLICABLE: 'Não Aplicável (Certame não vencido)',
  IN_PROGRESS: 'Contrato em Andamento'
};

export const DataCoverageStatus = {
  COMPLETE: 'Dados Completos (100%)',
  PARTIAL: 'Dados Parciais (50-99%)',
  INSUFFICIENT: 'Dados Insuficientes (< 50%)'
};

export const ParticipationStructureType = {
  SOLO: 'Participação Individual (Solo)',
  PARTNER_SUPPORT: 'Apoio Especializado de Parceiro',
  SUBCONTRACTING: 'Subcontratação Formal de Escopo',
  CONSORTIUM: 'Consórcio Estruturado'
};
