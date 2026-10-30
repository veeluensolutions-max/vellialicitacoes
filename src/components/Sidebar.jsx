import React, { useState, useEffect } from 'react';
import { 
  Radar as RadarIcon,
  FileText,
  Globe,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { sourceRepository } from '../services/sourceRepository';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import './Sidebar.css';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  mobileOpen, 
  setMobileOpen,
  isCollapsed = false,
  setIsCollapsed,
  selectedCompanyScope = 'ALL',
  onSelectCompanyScope
}) {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());
  const [activePortalsCount, setActivePortalsCount] = useState(() => sourceRepository.getActive().length);

  useEffect(() => {
    const unsubOpps = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, () => {
      setOpportunities(OpportunityService.listAll());
    });
    const unsubSources = EventBus.subscribe('vellia-sources-updated', () => {
      setActivePortalsCount(sourceRepository.getActive().length);
    });
    return () => {
      if (typeof unsubOpps === 'function') unsubOpps();
      if (typeof unsubSources === 'function') unsubSources();
    };
  }, []);

  const collapsed = typeof isCollapsed === 'boolean' ? isCollapsed : localCollapsed;
  const toggleCollapsed = () => {
    if (setIsCollapsed) {
      setIsCollapsed(!collapsed);
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };

  const totalEditais = opportunities.length;
  const goCount = opportunities.filter(
    (o) => o.decision === 'GO' || o.status === 'Participando' || o.status === 'Interessante' || o.status === 'Go'
  ).length;

  const navItems = [
    {
      id: 'radar',
      label: 'Radar de Serviços',
      icon: RadarIcon,
      badge: '2 Empresas'
    },
    {
      id: 'oportunidades',
      label: 'Editais para Concorrer',
      icon: FileText,
      badge: String(totalEditais)
    },
    {
      id: 'portais',
      label: 'Portais Conectados',
      icon: Globe,
      badge: `${activePortalsCount} Ativos`
    }
  ];

  const currentTab = activeTab === 'oportunidades' ? 'oportunidades' : activeTab === 'portais' ? 'portais' : 'radar';

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
        {/* LOGO */}
        <div className="sidebar-header">
          <div className="brand-wrapper" onClick={() => handleSelect('radar')} title="Vellia Licitações">
            <div className="brand-logo-gem" style={{ overflow: 'hidden', borderRadius: '8px', background: 'transparent' }}>
              <img 
                src="/favicon.png" 
                alt="Vellia Licitações" 
                style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} 
              />
            </div>
            {!collapsed && (
              <div className="brand-text-block">
                <div className="brand-title-row">
                  <span className="brand-title-main">VELLIA</span>
                  <span className="brand-tag">LICITAÇÕES</span>
                </div>
                <p className="brand-subtitle">Radar & Editais</p>
              </div>
            )}
          </div>

          <button 
            className="sidebar-close-btn" 
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVEGAÇÃO PRINCIPAL OBJETIVA */}
        <nav className="sidebar-nav">
          <div className="nav-section-group">
            {!collapsed && (
              <div className="nav-group-label">MENU PRINCIPAL</div>
            )}
            <ul className="nav-list">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <li key={item.id} className="nav-item">
                    <button
                      onClick={() => handleSelect(item.id)}
                      className={`nav-link ${isActive ? 'active' : ''}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="nav-link-content">
                        <Icon size={18} className="nav-icon" />
                        {!collapsed && (
                          <span className="nav-text">{item.label}</span>
                        )}
                      </div>

                      {!collapsed && item.badge && (
                        <div className="nav-badge-wrap">
                          <span className="nav-badge">{item.badge}</span>
                        </div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ATALHO RÁPIDO POR EMPRESA */}
          {!collapsed && onSelectCompanyScope && (
            <div className="nav-section-group" style={{ marginTop: '20px' }}>
              <div className="nav-group-label">EMPRESAS DO GRUPO</div>
              <ul className="nav-list">
                <li className="nav-item">
                  <button
                    onClick={() => {
                      onSelectCompanyScope('veeluen-solutions');
                      handleSelect('oportunidades');
                    }}
                    className={`nav-link ${selectedCompanyScope === 'veeluen-solutions' ? 'active' : ''}`}
                  >
                    <div className="nav-link-content">
                      <Building2 size={16} className="nav-icon" style={{ color: '#38BDF8' }} />
                      <span className="nav-text">Veeluen Solutions</span>
                    </div>
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    onClick={() => {
                      onSelectCompanyScope('excelencia-ambiental');
                      handleSelect('oportunidades');
                    }}
                    className={`nav-link ${selectedCompanyScope === 'excelencia-ambiental' ? 'active' : ''}`}
                  >
                    <div className="nav-link-content">
                      <Building2 size={16} className="nav-icon" style={{ color: '#10B981' }} />
                      <span className="nav-text">Excelência Ambiental</span>
                    </div>
                  </button>
                </li>
                {goCount > 0 && (
                  <li className="nav-item" style={{ marginTop: '6px' }}>
                    <button
                      onClick={() => {
                        onSelectCompanyScope('ALL');
                        handleSelect('oportunidades');
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('vellia-filter-opportunities', {
                            detail: { decisionFilter: 'CONCORRER' }
                          }));
                        }, 50);
                      }}
                      className="nav-link"
                    >
                      <div className="nav-link-content">
                        <CheckCircle2 size={16} className="nav-icon" style={{ color: '#10B981' }} />
                        <span className="nav-text">Para Concorrer ({goCount})</span>
                      </div>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </nav>

        {/* RODAPÉ SIMPLES */}
        <div className="sidebar-footer">
          {!collapsed ? (
            <div className="sidebar-user-card">
              <div className="user-avatar-circle">
                <span>VL</span>
              </div>
              <div className="user-info-text">
                <span className="user-name">Vellia Licitações</span>
                <span className="user-role">Veeluen & Excelência</span>
              </div>
              <button 
                className="btn-collapse-toggle"
                onClick={toggleCollapsed}
                title="Recolher menu"
                aria-label="Recolher menu"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
          ) : (
            <button 
              className="btn-expand-toggle"
              onClick={toggleCollapsed}
              title="Expandir menu"
              aria-label="Expandir menu"
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
