/**
 * VELLIA LICITAÇÕES — FASE 66: PREDICTIVE READINESS & RISK FORECASTING
 * predictiveRiskModels.js: Modelos Canônicos, Enums e Estruturas de Dados de Risco Preditivo
 */

export const PredictiveRiskTarget = {
  NO_SUBMISSION: 'Risco de Não-Submissão (No Submission)',
  LATE_READINESS: 'Risco de Prontidão Tardia (Late Readiness < T-24h)',
  CRITICAL_BLOCKER_T24: 'Risco de Bloqueador Crítico Persistir a T-24h',
  APPROVAL_DELAY: 'Risco de Atraso em Alçada de Aprovação',
  PROCESS_DISQUALIFICATION: 'Risco de Inabilitação por Falha de Processo'
};

export const PredictiveRiskLevel = {
  LOW: 'Baixo (Low)',
  MODERATE: 'Moderado (Moderate)',
  HIGH: 'Alto (High)',
  CRITICAL: 'Crítico (Critical)'
};

// Aliases para conveniência de importação
export const RiskLevel = PredictiveRiskLevel;
export const TargetRisk = PredictiveRiskTarget;

export const RiskTrajectory = {
  IMPROVING: 'Melhorando (Improving)',
  STABLE: 'Estável (Stable)',
  WORSENING: 'Deteriorando (Worsening)'
};

export const ModelStatus = {
  EXPERIMENTAL: 'Experimental (Em Laboratório)',
  SHADOW: 'Modo Shadow (Validação Silenciosa)',
  VALIDATED: 'Validado pelo Comitê Técnico',
  PRODUCTION: 'Ativo em Produção',
  RETIRED: 'Aposentado / Obsoleto'
};

export const ConfidenceLevel = {
  HIGH: 'Alta Confiança (Dados Completos)',
  MEDIUM: 'Média Confiança (Dados Parciais)',
  LOW: 'Baixa Confiança (Amostra / Cobertura Reduzida)'
};

export const FeatureGroupType = {
  TIME: 'Tempo & Prazos',
  DOCUMENT: 'Prontidão Documental',
  APPROVAL: 'Alçadas & Aprovações',
  PRICING: 'Precificação & Margem',
  CAPACITY: 'Capacidade & Recursos',
  PARTNER: 'Estratégia de Parceiros',
  PROCESS: 'Gargalos do Lifecycle',
  DATA_QUALITY: 'Qualidade da Informação'
};

export const HumanAssessmentStatus = {
  AGREED: 'Concordância com o Modelo',
  DIFFERS: 'Discordância Humana Justificada (Override)',
  NOT_REVIEWED: 'Ainda Não Avaliado por Humano'
};
