// ==============================================================================
// FASE 44: EXECUTION READINESS VIEW COMPONENT - VELLIA LICITAÇÕES
// Visão de Capacidade Operacional, Prontidão para Execução e Resource Fit
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Users,
  Wrench,
  Award,
  Calendar,
  Handshake,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Play,
  Layers,
  FileCheck2,
  Filter,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import executionReadinessService, {
  READINESS_STATUS,
  GAP_STATUS,
  GAP_SEVERITY
} from '../../services/readiness/executionReadinessService';
import './ExecutionReadinessView.css';

export default function ExecutionReadinessView() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, resources, gaps, whatif, tests
  const [selectedCompanyId, setSelectedCompanyId] = useState('emp-veeluen');
  const [selectedOppId, setSelectedOppId] = useState('opp-sabesp-ete');
  const [assessment, setAssessment] = useState(null);
  const [revalidationResult, setRevalidationResult] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [testingRunning, setTestingRunning] = useState(false);
  const [whatIfSelectedOpps, setWhatIfSelectedOpps] = useState(['opp-sabesp-ete', 'opp-braskem-emissao']);
  const [whatIfResult, setWhatIfResult] = useState(null);
  const [gapsList, setGapsList] = useState([]);

  // Lista de oportunidades mock para seleção
  const mockOpportunities = [
    { id: 'opp-sabesp-ete', title: 'Operação e Monitoramento ETE Sabesp', client: 'Sabesp - SP', serviceId: 'srv-ete-operacao', value: 1450000, companyId: 'emp-veeluen', startDate: '2026-11-01', endDate: '2027-10-31' },
    { id: 'opp-braskem-emissao', title: 'Amostragem Isocinética de Emissões Atmosféricas', client: 'Braskem Polo ABC', serviceId: 'srv-emissao-atmosferica', value: 890000, companyId: 'emp-veeluen', startDate: '2026-11-15', endDate: '2027-05-15' },
    { id: 'opp-petrobras-nr13', title: 'Inspeção Integrada NR-13 Vasos e Caldeiras', client: 'Petrobras RPBC', serviceId: 'srv-nr13-inspecao', value: 2100000, companyId: 'emp-excelencia', startDate: '2026-12-01', endDate: '2027-11-30' },
    { id: 'opp-vale-residuos', title: 'Gestão de Resíduos Sólidos e Efluentes', client: 'Vale S/A - Vitória', serviceId: 'srv-residuos-efluentes', value: 3400000, companyId: 'emp-veeluen', startDate: '2027-01-10', endDate: '2028-01-09' }
  ];

  // Carrega assessment da oportunidade selecionada
  useEffect(() => {
    loadAssessment();
  }, [selectedOppId, selectedCompanyId]);

  const loadAssessment = () => {
    const opp = mockOpportunities.find(o => o.id === selectedOppId);
    if (!opp) return;

    const res = executionReadinessService.evaluateOpportunityReadiness(opp, {
      companyId: selectedCompanyId,
      trigger: 'Manual Assessment'
    });
    setAssessment(res);
    setGapsList(executionReadinessService.listOperationalGaps(opp.id));
  };

  const handleRevalidate = () => {
    const opp = mockOpportunities.find(o => o.id === selectedOppId);
    if (!opp) return;
    const rev = executionReadinessService.revalidatePreContractReadiness(opp.id, {
      awardDate: new Date().toISOString()
    });
    setRevalidationResult(rev);
    loadAssessment();
  };

  const handleRunWhatIf = () => {
    const res = executionReadinessService.simulateWhatIfCapacity(whatIfSelectedOpps, {
      targetPeriod: { start: '2026-11-01', end: '2027-05-01' }
    });
    setWhatIfResult(res);
  };

  const handleRunTests = () => {
    setTestingRunning(true);
    setTimeout(() => {
      const results = executionReadinessService.runGoldenReadinessTestSet();
      setTestResults(results);
      setTestingRunning(false);
    }, 400);
  };

  const handleResolveGap = (gapId, mitigationText) => {
    executionReadinessService.resolveOperationalGap(gapId, {
      action: 'Resolved',
      mitigationPlan: mitigationText || 'Plano de mitigação operacional executado e validado.',
      status: GAP_STATUS.RESOLVED
    });
    loadAssessment();
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case READINESS_STATUS.PRONTO:
        return <span className="status-badge-lg badge-pronto"><CheckCircle2 size={16} /> PRONTO</span>;
      case READINESS_STATUS.PRONTO_COM_PENDENCIAS:
        return <span className="status-badge-lg badge-pronto-pend"><Clock size={16} /> PRONTO COM PENDÊNCIAS</span>;
      case READINESS_STATUS.ATENCAO:
        return <span className="status-badge-lg badge-atencao"><AlertTriangle size={16} /> ATENÇÃO OPERACIONAL</span>;
      case READINESS_STATUS.NAO_CONFIRMADO:
      default:
        return <span className="status-badge-lg badge-nao-conf"><ShieldAlert size={16} /> NÃO CONFIRMADO</span>;
    }
  };

  return (
    <div className="readiness-container">
      {/* Top Header */}
      <div className="readiness-header">
        <div>
          <div className="readiness-title-badge">
            <Users size={14} /> FASE 44 • RESOURCE FIT & PRONTIDÃO OPERACIONAL
          </div>
          <h1>Prontidão para Execução & Capacidade</h1>
          <p className="readiness-subtitle">
            Avalie se a empresa tem capacidade operacional real (equipe, equipamentos, calibrações, agenda e parceiros) para entregar o contrato caso vença a oportunidade.
          </p>
        </div>

        <div className="readiness-header-actions">
          <div className="company-selector-readiness">
            <button
              className={`company-btn ${selectedCompanyId === 'emp-veeluen' ? 'active' : ''}`}
              onClick={() => setSelectedCompanyId('emp-veeluen')}
            >
              Veeluen Solutions
            </button>
            <button
              className={`company-btn ${selectedCompanyId === 'emp-excelencia' ? 'active' : ''}`}
              onClick={() => setSelectedCompanyId('emp-excelencia')}
            >
              Excelência Ambiental
            </button>
          </div>

          <button className="btn-secondary-readiness" onClick={loadAssessment}>
            <RefreshCw size={16} /> Atualizar Prontidão
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="readiness-nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={16} /> Prontidão da Oportunidade
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <Wrench size={16} /> Matriz Operacional (Equipe & Ativos)
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'gaps' ? 'active' : ''}`}
          onClick={() => setActiveTab('gaps')}
        >
          <AlertTriangle size={16} /> Gaps Operacionais
          {assessment?.gaps?.length > 0 && (
            <span className="tab-badge">{assessment.gaps.length}</span>
          )}
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'whatif' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('whatif');
            handleRunWhatIf();
          }}
        >
          <Calendar size={16} /> Simulação What-If (Múltiplas Vitórias)
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tests');
            if (!testResults) handleRunTests();
          }}
        >
          <FileCheck2 size={16} /> Suíte Golden Set (11 Testes)
        </button>
      </div>

      {/* Selector de Oportunidade */}
      {activeTab === 'overview' && (
        <div className="readiness-opp-selector-box">
          <div className="opp-select-wrapper">
            <span className="opp-select-label">Oportunidade Alvo:</span>
            <select
              className="opp-dropdown"
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
            >
              {mockOpportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} — {opp.client} (R$ {(opp.value / 1000).toLocaleString('pt-BR')}k)
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Serviço: <strong>{assessment?.requirements?.serviceName || 'Catálogo Vellia'}</strong>
            </span>
          </div>

          <button className="btn-primary-readiness" onClick={handleRevalidate}>
            <CheckSquare size={16} /> Revalidar Pré-Contrato
          </button>
        </div>
      )}

      {/* ABA 1: OVERVIEW */}
      {activeTab === 'overview' && assessment && (
        <div>
          {/* Banner Status */}
          <div className={`readiness-status-banner status-${assessment.status.toLowerCase().replace(/_/g, '-')}`}>
            <div>
              {renderStatusBadge(assessment.status)}
              <h2 style={{ margin: '8px 0 4px 0', fontSize: '1.25rem', color: '#fff' }}>
                {assessment.opportunityTitle}
              </h2>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>
                Avaliação Versão <strong>v{assessment.version}</strong> • Gerado em: {new Date(assessment.generatedAt).toLocaleString('pt-BR')}
                {assessment.isStale && <span style={{ color: '#ef4444', marginLeft: 8, fontWeight: 700 }}>[STALE - DADOS ALTERADOS]</span>}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Fit Operacional Global</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: assessment.overallScore >= 80 ? '#34d399' : assessment.overallScore >= 60 ? '#fbbf24' : '#f87171' }}>
                {assessment.overallScore}%
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                {assessment.gaps.filter(g => g.severity === 'BLOCKER').length} Blockers • {assessment.gaps.length} Gaps
              </div>
            </div>
          </div>

          {/* GAP FIRST: Se houver problemas, exibir imediatamente no topo */}
          {assessment.gaps.length > 0 && (
            <div className="gaps-priority-box">
              <div className="gaps-box-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontWeight: 700 }}>
                  <AlertTriangle size={18} /> GAPS OPERACIONAIS IDENTIFICADOS (RESOLVA ANTES DO GO/NO-GO OU CONTRATO)
                </div>
                <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Prioridade máxima para decisão</span>
              </div>

              {assessment.gaps.map(gap => (
                <div key={gap.id} className={`gap-item-card ${gap.severity.toLowerCase()}`}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="gap-type-badge">{gap.category}</span>
                      <strong style={{ color: '#fff' }}>{gap.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: gap.severity === 'BLOCKER' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                        [{gap.severity}]
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>{gap.description}</p>
                    <div style={{ marginTop: 6, display: 'flex', gap: 12, fontSize: '0.8rem' }}>
                      <span style={{ color: '#cbd5e1' }}>Responsável: <strong>{gap.owner}</strong></span>
                      <span style={{ color: '#cbd5e1' }}>Prazo limite: <strong>{gap.deadline}</strong></span>
                      <span className="gap-mitigation-tag">Mitigação sugerida: {gap.mitigationPlan}</span>
                    </div>
                  </div>

                  <div>
                    {gap.status !== 'RESOLVED' ? (
                      <button
                        className="btn-secondary-readiness"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        onClick={() => handleResolveGap(gap.id)}
                      >
                        Mitigar Gap
                      </button>
                    ) : (
                      <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8rem' }}>✓ Mitigado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 5 BLOCOS DIMENSIONAIS (Item 177) */}
          <div className="dimensions-grid">
            {/* Bloco 1: Equipe */}
            <div className="dim-card">
              <div className="dim-card-header">
                <div className="dim-title">
                  <Users size={18} color="#38bdf8" /> 1. Equipe
                </div>
                <span className={`dim-badge ${assessment.teamReadiness.status === 'OK' ? 'ok' : 'warn'}`}>
                  {assessment.teamReadiness.status}
                </span>
              </div>
              <div className="dim-metric">{assessment.teamReadiness.assignedMembers.length} / {assessment.requirements?.team?.length || 2}</div>
              <div className="dim-desc">
                {assessment.teamReadiness.details}
              </div>
              <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                {assessment.teamReadiness.assignedMembers.map(m => (
                  <div key={m.memberId} style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span>{m.role}: <strong>{m.name}</strong></span>
                    <span style={{ color: m.allocationStatus === 'LIVRE' ? '#34d399' : '#fbbf24' }}>{m.allocationStatus}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco 2: Equipamentos */}
            <div className="dim-card">
              <div className="dim-card-header">
                <div className="dim-title">
                  <Wrench size={18} color="#38bdf8" /> 2. Equipamentos
                </div>
                <span className={`dim-badge ${assessment.equipmentReadiness.status === 'OK' ? 'ok' : 'warn'}`}>
                  {assessment.equipmentReadiness.status}
                </span>
              </div>
              <div className="dim-metric">{assessment.equipmentReadiness.assignedEquipments.length} Atribuídos</div>
              <div className="dim-desc">
                {assessment.equipmentReadiness.details}
              </div>
              <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                {assessment.equipmentReadiness.assignedEquipments.map(eq => (
                  <div key={eq.equipmentId} style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                    <span>{eq.name}</span>
                    <span style={{ color: eq.calibrationStatus === 'VALID' ? '#34d399' : '#f87171' }}>
                      {eq.calibrationStatus === 'VALID' ? 'Calibração OK' : 'Calibração Vencida'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco 3: Certificações */}
            <div className="dim-card">
              <div className="dim-card-header">
                <div className="dim-title">
                  <Award size={18} color="#38bdf8" /> 3. Certificações
                </div>
                <span className={`dim-badge ${assessment.certificationReadiness.status === 'OK' ? 'ok' : 'warn'}`}>
                  {assessment.certificationReadiness.status}
                </span>
              </div>
              <div className="dim-metric">{assessment.certificationReadiness.validCertifications.length} Válidas</div>
              <div className="dim-desc">
                {assessment.certificationReadiness.details}
              </div>
              {assessment.certificationReadiness.expiringDuringContract.length > 0 && (
                <div style={{ marginTop: 10, background: 'rgba(245, 158, 11, 0.1)', padding: '6px 8px', borderRadius: 4, fontSize: '0.75rem', color: '#fbbf24' }}>
                  ⚠️ {assessment.certificationReadiness.expiringDuringContract.length} expira(m) durante a vigência do contrato.
                </div>
              )}
            </div>

            {/* Bloco 4: Agenda & Conflitos */}
            <div className="dim-card">
              <div className="dim-card-header">
                <div className="dim-title">
                  <Calendar size={18} color="#38bdf8" /> 4. Agenda
                </div>
                <span className={`dim-badge ${assessment.scheduleReadiness.status === 'OK' ? 'ok' : 'alert'}`}>
                  {assessment.scheduleReadiness.status}
                </span>
              </div>
              <div className="dim-metric">{assessment.scheduleReadiness.conflicts.length} Conflitos</div>
              <div className="dim-desc">
                {assessment.scheduleReadiness.details}
              </div>
              {assessment.scheduleReadiness.conflicts.length > 0 && (
                <div style={{ marginTop: 10, background: 'rgba(239, 68, 68, 0.1)', padding: '6px 8px', borderRadius: 4, fontSize: '0.75rem', color: '#f87171' }}>
                  Sobreposição com contrato em execução existente.
                </div>
              )}
            </div>

            {/* Bloco 5: Parceiros */}
            <div className="dim-card">
              <div className="dim-card-header">
                <div className="dim-title">
                  <Handshake size={18} color="#38bdf8" /> 5. Parceiros
                </div>
                <span className={`dim-badge ${assessment.partnerReadiness.status === 'OK' ? 'ok' : 'warn'}`}>
                  {assessment.partnerReadiness.status}
                </span>
              </div>
              <div className="dim-metric">{assessment.partnerReadiness.confirmedPartners.length} Confirmados</div>
              <div className="dim-desc">
                {assessment.partnerReadiness.details}
              </div>
              {assessment.partnerReadiness.pendingPartners.length > 0 && (
                <div style={{ marginTop: 10, background: 'rgba(245, 158, 11, 0.1)', padding: '6px 8px', borderRadius: 4, fontSize: '0.75rem', color: '#fbbf24' }}>
                  Aguardando cotação ou confirmação formal.
                </div>
              )}
            </div>
          </div>

          {/* Resultado de Revalidação Pré-Contratual (se acionado) */}
          {revalidationResult && (
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 12, padding: 20, marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <strong style={{ color: '#38bdf8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCheck2 size={18} /> RELATÓRIO DE REVALIDAÇÃO PRÉ-CONTRATUAL (HANDOFF)
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {revalidationResult.revalidationDate}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#e2e8f0', margin: '0 0 10px 0' }}>
                {revalidationResult.summary}
              </p>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Status Atualizado: <strong>{revalidationResult.assessment.status}</strong> • Blockers Ativos: <strong>{revalidationResult.blockersCount}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 2: MATRIZ OPERACIONAL */}
      {activeTab === 'resources' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Profissionais */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} color="#38bdf8" /> Equipe Técnica Cadastrada ({selectedCompanyId})
              </h3>
              <table className="readiness-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Função</th>
                    <th>Competências / Tags</th>
                    <th>Alocação</th>
                  </tr>
                </thead>
                <tbody>
                  {executionReadinessService.listAvailableTeamMembers(selectedCompanyId).map(tm => (
                    <tr key={tm.id}>
                      <td><strong>{tm.name}</strong></td>
                      <td style={{ color: '#94a3b8' }}>{tm.role}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {tm.competencies.map(c => (
                            <span key={c} style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem' }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: tm.allocationStatus === 'LIVRE' ? '#34d399' : tm.allocationStatus === 'PARCIAL' ? '#fbbf24' : '#f87171', fontWeight: 600 }}>
                          {tm.allocationStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Equipamentos & Calibração RBC */}
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={18} color="#38bdf8" /> Equipamentos Técnicos & Calibrações RBC
              </h3>
              <table className="readiness-table">
                <thead>
                  <tr>
                    <th>Equipamento</th>
                    <th>Tipo</th>
                    <th>Calibração Vigente</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {executionReadinessService.listAvailableEquipments(selectedCompanyId).map(eq => (
                    <tr key={eq.id}>
                      <td><strong>{eq.name}</strong></td>
                      <td style={{ color: '#94a3b8' }}>{eq.type}</td>
                      <td>
                        <span style={{ color: new Date(eq.calibrationValidUntil) > new Date() ? '#34d399' : '#f87171' }}>
                          {eq.calibrationValidUntil}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: eq.status === 'DISPONIVEL' ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                          {eq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: GAPS OPERACIONAIS */}
      {activeTab === 'gaps' && (
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#fff' }}>
            Plano de Mitigação de Gaps Operacionais
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 20 }}>
            Todo gap detectado no Vellia possui categoria, responsável, severidade e plano de mitigação aprovado pela gestão operacional.
          </p>

          <table className="readiness-table">
            <thead>
              <tr>
                <th>Severidade</th>
                <th>Categoria</th>
                <th>Descrição do Gap</th>
                <th>Responsável</th>
                <th>Prazo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {gapsList.map(gap => (
                <tr key={gap.id}>
                  <td>
                    <span style={{
                      color: gap.severity === 'BLOCKER' ? '#ef4444' : gap.severity === 'CRITICAL' ? '#f59e0b' : '#38bdf8',
                      fontWeight: 700
                    }}>
                      {gap.severity}
                    </span>
                  </td>
                  <td><span className="gap-type-badge">{gap.category}</span></td>
                  <td>
                    <strong>{gap.title}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{gap.description}</div>
                  </td>
                  <td style={{ color: '#cbd5e1' }}>{gap.owner}</td>
                  <td style={{ color: '#cbd5e1' }}>{gap.deadline}</td>
                  <td>
                    <span style={{
                      color: gap.status === 'RESOLVED' ? '#34d399' : gap.status === 'IN_PROGRESS' ? '#fbbf24' : '#f87171',
                      fontWeight: 600
                    }}>
                      {gap.status}
                    </span>
                  </td>
                  <td>
                    {gap.status !== 'RESOLVED' && (
                      <button
                        className="btn-secondary-readiness"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => handleResolveGap(gap.id)}
                      >
                        Resolver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ABA 4: SIMULAÇÃO WHAT-IF (MÚLTIPLAS VITÓRIAS) */}
      {activeTab === 'whatif' && (
        <div className="whatif-panel">
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#fff' }}>
            Simulação What-If de Capacidade: "E se ganharmos simultaneamente?"
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 20 }}>
            Selecione oportunidades do pipeline para simular a carga combinada sobre a equipe e equipamentos sem alterar dados reais de produção.
          </p>

          <div className="whatif-selector-list">
            {mockOpportunities.map(opp => {
              const isSelected = whatIfSelectedOpps.includes(opp.id);
              return (
                <div
                  key={opp.id}
                  className={`whatif-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    const next = isSelected
                      ? whatIfSelectedOpps.filter(id => id !== opp.id)
                      : [...whatIfSelectedOpps, opp.id];
                    setWhatIfSelectedOpps(next);
                  }}
                >
                  <input type="checkbox" checked={isSelected} readOnly />
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{opp.title}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{opp.client} • R$ {(opp.value / 1000).toLocaleString('pt-BR')}k</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn-primary-readiness" onClick={handleRunWhatIf}>
            <Play size={16} /> Processar Cenário What-If
          </button>

          {whatIfResult && (
            <div style={{ marginTop: 24, background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h4 style={{ margin: 0, color: '#38bdf8' }}>Diagnóstico de Sobrecarga Combinada</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {whatIfResult.simulatedOpportunitiesCount} oportunidades simuladas • Valor Total em Disputa: R$ {(whatIfResult.totalSimulatedValue / 1000).toLocaleString('pt-BR')}k
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Risco Global de Conflito:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: whatIfResult.globalConflictRisk === 'HIGH' ? '#f87171' : '#34d399' }}>
                    {whatIfResult.globalConflictRisk}
                  </div>
                </div>
              </div>

              {/* Conflitos de Equipe e Ativos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                  <strong style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>Conflitos de Equipe ({whatIfResult.teamConflicts.length})</strong>
                  {whatIfResult.teamConflicts.length === 0 ? (
                    <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: 8 }}>✓ Capacidade de equipe suficiente para absorver os contratos.</p>
                  ) : (
                    whatIfResult.teamConflicts.map((c, i) => (
                      <div key={i} style={{ color: '#f87171', fontSize: '0.8rem', marginTop: 6 }}>
                        ⚠️ {c.message}
                      </div>
                    ))
                  )}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                  <strong style={{ color: '#e2e8f0', fontSize: '0.9rem' }}>Conflitos de Equipamentos ({whatIfResult.equipmentConflicts.length})</strong>
                  {whatIfResult.equipmentConflicts.length === 0 ? (
                    <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: 8 }}>✓ Parque de instrumentos disponível para atendimento simultâneo.</p>
                  ) : (
                    whatIfResult.equipmentConflicts.map((c, i) => (
                      <div key={i} style={{ color: '#fbbf24', fontSize: '0.8rem', marginTop: 6 }}>
                        ⚠️ {c.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 5: SUÍTE GOLDEN SET (11 TESTES) */}
      {activeTab === 'tests' && (
        <div>
          <div className="tests-summary-bar">
            <div>
              <strong style={{ color: '#34d399', fontSize: '1rem' }}>
                Golden Readiness Test Set — Validação Regressiva Fase 44
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                11 testes oficiais cobrindo equipe, NR-33/NR-35, calibrações, conflitos, What-If e isolamento multiempresa.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {testResults && (
                <span className="test-badge-pass">
                  {testResults.passed} / {testResults.total} APROVADOS (100%)
                </span>
              )}
              <button className="btn-secondary-readiness" onClick={handleRunTests} disabled={testingRunning}>
                <RefreshCw size={14} className={testingRunning ? 'animate-spin' : ''} /> Executar Suíte
              </button>
            </div>
          </div>

          {testResults && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
              <table className="readiness-table">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Cenário de Teste</th>
                    <th>Critério Avaliado</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.results.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: '#94a3b8' }}>#{t.id}</td>
                      <td><strong>{t.name}</strong></td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{t.details}</td>
                      <td>
                        <span style={{ color: t.passed ? '#34d399' : '#f87171', fontWeight: 700 }}>
                          {t.passed ? '✓ PASSED' : '✗ FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
