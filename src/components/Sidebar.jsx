import React from 'react';
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
  Sparkles,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  // ITEM 6: ESTRUTURA CONSOLIDADA DE 9 SEÇÕES CENTRAIS (VELLIA LICITAÇÕES 1.0)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'radar', label: 'Radar', icon: RadarIcon, badge: 'Petronect' },
    { id: 'oportunidades', label: 'Oportunidades', icon: Compass, badge: '14' },
    { id: 'propostas', label: 'Propostas', icon: FileSpreadsheet, badge: '5 Ativas' },
    { id: 'documentos', label: 'Documentos', icon: FolderLock, badge: 'Capacidade' },
    { id: 'relacionamento', label: 'Relacionamento', icon: Users, badge: 'CRM B2G' },
    { id: 'inteligencia', label: 'Inteligência', icon: Bot, badge: 'Copilot' },
    { id: 'resultados', label: 'Resultados', icon: Trophy, badge: 'Win 28%' },
    { id: 'administracao', label: 'Administração', icon: ShieldCheck, badge: 'Gov & Sec' }
  ];

  // Mapeamento de abas legadas/filhas para os 9 módulos principais
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
      <aside className={`sidebar-container ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Topo / Marca Vellia */}
        <div className="sidebar-header">
          <div className="brand-wrapper">
            <div className="brand-logo-gem">
              <svg viewBox="0 0 32 32" fill="none" className="brand-svg">
                <rect width="32" height="32" rx="8" fill="url(#vellia-grad)" />
                <path d="M9 22L16 9L23 22H18.5L16 16.5L13.5 22H9Z" fill="#FFFFFF" />
                <circle cx="16" cy="8.5" r="2.2" fill="#00E5C9" />
                <defs>
                  <linearGradient id="vellia-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0B132B" />
                    <stop offset="1" stopColor="#1E3A8A" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="brand-text-block">
              <div className="brand-title-row">
                <span className="brand-title-main">VELLIA</span>
                <span className="brand-tag">1.0 MVP</span>
              </div>
              <p className="brand-subtitle">Monitoramento Inteligente</p>
            </div>
          </div>

          <button 
            className="sidebar-close-btn" 
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tag de Conceito do Sistema */}
        <div className="sidebar-concept-pill">
          <Sparkles size={13} className="concept-icon" />
          <span>Core Product Consolidado</span>
        </div>

        {/* Menu Navigation Reduzido & Consolidado */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">PRODUÇÃO & OPERAÇÃO</div>
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentParent === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    onClick={() => handleSelect(item.id)}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <div className="nav-link-content">
                      <Icon size={18} className="nav-icon" />
                      <span className="nav-text">{item.label}</span>
                    </div>

                    <div className="nav-badge-wrap">
                      {item.badge && (
                        <span className={`nav-badge ${item.badgeColor || ''}`}>
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight size={14} className="nav-arrow" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rodapé do Menu com Versão de Produção */}
        <div className="sidebar-footer">
          <div className="sidebar-user-card">
            <div className="user-avatar-circle">
              <span>VL</span>
            </div>
            <div className="user-info-text">
              <span className="user-name">Operação Assistida</span>
              <span className="user-role">Vellia Licitações 1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
