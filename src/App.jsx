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
import ExecutiveDecisionsWidget from './components/ExecutiveDecisionsWidget';
import EditalAnalysisModal from './components/EditalAnalysisModal';
import ModulePlaceholder from './components/ModulePlaceholder';
import { OpportunityService } from './services/opportunityService';
import { priorityOpportunities, systemMetrics } from './data/mockData';
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

  const handleRefresh = () => {
    const now = new Date();
    const timeStr = `Hoje às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setLastSyncText(timeStr);
  };

  return (
    <div className="app-container">
      {/* Sidebar Lateral */}
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
        />

        <main className="content-area">
          {activeTab === 'dashboard' ? (
            <>
              {/* Banner Corporativo de Boas-Vindas & Status */}
              <div className="welcome-banner">
                <div className="welcome-content">
                  <div className="welcome-tag">
                    <Sparkles size={13} />
                    <span>Ambiente Corporativo Vellia</span>
                  </div>
                  <h2 className="welcome-title">
                    Inteligência Comercial & Monitoramento Estratégico
                  </h2>
                  <p className="welcome-desc">
                    O agente inteligente está varrendo o portal <strong>Petronect</strong> e identificando licitações de alta compatibilidade para a <strong>Excelência Ambiental</strong> e <strong>Veeluen Solutions</strong> antes que passem despercebidas.
                  </p>
                </div>

                <div className="welcome-status-card">
                  <div className="status-card-inner">
                    <span className="status-card-label">Status da Operação</span>
                    <div className="status-card-indicator">
                      <span className={agentActive ? 'pulse-indicator' : 'paused-indicator'} />
                      <span className="status-card-text">
                        {agentActive ? 'Varredura Contínua Ativa' : 'Varredura em Pausa Manual'}
                      </span>
                    </div>
                    <span className="status-card-info">
                      Próxima checagem agendada em 24 minutos
                    </span>
                    <button 
                      className="btn-quick-engine"
                      onClick={() => setActiveTab('motor-aderencia')}
                    >
                      <Cpu size={13} />
                      <span>Ver Motor de Aderência</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* FASE 7 — NÚCLEO CENTRAL DO VELLIA AGENT (Itens 28, 29 e 30) */}
              <VelliaAgentCard 
                onNavigateToReports={() => setActiveTab('relatorios')}
                onNavigateToAlerts={() => setActiveTab('alertas')}
              />

              {/* Cards de Métricas Principais */}
              <MetricsCards 
                onFilterStatus={(cardId) => {
                  if (cardId === 'high-priority') {
                    // focar na tabela
                    const el = document.querySelector('.priorities-table-card');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
              />

              {/* Card Principal: Radar de Oportunidades */}
              <RadarSection />

              {/* FASE 6 — Widgets Petronect Hoje e Radar de Prazos (Itens 33 e 34) */}
              <PetronectDashboardWidgets 
                onSelectOpportunity={(item) => setSelectedOpportunity(item)}
                onNavigateToMonitoring={() => setActiveTab('monitoramento')}
                onNavigateToOpportunities={() => setActiveTab('oportunidades')}
              />

              {/* FASE 10 — Painel Executivo: Decisões da Semana (Item 46) */}
              <ExecutiveDecisionsWidget 
                onNavigateToDecisionBoard={() => setActiveTab('decision-board')}
              />

              {/* Tabela de Prioridades */}
              <PrioritiesTable
                opportunities={opportunitiesList}
                onSelectOpportunity={(item) => setSelectedOpportunity(item)}
                externalSearchQuery={searchQuery}
              />
            </>
          ) : activeTab === 'command-center' ? (
            <CommandCenterView onNavigateToDetail={(item) => setSelectedOpportunity(item)} />
          ) : activeTab === 'radar-antecipado' ? (
            <EarlyRadarView />
          ) : activeTab === 'relacionamento' ? (
            <CrmRelationshipView />
          ) : activeTab === 'comunicacoes' ? (
            <CommunicationsView />
          ) : activeTab === 'agenda' ? (
            <IntegratedCalendarView />
          ) : activeTab === 'inteligencia' ? (
            <IntelligenceCopilotView onOpenOpportunityDetail={(oppNum) => {
              const item = OpportunityService.listAll().find(o => o.number === String(oppNum) || o.id === String(oppNum)) || priorityOpportunities[0];
              setSelectedOpportunity(item);
            }} />
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
    </div>
  );
}
