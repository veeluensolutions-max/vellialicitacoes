/**
 * VELLIA LICITAÇÕES — FASE 22: GO-LIVE CONTROLADO + PILOTO REAL + OPERAÇÃO ASSISTIDA
 * goLiveModels.js: Modelos, Enums, Constantes e Tipos de Dados da Fase 22
 */

export const GoLivePhase = {
  PREPARACAO: 'PREPARAÇÃO',
  PILOTO_INTERNO: 'PILOTO INTERNO',
  PILOTO_DADOS_REAIS: 'PILOTO COM DADOS REAIS',
  OPERACAO_ASSISTIDA: 'OPERAÇÃO ASSISTIDA',
  PRODUCAO: 'PRODUÇÃO',
  PAUSADO: 'PAUSADO'
};

export const PHASE_SEQUENCE = [
  GoLivePhase.PREPARACAO,
  GoLivePhase.PILOTO_INTERNO,
  GoLivePhase.PILOTO_DADOS_REAIS,
  GoLivePhase.OPERACAO_ASSISTIDA,
  GoLivePhase.PRODUCAO
];

export const GoLiveApprovalDecision = {
  APROVADO: 'APROVADO',
  APROVADO_COM_PENDENCIAS: 'APROVADO COM PENDÊNCIAS',
  NAO_APROVADO: 'NÃO APROVADO'
};

export const IncidentSeverity = {
  SEV1: { code: 'SEV-1', label: 'SEV-1 — Sistema indisponível / risco de perda de dados', level: 1, critical: true },
  SEV2: { code: 'SEV-2', label: 'SEV-2 — Função crítica indisponível', level: 2, critical: true },
  SEV3: { code: 'SEV-3', label: 'SEV-3 — Problema relevante', level: 3, critical: false },
  SEV4: { code: 'SEV-4', label: 'SEV-4 — Baixo impacto', level: 4, critical: false }
};

export const FeedbackType = {
  BUG: { code: 'BUG', label: 'Bug / Falha Técnica' },
  SUGGESTION: { code: 'SUGGESTION', label: 'Sugestão de Melhoria' },
  DATA_ERROR: { code: 'DATA_ERROR', label: 'Dado Incorreto' },
  MATCHING_ERROR: { code: 'MATCHING_ERROR', label: 'Aderência / Matching Incorreto' },
  UI_ISSUE: { code: 'UI_ISSUE', label: 'Problema Visual / Usabilidade' },
  PERFORMANCE: { code: 'PERFORMANCE', label: 'Problema de Performance / Lentidão' },
  OTHER: { code: 'OTHER', label: 'Outro' }
};

export const PilotBacklogClassification = {
  FIX_BEFORE_PROD: { code: 'FIX_BEFORE_PROD', label: 'Corrigir antes da produção', priorityWeight: 10 },
  CAN_WAIT: { code: 'CAN_WAIT', label: 'Pode esperar', priorityWeight: 5 },
  FUTURE_IMPROVEMENT: { code: 'FUTURE_IMPROVEMENT', label: 'Melhoria futura', priorityWeight: 2 },
  DO_NOT_DO: { code: 'DO_NOT_DO', label: 'Não fazer', priorityWeight: 0 }
};

export const FeatureFlagStatus = {
  STABLE: 'Stable',
  BETA: 'Beta',
  EXPERIMENTAL: 'Experimental',
  DISABLED: 'Disabled'
};

export const DataHealthStatus = {
  GOOD: 'Good',
  ATTENTION: 'Attention',
  CRITICAL: 'Critical'
};

export const PilotGoals = {
  MIN_AVAILABILITY_PCT: 99.0,
  MAX_DATA_LOSS: 0,
  MAX_CRITICAL_DUPLICATES: 0,
  MIN_MATCHING_USEFUL_PCT: 80.0,
  RESOLVED_P0_PCT: 100.0
};
