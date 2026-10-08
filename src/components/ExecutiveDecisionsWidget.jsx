import React from 'react';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Flame, 
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { DecisionService } from '../services/decision/decisionService';
import './ExecutiveDecisionsWidget.css';

export default function ExecutiveDecisionsWidget({ onNavigateToDecisionBoard }) {
  const metrics = DecisionService.getManagementMetrics();
  const decisoes = metrics.decisoesDaSemana;

  return (
    <div className="executive-decisions-card">
      <div className="exec-dec-header">
        <div className="exec-dec-title-group">
          <div className="exec-dec-icon-badge">
            <Scale size={18} />
          </div>
          <div>
            <div className="exec-badge-pill">PAINEL EXECUTIVO • FASE 10</div>
            <h3 className="exec-dec-title">Decisões da Semana (GO / NO-GO)</h3>
          </div>
        </div>

        <button 
          className="btn-link-board"
          onClick={onNavigateToDecisionBoard}
          title="Abrir o Decision Board completo com matriz, comparador e IA gerencial"
        >
          <span>Ver Decision Board</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <p className="exec-dec-desc">
        Balanço executivo das análises deliberadas pelo comitê comercial nos últimos 7 dias:
      </p>

      {/* Grid com os 5 Indicadores do Item 46 */}
      <div className="exec-metrics-grid">
        <div className="exec-metric-item m-total">
          <span className="m-lbl">Oportunidades Analisadas</span>
          <strong className="m-val">{decisoes.total}</strong>
          <span className="m-sub">100% deliberadas</span>
        </div>

        <div className="exec-metric-item m-go">
          <div className="m-head-icon text-green"><CheckCircle2 size={14} /> <span className="m-lbl">GO Aprovado</span></div>
          <strong className="m-val text-green">{decisoes.go}</strong>
          <span className="m-sub">Avanço para proposta</span>
        </div>

        <div className="exec-metric-item m-go-pend">
          <div className="m-head-icon text-amber"><AlertTriangle size={14} /> <span className="m-lbl">GO com Pendências</span></div>
          <strong className="m-val text-amber">{decisoes.goPendencias}</strong>
          <span className="m-sub">Requer mitigação</span>
        </div>

        <div className="exec-metric-item m-nogo">
          <div className="m-head-icon text-red"><XCircle size={14} /> <span className="m-lbl">NO-GO</span></div>
          <strong className="m-val text-red">{decisoes.noGo}</strong>
          <span className="m-sub">Descartes justificados</span>
        </div>

        <div className="exec-metric-item m-prioritaria">
          <div className="m-head-icon text-teal"><Flame size={14} /> <span className="m-lbl">Propostas Prioritárias</span></div>
          <strong className="m-val text-teal">{decisoes.propostasPrioritarias}</strong>
          <span className="m-sub">Ticket &gt; R$ 500k</span>
        </div>
      </div>
    </div>
  );
}
