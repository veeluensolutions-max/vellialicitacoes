import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Minus, Check } from 'lucide-react';
import { ProductIntelligenceService } from '../../services/intelligence/productIntelligenceService.js';
import './QuickFeedbackWidget.css';

export default function QuickFeedbackWidget({ entityType = 'Opportunity', entityId = 'default', prompt = 'Esta recomendação foi útil?' }) {
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleVote = (val) => {
    setSelected(val);
    ProductIntelligenceService.recordQuickFeedback(entityType, entityId, val);
    setSaved(true);
    setTimeout(() => {
      // Deixa o feedback confirmado
    }, 1500);
  };

  if (saved) {
    return (
      <div className="quick-feedback-widget saved">
        <Check size={14} className="qfb-check-icon" />
        <span>Obrigado pelo feedback! A Vellia 2.1 agradece.</span>
      </div>
    );
  }

  return (
    <div className="quick-feedback-widget">
      <span className="qfb-prompt">{prompt}</span>
      <div className="qfb-buttons">
        <button
          type="button"
          className={`qfb-btn ${selected === 'YES' ? 'active' : ''}`}
          onClick={() => handleVote('YES')}
          title="Sim, muito útil"
        >
          <ThumbsUp size={13} />
          <span>Sim</span>
        </button>
        <button
          type="button"
          className={`qfb-btn ${selected === 'PARTIAL' ? 'active' : ''}`}
          onClick={() => handleVote('PARTIAL')}
          title="Parcialmente útil"
        >
          <Minus size={13} />
          <span>Parcial</span>
        </button>
        <button
          type="button"
          className={`qfb-btn ${selected === 'NO' ? 'active' : ''}`}
          onClick={() => handleVote('NO')}
          title="Não ajudou ou incorreto"
        >
          <ThumbsDown size={13} />
          <span>Não</span>
        </button>
      </div>
    </div>
  );
}
