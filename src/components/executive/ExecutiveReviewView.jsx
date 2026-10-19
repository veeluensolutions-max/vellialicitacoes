import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Shield,
  Briefcase,
  Users,
  Activity,
  Layers,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Award,
  Lock,
  Plus
} from 'lucide-react';
import {
  executiveOperatingSystemService,
  REVIEW_CADENCE,
  REVIEW_STATUS,
  COMMITMENT_STATUS
} from '../../services/executive/executiveOperatingSystemService';
import './ExecutiveReviewView.css';

export default function ExecutiveReviewView() {
  const [cadence, setCadence] = useState(REVIEW_CADENCE.WEEKLY);
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [isMeetingMode, setIsMeetingMode] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [activeTabSection, setActiveTabSection] = useState('summary');
  
  // Interatividade da reunião
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [decisionModal, setDecisionModal] = useState({ open: false, item: null, action: '' });
  const [decisionReason, setDecisionReason] = useState('');
  
  // Novo compromisso
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [newCommitment, setNewCommitment] = useState({ title: '', owner: '', dueDate: '', priority: 'HIGH' });
  
  // Copilot WBR
  const [copilotQuestion, setCopilotQuestion] = useState('');
  const [copilotAnswer, setCopilotAnswer] = useState(null);

  // Carrega ou gera review ao mudar cadência ou empresa
  useEffect(() => {
    loadReview();
    loadHistory();
  }, [cadence, selectedCompany]);

  const loadReview = () => {
    const review = executiveOperatingSystemService.getOrGenerateReview(cadence, selectedCompany);
    setCurrentReview(review);
    if (review && review.meetingNotes) {
      setMeetingNotes(review.meetingNotes);
    } else {
      setMeetingNotes('');
    }
  };

  const loadHistory = () => {
    const hist = executiveOperatingSystemService.getReviewHistory(cadence, selectedCompany);
    setHistoryList(hist);
  };

  const handleCadenceChange = (newCadence) => {
    setCadence(newCadence);
    setCopilotAnswer(null);
  };

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setMeetingNotes(val);
    if (currentReview) {
      executiveOperatingSystemService.saveMeetingNotes(currentReview.id, val);
    }
  };

  const handleExecuteDecision = (item, action) => {
    setDecisionModal({ open: true, item, action });
    setDecisionReason('');
  };

  const confirmDecision = () => {
    if (!decisionModal.item || !currentReview) return;
    setIsSavingDecision(true);
    executiveOperatingSystemService.recordLiveDecision(currentReview.id, {
      decision: `${decisionModal.action.toUpperCase()}: ${decisionModal.item.title}`,
      reason: decisionReason || 'Decisão executiva acordada durante a revisão.',
      owner: 'Diretoria / Gestão',
      relatedEntity: decisionModal.item.id
    });
    setIsSavingDecision(false);
    setDecisionModal({ open: false, item: null, action: '' });
    loadReview();
  };

  const handleAddCommitment = () => {
    if (!newCommitment.title || !currentReview) return;
    executiveOperatingSystemService.addCommitment(currentReview.id, newCommitment);
    setNewCommitment({ title: '', owner: '', dueDate: '', priority: 'HIGH' });
    setShowCommitmentModal(false);
    loadReview();
  };

  const handleUpdateCommitmentStatus = (commitmentId, newStatus) => {
    if (!currentReview) return;
    executiveOperatingSystemService.updateCommitmentStatus(currentReview.id, commitmentId, newStatus);
    loadReview();
  };

  const handleCompleteReview = (qualityRating) => {
    if (!currentReview) return;
    executiveOperatingSystemService.completeReview(currentReview.id, qualityRating);
    loadReview();
    loadHistory();
  };

  const handleAskCopilot = (preset) => {
    const q = preset || copilotQuestion;
    if (!q || !currentReview) return;
    const ans = executiveOperatingSystemService.askReviewCopilot(currentReview, q);
    setCopilotAnswer(ans);
    setCopilotQuestion(q);
  };

  if (!currentReview) {
    return (
      <div className="executive-review-container">
        <div className="review-loading">Carregando Revisão Executiva...</div>
      </div>
    );
  }

  const { snapshot } = currentReview;
  const isLocked = currentReview.status === REVIEW_STATUS.COMPLETED;

  return (
    <div className={`executive-review-container ${isMeetingMode ? 'meeting-mode' : ''}`}>
      {/* HEADER DA REVISÃO */}
      <header className="review-header">
        <div className="review-header-info">
          <div className="review-title-badge">
            <span className={`cadence-badge ${cadence.toLowerCase()}`}>
              {cadence === REVIEW_CADENCE.WEEKLY && 'Weekly Business Review (WBR)'}
              {cadence === REVIEW_CADENCE.MONTHLY && 'Monthly Business Review (MBR)'}
              {cadence === REVIEW_CADENCE.QUARTERLY && 'Quarterly Business Review (QBR)'}
            </span>
            <span className={`review-status-tag status-${currentReview.status.toLowerCase()}`}>
              {currentReview.status === REVIEW_STATUS.READY && 'Pronta para Revisão'}
              {currentReview.status === REVIEW_STATUS.IN_REVIEW && 'Em Revisão'}
              {currentReview.status === REVIEW_STATUS.COMPLETED && 'Concluída & Travada'}
            </span>
          </div>

          <h1>
            {cadence === REVIEW_CADENCE.WEEKLY && 'Revisão Executiva Semanal'}
            {cadence === REVIEW_CADENCE.MONTHLY && 'Revisão Executiva Mensal'}
            {cadence === REVIEW_CADENCE.QUARTERLY && 'Revisão Estratégica Trimestral'}
          </h1>

          <div className="review-meta">
            <span><Calendar size={14} /> Período: {currentReview.periodStart} até {currentReview.periodEnd}</span>
            <span><Clock size={14} /> Gerado em: {new Date(currentReview.generatedAt).toLocaleString('pt-BR')}</span>
            <span><Shield size={14} /> Empresa: {currentReview.companyId === 'ALL' ? 'Grupo Consolidado (Veeluen + Excelência)' : currentReview.companyId}</span>
          </div>
        </div>

        {/* TOOLBAR SUPERIOR */}
        <div className="review-actions-toolbar">
          <div className="cadence-tabs">
            <button
              className={`cadence-tab-btn ${cadence === REVIEW_CADENCE.WEEKLY ? 'active' : ''}`}
              onClick={() => handleCadenceChange(REVIEW_CADENCE.WEEKLY)}
            >
              Semanal (WBR)
            </button>
            <button
              className={`cadence-tab-btn ${cadence === REVIEW_CADENCE.MONTHLY ? 'active' : ''}`}
              onClick={() => handleCadenceChange(REVIEW_CADENCE.MONTHLY)}
            >
              Mensal (MBR)
            </button>
            <button
              className={`cadence-tab-btn ${cadence === REVIEW_CADENCE.QUARTERLY ? 'active' : ''}`}
              onClick={() => handleCadenceChange(REVIEW_CADENCE.QUARTERLY)}
            >
              Trimestral (QBR)
            </button>
          </div>

          <select
            className="company-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="ALL">Grupo Consolidado</option>
            <option value="VEELUEN">Veeluen Soluções</option>
            <option value="EXCELENCIA">Excelência Gestão</option>
          </select>

          <button
            className="btn-meeting-mode"
            onClick={() => setIsMeetingMode(!isMeetingMode)}
            title="Alternar Modo Apresentação de Reunião"
          >
            {isMeetingMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isMeetingMode ? 'Sair do Modo Reunião' : 'Apresentar Revisão'}
          </button>

          <button
            className="btn-secondary"
            onClick={() => window.print()}
            title="Exportar ou Imprimir Executive Brief"
          >
            <Printer size={16} /> Brief
          </button>
        </div>
      </header>

      {/* METRICS RIBBON (POUCAS MÉTRICAS CENTRAIS) */}
      <section className="metrics-ribbon">
        <div className="ribbon-card">
          <span className="ribbon-label">Pipeline Qualificado</span>
          <span className="ribbon-val">
            R$ {(snapshot?.pipeline?.qualified / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
          </span>
          <span className="ribbon-sub">Ponderado: R$ {(snapshot?.pipeline?.weighted / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</span>
        </div>

        <div className="ribbon-card">
          <span className="ribbon-label">Commit Executivo</span>
          <span className="ribbon-val success">
            R$ {(snapshot?.pipeline?.commit / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
          </span>
          <span className="ribbon-sub">Best Case: R$ {(snapshot?.pipeline?.bestCase / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</span>
        </div>

        <div className="ribbon-card">
          <span className="ribbon-label">Valor em Risco</span>
          <span className="ribbon-val danger">
            R$ {(snapshot?.pipeline?.atRisk / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
          </span>
          <span className="ribbon-sub">{snapshot?.risks?.length || 0} riscos identificados</span>
        </div>

        <div className="ribbon-card">
          <span className="ribbon-label">Decisões Pendentes</span>
          <span className={`ribbon-val ${snapshot?.decisions?.length > 0 ? 'warning' : 'success'}`}>
            {snapshot?.decisions?.length || 0}
          </span>
          <span className="ribbon-sub">Requerem deliberação hoje</span>
        </div>

        <div className="ribbon-card">
          <span className="ribbon-label">Compromissos Pendentes</span>
          <span className="ribbon-val">
            {snapshot?.commitments?.filter(c => c.status !== COMMITMENT_STATUS.COMPLETED).length || 0}
          </span>
          <span className="ribbon-sub">
            {snapshot?.commitments?.filter(c => c.status === COMMITMENT_STATUS.CARRIED_OVER).length || 0} Carried Over
          </span>
        </div>
      </section>

      {/* NAVEGAÇÃO INTERNA DAS SEÇÕES */}
      <nav className="wbr-nav-pills">
        <button
          className={`wbr-pill-btn ${activeTabSection === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTabSection('summary')}
        >
          1. Resumo & Mudanças
        </button>
        <button
          className={`wbr-pill-btn ${activeTabSection === 'priorities' ? 'active' : ''}`}
          onClick={() => setActiveTabSection('priorities')}
        >
          2. Prioridades & Decisões
        </button>
        <button
          className={`wbr-pill-btn ${activeTabSection === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTabSection('pipeline')}
        >
          3. Pipeline & Oportunidades
        </button>
        <button
          className={`wbr-pill-btn ${activeTabSection === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTabSection('contracts')}
        >
          4. Contratos & Riscos
        </button>
        <button
          className={`wbr-pill-btn ${activeTabSection === 'commitments' ? 'active' : ''}`}
          onClick={() => setActiveTabSection('commitments')}
        >
          5. Compromissos & Próxima Semana
        </button>
      </nav>

      {/* GRID PRINCIPAL DE CONTEÚDO */}
      <div className="wbr-main-grid">
        {/* COLUNA PRINCIPAL */}
        <div className="wbr-col-main">

          {/* SEÇÃO 1: RESUMO EXECUTIVO & MUDANÇAS DA SEMANA */}
          {activeTabSection === 'summary' && (
            <>
              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><Sparkles size={18} color="#60a5fa" /> Resumo Executivo (Highlights)</h3>
                  <p className="section-subtitle">5 a 8 pontos objetivos com evidências reais no sistema</p>
                </div>
                <div className="summary-bullets-list">
                  {snapshot?.summary?.length === 0 && (
                    <p style={{ color: '#94a3b8' }}>Nenhuma exceção ou mudança crítica detectada nesta semana.</p>
                  )}
                  {snapshot?.summary?.map((b, idx) => (
                    <div key={idx} className="summary-bullet-item">
                      <span className="bullet-icon">{b.icon || '📌'}</span>
                      <div className="bullet-text">
                        {b.text}
                        {b.evidenceEntityId && (
                          <span className="bullet-evidence-tag">
                            Ver {b.evidenceEntityType} (#{b.evidenceEntityId})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><TrendingUp size={18} color="#34d399" /> Mudanças da Semana (Week-over-Week)</h3>
                  <p className="section-subtitle">Eventos materialmente relevantes desde a última revisão</p>
                </div>
                <div className="wow-changes-grid">
                  {snapshot?.changes?.length === 0 && (
                    <p style={{ color: '#94a3b8' }}>Sem movimentações fora do threshold normal na semana.</p>
                  )}
                  {snapshot?.changes?.map((c, idx) => (
                    <div key={idx} className={`wow-change-card ${c.type.toLowerCase()}`}>
                      <span className="change-type-badge">{c.type}</span>
                      <span className="change-desc">{c.description}</span>
                      <span className="change-date">{new Date(c.timestamp).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* OPERAÇÃO DO VELLIA & QUALIDADE DE DADOS */}
              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><Activity size={18} color="#a78bfa" /> Operação do Vellia & Integridade de Dados</h3>
                  <p className="section-subtitle">Exceções operacionais e sincronizações</p>
                </div>
                <div style={{ padding: '12px', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '8px' }}>
                  {snapshot?.operations?.issues?.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399' }}>
                      <CheckCircle size={18} />
                      <strong>Operação normal:</strong> Todas as integrações (PNCP, Compras.gov, e-mails e agentes) operando sem intercorrências.
                    </div>
                  ) : (
                    <div>
                      {snapshot?.operations?.issues?.map((issue, i) => (
                        <div key={i} style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertTriangle size={16} /> {issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* SEÇÃO 2: PRIORIDADES & DECISÕES */}
          {activeTabSection === 'priorities' && (
            <>
              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><Award size={18} color="#fbbf24" /> Prioridades da Semana (Top 5–7)</h3>
                  <p className="section-subtitle">Foco prioritário: prazo, impacto, blocker e governança</p>
                </div>
                <div className="priorities-list">
                  {snapshot?.priorities?.map((p, idx) => (
                    <div key={idx} className="priority-card">
                      <div className="priority-header">
                        <span className="priority-title">{idx + 1}. {p.title}</span>
                        <span className="priority-due">{p.dueDate || 'Esta semana'}</span>
                      </div>
                      <p className="priority-reason"><strong>Por que importa:</strong> {p.reason}</p>
                      <div className="priority-meta">
                        <span><strong>Owner:</strong> {p.owner}</span>
                        <span className="priority-action">Próxima ação: {p.action}</span>
                        {p.strategicGoal && (
                          <span className="strategic-align-tag">🎯 {p.strategicGoal}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><CheckCircle size={18} color="#f87171" /> Fila de Decisões Pendentes (Decision Queue)</h3>
                  <p className="section-subtitle">Decisões prioritárias ordenadas por impacto e prazo</p>
                </div>
                <div className="decision-queue-list">
                  {snapshot?.decisions?.length === 0 && (
                    <p style={{ color: '#94a3b8' }}>Nenhuma deliberação pendente no momento.</p>
                  )}
                  {snapshot?.decisions?.map((d, idx) => (
                    <div key={idx} className="decision-item-card">
                      <div className="decision-item-header">
                        <span className="decision-title">{d.title}</span>
                        <span className="decision-impact-badge">{d.impact}</span>
                      </div>
                      <div className="decision-context">{d.context}</div>
                      <div className="decision-recommendation">
                        💡 <strong>Recomendação do Sistema:</strong> {d.recommendation}
                      </div>
                      {!isLocked && (
                        <div className="decision-actions-row">
                          <button
                            className="btn-decision-action approve"
                            onClick={() => handleExecuteDecision(d, 'Aprovar')}
                          >
                            Aprovar
                          </button>
                          <button
                            className="btn-decision-action reject"
                            onClick={() => handleExecuteDecision(d, 'Rejeitar')}
                          >
                            Rejeitar / Não-Go
                          </button>
                          <button
                            className="btn-decision-action defer"
                            onClick={() => handleExecuteDecision(d, 'Postergar')}
                          >
                            Postergar / Ajuste
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SEÇÃO 3: PIPELINE & OPORTUNIDADES */}
          {activeTabSection === 'pipeline' && (
            <>
              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><Layers size={18} color="#38bdf8" /> Pipeline & Movimento Semanal</h3>
                  <p className="section-subtitle">Entradas, avanços e saídas líquidas</p>
                </div>

                <div className="pipeline-movement-flow">
                  <div className="movement-node pos">
                    <div className="lbl">+ Novas Entradas</div>
                    <div className="val">+R$ {(snapshot?.pipeline?.movement?.added / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</div>
                  </div>
                  <div className="movement-node pos">
                    <div className="lbl">Avançaram Fase</div>
                    <div className="val">+R$ {(snapshot?.pipeline?.movement?.advanced / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</div>
                  </div>
                  <div className="movement-node neg">
                    <div className="lbl">- Perdas / Defer</div>
                    <div className="val">-R$ {(snapshot?.pipeline?.movement?.lost / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</div>
                  </div>
                </div>

                {snapshot?.pipeline?.goal && (
                  <div style={{ marginTop: '14px', background: 'rgba(30, 41, 59, 0.4)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span><strong>Meta do Período:</strong> R$ {(snapshot.pipeline.goal.target / 1000).toLocaleString('pt-BR')}k</span>
                      <span><strong>Commit Atual:</strong> R$ {(snapshot.pipeline.commit / 1000).toLocaleString('pt-BR')}k</span>
                      <span style={{ color: snapshot.pipeline.goal.gap > 0 ? '#fbbf24' : '#34d399' }}>
                        <strong>Gap:</strong> R$ {(snapshot.pipeline.goal.gap / 1000).toLocaleString('pt-BR')}k
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><Briefcase size={18} color="#60a5fa" /> Oportunidades Críticas</h3>
                  <p className="section-subtitle">Must Win humano, alto valor, risco e deadline próximo</p>
                </div>
                <div className="priorities-list">
                  {snapshot?.opportunities?.map((opp, idx) => (
                    <div key={idx} className="priority-card">
                      <div className="priority-header">
                        <span className="priority-title">{opp.title}</span>
                        <span className="priority-due">
                          R$ {(opp.value / 1000).toLocaleString('pt-BR')}k | Aderência: {opp.adherence}%
                        </span>
                      </div>
                      <div className="priority-meta">
                        <span><strong>Prazo:</strong> {opp.deadline}</span>
                        <span><strong>Decisão:</strong> {opp.decision}</span>
                        <span><strong>Prontidão:</strong> {opp.readiness}%</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#60a5fa', marginTop: '4px' }}>
                        Próxima Ação: {opp.nextAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SEÇÃO 4: CONTRATOS, OBRIGAÇÕES & RISCOS */}
          {activeTabSection === 'contracts' && (
            <>
              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><FileText size={18} color="#34d399" /> Contratos em Atenção (Por Exceção)</h3>
                  <p className="section-subtitle">Apenas contratos com obrigações iminentes ou renovações</p>
                </div>
                <div className="priorities-list">
                  {snapshot?.contracts?.length === 0 && (
                    <p style={{ color: '#94a3b8' }}>Todos os contratos ativos estão saudáveis e sem pendências críticas.</p>
                  )}
                  {snapshot?.contracts?.map((c, idx) => (
                    <div key={idx} className="priority-card">
                      <div className="priority-header">
                        <span className="priority-title">{c.title}</span>
                        <span className="priority-due">{c.client}</span>
                      </div>
                      <p className="priority-reason">⚠️ <strong>Atenção:</strong> {c.issue}</p>
                      <div className="priority-meta">
                        <span><strong>Ação Exigida:</strong> {c.requiredAction}</span>
                        <span><strong>Prazo:</strong> {c.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><Shield size={18} color="#ef4444" /> Top Riscos & Blockers</h3>
                  <p className="section-subtitle">Riscos materiais identificados com mitigação e responsável</p>
                </div>
                <div className="priorities-list">
                  {snapshot?.risks?.map((r, idx) => (
                    <div key={idx} className="priority-card">
                      <div className="priority-header">
                        <span className="priority-title">{r.title}</span>
                        <span className="priority-due" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                          Impacto: {r.impact}
                        </span>
                      </div>
                      <p className="priority-reason"><strong>Mitigação:</strong> {r.mitigation}</p>
                      <div className="priority-meta">
                        <span><strong>Owner:</strong> {r.owner}</span>
                        <span><strong>Status:</strong> {r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* SEÇÃO 5: COMPROMISSOS & PRÓXIMA SEMANA */}
          {activeTabSection === 'commitments' && (
            <>
              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><CheckCircle size={18} color="#10b981" /> Compromissos da Revisão (Accountability)</h3>
                  {!isLocked && (
                    <button
                      className="btn-secondary"
                      onClick={() => setShowCommitmentModal(true)}
                    >
                      <Plus size={14} /> Novo Compromisso
                    </button>
                  )}
                </div>

                <table className="commitments-table">
                  <thead>
                    <tr>
                      <th>Compromisso</th>
                      <th>Responsável</th>
                      <th>Prazo</th>
                      <th>Status</th>
                      {!isLocked && <th>Ação</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot?.commitments?.map((c) => (
                      <tr key={c.id}>
                        <td>{c.title}</td>
                        <td>{c.owner}</td>
                        <td>{c.dueDate}</td>
                        <td>
                          <span className={`commitment-status-tag ${c.status.toLowerCase()}`}>
                            {c.status === COMMITMENT_STATUS.COMPLETED && 'Concluído'}
                            {c.status === COMMITMENT_STATUS.OPEN && 'Aberto'}
                            {c.status === COMMITMENT_STATUS.CARRIED_OVER && 'Carried Over'}
                            {c.status === COMMITMENT_STATUS.BLOCKED && 'Bloqueado'}
                          </span>
                        </td>
                        {!isLocked && (
                          <td>
                            {c.status !== COMMITMENT_STATUS.COMPLETED && (
                              <button
                                style={{ background: '#10b981', border: 'none', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                onClick={() => handleUpdateCommitmentStatus(c.id, COMMITMENT_STATUS.COMPLETED)}
                              >
                                Concluir
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="wbr-section-card">
                <div className="section-header-row">
                  <h3><Calendar size={18} color="#38bdf8" /> Look-Ahead: Próxima Semana (7 a 14 dias)</h3>
                  <p className="section-subtitle">Prazos, sessões públicas e reuniões agendadas</p>
                </div>
                <div className="priorities-list">
                  {snapshot?.nextWeekEvents?.map((ev, idx) => (
                    <div key={idx} className="priority-card">
                      <div className="priority-header">
                        <span className="priority-title">{ev.title}</span>
                        <span className="priority-due">{ev.date}</span>
                      </div>
                      <div className="priority-meta">
                        <span><strong>Tipo:</strong> {ev.type}</span>
                        <span><strong>Envolvidos:</strong> {ev.assignee}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        {/* COLUNA LATERAL: LIVE NOTES & COPILOT WBR */}
        <div className="wbr-col-side">
          {/* LIVE MEETING NOTES */}
          <div className="wbr-section-card">
            <div className="section-header-row">
              <h3><MessageSquare size={16} /> Notas da Reunião</h3>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Salvas automaticamente</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Registros da reunião não alteram dados canônicos diretamente.
            </p>
            <textarea
              className="live-notes-area"
              placeholder="Digite aqui deliberações, alinhamentos e notas executivas da sessão..."
              value={meetingNotes}
              onChange={handleNotesChange}
              disabled={isLocked}
            />
          </div>

          {/* COPILOT DA REVISÃO */}
          <div className="wbr-section-card">
            <div className="section-header-row">
              <h3><Sparkles size={16} color="#60a5fa" /> Copilot Executivo WBR</h3>
            </div>
            <div className="copilot-qna-box">
              <div className="copilot-suggestions">
                <button className="copilot-chip" onClick={() => handleAskCopilot('O que mudou desde a última revisão?')}>
                  O que mudou?
                </button>
                <button className="copilot-chip" onClick={() => handleAskCopilot('Quais são as prioridades desta semana?')}>
                  Prioridades?
                </button>
                <button className="copilot-chip" onClick={() => handleAskCopilot('O que está bloqueado ou em risco?')}>
                  O que está em risco?
                </button>
                <button className="copilot-chip" onClick={() => handleAskCopilot('Quais compromissos ficaram pendentes?')}>
                  Compromissos pendentes?
                </button>
              </div>

              {copilotAnswer && (
                <div className="copilot-answer">
                  <strong>Resposta:</strong> {copilotAnswer}
                </div>
              )}
            </div>
          </div>

          {/* FINALIZAÇÃO DA REVISÃO & AUDITORIA */}
          <div className="wbr-section-card">
            <div className="section-header-row">
              <h3><Lock size={16} /> Encerramento & Snapshot</h3>
            </div>
            {isLocked ? (
              <div style={{ fontSize: '0.82rem', color: '#34d399' }}>
                <CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                Esta revisão foi concluída e o snapshot está travado para auditoria.
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px' }}>
                  Ao concluir a revisão, o snapshot histórico é congelado e as pendências são transferidas para a próxima semana.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-meeting-mode"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => handleCompleteReview('USEFUL')}
                  >
                    Concluir Revisão (Útil)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE DECISÃO */}
      {decisionModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', width: '450px', border: '1px solid #334155', color: '#f1f5f9' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Registrar Decisão: {decisionModal.action}</h3>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{decisionModal.item?.title}</p>
            <div style={{ margin: '14px 0' }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Justificativa / Motivo:</label>
              <textarea
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                rows="3"
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Insira a justificativa executiva..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setDecisionModal({ open: false, item: null, action: '' })}>Cancelar</button>
              <button className="btn-meeting-mode" onClick={confirmDecision}>Salvar Decisão</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE NOVO COMPROMISSO */}
      {showCommitmentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', width: '450px', border: '1px solid #334155', color: '#f1f5f9' }}>
            <h3 style={{ margin: '0 0 12px 0' }}>Novo Compromisso da Revisão</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Título do Compromisso:</label>
                <input
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                  type="text"
                  placeholder="Ex: Finalizar análise técnica do Edital X"
                  value={newCommitment.title}
                  onChange={(e) => setNewCommitment({ ...newCommitment, title: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Responsável (Owner):</label>
                <input
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                  type="text"
                  placeholder="Ex: Eng. Carlos / Jurídico"
                  value={newCommitment.owner}
                  onChange={(e) => setNewCommitment({ ...newCommitment, owner: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Prazo:</label>
                <input
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                  type="date"
                  value={newCommitment.dueDate}
                  onChange={(e) => setNewCommitment({ ...newCommitment, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button className="btn-secondary" onClick={() => setShowCommitmentModal(false)}>Cancelar</button>
              <button className="btn-meeting-mode" onClick={handleAddCommitment}>Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
