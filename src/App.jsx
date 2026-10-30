import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import OpportunitiesView from './components/OpportunitiesView';
import RadarConsolidatedView from './components/RadarConsolidatedView';
import ConnectedPortalsView from './components/ConnectedPortalsView';
import AccessManagementView from './components/AccessManagementView';
import LoginView from './components/LoginView';
import { authAccessService } from './services/authAccessService';
import { OpportunityService } from './services/opportunityService';
import { opportunityRepository } from './services/opportunityRepository';
import { MultiSourceSyncManager } from './services/multisource/multiSourceSyncManager';
import { EventBus, VELLIA_EVENTS } from './services/eventBus';
import { pncpContinuousIngestionWorker } from './services/pncp/pncpContinuousIngestionWorker';
import { petronectContinuousIngestionWorker } from './services/petronect/petronectContinuousIngestionWorker';
import { comprasGovContinuousIngestionWorker } from './services/comprasgov/comprasGovContinuousIngestionWorker';
import { cloudSyncService } from './services/cloud/cloudSyncService';
import { Sparkles } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('radar');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastSyncText, setLastSyncText] = useState(() => {
    const d = new Date();
    return `Hoje às ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(null);
  const [selectedCompanyScope, setSelectedCompanyScope] = useState(() => {
    return localStorage.getItem('vellia_selected_company_scope') || 'ALL';
  });
  const [currentUser, setCurrentUser] = useState(() => authAccessService.getCurrentSession());

  const handleSelectCompanyScope = (scope) => {
    setSelectedCompanyScope(scope);
    localStorage.setItem('vellia_selected_company_scope', scope);
    EventBus.emit('vellia-company-scope-changed', { scope });
  };

  const handleLogout = () => {
    authAccessService.logout();
    setCurrentUser(null);
  };

  const handleLoginSuccess = (loggedUser) => {
    setCurrentUser(loggedUser);
    if (loggedUser?.companyScope && loggedUser.companyScope !== 'ALL') {
      handleSelectCompanyScope(loggedUser.companyScope);
    }
  };

  // Monitoramento em background dos portais (PNCP, Petronect, Compras.gov e sincronização Supabase)
  useEffect(() => {
    opportunityRepository.purgeDemoData();
    cloudSyncService.start(20);
    pncpContinuousIngestionWorker.start(10);

    return () => {
      pncpContinuousIngestionWorker.pause();
      petronectContinuousIngestionWorker.pause();
      comprasGovContinuousIngestionWorker.pause();
      cloudSyncService.stop();
    };
  }, []);

  // Listener para navegação contextual entre Radar e Editais
  useEffect(() => {
    const handleNavigateTab = (e) => {
      const { tab, companyScope, company, searchQuery: nextSearch, decisionFilter } = e.detail || {};
      if (companyScope) {
        handleSelectCompanyScope(companyScope);
      }
      if (nextSearch !== undefined) {
        setSearchQuery(nextSearch);
      }
      if (tab) {
        setActiveTab(
          tab === 'oportunidades'
            ? 'oportunidades'
            : tab === 'portais'
            ? 'portais'
            : tab === 'acessos'
            ? 'acessos'
            : 'radar'
        );
      }
      if (company || nextSearch !== undefined || decisionFilter) {
        setTimeout(() => {
          EventBus.emit('vellia-filter-opportunities', { company, searchQuery: nextSearch, decisionFilter });
          window.dispatchEvent(new CustomEvent('vellia-filter-opportunities', { 
            detail: { company, searchQuery: nextSearch, decisionFilter } 
          }));
        }, 50);
      }
    };
    window.addEventListener('vellia-navigate-tab', handleNavigateTab);
    return () => window.removeEventListener('vellia-navigate-tab', handleNavigateTab);
  }, []);

  // Sincronização e Varredura Multi-fonte (PNCP + Compras.gov.br + Petronect)
  const handleRefresh = async (options = {}) => {
    if (isSyncing) return;
    setIsSyncing(true);
    const isReset = options?.reset === true;
    setSyncToast({
      type: 'info',
      message: 'Buscando editais nos portais PNCP, Compras.gov.br e Petronect...'
    });

    try {
      const summary = isReset
        ? await MultiSourceSyncManager.resetAndActivateRealData()
        : await MultiSourceSyncManager.runFullMultiSourceSweep();

      const now = new Date();
      const timeStr = `Hoje às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setLastSyncText(timeStr);
      EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, OpportunityService.listAll());

      const totalNew = summary.totalOpportunities || summary.totalNew || 0;
      setSyncToast({
        type: 'success',
        message: `Busca concluída! ${totalNew} editais sincronizados para as duas empresas.`
      });
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err) {
      console.error('Erro na sincronização multi-fonte:', err);
      setSyncToast({
        type: 'error',
        message: `Aviso na busca: ${err.message || 'Falha de conexão externa'}. Dados mantidos.`
      });
      setTimeout(() => setSyncToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Toast flutuante de busca */}
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
          maxWidth: '420px'
        }}>
          <Sparkles size={16} color={syncToast.type === 'success' ? '#34d399' : syncToast.type === 'error' ? '#f87171' : '#38bdf8'} />
          <span>{syncToast.message}</span>
        </div>
      )}

      {/* Menu Lateral Simplificado */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        selectedCompanyScope={selectedCompanyScope}
        onSelectCompanyScope={handleSelectCompanyScope}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Área Principal */}
      <div className="main-wrapper">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          lastUpdatedText={lastSyncText}
          onRefresh={handleRefresh}
          isSyncing={isSyncing}
          selectedCompanyScope={selectedCompanyScope}
          onSelectCompanyScope={handleSelectCompanyScope}
          onSearchSubmit={() => setActiveTab('oportunidades')}
        />

        <main className="content-area">
          {activeTab === 'oportunidades' ? (
            <OpportunitiesView
              selectedCompanyScope={selectedCompanyScope}
              externalSearchQuery={searchQuery}
              onSelectCompanyScope={handleSelectCompanyScope}
            />
          ) : activeTab === 'portais' ? (
            <ConnectedPortalsView
              onRefreshAll={handleRefresh}
              isGlobalSyncing={isSyncing}
              onNavigateToOpportunities={(filters) => {
                if (filters?.companyScope) {
                  handleSelectCompanyScope(filters.companyScope);
                }
                if (filters?.searchQuery !== undefined) {
                  setSearchQuery(filters.searchQuery);
                }
                setActiveTab('oportunidades');
                if (filters?.company || filters?.searchQuery !== undefined) {
                  setTimeout(() => {
                    EventBus.emit('vellia-filter-opportunities', {
                      company: filters.company,
                      searchQuery: filters.searchQuery
                    });
                    window.dispatchEvent(new CustomEvent('vellia-filter-opportunities', {
                      detail: { company: filters.company, searchQuery: filters.searchQuery }
                    }));
                  }, 50);
                }
              }}
            />
          ) : activeTab === 'acessos' ? (
            <AccessManagementView
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          ) : (
            <RadarConsolidatedView
              selectedCompanyScope={selectedCompanyScope}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onRefresh={handleRefresh}
              isSyncing={isSyncing}
              onNavigateToOpportunities={(filters) => {
                if (filters?.companyScope) {
                  handleSelectCompanyScope(filters.companyScope);
                }
                if (filters?.searchQuery !== undefined) {
                  setSearchQuery(filters.searchQuery);
                }
                setActiveTab('oportunidades');
                if (filters?.company || filters?.searchQuery !== undefined) {
                  setTimeout(() => {
                    EventBus.emit('vellia-filter-opportunities', {
                      company: filters.company,
                      searchQuery: filters.searchQuery
                    });
                    window.dispatchEvent(new CustomEvent('vellia-filter-opportunities', {
                      detail: { company: filters.company, searchQuery: filters.searchQuery }
                    }));
                  }, 50);
                }
              }}
            />
          )}
        </main>

        {/* Rodapé Simples */}
        <footer className="app-footer">
          <div className="footer-content">
            <span className="footer-brand">
              <strong>Vellia Licitações</strong> • Radar de Serviços & Editais para Concorrer
            </span>
            <div className="footer-meta">
              <span>Portais: Petronect, PNCP & Compras.gov.br</span>
              <span>•</span>
              <span>Veeluen Solutions & Excelência Ambiental</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
