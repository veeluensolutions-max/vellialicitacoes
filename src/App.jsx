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
import { Sparkles, Shield, BellRing, Info, Cpu, ArrowRight } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [agentActive, setAgentActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [selectedEditalAnalysisId, setSelectedEditalAnalysisId] = useState(null);
  const [opportunitiesList, setOpportunitiesList] = useState(priorityOpportunities);
  const [lastSyncText, setLastSyncText] = useState(systemMetrics.lastSyncTime);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [copilotModalOpen, setCopilotModalOpen] = useState(false);
  const [warRoomOpportunity, setWarRoomOpportunity] = useState(null);
  const [universalSearchOpen, setUniversalSearchOpen] = useState(false);

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

  const handleRefresh = () => {
    const now = new Date();
    const timeStr = `Hoje às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLastSyncText(timeStr);
  };

  return (
    <div className="app-container">
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
          onNavigateToAlerts={() => setActiveTab('alertas')}
          onOpenFeedback={() => setFeedbackModalOpen(true)}
          onOpenCopilot={() => setCopilotModalOpen(true)}
          onOpenUniversalSearch={() => setUniversalSearchOpen(true)}
        />

        <main className="content-area">
          {activeTab === 'dashboard' ? (
            /* FASE 24: DASHBOARD OPERACIONAL CONSOLIDADO (Itens 11 a 16) */
            <OperationalDashboardView
              onSelectOpportunity={(item) => setSelectedOpportunity(item)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onOpenCopilot={() => setCopilotModalOpen(true)}
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
            <OpportunitiesView onOpenDetailGlobal={(item) => setSelectedOpportunity(item)} />
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
          ) : activeTab === 'parceiros-cotacoes' ? (
            /* FASE 45: ECOSSISTEMA DE PARCEIROS + FORNECEDORES + COTAÇÕES ESTRATÉGICAS */
            <SupplierQuotationsView />
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
