import React, { useState } from 'react';
import './RecoveryPlannerView.css';
import {
  initialMitigationPlans,
  historicalMitigations
} from '../../services/mitigation/mitigationData';
import {
  mitigationPlannerEngine
} from '../../services/mitigation/mitigationPlannerEngine';
import {
  OptionViability,
  RecoveryWindowStatus,
  ActionStatus
} from '../../services/mitigation/mitigationModels';

export const RecoveryPlannerView = ({ currentUser = { role: 'ADMIN', permissions: ['mitigation.manage', 'mitigation.approve'] } }) => {
  const [plans, setPlans] = useState(initialMitigationPlans);
  const [selectedPlanId, setSelectedPlanId] = useState(initialMitigationPlans[0].id);
  const [activeArea, setActiveArea] = useState('plan'); // 'risk' | 'window' | 'options' | 'plan' | 'residual'
  
  // Modal de Simulação
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simResult, setSimResult] = useState(null);
  
  // Feedback
  const [notification, setNotification] = useState('');

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  // Handler de Simulação
  const handleOpenSimulation = (optId) => {
    const res = mitigationPlannerEngine.simulateMitigation(currentPlan, optId);
    setSimResult(res);
    setSimModalOpen(true);
  };

  // Handler de Conclusão de Ação
  const handleCompleteAction = (actId) => {
    try {
      const res = mitigationPlannerEngine.recordActionCompletion(currentPlan.id, actId, currentUser.name || 'Gestor');
      setPlans(prev => prev.map(p => p.id === res.plan.id ? { ...res.plan } : p));
      setNotification(`Ação concluída com sucesso! Risco recalculado para: ${res.newRiskLevel} (${res.trajectory}).`);
      setTimeout(() => setNotification(''), 4500);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler de Acionamento de Fallback
  const handleTriggerFallback = (fbActId) => {
    const confirmed = window.confirm('Deseja autorizar formalmente o acionamento do parceiro/ação de contingência?');
    if (!confirmed) return;

    try {
      mitigationPlannerEngine.triggerFallbackOption(currentPlan.id, fbActId, currentUser.name || 'Diretor de Operações');
      // Forçar re-render dos planos
      setPlans([...mitigationPlannerEngine.plans]);
      setNotification('Plano de Contingência (Fallback) acionado mediante deliberação humana.');
      setTimeout(() => setNotification(''), 4500);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler de Versionamento do Plano
  const handleVersionPlan = () => {
    const reason = prompt('Informe a justificativa para recalcular e versionar o plano (ex: prorrogação de prazo, nova cotação):', 'Ajuste de premissas editalícias');
    if (!reason) return;

    try {
      const newV = mitigationPlannerEngine.versionPlanOnContextChange(currentPlan.id, reason);
      setPlans([...mitigationPlannerEngine.plans]);
      setSelectedPlanId(newV.id);
      setNotification(`Nova versão do plano (v${newV.version}) gerada com sucesso. Histórico anterior preservado.`);
      setTimeout(() => setNotification(''), 4500);
    } catch (err) {
      alert(err.message);
    }
  };

  const getRiskBadge = (level) => {
    if (level.includes('Crítico') || level.includes('Critical')) return <span className="badge-critical">{level}</span>;
    if (level.includes('Alto') || level.includes('High')) return <span className="badge-high">{level}</span>;
    if (level.includes('Moderado') || level.includes('Moderate')) return <span className="badge-moderate">{level}</span>;
    return <span className="badge-low">{level}</span>;
  };

  return (
    <div className="recovery-planner-container">
      {/* Header */}
      <div className="recovery-header">
        <div>
          <span className="phase-tag">Fase 67 — Prescriptive Risk Mitigation</span>
          <h2>Recovery Planner & Plano Inteligente de Mitigação</h2>
          <p className="recovery-subtitle">
            Transformação de riscos preditivos em planos de ação sequenciados, opções viáveis no tempo e janelas de intervenção antecipada.
          </p>
        </div>
        <div className="human-guardrail-card">
          <span>⚖️</span>
          <div>
            <strong>Guardrail Humano Inviolável:</strong> O Vellia analisa, compara e sequencia alternativas de mitigação. A decisão e autorização final pertencem exclusivamente aos gestores humanos.
          </div>
        </div>
      </div>

      {notification && (
        <div className="feedback-banner">
          ✅ {notification}
        </div>
      )}

      {/* Context Bar */}
      <div className="plan-context-bar">
        <div className="opp-select-group">
          <label htmlFor="planSelect"><strong>Oportunidade & Plano:</strong></label>
          <select
            id="planSelect"
            value={selectedPlanId}
            onChange={e => setSelectedPlanId(e.target.value)}
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.relatedEntityId} — {p.opportunityTitle.slice(0, 48)}... (v{p.version})
              </option>
            ))}
          </select>
          <button className="btn-trigger-fb" onClick={handleVersionPlan}>
            🔄 Versionar Plano
          </button>
        </div>

        <div className="quick-stats-row">
          <div className="stat-pill">
            <span className="label">Nível de Risco</span>
            <span className="val">{getRiskBadge(currentPlan.riskLevel)}</span>
          </div>
          <div className="stat-pill">
            <span className="label">Janela de Recuperação</span>
            <span className="val">{currentPlan.recoveryWindow.status}</span>
          </div>
          <div className="stat-pill">
            <span className="label">Prazo Remanescente</span>
            <span className="val" style={{ color: '#38bdf8' }}>{currentPlan.recoveryWindow.hoursRemaining}h</span>
          </div>
        </div>
      </div>

      {/* 5 Areas Navigation */}
      <div className="planner-nav-tabs">
        <button
          className={`planner-tab-btn ${activeArea === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveArea('risk')}
        >
          1. ⚠️ Risk (O Que Ameaça o Processo)
        </button>
        <button
          className={`planner-tab-btn ${activeArea === 'window' ? 'active' : ''}`}
          onClick={() => setActiveArea('window')}
        >
          2. ⏳ Recovery Window (Espaço de Reação)
        </button>
        <button
          className={`planner-tab-btn ${activeArea === 'options' ? 'active' : ''}`}
          onClick={() => setActiveArea('options')}
        >
          3. 💡 Options (Alternativas Viáveis)
        </button>
        <button
          className={`planner-tab-btn ${activeArea === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveArea('plan')}
        >
          4. 📋 Plan (Sequência de Recuperação)
        </button>
        <button
          className={`planner-tab-btn ${activeArea === 'residual' ? 'active' : ''}`}
          onClick={() => setActiveArea('residual')}
        >
          5. 🛡️ Residual Risk & Memória Histórica
        </button>
      </div>

      {/* AREA 1: RISK & CAUSA RAIZ */}
      {activeArea === 'risk' && (
        <div className="risk-area-card">
          <h3>Diagnóstico de Risco Operacional da Proposta</h3>
          <p className="recovery-subtitle">
            Mapeamento dos gargalos e fatores impeditivos que justificam a intervenção imediata.
          </p>

          <div className="risk-area-grid">
            <div className="risk-info-box">
              <h4>🎯 Alvo Preditivo & Impacto</h4>
              <p><strong>Tipo de Risco:</strong> {currentPlan.riskType}</p>
              <p><strong>Gravidade Atual:</strong> {currentPlan.riskLevel}</p>
              <p><strong>Status do Plano:</strong> {currentPlan.status}</p>
            </div>

            <div className="risk-info-box">
              <h4>🔍 Causa Raiz Observável</h4>
              <p><strong>Fator Primário:</strong> {currentPlan.rootCause.primaryDriver}</p>
              <p><strong>Confirmado por Evidência:</strong> {currentPlan.rootCause.isConfirmed ? 'Sim (Verificado)' : 'Não (Inferência de Processo)'}</p>
              <p><em>Nota: {currentPlan.rootCause.note}</em></p>
            </div>

            <div className="risk-info-box">
              <h4>⚡ Gatilhos no Caminho Crítico</h4>
              <p>• Validação formal de disponibilidade técnica de parceiros</p>
              <p>• Homologação da planilha de formação de preços</p>
              <p>• Emissão tempestiva de atestados de capacidade</p>
            </div>
          </div>
        </div>
      )}

      {/* AREA 2: RECOVERY WINDOW */}
      {activeArea === 'window' && (
        <div className="rw-container">
          <div className="rw-visual-card">
            <h3>Janela de Recuperação Temporal</h3>
            <p className="recovery-subtitle">
              Tempo útil hábil restante antes que as opções viáveis de mitigação expirem.
            </p>

            <div className="rw-indicator">
              <span className="rw-circle-clock">⏳</span>
              <div className="rw-time-display">
                <span className="rw-time-num">{currentPlan.recoveryWindow.hoursRemaining} Horas</span>
                <span className="rw-time-sub">Restantes até o encerramento do prazo editalício</span>
              </div>
            </div>

            <p><strong>Classificação da Janela:</strong> {currentPlan.recoveryWindow.status}</p>
            <p><strong>Justificativa de Lead Time:</strong> {currentPlan.recoveryWindow.reason}</p>
          </div>

          <div className="rw-visual-card">
            <h3>Valor da Intervenção Antecipada</h3>
            <p className="recovery-subtitle">
              Como o timing de decisão preserva opções e evita custos emergenciais.
            </p>

            <div className="early-intervention-box">
              <h5>💡 Dinâmica Temporal Observada</h5>
              <p>{currentPlan.recoveryWindow.earlyInterventionInsight}</p>
            </div>

            <div style={{ marginTop: '16px', fontSize: '0.88rem', color: '#8b949e' }}>
              <strong>Princípio Operacional:</strong> Quando a janela entra em estado <em>Critical (&lt; 18h)</em>, opções estruturais de baixo custo tornam-se inviáveis no tempo, restando apenas planos de contingência expressa ou retirada estratégica consciente.
            </div>
          </div>
        </div>
      )}

      {/* AREA 3: OPTIONS (ALTERNATIVAS VIÁVEIS) */}
      {activeArea === 'options' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3>Alternativas Prescritivas de Mitigação</h3>
            <span className="recovery-subtitle">
              Opções avaliadas pelo motor com análise estrita de viabilidade temporal e dependências.
            </span>
          </div>

          <div className="options-grid">
            {currentPlan.options.map(opt => (
              <div
                key={opt.id}
                className={`option-card ${opt.viability === OptionViability.UNLIKELY ? 'option-unlikely' : ''}`}
              >
                <div>
                  <div className="option-top">
                    <span className="option-type-tag">{opt.type}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: '700', color: opt.viability === OptionViability.VIABLE ? '#4ade80' : '#f87171' }}>
                      {opt.viability}
                    </span>
                  </div>
                  <h4 className="option-title">{opt.title}</h4>
                  <p className="option-desc">{opt.description}</p>

                  <div className="option-meta-table">
                    <div className="meta-row">
                      <span className="k">Impacto Esperado:</span>
                      <span className="v">{opt.expectedImpact}</span>
                    </div>
                    <div className="meta-row">
                      <span className="k">Esforço Operacional:</span>
                      <span className="v">{opt.effort}</span>
                    </div>
                    <div className="meta-row">
                      <span className="k">Duração Estimada:</span>
                      <span className="v">{opt.estimatedDurationHours} horas</span>
                    </div>
                    <div className="meta-row">
                      <span className="k">Alavancagem (Leverage):</span>
                      <span className="v">{opt.leverageCount} gargalo(s) destravado(s)</span>
                    </div>
                    <div className="meta-row">
                      <span className="k">Custo Estimado:</span>
                      <span className="v">
                        {opt.cost.amount !== null ? `R$ ${opt.cost.amount.toLocaleString('pt-BR')}` : 'Não Identificado / Sem Custo'}
                      </span>
                    </div>
                  </div>

                  {opt.crossImpact.hasImpact && (
                    <div className="cross-impact-alert" style={{ marginTop: '10px' }}>
                      ⚠️ <strong>Impacto Cruzado em Outro Contrato:</strong> {opt.crossImpact.details}
                    </div>
                  )}
                </div>

                <button
                  className="btn-simulate-option"
                  onClick={() => handleOpenSimulation(opt.id)}
                >
                  🧪 Simular Esta Opção no Sandbox
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AREA 4: RECOVERY PLAN SEQUENCES */}
      {activeArea === 'plan' && (
        <div>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Plano de Ação Operacional (Now, Next, Parallel, Fallback)</h3>
              <span className="recovery-subtitle">
                Sequenciamento prático e acionável sem complexidade excessiva de cronogramas.
              </span>
            </div>
          </div>

          <div className="plan-columns-container">
            {/* NOW */}
            <div className="plan-column col-now">
              <h4>🚨 Now (Ação Imediata)</h4>
              {currentPlan.chosenPlanSequence.now.map(act => (
                <div key={act.id} className="action-card-item">
                  <div className="act-title">{act.title}</div>
                  <div className="act-details">
                    <span>👤 Responsável: {act.owner}</span>
                    <span>⏰ Prazo Limite: {act.dueDate}</span>
                    <span>📌 Status: <strong>{act.status}</strong></span>
                  </div>
                  {act.status !== ActionStatus.COMPLETED && (
                    <div className="act-actions-row">
                      <button className="btn-complete-act" onClick={() => handleCompleteAction(act.id)}>
                        ✓ Marcar Concluída
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* NEXT */}
            <div className="plan-column col-next">
              <h4>➡️ Next (Passo Subsequente)</h4>
              {currentPlan.chosenPlanSequence.next.map(act => (
                <div key={act.id} className="action-card-item">
                  <div className="act-title">{act.title}</div>
                  <div className="act-details">
                    <span>👤 Responsável: {act.owner}</span>
                    <span>⏳ Dependência: {act.dependency}</span>
                    <span>📌 Status: <strong>{act.status}</strong></span>
                  </div>
                  {act.status !== ActionStatus.COMPLETED && (
                    <div className="act-actions-row">
                      <button className="btn-complete-act" onClick={() => handleCompleteAction(act.id)}>
                        ✓ Marcar Concluída
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* PARALLEL */}
            <div className="plan-column col-parallel">
              <h4>⚡ Parallel (Ações em Paralelo)</h4>
              {currentPlan.chosenPlanSequence.parallel.map(act => (
                <div key={act.id} className="action-card-item">
                  <div className="act-title">{act.title}</div>
                  <div className="act-details">
                    <span>👤 Responsável: {act.owner}</span>
                    <span>🔄 Execução: Em paralelo</span>
                    <span>📌 Status: <strong>{act.status}</strong></span>
                  </div>
                  {act.status !== ActionStatus.COMPLETED && (
                    <div className="act-actions-row">
                      <button className="btn-complete-act" onClick={() => handleCompleteAction(act.id)}>
                        ✓ Marcar Concluída
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* FALLBACK */}
            <div className="plan-column col-fallback">
              <h4>🛡️ Fallback (Plano de Contingência)</h4>
              {currentPlan.chosenPlanSequence.fallback.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#8b949e' }}>Nenhuma contingência cadastrada.</p>
              ) : (
                currentPlan.chosenPlanSequence.fallback.map(act => (
                  <div key={act.id} className="action-card-item">
                    <div className="act-title">{act.title}</div>
                    <div className="act-details">
                      <span>👤 Alçada: {act.owner}</span>
                      <span>⚠️ Gatilho: {act.dependency}</span>
                      <span>📌 Status: <strong>{act.status}</strong></span>
                    </div>
                    {act.status !== ActionStatus.IN_PROGRESS && (
                      <div className="act-actions-row">
                        <button className="btn-trigger-fb" onClick={() => handleTriggerFallback(act.id)}>
                          ⚡ Acionar Contingência
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AREA 5: RESIDUAL RISK & HISTORICAL MEMORY */}
      {activeArea === 'residual' && (
        <div className="residual-memory-split">
          <div className="risk-area-card">
            <h3>Avaliação de Risco Residual</h3>
            <p className="recovery-subtitle">
              Gravidade esperada após a execução completa das mitigações priorizadas.
            </p>

            <div className="rw-indicator" style={{ marginTop: '16px' }}>
              <span className="rw-circle-clock">🛡️</span>
              <div>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#4ade80' }}>
                  {currentPlan.options[0]?.residualRisk || 'Moderado (Moderate)'}
                </span>
                <div style={{ fontSize: '0.8rem', color: '#8b949e', marginTop: '4px' }}>
                  Risco remanescente de processo caso as ações prioritárias sejam concluídas tempestivamente.
                </div>
              </div>
            </div>

            <p style={{ marginTop: '16px', fontSize: '0.88rem', color: '#c9d1d9' }}>
              <strong>Atenção à Margem & Custos:</strong> Mitigações que envolvem contratação emergencial de parceiros ou despesas aceleradas são registradas sem alteração automática da aprovação de preços. Qualquer desvio relevante na margem mínima dispara reavaliação de alçada pelo comitê.
            </p>
          </div>

          <div className="history-table-box">
            <h3>Memória Histórica de Mitigação</h3>
            <p className="recovery-subtitle">
              Casos similares em certames passados e efetividade observada (independente de Win/Loss).
            </p>

            <table className="mitigation-table">
              <thead>
                <tr>
                  <th>Certame</th>
                  <th>Mitigação Adotada</th>
                  <th>Efetividade de Processo</th>
                  <th>Resultado Comercial</th>
                </tr>
              </thead>
              <tbody>
                {historicalMitigations.map(h => (
                  <tr key={h.id}>
                    <td><strong>{h.opportunityId}</strong></td>
                    <td>{h.mitigationUsed}</td>
                    <td>
                      <span className="badge-low" style={{ fontSize: '0.75rem' }}>{h.effectiveness}</span>
                    </td>
                    <td>
                      <strong>{h.winLossOutcome}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simulation Modal (Sandbox) */}
      {simModalOpen && simResult && (
        <div className="sim-modal-overlay">
          <div className="sim-modal-box">
            <div className="sim-modal-header">
              <h4>Simulador Prescritivo de Mitigação (What-If)</h4>
              <button className="btn-close-modal" onClick={() => setSimModalOpen(false)}>✕</button>
            </div>

            <div className="sim-modal-body">
              <p><strong>Opção Simulada:</strong> {simResult.simulatedOption}</p>

              <div className="sim-metric-card">
                <span>Risco Projetado no Processo:</span>
                <span className="badge-moderate">{simResult.projectedRiskLevel}</span>
              </div>

              <div className="sim-metric-card">
                <span>Impacto na Prontidão (Readiness):</span>
                <span style={{ fontWeight: '700', color: '#38bdf8' }}>{simResult.readinessDelta}</span>
              </div>

              <div className="sim-metric-card">
                <span>Caminho Crítico (Critical Path):</span>
                <span style={{ fontSize: '0.85rem' }}>{simResult.criticalPathImpact}</span>
              </div>

              <div style={{ background: '#0d1117', padding: '12px', borderRadius: '6px', fontSize: '0.82rem' }}>
                <p style={{ margin: '0 0 6px 0' }}><strong>Trade-Offs & Custos:</strong> {simResult.tradeOffs.cost} • Esforço {simResult.tradeOffs.effort}</p>
                <p style={{ margin: 0, color: '#f59e0b' }}><strong>Impacto Cruzado:</strong> {simResult.tradeOffs.crossImpact}</p>
              </div>

              <small style={{ color: '#8b949e', fontStyle: 'italic' }}>
                {simResult.warning}
              </small>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn-trigger-fb" onClick={() => setSimModalOpen(false)}>
                Fechar Simulação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecoveryPlannerView;
