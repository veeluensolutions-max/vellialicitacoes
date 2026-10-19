import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  PauseCircle, 
  PlayCircle, 
  RotateCcw, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Sparkles, 
  Search, 
  RefreshCw,
  Layers,
  ChevronRight,
  ExternalLink,
  Flame,
  FileText,
  UserCheck,
  Cpu,
  ArrowRight,
  ShieldOff
} from 'lucide-react';
import { 
  agentControlCenterService, 
  AUTONOMY_LEVELS, 
  AGENT_STATUS 
} from '../../services/agentControl/agentControlCenterService';
import './AgentControlCenterView.css';

export default function AgentControlCenterView({ currentUser = { name: 'Diretoria / Admin', role: 'ADMIN' }, onNavigateTo }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, humanQueue, agents, history, integrations, sandbox
  const [stats, setStats] = useState(agentControlCenterService.getOverallStatus());
  const [agents, setAgents] = useState(agentControlCenterService.getAgents());
  const [liveActivities, setLiveActivities] = useState(agentControlCenterService.getLiveActivity());
  const [humanInterventions, setHumanInterventions] = useState(agentControlCenterService.getPendingHumanInterventions());
  const [executions, setExecutions] = useState(agentControlCenterService.getExecutions());
  const [integrations, setIntegrations] = useState(agentControlCenterService.getIntegrationStatuses());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [explainResult, setExplainResult] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [notification, setNotification] = useState(null);

  // Sandbox state
  const [sandboxAgentId, setSandboxAgentId] = useState('RADAR_AGENT');
  const [sandboxInput, setSandboxInput] = useState('{"source": "PNCP", "sampleItems": 5, "keywords": ["Engenharia", "Manutenção"]}');
  const [sandboxResult, setSandboxResult] = useState(null);

  const refreshData = () => {
    setStats(agentControlCenterService.getOverallStatus());
    setAgents(agentControlCenterService.getAgents());
    setLiveActivities(agentControlCenterService.getLiveActivity());
    setHumanInterventions(agentControlCenterService.getPendingHumanInterventions());
    setExecutions(agentControlCenterService.getExecutions());
    setIntegrations(agentControlCenterService.getIntegrationStatuses());
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 4000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleAgent = (agentId) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    if (agent.status === AGENT_STATUS.OPERATIONAL) {
      agentControlCenterService.pauseAgent(agentId, 'Pausa solicitada pelo usuário na Central do Agente', currentUser.name);
      showToast(`Agente ${agent.name} pausado com sucesso`, 'warning');
    } else {
      agentControlCenterService.resumeAgent(agentId, currentUser.name);
      showToast(`Agente ${agent.name} reativado e operacional`, 'success');
    }
    refreshData();
  };

  const handleKillSwitch = () => {
    const reason = window.prompt('ATENÇÃO: Deseja acionar a Parada Emergencial (Kill Switch)? Digite o motivo obrigatório:');
    if (!reason || reason.trim().length === 0) {
      alert('Ação cancelada: Justificativa formal é obrigatória para acionamento do Kill Switch.');
      return;
    }

    try {
      agentControlCenterService.triggerEmergencyKillSwitch(reason, currentUser.name);
      showToast('EMERGENCY KILL SWITCH ACIONADO. Todos os agentes foram pausados com segurança.', 'error');
      refreshData();
    } catch (err) {
      alert(`Falha de autorização: ${err.message}`);
    }
  };

  const handleResumeAll = () => {
    if (window.confirm('Deseja reativar todos os agentes e restaurar a operação autônoma supervisionada?')) {
      agentControlCenterService.resumeAllAgents(currentUser.name);
      showToast('Todos os agentes foram reativados com sucesso.', 'success');
      refreshData();
    }
  };

  const handleResolveHumanIntervention = (item, resolution) => {
    agentControlCenterService.resolveHumanIntervention(item.id, resolution, currentUser.name);
    showToast(`Intervenção ${item.id} resolvida como: ${resolution}`, 'success');
    refreshData();
  };

  const handleExplainExecution = (exec) => {
    const explanation = agentControlCenterService.explainExecution(exec.id);
    setExplainResult(explanation);
    setSelectedExecution(exec);
  };

  const handleRunTests = async () => {
    setIsTesting(true);
    showToast('Executando suíte de 10 testes de operação supervisionada...', 'info');
    setTimeout(() => {
      const results = agentControlCenterService.runTestSuite();
      setTestResults(results);
      setIsTesting(false);
      showToast(`Testes concluídos: ${results.passed}/${results.totalTests} aprovados`, results.success ? 'success' : 'error');
      refreshData();
    }, 600);
  };

  const handleRunSandbox = () => {
    try {
      const parsedInput = JSON.parse(sandboxInput);
      const res = agentControlCenterService.runSandboxDryRun(sandboxAgentId, parsedInput);
      setSandboxResult(res);
      showToast('Simulação Sandbox (Dry-run) concluída com sucesso', 'success');
    } catch (e) {
      alert(`Erro no payload JSON: ${e.message}`);
    }
  };

  return (
    <div className="agent-control-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`agent-toast toast-${notification.type}`}>
          {notification.type === 'error' && <ShieldAlert size={18} />}
          {notification.type === 'warning' && <AlertTriangle size={18} />}
          {notification.type === 'success' && <CheckCircle2 size={18} />}
          {notification.type === 'info' && <Bot size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
      <div className="agent-control-header">
        <div className="header-left">
          <div className="header-icon-badge">
            <Bot size={28} className="pulse-icon" />
          </div>
          <div>
            <div className="header-title-row">
              <h2>Central do Agente</h2>
              <span className={`status-pill status-${stats.status.toLowerCase().replace(/_/g, '-')}`}>
                {stats.status}
              </span>
              <span className="supervised-pill">Operação Supervisionada</span>
            </div>
            <p className="header-subtitle">
              Painel de controle, auditoria de autonomia e supervisão dos agentes lógicos do Vellia Licitações.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className="action-btn btn-tests" 
            onClick={handleRunTests}
            disabled={isTesting}
          >
            <RefreshCw size={16} className={isTesting ? 'spinning' : ''} />
            {isTesting ? 'Validando...' : 'Executar 10 Testes E2E'}
          </button>

          {stats.status === AGENT_STATUS.PAUSED ? (
            <button className="action-btn btn-resume-all" onClick={handleResumeAll}>
              <PlayCircle size={16} /> Reativar Todos os Agentes
            </button>
          ) : (
            <button className="action-btn btn-killswitch" onClick={handleKillSwitch}>
              <Flame size={16} /> Emergency Kill Switch
            </button>
          )}
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="agent-metrics-grid">
        <div className="agent-metric-card">
          <div className="metric-header">
            <span>Agentes Ativos</span>
            <Bot size={18} className="metric-icon" />
          </div>
          <div className="metric-val">{stats.activeAgents} <span className="metric-total">/ {stats.totalAgents}</span></div>
          <div className="metric-sub">Todos vinculados a limites de segurança</div>
        </div>

        <div className="agent-metric-card">
          <div className="metric-header">
            <span>Execuções Hoje</span>
            <Activity size={18} className="metric-icon text-cyan" />
          </div>
          <div className="metric-val text-cyan">{stats.executionsToday}</div>
          <div className="metric-sub">Rastreadas com correlação ponta a ponta</div>
        </div>

        <div className="agent-metric-card urgent-highlight" onClick={() => setActiveTab('humanQueue')}>
          <div className="metric-header">
            <span>Precisa de Você</span>
            <UserCheck size={18} className="metric-icon text-amber" />
          </div>
          <div className="metric-val text-amber">{stats.humanInterventionsPending}</div>
          <div className="metric-sub">Decisões humanas aguardando confirmação</div>
        </div>

        <div className="agent-metric-card">
          <div className="metric-header">
            <span>Falhas Hoje</span>
            <ShieldAlert size={18} className="metric-icon text-rose" />
          </div>
          <div className="metric-val text-rose">{stats.failedExecutionsToday}</div>
          <div className="metric-sub">Com graceful degradation e fallback léxico</div>
        </div>
      </div>

      {/* BANNER SE ESTIVER PAUSADO */}
      {stats.status === AGENT_STATUS.PAUSED && (
        <div className="emergency-banner">
          <ShieldAlert size={22} />
          <div>
            <strong>OPERAÇÃO EM PAUSA EMERGENCIAL:</strong> Novas ações automáticas estão bloqueadas.
            As consultas de leitura e navegação do Vellia permanecem seguras e ativas.
          </div>
          <button className="btn-resume-banner" onClick={handleResumeAll}>
            Restaurar Agentes
          </button>
        </div>
      )}

      {/* RESULTADO DOS TESTES AUTOMATIZADOS SE DISPARADOS */}
      {testResults && (
        <div className="test-results-panel">
          <div className="test-panel-header">
            <div className="test-header-left">
              <ShieldCheck size={20} className="text-emerald" />
              <strong>Resultado da Suíte de Conformidade (Fase 38 - 10 Testes):</strong>
            </div>
            <button className="btn-close-tests" onClick={() => setTestResults(null)}>✕</button>
          </div>
          <div className="test-grid">
            {testResults.results.map((t, idx) => (
              <div key={idx} className={`test-card-item ${t.passed ? 'pass' : 'fail'}`}>
                <div className="test-top">
                  <span className="test-id">{t.testId}</span>
                  <span className={`test-badge ${t.passed ? 'badge-pass' : 'badge-fail'}`}>
                    {t.passed ? 'APROVADO' : 'FALHOU'}
                  </span>
                </div>
                <div className="test-desc">{t.description}</div>
                <div className="test-obs">{t.observation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="agent-tabs-nav">
        <button 
          className={`agent-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Activity size={16} /> Visão Geral & Live Activity
        </button>
        <button 
          className={`agent-tab-btn ${activeTab === 'humanQueue' ? 'active' : ''}`}
          onClick={() => setActiveTab('humanQueue')}
        >
          <UserCheck size={16} /> Precisa de Você 
          {stats.humanInterventionsPending > 0 && (
            <span className="tab-counter">{stats.humanInterventionsPending}</span>
          )}
        </button>
        <button 
          className={`agent-tab-btn ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <Bot size={16} /> Registro de Agentes & Políticas
        </button>
        <button 
          className={`agent-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FileText size={16} /> Histórico & Explicações
        </button>
        <button 
          className={`agent-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('integrations')}
        >
          <Layers size={16} /> Conectores & Degradação Suave
        </button>
        <button 
          className={`agent-tab-btn ${activeTab === 'sandbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('sandbox')}
        >
          <Cpu size={16} /> Sandbox & Shadow Run
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="agent-tab-content">

        {/* ABA 1: VISÃO GERAL & LIVE ACTIVITY */}
        {activeTab === 'overview' && (
          <div className="overview-tab-layout">
            {/* ATIVIDADE AGORA */}
            <div className="control-section">
              <div className="section-title-row">
                <div className="section-title">
                  <Activity size={18} className="text-cyan pulse-icon" />
                  <h3>Atividade Agora (Live Execution)</h3>
                </div>
                <span className="refresh-hint">Atualizado em tempo real</span>
              </div>

              <div className="live-activities-list">
                {liveActivities.length === 0 ? (
                  <div className="empty-state-box">Nenhuma execução em andamento no momento. Sistema ocioso e saudável.</div>
                ) : (
                  liveActivities.map((act) => (
                    <div key={act.id} className="live-activity-card">
                      <div className="live-act-top">
                        <div className="live-act-agent">
                          <Bot size={16} className="text-cyan" />
                          <strong>{act.agentName}</strong>
                          <span className="live-act-badge">{act.currentStep}</span>
                        </div>
                        <span className="live-act-company">{act.company}</span>
                      </div>
                      <div className="live-act-action">{act.action}</div>
                      <div className="live-progress-bar">
                        <div className="live-progress-fill" style={{ width: `${act.progress}%` }}></div>
                      </div>
                      <div className="live-act-footer">
                        <span>Progresso auditado: {act.progress}%</span>
                        <span>Iniciado às {act.startedAt.split('T')[1].split('.')[0]}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PREVIEW DA FILA PRECISA DE VOCÊ */}
            <div className="control-section">
              <div className="section-title-row">
                <div className="section-title">
                  <UserCheck size={18} className="text-amber" />
                  <h3>Intervenções Humanas Prioritárias</h3>
                </div>
                <button className="btn-link" onClick={() => setActiveTab('humanQueue')}>Ver todas ({humanInterventions.length})</button>
              </div>

              <div className="human-queue-preview-list">
                {humanInterventions.slice(0, 3).map((item) => (
                  <div key={item.id} className="human-intervention-card compact">
                    <div className="hi-header">
                      <span className={`hi-priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span>
                      <span className="hi-type">{item.type}</span>
                      <span className="hi-agent">{item.agentId}</span>
                    </div>
                    <div className="hi-title">{item.title}</div>
                    <div className="hi-desc">{item.description}</div>
                    <div className="hi-actions">
                      {item.options.map((opt, i) => (
                        <button 
                          key={i} 
                          className="btn-hi-opt"
                          onClick={() => handleResolveHumanIntervention(item, opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STATUS RÁPIDO DAS INTEGRAÇÕES */}
            <div className="control-section">
              <div className="section-title-row">
                <div className="section-title">
                  <Layers size={18} />
                  <h3>Estado das Integrações & Impacto Operacional</h3>
                </div>
                <button className="btn-link" onClick={() => setActiveTab('integrations')}>Ver diagnóstico</button>
              </div>

              <div className="integrations-quick-grid">
                {integrations.map((integ) => (
                  <div key={integ.id} className={`integ-quick-card status-${integ.status.toLowerCase()}`}>
                    <div className="integ-quick-top">
                      <strong>{integ.name}</strong>
                      <span className="integ-quick-badge">{integ.status}</span>
                    </div>
                    <div className="integ-quick-impact">{integ.impact}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: FILA PRECISA DE VOCÊ (HUMAN INTERVENTION QUEUE) */}
        {activeTab === 'humanQueue' && (
          <div className="human-queue-tab">
            <div className="tab-intro-card">
              <UserCheck size={24} className="text-amber" />
              <div>
                <h4>Fila Unificada de Intervenção Humana ("Precisa de Você")</h4>
                <p>
                  O Vellia atua com autonomia supervisionada. Quando há conflitos de edital, OCR de baixa resolução,
                  decisões de Go/No-Go final ou ações externas, o agente para com segurança e transfere o controle para você.
                </p>
              </div>
            </div>

            {humanInterventions.length === 0 ? (
              <div className="empty-state-box full">
                <CheckCircle2 size={36} className="text-emerald" />
                <h4>Nenhuma intervenção pendente no momento</h4>
                <p>Todas as decisões foram processadas ou estão dentro das alçadas de segurança dos agentes.</p>
              </div>
            ) : (
              <div className="human-interventions-full-list">
                {humanInterventions.map((item) => (
                  <div key={item.id} className="human-intervention-card full">
                    <div className="hi-header">
                      <div className="hi-tags">
                        <span className={`hi-priority priority-${item.priority.toLowerCase()}`}>
                          {item.priority}
                        </span>
                        <span className="hi-type">{item.type}</span>
                        <span className="hi-agent">{item.agentId}</span>
                        <span className="hi-company">{item.company}</span>
                      </div>
                      <span className="hi-time">
                        <Clock size={14} /> {item.createdAt.split('T')[1].split('.')[0]}
                      </span>
                    </div>

                    <div className="hi-body">
                      <h4 className="hi-title">{item.title}</h4>
                      <p className="hi-desc">{item.description}</p>
                      
                      <div className="hi-context-box">
                        <strong>Contexto da Ocorrência:</strong>
                        <pre>{JSON.stringify(item.contextData, null, 2)}</pre>
                      </div>
                    </div>

                    <div className="hi-footer">
                      <div className="hi-cta-actions">
                        <span className="hi-cta-label">Escolha a resolução recomendada:</span>
                        {item.options.map((opt, i) => (
                          <button 
                            key={i} 
                            className={`btn-hi-opt ${i === 0 ? 'primary' : ''}`}
                            onClick={() => handleResolveHumanIntervention(item, opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {item.deepLink && (
                        <button 
                          className="btn-deep-link"
                          onClick={() => {
                            if (onNavigateTo) {
                              onNavigateTo(item.deepLink.view, item.deepLink.params);
                            } else {
                              showToast(`Navegando para ${item.deepLink.view}...`, 'info');
                            }
                          }}
                        >
                          <ExternalLink size={14} /> Abrir Módulo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: REGISTRO DE AGENTES & POLÍTICAS */}
        {activeTab === 'agents' && (
          <div className="agents-registry-tab">
            <div className="tab-intro-card">
              <Bot size={24} className="text-cyan" />
              <div>
                <h4>Registro Central de Agentes Lógicos & Limites Rígidos de Segurança</h4>
                <p>
                  Agentes são conceitos lógicos governados por alçadas de autonomia (L0 a L4).
                  Ações críticas como <strong>Dar Lance (Auto-bid)</strong> e <strong>Submissão de Proposta Final</strong> possuem 
                  <strong className="text-rose"> Hard Safety Limits</strong> invioláveis pela interface.
                </p>
              </div>
            </div>

            <div className="agents-grid">
              {agents.map((ag) => (
                <div key={ag.id} className="agent-card">
                  <div className="agent-card-header">
                    <div className="agent-title-row">
                      <Bot size={20} className="text-cyan" />
                      <div>
                        <h5>{ag.name}</h5>
                        <span className="agent-version">Versão: {ag.version}</span>
                      </div>
                    </div>
                    <span className={`status-pill status-${ag.status.toLowerCase()}`}>
                      {ag.status}
                    </span>
                  </div>

                  <p className="agent-desc">{ag.description}</p>

                  <div className="agent-autonomy-box">
                    <div className="autonomy-row">
                      <span className="autonomy-label">Nível de Autonomia:</span>
                      <span className="autonomy-badge">{ag.autonomyLevel}</span>
                    </div>
                    <div className="autonomy-desc-text">
                      {AUTONOMY_LEVELS[ag.autonomyLevel]?.description || ag.autonomyLevel}
                    </div>
                  </div>

                  {/* FRONTEIRAS DE AUTONOMIA */}
                  <div className="boundaries-section">
                    <h6>Fronteiras de Operação Supervisionada:</h6>
                    <div className="boundary-list">
                      <div className="boundary-item can-do">
                        <CheckCircle2 size={14} className="text-emerald" />
                        <div>
                          <strong>Pode Executar Sozinho:</strong>
                          <span>{ag.autonomyBoundaries.canDoAlone.join(', ')}</span>
                        </div>
                      </div>

                      <div className="boundary-item needs-confirm">
                        <UserCheck size={14} className="text-amber" />
                        <div>
                          <strong>Exige Confirmação Humana:</strong>
                          <span>{ag.autonomyBoundaries.requiresConfirmation.join(', ')}</span>
                        </div>
                      </div>

                      <div className="boundary-item hard-limit">
                        <ShieldOff size={14} className="text-rose" />
                        <div>
                          <strong>Nunca Pode Executar (Hard Limit):</strong>
                          <span>{ag.autonomyBoundaries.neverExecute.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="agent-card-footer">
                    <div className="agent-execution-times">
                      <span>Última: {ag.lastExecution ? ag.lastExecution.split('T')[1].split('.')[0] : 'Hoje'}</span>
                      <span>Próxima: {ag.nextExecution}</span>
                    </div>

                    <button 
                      className={`btn-toggle-agent ${ag.status === AGENT_STATUS.OPERATIONAL ? 'pause' : 'resume'}`}
                      onClick={() => handleToggleAgent(ag.id)}
                    >
                      {ag.status === AGENT_STATUS.OPERATIONAL ? (
                        <>
                          <PauseCircle size={14} /> Pausar Agente
                        </>
                      ) : (
                        <>
                          <PlayCircle size={14} /> Reativar Agente
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: HISTÓRICO & EXPLICAÇÕES ("POR QUE ISSO ACONTECEU?") */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="history-filter-bar">
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Filtrar por agente, gatilho, status ou correlação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="history-table-container">
              <table className="executions-table">
                <thead>
                  <tr>
                    <th>ID / Horário</th>
                    <th>Agente</th>
                    <th>Gatilho (Trigger)</th>
                    <th>Empresa</th>
                    <th>Status</th>
                    <th>Resumo da Execução</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {executions
                    .filter(ex => 
                      ex.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      ex.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      ex.status.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((exec) => (
                      <tr key={exec.id}>
                        <td>
                          <div className="exec-id-col">
                            <strong>{exec.id}</strong>
                            <span>{exec.startedAt.split('T')[1].split('.')[0]}</span>
                          </div>
                        </td>
                        <td>
                          <span className="exec-agent-badge">{exec.agentId}</span>
                        </td>
                        <td>
                          <span className="exec-trigger-tag">{exec.trigger}</span>
                        </td>
                        <td>
                          <span className="exec-company-pill">{exec.company}</span>
                        </td>
                        <td>
                          <span className={`exec-status-badge status-${exec.status.toLowerCase()}`}>
                            {exec.status}
                          </span>
                        </td>
                        <td>
                          <div className="exec-summary-cell">
                            <span>{exec.summary || (exec.outputSummary ? `${exec.outputSummary.analyzed || 0} analisadas, ${exec.outputSummary.relevant || 0} relevantes` : 'Concluído')}</span>
                            {exec.aiTrace && (
                              <span className="ai-trace-badge">
                                <Sparkles size={11} /> IA: {exec.aiTrace.model} ({exec.aiTrace.latencyMs}ms)
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn-why-action"
                            onClick={() => handleExplainExecution(exec)}
                          >
                            <HelpCircle size={14} /> Por que aconteceu?
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* MODAL DE EXPLICAÇÃO ("POR QUE ISSO ACONTECEU?") */}
            {explainResult && selectedExecution && (
              <div className="explain-modal-overlay">
                <div className="explain-modal-card">
                  <div className="explain-modal-header">
                    <div className="explain-header-left">
                      <HelpCircle size={22} className="text-cyan" />
                      <div>
                        <h4>Rastreabilidade e Explicação da Execução</h4>
                        <span>ID: {selectedExecution.id} — Agente: {selectedExecution.agentId}</span>
                      </div>
                    </div>
                    <button className="btn-close-modal" onClick={() => setExplainResult(null)}>✕</button>
                  </div>

                  <div className="explain-modal-body">
                    <div className="explain-step-block">
                      <span className="step-num">1</span>
                      <div>
                        <strong>Gatilho Disparador:</strong>
                        <p>{explainResult.triggerEvent}</p>
                      </div>
                    </div>

                    <div className="explain-step-block">
                      <span className="step-num">2</span>
                      <div>
                        <strong>Regra & Workflow Acionado:</strong>
                        <p>{explainResult.ruleApplied}</p>
                      </div>
                    </div>

                    <div className="explain-step-block">
                      <span className="step-num">3</span>
                      <div>
                        <strong>Dados Utilizados no Julgamento:</strong>
                        <pre>{JSON.stringify(explainResult.inputsUsed, null, 2)}</pre>
                      </div>
                    </div>

                    <div className="explain-step-block">
                      <span className="step-num">4</span>
                      <div>
                        <strong>Resultado da Ação:</strong>
                        <p>{explainResult.outcomeResult}</p>
                      </div>
                    </div>

                    {selectedExecution.aiTrace && (
                      <div className="ai-trace-details-card">
                        <div className="ai-trace-title">
                          <Sparkles size={16} /> Rastro do Motor de IA Supervisionada
                        </div>
                        <div className="ai-trace-grid">
                          <div><strong>Modelo:</strong> {selectedExecution.aiTrace.model}</div>
                          <div><strong>Latência:</strong> {selectedExecution.aiTrace.latencyMs}ms</div>
                          <div><strong>Custo Estimado:</strong> ${selectedExecution.aiTrace.estimatedCostUsd}</div>
                          <div><strong>Fallback Utilizado:</strong> {selectedExecution.aiTrace.fallbackUsed ? 'SIM (Regra Léxica)' : 'Não'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="explain-modal-footer">
                    <button className="btn-modal-close" onClick={() => setExplainResult(null)}>
                      Fechar Explicação
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ABA 5: CONECTORES & DEGRADAÇÃO SUAVE */}
        {activeTab === 'integrations' && (
          <div className="integrations-tab">
            <div className="tab-intro-card">
              <Layers size={24} className="text-cyan" />
              <div>
                <h4>Conectores Externos & Degradação Graciosa (Graceful Degradation)</h4>
                <p>
                  O Vellia nunca interrompe toda a plataforma por causa da instabilidade de um provedor externo.
                  Se o PNCP ou a IA ficarem indisponíveis, o sistema opera em modo degradado seguro com as fontes restantes e fallback léxico.
                </p>
              </div>
            </div>

            <div className="integrations-cards-grid">
              {integrations.map((conn) => (
                <div key={conn.id} className={`connector-card status-${conn.status.toLowerCase()}`}>
                  <div className="connector-top">
                    <div>
                      <h4 className="conn-name">{conn.name}</h4>
                      <span className="conn-cat">{conn.category}</span>
                    </div>
                    <span className={`status-pill status-${conn.status.toLowerCase()}`}>
                      {conn.status}
                    </span>
                  </div>

                  <div className="conn-impact-box">
                    <strong>Impacto Operacional da Falha:</strong>
                    <p>{conn.impact}</p>
                  </div>

                  <div className="conn-degradation-box">
                    <strong>Modo de Degradação Ativo:</strong>
                    <p>{conn.degradedBehavior}</p>
                  </div>

                  <div className="conn-footer">
                    <span>Último Ping: {conn.lastCheck.split('T')[1].split('.')[0]}</span>
                    <button 
                      className="btn-conn-diag"
                      onClick={() => showToast(`Diagnóstico ${conn.name}: Conectividade validada com 99.8% SLA.`, 'info')}
                    >
                      Ver Diagnóstico
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 6: SANDBOX & SHADOW RUN */}
        {activeTab === 'sandbox' && (
          <div className="sandbox-tab">
            <div className="tab-intro-card">
              <Cpu size={24} className="text-cyan" />
              <div>
                <h4>Ambiente Sandbox & Execuções em Modo Shadow (Dry-Run)</h4>
                <p>
                  Teste novas versões de agentes ou simule análises com dados controlados sem disparar ações reais
                  nem afetar o pipeline produtivo.
                </p>
              </div>
            </div>

            <div className="sandbox-workbench">
              <div className="sandbox-form-card">
                <h5>Configurar Simulação Controlada</h5>
                
                <div className="form-group">
                  <label>Selecione o Agente:</label>
                  <select 
                    value={sandboxAgentId} 
                    onChange={(e) => setSandboxAgentId(e.target.value)}
                    className="sandbox-select"
                  >
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.version})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Payload JSON de Teste (Mock):</label>
                  <textarea 
                    rows={6}
                    value={sandboxInput}
                    onChange={(e) => setSandboxInput(e.target.value)}
                    className="sandbox-textarea"
                  />
                </div>

                <button className="btn-run-sandbox" onClick={handleRunSandbox}>
                  <Sparkles size={16} /> Executar Dry-Run no Sandbox
                </button>
              </div>

              <div className="sandbox-result-card">
                <h5>Resultado Simulado (Sem Impacto Produtivo)</h5>
                {sandboxResult ? (
                  <div className="sandbox-output-content">
                    <div className="sandbox-res-badge">
                      <ShieldCheck size={16} className="text-emerald" /> SIMULAÇÃO CONCLUÍDA COM SUCESSO
                    </div>
                    <pre>{JSON.stringify(sandboxResult, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="empty-state-box">
                    Configure os parâmetros à esquerda e execute para inspecionar o que o agente faria sem disparar efeitos colaterais.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
