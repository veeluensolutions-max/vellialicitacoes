/**
 * VELLIA LICITAÇÕES — FASE 65
 * OutcomeIntelligenceView.jsx: Interface Central de Inteligência de Resultados e Aprendizado
 */

import React, { useState, useEffect } from 'react';
import './OutcomeIntelligenceView.css';
import { outcomeIntelligenceService } from '../../services/outcome/outcomeIntelligenceService.js';
import {
  OutcomeResultType,
  PatternStatus,
  ContractExecutionOutcome,
  ParticipationStructureType
} from '../../services/outcome/outcomeModels.js';
import {
  TrendingUp,
  Award,
  Clock,
  FileCheck,
  AlertTriangle,
  Lightbulb,
  Layers,
  ShieldCheck,
  Filter,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react';

export default function OutcomeIntelligenceView({ currentUser, onNavigateToTab }) {
  const [activeTab, setActiveTab] = useState('results'); // results | process | comparables | patterns | learning
  const [filters, setFilters] = useState({
    companyId: 'all',
    serviceCategory: 'all',
    region: 'all',
    period: 'all',
    resultType: 'all'
  });

  const [metrics, setMetrics] = useState(null);
  const [records, setRecords] = useState([]);
  const [timingData, setTimingData] = useState(null);
  const [partnerComparison, setPartnerComparison] = useState([]);
  const [noSubData, setNoSubData] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Modais
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isValidatingPattern, setIsValidatingPattern] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [patternNotes, setPatternNotes] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const userPermissions = currentUser?.permissions || ['outcomes.analytics.view', 'outcomes.financial.view', 'outcomes.patterns.manage'];

  const loadData = () => {
    const m = outcomeIntelligenceService.calculateOutcomeMetrics(filters, userPermissions);
    const recs = outcomeIntelligenceService.getOutcomeRecords(filters);
    const timing = outcomeIntelligenceService.getTimingAndReadinessAnalysis(filters);
    const partnerComp = outcomeIntelligenceService.getPartnerStructureComparison(filters, userPermissions);
    const noSub = outcomeIntelligenceService.getNoSubmissionBreakdown(filters);
    const pats = outcomeIntelligenceService.getPatterns();

    setMetrics(m);
    setRecords(recs);
    setTimingData(timing);
    setPartnerComparison(partnerComp);
    setNoSubData(noSub);
    setPatterns(pats);
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleValidatePattern = () => {
    if (!selectedPattern) return;
    try {
      outcomeIntelligenceService.validatePattern(selectedPattern.id, patternNotes || 'Validado em colegiado executivo.', currentUser?.name || 'Diretoria');
      setIsValidatingPattern(false);
      setSelectedPattern(null);
      setPatternNotes('');
      loadData();
      showToast('Padrão analítico formalmente validado e registrado no colegiado.');
    } catch (e) {
      alert(e.message);
    }
  };

  if (!metrics) return null;

  return (
    <div className="outcome-intel-container">
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
          borderLeft: '4px solid #10b981'
        }}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <header className="oi-header">
        <div className="oi-header-titles">
          <h1>
            <TrendingUp size={26} color="#34d399" />
            Outcome Intelligence & Aprendizado
            <span className="oi-badge-version">Fase 65</span>
          </h1>
          <p>Análise comparativa de resultados, padrões observados e separação entre desfecho do certame e execução contratual</p>
        </div>
        <div className="oi-header-actions">
          <button className="oi-btn-secondary" onClick={() => loadData()}>
            <RefreshCw size={16} />
            Atualizar Dados
          </button>
          <button className="oi-btn-primary" onClick={() => setIsReportModalOpen(true)}>
            <FileText size={16} />
            Bid Performance Review
          </button>
        </div>
      </header>

      {/* Filter Bar (Workspace Investigar Performance) */}
      <section className="oi-filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0f172a', marginRight: '0.5rem' }}>
          <Filter size={18} color="#059669" />
          Investigar Performance:
        </div>

        <div className="oi-filter-item">
          <label>Empresa</label>
          <select
            value={filters.companyId}
            onChange={e => setFilters({ ...filters, companyId: e.target.value })}
          >
            <option value="all">Todas do Grupo (Consolidado)</option>
            <option value="veeluensolutions">Veeluen Solutions</option>
            <option value="excelencia">Excelência Ambiental</option>
          </select>
        </div>

        <div className="oi-filter-item">
          <label>Período</label>
          <select
            value={filters.period}
            onChange={e => setFilters({ ...filters, period: e.target.value })}
          >
            <option value="all">Histórico Completo</option>
            <option value="2026-Q3">2026 - Q3</option>
            <option value="2026-Q2">2026 - Q2</option>
            <option value="2026-Q1">2026 - Q1</option>
            <option value="2025-Q4">2025 - Q4</option>
            <option value="2025-Q3">2025 - Q3</option>
          </select>
        </div>

        <div className="oi-filter-item">
          <label>Serviço</label>
          <select
            value={filters.serviceCategory}
            onChange={e => setFilters({ ...filters, serviceCategory: e.target.value })}
          >
            <option value="all">Todos os Serviços</option>
            <option value="Emissões Atmosféricas">Emissões Atmosféricas</option>
            <option value="Ensaios Hidrogeológicos">Ensaios Hidrogeológicos</option>
            <option value="Saneamento e EEE">Saneamento e EEE</option>
            <option value="Inventários e Modelagem">Inventários e Modelagem</option>
            <option value="Efluentes Industriais">Efluentes Industriais</option>
          </select>
        </div>

        <div className="oi-filter-item">
          <label>Região</label>
          <select
            value={filters.region}
            onChange={e => setFilters({ ...filters, region: e.target.value })}
          >
            <option value="all">Todas as Regiões</option>
            <option value="Pernambuco">Pernambuco</option>
            <option value="Paraíba">Paraíba</option>
            <option value="Bahia">Bahia</option>
            <option value="São Paulo">São Paulo</option>
            <option value="Rio Grande do Norte">Rio Grande do Norte</option>
          </select>
        </div>

        <div className="oi-filter-item">
          <label>Desfecho (Outcome)</label>
          <select
            value={filters.resultType}
            onChange={e => setFilters({ ...filters, resultType: e.target.value })}
          >
            <option value="all">Todos os Desfechos</option>
            <option value={OutcomeResultType.WON}>Vencidas (Won)</option>
            <option value={OutcomeResultType.LOST}>Perdidas (Lost)</option>
            <option value={OutcomeResultType.DISQUALIFIED}>Desclassificadas</option>
            <option value={OutcomeResultType.NO_SUBMISSION}>Não Submetidas</option>
            <option value={OutcomeResultType.CANCELLED}>Revogadas / Anuladas</option>
          </select>
        </div>
      </section>

      {/* Small Sample Alert Banner (Item 14 a 16) */}
      {metrics.isSmallSample && (
        <div className="oi-warning-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Aviso de Amostra Reduzida ({metrics.sampleSize} certames):</strong> {metrics.smallSampleWarning}
          </div>
        </div>
      )}

      {/* KPI Cards (12 a 28: Sempre mostrando o Sample Size) */}
      <section className="oi-kpi-grid">
        <div className="oi-kpi-card">
          <div className="oi-kpi-label">
            <span>Win Rate Competitivo</span>
            <span className="kpi-sample-pill">Amostra: {metrics.rates.competitiveDenominator}</span>
          </div>
          <div className="oi-kpi-value" style={{ color: '#059669' }}>
            {metrics.rates.winRatePct}%
          </div>
          <div className="oi-kpi-subtext">
            {metrics.outcomes.won} vitórias em {metrics.rates.competitiveDenominator} disputas (exclui canceladas)
          </div>
        </div>

        <div className="oi-kpi-card">
          <div className="oi-kpi-label">
            <span>Submission Rate</span>
            <span className="kpi-sample-pill">Elegíveis: {metrics.rates.eligibleCount}</span>
          </div>
          <div className="oi-kpi-value" style={{ color: '#0284c7' }}>
            {metrics.rates.submissionRatePct}%
          </div>
          <div className="oi-kpi-subtext">
            Taxa de propostas com GO que chegaram à submissão
          </div>
        </div>

        <div className="oi-kpi-card">
          <div className="oi-kpi-label">
            <span>Taxa de Inabilitação</span>
            <span className="kpi-sample-pill">Disputas: {metrics.rates.competitiveDenominator}</span>
          </div>
          <div className="oi-kpi-value" style={{ color: metrics.outcomes.disqualified > 0 ? '#b91c1c' : '#15803d' }}>
            {metrics.rates.disqualificationRatePct}%
          </div>
          <div className="oi-kpi-subtext">
            {metrics.outcomes.disqualified} certame(s) com desclassificação formal
          </div>
        </div>

        <div className="oi-kpi-card">
          <div className="oi-kpi-label">
            <span>Prontidão Antecipada</span>
            <span className="kpi-sample-pill">Mediana Wins</span>
          </div>
          <div className="oi-kpi-value" style={{ color: '#4f46e5' }}>
            {timingData?.winsMedianLeadTimeHours || 0}h
          </div>
          <div className="oi-kpi-subtext">
            vs {timingData?.lossesMedianLeadTimeHours || 0}h nas perdas (Lead time de prontidão)
          </div>
        </div>
      </section>

      {/* Navigation Tabs (As 5 Perspectivas Canônicas) */}
      <nav className="oi-tabs-nav">
        <button
          className={`oi-tab-btn ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <Award size={16} />
          1. Results (O que Aconteceu)
        </button>
        <button
          className={`oi-tab-btn ${activeTab === 'process' ? 'active' : ''}`}
          onClick={() => setActiveTab('process')}
        >
          <Clock size={16} />
          2. Process (Timing & Lead Time)
        </button>
        <button
          className={`oi-tab-btn ${activeTab === 'comparables' ? 'active' : ''}`}
          onClick={() => setActiveTab('comparables')}
        >
          <Layers size={16} />
          3. Comparables (Casos Semelhantes)
        </button>
        <button
          className={`oi-tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          <ShieldCheck size={16} />
          4. Patterns (Padrões Observados)
        </button>
        <button
          className={`oi-tab-btn ${activeTab === 'learning' ? 'active' : ''}`}
          onClick={() => setActiveTab('learning')}
        >
          <Lightbulb size={16} />
          5. Learning (Pós-Execução & Disciplina)
        </button>
      </nav>

      {/* Tab 1: RESULTS */}
      {activeTab === 'results' && (
        <div className="oi-tab-content">
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Desfecho Global de Participações (Amostra: {metrics.sampleSize} certames)</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Separação rigorosa de Vitórias, Perdas, Desclassificações, Cancelamentos e Oportunidades não submetidas.
              </p>
            </div>
            {/* Status de Cobertura de Dados (158 a 161) */}
            <div style={{ fontSize: '0.8rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <strong>Cobertura de Dados:</strong> {metrics.dataQuality.priceDataCoveragePct}% com preços registrados ({metrics.dataQuality.status})
            </div>
          </div>

          <table className="oi-table">
            <thead>
              <tr>
                <th>Código / Certame</th>
                <th>Órgão Licitante</th>
                <th>Serviço</th>
                <th>Valor Estimado</th>
                <th>Resultado</th>
                <th>Estrutura</th>
                <th>Lead Time Prontidão</th>
                <th>Margem Ofertada</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => {
                const statusClass = r.resultType === OutcomeResultType.WON ? 'oi-status-won'
                  : r.resultType === OutcomeResultType.LOST ? 'oi-status-lost'
                  : r.resultType === OutcomeResultType.DISQUALIFIED ? 'oi-status-disq'
                  : r.resultType === OutcomeResultType.CANCELLED ? 'oi-status-cancelled'
                  : 'oi-status-nosub';

                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.canonicalCode}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.title}</div>
                    </td>
                    <td>{r.clientCanonical}</td>
                    <td>{r.serviceCategory}</td>
                    <td>R$ {(r.estimatedValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <span className={`oi-status-pill ${statusClass}`}>{r.resultType}</span>
                    </td>
                    <td>{r.participationStructure}</td>
                    <td>{r.timing?.readinessLeadTimeHours ? `${r.timing.readinessLeadTimeHours}h antes` : 'N/A'}</td>
                    <td>
                      {metrics.privacy.isMarginHidden ? (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Restrito</span>
                      ) : (
                        r.pricing?.ourMarginPct ? `${r.pricing.ourMarginPct}%` : 'N/A'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: PROCESS (Timing, Lead Times & Blockers) */}
      {activeTab === 'process' && (
        <div className="oi-tab-content">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Análise de Timing do Lifecycle & Lead Time de Prontidão</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Avaliação de tempo gasto entre etapas e correlação observada entre prontidão antecipada e desfecho.
            </p>
          </div>

          {/* Banner de Declaração Analítica (Item 38 e 39) */}
          <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', padding: '1rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, color: '#065f46', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
              PADRÃO OBSERVADO DE ANTECIPAÇÃO (READINESS LEAD TIME):
            </div>
            <div style={{ color: '#047857', fontSize: '0.9rem' }}>
              "{timingData?.analyticalStatement}"
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
              * {timingData?.disclaimer}
            </div>
          </div>

          {/* Comparativo de Estruturas de Participação (Solo vs Parceiro) */}
          <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#0f172a' }}>Performance por Estrutura de Participação (Fase 62)</h4>
          <table className="oi-table" style={{ marginBottom: '1.5rem' }}>
            <thead>
              <tr>
                <th>Estrutura</th>
                <th>Amostra</th>
                <th>Submissões</th>
                <th>Taxa de Submissão</th>
                <th>Vitórias</th>
                <th>Win Rate</th>
                <th>Margem Média Observada</th>
                <th>Observação Analítica</th>
              </tr>
            </thead>
            <tbody>
              {partnerComparison.map(p => (
                <tr key={p.structure}>
                  <td><strong>{p.structure}</strong></td>
                  <td>{p.sampleSize} certames</td>
                  <td>{p.submittedCount}</td>
                  <td>{p.submissionRatePct}%</td>
                  <td>{p.winsCount}</td>
                  <td>{p.winRatePct}%</td>
                  <td>
                    {metrics.privacy.isMarginHidden ? (
                      <span style={{ color: '#94a3b8' }}>Restrito</span>
                    ) : (
                      p.observedAvgMarginPct ? `${p.observedAvgMarginPct}%` : 'N/A'
                    )}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.observation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Análise de Não-Submissão após GO (29 a 32) */}
          <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#0f172a' }}>Motivos de Não-Submissão após Decisão GO (Amostra: {noSubData?.totalNoSubmissionCount} casos)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {noSubData?.breakdown.map(ns => (
              <div key={ns.reason} style={{ border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9rem' }}>{ns.reason}</strong>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4f46e5' }}>{ns.count} caso(s) ({ns.pct}%)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                  {ns.notes}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: COMPARABLES (Historical Comparables) */}
      {activeTab === 'comparables' && (
        <div className="oi-tab-content">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Casos Comparáveis Históricos (Historical Comparables)</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Recuperação de certames anteriores com perfil semelhante usando estritamente fatores pré-decisão (sem future leakage).
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              Fatores de Similaridade Pré-Decisão Utilizados:
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569' }}>
              • Categoria de Serviço / Objeto • Faixa de Valor Estimado • Região Geográfica • Modalidade Licitatória.
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', fontStyle: 'italic' }}>
              * O sistema não infere predições determinísticas de vitória a partir dos comparáveis, apresentando apenas o histórico empírico observado.
            </div>
          </div>

          <table className="oi-table">
            <thead>
              <tr>
                <th>Código / Objeto</th>
                <th>Órgão</th>
                <th>Serviço</th>
                <th>Desfecho</th>
                <th>Estrutura</th>
                <th>Antecipação (Lead Time)</th>
                <th>Desfecho Contratual</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.canonicalCode}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.title}</div>
                  </td>
                  <td>{r.clientCanonical}</td>
                  <td>{r.serviceCategory}</td>
                  <td>
                    <span className={`oi-status-pill ${
                      r.resultType === OutcomeResultType.WON ? 'oi-status-won' : 'oi-status-lost'
                    }`}>
                      {r.resultType}
                    </span>
                  </td>
                  <td>{r.participationStructure}</td>
                  <td>{r.timing?.readinessLeadTimeHours}h</td>
                  <td style={{ fontSize: '0.78rem' }}>{r.contractOutcome?.status || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: PATTERNS (Padrões Observados & Validados) */}
      {activeTab === 'patterns' && (
        <div className="oi-tab-content">
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Padrões Observados & Aprendizados Institucionalizados</h3>
              <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Padrões empíricos submetidos à validação do colegiado executivo, com controle de decaimento por mudança de processo.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {patterns.map(pat => {
              const isValidated = pat.status === PatternStatus.VALIDATED;
              const isDeprecated = pat.status === PatternStatus.DEPRECATED;

              return (
                <div key={pat.id} className={`oi-pattern-card ${isValidated ? 'validated' : isDeprecated ? 'deprecated' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669' }}>
                        {pat.type} • {pat.segment}
                      </span>
                      <h4 style={{ margin: '0.25rem 0', fontSize: '1rem', color: '#0f172a' }}>
                        "{pat.observation}"
                      </h4>
                    </div>
                    <span className="oi-status-pill" style={{
                      background: isValidated ? '#dcfce7' : isDeprecated ? '#f1f5f9' : '#fef3c7',
                      color: isValidated ? '#15803d' : isDeprecated ? '#64748b' : '#b45309'
                    }}>
                      {pat.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <span><strong>Amostra:</strong> {pat.sampleSize} certames</span>
                    <span><strong>Período:</strong> {pat.period}</span>
                    <span><strong>Nível de Confiança:</strong> {pat.confidenceLevel}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#334155', background: '#ffffff', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <strong>Nota de Governança:</strong> {pat.validationNotes}
                  </div>

                  {!isValidated && !isDeprecated && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <button
                        className="oi-btn-primary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        onClick={() => {
                          setSelectedPattern(pat);
                          setIsValidatingPattern(true);
                        }}
                      >
                        Homologar Padrão
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: LEARNING (Pós-Execução & Disciplina) */}
      {activeTab === 'learning' && (
        <div className="oi-tab-content">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Aprendizado com Resultados & Separação de Desfechos</h3>
            <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              Distinção entre Sucesso no Certame (Bid Outcome) e Sucesso no Negócio (Contract Outcome), Disciplined Losses e vitórias com deterioração.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
            {/* Disciplined Loss */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={20} color="#0284c7" />
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Disciplined Losses (Perdas Disciplinadas)</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                Casos onde a empresa não venceu a disputa, porém preservou estritamente seus pisos de margem e critérios de capacidade, evitando assumir contratos predatórios ou de alto risco.
              </p>
              <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                <strong>Exemplo no Histórico (SP-SABESP-2026-044):</strong>
                <div style={{ color: '#334155', marginTop: '0.25rem' }}>
                  Concorrente ofertou desconto de 20.3% com margem presumida menor que 4%. O Vellia manteve o piso de 15.5% e evitou a execução deficitária.
                </div>
              </div>
            </div>

            {/* Win with execution deterioration */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={20} color="#d97706" />
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Win with Execution Deterioration</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
                Vitórias legítimas em licitação onde a execução posterior sofreu erosão de margem ou incidentes operacionais. O certame foi vencido, mas a premissa de custo orçada precisou de ajuste.
              </p>
              <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}>
                <strong>Exemplo no Histórico (PE-SUAPE-2026-081):</strong>
                <div style={{ color: '#334155', marginTop: '0.25rem' }}>
                  Margem orçada em 17.0%, porém realizada em 7.4% devido à quebra de sonda e custos adicionais de mobilização em campo.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Validar Padrão */}
      {isValidatingPattern && selectedPattern && (
        <div className="oi-modal-overlay">
          <div className="oi-modal-box">
            <div className="oi-modal-header">
              <h3>Homologar Padrão Observado</h3>
              <button className="oi-modal-close-btn" onClick={() => setIsValidatingPattern(false)}>×</button>
            </div>
            <div className="oi-modal-body">
              <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                "{selectedPattern.observation}"
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Amostra: {selectedPattern.sampleSize} certames • Período: {selectedPattern.period}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                  Nota de Validação pelo Colegiado / Diretoria
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Descreva a deliberação do colegiado e orientações repassadas às equipes operacionais."
                  value={patternNotes}
                  onChange={e => setPatternNotes(e.target.value)}
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>
            <div className="oi-modal-footer">
              <button className="oi-btn-secondary" onClick={() => setIsValidatingPattern(false)}>Cancelar</button>
              <button className="oi-btn-primary" onClick={handleValidatePattern}>Confirmar Validação</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Relatório Bid Performance Review */}
      {isReportModalOpen && (
        <div className="oi-modal-overlay">
          <div className="oi-modal-box" style={{ maxWidth: '800px' }}>
            <div className="oi-modal-header">
              <h3>Bid Performance Review — Relatório Executivo</h3>
              <button className="oi-modal-close-btn" onClick={() => setIsReportModalOpen(false)}>×</button>
            </div>
            <div className="oi-modal-body">
              <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>Sumário Executivo de Resultados (Últimos 12 Meses)</strong>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                  Amostra consolidada de {metrics.sampleSize} oportunidades elegíveis. Win rate competitivo de {metrics.rates.winRatePct}% e taxa de submissão de {metrics.rates.submissionRatePct}%.
                </p>
              </div>

              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>1. Performance do Processo & Antecipação</strong>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.25rem 0' }}>
                  Propostas com Submission Readiness aprovado com mais de 24h de antecedência apresentam maior frequência relativa de vitória ({timingData?.winsMedianLeadTimeHours}h nas vitórias vs {timingData?.lossesMedianLeadTimeHours}h nas derrotas).
                </p>
              </div>

              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>2. Disciplina de Preço & Desfecho</strong>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.25rem 0' }}>
                  A empresa registrou derrotas disciplinadas em certames onde o deságio do concorrente rompeu pisos aceitáveis de viabilidade técnica e financeira.
                </p>
              </div>

              <div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>3. Aprendizado Pós-Execução</strong>
                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0.25rem 0' }}>
                  Separar estritamente o desfecho do certame (Bid Outcome) da execução (Contract Outcome) permitiu identificar oportunidades com vitória formal mas com necessidade de calibragem em orçamentos operacionais futuros.
                </p>
              </div>
            </div>
            <div className="oi-modal-footer">
              <button className="oi-btn-secondary" onClick={() => setIsReportModalOpen(false)}>Fechar</button>
              <button className="oi-btn-primary" onClick={() => {
                showToast('Relatório executivo exportado para o Centro de Relatórios.');
                setIsReportModalOpen(false);
              }}>
                Exportar Relatório PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
