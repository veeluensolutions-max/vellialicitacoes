/**
 * VELLIA LICITAÇÕES — FASE 42
 * COMPONENTE: GESTÃO ESTRATÉGICA DE PORTFÓLIO + PLANEJAMENTO ANUAL DE LICITAÇÕES
 */

import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Compass, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Layers, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  BarChart3, 
  ArrowRight, 
  ChevronRight, 
  Info, 
  Lock, 
  RefreshCw, 
  Check, 
  Plus, 
  Sliders
} from 'lucide-react';
import { 
  strategicPlanningService, 
  StrategicHorizon, 
  StrategyClassification, 
  GeographicClassification, 
  BuyerClassification, 
  CalendarItemType 
} from '../../services/strategic/strategicPlanningService.js';
import './StrategicPlanningView.css';

export default function StrategicPlanningView({ onNavigateToReports }) {
  // Estado de empresa ativa: 'veeluen', 'excelencia', 'group'
  const [selectedCompany, setSelectedCompany] = useState('veeluen');
  // Aba ativa
  const [activeTab, setActiveTab] = useState('visao-geral');
  // Controle de permissão financeira (RBAC) para teste de segurança
  const [canViewFinancials, setCanViewFinancials] = useState(true);
  // Cenário selecionado no sandbox
  const [activeScenarioId, setActiveScenarioId] = useState('SCENARIO-BASE');
  const [scenarioMultiplier, setScenarioMultiplier] = useState(1.0);
  // Testes automatizados do Golden Strategy Set
  const [testResults, setTestResults] = useState(null);
  const [approvalFeedback, setApprovalFeedback] = useState(null);

  // Dados reativos carregados do serviço
  const boardView = useMemo(() => {
    return strategicPlanningService.getExecutiveBoardView(selectedCompany);
  }, [selectedCompany]);

  const servicePortfolio = useMemo(() => {
    return strategicPlanningService.getServicePortfolioMatrix(selectedCompany, { canViewFinancials });
  }, [selectedCompany, canViewFinancials]);

  const geographicMarkets = useMemo(() => {
    return strategicPlanningService.getGeographicMarkets(selectedCompany);
  }, [selectedCompany]);

  const strategicBuyers = useMemo(() => {
    return strategicPlanningService.getStrategicBuyers(selectedCompany);
  }, [selectedCompany]);

  const accountCoverage = useMemo(() => {
    return strategicPlanningService.getAccountCoverageSummary(selectedCompany);
  }, [selectedCompany]);

  const concentrationRisk = useMemo(() => {
    return strategicPlanningService.getPortfolioConcentrationAnalysis(selectedCompany);
  }, [selectedCompany]);

  const contractExpiries = useMemo(() => {
    return strategicPlanningService.getContractExpiryMap(selectedCompany);
  }, [selectedCompany]);

  const procurementCalendar = useMemo(() => {
    return strategicPlanningService.getProcurementCalendar(selectedCompany);
  }, [selectedCompany]);

  const plan90Days = useMemo(() => {
    return strategicPlanningService.getStrategicPlanByHorizon(StrategicHorizon.DAYS_90, selectedCompany);
  }, [selectedCompany]);

  const plan180Days = useMemo(() => {
    return strategicPlanningService.getStrategicPlanByHorizon(StrategicHorizon.DAYS_180, selectedCompany);
  }, [selectedCompany]);

  const plan365Days = useMemo(() => {
    return strategicPlanningService.getStrategicPlanByHorizon(StrategicHorizon.DAYS_365, selectedCompany);
  }, [selectedCompany]);

  const initiatives = useMemo(() => {
    return strategicPlanningService.getInitiatives(selectedCompany);
  }, [selectedCompany]);

  const goals = useMemo(() => {
    return strategicPlanningService.getStrategicGoals(selectedCompany);
  }, [selectedCompany]);

  const scenarios = useMemo(() => {
    return strategicPlanningService.getScenarios();
  }, []);

  const simulatedScenario = useMemo(() => {
    return strategicPlanningService.simulateScenario(activeScenarioId, { pipelineMultiplier: scenarioMultiplier });
  }, [activeScenarioId, scenarioMultiplier]);

  const planVersions = useMemo(() => {
    return strategicPlanningService.getPlanVersions(selectedCompany);
  }, [selectedCompany]);

  // Executa os 8 testes do Golden Strategy Test Set
  const handleRunTests = () => {
    const results = strategicPlanningService.runGoldenTestSet();
    setTestResults(results);
  };

  // Submete plano v2.0 para aprovação formal na Fase 36
  const handleSubmitPlanApproval = () => {
    const req = strategicPlanningService.submitPlanForApproval('v2.0', 'Revisão orçamentária Q4 com foco em expansão no Polo de Camaçari e novos certames da COMPESA.');
    setApprovalFeedback(`Plano submetido com sucesso! Protocolo de Alçada: ${req.id} (Status: ${req.status})`);
    setTimeout(() => setApprovalFeedback(null), 6000);
  };

  const formatCurrency = (val) => {
    if (typeof val !== 'number') return val;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  };

  return (
    <div className="strategic-planning-container">
      
      {/* 1. HEADER ESTRATÉGICO */}
      <div className="strategic-header">
        <div className="strategic-header-title">
          <h1>
            <Target className="text-sky-400" size={26} />
            Planejamento Estratégico & Gestão de Portfólio
            <span className="badge-fase42">Fase 42</span>
          </h1>
          <p className="strategic-header-subtitle">
            Alinhamento executivo de mercado: Onde competir, Quando competir, Com qual serviço e Para qual comprador.
          </p>
        </div>

        <div className="strategic-header-controls">
          {/* Seletor Multiempresa (Itens 146 a 150) */}
          <div className="company-selector">
            <button 
              className={`company-btn ${selectedCompany === 'veeluen' ? 'active' : ''}`}
              onClick={() => setSelectedCompany('veeluen')}
            >
              Veeluen Solutions
            </button>
            <button 
              className={`company-btn excelencia ${selectedCompany === 'excelencia' ? 'active' : ''}`}
              onClick={() => setSelectedCompany('excelencia')}
            >
              Excelência Ambiental
            </button>
            <button 
              className={`company-btn ${selectedCompany === 'group' ? 'active' : ''}`}
              onClick={() => setSelectedCompany('group')}
            >
              Visão Consolidada
            </button>
          </div>

          {/* Toggle de Permissão Financeira para simulação RBAC */}
          <button 
            className="company-btn" 
            style={{ border: '1px solid rgba(148, 163, 184, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setCanViewFinancials(!canViewFinancials)}
            title="Alternar permissão de visualização financeira (RBAC)"
          >
            {canViewFinancials ? <ShieldCheck size={14} className="text-emerald-400" /> : <Lock size={14} className="text-rose-400" />}
            {canViewFinancials ? 'RBAC: Financeiro Ativo' : 'RBAC: Financeiro Oculto'}
          </button>
        </div>
      </div>

      {/* 2. BARRA DE ABAS DE NAVEGAÇÃO */}
      <div className="strategic-tabs-bar">
        <button 
          className={`strategic-tab-btn ${activeTab === 'visao-geral' ? 'active' : ''}`}
          onClick={() => setActiveTab('visao-geral')}
        >
          <BarChart3 size={16} /> Visão Geral (Board)
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          <Layers size={16} /> Portfólio & Serviços
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'mercados' ? 'active' : ''}`}
          onClick={() => setActiveTab('mercados')}
        >
          <MapPin size={16} /> Mercados & Regiões
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'compradores' ? 'active' : ''}`}
          onClick={() => setActiveTab('compradores')}
        >
          <Building2 size={16} /> Compradores Estratégicos
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'horizontes' ? 'active' : ''}`}
          onClick={() => setActiveTab('horizontes')}
        >
          <Clock size={16} /> Planos por Horizonte
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'calendario' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendario')}
        >
          <Calendar size={16} /> Calendário Estratégico
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'metas' ? 'active' : ''}`}
          onClick={() => setActiveTab('metas')}
        >
          <TrendingUp size={16} /> Metas (Plan vs Actual)
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'cenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('cenarios')}
        >
          <Sliders size={16} /> Cenários Sandbox
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'governanca' ? 'active' : ''}`}
          onClick={() => setActiveTab('governanca')}
        >
          <ShieldCheck size={16} /> Versões & Aprovação
        </button>
        <button 
          className={`strategic-tab-btn ${activeTab === 'testes' ? 'active' : ''}`}
          onClick={() => setActiveTab('testes')}
        >
          <CheckCircle size={16} /> Testes Golden Set (8/8)
        </button>
      </div>

      {/* FEEDBACK DE APROVAÇÃO SE HOUVER */}
      {approvalFeedback && (
        <div className="sandbox-alert-banner" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981', color: '#6ee7b7' }}>
          <CheckCircle size={18} />
          {approvalFeedback}
        </div>
      )}

      {/* ========================================================
          ABA 1: VISÃO GERAL (EXECUTIVE BOARD VIEW)
          Itens 134 a 139
          ======================================================== */}
      {activeTab === 'visao-geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Banner de Cobertura de Dados */}
          <div className="sandbox-alert-banner">
            <Info size={16} />
            <span>
              <strong>Cobertura de Dados:</strong> {boardView.dataCoverage}
            </span>
            <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
              Pipeline Mapeado: {canViewFinancials ? formatCurrency(boardView.strategicPipelineTotal) : '*** Restrito'}
            </span>
          </div>

          {/* Grid de 3 Prioridades, 3 Riscos e 3 Movimentos */}
          <div className="executive-summary-grid">
            
            {/* 3 Prioridades */}
            <div className="summary-card-column priorities">
              <div className="column-header">
                <Target size={18} className="text-sky-400" />
                3 Prioridades Estratégicas
              </div>
              {boardView.threePriorities.map(p => (
                <div key={p.num} className="item-numbered-card">
                  <div className="item-num-row">
                    <span>#{p.num}</span>
                    <span className="item-card-title">{p.title}</span>
                  </div>
                  <p className="item-card-desc">{p.detail}</p>
                </div>
              ))}
            </div>

            {/* 3 Riscos */}
            <div className="summary-card-column risks">
              <div className="column-header">
                <AlertTriangle size={18} className="text-rose-400" />
                3 Riscos Monitorados
              </div>
              {boardView.threeRiscos.map(r => (
                <div key={r.num} className="item-numbered-card">
                  <div className="item-num-row risk">
                    <span>#{r.num}</span>
                    <span className="item-card-title">{r.title}</span>
                  </div>
                  <p className="item-card-desc"><strong>Severidade:</strong> {r.severity}</p>
                  <p className="item-card-desc"><strong>Mitigação:</strong> {r.mitigation}</p>
                </div>
              ))}
            </div>

            {/* 3 Movimentos */}
            <div className="summary-card-column movements">
              <div className="column-header">
                <TrendingUp size={18} className="text-emerald-400" />
                3 Movimentos Recomendados
              </div>
              {boardView.threeMovements.map(m => (
                <div key={m.num} className="item-numbered-card">
                  <div className="item-num-row movement">
                    <span>#{m.num}</span>
                    <span className="item-card-title">{m.title}</span>
                  </div>
                  <p className="item-card-desc"><strong>Prazo:</strong> {m.timeline} | <strong>Owner:</strong> {m.owner}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Resumo Rápido de Iniciativas Ativas */}
          <div className="portfolio-matrix-section">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: '0.5rem 0 0 0' }}>
              Iniciativas Estratégicas em Execução ({initiatives.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
              {initiatives.map(init => (
                <div key={init.id} className="item-numbered-card" style={{ padding: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{init.id}</span>
                    <span className={`badge-strategy ${init.status === 'Em Andamento' ? 'expand' : 'develop'}`}>
                      {init.status}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: '0.3rem 0' }}>
                    {init.name}
                  </h4>
                  <p className="item-card-desc">{init.objective}</p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Progresso: {init.progressPct}%</span>
                    <span>Prazo: {init.targetDate}</span>
                  </div>
                  <div className="coverage-kpi-bar-mini" style={{ height: '6px' }}>
                    <div className="coverage-kpi-bar-fill" style={{ width: `${init.progressPct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 2: PORTFÓLIO & SERVIÇOS (MATRIZ DE ESTRATÉGIA)
          Itens 6 a 17 e 73 a 77
          ======================================================== */}
      {activeTab === 'portfolio' && (
        <div className="portfolio-matrix-section">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Matriz de Estratégia de Serviços & Competitividade
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Combinação entre Demanda Observada, Capacidade Técnica, Win Rate, Margem e Recomendações explicadas.
              </p>
            </div>
          </div>

          <div className="portfolio-table-container">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Demanda Observada</th>
                  <th>Win Rate</th>
                  {canViewFinancials && <th>Margem Média</th>}
                  {canViewFinancials && <th>Pipeline</th>}
                  <th>Capacidade Interna</th>
                  <th>Recomendação Vellia</th>
                  <th>Prioridade Gestão</th>
                  <th>Racional Estratégico</th>
                </tr>
              </thead>
              <tbody>
                {servicePortfolio.map(srv => (
                  <tr key={srv.id}>
                    <td>
                      <strong>{srv.name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{srv.recurrence}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{srv.observedDemand}</span>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{srv.demandCount} certames</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: srv.winRate >= 35 ? '#34d399' : '#f87171' }}>
                        {srv.winRate}%
                      </span>
                    </td>
                    {canViewFinancials && (
                      <td>
                        <span style={{ fontWeight: 600, color: srv.avgMargin >= 30 ? '#38bdf8' : '#e2e8f0' }}>
                          {srv.avgMargin}%
                        </span>
                      </td>
                    )}
                    {canViewFinancials && (
                      <td>
                        <strong>{typeof srv.pipelineValue === 'number' ? formatCurrency(srv.pipelineValue) : srv.pipelineValue}</strong>
                      </td>
                    )}
                    <td>
                      <span style={{ fontSize: '0.8rem' }}>{srv.internalCapacity}</span>
                    </td>
                    <td>
                      <span className={`badge-strategy ${
                        srv.systemRecommendation === StrategyClassification.DEFEND ? 'defend' :
                        srv.systemRecommendation === StrategyClassification.EXPAND ? 'expand' :
                        srv.systemRecommendation === StrategyClassification.DEVELOP ? 'develop' : 'monitor'
                      }`}>
                        {srv.systemRecommendation}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 700, 
                        color: srv.managementPriority === 'Alta' ? '#38bdf8' : (srv.managementPriority === 'Média' ? '#fbbf24' : '#94a3b8')
                      }}>
                        {srv.managementPriority}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {srv.strategicRationale}
                      {srv.capacityGaps.length > 0 && (
                        <div style={{ marginTop: '0.3rem', color: '#f87171', fontSize: '0.72rem' }}>
                          ⚠️ <strong>Gap:</strong> {srv.capacityGaps[0].description}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 3: MERCADOS & REGIÕES (ESTRATÉGIA GEOGRÁFICA)
          Itens 18 a 22
          ======================================================== */}
      {activeTab === 'mercados' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Priorização Geográfica e Mercados Regionais
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
              Classificação transparente por densidade de licitações: Core Market, Expansão, Monitoramento ou Dados Insuficientes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {geographicMarkets.map(mkt => (
              <div key={mkt.id} className="item-numbered-card" style={{ padding: '1.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={18} className="text-sky-400" />
                    <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                      {mkt.state} — {mkt.region}
                    </span>
                  </div>
                  <span className={`badge-strategy ${
                    mkt.classification === GeographicClassification.CORE_MARKET ? 'defend' :
                    mkt.classification === GeographicClassification.EXPANSION_MARKET ? 'expand' :
                    mkt.classification === GeographicClassification.MONITOR ? 'develop' : 'monitor'
                  }`}>
                    {mkt.classification}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0.4rem 0' }}>
                  Polos & Cidades: {mkt.cities.join(', ')}
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '6px', padding: '0.6rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div><strong>Demanda:</strong> {mkt.observedDemand}</div>
                  <div><strong>Win Rate Local:</strong> {mkt.winRate}%</div>
                  <div><strong>Presença da Empresa:</strong> {mkt.clientPresence}</div>
                </div>

                <p className="item-card-desc" style={{ marginTop: '0.4rem' }}>
                  {mkt.strategicVerdict}
                </p>

                {mkt.keyCompetitors.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '0.4rem' }}>
                    <strong>Concorrentes observados:</strong> {mkt.keyCompetitors.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 4: COMPRADORES ESTRATÉGICOS & CONCENTRAÇÃO
          Itens 23 a 40
          ======================================================== */}
      {activeTab === 'compradores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Barra de Account Coverage (Itens 30 a 32) */}
          <div className="coverage-kpi-bar">
            <div className="coverage-kpi-card">
              <span className="coverage-kpi-label">Contas com Owner Designado</span>
              <span className="coverage-kpi-value">{accountCoverage.withOwnerPct}%</span>
              <div className="coverage-kpi-bar-mini">
                <div className="coverage-kpi-bar-fill" style={{ width: `${accountCoverage.withOwnerPct}%` }} />
              </div>
            </div>

            <div className="coverage-kpi-card">
              <span className="coverage-kpi-label">Contas com Contato Ativo (CRM)</span>
              <span className="coverage-kpi-value">{accountCoverage.withContactPct}%</span>
              <div className="coverage-kpi-bar-mini">
                <div className="coverage-kpi-bar-fill" style={{ width: `${accountCoverage.withContactPct}%` }} />
              </div>
            </div>

            <div className="coverage-kpi-card">
              <span className="coverage-kpi-label">Contas com Plano Estratégico</span>
              <span className="coverage-kpi-value">{accountCoverage.withPlanPct}%</span>
              <div className="coverage-kpi-bar-mini">
                <div className="coverage-kpi-bar-fill" style={{ width: `${accountCoverage.withPlanPct}%` }} />
              </div>
            </div>

            <div className="coverage-kpi-card">
              <span className="coverage-kpi-label">Contas com Próxima Ação Agendada</span>
              <span className="coverage-kpi-value">{accountCoverage.withNextActionPct}%</span>
              <div className="coverage-kpi-bar-mini">
                <div className="coverage-kpi-bar-fill" style={{ width: `${accountCoverage.withNextActionPct}%` }} />
              </div>
            </div>
          </div>

          {/* Análise de Risco de Concentração (Itens 33 a 40) */}
          <div className="summary-card-column risks" style={{ background: 'rgba(30, 41, 59, 0.4)' }}>
            <div className="column-header">
              <AlertTriangle size={18} className="text-rose-400" />
              Diagnóstico de Risco de Concentração de Pipeline
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="item-numbered-card">
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Concentração no Maior Comprador</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f43f5e' }}>
                  {concentrationRisk.topBuyerShare.sharePct}%
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{concentrationRisk.topBuyerShare.buyerName}</span>
                <p className="item-card-desc">{concentrationRisk.topBuyerShare.context}</p>
              </div>

              <div className="item-numbered-card">
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Concentração no Maior Serviço</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>
                  {concentrationRisk.topServiceShare.sharePct}%
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{concentrationRisk.topServiceShare.serviceName}</span>
                <p className="item-card-desc">{concentrationRisk.topServiceShare.context}</p>
              </div>

              <div className="item-numbered-card">
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Concentração no Maior Estado</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>
                  {concentrationRisk.topRegionShare.sharePct}%
                </span>
                <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{concentrationRisk.topRegionShare.regionName}</span>
                <p className="item-card-desc">{concentrationRisk.topRegionShare.context}</p>
              </div>
            </div>
          </div>

          {/* Tabela de Compradores */}
          <div className="portfolio-table-container">
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Organização Compradora</th>
                  <th>Classificação</th>
                  <th>Recorrência / Histórico</th>
                  <th>Win Rate</th>
                  <th>Owner</th>
                  <th>Contato Ativo</th>
                  <th>Próxima Ação Estratégica</th>
                </tr>
              </thead>
              <tbody>
                {strategicBuyers.map(buyer => (
                  <tr key={buyer.id}>
                    <td>
                      <strong>{buyer.organizationName}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CNPJ: {buyer.cnpj}</div>
                    </td>
                    <td>
                      <span className={`badge-strategy ${
                        buyer.classification === BuyerClassification.STRATEGIC ? 'defend' :
                        buyer.classification === BuyerClassification.GROWTH ? 'expand' :
                        buyer.classification === BuyerClassification.MAINTAIN ? 'develop' : 'monitor'
                      }`}>
                        {buyer.classification}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>{buyer.recurrenceLevel}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{buyer.volumeObserved}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{buyer.winRateWithBuyer}%</span>
                    </td>
                    <td>
                      {buyer.coverage.hasOwner ? (
                        <span style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>{buyer.coverage.ownerName}</span>
                      ) : (
                        <span style={{ color: '#f87171', fontSize: '0.78rem' }}>⚠️ Sem Owner</span>
                      )}
                    </td>
                    <td>
                      {buyer.coverage.hasActiveContact ? (
                        <span style={{ fontSize: '0.82rem', color: '#34d399' }}>{buyer.coverage.contactName}</span>
                      ) : (
                        <span style={{ color: '#f87171', fontSize: '0.78rem' }}>⚠️ Sem Contato</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '0.8rem' }}>
                      {buyer.coverage.hasNextAction ? (
                        buyer.coverage.nextActionDescription
                      ) : (
                        <span style={{ color: '#f87171' }}>⚠️ Nenhuma ação agendada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 5: PLANOS POR HORIZONTE (90, 180 E 365 DIAS)
          Itens 49 a 53
          ======================================================== */}
      {activeTab === 'horizontes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            
            {/* Plano 90 Dias */}
            <div className="summary-card-column priorities">
              <div className="column-header">
                <Clock size={18} className="text-sky-400" />
                {plan90Days.horizon}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                <strong>Foco Principal:</strong> {plan90Days.focus}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>Ações Imediatas:</span>
                {plan90Days.keyActions.map((act, i) => (
                  <div key={i} className="item-numbered-card" style={{ padding: '0.7rem' }}>
                    <p className="item-card-desc" style={{ color: '#e2e8f0' }}>• {act}</p>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '0.5rem' }}>
                <strong>Mitigação:</strong> {plan90Days.riskMitigation}
              </div>
            </div>

            {/* Plano 180 Dias */}
            <div className="summary-card-column movements">
              <div className="column-header">
                <Calendar size={18} className="text-emerald-400" />
                {plan180Days.horizon}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                <strong>Foco Principal:</strong> {plan180Days.focus}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>Ações de Médio Prazo:</span>
                {plan180Days.keyActions.map((act, i) => (
                  <div key={i} className="item-numbered-card" style={{ padding: '0.7rem' }}>
                    <p className="item-card-desc" style={{ color: '#e2e8f0' }}>• {act}</p>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '0.5rem' }}>
                <strong>Mitigação:</strong> {plan180Days.riskMitigation}
              </div>
            </div>

            {/* Plano 12 Meses */}
            <div className="summary-card-column" style={{ borderTop: '3px solid #a855f7' }}>
              <div className="column-header">
                <Compass size={18} className="text-purple-400" />
                {plan365Days.horizon}
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                <strong>Foco Principal:</strong> {plan365Days.focus}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff' }}>Diretrizes Anuais:</span>
                {plan365Days.keyActions.map((act, i) => (
                  <div key={i} className="item-numbered-card" style={{ padding: '0.7rem' }}>
                    <p className="item-card-desc" style={{ color: '#e2e8f0' }}>• {act}</p>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '0.5rem' }}>
                <strong>Mitigação:</strong> {plan365Days.riskMitigation}
              </div>
            </div>

          </div>

          {/* Vencimentos de Contratos Alimentando o Planejamento (Itens 41 a 44) */}
          <div className="summary-card-column risks" style={{ background: 'rgba(30, 41, 59, 0.4)' }}>
            <div className="column-header">
              <AlertTriangle size={18} className="text-amber-400" />
              Contratos Vigentes Alimentando os Horizontes Estratégicos
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f87171' }}>Horizonte 0–90 Dias</span>
                {contractExpiries.horizon90Days.map(c => (
                  <div key={c.id} className="item-numbered-card" style={{ marginTop: '0.4rem' }}>
                    <strong>{c.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#f43f5e' }}>Vence em {c.daysRemaining} dias ({c.expiryDate})</span>
                    <p className="item-card-desc">{c.actionRequired}</p>
                  </div>
                ))}
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fbbf24' }}>Horizonte 91–180 Dias</span>
                {contractExpiries.horizon180Days.map(c => (
                  <div key={c.id} className="item-numbered-card" style={{ marginTop: '0.4rem' }}>
                    <strong>{c.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Vence em {c.daysRemaining} dias ({c.expiryDate})</span>
                    <p className="item-card-desc">{c.actionRequired}</p>
                  </div>
                ))}
              </div>

              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>Horizonte 181–365 Dias</span>
                {contractExpiries.horizon365Days.map(c => (
                  <div key={c.id} className="item-numbered-card" style={{ marginTop: '0.4rem' }}>
                    <strong>{c.title}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Vence em {c.daysRemaining} dias ({c.expiryDate})</span>
                    <p className="item-card-desc">{c.actionRequired}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 6: CALENDÁRIO ESTRATÉGICO (PROCUREMENT CALENDAR)
          Itens 45 a 48
          ======================================================== */}
      {activeTab === 'calendario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Calendário Estratégico de Licitações & Previsão de Editais
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
              Diferenciação clara entre fatos consolidados, planejamentos do PCA e previsões algorítmicas.
            </p>
          </div>

          <div className="calendar-grid">
            {procurementCalendar.map(cal => (
              <div key={cal.id} className="calendar-card">
                <span className={`calendar-badge-type ${
                  cal.type === CalendarItemType.OPEN ? 'open' :
                  cal.type === CalendarItemType.PLANNED ? 'planned' :
                  cal.type === CalendarItemType.PREDICTED ? 'predicted' : 'observed'
                }`}>
                  {cal.type}
                </span>

                <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                  {cal.title}
                </h4>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  <strong>Comprador:</strong> {cal.buyer}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
                  <span>Data: <strong>{cal.date}</strong></span>
                  <span>Est.: <strong>{formatCurrency(cal.estimatedValue)}</strong></span>
                </div>

                <p className="item-card-desc">
                  <strong>Status:</strong> {cal.statusLabel}
                </p>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '0.4rem' }}>
                  Fonte: {cal.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 7: METAS & SCORECARD (PLAN VS ACTUAL)
          Itens 54 a 61 e 125 a 128
          ======================================================== */}
      {activeTab === 'metas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Scorecard de Metas Estratégicas (Plan vs Actual)
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
              Acompanhamento quantitativo, percentual e financeiro com histórico transparente de medições.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {goals.map(g => (
              <div key={g.id} className="item-numbered-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{g.category}</span>
                  <span className={`badge-strategy ${g.status === 'ON_TRACK' ? 'defend' : 'develop'}`}>
                    {g.status === 'ON_TRACK' ? 'No Alvo' : 'Atenção / Risco'}
                  </span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', margin: '0.4rem 0' }}>
                  {g.title}
                </h4>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', margin: '0.5rem 0' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff' }}>
                    {g.metricType === 'VALUE' ? formatCurrency(g.currentValue) : `${g.currentValue} ${g.unit}`}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    (Meta: {g.metricType === 'VALUE' ? formatCurrency(g.targetValue) : `${g.targetValue} ${g.unit}`})
                  </span>
                </div>

                <div className="coverage-kpi-bar-mini" style={{ height: '6px' }}>
                  <div 
                    className="coverage-kpi-bar-fill" 
                    style={{ 
                      width: `${Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))}%`,
                      background: g.status === 'ON_TRACK' ? '#10b981' : '#f59e0b'
                    }} 
                  />
                </div>

                {g.history && g.history.length > 0 && (
                  <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <strong>Última medição ({g.history[g.history.length - 1].date}):</strong> {g.history[g.history.length - 1].note}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          ABA 8: CENÁRIOS ESTRATÉGICOS (SANDBOX)
          Itens 78 a 85
          ======================================================== */}
      {activeTab === 'cenarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="sandbox-alert-banner">
            <Sliders size={18} />
            <span>
              <strong>Ambiente Sandbox Isolado:</strong> A edição de multiplicadores e simulação de cenários afeta somente as projeções de planejamento. Nenhuma proposta real, preço cadastrado ou certame operacional é modificado.
            </span>
          </div>

          <div className="scenarios-grid">
            {scenarios.map(sc => (
              <div 
                key={sc.id} 
                className={`scenario-card ${activeScenarioId === sc.id ? 'active-scenario' : ''}`}
                onClick={() => {
                  setActiveScenarioId(sc.id);
                  setScenarioMultiplier(sc.pipelineMultiplier);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{sc.type}</span>
                  {activeScenarioId === sc.id && (
                    <span className="badge-strategy defend">Ativo no Sandbox</span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
                  {sc.name}
                </h3>

                <p className="item-card-desc">{sc.description}</p>

                <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '6px', padding: '0.6rem', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div>Receita Projetada: <strong>{formatCurrency(sc.expectedRevenue)}</strong></div>
                  <div>Win Rate Alvo: <strong>{sc.winRateTarget}%</strong></div>
                  <div>Capex Previsto: <strong>{formatCurrency(sc.plannedCapex)}</strong></div>
                  <div>Nível de Risco: <strong>{sc.riskLevel}</strong></div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Foco: {sc.focusServices.join(', ')}
                </div>
              </div>
            ))}
          </div>

          {/* Painel de Ajuste Interativo do Sandbox */}
          <div className="item-numbered-card" style={{ padding: '1.25rem', background: 'rgba(30, 41, 59, 0.5)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: '0 0 0.5rem 0' }}>
              Simulação Dinâmica do Cenário: {simulatedScenario.name}
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '0.8rem 0' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  Multiplicador de Pipeline ({scenarioMultiplier.toFixed(2)}x):
                </label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2.0" 
                  step="0.05"
                  value={scenarioMultiplier}
                  onChange={(e) => setScenarioMultiplier(parseFloat(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ minWidth: '220px', background: 'rgba(15, 23, 42, 0.6)', padding: '0.8rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Receita Estimada Simulada:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                  {formatCurrency(simulatedScenario.projectedRevenue)}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
              {simulatedScenario.simulationNote}
            </p>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 9: VERSÕES, SNAPSHOTS E APROVAÇÃO (FASE 36 & 41)
          Itens 118 a 124 e 140 a 142
          ======================================================== */}
      {activeTab === 'governanca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Governança, Versionamento e Aprovação de Alçadas
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Planos aprovados são congelados em snapshots imutáveis. Alterações geram novas versões auditáveis.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                className="company-btn" 
                style={{ background: '#0284c7', color: '#ffffff', fontWeight: 600 }}
                onClick={handleSubmitPlanApproval}
              >
                Submeter Plano v2.0 para Aprovação
              </button>

              {onNavigateToReports && (
                <button 
                  className="company-btn"
                  style={{ background: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8' }}
                  onClick={onNavigateToReports}
                >
                  <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Gerar Relatório Estratégico (Fase 41)
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {planVersions.map(pv => (
              <div key={pv.version} className="item-numbered-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>{pv.version}</span>
                  <span className={`badge-strategy ${pv.status === 'Aprovado' ? 'defend' : 'develop'}`}>
                    {pv.status}
                  </span>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#f8fafc', margin: '0.4rem 0' }}>
                  {pv.planName}
                </h4>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Criado em: {new Date(pv.createdAt).toLocaleDateString('pt-BR')}
                </div>

                {pv.approvedAt && (
                  <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '0.2rem' }}>
                    Aprovado por: {pv.approvedBy}
                  </div>
                )}

                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.5rem', background: 'rgba(15, 23, 42, 0.4)', padding: '0.5rem', borderRadius: '4px' }}>
                  <strong>Resumo da Versão:</strong> {pv.changeSummary}
                </div>

                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem' }}>
                  Snapshot Imutável: <code>{pv.snapshotId}</code>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 10: SUÍTE DE TESTES AUTOMATIZADOS (GOLDEN STRATEGY TEST SET)
          Itens 155 a 162
          ======================================================== */}
      {activeTab === 'testes' && (
        <div className="golden-test-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Suíte de Testes Automatizados — Golden Strategy Test Set
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Validação formal dos 8 cenários exigidos na especificação da Fase 42.
              </p>
            </div>

            <button 
              className="company-btn" 
              style={{ background: '#0284c7', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={handleRunTests}
            >
              <RefreshCw size={14} /> Executar Testes Agora
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
            {(testResults || strategicPlanningService.runGoldenTestSet()).map(t => (
              <div key={t.testNumber} className={`golden-test-item ${t.passed ? 'passed' : 'failed'}`}>
                {t.passed ? <CheckCircle size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-rose-400" />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                    Teste #{t.testNumber}: {t.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    {t.details}
                  </div>
                </div>
                <span className={`badge-strategy ${t.passed ? 'defend' : 'risks'}`} style={{ alignSelf: 'center' }}>
                  {t.passed ? 'PASSOU' : 'FALHOU'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
