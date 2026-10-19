import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShieldAlert, Award, FileText, ArrowRight, CheckCircle2,
  AlertTriangle, DollarSign, Target, Calendar, Sparkles, HelpCircle,
  Maximize2, Minimize2, Download, Building, Users, Clock, AlertOctagon,
  ChevronRight, RefreshCw, BarChart3, Layers, Lightbulb, Compass, Zap
} from 'lucide-react';
import executiveCockpitService, { Timeframe } from '../../services/cockpit/executiveCockpitService';
import './ExecutiveCockpitView.css';

export default function ExecutiveCockpitView({ onNavigateToTab }) {
  const [selectedCompany, setSelectedCompany] = useState('all'); // all | veeluen | excelencia
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [cockpitData, setCockpitData] = useState(null);

  // Modais Executivos
  const [boardModeOpen, setBoardModeOpen] = useState(false);
  const [boardSlideIndex, setBoardSlideIndex] = useState(0);
  const [briefModalOpen, setBriefModalOpen] = useState(false);
  const [briefContent, setBriefContent] = useState(null);

  // Copilot Executivo
  const [copilotQuery, setCopilotQuery] = useState('O que precisa da minha decisão hoje?');
  const [copilotResponse, setCopilotResponse] = useState(null);

  const loadData = () => {
    const data = executiveCockpitService.getCockpitData(selectedCompany, selectedTimeframe, true);
    setCockpitData(data);
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany, selectedTimeframe]);

  if (!cockpitData) {
    return <div className="executive-cockpit-container"><p>Carregando Cockpit Executivo...</p></div>;
  }

  const { metrics, valueMovement, executiveSummaryInsights, whatChanged, pendingDecisions, topRisks, contractsSummary, recommendations, topOpportunities } = cockpitData;

  const handleOpenBrief = () => {
    const brief = executiveCockpitService.generateExecutiveBrief(selectedCompany);
    setBriefContent(brief);
    setBriefModalOpen(true);
  };

  const handleAskCopilot = (questionText) => {
    const q = questionText || copilotQuery;
    const ans = executiveCockpitService.askExecutiveCopilot(q, selectedCompany);
    setCopilotResponse(ans);
  };

  const navigateTabSafe = (tabId) => {
    if (onNavigateToTab && tabId) {
      onNavigateToTab(tabId);
    }
  };

  // Slides do Board Mode
  const boardSlides = [
    {
      title: '1. Visão Geral Estratégica',
      content: (
        <div className="flex-col gap-2">
          <h2>Pipeline Ponderado: R$ {(metrics.weightedPipeline / 1000000).toFixed(1)}M</h2>
          <p className="text-muted">Cobertura da Meta: {metrics.targetCoveragePct}% • Contratos Ativos: {metrics.activeContractsCount}</p>
          <div className="insights-chips-grid mt-3">
            {executiveSummaryInsights.map(i => (
              <div key={i.id} className="insight-chip-item">
                <span className={`insight-dot ${i.urgency.toLowerCase()}`}></span>
                <span>{i.text}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: '2. Pipeline & Concentração de Mercado',
      content: (
        <div className="flex-col gap-2">
          <h3>Top 3 Oportunidades: {metrics.top3ConcentrationPct}% do Pipeline Total</h3>
          <p className="text-muted">Comprador Principal ({metrics.topBuyer}): {metrics.topBuyerConcentrationPct}%</p>
          <div className="movement-stats-row mt-3">
            <div className="move-stat-item">
              <span className="move-stat-label">Novas Licitações</span>
              <span className="move-stat-val">+R$ {(valueMovement.newIdentified / 1000).toFixed(0)}k</span>
            </div>
            <div className="move-stat-item">
              <span className="move-stat-label">Vitórias Homologadas</span>
              <span className="move-stat-val text-success">R$ {(valueMovement.won / 1000).toFixed(0)}k</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '3. Decisões Críticas de Alçada',
      content: (
        <div className="flex-col gap-2 text-left">
          <h3>{pendingDecisions.length} Decisões Requerem Alçada da Diretoria</h3>
          {pendingDecisions.map(d => (
            <div key={d.id} className="executive-decision-item mt-2">
              <div className="dec-title">{d.title} — {d.entityTitle}</div>
              <div className="text-muted font-sm">{d.whyNow}</div>
              <div className="text-warning font-sm mt-1">Impacto: {d.impact}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: '4. Mapa de Riscos & Mitigações',
      content: (
        <div className="flex-col gap-2 text-left">
          <h3>Top Riscos em Monitoramento Ativo</h3>
          {topRisks.map(r => (
            <div key={r.id} className="risk-item-row mt-2">
              <div className="risk-title-bold">{r.title} ({r.category})</div>
              <div className="text-muted font-sm">{r.impact}</div>
              <div className="text-info font-sm">Mitigação: {r.mitigation} (Resp: {r.owner})</div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="executive-cockpit-container">
      {/* HEADER EXECUTIVO */}
      <header className="cockpit-header">
        <div className="cockpit-title-block">
          <div className="cockpit-tag-live">
            <Sparkles size={13} />
            EXECUTIVE COCKPIT 3.0 • FASE 60
          </div>
          <h1>
            <Award size={26} className="text-primary" />
            Cockpit Executivo & Strategic Command Center
          </h1>
          <p className="cockpit-subtitle">
            Gestão por Exceção. Concentre-se nas decisões, desvios de margem, riscos materiais e no valor real em movimento.
          </p>
        </div>

        <div className="cockpit-actions-bar">
          {/* SELETOR DE EMPRESA */}
          <div className="select-pill-group">
            <Building size={16} />
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              aria-label="Selecionar Empresa"
            >
              <option value="all">Visão Consolidada (Grupo)</option>
              <option value="veeluen">Veeluen Soluções (Matriz)</option>
              <option value="excelencia">Excelência Ambiental</option>
            </select>
          </div>

          {/* SELETOR DE TIMEFRAME */}
          <div className="select-pill-group">
            <Calendar size={16} />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              aria-label="Janela Temporal"
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
          </div>

          {/* BOTÃO BOARD MODE */}
          <button className="btn-board-mode" onClick={() => { setBoardSlideIndex(0); setBoardModeOpen(true); }}>
            <Maximize2 size={15} /> Board Mode (Apresentação)
          </button>

          {/* BOTÃO GERAR BRIEF */}
          <button className="btn-generate-brief" onClick={handleOpenBrief}>
            <FileText size={15} /> Gerar Brief Executivo
          </button>
        </div>
      </header>

      {/* RESUMO EXECUTIVO VELLIA (5 INSIGHTS MATERIAIS) */}
      <section className="executive-summary-banner">
        <div className="summary-banner-top">
          <h2>
            <Lightbulb size={18} className="text-warning" />
            Resumo Executivo Vellia (Materiality Engine)
          </h2>
          <span className="summary-freshness-text">
            Atualizado às {cockpitData.dataFreshness.lastUpdate} • Cobertura: {cockpitData.dataFreshness.coveragePct}%
          </span>
        </div>
        <div className="insights-chips-grid">
          {executiveSummaryInsights.map((ins) => (
            <div
              key={ins.id}
              className="insight-chip-item cursor-pointer"
              onClick={() => navigateTabSafe(ins.linkTab)}
              title="Clique para aprofundar na visão de detalhe"
            >
              <span className={`insight-dot ${ins.urgency.toLowerCase()}`}></span>
              <span>{ins.text}</span>
              <ChevronRight size={13} className="text-muted" />
            </div>
          ))}
        </div>
      </section>

      {/* PRIMEIRA DOBRA: 6 INDICADORES CHAVE (CANÔNICOS) */}
      <section className="executive-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span>Pipeline Bruto</span>
            <DollarSign size={16} className="text-muted" />
          </div>
          <div className="kpi-value">R$ {(metrics.grossPipeline / 1000000).toFixed(1)}M</div>
          <div className="kpi-footer">Total de certames monitorados</div>
        </div>

        <div className="kpi-card highlight-card">
          <div className="kpi-header">
            <span>Pipeline Qualificado</span>
            <Target size={16} className="text-primary" />
          </div>
          <div className="kpi-value">R$ {(metrics.qualifiedPipeline / 1000000).toFixed(1)}M</div>
          <div className="kpi-footer positive">Aderência técnica ≥ 75%</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Pipeline Ponderado</span>
            <BarChart3 size={16} className="text-info" />
          </div>
          <div className="kpi-value">R$ {(metrics.weightedPipeline / 1000000).toFixed(1)}M</div>
          <div className="kpi-footer">Valor x Probabilidade real</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Commit (Fase Avançada)</span>
            <CheckCircle2 size={16} className="text-success" />
          </div>
          <div className="kpi-value">R$ {(metrics.commitValue / 1000000).toFixed(1)}M</div>
          <div className="kpi-footer">Propostas enviadas / Julgamento</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Valor em Risco</span>
            <ShieldAlert size={16} className="text-danger" />
          </div>
          <div className="kpi-value">R$ {(metrics.valueAtRisk / 1000000).toFixed(1)}M</div>
          <div className="kpi-footer danger">Recurso ou certidão pendente</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span>Decisões Pendentes</span>
            <Clock size={16} className="text-warning" />
          </div>
          <div className="kpi-value">{metrics.pendingDecisionsCount}</div>
          <div className="kpi-footer warning">Requerem deliberação formal</div>
        </div>
      </section>

      {/* 4 BLOCOS PRINCIPAIS DO COCKPIT */}
      <div className="cockpit-blocks-layout">
        {/* COLUNA ESQUERDA: DECISÕES, VALOR EM MOVIMENTO & PIPELINE */}
        <div className="cockpit-col">
          {/* BLOCO 1: DECISÕES QUE PRECISAM DE VOCÊ */}
          <div className="executive-section-card">
            <div className="card-title-row">
              <h3>
                <Clock size={18} className="text-warning" />
                Decisões que Precisam de Você
              </h3>
              <span className="badge-tag-count">{pendingDecisions.length} Ações</span>
            </div>

            <div className="decisions-list-grid">
              {pendingDecisions.map(dec => (
                <div key={dec.id} className={`executive-decision-item ${dec.urgency === 'CRITICAL' ? 'critica' : ''}`}>
                  <div className="dec-item-top">
                    <div>
                      <div className="dec-title">{dec.title}</div>
                      <div className="dec-entity">{dec.entityTitle}</div>
                    </div>
                    <span className={`dec-urgency-badge ${dec.urgency.toLowerCase()}`}>
                      Prazo: {dec.deadline}
                    </span>
                  </div>

                  <div className="dec-why-box">
                    <strong>Por que agora:</strong> {dec.whyNow}
                    <div className="text-warning font-xs mt-1">Impacto: {dec.impact}</div>
                  </div>

                  <div className="dec-action-bar">
                    <button
                      className="btn-dec-action"
                      onClick={() => navigateTabSafe('governanca-aprovacoes')}
                    >
                      Analisar Alçada & Decidir <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BLOCO 2: VALOR EM MOVIMENTO & CONCENTRAÇÃO */}
          <div className="executive-section-card">
            <div className="card-title-row">
              <h3>
                <TrendingUp size={18} className="text-primary" />
                Valor em Movimento & Concentração
              </h3>
              <span className="badge-tag-count">Últimos 7 dias</span>
            </div>

            <div className="movement-stats-row">
              <div className="move-stat-item">
                <span className="move-stat-label">Novas Identificadas</span>
                <span className="move-stat-val">+R$ {(valueMovement.newIdentified / 1000).toFixed(0)}k</span>
              </div>
              <div className="move-stat-item">
                <span className="move-stat-label">Avanço de Estágio</span>
                <span className="move-stat-val text-info">R$ {(valueMovement.advancedStage / 1000).toFixed(0)}k</span>
              </div>
              <div className="move-stat-item">
                <span className="move-stat-label">Homologadas (Won)</span>
                <span className="move-stat-val text-success">R$ {(valueMovement.won / 1000).toFixed(0)}k</span>
              </div>
              <div className="move-stat-item">
                <span className="move-stat-label">Perdidas (Lost)</span>
                <span className="move-stat-val text-danger">R$ {(valueMovement.lost / 1000).toFixed(0)}k</span>
              </div>
            </div>

            <div className="concentration-box">
              <AlertTriangle size={18} className="flex-shrink-0" />
              <span>
                <strong>Índice de Concentração:</strong> As 3 maiores oportunidades representam <strong>{metrics.top3ConcentrationPct}%</strong> do pipeline total. Comprador principal: <strong>{metrics.topBuyer}</strong> ({metrics.topBuyerConcentrationPct}%).
              </span>
            </div>

            {/* MARGEM POTENCIAL */}
            {metrics.margin && (
              <div className="font-sm text-muted mt-2">
                Margem média potencial: <strong className="text-success">{metrics.margin.averagePotentialMarginPct}%</strong> • Exposição a baixa margem: R$ {(metrics.margin.lowMarginExposure / 1000).toFixed(0)}k.
              </div>
            )}
          </div>

          {/* BLOCO: O QUE MUDOU? (MOVIMENTOS RELEVANTES) */}
          <div className="executive-section-card">
            <div className="card-title-row">
              <h3>
                <Zap size={18} className="text-info" />
                O Que Mudou no Negócio?
              </h3>
              <span className="badge-tag-count">Fatos Materiais</span>
            </div>
            <div className="decisions-list-grid">
              {whatChanged.map(ch => (
                <div key={ch.id} className="risk-item-row">
                  <div className="text-muted font-xs">{ch.date}</div>
                  <div className="font-sm text-slate-200">{ch.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: RISCOS, CONTRATOS, RECOMENDAÇÕES & COPILOT */}
        <div className="cockpit-col">
          {/* BLOCO 3: TOP RISCOS ESTRATÉGICOS */}
          <div className="executive-section-card">
            <div className="card-title-row">
              <h3>
                <ShieldAlert size={18} className="text-danger" />
                Top Riscos Estratégicos
              </h3>
              <span className="badge-tag-count">{topRisks.length} Ativos</span>
            </div>

            <div className="risks-list-grid">
              {topRisks.map(r => (
                <div key={r.id} className="risk-item-row">
                  <div className="risk-row-top">
                    <span className="risk-title-bold">{r.title}</span>
                    <span className="risk-trend-tag">{r.trend}</span>
                  </div>
                  <div className="text-muted font-xs">Impacto: {r.impact}</div>
                  <div className="text-info font-xs">Mitigação: {r.mitigation} (Resp: {r.owner})</div>
                </div>
              ))}
            </div>
          </div>

          {/* BLOCO 4: CONTRATOS & JANELA DE RENOVAÇÃO */}
          <div className="executive-section-card">
            <div className="card-title-row">
              <h3>
                <FileText size={18} className="text-primary" />
                Contratos Vigentes & Renovações
              </h3>
              <button
                className="font-xs text-primary cursor-pointer border-none bg-transparent"
                onClick={() => navigateTabSafe('contratos')}
              >
                Ver Contratos →
              </button>
            </div>

            <div className="contracts-summary-grid">
              <div className="contract-window-cell">
                <div className="window-number">{contractsSummary.renewalWindows.within90Days}</div>
                <div className="window-label">Até 90 dias</div>
              </div>
              <div className="contract-window-cell">
                <div className="window-number">{contractsSummary.renewalWindows.within180Days}</div>
                <div className="window-label">91 a 180 dias</div>
              </div>
              <div className="contract-window-cell">
                <div className="window-number">{contractsSummary.renewalWindows.beyond180Days}</div>
                <div className="window-label">&gt; 180 dias</div>
              </div>
            </div>

            <div className="font-xs text-warning mt-1">
              ⚠️ {contractsSummary.criticalObligationAlert}
            </div>
          </div>

          {/* BLOCO: RECOMENDAÇÕES ESTRATÉGICAS EXPLICÁVEIS */}
          <div className="executive-section-card">
            <div className="card-title-row">
              <h3>
                <Sparkles size={18} className="text-accent" />
                Recomendações Estratégicas (Fase 57)
              </h3>
              <button
                className="font-xs text-accent cursor-pointer border-none bg-transparent"
                onClick={() => navigateTabSafe('recomendacoes-estrategicas')}
              >
                Abrir Central →
              </button>
            </div>

            <div className="decisions-list-grid">
              {recommendations.map(rec => (
                <div key={rec.id} className="risk-item-row">
                  <div className="risk-title-bold text-accent">{rec.title}</div>
                  <div className="font-xs text-slate-300">{rec.recommendation}</div>
                  <div className="font-xs text-muted mt-1">Confiança: {rec.confidence}% • {rec.whyItMatters}</div>
                </div>
              ))}
            </div>
          </div>

          {/* COPILOT EXECUTIVO CONTEXTUAL */}
          <div className="executive-copilot-box">
            <div className="copilot-header font-bold text-primary flex-row items-center gap-1">
              <HelpCircle size={18} />
              <span>Copilot Executivo da Diretoria</span>
            </div>
            <p className="font-xs text-muted">
              Respostas diretas e sintetizadas fundamentadas nos dados consolidados do Cockpit:
            </p>
            <div className="copilot-prompts-flex">
              <button
                className="btn-quick-exec-prompt"
                onClick={() => handleAskCopilot('O que precisa da minha decisão hoje?')}
              >
                "O que precisa da minha decisão hoje?"
              </button>
              <button
                className="btn-quick-exec-prompt"
                onClick={() => handleAskCopilot('Resuma o que mudou esta semana.')}
              >
                "O que mudou esta semana?"
              </button>
              <button
                className="btn-quick-exec-prompt"
                onClick={() => handleAskCopilot('Quais são os maiores riscos estratégicos?')}
              >
                "Quais os maiores riscos?"
              </button>
            </div>

            {copilotResponse && (
              <div className="copilot-response-container mt-2">
                <p>{copilotResponse.answer}</p>
                <div className="font-xs text-muted mt-1">Fonte: {copilotResponse.evidence}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL BOARD MODE (APRESENTAÇÃO FULLSCREEN) */}
      {boardModeOpen && (
        <div className="board-mode-overlay">
          <div className="board-mode-header">
            <div>
              <span className="cockpit-tag-live">BOARD MODE • APRESENTAÇÃO EXECUTIVA</span>
              <h2>{boardSlides[boardSlideIndex].title}</h2>
            </div>
            <button className="btn-generate-brief" onClick={() => setBoardModeOpen(false)}>
              <Minimize2 size={16} /> Sair do Board Mode
            </button>
          </div>

          <div className="board-slide-content">
            {boardSlides[boardSlideIndex].content}
          </div>

          <div className="board-nav-controls">
            <button
              className="btn-dec-action"
              disabled={boardSlideIndex === 0}
              onClick={() => setBoardSlideIndex(prev => Math.max(0, prev - 1))}
            >
              ← Anterior
            </button>
            <span className="font-sm text-muted">
              Slide {boardSlideIndex + 1} de {boardSlides.length}
            </span>
            <button
              className="btn-dec-action"
              disabled={boardSlideIndex === boardSlides.length - 1}
              onClick={() => setBoardSlideIndex(prev => Math.min(boardSlides.length - 1, prev + 1))}
            >
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* MODAL EXECUTIVE BRIEF (1-2 PÁGINAS) */}
      {briefModalOpen && briefContent && (
        <div className="modal-overlay-custom" onClick={() => setBriefModalOpen(false)}>
          <div className="modal-content-custom max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div>
                <h3>{briefContent.companyName}</h3>
                <span className="text-muted font-xs">Brief Executivo • Gerado em {new Date(briefContent.generatedAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <button className="btn-close" onClick={() => setBriefModalOpen(false)}>×</button>
            </div>

            <div className="modal-body-custom">
              <p className="font-sm"><strong>Síntese Estratégica:</strong> {briefContent.headerSummary}</p>
              
              <div className="movement-stats-row mt-2">
                <div>Bruto: {briefContent.pipelineOverview.gross}</div>
                <div>Qualificado: {briefContent.pipelineOverview.qualified}</div>
                <div>Ponderado: {briefContent.pipelineOverview.weighted}</div>
                <div>Commit: {briefContent.pipelineOverview.commit}</div>
              </div>

              <h4 className="mt-3 font-sm font-bold">Top Insights Materiais:</h4>
              <ul className="font-xs text-muted pl-4">
                {briefContent.topInsights.map((ins, i) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>

              <h4 className="mt-3 font-sm font-bold">Decisões Prioritárias:</h4>
              <ul className="font-xs text-warning pl-4">
                {briefContent.criticalDecisions.map((dec, i) => (
                  <li key={i}>{dec}</li>
                ))}
              </ul>
            </div>

            <div className="modal-footer-custom">
              <button className="btn-secondary-action" onClick={() => setBriefModalOpen(false)}>Fechar</button>
              <button className="btn-primary-action" onClick={() => window.print()}>
                <Download size={15} /> Imprimir / Salvar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
