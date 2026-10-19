import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Eye,
  PlusCircle,
  X,
  Target,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  Send,
  UserCheck,
  UserX,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Layers,
  ChevronRight
} from 'lucide-react';

import {
  nextBestActionService,
  ActionPriority,
  ActionType,
  ActionStatus,
  IgnoreReason,
  OutcomeType,
  ConfidenceLevel,
  StakeholderRole,
  AccountObjective
} from '../../services/prescriptive/nextBestActionService.js';
import './PrescriptiveActionsView.css';

export default function PrescriptiveActionsView({ onSelectOpportunity, onOpenCopilot }) {
  // Filtros
  const [selectedCompany, setSelectedCompany] = useState('Consolidado');
  const [selectedPriority, setSelectedPriority] = useState('TODAS');
  const [activeSubTab, setActiveSubTab] = useState('hoje'); // 'hoje' | 'semana' | 'contas' | 'futuras' | 'relacionamentos' | 'plano'
  const [searchTerm, setSearchTerm] = useState('');

  // Dados do Serviço
  const [recommendations, setRecommendations] = useState([]);
  const [dailyFocus, setDailyFocus] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [accountPlans, setAccountPlans] = useState([]);
  const [playbooks, setPlaybooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [whyNowModalItem, setWhyNowModalItem] = useState(null);
  const [ignoreModalItem, setIgnoreModalItem] = useState(null);
  const [ignoreReason, setIgnoreReason] = useState(IgnoreReason.NAO_RELEVANTE);
  const [completeModalItem, setCompleteModalItem] = useState(null);
  const [completeOutcome, setCompleteOutcome] = useState(OutcomeType.CONCLUIDA);
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [meetingBriefModalOrg, setMeetingBriefModalOrg] = useState(null);
  const [meetingBriefData, setMeetingBriefData] = useState(null);

  // Testes e Feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const loadData = () => {
    setLoading(true);
    try {
      const recs = nextBestActionService.generateRecommendations(selectedCompany);
      const daily = nextBestActionService.getDailyFocus(selectedCompany);
      const weekly = nextBestActionService.getWeeklyCommercialPlan(selectedCompany);
      const plans = nextBestActionService.getAccountPlans();
      const pbs = nextBestActionService.getPlaybooks();

      setRecommendations(recs);
      setDailyFocus(daily);
      setWeeklyPlan(weekly);
      setAccountPlans(plans);
      setPlaybooks(pbs);
    } catch (err) {
      console.error('Erro ao carregar ações prescritivas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Aceitar Recomendação (Item 54)
  const handleAccept = (actionId) => {
    const res = nextBestActionService.acceptRecommendation(actionId);
    if (res.success) {
      showToast('Ação aceita! Follow-up comercial sincronizado no CRM.');
      loadData();
    }
  };

  // Confirmar Ignorar com Motivo (Item 54-58)
  const handleConfirmIgnore = () => {
    if (!ignoreModalItem) return;
    const res = nextBestActionService.ignoreRecommendation(ignoreModalItem.id, ignoreReason);
    if (res.success) {
      showToast('Recomendação ignorada e motivo registrado para aprendizado.');
      setIgnoreModalItem(null);
      loadData();
    }
  };

  // Confirmar Conclusão com Desfecho (Item 60)
  const handleConfirmComplete = () => {
    if (!completeModalItem) return;
    const res = nextBestActionService.completeRecommendation(completeModalItem.id, completeOutcome, outcomeNotes);
    if (res.success) {
      showToast('Ação concluída com desfecho registrado no CRM.');
      setCompleteModalItem(null);
      setOutcomeNotes('');
      loadData();
    }
  };

  // Abrir Briefing Pré-Reunião (Item 65-68)
  const handleOpenMeetingBrief = (orgName) => {
    const brief = nextBestActionService.generateMeetingBrief(orgName);
    setMeetingBriefData(brief);
    setMeetingBriefModalOrg(orgName);
  };

  // Executar Testes E2E (Item 141-147)
  const handleRunTests = () => {
    const results = nextBestActionService.runE2ETests();
    setTestResults(results);
    showToast(`Testes concluídos: ${results.passed}/${results.totalTests} aprovados!`);
  };

  // Subtabs definidas no Item 2
  const SUBTABS = [
    { id: 'hoje', label: 'Hoje (Foco Diário)', icon: Zap, count: recommendations.filter(r => r.priority === ActionPriority.CRITICA || r.priority === ActionPriority.ALTA).length },
    { id: 'semana', label: 'Esta Semana', icon: Calendar, count: weeklyPlan?.top5Actions?.length || 0 },
    { id: 'contas', label: 'Contas Prioritárias', icon: Building2, count: accountPlans.length },
    { id: 'futuras', label: 'Oportunidades Futuras', icon: Target, count: recommendations.filter(r => r.whyNow?.includes('Janela histórica')).length },
    { id: 'relacionamentos', label: 'Relacionamentos & Gaps', icon: UserCheck, count: recommendations.filter(r => !r.hasContact).length },
    { id: 'plano', label: 'Playbooks Comerciais', icon: BookOpen, count: playbooks.length }
  ];

  // Filtro de Recomendações
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(r => {
      const matchSearch = r.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.actionTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.targetService.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPriority = selectedPriority === 'TODAS' || r.priority === selectedPriority;
      return matchSearch && matchPriority;
    });
  }, [recommendations, searchTerm, selectedPriority]);

  if (loading || !dailyFocus) {
    return (
      <div className="prescriptive-view-container" style={{ padding: '40px', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} color="#00E5C9" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: '#94A3B8' }}>Consolidando sinais e gerando próximas melhores ações...</p>
      </div>
    );
  }

  return (
    <div className="prescriptive-view-container">
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0B132B',
          border: '1px solid #00E5C9',
          color: '#00E5C9',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 9999,
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          {toastMessage}
        </div>
      )}

      {/* HEADER DA VISÃO PRESCRITIVA */}
      <div className="prescriptive-header">
        <div className="prescriptive-title-area">
          <h2>
            <Zap size={24} color="#00E5C9" />
            Inteligência Comercial Prescritiva — Next Best Action
            <span className="prescriptive-badge-core">FASE 33</span>
          </h2>
          <p className="prescriptive-subtitle">
            Transformando dados em prioridade operacional: antecipe <strong>quem contatar agora</strong>, 
            <strong> qual serviço apresentar</strong> e <strong>qual a próxima ação sugerida com base em evidências</strong>.
          </p>
        </div>

        <div className="prescriptive-controls">
          <select 
            className="prescriptive-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            title="Separador por Empresa"
          >
            <option value="Consolidado">Visão Consolidada (Grupo)</option>
            <option value="Veeluen Solutions">Veeluen Solutions</option>
            <option value="Excelência Ambiental">Excelência Ambiental</option>
          </select>

          <button className="prescriptive-btn-secondary" onClick={handleRunTests} title="Executar Cenários de Teste E2E (Item 141-147)">
            <ShieldAlert size={15} />
            Testes E2E ({testResults ? `${testResults.passed}/${testResults.totalTests}` : 'Item 141-147'})
          </button>
        </div>
      </div>

      {/* BANNER DE PRINCÍPIO: O SISTEMA SUGERE, O USUÁRIO CONFIRMA (Item 1, 3, 64) */}
      <div className="prescriptive-principle-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sparkles size={18} color="#00E5C9" />
          <span>
            <strong>Governança Comercial:</strong> O Vellia analisa sinais em tempo real e recomenda a próxima melhor ação.
            <em> Nenhuma tarefa, e-mail ou contato externo é disparado automaticamente sem a confirmação e decisão humana.</em>
          </span>
        </div>
        <span style={{ fontSize: '11px', background: 'rgba(0, 229, 201, 0.12)', color: '#00E5C9', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
          {recommendations.filter(r => r.status === ActionStatus.SUGERIDA).length} Ações Sugeridas
        </span>
      </div>

      {/* RESULTADO DOS TESTES AUTOMATIZADOS (QUANDO EXECUTADOS) */}
      {testResults && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          padding: '14px 18px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Relatório de Validação de Regras Prescritivas (Cenários 1 a 6)
            </span>
            <span style={{ color: '#94A3B8' }}>{testResults.passed} de {testResults.totalTests} testes aprovados</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
            {testResults.details.map((t, idx) => (
              <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '6px 10px', borderRadius: '6px' }}>
                <span style={{ color: t.status === 'PASS' ? '#10B981' : '#EF4444', fontWeight: 700, marginRight: '6px' }}>
                  [{t.status}]
                </span>
                <span style={{ color: '#E2E8F0' }}><strong>{t.scenario}:</strong> {t.rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CARDS DE INDICADORES PRINCIPAIS */}
      <div className="prescriptive-metrics-grid">
        <div className="prescriptive-metric-card">
          <div className="metric-card-top">
            <span>Ações Críticas / Urgentes</span>
            <AlertTriangle size={16} color="#EF4444" />
          </div>
          <div className="metric-card-value" style={{ color: '#EF4444' }}>
            {recommendations.filter(r => r.priority === ActionPriority.CRITICA).length}
          </div>
          <div className="metric-card-sub">Contratos a vencer e prazos curtos</div>
        </div>

        <div className="prescriptive-metric-card">
          <div className="metric-card-top">
            <span>Alta Prioridade da Semana</span>
            <Zap size={16} color="#F59E0B" />
          </div>
          <div className="metric-card-value" style={{ color: '#F59E0B' }}>
            {recommendations.filter(r => r.priority === ActionPriority.ALTA).length}
          </div>
          <div className="metric-card-sub">Janelas históricas e retomada</div>
        </div>

        <div className="prescriptive-metric-card">
          <div className="metric-card-top">
            <span>Contas Prioritárias Mapeadas</span>
            <Building2 size={16} color="#00E5C9" />
          </div>
          <div className="metric-card-value">{accountPlans.length}</div>
          <div className="metric-card-sub">Com plano de conta estratégico</div>
        </div>

        <div className="prescriptive-metric-card">
          <div className="metric-card-top">
            <span>Contas Sem Contato (Gap)</span>
            <UserX size={16} color="#38BDF8" />
          </div>
          <div className="metric-card-value">{dailyFocus.uncontactedStrategicAccountsCount}</div>
          <div className="metric-card-sub">Exigem identificação de interlocutor</div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE AS 6 SUBSEÇÕES (Item 2) */}
      <div className="prescriptive-subtabs-nav">
        {SUBTABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`prescriptive-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSubTab(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="prescriptive-tab-badge">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* 1. SUBSEÇÃO: HOJE (FOCO DIÁRIO - Item 45, 46)                   */}
      {/* ============================================================== */}
      {activeSubTab === 'hoje' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card de Foco de Hoje */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(6, 78, 59, 0.25))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 800 }}>PLANO OPERACIONAL DE HOJE • {dailyFocus.date}</span>
              <h3 style={{ margin: '6px 0 4px 0', color: '#FFF', fontSize: '18px' }}>
                {dailyFocus.criticalActions.length} ações prioritárias exigem sua atenção hoje
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>
                Follow-ups pendentes: <strong>{dailyFocus.pendingFollowUpsCount}</strong> • Reuniões agendadas: <strong>{dailyFocus.scheduledMeetingsCount}</strong> • Gaps de contato: <strong>{dailyFocus.uncontactedStrategicAccountsCount}</strong>
              </p>
            </div>

            <button 
              className="prescriptive-btn-primary"
              onClick={() => setActiveSubTab('semana')}
            >
              <Calendar size={14} /> Ver Plano da Semana
            </button>
          </div>

          {/* Lista de Recomendações Críticas e Altas */}
          <div className="recommendations-list">
            {dailyFocus.criticalActions.map(rec => (
              <div key={rec.id} className={`recommendation-card ${rec.priority.toLowerCase()}`}>
                <div className="rec-header-row">
                  <div className="rec-title-wrap">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className={`badge-priority ${rec.priority.toLowerCase()}`}>
                        {rec.priority}
                      </span>
                      <span style={{ fontSize: '12px', color: '#00E5C9', fontWeight: 700 }}>
                        {rec.organization}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        • {rec.company}
                      </span>
                    </div>
                    <h4>{rec.actionTitle}</h4>
                  </div>

                  <div className="rec-badges-row">
                    {rec.confidence && (
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        Confiança: <strong style={{ color: '#00E5C9' }}>{rec.confidence}</strong>
                      </span>
                    )}
                    <button 
                      className="prescriptive-btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      onClick={() => setWhyNowModalItem(rec)}
                    >
                      <HelpCircle size={13} /> Por que agora?
                    </button>
                  </div>
                </div>

                <p className="rec-body-desc">{rec.actionDescription}</p>

                {/* Bloco Resumo "Por que agora?" (Item 12, 13) */}
                <div className="why-now-box">
                  <Clock size={16} color="#00E5C9" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Momento Comercial:</strong> {rec.whyNow}
                  </div>
                </div>

                <div className="rec-footer-row">
                  <div>
                    Responsável: <strong style={{ color: '#FFF' }}>{rec.owner}</strong> • Prazo sugerido: <strong style={{ color: '#F59E0B' }}>{rec.dueDate}</strong>
                    {rec.contactName && ` • Contato: ${rec.contactName}`}
                  </div>

                  <div className="rec-actions-btns">
                    {rec.status === ActionStatus.SUGERIDA && (
                      <>
                        <button className="btn-rec-ignore" onClick={() => setIgnoreModalItem(rec)}>
                          Ignorar
                        </button>
                        <button className="btn-rec-accept" onClick={() => handleAccept(rec.id)}>
                          <CheckCircle2 size={14} /> Aceitar Sugestão
                        </button>
                      </>
                    )}
                    {rec.status === ActionStatus.ACEITA && (
                      <button className="btn-rec-complete" onClick={() => setCompleteModalItem(rec)}>
                        <CheckCircle2 size={14} /> Registrar Desfecho
                      </button>
                    )}
                    <button 
                      className="prescriptive-btn-secondary" 
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                      onClick={() => handleOpenMeetingBrief(rec.organization)}
                    >
                      <FileText size={13} /> Briefing
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUBSEÇÃO: ESTA SEMANA (PLANO COMERCIAL - Item 42 a 44)       */}
      {/* ============================================================== */}
      {activeSubTab === 'semana' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '14px',
            padding: '22px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#FFF', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#00E5C9" />
              Plano Comercial da Semana ({weeklyPlan.weekLabel})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Top 5 Contas Prioritárias */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#00E5C9', fontSize: '14px' }}>
                  Top 5 Contas Prioritárias
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {weeklyPlan.top5Accounts.map((acc, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '10px 14px',
                      borderRadius: '8px'
                    }}>
                      <div>
                        <strong style={{ color: '#FFF', fontSize: '13px' }}>{acc.name}</strong>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{acc.targetService} • {acc.company}</div>
                      </div>
                      <span className={`badge-priority ${acc.priority.toLowerCase()}`}>
                        {acc.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contratos Críticos a Monitorar */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#F59E0B', fontSize: '14px' }}>
                  Contratos Críticos em Janela de Ação
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {weeklyPlan.criticalContractsToMonitor.map((c, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      padding: '10px 14px',
                      borderRadius: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ color: '#FFF', fontSize: '13px' }}>{c.client}</strong>
                        <span style={{ color: '#EF4444', fontWeight: 800, fontSize: '12px' }}>{c.daysLeft} dias restantes</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
                        {c.service} • <strong style={{ color: '#00E5C9' }}>{c.status}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Todas as Ações da Semana com Filtro */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '14px',
            padding: '22px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ margin: 0, color: '#FFF', fontSize: '16px' }}>
                Ações Recomendadas da Semana ({filteredRecommendations.length})
              </h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select 
                  className="prescriptive-select"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                >
                  <option value="TODAS">Todas as Prioridades</option>
                  <option value="CRÍTICA">Apenas Críticas</option>
                  <option value="ALTA">Apenas Altas</option>
                  <option value="MÉDIA">Apenas Médias</option>
                </select>
              </div>
            </div>

            <div className="recommendations-list">
              {filteredRecommendations.map(rec => (
                <div key={rec.id} className={`recommendation-card ${rec.priority.toLowerCase()}`}>
                  <div className="rec-header-row">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className={`badge-priority ${rec.priority.toLowerCase()}`}>{rec.priority}</span>
                        <strong style={{ color: '#00E5C9' }}>{rec.organization}</strong>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>({rec.company})</span>
                      </div>
                      <h4 style={{ margin: 0, color: '#FFF' }}>{rec.actionTitle}</h4>
                    </div>

                    <button 
                      className="prescriptive-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                      onClick={() => setWhyNowModalItem(rec)}
                    >
                      <HelpCircle size={13} /> Detalhes & Evidências
                    </button>
                  </div>

                  <p className="rec-body-desc">{rec.actionDescription}</p>

                  <div className="rec-footer-row">
                    <span>Responsável: <strong>{rec.owner}</strong> • Prazo: {rec.dueDate}</span>
                    <div className="rec-actions-btns">
                      {rec.status === ActionStatus.SUGERIDA && (
                        <>
                          <button className="btn-rec-ignore" onClick={() => setIgnoreModalItem(rec)}>Ignorar</button>
                          <button className="btn-rec-accept" onClick={() => handleAccept(rec.id)}>
                            <CheckCircle2 size={13} /> Aceitar
                          </button>
                        </>
                      )}
                      {rec.status === ActionStatus.ACEITA && (
                        <button className="btn-rec-complete" onClick={() => setCompleteModalItem(rec)}>
                          <CheckCircle2 size={13} /> Registrar Desfecho
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUBSEÇÃO: CONTAS PRIORITÁRIAS (ACCOUNT PLANS - Item 48 a 51)*/}
      {/* ============================================================== */}
      {activeSubTab === 'contas' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {accountPlans.map(plan => (
            <div key={plan.id} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(0, 229, 201, 0.3)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#00E5C9', fontWeight: 800 }}>PLANO DE CONTA ESTRATÉGICO</span>
                  <h3 style={{ margin: '4px 0 2px 0', color: '#FFF', fontSize: '18px' }}>{plan.organization}</h3>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{plan.company}</span>
                </div>
                <span style={{
                  fontSize: '11px',
                  background: 'rgba(0, 229, 201, 0.15)',
                  color: '#00E5C9',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  {plan.objective}
                </span>
              </div>

              <div>
                <strong style={{ fontSize: '12px', color: '#94A3B8' }}>Serviços Prioritários:</strong>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {plan.targetServices.map((srv, i) => (
                    <span key={i} style={{ background: 'rgba(30, 41, 59, 0.7)', color: '#FFF', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <strong style={{ fontSize: '12px', color: '#94A3B8' }}>Stakeholders Mapeados:</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                  {plan.stakeholders.map((stk, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', justifyContent: 'space-between' }}>
                      <span><strong>{stk.name}</strong> ({stk.role})</span>
                      <span style={{ color: '#00E5C9', fontSize: '11px' }}>{stk.email}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '8px', fontSize: '12px' }}>
                <strong style={{ color: '#F59E0B' }}>Riscos Mapeados:</strong> {plan.risks}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(148, 163, 184, 0.1)' }}>
                <button 
                  className="prescriptive-btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                  onClick={() => handleOpenMeetingBrief(plan.organization)}
                >
                  <FileText size={13} /> Gerar Meeting Brief
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUBSEÇÃO: OPORTUNIDADES FUTURAS (PREVENTIVAS)               */}
      {/* ============================================================== */}
      {activeSubTab === 'futuras' && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '14px',
          padding: '22px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#FFF', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="#00E5C9" />
            Oportunidades Futuras & Ações Comerciais Antecipadas
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '-10px', marginBottom: '20px' }}>
            Ações prescritivas disparadas com base em PCA, histórico de compras periódicas e sinais preditivos.
          </p>

          <div className="recommendations-list">
            {recommendations.filter(r => r.whyNow?.includes('Janela histórica') || r.whyNow?.includes('radar')).map(rec => (
              <div key={rec.id} className="recommendation-card alta">
                <div className="rec-header-row">
                  <div>
                    <span className="badge-priority alta">{rec.priority}</span>
                    <h4 style={{ margin: '6px 0 2px 0', color: '#FFF' }}>{rec.actionTitle}</h4>
                    <span style={{ fontSize: '12px', color: '#00E5C9' }}>{rec.organization}</span>
                  </div>

                  <button className="prescriptive-btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setWhyNowModalItem(rec)}>
                    Evidências do Sinal
                  </button>
                </div>

                <p className="rec-body-desc">{rec.actionDescription}</p>
                <div className="why-now-box">
                  <strong>Sinal Preditivo:</strong> {rec.whyNow}
                </div>

                <div className="rec-footer-row">
                  <span>Alvo: {rec.targetService}</span>
                  <button className="btn-rec-accept" onClick={() => handleAccept(rec.id)}>
                    <CheckCircle2 size={13} /> Preparar Abordagem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SUBSEÇÃO: RELACIONAMENTOS & GAPS (Item 24 a 33)              */}
      {/* ============================================================== */}
      {activeSubTab === 'relacionamentos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '14px',
            padding: '22px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#FFF', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserX size={18} color="#EF4444" />
              Contas Prioritárias com Gap de Relacionamento ou Sem Contato
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '-10px', marginBottom: '20px' }}>
              Identificação de organizações estratégicas sem interlocutor cadastrado ou com mais de 30 dias sem interação comercial.
            </p>

            <div className="recommendations-list">
              {recommendations.filter(r => !r.hasContact || r.whyNow?.includes('Sem nenhuma interação')).map(rec => (
                <div key={rec.id} className="recommendation-card media">
                  <div className="rec-header-row">
                    <div>
                      <span className="badge-priority media">{rec.actionType}</span>
                      <h4 style={{ margin: '6px 0 2px 0', color: '#FFF' }}>{rec.actionTitle}</h4>
                      <span style={{ fontSize: '12px', color: '#00E5C9' }}>{rec.organization}</span>
                    </div>

                    <span style={{ fontSize: '11px', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                      Papel Sugerido: {rec.suggestedRole}
                    </span>
                  </div>

                  <p className="rec-body-desc">{rec.actionDescription}</p>

                  <div className="why-now-box">
                    <strong>Gap Identificado:</strong> {rec.whyNow}
                  </div>

                  <div className="rec-footer-row">
                    <span>Responsável comercial: {rec.owner}</span>
                    <button className="btn-rec-accept" onClick={() => handleAccept(rec.id)}>
                      <PlusCircle size={13} /> Cadastrar Contato no CRM
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SUBSEÇÃO: PLAYBOOKS COMERCIAIS (Item 134 a 140)              */}
      {/* ============================================================== */}
      {activeSubTab === 'plano' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {playbooks.map(pb => (
            <div key={pb.id} style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#00E5C9', fontWeight: 800 }}>ESTRATÉGIA COMERCIAL PADRONIZADA</span>
                <h3 style={{ margin: '4px 0 4px 0', color: '#FFF', fontSize: '17px' }}>{pb.name}</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>{pb.objective}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pb.stages.map((stage, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #00E5C9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#00E5C9', fontWeight: 700 }}>
                      <span>Etapa {idx + 1}: {stage.title}</span>
                      <span>D{stage.dayOffset > 0 ? `+${stage.dayOffset}` : stage.dayOffset} dias</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#CBD5E1', marginTop: '4px' }}>
                      {stage.description}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Playbook orientativo: define a cadência sugerida sem automação cega.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: POR QUE AGORA? (EVIDÊNCIAS DETALHADAS - Item 101 a 103)  */}
      {/* ============================================================== */}
      {whyNowModalItem && (
        <div className="prescriptive-modal-backdrop" onClick={() => setWhyNowModalItem(null)}>
          <div className="prescriptive-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="prescriptive-badge-core">EVIDÊNCIAS & REGRAS DO MOTOR PRESCRITIVO</span>
                <h3 style={{ margin: '8px 0 2px 0', color: '#FFF', fontSize: '18px' }}>
                  Por que esta ação foi recomendada agora?
                </h3>
                <span style={{ fontSize: '13px', color: '#00E5C9' }}>
                  {whyNowModalItem.organization} • {whyNowModalItem.actionTitle}
                </span>
              </div>
              <button onClick={() => setWhyNowModalItem(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '20px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' }}>
              <strong style={{ color: '#00E5C9' }}>Motivo Temporal Identificado:</strong>
              <p style={{ margin: '6px 0 0 0', color: '#CBD5E1' }}>{whyNowModalItem.whyNow}</p>
            </div>

            <h4 style={{ color: '#FFF', fontSize: '14px', margin: '0 0 8px 0' }}>Sinais e Evidências Coletadas:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {whyNowModalItem.evidenceList?.map((ev, i) => (
                <div key={i} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '10px', borderRadius: '8px', fontSize: '12px', borderLeft: '3px solid #00E5C9', color: '#E2E8F0' }}>
                  {ev}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="prescriptive-btn-secondary" onClick={() => setWhyNowModalItem(null)}>Fechar</button>
              <button className="btn-rec-accept" onClick={() => { handleAccept(whyNowModalItem.id); setWhyNowModalItem(null); }}>
                <CheckCircle2 size={14} /> Aceitar Ação Recomendada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: IGNORAR RECOMENDAÇÃO (FEEDBACK LOOP - Item 54 a 58)      */}
      {/* ============================================================== */}
      {ignoreModalItem && (
        <div className="prescriptive-modal-backdrop" onClick={() => setIgnoreModalItem(null)}>
          <div className="prescriptive-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#FFF', margin: '0 0 8px 0', fontSize: '18px' }}>Ignorar Recomendação</h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 16px 0' }}>
              Por favor, informe o motivo para calibrar as sugestões futuras do motor de inteligência:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {Object.values(IgnoreReason).map(reason => (
                <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#CBD5E1', cursor: 'pointer', background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '8px' }}>
                  <input 
                    type="radio" 
                    name="ignoreReason" 
                    value={reason} 
                    checked={ignoreReason === reason} 
                    onChange={(e) => setIgnoreReason(e.target.value)} 
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="prescriptive-btn-secondary" onClick={() => setIgnoreModalItem(null)}>Cancelar</button>
              <button className="prescriptive-btn-primary" onClick={handleConfirmIgnore}>Confirmar e Ignorar</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REGISTRAR DESFECHO / OUTCOME (Item 60 a 63)              */}
      {/* ============================================================== */}
      {completeModalItem && (
        <div className="prescriptive-modal-backdrop" onClick={() => setCompleteModalItem(null)}>
          <div className="prescriptive-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#FFF', margin: '0 0 8px 0', fontSize: '18px' }}>Registrar Desfecho da Ação</h3>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 16px 0' }}>
              Qual foi o resultado do contato ou iniciativa com a {completeModalItem.organization}?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {Object.values(OutcomeType).map(outcome => (
                <label key={outcome} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#CBD5E1', cursor: 'pointer', background: 'rgba(30, 41, 59, 0.5)', padding: '10px', borderRadius: '8px' }}>
                  <input 
                    type="radio" 
                    name="completeOutcome" 
                    value={outcome} 
                    checked={completeOutcome === outcome} 
                    onChange={(e) => setCompleteOutcome(e.target.value)} 
                  />
                  <span>{outcome}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>Observações do contato / Próximos passos:</label>
              <textarea
                rows={3}
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Ex: Reunião agendada com Eng. Beatriz para quinta-feira às 14h..."
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  color: '#FFF',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="prescriptive-btn-secondary" onClick={() => setCompleteModalItem(null)}>Cancelar</button>
              <button className="prescriptive-btn-primary" onClick={handleConfirmComplete}>Concluir Ação</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: BRIEFING PRÉ-REUNIÃO AUTOMÁTICO (Item 65 a 68)          */}
      {/* ============================================================== */}
      {meetingBriefModalOrg && meetingBriefData && (
        <div className="prescriptive-modal-backdrop" onClick={() => setMeetingBriefModalOrg(null)}>
          <div className="prescriptive-modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="prescriptive-badge-core">BRIEFING PRÉ-REUNIÃO AUTOMÁTICO</span>
                <h3 style={{ margin: '8px 0 2px 0', color: '#FFF', fontSize: '20px' }}>
                  {meetingBriefData.organization}
                </h3>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>{meetingBriefData.type} • {meetingBriefData.state}</span>
              </div>
              <button onClick={() => setMeetingBriefModalOrg(null)} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '20px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ background: 'rgba(0, 229, 201, 0.08)', border: '1px solid rgba(0, 229, 201, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#E2E8F0' }}>
              <strong style={{ color: '#00E5C9' }}>Objetivo Estratégico:</strong> {meetingBriefData.objective}
            </div>

            <h4 style={{ color: '#FFF', fontSize: '14px', margin: '0 0 6px 0' }}>Interlocutores e Papéis:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {meetingBriefData.keyStakeholders.map((s, idx) => (
                <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#CBD5E1', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{s.name}</strong>
                  <span style={{ color: '#00E5C9' }}>{s.role}</span>
                </div>
              ))}
            </div>

            <h4 style={{ color: '#FFF', fontSize: '14px', margin: '0 0 6px 0' }}>Contratos Vigentes & Histórico:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              {meetingBriefData.activeContracts.map((c, idx) => (
                <div key={idx} style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#CBD5E1', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Contrato #{c.number} — {c.service}</span>
                  <span style={{ color: '#F59E0B' }}>Vence em {c.expiryDate}</span>
                </div>
              ))}
            </div>

            <h4 style={{ color: '#FFF', fontSize: '14px', margin: '0 0 6px 0' }}>Pontos de Abordagem Recomendados:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              {meetingBriefData.suggestedTalkingPoints.map((tp, idx) => (
                <div key={idx} style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowRight size={13} color="#00E5C9" />
                  <span>{tp}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="prescriptive-btn-secondary" onClick={() => setMeetingBriefModalOrg(null)}>Fechar Briefing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
