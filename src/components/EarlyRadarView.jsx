import React, { useState, useEffect, useMemo } from 'react';
import {
  earlyRadarService,
  INITIAL_PCA_RECORDS
} from '../services/earlyradar/earlyRadarService.js';
import {
  contractMonitoringService
} from '../services/earlyradar/contractMonitoringService.js';
import {
  buyingPatternService
} from '../services/earlyradar/buyingPatternService.js';
import {
  signalClusterService
} from '../services/earlyradar/signalClusterService.js';
import {
  ExpirationWindow,
  formatExpirationWindowLabel,
  ScoreTier,
  EarlyRecordType,
  SignalType
} from '../services/earlyradar/earlyRadarModels.js';
import {
  Radar,
  Compass,
  Calendar,
  Clock,
  Building2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Plus,
  RefreshCw,
  Layers,
  MapPin,
  FileText,
  UserCheck,
  PieChart,
  HelpCircle,
  Eye,
  Star,
  CheckSquare,
  Activity
} from 'lucide-react';
import './EarlyRadarView.css';

export default function EarlyRadarView() {
  const [activeTab, setActiveTab] = useState('futuras'); // 'futuras' | 'planejamentos' | 'contratos' | 'padroes' | 'monitorados'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHorizon, setSelectedHorizon] = useState('ALL'); // 'ALL' | '30_DIAS' | '60_DIAS' | '90_DIAS' | '6_MESES' | '12_MESES'
  const [selectedWindowFilter, setSelectedWindowFilter] = useState('ALL');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('ALL');

  // Dados reativos
  const [clusters, setClusters] = useState([]);
  const [pcas, setPcas] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [buyingPatterns, setBuyingPatterns] = useState([]);
  const [watchlistOrgans, setWatchlistOrgans] = useState([]);
  const [watchlistServices, setWatchlistServices] = useState([]);
  const [commercialActions, setCommercialActions] = useState([]);
  const [earlyAlerts, setEarlyAlerts] = useState([]);
  const [conversionMetrics, setConversionMetrics] = useState({ totalSignals: 0, convertedSignals: 0, conversionRatePercent: 0, funnel: {} });
  const [jobStatusMsg, setJobStatusMsg] = useState(null);

  // Modais
  const [selectedScoreExplanation, setSelectedScoreExplanation] = useState(null);
  const [selectedOrganProfile, setSelectedOrganProfile] = useState(null);
  const [actionModalCluster, setActionModalCluster] = useState(null);
  const [newActionForm, setNewActionForm] = useState({
    responsible: 'Camila Torres (Comercial Vellia)',
    contact: '',
    objective: '',
    date: new Date().toISOString().split('T')[0],
    observation: '',
    nextAction: '',
    checklist: {
      validarServico: true,
      validarAtestado: true,
      atualizarDocumentacao: false,
      verificarEquipe: false,
      verificarEquipamentos: true,
      estudarPrecosHistoricos: true,
      mapearConcorrentes: false
    }
  });

  const loadAllData = () => {
    setClusters(earlyRadarService.getSignalClusters());
    setPcas(earlyRadarService.getAllPcas());
    setContracts(contractMonitoringService.getAllContracts());
    setBuyingPatterns(earlyRadarService.getBuyingPatterns());
    setWatchlistOrgans(earlyRadarService.getWatchlistOrgans());
    setWatchlistServices(earlyRadarService.getWatchlistServices());
    setCommercialActions(earlyRadarService.getCommercialActions());
    setEarlyAlerts(earlyRadarService.getEarlyAlerts());
    setConversionMetrics(earlyRadarService.getConversionMetrics());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRunEarlyJob = () => {
    const res = earlyRadarService.runEarlyRadarJob();
    setJobStatusMsg(`Job executado com sucesso: ${res.totalClustersProcessed} oportunidades futuras auditadas em modo incremental.`);
    loadAllData();
    setTimeout(() => setJobStatusMsg(null), 5000);
  };

  const handleToggleFavoriteOrgan = (organId) => {
    earlyRadarService.toggleFavoriteOrgan(organId);
    setWatchlistOrgans(earlyRadarService.getWatchlistOrgans());
  };

  const handleSaveCommercialAction = (e) => {
    e.preventDefault();
    if (!actionModalCluster) return;

    earlyRadarService.addCommercialAction({
      clusterId: actionModalCluster.clusterId,
      organ: actionModalCluster.organShort || actionModalCluster.organ,
      contact: newActionForm.contact,
      responsible: newActionForm.responsible,
      objective: newActionForm.objective,
      date: newActionForm.date,
      observation: newActionForm.observation,
      nextAction: newActionForm.nextAction,
      checklist: newActionForm.checklist,
      status: 'EM_ANDAMENTO'
    });

    setCommercialActions(earlyRadarService.getCommercialActions());
    setActionModalCluster(null);
  };

  // Filtragem de clusters de oportunidades futuras
  const filteredClusters = useMemo(() => {
    return clusters.filter(cl => {
      const matchQuery = !searchQuery || 
        cl.organ.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cl.relatedService.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchHorizon = selectedHorizon === 'ALL' || cl.targetHorizon === selectedHorizon;
      const matchRegion = selectedRegionFilter === 'ALL' || cl.state.includes(selectedRegionFilter);

      return matchQuery && matchHorizon && matchRegion;
    });
  }, [clusters, searchQuery, selectedHorizon, selectedRegionFilter]);

  // Contratos a vencer filtrados
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const matchQuery = !searchQuery ||
        c.organ.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.relatedService.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.currentSupplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchWindow = selectedWindowFilter === 'ALL' || c.windowCategory === selectedWindowFilter;
      return matchQuery && matchWindow;
    });
  }, [contracts, searchQuery, selectedWindowFilter]);

  // PCAs filtrados
  const filteredPcas = useMemo(() => {
    return pcas.filter(p => {
      return !searchQuery ||
        p.organ.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.plannedObject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.targetService.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [pcas, searchQuery]);

  return (
    <div className="early-radar-container">
      {/* HEADER EXECUTIVO & FILOSOFIA PREVENTIVA */}
      <header className="early-radar-header">
        <div className="header-left">
          <div className="module-tag">
            <Compass size={18} className="spin-slow" />
            <span>Inteligência Preditiva Baseada em Evidências</span>
          </div>
          <h1 className="header-title">Radar Antecipado de Oportunidades</h1>
          <p className="header-subtitle">
            Identifique indícios documentais e padrões históricos antes da abertura oficial do edital.
            <strong> Conceito: Não espere o edital sair para começar a se preparar.</strong>
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-run-job" onClick={handleRunEarlyJob}>
            <RefreshCw size={16} />
            <span>Executar EarlyRadarJob</span>
          </button>
        </div>
      </header>

      {jobStatusMsg && (
        <div className="job-status-banner">
          <CheckCircle2 size={16} />
          <span>{jobStatusMsg}</span>
        </div>
      )}

      {/* DASHBOARD EXECUTIVO (Item 59) */}
      <section className="executive-kpi-grid">
        <div className="kpi-card highlight-emerald">
          <div className="kpi-top">
            <span className="kpi-label">Oportunidades Futuras</span>
            <Radar size={20} className="kpi-icon" />
          </div>
          <div className="kpi-value">{clusters.filter(c => c.earlyStatus !== EarlyRecordType.OPEN).length}</div>
          <div className="kpi-detail">
            <span className="text-emerald">{clusters.filter(c => c.score >= 70).length} de alto potencial</span> identificado
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Planejamentos Oficiais (PCA)</span>
            <FileText size={20} className="kpi-icon text-cyan" />
          </div>
          <div className="kpi-value">{pcas.length}</div>
          <div className="kpi-detail">Com adesão ao portfólio da Vellia</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Contratos a Vencer</span>
            <Clock size={20} className="kpi-icon text-amber" />
          </div>
          <div className="kpi-value">{contracts.length}</div>
          <div className="kpi-detail">
            {contracts.filter(c => c.estimatedDaysRemaining <= 60).length} vencem em menos de 60 dias
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Taxa de Conversão (Signals)</span>
            <TrendingUp size={20} className="kpi-icon text-indigo" />
          </div>
          <div className="kpi-value">{conversionMetrics.conversionRatePercent}%</div>
          <div className="kpi-detail">
            {conversionMetrics.convertedSignals} de {conversionMetrics.totalSignals} sinais viraram licitações
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Ações Comerciais Preventivas</span>
            <UserCheck size={20} className="kpi-icon text-rose" />
          </div>
          <div className="kpi-value">{commercialActions.length}</div>
          <div className="kpi-detail">Preparação técnica e acervo em curso</div>
        </div>
      </section>

      {/* METODOLOGIA CAUTELOSA (Item 5: Não confundir previsão com fato) */}
      <div className="cautious-banner">
        <ShieldCheck size={20} className="banner-icon" />
        <div className="banner-content">
          <strong>Rigor de Inteligência & Transparência Epistêmica:</strong>
          <span>
            O Radar Antecipado trabalha estritamente com dados auditáveis: PCA oficial, contratos em vigor e séries temporais.
            Inferências estatísticas nunca são tratadas como certames abertos. Classificamos tudo em:
            <span className="badge-planned">PLANEJAMENTO</span>
            <span className="badge-predicted">INDÍCIO / PREDIÇÃO</span> e
            <span className="badge-open">LICITAÇÃO ABERTA</span>.
          </span>
        </div>
      </div>

      {/* NAVEGAÇÃO DE SUBSEÇÕES (Item 1) */}
      <nav className="early-radar-nav">
        <button
          className={`nav-tab-btn ${activeTab === 'futuras' ? 'active' : ''}`}
          onClick={() => setActiveTab('futuras')}
        >
          <Radar size={18} />
          <span>Oportunidades Futuras ({filteredClusters.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'planejamentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('planejamentos')}
        >
          <FileText size={18} />
          <span>Planejamentos (PCA) ({pcas.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'contratos' ? 'active' : ''}`}
          onClick={() => setActiveTab('contratos')}
        >
          <Clock size={18} />
          <span>Contratos a Vencer ({contracts.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'padroes' ? 'active' : ''}`}
          onClick={() => setActiveTab('padroes')}
        >
          <PieChart size={18} />
          <span>Padrões de Compra ({buyingPatterns.length})</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'monitorados' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitorados')}
        >
          <Building2 size={18} />
          <span>Órgãos & Watchlist</span>
        </button>
      </nav>

      {/* BARRA DE FILTROS GERAIS */}
      <div className="filter-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Filtrar por órgão, serviço ou objeto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'futuras' && (
          <div className="select-filters">
            <label>Horizonte:</label>
            <select value={selectedHorizon} onChange={(e) => setSelectedHorizon(e.target.value)}>
              <option value="ALL">Todos os horizontes</option>
              <option value="30_DIAS">Próximos 30 dias</option>
              <option value="60_DIAS">Próximos 60 dias</option>
              <option value="90_DIAS">Próximos 90 dias</option>
              <option value="CONVERTED">Já Convertidas em Aberta</option>
            </select>

            <label>Região:</label>
            <select value={selectedRegionFilter} onChange={(e) => setSelectedRegionFilter(e.target.value)}>
              <option value="ALL">Todas as Regiões</option>
              <option value="PE">Pernambuco (Prioritária)</option>
              <option value="NE">Nordeste</option>
              <option value="BR">Nacional</option>
            </select>
          </div>
        )}

        {activeTab === 'contratos' && (
          <div className="select-filters">
            <label>Janela de Vencimento:</label>
            <select value={selectedWindowFilter} onChange={(e) => setSelectedWindowFilter(e.target.value)}>
              <option value="ALL">Todas as janelas</option>
              <option value={ExpirationWindow.ATE_30_DIAS}>Até 30 dias</option>
              <option value={ExpirationWindow.DIAS_31_60}>31 a 60 dias</option>
              <option value={ExpirationWindow.DIAS_61_90}>61 a 90 dias</option>
              <option value={ExpirationWindow.DIAS_91_180}>91 a 180 dias</option>
              <option value={ExpirationWindow.MAIS_180_DIAS}>Mais de 180 dias</option>
            </select>
          </div>
        )}
      </div>

      {/* CONTEÚDO DAS SUBSEÇÕES */}
      <main className="tab-main-content">
        {/* SUBSEÇÃO 1: OPORTUNIDADES FUTURAS / MATRIZ PREDITIVA */}
        {activeTab === 'futuras' && (
          <section className="tab-pane">
            <div className="section-intro">
              <div>
                <h2>Matriz Preditiva de Oportunidades Futuras</h2>
                <p>Consolidação de múltiplos sinais convergentes (PCA + Contratos a vencer + Recorrência de compras).</p>
              </div>
            </div>

            <div className="clusters-grid">
              {filteredClusters.map(cl => (
                <div key={cl.clusterId} className={`cluster-card border-${cl.tier.toLowerCase()}`}>
                  <div className="cluster-top">
                    <div className="cluster-header-badges">
                      {cl.earlyStatus === EarlyRecordType.OPEN ? (
                        <span className="badge-open">LICITAÇÃO OFICIALMENTE ABERTA</span>
                      ) : cl.earlyStatus === EarlyRecordType.PLANNED ? (
                        <span className="badge-planned">PLANEJAMENTO IDENTIFICADO</span>
                      ) : (
                        <span className="badge-predicted">INDÍCIO DE CONTRATAÇÃO</span>
                      )}

                      <span className="badge-state">{cl.state}</span>
                    </div>

                    <div
                      className="score-badge-interactive"
                      onClick={() => setSelectedScoreExplanation(cl)}
                      title="Clique para ver explicação detalhada do Score"
                    >
                      <div className="score-num" style={{ color: cl.badgeColor }}>{cl.score}</div>
                      <div className="score-tier-label">{cl.tierLabel}</div>
                      <HelpCircle size={14} className="score-help-icon" />
                    </div>
                  </div>

                  <h3 className="cluster-organ-title" onClick={() => setSelectedOrganProfile(cl.organShort)}>
                    {cl.organShort}
                    <ChevronRight size={16} className="title-arrow" />
                  </h3>
                  <div className="cluster-service-name">{cl.relatedService}</div>

                  <div className="cluster-summary-box">
                    <div className="summary-row">
                      <span className="label">Valor Estimado Histórico:</span>
                      <strong className="value">R$ {Number(cl.maxEstimatedValue).toLocaleString('pt-BR')}</strong>
                    </div>
                    <div className="summary-row">
                      <span className="label">Aderência Técnica Vellia:</span>
                      <strong className="value text-emerald">{cl.bestAdherence}%</strong>
                    </div>
                    <div className="summary-row">
                      <span className="label">Sinais Convergentes:</span>
                      <span className="value">{cl.signals.length} fonte(s) identificada(s)</span>
                    </div>
                  </div>

                  {/* SINAIS DETECTADOS NO CLUSTER */}
                  <div className="cluster-signals-list">
                    <span className="signals-title">Sinais Mapeados (Auditoria):</span>
                    {cl.signals.map(s => (
                      <div key={s.id} className="signal-pill">
                        <span className="signal-type-tag">{s.type}</span>
                        <span className="signal-desc-snippet">{s.title}</span>
                      </div>
                    ))}
                  </div>

                  {/* TIMELINE DE EVENTOS (Item 23) */}
                  <div className="cluster-timeline">
                    <span className="timeline-title">Linha do Tempo de Evidências:</span>
                    <div className="timeline-steps">
                      {cl.timeline.map((item, idx) => (
                        <div key={idx} className="timeline-step-item">
                          <div className="step-dot" />
                          <div className="step-text">
                            <strong>{item.title}</strong>
                            <span className="step-meta">{new Date(item.date).toLocaleDateString('pt-BR')} • {item.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AÇÕES DE PROSPECÇÃO ANTECIPADA */}
                  <div className="cluster-card-footer">
                    <button
                      className="btn-create-action"
                      onClick={() => {
                        setActionModalCluster(cl);
                        setNewActionForm(prev => ({
                          ...prev,
                          contact: `Divisão de Licitações / SMS ${cl.organShort}`,
                          objective: `Preparação prévia de atestados e equipe técnica para ${cl.relatedService}`
                        }));
                      }}
                    >
                      <Plus size={16} />
                      <span>Criar Ação Comercial</span>
                    </button>

                    <button
                      className="btn-view-profile"
                      onClick={() => setSelectedOrganProfile(cl.organShort)}
                    >
                      <Building2 size={16} />
                      <span>Perfil do Órgão</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 2: PLANEJAMENTOS OFICIAIS (PCA) */}
        {activeTab === 'planejamentos' && (
          <section className="tab-pane">
            <div className="section-intro">
              <div>
                <h2>Planos de Contratações Anual (PCA) Oficiais</h2>
                <p>Aquisições formalmente cadastradas em planos anuais de órgãos da administração pública.</p>
              </div>
            </div>

            <div className="table-wrapper">
              <table className="early-table">
                <thead>
                  <tr>
                    <th>Órgão / Unidade</th>
                    <th>Objeto Planejado</th>
                    <th>Serviço Relacionado</th>
                    <th>Aderência Vellia</th>
                    <th>Valor Estimado</th>
                    <th>Previsão</th>
                    <th>Fonte Oficial</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPcas.map(p => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.organShort}</strong>
                        <div className="subtext">{p.unit}</div>
                        <span className="badge-planned">PCA {p.year} (Item {p.itemNumber})</span>
                      </td>
                      <td className="object-cell">
                        <div className="object-title">{p.plannedObject}</div>
                        <div className="subtext">{p.description}</div>
                      </td>
                      <td>
                        <span className="service-tag">{p.targetService}</span>
                      </td>
                      <td>
                        <div className="adherence-badge">
                          <span className="pct">{p.adherencePercent}%</span>
                          <span className="status-label">PLANEJAMENTO</span>
                        </div>
                      </td>
                      <td>
                        <strong>R$ {Number(p.estimatedValue).toLocaleString('pt-BR')}</strong>
                      </td>
                      <td>
                        <div>{p.predictedDate || 'Data a definir'}</div>
                        <div className="subtext date-caution-note">{p.dateConfidenceNote}</div>
                      </td>
                      <td>
                        {p.sourceUrl ? (
                          <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="link-source">
                            <span>{p.source}</span>
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <span className="subtext">{p.source}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 3: CONTRATOS A VENCER */}
        {activeTab === 'contratos' && (
          <section className="tab-pane">
            <div className="section-intro">
              <div>
                <h2>Contratos Públicos Monitorados a Vencer</h2>
                <p>Acompanhamento de prazos de encerramento contratual e identificação do concorrente incumbente.</p>
              </div>
            </div>

            <div className="contracts-cards-grid">
              {filteredContracts.map(c => (
                <div key={c.id} className="contract-card">
                  <div className="contract-header">
                    <div>
                      <span className="badge-window">{formatExpirationWindowLabel(c.windowCategory)}</span>
                      <h3 className="contract-organ">{c.organShort}</h3>
                      <div className="contract-num">Contrato nº {c.number}</div>
                    </div>
                    <div className="days-counter-box">
                      <span className="counter-num">{c.estimatedDaysRemaining}</span>
                      <span className="counter-label">dias restantes</span>
                    </div>
                  </div>

                  <p className="contract-object">{c.object}</p>

                  <div className="incumbent-box">
                    <div className="incumbent-label">
                      <UserCheck size={16} />
                      <span>Fornecedor Incumbente Atual:</span>
                    </div>
                    <div className="incumbent-name">
                      {c.isIncumbentKnown ? c.currentSupplier : 'Fornecedor não informado'}
                    </div>
                    <div className="incumbent-risk">
                      Risco de Incumbência: <strong className={`risk-${c.incumbencyRisk.toLowerCase()}`}>{c.incumbencyRisk}</strong>
                    </div>
                  </div>

                  <div className="contract-details-grid">
                    <div>
                      <span className="sublabel">Valor Contratual:</span>
                      <strong>R$ {Number(c.initialValue).toLocaleString('pt-BR')}</strong>
                    </div>
                    <div>
                      <span className="sublabel">Data Término:</span>
                      <strong>{new Date(c.endDate).toLocaleDateString('pt-BR')}</strong>
                    </div>
                  </div>

                  {/* SINAL COMERCIAL CAUTELOSO (Item 11, 12) */}
                  <div className="commercial-signal-box">
                    <AlertTriangle size={16} className="signal-icon" />
                    <p>{c.commercialSignalMessage}</p>
                  </div>

                  {c.extensionNotes && (
                    <div className="extension-notes">
                      <strong>Análise de Prorrogação:</strong> {c.extensionNotes}
                    </div>
                  )}

                  <div className="card-bottom">
                    <span className="source-label">Fonte: {c.source}</span>
                    {c.sourceUrl && (
                      <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="link-source">
                        <span>Ver Contrato</span>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 4: PADRÕES DE COMPRA (BUYING PATTERNS) */}
        {activeTab === 'padroes' && (
          <section className="tab-pane">
            <div className="section-intro">
              <div>
                <h2>Padrões de Compra e Sazonalidade dos Órgãos</h2>
                <p>Análise de recorrência, períodos habituais de contratação e histórico de fornecedores.</p>
              </div>
            </div>

            <div className="patterns-grid">
              {buyingPatterns.map(bp => (
                <div key={bp.organId} className="pattern-card">
                  <div className="pattern-top">
                    <div>
                      <h3 className="pattern-title">{bp.organShort}</h3>
                      <span className="pattern-state">{bp.state}</span>
                    </div>
                    <div className="volume-badge">
                      <span>Volume Observado:</span>
                      <strong>R$ {Number(bp.totalVolumeObserved).toLocaleString('pt-BR')}</strong>
                    </div>
                  </div>

                  {!bp.hasSufficientHistory ? (
                    <div className="insufficient-history-warning">
                      <AlertTriangle size={18} />
                      <div>
                        <strong>Histórico insuficiente para identificar padrão:</strong>
                        <p>O órgão possui poucas compras registradas nesta área. O sistema não gera previsões estatísticas sem base amostral consolidada.</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="pattern-insights-box">
                        <div className="insight-item">
                          <strong>Sazonalidade Temporal:</strong>
                          <p>{bp.seasonalAnalysis}</p>
                        </div>
                        <div className="insight-item">
                          <strong>Recorrência:</strong>
                          <p>{bp.recurrenceInsight}</p>
                        </div>
                      </div>

                      <div className="top-services-list">
                        <h4>Serviços Mais Contratados no Órgão:</h4>
                        {bp.topServices.map((srv, idx) => (
                          <div key={idx} className="srv-row">
                            <span className="srv-name">{srv.service}</span>
                            <span className="srv-count">{srv.count} editais</span>
                            <span className="srv-avg">Média: R$ {Number(srv.averageValue).toLocaleString('pt-BR')}</span>
                          </div>
                        ))}
                      </div>

                      <div className="suppliers-history">
                        <h4>Histórico de Fornecedores Vencedores:</h4>
                        {bp.winningSuppliersHistory.map((w, idx) => (
                          <div key={idx} className="winner-row">
                            <span className="winner-name">{w.supplier}</span>
                            <span className="winner-contracts">{w.contractsCount} contratos</span>
                            <span className="winner-last">Última: {w.lastWonYear}</span>
                          </div>
                        ))}
                      </div>

                      <div className="winrate-footer">
                        <span>Win Rate Histórico da Vellia neste órgão:</span>
                        <strong className="text-emerald">{bp.internalWinRate}%</strong>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 5: ÓRGÃOS MONITORADOS & MAPA REGIONAL */}
        {activeTab === 'monitorados' && (
          <section className="tab-pane">
            <div className="section-intro">
              <div>
                <h2>Watchlist de Órgãos e Serviços Estratégicos</h2>
                <p>Acompanhamento prioritário e visão de densidade regional.</p>
              </div>
            </div>

            <div className="watchlist-section-grid">
              {/* WATCHLIST DE ÓRGÃOS */}
              <div className="watchlist-col">
                <div className="col-header">
                  <Building2 size={20} />
                  <h3>Órgãos em Monitoramento Prioritário</h3>
                </div>

                <div className="watchlist-items">
                  {watchlistOrgans.map(org => (
                    <div key={org.id} className="watchlist-item">
                      <div className="item-left">
                        <button
                          className={`btn-star ${org.isFavorite ? 'fav' : ''}`}
                          onClick={() => handleToggleFavoriteOrgan(org.id)}
                        >
                          <Star size={16} fill={org.isFavorite ? '#f59e0b' : 'none'} />
                        </button>
                        <div>
                          <strong>{org.organShort}</strong>
                          <div className="subtext">{org.organName}</div>
                          <p className="item-notes">{org.notes}</p>
                        </div>
                      </div>
                      <button
                        className="btn-sm-profile"
                        onClick={() => setSelectedOrganProfile(org.organShort)}
                      >
                        Ver Perfil
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* WATCHLIST DE SERVIÇOS & RESUMO REGIONAL */}
              <div className="watchlist-col">
                <div className="col-header">
                  <MapPin size={20} />
                  <h3>Prioridade Regional (Item 36 e 37)</h3>
                </div>

                <div className="regional-summary-box">
                  {earlyRadarService.getRegionalSummary().map((reg, idx) => (
                    <div key={idx} className="region-card">
                      <div className="reg-title">
                        <strong>{reg.regionName}</strong>
                        {reg.isStrategicPriority && <span className="badge-priority">Prioritária</span>}
                      </div>
                      <div className="reg-stats">
                        <span>{reg.pcasCount} PCAs</span>
                        <span>{reg.contractsCount} Contratos</span>
                        <span>{reg.clustersCount} Oportunidades Futuras</span>
                      </div>
                      <div className="reg-vol">
                        Potencial Mapeado: R$ {Number(reg.totalPotentialVolume).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="col-header mt-4">
                  <CheckSquare size={20} />
                  <h3>Serviços Monitorados (Core Business)</h3>
                </div>

                <div className="services-watchlist-items">
                  {watchlistServices.map(srv => (
                    <div key={srv.id} className="service-watch-item">
                      <div>
                        <strong>{srv.serviceName}</strong>
                        <div className="subtext">{srv.notes}</div>
                      </div>
                      <span className={`priority-tag p-${srv.priority.toLowerCase()}`}>{srv.priority}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL: EXPLICAÇÃO DO SCORE (Item 21) */}
      {selectedScoreExplanation && (
        <div className="modal-backdrop" onClick={() => setSelectedScoreExplanation(null)}>
          <div className="early-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Explicação do Future Opportunity Score</h2>
                <p>Rastreabilidade algorítmica e pesos calibrados para tomada de decisão.</p>
              </div>
              <button className="btn-close" onClick={() => setSelectedScoreExplanation(null)}>✕</button>
            </div>

            <div className="score-modal-body">
              <div className="score-callout" style={{ borderColor: selectedScoreExplanation.badgeColor }}>
                <div className="score-callout-number" style={{ color: selectedScoreExplanation.badgeColor }}>
                  {selectedScoreExplanation.score}
                </div>
                <div>
                  <h3 style={{ color: selectedScoreExplanation.badgeColor }}>{selectedScoreExplanation.tierLabel}</h3>
                  <p>Órgão: <strong>{selectedScoreExplanation.organ}</strong></p>
                  <p>Serviço: <strong>{selectedScoreExplanation.relatedService}</strong></p>
                </div>
              </div>

              <h4 className="factors-title">Decomposição dos Fatores Auditados (Item 19 e 21):</h4>
              <div className="factors-list">
                {selectedScoreExplanation.scoreResult.explanation.map((item, idx) => (
                  <div key={idx} className="factor-item">
                    <div className="factor-header">
                      <span className="factor-name">{item.factor}</span>
                      <span className="factor-points">+{item.points} pts</span>
                    </div>
                    <p className="factor-reason">{item.reason}</p>
                  </div>
                ))}
              </div>

              <div className="audit-footer">
                <span>Versão do Algoritmo: {selectedScoreExplanation.scoreResult.algorithmVersion}</span>
                <span>Auditado em: {new Date(selectedScoreExplanation.scoreResult.calculatedAt).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR AÇÃO COMERCIAL PREVENTIVA (Itens 27, 28, 29, 31) */}
      {actionModalCluster && (
        <div className="modal-backdrop" onClick={() => setActionModalCluster(null)}>
          <div className="early-modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Criar Ação Comercial Preventiva</h2>
                <p>Mobilização interna e preparação técnica antes da publicação do edital.</p>
              </div>
              <button className="btn-close" onClick={() => setActionModalCluster(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveCommercialAction} className="action-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Órgão Alvo:</label>
                  <input type="text" readOnly value={actionModalCluster.organShort || actionModalCluster.organ} />
                </div>
                <div className="form-group">
                  <label>Responsável Interno:</label>
                  <input
                    type="text"
                    value={newActionForm.responsible}
                    onChange={e => setNewActionForm({ ...newActionForm, responsible: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contato / Setor no Órgão:</label>
                  <input
                    type="text"
                    value={newActionForm.contact}
                    onChange={e => setNewActionForm({ ...newActionForm, contact: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Data Limite da Ação:</label>
                  <input
                    type="date"
                    value={newActionForm.date}
                    onChange={e => setNewActionForm({ ...newActionForm, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Objetivo da Prospecção Preventiva:</label>
                <input
                  type="text"
                  value={newActionForm.objective}
                  onChange={e => setNewActionForm({ ...newActionForm, objective: e.target.value })}
                  required
                />
              </div>

              {/* CHECKLIST DE PREPARAÇÃO (Item 31) */}
              <div className="checklist-box">
                <h4>Checklist de Inteligência Comercial Preventiva (Item 31):</h4>
                <div className="checkbox-grid">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={newActionForm.checklist.validarServico}
                      onChange={e => setNewActionForm({
                        ...newActionForm,
                        checklist: { ...newActionForm.checklist, validarServico: e.target.checked }
                      })}
                    />
                    <span>Validar enquadramento do serviço</span>
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={newActionForm.checklist.validarAtestado}
                      onChange={e => setNewActionForm({
                        ...newActionForm,
                        checklist: { ...newActionForm.checklist, validarAtestado: e.target.checked }
                      })}
                    />
                    <span>Validar atestados e acervo técnico</span>
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={newActionForm.checklist.atualizarDocumentacao}
                      onChange={e => setNewActionForm({
                        ...newActionForm,
                        checklist: { ...newActionForm.checklist, atualizarDocumentacao: e.target.checked }
                      })}
                    />
                    <span>Atualizar documentação e certidões</span>
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={newActionForm.checklist.verificarEquipe}
                      onChange={e => setNewActionForm({
                        ...newActionForm,
                        checklist: { ...newActionForm.checklist, verificarEquipe: e.target.checked }
                      })}
                    />
                    <span>Verificar disponibilidade da equipe técnica</span>
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={newActionForm.checklist.verificarEquipamentos}
                      onChange={e => setNewActionForm({
                        ...newActionForm,
                        checklist: { ...newActionForm.checklist, verificarEquipamentos: e.target.checked }
                      })}
                    />
                    <span>Verificar equipamentos e calibragem</span>
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={newActionForm.checklist.estudarPrecosHistoricos}
                      onChange={e => setNewActionForm({
                        ...newActionForm,
                        checklist: { ...newActionForm.checklist, estudarPrecosHistoricos: e.target.checked }
                      })}
                    />
                    <span>Estudar preços médios históricos do órgão</span>
                  </label>

                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={newActionForm.checklist.mapearConcorrentes}
                      onChange={e => setNewActionForm({
                        ...newActionForm,
                        checklist: { ...newActionForm.checklist, mapearConcorrentes: e.target.checked }
                      })}
                    />
                    <span>Mapear concorrente incumbente e players</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Próxima Ação Preventiva:</label>
                <input
                  type="text"
                  placeholder="Ex: Reunião com engenheiro técnico para alinhar CATs"
                  value={newActionForm.nextAction}
                  onChange={e => setNewActionForm({ ...newActionForm, nextAction: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setActionModalCluster(null)}>Cancelar</button>
                <button type="submit" className="btn-save-action">Registrar Ação Comercial Interna</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PERFIL COMPLETO DO CONTRATANTE (Item 17) */}
      {selectedOrganProfile && (
        <div className="modal-backdrop" onClick={() => setSelectedOrganProfile(null)}>
          <div className="early-modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Perfil do Órgão Contratante</h2>
                <p>Radiografia histórica de contratações, fornecedores e planejamentos ativos.</p>
              </div>
              <button className="btn-close" onClick={() => setSelectedOrganProfile(null)}>✕</button>
            </div>

            {(() => {
              const profile = earlyRadarService.getOrganProfile(selectedOrganProfile);
              const p = profile.pattern;
              return (
                <div className="organ-profile-body">
                  <div className="profile-top-banner">
                    <div>
                      <h3>{p ? p.organName : selectedOrganProfile}</h3>
                      <span className="profile-state">Estado: {p ? p.state : 'PE'}</span>
                    </div>
                    {p && (
                      <div className="profile-kpi-pill">
                        <span>Win Rate Interno Vellia:</span>
                        <strong className="text-emerald">{p.internalWinRate}%</strong>
                      </div>
                    )}
                  </div>

                  {p && (
                    <div className="profile-details-grid">
                      <div className="profile-card">
                        <h4>Sazonalidade e Padrão Temporal</h4>
                        <p>{p.seasonalAnalysis}</p>
                        <p className="mt-2 text-indigo"><strong>Recorrência:</strong> {p.recurrenceInsight}</p>
                      </div>

                      <div className="profile-card">
                        <h4>Histórico de Contratos Vigentes</h4>
                        {profile.activeExpiringContracts.length > 0 ? (
                          profile.activeExpiringContracts.map(c => (
                            <div key={c.id} className="mini-contract-item">
                              <strong>{c.relatedService}</strong>
                              <div>Incumbente: {c.currentSupplier}</div>
                              <span className="text-amber">Vence em {c.estimatedDaysRemaining} dias</span>
                            </div>
                          ))
                        ) : (
                          <p className="subtext">Nenhum contrato ativo monitorado com encerramento próximo.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="profile-pcas-list">
                    <h4>Planejamentos Identificados (PCA):</h4>
                    {profile.activePcas.length > 0 ? (
                      profile.activePcas.map(pca => (
                        <div key={pca.id} className="mini-pca-item">
                          <div>
                            <strong>{pca.plannedObject}</strong>
                            <div className="subtext">{pca.unit} • Previsão: {pca.predictedDate || '2026/2027'}</div>
                          </div>
                          <strong>R$ {Number(pca.estimatedValue).toLocaleString('pt-BR')}</strong>
                        </div>
                      ))
                    ) : (
                      <p className="subtext">Sem novos itens no Plano de Contratações Anual no momento.</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
