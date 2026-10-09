/**
 * VELLIA LICITAÇÕES — FASE 23: AUDITORIA GERAL + SIMPLIFICAÇÃO + CONSOLIDAÇÃO DO PRODUTO
 * auditModels.js: Enums, Classificações e Estruturas de Dados de Auditoria
 */

export const ModuleStatus = {
  PRODUCTION_READY: { code: 'PRODUCTION_READY', label: 'Production Ready', color: '#10b981', desc: 'Funcionalidade completa, persistente, testada e utilizável.' },
  FUNCTIONAL: { code: 'FUNCTIONAL', label: 'Functional', color: '#06b6d4', desc: 'Funciona com dados ou persistência ativa, mas possui melhorias pendentes.' },
  PARTIAL: { code: 'PARTIAL', label: 'Partial', color: '#f59e0b', desc: 'Apenas parte do fluxo foi implementada ou depende de fallbacks.' },
  MOCK: { code: 'MOCK', label: 'Mock', color: '#a855f7', desc: 'Interface existe, mas dados, integrações ou ações são simulados.' },
  BROKEN: { code: 'BROKEN', label: 'Broken', color: '#ef4444', desc: 'Não funciona corretamente ou apresenta exceções em runtime.' },
  DEPRECATED: { code: 'DEPRECATED', label: 'Deprecated', color: '#64748b', desc: 'Não deve mais ser utilizado ou foi substituído por outro módulo.' },
  DUPLICATED: { code: 'DUPLICATED', label: 'Duplicated', color: '#ec4899', desc: 'Existe outra função que resolve exatamente o mesmo problema.' }
};

export const ButtonActionStatus = {
  FUNCIONAL: { code: 'FUNCIONAL', label: 'Funcional (Ação Real)', color: '#10b981' },
  PARCIAL: { code: 'PARCIAL', label: 'Parcial (Ação Local/Memória)', color: '#06b6d4' },
  SIMULADO: { code: 'SIMULADO', label: 'Simulado (setTimeout/Toast)', color: '#f59e0b' },
  SEM_ACAO: { code: 'SEM_ACAO', label: 'Sem Ação (Apenas Visual)', color: '#a855f7' },
  ERRO: { code: 'ERRO', label: 'Erro em Runtime', color: '#ef4444' }
};

export const TechnicalDebtSeverity = {
  CRITICAL: { code: 'CRITICAL', label: 'Crítico (P0)', color: '#ef4444' },
  HIGH: { code: 'HIGH', label: 'Alto (P1)', color: '#f97316' },
  MEDIUM: { code: 'MEDIUM', label: 'Médio (P2)', color: '#f59e0b' },
  LOW: { code: 'LOW', label: 'Baixo (P3)', color: '#38bdf8' }
};

export const ProductScopeGroup = {
  CORE: { code: 'CORE', label: 'Core Product (Jornada Principal)', icon: 'Compass', color: '#00e5c9' },
  SECONDARY: { code: 'SECONDARY', label: 'Secondary Product (Comercial / CRM)', icon: 'Users', color: '#38bdf8' },
  ADMINISTRATIVE: { code: 'ADMINISTRATIVE', label: 'Administrative & Governance', icon: 'ShieldCheck', color: '#a855f7' }
};
