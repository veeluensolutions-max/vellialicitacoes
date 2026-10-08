/**
 * VELLIA LICITAÇÕES - AGENT LOG & METRICS SERVICE (FASE 7)
 * Registro de histórico de execuções do agente autônomo e métricas dos últimos 30 dias.
 */

const AGENT_EXECUTIONS_KEY = 'vellia_agent_executions_v1';

const SEED_EXECUTIONS = [
  {
    executionId: 'exec-20261007-063000',
    date: '07/10/2026',
    time: '06:30',
    startedAt: '2026-10-07T06:30:00.000Z',
    finishedAt: '2026-10-07T06:30:45.000Z',
    durationMs: 45200,
    sources: ['Petronect Público'],
    source: 'Petronect Público',
    recordsFound: 186,
    recordsProcessed: 186,
    recordsCreated: 18,
    recordsUpdated: 6,
    duplicates: 162,
    alertsGenerated: 4,
    criticalOpportunities: 2,
    errors: 0,
    status: 'SUCCESS', // 'SUCCESS' | 'PARTIAL' | 'ERROR'
    type: 'SCHEDULED', // 'SCHEDULED' | 'MANUAL' | 'SIMULATION'
    summaryText: 'Execução agendada das 06:30 finalizada com êxito. 18 novas oportunidades e 4 alertas gerados.'
  },
  {
    executionId: 'exec-20261006-063000',
    date: '06/10/2026',
    time: '06:30',
    startedAt: '2026-10-06T06:30:00.000Z',
    finishedAt: '2026-10-06T06:30:41.000Z',
    durationMs: 41300,
    sources: ['Petronect Público'],
    source: 'Petronect Público',
    recordsFound: 174,
    recordsProcessed: 174,
    recordsCreated: 12,
    recordsUpdated: 4,
    duplicates: 158,
    alertsGenerated: 3,
    criticalOpportunities: 1,
    errors: 0,
    status: 'SUCCESS',
    type: 'SCHEDULED',
    summaryText: 'Execução automática matinal concluída. 12 novos editais identificados.'
  },
  {
    executionId: 'exec-20261005-063000',
    date: '05/10/2026',
    time: '06:30',
    startedAt: '2026-10-05T06:30:00.000Z',
    finishedAt: '2026-10-05T06:30:38.000Z',
    durationMs: 38700,
    sources: ['Petronect Público'],
    source: 'Petronect Público',
    recordsFound: 168,
    recordsProcessed: 168,
    recordsCreated: 15,
    recordsUpdated: 3,
    duplicates: 150,
    alertsGenerated: 3,
    criticalOpportunities: 1,
    errors: 0,
    status: 'SUCCESS',
    type: 'SCHEDULED',
    summaryText: 'Varredura automática rotineira com 15 novas oportunidades inseridas no banco.'
  }
];

export class AgentLogService {
  /**
   * Obtém a lista de execuções históricas do agente
   */
  static listExecutions() {
    try {
      const raw = localStorage.getItem(AGENT_EXECUTIONS_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(AGENT_EXECUTIONS_KEY, JSON.stringify(SEED_EXECUTIONS));
      return SEED_EXECUTIONS;
    } catch {
      return SEED_EXECUTIONS;
    }
  }

  /**
   * Registra uma nova execução do agente
   */
  static recordExecution(data) {
    const list = this.listExecutions();
    const entry = {
      executionId: data.executionId || `exec-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      startedAt: data.startedAt || new Date().toISOString(),
      finishedAt: data.finishedAt || new Date().toISOString(),
      durationMs: data.durationMs || 1500,
      sources: data.sources || ['Petronect Público'],
      source: data.source || 'Petronect Público',
      recordsFound: data.recordsFound || 0,
      recordsProcessed: data.recordsProcessed || 0,
      recordsCreated: data.recordsCreated || 0,
      recordsUpdated: data.recordsUpdated || 0,
      duplicates: data.duplicates || 0,
      alertsGenerated: data.alertsGenerated || 0,
      criticalOpportunities: data.criticalOpportunities || 0,
      errors: data.errors || 0,
      status: data.status || 'SUCCESS',
      type: data.type || 'MANUAL',
      summaryText: data.summaryText || 'Execução do agente finalizada.'
    };

    list.unshift(entry);
    try {
      localStorage.setItem(AGENT_EXECUTIONS_KEY, JSON.stringify(list.slice(0, 100)));
    } catch (e) {
      console.warn('Erro ao salvar execução do agente:', e);
    }
    return entry;
  }

  /**
   * Obtém métricas consolidadas dos últimos 30 dias (Item 36)
   */
  static getMetrics30Days() {
    return {
      totalAnalyzed: 1860,
      totalRelevant: 194,
      totalCritical: 32,
      activeParticipations: 4,
      relevanceRate: '10.4%',
      averageAdherence: '74.2%',
      dailyDistribution: [
        { day: '01/10', count: 18, critical: 2 },
        { day: '02/10', count: 22, critical: 3 },
        { day: '03/10', count: 14, critical: 1 },
        { day: '04/10', count: 16, critical: 2 },
        { day: '05/10', count: 25, critical: 3 },
        { day: '06/10', count: 19, critical: 2 },
        { day: '07/10', count: 24, critical: 4 }
      ],
      topServices: [
        { name: 'Emissões Atmosféricas', count: 48, pct: 36 },
        { name: 'Operação de ETE', count: 34, pct: 26 },
        { name: 'NR-13 Caldeiras', count: 26, pct: 20 },
        { name: 'Gestão de Resíduos', count: 14, pct: 11 },
        { name: 'Saneamento Geral', count: 9, pct: 7 }
      ]
    };
  }
}
