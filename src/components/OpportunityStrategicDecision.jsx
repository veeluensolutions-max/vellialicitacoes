import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Flame, 
  Activity, 
  DollarSign, 
  Briefcase, 
  Sliders, 
  Layers, 
  Users, 
  Wrench, 
  FileText, 
  ChevronRight, 
  Building2, 
  ArrowUpRight, 
  Lock, 
  Unlock,
  AlertOctagon,
  BarChart2,
  Calendar,
  Sparkles,
  Info,
  FileSpreadsheet,
  ArrowRight
} from 'lucide-react';
import { 
  DecisionService, 
  DecisionTier, 
  NoGoReason, 
  RiskSeverity, 
  RiskCategory 
} from '../services/decision/decisionService';
import { ProposalService } from '../services/proposal/proposalService';
import ProposalDetailView from './ProposalDetailView';
import './OpportunityStrategicDecision.css';

export default function OpportunityStrategicDecision({ opportunity, onDecisionUpdated }) {
  if (!opportunity) return null;

  const decisionData = DecisionService.calculateDecision(opportunity);
  const humanDecision = DecisionService.getHumanDecision(opportunity.id || opportunity.number);

  const [activeSubTab, setActiveSubTab] = useState('decision-overview'); // 'decision-overview', 'risk-matrix', 'commercial', 'checklist'
  const [showNoGoModal, setShowNoGoModal] = useState(false);
  const [selectedNoGoReason, setSelectedNoGoReason] = useState(NoGoReason.BAIXA_ADERENCIA);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [authorName, setAuthorName] = useState('Diretor Comercial');
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [activeProposalId, setActiveProposalId] = useState(null);

  const oppNum = String(opportunity.number || opportunity.id);
  const existingProposal = ProposalService.listAll().find(p => String(p.opportunityNumber) === oppNum);

  const handleOpenOrCreateProposal = () => {
    if (existingProposal) {
      setActiveProposalId(existingProposal.id);
    } else {
      const created = ProposalService.createProposalFromOpportunity(opportunity, authorName);
      setActiveProposalId(created.id);
      if (onDecisionUpdated) onDecisionUpdated();
    }
  };

  // Registrar Decisão Humana
  const handleRegisterDecision = (decisionType) => {
    if (decisionType === 'NO-GO') {
      setShowNoGoModal(true);
      return;
    }

    executeDecisionSave(decisionType, decisionNotes || 'Aprovação concedida com base na avaliação multicritério favorável.');
  };

  const handleConfirmNoGo = () => {
    executeDecisionSave('NO-GO', decisionNotes || `Descarte comercial motivado por: ${selectedNoGoReason}`, selectedNoGoReason);
    setShowNoGoModal(false);
  };

  const executeDecisionSave = (decisionType, justificativa, noGoReason = null) => {
    DecisionService.saveHumanDecision(
      opportunity.id || opportunity.number,
      {
        decision: decisionType,
        justificativa,
        noGoReason,
        decisionScore: decisionData.decisionScore,
        recommendationTier: decisionData.recommendationTier
      },
      authorName
    );

    setFeedbackMsg(`Decisão ${decisionType} registrada com sucesso no histórico da oportunidade.`);
    setTimeout(() => setFeedbackMsg(null), 4000);

    if (onDecisionUpdated) {
      onDecisionUpdated();
    }
  };

  const currentDecision = humanDecision?.currentDecision || null;

  return (
    <div className="strategic-decision-container">
      {/* 1. HERO BANNER DO DECISION SCORE & RECOMENDAÇÃO (Itens 1, 2, 4, 5) */}
      <div className={`decision-hero-banner ${decisionData.badgeClass}`}>
        <div className="hero-score-badge">
          <div className="score-radial">
            <span className="score-val">{decisionData.decisionScore}%</span>
            <span className="score-lbl">Decision Score</span>
          </div>
          <div className="tier-info">
            <div className="tier-tag-row">
              <span className={`decision-tier-pill ${decisionData.badgeClass}`}>
                {decisionData.recommendationTier}
              </span>
              {decisionData.hasActiveBlockers && (
                <span className="blocker-warning-pill">
                  <Lock size={12} /> Bloqueador Ativo
                </span>
              )}
            </div>
            <h3 className="hero-decision-title">
              {decisionData.recommendationTier === DecisionTier.GO_PRIORITARIO ? 'Oportunidade de Altíssimo Potencial (GO Prioritário)' :
               decisionData.recommendationTier === DecisionTier.GO ? 'Viabilidade Positiva para Participação (GO)' :
               decisionData.recommendationTier === DecisionTier.GO_PENDENCIAS ? 'Viável com Mitigação de Pendências (GO Condicional)' :
               decisionData.recommendationTier === DecisionTier.ANALISE_GERENCIAL ? 'Requer Parecer Específico da Diretoria' :
               decisionData.recommendationTier === DecisionTier.GO_BLOQUEADO ? 'Participação Bloqueada por Requisito Crítico' :
               'Descarte Recomendado (NO-GO)'}
            </h3>
            <p className="hero-decision-reason">
              <Sparkles size={14} className="sparkle-icon" />
              <strong>Parecer da IA Vellia:</strong> {decisionData.recommendationReason}
            </p>
          </div>
        </div>

        {/* Status da Decisão Humana Vigente */}
        <div className="human-decision-current-box">
          <span className="box-title-label">Decisão Humana Atual</span>
          {currentDecision ? (
            <div className={`current-human-status status-${currentDecision.toLowerCase().replace('_', '-')}`}>
              {currentDecision === 'GO' ? <CheckCircle2 size={18} /> :
               currentDecision === 'NO-GO' ? <XCircle size={18} /> : <HelpCircle size={18} />}
              <div>
                <strong>{currentDecision === 'GO' ? 'GO Aprovado' : currentDecision === 'NO-GO' ? 'NO-GO Aprovado' : 'Em Análise'}</strong>
                <p>Por {humanDecision.lastAuthor} em {humanDecision.lastUpdated}</p>
              </div>
            </div>
          ) : (
            <div className="current-human-status status-pending">
              <Clock size={16} />
              <span>Aguardando deliberação da equipe comercial</span>
            </div>
          )}
        </div>
      </div>

      {/* BLOQUEADORES CRÍTICOS (Itens 36 e 37) */}
      {decisionData.hasActiveBlockers && (
        <div className="critical-blockers-banner">
          <div className="blocker-header">
            <AlertOctagon size={18} />
            <h4>Bloqueadores Críticos Identificados (GO Bloqueado)</h4>
          </div>
          <div className="blockers-list">
            {decisionData.blockers.map(b => (
              <div key={b.id} className="blocker-item">
                <span className="blocker-badge">Impeditivo</span>
                <div className="blocker-content">
                  <strong>{b.title}</strong>
                  <p>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-NAVEGAÇÃO DA DECISÃO */}
      <div className="decision-subtabs-nav">
        <button 
          className={`subtab-btn ${activeSubTab === 'decision-overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('decision-overview')}
        >
          <Activity size={14} />
          <span>Dimensões & Deliberação Humana</span>
        </button>
        <button 
          className={`subtab-btn ${activeSubTab === 'risk-matrix' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('risk-matrix')}
        >
          <Flame size={14} />
          <span>Matriz de Risco 5x5 ({decisionData.risks.riskScore}% Risco)</span>
        </button>
        <button 
          className={`subtab-btn ${activeSubTab === 'commercial' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('commercial')}
        >
          <DollarSign size={14} />
          <span>Viabilidade Comercial & 3 Cenários</span>
        </button>
        <button 
          className={`subtab-btn ${activeSubTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('checklist')}
        >
          <CheckCircle2 size={14} />
          <span>Checklist & O Que Falta?</span>
        </button>
      </div>

      {/* PAINEL 1: DIMENSÕES DO SCORE & DELIBERAÇÃO HUMANA */}
      {activeSubTab === 'decision-overview' && (
        <div className="decision-tab-pane">
          {/* Matriz das 6 Dimensões (Item 3) */}
          <div className="section-card">
            <div className="card-top-title">
              <Sliders size={16} />
              <h4>Desdobramento das 6 Dimensões do Decision Score</h4>
            </div>
            <p className="section-subtitle">
              Pesos ponderados configurados pelo comitê diretivo totalizando 100%.
            </p>

            <div className="dimensions-grid">
              {/* Dimensão 1: Aderência Técnica */}
              <div className="dim-card">
                <div className="dim-head">
                  <span className="dim-name">1. Aderência Técnica</span>
                  <span className="dim-weight">Peso: {decisionData.dimensions.aderenciaTecnica.weight}%</span>
                </div>
                <div className="dim-score-row">
                  <span className="dim-val">{decisionData.dimensions.aderenciaTecnica.score}%</span>
                  <span className="dim-pts mono">+{decisionData.dimensions.aderenciaTecnica.weightedPoints.toFixed(1)} pts</span>
                </div>
                <div className="dim-bar">
                  <div className="dim-fill" style={{ width: `${decisionData.dimensions.aderenciaTecnica.score}%` }} />
                </div>
                <p className="dim-note">Calculado pelo Motor Semântico</p>
              </div>

              {/* Dimensão 2: Capacidade de Habilitação */}
              <div className="dim-card">
                <div className="dim-head">
                  <span className="dim-name">2. Habilitação & Acervo</span>
                  <span className="dim-weight">Peso: {decisionData.dimensions.capacidadeHabilitacao.weight}%</span>
                </div>
                <div className="dim-score-row">
                  <span className="dim-val">{decisionData.dimensions.capacidadeHabilitacao.score}%</span>
                  <span className="dim-pts mono">+{decisionData.dimensions.capacidadeHabilitacao.weightedPoints.toFixed(1)} pts</span>
                </div>
                <div className="dim-bar">
                  <div className="dim-fill" style={{ width: `${decisionData.dimensions.capacidadeHabilitacao.score}%` }} />
                </div>
                <p className="dim-note">Atestados, ARTs, RT e Certidões</p>
              </div>

              {/* Dimensão 3: Viabilidade Comercial */}
              <div className="dim-card">
                <div className="dim-head">
                  <span className="dim-name">3. Viabilidade Comercial</span>
                  <span className="dim-weight">Peso: {decisionData.dimensions.viabilidadeComercial.weight}%</span>
                </div>
                <div className="dim-score-row">
                  <span className="dim-val">{decisionData.dimensions.viabilidadeComercial.score}%</span>
                  <span className="dim-pts mono">+{decisionData.dimensions.viabilidadeComercial.weightedPoints.toFixed(1)} pts</span>
                </div>
                <div className="dim-bar">
                  <div className="dim-fill" style={{ width: `${decisionData.dimensions.viabilidadeComercial.score}%` }} />
                </div>
                <p className="dim-note">Margem esperada e fluxo</p>
              </div>

              {/* Dimensão 4: Risco */}
              <div className="dim-card">
                <div className="dim-head">
                  <span className="dim-name">4. Controle de Risco</span>
                  <span className="dim-weight">Peso: {decisionData.dimensions.risco.weight}%</span>
                </div>
                <div className="dim-score-row">
                  <span className="dim-val">{decisionData.dimensions.risco.score}%</span>
                  <span className="dim-pts mono">+{decisionData.dimensions.risco.weightedPoints.toFixed(1)} pts</span>
                </div>
                <div className="dim-bar">
                  <div className="dim-fill" style={{ width: `${decisionData.dimensions.risco.score}%` }} />
                </div>
                <p className="dim-note">Inverso do Risk Score ({decisionData.dimensions.risco.riskScore}%)</p>
              </div>

              {/* Dimensão 5: Prazo */}
              <div className="dim-card">
                <div className="dim-head">
                  <span className="dim-name">5. Prazo Hábil</span>
                  <span className="dim-weight">Peso: {decisionData.dimensions.prazo.weight}%</span>
                </div>
                <div className="dim-score-row">
                  <span className="dim-val">{decisionData.dimensions.prazo.score}%</span>
                  <span className="dim-pts mono">+{decisionData.dimensions.prazo.weightedPoints.toFixed(1)} pts</span>
                </div>
                <div className="dim-bar">
                  <div className="dim-fill" style={{ width: `${decisionData.dimensions.prazo.score}%` }} />
                </div>
                <p className="dim-note">Restam {decisionData.dimensions.prazo.daysLeft} dias para acolhimento</p>
              </div>

              {/* Dimensão 6: Interesse Estratégico */}
              <div className="dim-card">
                <div className="dim-head">
                  <span className="dim-name">6. Interesse Estratégico</span>
                  <span className="dim-weight">Peso: {decisionData.dimensions.interesseEstrategico.weight}%</span>
                </div>
                <div className="dim-score-row">
                  <span className="dim-val">{decisionData.dimensions.interesseEstrategico.score}%</span>
                  <span className="dim-pts mono">+{decisionData.dimensions.interesseEstrategico.weightedPoints.toFixed(1)} pts</span>
                </div>
                <div className="dim-bar">
                  <div className="dim-fill" style={{ width: `${decisionData.dimensions.interesseEstrategico.score}%` }} />
                </div>
                <p className="dim-note">{decisionData.dimensions.interesseEstrategico.details.tier}</p>
              </div>
            </div>
          </div>

          {/* DELIBERAÇÃO HUMANA OBRIGATÓRIA (Itens 6, 38, 39, 44, 45) */}
          <div className="section-card human-decision-card">
            <div className="card-top-title">
              <Briefcase size={16} />
              <h4>Deliberação da Equipe Comercial (Decisão Humana Soberana)</h4>
            </div>
            <p className="section-subtitle">
              O Vellia emite a recomendação algorítmica, mas a formalização de participação é prerrogativa dos diretores e gerentes comerciais.
            </p>

            {feedbackMsg && (
              <div className="feedback-alert-banner">
                <CheckCircle2 size={16} />
                <span>{feedbackMsg}</span>
              </div>
            )}

            <div className="human-action-form">
              <div className="form-row-author">
                <div className="author-field">
                  <label>Responsável pela Decisão:</label>
                  <input 
                    type="text" 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="author-input"
                  />
                </div>
                <div className="author-field full">
                  <label>Justificativa Formal / Diretriz da Decisão:</label>
                  <input 
                    type="text" 
                    placeholder="Descreva a justificativa estratégica, sinergia operacional ou ressalvas..." 
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    className="notes-input"
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="decision-buttons-group">
                <button 
                  className={`btn-action-decision btn-approve-go ${currentDecision === 'GO' ? 'active' : ''}`}
                  onClick={() => handleRegisterDecision('GO')}
                >
                  <CheckCircle2 size={16} />
                  <span>APROVAR GO (Participar)</span>
                </button>

                <button 
                  className={`btn-action-decision btn-approve-nogo ${currentDecision === 'NO-GO' ? 'active' : ''}`}
                  onClick={() => handleRegisterDecision('NO-GO')}
                >
                  <XCircle size={16} />
                  <span>APROVAR NO-GO (Descartar)</span>
                </button>

                <button 
                  className={`btn-action-decision btn-keep-review ${currentDecision === 'EM_ANALISE' ? 'active' : ''}`}
                  onClick={() => handleRegisterDecision('EM_ANALISE')}
                >
                  <HelpCircle size={16} />
                  <span>MANTER EM ANÁLISE</span>
                </button>
              </div>

              {/* FASE 11: CONVERSÃO DE OPORTUNIDADE GO EM PROPOSTA */}
              {(currentDecision === 'GO' || decisionData.recommendationTier.includes('GO')) && (
                <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button 
                    onClick={handleOpenOrCreateProposal}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.6rem',
                      backgroundColor: '#00E5C9',
                      color: '#061124',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0, 229, 201, 0.3)'
                    }}
                  >
                    <FileSpreadsheet size={16} />
                    <span>{existingProposal ? `Abrir Proposta Existente (${existingProposal.id})` : 'Criar Proposta a partir deste GO (Fase 11)'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Histórico e Trilha Imutável de Decisões (Itens 44 e 45) */}
            {humanDecision?.history && humanDecision.history.length > 0 && (
              <div className="decision-history-block">
                <h5>Linha do Tempo de Decisões & Alterações</h5>
                <div className="history-timeline">
                  {humanDecision.history.map((h, i) => (
                    <div key={h.id || i} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="tl-head">
                          <span className={`tl-decision-badge badge-${h.decision.toLowerCase()}`}>
                            {h.decision}
                          </span>
                          <span className="tl-date">{h.date}</span>
                          <span className="tl-author">por {h.author}</span>
                        </div>
                        <p className="tl-justificativa">{h.justificativa}</p>
                        {h.noGoReason && (
                          <span className="tl-nogo-reason">
                            Motivo do descarte: <strong>{h.noGoReason}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAINEL 2: MATRIZ DE RISCO 5x5 & TOP 5 (Itens 7 a 16) */}
      {activeSubTab === 'risk-matrix' && (
        <div className="decision-tab-pane">
          <div className="risk-overview-row">
            <div className="risk-stat-card">
              <span className="stat-label">Risk Score Global</span>
              <div className="stat-value-group">
                <span className={`stat-number ${decisionData.risks.riskTierClass}`}>
                  {decisionData.risks.riskScore}%
                </span>
                <span className={`stat-badge ${decisionData.risks.riskTierClass}`}>
                  {decisionData.risks.riskTier}
                </span>
              </div>
              <p className="stat-desc">Índice consolidado de exposição a riscos técnicos e operacionais.</p>
            </div>

            <div className="risk-stat-card">
              <span className="stat-label">Esforço Operacional Estimado</span>
              <div className="stat-value-group">
                <span className="stat-number text-teal">{decisionData.operationalEffort}</span>
              </div>
              <p className="stat-desc">Considera mobilização, equipes em campo, equipamentos e normas de SST.</p>
            </div>

            <div className="risk-stat-card">
              <span className="stat-label">Total de Riscos Mapeados</span>
              <div className="stat-value-group">
                <span className="stat-number">{decisionData.risks.risks.length}</span>
                <span className="stat-badge text-blue">Monitorados</span>
              </div>
              <p className="stat-desc">Todos com responsável designado e plano de mitigação.</p>
            </div>
          </div>

          {/* HEATMAP 5x5 CLEAN (Item 14) */}
          <div className="section-card">
            <div className="card-top-title">
              <Flame size={16} />
              <h4>Heatmap 5x5: Probabilidade × Impacto</h4>
            </div>
            <p className="section-subtitle">
              Distribuição visual dos riscos identificados na oportunidade. Cores indicam o nível de severidade (1 a 25).
            </p>

            <div className="heatmap-container">
              <div className="heatmap-y-label">PROBABILIDADE (1 a 5)</div>
              <div className="heatmap-grid-5x5">
                {[5, 4, 3, 2, 1].map(prob => (
                  <div key={prob} className="heatmap-row">
                    <span className="prob-label">{prob}</span>
                    {[1, 2, 3, 4, 5].map(imp => {
                      const score = prob * imp;
                      let cellClass = 'cell-low';
                      if (score >= 17) cellClass = 'cell-critical';
                      else if (score >= 10) cellClass = 'cell-high';
                      else if (score >= 5) cellClass = 'cell-moderate';

                      const matching = decisionData.risks.risks.filter(r => r.probabilidade === prob && r.impacto === imp);

                      return (
                        <div key={imp} className={`heatmap-cell ${cellClass}`}>
                          <span className="cell-score-num">{score}</span>
                          {matching.length > 0 && (
                            <div className="cell-risk-chips">
                              {matching.map(r => (
                                <span key={r.id} className="risk-chip" title={`${r.title} (${r.classification})`}>
                                  {r.category.substring(0, 3)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div className="heatmap-x-labels-row">
                  <span />
                  <span>1 (Insignif.)</span>
                  <span>2 (Baixo)</span>
                  <span>3 (Moderado)</span>
                  <span>4 (Alto)</span>
                  <span>5 (Crítico)</span>
                </div>
                <div className="heatmap-x-main-label">IMPACTO (1 a 5)</div>
              </div>
            </div>
          </div>

          {/* TOP 5 RISCOS PRINCIPAIS (Item 15) */}
          <div className="section-card">
            <div className="card-top-title">
              <AlertTriangle size={16} />
              <h4>Top 5 Principais Riscos & Planos de Mitigação</h4>
            </div>
            <div className="top-risks-table-wrap">
              <table className="clean-decision-table">
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Risco Identificado</th>
                    <th>P × I</th>
                    <th>Criticidade</th>
                    <th>Responsável</th>
                    <th>Plano de Ação Mitigador</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {decisionData.risks.top5.map((r, i) => (
                    <tr key={r.id || i}>
                      <td><span className="category-tag">{r.category}</span></td>
                      <td className="risk-title-col">
                        <strong>{r.title}</strong>
                        <p>{r.description}</p>
                      </td>
                      <td className="mono">{r.probabilidade} × {r.impacto} = {r.score}</td>
                      <td>
                        <span className={`risk-pill ${r.badgeClass}`}>
                          {r.classification}
                        </span>
                      </td>
                      <td>{r.responsavel}</td>
                      <td className="action-plan-col">{r.planoAcao}</td>
                      <td><span className="status-dot-text">{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL 3: VIABILIDADE COMERCIAL & 3 CENÁRIOS (Itens 17 a 23) */}
      {activeSubTab === 'commercial' && (
        <div className="decision-tab-pane">
          {/* Dados Contratuais Gerais */}
          <div className="section-card">
            <div className="card-top-title">
              <DollarSign size={16} />
              <h4>Premissas Contratuais & Viabilidade Econômica</h4>
            </div>
            
            <div className="commercial-meta-grid">
              <div className="c-meta-card">
                <span className="c-lbl">Valor Estimado do Contrato</span>
                <span className="c-val text-teal">{decisionData.commercial.valorEstimadoFormatado}</span>
              </div>
              <div className="c-meta-card">
                <span className="c-lbl">Prazo Contratual</span>
                <span className="c-val">{decisionData.commercial.prazoContratual}</span>
              </div>
              <div className="c-meta-card">
                <span className="c-lbl">Garantia Exigida</span>
                <span className="c-val">{decisionData.commercial.garantiaExigida}</span>
              </div>
              <div className="c-meta-card">
                <span className="c-lbl">Forma & Prazo de Pagamento</span>
                <span className="c-val">{decisionData.commercial.formaPagamento}</span>
              </div>
            </div>
          </div>

          {/* SIMULAÇÃO DE 3 CENÁRIOS (Itens 20, 21, 22) */}
          {decisionData.commercial.temValorDefinido ? (
            <div className="section-card">
              <div className="card-top-title">
                <TrendingUp size={16} />
                <h4>Simulação de Resultados: 3 Cenários (Conservador, Provável, Otimista)</h4>
              </div>
              <p className="section-subtitle">
                Cálculo de custos diretos (técnicos, laboratoriais, equipe, mobilização) e margens brutas.
              </p>

              <div className="scenarios-grid">
                {/* Cenário Conservador */}
                <div className="scenario-card conservative">
                  <div className="sc-header">
                    <span className="sc-badge">Cenário Conservador</span>
                    <span className="sc-desc">Custos +8% / Incertezas</span>
                  </div>
                  <div className="sc-metric">
                    <span className="sc-lbl">Receita Estimada:</span>
                    <span className="sc-val">{decisionData.commercial.valorEstimadoFormatado}</span>
                  </div>
                  <div className="sc-metric">
                    <span className="sc-lbl">Custo Total Projetado:</span>
                    <span className="sc-val text-amber">{decisionData.commercial.cenarioConservador.custoFormatado}</span>
                  </div>
                  <div className="sc-divider" />
                  <div className="sc-margin-block">
                    <span className="margin-lbl">Margem Bruta Estimada:</span>
                    <div className="margin-val-row">
                      <span className="margin-pct">{decisionData.commercial.cenarioConservador.margemPercentual}%</span>
                      <span className="margin-rs mono">({decisionData.commercial.cenarioConservador.margemFormatada})</span>
                    </div>
                  </div>
                </div>

                {/* Cenário Provável */}
                <div className="scenario-card probable featured">
                  <div className="sc-header">
                    <span className="sc-badge featured-badge">Cenário Provável (Base)</span>
                    <span className="sc-desc">Execução Padrão Vellia</span>
                  </div>
                  <div className="sc-metric">
                    <span className="sc-lbl">Receita Estimada:</span>
                    <span className="sc-val">{decisionData.commercial.valorEstimadoFormatado}</span>
                  </div>
                  <div className="sc-metric">
                    <span className="sc-lbl">Custo Total Projetado:</span>
                    <span className="sc-val text-blue">{decisionData.commercial.cenarioProvavel.custoFormatado}</span>
                  </div>
                  <div className="sc-divider" />
                  <div className="sc-margin-block">
                    <span className="margin-lbl">Margem Bruta Estimada:</span>
                    <div className="margin-val-row">
                      <span className="margin-pct text-teal">{decisionData.commercial.cenarioProvavel.margemPercentual}%</span>
                      <span className="margin-rs mono">({decisionData.commercial.cenarioProvavel.margemFormatada})</span>
                    </div>
                  </div>
                </div>

                {/* Cenário Otimista */}
                <div className="scenario-card optimistic">
                  <div className="sc-header">
                    <span className="sc-badge">Cenário Otimista</span>
                    <span className="sc-desc">Otimização Logística & Escala</span>
                  </div>
                  <div className="sc-metric">
                    <span className="sc-lbl">Receita Estimada:</span>
                    <span className="sc-val">{decisionData.commercial.valorEstimadoFormatado}</span>
                  </div>
                  <div className="sc-metric">
                    <span className="sc-lbl">Custo Total Projetado:</span>
                    <span className="sc-val text-green">{decisionData.commercial.cenarioOtimista.custoFormatado}</span>
                  </div>
                  <div className="sc-divider" />
                  <div className="sc-margin-block">
                    <span className="margin-lbl">Margem Bruta Estimada:</span>
                    <div className="margin-val-row">
                      <span className="margin-pct text-green">{decisionData.commercial.cenarioOtimista.margemPercentual}%</span>
                      <span className="margin-rs mono">({decisionData.commercial.cenarioOtimista.margemFormatada})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalhamento de Custos Diretos e Tributos */}
              <div className="costs-breakdown-box">
                <h5>Composição Estimada dos Custos Diretos & Tributários</h5>
                <div className="costs-pills-row">
                  <span className="c-pill">Equipe Técnica: {(decisionData.commercial.custosDetalhados.custosEquipe/1000).toFixed(0)}k</span>
                  <span className="c-pill">Engenharia: {(decisionData.commercial.custosDetalhados.custosTecnicos/1000).toFixed(0)}k</span>
                  <span className="c-pill">Laboratórios: {(decisionData.commercial.custosDetalhados.custosLaboratoriais/1000).toFixed(0)}k</span>
                  <span className="c-pill">Equipamentos: {(decisionData.commercial.custosDetalhados.equipamentos/1000).toFixed(0)}k</span>
                  <span className="c-pill">Mobilização/Viagens: {((decisionData.commercial.custosDetalhados.mobilizacao + decisionData.commercial.custosDetalhados.custosViagem)/1000).toFixed(0)}k</span>
                  <span className="c-pill">Tributos Federais/Municipais: {(decisionData.commercial.custosDetalhados.tributos/1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="section-card not-available-card">
              <Info size={18} className="text-blue" />
              <div>
                <strong>Valor Referencial não Publicado no Edital</strong>
                <p>O órgão licitante não divulgou o orçamento estimado em sessão pública. A análise comercial foi baseada nos aspectos qualitativos de escopo e frequência.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAINEL 4: GO/NO-GO CHECKLIST & PENDÊNCIAS (Itens 34 e 35) */}
      {activeSubTab === 'checklist' && (
        <div className="decision-tab-pane">
          {/* Checklist de 10 Itens */}
          <div className="section-card">
            <div className="card-top-title">
              <CheckCircle2 size={16} />
              <h4>GO/NO-GO Checklist: 10 Verificações Pré-Edital</h4>
            </div>
            <div className="checklist-10-items-grid">
              {decisionData.checklist.map((c, i) => (
                <div key={c.id || i} className={`chk-item-card ${c.checked ? 'chk-pass' : 'chk-alert'}`}>
                  <div className="chk-icon-wrap">
                    {c.checked ? <CheckCircle2 size={18} className="text-green" /> : <AlertTriangle size={18} className="text-amber" />}
                  </div>
                  <div className="chk-text-content">
                    <span className="chk-num">Item #{i + 1}</span>
                    <strong className="chk-label">{c.item}</strong>
                    <span className="chk-status">{c.checked ? 'Validado / Atendido' : 'Atenção / Verificar com Engenharia'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* O QUE FALTA PARA APROVAR? (Item 35) */}
          <div className="section-card">
            <div className="card-top-title">
              <Clock size={16} />
              <h4>O que falta para aprovar? (Pendências Críticas para o GO)</h4>
            </div>
            <div className="pending-to-approve-list">
              {decisionData.pendingItemsToApprove.map(p => (
                <div key={p.id} className="pending-approve-row">
                  <div className="p-info">
                    <strong>{p.title}</strong>
                    <span className="p-resp">Responsável: {p.responsavel}</span>
                  </div>
                  <span className={`p-status-pill status-${p.status.toLowerCase().replace(' ', '-')}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE JUSTIFICATIVA OBRIGATÓRIA PARA NO-GO (Item 39) */}
      {showNoGoModal && (
        <div className="nogo-modal-backdrop">
          <div className="nogo-modal-dialog">
            <div className="nogo-modal-head">
              <XCircle size={20} className="text-red" />
              <h3>Registro de Motivo do Descarte (NO-GO)</h3>
            </div>
            <p className="nogo-modal-desc">
              Para alimentar a inteligência de aprendizado da plataforma e os relatórios estatísticos, selecione a causa raiz do descarte:
            </p>

            <div className="nogo-select-group">
              <label>Motivo Padronizado:</label>
              <select 
                value={selectedNoGoReason} 
                onChange={(e) => setSelectedNoGoReason(e.target.value)}
                className="nogo-select"
              >
                {Object.values(NoGoReason).map((reason, idx) => (
                  <option key={idx} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="nogo-notes-group">
              <label>Observações Adicionais:</label>
              <textarea 
                rows={3} 
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Insira detalhes adicionais para a ata comercial..."
                className="nogo-textarea"
              />
            </div>

            <div className="nogo-modal-actions">
              <button className="btn-cancel" onClick={() => setShowNoGoModal(false)}>
                Cancelar
              </button>
              <button className="btn-confirm-nogo" onClick={handleConfirmNoGo}>
                Confirmar NO-GO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DA CENTRAL OPERACIONAL DE PROPOSTA (FASE 11) */}
      {activeProposalId && (
        <ProposalDetailView 
          proposalId={activeProposalId}
          onClose={() => setActiveProposalId(null)}
          onUpdated={() => {
            if (onDecisionUpdated) onDecisionUpdated();
          }}
        />
      )}
    </div>
  );
}
