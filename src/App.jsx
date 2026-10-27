import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricsCards from './components/MetricsCards';
import RadarSection from './components/RadarSection';
import PrioritiesTable from './components/PrioritiesTable';
import OpportunityDrawer from './components/OpportunityDrawer';
import OpportunitiesView from './components/OpportunitiesView';
import MonitoringView from './components/MonitoringView';
import SemanticEngineView from './components/SemanticEngineView';
import PetronectDashboardWidgets from './components/PetronectDashboardWidgets';
import VelliaAgentCard from './components/VelliaAgentCard';
import AlertsView from './components/AlertsView';
import ReportsCenterView from './components/reports/ReportsCenterView';
import StrategicPlanningView from './components/strategic/StrategicPlanningView';
import FinancialPipelineView from './components/financial/FinancialPipelineView';
import ExecutionReadinessView from './components/readiness/ExecutionReadinessView';
import SupplierQuotationsView from './components/suppliers/SupplierQuotationsView';
import DocumentsManagementView from './components/DocumentsManagementView';
import DocumentVaultView from './components/DocumentVaultView';
import DecisionBoardView from './components/DecisionBoardView';
import ProposalsView from './components/ProposalsView';
import ResultsIntelligenceView from './components/ResultsIntelligenceView';
import IntelligenceCopilotView from './components/IntelligenceCopilotView';
import EarlyRadarView from './components/EarlyRadarView';
import CrmRelationshipView from './components/CrmRelationshipView';
import CommunicationsView from './components/CommunicationsView';
import IntegratedCalendarView from './components/IntegratedCalendarView';
import CommandCenterView from './components/CommandCenterView';
import AdminManagementView from './components/AdminManagementView';
import { ProductionReadinessView } from './components/ProductionReadinessView';
import { GoLiveModuleView } from './components/golive/GoLiveModuleView';
import { ProductAuditView } from './components/admin/ProductAuditView';
import GlobalFeedbackModal from './components/golive/GlobalFeedbackModal';
import EditalAnalysisModal from './components/EditalAnalysisModal';
import ModulePlaceholder from './components/ModulePlaceholder';
import { OpportunityService } from './services/opportunityService';
import { MultiSourceSyncManager } from './services/multisource/multiSourceSyncManager';
import { EventBus, VELLIA_EVENTS } from './services/eventBus';
import { continuousMonitorService } from './services/agent/continuousMonitorService';
import { pncpContinuousIngestionWorker } from './services/pncp/pncpContinuousIngestionWorker';
import { petronectContinuousIngestionWorker } from './services/petronect/petronectContinuousIngestionWorker';
import { comprasGovContinuousIngestionWorker } from './services/comprasgov/comprasGovContinuousIngestionWorker';
import { cloudSyncService } from './services/cloud/cloudSyncService';
import { priorityOpportunities, systemMetrics } from './data/mockData';
import OperationalDashboardView from './components/OperationalDashboardView';
import RadarConsolidatedView from './components/RadarConsolidatedView';
import IntelligenceConsolidatedView from './components/IntelligenceConsolidatedView';
import GlobalCopilotModal from './components/GlobalCopilotModal';
import WarRoomModal from './components/warroom/WarRoomModal';
import ContractsManagementView from './components/contract/ContractsManagementView';
import ApprovalInboxView from './components/governance/ApprovalInboxView';
import AutomationManagementView from './components/automation/AutomationManagementView';
import AgentControlCenterView from './components/agentControl/AgentControlCenterView';
import UniversalSearchModal from './components/search/UniversalSearchModal';
import IntelligenceWorkspaceView from './components/workspace/IntelligenceWorkspaceView';
import DataGovernanceView from './components/dataGovernance/DataGovernanceView';
import MaturityBenchmarkView from './components/maturity/MaturityBenchmarkView';
import ExecutiveReviewView from './components/executive/ExecutiveReviewView';
import StrategicMemoryView from './components/decisionMemory/StrategicMemoryView';
import StrategicScenarioLabView from './components/scenarioLab/StrategicScenarioLabView';
import StrategicRecommendationsView from './components/recommendations/StrategicRecommendationsView';
import AutonomyGovernanceCenterView from './components/autonomy/AutonomyGovernanceCenterView';
import MissionControlView from './components/missionControl/MissionControlView';
import ExecutiveCockpitView from './components/cockpit/ExecutiveCockpitView';
import GrowthExpansionView from './components/growth/GrowthExpansionView';
import PartnerStrategyView from './components/partnerStrategy/PartnerStrategyView';
import TenderNetworkView from './components/tenderNetwork/TenderNetworkView';
import OutcomeIntelligenceView from './components/outcome/OutcomeIntelligenceView';
import PredictiveRiskView from './components/predictiveRisk/PredictiveRiskView';
import RecoveryPlannerView from './components/mitigation/RecoveryPlannerView';
import PortfolioCapacityLabView from './components/portfolioCapacity/PortfolioCapacityLabView';
import CapabilityInvestmentLabView from './components/capabilityInvestment/CapabilityInvestmentLabView';
import { Sparkles, Shield, BellRing, Info, Cpu, ArrowRight } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agentActive, setAgentActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedEditalAnalysisId, setSelectedEditalAnalysisId] = useState(null);
  const [opportunitiesList, setOpportunitiesList] = useState(() => OpportunityService.listAll());
  const [lastSyncText, setLastSyncText] = useState(systemMetrics.lastSyncTime);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [copilotModalOpen, setCopilotModalOpen] = useState(false);
  const [warRoomOpportunity, setWarRoomOpportunity] = useState(null);
  const [universalSearchOpen, setUniversalSearchOpen] = useState(false);
  const [selectedCompanyScope, setSelectedCompanyScope] = useState(() => {
    return localStorage.getItem('vellia_selected_company_scope') || 'ALL';
  });

  const handleSelectCompanyScope = (scope) => {
    setSelectedCompanyScope(scope);
    localStorage.setItem('vellia_selected_company_scope', scope);
    EventBus.emit('vellia-company-scope-changed', { scope });
  };

  // Reatividade global de oportunidades
  React.useEffect(() => {
    const unsub = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, () => {
      setOpportunitiesList(OpportunityService.listAll());
    });
    return unsub;
  }, []);

  // Monitoramento Contínuo em Background (Prazos Críticos, Certidões, Worker PNCP, Petronect, Compras.gov & Nuvem Supabase)
  React.useEffect(() => {
    if (agentActive) {
      continuousMonitorService.start(45000); // Roda a cada 45 segundos
      pncpContinuousIngestionWorker.start(); // Inicia o ciclo de varredura autônoma do PNCP
      petronectContinuousIngestionWorker.start(); // Inicia o ciclo de varredura autônoma da Petronect
      comprasGovContinuousIngestionWorker.start(); // Inicia o ciclo de varredura autônoma do Compras.gov.br
      cloudSyncService.start(30); // Inicia polling de nuvem a cada 30 segundos
    } else {
      continuousMonitorService.stop();
      pncpContinuousIngestionWorker.pause();
      petronectContinuousIngestionWorker.pause();
      comprasGovContinuousIngestionWorker.pause();
      cloudSyncService.stop();
    }
    return () => {
      continuousMonitorService.stop();
      pncpContinuousIngestionWorker.pause();
      petronectContinuousIngestionWorker.pause();
      comprasGovContinuousIngestionWorker.pause();
      cloudSyncService.stop();
    };
  }, [agentActive]);

  // Listener para abertura contextual da Sala de Guerra (Fase 30)
  React.useEffect(() => {
    const handleOpenWarRoom = (e) => {
      if (e.detail?.opportunity) {
        setWarRoomOpportunity(e.detail.opportunity);
      }
    };
    window.addEventListener('vellia-open-war-room', handleOpenWarRoom);
    return () => window.removeEventListener('vellia-open-war-room', handleOpenWarRoom);
  }, []);

  // FASE 39: Atalho Global Ctrl+K / Cmd+K para Busca Universal e Knowledge Graph
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setUniversalSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sincronização e Varredura Real Multi-fonte (PNCP + Compras.gov.br + Petronect)
  const handleRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncToast({
      type: 'info',
      message: 'Varredura multi-fonte iniciada: consultando PNCP, Compras.gov.br e Petronect...'
    });

    try {
      const summary = await MultiSourceSyncManager.runFullMultiSourceSweep();
      const now = new Date();
      const timeStr = `Hoje às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastSyncText(timeStr);
      setOpportunitiesList(OpportunityService.listAll());

      const totalNew = summary.totalNew || 0;
      const totalUp = summary.totalUpdated || 0;
      setSyncToast({
        type: 'success',
        message: `Varredura concluída com sucesso! ${totalNew} novos certames capturados e ${totalUp} atualizados.`
      });
      setTimeout(() => setSyncToast(null), 5000);
    } catch (err) {
      console.error('Erro na varredura multi-fonte:', err);
      setSyncToast({
        type: 'error',
        message: `Aviso na varredura: ${err.message || 'Falha de conexão externa'}. Dados locais preservados.`
      });
      setTimeout(() => setSyncToast(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast flutuante de sincronização */}
      {syncToast && (
        <div style={{
          position: 'fixed',
          top: '75px',
          right: '25px',
          zIndex: 9999,
          background: syncToast.type === 'success' ? '#064e3b' : syncToast.type === 'error' ? '#7f1d1d' : '#0f172a',
          color: '#ffffff',
          border: syncToast.type === 'success' ? '1px solid #10b981' : syncToast.type === 'error' ? '1px solid #ef4444' : '1px solid #38bdf8',
          borderRadius: '8px',
          padding: '12px 18px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          maxWidth: '420px',
          animation: 'fadeIn 0.25s ease'
        }}>
          <Sparkles size={16} color={syncToast.type === 'success' ? '#34d399' : syncToast.type === 'error' ? '#f87171' : '#38bdf8'} />
          <span>{syncToast.message}</span>
        </div>
      )}

      {/* Sidebar Lateral Consolidada (Item 6) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Conteúdo Principal */}
      <div className="main-wrapper">
        <Header
          agentActive={agentActive}
          setAgentActive={setAgentActive}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          lastUpdatedText={lastSyncText}
          onRefresh={handleRefresh}
          isSyncing={isSyncing}
          onNavigateToAlerts={() => setActiveTab('alertas')}
          onOpenFeedback={() => setFeedbackModalOpen(true)}
          onOpenCopilot={() => setCopilotModalOpen(true)}
          onOpenUniversalSearch={() => setUniversalSearchOpen(true)}
          selectedCompanyScope={selectedCompanyScope}
          onSelectCompanyScope={handleSelectCompanyScope}
        />

        <main className="content-area">
          {activeTab === 'cockpit-executivo' ? (
            /* FASE 60: EXECUTIVE COCKPIT + STRATEGIC COMMAND CENTER 3.0 + VISÃO ÚNICA PARA DIRETORIA */
            <ExecutiveCockpitView onNavigateToTab={(tab) => setActiveTab(tab)} />
          ) : activeTab === 'dashboard' ? (
            /* FASE 24: DASHBOARD OPERACIONAL CONSOLIDADO (Itens 11 a 16) */
            <OperationalDashboardView
              onSelectOpportunity={(item) => setSelectedOpportunity(item)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onOpenCopilot={() => setCopilotModalOpen(true)}
              selectedCompanyScope={selectedCompanyScope}
            />
          ) : activeTab === 'radar' ? (
            /* FASE 24: RADAR CONSOLIDADO (Item 7: Diário, Antecipado, Fontes, Monitoramento) */
            <RadarConsolidatedView
              onSelectOpportunity={(item) => setSelectedOpportunity(item)}
              onNavigateToOpportunities={() => setActiveTab('oportunidades')}
            />
          ) : activeTab === 'workspace-inteligencia' ? (
            /* FASE 40: VELLIA INTELLIGENCE WORKSPACE + INVESTIGAÇÃO ASSISTIDA */
            <IntelligenceWorkspaceView 
              currentUser={{ name: 'Diretoria Executiva', role: 'ADMIN', companyScope: 'ALL' }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onSelectOpportunity={(item) => setSelectedOpportunity(item)}
            />
          ) : activeTab === 'simulador-cenarios' ? (
            <IntelligenceConsolidatedView 
              initialSubTab="simulador" 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)} 
            />
          ) : activeTab === 'estrategia-preco' ? (
            <IntelligenceConsolidatedView 
              initialSubTab="estrategia-preco" 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)} 
            />
          ) : activeTab === 'acoes-estrategicas' ? (
            <IntelligenceConsolidatedView 
              initialSubTab="acoes" 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)} 
            />
          ) : activeTab === 'mercado' ? (
            <IntelligenceConsolidatedView 
              initialSubTab="mercado" 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)} 
            />
          ) : activeTab === 'revisao-executiva' ? (
            /* FASE 54: EXECUTIVE OPERATING SYSTEM + WEEKLY BUSINESS REVIEW (WBR) + CADÊNCIA DE GESTÃO */
            <ExecutiveReviewView />
          ) : activeTab === 'laboratorio-cenarios' ? (
            /* FASE 56: STRATEGIC SCENARIO LAB + DIGITAL TWIN DO PIPELINE + SIMULAÇÃO ESTRATÉGICA */
            <StrategicScenarioLabView />
          ) : activeTab === 'recomendacoes-estrategicas' ? (
            /* FASE 57: STRATEGIC RECOMMENDATION ENGINE + RECOMENDAÇÕES EXECUTIVAS EXPLICÁVEIS */
            <StrategicRecommendationsView />
          ) : activeTab === 'memoria-estrategica' ? (
            /* FASE 55: STRATEGIC MEMORY + DECISION INTELLIGENCE + MEMÓRIA INSTITUCIONAL */
            <StrategicMemoryView />
          ) : activeTab === 'expansao-crescimento' ? (
            /* FASE 61: GROWTH & OPPORTUNITY EXPANSION ENGINE + EXPANSÃO COMERCIAL ORIENTADA POR DADOS */
            <GrowthExpansionView 
              currentUser={{ name: 'Diretoria Executiva', role: 'ADMIN', permissions: ['growth.view', 'growth.manage', 'growth.validate', 'growth.group.view', 'growth.financial.view'], companyScope: 'ALL' }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'inteligencia-resultados' ? (
            /* FASE 65: OUTCOME INTELLIGENCE + BID PERFORMANCE BENCHMARK + APRENDIZADO SOBRE RESULTADOS */
            <OutcomeIntelligenceView 
              currentUser={{ 
                name: 'Diretoria Executiva', 
                role: 'ADMIN', 
                permissions: ['outcomes.analytics.view', 'outcomes.financial.view', 'outcomes.group.view', 'outcomes.patterns.manage'], 
                companyScope: 'ALL' 
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'risco-preditivo' ? (
            /* FASE 66: PREDICTIVE READINESS + RISK FORECASTING + PREVISÃO EXPLICÁVEL DE RISCO OPERACIONAL */
            <PredictiveRiskView 
              currentUser={{ 
                name: 'Diretoria Executiva', 
                role: 'ADMIN', 
                permissions: ['predictive_risk.view', 'predictive_risk.analytics', 'predictive_models.view', 'predictive_models.manage', 'predictive_models.approve'], 
                companyScope: 'ALL' 
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'plano-mitigacao' ? (
            /* FASE 67: PRESCRIPTIVE RISK MITIGATION + RECOVERY PLANNER + PLANO INTELIGENTE DE MITIGAÇÃO */
            <RecoveryPlannerView 
              currentUser={{ 
                name: 'Diretoria Executiva', 
                role: 'ADMIN', 
                permissions: ['mitigation.view', 'mitigation.manage', 'mitigation.approve', 'mitigation.financial.view', 'mitigation.group.view'], 
                companyScope: 'ALL' 
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'maturidade-benchmark' ? (
            /* FASE 53: BENCHMARK INTERNO + MODELO DE MATURIDADE + EVOLUÇÃO DO PROCESSO */
            <MaturityBenchmarkView 
              onNavigate={(tab) => setActiveTab(tab)} 
            />
          ) : activeTab === 'command-center' ? (
            <IntelligenceConsolidatedView 
              initialSubTab="command-center" 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)} 
            />
          ) : activeTab === 'radar-antecipado' ? (
            <RadarConsolidatedView 
              initialSubTab="antecipado" 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)} 
              onNavigateToOpportunities={() => setActiveTab('oportunidades')} 
            />
          ) : activeTab === 'relacionamento' ? (
            <CrmRelationshipView />
          ) : activeTab === 'comunicacoes' ? (
            <CommunicationsView />
          ) : activeTab === 'agenda' ? (
            <IntegratedCalendarView />
          ) : activeTab === 'inteligencia' ? (
            /* FASE 24: INTELIGÊNCIA CONSOLIDADA (Item 8: Copilot, Command Center, Performance) */
            <IntelligenceConsolidatedView 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)} 
            />
          ) : activeTab === 'oportunidades' ? (
            <OpportunitiesView 
              onOpenDetailGlobal={(item) => setSelectedOpportunity(item)} 
              selectedCompanyScope={selectedCompanyScope}
            />
          ) : activeTab === 'monitoramento' ? (
            <MonitoringView onNavigateToOpportunities={() => setActiveTab('oportunidades')} />
          ) : activeTab === 'motor-aderencia' ? (
            <SemanticEngineView />
          ) : activeTab === 'alertas' ? (
            <AlertsView 
              onOpenOpportunityDetail={(oppNum) => {
                const item = OpportunityService.listAll().find(o => o.number === String(oppNum)) || priorityOpportunities[0];
                setSelectedOpportunity(item);
              }}
            />
          ) : activeTab === 'prontidao-operacional' ? (
            /* FASE 44: INTELIGÊNCIA DE CAPACIDADE OPERACIONAL + PRONTIDÃO PARA EXECUÇÃO + RESOURCE FIT */
            <ExecutionReadinessView />
          ) : activeTab === 'capacidade-estrategica' ? (
            /* FASE 68: STRATEGIC RESOURCE OPTIMIZATION + PORTFOLIO TRADEOFF ENGINE + PRIORIZAÇÃO DE CAPACIDADE */
            <PortfolioCapacityLabView 
              currentUser={{ 
                name: 'Diretoria Executiva', 
                role: 'ADMIN', 
                permissions: ['capacity_portfolio.view', 'capacity_portfolio.manage', 'capacity_scenarios.create', 'resource_commitments.manage', 'capacity_financial.view', 'capacity_group.view'], 
                companyScope: 'ALL' 
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'expansao-capacidade' ? (
            /* FASE 69: STRATEGIC INVESTMENT & CAPABILITY EXPANSION PLANNER + PLANEJAMENTO DE EXPANSÃO DE CAPACIDADE */
            <CapabilityInvestmentLabView 
              currentUser={{ 
                name: 'Diretoria Executiva', 
                role: 'ADMIN', 
                permissions: ['capability_investment.view', 'capability_investment.manage', 'capability_investment.financial', 'capability_investment.approve', 'capability_investment.group.view'], 
                companyScope: 'ALL' 
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'parceiros-cotacoes' ? (
            /* FASE 45: ECOSSISTEMA DE PARCEIROS + FORNECEDORES + COTAÇÕES ESTRATÉGICAS */
            <SupplierQuotationsView />
          ) : activeTab === 'estrategia-parceria' ? (
            /* FASE 62: PARTNER & CONSORTIUM INTELLIGENCE + ESTRATÉGIA DE PARCERIAS */
            <PartnerStrategyView 
              currentUser={{ 
                name: 'Diretoria Executiva', 
                role: 'ADMIN', 
                permissions: ['partners.strategy.view', 'partners.strategy.manage', 'consortium.view', 'consortium.manage', 'partners.financial.view'], 
                companyScope: 'ALL' 
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'pipeline-financeiro' ? (
            /* FASE 43: INTELIGÊNCIA FINANCEIRA DO PIPELINE + FORECAST + RISCO */
            <FinancialPipelineView 
              onNavigateToReports={() => setActiveTab('relatorios')}
              onSelectOpportunity={(item) => setSelectedOpportunity(item)}
            />
          ) : activeTab === 'planejamento-estrategico' ? (
            /* FASE 42: GESTÃO ESTRATÉGICA DE PORTFÓLIO + PLANEJAMENTO ANUAL */
            <StrategicPlanningView 
              onNavigateToReports={() => setActiveTab('relatorios')}
            />
          ) : activeTab === 'relatorios' ? (
            /* FASE 41: CENTRO DE RELATÓRIOS + BRIEFINGS EXECUTIVOS + GERAÇÃO DE DOCUMENTOS */
            <ReportsCenterView 
              onNavigateToOpportunity={(oppId) => {
                const item = OpportunityService.listAll().find(o => o.id === oppId || o.number === String(oppId)) || priorityOpportunities[0];
                setSelectedOpportunity(item);
                setActiveTab('oportunidades');
              }}
            />
          ) : activeTab === 'decision-board' ? (
            <DecisionBoardView onOpenOpportunityDetail={(oppNum) => {
              const item = OpportunityService.listAll().find(o => o.number === String(oppNum)) || priorityOpportunities[0];
              setSelectedOpportunity(item);
            }} />
          ) : activeTab === 'propostas' ? (
            <ProposalsView onOpenOpportunityDetail={(oppNum) => {
              const item = OpportunityService.listAll().find(o => o.number === String(oppNum)) || priorityOpportunities[0];
              setSelectedOpportunity(item);
            }} />
          ) : activeTab === 'resultados' ? (
            <ResultsIntelligenceView onOpenOpportunityDetail={(oppNum) => {
              const item = OpportunityService.listAll().find(o => o.number === String(oppNum)) || priorityOpportunities[0];
              setSelectedOpportunity(item);
            }} />
          ) : activeTab === 'contratos' ? (
            /* FASE 31: GESTÃO PÓS-VITÓRIA & CONTRATOS */
            <ContractsManagementView 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)}
              onOpenCopilot={() => setCopilotModalOpen(true)}
            />
          ) : activeTab === 'documentos' ? (
            <DocumentVaultView />
          ) : activeTab === 'central-agente' ? (
            /* FASE 38: CENTRO DE CONTROLE DO AGENTE + OPERAÇÃO AUTÔNOMA SUPERVISIONADA */
            <AgentControlCenterView 
              currentUser={{ name: 'Diretoria / Admin', role: 'ADMIN' }}
              onNavigateTo={(tab) => {
                if (tab) setActiveTab(tab);
              }}
            />
          ) : activeTab === 'mission-control' ? (
            /* FASE 59: CONTROL TOWER + MISSION CONTROL + SUPERVISÃO OPERACIONAL CENTRALIZADA */
            <MissionControlView />
          ) : activeTab === 'governanca-autonomia' ? (
            /* FASE 58: AUTONOMOUS OPERATIONS GUARDRAILS + POLICY ENGINE + GOVERNANÇA DE AUTOMAÇÃO */
            <AutonomyGovernanceCenterView />
          ) : activeTab === 'governanca-aprovacoes' ? (
            /* FASE 36: GOVERNANÇA DE DECISÕES, ALÇADAS E EXCEÇÕES */
            <ApprovalInboxView 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)}
              onOpenCopilot={() => setCopilotModalOpen(true)}
            />
          ) : activeTab === 'data-governance' ? (
            /* FASE 48: DATA GOVERNANCE + QUALIDADE DE DADOS + CONFIABILIDADE */
            <DataGovernanceView 
              currentUser={{ name: 'Diretoria / Henrique Veeluen', role: 'ADMIN', companyScope: 'ALL' }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          ) : activeTab === 'fontes' ? (
            /* FASE 63: TENDER INTELLIGENCE NETWORK + COBERTURA INTELIGENTE DE FONTES */
            <TenderNetworkView />
          ) : activeTab === 'automacoes' ? (
            /* FASE 37: AUTOMAÇÃO INTELIGENTE DE WORKFLOWS & EVENTOS */
            <AutomationManagementView 
              onSelectOpportunity={(item) => setSelectedOpportunity(item)}
              onOpenCopilot={() => setCopilotModalOpen(true)}
            />
          ) : activeTab === 'administracao' ? (
            <AdminManagementView onNavigate={(tab) => setActiveTab(tab)} />
          ) : activeTab === 'go-live' ? (
            <GoLiveModuleView onNavigate={(tab) => setActiveTab(tab)} />
          ) : activeTab === 'product-audit' ? (
            <ProductAuditView onNavigate={(tab) => setActiveTab(tab)} />
          ) : activeTab === 'production-readiness' ? (
            <ProductionReadinessView />
          ) : (
            <ModulePlaceholder 
              moduleId={activeTab} 
              onBackToDashboard={() => setActiveTab('dashboard')} 
            />
          )}
        </main>

        {/* Rodapé Corporativo Discreto */}
        <footer className="app-footer">
          <div className="footer-content">
            <span className="footer-brand">
              <strong>Vellia Licitações</strong> • Inteligência que encontra oportunidades antes que elas passem despercebidas.
            </span>
            <div className="footer-meta">
              <span>Portais Conectados: Petronect Público</span>
              <span>•</span>
              <span>Empresas: Excelência Ambiental & Veeluen Solutions</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Drawer Lateral de Análise Detalhada */}
      <OpportunityDrawer
        opportunity={selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
      />

      {/* MÓDULO INTELIGENTE DE ANÁLISE DE EDITAL GLOBAL (FASE 8) */}
      <EditalAnalysisModal 
        opportunityId={selectedEditalAnalysisId}
        isOpen={!!selectedEditalAnalysisId}
        onClose={() => setSelectedEditalAnalysisId(null)}
      />

      {/* MODAL GLOBAL DE ENVIO DE FEEDBACK (FASE 22 - ITEM 24) */}
      <GlobalFeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        currentModule={activeTab}
      />

      {/* MODAL GLOBAL DO VELLIA COPILOT (FASE 24 - ITENS 43 A 46) */}
      <GlobalCopilotModal
        isOpen={copilotModalOpen}
        onClose={() => setCopilotModalOpen(false)}
        activeOpportunity={selectedOpportunity}
        currentModule={activeTab}
        onSelectOpportunity={(item) => setSelectedOpportunity(item)}
      />

      {/* MODAL CONTEXTUAL DA SALA DE GUERRA (FASE 30) */}
      <WarRoomModal
        opportunity={warRoomOpportunity}
        isOpen={!!warRoomOpportunity}
        onClose={() => setWarRoomOpportunity(null)}
        onOpenCopilot={() => setCopilotModalOpen(true)}
      />

      {/* MODAL GLOBAL DE BUSCA UNIVERSAL & KNOWLEDGE GRAPH (FASE 39) */}
      <UniversalSearchModal
        isOpen={universalSearchOpen}
        onClose={() => setUniversalSearchOpen(false)}
        currentUser={{ role: 'ADMIN', companyScope: 'ALL' }}
        onNavigateTo={(tab, params) => {
          setActiveTab(tab);
          if (params?.id) {
            const opp = OpportunityService.listAll().find(o => o.id === params.id || o.number === String(params.id));
            if (opp) setSelectedOpportunity(opp);
          }
        }}
      />
    </div>
  );
}
