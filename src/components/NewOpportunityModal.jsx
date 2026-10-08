import React, { useState } from 'react';
import { X, Plus, Sparkles, Building2, MapPin, Calendar, DollarSign, Globe, FileText, CheckCircle2 } from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import './NewOpportunityModal.css';

export default function NewOpportunityModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    portal: 'Petronect',
    number: '',
    client: 'Petrobras',
    title: '',
    object: '',
    description: '',
    state: 'PE',
    city: 'Ipojuca',
    publishDate: new Date().toLocaleDateString('pt-BR'),
    endDate: '25/10/2026',
    estimatedValue: 'R$ 1.200.000,00',
    modality: 'Licitação Eletrônica',
    url: 'https://petronect.com/portal/oportunidades'
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.number.trim() || !formData.title.trim() || !formData.object.trim()) {
      alert('Por favor preencha o número, título e objeto da oportunidade.');
      return;
    }

    setLoading(true);
    try {
      const res = OpportunityService.createManual(formData);
      setFeedback({
        type: 'success',
        message: res.action === 'UPDATED_DUPLICATE' 
          ? `Oportunidade já existia no banco! Dados mesclados e atualizados sem duplicação.`
          : `Oportunidade cadastrada com sucesso! Motor calculou ${res.item.score}% de aderência para ${res.item.recommendedCompany}.`,
        item: res.item
      });
      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess(res.item);
        onClose();
      }, 1200);
    } catch (err) {
      setLoading(false);
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <Plus size={18} className="text-teal" />
            <h3>Cadastrar Nova Oportunidade</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="form-info-callout">
            <Sparkles size={14} className="text-teal" />
            <span>Ao salvar, o <strong>Motor de Aderência</strong> analisará automaticamente o objeto, definirá a empresa sugerida, pontuação e tags.</span>
          </div>

          <div className="form-grid-dual">
            <div className="form-field">
              <label>Portal de Origem *</label>
              <select name="portal" value={formData.portal} onChange={handleChange} className="modal-input">
                <option value="Petronect">Petronect</option>
                <option value="PNCP">PNCP</option>
                <option value="Compras.gov.br">Compras.gov.br</option>
                <option value="Portal Municipal">Portal Municipal</option>
                <option value="Privado">Outro Portal Privado</option>
              </select>
            </div>

            <div className="form-field">
              <label>Número da Oportunidade / Edital *</label>
              <input 
                type="text" 
                name="number" 
                value={formData.number} 
                onChange={handleChange} 
                placeholder="Ex: 7004455667"
                required 
                className="modal-input mono"
              />
            </div>
          </div>

          <div className="form-grid-dual">
            <div className="form-field">
              <label>Órgão ou Empresa Contratante *</label>
              <input 
                type="text" 
                name="client" 
                value={formData.client} 
                onChange={handleChange} 
                placeholder="Ex: Petrobras - RNEST" 
                required 
                className="modal-input"
              />
            </div>

            <div className="form-field">
              <label>Modalidade</label>
              <input 
                type="text" 
                name="modality" 
                value={formData.modality} 
                onChange={handleChange} 
                placeholder="Ex: Licitação Eletrônica" 
                className="modal-input"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Título da Licitação *</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Ex: Monitoramento de emissões em chaminés e dutos" 
              required 
              className="modal-input"
            />
          </div>

          <div className="form-field">
            <label>Objeto da Oportunidade * (Base para análise do Motor de Aderência)</label>
            <textarea 
              name="object" 
              rows={3} 
              value={formData.object} 
              onChange={handleChange} 
              placeholder="Descreva o escopo técnico completo do edital..." 
              required 
              className="modal-textarea"
            />
          </div>

          <div className="form-grid-triple">
            <div className="form-field">
              <label>Estado (UF)</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
                placeholder="PE" 
                className="modal-input"
              />
            </div>

            <div className="form-field">
              <label>Cidade</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                placeholder="Ipojuca" 
                className="modal-input"
              />
            </div>

            <div className="form-field">
              <label>Data de Encerramento</label>
              <input 
                type="text" 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                placeholder="25/10/2026" 
                className="modal-input"
              />
            </div>
          </div>

          <div className="form-grid-dual">
            <div className="form-field">
              <label>Valor Estimado</label>
              <input 
                type="text" 
                name="estimatedValue" 
                value={formData.estimatedValue} 
                onChange={handleChange} 
                placeholder="R$ 1.200.000,00" 
                className="modal-input"
              />
            </div>

            <div className="form-field">
              <label>Link / URL da Oportunidade</label>
              <input 
                type="url" 
                name="url" 
                value={formData.url} 
                onChange={handleChange} 
                placeholder="https://..." 
                className="modal-input"
              />
            </div>
          </div>

          {feedback && (
            <div className={`feedback-banner ${feedback.type}`}>
              <CheckCircle2 size={16} />
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-save-opp" disabled={loading}>
              <Plus size={15} />
              <span>{loading ? 'Processando Motor...' : 'Salvar e Analisar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
