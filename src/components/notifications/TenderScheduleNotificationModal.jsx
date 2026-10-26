import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  X, 
  Send, 
  Users, 
  Scale, 
  HelpCircle,
  BellRing
} from 'lucide-react';
import { tenderNotificationService } from '../../services/notifications/tenderNotificationService.js';
import './TenderScheduleNotificationModal.css';

export default function TenderScheduleNotificationModal({ opportunity, isOpen, onClose }) {
  if (!isOpen || !opportunity) return null;

  const milestones = tenderNotificationService.calculateMilestones(opportunity);
  const defaultSettings = tenderNotificationService.getSettings();

  const [recipients, setRecipients] = useState(defaultSettings.recipients || []);
  const [newRecipientInput, setNewRecipientInput] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [feedback, setFeedback] = useState(null);

  const gcalSessionUrl = tenderNotificationService.generateGoogleCalendarUrl(opportunity, 'SESSION');
  const gcalImpugnationUrl = tenderNotificationService.generateGoogleCalendarUrl(opportunity, 'IMPUGNATION');

  const handleDownloadIcs = () => {
    try {
      tenderNotificationService.downloadIcsFile(opportunity);
      setFeedback({ type: 'success', message: 'Arquivo .ICS baixado com alarmes de 24h, 2h e 15m configurados!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: `Erro ao gerar .ICS: ${err.message}` });
    }
  };

  const handleSendEmail = () => {
    try {
      tenderNotificationService.dispatchEmail(opportunity, recipients, customNote);
      setFeedback({
        type: 'success',
        message: `E-mail de alerta gerado para ${recipients.length} destinatários da equipe!`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({ type: 'error', message: `Falha no disparo: ${err.message}` });
    }
  };

  const handleAddRecipient = (e) => {
    e.preventDefault();
    const val = newRecipientInput.trim();
    if (val && !recipients.includes(val)) {
      setRecipients([...recipients, val]);
      setNewRecipientInput('');
    }
  };

  const handleRemoveRecipient = (emailToRemove) => {
    setRecipients(recipients.filter(r => r !== emailToRemove));
  };

  const oppNumber = opportunity.number || opportunity.id;

  return (
    <div className="schedule-modal-backdrop" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="schedule-header">
          <div className="schedule-title-area">
            <div className="schedule-icon-badge">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="schedule-title">Agendamento de Prazos & Alerta da Equipe</h2>
              <p className="schedule-subtitle">
                Certame #{oppNumber} • {opportunity.client} ({opportunity.recommendedCompany || 'Veeluen Solutions'})
              </p>
            </div>
          </div>
          <button className="schedule-close-btn" onClick={onClose} title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="schedule-body">

          {/* Feedback Se Houver */}
          {feedback && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: feedback.type === 'success' ? '#34d399' : '#f87171',
              border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Linha do Tempo dos Prazos Legais */}
          <div className="timeline-card">
            <div className="timeline-title">
              <Clock size={15} color="#38bdf8" />
              <span>Cronograma Operacional & Prazos Fatais (Lei 14.133/2021)</span>
            </div>

            <div className="milestones-grid">
              <div className="milestone-item">
                <div className="milestone-label">
                  <HelpCircle size={13} color="#94a3b8" />
                  <span>Esclarecimento de Dúvidas</span>
                </div>
                <div className="milestone-val">{milestones.formatted.clarification}</div>
                <div className="milestone-sub">Protocolar perante o pregoeiro até as 18:00</div>
              </div>

              <div className="milestone-item" style={{ borderColor: 'rgba(239, 68, 68, 0.35)', background: 'rgba(239, 68, 68, 0.05)' }}>
                <div className="milestone-label" style={{ color: '#f87171' }}>
                  <Scale size={13} />
                  <span>Impugnação do Edital</span>
                </div>
                <div className="milestone-val" style={{ color: '#fca5a5' }}>{milestones.formatted.impugnation}</div>
                <div className="milestone-sub">Prazo final legal para apontar ilegalidades</div>
              </div>

              <div className="milestone-item">
                <div className="milestone-label">
                  <Clock size={13} color="#94a3b8" />
                  <span>Envio de Proposta e Habilitação</span>
                </div>
                <div className="milestone-val">{milestones.formatted.proposal}</div>
                <div className="milestone-sub">Inserção prévia dos preços e dossiê ZIP</div>
              </div>

              <div className="milestone-item" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.08)' }}>
                <div className="milestone-label" style={{ color: '#38bdf8' }}>
                  <BellRing size={13} />
                  <span>Abertura da Sessão / Disputa</span>
                </div>
                <div className="milestone-val" style={{ color: '#38bdf8' }}>{milestones.formatted.session}</div>
                <div className="milestone-sub">Início da disputa de lances no portal oficial</div>
              </div>
            </div>
          </div>

          {/* Integrações com Google Calendar e Arquivo .ICS */}
          <div className="calendar-actions-box">
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#34d399" />
              <span>Sincronizar com Agenda Executiva</span>
            </div>

            <div className="calendar-btn-group">
              <a 
                href={gcalSessionUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn-gcal-primary"
                title="Abre o Google Calendar com todos os dados da sessão preenchidos"
              >
                <Calendar size={13} />
                <span>Agendar Sessão no Google Calendar</span>
                <ExternalLink size={11} />
              </a>

              <a 
                href={gcalImpugnationUrl} 
                target="_blank" 
                rel="noreferrer"
                className="btn-gcal-secondary"
                title="Agenda o prazo fatal de impugnação do edital no Google Calendar"
              >
                <Scale size={13} />
                <span>Agendar Impugnação (GCalendar)</span>
                <ExternalLink size={11} />
              </a>

              <button 
                type="button" 
                className="btn-gcal-secondary"
                onClick={handleDownloadIcs}
                title="Baixa arquivo .ICS compatível com Outlook, Apple Calendar e Google Calendar"
              >
                <Download size={13} />
                <span>Baixar Pacote .ICS (com Alarmes)</span>
              </button>
            </div>
          </div>

          {/* Disparo de E-mail Corporativo */}
          <div className="email-section-card">
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="#38bdf8" />
              <span>Disparar Alerta por E-mail para a Equipe</span>
            </div>

            <div className="email-recipients-box">
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Destinatários do Alerta:</span>
              <div className="email-tags-list">
                {recipients.map(r => (
                  <span key={r} className="email-tag">
                    <span>{r}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveRecipient(r)} 
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddRecipient} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input
                  type="email"
                  placeholder="Adicionar e-mail..."
                  value={newRecipientInput}
                  onChange={(e) => setNewRecipientInput(e.target.value)}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: '#f8fafc',
                    flex: 1
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#334155',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Adicionar
                </button>
              </form>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Observação Operacional Adicional (Opcional):
              </span>
              <textarea
                className="email-textarea"
                placeholder="Ex.: Certidão estadual atualizada; verificar se o valor teto cobre os custos de mobilização..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-gcal-primary"
                onClick={handleSendEmail}
                style={{ background: '#0284c7' }}
              >
                <Send size={13} />
                <span>Disparar Alerta por E-mail</span>
              </button>
            </div>
          </div>

        </div>

        {/* Rodapé */}
        <div className="schedule-footer">
          <div>
            Prazos calculados automaticamente com base na Lei 14.133/2021
          </div>
          <div>
            Trilha de auditoria registrada em <code>GeneralAuditService</code>
          </div>
        </div>

      </div>
    </div>
  );
}
