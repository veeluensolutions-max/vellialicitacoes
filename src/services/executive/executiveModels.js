/**
 * VELLIA LICITAÇÕES — FASE 20: CENTRO DE COMANDO EXECUTIVO
 * executiveModels.js: Modelos de Dados, Enums, Pesos de Estágio e Permissões Executivas
 * (Itens 1 a 6, 14, 22, 23, 29, 30, 48, 58, 78)
 */

// 1. Pesos de Ponderação do Pipeline por Estágio (Itens 5 e 6)
export const PipelineStageWeight = {
  MONITORADA: 0.05,            // 5%
  RELEVANTE: 0.10,             // 10%
  GO: 0.25,                    // 25%
  PROPOSTA_PREPARACAO: 0.40,   // 40%
  PROPOSTA_ENVIADA: 0.60,      // 60%
  FINALISTA: 0.80,             // 80%
  GANHA: 1.00                  // 100%
};

// 2. Classificações de Forecast Comercial (Itens 14 a 18)
export const ForecastCategory = {
  COMMIT: 'Commit',         // Alta confiança operacional
  BEST_CASE: 'Best Case',   // Oportunidades boas com alguma incerteza
  PIPELINE: 'Pipeline',     // Em desenvolvimento ativo
  UPSIDE: 'Upside',         // Radar antecipado e futuras
  LOST: 'Lost'              // Descartadas ou perdidas
};

// 3. Nível de Confiança do Forecast (Item 22)
export const ForecastConfidence = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa'
};

// 4. Cenários de Forecast (Itens 48 a 51)
export const ForecastScenario = {
  CONSERVADOR: 'Conservador', // Apenas Commit
  BASE: 'Base',               // Commit + 50% Best Case ponderado
  OTIMISTA: 'Otimista'        // Commit + Best Case + 25% Pipeline ponderado
};

// 5. Tipos de Metas Comerciais (Item 23)
export const GoalType = {
  OPPORTUNITIES_RELEVANT: 'Oportunidades Relevantes',
  PROPOSALS_SENT: 'Propostas Enviadas',
  PROPOSALS_VALUE: 'Valor de Propostas',
  CONTRACTS_WON: 'Contratos Ganhos',
  REVENUE_CONTRACTED: 'Receita Contratada',
  WIN_RATE: 'Taxa de Vitória (Win Rate)',
  NEW_ACCOUNTS: 'Novos Órgãos Relacionados',
  MEETINGS: 'Reuniões Realizadas',
  FOLLOW_UPS: 'Follow-ups Concluídos'
};

// 6. Períodos de Metas (Item 24)
export const GoalPeriod = {
  MENSAL: 'Mensal',
  TRIMESTRAL: 'Trimestral',
  ANUAL: 'Anual'
};

// 7. Status do Ritmo da Meta (Pace) (Itens 29 e 30)
export const GoalPaceStatus = {
  RISK: 'Meta em risco',
  ON_TRACK: 'Meta no ritmo',
  ACHIEVED: 'Meta atingida',
  SURPASSED: 'Meta superada'
};

// 8. Saúde Operacional (Itens 58 e 59)
export const OperationalHealthStatus = {
  SAUDAVEL: 'Saudável',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico'
};

// 9. Perfis de Visão Salva (Item 63)
export const ExecutiveViewPreset = {
  DIRETORIA: 'Visão Diretoria',
  COMERCIAL: 'Visão Comercial',
  LICITACOES: 'Visão Licitações',
  TECNICA: 'Visão Técnica'
};

// 10. Permissões Granulares Executivas (Item 78)
export const ExecutivePermissions = {
  EXECUTIVE_DASHBOARD_VIEW: 'executive.dashboard.view',
  FORECAST_VIEW: 'forecast.view',
  GOALS_VIEW: 'goals.view',
  GOALS_MANAGE: 'goals.manage',
  FINANCIAL_EXECUTIVE_VIEW: 'financial.executive.view'
};
