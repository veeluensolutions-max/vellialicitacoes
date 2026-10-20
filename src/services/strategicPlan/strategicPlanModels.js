/**
 * VELLIA LICITAÇÕES — FASE 70: STRATEGIC PLANNING + ANNUAL OPERATING PLAN 2.0
 * strategicPlanModels.js: Modelos Canônicos, Tipos e Enums do Plano Estratégico Vivo
 */

export const PlanStatus = {
  DRAFT: 'Draft',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  ACTIVE: 'Active',
  REVISED: 'Revised',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived'
};

export const ObjectiveType = {
  GROWTH: 'Growth',
  CAPABILITY: 'Capability',
  MARKET: 'Market',
  FINANCIAL_PIPELINE: 'Financial Pipeline',
  OPERATIONAL: 'Operational',
  RELATIONSHIP: 'Relationship',
  CONTRACT: 'Contract',
  PROCESS: 'Process'
};

export const TargetType = {
  PIPELINE_TARGET: 'Pipeline target',
  QUALIFIED_PIPELINE_TARGET: 'Qualified pipeline target',
  CONTRACT_TARGET: 'Contract target',
  MARKET_TARGET: 'Market target',
  CAPABILITY_TARGET: 'Capability target',
  PROCESS_TARGET: 'Process target'
};

export const TargetSource = {
  MANUAL_EXECUTIVE: 'Manual executive target',
  HISTORICAL_BENCHMARK: 'Historical benchmark',
  STRATEGIC_DECISION: 'Strategic decision'
};

export const AssumptionStatus = {
  OPEN: 'Open',
  CONFIRMED: 'Confirmed',
  PARTIALLY_CONFIRMED: 'Partially Confirmed',
  INVALIDATED: 'Invalidated',
  UNKNOWN: 'Unknown'
};

export const StrategicRiskCategory = {
  MARKET: 'Market',
  PIPELINE: 'Pipeline',
  CAPACITY: 'Capacity',
  CONTRACT: 'Contract',
  FINANCIAL_PIPELINE: 'Financial Pipeline',
  EXECUTION: 'Execution',
  DATA: 'Data'
};

export const StrategicBoundaryType = {
  PURSUUE: 'What we will pursue',
  SELECTIVELY_PURSUE: 'What we will selectively pursue',
  DO_NOT_PURSUE: 'What we will not pursue'
};

export const PlanHealthStatus = {
  ON_TRACK: 'On Track',
  ATTENTION: 'Attention',
  AT_RISK: 'At Risk'
};

export const AlignmentCategory = {
  ALIGNED: 'Aligned',
  ADJACENT: 'Adjacent',
  OUTSIDE_PRIORITY: 'Outside Current Priority'
};
