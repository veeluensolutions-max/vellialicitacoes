import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  Radio, 
  Building2, 
  Wrench, 
  FileText, 
  Bell, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  X,
  ChevronRight,
  Sparkles,
  Cpu,
  Scale,
  FileSpreadsheet,
  Trophy,
  Bot,
  Users,
  Send,
  Calendar
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'command-center', label: 'Command Center', icon: BarChart3, badge: 'Executivo', badgeColor: 'engine' },
    { id: 'radar-antecipado', label: 'Radar Antecipado', icon: Compass, badge: 'Predição', badgeColor: 'engine' },
    { id: 'relacionamento', label: 'Relacionamento', icon: Users, badge: 'CRM B2G', badgeColor: 'engine' },
    { id: 'comunicacoes', label: 'Comunicações', icon: Send, badge: 'Assistida', badgeColor: 'engine' },
    { id: 'agenda', label: 'Agenda Integrada', icon: Calendar, badge: 'Meet/Teams', badgeColor: 'engine' },
    { id: 'inteligencia', label: 'Inteligência', icon: Bot, badge: 'Copilot', badgeColor: 'engine' },
    { id: 'decision-board', label: 'Decision Board', icon: Scale, badge: 'GO/NO-GO', badgeColor: 'engine' },
    { id: 'propostas', label: 'Propostas', icon: FileSpreadsheet, badge: '5 Ativas', badgeColor: 'engine' },
    { id: 'resultados', label: 'Resultados', icon: Trophy, badge: 'Win 28%', badgeColor: 'engine' },
    { id: 'motor-aderencia', label: 'Motor de Aderência', icon: Cpu, badge: 'IA Core', badgeColor: 'engine' },
    { id: 'oportunidades', label: 'Oportunidades', icon: Compass, badge: '14' },
    { id: 'monitoramento', label: 'Monitoramento', icon: Radio, badge: 'Petronect' },
    { id: 'empresas', label: 'Empresas', icon: Building2, badge: '2' },
    { id: 'servicos', label: 'Serviços', icon: Wrench, badge: '29' },
    { id: 'documentos', label: 'Documentos', icon: FileText, badge: null },
    { id: 'alertas', label: 'Alertas', icon: Bell, badge: '3', badgeColor: 'alert' },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, badge: null },
    { id: 'production-readiness', label: 'Prontidão & QA', icon: ShieldCheck, badge: 'Go-Live', badgeColor: 'engine' },
    { id: 'administracao', label: 'Administração', icon: ShieldCheck, badge: 'Gov & Sec', badgeColor: 'engine' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, badge: null }
  ];

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
                <span className="brand-tag">LICITAÇÕES</span>
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
          <span>Inteligência Pré-Edital</span>
        </div>

        {/* Menu Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-group-label">GESTÃO & OPERAÇÃO</div>
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="nav-item">
                  <button
                    onClick={() => handleSelect(item.id)}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <div className="nav-link-content">
                      <Icon size={19} className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                    </div>

                    <div className="nav-link-right">
                      {item.badge && (
                        <span className={`nav-badge ${item.badgeColor === 'alert' ? 'badge-alert' : ''}`}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} className="active-arrow" />}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="sidebar-footer">
          <div className="security-tag">
            <ShieldCheck size={16} className="security-icon" />
            <div className="security-info">
              <span className="security-title">Ambiente Seguro</span>
              <span className="security-sub">Família Vellia • v1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
