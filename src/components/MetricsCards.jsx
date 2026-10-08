import React from 'react';
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
import { systemMetrics } from '../data/mockData';
import './MetricsCards.css';

export default function MetricsCards({ onFilterStatus }) {
  const cards = [
    {
      id: 'analyzed',
      title: 'Oportunidades analisadas hoje',
      value: systemMetrics.analyzedToday,
      subtext: '+28 em relação a ontem',
      icon: ScanSearch,
      theme: 'blue',
      trend: '+17.4%',
      tag: 'Petronect'
    },
    {
      id: 'relevant',
      title: 'Oportunidades relevantes',
      value: systemMetrics.relevantToday,
      subtext: 'Aderência aos serviços cadastrados',
      icon: Target,
      theme: 'teal',
      trend: 'Alta conversão',
      tag: 'Match Semântico'
    },
    {
      id: 'high-priority',
      title: 'Alta prioridade',
      value: systemMetrics.highPriority,
      subtext: 'Aderência superior a 90%',
      icon: Flame,
      theme: 'critical',
      trend: 'Ação Imediata',
      tag: 'Crítica'
    },
    {
      id: 'in-analysis',
      title: 'Em análise',
      value: systemMetrics.inAnalysis,
      subtext: 'Aguardando parecer comercial',
      icon: FileSearch,
      theme: 'amber',
      trend: 'Em triagem',
      tag: 'Comercial'
    },
    {
      id: 'proposals',
      title: 'Propostas em preparação',
      value: systemMetrics.proposalsInPrep,
      subtext: 'Precificação e documentação',
      icon: FileEdit,
      theme: 'indigo',
      trend: 'Em elaboração',
      tag: 'Pipeline'
    },
    {
      id: 'participating',
      title: 'Participações ativas',
      value: systemMetrics.activeParticipations,
      subtext: 'Lances / Aguardando resultado',
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
