/**
 * VELLIA LICITAÇÕES — FASE 22: GO-LIVE CONTROLADO + PILOTO REAL + OPERAÇÃO ASSISTIDA
 * pilotFeedbackService.js: Captura Contextual de Feedback, Pilot Backlog
 * (Impacto x Frequência x Risco) e Pesquisa do Piloto (Survey 1-5).
 */

import { FeedbackType, PilotBacklogClassification } from './goLiveModels.js';

const STORAGE_KEYS = {
  FEEDBACKS: 'vellia_feedbacks_v22',
  SURVEYS: 'vellia_surveys_v22',
  BACKLOG: 'vellia_pilot_backlog_v22'
};

const INITIAL_FEEDBACKS = [
  {
    id: 'fb-01',
    type: FeedbackType.SUGGESTION,
    module: 'Oportunidades',
    screen: '/oportunidades?filtro=relevantes',
    description: 'Adicionar filtro direto por modalidade de disputa (Dispensa vs Pregão Eletrônico) na barra superior.',
    perceivedSeverity: 'Média',
    screenshotUrl: null,
    user: 'Mariana Vasconcelos',
    userRole: 'LICITACOES',
    date: '2026-10-09T08:20:00.000Z',
    context: {
      url: typeof window !== 'undefined' && window.location ? window.location.href : 'https://vellia.internal/oportunidades',
      version: 'v2.2-RC1',
      browser: 'Chrome 129.0 / Windows 11',
      screenResolution: '1920x1080'
    },
    status: 'TRIAGEM_CONCLUIDA',
    backlogId: 'pb-01'
  },
  {
    id: 'fb-02',
    type: FeedbackType.MATCHING_ERROR,
    module: 'Motor Semântico',
    screen: '/motor-aderencia',
    description: 'A oportunidade de válvulas subsea recebeu score 78% para Veeluen, mas é material físico puro e não serviço.',
    perceivedSeverity: 'Alta',
    screenshotUrl: null,
    user: 'Roberto Mendes',
    userRole: 'COMERCIAL',
    date: '2026-10-09T08:52:00.000Z',
    context: {
      url: 'https://vellia.internal/motor-aderencia',
      version: 'v2.2-RC1',
      browser: 'Edge 128.0 / Windows 11',
      screenResolution: '2560x1440'
    },
    status: 'TRIAGEM_CONCLUIDA',
    backlogId: 'pb-02'
  }
];

const INITIAL_BACKLOG = [
  {
    id: 'pb-01',
    feedbackId: 'fb-01',
    title: 'Filtro rápido por Modalidade (Pregão / Dispensa)',
    classification: PilotBacklogClassification.CAN_WAIT,
    impact: 3,      // 1 a 5
    frequency: 3,   // 1 a 5
    risk: 1,        // 1 a 5
    calculatedPriority: 9, // Impacto (3) x Frequência (3)
    status: 'ACEITO_PARA_ROADMAP',
    notes: 'Pode esperar a versão seguinte à produção. Estabilidade é prioridade agora.'
  },
  {
    id: 'pb-02',
    feedbackId: 'fb-02',
    title: 'Penalidade em stopwords de produtos físicos no motor semântico',
    classification: PilotBacklogClassification.FIX_BEFORE_PROD,
    impact: 4,
    frequency: 3,
    risk: 2,
    calculatedPriority: 24, // Impacto (4) x Freq (3) x Risco(2)
    status: 'EM_CORRECAO_CRITICA',
    notes: 'Ajuste de dicionário semântico antes da homologação final.'
  }
];

const INITIAL_SURVEYS = [
  {
    id: 'surv-01',
    user: 'Mariana Vasconcelos',
    role: 'LICITACOES',
    date: '2026-10-09T08:45:00.000Z',
    ratings: {
      easeOfUse: 5,           // Facilidade de uso (1 a 5)
      qualityOpportunities: 4,// Qualidade das oportunidades (1 a 5)
      speed: 5,               // Velocidade (1 a 5)
      reliability: 5,         // Confiabilidade (1 a 5)
      perceivedValue: 5       // Valor percebido (1 a 5)
    },
    averageRating: 4.8,
    openFeedback: 'A triagem inicial que levava 3 horas por dia agora é feita em 40 minutos com o Vellia Agent.'
  },
  {
    id: 'surv-02',
    user: 'Eng. Fernando Prates',
    role: 'TECNICO',
    date: '2026-10-09T08:50:00.000Z',
    ratings: {
      easeOfUse: 4,
      qualityOpportunities: 5,
      speed: 4,
      reliability: 4,
      perceivedValue: 5
    },
    averageRating: 4.4,
    openFeedback: 'Excelente correspondência de atestados com editais da Petrobras.'
  }
];

export class PilotFeedbackService {
  static getFeedbacks() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.FEEDBACKS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler feedbacks:', e);
    }
    return INITIAL_FEEDBACKS;
  }

  /**
   * Captura automática e envio de Feedback com contexto (Itens 24, 25, 26)
   */
  static submitFeedback({
    typeKey, // 'BUG', 'SUGGESTION', etc.
    module,
    screen,
    description,
    perceivedSeverity = 'Média',
    screenshotUrl = null,
    user = 'Usuário Ativo',
    userRole = 'LICITACOES'
  }) {
    const list = this.getFeedbacks();
    const type = FeedbackType[typeKey] || FeedbackType.SUGGESTION;

    // Captura automática de dados contextuais do navegador
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Desconhecido';
    let browserName = 'Navegador Web';
    if (userAgent.includes('Chrome')) browserName = 'Google Chrome';
    else if (userAgent.includes('Edg')) browserName = 'Microsoft Edge';
    else if (userAgent.includes('Safari')) browserName = 'Apple Safari';
    else if (userAgent.includes('Firefox')) browserName = 'Mozilla Firefox';

    const screenRes = typeof window !== 'undefined' ? `${window.screen?.width || 1920}x${window.screen?.height || 1080}` : '1920x1080';

    const newFeedback = {
      id: `fb-${Date.now()}`,
      type,
      module: module || 'Geral',
      screen: screen || (typeof window !== 'undefined' ? window.location.pathname : '/dashboard'),
      description,
      perceivedSeverity,
      screenshotUrl,
      user,
      userRole,
      date: new Date().toISOString(),
      context: {
        url: typeof window !== 'undefined' ? window.location.href : 'https://vellia.internal',
        version: 'v2.2-RC1',
        browser: `${browserName} (${typeof navigator !== 'undefined' ? navigator.platform : 'Windows'})`,
        screenResolution: screenRes
      },
      status: 'RECEBIDO_EM_TRIAGEM',
      backlogId: null
    };

    list.unshift(newFeedback);
    this._saveFeedbacks(list);

    // Triagem automática preliminar para o Pilot Backlog se for Bug ou Melhoria
    this.createBacklogItemFromFeedback(newFeedback);

    return newFeedback;
  }

  /**
   * Converte feedback para item de Pilot Backlog ponderado (Itens 46 e 47)
   */
  static createBacklogItemFromFeedback(feedback) {
    const backlog = this.getPilotBacklog();
    const isCritical = feedback.perceivedSeverity === 'Alta' || feedback.type.code === 'BUG';

    const classification = isCritical
      ? PilotBacklogClassification.FIX_BEFORE_PROD
      : PilotBacklogClassification.CAN_WAIT;

    const impact = isCritical ? 4 : 3;
    const frequency = 3;
    const risk = isCritical ? 2 : 1;
    const calculatedPriority = impact * frequency * risk;

    const newItem = {
      id: `pb-${Date.now()}`,
      feedbackId: feedback.id,
      title: feedback.description.slice(0, 60) + (feedback.description.length > 60 ? '...' : ''),
      classification,
      impact,
      frequency,
      risk,
      calculatedPriority,
      status: 'TRIADO',
      notes: `Origem: ${feedback.type.label} por ${feedback.user} (${feedback.module})`
    };

    backlog.unshift(newItem);
    this._saveBacklog(backlog);
    return newItem;
  }

  static getPilotBacklog() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.BACKLOG);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler pilot backlog:', e);
    }
    return INITIAL_BACKLOG;
  }

  static updateBacklogItem(itemId, partialData) {
    const list = this.getPilotBacklog();
    const index = list.findIndex(i => i.id === itemId);
    if (index === -1) throw new Error('Item do backlog não encontrado');

    const item = { ...list[index], ...partialData };
    // Recalcular prioridade: Impacto x Frequência x Risco
    if (item.impact && item.frequency && item.risk) {
      item.calculatedPriority = item.impact * item.frequency * item.risk;
    }
    list[index] = item;
    this._saveBacklog(list);
    return item;
  }

  /**
   * Pesquisa do Piloto (Itens 44 e 45)
   */
  static submitSurvey({
    user,
    role,
    ratings, // { easeOfUse, qualityOpportunities, speed, reliability, perceivedValue }
    openFeedback
  }) {
    const surveys = this.getSurveys();
    const values = Object.values(ratings);
    const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 5.0;

    const newSurvey = {
      id: `surv-${Date.now()}`,
      user,
      role,
      date: new Date().toISOString(),
      ratings,
      averageRating: parseFloat(avg),
      openFeedback
    };

    surveys.unshift(newSurvey);
    this._saveSurveys(surveys);
    return newSurvey;
  }

  static getSurveys() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.SURVEYS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler pesquisas:', e);
    }
    return INITIAL_SURVEYS;
  }

  static getSurveyOverview() {
    const list = this.getSurveys();
    if (list.length === 0) {
      return { totalResponses: 0, overallScore: 5.0, categories: {} };
    }

    const total = list.length;
    const avgOverall = (list.reduce((acc, s) => acc + s.averageRating, 0) / total).toFixed(1);

    const categories = {
      easeOfUse: (list.reduce((acc, s) => acc + (s.ratings.easeOfUse || 5), 0) / total).toFixed(1),
      qualityOpportunities: (list.reduce((acc, s) => acc + (s.ratings.qualityOpportunities || 5), 0) / total).toFixed(1),
      speed: (list.reduce((acc, s) => acc + (s.ratings.speed || 5), 0) / total).toFixed(1),
      reliability: (list.reduce((acc, s) => acc + (s.ratings.reliability || 5), 0) / total).toFixed(1),
      perceivedValue: (list.reduce((acc, s) => acc + (s.ratings.perceivedValue || 5), 0) / total).toFixed(1)
    };

    return {
      totalResponses: total,
      overallScore: parseFloat(avgOverall),
      categories
    };
  }

  static _saveFeedbacks(data) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(data));
    }
  }

  static _saveBacklog(data) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.BACKLOG, JSON.stringify(data));
    }
  }

  static _saveSurveys(data) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(data));
    }
  }
}
