import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  RefreshCw, 
  Power, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  ChevronDown,
  User,
  Shield,
  ShieldCheck,
  ExternalLink,
  MessageSquarePlus,
  Sparkles,
  Bot,
  Download,
  Upload,
  Database,
  Zap,
  Cloud,
  Radio,
  Building2
} from 'lucide-react';
import { AlertService } from '../services/agent/alertService';
import { AgentOrchestrator, AgentStatus } from '../services/agent/agentOrchestrator';
import { DataBackupService } from '../services/dataBackupService';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import { pncpContinuousIngestionWorker } from '../services/pncp/pncpContinuousIngestionWorker';
import { petronectContinuousIngestionWorker } from '../services/petronect/petronectContinuousIngestionWorker';
import { comprasGovContinuousIngestionWorker } from '../services/comprasgov/comprasGovContinuousIngestionWorker';
import { cloudSyncService } from '../services/cloud/cloudSyncService';
import PncpWorkerControlModal from './pncp/PncpWorkerControlModal';
import PetronectWorkerControlModal from './petronect/PetronectWorkerControlModal';
import ComprasGovWorkerControlModal from './comprasgov/ComprasGovWorkerControlModal';
import CloudSyncModal from './cloud/CloudSyncModal';
import CndManagementModal from './cnd/CndManagementModal';
import { cndMonitoringService } from '../services/cnd/cndMonitoringService';
import './Header.css';

export default function Header({ 
  agentActive, 
  setAgentActive, 
  searchQuery, 
  setSearchQuery, 
  onToggleMobile,
  lastUpdatedText,
  onRefresh,
  onNavigateToAlerts,
  onOpenFeedback,
  onOpenCopilot,
  onOpenUniversalSearch,
  isSyncing = false,
  selectedCompanyScope = 'ALL',
  onSelectCompanyScope,
  goLivePhase = 'PILOTO COM DADOS REAIS'
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [alertsList, setAlertsList] = useState(() => AlertService.listAlerts(false));
  const [unreadCount, setUnreadCount] = useState(() => AlertService.getUnreadCount());
  const [backupToast, setBackupToast] = useState(null);
  const [pncpModalOpen, setPncpModalOpen] = useState(false);
  const [workerState, setWorkerState] = useState(() => pncpContinuousIngestionWorker.getState());
  const [petroModalOpen, setPetroModalOpen] = useState(false);
  const [petroWorkerState, setPetroWorkerState] = useState(() => petronectContinuousIngestionWorker.getState());
  const [cgovModalOpen, setCgovModalOpen] = useState(false);
  const [cgovWorkerState, setCgovWorkerState] = useState(() => comprasGovContinuousIngestionWorker.getState());
  const [cloudModalOpen, setCloudModalOpen] = useState(false);
  const [cloudState, setCloudState] = useState(() => cloudSyncService.getState());
  const [cndModalOpen, setCndModalOpen] = useState(false);
  const [showStatusHub, setShowStatusHub] = useState(false);
  const statusHubRef = React.useRef(null);
  const fileInputRef = React.useRef(null);

  // Fecha menus ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusHubRef.current && !statusHubRef.current.contains(e.target)) {
        setShowStatusHub(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalNewOpportunities = (workerState?.totalNew || 0) + (petroWorkerState?.totalNew || 0) + (cgovWorkerState?.totalNew || 0);

  React.useEffect(() => {
    const refreshAlerts = () => {
      setAlertsList(AlertService.listAlerts(false));
      setUnreadCount(AlertService.getUnreadCount());
    };
    const handleWorkerUpdate = (state) => {
      setWorkerState(state);
    };
    const handlePetroWorkerUpdate = (state) => {
      setPetroWorkerState(state);
    };
    const handleCgovWorkerUpdate = (state) => {
      setCgovWorkerState(state);
    };
    const handleCloudUpdate = (state) => {
      setCloudState(state);
    };
    const handleCndUpdate = () => {
      setCndHealth(cndMonitoringService.getCompanyCertificates('excelencia-ambiental'));
    };
    const unsubAlert = EventBus.subscribe(VELLIA_EVENTS.ALERT_TRIGGERED, refreshAlerts);
    const unsubGeneric = EventBus.subscribe('vellia-alerts-updated', refreshAlerts);
    const unsubWorker = EventBus.subscribe('vellia-pncp-worker-status-changed', handleWorkerUpdate);
    const unsubPetroWorker = EventBus.subscribe('vellia-petronect-worker-status-changed', handlePetroWorkerUpdate);
    const unsubCgovWorker = EventBus.subscribe('vellia-comprasgov-worker-status-changed', handleCgovWorkerUpdate);
    const unsubCloud = EventBus.subscribe('vellia-cloud-sync-status-changed', handleCloudUpdate);
    const unsubCnd = EventBus.subscribe('vellia-cnds-updated', handleCndUpdate);
    return () => {
      unsubAlert();
      unsubGeneric();
      unsubWorker();
      unsubPetroWorker();
      unsubCgovWorker();
      unsubCloud();
      unsubCnd();
    };
  }, []);

  const handleManualRefresh = () => {
    if (onRefresh && !isSyncing) onRefresh();
  };

  const handleExportBackup = () => {
    try {
      const res = DataBackupService.exportSnapshot();
      setBackupToast({
        type: 'success',
        message: `Backup baixado: ${res.filename}`
      });
      setTimeout(() => setBackupToast(null), 4000);
      setShowUserMenu(false);
    } catch (err) {
      setBackupToast({
        type: 'error',
        message: `Falha ao exportar backup: ${err.message}`
      });
      setTimeout(() => setBackupToast(null), 4000);
    }
  };

  const handleFileRestoreSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        const res = await DataBackupService.importSnapshot(text);
        setBackupToast({
          type: 'success',
          message: `Backup restaurado com sucesso! ${res.importedKeys} coleções reestabelecidas.`
        });
        setTimeout(() => setBackupToast(null), 5000);
        setShowUserMenu(false);
      } catch (err) {
        setBackupToast({
          type: 'error',
          message: `Falha na restauração: ${err.message}`
        });
        setTimeout(() => setBackupToast(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="app-header">
      {/* Botão Hambúrguer Mobile + Marca Mobile */}
      <div className="header-left">
        <button 
          className="mobile-menu-trigger" 
          onClick={onToggleMobile}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-context">
          <div className="header-breadcrumbs">
            <span className="crumb-system">Vellia</span>
            <span className="crumb-divider">/</span>
            <span className="crumb-active">Licitações & Contratos</span>
          </div>
          <h1 className="header-title">Radar Comercial & Inteligência</h1>
        </div>
      </div>

      {/* Seletor de Escopo de Empresa Segmented Control Estilo Linear */}
      <div className="company-scope-selector">
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('ALL')}
          title="Exibir dados consolidados de todas as empresas do grupo"
        >
          Todas
        </button>
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'veeluen-solutions' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('veeluen-solutions')}
          title="Filtrar dados para Veeluen Solutions (Engenharia & Automação)"
        >
          Veeluen Solutions
        </button>
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'excelencia-ambiental' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('excelencia-ambiental')}
          title="Filtrar dados para Excelência Ambiental (Consultoria & Amostragem)"
        >
          Excelência Ambiental
        </button>
      </div>

      {/* Centro: Campo de Busca Universal com Atalho Ctrl+K */}
      <div 
        className="header-search-wrapper"
        onClick={() => {
          if (onOpenUniversalSearch) onOpenUniversalSearch();
        }}
        style={{ cursor: 'pointer' }}
      >
        <Search size={14} className="search-icon" />
        <input
          type="text"
          className="header-search-input"
          placeholder="Buscar oportunidades, editais, atas, PNCP ou CNPJ..."
          value={searchQuery}
          onFocus={(e) => {
            e.target.blur();
            if (onOpenUniversalSearch) onOpenUniversalSearch();
          }}
          readOnly
        />
        <div className="search-shortcut" onClick={(e) => {
          e.stopPropagation();
          if (onOpenUniversalSearch) onOpenUniversalSearch();
        }}>
          <kbd>Ctrl</kbd><kbd>K</kbd>
        </div>
      </div>

      {/* Direita: Controles Executivos Agrupados e Hub Operacional */}
      <div className="header-right">
        {/* Hub de Status Operacional e Conectividade Unificado */}
        <div className="status-hub-container" ref={statusHubRef}>
          <button
            className={`status-hub-trigger ${showStatusHub ? 'is-active' : ''}`}
            onClick={() => {
              setShowStatusHub(!showStatusHub);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            title="Clique para visualizar e gerenciar o status das fontes de certames e banco em nuvem"
          >
            <span className={`hub-pulse-dot ${agentActive ? 'online' : 'paused'}`} />
            <span className="hub-trigger-text">Fontes de Dados</span>
            <span className="hub-trigger-sources">4 ativas</span>
            {totalNewOpportunities > 0 && (
              <span className="hub-trigger-badge">+{totalNewOpportunities}</span>
            )}
            <ChevronDown size={13} className={`hub-chevron ${showStatusHub ? 'rotate' : ''}`} />
          </button>

          {showStatusHub && (
            <div className="status-hub-popover">
              <div className="hub-popover-header">
                <div>
                  <div className="hub-popover-title">Central de Conectividade</div>
                  <div className="hub-popover-subtitle">Fontes de ingestão contínua e banco em nuvem</div>
                </div>
                <button
                  className={`hub-sync-action-btn ${isSyncing ? 'is-syncing' : ''}`}
                  onClick={handleManualRefresh}
                  disabled={isSyncing}
                  title="Executar varredura em todas as fontes agora"
                >
                  <RefreshCw size={12} className={isSyncing ? 'spinning' : ''} />
                  <span>{isSyncing ? 'Varrendo...' : 'Sincronizar'}</span>
                </button>
              </div>

              <div className="hub-sources-list">
                {/* 1. Petronect / Petrobras */}
                <div className="hub-source-row">
                  <div className="hub-source-info">
                    <div className="hub-icon-box petro">
                      <Radio size={14} />
                    </div>
                    <div>
                      <div className="hub-source-name">Petronect (Petrobras)</div>
                      <div className="hub-source-desc">
                        <span className="hub-state-tag tag-live">Ao Vivo</span>
                        <span className="hub-metric">+{petroWorkerState?.totalNew || 0} novos</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="hub-config-btn"
                    onClick={() => {
                      setPetroModalOpen(true);
                      setShowStatusHub(false);
                    }}
                  >
                    Gerenciar
                  </button>
                </div>

                {/* 2. Compras.gov.br */}
                <div className="hub-source-row">
                  <div className="hub-source-info">
                    <div className="hub-icon-box cgov">
                      <Building2 size={14} />
                    </div>
                    <div>
                      <div className="hub-source-name">Compras.gov.br (Federal)</div>
                      <div className="hub-source-desc">
                        <span className="hub-state-tag tag-live">Ao Vivo</span>
                        <span className="hub-metric">+{cgovWorkerState?.totalNew || 0} novos</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="hub-config-btn"
                    onClick={() => {
                      setCgovModalOpen(true);
                      setShowStatusHub(false);
                    }}
                  >
                    Gerenciar
                  </button>
                </div>

                {/* 3. PNCP Federal */}
                <div className="hub-source-row">
                  <div className="hub-source-info">
                    <div className="hub-icon-box pncp">
                      <Zap size={14} />
                    </div>
                    <div>
                      <div className="hub-source-name">PNCP Nacional</div>
                      <div className="hub-source-desc">
                        <span className="hub-state-tag tag-active">Ativo</span>
                        <span className="hub-metric">+{workerState?.totalNew || 0} novos</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="hub-config-btn"
                    onClick={() => {
                      setPncpModalOpen(true);
                      setShowStatusHub(false);
                    }}
                  >
                    Gerenciar
                  </button>
                </div>

                {/* 4. Supabase Cloud (PostgreSQL / WebSockets) */}
                <div className="hub-source-row">
                  <div className="hub-source-info">
                    <div className="hub-icon-box cloud">
                      <Cloud size={14} />
                    </div>
                    <div>
                      <div className="hub-source-name">Supabase PostgreSQL</div>
                      <div className="hub-source-desc">
                        <span className={`hub-state-tag ${cloudState?.status === 'CONNECTED' ? 'tag-cloud' : 'tag-local'}`}>
                          {cloudState?.status === 'CONNECTED' ? (cloudState?.realtime?.isSubscribed ? 'WebSockets Realtime' : 'Conectado') : 'Modo Local'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="hub-config-btn"
                    onClick={() => {
                      setCloudModalOpen(true);
                      setShowStatusHub(false);
                    }}
                  >
                    Nuvem
                  </button>
                </div>
              </div>

              {/* Rodapé do Hub: Toggle de Monitoramento e Horário */}
              <div className="hub-popover-footer">
                <button
                  className={`hub-toggle-agent-btn ${agentActive ? 'active' : 'paused'}`}
                  onClick={() => setAgentActive(!agentActive)}
                  title="Alternar ingestão autônoma em segundo plano"
                >
                  <Power size={11} />
                  <span>{agentActive ? 'Monitoramento Contínuo: Ativo' : 'Monitoramento: Pausado'}</span>
                </button>
                <div className="hub-sync-timestamp">
                  {lastUpdatedText ? `Atualizado: ${lastUpdatedText}` : 'Sincronizado'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Central de CNDs e Regularidade Fiscal */}
        <button
          className={`header-cnd-btn ${cndHealth.isEligibleForBidding ? 'status-ok' : 'status-alert'}`}
          onClick={() => setCndModalOpen(true)}
          title={`Central de CNDs: ${cndHealth.isEligibleForBidding ? 'Empresas 100% Regulares para Licitar' : 'Alerta de CND Vencendo/Vencida'}. Clique para gerenciar certidões.`}
        >
          <ShieldCheck size={14} className={cndHealth.isEligibleForBidding ? 'text-emerald-400' : 'text-amber-400'} />
          <span>CNDs Fiscais</span>
          <span className={`cnd-counter-badge ${cndHealth.expiringCount > 0 ? 'badge-warn' : ''}`}>
            {cndHealth.expiringCount > 0 ? `! ${cndHealth.expiringCount}` : 'OK'}
          </span>
        </button>

        {/* Assistente Estratégico de Licitações (IA) */}
        <button
          className="header-copilot-btn"
          onClick={onOpenCopilot}
          title="Consulta assistida com IA sobre termos de referência, regras e prazos"
        >
          <Sparkles size={14} />
          <span>Copilot IA</span>
        </button>

        {/* Feedback da Operação */}
        <button
          className="header-feedback-trigger-btn"
          onClick={onOpenFeedback}
          title="Enviar apontamento ou sugestão operacional"
        >
          <MessageSquarePlus size={14} />
          <span>Feedback</span>
        </button>

        {/* Notificações */}
        <div className="notif-wrapper">
          <button
            className={`notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="Notificações"
          >
            <Bell size={17} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <div className="notif-header-title">
                  <span>Alertas Operacionais</span>
                  <span className="notif-count-pill">{unreadCount} novos</span>
                </div>
                <span className="notif-portal-tag">Petronect & PNCP</span>
              </div>
              <div className="notif-dropdown-body">
                {alertsList.slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    className={`notif-item ${!item.read ? 'unread' : ''}`}
                    onClick={() => {
                      AlertService.markAsRead(item.id);
                      setUnreadCount(AlertService.getUnreadCount());
                      if (onNavigateToAlerts) onNavigateToAlerts();
                      setShowNotifications(false);
                    }}
                  >
                    <div className="notif-item-top">
                      <span className={`notif-type-tag type-${item.level?.toLowerCase()}`}>
                        {item.level === 'CRITICAL' ? 'Crítico' : item.level === 'HIGH' ? 'Prazo' : 'Informativo'}
                      </span>
                      <span className="notif-time mono">{new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <h4 className="notif-item-title">{item.title}</h4>
                    <p className="notif-item-desc">{item.message || item.desc}</p>
                  </div>
                ))}
              </div>
              <div 
                className="notif-dropdown-footer" 
                onClick={() => {
                  if (onNavigateToAlerts) onNavigateToAlerts();
                  setShowNotifications(false);
                }}
              >
                <span>Ver todos os alertas configurados</span>
              </div>
            </div>
          )}
        </div>

        {/* Avatar do Usuário & Perfil */}
        <div className="user-profile-wrapper">
          <button 
            className="user-profile-btn"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <div className="user-avatar-badge">
              <span className="avatar-initials">VL</span>
              <span className="avatar-online-dot" />
            </div>
            <div className="user-meta">
              <span className="user-name">Equipe Comercial</span>
              <span className="user-role">Vellia Operações</span>
            </div>
            <ChevronDown size={14} className="user-chevron" />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <p className="dropdown-user-name">Equipe Comercial Vellia</p>
                <p className="dropdown-user-email">licitacoes@vellia.com.br</p>
                <div className="dropdown-role-pill">
                  <Shield size={12} /> Gestor Master
                </div>
              </div>
              <div className="dropdown-divider" />
              <div className="user-dropdown-body">
                <div className="dropdown-item">
                  <User size={15} /> Perfil Corporativo
                </div>
                <div className="dropdown-item">
                  <SlidersHorizontal size={15} /> Preferências do Agente
                </div>

                <div className="dropdown-divider" style={{ margin: '6px 0' }} />

                {/* AÇÕES DE SEGURANÇA E BACKUP (URGÊNCIA 5) */}
                <div 
                  className="dropdown-item" 
                  onClick={handleExportBackup}
                  style={{ cursor: 'pointer', color: '#38BDF8' }}
                  title="Baixa um arquivo JSON com todas as oportunidades, decisões, documentos e propostas"
                >
                  <Download size={15} /> Fazer Backup Completo (JSON)
                </div>

                <div 
                  className="dropdown-item" 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer', color: '#34D399' }}
                  title="Restaura a base de dados a partir de um arquivo de backup JSON previamente exportado"
                >
                  <Upload size={15} /> Restaurar Base de Dados
                </div>

                {/* Input escondido para upload de arquivo de restauração */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileRestoreSelect} 
                  accept=".json,application/json" 
                  style={{ display: 'none' }} 
                />

                <div className="dropdown-divider" style={{ margin: '6px 0' }} />

                <div className="dropdown-item">
                  <ExternalLink size={15} /> Portal Petronect Público
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast de Backup / Restauração */}
      {backupToast && (
        <div style={{
          position: 'fixed',
          top: '75px',
          right: '80px',
          zIndex: 9999,
          background: backupToast.type === 'success' ? '#064e3b' : '#7f1d1d',
          color: '#ffffff',
          border: backupToast.type === 'success' ? '1px solid #10b981' : '1px solid #ef4444',
          borderRadius: '8px',
          padding: '10px 16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.82rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <Database size={15} />
          <span>{backupToast.message}</span>
        </div>
      )}

      {/* Modal de Controle do Worker de Ingestão Contínua do PNCP */}
      <PncpWorkerControlModal
        isOpen={pncpModalOpen}
        onClose={() => setPncpModalOpen(false)}
      />

      {/* Modal de Controle do Worker Autônomo Petronect */}
      <PetronectWorkerControlModal
        isOpen={petroModalOpen}
        onClose={() => setPetroModalOpen(false)}
      />

      {/* Modal de Controle do Worker Autônomo Compras.gov.br */}
      <ComprasGovWorkerControlModal
        isOpen={cgovModalOpen}
        onClose={() => setCgovModalOpen(false)}
      />

      {/* Modal de Sincronização em Nuvem (Supabase / PostgreSQL) */}
      <CloudSyncModal
        isOpen={cloudModalOpen}
        onClose={() => setCloudModalOpen(false)}
      />

      {/* Modal da Central de CNDs e Regularidade Fiscal */}
      <CndManagementModal
        isOpen={cndModalOpen}
        onClose={() => setCndModalOpen(false)}
      />
    </header>
  );
}
