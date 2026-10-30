import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock,
  ShieldCheck,
  XCircle,
  Check
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import './OpportunityDetailModal.css';

export default function OpportunityDetailModal({ opportunityId, isOpen, onClose, onUpdated }) {
  const [opp, setOpp] = useState(null);
  const [notes, setNotes] = useState('');
  const [responsible, setResponsible] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (isOpen && opportunityId) {
      const found = OpportunityService.getById(opportunityId);
      setOpp(found || null);
      setNotes(found?.internalNotes || '');
      setResponsible(found?.responsiblePerson || '');
    }
  }, [isOpen, opportunityId]);

  if (!isOpen || !opportunityId || !opp) return null;

  const isParticipating = opp.decision === 'GO' || opp.status === 'Participando' || opp.status === 'Interessante' || opp.status === 'Go';
  const isDiscarded = opp.decision === 'NO-GO' || opp.status === 'Descartada' || opp.status === 'No-Go';
  const isExcel = (opp.recommendedCompany || '').toLowerCase().includes('excel');

  const handleDecision = (decisionType) => {
    const updated = OpportunityService.recordDecision(opp.id, decisionType);
    setOpp(updated);
    if (onUpdated) onUpdated(updated);
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    const updated = OpportunityService.assignResponsible(opp.id, {
      responsiblePerson: responsible,
      internalNotes: notes,
      internalDeadline: opp.internalDeadline || opp.endDate
    });
    setOpp(updated);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
    if (onUpdated) onUpdated(updated);
  };

  return (
    <div className="detail-modal-backdrop" onClick={onClose}>
      <div
        className="detail-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '760px' }}
      >
        {/* CABEÇALHO LIMPO E OBJETIVO */}
        <div className="detail-modal-header" style={{ paddingBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="opp-number-pill mono">Edital #{opp.number}</span>
              <span className="opp-portal-pill">{opp.portal}</span>
              <span style={{
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '6px',
                background: isExcel ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: isExcel ? '#34D399' : '#38BDF8',
                border: isExcel ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(56, 189, 248, 0.35)'
              }}>
                {opp.recommendedCompany || 'Veeluen Solutions'}
              </span>
            </div>

            <button className="detail-close-btn" onClick={onClose} title="Fechar">
              <X size={20} />
            </button>
          </div>

          <h2 className="detail-title" style={{ margin: '0 0 6px 0', fontSize: '19px' }}>
            {opp.title}
          </h2>
          <p className="detail-client-sub" style={{ margin: 0 }}>
            {opp.client} • {opp.location}
          </p>

          {/* BARRA DE DECISÃO RÁPIDA (CONCORRER | EM ANÁLISE | DESCARTAR) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(148, 163, 184, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
                Participação no Edital:
              </span>

              <button
                type="button"
                onClick={() => handleDecision('GO')}
                style={{
                  background: isParticipating ? '#10B981' : 'rgba(16, 185, 129, 0.12)',
                  color: isParticipating ? '#0F172A' : '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CheckCircle2 size={14} />
                <span>{isParticipating ? 'Selecionado para Concorrer' : 'Concorrer neste Edital'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleDecision('EM_ANALISE')}
                style={{
                  background: !isParticipating && !isDiscarded ? 'rgba(56, 189, 248, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                  color: !isParticipating && !isDiscarded ? '#38BDF8' : '#94A3B8',
                  border: !isParticipating && !isDiscarded ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Em Análise
              </button>

              <button
                type="button"
                onClick={() => handleDecision('NO-GO')}
                style={{
                  background: isDiscarded ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                  color: isDiscarded ? '#F87171' : '#94A3B8',
                  border: isDiscarded ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <XCircle size={13} />
                <span>Descartar</span>
              </button>
            </div>

            {opp.url && (
              <a
                href={opp.url}
                target="_blank"
                rel="noreferrer noopener"
                style={{
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ExternalLink size={14} />
                <span>Abrir Edital no {opp.portal}</span>
              </a>
            )}
          </div>
        </div>

        {/* CORPO OBJETIVO DO EDITAL */}
        <div className="detail-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Grade de Dados Principais */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderRadius: '10px',
            padding: '14px 16px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Building2 size={12} /> Empresa & Serviço Alinhado
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                {opp.recommendedCompany} — {opp.primaryService}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Prazo / Encerramento
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: opp.daysLeft <= 3 ? '#F87171' : '#F8FAFC' }}>
                {opp.endDate} ({opp.daysLeft} dias restantes)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={12} /> Valor Estimado
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'monospace' }}>
                {opp.estimatedValue || 'Sob consulta'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} /> Modalidade
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1' }}>
                {opp.modality || 'Licitação Eletrônica'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={12} /> Local de Execução
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1' }}>
                {opp.location}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> Data de Publicação
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#CBD5E1' }}>
                {opp.publishDate}
              </div>
            </div>
          </div>

          {/* Objeto Completo da Licitação */}
          <div className="detail-card">
            <h4 className="card-subheading">Objeto e Escopo do Edital</h4>
            <p className="card-body-text" style={{ marginBottom: opp.description && opp.description !== opp.object ? '10px' : 0 }}>
              {opp.object}
            </p>
            {opp.description && opp.description !== opp.object && (
              <p className="card-body-text" style={{ color: '#94A3B8', fontSize: '13px' }}>
                {opp.description}
              </p>
            )}
          </div>

          {/* Anotações Rápidas para Concorrer */}
          <div className="detail-card">
            <h4 className="card-subheading">Anotações Internas (Responsável / Observações para Concorrer)</h4>
            <form onSubmit={handleSaveNotes} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="Responsável pelo edital (opcional)..."
                className="modal-input"
              />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anote informações rápidas sobre documentação, visita técnica ou formação de preço..."
                className="modal-textarea"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                {savedFeedback && (
                  <span style={{ fontSize: '12px', color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={13} /> Salvo!
                  </span>
                )}
                <button type="submit" className="btn-save-resp">
                  Salvar Anotação
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
