/**
 * VELLIA LICITAÇÕES — FASE 27: OTIMIZAÇÃO DA INTELIGÊNCIA DO AGENTE
 * humanFeedbackService.js: Coleta Estruturada de Feedback Humano, Fila de Revisão de Baixa Confiança,
 * Term Analytics e Separação entre Decisão Comercial e Relevância Técnica.
 * (Itens 40 a 45, 68 a 75, 117 a 128)
 */

export const FeedbackAccuracy = {
  YES: 'Sim',
  PARTIAL: 'Parcial',
  NO: 'Não'
};

export const FeedbackReason = {
  WRONG_SERVICE: 'Serviço errado',
  WRONG_COMPANY: 'Empresa errada',
  SCORE_TOO_HIGH: 'Score alto demais',
  SCORE_TOO_LOW: 'Score baixo demais',
  IRRELEVANT: 'Oportunidade irrelevante',
  UNREGISTERED_SERVICE: 'Serviço não cadastrado'
};

class HumanFeedbackService {
  constructor() {
    this.storageKey = 'vellia_agent_feedback_v27';
    this.initStore();
  }

  initStore() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.storageKey);
        if (!stored) {
          const initialData = {
            feedbacks: [
              {
                id: 'FB-SEED-1',
                opportunityId: 'opp-petro-7004218902',
                accuracy: FeedbackAccuracy.YES,
                reason: null,
                suggestedService: 'Monitoramento de Emissões Atmosféricas',
                suggestedCompany: 'Excelência Ambiental',
                user: 'Dr. Roberto Albuquerque',
                timestamp: '2026-10-08T10:30:00Z',
                reviewed: true
              },
              {
                id: 'FB-SEED-2',
                opportunityId: 'opp-cgov-148821',
                accuracy: FeedbackAccuracy.PARTIAL,
                reason: FeedbackReason.WRONG_COMPANY,
                suggestedService: 'NR-13 (Caldeiras e Vasos de Pressão)',
                suggestedCompany: 'Veeluen Solutions',
                user: 'Mariana Castro',
                timestamp: '2026-10-08T14:15:00Z',
                reviewed: false
              }
            ],
            suggestedTerms: [
              { term: 'caracterização de fontes fixas', suggestedService: 'Monitoramento de Emissões Atmosféricas', count: 3, status: 'PENDENTE' },
              { term: 'reconstituição de prontuário nr-13', suggestedService: 'NR-13 (Caldeiras e Vasos de Pressão)', count: 2, status: 'PENDENTE' }
            ]
          };
          window.localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
      }
    } catch {}
  }

  getStore() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.storageKey);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return { feedbacks: [], suggestedTerms: [] };
  }

  saveStore(data) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch {}
  }

  /**
   * Registra feedback humano de forma estruturada na oportunidade (Itens 68 a 70, 125, 126)
   */
  recordFeedback({
    opportunityId,
    accuracy,
    reason = null,
    suggestedService = null,
    suggestedCompany = null,
    notes = '',
    user = 'Usuário do Sistema'
  }) {
    const store = this.getStore();

    const newFeedback = {
      id: `FB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      opportunityId,
      accuracy,
      reason,
      suggestedService,
      suggestedCompany,
      notes,
      user,
      timestamp: new Date().toISOString(),
      reviewed: false
    };

    store.feedbacks.unshift(newFeedback);
    this.saveStore(store);

    return newFeedback;
  }

  /**
   * Obtém feedback existente para uma oportunidade específica
   */
  getFeedbackForOpportunity(opportunityId) {
    const store = this.getStore();
    return store.feedbacks.find(f => f.opportunityId === opportunityId) || null;
  }

  /**
   * Retorna lista de feedbacks para lote de revisão pelo administrador (Item 45)
   */
  getAllFeedbacks() {
    return this.getStore().feedbacks;
  }

  /**
   * Retorna termos sugeridos para revisão administrativa (Itens 72 a 74)
   */
  getSuggestedTerms() {
    return this.getStore().suggestedTerms;
  }

  /**
   * Fila de revisão de oportunidades com baixa confiança (Itens 117 a 119)
   */
  getReviewQueue(opportunities = []) {
    return opportunities.filter(opp => {
      const isLowConfidence = opp.confidence === 'Baixa' || opp.scoreTier === 'review';
      const isPendingDecision = !opp.decision;
      return isLowConfidence && isPendingDecision;
    });
  }
}

export const humanFeedbackService = new HumanFeedbackService();
