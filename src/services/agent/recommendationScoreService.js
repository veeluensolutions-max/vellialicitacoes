/**
 * VELLIA LICITAÇÕES - RECOMMENDATION SCORE SERVICE (FASE 7)
 * Calcula score de recomendação estratégico (0-100) e parecer comercial:
 * PARTICIPAR | ANALISAR | BAIXA PRIORIDADE | DESCARTAR
 */

export const RecommendationAction = {
  PARTICIPAR: 'PARTICIPAR',
  ANALISAR: 'ANALISAR',
  BAIXA_PRIORIDADE: 'BAIXA PRIORIDADE',
  DESCARTAR: 'DESCARTAR'
};

export class RecommendationScoreService {
  /**
   * Calcula o Recommendation Score consolidado
   * @param {Object} opp - Oportunidade
   * @returns {Object} Score, Ação, Justificativas e Riscos
   */
  static calculateRecommendation(opp) {
    const adherence = Number(opp.score) || 50;
    const daysLeft = Number(opp.daysLeft) !== undefined ? Number(opp.daysLeft) : 10;
    const priority = opp.priority || 'Média';
    const isLocalState = (opp.state === 'PE' || opp.location?.includes('PE') || opp.location?.includes('Recife') || opp.location?.includes('Suape') || opp.location?.includes('Ipojuca'));

    // 1. Componente Aderência Técnica (Peso 45%)
    const adherenceScore = adherence * 0.45;

    // 2. Componente Prazo Viável (Peso 15%)
    let deadlineScore = 0;
    if (daysLeft >= 10) deadlineScore = 15;
    else if (daysLeft >= 6) deadlineScore = 12;
    else if (daysLeft >= 3) deadlineScore = 7;
    else deadlineScore = 3;

    // 3. Componente Prioridade Comercial (Peso 15%)
    let priorityScore = 8;
    if (priority === 'Crítica') priorityScore = 15;
    else if (priority === 'Alta') priorityScore = 12;
    else if (priority === 'Média') priorityScore = 9;
    else if (priority === 'Baixa') priorityScore = 5;

    // 4. Componente Logística / Localização (Peso 10%)
    const locationScore = isLocalState ? 10 : 6;

    // 5. Componente Empresa Alvo (Peso 10%)
    const companyScore = (opp.recommendedCompany === 'Excelência Ambiental' || opp.recommendedCompany === 'Veeluen Solutions') ? 10 : 5;

    // 6. Componente Risco Controlado (Peso 5%)
    const riskScore = adherence >= 85 ? 5 : adherence >= 70 ? 4 : 2;

    const totalScore = Math.min(100, Math.round(adherenceScore + deadlineScore + priorityScore + locationScore + companyScore + riskScore));

    // Determinação do Parecer
    let action = RecommendationAction.ANALISAR;
    let badgeClass = 'rec-analisar';
    let rationale = [];

    if (totalScore >= 85) {
      action = RecommendationAction.PARTICIPAR;
      badgeClass = 'rec-participar';
      rationale = [
        'Altíssima compatibilidade técnica com o catálogo de serviços credenciado.',
        `Empresa recomendada (${opp.recommendedCompany}) possui capacitação operacional e histórico comprovado.`,
        `Prazo de ${daysLeft} dias permite elaboração de proposta técnica e precificação competitiva.`,
        isLocalState ? 'Localização geográfica estratégica com custo logístico favorável.' : 'Escopo atrativo que viabiliza mobilização técnica.'
      ];
    } else if (totalScore >= 68) {
      action = RecommendationAction.ANALISAR;
      badgeClass = 'rec-analisar';
      rationale = [
        'Boa correlação de termos técnicos com os serviços prestados.',
        'Necessária triagem aprofundada dos atestados de qualificação técnica exigidos.',
        `Janela de oportunidade com ${daysLeft} dias restantes para pedido de esclarecimentos.`
      ];
    } else if (totalScore >= 45) {
      action = RecommendationAction.BAIXA_PRIORIDADE;
      badgeClass = 'rec-baixa';
      rationale = [
        'Compatibilidade técnica parcial ou serviço complementar.',
        'Avaliar se há sinergia em consórcio ou subcontratação.',
        'Prioridade comercial secundária diante do pipeline atual.'
      ];
    } else {
      action = RecommendationAction.DESCARTAR;
      badgeClass = 'rec-descartar';
      rationale = [
        'Baixa aderência aos serviços das empresas da família Vellia.',
        'Risco de inviabilidade técnica ou atestados incompatíveis com o escopo principal.',
        'Não indicado para mobilização da equipe comercial.'
      ];
    }

    return {
      recommendationScore: totalScore,
      action,
      badgeClass,
      rationale,
      calculatedAt: new Date().toISOString()
    };
  }
}
