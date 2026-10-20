import React, { useState } from 'react';
import './CapabilityInvestmentLabView.css';
import {
  initialInvestmentSignals,
  initialInvestmentCases,
  initialInvestmentOutcomes
} from '../../services/capabilityInvestment/capabilityInvestmentData';
import {
  capabilityInvestmentEngine
} from '../../services/capabilityInvestment/capabilityInvestmentEngine';
import {
  InvestmentCaseStatus,
  ExpansionOptionType,
  CostSourceType,
  RootConstraintType
} from '../../services/capabilityInvestment/capabilityInvestmentModels';

export const CapabilityInvestmentLabView = ({ currentUser = { role: 'ADMIN', permissions: ['capability_investment.view', 'capability_investment.manage', 'capability_investment.financial', 'capability_investment.approve'] } }) => {
  const [activeTab, setActiveTab] = useState('constraint'); // constraint | evidence | demand | options | scenarios | outcome
  const [cases, setCases] = useState(initialInvestmentCases);
  const [selectedCaseId, setSelectedCaseId] = useState(initialInvestmentCases[0].id);
  const [signals, setSignals] = useState(initialInvestmentSignals);
  const [outcomes, setOutcomes] = useState(initialInvestmentOutcomes);
  const [notification, setNotification] = useState('');

  const hasFinancial = currentUser.permissions?.includes('capability_investment.financial') || currentUser.role === 'ADMIN';
  const currentCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  // Handler de Aprovação Formal
  const handleApproveCase = () => {
    try {
      const res = capabilityInvestmentEngine.approveInvestmentCase(currentCase.id, currentUser);
      setCases([...capabilityInvestmentEngine.cases]);
      setNotification(`Caso de investimento aprovado pela diretoria! Status: APPROVED (A capacidade no portfólio permanece inalterada até a entrega física do ativo).`);
      setTimeout(() => setNotification(''), 5000);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handler de Confirmação de Implementação Física
  const handleConfirmImplementation = () => {
    try {
      const res = capabilityInvestmentEngine.confirmImplementation(currentCase.id, 'Equipamento recebido, calibração RBC conferida e equipe técnica treinada.');
      setCases([...capabilityInvestmentEngine.cases]);
      setNotification(`Implementação confirmada! Status: IMPLEMENTED. Capacidade operacional liberada para o portfólio.`);
      setTimeout(() => setNotification(''), 5000);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="investment-lab-container">
      {/* Header */}
      <div className="investment-lab-header">
        <div>
          <span className="phase-tag">Fase 69 — Capability Expansion Planner</span>
          <h2>Expansão de Capacidade & Investimentos Estratégicos</h2>
          <p className="investment-lab-subtitle">
            Transformação de gargalos operacionais recorrentes em casos estruturados de investimento: comparando compra, locação, contratação, treinamento, parceria e Do Nothing com evidência real de demanda.
          </p>
        </div>
        <div className="investment-guardrail-banner">
          <span>⚖️</span>
          <div>
            <strong>Princípio de Investimento:</strong> Não compramos ativos porque um recurso faltou uma vez. Investimento exige gargalo recorrente, impacto comprovado em pipeline e aprovação humana explícita.
          </div>
        </div>
      </div>

      {notification && (
        <div className="notification-banner">
          ✅ {notification}
        </div>
      )}

      {/* Context Bar */}
      <div className="investment-context-bar">
        <div className="case-select-group">
          <label htmlFor="caseSelect"><strong>Caso de Expansão:</strong></label>
          <select
            id="caseSelect"
            value={selectedCaseId}
            onChange={e => setSelectedCaseId(e.target.value)}
          >
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.title.slice(0, 48)}... ({c.status})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentCase.status !== InvestmentCaseStatus.APPROVED && currentCase.status !== InvestmentCaseStatus.IMPLEMENTED && (
            <button className="btn-action-primary" onClick={handleApproveCase}>
              ✓ Deliberar / Aprovar Caso
            </button>
          )}
          {currentCase.status === InvestmentCaseStatus.APPROVED && (
            <button className="btn-action-primary" onClick={handleConfirmImplementation} style={{ background: '#238636' }}>
              📦 Confirmar Entrega Física (Liberar Capacidade)
            </button>
          )}
        </div>
      </div>

      {/* 6 Perspectives Navigation */}
      <div className="investment-nav-tabs">
        <button
          className={`investment-nav-btn ${activeTab === 'constraint' ? 'active' : ''}`}
          onClick={() => setActiveTab('constraint')}
        >
          1. ⚠️ Constraint (Gargalo & Problema)
        </button>
        <button
          className={`investment-nav-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          2. 📈 Evidence (Frequência & Pipeline Afetado)
        </button>
        <button
          className={`investment-nav-btn ${activeTab === 'demand' ? 'active' : ''}`}
          onClick={() => setActiveTab('demand')}
        >
          3. 👥 Demand (Sustentabilidade da Demanda)
        </button>
        <button
          className={`investment-nav-btn ${activeTab === 'options' ? 'active' : ''}`}
          onClick={() => setActiveTab('options')}
        >
          4. 💡 Options (Alternativas: Buy, Rent, Partner, Do Nothing)
        </button>
        <button
          className={`investment-nav-btn ${activeTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenarios')}
        >
          5. 🧪 Scenarios (Comparador de Trade-Offs & Break-Even)
        </button>
        <button
          className={`investment-nav-btn ${activeTab === 'outcome' ? 'active' : ''}`}
          onClick={() => setActiveTab('outcome')}
        >
          6. 🛡️ Outcome (Revisão Pós-Investimento)
        </button>
      </div>

      {/* PERSPECTIVE 1: CONSTRAINT (PROBLEM-FIRST) */}
      {activeTab === 'constraint' && (
        <div className="perspective-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Diagnóstico Estrutural de Gargalo (Problem-First)</h3>
              <p className="investment-lab-subtitle">
                O problema de processo deve ser rigorosamente documentado antes de propor aquisições de ativos.
              </p>
            </div>
            <span className="badge-tag badge-recurrent" style={{ fontSize: '0.85rem' }}>
              Status: {currentCase.status}
            </span>
          </div>

          <div className="grid-two-columns">
            <div className="info-box-dark">
              <h4>🎯 Declaração Formal do Problema</h4>
              <p style={{ fontStyle: 'italic', color: '#f0f6fc', fontSize: '0.95rem' }}>
                "{currentCase.problemStatement}"
              </p>
              <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#8b949e' }}>
                • Tipo de Capacidade: <strong>{currentCase.capabilityType}</strong><br />
                • Causa Raiz Diagnosticada: <strong>{currentCase.rootConstraint}</strong><br />
                • Empresa Titular: <strong>{currentCase.companyId === 'veeluen' ? 'Veeluen Solutions' : 'Excelência Ambiental'}</strong>
              </div>
            </div>

            <div className="info-box-dark">
              <h4>🔍 Vínculo com Objetivo Estratégico</h4>
              <p>
                Este caso está atrelado à meta corporativa de expansão em serviços ambientais e óleo & gás (Código: <code>{currentCase.strategicObjectiveId}</code>).
              </p>
              <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#c084fc' }}>
                Prioridade de Capital: <strong>{currentCase.capitalPriority}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSPECTIVE 2: EVIDENCE */}
      {activeTab === 'evidence' && (
        <div className="perspective-card">
          <h3>Evidências Empíricas de Recorrência de Gargalos</h3>
          <p className="investment-lab-subtitle">
            Sinais operacionais auditados nos últimos 12 meses, segregando gargalos recorrentes de incidentes isolados ou falhas de processo.
          </p>

          <div className="signals-list">
            {signals.map(sig => (
              <div
                key={sig.id}
                className={`signal-card ${sig.frequency === 1 ? 'isolated' : ''} ${sig.rootConstraint === RootConstraintType.SCHEDULING_ISSUE ? 'scheduling' : ''}`}
              >
                <div className="signal-top">
                  <span className="signal-title">{sig.title}</span>
                  <span className={`badge-tag ${sig.frequency >= 3 ? 'badge-recurrent' : sig.frequency === 1 ? 'badge-isolated' : 'badge-process'}`}>
                    {sig.frequency >= 3 ? 'Gargalo Recorrente' : sig.frequency === 1 ? 'Incidente Isolado' : 'Problema de Processo'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                  <span>📅 Período: <strong>{sig.period}</strong></span>
                  <span>🔄 Frequência: <strong>{sig.frequency} certames</strong></span>
                  <span>💼 Pipeline Afetado: <strong style={{ color: '#38bdf8' }}>R$ {(sig.pipelineValueAffected / 1000000).toFixed(2)}M</strong></span>
                  <span>⚙️ Ocupação do Ativo Atual: <strong>{sig.currentAssetUtilizationPct !== null ? `${sig.currentAssetUtilizationPct}%` : 'N/A'}</strong></span>
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: '#c9d1d9' }}>
                  {sig.strategicRelevance}
                </p>

                {sig.affectedOpportunities.length > 0 && (
                  <div style={{ background: '#0d1117', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#8b949e' }}>
                    <strong>Certames Afetados:</strong> {sig.affectedOpportunities.map(o => `${o.buyer} (${o.id})`).join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERSPECTIVE 3: DEMAND */}
      {activeTab === 'demand' && (
        <div className="perspective-card">
          <h3>Sustentabilidade da Demanda & Ocupação de Ativos</h3>
          <p className="investment-lab-subtitle">
            Avaliando se a demanda observada é sustentável no médio prazo antes de imobilizar capital.
          </p>

          <div className="grid-two-columns">
            <div className="info-box-dark">
              <h4>📊 Camadas de Demanda Observada</h4>
              <p>• <strong>Demanda Contratual Garantida:</strong> 15 dias/mês no Contrato Petrobras REDUC.</p>
              <p>• <strong>Demanda em Propostas Enviadas (Expected):</strong> 14 dias/mês disputados em certames com alta aderência.</p>
              <p>• <strong>Demanda Projetada em Pipeline (Potential):</strong> 8 certames mapeados para 2027.</p>
              <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#4ade80' }}>
                Conclusão: A demanda é persistente há 12 meses e justifica estrutura dedicada.
              </div>
            </div>

            <div className="info-box-dark">
              <h4>⚙️ Análise de Ociosidade & Eficiência</h4>
              <p>
                O espectrômetro óptico atual opera com <strong>88% de taxa de ocupação</strong> média. A capacidade instalada não possui margem para absorver novos contratos sem risco de atraso ou multas.
              </p>
              <div style={{ marginTop: '8px', fontSize: '0.82rem', color: '#f59e0b' }}>
                Nota de Auditoria: Em contrapartida, o caminhão vácuo opera com apenas 28% de ocupação; nesse caso, o investimento em novo caminhão foi vetado pelo motor até que a escala de motoristas seja corrigida.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSPECTIVE 4: OPTIONS (COMPARISON OF ALTERNATIVES) */}
      {activeTab === 'options' && (
        <div className="perspective-card">
          <h3>Alternativas Prescritivas de Expansão (Options)</h3>
          <p className="investment-lab-subtitle">
            Comparação estruturada entre Buy, Rent, Partner e Do Nothing com fontes de custo auditáveis.
          </p>

          <div className="options-comparison-grid">
            {currentCase.options.map(opt => (
              <div
                key={opt.id}
                className={`expansion-card ${opt.isMostBalanced ? 'most-balanced' : ''}`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge-tag" style={{ background: '#21262d', color: '#c9d1d9' }}>{opt.type}</span>
                    {opt.isMostBalanced && (
                      <span className="badge-tag" style={{ background: 'rgba(192, 132, 252, 0.2)', color: '#c084fc' }}>
                        Recomendação Equilibrada
                      </span>
                    )}
                  </div>
                  <h4 className="expansion-title">{opt.title}</h4>
                  <p style={{ fontSize: '0.84rem', color: '#8b949e', margin: '0 0 12px 0', lineHeight: '1.45' }}>
                    {opt.description}
                  </p>

                  <div className="metrics-summary-table">
                    {hasFinancial && (
                      <>
                        <div className="metrics-row">
                          <span className="k">Investimento Inicial (Upfront):</span>
                          <span className="v">{opt.estimatedCost.upfront > 0 ? `R$ ${opt.estimatedCost.upfront.toLocaleString('pt-BR')}` : 'R$ 0'}</span>
                        </div>
                        <div className="metrics-row">
                          <span className="k">Custo por Utilização / Anual:</span>
                          <span className="v">
                            {opt.estimatedCost.variablePerUse > 0 
                              ? `R$ ${opt.estimatedCost.variablePerUse.toLocaleString('pt-BR')} / uso` 
                              : opt.estimatedCost.recurringAnnual > 0 
                                ? `R$ ${opt.estimatedCost.recurringAnnual.toLocaleString('pt-BR')} / ano` 
                                : 'R$ 0'}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="metrics-row">
                      <span className="k">Prazo de Disponibilização (Lead Time):</span>
                      <span className="v">{opt.leadTimeDays} dias</span>
                    </div>
                    <div className="metrics-row">
                      <span className="k">Ganho de Capacidade:</span>
                      <span className="v" style={{ color: '#38bdf8' }}>{opt.capacityGain}</span>
                    </div>
                    {hasFinancial && opt.breakEvenUses && (
                      <div className="metrics-row">
                        <span className="k">Ponto de Equilíbrio (Break-Even):</span>
                        <span className="v" style={{ color: '#4ade80' }}>{opt.breakEvenUses} utilizações</span>
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#fdba74', margin: '12px 0 0 0' }}>
                    ⚠️ <strong>Riscos Observados:</strong> {opt.risks}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #30363d', paddingTop: '12px', fontSize: '0.8rem', color: '#c9d1d9' }}>
                  <strong>Trade-off:</strong> {opt.tradeOffNotes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERSPECTIVE 5: SCENARIOS & BREAK-EVEN */}
      {activeTab === 'scenarios' && (
        <div className="perspective-card">
          <h3>Simulador de Cenários de Investimento & Break-Even</h3>
          <p className="investment-lab-subtitle">
            Modelagem comparativa entre Capex próprio, Opex de locação comercial e o impacto de não expandir.
          </p>

          <div className="grid-two-columns">
            <div className="info-box-dark">
              <h4>📈 Análise de Ponto de Equilíbrio (Buy vs Rent)</h4>
              <p>
                • Custo de Aquisição com calibração inicial: <strong>R$ 160.000</strong><br />
                • Custo médio de locação comercial por certame: <strong>R$ 15.000</strong><br />
                • Break-even matemático: <strong>11 utilizações em campo</strong>.
              </p>
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#86efac' }}>
                💡 <em>Com o ritmo atual de 8 certames anuais de refino, o investimento próprio se paga em aproximadamente 16 meses de operação contínua.</em>
              </div>
            </div>

            <div className="info-box-dark">
              <h4>⚖️ Avaliação do Cenário "Do Nothing" (Não Investir)</h4>
              <p>
                Manter o parque de equipamentos inalterado evita o desembolso de R$ 160.000, porém impõe teto de capacidade que obriga a declinar ou perder pelo menos 3 a 4 certames simultâneos por ano, além de transferir R$ 60.000 anuais a locadores terceirizados.
              </p>
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#fca5a5' }}>
                ⚠️ Risco Estratégico: Perda de relevância competitiva frente a concorrentes com instrumentação própria na Bacia de Campos e SP.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSPECTIVE 6: OUTCOME (POST-INVESTMENT REVIEWS) */}
      {activeTab === 'outcome' && (
        <div className="perspective-card">
          <h3>Revisão de Resultados Pós-Investimento (Post-Investment Review)</h3>
          <p className="investment-lab-subtitle">
            Auditoria de investimentos aprovados no passado após 3, 6 e 12 meses de operação para verificar se as premissas de capacidade e utilização se confirmaram.
          </p>

          <table className="outcomes-table">
            <thead>
              <tr>
                <th>Caso / Ativo Avaliado</th>
                <th>Janela de Revisão</th>
                <th>Impacto Real na Capacidade</th>
                <th>Ocupação Observada</th>
                <th>Certames Vencidos</th>
                <th>Premissas Validadas?</th>
              </tr>
            </thead>
            <tbody>
              {outcomes.map(out => (
                <tr key={out.id}>
                  <td><strong>{out.caseTitle}</strong></td>
                  <td>{out.reviewPeriod}</td>
                  <td>{out.capacityImpact}</td>
                  <td><strong>{out.utilizationObservedPct}%</strong></td>
                  <td><span style={{ color: '#4ade80', fontWeight: '700' }}>{out.affectedOpportunitiesWonCount} certames</span></td>
                  <td>
                    <span className="badge-tag" style={{ background: out.assumptionsValidated ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: out.assumptionsValidated ? '#4ade80' : '#f87171' }}>
                      {out.assumptionsValidated ? 'Sim (Confirmadas)' : 'Não (Desvio)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CapabilityInvestmentLabView;
