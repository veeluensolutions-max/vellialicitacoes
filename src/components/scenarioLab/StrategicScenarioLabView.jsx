import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  BarChart2,
  Users,
  Percent,
  Compass,
  Plus,
  Play,
  RotateCcw,
  Shield,
  FileText,
  DollarSign,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  ScenarioSimulationEngine,
  ScenarioType,
  AssumptionType
} from '../../services/simulation/scenarioSimulationEngine';
import { StrategicMemoryService } from '../../services/decision/strategicMemoryService';
import './StrategicScenarioLabView.css';

export default function StrategicScenarioLabView({ userRole = 'ADMIN', hasFinancialAccess = true }) {
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [viewMode, setViewMode] = useState('detail'); // 'detail' ou 'comparison'
  
  // Copilot
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState(null);

  // Modal Novo Cenário
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scenarioType: ScenarioType.PIPELINE,
    assumptionType: AssumptionType.WON,
    targetOpportunity: 'OPP-01',
    notes: ''
  });

  useEffect(() => {
    loadScenarios();
  }, [selectedCompany]);

  const loadScenarios = () => {
    const list = ScenarioSimulationEngine.getScenarios(selectedCompany);
    setScenarios(list);
    if (list.length > 0 && !activeScenario) {
      handleSelectScenario(list[0]);
    } else if (activeScenario) {
      const refreshed = ScenarioSimulationEngine.getScenarioById(activeScenario.id);
      setActiveScenario(refreshed);
    }

    // Carrega comparação inicial
    if (list.length >= 2) {
      const comp = ScenarioSimulationEngine.compareScenarios(list.slice(0, 3).map(s => s.id));
      setComparisonData(comp);
    }
  };

  const handleSelectScenario = (scen) => {
    const full = ScenarioSimulationEngine.getScenarioById(scen.id);
    setActiveScenario(full);
  };

  const handleQuickStressTest = (type) => {
    if (type === 'LOSE_TOP') {
      const newScen = ScenarioSimulationEngine.createScenario({
        companyId: selectedCompany === 'ALL' ? 'Veeluen Solutions' : selectedCompany,
        name: 'Estresse: Perda da Oportunidade Copasa ETE',
        description: 'Simula a perda da maior oportunidade atual e o impacto em concentração e pipeline.',
        scenarioType: ScenarioType.PIPELINE,
        assumptions: [
          {
            id: `ASS-${Date.now()}`,
            type: AssumptionType.LOST,
            targetEntity: 'OPP-02',
            parameter: 'status',
            baseValue: 'QUALIFIED',
            scenarioValue: 'LOST',
            source: 'Stress Test Automático',
            confidence: 'HIGH',
            notes: 'Cenário hipotético de perda para concorrente.'
          }
        ]
      });
      loadScenarios();
      setActiveScenario(newScen);
    } else if (type === 'WIN_TOP_3') {
      const newScen = ScenarioSimulationEngine.createScenario({
        companyId: selectedCompany === 'ALL' ? 'Veeluen Solutions' : selectedCompany,
        name: 'Tração Máxima: Vitória no Top 3 Certames',
        description: 'Simula vitória simultânea em Sabesp, Copasa e Petrobras.',
        scenarioType: ScenarioType.CAPACITY,
        assumptions: [
          { id: `ASS-1`, type: AssumptionType.WON, targetEntity: 'OPP-01', parameter: 'status', scenarioValue: 'WON' },
          { id: `ASS-2`, type: AssumptionType.WON, targetEntity: 'OPP-02', parameter: 'status', scenarioValue: 'WON' },
          { id: `ASS-3`, type: AssumptionType.WON, targetEntity: 'OPP-03', parameter: 'status', scenarioValue: 'WON' }
        ]
      });
      loadScenarios();
      setActiveScenario(newScen);
    } else if (type === 'COST_SHOCK') {
      const newScen = ScenarioSimulationEngine.createScenario({
        companyId: selectedCompany === 'ALL' ? 'Excelência Gestão' : selectedCompany,
        name: 'Choque de Custos: Laboratório +15%',
        description: 'Simula inflação de custos em terceirizados de ensaios e calibração.',
        scenarioType: ScenarioType.MARGIN,
        assumptions: [
          { id: `ASS-CS`, type: AssumptionType.COST_CHANGE, targetEntity: 'ALL_PROPOSALS', parameter: 'subcontractorCost', scenarioValue: '+15%' }
        ]
      });
      loadScenarios();
      setActiveScenario(newScen);
    }
  };

  const handleFormalizeDecision = () => {
    if (!activeScenario) return;
    const confirmAction = window.confirm(
      `Deseja formalizar uma Decisão Estratégica na Memória Institucional baseada no cenário "${activeScenario.name}"?`
    );
    if (!confirmAction) return;

    try {
      StrategicMemoryService.recordDecision({
        companyId: activeScenario.companyId,
        title: `Decisão Estratégica derivada do Cenário ${activeScenario.id}`,
        decisionType: 'STRATEGIC_PRIORITY',
        reason: `Deliberação baseada nas simulações do Laboratório de Cenários (${activeScenario.name}). ${activeScenario.results?.tradeOffSummary || ''}`,
        primaryReasonCode: 'VALOR_ESTRATEGICO',
        decidedBy: 'Diretoria / Comitê de Estratégia',
        context: {
          opportunityValue: activeScenario.results?.metrics?.pipelineWeighted?.scenario || 0,
          margin: activeScenario.results?.metrics?.averageMarginPct?.scenario || 18.0,
          buyer: 'Geral / Planejamento',
          serviceType: 'Simulação Estratégica'
        },
        assumptions: (activeScenario.assumptions || []).map(a => ({
          assumption: `${a.type} em ${a.targetEntity} (${a.scenarioValue})`,
          source: `Laboratório de Cenários (Fase 56)`
        }))
      });
      alert('Decisão Estratégica formalizada com sucesso na Memória Estratégica (Fase 55)!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAskCopilot = (preset) => {
    const q = preset || copilotQuery;
    if (!q) return;
    const res = ScenarioSimulationEngine.askScenarioCopilot(q, activeScenario);
    setCopilotResponse(res);
    setCopilotQuery(q);
  };

  const handleCreateCustomScenario = (e) => {
    e.preventDefault();
    const newScen = ScenarioSimulationEngine.createScenario({
      companyId: selectedCompany === 'ALL' ? 'Veeluen Solutions' : selectedCompany,
      name: formData.name,
      description: formData.description,
      scenarioType: formData.scenarioType,
      assumptions: [
        {
          id: `ASS-CUSTOM-${Date.now()}`,
          type: formData.assumptionType,
          targetEntity: formData.targetOpportunity,
          parameter: 'status',
          scenarioValue: formData.assumptionType,
          source: 'Entrada Manual de Simulação',
          confidence: 'HIGH',
          notes: formData.notes
        }
      ]
    });
    setShowModal(false);
    loadScenarios();
    setActiveScenario(newScen);
  };

  const metrics = activeScenario?.results?.metrics;

  return (
    <div className="scenario-lab-container">
      {/* BANNER MANDATÓRIO DE SANDBOX */}
      <div className="sandbox-alert-banner">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="sandbox-badge">Ambiente Sandbox</span>
          <span>
            <strong>Simulação Estratégica Hipotética:</strong> Nenhum dado real, contrato, proposta ou forecast oficial é alterado nesta área.
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          Snapshot Base: {activeScenario?.results?.baseSnapshotId || 'SNAP-BASE-2026-10-19'}
        </span>
      </div>

      {/* HEADER DO LABORATÓRIO */}
      <header className="lab-header">
        <div>
          <div className="lab-title-row">
            <h1><Layers size={26} color="#38bdf8" /> Strategic Scenario Lab & Digital Twin</h1>
          </div>
          <p className="lab-subtitle">
            Simulador preditivo em Sandbox: teste decisões, avalie impactos em cascata e descubra gargalos antes de comprometer a operação.
          </p>
        </div>

        <div className="lab-actions">
          <select
            className="lab-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="ALL">Grupo Consolidado</option>
            <option value="Veeluen Solutions">Veeluen Solutions</option>
            <option value="Excelência Gestão">Excelência Gestão</option>
          </select>

          <button
            className="btn-lab-primary"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Novo Cenário Sandbox
          </button>
        </div>
      </header>

      {/* STRIP DE QUICK SCENARIOS (STRESS TESTS) */}
      <div className="quick-scenarios-strip">
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', alignSelf: 'center', fontWeight: '600' }}>
          Simulações Rápidas:
        </span>
        <button className="quick-chip-btn" onClick={() => handleQuickStressTest('LOSE_TOP')}>
          💥 Perder Maior Oportunidade
        </button>
        <button className="quick-chip-btn" onClick={() => handleQuickStressTest('WIN_TOP_3')}>
          🏆 Ganhar Top 3 Simultaneamente
        </button>
        <button className="quick-chip-btn" onClick={() => handleQuickStressTest('COST_SHOCK')}>
          📈 Laboratório/Insumos +15%
        </button>
        <button
          className="quick-chip-btn"
          style={{ marginLeft: 'auto', background: viewMode === 'comparison' ? '#0284c7' : 'rgba(30, 41, 59, 0.6)' }}
          onClick={() => setViewMode(viewMode === 'detail' ? 'comparison' : 'detail')}
        >
          {viewMode === 'detail' ? '📊 Comparar Cenários Lado a Lado' : '🔍 Voltar ao Detalhe'}
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL: DETALHE OU COMPARAÇÃO */}
      {viewMode === 'detail' ? (
        <div className="lab-grid">
          {/* COLUNA 1: SELETOR DE CENÁRIOS SALVOS */}
          <div className="lab-card">
            <div className="lab-card-header">
              <h3><Compass size={18} /> Cenários em Sandbox ({scenarios.length})</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scenarios.map(s => (
                <div
                  key={s.id}
                  className={`scenario-item-card ${activeScenario?.id === s.id ? 'active' : ''}`}
                  onClick={() => handleSelectScenario(s)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="scenario-type-tag">{s.scenarioType.replace('_SCENARIO', '')}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{s.horizon}</span>
                  </div>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{s.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUNA 2: RESULTADOS DO CENÁRIO ATIVO: BASE vs CENÁRIO vs DELTA */}
          <div className="lab-card">
            {activeScenario && metrics ? (
              <>
                <div className="lab-card-header">
                  <div>
                    <h3 style={{ color: '#38bdf8' }}>{activeScenario.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Horizonte: {activeScenario.horizon} • Criado por {activeScenario.createdBy}
                    </span>
                  </div>
                  <button
                    className="btn-lab-primary"
                    style={{ background: '#10b981', fontSize: '0.75rem' }}
                    onClick={handleFormalizeDecision}
                    title="Registrar decisão formal na Fase 55"
                  >
                    <Shield size={14} /> Formalizar Decisão Estratégica
                  </button>
                </div>

                {/* PAINEL DE TRADE-OFF */}
                <div className="trade-off-banner">
                  <strong>Análise de Trade-Off:</strong> {activeScenario.results?.tradeOffSummary}
                </div>

                {/* GRID DE COMPARAÇÃO DE MÉTRICAS */}
                <div className="comparison-metrics-grid">
                  {/* PIPELINE PONDERADO */}
                  <div className="metric-comparison-box">
                    <span className="lbl">Pipeline Ponderado</span>
                    <span className="scenario-val">
                      R$ {(metrics.pipelineWeighted.scenario / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                    </span>
                    <span className="sub-comparison">
                      Base: R$ {(metrics.pipelineWeighted.base / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                    </span>
                    <span className={`delta-pill ${metrics.pipelineWeighted.delta >= 0 ? 'pos' : 'neg'}`}>
                      {metrics.pipelineWeighted.delta >= 0 ? '+' : ''}
                      R$ {(metrics.pipelineWeighted.delta / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k
                    </span>
                  </div>

                  {/* MARGEM MÉDIA */}
                  {hasFinancialAccess && (
                    <div className="metric-comparison-box">
                      <span className="lbl">Margem Média Projetada</span>
                      <span className="scenario-val">{metrics.averageMarginPct.scenario}%</span>
                      <span className="sub-comparison">Base: {metrics.averageMarginPct.base}%</span>
                      <span className={`delta-pill ${metrics.averageMarginPct.delta >= 0 ? 'pos' : 'neg'}`}>
                        {metrics.averageMarginPct.delta >= 0 ? '+' : ''}
                        {metrics.averageMarginPct.delta.toFixed(1)} p.p.
                      </span>
                    </div>
                  )}

                  {/* CONCENTRAÇÃO */}
                  <div className="metric-comparison-box">
                    <span className="lbl">Concentração ({metrics.topBuyerConcentration.buyerName})</span>
                    <span className="scenario-val">{metrics.topBuyerConcentration.scenario}%</span>
                    <span className="sub-comparison">Base: {metrics.topBuyerConcentration.base}%</span>
                    <span className={`delta-pill ${metrics.topBuyerConcentration.delta <= 0 ? 'pos' : 'neg'}`}>
                      {metrics.topBuyerConcentration.delta >= 0 ? '+' : ''}
                      {metrics.topBuyerConcentration.delta.toFixed(1)} p.p.
                    </span>
                  </div>

                  {/* CARGA DE CAPACIDADE */}
                  <div className="metric-comparison-box">
                    <span className="lbl">Carga de Equipe de Campo</span>
                    <span className="scenario-val">
                      {metrics.capacityLoad.scenarioEngineersRequired} Engenheiros
                    </span>
                    <span className="sub-comparison">
                      Disponíveis: {metrics.capacityLoad.baseEngineersFree} adicionais
                    </span>
                    <span className={`delta-pill ${metrics.capacityLoad.engineerGap === 0 ? 'pos' : 'neg'}`}>
                      {metrics.capacityLoad.engineerGap > 0 ? `Gap: -${metrics.capacityLoad.engineerGap} Eng.` : 'Capacidade Adequada'}
                    </span>
                  </div>
                </div>

                {/* CONSTRAINTS DETECTADAS */}
                {activeScenario.results?.detectedConstraints?.length > 0 && (
                  <div className="constraint-alert-box">
                    <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={16} /> Gargalos e Restrições Detectadas:
                    </div>
                    {activeScenario.results.detectedConstraints.map((c, idx) => (
                      <div key={idx}>• {c}</div>
                    ))}
                  </div>
                )}

                {/* OPÇÕES DE MITIGAÇÃO */}
                {activeScenario.results?.mitigationOptions?.length > 0 && (
                  <div style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '12px', borderRadius: '8px', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                      Opções Práticas de Mitigação:
                    </div>
                    {activeScenario.results.mitigationOptions.map((opt, i) => (
                      <div key={i} style={{ color: '#cbd5e1' }}>→ {opt}</div>
                    ))}
                  </div>
                )}

                {/* PREMISSAS UTILIZADAS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: '600' }}>
                    Premissas Injetadas na Simulação ({activeScenario.assumptions?.length || 0}):
                  </span>
                  <div className="assumptions-pill-list">
                    {activeScenario.assumptions?.map(ass => (
                      <div key={ass.id} className="assumption-pill-item">
                        <span><strong>{ass.type}:</strong> {ass.targetEntity}</span>
                        <span style={{ color: '#38bdf8' }}>{ass.scenarioValue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>
                Selecione um cenário para visualizar os resultados determinísticos do Digital Twin.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VISÃO DE COMPARAÇÃO LADO A LADO */
        <div className="lab-card">
          <div className="lab-card-header">
            <h3><BarChart2 size={18} color="#38bdf8" /> Comparação Multidimensional Lado a Lado</h3>
          </div>
          {comparisonData ? (
            <table className="side-by-side-table">
              <thead>
                <tr>
                  <th>Dimensão</th>
                  <th>Snapshot Base</th>
                  {comparisonData.comparisons.map(c => (
                    <th key={c.id}>
                      {c.name}
                      {c.isBalanced && <span className="badge-balanced" style={{ marginLeft: '6px' }}>Mais Equilibrado</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pipeline Ponderado</strong></td>
                  <td>R$ {(comparisonData.baseSnapshot.pipeline.weightedValue / 1000).toLocaleString('pt-BR')}k</td>
                  {comparisonData.comparisons.map(c => (
                    <td key={c.id}>
                      R$ {(c.results?.metrics?.pipelineWeighted?.scenario / 1000).toLocaleString('pt-BR')}k
                    </td>
                  ))}
                </tr>
                {hasFinancialAccess && (
                  <tr>
                    <td><strong>Margem Média</strong></td>
                    <td>{comparisonData.baseSnapshot.pipeline.averageMarginPct}%</td>
                    {comparisonData.comparisons.map(c => (
                      <td key={c.id}>{c.results?.metrics?.averageMarginPct?.scenario}%</td>
                    ))}
                  </tr>
                )}
                <tr>
                  <td><strong>Concentração Top Comprador</strong></td>
                  <td>{comparisonData.baseSnapshot.concentration.topBuyerSharePct}%</td>
                  {comparisonData.comparisons.map(c => (
                    <td key={c.id}>{c.results?.metrics?.topBuyerConcentration?.scenario}%</td>
                  ))}
                </tr>
                <tr>
                  <td><strong>Gargalo de Equipe (Gap)</strong></td>
                  <td>0 Engenheiros</td>
                  {comparisonData.comparisons.map(c => (
                    <td key={c.id} style={{ color: c.results?.metrics?.capacityLoad?.engineerGap > 0 ? '#f87171' : '#34d399' }}>
                      {c.results?.metrics?.capacityLoad?.engineerGap > 0
                        ? `-${c.results.metrics.capacityLoad.engineerGap} Eng.`
                        : 'Sem Gargalo'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#64748b' }}>Carregando dados comparativos...</p>
          )}
        </div>
      )}

      {/* COPILOT DE CENÁRIOS */}
      <div className="lab-card">
        <div className="lab-card-header">
          <h3><Sparkles size={18} color="#60a5fa" /> Copilot do Scenario Lab (Simulações em Linguagem Natural)</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button className="quick-chip-btn" onClick={() => handleAskCopilot('E se perdermos as três maiores oportunidades?')}>
              E se perdermos as 3 maiores?
            </button>
            <button className="quick-chip-btn" onClick={() => handleAskCopilot('E se ganharmos o Top 3 ao mesmo tempo?')}>
              E se ganharmos o Top 3?
            </button>
            <button className="quick-chip-btn" onClick={() => handleAskCopilot('Qual o impacto de aumento de 15% em fornecedor?')}>
              Impacto de +15% em fornecedores?
            </button>
          </div>

          {copilotResponse && (
            <div style={{ background: '#1e293b', borderLeft: '3px solid #0284c7', borderRadius: '6px', padding: '14px', fontSize: '0.85rem', lineHeight: '1.45' }}>
              <div><strong>Resposta Hipotética:</strong> {copilotResponse.answer}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Evidência: {copilotResponse.evidence}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NOVO CENÁRIO */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form
            onSubmit={handleCreateCustomScenario}
            style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', width: '480px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <h3 style={{ margin: 0, color: '#fff' }}>Criar Novo Cenário em Sandbox</h3>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Nome do Cenário:</label>
              <input
                required
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                placeholder="Ex: Expansão Acelerada Sul"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Descrição / Hipótese:</label>
              <textarea
                rows="2"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                placeholder="O que este cenário pretende avaliar?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tipo de Premissa:</label>
                <select
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                  value={formData.assumptionType}
                  onChange={(e) => setFormData({ ...formData, assumptionType: e.target.value })}
                >
                  <option value={AssumptionType.WON}>Vitória Hipotética (WON)</option>
                  <option value={AssumptionType.LOST}>Perda Hipotética (LOST)</option>
                  <option value={AssumptionType.COST_CHANGE}>Variação de Custo (+15%)</option>
                  <option value={AssumptionType.CANCELLED}>Cancelamento</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Oportunidade Alvo:</label>
                <select
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                  value={formData.targetOpportunity}
                  onChange={(e) => setFormData({ ...formData, targetOpportunity: e.target.value })}
                >
                  <option value="OPP-01">Sabesp EEE (R$ 1.2M)</option>
                  <option value="OPP-02">Copasa ETE (R$ 1.8M)</option>
                  <option value="OPP-03">Petrobras RPBC (R$ 950k)</option>
                  <option value="OPP-04">Portos de Santos (R$ 720k)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="quick-chip-btn"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-lab-primary">
                Executar Simulação Sandbox
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
