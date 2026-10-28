import React, { useState } from 'react';
import { 
  Scale, 
  TrendingUp, 
  Filter, 
  ArrowUpDown, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Flame, 
  Clock, 
  DollarSign, 
  Sparkles, 
  SlidersHorizontal, 
  BarChart3, 
  Building2, 
  ExternalLink, 
  Eye, 
  Lock, 
  ChevronRight, 
  ArrowRight, 
  Send, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Briefcase,
  FileSpreadsheet
} from 'lucide-react';
import { 
  DecisionService, 
  DecisionTier, 
  NoGoReason 
} from '../services/decision/decisionService';
import { OpportunityService } from '../services/opportunityService';
import { ProposalService } from '../services/proposal/proposalService';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import OpportunityDetailModal from './OpportunityDetailModal';
import ProposalDetailView from './ProposalDetailView';
import './DecisionBoardView.css';

export default function DecisionBoardView({ onOpenOpportunityDetail }) {
  const [opportunities, setOpportunities] = useState(() => {
    try {
      return OpportunityService.listAll();
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('board'); // 'board', 'comparator', 'funnel', 'ai-assistant', 'settings'
  const [selectedOppForModal, setSelectedOppForModal] = useState(null);
  const [selectedProposalId, setSelectedProposalId] = useState(null);
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('decisionScore'); // 'decisionScore', 'score', 'daysLeft', 'value', 'risk'
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedForCompare, setSelectedForCompare] = useState([]);

  // IA Gerencial State
  const [aiQuery, setAiQuery] = useState('');
  const [aiConversation, setAiConversation] = useState([
    {
      sender: 'ai',
      text: '[FATO]: Olá! Sou o Assistente de Decisão Estratégica do Vellia Licitações.\n\n[ESTIMATIVA]: Estou monitorando 14 oportunidades ativas e consolidando scores multicritério de aderência, risco e margem.\n\n[RECOMENDAÇÃO]: Pergunte-me quais oportunidades priorizar hoje, qual possui a melhor relação risco x retorno ou por que determinadas propostas foram desqualificadas.',
      sources: []
    }
  ]);

  // Settings State (Item 52)
  const [weights, setWeights] = useState(DecisionService.getWeights());
  const [commercialConfig, setCommercialConfig] = useState(DecisionService.getCommercialConfig());
  const [weightsSavedFeedback, setWeightsSavedFeedback] = useState(null);

  // Recarregar dados após alterações
  const reloadData = () => {
    try {
      setOpportunities(OpportunityService.listAll());
    } catch {
      setOpportunities(priorityOpportunities);
    }
  };

  React.useEffect(() => {
    const unsubOpp = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, reloadData);
    const unsubDec = EventBus.subscribe(VELLIA_EVENTS.DECISION_UPDATED, reloadData);
    return () => {
      unsubOpp();
      unsubDec();
    };
  }, []);

  // Avaliar todas as oportunidades com o Decision Engine
  const evaluatedOpps = opportunities.map(opp => {
    const decision = DecisionService.calculateDecision(opp);
    const human = DecisionService.getHumanDecision(opp.id || opp.number);
    return {
      opp,
      decision,
      human
    };
  });

  // Filtros
  const filteredOpps = evaluatedOpps.filter(item => {
    if (companyFilter !== 'ALL') {
      const comp = item.opp.recommendedCompany?.toLowerCase() || '';
      if (companyFilter === 'excelencia' && !comp.includes('excelência')) return false;
      if (companyFilter === 'veeluen' && !comp.includes('veeluen')) return false;
    }

    if (tierFilter !== 'ALL') {
      if (item.decision.recommendationTier !== tierFilter) return false;
    }

    return true;
  });

  // Ordenação
  const sortedOpps = [...filteredOpps].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (sortBy === 'decisionScore') {
      valA = a.decision.decisionScore;
      valB = b.decision.decisionScore;
    } else if (sortBy === 'score') {
      valA = Number(a.opp.score) || 0;
      valB = Number(b.opp.score) || 0;
    } else if (sortBy === 'daysLeft') {
      valA = Number(a.opp.daysLeft) || 0;
      valB = Number(b.opp.daysLeft) || 0;
    } else if (sortBy === 'value') {
      valA = a.decision.commercial.valorEstimado || 0;
      valB = b.decision.commercial.valorEstimado || 0;
    } else if (sortBy === 'risk') {
      valA = a.decision.risks.riskScore;
      valB = b.decision.risks.riskScore;
    }

    return sortOrder === 'desc' ? valB - valA : valA - valB;
  });

  // Métricas Gerenciais
  const metrics = DecisionService.getManagementMetrics(opportunities);

  // Controle do comparador (Item 33)
  const toggleCompare = (oppId) => {
    if (selectedForCompare.includes(oppId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== oppId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('Você pode comparar no máximo 3 oportunidades lado a lado.');
        return;
      }
      setSelectedForCompare([...selectedForCompare, oppId]);
    }
  };

  // Enviar pergunta à IA Gerencial (Itens 49 e 50)
  const handleSendAi = (textToSend = null) => {
    const q = textToSend || aiQuery;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    const res = DecisionService.askDecisionAssistant(q, opportunities);
    const aiMsg = { sender: 'ai', text: res.answer, sources: res.sources };

    setAiConversation(prev => [...prev, userMsg, aiMsg]);
    setAiQuery('');
  };

  // Salvar Pesos Configurados (Item 52)
  const handleSaveWeights = (e) => {
    e.preventDefault();
    try {
      DecisionService.saveWeights(weights);
      DecisionService.saveCommercialConfig(commercialConfig);
      setWeightsSavedFeedback('Pesos e premissas atualizados com sucesso!');
      setTimeout(() => setWeightsSavedFeedback(null), 3500);
      reloadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="decision-board-view">
      {/* HEADER DA VISÃO DO DECISION BOARD */}
      <div className="board-header">
        <div className="header-left-col">
          <div className="header-badge-row">
            <span className="badge-tag-system">
              <Scale size={13} />
              <span>Decisão Estratégica Multicritério • Fase 10</span>
            </span>
            <span className="badge-model">Algoritmo v10.4 • Ponderação Dinâmica</span>
          </div>
          <h2 className="board-main-title">Decision Board • GO / NO-GO Inteligente</h2>
          <p className="board-main-desc">
            Consolidação executiva de <strong>Aderência Técnica (25%)</strong>, <strong>Capacidade de Habilitação (20%)</strong>, <strong>Viabilidade Comercial (20%)</strong>, <strong>Risco (15%)</strong>, <strong>Prazo (10%)</strong> e <strong>Interesse Estratégico (10%)</strong>.
          </p>
        </div>

        {/* Resumo Rápido das Decisões */}
        <div className="header-metrics-strip">
          <div className="strip-item">
            <span className="strip-lbl">Oportunidades</span>
            <strong className="strip-val">{metrics.totalAnalisadas}</strong>
          </div>
          <div className="strip-item text-green">
            <span className="strip-lbl">Taxa de GO</span>
            <strong className="strip-val">{metrics.taxaGo}%</strong>
          </div>
          <div className="strip-item text-teal">
            <span className="strip-lbl">Decision Score Médio</span>
            <strong className="strip-val">{metrics.decisionScoreMedio}%</strong>
          </div>
          <div className="strip-item text-amber">
            <span className="strip-lbl">Ticket Médio</span>
            <strong className="strip-val">R$ {(metrics.ticketMedio / 1000).toFixed(0)}k</strong>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE ABAS DO BOARD */}
      <div className="board-nav-tabs">
        <button 
          className={`board-nav-btn ${activeTab === 'board' ? 'active' : ''}`}
          onClick={() => setActiveTab('board')}
        >
          <Layers size={15} />
          <span>Matriz de Decisão Geral ({opportunities.length})</span>
        </button>

        <button 
          className={`board-nav-btn ${activeTab === 'comparator' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparator')}
        >
          <Scale size={15} />
          <span>Comparar Oportunidades ({selectedForCompare.length}/3)</span>
          {selectedForCompare.length > 0 && <span className="tab-bubble-counter">{selectedForCompare.length}</span>}
        </button>

        <button 
          className={`board-nav-btn ${activeTab === 'funnel' ? 'active' : ''}`}
          onClick={() => setActiveTab('funnel')}
        >
          <BarChart3 size={15} />
          <span>Funil Comercial & Estatísticas de NO-GO</span>
        </button>

        <button 
          className={`board-nav-btn ${activeTab === 'ai-assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-assistant')}
        >
          <Sparkles size={15} />
          <span>Assistente de Decisão (IA Gerencial)</span>
        </button>

        <button 
          className={`board-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SlidersHorizontal size={15} />
          <span>Configuração de Pesos & Margem Mínima</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA 1: MATRIZ DE DECISÃO GERAL */}
      {activeTab === 'board' && (
        <div className="board-content-wrapper">
          {/* BARRA DE FILTROS E ORDENAÇÃO */}
          <div className="board-filters-toolbar">
            <div className="filter-group">
              <span className="filter-label"><Filter size={13} /> Empresa:</span>
              <div className="pill-selector">
                <button 
                  className={`pill-btn ${companyFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setCompanyFilter('ALL')}
                >
                  Todas
                </button>
                <button 
                  className={`pill-btn ${companyFilter === 'excelencia' ? 'active' : ''}`}
                  onClick={() => setCompanyFilter('excelencia')}
                >
                  Excelência Ambiental
                </button>
                <button 
                  className={`pill-btn ${companyFilter === 'veeluen' ? 'active' : ''}`}
                  onClick={() => setCompanyFilter('veeluen')}
                >
                  Veeluen Solutions
                </button>
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Recomendação:</span>
              <select 
                value={tierFilter} 
                onChange={(e) => setTierFilter(e.target.value)}
                className="board-select"
              >
                <option value="ALL">Todas as Faixas</option>
                <option value={DecisionTier.GO_PRIORITARIO}>GO Prioritário (90-100%)</option>
                <option value={DecisionTier.GO}>GO (80-89%)</option>
                <option value={DecisionTier.GO_PENDENCIAS}>GO com Pendências (70-79%)</option>
                <option value={DecisionTier.ANALISE_GERENCIAL}>Análise Gerencial (55-69%)</option>
                <option value={DecisionTier.NOGO_RECOMENDADO}>NO-GO (&lt;55%)</option>
                <option value={DecisionTier.GO_BLOQUEADO}>GO Bloqueado</option>
              </select>
            </div>

            <div className="filter-group right-align">
              <span className="filter-label"><ArrowUpDown size={13} /> Ordenar por:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="board-select"
              >
                <option value="decisionScore">Decision Score (Fase 10)</option>
                <option value="score">Aderência Técnica</option>
                <option value="daysLeft">Prazo Restante</option>
                <option value="value">Valor Estimado</option>
                <option value="risk">Menor Risco</option>
              </select>
              <button 
                className="btn-order-toggle"
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                title="Alternar ordem crescente/decrescente"
              >
                {sortOrder === 'desc' ? 'Descendente' : 'Ascendente'}
              </button>
            </div>
          </div>

          {/* TABELA DO DECISION BOARD */}
          <div className="board-table-card">
            <div className="table-responsive">
              <table className="decision-matrix-table">
                <thead>
                  <tr>
                    <th style={{ width: '38px' }}>Comp.</th>
                    <th>Oportunidade & Contratante</th>
                    <th>Empresa Alocada</th>
                    <th style={{ textAlign: 'center' }}>Aderência</th>
                    <th style={{ textAlign: 'center' }}>Habilitação</th>
                    <th style={{ textAlign: 'center' }}>Risco Global</th>
                    <th>Valor & Margem</th>
                    <th style={{ textAlign: 'center' }}>Prazo</th>
                    <th style={{ textAlign: 'center' }}>Decision Score</th>
                    <th>Recomendação Vellia</th>
                    <th>Decisão Humana</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOpps.map(({ opp, decision, human }) => {
                    const isSelected = selectedForCompare.includes(opp.id || opp.number);
                    const currentHuman = human?.currentDecision || null;

                    return (
                      <tr key={opp.id || opp.number} className={isSelected ? 'row-selected-compare' : ''}>
                        {/* Checkbox para Comparador */}
                        <td>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCompare(opp.id || opp.number)}
                            title="Selecionar para comparar lado a lado"
                            className="compare-checkbox"
                          />
                        </td>

                        {/* Oportunidade & Contratante */}
                        <td className="opp-ident-col">
                          <span className="opp-num mono">#{opp.number}</span>
                          <strong className="opp-title-text" title={opp.title}>{opp.title}</strong>
                          <span className="opp-client-text">{opp.client || opp.contractor}</span>
                        </td>

                        {/* Empresa Alocada */}
                        <td>
                          <span className="company-badge">
                            <Building2 size={11} /> {opp.recommendedCompany}
                          </span>
                        </td>

                        {/* Aderência Técnica */}
                        <td style={{ textAlign: 'center' }}>
                          <span className="dim-pill text-teal mono">{opp.score}%</span>
                        </td>

                        {/* Capacidade de Habilitação */}
                        <td style={{ textAlign: 'center' }}>
                          <span className="dim-pill text-blue mono">{decision.dimensions.capacidadeHabilitacao.score}%</span>
                        </td>

                        {/* Risco Global */}
                        <td style={{ textAlign: 'center' }}>
                          <span className={`risk-tag-badge ${decision.risks.riskTierClass}`}>
                            {decision.risks.riskScore}% ({decision.risks.riskTier})
                          </span>
                        </td>

                        {/* Valor e Margem Provável */}
                        <td>
                          <strong className="c-val-text">{decision.commercial.temValorDefinido ? decision.commercial.valorEstimadoFormatado : 'A estimar'}</strong>
                          {decision.commercial.temValorDefinido && (
                            <span className="c-margin-sub">Margem: ~{decision.commercial.cenarioProvavel.margemPercentual}%</span>
                          )}
                        </td>

                        {/* Prazo */}
                        <td style={{ textAlign: 'center' }}>
                          <span className="days-left-badge mono">
                            <Clock size={11} /> {opp.daysLeft}d
                          </span>
                        </td>

                        {/* DECISION SCORE */}
                        <td style={{ textAlign: 'center' }}>
                          <div className="decision-score-circle">
                            <strong className="d-num">{decision.decisionScore}%</strong>
                          </div>
                        </td>

                        {/* Recomendação Vellia */}
                        <td>
                          <span className={`decision-tier-badge ${decision.badgeClass}`}>
                            {decision.hasActiveBlockers && <Lock size={10} />}
                            {decision.recommendationTier}
                          </span>
                        </td>

                        {/* Decisão Humana Atual */}
                        <td>
                          {currentHuman ? (
                            <span className={`human-dec-badge badge-${currentHuman.toLowerCase()}`}>
                              {currentHuman === 'GO' ? <CheckCircle2 size={12} /> :
                               currentHuman === 'NO-GO' ? <XCircle size={12} /> : <HelpCircle size={12} />}
                              <span>{currentHuman}</span>
                            </span>
                          ) : (
                            <span className="human-dec-badge badge-pending">Pendente</span>
                          )}
                        </td>

                        {/* Botão de Ação / Detalhes */}
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                            <button 
                              className="btn-open-decision"
                              onClick={() => setSelectedOppForModal(opp.id || opp.number)}
                              title="Abrir Central de Decisão Estratégica"
                            >
                              <Eye size={13} />
                              <span>Avaliar</span>
                            </button>
                            {(currentHuman === 'GO' || decision.recommendationTier.includes('GO')) && (
                              <button 
                                className="btn-open-proposal-shortcut"
                                onClick={() => {
                                  const existing = ProposalService.listAll().find(p => String(p.opportunityNumber) === String(opp.number || opp.id));
                                  if (existing) {
                                    setSelectedProposalId(existing.id);
                                  } else {
                                    const created = ProposalService.createProposalFromOpportunity(opp);
                                    setSelectedProposalId(created.id);
                                  }
                                }}
                                title="Gestão da Proposta (Fase 11)"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  backgroundColor: 'rgba(0, 229, 201, 0.15)',
                                  border: '1px solid #00E5C9',
                                  color: '#00E5C9',
                                  padding: '0.3rem 0.55rem',
                                  borderRadius: '5px',
                                  fontSize: '0.72rem',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                <FileSpreadsheet size={13} />
                                <span>Proposta</span>
                              </button>
                            )}
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

      {/* CONTEÚDO DA ABA 2: COMPARADOR LADO A LADO (Item 33) */}
      {activeTab === 'comparator' && (
        <div className="board-content-wrapper">
          {selectedForCompare.length === 0 ? (
            <div className="empty-compare-card">
              <Scale size={42} className="text-teal" />
              <h3>Nenhuma oportunidade selecionada para comparação</h3>
              <p>Volte à Matriz de Decisão Geral e selecione de 2 a 3 oportunidades marcando as caixas de seleção na primeira coluna.</p>
              <button className="btn-action-primary" onClick={() => setActiveTab('board')}>
                Ir para a Matriz de Decisão
              </button>
            </div>
          ) : (
            <div className="comparator-container">
              <div className="comparator-header-bar">
                <h3>Comparativo Estratégico Lado a Lado ({selectedForCompare.length} selecionadas)</h3>
                <button className="btn-clear-compare" onClick={() => setSelectedForCompare([])}>
                  Limpar Seleção
                </button>
              </div>

              <div className="comparator-columns-grid">
                {selectedForCompare.map(oppId => {
                  const item = evaluatedOpps.find(o => (o.opp.id || o.opp.number) === oppId);
                  if (!item) return null;
                  const { opp, decision, human } = item;

                  return (
                    <div key={oppId} className="compare-col-card">
                      <div className="compare-col-top">
                        <span className="c-opp-num">#{opp.number}</span>
                        <h4 className="c-opp-title">{opp.title}</h4>
                        <span className="c-opp-company"><Building2 size={12} /> {opp.recommendedCompany}</span>
                      </div>

                      {/* Decision Score Hero */}
                      <div className={`c-score-hero ${decision.badgeClass}`}>
                        <span className="c-score-num">{decision.decisionScore}%</span>
                        <span className="c-score-tier">{decision.recommendationTier}</span>
                      </div>

                      {/* Métricas Comparativas */}
                      <div className="compare-metrics-list">
                        <div className="c-metric-row">
                          <span className="lbl">Aderência Técnica:</span>
                          <strong className="val text-teal">{opp.score}%</strong>
                        </div>
                        <div className="c-metric-row">
                          <span className="lbl">Habilitação & Acervo:</span>
                          <strong className="val text-blue">{decision.dimensions.capacidadeHabilitacao.score}%</strong>
                        </div>
                        <div className="c-metric-row">
                          <span className="lbl">Risk Score:</span>
                          <strong className={`val ${decision.risks.riskTierClass}`}>{decision.risks.riskScore}%</strong>
                        </div>
                        <div className="c-metric-row">
                          <span className="lbl">Valor Estimado:</span>
                          <strong className="val">{decision.commercial.temValorDefinido ? decision.commercial.valorEstimadoFormatado : 'A estimar'}</strong>
                        </div>
                        <div className="c-metric-row">
                          <span className="lbl">Margem Provável:</span>
                          <strong className="val text-green">{decision.commercial.cenarioProvavel?.margemPercentual ? `${decision.commercial.cenarioProvavel.margemPercentual}%` : 'N/D'}</strong>
                        </div>
                        <div className="c-metric-row">
                          <span className="lbl">Prazo Restante:</span>
                          <strong className="val">{opp.daysLeft} dias</strong>
                        </div>
                        <div className="c-metric-row">
                          <span className="lbl">Esforço Operacional:</span>
                          <strong className="val">{decision.operationalEffort}</strong>
                        </div>
                        <div className="c-metric-row">
                          <span className="lbl">Decisão Humana:</span>
                          <strong className="val">{human?.currentDecision || 'Pendente'}</strong>
                        </div>
                      </div>

                      <button 
                        className="btn-view-deep"
                        onClick={() => setSelectedOppForModal(opp.id || opp.number)}
                      >
                        Abrir Análise Detalhada
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA 3: FUNIL COMERCIAL & MOTIVOS DE NO-GO (Itens 40 a 43) */}
      {activeTab === 'funnel' && (
        <div className="board-content-wrapper">
          <div className="funnel-stats-grid">
            {/* FUNIL VISUAL DE CONVERSÃO */}
            <div className="section-card funnel-card">
              <div className="card-top-title">
                <TrendingUp size={16} />
                <h4>Funil de Conversão Comercial de Licitações (Pipeline)</h4>
              </div>
              <p className="section-subtitle">
                Acompanhamento das oportunidades desde a captura no radar até a assinatura do contrato.
              </p>

              <div className="funnel-stages-wrapper">
                <div className="funnel-stage stage-1">
                  <div className="stage-content">
                    <span className="st-name">1. Radar Petronect</span>
                    <strong className="st-num">{metrics.funnel.oportunidades}</strong>
                  </div>
                  <span className="st-conv">Base Capturada</span>
                </div>

                <div className="funnel-stage stage-2">
                  <div className="stage-content">
                    <span className="st-name">2. Triagem & Análise</span>
                    <strong className="st-num">{metrics.funnel.emAnalise}</strong>
                  </div>
                  <span className="st-conv">100% Analisadas</span>
                </div>

                <div className="funnel-stage stage-3">
                  <div className="stage-content">
                    <span className="st-name">3. GO Aprovado</span>
                    <strong className="st-num">{metrics.funnel.goAprovado}</strong>
                  </div>
                  <span className="st-conv">{metrics.conversionRates.oportunidadeToGo}% Conversão</span>
                </div>

                <div className="funnel-stage stage-4">
                  <div className="stage-content">
                    <span className="st-name">4. Proposta Enviada</span>
                    <strong className="st-num">{metrics.funnel.propostasEnviadas}</strong>
                  </div>
                  <span className="st-conv">{metrics.conversionRates.goToProposta}% do GO</span>
                </div>

                <div className="funnel-stage stage-5">
                  <div className="stage-content">
                    <span className="st-name">5. Participação na Disputa</span>
                    <strong className="st-num">{metrics.funnel.participacoesSessao}</strong>
                  </div>
                  <span className="st-conv">{metrics.conversionRates.propostaToParticipacao}% em Sessão</span>
                </div>

                <div className="funnel-stage stage-6">
                  <div className="stage-content">
                    <span className="st-name">6. Vitória & Contrato</span>
                    <strong className="st-num">{metrics.funnel.vitoriasContrato}</strong>
                  </div>
                  <span className="st-conv">{metrics.conversionRates.participacaoToVitoria}% Taxa de Sucesso</span>
                </div>
              </div>
            </div>

            {/* INTELIGÊNCIA DE NO-GO (Itens 39 e 40) */}
            <div className="section-card nogo-analytics-card">
              <div className="card-top-title">
                <XCircle size={16} className="text-red" />
                <h4>Inteligência de NO-GO: Causa Raiz dos Descartes</h4>
              </div>
              <p className="section-subtitle">
                Distribuição dos motivos pelos quais oportunidades foram desqualificadas pela diretoria comercial nos últimos 90 dias.
              </p>

              <div className="nogo-reasons-list">
                {Object.entries(metrics.noGoStats).map(([reason, count], idx) => {
                  const pct = Math.round((count / Math.max(1, metrics.countNoGo || 1)) * 100);
                  return (
                    <div key={idx} className="nogo-reason-item">
                      <div className="r-info">
                        <span className="r-text">{reason}</span>
                        <strong className="r-count">{count} ocorrências</strong>
                      </div>
                      <div className="r-bar-track">
                        <div className="r-bar-fill" style={{ width: `${Math.min(100, (count + 1) * 20)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 4: ASSISTENTE DE DECISÃO (IA GERENCIAL) (Itens 49 e 50) */}
      {activeTab === 'ai-assistant' && (
        <div className="board-content-wrapper">
          <div className="section-card ai-assistant-board-card">
            <div className="card-top-title">
              <Sparkles size={16} className="text-teal" />
              <h4>Assistente Executivo de Decisão Estratégica</h4>
            </div>
            <p className="section-subtitle">
              Respostas baseadas estritamente nos dados operacionais, com separação explícita entre <strong>[FATO]</strong>, <strong>[ESTIMATIVA]</strong> e <strong>[RECOMENDAÇÃO]</strong>.
            </p>

            {/* Sugestões Rápidas */}
            <div className="ai-chips-suggestions">
              <button className="ai-suggestion-chip" onClick={() => handleSendAi('Quais oportunidades devemos priorizar hoje?')}>
                "Quais oportunidades devemos priorizar hoje?"
              </button>
              <button className="ai-suggestion-chip" onClick={() => handleSendAi('Qual possui melhor relação risco x retorno?')}>
                "Qual possui melhor relação risco x retorno?"
              </button>
              <button className="ai-suggestion-chip" onClick={() => handleSendAi('Por que oportunidades receberam NO-GO?')}>
                "Por que oportunidades receberam NO-GO?"
              </button>
              <button className="ai-suggestion-chip" onClick={() => handleSendAi('Quais pendências impedem o GO?')}>
                "Quais pendências impedem o GO?"
              </button>
              <button className="ai-suggestion-chip" onClick={() => handleSendAi('Qual oportunidade tem maior potencial comercial?')}>
                "Qual tem maior potencial comercial?"
              </button>
            </div>

            {/* Chat Messages */}
            <div className="ai-chat-messages-area">
              {aiConversation.map((msg, i) => (
                <div key={i} className={`ai-message-row msg-${msg.sender}`}>
                  <div className="msg-bubble">
                    <div className="msg-sender-lbl">
                      {msg.sender === 'ai' ? <Sparkles size={12} /> : null}
                      <span>{msg.sender === 'ai' ? 'IA Vellia Decisão' : 'Você'}</span>
                    </div>
                    <div className="msg-text-content">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="ai-input-bar">
              <input 
                type="text" 
                placeholder="Faça uma pergunta sobre o portfólio de oportunidades e decisões..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAi()}
                className="ai-chat-input"
              />
              <button className="btn-send-ai" onClick={() => handleSendAi()}>
                <Send size={15} />
                <span>Consultar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA 5: CONFIGURAÇÃO DE PESOS & PREMISSAS (Itens 48 e 52) */}
      {activeTab === 'settings' && (
        <div className="board-content-wrapper">
          <div className="section-card settings-card">
            <div className="card-top-title">
              <SlidersHorizontal size={16} />
              <h4>Configuração Administrativa de Pesos do Decision Score (Soma = 100%)</h4>
            </div>
            <p className="section-subtitle">
              Ajuste as prioridades estratégicas da empresa. A soma dos 6 pesos multicritério deve obrigatoriamente totalizar 100%.
            </p>

            {weightsSavedFeedback && (
              <div className="feedback-alert-banner">
                <Check size={16} />
                <span>{weightsSavedFeedback}</span>
              </div>
            )}

            <form onSubmit={handleSaveWeights} className="weights-config-form">
              <div className="weights-inputs-grid">
                <div className="weight-input-card">
                  <label>1. Aderência Técnica</label>
                  <div className="input-with-pct">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={weights.aderenciaTecnica} 
                      onChange={(e) => setWeights({ ...weights, aderenciaTecnica: Number(e.target.value) })}
                    />
                    <span>%</span>
                  </div>
                  <span className="hint-txt">Compatibilidade semântica de escopo</span>
                </div>

                <div className="weight-input-card">
                  <label>2. Capacidade de Habilitação</label>
                  <div className="input-with-pct">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={weights.capacidadeHabilitacao} 
                      onChange={(e) => setWeights({ ...weights, capacidadeHabilitacao: Number(e.target.value) })}
                    />
                    <span>%</span>
                  </div>
                  <span className="hint-txt">Atestados, ARTs, RT e certidões</span>
                </div>

                <div className="weight-input-card">
                  <label>3. Viabilidade Comercial</label>
                  <div className="input-with-pct">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={weights.viabilidadeComercial} 
                      onChange={(e) => setWeights({ ...weights, viabilidadeComercial: Number(e.target.value) })}
                    />
                    <span>%</span>
                  </div>
                  <span className="hint-txt">Margem projetada e fluxo financeiro</span>
                </div>

                <div className="weight-input-card">
                  <label>4. Risco</label>
                  <div className="input-with-pct">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={weights.risco} 
                      onChange={(e) => setWeights({ ...weights, risco: Number(e.target.value) })}
                    />
                    <span>%</span>
                  </div>
                  <span className="hint-txt">Matriz 5x5 e complexidade operacional</span>
                </div>

                <div className="weight-input-card">
                  <label>5. Prazo</label>
                  <div className="input-with-pct">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={weights.prazo} 
                      onChange={(e) => setWeights({ ...weights, prazo: Number(e.target.value) })}
                    />
                    <span>%</span>
                  </div>
                  <span className="hint-txt">Tempo disponível para formulação</span>
                </div>

                <div className="weight-input-card">
                  <label>6. Interesse Estratégico</label>
                  <div className="input-with-pct">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={weights.interesseEstrategico} 
                      onChange={(e) => setWeights({ ...weights, interesseEstrategico: Number(e.target.value) })}
                    />
                    <span>%</span>
                  </div>
                  <span className="hint-txt">Cliente estratégico / recorrência</span>
                </div>
              </div>

              {/* Soma Atual dos Pesos */}
              {(() => {
                const total = Number(weights.aderenciaTecnica) +
                              Number(weights.capacidadeHabilitacao) +
                              Number(weights.viabilidadeComercial) +
                              Number(weights.risco) +
                              Number(weights.prazo) +
                              Number(weights.interesseEstrategico);
                const isExact100 = total === 100;

                return (
                  <div className={`weights-total-strip ${isExact100 ? 'total-valid' : 'total-invalid'}`}>
                    <span>Total da Soma dos Pesos: <strong>{total}%</strong></span>
                    {isExact100 ? (
                      <span className="valid-pill"><Check size={13} /> Soma exata de 100% válida</span>
                    ) : (
                      <span className="invalid-pill"><AlertTriangle size={13} /> A soma precisa ser exatamente 100% (Diferença: {100 - total}%)</span>
                    )}
                  </div>
                );
              })()}

              {/* Premissa Comercial de Margem Mínima (Item 48) */}
              <div className="commercial-settings-block">
                <h5>Parâmetros de Rentabilidade Mínima</h5>
                <div className="form-inline-field">
                  <label>Margem Mínima Desejada (%):</label>
                  <input 
                    type="number" 
                    min="5" 
                    max="50" 
                    value={commercialConfig.margemMinimaDesejada} 
                    onChange={(e) => setCommercialConfig({ ...commercialConfig, margemMinimaDesejada: Number(e.target.value) })}
                    className="small-num-input"
                  />
                  <span className="hint-text">Oportunidades com margem estimada inferior a esta premissa serão sinalizadas como atenção.</span>
                </div>
              </div>

              <div className="form-actions-row">
                <button 
                  type="button" 
                  className="btn-reset-defaults"
                  onClick={() => {
                    setWeights(DecisionService.getWeights());
                    setCommercialConfig(DecisionService.getCommercialConfig());
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Restaurar Padrão</span>
                </button>

                <button 
                  type="submit" 
                  className="btn-save-weights"
                >
                  <Check size={14} />
                  <span>Salvar Alterações de Pesos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO DA OPORTUNIDADE COM ABA DE DECISÃO */}
      {selectedOppForModal && (
        <OpportunityDetailModal 
          opportunityId={selectedOppForModal}
          isOpen={!!selectedOppForModal}
          onClose={() => setSelectedOppForModal(null)}
          onUpdated={reloadData}
        />
      )}

      {/* CENTRAL OPERACIONAL DE PROPOSTA (FASE 11) */}
      {selectedProposalId && (
        <ProposalDetailView 
          proposalId={selectedProposalId}
          onClose={() => setSelectedProposalId(null)}
          onUpdated={reloadData}
        />
      )}
    </div>
  );
}
