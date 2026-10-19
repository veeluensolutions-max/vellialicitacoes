import React, { useState, useEffect } from 'react';
import {
  Target,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  Layers,
  FileText,
  Bot,
  Building2,
  RefreshCw,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Filter,
  DollarSign,
  Send,
  Zap
} from 'lucide-react';
import {
  MaturityBenchmarkService,
  MaturityModelVersion,
  MaturityDimension,
  DIMENSION_LABELS,
  MaturityLevel,
  ActionPriority
} from '../../services/maturity/maturityBenchmarkService.js';
import './MaturityBenchmarkView.css';

export function MaturityBenchmarkView({ onNavigate = null }) {
  const [selectedCompany, setSelectedCompany] = useState('Veeluen Solutions');
  const [selectedPeriod, setSelectedPeriod] = useState('Q4-2026');
  const [activeTab, setActiveTab] = useState('executiva');
  const [assessment, setAssessment] = useState(null);
  const [internalBenchmark, setInternalBenchmark] = useState(null);
  const [groupBenchmark, setGroupBenchmark] = useState(null);

  // Copilot state
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotHistory, setCopilotHistory] = useState([
    {
      q: 'Em quais áreas nosso processo está mais maduro?',
      a: 'Nossas áreas mais maduras são Documentação & Certidões (Nível 4 - 92% com validade cadastrada), Identificação de Oportunidades (Nível 4 - 94.2% de precisão no Radar) e Governança & Alçadas (Nível 4 - 100% de decisões Go/No-Go formalizadas).',
      evidence: 'Dados auditados em 148 certames do Q4-2026 com zero certidões vencidas em certame.'
    }
  ]);

  const loadData = () => {
    const asm = MaturityBenchmarkService.getMaturityAssessment(selectedCompany, selectedPeriod);
    setAssessment(asm);
    const bm = MaturityBenchmarkService.getInternalBenchmark(selectedCompany);
    setInternalBenchmark(bm);
    const grp = MaturityBenchmarkService.getGroupBenchmark();
    setGroupBenchmark(grp);
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany, selectedPeriod]);

  const handleAskCopilot = (e) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;

    const res = MaturityBenchmarkService.askMaturityCopilot(copilotQuery.trim());
    setCopilotHistory(prev => [
      ...prev,
      {
        q: copilotQuery.trim(),
        a: res.answer,
        evidence: res.evidence,
        confidence: res.confidence
      }
    ]);
    setCopilotQuery('');
  };

  const handleQuickQuestion = (qText) => {
    const res = MaturityBenchmarkService.askMaturityCopilot(qText);
    setCopilotHistory(prev => [
      ...prev,
      {
        q: qText,
        a: res.answer,
        evidence: res.evidence,
        confidence: res.confidence
      }
    ]);
  };

  return (
    <div className="maturity-container">
      {/* Header Executivo da Fase 53 */}
      <div className="maturity-header">
        <div className="header-left">
          <div className="maturity-badges-row">
            <span className="mat-badge version">{MaturityModelVersion}</span>
            <span className="mat-badge rule">Evidence-First: Zero Notas Fictícias</span>
            <span className="mat-badge coverage">Cobertura de Dados: {assessment?.averageCoveragePct}%</span>
          </div>
          <h1 className="maturity-title">Maturidade do Processo & Benchmark Interno</h1>
          <p className="maturity-subtitle">
            Diagnóstico objetivo de capacidades reais de licitação, comparação contra períodos históricos da própria empresa e identificação de gaps estratégicos.
          </p>
        </div>

        <div className="header-right">
          <div className="company-period-selectors">
            <div className="selector-group">
              <label>Empresa Avaliada:</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="maturity-select"
              >
                <option value="Veeluen Solutions">Veeluen Solutions (Saneamento & Engenharia)</option>
                <option value="Excelência Ambiental">Excelência Ambiental (Consultoria & Emissões)</option>
              </select>
            </div>
            <div className="selector-group">
              <label>Período / Snapshot:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="maturity-select"
              >
                <option value="Q4-2026">Q4-2026 (Período Atual)</option>
                <option value="Q3-2026">Q3-2026 (Trimestre Anterior)</option>
              </select>
            </div>
            <button className="btn-refresh-maturity" onClick={loadData} title="Recalcular com dados frescos">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Navegação entre Abas do Módulo */}
      <div className="maturity-tabs-bar">
        <button
          className={`mat-tab-btn ${activeTab === 'executiva' ? 'active' : ''}`}
          onClick={() => setActiveTab('executiva')}
        >
          <Target size={14} />
          <span>Visão Executiva (3 Fortalezas • 3 Gaps • 3 Prioridades)</span>
        </button>
        <button
          className={`mat-tab-btn ${activeTab === 'matriz' ? 'active' : ''}`}
          onClick={() => setActiveTab('matriz')}
        >
          <Layers size={14} />
          <span>Matriz de Maturidade (12 Dimensões)</span>
        </button>
        <button
          className={`mat-tab-btn ${activeTab === 'benchmark-interno' ? 'active' : ''}`}
          onClick={() => setActiveTab('benchmark-interno')}
        >
          <TrendingUp size={14} />
          <span>Benchmark Interno & Velocidade P50/P90</span>
        </button>
        <button
          className={`mat-tab-btn ${activeTab === 'grupo' ? 'active' : ''}`}
          onClick={() => setActiveTab('grupo')}
        >
          <Building2 size={14} />
          <span>Comparativo de Grupo (Veeluen vs Excelência)</span>
        </button>
        <button
          className={`mat-tab-btn ${activeTab === 'plano-acao' ? 'active' : ''}`}
          onClick={() => setActiveTab('plano-acao')}
        >
          <FileText size={14} />
          <span>Plano de Ação de Maturidade</span>
        </button>
        <button
          className={`mat-tab-btn ${activeTab === 'copilot' ? 'active' : ''}`}
          onClick={() => setActiveTab('copilot')}
        >
          <Bot size={14} />
          <span>Maturity Copilot Q&A</span>
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="maturity-content-area">
        {/* ========================================================= */}
        {/* SUBTAB 1: VISÃO EXECUTIVA (Item 95: 3 Fortalezas, 3 Gaps, 3 Prioridades) */}
        {/* ========================================================= */}
        {activeTab === 'executiva' && assessment && (
          <div className="mat-pane">
            {/* Banner de Diagnóstico Executivo Geral */}
            <div className="exec-diagnosis-banner">
              <div className="diag-left">
                <span className="diag-kicker">Diagnóstico Consolidado • {selectedCompany}</span>
                <div className="diag-level-row">
                  <span className="diag-level-badge">Nível {assessment.overallLevel.level} — {assessment.overallLevel.name}</span>
                  <span className="diag-coverage-pill">Cobertura Real: {assessment.averageCoveragePct}%</span>
                </div>
                <p className="diag-statement">{assessment.overallDiagnosis}</p>
              </div>
              <div className="diag-right">
                <div className="mini-rule-box">
                  <strong>Piso Crítico de Processo (Critical Floor):</strong>
                  <p>
                    A classificação global reflete o equilíbrio real. Fraquezas em dimensões vitais de sustentação impedem classificações otimizadas artificiais.
                  </p>
                </div>
              </div>
            </div>

            {/* Grid dos 3 Pilares Executivos: 3 Fortalezas, 3 Gaps, 3 Prioridades */}
            <div className="triad-grid">
              {/* Card 1: 3 Fortalezas */}
              <div className="triad-card strengths">
                <div className="triad-header">
                  <CheckCircle2 size={18} className="icon-green" />
                  <h3>Principais Fortalezas</h3>
                </div>
                <p className="triad-sub">Áreas com processos maduros, padronizados e com histórico confiável.</p>
                <div className="triad-list">
                  {assessment.executiveSummary.strengths.map((s, idx) => (
                    <div key={idx} className="triad-item">
                      <div className="triad-item-title">
                        <span className="item-bullet green">✓</span>
                        <strong>{s.dimension}</strong>
                      </div>
                      <p className="item-detail">{s.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: 3 Gaps */}
              <div className="triad-card gaps">
                <div className="triad-header">
                  <AlertTriangle size={18} className="icon-amber" />
                  <h3>Principais Gaps Observados</h3>
                </div>
                <p className="triad-sub">Pontos de fricção ou baixa cobertura de dados que exigem atenção.</p>
                <div className="triad-list">
                  {assessment.executiveSummary.gaps.map((g, idx) => (
                    <div key={idx} className="triad-item">
                      <div className="triad-item-title">
                        <span className="item-bullet amber">!</span>
                        <strong>{g.dimension}</strong>
                      </div>
                      <p className="item-detail">{g.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: 3 Prioridades */}
              <div className="triad-card priorities">
                <div className="triad-header">
                  <Sparkles size={18} className="icon-blue" />
                  <h3>Prioridades de Maior Impacto</h3>
                </div>
                <p className="triad-sub">Ações específicas que destravarão o próximo nível de maturidade.</p>
                <div className="triad-list">
                  {assessment.executiveSummary.priorities.map((p, idx) => (
                    <div key={idx} className="triad-item">
                      <div className="triad-item-title">
                        <span className="item-bullet blue">→</span>
                        <strong>{p.action}</strong>
                      </div>
                      <p className="item-detail impact-pill">{p.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 2: MATRIZ DE MATURIDADE (12 Dimensões x Níveis 1 a 5) */}
        {/* ========================================================= */}
        {activeTab === 'matriz' && assessment && (
          <div className="mat-pane">
            <div className="mat-card">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Matriz Completa de Maturidade por Dimensão</h3>
                  <p className="card-desc">
                    Avaliação detalhada com evidências reais, cobertura e critérios para o próximo nível. Não há notas artificiais: onde não há dados, classifica-se como "Dados Insuficientes".
                  </p>
                </div>
                <div className="levels-legend">
                  <span className="lvl-badge lvl-1">1: Reativo</span>
                  <span className="lvl-badge lvl-2">2: Estruturado</span>
                  <span className="lvl-badge lvl-3">3: Controlado</span>
                  <span className="lvl-badge lvl-4">4: Inteligente</span>
                  <span className="lvl-badge lvl-5">5: Otimizado</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="maturity-matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '22%' }}>Dimensão do Processo</th>
                      <th style={{ width: '12%' }}>Nível Atual</th>
                      <th style={{ width: '10%' }}>Cobertura</th>
                      <th style={{ width: '32%' }}>Evidências Auditadas</th>
                      <th style={{ width: '24%' }}>Próximo Passo / Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.dimensions.map((dim) => {
                      const label = DIMENSION_LABELS[dim.dimension] || dim.dimension;
                      return (
                        <tr key={dim.dimension} className={`row-lvl-${dim.level}`}>
                          <td>
                            <strong>{label}</strong>
                            <span className="dim-status-tag">{dim.statusLabel}</span>
                          </td>
                          <td>
                            <div className={`level-pill lvl-${dim.level}`}>
                              <span className="lvl-num">N{dim.level}</span>
                              <span className="lvl-text">{dim.levelName}</span>
                            </div>
                          </td>
                          <td>
                            <div className="coverage-bar-container">
                              <span className="cov-pct">{dim.coveragePct}%</span>
                              <div className="cov-bar">
                                <div className="cov-fill" style={{ width: `${dim.coveragePct}%` }} />
                              </div>
                            </div>
                          </td>
                          <td>
                            <ul className="evidence-list-table">
                              {dim.evidence.map((ev, eIdx) => (
                                <li key={eIdx}>{ev}</li>
                              ))}
                            </ul>
                          </td>
                          <td>
                            <div className="gap-box">
                              <strong>Gap:</strong> {dim.gap}
                              <div className="next-criteria">
                                <em>{dim.nextLevelCriteria}</em>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 3: BENCHMARK INTERNO & VELOCIDADE (P50/P90)         */}
        {/* ========================================================= */}
        {activeTab === 'benchmark-interno' && internalBenchmark && (
          <div className="mat-pane">
            {/* Comparação Histórica contra si mesma */}
            <div className="mat-card">
              <h3 className="card-title">Benchmark Interno: Evolução Temporal da Empresa</h3>
              <p className="card-desc">
                Regra de Ouro: Não comparamos com "médias inventadas de mercado". Comparamos a empresa contra seus próprios marcos históricos auditados.
              </p>

              <div className="periods-benchmark-grid">
                {internalBenchmark.periodsComparison.map((p, idx) => (
                  <div key={idx} className={`period-benchmark-card ${idx === 0 ? 'current-period' : ''}`}>
                    <div className="pbc-header">
                      <strong>{p.period}</strong>
                      {idx === 0 && <span className="pbc-current-tag">Atual</span>}
                    </div>
                    <div className="pbc-metrics">
                      <div className="pbc-m-item">
                        <span className="lbl">Maturidade Média</span>
                        <span className="val text-teal">Nível {p.overallLevel}</span>
                      </div>
                      <div className="pbc-m-item">
                        <span className="lbl">Tempo Go/No-Go (P50)</span>
                        <span className="val">{p.avgTimeToDecisionHours}h</span>
                      </div>
                      <div className="pbc-m-item">
                        <span className="lbl">Tempo Proposta (P50)</span>
                        <span className="val">{p.avgTimeToProposalHours}h</span>
                      </div>
                      <div className="pbc-m-item">
                        <span className="lbl">Precisão Radar</span>
                        <span className="val text-teal">{p.radarPrecisionPct}%</span>
                      </div>
                      <div className="pbc-m-item">
                        <span className="lbl">Taxa de Retrabalho</span>
                        <span className="val text-amber">{p.reworkRatePct}%</span>
                      </div>
                      <div className="pbc-m-item">
                        <span className="lbl">Blocker Recall</span>
                        <span className="val text-teal">{p.blockerRecallPct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Velocidade de Processo (Process Velocity P50 e P90) */}
            <div className="two-columns-grid">
              <div className="mat-card">
                <h3 className="card-title">Velocidade do Processo (Tempos P50 e P90)</h3>
                <p className="card-desc">
                  Mede a agilidade do fluxo interno entre cada estágio do certame.
                </p>

                <div className="velocity-list">
                  {Object.entries(internalBenchmark.processVelocity).map(([k, v]) => {
                    const labelMap = {
                      opportunityToQualification: 'Oportunidade Captada → Qualificação',
                      qualificationToGoDecision: 'Qualificação → Decisão Go/No-Go',
                      goDecisionToProposal: 'Decisão GO → Proposta Concluída',
                      proposalToSubmission: 'Proposta Pronta → Submissão / Pregão'
                    };
                    return (
                      <div key={k} className="velocity-item">
                        <div className="vi-header">
                          <strong>{labelMap[k] || k}</strong>
                          <span className="vi-trend text-green">{v.trend}</span>
                        </div>
                        <div className="vi-stats">
                          <span>Mediana (P50): <strong>{v.p50Hours}h</strong></span>
                          <span>Percentil 90 (P90): <strong>{v.p90Hours}h</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Análise de Retrabalho (Rework Rate) */}
              <div className="mat-card">
                <h3 className="card-title">Indicador de Retrabalho (Rework Rate: {internalBenchmark.reworkAnalysis.overallReworkRatePct}%)</h3>
                <p className="card-desc">
                  Identifica propostas reabertas, planilhas refeitas ou dossiês revisados por categoria de causa.
                </p>

                <div className="rework-distribution-list">
                  {internalBenchmark.reworkAnalysis.sourcesDistribution.map((r, idx) => (
                    <div key={idx} className="rework-item">
                      <div className="rw-head">
                        <strong>{r.source}</strong>
                        <span className="rw-pct">{r.pct}%</span>
                      </div>
                      <p className="rw-detail">{r.detail}</p>
                      <div className="rw-bar-bg">
                        <div className="rw-bar-fill" style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 4: COMPARATIVO DE GRUPO (Veeluen vs Excelência)     */}
        {/* ========================================================= */}
        {activeTab === 'grupo' && groupBenchmark && (
          <div className="mat-pane">
            <div className="mat-card">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">{groupBenchmark.comparisonName}</h3>
                  <p className="card-desc">{groupBenchmark.objective}</p>
                </div>
                <span className="mat-badge version">Período: {groupBenchmark.period}</span>
              </div>

              <div className="two-columns-grid" style={{ marginTop: '16px' }}>
                {groupBenchmark.companies.map((c, idx) => (
                  <div key={idx} className="group-company-card">
                    <div className="gcc-header">
                      <Building2 size={18} className="gcc-icon" />
                      <div>
                        <h4>{c.companyId}</h4>
                        <span className="gcc-focus">{c.focusArea}</span>
                      </div>
                    </div>

                    <div className="gcc-body">
                      <div className="gcc-stat-row">
                        <span>Maturidade Consolidada:</span>
                        <strong>{c.averageMaturity}</strong>
                      </div>
                      <div className="gcc-stat-row">
                        <span>Tempo até Decisão (P50):</span>
                        <strong>{c.timeToDecisionP50}</strong>
                      </div>
                      <div className="gcc-stat-row">
                        <span>Precisão do Radar:</span>
                        <strong>{c.precisionRadar}</strong>
                      </div>

                      <div className="gcc-list-box green">
                        <strong>Fortalezas Distintas:</strong>
                        <ul>
                          {c.strengths.map((st, sIdx) => (
                            <li key={sIdx}>{st}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="gcc-list-box amber">
                        <strong>Oportunidade de Intercâmbio:</strong>
                        <ul>
                          {c.gapsToLearn.map((gp, gIdx) => (
                            <li key={gIdx}>{gp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sinergias Compartilhadas */}
              <div className="synergies-box">
                <h4>🤝 Sinergias Operacionais Homologadas entre as Empresas</h4>
                <ul>
                  {groupBenchmark.sharedSynergies.map((syn, idx) => (
                    <li key={idx}>{syn}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 5: PLANO DE AÇÃO DE MATURIDADE                      */}
        {/* ========================================================= */}
        {activeTab === 'plano-acao' && assessment && (
          <div className="mat-pane">
            <div className="mat-card">
              <h3 className="card-title">Plano Estruturado de Ações para Avanço de Nível</h3>
              <p className="card-desc">
                Diretriz: Recomendações específicas e mensuráveis no formato: Problema → Evidência → Ação → Owner → Data Alvo.
              </p>

              <div className="table-responsive">
                <table className="action-plan-table">
                  <thead>
                    <tr>
                      <th>Dimensão</th>
                      <th>Problema Observado</th>
                      <th>Evidência Real</th>
                      <th>Ação Recomendada</th>
                      <th>Responsável</th>
                      <th>Data Alvo</th>
                      <th>Impacto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assessment.dimensions.flatMap(d =>
                      d.recommendedActions.map((act, aIdx) => (
                        <tr key={`${d.dimension}-${aIdx}`}>
                          <td><strong>{DIMENSION_LABELS[d.dimension] || d.dimension}</strong></td>
                          <td>{act.problem}</td>
                          <td className="text-muted">{act.evidence}</td>
                          <td className="text-action"><strong>{act.action}</strong></td>
                          <td>{act.owner}</td>
                          <td>{act.targetDate}</td>
                          <td>
                            <span className={`priority-tag ${d.priority.toLowerCase()}`}>
                              {d.priority === ActionPriority.HIGH_IMPACT ? 'Alto Impacto' : d.priority === ActionPriority.STRATEGIC ? 'Estratégico' : 'Opcional'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBTAB 6: MATURITY COPILOT (Q&A Diagnóstico)               */}
        {/* ========================================================= */}
        {activeTab === 'copilot' && (
          <div className="mat-pane">
            <div className="mat-card copilot-container-card">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Maturity Copilot • Diagnóstico Consultivo</h3>
                  <p className="card-desc">
                    Tire dúvidas sobre os diagnósticos de maturidade. Toda resposta cita estritamente métricas e evidências reais da empresa.
                  </p>
                </div>
                <span className="mat-badge version">Ancoragem: Dados Reais Auditados</span>
              </div>

              {/* Botões de Perguntas Rápidas */}
              <div className="quick-questions-row">
                <button
                  type="button"
                  className="quick-q-btn"
                  onClick={() => handleQuickQuestion('Em quais áreas nosso processo está mais maduro?')}
                >
                  "Onde estamos mais maduros?"
                </button>
                <button
                  type="button"
                  className="quick-q-btn"
                  onClick={() => handleQuickQuestion('Quais são os maiores gaps de processo?')}
                >
                  "Onde estão os maiores gaps?"
                </button>
                <button
                  type="button"
                  className="quick-q-btn"
                  onClick={() => handleQuickQuestion('Por que a dimensão de Pricing está no nível 3?')}
                >
                  "Por que Pricing está no nível 3?"
                </button>
                <button
                  type="button"
                  className="quick-q-btn"
                  onClick={() => handleQuickQuestion('Qual ação deve receber prioridade número 1?')}
                >
                  "Qual é a prioridade número 1?"
                </button>
              </div>

              {/* Histórico de Chat do Copilot */}
              <div className="copilot-chat-thread">
                {copilotHistory.map((item, idx) => (
                  <div key={idx} className="copilot-chat-bubble">
                    <div className="chat-user-q">
                      <span className="chat-role">Você:</span>
                      <strong>{item.q}</strong>
                    </div>
                    <div className="chat-agent-a">
                      <div className="agent-avatar-tag">
                        <Bot size={14} />
                        <span>Maturity Agent</span>
                      </div>
                      <p className="agent-text">{item.a}</p>
                      {item.evidence && (
                        <div className="agent-evidence-box">
                          <span>Evidência Auditada:</span> {item.evidence}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form do Copilot */}
              <form onSubmit={handleAskCopilot} className="copilot-input-bar">
                <input
                  type="text"
                  placeholder="Pergunte sobre maturidade, prazos, gargalos ou pricing..."
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  className="copilot-input"
                />
                <button type="submit" className="btn-send-copilot">
                  <Send size={15} />
                  <span>Consultar</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaturityBenchmarkView;
