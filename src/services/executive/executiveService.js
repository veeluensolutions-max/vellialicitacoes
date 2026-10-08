/**
 * VELLIA LICITAÇÕES — FASE 20: CENTRO DE COMANDO EXECUTIVO
 * executiveService.js: Fachada Principal do Command Center, Relatórios e Filtros de Segurança
 * (Itens 1, 2, 54, 60, 61, 63, 65, 66, 78, 79, 84)
 */

import { executivePipelineService } from './executivePipelineService.js';
import { forecastService } from './forecastService.js';
import { goalsService } from './goalsService.js';
import { executivePerformanceService } from './executivePerformanceService.js';
import { ExecutivePermissions, ExecutiveViewPreset } from './executiveModels.js';

export class ExecutiveService {
  /**
   * Retorna os dados completos do Centro de Comando Executivo com filtros e segurança
   */
  static getExecutiveDashboardData({
    company = 'TODAS',
    period = 'ALL',
    userPermissions = [ExecutivePermissions.EXECUTIVE_DASHBOARD_VIEW, ExecutivePermissions.FINANCIAL_EXECUTIVE_VIEW],
    viewPreset = ExecutiveViewPreset.DIRETORIA
  } = {}) {
    const pipelineData = executivePipelineService.getPipelineSummary({ company, period });
    const forecastData = forecastService.getCommercialForecast({ company });
    const goalsData = goalsService.getGoalsSummary({ company });
    const performanceData = executivePerformanceService.getPerformanceSummary();

    // Salva snapshot diário de histórico
    executivePerformanceService.saveDailySnapshot(pipelineData);

    // Verificação de permissão financeira de margem (Itens 54, 79, 84)
    const canViewFinancialExecutive = userPermissions.includes(ExecutivePermissions.FINANCIAL_EXECUTIVE_VIEW);

    // Se o usuário não tiver permissão financeira executiva, mascara as margens
    let sanitizedPerformance = { ...performanceData };
    if (!canViewFinancialExecutive) {
      sanitizedPerformance = {
        ...performanceData,
        companyMetrics: performanceData.companyMetrics.map(c => ({
          ...c,
          avgMarginPct: null,
          marginMasked: true
        })),
        services: performanceData.services.map(s => ({
          ...s,
          avgMarginPct: null,
          marginMasked: true
        })),
        trendsComparison: {
          ...performanceData.trendsComparison,
          avgMarginTrendPct: null,
          marginMasked: true
        }
      };
    }

    return {
      filters: { company, period, viewPreset },
      permissions: {
        canViewDashboard: userPermissions.includes(ExecutivePermissions.EXECUTIVE_DASHBOARD_VIEW),
        canViewForecast: userPermissions.includes(ExecutivePermissions.FORECAST_VIEW),
        canViewGoals: userPermissions.includes(ExecutivePermissions.GOALS_VIEW),
        canManageGoals: userPermissions.includes(ExecutivePermissions.GOALS_MANAGE),
        canViewFinancialExecutive
      },
      pipeline: pipelineData,
      forecast: forecastData,
      goals: goalsData,
      performance: sanitizedPerformance,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Gera o Relatório Executivo Semanal estruturado (Item 65)
   */
  static generateWeeklyExecutiveReport({ company = 'TODAS' } = {}) {
    const data = this.getExecutiveDashboardData({ company });
    const p = data.pipeline;
    const f = data.forecast;
    const g = data.goals;

    return {
      title: 'Relatório Executivo Semanal de Licitações & Pipeline',
      generatedDate: new Date().toLocaleDateString('pt-BR'),
      companyScope: company,
      executiveSummary: `Operação ativa com ${p.kpis.totalMonitored} oportunidades monitoradas e R$ ${(p.kpis.grossPipeline / 1000000).toFixed(1)}M em pipeline bruto. O pipeline ponderado alcança R$ ${(p.kpis.weightedPipeline / 1000000).toFixed(1)}M, com ${p.kpis.contractsWon} vitórias homologadas.`,
      kpis: [
        { label: 'Pipeline Bruto', value: `R$ ${p.kpis.grossPipeline.toLocaleString('pt-BR')}` },
        { label: 'Pipeline Ponderado', value: `R$ ${p.kpis.weightedPipeline.toLocaleString('pt-BR')}` },
        { label: 'Contratos Ganhos', value: `R$ ${p.kpis.realizedRevenue.toLocaleString('pt-BR')}` },
        { label: 'Win Rate Atual', value: `${p.kpis.winRate}%` }
      ],
      forecastScenarios: {
        conservador: `R$ ${f.scenarios['Conservador'].value.toLocaleString('pt-BR')}`,
        base: `R$ ${f.scenarios['Base'].value.toLocaleString('pt-BR')}`,
        otimista: `R$ ${f.scenarios['Otimista'].value.toLocaleString('pt-BR')}`
      },
      goalsStatus: `${g.summary.achievedCount + g.summary.onTrackCount} de ${g.summary.totalGoals} metas no ritmo ou atingidas (${g.summary.atRiskCount} em risco)`,
      topOpportunities: p.priorityOpportunities.slice(0, 3),
      risks: p.atRiskPipeline.slice(0, 3)
    };
  }

  /**
   * Gera o Relatório Mensal de Performance (Item 66)
   */
  static generateMonthlyReport({ company = 'TODAS' } = {}) {
    const data = this.getExecutiveDashboardData({ company });
    const perf = data.performance;

    return {
      title: 'Relatório Mensal de Performance & Qualidade de Fontes',
      month: 'Outubro de 2026',
      companyComparison: perf.companyMetrics,
      topServices: perf.services.slice(0, 3),
      portalsRanking: perf.portals,
      sourceQualityLeader: perf.portals.find(p => p.sourceQualityIndex >= 90)?.portal || 'Petronect',
      operationalHealth: perf.operationalEfficiency.status,
      recommendations: [
        'Manter foco nos editais da Petrobras via Petronect devido à alta taxa de conversão.',
        'Intensificar alinhamentos pré-edital de ETE na região Nordeste.',
        'Ajustar prazos de tarefas operacionais para propostas em elaboração.'
      ]
    };
  }

  getExecutiveDashboardData(options) {
    return ExecutiveService.getExecutiveDashboardData(options);
  }

  generateWeeklyExecutiveReport(options) {
    return ExecutiveService.generateWeeklyExecutiveReport(options);
  }

  generateMonthlyReport(options) {
    return ExecutiveService.generateMonthlyReport(options);
  }
}

export const executiveService = new ExecutiveService();
export default executiveService;
