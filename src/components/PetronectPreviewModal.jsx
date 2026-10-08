import React from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Eye, Calendar, Building2, Flame } from 'lucide-react';
import './PetronectPreviewModal.css';

export default function PetronectPreviewModal({ isOpen, onClose, previewItems, onConfirmImport, importing }) {
  if (!isOpen || !previewItems) return null;

  return (
    <div className="preview-modal-backdrop" onClick={onClose}>
      <div className="preview-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="preview-modal-header">
          <div className="p-header-left">
            <Eye size={20} className="text-teal" />
            <div>
              <h3>Prévia da Importação Controlada (Petronect Público)</h3>
              <p className="p-sub">Confira a normalização e classificação do lote antes de persistir definitivamente no banco.</p>
            </div>
          </div>
          <button className="btn-close-preview" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="preview-modal-body">
          <div className="preview-info-tag">
            <ShieldCheck size={15} className="text-teal" />
            <span>
              Foram capturados <strong>{previewItems.length} registros públicos</strong>. Cada oportunidade já foi normalizada pelo <em>PetronectAdapter</em> e classificada pelo <em>Motor de Aderência</em>.
            </span>
          </div>

          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Objeto da Contratação</th>
                  <th>Contratante</th>
                  <th>Encerramento</th>
                  <th>Serviço Detectado</th>
                  <th>Empresa</th>
                  <th>Aderência</th>
                  <th>Prioridade</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="mono font-bold text-navy">{item.number}</td>
                    <td className="p-obj-cell" title={item.object}>{item.object}</td>
                    <td>{item.contractor}</td>
                    <td className="mono font-bold">{item.closingDate} ({item.daysLeft}d)</td>
                    <td><span className="p-service-badge">{item.detectedService}</span></td>
                    <td className="text-teal font-bold">{item.recommendedCompany}</td>
                    <td>
                      <span className={`badge ${item.score >= 80 ? 'badge-critical' : item.score >= 70 ? 'badge-good' : 'badge-review'}`}>
                        {item.score}%
                      </span>
                    </td>
                    <td>
                      <span className="p-priority-tag">{item.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="preview-modal-footer">
          <button className="btn-cancel-preview" onClick={onClose} disabled={importing}>
            Cancelar
          </button>
          <button className="btn-confirm-preview" onClick={onConfirmImport} disabled={importing}>
            <CheckCircle2 size={16} />
            <span>{importing ? 'Importando e Deduplicando...' : `Confirmar Importação (${previewItems.length} Oportunidades)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
