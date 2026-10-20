/**
 * VELLIA LICITAÇÕES — FASE 63
 * TenderNetworkView.jsx: Interface Central da Tender Intelligence Network e Cobertura Inteligente
 */

import React, { useState, useEffect } from 'react';
import './TenderNetworkView.css';
import { tenderNetworkService } from '../../services/tenderNetwork/tenderNetworkService.js';
import {
  TenderSourceType,
  SourceHealthStatus,
  CandidateStatus,
  PrioritizationQuadrant,
  ConflictFieldType,
  ConflictStatus
} from '../../services/tenderNetwork/tenderNetworkModels.js';
import {
  Layers,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Globe,
  Database,
  PlusCircle,
  RefreshCw,
  GitMerge,
  FileCheck,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function TenderNetworkView() {
  const [activeTab, setActiveTab] = useState('sources'); // sources | canonical | quality | coverage | expansion
  const [sources, setSources] = useState([]);
  const [canonicalOpps, setCanonicalOpps] = useState([]);
  const [coverageData, setCoverageData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

  // Modais
  const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
  const [isResolveConflictOpen, setIsResolveConflictOpen] = useState(false);
  const [activeConflict, setActiveConflict] = useState(null);
  const [conflictResolutionNotes, setConflictResolutionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Form Candidata
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    type: TenderSourceType.PUBLIC_PORTAL,
    region: 'Paraíba',
    scope: 'Licitações Municipais',
    discoveryMethod: 'Mapeamento Regional de Lacunas',
    expectedValue: 'Alto',
    integrationComplexity: 'Média',
    quadrant: PrioritizationQuadrant.QUICK_WIN,
    notes: '',
    requiresCaptchaBypass: false
  });

  const loadData = () => {
    setSources(tenderNetworkService.getSources());
    setCanonicalOpps(tenderNetworkService.getCanonicalOpportunities());
    setCoverageData(tenderNetworkService.getCoverageIntelligence());
    setCandidates(tenderNetworkService.getSourceCandidates());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateCandidate = (e) => {
    e.preventDefault();
    try {
      tenderNetworkService.addSourceCandidate(candidateForm, 'Usuário Gestão');
      setIsAddCandidateOpen(false);
      loadData();
      showToast('Fonte candidata cadastrada com sucesso no backlog de expansão.');
      setCandidateForm({
        name: '',
        type: TenderSourceType.PUBLIC_PORTAL,
        region: 'Paraíba',
        scope: 'Licitações Municipais',
        discoveryMethod: 'Mapeamento Regional de Lacunas',
        expectedValue: 'Alto',
        integrationComplexity: 'Média',
        quadrant: PrioritizationQuadrant.QUICK_WIN,
        notes: '',
        requiresCaptchaBypass: false
      });
    } catch (err) {
      alert(`Erro ao cadastrar candidata: ${err.message}`);
    }
  };

  const handleResolveConflict = () => {
    if (!activeConflict) return;
    activeConflict.status = ConflictStatus.RESOLVED;
    activeConflict.resolvedAt = new Date().toISOString();
    activeConflict.resolutionNotes = conflictResolutionNotes || 'Conflito validado pela equipe operacional com base na fonte oficial.';
    setIsResolveConflictOpen(false);
    setActiveConflict(null);
    setConflictResolutionNotes('');
    loadData();
    showToast('Divergência entre fontes resolvida e registrada no log de auditoria.');
  };

  const handleSimulateSync = (sourceId) => {
    showToast(`Sincronização incremental disparada para a fonte ${sourceId} via Cursor/Watermark.`);
    setTimeout(() => {
      loadData();
      showToast('Sincronização concluída com sucesso. Zero duplicatas geradas.');
    }, 1000);
  };

  const totalOpps = canonicalOpps.length;
  const totalConflicts = canonicalOpps.reduce((acc, o) => acc + (o.conflicts?.filter(c => c.status === ConflictStatus.DETECTED).length || 0), 0);
  const activeSourcesCount = sources.filter(s => s.status === SourceHealthStatus.HEALTHY).length;
  const shadowSourcesCount = candidates.filter(c => c.status === CandidateStatus.TESTING).length;

  return (
    <div className="tender-network-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 10000,
          borderLeft: '4px solid #38bdf8'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="tn-header">
        <div className="tn-header-titles">
          <h1>
            <Globe size={26} color="#38bdf8" />
            Tender Intelligence Network
            <span className="tn-badge-version">Fase 63</span>
          </h1>
          <p>Cobertura inteligente, proveniência estrita por campo e unificação de oportunidades sem ruído</p>
        </div>
        <div className="tn-header-actions">
          <button className="tn-btn-secondary" onClick={() => loadData()}>
            <RefreshCw size={16} />
            Atualizar Status
          </button>
          <button className="tn-btn-primary" onClick={() => setIsAddCandidateOpen(true)}>
            <PlusCircle size={16} />
            Nova Fonte Candidata
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="tn-kpi-grid">
        <div className="tn-kpi-card">
          <div className="kpi-label">Oportunidades Canônicas</div>
          <div className="kpi-value">{totalOpps}</div>
          <div className="kpi-subtext">Indexadas de 6 portais oficiais</div>
        </div>
        <div className="tn-kpi-card">
          <div className="kpi-label">Fontes Conectadas</div>
          <div className="kpi-value">{activeSourcesCount} / {sources.length}</div>
          <div className="kpi-subtext">Saudáveis em produção</div>
        </div>
        <div className="tn-kpi-card">
          <div className="kpi-label">Conflitos de Campo Ativos</div>
          <div className="kpi-value" style={{ color: totalConflicts > 0 ? '#b45309' : '#15803d' }}>
            {totalConflicts}
          </div>
          <div className="kpi-subtext">Divergências de prazo ou valor</div>
        </div>
        <div className="tn-kpi-card">
          <div className="kpi-label">Fontes em Shadow Mode</div>
          <div className="kpi-value" style={{ color: '#0284c7' }}>{shadowSourcesCount}</div>
          <div className="kpi-subtext">Em teste sem poluir o Radar</div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <nav className="tn-tabs-nav">
        <button
          className={`tn-tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          <Layers size={16} />
          1. Rede de Fontes ({sources.length})
        </button>
        <button
          className={`tn-tab-btn ${activeTab === 'canonical' ? 'active' : ''}`}
          onClick={() => setActiveTab('canonical')}
        >
          <GitMerge size={16} />
          2. Oportunidades Canônicas ({canonicalOpps.length})
        </button>
        <button
          className={`tn-tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
          onClick={() => setActiveTab('quality')}
        >
          <Activity size={16} />
          3. Qualidade & Contribuição
        </button>
        <button
          className={`tn-tab-btn ${activeTab === 'coverage' ? 'active' : ''}`}
          onClick={() => setActiveTab('coverage')}
        >
          <Globe size={16} />
          4. Inteligência de Cobertura
        </button>
        <button
          className={`tn-tab-btn ${activeTab === 'expansion' ? 'active' : ''}`}
          onClick={() => setActiveTab('expansion')}
        >
          <PlusCircle size={16} />
          5. Expansão & Shadow Mode ({candidates.length})
        </button>
      </nav>

      {/* Tab 1: Rede de Fontes */}
      {activeTab === 'sources' && (
        <div className="tn-tab-content">
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Fontes Ativas e Conectores Multifonte</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Monitoramento contínuo de APIs públicas, portais oficiais e feeds autorizados.
              </p>
            </div>
          </div>

          <div className="tn-sources-grid">
            {sources.map(src => {
              const statusClass = src.status === SourceHealthStatus.HEALTHY ? 'tn-status-healthy'
                : src.status === SourceHealthStatus.DELAYED ? 'tn-status-delayed'
                : src.status === SourceHealthStatus.DEGRADED ? 'tn-status-degraded'
                : src.status === SourceHealthStatus.OFFLINE ? 'tn-status-offline'
                : 'tn-status-retired';

              return (
                <div key={src.id} className="tn-source-card">
                  <div>
                    <div className="tn-source-header">
                      <div>
                        <div className="tn-source-title">{src.name}</div>
                        <div className="tn-source-provider">{src.provider}</div>
                      </div>
                      <span className={`tn-status-pill ${statusClass}`}>{src.status}</span>
                    </div>

                    <div style={{ margin: '0.85rem 0', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="tn-src-pill">{src.sourceType}</span>
                      <span className="tn-src-pill primary">{src.trustLevel}</span>
                      <span className="tn-src-pill" style={{ background: '#f1f5f9', color: '#475569' }}>{src.version}</span>
                    </div>

                    <div className="tn-source-details-list">
                      <span><strong>Frescor:</strong> {src.freshness}</span>
                      <span><strong>Última Sincronização:</strong> {new Date(src.lastSync).toLocaleString('pt-BR')}</span>
                      <span><strong>Baseline Diário:</strong> {src.historicalDailyBaseline} processos/dia</span>
                      <span><strong>Oportunidades Únicas:</strong> {src.metrics?.uniqueOpportunityContribution || 0}</span>
                      <span><strong>Autenticação:</strong> {src.authenticationType}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      className="tn-btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem', color: '#0f172a' }}
                      onClick={() => handleSimulateSync(src.id)}
                    >
                      <RefreshCw size={12} />
                      Sincronizar
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Prioridade #{src.priority}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Oportunidades Canônicas */}
      {activeTab === 'canonical' && (
        <div className="tn-tab-content">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Visão Unificada de Oportunidades (Canonical Model)</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Uma oportunidade única agrega múltiplos registros de fontes distintas, com rastreabilidade por campo crítico.
            </p>
          </div>

          <div>
            {canonicalOpps.map(opp => {
              const activeConflicts = opp.conflicts?.filter(c => c.status === ConflictStatus.DETECTED) || [];
              const hasConflict = activeConflicts.length > 0;

              return (
                <div key={opp.id} className={`tn-opp-card ${hasConflict ? 'has-conflict' : ''}`}>
                  <div className="tn-opp-header">
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7' }}>
                        {opp.canonicalCode} • {opp.region}
                      </span>
                      <h4 style={{ margin: '0.25rem 0', fontSize: '1.05rem', color: '#0f172a' }}>
                        {opp.title}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                        <strong>Órgão Canônico:</strong> {opp.clientCanonical} {opp.clientCnpj ? `(${opp.clientCnpj})` : ''}
                      </div>
                    </div>
                    {hasConflict && (
                      <div className="tn-conflict-badge">
                        <AlertTriangle size={14} />
                        {activeConflicts.length} Conflito(s) Detectado(s)
                      </div>
                    )}
                  </div>

                  {/* Proveniência Geral */}
                  <div className="tn-sources-pill-row">
                    <span className="tn-src-pill primary">
                      Fonte Primária: {opp.provenance?.primarySourceName}
                    </span>
                    {opp.provenance?.additionalSources?.map(as => (
                      <span key={as} className="tn-src-pill">
                        Espelho: {as}
                      </span>
                    ))}
                    <span className="tn-src-pill" style={{ background: '#f8fafc', color: '#64748b' }}>
                      Atualizado em: {new Date(opp.provenance?.lastSyncAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {/* Tabela de Proveniência por Campo Crítico */}
                  <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', margin: '0.75rem 0' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                      RASTREAMENTO POR CAMPO CRÍTICO (FIELD-LEVEL PROVENANCE)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.78rem' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Prazo Final:</span>{' '}
                        <strong>{opp.deadline ? new Date(opp.deadline).toLocaleDateString('pt-BR') : 'A definir'}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#0284c7' }}>Origem: {opp.fieldProvenance?.deadline?.sourceName}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Valor Estimado:</span>{' '}
                        <strong>R$ {(opp.estimatedValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#0284c7' }}>Origem: {opp.fieldProvenance?.estimatedValue?.sourceName}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Modalidade:</span>{' '}
                        <strong>{opp.modality}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#0284c7' }}>Origem: {opp.fieldProvenance?.modality?.sourceName}</div>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Status:</span>{' '}
                        <strong>{opp.status}</strong>
                        <div style={{ fontSize: '0.7rem', color: '#0284c7' }}>Origem: {opp.fieldProvenance?.status?.sourceName}</div>
                      </div>
                    </div>
                  </div>

                  {/* Documentos com Hash SHA-256 */}
                  {opp.documents && opp.documents.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', margin: '0.5rem 0' }}>
                      <strong>Documentos Indexados (Deduplicados por SHA-256):</strong>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        {opp.documents.map(doc => (
                          <span key={doc.id} style={{ background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <FileText size={12} color="#0284c7" />
                            {doc.title} (v{doc.version})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alerta de Conflitos e Ações */}
                  {hasConflict && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem', borderRadius: '6px', marginTop: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', marginBottom: '0.35rem' }}>
                        Divergência Entre Fontes Ativa:
                      </div>
                      {activeConflicts.map(c => (
                        <div key={c.id} style={{ fontSize: '0.78rem', color: '#78350f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            • <strong>{c.fieldName}:</strong> Valor Canônico Primário "{c.primaryValue}" vs Valor Secundário "{c.conflictingValue}". ({c.notes})
                          </div>
                          <button
                            className="tn-btn-primary"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.72rem' }}
                            onClick={() => {
                              setActiveConflict(c);
                              setIsResolveConflictOpen(true);
                            }}
                          >
                            Resolver Conflito
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Qualidade & Contribuição */}
      {activeTab === 'quality' && (
        <div className="tn-tab-content">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Métricas de Qualidade, Contribuição & Eficiência</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Avaliação de quantas oportunidades inéditas cada conector agregou, nível de autoridade e baselines de anomalia.
            </p>
          </div>

          <table className="tn-table">
            <thead>
              <tr>
                <th>Fonte / Conector</th>
                <th>Trust Level</th>
                <th>Total Ingerido</th>
                <th>Oportunidades Únicas</th>
                <th>Duplicatas (Confirmação)</th>
                <th>Relevância Útil</th>
                <th>Eficiência</th>
                <th>Status Saúde</th>
              </tr>
            </thead>
            <tbody>
              {sources.map(src => (
                <tr key={src.id}>
                  <td>
                    <strong>{src.name}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{src.provider}</div>
                  </td>
                  <td>
                    <span className="tn-src-pill primary">{src.trustLevel}</span>
                  </td>
                  <td>{(src.metrics?.totalIngested || 0).toLocaleString()}</td>
                  <td style={{ color: '#0284c7', fontWeight: 700 }}>
                    {(src.metrics?.uniqueOpportunityContribution || 0).toLocaleString()}
                  </td>
                  <td style={{ color: '#64748b' }}>
                    {(src.metrics?.duplicateConfirmations || 0).toLocaleString()}
                  </td>
                  <td style={{ color: '#15803d', fontWeight: 600 }}>
                    {(src.metrics?.relevantCount || 0).toLocaleString()}
                  </td>
                  <td>
                    {((src.metrics?.efficiencyRatio || 0) * 100).toFixed(0)}%
                  </td>
                  <td>
                    <span className={`tn-status-pill ${
                      src.status === SourceHealthStatus.HEALTHY ? 'tn-status-healthy'
                      : src.status === SourceHealthStatus.DELAYED ? 'tn-status-delayed'
                      : 'tn-status-degraded'
                    }`}>
                      {src.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Inteligência de Cobertura */}
      {activeTab === 'coverage' && coverageData && (
        <div className="tn-tab-content">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Diagnóstico de Cobertura Geográfica e Institucional</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Identificação visual de lacunas estratégicas onde estamos perdendo certames publicados.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {/* Cobertura Geográfica */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a' }}>Cobertura Geográfica</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {coverageData.geographicCoverage.map(geo => (
                  <div key={geo.region} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{geo.region}</strong>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: geo.percent >= 80 ? '#15803d' : geo.percent >= 50 ? '#b45309' : '#b91c1c'
                      }}>
                        {geo.percent}% • {geo.level}
                      </span>
                    </div>
                    {/* Barra de progresso */}
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', margin: '0.35rem 0' }}>
                      <div style={{
                        height: '100%',
                        width: `${geo.percent}%`,
                        background: geo.percent >= 80 ? '#10b981' : geo.percent >= 50 ? '#f59e0b' : '#ef4444'
                      }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {geo.gapNotes}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cobertura Institucional */}
            <div>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#0f172a' }}>Cobertura por Perfil de Contratante</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {coverageData.institutionalCoverage.map(inst => (
                  <div key={inst.buyerType} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <strong style={{ fontSize: '0.85rem' }}>{inst.buyerType}</strong>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: inst.percent >= 80 ? '#15803d' : inst.percent >= 50 ? '#b45309' : '#b91c1c'
                      }}>
                        {inst.percent}%
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${inst.percent}%`,
                        background: inst.percent >= 80 ? '#10b981' : inst.percent >= 50 ? '#f59e0b' : '#ef4444'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Expansão & Shadow Mode */}
      {activeTab === 'expansion' && (
        <div className="tn-tab-content">
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Backlog de Expansão & Matriz de Priorização</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Fontes candidatas avaliadas por Ganho de Cobertura vs Complexidade. Nenhuma fonte vai direto para produção.
              </p>
            </div>
            <button className="tn-btn-primary" onClick={() => setIsAddCandidateOpen(true)}>
              <PlusCircle size={16} />
              Adicionar Candidata
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {candidates.map(cand => {
              const isShadow = cand.status === CandidateStatus.TESTING;
              return (
                <div key={cand.id} style={{
                  border: isShadow ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1.25rem',
                  background: isShadow ? '#f0f9ff' : '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{cand.name}</strong>
                    <span className="tn-src-pill" style={{
                      background: cand.status === CandidateStatus.ACTIVE ? '#dcfce7'
                        : cand.status === CandidateStatus.TESTING ? '#e0f2fe'
                        : cand.status === CandidateStatus.REJECTED ? '#fee2e2'
                        : '#f1f5f9',
                      color: cand.status === CandidateStatus.ACTIVE ? '#15803d'
                        : cand.status === CandidateStatus.TESTING ? '#0369a1'
                        : cand.status === CandidateStatus.REJECTED ? '#b91c1c'
                        : '#475569'
                    }}>
                      {cand.status}
                    </span>
                  </div>

                  <div style={{ margin: '0.5rem 0', fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}>
                    Quadrante: {cand.quadrant}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div><strong>Região:</strong> {cand.region}</div>
                    <div><strong>Escopo:</strong> {cand.scope}</div>
                    <div><strong>Ganho Esperado:</strong> {cand.expectedValue}</div>
                    <div><strong>Complexidade:</strong> {cand.integrationComplexity}</div>
                    <div style={{ marginTop: '0.35rem', fontStyle: 'italic', color: '#64748b' }}>
                      "{cand.notes}"
                    </div>
                  </div>

                  {/* Shadow Metrics se em teste */}
                  {cand.shadowMetrics && (
                    <div style={{ marginTop: '0.75rem', background: '#ffffff', padding: '0.65rem', borderRadius: '6px', border: '1px solid #bae6fd', fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: 700, color: '#0369a1', marginBottom: '0.25rem' }}>
                        MÉTRICAS DO MODO SHADOW (7 DIAS):
                      </div>
                      <div>• Ingeridos em Silêncio: {cand.shadowMetrics.ingestedCount}</div>
                      <div>• Oportunidades Inéditas: {cand.shadowMetrics.uniqueCount}</div>
                      <div>• Taxa de Relevância: {(cand.shadowMetrics.relevanceScore * 100).toFixed(0)}%</div>
                      <div>• Falhas de Parser: {cand.shadowMetrics.errorsCount}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Adicionar Candidata */}
      {isAddCandidateOpen && (
        <div className="tn-modal-overlay">
          <div className="tn-modal-box">
            <div className="tn-modal-header">
              <h3>Cadastrar Nova Fonte Candidata</h3>
              <button className="tn-modal-close-btn" onClick={() => setIsAddCandidateOpen(false)}>×</button>
            </div>
            <form onSubmit={handleCreateCandidate}>
              <div className="tn-modal-body">
                <div className="tn-form-group">
                  <label>Nome do Portal / Órgão</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Portal de Licitações de Campina Grande"
                    value={candidateForm.name}
                    onChange={e => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  />
                </div>
                <div className="tn-form-group">
                  <label>Tipo de Fonte</label>
                  <select
                    value={candidateForm.type}
                    onChange={e => setCandidateForm({ ...candidateForm, type: e.target.value })}
                  >
                    <option value={TenderSourceType.PUBLIC_PORTAL}>Portal Público</option>
                    <option value={TenderSourceType.PUBLIC_API}>API Pública</option>
                    <option value={TenderSourceType.PUBLIC_FEED}>Feed Público (RSS)</option>
                    <option value={TenderSourceType.OFFICIAL_API}>API Oficial</option>
                  </select>
                </div>
                <div className="tn-form-group">
                  <label>Região de Cobertura</label>
                  <input
                    type="text"
                    required
                    value={candidateForm.region}
                    onChange={e => setCandidateForm({ ...candidateForm, region: e.target.value })}
                  />
                </div>
                <div className="tn-form-group">
                  <label>Quadrante de Priorização</label>
                  <select
                    value={candidateForm.quadrant}
                    onChange={e => setCandidateForm({ ...candidateForm, quadrant: e.target.value })}
                  >
                    <option value={PrioritizationQuadrant.QUICK_WIN}>Quick Win (Alto Ganho / Baixa Complexidade)</option>
                    <option value={PrioritizationQuadrant.STRATEGIC}>Estratégica (Alto Ganho / Alta Complexidade)</option>
                    <option value={PrioritizationQuadrant.LOW_PRIORITY}>Baixa Prioridade</option>
                    <option value={PrioritizationQuadrant.AVOID}>Evitar</option>
                  </select>
                </div>
                <div className="tn-form-group">
                  <label>Notas Técnicas & Evidências de Conformidade</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva endpoints públicos, formato de dados (JSON/XML) e termos de uso."
                    value={candidateForm.notes}
                    onChange={e => setCandidateForm({ ...candidateForm, notes: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#b91c1c' }}>
                  <ShieldCheck size={16} />
                  <span>Diretriz inegociável: Não é permitido cadastrar fontes que exijam bypass de CAPTCHA ou quebra de autenticação.</span>
                </div>
              </div>
              <div className="tn-modal-footer">
                <button type="button" className="tn-btn-secondary" onClick={() => setIsAddCandidateOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="tn-btn-primary">
                  Salvar no Backlog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolver Conflito */}
      {isResolveConflictOpen && activeConflict && (
        <div className="tn-modal-overlay">
          <div className="tn-modal-box">
            <div className="tn-modal-header">
              <h3>Resolver Conflito entre Fontes</h3>
              <button className="tn-modal-close-btn" onClick={() => setIsResolveConflictOpen(false)}>×</button>
            </div>
            <div className="tn-modal-body">
              <div style={{ background: '#fffbeb', padding: '0.85rem', borderRadius: '6px', fontSize: '0.82rem', color: '#78350f' }}>
                <div><strong>Campo em Divergência:</strong> {activeConflict.fieldName}</div>
                <div style={{ marginTop: '0.35rem' }}>
                  <strong>Valor Canônico (Primário):</strong> {activeConflict.primaryValue}
                </div>
                <div>
                  <strong>Valor Conflitante (Secundário):</strong> {activeConflict.conflictingValue}
                </div>
              </div>
              <div className="tn-form-group">
                <label>Justificativa / Nota de Auditoria da Resolução</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Confirmado prazo do PNCP conforme edital retificador publicado no Diário Oficial."
                  value={conflictResolutionNotes}
                  onChange={e => setConflictResolutionNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="tn-modal-footer">
              <button className="tn-btn-secondary" onClick={() => setIsResolveConflictOpen(false)}>
                Cancelar
              </button>
              <button className="tn-btn-primary" onClick={handleResolveConflict}>
                Homologar Resolução
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
