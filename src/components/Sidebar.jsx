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
  FileSignature,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Scale,
  Sparkles,
  FileText,
  Target,
  DollarSign,
  Handshake,
  Database,
  TrendingUp,
  Calendar,
  Brain
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

  // FASE 50: MENU PRINCIPAL REAVALIADO & CONSOLIDADO POR DOMÍNIOS (Seções 7 e 8)
  const navSections = [
    {
      group: 'INÍCIO',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null }
      ]
    },
    {
      group: 'LICITAÇÕES',
      items: [
        { id: 'radar', label: 'Radar', icon: RadarIcon, badge: 'Petronect' },
        { id: 'oportunidades', label: 'Oportunidades', icon: Compass, badge: '14' },
        { id: 'propostas', label: 'Propostas', icon: FileSpreadsheet, badge: '5' },
        { id: 'resultados', label: 'Resultados', icon: Trophy, badge: null }
      ]
    },
    {
      group: 'INTELIGÊNCIA',
      items: [
        { id: 'revisao-executiva', label: 'Revisão Executiva (WBR)', icon: Calendar, badge: 'WBR' },
        { id: 'memoria-estrategica', label: 'Memória Estratégica', icon: Brain, badge: 'Decisões' },
        { id: 'mercado', label: 'Mercado & Concorrência', icon: Compass, badge: null },
        { id: 'maturidade-benchmark', label: 'Maturidade & Benchmark', icon: TrendingUp, badge: 'Vellia 2.1' },
        { id: 'pipeline-financeiro', label: 'Pipeline & Forecast', icon: DollarSign, badge: null },
        { id: 'planejamento-estrategico', label: 'Planejamento Estratégico', icon: Target, badge: null },
        { id: 'workspace-inteligencia', label: 'Vellia Workspace', icon: Sparkles, badge: null }
      ]
    },
    {
      group: 'CAPACIDADE',
      items: [
        { id: 'documentos', label: 'Documentos & Acervo', icon: FolderLock, badge: '34' },
        { id: 'prontidao-operacional', label: 'Prontidão Operacional', icon: ShieldCheck, badge: null }
      ]
    },
    {
      group: 'RELACIONAMENTO',
      items: [
        { id: 'relacionamento', label: 'Organizações & CRM', icon: Users, badge: null },
        { id: 'parceiros-cotacoes', label: 'Parceiros & Fornecedores', icon: Handshake, badge: null }
      ]
    },
    {
      group: 'CONTRATOS',
      items: [
        { id: 'contratos', label: 'Contratos & Gestão', icon: FileSignature, badge: 'Vigentes' }
      ]
    },
    {
      group: 'ADMINISTRAÇÃO',
      items: [
        { id: 'governanca-aprovacoes', label: 'Governança & Alçadas', icon: ShieldCheck, badge: null },
        { id: 'automacoes', label: 'Automações & Workflows', icon: Zap, badge: null },
        { id: 'central-agente', label: 'Central do Agente', icon: Bot, badge: '5 Agentes' },
        { id: 'relatorios', label: 'Relatórios & Briefings', icon: FileText, badge: null },
        { id: 'data-governance', label: 'Data Governance', icon: Database, badge: null },
        { id: 'administracao', label: 'Configurações & Baseline', icon: ShieldCheck, badge: null }
      ]
    }
  ];

  // Mapeamento consolidado de rotas filhas/legadas
  const getActiveParentId = (current) => {
    if (['radar-antecipado', 'monitoramento', 'fontes'].includes(current)) return 'radar';
    if (['motor-aderencia'].includes(current)) return 'oportunidades';
    if (['decision-board'].includes(current)) return 'propostas';
    if (['comunicacoes', 'agenda'].includes(current)) return 'relacionamento';
    if (['simulador-cenarios', 'estrategia-preco', 'acoes-estrategicas', 'command-center', 'inteligencia'].includes(current)) return 'mercado';
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
                <span>V2</span>
              </div>
              <div className="user-info-text">
                <span className="user-name">Vellia 2.0</span>
                <span className="user-role">Quiet Intelligence</span>
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
