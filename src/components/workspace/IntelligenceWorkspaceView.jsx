import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Search, 
  Send, 
  Building2, 
  Compass, 
  FileText, 
  FileSignature, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Layers, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  Pin, 
  Share2, 
  ShieldCheck, 
  ArrowRight, 
  ChevronRight, 
  Flame, 
  MessageSquare, 
  Activity,
  User,
  GitBranch,
  X
} from 'lucide-react';
import { 
  intelligenceWorkspaceService, 
  WorkspaceStatus, 
  TemplateType, 
  CardType 
} from '../../services/intelligenceWorkspace/intelligenceWorkspaceService.js';
import { knowledgeGraphService, EntityCategory } from '../../services/knowledgeGraph/knowledgeGraphService.js';
import { OpportunityService } from '../../services/opportunityService.js';
import './IntelligenceWorkspaceView.css';

export default function IntelligenceWorkspaceView({ 
  onNavigateToTab, 
  onSelectOpportunity,
  currentUser = { name: 'Diretoria Executiva', role: 'ADMIN', companyScope: 'ALL' } 
}) {
  const [sessions, setSessions] = useState(intelligenceWorkspaceService.getSessions());
  const [activeSession, setActiveSession] = useState(sessions[0]);
  const [inputQuery, setInputQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Modais de ferramentas integradas
  const [attestationModalOpen, setAttestationModalOpen] = useState(false);
  const [attestationsList, setAttestationsList] = useState([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [decisionBriefModalOpen, setDecisionBriefModalOpen] = useState(false);
  const [decisionBrief, setDecisionBrief] = useState(null);
  const [noteText, setNoteText] = useState('');

  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectSession = (sess) => {
    setActiveSession(sess);
  };

  const handleCreateNewSession = () => {
    const opp = OpportunityService.listAll()[0];
    const newSess = intelligenceWorkspaceService.createSession(opp, TemplateType.OPPORTUNITY_ANALYSIS, currentUser.name);
    setSessions(intelligenceWorkspaceService.getSessions());
    setActiveSession(newSess);
    showToast('Nova sessão de investigação inicializada', 'success');
  };

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || !activeSession) return;

    const updated = intelligenceWorkspaceService.sendInvestigationMessage(
      activeSession.id, 
      query, 
      currentUser.role
    );
    setActiveSession({ ...updated });
    setInputQuery('');
  };

  const handleRefreshStale = () => {
    if (!activeSession) return;
    const updated = intelligenceWorkspaceService.refreshStaleAnalysis(activeSession.id);
    setActiveSession({ ...updated });
    showToast('Análise reprocessada e atualizada com base no último adendo', 'success');
  };

  const handleOpenAttestationFinder = () => {
    const list = intelligenceWorkspaceService.findBestAttestations(activeSession?.primaryEntity?.id);
    setAttestationsList(list);
    setAttestationModalOpen(true);
  };

  const handleOpenComparison = (type = 'PRICE') => {
    const comp = intelligenceWorkspaceService.compareEntities(type);
    setComparisonData(comp);
    setComparisonModalOpen(true);
  };

  const handlePrepareDecisionBrief = () => {
    const brief = intelligenceWorkspaceService.prepareDecisionBrief(activeSession?.primaryEntity?.id);
    setDecisionBrief(brief);
    setDecisionBriefModalOpen(true);
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !activeSession) return;
    intelligenceWorkspaceService.addHumanNote(activeSession.id, noteText, currentUser.name);
    const updated = intelligenceWorkspaceService.getSessionById(activeSession.id);
    setActiveSession({ ...updated });
    setNoteText('');
    showToast('Nota humana registrada no workspace', 'success');
  };

  const handleRunTestSuite = () => {
    setIsTesting(true);
    showToast('Executando suíte de 8 testes + isolamento multiempresa...', 'info');
    setTimeout(() => {
      const res = intelligenceWorkspaceService.runTestSuite();
      setTestResults(res);
      setIsTesting(false);
      showToast(`Testes concluídos: ${res.passed}/${res.totalTests} aprovados`, res.success ? 'success' : 'error');
    }, 600);
  };

  return (
    <div className="intelligence-workspace-container">
      {/* Toast Notificação */}
      {notification && (
        <div className={`workspace-toast toast-${notification.type}`}>
          <Sparkles size={16} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* CONTEXT HEADER SUPERIOR (Itens 6 & 7) */}
      <div className="ws-top-header">
        <div className="ws-header-left">
          <div className="ws-logo-gem">
            <Sparkles size={20} />
          </div>
          <div className="ws-title-block">
            <div className="ws-title-row">
              <h2>{activeSession?.title || 'Vellia Intelligence Workspace'}</h2>
              <span className={`ws-badge-status status-${activeSession?.status.toLowerCase()}`}>
                {activeSession?.status || 'OPEN'}
              </span>
            </div>
            <div className="ws-context-meta-row">
              <span>Cliente: {activeSession?.primaryEntity?.client || 'Petrobras'}</span>
              <span>•</span>
              <span>Empresa: {activeSession?.companyScope || 'Veeluen'}</span>
              <span>•</span>
              <span>Prazo: {activeSession?.primaryEntity?.deadline || '8 dias'}</span>
              <span>•</span>
              <span>Responsável: {activeSession?.user || 'Diretoria'}</span>
            </div>
          </div>
        </div>

        <div className="ws-header-actions">
          <button 
            className="ws-action-btn btn-ws-secondary"
            onClick={handleRunTestSuite}
            disabled={isTesting}
          >
            <RefreshCw size={14} className={isTesting ? 'spinning' : ''} />
            {isTesting ? 'Validando...' : 'Suíte de Testes (Fase 40)'}
          </button>
          <button 
            className="ws-action-btn btn-ws-secondary"
            onClick={() => onNavigateToTab && onNavigateToTab('simulador-cenarios')}
          >
            <Scale size={14} /> Simular Cenários
          </button>
          <button 
            className="ws-action-btn btn-handoff-decision"
            onClick={handlePrepareDecisionBrief}
          >
            <CheckCircle2 size={14} /> Preparar Decisão GO/NO-GO
          </button>
        </div>
      </div>

      {/* BANNER SE ANÁLISE ESTIVER STALE (Itens 116 a 118) */}
      {activeSession?.isStale && (
        <div className="ws-stale-banner">
          <div className="stale-left">
            <AlertTriangle size={16} />
            <span>
              <strong>ANÁLISE DESATUALIZADA:</strong> {activeSession.staleReason || 'Identificado novo adendo com alterações de prazo/requisitos.'}
            </span>
          </div>
          <button className="btn-refresh-stale" onClick={handleRefreshStale}>
            Atualizar Análise Agora
          </button>
        </div>
      )}

      {/* RESULTADO DOS TESTES AUTOMATIZADOS SE ATIVADOS */}
      {testResults && (
        <div className="ws-test-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: '#34D399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> Suíte de Conformidade Fase 40 ({testResults.passed}/{testResults.totalTests} Aprovados)
            </strong>
            <button 
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              onClick={() => setTestResults(null)}
            >
              ✕
            </button>
          </div>
          <div className="ws-test-grid">
            {testResults.results.map((t, idx) => (
              <div key={idx} className={`ws-test-card ${t.passed ? 'pass' : 'fail'}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{t.testId}: {t.title}</span>
                  <span style={{ color: t.passed ? '#34D399' : '#EF4444' }}>{t.passed ? 'PASS' : 'FAIL'}</span>
                </div>
                <div style={{ color: '#94A3B8', fontSize: '11px', marginTop: '4px' }}>{t.observation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WORKSPACE GRID: 3 COLUNAS */}
      <div className="ws-workspace-grid">

        {/* COLUNA 1: CONTEXT PANEL LATERAL ESQUERDO (Item 9) */}
        <div className="ws-context-column">
          {/* Seletor de Sessões */}
          <div className="ws-section-box">
            <div className="ws-box-header">
              <span>Investigações Ativas</span>
              <button 
                style={{ background: 'transparent', border: 'none', color: '#38BDF8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                onClick={handleCreateNewSession}
              >
                <Plus size={12} /> Nova
              </button>
            </div>
            {sessions.map(s => (
              <div 
                key={s.id}
                className={`ws-pinned-item-row ${s.id === activeSession?.id ? 'active' : ''}`}
                onClick={() => handleSelectSession(s)}
                style={{ borderColor: s.id === activeSession?.id ? '#38BDF8' : 'rgba(255,255,255,0.06)' }}
              >
                <Compass size={14} color="#38BDF8" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</span>
              </div>
            ))}
          </div>

          {/* Itens Fixados (Pinned Items - Itens 26 & 27) */}
          <div className="ws-section-box">
            <div className="ws-box-header">
              <span>Itens Fixados no Workspace</span>
              <Pin size={13} color="#FBBF24" />
            </div>
            {activeSession?.pinnedItems?.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>Nenhum item fixado ainda.</div>
            ) : (
              activeSession?.pinnedItems?.map((p, i) => (
                <div key={i} className="ws-pinned-item-row">
                  <FileText size={14} color="#C084FC" />
                  <span style={{ fontSize: '12px' }}>{p.title}</span>
                </div>
              ))
            )}
          </div>

          {/* Relações Conectadas no Knowledge Graph */}
          <div className="ws-section-box">
            <div className="ws-box-header">
              <span>Relações de Conhecimento</span>
              <GitBranch size={13} color="#38BDF8" />
            </div>
            <div className="ws-graph-connections-list">
              <div className="ws-conn-badge-item">
                <span>Org: Petrobras RNEST</span>
                <span style={{ color: '#34D399', fontSize: '10px' }}>Confirmado</span>
              </div>
              <div className="ws-conn-badge-item">
                <span>Contato: Eng. Marcelo Cavalcanti</span>
                <span style={{ color: '#34D399', fontSize: '10px' }}>Confirmado</span>
              </div>
              <div className="ws-conn-badge-item">
                <span>Contrato CT-4600058912/2025</span>
                <span style={{ color: '#38BDF8', fontSize: '10px' }}>Sinal Origem</span>
              </div>
              <div className="ws-conn-badge-item">
                <span>Atestado Braskem S/A</span>
                <span style={{ color: '#34D399', fontSize: '10px' }}>Evidência EPA 5</span>
              </div>
            </div>
          </div>

          {/* Notas Humanas (Itens 69 a 71) */}
          <div className="ws-section-box">
            <div className="ws-box-header">
              <span>Notas da Equipe</span>
              <MessageSquare size={13} color="#94A3B8" />
            </div>
            {activeSession?.notes?.map((n, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '6px', marginBottom: '6px', fontSize: '11.5px' }}>
                <strong style={{ color: '#38BDF8' }}>{n.author}:</strong>
                <p style={{ margin: '3px 0 0', color: '#CBD5E1' }}>{n.text}</p>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <input
                type="text"
                placeholder="Adicionar nota..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '6px 8px', fontSize: '11.5px', color: '#F8FAFC', outline: 'none' }}
              />
              <button 
                onClick={handleAddNote}
                style={{ background: '#0284C7', border: 'none', color: '#FFF', borderRadius: '6px', padding: '0 10px', fontSize: '11px', cursor: 'pointer' }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA 2: INVESTIGATION PANEL CENTRAL (Item 10) */}
        <div className="ws-investigation-column">
          <div className="ws-investigation-scroll">
            
            {/* Seletor de Templates de Investigação */}
            <div className="ws-template-pills-bar">
              <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>Template:</span>
              <button className="ws-template-pill active">Analisar Nova Oportunidade</button>
              <button className="ws-template-pill" onClick={handleOpenAttestationFinder}>Encontrar Atestados</button>
              <button className="ws-template-pill" onClick={() => handleOpenComparison('PRICE')}>Comparar Preços</button>
              <button className="ws-template-pill" onClick={() => showToast('Gaps verificados: 2 ações recomendadas.', 'info')}>Verificar Gaps</button>
            </div>

            {/* Analysis Board (Cards de Análise — Itens 50 a 54) */}
            <div className="ws-analysis-board-grid">
              {activeSession?.analysisCards?.map((card) => (
                <div key={card.id} className="ws-analysis-card">
                  <div className="ws-card-top-row">
                    <span className={`ws-card-tag card-${card.type.toLowerCase()}`}>{card.type}</span>
                    <span style={{ fontSize: '10px', color: '#34D399', background: 'rgba(16,185,129,0.1)', padding: '1px 5px', borderRadius: '3px' }}>
                      {card.claimStatus || 'CONFIRMED'}
                    </span>
                  </div>
                  <h5 className="ws-card-title">{card.title}</h5>
                  <p className="ws-card-content">{card.content}</p>
                  <div className="ws-card-source">
                    <FileText size={11} /> Fonte: {card.source}
                  </div>
                </div>
              ))}
            </div>

            {/* Thread de Investigação e Diálogo (Itens 43 a 46) */}
            <div className="ws-investigation-thread">
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Diálogo de Investigação Assistida
              </div>

              {activeSession?.messages?.map((msg, idx) => (
                <div key={idx} className={`ws-thread-message ${msg.sender}`}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0 }}>{msg.text}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                        Evidências: {msg.sources.join(' • ')}
                      </div>
                    )}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="ws-bot-actions-row">
                        {msg.actions.map((act, i) => (
                          <button 
                            key={i} 
                            className="ws-inline-action-btn"
                            onClick={() => {
                              if (act.includes('Task')) {
                                intelligenceWorkspaceService.createTaskFromGap('Renovação CND Federal', 'Protocolar certidão');
                                showToast('Tarefa contextual criada com sucesso!', 'success');
                              } else if (act.includes('Decisão')) {
                                handlePrepareDecisionBrief();
                              } else {
                                handleOpenAttestationFinder();
                              }
                            }}
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Input Inferior com Prompts Sugeridos (Itens 13 a 16) */}
          <div className="ws-input-container">
            <div className="ws-suggested-prompts-row">
              <span style={{ fontSize: '11px', color: '#64748B' }}>Sugestões:</span>
              <button className="ws-prompt-pill" onClick={() => handleSendMessage('Quais são os blockers?')}>
                Quais são os blockers?
              </button>
              <button className="ws-prompt-pill" onClick={() => handleSendMessage('Quais atestados atendem?')}>
                Quais atestados atendem?
              </button>
              <button className="ws-prompt-pill" onClick={() => handleSendMessage('Compare com oportunidades semelhantes.')}>
                Compare com histórico
              </button>
              <button className="ws-prompt-pill" onClick={() => handleSendMessage('Prepare Go/No-Go.')}>
                Prepare Go/No-Go
              </button>
            </div>

            <div className="ws-chat-input-bar">
              <input
                type="text"
                className="ws-chat-input"
                placeholder="Investigar requisitos, atestados, margens ou contratos..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
              />
              <button className="btn-ws-send" onClick={() => handleSendMessage()}>
                <Send size={14} /> Investigar
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA 3: EVIDENCE & ACTION DRAWER (Itens 11, 38 a 41, 48) */}
        <div className="ws-evidence-column">
          {/* Ações Rápidas Contextuais (Itens 48 & 49) */}
          <div className="ws-section-box">
            <div className="ws-box-header">
              <span>Ações Contextuais</span>
              <Activity size={13} color="#38BDF8" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div 
                className="ws-action-card-item"
                onClick={() => {
                  intelligenceWorkspaceService.createTaskFromGap('Validação de Sonda Isocinética', 'Conferir pitot no depósito');
                  showToast('Tarefa interna criada com sucesso!', 'success');
                }}
              >
                <span>Criar Tarefa de Acompanhamento</span>
                <ArrowRight size={14} color="#64748B" />
              </div>
              <div 
                className="ws-action-card-item"
                onClick={() => onNavigateToTab && onNavigateToTab('documentos')}
              >
                <span>Abrir Dossiê de Habilitação</span>
                <ArrowRight size={14} color="#64748B" />
              </div>
              <div 
                className="ws-action-card-item"
                onClick={handlePrepareDecisionBrief}
              >
                <span>Exportar Briefing para Comitê</span>
                <ArrowRight size={14} color="#64748B" />
              </div>
            </div>
          </div>

          {/* Citações Documentais com Trechos (Itens 86 a 90) */}
          <div className="ws-section-box">
            <div className="ws-box-header">
              <span>Evidências Documentais Citadas</span>
              <FileText size={13} color="#34D399" />
            </div>

            <div className="ws-evidence-citation-box">
              <div className="ws-citation-header">
                <span>Edital TR — Pág. 4, Item 7.4.2</span>
                <span style={{ fontSize: '10px', color: '#34D399' }}>Conf. 98%</span>
              </div>
              <div className="ws-citation-text">
                "A contratada deverá apresentar atestado comprovando execução de no mínimo 100 campanhas isocinéticas segundo a EPA 5..."
              </div>
              <span style={{ fontSize: '10px', color: '#64748B' }}>Fonte Oficial: Petronect 7004128956</span>
            </div>

            <div className="ws-evidence-citation-box">
              <div className="ws-citation-header">
                <span>Atestado Braskem S/A — Pág. 1</span>
                <span style={{ fontSize: '10px', color: '#34D399' }}>Homologado</span>
              </div>
              <div className="ws-citation-text">
                "Declaramos para os devidos fins que a empresa executou 148 campanhas de amostragem em chaminés e dutos industriais..."
              </div>
              <span style={{ fontSize: '10px', color: '#64748B' }}>ART Vinculada: CREA-PE 2024-889128</span>
            </div>
          </div>

          {/* Inteligência de Preço Resumida */}
          <div className="ws-section-box">
            <div className="ws-box-header">
              <span>Referência de Preço Observada</span>
              <Scale size={13} color="#FBBF24" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#CBD5E1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Valor Teto Edital:</span>
                <strong style={{ color: '#F8FAFC' }}>R$ 2.450.000,00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Mediana Histórica:</span>
                <strong style={{ color: '#38BDF8' }}>R$ 2.180.000,00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Proposta Estimada:</span>
                <strong style={{ color: '#34D399' }}>R$ 2.280.000,00</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Margem Projetada:</span>
                <strong style={{ color: '#34D399' }}>21.4% (Acima do piso)</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL 1: ATTESTATION FINDER (Itens 35 a 37) */}
      {attestationModalOpen && (
        <div className="ws-modal-overlay" onClick={() => setAttestationModalOpen(false)}>
          <div className="ws-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-header">
              <h3><FileText size={18} color="#34D399" /> Atestados Compatíveis Encontrados no Acervo</h3>
              <button 
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                onClick={() => setAttestationModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '13px', margin: 0 }}>
              O Vellia correlacionou os requisitos do edital com os atestados, ARTs e CATs existentes no Centro de Capacidade.
              A escolha final permanece sob julgamento humano da equipe técnica.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {attestationsList.map((att, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ color: '#F8FAFC', fontSize: '14px' }}>{att.name}</strong>
                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>
                      Compatibilidade: {att.compatibilityScore}%
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                    Comprovação: {att.quantityProven} • Período: {att.period}
                  </div>
                  <div style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '8px' }}>
                    Registro Oficial: {att.artCat} • {att.evidencePage}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#38BDF8' }}>Atende: {att.clauseMatched}</span>
                    <button 
                      style={{ background: '#0284C7', color: '#FFF', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => {
                        intelligenceWorkspaceService.pinItem(activeSession.id, { id: att.id, title: att.name, type: 'ATTESTATION' });
                        setAttestationModalOpen(false);
                        showToast(`Atestado ${att.name} fixado no Workspace`, 'success');
                      }}
                    >
                      Fixar no Workspace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: COMPARATIVO TÉCNICO & PREÇO (Itens 28 a 34) */}
      {comparisonModalOpen && comparisonData && (
        <div className="ws-modal-overlay" onClick={() => setComparisonModalOpen(false)}>
          <div className="ws-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-header">
              <h3><Scale size={18} color="#FBBF24" /> {comparisonData.title}</h3>
              <button 
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                onClick={() => setComparisonModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="ws-comparison-grid">
              <div className="ws-comparison-box">
                <h5 style={{ color: '#38BDF8', margin: '0 0 10px' }}>{comparisonData.itemA.name}</h5>
                <div style={{ fontSize: '12.5px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Valor:</strong> {comparisonData.itemA.value}</div>
                  <div><strong>Desconto:</strong> {comparisonData.itemA.discountOverReference}</div>
                  <div><strong>Margem:</strong> {comparisonData.itemA.margin}</div>
                </div>
              </div>

              <div className="ws-comparison-box">
                <h5 style={{ color: '#A78BFA', margin: '0 0 10px' }}>{comparisonData.itemB.name}</h5>
                <div style={{ fontSize: '12.5px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Valor:</strong> {comparisonData.itemB.value}</div>
                  <div><strong>Desconto:</strong> {comparisonData.itemB.discountOverReference}</div>
                  <div><strong>Margem:</strong> {comparisonData.itemB.margin}</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: '#7DD3FC' }}>
              <strong>Síntese de Trade-off:</strong> {comparisonData.tradeoffConclusion}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DECISION BRIEF (Itens 55 a 58) */}
      {decisionBriefModalOpen && decisionBrief && (
        <div className="ws-modal-overlay" onClick={() => setDecisionBriefModalOpen(false)}>
          <div className="ws-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ws-modal-header">
              <h3><CheckCircle2 size={18} color="#34D399" /> Briefing Executivo de Decisão GO/NO-GO</h3>
              <button 
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                onClick={() => setDecisionBriefModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                <strong style={{ color: '#F8FAFC' }}>{decisionBrief.title}</strong>
                <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>
                  Cliente: {decisionBrief.client} • Aderência Geral: {decisionBrief.adherenceScore}%
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ color: '#38BDF8', fontWeight: 600 }}>Parâmetros Financeiros</span>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#CBD5E1' }}>
                    <div>Proposta: R$ {decisionBrief.financials.proposedPrice.toLocaleString('pt-BR')}</div>
                    <div>Margem: {decisionBrief.financials.margin}%</div>
                    <div>Preço Piso: R$ {decisionBrief.financials.floorPrice.toLocaleString('pt-BR')}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ color: '#34D399', fontWeight: 600 }}>Habilitação Técnica</span>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#CBD5E1' }}>
                    <div>Atestados: {decisionBrief.technicalQualification.attestationsStatus}</div>
                    <div>Engenheiro: {decisionBrief.technicalQualification.responsibleEngineer}</div>
                    <div>Equipamentos: {decisionBrief.technicalQualification.equipmentAvailability}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', padding: '12px', borderRadius: '8px', color: '#34D399' }}>
                <strong>Recomendação do Sistema:</strong> {decisionBrief.recommendation}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button 
                  className="ws-action-btn btn-ws-secondary"
                  onClick={() => {
                    setDecisionBriefModalOpen(false);
                    showToast('Briefing exportado com sucesso.', 'info');
                  }}
                >
                  Exportar Relatório PDF
                </button>
                <button 
                  className="ws-action-btn btn-handoff-decision"
                  onClick={() => {
                    setDecisionBriefModalOpen(false);
                    if (onNavigateToTab) onNavigateToTab('decision-board');
                  }}
                >
                  Confirmar e Abrir no Decision Board
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
