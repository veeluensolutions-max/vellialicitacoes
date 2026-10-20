import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Users,
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  Building,
  Zap,
  Check,
  X,
  AlertOctagon,
  Download,
  Share2,
  FileCheck
} from 'lucide-react';

import { growthService } from '../../services/growth/growthService.js';
import {
  GrowthOpportunityType,
  GrowthOpportunityStatus,
  GrowthPipelineStage,
  GrowthPriority,
  GrowthConfidence,
  ExpansionQuadrant,
  GrowthActionType,
  RejectionReason,
  ConversionTargetType
} from '../../services/growth/growthModels.js';

import './GrowthExpansionView.css';

export default function GrowthExpansionView({
  currentUser = { name: 'Diretoria Executiva', role: 'ADMIN', permissions: ['growth.view', 'growth.manage', 'growth.validate', 'growth.group.view', 'growth.financial.view'], companyScope: 'ALL' },
  onNavigateToTab
}) {
  const [selectedCompany, setSelectedCompany] = useState('ALL'); // ALL | veeluen | excelencia
  const [activeArea, setActiveArea] = useState('cross-sell'); // cross-sell | new-buyers | regions | services | pipeline
  const [opportunities, setOpportunities] = useState([]);
  const [effectiveness, setEffectiveness] = useState(null);
  const [matrixData, setMatrixData] = useState(null);
  const [crossSellData, setCrossSellData] = useState(null);
  const [buyersList, setBuyersList] = useState([]);
  const [regionsList, setRegionsList] = useState([]);
  const [servicesData, setServicesData] = useState(null);
  const [accountsData, setAccountsData] = useState(null);
  const [concentration, setConcentration] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modais de Ação e Governança
  const [validateModal, setValidateModal] = useState({ open: false, item: null, notes: '' });
  const [planModal, setPlanModal] = useState({ open: false, item: null, objective: '', action: GrowthActionType.RELATIONSHIP, owner: currentUser.name, reviewDate: '', commercialTiming: '' });
  const [activateModal, setActivateModal] = useState({ open: false, item: null, confirmed: false });
  const [dismissModal, setDismissModal] = useState({ open: false, item: null, reason: RejectionReason.NOT_STRATEGIC, notes: '' });
  const [outreachModal, setOutreachModal] = useState({ open: false, data: null, confirmed: false });
  const [convertModal, setConvertModal] = useState({ open: false, item: null, targetType: ConversionTargetType.PROCUREMENT_OPPORTUNITY, notes: '' });
  const [reportModal, setReportModal] = useState({ open: false, type: 'EXECUTIVE', content: null });
  const [synergiesModal, setSynergiesModal] = useState({ open: false, data: null });

  const loadData = () => {
    const opps = growthService.listGrowthOpportunities(selectedCompany);
    setOpportunities(opps);
    setEffectiveness(growthService.getEffectivenessMetrics(selectedCompany));
    setMatrixData(growthService.getExpansionMatrix(selectedCompany));
    setCrossSellData(growthService.getCrossSellAnalysis(selectedCompany));
    setBuyersList(growthService.getBuyerExpansion(selectedCompany));
    setRegionsList(growthService.getRegionalExpansion(selectedCompany));
    setServicesData(growthService.getServiceExpansion(selectedCompany));
    setAccountsData(growthService.getStrategicAccountsAndWhiteSpaces(selectedCompany));
    setConcentration(growthService.getConcentrationAnalysis());
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 10. Validação Humana
  const handleConfirmValidation = () => {
    if (!validateModal.item) return;
    try {
      growthService.validateGrowthOpportunity(validateModal.item.id, currentUser.name, validateModal.notes);
      showNotification(`Oportunidade "${validateModal.item.title}" validada com sucesso!`);
      setValidateModal({ open: false, item: null, notes: '' });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 104. Mini Plano de Crescimento
  const handleSaveActionPlan = () => {
    if (!planModal.item) return;
    try {
      growthService.planActionForOpportunity(planModal.item.id, {
        objective: planModal.objective,
        action: planModal.action,
        owner: planModal.owner,
        reviewDate: planModal.reviewDate,
        commercialTiming: planModal.commercialTiming
      }, currentUser.name);
      showNotification(`Plano de ação estruturado para "${planModal.item.title}".`);
      setPlanModal({ open: false, item: null, objective: '', action: GrowthActionType.RELATIONSHIP, owner: currentUser.name, reviewDate: '', commercialTiming: '' });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 11. REGRA: NÃO MARCAR ACTIVE SEM REVISÃO HUMANA
  const handleConfirmActivate = () => {
    if (!activateModal.item) return;
    if (!activateModal.confirmed) {
      alert('É obrigatório marcar a confirmação formal de revisão humana.');
      return;
    }
    try {
      growthService.activateOpportunity(activateModal.item.id, currentUser.name, true);
      showNotification(`Oportunidade ativada sob supervisão humana direta!`);
      setActivateModal({ open: false, item: null, confirmed: false });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 163. Rejeição Preservando Motivo
  const handleConfirmDismiss = () => {
    if (!dismissModal.item) return;
    try {
      growthService.dismissOpportunity(dismissModal.item.id, dismissModal.reason, dismissModal.notes, currentUser.name);
      showNotification(`Oportunidade arquivada com motivo registrado.`);
      setDismissModal({ open: false, item: null, reason: RejectionReason.NOT_STRATEGIC, notes: '' });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 92 a 96. Abordagem Comercial Supervisionada
  const handleOpenOutreach = (item) => {
    const draft = growthService.prepareCommercialOutreach(item.id);
    setOutreachModal({ open: true, data: draft, confirmed: false });
  };

  const handleConfirmOutreach = () => {
    if (!outreachModal.confirmed) {
      alert('Confirmação humana obrigatória para aprovar abordagem externa.');
      return;
    }
    try {
      growthService.confirmAndExecuteOutreach(outreachModal.data.opportunityId, outreachModal.data.outreachDraft, true, currentUser.name);
      showNotification(`Abordagem comercial registrada no CRM com status supervisionado.`);
      setOutreachModal({ open: false, data: null, confirmed: false });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 152. Conversão da Oportunidade
  const handleConfirmConvert = () => {
    if (!convertModal.item) return;
    try {
      growthService.convertOpportunity(convertModal.item.id, convertModal.targetType, {
        notes: convertModal.notes,
        title: convertModal.item.title
      }, currentUser.name);
      showNotification(`Oportunidade de crescimento convertida com sucesso em ${convertModal.targetType}!`);
      setConvertModal({ open: false, item: null, targetType: ConversionTargetType.PROCUREMENT_OPPORTUNITY, notes: '' });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // Watchlist Toggle
  const handleToggleWatchlist = (orgName) => {
    const status = growthService.toggleBuyerWatchlist(orgName);
    showNotification(`Organização ${orgName} ${status ? 'adicionada à' : 'removida da'} Watchlist.`);
    loadData();
  };

  // Sinergias de Grupo (Fase 61: Multiempresa com controle de permissão)
  const handleOpenGroupSynergies = () => {
    const perms = currentUser.permissions || [];
    const res = growthService.checkGroupSynergies(perms, currentUser.companyScope);
    setSynergiesModal({ open: true, data: res });
  };

  // Relatório de Crescimento
  const handleOpenReport = (type) => {
    const rep = growthService.generateGrowthReport(selectedCompany, type);
    setReportModal({ open: true, type, content: rep });
  };

  return (
    <div className="growth-expansion-container">
      {/* Toast de Notificação */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Executivo & Controles */}
      <div className="growth-header">
        <div className="growth-header-top">
          <div className="growth-title-group">
            <h1>
              <TrendingUp className="text-primary" size={26} />
              VELLIA EXPANSÃO & CRESCIMENTO
              <span className="growth-badge-live">Fase 61 • Motor Estratégico</span>
            </h1>
            <p>
              Identificação orientada por dados de onde existe real coerência entre <strong>Demanda Observada</strong>, <strong>Capacidade Técnica</strong> e <strong>Posicionamento</strong>, sem abordagens invasivas ou genéricas.
            </p>
          </div>

          <div className="growth-header-actions">
            {/* Filtro Multiempresa */}
            <div className="company-filter-group">
              <button
                className={`btn-company-chip ${selectedCompany === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCompany('ALL')}
              >
                Todas as Empresas
              </button>
              <button
                className={`btn-company-chip ${selectedCompany === 'veeluen' ? 'active' : ''}`}
                onClick={() => setSelectedCompany('veeluen')}
              >
                Veeluen Solutions
              </button>
              <button
                className={`btn-company-chip ${selectedCompany === 'excelencia' ? 'active' : ''}`}
                onClick={() => setSelectedCompany('excelencia')}
              >
                Excelência Ambiental
              </button>
            </div>

            {/* Ações Estruturadas */}
            <button className="btn-report-action" onClick={handleOpenGroupSynergies}>
              <Layers size={14} /> Sinergias de Grupo
            </button>
            <button className="btn-report-action" onClick={() => handleOpenReport('EXECUTIVE')}>
              <Download size={14} /> Relatório Executivo
            </button>
          </div>
        </div>

        {/* Banner de KPIs Fatuais */}
        {effectiveness && (
          <div className="growth-kpi-grid">
            <div className="growth-kpi-card highlight">
              <span className="growth-kpi-label">
                <Target size={14} className="text-emerald-400" /> Hipóteses Mapeadas
              </span>
              <span className="growth-kpi-value">{effectiveness.total}</span>
              <span className="growth-kpi-desc">Base factual auditável</span>
            </div>

            <div className="growth-kpi-card">
              <span className="growth-kpi-label">
                <ShieldCheck size={14} className="text-cyan-400" /> Validadas por Gestão
              </span>
              <span className="growth-kpi-value">{effectiveness.validated + effectiveness.actionPlanned + effectiveness.engaged}</span>
              <span className="growth-kpi-desc">{effectiveness.actionPlanned} com plano de ação</span>
            </div>

            <div className="growth-kpi-card">
              <span className="growth-kpi-label">
                <Users size={14} className="text-indigo-400" /> Cobertura Conhecida
              </span>
              <span className="growth-kpi-value">36.5%</span>
              <span className="growth-kpi-desc">Em contas estratégicas</span>
            </div>

            <div className="growth-kpi-card">
              <span className="growth-kpi-label">
                <Zap size={14} className="text-amber-400" /> Conversões Efetivas
              </span>
              <span className="growth-kpi-value">{effectiveness.converted}</span>
              <span className="growth-kpi-desc">{effectiveness.conversionRate}% do pipeline de crescimento</span>
            </div>
          </div>
        )}
      </div>

      {/* Navegação das 5 Áreas Centrais */}
      <div className="growth-nav-tabs">
        <button
          className={`growth-tab-btn ${activeArea === 'cross-sell' ? 'active' : ''}`}
          onClick={() => setActiveArea('cross-sell')}
        >
          <Sparkles size={16} /> 1. Cross-sell em Clientes
          <span className="growth-tab-badge">Clientes Atuais</span>
        </button>

        <button
          className={`growth-tab-btn ${activeArea === 'new-buyers' ? 'active' : ''}`}
          onClick={() => setActiveArea('new-buyers')}
        >
          <Building size={16} /> 2. Novos Compradores
          <span className="growth-tab-badge">{buyersList.length} Alvos</span>
        </button>

        <button
          className={`growth-tab-btn ${activeArea === 'regions' ? 'active' : ''}`}
          onClick={() => setActiveArea('regions')}
        >
          <Compass size={16} /> 3. Expansão Regional
          <span className="growth-tab-badge">{regionsList.length} Polos</span>
        </button>

        <button
          className={`growth-tab-btn ${activeArea === 'services' ? 'active' : ''}`}
          onClick={() => setActiveArea('services')}
        >
          <Layers size={16} /> 4. Serviços & Mercados Adjacentes
          <span className="growth-tab-badge">Gaps & Sinergias</span>
        </button>

        <button
          className={`growth-tab-btn ${activeArea === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveArea('pipeline')}
        >
          <Target size={16} /> 5. Growth Pipeline & Matriz
          <span className="growth-tab-badge">Governança</span>
        </button>
      </div>

      {/* ÁREA 1: CROSS-SELL EM CLIENTES ATUAIS */}
      {activeArea === 'cross-sell' && crossSellData && (
        <div className="growth-section-wrapper">
          <div className="section-hero-card">
            <h2>
              <Sparkles className="text-cyan-400" size={20} />
              Cross-sell Contextual Baseado em Evidência
            </h2>
            <p>
              Identificação de necessidades complementares legítimas em organizações com contratos vigentes, respaldadas por relações históricas de afinidade e amostra auditada.
            </p>
          </div>

          {/* Afinidades Históricas com Sample Size */}
          <div className="accounts-table-container">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>Serviço Contratado Atual</th>
                  <th>Serviço Complementar Sugerido</th>
                  <th>Amostra Histórica</th>
                  <th>Taxa de Afinidade</th>
                  <th>Fundamentação Técnica (Rationale)</th>
                </tr>
              </thead>
              <tbody>
                {crossSellData.affinities.map((aff, i) => (
                  <tr key={i}>
                    <td><strong>{aff.primaryService}</strong></td>
                    <td className="text-cyan-300">{aff.complementaryService}</td>
                    <td>
                      <span className={`tag-type ${aff.isSmallSample ? 'bg-amber-500/20 text-amber-300' : ''}`}>
                        {aff.sampleSize} casos {aff.isSmallSample ? '⚠️ Amostra Pequena' : '✓'}
                      </span>
                    </td>
                    <td><strong className="text-emerald-400">{(aff.affinityRate * 100).toFixed(0)}%</strong></td>
                    <td className="font-xs">
                      {aff.rationale}
                      {aff.sampleWarning && (
                        <div className="text-amber-400 font-xs mt-1">⚠️ {aff.sampleWarning}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Contas Estratégicas & White Spaces */}
          <div className="section-hero-card mt-2">
            <h2>
              <Building className="text-emerald-400" size={20} />
              Cobertura de Serviços Conhecida & Oportunidades White Space
            </h2>
            <p className="text-muted font-xs">
              Conceito White Space: Serviço que o comprador utiliza + temos capacidade técnica comprovada + ainda não prestamos.
            </p>
          </div>

          <div className="growth-cards-grid">
            {accountsData?.accounts?.map((acc, idx) => (
              <div key={idx} className="growth-card">
                <div>
                  <div className="growth-card-top">
                    <span className="tag-company veeluen">{acc.relationshipStrength}</span>
                    <span className="growth-tab-badge">Cobertura: {acc.knownCoveragePct}%</span>
                  </div>
                  <h3 className="growth-card-title">{acc.organization}</h3>
                  <div className="growth-card-meta">
                    <div><strong>Categorias Demandadas:</strong> {acc.observedCategoriesCount} observadas • Atuamos em {acc.activeCategoriesCount}</div>
                    <div className="coverage-progress-bar">
                      <div className="coverage-progress-fill" style={{ width: `${acc.knownCoveragePct}%` }}></div>
                    </div>
                    <div className="font-xs text-muted mt-1"><strong>Serviços Atuais:</strong> {acc.activeServices.join(', ')}</div>
                    <div className="font-xs text-info mt-1"><strong>Sinais Futuros:</strong> {acc.knownFutureSignals}</div>
                  </div>
                </div>

                <div className="growth-evidence-box">
                  <span className="growth-evidence-title">Oportunidades White Space Detectadas:</span>
                  {acc.whiteSpaces.map((ws, wIdx) => (
                    <div key={wIdx} className="growth-evidence-item">
                      • <strong>{ws.service}</strong>: {ws.notes} ({ws.priority})
                    </div>
                  ))}
                </div>

                <div className="growth-card-actions">
                  <button
                    className="btn-growth-action primary"
                    onClick={() => {
                      const opp = opportunities.find(o => o.targetOrganization.includes(acc.organization.split(' ')[0]));
                      if (opp) handleOpenOutreach(opp);
                      else alert('Estruture a oportunidade formal no pipeline antes da abordagem.');
                    }}
                  >
                    <Send size={13} /> Preparar Abordagem Institucional
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÁREA 2: NOVOS COMPRADORES */}
      {activeArea === 'new-buyers' && (
        <div className="growth-section-wrapper">
          <div className="section-hero-card">
            <h2>
              <Building className="text-primary" size={20} />
              Novos Compradores Qualificados por Similaridade Factual
            </h2>
            <p>
              Compradores industriais com padrão de demanda, frequência de contratação e exigências de conformidade similares aos clientes já atendidos com sucesso. Sem scores opacos.
            </p>
          </div>

          <div className="growth-cards-grid">
            {buyersList.map((buyer, idx) => (
              <div key={idx} className="growth-card">
                <div>
                  <div className="growth-card-top">
                    <span className={`tag-company ${buyer.companyTarget}`}>{buyer.companyTarget.toUpperCase()}</span>
                    <button
                      className={`btn-growth-action ${buyer.watchlist ? 'success' : ''}`}
                      onClick={() => handleToggleWatchlist(buyer.organization)}
                    >
                      {buyer.watchlist ? '★ Na Watchlist' : '☆ Monitorar'}
                    </button>
                  </div>
                  <h3 className="growth-card-title">{buyer.organization}</h3>
                  <div className="growth-card-meta">
                    <div><strong>Serviços Demandados:</strong> {buyer.relevantServices.join(', ')}</div>
                    <div><strong>Setor:</strong> {buyer.similarityFactors.industry}</div>
                    <div><strong>Região:</strong> {buyer.similarityFactors.region}</div>
                    <div><strong>Ticket Médio Estimado:</strong> {buyer.similarityFactors.ticketRange}</div>
                    <div><strong>Frequência:</strong> {buyer.similarityFactors.frequency}</div>
                    <div><strong>Regime de Contratação:</strong> {buyer.similarityFactors.contractType}</div>
                  </div>
                </div>

                <div className="growth-evidence-box">
                  <span className="growth-evidence-title">Evidência Estruturada:</span>
                  <div className="growth-evidence-item">{buyer.evidence}</div>
                  <div className="growth-evidence-item text-slate-400 mt-1">
                    Última compra conhecida: {buyer.lastKnownPurchase} • Sinal futuro: {buyer.futureSignal}
                  </div>
                </div>

                <div className="growth-card-actions">
                  <button
                    className="btn-growth-action primary"
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('workspace-inteligencia');
                    }}
                  >
                    <Sparkles size={13} /> Investigar no Workspace
                  </button>
                  <button
                    className="btn-growth-action"
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('relacionamento');
                    }}
                  >
                    <Users size={13} /> Abrir no CRM
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÁREA 3: EXPANSÃO REGIONAL */}
      {activeArea === 'regions' && (
        <div className="growth-section-wrapper">
          <div className="section-hero-card">
            <h2>
              <Compass className="text-cyan-400" size={20} />
              Expansão Regional com Checagem Obrigatória de Prontidão (Capacity Check)
            </h2>
            <p>
              Polos industriais com volume de certames identificado, comparados com a disponibilidade de acervo, base de apoio e custo de mobilização para proteger margens.
            </p>
          </div>

          <div className="growth-cards-grid">
            {regionsList.map((reg, idx) => (
              <div key={idx} className="growth-card">
                <div>
                  <div className="growth-card-top">
                    <span className={`tag-company ${reg.companyTarget}`}>{reg.companyTarget.toUpperCase()}</span>
                    <span className="tag-type">Demanda: {reg.demandLevel}</span>
                  </div>
                  <h3 className="growth-card-title">{reg.region}</h3>
                  <div className="growth-card-meta">
                    <div><strong>Serviço Prioritário:</strong> {reg.serviceTarget}</div>
                    <div><strong>Processos no Histórico:</strong> {reg.historicalOpportunities} certames observados</div>
                    <div><strong>Compradores Mapeados:</strong> {reg.activeBuyersCount} organizações</div>
                    <div><strong>Nível de Concorrência:</strong> {reg.competitionLevel}</div>
                  </div>
                </div>

                <div className="growth-evidence-box">
                  <span className="growth-evidence-title">Capacity & Readiness Check:</span>
                  <div className="growth-evidence-item"><strong>Status:</strong> {reg.capacityStatus}</div>
                  <div className="growth-evidence-item text-amber-300 mt-1"><strong>Gap Identificado:</strong> {reg.readinessGap}</div>
                </div>

                <div className={`readiness-pill-row ${reg.mobilizationReadiness.includes('8') ? 'ready' : 'gap'}`}>
                  <span>Prontidão de Mobilização:</span>
                  <strong>{reg.mobilizationReadiness}</strong>
                </div>

                <div className="growth-card-actions">
                  <span className="font-xs text-muted" style={{ width: '100%' }}>
                    💡 <strong>Diretriz:</strong> {reg.recommendationLabel}
                  </span>
                  <button
                    className="btn-growth-action primary mt-2"
                    onClick={() => {
                      if (onNavigateToTab) onNavigateToTab('laboratorio-cenarios');
                    }}
                  >
                    <Layers size={13} /> Simular Impacto de Expansão
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÁREA 4: SERVIÇOS & MERCADOS ADJACENTES */}
      {activeArea === 'services' && servicesData && (
        <div className="growth-section-wrapper">
          <div className="section-hero-card">
            <h2>
              <Layers className="text-indigo-400" size={20} />
              Expansão de Serviços e Mercados Adjacentes
            </h2>
            <p>
              Avaliação de escopos em alta demanda confrontados com o acervo técnico atual. Identificação expressa de gaps antes de recomendar entrada em novos nichos.
            </p>
          </div>

          <div className="growth-cards-grid">
            {servicesData.opportunities.map((opp) => (
              <div key={opp.id} className="growth-card">
                <div>
                  <div className="growth-card-top">
                    <span className={`tag-company ${opp.companyId}`}>{opp.companyName}</span>
                    <span className="tag-type">{opp.type}</span>
                  </div>
                  <h3 className="growth-card-title">{opp.title}</h3>
                  <div className="growth-card-meta">
                    <div><strong>Serviço Alvo:</strong> {opp.targetService}</div>
                    <div><strong>Comprador / Mercado:</strong> {opp.targetOrganization}</div>
                    <div><strong>Ticket Estimado:</strong> {opp.attractiveness.estimatedTicket}</div>
                    <div><strong>Margem Histórica:</strong> {opp.attractiveness.marginProfile}</div>
                  </div>
                </div>

                <div className="growth-evidence-box">
                  <span className="growth-evidence-title">Capacidade & Gaps Técnicos:</span>
                  <div className="growth-evidence-item">
                    <strong>Status:</strong> {opp.readiness.capacityStatus}
                  </div>
                  <div className="growth-evidence-item text-slate-300 mt-1">
                    {opp.readiness.capacityNotes}
                  </div>
                </div>

                <div className="growth-card-actions">
                  <button
                    className="btn-growth-action"
                    onClick={() => setPlanModal({ open: true, item: opp, objective: opp.growthPlan?.objective || '', action: GrowthActionType.CAPABILITY, owner: currentUser.name, reviewDate: '', commercialTiming: '' })}
                  >
                    <FileText size={13} /> Estruturar Plano de Capacidade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÁREA 5: GROWTH PIPELINE & MATRIZ */}
      {activeArea === 'pipeline' && matrixData && (
        <div className="growth-section-wrapper">
          <div className="section-hero-card">
            <h2>
              <Target className="text-emerald-400" size={20} />
              Growth Pipeline Separado do Funil de Licitações
            </h2>
            <p>
              Acompanhamento de hipóteses comerciais validadas até sua conversão em Oportunidades de Certame (Radar), Negócios no CRM ou Aditivos de Contrato.
            </p>
          </div>

          {/* Alertas de Concentração de Carteira */}
          {concentration && (
            <div className="accounts-table-container p-3 mb-2" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <div className="flex-row items-center gap-2 mb-1">
                <AlertTriangle className="text-amber-400" size={18} />
                <strong className="text-amber-300">Inteligência de Concentração de Carteira:</strong>
              </div>
              <div className="font-xs text-slate-200">
                • <strong>Concentração de Compradores:</strong> {concentration.buyerConcentration.concentrationPct}% do pipeline está no grupo {concentration.buyerConcentration.topBuyerName}. <em>{concentration.buyerConcentration.recommendation}</em>
              </div>
            </div>
          )}

          {/* Matriz 2x2 de Expansão (Atratividade x Prontidão) */}
          <div className="expansion-matrix-grid">
            <div className="quadrant-box prioritize">
              <div className="quadrant-header">
                <h4>1. PRIORITIZE (Alta Atratividade • Alta Prontidão)</h4>
                <span className="growth-tab-badge bg-emerald-500/20 text-emerald-300">{matrixData.quadrants[ExpansionQuadrant.PRIORITIZE].length}</span>
              </div>
              <p className="font-xs text-muted">Ação imediata: Equipe pronta e demanda evidente.</p>
              <div className="quadrant-items-list">
                {matrixData.quadrants[ExpansionQuadrant.PRIORITIZE].map(item => (
                  <div key={item.id} className="quadrant-mini-card">
                    <div>
                      <strong>{item.targetOrganization}</strong>
                      <div className="font-xs text-muted">{item.targetService}</div>
                    </div>
                    <span className="status-badge validated">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="quadrant-box develop">
              <div className="quadrant-header">
                <h4>2. DEVELOP CAPABILITY (Alta Atratividade • Prontidão Média/Baixa)</h4>
                <span className="growth-tab-badge bg-amber-500/20 text-amber-300">{matrixData.quadrants[ExpansionQuadrant.DEVELOP_CAPABILITY].length}</span>
              </div>
              <p className="font-xs text-muted">Desenvolver antes de expandir para evitar inexecução.</p>
              <div className="quadrant-items-list">
                {matrixData.quadrants[ExpansionQuadrant.DEVELOP_CAPABILITY].map(item => (
                  <div key={item.id} className="quadrant-mini-card">
                    <div>
                      <strong>{item.targetOrganization}</strong>
                      <div className="font-xs text-muted">{item.targetService}</div>
                    </div>
                    <span className="status-badge under_review">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="quadrant-box monitor">
              <div className="quadrant-header">
                <h4>3. MONITOR (Atratividade Moderada • Prontidão Variável)</h4>
                <span className="growth-tab-badge bg-cyan-500/20 text-cyan-300">{matrixData.quadrants[ExpansionQuadrant.MONITOR].length}</span>
              </div>
              <p className="font-xs text-muted">Acompanhar sinais em Radar e PCA sem compromisso de equipe.</p>
              <div className="quadrant-items-list">
                {matrixData.quadrants[ExpansionQuadrant.MONITOR].map(item => (
                  <div key={item.id} className="quadrant-mini-card">
                    <div>
                      <strong>{item.targetOrganization}</strong>
                      <div className="font-xs text-muted">{item.targetService}</div>
                    </div>
                    <span className="status-badge identified">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="quadrant-box low">
              <div className="quadrant-header">
                <h4>4. LOW PRIORITY (Baixa Atratividade • Baixa Prontidão)</h4>
                <span className="growth-tab-badge bg-slate-500/20 text-slate-300">{matrixData.quadrants[ExpansionQuadrant.LOW_PRIORITY].length}</span>
              </div>
              <p className="font-xs text-muted">Evitar dispersão de recursos comerciais.</p>
              <div className="quadrant-items-list">
                <div className="font-xs text-slate-400 p-2 text-center">Nenhuma oportunidade nesta zona.</div>
              </div>
            </div>
          </div>

          {/* Cards do Pipeline com Ações de Governança */}
          <div className="section-hero-card mt-3">
            <h2>
              <CheckCircle className="text-cyan-400" size={20} />
              Gestão de Hipóteses e Deliberações
            </h2>
          </div>

          <div className="growth-cards-grid">
            {opportunities.map(opp => (
              <div key={opp.id} className="growth-card">
                <div>
                  <div className="growth-card-top">
                    <span className={`tag-company ${opp.companyId}`}>{opp.companyName}</span>
                    <span className={`status-badge ${opp.status.toLowerCase().replace(' ', '_')}`}>{opp.status}</span>
                  </div>
                  <h3 className="growth-card-title">{opp.title}</h3>
                  <div className="growth-card-meta">
                    <div><strong>Comprador:</strong> {opp.targetOrganization} ({opp.targetRegion})</div>
                    <div><strong>Serviço:</strong> {opp.targetService}</div>
                    <div><strong>Estágio Pipeline:</strong> {opp.pipelineStage}</div>
                    <div><strong>Confiança:</strong> {opp.confidence} • Prioridade: {opp.priority}</div>
                  </div>
                </div>

                <div className="growth-evidence-box">
                  <span className="growth-evidence-title">Evidências Fatuais ({opp.evidence?.length || 0}):</span>
                  {opp.evidence?.map((ev, i) => (
                    <div key={i} className="growth-evidence-item">
                      • {ev.source}: {ev.description}
                    </div>
                  ))}
                </div>

                {/* Se tem plano de ação */}
                {opp.growthPlan && (
                  <div className="p-2 bg-slate-800/40 rounded border border-slate-700/50 font-xs">
                    <strong className="text-indigo-300">Plano de Ação:</strong> {opp.growthPlan.objective}
                    <div className="text-muted mt-1">Responsável: {opp.growthPlan.owner} • Revisão: {opp.growthPlan.reviewDate}</div>
                  </div>
                )}

                {/* Se convertida */}
                {opp.conversionLink && (
                  <div className="p-2 bg-emerald-950/40 rounded border border-emerald-500/40 font-xs text-emerald-300">
                    ✓ Convertida em {opp.conversionLink.targetType} (ID: {opp.conversionLink.targetEntityId})
                  </div>
                )}

                {/* Se rejeitada */}
                {opp.rejectionReason && (
                  <div className="p-2 bg-red-950/40 rounded border border-red-500/40 font-xs text-red-300">
                    ✕ Descartada: {opp.rejectionReason} ({opp.rejectionNotes || 'Sem notas adicionais'})
                  </div>
                )}

                <div className="growth-card-actions">
                  {opp.status !== GrowthOpportunityStatus.VALIDATED && opp.status !== GrowthOpportunityStatus.ACTIVE && opp.status !== GrowthOpportunityStatus.DISMISSED && (
                    <button
                      className="btn-growth-action success"
                      onClick={() => setValidateModal({ open: true, item: opp, notes: '' })}
                    >
                      <CheckCircle size={13} /> Validar Hipótese
                    </button>
                  )}

                  {opp.status === GrowthOpportunityStatus.VALIDATED && (
                    <button
                      className="btn-growth-action primary"
                      onClick={() => setPlanModal({ open: true, item: opp, objective: opp.growthPlan?.objective || '', action: GrowthActionType.RELATIONSHIP, owner: currentUser.name, reviewDate: '', commercialTiming: '' })}
                    >
                      <FileText size={13} /> Criar Plano
                    </button>
                  )}

                  {opp.status === GrowthOpportunityStatus.ACTION_PLANNED && (
                    <button
                      className="btn-growth-action success"
                      onClick={() => setActivateModal({ open: true, item: opp, confirmed: false })}
                    >
                      <Zap size={13} /> Ativar Oportunidade
                    </button>
                  )}

                  {opp.status !== GrowthOpportunityStatus.DISMISSED && (
                    <>
                      <button
                        className="btn-growth-action"
                        onClick={() => setConvertModal({ open: true, item: opp, targetType: ConversionTargetType.PROCUREMENT_OPPORTUNITY, notes: '' })}
                      >
                        <Share2 size={13} /> Converter
                      </button>
                      <button
                        className="btn-growth-action danger"
                        onClick={() => setDismissModal({ open: true, item: opp, reason: RejectionReason.NOT_STRATEGIC, notes: '' })}
                      >
                        <XCircle size={13} /> Descartar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: VALIDAÇÃO HUMANA */}
      {validateModal.open && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Validar Oportunidade de Crescimento</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setValidateModal({ open: false, item: null, notes: '' })}>
                <X size={18} />
              </button>
            </div>
            <div className="growth-modal-body">
              <p className="font-sm text-slate-300">
                Você está validando a coerência factual da oportunidade <strong>"{validateModal.item?.title}"</strong> perante a capacidade da empresa.
              </p>
              <div className="form-group-growth">
                <label>Notas de Validação da Gestão:</label>
                <textarea
                  placeholder="Justifique a coerência de capacidade técnica, atestados e atratividade..."
                  value={validateModal.notes}
                  onChange={(e) => setValidateModal({ ...validateModal, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="growth-modal-footer">
              <button className="btn-growth-action" onClick={() => setValidateModal({ open: false, item: null, notes: '' })}>
                Cancelar
              </button>
              <button className="btn-growth-action primary" onClick={handleConfirmValidation}>
                Confirmar Validação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MINI PLANO DE CRESCIMENTO */}
      {planModal.open && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Estruturar Mini Plano de Crescimento</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setPlanModal({ open: false, item: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="form-group-growth">
                <label>Objetivo Estratégico:</label>
                <input
                  type="text"
                  value={planModal.objective}
                  onChange={(e) => setPlanModal({ ...planModal, objective: e.target.value })}
                />
              </div>

              <div className="form-group-growth">
                <label>Tipo de Ação:</label>
                <select
                  value={planModal.action}
                  onChange={(e) => setPlanModal({ ...planModal, action: e.target.value })}
                >
                  {Object.values(GrowthActionType).map((act, i) => (
                    <option key={i} value={act}>{act}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-growth">
                <label>Responsável (Owner):</label>
                <input
                  type="text"
                  value={planModal.owner}
                  onChange={(e) => setPlanModal({ ...planModal, owner: e.target.value })}
                />
              </div>

              <div className="form-group-growth">
                <label>Data de Revisão:</label>
                <input
                  type="date"
                  value={planModal.reviewDate}
                  onChange={(e) => setPlanModal({ ...planModal, reviewDate: e.target.value })}
                />
              </div>

              <div className="form-group-growth">
                <label>Timing Comercial Recomendado:</label>
                <input
                  type="text"
                  placeholder="Ex: 90 dias antes do término do contrato de utilidades"
                  value={planModal.commercialTiming}
                  onChange={(e) => setPlanModal({ ...planModal, commercialTiming: e.target.value })}
                />
              </div>
            </div>
            <div className="growth-modal-footer">
              <button className="btn-growth-action" onClick={() => setPlanModal({ open: false, item: null })}>
                Cancelar
              </button>
              <button className="btn-growth-action primary" onClick={handleSaveActionPlan}>
                Salvar Plano de Crescimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ATIVAÇÃO COM REVISÃO HUMANA OBRIGATÓRIA */}
      {activateModal.open && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Ativação de Oportunidade de Crescimento</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setActivateModal({ open: false, item: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="anti-spam-alert">
                <AlertOctagon size={24} className="flex-shrink-0" />
                <div>
                  <strong>REGRA DE GOVERNANÇA VELLIA (Item 11):</strong> Nenhuma oportunidade de crescimento pode ser colocada em estado <strong>ACTIVE</strong> sem revisão humana prévia.
                </div>
              </div>
              <p className="font-sm text-slate-300">
                Confirma que a oportunidade <strong>"{activateModal.item?.title}"</strong> possui viabilidade operacional, acervo e equipe disponível para engajamento ativo?
              </p>
              <label className="flex-row items-center gap-2 cursor-pointer font-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={activateModal.confirmed}
                  onChange={(e) => setActivateModal({ ...activateModal, confirmed: e.target.checked })}
                />
                Declaro que revisei os requisitos e autorizo a ativação sob minha responsabilidade.
              </label>
            </div>
            <div className="growth-modal-footer">
              <button className="btn-growth-action" onClick={() => setActivateModal({ open: false, item: null })}>
                Cancelar
              </button>
              <button className="btn-growth-action success" onClick={handleConfirmActivate}>
                Confirmar Ativação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REJEIÇÃO COM MOTIVO PRESERVADO */}
      {dismissModal.open && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Descartar Oportunidade com Registro de Motivo</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setDismissModal({ open: false, item: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="growth-modal-body">
              <p className="font-sm text-slate-300">
                Selecione o motivo da rejeição para enriquecer o aprendizado contínuo do Vellia Growth Engine:
              </p>
              <div className="form-group-growth">
                <label>Motivo da Rejeição:</label>
                <select
                  value={dismissModal.reason}
                  onChange={(e) => setDismissModal({ ...dismissModal, reason: e.target.value })}
                >
                  {Object.values(RejectionReason).map((r, i) => (
                    <option key={i} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-growth">
                <label>Notas Adicionais:</label>
                <textarea
                  placeholder="Detalhes sobre a decisão da diretoria..."
                  value={dismissModal.notes}
                  onChange={(e) => setDismissModal({ ...dismissModal, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="growth-modal-footer">
              <button className="btn-growth-action" onClick={() => setDismissModal({ open: false, item: null })}>
                Voltar
              </button>
              <button className="btn-growth-action danger" onClick={handleConfirmDismiss}>
                Confirmar Descarte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ABORDAGEM COMERCIAL SUPERVISIONADA */}
      {outreachModal.open && outreachModal.data && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content" style={{ maxWidth: '750px' }}>
            <div className="growth-modal-header">
              <h3>Preparação de Abordagem Comercial Supervisionada</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setOutreachModal({ open: false, data: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="growth-modal-body">
              <div className="anti-spam-alert">
                <AlertTriangle size={24} className="flex-shrink-0" />
                <div>
                  <strong>DIRETRIZ DE EXPANSÃO (Itens 92 a 100):</strong> Não disparar abordagens em massa ou sem consentimento. O texto gerado é estritamente corporativo e focado no acervo técnico da organização.
                </div>
              </div>

              <div className="font-xs text-muted">
                <strong>Destinatário Organizacional:</strong> {outreachModal.data.targetOrganization} • <strong>Serviço:</strong> {outreachModal.data.targetService}
              </div>

              <div className="form-group-growth">
                <label>Assunto Proposto:</label>
                <input type="text" readOnly value={outreachModal.data.outreachDraft.subject} />
              </div>

              <div className="form-group-growth">
                <label>Minuta Institucional Personalizada:</label>
                <textarea readOnly style={{ minHeight: '180px', fontFamily: 'monospace' }} value={outreachModal.data.outreachDraft.body} />
              </div>

              <div className="p-2 bg-slate-800/60 rounded font-xs text-cyan-300">
                <strong>Timing Recomendado:</strong> {outreachModal.data.suggestedTiming}
              </div>

              <label className="flex-row items-center gap-2 cursor-pointer font-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={outreachModal.confirmed}
                  onChange={(e) => setOutreachModal({ ...outreachModal, confirmed: e.target.checked })}
                />
                Confirmo a revisão humana e aprovo o registro no módulo de CRM para despacho formal.
              </label>
            </div>
            <div className="growth-modal-footer">
              <button className="btn-growth-action" onClick={() => setOutreachModal({ open: false, data: null })}>
                Cancelar
              </button>
              <button className="btn-growth-action primary" onClick={handleConfirmOutreach}>
                <Send size={14} /> Registrar no CRM com Supervisão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: CONVERSÃO DE HIPÓTESE */}
      {convertModal.open && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Converter Hipótese de Crescimento</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setConvertModal({ open: false, item: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="growth-modal-body">
              <p className="font-sm text-slate-300">
                Converter <strong>"{convertModal.item?.title}"</strong> em uma entidade formal de operação:
              </p>

              <div className="form-group-growth">
                <label>Entidade de Destino:</label>
                <select
                  value={convertModal.targetType}
                  onChange={(e) => setConvertModal({ ...convertModal, targetType: e.target.value })}
                >
                  <option value={ConversionTargetType.PROCUREMENT_OPPORTUNITY}>Oportunidade de Licitação (Radar / Petronect)</option>
                  <option value={ConversionTargetType.CRM_OPPORTUNITY}>Oportunidade Comercial Direta (CRM)</option>
                  <option value={ConversionTargetType.CONTRACT_EXPANSION}>Expansão Contratual / Termo Aditivo</option>
                </select>
              </div>

              <div className="form-group-growth">
                <label>Notas de Conversão:</label>
                <textarea
                  placeholder="Descreva o contexto da conversão..."
                  value={convertModal.notes}
                  onChange={(e) => setConvertModal({ ...convertModal, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="growth-modal-footer">
              <button className="btn-growth-action" onClick={() => setConvertModal({ open: false, item: null })}>
                Cancelar
              </button>
              <button className="btn-growth-action success" onClick={handleConfirmConvert}>
                <CheckCircle size={14} /> Confirmar Conversão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: RELATÓRIO DE EXPANSÃO */}
      {reportModal.open && reportModal.content && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content" style={{ maxWidth: '800px' }}>
            <div className="growth-modal-header">
              <h3>{reportModal.content.title}</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setReportModal({ open: false, content: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="growth-modal-body font-sm">
              <div className="p-3 bg-slate-800/50 rounded mb-2">
                <div><strong>Escopo:</strong> {reportModal.content.companyScope} • Gerado em: {new Date(reportModal.content.generatedAt).toLocaleString('pt-BR')}</div>
                <div><strong>Total de Oportunidades Ativas:</strong> {reportModal.content.totalOpportunities}</div>
              </div>

              {reportModal.type === 'EXECUTIVE' ? (
                <div className="flex-col gap-2">
                  <h4 className="text-cyan-400 m-0">Top 3 Oportunidades Prioritárias:</h4>
                  {reportModal.content.topPriorities.map((p, i) => (
                    <div key={i} className="p-2 bg-slate-900 rounded border border-slate-700">
                      <strong>{p.title}</strong> ({p.organization} - {p.region})
                      <div className="font-xs text-muted">Serviço: {p.service} • Prontidão: {p.readiness}</div>
                    </div>
                  ))}
                  <div className="mt-2 text-warning font-xs">
                    ⚠️ {reportModal.content.concentrationAlerts?.recommendation}
                  </div>
                </div>
              ) : (
                <div className="flex-col gap-2">
                  <h4 className="text-cyan-400 m-0">Dossiê Completo de Prontidão:</h4>
                  {reportModal.content.opportunities.map((op, i) => (
                    <div key={i} className="p-2 bg-slate-900 rounded border border-slate-700">
                      <strong>{op.title}</strong> [{op.status}]
                      <div className="font-xs text-muted">Alvo: {op.targetOrganization} • Capacidade: {op.readiness?.capacityStatus}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="growth-modal-footer">
              <button className="btn-growth-action primary" onClick={() => setReportModal({ open: false, content: null })}>
                Fechar Relatório
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: SINERGIAS DE GRUPO (MULTIEMPRESA) */}
      {synergiesModal.open && synergiesModal.data && (
        <div className="growth-modal-overlay">
          <div className="growth-modal-content">
            <div className="growth-modal-header">
              <h3>Sinergias Comerciais do Grupo</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setSynergiesModal({ open: false, data: null })}>
                <X size={18} />
              </button>
            </div>
            <div className="growth-modal-body">
              {!synergiesModal.data.allowed ? (
                <div className="anti-spam-alert">
                  <AlertOctagon size={24} className="flex-shrink-0" />
                  <div>
                    <strong>ACESSO BLOQUEADO (Regra 199):</strong> {synergiesModal.data.message}
                  </div>
                </div>
              ) : (
                <div className="flex-col gap-2">
                  <p className="font-sm text-slate-300">
                    Sinergias entre <strong>Excelência Ambiental</strong> e <strong>Veeluen Solutions</strong> identificadas sob governança estrita de permissão:
                  </p>
                  {synergiesModal.data.synergies.map(syn => (
                    <div key={syn.id} className="p-3 bg-slate-800/60 rounded border border-cyan-500/30">
                      <div className="flex-row justify-between items-center mb-1">
                        <strong className="text-cyan-300">{syn.title}</strong>
                        <span className="growth-tab-badge">{syn.confidentialityLevel}</span>
                      </div>
                      <div className="font-xs text-slate-300">{syn.description}</div>
                      <div className="font-xs text-muted mt-2">
                        Empresa Líder: <strong>{syn.leadCompany}</strong> • Parceira: <strong>{syn.partnerCompany}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="growth-modal-footer">
              <button className="btn-growth-action" onClick={() => setSynergiesModal({ open: false, data: null })}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
