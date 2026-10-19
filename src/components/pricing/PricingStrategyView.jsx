import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Scale,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Eye,
  Sliders,
  History,
  Swords,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  ChevronRight,
  Info,
  RefreshCw,
  Target
} from 'lucide-react';

import {
  comparableOpportunityService,
  SimilarityTier,
  NormalizationUnit,
  PricePositionStatus,
  CompetitivePositionTier
} from '../../services/pricing/comparableOpportunityService.js';
import { OpportunityService } from '../../services/opportunityService.js';
import './PricingStrategyView.css';

export default function PricingStrategyView({ 
  opportunity, 
  onSelectOpportunity, 
  onOpenCopilot 
}) {
  // Oportunidade em Análise (utiliza a passada ou busca a principal de saneamento/efluentes)
  const currentOpp = useMemo(() => {
    if (opportunity) return opportunity;
    const opps = OpportunityService.listAll();
    return opps.find(o => o.title?.includes('ETE') || o.title?.includes('Emiss') || o.client?.includes('Petrobras')) || opps[0];
  }, [opportunity]);

  // Filtros Globais
  const [selectedCompany, setSelectedCompany] = useState(currentOpp?.recommendedCompany || 'Consolidado');
  const [activeSubTab, setActiveSubTab] = useState('visao-geral'); // 'visao-geral' | 'comparaveis' | 'mercado' | 'concorrentes' | 'simulacoes' | 'historico' | 'recomendacoes'
  const [similarityFilter, setSimilarityFilter] = useState('TODOS');
  
  // Parâmetros de Precificação Interna (Formação de Preço)
  const [internalCost, setInternalCost] = useState(1800000); // R$ 1.8M
  const [proposedPrice, setProposedPrice] = useState(2254000); // R$ 2.254M
  const [floorMarginPct, setFloorMarginPct] = useState(12); // Piso de 12%

  // Dados Calculados
  const [comparables, setComparables] = useState([]);
  const [marketRange, setMarketRange] = useState(null);
  const [pricePosition, setPricePosition] = useState(null);
  const [strategyScenarios, setStrategyScenarios] = useState(null);
  const [sensitivityData, setSensitivityData] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  
  // Modais e Testes
  const [whyComparableModal, setWhyComparableModal] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Recalcula a inteligência de precificação
  const refreshPricingIntelligence = () => {
    if (!currentOpp) return;

    const comps = comparableOpportunityService.findComparableOpportunities(currentOpp, selectedCompany);
    const range = comparableOpportunityService.calculateMarketObservedRange(comps);
    const position = comparableOpportunityService.evaluatePricePosition(proposedPrice, range);
    const scenarios = comparableOpportunityService.generateStrategyScenarios(currentOpp, internalCost, floorMarginPct);
    const sensitivity = comparableOpportunityService.calculateSensitivity(proposedPrice, internalCost);
    const compIntel = comparableOpportunityService.getCompetitorPriceIntelligence(currentOpp.primaryService || 'Tratamento de Efluentes');

    setComparables(comps);
    setMarketRange(range);
    setPricePosition(position);
    setStrategyScenarios(scenarios);
    setSensitivityData(sensitivity);
    setCompetitors(compIntel);
  };

  useEffect(() => {
    refreshPricingIntelligence();
  }, [currentOpp, selectedCompany, internalCost, proposedPrice, floorMarginPct]);

  // Executa Testes Automatizados (Itens 143 a 151)
  const handleRunTests = () => {
    const results = comparableOpportunityService.runE2ETests();
    setTestResults(results);
    showToast(`Validação de Precificação: ${results.passed}/${results.totalTests} testes aprovados!`);
  };

  // Subtabs definidas no Item 2
  const SUBTABS = [
    { id: 'visao-geral', label: 'Visão Geral', icon: Sparkles, badge: null },
    { id: 'comparaveis', label: 'Oportunidades Comparáveis', icon: Scale, badge: comparables.length },
    { id: 'mercado', label: 'Mercado Observado', icon: DollarSign, badge: marketRange?.observationsCount ? `${marketRange.observationsCount} obs.` : null },
    { id: 'concorrentes', label: 'Concorrentes & Head-to-Head', icon: Swords, badge: competitors.length },
    { id: 'simulacoes', label: 'Simulações & Cenários', icon: Sliders, badge: '3 cenários' },
    { id: 'historico', label: 'Histórico Interno', icon: History, badge: null },
    { id: 'recomendacoes', label: 'Recomendações Estratégicas', icon: Target, badge: null }
  ];

  // Filtro de Comparáveis
  const filteredComparables = useMemo(() => {
    if (similarityFilter === 'TODOS') return comparables;
    return comparables.filter(c => c.similarityTier === similarityFilter);
  }, [comparables, similarityFilter]);

  const currentMarginPct = useMemo(() => {
    if (proposedPrice <= 0 || internalCost <= 0) return 0;
    return Math.round(((proposedPrice - internalCost) / proposedPrice) * 100);
  }, [proposedPrice, internalCost]);

  if (!currentOpp || !marketRange) {
    return (
      <div className="pricing-view-container" style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="#00E5C9" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#94A3B8' }}>Calculando referências de mercado e comparabilidade semântica...</p>
      </div>
    );
  }

  return (
    <div className="pricing-view-container">
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

      {/* HEADER DA ESTRATÉGIA DE PREÇO */}
      <div className="pricing-header">
        <div className="pricing-title-area">
          <h2>
            <Scale size={24} color="#00E5C9" />
            Inteligência de Concorrência & Estratégia de Preço
            <span className="pricing-badge-core">FASE 34</span>
          </h2>
          <p className="pricing-subtitle">
            Análise contextual de preços externos versus custos internos: compare nossa proposta com <strong>contratos semelhantes</strong>, 
            <strong> identifique a mediana observada</strong> e <strong>proteja margens sem arbitrariedades</strong>.
          </p>
        </div>

        <div className="pricing-controls">
          <select 
            className="pricing-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            title="Isolamento de Empresa"
          >
            <option value="Consolidado">Visão Consolidada (Grupo)</option>
            <option value="Veeluen Solutions">Veeluen Solutions (ETE, NR-13, SST)</option>
            <option value="Excelência Ambiental">Excelência Ambiental (Emissões, Ruído, Odor)</option>
          </select>

          <button className="pricing-btn-secondary" onClick={handleRunTests} title="Executar Cenários de Teste E2E (Itens 143 a 151)">
            <ShieldCheck size={15} />
            Testes E2E ({testResults ? `${testResults.passed}/${testResults.totalTests}` : 'Item 143-151'})
          </button>
        </div>
      </div>

      {/* BANNER DE PRINCÍPIO CENTRAL (Itens 1, 3, 4, 5) */}
      <div className="pricing-principle-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Info size={18} color="#00E5C9" />
          <span>
            <strong>Princípio de Precificação:</strong> O Vellia nunca estipula imperativamente um preço.
            Ele apresenta a <em>faixa de mercado observada</em>, as <em>diferenças de escopo</em> e os <em>riscos de margem</em>.
            Preço externo nunca substitui custo interno. A decisão final é 100% humana.
          </span>
        </div>
        <span style={{ fontSize: '11px', background: 'rgba(0, 229, 201, 0.12)', color: '#00E5C9', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
          {currentOpp.client} • {currentOpp.title?.slice(0, 32)}...
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
              <CheckCircle2 size={16} /> Relatório de Validação de Regras de Precificação (Testes 1 a 8 + Multiempresa)
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

      {/* CARDS DE INDICADORES PRINCIPAIS (Item 152) */}
      <div className="pricing-metrics-grid">
        <div className="pricing-metric-card">
          <div className="metric-card-top">
            <span>Nossa Proposta Atual</span>
            <DollarSign size={16} color="#00E5C9" />
          </div>
          <div className="metric-card-value">
            R$ {(proposedPrice / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
          </div>
          <div className="metric-card-sub">Custo: R$ {(internalCost / 1000).toFixed(0)}k • Margem: {currentMarginPct}%</div>
        </div>

        <div className="pricing-metric-card">
          <div className="metric-card-top">
            <span>Mediana de Mercado</span>
            <Scale size={16} color="#38BDF8" />
          </div>
          <div className="metric-card-value" style={{ color: '#38BDF8' }}>
            {marketRange.isSufficient ? `R$ ${(marketRange.median / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k` : 'Amostra Baixa'}
          </div>
          <div className="metric-card-sub">{marketRange.dataSufficiencyText}</div>
        </div>

        <div className="pricing-metric-card">
          <div className="metric-card-top">
            <span>Posicionamento vs Mediana</span>
            <TrendingUp size={16} color={pricePosition?.diffPctFromMedian > 15 ? '#EF4444' : '#10B981'} />
          </div>
          <div className="metric-card-value" style={{
            fontSize: '20px',
            color: pricePosition?.diffPctFromMedian > 15 ? '#EF4444' : pricePosition?.diffPctFromMedian < -10 ? '#38BDF8' : '#10B981'
          }}>
            {pricePosition?.diffPctFromMedian > 0 ? `+${pricePosition.diffPctFromMedian}%` : `${pricePosition?.diffPctFromMedian}%`}
          </div>
          <div className="metric-card-sub">{pricePosition?.status}</div>
        </div>

        <div className="pricing-metric-card">
          <div className="metric-card-top">
            <span>Preço Piso (Floor Price)</span>
            <Lock size={16} color="#F59E0B" />
          </div>
          <div className="metric-card-value" style={{ color: '#F59E0B' }}>
            R$ {(strategyScenarios?.floorPrice / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
          </div>
          <div className="metric-card-sub">Margem mínima protegida: {floorMarginPct}%</div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE AS 7 SUBSEÇÕES (Item 2) */}
      <div className="pricing-subtabs-nav">
        {SUBTABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`pricing-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge !== null && (
                <span className="pricing-tab-badge">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 1. SUBSEÇÃO: VISÃO GERAL (RESUMO EXECUTIVO DE PREÇO)           */}
      {/* ============================================================== */}
      {activeSubTab === 'visao-geral' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Barra Visual de Comparação com o Mercado Observado */}
          <div className="market-range-visual">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '15px', color: '#FFF' }}>Faixa Observada de Mercado (Contratos Semelhantes)</strong>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>{marketRange.dispersionText}</div>
              </div>
              <span style={{ fontSize: '12px', color: '#00E5C9', fontWeight: 700 }}>
                {marketRange.observationsCount} referências analisadas
              </span>
            </div>

            {/* Barra Horizontal */}
            {marketRange.isSufficient ? (
              <div style={{ padding: '20px 0 10px 0' }}>
                <div className="range-bar-track">
                  {/* Faixa Observada Mínimo ao Máximo */}
                  <div className="range-bar-fill" style={{ left: '15%', right: '15%' }} />
                  
                  {/* Pin da Nossa Proposta */}
                  <div className="range-pin-our" style={{ left: '62%' }}>
                    <div className="pin-bubble">Nossa Proposta: R$ {(proposedPrice / 1000).toFixed(0)}k</div>
                    <div className="pin-needle" />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginTop: '14px' }}>
                  <span>Mínimo: <strong>R$ {(marketRange.min / 1000).toFixed(0)}k</strong></span>
                  <span style={{ color: '#38BDF8' }}>Mediana: <strong>R$ {(marketRange.median / 1000).toFixed(0)}k</strong></span>
                  <span>Média: <strong>R$ {(marketRange.mean / 1000).toFixed(0)}k</strong></span>
                  <span>Máximo: <strong>R$ {(marketRange.max / 1000).toFixed(0)}k</strong></span>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', color: '#F59E0B', fontSize: '13px' }}>
                <AlertTriangle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                {marketRange.dataSufficiencyText}. Os valores observados servem apenas como orientação inicial de baixa densidade.
              </div>
            )}
          </div>

          {/* Comparativo de Cenários Rápidos */}
          <div className="pricing-panel">
            <div className="panel-header-row">
              <div>
                <h3 className="panel-title">
                  <Sliders size={18} color="#00E5C9" />
                  Cenários Comerciais Recomendados para Aprovação
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Simulação de preços baseada nos custos internos de R$ {(internalCost / 1000).toFixed(0)}k respeitando o piso institucional.
                </p>
              </div>
              <button className="pricing-btn-primary" onClick={() => setActiveSubTab('simulacoes')}>
                Ver Simulação Completa
              </button>
            </div>

            <div className="pricing-table-wrapper">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Cenário Estratégico</th>
                    <th>Preço de Envio</th>
                    <th>Margem Projetada</th>
                    <th>Posição vs Mediana</th>
                    <th>Avaliação de Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {strategyScenarios?.scenarios.map((scen, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{scen.name}</strong>
                      </td>
                      <td style={{ color: '#FFF', fontWeight: 800 }}>
                        R$ {(scen.price / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                      </td>
                      <td>
                        <span style={{ color: scen.marginPct >= 20 ? '#10B981' : scen.marginPct >= 15 ? '#38BDF8' : '#F59E0B', fontWeight: 700 }}>
                          {scen.marginPct}%
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#CBD5E1' }}>
                        {scen.positionVsMarket}
                      </td>
                      <td style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {scen.riskText}
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
      {/* 2. SUBSEÇÃO: OPORTUNIDADES COMPARÁVEIS (Itens 6 a 13)           */}
      {/* ============================================================== */}
      {activeSubTab === 'comparaveis' && (
        <div className="pricing-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Scale size={18} color="#00E5C9" />
                Oportunidades Historicamente Semelhantes & Escopos
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Localizadas pelo motor semântico considerando serviço, escopo, quantidade, prazo e região.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`pricing-btn-secondary ${similarityFilter === 'TODOS' ? 'active' : ''}`}
                onClick={() => setSimilarityFilter('TODOS')}
              >
                Todos ({comparables.length})
              </button>
              <button 
                className={`pricing-btn-secondary ${similarityFilter === SimilarityTier.ALTA ? 'active' : ''}`}
                onClick={() => setSimilarityFilter(SimilarityTier.ALTA)}
              >
                Alta Similaridade
              </button>
              <button 
                className={`pricing-btn-secondary ${similarityFilter === SimilarityTier.MEDIA ? 'active' : ''}`}
                onClick={() => setSimilarityFilter(SimilarityTier.MEDIA)}
              >
                Média Similaridade
              </button>
            </div>
          </div>

          <div className="pricing-table-wrapper">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Contratante & Objeto</th>
                  <th>Similaridade</th>
                  <th>Preço Vencedor Observado</th>
                  <th>Preço Normalizado</th>
                  <th>Vencedor Observado</th>
                  <th>Diferenças de Escopo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredComparables.map(comp => (
                  <tr key={comp.id}>
                    <td>
                      <strong style={{ color: '#FFF' }}>{comp.client}</strong>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{comp.object?.slice(0, 48)}...</div>
                    </td>
                    <td>
                      <span className={`badge-similarity ${comp.similarityTier.toLowerCase().includes('alta') ? 'alta' : comp.similarityTier.toLowerCase().includes('média') ? 'media' : 'baixa'}`}>
                        {comp.similarityTier}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#00E5C9' }}>
                        R$ {(comp.winningPrice / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                      </strong>
                    </td>
                    <td style={{ fontSize: '12px', color: '#CBD5E1' }}>
                      R$ {(comp.normalizedPrice / 1000).toFixed(0)}k ({comp.normalizedUnit})
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      <span style={{ color: comp.isOurWin ? '#10B981' : '#CBD5E1', fontWeight: comp.isOurWin ? 800 : 400 }}>
                        {comp.isOurWin ? 'Veeluen (Vitória Nossa)' : comp.winnerName}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {comp.differences[0]}
                    </td>
                    <td>
                      <button 
                        className="pricing-btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                        onClick={() => setWhyComparableModal(comp)}
                      >
                        <HelpCircle size={12} /> Detalhes
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
      {/* 3. SUBSEÇÃO: MERCADO OBSERVADO (FAIXA E OUTLIERS - Itens 19-27) */}
      {/* ============================================================== */}
      {activeSubTab === 'mercado' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="pricing-panel">
            <h3 className="panel-title" style={{ marginBottom: '16px' }}>
              <DollarSign size={18} color="#00E5C9" />
              Estatísticas Estruturadas da Faixa Observada
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Menor Preço Vencedor</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFF' }}>
                  R$ {(marketRange.min / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Piso absoluto observado</span>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(0, 229, 201, 0.3)' }}>
                <span style={{ fontSize: '12px', color: '#00E5C9' }}>Mediana Observada (Métrica Central)</span>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#00E5C9' }}>
                  R$ {(marketRange.median / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Imune a distorções de outliers</span>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Média Aritmética</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFF' }}>
                  R$ {(marketRange.mean / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Média ponderada do conjunto</span>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Maior Preço Vencedor</span>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#FFF' }}>
                  R$ {(marketRange.max / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Teto observado nos certames</span>
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', padding: '16px', borderRadius: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38BDF8', fontWeight: 700, marginBottom: '6px' }}>
                <Sparkles size={16} /> Diagnóstico de Dispersão e Confiabilidade:
              </div>
              <p style={{ margin: '0 0 6px 0', color: '#CBD5E1' }}>
                {marketRange.dispersionText}. A amostra atual compreende <strong>{marketRange.observationsCount} processos com valores vencedores conhecidos</strong>.
              </p>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Regra de Integridade: Valores ausentes em editais não publicados não são inventados ou projetados.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUBSEÇÃO: CONCORRENTES & HEAD-TO-HEAD (Itens 38 a 45)       */}
      {/* ============================================================== */}
      {activeSubTab === 'concorrentes' && (
        <div className="pricing-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <Swords size={18} color="#00E5C9" />
                Concorrência Observada & Confrontos Head-to-Head
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Valores reais de lances observados no Vellia. Sem inferência fictícia de custos ou margens de terceiros.
              </p>
            </div>
          </div>

          <div className="pricing-table-wrapper">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Concorrente</th>
                  <th>Disputas Conosco</th>
                  <th>Nossas Vitórias</th>
                  <th>Vitórias Deles</th>
                  <th>Comportamento de Preço Observado</th>
                  <th>Faixa de Preço Observada</th>
                  <th>Órgãos Frequentes</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong style={{ color: '#FFF' }}>{comp.name}</strong>
                    </td>
                    <td><strong>{comp.observedEncounters}</strong> certames</td>
                    <td style={{ color: '#10B981', fontWeight: 800 }}>{comp.ourWins} vitórias</td>
                    <td style={{ color: '#EF4444', fontWeight: 800 }}>{comp.theirWins} vitórias</td>
                    <td style={{ fontSize: '12px', color: '#CBD5E1' }}>
                      {comp.pricePositioning}
                    </td>
                    <td style={{ color: '#38BDF8', fontWeight: 700 }}>
                      {comp.observedPriceRange}
                    </td>
                    <td style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {comp.frequentBuyers.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SUBSEÇÃO: SIMULAÇÕES & SENSIBILIDADE (Itens 61 a 86)         */}
      {/* ============================================================== */}
      {activeSubTab === 'simulacoes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Painel de Parâmetros Interativos */}
          <div className="pricing-panel">
            <h3 className="panel-title" style={{ marginBottom: '16px' }}>
              <Sliders size={18} color="#00E5C9" />
              Parâmetros de Simulação de Margem e Preço
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Custo Interno Total (R$):</label>
                <input
                  type="number"
                  value={internalCost}
                  onChange={(e) => setInternalCost(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#FFF',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Preço Ofertado Proposto (R$):</label>
                <input
                  type="number"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#FFF',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Margem Mínima de Proteção / Piso (%):</label>
                <input
                  type="number"
                  value={floorMarginPct}
                  onChange={(e) => setFloorMarginPct(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    color: '#FFF',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Análise de Sensibilidade e Choques de Custo */}
          <div className="pricing-panel">
            <h3 className="panel-title" style={{ marginBottom: '14px' }}>
              <TrendingDown size={18} color="#F59E0B" />
              Análise de Sensibilidade & Impacto de Choques de Custo
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Redução de 5% no Lance</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFF', margin: '4px 0' }}>
                  R$ {(sensitivityData?.sensitivityMinus5.price / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  Nova margem projetada: <strong style={{ color: '#00E5C9' }}>{sensitivityData?.sensitivityMinus5.margin}%</strong>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Redução de 10% no Lance</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFF', margin: '4px 0' }}>
                  R$ {(sensitivityData?.sensitivityMinus10.price / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  Nova margem projetada: <strong style={{ color: '#F59E0B' }}>{sensitivityData?.sensitivityMinus10.margin}%</strong>
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #EF4444' }}>
                <span style={{ fontSize: '12px', color: '#EF4444' }}>Choque de Custo (+8% Terceirização)</span>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFF', margin: '4px 0' }}>
                  Custo: R$ {(sensitivityData?.costShockPlus8.cost / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: '12px', color: '#CBD5E1' }}>
                  Margem comprimida para: <strong style={{ color: '#EF4444' }}>{sensitivityData?.costShockPlus8.margin}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SUBSEÇÃO: HISTÓRICO INTERNO (Itens 31 a 37)                  */}
      {/* ============================================================== */}
      {activeSubTab === 'historico' && (
        <div className="pricing-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="panel-title">
                <History size={18} color="#00E5C9" />
                Histórico de Propostas Anteriores da Empresa
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                Relação entre preço ofertado, margem e desfecho real. Derrotas por documentação não são tratadas como perda por preço.
              </p>
            </div>
          </div>

          <div className="pricing-table-wrapper">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Oportunidade</th>
                  <th>Preço Ofertado</th>
                  <th>Custo Base</th>
                  <th>Margem Planejada</th>
                  <th>Resultado</th>
                  <th>Motivo Registrado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>COMPESA — Operação ETE Caruaru</strong></td>
                  <td>R$ 1.950.000</td>
                  <td>R$ 1.520.000</td>
                  <td style={{ color: '#10B981', fontWeight: 700 }}>22%</td>
                  <td><span style={{ color: '#10B981', fontWeight: 800 }}>GANHA</span></td>
                  <td>Preço competitivo com margem garantida</td>
                </tr>
                <tr>
                  <td><strong>Petrobras — Monitoramento de Emissões RNEST</strong></td>
                  <td>R$ 2.450.000</td>
                  <td>R$ 1.900.000</td>
                  <td style={{ color: '#10B981', fontWeight: 700 }}>22%</td>
                  <td><span style={{ color: '#10B981', fontWeight: 800 }}>GANHA</span></td>
                  <td>Diferencial técnico com preço na mediana</td>
                </tr>
                <tr>
                  <td><strong>Universidade Federal — Laudos NR-13</strong></td>
                  <td>R$ 380.000</td>
                  <td>R$ 290.000</td>
                  <td style={{ color: '#38BDF8', fontWeight: 700 }}>24%</td>
                  <td><span style={{ color: '#EF4444', fontWeight: 800 }}>PERDIDA</span></td>
                  <td>Preço (Concorrente ofertou R$ 340.000)</td>
                </tr>
                <tr>
                  <td><strong>Suape — Gestão de Resíduos Industriais</strong></td>
                  <td>R$ 1.200.000</td>
                  <td>R$ 960.000</td>
                  <td style={{ color: '#F59E0B', fontWeight: 700 }}>20%</td>
                  <td><span style={{ color: '#F59E0B', fontWeight: 800 }}>INABILITADA</span></td>
                  <td>Documentação (Certidão CREA vencida — NÃO FOI PREÇO)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. SUBSEÇÃO: RECOMENDAÇÕES ESTRATÉGICAS (Itens 73 a 78)         */}
      {/* ============================================================== */}
      {activeSubTab === 'recomendacoes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="pricing-panel">
            <h3 className="panel-title" style={{ marginBottom: '16px' }}>
              <Target size={18} color="#00E5C9" />
              Diretrizes & Alertas de Proteção de Margem (Margin Protection)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Recomendação de Posicionamento */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderLeft: '4px solid #00E5C9',
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#00E5C9', fontSize: '14px' }}>Posicionamento da Proposta vs Mediana:</strong>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Orientação Comercial</span>
                </div>
                <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#E2E8F0' }}>
                  {pricePosition?.diffPctFromMedian > 12 
                    ? `Nossa proposta está ${pricePosition.diffPctFromMedian}% acima da mediana observada de ${marketRange.observationsCount} contratos comparáveis. Recomenda-se revisar a composição de custos e o BDI antes da aprovação final.`
                    : pricePosition?.diffPctFromMedian < -10
                      ? `Nossa proposta já está ${Math.abs(pricePosition.diffPctFromMedian)}% abaixo da mediana observada e com margem de ${currentMarginPct}%. Evitar reduções agressivas adicionais na disputa de lances.`
                      : 'Nossa proposta está dentro da faixa plausível observada em certames anteriores.'}
                </p>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  Decisão Estratégica: O Vellia não dita o valor da proposta; cabe à diretoria comercial balancear probabilidade de vitória e margem.
                </div>
              </div>

              {/* Alerta de Floor Price */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderLeft: '4px solid #F59E0B',
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#F59E0B', fontSize: '14px' }}>Proteção Institucional de Preço Piso (Floor Guard):</strong>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Regra de Governança</span>
                </div>
                <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#E2E8F0' }}>
                  O piso mínimo estabelecido é de <strong>R$ {(strategyScenarios?.floorPrice / 1000).toFixed(0)}k</strong> (margem de {floorMarginPct}%). Durante a sessão de lances na Sala de Guerra, qualquer oferta abaixo deste valor será estritamente bloqueada sem a aprovação formal de Override pela Diretoria.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: POR QUE É COMPARÁVEL? (Itens 155 a 158)                  */}
      {/* ============================================================== */}
      {whyComparableModal && (
        <div className="pricing-modal-backdrop" onClick={() => setWhyComparableModal(null)}>
          <div className="pricing-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="pricing-badge-core">CRITÉRIOS DE SIMILARIDADE SEMÂNTICA</span>
                <h3 style={{ margin: '8px 0 2px 0', color: '#FFF', fontSize: '18px' }}>
                  {whyComparableModal.client}
                </h3>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>{whyComparableModal.object}</span>
              </div>
              <button onClick={() => setWhyComparableModal(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '20px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Nível de Similaridade</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#00E5C9' }}>{whyComparableModal.similarityTier}</div>
              </div>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94A3B8' }}>Preço Vencedor Observado</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  R$ {(whyComparableModal.winningPrice / 1000).toLocaleString('pt-BR')}k
                </div>
              </div>
            </div>

            <h4 style={{ color: '#FFF', fontSize: '14px', margin: '0 0 6px 0' }}>Fatores de Comparabilidade Semântica:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#10B981" />
                <span>Mesma categoria de serviço ({whyComparableModal.service})</span>
              </div>
              <div style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#10B981" />
                <span>Escopo compatível e regime de contratação correlato</span>
              </div>
            </div>

            <h4 style={{ color: '#FFF', fontSize: '14px', margin: '0 0 6px 0' }}>Diferenças Principais Notadas:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              {whyComparableModal.differences?.map((diff, i) => (
                <div key={i} style={{ fontSize: '12px', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
                  • {diff}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="pricing-btn-secondary" onClick={() => setWhyComparableModal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
