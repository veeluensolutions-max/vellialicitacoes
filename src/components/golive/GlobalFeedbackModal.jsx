import React, { useState } from 'react';
import { 
  X, 
  Send, 
  MessageSquarePlus, 
  CheckCircle2, 
  AlertTriangle, 
  Bug, 
  Lightbulb, 
  FileQuestion, 
  Zap, 
  Palette, 
  HelpCircle,
  Camera
} from 'lucide-react';
import { PilotFeedbackService } from '../../services/golive/pilotFeedbackService.js';
import { FeedbackType } from '../../services/golive/goLiveModels.js';
import './GlobalFeedbackModal.css';

export default function GlobalFeedbackModal({ isOpen, onClose, currentModule = 'Dashboard', currentUser = null }) {
  const [typeKey, setTypeKey] = useState('SUGGESTION');
  const [description, setDescription] = useState('');
  const [perceivedSeverity, setPerceivedSeverity] = useState('Média');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastFeedbackId, setLastFeedbackId] = useState(null);

  if (!isOpen) return null;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname || '/dashboard' : '/dashboard';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    const fb = PilotFeedbackService.submitFeedback({
      typeKey,
      module: currentModule,
      screen: currentPath,
      description: description.trim(),
      perceivedSeverity,
      screenshotUrl: screenshotUrl.trim() || null,
      user: currentUser?.name || 'Mariana Vasconcelos',
      userRole: currentUser?.role || 'LICITACOES'
    });

    setLastFeedbackId(fb.id);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
      setScreenshotUrl('');
      onClose();
    }, 2200);
  };

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <div className="header-icon-title">
            <div className="feedback-pill-icon">
              <MessageSquarePlus size={20} />
            </div>
            <div>
              <h3>Enviar Feedback da Operação</h3>
              <p className="feedback-subtitle">
                Ajude a aprimorar o Vellia durante o Piloto Real. Dados de contexto são capturados automaticamente.
              </p>
            </div>
          </div>
          <button className="feedback-close-btn" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="feedback-success-state">
            <CheckCircle2 size={52} className="success-icon pulse" />
            <h4>Feedback Enviado com Sucesso!</h4>
            <p>Protocolo <strong>{lastFeedbackId}</strong> registrado no Pilot Backlog para triagem do comitê.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="feedback-form">
            {/* Contexto capturado automaticamente */}
            <div className="feedback-context-banner">
              <div className="context-item">
                <span className="ctx-label">Módulo Ativo:</span>
                <span className="ctx-val">{currentModule}</span>
              </div>
              <div className="context-item">
                <span className="ctx-label">Usuário:</span>
                <span className="ctx-val">{currentUser?.name || 'Mariana Vasconcelos'}</span>
              </div>
              <div className="context-item">
                <span className="ctx-label">Versão:</span>
                <span className="ctx-val">v2.2-RC1 (Piloto)</span>
              </div>
            </div>

            {/* Tipo de Feedback */}
            <div className="form-group">
              <label>Tipo de Registro</label>
              <div className="feedback-type-grid">
                {Object.entries(FeedbackType).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    className={`type-chip ${typeKey === key ? 'active' : ''}`}
                    onClick={() => setTypeKey(key)}
                  >
                    {key === 'BUG' && <Bug size={14} />}
                    {key === 'SUGGESTION' && <Lightbulb size={14} />}
                    {key === 'DATA_ERROR' && <AlertTriangle size={14} />}
                    {key === 'MATCHING_ERROR' && <Zap size={14} />}
                    {key === 'UI_ISSUE' && <Palette size={14} />}
                    {key === 'PERFORMANCE' && <Zap size={14} />}
                    {key === 'OTHER' && <FileQuestion size={14} />}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Descrição */}
            <div className="form-group">
              <label htmlFor="fb-desc">
                Descrição Clara e Objetiva <span className="req">*</span>
              </label>
              <textarea
                id="fb-desc"
                rows={4}
                required
                className="feedback-textarea"
                placeholder="Explique o que aconteceu, o que esperava ou qual melhoria tornaria seu dia a dia mais produtivo..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Severidade Percebida */}
            <div className="form-row-dual">
              <div className="form-group">
                <label>Severidade Percebida</label>
                <select
                  value={perceivedSeverity}
                  onChange={(e) => setPerceivedSeverity(e.target.value)}
                  className="feedback-select"
                >
                  <option value="Baixa">Baixa (Pequena melhoria ou detalhe estético)</option>
                  <option value="Média">Média (Atrapalha fluxo, mas há alternativa)</option>
                  <option value="Alta">Alta (Impede tarefa importante de licitação)</option>
                  <option value="Crítica">Crítica (Erro grave ou dados incorretos)</option>
                </select>
              </div>

              {/* URL/Anexo opcional */}
              <div className="form-group">
                <label>Link ou Referência de Imagem (Opcional)</label>
                <div className="input-with-icon">
                  <Camera size={15} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Cole URL de print ou evidência"
                    className="feedback-input"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="feedback-modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit-feedback">
                <Send size={15} />
                <span>Registrar no Backlog</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
