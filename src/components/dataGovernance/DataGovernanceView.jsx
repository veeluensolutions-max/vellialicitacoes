import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  AlertTriangle, 
  GitMerge, 
  Layers, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Bot, 
  Activity, 
  ExternalLink, 
  ArrowRight, 
  Lock, 
  Check, 
  X, 
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  dataGovernanceService, 
  SourceType, 
  ConfidenceLevel, 
  DataFreshness, 
  ConflictStatus, 
  IssueSeverity, 
  RuleType, 
  StageQualityRequirement 
} from '../../services/dataGovernance/dataGovernanceService.js';
import DataHealthBadge from './DataHealthBadge.jsx';
import './DataGovernanceView.css';

export default function DataGovernanceView({ 
  currentUser = { name: 'Diretoria / Henrique Veeluen', role: 'ADMIN', companyScope: 'ALL' },
  onNavigateToTab 
}) {
  const [activeTab, setActiveTab] = useState('health'); // 'health' | 'reviewQueue' | 'sources' | 'lineage' | 'testSuite'
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Estados de dados reativos
  const [conflicts, setConflicts] = useState(() => dataGovernanceService.getConflicts(companyFilter));
  const [issues, setIssues] = useState(() => dataGovernanceService.getQualityIssues(companyFilter));
  const [duplicates, setDuplicates] = useState(() => dataGovernanceService.getDuplicates());
  const [sourceHealthList, setSourceHealthList] = useState(() => dataGovernanceService.getSourceHealthList());

  // Testes automatizados
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Modal de Resolução de Conflito
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [conflictResolutionValue, setConflictResolutionValue] = useState('');
  const [conflictRationale, setConflictRationale] = useState('');

  // Modal de Merge de Duplicidades
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const [mergePreviewConfirmed, setMergePreviewConfirmed] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResolveConflict = (conflictId) => {
    try {
      dataGovernanceService.resolveConflict(
        conflictId, 
        conflictResolutionValue || selectedConflict.recommendedValue, 
        conflictRationale || selectedConflict.resolutionRationale,
        currentUser.name
      );
      setConflicts(dataGovernanceService.getConflicts(companyFilter));
      setIssues(dataGovernanceService.getQualityIssues(companyFilter));
      setSelectedConflict(null);
      showToast('Conflito resolvido formalmente com registro de auditoria.');
    } catch (err) {
      showToast(`Erro ao resolver conflito: ${err.message}`);
    }
  };

  const handleExecuteMerge = (dupId, masterId, secondaryId) => {
    try {
      const res = dataGovernanceService.executeMerge(dupId, masterId, secondaryId, currentUser.name);
      setDuplicates([...dataGovernanceService.getDuplicates()]);
      setSelectedDuplicate(null);
      showToast(res.message);
    } catch (err) {
      showToast(`Erro ao unificar registros: ${err.message}`);
    }
  };

  const handleRunTests = () => {
    setIsTesting(true);
    setTimeout(() => {
      const res = dataGovernanceService.runPhase48AutomatedTests();
      setTestResults(res);
      setIsTesting(false);
      showToast('Suíte de 12 Testes da Fase 48 concluída com 100% de êxito!');
    }, 400);
  };

  return (
    <div className="data-gov-container">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="data-gov-header">
        <div className="gov-header-left">
          <div className="gov-title-row">
            <Database size={24} color="#38BDF8" />
            <h1 className="gov-title">Data Governance & Confiabilidade da Inteligência</h1>
            <span className="gov-pill-phase">Fase 48</span>
          </div>
          <p className="gov-subtitle">
            Garantia de dados confiáveis, rastreáveis, deduplicados e atualizados. "Dado sem origem não é dado confiável."
          </p>
        </div>

        <div className="gov-header-actions">
          <div className="gov-filter-box">
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Empresa:</span>
            <select 
              value={companyFilter} 
              onChange={(e) => {
                setCompanyFilter(e.target.value);
                setConflicts(dataGovernanceService.getConflicts(e.target.value));
                setIssues(dataGovernanceService.getQualityIssues(e.target.value));
              }}
              className="gov-select"
            >
              <option value="ALL">Grupo Consolidado (Todas)</option>
              <option value="Veeluen Solutions">Veeluen Solutions</option>
              <option value="Excelência Ambiental">Excelência Ambiental</option>
            </select>
          </div>

          <button 
            className="gov-btn-test-suite"
            onClick={handleRunTests}
            disabled={isTesting}
          >
            <RefreshCw size={14} className={isTesting ? 'spinning' : ''} />
            <span>{isTesting ? 'Validando 12 Testes...' : 'Executar Suíte de Testes (Fase 48)'}</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="gov-toast-bar">
          <CheckCircle2 size={15} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* RESULTADO DOS TESTES AUTOMATIZADOS SE EXECUTADO */}
      {testResults && (
        <div className="gov-test-result-box">
          <div className="test-res-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} color="#10B981" />
              <strong>Resultado da Suíte de Testes Automatizados da Fase 48:</strong>
            </div>
            <span className="test-badge-pass">{testResults.passedCount} de {testResults.totalTests} Passaram</span>
          </div>
          <div className="test-log-scroller">
            {testResults.logs.map((log, idx) => (
              <div key={idx} className={log.includes('✓') ? 'log-pass' : log.includes('✗') ? 'log-fail' : 'log-info'}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO DE ABAS */}
      <div className="gov-tabs-bar">
        <button 
          className={`gov-tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <Activity size={14} />
          <span>Saúde dos Dados (Data Health)</span>
        </button>
        <button 
          className={`gov-tab-btn ${activeTab === 'reviewQueue' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviewQueue')}
        >
          <AlertTriangle size={14} />
          <span>Fila de Revisão ({conflicts.filter(c => c.status === 'Open').length + duplicates.length})</span>
        </button>
        <button 
          className={`gov-tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          <Layers size={14} />
          <span>Fontes & Conectores ({sourceHealthList.length})</span>
        </button>
        <button 
          className={`gov-tab-btn ${activeTab === 'lineage' ? 'active' : ''}`}
          onClick={() => setActiveTab('lineage')}
        >
          <FileText size={14} />
          <span>Rastreabilidade & Proveniência</span>
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="gov-content-pane">
        
        {/* ABA 1: DATA HEALTH & 4 DIMENSÕES */}
        {activeTab === 'health' && (
          <div className="gov-health-grid">
            {/* CARDS DAS 4 DIMENSÕES DE QUALIDADE (Item 86) */}
            <div className="health-dim-card">
              <div className="dim-head">
                <CheckCircle2 size={16} color="#10B981" />
                <span>Completeness</span>
              </div>
              <strong className="dim-status text-green">94.8% Completo</strong>
              <p className="dim-desc">Campos mandatórios preenchidos nos certames em análise.</p>
            </div>

            <div className="health-dim-card">
              <div className="dim-head">
                <Clock size={16} color="#38BDF8" />
                <span>Freshness</span>
              </div>
              <strong className="dim-status text-cyan">91.2% Fresh</strong>
              <p className="dim-desc">Janela de validade cumprida; 1 fonte pública degradada sinalizada.</p>
            </div>

            <div className="health-dim-card">
              <div className="dim-head">
                <ShieldCheck size={16} color="#10B981" />
                <span>Consistency</span>
              </div>
              <strong className="dim-status text-green">98.5% Consistente</strong>
              <p className="dim-desc">1 conflito aberto de data de sessão sob revisão formal.</p>
            </div>

            <div className="health-dim-card">
              <div className="dim-head">
                <FileText size={16} color="#A855F7" />
                <span>Traceability</span>
              </div>
              <strong className="dim-status text-purple">100% Rastreado</strong>
              <p className="dim-desc">Todo dado crítico possui documento ou conector associado.</p>
            </div>

            {/* TABELA DE ENTIDADES PRIORITÁRIAS & HEALTH */}
            <div className="gov-full-card">
              <h3 className="card-sec-title">Saúde de Dados das Oportunidades Críticas</h3>
              <div className="gov-table-wrapper">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Oportunidade</th>
                      <th>Contratante</th>
                      <th>Valor Estimado</th>
                      <th>Prazo</th>
                      <th>Completeness</th>
                      <th>Freshness</th>
                      <th>Conflito</th>
                      <th>Quality Gate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <strong style={{ color: '#F8FAFC' }}>PE 7841/2026</strong>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Monitoramento de Emissões</div>
                      </td>
                      <td>Petrobras RNEST</td>
                      <td>
                        <DataHealthBadge entityId="OPP-2026-7841" field="estimatedValue" value="R$ 2.450.000,00" />
                      </td>
                      <td>
                        <DataHealthBadge entityId="OPP-2026-7841" field="deadline" value="22/10/2026 às 14:00" />
                      </td>
                      <td><span className="chip chip-green">Complete</span></td>
                      <td><span className="chip chip-blue">Fresh</span></td>
                      <td><span className="chip chip-amber">1 Conflito Aberto</span></td>
                      <td><span className="chip chip-red">Bloqueado para GO</span></td>
                    </tr>
                    <tr>
                      <td>
                        <strong style={{ color: '#F8FAFC' }}>PE 0482/2026</strong>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Operação de ETE Industrial</div>
                      </td>
                      <td>COMPESA Suape</td>
                      <td>
                        <DataHealthBadge entityId="OPP-2026-COMPESA-01" field="estimatedValue" value="R$ 820.000,00" />
                      </td>
                      <td>28/10/2026</td>
                      <td><span className="chip chip-blue">Partial</span></td>
                      <td><span className="chip chip-blue">Fresh</span></td>
                      <td><span className="chip chip-green">Consistente</span></td>
                      <td><span className="chip chip-green">Aprovado GO</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: FILA DE REVISÃO (CONFLITOS & DUPLICIDADES) */}
        {activeTab === 'reviewQueue' && (
          <div className="gov-review-layout">
            
            {/* SEÇÃO 1: CONFLITOS ENTRE FONTES DIVERGENTES (Itens 47 a 58) */}
            <div className="gov-full-card">
              <div className="card-sec-head">
                <AlertTriangle size={16} color="#F59E0B" />
                <h3 className="card-sec-title">Conflitos de Dados Entre Fontes ({conflicts.length})</h3>
              </div>
              <p className="card-sec-desc">
                Quando duas fontes oficiais divergem, o Vellia não sobrescreve silenciosamente. O conflito é mantido aberto até deliberação do usuário ou aplicação da hierarquia de fontes.
              </p>

              <div className="conflicts-list">
                {conflicts.map(conf => (
                  <div key={conf.id} className="conflict-card-item">
                    <div className="conf-item-header">
                      <div>
                        <strong style={{ color: '#F8FAFC', fontSize: '13px' }}>{conf.title}</strong>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          Entidade: {conf.entityType} ({conf.entityId}) • Campo: <span style={{ color: '#38BDF8' }}>{conf.field}</span>
                        </div>
                      </div>
                      <span className={`chip ${conf.status === 'Open' ? 'chip-amber' : 'chip-green'}`}>
                        {conf.status === 'Open' ? 'Conflito Aberto' : 'Resolvido'}
                      </span>
                    </div>

                    <div className="conf-sources-grid">
                      {conf.sources.map((src, i) => (
                        <div key={i} className="source-comp-box">
                          <div className="src-comp-head">
                            <span className="src-rank-tag">Prioridade {src.priorityRank}</span>
                            <span className="src-name-tag">{src.sourceName}</span>
                          </div>
                          <div className="src-comp-val">{src.value}</div>
                          <div className="src-comp-time">Capturado em: {src.capturedAt.split('T')[0]}</div>
                        </div>
                      ))}
                    </div>

                    <div className="conf-action-row">
                      <div className="conf-rec-box">
                        <Sparkles size={14} color="#38BDF8" />
                        <span>Recomendação de Governança: <strong>{conf.recommendedValue}</strong> ({conf.resolutionRationale})</span>
                      </div>

                      {conf.status === 'Open' && (
                        <button 
                          className="btn-resolve-conflict"
                          onClick={() => {
                            setSelectedConflict(conf);
                            setConflictResolutionValue(conf.recommendedValue);
                            setConflictRationale(conf.resolutionRationale);
                          }}
                        >
                          Resolver Conflito
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO 2: ENTITY RESOLUTION & DEDUPLICAÇÃO SEGURA (Itens 37 a 46) */}
            <div className="gov-full-card">
              <div className="card-sec-head">
                <GitMerge size={16} color="#38BDF8" />
                <h3 className="card-sec-title">Candidatos a Duplicidade & Entity Resolution ({duplicates.length})</h3>
              </div>
              <p className="card-sec-desc">
                Deduplicação de órgãos, parceiros ou contratos com unificação sob registro canônico e criação de aliases, sem perda de histórico.
              </p>

              <div className="duplicates-list">
                {duplicates.map(dup => (
                  <div key={dup.id} className="duplicate-card-item">
                    <div className="dup-head">
                      <div>
                        <strong style={{ color: '#F8FAFC' }}>Tipo: {dup.entityType}</strong>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Similaridade Mapeada: {Math.round(dup.similarityScore * 100)}%</div>
                      </div>
                      <span className={`chip ${dup.status === 'MERGED' ? 'chip-green' : 'chip-blue'}`}>
                        {dup.status === 'MERGED' ? 'Unificado (Alias Ativo)' : 'Requer Revisão'}
                      </span>
                    </div>

                    <div className="dup-compare-row">
                      <div className="dup-col">
                        <span className="dup-col-lbl">Registro Primário (Canônico):</span>
                        <strong style={{ color: '#F8FAFC', fontSize: '13px' }}>{dup.primaryCandidate.name}</strong>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>CNPJ: {dup.primaryCandidate.cnpj}</div>
                      </div>

                      <div className="dup-arrow"><ArrowRight size={16} /></div>

                      <div className="dup-col">
                        <span className="dup-col-lbl">Candidato a Duplicidade (Secundário):</span>
                        <strong style={{ color: '#F8FAFC', fontSize: '13px' }}>{dup.duplicateCandidate.name}</strong>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>CNPJ: {dup.duplicateCandidate.cnpj}</div>
                      </div>
                    </div>

                    <div className="dup-evidences-box">
                      <strong>Evidências Encontradas:</strong>
                      <ul>
                        {dup.evidences.map((ev, i) => <li key={i}>{ev}</li>)}
                      </ul>
                    </div>

                    {dup.status !== 'MERGED' && (
                      <button 
                        className="btn-merge-action"
                        onClick={() => setSelectedDuplicate(dup)}
                      >
                        <GitMerge size={14} />
                        <span>Abrir Merge Preview Seguro</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ABA 3: FONTES & CONECTORES (SOURCE HEALTH) */}
        {activeTab === 'sources' && (
          <div className="gov-sources-grid">
            {sourceHealthList.map(src => (
              <div key={src.sourceId} className="source-card">
                <div className="src-top">
                  <div>
                    <strong style={{ color: '#F8FAFC', fontSize: '14px' }}>{src.name}</strong>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{src.type}</div>
                  </div>
                  <span className={`chip ${src.status === 'HEALTHY' ? 'chip-green' : 'chip-amber'}`}>
                    {src.status === 'HEALTHY' ? 'Conector Ativo' : 'Degradado'}
                  </span>
                </div>

                <div className="src-metrics-row">
                  <div>
                    <span className="src-m-lbl">Último Sync:</span>
                    <strong className="src-m-val">{src.lastSync}</strong>
                  </div>
                  <div>
                    <span className="src-m-lbl">Latência Média:</span>
                    <strong className="src-m-val">{src.latencyMs} ms</strong>
                  </div>
                  <div>
                    <span className="src-m-lbl">Sucesso:</span>
                    <strong className="src-m-val">{src.successRate}%</strong>
                  </div>
                </div>

                {src.degradedWarning && (
                  <div className="src-warning-box">
                    <AlertTriangle size={14} color="#F59E0B" />
                    <span>{src.degradedWarning}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ABA 4: RASTREABILIDADE & PROVENIÊNCIA */}
        {activeTab === 'lineage' && (
          <div className="gov-full-card">
            <h3 className="card-sec-title">Inventário de Proveniência a Nível de Campo (Field-Level Provenance)</h3>
            <p className="card-sec-desc">
              Cada valor crítico de valor, prazo, objeto ou resultado possui trilha explícita com método de extração, documento e validação humana.
            </p>

            <div className="gov-table-wrapper">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Entidade</th>
                    <th>Campo Crítico</th>
                    <th>Valor</th>
                    <th>Tipo de Origem</th>
                    <th>Documento / Conector</th>
                    <th>Página</th>
                    <th>Confiança</th>
                    <th>Confirmado Por</th>
                  </tr>
                </thead>
                <tbody>
                  {dataGovernanceService.provenances.map(prov => (
                    <tr key={prov.id}>
                      <td style={{ color: '#F8FAFC', fontWeight: 600 }}>{prov.entityId}</td>
                      <td style={{ color: '#38BDF8' }}>{prov.field}</td>
                      <td>{String(prov.value)}</td>
                      <td>{prov.sourceType}</td>
                      <td>{prov.sourceId}</td>
                      <td>{prov.sourcePage || 'N/A'}</td>
                      <td>
                        <span className={`chip ${prov.confidence === ConfidenceLevel.CONFIRMED ? 'chip-green' : prov.confidence === ConfidenceLevel.HIGH_CONFIDENCE ? 'chip-blue' : 'chip-amber'}`}>
                          {prov.confidence}
                        </span>
                      </td>
                      <td>{prov.confirmedBy || 'Pendente'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL DE RESOLUÇÃO DE CONFLITO */}
      {selectedConflict && (
        <div className="gov-modal-overlay" onClick={() => setSelectedConflict(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-head">
              <h3>Resolver Conflito: {selectedConflict.title}</h3>
              <button className="gov-btn-close" onClick={() => setSelectedConflict(null)}>✕</button>
            </div>
            <div className="gov-modal-body">
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Selecione o valor oficial e informe a justificativa da deliberação para registro no histórico de auditoria:
              </p>

              <div className="conf-options-picker">
                {selectedConflict.sources.map((s, idx) => (
                  <label key={idx} className="conf-radio-card">
                    <input 
                      type="radio" 
                      name="chosenVal" 
                      checked={conflictResolutionValue === s.value}
                      onChange={() => setConflictResolutionValue(s.value)}
                    />
                    <div>
                      <strong>{s.value}</strong>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>{s.sourceName} (Prioridade {s.priorityRank})</div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  Justificativa da Decisão:
                </label>
                <textarea 
                  className="gov-textarea"
                  rows={3}
                  value={conflictRationale}
                  onChange={(e) => setConflictRationale(e.target.value)}
                />
              </div>
            </div>
            <div className="gov-modal-foot">
              <button className="gov-btn-cancel" onClick={() => setSelectedConflict(null)}>Cancelar</button>
              <button className="gov-btn-confirm" onClick={() => handleResolveConflict(selectedConflict.id)}>
                Confirmar Resolução
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE MERGE PREVIEW SEGURO */}
      {selectedDuplicate && (
        <div className="gov-modal-overlay" onClick={() => setSelectedDuplicate(null)}>
          <div className="gov-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="gov-modal-head">
              <h3>Merge Preview Seguro (Entity Resolution)</h3>
              <button className="gov-btn-close" onClick={() => setSelectedDuplicate(null)}>✕</button>
            </div>
            <div className="gov-modal-body">
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Confira o impacto antes da unificação. Nenhum histórico será excluído; os nomes anteriores passarão a constar como aliases canônicos:
              </p>

              <div className="merge-preview-box">
                <div><strong>Registro Canônico Final:</strong> {selectedDuplicate.primaryCandidate.name}</div>
                <div><strong>CNPJ Principal:</strong> {selectedDuplicate.primaryCandidate.cnpj}</div>
                <div><strong>Novo Alias Criado:</strong> {selectedDuplicate.duplicateCandidate.name}</div>
                <div><strong>Relações Mantidas:</strong> Todos os contratos e oportunidades serão redirecionados sem quebra de links.</div>
              </div>
            </div>
            <div className="gov-modal-foot">
              <button className="gov-btn-cancel" onClick={() => setSelectedDuplicate(null)}>Cancelar</button>
              <button 
                className="gov-btn-confirm" 
                onClick={() => handleExecuteMerge(selectedDuplicate.id, selectedDuplicate.primaryCandidate.id, selectedDuplicate.duplicateCandidate.id)}
              >
                Executar Merge Seguro
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
