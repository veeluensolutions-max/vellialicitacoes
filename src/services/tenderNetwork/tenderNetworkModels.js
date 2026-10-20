/**
 * VELLIA LICITAÇÕES — FASE 63: TENDER INTELLIGENCE NETWORK
 * tenderNetworkModels.js: Modelos Canônicos, Enums e Tipos de Dados de Fontes e Cobertura
 */

export const TenderSourceType = {
  OFFICIAL_API: 'API Oficial',
  PUBLIC_API: 'API Pública',
  PUBLIC_FEED: 'Feed Público (RSS/Atom)',
  PUBLIC_PORTAL: 'Portal Público',
  MANUAL_IMPORT: 'Importação Manual',
  PARTNER_FEED: 'Feed de Parceiro',
  OTHER: 'Outro'
};

export const SourceTrustLevel = {
  OFFICIAL: 'Oficial',       // PNCP, Compras.gov, Diários Oficiais primários
  VERIFIED: 'Verificado',   // Portais estaduais/municipais com contrato/termo público
  SECONDARY: 'Secundário',   // Agregadores e espelhos públicos
  EXPERIMENTAL: 'Experimental' // Fontes em teste / shadow mode
};

export const SourceHealthStatus = {
  HEALTHY: 'Saudável',
  DELAYED: 'Atrasado',
  DEGRADED: 'Degradado',
  OFFLINE: 'Offline',
  UNKNOWN: 'Desconhecido',
  RETIRED: 'Aposentada'
};

export const CoverageLevel = {
  STRONG: 'Forte (>= 80%)',
  MODERATE: 'Moderada (40-79%)',
  WEAK: 'Fraca (< 40%)',
  UNKNOWN: 'Não Avaliada'
};

export const CandidateStatus = {
  DISCOVERED: 'Descoberta',
  EVALUATING: 'Em Avaliação',
  APPROVED: 'Aprovada para Integração',
  BUILDING: 'Em Construção',
  TESTING: 'Em Teste (Shadow Mode)',
  ACTIVE: 'Ativa em Produção',
  REJECTED: 'Rejeitada'
};

export const PrioritizationQuadrant = {
  QUICK_WIN: 'Quick Win (Alto Ganho / Baixa Complexidade)',
  STRATEGIC: 'Estratégica (Alto Ganho / Alta Complexidade)',
  LOW_PRIORITY: 'Baixa Prioridade (Baixo Ganho / Baixa Complexidade)',
  AVOID: 'Evitar (Baixo Ganho / Alta Complexidade)'
};

export const ConflictStatus = {
  DETECTED: 'Detectado',
  UNDER_REVIEW: 'Em Revisão',
  RESOLVED: 'Resolvido',
  IGNORED: 'Ignorado'
};

export const MatchConfidenceType = {
  EXACT: 'Correspondência Exata (100%)',
  STRONG_MATCH: 'Correspondência Forte (>= 85%)',
  POSSIBLE_MATCH: 'Correspondência Possível (Requer Revisão Humana)',
  NO_MATCH: 'Sem Correspondência'
};

export const AuthenticationType = {
  PUBLIC: 'Pública (Sem Autenticação)',
  AUTHENTICATED_OFFICIAL: 'Oficial Autenticada (Token/Certificado Autorizado)',
  MANUAL: 'Manual / Importação'
};

export const ConflictFieldType = {
  DEADLINE: 'Data de Encerramento / Prazo',
  ESTIMATED_VALUE: 'Valor Estimado',
  STATUS: 'Status do Certame',
  DOCUMENT_VERSION: 'Versão do Edital / Documento',
  MODALITY: 'Modalidade de Licitação',
  BUYER: 'Órgão Licitante'
};
