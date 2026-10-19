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
  Bot
} from 'lucide-react';
import { AlertService } from '../services/agent/alertService';
import { AgentOrchestrator, AgentStatus } from '../services/agent/agentOrchestrator';
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
  goLivePhase = 'PILOTO COM DADOS REAIS'
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const realAlerts = AlertService.listAlerts(false);
  const unreadCount = AlertService.getUnreadCount();

  const handleManualRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      if (onRefresh) onRefresh();
    }, 800);
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
        {/* Status do Agente Discreto (Alternável: Ativo vs Pausado) */}
        <div className="agent-status-container">
          <button
            onClick={() => setAgentActive(!agentActive)}
            className={`agent-status-pill ${agentActive ? 'status-active' : 'status-paused'}`}
            title="Alternar varredura do agente de inteligência"
          >
            <span className={agentActive ? 'pulse-indicator' : 'paused-indicator'} />
            <span className="agent-status-text">
              {agentActive ? 'Varredura ativa' : 'Pausado'}
            </span>
            <Power size={12} className="agent-power-icon" />
          </button>
        </div>

        {/* Botão Global Vellia Copilot (Quiet Intelligence) */}
        <button
          className="header-copilot-btn"
          onClick={onOpenCopilot}
          title="Perguntar ao Vellia: dúvidas sobre editais, prazos ou regras"
        >
          <Bot size={15} />
          <span>Perguntar ao Vellia</span>
        </button>

        {/* Botão Global de Feedback da Operação (Fase 22 - Item 24) */}
        <button
          className="header-feedback-trigger-btn"
          onClick={onOpenFeedback}
          title="Enviar feedback da operação, relatar sugestão ou dado divergente"
        >
          <MessageSquarePlus size={15} />
          <span>Feedback</span>
        </button>

        {/* Ícone de Notificações com Dropdown */}
        <div className="notif-wrapper">
          <button
            className={`notif-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="Notificações"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-dropdown-header">
                <div className="notif-header-title">
                  <span>Alertas Inteligentes</span>
                  <span className="notif-count-pill">{unreadCount} novos</span>
                </div>
                <span className="notif-portal-tag">Petronect Realtime</span>
              </div>
              <div className="notif-dropdown-body">
                {realAlerts.slice(0, 5).map((item) => (
                  <div 
                    key={item.id} 
                    className={`notif-item ${!item.read ? 'unread' : ''}`}
                    onClick={() => {
                      AlertService.markAsRead(item.id);
                      if (onNavigateToAlerts) onNavigateToAlerts();
                      setShowNotifications(false);
                    }}
                  >
                    <div className="notif-item-top">
                      <span className={`notif-type-tag type-${item.level?.toLowerCase()}`}>
                        {item.level === 'CRITICAL' ? '🔥 Crítico' : item.level === 'HIGH' ? '⚠️ Prazo' : 'ℹ️ Info'}
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
                <div className="dropdown-item">
                  <ExternalLink size={15} /> Portal Petronect Público
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
