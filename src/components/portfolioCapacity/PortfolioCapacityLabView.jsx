import React, { useState } from 'react';
import './PortfolioCapacityLabView.css';
import {
  initialResources,
  initialResourceCapacities,
  initialResourceDemands,
  initialCapacityConflicts,
  initialPortfolioScenarios
} from '../../services/portfolioCapacity/portfolioCapacityData';
import {
  portfolioTradeoffEngine
} from '../../services/portfolioCapacity/portfolioTradeoffEngine';
import {
  ResourcePressureLevel,
  OpportunityPriorityTier,
  TradeoffObjective
} from '../../services/portfolioCapacity/portfolioCapacityModels';

export const PortfolioCapacityLabView = ({ currentUser = { role: 'ADMIN', permissions: ['capacity_portfolio.view', 'capacity_portfolio.manage', 'capacity_financial.view'] } }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview | resources | conflicts | scenarios | decisions
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [scenarios, setScenarios] = useState(initialPortfolioScenarios);
  const [conflicts, setConflicts] = useState(initialCapacityConflicts);
  const [notification, setNotification] = useState('');

  const hasFinancial = currentUser.permissions?.includes('capacity_financial.view') || currentUser.role === 'ADMIN';

  // Handler de Priorização Humana
  const handlePrioritizeOpportunity = (oppTitle) => {
    setNotification(`Decisão registrada: "${oppTitle}" priorizada pelo comitê. Conflito mitigado via ajuste de cronograma.`);
    setTimeout(() => setNotification(''), 4500);
  };

  // Handler de Seleção de Cenário
  const handleSelectScenario = (scen) => {
    setNotification(`Cenário "${scen.name}" ativado como diretriz de planejamento para o mês.`);
    setTimeout(() => setNotification(''), 4500);
  };

  const getPressureBadge = (level) => {
    switch (level) {
      case ResourcePressureLevel.CRITICAL:
        return <span style={{ color: '#f87171', fontWeight: '700' }}>Crítica / Sobrecarga</span>;
      case ResourcePressureLevel.STRESSED:
        return <span style={{ color: '#fb923c', fontWeight: '700' }}>Sob Tensão</span>;
      case ResourcePressureLevel.BALANCED:
        return <span style={{ color: '#facc15', fontWeight: '700' }}>Equilibrada</span>;
      default:
        return <span style={{ color: '#4ade80', fontWeight: '700' }}>Folga Operacional</span>;
    }
  };

  return (
    <div className="capacity-lab-container">
      {/* Header */}
      <div className="capacity-lab-header">
        <div>
          <span className="phase-tag">Fase 68 — Portfolio Capacity & Trade-Offs</span>
          <h2>Capacidade Estratégica & Otimização de Portfólio</h2>
          <p className="capacity-lab-subtitle">
            Avaliação integrada de capacidade multi-oportunidades: garantindo que os contratos ativos sejam blindados e que a expansão comercial caiba na estrutura real da empresa.
          </p>
        </div>
        <div className="portfolio-guardrail-banner">
          <span>🛡️</span>
          <div>
            <strong>Princípio de Portfólio:</strong> A melhor oportunidade individual não pode prejudicar o portfólio. Contratos ativos têm precedência absoluta sobre o pipeline.
          </div>
        </div>
      </div>

      {notification && (
        <div className="notification-banner">
          ✅ {notification}
        </div>
      )}

      {/* Filter Bar */}
      <div className="capacity-filter-bar">
        <div className="filter-group">
          <label htmlFor="compFilter"><strong>Empresa / Escopo:</strong></label>
          <select
            id="compFilter"
            value={selectedCompany}
            onChange={e => setSelectedCompany(e.target.value)}
          >
            <option value="all">Visão Consolidada (Grupo Vellia)</option>
            <option value="veeluen">Veeluen Solutions</option>
            <option value="excelencia">Excelência Ambiental</option>
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: '#8b949e' }}>
          Horizonte Operacional: <strong>Novembro / 2026 (Próximos 45 dias)</strong>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="capacity-nav-tabs">
        <button
          className={`capacity-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          1. 📊 Capacity (Camadas de Ocupação)
        </button>
        <button
          className={`capacity-nav-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          2. 👥 Demand (Demandas & Catálogo de Recursos)
        </button>
        <button
          className={`capacity-nav-btn ${activeTab === 'conflicts' ? 'active' : ''}`}
          onClick={() => setActiveTab('conflicts')}
        >
          3. ⚠️ Conflicts (Disputas & Blindagem de Contratos)
        </button>
        <button
          className={`capacity-nav-btn ${activeTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenarios')}
        >
          4. 🧪 Scenarios (Comparador de Trade-Offs)
        </button>
        <button
          className={`capacity-nav-btn ${activeTab === 'decisions' ? 'active' : ''}`}
          onClick={() => setActiveTab('decisions')}
        >
          5. 🎯 Trade-Offs & Decisões Must-Win
        </button>
      </div>

      {/* AREA 1: CAPACITY LAYERS OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="capacity-layers-grid">
            <div className="layer-card layer-committed">
              <span className="layer-title">🔒 Committed (Contratos Ativos)</span>
              <span className="layer-val">190h / 15 dias</span>
              <span className="layer-desc">Capacidade 100% alocada em contratos assinados vigentes (Petrobras e Sabesp).</span>
            </div>
            <div className="layer-card layer-tentative">
              <span className="layer-title">⏳ Tentative (Oportunidades em Disputa)</span>
              <span className="layer-val">105h / 14 dias</span>
              <span className="layer-desc">Reservas provisórias para certames com propostas enviadas ou estágio avançado.</span>
            </div>
            <div className="layer-card layer-buffer">
              <span className="layer-title">🛡️ Buffer de Contingência</span>
              <span className="layer-val">48h / 4 dias</span>
              <span className="layer-desc">Margem de segurança (15%) para emergências, manutenções e atrasos de transporte.</span>
            </div>
            <div className="layer-card layer-available">
              <span className="layer-title">✨ Available (Folga Real)</span>
              <span className="layer-val">25h / 1 dia</span>
              <span className="layer-desc">Capacidade líquida livre para novos projetos no período sem comprometer o buffer.</span>
            </div>
          </div>

          <div className="resources-table-box">
            <h3>Pressão de Recursos no Mês</h3>
            <table className="portfolio-table">
              <thead>
                <tr>
                  <th>Recurso Estratégico</th>
                  <th>Empresa</th>
                  <th>Tipo</th>
                  <th>Capacidade Total</th>
                  <th>Contratos Ativos</th>
                  <th>Pipeline Disputando</th>
                  <th>Nível de Pressão</th>
                </tr>
              </thead>
              <tbody>
                {initialResourceCapacities.map(cap => {
                  const res = initialResources.find(r => r.id === cap.resourceId);
                  return (
                    <tr key={cap.resourceId}>
                      <td><strong>{res?.name}</strong></td>
                      <td>{cap.companyId === 'veeluen' ? 'Veeluen' : 'Excelência'}</td>
                      <td>{res?.type}</td>
                      <td>{cap.totalCapacity} {res?.unit}</td>
                      <td><span style={{ color: '#38bdf8' }}>{cap.committedCapacity} {res?.unit}</span></td>
                      <td><span style={{ color: '#facc15' }}>{cap.tentativeCapacity} {res?.unit}</span></td>
                      <td>{getPressureBadge(cap.pressureLevel)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AREA 2: RESOURCES & DEMAND CATALOG */}
      {activeTab === 'resources' && (
        <div className="resources-table-box">
          <h3>Mapeamento de Demandas por Entidade (Contratos vs Oportunidades)</h3>
          <p className="capacity-lab-subtitle">
            Diferenciação clara entre compromissos contratuais garantidos e cargas potenciais de pipeline.
          </p>

          <table className="portfolio-table">
            <thead>
              <tr>
                <th>Entidade Relacionada</th>
                <th>Tipo</th>
                <th>Prioridade</th>
                <th>Recurso Solicitado</th>
                <th>Período Necessário</th>
                <th>Criticidade</th>
                <th>Status da Demanda</th>
              </tr>
            </thead>
            <tbody>
              {initialResourceDemands.map(dem => {
                const res = initialResources.find(r => r.id === dem.resourceId);
                return (
                  <tr key={dem.id}>
                    <td><strong>{dem.title}</strong></td>
                    <td>
                      <span style={{ 
                        background: dem.relatedEntityType === 'CONTRACT' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: dem.relatedEntityType === 'CONTRACT' ? '#38bdf8' : '#facc15',
                        padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700'
                      }}>
                        {dem.relatedEntityType}
                      </span>
                    </td>
                    <td>{dem.priorityTier || 'Contrato Vigente'}</td>
                    <td>{res?.name}</td>
                    <td>{dem.periodStart} a {dem.periodEnd}</td>
                    <td>{dem.criticality}</td>
                    <td><code>{dem.status}</code></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* AREA 3: CONFLICTS & CONTRACT PROTECTION */}
      {activeTab === 'conflicts' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3>Conflitos de Capacidade Detectados</h3>
            <span className="capacity-lab-subtitle">
              Disputas simultâneas de recursos entre oportunidades de licitação e contratos em execução.
            </span>
          </div>

          <div className="conflicts-grid">
            {conflicts.map(conf => (
              <div key={conf.id} className="conflict-card">
                <div className="conflict-top">
                  <span className="conflict-title">{conf.conflictType}</span>
                  {conf.existingContractAtRisk && (
                    <span className="contract-risk-warning">
                      ⚠️ Contrato Vigente Sob Risco de Prejuízo
                    </span>
                  )}
                </div>

                <p style={{ margin: 0, fontSize: '0.9rem', color: '#c9d1d9' }}>
                  {conf.description}
                </p>

                <div className="entities-dispute-list">
                  <strong>Entidades Envolvidas no Período ({conf.period}):</strong>
                  <ul style={{ margin: '6px 0 0 0', paddingLeft: '20px' }}>
                    {conf.entities.map((e, idx) => (
                      <li key={idx}>
                        <strong>[{e.type}]</strong> {e.title}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mitigations-suggestion-box">
                  <strong>💡 Opções Prescritivas de Mitigação:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {conf.suggestedMitigations.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>• {m.title}</span>
                        <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                          Custo: {m.cost > 0 ? `R$ ${m.cost.toLocaleString('pt-BR')}` : 'R$ 0'} | {m.feasibility}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AREA 4: PORTFOLIO SCENARIOS (TRADE-OFF ENGINE) */}
      {activeTab === 'scenarios' && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3>Comparador de Cenários de Portfólio (Trade-Off Engine)</h3>
            <span className="capacity-lab-subtitle">
              Simulação de combinações de oportunidades comparando volume, rentabilidade e sobrecarga de capacidade.
            </span>
          </div>

          <div className="scenarios-grid">
            {scenarios.map(scen => (
              <div key={scen.id} className={`scenario-card ${scen.id === 'SCEN-BALANCED' ? 'recommended' : ''}`}>
                <div>
                  <div className="scenario-header">
                    <h4>{scen.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                      Oportunidades: {scen.opportunities.join(', ')}
                    </span>
                  </div>

                  <div className="scenario-metrics-list" style={{ marginTop: '12px' }}>
                    <div className="metric-row">
                      <span className="k">Pipeline Total:</span>
                      <span className="v">R$ {(scen.totalPipelineValue / 1000000).toFixed(2)}M</span>
                    </div>
                    {hasFinancial && (
                      <div className="metric-row">
                        <span className="k">Margem Projetada:</span>
                        <span className="v" style={{ color: '#4ade80' }}>
                          R$ {(scen.potentialMarginValue / 1000000).toFixed(2)}M ({scen.potentialMarginPct}%)
                        </span>
                      </div>
                    )}
                    <div className="metric-row">
                      <span className="k">Pressão na Capacidade:</span>
                      <span className="v">{getPressureBadge(scen.capacityPressure)}</span>
                    </div>
                    <div className="metric-row">
                      <span className="k">Custo de Mitigação:</span>
                      <span className="v">
                        {scen.mitigationCost > 0 ? `R$ ${scen.mitigationCost.toLocaleString('pt-BR')}` : 'R$ 0'}
                      </span>
                    </div>
                    <div className="metric-row">
                      <span className="k">Contratos Blindados:</span>
                      <span className="v" style={{ color: scen.contractsProtected ? '#4ade80' : '#f87171' }}>
                        {scen.contractsProtected ? 'Sim (100% Protegidos)' : 'Não (Risco de Multa/Atraso)'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#c9d1d9', marginTop: '12px', lineHeight: '1.45' }}>
                    {scen.tradeoffSummary}
                  </p>
                </div>

                <button className="btn-select-scenario" onClick={() => handleSelectScenario(scen)}>
                  Adotar Este Cenário
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AREA 5: MUST-WIN DECISIONS */}
      {activeTab === 'decisions' && (
        <div className="decisions-split">
          <div className="decision-card">
            <h3>Disputa Direta entre Oportunidades "Must Win"</h3>
            <p className="capacity-lab-subtitle">
              Duas oportunidades de alta prioridade estratégica demandam a mesma equipe e o mesmo equipamento especializado na mesma semana de novembro.
            </p>

            <div style={{ background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>PE 2026/0891 (Petrobras REDUC)</strong>
                <span style={{ color: '#38bdf8' }}>R$ 3.80M • Aderência 91%</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#8b949e', margin: '0 0 12px 0' }}>
                Exige Espectrômetro e Engenheiro NR-13. Relevante para consolidação em óleo & gás.
              </p>
              <button className="btn-prioritize" onClick={() => handlePrioritizeOpportunity('PE 2026/0891 (Petrobras REDUC)')}>
                Priorizar Petrobras REDUC
              </button>
            </div>

            <div style={{ background: '#0d1117', padding: '16px', borderRadius: '8px', border: '1px solid #30363d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>PE 2026/0940 (Sanepar Saneamento)</strong>
                <span style={{ color: '#facc15' }}>R$ 2.45M • Aderência 88%</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#8b949e', margin: '0 0 12px 0' }}>
                Exige o mesmo espectrômetro. Relevante para entrada estratégica no estado do Paraná.
              </p>
              <button className="btn-prioritize" onClick={() => handlePrioritizeOpportunity('PE 2026/0940 (Sanepar Saneamento)')}>
                Priorizar Sanepar Saneamento
              </button>
            </div>
          </div>

          <div className="decision-card">
            <h3>Alternativa de Mitigação: Perseguir Ambas</h3>
            <p className="capacity-lab-subtitle">
              Como viabilizar a participação e execução simultânea sem sacrificar o contrato vigente.
            </p>

            <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#38bdf8' }}>Opção Recomendada pelo Motor:</h5>
              <p style={{ fontSize: '0.85rem', color: '#f0f6fc', lineHeight: '1.45', margin: '0 0 12px 0' }}>
                Locar um segundo espectrômetro óptico portátil calibrado perante o Parceiro Beta por 10 dias (R$ 18.000). 
                Isso destrava a execução simultânea dos dois certames e protege integralmente o Contrato Petrobras ativo.
              </p>
              <button className="btn-select-scenario" onClick={() => handlePrioritizeOpportunity('Ambas com Locação de Espectrômetro')}>
                Autorizar Mitigação e Perseguir Ambas
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#8b949e', marginTop: '12px' }}>
              <strong>Memória Estratégica:</strong> Todas as deliberações registradas são armazenadas na trilha de auditoria para comparar a decisão tomada com o resultado e a margem real de execução.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCapacityLabView;
