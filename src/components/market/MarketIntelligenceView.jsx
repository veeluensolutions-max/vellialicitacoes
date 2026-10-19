import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  MapPin,
  Building2,
  Layers,
  Globe,
  Clock,
  Swords,
  Radar,
  Compass,
  Download,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  Eye,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  BarChart2,
  Target,
  RefreshCw
} from 'lucide-react';

import {
  marketIntelligenceService,
  RecurrenceConfidence,
  BuyerActivityLevel,
  ServiceTrend,
  FutureSignalStatus,
  AccountStrategicPriority,
  StrategicQuadrant,
  COMPANY_SERVICES
} from '../../services/market/marketIntelligenceService.js';
import './MarketIntelligenceView.css';

export default function MarketIntelligenceView({ onSelectOpportunity, onOpenCopilot }) {
  // Filtros Globais
  const [selectedCompany, setSelectedCompany] = useState('Consolidado'); // 'Veeluen Solutions' | 'Excelência Ambiental' | 'Consolidado'
  const [selectedPeriod, setSelectedPeriod] = useState('12 meses'); // '30 dias' | '90 dias' | '6 meses' | '12 meses' | '24 meses'
  const [activeSubTab, setActiveSubTab] = useState('visao-geral');
  
  // Estado de Dados do Serviço
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStateFilter, setSelectedStateFilter] = useState(null);
  const [selectedBuyerModal, setSelectedBuyerModal] = useState(null);
  const [geoIntensityMetric, setGeoIntensityMetric] = useState('volume'); // 'volume' | 'valor'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Feedback e Testes
  const [toastMessage, setToastMessage] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [runningTests, setRunningTests] = useState(false);

  // Carregar Inteligência
  const refreshData = () => {
    setLoading(true);
    try {
      const data = marketIntelligenceService.generateMarketIntelligence({
        companyScope: selectedCompany,
        period: selectedPeriod
      });
      setMarketData(data);
    } catch (err) {
      console.error('Erro ao gerar inteligência de mercado:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedCompany, selectedPeriod]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Exportar Relatório Executivo
  const handleExport = () => {
    try {
      const mdContent = marketIntelligenceService.exportMarketReport(marketData);
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Vellia_Inteligencia_Mercado_${selectedCompany}_${Date.now()}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Relatório de Inteligência exportado com sucesso em Markdown!');
    } catch (e) {
      alert('Falha ao exportar relatório: ' + e.message);
    }
  };

  // Executar Cenários de Testes Automatizados (Fase 32: Itens 133 a 139)
  const handleRunTests = () => {
    setRunningTests(true);
    setTimeout(() => {
      const results = marketIntelligenceService.runE2ETests();
      setTestResults(results);
      setRunningTests(false);
      showToast(`Suíte de testes concluída: ${results.passed}/${results.totalTests} aprovados!`);
    }, 400);
  };

  // Ação CRM: Adicionar Conta Prioritária ao CRM
  const handleAddToCRM = (targetAccount) => {
    const res = marketIntelligenceService.createCRMTargetFollowUp(targetAccount.organization, 'Equipe Comercial Vellia');
    if (res.success) {
      showToast(`Conta "${targetAccount.organization}" conectada ao CRM com follow-up prioritário!`);
      refreshData();
    }
  };

  // Subtabs definidas na especificação
  const SUBTABS = [
    { id: 'visao-geral', label: 'Visão Geral', icon: Sparkles, count: null },
    { id: 'mapa', label: 'Mapa de Compradores', icon: MapPin, count: marketData?.geographicData?.length || 0 },
    { id: 'organizacoes', label: 'Organizações', icon: Building2, count: marketData?.buyerProfiles?.length || 0 },
    { id: 'servicos', label: 'Serviços & Demanda', icon: Layers, count: marketData?.serviceIntelligence?.length || 0 },
    { id: 'regioes', label: 'Regiões & Densidade', icon: Globe, count: null },
    { id: 'recorrencia', label: 'Recorrência & Ciclos', icon: Clock, count: marketData?.recurrentBuyersCount || 0 },
    { id: 'concorrencia', label: 'Concorrência Observada', icon: Swords, count: marketData?.competitorIntelligence?.length || 0 },
    { id: 'oportunidades-futuras', label: 'Oportunidades Futuras', icon: Radar, count: marketData?.futureSignals?.length || 0 },
    { id: 'tendencias', label: 'Matriz & Whitespaces', icon: Compass, count: marketData?.targetAccounts?.length || 0 }
  ];

  // Filtros aplicados a compradores
  const filteredBuyers = useMemo(() => {
    if (!marketData?.buyerProfiles) return [];
    return marketData.buyerProfiles.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.servicesPurchased.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchState = !selectedStateFilter || b.state === selectedStateFilter;
      return matchSearch && matchState;
    });
  }, [marketData, searchTerm, selectedStateFilter]);

  if (loading || !marketData) {
    return (
      <div className="market-view-container" style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="#00E5C9" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#94A3B8' }}>Consolidando Inteligência de Mercado com dados observados...</p>
      </div>
    );
  }

  const { overview, dataQuality } = marketData;

  return (
    <div className="market-view-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0B132B',
          border: '1px solid #00E5C9',
          color: '#00E5C9',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 9999,
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* HEADER DA VISÃO DE MERCADO */}
      <div className="market-header">
        <div className="market-title-area">
          <h2>
            <Globe size={24} color="#00E5C9" />
            Inteligência de Mercado & Mapa de Compradores
            <span className="market-badge-core">FASE 32</span>
          </h2>
          <p className="market-subtitle">
            Análise estruturada do ecossistema de contratação pública: antecipe <strong>quem compra</strong>, 
            <strong> quando compra</strong> e <strong>onde estão as oportunidades antes da publicação do edital</strong>.
          </p>
        </div>

        <div className="market-controls">
          {/* Seletor de Empresa (Item 111-113) */}
          <select 
            className="market-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            title="Separador Estratégico por Empresa"
          >
            <option value="Consolidado">Visão Consolidada (Grupo)</option>
            <option value="Veeluen Solutions">Veeluen Solutions (ETE, NR-13, SST, Resíduos)</option>
            <option value="Excelência Ambiental">Excelência Ambiental (Emissões, Ruído, Odor)</option>
          </select>

          {/* Seletor de Janela Histórica (Item 5) */}
          <select
            className="market-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            title="Janela Histórica de Análise"
          >
            <option value="30 dias">Últimos 30 dias</option>
            <option value="90 dias">Últimos 90 dias</option>
            <option value="6 meses">Últimos 6 meses</option>
            <option value="12 meses">Últimos 12 meses</option>
            <option value="24 meses">Últimos 24 meses</option>
          </select>

          {/* Botões de Ação */}
          <button className="market-btn-secondary" onClick={handleRunTests} title="Executar Cenários de Teste E2E (Item 133 a 139)">
            <ShieldCheck size={15} />
            Testes E2E ({testResults ? `${testResults.passed}/${testResults.totalTests}` : 'Item 133-139'})
          </button>

          <button className="market-btn-action" onClick={handleExport} title="Exportar Relatório Executivo de Mercado">
            <Download size={15} />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* BANNER DE DATA COMPLETENESS & LIMITAÇÕES DE DADOS (Itens 7, 8, 9, 118, 119, 120) */}
      <div className="market-completeness-banner">
        <div className="completeness-info">
          <AlertTriangle size={18} color="#00E5C9" />
          <span>
            <strong>Data Completeness & Integridade de Dados:</strong> Valor estimado conhecido em{' '}
            <strong style={{ color: '#00E5C9' }}>{dataQuality.dataCompletenessPct}%</strong> das oportunidades observadas. 
            Resultados consolidados em <strong>{dataQuality.resultsKnownPct}%</strong>.
            <em> Valores ausentes não são projetados artificialmente.</em>
          </span>
        </div>
        <span className="completeness-tag">
          {dataQuality.totalOpportunitiesObserved} Oportunidades Analisadas
        </span>
      </div>

      {/* RESULTADO DOS TESTES AUTOMATIZADOS (QUANDO EXECUTADOS) */}
      {testResults && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          padding: '14px 18px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Relatório de Validação de Regras (Cenários 1 a 6)
            </span>
            <span style={{ color: '#94A3B8' }}>{testResults.passed} de {testResults.totalTests} testes aprovados</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
            {testResults.details.map((t, idx) => (
              <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '6px 10px', borderRadius: '6px' }}>
                <span style={{ color: t.status === 'PASS' ? '#10B981' : '#EF4444', fontWeight: 700, marginRight: '6px' }}>
                  [{t.status}]
                </span>
                <span style={{ color: '#E2E8F0' }}><strong>{t.scenario}:</strong> {t.rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CARDS DE INDICADORES PRINCIPAIS (Item 6) */}
      <div className="market-metrics-grid">
        <div className="market-metric-card">
          <div className="metric-card-top">
            <span>Organizações Compradoras</span>
            <Building2 size={16} color="#00E5C9" />
          </div>
          <div className="metric-card-value">{overview.totalBuyersCount}</div>
          <div className="metric-card-sub">{overview.recurrentBuyersCount} com padrão de recorrência</div>
        </div>

        <div className="market-metric-card">
          <div className="metric-card-top">
            <span>Oportunidades Mapeadas</span>
            <BarChart2 size={16} color="#38BDF8" />
          </div>
          <div className="metric-card-value">{overview.totalOpportunities}</div>
          <div className="metric-card-sub">Período: {selectedPeriod}</div>
        </div>

        <div className="market-metric-card">
          <div className="metric-card-top">
            <span>Valor Total Mapeado</span>
            <DollarSign size={16} color="#10B981" />
          </div>
          <div className="metric-card-value">
            R$ {(overview.totalMappedValue / 1000000).toFixed(1)}M
          </div>
          <div className="metric-card-sub">Baseado somente em dados conhecidos</div>
        </div>

        <div className="market-metric-card">
          <div className="metric-card-top">
            <span>Top Serviço Demandado</span>
            <Layers size={16} color="#F59E0B" />
          </div>
          <div className="metric-card-value" style={{ fontSize: '16px', lineHeight: '1.2' }}>
            {overview.topService}
          </div>
          <div className="metric-card-sub">Maior frequência observada</div>
        </div>

        <div className="market-metric-card">
          <div className="metric-card-top">
            <span>Estado Mais Ativo</span>
            <MapPin size={16} color="#EC4899" />
          </div>
          <div className="metric-card-value">{overview.topState}</div>
          <div className="metric-card-sub">Maior volume de compras no período</div>
        </div>

        <div className="market-metric-card">
          <div className="metric-card-top">
            <span>Sinais Futuros / Radar</span>
            <Radar size={16} color="#8B5CF6" />
          </div>
          <div className="metric-card-value">{overview.futureSignalsCount}</div>
          <div className="metric-card-sub">Contratos a vencer + PCA + Recorrência</div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE AS 9 SUBSEÇÕES (Item 2) */}
      <div className="market-subtabs-nav">
        {SUBTABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`market-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="market-tab-badge">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 1. SUBSEÇÃO: VISÃO GERAL                                       */}
      {/* ============================================================== */}
      {activeSubTab === 'visao-geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Executive Insights (Item 101-105) */}
          <div className="market-panel" style={{ borderLeft: '4px solid #00E5C9' }}>
            <div className="panel-header-row">
              <h3 className="panel-title">
                <Sparkles size={18} color="#00E5C9" />
                Insights Executivos de Mercado (Objetivos & Mensuráveis)
              </h3>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Baseado em dados estruturados</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {marketData.executiveInsights?.map((insight, idx) => (
                <div key={idx} style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#00E5C9', fontWeight: 800 }}>{insight.type}</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{insight.action}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                    {insight.statement}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    Evidência: {insight.metric}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rankings Rápidos: Top Compradores & Top Serviços */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {/* Top Compradores */}
            <div className="market-panel">
              <div className="panel-header-row">
                <h3 className="panel-title">
                  <Building2 size={18} color="#00E5C9" />
                  Top Órgãos Compradores (Frequência & Recorrência)
                </h3>
                <button 
                  className="market-btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                  onClick={() => setActiveSubTab('organizacoes')}
                >
                  Ver todos
                </button>
              </div>
              <div className="market-table-wrapper">
                <table className="market-table">
                  <thead>
                    <tr>
                      <th>Comprador</th>
                      <th>UF</th>
                      <th>Volume</th>
                      <th>Valor Mapeado</th>
                      <th>Recorrência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.buyerProfiles.slice(0, 5).map((b, i) => (
                      <tr key={i} onClick={() => setSelectedBuyerModal(b)} style={{ cursor: 'pointer' }}>
                        <td>
                          <strong>{b.name}</strong>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{b.type}</div>
                        </td>
                        <td>{b.state}</td>
                        <td><strong>{b.totalOpportunities}</strong></td>
                        <td>R$ {(b.totalMappedValue / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</td>
                        <td>
                          <span className={`badge-activity ${b.buyerActivity.toLowerCase().replace(' ', '-')}`}>
                            {b.recurrencePattern.confidence}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Serviços */}
            <div className="market-panel">
              <div className="panel-header-row">
                <h3 className="panel-title">
                  <Layers size={18} color="#38BDF8" />
                  Serviços Mais Demandados no Portfólio
                </h3>
                <button 
                  className="market-btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '11px' }}
                  onClick={() => setActiveSubTab('servicos')}
                >
                  Ver catálogo
                </button>
              </div>
              <div className="market-table-wrapper">
                <table className="market-table">
                  <thead>
                    <tr>
                      <th>Serviço</th>
                      <th>Demanda</th>
                      <th>Ticket Médio</th>
                      <th>Tendência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.serviceIntelligence.slice(0, 5).map((s, i) => (
                      <tr key={i}>
                        <td>
                          <strong>{s.service}</strong>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{s.companyCategory}</div>
                        </td>
                        <td><strong>{s.opportunityCount}</strong> proc.</td>
                        <td>R$ {(s.averageTicket / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</td>
                        <td>
                          <span style={{ 
                            color: s.trend.includes('+') ? '#10B981' : s.trend.includes('-') ? '#EF4444' : '#94A3B8',
                            fontWeight: 700 
                          }}>
                            {s.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUBSEÇÃO: MAPA DE COMPRADORES (GEOGRAFIA INTERATIVA)          */}
      {/* ============================================================== */}
      {activeSubTab === 'mapa' && (
        <div className="market-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <MapPin size={18} color="#00E5C9" />
                Mapa Estratégico de Compradores & Distribuição Geográfica
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Clique em qualquer UF para abrir os dados filtrados e detalhar os compradores atuantes.
              </p>
            </div>

            {/* Alternância de Heatmap por Volume vs Valor (Item 14, 15) */}
            <div className="geo-heatmap-toggle">
              <span style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                Intensidade por:
              </span>
              <button 
                className={`geo-btn-toggle ${geoIntensityMetric === 'volume' ? 'active' : ''}`}
                onClick={() => setGeoIntensityMetric('volume')}
              >
                Volume (Processos)
              </button>
              <button 
                className={`geo-btn-toggle ${geoIntensityMetric === 'valor' ? 'active' : ''}`}
                onClick={() => setGeoIntensityMetric('valor')}
              >
                Valor Mapeado (R$)
              </button>
            </div>
          </div>

          {/* Cards dos Estados */}
          <div className="state-grid-cards">
            {marketData.geographicData.map(geo => {
              const isSelected = selectedStateFilter === geo.state;
              const intensity = geoIntensityMetric === 'volume' ? geo.opportunityCount : geo.totalValueMapped;
              const maxVal = Math.max(...marketData.geographicData.map(g => geoIntensityMetric === 'volume' ? g.opportunityCount : g.totalValueMapped)) || 1;
              const pctFill = Math.min(100, Math.max(15, (intensity / maxVal) * 100));

              return (
                <div 
                  key={geo.state} 
                  className={`state-card-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedStateFilter(isSelected ? null : geo.state);
                    if (!isSelected) showToast(`Filtro geográfico aplicado: ${geo.state}`);
                  }}
                >
                  <div className="state-card-header">
                    <span className="state-uf">{geo.state}</span>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{geo.region}</span>
                  </div>

                  <div className="state-intensity-bar">
                    <div className="state-intensity-fill" style={{ width: `${pctFill}%` }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
                    <span style={{ color: '#E2E8F0' }}><strong>{geo.opportunityCount}</strong> oportunidades</span>
                    <span style={{ color: '#00E5C9' }}>R$ {(geo.totalValueMapped / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                    {geo.buyersCount} órgãos compradores
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalhamento do Estado Selecionado (Item 12, 13) */}
          {selectedStateFilter && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '10px',
              border: '1px solid #00E5C9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: '#00E5C9', fontSize: '15px' }}>
                  Detalhamento Geográfico: {selectedStateFilter}
                </h4>
                <button 
                  className="market-btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={() => setSelectedStateFilter(null)}
                >
                  Limpar Filtro
                </button>
              </div>

              <div style={{ fontSize: '13px', color: '#CBD5E1', marginBottom: '12px' }}>
                Serviços mais demandados nesta localidade:
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {marketData.geographicData.find(g => g.state === selectedStateFilter)?.topServices?.map((srv, idx) => (
                  <span key={idx} style={{
                    background: 'rgba(0, 229, 201, 0.1)',
                    border: '1px solid rgba(0, 229, 201, 0.3)',
                    color: '#00E5C9',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {srv}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUBSEÇÃO: ORGANIZAÇÕES (BUYER PROFILES E HISTÓRICO)          */}
      {/* ============================================================== */}
      {activeSubTab === 'organizacoes' && (
        <div className="market-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Building2 size={18} color="#00E5C9" />
                Organization Intelligence & Buyer Profiles
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Classificação por frequência observada, timeline de compras e oportunidades de cross-sell.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Filtrar organização ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#FFF',
                    borderRadius: '8px',
                    padding: '8px 12px 8px 32px',
                    fontSize: '12px',
                    outline: 'none',
                    minWidth: '220px'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="market-table-wrapper">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Organização</th>
                  <th>Tipo</th>
                  <th>UF</th>
                  <th>Atividade</th>
                  <th>Recorrência</th>
                  <th>Próxima Janela</th>
                  <th>Valor Mapeado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuyers.map((b, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#FFFFFF', cursor: 'pointer' }} onClick={() => setSelectedBuyerModal(b)}>
                        {b.name}
                      </strong>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {b.servicesPurchased.slice(0, 2).join(', ')}
                        {b.servicesPurchased.length > 2 ? ` (+${b.servicesPurchased.length - 2})` : ''}
                      </div>
                    </td>
                    <td>{b.type}</td>
                    <td>{b.state}</td>
                    <td>
                      <span className={`badge-activity ${b.buyerActivity.toLowerCase().replace(' ', '-')}`}>
                        {b.buyerActivity}
                      </span>
                    </td>
                    <td>
                      <span className={`badge-confidence-${b.recurrencePattern.confidence.toLowerCase()}`}>
                        {b.recurrencePattern.confidence}
                      </span>
                    </td>
                    <td style={{ color: '#38BDF8', fontWeight: 600 }}>
                      {b.nextExpectedWindow}
                    </td>
                    <td>
                      R$ {(b.totalMappedValue / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                    </td>
                    <td>
                      <button
                        className="market-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setSelectedBuyerModal(b)}
                      >
                        <Eye size={12} /> Perfil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUBSEÇÃO: SERVIÇOS & DEMANDA (SERVICE INTELLIGENCE)          */}
      {/* ============================================================== */}
      {activeSubTab === 'servicos' && (
        <div className="market-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Layers size={18} color="#00E5C9" />
                Service Intelligence & Dinâmica de Demanda
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Demanda histórica, valor mapeado, tendências semestrais e sazonalidade observada.
              </p>
            </div>
          </div>

          <div className="market-table-wrapper">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Serviço do Portfólio</th>
                  <th>Empresa</th>
                  <th>Oportunidades</th>
                  <th>Valor Mapeado</th>
                  <th>Ticket Médio Típico</th>
                  <th>Tendência</th>
                  <th>Sazonalidade Detectada</th>
                  <th>Compradores Ativos</th>
                </tr>
              </thead>
              <tbody>
                {marketData.serviceIntelligence.map((s, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#FFF' }}>{s.service}</strong>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: s.companyCategory === 'Veeluen Solutions' ? 'rgba(0, 229, 201, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                        color: s.companyCategory === 'Veeluen Solutions' ? '#00E5C9' : '#38BDF8'
                      }}>
                        {s.companyCategory}
                      </span>
                    </td>
                    <td><strong>{s.opportunityCount}</strong></td>
                    <td>R$ {(s.totalMappedValue / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</td>
                    <td>R$ {(s.averageTicket / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</td>
                    <td>
                      <span style={{
                        color: s.trend.includes('+') ? '#10B981' : s.trend.includes('-') ? '#EF4444' : '#94A3B8',
                        fontWeight: 700
                      }}>
                        {s.trend}
                      </span>
                    </td>
                    <td style={{ color: '#F59E0B' }}>
                      {s.seasonality}
                    </td>
                    <td>{s.topBuyers?.length || 0} órgãos</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SUBSEÇÃO: REGIÕES & DENSIDADE DE OPORTUNIDADES               */}
      {/* ============================================================== */}
      {activeSubTab === 'regioes' && (
        <div className="market-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Globe size={18} color="#00E5C9" />
                Densidade de Oportunidades & Comparativo Regional
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Indicador de densidade de mercado por macrorregião e taxa de conversão observada.
              </p>
            </div>
          </div>

          <div className="market-table-wrapper">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Estado / UF</th>
                  <th>Macrorregião</th>
                  <th>Oportunidades</th>
                  <th>Valor Total Mapeado</th>
                  <th>Compradores Ativos</th>
                  <th>Densidade Observada</th>
                  <th>Principais Demandas</th>
                </tr>
              </thead>
              <tbody>
                {marketData.geographicData.map((g, idx) => {
                  const density = g.opportunityCount >= 5 ? 'Alta Densidade' : g.opportunityCount >= 2 ? 'Média Densidade' : 'Baixa Densidade';
                  const densityColor = density.startsWith('Alta') ? '#10B981' : density.startsWith('Média') ? '#38BDF8' : '#94A3B8';
                  return (
                    <tr key={idx}>
                      <td><strong>{g.state}</strong></td>
                      <td>{g.region}</td>
                      <td><strong>{g.opportunityCount}</strong></td>
                      <td>R$ {(g.totalValueMapped / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</td>
                      <td>{g.buyersCount}</td>
                      <td>
                        <span style={{ color: densityColor, fontWeight: 700 }}>
                          {density}
                        </span>
                      </td>
                      <td style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {g.topServices?.slice(0, 2).join(', ') || 'Diversos'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SUBSEÇÃO: RECORRÊNCIA & CICLOS DE COMPRA                     */}
      {/* ============================================================== */}
      {activeSubTab === 'recorrencia' && (
        <div className="market-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Clock size={18} color="#00E5C9" />
                Padrões de Recorrência & Janelas de Recontratação
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Detecção estatística de frequência de compra sem promessas absolutas. Confiança Alta/Média/Baixa.
              </p>
            </div>
          </div>

          <div className="market-table-wrapper">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Órgão Comprador</th>
                  <th>Histórico de Contratações</th>
                  <th>Confiança de Recorrência</th>
                  <th>Ciclo Médio Estimado</th>
                  <th>Janela Potencial Prevista</th>
                  <th>Status de Ação</th>
                </tr>
              </thead>
              <tbody>
                {marketData.buyerProfiles.filter(b => b.totalOpportunities >= 2).map((b, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#FFF' }}>{b.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{b.state}</div>
                    </td>
                    <td>{b.purchaseTimeline?.length || b.totalOpportunities} eventos registrados</td>
                    <td>
                      <span className={`badge-confidence-${b.recurrencePattern.confidence.toLowerCase()}`}>
                        {b.recurrencePattern.confidence}
                      </span>
                    </td>
                    <td>
                      {b.recurrencePattern.averageIntervalDays ? `~${Math.round(b.recurrencePattern.averageIntervalDays / 30)} meses` : 'Padrão anual provável'}
                    </td>
                    <td style={{ color: '#00E5C9', fontWeight: 700 }}>
                      {b.nextExpectedWindow}
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', background: 'rgba(0, 229, 201, 0.1)', color: '#00E5C9', padding: '3px 8px', borderRadius: '4px' }}>
                        Alimentar Radar Antecipado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. SUBSEÇÃO: CONCORRÊNCIA OBSERVADA (HEAD-TO-HEAD)              */}
      {/* ============================================================== */}
      {activeSubTab === 'concorrencia' && (
        <div className="market-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Swords size={18} color="#00E5C9" />
                Concorrência Observada & Confrontos Head-to-Head
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Vitórias e presenças observadas no Vellia. Sem inferência fictícia de market share nacional.
              </p>
            </div>
          </div>

          <div className="market-table-wrapper">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Concorrente</th>
                  <th>Confrontos Head-to-Head</th>
                  <th>Nossas Vitórias</th>
                  <th>Vitórias Deles</th>
                  <th>Órgãos Frequentes</th>
                  <th>Faixa de Preço Típica</th>
                </tr>
              </thead>
              <tbody>
                {marketData.competitorIntelligence.map((c, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#FFF' }}>{c.name}</strong>
                    </td>
                    <td><strong>{c.headToHeadEncounters}</strong> disputas</td>
                    <td style={{ color: '#10B981', fontWeight: 700 }}>{c.ourWins} vitórias</td>
                    <td style={{ color: '#EF4444', fontWeight: 700 }}>{c.theirWins} vitórias</td>
                    <td style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {c.frequentBuyers?.slice(0, 2).join(', ') || 'Vários'}
                    </td>
                    <td style={{ color: '#38BDF8' }}>
                      {c.priceRangeObserved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. SUBSEÇÃO: OPORTUNIDADES FUTURAS (FUTURE SIGNALS)             */}
      {/* ============================================================== */}
      {activeSubTab === 'oportunidades-futuras' && (
        <div className="market-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Radar size={18} color="#00E5C9" />
                Future Signals & Antecipação Comercial
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Combinação de contratos prestes a vencer, PCA, histórico de compras e sinais recorrentes.
              </p>
            </div>
          </div>

          <div className="market-table-wrapper">
            <table className="market-table">
              <thead>
                <tr>
                  <th>Órgão</th>
                  <th>Serviço Mapeado</th>
                  <th>Fonte do Sinal</th>
                  <th>Janela Prevista</th>
                  <th>Confiança</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {marketData.futureSignals.map((sig, idx) => (
                  <tr key={idx}>
                    <td><strong>{sig.organization}</strong></td>
                    <td style={{ color: '#FFF' }}>{sig.service}</td>
                    <td>
                      <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px' }}>
                        {sig.source}
                      </span>
                    </td>
                    <td style={{ color: '#00E5C9', fontWeight: 600 }}>{sig.expectedWindow}</td>
                    <td>
                      <span className={`badge-confidence-${sig.confidence.toLowerCase()}`}>
                        {sig.confidence}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', background: 'rgba(148, 163, 184, 0.15)', color: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>
                        {sig.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 9. SUBSEÇÃO: MATRIZ ESTRATÉGICA & WHITESPACES                   */}
      {/* ============================================================== */}
      {activeSubTab === 'tendencias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Matriz 2x2 (Itens 81-84) */}
          <div className="market-panel">
            <div className="panel-header-row">
              <div>
                <h3 className="panel-title">
                  <Compass size={18} color="#00E5C9" />
                  Matriz Estratégica: Atividade de Mercado × Presença da Empresa
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Orientação para alocação de esforço comercial (Defender, Expandir, Avaliar ou Baixa Prioridade).
                </p>
              </div>
            </div>

            <div className="strategic-quadrants-grid">
              {/* Expandir / Whitespace */}
              <div className="quadrant-box expandir">
                <div className="quadrant-header">
                  <span style={{ color: '#00E5C9' }}>EXPANDIR (Whitespaces)</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Alta Atividade + Baixa Presença</span>
                </div>
                <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>
                  Mercados com volume e demanda elevados onde ainda participamos pouco. Maior potencial de prospecção ativa.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {marketData.strategicMatrix.expandir?.map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                      <strong style={{ color: '#00E5C9' }}>{item.service}</strong> em {item.region} ({item.marketVolume} processos observados)
                    </div>
                  ))}
                </div>
              </div>

              {/* Defender */}
              <div className="quadrant-box defender">
                <div className="quadrant-header">
                  <span style={{ color: '#38BDF8' }}>DEFENDER</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Alta Atividade + Alta Presença</span>
                </div>
                <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>
                  Nossas fortalezas consolidadas. Proteger contratos ativos e reter clientes com relacionamento e inteligência pós-vitória.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {marketData.strategicMatrix.defender?.map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                      <strong style={{ color: '#38BDF8' }}>{item.service}</strong> em {item.region} (Presença sólida)
                    </div>
                  ))}
                </div>
              </div>

              {/* Avaliar */}
              <div className="quadrant-box avaliar">
                <div className="quadrant-header">
                  <span style={{ color: '#F59E0B' }}>AVALIAR</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Baixa Atividade + Alta Presença</span>
                </div>
                <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>
                  Segmentos onde temos vitórias, porém com poucos processos anuais. Manter vigilância seletiva.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {marketData.strategicMatrix.avaliar?.map((item, idx) => (
                    <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}>
                      <strong style={{ color: '#F59E0B' }}>{item.service}</strong> em {item.region}
                    </div>
                  ))}
                </div>
              </div>

              {/* Baixa Prioridade */}
              <div className="quadrant-box">
                <div className="quadrant-header">
                  <span style={{ color: '#94A3B8' }}>BAIXA PRIORIDADE</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Baixa Atividade + Baixa Presença</span>
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  Mercados com baixa aderência e volume residual. Não despender energia comercial proativa.
                </p>
              </div>
            </div>
          </div>

          {/* Target Account List (Itens 55-59) */}
          <div className="market-panel">
            <div className="panel-header-row">
              <div>
                <h3 className="panel-title">
                  <Target size={18} color="#00E5C9" />
                  Target Account List — Contas Prioritárias para Ação Comercial
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Contratantes com alto fit estratégico, volume e recorrência mapeados. Conecte diretamente com o CRM.
                </p>
              </div>
            </div>

            <div className="market-table-wrapper">
              <table className="market-table">
                <thead>
                  <tr>
                    <th>Organização</th>
                    <th>Prioridade</th>
                    <th>Serviços Relacionados</th>
                    <th>Próximo Sinal</th>
                    <th>Valor Histórico</th>
                    <th>Ação Recomendada</th>
                    <th>Integração CRM</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.targetAccounts.map((tgt, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong style={{ color: '#FFF' }}>{tgt.organization}</strong>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Relacionamento: {tgt.relationship}</div>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: tgt.priority === 'Estratégico' ? 'rgba(0, 229, 201, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                          color: tgt.priority === 'Estratégico' ? '#00E5C9' : '#38BDF8'
                        }}>
                          {tgt.priority}
                        </span>
                      </td>
                      <td style={{ fontSize: '11px', color: '#CBD5E1' }}>
                        {tgt.relatedServices.slice(0, 2).join(', ')}
                      </td>
                      <td style={{ color: '#00E5C9', fontWeight: 600 }}>{tgt.nextSignal}</td>
                      <td>R$ {(tgt.historicalValue / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k</td>
                      <td style={{ fontSize: '12px', color: '#E2E8F0' }}>{tgt.nextAction}</td>
                      <td>
                        <button
                          className="market-btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '11px', borderColor: '#00E5C9', color: '#00E5C9' }}
                          onClick={() => handleAddToCRM(tgt)}
                        >
                          <PlusCircle size={13} /> Follow-up CRM
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL DE BUYER PROFILE (DETALHAMENTO DO COMPRADOR)             */}
      {/* ============================================================== */}
      {selectedBuyerModal && (
        <div className="buyer-modal-backdrop" onClick={() => setSelectedBuyerModal(null)}>
          <div className="buyer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="market-badge-core">{selectedBuyerModal.type}</span>
                <h3 style={{ margin: '8px 0 4px 0', color: '#FFF', fontSize: '20px' }}>
                  {selectedBuyerModal.name}
                </h3>
                <span style={{ color: '#94A3B8', fontSize: '13px' }}>
                  Localização: {selectedBuyerModal.state} • Nível de Atividade: <strong style={{ color: '#00E5C9' }}>{selectedBuyerModal.buyerActivity}</strong>
                </span>
              </div>
              <button 
                onClick={() => setSelectedBuyerModal(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Grid de Resumo do Perfil */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Volume Histórico</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>{selectedBuyerModal.totalOpportunities} contratações</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Valor Mapeado</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#10B981' }}>
                  R$ {(selectedBuyerModal.totalMappedValue / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                </div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Confiança de Recorrência</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#00E5C9' }}>
                  {selectedBuyerModal.recurrencePattern.confidence}
                </div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Janela Provável</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#38BDF8' }}>
                  {selectedBuyerModal.nextExpectedWindow}
                </div>
              </div>
            </div>

            {/* Cross-Sell Intelligence (Itens 48-50) */}
            {selectedBuyerModal.crossSellPotential?.length > 0 && (
              <div style={{
                background: 'rgba(0, 229, 201, 0.06)',
                border: '1px solid rgba(0, 229, 201, 0.3)',
                borderRadius: '10px',
                padding: '14px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={16} color="#00E5C9" />
                  <strong style={{ color: '#00E5C9', fontSize: '13px' }}>
                    Cross-Sell Intelligence (Potencial a Avaliar):
                  </strong>
                </div>
                <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '0 0 10px 0' }}>
                  Este órgão já contratou serviços complementares no Vellia, mas nunca registrou compras para:
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedBuyerModal.crossSellPotential.map((cs, i) => (
                    <span key={i} style={{ background: 'rgba(15, 23, 42, 0.8)', color: '#FFF', fontSize: '12px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                      + {cs}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Histórica de Compras (Item 22) */}
            <h4 style={{ color: '#FFF', fontSize: '15px', margin: '0 0 8px 0' }}>
              Timeline Histórica de Contratações
            </h4>
            <div className="buyer-timeline">
              {selectedBuyerModal.purchaseTimeline?.map((item, idx) => (
                <div key={idx} className="timeline-event-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <strong style={{ color: '#00E5C9' }}>{item.year}</strong>
                    <span style={{ color: '#94A3B8' }}>{item.date}</span>
                  </div>
                  <div style={{ color: '#FFF', fontSize: '13px', margin: '4px 0' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Serviço: {item.service} {item.value > 0 ? `• R$ ${item.value.toLocaleString('pt-BR')}` : '• Valor não divulgado'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
              <button 
                className="market-btn-secondary" 
                onClick={() => setSelectedBuyerModal(null)}
              >
                Fechar
              </button>
              <button 
                className="market-btn-action"
                onClick={() => {
                  handleAddToCRM({ organization: selectedBuyerModal.name });
                  setSelectedBuyerModal(null);
                }}
              >
                <PlusCircle size={14} /> Registrar Ação no CRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
