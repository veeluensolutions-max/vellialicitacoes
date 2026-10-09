import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Radar as RadarIcon,
  Compass, 
  FileSpreadsheet, 
  FolderLock, 
  Users, 
  Bot, 
  Trophy, 
  ShieldCheck, 
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  mobileOpen, 
  setMobileOpen,
  isCollapsed = false,
  setIsCollapsed
}) {
  // Controle interno se não for passado de fora
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const collapsed = typeof isCollapsed === 'boolean' ? isCollapsed : localCollapsed;
  const toggleCollapsed = () => {
    if (setIsCollapsed) {
      setIsCollapsed(!collapsed);
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };

  // ITEM 11 & 12: ESTRUTURA DOS 9 MÓDULOS AGRUPADOS VISUALMENTE
  const navSections = [
    {
      group: 'OPERAÇÃO',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'radar', label: 'Radar', icon: RadarIcon, badge: 'Petronect' },
        { id: 'oportunidades', label: 'Oportunidades', icon: Compass, badge: '14' },
        { id: 'propostas', label: 'Propostas', icon: FileSpreadsheet, badge: '5' },
        { id: 'documentos', label: 'Documentos', icon: FolderLock, badge: 'Capacidade' }
      ]
    },
    {
      group: 'RELACIONAMENTO',
      items: [
        { id: 'relacionamento', label: 'Relacionamento', icon: Users, badge: 'CRM' }
      ]
    },
    {
      group: 'INTELIGÊNCIA',
      items: [
        { id: 'inteligencia', label: 'Inteligência', icon: Bot, badge: 'Copilot' }
      ]
    },
    {
      group: 'SISTEMA',
      items: [
        { id: 'resultados', label: 'Resultados', icon: Trophy, badge: null },
        { id: 'administracao', label: 'Administração', icon: ShieldCheck, badge: null }
      ]
    }
  ];

  // Mapeamento de rotas filhas/legadas
  const getActiveParentId = (current) => {
    if (['radar-antecipado', 'monitoramento', 'fontes'].includes(current)) return 'radar';
    if (['motor-aderencia'].includes(current)) return 'oportunidades';
    if (['decision-board'].includes(current)) return 'propostas';
    if (['comunicacoes', 'agenda'].includes(current)) return 'relacionamento';
    if (['command-center', 'relatorios'].includes(current)) return 'inteligencia';
    if (['go-live', 'product-audit', 'production-readiness', 'configuracoes'].includes(current)) return 'administracao';
    return current;
  };

  const currentParent = getActiveParentId(activeTab);

  const handleSelect = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''} ${collapsed ? 'collapsed' : ''}`}>
        
        {/* HEADER DA SIDEBAR & LOGO (Item 97) */}
        <div className="sidebar-header">
          <div className="brand-wrapper" onClick={() => handleSelect('dashboard')} title="Vellia Licitações">
            <div className="brand-logo-gem">
              <svg viewBox="0 0 32 32" fill="none" className="brand-svg">
                <rect width="32" height="32" rx="8" fill="#0F172A" />
                <path d="M8 23L16 8L24 23H19.5L16 15.5L12.5 23H8Z" fill="#F8FAFC" />
                <circle cx="16" cy="7.5" r="2.2" fill="#0284C7" />
              </svg>
            </div>
            {!collapsed && (
              <div className="brand-text-block">
                <div className="brand-title-row">
                  <span className="brand-title-main">VELLIA</span>
                  <span className="brand-tag">LICITAÇÕES</span>
                </div>
                <p className="brand-subtitle">Quiet Intelligence</p>
              </div>
            )}
          </div>

          {/* Botão fechar no mobile */}
          <button 
            className="sidebar-close-btn" 
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVEGAÇÃO ORGANIZADA POR GRUPOS */}
        <nav className="sidebar-nav">
          {navSections.map((sec, secIdx) => (
            <div key={sec.group} className="nav-section-group">
              {!collapsed && (
                <div className="nav-group-label">{sec.group}</div>
              )}
              {collapsed && secIdx > 0 && (
                <div className="nav-group-divider" />
              )}
              <ul className="nav-list">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentParent === item.id;
                  return (
                    <li key={item.id} className="nav-item">
                      <button
                        onClick={() => handleSelect(item.id)}
                        className={`nav-link ${isActive ? 'active' : ''}`}
                        title={collapsed ? `${item.label} (${sec.group})` : undefined}
                      >
                        <div className="nav-link-content">
                          <Icon size={18} className="nav-icon" />
                          {!collapsed && (
                            <span className="nav-text">{item.label}</span>
                          )}
                        </div>

                        {!collapsed && (
                          <div className="nav-badge-wrap">
                            {item.badge && (
                              <span className="nav-badge">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {collapsed && item.badge && (
                          <span className="nav-dot-badge" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* FOOTER & BOTÃO DE COLAPSO (Item 14) */}
        <div className="sidebar-footer">
          {!collapsed ? (
            <div className="sidebar-user-card">
              <div className="user-avatar-circle">
                <span>VL</span>
              </div>
              <div className="user-info-text">
                <span className="user-name">Operação 1.0</span>
                <span className="user-role">SaaS Corporativo</span>
              </div>
              <button 
                className="btn-collapse-toggle"
                onClick={toggleCollapsed}
                title="Colapsar menu lateral"
                aria-label="Colapsar menu lateral"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="btn-expand-toggle"
              onClick={toggleCollapsed}
              title="Expandir menu lateral"
              aria-label="Expandir menu lateral"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
