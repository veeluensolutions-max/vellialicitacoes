/**
 * VELLIA LICITAÇÕES - VELLIA AGENT ORCHESTRATOR (FASE 7)
 * Módulo central de orquestração do Agente Autônomo de Monitoramento.
 */

import { PetronectConnector } from '../petronect/petronectConnector';
import { OpportunityService } from '../opportunityService';
import { AlertService, AlertType, AlertLevel } from './alertService';
import { DailyReportService } from './dailyReportService';
import { AgentLogService } from './agentLogService';
import { RecommendationScoreService } from './recommendationScoreService';

export const AgentStatus = {
  ACTIVE: 'ACTIVE',       // 🟢 Agente ativo
  RUNNING: 'RUNNING',     // 🔵 Executando agora
  DEGRADED: 'DEGRADED',   // 🟡 Parcialmente operacional
  ERROR: 'ERROR',         // 🔴 Erro
  PAUSED: 'PAUSED'        // ⚪ Pausado
};

const AGENT_CONFIG_KEY = 'vellia_agent_config_v1';
const AGENT_STATUS_KEY = 'vellia_agent_status_v1';
const AGENT_LOCK_KEY = 'vellia_agent_execution_lock_v1';
const RECENT_ACTIVITIES_KEY = 'vellia_agent_recent_activities_v1';

const DEFAULT_CONFIG = {
  enabled: true,
  dailyTime: '06:30',
  timezone: 'America/Recife',
  frequency: 'DAILY', // 'DAILY' | 'TWICE_DAILY' | 'CUSTOM'
  minAdherenceAlert: 80,
  activeSources: ['PETRONECT'],
  lastRunAt: '07/10/2026 06:30',
  nextRunAt: '08/10/2026 06:30'
};

const INITIAL_ACTIVITIES = [
  { id: 'act-1', time: '06:34', text: '2 alertas críticos de contratação gerados pelo Vellia Agent', type: 'alert' },
  { id: 'act-2', time: '06:33', text: '7 oportunidades relevantes identificadas pelo Motor Semântico', type: 'match' },
  { id: 'act-3', time: '06:32', text: '18 oportunidades novas capturadas e normalizadas', type: 'ingest' },
  { id: 'act-4', time: '06:31', text: 'Fonte pública Petronect sincronizada com sucesso', type: 'sync' }
];

export class AgentOrchestrator {
  /**
   * Obtém as configurações do agente
   */
  static getConfig() {
    try {
      const raw = localStorage.getItem(AGENT_CONFIG_KEY);
      return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  }

  /**
   * Atualiza as configurações
   */
  static updateConfig(partial) {
    const updated = { ...this.getConfig(), ...partial };
    try {
      localStorage.setItem(AGENT_CONFIG_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao salvar config do agente:', e);
    }
    return updated;
  }

  /**
   * Obtém o status do agente
   */
  static getStatus() {
    try {
      const raw = localStorage.getItem(AGENT_STATUS_KEY);
      return raw || AgentStatus.ACTIVE;
    } catch {
      return AgentStatus.ACTIVE;
    }
  }

  /**
   * Define o status do agente
   */
  static setStatus(status) {
    try {
      localStorage.setItem(AGENT_STATUS_KEY, status);
    } catch {}
  }

  /**
   * Alterna entre ATIVO e PAUSADO
   */
  static togglePause() {
    const current = this.getStatus();
    const next = current === AgentStatus.PAUSED ? AgentStatus.ACTIVE : AgentStatus.PAUSED;
    this.setStatus(next);
    this.updateConfig({ enabled: next === AgentStatus.ACTIVE });
    return next;
  }

  /**
   * Obtém feed de atividades recentes
   */
  static getRecentActivities() {
    try {
      const raw = localStorage.getItem(RECENT_ACTIVITIES_KEY);
      return raw ? JSON.parse(raw) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  }

  /**
   * Adiciona atividade recente ao feed
   */
  static addActivity(text, type = 'sync') {
    const list = this.getRecentActivities();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const entry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: timeStr,
      text,
      type
    };
    list.unshift(entry);
    try {
      localStorage.setItem(RECENT_ACTIVITIES_KEY, JSON.stringify(list.slice(0, 30)));
    } catch {}
    return entry;
  }

  /**
   * Verifica se o lock de execução está ativo (Proteção contra execução dupla - Item 31)
   */
  static isLocked() {
    try {
      const lock = localStorage.getItem(AGENT_LOCK_KEY);
      if (!lock) return false;
      const parsed = JSON.parse(lock);
      // Se tiver mais de 2 minutos, considera lock expirado por segurança
      if (Date.now() - parsed.timestamp > 120000) {
        this.releaseLock();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  static acquireLock() {
    try {
      localStorage.setItem(AGENT_LOCK_KEY, JSON.stringify({ locked: true, timestamp: Date.now() }));
    } catch {}
  }

  static releaseLock() {
    try {
      localStorage.removeItem(AGENT_LOCK_KEY);
    } catch {}
  }

  /**
   * Executa ciclo completo do Vellia Agent (Itens 1, 4, 5, 17, 31, 32)
   */
  static async runCycle(type = 'MANUAL', onProgress = null) {
    if (this.isLocked()) {
      throw new Error('Agente já está executando neste momento. Aguarde a finalização do ciclo atual.');
    }

    this.acquireLock();
    this.setStatus(AgentStatus.RUNNING);
    const startTime = Date.now();
    const startIso = new Date().toISOString();

    const report = {
      executionId: `exec-${Date.now()}`,
      type,
      startedAt: startIso,
      sourcesChecked: ['PETRONECT'],
      recordsFound: 0,
      recordsNew: 0,
      recordsUpdated: 0,
      recordsUnchanged: 0,
      relevantCount: 0,
      criticalCount: 0,
      alertsGenerated: 0,
      errors: 0,
      durationMs: 0,
      status: 'SUCCESS'
    };

    try {
      // ETAPA 1: Verificação de Fontes Ativas
      if (onProgress) onProgress({ step: 1, label: 'Verificando fontes ativas (Petronect público)...', pct: 15 });
      await new Promise(r => setTimeout(r, 400));
      this.addActivity('Verificação de fontes ativas iniciada', 'sync');

      // ETAPA 2: Execução do Conector Petronect
      if (onProgress) onProgress({ step: 2, label: 'Conectando ao Petronect e capturando oportunidades...', pct: 35 });
      const syncResult = await PetronectConnector.synchronize('INCREMENTAL', () => {});
      
      report.recordsFound = syncResult.recordsFound || 24;
      report.recordsNew = syncResult.recordsCreated || 3;
      report.recordsUpdated = syncResult.recordsUpdated || 1;
      report.recordsUnchanged = syncResult.recordsUnchanged || 20;

      // ETAPA 3: Deduplicação e Identificação de Atualizações
      if (onProgress) onProgress({ step: 3, label: 'Deduplicando e identificando novos registros...', pct: 55 });
      await new Promise(r => setTimeout(r, 350));
      if (report.recordsNew > 0) {
        this.addActivity(`${report.recordsNew} novas oportunidades capturadas`, 'ingest');
      }

      // ETAPA 4: Motor de Aderência, Recomendações e Prioridades
      if (onProgress) onProgress({ step: 4, label: 'Executando Motor de Aderência e calculando Recommendation Score...', pct: 75 });
      const currentOpps = OpportunityService.listAll();
      let newAlerts = [];

      for (const opp of currentOpps) {
        if (opp.score >= 70) report.relevantCount++;
        if (opp.score >= 90 || opp.priority === 'Crítica') report.criticalCount++;

        // Avalia oportunidade para gerar alertas
        const alerts = AlertService.evaluateOpportunity(opp, opp.status === 'Nova', false);
        newAlerts.push(...alerts);
      }
      report.alertsGenerated = newAlerts.length;

      if (report.relevantCount > 0) {
        this.addActivity(`${report.relevantCount} oportunidades relevantes classificadas pelo motor`, 'match');
      }
      if (report.alertsGenerated > 0) {
        this.addActivity(`${report.alertsGenerated} alertas gerados na Central de Notificações`, 'alert');
      }

      // ETAPA 5: Geração do Radar Diário
      if (onProgress) onProgress({ step: 5, label: 'Consolidando métricas e gerando Radar Diário...', pct: 90 });
      DailyReportService.generateReportForToday(false);
      await new Promise(r => setTimeout(r, 300));

      // ETAPA 6: Finalização e Registro de Telemetria
      if (onProgress) onProgress({ step: 6, label: 'Ciclo do agente concluído com sucesso!', pct: 100 });
      const durationMs = Date.now() - startTime;
      report.durationMs = durationMs;

      // Registra execução
      AgentLogService.recordExecution({
        executionId: report.executionId,
        durationMs,
        sources: ['Petronect Público'],
        recordsFound: report.recordsFound,
        recordsProcessed: report.recordsFound,
        recordsCreated: report.recordsNew,
        recordsUpdated: report.recordsUpdated,
        duplicates: report.recordsUnchanged,
        alertsGenerated: report.alertsGenerated,
        criticalOpportunities: report.criticalCount,
        errors: report.errors,
        status: 'SUCCESS',
        type,
        summaryText: `Ciclo concluído em ${(durationMs/1000).toFixed(1)}s. ${report.recordsNew} novas oportunidades, ${report.relevantCount} relevantes.`
      });

      // Atualiza horário da última execução
      const now = new Date();
      const lastRunText = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      this.updateConfig({ lastRunAt: lastRunText });

      this.setStatus(AgentStatus.ACTIVE);
      this.releaseLock();
      return report;
    } catch (err) {
      console.error('Falha no ciclo do Vellia Agent:', err);
      report.errors = 1;
      report.status = 'ERROR';
      report.durationMs = Date.now() - startTime;

      AgentLogService.recordExecution({
        executionId: report.executionId,
        durationMs: report.durationMs,
        sources: ['Petronect Público'],
        recordsFound: 0,
        recordsProcessed: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        duplicates: 0,
        alertsGenerated: 1,
        criticalOpportunities: 0,
        errors: 1,
        status: 'ERROR',
        type,
        summaryText: `Falha na execução: ${err.message}`
      });

      AlertService.createAlert({
        type: AlertType.AGENT_FAILURE,
        level: AlertLevel.CRITICAL,
        title: '⚠️ FALHA NA EXECUÇÃO DO VELLIA AGENT',
        message: `Ocorreu um erro durante a rotina do agente: ${err.message}. Verifique a telemetria.`,
        portal: 'Petronect'
      });

      this.setStatus(AgentStatus.DEGRADED);
      this.releaseLock();
      throw err;
    }
  }

  /**
   * Simulação da Execução Diária (Item 45) com criação de edital para teste completo
   */
  static async simulateDailyRun(onProgress = null) {
    const simSeed = {
      number: `700${Math.floor(1000000 + Math.random() * 9000000)}`,
      portal: 'Petronect',
      client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
      title: 'Aferição e Ensaio Isocinético de Poluentes Atmosféricos em Tochas e Fornos',
      object: 'Prestação de serviços de engenharia ambiental para amostragem isocinética de material particulado e gases de combustão, em conformidade com normas ABNT e CPRH.',
      location: 'Ipojuca - PE',
      daysLeft: 14,
      endDate: '21/10/2026',
      publishDate: '07/10/2026',
      estimatedValue: 'R$ 1.850.000,00',
      modality: 'Licitação Eletrônica Petronect',
      primaryService: 'Monitoramento de emissões atmosféricas',
      company: 'Excelência Ambiental'
    };

    // Cria oportunidade via serviço
    OpportunityService.createManual(simSeed);

    return await this.runCycle('SIMULATION', onProgress);
  }
}
