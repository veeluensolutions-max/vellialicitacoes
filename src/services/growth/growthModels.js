/**
 * VELLIA LICITAÇÕES — FASE 61: GROWTH & OPPORTUNITY EXPANSION ENGINE
 * growthModels.js: Modelos, Enumerações e Estruturas de Oportunidades de Crescimento
 * 
 * Princípio Central:
 * Crescimento inteligente não começa procurando mais clientes.
 * Começa encontrando onde a empresa tem maior razão para vencer,
 * cruzando DEMANDA, CAPACIDADE e POSICIONAMENTO com rigor factual.
 */

// 8. Tipos Estratégicos de Oportunidade de Crescimento
export const GrowthOpportunityType = {
  CROSS_SELL: 'Cross-sell',
  NEW_BUYER: 'New Buyer',
  NEW_REGION: 'New Region',
  NEW_SERVICE_MARKET: 'New Service Market',
  RENEWAL_EXPANSION: 'Renewal Expansion',
  STRATEGIC_ACCOUNT: 'Strategic Account',
  ADJACENT_MARKET: 'Adjacent Market'
};

// 10. Status da Oportunidade de Crescimento (Growth Opportunity != Procurement Opportunity)
export const GrowthOpportunityStatus = {
  IDENTIFIED: 'Identified',
  UNDER_REVIEW: 'Under Review',
  VALIDATED: 'Validated',
  ACTION_PLANNED: 'Action Planned',
  ACTIVE: 'Active',         // REGRA: Nunca marcar ACTIVE sem revisão humana
  DISMISSED: 'Dismissed',
  EXPIRED: 'Expired'
};

// 149. Estágios do Pipeline de Crescimento (Separado do Procurement Pipeline)
export const GrowthPipelineStage = {
  IDENTIFIED: 'Identified',
  VALIDATED: 'Validated',
  ACTION_PLANNED: 'Action Planned',
  ENGAGED: 'Engaged',
  CONVERTED: 'Converted',
  CLOSED: 'Closed'
};

// 88. Prioridade Estratégica de Crescimento
export const GrowthPriority = {
  NOW: 'Now',       // Agir de imediato (alta prontidão + alta evidência)
  BUILD: 'Build',   // Desenvolver capacidade antes de avançar
  WATCH: 'Watch',   // Monitorar demanda no radar / PCA
  IGNORE: 'Ignore'  // Baixo alinhamento estratégico
};

// 176. Nível de Confiança Baseado em Evidências
export const GrowthConfidence = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// 26. Status de Cross-sell
export const CrossSellStatus = {
  POTENTIAL: 'Potential',
  VALIDATED: 'Validated',
  NOT_APPLICABLE: 'Not Applicable'
};

// 80. Quadrantes da Matriz de Expansão (Atratividade de Mercado x Prontidão da Empresa)
export const ExpansionQuadrant = {
  PRIORITIZE: 'Prioritize',                 // Alta Atratividade + Alta Prontidão
  DEVELOP_CAPABILITY: 'Develop Capability', // Alta Atratividade + Baixa/Média Prontidão
  MONITOR: 'Monitor',                       // Média Atratividade + Prontidão Variável
  LOW_PRIORITY: 'Low Priority'              // Baixa Atratividade + Baixa Prontidão
};

// 91. Tipos de Ação de Crescimento
export const GrowthActionType = {
  RESEARCH: 'Pesquisa Técnica e de Mercado',
  RELATIONSHIP: 'Aproximação Institucional Qualificada',
  CAPABILITY: 'Desenvolvimento de Capacidade e Atestados',
  WATCH: 'Monitoramento no Radar Antecipado',
  SCENARIO: 'Simulação no Laboratório de Cenários',
  COMMERCIAL_OUTREACH: 'Abordagem Comercial Supervisionada' // Exige confirmação humana estrita
};

// 163. Motivos de Rejeição Preservados
export const RejectionReason = {
  NOT_STRATEGIC: 'Não Estratégico',
  NO_CAPACITY: 'Capacidade Operacional Insuficiente',
  LOW_MARGIN: 'Margem Histórica Baixa',
  NO_DEMAND_EVIDENCE: 'Evidência de Demanda Frágil ou Insuficiente',
  TIMING: 'Momento Inadequado (Timing)',
  OTHER: 'Outro Motivo Estratégico'
};

// 150. Tipo de Conversão da Oportunidade de Crescimento
export const ConversionTargetType = {
  PROCUREMENT_OPPORTUNITY: 'Procurement Opportunity', // Oportunidade de Licitação
  CRM_OPPORTUNITY: 'CRM Opportunity',                 // Oportunidade Comercial Direta
  CONTRACT_EXPANSION: 'Contract Expansion'            // Aditivo ou Expansão Contratual
};

// 157. Tipos de Desfecho de Crescimento
export const GrowthOutcomeType = {
  OPPORTUNITY_CREATED: 'Oportunidade Criada',
  RELATIONSHIP_CREATED: 'Relacionamento Institucional Aberto',
  CAPABILITY_INVESTMENT: 'Investimento em Capacitação Aprovado',
  NO_ACTION: 'Nenhuma Ação Recomendada',
  NOT_RELEVANT: 'Descartado / Não Relevante'
};

// Fontes de Evidência Válidas
export const EvidenceSourceType = {
  HISTORICAL_PURCHASE: 'Compra Histórica Registrada',
  ACTIVE_CONTRACT: 'Contrato Vigente',
  RECURRING_OPPORTUNITY: 'Licitação Recorrente em Portal',
  RELATED_SERVICE: 'Demanda de Serviço Conexo',
  BUYER_PATTERN: 'Padrão Estruturado de Compras',
  EXPIRY_SIGNAL: 'Vencimento Contratual em Radar Antecipado',
  CRM_RELATIONSHIP: 'Histórico de Relacionamento no CRM',
  MARKET_GROWTH: 'Crescimento de Demanda no Setor'
};
