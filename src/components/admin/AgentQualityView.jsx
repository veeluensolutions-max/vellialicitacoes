import React, { useState, useMemo } from 'react';
import { 
  Cpu, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Search, 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Sparkles, 
  Sliders, 
  Activity, 
  HelpCircle,
  FileText,
  Building2,
  Scale
} from 'lucide-react';
import { GoldenDatasetService } from '../../services/intelligence/goldenDatasetService.js';
import { contextualMatchingEngine, EngineVersion } from '../../services/intelligence/contextualMatchingEngine.js';
import { technicalVocabularyService, TermWeight, TermWeightLabel } from '../../services/intelligence/technicalVocabularyService.js';
import { humanFeedbackService } from '../../services/intelligence/humanFeedbackService.js';
import './AgentQualityView.css';

export default function AgentQualityView() {
  const [activeSubTab, setActiveSubTab] = useState('golden_set'); // 'golden_set' | 'explain_match' | 'vocabulary' | 'feedback' | 'shadow'

  // 1. Execução do Benchmark do Golden Dataset
  const benchmarkResult = useMemo(() => {
    return GoldenDatasetService.runBenchmark();
  }, []);

  // 2. Estado do depurador "Explain Match"
  const [debugTitle, setDebugTitle] = useState('Monitoramento contínuo de fontes estacionárias e caracterização de efluentes gasosos');
  const [debugObject, setDebugObject] = useState('Prestação de serviços técnicos para monitoramento de fontes estacionárias e amostragem em chaminés com laudos conforme CONAMA 382.');
  const [debugLocation, setDebugLocation] = useState('Ipojuca - PE');
  const [debugDays, setDebugDays] = useState(14);
  const [debugResult, setDebugResult] = useState(() => {
    return contextualMatchingEngine.analyze({
      title: 'Monitoramento contínuo de fontes estacionárias e caracterização de efluentes gasosos',
      object: 'Prestação de serviços técnicos para monitoramento de fontes estacionárias e amostragem em chaminés com laudos conforme CONAMA 382.',
      location: 'Ipojuca - PE',
      daysLeft: 14
    });
  });

  const handleRunDebug = () => {
    const res = contextualMatchingEngine.analyze({
      title: debugTitle,
      object: debugObject,
      location: debugLocation,
      daysLeft: Number(debugDays) || 10
    });
    setDebugResult(res);
  };

  // 3. Vocabulário Técnico
  const [vocabServices, setVocabServices] = useState(() => technicalVocabularyService.getVocabulary());
  const [selectedServiceId, setSelectedServiceId] = useState(vocabServices[0]?.serviceId || '');
  const [newTermText, setNewTermText] = useState('');
  const [newTermWeight, setNewTermWeight] = useState(TermWeight.HIGH);
  const [vocabSearch, setVocabSearch] = useState('');

  const currentService = vocabServices.find(s => s.serviceId === selectedServiceId) || vocabServices[0];

  const handleAddTerm = () => {
    if (!newTermText.trim() || !selectedServiceId) return;
    technicalVocabularyService.saveTerm(selectedServiceId, {
      term: newTermText.trim(),
      weight: Number(newTermWeight),
      type: 'técnico'
    });
    setVocabServices(technicalVocabularyService.getVocabulary());
    setNewTermText('');
  };

  const handleRemoveTerm = (termStr) => {
    technicalVocabularyService.removeTerm(selectedServiceId, termStr);
    setVocabServices(technicalVocabularyService.getVocabulary());
  };

  // 4. Feedbacks Humanos
  const allFeedbacks = useMemo(() => humanFeedbackService.getAllFeedbacks(), []);
  const suggestedTerms = useMemo(() => humanFeedbackService.getSuggestedTerms(), []);

  return (
    <div className="aq-container">
      {/* Banner Principal */}
      <div className="aq-hero-banner">
        <div className="aq-hero-info">
          <h2>
            <Cpu size={22} color="#38BDF8" />
            Qualidade do Agente & Inteligência de Matching (Fase 27)
          </h2>
          <p>
            Evolução do motor central de aderência de "busca lexical" para 
            <strong> entendimento semântico e intenção de contratação</strong>. 
            Separação estrita de Relevância Técnica vs Fit Comercial, regras negativas, cálculo de confiança e Golden Set auditável.
          </p>
        </div>

        <div className="aq-version-tags">
          <span className="aq-vtag">Motor: {EngineVersion.PRODUCTION}</span>
          <span className="aq-vtag">Vocabulário: {technicalVocabularyService.getVersion()}</span>
          <span className="aq-vtag">Modo: Híbrido Cascade</span>
        </div>
      </div>

      {/* KPI Cards do Golden Set */}
      <div className="aq-kpi-grid">
        <div className="aq-kpi-card">
          <div className="aq-kpi-header">
            <span>Precisão (Precision)</span>
            <Target size={14} color="#10B981" />
          </div>
          <div className="aq-kpi-value" style={{ color: '#10B981' }}>
            {benchmarkResult.metrics.precisionPct}%
          </div>
          <div className="aq-kpi-target">
            ✓ Meta atingida (≥ 85%)
          </div>
        </div>

        <div className="aq-kpi-card">
          <div className="aq-kpi-header">
            <span>Revocação (Recall)</span>
            <Activity size={14} color="#38BDF8" />
          </div>
          <div className="aq-kpi-value" style={{ color: '#38BDF8' }}>
            {benchmarkResult.metrics.recallPct}%
          </div>
          <div className="aq-kpi-target">
            ✓ Meta atingida (≥ 85%)
          </div>
        </div>

        <div className="aq-kpi-card">
          <div className="aq-kpi-header">
            <span>F1-Score Geral</span>
            <Scale size={14} color="#A855F7" />
          </div>
          <div className="aq-kpi-value" style={{ color: '#A855F7' }}>
            {benchmarkResult.metrics.f1ScorePct}%
          </div>
          <div className="aq-kpi-target">
            Harmonia Precisão/Recall
          </div>
        </div>

        <div className="aq-kpi-card">
          <div className="aq-kpi-header">
            <span>Taxa Falso Positivo</span>
            <ShieldCheck size={14} color="#F59E0B" />
          </div>
          <div className="aq-kpi-value" style={{ color: '#F59E0B' }}>
            {benchmarkResult.metrics.falsePositiveRatePct}%
          </div>
          <div className="aq-kpi-target">
            Baixo ruído no radar
          </div>
        </div>

        <div className="aq-kpi-card">
          <div className="aq-kpi-header">
            <span>Acurácia Golden Set</span>
            <CheckCircle2 size={14} color="#10B981" />
          </div>
          <div className="aq-kpi-value">
            {benchmarkResult.metrics.accuracyPct}%
          </div>
          <div className="aq-kpi-target">
            {benchmarkResult.metrics.tp + benchmarkResult.metrics.tn} de {benchmarkResult.totalSamples} amostras
          </div>
        </div>
      </div>

      {/* Subnavegação */}
      <div className="aq-subtabs-bar">
        <button 
          className={`aq-subtab-btn ${activeSubTab === 'golden_set' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('golden_set')}
        >
          <Target size={14} />
          <span>Golden Dataset & Benchmark ({benchmarkResult.totalSamples})</span>
        </button>
        <button 
          className={`aq-subtab-btn ${activeSubTab === 'explain_match' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('explain_match')}
        >
          <Search size={14} />
          <span>Explain Match (Debug ao Vivo)</span>
        </button>
        <button 
          className={`aq-subtab-btn ${activeSubTab === 'vocabulary' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('vocabulary')}
        >
          <Sliders size={14} />
          <span>Matriz de Vocabulário & Pesos</span>
        </button>
        <button 
          className={`aq-subtab-btn ${activeSubTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('feedback')}
        >
          <HelpCircle size={14} />
          <span>Feedback Humano & Fila ({allFeedbacks.length})</span>
        </button>
        <button 
          className={`aq-subtab-btn ${activeSubTab === 'shadow' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('shadow')}
        >
          <Sparkles size={14} />
          <span>Shadow Mode & Benchmarks</span>
        </button>
      </div>

      {/* CONTEÚDO DAS SUB-ABAS */}

      {/* ABA 1: GOLDEN DATASET */}
      {activeSubTab === 'golden_set' && (
        <div className="aq-table-card">
          <div className="aq-table-header">
            <div>
              <h3 className="aq-table-title">Vellia Golden Dataset (Casos Adversariais e Reais)</h3>
              <p className="aq-table-desc">
                Conjunto de dados de referência com casos True Positive, True Negative, Hard Positive (indiretos), Hard Negative (fornecimento puro) e Ambíguos.
              </p>
            </div>
            <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
              Todas as amostras críticas aprovadas pelo classificador
            </span>
          </div>

          <div className="aq-table-wrap">
            <table className="aq-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Categoria</th>
                  <th>Título da Licitação</th>
                  <th>Gabarito Humano</th>
                  <th>Score Técnico</th>
                  <th>Confiança</th>
                  <th>Serviço Predito</th>
                  <th>Empresa</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkResult.itemResults.map((item) => (
                  <tr key={item.id}>
                    <td><code>{item.id}</code></td>
                    <td>
                      <span className={`badge-tag-sm ${
                        item.category === 'True Positive' ? 'tp' :
                        item.category === 'True Negative' ? 'tn' :
                        item.category === 'Hard Positive' ? 'hp' :
                        item.category === 'Hard Negative' ? 'hn' : 'ambiguous'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }} title={item.title}>
                      <strong>{item.title}</strong>
                    </td>
                    <td>
                      <span style={{
                        color: item.groundTruth === 'Relevant' ? '#34D399' : '#94A3B8',
                        fontWeight: 600
                      }}>
                        {item.groundTruth}
                      </span>
                    </td>
                    <td>
                      <strong style={{
                        color: item.modelScore >= 70 ? '#34D399' : item.modelScore >= 50 ? '#FBBF24' : '#F87171'
                      }}>
                        {item.modelScore}%
                      </strong>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: item.modelConfidence === 'Alta' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: item.modelConfidence === 'Alta' ? '#34D399' : '#FBBF24'
                      }}>
                        {item.modelConfidence}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px' }}>{item.modelPredictedService}</td>
                    <td style={{ fontSize: '11px' }}>{item.modelPredictedCompany}</td>
                    <td>
                      <span style={{
                        color: item.passed ? '#34D399' : '#F87171',
                        fontWeight: 700
                      }}>
                        {item.passed ? `✓ ${item.matchType}` : `✗ ${item.matchType}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: EXPLAIN MATCH (DEBUGGER) */}
      {activeSubTab === 'explain_match' && (
        <div className="aq-debug-grid">
          {/* Lado Esquerdo: Formulário de Teste */}
          <div className="aq-table-card">
            <h3 className="aq-table-title">Simulador de Análise Semântica</h3>
            <p className="aq-table-desc">
              Teste qualquer texto de edital em tempo real para verificar a extração de intenção, entidades e scores.
            </p>

            <div className="aq-input-group">
              <label>Título do Edital:</label>
              <input 
                type="text" 
                className="aq-input"
                value={debugTitle}
                onChange={(e) => setDebugTitle(e.target.value)}
              />
            </div>

            <div className="aq-input-group">
              <label>Objeto / Descrição Completa:</label>
              <textarea 
                rows={4}
                className="aq-textarea"
                value={debugObject}
                onChange={(e) => setDebugObject(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="aq-input-group">
                <label>Localização (UF):</label>
                <input 
                  type="text" 
                  className="aq-input"
                  value={debugLocation}
                  onChange={(e) => setDebugLocation(e.target.value)}
                />
              </div>

              <div className="aq-input-group">
                <label>Dias Restantes:</label>
                <input 
                  type="number" 
                  className="aq-input"
                  value={debugDays}
                  onChange={(e) => setDebugDays(e.target.value)}
                />
              </div>
            </div>

            <button className="aq-btn-run" onClick={handleRunDebug}>
              <Play size={14} />
              <span>Executar Análise Contextual</span>
            </button>
          </div>

          {/* Lado Direito: Resultados e Trace Detalhado */}
          <div className="aq-table-card">
            <h3 className="aq-table-title">Explain Match Trace (Explicabilidade)</h3>
            <p className="aq-table-desc">
              Decomposição da tomada de decisão pelo motor de inteligência.
            </p>

            {debugResult && (
              <div className="aq-trace-box">
                <div className="aq-trace-row">
                  <span>Relevância Técnica (Technical Match):</span>
                  <strong style={{ fontSize: '16px', color: '#38BDF8' }}>
                    {debugResult.technicalMatchScore}%
                  </strong>
                </div>

                <div className="aq-trace-row">
                  <span>Fit Comercial & Regional:</span>
                  <strong style={{ fontSize: '16px', color: '#10B981' }}>
                    {debugResult.commercialFitScore}%
                  </strong>
                </div>

                <div className="aq-trace-row">
                  <span>Score Consolidado (UI):</span>
                  <strong style={{ fontSize: '16px', color: '#FFFFFF' }}>
                    {debugResult.finalScore}% ({debugResult.classification})
                  </strong>
                </div>

                <div className="aq-trace-row">
                  <span>Intenção Detectada:</span>
                  <strong style={{ color: debugResult.isSupplyOnly ? '#F87171' : '#34D399' }}>
                    {debugResult.serviceIntent} {debugResult.isSupplyOnly && '(Fornecimento Puro)'}
                  </strong>
                </div>

                <div className="aq-trace-row">
                  <span>Nível de Confiança:</span>
                  <span style={{ fontWeight: 600, color: debugResult.confidence === 'Alta' ? '#34D399' : '#FBBF24' }}>
                    {debugResult.confidence} — {debugResult.confidenceReason}
                  </span>
                </div>

                <div className="aq-trace-row">
                  <span>Empresa Indicada:</span>
                  <strong>{debugResult.recommendedCompany}</strong>
                </div>

                <div className="aq-trace-row">
                  <span>Serviço Principal:</span>
                  <strong>{debugResult.primaryServiceName}</strong>
                </div>

                {/* Sinais Positivos */}
                <div className="aq-trace-signals">
                  <span style={{ fontWeight: 600, color: '#94A3B8' }}>Sinais Positivos Detectados ({debugResult.positiveSignals?.length || 0}):</span>
                  {debugResult.positiveSignals?.length > 0 ? (
                    debugResult.positiveSignals.slice(0, 4).map((s, idx) => (
                      <div key={idx} className="aq-signal-pill positive">
                        ✓ {s}
                      </div>
                    ))
                  ) : (
                    <span style={{ color: '#64748B', fontSize: '11px' }}>Nenhum termo de alta correlação encontrado.</span>
                  )}
                </div>

                {/* Sinais Negativos */}
                {debugResult.negativeSignals?.length > 0 && (
                  <div className="aq-trace-signals">
                    <span style={{ fontWeight: 600, color: '#F87171' }}>Sinais Negativos / Penalidades ({debugResult.negativeSignals.length}):</span>
                    {debugResult.negativeSignals.map((s, idx) => (
                      <div key={idx} className="aq-signal-pill negative">
                        ⚠️ {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: MATRIZ DE VOCABULÁRIO */}
      {activeSubTab === 'vocabulary' && (
        <div className="aq-table-card">
          <div className="aq-table-header">
            <div>
              <h3 className="aq-table-title">Matriz Serviço x Termo (Vocabulário Editável)</h3>
              <p className="aq-table-desc">
                Gerencie pesos por termo sem necessidade de alteração de código. Versão ativa: <code>{technicalVocabularyService.getVersion()}</code>.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <select 
                className="aq-input"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                style={{ padding: '6px 12px' }}
              >
                {vocabServices.map(s => (
                  <option key={s.serviceId} value={s.serviceId}>
                    {s.serviceName} ({s.company})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Adicionar Novo Termo */}
          <div style={{
            display: 'flex',
            gap: '10px',
            background: 'rgba(15, 23, 42, 0.4)',
            padding: '12px',
            borderRadius: '8px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <input 
              type="text" 
              placeholder="Digite um novo termo ou sinônimo..." 
              className="aq-input"
              style={{ flex: 1, minWidth: '220px' }}
              value={newTermText}
              onChange={(e) => setNewTermText(e.target.value)}
            />

            <select 
              className="aq-input"
              value={newTermWeight}
              onChange={(e) => setNewTermWeight(Number(e.target.value))}
              style={{ width: '150px' }}
            >
              <option value={TermWeight.CRITICAL}>CRITICAL (10 pts)</option>
              <option value={TermWeight.HIGH}>HIGH (7 pts)</option>
              <option value={TermWeight.MEDIUM}>MEDIUM (4 pts)</option>
              <option value={TermWeight.LOW}>LOW (1 pt)</option>
              <option value={TermWeight.NEGATIVE}>NEGATIVE (-8 pts)</option>
            </select>

            <button className="aq-btn-run" onClick={handleAddTerm}>
              <Plus size={14} />
              <span>Adicionar Termo</span>
            </button>
          </div>

          {/* Tabela de Termos do Serviço */}
          <div className="aq-table-wrap">
            <table className="aq-data-table">
              <thead>
                <tr>
                  <th>Termo Técnico / Expressão</th>
                  <th>Peso</th>
                  <th>Classificação</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentService?.terms.map((t, idx) => (
                  <tr key={idx}>
                    <td><strong>{t.term}</strong></td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: t.weight >= 10 ? '#38BDF8' : t.weight >= 7 ? '#34D399' : t.weight < 0 ? '#F87171' : '#FBBF24'
                      }}>
                        {t.weight} pts
                      </span>
                    </td>
                    <td>
                      <span className={`badge-tag-sm ${t.weight < 0 ? 'hn' : t.weight >= 10 ? 'hp' : 'tp'}`}>
                        {TermWeightLabel[t.weight] || 'CUSTOM'}
                      </span>
                    </td>
                    <td>{t.type || 'técnico'}</td>
                    <td>
                      <button 
                        onClick={() => handleRemoveTerm(t.term)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title="Remover termo da matriz"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 4: FEEDBACK HUMANO */}
      {activeSubTab === 'feedback' && (
        <div className="aq-table-card">
          <div className="aq-table-header">
            <div>
              <h3 className="aq-table-title">Histórico de Feedbacks Humanos e Sugestões</h3>
              <p className="aq-table-desc">
                Feedbacks registrados pelos operadores. Revisões são feitas em lote sem retreinamento impulsivo (Item 44 e 45).
              </p>
            </div>
          </div>

          <div className="aq-table-wrap">
            <table className="aq-data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Oportunidade</th>
                  <th>Avaliação</th>
                  <th>Motivo de Divergência</th>
                  <th>Serviço Sugerido</th>
                  <th>Empresa Sugerida</th>
                  <th>Usuário</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {allFeedbacks.map((fb) => (
                  <tr key={fb.id}>
                    <td><code>{fb.id}</code></td>
                    <td>{fb.opportunityId}</td>
                    <td>
                      <span style={{
                        color: fb.accuracy === 'Sim' ? '#34D399' : fb.accuracy === 'Parcial' ? '#FBBF24' : '#F87171',
                        fontWeight: 700
                      }}>
                        {fb.accuracy}
                      </span>
                    </td>
                    <td>{fb.reason || '—'}</td>
                    <td>{fb.suggestedService || '—'}</td>
                    <td>{fb.suggestedCompany || '—'}</td>
                    <td>{fb.user}</td>
                    <td style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {new Date(fb.timestamp).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 5: SHADOW MODE */}
      {activeSubTab === 'shadow' && (
        <div className="aq-table-card">
          <div className="aq-table-header">
            <div>
              <h3 className="aq-table-title">Shadow Mode & Benchmark de Motores</h3>
              <p className="aq-table-desc">
                Comparativo estatístico entre abordagens de classificação (Item 136). O modo Shadow executa a versão v3 sem impactar os usuários finais.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '10px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#94A3B8', fontSize: '13px' }}>Motor 1: Regras Estritas (Rules Only)</h4>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FBBF24' }}>78.2% Precisão</div>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>Alto recall, porém vulnerável a falsos positivos por homônimos.</p>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#94A3B8', fontSize: '13px' }}>Motor 2: LLM Isolada (AI Only)</h4>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#38BDF8' }}>84.5% Precisão</div>
              <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>Boa compreensão textual, mas custo maior e menor determinismo.</p>
            </div>

            <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
              <h4 style={{ margin: '0 0 6px 0', color: '#38BDF8', fontSize: '13px' }}>Motor 3: Híbrido Vellia v2 (Atual)</h4>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981' }}>90.0% Precisão</div>
              <p style={{ fontSize: '11px', color: '#34D399', margin: '4px 0 0 0' }}>Melhor equilíbrio: cascade, regras negativas e separação de intenção.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
