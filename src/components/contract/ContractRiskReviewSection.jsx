import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Scale, 
  HelpCircle, 
  Zap, 
  Layers, 
  Eye, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Plus, 
  ExternalLink, 
  FileCheck, 
  Flame, 
  RefreshCw, 
  ArrowRight,
  TrendingDown,
  Info,
  Building2,
  Users,
  Compass
} from 'lucide-react';
import { 
  contractRiskService, 
  ContractClauseCategory, 
  ObligationStatus, 
  ObligationFrequency, 
  ObligationCriticality, 
  ObligationGroup, 
  ClauseRiskDimension, 
  ClauseRiskLevel, 
  RiskTreatmentStatus, 
  ReviewStatus, 
  SignatureStatus, 
  SubcontractingRule 
} from '../../services/contract/contractRiskService.js';
import './ContractRiskReviewSection.css';

export default function ContractRiskReviewSection({ 
  contractId, 
  user = { name: 'Diretoria Executiva', role: 'ADMIN', viewFinancial: true },
  onOpenCopilot 
}) {
  const [review, setReview] = useState(() => contractRiskService.getReviewByContractId(contractId));
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');
  const [activeSubView, setActiveSubView] = useState('matrix'); // 'matrix' | 'clauses' | 'diff' | 'gate' | 'startChecklist' | 'audit'
  const [treatmentModalRisk, setTreatmentModalRisk] = useState(null);
  const [evidenceModalObligation, setEvidenceModalObligation] = useState(null);
  const [diffDetailModal, setDiffDetailModal] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Formulário de Tratamento de Risco
  const [treatmentForm, setTreatmentForm] = useState({
    treatment: RiskTreatmentStatus.MITIGATED,
    justification: '',
    owner: '',
    action: '',
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
  });

  // Formulário de Anexação de Evidência
  const [evidenceForm, setEvidenceForm] = useState({
    documentName: '',
    notes: '',
    markAsCompliant: true
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const reloadData = () => {
    setReview(contractRiskService.getReviewByContractId(contractId));
  };

  if (!review) {
    return (
      <div className="crr-empty-state">
        <AlertTriangle size={32} className="text-warning" />
        <h3>Revisão de Risco não localizada para este contrato</h3>
        <p>Gere a análise inicial a partir do menu de opções.</p>
      </div>
    );
  }

  const crossCheck = contractRiskService.runOperationalCrossCheck(contractId);
  const acceptanceGate = contractRiskService.evaluateAcceptanceGate(contractId);

  // Filtro de cláusulas por categoria
  const filteredClauses = activeCategoryTab === 'ALL'
    ? review.clauses
    : review.clauses.filter(c => c.category === activeCategoryTab);

  // Abertura do modal de tratamento de risco
  const handleOpenTreatment = (risk, parentClause) => {
    setTreatmentModalRisk({ risk, parentClause });
    setTreatmentForm({
      treatment: risk.treatment || RiskTreatmentStatus.MITIGATED,
      justification: risk.justification || '',
      owner: risk.owner || user.name || 'Gestor de Contratos',
      action: risk.mitigationPlan?.action || '',
      dueDate: risk.mitigationPlan?.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
    });
  };

  // Salvar tratamento de risco
  const handleSaveTreatment = (e) => {
    e.preventDefault();
    if (!treatmentModalRisk) return;
    try {
      contractRiskService.treatClauseRisk(
        contractId,
        treatmentModalRisk.risk.id,
        {
          treatment: treatmentForm.treatment,
          justification: treatmentForm.justification,
          owner: treatmentForm.owner,
          mitigationPlan: treatmentForm.treatment === RiskTreatmentStatus.MITIGATED ? {
            action: treatmentForm.action,
            owner: treatmentForm.owner,
            dueDate: treatmentForm.dueDate,
            status: 'Em andamento'
          } : null
        },
        user
      );
      reloadData();
      setTreatmentModalRisk(null);
      showToast('Tratamento de risco salvo e auditado com sucesso!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Abertura do modal de evidência
  const handleOpenEvidence = (obl) => {
    setEvidenceModalObligation(obl);
    setEvidenceForm({
      documentName: `Relatório_Protocolo_${obl.category}_${new Date().toISOString().slice(0, 10)}.pdf`,
      notes: '',
      markAsCompliant: true
    });
  };

  // Salvar evidência e atualizar status
  const handleSaveEvidence = (e) => {
    e.preventDefault();
    if (!evidenceModalObligation) return;
    try {
      const newStatus = evidenceForm.markAsCompliant ? ObligationStatus.COMPLIANT : ObligationStatus.IN_PROGRESS;
      contractRiskService.updateObligationStatus(
        contractId,
        evidenceModalObligation.id,
        newStatus,
        {
          documentName: evidenceForm.documentName,
          notes: evidenceForm.notes
        },
        user
      );
      reloadData();
      setEvidenceModalObligation(null);
      showToast(`Evidência anexada via Document Vault e obrigação marcada como ${newStatus}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Executar testes da Fase 46
  const handleRunTests = () => {
    setIsTesting(true);
    setShowTestModal(true);
    setTimeout(() => {
      const res = contractRiskService.runPhase46AutomatedTests();
      setTestResults(res);
      setIsTesting(false);
      reloadData();
    }, 400);
  };

  return (
    <div className="crr-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="crr-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DISCLAIMER LEGAL & DISTINÇÃO OPERACIONAL/JURÍDICA                      */}
      {/* ========================================================================= */}
      <div className="crr-legal-banner">
        <div className="crr-legal-icon">
          <Scale size={20} />
        </div>
        <div className="crr-legal-text">
          <div className="crr-legal-title">
            <strong>CAMADA DE APOIO À DECISÃO OPERACIONAL E COMERCIAL</strong>
            <span className="crr-badge-disclaimer">NÃO É PARECER JURÍDICO</span>
          </div>
          <p>
            {review.legalDisclaimer} Cláusulas ambíguas ou com potencial impacto contencioso são classificadas estritamente como <em>"Revisão jurídica recomendada (Needs Review)"</em>. O Vellia não atesta validade ou invalidade de cláusulas.
          </p>
        </div>
        <div className="crr-legal-actions">
          <button 
            className="btn-crr-test"
            onClick={handleRunTests}
            title="Executar os 12 testes automatizados da Fase 46"
          >
            <Zap size={14} />
            <span>Executar Testes Fase 46</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GAP FIRST STRIP: Conflitos Críticos em Destaque no Topo                */}
      {/* ========================================================================= */}
      {(crossCheck?.hasMobilizationGap || crossCheck?.hasSubcontractingConflict || review.contractDiff?.hasCriticalDeviations) && (
        <div className="crr-gap-first-card">
          <div className="crr-gap-header">
            <Flame size={18} className="crr-pulse-flame" />
            <strong>ALERTAS DE DIVERGÊNCIA & GAPS OPERACIONAIS DETECTADOS (GAP FIRST)</strong>
          </div>
          <div className="crr-gap-items">
            {crossCheck.hasMobilizationGap && (
              <div className="crr-gap-alert danger">
                <AlertTriangle size={16} />
                <div>
                  <strong>Critical Mobilization Gap:</strong> O contrato concede apenas {review.executiveSummary?.mobilizationDaysAllowed} dias corridos para início das operações, enquanto a Prontidão Operacional (Fase 44) estimou lead time mínimo de {review.executiveSummary?.operationalMobilizationEstimateDays} dias.
                  <span className="crr-gap-recom">Déficit de {crossCheck.mobilizationGapDays} dias. Não assinar sem solicitação prévia de alinhamento com a fiscalização.</span>
                </div>
              </div>
            )}

            {crossCheck.hasSubcontractingConflict && (
              <div className="crr-gap-alert critical">
                <ShieldAlert size={16} />
                <div>
                  <strong>Critical Conflict (Subcontratação Proibida):</strong> A proposta comercial vencedora foi precificada com base em parceiros técnicos terceirizados (Fase 45), porém o instrumento contratual veda expressamente a subcontratação de qualquer parcela.
                  <span className="crr-gap-recom">Risco de rescisão unilateral imediata. Exigir retificação da minuta antes da assinatura.</span>
                </div>
              </div>
            )}

            {review.contractDiff?.hasCriticalDeviations && (
              <div className="crr-gap-alert warning">
                <FileText size={16} />
                <div>
                  <strong>Divergência Crítica entre Edital e Contrato Final:</strong> Detectadas alterações substanciais de prazos e condições entre a minuta licitada e a versão final enviada para formalização.
                  <button className="btn-link-inline" onClick={() => setActiveSubView('diff')}>Visualizar Contract Diff</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESUMO EXECUTIVO (BOARD VIEW / DIRETORIA)                              */}
      {/* ========================================================================= */}
      <section className="crr-board-summary">
        <div className="crr-summary-card">
          <span className="crr-s-label">VALOR DO CONTRATO</span>
          <div className="crr-s-val text-primary">
            {user.viewFinancial ? (
              `R$ ${(review.executiveSummary?.contractValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ) : (
              <span className="crr-restricted"><Lock size={14} /> Restrito à Diretoria</span>
            )}
          </div>
          <span className="crr-s-sub">Vigência: {review.executiveSummary?.durationMonths || 12} meses</span>
        </div>

        <div className="crr-summary-card">
          <span className="crr-s-label">EXPOSIÇÃO POTENCIAL A MULTAS</span>
          <div className="crr-s-val text-danger">
            {user.viewFinancial ? (
              review.executiveSummary?.potentialPenaltyExposure ? (
                `R$ ${review.executiveSummary.potentialPenaltyExposure.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              ) : (
                <span className="crr-text-warn">Base não identificada</span>
              )
            ) : (
              <span className="crr-restricted"><Lock size={14} /> Restrito à Diretoria</span>
            )}
          </div>
          <span className="crr-s-sub">Exposição contratual potencial teórica (não é perda provável)</span>
        </div>

        <div className="crr-summary-card">
          <span className="crr-s-label">MOBILIZAÇÃO vs CAPACIDADE</span>
          <div className="crr-s-val">
            <span className={crossCheck.hasMobilizationGap ? 'text-danger' : 'text-success'}>
              {review.executiveSummary?.mobilizationDaysAllowed || 15} dias
            </span>
          </div>
          <span className="crr-s-sub">
            {crossCheck.hasMobilizationGap 
              ? `Gap de ${crossCheck.mobilizationGapDays} dias frente à capacidade` 
              : 'Prazo compatível com prontidão operacional'}
          </span>
        </div>

        <div className="crr-summary-card">
          <span className="crr-s-label">SUBCONTRATAÇÃO (FASE 45)</span>
          <div className="crr-s-val">
            <span className={review.executiveSummary?.subcontractingConflict ? 'text-danger' : 'text-info'}>
              {review.executiveSummary?.subcontractingRule}
            </span>
          </div>
          <span className="crr-s-sub">
            {review.executiveSummary?.subcontractingConflict 
              ? 'Conflito com parceiros da proposta' 
              : 'Compatível com modelo operacional'}
          </span>
        </div>

        <div className="crr-summary-card">
          <span className="crr-s-label">ACCEPTANCE GATE</span>
          <div className="crr-s-val">
            {acceptanceGate.passed ? (
              <span className="text-success"><CheckCircle2 size={18} inline="true" /> Pronto p/ Assinar</span>
            ) : (
              <span className="text-warning"><AlertTriangle size={18} inline="true" /> Bloqueado ({acceptanceGate.blockers.length})</span>
            )}
          </div>
          <span className="crr-s-sub">
            Status: <strong>{review.signatureStatus}</strong>
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SUB-NAVEGAÇÃO DE INTELIGÊNCIA CONTRATUAL                               */}
      {/* ========================================================================= */}
      <nav className="crr-subnav">
        <button 
          className={`crr-subnav-btn ${activeSubView === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveSubView('matrix')}
        >
          <Layers size={15} />
          <span>Matriz de Obrigações ({review.obligations?.length || 0})</span>
        </button>

        <button 
          className={`crr-subnav-btn ${activeSubView === 'clauses' ? 'active' : ''}`}
          onClick={() => setActiveSubView('clauses')}
        >
          <FileText size={15} />
          <span>Cláusulas Extraídas & Riscos ({review.clauses?.length || 0})</span>
        </button>

        <button 
          className={`crr-subnav-btn ${activeSubView === 'diff' ? 'active' : ''}`}
          onClick={() => setActiveSubView('diff')}
        >
          <Scale size={15} />
          <span>Contract Diff & Minuta</span>
          {review.contractDiff?.hasCriticalDeviations && <span className="crr-dot-danger" />}
        </button>

        <button 
          className={`crr-subnav-btn ${activeSubView === 'startChecklist' ? 'active' : ''}`}
          onClick={() => setActiveSubView('startChecklist')}
        >
          <ShieldCheck size={15} />
          <span>Checklist Inicial Pós-Assinatura</span>
        </button>

        <button 
          className={`crr-subnav-btn ${activeSubView === 'gate' ? 'active' : ''}`}
          onClick={() => setActiveSubView('gate')}
        >
          <FileCheck size={15} />
          <span>Acceptance Gate Pré-Assinatura</span>
          {!acceptanceGate.passed && <span className="crr-dot-warning" />}
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* 5. VISÃO A: MATRIZ DE COMPLIANCE & OBRIGAÇÕES ACOMPANHÁVEIS              */}
      {/* ========================================================================= */}
      {activeSubView === 'matrix' && (
        <section className="crr-matrix-section">
          <div className="crr-section-header">
            <div>
              <h3>Matriz de Cumprimento de Obrigações Contratuais</h3>
              <p>Obrigações estruturadas extraídas diretamente do instrumento contratual com rastreabilidade documental estrita.</p>
            </div>
            <div className="crr-header-note">
              <Info size={14} />
              <span>Regra: Marcação de "Compliant" exige evidência documental anexada.</span>
            </div>
          </div>

          <div className="crr-table-responsive">
            <table className="crr-table">
              <thead>
                <tr>
                  <th>Grupo & Categoria</th>
                  <th>Título & Descrição da Obrigação</th>
                  <th>Evidência & Fonte</th>
                  <th>Frequência</th>
                  <th>Prazo (Due Date)</th>
                  <th>Responsável</th>
                  <th>Criticidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {review.obligations.map(obl => (
                  <tr key={obl.id} className={`crr-row-crit-${obl.criticality.toLowerCase()}`}>
                    <td>
                      <span className="crr-group-badge">{obl.group}</span>
                      <span className="crr-cat-pill">{obl.category}</span>
                    </td>
                    <td>
                      <strong>{obl.title}</strong>
                      <p className="crr-obl-desc">{obl.description}</p>
                    </td>
                    <td>
                      <div className="crr-source-trace">
                        <FileText size={12} />
                        <span>Pág. {obl.page} — {obl.section}</span>
                      </div>
                      <blockquote className="crr-trecho">"{obl.trecho}"</blockquote>
                      {obl.evidence && obl.evidence.length > 0 ? (
                        <div className="crr-evidence-attached">
                          <CheckCircle2 size={12} className="text-success" />
                          <span>{obl.evidence.length} evidência(s) no Vault</span>
                        </div>
                      ) : (
                        <span className="crr-no-evidence">Sem evidência anexada</span>
                      )}
                    </td>
                    <td>
                      <span className="crr-freq-pill">{obl.frequency}</span>
                    </td>
                    <td className="tabular mono">
                      <strong>{obl.dueDate}</strong>
                    </td>
                    <td>
                      <span className="crr-owner-tag">
                        <Users size={12} />
                        {obl.owner}
                      </span>
                    </td>
                    <td>
                      <span className={`crr-crit-badge crit-${obl.criticality.toLowerCase()}`}>
                        {obl.criticality}
                      </span>
                    </td>
                    <td>
                      <span className={`crr-status-badge status-${obl.status.toLowerCase().replace(/ /g, '-')}`}>
                        {obl.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-attach-evidence"
                        onClick={() => handleOpenEvidence(obl)}
                        title="Anexar evidência do Document Vault ou atualizar status"
                      >
                        <FileCheck size={13} />
                        <span>Evidência</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. VISÃO B: CLÁUSULAS EXTRAÍDAS, RISCOS E MULTAS                         */}
      {/* ========================================================================= */}
      {activeSubView === 'clauses' && (
        <section className="crr-clauses-section">
          <div className="crr-clauses-filter">
            <span className="lbl-filter">Filtrar Categoria:</span>
            <div className="chips-scroller">
              <button 
                className={`chip-cat ${activeCategoryTab === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveCategoryTab('ALL')}
              >
                Todas ({review.clauses.length})
              </button>
              {Array.from(new Set(review.clauses.map(c => c.category))).map(cat => (
                <button 
                  key={cat}
                  className={`chip-cat ${activeCategoryTab === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategoryTab(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="crr-clauses-grid">
            {filteredClauses.map(c => (
              <div key={c.id} className={`crr-clause-card level-${c.risk?.level?.toLowerCase().replace(/ /g, '-')}`}>
                <div className="crr-clause-head">
                  <div className="crr-clause-cat-row">
                    <span className="crr-cat-tag">{c.category}</span>
                    <span className={`crr-level-tag level-${c.risk?.level?.toLowerCase().replace(/ /g, '-')}`}>
                      {c.risk?.level}
                    </span>
                  </div>
                  <h4>{c.title}</h4>
                </div>

                <div className="crr-clause-body">
                  <div className="crr-source-box">
                    <strong>Fonte:</strong> {c.sourceDocument} — Pág. {c.page} ({c.section})
                  </div>

                  <div className="crr-excerpt-box">
                    <em>"{c.excerpt}"</em>
                  </div>

                  {c.penaltyRule && (
                    <div className="crr-penalty-box">
                      <div className="crr-pen-title">
                        <DollarSign size={14} />
                        <strong>Regra de Penalidade Contratual:</strong>
                      </div>
                      <p><strong>Taxa:</strong> {c.penaltyRule.ratePercent}% ({c.penaltyRule.rateType})</p>
                      <p><strong>Base de Cálculo:</strong> {c.penaltyRule.base}</p>
                      <p>
                        <strong>Exposição Potencial:</strong>{' '}
                        {user.viewFinancial ? (
                          c.penaltyRule.theoreticalExposure ? (
                            `R$ ${c.penaltyRule.theoreticalExposure.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Teto Teórico)`
                          ) : (
                            <span className="text-warning">Base não identificada</span>
                          )
                        ) : (
                          <span className="crr-restricted"><Lock size={12} /> Restrito à Diretoria</span>
                        )}
                      </p>
                    </div>
                  )}

                  {c.sla && (
                    <div className="crr-sla-box">
                      <div className="crr-sla-title">
                        <Clock size={14} />
                        <strong>Requisito de SLA:</strong>
                      </div>
                      <p><strong>Métrica:</strong> {c.sla.metric} ({c.sla.target})</p>
                      <p><strong>Método:</strong> {c.sla.measurementMethod}</p>
                      <p><strong>Penalidade:</strong> {c.sla.penalty}</p>
                    </div>
                  )}

                  {c.risk && (
                    <div className="crr-risk-treatment-box">
                      <div className="crr-risk-dim">
                        <Compass size={13} />
                        <span>Dimensão: <strong>{c.risk.dimension}</strong></span>
                        <span className={`crr-treatment-pill treat-${c.risk.treatment?.toLowerCase().replace(/ /g, '-')}`}>
                          Tratamento: {c.risk.treatment}
                        </span>
                      </div>
                      <p className="crr-impact-text"><strong>Impacto Operacional:</strong> {c.risk.operationalImpact}</p>
                      {c.risk.mitigationPlan && (
                        <div className="crr-mitigation-strip">
                          <strong>Mitigação:</strong> {c.risk.mitigationPlan.action} (Resp: {c.risk.mitigationPlan.owner})
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="crr-clause-foot">
                  <span className="crr-owner-foot">Responsável: {c.risk?.owner || 'Não atribuído'}</span>
                  <button 
                    className="btn-treat-risk"
                    onClick={() => handleOpenTreatment(c.risk, c)}
                  >
                    Aceitar / Mitigar Risco
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 7. VISÃO C: CONTRACT DIFF (EDITAL vs MINUTA vs CONTRATO FINAL)            */}
      {/* ========================================================================= */}
      {activeSubView === 'diff' && (
        <section className="crr-diff-section">
          <div className="crr-diff-header">
            <div>
              <h3>Contract Diff: Comparação Estruturada de Minuta e Contrato Final</h3>
              <p>Rastreia alterações substanciais de prazos, multas, garantias e escopo entre o certame licitatório e o instrumento enviado para assinatura.</p>
            </div>
            <div className={`crr-diff-badge ${review.contractDiff?.hasCriticalDeviations ? 'badge-crit' : 'badge-ok'}`}>
              {review.contractDiff?.hasCriticalDeviations ? 'Alterações Relevantes Detectadas' : 'Sem Divergências Críticas'}
            </div>
          </div>

          <p className="crr-diff-summary-box">{review.contractDiff?.summary}</p>

          <div className="crr-diff-list">
            {review.contractDiff?.deviations.map(diff => (
              <div key={diff.id} className={`crr-diff-item ${diff.isCritical ? 'item-critical' : 'item-normal'}`}>
                <div className="crr-diff-item-head">
                  <span className="crr-diff-cat">{diff.category}</span>
                  <h4>{diff.title}</h4>
                  <span className={`crr-diff-type ${diff.isCritical ? 'type-crit' : 'type-info'}`}>
                    {diff.differenceType}
                  </span>
                </div>

                <div className="crr-diff-compare-grid">
                  <div className="crr-diff-box edital">
                    <span className="crr-box-lbl">Edital / Minuta Original</span>
                    <p>{diff.editalMinutaText}</p>
                  </div>

                  <div className="crr-diff-arrow">
                    <ArrowRight size={20} />
                  </div>

                  <div className="crr-diff-box contrato">
                    <span className="crr-box-lbl">Contrato Final Enviado</span>
                    <p>{diff.contratoFinalText}</p>
                  </div>
                </div>

                <div className="crr-diff-recom">
                  <strong>Recomendação Operacional:</strong> {diff.recommendation}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 8. VISÃO D: START CHECKLIST (PÓS-ASSINATURA)                              */}
      {/* ========================================================================= */}
      {activeSubView === 'startChecklist' && (
        <section className="crr-checklist-section">
          <div className="crr-section-header">
            <div>
              <h3>Checklist Inicial de Mobilização e Pós-Assinatura</h3>
              <p>Validação dos marcos obrigatórios exigidos nos primeiros 30 dias de vigência contratual.</p>
            </div>
            <span className="crr-info-pill">Não conclui automaticamente; exige ação humana.</span>
          </div>

          <div className="crr-checklist-card">
            {review.startChecklist.map(item => (
              <div key={item.id} className={`crr-chk-row ${item.done ? 'chk-done' : 'chk-pending'}`}>
                <div className="crr-chk-left">
                  <div className={`crr-chk-box ${item.done ? 'box-checked' : ''}`}>
                    {item.done ? <Check size={14} /> : null}
                  </div>
                  <div>
                    <strong className="crr-chk-label">{item.label}</strong>
                    <span className="crr-chk-owner">Responsável: {item.owner}</span>
                  </div>
                </div>
                <div className="crr-chk-right">
                  {item.critical && <span className="crr-badge-critical-small">Obrigatório</span>}
                  <span className={`crr-badge-chk-status ${item.done ? 'status-done' : 'status-pending'}`}>
                    {item.done ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 9. VISÃO E: ACCEPTANCE GATE PRÉ-ASSINATURA                                */}
      {/* ========================================================================= */}
      {activeSubView === 'gate' && (
        <section className="crr-gate-section">
          <div className="crr-section-header">
            <div>
              <h3>Contract Acceptance Gate (Validação Antes da Assinatura)</h3>
              <p>Verificação estrita de pré-condições operacionais, financeiras e contratuais antes da celebração do contrato.</p>
            </div>
            <div className={`crr-gate-final-badge ${acceptanceGate.passed ? 'gate-approved' : 'gate-blocked'}`}>
              {acceptanceGate.passed ? 'APROVADO PARA ASSINATURA' : 'ASSINATURA BLOQUEADA'}
            </div>
          </div>

          <div className="crr-gate-grid">
            <div className={`crr-gate-item ${acceptanceGate.checks.risksReviewed ? 'ok' : 'pending'}`}>
              <div className="crr-gate-item-icon">
                {acceptanceGate.checks.risksReviewed ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="crr-gate-item-content">
                <strong>1. Riscos de Cláusulas Revisados</strong>
                <p>Nenhuma cláusula com status "Needs Review" pendente de justificativa ou alinhamento.</p>
              </div>
            </div>

            <div className={`crr-gate-item ${acceptanceGate.checks.capacityRevalidated ? 'ok' : 'pending'}`}>
              <div className="crr-gate-item-icon">
                {acceptanceGate.checks.capacityRevalidated ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="crr-gate-item-content">
                <strong>2. Prontidão Operacional & Mobilização</strong>
                <p>Lead time operacional e alocação de equipe/equipamentos compatíveis com o prazo contratual.</p>
              </div>
            </div>

            <div className={`crr-gate-item ${acceptanceGate.checks.pricingValidated ? 'ok' : 'pending'}`}>
              <div className="crr-gate-item-icon">
                {acceptanceGate.checks.pricingValidated ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="crr-gate-item-content">
                <strong>3. Preço & Margem Homologada</strong>
                <p>Validação final da planilha de custos e aprovações de governança da proposta mantidas.</p>
              </div>
            </div>

            <div className={`crr-gate-item ${acceptanceGate.checks.guaranteesKnown ? 'ok' : 'pending'}`}>
              <div className="crr-gate-item-icon">
                {acceptanceGate.checks.guaranteesKnown ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="crr-gate-item-content">
                <strong>4. Garantias & Seguros Mapeados</strong>
                <p>Linhas de crédito ou apólices de seguro-garantia cotadas com corretora credenciada.</p>
              </div>
            </div>

            <div className={`crr-gate-item ${acceptanceGate.checks.contractDiffAnalyzed ? 'ok' : 'pending'}`}>
              <div className="crr-gate-item-icon">
                {acceptanceGate.checks.contractDiffAnalyzed ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div className="crr-gate-item-content">
                <strong>5. Contract Diff Analisado</strong>
                <p>Diferenças entre edital, minuta e minuta final avaliadas sem surpresas operacionais.</p>
              </div>
            </div>
          </div>

          {acceptanceGate.blockers.length > 0 && (
            <div className="crr-gate-blockers-box">
              <h4>Impedimentos Ativos para Assinatura:</h4>
              <ul>
                {acceptanceGate.blockers.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
              <p className="crr-override-note">
                * Observação: A assinatura com pendências ativas requer aprovação formal de override da Diretoria Executiva conforme Fase 36.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ACEITAR / MITIGAR RISCO DE CLÁUSULA                             */}
      {/* ========================================================================= */}
      {treatmentModalRisk && (
        <div className="crr-modal-backdrop">
          <div className="crr-modal-card">
            <div className="crr-modal-header">
              <h3>Tratamento de Risco Contratual</h3>
              <button onClick={() => setTreatmentModalRisk(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveTreatment}>
              <div className="crr-modal-body">
                <div className="crr-target-info">
                  <strong>Cláusula:</strong> {treatmentModalRisk.parentClause?.title}
                  <p><strong>Nível:</strong> {treatmentModalRisk.risk.level} | <strong>Dimensão:</strong> {treatmentModalRisk.risk.dimension}</p>
                </div>

                <div className="form-group">
                  <label>Decisão de Tratamento:</label>
                  <select 
                    value={treatmentForm.treatment} 
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, treatment: e.target.value })}
                  >
                    <option value={RiskTreatmentStatus.MITIGATED}>Mitigated (Cadastrar Plano de Ação)</option>
                    <option value={RiskTreatmentStatus.ACCEPTED}>Accepted (Aceitar Risco com Justificativa)</option>
                    <option value={RiskTreatmentStatus.NEEDS_REVIEW}>Needs Review (Aguardar Revisão Jurídica/Comercial)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Justificativa Operacional / Comercial (Obrigatória):</label>
                  <textarea 
                    rows={3} 
                    value={treatmentForm.justification} 
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, justification: e.target.value })}
                    placeholder="Fundamente a decisão operacional e de que forma o risco será gerido..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Responsável pelo Risco (Owner):</label>
                  <input 
                    type="text" 
                    value={treatmentForm.owner} 
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, owner: e.target.value })}
                    required
                  />
                </div>

                {treatmentForm.treatment === RiskTreatmentStatus.MITIGATED && (
                  <div className="crr-mitigation-inputs">
                    <h4>Plano de Mitigação:</h4>
                    <div className="form-group">
                      <label>Ação Prática de Mitigação:</label>
                      <input 
                        type="text" 
                        value={treatmentForm.action} 
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, action: e.target.value })}
                        placeholder="Ex: Contratar operador de prontidão residente na base regional..."
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Prazo Limite da Mitigação:</label>
                      <input 
                        type="date" 
                        value={treatmentForm.dueDate} 
                        onChange={(e) => setTreatmentForm({ ...treatmentForm, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="crr-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setTreatmentModalRisk(null)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Salvar Tratamento e Auditar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ANEXAR EVIDÊNCIA DE CUMPRIMENTO (DOCUMENT VAULT)                 */}
      {/* ========================================================================= */}
      {evidenceModalObligation && (
        <div className="crr-modal-backdrop">
          <div className="crr-modal-card">
            <div className="crr-modal-header">
              <h3>Anexar Evidência de Cumprimento de Obrigação</h3>
              <button onClick={() => setEvidenceModalObligation(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEvidence}>
              <div className="crr-modal-body">
                <div className="crr-target-info">
                  <strong>Obrigação:</strong> {evidenceModalObligation.title}
                  <p><strong>Prazo:</strong> {evidenceModalObligation.dueDate} | <strong>Fonte:</strong> Pág. {evidenceModalObligation.page}</p>
                </div>

                <div className="form-group">
                  <label>Documento de Evidência (do Document Vault):</label>
                  <input 
                    type="text" 
                    value={evidenceForm.documentName} 
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, documentName: e.target.value })}
                    placeholder="Nome do arquivo ou número de protocolo..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Notas / Protocolo de Entrega:</label>
                  <textarea 
                    rows={2} 
                    value={evidenceForm.notes} 
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, notes: e.target.value })}
                    placeholder="Ex: Protocolo nº 98412 registrado junto ao fiscal do contrato..."
                  />
                </div>

                <div className="form-check">
                  <input 
                    type="checkbox" 
                    id="markCompliant" 
                    checked={evidenceForm.markAsCompliant}
                    onChange={(e) => setEvidenceForm({ ...evidenceForm, markAsCompliant: e.target.checked })}
                  />
                  <label htmlFor="markCompliant">Marcar status da obrigação formalmente como <strong>Compliant</strong></label>
                </div>
              </div>

              <div className="crr-modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setEvidenceModalObligation(null)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Anexar e Atualizar Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXECUTOR DE TESTES DA FASE 46                                    */}
      {/* ========================================================================= */}
      {showTestModal && (
        <div className="crr-modal-backdrop">
          <div className="crr-modal-card crr-modal-lg">
            <div className="crr-modal-header">
              <h3>Suíte de Testes Automatizados — Fase 46</h3>
              <button onClick={() => setShowTestModal(false)}><X size={18} /></button>
            </div>
            <div className="crr-modal-body">
              {isTesting ? (
                <div className="crr-testing-loading">
                  <RefreshCw size={24} className="crr-spin" />
                  <p>Executando 12 testes automatizados da Fase 46...</p>
                </div>
              ) : testResults ? (
                <div>
                  <div className={`crr-test-summary-pill ${testResults.passed ? 'ok' : 'err'}`}>
                    {testResults.passed ? (
                      <><CheckCircle2 size={16} /> Sucesso: Todos os {testResults.totalTests} testes foram aprovados!</>
                    ) : (
                      <><AlertTriangle size={16} /> {testResults.passedCount} de {testResults.totalTests} testes passaram.</>
                    )}
                  </div>
                  <pre className="crr-test-logs">
                    {testResults.logs.join('\n')}
                  </pre>
                </div>
              ) : null}
            </div>
            <div className="crr-modal-footer">
              <button type="button" className="btn-confirm" onClick={() => setShowTestModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
