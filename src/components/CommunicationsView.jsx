import React, { useState, useEffect, useMemo } from 'react';
import { communicationService } from '../services/communications/communicationService.js';
import {
  CommunicationChannel,
  CommunicationStatus,
  MessageType,
  ToneStyle,
  MessageLength,
  CallToAction,
  CommunicationOutcome
} from '../services/communications/communicationModels.js';
import { crmService } from '../services/crm/crmService.js';
import {
  Send,
  Inbox,
  FileText,
  Clock,
  History,
  Layers,
  Settings,
  Plus,
  Search,
  Sparkles,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Mail,
  Phone,
  MessageSquare,
  Users,
  ShieldCheck,
  TrendingUp,
  Flame,
  Check,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import './CommunicationsView.css';

export default function CommunicationsView() {
  const [activeTab, setActiveTab] = useState('outbox'); // 'outbox' | 'modelos' | 'followups' | 'historico' | 'campanhas' | 'configuracoes'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannelFilter, setSelectedChannelFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Dados reativos
  const [outbox, setOutbox] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [metrics, setMetrics] = useState({ totalPrepared: 0, totalSent: 0, totalAnswered: 0, responseRatePercent: 0, byChannel: {} });
  const [organizations, setOrganizations] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Modais e Feedback
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [outcomeModalItem, setOutcomeModalItem] = useState(null);
  const [sendModalItem, setSendModalItem] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Estado do Composer Assistido
  const [composerForm, setComposerForm] = useState({
    organizationId: '',
    contactId: '',
    channel: CommunicationChannel.EMAIL,
    type: MessageType.PRIMEIRO_CONTATO,
    tone: ToneStyle.EXECUTIVO,
    length: MessageLength.MEDIO,
    cta: CallToAction.SOLICITAR_REUNIAO,
    service: 'Tratamento de Efluentes e Operação de ETE',
    company: 'Excelência Ambiental',
    responsible: 'Roberto Mendes (Diretor Comercial)',
    subject: '',
    body: '',
    warnings: []
  });

  // Estado do Modal de Envio Manual
  const [sendForm, setSendForm] = useState({
    sentBy: 'Camila Torres',
    notes: 'Enviado diretamente via e-mail institucional',
    createFollowUpDays: '5'
  });

  // Estado do Modal de Outcome
  const [outcomeForm, setOutcomeForm] = useState({
    outcome: CommunicationOutcome.SOLICITOU_REUNIAO,
    outcomeNotes: ''
  });

  const loadData = () => {
    setOutbox(communicationService.getAllOutbox());
    setTemplates(communicationService.getTemplates());
    setFollowUps(communicationService.getIntelligentFollowUps());
    setCampaigns(communicationService.getCampaigns());
    setMetrics(communicationService.getCommunicationMetrics());
    setOrganizations(crmService.getOrganizations());
    setContacts(crmService.getContacts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateWithAI = () => {
    const contact = contacts.find(c => c.id === composerForm.contactId) || { name: 'Gestor(a)', position: 'Responsável' };
    const org = organizations.find(o => o.id === composerForm.organizationId) || { name: 'Organização Alvo' };
    const interactions = crmService.getInteractions(org.id);

    try {
      const generated = communicationService.generateAssistedMessage({
        channel: composerForm.channel,
        type: composerForm.type,
        tone: composerForm.tone,
        length: composerForm.length,
        cta: composerForm.cta,
        contact,
        organization: org,
        service: composerForm.service,
        company: composerForm.company,
        responsible: composerForm.responsible,
        interactions,
        hasRelatedTenderOrSignal: true
      });

      setComposerForm(prev => ({
        ...prev,
        subject: generated.subject,
        body: generated.body,
        warnings: generated.warnings || []
      }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveDraft = (e) => {
    e.preventDefault();
    const org = organizations.find(o => o.id === composerForm.organizationId);
    const contact = contacts.find(c => c.id === composerForm.contactId);

    communicationService.createOutboxItem({
      organizationId: composerForm.organizationId,
      organizationName: org ? org.name : 'Organização',
      contactId: composerForm.contactId,
      contactName: contact ? contact.name : 'Contato',
      channel: composerForm.channel,
      type: composerForm.type,
      subject: composerForm.subject,
      body: composerForm.body,
      status: CommunicationStatus.AGUARDANDO_REVISAO
    });

    setIsComposerOpen(false);
    loadData();
  };

  const handleApprove = (id) => {
    communicationService.approveMessage(id);
    loadData();
    if (previewItem && previewItem.id === id) {
      setPreviewItem(null);
    }
  };

  const handleConfirmSend = (e) => {
    e.preventDefault();
    if (!sendModalItem) return;

    communicationService.markAsSentManually(sendModalItem.id, {
      sentBy: sendForm.sentBy,
      notes: sendForm.notes,
      createFollowUpDays: sendForm.createFollowUpDays
    });

    setSendModalItem(null);
    loadData();
  };

  const handleConfirmOutcome = (e) => {
    e.preventDefault();
    if (!outcomeModalItem) return;

    communicationService.recordOutcome(outcomeModalItem.id, outcomeForm.outcome, outcomeForm.outcomeNotes);
    setOutcomeModalItem(null);
    loadData();
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(id);
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const handleBatchApproveCampaign = (campaignId) => {
    const res = communicationService.batchApproveCampaign(campaignId);
    alert(`Aprovação em lote concluída: ${res.approvedCount} mensagens aprovadas.`);
    loadData();
  };

  // Filtragem da Caixa de Saída
  const filteredOutbox = useMemo(() => {
    return outbox.filter(item => {
      const matchQuery = !searchQuery ||
        item.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchChannel = selectedChannelFilter === 'ALL' || item.channel === selectedChannelFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || item.status === selectedStatusFilter;
      return matchQuery && matchChannel && matchStatus;
    });
  }, [outbox, searchQuery, selectedChannelFilter, selectedStatusFilter]);

  return (
    <div className="comms-container">
      {/* HEADER EXECUTIVO */}
      <header className="comms-header">
        <div className="header-left">
          <div className="module-tag">
            <Sparkles size={16} />
            <span>Automação de Comunicação + Follow-up Assistido</span>
          </div>
          <h1 className="header-title">Comunicações & Follow-up Assistido</h1>
          <p className="header-subtitle">
            Redação assistida com contexto real, guardrails de privacidade e cadência comercial sem disparos automáticos.
            <strong> Princípio: A oportunidade certa, com a abordagem certa, no momento certo.</strong>
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-new-message" onClick={() => setIsComposerOpen(true)}>
            <Plus size={16} />
            <span>Nova Comunicação Assistida</span>
          </button>
        </div>
      </header>

      {/* PAINEL DE KPIS EXECUTIVOS (Item 38 a 42, 68) */}
      <section className="comms-kpi-grid">
        <div className="comms-kpi-card border-blue">
          <div className="kpi-top">
            <span className="kpi-label">Mensagens Preparadas</span>
            <FileText size={18} className="text-blue" />
          </div>
          <div className="kpi-value">{metrics.totalPrepared}</div>
          <div className="kpi-detail">{outbox.filter(m => m.status === CommunicationStatus.AGUARDANDO_REVISAO).length} aguardando aprovação</div>
        </div>

        <div className="comms-kpi-card border-emerald">
          <div className="kpi-top">
            <span className="kpi-label">Mensagens Enviadas</span>
            <Send size={18} className="text-emerald" />
          </div>
          <div className="kpi-value">{metrics.totalSent}</div>
          <div className="kpi-detail">Com confirmação humana e registro</div>
        </div>

        <div className="comms-kpi-card border-cyan">
          <div className="kpi-top">
            <span className="kpi-label">Taxa de Resposta</span>
            <TrendingUp size={18} className="text-cyan" />
          </div>
          <div className="kpi-value">{metrics.responseRatePercent}%</div>
          <div className="kpi-detail">{metrics.totalAnswered} de {metrics.totalSent} contatos responderam</div>
        </div>

        <div className="comms-kpi-card border-indigo">
          <div className="kpi-top">
            <span className="kpi-label">Reuniões Geradas</span>
            <Users size={18} className="text-indigo" />
          </div>
          <div className="kpi-value">{metrics.meetingsGeneratedCount}</div>
          <div className="kpi-detail">Taxa de reunião: {metrics.meetingRatePercent}%</div>
        </div>

        <div className="comms-kpi-card border-rose">
          <div className="kpi-top">
            <span className="kpi-label">Follow-ups Críticos</span>
            <Clock size={18} className="text-rose" />
          </div>
          <div className="kpi-value">{followUps.filter(f => f.urgency === 'Urgente').length}</div>
          <div className="kpi-detail">Prioridade máxima por Score</div>
        </div>
      </section>

      {/* NAVEGAÇÃO DE SUBSEÇÕES (Item 1) */}
      <nav className="comms-nav">
        <button
          className={`comms-tab-btn ${activeTab === 'outbox' ? 'active' : ''}`}
          onClick={() => setActiveTab('outbox')}
        >
          <Inbox size={17} />
          <span>Caixa de Saída ({outbox.length})</span>
        </button>

        <button
          className={`comms-tab-btn ${activeTab === 'modelos' ? 'active' : ''}`}
          onClick={() => setActiveTab('modelos')}
        >
          <FileText size={17} />
          <span>Modelos & Templates ({templates.length})</span>
        </button>

        <button
          className={`comms-tab-btn ${activeTab === 'followups' ? 'active' : ''}`}
          onClick={() => setActiveTab('followups')}
        >
          <Clock size={17} />
          <span>Central de Follow-ups ({followUps.length})</span>
        </button>

        <button
          className={`comms-tab-btn ${activeTab === 'campanhas' ? 'active' : ''}`}
          onClick={() => setActiveTab('campanhas')}
        >
          <Layers size={17} />
          <span>Campanhas Assistidas ({campaigns.length})</span>
        </button>

        <button
          className={`comms-tab-btn ${activeTab === 'historico' ? 'active' : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          <History size={17} />
          <span>Histórico 360</span>
        </button>

        <button
          className={`comms-tab-btn ${activeTab === 'configuracoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracoes')}
        >
          <Settings size={17} />
          <span>Cadências & Regras</span>
        </button>
      </nav>

      {/* BARRA DE FILTROS */}
      {activeTab === 'outbox' && (
        <div className="comms-filter-bar">
          <div className="comms-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Pesquisar por órgão, contato ou assunto..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <label>Canal:</label>
            <select value={selectedChannelFilter} onChange={e => setSelectedChannelFilter(e.target.value)}>
              <option value="ALL">Todos os canais</option>
              <option value={CommunicationChannel.EMAIL}>E-mail</option>
              <option value={CommunicationChannel.WHATSAPP}>WhatsApp</option>
              <option value={CommunicationChannel.LINKEDIN}>LinkedIn</option>
            </select>

            <label>Status:</label>
            <select value={selectedStatusFilter} onChange={e => setSelectedStatusFilter(e.target.value)}>
              <option value="ALL">Todos os status</option>
              <option value={CommunicationStatus.AGUARDANDO_REVISAO}>Aguardando revisão</option>
              <option value={CommunicationStatus.APROVADA}>Aprovada</option>
              <option value={CommunicationStatus.ENVIADA_MANUALMENTE}>Enviada manualmente</option>
              <option value={CommunicationStatus.RESPONDIDA}>Respondida</option>
            </select>
          </div>
        </div>
      )}

      {/* CONTEÚDO DAS SUBSEÇÕES */}
      <main className="comms-main-content">
        {/* SUBSEÇÃO 1: CAIXA DE SAÍDA (OUTBOX) */}
        {activeTab === 'outbox' && (
          <section className="outbox-list">
            {filteredOutbox.map(item => (
              <div key={item.id} className={`outbox-card status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="outbox-header">
                  <div className="outbox-meta">
                    <span className={`channel-badge ch-${item.channel.toLowerCase()}`}>{item.channel}</span>
                    <span className="type-badge">{item.type}</span>
                    <span className={`status-pill st-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>{item.status}</span>
                  </div>

                  <span className="outbox-date">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>

                <h3 className="outbox-subject">{item.subject}</h3>
                <div className="outbox-parties">
                  <strong>{item.organizationName}</strong> • Contato: {item.contactName}
                </div>

                <p className="outbox-snippet">{item.body.substring(0, 160)}...</p>

                {item.outcome && (
                  <div className="outcome-callout">
                    <CheckCircle2 size={15} />
                    <span>Desfecho Comercial: <strong>{item.outcome}</strong> ({item.outcomeNotes})</span>
                  </div>
                )}

                <div className="outbox-card-footer">
                  <div className="footer-left-actions">
                    <button className="btn-action-sm" onClick={() => setPreviewItem(item)}>
                      Ver Preview Completo
                    </button>
                    <button
                      className="btn-action-sm"
                      onClick={() => handleCopyText(item.body, item.id)}
                    >
                      {copyFeedback === item.id ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
                      <span>{copyFeedback === item.id ? 'Copiado!' : 'Copiar Texto'}</span>
                    </button>
                  </div>

                  <div className="footer-right-actions">
                    {item.status === CommunicationStatus.AGUARDANDO_REVISAO && (
                      <button className="btn-approve-sm" onClick={() => handleApprove(item.id)}>
                        <Check size={14} />
                        <span>Aprovar Mensagem</span>
                      </button>
                    )}

                    {(item.status === CommunicationStatus.APROVADA || item.status === CommunicationStatus.AGUARDANDO_REVISAO) && (
                      <button className="btn-send-manual-sm" onClick={() => setSendModalItem(item)}>
                        <Send size={14} />
                        <span>Marcar como Enviada</span>
                      </button>
                    )}

                    {item.status === CommunicationStatus.ENVIADA_MANUALMENTE && !item.outcome && (
                      <button className="btn-record-outcome-sm" onClick={() => setOutcomeModalItem(item)}>
                        <CheckCircle2 size={14} />
                        <span>Registrar Resposta</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* SUBSEÇÃO 2: MODELOS & TEMPLATES (Itens 43 a 46) */}
        {activeTab === 'modelos' && (
          <section className="templates-grid">
            {templates.map(tpl => (
              <div key={tpl.id} className="template-card">
                <div className="tpl-top">
                  <div>
                    <span className={`channel-badge ch-${tpl.channel.toLowerCase()}`}>{tpl.channel}</span>
                    <span className="tpl-company">{tpl.company}</span>
                  </div>
                  <span className="tpl-type">{tpl.type}</span>
                </div>

                <h3 className="tpl-name">{tpl.name}</h3>
                <span className="tpl-service">Serviço: {tpl.service} • Tom: {tpl.tone}</span>

                <div className="tpl-body-box">
                  <pre>{tpl.body}</pre>
                </div>

                <div className="tpl-footer">
                  <button
                    className="btn-use-template"
                    onClick={() => {
                      setComposerForm(prev => ({
                        ...prev,
                        channel: tpl.channel,
                        type: tpl.type,
                        service: tpl.service,
                        company: tpl.company,
                        subject: tpl.subject,
                        body: tpl.body
                      }));
                      setIsComposerOpen(true);
                    }}
                  >
                    Usar este Modelo no Composer
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* SUBSEÇÃO 3: CENTRAL DE FOLLOW-UPS INTELIGENTE (Itens 27 a 30) */}
        {activeTab === 'followups' && (
          <section className="intelligent-followups-list">
            <div className="followup-intro-banner">
              <Clock size={20} className="text-rose" />
              <div>
                <h3>Central de Follow-ups Inteligentes & Priorização por Score (Itens 28 e 29)</h3>
                <p>Tarefas ordenadas por urgência algorítmica considerando clientes estratégicos e proximidade de editais.</p>
              </div>
            </div>

            {followUps.map(f => (
              <div key={f.id} className={`intelligent-followup-card urgency-${f.urgency.toLowerCase().replace(/\s+/g, '-')}`}>
                <div className="followup-top-row">
                  <div className="urgency-badge" style={{ backgroundColor: `${f.urgencyColor}22`, color: f.urgencyColor, borderColor: f.urgencyColor }}>
                    <Flame size={14} />
                    <span>{f.urgency} (Score: {f.score}/100)</span>
                  </div>

                  <span className="due-date">Prazo: {new Date(f.date).toLocaleDateString('pt-BR')} às {f.time}</span>
                </div>

                <h4 className="followup-title">{f.title}</h4>
                <div className="followup-details">
                  <strong>{f.organizationName}</strong> • Contato: {f.contactName} • Resp: {f.responsible}
                </div>

                <p className="followup-explanation">
                  <strong>Justificativa da Prioridade:</strong> {f.scoreExplanation}
                </p>

                <div className="followup-actions-row">
                  <button
                    className="btn-prep-msg"
                    onClick={() => {
                      const org = organizations.find(o => o.name === f.organizationName);
                      setComposerForm(prev => ({
                        ...prev,
                        organizationId: org ? org.id : '',
                        type: MessageType.FOLLOW_UP,
                        subject: `Follow-up: ${f.title}`
                      }));
                      setIsComposerOpen(true);
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Redigir Mensagem de Follow-up</span>
                  </button>

                  <button className="btn-done" onClick={() => {
                    crmService.updateFollowUpStatus(f.id, 'Concluído');
                    loadData();
                  }}>
                    <CheckCircle2 size={14} />
                    <span>Marcar como Concluído</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* SUBSEÇÃO 4: CAMPANHAS ASSISTIDAS (Itens 63 a 67) */}
        {activeTab === 'campanhas' && (
          <section className="campaigns-container">
            <div className="campaign-intro-banner">
              <Layers size={20} className="text-cyan" />
              <div>
                <h3>Campanhas Assistidas Segmentadas (Itens 63 a 67)</h3>
                <p>Abordagens estruturadas sem disparo massivo agressivo. Toda mensagem é personalizável e possui limite diário de envios.</p>
              </div>
            </div>

            <div className="campaigns-grid">
              {campaigns.map(camp => (
                <div key={camp.id} className="campaign-card">
                  <div className="camp-top">
                    <span className="camp-status">{camp.status}</span>
                    <span className="camp-limit">Limite: {camp.dailyLimit} envios/dia</span>
                  </div>

                  <h3 className="camp-title">{camp.name}</h3>
                  <div className="camp-sub">{camp.service} • Região: {camp.targetRegion} • {camp.company}</div>

                  <div className="audience-list">
                    <h4>Público-Alvo Mapeado ({camp.contactsList.length} contatos):</h4>
                    {camp.contactsList.map((c, idx) => (
                      <div key={idx} className="audience-item">
                        <div>
                          <strong>{c.name}</strong> ({c.org})
                          <span className="subtext">{c.messageDraft}</span>
                        </div>
                        <span className={`status-pill st-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="camp-footer">
                    <button className="btn-batch-approve" onClick={() => handleBatchApproveCampaign(camp.id)}>
                      <Check size={15} />
                      <span>Aprovação em Lote da Campanha</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 5: HISTÓRICO 360 */}
        {activeTab === 'historico' && (
          <section className="history-timeline-section">
            <div className="history-timeline">
              {outbox.filter(m => m.sentAt).map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-dot" />
                  <div className="history-content">
                    <div className="history-top">
                      <span className="history-date">{new Date(item.sentAt).toLocaleString('pt-BR')}</span>
                      <span className={`channel-badge ch-${item.channel.toLowerCase()}`}>{item.channel}</span>
                    </div>

                    <h4 className="history-subject">{item.subject}</h4>
                    <div className="history-parties">
                      Destinatário: <strong>{item.contactName}</strong> ({item.organizationName}) • Enviado por: {item.sentBy}
                    </div>

                    <p className="history-body-snippet">{item.body}</p>

                    {item.outcome && (
                      <div className="history-outcome">
                        <CheckCircle2 size={14} className="text-emerald" />
                        <span>Resultado Registrado: <strong>{item.outcome}</strong> — {item.outcomeNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 6: CADÊNCIAS & REGRAS (Itens 20, 22 a 26) */}
        {activeTab === 'configuracoes' && (
          <section className="settings-section">
            <div className="settings-box">
              <h3>Regras de Cadência Comercial Anti-Spam (Itens 20 e 24)</h3>
              <p>Intervalos automáticos recomendados pelo sistema para retorno a contatos não responsivos.</p>

              <div className="cadence-rules-list">
                <div className="cadence-rule-item">
                  <strong>Primeiro Contato Sem Resposta:</strong>
                  <span>Sugerir follow-up após <strong>5 dias úteis</strong>.</span>
                </div>
                <div className="cadence-rule-item">
                  <strong>Portfólio / Catálogo Técnico Enviado:</strong>
                  <span>Sugerir verificação de recebimento após <strong>7 dias úteis</strong>.</span>
                </div>
                <div className="cadence-rule-item">
                  <strong>Reunião Realizada:</strong>
                  <span>Sugerir envio de ata/resumo em até <strong>2 dias úteis</strong>.</span>
                </div>
                <div className="cadence-rule-item">
                  <strong>Limite Máximo de Toques Sem Resposta:</strong>
                  <span>Máximo de <strong>4 tentativas</strong> antes de arquivamento da cadência para reativação semestral.</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL: NOVO COMPOSER ASSISTIDO (Itens 4 a 16) */}
      {isComposerOpen && (
        <div className="modal-backdrop" onClick={() => setIsComposerOpen(false)}>
          <div className="comms-modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Nova Comunicação Assistida</h2>
                <p>Redija ou gere mensagens de alto nível utilizando o histórico real do CRM e do Radar.</p>
              </div>
              <button className="btn-close" onClick={() => setIsComposerOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveDraft} className="composer-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Organização Alvo:</label>
                  <select
                    value={composerForm.organizationId}
                    onChange={e => setComposerForm({ ...composerForm, organizationId: e.target.value })}
                    required
                  >
                    <option value="">Selecione o órgão ou empresa...</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Contato Profissional:</label>
                  <select
                    value={composerForm.contactId}
                    onChange={e => setComposerForm({ ...composerForm, contactId: e.target.value })}
                    required
                  >
                    <option value="">Selecione o contato...</option>
                    {contacts.filter(c => !composerForm.organizationId || c.organizationId === composerForm.organizationId).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.position})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Canal:</label>
                  <select
                    value={composerForm.channel}
                    onChange={e => setComposerForm({ ...composerForm, channel: e.target.value })}
                  >
                    {Object.values(CommunicationChannel).map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo de Mensagem:</label>
                  <select
                    value={composerForm.type}
                    onChange={e => setComposerForm({ ...composerForm, type: e.target.value })}
                  >
                    {Object.values(MessageType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Tom do Texto:</label>
                  <select
                    value={composerForm.tone}
                    onChange={e => setComposerForm({ ...composerForm, tone: e.target.value })}
                  >
                    {Object.values(ToneStyle).map(tn => (
                      <option key={tn} value={tn}>{tn}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ai-generation-box">
                <div className="ai-box-top">
                  <div className="ai-box-title">
                    <Sparkles size={18} className="text-cyan" />
                    <strong>Geração Assistida com IA (Item 5)</strong>
                  </div>
                  <button type="button" className="btn-generate-ai" onClick={handleGenerateWithAI}>
                    <Sparkles size={15} />
                    <span>Gerar Texto com Contexto Real</span>
                  </button>
                </div>
                <p className="ai-box-sub">
                  O motor consulta atestados, cargos, histórico de reuniões e contratos vigentes para redigir o rascunho sem inventar dados.
                </p>
              </div>

              {composerForm.warnings && composerForm.warnings.length > 0 && (
                <div className="guardrail-warning-banner">
                  <ShieldCheck size={18} />
                  <div>
                    {composerForm.warnings.map((w, idx) => (
                      <div key={idx}>{w}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Assunto (Subject):</label>
                <input
                  type="text"
                  placeholder="Assunto da mensagem..."
                  value={composerForm.subject}
                  onChange={e => setComposerForm({ ...composerForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Corpo da Mensagem:</label>
                <textarea
                  rows="8"
                  placeholder="O texto gerado ou redigido aparecerá aqui..."
                  value={composerForm.body}
                  onChange={e => setComposerForm({ ...composerForm, body: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsComposerOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save-outbox">Salvar na Caixa de Saída para Revisão</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW COMPLETO (Item 16) */}
      {previewItem && (
        <div className="modal-backdrop" onClick={() => setPreviewItem(null)}>
          <div className="comms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Preview da Comunicação</h2>
              <button className="btn-close" onClick={() => setPreviewItem(null)}>✕</button>
            </div>

            <div className="preview-body">
              <div className="preview-meta">
                <div><strong>Canal:</strong> {previewItem.channel}</div>
                <div><strong>Destinatário:</strong> {previewItem.contactName} ({previewItem.organizationName})</div>
                <div><strong>Assunto:</strong> {previewItem.subject}</div>
              </div>

              <div className="preview-text-box">
                <pre>{previewItem.body}</pre>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setPreviewItem(null)}>Fechar</button>
              <button
                className="btn-copy-preview"
                onClick={() => handleCopyText(previewItem.body, previewItem.id)}
              >
                <Copy size={15} />
                <span>Copiar Texto</span>
              </button>
              {previewItem.status === CommunicationStatus.AGUARDANDO_REVISAO && (
                <button className="btn-approve" onClick={() => handleApprove(previewItem.id)}>
                  <Check size={15} />
                  <span>Aprovar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MARCAR COMO ENVIADA (Item 18 e 19) */}
      {sendModalItem && (
        <div className="modal-backdrop" onClick={() => setSendModalItem(null)}>
          <div className="comms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Envio Manual</h2>
              <button className="btn-close" onClick={() => setSendModalItem(null)}>✕</button>
            </div>

            <form onSubmit={handleConfirmSend} className="composer-form">
              <p className="send-notice">
                Confirme que a mensagem para <strong>{sendModalItem.contactName}</strong> foi enviada através do seu cliente de {sendModalItem.channel}.
              </p>

              <div className="form-group">
                <label>Responsável pelo Envio:</label>
                <input
                  type="text"
                  value={sendForm.sentBy}
                  onChange={e => setSendForm({ ...sendForm, sentBy: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Observação de Envio:</label>
                <input
                  type="text"
                  value={sendForm.notes}
                  onChange={e => setSendForm({ ...sendForm, notes: e.target.value })}
                />
              </div>

              {/* PERGUNTA DE FOLLOW-UP INTERNO (Item 19) */}
              <div className="followup-prompt-box">
                <Clock size={18} className="text-amber" />
                <div>
                  <strong>Deseja agendar follow-up automático interno? (Item 19)</strong>
                  <select
                    value={sendForm.createFollowUpDays}
                    onChange={e => setSendForm({ ...sendForm, createFollowUpDays: e.target.value })}
                  >
                    <option value="3">Sim, em 3 dias</option>
                    <option value="5">Sim, em 5 dias (Recomendado)</option>
                    <option value="7">Sim, em 7 dias</option>
                    <option value="10">Sim, em 10 dias</option>
                    <option value="">Não agendar follow-up</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setSendModalItem(null)}>Cancelar</button>
                <button type="submit" className="btn-confirm-send">Confirmar Envio</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR RESPOSTA / OUTCOME (Itens 35 e 36) */}
      {outcomeModalItem && (
        <div className="modal-backdrop" onClick={() => setOutcomeModalItem(null)}>
          <div className="comms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Resposta do Contato</h2>
              <button className="btn-close" onClick={() => setOutcomeModalItem(null)}>✕</button>
            </div>

            <form onSubmit={handleConfirmOutcome} className="composer-form">
              <div className="form-group">
                <label>Qual foi o desfecho comercial (Outcome)?</label>
                <select
                  value={outcomeForm.outcome}
                  onChange={e => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}
                >
                  {Object.values(CommunicationOutcome).map(oc => (
                    <option key={oc} value={oc}>{oc}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Detalhes da Resposta / Próxima Ação:</label>
                <textarea
                  rows="3"
                  placeholder="Ex: Contato aceitou reunião técnica na terça-feira às 14h..."
                  value={outcomeForm.outcomeNotes}
                  onChange={e => setOutcomeForm({ ...outcomeForm, outcomeNotes: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setOutcomeModalItem(null)}>Cancelar</button>
                <button type="submit" className="btn-save-outbox">Gravar Desfecho</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
