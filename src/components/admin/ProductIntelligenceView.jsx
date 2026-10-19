import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  Search,
  Bot,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  Filter,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  Cpu,
  RefreshCw,
  Plus
} from 'lucide-react';
import {
  ProductIntelligenceService,
  BacklogPriority,
  ProductDebtCategory
} from '../../services/intelligence/productIntelligenceService.js';
import './ProductIntelligenceView.css';

export function ProductIntelligenceView({ onNavigate = null }) {
  const [subTab, setSubTab] = useState('telemetria');
  const [events, setEvents] = useState([]);
  const [funnels, setFunnels] = useState(null);
  const [timeInFlow, setTimeInFlow] = useState(null);
  const [clickFriction, setClickFriction] = useState([]);
  const [searchIntel, setSearchIntel] = useState(null);
  const [copilotIntel, setCopilotIntel] = useState(null);
  const [aiQuality, setAiQuality] = useState(null);
  const [alertIntel, setAlertIntel] = useState(null);
  const [featureMatrix, setFeatureMatrix] = useState([]);
  const [productDebts, setProductDebts] = useState([]);
  const [problemBacklog, setProblemBacklog] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [costIntel, setCostIntel] = useState(null);
  const [trustSignals, setTrustSignals] = useState(null);

  // Novo problema modal/form
  const [showNewProbModal, setShowNewProbModal] = useState(false);
  const [newProbDesc, setNewProbDesc] = useState('');
  const [newProbEvidence, setNewProbEvidence] = useState('');
  const [newProbImpact, setNewProbImpact] = useState('MEDIUM');
  const [newProbPriority, setNewProbPriority] = useState(BacklogPriority.NEXT);

  const loadData = () => {
    setEvents(ProductIntelligenceService.getRecentEvents());
    setFunnels(ProductIntelligenceService.getJourneysFunnel());
    setTimeInFlow(ProductIntelligenceService.getTimeInFlowMetrics());
    setClickFriction(ProductIntelligenceService.getClickFrictionMetrics());
    setSearchIntel(ProductIntelligenceService.getSearchIntelligence());
    setCopilotIntel(ProductIntelligenceService.getCopilotIntelligence());
    setAiQuality(ProductIntelligenceService.getAIQualitySegmentation());
    setAlertIntel(ProductIntelligenceService.getAlertIntelligence());
    setFeatureMatrix(ProductIntelligenceService.getFeatureAdoptionMatrix());
    setProductDebts(ProductIntelligenceService.getProductDebts());
    setProblemBacklog(ProductIntelligenceService.getProblemBacklog());
    setExperiments(ProductIntelligenceService.getExperiments());
    setCostIntel(ProductIntelligenceService.getCostIntelligence());
    setTrustSignals(ProductIntelligenceService.getTrustSignals());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProblem = (e) => {
    e.preventDefault();
    if (!newProbDesc.trim()) return;

    ProductIntelligenceService.addProblemToBacklog({
      problem: newProbDesc.trim(),
      evidence: newProbEvidence.trim() || 'Evidência relatada por analista de licitação',
      impact: newProbImpact,
      effort: 'MEDIUM',
      priority: newProbPriority,
      affectedUsers: ['Licitações', 'Gestão']
    });

    setNewProbDesc('');
    setNewProbEvidence('');
    setShowNewProbModal(false);
    loadData();
  };

  return (
    <div className="product-intel-container">
      {/* Header Executivo da Fase 52 */}
      <div className="product-intel-header">
        <div className="header-left">
          <div className="intel-badge-row">
            <span className="intel-pill vellia-version">Vellia 2.1 Baseline</span>
            <span className="intel-pill rule-highlight">Regra: Nenhuma Feature por Intuição</span>
          </div>
          <h2 className="intel-title">Product Intelligence & Otimização por Evidência</h2>
          <p className="intel-subtitle">
            Análise contínua de telemetria, tempos no fluxo (P50/P90), funis de conversão, qualidade de IA e backlog orientado a problemas.
          </p>
        </div>
        <div className="header-right">
          <button className="btn-refresh-intel" onClick={loadData} title="Atualizar dados de telemetria">
            <RefreshCw size={14} />
            <span>Atualizar Métricas</span>
          </button>
        </div>
      </div>

      {/* Navegação entre Subseções */}
      <div className="intel-tabs-bar">
        <button className={`intel-tab-btn ${subTab === 'telemetria' ? 'active' : ''}`} onClick={() => setSubTab('telemetria')}>
          <Activity size={14} />
          <span>Telemetria & Tempos P50/P90</span>
        </button>
        <button className={`intel-tab-btn ${subTab === 'jornadas' ? 'active' : ''}`} onClick={() => setSubTab('jornadas')}>
          <Layers size={14} />
          <span>Jornadas & Funis</span>
        </button>
        <button className={`intel-tab-btn ${subTab === 'busca-copilot' ? 'active' : ''}`} onClick={() => setSubTab('busca-copilot')}>
          <Search size={14} />
          <span>Busca & Copilot</span>
        </button>
        <button className={`intel-tab-btn ${subTab === 'qualidade-ia' ? 'active' : ''}`} onClick={() => setSubTab('qualidade-ia')}>
          <Bot size={14} />
          <span>Qualidade de IA & Alertas</span>
        </button>
        <button className={`intel-tab-btn ${subTab === 'adocao-debt' ? 'active' : ''}`} onClick={() => setSubTab('adocao-debt')}>
          <TrendingUp size={14} />
          <span>Adoção & Product Debt</span>
        </button>
        <button className={`intel-tab-btn ${subTab === 'backlog-experimentos' ? 'active' : ''}`} onClick={() => setSubTab('backlog-experimentos')}>
          <Sparkles size={14} />
          <span>Backlog & Experimentos</span>
        </button>
        <button className={`intel-tab-btn ${subTab === 'custos-confianca' ? 'active' : ''}`} onClick={() => setSubTab('custos-confianca')}>
          <DollarSign size={14} />
          <span>Custos & Sinais de Confiança</span>
        </button>
      </div>

      {/* CONTEÚDO DAS SUBSEÇÕES */}
      <div className="intel-tab-content">
        {/* SUBTAB 1: TELEMETRIA & TEMPOS NO FLUXO (P50/P90) */}
        {subTab === 'telemetria' && (
          <div className="intel-pane">
            <div className="kpi-quad-grid">
              <div className="intel-kpi-card">
                <span className="kpi-label">Oportunidade → Decisão GO (P50)</span>
                <span className="kpi-value text-teal">{timeInFlow?.radarToDecision?.p50Hours}h</span>
                <span className="kpi-subtext">P90: {timeInFlow?.radarToDecision?.p90Hours}h (Média: {timeInFlow?.radarToDecision?.avgHours}h)</span>
                <div className="kpi-tag-success">-{timeInFlow?.radarToDecision?.reductionPct}% vs anterior (48h)</div>
              </div>
              <div className="intel-kpi-card">
                <span className="kpi-label">Time to First Value (1º Login → 1ª Ação)</span>
                <span className="kpi-value text-teal">{timeInFlow?.timeToFirstValue?.p50Minutes} min</span>
                <span className="kpi-subtext">P90: {timeInFlow?.timeToFirstValue?.p90Minutes} min</span>
                <div className="kpi-tag-success">-{timeInFlow?.timeToFirstValue?.reductionPct}% vs anterior (55 min)</div>
              </div>
              <div className="intel-kpi-card">
                <span className="kpi-label">Decisão GO → Proposta Pronta (P50)</span>
                <span className="kpi-value text-teal">{timeInFlow?.decisionToProposal?.p50Hours}h</span>
                <span className="kpi-subtext">P90: {timeInFlow?.decisionToProposal?.p90Hours}h</span>
                <div className="kpi-tag-success">-{timeInFlow?.decisionToProposal?.reductionPct}% vs anterior (96h)</div>
              </div>
              <div className="intel-kpi-card">
                <span className="kpi-label">Extração de Requisitos Editalícios</span>
                <span className="kpi-value text-teal">{timeInFlow?.documentExtractionLatency?.p50Seconds}s</span>
                <span className="kpi-subtext">P90: {timeInFlow?.documentExtractionLatency?.p90Seconds}s</span>
                <div className="kpi-tag-success">Sub-10s em 92% dos editais</div>
              </div>
            </div>

            {/* Fricção de Cliques e Passos */}
            <div className="intel-card">
              <h3 className="card-title">Análise de Passos & Cliques em Tarefas Centrais</h3>
              <p className="card-desc">
                Regra: Não otimizar para "menos cliques" cegamente quando a tarefa envolver aprovação financeira ou risco jurídico de certame.
              </p>
              <div className="table-responsive">
                <table className="intel-table">
                  <thead>
                    <tr>
                      <th>Tarefa Principal</th>
                      <th>Passos Atuais</th>
                      <th>Cliques</th>
                      <th>Exige Confirmação Crítica?</th>
                      <th>Classificação de Fricção</th>
                      <th>Observação de Produto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clickFriction.map((cf, idx) => (
                      <tr key={idx}>
                        <td><strong>{cf.task}</strong></td>
                        <td>{cf.currentSteps} passos</td>
                        <td>{cf.currentClicks} cliques</td>
                        <td>{cf.criticalConfirmationRequired ? <span className="badge-critical">Sim (Obrigatória)</span> : <span className="badge-optional">Não</span>}</td>
                        <td>
                          <span className={`badge-friction ${cf.frictionRating.toLowerCase().replace(/\s+/g, '-')}`}>
                            {cf.frictionRating}
                          </span>
                        </td>
                        <td className="text-muted">{cf.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Eventos Sanitizados Recentes */}
            <div className="intel-card">
              <h3 className="card-title">Eventos Recentes de Telemetria (Sanitizados)</h3>
              <p className="card-desc">
                Registro estritamente livre de dados pessoais, textos digitados, tokens ou documentos sigilosos.
              </p>
              <div className="events-stream-list">
                {events.slice(0, 8).map((evt) => (
                  <div key={evt.id} className="event-stream-item">
                    <span className="evt-dot" />
                    <div className="evt-content">
                      <div className="evt-header-row">
                        <strong>{evt.event}</strong>
                        <span className="evt-time">{new Date(evt.timestamp).toLocaleTimeString('pt-BR')}</span>
                      </div>
                      <span className="evt-meta">
                        Módulo: {evt.module} • Perfil: {evt.userRole} • Empresa: {evt.company}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: JORNADAS & FUNIS */}
        {subTab === 'jornadas' && funnels && (
          <div className="intel-pane">
            {Object.entries(funnels).map(([key, j]) => (
              <div key={key} className="intel-card funnel-card">
                <div className="card-header-row">
                  <div>
                    <h3 className="card-title">{j.name}</h3>
                    <p className="card-desc">{j.description}</p>
                  </div>
                  <span className="funnel-total-badge">Amostra: {j.steps[0]?.entered} entidades</span>
                </div>

                {/* Etapas do Funil */}
                <div className="funnel-steps-grid">
                  {j.steps.map((st, sIdx) => (
                    <div key={sIdx} className="funnel-step-box">
                      <div className="step-num">Etapa {sIdx + 1}</div>
                      <div className="step-title">{st.step}</div>
                      <div className="step-val">{st.completed}</div>
                      <div className="step-conv">{st.conversionRate}% do início</div>
                      {st.dropoff > 0 && (
                        <div className="step-dropoff text-amber">
                          -{st.dropoff} drop-offs
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Diagnóstico de Drop-off */}
                {j.investigation && (
                  <div className="investigation-box">
                    <div className="inv-header">
                      <AlertTriangle size={15} className="text-amber" />
                      <strong>Diagnóstico de Abandono: {j.investigation.mainDropoffStage}</strong>
                    </div>
                    {j.investigation.identifiedReasons ? (
                      <ul className="inv-list">
                        {j.investigation.identifiedReasons.map((r, rIdx) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="inv-desc">{j.investigation.mainDropoffStage}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB 3: BUSCA & COPILOT */}
        {subTab === 'busca-copilot' && (
          <div className="intel-pane">
            <div className="two-columns-grid">
              {/* Search Intelligence */}
              <div className="intel-card">
                <h3 className="card-title">Inteligência de Busca (Search Intelligence)</h3>
                <p className="card-desc">
                  Identifica termos sem resultado para inclusão automática de sinônimos léxicos nos catálogos das empresas.
                </p>

                <div className="kpi-mini-row">
                  <div className="kpi-mini">
                    <span className="lbl">Buscas Realizadas</span>
                    <span className="val">{searchIntel?.totalSearchesMonth}</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="lbl">Taxa de Sucesso</span>
                    <span className="val text-teal">{searchIntel?.searchesWithResultsPct}%</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="lbl">Zero Results</span>
                    <span className="val text-amber">{searchIntel?.zeroResultsPct}%</span>
                  </div>
                </div>

                <h4 className="section-subtitle">Top Termos com "Zero Results" & Ações</h4>
                <div className="zero-terms-list">
                  {searchIntel?.topZeroResultTerms.map((zt, idx) => (
                    <div key={idx} className="zero-term-item">
                      <div>
                        <strong>"{zt.term}"</strong> ({zt.count} buscas)
                        <span className="zt-cat">Categoria: {zt.category}</span>
                      </div>
                      <span className="zt-action">Ação: {zt.actionTaken}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Copilot Intelligence */}
              <div className="intel-card">
                <h3 className="card-title">Copilot Intelligence & Sinais de Valor</h3>
                <p className="card-desc">
                  Mede a utilidade real das respostas: satisfação, categorias mais demandadas e conversão em ações no sistema.
                </p>

                <div className="kpi-mini-row">
                  <div className="kpi-mini">
                    <span className="lbl">Consultas</span>
                    <span className="val">{copilotIntel?.totalQueriesMonth}</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="lbl">Respostas Úteis</span>
                    <span className="val text-teal">{copilotIntel?.userSatisfaction?.helpfulPct}%</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="lbl">Ações Originadas</span>
                    <span className="val text-teal">{copilotIntel?.outcomesGenerated?.navigatedToOpportunityPct}%</span>
                  </div>
                </div>

                <h4 className="section-subtitle">Distribuição por Categoria de Dúvida</h4>
                <div className="category-bars">
                  {copilotIntel?.categories.map((c, idx) => (
                    <div key={idx} className="cat-bar-item">
                      <div className="cat-bar-label">
                        <span>{c.name}</span>
                        <span>{c.sharePct}%</span>
                      </div>
                      <div className="bar-bg">
                        <div className="bar-fill" style={{ width: `${c.sharePct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: QUALIDADE DE IA & ALERTAS */}
        {subTab === 'qualidade-ia' && (
          <div className="intel-pane">
            <div className="intel-card">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Qualidade de IA Segmentada por Serviço Real</h3>
                  <p className="card-desc">
                    Avaliação contínua contra Golden Dataset auditado. Prioridade máxima: Blocker Recall (98%).
                  </p>
                </div>
                <div className="precision-pill-box">
                  <span className="prec-badge">Precisão Geral: {aiQuality?.overallPrecisionPct}%</span>
                  <span className="prec-badge">Recall Geral: {aiQuality?.overallRecallPct}%</span>
                  <span className="prec-badge blocker">Blocker Recall: {aiQuality?.criticalBlockerRecallPct}%</span>
                </div>
              </div>

              <div className="table-responsive">
                <table className="intel-table">
                  <thead>
                    <tr>
                      <th>Especialidade / Serviço</th>
                      <th>Precisão do Matching</th>
                      <th>Cobertura (Recall)</th>
                      <th>Status de Calibração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiQuality?.segments.map((s, idx) => (
                      <tr key={idx}>
                        <td><strong>{s.service}</strong></td>
                        <td>{s.precisionPct}%</td>
                        <td>{s.recallPct}%</td>
                        <td>
                          <span className={`badge-status ${s.status === 'EXCELENTE' ? 'status-green' : 'status-amber'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alert Intelligence & Fatigue */}
            <div className="intel-card">
              <h3 className="card-title">Inteligência de Notificações & Detecção de Alert Fatigue</h3>
              <p className="card-desc">
                Identifica categorias de alertas ignoradas repetidamente para reduzir ruído sem desativar avisos críticos.
              </p>

              <div className="alert-fatigue-box">
                <div className="af-header">
                  <AlertTriangle size={16} className="text-amber" />
                  <strong>Fadiga Detectada: {alertIntel?.fatigueWarningCategory?.category}</strong>
                </div>
                <p className="af-desc">
                  Taxa de Descarte: <strong>{alertIntel?.fatigueWarningCategory?.ignoredPct}%</strong> dispensados sem clique.
                </p>
                <div className="af-recommendation">
                  <strong>Ajuste Recomendado:</strong> {alertIntel?.fatigueWarningCategory?.recommendedTune}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: ADOÇÃO & PRODUCT DEBT */}
        {subTab === 'adocao-debt' && (
          <div className="intel-pane">
            <div className="intel-card">
              <h3 className="card-title">Matriz de Adoção de Features vs Criticidade de Negócio</h3>
              <p className="card-desc">
                Regra: Features com baixo uso mas alta criticidade (ex: Aprovação de Margem, Planejamento Anual) JAMAIS são removidas.
              </p>

              <div className="table-responsive">
                <table className="intel-table">
                  <thead>
                    <tr>
                      <th>Funcionalidade / Módulo</th>
                      <th>Nível de Adoção</th>
                      <th>Criticidade de Negócio</th>
                      <th>Ação Recomendada de Produto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureMatrix.map((f, idx) => (
                      <tr key={idx}>
                        <td><strong>{f.feature}</strong></td>
                        <td>
                          <span className={`badge-adoption ${f.usageLevel.toLowerCase()}`}>
                            {f.usageLevel}
                          </span>
                        </td>
                        <td>{f.businessCriticality}</td>
                        <td className="text-muted">{f.actionRecommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Product Debt (Débitos de Produto) */}
            <div className="intel-card">
              <h3 className="card-title">Catálogo de Product Debt (Débitos de Produto)</h3>
              <p className="card-desc">
                Distingue-se do débito técnico: mapeia fricções de UX, complexidade excessiva e redundâncias de telas.
              </p>

              <div className="debts-list">
                {productDebts.map((d) => (
                  <div key={d.id} className="debt-card-item">
                    <div className="debt-header">
                      <div>
                        <strong>{d.id}</strong> — <span className="debt-cat">{d.category}</span>
                      </div>
                      <span className={`badge-debt-status ${d.status.toLowerCase()}`}>{d.status}</span>
                    </div>
                    <p className="debt-desc">{d.description}</p>
                    <div className="debt-remedy">
                      <span>Solução / Correção:</span> {d.remedy}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 6: BACKLOG DE PROBLEMAS & EXPERIMENTOS */}
        {subTab === 'backlog-experimentos' && (
          <div className="intel-pane">
            <div className="intel-card">
              <div className="card-header-row">
                <div>
                  <h3 className="card-title">Backlog Orientado a Problemas Reais</h3>
                  <p className="card-desc">
                    Estrutura estrita: Toda demanda inicia pelo PROBLEMA e EVIDÊNCIA, nunca pelo campo "Feature".
                  </p>
                </div>
                <button className="btn-add-problem" onClick={() => setShowNewProbModal(true)}>
                  <Plus size={14} />
                  <span>Registrar Problema</span>
                </button>
              </div>

              <div className="problems-list">
                {problemBacklog.map((p) => (
                  <div key={p.id} className={`problem-card-item priority-${p.priority.toLowerCase()}`}>
                    <div className="prob-header">
                      <div className="prob-id-title">
                        <strong>{p.id}</strong> — <span className="prob-prio">{p.priority}</span>
                      </div>
                      <span className={`badge-prob-status ${p.status.toLowerCase()}`}>{p.status}</span>
                    </div>
                    <p className="prob-text">{p.problem}</p>
                    <div className="prob-evidence">
                      <strong>Evidência:</strong> {p.evidence}
                    </div>
                    {p.resolutionNote && (
                      <div className="prob-resolution">
                        <strong>Resolução:</strong> {p.resolutionNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Experimentos Before / After */}
            <div className="intel-card">
              <h3 className="card-title">Histórico de Experimentos Controlados (Before / After)</h3>
              <p className="card-desc">
                Medições comparativas de hipóteses testadas no fluxo real de trabalho dos analistas.
              </p>

              <div className="experiments-grid">
                {experiments.map((exp) => (
                  <div key={exp.id} className="experiment-box">
                    <div className="exp-header">
                      <strong>{exp.name}</strong>
                      <span className="exp-status-pill">{exp.status}</span>
                    </div>
                    <p className="exp-hypo"><em>Hipótese:</em> {exp.hypothesis}</p>
                    <div className="exp-metric-row">
                      <span>Métrica: <strong>{exp.metric}</strong></span>
                    </div>
                    <div className="exp-values-row">
                      <span className="val-before">Antes: {exp.beforeValue}</span>
                      <span className="val-arrow">→</span>
                      <span className="val-after">Depois: {exp.afterValue}</span>
                    </div>
                    <div className="exp-conclusion">{exp.conclusion}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 7: CUSTOS & SINAIS DE CONFIANÇA */}
        {subTab === 'custos-confianca' && (
          <div className="intel-pane">
            <div className="two-columns-grid">
              {/* Cost Intelligence */}
              <div className="intel-card">
                <h3 className="card-title">Inteligência de Custos Técnicos (Cost Intelligence)</h3>
                <p className="card-desc">
                  Otimização em cascata (Regras locais → Modelo leve → Deep LLM) mantém custos mínimos sem sacrificar qualidade de detecção.
                </p>

                <div className="cost-kpi-box">
                  <div className="cost-main">
                    <span className="lbl">Custo Médio por Edital</span>
                    <span className="val text-teal">R$ {costIntel?.averageCostPerEditalBRL?.toFixed(2)}</span>
                  </div>
                  <div className="cost-sub">
                    <span className="lbl">Economia via Cascata</span>
                    <span className="val text-teal">{costIntel?.cascadeSavingsPct}%</span>
                  </div>
                </div>

                <h4 className="section-subtitle">Distribuição dos Custos Técnicos</h4>
                <div className="cost-distribution-grid">
                  <div className="cost-item">Tokens de IA: <strong>{costIntel?.costDistribution?.aiTokenCallsPct}%</strong></div>
                  <div className="cost-item">Armazenamento: <strong>{costIntel?.costDistribution?.cloudStoragePct}%</strong></div>
                  <div className="cost-item">Banco de Dados: <strong>{costIntel?.costDistribution?.databaseReadWritePct}%</strong></div>
                  <div className="cost-item">APIs Externas: <strong>{costIntel?.costDistribution?.externalApisPct}%</strong></div>
                </div>
                <p className="cost-verdict"><em>Diretriz:</em> {costIntel?.policyVerdict}</p>
              </div>

              {/* Trust Signals & Overrides */}
              <div className="intel-card">
                <h3 className="card-title">Sinais de Confiança & Sobrescritas Humanas (Overrides)</h3>
                <p className="card-desc">
                  Analisa divergências entre recomendação algorítmica e decisão humana para aprendizado do produto (sem julgar pessoas).
                </p>

                <div className="trust-kpi-row">
                  <div className="kpi-mini">
                    <span className="lbl">Concordância Humano-IA</span>
                    <span className="val text-teal">{trustSignals?.humanAIAgreementPct}%</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="lbl">Sobrescritas (Overrides)</span>
                    <span className="val text-amber">{trustSignals?.humanOverridePct}%</span>
                  </div>
                  <div className="kpi-mini">
                    <span className="lbl">Índice de Confiança</span>
                    <span className="val text-teal">{trustSignals?.userTrustSurveyScore}/10</span>
                  </div>
                </div>

                <h4 className="section-subtitle">Motivos Reais de Sobrescrita Humana (Overrides)</h4>
                <div className="override-reasons-list">
                  {trustSignals?.overrideReasonsDistribution.map((or, idx) => (
                    <div key={idx} className="override-item">
                      <span>{or.reason}</span>
                      <strong>{or.pct}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: REGISTRAR NOVO PROBLEMA NO BACKLOG */}
      {showNewProbModal && (
        <div className="modal-overlay" onClick={() => setShowNewProbModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Problema Real no Backlog</h3>
              <button className="btn-close" onClick={() => setShowNewProbModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateProblem} className="problem-form">
              <div className="form-group">
                <label>Qual é o problema real observado?</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: O usuário precisa abrir 3 telas diferentes para verificar se possui atestado de vazão..."
                  value={newProbDesc}
                  onChange={(e) => setNewProbDesc(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Evidência observada (Feedback, métrica, incidente)</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Feedback da Mariana + tempo de 25 minutos na etapa de habilitação..."
                  value={newProbEvidence}
                  onChange={(e) => setNewProbEvidence(e.target.value)}
                />
              </div>
              <div className="form-row-dual">
                <div className="form-group">
                  <label>Impacto</label>
                  <select value={newProbImpact} onChange={(e) => setNewProbImpact(e.target.value)}>
                    <option value="CRITICAL">Crítico</option>
                    <option value="HIGH">Alto</option>
                    <option value="MEDIUM">Médio</option>
                    <option value="LOW">Baixo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Prioridade Inicial</label>
                  <select value={newProbPriority} onChange={(e) => setNewProbPriority(e.target.value)}>
                    <option value={BacklogPriority.NOW}>NOW (Imediato)</option>
                    <option value={BacklogPriority.NEXT}>NEXT (Próxima Release)</option>
                    <option value={BacklogPriority.LATER}>LATER (Futuro)</option>
                    <option value={BacklogPriority.WONT_DO}>WON'T DO (Fora de Escopo)</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowNewProbModal(false)}>Cancelar</button>
                <button type="submit" className="btn-submit">Salvar Problema</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default ProductIntelligenceView;
