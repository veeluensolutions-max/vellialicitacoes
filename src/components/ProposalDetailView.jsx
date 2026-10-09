import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  Users, 
  ListChecks, 
  FolderLock, 
  Briefcase, 
  ExternalLink, 
  Send, 
  History, 
  FileCheck, 
  Plus, 
  Edit3, 
  TrendingUp, 
  Building2, 
  AlertOctagon,
  Calculator,
  Layers,
  FileSpreadsheet,
  Check,
  Award,
  FileSignature
} from 'lucide-react';
import { 
  ProposalService, 
  ProposalStatus, 
  TaskStatus, 
  ProposalDocStatus, 
  TenderResult, 
  LossReason 
} from '../services/proposal/proposalService';
import { ResultsIntelligenceService } from '../services/results/resultsIntelligenceService';
import './ProposalDetailView.css';

export default function ProposalDetailView({ proposalId, onClose, onUpdated }) {
  const [proposal, setProposal] = useState(() => ProposalService.getById(proposalId));
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'pricing' | 'dossier' | 'proposals' | 'approvals' | 'submission' | 'audit'

  // Submissão & Modais
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPriceEditModal, setShowPriceEditModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  // Estados de Edição de Preço
  const [tempPrice, setTempPrice] = useState(proposal?.pricing?.definedPrice || 0);
  const [priceEditReason, setPriceEditReason] = useState('');
  const [priceEditAuthor, setPriceEditAuthor] = useState('Carlos Silveira (Controladoria)');

  // Estados de Nova Tarefa
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskResp, setNewTaskResp] = useState(proposal?.responsibles?.principal || 'Dr. Roberto Albuquerque');
  const [newTaskDeadline, setNewTaskDeadline] = useState(proposal?.opportunityDeadline || '24/10/2026');
  const [newTaskPriority, setNewTaskPriority] = useState('Alta');

  // Estados de Envio
  const [submitChecklist, setSubmitChecklist] = useState({
    docComplete: true,
    priceApproved: proposal?.priceApproval?.status === 'Aprovado',
    techReviewed: true,
    commReviewed: true,
    deadlineValid: true,
    portalCorrect: true,
    finalFileCorrect: true
  });
  const [submitProtocol, setSubmitProtocol] = useState(() => `PETRO-${String(Math.floor(100000 + Math.random() * 900000))}`);
  const [submitReceiptFile, setSubmitReceiptFile] = useState('Comprovante_Oficial_Petronect.pdf');
  const [submitAuthor, setSubmitAuthor] = useState('Mariana Castro (Gerente de Contratos)');
  const [submitObs, setSubmitObs] = useState('');
  const [allowBlockerOverride, setAllowBlockerOverride] = useState(false);

  // Estados de Resultado
  const [resultStatus, setResultStatus] = useState(TenderResult.GANHA);
  const [lossReason, setLossReason] = useState(LossReason.PRECO);
  const [resultNotes, setResultNotes] = useState('');

  // Notificação de feedback
  const [feedback, setFeedback] = useState(null);

  if (!proposal) return null;

  const readiness = ProposalService.calculateReadiness(proposal);
  const countdown = ProposalService.getCountdownInfo(proposal.targetSubmissionDate || proposal.opportunityDeadline);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const refreshProposal = () => {
    const updated = ProposalService.getById(proposal.id);
    setProposal(updated);
    if (onUpdated) onUpdated(updated);
  };

  // Salvar Alteração de Preço
  const handleSavePrice = (e) => {
    e.preventDefault();
    if (!tempPrice || Number(tempPrice) <= 0) {
      alert('Informe um valor de preço de venda válido.');
      return;
    }
    ProposalService.updateDefinedPrice(
      proposal.id, 
      Number(tempPrice), 
      priceEditAuthor, 
      priceEditReason || 'Ajuste de margem e competitividade'
    );
    setShowPriceEditModal(false);
    refreshProposal();
    showFeedback('Preço atualizado com sucesso e nova versão registrada!');
  };

  // Aprovar Preço
  const handleApprovePrice = () => {
    ProposalService.approvePrice(proposal.id, 'Diretoria Comercial', 'Aprovado conforme margem meta.');
    refreshProposal();
    showFeedback('Preço de venda aprovado formalmente!');
  };

  // Alternar Status de Tarefa
  const handleToggleTaskStatus = (taskId, newStatus) => {
    const updatedTasks = proposal.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    const updated = { ...proposal, tasks: updatedTasks };
    ProposalService.saveProposal(updated, 'Operador de Tarefas', `Status da tarefa alterado para ${newStatus}`);
    refreshProposal();
  };

  // Adicionar Nova Tarefa
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: `task-${Date.now()}`,
      proposalId: proposal.id,
      opportunityNumber: proposal.opportunityNumber,
      title: newTaskTitle,
      description: newTaskDesc,
      responsible: newTaskResp,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      status: TaskStatus.PENDENTE,
      dependency: null,
      observation: '',
      attachment: null
    };

    const updated = { ...proposal, tasks: [...proposal.tasks, newTask] };
    ProposalService.saveProposal(updated, newTaskResp, `Nova tarefa criada: "${newTaskTitle}"`);
    setShowNewTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDesc('');
    refreshProposal();
    showFeedback('Tarefa adicionada com sucesso ao cronograma!');
  };

  // Alternar Status de Documento no Dossiê
  const handleToggleDocStatus = (docId, newStatus) => {
    const updatedItems = proposal.dossier.items.map(d => d.id === docId ? { ...d, status: newStatus } : d);
    const updated = { ...proposal, dossier: { ...proposal.dossier, items: updatedItems } };
    ProposalService.saveProposal(updated, 'Dra. Mariana Lemos', `Status do documento alterado para ${newStatus}`);
    refreshProposal();
  };

  // Aprovação Interna
  const handleInternalApproval = (type, status) => {
    ProposalService.recordInternalApproval(
      proposal.id, 
      type, 
      status, 
      'Diretoria Técnica / Comercial', 
      'Conformidade confirmada.'
    );
    refreshProposal();
    showFeedback(`Aprovação (${type}) registrada com sucesso!`);
  };

  // Submissão Oficial
  const handleExecuteSubmission = (e) => {
    e.preventDefault();
    try {
      ProposalService.recordSubmission(proposal.id, {
        submissionDate: new Date().toLocaleDateString('pt-BR'),
        submissionTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        protocolNumber: submitProtocol,
        receiptAttachment: submitReceiptFile,
        observations: submitObs,
        allowOverride: allowBlockerOverride
      }, submitAuthor);

      setShowSubmitModal(false);
      refreshProposal();
      showFeedback('Proposta marcada como ENVIADA no portal com protocolo gerado!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Registro de Resultado (Integrado com Fase 12)
  const handleSaveResult = (e) => {
    e.preventDefault();
    ProposalService.recordTenderResult(proposal.id, {
      status: resultStatus,
      lossReason: resultStatus === TenderResult.PERDIDA ? lossReason : null,
      notes: resultNotes
    }, 'Comitê de Licitações');

    // Sincronização automática com a Memória Comercial (Fase 12)
    ResultsIntelligenceService.saveResult({
      opportunityNumber: proposal.opportunityNumber,
      proposalId: proposal.id,
      participatingCompany: proposal.participatingCompany,
      portal: proposal.portal,
      client: proposal.client,
      service: proposal.primaryService,
      outcome: resultStatus === TenderResult.GANHA ? 'GANHA' : 'PERDIDA',
      ourPrice: proposal.pricing?.definedPrice || 0,
      winningPrice: resultStatus === TenderResult.GANHA ? proposal.pricing?.definedPrice : null,
      winningCompany: resultStatus === TenderResult.GANHA ? proposal.participatingCompany : 'Concorrente Vencedor',
      lossCategory: lossReason,
      observations: resultNotes
    }, 'Comitê de Licitações (Gestão de Propostas)');

    setShowResultModal(false);
    refreshProposal();
    showFeedback(`Desfecho registrado: ${resultStatus}! Memória comercial atualizada.`);
  };

  return (
    <div className="proposal-detail-overlay" onClick={onClose}>
      <div className="proposal-detail-container" onClick={(e) => e.stopPropagation()}>
        
        {/* TOPO / HEADER DA PROPOSTA OPERACIONAL (Item 40) */}
        <header className="proposal-top-hero">
          <div className="hero-left-meta">
            <div className="meta-badge-row">
              <span className="opp-tag-pill mono">Oportunidade #{proposal.opportunityNumber}</span>
              <span className="portal-tag-pill">{proposal.portal}</span>
              <span className={`status-tag-pill status-${proposal.status.toLowerCase().replace(/ /g, '-')}`}>
                {proposal.status}
              </span>
              <span className="company-badge-pill">{proposal.participatingCompany}</span>
            </div>

            <h2 className="proposal-hero-title">{proposal.object}</h2>
            <p className="proposal-hero-client">
              <Building2 size={15} />
              <span>Contratante: <strong>{proposal.client}</strong></span>
              <span className="dot-divider">•</span>
              <span>Serviço: <strong>{proposal.primaryService}</strong></span>
            </p>
          </div>

          <div className="hero-right-action-group">
            {/* Countdown de Prazo (Item 9 e 10) */}
            <div className={`countdown-card ${countdown.urgencyClass}`}>
              <div className="countdown-head">
                <Clock size={14} />
                <span>Tempo Restante</span>
              </div>
              <span className="countdown-time-val">{countdown.text}</span>
              <span className="countdown-date-sub">Envio: {proposal.targetSubmissionDate}</span>
            </div>

            {/* Proposal Readiness Score (Item 37 e 38) */}
            <div className={`readiness-hero-card ${readiness.badgeClass}`}>
              <div className="readiness-radial">
                <span className="readiness-number">{readiness.totalScore}%</span>
                <span className="readiness-label">Prontidão</span>
              </div>
              <div className="readiness-meta">
                <span className={`readiness-pill ${readiness.badgeClass}`}>{readiness.classification}</span>
                <span className="readiness-hint">
                  {readiness.hasBlockers ? `${readiness.blockers.length} Bloqueador(es)` : 'Sem bloqueadores'}
                </span>
              </div>
            </div>

            <button className="btn-close-modal" onClick={onClose} aria-label="Fechar modal">
              <X size={20} />
            </button>
          </div>
        </header>

        {/* WORKSPACE STRIP (FASE 25: ITENS 50 A 52) */}
        <div className="proposal-workspace-strip">
          <div className="workspace-stat-item">
            <span className="stat-label">Prazo de Envio</span>
            <strong className="stat-val tabular">{countdown.text}</strong>
            <span className="stat-sub">{proposal.targetSubmissionDate || proposal.opportunityDeadline}</span>
          </div>
          <div className="workspace-divider" />
          <div className="workspace-stat-item">
            <span className="stat-label">Status da Proposta</span>
            <strong className="stat-val">{proposal.status}</strong>
            <span className="stat-sub">{proposal.participatingCompany}</span>
          </div>
          <div className="workspace-divider" />
          <div className="workspace-stat-item">
            <span className="stat-label">Prontidão</span>
            <strong className="stat-val tabular">{readiness.totalScore}%</strong>
            <span className={`stat-sub ${readiness.hasBlockers ? 'text-danger' : 'text-success'}`}>
              {readiness.hasBlockers ? `${readiness.blockers.length} bloqueador(es)` : 'Pronta para envio'}
            </span>
          </div>
          <div className="workspace-divider" />
          <div className="workspace-stat-item">
            <span className="stat-label">Resumo de Preço (Item 52)</span>
            <strong className="stat-val tabular">
              R$ {(proposal?.pricing?.definedPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
            <span className="stat-sub">
              Custo: R$ {(proposal?.pricing?.totalCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • Margem: {proposal?.pricing?.targetMarginPct || 0}%
            </span>
          </div>
          <div className="workspace-divider" />
          <div className="workspace-stat-item">
            <span className="stat-label">Responsável</span>
            <strong className="stat-val">{proposal.responsibles?.principal || 'Dr. Roberto Albuquerque'}</strong>
            <span className="stat-sub">{proposal.responsibles?.commercial || 'Coordenação Comercial'}</span>
          </div>
        </div>

        {/* FEEDBACK TOAST */}
        {feedback && (
          <div className="proposal-feedback-toast">
            <CheckCircle2 size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {/* BANNER DE BLOQUEADORES CRÍTICOS (FASE 25: ITEM 53) */}
        {readiness.hasBlockers && (
          <div className="blocker-alert-banner">
            <div className="blocker-banner-head">
              <AlertOctagon size={18} />
              <div className="head-text">
                <strong>{readiness.blockers.length === 1 ? '1 bloqueador impede o envio' : `${readiness.blockers.length} bloqueadores impedem o envio`}</strong>
                <span>Existem pendências impeditivas que precisam ser resolvidas antes da submissão no portal.</span>
              </div>
            </div>
            <div className="blockers-pill-list">
              {readiness.blockers.map(b => (
                <div key={b.id} className="blocker-pill-item">
                  <span className="blocker-tag">{b.severity}</span>
                  <div className="blocker-info">
                    <strong>{b.title}</strong>
                    <p>{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE DE EVOLUÇÃO DA PROPOSTA (Item 41) */}
        <div className="proposal-timeline-bar">
          <div className="timeline-step completed">
            <span className="step-dot"><Check size={12} /></span>
            <span className="step-lbl">GO Aprovado</span>
          </div>
          <div className="timeline-connector completed" />
          <div className="timeline-step completed">
            <span className="step-dot"><Check size={12} /></span>
            <span className="step-lbl">Proposta Criada</span>
          </div>
          <div className="timeline-connector completed" />
          <div className={`timeline-step ${proposal.responsibles?.principal ? 'completed' : 'active'}`}>
            <span className="step-dot"><Check size={12} /></span>
            <span className="step-lbl">Responsáveis</span>
          </div>
          <div className="timeline-connector completed" />
          <div className={`timeline-step ${proposal.pricing?.definedPrice > 0 ? 'completed' : 'active'}`}>
            <span className="step-dot"><Check size={12} /></span>
            <span className="step-lbl">Custos Levantados</span>
          </div>
          <div className="timeline-connector completed" />
          <div className={`timeline-step ${proposal.priceApproval?.status === 'Aprovado' ? 'completed' : 'active'}`}>
            <span className="step-dot">{proposal.priceApproval?.status === 'Aprovado' ? <Check size={12} /> : '5'}</span>
            <span className="step-lbl">Preço Aprovado</span>
          </div>
          <div className="timeline-connector" />
          <div className={`timeline-step ${readiness.totalScore >= 90 ? 'completed' : 'pending'}`}>
            <span className="step-dot">{readiness.totalScore >= 90 ? <Check size={12} /> : '6'}</span>
            <span className="step-lbl">Dossiê Completo</span>
          </div>
          <div className="timeline-connector" />
          <div className={`timeline-step ${proposal.status === ProposalStatus.ENVIADA ? 'completed' : 'pending'}`}>
            <span className="step-dot">{proposal.status === ProposalStatus.ENVIADA ? <Check size={12} /> : '7'}</span>
            <span className="step-lbl">Enviada</span>
          </div>
          <div className="timeline-connector" />
          <div className={`timeline-step ${proposal.result?.status === TenderResult.GANHA ? 'completed' : 'pending'}`}>
            <span className="step-dot">{proposal.result?.status === TenderResult.GANHA ? <Award size={12} /> : '8'}</span>
            <span className="step-lbl">{proposal.result?.status || 'Resultado'}</span>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS OPERACIONAIS */}
        <nav className="proposal-tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Briefcase size={15} />
            <span>Visão Geral & Responsáveis</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <ListChecks size={15} />
            <span>Tarefas & Checklist ({proposal.tasks?.length || 0})</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            <Calculator size={15} />
            <span>Composição de Preço & Cotações</span>
            {proposal.priceApproval?.status === 'Aprovado' && <span className="tab-ok-dot" />}
          </button>

          <button 
            className={`tab-btn ${activeTab === 'dossier' ? 'active' : ''}`}
            onClick={() => setActiveTab('dossier')}
          >
            <FolderLock size={15} />
            <span>Dossiê da Proposta (13 Pastas)</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'proposals' ? 'active' : ''}`}
            onClick={() => setActiveTab('proposals')}
          >
            <FileText size={15} />
            <span>Proposta Técnica & Comercial ({proposal.versions?.length || 1})</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveTab('approvals')}
          >
            <FileSignature size={15} />
            <span>Aprovações Internas</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'submission' ? 'active' : ''}`}
            onClick={() => setActiveTab('submission')}
          >
            <Send size={15} />
            <span>Envio & Resultado</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <History size={15} />
            <span>Auditoria & Logs</span>
          </button>
        </nav>

        {/* CONTEÚDO PRINCIPAL DA CENTRAL */}
        <div className="proposal-body-scroll">
          
          {/* ABA 1: VISÃO GERAL & RESPONSÁVEIS (Item 4) */}
          {activeTab === 'overview' && (
            <div className="tab-pane-content">
              
              {/* Cards Rápidos de Informação e Preço */}
              <div className="overview-stats-grid">
                <div className="ov-card">
                  <span className="ov-label">Preço Ofertado Definido</span>
                  <div className="ov-val-row">
                    <span className="ov-val text-teal">{ProposalService.formatCurrency(proposal.pricing?.definedPrice)}</span>
                    <button 
                      className="btn-mini-edit" 
                      onClick={() => setShowPriceEditModal(true)}
                      title="Editar preço e registrar justificativa"
                    >
                      <Edit3 size={13} /> Editar
                    </button>
                  </div>
                  <span className="ov-sub">Margem calculada: <strong>{proposal.pricing?.finalMargin}%</strong></span>
                </div>

                <div className="ov-card">
                  <span className="ov-label">Custo Total Estimado</span>
                  <div className="ov-val-row">
                    <span className="ov-val">{ProposalService.formatCurrency(proposal.pricing?.totalEstimatedCost)}</span>
                  </div>
                  <span className="ov-sub">
                    {proposal.pricing?.itemsPendingQuote > 0 
                      ? `⚠️ ${proposal.pricing.itemsPendingQuote} itens pendentes de cotação` 
                      : 'Custo direto e indireto 100% cotado'}
                  </span>
                </div>

                <div className="ov-card">
                  <span className="ov-label">Status de Aprovação do Preço</span>
                  <div className="ov-val-row">
                    <span className={`approval-badge badge-${(proposal.priceApproval?.status || 'Pendente').toLowerCase()}`}>
                      {proposal.priceApproval?.status || 'Pendente'}
                    </span>
                  </div>
                  <span className="ov-sub">Por: {proposal.priceApproval?.approvedBy || 'Aguardando validação'}</span>
                </div>

                <div className="ov-card">
                  <span className="ov-label">Scores Estratégicos</span>
                  <div className="ov-score-tags">
                    <span className="score-tag text-emerald">Aderência: {proposal.adherenceScore}%</span>
                    <span className="score-tag text-blue">Decision: {proposal.decisionScore}%</span>
                    <span className="score-tag text-amber">Risco: {proposal.riskScore}%</span>
                  </div>
                  <span className="ov-sub">Originados do Motor Inteligente Vellia</span>
                </div>
              </div>

              {/* MATRIZ DE RESPONSÁVEIS DESIGNADOS (Item 4) */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <Users size={17} />
                    <h3>Comitê Responsável da Proposta</h3>
                  </div>
                  <span className="card-head-hint">Permite uma mesma pessoa acumulando múltiplas atribuições operacionais.</span>
                </div>

                <div className="responsibles-grid">
                  <div className="resp-role-card">
                    <span className="role-title">1. Responsável Principal</span>
                    <div className="role-person-box">
                      <strong>{proposal.responsibles?.principal}</strong>
                      <span className="role-desc">Gestão global do processo e interface executiva</span>
                    </div>
                  </div>

                  <div className="resp-role-card">
                    <span className="role-title">2. Responsável Técnico</span>
                    <div className="role-person-box">
                      <strong>{proposal.responsibles?.tecnico}</strong>
                      <span className="role-desc">Validação metodológica, atestados e ART</span>
                    </div>
                  </div>

                  <div className="resp-role-card">
                    <span className="role-title">3. Responsável Comercial</span>
                    <div className="role-person-box">
                      <strong>{proposal.responsibles?.comercial}</strong>
                      <span className="role-desc">Precificação, cotações e minuta comercial</span>
                    </div>
                  </div>

                  <div className="resp-role-card">
                    <span className="role-title">4. Responsável Documental</span>
                    <div className="role-person-box">
                      <strong>{proposal.responsibles?.documental}</strong>
                      <span className="role-desc">Habilitação jurídica, fiscal, CNDs e declarações</span>
                    </div>
                  </div>

                  <div className="resp-role-card">
                    <span className="role-title">5. Responsável Financeiro</span>
                    <div className="role-person-box">
                      <strong>{proposal.responsibles?.financeiro}</strong>
                      <span className="role-desc">Garantias contratuais, tributos e margem líquida</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETALHES DO EDITAL E ENLACE EXTERNO */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <FileText size={17} />
                    <h3>Dados da Oportunidade Importados</h3>
                  </div>
                  {proposal.submission?.portalUrl && (
                    <a 
                      href={proposal.submission.portalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-open-portal"
                    >
                      <ExternalLink size={13} />
                      <span>Abrir Oportunidade no Portal Petronect</span>
                    </a>
                  )}
                </div>

                <div className="opp-meta-table">
                  <div className="meta-line">
                    <span className="lbl">Número da Oportunidade:</span>
                    <span className="val mono">{proposal.opportunityNumber}</span>
                  </div>
                  <div className="meta-line">
                    <span className="lbl">Contratante:</span>
                    <span className="val">{proposal.client}</span>
                  </div>
                  <div className="meta-line">
                    <span className="lbl">Portal de Disputa:</span>
                    <span className="val">{proposal.portal}</span>
                  </div>
                  <div className="meta-line">
                    <span className="lbl">Valor Estimado no Edital:</span>
                    <span className="val">{proposal.estimatedValue}</span>
                  </div>
                  <div className="meta-line">
                    <span className="lbl">Prazo Limite para Acolhimento:</span>
                    <span className="val">{proposal.opportunityDeadline}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: TAREFAS & CHECKLIST OPERACIONAL/DINÂMICO (Itens 5, 6, 7, 8) */}
          {activeTab === 'tasks' && (
            <div className="tab-pane-content">
              <div className="tasks-action-bar">
                <div className="tasks-summary-text">
                  <strong>{proposal.tasks?.length || 0} tarefas programadas</strong>
                  <span>Checklist padrão + Requisitos dinâmicos identificados no edital</span>
                </div>
                <button className="btn-add-task" onClick={() => setShowNewTaskModal(true)}>
                  <Plus size={14} />
                  <span>Adicionar Tarefa</span>
                </button>
              </div>

              <div className="tasks-table-card">
                <table className="corporate-task-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>OK</th>
                      <th>Título & Escopo da Tarefa</th>
                      <th>Responsável</th>
                      <th>Data Limite</th>
                      <th>Prioridade</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.tasks?.map((t) => (
                      <tr key={t.id} className={`task-row-status-${t.status.toLowerCase().replace(/ /g, '-')}`}>
                        <td>
                          <button 
                            className={`btn-check-task ${t.status === TaskStatus.CONCLUIDA ? 'checked' : ''}`}
                            onClick={() => handleToggleTaskStatus(
                              t.id, 
                              t.status === TaskStatus.CONCLUIDA ? TaskStatus.PENDENTE : TaskStatus.CONCLUIDA
                            )}
                            title="Alternar conclusão"
                          >
                            {t.status === TaskStatus.CONCLUIDA && <Check size={13} />}
                          </button>
                        </td>
                        <td>
                          <div className="task-title-cell">
                            <strong>{t.title}</strong>
                            <p>{t.description}</p>
                            {t.dependency && <span className="dep-tag">Depende de: {t.dependency}</span>}
                          </div>
                        </td>
                        <td>
                          <span className="resp-badge-pill">{t.responsible}</span>
                        </td>
                        <td>
                          <span className="mono task-deadline">{t.deadline}</span>
                        </td>
                        <td>
                          <span className={`priority-pill priority-${t.priority.toLowerCase()}`}>{t.priority}</span>
                        </td>
                        <td>
                          <select 
                            className="select-task-status"
                            value={t.status}
                            onChange={(e) => handleToggleTaskStatus(t.id, e.target.value)}
                          >
                            <option value={TaskStatus.PENDENTE}>Pendente</option>
                            <option value={TaskStatus.EM_ANDAMENTO}>Em andamento</option>
                            <option value={TaskStatus.AGUARDANDO_TERCEIRO}>Aguardando terceiro</option>
                            <option value={TaskStatus.CONCLUIDA}>Concluída</option>
                            <option value={TaskStatus.BLOQUEADA}>Bloqueada</option>
                            <option value={TaskStatus.CANCELADA}>Cancelada</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            className="btn-task-action"
                            onClick={() => handleToggleTaskStatus(t.id, TaskStatus.CONCLUIDA)}
                            disabled={t.status === TaskStatus.CONCLUIDA}
                          >
                            Finalizar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 3: COMPOSIÇÃO DE PREÇO & COTAÇÕES (Itens 11 a 28) */}
          {activeTab === 'pricing' && (
            <div className="tab-pane-content">
              
              {/* HERO DE FORMAÇÃO DE PREÇO */}
              <div className="pricing-hero-overview">
                <div className="p-hero-box">
                  <span className="lbl">Custo Total Direto + Indireto</span>
                  <span className="val">{ProposalService.formatCurrency(proposal.pricing?.totalEstimatedCost)}</span>
                  <span className="sub">Soma de todos os insumos informados</span>
                </div>

                <div className="p-hero-box highlight">
                  <span className="lbl">Preço Definido de Venda</span>
                  <span className="val text-teal">{ProposalService.formatCurrency(proposal.pricing?.definedPrice)}</span>
                  <button className="btn-inline-change" onClick={() => setShowPriceEditModal(true)}>
                    Alterar Preço
                  </button>
                </div>

                <div className="p-hero-box">
                  <span className="lbl">Margem Final Aplicada</span>
                  <span className="val text-emerald">{proposal.pricing?.finalMargin}%</span>
                  <span className="sub">Modelo: {proposal.pricing?.pricingMethod} ({proposal.pricing?.markupOrBdiRate}%)</span>
                </div>

                <div className="p-hero-box">
                  <span className="lbl">Homologação da Diretoria</span>
                  <span className={`status-pill pill-${(proposal.priceApproval?.status || 'Pendente').toLowerCase()}`}>
                    {proposal.priceApproval?.status || 'Pendente'}
                  </span>
                  {proposal.priceApproval?.status !== 'Aprovado' && (
                    <button className="btn-approve-price-now" onClick={handleApprovePrice}>
                      <CheckCircle2 size={13} /> Aprovar Preço
                    </button>
                  )}
                </div>
              </div>

              {/* 23. TRÊS CENÁRIOS FINANCEIROS */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <TrendingUp size={17} />
                    <h3>Três Cenários de Preço & Competitividade</h3>
                  </div>
                  <span className="card-head-hint">Permite análise de sensibilidade entre margem e taxa de vitória.</span>
                </div>

                <div className="scenarios-comparison-grid">
                  {/* Conservador */}
                  <div className="scenario-card-col">
                    <div className="sc-head">
                      <span className="sc-badge">Conservador</span>
                      <h4>{ProposalService.formatCurrency(proposal.pricing?.scenarios?.conservador?.price)}</h4>
                      <span className="sc-margin">Margem: {proposal.pricing?.scenarios?.conservador?.margin}%</span>
                    </div>
                    <div className="sc-body">
                      <p><strong>Risco:</strong> {proposal.pricing?.scenarios?.conservador?.risk}</p>
                      <p><strong>Competitividade:</strong> {proposal.pricing?.scenarios?.conservador?.competitivenessProbability}</p>
                    </div>
                  </div>

                  {/* Provável (Alvo) */}
                  <div className="scenario-card-col target">
                    <div className="sc-head">
                      <span className="sc-badge target">Provável (Alvo)</span>
                      <h4>{ProposalService.formatCurrency(proposal.pricing?.scenarios?.provavel?.price)}</h4>
                      <span className="sc-margin">Margem: {proposal.pricing?.scenarios?.provavel?.margin}%</span>
                    </div>
                    <div className="sc-body">
                      <p><strong>Risco:</strong> {proposal.pricing?.scenarios?.provavel?.risk}</p>
                      <p><strong>Competitividade:</strong> {proposal.pricing?.scenarios?.provavel?.competitivenessProbability}</p>
                    </div>
                  </div>

                  {/* Agressivo */}
                  <div className="scenario-card-col">
                    <div className="sc-head">
                      <span className="sc-badge aggressive">Agressivo</span>
                      <h4>{ProposalService.formatCurrency(proposal.pricing?.scenarios?.agressivo?.price)}</h4>
                      <span className="sc-margin">Margem: {proposal.pricing?.scenarios?.agressivo?.margin}%</span>
                    </div>
                    <div className="sc-body">
                      <p><strong>Risco:</strong> {proposal.pricing?.scenarios?.agressivo?.risk}</p>
                      <p><strong>Competitividade:</strong> {proposal.pricing?.scenarios?.agressivo?.competitivenessProbability}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRUPOS DE CUSTOS DETALHADOS (12 a 19) */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <Calculator size={17} />
                    <h3>Desdobramento dos Custos da Proposta</h3>
                  </div>
                  <span className="card-head-hint">Regra: Nenhum custo é inventado. Itens sem valor constam como pendentes.</span>
                </div>

                <div className="cost-breakdown-table-wrap">
                  <table className="corporate-cost-table">
                    <thead>
                      <tr>
                        <th>Grupo de Custo</th>
                        <th>Detalhamento dos Itens / Fornecedores</th>
                        <th>Quantitativo</th>
                        <th>Subtotal (R$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 12. Mão de Obra */}
                      <tr>
                        <td><strong>1. Mão de Obra</strong></td>
                        <td>
                          {proposal.pricing?.laborItems?.map(l => (
                            <div key={l.id} className="cost-sub-item">
                              • {l.professional} ({l.role}) — {l.hours}h ({l.days}d) @ R$ {l.hourlyRate}/h + Encargos ({l.chargesRate}%)
                            </div>
                          ))}
                        </td>
                        <td>{proposal.pricing?.laborItems?.length} profissionais</td>
                        <td className="mono td-bold">{ProposalService.formatCurrency(proposal.pricing?.laborTotal)}</td>
                      </tr>

                      {/* 13. Equipamentos */}
                      <tr>
                        <td><strong>2. Equipamentos</strong></td>
                        <td>
                          {proposal.pricing?.equipmentItems?.map(eq => (
                            <div key={eq.id} className="cost-sub-item">
                              • {eq.equipment} ({eq.type}) — {eq.days} dias @ R$ {eq.dailyRate}/dia (Calibração: R$ {eq.calibrationCost})
                            </div>
                          ))}
                        </td>
                        <td>{proposal.pricing?.equipmentItems?.length} instrumentos</td>
                        <td className="mono td-bold">{ProposalService.formatCurrency(proposal.pricing?.equipmentTotal)}</td>
                      </tr>

                      {/* 14. Laboratório */}
                      <tr>
                        <td><strong>3. Ensaios Laboratoriais</strong></td>
                        <td>
                          {proposal.pricing?.laboratoryItems?.map(lab => (
                            <div key={lab.id} className="cost-sub-item">
                              • {lab.analysis} — {lab.laboratory} ({lab.quantity} amostras @ R$ {lab.unitValue})
                            </div>
                          ))}
                        </td>
                        <td>{proposal.pricing?.laboratoryItems?.length} ensaios</td>
                        <td className="mono td-bold">{ProposalService.formatCurrency(proposal.pricing?.laboratoryTotal)}</td>
                      </tr>

                      {/* 15. Deslocamento */}
                      <tr>
                        <td><strong>4. Logística & Viagem</strong></td>
                        <td>
                          {proposal.pricing?.travelItems?.map(tr => (
                            <div key={tr.id} className="cost-sub-item">
                              • {tr.vehicle} (Combustível: R$ {tr.fuel}, Hospedagem: R$ {tr.lodging}, Diárias: R$ {tr.dailyAllowance})
                            </div>
                          ))}
                        </td>
                        <td>Veículo próprio</td>
                        <td className="mono td-bold">{ProposalService.formatCurrency(proposal.pricing?.travelTotal)}</td>
                      </tr>

                      {/* 16. Materiais */}
                      <tr>
                        <td><strong>5. Materiais & Consumíveis</strong></td>
                        <td>
                          {proposal.pricing?.materialItems?.map(mat => (
                            <div key={mat.id} className="cost-sub-item">
                              • {mat.item} — {mat.quantity} {mat.unit} @ R$ {mat.unitValue} ({mat.supplier})
                            </div>
                          ))}
                        </td>
                        <td>{proposal.pricing?.materialItems?.length} itens</td>
                        <td className="mono td-bold">{ProposalService.formatCurrency(proposal.pricing?.materialsTotal)}</td>
                      </tr>

                      {/* 17. Terceirizados */}
                      <tr>
                        <td><strong>6. Terceirizados</strong></td>
                        <td>
                          {proposal.pricing?.subcontractorItems?.map(sub => (
                            <div key={sub.id} className="cost-sub-item">
                              • {sub.service} — {sub.supplier} ({sub.deadline})
                            </div>
                          ))}
                        </td>
                        <td>{proposal.pricing?.subcontractorItems?.length} empresas</td>
                        <td className="mono td-bold">{ProposalService.formatCurrency(proposal.pricing?.subcontractorsTotal)}</td>
                      </tr>

                      {/* 18. Indiretos */}
                      <tr>
                        <td><strong>7. Custos Indiretos</strong></td>
                        <td>
                          <div className="cost-sub-item">
                            Seguros (R$ {proposal.pricing?.indirectCosts?.insurance}), Garantias (R$ {proposal.pricing?.indirectCosts?.guarantees}), Mobilização (R$ {proposal.pricing?.indirectCosts?.mobilization})
                          </div>
                        </td>
                        <td>Administração</td>
                        <td className="mono td-bold">{ProposalService.formatCurrency(proposal.pricing?.indirectTotal)}</td>
                      </tr>

                      {/* 19. Tributos */}
                      <tr>
                        <td><strong>8. Tributos Estimados</strong></td>
                        <td>
                          {proposal.pricing?.taxes?.map(tx => (
                            <span key={tx.id} className="tax-inline-tag">
                              {tx.name}: {tx.percentage}% ({ProposalService.formatCurrency(tx.estimatedValue)})
                            </span>
                          ))}
                        </td>
                        <td>Alíquotas livres</td>
                        <td className="mono td-bold">{ProposalService.formatCurrency(proposal.pricing?.taxesTotal)}</td>
                      </tr>

                      {/* Total */}
                      <tr className="total-cost-row">
                        <td colSpan="3"><strong>CUSTO TOTAL ESTIMADO (CUSTO DIRETO + INDIRETO + TRIBUTOS)</strong></td>
                        <td className="mono td-total-highlight">{ProposalService.formatCurrency(proposal.pricing?.totalEstimatedCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 25-26. COTAÇÕES REGISTRADAS & COMPARATIVO */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <FileSpreadsheet size={17} />
                    <h3>Cotações de Fornecedores & Comparativo</h3>
                  </div>
                  <span className="card-head-hint">Registro e seleção de orçamentos vinculados à proposta.</span>
                </div>

                <div className="quotations-grid">
                  {proposal.quotations && proposal.quotations.length > 0 ? (
                    proposal.quotations.map(q => (
                      <div key={q.id} className={`quotation-card ${q.selected ? 'selected' : ''}`}>
                        <div className="q-head">
                          <span className={`q-status-badge status-${q.status.toLowerCase()}`}>{q.status}</span>
                          {q.selected && <span className="selected-pill">✓ Selecionada</span>}
                        </div>
                        <h4 className="q-supplier">{q.supplier}</h4>
                        <p className="q-item-text">{q.item}</p>
                        <div className="q-price-row">
                          <span className="q-price">{ProposalService.formatCurrency(q.value)}</span>
                          <span className="q-validity">Validade: {q.validity}</span>
                        </div>
                        <div className="q-foot">
                          <span>Condição: {q.paymentTerms || 'À vista'}</span>
                          <span>Contato: {q.contact}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-sub-card">
                      Nenhuma cotação de terceiros registrada para esta proposta até o momento.
                    </div>
                  )}
                </div>
              </div>

              {/* 28. LOG DE ALTERAÇÃO DE PREÇO */}
              {proposal.priceChangeLogs && proposal.priceChangeLogs.length > 0 && (
                <div className="corporate-card">
                  <div className="card-header-clean">
                    <div className="head-title-wrap">
                      <History size={17} />
                      <h3>Log Auditável de Alterações de Preço</h3>
                    </div>
                  </div>

                  <div className="price-logs-list">
                    {proposal.priceChangeLogs.map(l => (
                      <div key={l.id} className="price-log-item">
                        <div className="log-top-row">
                          <strong>Preço alterado de {ProposalService.formatCurrency(l.previousPrice)} para {ProposalService.formatCurrency(l.newPrice)}</strong>
                          <span className="log-date">{l.date} por {l.user}</span>
                        </div>
                        <p className="log-reason">Justificativa: <em>"{l.reason}"</em></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 4: DOSSIÊ DA PROPOSTA & CHECKLIST DOCUMENTAL (Itens 32 a 34) */}
          {activeTab === 'dossier' && (
            <div className="tab-pane-content">
              <div className="dossier-header-bar">
                <div className="dossier-title-block">
                  <h3>Pasta de Participação — Dossiê da Proposta</h3>
                  <span>Estruturado nas 13 categorias exigidas para habilitação e proposta.</span>
                </div>
              </div>

              {/* Tabela do Checklist Documental (Item 33 e 34) */}
              <div className="dossier-table-card">
                <table className="corporate-dossier-table">
                  <thead>
                    <tr>
                      <th>Categoria</th>
                      <th>Documento Exigido</th>
                      <th>Validade</th>
                      <th>Status na Proposta</th>
                      <th>Arquivo Vinculado</th>
                      <th>Observação</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.dossier?.items?.map(doc => (
                      <tr key={doc.id} className={`doc-status-row-${doc.status.toLowerCase().replace(/ /g, '-')}`}>
                        <td>
                          <span className="cat-pill">{doc.category}</span>
                        </td>
                        <td>
                          <strong>{doc.name}</strong>
                          {doc.isMandatory && <span className="mandatory-tag">Obrigatório</span>}
                        </td>
                        <td>
                          <span className="mono">{doc.validity}</span>
                        </td>
                        <td>
                          <span className={`doc-status-badge status-${doc.status.toLowerCase().replace(/ /g, '-')}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>
                          <span className="mono file-name-text">{doc.fileName || 'Pendente de anexo'}</span>
                        </td>
                        <td>
                          <span className="doc-notes-text">{doc.notes || '—'}</span>
                        </td>
                        <td>
                          <select 
                            className="select-doc-status"
                            value={doc.status}
                            onChange={(e) => handleToggleDocStatus(doc.id, e.target.value)}
                          >
                            <option value={ProposalDocStatus.ATENDIDO}>Atendido</option>
                            <option value={ProposalDocStatus.PENDENTE}>Pendente</option>
                            <option value={ProposalDocStatus.VENCIDO}>Vencido</option>
                            <option value={ProposalDocStatus.INCOMPATIVEL}>Incompatível</option>
                            <option value={ProposalDocStatus.EM_REVISAO}>Em revisão</option>
                            <option value={ProposalDocStatus.NAO_SE_APLICA}>Não se aplica</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 5: PROPOSTA TÉCNICA & COMERCIAL & VERSÕES (Itens 29, 30, 43, 44) */}
          {activeTab === 'proposals' && (
            <div className="tab-pane-content">
              
              {/* Proposta Técnica Estruturada (Item 29) */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <FileText size={17} />
                    <h3>Proposta Técnica Estruturada</h3>
                  </div>
                  <span className="card-head-hint">11 seções técnicas organizadas conforme padrão de excelência Vellia.</span>
                </div>

                <div className="structured-tech-grid">
                  <div className="tech-block">
                    <span className="tech-lbl">1. Apresentação da Empresa</span>
                    <p>{proposal.technicalProposal?.presentation}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">2. Entendimento do Objeto</span>
                    <p>{proposal.technicalProposal?.understanding}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">3. Metodologia de Execução</span>
                    <p>{proposal.technicalProposal?.methodology}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">4. Plano de Trabalho & Mobilização</span>
                    <p>{proposal.technicalProposal?.workPlan}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">5. Equipe Técnica Designada</span>
                    <p>{proposal.technicalProposal?.team}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">6. Equipamentos & Instrumentação</span>
                    <p>{proposal.technicalProposal?.equipment}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">7. Cronograma Físico</span>
                    <p>{proposal.technicalProposal?.schedule}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">8. Experiência Anterior</span>
                    <p>{proposal.technicalProposal?.experience}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">9. Atestados Vinculados</span>
                    <p>{proposal.technicalProposal?.certificates}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">10. Responsabilidade Técnica (ART/CREA)</span>
                    <p>{proposal.technicalProposal?.technicalResponsibility}</p>
                  </div>
                  <div className="tech-block">
                    <span className="tech-lbl">11. Diferenciais Competitivos</span>
                    <p>{proposal.technicalProposal?.differentials}</p>
                  </div>
                </div>
              </div>

              {/* Proposta Comercial Estruturada (Item 30) */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <DollarSign size={17} />
                    <h3>Proposta Comercial Formatada</h3>
                  </div>
                </div>

                <div className="commercial-summary-box">
                  <div className="comm-row">
                    <span className="c-lbl">Objeto:</span>
                    <span className="c-val">{proposal.commercialProposal?.object}</span>
                  </div>
                  <div className="comm-row">
                    <span className="c-lbl">Valor Global da Proposta:</span>
                    <span className="c-val text-teal mono">{ProposalService.formatCurrency(proposal.pricing?.definedPrice)}</span>
                  </div>
                  <div className="comm-row">
                    <span className="c-lbl">Validade da Proposta:</span>
                    <span className="c-val">{proposal.commercialProposal?.validityDays} dias</span>
                  </div>
                  <div className="comm-row">
                    <span className="c-lbl">Prazo de Vigência / Execução:</span>
                    <span className="c-val">{proposal.commercialProposal?.executionPeriod}</span>
                  </div>
                  <div className="comm-row">
                    <span className="c-lbl">Condições de Pagamento:</span>
                    <span className="c-val">{proposal.commercialProposal?.paymentTerms}</span>
                  </div>
                  <div className="comm-row">
                    <span className="c-lbl">Tributos Inclusos:</span>
                    <span className="c-val">{proposal.commercialProposal?.taxesIncluded}</span>
                  </div>
                  <div className="comm-row">
                    <span className="c-lbl">Condições Gerais:</span>
                    <span className="c-val">{proposal.commercialProposal?.conditions}</span>
                  </div>
                </div>
              </div>

              {/* Versionamento e Comparador de Versões (Item 43 e 44) */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <Layers size={17} />
                    <h3>Histórico e Comparador de Versões ({proposal.versions?.length || 1})</h3>
                  </div>
                  <span className="card-head-hint">Versões anteriores são imutáveis e preservadas.</span>
                </div>

                <div className="versions-timeline-grid">
                  {proposal.versions?.map((v, idx) => (
                    <div key={v.versionNumber || idx} className="version-card">
                      <div className="v-head">
                        <span className="v-pill">{v.versionNumber}</span>
                        <span className="v-date">{v.createdAt}</span>
                      </div>
                      <div className="v-price-row">
                        <span className="v-price mono">{ProposalService.formatCurrency(v.price)}</span>
                        <span className="v-margin">Margem: {v.margin}%</span>
                      </div>
                      <p className="v-scope"><strong>Resumo:</strong> {v.scopeSummary}</p>
                      <p className="v-changes"><strong>Modificações:</strong> {v.changes}</p>
                      <span className="v-author">Autor: {v.author}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 6: APROVAÇÕES INTERNAS (Item 42) */}
          {activeTab === 'approvals' && (
            <div className="tab-pane-content">
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <FileSignature size={17} />
                    <h3>Alçada de Aprovações Internas (4 Níveis)</h3>
                  </div>
                  <span className="card-head-hint">Todas as aprovações devem estar vigentes para autorização de envio.</span>
                </div>

                <div className="approvals-stack-list">
                  {/* Técnica */}
                  <div className={`approval-item-card status-${proposal.approvals?.technical?.status?.toLowerCase() || 'pendente'}`}>
                    <div className="app-item-left">
                      <span className="app-role-badge">1. Aprovação Técnica</span>
                      <strong>Responsável Técnico (Engenharia)</strong>
                      <p>Validação da metodologia, atestados, calibrações e viabilidade de campo.</p>
                      <span className="app-user-meta">
                        {proposal.approvals?.technical?.status === 'Aprovado' 
                          ? `Aprovado por ${proposal.approvals.technical.user} em ${proposal.approvals.technical.date}`
                          : 'Aguardando validação formal'}
                      </span>
                    </div>
                    <div className="app-item-right">
                      <span className={`app-badge status-${proposal.approvals?.technical?.status?.toLowerCase() || 'pendente'}`}>
                        {proposal.approvals?.technical?.status || 'Pendente'}
                      </span>
                      {proposal.approvals?.technical?.status !== 'Aprovado' && (
                        <button className="btn-sign-approval" onClick={() => handleInternalApproval('technical', 'Aprovado')}>
                          Aprovar Técnico
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Comercial */}
                  <div className={`approval-item-card status-${proposal.approvals?.commercial?.status?.toLowerCase() || 'pendente'}`}>
                    <div className="app-item-left">
                      <span className="app-role-badge">2. Aprovação Comercial</span>
                      <strong>Gerência Comercial</strong>
                      <p>Validação do preço ofertado, minuta de proposta, prazos e competitividade.</p>
                      <span className="app-user-meta">
                        {proposal.approvals?.commercial?.status === 'Aprovado' 
                          ? `Aprovado por ${proposal.approvals.commercial.user} em ${proposal.approvals.commercial.date}`
                          : 'Aguardando validação formal'}
                      </span>
                    </div>
                    <div className="app-item-right">
                      <span className={`app-badge status-${proposal.approvals?.commercial?.status?.toLowerCase() || 'pendente'}`}>
                        {proposal.approvals?.commercial?.status || 'Pendente'}
                      </span>
                      {proposal.approvals?.commercial?.status !== 'Aprovado' && (
                        <button className="btn-sign-approval" onClick={() => handleInternalApproval('commercial', 'Aprovado')}>
                          Aprovar Comercial
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financeira */}
                  <div className={`approval-item-card status-${proposal.approvals?.financial?.status?.toLowerCase() || 'pendente'}`}>
                    <div className="app-item-left">
                      <span className="app-role-badge">3. Aprovação Financeira</span>
                      <strong>Controladoria & Finanças</strong>
                      <p>Validação dos encargos, impostos, garantias de proposta e fluxo de caixa.</p>
                      <span className="app-user-meta">
                        {proposal.approvals?.financial?.status === 'Aprovado' 
                          ? `Aprovado por ${proposal.approvals.financial.user} em ${proposal.approvals.financial.date}`
                          : 'Aguardando validação formal'}
                      </span>
                    </div>
                    <div className="app-item-right">
                      <span className={`app-badge status-${proposal.approvals?.financial?.status?.toLowerCase() || 'pendente'}`}>
                        {proposal.approvals?.financial?.status || 'Pendente'}
                      </span>
                      {proposal.approvals?.financial?.status !== 'Aprovado' && (
                        <button className="btn-sign-approval" onClick={() => handleInternalApproval('financial', 'Aprovado')}>
                          Aprovar Financeiro
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Final */}
                  <div className={`approval-item-card status-${proposal.approvals?.final?.status?.toLowerCase() || 'pendente'}`}>
                    <div className="app-item-left">
                      <span className="app-role-badge">4. Aprovação Final da Diretoria</span>
                      <strong>Diretoria Executiva</strong>
                      <p>Homologação soberana para submissão no portal público de contratação.</p>
                      <span className="app-user-meta">
                        {proposal.approvals?.final?.status === 'Aprovado' 
                          ? `Aprovado por ${proposal.approvals.final.user} em ${proposal.approvals.final.date}`
                          : 'Aguardando chancela diretiva'}
                      </span>
                    </div>
                    <div className="app-item-right">
                      <span className={`app-badge status-${proposal.approvals?.final?.status?.toLowerCase() || 'pendente'}`}>
                        {proposal.approvals?.final?.status || 'Pendente'}
                      </span>
                      {proposal.approvals?.final?.status !== 'Aprovado' && (
                        <button className="btn-sign-approval" onClick={() => handleInternalApproval('final', 'Aprovado')}>
                          Chancela Final
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 7: ENVIO & RESULTADO (Itens 45 a 52) */}
          {activeTab === 'submission' && (
            <div className="tab-pane-content">
              
              {/* STATUS DE ENVIO NO PORTAL */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <Send size={17} />
                    <h3>Submissão Oficial no Portal Petronect</h3>
                  </div>
                </div>

                {proposal.submission?.submitted ? (
                  <div className="submitted-success-banner">
                    <div className="sub-head-row">
                      <CheckCircle2 size={24} className="text-emerald" />
                      <div>
                        <h4>Proposta Enviada com Sucesso</h4>
                        <p>Protocolada no portal oficial em {proposal.submission.submissionDate} às {proposal.submission.submissionTime}</p>
                      </div>
                    </div>

                    <div className="sub-receipt-info-grid">
                      <div className="sr-item">
                        <span className="sr-lbl">Número do Protocolo:</span>
                        <span className="sr-val mono text-teal">{proposal.submission.protocolNumber}</span>
                      </div>
                      <div className="sr-item">
                        <span className="sr-lbl">Usuário Responsável pelo Envio:</span>
                        <span className="sr-val">{proposal.submission.submittedBy}</span>
                      </div>
                      <div className="sr-item">
                        <span className="sr-lbl">Comprovante Anexado:</span>
                        <span className="sr-val mono">{proposal.submission.receiptAttachment}</span>
                      </div>
                      <div className="sr-item">
                        <span className="sr-lbl">Observações de Protocolo:</span>
                        <span className="sr-val">{proposal.submission.observations}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="not-submitted-action-box">
                    <p>
                      O envio de propostas e lances na Petrobras ocorre diretamente no portal Petronect pelo operador habilitado.
                      Ao concluir o upload no portal, registre os dados e o comprovante abaixo para certificar a conformidade do processo.
                    </p>

                    <div className="sub-btn-row">
                      <a 
                        href={proposal.submission?.portalUrl || 'https://www.petronect.com.br'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-open-portal"
                      >
                        <ExternalLink size={14} />
                        <span>Abrir Oportunidade no Portal Petronect</span>
                      </a>

                      <button 
                        className="btn-mark-submitted"
                        onClick={() => setShowSubmitModal(true)}
                      >
                        <FileCheck size={15} />
                        <span>Validar Checklist Final & Registrar Envio</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RESULTADO DA LICITAÇÃO (Itens 49 a 52) */}
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <Award size={17} />
                    <h3>Resultado da Licitação & Pós-Sessão</h3>
                  </div>
                  <button className="btn-result-change" onClick={() => setShowResultModal(true)}>
                    Registrar Resultado
                  </button>
                </div>

                <div className="result-status-block">
                  <div className="rs-main-badge-row">
                    <span className="rs-label">Status do Desfecho:</span>
                    <span className={`result-tag-pill result-${(proposal.result?.status || 'participando').toLowerCase().replace(/ /g, '-')}`}>
                      {proposal.result?.status || 'Aguardando resultado'}
                    </span>
                  </div>

                  {proposal.result?.status === TenderResult.GANHA && (
                    <div className="win-banner">
                      <Award size={20} className="text-amber" />
                      <div>
                        <strong>Proposta Vencedora do Certame!</strong>
                        <p>Oportunidade elegível para conversão em Contrato Ativo e Ordem de Início de Serviço.</p>
                      </div>
                    </div>
                  )}

                  {proposal.result?.status === TenderResult.PERDIDA && (
                    <div className="loss-banner">
                      <AlertTriangle size={18} className="text-amber" />
                      <div>
                        <strong>Licitação Encerrada sem Êxito</strong>
                        <p>Motivo registrado: <strong>{proposal.result.lossReason || 'Preço'}</strong>. Observações: {proposal.result.notes || 'Análise registrada no aprendizado comercial.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ABA 8: AUDITORIA & LOGS (Item 62) */}
          {activeTab === 'audit' && (
            <div className="tab-pane-content">
              <div className="corporate-card">
                <div className="card-header-clean">
                  <div className="head-title-wrap">
                    <History size={17} />
                    <h3>Trilha de Auditoria & Ações Registradas</h3>
                  </div>
                  <span className="card-head-hint">Registro com carimbo de tempo, autoria e histórico de alterações.</span>
                </div>

                <div className="audit-timeline-list">
                  {proposal.auditLogs?.map(log => (
                    <div key={log.id} className="audit-entry-card">
                      <div className="audit-head">
                        <span className="audit-action-tag">{log.action}</span>
                        <span className="audit-date mono">{log.date}</span>
                        <span className="audit-user">por <strong>{log.user}</strong></span>
                      </div>
                      <p className="audit-detail-text">{log.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL 1: EDITAR PREÇO DE VENDA COM JUSTIFICATIVA (Item 28) */}
        {showPriceEditModal && (
          <div className="sub-modal-backdrop" onClick={() => setShowPriceEditModal(false)}>
            <div className="sub-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="sub-modal-head">
                <h3>Alterar Preço Definido de Venda</h3>
                <button onClick={() => setShowPriceEditModal(false)}><X size={16} /></button>
              </div>

              <form onSubmit={handleSavePrice}>
                <div className="form-group">
                  <label>Novo Preço Ofertado (R$):</label>
                  <input 
                    type="number" 
                    className="form-input"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                    required
                  />
                  <span className="field-hint">Preço atual: {ProposalService.formatCurrency(proposal.pricing?.definedPrice)}</span>
                </div>

                <div className="form-group">
                  <label>Usuário Responsável:</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={priceEditAuthor}
                    onChange={(e) => setPriceEditAuthor(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Justificativa Formal (Obrigatória para Auditoria):</label>
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    placeholder="Ex: Negociação com fornecedor de laboratório viabilizou redução para elevar competitividade..."
                    value={priceEditReason}
                    onChange={(e) => setPriceEditReason(e.target.value)}
                    required
                  />
                </div>

                <div className="sub-modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowPriceEditModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Salvar Novo Preço & Criar Versão
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADICIONAR TAREFA (Item 7) */}
        {showNewTaskModal && (
          <div className="sub-modal-backdrop" onClick={() => setShowNewTaskModal(false)}>
            <div className="sub-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="sub-modal-head">
                <h3>Adicionar Nova Tarefa à Proposta</h3>
                <button onClick={() => setShowNewTaskModal(false)}><X size={16} /></button>
              </div>

              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label>Título da Tarefa:</label>
                  <input 
                    type="text" 
                    className="form-input"
                    placeholder="Ex: Requisitar amostra de filtro na fábrica..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descrição Detalhada:</label>
                  <textarea 
                    className="form-textarea"
                    rows={2}
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Responsável:</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newTaskResp}
                      onChange={(e) => setNewTaskResp(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Data Limite:</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Prioridade:</label>
                  <select 
                    className="form-input"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div className="sub-modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowNewTaskModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Criar Tarefa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: CHECKLIST FINAL & REGISTRO DE ENVIO (Itens 45 a 48) */}
        {showSubmitModal && (
          <div className="sub-modal-backdrop" onClick={() => setShowSubmitModal(false)}>
            <div className="sub-modal-box large" onClick={(e) => e.stopPropagation()}>
              <div className="sub-modal-head">
                <h3>Validação do Checklist Final & Registro de Envio</h3>
                <button onClick={() => setShowSubmitModal(false)}><X size={16} /></button>
              </div>

              <form onSubmit={handleExecuteSubmission}>
                
                {/* 48. CHECKLIST FINAL DE ENVIO */}
                <div className="final-checklist-box">
                  <span className="chk-title">Checklist Final Pré-Envio (Item 48):</span>
                  <div className="final-chk-list">
                    <label className="chk-label">
                      <input 
                        type="checkbox" 
                        checked={submitChecklist.docComplete}
                        onChange={(e) => setSubmitChecklist({ ...submitChecklist, docComplete: e.target.checked })}
                      />
                      <span>1. Documentação de habilitação completa e sem certidões vencidas?</span>
                    </label>

                    <label className="chk-label">
                      <input 
                        type="checkbox" 
                        checked={submitChecklist.priceApproved}
                        onChange={(e) => setSubmitChecklist({ ...submitChecklist, priceApproved: e.target.checked })}
                      />
                      <span>2. Planilha de formação de preço formalmente aprovada pela diretoria?</span>
                    </label>

                    <label className="chk-label">
                      <input 
                        type="checkbox" 
                        checked={submitChecklist.techReviewed}
                        onChange={(e) => setSubmitChecklist({ ...submitChecklist, techReviewed: e.target.checked })}
                      />
                      <span>3. Proposta técnica integralmente revisada pelo Responsável Técnico?</span>
                    </label>

                    <label className="chk-label">
                      <input 
                        type="checkbox" 
                        checked={submitChecklist.commReviewed}
                        onChange={(e) => setSubmitChecklist({ ...submitChecklist, commReviewed: e.target.checked })}
                      />
                      <span>4. Proposta comercial e declarações conferidas com a minuta contratual?</span>
                    </label>

                    <label className="chk-label">
                      <input 
                        type="checkbox" 
                        checked={submitChecklist.deadlineValid}
                        onChange={(e) => setSubmitChecklist({ ...submitChecklist, deadlineValid: e.target.checked })}
                      />
                      <span>5. Prazo no portal Petronect ainda aberto e vigente?</span>
                    </label>

                    <label className="chk-label">
                      <input 
                        type="checkbox" 
                        checked={submitChecklist.portalCorrect}
                        onChange={(e) => setSubmitChecklist({ ...submitChecklist, portalCorrect: e.target.checked })}
                      />
                      <span>6. Sala de disputa e oportunidade correta acessada no portal?</span>
                    </label>

                    <label className="chk-label">
                      <input 
                        type="checkbox" 
                        checked={submitChecklist.finalFileCorrect}
                        onChange={(e) => setSubmitChecklist({ ...submitChecklist, finalFileCorrect: e.target.checked })}
                      />
                      <span>7. Arquivo final zipado/assinado digitalmente conferido?</span>
                    </label>
                  </div>
                </div>

                {readiness.hasBlockers && (
                  <div className="override-warning-box">
                    <AlertTriangle size={18} className="text-amber" />
                    <div>
                      <strong>Atenção: A proposta possui bloqueador(es) identificado(s).</strong>
                      <label className="override-chk-label">
                        <input 
                          type="checkbox" 
                          checked={allowBlockerOverride}
                          onChange={(e) => setAllowBlockerOverride(e.target.checked)}
                        />
                        <span>Autorizar Override de Envio (Aprovação Executiva Excepcional)</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="form-row-2" style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label>Número do Protocolo Gerado no Portal (Item 47):</label>
                    <input 
                      type="text" 
                      className="form-input mono"
                      value={submitProtocol}
                      onChange={(e) => setSubmitProtocol(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Arquivo de Comprovante (Recibo / Print / PDF - Item 46):</label>
                    <input 
                      type="text" 
                      className="form-input mono"
                      value={submitReceiptFile}
                      onChange={(e) => setSubmitReceiptFile(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Operador / Usuário que Submeteu a Proposta:</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={submitAuthor}
                    onChange={(e) => setSubmitAuthor(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Observações do Envio no Portal:</label>
                  <textarea 
                    className="form-textarea"
                    rows={2}
                    placeholder="Ex: Todos os anexos carregados com sucesso no Petronect às 14:32..."
                    value={submitObs}
                    onChange={(e) => setSubmitObs(e.target.value)}
                  />
                </div>

                <div className="sub-modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowSubmitModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    <Send size={14} />
                    <span>Confirmar Envio da Proposta</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: REGISTRO DE RESULTADO DA LICITAÇÃO (Item 50 e 52) */}
        {showResultModal && (
          <div className="sub-modal-backdrop" onClick={() => setShowResultModal(false)}>
            <div className="sub-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="sub-modal-head">
                <h3>Registrar Resultado da Licitação</h3>
                <button onClick={() => setShowResultModal(false)}><X size={16} /></button>
              </div>

              <form onSubmit={handleSaveResult}>
                <div className="form-group">
                  <label>Desfecho do Certame:</label>
                  <select 
                    className="form-input"
                    value={resultStatus}
                    onChange={(e) => setResultStatus(e.target.value)}
                  >
                    <option value={TenderResult.PARTICIPANDO}>Participando (Sessão Aberta)</option>
                    <option value={TenderResult.AGUARDANDO_RESULTADO}>Aguardando Resultado</option>
                    <option value={TenderResult.GANHA}>Ganha (Vencedor)</option>
                    <option value={TenderResult.PERDIDA}>Perdida</option>
                    <option value={TenderResult.CANCELADA}>Cancelada</option>
                    <option value={TenderResult.REVOGADA}>Revogada</option>
                    <option value={TenderResult.DESERTA}>Deserta</option>
                  </select>
                </div>

                {resultStatus === TenderResult.PERDIDA && (
                  <div className="form-group">
                    <label>Motivo da Perda (Item 52):</label>
                    <select 
                      className="form-input"
                      value={lossReason}
                      onChange={(e) => setLossReason(e.target.value)}
                    >
                      <option value={LossReason.PRECO}>Preço (Lance menor de concorrente)</option>
                      <option value={LossReason.TECNICA}>Técnica (Critério metodológico)</option>
                      <option value={LossReason.HABILITACAO}>Habilitação (Documento ou CND)</option>
                      <option value={LossReason.DOCUMENTO}>Documento específico</option>
                      <option value={LossReason.DESCLASSIFICACAO}>Desclassificação administrativa</option>
                      <option value={LossReason.CONCORRENTE}>Concorrente com recurso aceito</option>
                      <option value={LossReason.OUTRO}>Outro motivo</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Comentários e Parecer da Disputa:</label>
                  <textarea 
                    className="form-textarea"
                    rows={3}
                    placeholder="Ex: Concorrente ofertou 2% abaixo da nossa margem mínima de corte..."
                    value={resultNotes}
                    onChange={(e) => setResultNotes(e.target.value)}
                  />
                </div>

                <div className="sub-modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowResultModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Salvar Resultado
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
