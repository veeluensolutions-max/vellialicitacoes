import React, { useState, useEffect } from 'react';
import {
  Brain,
  History,
  Target,
  FileText,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Search,
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';
import {
  StrategicMemoryService,
  DecisionType,
  DecisionStatus,
  AssumptionStatus,
  OutcomeResult,
  ReasonCodes
} from '../../services/decision/strategicMemoryService';
import { SimilarDecisionService } from '../../services/decision/similarDecisionService';
import './StrategicMemoryView.css';

export default function StrategicMemoryView({ userRole = 'ADMIN', hasFinancialAccess = true }) {
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [activeTab, setActiveTab] = useState('repository');
  const [decisions, setDecisions] = useState([]);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Dívida Decisória
  const [decisionDebt, setDecisionDebt] = useState({ totalDebtCount: 0, debtItems: [], cleanPercentage: 100 });
  
  // Casos Semelhantes / Precedentes
  const [similarCases, setSimilarCases] = useState([]);
  const [divergenceInfo, setDivergenceInfo] = useState(null);

  // Copilot
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState(null);

  // Modal Nova Decisão / Supersede
  const [showModal, setShowModal] = useState(false);
  const [isSuperseding, setIsSuperseding] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    decisionType: DecisionType.GO,
    primaryReasonCode: 'ALTA_ADERENCIA',
    reason: '',
    decidedBy: 'Carlos Drummond',
    opportunityValue: 1000000,
    margin: 16.5,
    serviceType: 'Tratamento de Efluentes',
    buyer: 'Sabesp',
    assumption1: ''
  });

  useEffect(() => {
    loadDecisions();
  }, [selectedCompany, typeFilter, searchTerm]);

  const loadDecisions = () => {
    const list = StrategicMemoryService.getDecisions({
      companyId: selectedCompany,
      decisionType: typeFilter || undefined,
      search: searchTerm || undefined
    });
    setDecisions(list);

    if (list.length > 0 && !selectedDecision) {
      handleSelectDecision(list[0]);
    } else if (selectedDecision) {
      const refreshed = list.find(d => d.id === selectedDecision.id);
      if (refreshed) setSelectedDecision(refreshed);
    }

    // Calcula Decision Debt
    const debt = StrategicMemoryService.evaluateDecisionDebt(selectedCompany);
    setDecisionDebt(debt);
  };

  const handleSelectDecision = (dec) => {
    setSelectedDecision(dec);
    // Busca casos semelhantes
    const cases = StrategicMemoryService.findSimilarCases({
      currentDecisionId: dec.id,
      service: dec.context?.serviceType,
      buyer: dec.context?.buyer,
      value: dec.context?.opportunityValue,
      riskLevel: dec.context?.riskLevel,
      reasonCodes: dec.reasonCodes
    }, { limit: 4 });
    setSimilarCases(cases);

    // Detecta divergência com precedentes
    const div = SimilarDecisionService.detectDecisionDivergence(dec, cases);
    setDivergenceInfo(div);
  };

  const handleValidateAssumption = (assumptionId, newStatus) => {
    if (!selectedDecision) return;
    StrategicMemoryService.validateAssumption(
      selectedDecision.id,
      assumptionId,
      newStatus,
      'Validado na rotina de acompanhamento executivo.'
    );
    loadDecisions();
  };

  const handleAskCopilot = (preset) => {
    const q = preset || copilotQuery;
    if (!q) return;
    const res = StrategicMemoryService.askStrategicMemoryCopilot(q, selectedCompany, hasFinancialAccess);
    setCopilotResponse(res);
    setCopilotQuery(q);
  };

  const handleSubmitNewDecision = (e) => {
    e.preventDefault();
    try {
      if (isSuperseding && selectedDecision) {
        StrategicMemoryService.supersedeDecision(
          selectedDecision.id,
          {
            title: formData.title,
            decisionType: formData.decisionType,
            decision: formData.decisionType,
            reason: formData.reason,
            primaryReasonCode: formData.primaryReasonCode,
            decidedBy: formData.decidedBy,
            context: {
              opportunityValue: Number(formData.opportunityValue),
              margin: Number(formData.margin),
              serviceType: formData.serviceType,
              buyer: formData.buyer
            },
            assumptions: formData.assumption1 ? [{ assumption: formData.assumption1 }] : []
          },
          formData.reason
        );
      } else {
        StrategicMemoryService.recordDecision({
          companyId: selectedCompany === 'ALL' ? 'Veeluen Solutions' : selectedCompany,
          title: formData.title,
          decisionType: formData.decisionType,
          decision: formData.decisionType,
          reason: formData.reason,
          primaryReasonCode: formData.primaryReasonCode,
          decidedBy: formData.decidedBy,
          context: {
            opportunityValue: Number(formData.opportunityValue),
            margin: Number(formData.margin),
            serviceType: formData.serviceType,
            buyer: formData.buyer
          },
          assumptions: formData.assumption1 ? [{ assumption: formData.assumption1 }] : []
        });
      }
      setShowModal(false);
      setIsSuperseding(false);
      loadDecisions();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="strategic-memory-container">
      {/* HEADER PRINCIPAL */}
      <header className="memory-header">
        <div className="memory-header-info">
          <h1>
            <Brain size={28} color="#38bdf8" /> Memória Estratégica & Inteligência Decisória
          </h1>
          <p className="memory-subtitle">
            Repositório institucional de decisões: contexto congelado, rastreabilidade de premissas e lições aprendidas.
          </p>
        </div>

        <div className="memory-actions">
          <select
            className="company-filter-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="ALL">Grupo Consolidado</option>
            <option value="Veeluen Solutions">Veeluen Solutions</option>
            <option value="Excelência Gestão">Excelência Gestão</option>
          </select>

          <button
            className="btn-primary-action"
            onClick={() => {
              setIsSuperseding(false);
              setFormData({ ...formData, title: '', reason: '' });
              setShowModal(true);
            }}
          >
            <Plus size={16} /> Nova Decisão
          </button>
        </div>
      </header>

      {/* KPI RIBBON */}
      <section className="memory-metrics-strip">
        <div className="metric-box">
          <span className="label">Total de Decisões</span>
          <span className="value">{decisions.length}</span>
          <span className="subtext">Com snapshots imutáveis</span>
        </div>

        <div className="metric-box">
          <span className="label">Premissas Auditadas</span>
          <span className="value success">91.4%</span>
          <span className="subtext">Rastreabilidade em contratos e cotações</span>
        </div>

        <div className="metric-box">
          <span className="label">Dívida Decisória (Debt)</span>
          <span className={`value ${decisionDebt.totalDebtCount > 0 ? 'warning' : 'success'}`}>
            {decisionDebt.totalDebtCount}
          </span>
          <span className="subtext">{decisionDebt.cleanPercentage}% de integridade formal</span>
        </div>

        <div className="metric-box">
          <span className="label">Precedentes Internos</span>
          <span className="value">100%</span>
          <span className="subtext">Casos comparáveis estruturados</span>
        </div>
      </section>

      {/* TABS DE NAVEGAÇÃO */}
      <nav className="memory-nav-tabs">
        <button
          className={`memory-tab-btn ${activeTab === 'repository' ? 'active' : ''}`}
          onClick={() => setActiveTab('repository')}
        >
          1. Repositório & Timeline
        </button>
        <button
          className={`memory-tab-btn ${activeTab === 'perspectives' ? 'active' : ''}`}
          onClick={() => setActiveTab('perspectives')}
        >
          2. As 4 Perspectivas (Detalhe)
        </button>
        <button
          className={`memory-tab-btn ${activeTab === 'precedents' ? 'active' : ''}`}
          onClick={() => setActiveTab('precedents')}
        >
          3. Precedentes & Casos Semelhantes
        </button>
        <button
          className={`memory-tab-btn ${activeTab === 'debt' ? 'active' : ''}`}
          onClick={() => setActiveTab('debt')}
        >
          4. Dívida Decisória & Condicionais
        </button>
      </nav>

      {/* CONTEÚDO PRINCIPAL: GRID */}
      <div className="memory-grid">
        {/* COLUNA 1: LISTA E TIMELINE DE DECISÕES */}
        <div className="memory-card">
          <div className="memory-card-header">
            <h3><History size={18} /> Linha do Tempo de Decisões</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                className="company-filter-select"
                style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Todos os Tipos</option>
                <option value={DecisionType.GO}>GO</option>
                <option value={DecisionType.NO_GO}>NO-GO</option>
                <option value={DecisionType.MARGIN_APPROVAL}>Margem</option>
                <option value={DecisionType.STRATEGIC_PRIORITY}>Estratégica</option>
              </select>
            </div>
          </div>

          <div className="decision-list">
            {decisions.map(d => (
              <div
                key={d.id}
                className={`decision-item ${selectedDecision?.id === d.id ? 'selected' : ''}`}
                onClick={() => handleSelectDecision(d)}
              >
                <div className="decision-item-header">
                  <span className={`badge-decision badge-${d.decisionType.toLowerCase().replace('_', '-')}`}>
                    {d.decisionType}
                  </span>
                  {d.status === DecisionStatus.SUPERSEDED && (
                    <span className="status-superseded-badge">Substituída</span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {new Date(d.decidedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="decision-title-text">{d.title}</div>
                <div className="decision-reason-preview">
                  <strong>Motivo:</strong> {d.reason}
                </div>

                <div className="decision-footer-meta">
                  <span><strong>Decisor:</strong> {d.decidedBy}</span>
                  <span>{d.context?.buyer || 'Geral'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA 2: AS QUATRO PERSPECTIVAS & DETALHES */}
        <div className="memory-card">
          {selectedDecision ? (
            <>
              <div className="memory-card-header">
                <h3><Layers size={18} color="#38bdf8" /> Quatro Perspectivas Decisórias</h3>
                <button
                  className="btn-primary-action"
                  style={{ background: '#475569', fontSize: '0.75rem', padding: '4px 8px' }}
                  onClick={() => {
                    setIsSuperseding(true);
                    setFormData({
                      ...formData,
                      title: selectedDecision.title,
                      decisionType: selectedDecision.decisionType === DecisionType.GO ? DecisionType.NO_GO : DecisionType.GO,
                      reason: ''
                    });
                    setShowModal(true);
                  }}
                >
                  Substituir (Supersede)
                </button>
              </div>

              {/* PERSPECTIVA 1: DECISÃO */}
              <div className="perspective-block">
                <span className="perspective-label"><Target size={14} /> 1. Decisão Formal</span>
                <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: '600' }}>
                  {selectedDecision.decisionType}: {selectedDecision.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <strong>Justificativa Registrada:</strong> {selectedDecision.reason}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Homologado por {selectedDecision.decidedBy} em {new Date(selectedDecision.decidedAt).toLocaleString('pt-BR')}.
                </div>
              </div>

              {/* PERSPECTIVA 2: CONTEXTO CONGELADO (SNAPSHOT) */}
              <div className="perspective-block">
                <span className="perspective-label"><History size={14} /> 2. Contexto no Momento da Decisão (Snapshot)</span>
                <div className="context-snapshot-grid">
                  <div className="context-snapshot-cell">
                    <span className="lbl">Valor Oportunidade</span>
                    <span className="val">R$ {(selectedDecision.context?.opportunityValue / 1000).toLocaleString('pt-BR')}k</span>
                  </div>
                  {hasFinancialAccess && (
                    <div className="context-snapshot-cell">
                      <span className="lbl">Margem Aprovada</span>
                      <span className="val">{selectedDecision.context?.margin}%</span>
                    </div>
                  )}
                  <div className="context-snapshot-cell">
                    <span className="lbl">Aderência Técnica</span>
                    <span className="val">{selectedDecision.context?.technicalFit}%</span>
                  </div>
                  <div className="context-snapshot-cell">
                    <span className="lbl">Nível de Risco</span>
                    <span className="val">{selectedDecision.context?.riskLevel}</span>
                  </div>
                  <div className="context-snapshot-cell">
                    <span className="lbl">Órgão Comprador</span>
                    <span className="val">{selectedDecision.context?.buyer}</span>
                  </div>
                  <div className="context-snapshot-cell">
                    <span className="lbl">Serviço</span>
                    <span className="val">{selectedDecision.context?.serviceType}</span>
                  </div>
                </div>
              </div>

              {/* PERSPECTIVA 3: PREMISSAS (ASSUMPTIONS) */}
              <div className="perspective-block">
                <span className="perspective-label"><HelpCircle size={14} /> 3. Premissas Assumidas ({selectedDecision.assumptions?.length || 0})</span>
                <div className="assumptions-list">
                  {selectedDecision.assumptions?.length === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Nenhuma premissa formal registrada.</div>
                  )}
                  {selectedDecision.assumptions?.map(ass => (
                    <div key={ass.id} className="assumption-item">
                      <div>
                        <div>{ass.assumption}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Fonte: {ass.source}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className={`assumption-status-pill assumption-${ass.status.toLowerCase()}`}>
                          {ass.status}
                        </span>
                        {ass.status === AssumptionStatus.OPEN && (
                          <button
                            style={{ background: '#10b981', color: 'white', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }}
                            onClick={() => handleValidateAssumption(ass.id, AssumptionStatus.CONFIRMED)}
                          >
                            Confirmar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PERSPECTIVA 4: RESULTADO POSTERIOR (OUTCOME) */}
              <div className="perspective-block">
                <span className="perspective-label"><TrendingUp size={14} /> 4. Resultado Posterior (Decision ≠ Resultado)</span>
                {selectedDecision.outcome?.result !== OutcomeResult.NOT_YET_KNOWN ? (
                  <div className="outcome-box">
                    <div><strong>Desfecho:</strong> {selectedDecision.outcome.result}</div>
                    <div><strong>Impacto:</strong> {selectedDecision.outcome.impact}</div>
                    <div style={{ marginTop: '4px', color: '#94a3b8' }}>
                      <strong>Lição Aprendida:</strong> {selectedDecision.outcome.notes}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Resultado em acompanhamento. O desfecho será vinculado após a conclusão do certame ou execução do contrato.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
              Selecione uma decisão na linha do tempo para examinar as 4 perspectivas.
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO INFERIOR: COPILOT DA MEMÓRIA E PRECEDENTES */}
      <div className="memory-grid">
        {/* COPILOT EXECUTIVO DA MEMÓRIA */}
        <div className="memory-card">
          <div className="memory-card-header">
            <h3><Sparkles size={18} color="#60a5fa" /> Copilot de Memória Estratégica</h3>
          </div>
          <div className="copilot-memory-box">
            <div className="copilot-chips">
              <button className="copilot-chip-btn" onClick={() => handleAskCopilot('Por que desistimos daquela licitação?')}>
                Por que desistimos?
              </button>
              <button className="copilot-chip-btn" onClick={() => handleAskCopilot('Quando aprovamos margem em exceção?')}>
                Aprovações de margem?
              </button>
              <button className="copilot-chip-btn" onClick={() => handleAskCopilot('Essa premissa se confirmou?')}>
                Status de premissas?
              </button>
              <button className="copilot-chip-btn" onClick={() => handleAskCopilot('Quais decisões semelhantes tomamos antes?')}>
                Casos comparáveis?
              </button>
            </div>

            {copilotResponse && (
              <div className="copilot-response-card">
                <div><strong>Resposta:</strong> {copilotResponse.answer}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                  <strong>Evidência:</strong> {copilotResponse.evidence}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRECEDENTES & DIVERGÊNCIA */}
        <div className="memory-card">
          <div className="memory-card-header">
            <h3><Shield size={18} color="#fbbf24" /> Precedentes & Casos Comparáveis</h3>
          </div>

          {divergenceInfo?.hasDivergence && (
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', borderRadius: '8px', padding: '12px', fontSize: '0.82rem', color: '#fbbf24' }}>
              <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
              <strong>Alerta de Divergência Decisória:</strong> {divergenceInfo.explanationPrompt}
            </div>
          )}

          <div className="decision-list" style={{ marginTop: '8px' }}>
            {similarCases.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Nenhum caso comparável identificado com a similaridade mínima.</p>
            ) : (
              similarCases.map(item => (
                <div key={item.decision.id} className="assumption-item">
                  <div>
                    <div style={{ fontWeight: '600' }}>{item.decision.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Decisão: {item.decision.decisionType} • Órgão: {item.decision.context?.buyer}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '700' }}>
                    {Math.round(item.totalScore * 100)}% Match
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL REGISTRO DE DECISÃO OU SUPERSEDE */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form
            onSubmit={handleSubmitNewDecision}
            style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', width: '500px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <h3 style={{ margin: 0, color: '#fff' }}>
              {isSuperseding ? `Substituir Decisão: ${selectedDecision?.id}` : 'Registrar Nova Decisão Estratégica'}
            </h3>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Título da Deliberação:</label>
              <input
                required
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Pregão Sabesp: Decisão GO"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tipo de Decisão:</label>
                <select
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                  value={formData.decisionType}
                  onChange={(e) => setFormData({ ...formData, decisionType: e.target.value })}
                >
                  <option value={DecisionType.GO}>GO</option>
                  <option value={DecisionType.NO_GO}>NO-GO</option>
                  <option value={DecisionType.MARGIN_APPROVAL}>Aprovação de Margem</option>
                  <option value={DecisionType.RISK_ACCEPTANCE}>Aceite de Risco</option>
                  <option value={DecisionType.STRATEGIC_PRIORITY}>Prioridade Estratégica</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Decisor Responsável:</label>
                <input
                  required
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                  value={formData.decidedBy}
                  onChange={(e) => setFormData({ ...formData, decidedBy: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Motivo / Justificativa Formal:</label>
              <textarea
                required
                rows="3"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Explique o racional executivo por trás desta decisão..."
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Premissa Crítica (Assumption):</label>
              <input
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                value={formData.assumption1}
                onChange={(e) => setFormData({ ...formData, assumption1: e.target.value })}
                placeholder="Ex: Laboratório manterá tabela de preços cotada"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn-primary-action"
                style={{ background: '#475569' }}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary-action">
                {isSuperseding ? 'Gravar Substituição' : 'Salvar Decisão'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
