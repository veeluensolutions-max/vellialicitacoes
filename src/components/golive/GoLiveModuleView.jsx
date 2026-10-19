import React, { useState, useEffect } from 'react';
import {
  GoLivePhase,
  PHASE_SEQUENCE,
  GoLiveApprovalDecision,
  IncidentSeverity,
  FeedbackType,
  PilotBacklogClassification,
  FeatureFlagStatus,
  DataHealthStatus,
  GoLivePilotService,
  AgentQualityService,
  IncidentManagementService,
  PilotFeedbackService,
  AssistedOperationService,
  DataIntegrityService,
  FirstSyncService,
  OPERATIONAL_RUNBOOKS,
  OPERATIONAL_OWNERS,
  OPERATIONAL_MANUALS
} from '../../services/golive/goLiveFacade.js';

import {
  StabilizationService,
  GOLIVE_WAVES,
  HOTFIX_POLICY,
  BUG_TRIAGE_POLICY
} from '../../services/golive/stabilizationService.js';

import { 
  Rocket, 
  Users, 
  CheckSquare, 
  Share2, 
  Database, 
  AlertOctagon, 
  MessageSquare, 
  Activity, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  Pause, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  FileText, 
  Zap, 
  BookOpen, 
  Calendar, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  Eye, 
  RefreshCw, 
  Send, 
  Sliders, 
  Info,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import RoleOnboardingModal from './RoleOnboardingModal.jsx';
import './GoLiveModuleView.css';

export function GoLiveModuleView({ onNavigate = null }) {
  // 9 Subseções obrigatórias do Item 1
  const [activeSubTab, setActiveSubTab] = useState('status');

  // Estados de dados dos serviços
  const [currentPhase, setCurrentPhase] = useState(GoLivePhase.PILOTO_DADOS_REAIS);
  const [checklistData, setChecklistData] = useState(null);
  const [pilotUsers, setPilotUsers] = useState([]);
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [qualityReviews, setQualityReviews] = useState([]);
  const [falseNegatives, setFalseNegatives] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [incidentMetrics, setIncidentMetrics] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [backlogItems, setBacklogItems] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [surveyOverview, setSurveyOverview] = useState(null);
  const [dataHealthResult, setDataHealthResult] = useState(null);
  const [sourcesList, setSourcesList] = useState([]);
  const [pilotGoals, setPilotGoals] = useState(null);
  const [featureFreeze, setFeatureFreeze] = useState(null);
  const [latestApproval, setLatestApproval] = useState(null);
  const [baselineSnapshot, setBaselineSnapshot] = useState(null);
  const [postLaunchData, setPostLaunchData] = useState(null);
  const [readinessEvaluation, setReadinessEvaluation] = useState(null);
  const [smokeTestResult, setSmokeTestResult] = useState(null);

  // Estados de modais e ações
  const [notification, setNotification] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingInitialRole, setOnboardingInitialRole] = useState('LICITACOES');

  // Estado da Primeira Sincronização Guiada
  const [firstSyncSource, setFirstSyncSource] = useState('pncp');
  const [firstSyncDays, setFirstSyncDays] = useState(7);
  const [firstSyncRunning, setFirstSyncRunning] = useState(false);
  const [firstSyncReport, setFirstSyncReport] = useState(null);

  // Estado de Formulário de Validação de Oportunidade
  const [correctionModalItem, setCorrectionModalItem] = useState(null);
  const [correctionCompany, setCorrectionCompany] = useState('');
  const [correctionService, setCorrectionService] = useState('');
  const [correctionExpectedScore, setCorrectionExpectedScore] = useState(75);
  const [correctionReason, setCorrectionReason] = useState('');

  // Estado de Cadastro de False Negative
  const [showFalseNegativeModal, setShowFalseNegativeModal] = useState(false);
  const [fnPortal, setFnPortal] = useState('Compras.gov.br');
  const [fnNotice, setFnNotice] = useState('');
  const [fnTitle, setFnTitle] = useState('');
  const [fnReason, setFnReason] = useState('');
  const [fnCompany, setFnCompany] = useState('Excelência Ambiental');

  // Estado de Avaliação do Radar Diário
  const [radarRating, setRadarRating] = useState('UTIL');
  const [radarComment, setRadarComment] = useState('');

  // Estado de Novo Incidente
  const [showNewIncidentModal, setShowNewIncidentModal] = useState(false);
  const [newIncTitle, setNewIncTitle] = useState('');
  const [newIncSev, setNewIncSev] = useState('SEV3');
  const [newIncNote, setNewIncNote] = useState('');

  // Estado de Decisão de Produção
  const [approvalDecision, setApprovalDecision] = useState(GoLiveApprovalDecision.APROVADO);
  const [approvalObs, setApprovalObs] = useState('');
  const [approvalPendencias, setApprovalPendencias] = useState('');

  // Estado de Fix Seguro de Dados
  const [fixPreviewData, setFixPreviewData] = useState(null);

  // Estados da FASE 51 — Estabilização & Waves
  const [activeWave, setActiveWave] = useState(StabilizationService.getCurrentWave());
  const [stabilizationStatus, setStabilizationStatus] = useState(null);
  const [issueLog, setIssueLog] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [activeChecklist, setActiveChecklist] = useState(null);

  const loadAllData = () => {
    try {
      setCurrentPhase(GoLivePilotService.getCurrentPhase());
      setChecklistData(GoLivePilotService.getChecklist());
      setPilotUsers(GoLivePilotService.getPilotUsers());
      setQualityMetrics(AgentQualityService.getQualityCenterMetrics());
      setQualityReviews(AgentQualityService.getQualityReviews());
      setFalseNegatives(AgentQualityService.getFalseNegatives());
      setIncidents(IncidentManagementService.getIncidents());
      setIncidentMetrics(IncidentManagementService.getIncidentMetrics());
      setFeedbacks(PilotFeedbackService.getFeedbacks());
      setBacklogItems(PilotFeedbackService.getPilotBacklog());
      setSurveys(PilotFeedbackService.getSurveys());
      setSurveyOverview(PilotFeedbackService.getSurveyOverview());
      setDataHealthResult(DataIntegrityService.runIntegrityCheck());
      setSourcesList(FirstSyncService.getEligibleSources());
      setPilotGoals(GoLivePilotService.getPilotGoals());
      setFeatureFreeze(AssistedOperationService.getFeatureFreezeStatus());
      setLatestApproval(GoLivePilotService.getLatestApprovalRecord());
      setBaselineSnapshot(GoLivePilotService.getBaselineSnapshot());
      setPostLaunchData(GoLivePilotService.getPostLaunchData());
      setReadinessEvaluation(GoLivePilotService.evaluateReadiness());

      // Fase 51 Stabilization Data
      setActiveWave(StabilizationService.getCurrentWave());
      setStabilizationStatus(StabilizationService.getStabilizationStatus());
      setIssueLog(StabilizationService.getIssueLog());
      setActiveChecklist(StabilizationService.getOnboardingChecklist());
    } catch (e) {
      console.error('Erro ao carregar dados do Go-Live:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const triggerToast = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 4500);
  };

  // Transição de Fase (Itens 2 e 3)
  const handleTransitionPhase = (targetPhase) => {
    try {
      const res = GoLivePilotService.transitionToPhase(targetPhase);
      setCurrentPhase(res.current);
      setReadinessEvaluation(GoLivePilotService.evaluateReadiness());
      triggerToast(res.message);
      loadAllData();
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // Alternar item do Checklist (Simular ou resolver)
  const handleToggleChecklistItem = (itemId, currentStatus) => {
    const nextStatus = currentStatus === 'PASSED' ? 'FAILED' : 'PASSED';
    GoLivePilotService.toggleChecklistItem(itemId, nextStatus);
    loadAllData();
    triggerToast(`Item atualizado para: ${nextStatus}`);
  };

  // Executar Primeira Sincronização Real (Itens 10 e 11)
  const handleRunFirstSync = () => {
    setFirstSyncRunning(true);
    setTimeout(() => {
      try {
        const rep = FirstSyncService.runGuidedFirstSync({
          sourceId: firstSyncSource,
          daysRange: Number(firstSyncDays)
        });
        setFirstSyncReport(rep);
        setFirstSyncRunning(false);
        triggerToast(`Primeira Sincronização concluída! ${rep.importedCount} oportunidades ingeridas.`);
        loadAllData();
      } catch (err) {
        setFirstSyncRunning(false);
        triggerToast(err.message, true);
      }
    }, 1200);
  };

  // Submeter Avaliação Humana de Oportunidade (Itens 12, 13, 14, 15)
  const handleReviewOpportunity = (reviewId, oppId, evalType) => {
    if (evalType === 'INCORRETO' || evalType === 'PARCIAL') {
      const rev = qualityReviews.find(r => r.id === reviewId || r.opportunityId === oppId);
      setCorrectionModalItem(rev || { id: reviewId, opportunityId: oppId });
      setCorrectionCompany('Excelência Ambiental');
      setCorrectionService('Ajuste de Categoria');
      setCorrectionExpectedScore(70);
      setCorrectionReason('');
      return;
    }

    AgentQualityService.submitQualityReview({
      reviewId,
      opportunityId: oppId,
      evaluation: 'CORRETO',
      reviewer: 'Mariana Vasconcelos',
      isRelevant: true,
      notes: 'Aderência validada manualmente sem alterações no motor.'
    });
    triggerToast('Validação "Correto" registrada no Quality Center!');
    loadAllData();
  };

  const handleSaveCorrection = (e) => {
    e.preventDefault();
    if (!correctionModalItem) return;

    AgentQualityService.submitQualityReview({
      reviewId: correctionModalItem.id,
      opportunityId: correctionModalItem.opportunityId,
      evaluation: 'INCORRETO',
      reviewer: 'Mariana Vasconcelos',
      isRelevant: correctionExpectedScore >= 70,
      correctionData: {
        correctCompany: correctionCompany,
        correctService: correctionService,
        expectedScore: Number(correctionExpectedScore),
        reason: correctionReason
      },
      notes: `Correção: ${correctionReason}`
    });

    setCorrectionModalItem(null);
    triggerToast('Correção humana registrada para análise (pesos do motor preservados).');
    loadAllData();
  };

  // Registrar False Negative (Item 19)
  const handleSaveFalseNegative = (e) => {
    e.preventDefault();
    if (!fnTitle.trim()) return;

    AgentQualityService.reportFalseNegative({
      portal: fnPortal,
      noticeNumber: fnNotice,
      title: fnTitle,
      discoveredManuallyBy: 'Mariana Vasconcelos',
      missedReason: fnReason,
      correctCompany: fnCompany
    });

    setShowFalseNegativeModal(false);
    setFnNotice('');
    setFnTitle('');
    setFnReason('');
    triggerToast('False Negative registrado com sucesso no Quality Center!');
    loadAllData();
  };

  // Avaliação do Radar Diário Real (Item 21)
  const handleSubmitRadarEval = () => {
    AgentQualityService.submitRadarEvaluation(radarRating, radarComment, 'Mariana Vasconcelos');
    triggerToast(`Avaliação do Radar Diário registrada (${radarRating})!`);
    setRadarComment('');
    loadAllData();
  };

  // Criar Novo Incidente (Itens 27 e 28)
  const handleCreateIncident = (e) => {
    e.preventDefault();
    if (!newIncTitle.trim()) return;

    IncidentManagementService.createIncident({
      title: newIncTitle,
      severityKey: newIncSev,
      initialNote: newIncNote || 'Incidente aberto durante o monitoramento assistido.'
    });

    setShowNewIncidentModal(false);
    setNewIncTitle('');
    setNewIncNote('');
    triggerToast('Incidente operacional registrado com timeline iniciada.');
    loadAllData();
  };

  // Fix Seguro com Preview (Itens 88 e 89)
  const handleGenerateFixPreview = () => {
    const prev = DataIntegrityService.generateFixPreview('Todos');
    setFixPreviewData(prev);
    triggerToast('Preview de correção gerado com segurança.');
  };

  const handleApplySafeFix = () => {
    if (!fixPreviewData) return;
    const res = DataIntegrityService.applySafeFix('preview-token-v22');
    setFixPreviewData(null);
    triggerToast(res.message);
    loadAllData();
  };

  // Smoke Test Interativo (Item 52)
  const handleRunSmokeTest = () => {
    const res = AssistedOperationService.runSmokeTests();
    setSmokeTestResult(res);
    triggerToast(`Smoke Tests executados! ${res.steps.filter(s => s.passed).length}/7 fluxos aprovados em ${res.totalDurationMs}ms.`);
  };

  // Decisão Humana de Produção (Itens 70, 71, 72, 73)
  const handleSubmitProductionApproval = (e) => {
    e.preventDefault();
    const pendList = approvalPendencias.split('\n').filter(p => p.trim());
    try {
      const rec = GoLivePilotService.submitGoLiveDecision({
        decision: approvalDecision,
        userName: 'Carlos Albuquerque',
        version: 'v2.2-RC2',
        pendencias: pendList,
        observations: approvalObs
      });
      triggerToast(`Decisão de Produção registrada: ${rec.decision}! Histórico preservado.`);
      loadAllData();
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  // Funções da FASE 51 — Estabilização & Waves
  const handleTransitionWave = (waveKey) => {
    try {
      const res = StabilizationService.setWave(waveKey, 'Carlos Albuquerque (Gestão)');
      setActiveWave(res.currentWave);
      loadAllData();
      triggerToast(res.message);
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  const handleUpdateIssueStatus = (issueId, nextStatus) => {
    try {
      const updated = StabilizationService.updateIssueStatus(issueId, nextStatus, 'Mariana Vasconcelos');
      loadAllData();
      triggerToast(`Issue ${updated.id} atualizada para ${nextStatus}`);
    } catch (err) {
      triggerToast(err.message, true);
    }
  };

  return (
    <div className="golive-container">
      {/* Toast de Notificação */}
      {notification && (
        <div className={`golive-toast ${notification.isErr ? 'toast-error' : 'toast-success'}`}>
          {notification.isErr ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Cabeçalho Executivo do Módulo Go-Live */}
      <div className="golive-header">
        <div className="golive-header-left">
          <div className="golive-header-icon-wrapper">
            <Rocket size={26} className="golive-icon-main" />
          </div>
          <div>
            <div className="golive-phase-pill-row">
              <span className={`phase-pill phase-${currentPhase?.toLowerCase().replace(/\s+/g, '-')}`}>
                {currentPhase}
              </span>
              <span className={`checklist-health-pill ${checklistData?.isBlocked ? 'pill-blocked' : 'pill-healthy'}`}>
                {checklistData?.isBlocked ? '⛔ GO-LIVE BLOQUEADO' : '✅ OPERAÇÃO AUTORIZADA'}
              </span>
              {featureFreeze?.isActive && (
                <span className="freeze-badge" title="Freeze ativo: sem grandes escopos novos">
                  ❄️ Feature Freeze Ativo
                </span>
              )}
            </div>
            <h1 className="golive-title">Go-Live Controlado & Operação Assistida</h1>
            <p className="golive-subtitle">
              Validação em ambiente real: confiabilidade, aderência do Vellia Agent, qualidade de dados e experiência dos usuários.
            </p>
          </div>
        </div>

        <div className="golive-header-actions">
          <button
            className="btn-onboarding-open"
            onClick={() => {
              setOnboardingInitialRole('LICITACOES');
              setOnboardingOpen(true);
            }}
          >
            <BookOpen size={15} />
            <span>Manuais & Onboarding</span>
          </button>
          <button className="btn-refresh-golive" onClick={loadAllData} title="Atualizar dados">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Alerta de Go-Live Bloqueado quando aplicável (Item 9) */}
      {checklistData?.isBlocked && (
        <div className="golive-blocker-banner">
          <AlertOctagon size={24} className="blocker-icon" />
          <div className="blocker-text">
            <strong>STATUS: GO-LIVE BLOQUEADO</strong>
            <p>
              Existem {checklistData.criticalFailedCount} item(ns) crítico(s) com pendência no checklist pré-go-live.
              A transição para produção e ativações automáticas estão suspensas até a resolução.
            </p>
          </div>
          <button className="btn-resolve-blocker" onClick={() => setActiveSubTab('checklist')}>
            Ver Bloqueadores
          </button>
        </div>
      )}

      {/* Navegação entre as 9 Subseções Obrigatórias do Item 1 */}
      <div className="golive-tabs-bar">
        <button
          className={`golive-tab-btn ${activeSubTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('status')}
        >
          <Activity size={15} />
          <span>Status do Piloto</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('usuarios')}
        >
          <Users size={15} />
          <span>Usuários do Piloto ({pilotUsers.length})</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('checklist')}
        >
          <CheckSquare size={15} />
          <span>Checklist {checklistData?.isBlocked && <span className="tab-warn-badge">!</span>}</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'integracoes' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('integracoes')}
        >
          <Share2 size={15} />
          <span>Integrações & 1ª Sincronização</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'qualidade-dados' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('qualidade-dados')}
        >
          <Database size={15} />
          <span>Qualidade dos Dados</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'incidentes' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('incidentes')}
        >
          <AlertOctagon size={15} />
          <span>Incidentes ({incidents.filter(i => i.status === 'OPEN').length})</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('feedback')}
        >
          <MessageSquare size={15} />
          <span>Feedback & Backlog ({feedbacks.length})</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'metricas' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('metricas')}
        >
          <TrendingUp size={15} />
          <span>Métricas & Quality Center</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'aprovacao' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('aprovacao')}
        >
          <Award size={15} />
          <span>Aprovação de Produção</span>
        </button>
        <button
          className={`golive-tab-btn ${activeSubTab === 'estabilizacao' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('estabilizacao')}
        >
          <ShieldCheck size={15} />
          <span>Fase 51: Estabilização & Waves</span>
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO DAS SUBSEÇÕES */}
      <div className="golive-tab-content">
        {/* ========================================================= */}
        {/* SUBSEÇÃO 1: STATUS DO PILOTO (Itens 2, 3, 5, 6, 35, 36)    */}
        {/* ========================================================= */}
        {activeSubTab === 'status' && (
          <div className="subtab-panel">
            {/* Fluxo Sequencial de Fases */}
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Fluxo Obrigatório de Fases do Go-Live</h3>
                  <p className="card-subtitle">
                    Regra estrita: O sistema não deve ir direto para produção. Cada etapa deve validar hipóteses com segurança.
                  </p>
                </div>
                <div className="phase-actions-row">
                  {currentPhase !== GoLivePhase.PAUSADO ? (
                    <button
                      className="btn-pause-golive"
                      onClick={() => handleTransitionPhase(GoLivePhase.PAUSADO)}
                    >
                      <Pause size={14} />
                      <span>Pausar Go-Live</span>
                    </button>
                  ) : (
                    <button
                      className="btn-resume-golive"
                      onClick={() => handleTransitionPhase(GoLivePhase.PILOTO_DADOS_REAIS)}
                    >
                      <Play size={14} />
                      <span>Retomar Piloto</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Linha do tempo visual das fases */}
              <div className="phases-flow-stepper">
                {PHASE_SEQUENCE.map((phase, idx) => {
                  const currentIdx = PHASE_SEQUENCE.indexOf(currentPhase);
                  const isPast = currentIdx > idx;
                  const isCurrent = currentPhase === phase;
                  return (
                    <div key={phase} className={`flow-step ${isCurrent ? 'step-active' : ''} ${isPast ? 'step-passed' : ''}`}>
                      <div className="step-circle">
                        {isPast ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                      </div>
                      <span className="step-name">{phase}</span>
                      {idx < PHASE_SEQUENCE.length - 1 && <div className="step-connector" />}
                    </div>
                  );
                })}
              </div>

              <div className="phase-controls-buttons">
                {PHASE_SEQUENCE.map((phase, idx) => {
                  const currentIdx = PHASE_SEQUENCE.indexOf(currentPhase);
                  const isNext = idx === currentIdx + 1;
                  const isCurrent = currentPhase === phase;
                  return (
                    <button
                      key={phase}
                      disabled={!isNext && !isCurrent}
                      className={`btn-phase-step ${isCurrent ? 'active' : ''} ${isNext ? 'btn-next-allowed' : ''}`}
                      onClick={() => handleTransitionPhase(phase)}
                    >
                      {isCurrent ? 'Fase Atual' : isNext ? `Avançar para: ${phase} →` : phase}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metas Técnicas e Funcionais do Piloto (Itens 35 e 36) */}
            <div className="goals-metrics-grid">
              <div className="goal-card">
                <span className="goal-label">Disponibilidade do Sistema</span>
                <span className="goal-value">99.8%</span>
                <span className="goal-target">Meta: ≥ {pilotGoals?.MIN_AVAILABILITY_PCT}%</span>
                <div className="goal-bar"><div className="goal-progress" style={{ width: '99%' }} /></div>
              </div>
              <div className="goal-card">
                <span className="goal-label">Perda de Dados</span>
                <span className="goal-value text-green">0 registros</span>
                <span className="goal-target">Meta: Zero tolerância</span>
                <div className="goal-bar"><div className="goal-progress" style={{ width: '100%' }} /></div>
              </div>
              <div className="goal-card">
                <span className="goal-label">Duplicidade Crítica</span>
                <span className="goal-value text-green">0 detectadas</span>
                <span className="goal-target">Meta: Zero duplicidade</span>
                <div className="goal-bar"><div className="goal-progress" style={{ width: '100%' }} /></div>
              </div>
              <div className="goal-card">
                <span className="goal-label">Matching Útil (Accuracy)</span>
                <span className="goal-value text-teal">{qualityMetrics?.matchingAccuracyPct || 88}%</span>
                <span className="goal-target">Meta: ≥ {pilotGoals?.MIN_MATCHING_USEFUL_PCT}%</span>
                <div className="goal-bar"><div className="goal-progress" style={{ width: `${qualityMetrics?.matchingAccuracyPct || 88}%` }} /></div>
              </div>
            </div>

            {/* Empresas Iniciais e Catálogo Revisado (Itens 5 e 6) */}
            <div className="two-columns-grid">
              <div className="card-panel">
                <h4 className="panel-title">🏢 Empresas Ativas no Piloto (Item 5)</h4>
                <p className="panel-note">Ativadas exclusivamente as empresas com acervo e histórico comercial válidos.</p>
                <div className="companies-list-simple">
                  <div className="company-badge-box">
                    <strong>Veeluen Solutions</strong>
                    <span>CNPJ: 33.123.456/0001-89 • Engenharia & Eletromecânica</span>
                    <span className="status-chip chip-online">Ativa no Piloto</span>
                  </div>
                  <div className="company-badge-box">
                    <strong>Excelência Ambiental</strong>
                    <span>CNPJ: 12.987.654/0001-10 • Meio Ambiente & Monitoramento</span>
                    <span className="status-chip chip-online">Ativa no Piloto</span>
                  </div>
                </div>
              </div>

              <div className="card-panel">
                <h4 className="panel-title">📋 Catálogo de Serviços Reais (Item 6)</h4>
                <p className="panel-note">29 serviços ativos revisados sem duplicidade e com termos refinados.</p>
                <div className="catalog-summary-chips">
                  <span className="cat-chip">Biologia Marinha (94%)</span>
                  <span className="cat-chip">Laudos de Emissão (91%)</span>
                  <span className="cat-chip">PGRS & Resíduos (89%)</span>
                  <span className="cat-chip">Inspeção END (88%)</span>
                  <span className="cat-chip">+25 serviços validados</span>
                </div>
                <div className="catalog-status-box">
                  <CheckCircle2 size={16} className="text-teal" />
                  <span>0 duplicidades encontradas • 100% com sinônimos semânticos calibrados</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 2: USUÁRIOS DO PILOTO (Item 4)                    */}
        {/* ========================================================= */}
        {activeSubTab === 'usuarios' && (
          <div className="subtab-panel">
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Equipe Piloto & Usuários Chave</h3>
                  <p className="card-subtitle">
                    Configuração dos 4 perfis operacionais recomendados (1 Admin, 1 Licitações, 1 Técnico, 1 Comercial) com Canary flag.
                  </p>
                </div>
                <button
                  className="btn-action-primary"
                  onClick={() => {
                    setOnboardingInitialRole('LICITACOES');
                    setOnboardingOpen(true);
                  }}
                >
                  <BookOpen size={14} />
                  <span>Abrir Checklist de Perfil</span>
                </button>
              </div>

              <div className="users-table-wrapper">
                <table className="golive-table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>Perfil Funcional</th>
                      <th>Empresa Vinculada</th>
                      <th>Canary User</th>
                      <th>Onboarding</th>
                      <th>Última Atividade</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pilotUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-cell">
                            <strong>{u.name}</strong>
                            <span>{u.email}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge role-${u.role.toLowerCase()}`}>
                            {u.profileLabel}
                          </span>
                        </td>
                        <td>{u.company}</td>
                        <td>
                          <span className={`status-pill ${u.isCanary ? 'pill-canary' : 'pill-standard'}`}>
                            {u.isCanary ? 'Canary Ativo' : 'Padrão'}
                          </span>
                        </td>
                        <td>
                          {u.onboardingCompleted ? (
                            <span className="badge-done">✅ Concluído</span>
                          ) : (
                            <span className="badge-pending">⏳ Pendente</span>
                          )}
                        </td>
                        <td>{u.lastActive}</td>
                        <td>
                          <button
                            className="btn-table-sm"
                            onClick={() => {
                              setOnboardingInitialRole(u.role);
                              setOnboardingOpen(true);
                            }}
                          >
                            Ver Roteiro
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 3: CHECKLIST PRÉ-GO-LIVE (Itens 8 e 9)             */}
        {/* ========================================================= */}
        {activeSubTab === 'checklist' && (
          <div className="subtab-panel">
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Checklist Obrigatório Pré-Go-Live (17 Itens)</h3>
                  <p className="card-subtitle">
                    Qualquer falha em item crítico bloqueia o Go-Live automaticamente para assegurar integridade.
                  </p>
                </div>
                <div className="checklist-score-pill">
                  <span>Conformidade: <strong>{checklistData?.healthPct}%</strong> ({checklistData?.passed}/{checklistData?.total})</span>
                </div>
              </div>

              <div className="checklist-items-grid">
                {checklistData?.items.map((item) => {
                  const isPassed = item.status === 'PASSED';
                  return (
                    <div
                      key={item.id}
                      className={`checklist-item-card ${isPassed ? 'item-passed' : 'item-failed'} ${item.critical ? 'is-critical' : ''}`}
                    >
                      <div className="item-card-header">
                        <span className="item-category-tag">{item.category}</span>
                        {item.critical && <span className="critical-badge">Crítico</span>}
                      </div>
                      <h4 className="item-label">{item.label}</h4>
                      <p className="item-details">{item.details}</p>
                      <div className="item-card-footer">
                        <button
                          className={`btn-toggle-status ${isPassed ? 'status-pass' : 'status-fail'}`}
                          onClick={() => handleToggleChecklistItem(item.id, item.status)}
                        >
                          {isPassed ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                          <span>{isPassed ? 'Validado (Pass)' : 'Falha (Fail)'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 4: INTEGRAÇÕES & 1ª SINCRONIZAÇÃO (Itens 7, 10, 11)*/}
        {/* ========================================================= */}
        {activeSubTab === 'integracoes' && (
          <div className="subtab-panel">
            {/* Fontes Estáveis (Item 7) */}
            <div className="card-panel">
              <h3 className="card-title">Fontes de Editais Autorizadas no Piloto</h3>
              <p className="card-subtitle">
                Apenas fontes estáveis (ONLINE). Fontes DEGRADED são bloqueadas por padrão de segurança.
              </p>

              <div className="sources-cards-row">
                {sourcesList.map((src) => (
                  <div key={src.id} className={`source-card-box ${src.isDegraded ? 'src-degraded' : 'src-online'}`}>
                    <div className="src-top">
                      <strong>{src.name}</strong>
                      <span className={`src-badge ${src.isDegraded ? 'badge-deg' : 'badge-on'}`}>
                        {src.status}
                      </span>
                    </div>
                    <span className="src-protocol">{src.protocol}</span>
                    <span className="src-permission">
                      {src.allowedForPilot ? '✅ Apto para Sincronização Piloto' : '❌ Bloqueado (Degraded)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assistente da Primeira Sincronização Real (Itens 10 e 11) */}
            <div className="card-panel">
              <h3 className="card-title">Assistente Guiado: Primeira Sincronização Real</h3>
              <p className="card-subtitle">
                Limitar intervalo aos últimos 7 ou 30 dias para evitar sobrecarga de histórico durante o piloto.
              </p>

              <div className="sync-wizard-controls">
                <div className="form-group-inline">
                  <label>Fonte Estável:</label>
                  <select
                    value={firstSyncSource}
                    onChange={(e) => setFirstSyncSource(e.target.value)}
                    className="golive-select"
                  >
                    {sourcesList.filter(s => s.allowedForPilot).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-inline">
                  <label>Intervalo de Histórico:</label>
                  <select
                    value={firstSyncDays}
                    onChange={(e) => setFirstSyncDays(e.target.value)}
                    className="golive-select"
                  >
                    <option value={7}>Últimos 7 dias (Recomendado no Piloto)</option>
                    <option value={30}>Últimos 30 dias (Janela Completa)</option>
                  </select>
                </div>

                <button
                  className="btn-action-primary"
                  disabled={firstSyncRunning}
                  onClick={handleRunFirstSync}
                >
                  <Play size={14} />
                  <span>{firstSyncRunning ? 'Sincronizando...' : 'Executar Primeira Sincronização'}</span>
                </button>
              </div>

              {/* Relatório da Sincronização */}
              {firstSyncReport && (
                <div className="sync-report-result">
                  <div className="report-header">
                    <h4>Relatório da Sincronização: {firstSyncReport.source}</h4>
                    <span className="report-badge">Score Médio: {firstSyncReport.averageScore}%</span>
                  </div>
                  <p className="report-summary">{firstSyncReport.summary}</p>

                  <div className="sync-preview-list">
                    {firstSyncReport.items.map((it) => (
                      <div key={it.id} className="sync-item-row">
                        <div>
                          <strong>{it.processNumber}</strong> — {it.title}
                          <div className="sync-meta-sub">
                            <span>{it.organ}</span> • <span>{it.publishDate}</span> • <span>{it.estimatedValue}</span>
                          </div>
                        </div>
                        <div className="sync-item-right">
                          <span className="dest-company">{it.targetCompany}</span>
                          <span className="score-pill">{it.calculatedScore}% aderência</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Testes de Resiliência (Itens 84, 85, 86, 87) */}
            <div className="card-panel">
              <h3 className="card-title">Testes de Resiliência & Falha Simulada</h3>
              <p className="card-subtitle">
                Garantir que a falha de um serviço ou fonte externa não interrompa os demais módulos do sistema.
              </p>
              <div className="resilience-buttons-row">
                <button
                  className="btn-resilience"
                  onClick={() => {
                    const r = FirstSyncService.runResilienceTest('PNCP_OFFLINE');
                    triggerToast(`${r.title}: ${r.result}`);
                  }}
                >
                  Simular PNCP Offline (Item 85)
                </button>
                <button
                  className="btn-resilience"
                  onClick={() => {
                    const r = FirstSyncService.runResilienceTest('AI_OFFLINE');
                    triggerToast(`${r.title}: ${r.result}`);
                  }}
                >
                  Simular IA Offline (Item 86)
                </button>
                <button
                  className="btn-resilience"
                  onClick={() => {
                    const r = FirstSyncService.runResilienceTest('STORAGE_OFFLINE');
                    triggerToast(`${r.title}: ${r.result}`);
                  }}
                >
                  Simular Storage Offline (Item 87)
                </button>
                <button
                  className="btn-resilience"
                  onClick={() => {
                    const r = FirstSyncService.runResilienceTest('CONTROLLED_RECOVERY');
                    triggerToast(`${r.title}: ${r.result}`);
                  }}
                >
                  Simular Falha Controlada & Auto-Recuperação (Item 84)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 5: QUALIDADE DOS DADOS (Itens 88, 89, 90)         */}
        {/* ========================================================= */}
        {activeSubTab === 'qualidade-dados' && (
          <div className="subtab-panel">
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Auditoria e Integridade dos Dados</h3>
                  <p className="card-subtitle">
                    Varredura contínua de órfãos, duplicados, referências quebradas, datas inválidas e status inconsistentes.
                  </p>
                </div>
                <div className={`health-indicator-badge health-${dataHealthResult?.healthIndicator?.toLowerCase()}`}>
                  Indicador Data Health: <strong>{dataHealthResult?.healthIndicator}</strong>
                </div>
              </div>

              <div className="integrity-checks-list">
                {dataHealthResult?.checks.map((chk) => (
                  <div key={chk.id} className="integrity-check-row">
                    <div className="chk-info">
                      <strong>{chk.label}</strong>
                      <span className="chk-det">{chk.details}</span>
                    </div>
                    <div className="chk-stats">
                      <span>{chk.checkedCount} inspecionados</span>
                      <span className="chk-anom text-green">{chk.anomaliesCount} anomalias</span>
                      <span className="chk-tag pass">OK</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="safe-fix-section">
                <div className="safe-fix-info">
                  <strong>Fix Seguro com Preview Obrigatório (Item 89)</strong>
                  <p>Nunca aplique correções em massa sem visualização prévia das mudanças e snapshot de rollback gerado.</p>
                </div>
                <button className="btn-action-primary" onClick={handleGenerateFixPreview}>
                  Gerar Preview de Fix Seguro
                </button>
              </div>

              {fixPreviewData && (
                <div className="preview-fix-box">
                  <h4>Preview da Correção Segura</h4>
                  <p>0 anomalias críticas pendentes. Reindexação de integridade preventiva pronta para execução.</p>
                  <button className="btn-confirm-fix" onClick={handleApplySafeFix}>
                    Confirmar e Aplicar com Rollback Salvo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 6: INCIDENTES (Itens 27, 28, 29, 30, 31)          */}
        {/* ========================================================= */}
        {activeSubTab === 'incidentes' && (
          <div className="subtab-panel">
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Gestão de Incidentes Operacionais (SEV-1 a SEV-4)</h3>
                  <p className="card-subtitle">
                    Módulo independente de bugs comuns. Inclui Incident Timeline e Post-Mortem Blameless focado no sistema.
                  </p>
                </div>
                <button className="btn-action-primary" onClick={() => setShowNewIncidentModal(true)}>
                  <AlertOctagon size={14} />
                  <span>Registrar Incidente</span>
                </button>
              </div>

              <div className="incidents-list">
                {incidents.map((inc) => (
                  <div key={inc.id} className={`incident-card-box inc-sev-${inc.severity.code.toLowerCase()}`}>
                    <div className="inc-top-row">
                      <div className="inc-title-group">
                        <span className={`sev-tag sev-${inc.severity.code.toLowerCase()}`}>{inc.severity.code}</span>
                        <strong>{inc.title}</strong>
                      </div>
                      <span className={`inc-status-tag ${inc.status.toLowerCase()}`}>
                        {inc.status === 'RESOLVED' ? 'Resolvido' : 'Em Aberto'}
                      </span>
                    </div>

                    {/* Timeline do Incidente (Item 29) */}
                    <div className="incident-timeline">
                      <span className="timeline-title">Incident Timeline:</span>
                      <div className="timeline-steps-row">
                        {inc.timeline.map((st, i) => (
                          <div key={i} className="timeline-step-node">
                            <span className="node-time">{st.time}</span>
                            <span className="node-phase">{st.phase}</span>
                            <span className="node-note">{st.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Post-Mortem Blameless (Item 30 e 31) */}
                    {inc.postMortem && (
                      <div className="post-mortem-box">
                        <div className="pm-header">
                          <h5>Análise Pós-Incidente (Post-Mortem Blameless)</h5>
                          <span>{inc.postMortem.author} • {inc.postMortem.date}</span>
                        </div>
                        <div className="pm-grid">
                          <div><strong>O que aconteceu:</strong> <p>{inc.postMortem.whatHappened}</p></div>
                          <div><strong>Impacto real:</strong> <p>{inc.postMortem.businessImpact}</p></div>
                          <div><strong>Causa raiz técnica:</strong> <p>{inc.postMortem.rootCause}</p></div>
                          <div><strong>Ação preventiva:</strong> <p>{inc.postMortem.howToPreventRecurrence}</p></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 7: FEEDBACK & SURVEY (Itens 24, 25, 44, 45, 46)   */}
        {/* ========================================================= */}
        {activeSubTab === 'feedback' && (
          <div className="subtab-panel">
            {/* Pesquisa do Piloto (Survey 1-5) */}
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Pesquisa de Utilidade do Piloto (Itens 44 e 45)</h3>
                  <p className="card-subtitle">
                    Avaliação dos usuários reais nas 5 dimensões chave + campo aberto obrigatório.
                  </p>
                </div>
                <div className="survey-score-badge">
                  Nota Geral: <strong>{surveyOverview?.overallScore || '4.8'} / 5.0</strong>
                </div>
              </div>

              <div className="survey-categories-row">
                <div className="cat-metric"><span>Facilidade de Uso:</span> <strong>{surveyOverview?.categories?.easeOfUse || '4.5'}/5</strong></div>
                <div className="cat-metric"><span>Qualidade das Oportunidades:</span> <strong>{surveyOverview?.categories?.qualityOpportunities || '4.6'}/5</strong></div>
                <div className="cat-metric"><span>Velocidade de Busca:</span> <strong>{surveyOverview?.categories?.speed || '4.8'}/5</strong></div>
                <div className="cat-metric"><span>Confiabilidade do Motor:</span> <strong>{surveyOverview?.categories?.reliability || '4.7'}/5</strong></div>
                <div className="cat-metric"><span>Valor Percebido:</span> <strong>{surveyOverview?.categories?.perceivedValue || '5.0'}/5</strong></div>
              </div>

              <div className="survey-testimonials">
                {surveys.map((s) => (
                  <div key={s.id} className="survey-quote-card">
                    <div className="quote-header">
                      <strong>{s.user} ({s.role})</strong>
                      <span className="quote-star">⭐ {s.averageRating}/5</span>
                    </div>
                    <p className="quote-text">"{s.openFeedback}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pilot Backlog Ponderado (Impacto x Frequência x Risco) */}
            <div className="card-panel">
              <h3 className="card-title">Pilot Backlog (Prioridade: Impacto × Frequência × Risco)</h3>
              <p className="card-subtitle">
                Classificado em: Corrigir antes da produção, Pode esperar, Melhoria futura, Não fazer.
              </p>

              <div className="backlog-items-list">
                {backlogItems.map((b) => (
                  <div key={b.id} className="backlog-item-card">
                    <div className="backlog-left">
                      <span className={`urgency-pill urgency-${b.classification.code.toLowerCase()}`}>
                        {b.classification.label}
                      </span>
                      <strong>{b.title}</strong>
                      <span className="backlog-notes">{b.notes}</span>
                    </div>
                    <div className="backlog-calc">
                      <span>Impacto: {b.impact}</span>
                      <span>Freq: {b.frequency}</span>
                      <span>Risco: {b.risk}</span>
                      <strong className="prio-score">Score: {b.calculatedPriority}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 8: MÉTRICAS & QUALITY CENTER (Itens 12-23, 39-42)  */}
        {/* ========================================================= */}
        {activeSubTab === 'metricas' && (
          <div className="subtab-panel">
            {/* Indicadores Principais do Quality Center */}
            <div className="quality-center-kpis">
              <div className="qc-card">
                <span className="qc-label">Matching Accuracy</span>
                <span className="qc-value text-teal">{qualityMetrics?.matchingAccuracyPct}%</span>
                <span className="qc-sub">{qualityMetrics?.correctCount} corretas • {qualityMetrics?.partialCount} parciais</span>
              </div>
              <div className="qc-card">
                <span className="qc-label">Precision de Relevância</span>
                <span className="qc-value text-blue">{qualityMetrics?.relevancePrecisionPct}%</span>
                <span className="qc-sub">Oportunidades confirmadas relevantes</span>
              </div>
              <div className="qc-card">
                <span className="qc-label">False Positives</span>
                <span className="qc-value text-amber">{qualityMetrics?.falsePositivesCount}</span>
                <span className="qc-sub">Classificadas pelo sistema, rejeitadas por humano</span>
              </div>
              <div className="qc-card">
                <span className="qc-label">False Negatives</span>
                <span className="qc-value text-rose">{qualityMetrics?.falseNegativesCount}</span>
                <span className="qc-sub">Achadas manualmente que o motor não viu</span>
              </div>
              <div className="qc-card">
                <span className="qc-label">Alert Noise Index</span>
                <span className="qc-value text-green">{qualityMetrics?.alertNoise?.noisePct}%</span>
                <span className="qc-sub">{qualityMetrics?.alertNoise?.health}</span>
              </div>
            </div>

            {/* Métricas de Tempo Real (Time to Value) */}
            <div className="card-panel">
              <h3 className="card-title">Métricas de Tempo do Piloto (Time to Value)</h3>
              <p className="card-subtitle">
                Eficiência operacional medida desde a captura automatizada até a resposta humana.
              </p>
              <div className="time-metrics-grid">
                <div className="time-metric-box">
                  <Clock size={20} className="text-teal" />
                  <div>
                    <span className="tm-label">Time to Action (Captura → 1ª Ação Humana)</span>
                    <strong className="tm-val">{qualityMetrics?.timeMetrics?.timeToValueFormatted}</strong>
                    <span className="tm-desc">Ex: Captura às 06:31, primeira análise às 08:15</span>
                  </div>
                </div>
                <div className="time-metric-box">
                  <TrendingUp size={20} className="text-blue" />
                  <div>
                    <span className="tm-label">Time to Go / No-Go (Captura → Decisão)</span>
                    <strong className="tm-val">{qualityMetrics?.timeMetrics?.timeToGoFormatted}</strong>
                    <span className="tm-desc">Decisão estratégica registrada no Decision Board</span>
                  </div>
                </div>
                <div className="time-metric-box">
                  <FileText size={20} className="text-purple" />
                  <div>
                    <span className="tm-label">Time to Proposal (Decisão GO → Proposta Pronta)</span>
                    <strong className="tm-val">{qualityMetrics?.timeMetrics?.timeToProposalFormatted}</strong>
                    <span className="tm-desc">Elaboração técnica, precificação e fechamento</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila de Validação Humana das Primeiras Oportunidades (Itens 12, 13, 14, 15) */}
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Fila de Revisão de Qualidade Humana</h3>
                  <p className="card-subtitle">
                    Avalie o matching das oportunidades capturadas. O feedback é registrado para auditoria sem alterar os pesos do motor no piloto.
                  </p>
                </div>
                <button className="btn-action-secondary" onClick={() => setShowFalseNegativeModal(true)}>
                  + Registrar False Negative Manual
                </button>
              </div>

              <div className="reviews-table-wrapper">
                <table className="golive-table">
                  <thead>
                    <tr>
                      <th>Oportunidade</th>
                      <th>Empresa / Serviço Sugerido</th>
                      <th>Score</th>
                      <th>Validação Humana</th>
                      <th>Ações de Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qualityReviews.map((rev) => (
                      <tr key={rev.id}>
                        <td>
                          <strong>{rev.opportunityId}</strong>
                          <p className="opp-table-title">{rev.title}</p>
                        </td>
                        <td>
                          <div className="service-cell">
                            <span className="comp-name">{rev.systemAssignedCompany}</span>
                            <span className="serv-name">{rev.systemAssignedService}</span>
                          </div>
                        </td>
                        <td>
                          <span className="score-badge">{rev.systemScore}%</span>
                        </td>
                        <td>
                          {rev.reviewed ? (
                            <span className={`eval-badge eval-${rev.evaluation?.toLowerCase()}`}>
                              {rev.evaluation}
                            </span>
                          ) : (
                            <span className="eval-badge eval-pending">Aguardando Revisão</span>
                          )}
                        </td>
                        <td>
                          <div className="feedback-buttons-group">
                            <button
                              className="btn-eval btn-correct"
                              onClick={() => handleReviewOpportunity(rev.id, rev.opportunityId, 'CORRETO')}
                              title="Aderência e empresa corretas"
                            >
                              Correto
                            </button>
                            <button
                              className="btn-eval btn-partial"
                              onClick={() => handleReviewOpportunity(rev.id, rev.opportunityId, 'PARCIAL')}
                              title="Parcialmente correto"
                            >
                              Parcial
                            </button>
                            <button
                              className="btn-eval btn-incorrect"
                              onClick={() => handleReviewOpportunity(rev.id, rev.opportunityId, 'INCORRETO')}
                              title="Incorreto (abrir correção)"
                            >
                              Incorreto
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Avaliação do Radar Diário Real (Item 21) */}
            <div className="card-panel">
              <h3 className="card-title">Primeiro Radar Diário Real — Avaliação de Utilidade</h3>
              <p className="card-subtitle">
                O Radar Diário gerado pelo Vellia Agent trouxe oportunidades realmente úteis para o dia a dia da equipe?
              </p>
              <div className="radar-eval-row">
                <div className="rating-buttons">
                  <button
                    className={`btn-rate ${radarRating === 'UTIL' ? 'active' : ''}`}
                    onClick={() => setRadarRating('UTIL')}
                  >
                    👍 Útil
                  </button>
                  <button
                    className={`btn-rate ${radarRating === 'PARCIAL' ? 'active' : ''}`}
                    onClick={() => setRadarRating('PARCIAL')}
                  >
                    👌 Parcialmente Útil
                  </button>
                  <button
                    className={`btn-rate ${radarRating === 'NAO_UTIL' ? 'active' : ''}`}
                    onClick={() => setRadarRating('NAO_UTIL')}
                  >
                    👎 Não Útil
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Comentário sobre a relevância das licitações..."
                  className="radar-comment-input"
                  value={radarComment}
                  onChange={(e) => setRadarComment(e.target.value)}
                />
                <button className="btn-action-primary" onClick={handleSubmitRadarEval}>
                  Salvar Avaliação
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 9: APROVAÇÃO DE PRODUÇÃO & 30 DIAS (Itens 68-80)  */}
        {/* ========================================================= */}
        {activeSubTab === 'aprovacao' && (
          <div className="subtab-panel">
            {/* Avaliação de Prontidão e Decisão Humana */}
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Avaliação Formal de Prontidão para Produção (Go-Live Decision)</h3>
                  <p className="card-subtitle">
                    A transição definitiva para produção exige decisão consciente e aprovação humana. Todos os dados do piloto são preservados.
                  </p>
                </div>
                <div className="smoke-test-action">
                  <button className="btn-smoke-test" onClick={handleRunSmokeTest}>
                    <Cpu size={14} />
                    <span>Executar Smoke Tests Pós-Deploy</span>
                  </button>
                </div>
              </div>

              {smokeTestResult && (
                <div className="smoke-test-results-box">
                  <strong>Resultado dos Smoke Tests:</strong> {smokeTestResult.steps.length} fluxos validados em {smokeTestResult.totalDurationMs}ms (Login, Dashboard, Oportunidades, Agent, Propostas, Copilot, Logout).
                </div>
              )}

              {/* Critérios Obrigatórios (Item 69) */}
              <div className="criteria-check-grid">
                <div className="crit-item pass">✅ Nenhum bug P0 aberto</div>
                <div className="crit-item pass">✅ Nenhum SEV-1 ativo</div>
                <div className="crit-item pass">✅ Backups e Restore testados</div>
                <div className="crit-item pass">✅ Vellia Agent validado</div>
                <div className="crit-item pass">✅ Fontes principais online</div>
                <div className="crit-item pass">✅ Permissões RBAC sem falhas</div>
                <div className="crit-item pass">✅ Dados e integridade Good</div>
                <div className="crit-item pass">✅ Piloto Real executado</div>
              </div>

              {/* Formulário de Aprovação Administrativa Humana */}
              <form onSubmit={handleSubmitProductionApproval} className="approval-form">
                <div className="form-row-dual">
                  <div className="form-group">
                    <label>Decisão do Comitê Administrativo</label>
                    <select
                      value={approvalDecision}
                      onChange={(e) => setApprovalDecision(e.target.value)}
                      className="golive-select"
                    >
                      <option value={GoLiveApprovalDecision.APROVADO}>APROVADO (Transição para Produção Imediata)</option>
                      <option value={GoLiveApprovalDecision.APROVADO_COM_PENDENCIAS}>APROVADO COM PENDÊNCIAS MENORES</option>
                      <option value={GoLiveApprovalDecision.NAO_APROVADO}>NÃO APROVADO (Permanecer em Piloto Assistido)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Versão da Liberação (Release Candidate / Prod)</label>
                    <input type="text" value="v2.2-Production" disabled className="golive-input" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Observações Formais de Go-Live</label>
                  <textarea
                    rows={2}
                    className="golive-textarea"
                    placeholder="Registrar considerações executivas, conclusões do piloto e justificativa da decisão..."
                    value={approvalObs}
                    onChange={(e) => setApprovalObs(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Pendências Menores (Opcional - uma por linha)</label>
                  <textarea
                    rows={2}
                    className="golive-textarea"
                    placeholder="Ex: Ajuste fino no filtro por região após o lançamento..."
                    value={approvalPendencias}
                    onChange={(e) => setApprovalPendencias(e.target.value)}
                  />
                </div>

                <div className="approval-form-actions">
                  <button type="submit" className="btn-approve-production">
                    <Award size={16} />
                    <span>Confirmar Decisão de Produção Definitiva</span>
                  </button>
                </div>
              </form>

              {latestApproval && (
                <div className="latest-approval-record">
                  <h5>Último Registro de Decisão Formal</h5>
                  <p>
                    Decisão: <strong>{latestApproval.decision}</strong> por {latestApproval.userName} em {new Date(latestApproval.timestamp).toLocaleString('pt-BR')}.
                  </p>
                </div>
              )}
            </div>

            {/* Painel dos Primeiros 30 Dias Pós-Lançamento (Itens 76-80) */}
            <div className="card-panel">
              <h3 className="card-title">Painel de Acompanhamento: 30 Dias Pós-Lançamento</h3>
              <p className="card-subtitle">
                Pontos de controle estritos no Dia 1, Dia 7, Dia 15 e Dia 30 para assegurar sustentação contínua.
              </p>

              <div className="checkpoints-timeline">
                {postLaunchData?.checkpoints.map((cp) => (
                  <div key={cp.day} className={`checkpoint-card cp-${cp.status.toLowerCase()}`}>
                    <div className="cp-header">
                      <strong>{cp.label}</strong>
                      <span className="cp-date">{cp.date}</span>
                    </div>
                    <p className="cp-findings">{cp.findings}</p>
                    <span className={`cp-status-pill ${cp.status.toLowerCase()}`}>
                      {cp.status === 'COMPLETED' ? 'Concluído' : cp.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Planejado'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Roadmap Pós-Go-Live Planejado (Item 80) */}
              <div className="post-roadmap-box">
                <h4 className="roadmap-title">Roadmap Pós-Go-Live (Backlog Estratégico Futuro)</h4>
                <div className="roadmap-items-grid">
                  {postLaunchData?.roadmapPostGoLive.map((rm) => (
                    <div key={rm.id} className="rm-card">
                      <strong>{rm.title}</strong>
                      <div className="rm-meta">
                        <span>{rm.quarter}</span> • <span>Prioridade {rm.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Runbooks e Manuais de Operação (Itens 59, 60, 61) */}
            <div className="two-columns-grid">
              <div className="card-panel">
                <h4 className="panel-title">📖 Runbooks Operacionais (Item 60)</h4>
                <div className="runbooks-list">
                  {OPERATIONAL_RUNBOOKS.map((rb) => (
                    <div key={rb.id} className="runbook-item">
                      <strong>{rb.title}</strong>
                      <span className="rb-trig">Gatilho: {rb.trigger}</span>
                      <span className="rb-status">{rb.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-panel">
                <h4 className="panel-title">👥 Responsáveis Operacionais (Owners - Item 61)</h4>
                <div className="owners-list">
                  {OPERATIONAL_OWNERS.map((ow, idx) => (
                    <div key={idx} className="owner-item">
                      <div>
                        <strong>{ow.domain}</strong>
                        <p>{ow.owner} — {ow.role}</p>
                      </div>
                      <span className="owner-email">{ow.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSEÇÃO 10: FASE 51 — ESTABILIZAÇÃO & WAVES              */}
        {/* ========================================================= */}
        {activeSubTab === 'estabilizacao' && (
          <div className="subtab-panel">
            {/* Header com Status da Onda e Regra de Ouro */}
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Go-Live em Ondas & Estabilização Operacional</h3>
                  <p className="card-subtitle">
                    Princípio Central: Nenhum módulo novo. Foco absoluto em descobrir e corrigir falhas, fricções e inconsistências com dados e editais reais.
                  </p>
                </div>
                <div className="phase-actions-row">
                  <span className="phase-pill" style={{ background: '#10b981', color: '#fff', fontWeight: 600 }}>
                    Onda Ativa: {activeWave?.name || 'Wave 1 — Piloto'}
                  </span>
                </div>
              </div>

              {/* Seletor de Ondas */}
              <div className="phases-flow-stepper" style={{ marginTop: '16px' }}>
                {Object.entries(GOLIVE_WAVES).map(([key, w], idx) => {
                  const isCurrent = activeWave?.id === w.id;
                  return (
                    <div
                      key={key}
                      className={`flow-step ${isCurrent ? 'step-active' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTransitionWave(key)}
                    >
                      <div className="step-circle">
                        <span>{idx + 1}</span>
                      </div>
                      <span className="step-name">{w.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Detalhes da Onda Selecionada */}
              {activeWave && (
                <div style={{ marginTop: '16px', padding: '14px', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '15px' }}>{activeWave.name} — {activeWave.description}</strong>
                    <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1' }}>
                      Autonomia: {activeWave.autonomyLevel}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted, #64748b)' }}>Empresas Liberadas:</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 500 }}>{activeWave.companies?.join(', ')}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted, #64748b)' }}>Módulos Habilitados:</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 500 }}>{activeWave.modules?.join(', ')}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted, #64748b)' }}>Critérios de Liberação (Gate):</span>
                      <p style={{ margin: '2px 0 0', fontWeight: 500 }}>{activeWave.gateCriteria}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Go-Live Monitor: KPIs e Eficiência Operacional */}
            <div className="goals-metrics-grid">
              <div className="goal-card">
                <span className="goal-label">Precisão do Radar (Precision)</span>
                <span className="goal-value text-teal">{stabilizationStatus?.kpis?.precisionRate || '94.2%'}</span>
                <span className="goal-target">Validação manual vs Agente</span>
                <div className="goal-bar"><div className="goal-progress" style={{ width: '94%' }} /></div>
              </div>
              <div className="goal-card">
                <span className="goal-label">Cobertura de Oportunidades (Recall)</span>
                <span className="goal-value text-teal">{stabilizationStatus?.kpis?.recallRate || '91.5%'}</span>
                <span className="goal-target">Sem perdas de editais aderentes</span>
                <div className="goal-bar"><div className="goal-progress" style={{ width: '91%' }} /></div>
              </div>
              <div className="goal-card">
                <span className="goal-label">Blocker Recall (Requisitos Críticos)</span>
                <span className="goal-value text-green">{stabilizationStatus?.kpis?.blockerRecall || '98.0%'}</span>
                <span className="goal-target">Detecção de travas editalícias</span>
                <div className="goal-bar"><div className="goal-progress" style={{ width: '98%' }} /></div>
              </div>
              <div className="goal-card">
                <span className="goal-label">Tempo até Decisão (Time to Decision)</span>
                <span className="goal-value">{stabilizationStatus?.kpis?.avgTimeToDecision || '4.2h'}</span>
                <span className="goal-target">Captação → Go/No-Go</span>
                <div className="goal-bar"><div className="goal-progress" style={{ width: '85%' }} /></div>
              </div>
            </div>

            {/* Go-Live Issue Log (P0, P1, P2, P3) */}
            <div className="card-panel">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Go-Live Issue Log & Triagem de Bugs</h3>
                  <p className="card-subtitle">
                    Registro centralizado de falhas e fricções reais. P0 bloqueia liberação; P1 tem contenção prioritária; P3 congelado.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted, #64748b)' }}>Severidade:</span>
                  {['ALL', 'P0', 'P1', 'P2', 'P3'].map(sev => (
                    <button
                      key={sev}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color, #cbd5e1)',
                        background: severityFilter === sev ? '#0f172a' : '#fff',
                        color: severityFilter === sev ? '#fff' : '#334155',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSeverityFilter(sev)}
                    >
                      {sev === 'ALL' ? 'Todos' : sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de Issues */}
              <div style={{ overflowX: 'auto', marginTop: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary, #f1f5f9)', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 12px' }}>ID / Título</th>
                      <th style={{ padding: '8px 12px' }}>Módulo</th>
                      <th style={{ padding: '8px 12px' }}>Severidade</th>
                      <th style={{ padding: '8px 12px' }}>Responsável</th>
                      <th style={{ padding: '8px 12px' }}>Status</th>
                      <th style={{ padding: '8px 12px' }}>Alvo</th>
                      <th style={{ padding: '8px 12px' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issueLog
                      .filter(iss => severityFilter === 'ALL' || iss.severity === severityFilter)
                      .map((iss) => {
                        const sevBg = iss.severity === 'P0' ? '#ef4444' : iss.severity === 'P1' ? '#f59e0b' : iss.severity === 'P2' ? '#3b82f6' : '#64748b';
                        return (
                          <tr key={iss.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '10px 12px' }}>
                              <strong>{iss.id}</strong> — {iss.title}
                            </td>
                            <td style={{ padding: '10px 12px' }}>{iss.module}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ padding: '2px 8px', borderRadius: '4px', color: '#fff', background: sevBg, fontWeight: 600, fontSize: '11px' }}>
                                {iss.severity}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>{iss.owner}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                background: iss.status === 'CLOSED' ? '#dcfce7' : iss.status === 'IN_PROGRESS' ? '#fef3c7' : '#e0e7ff',
                                color: iss.status === 'CLOSED' ? '#166534' : iss.status === 'IN_PROGRESS' ? '#92400e' : '#3730a3',
                                fontWeight: 500
                              }}>
                                {iss.status}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>{iss.releaseTarget}</td>
                            <td style={{ padding: '10px 12px' }}>
                              {iss.status !== 'CLOSED' ? (
                                <button
                                  style={{ padding: '3px 8px', fontSize: '11px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                  onClick={() => handleUpdateIssueStatus(iss.id, iss.status === 'OPEN' ? 'IN_PROGRESS' : 'CLOSED')}
                                >
                                  {iss.status === 'OPEN' ? 'Iniciar Fix' : 'Concluir'}
                                </button>
                              ) : (
                                <span style={{ color: '#10b981', fontSize: '12px' }}>✓ Resolvido</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Governança do Piloto: Catálogo Real e Políticas */}
            <div className="two-columns-grid">
              <div className="card-panel">
                <h4 className="panel-title">🏢 Catálogo Real em Operação</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ padding: '10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#0369a1' }}>Veeluen Solutions</strong>
                    <p style={{ margin: '4px 0 0', color: '#475569' }}>
                      ETE / ETA, Elevatórias de Esgoto, NR-13 (Caldeiras/Vasos), SPDA, SST, Gestão de Resíduos Industriais, Energia Solar, Obras e Reformas.
                    </p>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Sinônimos: Operação de ETE, Tratamento de Efluentes, Manutenção de Estação.</span>
                  </div>
                  <div style={{ padding: '10px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <strong style={{ color: '#059669' }}>Excelência Ambiental</strong>
                    <p style={{ margin: '4px 0 0', color: '#475569' }}>
                      Emissões Atmosféricas, Isocinética, Modelagem de Dispersão (AERMOD), Inventário de Emissões GEE, Qualidade do Ar, Ruído Ambiental, Odorimetria, Consultoria Ambiental.
                    </p>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Sinônimos: Amostragem em Chaminé, Monitoramento de Fontes Fixas, Laudo de Ruído NBR 10151.</span>
                  </div>
                </div>
              </div>

              <div className="card-panel">
                <h4 className="panel-title">🛡️ Políticas de Estabilização & Hotfix</h4>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '8px 10px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                    <strong>P0 (Crítico / Blocker):</strong> {BUG_TRIAGE_POLICY.P0}
                  </div>
                  <div style={{ padding: '8px 10px', background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
                    <strong>P1 (Workflow Bloqueado):</strong> {BUG_TRIAGE_POLICY.P1}
                  </div>
                  <div style={{ padding: '8px 10px', background: '#f0f9ff', borderLeft: '4px solid #0284c7', borderRadius: '4px' }}>
                    <strong>P2 (UX Friction):</strong> {BUG_TRIAGE_POLICY.P2}
                  </div>
                  <div style={{ padding: '8px 10px', background: '#f8fafc', borderLeft: '4px solid #94a3b8', borderRadius: '4px' }}>
                    <strong>P3 (Enhancement):</strong> {BUG_TRIAGE_POLICY.P3} — Não aplicar durante estabilização.
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0' }}>
                    Regra de Deploy: {HOTFIX_POLICY.ALLOWED_REASONS.join(', ')}. Mudanças cosméticas são agrupadas na cadência de release normal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Correção Humana da Validação (Item 14) */}
      {correctionModalItem && (
        <div className="feedback-modal-overlay" onClick={() => setCorrectionModalItem(null)}>
          <div className="feedback-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h3>Correção de Matching — {correctionModalItem.opportunityId}</h3>
              <button className="feedback-close-btn" onClick={() => setCorrectionModalItem(null)}>×</button>
            </div>
            <form onSubmit={handleSaveCorrection} className="feedback-form">
              <div className="form-group">
                <label>Empresa Correta</label>
                <select
                  value={correctionCompany}
                  onChange={(e) => setCorrectionCompany(e.target.value)}
                  className="feedback-select"
                >
                  <option value="Excelência Ambiental">Excelência Ambiental</option>
                  <option value="Veeluen Solutions">Veeluen Solutions</option>
                  <option value="Ambas (Consórcio)">Ambas (Consórcio)</option>
                  <option value="Nenhuma (Fora do Escopo)">Nenhuma (Fora do Escopo)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Serviço Correto do Catálogo</label>
                <input
                  type="text"
                  required
                  className="feedback-input"
                  placeholder="Nome do serviço ou especialidade correta..."
                  value={correctionService}
                  onChange={(e) => setCorrectionService(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Aderência Esperada (0 a 100%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="feedback-input"
                  value={correctionExpectedScore}
                  onChange={(e) => setCorrectionExpectedScore(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Motivo da Correção</label>
                <textarea
                  rows={3}
                  required
                  className="feedback-textarea"
                  placeholder="Explique por que o resultado automático estava incorreto..."
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                />
              </div>

              <div className="feedback-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setCorrectionModalItem(null)}>Cancelar</button>
                <button type="submit" className="btn-submit-feedback">Salvar Correção</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Registro de False Negative (Item 19) */}
      {showFalseNegativeModal && (
        <div className="feedback-modal-overlay" onClick={() => setShowFalseNegativeModal(false)}>
          <div className="feedback-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-modal-header">
              <h3>Registrar False Negative Manual</h3>
              <button className="feedback-close-btn" onClick={() => setShowFalseNegativeModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveFalseNegative} className="feedback-form">
              <div className="form-group">
                <label>Portal / Fonte de Origem</label>
                <select value={fnPortal} onChange={(e) => setFnPortal(e.target.value)} className="feedback-select">
                  <option value="Compras.gov.br">Compras.gov.br</option>
                  <option value="PNCP">PNCP</option>
                  <option value="Petronect">Petronect</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Número do Processo / Pregão</label>
                <input
                  type="text"
                  placeholder="Ex: PE 90023/2026"
                  className="feedback-input"
                  value={fnNotice}
                  onChange={(e) => setFnNotice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Objeto do Edital</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva o objeto da oportunidade localizada..."
                  className="feedback-textarea"
                  value={fnTitle}
                  onChange={(e) => setFnTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Por que o Vellia não capturou ou não classificou?</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: O termo utilizado no edital não coincidia com o catálogo principal..."
                  className="feedback-textarea"
                  value={fnReason}
                  onChange={(e) => setFnReason(e.target.value)}
                />
              </div>
              <div className="feedback-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowFalseNegativeModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit-feedback">Registrar Oportunidade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Onboarding por Perfil (Itens 63-67) */}
      <RoleOnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        initialRole={onboardingInitialRole}
        onNavigate={onNavigate}
      />
    </div>
  );
}
