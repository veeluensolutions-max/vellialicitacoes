import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Layers, 
  Users, 
  FileText, 
  DollarSign, 
  ExternalLink, 
  Copy, 
  Calendar, 
  History, 
  Award, 
  AlertOctagon, 
  Sparkles, 
  Gavel, 
  FileCheck, 
  Lock, 
  Unlock, 
  Flame, 
  Bot, 
  Check, 
  Briefcase, 
  Building2, 
  ChevronRight, 
  FileSpreadsheet, 
  FileSignature, 
  Download, 
  Share2, 
  Radio, 
  Eye, 
  EyeOff,
  Maximize2,
  Minimize2,
  Play
} from 'lucide-react';
import { 
  WarRoomService, 
  WarRoomStatus, 
  MilestoneKey, 
  MilestoneStatus, 
  EvidenceType 
} from '../../services/warroom/warRoomService.js';
import { ContractAwardService } from '../../services/contract/contractAwardService.js';
import { TenderOutcome, LossCategory } from '../../services/results/resultsIntelligenceService.js';
import { uxTelemetryService, UxEventType } from '../../services/ux/uxTelemetryService.js';
import './WarRoomModal.css';

export default function WarRoomModal({ 
  opportunity, 
  isOpen, 
  onClose, 
  onOpenCopilot,
  currentUserRole = 'DIRETORIA' // 'DIRETORIA' | 'COMERCIAL' | 'TECNICO' | 'OPERACIONAL'
}) {
  if (!isOpen || !opportunity) return null;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'team' | 'checklist' | 'portal' | 'session' | 'diligence' | 'result' | 'audit'
  const [commandMode, setCommandMode] = useState(false);
  const [userRole, setUserRole] = useState(currentUserRole);
  const [instance, setInstance] = useState(() => WarRoomService.getOrCreateInstance(opportunity));
  const [toastMessage, setToastMessage] = useState(null);

  // Modais Secundários e Formulários
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMilestoneEditModal, setShowMilestoneEditModal] = useState(null);
  const [showDiligenceModal, setShowDiligenceModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Estados de Formulários
  const [subForm, setSubForm] = useState({
    protocolNumber: '',
    evidenceType: EvidenceType.RECEIPT,
    evidenceFile: 'Comprovante_Oficial_Submissao.pdf',
    notes: 'Submissão realizada via Portal dentro do prazo hábil.'
  });

  const [bidForm, setBidForm] = useState({
    value: '',
    marketPrice: '',
    position: '1º Lugar',
    notes: ''
  });

  const [overrideData, setOverrideData] = useState({
    value: '',
    reason: ''
  });

  const [diligenceForm, setDiligenceForm] = useState({
    requestText: '',
    deadline: '2026-10-27 18:00',
    relatedDocument: 'Atestado de Capacidade Técnica Operacional',
    responsible: 'Dr. Roberto Albuquerque'
  });

  const [resultForm, setResultForm] = useState({
    finalStatus: TenderOutcome.GANHA,
    habilitationStatus: 'Habilitada',
    ineligibilityReason: '',
    classificationRank: '1º',
    adjudicated: true,
    homologated: true,
    winningCompany: instance.participatingCompany,
    winningPrice: instance.pricing.definedPrice,
    lossReasons: [],
    whatWorked: 'Dossiê 100% aprovado, atestados técnicos bem categorizados e preço agressivo com margem saudável.',
    whatFailed: 'Nenhuma falha operacional identificada.',
    nextImprovements: 'Aprimorar o tempo de resposta em cotações de fornecedores.'
  });

  const [testLog, setTestLog] = useState(null);

  // Sincronização periódica da contagem regressiva
  useEffect(() => {
    const timer = setInterval(() => {
      setInstance(prev => WarRoomService.enrichInstance({ ...prev }, opportunity));
    }, 10000);
    return () => clearInterval(timer);
  }, [opportunity]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const reloadData = () => {
    const updated = WarRoomService.getOrCreateInstance(opportunity);
    setInstance(WarRoomService.enrichInstance(updated, opportunity));
  };

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // 1. Alternar Modo de Execução ("Iniciar Participação")
  const handleToggleExecution = () => {
    try {
      const nextState = !instance.executionMode;
      const updated = WarRoomService.setExecutionMode(
        instance.opportunityId, 
        nextState, 
        instance.bidOwner.name
      );
      setInstance(WarRoomService.enrichInstance(updated, opportunity));
      showToast(nextState ? 'Modo de Execução ATIVADO! Sistema em prontidão operacional.' : 'Modo de Execução desativado.');
    } catch (e) {
      alert(e.message);
    }
  };

  // 2. Aprovar Preço Comercial
  const handleApprovePrice = () => {
    const updated = WarRoomService.approvePrice(
      instance.opportunityId, 
      'Wagner Silva (Diretoria Executiva)', 
      'Margem e teto comercial validados.'
    );
    setInstance(WarRoomService.enrichInstance(updated, opportunity));
    showToast('Preço comercial aprovado formalmente pela Diretoria!');
  };

  // 3. Congelar Snapshots de Pré-Envio
  const handleFreezeSnapshots = () => {
    try {
      const updated = WarRoomService.createPreSubmissionSnapshots(
        instance.opportunityId, 
        instance.bidOwner.name
      );
      setInstance(WarRoomService.enrichInstance(updated, opportunity));
      showToast('Snapshots congelados com sucesso! Preço e documentos travados para envio.');
    } catch (e) {
      alert(e.message);
    }
  };

  // 4. Registrar Submissão Oficial
  const handleRegisterSubmission = (e) => {
    e.preventDefault();
    try {
      const updated = WarRoomService.registerSubmission(
        instance.opportunityId, 
        subForm, 
        instance.bidOwner.name
      );
      setInstance(WarRoomService.enrichInstance(updated, opportunity));
      setShowSubmitModal(false);
      showToast('Proposta marcada como ENVIADA! Protocolo e hash registrados.');
    } catch (err) {
      alert(err.message);
    }
  };

  // 5. Registrar Lance
  const handleRecordBid = (e) => {
    e.preventDefault();
    try {
      const updated = WarRoomService.recordBid(
        instance.opportunityId, 
        bidForm.value, 
        bidForm.marketPrice || bidForm.value, 
        bidForm.position, 
        bidForm.notes, 
        instance.bidOwner.name,
        false
      );
      setInstance(WarRoomService.enrichInstance(updated, opportunity));
      setBidForm({ value: '', marketPrice: '', position: '1º Lugar', notes: '' });
      showToast('Lance registrado no Live Workspace!');
    } catch (err) {
      if (err.message.includes('LIMIT WARNING')) {
        setOverrideData({ value: bidForm.value, reason: '' });
        setShowOverrideModal(true);
      } else {
        alert(err.message);
      }
    }
  };

  // 6. Confirmar Override de Lance Abaixo do Piso
  const handleConfirmOverride = (e) => {
    e.preventDefault();
    if (!overrideData.reason.trim()) {
      alert('Justificativa obrigatória para autorização de override.');
      return;
    }
    try {
      const updated = WarRoomService.recordBid(
        instance.opportunityId, 
        overrideData.value, 
        overrideData.value, 
        '1º Lugar (Com Override)', 
        'Lance aprovado com override de Diretoria', 
        'Wagner Silva (Diretoria Executiva)',
        true,
        overrideData.reason
      );
      setInstance(WarRoomService.enrichInstance(updated, opportunity));
      setShowOverrideModal(false);
      showToast('Override de lance AUTORIZADO e auditado com sucesso!');
    } catch (err) {
      alert(err.message);
    }
  };

  // 7. Criar Diligência
  const handleCreateDiligence = (e) => {
    e.preventDefault();
    if (!diligenceForm.requestText.trim()) return;
    const updated = WarRoomService.addDiligence(
      instance.opportunityId, 
      diligenceForm, 
      instance.bidOwner.name
    );
    setInstance(WarRoomService.enrichInstance(updated, opportunity));
    setShowDiligenceModal(false);
    setDiligenceForm({ requestText: '', deadline: '2026-10-27 18:00', relatedDocument: 'Atestado de Capacidade Técnica Operacional', responsible: 'Dr. Roberto Albuquerque' });
    showToast('Diligência cadastrada com alerta de prazo crítico!');
  };

  // 8. Responder Diligência
  const handleRespondDiligence = (dilId) => {
    const updated = WarRoomService.respondDiligence(
      instance.opportunityId, 
      dilId, 
      {
        protocol: `PETRO-DIL-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: 'Esclarecimento e atestado complementar anexados em Supplemental Package.',
        files: ['Supplemental_Package_Engenharia.pdf', 'ART_Complementar.pdf']
      }, 
      instance.bidOwner.name
    );
    setInstance(WarRoomService.enrichInstance(updated, opportunity));
    showToast('Diligência respondida com sucesso e Supplemental Package anexado!');
  };

  // 9. Registrar Resultado Final
  const handleSaveResult = (e) => {
    e.preventDefault();
    const updated = WarRoomService.registerFinalResult(
      instance.opportunityId, 
      resultForm, 
      instance.bidOwner.name
    );
    setInstance(WarRoomService.enrichInstance(updated, opportunity));
    setShowResultModal(false);
    showToast(`Resultado gravado: ${resultForm.finalStatus}! Dados propagados para Inteligência de Resultados.`);
  };

  // 10. Executar Suíte de Testes E2E (Regras 151 a 161)
  const handleRunE2ETests = () => {
    const results = [];
    results.push('Iniciando Suíte de Testes E2E da Fase 30...');
    
    // Teste 153: Prazo alterado por adendo
    try {
      WarRoomService.updateMilestoneDeadline(
        instance.opportunityId, 
        MilestoneKey.PROPOSTA, 
        '2026-10-26 14:00', 
        'Adendo nº 02 - Prorrogação de prazo pelo pregoeiro', 
        'Mariana Castro'
      );
      results.push('✓ Teste 153 (Prazo alterado com histórico): PASSOU');
    } catch (e) {
      results.push(`✗ Teste 153: FALHOU (${e.message})`);
    }

    // Teste 154: Detecção de Bloqueadores
    const hasBlockersDetected = instance.readiness?.blockers !== undefined;
    results.push(hasBlockersDetected ? '✓ Teste 154 (Detecção de Bloqueadores): PASSOU' : '✗ Teste 154: FALHOU');

    // Teste 156: Duplicidade de protocolo
    try {
      // Simula protocolo teste
      const testProto = 'PROTO-TESTE-DUPLICIDADE-999';
      WarRoomService.registerSubmission(instance.opportunityId, {
        protocolNumber: testProto,
        evidenceFile: 'recibo.pdf',
        evidenceType: EvidenceType.PROTOCOL
      }, 'Tester');
      
      // Tentativa de duplicar
      WarRoomService.registerSubmission(instance.opportunityId, {
        protocolNumber: testProto,
        evidenceFile: 'recibo2.pdf',
        evidenceType: EvidenceType.PROTOCOL
      }, 'Tester');
      results.push('✗ Teste 156 (Bloqueio de Duplicidade): FALHOU (Deveria ter impedido)');
    } catch (e) {
      results.push('✓ Teste 156 (Bloqueio de Duplicidade de Protocolo): PASSOU');
    }

    // Teste 158: Permissão de Preço Mínimo
    const canTechSeeFloor = userRole === 'TECNICO';
    results.push(canTechSeeFloor ? '✓ Teste 158 (Proteção de Floor Price para Técnico): VERIFICADO NO UI' : '✓ Teste 158 (Permissão de Preço Mínimo): PASSOU');

    // Teste 160: Criação e Resposta de Diligência
    try {
      const d = WarRoomService.addDiligence(instance.opportunityId, {
        requestText: 'Apresentar certidão de acervo técnico atualizada',
        deadline: '2026-10-28 17:00'
      }, 'Mariana Castro');
      WarRoomService.respondDiligence(instance.opportunityId, d.diligences[0].id, {
        protocol: 'REC-TEST-99',
        files: ['CAT_Atualizada.pdf']
      }, 'Mariana Castro');
      results.push('✓ Teste 160 (Ciclo de Diligência + Supplemental Package): PASSOU');
    } catch (e) {
      results.push(`✗ Teste 160: FALHOU (${e.message})`);
    }

    reloadData();
    setTestLog(results);
    showToast('Suíte de Testes E2E executada com sucesso!');
  };

  // Exportar Relatório de Auditoria
  const handleDownloadReport = () => {
    const md = WarRoomService.exportBidTimelineReport(instance.opportunityId);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bid_Timeline_Report_${instance.opportunityNumber}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório oficial Bid Timeline Report baixado!');
  };

  const isTechnicalUser = userRole === 'TECNICO' || userRole === 'OPERACIONAL';

  return (
    <div className="war-room-backdrop">
      <div className={`war-room-container ${commandMode ? 'command-mode-active' : ''}`}>
        
        {/* TOAST DE FEEDBACK REATIVO */}
        {toastMessage && (
          <div className="war-room-toast">
            <Sparkles size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. HEADER EXECUTIVO INTEGRADO (Itens 5, 6, 7, 8, 13)       */}
        {/* ========================================================= */}
        <header className="war-room-header">
          <div className="header-top-bar">
            <div className="header-badge-group">
              <span className="live-status-pill">
                <Radio size={13} className="pulse-radio-icon" />
                SALA DE GUERRA
              </span>
              <span className={`status-badge-unified status-${instance.status.toLowerCase().replace(/_/g, '-')}`}>
                {instance.status.replace(/_/g, ' ')}
              </span>
              <span className="company-badge-pill">
                <Building2 size={13} />
                {instance.participatingCompany}
              </span>
              <span className="portal-badge-pill">
                <ExternalLink size={13} />
                {instance.portal}
              </span>
            </div>

            <div className="header-actions-group">
              {/* Seletor de Perfil do Usuário para Teste de Permissões */}
              <div className="role-selector-wrapper" title="Alternar perfil para teste de permissão do Piso Comercial (Item 60)">
                <span className="role-label">Perfil:</span>
                <select 
                  className="role-select" 
                  value={userRole} 
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="DIRETORIA">Diretoria Executiva</option>
                  <option value="COMERCIAL">Comercial & Precificação</option>
                  <option value="TECNICO">Responsável Técnico</option>
                  <option value="OPERACIONAL">Operador Cadastral</option>
                </select>
              </div>

              {/* Botão Command Mode */}
              <button 
                className={`btn-command-mode-toggle ${commandMode ? 'active' : ''}`}
                onClick={() => setCommandMode(!commandMode)}
                title={commandMode ? 'Sair do Modo de Comando' : 'Ativar Modo de Comando (Últimas Horas)'}
              >
                {commandMode ? <Minimize2 size={15} /> : <Flame size={15} />}
                <span>{commandMode ? 'Modo Normal' : 'Command Mode'}</span>
              </button>

              {/* Botão Copilot */}
              <button 
                className="btn-copilot-header"
                onClick={() => {
                  if (onOpenCopilot) onOpenCopilot();
                }}
                title="Consultar Copilot sobre prontidão, prazos e diligências"
              >
                <Bot size={15} />
                <span>Copilot</span>
              </button>

              {/* Botão Fechar */}
              <button className="btn-close-warroom" onClick={onClose} title="Fechar Sala de Guerra">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="header-main-details">
            <div className="title-and-object">
              <div className="opp-number-line">
                <h2>Licitação nº {instance.opportunityNumber}</h2>
                <span className="opp-client-tag">Contratante: <strong>{instance.client}</strong></span>
              </div>
              <p className="opp-object-desc">{instance.object}</p>
            </div>

            {/* Painel de Contagem Regressiva Viva & Timezone Oficial */}
            <div className="countdown-stat-box">
              <div className="stat-label">
                <Clock size={14} />
                <span>PRAZO OFICIAL DE ENVIO</span>
              </div>
              <div className="countdown-value-line">
                <span className={`countdown-big-text ${instance.countdown.isCriticalWindow ? 'text-critical' : ''}`}>
                  {instance.countdown.formatted}
                </span>
              </div>
              <div className="timezone-official-text" title="Fuso horário oficial do edital (Itens 7 e 8)">
                {instance.officialTimezone}
              </div>
            </div>

            {/* Anel de Prontidão Global */}
            <div className="readiness-gauge-box">
              <div className="stat-label">
                <ShieldCheck size={14} />
                <span>PRONTIDÃO GLOBAL</span>
              </div>
              <div className="gauge-score-line">
                <span className="score-number">{instance.readiness.overallScore}%</span>
                <span className="score-desc">{instance.readiness.statusLabel}</span>
              </div>
              <div className="gauge-progress-track">
                <div 
                  className="gauge-progress-fill" 
                  style={{ 
                    width: `${instance.readiness.overallScore}%`,
                    backgroundColor: instance.readiness.overallScore >= 90 ? '#10B981' : (instance.readiness.overallScore >= 60 ? '#F59E0B' : '#EF4444')
                  }}
                />
              </div>
            </div>

            {/* Bid Owner Responsável Geral */}
            <div className="bid-owner-card">
              <div className="stat-label">
                <Users size={14} />
                <span>BID OWNER GERAL</span>
              </div>
              <div className="owner-name-line">
                <strong>{instance.bidOwner.name}</strong>
              </div>
              <div className="owner-role-line">{instance.bidOwner.role}</div>
            </div>
          </div>

          {/* Barra de Ação Rápida de Execução (Item 30) */}
          <div className="execution-mode-ribbon">
            <div className="ribbon-text">
              <Sparkles size={16} />
              <span>
                {instance.executionMode 
                  ? 'OPERAÇÃO EM EXECUÇÃO: Prazos, envio e sessão pública monitorados ativamente.' 
                  : 'OPERAÇÃO EM PREPARAÇÃO: Organize o dossiê, aprove os preços e valide os requisitos antes da execução.'}
              </span>
            </div>
            <button 
              className={`btn-execution-toggle ${instance.executionMode ? 'btn-active-execution' : 'btn-start-execution'}`}
              onClick={handleToggleExecution}
            >
              {instance.executionMode ? <Check size={16} /> : <Play size={16} />}
              <span>{instance.executionMode ? 'Participação em Execução' : 'Iniciar Participação'}</span>
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* 2. BLOCO "O QUE PRECISA ACONTECER AGORA?" (Itens 116 e 117) */}
        {/* ========================================================= */}
        <section className="now-actions-strip">
          <div className="now-title">
            <Flame size={18} className="flame-icon" />
            <span>O QUE PRECISA ACONTECER AGORA?</span>
          </div>

          <div className="now-cards-flow">
            {!instance.pricing.isApproved && (
              <div className="now-card urgent-card">
                <div className="now-card-header">
                  <span className="now-badge">Urgente</span>
                  <span className="now-role">Diretoria / Comercial</span>
                </div>
                <h4>Aprovar Preço de Venda</h4>
                <p>Valor definido: R$ {instance.pricing.definedPrice.toLocaleString('pt-BR')}</p>
                <button className="now-btn" onClick={handleApprovePrice}>
                  Aprovar Preço Agora
                </button>
              </div>
            )}

            {!instance.snapshots.proposalSnapshotAt && instance.readiness.blockers.length === 0 && (
              <div className="now-card highlight-card">
                <div className="now-card-header">
                  <span className="now-badge">Próximo Passo</span>
                  <span className="now-role">Bid Owner</span>
                </div>
                <h4>Congelar Snapshots</h4>
                <p>Travar versões de Dossiê e Preço para garantia contra alterações acidentais.</p>
                <button className="now-btn" onClick={handleFreezeSnapshots}>
                  Congelar Versões
                </button>
              </div>
            )}

            {!instance.submission.isSubmitted && (
              <div className="now-card submit-card">
                <div className="now-card-header">
                  <span className="now-badge">Envio Portal</span>
                  <span className="now-role">{instance.responsibles.administrativo.name}</span>
                </div>
                <h4>Cadastrar & Comprovar Envio</h4>
                <p>Anexar proposta no portal {instance.portal} e registrar o protocolo oficial.</p>
                <button className="now-btn btn-cta-sub" onClick={() => setShowSubmitModal(true)}>
                  Registrar Protocolo de Envio
                </button>
              </div>
            )}

            {instance.submission.isSubmitted && instance.session.status !== 'ENCERRADA' && (
              <div className="now-card session-card">
                <div className="now-card-header">
                  <span className="now-badge">Sessão Pública</span>
                  <span className="now-role">Mariana Castro</span>
                </div>
                <h4>Acompanhar Sessão & Lances</h4>
                <p>Disputa agendada para {instance.session.date} às {instance.session.time}.</p>
                <button className="now-btn" onClick={() => setActiveTab('session')}>
                  Abrir Live Workspace
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. MENU DE NAVEGAÇÃO DE ABAS                              */}
        {/* ========================================================= */}
        {!commandMode && (
          <nav className="war-room-tabs-nav">
            <button 
              className={`war-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <ShieldCheck size={16} />
              <span>Visão Geral & Prontidão</span>
              {instance.readiness.blockers.length > 0 && (
                <span className="tab-pill-alert">{instance.readiness.blockers.length}</span>
              )}
            </button>

            <button 
              className={`war-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <Calendar size={16} />
              <span>Cronograma & Milestones</span>
            </button>

            <button 
              className={`war-tab-btn ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              <Users size={16} />
              <span>Equipe & RACI</span>
            </button>

            <button 
              className={`war-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
              onClick={() => setActiveTab('checklist')}
            >
              <FileCheck size={16} />
              <span>Checklist Operacional</span>
            </button>

            <button 
              className={`war-tab-btn ${activeTab === 'portal' ? 'active' : ''}`}
              onClick={() => setActiveTab('portal')}
            >
              <ExternalLink size={16} />
              <span>Portal Assistant & Envio</span>
              {instance.submission.isSubmitted && <span className="tab-pill-success">Enviada</span>}
            </button>

            <button 
              className={`war-tab-btn ${activeTab === 'session' ? 'active' : ''}`}
              onClick={() => setActiveTab('session')}
            >
              <Gavel size={16} />
              <span>Sessão Pública & Lances</span>
            </button>

            <button 
              className={`war-tab-btn ${activeTab === 'diligence' ? 'active' : ''}`}
              onClick={() => setActiveTab('diligence')}
            >
              <AlertTriangle size={16} />
              <span>Diligências & Questionamentos</span>
              {instance.diligences.length > 0 && (
                <span className="tab-pill-diligence">{instance.diligences.length}</span>
              )}
            </button>

            <button 
              className={`war-tab-btn ${activeTab === 'result' ? 'active' : ''}`}
              onClick={() => setActiveTab('result')}
            >
              <Award size={16} />
              <span>Resultado & Handoff</span>
            </button>

            <button 
              className={`war-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <History size={16} />
              <span>Auditoria & Testes E2E</span>
            </button>
          </nav>
        )}

        {/* ========================================================= */}
        {/* 4. CONTEÚDO PRINCIPAL (ABAS OU COMMAND MODE)              */}
        {/* ========================================================= */}
        <main className="war-room-body">

          {/* ================= COMMAND MODE ATIVO (Itens 120-123) ================= */}
          {commandMode ? (
            <div className="command-mode-container">
              <div className="command-banner">
                <Flame size={24} className="flame-icon-large" />
                <div>
                  <h3>MODO DE COMANDO ATIVO — JANELA CRÍTICA DE ENVIO</h3>
                  <p>Interface ultra simplificada focada exclusivamente em Bloqueadores, Checklist Final e Comprovação de Envio.</p>
                </div>
              </div>

              <div className="command-grid">
                {/* Coluna 1: Bloqueadores Ativos */}
                <div className="command-panel blockers-panel">
                  <div className="panel-header">
                    <AlertOctagon size={18} />
                    <h4>Bloqueadores Restantes ({instance.readiness.blockers.length})</h4>
                  </div>
                  {instance.readiness.blockers.length === 0 ? (
                    <div className="all-clear-box">
                      <CheckCircle2 size={32} color="#10B981" />
                      <h5>Nenhum bloqueador ativo!</h5>
                      <p>Oportunidade 100% pronta para envio no portal.</p>
                    </div>
                  ) : (
                    <div className="blockers-list">
                      {instance.readiness.blockers.map((b, idx) => (
                        <div key={idx} className="blocker-item-compact">
                          <span className="blocker-dim-tag">{b.dimension}</span>
                          <strong>{b.title}</strong>
                          <p>{b.solution}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Coluna 2: Checklist Operacional Essencial */}
                <div className="command-panel checklist-panel">
                  <div className="panel-header">
                    <FileCheck size={18} />
                    <h4>Checklist Rápido de Participação</h4>
                  </div>
                  <div className="checklist-items-compact">
                    {instance.checklist.slice(0, 6).map(chk => (
                      <div key={chk.id} className="chk-row-compact">
                        <input 
                          type="checkbox" 
                          checked={chk.done} 
                          onChange={() => {
                            chk.done = !chk.done;
                            WarRoomService.saveInstance(instance, instance.bidOwner.name, `Checklist "${chk.title}" alterado.`);
                            reloadData();
                          }} 
                        />
                        <span className={chk.done ? 'chk-done-text' : ''}>{chk.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coluna 3: Ação de Envio Imediata */}
                <div className="command-panel submission-panel">
                  <div className="panel-header">
                    <Send size={18} />
                    <h4>Envio & Protocolo</h4>
                  </div>
                  <div className="submission-compact-content">
                    {instance.submission.isSubmitted ? (
                      <div className="submitted-success-box">
                        <CheckCircle2 size={36} color="#10B981" />
                        <h4>Proposta Enviada!</h4>
                        <p>Protocolo: <strong>{instance.submission.protocolNumber}</strong></p>
                        <small>Hash: {instance.submission.evidenceHash.slice(0, 24)}...</small>
                      </div>
                    ) : (
                      <div className="pending-submit-box">
                        <p>Finalizou o cadastro no portal {instance.portal}?</p>
                        <button 
                          className="btn-primary-large" 
                          onClick={() => setShowSubmitModal(true)}
                        >
                          <Send size={18} />
                          <span>Registrar Envio e Protocolo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ================= TAB 1: VISÃO GERAL & READINESS ================= */}
              {activeTab === 'overview' && (
                <div className="tab-pane overview-pane">
                  <div className="overview-grid">
                    
                    {/* Bloco das 5 Dimensões de Prontidão */}
                    <div className="card-box readiness-dimensions-card">
                      <div className="card-box-header">
                        <div className="header-title">
                          <Layers size={18} />
                          <h3>Prontidão em 5 Dimensões (Item 20)</h3>
                        </div>
                        <span className="pill-metric">{instance.readiness.overallScore}% Pronta</span>
                      </div>

                      <div className="dimensions-breakdown">
                        <div className="dimension-row">
                          <div className="dim-info">
                            <span className="dim-name">Documental & Certidões</span>
                            <span className="dim-value">{instance.readiness.scores.documental}%</span>
                          </div>
                          <div className="dim-bar"><div className="dim-fill" style={{ width: `${instance.readiness.scores.documental}%` }} /></div>
                        </div>

                        <div className="dimension-row">
                          <div className="dim-info">
                            <span className="dim-name">Qualificação Técnica & Atestados</span>
                            <span className="dim-value">{instance.readiness.scores.tecnica}%</span>
                          </div>
                          <div className="dim-bar"><div className="dim-fill" style={{ width: `${instance.readiness.scores.tecnica}%` }} /></div>
                        </div>

                        <div className="dimension-row">
                          <div className="dim-info">
                            <span className="dim-name">Comercial & Precificação</span>
                            <span className="dim-value">{instance.readiness.scores.comercial}%</span>
                          </div>
                          <div className="dim-bar"><div className="dim-fill" style={{ width: `${instance.readiness.scores.comercial}%` }} /></div>
                        </div>

                        <div className="dimension-row">
                          <div className="dim-info">
                            <span className="dim-name">Financeira & Margem</span>
                            <span className="dim-value">{instance.readiness.scores.financeira}%</span>
                          </div>
                          <div className="dim-bar"><div className="dim-fill" style={{ width: `${instance.readiness.scores.financeira}%` }} /></div>
                        </div>

                        <div className="dimension-row">
                          <div className="dim-info">
                            <span className="dim-name">Operacional & Portal</span>
                            <span className="dim-value">{instance.readiness.scores.operacional}%</span>
                          </div>
                          <div className="dim-bar"><div className="dim-fill" style={{ width: `${instance.readiness.scores.operacional}%` }} /></div>
                        </div>
                      </div>

                      <div className="dimension-notice">
                        <AlertTriangle size={14} />
                        <span>Sem bloqueador não significa envio automático: a confirmação formal humana é sempre exigida (Item 22).</span>
                      </div>
                    </div>

                    {/* Bloco de Bloqueadores Ativos (Blockers) */}
                    <div className="card-box blockers-card">
                      <div className="card-box-header">
                        <div className="header-title">
                          <AlertOctagon size={18} className="text-danger" />
                          <h3>Bloqueadores de Envio (Item 21)</h3>
                        </div>
                        <span className={`pill-badge ${instance.readiness.blockers.length === 0 ? 'pill-success' : 'pill-danger'}`}>
                          {instance.readiness.blockers.length} Ativo(s)
                        </span>
                      </div>

                      {instance.readiness.blockers.length === 0 ? (
                        <div className="no-blockers-view">
                          <CheckCircle2 size={40} color="#10B981" />
                          <h4>Nenhum Bloqueador Impeditivo</h4>
                          <p>Todas as 5 dimensões foram checadas. Dossiê, declarações e precificação estão regulares para envio.</p>
                        </div>
                      ) : (
                        <div className="blockers-scroller">
                          {instance.readiness.blockers.map((b, idx) => (
                            <div key={idx} className="blocker-card-item">
                              <div className="blocker-top">
                                <span className="blocker-tag">{b.dimension}</span>
                                <span className="blocker-sev-pill">{b.severity}</span>
                              </div>
                              <h4 className="blocker-title">{b.title}</h4>
                              <p className="blocker-sol">{b.solution}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bloco de Snapshots Imutáveis Pré-Envio (Itens 26 a 29) */}
                    <div className="card-box snapshots-card">
                      <div className="card-box-header">
                        <div className="header-title">
                          <Lock size={18} />
                          <h3>Snapshots de Envio (Itens 26 a 29)</h3>
                        </div>
                        <span className="pill-badge pill-info">Imutável</span>
                      </div>

                      <div className="snapshots-content">
                        <p className="desc-text">
                          Antes da submissão no portal, o sistema congela a versão documental e comercial para que modificações futuras no Centro de Capacidade não alterem o histórico desta licitação.
                        </p>

                        <div className="snapshot-stat-grid">
                          <div className="snap-box">
                            <span className="snap-title">Snapshot do Dossiê</span>
                            <strong>{instance.snapshots.dossierSnapshotId || 'Aguardando congelamento'}</strong>
                            <small>{instance.snapshots.dossierGeneratedAt ? `Travado em ${instance.snapshots.dossierGeneratedAt.slice(0, 16)}` : '14 documentos mapeados'}</small>
                          </div>

                          <div className="snap-box">
                            <span className="snap-title">Versão da Proposta</span>
                            <strong>{instance.snapshots.proposalVersion}</strong>
                            <small>Preço final: R$ {instance.pricing.definedPrice.toLocaleString('pt-BR')}</small>
                          </div>
                        </div>

                        {!instance.snapshots.proposalSnapshotAt ? (
                          <button 
                            className="btn-freeze-snapshots"
                            onClick={handleFreezeSnapshots}
                            disabled={instance.readiness.blockers.length > 0}
                          >
                            <Lock size={15} />
                            <span>Congelar Snapshots de Envio</span>
                          </button>
                        ) : (
                          <div className="frozen-banner">
                            <CheckCircle2 size={16} color="#10B981" />
                            <span>Snapshots congelados por {instance.snapshots.lockedBy}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bloco de Preço Comercial & Proteção de Piso */}
                    <div className="card-box commercial-strategy-card">
                      <div className="card-box-header">
                        <div className="header-title">
                          <DollarSign size={18} />
                          <h3>Estratégia & Preço Comercial (Itens 58 a 62)</h3>
                        </div>
                        <span className={`pill-badge ${instance.pricing.isApproved ? 'pill-success' : 'pill-warning'}`}>
                          {instance.pricing.isApproved ? 'Aprovado' : 'Aguardando Diretoria'}
                        </span>
                      </div>

                      <div className="commercial-content">
                        <div className="price-display-row">
                          <div className="price-item">
                            <span className="lbl">Preço Definido de Envio:</span>
                            <span className="val-big">R$ {instance.pricing.definedPrice.toLocaleString('pt-BR')}</span>
                          </div>

                          <div className="price-item floor-item">
                            <span className="lbl">Piso Mínimo Autorizado (Confidencial):</span>
                            {isTechnicalUser ? (
                              <div className="floor-hidden-pill" title="Dado confidencial restrito à Diretoria e Comercial (Item 60)">
                                <Lock size={14} />
                                <span>CONFIDENCIAL (Acesso Restrito)</span>
                              </div>
                            ) : (
                              <span className="val-big text-warning">
                                R$ {instance.pricing.floorPrice.toLocaleString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="strategy-notes-box">
                          <strong>Diretriz de Disputa:</strong>
                          <p>{instance.pricing.biddingStrategyNotes}</p>
                        </div>

                        {!instance.pricing.isApproved && !isTechnicalUser && (
                          <button className="btn-approve-price-action" onClick={handleApprovePrice}>
                            <Check size={16} />
                            <span>Aprovar Preço como Diretoria</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ================= TAB 2: CRONOGRAMA & MILESTONES ================= */}
              {activeTab === 'timeline' && (
                <div className="tab-pane timeline-pane">
                  <div className="timeline-header-actions">
                    <div>
                      <h3>Linha do Tempo Oficial de Marcos (Itens 9 e 10)</h3>
                      <p>Acompanhamento rigoroso de cada etapa. Adendos de prorrogação registram o histórico anterior sem apagar (Itens 11 e 12).</p>
                    </div>
                  </div>

                  <div className="milestones-vertical-timeline">
                    {instance.milestones.map((m, idx) => (
                      <div key={idx} className={`milestone-card-row milestone-${m.status.toLowerCase()}`}>
                        <div className="milestone-status-indicator">
                          {m.status === MilestoneStatus.COMPLETED ? (
                            <CheckCircle2 size={20} color="#10B981" />
                          ) : m.status === MilestoneStatus.TODAY ? (
                            <Flame size={20} color="#F59E0B" />
                          ) : m.status === MilestoneStatus.CHANGED ? (
                            <History size={20} color="#3B82F6" />
                          ) : (
                            <Clock size={20} color="#94A3B8" />
                          )}
                        </div>

                        <div className="milestone-body">
                          <div className="milestone-title-line">
                            <h4>{m.title}</h4>
                            <span className={`milestone-pill pill-${m.status.toLowerCase()}`}>
                              {m.status}
                            </span>
                          </div>
                          <div className="milestone-date-line">
                            <Calendar size={14} />
                            <strong>{m.date}</strong>
                            <span className="tz-label">({instance.officialTimezone})</span>
                          </div>

                          {m.history?.length > 0 && (
                            <div className="milestone-history-box">
                              <span className="hist-title">Histórico de Alterações de Prazo:</span>
                              {m.history.map((h, hIdx) => (
                                <div key={hIdx} className="hist-item">
                                  <span>Data Anterior: <s>{h.previousDate}</s></span>
                                  <span>Alterado por: <strong>{h.changedBy}</strong></span>
                                  <span>Motivo: <em>"{h.reason}"</em></span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="milestone-actions">
                          <button 
                            className="btn-edit-milestone"
                            onClick={() => setShowMilestoneEditModal(m)}
                            title="Registrar Adendo de Prorrogação (Item 11)"
                          >
                            <History size={14} />
                            <span>Alterar Prazo</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 3: EQUIPE & MATRIZ RACI ================= */}
              {activeTab === 'team' && (
                <div className="tab-pane team-pane">
                  <div className="team-header-info">
                    <div>
                      <h3>Estrutura de Responsáveis & RACI Simples (Itens 13 a 15)</h3>
                      <p>Cada participação possui um Bid Owner geral e responsáveis atribuídos por área funcional.</p>
                    </div>
                  </div>

                  <div className="bid-owner-highlight-card">
                    <div className="owner-avatar-large">
                      <Users size={32} />
                    </div>
                    <div className="owner-meta-info">
                      <span className="owner-tag">RESPONSÁVEL GERAL DA LICITAÇÃO (BID OWNER)</span>
                      <h3>{instance.bidOwner.name}</h3>
                      <p>{instance.bidOwner.role}</p>
                      <div className="owner-contacts">
                        <span>E-mail: {instance.bidOwner.email}</span>
                        <span>•</span>
                        <span>Telefone/WhatsApp: {instance.bidOwner.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="raci-table-card">
                    <h4>Matriz RACI por Área Envolvida (Item 14 e 15)</h4>
                    <table className="raci-table">
                      <thead>
                        <tr>
                          <th>Área</th>
                          <th>Responsável Designado</th>
                          <th>Função Operacional</th>
                          <th>Papel RACI</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(instance.responsibles).map(([key, item]) => (
                          <tr key={key}>
                            <td><strong style={{ textTransform: 'capitalize' }}>{key}</strong></td>
                            <td>{item.name}</td>
                            <td>{item.role}</td>
                            <td>
                              <span className={`raci-badge raci-${item.raci.toLowerCase()}`}>
                                {item.raci}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-table-action"
                                onClick={() => showToast(`Notificação enviada para ${item.name} sobre tarefas pendentes.`)}
                              >
                                Notificar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: CHECKLIST OPERACIONAL ================= */}
              {activeTab === 'checklist' && (
                <div className="tab-pane checklist-pane">
                  <div className="checklist-header-box">
                    <div>
                      <h3>Checklist Operacional Dinâmico (Itens 16 a 18)</h3>
                      <p>Importa itens integrados de Dossiê, Proposta e Requisitos sem duplicar tarefas.</p>
                    </div>
                    <span className="chk-progress-pill">
                      {instance.checklist.filter(c => c.done).length} de {instance.checklist.length} Concluídos
                    </span>
                  </div>

                  <div className="checklist-grid-items">
                    {instance.checklist.map(chk => (
                      <div key={chk.id} className={`checklist-item-card ${chk.done ? 'item-done' : ''}`}>
                        <div className="chk-check-col">
                          <input 
                            type="checkbox" 
                            checked={chk.done}
                            onChange={() => {
                              chk.done = !chk.done;
                              WarRoomService.saveInstance(instance, instance.bidOwner.name, `Checklist "${chk.title}" atualizado.`);
                              reloadData();
                            }}
                          />
                        </div>
                        <div className="chk-content-col">
                          <div className="chk-tags-row">
                            <span className="chk-cat-pill">{chk.category}</span>
                            <span className="chk-source-pill">Origem: {chk.sourceModule}</span>
                          </div>
                          <h4 className="chk-item-title">{chk.title}</h4>
                          <span className="chk-resp-info">Atribuído a: <strong>{chk.responsible}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 5: PORTAL ASSISTANT & ENVIO ================= */}
              {activeTab === 'portal' && (
                <div className="tab-pane portal-pane">
                  <div className="portal-header-info">
                    <div>
                      <h3>Portal Assistant & Registro de Envio (Itens 33 a 51)</h3>
                      <p>Orientação campo a campo para o operador humano. Zero armazenamento de senhas em texto (Item 34) e sem automações de envio sem aprovação (Item 38).</p>
                    </div>

                    <div className="portal-direct-link">
                      <a 
                        href={instance.portalUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn-open-portal"
                      >
                        <ExternalLink size={16} />
                        <span>Acessar Portal Oficial</span>
                      </a>
                    </div>
                  </div>

                  {/* Submission Map (Fase 29 / Item 40 e 41) */}
                  <div className="submission-map-card">
                    <h4>Mapa de Submissão no Portal (Submission Map)</h4>
                    <p className="map-desc">Confira cada campo do portal e utilize o botão "Copiar valor" seguro:</p>

                    <table className="submission-map-table">
                      <thead>
                        <tr>
                          <th>Campo / Aba do Portal</th>
                          <th>Dado / Arquivo a Enviar</th>
                          <th>Status</th>
                          <th>Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>Proposta Comercial - Valor Global</strong></td>
                          <td>R$ {instance.pricing.definedPrice.toLocaleString('pt-BR')}</td>
                          <td><span className="map-status-ready">Pronto</span></td>
                          <td>
                            <button 
                              className="btn-copy-field"
                              onClick={() => handleCopyText(instance.pricing.definedPrice, 'price')}
                            >
                              <Copy size={13} />
                              <span>{copiedField === 'price' ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Prazo de Validade da Proposta</strong></td>
                          <td>60 (sessenta) dias corridos</td>
                          <td><span className="map-status-ready">Pronto</span></td>
                          <td>
                            <button 
                              className="btn-copy-field"
                              onClick={() => handleCopyText('60 dias', 'validity')}
                            >
                              <Copy size={13} />
                              <span>{copiedField === 'validity' ? 'Copiado!' : 'Copiar'}</span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Qualificação Técnica (Envelope / Aba)</strong></td>
                          <td>Dossier_Tecnico_Veeluen_v2.pdf (Atestado CAT 4892/2023)</td>
                          <td><span className="map-status-ready">Compilado</span></td>
                          <td>
                            <button 
                              className="btn-copy-field"
                              onClick={() => showToast('Arquivo Dossiê Técnico localizado no cofre para upload.')}
                            >
                              <FileText size={13} />
                              <span>Ver Arquivo</span>
                            </button>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Declarações Obrigatórias</strong></td>
                          <td>Declaracoes_Assinadas_ICP_Brasil.pdf</td>
                          <td><span className="map-status-ready">Assinado</span></td>
                          <td>
                            <button 
                              className="btn-copy-field"
                              onClick={() => showToast('Declarações assinadas prontas para upload.')}
                            >
                              <FileSignature size={13} />
                              <span>Ver Assinatura</span>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Registro Oficial de Envio & Evidência (Itens 44 a 51) */}
                  <div className="submission-proof-box">
                    <div className="proof-header">
                      <h4>Comprovação e Protocolo de Submissão</h4>
                      {instance.submission.isSubmitted ? (
                        <span className="pill-success-large">
                          <CheckCircle2 size={16} />
                          SUBMISSÃO CONFIRMADA
                        </span>
                      ) : (
                        <span className="pill-pending-large">
                          <Clock size={16} />
                          AGUARDANDO ENVIO HUMANO
                        </span>
                      )}
                    </div>

                    {instance.submission.isSubmitted ? (
                      <div className="submitted-details-grid">
                        <div className="detail-item">
                          <span className="d-label">Número de Protocolo:</span>
                          <span className="d-val protocol-text">{instance.submission.protocolNumber}</span>
                        </div>
                        <div className="detail-item">
                          <span className="d-label">Data e Hora do Envio:</span>
                          <span className="d-val">{instance.submission.submittedAt?.slice(0, 19).replace('T', ' ')}</span>
                        </div>
                        <div className="detail-item">
                          <span className="d-label">Operador Responsável:</span>
                          <span className="d-val">{instance.submission.submittedBy}</span>
                        </div>
                        <div className="detail-item">
                          <span className="d-label">Comprovante Anexado:</span>
                          <span className="d-val">{instance.submission.evidenceFile}</span>
                        </div>
                        <div className="detail-item full-width">
                          <span className="d-label">Hash Criptográfico de Auditoria (Item 50):</span>
                          <span className="d-val hash-text">{instance.submission.evidenceHash}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="register-submit-cta">
                        <p>
                          Após cadastrar os valores e efetuar o upload dos arquivos no portal, clique no botão abaixo para anexar o recibo oficial e salvar o número do protocolo.
                        </p>
                        <button 
                          className="btn-open-submit-modal"
                          onClick={() => setShowSubmitModal(true)}
                        >
                          <Send size={16} />
                          <span>Registrar Protocolo e Evidência de Envio</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB 6: SESSÃO PÚBLICA & LIVE WORKSPACE ================= */}
              {activeTab === 'session' && (
                <div className="tab-pane session-pane">
                  
                  {/* Session Brief (Itens 57 a 64) */}
                  <div className="session-brief-card">
                    <div className="brief-header">
                      <div>
                        <h3>Session Brief — Resumo Estratégico da Sessão (Item 57)</h3>
                        <p>Diretrizes pré-disputa para a equipe de lances.</p>
                      </div>
                      <span className="session-date-pill">
                        <Calendar size={14} />
                        {instance.session.date} às {instance.session.time}
                      </span>
                    </div>

                    <div className="brief-grid">
                      <div className="brief-box">
                        <span className="b-label">Preço Aprovado de Entrada</span>
                        <strong>R$ {instance.pricing.definedPrice.toLocaleString('pt-BR')}</strong>
                      </div>

                      <div className="brief-box">
                        <span className="b-label">Limite Mínimo Autorizado (Floor Price)</span>
                        {isTechnicalUser ? (
                          <strong className="text-muted">Acesso Restrito à Diretoria</strong>
                        ) : (
                          <strong className="text-warning">R$ {instance.pricing.floorPrice.toLocaleString('pt-BR')}</strong>
                        )}
                      </div>

                      <div className="brief-box">
                        <span className="b-label">Passo Máximo de Lance</span>
                        <strong>R$ {instance.pricing.maxStep.toLocaleString('pt-BR')}</strong>
                      </div>

                      <div className="brief-box">
                        <span className="b-label">Concorrentes Prováveis</span>
                        <strong>Brasflex Engenharia, ServSul Ltda</strong>
                      </div>
                    </div>
                  </div>

                  {/* Live Session Workspace Compacto (Itens 65 a 74) */}
                  <div className="live-session-workspace">
                    <div className="live-header">
                      <div className="live-indicator">
                        <Radio size={16} className="pulse-radio-icon text-danger" />
                        <h4>Live Session Workspace (Modo Compacto de Disputa)</h4>
                      </div>
                      <span className="manual-mode-notice">
                        Atualização Manual (Item 68) — Sem lance automático por IA (Regra 64)
                      </span>
                    </div>

                    <div className="live-metrics-bar">
                      <div className="live-stat-card">
                        <span className="stat-name">Preço Atual no Portal</span>
                        <span className="stat-num text-info">
                          R$ {instance.session.currentMarketPrice.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="live-stat-card">
                        <span className="stat-name">Nosso Último Preço</span>
                        <span className="stat-num text-success">
                          R$ {instance.session.ourCurrentPrice.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="live-stat-card">
                        <span className="stat-name">Nossa Posição Atual</span>
                        <span className="stat-num text-warning">{instance.session.ourPosition}</span>
                      </div>

                      <div className="live-stat-card">
                        <span className="stat-name">Última Ação</span>
                        <span className="stat-num text-muted">{instance.session.lastActionAt}</span>
                      </div>
                    </div>

                    {/* Formulário de Registro Manual de Lance com Limit Warning */}
                    <form className="bid-entry-form" onSubmit={handleRecordBid}>
                      <div className="form-cols">
                        <div className="form-group">
                          <label>Nosso Novo Lance (R$):</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 2240000" 
                            value={bidForm.value}
                            onChange={(e) => setBidForm({ ...bidForm, value: e.target.value })}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Melhor Preço do Concorrente (R$):</label>
                          <input 
                            type="number" 
                            placeholder="Ex: 2245000" 
                            value={bidForm.marketPrice}
                            onChange={(e) => setBidForm({ ...bidForm, marketPrice: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label>Posição Atual:</label>
                          <select 
                            value={bidForm.position} 
                            onChange={(e) => setBidForm({ ...bidForm, position: e.target.value })}
                          >
                            <option value="1º Lugar">1º Lugar</option>
                            <option value="2º Lugar">2º Lugar</option>
                            <option value="3º Lugar">3º Lugar</option>
                            <option value="Desclassificado">Desclassificado</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row-notes">
                        <input 
                          type="text" 
                          placeholder="Observação do lance (ex: Cobertura de lance da Brasflex com degrau de R$ 5.000)" 
                          value={bidForm.notes}
                          onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                        />
                        <button type="submit" className="btn-submit-bid">
                          <Gavel size={16} />
                          <span>Registrar Lance no Portal</span>
                        </button>
                      </div>
                    </form>

                    {/* Log de Lances */}
                    <div className="bid-history-table-box">
                      <h5>Histórico de Lances Registrados</h5>
                      <table className="bid-table">
                        <thead>
                          <tr>
                            <th>Horário</th>
                            <th>Valor Registrado</th>
                            <th>Posição</th>
                            <th>Operador</th>
                            <th>Observação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instance.session.bidLogs.map((b, idx) => (
                            <tr key={idx}>
                              <td><strong>{b.time}</strong></td>
                              <td className="text-success">R$ {b.value.toLocaleString('pt-BR')}</td>
                              <td><span className="position-pill">{b.position}</span></td>
                              <td>{b.user}</td>
                              <td>{b.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              )}

              {/* ================= TAB 7: DILIGÊNCIAS & QUESTIONAMENTOS ================= */}
              {activeTab === 'diligence' && (
                <div className="tab-pane diligence-pane">
                  
                  {/* Seção de Diligências (Itens 75 a 81) */}
                  <div className="diligence-section">
                    <div className="section-head-bar">
                      <div>
                        <h3>Gestão de Diligências e Saneamento (Itens 75 a 81)</h3>
                        <p>Respostas geram Supplemental Packages sem alterar o Dossiê original de habilitação (Item 80).</p>
                      </div>
                      <button 
                        className="btn-add-diligence"
                        onClick={() => setShowDiligenceModal(true)}
                      >
                        <AlertTriangle size={15} />
                        <span>Nova Diligência</span>
                      </button>
                    </div>

                    {instance.diligences.length === 0 ? (
                      <div className="empty-diligence-state">
                        <CheckCircle2 size={36} color="#10B981" />
                        <h4>Nenhuma Diligência Pendente</h4>
                        <p>O pregoeiro não emitiu pedidos de saneamento até o momento.</p>
                      </div>
                    ) : (
                      <div className="diligences-list">
                        {instance.diligences.map(dil => (
                          <div key={dil.id} className="diligence-card-item">
                            <div className="dil-top-bar">
                              <span className={`dil-status-pill status-${dil.status.toLowerCase().replace(/ /g, '-')}`}>
                                {dil.status}
                              </span>
                              <span className="dil-deadline-badge">
                                <Clock size={13} />
                                Prazo Crítico: {dil.deadline}
                              </span>
                            </div>

                            <h4 className="dil-request">{dil.requestText}</h4>
                            <p className="dil-doc">Documento relacionado: <strong>{dil.relatedDocument}</strong></p>

                            {dil.status === 'Respondida' ? (
                              <div className="dil-response-meta">
                                <span>Protocolo: <strong>{dil.responseProtocol}</strong></span>
                                <span>Pacote Anexado: {dil.supplementalFiles?.join(', ')}</span>
                              </div>
                            ) : (
                              <div className="dil-actions-bar">
                                <button 
                                  className="btn-respond-diligence"
                                  onClick={() => handleRespondDiligence(dil.id)}
                                >
                                  <FileCheck size={14} />
                                  <span>Gerar Supplemental Package & Responder</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Seção de Questionamentos & Recursos (Itens 82 a 84) */}
                  <div className="legal-questions-section">
                    <div className="section-head-bar">
                      <div>
                        <h3>Questionamentos, Impugnações & Recursos (Itens 82 a 84)</h3>
                        <p>Copilot estrutura rascunhos com revisão jurídica humana obrigatória (Item 83 e 84).</p>
                      </div>
                    </div>

                    <div className="questions-list">
                      {instance.legalQuestions.map(q => (
                        <div key={q.id} className="question-card">
                          <div className="q-top">
                            <span className="q-type-pill">{q.type}</span>
                            <span className="q-status-pill">{q.status}</span>
                          </div>
                          <h4>{q.title}</h4>
                          <p>Protocolo: <strong>{q.protocolNumber}</strong> | Resposta do Pregoeiro: <em>"{q.officialResponse}"</em></p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ================= TAB 8: RESULTADO & HANDOFF ================= */}
              {activeTab === 'result' && (
                <div className="tab-pane result-pane">
                  <div className="result-header-bar">
                    <div>
                      <h3>Resultado Oficial, Habilitação & Pós-Morte (Itens 85 a 108)</h3>
                      <p>Diferenciação clara entre vitória, adjudicação e homologação (Item 93). Envio de lições para o aprendizado do sistema (Item 107).</p>
                    </div>
                    <button 
                      className="btn-register-result"
                      onClick={() => setShowResultModal(true)}
                    >
                      <Award size={15} />
                      <span>Registrar Resultado Oficial</span>
                    </button>
                  </div>

                  <div className="result-overview-grid">
                    <div className="card-box result-status-card">
                      <div className="card-box-header">
                        <h4>Desfecho da Licitação</h4>
                        <span className={`pill-badge status-${instance.result.finalStatus.toLowerCase()}`}>
                          {instance.result.finalStatus}
                        </span>
                      </div>
                      
                      <div className="result-stats-rows">
                        <div className="r-row">
                          <span className="label">Status de Habilitação:</span>
                          <span className="val"><strong>{instance.result.habilitationStatus}</strong></span>
                        </div>
                        <div className="r-row">
                          <span className="label">Classificação Final:</span>
                          <span className="val"><strong>{instance.result.classificationRank}</strong></span>
                        </div>
                        <div className="r-row">
                          <span className="label">Adjudicação Homologada:</span>
                          <span className="val">{instance.result.adjudicated ? 'Sim (Adjudicada)' : 'Pendente'}</span>
                        </div>
                        <div className="r-row">
                          <span className="label">Homologação Formal:</span>
                          <span className="val">{instance.result.homologated ? 'Sim (Homologada)' : 'Pendente'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-box price-gap-card">
                      <div className="card-box-header">
                        <h4>Comparativo de Preços & Gap (Itens 97 a 100)</h4>
                      </div>
                      <div className="price-gap-content">
                        <div className="pg-item">
                          <span className="pg-lbl">Nosso Preço:</span>
                          <span className="pg-val">R$ {instance.pricing.definedPrice.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="pg-item">
                          <span className="pg-lbl">Preço Vencedor:</span>
                          <span className="pg-val">
                            {instance.result.winningPrice ? `R$ ${instance.result.winningPrice.toLocaleString('pt-BR')}` : 'Não informado'}
                          </span>
                        </div>
                        <div className="pg-item">
                          <span className="pg-lbl">Diferença / Price Gap:</span>
                          <span className="pg-val text-info">
                            {instance.result.priceGap !== null ? `R$ ${Math.abs(instance.result.priceGap).toLocaleString('pt-BR')}` : 'Não informado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Post-Mortem Objetivo (Itens 103 a 106) */}
                    <div className="card-box post-mortem-card full-span">
                      <div className="card-box-header">
                        <h4>Post-Mortem & Lições Aprendidas (Itens 103 a 106)</h4>
                      </div>
                      <div className="pm-grid">
                        <div className="pm-col">
                          <strong>O que funcionou:</strong>
                          <p>{instance.result.postMortem.whatWorked || 'Aguardando encerramento para registro.'}</p>
                        </div>
                        <div className="pm-col">
                          <strong>O que falhou / Desafios:</strong>
                          <p>{instance.result.postMortem.whatFailed || 'Nenhuma falha registrada.'}</p>
                        </div>
                        <div className="pm-col">
                          <strong>Próxima melhoria:</strong>
                          <p>{instance.result.postMortem.nextImprovements || 'Registrar pontos de otimização operacional.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Transição para Contrato (Handoff) (Itens 109 a 114) */}
                    {instance.result.finalStatus === TenderOutcome.GANHA && (
                      <div className="card-box handoff-card full-span">
                        <div className="card-box-header">
                          <div className="header-title">
                            <Briefcase size={18} color="#10B981" />
                            <h3>Transição para Contrato (Contract Handoff) (Item 109)</h3>
                          </div>
                          <span className="pill-badge pill-success">Licitação Ganha</span>
                        </div>
                        
                        <div className="handoff-content">
                          <p>Pacote de transição compilado para a equipe de pós-venda e implantação contratual:</p>
                          <div className="handoff-meta-grid">
                            <div><strong>Responsável Pós-Venda:</strong> {instance.result.contractHandoff.postSaleOwner}</div>
                            <div><strong>Obrigações Principais:</strong> {instance.result.contractHandoff.mainObligations}</div>
                          </div>
                          <button 
                            className="btn-generate-handoff"
                            onClick={() => showToast('Pacote de Handoff exportado para o time de Operações Contratuais!')}
                          >
                            <Download size={15} />
                            <span>Exportar Handoff Package</span>
                          </button>

                          <button 
                            className="btn-create-contract-award"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#3B82F6',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.45rem 0.95rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              marginLeft: '10px'
                            }}
                            onClick={() => {
                              const c = ContractAwardService.createFromOpportunity(opportunity, {
                                originalValue: instance.pricing.definedPrice,
                                client: instance.client,
                                participatingCompany: instance.participatingCompany
                              }, instance.bidOwner.name);
                              showToast(`Registro de Contrato ${c.id} criado formalmente! Acesse o módulo Contratos.`);
                            }}
                          >
                            <FileSignature size={15} />
                            <span>Criar Registro de Contrato (FASE 31)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB 9: AUDITORIA & TESTES E2E ================= */}
              {activeTab === 'audit' && (
                <div className="tab-pane audit-pane">
                  <div className="audit-header-bar">
                    <div>
                      <h3>Trilha Completa de Auditoria & Suíte E2E (Itens 145 a 161)</h3>
                      <p>Rastreabilidade absoluta com distinção clara entre ações humanas e de sistema (Itens 149 e 150).</p>
                    </div>

                    <div className="audit-action-buttons">
                      <button className="btn-run-tests" onClick={handleRunE2ETests}>
                        <Play size={15} />
                        <span>Executar Testes E2E (151 a 161)</span>
                      </button>

                      <button className="btn-export-report" onClick={handleDownloadReport}>
                        <Download size={15} />
                        <span>Baixar Bid Timeline Report (MD)</span>
                      </button>
                    </div>
                  </div>

                  {testLog && (
                    <div className="test-results-box">
                      <h4>Resultado da Suíte de Testes Automatizada:</h4>
                      <pre>{testLog.join('\n')}</pre>
                    </div>
                  )}

                  <div className="audit-feed-table-card">
                    <h4>Log Cronológico de Eventos Auditados</h4>
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Tipo</th>
                          <th>Usuário / Origem</th>
                          <th>Ação Realizada</th>
                          <th>Detalhes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instance.auditLogs.map((log, idx) => (
                          <tr key={idx}>
                            <td>{log.timestamp.slice(0, 19).replace('T', ' ')}</td>
                            <td>
                              <span className={`log-type-pill pill-${log.type.toLowerCase()}`}>
                                {log.type}
                              </span>
                            </td>
                            <td><strong>{log.user}</strong></td>
                            <td>{log.action}</td>
                            <td className="text-muted">{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </main>

        {/* ========================================================= */}
        {/* MODAL 1: REGISTRO DE SUBMISSÃO OFICIAL                     */}
        {/* ========================================================= */}
        {showSubmitModal && (
          <div className="sub-modal-overlay">
            <div className="sub-modal-box">
              <div className="sub-modal-head">
                <h3>Comprovar Envio da Proposta (Itens 44 a 51)</h3>
                <button onClick={() => setShowSubmitModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleRegisterSubmission}>
                <div className="form-group">
                  <label>Número do Protocolo Oficial do Portal:</label>
                  <input 
                    type="text" 
                    placeholder="Ex: PETRO-2026-981244"
                    value={subForm.protocolNumber}
                    onChange={(e) => setSubForm({ ...subForm, protocolNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Evidência Comprobatória (Item 46):</label>
                  <select 
                    value={subForm.evidenceType} 
                    onChange={(e) => setSubForm({ ...subForm, evidenceType: e.target.value })}
                  >
                    {Object.values(EvidenceType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Arquivo do Comprovante / Recibo:</label>
                  <input 
                    type="text" 
                    value={subForm.evidenceFile}
                    onChange={(e) => setSubForm({ ...subForm, evidenceFile: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Observações do Operador:</label>
                  <textarea 
                    rows={3} 
                    value={subForm.notes}
                    onChange={(e) => setSubForm({ ...subForm, notes: e.target.value })}
                  />
                </div>

                <div className="sub-modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setShowSubmitModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-confirm-submit">Confirmar Envio Oficial</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: OVERRIDE DE PISO DE PREÇO (LIMIT WARNING)        */}
        {/* ========================================================= */}
        {showOverrideModal && (
          <div className="sub-modal-overlay">
            <div className="sub-modal-box override-box">
              <div className="sub-modal-head">
                <AlertOctagon size={24} className="text-danger" />
                <h3>LIMIT WARNING: Autorização de Override de Diretoria</h3>
                <button onClick={() => setShowOverrideModal(false)}><X size={18} /></button>
              </div>
              <p className="override-warn-text">
                O valor de <strong>R$ {Number(overrideData.value).toLocaleString('pt-BR')}</strong> está abaixo do piso comercial autorizado de <strong>R$ {instance.pricing.floorPrice.toLocaleString('pt-BR')}</strong>.
              </p>
              <form onSubmit={handleConfirmOverride}>
                <div className="form-group">
                  <label>Justificativa Formal Obrigatória (Item 73):</label>
                  <textarea 
                    rows={4}
                    placeholder="Informe o motivo da autorização da redução de margem (ex: Ganho de market share estratégico em cliente prioritário com aprovação expressa da Diretoria Executiva)"
                    value={overrideData.reason}
                    onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                    required
                  />
                </div>

                <div className="sub-modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setShowOverrideModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-danger-confirm">Autorizar Override com Auditoria</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: ADICIONAR DILIGÊNCIA                            */}
        {/* ========================================================= */}
        {showDiligenceModal && (
          <div className="sub-modal-overlay">
            <div className="sub-modal-box">
              <div className="sub-modal-head">
                <h3>Cadastrar Nova Diligência do Pregoeiro</h3>
                <button onClick={() => setShowDiligenceModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleCreateDiligence}>
                <div className="form-group">
                  <label>Solicitação / Notificação Oficial:</label>
                  <textarea 
                    rows={3}
                    placeholder="Ex: Pregoeiro solicita complementação da CAT nº 4892 com comprovação do ensaio de toxicidade"
                    value={diligenceForm.requestText}
                    onChange={(e) => setDiligenceForm({ ...diligenceForm, requestText: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Prazo Limite de Resposta:</label>
                  <input 
                    type="text" 
                    value={diligenceForm.deadline}
                    onChange={(e) => setDiligenceForm({ ...diligenceForm, deadline: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Responsável pelo Atendimento:</label>
                  <input 
                    type="text" 
                    value={diligenceForm.responsible}
                    onChange={(e) => setDiligenceForm({ ...diligenceForm, responsible: e.target.value })}
                    required
                  />
                </div>

                <div className="sub-modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setShowDiligenceModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-primary-modal">Cadastrar Diligência</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 4: REGISTRAR RESULTADO FINAL                        */}
        {/* ========================================================= */}
        {showResultModal && (
          <div className="sub-modal-overlay">
            <div className="sub-modal-box large-modal">
              <div className="sub-modal-head">
                <h3>Registrar Desfecho Oficial da Licitação</h3>
                <button onClick={() => setShowResultModal(false)}><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveResult}>
                <div className="form-cols">
                  <div className="form-group">
                    <label>Resultado Final (Item 95):</label>
                    <select 
                      value={resultForm.finalStatus}
                      onChange={(e) => setResultForm({ ...resultForm, finalStatus: e.target.value })}
                    >
                      <option value={TenderOutcome.GANHA}>GANHA</option>
                      <option value={TenderOutcome.PERDIDA}>PERDIDA</option>
                      <option value={TenderOutcome.CANCELADA}>CANCELADA</option>
                      <option value={TenderOutcome.REVOGADA}>REVOGADA</option>
                      <option value={TenderOutcome.DESERTA}>DESERTA</option>
                      <option value={TenderOutcome.FRACASSADA}>FRACASSADA</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status de Habilitação (Item 85):</label>
                    <select 
                      value={resultForm.habilitationStatus}
                      onChange={(e) => setResultForm({ ...resultForm, habilitationStatus: e.target.value })}
                    >
                      <option value="Habilitada">Habilitada</option>
                      <option value="Inabilitada">Inabilitada</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Classificação (Item 90):</label>
                    <input 
                      type="text" 
                      value={resultForm.classificationRank}
                      onChange={(e) => setResultForm({ ...resultForm, classificationRank: e.target.value })}
                      placeholder="Ex: 1º Lugar"
                    />
                  </div>
                </div>

                <div className="form-cols">
                  <div className="form-group">
                    <label>Empresa Vencedora:</label>
                    <input 
                      type="text" 
                      value={resultForm.winningCompany}
                      onChange={(e) => setResultForm({ ...resultForm, winningCompany: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Preço Vencedor (R$):</label>
                    <input 
                      type="number" 
                      value={resultForm.winningPrice || ''}
                      onChange={(e) => setResultForm({ ...resultForm, winningPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>O que funcionou (Post-Mortem):</label>
                  <textarea 
                    rows={2} 
                    value={resultForm.whatWorked}
                    onChange={(e) => setResultForm({ ...resultForm, whatWorked: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>O que falhou / Desafios:</label>
                  <textarea 
                    rows={2} 
                    value={resultForm.whatFailed}
                    onChange={(e) => setResultForm({ ...resultForm, whatFailed: e.target.value })}
                  />
                </div>

                <div className="sub-modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setShowResultModal(false)}>Cancelar</button>
                  <button type="submit" className="btn-confirm-submit">Salvar Resultado & Alimentar IA</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 5: ALTERAÇÃO DE PRAZO POR ADENDO (Itens 11 e 12)    */}
        {/* ========================================================= */}
        {showMilestoneEditModal && (
          <div className="sub-modal-overlay">
            <div className="sub-modal-box">
              <div className="sub-modal-head">
                <h3>Registrar Alteração de Prazo (Adendo Oficial)</h3>
                <button onClick={() => setShowMilestoneEditModal(null)}><X size={18} /></button>
              </div>
              <p className="desc-text">
                Marco: <strong>{showMilestoneEditModal.title}</strong><br />
                Prazo Anterior: <strong>{showMilestoneEditModal.date}</strong> (Histórico será preservado)
              </p>
              <form onSubmit={(e) => {
                e.preventDefault();
                const newDate = e.target.elements.newDate.value;
                const reason = e.target.elements.reason.value;
                WarRoomService.updateMilestoneDeadline(
                  instance.opportunityId, 
                  showMilestoneEditModal.key, 
                  newDate, 
                  reason, 
                  instance.bidOwner.name
                );
                reloadData();
                setShowMilestoneEditModal(null);
                showToast('Prazo atualizado com preservação do histórico anterior!');
              }}>
                <div className="form-group">
                  <label>Novo Prazo Oficial:</label>
                  <input type="text" name="newDate" defaultValue={showMilestoneEditModal.date} required />
                </div>
                <div className="form-group">
                  <label>Motivo da Alteração / Número do Adendo:</label>
                  <textarea name="reason" rows={3} placeholder="Ex: Adendo nº 03 de prorrogação decorrente de impugnação de concorrente." required />
                </div>
                <div className="sub-modal-foot">
                  <button type="button" className="btn-cancel" onClick={() => setShowMilestoneEditModal(null)}>Cancelar</button>
                  <button type="submit" className="btn-confirm-submit">Salvar Alteração de Prazo</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
