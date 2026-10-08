import React, { useState } from 'react';
import { X, CalendarClock, ShieldCheck, Check, Info } from 'lucide-react';
import { SourceSchedulerService } from '../services/petronect/sourceScheduler';
import './PetronectSchedulerModal.css';

export default function PetronectSchedulerModal({ isOpen, onClose, onSaved }) {
  const [settings, setSettings] = useState(() => SourceSchedulerService.getSettings());
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = SourceSchedulerService.updateSettings(settings);
    setSettings(updated);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      if (onSaved) onSaved(updated);
      onClose();
    }, 1000);
  };

  return (
    <div className="sched-modal-backdrop" onClick={onClose}>
      <div className="sched-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sched-modal-header">
          <div className="sched-header-title">
            <CalendarClock size={20} className="text-teal" />
            <div>
              <h3>Configuração de Monitoramento Automático</h3>
              <p className="sched-sub">Agendador de consultas públicas periódicas do Petronect (source_schedule)</p>
            </div>
          </div>
          <button className="btn-close-sched" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="sched-form-body">
          {/* Toggle ON/OFF */}
          <div className="sched-toggle-box">
            <div className="toggle-info">
              <label className="toggle-main-label">Monitoramento Automático Ativo</label>
              <p className="toggle-sub-label">Quando habilitado, o Vellia Agent consultará a área pública do Petronect nos horários programados.</p>
            </div>
            <label className="switch-control">
              <input 
                type="checkbox" 
                name="enabled" 
                checked={settings.enabled} 
                onChange={handleChange} 
              />
              <span className="slider round" />
            </label>
          </div>

          <div className="sched-fields-grid">
            <div className="form-field">
              <label>Frequência de Monitoramento</label>
              <select 
                name="frequency" 
                value={settings.frequency} 
                onChange={handleChange}
                className="modal-input"
              >
                <option value="Diária">Diária (Recomendado)</option>
                <option value="Duas vezes ao dia">Duas vezes ao dia (06:30 e 14:00)</option>
                <option value="Personalizada">Personalizada</option>
              </select>
            </div>

            <div className="form-field">
              <label>Horário de Execução Principal</label>
              <input 
                type="time" 
                name="time" 
                value={settings.time} 
                onChange={handleChange}
                className="modal-input"
              />
            </div>

            <div className="form-field">
              <label>Fuso Horário Oficial</label>
              <input 
                type="text" 
                name="timezone" 
                value={settings.timezone} 
                readOnly
                className="modal-input"
              />
            </div>

            <div className="form-field">
              <label>Modo de Coleta</label>
              <select 
                name="mode" 
                value={settings.mode} 
                onChange={handleChange}
                className="modal-input"
              >
                <option value="INCREMENTAL">Incremental (Apenas Novas / Atualizadas)</option>
                <option value="COMPLETA">Completa (Todas as Abertas)</option>
              </select>
            </div>
          </div>

          <div className="sched-security-callout">
            <ShieldCheck size={16} className="text-teal" />
            <span>
              <strong>Política Segura Vellia:</strong> Não são utilizadas credenciais nem robôs autenticados. A coleta opera exclusivamente sobre informações públicas com respeito ao rate limit do portal.
            </span>
          </div>

          <div className="sched-footer">
            {savedFeedback && (
              <span className="sched-saved-pill">
                <Check size={14} /> Configurações atualizadas!
              </span>
            )}
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save-opp">
              Salvar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
