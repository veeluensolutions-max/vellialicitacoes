import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  ShieldCheck,
  Clock,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  UserCheck,
  History,
  Tag,
  SlidersHorizontal,
  Flame,
  Check,
  Share2
} from 'lucide-react';
import { OpportunityService, OpportunityStatus, PriorityLevel, NoGoReasons } from '../services/opportunityService';
import { OpportunityChangeHistoryService } from '../services/petronect/opportunityChangeHistory';
import EditalAnalysisModal from './EditalAnalysisModal';
import OpportunityStrategicDecision from './OpportunityStrategicDecision';
import { FileSearch } from 'lucide-react';
import './OpportunityDetailModal.css';

export default function OpportunityDetailModal({ opportunityId, isOpen, onClose, onUpdated }) {
  if (!isOpen || !opportunityId) return null;

  const [opp, setOpp] = useState(() => OpportunityService.getById(opportunityId));
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'intelligence' | 'decision' | 'history'
  const [reanalyzing, setReanalyzing] = useState(false);
  const [showNoGoDialog, setShowNoGoDialog] = useState(false);
  const [selectedNoGoReason, setSelectedNoGoReason] = useState(NoGoReasons[0]);
  const [showEditalAnalysis, setShowEditalAnalysis] = useState(false);
  
  // Edição de Responsável
  const [responsibleName, setResponsibleName] = useState(opp?.responsiblePerson || 'Carlos Silveira (Comercial)');
  const [responsibleNotes, setResponsibleNotes] = useState(opp?.internalNotes || '');
  const [responsibleDeadline, setResponsibleDeadline] = useState(opp?.internalDeadline || '18/10/2026');
  const [savedRespFeedback, setSavedRespFeedback] = useState(false);

  if (!opp) return null;

  // Ação de Reanálise pelo Motor
  const handleReanalyze = () => {
    setReanalyzing(true);
    setTimeout(() => {
      const updated = OpportunityService.reanalyzeOpportunity(opp.id);
      setOpp(updated);
      setReanalyzing(false);
      if (onUpdated) onUpdated(updated);
    }, 700);
  };

  // Ação de Decisão Comercial
  const handleDecision = (decisionType) => {
    if (decisionType === 'NO-GO') {
      setShowNoGoDialog(true);
    } else {
      const updated = OpportunityService.recordDecision(opp.id, decisionType);
      setOpp(updated);
      if (onUpdated) onUpdated(updated);
    }
  };

  const handleConfirmNoGo = () => {
    const updated = OpportunityService.recordDecision(opp.id, 'NO-GO', selectedNoGoReason);
    setOpp(updated);
    setShowNoGoDialog(false);
    if (onUpdated) onUpdated(updated);
  };

  // Salvar Atribuição de Responsável
  const handleSaveResponsible = (e) => {
    e.preventDefault();
    const updated = OpportunityService.assignResponsible(opp.id, {
      responsiblePerson: responsibleName,
      internalNotes: responsibleNotes,
      internalDeadline: responsibleDeadline
    });
    setOpp(updated);
    setSavedRespFeedback(true);
    setTimeout(() => setSavedRespFeedback(false), 2000);
    if (onUpdated) onUpdated(updated);
  };

  // Mudança manual de Status ou Prioridade
  const handleStatusChange = (newStatus) => {
    const updated = OpportunityService.updateStatus(opp.id, newStatus);
    setOpp(updated);
    if (onUpdated) onUpdated(updated);
  };

  const handlePriorityChange = (newPriority) => {
    const updated = OpportunityService.updatePriority(opp.id, newPriority);
    setOpp(updated);
    if (onUpdated) onUpdated(updated);
  };

  return (
    <div className="detail-modal-backdrop" onClick={onClose}>
      <div className="detail-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* TOPO: METADADOS PRINCIPAIS */}
        <div className="detail-modal-header">
          <div className="header-meta-row">
            <span className="opp-number-pill mono">{opp.number}</span>
            <span className="opp-portal-pill">{opp.portal}</span>
            <span className="opp-origin-pill">Origem: {opp.sourceOrigin || 'Petronect'}</span>
            
            {/* Seletor Manual de Prioridade */}
            <div className="priority-select-wrap">
              <Flame size={12} className={opp.priority === 'Crítica' ? 'text-critical' : 'text-teal'} />
              <select 
                value={opp.priority} 
                onChange={(e) => handlePriorityChange(e.target.value)}
                className={`priority-select priority-${opp.priority?.toLowerCase()}`}
              >
                <option value="Crítica">Crítica</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
                <option value="Muito baixa">Muito baixa</option>
              </select>
            </div>

            {/* Seletor Manual de Status */}
            <div className="status-select-wrap">
              <select 
                value={opp.status} 
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
              >
                {Object.values(OpportunityStatus).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {opp.decision && (
              <span className={`decision-pill decision-${opp.decision.toLowerCase()}`}>
                Decisão: {opp.decision}
              </span>
            )}
          </div>

          <div className="header-title-row">
            <div>
              <h2 className="detail-title">{opp.title}</h2>
              <p className="detail-client-sub">{opp.client} • {opp.location}</p>
            </div>

            <div className="header-score-box">
              <div className="score-num">{opp.score}%</div>
              <span className="score-desc">Aderência Vellia</span>
            </div>

            <button 
              className="btn-analisar-edital-action" 
              onClick={() => setShowEditalAnalysis(true)}
              title="Abrir Módulo de Análise Inteligente de Edital e Habilitação (Fase 8)"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(0, 229, 201, 0.12)',
                border: '1px solid rgba(0, 229, 201, 0.4)',
                color: '#00E5C9',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <FileSearch size={15} />
              <span>Analisar Edital (IA)</span>
            </button>

            <button className="detail-close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {/* Abas Internas da Oportunidade */}
          <div className="detail-tabs-bar">
            <button 
              className={`d-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <FileText size={14} />
              <span>Resumo do Edital</span>
            </button>
            <button 
              className={`d-tab-btn ${activeTab === 'intelligence' ? 'active' : ''}`}
              onClick={() => setActiveTab('intelligence')}
            >
              <Sparkles size={14} />
              <span>Análise de Aderência ({opp.score}%)</span>
            </button>
            <button 
              className={`d-tab-btn ${activeTab === 'decision' ? 'active' : ''}`}
              onClick={() => setActiveTab('decision')}
            >
              <ThumbsUp size={14} />
              <span>Decisão Estratégica (GO/NO-GO)</span>
            </button>
            <button 
              className={`d-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} />
              <span>Histórico & Timeline ({opp.history?.length || 1})</span>
            </button>
          </div>
        </div>

        {/* CORPO DA OPORTUNIDADE */}
        <div className="detail-modal-body">
          {/* ABA 1: RESUMO DA OPORTUNIDADE */}
          {activeTab === 'overview' && (
            <div className="tab-pane-content">
              <div className="overview-grid">
                <div className="overview-main-col">
                  <div className="detail-card">
                    <h4 className="card-subheading">Objeto da Licitação</h4>
                    <p className="card-body-text">{opp.object}</p>
                  </div>

                  <div className="detail-card">
                    <h4 className="card-subheading">Descrição Completa / Escopo Técnico</h4>
                    <p className="card-body-text">{opp.description || opp.object}</p>
                  </div>

                  {opp.tags && opp.tags.length > 0 && (
                    <div className="detail-card">
                      <h4 className="card-subheading">Tags Inteligentes Identificadas</h4>
                      <div className="tags-flow-wrap">
                        {opp.tags.map((tag, i) => (
                          <span key={i} className="detail-tag-chip">
                            <Tag size={11} /> {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="overview-side-col">
                  {/* FASE 9: CAPACIDADE DA EMPRESA & CAPABILITY SCORE (ITEM 37) */}
                  <div className="detail-card company-capability-card" style={{
                    background: 'linear-gradient(135deg, rgba(0, 229, 201, 0.08) 0%, rgba(17, 28, 56, 0.9) 100%)',
                    border: '1px solid rgba(0, 229, 201, 0.3)',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#00E5C9', fontWeight: 800, textTransform: 'uppercase' }}>
                        Capacidade da Empresa • Fase 9
                      </span>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                        Aptidão Alta
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>{opp.recommendedCompany}</strong>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#00E5C9', fontFamily: 'monospace' }}>92%</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', display: 'block', margin: '0.15rem 0 0.5rem 0' }}>
                      Capability Score no Cofre Corporativo
                    </span>
                    
                    <div style={{ fontSize: '0.72rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                      <div>✓ <strong>Atestados com ART:</strong> 3 localizados (36 meses)</div>
                      <div>✓ <strong>Responsável Técnico:</strong> CREA e NRs ativas</div>
                      <div>✓ <strong>Equipamentos:</strong> Calibração RBC vigente</div>
                    </div>
                  </div>

                  <div className="detail-card meta-box-card">
                    <h4 className="card-subheading">Dados da Contratação</h4>
                    
                    <div className="meta-pair">
                      <span className="lbl"><Calendar size={13} /> Publicação</span>
                      <span className="val">{opp.publishDate}</span>
                    </div>

                    <div className="meta-pair">
                      <span className="lbl"><Clock size={13} /> Encerramento</span>
                      <div className="val-urgency-wrap">
                        <span className="val highlight-date">{opp.endDate}</span>
                        <span className={`urgency-pill urgency-${OpportunityService.getDeadlineUrgency(opp.daysLeft).level}`}>
                          {OpportunityService.getDeadlineUrgency(opp.daysLeft).label} • {OpportunityService.getDeadlineUrgency(opp.daysLeft).text}
                        </span>
                      </div>
                    </div>

                    <div className="meta-pair">
                      <span className="lbl"><DollarSign size={13} /> Valor Estimado</span>
                      <span className="val mono">{opp.estimatedValue || 'Sob consulta'}</span>
                    </div>

                    <div className="meta-pair">
                      <span className="lbl"><MapPin size={13} /> Local de Execução</span>
                      <span className="val">{opp.location}</span>
                    </div>

                    <div className="meta-pair">
                      <span className="lbl"><ShieldCheck size={13} /> Modalidade</span>
                      <span className="val">{opp.modality}</span>
                    </div>

                    <div className="meta-pair">
                      <span className="lbl"><Building2 size={13} /> Empresa Recomendada</span>
                      <span className="val text-teal font-bold">{opp.recommendedCompany}</span>
                    </div>

                    {opp.url && (
                      <div className="external-portal-box">
                        <a 
                          href={opp.url} 
                          target="_blank" 
                          rel="noreferrer noopener" 
                          className="btn-link-external btn-petronect-official"
                          title="Abre a oportunidade oficial na íntegra no portal Petronect em nova aba"
                        >
                          <ExternalLink size={14} />
                          <span>Ver oportunidade no Petronect</span>
                        </a>
                        <p className="portal-security-disclaimer">
                          <ShieldCheck size={11} />
                          <span>Portal Oficial Externo: O Vellia atua como leitor e classificador de dados públicos. Manifestações de interesse e lances formais ocorrem exclusivamente no portal oficial.</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: ANÁLISE DE ADERÊNCIA INTELIGENTE */}
          {activeTab === 'intelligence' && (
            <div className="tab-pane-content">
              <div className="intelligence-action-bar">
                <div className="int-hero-badge">
                  <span className="int-score-circle">{opp.score}%</span>
                  <div>
                    <h3 className="int-hero-title">
                      {opp.score >= 90 ? 'Classificação: Prioridade Crítica' :
                       opp.score >= 80 ? 'Classificação: Alta Aderência' :
                       opp.score >= 70 ? 'Classificação: Boa Oportunidade' : 'Classificação: Analisar'}
                    </h3>
                    <p className="int-hero-sub">Empresa Indicada: <strong>{opp.recommendedCompany}</strong> ({opp.primaryService})</p>
                  </div>
                </div>

                <button 
                  className="btn-reanalyze" 
                  onClick={handleReanalyze} 
                  disabled={reanalyzing}
                  title="Executa novamente o Motor de Aderência com os dados atuais"
                >
                  <RefreshCw size={14} className={reanalyzing ? 'spinning' : ''} />
                  <span>{reanalyzing ? 'Reanalisando...' : 'Reanalisar Oportunidade'}</span>
                </button>
              </div>

              {/* Explicação da Pontuação */}
              <div className="detail-card explanation-box">
                <h4 className="card-subheading">Justificativa da Pontuação ({opp.score}%)</h4>
                <p className="card-body-text">{opp.explanationSummary || 'Alta aderência técnica mapeada pelo motor semântico.'}</p>
              </div>

              {/* Matriz dos 6 Componentes */}
              <div className="detail-card">
                <h4 className="card-subheading">Detalhamento dos 6 Componentes (Fase 4)</h4>
                <div className="score-breakdown-grid">
                  {opp.scoreBreakdown?.map((comp, i) => (
                    <div key={i} className="breakdown-card-item">
                      <div className="b-header">
                        <span className="b-name">{comp.name}</span>
                        <span className="b-weight">Peso: {comp.weight}</span>
                      </div>
                      <div className="b-points mono">{comp.obtainedPoints} / {comp.maxPoints} pts</div>
                      <p className="b-desc">{comp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid-dual-reasons">
                <div className="detail-card">
                  <div className="sub-with-icon text-green">
                    <CheckCircle2 size={16} />
                    <h4>Por que combina conosco?</h4>
                  </div>
                  <ul className="clean-bullet-list">
                    {opp.whyMatches?.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>

                <div className="detail-card">
                  <div className="sub-with-icon text-amber">
                    <AlertTriangle size={16} />
                    <h4>Possíveis Riscos e Pontos de Atenção</h4>
                  </div>
                  <ul className="clean-bullet-list">
                    {opp.risks?.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>

              {opp.matchedKeywords && opp.matchedKeywords.length > 0 && (
                <div className="detail-card">
                  <h4 className="card-subheading">Termos Técnicos & Sinônimos Mapeados</h4>
                  <div className="tags-flow-wrap">
                    {opp.matchedKeywords.map((kw, i) => (
                      <span key={i} className="kw-badge">
                        <Check size={11} /> {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 3: DECISÃO ESTRATÉGICA (FASE 10 — GO/NO-GO, RISCO 5x5, VIABILIDADE E CHECKLIST) */}
          {activeTab === 'decision' && (
            <div className="tab-pane-content">
              <OpportunityStrategicDecision 
                opportunity={opp} 
                onDecisionUpdated={reloadOpportunity} 
              />

              {/* Atribuição de Responsável Interno */}
              <div className="detail-card" style={{ marginTop: '20px' }}>
                <div className="sub-with-icon">
                  <UserCheck size={16} className="text-teal" />
                  <h4>Atribuição de Responsável & Prazo Interno</h4>
                </div>

                <form onSubmit={handleSaveResponsible} className="responsible-form-grid">
                  <div className="form-field">
                    <label>Responsável Comercial / Técnico</label>
                    <input 
                      type="text" 
                      value={responsibleName} 
                      onChange={(e) => setResponsibleName(e.target.value)}
                      placeholder="Ex: Mariana Castro (Eng. Ambiental)" 
                      className="modal-input"
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Prazo Limite Interno para Proposta</label>
                    <input 
                      type="text" 
                      value={responsibleDeadline} 
                      onChange={(e) => setResponsibleDeadline(e.target.value)}
                      placeholder="Ex: 18/10/2026" 
                      className="modal-input"
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Observações Comerciais Internas / Plano de Ação</label>
                    <textarea 
                      rows={3} 
                      value={responsibleNotes} 
                      onChange={(e) => setResponsibleNotes(e.target.value)}
                      placeholder="Adicione observações para a equipe (ex: solicitar visita técnica, verificar atestado com Cliente X)..." 
                      className="modal-textarea"
                    />
                  </div>

                  <div className="resp-submit-row full-width">
                    {savedRespFeedback && (
                      <span className="saved-feedback-pill">
                        <Check size={13} /> Dados salvos no histórico!
                      </span>
                    )}
                    <button type="submit" className="btn-save-resp">
                      Salvar Atribuição
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ABA 4: HISTÓRICO & TIMELINE */}
          {activeTab === 'history' && (
            <div className="tab-pane-content">
              {/* Histórico de Alterações de Campos (Fase 6 - Item 12) */}
              <div className="detail-card">
                <div className="sub-with-icon text-indigo">
                  <History size={16} />
                  <h4 className="card-subheading">Histórico de Alterações de Campos (Petronect / Auditoria)</h4>
                </div>
                {(() => {
                  const fieldChanges = OpportunityChangeHistoryService.getByOpportunity(opp.number);
                  if (fieldChanges.length === 0) {
                    return (
                      <p className="empty-history-text">
                        Nenhuma alteração de prazo ou escopo detectada pelo conector até o momento para este edital.
                      </p>
                    );
                  }
                  return (
                    <div className="change-history-table-wrapper">
                      <table className="change-history-table">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Campo Alterado</th>
                            <th>Valor Anterior</th>
                            <th>Novo Valor</th>
                            <th>Fonte</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fieldChanges.map((ch) => (
                            <tr key={ch.id}>
                              <td className="mono text-muted">{new Date(ch.date).toLocaleDateString('pt-BR')} {new Date(ch.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                              <td className="font-semibold text-primary">{ch.field}</td>
                              <td className="text-strike">{ch.previousValue}</td>
                              <td className="text-highlight-val">{ch.newValue}</td>
                              <td className="font-mono text-xs">{ch.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Linha do Tempo Geral de Auditoria */}
              <div className="detail-card">
                <h4 className="card-subheading">Timeline de Ações & Ciclo de Vida</h4>
                <div className="timeline-container">
                  {opp.history && opp.history.length > 0 ? (
                    opp.history.map((h, i) => (
                      <div key={h.id || i} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <strong className="timeline-action">{h.action}</strong>
                            <span className="timeline-date">{new Date(h.date).toLocaleString('pt-BR')}</span>
                          </div>
                          <p className="timeline-details">{h.details}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-history-text">Nenhum evento registrado ainda.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL DE CONFIRMAÇÃO DE NO-GO */}
        {showNoGoDialog && (
          <div className="nogo-dialog-overlay" onClick={() => setShowNoGoDialog(false)}>
            <div className="nogo-dialog-card" onClick={(e) => e.stopPropagation()}>
              <h4 className="nogo-title">Registrar Decisão: NO-GO (Descartar)</h4>
              <p className="nogo-sub">Selecione o motivo principal para o descarte desta oportunidade:</p>

              <div className="nogo-reasons-list">
                {NoGoReasons.map((r, i) => (
                  <label key={i} className="nogo-reason-label">
                    <input 
                      type="radio" 
                      name="nogoReason" 
                      checked={selectedNoGoReason === r} 
                      onChange={() => setSelectedNoGoReason(r)}
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              <div className="nogo-actions-row">
                <button className="btn-cancel" onClick={() => setShowNoGoDialog(false)}>
                  Cancelar
                </button>
                <button className="btn-confirm-nogo" onClick={handleConfirmNoGo}>
                  Confirmar Descarte
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO INTELIGENTE DE ANÁLISE DE EDITAL (FASE 8) */}
        <EditalAnalysisModal 
          opportunityId={opp.id} 
          isOpen={showEditalAnalysis} 
          onClose={() => setShowEditalAnalysis(false)} 
        />
      </div>
    </div>
  );
}
