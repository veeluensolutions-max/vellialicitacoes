import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSearch, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Layers, 
  Users, 
  Wrench, 
  Calendar, 
  DollarSign, 
  ShieldAlert, 
  FolderOpen, 
  History, 
  Send, 
  MessageSquare, 
  Eye, 
  Upload, 
  Plus, 
  Clock, 
  Check, 
  Edit3, 
  Save, 
  ChevronRight, 
  ExternalLink, 
  ShieldCheck, 
  Building2, 
  MapPin, 
  Flame, 
  Info, 
  RefreshCw,
  Hash,
  Download,
  Filter,
  Search,
  Scale
} from 'lucide-react';
import EditalAnalysisEngine from '../services/edital/editalAnalysisEngine';
import EditalDocumentRepository, { DocumentTypes } from '../services/edital/editalDocumentRepository';
import OpportunityService from '../services/opportunityService';
import './EditalAnalysisModal.css';

export default function EditalAnalysisModal({ 
  opportunityId, 
  isOpen, 
  onClose,
  initialTab = 'resumo'
}) {
  if (!isOpen || !opportunityId) return null;

  // Estado da Oportunidade e Análise
  const [opp, setOpp] = useState(() => OpportunityService.getById(opportunityId));
  const [activeTab, setActiveTab] = useState(initialTab);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('Lendo documentos associados...');

  // Modal de Citação / Trecho Original do Edital (Item 25 e 26)
  const [quoteModalData, setQuoteModalData] = useState(null);

  // Edição Humana de Requisito (Item 47)
  const [editingReqId, setEditingReqId] = useState(null);
  const [editingReqForm, setEditingReqForm] = useState({
    status: '',
    observation: '',
    reviewer: 'Especialista em Licitações (Usuário)'
  });

  // Assistente de Edital (Item 37 e 38)
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'assistant',
      text: 'Olá! Sou o Assistente Especialista de Edital do Vellia Licitações. Analisei os documentos desta oportunidade e posso responder dúvidas específicas sobre requisitos, atestados, visita técnica, equipe e riscos. O que gostaria de verificar?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Upload de novo documento
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    type: DocumentTypes.EDITAL,
    source: 'Upload Manual',
    url: '',
    fileSize: '3.2 MB'
  });

  // Atualizar oportunidade e rodar análise com pipeline visual
  useEffect(() => {
    if (!opportunityId) return;
    const currentOpp = OpportunityService.getById(opportunityId);
    setOpp(currentOpp);

    setIsLoading(true);
    setLoadingStep('1/5 - Lendo documentos e termos de referência...');

    const t1 = setTimeout(() => {
      setLoadingStep('2/5 - Identificando seções estruturais do edital...');
    }, 250);

    const t2 = setTimeout(() => {
      setLoadingStep('3/5 - Extraindo requisitos jurídicos, fiscais e técnicos...');
    }, 550);

    const t3 = setTimeout(() => {
      setLoadingStep('4/5 - Cruzando com atestados e certidões da empresa...');
    }, 850);

    const t4 = setTimeout(() => {
      setLoadingStep('5/5 - Consolidando score de habilitação e riscos...');
      const result = EditalAnalysisEngine.analyzeOpportunity(opportunityId);
      setAnalysis(result);
      setIsLoading(false);
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [opportunityId]);

  // Recarregar análise após alterações
  const reloadAnalysis = () => {
    const result = EditalAnalysisEngine.analyzeOpportunity(opportunityId);
    setAnalysis(result);
  };

  // Enviar pergunta ao Assistente de Edital
  const handleSendMessage = (textToSend) => {
    const question = textToSend || chatInput;
    if (!question.trim()) return;

    const userMsg = { sender: 'user', text: question };
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = EditalAnalysisEngine.askAssistant(opportunityId, question);
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'assistant', 
          text: response.text, 
          sources: response.sources,
          confidence: response.confidence
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  // Iniciar Edição de Requisito (Revisão Humana)
  const handleStartEditReq = (req) => {
    setEditingReqId(req.id);
    setEditingReqForm({
      status: req.status,
      observation: req.observation || '',
      reviewer: 'Especialista em Licitações'
    });
  };

  // Salvar Edição Humana
  const handleSaveEditReq = (reqId) => {
    EditalAnalysisEngine.updateRequirementReview(opportunityId, reqId, {
      status: editingReqForm.status,
      observation: editingReqForm.observation,
      reviewer: editingReqForm.reviewer
    });
    setEditingReqId(null);
    reloadAnalysis();
  };

  // Cadastrar Novo Documento
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFormData.name) return;

    EditalDocumentRepository.addDocument(opportunityId, {
      name: uploadFormData.name,
      type: uploadFormData.type,
      source: uploadFormData.url ? 'URL Externa' : 'Upload PDF/Doc',
      url: uploadFormData.url,
      size: uploadFormData.fileSize,
      pages: 18,
      version: 'v1.0'
    });

    setShowUploadForm(false);
    setUploadFormData({
      name: '',
      type: DocumentTypes.EDITAL,
      source: 'Upload Manual',
      url: '',
      fileSize: '2.5 MB'
    });
    reloadAnalysis();
  };

  if (!opp) return null;

  // Helpers de Badge de Status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ATENDIDO':
        return <span className="req-status-pill status-atendido"><CheckCircle2 size={13} /> Atendido</span>;
      case 'PARCIALMENTE ATENDIDO':
        return <span className="req-status-pill status-parcial"><AlertTriangle size={13} /> Parcial</span>;
      case 'NÃO ATENDIDO':
        return <span className="req-status-pill status-nao"><XCircle size={13} /> Não Atendido</span>;
      case 'NÃO IDENTIFICADO':
        return <span className="req-status-pill status-nao-ident"><HelpCircle size={13} /> Não Identificado</span>;
      case 'NÃO SE APLICA':
        return <span className="req-status-pill status-nao-aplica">Não se aplica</span>;
      default:
        return <span className="req-status-pill">{status}</span>;
    }
  };

  const getConfidenceBadge = (confidence) => {
    switch (confidence) {
      case 'ALTA':
        return <span className="confidence-pill conf-alta" title="Alta fidelidade na extração"><ShieldCheck size={11} /> Alta confiança</span>;
      case 'MÉDIA':
        return <span className="confidence-pill conf-media" title="Confirmação recomendada"><Info size={11} /> Média confiança</span>;
      case 'BAIXA':
        return <span className="confidence-pill conf-baixa" title="Sugerida revisão humana"><AlertTriangle size={11} /> Baixa (revisar)</span>;
      default:
        return null;
    }
  };

  const getRiskSeverityBadge = (severity) => {
    switch (severity) {
      case 'Crítico':
        return <span className="risk-sev-pill sev-critico"><Flame size={12} /> Crítico</span>;
      case 'Alto':
        return <span className="risk-sev-pill sev-alto"><AlertTriangle size={12} /> Alto</span>;
      case 'Moderado':
        return <span className="risk-sev-pill sev-moderado"><Info size={12} /> Moderado</span>;
      case 'Baixo':
        return <span className="risk-sev-pill sev-baixo"><Check size={12} /> Baixo</span>;
      default:
        return null;
    }
  };

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'PARTICIPAR':
        return <div className="rec-badge rec-participar"><CheckCircle2 size={16} /> PARTICIPAR (GO)</div>;
      case 'PARTICIPAR COM PENDÊNCIAS':
        return <div className="rec-badge rec-pendencias"><AlertTriangle size={16} /> PARTICIPAR COM PENDÊNCIAS</div>;
      case 'ANALISAR':
        return <div className="rec-badge rec-analisar"><Info size={16} /> ANALISAR COMITÊ</div>;
      case 'NÃO RECOMENDADO':
        return <div className="rec-badge rec-nao"><XCircle size={16} /> NÃO RECOMENDADO (NO-GO)</div>;
      default:
        return null;
    }
  };

  return (
    <div className="edital-modal-backdrop" onClick={onClose}>
      <div className="edital-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* CABEÇALHO DO MÓDULO INTELIGENTE */}
        <header className="edital-modal-header">
          <div className="em-header-left">
            <div className="em-badge-ai">
              <Sparkles size={14} className="sparkle-icon" />
              <span>MÓDULO DE ANÁLISE INTELIGENTE DE EDITAL • FASE 8</span>
            </div>
            <div className="em-title-row">
              <h2 className="em-title">
                {opp.number} — {opp.title}
              </h2>
            </div>
            <div className="em-meta-bar">
              <span className="em-meta-tag"><Building2 size={13} /> {opp.client}</span>
              <span className="em-meta-tag"><MapPin size={13} /> {opp.location}</span>
              <span className="em-meta-tag">Portal: <strong>{opp.portal}</strong></span>
              <span className="em-meta-tag">Prazo: <strong>{opp.daysLeft} dias</strong> ({opp.endDate})</span>
              <span className="em-meta-tag em-empresa-rec">Empresa: <strong>{opp.recommendedCompany}</strong></span>
            </div>
          </div>

          <div className="em-header-right">
            {analysis && (
              <div className="em-header-score-card">
                <div className="em-score-val">{analysis.capacityScore}%</div>
                <div className="em-score-info">
                  <span className="em-score-lbl">Capacidade de Participação</span>
                  <span className="em-score-sub">{analysis.recommendation}</span>
                </div>
              </div>
            )}
            <button className="em-close-btn" onClick={onClose} title="Fechar módulo">
              ✕
            </button>
          </div>
        </header>

        {/* NAVEGAÇÃO ENTRE AS 11 ABAS (ITEM 43 DO ESCOPO) */}
        <nav className="edital-nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'resumo' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumo')}
          >
            <Sparkles size={14} />
            <span>1. Resumo Executivo</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'habilitacao' ? 'active' : ''}`}
            onClick={() => setActiveTab('habilitacao')}
          >
            <ShieldCheck size={14} />
            <span>2. Habilitação</span>
            {analysis && (
              <span className="tab-pill-count">{analysis.requirements?.length || 0}</span>
            )}
          </button>

          <button 
            className={`tab-btn ${activeTab === 'tecnico' ? 'active' : ''}`}
            onClick={() => setActiveTab('tecnico')}
          >
            <Layers size={14} />
            <span>3. Requisitos Técnicos</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'atestados' ? 'active' : ''}`}
            onClick={() => setActiveTab('atestados')}
          >
            <FileText size={14} />
            <span>4. Atestados</span>
            <span className="tab-pill-score">{analysis?.breakdownScores?.atestados || 0}%</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'equipe' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipe')}
          >
            <Users size={14} />
            <span>5. Equipe Mínima</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'equipamentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('equipamentos')}
          >
            <Wrench size={14} />
            <span>6. Equipamentos</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'prazos' ? 'active' : ''}`}
            onClick={() => setActiveTab('prazos')}
          >
            <Calendar size={14} />
            <span>7. Prazos & Visita</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'comercial' ? 'active' : ''}`}
            onClick={() => setActiveTab('comercial')}
          >
            <DollarSign size={14} />
            <span>8. Condições Comerciais</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'riscos' ? 'active' : ''}`}
            onClick={() => setActiveTab('riscos')}
          >
            <ShieldAlert size={14} />
            <span>9. Riscos & Pendências</span>
            {analysis && (
              <span className="tab-pill-alert">{analysis.pendingItems?.length || 0}</span>
            )}
          </button>

          <button 
            className={`tab-btn ${activeTab === 'documentos' ? 'active' : ''}`}
            onClick={() => setActiveTab('documentos')}
          >
            <FolderOpen size={14} />
            <span>10. Documentos ({analysis?.documents?.length || 0})</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'historico' ? 'active' : ''}`}
            onClick={() => setActiveTab('historico')}
          >
            <History size={14} />
            <span>11. Histórico & Auditoria</span>
          </button>
        </nav>

        {/* CORPO DO MODAL */}
        <div className="edital-modal-body">
          {isLoading ? (
            <div className="edital-loading-state">
              <div className="loading-spinner-orbital" />
              <h3>Processando Documentos do Edital</h3>
              <p className="loading-step-text">{loadingStep}</p>
              <div className="loading-progress-bar">
                <div className="loading-progress-fill" />
              </div>
              <span className="loading-note">
                Pipeline: Extração de texto → Estruturação → Requisitos → Cruzamento de Atestados → Auditoria
              </span>
            </div>
          ) : !analysis ? (
            <div className="edital-error-state">
              <AlertTriangle size={32} />
              <p>Não foi possível carregar a análise deste edital.</p>
              <button className="btn-retry" onClick={reloadAnalysis}>Tentar Novamente</button>
            </div>
          ) : (
            <>
              {/* ABA 1: RESUMO EXECUTIVO */}
              {activeTab === 'resumo' && (
                <div className="tab-pane-resumo">
                  {/* Topo do Resumo Executivo (Item 6) */}
                  <div className="exec-summary-hero">
                    <div className="esh-top">
                      <div className="esh-recommendation-box">
                        <span className="esh-label">RECOMENDAÇÃO AUTOMÁTICA DO AGENTE</span>
                        {getRecommendationBadge(analysis.recommendation)}
                        <p className="esh-justificativa">
                          <strong>Justificativa:</strong> {analysis.recommendationJustification}
                        </p>
                      </div>

                      <div className="esh-metrics-grid">
                        <div className="esh-metric-card">
                          <span className="emc-label">Capacidade de Participação</span>
                          <span className="emc-value text-teal">{analysis.capacityScore}%</span>
                          <span className="emc-sub">Índice Geral de Habilitação</span>
                        </div>
                        <div className="esh-metric-card">
                          <span className="emc-label">Aderência Técnica</span>
                          <span className="emc-value">{opp.score}%</span>
                          <span className="emc-sub">Motor Semântico Vellia</span>
                        </div>
                        <div className="esh-metric-card">
                          <span className="emc-label">Risco Geral</span>
                          <span className="emc-value">{analysis.risksSummary?.overallRisk || 'Moderado'}</span>
                          <span className="emc-sub">{analysis.risksSummary?.totalRisks} riscos identificados</span>
                        </div>
                        <div className="esh-metric-card">
                          <span className="emc-label">Valor Estimado</span>
                          <span className="emc-value text-emerald">{opp.estimatedValue || 'R$ 1.850.000,00'}</span>
                          <span className="emc-sub">Contratação Pública</span>
                        </div>
                      </div>
                    </div>

                    {/* Resumo do Objeto em Linguagem Clara (Item 7) */}
                    <div className="esh-object-box">
                      <div className="eob-header">
                        <FileText size={16} />
                        <h4>Resumo do Objeto Contratual (Síntese Objetiva)</h4>
                      </div>
                      <p className="eob-text">“{analysis.executiveSummary?.objetoClaro}”</p>
                      <div className="eob-meta">
                        <span><strong>Contratante:</strong> {opp.client}</span>
                        <span>•</span>
                        <span><strong>Modalidade:</strong> {opp.modality || 'Pregão Eletrônico / Licitação Petronect'}</span>
                        <span>•</span>
                        <span><strong>Local de Execução:</strong> {opp.location}</span>
                        <span>•</span>
                        <span><strong>Prazo de Execução:</strong> {analysis.commercialConditions?.contractTerm || '12 meses'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barras de Desempenho por Categoria (Item 13) */}
                  <div className="breakdown-scores-section">
                    <h4 className="section-title">
                      <Scale size={16} />
                      Detalhamento dos Scores de Habilitação & Capacidade
                    </h4>
                    <div className="breakdown-grid">
                      {Object.entries(analysis.breakdownScores || {}).map(([catKey, scoreVal]) => (
                        <div key={catKey} className="breakdown-card">
                          <div className="bc-header">
                            <span className="bc-name">{catKey.toUpperCase()}</span>
                            <span className="bc-score">{scoreVal}%</span>
                          </div>
                          <div className="bc-track">
                            <div 
                              className={`bc-fill ${scoreVal >= 90 ? 'fill-green' : scoreVal >= 70 ? 'fill-yellow' : 'fill-red'}`}
                              style={{ width: `${scoreVal}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Destaques Rápidos: Pendências Críticas & Perguntas Automáticas */}
                  <div className="resumo-bottom-split">
                    {/* Pendências Principais (Item 16) */}
                    <div className="resumo-pendencias-card">
                      <div className="rpc-header">
                        <AlertTriangle size={16} className="text-amber" />
                        <h4>Pendências Prioritárias a Resolver ({analysis.pendingItems?.length || 0})</h4>
                      </div>
                      <ul className="pendencias-list">
                        {analysis.pendingItems?.slice(0, 4).map((p, idx) => (
                          <li key={idx} className="pendencia-item">
                            <span className="p-num">{idx + 1}</span>
                            <div className="p-content">
                              <strong>{p.category}:</strong> {p.description}
                              {p.action && <span className="p-action">Ação sugerida: {p.action}</span>}
                            </div>
                          </li>
                        ))}
                      </ul>
                      <button 
                        className="btn-view-all-pending"
                        onClick={() => setActiveTab('riscos')}
                      >
                        Ver todas as pendências e plano de mitigação →
                      </button>
                    </div>

                    {/* Perguntas Automáticas Geradas (Item 36) */}
                    <div className="resumo-perguntas-card">
                      <div className="rpc-header">
                        <Sparkles size={16} className="text-teal" />
                        <h4>Perguntas Automáticas para o Comitê Interno</h4>
                      </div>
                      <div className="perguntas-list">
                        {analysis.suggestedQuestions?.map((q, idx) => (
                          <button 
                            key={idx} 
                            className="pergunta-chip"
                            onClick={() => {
                              handleSendMessage(q);
                              setActiveTab('historico');
                            }}
                          >
                            <HelpCircle size={13} />
                            <span>{q}</span>
                          </button>
                        ))}
                      </div>
                      <span className="perguntas-hint">
                        💡 Clique em qualquer pergunta acima para obter a resposta detalhada no Assistente do Edital.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: HABILITAÇÃO JURÍDICA, FISCAL, TRABALHISTA E ECONÔMICA (ITEM 10) */}
              {activeTab === 'habilitacao' && (
                <div className="tab-pane-habilitacao">
                  <div className="pane-header-actions">
                    <div>
                      <h3>Checklist de Habilitação Documental</h3>
                      <p className="pane-subtitle">
                        Verificação automática contra os dados e certidões cadastrados da empresa <strong>{opp.recommendedCompany}</strong>.
                      </p>
                    </div>
                    <div className="filter-stats-badge">
                      <span>{analysis.requirements?.filter(r => r.status === 'ATENDIDO').length} Atendidos</span>
                      <span>•</span>
                      <span>{analysis.requirements?.filter(r => r.status === 'PARCIALMENTE ATENDIDO').length} Parciais</span>
                      <span>•</span>
                      <span>{analysis.requirements?.filter(r => r.status === 'NÃO ATENDIDO').length} Pendentes</span>
                    </div>
                  </div>

                  {/* Agrupamento por Categoria de Habilitação */}
                  {['Jurídico', 'Fiscal', 'Trabalhista', 'Econômico-financeiro'].map((catName) => {
                    const catReqs = analysis.requirements?.filter(r => r.category === catName) || [];
                    if (catReqs.length === 0) return null;

                    return (
                      <div key={catName} className="req-group-section">
                        <div className="req-group-title">
                          <h4>Habilitação {catName}</h4>
                          <span className="req-count">{catReqs.length} requisitos auditados</span>
                        </div>

                        <div className="req-table-container">
                          <table className="req-table">
                            <thead>
                              <tr>
                                <th>Requisito & Detalhe</th>
                                <th style={{ width: '130px' }}>Obrigatório?</th>
                                <th style={{ width: '150px' }}>Status</th>
                                <th style={{ width: '140px' }}>Confiança</th>
                                <th style={{ width: '120px' }}>Trecho</th>
                                <th style={{ width: '100px' }}>Ações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {catReqs.map((req) => (
                                <tr key={req.id} className={`req-row ${editingReqId === req.id ? 'row-editing' : ''}`}>
                                  <td>
                                    <div className="req-main-cell">
                                      <span className="req-desc">{req.description}</span>
                                      {req.observation && (
                                        <span className="req-obs-badge">
                                          <strong>Obs:</strong> {req.observation}
                                        </span>
                                      )}
                                      {req.reviewedBy && (
                                        <span className="req-audit-badge">
                                          Auditado por: {req.reviewedBy} ({req.reviewedAt})
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  <td>
                                    <span className={`badge-obrig ${req.mandatory ? 'obrig-sim' : 'obrig-nao'}`}>
                                      {req.mandatory ? 'Sim (Eliminatório)' : 'Classificatório'}
                                    </span>
                                  </td>

                                  <td>
                                    {editingReqId === req.id ? (
                                      <select 
                                        className="edit-select-status"
                                        value={editingReqForm.status}
                                        onChange={(e) => setEditingReqForm({ ...editingReqForm, status: e.target.value })}
                                      >
                                        <option value="ATENDIDO">ATENDIDO</option>
                                        <option value="PARCIALMENTE ATENDIDO">PARCIALMENTE</option>
                                        <option value="NÃO ATENDIDO">NÃO ATENDIDO</option>
                                        <option value="NÃO IDENTIFICADO">NÃO IDENTIFICADO</option>
                                        <option value="NÃO SE APLICA">NÃO SE APLICA</option>
                                      </select>
                                    ) : (
                                      getStatusBadge(req.status)
                                    )}
                                  </td>

                                  <td>
                                    {getConfidenceBadge(req.confidence)}
                                  </td>

                                  <td>
                                    <button 
                                      className="btn-open-quote"
                                      onClick={() => setQuoteModalData(req)}
                                      title="Ver trecho original no documento auditado"
                                    >
                                      <Eye size={12} />
                                      <span>Ver no edital</span>
                                    </button>
                                  </td>

                                  <td>
                                    {editingReqId === req.id ? (
                                      <button 
                                        className="btn-save-inline"
                                        onClick={() => handleSaveEditReq(req.id)}
                                        title="Salvar revisão humana"
                                      >
                                        <Save size={13} />
                                        <span>Salvar</span>
                                      </button>
                                    ) : (
                                      <button 
                                        className="btn-edit-inline"
                                        onClick={() => handleStartEditReq(req)}
                                        title="Revisar manualmente este item"
                                      >
                                        <Edit3 size={13} />
                                        <span>Revisar</span>
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ABA 3: REQUISITOS TÉCNICOS & OBRIGAÇÕES (ITENS 9 E 17) */}
              {activeTab === 'tecnico' && (
                <div className="tab-pane-tecnico">
                  <div className="tecnico-split-container">
                    
                    {/* Bloco de Requisitos Técnicos */}
                    <div className="tecnico-block">
                      <div className="block-header">
                        <Layers size={16} />
                        <h4>Requisitos de Qualificação Técnica & Responsabilidade (CREA/ART)</h4>
                      </div>

                      <div className="tech-reqs-list">
                        {analysis.requirements
                          ?.filter(r => ['Técnico', 'Operacional', 'Responsabilidade técnica', 'Certificações'].includes(r.category))
                          .map((r) => (
                            <div key={r.id} className="tech-req-card">
                              <div className="trc-header">
                                <span className="trc-cat-pill">{r.category}</span>
                                {getStatusBadge(r.status)}
                                {getConfidenceBadge(r.confidence)}
                              </div>
                              <p className="trc-desc">{r.description}</p>
                              <div className="trc-footer">
                                <span className="trc-doc-ref">
                                  Doc: <strong>{r.documentName}</strong> ({r.section || `Pág. ${r.page}`})
                                </span>
                                <button 
                                  className="btn-open-quote"
                                  onClick={() => setQuoteModalData(r)}
                                >
                                  <Eye size={12} />
                                  <span>Ver no edital</span>
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Bloco de Obrigações da Contratada (Item 17) */}
                    <div className="obrigacoes-block">
                      <div className="block-header">
                        <ShieldCheck size={16} />
                        <h4>Obrigações Críticas da Contratada Extraídas</h4>
                      </div>

                      <div className="obrigacoes-grid">
                        {analysis.obligations?.map((ob, idx) => (
                          <div key={idx} className="obrigacao-card">
                            <div className="ob-topic-row">
                              <span className="ob-topic">{ob.topic}</span>
                              <span className={`ob-impact impact-${ob.impact?.toLowerCase()}`}>
                                Impacto {ob.impact}
                              </span>
                            </div>
                            <p className="ob-desc">{ob.description}</p>
                            <span className="ob-ref">Fonte: {ob.section}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 4: ATESTADOS DE CAPACIDADE TÉCNICA (ITENS 20, 21, 22 E 23) */}
              {activeTab === 'atestados' && (
                <div className="tab-pane-atestados">
                  <div className="pane-header-actions">
                    <div>
                      <h3>Atestados de Capacidade Técnica Exigidos</h3>
                      <p className="pane-subtitle">
                        Cruzamento automático entre a exigência do edital e o acervo técnico cadastrado da empresa <strong>{opp.recommendedCompany}</strong>.
                      </p>
                    </div>
                    <div className="atestado-general-score">
                      <span>Score de Acervo:</span>
                      <strong>{analysis.breakdownScores?.atestados}%</strong>
                    </div>
                  </div>

                  {/* Detalhes de Cada Exigência de Atestado */}
                  {analysis.attestationRequirements?.map((attReq, idx) => (
                    <div key={idx} className="att-requirement-block">
                      <div className="att-req-header">
                        <div className="arh-left">
                          <span className="att-badge-num">Exigência #{idx + 1}</span>
                          <h4>{attReq.title}</h4>
                        </div>
                        <div className="arh-right">
                          <span className="badge-obrig obrig-sim">Obrigatório / Eliminatório</span>
                          <button 
                            className="btn-open-quote"
                            onClick={() => setQuoteModalData({
                              description: attReq.title,
                              originalQuote: attReq.extractedRequirement,
                              documentName: attReq.documentName || 'Termo de Referência',
                              page: attReq.page || 8,
                              section: attReq.section || 'Qualificação Técnica'
                            })}
                          >
                            <Eye size={12} />
                            <span>Ver no edital</span>
                          </button>
                        </div>
                      </div>

                      <div className="att-original-box">
                        <span className="aob-label">Trecho extraído do Edital:</span>
                        <p className="aob-text">“{attReq.extractedRequirement}”</p>
                        <div className="aob-criteria">
                          <span><strong>Mínimo:</strong> {attReq.minExperienceMonths} meses</span>
                          <span>•</span>
                          <span><strong>Escopo:</strong> {attReq.scope}</span>
                        </div>
                      </div>

                      {/* Tabela de Comparação com Banco de Atestados da Empresa (Item 21 e 22) */}
                      <div className="att-comparison-container">
                        <h5 className="acc-title">Atestados Localizados no Banco da Empresa:</h5>
                        <div className="att-matches-grid">
                          {attReq.matchedCertificates?.map((cert, cIdx) => (
                            <div key={cIdx} className={`att-match-card score-tier-${cert.score >= 90 ? 'high' : cert.score >= 70 ? 'med' : 'low'}`}>
                              <div className="amc-top">
                                <div className="amc-client-box">
                                  <strong>{cert.client}</strong>
                                  <span className="amc-cert-num">{cert.certificateNumber}</span>
                                </div>
                                <div className="amc-score-badge">
                                  <span className="amc-score-val">{cert.score}%</span>
                                  <span className="amc-score-lbl">Compatibilidade</span>
                                </div>
                              </div>

                              <p className="amc-service"><strong>Serviço Comprovado:</strong> {cert.serviceDescription}</p>
                              <div className="amc-meta-row">
                                <span>Período: {cert.period} ({cert.durationMonths} meses)</span>
                                <span>•</span>
                                <span>ART vinculada: {cert.artNumber}</span>
                              </div>

                              {/* Explicação da Compatibilidade (Item 23) */}
                              <div className="amc-explanation-box">
                                <span className="aeb-label">Por que {cert.score}%?</span>
                                <p className="aeb-text">{cert.compatibilityExplanation}</p>
                                {cert.pendingDetails && (
                                  <div className="aeb-pending">
                                    <AlertTriangle size={12} />
                                    <span><strong>Pendência a validar:</strong> {cert.pendingDetails}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ABA 5: EQUIPE MÍNIMA (ITEM 18) */}
              {activeTab === 'equipe' && (
                <div className="tab-pane-equipe">
                  <div className="pane-header-actions">
                    <div>
                      <h3>Equipe Mínima Exigida no Edital</h3>
                      <p className="pane-subtitle">
                        Relação de profissionais, qualificações, registros profissionais exigidos e status interno da empresa.
                      </p>
                    </div>
                  </div>

                  <div className="team-table-wrap">
                    <table className="team-table">
                      <thead>
                        <tr>
                          <th>Função / Especialidade</th>
                          <th style={{ width: '80px' }}>Qtd.</th>
                          <th>Qualificação Exigida</th>
                          <th>Experiência Mín.</th>
                          <th style={{ width: '120px' }}>Registro</th>
                          <th style={{ width: '110px' }}>Obrigatório</th>
                          <th style={{ width: '130px' }}>Status Interno</th>
                          <th style={{ width: '140px' }}>Profissional Alocado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.teamRequirements?.map((tm, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{tm.role}</strong>
                            </td>
                            <td>{tm.quantity}</td>
                            <td>{tm.qualification}</td>
                            <td>{tm.minExperience}</td>
                            <td>
                              <span className="badge-reg">{tm.professionalRegistration}</span>
                            </td>
                            <td>
                              <span className={`badge-obrig ${tm.mandatory ? 'obrig-sim' : 'obrig-nao'}`}>
                                {tm.mandatory ? 'Sim' : 'Desejável'}
                              </span>
                            </td>
                            <td>
                              {getStatusBadge(tm.status)}
                            </td>
                            <td>
                              <span className="allocated-prof-name">
                                {tm.allocatedProfessional || 'A definir / Vaga aberta'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="team-info-banner">
                    <Info size={16} />
                    <span>
                      Todos os profissionais com registro no CREA/CRQ exigidos pelo edital devem ter Anotação de Responsabilidade Técnica (ART) emitida e vinculada antes do início da mobilização em campo.
                    </span>
                  </div>
                </div>
              )}

              {/* ABA 6: EQUIPAMENTOS ESPECÍFICOS (ITEM 19) */}
              {activeTab === 'equipamentos' && (
                <div className="tab-pane-equipamentos">
                  <div className="pane-header-actions">
                    <div>
                      <h3>Equipamentos & Instrumentação Específica</h3>
                      <p className="pane-subtitle">
                        Relação de instrumentos exigidos, normas aplicáveis, certificações de calibração e disponibilidade interna.
                      </p>
                    </div>
                  </div>

                  <div className="equip-table-wrap">
                    <table className="equip-table">
                      <thead>
                        <tr>
                          <th>Equipamento</th>
                          <th>Especificação / Norma</th>
                          <th style={{ width: '70px' }}>Qtd.</th>
                          <th style={{ width: '120px' }}>Certificação</th>
                          <th style={{ width: '130px' }}>Calibração</th>
                          <th style={{ width: '130px' }}>Status Interno</th>
                          <th>Observações & Validade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.equipmentRequirements?.map((eq, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{eq.name}</strong>
                            </td>
                            <td>{eq.specification}</td>
                            <td>{eq.quantity}</td>
                            <td>
                              <span className="badge-cert">{eq.certificationRequired ? 'Exigida' : 'Não se aplica'}</span>
                            </td>
                            <td>
                              <span className={`badge-calib ${eq.calibrationMandatory ? 'calib-obrig' : 'calib-disp'}`}>
                                {eq.calibrationMandatory ? 'RBC Obrigatória' : 'Padrão'}
                              </span>
                            </td>
                            <td>
                              {getStatusBadge(eq.status)}
                            </td>
                            <td>
                              <span className="equip-notes">{eq.notes || 'Equipamento disponível em bancada'}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ABA 7: PRAZOS, TIMELINE & VISITA TÉCNICA (ITENS 29, 30 E 31) */}
              {activeTab === 'prazos' && (
                <div className="tab-pane-prazos">
                  
                  {/* Destaque para Visita Técnica (Item 29) */}
                  <div className={`visita-tecnica-hero ${analysis.technicalVisit?.required ? 'visita-obrigatoria' : 'visita-facultativa'}`}>
                    <div className="vth-left">
                      <div className="vth-badge">
                        <Calendar size={14} />
                        <span>VISITA TÉCNICA: {analysis.technicalVisit?.required ? 'OBRIGATÓRIA (CRÍTICO)' : 'FACULTATIVA / DECLARAÇÃO'}</span>
                      </div>
                      <h3>{analysis.technicalVisit?.required ? 'Atenção: Atestado de Visita Obrigatório para Habilitação' : 'Visita Facultativa com Declaração de Pleno Conhecimento'}</h3>
                      <p className="vth-desc">
                        {analysis.technicalVisit?.notes || 'Conforme item do edital, a não realização da visita técnica ou não apresentação da declaração de conhecimento ensejará a inabilitação sumária da proponente.'}
                      </p>
                      
                      <div className="vth-meta-grid">
                        <div className="vth-meta-item">
                          <span className="vth-lbl">Data Limite da Visita:</span>
                          <span className="vth-val">{analysis.technicalVisit?.deadline || 'Até 2 dias antes da sessão'}</span>
                        </div>
                        <div className="vth-meta-item">
                          <span className="vth-lbl">Local do Agendamento:</span>
                          <span className="vth-val">{analysis.technicalVisit?.location || opp.location}</span>
                        </div>
                        <div className="vth-meta-item">
                          <span className="vth-lbl">Contato / E-mail:</span>
                          <span className="vth-val">{analysis.technicalVisit?.contact || 'licitacao@petrobras.com.br'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="vth-right">
                      {analysis.technicalVisit?.required && (
                        <div className="vth-alert-box">
                          <Flame size={20} className="text-critical" />
                          <strong>Alerta Automático Gerado</strong>
                          <span>Agendamento prioritário solicitado ao setor de operações.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline das Datas Importantes do Edital (Item 30) */}
                  <div className="timeline-section">
                    <h4 className="section-title">
                      <Clock size={16} />
                      Linha do Tempo Crítica do Certame
                    </h4>

                    <div className="timeline-track">
                      {analysis.timeline?.map((step, idx) => (
                        <div key={idx} className={`timeline-step ${step.isCritical ? 'step-critical' : ''}`}>
                          <div className="step-dot" />
                          <div className="step-card">
                            <span className="step-date">{step.date}</span>
                            <h5 className="step-name">{step.milestone}</h5>
                            <p className="step-desc">{step.description}</p>
                            {step.alertDays && (
                              <span className="step-alert-pill">
                                Prazo: {step.alertDays} dias
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 8: CONDIÇÕES COMERCIAIS & FINANCEIRAS (ITENS 32, 33 E 35) */}
              {activeTab === 'comercial' && (
                <div className="tab-pane-comercial">
                  <div className="comercial-cards-grid">
                    
                    {/* Critério de Julgamento (Item 33) */}
                    <div className="com-card">
                      <div className="cc-header">
                        <Scale size={16} />
                        <h4>Critério de Julgamento</h4>
                      </div>
                      <div className="cc-body">
                        <span className="cc-big-text">{analysis.commercialConditions?.evaluationCriterion || 'Menor Preço Global'}</span>
                        <p className="cc-desc">
                          Classificação baseada no menor valor total para o lote integral de serviços, atendidos todos os requisitos técnicos habilitatórios.
                        </p>
                      </div>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="com-card">
                      <div className="cc-header">
                        <DollarSign size={16} />
                        <h4>Condições de Pagamento</h4>
                      </div>
                      <div className="cc-body">
                        <span className="cc-big-text">{analysis.commercialConditions?.paymentTerms || '30 dias fora a quinzena'}</span>
                        <p className="cc-desc">
                          Pagamento mediante medição mensal aprovada pela fiscalização, com apresentação de NF-e e quitações do FGTS e CNDT.
                        </p>
                      </div>
                    </div>

                    {/* Garantias & Retenções (Item 32) */}
                    <div className="com-card">
                      <div className="cc-header">
                        <ShieldAlert size={16} />
                        <h4>Garantias Contratuais</h4>
                      </div>
                      <div className="cc-body">
                        <span className="cc-big-text">{analysis.commercialConditions?.contractGuarantee || '5% do valor do contrato'}</span>
                        <p className="cc-desc">
                          Caução, Seguro-Garantia ou Fiança Bancária exigida em até 10 dias úteis após a assinatura do contrato.
                        </p>
                      </div>
                    </div>

                    {/* Reajuste e Multas */}
                    <div className="com-card">
                      <div className="cc-header">
                        <AlertTriangle size={16} />
                        <h4>Penalidades & Reajuste</h4>
                      </div>
                      <div className="cc-body">
                        <span className="cc-big-text">Multa de até 10%</span>
                        <p className="cc-desc">
                          Reajuste após 12 meses pelo índice IPCA/IBGE. Multa diária de 0,33% por atraso injustificado nas campanhas.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Análise Financeira Preliminar (Item 35) */}
                  <div className="preliminary-finance-box">
                    <div className="pfb-header">
                      <DollarSign size={16} />
                      <h4>Análise Financeira Preliminar do Edital</h4>
                    </div>
                    <div className="pfb-grid">
                      <div className="pfb-item">
                        <span className="pfb-lbl">Valor Estimado Máximo:</span>
                        <span className="pfb-val">{opp.estimatedValue || 'R$ 1.850.000,00'}</span>
                      </div>
                      <div className="pfb-item">
                        <span className="pfb-lbl">Prazo Contratual:</span>
                        <span className="pfb-val">{analysis.commercialConditions?.contractTerm || '12 meses'}</span>
                      </div>
                      <div className="pfb-item">
                        <span className="pfb-lbl">Garantia Obrigatória:</span>
                        <span className="pfb-val">5% (~ R$ 92.500,00)</span>
                      </div>
                      <div className="pfb-item">
                        <span className="pfb-lbl">Retenções Técnicas:</span>
                        <span className="pfb-val">ISS no tomador + INSS 11%</span>
                      </div>
                      <div className="pfb-item">
                        <span className="pfb-lbl">Custos de Mobilização:</span>
                        <span className="pfb-val">ARTs + Exames ASO + Crachás</span>
                      </div>
                    </div>
                    <span className="pfb-note">
                      * Estrutura preparada para futuro cálculo de margem e BDI nas próximas fases.
                    </span>
                  </div>
                </div>
              )}

              {/* ABA 9: RISCOS & PENDÊNCIAS (ITENS 16, 27 E 28) */}
              {activeTab === 'riscos' && (
                <div className="tab-pane-riscos">
                  <div className="riscos-split-container">
                    
                    {/* Lista de Riscos Identificados e Classificados */}
                    <div className="riscos-left">
                      <div className="rl-header">
                        <ShieldAlert size={16} />
                        <h4>Matriz de Riscos do Edital ({analysis.risks?.length || 0})</h4>
                      </div>

                      <div className="risks-list">
                        {analysis.risks?.map((rk, idx) => (
                          <div key={idx} className={`risk-card-item risk-border-${rk.severity?.toLowerCase()}`}>
                            <div className="rci-top">
                              <span className="rci-cat">{rk.category}</span>
                              {getRiskSeverityBadge(rk.severity)}
                            </div>
                            <h5 className="rci-title">{rk.title}</h5>
                            <p className="rci-desc">{rk.description}</p>
                            <div className="rci-mitigation">
                              <strong>Sugestão de Mitigação:</strong> {rk.mitigation}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checklist Detalhado de Pendências Internas (Item 16) */}
                    <div className="riscos-right">
                      <div className="rl-header">
                        <CheckCircle2 size={16} />
                        <h4>Plano de Ação para Pendências ({analysis.pendingItems?.length || 0})</h4>
                      </div>

                      <div className="pending-actions-list">
                        {analysis.pendingItems?.map((pend, idx) => (
                          <div key={idx} className="pending-action-card">
                            <div className="pac-header">
                              <span className="pac-idx">Item {idx + 1}</span>
                              <span className="pac-cat">{pend.category}</span>
                            </div>
                            <p className="pac-desc">{pend.description}</p>
                            <div className="pac-action-box">
                              <span className="pac-act-lbl">Ação Requerida:</span>
                              <p className="pac-act-text">{pend.action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 10: DOCUMENTOS SEPARADOS & UPLOAD (ITENS 2, 3 E 41) */}
              {activeTab === 'documentos' && (
                <div className="tab-pane-documentos">
                  <div className="pane-header-actions">
                    <div>
                      <h3>Documentos Associados à Oportunidade</h3>
                      <p className="pane-subtitle">
                        Cada arquivo é indexado separadamente com hash criptográfico, tamanho, versão e classificação técnica.
                      </p>
                    </div>
                    <button 
                      className="btn-add-doc"
                      onClick={() => setShowUploadForm(!showUploadForm)}
                    >
                      <Plus size={14} />
                      <span>Adicionar Documento / Errata</span>
                    </button>
                  </div>

                  {/* Formulário de Novo Documento */}
                  {showUploadForm && (
                    <form className="doc-upload-inline-form" onSubmit={handleUploadSubmit}>
                      <h4>Associar Novo Arquivo ou URL de Edital</h4>
                      <div className="form-grid">
                        <div className="fg-field">
                          <label>Nome do Arquivo / Título:</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Errata_01_Cronograma.pdf"
                            value={uploadFormData.name}
                            onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="fg-field">
                          <label>Classificação:</label>
                          <select 
                            value={uploadFormData.type}
                            onChange={(e) => setUploadFormData({ ...uploadFormData, type: e.target.value })}
                          >
                            {Object.values(DocumentTypes).map((dt) => (
                              <option key={dt} value={dt}>{dt}</option>
                            ))}
                          </select>
                        </div>
                        <div className="fg-field">
                          <label>URL (Opcional se for link):</label>
                          <input 
                            type="url" 
                            placeholder="https://..."
                            value={uploadFormData.url}
                            onChange={(e) => setUploadFormData({ ...uploadFormData, url: e.target.value })}
                          />
                        </div>
                        <div className="fg-field">
                          <label>Tamanho do Arquivo:</label>
                          <input 
                            type="text" 
                            value={uploadFormData.fileSize}
                            onChange={(e) => setUploadFormData({ ...uploadFormData, fileSize: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="form-actions-row">
                        <button type="button" className="btn-cancel" onClick={() => setShowUploadForm(false)}>
                          Cancelar
                        </button>
                        <button type="submit" className="btn-confirm-upload">
                          <Upload size={14} />
                          <span>Indexar e Processar</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Lista de Documentos Separados */}
                  <div className="docs-table-wrap">
                    <table className="docs-table">
                      <thead>
                        <tr>
                          <th>Nome do Documento</th>
                          <th>Classificação</th>
                          <th style={{ width: '100px' }}>Versão</th>
                          <th style={{ width: '100px' }}>Tamanho</th>
                          <th style={{ width: '80px' }}>Páginas</th>
                          <th>Hash SHA-256</th>
                          <th style={{ width: '130px' }}>Data Indexação</th>
                          <th style={{ width: '110px' }}>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.documents?.map((doc) => (
                          <tr key={doc.id}>
                            <td>
                              <div className="doc-name-cell">
                                <FileText size={16} className="text-teal" />
                                <div>
                                  <strong>{doc.name}</strong>
                                  <span className="doc-origin-sub">Origem: {doc.source}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="doc-type-badge">{doc.type}</span>
                            </td>
                            <td>
                              <span className="doc-version-pill">{doc.version}</span>
                            </td>
                            <td>{doc.size}</td>
                            <td>{doc.pages || 'N/A'}</td>
                            <td>
                              <span className="doc-hash-code" title={doc.hash}>
                                {doc.hash?.substring(0, 12)}...
                              </span>
                            </td>
                            <td>{doc.uploadDate}</td>
                            <td>
                              <button 
                                className="btn-view-doc-content"
                                onClick={() => setQuoteModalData({
                                  description: doc.name,
                                  originalQuote: doc.extractedText?.substring(0, 600) + '...',
                                  documentName: doc.name,
                                  page: 1,
                                  section: 'Visão Geral do Arquivo'
                                })}
                                title="Visualizar conteúdo processado"
                              >
                                <Eye size={12} />
                                <span>Ver</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ABA 11: HISTÓRICO, AUDITORIA & ASSISTENTE DE EDITAL (ITENS 37, 38, 39, 40 E 48) */}
              {activeTab === 'historico' && (
                <div className="tab-pane-historico">
                  <div className="historico-split-container">
                    
                    {/* Assistente Integrado "Pergunte sobre este Edital" (Item 37 e 38) */}
                    <div className="chat-assistant-container">
                      <div className="cac-header">
                        <div className="cac-title-box">
                          <Sparkles size={16} className="text-teal" />
                          <h4>Assistente Especialista do Edital</h4>
                        </div>
                        <span className="cac-grounded-pill">
                          <ShieldCheck size={12} /> Base estrita nos documentos oficiais
                        </span>
                      </div>

                      <div className="cac-messages-stream">
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`chat-bubble-row ${msg.sender === 'user' ? 'bubble-user' : 'bubble-assistant'}`}>
                            <div className="chat-bubble">
                              <p className="bubble-text">{msg.text}</p>
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="bubble-sources">
                                  <span className="bs-lbl">Fontes auditadas:</span>
                                  {msg.sources.map((s, sIdx) => (
                                    <span key={sIdx} className="bs-tag">
                                      {s.doc} ({s.section})
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isTyping && (
                          <div className="chat-bubble-row bubble-assistant">
                            <div className="chat-bubble bubble-typing">
                              <span>Consultando cláusulas do edital e registros da empresa...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sugestões de Perguntas Rápidas */}
                      <div className="quick-questions-strip">
                        <button onClick={() => handleSendMessage('O edital exige CREA?')}>
                          Exige CREA?
                        </button>
                        <button onClick={() => handleSendMessage('Qual é a experiência mínima exigida nos atestados?')}>
                          Experiência mínima?
                        </button>
                        <button onClick={() => handleSendMessage('A visita técnica é obrigatória?')}>
                          Visita obrigatória?
                        </button>
                        <button onClick={() => handleSendMessage('Quais equipamentos são solicitados?')}>
                          Equipamentos?
                        </button>
                      </div>

                      {/* Input do Chat */}
                      <div className="cac-input-bar">
                        <input 
                          type="text" 
                          placeholder="Pergunte qualquer coisa sobre este edital ou habilitação..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                          className="btn-send-chat" 
                          onClick={() => handleSendMessage()}
                          disabled={!chatInput.trim()}
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Auditoria & Detector de Mudanças (Itens 40 e 48) */}
                    <div className="audit-changelog-container">
                      <div className="ac-header">
                        <History size={16} />
                        <h4>Trilha de Auditoria & Alterações</h4>
                      </div>

                      <div className="audit-events-stream">
                        <div className="audit-event-item">
                          <span className="ae-time">Hoje às 13:40</span>
                          <strong>Extração Automática Concluída</strong>
                          <p>Pipeline Vellia v8.1 processou 3 documentos (Edital, Termo de Referência e Anexo Técnico). 18 requisitos identificados.</p>
                        </div>
                        <div className="audit-event-item">
                          <span className="ae-time">Hoje às 13:42</span>
                          <strong>Cruzamento de Acervo Técnico</strong>
                          <p>Localizados 3 atestados compatíveis no banco da Excelência Ambiental. Score de atestados calculado em 96%.</p>
                        </div>
                        <div className="audit-event-item">
                          <span className="ae-time">Hoje às 13:43</span>
                          <strong>Detector de Mudanças Ativo</strong>
                          <p>Nenhuma errata ou retificação de edital identificada até o momento. Versão atual: <strong>v1.0</strong>.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL DE CITAÇÃO AUDITÁVEL (ITENS 25 E 26: VER NO EDITAL) */}
        {quoteModalData && (
          <div className="quote-modal-backdrop" onClick={() => setQuoteModalData(null)}>
            <div className="quote-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="qmc-header">
                <div className="qmc-title-group">
                  <FileText size={16} className="text-teal" />
                  <h4>Citação Original do Documento Oficial</h4>
                </div>
                <button className="qmc-close-btn" onClick={() => setQuoteModalData(null)}>✕</button>
              </div>

              <div className="qmc-body">
                <div className="qmc-meta-row">
                  <span><strong>Documento:</strong> {quoteModalData.documentName || 'Edital'}</span>
                  <span>•</span>
                  <span><strong>Seção:</strong> {quoteModalData.section || 'N/A'}</span>
                  <span>•</span>
                  <span><strong>Página:</strong> {quoteModalData.page || 'N/A'}</span>
                </div>

                <div className="qmc-quote-box">
                  <span className="qqb-label">Texto Transcrito com Fidelidade:</span>
                  <blockquote className="qqb-text">
                    “{quoteModalData.originalQuote || quoteModalData.text || 'Texto transcrito conforme documento oficial indexado.'}”
                  </blockquote>
                </div>

                <div className="qmc-req-summary">
                  <strong>Requisito Relacionado:</strong> {quoteModalData.description}
                </div>
              </div>

              <div className="qmc-footer">
                <button className="btn-close-quote-modal" onClick={() => setQuoteModalData(null)}>
                  Fechar Visualizador
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
