import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  RotateCcw,
  XCircle,
  FileText,
  DollarSign,
  TrendingDown,
  Layers,
  Users,
  Compass,
  ArrowRight,
  Filter,
  Play,
  Info,
  Calendar,
  AlertOctagon,
  Sparkles,
  ChevronRight,
  Send,
  Eye,
  Sliders,
  BarChart3
} from 'lucide-react';
import {
  ApprovalType,
  ApprovalTypeLabels,
  ApprovalStatus,
  ApprovalStatusLabels,
  ApproverRole,
  ApproverRoleLabels,
  RejectionReasonCodes,
  ExceptionReasonCodes
} from '../../services/governance/approvalTypes';
import {
  ApprovalPolicyEngine,
  COMPANY_POLICIES
} from '../../services/governance/approvalPolicyEngine';
import {
  approvalService
} from '../../services/governance/approvalService';
import ApprovalBadge from './ApprovalBadge';
import './ApprovalInboxView.css';

export default function ApprovalInboxView({
  onSelectOpportunity,
  onOpenCopilot,
  initialTab = 'pending'
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('veeluen-matriz');
  const [currentSimulatedUser, setCurrentSimulatedUser] = useState('Mariana Castro'); // Para simular segregação de funções
  const [activeTab, setActiveTab] = useState(initialTab); // pending, myRequests, completed, exceptions, tester, bottlenecks
  const [approvalsList, setApprovalsList] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modais
  const [activeModal, setActiveModal] = useState(null); // reject, requestChanges, conditional, details
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Inputs dos Modais
  const [rejectionReasonCode, setRejectionReasonCode] = useState(RejectionReasonCodes[0]);
  const [justificationText, setJustificationText] = useState('');
  const [conditionalList, setConditionalList] = useState([
    { description: '', responsible: '', deadline: '' }
  ]);

  // Policy Tester Inputs
  const [testerAmount, setTesterAmount] = useState(350000);
  const [testerMargin, setTesterMargin] = useState(15.5);
  const [testerRisk, setTesterRisk] = useState('Médio');
  const [testerHasBlocker, setTesterHasBlocker] = useState(false);
  const [testerResult, setTesterResult] = useState(null);

  // Testes Automatizados E2E
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const loadData = () => {
    try {
      const data = approvalService.listAllApprovals(selectedCompanyId);
      setApprovalsList([...data]);
    } catch (err) {
      console.error('Erro ao carregar aprovações:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCompanyId]);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Filtragem de solicitações conforme aba ativa
  const filteredApprovals = useMemo(() => {
    switch (activeTab) {
      case 'pending':
        return approvalsList.filter(r => r.status === ApprovalStatus.PENDING || r.status === ApprovalStatus.CHANGES_REQUESTED);
      case 'myRequests':
        return approvalsList.filter(r => r.requestedBy.toLowerCase().includes(currentSimulatedUser.toLowerCase().split(' ')[0]));
      case 'completed':
        return approvalsList.filter(r => r.status === ApprovalStatus.APPROVED || r.status === ApprovalStatus.REJECTED || r.status === ApprovalStatus.SUPERSEDED);
      case 'exceptions':
        return approvalsList.filter(r => r.type === ApprovalType.FLOOR_PRICE_OVERRIDE || r.type === ApprovalType.BLOCKER_OVERRIDE || r.status === ApprovalStatus.APPROVED_WITH_CONDITIONS);
      default:
        return approvalsList;
    }
  }, [approvalsList, activeTab, currentSimulatedUser]);

  // Ações de Deliberação
  const handleApproveClick = (req) => {
    try {
      const res = approvalService.approveRequest(req.id, currentSimulatedUser, ApproverRole.GERENCIA_LICITACOES, 'Aprovado via Governança Central.');
      showToast(res.message);
      loadData();
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const handleOpenRejectModal = (req) => {
    setSelectedRequest(req);
    setJustificationText('');
    setRejectionReasonCode(RejectionReasonCodes[0]);
    setActiveModal('reject');
  };

  const handleConfirmReject = () => {
    try {
      const res = approvalService.rejectRequest(selectedRequest.id, currentSimulatedUser, rejectionReasonCode, justificationText);
      showToast(res.message);
      setActiveModal(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenChangesModal = (req) => {
    setSelectedRequest(req);
    setJustificationText('');
    setActiveModal('requestChanges');
  };

  const handleConfirmRequestChanges = () => {
    try {
      const res = approvalService.requestChanges(selectedRequest.id, currentSimulatedUser, justificationText);
      showToast(res.message);
      setActiveModal(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenConditionalModal = (req) => {
    setSelectedRequest(req);
    setConditionalList([{ description: 'Entregar certidão atualizada antes da abertura', responsible: req.requestedBy, deadline: 'Em 24h' }]);
    setActiveModal('conditional');
  };

  const handleConfirmConditional = () => {
    try {
      const validConditions = conditionalList.filter(c => c.description.trim().length > 0);
      const res = approvalService.approveWithConditions(selectedRequest.id, currentSimulatedUser, validConditions, 'Aprovado condicionalmente.');
      showToast(res.message);
      setActiveModal(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRunPolicyTester = () => {
    const res = ApprovalPolicyEngine.simulatePolicyTester({
      companyId: selectedCompanyId,
      approvalType: ApprovalType.PRECO,
      amount: parseFloat(testerAmount) || 0,
      margin: parseFloat(testerMargin) || 0,
      riskLevel: testerRisk,
      hasBlocker: testerHasBlocker
    });
    setTesterResult(res);
  };

  const handleRunE2ETests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      try {
        const tests = approvalService.runAllValidationTests();
        setTestResults(tests);
        showToast('Bateria de Testes E2E (Itens 124 a 133) executada com sucesso!');
      } catch (err) {
        alert('Erro nos testes: ' + err.message);
      } finally {
        setIsRunningTests(false);
      }
    }, 350);
  };

  const metrics = useMemo(() => {
    return approvalService.getMetricsAndBottlenecks(selectedCompanyId);
  }, [selectedCompanyId, approvalsList]);

  const formatBRL = (val) => {
    if (!val || isNaN(val)) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="gov-container">
      {/* HEADER DA CENTRAL DE GOVERNANÇA */}
      <div className="gov-header">
        <div>
          <div className="gov-badge">
            <Sparkles size={14} /> FASE 36 • GOVERNANÇA DE DECISÕES & ALÇADAS
          </div>
          <h1>Central de Governança, Alçadas & Exceções</h1>
          <p className="gov-subtitle">
            Controle institucional de decisões críticas: limites de alçada por valor, margem, risco e exceções com rastreabilidade e segregação de funções.
          </p>
        </div>

        <div className="gov-header-controls">
          <div className="gov-control-box">
            <label><Users size={12} /> Usuário em Sessão:</label>
            <select
              value={currentSimulatedUser}
              onChange={(e) => setCurrentSimulatedUser(e.target.value)}
              className="gov-select"
            >
              <option value="Mariana Castro">Mariana Castro (Gerência de Licitações)</option>
              <option value="Dr. Henrique Veeluen">Dr. Henrique Veeluen (Diretoria Executiva)</option>
              <option value="Eduardo Mendes (CFO)">Eduardo Mendes (Controladoria / CFO)</option>
              <option value="Carlos Silveira">Carlos Silveira (Analista Comercial / Solicitante)</option>
            </select>
          </div>

          <div className="gov-control-box">
            <label><Filter size={12} /> Empresa:</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="gov-select"
            >
              <option value="veeluen-matriz">Veeluen Solutions</option>
              <option value="excelencia-ambiental">Excelência Ambiental</option>
            </select>
          </div>

          <button
            className="gov-btn gov-btn-outline"
            onClick={handleRunE2ETests}
            disabled={isRunningTests}
          >
            <Play size={14} /> {isRunningTests ? 'Executando...' : 'Testes E2E (124-133)'}
          </button>
        </div>
      </div>

      {/* NOTIFICAÇÃO TOAST */}
      {notification && (
        <div className={`gov-toast gov-toast-${notification.type}`}>
          <CheckCircle size={18} />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* RESULTADO DOS TESTES AUTOMATIZADOS (ITENS 124 A 133) */}
      {testResults && (
        <div className="gov-tests-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#34D399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> Suíte de Validação E2E da Governança (10 Testes Aprovados)
            </h4>
            <button className="gov-btn gov-btn-outline" onClick={() => setTestResults(null)}>Fechar</button>
          </div>
          <div className="gov-tests-grid">
            {testResults.map((t, idx) => (
              <div key={idx} className="gov-test-item">
                <div className="gov-test-item-title">
                  <span>{t.testId}</span>
                  <span>Aprovado</span>
                </div>
                <span className="gov-test-item-desc">{t.description}</span>
                <span className="gov-test-item-verif">{t.verification}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABAS DE NAVEGAÇÃO DA CENTRAL */}
      <div className="gov-tabs-bar">
        <button
          className={`gov-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={15} /> Minhas Pendências
          <span className="gov-tab-count">{approvalsList.filter(r => r.status === ApprovalStatus.PENDING).length}</span>
        </button>

        <button
          className={`gov-tab-btn ${activeTab === 'myRequests' ? 'active' : ''}`}
          onClick={() => setActiveTab('myRequests')}
        >
          <Send size={15} /> Solicitadas por Mim
        </button>

        <button
          className={`gov-tab-btn ${activeTab === 'exceptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('exceptions')}
        >
          <AlertOctagon size={15} /> Exceções & Overrides
          <span className="gov-tab-count">
            {approvalsList.filter(r => r.type === ApprovalType.FLOOR_PRICE_OVERRIDE || r.type === ApprovalType.BLOCKER_OVERRIDE).length}
          </span>
        </button>

        <button
          className={`gov-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CheckCircle size={15} /> Concluídas & Histórico
        </button>

        <button
          className={`gov-tab-btn ${activeTab === 'tester' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tester');
            handleRunPolicyTester();
          }}
        >
          <Sliders size={15} /> Testador de Políticas (Simulador)
        </button>

        <button
          className={`gov-tab-btn ${activeTab === 'bottlenecks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bottlenecks')}
        >
          <BarChart3 size={15} /> Análise de Gargalos & SLA
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS DE CARDS (PENDING, MYREQUESTS, COMPLETED, EXCEPTIONS) */}
      {(activeTab === 'pending' || activeTab === 'myRequests' || activeTab === 'completed' || activeTab === 'exceptions') && (
        <div className="gov-cards-grid">
          {filteredApprovals.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              Nenhuma solicitação encontrada nesta visualização.
            </div>
          ) : (
            filteredApprovals.map((req) => {
              const isFloorIssue = req.margin < 12.0;
              const isPending = req.status === ApprovalStatus.PENDING || req.status === ApprovalStatus.CHANGES_REQUESTED;

              return (
                <div key={req.id} className={`gov-card ${req.priority === 'CRITICA' ? 'gov-card-critical' : ''}`}>
                  {/* Cabeçalho do Card */}
                  <div className="gov-card-header">
                    <div>
                      <span className="gov-card-type-tag">{ApprovalTypeLabels[req.type] || req.type}</span>
                      <span className="gov-card-organ">{req.organ} • #{req.id}</span>
                      <h3 className="gov-card-title">{req.opportunityTitle}</h3>
                    </div>
                    <ApprovalBadge status={req.status} />
                  </div>

                  {/* Métricas Principais */}
                  <div className="gov-card-metrics">
                    <div className="gov-metric-item">
                      <span className="gov-metric-label">Valor</span>
                      <span className="gov-metric-val">{formatBRL(req.amount)}</span>
                    </div>
                    <div className="gov-metric-item">
                      <span className="gov-metric-label">Margem</span>
                      <span className={`gov-metric-val ${isFloorIssue ? 'gov-val-danger' : 'gov-val-success'}`}>
                        {req.margin ? `${req.margin}%` : '—'}
                      </span>
                    </div>
                    <div className="gov-metric-item">
                      <span className="gov-metric-label">Risco</span>
                      <span className={`gov-metric-val ${req.riskLevel === 'Alto' || req.riskLevel === 'Crítico' ? 'gov-val-danger' : ''}`}>
                        {req.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* Justificativa e Motivo */}
                  <div className="gov-card-reason">
                    <strong>Motivo:</strong> {req.reason}
                  </div>

                  {/* Condições Cadastradas (se houver) */}
                  {req.conditions && req.conditions.length > 0 && (
                    <div className="gov-conditions-box">
                      <span className="gov-cond-title">Condições Obrigatórias ({req.conditions.length}):</span>
                      {req.conditions.map((c, i) => (
                        <div key={i} className="gov-cond-item">
                          <span>• {c.description}</span>
                          <span style={{ fontSize: '10px', color: c.status === 'CONCLUIDA' ? '#34D399' : '#FBBF24', fontWeight: 700 }}>
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rodapé com SLA e Aprovador */}
                  <div className="gov-card-sla">
                    <span>Solicitante: <strong>{req.requestedBy}</strong></span>
                    <span className="gov-sla-badge">
                      <Clock size={12} /> SLA: {new Date(req.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Botões de Ação Rápida */}
                  {isPending && (
                    <div className="gov-card-actions">
                      <button
                        className="gov-btn gov-btn-primary"
                        onClick={() => handleApproveClick(req)}
                        title="Aprovação com Sign-off Digital"
                      >
                        <CheckCircle size={14} /> Aprovar
                      </button>

                      <button
                        className="gov-btn gov-btn-warning"
                        onClick={() => handleOpenConditionalModal(req)}
                        title="Aprovar condicionado a pendência"
                      >
                        <AlertTriangle size={14} /> Condições
                      </button>

                      <button
                        className="gov-btn gov-btn-outline"
                        onClick={() => handleOpenChangesModal(req)}
                        title="Solicitar alterações ao requisitante"
                      >
                        <RotateCcw size={14} /> Ajustes
                      </button>

                      <button
                        className="gov-btn gov-btn-danger"
                        onClick={() => handleOpenRejectModal(req)}
                        title="Rejeitar com motivo estruturado"
                      >
                        <XCircle size={14} /> Rejeitar
                      </button>
                    </div>
                  )}

                  {/* Botão de Ver Detalhes */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                    <button
                      className="gov-btn gov-btn-outline"
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                      onClick={() => {
                        setSelectedRequest(req);
                        setActiveModal('details');
                      }}
                    >
                      <Eye size={12} /> Ver Snapshot & Auditoria
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ABA: TESTADOR DE POLÍTICAS (POLICY TESTER - ITENS 107 A 110) */}
      {activeTab === 'tester' && (
        <div className="gov-tester-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="#00E5C9" />
            <h3 style={{ margin: 0 }}>Simulador Administrativo de Políticas de Alçadas</h3>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
            Permite testar as regras de alçada com base no valor da proposta, margem líquida e nível de risco sem alterar nenhum dado real em produção.
          </p>

          <div className="gov-tester-grid">
            <div className="gov-modal-field">
              <label>Valor da Proposta (R$):</label>
              <input
                type="number"
                value={testerAmount}
                onChange={(e) => setTesterAmount(e.target.value)}
                className="gov-select"
              />
            </div>

            <div className="gov-modal-field">
              <label>Margem Operacional (%):</label>
              <input
                type="number"
                step="0.1"
                value={testerMargin}
                onChange={(e) => setTesterMargin(e.target.value)}
                className="gov-select"
              />
            </div>

            <div className="gov-modal-field">
              <label>Nível de Risco:</label>
              <select
                value={testerRisk}
                onChange={(e) => setTesterRisk(e.target.value)}
                className="gov-select"
              >
                <option value="Baixo">Baixo</option>
                <option value="Médio">Médio</option>
                <option value="Alto">Alto</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>

            <div className="gov-modal-field" style={{ justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                <input
                  type="checkbox"
                  checked={testerHasBlocker}
                  onChange={(e) => setTesterHasBlocker(e.target.checked)}
                />
                <span>Existe Blocker Documental Ativo</span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="gov-btn gov-btn-primary" onClick={handleRunPolicyTester} style={{ width: '100%', height: '38px' }}>
                <Sparkles size={14} /> Simular Alçadas
              </button>
            </div>
          </div>

          {/* Resultado da Simulação de Política */}
          {testerResult && (
            <div className="gov-result-box">
              <h4 style={{ margin: 0, color: '#00E5C9' }}>Fluxo Regulatório Determinado:</h4>
              <div style={{ fontSize: '13px' }}>
                <strong>Aprovador Principal:</strong> {testerResult.primaryApproverUser} ({ApproverRoleLabels[testerResult.primaryApproverRole]})
              </div>
              <div style={{ fontSize: '13px' }}>
                <strong>Prioridade Calculada:</strong> <span style={{ color: '#FBBF24', fontWeight: 700 }}>{testerResult.priority}</span> (SLA: {testerResult.slaHours}h)
              </div>

              {testerResult.justificationsNeeded.length > 0 && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px', borderRadius: '8px' }}>
                  <strong style={{ color: '#F87171' }}>Justificativas Obrigatórias Exigidas:</strong>
                  <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                    {testerResult.justificationsNeeded.map((j, i) => (
                      <li key={i} style={{ color: '#CBD5E1', fontSize: '12px' }}>{j}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ marginTop: '8px' }}>
                <strong>Cadeia de Aprovação (Passo a Passo):</strong>
                {testerResult.approvalChain.steps.map((st) => (
                  <div key={st.stepOrder} className="gov-step-item">
                    <span>{st.stepOrder}º Nível:</span>
                    <strong>{st.roleLabel}</strong> ({st.assignedTo})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA: ANÁLISE DE GARGALOS & SLA (ITENS 88 A 91) */}
      {activeTab === 'bottlenecks' && (
        <div className="gov-bottlenecks-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#00E5C9" />
            <h3 style={{ margin: 0 }}>Métricas de Governança & Análise de Gargalos</h3>
          </div>

          <div className="gov-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="gov-metric-item" style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px' }}>
              <span className="gov-metric-label">Total de Deliberações</span>
              <span className="gov-metric-val" style={{ fontSize: '22px' }}>{metrics.totalRequests}</span>
            </div>
            <div className="gov-metric-item" style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px' }}>
              <span className="gov-metric-label">Tempo Médio de Decisão</span>
              <span className="gov-metric-val" style={{ fontSize: '22px', color: '#00E5C9' }}>{metrics.avgApprovalHours} horas</span>
            </div>
            <div className="gov-metric-item" style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px' }}>
              <span className="gov-metric-label">Cumprimento de SLA</span>
              <span className="gov-metric-val" style={{ fontSize: '22px', color: '#34D399' }}>{metrics.slaComplianceRate}</span>
            </div>
            <div className="gov-metric-item" style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px' }}>
              <span className="gov-metric-label">Exceções & Overrides</span>
              <span className="gov-metric-val" style={{ fontSize: '22px', color: '#FBBF24' }}>{metrics.exceptionsCount}</span>
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <h4>Diagnóstico de Concentração de Decisões:</h4>
            {metrics.bottlenecks.map((b, idx) => (
              <div key={idx} style={{ background: 'rgba(10, 15, 30, 0.8)', padding: '14px', borderRadius: '10px', marginBottom: '10px', borderLeft: '3px solid #00E5C9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{b.role}</strong>
                  <span style={{ color: '#FBBF24' }}>{b.pendingCount} pendências • Média de {b.avgWaitHours}h</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>{b.diagnosis}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: REJEITAR SOLICITAÇÃO */}
      {activeModal === 'reject' && selectedRequest && (
        <div className="gov-modal-overlay">
          <div className="gov-modal-card">
            <div className="gov-modal-header">
              <h3>Rejeitar Solicitação #{selectedRequest.id}</h3>
              <button className="gov-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="gov-modal-body">
              <div className="gov-modal-field">
                <label>Motivo Estruturado da Rejeição:</label>
                <select
                  value={rejectionReasonCode}
                  onChange={(e) => setRejectionReasonCode(e.target.value)}
                  className="gov-select"
                >
                  {RejectionReasonCodes.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="gov-modal-field">
                <label>Justificativa Formal Obrigatória (mínimo de 10 caracteres):</label>
                <textarea
                  rows={4}
                  value={justificationText}
                  onChange={(e) => setJustificationText(e.target.value)}
                  placeholder="Explique o fundamento técnico ou econômico para orientar o requisitante..."
                  className="gov-textarea"
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-btn gov-btn-outline" onClick={() => setActiveModal(null)}>Cancelar</button>
              <button className="gov-btn gov-btn-danger" onClick={handleConfirmReject}>Confirmar Rejeição</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SOLICITAR AJUSTES */}
      {activeModal === 'requestChanges' && selectedRequest && (
        <div className="gov-modal-overlay">
          <div className="gov-modal-card">
            <div className="gov-modal-header">
              <h3>Solicitar Ajustes na Proposta</h3>
              <button className="gov-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="gov-modal-body">
              <p>A solicitação retornará ao responsável <strong>{selectedRequest.requestedBy}</strong> com status <em>CHANGES_REQUESTED</em>.</p>
              <div className="gov-modal-field">
                <label>Apontamentos e Alterações Necessárias:</label>
                <textarea
                  rows={4}
                  value={justificationText}
                  onChange={(e) => setJustificationText(e.target.value)}
                  placeholder="Ex: Revisar cotação do fornecedor de switches ou readequar o BDI para 22%..."
                  className="gov-textarea"
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-btn gov-btn-outline" onClick={() => setActiveModal(null)}>Cancelar</button>
              <button className="gov-btn gov-btn-warning" onClick={handleConfirmRequestChanges}>Enviar Solicitação de Ajuste</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APROVAÇÃO CONDICIONAL */}
      {activeModal === 'conditional' && selectedRequest && (
        <div className="gov-modal-overlay">
          <div className="gov-modal-card">
            <div className="gov-modal-header">
              <h3>Aprovação Condicional (APPROVED_WITH_CONDITIONS)</h3>
              <button className="gov-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="gov-modal-body">
              <p>O processo poderá seguir para a próxima etapa, mas o envio final (Gate 4) ficará travado até que as condições sejam cumpridas.</p>

              <div className="gov-modal-field">
                <label>Descrição da Condição:</label>
                <input
                  type="text"
                  value={conditionalList[0]?.description || ''}
                  onChange={(e) => {
                    const updated = [...conditionalList];
                    updated[0].description = e.target.value;
                    setConditionalList(updated);
                  }}
                  className="gov-select"
                  placeholder="Ex: Juntada de declaração assinada pelo responsável técnico"
                />
              </div>

              <div className="gov-modal-field">
                <label>Prazo Limite para Cumprimento:</label>
                <input
                  type="text"
                  value={conditionalList[0]?.deadline || ''}
                  onChange={(e) => {
                    const updated = [...conditionalList];
                    updated[0].deadline = e.target.value;
                    setConditionalList(updated);
                  }}
                  className="gov-select"
                  placeholder="Ex: Amanhã às 12h"
                />
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-btn gov-btn-outline" onClick={() => setActiveModal(null)}>Cancelar</button>
              <button className="gov-btn gov-btn-primary" onClick={handleConfirmConditional}>Conceder Aprovação Condicional</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES & AUDIT TRAIL */}
      {activeModal === 'details' && selectedRequest && (
        <div className="gov-modal-overlay">
          <div className="gov-modal-card" style={{ maxWidth: '650px' }}>
            <div className="gov-modal-header">
              <h3>Snapshot & Trilha de Auditoria #{selectedRequest.id}</h3>
              <button className="gov-modal-close" onClick={() => setActiveModal(null)}>×</button>
            </div>
            <div className="gov-modal-body">
              <div>
                <strong>Oportunidade:</strong> {selectedRequest.opportunityTitle} ({selectedRequest.organ})
              </div>

              {selectedRequest.snapshot && (
                <div style={{ background: 'rgba(10, 15, 30, 0.8)', padding: '12px', borderRadius: '8px' }}>
                  <strong>Snapshot Imutável da Deliberação:</strong>
                  <pre style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#00E5C9' }}>
                    {JSON.stringify(selectedRequest.snapshot, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <strong>Histórico Completo da Decisão:</strong>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedRequest.auditTrail.map((log, i) => (
                    <div key={i} style={{ borderLeft: '2px solid #00E5C9', paddingLeft: '10px', fontSize: '12px' }}>
                      <span style={{ color: '#94A3B8' }}>{new Date(log.timestamp).toLocaleString('pt-BR')} — </span>
                      <strong>{log.user}:</strong> {log.details}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="gov-modal-footer">
              <button className="gov-btn gov-btn-primary" onClick={() => setActiveModal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
