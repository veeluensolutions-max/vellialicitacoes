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
  ExternalLink,
  MessageSquarePlus,
  Sparkles,
  Bot,
  Download,
  Upload,
  Database,
  Zap
} from 'lucide-react';
import { AlertService } from '../services/agent/alertService';
import { AgentOrchestrator, AgentStatus } from '../services/agent/agentOrchestrator';
import { DataBackupService } from '../services/dataBackupService';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import { pncpContinuousIngestionWorker } from '../services/pncp/pncpContinuousIngestionWorker';
import PncpWorkerControlModal from './pncp/PncpWorkerControlModal';
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
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    const refreshAlerts = () => {
      setAlertsList(AlertService.listAlerts(false));
      setUnreadCount(AlertService.getUnreadCount());
    };
    const handleWorkerUpdate = (state) => {
      setWorkerState(state);
    };
    const unsubAlert = EventBus.subscribe(VELLIA_EVENTS.ALERT_TRIGGERED, refreshAlerts);
    const unsubGeneric = EventBus.subscribe('vellia-alerts-updated', refreshAlerts);
    const unsubWorker = EventBus.subscribe('vellia-pncp-worker-status-changed', handleWorkerUpdate);
    return () => {
      unsubAlert();
      unsubGeneric();
      unsubWorker();
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
          <Menu size={22} />
        </button>

        <div className="header-context">
          <div className="header-breadcrumbs">
            <span className="crumb-system">Vellia Licitações</span>
            <span className="crumb-divider">/</span>
            <span className="crumb-active">Painel Geral de Monitoramento</span>
          </div>
          <h1 className="header-title">Radar Comercial & Inteligência</h1>
        </div>
      </div>

      {/* Seletor de Escopo de Empresa (Todas | Veeluen | Excelência Ambiental) */}
      <div className="company-scope-selector">
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('ALL')}
          title="Exibir dados e oportunidades de todas as empresas do grupo"
        >
          Todas
        </button>
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'veeluen-solutions' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('veeluen-solutions')}
          title="Filtrar dados para Veeluen Solutions"
        >
          Veeluen Solutions
        </button>
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'excelencia-ambiental' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('excelencia-ambiental')}
          title="Filtrar dados para Excelência Ambiental"
        >
          Excelência Ambiental
        </button>
      </div>

      {/* Centro: Campo de Busca Universal com Atalho Ctrl+K (Fase 39) */}
      <div 
        className="header-search-wrapper"
        onClick={() => {
          if (onOpenUniversalSearch) onOpenUniversalSearch();
        }}
        style={{ cursor: 'pointer' }}
      >
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="header-search-input"
          placeholder="Buscar oportunidades, organizações, documentos, propostas, contratos..."
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
          <kbd>Ctrl</kbd>+<kbd>K</kbd>
        </div>
      </div>

      {/* Direita: Ações, Status do Agente e Perfil */}
      <div className="header-right">
        {/* Botão de Varredura e Sincronização Multi-fonte Real */}
        <button
          className={`header-sync-btn ${isSyncing ? 'is-syncing' : ''}`}
          onClick={handleManualRefresh}
          disabled={isSyncing}
          title={`Última varredura: ${lastUpdatedText || 'Hoje'}. Clique para executar varredura unificada PNCP & Petronect.`}
        >
          <RefreshCw size={13} className={isSyncing ? 'spinning' : ''} />
          <span>{isSyncing ? 'Varrendo Fontes...' : 'Sincronizar Fontes'}</span>
          {lastUpdatedText && (
            <span className="header-sync-time">{lastUpdatedText}</span>
          )}
        </button>

        {/* Worker de Ingestão Contínua do PNCP */}
        <button
          className={`header-pncp-worker-btn status-${workerState?.status?.toLowerCase() || 'active'}`}
          onClick={() => setPncpModalOpen(true)}
          title="Supervisão e Controle do Worker de Ingestão Contínua do PNCP"
        >
          <span className={workerState?.status === 'ACTIVE' || workerState?.status === 'INGESTING' ? 'pulse-indicator' : 'paused-indicator'} />
          <Zap size={12} />
          <span>Worker PNCP</span>
          <span className="worker-counter-badge">+{workerState?.totalNew || 0}</span>
        </button>

        {/* Status de Varredura e Conectividade */}
        <div className="agent-status-container">
          <button
            onClick={() => setAgentActive(!agentActive)}
            className={`agent-status-pill ${agentActive ? 'status-active' : 'status-paused'}`}
            title="Alternar monitoramento contínuo"
          >
            <span className={agentActive ? 'pulse-indicator' : 'paused-indicator'} />
            <span className="agent-status-text">
              {agentActive ? 'Monitoramento Ativo' : 'Monitoramento Pausado'}
            </span>
            <Power size={11} className="agent-power-icon" />
          </button>
        </div>

        {/* Assistente Estratégico de Licitações */}
        <button
          className="header-copilot-btn"
          onClick={onOpenCopilot}
          title="Consulta assistida sobre termos de referência, regras e prazos"
        >
          <Sparkles size={14} />
          <span>Assistente Estratégico</span>
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
    </header>
  );
}
