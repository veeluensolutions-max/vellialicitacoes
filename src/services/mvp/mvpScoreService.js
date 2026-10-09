/**
 * VELLIA LICITAÇÕES — FASE 24 (CONSOLIDAÇÃO DO MVP DE PRODUÇÃO)
 * mvpScoreService.js
 * 
 * Racionalização e consolidação dos scores do sistema.
 * Prioriza estritamente os 3 indicadores fundamentais do Core Product:
 * 1. Aderência (% de compatibilidade com o portfólio da empresa)
 * 2. Capacidade (% de habilitação documental e técnica)
 * 3. Decisão (GO, GO COM PENDÊNCIAS, NO-GO)
 * Mais 1 indicador complementar: Risco (Baixo, Moderado, Alto)
 * 
 * Scores secundários e experimentais (Win Potential, Relationship Score, Forecast)
 * são mantidos em detalhe sob demanda, sem poluir a visão executiva e operacional.
 */

import { DecisionService } from '../decision/decisionService.js';
import { ResultsIntelligenceService } from '../results/resultsIntelligenceService.js';

export class MvpScoreService {
  /**
   * Retorna os scores essenciais consolidados para uma dada oportunidade.
   * Responde com extrema clareza operacional: "E agora? O que fazer?"
   */
  static getConsolidatedRecommendation(opportunity) {
    if (!opportunity) {
      return {
        adherence: 0,
        capability: 0,
        decision: 'NO-GO',
        decisionLabel: 'Sem dados',
        riskTier: 'Alto',
        riskScore: 100,
        summary: 'Oportunidade inválida ou não carregada.',
        pendingItems: []
      };
    }

    // 1. Aderência (Core Score)
    const adherence = typeof opportunity.score === 'number' 
      ? opportunity.score 
      : (opportunity.adherenceScore || 75);

    // 2. Capacidade (Centro de Capacidade / Vault)
    const capability = opportunity.capabilityScore || (adherence >= 85 ? 92 : 78);

    // 3. Decisão (Go / No-Go)
    const decCalculated = DecisionService.calculateDecision(opportunity) || {};
    const humanDec = DecisionService.getHumanDecision(opportunity.id || opportunity.number);

    let decisionType = 'GO_PENDENCIAS';
    let decisionLabel = 'GO COM PENDÊNCIAS';
    let decisionColor = '#F59E0B';

    if (humanDec && humanDec.currentDecision) {
      if (humanDec.currentDecision === 'GO') {
        decisionType = 'GO';
        decisionLabel = 'GO CONFIRMADO';
        decisionColor = '#10B981';
      } else if (humanDec.currentDecision === 'NO-GO') {
        decisionType = 'NO_GO';
        decisionLabel = 'NO-GO (DESCARTADA)';
        decisionColor = '#EF4444';
      } else {
        decisionType = 'GO_PENDENCIAS';
        decisionLabel = 'GO COM PENDÊNCIAS';
        decisionColor = '#F59E0B';
      }
    } else {
      if (adherence >= 88 && capability >= 80) {
        decisionType = 'GO';
        decisionLabel = 'RECOMENDAÇÃO: GO';
        decisionColor = '#10B981';
      } else if (adherence < 60 || capability < 50) {
        decisionType = 'NO_GO';
        decisionLabel = 'RECOMENDAÇÃO: NO-GO';
        decisionColor = '#EF4444';
      } else {
        decisionType = 'GO_PENDENCIAS';
        decisionLabel = 'GO COM PENDÊNCIAS';
        decisionColor = '#F59E0B';
      }
    }

    // 4. Risco Complementar
    const riskScore = decCalculated.risks?.riskScore || (adherence > 85 ? 24 : 45);
    const riskTier = riskScore > 60 ? 'Alto' : riskScore > 30 ? 'Moderado' : 'Baixo';
    const riskColor = riskTier === 'Baixo' ? '#10B981' : riskTier === 'Moderado' ? '#F59E0B' : '#EF4444';

    // 5. Pendências Diretas ("O que falta?")
    const pendingItems = [];
    if (capability < 85) {
      pendingItems.push({ type: 'DOCUMENT', label: 'Certidão ou atestado complementar sugerido' });
    }
    if (opportunity.daysLeft <= 5) {
      pendingItems.push({ type: 'PRAZO', label: `Prazo crítico: restam ${opportunity.daysLeft} dias para entrega` });
    }
    if (!humanDec) {
      pendingItems.push({ type: 'DECISAO', label: 'Validação humana pendente no painel' });
    }

    return {
      adherence,
      capability,
      decision: decisionType,
      decisionLabel,
      decisionColor,
      riskTier,
      riskScore,
      riskColor,
      summary: decCalculated.recommendationReason || `Aderência calculada em ${adherence}% com capacidade de ${capability}%.`,
      pendingItems,
      // Detalhes secundários (acessíveis quando o usuário expandir)
      secondaryDetails: {
        rawScore: opportunity.score,
        potentialMargin: decCalculated.commercial?.cenarioProvavel?.margemPercentual || 22,
        operationalEffort: decCalculated.operationalEffort || 'Médio',
        winPotential: ResultsIntelligenceService.calculateWinPotential(opportunity)?.score || null
      }
    };
  }
}
