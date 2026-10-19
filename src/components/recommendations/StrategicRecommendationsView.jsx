import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  FileText,
  DollarSign,
  TrendingUp,
  XCircle,
  Calendar,
  Check
} from 'lucide-react';
import {
  StrategicRecommendationEngine,
  RecommendationPriority,
  RecommendationStatus,
  RecommendationType,
  DismissReason
} from '../../services/strategic/strategicRecommendationEngine';
import './StrategicRecommendationsView.css';

export default function StrategicRecommendationsView({ userRole = 'ADMIN', hasFinancialAccess = true }) {
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [recommendations, setRecommendations] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [collisions, setCollisions] = useState([]);
  
  // Modais de Ação
  const [dismissModal, setDismissModal] = useState({ open: false, item: null, reason: DismissReason.STRATEGIC_CHOICE, notes: '' });
  const [deferModal, setDeferModal] = useState({ open: false, item: null, date: '' });

  // Copilot
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [selectedCompany, typeFilter, priorityFilter, statusFilter]);

  const loadRecommendations = () => {
    const list = StrategicRecommendationEngine.getRecommendations({
      companyId: selectedCompany,
      type: typeFilter || undefined,
      priority: priorityFilter || undefined,
      status: statusFilter === 'ACTIVE' ? undefined : statusFilter
    });

    const filtered = statusFilter === 'ACTIVE' 
      ? list.filter(r => r.status === RecommendationStatus.NEW || r.status === RecommendationStatus.REVIEWED)
      : list;

    setRecommendations(filtered);

    // Detecta colisões de recomendações (ex: Expansão vs Capacidade)
    const detected = StrategicRecommendationEngine.detectCollisions(list);
    setCollisions(detected);
  };

  const handleAccept = (item) => {
    try {
      StrategicRecommendationEngine.acceptRecommendation(item.id, 'INITIATIVE', 'Aceito pela diretoria para inclusão no plano de ação.');
      alert(`Recomendação "${item.title}" aceita. Uma iniciativa foi encaminhada para planejamento executivo.`);
      loadRecommendations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFormalizeDecision = (item) => {
    const confirmAction = window.confirm(`Deseja converter a recomendação "${item.title}" em uma Decisão Estratégica formal na Memória Institucional (Fase 55)?`);
    if (!confirmAction) return;

    try {
      const decision = StrategicRecommendationEngine.convertToStrategicDecision(item.id, 'Deliberação homologada com base em recomendação estratégica.');
      alert(`Decisão formal registrada com sucesso na Memória Estratégica com ID ${decision.id}!`);
      loadRecommendations();
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDismiss = () => {
    if (!dismissModal.item) return;
    try {
      StrategicRecommendationEngine.dismissRecommendation(dismissModal.item.id, dismissModal.reason, dismissModal.notes);
      setDismissModal({ open: false, item: null, reason: DismissReason.STRATEGIC_CHOICE, notes: '' });
      loadRecommendations();
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDefer = () => {
    if (!deferModal.item || !deferModal.date) return;
    try {
      StrategicRecommendationEngine.deferRecommendation(deferModal.item.id, deferModal.date, 'Postergado para nova análise.');
      setDeferModal({ open: false, item: null, date: '' });
      loadRecommendations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAskCopilot = (preset) => {
    const q = preset || copilotQuery;
    if (!q) return;
    const res = StrategicRecommendationEngine.askRecommendationCopilot(q, selectedCompany, hasFinancialAccess);
    setCopilotResponse(res);
    setCopilotQuery(q);
  };

  const criticalCount = recommendations.filter(r => r.priority === RecommendationPriority.CRITICAL).length;

  return (
    <div className="recommendations-container">
      {/* HEADER DA CENTRAL */}
      <header className="rec-header">
        <div className="rec-title-block">
          <h1>
            <Lightbulb size={26} color="#fbbf24" /> Recomendações Estratégicas Explicáveis
          </h1>
          <p className="rec-subtitle">
            Ações sugeridas fundamentadas em evidências reais de pipeline, capacidade, contratos e inteligência de mercado.
          </p>
        </div>

        <div className="rec-controls">
          <select
            className="rec-select"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
          >
            <option value="ALL">Grupo Consolidado</option>
            <option value="Veeluen Solutions">Veeluen Solutions</option>
            <option value="Excelência Gestão">Excelência Gestão</option>
          </select>
        </div>
      </header>

      {/* KPI RIBBON */}
      <section className="rec-kpi-ribbon">
        <div className="kpi-card">
          <span className="lbl">Recomendações Ativas</span>
          <span className="val">{recommendations.length}</span>
          <span className="sub">Fundamentadas em evidências</span>
        </div>

        <div className="kpi-card">
          <span className="lbl">Atenção Crítica</span>
          <span className={`val ${criticalCount > 0 ? 'critical' : 'success'}`}>
            {criticalCount}
          </span>
          <span className="sub">Exigem alinhamento em 48h</span>
        </div>

        <div className="kpi-card">
          <span className="lbl">Cobertura Média de Dados</span>
          <span className="val success">88.5%</span>
          <span className="sub">Precisão de custos e prazos</span>
        </div>

        <div className="kpi-card">
          <span className="lbl">Ações Formalizadas</span>
          <span className="val">100%</span>
          <span className="sub">Vínculo com Memória e Cenários</span>
        </div>
      </section>

      {/* BANNER DE COLISÃO / TRADE-OFF */}
      {collisions.length > 0 && (
        <div className="collision-alert-banner">
          <div>
            <div className="collision-title">
              <AlertTriangle size={18} /> {collisions[0].title}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#fca5a5' }}>
              {collisions[0].description}
            </div>
          </div>
          <button
            className="btn-sandbox-link"
            onClick={() => alert('Abra o Laboratório de Cenários (Fase 56) na barra lateral para simular o trade-off.')}
          >
            Simular no Scenario Lab
          </button>
        </div>
      )}

      {/* BARRA DE FILTROS */}
      <div className="rec-filters-strip">
        <select
          className="rec-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Todos os Domínios</option>
          <option value={RecommendationType.OPPORTUNITY}>Oportunidades</option>
          <option value={RecommendationType.CAPACITY}>Capacidade</option>
          <option value={RecommendationType.PRICING}>Precificação & Margem</option>
          <option value={RecommendationType.STRATEGIC}>Estratégia</option>
        </select>

        <select
          className="rec-select"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">Todas as Prioridades</option>
          <option value={RecommendationPriority.CRITICAL}>Crítica</option>
          <option value={RecommendationPriority.HIGH}>Alta</option>
          <option value={RecommendationPriority.MEDIUM}>Média</option>
        </select>

        <select
          className="rec-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ACTIVE">Apenas Ativas</option>
          <option value={RecommendationStatus.ACCEPTED}>Aceitas</option>
          <option value={RecommendationStatus.DEFERRED}>Postergadas</option>
          <option value={RecommendationStatus.DISMISSED}>Descartadas</option>
          <option value={RecommendationStatus.IMPLEMENTED}>Implementadas</option>
        </select>
      </div>

      {/* FEED DE RECOMENDAÇÕES EXPLICÁVEIS (7 FATORES ESTRUTURADOS) */}
      <div className="rec-feed">
        {recommendations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Nenhuma recomendação encontrada para os filtros selecionados.
          </div>
        ) : (
          recommendations.map(r => (
            <div key={r.id} className={`rec-card priority-${r.priority.toLowerCase()}`}>
              {/* CABEÇALHO DO CARD */}
              <div className="rec-card-header">
                <div>
                  <span className="rec-type-badge">{r.type}</span>
                  <span className={`rec-priority-badge p-${r.priority.toLowerCase()}`}>{r.priority}</span>
                  <h3 className="rec-title-text">{r.title}</h3>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Expira em: {new Date(r.expiresAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {/* GRID DOS 7 FATORES EXPLICÁVEIS */}
              <div className="rec-explainable-grid">
                {/* 1. O QUE OBSERVAMOS? */}
                <div className="explain-box">
                  <div className="heading"><FileText size={14} /> 1. O que observamos?</div>
                  <div>{r.observation}</div>
                </div>

                {/* 2. POR QUE IMPORTA? */}
                <div className="explain-box">
                  <div className="heading"><AlertTriangle size={14} /> 2. Por que importa?</div>
                  <div>{r.whyItMatters}</div>
                </div>

                {/* 3. AÇÃO SUGERIDA (DESTAQUE) */}
                <div className="explain-box full highlight">
                  <div className="heading"><Lightbulb size={14} /> 3. Ação Sugerida (Apoio à Decisão)</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '600' }}>{r.suggestedAction}</div>
                </div>

                {/* 4. IMPACTO ESPERADO */}
                <div className="explain-box">
                  <div className="heading"><TrendingUp size={14} /> 4. Impacto Esperado</div>
                  <div>{r.expectedImpact}</div>
                </div>

                {/* 5. RISCOS MAPEADOS */}
                <div className="explain-box">
                  <div className="heading"><Shield size={14} /> 5. Riscos Mapeados</div>
                  <div>{r.risks}</div>
                </div>

                {/* 6. ALTERNATIVAS DISPONÍVEIS */}
                <div className="explain-box">
                  <div className="heading"><Layers size={14} /> 6. Alternativas Existentes</div>
                  <div className="alternatives-list">
                    {r.alternativas?.map((alt, i) => (
                      <div key={i} className="alternative-item">→ {alt}</div>
                    ))}
                  </div>
                </div>

                {/* 7. EVIDÊNCIAS DE APOIO */}
                <div className="explain-box">
                  <div className="heading"><CheckCircle size={14} /> 7. Evidência & Cobertura de Dados</div>
                  <div>{r.evidence}</div>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', marginTop: '4px' }}>
                    Cobertura de Dados: {r.dataCoveragePct}% • Confiança: {r.confidence}
                  </div>
                </div>
              </div>

              {/* RODAPÉ DO CARD COM AÇÕES */}
              <div className="rec-footer">
                <div className="rec-meta-tags">
                  <span>Engine: {r.engineVersion}</span>
                  <span>Snapshot: {r.evidenceSnapshotId}</span>
                  <span>Status: <strong>{r.status}</strong></span>
                </div>

                {r.status === RecommendationStatus.NEW && (
                  <div className="rec-action-buttons">
                    <button
                      className="btn-rec-action accept"
                      onClick={() => handleAccept(r)}
                    >
                      <Check size={14} style={{ display: 'inline', marginRight: '4px' }} /> Aceitar Sugestão
                    </button>
                    <button
                      className="btn-rec-action defer"
                      onClick={() => setDeferModal({ open: true, item: r, date: '' })}
                    >
                      <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Postergar
                    </button>
                    <button
                      className="btn-rec-action dismiss"
                      onClick={() => setDismissModal({ open: true, item: r, reason: DismissReason.STRATEGIC_CHOICE, notes: '' })}
                    >
                      <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> Descartar
                    </button>
                    <button
                      className="btn-rec-action decision"
                      onClick={() => handleFormalizeDecision(r)}
                      title="Gravar como deliberação na Memória Estratégica (Fase 55)"
                    >
                      Formalizar Decisão (Fase 55)
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* COPILOT DE RECOMENDAÇÕES ESTRATÉGICAS */}
      <div className="rec-copilot-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={18} color="#60a5fa" />
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Copilot de Recomendações Estratégicas</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button className="btn-rec-action defer" onClick={() => handleAskCopilot('O que você recomenda revisar hoje com prioridade?')}>
            O que revisar hoje?
          </button>
          <button className="btn-rec-action defer" onClick={() => handleAskCopilot('Quais recomendações de capacidade temos?')}>
            Gargalos de capacidade?
          </button>
          <button className="btn-rec-action defer" onClick={() => handleAskCopilot('Quais recomendações de margem e precificação?')}>
            Margem & Precificação?
          </button>
        </div>

        {copilotResponse && (
          <div style={{ background: '#1e293b', borderLeft: '3px solid #fbbf24', borderRadius: '6px', padding: '14px', fontSize: '0.85rem', lineHeight: '1.45', marginTop: '10px' }}>
            <div><strong>Análise Racional:</strong> {copilotResponse.answer}</div>
            {copilotResponse.evidence && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                Evidência: {copilotResponse.evidence}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE DESCARTE (DISMISS) */}
      {dismissModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', width: '450px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Descartar Recomendação</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{dismissModal.item?.title}</p>
            
            <div style={{ margin: '12px 0' }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Motivo do Descarte:</label>
              <select
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                value={dismissModal.reason}
                onChange={(e) => setDismissModal({ ...dismissModal, reason: e.target.value })}
              >
                <option value={DismissReason.STRATEGIC_CHOICE}>{DismissReason.STRATEGIC_CHOICE}</option>
                <option value={DismissReason.ALREADY_ADDRESSED}>{DismissReason.ALREADY_ADDRESSED}</option>
                <option value={DismissReason.NOT_RELEVANT}>{DismissReason.NOT_RELEVANT}</option>
                <option value={DismissReason.INCORRECT_DATA}>{DismissReason.INCORRECT_DATA}</option>
                <option value={DismissReason.OTHER}>{DismissReason.OTHER}</option>
              </select>
            </div>

            <div style={{ margin: '12px 0' }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Justificativa {dismissModal.item?.priority === RecommendationPriority.CRITICAL && '(Obrigatória para itens Críticos)'}:
              </label>
              <textarea
                rows="3"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                placeholder="Insira o motivo formal..."
                value={dismissModal.notes}
                onChange={(e) => setDismissModal({ ...dismissModal, notes: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn-rec-action defer" onClick={() => setDismissModal({ open: false, item: null, reason: DismissReason.STRATEGIC_CHOICE, notes: '' })}>
                Cancelar
              </button>
              <button className="btn-rec-action dismiss" onClick={confirmDismiss}>
                Confirmar Descarte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE POSTERGAÇÃO (DEFER) */}
      {deferModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', width: '400px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Postergar Recomendação</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{deferModal.item?.title}</p>
            
            <div style={{ margin: '12px 0' }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Reavaliar em:</label>
              <input
                type="date"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '6px', padding: '8px' }}
                value={deferModal.date}
                onChange={(e) => setDeferModal({ ...deferModal, date: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn-rec-action defer" onClick={() => setDeferModal({ open: false, item: null, date: '' })}>
                Cancelar
              </button>
              <button className="btn-rec-action accept" onClick={confirmDefer}>
                Salvar Postergação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
