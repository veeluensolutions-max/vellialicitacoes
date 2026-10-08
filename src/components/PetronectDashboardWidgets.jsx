import React, { useState } from 'react';
import { 
  Globe2, 
  Clock, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  ExternalLink,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import './PetronectDashboardWidgets.css';

export default function PetronectDashboardWidgets({ onSelectOpportunity, onNavigateToMonitoring, onNavigateToOpportunities }) {
  const [selectedFilterDays, setSelectedFilterDays] = useState('ALL'); // 'ALL' | 3 | 7 | 15

  const allOpps = OpportunityService.listAll();
  const petronectOpps = allOpps.filter(o => o.portal?.toLowerCase().includes('petronect'));

  // Métricas do bloco "Petronect hoje" (Item 33)
  const monitoradasCount = petronectOpps.length || allOpps.length;
  const novasCount = petronectOpps.filter(o => o.status === 'Nova').length;
  const relevantesCount = petronectOpps.filter(o => o.score >= 70).length;
  const criticasCount = petronectOpps.filter(o => o.score >= 90 || o.priority === 'Crítica').length;
  const encerramento7DiasCount = petronectOpps.filter(o => o.daysLeft <= 7).length;

  // Radar de Prazos Próximos (Item 34)
  // Filtrar oportunidades com encerramento próximo (até 15 dias)
  const deadlineList = [...petronectOpps]
    .filter(o => o.daysLeft !== undefined && o.daysLeft !== null)
    .sort((a, b) => a.daysLeft - b.daysLeft); // Ordenar pelas mais urgentes

  const filteredDeadlines = deadlineList.filter(o => {
    if (selectedFilterDays === 3) return o.daysLeft <= 3;
    if (selectedFilterDays === 7) return o.daysLeft <= 7;
    if (selectedFilterDays === 15) return o.daysLeft <= 15;
    return o.daysLeft <= 15; // default mostra até 15 dias
  });

  return (
    <div className="petronect-widgets-container">
      {/* BLOCO 1: PETRONECT HOJE (Item 33) */}
      <div className="widget-card petronect-today-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <div className="widget-icon-box">
              <Globe2 size={18} className="text-blue" />
            </div>
            <div>
              <div className="widget-badge-row">
                <span className="widget-tag-portal">FONTE PÚBLICA PETRONECT</span>
                <span className="widget-status-online">
                  <span className="dot-pulse" /> Operação Ativa
                </span>
              </div>
              <h3 className="widget-title">Petronect hoje</h3>
            </div>
          </div>

          {onNavigateToMonitoring && (
            <button 
              className="btn-widget-action"
              onClick={onNavigateToMonitoring}
              title="Acessar painel de monitoramento do Petronect"
            >
              <span>Gerenciar Conector</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        <p className="widget-subtitle">
          Varredura automatizada de oportunidades abertas para propostas e editais públicos em tempo real.
        </p>

        {/* 5 Métricas Obrigatórias da Especificação (Item 33) */}
        <div className="petronect-today-metrics-grid">
          <div className="today-metric-box">
            <span className="t-metric-label">Monitoradas</span>
            <span className="t-metric-num">{monitoradasCount}</span>
            <span className="t-metric-sub">total no radar</span>
          </div>

          <div className="today-metric-box box-novas">
            <span className="t-metric-label">Novas</span>
            <span className="t-metric-num text-teal">{novasCount}</span>
            <span className="t-metric-sub">aguardando triagem</span>
          </div>

          <div className="today-metric-box box-relevantes">
            <span className="t-metric-label">Relevantes</span>
            <span className="t-metric-num text-indigo">{relevantesCount}</span>
            <span className="t-metric-sub">aderência &gt; 70%</span>
          </div>

          <div className="today-metric-box box-criticas">
            <span className="t-metric-label">Críticas</span>
            <span className="t-metric-num text-critical">{criticasCount}</span>
            <span className="t-metric-sub">ação imediata (&gt;90%)</span>
          </div>

          <div className="today-metric-box box-urgentes">
            <span className="t-metric-label">Encerrando em até 7 dias</span>
            <span className="t-metric-num text-amber">{encerramento7DiasCount}</span>
            <span className="t-metric-sub">prazo crítico/urgente</span>
          </div>
        </div>

        <div className="widget-footer-strip">
          <div className="footer-strip-left">
            <ShieldCheck size={13} className="text-teal" />
            <span>Conexão direta a endpoints e dados públicos estruturados do portal oficial.</span>
          </div>
          {onNavigateToOpportunities && (
            <button 
              className="btn-strip-link" 
              onClick={onNavigateToOpportunities}
            >
              <span>Ver todas no Banco de Oportunidades</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* BLOCO 2: RADAR DE PRAZOS (Item 34) */}
      <div className="widget-card deadlines-radar-card">
        <div className="widget-header">
          <div className="widget-title-group">
            <div className="widget-icon-box box-clock">
              <Clock size={18} className="text-amber" />
            </div>
            <div>
              <div className="widget-badge-row">
                <span className="widget-tag-radar">RADAR DE PRAZOS</span>
                <span className="widget-urgent-count">{filteredDeadlines.length} próximas</span>
              </div>
              <h3 className="widget-title">Prazos próximos</h3>
            </div>
          </div>

          {/* Filtros rápidos: 3 dias, 7 dias, 15 dias */}
          <div className="deadline-filter-pills">
            <button 
              className={`pill-btn ${selectedFilterDays === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedFilterDays('ALL')}
            >
              Todos (15d)
            </button>
            <button 
              className={`pill-btn ${selectedFilterDays === 3 ? 'active pill-crit' : ''}`}
              onClick={() => setSelectedFilterDays(3)}
            >
              ≤ 3 dias (Crítico)
            </button>
            <button 
              className={`pill-btn ${selectedFilterDays === 7 ? 'active pill-urg' : ''}`}
              onClick={() => setSelectedFilterDays(7)}
            >
              ≤ 7 dias (Urgente)
            </button>
            <button 
              className={`pill-btn ${selectedFilterDays === 15 ? 'active pill-atn' : ''}`}
              onClick={() => setSelectedFilterDays(15)}
            >
              ≤ 15 dias (Atenção)
            </button>
          </div>
        </div>

        <p className="widget-subtitle">
          Ordenação prioritária pelas oportunidades mais próximas do encerramento para assegurar tempo hábil de impugnação, proposta e documentação.
        </p>

        {/* Lista de Prazos Próximos */}
        <div className="deadlines-list">
          {filteredDeadlines.length === 0 ? (
            <div className="empty-deadlines-box">
              <p>Nenhuma oportunidade encontrada nesta faixa de prazo.</p>
            </div>
          ) : (
            filteredDeadlines.slice(0, 5).map((opp) => {
              const urg = OpportunityService.getDeadlineUrgency(opp.daysLeft);
              return (
                <div 
                  key={opp.id} 
                  className={`deadline-item-row border-${urg.level}`}
                  onClick={() => onSelectOpportunity && onSelectOpportunity(opp)}
                >
                  <div className="deadline-col-urgency">
                    <span className={`urgency-badge urgency-badge-${urg.level}`}>
                      {opp.daysLeft === 0 ? 'Encerra Hoje!' : `${opp.daysLeft} dias`}
                    </span>
                    <span className="urgency-label-sub">{urg.label}</span>
                  </div>

                  <div className="deadline-col-info">
                    <div className="deadline-info-top">
                      <span className="deadline-opp-number mono">{opp.number}</span>
                      <span className="deadline-client-tag">{opp.client}</span>
                      <span className="deadline-company-tag">{opp.recommendedCompany}</span>
                    </div>
                    <p className="deadline-opp-title" title={opp.title}>
                      {opp.title}
                    </p>
                  </div>

                  <div className="deadline-col-right">
                    <div className="deadline-score-pill">
                      <Sparkles size={11} />
                      <span>{opp.score}%</span>
                    </div>
                    <span className="deadline-end-date mono">{opp.endDate}</span>
                    <ChevronRight size={15} className="deadline-arrow-icon" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
