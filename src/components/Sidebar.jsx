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
  Brain,
  Layers,
  Lightbulb,
  ShieldAlert,
  Activity,
  Award,
  Globe
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

  // ARQUITETURA DE NAVEGAÇÃO EXECUTIVA (ESTILO LINEAR / VERCEL)
  const navSections = [
    {
      group: 'OPERAÇÃO',
      items: [
        { id: 'dashboard', label: 'Dashboard Operacional', icon: LayoutDashboard, badge: null },
        { id: 'cockpit-executivo', label: 'Cockpit da Diretoria', icon: Award, badge: null },
        { id: 'radar', label: 'Radar de Certames', icon: RadarIcon, badge: 'Ao Vivo' },
        { id: 'oportunidades', label: 'Oportunidades & Análise', icon: Compass, badge: '14' },
        { id: 'propostas', label: 'Propostas Comerciais', icon: FileSpreadsheet, badge: '5' },
        { id: 'resultados', label: 'Resultados & Histórico', icon: Trophy, badge: null },
        { id: 'contratos', label: 'Contratos Vigentes', icon: FileSignature, badge: null }
      ]
    },
    {
      group: 'INTELIGÊNCIA & IA',
      items: [
        { id: 'workspace-inteligencia', label: 'Workspace Copilot IA', icon: Sparkles, badge: null },
        { id: 'pipeline-financeiro', label: 'Pipeline & Forecast', icon: DollarSign, badge: null },
        { id: 'mercado', label: 'Mercado & Concorrência', icon: Target, badge: null },
        { id: 'laboratorio-cenarios', label: 'Laboratório de Cenários', icon: Layers, badge: null },
        { id: 'revisao-executiva', label: 'Revisão Executiva (WBR)', icon: Calendar, badge: null }
      ]
    },
    {
      group: 'HABILITAÇÃO & GOVERNANÇA',
      items: [
        { id: 'documentos', label: 'Acervo Técnico & Docs', icon: FolderLock, badge: '34' },
        { id: 'governanca-aprovacoes', label: 'Governança & Alçadas', icon: ShieldCheck, badge: null },
        { id: 'relacionamento', label: 'Organizações & CRM', icon: Users, badge: null }
      ]
    },
    {
      group: 'SISTEMA & DADOS',
      items: [
        { id: 'relatorios', label: 'Relatórios Executivos', icon: FileText, badge: null },
        { id: 'data-governance', label: 'Governança de Dados', icon: Database, badge: null },
        { id: 'administracao', label: 'Configurações Globais', icon: ShieldCheck, badge: null }
      ]
    }
  ];

  // Mapeamento consolidado de rotas filhas/legadas para manter 100% de retrocompatibilidade
  const getActiveParentId = (current) => {
    if (['radar-antecipado', 'monitoramento'].includes(current)) return 'radar';
    if (['motor-aderencia'].includes(current)) return 'oportunidades';
    if (['decision-board'].includes(current)) return 'propostas';
    if (['comunicacoes', 'agenda', 'parceiros-cotacoes', 'estrategia-parceria'].includes(current)) return 'relacionamento';
    if (['simulador-cenarios', 'estrategia-preco', 'acoes-estrategicas', 'command-center', 'inteligencia'].includes(current)) return 'mercado';
    if (['recomendacoes-estrategicas', 'memoria-estrategica', 'expansao-crescimento', 'inteligencia-resultados', 'risco-preditivo', 'plano-mitigacao', 'maturidade-benchmark', 'planejamento-estrategico'].includes(current)) return 'laboratorio-cenarios';
    if (['prontidao-operacional', 'capacidade-estrategica', 'expansao-capacidade'].includes(current)) return 'documentos';
    if (['mission-control', 'governanca-autonomia', 'automacoes', 'central-agente'].includes(current)) return 'governanca-aprovacoes';
    if (['go-live', 'product-audit', 'production-readiness', 'configuracoes', 'fontes'].includes(current)) return 'administracao';
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
