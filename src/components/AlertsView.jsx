import React, { useState } from 'react';
import { 
  Bell, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Archive, 
  SlidersHorizontal, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  Filter, 
  Check, 
  ExternalLink,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { AlertService, AlertLevel, AlertType } from '../services/agent/alertService';
import './AlertsView.css';

export default function AlertsView({ onOpenOpportunityDetail }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'rules'
  const [alerts, setAlerts] = useState(() => AlertService.listAlerts(false));
  const [rules, setRules] = useState(() => AlertService.getRules());
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveRulesFeedback, setSaveRulesFeedback] = useState(false);

  const reloadAlerts = () => {
    setAlerts(AlertService.listAlerts(false));
  };

  const handleMarkAsRead = (id) => {
    const updated = AlertService.markAsRead(id);
    setAlerts(updated);
  };

  const handleArchive = (id) => {
    const updated = AlertService.archiveAlert(id);
    setAlerts(updated);
  };

  const handleMarkAllRead = () => {
    const updated = AlertService.markAllAsRead();
    setAlerts(updated);
  };

  const handleSaveRules = (e) => {
    e.preventDefault();
    AlertService.updateRules(rules);
    setSaveRulesFeedback(true);
    setTimeout(() => setSaveRulesFeedback(false), 2500);
  };

  // Filtragem
  const filteredAlerts = alerts.filter(a => {
    if (filterUnreadOnly && a.read) return false;
    if (filterLevel !== 'ALL' && a.level !== filterLevel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = a.title?.toLowerCase().includes(q) ||
                    a.message?.toLowerCase().includes(q) ||
                    a.opportunityNumber?.toLowerCase().includes(q) ||
                    a.company?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="alerts-module-container">
      {/* Cabeçalho do Módulo */}
      <div className="alerts-header-block">
        <div className="alerts-title-wrap">
          <div className="alerts-icon-box">
            <Bell size={24} className="text-teal" />
          </div>
          <div>
            <div className="alerts-tag-row">
              <span className="alerts-mod-tag">CENTRAL DE INTELIGÊNCIA</span>
              <span className="alerts-unread-pill">{unreadCount} não lidos</span>
            </div>
            <h1 className="alerts-main-title">Alertas Inteligentes & Notificações</h1>
            <p className="alerts-subtitle">
              Monitoramento autônomo com detecção proativa de oportunidades críticas, vencimentos de prazos e aditivos oficiais.
            </p>
          </div>
        </div>

        {/* Abas Superiores */}
        <div className="alerts-nav-tabs">
          <button 
            className={`tab-pill-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Bell size={14} />
            <span>Feed de Alertas ({alerts.length})</span>
          </button>

          <button 
            className={`tab-pill-btn ${activeTab === 'rules' ? 'active' : ''}`}
            onClick={() => setActiveTab('rules')}
          >
            <SlidersHorizontal size={14} />
            <span>Regras Personalizáveis</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO: ABA 1 - LISTA DE ALERTAS */}
      {activeTab === 'list' && (
        <div className="alerts-tab-content">
          {/* Barra de Filtros e Busca */}
          <div className="alerts-toolbar">
            <div className="alerts-search-box">
              <Search size={16} className="text-muted" />
              <input 
                type="text"
                placeholder="Buscar por número do edital, empresa, objeto ou motivo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="alerts-search-input"
              />
            </div>

            <div className="alerts-filter-actions">
              <div className="level-filter-pills">
                <button 
                  className={`lvl-btn ${filterLevel === 'ALL' ? 'active' : ''}`}
                  onClick={() => setFilterLevel('ALL')}
                >
                  Todos
                </button>
                <button 
                  className={`lvl-btn lvl-crit ${filterLevel === AlertLevel.CRITICAL ? 'active' : ''}`}
                  onClick={() => setFilterLevel(AlertLevel.CRITICAL)}
                >
                  🔥 Críticos
                </button>
                <button 
                  className={`lvl-btn lvl-high ${filterLevel === AlertLevel.HIGH ? 'active' : ''}`}
                  onClick={() => setFilterLevel(AlertLevel.HIGH)}
                >
                  Alta Prioridade
                </button>
                <button 
                  className={`lvl-btn lvl-imp ${filterLevel === AlertLevel.IMPORTANT ? 'active' : ''}`}
                  onClick={() => setFilterLevel(AlertLevel.IMPORTANT)}
                >
                  Importantes
                </button>
              </div>

              <label className="unread-only-label">
                <input 
                  type="checkbox"
                  checked={filterUnreadOnly}
                  onChange={(e) => setFilterUnreadOnly(e.target.checked)}
                />
                <span>Apenas não lidos</span>
              </label>

              {unreadCount > 0 && (
                <button className="btn-mark-all-read" onClick={handleMarkAllRead}>
                  <Check size={14} />
                  <span>Marcar todos como lidos</span>
                </button>
              )}
            </div>
          </div>

          {/* Lista de Alertas */}
          <div className="alerts-cards-list">
            {filteredAlerts.length === 0 ? (
              <div className="empty-alerts-card">
                <CheckCircle2 size={32} className="text-teal mb-2" />
                <h4 className="empty-title">Nenhum alerta pendente com os filtros selecionados</h4>
                <p className="empty-desc">Todos os editais e prazos estão sob controle operacional.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`alert-card-item level-${alert.level.toLowerCase()} ${!alert.read ? 'is-unread' : ''}`}
                >
                  <div className="alert-card-header">
                    <div className="alert-type-badge-row">
                      <span className={`alert-level-badge badge-${alert.level.toLowerCase()}`}>
                        {alert.level === AlertLevel.CRITICAL ? 'CRÍTICO' :
                         alert.level === AlertLevel.HIGH ? 'ALTA PRIORIDADE' :
                         alert.level === AlertLevel.IMPORTANT ? 'IMPORTANTE' : 'INFORMATIVO'}
                      </span>
                      <span className="alert-portal-pill">{alert.portal || 'Petronect'}</span>
                      <span className="alert-time-pill mono">
                        {new Date(alert.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="alert-actions-mini">
                      {!alert.read && (
                        <button 
                          className="btn-mini-read"
                          onClick={() => handleMarkAsRead(alert.id)}
                          title="Marcar como lido"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button 
                        className="btn-mini-archive"
                        onClick={() => handleArchive(alert.id)}
                        title="Arquivar alerta"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="alert-card-title">{alert.title}</h3>

                  <div className="alert-opp-meta-row">
                    <div className="opp-meta-item">
                      <span className="lbl">Edital / Oportunidade:</span>
                      <span className="val mono font-bold text-navy">{alert.opportunityNumber}</span>
                    </div>
                    {alert.company && (
                      <div className="opp-meta-item">
                        <span className="lbl">Empresa Recomendada:</span>
                        <span className="val text-teal font-bold">{alert.company}</span>
                      </div>
                    )}
                    {alert.adherence > 0 && (
                      <div className="opp-meta-item">
                        <span className="lbl">Aderência Semântica:</span>
                        <span className="val-score mono font-bold">{alert.adherence}%</span>
                      </div>
                    )}
                    {alert.daysLeft > 0 && (
                      <div className="opp-meta-item">
                        <span className="lbl">Prazo Restante:</span>
                        <span className="val-deadline font-bold">{alert.daysLeft} dias</span>
                      </div>
                    )}
                  </div>

                  <p className="alert-card-message">{alert.message}</p>

                  <div className="alert-card-footer">
                    <span className="alert-origin-note">
                      <ShieldCheck size={12} className="text-teal" />
                      Disparado pelo Vellia Agent via análise semântica contínua
                    </span>

                    {alert.opportunityNumber && onOpenOpportunityDetail && (
                      <button 
                        className="btn-analyze-opp"
                        onClick={() => onOpenOpportunityDetail(alert.opportunityNumber)}
                      >
                        <span>Analisar Oportunidade</span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* CONTEÚDO: ABA 2 - CONFIGURAÇÃO DE REGRAS PERSONALIZÁVEIS (Itens 13, 42, 43) */}
      {activeTab === 'rules' && (
        <div className="alerts-tab-content">
          <div className="rules-config-card">
            <div className="rules-header">
              <h3 className="rules-title">Regras de Disparo de Alertas</h3>
              <p className="rules-subtitle">
                Configure os limiares de tolerância e sensibilidade para o agente notificar a equipe comercial.
              </p>
            </div>

            <form onSubmit={handleSaveRules} className="rules-form">
              <div className="rules-form-grid">
                {/* Regra 1: Aderência Mínima */}
                <div className="rule-field-box">
                  <label className="rule-field-label">
                    <span>Aderência Mínima para Alerta Relevante (%)</span>
                    <span className="field-val-badge mono">{rules.minAdherence}%</span>
                  </label>
                  <input 
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={rules.minAdherence}
                    onChange={(e) => setRules({ ...rules, minAdherence: Number(e.target.value) })}
                    className="rules-slider"
                  />
                  <span className="rule-help-text">
                    Oportunidades com aderência igual ou superior a este valor gerarão alerta na central. (Padrão: 80%)
                  </span>
                </div>

                {/* Regra 2: Limiar Crítico */}
                <div className="rule-field-box">
                  <label className="rule-field-label">
                    <span>Limiar de Oportunidade Crítica (%)</span>
                    <span className="field-val-badge mono text-critical">{rules.criticalThreshold}%</span>
                  </label>
                  <input 
                    type="range"
                    min="80"
                    max="98"
                    step="1"
                    value={rules.criticalThreshold}
                    onChange={(e) => setRules({ ...rules, criticalThreshold: Number(e.target.value) })}
                    className="rules-slider slider-critical"
                  />
                  <span className="rule-help-text">
                    Score que dispara alerta crítico de ação imediata com destaque no painel. (Padrão: 90%)
                  </span>
                </div>

                {/* Regra 3: Avisos de Prazo */}
                <div className="rule-field-box full-span">
                  <label className="rule-field-label">
                    <span>Escalas de Prazo para Alertas de Vencimento (Dias)</span>
                  </label>
                  <div className="deadline-tags-preview">
                    {rules.deadlineThresholds.map((d, idx) => (
                      <span key={idx} className="deadline-rule-tag">
                        ≤ {d} dia{d > 1 ? 's' : ''}
                      </span>
                    ))}
                  </div>
                  <span className="rule-help-text">
                    O sistema alerta automaticamente a equipe ao atingir 15, 7, 3 e 1 dia restante para envio da proposta.
                  </span>
                </div>

                {/* Regra 4: Filtro de Empresas Alvo */}
                <div className="rule-field-box full-span">
                  <label className="rule-field-label">
                    <span>Empresas Monitoradas pela Central</span>
                  </label>
                  <div className="companies-checks-row">
                    <label className="company-check-item">
                      <input 
                        type="checkbox" 
                        checked={rules.targetCompanies.includes('ALL')}
                        onChange={() => setRules({ ...rules, targetCompanies: ['ALL'] })}
                      />
                      <span>Todas as empresas da Família Vellia</span>
                    </label>
                    <label className="company-check-item">
                      <input 
                        type="checkbox" 
                        checked={rules.targetCompanies.includes('ALL') || rules.targetCompanies.includes('Excelência Ambiental')}
                        disabled={rules.targetCompanies.includes('ALL')}
                      />
                      <span>Excelência Ambiental (Emissões & Qualidade do Ar)</span>
                    </label>
                    <label className="company-check-item">
                      <input 
                        type="checkbox" 
                        checked={rules.targetCompanies.includes('ALL') || rules.targetCompanies.includes('Veeluen Solutions')}
                        disabled={rules.targetCompanies.includes('ALL')}
                      />
                      <span>Veeluen Solutions (Operação ETE & Caldeiras NR-13)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Botão de Salvar */}
              <div className="rules-form-actions">
                {saveRulesFeedback && (
                  <span className="save-feedback-text">
                    <CheckCircle2 size={16} /> Regras salvas com sucesso no Vellia Agent!
                  </span>
                )}
                <button type="submit" className="btn-save-rules">
                  Salvar Configurações de Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
