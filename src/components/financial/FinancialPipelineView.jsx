/**
 * VELLIA LICITAÇÕES — FASE 43
 * COMPONENTE: INTELIGÊNCIA FINANCEIRA DO PIPELINE + FORECAST + RISCO + CONCENTRAÇÃO
 */

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  PieChart, 
  BarChart3, 
  FileText, 
  Sliders, 
  Clock, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Info, 
  Target, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { 
  financialPipelineService, 
  ForecastCategory, 
  QualificationStatus, 
  FinancialRiskLevel 
} from '../../services/financial/financialPipelineService.js';
import './FinancialPipelineView.css';

export default function FinancialPipelineView({ onNavigateToReports, onSelectOpportunity }) {
  // Estado de empresa selecionada: 'veeluen', 'excelencia', 'group'
  const [selectedCompany, setSelectedCompany] = useState('veeluen');
  // Aba ativa
  const [activeTab, setActiveTab] = useState('visao-geral');
  // Controle RBAC de permissão de visualização de margens (Item 85 e 173)
  const [canViewMargins, setCanViewMargins] = useState(true);
  // Filtro de drill-down na tabela
  const [tableFilter, setTableFilter] = useState('ALL'); // 'ALL', 'QUALIFIED', 'RISK', 'COMMIT'
  // Cenário What-If selecionado no sandbox
  const [activeWhatIf, setActiveWhatIf] = useState('WIN_MAJOR');
  // Resultados dos 10 testes do Golden Financial Set
  const [testResults, setTestResults] = useState(null);

  // Dados reativos carregados do serviço
  const financialSummary = useMemo(() => {
    return financialPipelineService.getPipelineFinancialSummary(selectedCompany, { canViewMargins });
  }, [selectedCompany, canViewMargins]);

  const concentration = useMemo(() => {
    return financialPipelineService.getConcentrationAnalysis(selectedCompany);
  }, [selectedCompany]);

  const riskDetails = useMemo(() => {
    return financialPipelineService.getPipelineAtRiskDetails(selectedCompany);
  }, [selectedCompany]);

  const marginDist = useMemo(() => {
    return financialPipelineService.getMarginDistribution(selectedCompany, { canViewMargins });
  }, [selectedCompany, canViewMargins]);

  const hygiene = useMemo(() => {
    return financialPipelineService.getPipelineHygieneAudit(selectedCompany);
  }, [selectedCompany]);

  const whatIfResult = useMemo(() => {
    return financialPipelineService.simulateWhatIfScenario(activeWhatIf, null, selectedCompany);
  }, [activeWhatIf, selectedCompany]);

  const allOpportunities = useMemo(() => {
    return financialPipelineService.getOpportunities(selectedCompany);
  }, [selectedCompany]);

  // Lista filtrada para tabela de drill-down
  const displayedOpportunities = useMemo(() => {
    if (tableFilter === 'QUALIFIED') {
      return allOpportunities.filter(o => o.qualificationStatus === QualificationStatus.QUALIFIED && o.hasKnownValue);
    }
    if (tableFilter === 'RISK') {
      return allOpportunities.filter(o => o.isAtRisk && o.hasKnownValue);
    }
    if (tableFilter === 'COMMIT') {
      return allOpportunities.filter(o => o.forecastCategory === ForecastCategory.COMMIT && o.hasKnownValue);
    }
    return allOpportunities;
  }, [allOpportunities, tableFilter]);

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return 'Não informado';
    return `R$ ${Number(val).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;
  };

  const handleRunTests = () => {
    const res = financialPipelineService.runGoldenFinancialTestSet();
    setTestResults(res);
  };

  return (
    <div className="financial-pipeline-container">
      
      {/* 1. HEADER DO MÓDULO */}
      <div className="financial-header">
        <div className="financial-header-title">
          <h1>
            <DollarSign className="text-emerald-400" size={26} />
            Inteligência Financeira do Pipeline
            <span className="badge-fase43">Fase 43</span>
          </h1>
          <p className="financial-header-subtitle">
            Valor Real, Forecast Qualificado, Margem Potencial, Risco sem Dupla Contagem e Exposição de Concentração.
          </p>
        </div>

        <div className="financial-header-controls">
          {/* Seletor Multiempresa (Itens 29 a 31 e 162 a 163) */}
          <div className="company-toggle-group">
            <button 
              className={`company-toggle-btn ${selectedCompany === 'veeluen' ? 'active' : ''}`}
              onClick={() => setSelectedCompany('veeluen')}
            >
              Veeluen Solutions
            </button>
            <button 
              className={`company-toggle-btn excelencia ${selectedCompany === 'excelencia' ? 'active' : ''}`}
              onClick={() => setSelectedCompany('excelencia')}
            >
              Excelência Ambiental
            </button>
            <button 
              className={`company-toggle-btn ${selectedCompany === 'group' ? 'active' : ''}`}
              onClick={() => setSelectedCompany('group')}
            >
              Grupo Consolidado
            </button>
          </div>

          {/* Toggle de Simulação RBAC (Itens 85 e 173) */}
          <button 
            className="company-toggle-btn"
            style={{ border: '1px solid rgba(148, 163, 184, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setCanViewMargins(!canViewMargins)}
            title="Alternar permissão de visualização de margens (RBAC)"
          >
            {canViewMargins ? <Unlock size={14} className="text-emerald-400" /> : <Lock size={14} className="text-rose-400" />}
            {canViewMargins ? 'RBAC: Margens Liberadas' : 'RBAC: Margens Ocultas'}
          </button>
        </div>
      </div>

      {/* 2. BARRA DE ABAS */}
      <div className="financial-tabs-bar">
        <button 
          className={`financial-tab-btn ${activeTab === 'visao-geral' ? 'active' : ''}`}
          onClick={() => setActiveTab('visao-geral')}
        >
          <BarChart3 size={16} /> Visão Geral Executiva
        </button>
        <button 
          className={`financial-tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecast')}
        >
          <TrendingUp size={16} /> Forecast & Maturidade
        </button>
        <button 
          className={`financial-tab-btn ${activeTab === 'risco' ? 'active' : ''}`}
          onClick={() => setActiveTab('risco')}
        >
          <AlertTriangle size={16} /> Valor em Risco ({financialSummary.atRiskCount})
        </button>
        <button 
          className={`financial-tab-btn ${activeTab === 'margem' ? 'active' : ''}`}
          onClick={() => setActiveTab('margem')}
        >
          <PieChart size={16} /> Margem Potencial
        </button>
        <button 
          className={`financial-tab-btn ${activeTab === 'concentracao' ? 'active' : ''}`}
          onClick={() => setActiveTab('concentracao')}
        >
          <Layers size={16} /> Risco de Concentração
        </button>
        <button 
          className={`financial-tab-btn ${activeTab === 'cenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('cenarios')}
        >
          <Sliders size={16} /> Cenários What-If (Sandbox)
        </button>
        <button 
          className={`financial-tab-btn ${activeTab === 'higiene' ? 'active' : ''}`}
          onClick={() => setActiveTab('higiene')}
        >
          <ShieldAlert size={16} /> Higiene do Pipeline
        </button>
        <button 
          className={`financial-tab-btn ${activeTab === 'metas' ? 'active' : ''}`}
          onClick={() => setActiveTab('metas')}
        >
          <Target size={16} /> Metas & Cobertura
        </button>
        <button 
          className={`financial-tab-btn ${activeTab === 'testes' ? 'active' : ''}`}
          onClick={() => setActiveTab('testes')}
        >
          <CheckCircle size={16} /> Testes Golden Set (10/10)
        </button>
      </div>

      {/* BANNER DE COBERTURA DE DADOS (Itens 4 a 6) */}
      <div className="financial-coverage-banner">
        <Info size={16} />
        <span>
          <strong>Data Coverage:</strong> {financialSummary.dataCoverageMessage}
        </span>
        <span style={{ marginLeft: 'auto', fontWeight: 600 }}>
          Qualidade do Forecast: <span className="text-emerald-400">{financialSummary.forecastQuality}</span>
        </span>
      </div>

      {/* ========================================================
          ABA 1: VISÃO GERAL EXECUTIVA
          Itens 97 a 101 da especificação
          ======================================================== */}
      {activeTab === 'visao-geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Grade de 4 Cards Executivos Superiores */}
          <div className="executive-cards-grid">
            
            {/* Card 1: Pipeline Bruto */}
            <div className="executive-card primary" onClick={() => setTableFilter('ALL')} style={{ cursor: 'pointer' }}>
              <div className="card-label">
                <span>Pipeline Bruto (Conhecido)</span>
                <Info size={14} />
              </div>
              <div className="card-value">{formatCurrency(financialSummary.grossValue)}</div>
              <div className="card-subtext">
                {financialSummary.knownValueCount} certames com valor conhecido ({financialSummary.unknownValueCount} não informado)
              </div>
            </div>

            {/* Card 2: Pipeline Qualificado */}
            <div className="executive-card success" onClick={() => setTableFilter('QUALIFIED')} style={{ cursor: 'pointer' }}>
              <div className="card-label">
                <span>Pipeline Qualificado</span>
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <div className="card-value">{formatCurrency(financialSummary.qualifiedValue)}</div>
              <div className="card-subtext">
                Oportunidades ativas com aderência e Go formal
              </div>
            </div>

            {/* Card 3: Pipeline Ponderado (Forecast) */}
            <div className="executive-card primary">
              <div className="card-label">
                <span>Pipeline Ponderado</span>
                <TrendingUp size={14} className="text-sky-400" />
              </div>
              <div className="card-value">{formatCurrency(financialSummary.weightedValue)}</div>
              <div className="card-subtext">
                Baseado nos Pesos de Forecast por estágio
              </div>
            </div>

            {/* Card 4: Valor em Risco (Sem Dupla Contagem) */}
            <div className="executive-card danger" onClick={() => setTableFilter('RISK')} style={{ cursor: 'pointer' }}>
              <div className="card-label">
                <span>Valor em Risco</span>
                <AlertTriangle size={14} className="text-rose-400" />
              </div>
              <div className="card-value text-rose-400">{formatCurrency(financialSummary.pipelineAtRiskValue)}</div>
              <div className="card-subtext">
                {financialSummary.atRiskCount} oportunidade(s) com risco crítico ou alto
              </div>
            </div>

          </div>

          {/* Segunda Linha de Cards Executivos: Commit, Margem Potencial, Meta e Gap */}
          <div className="executive-cards-grid">
            
            {/* Commit */}
            <div className="executive-card success" onClick={() => setTableFilter('COMMIT')} style={{ cursor: 'pointer' }}>
              <div className="card-label">
                <span>Commit (Fase Final)</span>
                <ShieldCheck size={14} />
              </div>
              <div className="card-value">{formatCurrency(financialSummary.commitValue)}</div>
              <div className="card-subtext">
                Contratos iminentes e posições consolidadas
              </div>
            </div>

            {/* Margem Potencial (Blindada por RBAC) */}
            <div className="executive-card warning">
              <div className="card-label">
                <span>Margem Potencial</span>
                {canViewMargins ? <PieChart size={14} /> : <Lock size={14} />}
              </div>
              <div className="card-value">
                {canViewMargins ? formatCurrency(financialSummary.potentialGrossMarginValue) : 'Acesso Restrito'}
              </div>
              <div className="card-subtext">
                {canViewMargins ? `Margem média de ${financialSummary.avgMarginPct}% sobre propostas com custo` : 'Perfil sem alçada de margem (RBAC)'}
              </div>
            </div>

            {/* Meta do Trimestre */}
            <div className="executive-card primary">
              <div className="card-label">
                <span>Meta do Trimestre</span>
                <Target size={14} />
              </div>
              <div className="card-value">{formatCurrency(financialSummary.targetQuarter)}</div>
              <div className="card-subtext">
                Cobertura do pipeline: {financialSummary.coverageRatio}x sobre a meta
              </div>
            </div>

            {/* Gap de Meta */}
            <div className="executive-card warning">
              <div className="card-label">
                <span>Gap para a Meta</span>
                <AlertCircle size={14} />
              </div>
              <div className="card-value text-amber-400">{formatCurrency(financialSummary.targetGap)}</div>
              <div className="card-subtext">
                {financialSummary.targetGap === 0 ? 'Meta superada pelo ponderado!' : 'Necessário acelerar qualificação de propostas'}
              </div>
            </div>

          </div>

          {/* Tabela Interativa de Oportunidades com Drill-Down (Item 100 e 101) */}
          <div className="financial-table-container">
            <div style={{ padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.7)', borderBottom: '1px solid rgba(148, 163, 184, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#ffffff' }}>Oportunidades em Análise Financeira</strong>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                  (Exibindo {displayedOpportunities.length} itens — Filtro: {tableFilter})
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className={`company-toggle-btn ${tableFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setTableFilter('ALL')}
                >
                  Todas
                </button>
                <button 
                  className={`company-toggle-btn ${tableFilter === 'QUALIFIED' ? 'active' : ''}`}
                  onClick={() => setTableFilter('QUALIFIED')}
                >
                  Qualificadas
                </button>
                <button 
                  className={`company-toggle-btn ${tableFilter === 'COMMIT' ? 'active' : ''}`}
                  onClick={() => setTableFilter('COMMIT')}
                >
                  Commit
                </button>
                <button 
                  className={`company-toggle-btn ${tableFilter === 'RISK' ? 'active' : ''}`}
                  onClick={() => setTableFilter('RISK')}
                >
                  Em Risco
                </button>
              </div>
            </div>

            <table className="financial-table">
              <thead>
                <tr>
                  <th>Edital / Certame</th>
                  <th>Cliente & Região</th>
                  <th>Estágio & Peso</th>
                  <th>Valor Bruto</th>
                  <th>Valor Ponderado</th>
                  {canViewMargins && <th>Margem Potencial</th>}
                  <th>Maturidade</th>
                  <th>Risco / Alertas</th>
                  <th>Responsável</th>
                </tr>
              </thead>
              <tbody>
                {displayedOpportunities.map(opp => (
                  <tr key={opp.id} onClick={() => onSelectOpportunity && onSelectOpportunity(opp)} style={{ cursor: 'pointer' }}>
                    <td>
                      <strong>{opp.number}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {opp.title}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{opp.client}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{opp.region}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#38bdf8' }}>{opp.stage}</span>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Peso: {Math.round(opp.stageWeight * 100)}%</div>
                    </td>
                    <td>
                      <strong>{opp.hasKnownValue ? formatCurrency(opp.grossValue) : <span style={{ color: '#94a3b8' }}>Não informado</span>}</strong>
                    </td>
                    <td>
                      <strong style={{ color: '#34d399' }}>
                        {opp.hasKnownValue ? formatCurrency(Math.round(opp.grossValue * opp.stageWeight)) : '—'}
                      </strong>
                    </td>
                    {canViewMargins && (
                      <td>
                        {opp.marginPct !== null ? (
                          <div>
                            <span style={{ fontWeight: 600, color: opp.marginPct < 20 ? '#fbbf24' : '#34d399' }}>
                              {opp.marginPct}%
                            </span>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{formatCurrency(opp.marginValue)}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Sem custo</span>
                        )}
                      </td>
                    )}
                    <td>
                      <span className={`badge-forecast-category ${
                        opp.forecastCategory === ForecastCategory.COMMIT ? 'commit' :
                        opp.forecastCategory === ForecastCategory.BEST_CASE ? 'best-case' :
                        opp.forecastCategory === ForecastCategory.PIPELINE ? 'pipeline' : 'upside'
                      }`}>
                        {opp.forecastCategory}
                      </span>
                    </td>
                    <td>
                      {opp.isAtRisk ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f87171', fontSize: '0.78rem' }}>
                          <AlertTriangle size={14} />
                          <span>{opp.riskReasons?.join(', ')}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#34d399', fontSize: '0.78rem' }}>Sem blockers</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: opp.owner ? '#e2e8f0' : '#f87171' }}>
                        {opp.owner || '⚠️ Sem owner'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 2: FORECAST & MATURIDADE
          Itens 56 a 63 e 11 a 19
          ======================================================== */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="maturity-waterfall-grid">
            
            {/* Commit */}
            <div className="maturity-card commit">
              <span className="badge-forecast-category commit">Commit</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
                {formatCurrency(financialSummary.commitValue)}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Oportunidades em fase de contratação ou com vitória virtualmente assegurada.
              </p>
            </div>

            {/* Best Case */}
            <div className="maturity-card best-case">
              <span className="badge-forecast-category best-case">Best Case</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
                {formatCurrency(financialSummary.bestCaseValue)}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Soma de Commit + Propostas maduras bem qualificadas perante os concorrentes.
              </p>
            </div>

            {/* Pipeline Ponderado */}
            <div className="maturity-card pipeline">
              <span className="badge-forecast-category pipeline">Weighted Pipeline</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
                {formatCurrency(financialSummary.weightedValue)}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Valor calibrado pelo peso de forecast de cada estágio operacional.
              </p>
            </div>

            {/* Upside */}
            <div className="maturity-card upside">
              <span className="badge-forecast-category upside">Upside (Radar)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
                {formatCurrency(financialSummary.upsideValue)}
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Oportunidades em estágio inicial de radar (não contabilizadas no forecast principal).
              </p>
            </div>

          </div>

          {/* Calibração Histórica de Pesos (Itens 17 a 19) */}
          <div className="financial-coverage-banner" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#fde68a' }}>
            <AlertCircle size={18} />
            <span>
              <strong>Aviso de Calibração Histórica:</strong> Os pesos de forecast utilizados (Proposta: 60%, Finalista: 80%) são parâmetros formais de planejamento. A taxa de conversão observada para propostas nos últimos 12 meses foi de 38.5%.
            </span>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 3: VALOR EM RISCO (SEM DUPLA CONTAGEM)
          Itens 44 a 51 da especificação
          ======================================================== */}
      {activeTab === 'risco' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="risk-breakdown-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f43f5e', margin: 0 }}>
                  Valor Total em Risco: {formatCurrency(riskDetails.totalRiskValue)}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.2rem 0 0 0' }}>
                  {riskDetails.auditRule}
                </p>
              </div>
              <span className="badge-strategy risks" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>
                {riskDetails.atRiskOpportunitiesCount} Oportunidades Comprometidas
              </span>
            </div>

            {/* Contribuição por Fatores de Risco */}
            <div className="risk-reasons-grid" style={{ marginTop: '0.5rem' }}>
              <div className="risk-reason-box">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Prazo & Urgência</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  {riskDetails.riskBreakdown.prazo.count} ocorrência(s)
                </span>
                <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Sessão em menos de 5 dias</span>
              </div>

              <div className="risk-reason-box">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Documentação</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  {riskDetails.riskBreakdown.documentacao.count} ocorrência(s)
                </span>
                <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Blocker ou certidão expirando</span>
              </div>

              <div className="risk-reason-box">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Preço / Floor</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  {riskDetails.riskBreakdown.preco.count} ocorrência(s)
                </span>
                <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Margem abaixo da diretriz</span>
              </div>

              <div className="risk-reason-box">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Capacidade Técnica</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  {riskDetails.riskBreakdown.capacidade.count} ocorrência(s)
                </span>
                <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Restrição de equipe ou acervo</span>
              </div>

              <div className="risk-reason-box">
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Aprovações</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                  {riskDetails.riskBreakdown.aprovacao.count} ocorrência(s)
                </span>
                <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Alçada de Diretoria pendente</span>
              </div>
            </div>
          </div>

          {/* Listagem das Oportunidades em Risco */}
          <div className="financial-table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Certame em Risco</th>
                  <th>Cliente</th>
                  <th>Valor Exposto</th>
                  <th>Riscos Identificados</th>
                  <th>Owner</th>
                  <th>Prazo</th>
                </tr>
              </thead>
              <tbody>
                {riskDetails.opportunities.map(opp => (
                  <tr key={opp.id}>
                    <td>
                      <strong>{opp.number}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{opp.title}</div>
                    </td>
                    <td>{opp.client}</td>
                    <td><strong className="text-rose-400">{formatCurrency(opp.grossValue)}</strong></td>
                    <td>
                      {opp.risks.map((r, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: '#f87171' }}>
                          • <strong>{r.type}:</strong> {r.description}
                        </div>
                      ))}
                    </td>
                    <td>{opp.owner || 'Sem owner'}</td>
                    <td>{opp.daysLeft} dias restantes</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 4: MARGEM POTENCIAL & FAIXAS
          Itens 84 a 94 da especificação
          ======================================================== */}
      {activeTab === 'margem' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {marginDist.isRestricted ? (
            <div className="risk-breakdown-card" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
              <Lock size={24} className="text-rose-400" />
              <h3>Visualização de Margens Restrita por RBAC</h3>
              <p>{marginDist.message}</p>
            </div>
          ) : (
            <>
              <div className="financial-coverage-banner">
                <Info size={16} />
                <span>
                  <strong>Amostragem:</strong> {marginDist.sampleSizeMessage}
                </span>
                <span style={{ marginLeft: 'auto' }}>
                  {marginDist.historicalNote}
                </span>
              </div>

              {/* Faixas de Margem */}
              <div className="margin-tiers-grid">
                
                <div className="margin-tier-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{marginDist.tiers.below10.label}</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f87171' }}>
                    {formatCurrency(marginDist.tiers.below10.value)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{marginDist.tiers.below10.count} proposta(s)</span>
                </div>

                <div className="margin-tier-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{marginDist.tiers.tier10to20.label}</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fbbf24' }}>
                    {formatCurrency(marginDist.tiers.tier10to20.value)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{marginDist.tiers.tier10to20.count} proposta(s)</span>
                </div>

                <div className="margin-tier-card" style={{ borderLeft: '4px solid #0284c7' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{marginDist.tiers.tier20to30.label}</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8' }}>
                    {formatCurrency(marginDist.tiers.tier20to30.value)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{marginDist.tiers.tier20to30.count} proposta(s)</span>
                </div>

                <div className="margin-tier-card" style={{ borderLeft: '4px solid #10b981' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{marginDist.tiers.above30.label}</span>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#34d399' }}>
                    {formatCurrency(marginDist.tiers.above30.value)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{marginDist.tiers.above30.count} proposta(s)</span>
                </div>

              </div>

              {/* Alerta de Exposição a Baixa Margem */}
              <div className="risk-reason-box" style={{ borderColor: '#f59e0b', background: 'rgba(245, 158, 11, 0.08)' }}>
                <strong style={{ color: '#fbbf24' }}>Exposição a Margens Abaixo da Diretriz Interna:</strong>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: '0.3rem 0 0 0' }}>
                  Atualmente {formatCurrency(marginDist.lowMarginExposureValue)} do pipeline qualificado encontra-se com margem estimada abaixo de 20%, demandando autorização formal da Diretoria Executiva conforme a política de alçadas da Fase 36.
                </p>
              </div>
            </>
          )}

        </div>
      )}

      {/* ========================================================
          ABA 5: RISCO DE CONCENTRAÇÃO & EXPOSIÇÃO ÚNICA
          Itens 35 a 43 da especificação
          ======================================================== */}
      {activeTab === 'concentracao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {concentration.alertMessage && (
            <div className="risk-breakdown-card" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: '#fbbf24' }}>
              <AlertTriangle size={20} className="text-amber-400" />
              <strong style={{ color: '#fbbf24' }}>{concentration.alertMessage}</strong>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0 }}>
                Uma única oportunidade não deve definir a saúde financeira do trimestre. Recomenda-se diversificar os esforços de prospecção.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            
            {/* Top 1 Comprador */}
            <div className="maturity-card">
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Concentração no Maior Cliente</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f43f5e' }}>
                {concentration.top1Buyer.sharePct}%
              </div>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>{concentration.top1Buyer.client}</strong>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{formatCurrency(concentration.top1Buyer.value)}</span>
            </div>

            {/* Top 3 Compradores */}
            <div className="maturity-card">
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Concentração Top 3 Clientes</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fbbf24' }}>
                {concentration.top3Buyers.sharePct}%
              </div>
              <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>3 Maiores Organizações</strong>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{formatCurrency(concentration.top3Buyers.value)}</span>
            </div>

            {/* Maior Oportunidade Única */}
            <div className="maturity-card">
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Maior Oportunidade Individual</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: concentration.largestOpportunity?.hasHighExposure ? '#f43f5e' : '#38bdf8' }}>
                {concentration.largestOpportunity?.sharePct}%
              </div>
              <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>{concentration.largestOpportunity?.title}</strong>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{formatCurrency(concentration.largestOpportunity?.value)}</span>
            </div>

          </div>

          {/* Ranking de Concentração por Comprador */}
          <div className="financial-table-container">
            <table className="financial-table">
              <thead>
                <tr>
                  <th>Organização Compradora</th>
                  <th>Valor no Pipeline</th>
                  <th>Participação no Total</th>
                  <th>Status de Exposição</th>
                </tr>
              </thead>
              <tbody>
                {concentration.buyersRanking.map((b, i) => (
                  <tr key={i}>
                    <td><strong>{b.client}</strong></td>
                    <td>{formatCurrency(b.value)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="coverage-kpi-bar-mini" style={{ width: '80px', height: '6px' }}>
                          <div className="coverage-kpi-bar-fill" style={{ width: `${b.sharePct}%` }} />
                        </div>
                        <span>{b.sharePct}%</span>
                      </div>
                    </td>
                    <td>
                      {b.sharePct > 40 ? (
                        <span className="badge-strategy risks">Alta Dependência</span>
                      ) : (
                        <span className="badge-strategy defend">Balanceado</span>
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
          ABA 6: CENÁRIOS WHAT-IF (SANDBOX FINANCEIRO)
          Itens 102 a 111 da especificação
          ======================================================== */}
      {activeTab === 'cenarios' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="financial-coverage-banner" style={{ background: 'rgba(2, 132, 199, 0.1)', borderColor: 'rgba(2, 132, 199, 0.3)' }}>
            <Sliders size={18} />
            <span>
              <strong>Simulação Sandbox Isolada:</strong> Alterações de status, perdas ou vitórias virtuais nesta tela afetam somente o modelo de forecast. As propostas reais permanecem 100% inalteradas.
            </span>
          </div>

          {/* Seletor de Cenários What-If */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <button 
              className={`maturity-card ${activeWhatIf === 'WIN_MAJOR' ? 'best-case' : ''}`}
              onClick={() => setActiveWhatIf('WIN_MAJOR')}
              style={{ cursor: 'pointer', textAlign: 'left', border: activeWhatIf === 'WIN_MAJOR' ? '2px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.15)' }}
            >
              <strong>Vitória na Maior Oportunidade</strong>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.3rem 0 0 0' }}>Simula a conversão imediata do certame líder para 100%.</p>
            </button>

            <button 
              className={`maturity-card ${activeWhatIf === 'LOSE_MAJOR' ? 'commit' : ''}`}
              onClick={() => setActiveWhatIf('LOSE_MAJOR')}
              style={{ cursor: 'pointer', textAlign: 'left', border: activeWhatIf === 'LOSE_MAJOR' ? '2px solid #f43f5e' : '1px solid rgba(148, 163, 184, 0.15)' }}
            >
              <strong>Perda da Maior Oportunidade</strong>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.3rem 0 0 0' }}>Mede o impacto e recuo no atingimento da meta.</p>
            </button>

            <button 
              className={`maturity-card ${activeWhatIf === 'UPSIDE_CONVERSION' ? 'upside' : ''}`}
              onClick={() => setActiveWhatIf('UPSIDE_CONVERSION')}
              style={{ cursor: 'pointer', textAlign: 'left', border: activeWhatIf === 'UPSIDE_CONVERSION' ? '2px solid #a855f7' : '1px solid rgba(148, 163, 184, 0.15)' }}
            >
              <strong>Conversão de 50% do Upside</strong>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.3rem 0 0 0' }}>Acelera certames de radar para propostas ativas.</p>
            </button>

            <button 
              className={`maturity-card ${activeWhatIf === 'SCHEDULE_DELAY' ? 'pipeline' : ''}`}
              onClick={() => setActiveWhatIf('SCHEDULE_DELAY')}
              style={{ cursor: 'pointer', textAlign: 'left', border: activeWhatIf === 'SCHEDULE_DELAY' ? '2px solid #fbbf24' : '1px solid rgba(148, 163, 184, 0.15)' }}
            >
              <strong>Atraso de Cronograma (Q4 → Q1)</strong>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.3rem 0 0 0' }}>Posterga 30% das decisões para o trimestre seguinte.</p>
            </button>
          </div>

          {/* Resultado da Simulação */}
          <div className="sandbox-simulation-result">
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Resultado do Cenário: {whatIfResult.description}
            </h4>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pipeline Ponderado Simulado</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8' }}>
                  {formatCurrency(whatIfResult.simulatedWeighted)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Variação em Relação à Base</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: whatIfResult.variance >= 0 ? '#34d399' : '#f43f5e' }}>
                  {whatIfResult.variance >= 0 ? `+${formatCurrency(whatIfResult.variance)}` : formatCurrency(whatIfResult.variance)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Novo Gap para a Meta</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fbbf24' }}>
                  {formatCurrency(whatIfResult.simulatedTargetGap)}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.5rem 0 0 0' }}>
              {whatIfResult.sandboxNotice}
            </p>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 7: HIGIENE DO PIPELINE & GAPS
          Itens 145 a 149 da especificação
          ======================================================== */}
      {activeTab === 'higiene' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            
            <div className="executive-card">
              <span className="card-label">Score de Higiene</span>
              <div className="card-value" style={{ color: hygiene.hygieneScore > 80 ? '#34d399' : '#fbbf24' }}>
                {hygiene.hygieneScore} / 100
              </div>
              <span className="card-subtext">Qualidade geral dos cadastros</span>
            </div>

            <div className="executive-card danger">
              <span className="card-label">Sem Valor Informado</span>
              <div className="card-value text-rose-400">{hygiene.withoutValueCount}</div>
              <span className="card-subtext">Edital sem valor estimado lançado</span>
            </div>

            <div className="executive-card warning">
              <span className="card-label">Sem Owner Designado</span>
              <div className="card-value text-amber-400">{hygiene.withoutOwnerCount}</div>
              <span className="card-subtext">{formatCurrency(hygiene.unownedValue)} desassistidos</span>
            </div>

            <div className="executive-card warning">
              <span className="card-label">Oportunidades Estagnadas</span>
              <div className="card-value text-amber-400">{hygiene.staleCount}</div>
              <span className="card-subtext">&gt; 30 dias sem nova atualização</span>
            </div>

          </div>

          <div className="risk-breakdown-card" style={{ background: 'rgba(30, 41, 59, 0.4)', borderColor: 'rgba(148, 163, 184, 0.2)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Gaps Comerciais e Ações de Higienização Recomendadas
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
              {hygiene.alerts.map((al, idx) => (
                <div key={idx} style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  • {al}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 8: METAS & TRAJETÓRIA
          Itens 64 a 70 e 125 a 128
          ======================================================== */}
      {activeTab === 'metas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            <div className="executive-card primary">
              <span className="card-label">Meta Trimestral</span>
              <div className="card-value">{formatCurrency(financialSummary.targetQuarter)}</div>
              <span className="card-subtext">Diretriz aprovada pelo Conselho</span>
            </div>

            <div className="executive-card success">
              <span className="card-label">Pipeline Qualificado Atual</span>
              <div className="card-value">{formatCurrency(financialSummary.qualifiedValue)}</div>
              <span className="card-subtext">Ratio de Cobertura: {financialSummary.coverageRatio}x</span>
            </div>

            <div className="executive-card warning">
              <span className="card-label">Gap de Fechamento Ponderado</span>
              <div className="card-value text-amber-400">{formatCurrency(financialSummary.targetGap)}</div>
              <span className="card-subtext">Diferença para meta líquida ponderada</span>
            </div>
          </div>

          <div className="financial-coverage-banner" style={{ background: 'rgba(15, 23, 42, 0.6)', borderColor: 'rgba(148, 163, 184, 0.2)' }}>
            <Info size={18} />
            <span>
              <strong>Trajetória do Trimestre:</strong> A relação Pipeline Qualificado / Meta está em {financialSummary.coverageRatio}x. O padrão de segurança para licitações B2B recomenda cobertura mínima de 2.5x para garantir cumprimento das metas diante do deságio médio concorrencial.
            </span>
          </div>

        </div>
      )}

      {/* ========================================================
          ABA 9: TESTES DO GOLDEN FINANCIAL TEST SET (10/10)
          Itens 165 a 174 da especificação
          ======================================================== */}
      {activeTab === 'testes' && (
        <div className="test-suite-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                Suíte de Testes do Pipeline Financeiro — Golden Set (10/10)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Validação automática dos 10 critérios rigorosos de cálculo financeiro, desduplicação e segregação RBAC da Fase 43.
              </p>
            </div>

            <button 
              className="company-toggle-btn"
              style={{ background: '#0284c7', color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={handleRunTests}
            >
              <RefreshCw size={14} /> Rodar Testes Agora
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginTop: '0.75rem' }}>
            {(testResults || financialPipelineService.runGoldenFinancialTestSet()).map(t => (
              <div key={t.testNumber} className={`test-item-row ${t.passed ? 'passed' : 'failed'}`}>
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
