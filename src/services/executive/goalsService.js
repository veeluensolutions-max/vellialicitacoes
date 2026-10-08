/**
 * VELLIA LICITAÇÕES — FASE 20: CENTRO DE COMANDO EXECUTIVO
 * goalsService.js: Gestão de Metas Comerciais, Acompanhamento de Ritmo (Pace) e Gaps
 * (Itens 23 a 31, 70)
 */

import { GoalPaceStatus, GoalPeriod, GoalType } from './executiveModels.js';

const STORAGE_KEY_GOALS = 'vellia_executive_goals_v20';

export class GoalsService {
  constructor() {
    this.goals = this._loadGoals();
  }

  /**
   * Retorna a lista de metas ativas com cálculo de progresso, gap e ritmo
   */
  getGoalsSummary({ company = 'TODAS', period = GoalPeriod.MENSAL } = {}) {
    const list = this.goals.filter(g => {
      const matchComp = !company || company === 'TODAS' || g.company === company || g.company === 'AMBAS';
      const matchPeriod = !period || g.period === period;
      return matchComp && matchPeriod;
    });

    const daysInMonth = 30;
    const currentDay = 22; // Simulado dia 22 do mês corrente
    const timeElapsedPct = Math.round((currentDay / daysInMonth) * 100); // 73% do tempo decorrido

    const enriched = list.map(g => {
      const progressPct = g.targetValue > 0 ? Math.round((g.currentValue / g.targetValue) * 100) : 0;
      const gap = Math.max(0, g.targetValue - g.currentValue);

      // Cálculo do Ritmo da Meta (Pace) (Itens 29 e 30)
      let paceStatus = GoalPaceStatus.ON_TRACK;
      let paceExplanation = 'No ritmo esperado para o período.';

      if (progressPct >= 100) {
        paceStatus = progressPct > 100 ? GoalPaceStatus.SURPASSED : GoalPaceStatus.ACHIEVED;
        paceExplanation = progressPct > 100 ? 'Meta superada antes do encerramento!' : 'Meta atingida com sucesso!';
      } else if (progressPct < (timeElapsedPct - 15)) {
        paceStatus = GoalPaceStatus.RISK;
        const daysLeft = daysInMonth - currentDay;
        paceExplanation = `Faltam ${daysLeft} dias para o fechamento e o progresso está em ${progressPct}% (abaixo do ritmo de ${timeElapsedPct}%).`;
      } else {
        paceStatus = GoalPaceStatus.ON_TRACK;
        paceExplanation = `Ritmo compatível (${progressPct}% realizado vs ${timeElapsedPct}% do tempo decorrido).`;
      }

      // Projeção honesta (Item 31)
      const projection = g.currentValue > 0
        ? Math.round((g.currentValue / currentDay) * daysInMonth)
        : null;

      return {
        ...g,
        progressPct,
        gap,
        paceStatus,
        paceExplanation,
        timeElapsedPct,
        projectedEndValue: projection,
        projectionFormatted: projection !== null ? (g.isCurrency ? `R$ ${projection.toLocaleString('pt-BR')}` : `${projection}`) : 'Projeção indisponível.'
      };
    });

    // Metas em risco para alerta executivo (Item 70)
    const atRiskGoals = enriched.filter(g => g.paceStatus === GoalPaceStatus.RISK);

    return {
      company,
      period,
      timeElapsedPct,
      goals: enriched,
      atRiskGoals,
      summary: {
        totalGoals: enriched.length,
        achievedCount: enriched.filter(g => g.paceStatus === GoalPaceStatus.ACHIEVED || g.paceStatus === GoalPaceStatus.SURPASSED).length,
        onTrackCount: enriched.filter(g => g.paceStatus === GoalPaceStatus.ON_TRACK).length,
        atRiskCount: atRiskGoals.length
      }
    };
  }

  /**
   * Adiciona ou atualiza uma meta comercial
   */
  saveGoal(goalData) {
    const existingIdx = this.goals.findIndex(g => g.id === goalData.id);
    const updated = {
      id: goalData.id || `goal-${Date.now().toString(36)}`,
      title: goalData.title || 'Meta Comercial',
      type: goalData.type || GoalType.PROPOSALS_SENT,
      company: goalData.company || 'Excelência Ambiental',
      ownerName: goalData.ownerName || 'Equipe Geral',
      period: goalData.period || GoalPeriod.MENSAL,
      targetValue: Number(goalData.targetValue) || 10,
      currentValue: Number(goalData.currentValue) || 0,
      unit: goalData.unit || 'qtd',
      isCurrency: !!goalData.isCurrency,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      this.goals[existingIdx] = updated;
    } else {
      this.goals.push(updated);
    }

    this._saveGoals();
    return updated;
  }

  _loadGoals() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const stored = window.localStorage.getItem(STORAGE_KEY_GOALS);
        if (stored) return JSON.parse(stored);
      }
    } catch {}

    // Massas de dados padrão exigidas (Itens 25, 26, 28)
    return [
      {
        id: 'goal-receita-trimestral-1',
        title: 'Receita de Contratos Ganhos (Q4)',
        type: GoalType.CONTRACTS_WON,
        company: 'AMBAS',
        ownerName: 'Diretoria Comercial',
        period: GoalPeriod.TRIMESTRAL,
        targetValue: 2000000,
        currentValue: 1350000,
        unit: 'R$',
        isCurrency: true
      },
      {
        id: 'goal-propostas-veeluen-mensal',
        title: 'Propostas Enviadas — Veeluen Solutions',
        type: GoalType.PROPOSALS_SENT,
        company: 'Veeluen Solutions',
        ownerName: 'Roberto Mendes',
        period: GoalPeriod.MENSAL,
        targetValue: 20,
        currentValue: 14,
        unit: 'propostas',
        isCurrency: false
      },
      {
        id: 'goal-propostas-excelencia-mensal',
        title: 'Propostas Enviadas — Excelência Ambiental',
        type: GoalType.PROPOSALS_SENT,
        company: 'Excelência Ambiental',
        ownerName: 'Juliana Prado',
        period: GoalPeriod.MENSAL,
        targetValue: 15,
        currentValue: 8, // Em risco! (8 de 15 no dia 22)
        unit: 'propostas',
        isCurrency: false
      },
      {
        id: 'goal-win-rate-anual',
        title: 'Meta de Eficiência Comercial (Win Rate)',
        type: GoalType.WIN_RATE,
        company: 'AMBAS',
        ownerName: 'Diretoria Executiva',
        period: GoalPeriod.ANUAL,
        targetValue: 30,
        currentValue: 28,
        unit: '%',
        isCurrency: false
      },
      {
        id: 'goal-reunioes-mensal',
        title: 'Reuniões Técnicas & Alinhamentos Pré-Edital',
        type: GoalType.MEETINGS,
        company: 'AMBAS',
        ownerName: 'Time de Relacionamento B2G',
        period: GoalPeriod.MENSAL,
        targetValue: 12,
        currentValue: 10,
        unit: 'reuniões',
        isCurrency: false
      },
      {
        id: 'goal-orgaos-novos',
        title: 'Novos Órgãos Estratégicos Mapeados',
        type: GoalType.NEW_ACCOUNTS,
        company: 'AMBAS',
        ownerName: 'Prospecção Antecipada',
        period: GoalPeriod.MENSAL,
        targetValue: 5,
        currentValue: 4,
        unit: 'órgãos',
        isCurrency: false
      }
    ];
  }

  _saveGoals() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(this.goals));
      }
    } catch {}
  }
}

export const goalsService = new GoalsService();
export default goalsService;
