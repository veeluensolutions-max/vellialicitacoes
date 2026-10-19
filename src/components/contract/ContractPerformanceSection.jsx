import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  FileText, 
  BookOpen, 
  Users, 
  Layers, 
  Sparkles, 
  Flame, 
  HelpCircle, 
  Check, 
  X, 
  Plus, 
  ExternalLink, 
  Lock, 
  ShieldCheck, 
  Clock, 
  Zap, 
  RefreshCw, 
  ArrowRight,
  ThumbsUp,
  Tag
} from 'lucide-react';
import { 
  contractPerformanceService, 
  ReviewStatus, 
  ReviewFrequency, 
  CostCategory, 
  CostSourceType, 
  PartnerPerformanceStatus, 
  RiskRealizationOutcome, 
  MitigationEffectiveness, 
  RootCauseCategory, 
  LessonCategory, 
  LessonStatus, 
  CapabilityAssetType 
} from '../../services/contract/contractPerformanceService.js';
import './ContractPerformanceSection.css';

export default function ContractPerformanceSection({ 
  contractId, 
  user = { name: 'Diretoria Executiva', role: 'ADMIN', viewFinancial: true },
  onOpenCopilot 
}) {
  const [review, setReview] = useState(() => contractPerformanceService.getReviewByContractId(contractId));
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'plannedVsActual' | 'risks' | 'partners' | 'lessons' | 'closure'
  const [toastMessage, setToastMessage] = useState(null);

  // Modais de Interação
  const [showCostModal, setShowCostModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Formulário de Custo
  const [costForm, setCostForm] = useState({
    category: CostCategory.LABORATORIO,
    description: '',
    plannedCost: '',
    observedCost: '',
    source: CostSourceType.DOCUMENT,
    sourceDetail: ''
  });

  // Formulário de Lição Aprendida
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    category: LessonCategory.OPERATIONS,
    impact: '',
    recommendation: '',
    sampleCount: 1
  });

  // Formulário de Encerramento Contratual
  const [closureForm, setClosureForm] = useState({
    objectivesMet: true,
    hasPendingObligations: false,
    overrideJustification: '',
    renewalOpportunityIdentified: false,
    eligibleForAttestation: true,
    scopeToAttest: review?.service || '',
    docType: CapabilityAssetType.ATESTADO,
    createCapabilityWorkflow: true
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadData = () => {
    setReview(contractPerformanceService.getReviewByContractId(contractId));
  };

  if (!review) {
    return (
      <div className="cps-empty-state">
        <AlertTriangle size={32} className="text-warning" />
        <h3>Avaliação de Performance não localizada para este contrato</h3>
      </div>
    );
  }

  const benchmark = contractPerformanceService.getInternalBenchmark(review.service, review.company);
  const applicableLessons = contractPerformanceService.getApplicableLessons(review.service, review.company);

  // Salvar Novo Custo Observado
  const handleSaveCost = (e) => {
    e.preventDefault();
    try {
      contractPerformanceService.addCostVariation(contractId, costForm, user.name);
      reloadData();
      setShowCostModal(false);
      setCostForm({
        category: CostCategory.LABORATORIO,
        description: '',
        plannedCost: '',
        observedCost: '',
        source: CostSourceType.DOCUMENT,
        sourceDetail: ''
      });
      showToast('Variação de custo registrada e margem operacional atualizada!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Salvar Nova Lição Aprendida (Inicia como DRAFT)
  const handleSaveLesson = (e) => {
    e.preventDefault();
    try {
      contractPerformanceService.addLessonLearned({
        ...lessonForm,
        contractId: review.contractId,
        service: review.service,
        company: review.company
      }, user.name);
      reloadData();
      setShowLessonModal(false);
      setLessonForm({
        title: '',
        description: '',
        category: LessonCategory.OPERATIONS,
        impact: '',
        recommendation: '',
        sampleCount: 1
      });
      showToast('Lição aprendida registrada em rascunho (Draft) para governança!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Aprovar Lição Aprendida
  const handleApproveLesson = (lessonId) => {
    try {
      contractPerformanceService.approveLessonLearned(lessonId, user.name);
      reloadData();
      showToast('Lição aprovada formalmente! Agora influenciará futuras propostas.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Concluir Encerramento Contratual & Capability Loop
  const handleCompleteClosure = (e) => {
    e.preventDefault();
    try {
      contractPerformanceService.completeContractClosure(contractId, closureForm, user.name);
      reloadData();
      setShowClosureModal(false);
      showToast('Contrato encerrado formalmente com snapshot e workflow de atestado criado!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Executar Testes Automatizados da Fase 47
  const handleRunTests = () => {
    setIsTesting(true);
    setShowTestModal(true);
    setTimeout(() => {
      const res = contractPerformanceService.runPhase47AutomatedTests();
      setTestResults(res);
      setIsTesting(false);
      reloadData();
    }, 400);
  };

  const dim = review.dimensionAssessments;

  return (
    <div className="cps-container">
      {/* Toast Notifier */}
      {toastMessage && (
        <div className="cps-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HEADER: PRINCÍPIO CLOSED-LOOP & LEARNING FIRST                         */}
      {/* ========================================================================= */}
      <div className="cps-banner-closed-loop">
        <div className="cps-banner-left">
          <Sparkles size={20} className="cps-glow-sparkle" />
          <div>
            <div className="cps-banner-title">
              <strong>CLOSED-LOOP LEARNING — INTELIGÊNCIA DE PERFORMANCE CONTRATUAL</strong>
              <span className="cps-pill-phase">FASE 47</span>
            </div>
            <p>
              Transforma a execução real em vantagem competitiva. O Vellia avalia margens observadas, desvios operacionais, riscos confirmados e novos atestados para alimentar futuras propostas.
            </p>
          </div>
        </div>

        <div className="cps-banner-actions">
          <button className="btn-cps-test" onClick={handleRunTests}>
            <Zap size={14} />
            <span>Testes Fase 47</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CARD LEARNING FIRST: Se Encerrado ou Com Lições Aprovadas              */}
      {/* ========================================================================= */}
      {review.isPostExecution && (
        <div className="cps-post-execution-card">
          <div className="cps-pe-header">
            <Award size={18} className="text-warning" />
            <div>
              <h4>Contrato Concluído — Post-Execution Review & Ativos de Capacidade</h4>
              <p>Este contrato foi formalmente encerrado. O aprendizado e a capacidade documental gerada estão consolidados.</p>
            </div>
          </div>

          <div className="cps-pe-grid">
            <div className="cps-pe-item">
              <span className="cps-pe-lbl">STATUS DO ENCERRAMENTO</span>
              <strong className="cps-pe-val text-success">
                <CheckCircle2 size={16} inline="true" /> Recebimento Definitivo
              </strong>
              <small>Todas as obrigações encerradas</small>
            </div>

            <div className="cps-pe-item">
              <span className="cps-pe-lbl">CAPABILITY LOOP (NOVO ATESTADO)</span>
              <strong className="cps-pe-val text-primary">
                {review.closureChecklist?.capabilityPotential?.eligibleForAttestation ? 'Atestado Estratégico Elegível' : 'Não Solicitado'}
              </strong>
              <small>{review.closureChecklist?.capabilityPotential?.workflowId ? `Workflow Ativo: ${review.closureChecklist.capabilityPotential.workflowId}` : 'Acervo CREA/CAT'}</small>
            </div>

            <div className="cps-pe-item">
              <span className="cps-pe-lbl">MARGEM OPERACIONAL FINAL</span>
              <strong className="cps-pe-val text-success">
                {user.viewFinancial ? (
                  dim.financeira.observedMarginPercent ? `${dim.financeira.observedMarginPercent}%` : 'Dado não informado'
                ) : (
                  <span className="cps-restricted"><Lock size={12} /> Restrito</span>
                )}
              </strong>
              <small>Planejada: {dim.financeira.plannedMarginPercent}%</small>
            </div>

            <div className="cps-pe-item">
              <span className="cps-pe-lbl">LIÇÕES APROVADAS</span>
              <strong className="cps-pe-val text-purple">
                {applicableLessons.length} Lições Ativas
              </strong>
              <small>Alimentando futuras licitações de ETE</small>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESUMO EXECUTIVO: PLANEJADO VS OBSERVADO (SEM SCORE OPACO)             */}
      {/* ========================================================================= */}
      <section className="cps-summary-cards-grid">
        <div className="cps-card-metric">
          <span className="cps-m-lbl">VALOR CONTRATUAL</span>
          <div className="cps-m-val text-primary">
            {user.viewFinancial ? (
              `R$ ${(dim.comercial.actualContractValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ) : (
              <span className="cps-restricted"><Lock size={14} /> Confidencial</span>
            )}
          </div>
          <span className="cps-m-sub">
            Original: R$ {(dim.comercial.plannedContractValue || 0).toLocaleString('pt-BR')} {dim.comercial.amendmentsTotal > 0 ? `(+R$ ${dim.comercial.amendmentsTotal.toLocaleString('pt-BR')})` : ''}
          </span>
        </div>

        <div className="cps-card-metric">
          <span className="cps-m-lbl">MARGEM: PLANEJADA vs OBSERVADA</span>
          <div className="cps-m-val">
            {user.viewFinancial ? (
              dim.financeira.observedMarginPercent !== null ? (
                <span className={dim.financeira.marginDeviationPercent < 0 ? 'text-danger' : 'text-success'}>
                  {dim.financeira.observedMarginPercent}%{' '}
                  <small style={{ fontSize: '0.85rem' }}>
                    ({dim.financeira.marginDeviationPercent >= 0 ? '+' : ''}{dim.financeira.marginDeviationPercent}%)
                  </small>
                </span>
              ) : (
                <span className="text-muted">Apurando medições</span>
              )
            ) : (
              <span className="cps-restricted"><Lock size={14} /> Restrito à Diretoria</span>
            )}
          </div>
          <span className="cps-m-sub">Planejado na proposta: {dim.financeira.plannedMarginPercent}%</span>
        </div>

        <div className="cps-card-metric">
          <span className="cps-m-lbl">MOBILIZAÇÃO REAL vs META</span>
          <div className="cps-m-val">
            <span className={dim.operacional.actualMobilizationDays > dim.operacional.plannedMobilizationDays ? 'text-warning' : 'text-success'}>
              {dim.operacional.actualMobilizationDays} dias
            </span>
          </div>
          <span className="cps-m-sub">
            Meta do edital: {dim.operacional.plannedMobilizationDays} dias ({dim.operacional.actualMobilizationDays - dim.operacional.plannedMobilizationDays > 0 ? `+${dim.operacional.actualMobilizationDays - dim.operacional.plannedMobilizationDays}d desvio` : 'no prazo'})
          </span>
        </div>

        <div className="cps-card-metric">
          <span className="cps-m-lbl">REFERÊNCIA INTERNA (BENCHMARK)</span>
          <div className="cps-m-val text-info">
            {benchmark.avgMobilizationDays}
          </div>
          <span className="cps-m-sub">
            {benchmark.isSmallSample ? (
              <span className="text-warning">Amostra pequena ({benchmark.sampleSize})</span>
            ) : (
              `Baseado em ${benchmark.sampleSize} contratos`
            )}
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SUB-NAVEGAÇÃO DE PERFORMANCE                                           */}
      {/* ========================================================================= */}
      <nav className="cps-nav-tabs">
        <button 
          className={`cps-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={15} />
          <span>Dimensões de Performance (7)</span>
        </button>

        <button 
          className={`cps-nav-tab ${activeTab === 'plannedVsActual' ? 'active' : ''}`}
          onClick={() => setActiveTab('plannedVsActual')}
        >
          <DollarSign size={15} />
          <span>Planejado vs Observado</span>
          {dim.financeira.costVariations?.length > 0 && <span className="cps-tab-count">{dim.financeira.costVariations.length}</span>}
        </button>

        <button 
          className={`cps-nav-tab ${activeTab === 'risks' ? 'active' : ''}`}
          onClick={() => setActiveTab('risks')}
        >
          <ShieldCheck size={15} />
          <span>Riscos Realizados ({review.riskRealizations?.length || 0})</span>
        </button>

        <button 
          className={`cps-nav-tab ${activeTab === 'partners' ? 'active' : ''}`}
          onClick={() => setActiveTab('partners')}
        >
          <Users size={15} />
          <span>Avaliação de Parceiros ({review.partnerEvaluations?.length || 0})</span>
        </button>

        <button 
          className={`cps-nav-tab ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          <BookOpen size={15} />
          <span>Lições Aprendidas</span>
          {applicableLessons.length > 0 && <span className="cps-tab-dot ok" />}
        </button>

        <button 
          className={`cps-nav-tab ${activeTab === 'closure' ? 'active' : ''}`}
          onClick={() => setActiveTab('closure')}
        >
          <Award size={15} />
          <span>Encerramento & Capability Loop</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* 5. VISÃO 1: DIMENSÕES DE PERFORMANCE AVALIADAS SEPARADAMENTE             */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <section className="cps-dimensions-section">
          <div className="cps-dim-grid">
            {Object.entries(dim).map(([key, item]) => (
              <div key={key} className="cps-dim-card">
                <div className="cps-dim-head">
                  <span className="cps-dim-name">{key.toUpperCase()}</span>
                  <span className={`cps-dim-score ${item.score?.toLowerCase().includes('conforme') || item.score?.toLowerCase().includes('excelente') ? 'score-ok' : 'score-warn'}`}>
                    {item.score}
                  </span>
                </div>
                <p className="cps-dim-summary">{item.summary}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. VISÃO 2: PLANEJADO VS OBSERVADO (CUSTOS & VARIAÇÕES)                   */}
      {/* ========================================================================= */}
      {activeTab === 'plannedVsActual' && (
        <section className="cps-cost-section">
          <div className="cps-section-header">
            <div>
              <h3>Comparativo de Custos Estratégicos & Margem Pós-Execução</h3>
              <p>Rastreia variações reais observadas sem inventar lançamentos contábeis fictícios.</p>
            </div>
            <button className="btn-add-cost" onClick={() => setShowCostModal(true)}>
              <Plus size={14} />
              <span>Registrar Variação de Custo</span>
            </button>
          </div>

          <div className="cps-table-responsive">
            <table className="cps-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Descrição da Despesa</th>
                  <th>Custo Planejado</th>
                  <th>Custo Observado</th>
                  <th>Variação (%)</th>
                  <th>Fonte do Dado</th>
                </tr>
              </thead>
              <tbody>
                {(!dim.financeira.costVariations || dim.financeira.costVariations.length === 0) ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>
                      Nenhuma variação de custo lançada para este período. Dados conformes ao orçamento da proposta.
                    </td>
                  </tr>
                ) : (
                  dim.financeira.costVariations.map(c => (
                    <tr key={c.id}>
                      <td>
                        <span className="cps-cat-tag">{c.category}</span>
                      </td>
                      <td>
                        <strong>{c.description}</strong>
                      </td>
                      <td className="tabular">
                        {user.viewFinancial ? `R$ ${c.plannedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '***'}
                      </td>
                      <td className="tabular">
                        {user.viewFinancial ? `R$ ${c.observedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '***'}
                      </td>
                      <td className="tabular">
                        <span className={`cps-var-pill ${c.variationPercent > 0 ? 'var-up' : 'var-down'}`}>
                          {c.variationPercent > 0 ? `+${c.variationPercent}%` : `${c.variationPercent}%`}
                        </span>
                      </td>
                      <td>
                        <span className="cps-source-tag">{c.source}</span>
                        <small className="cps-source-detail">{c.sourceDetail}</small>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 7. VISÃO 3: RISCOS PREVISTOS VS REALIZADOS & MITIGAÇÃO                   */}
      {/* ========================================================================= */}
      {activeTab === 'risks' && (
        <section className="cps-risks-section">
          <div className="cps-section-header">
            <div>
              <h3>Realização de Riscos Contratuais & Eficácia das Mitigações</h3>
              <p>Confronta os riscos mapeados na Fase 46 com a realidade de campo durante a execução.</p>
            </div>
          </div>

          <div className="cps-risks-grid">
            {review.riskRealizations?.map(r => (
              <div key={r.id} className="cps-risk-real-card">
                <div className="cps-rr-head">
                  <h4>{r.title}</h4>
                  <span className={`cps-outcome-badge outcome-${r.outcome.toLowerCase().replace(/ /g, '-')}`}>
                    {r.outcome}
                  </span>
                </div>

                <div className="cps-rr-body">
                  <p><strong>Nível Previsto:</strong> {r.predictedLevel} ({r.predictedImpact})</p>
                  <p>
                    <strong>Eficácia da Mitigação:</strong>{' '}
                    <span className={`cps-eff-tag eff-${r.mitigationEffectiveness.toLowerCase().replace(/ /g, '-')}`}>
                      {r.mitigationEffectiveness}
                    </span>
                  </p>
                  <div className="cps-rr-notes">
                    <strong>Fato Observado:</strong> {r.observedOutcomeNotes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 8. VISÃO 4: AVALIAÇÃO DE PARCEIROS E FORNECEDORES (FASE 45)              */}
      {/* ========================================================================= */}
      {activeTab === 'partners' && (
        <section className="cps-partners-section">
          <div className="cps-section-header">
            <div>
              <h3>Desempenho Real de Fornecedores & Parceiros Homologados</h3>
              <p>Avaliação estritamente factual interna (sem ranking público) para feedback de futuras cotações.</p>
            </div>
          </div>

          <div className="cps-partners-list">
            {(!review.partnerEvaluations || review.partnerEvaluations.length === 0) ? (
              <p className="text-muted" style={{ padding: '1rem' }}>Nenhum parceiro externo orçado para este certame.</p>
            ) : (
              review.partnerEvaluations.map(p => (
                <div key={p.id} className="cps-partner-eval-card">
                  <div className="cps-pe-head">
                    <div>
                      <h4>{p.partnerName}</h4>
                      <span className="cps-partner-role">{p.role}</span>
                    </div>
                    <div className="cps-pe-statuses">
                      <span className="cps-stat-pill">Prazo: {p.punctualityStatus}</span>
                      <span className="cps-stat-pill">Qualidade: {p.qualityStatus}</span>
                      {p.priceVariationPercent !== 0 && (
                        <span className="cps-stat-pill var">Variação Preço: +{p.priceVariationPercent}%</span>
                      )}
                    </div>
                  </div>

                  <p className="cps-pe-fact"><strong>Fato Observado:</strong> {p.observedFact}</p>
                  <p className="cps-pe-rec"><strong>Recomendação p/ Próximas Propostas:</strong> {p.recommendation}</p>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 9. VISÃO 5: LIÇÕES APRENDIDAS (LESSONS LEARNED & GOVERNANÇA)             */}
      {/* ========================================================================= */}
      {activeTab === 'lessons' && (
        <section className="cps-lessons-section">
          <div className="cps-section-header">
            <div>
              <h3>Repositório de Lições Aprendidas & Closed-Loop Learning</h3>
              <p>Conhecimento derivado da execução que alimentará a decisão no Go/No-Go e na precificação de novas oportunidades.</p>
            </div>
            <button className="btn-add-lesson" onClick={() => setShowLessonModal(true)}>
              <Plus size={14} />
              <span>Registrar Nova Lição</span>
            </button>
          </div>

          <div className="cps-lessons-grid">
            {contractPerformanceService.lessons.map(l => (
              <div key={l.id} className={`cps-lesson-card status-${l.status.toLowerCase()}`}>
                <div className="cps-les-head">
                  <div className="cps-les-cat-row">
                    <span className="cps-les-cat">{l.category}</span>
                    <span className={`cps-les-status status-${l.status.toLowerCase()}`}>
                      {l.status}
                    </span>
                  </div>
                  <h4>{l.title}</h4>
                </div>

                <div className="cps-les-body">
                  <p className="cps-les-desc">{l.description}</p>
                  <div className="cps-les-meta">
                    <span><strong>Serviço:</strong> {l.service}</span>
                    <span><strong>Impacto:</strong> {l.impact}</span>
                  </div>
                  <div className="cps-les-recom">
                    <strong>Recomendação Prática:</strong> {l.recommendation}
                  </div>
                </div>

                <div className="cps-les-foot">
                  <span className="cps-les-sample">Amostra: {l.sampleCount} caso(s)</span>
                  {l.status === LessonStatus.DRAFT ? (
                    <button 
                      className="btn-approve-lesson" 
                      onClick={() => handleApproveLesson(l.id)}
                    >
                      Aprovar Lição Formalmente
                    </button>
                  ) : (
                    <span className="cps-les-approved-by">Aprovado por: {l.approvedBy}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 10. VISÃO 6: ENCERRAMENTO & CAPABILITY LOOP (NOVOS ATESTADOS)             */}
      {/* ========================================================================= */}
      {activeTab === 'closure' && (
        <section className="cps-closure-section">
          <div className="cps-section-header">
            <div>
              <h3>Capability Loop: Obtenção de Atestado & Encerramento Contratual</h3>
              <p>Ciclo virtuoso: Contrato executado com sucesso gera novo Atestado de Capacidade Técnica / ART / CAT para novas licitações.</p>
            </div>
            {!review.isPostExecution && (
              <button className="btn-close-contract" onClick={() => setShowClosureModal(true)}>
                <Award size={14} />
                <span>Iniciar Encerramento Formal</span>
              </button>
            )}
          </div>

          <div className="cps-capability-card">
            <div className="cps-cap-diagram">
              <div className="cps-cap-step active">
                <span className="step-num">1</span>
                <strong>Execução Conforme</strong>
                <small>Medições e laudos concluídos</small>
              </div>
              <ArrowRight size={18} className="cps-arrow" />
              <div className={`cps-cap-step ${review.closureChecklist?.capabilityPotential?.eligibleForAttestation ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <strong>Solicitação de Atestado</strong>
                <small>Protocolo formal junto ao fiscal</small>
              </div>
              <ArrowRight size={18} className="cps-arrow" />
              <div className={`cps-cap-step ${review.closureChecklist?.capabilityPotential?.assetGenerated ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <strong>Homologação no Vault</strong>
                <small>Novo ativo de habilitação (CREA/CAT)</small>
              </div>
              <ArrowRight size={18} className="cps-arrow" />
              <div className="cps-cap-step active">
                <span className="step-num">4</span>
                <strong>Novas Oportunidades</strong>
                <small>Capacidade expandida para certames maiores</small>
              </div>
            </div>

            {review.closureChecklist?.capabilityPotential?.workflowId && (
              <div className="cps-workflow-box">
                <CheckCircle2 size={18} className="text-success" />
                <div>
                  <strong>Workflow de Ativo de Capacidade Ativo ({review.closureChecklist.capabilityPotential.workflowId}):</strong>
                  <p>Solicitação de Atestado para o escopo: <em>"{review.closureChecklist.capabilityPotential.scopeToAttest}"</em> atribuído ao Comercial.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRAR VARIAÇÃO DE CUSTO                                      */}
      {/* ========================================================================= */}
      {showCostModal && (
        <div className="cps-modal-backdrop">
          <div className="cps-modal-card">
            <div className="cps-modal-header">
              <h3>Registrar Variação de Custo Operacional</h3>
              <button onClick={() => setShowCostModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveCost}>
              <div className="cps-modal-body">
                <div className="form-group">
                  <label>Categoria de Custo:</label>
                  <select 
                    value={costForm.category}
                    onChange={(e) => setCostForm({ ...costForm, category: e.target.value })}
                  >
                    {Object.values(CostCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Descrição do Item / Fato Gerador:</label>
                  <input 
                    type="text" 
                    value={costForm.description}
                    onChange={(e) => setCostForm({ ...costForm, description: e.target.value })}
                    placeholder="Ex: Ensaios microbiológicos extras solicitados pelo fiscal..."
                    required
                  />
                </div>

                <div className="form-cols">
                  <div className="form-group">
                    <label>Custo Planejado (R$):</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={costForm.plannedCost}
                      onChange={(e) => setCostForm({ ...costForm, plannedCost: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Custo Observado (R$):</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={costForm.observedCost}
                      onChange={(e) => setCostForm({ ...costForm, observedCost: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Fonte do Dado (Não inventar dados):</label>
                  <select 
                    value={costForm.source}
                    onChange={(e) => setCostForm({ ...costForm, source: e.target.value })}
                  >
                    {Object.values(CostSourceType).map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Detalhe da Fonte / Comprovante:</label>
                  <input 
                    type="text" 
                    value={costForm.sourceDetail}
                    onChange={(e) => setCostForm({ ...costForm, sourceDetail: e.target.value })}
                    placeholder="Ex: Fatura SGS nº 4892 ou Relatório de Medição 02"
                  />
                </div>
              </div>

              <div className="cps-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowCostModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Salvar e Recalcular Margem</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CADASTRAR LIÇÃO APRENDIDA (LESSON LEARNED)                       */}
      {/* ========================================================================= */}
      {showLessonModal && (
        <div className="cps-modal-backdrop">
          <div className="cps-modal-card">
            <div className="cps-modal-header">
              <h3>Registrar Lição Aprendida (Closed-Loop Learning)</h3>
              <button onClick={() => setShowLessonModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveLesson}>
              <div className="cps-modal-body">
                <div className="form-group">
                  <label>Título do Aprendizado:</label>
                  <input 
                    type="text" 
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="Ex: Considerar custo adicional de mobilização fora de PE..."
                    required
                  />
                </div>

                <div className="form-cols">
                  <div className="form-group">
                    <label>Categoria:</label>
                    <select 
                      value={lessonForm.category}
                      onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })}
                    >
                      {Object.values(LessonCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Amostra de Contratos:</label>
                    <input 
                      type="number" 
                      min="1"
                      value={lessonForm.sampleCount}
                      onChange={(e) => setLessonForm({ ...lessonForm, sampleCount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descrição do Fato Observado:</label>
                  <textarea 
                    rows={2}
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Impacto na Execução:</label>
                  <input 
                    type="text" 
                    value={lessonForm.impact}
                    onChange={(e) => setLessonForm({ ...lessonForm, impact: e.target.value })}
                    placeholder="Ex: Margem reduzida em 3 p.p. na fase inicial..."
                  />
                </div>

                <div className="form-group">
                  <label>Recomendação para Futuras Propostas:</label>
                  <textarea 
                    rows={2}
                    value={lessonForm.recommendation}
                    onChange={(e) => setLessonForm({ ...lessonForm, recommendation: e.target.value })}
                    placeholder="Ex: Na planilha de pricing, incluir verba de contingência..."
                    required
                  />
                </div>
              </div>

              <div className="cps-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowLessonModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Salvar como Rascunho (Draft)</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ENCERRAMENTO CONTRATUAL & WORKFLOW DE ATESTADO                   */}
      {/* ========================================================================= */}
      {showClosureModal && (
        <div className="cps-modal-backdrop">
          <div className="cps-modal-card">
            <div className="cps-modal-header">
              <h3>Encerramento Contratual & Obtenção de Ativos de Capacidade</h3>
              <button onClick={() => setShowClosureModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCompleteClosure}>
              <div className="cps-modal-body">
                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="chkObjMet"
                    checked={closureForm.objectivesMet}
                    onChange={(e) => setClosureForm({ ...closureForm, objectivesMet: e.target.checked })}
                  />
                  <label htmlFor="chkObjMet">Todos os objetivos do contrato foram plenamente cumpridos</label>
                </div>

                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="chkAttest"
                    checked={closureForm.eligibleForAttestation}
                    onChange={(e) => setClosureForm({ ...closureForm, eligibleForAttestation: e.target.checked })}
                  />
                  <label htmlFor="chkAttest">Contrato é elegível para geração de <strong>Atestado de Capacidade Técnica</strong></label>
                </div>

                {closureForm.eligibleForAttestation && (
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label>Escopo Estratégico a Ser Atestado:</label>
                    <textarea 
                      rows={2}
                      value={closureForm.scopeToAttest}
                      onChange={(e) => setClosureForm({ ...closureForm, scopeToAttest: e.target.value })}
                      required
                    />
                  </div>
                )}

                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="chkWf"
                    checked={closureForm.createCapabilityWorkflow}
                    onChange={(e) => setClosureForm({ ...closureForm, createCapabilityWorkflow: e.target.checked })}
                  />
                  <label htmlFor="chkWf">Criar tarefa no Workflow para o Comercial solicitar o atestado formal</label>
                </div>
              </div>

              <div className="cps-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowClosureModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Confirmar Encerramento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SUÍTE DE 12 TESTES AUTOMATIZADOS (FASE 47)                       */}
      {/* ========================================================================= */}
      {showTestModal && (
        <div className="cps-modal-backdrop">
          <div className="cps-modal-card cps-modal-lg">
            <div className="cps-modal-header">
              <h3>Suíte de Testes Automatizados — Fase 47</h3>
              <button onClick={() => setShowTestModal(false)}><X size={18} /></button>
            </div>
            <div className="cps-modal-body">
              {isTesting ? (
                <div className="cps-testing-loading">
                  <RefreshCw size={24} className="cps-spin" />
                  <p>Executando 12 testes automatizados da Fase 47...</p>
                </div>
              ) : testResults ? (
                <div>
                  <div className={`cps-test-summary-pill ${testResults.passed ? 'ok' : 'err'}`}>
                    {testResults.passed ? (
                      <><CheckCircle2 size={16} /> Sucesso: Todos os {testResults.totalTests} testes foram aprovados!</>
                    ) : (
                      <><AlertTriangle size={16} /> {testResults.passedCount} de {testResults.totalTests} testes passaram.</>
                    )}
                  </div>
                  <pre className="cps-test-logs">
                    {testResults.logs.join('\n')}
                  </pre>
                </div>
              ) : null}
            </div>
            <div className="cps-modal-footer">
              <button type="button" className="btn-confirm" onClick={() => setShowTestModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
