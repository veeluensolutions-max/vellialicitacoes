import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock, HelpCircle, Check, FileText, ChevronRight, X } from 'lucide-react';
import { dataGovernanceService, ConfidenceLevel, DataFreshness } from '../../services/dataGovernance/dataGovernanceService.js';
import './DataHealthBadge.css';

export default function DataHealthBadge({ 
  entityId, 
  field, 
  value, 
  showWhyAction = true,
  size = 'sm' 
}) {
  const [whyModalOpen, setWhyModalOpen] = useState(false);
  const whyData = dataGovernanceService.getWhyThisValue(entityId, field);

  const getBadgeConfig = () => {
    if (whyData.isManuallyOverridden) {
      return {
        label: 'Corrigido Manualmente',
        color: '#38BDF8',
        bg: 'rgba(56, 189, 248, 0.1)',
        border: 'rgba(56, 189, 248, 0.3)',
        icon: Check
      };
    }
    if (whyData.confidence === ConfidenceLevel.CONFIRMED) {
      return {
        label: 'Fonte Oficial Confirmada',
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.3)',
        icon: ShieldCheck
      };
    }
    if (whyData.confidence === ConfidenceLevel.HIGH_CONFIDENCE) {
      return {
        label: 'Alta Confiabilidade',
        color: '#34D399',
        bg: 'rgba(52, 211, 153, 0.1)',
        border: 'rgba(52, 211, 153, 0.25)',
        icon: ShieldCheck
      };
    }
    if (whyData.confidence === ConfidenceLevel.LOW_CONFIDENCE) {
      return {
        label: 'Requer Validação (OCR)',
        color: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.3)',
        icon: AlertTriangle
      };
    }
    return {
      label: 'Origem Registrada',
      color: '#94A3B8',
      bg: 'rgba(148, 163, 184, 0.08)',
      border: 'rgba(148, 163, 184, 0.2)',
      icon: HelpCircle
    };
  };

  const badgeConfig = getBadgeConfig();
  const IconComp = badgeConfig.icon;

  return (
    <>
      <span 
        className={`data-health-badge ${size}`}
        style={{
          color: badgeConfig.color,
          backgroundColor: badgeConfig.bg,
          borderColor: badgeConfig.border
        }}
        title={`Clique para rastrear a origem ("Why this value?"): ${whyData.sourceId || 'Origem oficial'}`}
        onClick={() => showWhyAction && setWhyModalOpen(true)}
      >
        <IconComp size={size === 'xs' ? 10 : 12} />
        <span>{badgeConfig.label}</span>
      </span>

      {/* MODAL CONTEXTUAL: "WHY THIS VALUE?" (FASE 48: ITENS 93 & 94) */}
      {whyModalOpen && (
        <div className="why-modal-backdrop" onClick={() => setWhyModalOpen(false)}>
          <div className="why-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="why-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#38BDF8" />
                <h4 style={{ margin: 0, fontSize: '14px', color: '#FFFFFF' }}>
                  Rastreabilidade do Dado: {field}
                </h4>
              </div>
              <button 
                className="why-close-btn"
                onClick={() => setWhyModalOpen(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="why-modal-body">
              <div className="why-hero-val">
                <span className="why-val-lbl">Valor Atual em Uso no Sistema:</span>
                <strong className="why-val-text">{String(whyData.currentValue || value)}</strong>
                {whyData.isManuallyOverridden && (
                  <span className="why-override-pill">
                    Valor Original Pré-Correção: {String(whyData.originalValue)}
                  </span>
                )}
              </div>

              <div className="why-lineage-grid">
                <div className="why-item">
                  <span className="why-lbl">Tipo de Fonte:</span>
                  <strong className="why-val">{whyData.sourceType}</strong>
                </div>

                <div className="why-item">
                  <span className="why-lbl">Documento / Conector de Origem:</span>
                  <strong className="why-val">{whyData.sourceId}</strong>
                </div>

                <div className="why-item">
                  <span className="why-lbl">Localização Exata no Documento:</span>
                  <strong className="why-val">{whyData.sourcePage}</strong>
                </div>

                <div className="why-item">
                  <span className="why-lbl">Data da Fonte Oficial:</span>
                  <strong className="why-val">{whyData.sourceDate || 'Não informada'}</strong>
                </div>

                <div className="why-item">
                  <span className="why-lbl">Método de Captura / Extração:</span>
                  <strong className="why-val">{whyData.extractionMethod}</strong>
                </div>

                <div className="why-item">
                  <span className="why-lbl">Validação Humana:</span>
                  <strong className="why-val text-green">{whyData.confirmedBy}</strong>
                </div>
              </div>

              {whyData.isManuallyOverridden && (
                <div className="why-override-box">
                  <strong>Justificativa da Correção Manual (Auditoria):</strong>
                  <p>{whyData.overrideReason}</p>
                </div>
              )}
            </div>

            <div className="why-modal-footer">
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Governança de Dados Vellia • Rastreabilidade imutável de proveniência
              </span>
              <button 
                className="why-btn-done"
                onClick={() => setWhyModalOpen(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
