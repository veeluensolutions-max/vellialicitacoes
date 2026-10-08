import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  DollarSign, 
  Users, 
  Scale, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Plus, 
  FileText, 
  ExternalLink, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Search, 
  Building2, 
  Send, 
  BarChart3, 
  Award, 
  RefreshCw,
  Info,
  Clock,
  Layers,
  ArrowRight,
  Sliders,
  Check,
  ChevronDown
} from 'lucide-react';
import { 
  ResultsIntelligenceService, 
  TenderOutcome, 
  LossCategory, 
  DisqualificationStage, 
  IneligibilityReason, 
  DataCompleteness 
} from '../services/results/resultsIntelligenceService';
import './ResultsIntelligenceView.css';

export default function ResultsIntelligenceView({ onOpenOpportunityDetail }) {
  // Inicialização e dados
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, results, prices, competitors, segmentation, assistant
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modais
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCompetitorModalOpen, setIsCompetitorModalOpen] = useState(false);
  const [selectedResultDetail, setSelectedResultDetail] = useState(null);
  const [editingResult, setEditingResult] = useState(null);

  // Formulário de Registro de Resultado
  const [formState, setFormState] = useState({
    opportunityNumber: '',
    proposalId: '',
    participatingCompany: 'Excelência Ambiental',
    portal: 'Petronect',
    client: '',
    service: 'Operação de ETE e Efluentes Industriais',
    region: 'Nordeste (PE)',
    state: 'PE',
    outcomeDate: new Date().toLocaleDateString('pt-BR'),
    outcome: TenderOutcome.GANHA,
    ourPrice: '',
    winningPrice: '',
    winningCompany: '',
    ourPlacement: '1',
    totalParticipants: '3',
    lossCategory: LossCategory.PRECO,
    disqualificationStage: DisqualificationStage.PROPOSTA_COMERCIAL,
    ineligibilityReason: IneligibilityReason.DOCUMENTO_VENCIDO,
    observations: '',
    officialDocumentUrl: '',
    contractPeriod: '12 meses',
    expectedMargin: '24.5',
    startDate: '',
    commercialLead: 'Mariana Castro',
    technicalLead: 'Dr. Roberto Albuquerque',
    lessonsWorked: '',
    lessonsNotWorked: '',
    lessonsImprove: '',
    lessonsRepeat: ''
  });

  // Formulário de Concorrente
  const [competitorForm, setCompetitorForm] = useState({
    name: '',
    tradeName: '',
    cnpj: '',
    city: 'Recife',
    state: 'PE',
    website: '',
    areasOfActivity: 'Engenharia Ambiental, Tratamento de Efluentes',
    relatedServices: 'Operação de ETE, Monitoramento de Emissões',
    notes: 'Identificado em ata pública de pregão eletrônico.',
    avgPriceRange: 'R$ 300k – R$ 1.2M'
  });

  // Assistente de Performance
  const [assistantInput, setAssistantInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'assistant',
      text: '[FATO]: Olá! Sou o Assistente de Inteligência Comercial do Vellia Licitações.\n\n[ESTIMATIVA]: Analiso nosso histórico oficial de 18 participações, 5 vitórias homologadas e benchmarks de mercado sem inferir concorrentes fictícios.\n\n[RECOMENDAÇÃO]: Clique em uma das perguntas rápidas abaixo ou digite sua dúvida comercial.'
    }
  ]);

  // Recarregar dados quando altera filtro ou trigger
  const results = useMemo(() => {
    ResultsIntelligenceService.initSeedData();
    return ResultsIntelligenceService.filterResultsByPeriod(
      ResultsIntelligenceService.listResults(), 
      timeFilter
    );
  }, [timeFilter, refreshTrigger]);

  const competitors = useMemo(() => {
    return ResultsIntelligenceService.listCompetitors();
  }, [refreshTrigger]);

  const metrics = useMemo(() => {
    return ResultsIntelligenceService.getExecutiveMetrics(timeFilter);
  }, [timeFilter, refreshTrigger]);

  const funnel = useMemo(() => {
    return ResultsIntelligenceService.getCommercialFunnel(timeFilter);
  }, [timeFilter, refreshTrigger]);

  const lossBreakdown = useMemo(() => {
    return ResultsIntelligenceService.getLossReasonsAnalysis(timeFilter);
  }, [timeFilter, refreshTrigger]);

  const servicePerformance = useMemo(() => {
    return ResultsIntelligenceService.getServicePerformance();
  }, [refreshTrigger]);

  const clientPerformance = useMemo(() => {
    return ResultsIntelligenceService.getClientPerformance();
  }, [refreshTrigger]);

  const companyComparison = useMemo(() => {
    return ResultsIntelligenceService.getCompanyComparison();
  }, [refreshTrigger]);

  const headToHead = useMemo(() => {
    return ResultsIntelligenceService.getHeadToHeadRanking();
  }, [refreshTrigger]);

  const winLossProfiles = useMemo(() => {
    return ResultsIntelligenceService.getWinLossProfiles();
  }, [refreshTrigger]);

  const priceBenchmarks = useMemo(() => {
    return ResultsIntelligenceService.getInternalPriceBenchmarks();
  }, [refreshTrigger]);

  // Filtragem de tabela de resultados
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchSearch = searchQuery === '' || 
        r.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.opportunityNumber.includes(searchQuery) ||
        r.winningCompany.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchOutcome = outcomeFilter === 'ALL' || r.outcome === outcomeFilter;
      const matchService = serviceFilter === 'ALL' || r.service === serviceFilter;

      return matchSearch && matchOutcome && matchService;
    });
  }, [results, searchQuery, outcomeFilter, serviceFilter]);

  // Handlers de formulário
  const handleOpenNewResult = () => {
    setEditingResult(null);
    setFormState({
      opportunityNumber: '7004' + Math.floor(100000 + Math.random() * 900000),
      proposalId: 'PROP-7004-NOVA',
      participatingCompany: 'Excelência Ambiental',
      portal: 'Petronect',
      client: 'Petrobras - RNEST',
      service: 'Operação de ETE e Efluentes Industriais',
      region: 'Nordeste (PE)',
      state: 'PE',
      outcomeDate: new Date().toLocaleDateString('pt-BR'),
      outcome: TenderOutcome.GANHA,
      ourPrice: '450000',
      winningPrice: '450000',
      winningCompany: 'Excelência Ambiental',
      ourPlacement: '1',
      totalParticipants: '3',
      lossCategory: LossCategory.PRECO,
      disqualificationStage: DisqualificationStage.PROPOSTA_COMERCIAL,
      ineligibilityReason: IneligibilityReason.DOCUMENTO_VENCIDO,
      observations: '',
      officialDocumentUrl: 'Ata_Julgamento_Oficial.pdf',
      contractPeriod: '12 meses',
      expectedMargin: '24.5',
      startDate: '01/11/2026',
      commercialLead: 'Mariana Castro',
      technicalLead: 'Dr. Roberto Albuquerque',
      lessonsWorked: 'Atestados específicos e boa margem.',
      lessonsNotWorked: '',
      lessonsImprove: 'Fechar cotações mais rápido.',
      lessonsRepeat: 'Reunião prévia de alinhamento.'
    });
    setIsResultModalOpen(true);
  };

  const handleEditResult = (res) => {
    setEditingResult(res);
    setFormState({
      id: res.id,
      opportunityNumber: res.opportunityNumber,
      proposalId: res.proposalId || '',
      participatingCompany: res.participatingCompany,
      portal: res.portal,
      client: res.client,
      service: res.service,
      region: res.region,
      state: res.state,
      outcomeDate: res.outcomeDate,
      outcome: res.outcome,
      ourPrice: String(res.ourPrice || ''),
      winningPrice: String(res.winningPrice || ''),
      winningCompany: res.winningCompany,
      ourPlacement: String(res.ourPlacement || '1'),
      totalParticipants: String(res.totalParticipants || '3'),
      lossCategory: res.lossCategory || LossCategory.PRECO,
      disqualificationStage: res.disqualificationStage || DisqualificationStage.PROPOSTA_COMERCIAL,
      ineligibilityReason: res.ineligibilityReason || IneligibilityReason.DOCUMENTO_VENCIDO,
      observations: res.observations || '',
      officialDocumentUrl: res.officialDocumentUrl || '',
      contractPeriod: res.winDetails?.contractPeriod || '12 meses',
      expectedMargin: String(res.winDetails?.expectedMargin || '24.5'),
      startDate: res.winDetails?.startDate || '',
      commercialLead: res.winDetails?.commercialLead || 'Mariana Castro',
      technicalLead: res.winDetails?.technicalLead || 'Dr. Roberto Albuquerque',
      lessonsWorked: res.lessonsLearned?.worked || '',
      lessonsNotWorked: res.lessonsLearned?.didNotWork || '',
      lessonsImprove: res.lessonsLearned?.improve || '',
      lessonsRepeat: res.lessonsLearned?.repeat || ''
    });
    setIsResultModalOpen(true);
  };

  const handleSaveResult = (e) => {
    e.preventDefault();
    ResultsIntelligenceService.saveResult({
      ...formState,
      id: editingResult?.id
    }, 'Operador Comercial Vellia');

    setIsResultModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSaveCompetitor = (e) => {
    e.preventDefault();
    if (!competitorForm.name) return;

    ResultsIntelligenceService.saveCompetitor({
      name: competitorForm.name,
      tradeName: competitorForm.tradeName || competitorForm.name,
      cnpj: competitorForm.cnpj || 'Não informado',
      city: competitorForm.city,
      state: competitorForm.state,
      website: competitorForm.website,
      areasOfActivity: competitorForm.areasOfActivity.split(',').map(s => s.trim()),
      relatedServices: competitorForm.relatedServices.split(',').map(s => s.trim()),
      notes: competitorForm.notes,
      avgPriceRange: competitorForm.avgPriceRange
    }, 'Inteligência de Mercado');

    setIsCompetitorModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAskAssistant = (question) => {
    const q = question || assistantInput;
    if (!q) return;

    const userMsg = { sender: 'user', text: q };
    const ans = ResultsIntelligenceService.askPerformanceAssistant(q);
    const botMsg = { sender: 'assistant', text: ans.reply, sources: ans.sources };

    setChatHistory(prev => [...prev, userMsg, botMsg]);
    setAssistantInput('');
  };

  // Cores de badges por status
  const getOutcomeBadgeClass = (outcome) => {
    switch (outcome) {
      case TenderOutcome.GANHA: return 'badge-outcome-won';
      case TenderOutcome.PERDIDA: return 'badge-outcome-lost';
      case TenderOutcome.INABILITADA: return 'badge-outcome-ineligible';
      case TenderOutcome.DESCLASSIFICADA: return 'badge-outcome-disqualified';
      case TenderOutcome.CANCELADA:
      case TenderOutcome.REVOGADA: return 'badge-outcome-canceled';
      case TenderOutcome.EM_JULGAMENTO: return 'badge-outcome-judging';
      default: return 'badge-outcome-neutral';
    }
  };

  return (
    <div className="results-intelligence-view">
      {/* 1. TOPO EXECUTIVO COM NAVEGAÇÃO E FILTROS */}
      <header className="results-header">
        <div className="results-header-info">
          <div className="results-header-tag">
            <Trophy size={14} className="tag-icon" />
            <span>FASE 12 • MEMÓRIA COMERCIAL & INTELIGÊNCIA COMPETITIVA</span>
          </div>
          <h1 className="results-title">Resultados de Licitações & Vitória</h1>
          <p className="results-subtitle">
            Análise histórica de desfechos, benchmarks reais de preços, inteligência contra concorrentes e aprendizagem contínua.
          </p>
        </div>

        <div className="results-header-actions">
          {/* Filtro Temporal (Item 56) */}
          <div className="time-filter-group">
            {[
              { id: '30D', label: '30D' },
              { id: '90D', label: '90D' },
              { id: '6M', label: '6M' },
              { id: '12M', label: '12M' },
              { id: 'ALL', label: 'Todo o Histórico' }
            ].map(tf => (
              <button
                key={tf.id}
                className={`time-filter-btn ${timeFilter === tf.id ? 'active' : ''}`}
                onClick={() => setTimeFilter(tf.id)}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <button 
            className="btn-primary-action"
            onClick={handleOpenNewResult}
          >
            <Plus size={16} />
            <span>Registrar Resultado</span>
          </button>

          <button 
            className="btn-secondary-action"
            onClick={() => setIsCompetitorModalOpen(true)}
          >
            <Building2 size={16} />
            <span>Novo Concorrente</span>
          </button>
        </div>
      </header>

      {/* 2. CARDS EXECUTIVOS DE PERFORMANCE (Item 39 e 21) */}
      <section className="executive-metrics-grid">
        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Participações Válidas</span>
            <Users size={18} className="metric-icon cyan" />
          </div>
          <div className="metric-box-val">{metrics.validParticipations}</div>
          <div className="metric-box-sub">Disputas com desfecho apurado</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Vitórias Homologadas</span>
            <Trophy size={18} className="metric-icon emerald" />
          </div>
          <div className="metric-box-val highlight-emerald">{metrics.totalWins}</div>
          <div className="metric-box-sub">{metrics.totalLosses} derrotas e desclassificações</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Win Rate Oficial</span>
            <Percent size={18} className="metric-icon gold" />
          </div>
          <div className="metric-box-val highlight-gold">{metrics.winRatePercent}%</div>
          <div className="metric-box-sub">Vitórias / Participações válidas (Item 22)</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Taxa de Habilitação</span>
            <ShieldCheck size={18} className="metric-icon purple" />
          </div>
          <div className="metric-box-val">{metrics.qualificationRatePercent}%</div>
          <div className="metric-box-sub">Habilitadas / Propostas enviadas (Item 23)</div>
        </div>

        <div className="metric-box wide">
          <div className="metric-box-top">
            <span className="metric-box-label">Valor dos Contratos Ganhos</span>
            <DollarSign size={18} className="metric-icon emerald" />
          </div>
          <div className="metric-box-val">
            {ResultsIntelligenceService.formatCurrency(metrics.totalWonValue)}
          </div>
          <div className="metric-box-sub info-warning">
            <Info size={12} />
            <span>Item 38: Valor total contratado (não confundir receita com lucro)</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Ticket Médio Ganho</span>
            <TrendingUp size={18} className="metric-icon cyan" />
          </div>
          <div className="metric-box-val">
            {ResultsIntelligenceService.formatCurrency(metrics.avgWonTicket)}
          </div>
          <div className="metric-box-sub">Média por certame vencido</div>
        </div>

        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Margem Média Ganha</span>
            <TrendingUp size={18} className="metric-icon gold" />
          </div>
          <div className="metric-box-val highlight-gold">{metrics.avgWonMarginPercent}%</div>
          <div className="metric-box-sub">Margem bruta prevista em contratos</div>
        </div>
      </section>

      {/* 3. NAVEGAÇÃO DE SUB-ABAS DA FASE 12 */}
      <nav className="results-subtabs">
        <button 
          className={`subtab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('overview')}
        >
          <BarChart3 size={16} />
          <span>Visão Geral & Funil</span>
        </button>

        <button 
          className={`subtab-btn ${activeSubTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('results')}
        >
          <FileText size={16} />
          <span>Resultados das Licitações ({results.length})</span>
        </button>

        <button 
          className={`subtab-btn ${activeSubTab === 'prices' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('prices')}
        >
          <DollarSign size={16} />
          <span>Inteligência de Preços</span>
        </button>

        <button 
          className={`subtab-btn ${activeSubTab === 'competitors' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('competitors')}
        >
          <Users size={16} />
          <span>Concorrentes & Head-to-Head</span>
        </button>

        <button 
          className={`subtab-btn ${activeSubTab === 'segmentation' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('segmentation')}
        >
          <Layers size={16} />
          <span>Desempenho por Serviço & Cliente</span>
        </button>

        <button 
          className={`subtab-btn ${activeSubTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('assistant')}
        >
          <Sparkles size={16} />
          <span>Assistente de Performance</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* SUBTAB 1: VISÃO GERAL & FUNIL COMERCIAL                   */}
      {/* ========================================================= */}
      {activeSubTab === 'overview' && (
        <div className="overview-container">
          <div className="overview-grid-top">
            {/* FUNIL COMERCIAL (Item 19 e 20) */}
            <div className="card-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <TrendingDown size={18} className="panel-icon cyan" />
                  <h3 className="panel-title">Funil Comercial Completo</h3>
                </div>
                <span className="panel-badge">Conversão de Ponta a Ponta</span>
              </div>
              <p className="panel-description">
                Da identificação no portal até a homologação da vitória oficial (Itens 19, 20 e 21).
              </p>

              <div className="funnel-pipeline">
                {funnel.stages.map((stage, idx) => (
                  <div key={idx} className="funnel-step">
                    <div className="funnel-step-header">
                      <span className="step-name">{stage.stage}</span>
                      <span className="step-count">{stage.count}</span>
                    </div>
                    <div className="funnel-bar-bg">
                      <div 
                        className="funnel-bar-fill" 
                        style={{ 
                          width: `${Math.max(12, Math.min(100, (stage.count / 1200) * 100))}%`,
                          backgroundColor: idx === funnel.stages.length - 1 ? '#10B981' : idx === 0 ? '#00E5C9' : '#3B82F6'
                        }} 
                      />
                    </div>
                    <div className="funnel-step-footer">
                      <span className="step-rate">Taxa: {stage.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* POR QUE ESTAMOS PERDENDO? (Item 24) */}
            <div className="card-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <AlertTriangle size={18} className="panel-icon orange" />
                  <h3 className="panel-title">Por Que Estamos Perdendo?</h3>
                </div>
                <span className="panel-badge warning">Causas de Insucesso</span>
              </div>
              <p className="panel-description">
                Mapeamento das causas reais registradas em atas e recursos administrativos (Item 24).
              </p>

              <div className="loss-breakdown-list">
                {lossBreakdown.map((item, idx) => (
                  <div key={idx} className="loss-item">
                    <div className="loss-item-top">
                      <span className="loss-reason">{item.reason}</span>
                      <span className="loss-percent">{item.percent}% ({item.count} certames)</span>
                    </div>
                    <div className="loss-bar-bg">
                      <div 
                        className="loss-bar-fill" 
                        style={{ 
                          width: `${item.percent}%`,
                          backgroundColor: item.reason.includes('Preço') ? '#EF4444' : item.reason.includes('Documental') ? '#F59E0B' : '#EC4899'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="loss-insight-box">
                <Info size={14} className="cyan" />
                <span>
                  <strong>Insight do Motor:</strong> 61.5% das perdas decorrem de preço em disputa aberta, com gap médio de 9.8% abaixo da nossa proposta.
                </span>
              </div>
            </div>
          </div>

          {/* PERFIL DE VITÓRIA vs PERFIL DE PERDA (Itens 27 e 28) */}
          <div className="profiles-grid">
            <div className="profile-card win">
              <div className="profile-header">
                <Trophy size={18} className="profile-icon emerald" />
                <h4>Perfil de Vitória (Win Profile)</h4>
              </div>
              <p className="profile-sub">Padrões consistentes identificados nas 5 propostas vencedoras</p>

              <div className="profile-details">
                <div className="profile-row">
                  <span className="row-k">Serviços Favoráveis:</span>
                  <span className="row-v">{winLossProfiles.winProfile.services}</span>
                </div>
                <div className="profile-row">
                  <span className="row-k">Faixa de Ticket:</span>
                  <span className="row-v mono">{winLossProfiles.winProfile.ticketRange}</span>
                </div>
                <div className="profile-row">
                  <span className="row-k">Regiões Fortes:</span>
                  <span className="row-v">{winLossProfiles.winProfile.regions}</span>
                </div>
                <div className="profile-row">
                  <span className="row-k">Margem Média:</span>
                  <span className="row-v highlight-emerald">{winLossProfiles.winProfile.averageMargin}</span>
                </div>
                <div className="profile-row">
                  <span className="row-k">Diferencial Decisivo:</span>
                  <span className="row-v">{winLossProfiles.winProfile.keyDifferentiator}</span>
                </div>
              </div>
            </div>

            <div className="profile-card loss">
              <div className="profile-header">
                <XCircle size={18} className="profile-icon red" />
                <h4>Perfil de Perda (Loss Profile)</h4>
              </div>
              <p className="profile-sub">Características recorrentes identificadas em propostas perdidas</p>

              <div className="profile-details">
                <div className="profile-row">
                  <span className="row-k">Causa Predominante:</span>
                  <span className="row-v">{winLossProfiles.lossProfile.mainCause}</span>
                </div>
                <div className="profile-row">
                  <span className="row-k">Serviços Vulneráveis:</span>
                  <span className="row-v">{winLossProfiles.lossProfile.vulnerableServices}</span>
                </div>
                <div className="profile-row">
                  <span className="row-k">Risco Crítico:</span>
                  <span className="row-v">{winLossProfiles.lossProfile.criticalRisk}</span>
                </div>
                <div className="profile-row">
                  <span className="row-k">Sinal de Alerta:</span>
                  <span className="row-v">{winLossProfiles.lossProfile.warningSign}</span>
                </div>
              </div>
            </div>
          </div>

          {/* COMPARAÇÃO POR EMPRESA DO GRUPO (Item 41) */}
          <div className="card-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <Building2 size={18} className="panel-icon cyan" />
                <h3 className="panel-title">Desempenho por Empresa do Grupo (Item 41)</h3>
              </div>
              <span className="panel-badge">Excelência Ambiental vs Veeluen Solutions</span>
            </div>

            <div className="company-comparison-grid">
              <div className="company-stat-box">
                <div className="company-box-header">
                  <h4>Excelência Ambiental</h4>
                  <span className="company-role-tag">Foco: Engenharia & Operação ETE/Ar</span>
                </div>
                <div className="company-kpis">
                  <div className="kpi-mini">
                    <span className="kpi-lbl">Participações</span>
                    <span className="kpi-num">{companyComparison.excelencia.total}</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="kpi-lbl">Vitórias</span>
                    <span className="kpi-num highlight-emerald">{companyComparison.excelencia.wins}</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="kpi-lbl">Win Rate</span>
                    <span className="kpi-num highlight-gold">{companyComparison.excelencia.winRate}%</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="kpi-lbl">Total Ganho</span>
                    <span className="kpi-num mono">{ResultsIntelligenceService.formatCurrency(companyComparison.excelencia.totalWon)}</span>
                  </div>
                </div>
              </div>

              <div className="company-stat-box">
                <div className="company-box-header">
                  <h4>Veeluen Solutions</h4>
                  <span className="company-role-tag">Foco: Eficiência Energética & Inspeção</span>
                </div>
                <div className="company-kpis">
                  <div className="kpi-mini">
                    <span className="kpi-lbl">Participações</span>
                    <span className="kpi-num">{companyComparison.veeluen.total}</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="kpi-lbl">Vitórias</span>
                    <span className="kpi-num highlight-emerald">{companyComparison.veeluen.wins}</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="kpi-lbl">Win Rate</span>
                    <span className="kpi-num highlight-gold">{companyComparison.veeluen.winRate}%</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="kpi-lbl">Total Ganho</span>
                    <span className="kpi-num mono">{ResultsIntelligenceService.formatCurrency(companyComparison.veeluen.totalWon)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: TABELA DE RESULTADOS DAS LICITAÇÕES             */}
      {/* ========================================================= */}
      {activeSubTab === 'results' && (
        <div className="results-table-container">
          {/* Barra de Filtros da Tabela */}
          <div className="table-filters-bar">
            <div className="search-box-wrapper">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar por cliente, edital, serviço ou concorrente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="table-search-input"
              />
            </div>

            <div className="select-filters-row">
              <div className="filter-select-wrapper">
                <label>Status:</label>
                <select 
                  value={outcomeFilter} 
                  onChange={(e) => setOutcomeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">Todos os Status</option>
                  {Object.values(TenderOutcome).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="filter-select-wrapper">
                <label>Serviço:</label>
                <select 
                  value={serviceFilter} 
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">Todos os Serviços</option>
                  {Array.from(new Set(results.map(r => r.service))).map(srv => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Resultados */}
          <div className="results-table-card">
            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>Oportunidade & Data</th>
                  <th>Empresa & Cliente</th>
                  <th>Serviço & Local</th>
                  <th>Resultado</th>
                  <th>Nosso Preço</th>
                  <th>Preço Vencedor</th>
                  <th>Gap de Preço</th>
                  <th>Empresa Vencedora</th>
                  <th>Qualidade</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="table-empty-row">
                      Nenhum resultado registrado encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map(res => (
                    <tr key={res.id}>
                      <td>
                        <div className="td-opp-num mono">#{res.opportunityNumber}</div>
                        <div className="td-date">{res.outcomeDate}</div>
                      </td>
                      <td>
                        <div className="td-company">{res.participatingCompany}</div>
                        <div className="td-client">{res.client}</div>
                      </td>
                      <td>
                        <div className="td-service">{res.service}</div>
                        <div className="td-region">{res.region}</div>
                      </td>
                      <td>
                        <span className={`outcome-badge ${getOutcomeBadgeClass(res.outcome)}`}>
                          {res.outcome}
                        </span>
                        {res.lossCategory && (
                          <div className="td-sub-reason">Motivo: {res.lossCategory}</div>
                        )}
                        {res.ineligibilityReason && (
                          <div className="td-sub-reason">Inabil: {res.ineligibilityReason}</div>
                        )}
                      </td>
                      <td className="mono td-price">
                        {res.ourPrice ? ResultsIntelligenceService.formatCurrency(res.ourPrice) : '—'}
                      </td>
                      <td className="mono td-price">
                        {res.winningPrice ? ResultsIntelligenceService.formatCurrency(res.winningPrice) : 'Não informado'}
                      </td>
                      <td>
                        {res.outcome === TenderOutcome.GANHA ? (
                          <span className="gap-won-pill">
                            Vencemos (Margem: {res.winDetails?.expectedMargin || 24}%)
                          </span>
                        ) : res.priceGapPercent !== null ? (
                          <span className={`gap-pill ${res.priceGapPercent > 0 ? 'gap-above' : 'gap-below'}`}>
                            {res.priceGapPercent > 0 ? `+${res.priceGapPercent}%` : `${res.priceGapPercent}%`}
                          </span>
                        ) : (
                          <span className="gap-none-pill">Não identificado</span>
                        )}
                      </td>
                      <td>
                        <div className="td-winner-name">{res.winningCompany}</div>
                        <div className="td-placement">Nossa colocação: {res.ourPlacement}º de {res.totalParticipants}</div>
                      </td>
                      <td>
                        <span className={`completeness-badge completeness-${res.completeness?.toLowerCase() || 'incompleto'}`}>
                          {res.completeness || 'PARCIAL'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-cell">
                          <button 
                            className="btn-tbl-action"
                            title="Ver Detalhes e Post-Mortem"
                            onClick={() => setSelectedResultDetail(res)}
                          >
                            <FileText size={15} />
                          </button>
                          <button 
                            className="btn-tbl-action"
                            title="Editar Resultado"
                            onClick={() => handleEditResult(res)}
                          >
                            <Sliders size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: INTELIGÊNCIA DE PREÇOS & BENCHMARKS             */}
      {/* ========================================================= */}
      {activeSubTab === 'prices' && (
        <div className="prices-tab-container">
          <div className="card-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <DollarSign size={18} className="panel-icon gold" />
                <h3 className="panel-title">Benchmark Interno de Preços por Serviço (Item 35)</h3>
              </div>
              <span className="panel-badge">Estatísticas Descritivas Reais</span>
            </div>
            <p className="panel-description">
              Mínimo, médio, mediana e preço vencedor médio por família de serviço executada.
            </p>

            <div className="benchmarks-table-wrapper">
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>Serviço Cadastrado</th>
                    <th>Amostras</th>
                    <th>Mínimo Histórico</th>
                    <th>Preço Médio Ofertado</th>
                    <th>Mediana dos Lances</th>
                    <th>Preço Máximo</th>
                    <th>Preço Vencedor Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {priceBenchmarks.map((bm, idx) => (
                    <tr key={idx}>
                      <td className="highlight-text">{bm.service}</td>
                      <td className="mono">{bm.samplesCount} participações</td>
                      <td className="mono">{ResultsIntelligenceService.formatCurrency(bm.minPrice)}</td>
                      <td className="mono">{ResultsIntelligenceService.formatCurrency(bm.avgPrice)}</td>
                      <td className="mono highlight-gold">{ResultsIntelligenceService.formatCurrency(bm.medianPrice)}</td>
                      <td className="mono">{ResultsIntelligenceService.formatCurrency(bm.maxPrice)}</td>
                      <td className="mono highlight-emerald">{ResultsIntelligenceService.formatCurrency(bm.avgWinningPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="prices-insight-card">
            <div className="insight-card-icon">
              <Sparkles size={24} className="cyan" />
            </div>
            <div className="insight-card-content">
              <h4>Regra de Ouro da Inteligência de Preços Vellia</h4>
              <p>
                Quando nossa proposta para contratos de <strong>Emissões Atmosféricas</strong> e <strong>Operação de ETE</strong> se posiciona entre o <em>Preço Mínimo</em> e a <em>Mediana</em> com margem bruta superior a <strong>22%</strong>, nosso Win Rate histórico sobe para <strong>40%</strong>. Acima da mediana, 87% das perdas acontecem por gap de preço direto para concorrentes regionais.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 4: BASE DE CONCORRENTES & HEAD-TO-HEAD             */}
      {/* ========================================================= */}
      {activeSubTab === 'competitors' && (
        <div className="competitors-tab-container">
          <div className="card-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <Users size={18} className="panel-icon cyan" />
                <h3 className="panel-title">Head-to-Head: Confronto Direto com Concorrentes (Itens 45 e 46)</h3>
              </div>
              <span className="panel-badge warning">Dados Oficiais de Atas • Sem Inferências</span>
            </div>
            <p className="panel-description">
              Concorrentes registrados exclusivamente a partir de atas públicas ou documentos oficiais (Item 12).
            </p>

            <div className="h2h-cards-grid">
              {headToHead.map(comp => (
                <div key={comp.id} className="h2h-card">
                  <div className="h2h-card-top">
                    <div className="h2h-comp-info">
                      <h4>{comp.tradeName}</h4>
                      <span className="h2h-legal-name">{comp.name}</span>
                    </div>
                    <span className="h2h-confrontations-badge">
                      {comp.totalConfrontations} confrontos
                    </span>
                  </div>

                  {/* Placar Direto */}
                  <div className="h2h-scoreboard">
                    <div className="score-side our">
                      <span className="score-side-label">Nossas Vitórias</span>
                      <span className="score-side-val">{comp.ourWins}</span>
                    </div>
                    <div className="score-divider">x</div>
                    <div className="score-side their">
                      <span className="score-side-label">Vitórias Deles</span>
                      <span className="score-side-val">{comp.theirWins}</span>
                    </div>
                  </div>

                  <div className="h2h-card-details">
                    <div className="h2h-detail-row">
                      <span>Preço Médio Deles:</span>
                      <span className="mono">
                        {comp.avgTheirPrice ? ResultsIntelligenceService.formatCurrency(comp.avgTheirPrice) : 'Não divulgado'}
                      </span>
                    </div>
                    <div className="h2h-detail-row">
                      <span>Última Aparição:</span>
                      <span>{comp.lastAppearance}</span>
                    </div>
                    <div className="h2h-services-tags">
                      {comp.frequentServices?.map((s, si) => (
                        <span key={si} className="srv-mini-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista Completa da Base Oficial */}
          <div className="card-panel">
            <div className="panel-header">
              <h3 className="panel-title">Base de Concorrentes Cadastrados ({competitors.length})</h3>
              <button 
                className="btn-secondary-action"
                onClick={() => setIsCompetitorModalOpen(true)}
              >
                <Plus size={14} />
                <span>Novo Concorrente</span>
              </button>
            </div>

            <table className="custom-data-table">
              <thead>
                <tr>
                  <th>Razão Social / Nome Fantasia</th>
                  <th>CNPJ</th>
                  <th>Cidade/UF</th>
                  <th>Áreas de Atuação</th>
                  <th>Status de Mercado</th>
                  <th>Última Aparição</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="highlight-text">{c.tradeName}</div>
                      <div className="td-legal-name">{c.name}</div>
                    </td>
                    <td className="mono">{c.cnpj}</td>
                    <td>{c.city} - {c.state}</td>
                    <td>{c.areasOfActivity?.join(', ') || 'Engenharia'}</td>
                    <td>
                      <span className="badge-competitor-active">{c.status}</span>
                    </td>
                    <td>{c.lastAppearance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 5: DESEMPENHO POR SERVIÇO & CLIENTE                */}
      {/* ========================================================= */}
      {activeSubTab === 'segmentation' && (
        <div className="segmentation-container">
          <div className="segmentation-grid">
            {/* Por Serviço (Item 16) */}
            <div className="card-panel">
              <div className="panel-header">
                <h3 className="panel-title">Desempenho por Família de Serviço (Item 16)</h3>
              </div>
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>Serviço</th>
                    <th>Disputas</th>
                    <th>Vitórias</th>
                    <th>Win Rate</th>
                    <th>Total Ganho</th>
                    <th>Margem Média</th>
                  </tr>
                </thead>
                <tbody>
                  {servicePerformance.map((sp, idx) => (
                    <tr key={idx}>
                      <td className="highlight-text">{sp.service}</td>
                      <td>{sp.participations}</td>
                      <td className="highlight-emerald">{sp.wins}</td>
                      <td className="highlight-gold">{sp.winRate}%</td>
                      <td className="mono">{ResultsIntelligenceService.formatCurrency(sp.totalWon)}</td>
                      <td>{sp.avgMargin}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Por Cliente (Item 17) */}
            <div className="card-panel">
              <div className="panel-header">
                <h3 className="panel-title">Desempenho por Contratante (Item 17)</h3>
              </div>
              <table className="custom-data-table">
                <thead>
                  <tr>
                    <th>Contratante</th>
                    <th>Disputas</th>
                    <th>Vitórias</th>
                    <th>Win Rate</th>
                    <th>Total Ofertado</th>
                    <th>Total Ganho</th>
                  </tr>
                </thead>
                <tbody>
                  {clientPerformance.map((cp, idx) => (
                    <tr key={idx}>
                      <td className="highlight-text">{cp.client}</td>
                      <td>{cp.participations}</td>
                      <td className="highlight-emerald">{cp.wins}</td>
                      <td className="highlight-gold">{cp.winRate}%</td>
                      <td className="mono">{ResultsIntelligenceService.formatCurrency(cp.totalOffered)}</td>
                      <td className="mono highlight-emerald">{ResultsIntelligenceService.formatCurrency(cp.totalWon)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 6: ASSISTENTE DE PERFORMANCE                       */}
      {/* ========================================================= */}
      {activeSubTab === 'assistant' && (
        <div className="assistant-tab-container">
          <div className="card-panel assistant-chat-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <Sparkles size={18} className="panel-icon cyan" />
                <h3 className="panel-title">Assistente de Inteligência Comercial (Itens 59 e 60)</h3>
              </div>
              <span className="panel-badge">Rigor Técnico: Fatos • Correlações • Recomendações</span>
            </div>

            {/* Sugestões Rápidas de Perguntas Obrigatórias */}
            <div className="quick-questions-tray">
              <span className="tray-label">Perguntas Rápidas:</span>
              {[
                'Por que estamos perdendo?',
                'Qual serviço possui maior Win Rate?',
                'Qual concorrente aparece mais?',
                'Qual nossa faixa de preço mais competitiva?',
                'Em quais clientes temos melhor desempenho?',
                'Quais oportunidades deveríamos priorizar com base no histórico?'
              ].map((q, idx) => (
                <button 
                  key={idx} 
                  className="btn-quick-q"
                  onClick={() => handleAskAssistant(q)}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Histórico do Chat */}
            <div className="assistant-messages-container">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender}`}>
                  <div className="bubble-header">
                    <span className="bubble-sender-name">
                      {msg.sender === 'assistant' ? 'Assistente Vellia' : 'Você'}
                    </span>
                  </div>
                  <div className="bubble-body">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>
                        {paragraph.startsWith('[FATO]') ? (
                          <span className="badge-tag-fact">[FATO]</span>
                        ) : paragraph.startsWith('[CORRELAÇÃO]') ? (
                          <span className="badge-tag-corr">[CORRELAÇÃO]</span>
                        ) : paragraph.startsWith('[ESTIMATIVA]') ? (
                          <span className="badge-tag-est">[ESTIMATIVA]</span>
                        ) : paragraph.startsWith('[RECOMENDAÇÃO]') ? (
                          <span className="badge-tag-rec">[RECOMENDAÇÃO]</span>
                        ) : null}
                        {' '}
                        {paragraph.replace(/^\[(FATO|CORRELAÇÃO|ESTIMATIVA|RECOMENDAÇÃO)\]:?\s*/, '')}
                      </p>
                    ))}
                  </div>
                  {msg.sources && (
                    <div className="bubble-sources">
                      <span>Fontes: {msg.sources.join(' • ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input do Chat */}
            <div className="assistant-input-box">
              <input 
                type="text" 
                placeholder="Pergunte sobre preços, concorrentes ou vitórias..."
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant()}
                className="chat-text-input"
              />
              <button 
                className="btn-send-chat"
                onClick={() => handleAskAssistant()}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: REGISTRAR OU EDITAR RESULTADO                    */}
      {/* ========================================================= */}
      {isResultModalOpen && (
        <div className="modal-overlay" onClick={() => setIsResultModalOpen(false)}>
          <div className="modal-box large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <Trophy size={18} className="cyan" />
                <h3>{editingResult ? 'Editar Resultado de Licitação' : 'Registrar Novo Resultado'}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsResultModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveResult} className="modal-form-content">
              <div className="form-grid-row">
                <div className="form-field">
                  <label>Número do Edital / Oportunidade *</label>
                  <input 
                    type="text" 
                    value={formState.opportunityNumber}
                    onChange={(e) => setFormState({ ...formState, opportunityNumber: e.target.value })}
                    required
                    placeholder="Ex: 7004128831"
                  />
                </div>

                <div className="form-field">
                  <label>Empresa Participante *</label>
                  <select 
                    value={formState.participatingCompany}
                    onChange={(e) => setFormState({ ...formState, participatingCompany: e.target.value })}
                  >
                    <option value="Excelência Ambiental">Excelência Ambiental</option>
                    <option value="Veeluen Solutions">Veeluen Solutions</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Cliente / Contratante *</label>
                  <input 
                    type="text" 
                    value={formState.client}
                    onChange={(e) => setFormState({ ...formState, client: e.target.value })}
                    required
                    placeholder="Ex: Petrobras - RNEST"
                  />
                </div>
              </div>

              <div className="form-grid-row">
                <div className="form-field">
                  <label>Serviço Principal *</label>
                  <input 
                    type="text" 
                    value={formState.service}
                    onChange={(e) => setFormState({ ...formState, service: e.target.value })}
                    required
                    placeholder="Ex: Operação de ETE e Efluentes Industriais"
                  />
                </div>

                <div className="form-field">
                  <label>Data do Resultado</label>
                  <input 
                    type="text" 
                    value={formState.outcomeDate}
                    onChange={(e) => setFormState({ ...formState, outcomeDate: e.target.value })}
                    placeholder="DD/MM/AAAA"
                  />
                </div>

                <div className="form-field">
                  <label>Status do Resultado (Item 2) *</label>
                  <select 
                    value={formState.outcome}
                    onChange={(e) => setFormState({ ...formState, outcome: e.target.value })}
                    className="select-outcome-highlight"
                  >
                    {Object.values(TenderOutcome).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-row">
                <div className="form-field">
                  <label>Nosso Preço Ofertado (R$)</label>
                  <input 
                    type="number" 
                    value={formState.ourPrice}
                    onChange={(e) => setFormState({ ...formState, ourPrice: e.target.value })}
                    placeholder="Ex: 480000"
                  />
                </div>

                <div className="form-field">
                  <label>Preço Vencedor (R$) (Item 15: Opcional se desconhecido)</label>
                  <input 
                    type="number" 
                    value={formState.winningPrice}
                    onChange={(e) => setFormState({ ...formState, winningPrice: e.target.value })}
                    placeholder="Deixe em branco se não divulgado"
                  />
                </div>

                <div className="form-field">
                  <label>Empresa Vencedora</label>
                  <input 
                    type="text" 
                    value={formState.winningCompany}
                    onChange={(e) => setFormState({ ...formState, winningCompany: e.target.value })}
                    placeholder="Razão social da vencedora"
                  />
                </div>
              </div>

              <div className="form-grid-row">
                <div className="form-field">
                  <label>Nossa Colocação</label>
                  <input 
                    type="number" 
                    value={formState.ourPlacement}
                    onChange={(e) => setFormState({ ...formState, ourPlacement: e.target.value })}
                    placeholder="Ex: 2"
                  />
                </div>

                <div className="form-field">
                  <label>Total de Participantes</label>
                  <input 
                    type="number" 
                    value={formState.totalParticipants}
                    onChange={(e) => setFormState({ ...formState, totalParticipants: e.target.value })}
                    placeholder="Ex: 5"
                  />
                </div>
              </div>

              {/* CAMPOS CONDICIONAIS DE ACORDO COM O STATUS */}
              {formState.outcome === TenderOutcome.GANHA && (
                <div className="conditional-fields-box win-box">
                  <div className="cond-title">
                    <Trophy size={16} className="emerald" />
                    <span>Detalhes da Vitória (Item 4)</span>
                  </div>
                  <div className="form-grid-row">
                    <div className="form-field">
                      <label>Prazo Contratual</label>
                      <input 
                        type="text" 
                        value={formState.contractPeriod}
                        onChange={(e) => setFormState({ ...formState, contractPeriod: e.target.value })}
                        placeholder="Ex: 12 meses"
                      />
                    </div>
                    <div className="form-field">
                      <label>Margem Prevista (%)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formState.expectedMargin}
                        onChange={(e) => setFormState({ ...formState, expectedMargin: e.target.value })}
                        placeholder="Ex: 24.5"
                      />
                    </div>
                    <div className="form-field">
                      <label>Responsável Comercial</label>
                      <input 
                        type="text" 
                        value={formState.commercialLead}
                        onChange={(e) => setFormState({ ...formState, commercialLead: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formState.outcome === TenderOutcome.PERDIDA && (
                <div className="conditional-fields-box loss-box">
                  <div className="cond-title">
                    <AlertTriangle size={16} className="orange" />
                    <span>Motivo Específico da Perda (Item 5)</span>
                  </div>
                  <div className="form-field">
                    <label>Selecione a Causa Principal da Derrota:</label>
                    <select 
                      value={formState.lossCategory}
                      onChange={(e) => setFormState({ ...formState, lossCategory: e.target.value })}
                    >
                      {Object.values(LossCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formState.outcome === TenderOutcome.DESCLASSIFICADA && (
                <div className="conditional-fields-box disq-box">
                  <div className="cond-title">
                    <XCircle size={16} className="red" />
                    <span>Etapa da Desclassificação (Item 6)</span>
                  </div>
                  <div className="form-field">
                    <label>Etapa do Edital:</label>
                    <select 
                      value={formState.disqualificationStage}
                      onChange={(e) => setFormState({ ...formState, disqualificationStage: e.target.value })}
                    >
                      {Object.values(DisqualificationStage).map(stg => (
                        <option key={stg} value={stg}>{stg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {formState.outcome === TenderOutcome.INABILITADA && (
                <div className="conditional-fields-box inelig-box">
                  <div className="cond-title">
                    <AlertTriangle size={16} className="gold" />
                    <span>Motivo da Inabilitação (Item 7)</span>
                  </div>
                  <div className="form-field">
                    <label>Causa da Inabilitação Documental:</label>
                    <select 
                      value={formState.ineligibilityReason}
                      onChange={(e) => setFormState({ ...formState, ineligibilityReason: e.target.value })}
                    >
                      {Object.values(IneligibilityReason).map(rs => (
                        <option key={rs} value={rs}>{rs}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* LIÇÕES APRENDIDAS (Item 49) */}
              <div className="form-field full-width">
                <label>Lições Aprendidas: O que funcionou e o que melhorar? (Item 49)</label>
                <div className="lessons-grid-inputs">
                  <input 
                    type="text" 
                    placeholder="O que funcionou (ex: Proposta técnica robusta)"
                    value={formState.lessonsWorked}
                    onChange={(e) => setFormState({ ...formState, lessonsWorked: e.target.value })}
                  />
                  <input 
                    type="text" 
                    placeholder="O que melhorar (ex: Orçamento de terceirizados mais ágil)"
                    value={formState.lessonsImprove}
                    onChange={(e) => setFormState({ ...formState, lessonsImprove: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Observações Adicionais</label>
                <textarea 
                  rows="2"
                  value={formState.observations}
                  onChange={(e) => setFormState({ ...formState, observations: e.target.value })}
                  placeholder="Detalhes relevantes sobre o certame, ata de julgamento ou recurso..."
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-cancel" onClick={() => setIsResultModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Salvar Resultado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CADASTRAR NOVO CONCORRENTE OFICIAL               */}
      {/* ========================================================= */}
      {isCompetitorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCompetitorModalOpen(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <Building2 size={18} className="cyan" />
                <h3>Cadastrar Concorrente Oficial (Item 8 e 12)</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsCompetitorModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveCompetitor} className="modal-form-content">
              <div className="official-data-notice">
                <Info size={14} className="cyan" />
                <span>
                  <strong>Item 12:</strong> Não inventar participantes. Cadastre apenas empresas que constem em atas públicas ou editais reais.
                </span>
              </div>

              <div className="form-field full-width">
                <label>Razão Social Completa *</label>
                <input 
                  type="text" 
                  value={competitorForm.name}
                  onChange={(e) => setCompetitorForm({ ...competitorForm, name: e.target.value })}
                  required
                  placeholder="Ex: HidroEco Engenharia e Meio Ambiente Ltda"
                />
              </div>

              <div className="form-grid-row">
                <div className="form-field">
                  <label>Nome Fantasia</label>
                  <input 
                    type="text" 
                    value={competitorForm.tradeName}
                    onChange={(e) => setCompetitorForm({ ...competitorForm, tradeName: e.target.value })}
                    placeholder="Ex: HidroEco"
                  />
                </div>

                <div className="form-field">
                  <label>CNPJ</label>
                  <input 
                    type="text" 
                    value={competitorForm.cnpj}
                    onChange={(e) => setCompetitorForm({ ...competitorForm, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>

              <div className="form-grid-row">
                <div className="form-field">
                  <label>Cidade / UF</label>
                  <input 
                    type="text" 
                    value={competitorForm.city}
                    onChange={(e) => setCompetitorForm({ ...competitorForm, city: e.target.value })}
                    placeholder="Cidade"
                  />
                </div>

                <div className="form-field">
                  <label>Faixa Típica de Preço</label>
                  <input 
                    type="text" 
                    value={competitorForm.avgPriceRange}
                    onChange={(e) => setCompetitorForm({ ...competitorForm, avgPriceRange: e.target.value })}
                    placeholder="Ex: R$ 300k – R$ 1.2M"
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Serviços Relacionados (separados por vírgula)</label>
                <input 
                  type="text" 
                  value={competitorForm.relatedServices}
                  onChange={(e) => setCompetitorForm({ ...competitorForm, relatedServices: e.target.value })}
                  placeholder="Operação de ETE, Ensaios de Laboratório, etc."
                />
              </div>

              <div className="modal-actions-row">
                <button type="button" className="btn-cancel" onClick={() => setIsCompetitorModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Cadastrar Concorrente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DETALHES COMPLETOS & POST-MORTEM (Item 50)       */}
      {/* ========================================================= */}
      {selectedResultDetail && (
        <div className="modal-overlay" onClick={() => setSelectedResultDetail(null)}>
          <div className="modal-box large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <FileText size={18} className="cyan" />
                <h3>Análise Pós-Licitação & Post-Mortem (Item 50)</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedResultDetail(null)}>✕</button>
            </div>

            <div className="post-mortem-body">
              <div className="pm-top-banner">
                <div className="pm-tag-row">
                  <span className={`outcome-badge ${getOutcomeBadgeClass(selectedResultDetail.outcome)}`}>
                    {selectedResultDetail.outcome}
                  </span>
                  <span className="pm-opp mono">Edital #{selectedResultDetail.opportunityNumber}</span>
                  <span className="pm-client">{selectedResultDetail.client}</span>
                </div>
                <h3>{selectedResultDetail.service}</h3>
                <p className="pm-date">Resultado registrado em: {selectedResultDetail.outcomeDate}</p>
              </div>

              <div className="pm-grid-metrics">
                <div className="pm-metric-box">
                  <span className="pm-lbl">Nosso Preço</span>
                  <span className="pm-val mono">
                    {selectedResultDetail.ourPrice ? ResultsIntelligenceService.formatCurrency(selectedResultDetail.ourPrice) : '—'}
                  </span>
                </div>
                <div className="pm-metric-box">
                  <span className="pm-lbl">Preço Vencedor</span>
                  <span className="pm-val mono highlight-emerald">
                    {selectedResultDetail.winningPrice ? ResultsIntelligenceService.formatCurrency(selectedResultDetail.winningPrice) : 'Não informado'}
                  </span>
                </div>
                <div className="pm-metric-box">
                  <span className="pm-lbl">Gap de Preço</span>
                  <span className="pm-val mono highlight-gold">
                    {selectedResultDetail.priceGapPercent !== null ? `${selectedResultDetail.priceGapPercent}%` : '—'}
                  </span>
                </div>
                <div className="pm-metric-box">
                  <span className="pm-lbl">Vencedor Homologado</span>
                  <span className="pm-val">{selectedResultDetail.winningCompany}</span>
                </div>
              </div>

              {/* Lições da Participação (Item 49) */}
              <div className="pm-lessons-section">
                <h4>Lições da Participação</h4>
                <div className="pm-lessons-grid">
                  <div className="pm-lesson-card worked">
                    <span className="lesson-badge-worked">O Que Funcionou:</span>
                    <p>{selectedResultDetail.lessonsLearned?.worked || 'Proposta bem estruturada.'}</p>
                  </div>
                  <div className="pm-lesson-card didnot">
                    <span className="lesson-badge-didnot">O Que Não Funcionou:</span>
                    <p>{selectedResultDetail.lessonsLearned?.didNotWork || 'Nenhuma falha crítica interna.'}</p>
                  </div>
                  <div className="pm-lesson-card improve">
                    <span className="lesson-badge-improve">O Que Melhorar:</span>
                    <p>{selectedResultDetail.lessonsLearned?.improve || 'Antecipar cotações de fornecedores.'}</p>
                  </div>
                  <div className="pm-lesson-card repeat">
                    <span className="lesson-badge-repeat">O Que Repetir:</span>
                    <p>{selectedResultDetail.lessonsLearned?.repeat || 'Alinhamento precoce entre equipes.'}</p>
                  </div>
                </div>
              </div>

              {/* Ações Futuras */}
              <div className="pm-actions-future">
                <h4>Observações Oficiais & Ações Futuras</h4>
                <p>{selectedResultDetail.observations || 'Nenhuma observação cadastrada em ata.'}</p>
              </div>

              {selectedResultDetail.outcome === TenderOutcome.GANHA && (
                <div className="convert-contract-banner">
                  <div className="convert-left">
                    <CheckCircle2 size={20} className="emerald" />
                    <div>
                      <strong>Licitação Homologada com Vitória!</strong>
                      <p>Opção futura disponível: Converter em Contrato e alocar equipe de campo (Item 4).</p>
                    </div>
                  </div>
                  <button className="btn-convert-contract" disabled title="Funcionalidade reservada para a Fase de Gestão de Contratos">
                    Converter em Contrato (Fase Futura)
                  </button>
                </div>
              )}
            </div>

            <div className="modal-actions-row">
              <button className="btn-cancel" onClick={() => setSelectedResultDetail(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
