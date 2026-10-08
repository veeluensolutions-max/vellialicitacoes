import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  Layers, 
  Clock, 
  FileText, 
  Scale, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Trophy, 
  ExternalLink, 
  ChevronRight, 
  Plus, 
  Search, 
  Star, 
  Archive, 
  ThumbsUp, 
  ThumbsDown, 
  Sliders, 
  Building2, 
  Eye, 
  Compass, 
  RefreshCw, 
  Check, 
  Info, 
  Briefcase, 
  Zap,
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';
import { CopilotService } from '../services/copilot/copilotService.js';
import { ConversationService } from '../services/copilot/conversationService.js';
import { ResponseMode } from '../services/copilot/responseGenerator.js';
import { UserRole } from '../services/copilot/permissionFilter.js';
import './IntelligenceCopilotView.css';

export default function IntelligenceCopilotView({ onOpenOpportunityDetail }) {
  // Estado de Visualização
  const [viewMode, setViewMode] = useState('copilot'); // 'copilot' | 'command-center'
  const [responseMode, setResponseMode] = useState(ResponseMode.EXECUTIVE); // EXECUTIVE | ANALYST
  const [userRole, setUserRole] = useState(UserRole.GESTAO_COMERCIAL);
  const [companyFilter, setCompanyFilter] = useState('TODAS'); // TODAS | Excelência Ambiental | Veeluen Solutions

  // Conversas e Histórico
  const [conversationsGrouped, setConversationsGrouped] = useState(() => CopilotService.getGroupedConversations());
  const [activeConv, setActiveConv] = useState(() => ConversationService.getActiveConversation());
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  
  // Entrada do usuário
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [commandCenterData, setCommandCenterData] = useState(() => CopilotService.getCommandCenterData({ userRole }));

  // Feedback Toast
  const [feedbackToast, setFeedbackToast] = useState(null);

  // Auto-scroll
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const refreshConversations = () => {
    setConversationsGrouped(CopilotService.getGroupedConversations());
    if (activeConv) {
      setActiveConv(ConversationService.getById(activeConv.id));
    }
  };

  const handleSelectConversation = (conv) => {
    ConversationService.setActiveConversationId(conv.id);
    setActiveConv(conv);
    setViewMode('copilot');
  };

  const handleNewConversation = () => {
    const newConv = CopilotService.createNewConversation('Nova Consulta Executiva');
    setActiveConv(newConv);
    refreshConversations();
    setViewMode('copilot');
  };

  const handleToggleFavorite = (convId, e) => {
    e.stopPropagation();
    CopilotService.toggleFavorite(convId);
    refreshConversations();
  };

  const handleArchive = (convId, e) => {
    e.stopPropagation();
    CopilotService.archiveConversation(convId);
    const updated = ConversationService.getActiveConversation();
    setActiveConv(updated);
    refreshConversations();
  };

  const handleSendMessage = (customText = null) => {
    const textToSend = customText || inputQuery;
    if (!textToSend || textToSend.trim() === '' || isProcessing) return;

    setIsProcessing(true);
    setInputQuery('');

    try {
      // Se estiver com filtro de empresa ativo, anexa o contexto se relevante
      let effectiveQuery = textToSend;
      if (companyFilter !== 'TODAS' && !textToSend.toLowerCase().includes('excelência') && !textToSend.toLowerCase().includes('veeluen')) {
        effectiveQuery = `${textToSend} para ${companyFilter}`;
      }

      const res = CopilotService.ask({
        query: effectiveQuery,
        conversationId: activeConv?.id,
        userRole,
        mode: responseMode,
        userName: userRole === UserRole.DIRETORIA ? 'Diretoria Executiva' : userRole === UserRole.GESTAO_COMERCIAL ? 'Mariana Castro (Comercial)' : 'Analista Operacional'
      });

      refreshConversations();
    } catch (err) {
      console.error('Erro no Copilot:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateBriefing = () => {
    setIsProcessing(true);
    try {
      const res = CopilotService.generateDailyBriefing({ userRole });
      setActiveConv(ConversationService.getById(res.conversationId));
      refreshConversations();
      setViewMode('copilot');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedback = (auditId, isHelpful) => {
    CopilotService.recordFeedback(auditId, isHelpful);
    setFeedbackToast(isHelpful ? 'Obrigado! Feedback positivo registrado.' : 'Feedback registrado para melhoria das respostas.');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleActionClick = (action) => {
    if (action.type === 'OPEN_OPPORTUNITY') {
      if (onOpenOpportunityDetail) {
        onOpenOpportunityDetail(action.id);
      }
    } else if (action.type === 'GENERATE_BRIEFING') {
      handleGenerateBriefing();
    } else if (action.type === 'NAVIGATE') {
      setFeedbackToast(`Ação registrada: Navegar para ${action.target}`);
      setTimeout(() => setFeedbackToast(null), 2500);
    } else {
      setFeedbackToast(`Ação '${action.label}' acionada com sucesso.`);
      setTimeout(() => setFeedbackToast(null), 2500);
    }
  };

  // Sugestões de perguntas rápidas (Itens 13 e 14)
  const quickQuestions = [
    'O que merece atenção hoje?',
    'Qual nossa melhor oportunidade?',
    'Quais prazos vencem esta semana?',
    'Quais documentos estão vencendo?',
    'Quais propostas estão atrasadas?',
    'Existe alguma oportunidade de ETE?',
    'Quem é nosso principal concorrente?',
    'Qual nosso Win Rate oficial?'
  ];

  return (
    <div className="intelligence-copilot-container">
      {/* 1. BARRA LATERAL ESQUERDA: HISTÓRICO DE SESSÕES & FAVORITOS (Itens 42 a 44) */}
      <aside className="copilot-sidebar">
        <div className="copilot-sidebar-header">
          <div className="brand-copilot-badge">
            <Bot size={15} className="cyan-icon" />
            <span>VELLIA INTELLIGENCE</span>
          </div>
          <button 
            className="btn-new-conv" 
            onClick={handleNewConversation}
            title="Nova Consulta Executiva"
          >
            <Plus size={16} />
            <span>Nova Consulta</span>
          </button>
        </div>

        {/* Busca no Histórico */}
        <div className="sidebar-search-box">
          <Search size={14} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar histórico..."
            value={searchHistoryQuery}
            onChange={(e) => setSearchHistoryQuery(e.target.value)}
          />
        </div>

        {/* Lista Agrupada de Conversas */}
        <div className="sidebar-conversations-list">
          {conversationsGrouped.favorites.length > 0 && (
            <div className="conv-group">
              <span className="conv-group-label">★ FAVORITOS</span>
              {conversationsGrouped.favorites.map(c => (
                <div 
                  key={c.id} 
                  className={`conv-item ${activeConv?.id === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(c)}
                >
                  <span className="conv-item-title">{c.title}</span>
                  <div className="conv-item-actions">
                    <button onClick={(e) => handleToggleFavorite(c.id, e)} className="btn-fav active">★</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="conv-group">
            <span className="conv-group-label">HOJE</span>
            {conversationsGrouped.today.length === 0 ? (
              <span className="empty-group-text">Nenhuma conversa recente</span>
            ) : (
              conversationsGrouped.today.map(c => (
                <div 
                  key={c.id} 
                  className={`conv-item ${activeConv?.id === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(c)}
                >
                  <span className="conv-item-title">{c.title}</span>
                  <div className="conv-item-actions">
                    <button 
                      onClick={(e) => handleToggleFavorite(c.id, e)} 
                      className={`btn-fav ${c.isFavorite ? 'active' : ''}`}
                    >
                      {c.isFavorite ? '★' : '☆'}
                    </button>
                    <button 
                      onClick={(e) => handleArchive(c.id, e)} 
                      className="btn-archive"
                      title="Arquivar"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {conversationsGrouped.yesterday.length > 0 && (
            <div className="conv-group">
              <span className="conv-group-label">ONTEM</span>
              {conversationsGrouped.yesterday.map(c => (
                <div 
                  key={c.id} 
                  className={`conv-item ${activeConv?.id === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(c)}
                >
                  <span className="conv-item-title">{c.title}</span>
                  <div className="conv-item-actions">
                    <button onClick={(e) => handleToggleFavorite(c.id, e)} className={`btn-fav ${c.isFavorite ? 'active' : ''}`}>
                      {c.isFavorite ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {conversationsGrouped.last7Days.length > 0 && (
            <div className="conv-group">
              <span className="conv-group-label">ÚLTIMOS 7 DIAS</span>
              {conversationsGrouped.last7Days.map(c => (
                <div 
                  key={c.id} 
                  className={`conv-item ${activeConv?.id === c.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(c)}
                >
                  <span className="conv-item-title">{c.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé da Sidebar: Indicador de Segurança & Permissão */}
        <div className="sidebar-footer-security">
          <div className="security-role-indicator">
            <ShieldCheck size={14} className="emerald" />
            <span>Perfil: <strong>{userRole}</strong></span>
          </div>
          <span className="security-sub">Controle de acesso por permissões (Itens 49 e 50)</span>
        </div>
      </aside>

      {/* 2. ÁREA PRINCIPAL CENTRAL */}
      <main className="copilot-main">
        {/* TOPO EXECUTIVO DE CONTROLE */}
        <header className="copilot-top-controls">
          <div className="top-left-modes">
            <button 
              className={`mode-pill-btn ${viewMode === 'copilot' ? 'active' : ''}`}
              onClick={() => setViewMode('copilot')}
            >
              <Bot size={15} />
              <span>Vellia Copilot</span>
            </button>

            <button 
              className={`mode-pill-btn ${viewMode === 'command-center' ? 'active' : ''}`}
              onClick={() => {
                setCommandCenterData(CopilotService.getCommandCenterData({ userRole }));
                setViewMode('command-center');
              }}
            >
              <LayoutDashboard size={15} />
              <span>Command Center</span>
            </button>

            <button 
              className="btn-daily-briefing-quick"
              onClick={handleGenerateBriefing}
            >
              <Zap size={14} />
              <span>Gerar Briefing de Hoje</span>
            </button>
          </div>

          <div className="top-right-settings">
            {/* Seletor de Empresa Contextual (Item 54) */}
            <div className="setting-dropdown-wrapper">
              <label>Empresa:</label>
              <select 
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="select-mini-dark"
              >
                <option value="TODAS">Todas as Empresas</option>
                <option value="Excelência Ambiental">Excelência Ambiental</option>
                <option value="Veeluen Solutions">Veeluen Solutions</option>
              </select>
            </div>

            {/* Modo de Resposta (Itens 56 e 57) */}
            <div className="setting-dropdown-wrapper">
              <label>Modo:</label>
              <select 
                value={responseMode}
                onChange={(e) => setResponseMode(e.target.value)}
                className="select-mini-dark"
              >
                <option value={ResponseMode.EXECUTIVE}>Executivo (Direto)</option>
                <option value={ResponseMode.ANALYST}>Analista (Detalhado)</option>
              </select>
            </div>

            {/* Simulação de Nível de Acesso (Itens 49, 50, 60) */}
            <div className="setting-dropdown-wrapper">
              <label>Acesso:</label>
              <select 
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="select-mini-dark"
              >
                <option value={UserRole.GESTAO_COMERCIAL}>Gestão Comercial</option>
                <option value={UserRole.DIRETORIA}>Diretoria</option>
                <option value={UserRole.OPERACIONAL}>Operacional (Sem Financeiro)</option>
              </select>
            </div>
          </div>
        </header>

        {/* FEEDBACK TOAST */}
        {feedbackToast && (
          <div className="copilot-toast">
            <Check size={14} className="emerald" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL: MODO COPILOT VS MODO COMMAND CENTER */}
        {viewMode === 'command-center' ? (
          /* ========================================================= */
          /* MODO COMMAND CENTER (Item 39)                             */
          /* ========================================================= */
          <div className="command-center-view">
            <div className="cc-banner">
              <div className="cc-banner-left">
                <span className="cc-tag">NÚCLEO DE VISÃO UNIFICADA</span>
                <h2>Command Center do Ecossistema</h2>
                <p>Status em tempo real do agente Petronect, oportunidades críticas, propostas e conformidade documental.</p>
              </div>
              <div className="cc-banner-status">
                <div className="status-pulse-dot" />
                <div>
                  <strong>{commandCenterData.agentStatus.portal}</strong>
                  <span>{commandCenterData.agentStatus.frequency} • {commandCenterData.agentStatus.lastSync}</span>
                </div>
              </div>
            </div>

            {/* KPIs do Command Center */}
            <div className="cc-kpis-grid">
              <div className="cc-kpi-card">
                <span className="cc-kpi-label">Oportunidades Monitoradas</span>
                <span className="cc-kpi-value cyan">{commandCenterData.kpis.monitoredOpportunities}</span>
                <span className="cc-kpi-sub">No portal Petronect Público</span>
              </div>
              <div className="cc-kpi-card">
                <span className="cc-kpi-label">Críticas / Prazo Curto</span>
                <span className="cc-kpi-value orange">{commandCenterData.kpis.criticalCount}</span>
                <span className="cc-kpi-sub">Aderência $\ge$ 85% ou prazo $\le$ 5 dias</span>
              </div>
              <div className="cc-kpi-card">
                <span className="cc-kpi-label">Propostas em Andamento</span>
                <span className="cc-kpi-value purple">{commandCenterData.kpis.activeProposalsCount}</span>
                <span className="cc-kpi-sub">Comitê de Licitações</span>
              </div>
              <div className="cc-kpi-card">
                <span className="cc-kpi-label">Documentos Vencendo</span>
                <span className="cc-kpi-value gold">{commandCenterData.kpis.expiringDocsCount}</span>
                <span className="cc-kpi-sub">Nos próximos 30 dias</span>
              </div>
              <div className="cc-kpi-card">
                <span className="cc-kpi-label">Win Rate Oficial</span>
                <span className="cc-kpi-value emerald">{commandCenterData.kpis.winRatePercent}%</span>
                <span className="cc-kpi-sub">5 vitórias homologadas</span>
              </div>
            </div>

            {/* Painéis Rápidos do Command Center */}
            <div className="cc-panels-grid">
              {/* Oportunidades Críticas */}
              <div className="cc-panel-box">
                <div className="cc-panel-head">
                  <Compass size={16} className="cyan" />
                  <h4>Oportunidades Prioritárias</h4>
                </div>
                <div className="cc-list-items">
                  {commandCenterData.topCriticalOpportunities.map(o => (
                    <div key={o.id} className="cc-item-row" onClick={() => onOpenOpportunityDetail && onOpenOpportunityDetail(o.id)}>
                      <div className="cc-item-info">
                        <strong>Edital #{o.number || o.id}</strong>
                        <p>{o.title}</p>
                        <span>{o.client} • Prazo: {o.daysLeft} dias</span>
                      </div>
                      <span className="badge-score-pill">{o.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Propostas Urgentes */}
              <div className="cc-panel-box">
                <div className="cc-panel-head">
                  <FileText size={16} className="purple" />
                  <h4>Propostas em Andamento</h4>
                </div>
                <div className="cc-list-items">
                  {commandCenterData.urgentProposals.map(p => (
                    <div key={p.id} className="cc-item-row">
                      <div className="cc-item-info">
                        <strong>Proposta #{p.id}</strong>
                        <p>{p.object}</p>
                        <span>{p.participatingCompany} • Envio: {p.targetSubmissionDate}</span>
                      </div>
                      <span className="badge-status-pill">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas Operacionais */}
              <div className="cc-panel-box">
                <div className="cc-panel-head">
                  <AlertTriangle size={16} className="gold" />
                  <h4>Alertas do Sistema</h4>
                </div>
                <div className="cc-list-items">
                  {commandCenterData.recentAlerts.map(al => (
                    <div key={al.id} className="cc-alert-row">
                      <span className={`alert-severity-badge severity-${al.severity.toLowerCase()}`}>{al.severity}</span>
                      <p>{al.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* MODO CHAT CONVERSACIONAL DO VELLIA COPILOT                */
          /* ========================================================= */
          <div className="copilot-chat-flow">
            {/* Cards de Comandos Rápidos no Topo (Item 14) */}
            <div className="quick-command-cards">
              <button className="q-cmd-card" onClick={() => handleSendMessage('Quais oportunidades devo analisar hoje?')}>
                <Compass size={15} className="cyan" />
                <div>
                  <strong>Oportunidades Críticas</strong>
                  <span>Varredura de prioridades</span>
                </div>
              </button>
              <button className="q-cmd-card" onClick={() => handleSendMessage('Quais licitações estão encerrando esta semana?')}>
                <Clock size={15} className="orange" />
                <div>
                  <strong>Prazos Próximos</strong>
                  <span>Menos de 7 dias úteis</span>
                </div>
              </button>
              <button className="q-cmd-card" onClick={() => handleSendMessage('Quais documentos e certidões estão vencendo?')}>
                <ShieldCheck size={15} className="gold" />
                <div>
                  <strong>Documentos Vencendo</strong>
                  <span>Cofre de regularidade</span>
                </div>
              </button>
              <button className="q-cmd-card" onClick={() => handleSendMessage('Quais propostas precisam de atenção hoje?')}>
                <FileText size={15} className="purple" />
                <div>
                  <strong>Propostas Pendentes</strong>
                  <span>Bloqueadores e prazos</span>
                </div>
              </button>
              <button className="q-cmd-card" onClick={() => handleSendMessage('Qual nosso Win Rate e por que estamos perdendo?')}>
                <Trophy size={15} className="emerald" />
                <div>
                  <strong>Resultados & Vitória</strong>
                  <span>Performance e motivos</span>
                </div>
              </button>
            </div>

            {/* Lista de Mensagens */}
            <div className="chat-messages-scroll">
              {(!activeConv || !activeConv.messages || activeConv.messages.length === 0) ? (
                <div className="empty-chat-hero">
                  <div className="hero-bot-avatar">
                    <Sparkles size={28} className="cyan" />
                  </div>
                  <h3>Pergunte ao Vellia. Decida com dados.</h3>
                  <p>O Copiloto Vellia consulta todo o ecossistema de editais, atestados, decisões GO/NO-GO, preços e resultados históricos sem inventar informações.</p>

                  <div className="hero-suggestions-grid">
                    {quickQuestions.map((q, idx) => (
                      <button key={idx} className="btn-hero-q" onClick={() => handleSendMessage(q)}>
                        <span>{q}</span>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                activeConv.messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`chat-message-row ${msg.sender}`}>
                    {msg.sender === 'assistant' ? (
                      <div className="message-bubble assistant-bubble">
                        <div className="bubble-header-bar">
                          <div className="bot-title-group">
                            <Bot size={16} className="cyan" />
                            <h4>{msg.title || 'Central de Inteligência Vellia'}</h4>
                          </div>
                          {msg.badge && (
                            <span className="bubble-badge-pill">
                              {msg.badge.label} • {msg.badge.score}
                            </span>
                          )}
                        </div>

                        {/* Resumo Executivo */}
                        {msg.summary && (
                          <p className="bubble-executive-summary">{msg.summary}</p>
                        )}

                        {/* Prioridades do Briefing (se houver) */}
                        {msg.priorities && msg.priorities.length > 0 && (
                          <div className="briefing-priorities-block">
                            <h5 className="block-title">Prioridades Hierarquizadas do Dia</h5>
                            <div className="priorities-cards-list">
                              {msg.priorities.map((p, pIdx) => (
                                <div key={pIdx} className="priority-rank-card">
                                  <div className="priority-badge-rank">#{p.rank}</div>
                                  <div className="priority-card-info">
                                    <strong>{p.title}</strong>
                                    <p>{p.desc}</p>
                                    <span>{p.meta}</span>
                                  </div>
                                  {p.action && (
                                    <button 
                                      className="btn-priority-action" 
                                      onClick={() => handleActionClick(p.action)}
                                    >
                                      {p.action.label}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tabela Comparativa (se houver) */}
                        {msg.table && (
                          <div className="comparison-table-wrapper">
                            <table className="mini-comparison-table">
                              <thead>
                                <tr>
                                  <th>Critério</th>
                                  <th>Oportunidade A</th>
                                  <th>Oportunidade B</th>
                                </tr>
                              </thead>
                              <tbody>
                                {msg.table.map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    <td className="crit-lbl">{row.criterio}</td>
                                    <td>{row.a}</td>
                                    <td>{row.b}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Fatos Estruturados (Item 11) */}
                        {msg.facts && msg.facts.length > 0 && (
                          <div className="structured-block facts-block">
                            <span className="struct-tag fact-tag">FATO</span>
                            <ul className="struct-list">
                              {msg.facts.map((f, fIdx) => (
                                <li key={fIdx}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Estimativas (Item 12) */}
                        {msg.estimates && msg.estimates.length > 0 && (
                          <div className="structured-block estimates-block">
                            <span className="struct-tag estimate-tag">ESTIMATIVA</span>
                            <ul className="struct-list">
                              {msg.estimates.map((e, eIdx) => (
                                <li key={eIdx}>{e}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recomendações (Item 11) */}
                        {msg.recommendations && msg.recommendations.length > 0 && (
                          <div className="structured-block recommendations-block">
                            <span className="struct-tag rec-tag">RECOMENDAÇÃO</span>
                            <ul className="struct-list">
                              {msg.recommendations.map((r, rIdx) => (
                                <li key={rIdx}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Fontes Internas Consultadas (Item 9 e 24) */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="bubble-sources-section">
                            <span className="sources-label">Fontes Utilizadas:</span>
                            <div className="sources-chips-tray">
                              {msg.sources.map((s, sIdx) => (
                                <span key={sIdx} className="source-chip" title={`${s.type}: ${s.label}`}>
                                  {s.type}: <strong>{s.label}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ações Relacionadas (Item 32) */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="bubble-actions-tray">
                            {msg.actions.map((act, aIdx) => (
                              <button 
                                key={aIdx} 
                                className="btn-bubble-action"
                                onClick={() => handleActionClick(act)}
                              >
                                {act.label}
                                <ArrowRight size={13} />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Barra de Feedback (Item 47) */}
                        {msg.auditId && (
                          <div className="bubble-feedback-bar">
                            <span className="feedback-hint">Esta resposta foi útil?</span>
                            <div className="feedback-buttons">
                              <button 
                                onClick={() => handleFeedback(msg.auditId, true)} 
                                className="btn-fb-icon"
                                title="Resposta útil"
                              >
                                <ThumbsUp size={13} />
                              </button>
                              <button 
                                onClick={() => handleFeedback(msg.auditId, false)} 
                                className="btn-fb-icon"
                                title="Resposta incompleta"
                              >
                                <ThumbsDown size={13} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="message-bubble user-bubble">
                        <p>{msg.text}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isProcessing && (
                <div className="processing-indicator-bubble">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="typing-label">Consultando editais, matriz de risco e cofre documental...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Barra de Entrada de Texto Grande (Item 40) */}
            <div className="copilot-input-area">
              <div className="input-box-wrapper">
                <input 
                  type="text" 
                  placeholder="Pergunte ao Vellia... (Ex: 'Qual nossa melhor oportunidade?', 'Tem ETE em Pernambuco?', 'O que vence amanhã?')"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isProcessing}
                />
                <button 
                  className="btn-send-main"
                  onClick={() => handleSendMessage()}
                  disabled={isProcessing || !inputQuery.trim()}
                  title="Enviar pergunta"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Chips contextuais rápidos abaixo do input (Item 55) */}
              <div className="context-chips-tray">
                <button className="chip-quick" onClick={() => handleSendMessage('Qual nossa melhor oportunidade hoje?')}>
                  ★ Melhor Oportunidade
                </button>
                <button className="chip-quick" onClick={() => handleSendMessage('Quais licitações encerram esta semana?')}>
                  ⏱ Prazos da Semana
                </button>
                <button className="chip-quick" onClick={() => handleSendMessage('Quais certidões estão vencendo no cofre?')}>
                  📄 Certidões Vencendo
                </button>
                <button className="chip-quick" onClick={() => handleSendMessage('Tem alguma oportunidade de ETE em Pernambuco?')}>
                  🌊 ETE em PE
                </button>
                <button className="chip-quick" onClick={() => handleSendMessage('Quem aparece mais contra nós nas licitações?')}>
                  ⚔ Concorrente Principal
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Mini auxiliar de ArrowRight
function ArrowRight({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
