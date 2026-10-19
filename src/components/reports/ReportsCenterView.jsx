import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  History, 
  Building2, 
  Scale, 
  Sparkles, 
  Layers, 
  FileSignature, 
  Share2, 
  ArrowRight, 
  ChevronRight, 
  RefreshCw, 
  Archive, 
  Search,
  Lock,
  GitBranch
} from 'lucide-react';
import { 
  reportGenerationService 
} from '../../services/reports/reportGenerationService.js';
import { 
  ReportType, 
  ReportStatus, 
  SecurityClassification, 
  COMPANY_BRANDING, 
  INITIAL_TEMPLATES 
} from '../../services/reports/reportTemplates.js';
import { OpportunityService } from '../../services/opportunityService.js';
import './ReportsCenterView.css';

export default function ReportsCenterView({ onNavigateToOpportunity }) {
  const [activeSubTab, setActiveSubTab] = useState('library'); // library, preview, templates, history
  const [reports, setReports] = useState(reportGenerationService.getReports());
  const [selectedReport, setSelectedReport] = useState(reports[0]);
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [notification, setNotification] = useState(null);
  const [goldenTestResults, setGoldenTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Modal de Novo Relatório
  const [newReportModalOpen, setNewReportModalOpen] = useState(false);
  const [newReportType, setNewReportType] = useState(ReportType.OPPORTUNITY_EXECUTIVE_SUMMARY);
  const [newReportCompany, setNewReportCompany] = useState('Veeluen');
  const [newReportOppId, setNewReportOppId] = useState('OPP-2026-7841');
  const [newReportNotes, setNewReportNotes] = useState('');

  const opportunitiesList = OpportunityService.listAll();

  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectReport = (rep) => {
    setSelectedReport(rep);
    setActiveSubTab('preview');
  };

  const handleGenerateSubmit = () => {
    const generated = reportGenerationService.generateReport({
      type: newReportType,
      opportunityId: newReportOppId,
      companyId: newReportCompany,
      user: { name: 'Diretoria / Henrique Veeluen', role: 'ADMIN' },
      customNotes: newReportNotes
    });

    setReports(reportGenerationService.getReports());
    setSelectedReport(generated);
    setNewReportModalOpen(false);
    setActiveSubTab('preview');
    showToast(`Relatório "${generated.title}" gerado com sucesso!`, 'success');
  };

  const handleApproveReport = (reportId) => {
    const approved = reportGenerationService.approveReport(reportId, 'Dr. Henrique Veeluen (Diretor Presidente)');
    setReports(reportGenerationService.getReports());
    setSelectedReport({ ...approved });
    showToast('Relatório aprovado formalmente com alçada da Diretoria!', 'success');
  };

  const handleArchiveReport = (reportId) => {
    const archived = reportGenerationService.archiveReport(reportId);
    setReports(reportGenerationService.getReports());
    setSelectedReport({ ...archived });
    showToast('Relatório arquivado com histórico preservado.', 'info');
  };

  const handleCreateNewVersion = (reportId) => {
    const newVer = reportGenerationService.createNewVersion(reportId, {
      executiveRecommendation: 'Revisão pós-comitê: Margem mantida e equipe de campo confirmada em Suape.'
    });
    setReports(reportGenerationService.getReports());
    setSelectedReport(newVer);
    showToast(`Nova versão ${newVer.version} gerada com sucesso!`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRunGoldenTests = () => {
    setIsTesting(true);
    showToast('Executando suíte do Golden Report Set (7 Casos de Teste)...', 'info');
    setTimeout(() => {
      const res = reportGenerationService.runGoldenReportSet();
      setGoldenTestResults(res);
      setIsTesting(false);
      showToast(`Testes concluídos: ${res.passed}/${res.totalCases} aprovados`, res.success ? 'success' : 'error');
    }, 600);
  };

  const branding = selectedReport ? COMPANY_BRANDING[selectedReport.companyId] || COMPANY_BRANDING.Veeluen : COMPANY_BRANDING.Veeluen;

  return (
    <div className="reports-center-container">
      {/* Toast Notification */}
      {notification && (
        <div className={`report-toast toast-${notification.type}`}>
          <FileText size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL DO CENTRO DE RELATÓRIOS */}
      <div className="reports-header-row">
        <div className="reports-header-left">
          <div className="reports-header-icon">
            <FileText size={22} />
          </div>
          <div className="reports-header-title">
            <h2>Centro de Relatórios & Briefings Executivos</h2>
            <p>Geração inteligente de documentos corporativos estruturados, rastreáveis e com fidelidade histórica.</p>
          </div>
        </div>

        <div className="reports-header-actions">
          <button 
            className="btn-report-secondary"
            onClick={handleRunGoldenTests}
            disabled={isTesting}
          >
            <RefreshCw size={14} className={isTesting ? 'spinning' : ''} />
            {isTesting ? 'Validando...' : 'Golden Report Set (7 Testes)'}
          </button>

          <button 
            className="btn-report-primary"
            onClick={() => setNewReportModalOpen(true)}
          >
            <Plus size={15} /> Gerar Novo Relatório
          </button>
        </div>
      </div>

      {/* PAINEL DA SUÍTE GOLDEN REPORT SET (Se disparada) */}
      {goldenTestResults && (
        <div className="golden-test-panel">
          <div className="golden-test-header">
            <strong style={{ color: '#34D399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Golden Report Set ({goldenTestResults.passed}/{goldenTestResults.totalCases} Casos Aprovados)
            </strong>
            <button 
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              onClick={() => setGoldenTestResults(null)}
            >
              ✕
            </button>
          </div>
          <div className="golden-test-grid">
            {goldenTestResults.results.map((c, i) => (
              <div key={i} className={`golden-test-card ${c.passed ? 'pass' : 'fail'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{c.caseId}: {c.title}</span>
                  <span style={{ color: c.passed ? '#34D399' : '#EF4444' }}>{c.passed ? 'PASS' : 'FAIL'}</span>
                </div>
                <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '4px' }}>{c.observation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO DE SUBSEÇÕES (Item 2) */}
      <div className="reports-nav-tabs">
        <button 
          className={`report-tab-btn ${activeSubTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('library')}
        >
          <FileText size={15} /> Meus Relatórios ({reports.length})
        </button>
        <button 
          className={`report-tab-btn ${activeSubTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('preview')}
        >
          <Eye size={15} /> Visualizador & Preview A4
        </button>
        <button 
          className={`report-tab-btn ${activeSubTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('templates')}
        >
          <Layers size={15} /> Biblioteca de Modelos (Templates)
        </button>
        <button 
          className={`report-tab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          <History size={15} /> Histórico & Snapshots Imutáveis
        </button>
      </div>

      {/* CONTEÚDO DAS SUBSEÇÕES */}
      
      {/* ABA 1: MEUS RELATÓRIOS (LIBRARY) */}
      {activeSubTab === 'library' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>
              Documentos oficiais gerados com vínculo direto aos dados e análises do Vellia.
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`btn-report-secondary ${companyFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setCompanyFilter('ALL')}
                style={{ padding: '5px 12px', fontSize: '12px' }}
              >
                Todas as Empresas
              </button>
              <button 
                className={`btn-report-secondary ${companyFilter === 'Veeluen' ? 'active' : ''}`}
                onClick={() => setCompanyFilter('Veeluen')}
                style={{ padding: '5px 12px', fontSize: '12px' }}
              >
                Veeluen Solutions
              </button>
              <button 
                className={`btn-report-secondary ${companyFilter === 'Excelencia' ? 'active' : ''}`}
                onClick={() => setCompanyFilter('Excelencia')}
                style={{ padding: '5px 12px', fontSize: '12px' }}
              >
                Excelência Ambiental
              </button>
            </div>
          </div>

          <div className="reports-list-grid">
            {reports
              .filter(r => companyFilter === 'ALL' || r.companyId === companyFilter)
              .map(rep => (
                <div 
                  key={rep.id} 
                  className="report-item-card"
                  onClick={() => handleSelectReport(rep)}
                >
                  <div className="report-card-top">
                    <span className={`report-type-badge ${rep.companyId === 'Excelencia' ? 'badge-excelencia' : 'badge-veeluen'}`}>
                      {rep.companyId === 'Excelencia' ? 'Excelência Ambiental' : 'Veeluen Solutions'}
                    </span>
                    <span className={`report-status-badge status-${rep.status.toLowerCase()}`}>
                      {rep.status}
                    </span>
                  </div>

                  <h4 className="report-card-title">{rep.title}</h4>

                  <div className="report-card-meta">
                    <span>Versão: <strong>{rep.version}</strong> • Modelo: {rep.templateId}</span>
                    <span>Criado por: {rep.createdBy}</span>
                    <span>Classificação: {rep.securityClassification}</span>
                  </div>

                  {rep.warnings && rep.warnings.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#FBBF24', background: 'rgba(245,158,11,0.08)', padding: '6px', borderRadius: '4px' }}>
                      ⚠️ {rep.warnings[0]}
                    </div>
                  )}

                  <div className="report-card-footer">
                    <span>{rep.createdAt.split('T')[0]}</span>
                    <span style={{ color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Visualizar Papel <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ABA 2: VISUALIZADOR & PREVIEW EM PAPEL A4 (Itens 117 a 119) */}
      {activeSubTab === 'preview' && selectedReport && (
        <div className="report-preview-layout">
          
          {/* FOLHA DE PAPEL A4 TIMBRADA */}
          <div className="report-paper-container">
            <div className={`report-sheet-paper ${selectedReport.companyId === 'Excelencia' ? 'excelencia' : 'veeluen'}`}>
              
              {/* CABEÇALHO TIMBRADO */}
              <div className={`paper-header ${selectedReport.companyId === 'Excelencia' ? 'excelencia' : 'veeluen'}`}>
                <div>
                  <div className="paper-brand-logo-text">{branding.logoSvgText}</div>
                  <div className="paper-brand-tagline">{branding.tagline} • CNPJ: {branding.cnpj}</div>
                </div>
                <div className="paper-confidential-pill">
                  {selectedReport.securityClassification || SecurityClassification.INTERNAL_USE}
                </div>
              </div>

              {/* TÍTULO E METADADOS */}
              <h1 className="paper-doc-title">{selectedReport.title}</h1>
              <div className="paper-doc-meta">
                <span><strong>Versão:</strong> {selectedReport.version}</span>
                <span><strong>Data:</strong> {selectedReport.createdAt.split('T')[0]}</span>
                <span><strong>Snapshot:</strong> {selectedReport.snapshotId}</span>
                <span><strong>Autor:</strong> {selectedReport.createdBy}</span>
                {selectedReport.approvedBy && (
                  <span style={{ color: '#059669' }}><strong>Aprovado por:</strong> {selectedReport.approvedBy}</span>
                )}
              </div>

              {/* ALERTAS DE DADOS SE HOUVER */}
              {selectedReport.warnings && selectedReport.warnings.length > 0 && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderLeft: '4px solid #F59E0B', padding: '10px 14px', borderRadius: '4px', marginBottom: '20px', fontSize: '11.5px', color: '#B45309' }}>
                  <strong>Aviso de Cobertura de Dados:</strong> {selectedReport.warnings.join(' ')}
                </div>
              )}

              {/* CONTEÚDO DAS SEÇÕES */}
              {selectedReport.content && (
                <div>
                  {selectedReport.content.objectDescription && (
                    <div className="paper-section">
                      <div className="paper-section-title">1. Objeto & Escopo Contratual</div>
                      <p className="paper-section-text">{selectedReport.content.objectDescription}</p>
                    </div>
                  )}

                  <div className="paper-section">
                    <div className="paper-section-title">2. Parâmetros do Certame & Habilitação</div>
                    <table className="paper-table">
                      <tbody>
                        <tr>
                          <td style={{ width: '35%', fontWeight: 600 }}>Contratante / Órgão:</td>
                          <td>{selectedReport.content.clientName || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Portal / Número:</td>
                          <td>{selectedReport.content.portalSource || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Valor Estimado Oficial:</td>
                          <td>{selectedReport.content.estimatedValueFormatted || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Prazo para Submissão:</td>
                          <td>{selectedReport.content.deadlineFormatted || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Aderência Técnica Vellia:</td>
                          <td>{selectedReport.content.technicalMatchScore || 'Não informado'}</td>
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 600 }}>Atestado Probatório:</td>
                          <td>{selectedReport.content.attestationName || 'Não informado'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {selectedReport.content.pricingOverview && (
                    <div className="paper-section">
                      <div className="paper-section-title">3. Parâmetros de Preço & Floor Price</div>
                      <p className="paper-section-text">{selectedReport.content.pricingOverview}</p>
                    </div>
                  )}

                  {selectedReport.content.risksList && (
                    <div className="paper-section">
                      <div className="paper-section-title">4. Matriz de Riscos & Condicionantes</div>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
                        {selectedReport.content.risksList.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedReport.content.executiveRecommendation && (
                    <div className="paper-recommendation-box">
                      <strong>Recomendação Executiva & Próximos Passos:</strong>
                      <p>{selectedReport.content.executiveRecommendation}</p>
                    </div>
                  )}

                  {selectedReport.content.deliberationJustification && (
                    <div className="paper-section" style={{ marginTop: '16px' }}>
                      <div className="paper-section-title">Deliberação Formal do Comitê</div>
                      <p className="paper-section-text">{selectedReport.content.deliberationJustification}</p>
                      <div style={{ marginTop: '14px', display: 'flex', gap: '30px' }}>
                        <div>
                          <strong>Resultado:</strong> <span style={{ color: '#059669', fontWeight: 700 }}>{selectedReport.content.decisionOutcome}</span>
                        </div>
                        <div>
                          <strong>Piso Protegido:</strong> {selectedReport.content.approvedFloorPrice}
                        </div>
                        <div>
                          <strong>Margem Mínima:</strong> {selectedReport.content.approvedMinMargin}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FASE 47: PERFORMANCE CONTRATUAL & VARIAÇÃO DE CUSTOS */}
                  {selectedReport.content.costVariations && (
                    <div className="paper-section" style={{ marginTop: '16px' }}>
                      <div className="paper-section-title">Análise de Variação de Custos Estratégicos (Planejado vs Observado)</div>
                      <table className="paper-table">
                        <thead>
                          <tr style={{ background: '#F1F5F9', textAlign: 'left', fontSize: '11px' }}>
                            <th style={{ padding: '6px' }}>Categoria</th>
                            <th style={{ padding: '6px' }}>Planejado</th>
                            <th style={{ padding: '6px' }}>Observado</th>
                            <th style={{ padding: '6px' }}>Variação</th>
                            <th style={{ padding: '6px' }}>Origem do Dado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedReport.content.costVariations.map((v, i) => (
                            <tr key={i} style={{ fontSize: '11.5px' }}>
                              <td style={{ padding: '6px', fontWeight: 600 }}>{v.category}</td>
                              <td style={{ padding: '6px' }}>{v.plannedFormatted}</td>
                              <td style={{ padding: '6px' }}>{v.observedFormatted}</td>
                              <td style={{ padding: '6px', color: v.varianceFormatted.startsWith('+') ? '#DC2626' : '#059669', fontWeight: 700 }}>
                                {v.varianceFormatted}
                              </td>
                              <td style={{ padding: '6px', color: '#64748B' }}>{v.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {selectedReport.content.marginNote && (
                        <p style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', margin: '6px 0 0' }}>
                          * {selectedReport.content.marginNote}
                        </p>
                      )}
                    </div>
                  )}

                  {/* FASE 47: LIÇÕES APRENDIDAS CORPORATIVAS */}
                  {selectedReport.content.lessonsList && (
                    <div className="paper-section" style={{ marginTop: '16px' }}>
                      <div className="paper-section-title">Inventário de Lições Aprendidas Aprovadas (Closed-Loop)</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedReport.content.lessonsList.map(l => (
                          <div key={l.id} style={{ border: '1px solid #CBD5E1', padding: '10px', borderRadius: '4px', background: '#F8FAFC' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                              <strong style={{ color: '#0F172A' }}>{l.title}</strong>
                              <span style={{ color: '#0284C7', fontWeight: 600 }}>{l.category} • {l.status}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#334155' }}><strong>Recomendação:</strong> {l.recommendation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FASE 47: ENCERRAMENTO CONTRATUAL & POTENCIAL DE ATESTADO */}
                  {selectedReport.content.potentialCapabilityAsset && (
                    <div className="paper-section" style={{ marginTop: '16px' }}>
                      <div className="paper-section-title">Ativo de Capacidade Futura Gerado (Capability Loop)</div>
                      <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 700, color: '#065F46', fontSize: '12px', marginBottom: '4px' }}>
                          {selectedReport.content.potentialCapabilityAsset.assetType}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#047857' }}>
                          {selectedReport.content.potentialCapabilityAsset.relevance}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                          Workflow de Solicitação: {selectedReport.content.potentialCapabilityAsset.workflowId}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FASE 48: QUALIDADE DE DADOS & GOVERNANÇA DA INFORMAÇÃO */}
                  {selectedReport.content.healthDimensions && (
                    <div className="paper-section" style={{ marginTop: '16px' }}>
                      <div className="paper-section-title">Auditoria de Saúde da Base (4 Dimensões Fáticas)</div>
                      <p className="paper-section-text" style={{ marginBottom: '12px' }}>
                        {selectedReport.content.executiveDiagnosis}
                      </p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ border: '1px solid #CBD5E1', padding: '8px', borderRadius: '4px', textAlign: 'center', background: '#F8FAFC' }}>
                          <span style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Completeness</span>
                          <strong style={{ fontSize: '13px', color: '#0F172A' }}>{selectedReport.content.healthDimensions.completeness}</strong>
                        </div>
                        <div style={{ border: '1px solid #CBD5E1', padding: '8px', borderRadius: '4px', textAlign: 'center', background: '#F8FAFC' }}>
                          <span style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Freshness</span>
                          <strong style={{ fontSize: '13px', color: '#059669' }}>{selectedReport.content.healthDimensions.freshness}</strong>
                        </div>
                        <div style={{ border: '1px solid #CBD5E1', padding: '8px', borderRadius: '4px', textAlign: 'center', background: '#F8FAFC' }}>
                          <span style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Consistency</span>
                          <strong style={{ fontSize: '13px', color: '#0F172A' }}>{selectedReport.content.healthDimensions.consistency}</strong>
                        </div>
                        <div style={{ border: '1px solid #CBD5E1', padding: '8px', borderRadius: '4px', textAlign: 'center', background: '#F8FAFC' }}>
                          <span style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Traceability</span>
                          <strong style={{ fontSize: '13px', color: '#0284C7' }}>{selectedReport.content.healthDimensions.traceability}</strong>
                        </div>
                      </div>

                      {selectedReport.content.qualityMetrics && (
                        <div style={{ background: '#F1F5F9', padding: '10px 14px', borderRadius: '4px', marginBottom: '14px', fontSize: '11.5px' }}>
                          <strong>Métricas de Confiabilidade: </strong>
                          {selectedReport.content.qualityMetrics.openIssuesCount} issues abertos • {selectedReport.content.qualityMetrics.activeConflictsCount} conflito ativo • {selectedReport.content.qualityMetrics.staleRecordsCount} registro stale • Tendência de Conflitos: <span style={{ color: '#059669', fontWeight: 700 }}>{selectedReport.content.qualityMetrics.criticalConflictsTrend}</span>
                        </div>
                      )}

                      {selectedReport.content.conflictsList && selectedReport.content.conflictsList.length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          <strong style={{ fontSize: '11.5px', color: '#0F172A' }}>Conflitos & Divergências de Fontes:</strong>
                          <table className="paper-table" style={{ marginTop: '6px' }}>
                            <thead>
                              <tr style={{ background: '#F1F5F9', textAlign: 'left', fontSize: '10.5px' }}>
                                <th style={{ padding: '4px 6px' }}>Campo</th>
                                <th style={{ padding: '4px 6px' }}>Fonte Primária</th>
                                <th style={{ padding: '4px 6px' }}>Fonte Secundária</th>
                                <th style={{ padding: '4px 6px' }}>Resolução / Regra</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedReport.content.conflictsList.map((c, i) => (
                                <tr key={i} style={{ fontSize: '11px' }}>
                                  <td style={{ padding: '4px 6px', fontWeight: 600 }}>{c.field}</td>
                                  <td style={{ padding: '4px 6px' }}>{c.sourceA}</td>
                                  <td style={{ padding: '4px 6px' }}>{c.sourceB}</td>
                                  <td style={{ padding: '4px 6px', color: '#0284C7' }}>{c.resolvedValue}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {selectedReport.content.connectorsHealth && (
                        <div>
                          <strong style={{ fontSize: '11.5px', color: '#0F172A' }}>Observabilidade de Conectores Externos:</strong>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '6px' }}>
                            {selectedReport.content.connectorsHealth.map((cn, i) => (
                              <div key={i} style={{ border: '1px solid #E2E8F0', padding: '8px', borderRadius: '4px', fontSize: '11px', background: cn.status === 'HEALTHY' ? '#F8FAFC' : '#FEF2F2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                                  <span>{cn.name}</span>
                                  <span style={{ color: cn.status === 'HEALTHY' ? '#059669' : '#DC2626' }}>{cn.status} ({cn.latency})</span>
                                </div>
                                <div style={{ color: '#64748B', fontSize: '10px', marginTop: '2px' }}>Última sync: {cn.lastSyncFormatted}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <p style={{ fontSize: '10.5px', color: '#64748B', fontStyle: 'italic', marginTop: '12px' }}>
                        * {selectedReport.content.governanceRule}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* RODAPÉ TIMBRADO */}
              <div className="paper-footer">
                <span>{branding.confidentialityNotice}</span>
                <span>Página 1 de 1 • Gerado pelo Vellia Licitações</span>
              </div>

            </div>
          </div>

          {/* SIDEBAR LATERAL DO INSPETOR (Ações de Relatório) */}
          <div className="report-inspector-sidebar">
            <div className="report-inspector-card">
              <div className="inspector-card-title">
                <FileSignature size={14} color="#38BDF8" /> Governança & Aprovação
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>
                Status Atual: <strong style={{ color: '#F8FAFC' }}>{selectedReport.status}</strong>
              </div>

              {selectedReport.status !== ReportStatus.APPROVED ? (
                <button 
                  className="inspector-action-btn"
                  onClick={() => handleApproveReport(selectedReport.id)}
                  style={{ background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)', color: '#34D399' }}
                >
                  <span><CheckCircle2 size={14} /> Aprovar Formalmente</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <div style={{ fontSize: '11.5px', color: '#34D399', background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '6px', marginBottom: '10px' }}>
                  ✓ Aprovado por {selectedReport.approvedBy}
                </div>
              )}

              <button 
                className="inspector-action-btn"
                onClick={() => handleCreateNewVersion(selectedReport.id)}
              >
                <span><GitBranch size={14} /> Gerar Nova Versão (v2.0)</span>
                <ChevronRight size={14} />
              </button>

              <button 
                className="inspector-action-btn"
                onClick={() => handleArchiveReport(selectedReport.id)}
              >
                <span><Archive size={14} /> Arquivar Relatório</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="report-inspector-card">
              <div className="inspector-card-title">
                <Download size={14} color="#34D399" /> Exportar Documento
              </div>
              <button className="inspector-action-btn" onClick={handlePrint}>
                <span><Printer size={14} /> Imprimir / Salvar PDF</span>
                <ChevronRight size={14} />
              </button>
              <button className="inspector-action-btn" onClick={() => showToast('Exportação DOCX estruturada gerada.', 'success')}>
                <span><FileText size={14} /> Exportar como Word (DOCX)</span>
                <ChevronRight size={14} />
              </button>
              <button className="inspector-action-btn" onClick={() => showToast('Exportação de dados tabulares XLSX gerada.', 'success')}>
                <span><FileText size={14} /> Exportar Planilha (XLSX)</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="report-inspector-card">
              <div className="inspector-card-title">
                <History size={14} color="#FBBF24" /> Rastreabilidade & Snapshot
              </div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                <div><strong>Snapshot ID:</strong> {selectedReport.snapshotId}</div>
                <div><strong>Base de Dados:</strong> Congelada no momento da geração</div>
                <div><strong>Integridade:</strong> Auditado e imutável</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ABA 3: BIBLIOTECA DE MODELOS (TEMPLATES) */}
      {activeSubTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {INITIAL_TEMPLATES.map(tmpl => (
            <div key={tmpl.id} className="report-inspector-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: '#38BDF8', fontSize: '14px' }}>{tmpl.title}</strong>
                <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#94A3B8' }}>
                  {tmpl.targetFormat} • v{tmpl.version}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '12px' }}>{tmpl.description}</p>
              <div style={{ fontSize: '11px', color: '#64748B', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                Seções: {tmpl.sections.map(s => s.title).join(' • ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 4: HISTÓRICO & SNAPSHOTS */}
      {activeSubTab === 'history' && (
        <div className="report-inspector-card">
          <h4 style={{ margin: '0 0 12px', color: '#F8FAFC' }}>Snapshots Históricos Congelados</h4>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
            Cada relatório gerado possui um snapshot que armazena os valores exatos daquele momento, impedindo que futuras alterações de edital ou preço corrompam a memória deliberativa.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#CBD5E1' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', color: '#94A3B8' }}>
                <th style={{ padding: '8px' }}>Snapshot ID</th>
                <th style={{ padding: '8px' }}>Oportunidade</th>
                <th style={{ padding: '8px' }}>Data Capturada</th>
                <th style={{ padding: '8px' }}>Capturado Por</th>
                <th style={{ padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(rep => (
                <tr key={rep.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '8px', color: '#38BDF8' }}>{rep.snapshotId}</td>
                  <td style={{ padding: '8px' }}>{rep.title}</td>
                  <td style={{ padding: '8px' }}>{rep.createdAt.split('T')[0]}</td>
                  <td style={{ padding: '8px' }}>{rep.createdBy}</td>
                  <td style={{ padding: '8px', color: '#34D399' }}>Imutável</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE GERAÇÃO DE NOVO RELATÓRIO */}
      {newReportModalOpen && (
        <div className="report-modal-overlay" onClick={() => setNewReportModalOpen(false)}>
          <div className="report-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="report-modal-header">
              <h3><Plus size={18} color="#38BDF8" /> Gerar Novo Relatório Estruturado</h3>
              <button 
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                onClick={() => setNewReportModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="report-form-group">
              <label className="report-form-label">Tipo de Relatório:</label>
              <select 
                className="report-form-select"
                value={newReportType}
                onChange={(e) => setNewReportType(e.target.value)}
              >
                <option value={ReportType.OPPORTUNITY_EXECUTIVE_SUMMARY}>Resumo Executivo de Oportunidade</option>
                <option value={ReportType.GO_NO_GO_REPORT}>Relatório Formal Go/No-Go</option>
                <option value={ReportType.EXECUTIVE_BRIEFING}>Briefing Executivo Curto (One-Pager)</option>
                <option value={ReportType.RESULT_POST_MORTEM_REPORT}>Relatório Pós-Licitação (Post-Mortem)</option>
                <option value={ReportType.CONTRACT_PERFORMANCE_REPORT}>Relatório de Performance Contratual & Aprendizado (Fase 47)</option>
                <option value={ReportType.LESSONS_LEARNED_REPORT}>Relatório Corporativo de Lições Aprendidas (Fase 47)</option>
                <option value={ReportType.CONTRACT_CLOSURE_REPORT}>Relatório de Encerramento Contratual & Capability Growth (Fase 47)</option>
              </select>
            </div>

            <div className="report-form-group">
              <label className="report-form-label">Identidade Visual da Empresa:</label>
              <select 
                className="report-form-select"
                value={newReportCompany}
                onChange={(e) => setNewReportCompany(e.target.value)}
              >
                <option value="Veeluen">Veeluen Solutions Ltda. (Azul Marinho)</option>
                <option value="Excelencia">Excelência Ambiental S/A (Verde Esmeralda)</option>
              </select>
            </div>

            <div className="report-form-group">
              <label className="report-form-label">Selecionar Oportunidade:</label>
              <select 
                className="report-form-select"
                value={newReportOppId}
                onChange={(e) => setNewReportOppId(e.target.value)}
              >
                {opportunitiesList.map(opp => (
                  <option key={opp.id} value={opp.id}>{opp.title} ({opp.client})</option>
                ))}
              </select>
            </div>

            <div className="report-form-group">
              <label className="report-form-label">Notas Adicionais do Elaborador (Opcional):</label>
              <textarea 
                rows={3}
                className="report-form-textarea"
                placeholder="Observações complementares a serem inseridas no corpo do documento..."
                value={newReportNotes}
                onChange={(e) => setNewReportNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button 
                className="btn-report-secondary"
                onClick={() => setNewReportModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-report-primary"
                onClick={handleGenerateSubmit}
              >
                <Sparkles size={14} /> Gerar Relatório e Criar Snapshot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
