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
import DailyReportView from './components/DailyReportView';
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
          ) : activeTab === 'relatorios' ? (
            <DailyReportView 
              onOpenOpportunityDetail={(oppNum) => {
                const item = OpportunityService.listAll().find(o => o.number === String(oppNum)) || priorityOpportunities[0];
                setSelectedOpportunity(item);
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
          ) : activeTab === 'documentos' ? (
            <DocumentVaultView />
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
    </div>
  );
}
