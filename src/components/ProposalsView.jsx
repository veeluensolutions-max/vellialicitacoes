import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  LayoutList, 
  Kanban, 
  Calendar as CalendarIcon, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Send, 
  ArrowRight, 
  Flame, 
  Bot, 
  Lock
} from 'lucide-react';
import { 
  ProposalService, 
  ProposalStatus 
} from '../services/proposal/proposalService';
import { OpportunityService } from '../services/opportunityService';
import { DecisionService, DecisionTier } from '../services/decision/decisionService';
import ProposalDetailView from './ProposalDetailView';
import './ProposalsView.css';

export default function ProposalsView({ onOpenOpportunityDetail }) {
  const [proposals, setProposals] = useState(() => ProposalService.listAll());
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban' | 'calendar' | 'assistant'
  
  // Proposta Selecionada para Detalhes
  const [selectedProposalId, setSelectedProposalId] = useState(null);

  // Modal de Criação de Proposta
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOppForCreation, setSelectedOppForCreation] = useState('');

  // Filtros Avançados (Item 57)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterPortal, setFilterPortal] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterResponsible, setFilterResponsible] = useState('ALL');
  const [statusCardFilter, setStatusCardFilter] = useState(null);

  // Assistente de Proposta State (Item 60 e 61)
  const [assistantSelectedProposalId, setAssistantSelectedProposalId] = useState(proposals[0]?.id || '');
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantChatHistory, setAssistantChatHistory] = useState([
    {
      sender: 'assistant',
      text: '[FATO]: Olá! Sou o Assistente Especialista em Gestão de Propostas do Vellia Licitações.\n\n[REGRA DE PRECISÃO]: Minhas análises são baseadas estritamente nos custos, dossiês e prazos reais cadastrados no sistema. Nunca invento valores ou status.\n\nSelecione uma pergunta rápida abaixo ou consulte o status de qualquer proposta ativa.',
      sources: ['Módulo de Propostas']
    }
  ]);

  const reloadData = () => {
    setProposals(ProposalService.listAll());
  };

  const metrics = ProposalService.getDashboardMetrics();
  const alerts = ProposalService.getProposalAlerts();

  // Lista de oportunidades elegíveis para conversão em proposta (GO ou GO COM PENDÊNCIAS - Item 1)
  const allOpps = OpportunityService.listAll();
  const eligibleOpps = allOpps.filter(opp => {
    const decision = DecisionService.calculateDecision(opp);
    const human = DecisionService.getHumanDecision(opp.id || opp.number);
    const hasGo = human?.currentDecision === 'GO' || 
                  decision.recommendationTier === DecisionTier.GO || 
                  decision.recommendationTier === DecisionTier.GO_PRIORITARIO || 
                  decision.recommendationTier === DecisionTier.GO_PENDENCIAS;
    return hasGo;
  });

  // Filtragem
  const filteredProposals = proposals.filter(p => {
    if (statusCardFilter) {
      if (statusCardFilter === 'prazos-criticos') {
        const c = ProposalService.getCountdownInfo(p.targetSubmissionDate);
        if (c.expired || c.totalHours > 48 || p.status === ProposalStatus.ENVIADA || p.status === ProposalStatus.ENCERRADA) return false;
      } else if (statusCardFilter === 'prontas') {
        if (p.status !== ProposalStatus.PRONTA_PARA_ENVIO) return false;
      } else if (p.status !== statusCardFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        p.id.toLowerCase().includes(q) ||
        p.opportunityNumber.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.object.toLowerCase().includes(q) ||
        p.participatingCompany.toLowerCase().includes(q) ||
        p.primaryService.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterCompany !== 'ALL' && p.participatingCompany !== filterCompany) return false;
    if (filterPortal !== 'ALL' && p.portal !== filterPortal) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (filterResponsible !== 'ALL') {
      const isResp = Object.values(p.responsibles || {}).some(r => r.includes(filterResponsible));
      if (!isResp) return false;
    }

    return true;
  });

  // Criar Proposta a partir de Oportunidade
  const handleCreateProposal = (e) => {
    e.preventDefault();
    if (!selectedOppForCreation) return;

    const opp = allOpps.find(o => String(o.id || o.number) === String(selectedOppForCreation));
    if (!opp) return;

    const newProposal = ProposalService.createProposalFromOpportunity(opp, 'Diretoria Comercial');
    reloadData();
    setShowCreateModal(false);
    setSelectedProposalId(newProposal.id);
  };

  // Perguntas do Assistente
  const handleAskAssistant = (questionText) => {
    const q = questionText || assistantInput;
    if (!q.trim()) return;

    const userEntry = { sender: 'user', text: q };
    const result = ProposalService.askProposalAssistant(q, assistantSelectedProposalId || null);
    const assistantEntry = { sender: 'assistant', text: result.reply, sources: result.sources };

    setAssistantChatHistory(prev => [...prev, userEntry, assistantEntry]);
    setAssistantInput('');
  };

  // 56. KANBAN COLUMNS
  const kanbanColumns = [
    { id: ProposalStatus.RASCUNHO, label: 'Rascunho' },
    { id: ProposalStatus.EM_PREPARACAO, label: 'Preparação' },
    { id: ProposalStatus.AGUARDANDO_DOCUMENTOS, label: 'Documentação' },
    { id: ProposalStatus.EM_PRECIFICACAO, label: 'Precificação' },
    { id: ProposalStatus.EM_REVISAO, label: 'Revisão' },
    { id: ProposalStatus.APROVACAO_INTERNA, label: 'Aprovação' },
    { id: ProposalStatus.PRONTA_PARA_ENVIO, label: 'Pronta' },
    { id: ProposalStatus.ENVIADA, label: 'Enviada' },
    { id: ProposalStatus.ENCERRADA, label: 'Resultado' }
  ];

  return (
    <div className="proposals-view-container">
      
      {/* 1. TOPO & BOTÃO CRIAR PROPOSTA (Item 1) */}
      <header className="proposals-header-hero">
        <div className="hero-title-group">
          <div className="hero-tag-row">
            <span className="hero-mini-tag">
              <FileSpreadsheet size={13} />
              <span>Gestão Comercial & Operacional</span>
            </span>
            <span className="hero-badge-version">FASE 11 • CORE PROPOSTAS</span>
          </div>
          <h1 className="hero-main-heading">Central de Propostas & Formação de Preço</h1>
          <p className="hero-subtext">
            Transformação de oportunidades com decisão <strong>GO</strong> em propostas reais: 
            responsáveis, precificação sem dados inventados, checklist dinâmico e validação final de envio.
          </p>
        </div>

        <div className="hero-actions-right">
          <button className="btn-create-proposal-main" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span>Criar Proposta</span>
          </button>
        </div>
      </header>

      {/* 58. MÉTRICAS EXECUTIVAS DA GESTÃO DE PROPOSTAS */}
      <section className="proposals-metrics-row">
        <div className="p-metric-card">
          <span className="p-metric-lbl">Propostas em Andamento</span>
          <div className="p-metric-val">{metrics.inProgressCount}</div>
          <span className="p-metric-sub">Processos de preparação ativos</span>
        </div>

        <div className="p-metric-card">
          <span className="p-metric-lbl">Valor Total em Propostas</span>
          <div className="p-metric-val text-teal">{ProposalService.formatCurrency(metrics.totalValueInProgress)}</div>
          <span className="p-metric-sub">Pipeline financeiro cotado</span>
        </div>

        <div className="p-metric-card">
          <span className="p-metric-lbl">Margem Média Aplicada</span>
          <div className="p-metric-val text-emerald">{metrics.avgMargin}%</div>
          <span className="p-metric-sub">Meta interna mínima: 15%</span>
        </div>

        <div className="p-metric-card">
          <span className="p-metric-lbl">Ticket Médio das Ofertas</span>
          <div className="p-metric-val">{ProposalService.formatCurrency(metrics.avgTicket)}</div>
          <span className="p-metric-sub">Média por licitação disputada</span>
        </div>

        <div className="p-metric-card">
          <span className="p-metric-lbl">Propostas Enviadas / Taxa Prazo</span>
          <div className="p-metric-val text-blue">{metrics.submittedCount} <span className="sub-rate">({metrics.onTimeRate}% no prazo)</span></div>
          <span className="p-metric-sub">Submetidas no Petronect</span>
        </div>
      </section>

      {/* 54. CARDS DE STATUS RÁPIDOS & FILTRO EM CLIQUE */}
      <section className="status-shortcut-bar">
        <button 
          className={`shortcut-chip ${statusCardFilter === null ? 'active' : ''}`}
          onClick={() => setStatusCardFilter(null)}
        >
          <span>Todas ({proposals.length})</span>
        </button>

        <button 
          className={`shortcut-chip ${statusCardFilter === ProposalStatus.EM_PREPARACAO ? 'active' : ''}`}
          onClick={() => setStatusCardFilter(statusCardFilter === ProposalStatus.EM_PREPARACAO ? null : ProposalStatus.EM_PREPARACAO)}
        >
          <span>Em Preparação ({metrics.statusCounts.emPreparacao})</span>
        </button>

        <button 
          className={`shortcut-chip ${statusCardFilter === ProposalStatus.AGUARDANDO_DOCUMENTOS ? 'active' : ''}`}
          onClick={() => setStatusCardFilter(statusCardFilter === ProposalStatus.AGUARDANDO_DOCUMENTOS ? null : ProposalStatus.AGUARDANDO_DOCUMENTOS)}
        >
          <span>Aguardando Documento ({metrics.statusCounts.aguardandoDocumentos})</span>
        </button>

        <button 
          className={`shortcut-chip ${statusCardFilter === ProposalStatus.EM_PRECIFICACAO ? 'active' : ''}`}
          onClick={() => setStatusCardFilter(statusCardFilter === ProposalStatus.EM_PRECIFICACAO ? null : ProposalStatus.EM_PRECIFICACAO)}
        >
          <span>Em Precificação ({metrics.statusCounts.emPrecificacao})</span>
        </button>

        <button 
          className={`shortcut-chip ${statusCardFilter === ProposalStatus.APROVACAO_INTERNA ? 'active' : ''}`}
          onClick={() => setStatusCardFilter(statusCardFilter === ProposalStatus.APROVACAO_INTERNA ? null : ProposalStatus.APROVACAO_INTERNA)}
        >
          <span>Em Aprovação ({metrics.statusCounts.emAprovacao})</span>
        </button>

        <button 
          className={`shortcut-chip chip-ready ${statusCardFilter === 'prontas' ? 'active' : ''}`}
          onClick={() => setStatusCardFilter(statusCardFilter === 'prontas' ? null : 'prontas')}
        >
          <span>Prontas para Envio ({metrics.statusCounts.prontas})</span>
        </button>

        <button 
          className={`shortcut-chip chip-submitted ${statusCardFilter === ProposalStatus.ENVIADA ? 'active' : ''}`}
          onClick={() => setStatusCardFilter(statusCardFilter === ProposalStatus.ENVIADA ? null : ProposalStatus.ENVIADA)}
        >
          <span>Enviadas ({metrics.statusCounts.enviadas})</span>
        </button>

        <button 
          className={`shortcut-chip chip-critical ${statusCardFilter === 'prazos-criticos' ? 'active' : ''}`}
          onClick={() => setStatusCardFilter(statusCardFilter === 'prazos-criticos' ? null : 'prazos-criticos')}
        >
          <Clock size={13} />
          <span>Prazos Críticos &lt; 48h ({metrics.statusCounts.prazosCriticos})</span>
        </button>
      </section>

      {/* 59. ALERTAS INTELIGENTES EM CARROSSEL */}
      {alerts && alerts.length > 0 && (
        <div className="proposals-alerts-strip">
          <div className="alerts-strip-head">
            <Flame size={15} />
            <span>Alertas Operacionais ({alerts.length})</span>
          </div>
          <div className="alerts-scroll-items">
            {alerts.slice(0, 4).map(alt => (
              <div 
                key={alt.id} 
                className={`alert-mini-card alert-${alt.severity.toLowerCase()}`}
                onClick={() => setSelectedProposalId(alt.proposalId)}
              >
                <span className="alt-tag">{alt.severity}</span>
                <span className="alt-title">{alt.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BARRA DE FERRAMENTAS & MODOS DE VISÃO */}
      <div className="proposals-toolbar">
        <div className="toolbar-left-search">
          <div className="search-input-box">
            <Search size={15} />
            <input 
              type="text"
              placeholder="Buscar por número, contratante, objeto ou empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 57. Filtros */}
          <select 
            className="select-filter"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            <option value="ALL">Todas as Empresas</option>
            <option value="Excelência Ambiental">Excelência Ambiental</option>
            <option value="Veeluen Solutions">Veeluen Solutions</option>
          </select>

          <select 
            className="select-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">Todos os Status</option>
            <option value={ProposalStatus.EM_PREPARACAO}>Em Preparação</option>
            <option value={ProposalStatus.AGUARDANDO_DOCUMENTOS}>Aguardando Documentos</option>
            <option value={ProposalStatus.EM_PRECIFICACAO}>Em Precificação</option>
            <option value={ProposalStatus.EM_REVISAO}>Em Revisão</option>
            <option value={ProposalStatus.APROVACAO_INTERNA}>Aprovação Interna</option>
            <option value={ProposalStatus.PRONTA_PARA_ENVIO}>Pronta para Envio</option>
            <option value={ProposalStatus.ENVIADA}>Enviada</option>
          </select>

          <select 
            className="select-filter"
            value={filterResponsible}
            onChange={(e) => setFilterResponsible(e.target.value)}
          >
            <option value="ALL">Todos os Responsáveis</option>
            <option value="Roberto Albuquerque">Dr. Roberto Albuquerque</option>
            <option value="Mariana Castro">Mariana Castro</option>
            <option value="Mariana Lemos">Dra. Mariana Lemos</option>
            <option value="Carlos Silveira">Carlos Silveira</option>
          </select>
        </div>

        <div className="toolbar-right-modes">
          <div className="view-mode-toggle">
            <button 
              className={`mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Visualização em Lista / Tabela"
            >
              <LayoutList size={15} />
              <span>Lista</span>
            </button>

            <button 
              className={`mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Visualização Kanban Operacional (Item 56)"
            >
              <Kanban size={15} />
              <span>Kanban</span>
            </button>

            <button 
              className={`mode-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Calendário de Prazos & Encerramentos (Item 55)"
            >
              <CalendarIcon size={15} />
              <span>Prazos</span>
            </button>

            <button 
              className={`mode-btn ${viewMode === 'assistant' ? 'active' : ''}`}
              onClick={() => setViewMode('assistant')}
              title="Assistente IA Especialista de Propostas (Item 60 e 61)"
            >
              <Bot size={15} />
              <span>Assistente</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODO 1: TABELA / LISTA CORPORATIVA DE PROPOSTAS */}
      {/* ======================================================== */}
      {viewMode === 'table' && (
        <div className="proposals-table-wrapper">
          <table className="corporate-proposals-table">
            <thead>
              <tr>
                <th>ID da Proposta</th>
                <th>Oportunidade / Portal</th>
                <th>Contratante & Objeto</th>
                <th>Empresa</th>
                <th>Preço Ofertado</th>
                <th>Margem</th>
                <th>Prontidão</th>
                <th>Prazo / Contagem</th>
                <th>Status</th>
                <th>Bloqueadores</th>
                <th className="th-action">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan="11" className="empty-cell">
                    Nenhuma proposta encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProposals.map(prop => {
                  const r = ProposalService.calculateReadiness(prop);
                  const cd = ProposalService.getCountdownInfo(prop.targetSubmissionDate);

                  return (
                    <tr 
                      key={prop.id} 
                      className="prop-row-click"
                      onClick={() => setSelectedProposalId(prop.id)}
                    >
                      {/* ID */}
                      <td className="mono td-id">
                        <strong>{prop.id}</strong>
                      </td>

                      {/* Opp / Portal */}
                      <td>
                        <span className="mono opp-num-text">#{prop.opportunityNumber}</span>
                        <span className="portal-mini-pill">{prop.portal}</span>
                      </td>

                      {/* Objeto */}
                      <td className="td-object-col">
                        <strong className="client-text-name">{prop.client}</strong>
                        <p className="object-snippet-text">{prop.object}</p>
                      </td>

                      {/* Empresa */}
                      <td>
                        <span className="company-pill">{prop.participatingCompany}</span>
                      </td>

                      {/* Preço */}
                      <td className="mono td-price">
                        {ProposalService.formatCurrency(prop.pricing?.definedPrice)}
                      </td>

                      {/* Margem */}
                      <td>
                        <span className="margin-pill text-emerald">
                          {prop.pricing?.finalMargin}%
                        </span>
                      </td>

                      {/* Readiness */}
                      <td>
                        <div className="mini-readiness-wrap">
                          <span className={`readiness-dot-pill ${r.badgeClass}`}>
                            {r.totalScore}%
                          </span>
                        </div>
                      </td>

                      {/* Prazo */}
                      <td>
                        <span className={`countdown-col-pill ${cd.urgencyClass}`}>
                          <Clock size={11} />
                          <span>{cd.text}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-col-tag status-${prop.status.toLowerCase().replace(/ /g, '-')}`}>
                          {prop.status}
                        </span>
                      </td>

                      {/* Bloqueadores */}
                      <td>
                        {r.hasBlockers ? (
                          <span className="blocker-mini-warning" title={r.blockers[0].title}>
                            <Lock size={12} />
                            <span>{r.blockers.length} Bloqueio(s)</span>
                          </span>
                        ) : (
                          <span className="no-blocker-ok">
                            <CheckCircle2 size={13} /> Regular
                          </span>
                        )}
                      </td>

                      {/* Ação */}
                      <td className="td-action-btn" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="btn-open-proposal-detail"
                          onClick={() => setSelectedProposalId(prop.id)}
                        >
                          <span>Abrir</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 2: KANBAN OPERACIONAL (Item 56) */}
      {/* ======================================================== */}
      {viewMode === 'kanban' && (
        <div className="kanban-board-container">
          {kanbanColumns.map(col => {
            const colProposals = filteredProposals.filter(p => {
              if (col.id === ProposalStatus.ENCERRADA) {
                return p.status === ProposalStatus.ENCERRADA || p.status === ProposalStatus.CANCELADA;
              }
              return p.status === col.id;
            });

            return (
              <div key={col.id} className="kanban-column">
                <div className="kanban-col-head">
                  <span className="col-title">{col.label}</span>
                  <span className="col-count">{colProposals.length}</span>
                </div>

                <div className="kanban-cards-stack">
                  {colProposals.map(cp => {
                    const r = ProposalService.calculateReadiness(cp);
                    const cd = ProposalService.getCountdownInfo(cp.targetSubmissionDate);

                    return (
                      <div 
                        key={cp.id} 
                        className="kanban-proposal-card"
                        onClick={() => setSelectedProposalId(cp.id)}
                      >
                        <div className="k-card-top">
                          <span className="mono k-id">{cp.id}</span>
                          <span className={`k-readiness ${r.badgeClass}`}>{r.totalScore}%</span>
                        </div>

                        <h4 className="k-client">{cp.client}</h4>
                        <p className="k-object">{cp.object}</p>

                        <div className="k-meta-row">
                          <span className="k-price mono">{ProposalService.formatCurrency(cp.pricing?.definedPrice)}</span>
                          <span className="k-margin">{cp.pricing?.finalMargin}% Margem</span>
                        </div>

                        <div className="k-footer-row">
                          <span className="k-company">{cp.participatingCompany}</span>
                          <span className={`k-time ${cd.urgencyClass}`}>
                            <Clock size={11} /> {cd.text}
                          </span>
                        </div>

                        {r.hasBlockers && (
                          <div className="k-blocker-tag">
                            <Lock size={11} />
                            <span>{r.blockers[0].title}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 3: CALENDÁRIO DE PRAZOS & ENCERRAMENTOS (Item 55) */}
      {/* ======================================================== */}
      {viewMode === 'calendar' && (
        <div className="calendar-timeline-container">
          <div className="cal-header-bar">
            <div>
              <h3>Cronograma de Encerramentos & Prazos Críticos</h3>
              <p>Visualização cronológica das datas de envio, aprovações e sessões públicas.</p>
            </div>
          </div>

          <div className="calendar-cards-grid">
            {filteredProposals.map(cp => {
              const cd = ProposalService.getCountdownInfo(cp.targetSubmissionDate);
              const r = ProposalService.calculateReadiness(cp);

              return (
                <div key={cp.id} className="calendar-event-card" onClick={() => setSelectedProposalId(cp.id)}>
                  <div className="cal-date-badge">
                    <CalendarIcon size={16} />
                    <span className="cal-date-txt">{cp.targetSubmissionDate}</span>
                  </div>

                  <div className="cal-event-body">
                    <div className="cal-event-head">
                      <strong>{cp.client}</strong>
                      <span className={`cal-urgency-pill ${cd.urgencyClass}`}>{cd.text}</span>
                    </div>

                    <p className="cal-object">{cp.object}</p>

                    <div className="cal-sub-meta">
                      <span>Proposta: <strong>{cp.id}</strong></span>
                      <span>Valor: <strong className="text-teal mono">{ProposalService.formatCurrency(cp.pricing?.definedPrice)}</strong></span>
                      <span>Readiness: <strong className="text-emerald">{r.totalScore}%</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODO 4: ASSISTENTE DE PROPOSTA (IA REAL - Itens 60 e 61) */}
      {/* ======================================================== */}
      {viewMode === 'assistant' && (
        <div className="assistant-container">
          <div className="assistant-left-panel">
            <div className="assistant-hero-head">
              <Bot size={22} className="text-teal" />
              <div>
                <h3>Assistente Especialista de Proposta</h3>
                <span>Respostas estritas com base nos dados reais cadastrados (Item 61).</span>
              </div>
            </div>

            <div className="assistant-selector-box">
              <label>Selecione a Proposta para Análise:</label>
              <select 
                className="form-input"
                value={assistantSelectedProposalId}
                onChange={(e) => setAssistantSelectedProposalId(e.target.value)}
              >
                {proposals.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} — {p.client} ({ProposalService.formatCurrency(p.pricing?.definedPrice)})
                  </option>
                ))}
              </select>
            </div>

            {/* 60. PERGUNTAS RÁPIDAS OBRIGATÓRIAS */}
            <div className="assistant-quick-prompts">
              <span className="prompts-title">Perguntas Frequentes (Item 60):</span>
              <button onClick={() => handleAskAssistant('O que falta para enviar?')}>
                “O que falta para enviar?”
              </button>
              <button onClick={() => handleAskAssistant('Quais documentos estão pendentes?')}>
                “Quais documentos estão pendentes?”
              </button>
              <button onClick={() => handleAskAssistant('Qual é o custo total?')}>
                “Qual é o custo total?”
              </button>
              <button onClick={() => handleAskAssistant('Qual a margem atual?')}>
                “Qual a margem atual?”
              </button>
              <button onClick={() => handleAskAssistant('Temos algum bloqueador?')}>
                “Temos algum bloqueador?”
              </button>
              <button onClick={() => handleAskAssistant('Quem está com tarefa atrasada?')}>
                “Quem está com tarefa atrasada?”
              </button>
              <button onClick={() => handleAskAssistant('Qual proposta precisa de atenção hoje?')}>
                “Qual proposta precisa de atenção hoje?”
              </button>
            </div>
          </div>

          <div className="assistant-chat-panel">
            <div className="chat-messages-scroll">
              {assistantChatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.sender}`}>
                  <div className="bubble-header">
                    <strong>{msg.sender === 'user' ? 'Você' : 'Vellia Assistente'}</strong>
                  </div>
                  <pre className="bubble-text">{msg.text}</pre>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="bubble-sources">
                      <span>Fontes: {msg.sources.join(' • ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form 
              className="chat-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAssistant();
              }}
            >
              <input 
                type="text"
                placeholder="Faça uma pergunta sobre a proposta selecionada..."
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
              />
              <button type="submit">
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CRIAR PROPOSTA A PARTIR DE OPORTUNIDADE GO (Item 1 e 2) */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div className="modal-backdrop-clean" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box-clean" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head-row">
              <h3>Criar Nova Proposta Comercial</h3>
              <button onClick={() => setShowCreateModal(false)}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
            </div>

            <p className="modal-sub-desc">
              Toda oportunidade marcada com decisão <strong>GO</strong> ou <strong>GO COM PENDÊNCIAS</strong> pode ser convertida em proposta operacional com importação automática de todos os requisitos do edital.
            </p>

            <form onSubmit={handleCreateProposal}>
              <div className="form-group-clean">
                <label>Selecione a Oportunidade Aprovada (GO):</label>
                <select 
                  className="form-select-clean"
                  value={selectedOppForCreation}
                  onChange={(e) => setSelectedOppForCreation(e.target.value)}
                  required
                >
                  <option value="">Selecione uma oportunidade...</option>
                  {eligibleOpps.map(opp => (
                    <option key={opp.id || opp.number} value={opp.id || opp.number}>
                      #{opp.number || opp.id} — {opp.client} | {opp.title.substring(0, 45)}... ({opp.score}% Aderência)
                    </option>
                  ))}
                </select>
              </div>

              {selectedOppForCreation && (() => {
                const sel = allOpps.find(o => String(o.id || o.number) === String(selectedOppForCreation));
                if (!sel) return null;
                const dec = DecisionService.calculateDecision(sel);

                return (
                  <div className="imported-preview-card">
                    <span className="prev-title">Metadados a serem importados automaticamente (Item 2):</span>
                    <ul className="prev-list">
                      <li>• Portal: <strong>{sel.portal}</strong> | Contratante: <strong>{sel.client}</strong></li>
                      <li>• Empresa Participante: <strong>{sel.recommendedCompany}</strong></li>
                      <li>• Decision Score: <strong>{dec.decisionScore}%</strong> | Risk Score: <strong>{dec.risks?.riskScore}%</strong></li>
                      <li>• Objeto: <em>"{sel.object || sel.title}"</em></li>
                      <li>• Prazo: <strong>{sel.endDate}</strong> ({sel.daysLeft} dias restantes)</li>
                    </ul>
                  </div>
                );
              })()}

              <div className="modal-actions-row">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirm-create" disabled={!selectedOppForCreation}>
                  <Sparkles size={15} />
                  <span>Gerar Proposta e Abrir Central</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CENTRAL OPERACIONAL DA PROPOSTA SELECIONADA */}
      {/* ======================================================== */}
      {selectedProposalId && (
        <ProposalDetailView 
          proposalId={selectedProposalId}
          onClose={() => setSelectedProposalId(null)}
          onUpdated={reloadData}
        />
      )}
    </div>
  );
}
