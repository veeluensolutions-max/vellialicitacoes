import React, { useState, useMemo } from 'react';
import {
  ShieldAlert, ShieldCheck, ShieldX, Play, Pause, AlertTriangle, CheckCircle2,
  Lock, RefreshCw, Eye, HelpCircle, Layers, Zap, Info, Filter, ArrowRight,
  UserCheck, FileText, Send, Building, Cpu, History, RotateCcw, AlertOctagon,
  ChevronRight, Search, Activity
} from 'lucide-react';
import {
  autonomyPolicyEngine,
  AutonomyLevel,
  AUTONOMY_LEVEL_LABELS,
  TEMPLATES
} from '../../services/autonomy/autonomyPolicyEngine';
import './AutonomyGovernanceCenterView.css';

export default function AutonomyGovernanceCenterView() {
  const [activeTab, setActiveTab] = useState('matrix'); // matrix | queue | policies | safety
  const [selectedCompany, setSelectedCompany] = useState('veeluen');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

  // States from Policy Engine
  const [actions, setActions] = useState(autonomyPolicyEngine.listSystemActions());
  const [intents, setIntents] = useState(autonomyPolicyEngine.listIntents());
  const [overrides, setOverrides] = useState(autonomyPolicyEngine.listOverrides());
  const [incidents, setIncidents] = useState(autonomyPolicyEngine.listIncidents());
  const [metrics, setMetrics] = useState(autonomyPolicyEngine.getMetrics());
  const [isEmergencyPaused, setIsEmergencyPaused] = useState(autonomyPolicyEngine.isEmergencyPaused());

  // Dry Run Simulator State
  const [simActionKey, setSimActionKey] = useState('proposal.submit');
  const [simPayload, setSimPayload] = useState(JSON.stringify({
    recipient: 'pregao@comprasnet.gov.br',
    price: 185000,
    floorPrice: 170000,
    attachment: 'proposta_tecnica_v2.pdf'
  }, null, 2));
  const [simResult, setSimResult] = useState(null);

  // Copilot helper state
  const [copilotQuestion, setCopilotQuestion] = useState('O Vellia pode submeter uma proposta sozinho?');
  const [copilotAnswer, setCopilotAnswer] = useState(null);

  const refreshData = () => {
    setActions(autonomyPolicyEngine.listSystemActions());
    setIntents(autonomyPolicyEngine.listIntents());
    setOverrides(autonomyPolicyEngine.listOverrides());
    setIncidents(autonomyPolicyEngine.listIncidents());
    setMetrics(autonomyPolicyEngine.getMetrics());
    setIsEmergencyPaused(autonomyPolicyEngine.isEmergencyPaused());
  };

  const notify = (msg, isError = false) => {
    setStatusMessage({ text: msg, isError });
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Autonomy Matrix Filtering
  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      const q = searchFilter.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.actionKey.toLowerCase().includes(q) ||
        a.domain.toLowerCase().includes(q)
      );
    });
  }, [actions, searchFilter]);

  // Handle Intent Confirmation
  const handleConfirmIntent = (intentId) => {
    const res = autonomyPolicyEngine.confirmIntent(intentId, 'Admin Operacional');
    if (res.success) {
      notify(`Intenção [${intentId}] confirmada e despachada com sucesso!`);
      // Executa
      autonomyPolicyEngine.executeIntent(intentId);
      refreshData();
    } else {
      notify(`Falha ao confirmar: ${res.reason}`, true);
      refreshData();
    }
  };

  // Handle Intent Cancellation
  const handleCancelIntent = (intentId) => {
    const res = autonomyPolicyEngine.cancelIntent(intentId, 'Cancelado pelo operador humano no Human Queue');
    if (res.success) {
      notify(`Ação [${intentId}] cancelada.`);
      refreshData();
    } else {
      notify(res.reason, true);
    }
  };

  // Emergency Pause Toggle
  const toggleEmergencyPause = () => {
    if (isEmergencyPaused) {
      autonomyPolicyEngine.resumeOperations();
      notify('Operações autônomas reativadas com sucesso.');
    } else {
      autonomyPolicyEngine.emergencyPauseAll('Admin Acionou Kill Switch Manual');
      notify('PAUSA DE EMERGÊNCIA ATIVADA: Todas as ações foram suspensas!', true);
    }
    refreshData();
  };

  // Run Dry Run Simulation
  const handleRunSimulator = () => {
    try {
      const parsed = JSON.parse(simPayload);
      const res = autonomyPolicyEngine.dryRun({
        actionKey: simActionKey,
        companyId: selectedCompany,
        payload: parsed,
        user: { id: 'usr-sim-01', role: 'OPERATOR' }
      });
      setSimResult(res);
      refreshData();
    } catch (e) {
      notify('JSON do payload inválido no simulador!', true);
    }
  };

  // Apply Template
  const handleApplyTemplate = (templateKey) => {
    const res = autonomyPolicyEngine.applyTemplate(selectedCompany, templateKey);
    if (res.success) {
      notify(`Template ${templateKey.toUpperCase()} aplicado à empresa ${selectedCompany.toUpperCase()}!`);
      refreshData();
    } else {
      notify(res.reason, true);
    }
  };

  // Copilot Ask
  const handleAskCopilot = (q) => {
    const questionText = q || copilotQuestion;
    const ans = autonomyPolicyEngine.explainToCopilot(questionText, selectedCompany);
    setCopilotAnswer(ans);
  };

  return (
    <div className="autonomy-governance-container">
      {/* HEADER PRINCIPAL */}
      <header className="autonomy-header">
        <div className="autonomy-header-title">
          <div className="autonomy-badge-live">
            <span className="dot pulse"></span>
            POLICY ENGINE ATIVO • FASE 58
          </div>
          <h1>
            <ShieldAlert size={26} className="text-primary" />
            Central de Governança de Autonomia & Guardrails
          </h1>
          <p className="autonomy-subtitle">
            Automação proporcional ao risco. Nenhuma IA ou workflow executa ações críticas externas sem verificação formal e humana.
          </p>
        </div>

        <div className="autonomy-header-actions">
          {/* SELETOR DE EMPRESA */}
          <div className="company-select-pill">
            <Building size={16} />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              aria-label="Selecionar Empresa"
            >
              <option value="veeluen">Veeluen Soluções (Matriz)</option>
              <option value="excelencia">Excelência Ambiental</option>
            </select>
          </div>

          {/* KILL SWITCH GERAL */}
          <button
            id="btn-emergency-kill-switch"
            className={`btn-kill-switch ${isEmergencyPaused ? 'active' : ''}`}
            onClick={toggleEmergencyPause}
            title={isEmergencyPaused ? 'Clique para retomar operações' : 'Pausa de emergência em todas as ações'}
          >
            {isEmergencyPaused ? <Play size={18} /> : <AlertOctagon size={18} />}
            <span>{isEmergencyPaused ? 'RETOMAR AUTONOMIA' : 'EMERGENCY PAUSE'}</span>
          </button>
        </div>
      </header>

      {/* STATUS NOTIFICATION BANNER */}
      {statusMessage && (
        <div className={`status-notification-banner ${statusMessage.isError ? 'error' : 'success'}`}>
          {statusMessage.isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* BANNER SE EM PAUSA DE EMERGÊNCIA */}
      {isEmergencyPaused && (
        <div className="emergency-pause-active-banner">
          <AlertOctagon size={24} className="pause-icon" />
          <div className="pause-info">
            <strong>SAFE STOP ATIVADO — AUTONOMIA SUSPENSA</strong>
            <p>Nenhuma nova ação de automação será despachada até que o administrador reative o Policy Engine.</p>
          </div>
          <button className="btn-resume-banner" onClick={toggleEmergencyPause}>
            Retomar Operações Agora
          </button>
        </div>
      )}

      {/* MÉTRICAS CHAVE */}
      <section className="autonomy-metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Ações Preparadas</span>
            <Layers size={18} className="text-muted" />
          </div>
          <div className="metric-value">{metrics.actionsPrepared}</div>
          <div className="metric-foot text-info">Internas & Minutas aguardando</div>
        </div>

        <div className="metric-card highlight-queue">
          <div className="metric-header">
            <span className="metric-label">Fila Humana Pendente</span>
            <UserCheck size={18} className="text-warning" />
          </div>
          <div className="metric-value">{intents.filter(i => i.status === 'Awaiting Confirmation' || i.status === 'Awaiting Approval').length}</div>
          <div className="metric-foot text-warning">Exigem confirmação ou aprovação</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Guardrail Blocks</span>
            <ShieldX size={18} className="text-danger" />
          </div>
          <div className="metric-value">{metrics.actionsBlocked}</div>
          <div className="metric-foot text-danger">Bloqueios de risco e compliance</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Hard Limits Ativos</span>
            <Lock size={18} className="text-accent" />
          </div>
          <div className="metric-value">6 Ações</div>
          <div className="metric-foot text-accent">Lances, Assinaturas & CAPTCHA</div>
        </div>
      </section>

      {/* NAVEGAÇÃO DE ABAS */}
      <nav className="autonomy-tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <Layers size={16} />
          1. Matriz de Autonomia
        </button>
        <button
          className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <UserCheck size={16} />
          2. Fila Humana (Human Queue)
          {intents.filter(i => i.status.includes('Awaiting')).length > 0 && (
            <span className="tab-pill-count">{intents.filter(i => i.status.includes('Awaiting')).length}</span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
          onClick={() => setActiveTab('policies')}
        >
          <Building size={16} />
          3. Políticas & Templates
        </button>
        <button
          className={`tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
          onClick={() => setActiveTab('safety')}
        >
          <ShieldAlert size={16} />
          4. Safety, Simulador & Auditoria
        </button>
      </nav>

      {/* CONTEÚDO DAS ABAS */}
      <main className="autonomy-tab-body">
        {/* ABA 1: MATRIZ DE AUTONOMIA */}
        {activeTab === 'matrix' && (
          <div className="tab-pane-matrix">
            <div className="pane-filter-bar">
              <div className="search-input-wrapper">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Filtrar ação por chave, nome ou domínio..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
              <div className="matrix-legend">
                <span className="legend-tag tag-level-0">L0 Manual</span>
                <span className="legend-tag tag-level-1">L1 Assist</span>
                <span className="legend-tag tag-level-2">L2 Prepare</span>
                <span className="legend-tag tag-level-3">L3 Interno</span>
                <span className="legend-tag tag-level-4">L4 Confirm</span>
                <span className="legend-tag tag-level-5">L5 Approval</span>
              </div>
            </div>

            <div className="matrix-table-card">
              <table className="autonomy-table">
                <thead>
                  <tr>
                    <th>Ação do Sistema</th>
                    <th>Domínio</th>
                    <th>Impacto & Risco</th>
                    <th>Nível Configurado</th>
                    <th>Hard Limit (Inviolável)</th>
                    <th>Reversibilidade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActions.map((act) => {
                    const isHardLocked = act.maximumAutonomyLevel <= 2;
                    return (
                      <tr key={act.actionKey} className={isHardLocked ? 'row-hard-locked' : ''}>
                        <td>
                          <div className="action-name-cell">
                            <strong>{act.name}</strong>
                            <code className="action-key-code">{act.actionKey}</code>
                            <span className="action-desc-sub">{act.description}</span>
                          </div>
                        </td>
                        <td>
                          <span className="domain-pill">{act.domain}</span>
                        </td>
                        <td>
                          <div className="risk-impact-cell">
                            <span className={`risk-badge risk-${act.riskLevel.toLowerCase()}`}>
                              {act.riskLevel}
                            </span>
                            <span className="impact-badge">{act.blastRadius}</span>
                          </div>
                        </td>
                        <td>
                          <div className="level-badge-cell">
                            <span className={`autonomy-level-pill level-${act.defaultAutonomyLevel}`}>
                              Nível {act.defaultAutonomyLevel}
                            </span>
                            <span className="level-label-caption">
                              {AUTONOMY_LEVEL_LABELS[act.defaultAutonomyLevel]}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="hard-limit-cell">
                            <Lock size={14} className="text-accent" />
                            <span className="hard-limit-text">
                              Máx: L{act.maximumAutonomyLevel} ({AUTONOMY_LEVEL_LABELS[act.maximumAutonomyLevel]})
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`reversibility-tag tag-${act.reversibility.toLowerCase().replace(' ', '-')}`}>
                            {act.reversibility}
                          </span>
                        </td>
                        <td>
                          <span className={`enabled-dot ${act.enabled ? 'active' : 'inactive'}`}>
                            {act.enabled ? 'Ativo' : 'Desativado'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="matrix-footer-info">
              <Info size={16} />
              <span>
                <strong>Regra Inviolável de Governança:</strong> O Hard Limit é fixado no código de segurança. Nenhuma interface administrativa ou política corporativa pode elevar uma ação acima do seu nível máximo seguro.
              </span>
            </div>
          </div>
        )}

        {/* ABA 2: HUMAN QUEUE */}
        {activeTab === 'queue' && (
          <div className="tab-pane-queue">
            <div className="queue-header-banner">
              <div>
                <h2>Fila de Decisões e Confirmações Humanas</h2>
                <p>Nenhuma ação externa sensível é despachada silenciosamente. Avalie os dados do contexto antes de liberar.</p>
              </div>
              <button className="btn-refresh" onClick={refreshData}>
                <RefreshCw size={15} /> Atualizar Fila
              </button>
            </div>

            {intents.filter(i => i.status === 'Awaiting Confirmation' || i.status === 'Awaiting Approval').length === 0 ? (
              <div className="empty-queue-card">
                <CheckCircle2 size={48} className="text-success" />
                <h3>Fila Humana Limpa</h3>
                <p>Nenhuma ação de automação aguarda confirmação humana ou aprovação formal no momento.</p>
              </div>
            ) : (
              <div className="queue-cards-list">
                {intents
                  .filter(i => i.status === 'Awaiting Confirmation' || i.status === 'Awaiting Approval')
                  .map((it) => (
                    <div key={it.id} className="intent-card">
                      <div className="intent-card-header">
                        <div className="intent-type-badge">
                          <Send size={15} />
                          <strong>{it.actionKey}</strong>
                          <span className="intent-id-label">#{it.id}</span>
                        </div>
                        <span className={`intent-status-pill status-${it.status.toLowerCase().replace(' ', '-')}`}>
                          {it.status === 'Awaiting Confirmation' ? 'Aguardando Confirmação' : 'Aguardando Aprovação Formal'}
                        </span>
                      </div>

                      <div className="intent-card-body">
                        <div className="intent-context-grid">
                          <div className="context-item">
                            <span className="item-label">Iniciado Por:</span>
                            <span className="item-value">{it.initiatedBy}</span>
                          </div>
                          <div className="context-item">
                            <span className="item-label">Empresa:</span>
                            <span className="item-value">{it.companyId.toUpperCase()}</span>
                          </div>
                          <div className="context-item">
                            <span className="item-label">Horário de Criação:</span>
                            <span className="item-value">{new Date(it.createdAt).toLocaleTimeString('pt-BR')}</span>
                          </div>
                          <div className="context-item">
                            <span className="item-label">Motivo do Guardrail:</span>
                            <span className="item-value text-warning">{it.policyResult?.reason}</span>
                          </div>
                        </div>

                        {/* PREVIEW DO PAYLOAD REAL */}
                        <div className="intent-payload-preview">
                          <div className="payload-title">
                            <Eye size={14} /> Dados Operacionais da Ação:
                          </div>
                          <pre className="payload-json">{JSON.stringify(it.payload, null, 2)}</pre>
                        </div>
                      </div>

                      <div className="intent-card-footer">
                        <button
                          className="btn-cancel-intent"
                          onClick={() => handleCancelIntent(it.id)}
                        >
                          Cancelar Ação
                        </button>
                        <button
                          className="btn-confirm-intent"
                          onClick={() => handleConfirmIntent(it.id)}
                        >
                          <CheckCircle2 size={16} /> Confirmar & Executar Agora
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ABA 3: POLÍTICAS & TEMPLATES */}
        {activeTab === 'policies' && (
          <div className="tab-pane-policies">
            <div className="policies-intro">
              <h2>Templates Pré-Configurados de Autonomia</h2>
              <p>Aplique políticas consistentes de governança sem violar os limites rígidos de segurança.</p>
            </div>

            <div className="templates-grid">
              {/* CONSERVATIVE */}
              <div className="template-card">
                <div className="template-header">
                  <h3>Conservador</h3>
                  <span className="template-badge">Máxima Supervisão</span>
                </div>
                <p className="template-desc">
                  Quase todas as ações operacionais exigem confirmação humana direta. Ideal para novos operadores ou auditorias severas.
                </p>
                <ul className="template-rules">
                  <li>E-mails externos: Confirmação humana</li>
                  <li>Tarefas internas: Confirmação manual</li>
                  <li>Propostas: Aprovação executiva dupla</li>
                </ul>
                <button
                  className="btn-apply-template"
                  onClick={() => handleApplyTemplate('conservative')}
                >
                  Aplicar para {selectedCompany.toUpperCase()}
                </button>
              </div>

              {/* BALANCED */}
              <div className="template-card recommended">
                <div className="template-header">
                  <div className="rec-ribbon">Recomendado Produção</div>
                  <h3>Balanceado</h3>
                  <span className="template-badge">Equilíbrio Ótimo</span>
                </div>
                <p className="template-desc">
                  Permite tarefas internas automáticas e análises autônomas, mantendo confirmação para e-mails e aprovação para lances/propostas.
                </p>
                <ul className="template-rules">
                  <li>Tarefas internas: Nível 3 (Autônomo)</li>
                  <li>Alertas & Índices: Nível 3 (Autônomo)</li>
                  <li>Envios externos: Nível 4 (Confirmação)</li>
                  <li>Propostas formais: Nível 5 (Aprovação)</li>
                </ul>
                <button
                  className="btn-apply-template primary"
                  onClick={() => handleApplyTemplate('balanced')}
                >
                  Aplicar para {selectedCompany.toUpperCase()}
                </button>
              </div>

              {/* ADVANCED */}
              <div className="template-card">
                <div className="template-header">
                  <h3>Avançado</h3>
                  <span className="template-badge">Alta Automação</span>
                </div>
                <p className="template-desc">
                  Máxima autonomia interna permitida. Notificações e cotações corriqueiras simplificadas, sem ultrapassar hard limits.
                </p>
                <ul className="template-rules">
                  <li>Cotações padrão: Preparação rápida</li>
                  <li>Tarefas & Agendamentos: Autônomos</li>
                  <li>Lances em pregão: Bloqueados (Hard Limit L0)</li>
                </ul>
                <button
                  className="btn-apply-template"
                  onClick={() => handleApplyTemplate('advanced')}
                >
                  Aplicar para {selectedCompany.toUpperCase()}
                </button>
              </div>
            </div>

            <div className="policy-hierarchy-info">
              <h3>Hierarquia de Precedência de Decisão</h3>
              <div className="hierarchy-steps">
                <div className="step-box locked">1. Hard Safety Rule (Inviolável)</div>
                <ArrowRight size={16} />
                <div className="step-box">2. RBAC Permissions</div>
                <ArrowRight size={16} />
                <div className="step-box">3. Política da Empresa</div>
                <ArrowRight size={16} />
                <div className="step-box">4. Política da Ação</div>
                <ArrowRight size={16} />
                <div className="step-box">5. Contexto do Workflow</div>
                <ArrowRight size={16} />
                <div className="step-box confirm">6. Confirmação Humana</div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: SAFETY, SIMULADOR & AUDITORIA */}
        {activeTab === 'safety' && (
          <div className="tab-pane-safety">
            <div className="safety-columns-grid">
              {/* COLUNA ESQUERDA: SIMULADOR DE POLÍTICA (DRY RUN) */}
              <div className="safety-col">
                <div className="simulator-card">
                  <div className="card-top-title">
                    <Cpu size={18} className="text-primary" />
                    <h3>Simulador de Política & Dry Run</h3>
                  </div>
                  <p className="card-top-desc">
                    Teste o que o Policy Engine responderia antes de executar uma ação real. Nenhum efeito colateral externo será gerado.
                  </p>

                  <div className="sim-field">
                    <label>Ação do Sistema a Testar:</label>
                    <select
                      value={simActionKey}
                      onChange={(e) => setSimActionKey(e.target.value)}
                    >
                      {actions.map(a => (
                        <option key={a.actionKey} value={a.actionKey}>
                          {a.name} ({a.actionKey})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sim-field">
                    <label>Payload da Simulação (JSON):</label>
                    <textarea
                      rows={5}
                      className="sim-json-input"
                      value={simPayload}
                      onChange={(e) => setSimPayload(e.target.value)}
                    />
                  </div>

                  <button className="btn-run-sim" onClick={handleRunSimulator}>
                    <Play size={16} /> Executar Dry Run (Simulação)
                  </button>

                  {simResult && (
                    <div className="sim-result-box">
                      <div className="sim-result-header">
                        <span className="result-label">Resultado:</span>
                        <span className={`result-tag res-${simResult.evaluation.result.toLowerCase().replace(' ', '-')}`}>
                          {simResult.evaluation.result}
                        </span>
                      </div>
                      <div className="sim-reason">
                        <strong>Motivo:</strong> {simResult.evaluation.reason}
                      </div>
                      <div className="sim-details-grid">
                        <div><strong>Nível Permitido:</strong> L{simResult.evaluation.allowedLevel}</div>
                        <div><strong>Requer Confirmação:</strong> {simResult.evaluation.requiresConfirmation ? 'Sim' : 'Não'}</div>
                        <div><strong>Requer Aprovação:</strong> {simResult.evaluation.requiresApproval ? 'Sim' : 'Não'}</div>
                        <div><strong>Blast Radius:</strong> {simResult.evaluation.blastRadius}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* COPILOT GOVERNANÇA ASSISTIDA */}
                <div className="copilot-governance-box">
                  <div className="card-top-title">
                    <HelpCircle size={18} className="text-info" />
                    <h3>Assistente de Governança Copilot</h3>
                  </div>
                  <p className="card-top-desc">
                    Tire dúvidas em linguagem natural sobre o que o Vellia pode ou não executar autonomamente.
                  </p>

                  <div className="copilot-quick-prompts">
                    <button onClick={() => handleAskCopilot('O Vellia pode submeter uma proposta sozinho?')}>
                      "O Vellia pode submeter uma proposta sozinho?"
                    </button>
                    <button onClick={() => handleAskCopilot('O Vellia pode dar lances em pregão?')}>
                      "O Vellia pode dar lances em pregão?"
                    </button>
                    <button onClick={() => handleAskCopilot('O envio de email exige confirmação?')}>
                      "O envio de email exige confirmação?"
                    </button>
                  </div>

                  {copilotAnswer && (
                    <div className="copilot-answer-card">
                      <div className="copilot-ans-header">
                        <Activity size={14} /> Resposta Baseada na Política Oficial:
                      </div>
                      <p>{copilotAnswer}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* COLUNA DIREITA: AUDITORIA & INCIDENTES */}
              <div className="safety-col">
                <div className="audit-card">
                  <div className="card-top-title">
                    <History size={18} className="text-warning" />
                    <h3>Histórico de Incidentes & Overrides</h3>
                  </div>

                  {/* INCIDENTES RECENTES */}
                  <div className="sub-section-title">Incidentes de Segurança & Guardrails</div>
                  {incidents.length === 0 ? (
                    <p className="empty-sub-text">Nenhum incidente crítico registrado.</p>
                  ) : (
                    <div className="incident-list">
                      {incidents.map(inc => (
                        <div key={inc.id} className="incident-item">
                          <div className="incident-top">
                            <span className="inc-type">{inc.type}</span>
                            <span className="inc-time">{new Date(inc.timestamp).toLocaleTimeString('pt-BR')}</span>
                          </div>
                          <p className="inc-desc">{inc.description}</p>
                          <div className="inc-action">Ação tomada: {inc.actionTaken}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* OVERRIDES CONTROLADOS */}
                  <div className="sub-section-title mt-4">Overrides Temporários Autorizados</div>
                  {overrides.length === 0 ? (
                    <p className="empty-sub-text">Nenhum override ativo no momento.</p>
                  ) : (
                    <div className="overrides-list">
                      {overrides.map(ov => (
                        <div key={ov.id} className="override-item">
                          <div className="override-top">
                            <strong>{ov.actionKey}</strong>
                            <span className="override-badge">Expira em: {new Date(ov.expiresAt).toLocaleTimeString('pt-BR')}</span>
                          </div>
                          <p className="override-reason">Justificativa: {ov.reason}</p>
                          <span className="override-by">Aprovador: {ov.approvedBy}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
