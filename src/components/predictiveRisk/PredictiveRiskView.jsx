import React, { useState } from 'react';
import './PredictiveRiskView.css';
import {
  initialRiskAssessments,
  initialModelRegistry
} from '../../services/predictiveRisk/predictiveRiskData';
import {
  RiskLevel,
  RiskTrajectory,
  TargetRisk,
  ModelStatus
} from '../../services/predictiveRisk/predictiveRiskModels';
import {
  predictiveRiskEngine
} from '../../services/predictiveRisk/predictiveRiskEngine';

export const PredictiveRiskView = () => {
  const [activeTab, setActiveTab] = useState('earlyWarning'); // earlyWarning | trajectory | explainability | governance | humanControl
  const [assessments, setAssessments] = useState(initialRiskAssessments);
  const [models, setModels] = useState(initialModelRegistry);
  const [selectedAssessment, setSelectedAssessment] = useState(initialRiskAssessments[0]);
  const [selectedModel, setSelectedModel] = useState(initialModelRegistry[0]);

  // Modal / Inputs state
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideLevel, setOverrideLevel] = useState(RiskLevel.MODERATE);
  const [overrideReason, setOverrideReason] = useState('');
  const [showSimModal, setShowSimModal] = useState(false);
  const [simResolvedBlocker, setSimResolvedBlocker] = useState(true);
  const [simPartnerConfirmed, setSimPartnerConfirmed] = useState(true);
  const [simResult, setSimResult] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  // Human Override Handler
  const handleSaveOverride = () => {
    if (!overrideReason.trim()) return;
    const updated = predictiveRiskEngine.recordHumanAssessment(
      selectedAssessment.id,
      overrideLevel,
      overrideReason,
      'Gestor Operacional'
    );
    setAssessments(prev => prev.map(a => a.id === updated.id ? updated : a));
    setSelectedAssessment(updated);
    setShowOverrideModal(false);
    setOverrideReason('');
    setFeedbackSuccess('Avaliação humana registrada com sucesso! A previsão original do modelo foi preservada.');
    setTimeout(() => setFeedbackSuccess(''), 4000);
  };

  // Scenario Simulation Handler
  const handleRunSimulation = () => {
    const res = predictiveRiskEngine.simulateMitigation(selectedAssessment, {
      resolvedBlocker: simResolvedBlocker,
      partnerConfirmed: simPartnerConfirmed
    });
    setSimResult(res);
  };

  // Blocker Resolution Simulation (Live update)
  const handleResolveBlocker = () => {
    const updated = predictiveRiskEngine.recalculateOnBlockerResolution(
      selectedAssessment,
      'Atestado de Capacidade Técnica'
    );
    setAssessments(prev => prev.map(a => a.id === updated.id ? updated : a));
    setSelectedAssessment(updated);
    setFeedbackSuccess('Blocker resolvido! Previsão recalculada com trajetória de melhora.');
    setTimeout(() => setFeedbackSuccess(''), 4000);
  };

  const getRiskBadgeClass = (level) => {
    switch (level) {
      case RiskLevel.LOW: return 'risk-badge-low';
      case RiskLevel.MODERATE: return 'risk-badge-moderate';
      case RiskLevel.HIGH: return 'risk-badge-high';
      case RiskLevel.CRITICAL: return 'risk-badge-critical';
      default: return '';
    }
  };

  const getTrajectoryBadge = (traj) => {
    switch (traj) {
      case RiskTrajectory.IMPROVING: return <span className="traj-pill traj-improving">📉 Melhorando</span>;
      case RiskTrajectory.WORSENING: return <span className="traj-pill traj-worsening">📈 Deteriorando</span>;
      default: return <span className="traj-pill traj-stable">➡️ Estável</span>;
    }
  };

  return (
    <div className="predictive-risk-container">
      {/* Header */}
      <div className="predictive-header">
        <div className="predictive-header-title">
          <div className="phase-badge">Fase 66 — Process & Execution Risk</div>
          <h2>Risco Preditivo & Antecipação Operacional</h2>
          <p className="subtitle">
            Previsão explicável de riscos de submissão, prontidão e processo para antecipar intervenção sem substituir a decisão humana.
          </p>
        </div>
        <div className="governance-guardrail-banner">
          <span className="guardrail-icon">🛡️</span>
          <div>
            <strong>Guardrail Ético Ativo:</strong> Sem probabilidade mágica de vitória. Sem profiling individual. Apenas regras observáveis de processo.
          </div>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="success-notification-bar">
          ✅ {feedbackSuccess}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="risk-nav-tabs">
        <button
          className={`risk-nav-btn ${activeTab === 'earlyWarning' ? 'active' : ''}`}
          onClick={() => setActiveTab('earlyWarning')}
        >
          🚨 Early Warning (Alertas)
        </button>
        <button
          className={`risk-nav-btn ${activeTab === 'trajectory' ? 'active' : ''}`}
          onClick={() => setActiveTab('trajectory')}
        >
          📈 Trajetória de Risco
        </button>
        <button
          className={`risk-nav-btn ${activeTab === 'explainability' ? 'active' : ''}`}
          onClick={() => setActiveTab('explainability')}
        >
          🔍 Explicabilidade & Drivers
        </button>
        <button
          className={`risk-nav-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          ⚖️ Governança de Modelos
        </button>
        <button
          className={`risk-nav-btn ${activeTab === 'humanControl' ? 'active' : ''}`}
          onClick={() => setActiveTab('humanControl')}
        >
          👤 Controle Humano & Simulador
        </button>
      </div>

      {/* TAB 1: EARLY WARNING */}
      {activeTab === 'earlyWarning' && (
        <div className="tab-pane-content">
          <div className="section-title-bar">
            <h3>Alertas Antecipados de Intervenção (Lead Time Crítico)</h3>
            <span className="hint-text">Alertas disparados apenas em escaladas de risco material para evitar fadiga</span>
          </div>

          <div className="assessment-grid">
            {assessments.map(item => (
              <div
                key={item.id}
                className={`risk-card ${selectedAssessment?.id === item.id ? 'selected' : ''}`}
                onClick={() => setSelectedAssessment(item)}
              >
                <div className="card-top-row">
                  <span className="opportunity-tag">{item.bidProcessId}</span>
                  <span className={`risk-level-badge ${getRiskBadgeClass(item.riskLevel)}`}>
                    {item.riskLevel}
                  </span>
                </div>
                <div className="card-target-title">{item.target}</div>
                <div className="card-trajectory-row">
                  Trajetória: {getTrajectoryBadge(item.riskTrajectory)}
                </div>
                <div className="card-timing-info">
                  <span>⏱️ Prazo: {item.featuresSnapshot.hoursToDeadline}h restantes</span>
                  <span>🛡️ Cobertura: {item.dataCoverage}</span>
                </div>
                <div className="top-driver-preview">
                  <strong>Principal Driver:</strong> {item.topDrivers[0]?.description || 'Monitoramento padrão de processo'}
                </div>
                <div className="card-footer-action">
                  <span>Ação Sugerida: {item.suggestedAction}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedAssessment && (
            <div className="detailed-early-warning-box">
              <div className="ew-header">
                <h4>Ficha de Alerta Detalhado — {selectedAssessment.bidProcessId}</h4>
                <div className="ew-actions">
                  <button className="btn-resolve-sim" onClick={handleResolveBlocker}>
                    ⚡ Simular Resolução de Blocker
                  </button>
                  <button className="btn-action-primary" onClick={() => setShowOverrideModal(true)}>
                    ✍️ Registrar Avaliação Humana
                  </button>
                </div>
              </div>
              <div className="ew-grid">
                <div className="ew-col">
                  <label>Alvo Preditivo:</label>
                  <div>{selectedAssessment.target}</div>
                </div>
                <div className="ew-col">
                  <label>Nível de Risco Atual:</label>
                  <div className={`risk-level-badge ${getRiskBadgeClass(selectedAssessment.riskLevel)}`}>
                    {selectedAssessment.riskLevel}
                  </div>
                </div>
                <div className="ew-col">
                  <label>Trajetória:</label>
                  <div>{getTrajectoryBadge(selectedAssessment.riskTrajectory)}</div>
                </div>
                <div className="ew-col">
                  <label>Modelo Responsável:</label>
                  <div>{selectedAssessment.modelVersion} ({selectedAssessment.modelSource})</div>
                </div>
              </div>
              <div className="ew-action-box">
                <strong>🎯 Intervenção Recomendada:</strong> {selectedAssessment.suggestedAction}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RISK TRAJECTORY */}
      {activeTab === 'trajectory' && (
        <div className="tab-pane-content">
          <div className="section-title-bar">
            <h3>Evolução Temporal do Risco (Timeline de Processo)</h3>
            <span className="hint-text">Acompanhamento contínuo da prontidão sem recálculos cosméticos</span>
          </div>

          <div className="trajectory-timeline-view">
            <div className="timeline-header-card">
              <h4>Oportunidade Selecionada: {selectedAssessment.bidProcessId}</h4>
              <p>Meta: Submissão sem blockers residuais antes do encerramento do prazo editalício.</p>
            </div>

            <div className="timeline-steps">
              {selectedAssessment.history && selectedAssessment.history.map((step, idx) => (
                <div key={idx} className="timeline-step-item">
                  <div className="timeline-marker">
                    <span className={`circle-marker ${getRiskBadgeClass(step.riskLevel)}`}></span>
                    {idx < selectedAssessment.history.length - 1 && <span className="timeline-connector"></span>}
                  </div>
                  <div className="timeline-step-content">
                    <div className="timeline-time-badge">{step.timestamp}</div>
                    <div className="timeline-level-badge">
                      Nível: <span className={`risk-level-badge ${getRiskBadgeClass(step.riskLevel)}`}>{step.riskLevel}</span>
                    </div>
                    <div className="timeline-trigger"><strong>Gatilho:</strong> {step.triggerEvent}</div>
                    <div className="timeline-drivers-delta">
                      <strong>Variação de Drivers:</strong> {step.driversDelta.join(' • ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPLAINABILITY & DRIVERS */}
      {activeTab === 'explainability' && (
        <div className="tab-pane-content">
          <div className="section-title-bar">
            <h3>Por Que Este Risco? (Explicabilidade Observável)</h3>
            <span className="hint-text">Top 3 a 5 fatores observáveis de processo, sem chain-of-thought ou fórmulas opacas</span>
          </div>

          <div className="explainability-container">
            <div className="drivers-card">
              <h4>Fatores Observáveis Determinantes (Top Drivers)</h4>
              <div className="drivers-list">
                {selectedAssessment.topDrivers.map((driver, idx) => (
                  <div key={idx} className="driver-row">
                    <div className="driver-group-tag">{driver.group}</div>
                    <div className="driver-description">{driver.description}</div>
                    <div className={`driver-impact impact-${driver.impact.toLowerCase()}`}>
                      Impacto {driver.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="comparables-card">
              <h4>Processos Semelhantes no Histórico</h4>
              <div className="comparable-stat-box">
                <div className="comp-number">{selectedAssessment.historicalComparables.sampleSize}</div>
                <div className="comp-label">Processos Comparáveis Auditados</div>
              </div>
              <p className="comp-insight-text">
                📌 <em>{selectedAssessment.historicalComparables.insight}</em>
              </p>
              <div className="comp-warning-note">
                <strong>Nota de Integridade:</strong> Dados comparáveis são meramente informativos para contextualização operacional e não representam probabilidade matemática isolada.
              </div>
            </div>

            <div className="snapshot-card">
              <h4>Snapshot de Features Congelado ({selectedAssessment.featuresSnapshot.snapshotId})</h4>
              <div className="snapshot-grid">
                <div className="snap-item">
                  <span className="snap-label">Horas até Deadline:</span>
                  <span className="snap-val">{selectedAssessment.featuresSnapshot.hoursToDeadline}h</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">Blockers Críticos:</span>
                  <span className="snap-val">{selectedAssessment.featuresSnapshot.criticalBlockersCount}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">Status Preço / Gate:</span>
                  <span className="snap-val">{selectedAssessment.featuresSnapshot.pricingGateStatus}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">Status Parceiro:</span>
                  <span className="snap-val">{selectedAssessment.featuresSnapshot.partnerConfirmed ? 'Confirmado' : 'Pendente'}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">Aprovações Pendentes:</span>
                  <span className="snap-val">{selectedAssessment.featuresSnapshot.pendingApprovalsCount}</span>
                </div>
                <div className="snap-item">
                  <span className="snap-label">Conflitos de Capacidade:</span>
                  <span className="snap-val">{selectedAssessment.featuresSnapshot.capacityConflicts ? 'Sim' : 'Não'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MODEL GOVERNANCE */}
      {activeTab === 'governance' && (
        <div className="tab-pane-content">
          <div className="section-title-bar">
            <h3>Predictive Model Registry & Governança</h3>
            <span className="hint-text">Shadow mode obrigatório, gate de dados mínimos e calibração por comitê</span>
          </div>

          <div className="model-registry-table-wrapper">
            <table className="governance-table">
              <thead>
                <tr>
                  <th>Chave / Nome</th>
                  <th>Versão</th>
                  <th>Alvo (Target)</th>
                  <th>Status</th>
                  <th>Calibração (Brier)</th>
                  <th>Aprovado Por</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {models.map(m => (
                  <tr key={m.id} className={selectedModel?.id === m.id ? 'row-selected' : ''}>
                    <td><strong>{m.name}</strong><br /><small>{m.modelKey}</small></td>
                    <td><code>{m.version}</code></td>
                    <td>{m.target}</td>
                    <td>
                      <span className={`status-badge status-${m.status.toLowerCase()}`}>
                        {m.status}
                      </span>
                    </td>
                    <td>
                      {m.metrics?.brierScore !== undefined ? m.metrics.brierScore.toFixed(3) : 'N/A'}
                    </td>
                    <td>{m.approvedBy || 'Pendente de Comitê'}</td>
                    <td>
                      <button className="btn-small-view" onClick={() => setSelectedModel(m)}>
                        Ver Model Card
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedModel && (
            <div className="model-card-container">
              <div className="model-card-header">
                <h4>Model Card: {selectedModel.name} (v{selectedModel.version})</h4>
                <span className={`status-badge status-${selectedModel.status.toLowerCase()}`}>
                  {selectedModel.status}
                </span>
              </div>
              <div className="model-card-body">
                <p><strong>Finalidade (Purpose):</strong> {selectedModel.modelCard?.purpose}</p>
                <div className="mc-two-col">
                  <div>
                    <h5>Dados & Treinamento</h5>
                    <ul>
                      <li>Período de Treino: {selectedModel.trainingPeriod?.start} até {selectedModel.trainingPeriod?.end}</li>
                      <li>Divisão: Temporal Split (Leakage Free)</li>
                      <li>Amostra de Validação: {selectedModel.metrics?.sampleSize || 0} casos</li>
                    </ul>
                  </div>
                  <div>
                    <h5>Métricas & Baseline</h5>
                    <ul>
                      <li>Brier Score: {selectedModel.metrics?.brierScore || 'Não calibrado'}</li>
                      <li>Falsos Negativos Críticos: {selectedModel.metrics?.falseNegatives || 0}</li>
                      <li>Baseline Superior: {selectedModel.metrics?.betterThanBaseline ? 'Sim (Validado)' : 'Não (Reprovado)'}</li>
                    </ul>
                  </div>
                </div>
                <div className="mc-limitations">
                  <strong>Limitações Conhecidas:</strong> {selectedModel.modelCard?.knownLimitations}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HUMAN CONTROL & WHAT-IF SIMULATOR */}
      {activeTab === 'humanControl' && (
        <div className="tab-pane-content">
          <div className="section-title-bar">
            <h3>Controle Humano & Simulador de Mitigação (What-If)</h3>
            <span className="hint-text">Simulações de mitigação e preservação de julgamento de negócio independente</span>
          </div>

          <div className="human-simulator-split">
            {/* Human Override View */}
            <div className="human-card">
              <h4>Avaliação Humana Concorrente</h4>
              <p className="subtext">
                O operador pode registrar uma perspectiva divergente justificando contexto adicional. A previsão estatística nunca é apagada.
              </p>

              <div className="comparison-box">
                <div className="comp-item">
                  <span className="lbl">Previsão do Modelo:</span>
                  <span className={`risk-level-badge ${getRiskBadgeClass(selectedAssessment.riskLevel)}`}>
                    {selectedAssessment.riskLevel}
                  </span>
                </div>
                <div className="comp-item">
                  <span className="lbl">Avaliação Humana:</span>
                  {selectedAssessment.humanAssessment ? (
                    <span className={`risk-level-badge ${getRiskBadgeClass(selectedAssessment.humanAssessment.riskLevel)}`}>
                      {selectedAssessment.humanAssessment.riskLevel}
                    </span>
                  ) : (
                    <span className="lbl-empty">Nenhuma registrada</span>
                  )}
                </div>
              </div>

              {selectedAssessment.humanAssessment && (
                <div className="human-justification-note">
                  <strong>Justificativa do Negócio:</strong> {selectedAssessment.humanAssessment.justification}
                  <br />
                  <small>Registrado por {selectedAssessment.humanAssessment.assessedBy} em {selectedAssessment.humanAssessment.assessedAt}</small>
                </div>
              )}

              <button className="btn-action-primary mt-3" onClick={() => setShowOverrideModal(true)}>
                ✍️ Adicionar / Atualizar Julgamento Humano
              </button>
            </div>

            {/* Scenario What-If Simulator */}
            <div className="simulator-card">
              <h4>Simulador de Mitigação (Scenario Lab)</h4>
              <p className="subtext">
                Simule: "E se o blocker for resolvido e a parceria confirmada agora?"
              </p>

              <div className="sim-switches">
                <label className="switch-row">
                  <input
                    type="checkbox"
                    checked={simResolvedBlocker}
                    onChange={e => setSimResolvedBlocker(e.target.checked)}
                  />
                  <span>Resolver Blocker Crítico de Documentação</span>
                </label>
                <label className="switch-row">
                  <input
                    type="checkbox"
                    checked={simPartnerConfirmed}
                    onChange={e => setSimPartnerConfirmed(e.target.checked)}
                  />
                  <span>Confirmar Validação Formal do Parceiro</span>
                </label>
              </div>

              <button className="btn-sim-run" onClick={handleRunSimulation}>
                🧪 Executar Simulação de Cenário
              </button>

              {simResult && (
                <div className="sim-results-box">
                  <div className="sim-res-row">
                    <span>Risco Projetado:</span>
                    <span className={`risk-level-badge ${getRiskBadgeClass(simResult.projectedRiskLevel)}`}>
                      {simResult.projectedRiskLevel}
                    </span>
                  </div>
                  <div className="sim-res-diff">
                    <strong>Variação Observada:</strong> {simResult.delta}
                  </div>
                  <div className="sim-res-note">
                    {simResult.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Human Assessment */}
      {showOverrideModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Registrar Avaliação de Negócio (Human Override)</h4>
            <p className="modal-description">
              Sua avaliação não substituirá o modelo estatístico, mas coexistirá na trilha de auditoria para análises comparativas e memória decisória.
            </p>

            <div className="form-group">
              <label>Nível de Risco Avaliado:</label>
              <select
                value={overrideLevel}
                onChange={e => setOverrideLevel(e.target.value)}
                className="select-risk-level"
              >
                <option value={RiskLevel.LOW}>Baixo (Low)</option>
                <option value={RiskLevel.MODERATE}>Moderado (Moderate)</option>
                <option value={RiskLevel.HIGH}>Alto (High)</option>
                <option value={RiskLevel.CRITICAL}>Crítico (Critical)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Justificativa Operacional / Negócio:</label>
              <textarea
                rows={3}
                placeholder="Ex: Confirmação do parceiro e atestado complementar garantidos via protocolo direto hoje..."
                value={overrideReason}
                onChange={e => setOverrideReason(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowOverrideModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSaveOverride}>
                Gravar Avaliação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveRiskView;
