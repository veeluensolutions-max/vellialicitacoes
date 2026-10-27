import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Settings2, 
  Plus, 
  Trash2, 
  History, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';
import { ExternalAlertDispatcher } from '../../services/notifications/externalAlertDispatcher.js';
import './ExternalAlertConfigModal.css';

export default function ExternalAlertConfigModal({ isOpen, onClose }) {
  const [config, setConfig] = useState(() => ExternalAlertDispatcher.getConfig());
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'email' | 'history'
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [history, setHistory] = useState(() => ExternalAlertDispatcher.getDispatchHistory());
  const [testPhone, setTestPhone] = useState('5581999990001');
  const [testEmail, setTestEmail] = useState('diretoria@vellia.com.br');

  if (!isOpen) return null;

  const handleSave = () => {
    ExternalAlertDispatcher.saveConfig(config);
    setFeedbackMsg({ type: 'success', text: 'Configurações de notificações salvas com sucesso!' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleAddPhone = () => {
    const newRec = {
      id: `rec-${Date.now()}`,
      name: 'Novo Contato Diretoria',
      phone: '5581900000000',
      company: 'ALL'
    };
    setConfig(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        recipients: [...prev.whatsapp.recipients, newRec]
      }
    }));
  };

  const handleRemovePhone = (id) => {
    setConfig(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        recipients: prev.whatsapp.recipients.filter(r => r.id !== id)
      }
    }));
  };

  const handleAddEmail = () => {
    const newEm = {
      id: `em-${Date.now()}`,
      name: 'Novo E-mail Diretoria',
      email: 'novo@vellia.com.br',
      company: 'ALL'
    };
    setConfig(prev => ({
      ...prev,
      email: {
        ...prev.email,
        recipients: [...prev.email.recipients, newEm]
      }
    }));
  };

  const handleRemoveEmail = (id) => {
    setConfig(prev => ({
      ...prev,
      email: {
        ...prev.email,
        recipients: prev.email.recipients.filter(r => r.id !== id)
      }
    }));
  };

  const handleTestWhatsApp = async () => {
    const res = await ExternalAlertDispatcher.sendTestNotification('WHATSAPP', testPhone);
    setHistory(ExternalAlertDispatcher.getDispatchHistory());
    setFeedbackMsg({ type: 'success', text: res.message });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleTestEmail = async () => {
    const res = await ExternalAlertDispatcher.sendTestNotification('EMAIL', testEmail);
    setHistory(ExternalAlertDispatcher.getDispatchHistory());
    setFeedbackMsg({ type: 'success', text: res.message });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="ext-alert-backdrop" onClick={onClose}>
      <div className="ext-alert-card" onClick={e => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="ext-alert-header">
          <div className="h-left">
            <div className="h-icon-box">
              <Send size={20} className="text-teal" />
            </div>
            <div>
              <h3>Despacho Externo de Alertas (WhatsApp & E-mail)</h3>
              <p>Envio em tempo real de certames críticos (≥ 85%) para o celular e e-mail da diretoria</p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Abas */}
        <div className="ext-alert-tabs">
          <button 
            className={`tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
            onClick={() => setActiveTab('whatsapp')}
          >
            <Smartphone size={14} />
            <span>WhatsApp Diretoria</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <Mail size={14} />
            <span>E-mail Corporativo</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => {
              setHistory(ExternalAlertDispatcher.getDispatchHistory());
              setActiveTab('history');
            }}
          >
            <History size={14} />
            <span>Histórico de Despachos ({history.length})</span>
          </button>
        </div>

        {/* Feedback Banner */}
        {feedbackMsg && (
          <div className="ext-feedback-banner">
            <CheckCircle2 size={16} />
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Corpo */}
        <div className="ext-alert-body">
          {/* ABA 1: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="tab-pane">
              <div className="channel-switch-card">
                <div className="switch-info">
                  <strong>Ativar Notificações no WhatsApp</strong>
                  <p>Dispara aviso formatado assim que um certame atinge a régua mínima de aderência.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={config.whatsapp.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      whatsapp: { ...config.whatsapp, enabled: e.target.checked }
                    })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="form-group-row">
                <label>Régua Mínima de Aderência para Disparo:</label>
                <div className="slider-input-wrap">
                  <input 
                    type="range"
                    min="70"
                    max="95"
                    step="5"
                    value={config.whatsapp.minScore}
                    onChange={(e) => setConfig({
                      ...config,
                      whatsapp: { ...config.whatsapp, minScore: Number(e.target.value) }
                    })}
                  />
                  <span className="score-badge mono">{config.whatsapp.minScore}%</span>
                </div>
              </div>

              <div className="form-group-row">
                <label>Modo de Entrega:</label>
                <select 
                  value={config.whatsapp.provider}
                  onChange={(e) => setConfig({
                    ...config,
                    whatsapp: { ...config.whatsapp, provider: e.target.value }
                  })}
                  className="c-select"
                >
                  <option value="DIRECT_LINK">Link Direto Instantâneo (wa.me — Gratuito, 1-clique)</option>
                  <option value="Z_API">API REST Gateway (Z-API / WhatsApp Business)</option>
                  <option value="EVOLUTION_API">Evolution API / Meta Cloud API</option>
                </select>
              </div>

              {config.whatsapp.provider !== 'DIRECT_LINK' && (
                <div className="api-creds-box">
                  <div className="cred-field">
                    <label>Endpoint da API:</label>
                    <input 
                      type="text" 
                      value={config.whatsapp.apiEndpoint}
                      onChange={(e) => setConfig({
                        ...config,
                        whatsapp: { ...config.whatsapp, apiEndpoint: e.target.value }
                      })}
                      className="c-input"
                    />
                  </div>
                  <div className="cred-field">
                    <label>Client Token / API Secret:</label>
                    <input 
                      type="password" 
                      placeholder="sk-••••••••••••"
                      value={config.whatsapp.apiToken}
                      onChange={(e) => setConfig({
                        ...config,
                        whatsapp: { ...config.whatsapp, apiToken: e.target.value }
                      })}
                      className="c-input"
                    />
                  </div>
                </div>
              )}

              {/* Lista de Telefones */}
              <div className="recipients-section">
                <div className="r-header">
                  <strong>Destinatários WhatsApp (Diretores & Sócios)</strong>
                  <button className="btn-add-rec" onClick={handleAddPhone}>
                    <Plus size={13} /> Adicionar Telefone
                  </button>
                </div>

                <div className="recipients-list">
                  {config.whatsapp.recipients.map((rec, idx) => (
                    <div key={rec.id} className="rec-row">
                      <input 
                        type="text" 
                        value={rec.name}
                        placeholder="Nome / Cargo"
                        onChange={(e) => {
                          const updated = [...config.whatsapp.recipients];
                          updated[idx].name = e.target.value;
                          setConfig({ ...config, whatsapp: { ...config.whatsapp, recipients: updated } });
                        }}
                        className="c-input-name"
                      />
                      <input 
                        type="text" 
                        value={rec.phone}
                        placeholder="Ex: 5581999990001"
                        onChange={(e) => {
                          const updated = [...config.whatsapp.recipients];
                          updated[idx].phone = e.target.value;
                          setConfig({ ...config, whatsapp: { ...config.whatsapp, recipients: updated } });
                        }}
                        className="c-input-phone"
                      />
                      <select
                        value={rec.company}
                        onChange={(e) => {
                          const updated = [...config.whatsapp.recipients];
                          updated[idx].company = e.target.value;
                          setConfig({ ...config, whatsapp: { ...config.whatsapp, recipients: updated } });
                        }}
                        className="c-select-comp"
                      >
                        <option value="ALL">Todas as Empresas</option>
                        <option value="Veeluen Solutions">Veeluen Solutions</option>
                        <option value="Excelência Ambiental">Excelência Ambiental</option>
                      </select>
                      <button className="btn-remove-rec" onClick={() => handleRemovePhone(rec.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teste Rápido */}
              <div className="test-dispatch-box">
                <div className="t-left">
                  <Smartphone size={16} className="text-teal" />
                  <div>
                    <strong>Disparar Teste de Alerta no WhatsApp</strong>
                    <p>Envia uma notificação demonstrativa para validar a entrega no número indicado.</p>
                  </div>
                </div>
                <div className="t-right">
                  <input 
                    type="text" 
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="5581999990001"
                    className="c-input-test"
                  />
                  <button className="btn-test-action" onClick={handleTestWhatsApp}>
                    <Send size={13} /> Testar Agora
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 2: E-MAIL */}
          {activeTab === 'email' && (
            <div className="tab-pane">
              <div className="channel-switch-card">
                <div className="switch-info">
                  <strong>Ativar Notificações por E-mail Corporativo</strong>
                  <p>Envia resumo executivo do edital para as caixas postais da diretoria.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={config.email.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      email: { ...config.email, enabled: e.target.checked }
                    })}
                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <div className="form-group-row">
                <label>Régua Mínima de Aderência para E-mail:</label>
                <div className="slider-input-wrap">
                  <input 
                    type="range"
                    min="70"
                    max="95"
                    step="5"
                    value={config.email.minScore}
                    onChange={(e) => setConfig({
                      ...config,
                      email: { ...config.email, minScore: Number(e.target.value) }
                    })}
                  />
                  <span className="score-badge mono">{config.email.minScore}%</span>
                </div>
              </div>

              <div className="form-group-row">
                <label>Método de Envio:</label>
                <select 
                  value={config.email.provider}
                  onChange={(e) => setConfig({
                    ...config,
                    email: { ...config.email, provider: e.target.value }
                  })}
                  className="c-select"
                >
                  <option value="MAILTO_DIRECT">Cliente de E-mail Local (mailto: — Outlook, Gmail)</option>
                  <option value="SMTP_RELAY">Servidor SMTP / AWS SES Corporativo</option>
                </select>
              </div>

              {/* Lista de E-mails */}
              <div className="recipients-section">
                <div className="r-header">
                  <strong>Destinatários de E-mail (Diretoria & Engenharia)</strong>
                  <button className="btn-add-rec" onClick={handleAddEmail}>
                    <Plus size={13} /> Adicionar E-mail
                  </button>
                </div>

                <div className="recipients-list">
                  {config.email.recipients.map((em, idx) => (
                    <div key={em.id} className="rec-row">
                      <input 
                        type="text" 
                        value={em.name}
                        placeholder="Nome"
                        onChange={(e) => {
                          const updated = [...config.email.recipients];
                          updated[idx].name = e.target.value;
                          setConfig({ ...config, email: { ...config.email, recipients: updated } });
                        }}
                        className="c-input-name"
                      />
                      <input 
                        type="email" 
                        value={em.email}
                        placeholder="email@empresa.com.br"
                        onChange={(e) => {
                          const updated = [...config.email.recipients];
                          updated[idx].email = e.target.value;
                          setConfig({ ...config, email: { ...config.email, recipients: updated } });
                        }}
                        className="c-input-phone"
                      />
                      <select
                        value={em.company}
                        onChange={(e) => {
                          const updated = [...config.email.recipients];
                          updated[idx].company = e.target.value;
                          setConfig({ ...config, email: { ...config.email, recipients: updated } });
                        }}
                        className="c-select-comp"
                      >
                        <option value="ALL">Todas</option>
                        <option value="Veeluen Solutions">Veeluen Solutions</option>
                        <option value="Excelência Ambiental">Excelência Ambiental</option>
                      </select>
                      <button className="btn-remove-rec" onClick={() => handleRemoveEmail(em.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teste Rápido */}
              <div className="test-dispatch-box">
                <div className="t-left">
                  <Mail size={16} className="text-teal" />
                  <div>
                    <strong>Disparar Teste de E-mail</strong>
                    <p>Gera o e-mail pré-formatado para validação do template e entrega.</p>
                  </div>
                </div>
                <div className="t-right">
                  <input 
                    type="email" 
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="diretoria@vellia.com.br"
                    className="c-input-test"
                  />
                  <button className="btn-test-action" onClick={handleTestEmail}>
                    <Send size={13} /> Testar E-mail
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: HISTÓRICO */}
          {activeTab === 'history' && (
            <div className="tab-pane">
              <div className="history-header-row">
                <strong>Rastreabilidade de Despachos Externos</strong>
                <span className="history-badge">{history.length} eventos registrados</span>
              </div>

              {history.length === 0 ? (
                <div className="empty-history-box">
                  Nenhum alerta externo despachado ainda. Execute um teste nas abas ao lado para verificar.
                </div>
              ) : (
                <div className="history-items-list">
                  {history.map((item) => (
                    <div key={item.id} className="history-card-item">
                      <div className="h-card-left">
                        <span className={`channel-pill ${item.channel.toLowerCase().includes('whats') ? 'c-wa' : 'c-em'}`}>
                          {item.channel}
                        </span>
                        <div>
                          <div className="h-dest">Destinatário: <strong>{item.recipient}</strong></div>
                          <div className="h-opp">Oportunidade / Certame: {item.opportunity}</div>
                        </div>
                      </div>
                      <div className="h-card-right">
                        <span className="h-status">{item.status}</span>
                        <span className="h-date">{new Date(item.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="ext-alert-footer">
          <div className="f-tag">
            <ShieldCheck size={14} className="text-teal" />
            <span>Notificações automatizadas com proteção LGPD e segregação por empresa</span>
          </div>
          <div className="f-actions">
            <button className="btn-secondary" onClick={onClose}>
              Fechar
            </button>
            <button className="btn-primary" onClick={handleSave}>
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
