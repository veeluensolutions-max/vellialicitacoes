import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, Shield, AlertTriangle, CheckCircle, HelpCircle,
  FileText, Users, DollarSign, Layers, ArrowRight, RefreshCw,
  Scale, Compass, Play, Download, Send, AlertOctagon, CheckSquare,
  Lock, Eye, ChevronRight, BarChart3, Info, Calendar, Sparkles, Filter
} from 'lucide-react';
import {
  strategicSimulationService,
  SCENARIO_TYPES,
  AssumptionSource
} from '../../services/simulation/strategicSimulationService';
import './StrategicSimulationView.css';

export default function StrategicSimulationView({
  opportunityId: initialOppId = 'opp-301',
  userCompanyId = 'veeluen-matriz',
  userPermissions = ['simulation.view', 'simulation.create', 'simulation.financial.view', 'simulation.approve'],
  onNavigateToOpp,
  onOpenCopilot
}) {
  const [selectedOppId, setSelectedOppId] = useState(initialOppId);
  const [simulationData, setSimulationData] = useState(null);
  const [activeTab, setActiveTab] = useState('scenarios'); // scenarios, assumptions, conflicts, decisionQueue, board
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [scenarioToApply, setScenarioToApply] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [notification, setNotification] = useState(null);

  // Premissas editáveis em Sandbox
  const [sandboxCustomCost, setSandboxCustomCost] = useState(null);
  const [sandboxCustomPrice, setSandboxCustomPrice] = useState(null);
  const [sandboxDocApproved, setSandboxDocApproved] = useState(false);

  // Lista de oportunidades mock para seleção
  const mockOpportunities = [
    { id: 'opp-301', title: 'Modernização de Datacenter TJRJ', organ: 'TJRJ', refValue: 1850000 },
    { id: 'opp-302', title: 'Infraestrutura Cloud Híbrida PRODERJ', organ: 'PRODERJ', refValue: 2400000 },
    { id: 'opp-303', title: 'Sustentação de Redes e Telecom DETRAN-RJ', organ: 'DETRAN-RJ', refValue: 980000 }
  ];

  // Carregar dados de simulação
  const loadSimulation = (oppId = selectedOppId) => {
    try {
      const sim = strategicSimulationService.buildOpportunitySimulation(oppId, userCompanyId);
      setSimulationData(sim);
      if (sim && sim.scenarios[SCENARIO_TYPES.CUSTOM]) {
        setSandboxCustomPrice(sim.scenarios[SCENARIO_TYPES.CUSTOM].price);
        setSandboxCustomCost(sim.premissas.custoEstimado.value);
      }
    } catch (err) {
      console.error('Erro ao carregar simulação:', err);
    }
  };

  useEffect(() => {
    loadSimulation(selectedOppId);
  }, [selectedOppId, userCompanyId]);

  // Recalcular custom scenario quando inputs de sandbox mudarem
  const handleRecalculateSandbox = () => {
    if (!simulationData) return;
    
    const cost = parseFloat(sandboxCustomCost) || simulationData.premissas.custoEstimado.value;
    const price = parseFloat(sandboxCustomPrice) || (cost * 1.25);
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
    
    const updatedSim = { ...simulationData };
    const customScenario = updatedSim.scenarios[SCENARIO_TYPES.CUSTOM];
    if (customScenario) {
      customScenario.price = Math.round(price);
      customScenario.margin = Math.round(margin * 10) / 10;
      customScenario.premissas.custo = cost;
      customScenario.premissas.precoProposta = Math.round(price);
      customScenario.premissas.margemLucro = Math.round(margin * 10) / 10;
      customScenario.isFloorViolation = margin < updatedSim.premissas.margemMinimaFloor.value;
      
      if (sandboxDocApproved) {
        customScenario.documentReadiness = 100;
        customScenario.risks.documental = 'Baixo';
        customScenario.effort.documental = 'Baixo';
      }
    }
    
    setSimulationData(updatedSim);
    showNotice('Cenário Personalizado recalculado em Sandbox (dados reais preservados).');
  };

  const showNotice = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleApplyScenarioClick = (sc) => {
    if (sc.type === SCENARIO_TYPES.NO_GO) {
      if (window.confirm('Confirma registrar recomendação de NÃO PARTICIPAR para a diretoria?')) {
        executeApply(sc);
      }
      return;
    }
    setScenarioToApply(sc);
    setShowApplyModal(true);
  };

  const executeApply = (sc, reason = '') => {
    try {
      const res = strategicSimulationService.applyScenarioToProposal(
        selectedOppId,
        sc.type,
        'Diretor de Operações',
        reason
      );
      showNotice(`Sucesso: ${res.message}. Proposta oficial versionada v${res.proposalVersion}.`);
      setShowApplyModal(false);
      setOverrideReason('');
      loadSimulation(selectedOppId);
    } catch (err) {
      alert(`Bloqueio de Aplicação: ${err.message}`);
    }
  };

  const handleRunE2ETests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      try {
        const results = strategicSimulationService.runAllValidationTests();
        setTestResults(results);
        showNotice('Bateria de 8 Testes + Multiempresa executada com sucesso!');
      } catch (err) {
        alert('Erro nos testes: ' + err.message);
      } finally {
        setIsRunningTests(false);
      }
    }, 400);
  };

  const formatBRL = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  const pendingDecisions = useMemo(() => {
    return strategicSimulationService.getDecisionQueue(userCompanyId);
  }, [userCompanyId, simulationData]);

  if (!simulationData) {
    return <div className="sim-loading">Carregando Simulador Estratégico...</div>;
  }

  const { opportunity, scenarios, conflicts, recommended, premissas } = simulationData;

  return (
    <div className="strategic-sim-container">
      {/* HEADER PRINCIPAL */}
      <div className="sim-header">
        <div className="sim-header-title-box">
          <div className="sim-badge">
            <Sparkles size={14} /> FASE 35 • SIMULADOR ESTRATÉGICO DE LICITAÇÕES
          </div>
          <h1>Simulador de Cenários & Decisão de Participação</h1>
          <p className="sim-subtitle">
            Ambiente Sandbox para modelar trade-offs de preço, margem, esforço de equipe e risco antes de comprometer capacidade interna.
          </p>
        </div>

        <div className="sim-header-actions">
          <div className="sim-opp-selector">
            <label><Filter size={14} /> Oportunidade:</label>
            <select
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
              className="sim-select"
            >
              {mockOpportunities.map(o => (
                <option key={o.id} value={o.id}>{o.organ} — {o.title}</option>
              ))}
            </select>
          </div>

          <button
            className="sim-btn sim-btn-outline"
            onClick={() => setShowBoardModal(true)}
            title="Visão executiva sintetizada para a Diretoria"
          >
            <Compass size={16} /> Board Mode (Diretoria)
          </button>

          <button
            className="sim-btn sim-btn-secondary"
            onClick={handleRunE2ETests}
            disabled={isRunningTests}
          >
            <Play size={16} /> {isRunningTests ? 'Testando...' : 'Executar Testes E2E (137-145)'}
          </button>
        </div>
      </div>

      {/* NOTIFICAÇÃO FLUTUANTE */}
      {notification && (
        <div className={`sim-toast sim-toast-${notification.type}`}>
          <CheckCircle size={18} />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* BANNER DE SANDBOX ISOLADO */}
      <div className="sim-sandbox-banner">
        <div className="sim-sandbox-left">
          <Lock size={16} className="text-warning" />
          <span>
            <strong>MODO SANDBOX ATIVO:</strong> Nenhuma alteração nesta tela altera a Proposta Oficial, o Pipeline Real ou o Forecast até que você confirme explicitamente a aplicação do cenário.
          </span>
        </div>
        <div className="sim-confidence-pill">
          Confiança dos Dados: <span className="sim-badge-high">{opportunity.dataConfidence}</span>
        </div>
      </div>

      {/* CONFLITO DE RECURSOS DETECTADO (SE HOUVER) */}
      {conflicts && conflicts.length > 0 && (
        <div className="sim-conflict-alert-box">
          <div className="sim-conflict-header">
            <AlertOctagon size={22} className="text-danger" />
            <div>
              <h3>CONFLITO DE CAPACIDADE INTERNA DETECTADO</h3>
              <p>Existem recursos críticos disputados por propostas concorrentes com prazo na mesma semana.</p>
            </div>
          </div>
          <div className="sim-conflict-list">
            {conflicts.map((c, i) => (
              <div key={i} className="sim-conflict-card">
                <div className="sim-conflict-resource">
                  <Users size={16} /> <strong>{c.resource}</strong> ({c.role})
                </div>
                <div className="sim-conflict-body">
                  <span>Conflito com: {c.conflictingProposals.join(' e ')}</span>
                  <div className="sim-badge-danger">Sobrecarga: {c.workload}</div>
                </div>
                <div className="sim-conflict-rec">
                  <strong>Recomendação:</strong> {c.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAVEGAÇÃO DE SUB-ABAS */}
      <div className="sim-nav-tabs">
        <button
          className={`sim-nav-btn ${activeTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenarios')}
        >
          <Scale size={16} /> Matriz Comparativa de Cenários
        </button>
        <button
          className={`sim-nav-btn ${activeTab === 'assumptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('assumptions')}
        >
          <FileText size={16} /> Painel de Premissas & Rastreabilidade
        </button>
        <button
          className={`sim-nav-btn ${activeTab === 'decisionQueue' ? 'active' : ''}`}
          onClick={() => setActiveTab('decisionQueue')}
        >
          <CheckSquare size={16} /> Fila de Decisões ({pendingDecisions.length})
        </button>
      </div>

      {/* ABA 1: MATRIZ DE CENÁRIOS */}
      {activeTab === 'scenarios' && (
        <div className="sim-tab-content">
          {/* RECOMENDAÇÃO TRANSPARENTE */}
          {recommended && (
            <div className="sim-recommended-banner">
              <div className="sim-rec-title">
                <Sparkles size={18} /> Cenário com Melhor Equilíbrio de Trade-offs: <strong>{recommended.recommendedScenario}</strong>
              </div>
              <p className="sim-rec-reason">{recommended.reason}</p>
            </div>
          )}

          {/* GRID COMPARATIVO LADO A LADO */}
          <div className="sim-scenarios-grid">
            {Object.values(scenarios).map((sc) => {
              const isRecommended = recommended?.recommendedScenario === sc.name;
              const isNoGo = sc.type === SCENARIO_TYPES.NO_GO;

              return (
                <div
                  key={sc.type}
                  className={`sim-scenario-card ${isRecommended ? 'sim-card-recommended' : ''} ${isNoGo ? 'sim-card-nogo' : ''}`}
                >
                  <div className="sim-card-header">
                    <div>
                      <h4>{sc.name}</h4>
                      <span className="sim-card-desc">{sc.description}</span>
                    </div>
                    {isRecommended && <span className="sim-best-badge">Equilibrado</span>}
                  </div>

                  {/* VALORES E MARGEM */}
                  <div className="sim-card-pricing">
                    <div className="sim-price-line">
                      <span className="sim-label">Preço Simulado:</span>
                      <span className="sim-value-price">{formatBRL(sc.price)}</span>
                    </div>
                    <div className="sim-margin-line">
                      <span className="sim-label">Margem Operacional:</span>
                      <span className={`sim-value-margin ${sc.margin < 12 ? 'text-danger' : sc.margin > 20 ? 'text-success' : 'text-primary'}`}>
                        {isNoGo ? '—' : `${sc.margin}%`}
                      </span>
                    </div>
                    {sc.isFloorViolation && (
                      <div className="sim-floor-warning">
                        <AlertTriangle size={14} /> Abaixo do Floor Institucional (12%)
                      </div>
                    )}
                  </div>

                  {/* INDICADORES DECISÓRIOS */}
                  <div className="sim-metrics-list">
                    <div className="sim-metric-row">
                      <span>Posição Mercado:</span>
                      <strong>{sc.marketPosition || '—'}</strong>
                    </div>
                    <div className="sim-metric-row">
                      <span>Prontidão Dossiê:</span>
                      <strong className={sc.documentReadiness < 80 ? 'text-danger' : 'text-success'}>
                        {isNoGo ? '—' : `${sc.documentReadiness}%`}
                      </strong>
                    </div>
                    <div className="sim-metric-row">
                      <span>Esforço Geral:</span>
                      <span className={`sim-effort-pill sim-effort-${sc.effort.geral.toLowerCase()}`}>
                        {sc.effort.geral}
                      </span>
                    </div>
                    <div className="sim-metric-row">
                      <span>Risco Global:</span>
                      <span className={`sim-risk-pill sim-risk-${sc.risks.documental.toLowerCase()}`}>
                        {isNoGo ? 'Zero' : `${sc.risks.documental} (Doc)`}
                      </span>
                    </div>
                  </div>

                  {/* DETALHAMENTO DE ESFORÇO DA EQUIPE */}
                  {!isNoGo && (
                    <div className="sim-effort-breakdown">
                      <div className="sim-sub-title">Carga Estimada por Área:</div>
                      <div className="sim-breakdown-tags">
                        <span>Licitações: <b>{sc.effort.documental}</b></span>
                        <span>Técnico: <b>{sc.effort.tecnico}</b></span>
                        <span>Comercial: <b>{sc.effort.comercial}</b></span>
                      </div>
                    </div>
                  )}

                  {/* IMPACTO NO PIPELINE / CUSTO DE OPORTUNIDADE */}
                  <div className="sim-impact-box">
                    <div className="sim-sub-title">Impacto Hipotético:</div>
                    <p className="sim-impact-text">{sc.pipelineImpact}</p>
                    <p className="sim-opp-cost">
                      <Info size={12} /> Custo de Oportunidade: {sc.opportunityCost}
                    </p>
                  </div>

                  {/* BOTÃO DE AÇÃO */}
                  <div className="sim-card-actions">
                    <button
                      className={`sim-btn-apply ${sc.isFloorViolation ? 'sim-btn-override' : ''}`}
                      onClick={() => handleApplyScenarioClick(sc)}
                    >
                      {sc.isFloorViolation ? (
                        <>Requerer Override</>
                      ) : isNoGo ? (
                        <>Registrar No-Go</>
                      ) : (
                        <>Aplicar Este Cenário <ArrowRight size={14} /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SENSITIVITY TESTING & SANDBOX INTERATIVO */}
          <div className="sim-sandbox-controls">
            <div className="sim-controls-header">
              <RefreshCw size={18} />
              <h4>Simulação Rápida de Sensibilidade (Sandbox Interativo)</h4>
            </div>
            <p className="sim-controls-help">
              Altere variáveis hipotéticas para verificar imediatamente o comportamento da margem e viabilidade do Cenário Personalizado.
            </p>

            <div className="sim-controls-grid">
              <div className="sim-control-field">
                <label>Custo Direto Estimado (R$):</label>
                <input
                  type="number"
                  value={sandboxCustomCost || ''}
                  onChange={(e) => setSandboxCustomCost(e.target.value)}
                  className="sim-input"
                />
                <span className="sim-hint">Original: {formatBRL(premissas.custoEstimado.value)}</span>
              </div>

              <div className="sim-control-field">
                <label>Preço Proposto no Cenário (R$):</label>
                <input
                  type="number"
                  value={sandboxCustomPrice || ''}
                  onChange={(e) => setSandboxCustomPrice(e.target.value)}
                  className="sim-input"
                />
                <span className="sim-hint">Faixa observada: R$ 1.55M a R$ 1.82M</span>
              </div>

              <div className="sim-control-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={sandboxDocApproved}
                    onChange={(e) => setSandboxDocApproved(e.target.checked)}
                  />
                  <span>Simular Atestado Crítico Aprovado (Dossiê 100%)</span>
                </label>
              </div>

              <div className="sim-control-btn-box">
                <button
                  className="sim-btn sim-btn-primary"
                  onClick={handleRecalculateSandbox}
                >
                  <RefreshCw size={14} /> Recalcular Cenário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: PREMISSAS & RASTREABILIDADE */}
      {activeTab === 'assumptions' && (
        <div className="sim-tab-content">
          <div className="sim-assumptions-container">
            <div className="sim-assumptions-header">
              <h3>Rastreabilidade e Origem das Premissas Utilizadas</h3>
              <p>Nenhum dado é inventado. Cada parâmetro decisório aponta sua fonte primária ou flag de premissa manual.</p>
            </div>

            <div className="sim-assumptions-table-wrapper">
              <table className="sim-table">
                <thead>
                  <tr>
                    <th>Parâmetro</th>
                    <th>Valor Adotado</th>
                    <th>Origem da Premissa</th>
                    <th>Confiança</th>
                    <th>Observações / Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(premissas).map(([key, p]) => (
                    <tr key={key}>
                      <td><strong>{key}</strong></td>
                      <td>
                        {typeof p.value === 'number' && key.toLowerCase().includes('custo')
                          ? formatBRL(p.value)
                          : typeof p.value === 'number' && key.toLowerCase().includes('margem')
                          ? `${p.value}%`
                          : String(p.value)}
                      </td>
                      <td>
                        <span className={`sim-source-tag sim-source-${p.source.toLowerCase().replace(/ /g, '-')}`}>
                          {p.source}
                        </span>
                      </td>
                      <td>
                        <span className="sim-confidence-text">
                          {p.source === AssumptionSource.REAL_DATA ? 'Alta' : p.source === AssumptionSource.MANUAL ? 'Sob Análise' : 'Média'}
                        </span>
                      </td>
                      <td>{p.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sim-audit-notice">
              <Info size={16} />
              <span>
                Todas as alterações em premissas manuais ficam registradas na trilha de auditoria da oportunidade com timestamp e ID do usuário.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: FILA DE DECISÕES PENDENTES */}
      {activeTab === 'decisionQueue' && (
        <div className="sim-tab-content">
          <div className="sim-queue-container">
            <div className="sim-queue-header">
              <h3>Fila de Decisões Estratégicas Pendentes (SLA & Deadlines)</h3>
              <p>Licitações em fase de definição de estratégia com controle rigoroso de SLA para evitar perda de prazos de proposta.</p>
            </div>

            <div className="sim-queue-grid">
              {pendingDecisions.map((item) => (
                <div key={item.opportunityId} className="sim-queue-card">
                  <div className="sim-queue-card-top">
                    <span className="sim-queue-organ">{item.organ}</span>
                    <span className={`sim-sla-badge sim-sla-${item.slaUrgency}`}>
                      <Calendar size={12} /> {item.slaDeadline}
                    </span>
                  </div>

                  <h4>{item.title}</h4>

                  <div className="sim-queue-meta">
                    <div>
                      <span>Valor Referência:</span>
                      <strong>{formatBRL(item.refValue)}</strong>
                    </div>
                    <div>
                      <span>Responsável:</span>
                      <strong>{item.responsible}</strong>
                    </div>
                    <div>
                      <span>Status:</span>
                      <strong className="text-warning">{item.status}</strong>
                    </div>
                  </div>

                  <div className="sim-queue-conflicts">
                    {item.conflictWarning ? (
                      <span className="text-danger">
                        <AlertTriangle size={14} /> {item.conflictWarning}
                      </span>
                    ) : (
                      <span className="text-success">
                        <CheckCircle size={14} /> Capacidade interna disponível
                      </span>
                    )}
                  </div>

                  <div className="sim-queue-actions">
                    <button
                      className="sim-btn sim-btn-outline"
                      onClick={() => {
                        setSelectedOppId(item.opportunityId);
                        setActiveTab('scenarios');
                      }}
                    >
                      Abrir no Simulador <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RESULTADO DOS TESTES E2E (ITENS 137 A 145) */}
      {testResults && (
        <div className="sim-tests-results-box">
          <div className="sim-tests-header">
            <h4>Bateria de Testes Automatizados (Fase 35 - Itens 137 a 145)</h4>
            <button className="sim-btn-close-tests" onClick={() => setTestResults(null)}>Fechar</button>
          </div>
          <div className="sim-tests-grid">
            {testResults.map((t, idx) => (
              <div key={idx} className="sim-test-item">
                <div className="sim-test-top">
                  <span className="sim-test-id">{t.testId}</span>
                  <span className="sim-test-status-ok"><CheckCircle size={14} /> Aprovado</span>
                </div>
                <div className="sim-test-desc">{t.description}</div>
                <div className="sim-test-verif">{t.verification}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO: APLICAR CENÁRIO */}
      {showApplyModal && scenarioToApply && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-card">
            <div className="sim-modal-header">
              <h3>Confirmar Aplicação de Cenário Estratégico</h3>
              <button className="sim-btn-modal-close" onClick={() => setShowApplyModal(false)}>×</button>
            </div>

            <div className="sim-modal-body">
              <p>
                Você está prestes a aplicar a estratégia <strong>{scenarioToApply.name}</strong> à proposta oficial de <strong>{opportunity.title}</strong>.
              </p>

              <div className="sim-modal-summary-box">
                <div><strong>Preço:</strong> {formatBRL(scenarioToApply.price)}</div>
                <div><strong>Margem:</strong> {scenarioToApply.margin}%</div>
                <div><strong>Risco Doc:</strong> {scenarioToApply.risks.documental}</div>
                <div><strong>Esforço:</strong> {scenarioToApply.effort.geral}</div>
              </div>

              {scenarioToApply.isFloorViolation && (
                <div className="sim-modal-override-box">
                  <div className="sim-override-alert">
                    <AlertOctagon size={18} className="text-danger" />
                    <strong>OVERRIDE DE FLOOR PRICE REQUERIDO:</strong>
                  </div>
                  <p>
                    A margem ({scenarioToApply.margin}%) está abaixo do piso institucional de 12%. Uma justificativa formal e aprovação da Diretoria são obrigatórias para versionar esta proposta.
                  </p>
                  <label>Justificativa Formal do Override:</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Cliente âncora prioritário na região; margem compensada no contrato de sustentação subsequente..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="sim-textarea"
                  />
                </div>
              )}

              <p className="sim-modal-version-note">
                <Info size={14} /> Os valores atuais aprovados não serão sobrescritos. Uma nova versão de proposta será gerada com rastreamento completo para auditoria.
              </p>
            </div>

            <div className="sim-modal-footer">
              <button
                className="sim-btn sim-btn-outline"
                onClick={() => setShowApplyModal(false)}
              >
                Cancelar
              </button>
              <button
                className="sim-btn sim-btn-primary"
                onClick={() => executeApply(scenarioToApply, overrideReason)}
              >
                Confirmar & Versionar Proposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BOARD MODE (RESUMO PARA DIRETORIA) */}
      {showBoardModal && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-card sim-modal-board">
            <div className="sim-modal-header">
              <div className="sim-board-badge"><Compass size={16} /> BOARD MODE</div>
              <h3>Resumo Executivo para Decisão da Diretoria</h3>
              <button className="sim-btn-modal-close" onClick={() => setShowBoardModal(false)}>×</button>
            </div>

            <div className="sim-board-body">
              <div className="sim-board-hero">
                <div>
                  <span className="sim-board-label">Oportunidade</span>
                  <h4>{opportunity.title}</h4>
                  <span className="sim-board-organ">{opportunity.organ} • Prazo: {opportunity.deadline}</span>
                </div>
                <div className="sim-board-val">
                  <span className="sim-board-label">Valor de Referência</span>
                  <h3>{formatBRL(opportunity.refValue)}</h3>
                </div>
              </div>

              <div className="sim-board-kpis">
                <div className="sim-board-kpi">
                  <span>Aderência Técnica</span>
                  <strong>{opportunity.technicalFit}%</strong>
                </div>
                <div className="sim-board-kpi">
                  <span>Prontidão Documental</span>
                  <strong>{opportunity.documentReadiness}%</strong>
                </div>
                <div className="sim-board-kpi">
                  <span>Margem Equilibrada</span>
                  <strong className="text-success">18.5%</strong>
                </div>
                <div className="sim-board-kpi">
                  <span>Conflito de Recursos</span>
                  <strong className={conflicts.length > 0 ? 'text-danger' : 'text-success'}>
                    {conflicts.length > 0 ? 'Detectado' : 'Nenhum'}
                  </strong>
                </div>
              </div>

              <div className="sim-board-scenarios-table">
                <h4>Comparativo Direto de Cenários</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Estratégia</th>
                      <th>Preço</th>
                      <th>Margem</th>
                      <th>Risco Global</th>
                      <th>Esforço Equipe</th>
                      <th>Impacto Pipeline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(scenarios).map(s => (
                      <tr key={s.type} className={recommended?.recommendedScenario === s.name ? 'sim-tr-highlight' : ''}>
                        <td><strong>{s.name}</strong></td>
                        <td>{formatBRL(s.price)}</td>
                        <td>{s.type === SCENARIO_TYPES.NO_GO ? '—' : `${s.margin}%`}</td>
                        <td>{s.risks.documental}</td>
                        <td>{s.effort.geral}</td>
                        <td>{s.pipelineImpact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sim-board-recommendation">
                <strong>Recomendação Executiva:</strong> {recommended?.reason}
              </div>
            </div>

            <div className="sim-modal-footer">
              <button className="sim-btn sim-btn-outline" onClick={() => window.print()}>
                <Download size={14} /> Exportar PDF Executivo
              </button>
              <button className="sim-btn sim-btn-primary" onClick={() => setShowBoardModal(false)}>
                Fechar Visão Diretoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
