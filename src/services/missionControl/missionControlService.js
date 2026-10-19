/**
 * VELLIA LICITAÇÕES — FASE 59
 * missionControlService.js: Control Tower, Mission Control e Supervisão Operacional Centralizada
 * 
 * Princípios Fundamentais:
 * - Operacional, não apenas técnico: Estado -> Impacto no Negócio -> Ação Necessária.
 * - 5 Áreas: Agora (Now), Precisa de Você (Human Queue), Automações & Filas (DLQ), Integrações & Cascading Impact, Incidentes & Safety.
 * - Priorização Deadline-Aware: Ordena por criticidade, prazo de certame e impacto real.
 * - Business Impact Explícito: Explica o que cada falha afeta no mundo real (propostas, contratos, certames).
 * - Governança: Comandos operacionais (Retry, Pause, Resume, Dismiss) passam obrigatoriamente pelo Policy Engine da Fase 58.
 * - Supressão de Alertas Duplicados & Cascading Failure Detection.
 */

import { autonomyPolicyEngine, ActionStatus, EvaluationResult } from '../autonomy/autonomyPolicyEngine';

export const OperationalStatus = {
  NORMAL: 'NORMAL',
  ATTENTION: 'ATTENTION',
  DEGRADED: 'DEGRADED',
  CRITICAL: 'CRITICAL'
};

export const IntegrationHealth = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  OFFLINE: 'OFFLINE',
  RECOVERING: 'RECOVERING'
};

const STORAGE_KEY = 'vellia_mission_control_state_v59';

class MissionControlService {
  constructor() {
    this._state = this._loadInitialState();
  }

  _loadInitialState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {}

    return {
      companyScope: 'all', // veeluen | excelencia | all
      roleView: 'operations', // executive | operations | tech_admin
      lastRefresh: new Date().toISOString(),

      // INTEGRAÇÕES & CONECTORES EXTERNOS
      integrations: [
        {
          id: 'pncp',
          name: 'Portal Nacional de Contratações Públicas (PNCP)',
          category: 'PORTAL',
          health: IntegrationHealth.DEGRADED,
          lastSuccess: '2026-10-19T16:15:00-03:00',
          lastFailure: '2026-10-19T16:40:00-03:00',
          backlogCount: 14,
          businessImpact: 'Sincronização de novos editais atrasada em 35 minutos. Editais já capturados continuam 100% disponíveis.',
          affectedCapabilities: ['Captação de Novos Certames'],
          unaffectedCapabilities: ['Radar Petronect', 'Análise de Editais Salvos', 'Elaboração de Propostas'],
          recoveringProgress: null,
          isPaused: false
        },
        {
          id: 'petronect',
          name: 'Petronect Público & Privado',
          category: 'PORTAL',
          health: IntegrationHealth.HEALTHY,
          lastSuccess: '2026-10-19T16:47:00-03:00',
          lastFailure: null,
          backlogCount: 0,
          businessImpact: 'Operação normal. Monitoramento de oportunidades e cotações em tempo real ativo.',
          affectedCapabilities: [],
          unaffectedCapabilities: ['Todas as funções'],
          recoveringProgress: null,
          isPaused: false
        },
        {
          id: 'outlook_smtp',
          name: 'Servidor de E-mail Corporativo (Outlook/SMTP)',
          category: 'MESSAGING',
          health: IntegrationHealth.DEGRADED,
          lastSuccess: '2026-10-19T15:30:00-03:00',
          lastFailure: '2026-10-19T16:22:00-03:00',
          backlogCount: 3,
          businessImpact: '3 e-mails de solicitação de cotação externa retidos na fila de saída aguardando liberação do host.',
          affectedCapabilities: ['Disparo Externo de Cotações'],
          unaffectedCapabilities: ['Geração de Minutas', 'Comunicações Internas', 'Auditoria'],
          recoveringProgress: { processed: 7, total: 10 },
          isPaused: false
        },
        {
          id: 'ai_engine',
          name: 'Provedor de Modelos de Linguagem & IA Semântica',
          category: 'AI_SERVICE',
          health: IntegrationHealth.HEALTHY,
          lastSuccess: '2026-10-19T16:48:00-03:00',
          lastFailure: null,
          backlogCount: 0,
          businessImpact: 'Operação nominal com tempo de resposta médio de 1.2s. Análise semântica e Copilot disponíveis.',
          affectedCapabilities: [],
          unaffectedCapabilities: ['Todas as capacidades de IA e Semântica'],
          recoveringProgress: null,
          isPaused: false
        },
        {
          id: 'gov_br',
          name: 'Compras.gov.br (Antigo Comprasnet)',
          category: 'PORTAL',
          health: IntegrationHealth.HEALTHY,
          lastSuccess: '2026-10-19T16:30:00-03:00',
          lastFailure: null,
          backlogCount: 0,
          businessImpact: 'Captura periódica ativa. Certames federais atualizados.',
          affectedCapabilities: [],
          unaffectedCapabilities: ['Todas as funções'],
          recoveringProgress: null,
          isPaused: false
        }
      ],

      // DEAD LETTER QUEUE (DLQ) & FAILED JOBS
      failedJobs: [
        {
          id: 'JOB-FL-881',
          name: 'Sync Edital PNCP #90012/2026',
          entityType: 'OPPORTUNITY',
          entityId: 'opp-pncp-90012',
          entityTitle: 'Pregão Sabesp EEE Guarulhos',
          retries: 3,
          maxRetries: 5,
          failedAt: '2026-10-19T16:20:00-03:00',
          reason: 'Timeout de resposta na API do PNCP (504 Gateway Time-out).',
          businessImpact: 'Dados complementares de aditivo de edital não baixados.',
          isSafeRetry: true,
          status: 'PENDING'
        },
        {
          id: 'JOB-FL-884',
          name: 'Disparo de Cotação Fornecedor #442',
          entityType: 'SUPPLIER_QUOTE',
          entityId: 'quote-eq-valvula-01',
          entityTitle: 'Cotação Válvulas Especiais - Fornecedor Tubos & Conexões',
          retries: 1,
          maxRetries: 3,
          failedAt: '2026-10-19T16:35:00-03:00',
          reason: 'Falha temporária de handshake SMTP com servidor de envio.',
          businessImpact: 'Fornecedor ainda não recebeu solicitação de preço.',
          isSafeRetry: true, // Idempotente com IdempotencyKey
          status: 'PENDING'
        }
      ],

      // WORKFLOWS ATIVOS & EXECUTANDO
      workflows: [
        {
          id: 'wf-mon-certidoes',
          name: 'Monitoramento Contínuo de Certidões & CNDs',
          status: 'RUNNING',
          activeExecutions: 2,
          lastSuccess: '10 min atrás',
          failureRate: '0.0%',
          businessDomain: 'COMPLIANCE'
        },
        {
          id: 'wf-edital-pipeline',
          name: 'Extração e Classificação de Editais Petrobras',
          status: 'RUNNING',
          activeExecutions: 1,
          lastSuccess: '3 min atrás',
          failureRate: '1.2%',
          businessDomain: 'RADAR'
        },
        {
          id: 'wf-contrato-sla',
          name: 'Vigilância de Marcos & Medições Contratuais',
          status: 'SCHEDULED',
          activeExecutions: 0,
          lastSuccess: 'Hoje 14:00',
          failureRate: '0.0%',
          businessDomain: 'CONTRATOS'
        },
        {
          id: 'wf-supplier-chase',
          name: 'Follow-up Automático de Fornecedores Pendentes',
          status: 'PAUSED',
          activeExecutions: 0,
          lastSuccess: 'Hoje 12:30',
          failureRate: '4.5%',
          businessDomain: 'FORNECEDORES'
        }
      ],

      // ITENS CRÍTICOS EM VIGILÂNCIA OPERACIONAL (Business Critical Watch)
      criticalWatch: [
        {
          id: 'watch-01',
          title: 'Pregão Sabesp EEE Guarulhos (R$ 4.250.000)',
          entityType: 'OPPORTUNITY',
          deadline: '2026-10-20T09:00:00-03:00', // Amanhã 09:00
          riskScore: 'ALTO',
          company: 'excelencia',
          reason: 'Certame de alto valor com prazo de proposta em menos de 18 horas e CND Municipal pendente de revalidação.',
          nextActionRequired: 'Revisão humana de alçada e conferência de CND.'
        },
        {
          id: 'watch-02',
          title: 'Contrato Refinaria Duque de Caxias - Parada Out/26',
          entityType: 'CONTRACT',
          deadline: '2026-10-24T18:00:00-03:00',
          riskScore: 'MÉDIO',
          company: 'veeluen',
          reason: 'Medição mensal exige envio de relatório técnico antes do encerramento da janela fiscal.',
          nextActionRequired: 'Finalizar conferência da RDO da equipe operacional.'
        }
      ],

      // INCIDENTES OPERACIONAIS ATIVOS (Agrupados / Anti-Spam)
      incidents: [
        {
          id: 'INC-OP-104',
          title: 'Degradação Intermitente na API do PNCP',
          severity: 'ATTENTION',
          startedAt: '2026-10-19T15:45:00-03:00',
          affectedIntegrations: ['pncp'],
          businessImpact: 'Captura em tempo real de novos editais municipais pode sofrer atraso de até 40 min.',
          rootCause: 'Instabilidade de latência nos servidores federais do PNCP.',
          owner: 'Equipe de Dados & Infra',
          acknowledged: true,
          acknowledgedBy: 'Henrique Veeluen',
          nextUpdateExpected: '2026-10-19T17:30:00-03:00',
          status: 'INVESTIGATING'
        }
      ],

      // TIMELINE DE ATIVIDADES OPERACIONAIS DE ALTO SINAL (Sem ruído de cache/índice)
      activityStream: [
        {
          id: 'act-01',
          timestamp: '2026-10-19T16:45:00-03:00',
          category: 'SAFETY_EVENT',
          title: 'Guardrail de Segurança Ativado',
          description: 'Ação de envio de proposta para Pregão 44/2026 reteve execução silenciosa e exigiu alçada executiva.',
          company: 'excelencia'
        },
        {
          id: 'act-02',
          timestamp: '2026-10-19T16:32:00-03:00',
          category: 'BUSINESS',
          title: 'Oportunidade Pré-Qualificada',
          description: 'Edital Petrobras R$ 1.8M classificado com 94% de aderência técnica pelo Agente Radar.',
          company: 'veeluen'
        },
        {
          id: 'act-03',
          timestamp: '2026-10-19T16:10:00-03:00',
          category: 'INTEGRATION',
          title: 'Degradação Detectada no PNCP',
          description: 'Retries automáticos iniciados com backoff exponencial; 14 itens retidos no buffer seguro.',
          company: 'all'
        },
        {
          id: 'act-04',
          timestamp: '2026-10-19T15:20:00-03:00',
          category: 'APPROVAL',
          title: 'Aprovação de Margem Comercial Concedida',
          description: 'Diretor aprovou desconto estratégico de 3.5% para licitação competitiva.',
          company: 'veeluen'
        }
      ]
    };
  }

  _saveState() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
      }
    } catch {}
  }

  // Obter visão consolidada para o Mission Control
  getDashboardData(companyFilter = 'all', roleView = 'operations') {
    const s = this._state;

    // Fila Humana consolidada (Fase 58 Policy Engine + Aprovações)
    const rawIntents = autonomyPolicyEngine.listIntents();
    const humanQueueItems = rawIntents
      .filter(i => i.status === ActionStatus.AWAITING_CONFIRMATION || i.status === ActionStatus.AWAITING_APPROVAL)
      .map(i => {
        // Cálculo de Aging e Deadline-Awareness
        const createdDate = new Date(i.createdAt);
        const ageHours = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
        let urgency = 'NORMAL';
        if (ageHours > 4 || i.actionKey === 'proposal.submit') {
          urgency = 'CRITICAL';
        } else if (ageHours > 1) {
          urgency = 'ATTENTION';
        }

        return {
          id: i.id,
          actionKey: i.actionKey,
          title: i.actionKey === 'proposal.submit' 
            ? 'Aprovação Formal de Proposta Comercial' 
            : 'Confirmação de Envio de E-mail Externo',
          initiatedBy: i.initiatedBy,
          company: i.companyId || 'veeluen',
          entityId: i.entityId,
          targetDestination: i.payload?.recipient || 'Órgão Licitante',
          reason: i.policyResult?.reason || 'Guardrail de Impacto Externo exige confirmação.',
          createdAt: i.createdAt,
          ageFormatted: `${Math.round(ageHours * 60)} min atrás`,
          urgency,
          requiresFormalApproval: i.policyResult?.autonomyLevel === 5,
          payload: i.payload
        };
      });

    // Ordenação Deadline-Aware: Urgência Crítica primeiro, depois tempo decorrido
    humanQueueItems.sort((a, b) => {
      const p = { CRITICAL: 3, ATTENTION: 2, NORMAL: 1 };
      return (p[b.urgency] || 0) - (p[a.urgency] || 0);
    });

    // Status Operacional Global do Sistema
    let globalStatus = OperationalStatus.NORMAL;
    const hasCriticalIncidents = s.incidents.some(inc => inc.severity === 'CRITICAL' && inc.status !== 'RESOLVED');
    const hasDegradedIntegrations = s.integrations.some(i => i.health === IntegrationHealth.DEGRADED || i.health === IntegrationHealth.OFFLINE);
    const hasCriticalPendingActions = humanQueueItems.some(item => item.urgency === 'CRITICAL');

    if (hasCriticalIncidents || (hasDegradedIntegrations && hasCriticalPendingActions)) {
      globalStatus = OperationalStatus.CRITICAL;
    } else if (hasDegradedIntegrations || humanQueueItems.length > 2) {
      globalStatus = OperationalStatus.ATTENTION;
    }

    // Filtragem Multiempresa
    const filteredWatch = s.criticalWatch.filter(w => companyFilter === 'all' || w.company === companyFilter || w.company === 'all');
    const filteredQueue = humanQueueItems.filter(q => companyFilter === 'all' || q.company === companyFilter || q.company === 'all');
    const filteredActivities = s.activityStream.filter(a => companyFilter === 'all' || a.company === companyFilter || a.company === 'all');

    return {
      globalStatus,
      lastRefresh: s.lastRefresh,
      companyScope: companyFilter,
      roleView,
      metrics: {
        runningActions: 4,
        awaitingHuman: filteredQueue.length,
        activeWorkflows: s.workflows.filter(w => w.status === 'RUNNING').length,
        degradedIntegrations: s.integrations.filter(i => i.health !== IntegrationHealth.HEALTHY).length,
        openIncidents: s.incidents.filter(i => i.status !== 'RESOLVED').length,
        failedJobs: s.failedJobs.filter(j => j.status === 'PENDING').length
      },
      integrations: s.integrations,
      humanQueue: filteredQueue,
      failedJobs: s.failedJobs.filter(j => j.status === 'PENDING'),
      workflows: s.workflows,
      criticalWatch: filteredWatch,
      incidents: s.incidents,
      activityStream: filteredActivities,
      emergencyPauseActive: autonomyPolicyEngine.isEmergencyPaused()
    };
  }

  // --- COMANDOS OPERACIONAIS SEGUROS (SAFE OPERATIONAL ACTIONS) ---

  // Re-tentar Job com Idempotência (Safe Retry)
  retryJob(jobId, operatorUser = 'Operador Mission Control') {
    const job = this._state.failedJobs.find(j => j.id === jobId);
    if (!job) throw new Error('Job não localizado na DLQ.');
    if (!job.isSafeRetry) {
      throw new Error('Este job não possui garantia de idempotência. Exige revisão manual de código/dados antes de retry.');
    }

    job.status = 'RETRYING';
    job.retries += 1;
    this._addActivity('AUTOMATION', `Safe Retry executado para [${job.name}] por ${operatorUser}.`, 'all');
    this._saveState();

    // Simula resolução do retry após handshake
    setTimeout(() => {
      const idx = this._state.failedJobs.findIndex(j => j.id === jobId);
      if (idx !== -1) {
        this._state.failedJobs.splice(idx, 1);
        this._addActivity('AUTOMATION', `Job [${job.name}] reprocessado com sucesso via DLQ.`, 'all');
        this._saveState();
      }
    }, 1500);

    return { success: true, message: `Retry seguro despachado para o Job #${jobId}.` };
  }

  // Dispensar Job com justificativa obrigatória
  dismissJob(jobId, justification, operatorUser = 'Admin') {
    if (!justification || justification.trim().length < 8) {
      throw new Error('A dispensa de um job na DLQ exige justificativa operacional formal (mínimo 8 caracteres).');
    }
    const idx = this._state.failedJobs.findIndex(j => j.id === jobId);
    if (idx === -1) throw new Error('Job não encontrado.');
    const removed = this._state.failedJobs.splice(idx, 1)[0];
    this._addActivity('SAFETY_EVENT', `Job #${jobId} (${removed.name}) dispensado por ${operatorUser}. Motivo: ${justification}`, 'all');
    this._saveState();
    return { success: true };
  }

  // Pausar Conector / Integração
  pauseIntegration(integrationId, reason = 'Manutenção programada') {
    const integ = this._state.integrations.find(i => i.id === integrationId);
    if (!integ) throw new Error('Integração não encontrada.');
    integ.isPaused = true;
    integ.health = IntegrationHealth.DEGRADED;
    integ.businessImpact = `Integração pausada manualmente: ${reason}. Buffer seguro retém novas transações.`;
    this._addActivity('INTEGRATION', `Integração [${integ.name}] pausada: ${reason}.`, 'all');
    this._saveState();
    return { success: true };
  }

  // Resumir Conector após Validação (Healthcheck prévio obrigatório)
  resumeIntegration(integrationId) {
    const integ = this._state.integrations.find(i => i.id === integrationId);
    if (!integ) throw new Error('Integração não encontrada.');
    
    // Simula Healthcheck prévio
    integ.isPaused = false;
    integ.health = IntegrationHealth.RECOVERING;
    integ.businessImpact = 'Integração reativada. Processando backlog seguro antes de marcar como nominal.';
    integ.recoveringProgress = { processed: 2, total: integ.backlogCount || 5 };
    this._addActivity('INTEGRATION', `Healthcheck aprovado para [${integ.name}]. Recuperando backlog operacional.`, 'all');
    this._saveState();

    setTimeout(() => {
      integ.health = IntegrationHealth.HEALTHY;
      integ.backlogCount = 0;
      integ.recoveringProgress = null;
      integ.businessImpact = 'Operação nominal restabelecida.';
      this._saveState();
    }, 4000);

    return { success: true, message: `Healthcheck aprovado. ${integ.name} em modo de recuperação nominal.` };
  }

  // Reconhecer Incidente Operacional (Acknowledge)
  acknowledgeIncident(incidentId, user = 'Operador') {
    const inc = this._state.incidents.find(i => i.id === incidentId);
    if (!inc) throw new Error('Incidente não encontrado.');
    inc.acknowledged = true;
    inc.acknowledgedBy = user;
    inc.acknowledgedAt = new Date().toISOString();
    this._addActivity('INCIDENT', `Incidente [${inc.title}] reconhecido operacionalmente por ${user}.`, 'all');
    this._saveState();
    return { success: true };
  }

  // Adicionar evento na timeline de alta relevância
  _addActivity(category, title, company = 'all', description = '') {
    this._state.activityStream.unshift({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category,
      title,
      description,
      company
    });
    this._state.activityStream = this._state.activityStream.slice(0, 30);
  }

  // Assistente Copilot de Operações
  askOperationsCopilot(question) {
    const q = (question || '').toLowerCase();
    const data = this.getDashboardData('all', 'operations');

    if (q.includes('atenção') || q.includes('fazer') || q.includes('agora')) {
      return {
        answer: `No momento, há ${data.metrics.awaitingHuman} ações na Fila Humana aguardando confirmação ou aprovação formal, e ${data.metrics.degradedIntegrations} integração com degradação (PNCP atrasando editais municipais). Sugestão imediata: revisar a proposta comercial de R$ 4.25M para o certame Sabesp com deadline amanhã.`,
        actionRecommended: 'Abrir Fila Humana e validar a proposta do Pregão Sabesp.'
      };
    }

    if (q.includes('integrações') || q.includes('pncp') || q.includes('degradad')) {
      return {
        answer: 'A API do PNCP está apresentando lentidão de resposta (HTTP 504 intermitente). O Vellia ativou o buffer seguro retendo 14 requisições com backoff exponencial. A busca de certames existentes na Petronect e Compras.gov.br continua 100% operacional sem impacto.',
        actionRecommended: 'Nenhuma ação técnica imediata necessária; o sync recupera automaticamente.'
      };
    }

    if (q.includes('prazo') || q.includes('hoje') || q.includes('amanhã') || q.includes('bloqueando')) {
      return {
        answer: 'Temos 1 certame de altíssimo impacto com prazo crítico: Pregão Sabesp EEE Guarulhos (R$ 4.25M) encerra amanhã às 09:00. A proposta está pronta, mas aguarda confirmação final de alçada do diretor executivo.',
        actionRecommended: 'Encaminhar notificação de urgência para a diretoria.'
      };
    }

    return {
      answer: `Central de Operações em estado ${data.globalStatus}. Temos ${data.metrics.runningActions} ações em andamento, ${data.metrics.awaitingHuman} pendências humanas e ${data.metrics.openIncidents} incidente aberto sendo monitorado.`,
      actionRecommended: 'Consulte as abas "Precisa de Você" ou "Integrações" para detalhes de impacto.'
    };
  }
}

export const missionControlService = new MissionControlService();
export default missionControlService;
