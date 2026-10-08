/**
 * VELLIA LICITAÇÕES — FASE 20: CENTRO DE COMANDO EXECUTIVO
 * CommandCenterView.jsx: Centro de Comando Executivo, KPIs, Metas e Previsões
 * (Itens 1 a 66, 70 a 82)
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Compass, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Layers, 
  Calendar, 
  Download, 
  Sparkles, 
  Info, 
  ChevronRight, 
  Cpu, 
  Award,
  Zap,
  Filter
} from 'lucide-react';
import { executiveService } from '../services/executive/executiveService.js';
import { ExecutivePermissions, ExecutiveViewPreset, GoalPeriod } from '../services/executive/executiveModels.js';
import './CommandCenterView.css';

export default function CommandCenterView({ onNavigateToDetail = () => {} }) {
  const [activeSubTab, setActiveSubTab] = useState('visao-executiva');
  const [selectedCompany, setSelectedCompany] = useState('TODAS');
  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [selectedPreset, setSelectedPreset] = useState(ExecutiveViewPreset.DIRETORIA);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState('WEEKLY');
  const [dashboardData, setDashboardData] = useState(null);

  // Carrega dados consolidados do Centro de Comando Executivo
  useEffect(() => {
    loadData();
  }, [selectedCompany, selectedPeriod, selectedPreset]);

  const loadData = () => {
    const data = executiveService.getExecutiveDashboardData({
      company: selectedCompany,
      period: selectedPeriod,
      viewPreset: selectedPreset,
      userPermissions: [
        ExecutivePermissions.EXECUTIVE_DASHBOARD_VIEW,
        ExecutivePermissions.FORECAST_VIEW,
        ExecutivePermissions.GOALS_VIEW,
        ExecutivePermissions.GOALS_MANAGE,
        ExecutivePermissions.FINANCIAL_EXECUTIVE_VIEW
      ]
    });
    setDashboardData(data);
  };

  if (!dashboardData) return null;

  const { pipeline, forecast, goals, performance } = dashboardData;
  const kpis = pipeline.kpis;

  return (
    <div className="command-center-container">
      {/* 1. TOPO / HEADER EXECUTIVO & FILTRO GLOBAL (Itens 1 a 3) */}
      <div className="cc-header-card">
        <div className="cc-header-title-block">
          <h1>
            <BarChart3 size={28} className="text-cyan" />
            Command Center
            <span className="cc-header-badge">Centro de Comando Executivo</span>
          </h1>
          <p className="cc-header-subtitle">
            Toda a operação em uma única visão. Dados para decidir, prioridade para agir.
          </p>
        </div>

        <div className="cc-filter-bar">
          {/* Preset de Visão (Item 63) */}
          <select 
            className="cc-select"
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            title="Perfil de visualização executiva"
          >
            <option value={ExecutiveViewPreset.DIRETORIA}>Visão Diretoria</option>
            <option value={ExecutiveViewPreset.COMERCIAL}>Visão Comercial</option>
            <option value={ExecutiveViewPreset.LICITACOES}>Visão Licitações</option>
            <option value={ExecutiveViewPreset.TECNICA}>Visão Técnica</option>
          </select>

          {/* Filtro Empresa (Item 3) */}
          <select 
            className="cc-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="TODAS">Todas as empresas</option>
            <option value="Veeluen Solutions">Veeluen Solutions</option>
            <option value="Excelência Ambiental">Excelência Ambiental</option>
          </select>

          {/* Filtro Período (Item 3) */}
          <select 
            className="cc-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="ALL">Todo o Histórico</option>
            <option value="TODAY">Hoje</option>
            <option value="7D">Últimos 7 dias</option>
            <option value="30D">Últimos 30 dias</option>
            <option value="90D">Últimos 90 dias</option>
            <option value="YEAR">Ano Atual</option>
          </select>

          {/* Botão de Relatório Executivo (Itens 64 a 66) */}
          <button 
            className="cc-btn-report"
            onClick={() => setReportModalOpen(true)}
            title="Gerar relatório executivo estruturado em PDF/Texto"
          >
            <FileText size={16} />
            <span>Relatório Executivo</span>
          </button>
        </div>
      </div>

      {/* 2. ABAS DE NAVEGAÇÃO INTERNAS (Item 1) */}
      <div className="cc-nav-tabs">
        <button 
          className={`cc-nav-tab ${activeSubTab === 'visao-executiva' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('visao-executiva')}
        >
          <BarChart3 size={16} />
          <span>Visão Executiva</span>
        </button>
        <button 
          className={`cc-nav-tab ${activeSubTab === 'pipeline-funil' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pipeline-funil')}
        >
          <Layers size={16} />
          <span>Pipeline & Funil</span>
        </button>
        <button 
          className={`cc-nav-tab ${activeSubTab === 'forecast' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('forecast')}
        >
          <TrendingUp size={16} />
          <span>Previsões & Forecast</span>
        </button>
        <button 
          className={`cc-nav-tab ${activeSubTab === 'metas' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('metas')}
        >
          <Target size={16} />
          <span>Metas Comerciais ({goals.summary.atRiskCount > 0 ? `⚠️ ${goals.summary.atRiskCount}` : '✓'})</span>
        </button>
        <button 
          className={`cc-nav-tab ${activeSubTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('performance')}
        >
          <Award size={16} />
          <span>Performance & Fontes</span>
        </button>
        <button 
          className={`cc-nav-tab ${activeSubTab === 'saude-operacional' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('saude-operacional')}
        >
          <ShieldCheck size={16} />
          <span>Saúde Operacional</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* ABA 1: VISÃO EXECUTIVA GERAL (Itens 4, 7, 8, 9, 13, 42, 71 a 74)     */}
      {/* ==================================================================== */}
      {activeSubTab === 'visao-executiva' && (
        <>
          {/* Cards de KPIs Principais (Item 4) */}
          <div className="cc-kpi-grid">
            <div className="cc-kpi-card">
              <div className="cc-kpi-header">
                <span>Oportunidades Monitoradas</span>
                <Compass size={15} />
              </div>
              <div className="cc-kpi-value">{kpis.totalMonitored}</div>
              <div className="cc-kpi-meta">{kpis.totalRelevant} relevantes ({Math.round((kpis.totalRelevant / kpis.totalMonitored) * 100)}%)</div>
            </div>

            <div className="cc-kpi-card">
              <div className="cc-kpi-header">
                <span>Alta Prioridade (Score ≥ 85)</span>
                <Zap size={15} />
              </div>
              <div className="cc-kpi-value accent-cyan">{kpis.highPriority}</div>
              <div className="cc-kpi-meta">Foco imediato da engenharia</div>
            </div>

            <div className="cc-kpi-card">
              <div className="cc-kpi-header">
                <span>Propostas Abertas / Enviadas</span>
                <FileText size={15} />
              </div>
              <div className="cc-kpi-value">{kpis.proposalsOpen} / {kpis.proposalsSent}</div>
              <div className="cc-kpi-meta">{kpis.proposalsOpen} em elaboração ou revisão</div>
            </div>

            <div className="cc-kpi-card">
              <div className="cc-kpi-header">
                <span>Contratos Ganhos (Receita)</span>
                <Award size={15} />
              </div>
              <div className="cc-kpi-value accent-green">R$ {(kpis.realizedRevenue / 1000000).toFixed(2)}M</div>
              <div className="cc-kpi-meta">{kpis.contractsWon} vitórias homologadas</div>
            </div>

            <div className="cc-kpi-card">
              <div className="cc-kpi-header">
                <span>Pipeline Bruto (Potencial)</span>
                <DollarSign size={15} />
              </div>
              <div className="cc-kpi-value accent-gold">R$ {(kpis.grossPipeline / 1000000).toFixed(2)}M</div>
              <div className="cc-kpi-meta">Ponderado: <strong>R$ {(kpis.weightedPipeline / 1000000).toFixed(2)}M</strong></div>
            </div>

            <div className="cc-kpi-card">
              <div className="cc-kpi-header">
                <span>Win Rate Oficial</span>
                <TrendingUp size={15} />
              </div>
              <div className="cc-kpi-value accent-cyan">{kpis.winRate}%</div>
              <div className="cc-kpi-meta">+4.2 p.p. vs período anterior</div>
            </div>
          </div>

          {/* Aviso Legal de Pipeline (Itens 7 e 8) */}
          <div className="cc-disclaimer-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} color="#38bdf8" />
              <span>
                <strong>Aviso de Governança:</strong> O <em>Pipeline Potencial</em> (R$ {(kpis.grossPipeline / 1000000).toFixed(2)}M) não é receita realizada. Reflete o volume de oportunidades em disputa. A receita homologada acumulada é de <strong>R$ {(kpis.realizedRevenue / 1000000).toFixed(2)}M</strong>.
              </span>
            </div>
            <span className="cc-header-badge">Governança Comercial</span>
          </div>

          {/* Funil Executivo (Itens 9 e 10) */}
          <div className="cc-funnel-card">
            <h3 className="cc-section-title">
              <Layers size={18} />
              Funil Executivo de Conversão
            </h3>
            <div className="cc-funnel-steps">
              {pipeline.funnel.map((stage) => {
                const maxVal = pipeline.funnel[0].value || 1;
                const fillPct = Math.max(8, Math.round((stage.value / maxVal) * 100));
                return (
                  <div key={stage.id} className="cc-funnel-row">
                    <span className="cc-funnel-label">{stage.name}</span>
                    <div className="cc-funnel-bar-wrapper">
                      <div className="cc-funnel-bar-fill" style={{ width: `${fillPct}%` }}></div>
                    </div>
                    <span className="cc-funnel-value">R$ {(stage.value / 1000000).toFixed(2)}M ({stage.count})</span>
                    <span className="cc-funnel-rate">{stage.conversionRate}% conv.</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grid de Duas Colunas: Top 5 Prioridades e Insights/Concentração */}
          <div className="cc-grid-two-cols">
            {/* Top 5 Oportunidades Prioritárias (Item 13) */}
            <div className="cc-panel">
              <h3 className="cc-section-title">
                <Target size={18} />
                Top 5 Oportunidades Prioritárias
              </h3>
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Edital / Contratante</th>
                    <th>Empresa</th>
                    <th>Valor</th>
                    <th>Score</th>
                    <th>Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.priorityOpportunities.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>#{o.number}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{o.client}</div>
                      </td>
                      <td>{o.company.split(' ')[0]}</td>
                      <td style={{ fontWeight: '600', color: '#38bdf8' }}>
                        R$ {(o.value / 1000).toFixed(0)}k
                      </td>
                      <td>
                        <span className="cc-badge-success">{o.score}%</span>
                      </td>
                      <td>
                        <span className={o.daysLeft <= 3 ? 'cc-badge-risk' : 'cc-badge-warning'}>
                          {o.daysLeft} dias
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Alertas de Concentração & Executive Insights (Itens 42 e 71 a 74) */}
            <div className="cc-panel">
              <h3 className="cc-section-title">
                <Sparkles size={18} />
                Executive Insights & Concentração de Pipeline
              </h3>

              {/* Alertas de Concentração */}
              {pipeline.concentrationRisks.map((c, i) => (
                <div key={i} style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.25)', 
                  borderRadius: '8px', 
                  padding: '12px 14px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#f87171', fontSize: '0.85rem' }}>⚠️ {c.level}: {c.type === 'SINGLE_OPPORTUNITY' ? 'Concentração em Oportunidade' : 'Concentração em Cliente'}</strong>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{c.description}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Recomendação: {c.recommendation}</div>
                </div>
              ))}

              {/* Insights Executivos Gerados por IA dos Dados */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {performance.executiveInsights.map((ins) => (
                  <div key={ins.id} style={{ 
                    background: 'rgba(15, 23, 42, 0.6)', 
                    border: '1px solid rgba(148, 163, 184, 0.12)', 
                    borderRadius: '8px', 
                    padding: '12px 14px' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600' }}>💡 {ins.type}</span>
                      <span className={ins.impact === 'Alerta' ? 'cc-badge-risk' : 'cc-badge-success'}>{ins.impact}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#f1f5f9' }}>{ins.text}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Base: {ins.dataSupport}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==================================================================== */}
      {/* ABA 2: PIPELINE & FUNIL DETALHADO (Itens 11, 12, 75, 76)              */}
      {/* ==================================================================== */}
      {activeSubTab === 'pipeline-funil' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Velocidade do Funil (Pipeline Velocity) (Item 11) */}
          <div className="cc-panel">
            <h3 className="cc-section-title">
              <Clock size={18} />
              Velocidade do Funil (Pipeline Velocity)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="cc-kpi-card">
                <span className="cc-kpi-header">Oportunidade → Decisão GO</span>
                <span className="cc-kpi-value accent-cyan">{pipeline.pipelineVelocity.oppToDecisionDays} dias</span>
                <span className="cc-kpi-meta">Triagem inicial e score</span>
              </div>
              <div className="cc-kpi-card">
                <span className="cc-kpi-header">GO → Proposta Elaborada</span>
                <span className="cc-kpi-value accent-cyan">{pipeline.pipelineVelocity.decisionToProposalDays} dias</span>
                <span className="cc-kpi-meta">Cotações e checklist</span>
              </div>
              <div className="cc-kpi-card">
                <span className="cc-kpi-header">Proposta Enviada → Resultado</span>
                <span className="cc-kpi-value accent-cyan">{pipeline.pipelineVelocity.proposalToResultDays} dias</span>
                <span className="cc-kpi-meta">Julgamento e recursos</span>
              </div>
              <div className="cc-kpi-card">
                <span className="cc-kpi-header">Ciclo Médio Total</span>
                <span className="cc-kpi-value accent-green">{pipeline.pipelineVelocity.totalCycleDays} dias</span>
                <span className="cc-kpi-meta">{pipeline.pipelineVelocity.velocityTrend}</span>
              </div>
            </div>
          </div>

          {/* Oportunidades em Risco (Item 12) */}
          <div className="cc-panel">
            <h3 className="cc-section-title">
              <AlertTriangle size={18} color="#ef4444" />
              Pipeline em Risco (Ação Imediata Necessária)
            </h3>
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Edital</th>
                  <th>Contratante</th>
                  <th>Valor</th>
                  <th>Prazo</th>
                  <th>Motivo do Risco</th>
                  <th>Ação Recomendada</th>
                </tr>
              </thead>
              <tbody>
                {pipeline.atRiskPipeline.map((r) => (
                  <tr key={r.id}>
                    <td><strong>#{r.number}</strong></td>
                    <td>{r.client}</td>
                    <td style={{ fontWeight: '600' }}>R$ {(r.value / 1000).toFixed(0)}k</td>
                    <td><span className="cc-badge-risk">{r.daysLeft} dias</span></td>
                    <td style={{ color: '#f87171' }}>{r.riskReason}</td>
                    <td>
                      <span className="cc-badge-warning">{r.recommendedAction}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Qualidade dos Dados (Data Quality) (Itens 75 e 76) */}
          <div className="cc-disclaimer-card" style={{ borderColor: pipeline.dataQuality.isReliable ? '#10b981' : '#f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} color={pipeline.dataQuality.isReliable ? '#10b981' : '#f59e0b'} />
              <div>
                <strong>Qualidade da Base de Dados: {pipeline.dataQuality.score}% de completude</strong>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {pipeline.dataQuality.isReliable 
                    ? 'Dados consolidados com integridade de valores estimados, propostas e órgãos.'
                    : pipeline.dataQuality.warningMessage}
                </div>
              </div>
            </div>
            <span className="cc-badge-success">{pipeline.dataQuality.isReliable ? 'Auditado' : 'Atenção'}</span>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 3: FORECAST COMERCIAL (Itens 14 a 22, 45 a 53)                    */}
      {/* ==================================================================== */}
      {activeSubTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cenários de Forecast (Itens 48 a 51) */}
          <div className="cc-forecast-cards">
            {Object.entries(forecast.scenarios).map(([key, scn]) => (
              <div key={key} className={`cc-scenario-box ${key === 'Base' ? 'highlight' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="cc-scenario-title">{scn.name}</span>
                  <span className={`cc-badge-${scn.confidence === 'Alta' ? 'success' : scn.confidence === 'Média' ? 'warning' : 'risk'}`}>
                    Confiança {scn.confidence}
                  </span>
                </div>
                <div className="cc-scenario-value">R$ {(scn.value / 1000).toFixed(0)} mil</div>
                <div className="cc-scenario-desc">{scn.description}</div>
              </div>
            ))}
          </div>

          {/* Categorias de Fechamento (Itens 14 a 18 e 21) */}
          <div className="cc-panel">
            <h3 className="cc-section-title">
              <TrendingUp size={18} />
              Categorias de Fechamento (Commit, Best Case e Pipeline)
            </h3>
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Qtd</th>
                  <th>Valor Bruto</th>
                  <th>Valor Ponderado</th>
                  <th>Nível de Confiança</th>
                  <th>Premissa Operacional</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Commit</strong></td>
                  <td>{forecast.categories.Commit.count}</td>
                  <td style={{ fontWeight: '600', color: '#38bdf8' }}>R$ {(forecast.categories.Commit.grossValue / 1000).toFixed(0)}k</td>
                  <td style={{ fontWeight: '600' }}>R$ {(forecast.categories.Commit.weightedValue / 1000).toFixed(0)}k</td>
                  <td><span className="cc-badge-success">Alta</span></td>
                  <td>Propostas prontas ou enviadas com aderência ≥ 80% e sem bloqueadores.</td>
                </tr>
                <tr>
                  <td><strong>Best Case</strong></td>
                  <td>{forecast.categories['Best Case'].count}</td>
                  <td style={{ fontWeight: '600', color: '#38bdf8' }}>R$ {(forecast.categories['Best Case'].grossValue / 1000).toFixed(0)}k</td>
                  <td style={{ fontWeight: '600' }}>R$ {(forecast.categories['Best Case'].weightedValue / 1000).toFixed(0)}k</td>
                  <td><span className="cc-badge-warning">Média</span></td>
                  <td>Oportunidades GO com proposta em preparação e cotações em andamento.</td>
                </tr>
                <tr>
                  <td><strong>Pipeline</strong></td>
                  <td>{forecast.categories.Pipeline.count}</td>
                  <td style={{ fontWeight: '600', color: '#38bdf8' }}>R$ {(forecast.categories.Pipeline.grossValue / 1000).toFixed(0)}k</td>
                  <td style={{ fontWeight: '600' }}>R$ {(forecast.categories.Pipeline.weightedValue / 1000).toFixed(0)}k</td>
                  <td><span className="cc-badge-risk">Baixa</span></td>
                  <td>Editais em análise de viabilidade e validação documental inicial.</td>
                </tr>
                <tr>
                  <td><strong>Upside</strong></td>
                  <td>{forecast.categories.Upside.count}</td>
                  <td style={{ fontWeight: '600', color: '#38bdf8' }}>R$ {(forecast.categories.Upside.grossValue / 1000).toFixed(0)}k</td>
                  <td style={{ fontWeight: '600' }}>R$ {(forecast.categories.Upside.weightedValue / 1000).toFixed(0)}k</td>
                  <td><span className="cc-badge-risk">Baixa</span></td>
                  <td>Sinais futuros e contratos a vencer no Radar Antecipado.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Forecast por Empresa e por Mês (Itens 19 e 20) */}
          <div className="cc-grid-two-cols">
            <div className="cc-panel">
              <h3 className="cc-section-title">
                <Building2 size={18} />
                Forecast por Empresa
              </h3>
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Commit</th>
                    <th>Best Case</th>
                    <th>Expectativa Ponderada</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(forecast.companyForecast).map(([comp, val]) => (
                    <tr key={comp}>
                      <td><strong>{comp}</strong></td>
                      <td>R$ {(val.commit / 1000).toFixed(0)}k</td>
                      <td>R$ {(val.bestCase / 1000).toFixed(0)}k</td>
                      <td style={{ fontWeight: '600', color: '#10b981' }}>R$ {(val.totalExpected / 1000).toFixed(0)}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cc-panel">
              <h3 className="cc-section-title">
                <Calendar size={18} />
                Forecast por Mês / Trimestre
              </h3>
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Período</th>
                    <th>Commit</th>
                    <th>Best Case</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.monthlyForecast.map((m, idx) => (
                    <tr key={idx}>
                      <td><strong>{m.month}</strong></td>
                      <td>R$ {(m.commit / 1000).toFixed(0)}k</td>
                      <td>R$ {(m.bestCase / 1000).toFixed(0)}k</td>
                      <td><span className="cc-badge-warning">{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 4: METAS COMERCIAIS & RITMO (Itens 23 a 31)                      */}
      {/* ==================================================================== */}
      {activeSubTab === 'metas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Resumo Geral de Metas */}
          <div className="cc-kpi-grid">
            <div className="cc-kpi-card">
              <span className="cc-kpi-header">Total de Metas</span>
              <span className="cc-kpi-value">{goals.summary.totalGoals}</span>
              <span className="cc-kpi-meta">Mês & Trimestre</span>
            </div>
            <div className="cc-kpi-card">
              <span className="cc-kpi-header">Metas Atingidas</span>
              <span className="cc-kpi-value accent-green">{goals.summary.achievedCount}</span>
              <span className="cc-kpi-meta">100% ou superior</span>
            </div>
            <div className="cc-kpi-card">
              <span className="cc-kpi-header">No Ritmo (On Track)</span>
              <span className="cc-kpi-value accent-cyan">{goals.summary.onTrackCount}</span>
              <span className="cc-kpi-meta">Compatíveis com o dia 22</span>
            </div>
            <div className="cc-kpi-card">
              <span className="cc-kpi-header">Metas em Risco</span>
              <span className="cc-kpi-value" style={{ color: '#ef4444' }}>{goals.summary.atRiskCount}</span>
              <span className="cc-kpi-meta">Exigem atenção gerencial</span>
            </div>
          </div>

          {/* Lista de Metas com Barra de Ritmo e Pace */}
          <div className="cc-panel">
            <h3 className="cc-section-title">
              <Target size={18} />
              Acompanhamento de Metas por Empresa & Responsável
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {goals.goals.map((g) => {
                const isRisk = g.paceStatus === 'Meta em risco';
                return (
                  <div key={g.id} className="cc-goal-row">
                    <div className="cc-goal-header">
                      <div>
                        <span className="cc-goal-title">{g.title}</span>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          Responsável: <strong>{g.ownerName}</strong> • Empresa: <strong>{g.company}</strong>
                        </div>
                      </div>
                      <span className={isRisk ? 'cc-badge-risk' : 'cc-badge-success'}>
                        {g.paceStatus} ({g.progressPct}%)
                      </span>
                    </div>

                    <div className="cc-goal-bar-bg">
                      <div 
                        className={`cc-goal-bar-fill ${isRisk ? 'risk' : ''}`}
                        style={{ width: `${Math.min(100, g.progressPct)}%` }}
                      ></div>
                    </div>

                    <div className="cc-goal-footer">
                      <span>
                        Realizado: <strong>{g.isCurrency ? `R$ ${g.currentValue.toLocaleString('pt-BR')}` : g.currentValue}</strong> de {g.isCurrency ? `R$ ${g.targetValue.toLocaleString('pt-BR')}` : `${g.targetValue} ${g.unit}`}
                      </span>
                      <span>Gap: <strong>{g.isCurrency ? `R$ ${g.gap.toLocaleString('pt-BR')}` : `${g.gap} ${g.unit}`}</strong></span>
                      <span>Projeção: <strong>{g.projectionFormatted}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 5: PERFORMANCE MULTIDIMENSIONAL (Itens 32 a 41)                   */}
      {/* ==================================================================== */}
      {activeSubTab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Comparativo de Empresas (Item 32) */}
          <div className="cc-panel">
            <h3 className="cc-section-title">
              <Building2 size={18} />
              Performance Comparativa por Empresa
            </h3>
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Oportunidades</th>
                  <th>GO</th>
                  <th>Propostas</th>
                  <th>Vitórias</th>
                  <th>Win Rate</th>
                  <th>Valor Ganho</th>
                  <th>Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {performance.companyMetrics.map((c, i) => (
                  <tr key={i}>
                    <td><strong>{c.company}</strong></td>
                    <td>{c.opportunitiesCount}</td>
                    <td>{c.goCount}</td>
                    <td>{c.proposalsCount}</td>
                    <td><span className="cc-badge-success">{c.winsCount}</span></td>
                    <td style={{ fontWeight: '600', color: '#38bdf8' }}>{c.winRate}%</td>
                    <td>R$ {(c.wonValue / 1000).toFixed(0)}k</td>
                    <td style={{ fontWeight: '600' }}>R$ {(c.pipelineValue / 1000000).toFixed(1)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance por Portal / Qualidade da Fonte (Itens 34 a 36) */}
          <div className="cc-panel">
            <h3 className="cc-section-title">
              <Compass size={18} />
              Qualidade da Fonte & Desempenho por Portal (Source Quality Index)
            </h3>
            <table className="cc-table">
              <thead>
                <tr>
                  <th>Portal / Fonte</th>
                  <th>Volume</th>
                  <th>Relevantes</th>
                  <th>Vitórias</th>
                  <th>Qualidade da Fonte</th>
                  <th>Diagnóstico</th>
                </tr>
              </thead>
              <tbody>
                {performance.portals.map((p, i) => (
                  <tr key={i}>
                    <td><strong>{p.portal}</strong></td>
                    <td>{p.volume}</td>
                    <td>{p.relevantCount}</td>
                    <td><span className="cc-badge-success">{p.winsCount}</span></td>
                    <td>
                      <span className={`cc-badge-${p.sourceQualityIndex >= 85 ? 'success' : p.sourceQualityIndex >= 70 ? 'warning' : 'risk'}`}>
                        {p.sourceQualityIndex}/100 • {p.qualityBadge}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.qualityReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance por Serviço e Região (Itens 33 e 37) */}
          <div className="cc-grid-two-cols">
            <div className="cc-panel">
              <h3 className="cc-section-title">
                <Cpu size={18} />
                Performance por Linha de Serviço
              </h3>
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th>Vitórias</th>
                    <th>Win Rate</th>
                    <th>Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.services.map((s, i) => (
                    <tr key={i}>
                      <td><strong>{s.service}</strong></td>
                      <td>{s.winsCount}</td>
                      <td style={{ color: '#38bdf8', fontWeight: '600' }}>{s.winRate}%</td>
                      <td>R$ {(s.avgTicket / 1000).toFixed(0)}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="cc-panel">
              <h3 className="cc-section-title">
                <Compass size={18} />
                Performance por Região / Estado
              </h3>
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Estado / Região</th>
                    <th>Oportunidades</th>
                    <th>Propostas</th>
                    <th>Valor Ganho</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.regionalPerformance.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.state}</strong></td>
                      <td>{r.opportunitiesCount}</td>
                      <td>{r.proposalsCount}</td>
                      <td style={{ fontWeight: '600', color: '#10b981' }}>R$ {(r.valueWon / 1000).toFixed(0)}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ABA 6: SAÚDE OPERACIONAL & EFICIÊNCIA (Itens 56 a 59, 81, 82)         */}
      {/* ==================================================================== */}
      {activeSubTab === 'saude-operacional' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Geral de Saúde Operacional */}
          <div className="cc-disclaimer-card" style={{ borderColor: performance.operationalEfficiency.status === 'Saudável' ? '#10b981' : '#f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={24} color={performance.operationalEfficiency.status === 'Saudável' ? '#10b981' : '#f59e0b'} />
              <div>
                <strong>Saúde Operacional: {performance.operationalEfficiency.status}</strong>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  {performance.operationalEfficiency.reasons.join(' ')}
                </div>
              </div>
            </div>
            <span className={performance.operationalEfficiency.status === 'Saudável' ? 'cc-badge-success' : 'cc-badge-warning'}>
              {performance.operationalEfficiency.status}
            </span>
          </div>

          {/* Indicadores de Eficiência de Ciclo */}
          <div className="cc-kpi-grid">
            <div className="cc-kpi-card">
              <span className="cc-kpi-header">Tempo Médio de Análise</span>
              <span className="cc-kpi-value accent-cyan">{performance.operationalEfficiency.avgAnalysisHours}h</span>
              <span className="cc-kpi-meta">Da leitura do edital ao sumário</span>
            </div>
            <div className="cc-kpi-card">
              <span className="cc-kpi-header">Deliberação Go/No-Go</span>
              <span className="cc-kpi-value accent-cyan">{performance.operationalEfficiency.avgGoNoGoDays} dias</span>
              <span className="cc-kpi-meta">Aprovação no Decision Board</span>
            </div>
            <div className="cc-kpi-card">
              <span className="cc-kpi-header">Preparação de Proposta</span>
              <span className="cc-kpi-value accent-cyan">{performance.operationalEfficiency.avgProposalPrepDays} dias</span>
              <span className="cc-kpi-meta">Composição e dossiê</span>
            </div>
            <div className="cc-kpi-card">
              <span className="cc-kpi-header">Envio no Prazo (On-Time)</span>
              <span className="cc-kpi-value accent-green">{performance.operationalEfficiency.onTimeSubmissionRatePct}%</span>
              <span className="cc-kpi-meta">Pontualidade nos portais</span>
            </div>
          </div>

          {/* Atrasos e Bloqueadores */}
          <div className="cc-panel">
            <h3 className="cc-section-title">
              <Clock size={18} />
              Monitoramento de Atrasos & Pendências
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tarefas Atrasadas</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f8fafc' }}>
                  {performance.operationalEfficiency.overdueTasksCount} tarefas
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Follow-ups Atrasados</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f8fafc' }}>
                  {performance.operationalEfficiency.overdueFollowUpsCount} follow-ups
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Certidões a Vencer (30d)</span>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#f8fafc' }}>
                  {performance.operationalEfficiency.expiringDocumentsCount} documentos
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL DE RELATÓRIO EXECUTIVO (Itens 64, 65, 66)                       */}
      {/* ==================================================================== */}
      {reportModalOpen && (
        <div className="cc-modal-backdrop" onClick={() => setReportModalOpen(false)}>
          <div className="cc-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="cc-modal-header">
              <h3 style={{ margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} className="text-cyan" />
                Relatório Executivo Estruturado
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={`btn-small ${reportType === 'WEEKLY' ? 'primary' : 'secondary'}`}
                  onClick={() => setReportType('WEEKLY')}
                >
                  Semanal
                </button>
                <button 
                  className={`btn-small ${reportType === 'MONTHLY' ? 'primary' : 'secondary'}`}
                  onClick={() => setReportType('MONTHLY')}
                >
                  Mensal
                </button>
                <button 
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}
                  onClick={() => setReportModalOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="cc-modal-body">
              {reportType === 'WEEKLY' ? (
                <>
                  <div style={{ padding: '14px', background: 'rgba(56, 189, 248, 0.08)', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                    <strong>Resumo da Semana ({new Date().toLocaleDateString('pt-BR')}):</strong>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>
                      {executiveService.generateWeeklyExecutiveReport({ company: selectedCompany }).executiveSummary}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#e2e8f0' }}>Indicadores da Semana:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                      {executiveService.generateWeeklyExecutiveReport({ company: selectedCompany }).kpis.map((k, i) => (
                        <div key={i} style={{ background: '#111c3a', padding: '10px 14px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{k.label}</span>
                          <div style={{ fontWeight: '700', color: '#38bdf8', fontSize: '1.1rem' }}>{k.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#e2e8f0' }}>Top Oportunidades em Foco:</h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {pipeline.priorityOpportunities.slice(0, 3).map((o) => (
                        <li key={o.id} style={{ marginBottom: '4px' }}>
                          Edital #{o.number} ({o.client}) — R$ {(o.value / 1000).toFixed(0)}k • Prazo: {o.daysLeft} dias
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                    <strong>Relatório Mensal de Performance (Outubro/2026):</strong>
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem' }}>
                      Liderança de qualidade no portal {performance.portals[0].portal} e avanço nas operações de ETE com win rate de 60%.
                    </p>
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#e2e8f0' }}>Recomendações da Diretoria:</h4>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                      <li>Manter foco nos editais da Petrobras via Petronect devido à alta taxa de conversão.</li>
                      <li>Intensificar alinhamentos pré-edital de ETE na região Nordeste.</li>
                      <li>Ajustar prazos de tarefas operacionais para propostas em elaboração.</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="cc-modal-footer">
              <button 
                className="btn-small secondary"
                onClick={() => setReportModalOpen(false)}
              >
                Fechar
              </button>
              <button 
                className="btn-small primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Download size={14} />
                <span>Imprimir / Exportar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
