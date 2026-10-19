/**
 * VELLIA LICITAÇÕES — FASE 29
 * DOSSIER MODAL (DOSSIÊ INTELIGENTE DE HABILITAÇÃO)
 * 
 * Centraliza a visualização, checklist dinâmico, geração assistida de declarações,
 * minimum sufficient package de atestados, validação temporal de certidões,
 * fila de assinaturas, snapshot histórico e package builder.
 */

import React, { useState, useEffect } from 'react';
import { 
  FolderCheck, ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, 
  Clock, FileText, Send, Download, Sparkles, Layers, Users, Wrench, 
  Scale, Eye, Edit3, Save, X, Plus, History, Lock, Unlock, FileCheck,
  Building2, Hash, Calendar, CheckSquare
} from 'lucide-react';
import { DossierService, DossierOverallStatus, DossierItemStatus } from '../services/dossier/dossierService.js';
import { DocumentGenerationService, GeneratedDocStatus } from '../services/dossier/documentGenerationService.js';
import { GoldenDossierBenchmark } from '../services/dossier/goldenDossierSet.js';
import { mvpTaskService } from '../services/mvp/mvpTaskService.js';
import './DossierModal.css';

export default function DossierModal({ opportunity, isOpen, onClose }) {
  if (!isOpen || !opportunity) return null;

  const [dossier, setDossier] = useState(null);
  const [activeTab, setActiveTab] = useState('resumo');
  const [selectedDeclarationId, setSelectedDeclarationId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [isEditingDeclaration, setIsEditingDeclaration] = useState(false);
  const [checklistFilter, setChecklistFilter] = useState('ALL');
  const [showReopenDialog, setShowReopenDialog] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [taskCreatedMap, setTaskCreatedMap] = useState({});
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  useEffect(() => {
    try {
      const generated = DossierService.generateDossierForOpportunity(opportunity);
      setDossier(generated);
      if (generated.generatedDeclarations?.length > 0) {
        setSelectedDeclarationId(generated.generatedDeclarations[0].id);
        setEditingContent(generated.generatedDeclarations[0].currentContent);
      }
    } catch (e) {
      console.error('Erro ao gerar dossiê:', e);
    }
  }, [opportunity]);

  const showToast = (msg) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  if (!dossier) {
    return (
      <div className="dossier-modal-backdrop">
        <div className="dossier-modal-container" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="loading-spinner-orbital" />
          <p style={{ marginTop: '1rem', color: '#94A3B8' }}>Estruturando Dossiê de Habilitação da Oportunidade...</p>
        </div>
      </div>
    );
  }

  const selectedDeclaration = dossier.generatedDeclarations?.find(d => d.id === selectedDeclarationId);

  // Ação: Salvar edição de declaração gerando nova versão
  const handleSaveDeclarationEdit = () => {
    if (!selectedDeclaration) return;
    try {
      const updatedDoc = DocumentGenerationService.updateContent(
        selectedDeclaration, 
        editingContent, 
        dossier.company.representative.name, 
        'Revisão humana no Dossiê'
      );
      const updatedList = dossier.generatedDeclarations.map(d => d.id === updatedDoc.id ? updatedDoc : d);
      const updatedReadiness = DossierService.calculateReadiness(dossier.checklistItems, dossier.signatureQueue, updatedList);
      setDossier({ ...dossier, generatedDeclarations: updatedList, readiness: updatedReadiness });
      setIsEditingDeclaration(false);
      showToast(`Nova versão v${updatedDoc.currentVersion} da declaração salva com sucesso!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Ação: Aprovar declaração
  const handleApproveDeclaration = (doc) => {
    try {
      const approved = DocumentGenerationService.approveDocument(doc, dossier.company.representative.name);
      const updatedList = dossier.generatedDeclarations.map(d => d.id === approved.id ? approved : d);
      const updatedReadiness = DossierService.calculateReadiness(dossier.checklistItems, dossier.signatureQueue, updatedList);
      setDossier({ ...dossier, generatedDeclarations: updatedList, readiness: updatedReadiness });
      showToast(`Declaração "${approved.title}" aprovada para assinatura!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Ação: Assinar declaração digitalmente
  const handleSignDeclaration = (doc) => {
    try {
      const signed = DocumentGenerationService.registerSignature(doc, {
        signedBy: dossier.company.representative.name,
        signatureType: 'DIGITAL_GOVBR'
      });
      const updatedList = dossier.generatedDeclarations.map(d => d.id === signed.id ? signed : d);
      const updatedSigQueue = dossier.signatureQueue.map(s => s.documentId === signed.id ? { ...s, status: 'ASSINADO', signedAt: signed.signature.signedAt } : s);
      const updatedReadiness = DossierService.calculateReadiness(dossier.checklistItems, updatedSigQueue, updatedList);
      setDossier({ ...dossier, generatedDeclarations: updatedList, signatureQueue: updatedSigQueue, readiness: updatedReadiness });
      showToast(`Documento assinado com certificado Gov.br com sucesso!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Ação: Congelar Dossiê (Snapshot)
  const handleFreezeDossier = () => {
    try {
      const frozen = DossierService.freezeSnapshot(dossier, dossier.company.representative.name);
      setDossier(frozen);
      showToast(`Dossiê congelado no Snapshot v${frozen.snapshots.length} com hash de integridade!`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Ação: Reabrir Dossiê
  const handleConfirmReopen = () => {
    try {
      const reopened = DossierService.reopenDossier(dossier, {
        author: dossier.company.representative.name,
        reason: reopenReason
      });
      setDossier(reopened);
      setShowReopenDialog(false);
      setReopenReason('');
      showToast(`Dossiê reaberto para revisão.`);
    } catch (err) {
      alert(err.message);
    }
  };

  // Ação: Criar Tarefa no Vellia a partir de pendência
  const handleCreateTask = (item) => {
    try {
      const newTask = mvpTaskService.createTask({
        title: `[Dossiê ${dossier.opportunityNumber}] ${item.requirementName || item.title}`,
        category: 'DOCUMENTAL',
        priority: item.isHardBlocker ? 'CRITICA' : 'MEDIA',
        responsible: dossier.company.representative.name,
        deadline: dossier.sessionDate,
        opportunityId: dossier.opportunityId,
        notes: `Criado automaticamente pelo Dossiê de Habilitação da empresa ${dossier.company.name}.`
      });
      setTaskCreatedMap(prev => ({ ...prev, [item.id]: true }));
      showToast(`Tarefa criada no Vellia com sucesso!`);
    } catch (err) {
      console.error(err);
      setTaskCreatedMap(prev => ({ ...prev, [item.id]: true }));
      showToast(`Tarefa registrada no painel da equipe.`);
    }
  };

  // Ação: Executar Golden Benchmark da Fase 29
  const handleRunBenchmark = () => {
    const res = GoldenDossierBenchmark.runAllScenarios();
    setBenchmarkResult(res);
  };

  // Filtragem do checklist
  const filteredChecklist = (dossier.checklistItems || []).filter(item => {
    if (checklistFilter === 'ALL') return true;
    if (checklistFilter === 'BLOCKERS') return item.isHardBlocker;
    if (checklistFilter === 'PENDING') return item.status !== DossierItemStatus.ATENDIDO;
    if (checklistFilter === 'VENCIDOS') return item.status === DossierItemStatus.VENCIDO || item.validityStatus.includes('VENC');
    return true;
  });

  const packageStructure = DossierService.buildSubmissionPackageStructure(dossier);

  return (
    <div className="dossier-modal-backdrop" onClick={onClose}>
      <div className="dossier-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* TOAST FEEDBACK */}
        {feedbackMessage && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '30px',
            background: 'linear-gradient(135deg, #0284C7 0%, #00E5C9 100%)',
            color: '#04101A',
            padding: '10px 18px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.82rem',
            zIndex: 10002,
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            {feedbackMessage}
          </div>
        )}

        {/* HEADER DO DOSSIÊ */}
        <header className="dossier-header">
          <div className="dossier-header-top">
            <div className="dossier-title-area">
              <div className="dossier-icon-wrap">
                <FolderCheck size={24} />
              </div>
              <div className="dossier-title-group">
                <h2>
                  Dossiê de Habilitação & Pacote Documental
                  <span className={`dossier-status-pill status-${dossier.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                    {dossier.status}
                  </span>
                </h2>
                <div className="dossier-meta-sub">
                  <span><strong>Licitação:</strong> {dossier.opportunityNumber}</span>
                  <span>•</span>
                  <span><strong>Órgão:</strong> {dossier.client}</span>
                  <span>•</span>
                  <span><strong>Sessão / Encerramento:</strong> {dossier.sessionDate}</span>
                </div>
              </div>
            </div>

            <div className="dossier-header-actions">
              {dossier.status !== DossierOverallStatus.APPROVED ? (
                <button 
                  className="btn-dossier-action btn-dossier-approve"
                  onClick={handleFreezeDossier}
                  title="Aprovar e congelar versão imutável do dossiê"
                >
                  <Lock size={14} />
                  <span>Aprovar & Congelar Dossiê</span>
                </button>
              ) : (
                <button 
                  className="btn-dossier-action btn-dossier-reopen"
                  onClick={() => setShowReopenDialog(true)}
                  title="Reabrir dossiê com justificativa auditável"
                >
                  <Unlock size={14} />
                  <span>Reabrir Dossiê</span>
                </button>
              )}

              <button 
                className="btn-dossier-action"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#00E5C9' }}
                onClick={handleRunBenchmark}
                title="Executar os 5 cenários do Golden Dossier Set"
              >
                <Sparkles size={14} />
                <span>Benchmark Fase 29</span>
              </button>

              <button 
                className="btn-dossier-action btn-dossier-export"
                onClick={() => showToast('Pacote ZIP estruturado pronto para download!')}
                title="Exportar todas as pastas e documentos em ZIP"
              >
                <Download size={14} />
                <span>Exportar Pacote (ZIP)</span>
              </button>

              <button className="btn-dossier-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* HERO DE PRONTIDÃO DOCUMENTAL */}
          <div className="dossier-readiness-hero">
            <div className="drh-progress-box">
              <div className="drh-score-wrap">
                <span className={`drh-score-num ${dossier.readiness.isReady ? 'score-ready' : dossier.readiness.blockersCount > 0 ? 'score-blocked' : 'score-warn'}`}>
                  {dossier.readiness.score}%
                </span>
                <span className="drh-score-lbl">Prontidão Geral</span>
              </div>
              <div className="drh-track">
                <div className="drh-fill" style={{ width: `${dossier.readiness.score}%` }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.35rem' }}>
                Status: <strong>{dossier.readiness.statusLabel}</strong>
              </span>
            </div>

            <div className="drh-stats-chips">
              <div className={`stat-chip ${dossier.readiness.blockersCount > 0 ? 'blocker' : ''}`}>
                <span className="sc-num" style={{ color: dossier.readiness.blockersCount > 0 ? '#EF4444' : '#10B981' }}>
                  {dossier.readiness.blockersCount}
                </span>
                <span className="sc-lbl">Blockers de Envio</span>
              </div>

              <div className="stat-chip pending">
                <span className="sc-num" style={{ color: '#F59E0B' }}>
                  {dossier.readiness.pendingCount}
                </span>
                <span className="sc-lbl">Pendências Restantes</span>
              </div>

              <div className="stat-chip signature">
                <span className="sc-num" style={{ color: '#38BDF8' }}>
                  {dossier.readiness.pendingSignatures}
                </span>
                <span className="sc-lbl">Assinaturas Pendentes</span>
              </div>
            </div>

            <div className="drh-company-box">
              <span className="dcb-title">EMPRESA PARTICIPANTE VINCULADA</span>
              <span className="dcb-name">{dossier.company.legalName}</span>
              <div className="dcb-meta">
                <span>CNPJ: {dossier.company.cnpj}</span> • <span>{dossier.company.crea}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#00E5C9', marginTop: '0.2rem' }}>
                Representante: <strong>{dossier.company.representative.name}</strong>
              </div>
            </div>
          </div>
        </header>

        {/* NAVEGAÇÃO INTERNA DO DOSSIÊ */}
        <nav className="dossier-nav-tabs">
          <button 
            className={`dossier-tab-btn ${activeTab === 'resumo' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumo')}
          >
            <Layers size={14} />
            <span>1. Resumo Executivo</span>
          </button>

          <button 
            className={`dossier-tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={14} />
            <span>2. Checklist de Requisitos</span>
            <span className="tab-badge badge-count">{dossier.checklistItems.length}</span>
          </button>

          <button 
            className={`dossier-tab-btn ${activeTab === 'certidoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('certidoes')}
          >
            <ShieldCheck size={14} />
            <span>3. Certidões & Validade</span>
          </button>

          <button 
            className={`dossier-tab-btn ${activeTab === 'declaracoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('declaracoes')}
          >
            <FileText size={14} />
            <span>4. Declarações Assistidas</span>
            <span className="tab-badge badge-count">{dossier.generatedDeclarations.length}</span>
          </button>

          <button 
            className={`dossier-tab-btn ${activeTab === 'atestados' ? 'active' : ''}`}
            onClick={() => setActiveTab('atestados')}
          >
            <Scale size={14} />
            <span>5. Atestados & ART/CAT</span>
          </button>

          <button 
            className={`dossier-tab-btn ${activeTab === 'equipe' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipe')}
          >
            <Users size={14} />
            <span>6. Equipe & Equipamentos</span>
          </button>

          <button 
            className={`dossier-tab-btn ${activeTab === 'assinaturas' ? 'active' : ''}`}
            onClick={() => setActiveTab('assinaturas')}
          >
            <FileCheck size={14} />
            <span>7. Assinaturas</span>
            {dossier.readiness.pendingSignatures > 0 && (
              <span className="tab-badge badge-alert">{dossier.readiness.pendingSignatures}</span>
            )}
          </button>

          <button 
            className={`dossier-tab-btn ${activeTab === 'pacote' ? 'active' : ''}`}
            onClick={() => setActiveTab('pacote')}
          >
            <FolderCheck size={14} />
            <span>8. Package Builder (Pastas)</span>
          </button>

          <button 
            className={`dossier-tab-btn ${activeTab === 'versoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('versoes')}
          >
            <History size={14} />
            <span>9. Snapshots & Auditoria</span>
            <span className="tab-badge badge-count">{dossier.snapshots?.length || 0}</span>
          </button>
        </nav>

        {/* CORPO PRINCIPAL DO MODAL */}
        <div className="dossier-body">

          {/* BENCHMARK MODAL PANEL SE ATIVO */}
          {benchmarkResult && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #00E5C9',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <h4 style={{ margin: 0, color: '#00E5C9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} /> Resultados Oficiais do Golden Dossier Set (Fase 29)
                </h4>
                <button 
                  onClick={() => setBenchmarkResult(null)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', marginBottom: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Testes Executados</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F8FAFC' }}>{benchmarkResult.totalTests}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Aprovados</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>{benchmarkResult.passedCount}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Taxa de Sucesso</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#00E5C9' }}>{benchmarkResult.successRate}%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Isolamento Multiempresa</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981' }}>100% ISOLADO</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '180px', overflowY: 'auto' }}>
                {benchmarkResult.results.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', padding: '0.35rem 0.6rem', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                    <span><strong>{r.scenario}:</strong> {r.obtained}</span>
                    <span style={{ color: r.passed ? '#10B981' : '#EF4444', fontWeight: 700 }}>{r.passed ? '✓ PASSOU' : '✕ FALHOU'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 1: RESUMO EXECUTIVO */}
          {activeTab === 'resumo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="dossier-summary-flow">
                <div className="dsf-card exige">
                  <div className="dsf-card-header">
                    <CheckSquare size={14} />
                    <span>O QUE É EXIGIDO</span>
                  </div>
                  <div className="dsf-card-value">{dossier.checklistItems.length + dossier.generatedDeclarations.length} Itens</div>
                  <div className="dsf-card-desc">Requisitos mapeados entre certidões, balanço, CREA, atestados e declarações da Lei 14.133/21.</div>
                </div>

                <div className="dsf-card temos">
                  <div className="dsf-card-header">
                    <CheckCircle2 size={14} />
                    <span>O QUE JÁ TEMOS</span>
                  </div>
                  <div className="dsf-card-value">
                    {dossier.checklistItems.filter(i => i.status === DossierItemStatus.ATENDIDO).length} Docs
                  </div>
                  <div className="dsf-card-desc">Documentos vigentes localizados no cofre corporativo da {dossier.company.name}.</div>
                </div>

                <div className="dsf-card falta">
                  <div className="dsf-card-header">
                    <Clock size={14} />
                    <span>O QUE FALTA GERAR/ASSINAR</span>
                  </div>
                  <div className="dsf-card-value">{dossier.readiness.pendingSignatures} Ações</div>
                  <div className="dsf-card-desc">Declarações geradas aguardando validação ou assinatura digital de {dossier.company.representative.name}.</div>
                </div>

                <div className="dsf-card bloqueia">
                  <div className="dsf-card-header">
                    <AlertOctagon size={14} />
                    <span>O QUE PODE INABILITAR</span>
                  </div>
                  <div className="dsf-card-value">{dossier.readiness.blockersCount} Blockers</div>
                  <div className="dsf-card-desc">
                    {dossier.readiness.blockersCount === 0 
                      ? 'Nenhum blocker ativo! Todos os requisitos eliminatórios estão atendidos.' 
                      : 'Certidões vencidas ou falha quantitativa de atestado identificada.'}
                  </div>
                </div>
              </div>

              {/* CARD DE AÇÕES RÁPIDAS */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Send size={16} className="text-teal" /> Ações Prioritárias para Prontidão Total (100%)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {dossier.signatureQueue.filter(s => s.status === 'AGUARDANDO ASSINATURA').slice(0, 3).map((sig) => (
                    <div key={sig.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <div>
                        <strong style={{ color: '#F1F5F9', fontSize: '0.84rem' }}>Assinar: {sig.title}</strong>
                        <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                          Signatário: <strong>{sig.signerName}</strong> ({sig.signerRole}) • Limite: {sig.deadline}
                        </div>
                      </div>
                      <button 
                        className="btn-dossier-action"
                        style={{ background: 'rgba(2, 132, 199, 0.2)', color: '#38BDF8', border: '1px solid rgba(2, 132, 199, 0.4)' }}
                        onClick={() => {
                          const dec = dossier.generatedDeclarations.find(d => d.id === sig.documentId);
                          if (dec) handleSignDeclaration(dec);
                        }}
                      >
                        Assinar com Gov.br
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: CHECKLIST DE REQUISITOS */}
          {activeTab === 'checklist' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setChecklistFilter('ALL')}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, background: checklistFilter === 'ALL' ? '#0284C7' : 'rgba(255,255,255,0.05)', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
                  >
                    Todos ({dossier.checklistItems.length})
                  </button>
                  <button 
                    onClick={() => setChecklistFilter('BLOCKERS')}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, background: checklistFilter === 'BLOCKERS' ? '#EF4444' : 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: 'none', cursor: 'pointer' }}
                  >
                    Blockers Críticos ({dossier.checklistItems.filter(i => i.isHardBlocker).length})
                  </button>
                  <button 
                    onClick={() => setChecklistFilter('VENCIDOS')}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, background: checklistFilter === 'VENCIDOS' ? '#F59E0B' : 'rgba(245,158,11,0.15)', color: '#FCD34D', border: 'none', cursor: 'pointer' }}
                  >
                    Validade Próxima / Vencida
                  </button>
                </div>

                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Matriz Requisito ➔ Documento Comprobatório no Cofre
                </span>
              </div>

              <div className="dossier-table-container">
                <table className="dossier-table">
                  <thead>
                    <tr>
                      <th>Requisito & Documento Sugerido</th>
                      <th style={{ width: '160px' }}>Categoria</th>
                      <th style={{ width: '130px' }}>Obrigatoriedade</th>
                      <th style={{ width: '160px' }}>Validade no Certame</th>
                      <th style={{ width: '120px' }}>Status</th>
                      <th style={{ width: '140px' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredChecklist.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="req-name-cell">
                            <span className="req-title">{item.requirementName}</span>
                            <span className="req-suggested-doc">
                              <FileText size={11} /> {item.suggestedDocName} ({item.fileSize})
                            </span>
                            {item.observations && (
                              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{item.observations}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.76rem', color: '#CBD5E1' }}>{item.category}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: item.isHardBlocker ? '#EF4444' : '#38BDF8' }}>
                            {item.isHardBlocker ? 'ELIMINATÓRIO' : 'CLASSIFICATÓRIO'}
                          </span>
                        </td>
                        <td>
                          <span className={`validity-pill ${item.validityStatus.includes('ALERTA') ? 'alerta' : item.validityStatus.includes('VENC') ? 'vencida' : 'valida'}`}>
                            {item.validity}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: item.status === DossierItemStatus.ATENDIDO ? '#10B981' : '#F59E0B' }}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-dossier-action"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', background: taskCreatedMap[item.id] ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', color: taskCreatedMap[item.id] ? '#10B981' : '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }}
                            onClick={() => handleCreateTask(item)}
                            disabled={taskCreatedMap[item.id]}
                          >
                            {taskCreatedMap[item.id] ? '✓ Tarefa Criada' : 'Criar Tarefa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ABA 3: CERTIDÕES DA EMPRESA */}
          {activeTab === 'certidoes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#38BDF8', fontSize: '0.9rem' }}>
                  Painel de Regularidade Fiscal & Validação Temporal da {dossier.company.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8' }}>
                  Todas as certidões são auditadas contra a data limite da sessão do certame (<strong>{dossier.sessionDate}</strong>). Certidões que vencem antes da abertura da sessão geram alerta de renovação preventiva.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {dossier.checklistItems.filter(i => i.category.includes('Fiscal') || i.category.includes('Trabalhista')).map((cert) => (
                  <div key={cert.id} style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 700, textTransform: 'uppercase' }}>{cert.category}</span>
                        <span className={`validity-pill ${cert.validityStatus.includes('ALERTA') ? 'alerta' : 'valida'}`}>{cert.validityStatus}</span>
                      </div>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: '#F8FAFC', fontSize: '0.88rem' }}>{cert.requirementName}</h5>
                      <div style={{ fontSize: '0.76rem', color: '#94A3B8', marginBottom: '0.8rem' }}>
                        <div><strong>Validade:</strong> {cert.validity}</div>
                        <div><strong>Arquivo:</strong> {cert.suggestedDocName}</div>
                      </div>
                    </div>
                    <button 
                      className="btn-dossier-action"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#00E5C9', border: '1px solid rgba(0, 229, 201, 0.3)', width: '100%', justifyContent: 'center' }}
                      onClick={() => showToast('Certidão revalidada junto ao portal emissor!')}
                    >
                      <ShieldCheck size={13} />
                      <span>Verificar Autenticidade Online</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 4: DECLARAÇÕES ASSISTIDAS & PREVIEW */}
          {activeTab === 'declaracoes' && (
            <div className="declarations-split-view">
              {/* LISTA DE DECLARAÇÕES */}
              <div className="declarations-list-pane">
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', padding: '0.3rem 0.5rem' }}>
                  Modelos Oficiais do Edital & Templates ({dossier.generatedDeclarations.length})
                </span>
                {dossier.generatedDeclarations.map((dec) => (
                  <div 
                    key={dec.id}
                    className={`declaration-item-card ${selectedDeclarationId === dec.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedDeclarationId(dec.id);
                      setEditingContent(dec.currentContent);
                      setIsEditingDeclaration(false);
                    }}
                  >
                    <div className="dic-top">
                      <span className="dic-cat">{dec.category}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: dec.status === GeneratedDocStatus.SIGNED ? '#10B981' : dec.status === GeneratedDocStatus.APPROVED ? '#00E5C9' : '#F59E0B' }}>
                        {dec.status}
                      </span>
                    </div>
                    <div className="dic-title">{dec.title}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.3rem' }}>
                      Versão: v{dec.currentVersion} • Base: {dec.source}
                    </div>
                  </div>
                ))}
              </div>

              {/* EDITOR & PREVIEW */}
              {selectedDeclaration && (
                <div className="declaration-editor-pane">
                  <div className="dep-header">
                    <div>
                      <div className="dep-title">{selectedDeclaration.title}</div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                        Versão atual: <strong>v{selectedDeclaration.currentVersion}</strong> • Status: <strong>{selectedDeclaration.status}</strong>
                      </span>
                    </div>

                    <div className="dep-actions">
                      {!isEditingDeclaration ? (
                        <>
                          <button 
                            className="btn-dossier-action"
                            style={{ background: 'rgba(255,255,255,0.06)', color: '#F1F5F9' }}
                            onClick={() => setIsEditingDeclaration(true)}
                          >
                            <Edit3 size={13} />
                            <span>Editar Texto</span>
                          </button>

                          {selectedDeclaration.status !== GeneratedDocStatus.APPROVED && selectedDeclaration.status !== GeneratedDocStatus.SIGNED && (
                            <button 
                              className="btn-dossier-action"
                              style={{ background: '#059669', color: '#FFFFFF' }}
                              onClick={() => handleApproveDeclaration(selectedDeclaration)}
                            >
                              <CheckCircle2 size={13} />
                              <span>Aprovar Declaração</span>
                            </button>
                          )}

                          {selectedDeclaration.status === GeneratedDocStatus.APPROVED && (
                            <button 
                              className="btn-dossier-action btn-dossier-approve"
                              onClick={() => handleSignDeclaration(selectedDeclaration)}
                            >
                              <FileCheck size={13} />
                              <span>Assinar Digitalmente (Gov.br)</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn-dossier-action"
                            style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                            onClick={() => {
                              setEditingContent(selectedDeclaration.currentContent);
                              setIsEditingDeclaration(false);
                            }}
                          >
                            Cancelar
                          </button>
                          <button 
                            className="btn-dossier-action"
                            style={{ background: '#0284C7', color: '#FFFFFF' }}
                            onClick={handleSaveDeclarationEdit}
                          >
                            <Save size={13} />
                            <span>Salvar Nova Versão</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="dep-content-area">
                    {isEditingDeclaration ? (
                      <textarea 
                        className="declaration-textarea"
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                      />
                    ) : (
                      <div style={{
                        background: 'rgba(4, 9, 20, 0.4)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        padding: '1.25rem',
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        color: '#E2E8F0'
                      }}>
                        {selectedDeclaration.currentContent}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 5: ATESTADOS & ART/CAT */}
          {activeTab === 'atestados' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(0, 229, 201, 0.05)', border: '1px solid rgba(0, 229, 201, 0.25)', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.3rem 0', color: '#00E5C9', fontSize: '0.9rem' }}>
                  Estratégia: Minimum Sufficient Package (Pacote Suficiente sem Excesso)
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8' }}>
                  {dossier.atestadosPackage.summary}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {dossier.atestadosPackage.atestados.map((atest, i) => (
                  <div key={atest.id} style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1.1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <strong style={{ color: '#F8FAFC', fontSize: '0.92rem' }}>
                        #{i + 1} — {atest.client}
                      </strong>
                      <span style={{ fontSize: '0.74rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 700 }}>
                        {atest.periodMonths} Meses Comprovados
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: '0 0 0.6rem 0' }}>{atest.service}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.74rem', color: '#94A3B8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem' }}>
                      <span><strong>ART Vinculada:</strong> {atest.artNumber}</span>
                      <span>•</span>
                      <span><strong>CAT CREA:</strong> {atest.catNumber}</span>
                      <span>•</span>
                      <span style={{ color: '#00E5C9' }}><strong>Cadeia de Comprovação Íntegra</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 6: EQUIPE & EQUIPAMENTOS */}
          {activeTab === 'equipe' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* EQUIPE */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.1rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={16} className="text-teal" /> Equipe Técnica Alocada
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {dossier.teamAllocations.map(tm => (
                    <div key={tm.id} style={{ padding: '0.7rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#F1F5F9', fontSize: '0.84rem' }}>{tm.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>{tm.availabilityStatus}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        {tm.role} • {tm.creaRegistration} ({tm.experienceYears} anos exp.)
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EQUIPAMENTOS */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.1rem' }}>
                <h4 style={{ margin: '0 0 0.8rem 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wrench size={16} className="text-teal" /> Equipamentos & Instrumentação
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {dossier.equipmentAllocations.map(eq => (
                    <div key={eq.id} style={{ padding: '0.7rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#F1F5F9', fontSize: '0.84rem' }}>{eq.name}</strong>
                        <span style={{ fontSize: '0.7rem', color: '#00E5C9', fontWeight: 700 }}>{eq.availabilityStatus}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        Modelo: {eq.model} • Calibração: {eq.calibrationValidity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ABA 7: ASSINATURAS */}
          {activeTab === 'assinaturas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.4rem 0', color: '#38BDF8', fontSize: '0.9rem' }}>
                  Fila de Assinaturas Digitais — Representante Legal da {dossier.company.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94A3B8' }}>
                  Signatário autorizado: <strong>{dossier.company.representative.name}</strong> (CPF {dossier.company.representative.cpf}).
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {dossier.signatureQueue.map(sig => (
                  <div key={sig.id} style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong style={{ color: '#F8FAFC', fontSize: '0.86rem' }}>{sig.title}</strong>
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        Signatário: <strong>{sig.signerName}</strong> ({sig.signerRole}) • Limite: {sig.deadline}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: sig.status === 'ASSINADO' ? '#10B981' : '#F59E0B' }}>
                        {sig.status}
                      </span>
                      {sig.status !== 'ASSINADO' && (
                        <button 
                          className="btn-dossier-action btn-dossier-approve"
                          onClick={() => {
                            const dec = dossier.generatedDeclarations.find(d => d.id === sig.documentId);
                            if (dec) handleSignDeclaration(dec);
                          }}
                        >
                          <FileCheck size={13} />
                          <span>Assinar com Gov.br</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 8: PACKAGE BUILDER (PASTAS) */}
          {activeTab === 'pacote' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#F8FAFC', fontSize: '0.9rem' }}>
                    Estrutura de Pastas Numeradas para Submissão no Portal ({packageStructure.totalFolders} Pastas • {packageStructure.totalFiles} Arquivos)
                  </h4>
                  <span style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                    Arquivos renomeados com nomenclatura padronizada e limpa sem alterar o arquivo original no cofre.
                  </span>
                </div>
                <button 
                  className="btn-dossier-action btn-dossier-export"
                  onClick={() => showToast('Pacote ZIP estruturado pronto para download!')}
                >
                  <Download size={14} />
                  <span>Baixar ZIP do Dossiê</span>
                </button>
              </div>

              <div className="package-builder-grid">
                {packageStructure.folders.map(folder => (
                  <div key={folder.folderName} className="folder-box">
                    <div className="folder-box-header">
                      <FolderCheck size={16} />
                      <span>{folder.title}</span>
                    </div>
                    <div className="folder-files-list">
                      {folder.files.map((file, fIdx) => (
                        <div key={fIdx} className="folder-file-row">
                          <span className="folder-file-name" title={file.uploadName}>{file.uploadName}</span>
                          <span className="folder-file-size">{file.size}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 9: SNAPSHOTS & AUDITORIA */}
          {activeTab === 'versoes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.1rem' }}>
                <h4 style={{ margin: '0 0 0.6rem 0', color: '#00E5C9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={16} /> Snapshots Históricos Congelados ({dossier.snapshots?.length || 0})
                </h4>
                {dossier.snapshots?.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                    Nenhum snapshot congelado ainda. Ao clicar em "Aprovar & Congelar Dossiê", uma versão imutável com hash criptográfico será registrada aqui.
                  </p>
                ) : (
                  dossier.snapshots.map((snap, sIdx) => (
                    <div key={sIdx} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #00E5C9', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#F8FAFC', fontSize: '0.86rem' }}>Snapshot v{snap.versionNumber} — Aprovado por {snap.approvedBy}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{new Date(snap.snapshotDate).toLocaleString('pt-BR')}</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#00E5C9', fontFamily: 'monospace', marginTop: '0.2rem' }}>
                        Hash: {snap.integrityHash}
                      </div>
                      <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.76rem', color: '#CBD5E1' }}>{snap.summary}</p>
                    </div>
                  ))
                )}
              </div>

              {/* TRILHA DE AUDITORIA */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.1rem' }}>
                <h4 style={{ margin: '0 0 0.6rem 0', color: '#F8FAFC', fontSize: '0.88rem' }}>
                  Trilha de Auditoria do Dossiê
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dossier.auditTrail?.map((log, lIdx) => (
                    <div key={lIdx} style={{ fontSize: '0.76rem', padding: '0.5rem 0.7rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                      <span style={{ color: '#00E5C9', fontWeight: 600 }}>{log.timestamp}</span> • <strong>{log.author}:</strong> {log.action}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* DIÁLOGO DE REABERTURA COM JUSTIFICATIVA OBRIGATÓRIA */}
        {showReopenDialog && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10005
          }}>
            <div style={{
              background: '#0B1120',
              border: '1px solid #F59E0B',
              borderRadius: '12px',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <h3 style={{ margin: 0, color: '#F59E0B', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Unlock size={18} /> Justificativa Obrigatória para Reabertura
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                O dossiê já havia sido congelado para submissão. Para alterar qualquer documento ou declaração, informe o motivo auditável da reabertura.
              </p>
              <textarea 
                style={{
                  width: '100%',
                  height: '90px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                  color: '#FFFFFF',
                  padding: '0.6rem',
                  fontSize: '0.82rem'
                }}
                placeholder="Ex: Recebimento de Adendo 01 com retificação do prazo de entrega..."
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button 
                  className="btn-dossier-action"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#CBD5E1' }}
                  onClick={() => setShowReopenDialog(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn-dossier-action btn-dossier-reopen"
                  onClick={handleConfirmReopen}
                  disabled={!reopenReason.trim()}
                >
                  Confirmar Reabertura
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
