import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Calendar, 
  RefreshCw, 
  Download, 
  X, 
  Building2, 
  Copy, 
  Send, 
  Edit3, 
  Clock, 
  FileText,
  Zap,
  Info
} from 'lucide-react';
import { cndMonitoringService, CND_STATUS } from '../../services/cnd/cndMonitoringService.js';
import { externalAlertDispatcher } from '../../services/notifications/externalAlertDispatcher.js';
import { EventBus } from '../../services/eventBus.js';
import './CndManagementModal.css';

export default function CndManagementModal({ isOpen, onClose }) {
  const [selectedCompany, setSelectedCompany] = useState('excelencia-ambiental');
  const [companyData, setCompanyData] = useState(() => cndMonitoringService.getCompanyCertificates('excelencia-ambiental'));
  const [editingCert, setEditingCert] = useState(null);
  const [editForm, setEditForm] = useState({
    expiryDate: '',
    number: '',
    verificationCode: ''
  });
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  useEffect(() => {
    const handleUpdate = () => {
      setCompanyData(cndMonitoringService.getCompanyCertificates(selectedCompany));
    };
    const unsub = EventBus.subscribe('vellia-cnds-updated', handleUpdate);
    return unsub;
  }, [selectedCompany]);

  useEffect(() => {
    if (isOpen) {
      setCompanyData(cndMonitoringService.getCompanyCertificates(selectedCompany));
      setEditingCert(null);
      setToastMessage(null);
    }
  }, [isOpen, selectedCompany]);

  if (!isOpen) return null;

  const handleCompanyChange = (key) => {
    setSelectedCompany(key);
    setCompanyData(cndMonitoringService.getCompanyCertificates(key));
    setEditingCert(null);
  };

  const handleStartEdit = (cert) => {
    setEditingCert(cert);
    setEditForm({
      expiryDate: cert.expiryDate || '',
      number: cert.number || '',
      verificationCode: cert.verificationCode || ''
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCert) return;

    cndMonitoringService.updateCertificate(selectedCompany, editingCert.id, editForm);
    setCompanyData(cndMonitoringService.getCompanyCertificates(selectedCompany));
    setEditingCert(null);
    showToast('Validade da certidão atualizada com sucesso!');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleDispatchWhatsAppAlert = () => {
    const expiringCert = companyData.certificates.find(c => c.status === CND_STATUS.EXPIRING || c.status === CND_STATUS.EXPIRED);
    const mockTender = {
      number: 'REGULARIDADE-FISCAL',
      client: companyData.companyName,
      object: expiringCert 
        ? `Alerta de vencimento da certidão: ${expiringCert.title} (restam ${expiringCert.daysLeft} dias)`
        : 'Varredura de conformidade fiscal: todas as certidões estão 100% regulares.',
      score: 95,
      recommendedCompany: companyData.companyName,
      portal: 'Central de CNDs'
    };

    externalAlertDispatcher.dispatchCriticalAlert(mockTender);
    showToast('Alerta de CNDs despachado para o WhatsApp e E-mail da Diretoria!');
  };

  const handleDownloadReport = () => {
    const textReport = `VELLIA LICITAÇÕES — RELATÓRIO OFICIAL DE REGULARIDADE FISCAL E CNDS
Empresa: ${companyData.companyName}
CNPJ: ${companyData.cnpj}
Data de Emissão do Relatório: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
Status Global: ${companyData.isEligibleForBidding ? 'APTA PARA PARTICIPAÇÃO EM LICITAÇÕES' : 'IMPEDIDA (CERTIDÃO VENCIDA)'}

CERTIDÕES AUDITADAS:
${companyData.certificates.map(c => `
- ${c.title}
  Órgão Emissor: ${c.issuer}
  Número: ${c.number}
  Data de Vencimento: ${c.expiryDate} (${c.daysLeft >= 0 ? `${c.daysLeft} dias restantes` : `VENCIDA há ${Math.abs(c.daysLeft)} dias`})
  Status: ${c.status}
  Código de Autenticidade: ${c.verificationCode}
  Link Oficial: ${c.portalUrl}
`).join('\n')}

Este documento reflete a auditoria de conformidade fiscal para participação em certames sob a Lei 14.133/21 e Lei 13.303/16.`;

    const blob = new Blob([textReport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_CNDs_${selectedCompany}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Relatório de CNDs baixado com sucesso!');
  };

  const isEligible = companyData.isEligibleForBidding;

  return (
    <div className="cnd-modal-overlay" onClick={onClose}>
      <div className="cnd-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="cnd-header">
          <div className="cnd-title-area">
            <div className={`cnd-icon-badge ${isEligible ? 'ok' : 'alert'}`}>
              {isEligible ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
            </div>
            <div>
              <h3>Central de CNDs & Regularidade Fiscal</h3>
              <p>Monitoramento contínuo de certidões federais, estaduais, trabalhistas e conselho de classe</p>
            </div>
          </div>
          <button className="cnd-close-btn" onClick={onClose} title="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Seletor de Empresa */}
        <div className="cnd-company-selector-bar">
          <button 
            type="button"
            className={`cnd-comp-tab ${selectedCompany === 'excelencia-ambiental' ? 'active' : ''}`}
            onClick={() => handleCompanyChange('excelencia-ambiental')}
          >
            <Building2 size={16} />
            <div className="cnd-tab-text">
              <span className="cnd-tab-name">Excelência Ambiental</span>
              <span className="cnd-tab-cnpj">CNPJ: 38.987.654/0001-22</span>
            </div>
            <span className="cnd-badge-count">7 CNDs</span>
          </button>

          <button 
            type="button"
            className={`cnd-comp-tab ${selectedCompany === 'veeluen-solutions' ? 'active' : ''}`}
            onClick={() => handleCompanyChange('veeluen-solutions')}
          >
            <Building2 size={16} />
            <div className="cnd-tab-text">
              <span className="cnd-tab-name">Veeluen Solutions</span>
              <span className="cnd-tab-cnpj">CNPJ: 45.123.890/0001-44</span>
            </div>
            <span className="cnd-badge-count">7 CNDs</span>
          </button>
        </div>

        {/* Banner de Diagnóstico Geral */}
        <div className={`cnd-status-hero ${isEligible ? 'hero-ok' : 'hero-alert'}`}>
          <div className="hero-left">
            <div className="hero-status-pill">
              {isEligible ? (
                <>
                  <CheckCircle2 size={15} />
                  <span>EMPRESA 100% REGULAR E HABILITADA PARA LICITAR</span>
                </>
              ) : (
                <>
                  <XCircle size={15} />
                  <span>BLOQUEIO FISCAL DETECTADO — CERTIDÃO VENCIDA</span>
                </>
              )}
            </div>
            <p className="hero-subtext">
              {companyData.expiredCount > 0 
                ? `Atenção: ${companyData.expiredCount} certidão(ões) vencida(s). A empresa não pode emitir lances sem reemissão imediata.`
                : companyData.expiringCount > 0
                ? `Alerta preventivo: ${companyData.expiringCount} certidão(ões) vencendo nos próximos 15 dias. Providencie a renovação antecipada.`
                : 'Todas as certidões obrigatórias da Lei 14.133/21 e Lei 13.303/16 estão válidas e auditadas.'}
            </p>
          </div>

          <div className="hero-metrics">
            <div className="metric-box">
              <span className="m-val text-emerald-400">{companyData.totalCount - companyData.expiredCount - companyData.expiringCount}</span>
              <span className="m-lbl">Válidas</span>
            </div>
            <div className="metric-box">
              <span className="m-val text-amber-400">{companyData.expiringCount}</span>
              <span className="m-lbl">Expirando</span>
            </div>
            <div className="metric-box">
              <span className="m-val text-rose-400">{companyData.expiredCount}</span>
              <span className="m-lbl">Vencidas</span>
            </div>
          </div>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="cnd-toast-banner">
            <CheckCircle2 size={15} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Grade de Certidões */}
        <div className="cnd-grid-body">
          {companyData.certificates.map((cert) => {
            const isExpiring = cert.status === CND_STATUS.EXPIRING;
            const isExpired = cert.status === CND_STATUS.EXPIRED;
            
            return (
              <div 
                key={cert.id} 
                className={`cnd-card ${isExpired ? 'card-expired' : isExpiring ? 'card-expiring' : 'card-ok'}`}
              >
                <div className="cnd-card-header">
                  <div className="cnd-card-title-box">
                    <h5>{cert.title}</h5>
                    <span className="cnd-card-issuer">{cert.issuer}</span>
                  </div>
                  <span className={`cnd-card-badge ${isExpired ? 'b-expired' : isExpiring ? 'b-expiring' : 'b-ok'}`}>
                    {isExpired ? 'VENCIDA' : isExpiring ? `VENCE EM ${cert.daysLeft} DIAS` : 'VÁLIDA'}
                  </span>
                </div>

                <div className="cnd-card-meta">
                  <div className="meta-row">
                    <span className="mr-lbl">Vencimento:</span>
                    <strong className="mr-val">{cert.expiryDate}</strong>
                  </div>
                  <div className="meta-row">
                    <span className="mr-lbl">Número:</span>
                    <span className="mr-val code">{cert.number}</span>
                  </div>
                  <div className="meta-row">
                    <span className="mr-lbl">Autenticidade:</span>
                    <span className="mr-val code">{cert.verificationCode}</span>
                    <button 
                      type="button" 
                      className="btn-copy-code"
                      onClick={() => handleCopyCode(cert.id, cert.verificationCode)}
                      title="Copiar código de autenticidade"
                    >
                      {copiedCodeId === cert.id ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso de Validade */}
                <div className="cnd-progress-container">
                  <div 
                    className={`cnd-progress-bar ${isExpired ? 'p-red' : isExpiring ? 'p-yellow' : 'p-green'}`}
                    style={{ width: `${Math.max(10, Math.min(100, (cert.daysLeft / 180) * 100))}%` }}
                  />
                </div>

                {/* Ações da Certidão */}
                <div className="cnd-card-actions">
                  <a 
                    href={cert.portalUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-portal-link"
                    title="Acessar portal emissor oficial"
                  >
                    <span>Emitir / Renovar</span>
                    <ExternalLink size={12} />
                  </a>

                  <button 
                    type="button"
                    className="btn-edit-cnd"
                    onClick={() => handleStartEdit(cert)}
                    title="Atualizar data de vencimento e número"
                  >
                    <Edit3 size={13} />
                    <span>Atualizar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Inline de Edição de Certidão */}
        {editingCert && (
          <div className="cnd-edit-overlay" onClick={() => setEditingCert(null)}>
            <div className="cnd-edit-card" onClick={e => e.stopPropagation()}>
              <div className="cec-header">
                <h4>Atualizar Certidão: {editingCert.title}</h4>
                <button onClick={() => setEditingCert(null)}>✕</button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="cec-form-group">
                  <label>Nova Data de Vencimento</label>
                  <input 
                    type="date" 
                    value={editForm.expiryDate}
                    onChange={e => setEditForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="cec-form-group">
                  <label>Número da Certidão</label>
                  <input 
                    type="text" 
                    value={editForm.number}
                    onChange={e => setEditForm(prev => ({ ...prev, number: e.target.value }))}
                    required
                  />
                </div>
                <div className="cec-form-group">
                  <label>Código de Autenticidade / Controle</label>
                  <input 
                    type="text" 
                    value={editForm.verificationCode}
                    onChange={e => setEditForm(prev => ({ ...prev, verificationCode: e.target.value }))}
                    required
                  />
                </div>
                <div className="cec-actions">
                  <button type="button" className="btn-cancel" onClick={() => setEditingCert(null)}>Cancelar</button>
                  <button type="submit" className="btn-save">Salvar e Validar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rodapé com Ações Globais */}
        <div className="cnd-footer">
          <div className="footer-left">
            <button 
              type="button" 
              className="btn-footer-cnd secondary"
              onClick={handleDispatchWhatsAppAlert}
              title="Disparar resumo de regularidade fiscal para celulares da Diretoria"
            >
              <Send size={14} className="text-emerald-400" />
              <span>Notificar Diretoria no WhatsApp</span>
            </button>
          </div>

          <div className="footer-right">
            <button 
              type="button" 
              className="btn-footer-cnd primary"
              onClick={handleDownloadReport}
              title="Baixar dossiê fiscal consolidado para anexar ao pregão"
            >
              <Download size={14} />
              <span>Baixar Relatório Fiscal (.txt)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
