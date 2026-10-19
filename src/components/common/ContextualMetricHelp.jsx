import React, { useState } from 'react';
import { HelpCircle, X, Info, ShieldCheck, AlertTriangle } from 'lucide-react';
import './ContextualMetricHelp.css';

/**
 * VELLIA LICITAÇÕES — FASE 51
 * ContextualMetricHelp: Educação do Usuário & Ajuda Contextual (Seções 148 a 154)
 * 
 * Esclarece métricas críticas para evitar interpretações equivocadas:
 * - Aderência Técnica (o que significa, como é calculada, o que NÃO significa)
 * - Confiança do Agente (Confidence != Certeza)
 * - Forecast Financeiro (Stage Weight != Probabilidade garantida)
 */

export const METRIC_HELP_DEFINITIONS = {
  ADERENCIA_TECNICA: {
    title: 'Aderência Técnica',
    badge: 'Score Canônico',
    whatIs: 'Percentual de compatibilidade semântica e técnica entre o objeto licitado e o catálogo oficial de serviços e atestados da empresa.',
    howCalculated: 'Cálculo determinístico com base em termos técnicos, normas regulamentadoras (ex: NR-13, NBR 10151, CONAMA 491/430) e histórico de certames similares.',
    whatIsNot: 'NÃO é garantia de vitória comercial, nem dispensa a verificação humana detalhada dos requisitos de habilitação do edital.'
  },
  CONFIANCA_AGENTE: {
    title: 'Confiança da Classificação',
    badge: 'Grau de Certeza',
    whatIs: 'Nível de consistência estatística das evidências extraídas do edital (Termo de Referência e Cláusulas Técnicas).',
    howCalculated: 'Calculada com base na densidade de menções explícitas a serviços, quantitativos e atestados requeridos.',
    whatIsNot: 'Confiança "Alta" NÃO significa certeza jurídica absoluta. Sempre revise os requisitos obrigatórios antes de deliberar Go/No-Go.'
  },
  FORECAST_PROBABILIDADE: {
    title: 'Forecast Ponderado do Funil',
    badge: 'Projeção Financeira',
    whatIs: 'Estimativa de faturamento ponderada pelo avanço canônico da oportunidade (Identificada: 10%, Go: 30%, Proposta: 60%, Em Disputa: 80%).',
    howCalculated: 'Multiplicação do valor estimado da oportunidade pelo peso do estágio atual no funil B2G.',
    whatIsNot: 'Stage Weight NÃO é faturamento garantido nem promessa contábil. Serve exclusivamente para priorização de esforço comercial.'
  },
  CAPACIDADE_OPERACIONAL: {
    title: 'Capacidade Operacional',
    badge: 'Habilitação Documental',
    whatIs: 'Grau de disponibilidade de atestados CAT, certidões fiscais e equipe técnica para atender às exigências mínimas do edital.',
    howCalculated: 'Conferência contra o Acervo de Documentos (Vault) das empresas Veeluen Solutions e Excelência Ambiental.',
    whatIsNot: 'NÃO substitui a montagem e conferência final do Dossiê de Habilitação antes do envio.'
  }
};

export default function ContextualMetricHelp({ metricKey = 'ADERENCIA_TECNICA', inline = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const def = METRIC_HELP_DEFINITIONS[metricKey] || METRIC_HELP_DEFINITIONS.ADERENCIA_TECNICA;

  return (
    <>
      <button
        type="button"
        className={`metric-help-trigger ${inline ? 'inline' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        title={`Entenda como a métrica "${def.title}" é calculada`}
        aria-label={`Ajuda sobre ${def.title}`}
      >
        <HelpCircle size={13} />
      </button>

      {isOpen && (
        <div className="metric-help-overlay" onClick={() => setIsOpen(false)}>
          <div className="metric-help-card" onClick={(e) => e.stopPropagation()}>
            <div className="metric-help-header">
              <div className="metric-help-title-row">
                <span className="metric-help-badge">{def.badge}</span>
                <h4>{def.title}</h4>
              </div>
              <button 
                type="button" 
                className="metric-help-close" 
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="metric-help-body">
              <div className="help-section">
                <div className="help-section-label">
                  <Info size={14} color="#38bdf8" />
                  <strong>O que significa:</strong>
                </div>
                <p>{def.whatIs}</p>
              </div>

              <div className="help-section">
                <div className="help-section-label">
                  <ShieldCheck size={14} color="#10b981" />
                  <strong>Como é calculada:</strong>
                </div>
                <p>{def.howCalculated}</p>
              </div>

              <div className="help-section warning-section">
                <div className="help-section-label">
                  <AlertTriangle size={14} color="#f59e0b" />
                  <strong>O que NÃO significa:</strong>
                </div>
                <p>{def.whatIsNot}</p>
              </div>
            </div>

            <div className="metric-help-footer">
              <span>Princípio Vellia: <strong>Explainable Intelligence</strong> (Decisões com evidência transparente)</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
