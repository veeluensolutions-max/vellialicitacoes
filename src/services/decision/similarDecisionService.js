/**
 * VELLIA LICITAÇÕES — FASE 55: STRATEGIC MEMORY + DECISION INTELLIGENCE
 * similarDecisionService.js: Serviço especializado em busca de casos comparáveis, precedentes internos e detecção de divergência
 * 
 * Princípios:
 * - Não compara apenas embeddings semânticos; combina dados estruturados (serviço, órgão, região, risco, faixa de valor, reason codes).
 * - "Casos comparáveis / Precedentes Internos": orienta sem engessar ("Você deve avaliar", nunca "Você deve fazer igual").
 * - Detecção de divergência histórica (Decision Divergence): sinaliza quando uma decisão destoa do padrão histórico (ex: GO com margem de 8% quando a média histórica é NO-GO em margens < 10%).
 */

export class SimilarDecisionService {
  /**
   * Encontra decisões anteriores semelhantes baseadas em critérios multidimensionais
   * @param {Object} targetContext - Contexto da oportunidade ou decisão atual
   * @param {Array} historicalDecisions - Base de decisões históricas
   * @param {Object} options - Parâmetros de threshold e limite
   */
  static findSimilarDecisions(targetContext, historicalDecisions = [], options = {}) {
    if (!targetContext || !Array.isArray(historicalDecisions)) return [];

    const limit = options.limit || 5;
    const minSimilarityScore = options.minScore || 0.45;

    const scoredDecisions = historicalDecisions
      .filter(d => d.id !== targetContext.currentDecisionId)
      .map(decision => {
        const scoreBreakdown = this.calculateSimilarityScore(targetContext, decision);
        return {
          decision,
          totalScore: scoreBreakdown.total,
          breakdown: scoreBreakdown,
          isPrecedent: scoreBreakdown.total >= 0.70
        };
      })
      .filter(item => item.totalScore >= minSimilarityScore)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit);

    return scoredDecisions;
  }

  /**
   * Calcula pontuação ponderada de similaridade (0 a 1)
   */
  static calculateSimilarityScore(target, candidate) {
    const ctx = candidate.context || {};
    let score = 0;
    const weights = {
      serviceType: 0.30,
      buyerSegment: 0.20,
      valueRange: 0.15,
      riskLevel: 0.15,
      region: 0.10,
      reasonCodeOverlap: 0.10
    };

    // 1. Tipo de Serviço / Objeto
    let serviceScore = 0;
    const targetService = (target.service || target.segment || '').toLowerCase();
    const candidateService = (ctx.serviceType || candidate.title || '').toLowerCase();
    if (targetService && candidateService) {
      if (targetService === candidateService) serviceScore = 1.0;
      else if (targetService.includes(candidateService) || candidateService.includes(targetService)) serviceScore = 0.8;
      else {
        // Palavras-chave de engenharia e saneamento
        const keywords = ['ete', 'eta', 'efluente', 'emissao', 'licenciamento', 'residuos', 'fauna', 'flora', 'dragagem'];
        const matched = keywords.filter(k => targetService.includes(k) && candidateService.includes(k));
        if (matched.length > 0) serviceScore = 0.7;
      }
    }
    score += serviceScore * weights.serviceType;

    // 2. Órgão Comprador / Segmento
    let buyerScore = 0;
    const targetBuyer = (target.buyer || target.organization || '').toLowerCase();
    const candidateBuyer = (ctx.buyer || '').toLowerCase();
    if (targetBuyer && candidateBuyer) {
      if (targetBuyer === candidateBuyer) buyerScore = 1.0;
      else if (targetBuyer.includes('sabesp') && candidateBuyer.includes('sabesp')) buyerScore = 0.95;
      else if (targetBuyer.includes('copasa') && candidateBuyer.includes('copasa')) buyerScore = 0.95;
      else if (targetBuyer.includes('petrobras') && candidateBuyer.includes('petrobras')) buyerScore = 0.95;
      else if (targetBuyer.includes('cetesb') && candidateBuyer.includes('cetesb')) buyerScore = 0.95;
    }
    score += buyerScore * weights.buyerSegment;

    // 3. Faixa de Valor Estimado
    let valueScore = 0;
    const tVal = Number(target.value || target.opportunityValue || 0);
    const cVal = Number(ctx.opportunityValue || 0);
    if (tVal > 0 && cVal > 0) {
      const ratio = Math.min(tVal, cVal) / Math.max(tVal, cVal);
      valueScore = Math.max(0, ratio);
    }
    score += valueScore * weights.valueRange;

    // 4. Nível de Risco
    let riskScore = 0;
    const tRisk = (target.riskLevel || '').toUpperCase();
    const cRisk = (ctx.riskLevel || '').toUpperCase();
    if (tRisk && cRisk) {
      if (tRisk === cRisk) riskScore = 1.0;
      else if ((tRisk === 'HIGH' && cRisk === 'CRITICAL') || (tRisk === 'CRITICAL' && cRisk === 'HIGH')) riskScore = 0.7;
      else if ((tRisk === 'MEDIUM' && cRisk === 'HIGH') || (tRisk === 'HIGH' && cRisk === 'MEDIUM')) riskScore = 0.5;
    }
    score += riskScore * weights.riskLevel;

    // 5. Região / UF
    let regionScore = 0;
    const tUf = (target.uf || target.region || '').toUpperCase();
    const cUf = (ctx.region || '').toUpperCase();
    if (tUf && cUf && tUf === cUf) regionScore = 1.0;
    score += regionScore * weights.region;

    // 6. Sobreposição de Reason Codes
    let reasonScore = 0;
    const tReasons = Array.isArray(target.reasonCodes) ? target.reasonCodes : [];
    const cReasons = Array.isArray(candidate.reasonCodes) ? candidate.reasonCodes : [candidate.reason];
    if (tReasons.length > 0 && cReasons.length > 0) {
      const matchCount = tReasons.filter(r => cReasons.some(cr => cr && String(cr).toLowerCase().includes(String(r).toLowerCase()))).length;
      reasonScore = Math.min(1.0, matchCount / Math.max(1, tReasons.length));
    }
    score += reasonScore * weights.reasonCodeOverlap;

    return {
      total: Math.round(score * 100) / 100,
      serviceScore,
      buyerScore,
      valueScore,
      riskScore,
      regionScore,
      reasonScore
    };
  }

  /**
   * Detecta se a decisão atual diverge de precedentes históricos (Decision Divergence)
   */
  static detectDecisionDivergence(currentDecision, similarCases = []) {
    if (!currentDecision || !similarCases.length) return null;

    const highPrecedents = similarCases.filter(item => item.totalScore >= 0.65);
    if (highPrecedents.length < 2) return null;

    // Conta decisões anteriores predominantes
    const counts = {};
    highPrecedents.forEach(item => {
      const decType = item.decision.decisionType || item.decision.decision;
      counts[decType] = (counts[decType] || 0) + 1;
    });

    const dominantDecisionType = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, '');
    const currentType = currentDecision.decisionType || currentDecision.decision;

    // Se o tipo atual for oposto ao padrão predominante
    const isDivergent = dominantDecisionType && currentType && dominantDecisionType !== currentType;

    if (isDivergent) {
      return {
        hasDivergence: true,
        dominantPattern: dominantDecisionType,
        dominantCount: counts[dominantDecisionType],
        totalPrecedents: highPrecedents.length,
        currentDecision: currentType,
        explanationPrompt: `Esta decisão (${currentType}) diverge do padrão histórico identificado em ${counts[dominantDecisionType]} de ${highPrecedents.length} casos comparáveis (${dominantDecisionType}). Recomenda-se registrar justificativa executiva formal.`
      };
    }

    return {
      hasDivergence: false,
      alignedWithPattern: dominantDecisionType === currentType,
      dominantPattern: dominantDecisionType
    };
  }
}
