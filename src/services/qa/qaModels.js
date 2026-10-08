/**
 * VELLIA LICITAÇÕES — FASE 21: QA + OBSERVABILIDADE + PREPARAÇÃO PARA PRODUÇÃO
 * qaModels.js: Modelos, Enums e Tipos para QA, Testes, Severidade e Prontidão
 */

export const TestSeverity = {
  P0: 'P0', // Crítico: Falha impede operação ou gera risco grave (Bloqueia deploy/Go-Live)
  P1: 'P1', // Alto: Afeta fluxo importante de negócio
  P2: 'P2', // Médio: Afeta funcionalidade secundária
  P3: 'P3'  // Baixo: Problema visual ou melhoria
};

export const TestType = {
  UNIT: 'UNIT',
  INTEGRATION: 'INTEGRATION',
  E2E: 'E2E',
  SECURITY: 'SECURITY',
  PERFORMANCE: 'PERFORMANCE',
  PERMISSION: 'PERMISSION',
  RESILIENCE: 'RESILIENCE',
  REGRESSION: 'REGRESSION'
};

export const TestStatus = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  RUNNING: 'RUNNING',
  SKIPPED: 'SKIPPED',
  BLOCKED: 'BLOCKED'
};

export const SystemEnvironment = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

export const BugStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  FIXED: 'FIXED',
  VERIFIED: 'VERIFIED',
  CLOSED: 'CLOSED'
};

export const ServiceHealthLevel = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  DOWN: 'DOWN',
  MAINTENANCE: 'MAINTENANCE'
};

export const JobLifecycleStatus = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING',
  STUCK: 'STUCK',
  DEAD_LETTER: 'DEAD_LETTER'
};

export const GoLiveGateStatus = {
  READY: 'READY',
  BLOCKED: 'BLOCKED',
  WARNING: 'WARNING'
};
