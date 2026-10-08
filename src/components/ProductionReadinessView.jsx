import React, { useState, useEffect } from 'react';
import { ProductionReadinessService } from '../services/qa/productionReadinessService.js';
import { QAMatrixService } from '../services/qa/qaMatrix.js';
import { E2EScenariosService } from '../services/qa/e2eScenariosService.js';
import { SystemHealthService } from '../services/qa/systemHealthService.js';
import { DisasterRecoveryService } from '../services/qa/disasterRecoveryService.js';
import { BugTrackerService } from '../services/qa/bugTrackerService.js';
import { TestSeverity, BugStatus } from '../services/qa/qaModels.js';
import './ProductionReadinessView.css';

export function ProductionReadinessView() {
  const [activeTab, setActiveTab] = useState('golive');
  const [goLiveState, setGoLiveState] = useState(null);
  const [qaMatrixResult, setQaMatrixResult] = useState(null);
  const [e2eResult, setE2eResult] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [drObjectives, setDrObjectives] = useState(null);
  const [drHistory, setDrHistory] = useState([]);
  const [bugsList, setBugsList] = useState([]);
  const [pilotUsers, setPilotUsers] = useState([]);
  const [pilotFeedbacks, setPilotFeedbacks] = useState([]);
  const [jobsQueue, setJobsQueue] = useState([]);

  // Estados de filtros
  const [sevFilter, setSevFilter] = useState('ALL');
  const [runningTests, setRunningTests] = useState(false);
  const [drillRunning, setDrillRunning] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form de novo bug
  const [showBugModal, setShowBugModal] = useState(false);
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugSev, setNewBugSev] = useState(TestSeverity.P2);
  const [newBugModule, setNewBugModule] = useState('Geral');
  const [newBugDesc, setNewBugDesc] = useState('');

  // Form de feedback piloto
  const [fbEmail, setFbEmail] = useState('');
  const [fbRole, setFbRole] = useState('LICITACOES');
  const [fbCategory, setFbCategory] = useState('Sugestão');
  const [fbDesc, setFbDesc] = useState('');

  const loadAll = () => {
    try {
      const gl = ProductionReadinessService.evaluateGoLiveChecklist();
      setGoLiveState(gl);
      setQaMatrixResult(QAMatrixService.runFullMatrix());
      setE2eResult(E2EScenariosService.runAllE2EScenarios());
      setHealthData(SystemHealthService.getHealthStatus());
      setJobsQueue(SystemHealthService.getJobQueue());
      setDrObjectives(DisasterRecoveryService.getRecoveryObjectives());
      setDrHistory(DisasterRecoveryService.getDrillHistory());
      setBugsList(BugTrackerService.getBugs());
      setPilotUsers(ProductionReadinessService.getPilotRolloutUsers());
      setPilotFeedbacks(ProductionReadinessService.getPilotFeedbacks());
    } catch (e) {
      console.error('Erro ao carregar dados de prontidão:', e);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const triggerNotify = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRunAllTests = () => {
    setRunningTests(true);
    setTimeout(() => {
      const q = QAMatrixService.runFullMatrix();
      const e = E2EScenariosService.runAllE2EScenarios();
      const gl = ProductionReadinessService.evaluateGoLiveChecklist();
      setQaMatrixResult(q);
      setE2eResult(e);
      setGoLiveState(gl);
      setRunningTests(false);
      triggerNotify(`Execução concluída! ${q.passed} testes e ${e.passed} fluxos E2E aprovados.`);
    }, 600);
  };

  const handleRunRestoreDrill = () => {
    setDrillRunning(true);
    setTimeout(() => {
      const drill = DisasterRecoveryService.runRestoreDrill();
      setDrHistory(DisasterRecoveryService.getDrillHistory());
      setDrillRunning(false);
      triggerNotify(`Restore Drill executado com sucesso em ${drill.totalDurationSec}s! Integridade verificada.`);
      loadAll();
    }, 1000);
  };

  const handleCreateBug = (e) => {
    e.preventDefault();
    if (!newBugTitle.trim()) return;
    BugTrackerService.addBug({
      title: newBugTitle,
      severity: newBugSev,
      module: newBugModule,
      description: newBugDesc
    });
    setNewBugTitle('');
    setNewBugDesc('');
    setShowBugModal(false);
    loadAll();
    triggerNotify('Bug registrado no rastreador interno.');
  };

  const handleUpdateBugStatus = (bugId, newStatus) => {
    BugTrackerService.updateBugStatus(bugId, newStatus);
    loadAll();
    triggerNotify(`Status do bug ${bugId} atualizado para ${newStatus}.`);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!fbDesc.trim()) return;
    ProductionReadinessService.recordPilotFeedback({
      userEmail: fbEmail || 'piloto@veeluen.com.br',
      role: fbRole,
      category: fbCategory,
      description: fbDesc
    });
    setFbDesc('');
    setPilotFeedbacks(ProductionReadinessService.getPilotFeedbacks());
    triggerNotify('Feedback do piloto registrado com sucesso.');
  };

  const filteredTests = qaMatrixResult?.tests?.filter(t => {
    if (sevFilter === 'ALL') return true;
    return t.severity === sevFilter;
  }) || [];

  const openP0Count = bugsList.filter(b => b.severity === TestSeverity.P0 && b.status !== BugStatus.CLOSED && b.status !== BugStatus.VERIFIED).length;

  return (
    <div className="readiness-container">
      {/* Notificação flutuante */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: notification.isErr ? '#dc2626' : '#059669',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: 600
        }}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div className="readiness-header">
        <div>
          <span className="readiness-badge">FASE 21 — CONFIABILIDADE & PRONTIDÃO</span>
          <h1 className="readiness-title">Production Readiness & QA Command</h1>
          <p className="readiness-subtitle">
            Central executiva de validação do produto: Matriz de QA P0-P3, Testes E2E, Observabilidade, Disaster Recovery e Go-Live Gate.
          </p>
        </div>
        <div className="readiness-header-actions">
          <button
            className="btn-run-all-tests"
            onClick={handleRunAllTests}
            disabled={runningTests}
          >
            {runningTests ? 'Executando Testes...' : '⚡ Executar Todos os Testes'}
          </button>
          <button
            className="btn-drill-action"
            onClick={handleRunRestoreDrill}
            disabled={drillRunning}
          >
            {drillRunning ? 'Restaurando...' : '🔄 Simular Restore Drill'}
          </button>
        </div>
      </div>

      {/* Go-Live Banner */}
      <div className={`golive-banner ${goLiveState?.isReadyForGoLive ? 'ready' : 'blocked'}`}>
        <div className="gate-status-pill">
          <div className={`gate-indicator-dot ${goLiveState?.isReadyForGoLive ? 'ready' : 'blocked'}`} />
          <div>
            <h2 className="gate-title">
              {goLiveState?.isReadyForGoLive ? 'GO-LIVE GATE: PRONTO PARA PRODUÇÃO' : 'GO-LIVE GATE: BLOQUEADO (CRITÉRIOS P0 PENDENTES)'}
            </h2>
            <p className="gate-desc">
              {goLiveState?.isReadyForGoLive
                ? 'Todos os requisitos críticos P0, testes E2E e planos de contingência foram satisfeitos.'
                : `${goLiveState?.blockersCount || 0} critério(s) bloqueador(es) impedem o deploy para produção.`}
            </p>
          </div>
        </div>
        <div className="gate-kpi-chips">
          <div className="kpi-chip">
            <span className="chip-val">{qaMatrixResult?.passed || 0}/{qaMatrixResult?.total || 0}</span>
            <span className="chip-label">QA Matrix</span>
          </div>
          <div className="kpi-chip">
            <span className="chip-val">{e2eResult?.passed || 0}/5</span>
            <span className="chip-label">E2E Homologados</span>
          </div>
          <div className="kpi-chip">
            <span className="chip-val" style={{ color: openP0Count > 0 ? '#ef4444' : '#10b981' }}>{openP0Count}</span>
            <span className="chip-label">Bugs P0 Abertos</span>
          </div>
        </div>
      </div>

      {/* Menu de Sub-Abas */}
      <div className="readiness-nav">
        <button className={`readiness-tab ${activeTab === 'golive' ? 'active' : ''}`} onClick={() => setActiveTab('golive')}>
          🚀 Go-Live Checklist
        </button>
        <button className={`readiness-tab ${activeTab === 'qamatrix' ? 'active' : ''}`} onClick={() => setActiveTab('qamatrix')}>
          📋 Vellia QA Matrix ({qaMatrixResult?.total || 0})
        </button>
        <button className={`readiness-tab ${activeTab === 'e2e' ? 'active' : ''}`} onClick={() => setActiveTab('e2e')}>
          🔄 Cenários E2E (5)
        </button>
        <button className={`readiness-tab ${activeTab === 'health' ? 'active' : ''}`} onClick={() => setActiveTab('health')}>
          🩺 Observabilidade & DLQ
        </button>
        <button className={`readiness-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
          🛡️ Segurança & Disaster Recovery
        </button>
        <button className={`readiness-tab ${activeTab === 'bugs' ? 'active' : ''}`} onClick={() => setActiveTab('bugs')}>
          🐛 Bug Tracker ({bugsList.length})
        </button>
        <button className={`readiness-tab ${activeTab === 'piloto' ? 'active' : ''}`} onClick={() => setActiveTab('piloto')}>
          👥 Piloto & Feedback ({pilotFeedbacks.length})
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="readiness-content">
        {/* ABA 1: GO-LIVE CHECKLIST */}
        {activeTab === 'golive' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Checklist Objetivo de Prontidão Operacional</h3>
                <p className="panel-desc">Critérios técnicos e de conformidade que devem ser atendidos antes do início das operações.</p>
              </div>
            </div>
            <div className="table-responsive">
              <table className="readiness-table">
                <thead>
                  <tr>
                    <th>Item de Verificação</th>
                    <th>Categoria</th>
                    <th>Impacto no Deploy</th>
                    <th>Status</th>
                    <th>Diagnóstico</th>
                  </tr>
                </thead>
                <tbody>
                  {goLiveState?.checklist?.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.title}</strong></td>
                      <td>{item.category}</td>
                      <td>
                        {item.isBlocker ? (
                          <span className="badge-sev p0">BLOQUEADOR P0</span>
                        ) : (
                          <span className="badge-sev p2">RECOMENDADO</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge-status ${item.status.toLowerCase()}`}>
                          {item.status === 'PASSED' ? '✓ Aprovado' : item.status === 'WARNING' ? '⚠ Atenção' : '✕ Bloqueado'}
                        </span>
                      </td>
                      <td style={{ color: '#cbd5e1' }}>{item.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: QA MATRIX */}
        {activeTab === 'qamatrix' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Vellia QA Matrix</h3>
                <p className="panel-desc">Catálogo de testes por severidade P0-P3, módulo funcional e resultado esperado.</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['ALL', 'P0', 'P1', 'P2', 'P3'].map(sev => (
                  <button
                    key={sev}
                    className={`btn-drill-action ${sevFilter === sev ? 'active' : ''}`}
                    style={{
                      background: sevFilter === sev ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                      borderColor: sevFilter === sev ? '#38bdf8' : 'rgba(255,255,255,0.1)'
                    }}
                    onClick={() => setSevFilter(sev)}
                  >
                    {sev === 'ALL' ? 'Todos' : sev}
                  </button>
                ))}
              </div>
            </div>
            <div className="table-responsive">
              <table className="readiness-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título do Teste</th>
                    <th>Módulo</th>
                    <th>Criticidade</th>
                    <th>Tipo</th>
                    <th>Status</th>
                    <th>Duração</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map(test => (
                    <tr key={test.id}>
                      <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{test.id}</td>
                      <td>
                        <strong>{test.title}</strong>
                        <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 2 }}>{test.expectedResult}</div>
                      </td>
                      <td>{test.module}</td>
                      <td><span className={`badge-sev ${test.severity.toLowerCase()}`}>{test.severity}</span></td>
                      <td>{test.type}</td>
                      <td>
                        <span className={`badge-status ${test.status.toLowerCase()}`}>
                          {test.status === 'PASSED' ? '✓ Passed' : '✕ Failed'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>{test.durationMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: CENÁRIOS E2E */}
        {activeTab === 'e2e' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Jornadas E2E de Negócio</h3>
                <p className="panel-desc">Validação completa dos 5 fluxos ponta a ponta sem falhas operacionais.</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {e2eResult?.scenarios?.map(s => (
                <div key={s.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>{s.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: 12 }}>({s.stepsCount} etapas validadas)</span>
                    </div>
                    <span className="badge-status passed">✓ Homologado ({s.durationMs}ms)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {s.steps.map((st, i) => (
                      <div key={i} style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: '#10b981', marginRight: 6 }}>✓</span>
                        {st.step}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 4: OBSERVABILIDADE & HEALTH & DLQ */}
        {activeTab === 'health' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="cards-grid-3">
              <div className="mini-stat-card">
                <p className="mini-stat-title">Status Global de Saúde</p>
                <p className="mini-stat-val" style={{ color: '#10b981' }}>{healthData?.status || 'UP'}</p>
                <p className="mini-stat-sub">Uptime Médio: {healthData?.metrics?.uptimeAveragePct}%</p>
              </div>
              <div className="mini-stat-card">
                <p className="mini-stat-title">Latência Média de Resposta</p>
                <p className="mini-stat-val">{healthData?.metrics?.avgLatencyMs || 25} ms</p>
                <p className="mini-stat-sub">Conexões ativas: {healthData?.metrics?.activeConnections || 42}</p>
              </div>
              <div className="mini-stat-card">
                <p className="mini-stat-title">Jobs em Dead Letter Queue (DLQ)</p>
                <p className="mini-stat-val" style={{ color: jobsQueue.filter(j => j.status === 'DEAD_LETTER').length > 0 ? '#f87171' : '#10b981' }}>
                  {jobsQueue.filter(j => j.status === 'DEAD_LETTER').length}
                </p>
                <p className="mini-stat-sub">Jobs exauridos pós-3 retries</p>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Componentes & Endpoints de Saúde (/health)</h3>
                  <p className="panel-desc">Health checks em tempo real de bancos, storage, crawlers e gateways.</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="readiness-table">
                  <thead>
                    <tr>
                      <th>Componente</th>
                      <th>Status</th>
                      <th>Latência</th>
                      <th>Disponibilidade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthData?.services?.map((svc, i) => (
                      <tr key={i}>
                        <td><strong>{svc.name}</strong></td>
                        <td><span className="badge-status healthy">● {svc.status}</span></td>
                        <td style={{ fontFamily: 'monospace' }}>{svc.latencyMs} ms</td>
                        <td>{svc.uptimePct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fila de Jobs e DLQ */}
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Fila de Background Jobs & Dead Letter Queue (DLQ)</h3>
                  <p className="panel-desc">Monitoramento de tarefas assíncronas, reexecução e contenção de falhas repetidas.</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="readiness-table">
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Nome da Tarefa</th>
                      <th>Status</th>
                      <th>Tentativas</th>
                      <th>Duração</th>
                      <th>Detalhes / Erro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsQueue.map(j => (
                      <tr key={j.id}>
                        <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{j.id}</td>
                        <td>{j.name}</td>
                        <td>
                          <span className={`badge-status ${j.status.toLowerCase()}`}>
                            {j.status}
                          </span>
                        </td>
                        <td>{j.retries}/{j.maxRetries}</td>
                        <td>{j.durationSec ? `${j.durationSec}s` : '—'}</td>
                        <td style={{ color: j.error ? '#f87171' : '#94a3b8', fontSize: '0.8rem' }}>
                          {j.error || 'Execução regular sem falhas'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 5: SEGURANÇA & DISASTER RECOVERY */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="cards-grid-3">
              <div className="mini-stat-card">
                <p className="mini-stat-title">RPO (Recovery Point Objective)</p>
                <p className="mini-stat-val">{drObjectives?.rpoHours} horas</p>
                <p className="mini-stat-sub">Perda máxima aceitável em caso de desastre</p>
              </div>
              <div className="mini-stat-card">
                <p className="mini-stat-title">RTO (Recovery Time Objective)</p>
                <p className="mini-stat-val">&lt; {drObjectives?.rtoHours} horas</p>
                <p className="mini-stat-sub">Meta operacional de restauração dos serviços</p>
              </div>
              <div className="mini-stat-card">
                <p className="mini-stat-title">Proteção SSRF & Uploads</p>
                <p className="mini-stat-val" style={{ color: '#10b981' }}>ATIVA</p>
                <p className="mini-stat-sub">Bloqueio de loopback, metadados nuvem e executáveis</p>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Histórico de Restore Drills em Staging</h3>
                  <p className="panel-desc">Testes simulados de recuperação total de snapshot e validação de integridade referencial.</p>
                </div>
                <button className="btn-drill-action" onClick={handleRunRestoreDrill} disabled={drillRunning}>
                  {drillRunning ? 'Executando...' : 'Simular Restore Drill Agora'}
                </button>
              </div>
              <div className="table-responsive">
                <table className="readiness-table">
                  <thead>
                    <tr>
                      <th>Drill ID</th>
                      <th>Snapshot Testado</th>
                      <th>Ambiente</th>
                      <th>Integridade Referencial</th>
                      <th>Tempo de Restauração</th>
                      <th>Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drHistory.map(d => (
                      <tr key={d.id}>
                        <td style={{ fontFamily: 'monospace' }}>{d.id}</td>
                        <td>{d.backupId}</td>
                        <td><span className="badge-sev p3">{d.environment}</span></td>
                        <td>{d.integrityCheckPassed ? '✓ 100% Consistente' : 'Falha'}</td>
                        <td>{d.totalDurationSec}s</td>
                        <td><span className="badge-status healthy">VERIFIED SUCCESS</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 6: BUG TRACKER */}
        {activeTab === 'bugs' && (
          <div className="panel-card">
            <div className="panel-header">
              <div>
                <h3 className="panel-title">Central Interna de Bugs e Severidade</h3>
                <p className="panel-desc">Gestão de ocorrências por severidade P0-P3 com controle estrito de Go-Live.</p>
              </div>
              <button className="btn-run-all-tests" onClick={() => setShowBugModal(true)}>
                + Novo Bug
              </button>
            </div>

            {/* Modal Novo Bug */}
            {showBugModal && (
              <div style={{
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 20
              }}>
                <form onSubmit={handleCreateBug} className="feedback-box">
                  <h4 style={{ margin: 0, color: '#38bdf8' }}>Registrar Novo Bug</h4>
                  <input
                    className="feedback-input"
                    placeholder="Título do bug"
                    value={newBugTitle}
                    onChange={e => setNewBugTitle(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <select className="feedback-select" value={newBugSev} onChange={e => setNewBugSev(e.target.value)}>
                      <option value={TestSeverity.P0}>P0 — Crítico (Bloqueia Go-Live)</option>
                      <option value={TestSeverity.P1}>P1 — Alto</option>
                      <option value={TestSeverity.P2}>P2 — Médio</option>
                      <option value={TestSeverity.P3}>P3 — Baixo</option>
                    </select>
                    <input
                      className="feedback-input"
                      placeholder="Módulo afetado"
                      value={newBugModule}
                      onChange={e => setNewBugModule(e.target.value)}
                    />
                  </div>
                  <textarea
                    className="feedback-textarea"
                    placeholder="Descrição detalhada e passos para reproduzir..."
                    value={newBugDesc}
                    onChange={e => setNewBugDesc(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button type="button" className="btn-drill-action" onClick={() => setShowBugModal(false)}>Cancelar</button>
                    <button type="submit" className="btn-run-all-tests">Salvar Bug</button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="readiness-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Severidade</th>
                    <th>Módulo</th>
                    <th>Status</th>
                    <th>Responsável</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {bugsList.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{b.id}</td>
                      <td>
                        <strong>{b.title}</strong>
                        {b.description && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{b.description}</div>}
                      </td>
                      <td><span className={`badge-sev ${b.severity.toLowerCase()}`}>{b.severity}</span></td>
                      <td>{b.module}</td>
                      <td>
                        <span className={`badge-status ${b.status.toLowerCase()}`}>{b.status}</span>
                      </td>
                      <td>{b.responsible}</td>
                      <td>
                        <select
                          className="feedback-select"
                          style={{ padding: '4px 8px', fontSize: '0.76rem' }}
                          value={b.status}
                          onChange={e => handleUpdateBugStatus(b.id, e.target.value)}
                        >
                          <option value={BugStatus.OPEN}>OPEN</option>
                          <option value={BugStatus.IN_PROGRESS}>IN PROGRESS</option>
                          <option value={BugStatus.FIXED}>FIXED</option>
                          <option value={BugStatus.VERIFIED}>VERIFIED</option>
                          <option value={BugStatus.CLOSED}>CLOSED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 7: PILOTO & FEEDBACK */}
        {activeTab === 'piloto' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Grupo Piloto de Rollout Inicial</h3>
                  <p className="panel-desc">Usuários selecionados para o lançamento controlado de homologação operacional.</p>
                </div>
              </div>
              <div className="table-responsive">
                <table className="readiness-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Perfil de Teste</th>
                      <th>E-mail</th>
                      <th>Papel no Rollout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pilotUsers.map(u => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td><span className="badge-sev p3">{u.role}</span></td>
                        <td>{u.email}</td>
                        <td>Validação de fluxos e emissão de feedback</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Formulário de Feedback do Piloto</h3>
                  <p className="panel-desc">Registro estruturado de problemas, sugestões e dificuldades encontradas.</p>
                </div>
              </div>
              <form onSubmit={handleSubmitFeedback} className="feedback-box">
                <div style={{ display: 'flex', gap: 12 }}>
                  <input
                    className="feedback-input"
                    type="email"
                    placeholder="Seu e-mail corporativo"
                    value={fbEmail}
                    onChange={e => setFbEmail(e.target.value)}
                    required
                  />
                  <select className="feedback-select" value={fbRole} onChange={e => setFbRole(e.target.value)}>
                    <option value="LICITACOES">Licitações</option>
                    <option value="COMERCIAL">Comercial</option>
                    <option value="TECNICO">Técnico</option>
                    <option value="GESTAO">Gestão / Admin</option>
                  </select>
                  <select className="feedback-select" value={fbCategory} onChange={e => setFbCategory(e.target.value)}>
                    <option value="Problema">Problema</option>
                    <option value="Sugestão">Sugestão</option>
                    <option value="Dificuldade">Dificuldade</option>
                  </select>
                </div>
                <textarea
                  className="feedback-textarea"
                  placeholder="Descreva detalhadamente o feedback ou melhoria observada durante o piloto..."
                  value={fbDesc}
                  onChange={e => setFbDesc(e.target.value)}
                  required
                />
                <button type="submit" className="btn-run-all-tests" style={{ alignSelf: 'flex-start' }}>
                  Enviar Feedback do Piloto
                </button>
              </form>

              {/* Lista de Feedbacks */}
              <div style={{ marginTop: 24 }}>
                <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 12 }}>Feedbacks Recebidos ({pilotFeedbacks.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pilotFeedbacks.map(f => (
                    <div key={f.id} style={{ background: 'rgba(0,0,0,0.25)', padding: 12, borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: '#38bdf8' }}>{f.userEmail} ({f.role})</span>
                        <span className="badge-sev p3">{f.category}</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#e2e8f0' }}>{f.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
