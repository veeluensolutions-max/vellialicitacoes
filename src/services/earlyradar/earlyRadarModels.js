/**
 * VELLIA LICITAÇÕES — FASE 16
 * earlyRadarModels.js
 * Modelos de dados, enums e cálculo de Future Opportunity Score para o Radar Antecipado.
 */

export const SignalType = {
  PCA: 'PCA', // Plano de Contratações Anual oficial
  CONTRATO_EXPIRING: 'CONTRATO_A_VENCER', // Contrato vigente próximo ao vencimento
  RECORRENCIA_HISTORICA: 'HISTORICO_RECORRENTE', // Padrão repetitivo nos últimos anos
  ATA_EXPIRING: 'ATA_PROXIMA_DO_FIM', // Ata de registro de preços próxima ao limite
  COMPRA_REPETITIVA: 'COMPRA_REPETITIVA', // Aquisições de rotina identificadas
  PLANEJAMENTO_OFICIAL: 'PLANEJAMENTO_OFICIAL', // ETP/TR ou divulgação preliminar
  MERCADO_INTERNO: 'MERCADO_INTERNO', // Informação de inteligência de mercado
  MANUAL: 'SINAL_MANUAL' // Registrado pela equipe comercial
};

export const EarlyRecordType = {
  PLANNED: 'PLANNED', // Planejamento oficial publicado (PCA/ETP preliminar)
  PREDICTED: 'PREDICTED', // Inferência estatística/temporal baseada em evidências
  OPEN: 'OPEN', // Licitação oficialmente aberta
  CLOSED: 'CLOSED' // Licitação concluída ou sinal encerrado
};

export const ExpirationWindow = {
  ATE_30_DIAS: 'ATE_30_DIAS',
  DIAS_31_60: 'DIAS_31_60',
  DIAS_61_90: 'DIAS_61_90',
  DIAS_91_180: 'DIAS_91_180',
  MAIS_180_DIAS: 'MAIS_180_DIAS'
};

export const ScoreTier = {
  MUITO_ALTO: 'POTENCIAL_MUITO_ALTO', // 85-100
  ALTO: 'POTENCIAL_ALTO', // 70-84
  MONITORAR: 'MONITORAR', // 50-69
  BAIXO: 'BAIXO_SINAL' // < 50
};

export const AlertPriority = {
  INFORMATIVO: 'INFORMATIVO',
  MONITORAR: 'MONITORAR',
  PREPARAR: 'PREPARAR',
  ALTA_PRIORIDADE: 'ALTA_PRIORIDADE'
};

export const IncumbencyRisk = {
  BAIXO: 'BAIXO',
  MEDIO: 'MEDIO',
  ALTO: 'ALTO'
};

/**
 * Pesos padrão para cálculo do Future Opportunity Score (0 a 100)
 * Requisito Item 19:
 * PCA oficial: 30%
 * Contrato próximo do fim: 20%
 * Recorrência: 15%
 * Aderência técnica: 15%
 * Valor histórico: 10%
 * Interesse estratégico: 10%
 */
export const DEFAULT_SCORE_WEIGHTS = {
  pcaOficial: 0.30,
  contratoFim: 0.20,
  recorrencia: 0.15,
  aderencia: 0.15,
  valor: 0.10,
  interesseEstrategico: 0.10
};

/**
 * Calcula o Future Opportunity Score (0-100) e fornece explicação detalhada e rastreabilidade.
 * Requisitos Itens 18, 19, 20, 21, 55, 56.
 */
export function calculateFutureOpportunityScore(factors = {}, weights = DEFAULT_SCORE_WEIGHTS) {
  const {
    hasPca = false,
    contractDaysRemaining = null, // ex: 45
    hasRecurrence = false,
    recurrenceCount = 0,
    adherencePercent = 0, // 0 a 100
    estimatedValue = 0,
    isStrategicServiceOrOrgan = false
  } = factors;

  const explanationItems = [];
  let scoreAccumulator = 0;

  // 1. PCA Oficial (peso 30)
  if (hasPca) {
    const pts = 100 * weights.pcaOficial;
    scoreAccumulator += pts;
    explanationItems.push({
      factor: 'PCA Oficial Publicado',
      points: pts,
      reason: 'Planejamento oficial identificado no Plano de Contratações Anual do órgão.'
    });
  }

  // 2. Contrato próximo do fim (peso 20)
  if (contractDaysRemaining !== null && contractDaysRemaining !== undefined) {
    let contractFraction = 0;
    if (contractDaysRemaining <= 30) contractFraction = 1.0;
    else if (contractDaysRemaining <= 60) contractFraction = 0.9;
    else if (contractDaysRemaining <= 90) contractFraction = 0.75;
    else if (contractDaysRemaining <= 180) contractFraction = 0.5;
    else contractFraction = 0.2;

    const pts = 100 * contractFraction * weights.contratoFim;
    scoreAccumulator += pts;
    explanationItems.push({
      factor: 'Contrato Vigente em Vencimento',
      points: Math.round(pts),
      reason: `Contrato em execução encerra em aproximadamente ${contractDaysRemaining} dias (requer nova contratação ou decisão de renovação).`
    });
  }

  // 3. Recorrência Histórica (peso 15)
  if (hasRecurrence || recurrenceCount >= 2) {
    const fraction = Math.min(1.0, 0.4 + (recurrenceCount * 0.2));
    const pts = 100 * fraction * weights.recorrencia;
    scoreAccumulator += pts;
    explanationItems.push({
      factor: 'Histórico Recorrente',
      points: Math.round(pts),
      reason: `Órgão contratou este escopo ${recurrenceCount || 'múltiplas'} vezes em anos recentes.`
    });
  }

  // 4. Aderência Técnica ao Portfólio (peso 15)
  if (adherencePercent > 0) {
    const pts = (adherencePercent / 100) * 100 * weights.aderencia;
    scoreAccumulator += pts;
    explanationItems.push({
      factor: 'Aderência ao Portfólio Vellia',
      points: Math.round(pts),
      reason: `Motor de Aderência apurou ${Math.round(adherencePercent)}% de compatibilidade técnica com atestados e serviços da empresa.`
    });
  }

  // 5. Volume Financeiro Estimado (peso 10)
  if (estimatedValue > 0) {
    let valFraction = 0.4;
    if (estimatedValue >= 1000000) valFraction = 1.0;
    else if (estimatedValue >= 500000) valFraction = 0.8;
    else if (estimatedValue >= 100000) valFraction = 0.6;
    
    const pts = 100 * valFraction * weights.valor;
    scoreAccumulator += pts;
    explanationItems.push({
      factor: 'Porte Econômico do Objeto',
      points: Math.round(pts),
      reason: `Valor estimado de R$ ${Number(estimatedValue).toLocaleString('pt-BR')} justifica mobilização antecipada.`
    });
  }

  // 6. Interesse Estratégico (peso 10)
  if (isStrategicServiceOrOrgan) {
    const pts = 100 * weights.interesseEstrategico;
    scoreAccumulator += pts;
    explanationItems.push({
      factor: 'Prioridade Estratégica',
      points: pts,
      reason: 'Órgão prioritário ou serviço nuclear na Watchlist da Vellia.'
    });
  }

  const finalScore = Math.min(100, Math.round(scoreAccumulator));

  let tier = ScoreTier.BAIXO;
  let tierLabel = 'Baixo sinal';
  let badgeColor = '#64748b';

  if (finalScore >= 85) {
    tier = ScoreTier.MUITO_ALTO;
    tierLabel = 'Potencial Muito Alto';
    badgeColor = '#10b981';
  } else if (finalScore >= 70) {
    tier = ScoreTier.ALTO;
    tierLabel = 'Potencial Alto';
    badgeColor = '#3b82f6';
  } else if (finalScore >= 50) {
    tier = ScoreTier.MONITORAR;
    tierLabel = 'Monitorar';
    badgeColor = '#f59e0b';
  }

  return {
    score: finalScore,
    tier,
    tierLabel,
    badgeColor,
    explanation: explanationItems,
    calculatedAt: new Date().toISOString(),
    algorithmVersion: 'v16.1-calibrated'
  };
}

/**
 * Classifica a janela de vencimento em dias (Item 10)
 */
export function classifyExpirationWindow(days) {
  if (days <= 30) return ExpirationWindow.ATE_30_DIAS;
  if (days <= 60) return ExpirationWindow.DIAS_31_60;
  if (days <= 90) return ExpirationWindow.DIAS_61_90;
  if (days <= 180) return ExpirationWindow.DIAS_91_180;
  return ExpirationWindow.MAIS_180_DIAS;
}

export function formatExpirationWindowLabel(windowKey) {
  switch (windowKey) {
    case ExpirationWindow.ATE_30_DIAS: return 'Até 30 dias';
    case ExpirationWindow.DIAS_31_60: return '31 a 60 dias';
    case ExpirationWindow.DIAS_61_90: return '61 a 90 dias';
    case ExpirationWindow.DIAS_91_180: return '91 a 180 dias';
    case ExpirationWindow.MAIS_180_DIAS: return 'Mais de 180 dias';
    default: return 'Indeterminado';
  }
}
