import React, { useState, useEffect } from 'react';
import { 
  ScanSearch, 
  Target, 
  Flame, 
  FileSearch, 
  FileEdit, 
  Award,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import './MetricsCards.css';

export default function MetricsCards({ onFilterStatus }) {
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());

  useEffect(() => {
    const unsub = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, () => {
      setOpportunities(OpportunityService.listAll());
    });
    return unsub;
  }, []);

  const analyzedCount = opportunities.length;
  const relevantCount = opportunities.filter(o => (o.score || o.adherenceScore || 0) >= 70).length;
  const highPriorityCount = opportunities.filter(o => (o.score || o.adherenceScore || 0) >= 90).length;
  const inAnalysisCount = opportunities.filter(o => 
    o.status === 'Em análise' || 
    o.canonicalStatus === 'GO_REVIEW' || 
    (o.decision === 'GO' && !o.approvedBy)
  ).length;
  const proposalsInPrepCount = opportunities.filter(o => 
    o.status === 'Proposta' || 
    o.canonicalStatus === 'PROPOSAL'
  ).length;
  const activeParticipationsCount = opportunities.filter(o => 
    o.status === 'Participando' || 
    o.canonicalStatus === 'SESSION' || 
    o.status === 'Ganha' || 
    o.canonicalStatus === 'WON'
  ).length;

  const cards = [
    {
      id: 'analyzed',
      title: 'Oportunidades analisadas',
      value: analyzedCount,
      subtext: 'Fontes oficiais sincronizadas',
      icon: ScanSearch,
      theme: 'blue',
      trend: 'Ao Vivo',
      tag: 'Radar Oficial'
    },
    {
      id: 'relevant',
      title: 'Oportunidades relevantes',
      value: relevantCount,
      subtext: 'Aderência aos serviços cadastrados',
      icon: Target,
      theme: 'teal',
      trend: 'Match Semântico',
      tag: 'Relevantes'
    },
    {
      id: 'high-priority',
      title: 'Alta prioridade',
      value: highPriorityCount,
      subtext: 'Aderência superior a 90%',
      icon: Flame,
      theme: 'critical',
      trend: 'Ação Imediata',
      tag: 'Crítica'
    },
    {
      id: 'in-analysis',
      title: 'Em análise / Alçada',
      value: inAnalysisCount,
      subtext: 'Aguardando parecer ou alçada',
      icon: FileSearch,
      theme: 'amber',
      trend: 'Em triagem',
      tag: 'Governança'
    },
    {
      id: 'proposals',
      title: 'Propostas em preparação',
      value: proposalsInPrepCount,
      subtext: 'Precificação e composição BDI',
      icon: FileEdit,
      theme: 'indigo',
      trend: 'Em elaboração',
      tag: 'Pipeline'
    },
    {
      id: 'participating',
      title: 'Participações / Disputa',
      value: activeParticipationsCount,
      subtext: 'Sessão pública ou homologadas',
      icon: Award,
      theme: 'emerald',
      trend: 'Em disputa',
      tag: 'Disputa'
    }
  ];

  return (
    <div className="metrics-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div 
            key={card.id} 
            className={`metric-card theme-${card.theme}`}
            onClick={() => onFilterStatus && onFilterStatus(card.id)}
          >
            <div className="metric-header">
              <div className="metric-icon-wrap">
                <Icon size={20} className="metric-icon" />
              </div>
              <span className="metric-tag">{card.tag}</span>
            </div>

            <div className="metric-body">
              <span className="metric-number">{card.value}</span>
              <h3 className="metric-label">{card.title}</h3>
            </div>

            <div className="metric-footer">
              <span className="metric-subtext">{card.subtext}</span>
              <span className="metric-trend">
                <ArrowUpRight size={13} />
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
