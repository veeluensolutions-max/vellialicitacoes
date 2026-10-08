import React, { useState, useEffect } from 'react';
import { calendarIntegrationService } from '../services/productivity/calendarIntegrationService.js';
import { emailIntegrationService } from '../services/productivity/emailIntegrationService.js';
import { productivityIntegrationManager } from '../services/productivity/productivityIntegrationManager.js';
import { crmService } from '../services/crm/crmService.js';
import {
  Calendar,
  Clock,
  Video,
  Users,
  Building2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Mail,
  FileText,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  CalendarCheck
} from 'lucide-react';
import './IntegratedCalendarView.css';

export default function IntegratedCalendarView() {
  const [activeTab, setActiveTab] = useState('agenda-hoje'); // 'agenda-hoje' | 'todos-eventos' | 'emails-sincronizados'
  const [agendaToday, setAgendaToday] = useState({ meetings: [], followUps: [], proposalsExpiring: [] });
  const [allEvents, setAllEvents] = useState([]);
  const [syncedEmails, setSyncedEmails] = useState([]);
  const [selectedBriefing, setSelectedBriefing] = useState(null);
  const [selectedPostSummaryEvent, setSelectedPostSummaryEvent] = useState(null);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form de Nova Reunião
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    organizationId: '',
    contactId: '',
    providerType: 'GOOGLE_CALENDAR',
    createVideoLink: true,
    attendeeEmail: ''
  });

  const [conflictWarning, setConflictWarning] = useState(null);

  // Form de Pós-Reunião
  const [postSummaryForm, setPostSummaryForm] = useState({
    rawNotes: '',
    decisionsText: 'Alinhamento de cronograma aprovado; envio de atestados acordado.',
    createFollowUpDays: '5'
  });

  const loadData = () => {
    setAgendaToday(calendarIntegrationService.getMyAgendaToday());
    setAllEvents(calendarIntegrationService.getAllEvents());
    setSyncedEmails(emailIntegrationService.getAllEmails());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotice = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  // Checagem de Conflito em tempo real (Item 43)
  useEffect(() => {
    if (meetingForm.date && meetingForm.startTime && meetingForm.endTime) {
      const startIso = `${meetingForm.date}T${meetingForm.startTime}:00-03:00`;
      const endIso = `${meetingForm.date}T${meetingForm.endTime}:00-03:00`;
      const chk = calendarIntegrationService.checkConflicts(startIso, endIso);
      if (chk.hasConflict) {
        setConflictWarning(`Atenção: Horário sobrepõe com "${chk.conflicts[0].title}" (${chk.conflicts[0].startTime} - ${chk.conflicts[0].endTime}).`);
      } else {
        setConflictWarning(null);
      }
    }
  }, [meetingForm.date, meetingForm.startTime, meetingForm.endTime]);

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const provider = productivityIntegrationManager.providers[meetingForm.providerType];
      const attendees = meetingForm.attendeeEmail ? [meetingForm.attendeeEmail] : [];

      await calendarIntegrationService.createMeeting({
        providerInstance: provider,
        title: meetingForm.title,
        description: meetingForm.description,
        date: meetingForm.date,
        startTime: meetingForm.startTime,
        endTime: meetingForm.endTime,
        organizationId: meetingForm.organizationId,
        contactId: meetingForm.contactId,
        attendees,
        createVideoLink: meetingForm.createVideoLink,
        userEmail: 'roberto.mendes@excelenciaambiental.com.br'
      });

      showNotice('Reunião criada com sucesso e sincronizada no calendário!');
      setIsNewMeetingModalOpen(false);
      setMeetingForm({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '15:00',
        organizationId: '',
        contactId: '',
        providerType: 'GOOGLE_CALENDAR',
        createVideoLink: true,
        attendeeEmail: ''
      });
      loadData();
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  const handlePrepareBriefing = (eventId) => {
    try {
      const briefing = calendarIntegrationService.generatePreMeetingBriefing(eventId);
      const evt = allEvents.find(e => e.id === eventId);
      setSelectedBriefing({ briefing, eventTitle: evt?.title, date: evt?.date, time: evt?.startTime });
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  const handleSavePostSummary = (e) => {
    e.preventDefault();
    if (!selectedPostSummaryEvent) return;

    try {
      const decisions = postSummaryForm.decisionsText.split(';').map(d => d.trim()).filter(Boolean);
      calendarIntegrationService.recordPostMeetingSummary(selectedPostSummaryEvent.id, {
        rawNotes: postSummaryForm.rawNotes,
        decisions,
        createNextFollowUpDays: Number(postSummaryForm.createFollowUpDays),
        userEmail: 'roberto.mendes@excelenciaambiental.com.br'
      });

      showNotice('Resumo pós-reunião registrado com sucesso e follow-up atualizado no CRM!');
      setSelectedPostSummaryEvent(null);
      loadData();
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  const handleSyncAllNow = async () => {
    try {
      await productivityIntegrationManager.syncAll();
      showNotice('Sincronização com Google e Microsoft finalizada.');
      loadData();
    } catch (err) {
      showNotice(err.message, true);
    }
  };

  const organizations = crmService.getOrganizations();
  const contacts = crmService.getContacts();

  return (
    <div className="cal-container">
      {/* HEADER EXECUTIVO */}
      <header className="cal-header">
        <div className="header-left">
          <div className="module-tag">
            <Calendar size={15} />
            <span>Fase 19 — Produtividade Integrada</span>
          </div>
          <h1 className="header-title">Agenda Integrada & E-mails de Trabalho</h1>
          <p className="header-subtitle">
            Conexão bidirecional com <strong>Google Calendar</strong> e <strong>Microsoft 365</strong>.
            Sincronização de reuniões, e-mails comerciais e automação de follow-ups sem digitação duplicada.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary-sync" onClick={handleSyncAllNow}>
            <RefreshCw size={15} />
            <span>Sincronizar com Nuvem</span>
          </button>
          <button className="btn-primary-meeting" onClick={() => setIsNewMeetingModalOpen(true)}>
            <Plus size={16} />
            <span>Nova Reunião</span>
          </button>
        </div>
      </header>

      {/* FEEDBACK NOTIFICATION */}
      {notification && (
        <div className={`notification-toast ${notification.isError ? 'toast-error' : 'toast-success'}`}>
          {notification.isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* TABS DE VISUALIZAÇÃO */}
      <nav className="cal-nav">
        <button
          className={`cal-tab-btn ${activeTab === 'agenda-hoje' ? 'active' : ''}`}
          onClick={() => setActiveTab('agenda-hoje')}
        >
          <CalendarCheck size={16} />
          <span>Minha Agenda Hoje ({agendaToday.meetings.length + agendaToday.followUps.length})</span>
        </button>

        <button
          className={`cal-tab-btn ${activeTab === 'todos-eventos' ? 'active' : ''}`}
          onClick={() => setActiveTab('todos-eventos')}
        >
          <Calendar size={16} />
          <span>Todas as Reuniões & Visitas ({allEvents.length})</span>
        </button>

        <button
          className={`cal-tab-btn ${activeTab === 'emails-sincronizados' ? 'active' : ''}`}
          onClick={() => setActiveTab('emails-sincronizados')}
        >
          <Mail size={16} />
          <span>E-mails Sincronizados ({syncedEmails.length})</span>
        </button>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="cal-main-content">
        {/* ABA 1: MINHA AGENDA HOJE (Item 51) */}
        {activeTab === 'agenda-hoje' && (
          <div className="agenda-today-grid">
            {/* Coluna 1: Reuniões e Compromissos com Videoconferência */}
            <div className="agenda-column">
              <div className="column-header">
                <h3>🗓️ Reuniões & Audiências Técnicas</h3>
                <span className="badge-count">{agendaToday.meetings.length}</span>
              </div>

              {agendaToday.meetings.length === 0 ? (
                <div className="empty-card">Nenhuma reunião externa agendada para hoje.</div>
              ) : (
                agendaToday.meetings.map((evt) => (
                  <div key={evt.id} className="meeting-card">
                    <div className="meeting-top">
                      <span className="meeting-time">
                        <Clock size={14} /> {evt.startTime} - {evt.endTime}
                      </span>
                      <span className={`category-pill cat-${evt.category.toLowerCase().replace(/\s+/g, '-')}`}>
                        {evt.category}
                      </span>
                    </div>

                    <h4 className="meeting-title">{evt.title}</h4>
                    <p className="meeting-desc">{evt.description}</p>

                    <div className="meeting-parties">
                      <strong>{evt.organizationName || 'Órgão/Cliente'}</strong>
                      {evt.contactName && <span> • Contato: {evt.contactName}</span>}
                    </div>

                    {evt.videoLink && (
                      <div className="video-link-row">
                        <Video size={15} className="text-cyan" />
                        <a href={evt.videoLink} target="_blank" rel="noreferrer">
                          Entrar via {evt.videoType} ({evt.videoLink})
                        </a>
                      </div>
                    )}

                    <div className="meeting-actions">
                      <button className="btn-briefing" onClick={() => handlePrepareBriefing(evt.id)}>
                        <Sparkles size={14} />
                        <span>Briefing Pré-Reunião (IA)</span>
                      </button>

                      <button className="btn-post-summary" onClick={() => setSelectedPostSummaryEvent(evt)}>
                        <FileText size={14} />
                        <span>Resumo Pós-Reunião</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Coluna 2: Follow-ups e Prazos do Dia */}
            <div className="agenda-column">
              <div className="column-header">
                <h3>⏰ Follow-ups & Prazos Críticos de Hoje</h3>
                <span className="badge-count">{agendaToday.followUps.length + agendaToday.proposalsExpiring.length}</span>
              </div>

              {agendaToday.followUps.map((fu) => (
                <div key={fu.id} className="followup-item-card">
                  <div className="fu-top">
                    <span className="fu-time"><Clock size={13} /> {fu.time}</span>
                    <span className="fu-urgency">{fu.urgency || fu.priority}</span>
                  </div>
                  <h4 className="fu-title">{fu.title}</h4>
                  <div className="fu-meta">
                    <strong>{fu.organizationName}</strong> • {fu.contactName}
                  </div>
                  <p className="fu-reason">{fu.reason}</p>
                </div>
              ))}

              {agendaToday.proposalsExpiring.map((prop) => (
                <div key={prop.id} className="proposal-deadline-card">
                  <div className="prop-badge">⚠️ Prazo Limite de Envio</div>
                  <h4>Proposta #{prop.id} — {prop.object}</h4>
                  <div className="prop-meta">
                    Empresa: <strong>{prop.participatingCompany}</strong> • Abertura hoje
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 2: TODAS AS REUNIÕES & VISITAS */}
        {activeTab === 'todos-eventos' && (
          <div className="all-events-list">
            {allEvents.map((evt) => (
              <div key={evt.id} className="event-row-card">
                <div className="event-date-box">
                  <span className="ev-date">{new Date(evt.startIso).toLocaleDateString('pt-BR')}</span>
                  <span className="ev-time">{evt.startTime} - {evt.endTime}</span>
                </div>

                <div className="event-details">
                  <div className="ev-top-line">
                    <span className={`category-pill cat-${evt.category.toLowerCase().replace(/\s+/g, '-')}`}>{evt.category}</span>
                    <span className="provider-tag">{evt.provider}</span>
                  </div>
                  <h4 className="ev-title">{evt.title}</h4>
                  <div className="ev-sub">{evt.organizationName} • {evt.contactName}</div>
                  <p className="ev-desc">{evt.description}</p>
                  {evt.videoLink && (
                    <div className="video-link-row">
                      <Video size={14} className="text-cyan" />
                      <a href={evt.videoLink} target="_blank" rel="noreferrer">{evt.videoLink}</a>
                    </div>
                  )}
                </div>

                <div className="event-row-actions">
                  <button className="btn-briefing" onClick={() => handlePrepareBriefing(evt.id)}>
                    <Sparkles size={14} />
                    <span>Briefing IA</span>
                  </button>
                  <button className="btn-post-summary" onClick={() => setSelectedPostSummaryEvent(evt)}>
                    <FileText size={14} />
                    <span>Resumo</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABA 3: E-MAILS SINCRONIZADOS (Itens 7 a 20) */}
        {activeTab === 'emails-sincronizados' && (
          <div className="synced-emails-container">
            <div className="emails-intro-banner">
              <Mail size={18} className="text-cyan" />
              <div>
                <h4>Mensagens Sincronizadas dos Conectores (Gmail & Microsoft 365)</h4>
                <p>O sistema faz o matching automático com a base de Contatos e Editais do Vellia sem armazenar e-mails particulares desnecessários.</p>
              </div>
            </div>

            <div className="emails-list">
              {syncedEmails.map((email) => (
                <div key={email.id} className="email-card">
                  <div className="email-top">
                    <div className="email-sender-info">
                      <strong className="sender-name">{email.senderName}</strong>
                      <span className="sender-addr">&lt;{email.sender}&gt;</span>
                    </div>
                    <span className="email-date">{new Date(email.date).toLocaleString('pt-BR')}</span>
                  </div>

                  <h4 className="email-subject">{email.subject}</h4>

                  <div className="matching-badges-row">
                    <span className="crm-match-badge">
                      <Building2 size={13} /> {email.organizationName}
                    </span>
                    {email.isIdentifiedContact && (
                      <span className="contact-match-badge">
                        <Users size={13} /> {email.contactName}
                      </span>
                    )}
                    {email.opportunityNumber && (
                      <span className="opp-match-badge">
                        🎯 Edital #{email.opportunityNumber} ({email.confidenceLevel})
                      </span>
                    )}
                  </div>

                  <p className="email-snippet">{email.bodySnippet}</p>

                  {/* Resumo da Conversa com IA (Item 16) */}
                  <div className="email-ai-summary-box">
                    <div className="ai-summary-title">
                      <Sparkles size={14} className="text-cyan" />
                      <strong>Resumo do Thread & Próxima Ação</strong>
                    </div>
                    <div className="ai-summary-text">{email.threadSummary}</div>
                    <div className="ai-next-action">
                      <strong>Próximo Passo Recomendado:</strong> {email.nextActionSuggested}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: NOVA REUNIÃO (Itens 40, 41, 42, 43) */}
      {isNewMeetingModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewMeetingModalOpen(false)}>
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agendar Reunião ou Audiência Técnica</h3>
              <button className="btn-close" onClick={() => setIsNewMeetingModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateMeeting} className="meeting-form">
              <div className="form-group">
                <label>Título da Reunião:</label>
                <input
                  type="text"
                  placeholder="Ex: Reunião Técnica de Alinhamento — ETE Petrobras"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data:</label>
                  <input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Início:</label>
                  <input
                    type="time"
                    value={meetingForm.startTime}
                    onChange={(e) => setMeetingForm({ ...meetingForm, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Término:</label>
                  <input
                    type="time"
                    value={meetingForm.endTime}
                    onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* AVISO DE CONFLITO EM TEMPO REAL (Item 43) */}
              {conflictWarning && (
                <div className="conflict-alert-box">
                  <AlertTriangle size={18} />
                  <span>{conflictWarning}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Organização (Órgão / Empresa):</label>
                  <select
                    value={meetingForm.organizationId}
                    onChange={(e) => setMeetingForm({ ...meetingForm, organizationId: e.target.value })}
                    required
                  >
                    <option value="">Selecione o órgão...</option>
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Contato Profissional:</label>
                  <select
                    value={meetingForm.contactId}
                    onChange={(e) => setMeetingForm({ ...meetingForm, contactId: e.target.value })}
                  >
                    <option value="">Selecione o contato...</option>
                    {contacts.filter(c => !meetingForm.organizationId || c.organizationId === meetingForm.organizationId).map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.position})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Calendário de Destino:</label>
                  <select
                    value={meetingForm.providerType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, providerType: e.target.value })}
                  >
                    <option value="GOOGLE_CALENDAR">Google Calendar (Google Meet)</option>
                    <option value="MICROSOFT_CALENDAR">Microsoft Outlook Calendar (Teams)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>E-mail Convidado Externo:</label>
                  <input
                    type="email"
                    placeholder="contato@orgao.gov.br"
                    value={meetingForm.attendeeEmail}
                    onChange={(e) => setMeetingForm({ ...meetingForm, attendeeEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Objetivo / Pauta da Reunião:</label>
                <textarea
                  rows="3"
                  placeholder="Descreva a pauta da reunião técnica ou alinhamento pré-edital..."
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsNewMeetingModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-submit">Confirmar e Criar Evento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BRIEFING PRÉ-REUNIÃO (Itens 52 e 53) */}
      {selectedBriefing && (
        <div className="modal-backdrop" onClick={() => setSelectedBriefing(null)}>
          <div className="cal-modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} className="text-cyan" />
                <h3>Dossiê Executivo de Briefing Pré-Reunião</h3>
              </div>
              <button className="btn-close" onClick={() => setSelectedBriefing(null)}>✕</button>
            </div>

            <div className="briefing-content">
              <div className="briefing-hero">
                <h4>{selectedBriefing.eventTitle}</h4>
                <span>{new Date(selectedBriefing.date).toLocaleDateString('pt-BR')} às {selectedBriefing.time}</span>
              </div>

              <div className="briefing-grid">
                <div className="briefing-box">
                  <label>Visão do Contato Decisor:</label>
                  <p>{selectedBriefing.briefing.contactOverview}</p>
                </div>

                <div className="briefing-box">
                  <label>Organização & Esfera:</label>
                  <p>{selectedBriefing.briefing.organizationOverview}</p>
                </div>

                <div className="briefing-box">
                  <label>Histórico de Relacionamento:</label>
                  <p>{selectedBriefing.briefing.recentInteractionsCount} interações registradas no CRM. Última: {selectedBriefing.briefing.lastInteractionDate}</p>
                </div>

                <div className="briefing-box">
                  <label>Oportunidade Pré-Edital Vinculada:</label>
                  <p>{selectedBriefing.briefing.topOpportunity}</p>
                </div>
              </div>

              <div className="briefing-recommendation-box">
                <strong>🎯 Foco Estratégico Recomendado:</strong>
                <p>{selectedBriefing.briefing.recommendedFocus}</p>
                <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#38bdf8' }}>
                  <strong>Próximo Passo pós-reunião:</strong> {selectedBriefing.briefing.nextStepSuggestion}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-submit" onClick={() => setSelectedBriefing(null)}>Fechar Dossiê</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESUMO PÓS-REUNIÃO (Itens 54 e 55) */}
      {selectedPostSummaryEvent && (
        <div className="modal-backdrop" onClick={() => setSelectedPostSummaryEvent(null)}>
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Ata & Resumo Pós-Reunião</h3>
              <button className="btn-close" onClick={() => setSelectedPostSummaryEvent(null)}>✕</button>
            </div>

            <form onSubmit={handleSavePostSummary} className="meeting-form">
              <div className="meeting-hero" style={{ marginBottom: '14px' }}>
                <h4>{selectedPostSummaryEvent.title}</h4>
                <span>{selectedPostSummaryEvent.organizationName} • {selectedPostSummaryEvent.contactName}</span>
              </div>

              <div className="form-group">
                <label>Notas Brutas da Reunião (Anotações do consultor):</label>
                <textarea
                  rows="4"
                  placeholder="Insira os principais pontos discutidos, objeções ou solicitações do órgão..."
                  value={postSummaryForm.rawNotes}
                  onChange={(e) => setPostSummaryForm({ ...postSummaryForm, rawNotes: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Decisões e Compromissos Firmados (separe por ponto e vírgula):</label>
                <input
                  type="text"
                  value={postSummaryForm.decisionsText}
                  onChange={(e) => setPostSummaryForm({ ...postSummaryForm, decisionsText: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Criar Follow-up Comercial no CRM?</label>
                <select
                  value={postSummaryForm.createFollowUpDays}
                  onChange={(e) => setPostSummaryForm({ ...postSummaryForm, createFollowUpDays: e.target.value })}
                >
                  <option value="2">Sim, em 2 dias úteis</option>
                  <option value="5">Sim, em 5 dias úteis (Recomendado)</option>
                  <option value="7">Sim, em 7 dias úteis</option>
                  <option value="0">Não agendar follow-up</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setSelectedPostSummaryEvent(null)}>Cancelar</button>
                <button type="submit" className="btn-submit">Gravar Resumo e Atualizar CRM</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
