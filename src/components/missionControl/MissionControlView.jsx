import React, { useState, useEffect } from 'react';
import {
  Activity, ShieldAlert, AlertTriangle, CheckCircle2, Clock, RefreshCw,
  Cpu, Server, Zap, UserCheck, AlertOctagon, HelpCircle, Layers,
  ExternalLink, Play, Pause, RotateCcw, Filter, Building, Eye,
  ArrowRight, ShieldCheck, Flame, Compass, FileText
} from 'lucide-react';
import missionControlService, {
  OperationalStatus,
  IntegrationHealth
} from '../../services/missionControl/missionControlService';
import { autonomyPolicyEngine } from '../../services/autonomy/autonomyPolicyEngine';
import './MissionControlView.css';

export default function MissionControlView() {
  const [companyScope, setCompanyScope] = useState('all');
  const [roleView, setRoleView] = useState('operations'); // executive | operations | tech_admin
  const [activeTab, setActiveTab] = useState('now'); // now | queue | automations | integrations | incidents
  const [dashboardData, setDashboardData] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal de Detalhe / Review de Ação Humana
  const [selectedQueueItem, setSelectedQueueItem] = useState(null);

  // Modal de Dismiss para DLQ
  const [dismissJobTarget, setDismissJobTarget] = useState(null);
  const [dismissReason, setDismissReason] = useState('');

  // Operations Copilot State
  const [copilotQuery, setCopilotQuery] = useState('Resuma o que precisa da minha atenção agora.');
  const [copilotResponse, setCopilotResponse] = useState(null);

  const loadData = () => {
    const data = missionControlService.getDashboardData(companyScope, roleView);
    setDashboardData(data);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // Polling suave de atualização operacional
    return () => clearInterval(interval);
  }, [companyScope, roleView]);

  const showNotify = (text, isError = false) => {
    setNotification({ text, isError });
    setTimeout(() => setNotification(null), 4500);
  };

  if (!dashboardData) {
    return <div className="mission-control-container"><p>Carregando Central de Operações...</p></div>;
  }

  // Ações Operacionais Seguras
  const handleSafeRetryJob = (jobId) => {
    try {
      const res = missionControlService.retryJob(jobId);
      showNotify(res.message);
      loadData();
    } catch (err) {
      showNotify(err.message, true);
    }
  };

  const handleDismissJobSubmit = () => {
    if (!dismissJobTarget) return;
    try {
      missionControlService.dismissJob(dismissJobTarget.id, dismissReason);
      showNotify(`Job #${dismissJobTarget.id} dispensado da DLQ com sucesso.`);
      setDismissJobTarget(null);
      setDismissReason('');
      loadData();
    } catch (err) {
      showNotify(err.message, true);
    }
  };

  const handleToggleIntegrationPause = (integ) => {
    try {
      if (integ.isPaused) {
        const res = missionControlService.resumeIntegration(integ.id);
        showNotify(res.message);
      } else {
        missionControlService.pauseIntegration(integ.id, 'Pausado via Mission Control');
        showNotify(`Integração ${integ.name} pausada com segurança.`);
      }
      loadData();
    } catch (err) {
      showNotify(err.message, true);
    }
  };

  const handleConfirmHumanAction = (intentId) => {
    const res = autonomyPolicyEngine.confirmIntent(intentId, 'Operador Mission Control');
    if (res.success) {
      autonomyPolicyEngine.executeIntent(intentId);
      showNotify(`Ação #${intentId} confirmada e executada via Policy Engine.`);
      setSelectedQueueItem(null);
      loadData();
    } else {
      showNotify(res.reason, true);
    }
  };

  const handleAcknowledgeIncident = (incId) => {
    try {
      missionControlService.acknowledgeIncident(incId, 'Operador Mission Control');
      showNotify('Incidente reconhecido com sucesso.');
      loadData();
    } catch (err) {
      showNotify(err.message, true);
    }
  };

  const handleAskCopilot = (questionText) => {
    const q = questionText || copilotQuery;
    const ans = missionControlService.askOperationsCopilot(q);
    setCopilotResponse(ans);
  };

  return (
    <div className="mission-control-container">
      {/* HEADER PRINCIPAL */}
      <header className="mission-header">
        <div className="mission-header-left">
          <div className="mission-live-pill">
            <span className="pulse-radar"></span>
            MISSION CONTROL • FASE 59
          </div>
          <h1>
            <Activity size={26} className="text-primary" />
            Central de Operações (Control Tower)
          </h1>
          <p className="mission-header-subtitle">
            Supervisão operacional unificada. Visualize o estado do ecossistema, o impacto no negócio e aja antes que certames sejam perdidos.
          </p>
        </div>

        <div className="mission-header-controls">
          {/* SELETOR MULTIEMPRESA */}
          <div className="control-pill-group">
            <Building size={16} />
            <select
              value={companyScope}
              onChange={(e) => setCompanyScope(e.target.value)}
              aria-label="Escopo de Empresa"
            >
              <option value="all">Visão Consolidada (Grupo)</option>
              <option value="veeluen">Veeluen Soluções (Matriz)</option>
              <option value="excelencia">Excelência Ambiental</option>
            </select>
          </div>

          {/* SELETOR DE PERFIL (ROLE VIEW) */}
          <div className="control-pill-group">
            <UserCheck size={16} />
            <select
              value={roleView}
              onChange={(e) => setRoleView(e.target.value)}
              aria-label="Perfil Operacional"
            >
              <option value="operations">Visão Operações</option>
              <option value="executive">Visão Executiva</option>
              <option value="tech_admin">Admin Técnico / DLQ</option>
            </select>
          </div>

          <button className="btn-refresh-mc" onClick={loadData}>
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
      </header>

      {/* NOTIFICAÇÃO TEMPORÁRIA */}
      {notification && (
        <div className={`operational-status-bar ${notification.isError ? 'status-critical' : 'status-normal'}`}>
          <div className="status-bar-info">
            {notification.isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            <span>{notification.text}</span>
          </div>
        </div>
      )}

      {/* BARRA DE STATUS OPERACIONAL GLOBAL (NOW VIEW) */}
      <div className={`operational-status-bar status-${dashboardData.globalStatus.toLowerCase()}`}>
        <div className="status-bar-info">
          <span className="status-badge-tag">STATUS: {dashboardData.globalStatus}</span>
          <span className="status-bar-text">
            {dashboardData.globalStatus === OperationalStatus.NORMAL
              ? 'Todos os serviços, integrações e agentes estão operando dentro dos parâmetros nominais.'
              : dashboardData.globalStatus === OperationalStatus.ATTENTION
              ? 'Atenção Operacional: Há ações na Fila Humana ou integrações com degradação pontual em monitoramento.'
              : 'Alerta Operacional Crítico: Certames ou integrações de alto impacto exigem atenção imediata da equipe.'}
          </span>
        </div>
        <div className="status-bar-time">
          Última verificação: {new Date(dashboardData.lastRefresh).toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* 6 CARDS OPERACIONAIS DE RESUMO (NOW VIEW) */}
      <section className="mission-overview-grid">
        <div className="overview-card">
          <div className="card-top">
            <span>Ações em Andamento</span>
            <Play size={16} className="text-info" />
          </div>
          <div className="card-number">{dashboardData.metrics.runningActions}</div>
          <div className="card-foot">Agentes e rotinas ativas</div>
        </div>

        <div className={`overview-card ${dashboardData.metrics.awaitingHuman > 0 ? 'alert-card' : ''}`}>
          <div className="card-top">
            <span>Precisa de Você</span>
            <UserCheck size={16} className="text-warning" />
          </div>
          <div className="card-number">{dashboardData.metrics.awaitingHuman}</div>
          <div className="card-foot">Confirmações & Aprovações</div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span>Workflows Ativos</span>
            <Zap size={16} className="text-primary" />
          </div>
          <div className="card-number">{dashboardData.metrics.activeWorkflows}</div>
          <div className="card-foot">Monitoramento & Editais</div>
        </div>

        <div className={`overview-card ${dashboardData.metrics.degradedIntegrations > 0 ? 'alert-card' : ''}`}>
          <div className="card-top">
            <span>Conectores Degradados</span>
            <Server size={16} className="text-danger" />
          </div>
          <div className="card-number">{dashboardData.metrics.degradedIntegrations}</div>
          <div className="card-foot">Buffer seguro ativo</div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span>Incidentes Abertos</span>
            <AlertOctagon size={16} className="text-accent" />
          </div>
          <div className="card-number">{dashboardData.metrics.openIncidents}</div>
          <div className="card-foot">Agrupados / Anti-spam</div>
        </div>

        <div className="overview-card">
          <div className="card-top">
            <span>Falhas na Fila (DLQ)</span>
            <RotateCcw size={16} className="text-muted" />
          </div>
          <div className="card-number">{dashboardData.metrics.failedJobs}</div>
          <div className="card-foot">Safe Retry disponível</div>
        </div>
      </section>

      {/* NAVEGAÇÃO DE ABAS */}
      <nav className="mission-tabs-nav">
        <button
          className={`mission-tab-btn ${activeTab === 'now' ? 'active' : ''}`}
          onClick={() => setActiveTab('now')}
        >
          <Activity size={16} />
          1. Agora (Now View)
        </button>
        <button
          className={`mission-tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <UserCheck size={16} />
          2. Precisa de Você
          {dashboardData.metrics.awaitingHuman > 0 && (
            <span className="tab-badge-count">{dashboardData.metrics.awaitingHuman}</span>
          )}
        </button>
        <button
          className={`mission-tab-btn ${activeTab === 'automations' ? 'active' : ''}`}
          onClick={() => setActiveTab('automations')}
        >
          <Zap size={16} />
          3. Automações & Filas (DLQ)
        </button>
        <button
          className={`mission-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <Server size={16} />
          4. Integrações & Impacto
        </button>
        <button
          className={`mission-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          <ShieldAlert size={16} />
          5. Incidentes & Safety
        </button>
      </nav>

      {/* CONTEÚDO DAS ABAS */}
      <main className="mission-tab-content">
        {/* ABA 1: AGORA (NOW VIEW) */}
        {activeTab === 'now' && (
          <div className="tab-pane-now">
            {/* ITENS CRÍTICOS EM VIGILÂNCIA OPERACIONAL */}
            <div className="queue-section-header">
              <h2>Itens Críticos Sob Vigilância Operacional (Business Watch)</h2>
              <span className="text-muted font-sm">Oportunidades e contratos de alto impacto</span>
            </div>

            <div className="watch-cards-grid mt-2">
              {dashboardData.criticalWatch.map(w => (
                <div key={w.id} className="watch-card">
                  <div className="watch-top">
                    <div>
                      <span className="integ-category">{w.entityType} • {w.company.toUpperCase()}</span>
                      <div className="watch-title">{w.title}</div>
                    </div>
                    <span className={`watch-risk-badge ${w.riskScore.toLowerCase()}`}>
                      Risco {w.riskScore}
                    </span>
                  </div>
                  <div className="watch-reason">{w.reason}</div>
                  <div className="watch-action-box">
                    <strong>Ação Necessária:</strong> {w.nextActionRequired}
                  </div>
                </div>
              ))}
            </div>

            {/* COPILOT OPERACIONAL */}
            <div className="operations-copilot-card mt-4">
              <div className="copilot-header">
                <HelpCircle size={18} />
                <span>Copilot de Operações & Assistência Rápida</span>
              </div>
              <p className="font-sm text-muted">
                Perguntas objetivas respondidas diretamente a partir do estado em tempo real dos conectores e certames:
              </p>
              <div className="copilot-prompts-row">
                <button
                  className="btn-copilot-prompt"
                  onClick={() => handleAskCopilot('Resuma o que precisa da minha atenção agora.')}
                >
                  "O que precisa da minha atenção agora?"
                </button>
                <button
                  className="btn-copilot-prompt"
                  onClick={() => handleAskCopilot('Quais integrações estão degradadas e o que afetam?')}
                >
                  "Quais integrações estão degradadas?"
                </button>
                <button
                  className="btn-copilot-prompt"
                  onClick={() => handleAskCopilot('Existe algo bloqueando proposta com prazo hoje?')}
                >
                  "Existe algo bloqueando proposta com prazo hoje?"
                </button>
              </div>

              {copilotResponse && (
                <div className="copilot-response-container mt-2">
                  <p>{copilotResponse.answer}</p>
                  {copilotResponse.actionRecommended && (
                    <div className="copilot-rec-pill">
                      <ArrowRight size={14} /> Recomendação: {copilotResponse.actionRecommended}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 2: PRECISA DE VOCÊ (HUMAN QUEUE) */}
        {activeTab === 'queue' && (
          <div className="tab-pane-queue">
            <div className="queue-section-header">
              <div>
                <h2>Fila de Intervenção Humana Priorizada (Deadline-Aware)</h2>
                <p className="font-sm text-muted">
                  Itens ordenados por criticidade de certame e proximidade de prazo. Nenhuma ação externa silenciosa.
                </p>
              </div>
            </div>

            {dashboardData.humanQueue.length === 0 ? (
              <div className="empty-queue-card">
                <CheckCircle2 size={42} className="text-success" />
                <h3>Fila Humana Vazia</h3>
                <p className="text-muted">Nenhuma confirmação ou aprovação pendente no momento.</p>
              </div>
            ) : (
              <div className="human-items-grid mt-3">
                {dashboardData.humanQueue.map(item => (
                  <div key={item.id} className={`human-action-card card-urgency-${item.urgency.toLowerCase()}`}>
                    <div className="human-card-top">
                      <div className="human-card-titles">
                        <span className="integ-category">AÇÃO: {item.actionKey} • #{item.id}</span>
                        <div className="human-action-title">{item.title}</div>
                        <span className="human-action-sub">{item.reason}</span>
                      </div>
                      <span className={`urgency-badge badge-${item.urgency.toLowerCase()}`}>
                        Urgência {item.urgency}
                      </span>
                    </div>

                    <div className="human-card-details">
                      <div className="detail-line">
                        <span className="label">Destino / Órgão:</span>
                        <span className="value">{item.targetDestination}</span>
                      </div>
                      <div className="detail-line">
                        <span className="label">Solicitante:</span>
                        <span className="value">{item.initiatedBy}</span>
                      </div>
                      <div className="detail-line">
                        <span className="label">Empresa:</span>
                        <span className="value">{item.company.toUpperCase()}</span>
                      </div>
                      <div className="detail-line">
                        <span className="label">Aguardando desde:</span>
                        <span className="value">{item.ageFormatted}</span>
                      </div>
                    </div>

                    <div className="human-card-actions">
                      <button
                        className="btn-secondary-action"
                        onClick={() => setSelectedQueueItem(item)}
                      >
                        <Eye size={14} /> Revisar Contexto Completo
                      </button>
                      <button
                        className="btn-primary-action"
                        onClick={() => handleConfirmHumanAction(item.id)}
                      >
                        <CheckCircle2 size={15} /> Confirmar & Liberar Ação
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: AUTOMAÇÕES & FILAS (DLQ) */}
        {activeTab === 'automations' && (
          <div className="tab-pane-automations">
            <div className="queue-section-header">
              <h2>Workflows em Execução & Dead Letter Queue (DLQ)</h2>
              <span className="text-muted font-sm">Ações de retry seguro suportadas apenas para rotinas idempotentes.</span>
            </div>

            {/* TABELA DE FAILED JOBS */}
            <div className="dlq-table-card mt-3">
              <table className="dlq-table">
                <thead>
                  <tr>
                    <th>Job / Rotina</th>
                    <th>Entidade Afetada</th>
                    <th>Motivo da Falha</th>
                    <th>Tentativas</th>
                    <th>Impacto no Negócio</th>
                    <th>Ação Segura</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.failedJobs.map(job => (
                    <tr key={job.id}>
                      <td>
                        <strong>{job.name}</strong>
                        <div className="text-muted font-xs">ID: {job.id}</div>
                      </td>
                      <td>{job.entityTitle}</td>
                      <td>
                        <span className="text-danger">{job.reason}</span>
                      </td>
                      <td>{job.retries} / {job.maxRetries}</td>
                      <td>{job.businessImpact}</td>
                      <td>
                        {job.isSafeRetry ? (
                          <div className="flex-row items-center gap-1">
                            <button
                              className="btn-table-retry"
                              onClick={() => handleSafeRetryJob(job.id)}
                            >
                              <RotateCcw size={12} /> Safe Retry
                            </button>
                            <button
                              className="btn-table-dismiss"
                              onClick={() => setDismissJobTarget(job)}
                            >
                              Dispensar
                            </button>
                          </div>
                        ) : (
                          <span className="text-warning font-xs">Revisão Manual Obrigatória</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* LISTA DE WORKFLOWS */}
            <h3 className="mt-4 font-md">Status de Workflows Ativos</h3>
            <div className="integrations-cards-grid mt-2">
              {dashboardData.workflows.map(wf => (
                <div key={wf.id} className="integration-card">
                  <div className="integ-card-top">
                    <div className="integ-name-block">
                      <span className="integ-category">{wf.businessDomain}</span>
                      <div className="integ-title">{wf.name}</div>
                    </div>
                    <span className={`integ-status-badge ${wf.status.toLowerCase()}`}>
                      {wf.status}
                    </span>
                  </div>
                  <div className="integ-cascading-info">
                    <div className="cascading-row">
                      <strong>Execuções Ativas:</strong> {wf.activeExecutions}
                    </div>
                    <div className="cascading-row">
                      <strong>Taxa de Falhas:</strong> {wf.failureRate}
                    </div>
                    <div className="cascading-row">
                      <strong>Último Sucesso:</strong> {wf.lastSuccess}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: INTEGRAÇÕES & IMPACTO */}
        {activeTab === 'integrations' && (
          <div className="tab-pane-integrations">
            <div className="queue-section-header">
              <div>
                <h2>Conectores & Saúde das Integrações Externas</h2>
                <p className="font-sm text-muted">
                  Visão de impacto real: explica o que a falha afeta no negócio e quais capacidades permanecem operacionais.
                </p>
              </div>
            </div>

            <div className="integrations-cards-grid mt-3">
              {dashboardData.integrations.map(integ => (
                <div
                  key={integ.id}
                  className={`integration-card ${integ.health === IntegrationHealth.DEGRADED ? 'integ-degraded' : ''}`}
                >
                  <div className="integ-card-top">
                    <div className="integ-name-block">
                      <span className="integ-category">{integ.category}</span>
                      <div className="integ-title">{integ.name}</div>
                    </div>
                    <span className={`integ-status-badge ${integ.health.toLowerCase()}`}>
                      {integ.health}
                    </span>
                  </div>

                  <div className="integ-impact-box">
                    <strong>Impacto Operacional:</strong>
                    <p>{integ.businessImpact}</p>
                  </div>

                  {integ.recoveringProgress && (
                    <div className="font-xs text-info">
                      Recuperando backlog seguro: {integ.recoveringProgress.processed} / {integ.recoveringProgress.total} registros.
                    </div>
                  )}

                  <div className="integ-cascading-info">
                    <div className="cascading-row">
                      <strong>Afeta:</strong>
                      <span className="text-warning">
                        {integ.affectedCapabilities.length > 0 ? integ.affectedCapabilities.join(', ') : 'Nenhuma restrição'}
                      </span>
                    </div>
                    <div className="cascading-row">
                      <strong>Permanece Ativo:</strong>
                      <span className="text-success">{integ.unaffectedCapabilities.join(', ')}</span>
                    </div>
                  </div>

                  <div className="integ-controls">
                    <button
                      className="btn-integ-action"
                      onClick={() => handleToggleIntegrationPause(integ)}
                    >
                      {integ.isPaused ? <Play size={13} /> : <Pause size={13} />}
                      {integ.isPaused ? 'Reativar com Healthcheck' : 'Pausar Conector'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 5: INCIDENTES & SAFETY */}
        {activeTab === 'incidents' && (
          <div className="tab-pane-incidents">
            <div className="queue-section-header">
              <h2>Incidentes Operacionais & Proteções de Segurança</h2>
              <span className="text-muted font-sm">Supressão de duplicados ativa; apenas falhas agrupadas com impacto.</span>
            </div>

            {/* INCIDENTES OPERACIONAIS */}
            <div className="human-items-grid mt-3">
              {dashboardData.incidents.map(inc => (
                <div key={inc.id} className="human-action-card card-urgency-attention">
                  <div className="human-card-top">
                    <div className="human-card-titles">
                      <span className="integ-category">INCIDENTE #{inc.id} • {inc.status}</span>
                      <div className="human-action-title">{inc.title}</div>
                      <span className="human-action-sub">{inc.businessImpact}</span>
                    </div>
                    <span className="urgency-badge badge-attention">
                      Gravidade: {inc.severity}
                    </span>
                  </div>

                  <div className="human-card-details">
                    <div className="detail-line">
                      <span className="label">Causa Raiz Primária:</span>
                      <span className="value">{inc.rootCause}</span>
                    </div>
                    <div className="detail-line">
                      <span className="label">Responsável Operacional:</span>
                      <span className="value">{inc.owner}</span>
                    </div>
                    <div className="detail-line">
                      <span className="label">Reconhecimento:</span>
                      <span className="value">{inc.acknowledged ? `Sim (${inc.acknowledgedBy})` : 'Pendente de Acknowledge'}</span>
                    </div>
                  </div>

                  <div className="human-card-actions">
                    {!inc.acknowledged && (
                      <button
                        className="btn-secondary-action"
                        onClick={() => handleAcknowledgeIncident(inc.id)}
                      >
                        <CheckCircle2 size={14} /> Reconhecer Incidente (Acknowledge)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* STREAM DE EVENTOS OPERACIONAIS DE ALTO SINAL */}
            <h3 className="mt-4 font-md">Timeline Operacional de Alto Sinal (Activity Stream)</h3>
            <div className="human-items-grid mt-2">
              {dashboardData.activityStream.map(act => (
                <div key={act.id} className="human-action-card">
                  <div className="human-card-top">
                    <div>
                      <span className="integ-category">{act.category} • {act.company.toUpperCase()}</span>
                      <div className="font-md font-bold">{act.title}</div>
                      <div className="text-muted font-sm mt-1">{act.description}</div>
                    </div>
                    <span className="text-muted font-xs">
                      {new Date(act.timestamp).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE ONE-CLICK REVIEW DO CONTEXTO */}
      {selectedQueueItem && (
        <div className="modal-overlay-custom" onClick={() => setSelectedQueueItem(null)}>
          <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Revisão de Contexto Operacional • #{selectedQueueItem.id}</h3>
              <button className="btn-close" onClick={() => setSelectedQueueItem(null)}>×</button>
            </div>
            <div className="modal-body-custom">
              <p><strong>Ação:</strong> {selectedQueueItem.actionKey}</p>
              <p><strong>Destino:</strong> {selectedQueueItem.targetDestination}</p>
              <p><strong>Motivo da Exigência:</strong> {selectedQueueItem.reason}</p>
              <div className="payload-inspect mt-2">
                <strong>Dados Operacionais da Transação:</strong>
                <pre>{JSON.stringify(selectedQueueItem.payload, null, 2)}</pre>
              </div>
            </div>
            <div className="modal-footer-custom">
              <button className="btn-secondary-action" onClick={() => setSelectedQueueItem(null)}>Fechar</button>
              <button
                className="btn-primary-action"
                onClick={() => handleConfirmHumanAction(selectedQueueItem.id)}
              >
                Confirmar & Liberar Envio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DISPENSA DE JOB DA DLQ */}
      {dismissJobTarget && (
        <div className="modal-overlay-custom" onClick={() => setDismissJobTarget(null)}>
          <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <h3>Dispensar Job #{dismissJobTarget.id} da DLQ</h3>
              <button className="btn-close" onClick={() => setDismissJobTarget(null)}>×</button>
            </div>
            <div className="modal-body-custom">
              <p>A dispensa formal de um job na DLQ requer justificativa auditável:</p>
              <textarea
                rows={3}
                className="dismiss-reason-input"
                placeholder="Ex: Certame cancelado pelo órgão licitante no diário oficial..."
                value={dismissReason}
                onChange={e => setDismissReason(e.target.value)}
              />
            </div>
            <div className="modal-footer-custom">
              <button className="btn-secondary-action" onClick={() => setDismissJobTarget(null)}>Cancelar</button>
              <button className="btn-primary-action" onClick={handleDismissJobSubmit}>
                Confirmar Dispensa Auditada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
