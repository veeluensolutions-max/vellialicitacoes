import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  FileText, 
  FileSpreadsheet, 
  ExternalLink,
  ShieldAlert,
  Target,
  Bot
} from 'lucide-react';
import { mvpTaskService } from '../services/mvp/mvpTaskService';
import { mvpAlertService } from '../services/mvp/mvpAlertService';
import { MvpScoreService } from '../services/mvp/mvpScoreService';
import { priorityOpportunities } from '../data/mockData';

export default function OperationalDashboardView({ 
  onSelectOpportunity, 
  onNavigateToTab, 
  onOpenCopilot 
}) {
  const pendingTasks = mvpTaskService.getPendingTasks();
  const urgentTasks = mvpTaskService.getUrgentTasks();
  const alerts = mvpAlertService.getAlerts();

  // Top 5 Oportunidades por Aderência e Prioridade
  const top5Opportunities = [...priorityOpportunities]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);

  // Prazos segmentados
  const deadlinesToday = priorityOpportunities.filter(o => o.daysLeft <= 1);
  const deadlines3Days = priorityOpportunities.filter(o => o.daysLeft > 1 && o.daysLeft <= 3);
  const deadlines7Days = priorityOpportunities.filter(o => o.daysLeft > 3 && o.daysLeft <= 7);

  // Top 5 KPIs Consolidados (Item 12)
  const topKpis = [
    {
      id: 'novas',
      label: 'Novas oportunidades',
      value: '14',
      subtext: 'Petronect Público (Hoje)',
      icon: Sparkles,
      color: '#00E5C9',
      tab: 'radar'
    },
    {
      id: 'alta_prioridade',
      label: 'Alta prioridade',
      value: '4',
      subtext: 'Aderência superior a 90%',
      icon: Flame,
      color: '#EF4444',
      tab: 'oportunidades'
    },
    {
      id: 'propostas',
      label: 'Propostas em andamento',
      value: '5',
      subtext: '3 em revisão de margem',
      icon: FileSpreadsheet,
      color: '#3B82F6',
      tab: 'propostas'
    },
    {
      id: 'prazos_criticos',
      label: 'Prazos críticos',
      value: '3',
      subtext: 'Vencem em até 3 dias',
      icon: Clock,
      color: '#F59E0B',
      tab: 'oportunidades'
    },
    {
      id: 'pendencias',
      label: 'Pendências operacionais',
      value: pendingTasks.length,
      subtext: 'Exigem ação imediata',
      icon: AlertCircle,
      color: '#8B5CF6',
      tab: 'oportunidades'
    }
  ];

  // Bloco Precisa da Sua Atenção (Item 14)
  const actionItems = [
    {
      title: '3 oportunidades para analisar',
      desc: 'Licenciamento Santos, Búzios e Auditoria Macaé aguardam deliberação Go/No-Go.',
      action: 'Analisar Oportunidades',
      icon: Target,
      tab: 'oportunidades'
    },
    {
      title: '2 propostas com prazo curto',
      desc: 'PROP-7004218902 e PROP-7004218903 encerram envio em 48h.',
      action: 'Revisar Propostas',
      icon: FileSpreadsheet,
      tab: 'propostas'
    },
    {
      title: '1 documento vencendo',
      desc: 'CND Federal da Veeluen Solutions expira em 5 dias.',
      action: 'Ver Centro de Capacidade',
      icon: FileText,
      tab: 'documentos'
    },
    {
      title: '1 follow-up pendente',
      desc: 'Retorno sobre esclarecimento técnico com Pregoeiro Petrobras.',
      action: 'Acessar Relacionamento',
      icon: Calendar,
      tab: 'relacionamento'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner de Operação Simplificada Vellia 1.0 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.35))',
        border: '1px solid rgba(0, 229, 201, 0.25)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(0, 229, 201, 0.15)',
              color: '#00E5C9',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              letterSpacing: '0.05em'
            }}>
              VELLIA LICITAÇÕES 1.0 • PRODUÇÃO
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              Varredura Ativa • Petronect Público
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF', margin: '0 0 6px 0' }}>
            Painel Operacional Diário
          </h2>
          <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
            Resumo executivo do dia: oportunidades identificadas, prazos prioritários e pendências documentais que exigem ação da sua equipe hoje.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onOpenCopilot && onOpenCopilot()}
            style={{
              background: 'linear-gradient(135deg, #00E5C9, #1E3A8A)',
              color: '#0B132B',
              fontWeight: 700,
              border: 'none',
              borderRadius: '10px',
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <Bot size={16} />
            <span>Perguntar ao Vellia</span>
          </button>
        </div>
      </div>

      {/* TOP 5 KPIS (Item 12 - Máximo 5) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {topKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              onClick={() => onNavigateToTab && onNavigateToTab(kpi.tab)}
              style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: '12px',
                padding: '18px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = kpi.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.15)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{kpi.label}</span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: `${kpi.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: kpi.color
                }}>
                  <Icon size={18} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFF' }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                {kpi.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* BLOCO: PRECISA DA SUA ATENÇÃO (Item 14) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '16px',
        padding: '20px 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <ShieldAlert size={20} style={{ color: '#EF4444' }} />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#FFF' }}>
            Precisa da sua atenção
          </h3>
          <span style={{
            fontSize: '11px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#EF4444',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            4 AÇÕES PENDENTES
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px'
        }}>
          {actionItems.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.12)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Icon size={16} style={{ color: '#00E5C9' }} />
                    <strong style={{ fontSize: '13px', color: '#F8FAFC' }}>{act.title}</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                    {act.desc}
                  </p>
                </div>

                <button
                  onClick={() => onNavigateToTab && onNavigateToTab(act.tab)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(0, 229, 201, 0.3)',
                    color: '#00E5C9',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    alignSelf: 'flex-start'
                  }}
                >
                  <span>{act.action}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOCO CENTRAL DUPLO: TOP 5 OPORTUNIDADES + BLOCO DE PRAZOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* TOP 5 OPORTUNIDADES (Item 15) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#FFF', fontWeight: 700 }}>
                Top 5 Oportunidades Prioritárias
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
                Classificadas por aderência semântica e prazo
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('oportunidades')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#00E5C9',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Ver todas (14)</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {top5Opportunities.map((opp) => {
              const rec = MvpScoreService.getConsolidatedRecommendation(opp);
              return (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity && onSelectOpportunity(opp)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#00E5C9';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.12)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '65%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'monospace' }}>
                        {opp.id}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        background: 'rgba(0, 229, 201, 0.12)',
                        color: '#00E5C9',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}>
                        {opp.recommendedCompany || 'Veeluen'}
                      </span>
                    </div>
                    <strong style={{ fontSize: '13px', color: '#F8FAFC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {opp.title}
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      {opp.client} • {opp.estimatedValue}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#00E5C9' }}>
                        {opp.score}%
                      </div>
                      <div style={{ fontSize: '10px', color: opp.daysLeft <= 3 ? '#EF4444' : '#94A3B8' }}>
                        {opp.daysLeft} dias rest.
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOpportunity && onSelectOpportunity(opp);
                      }}
                      style={{
                        background: 'rgba(0, 229, 201, 0.15)',
                        border: '1px solid rgba(0, 229, 201, 0.3)',
                        color: '#00E5C9',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Ação
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BLOCO DE PRAZOS: HOJE, 3 DIAS, 7 DIAS (Item 16) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#FFF', fontWeight: 700 }}>
              Radar de Prazos Críticos
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
              Acompanhamento de vencimentos e propostas
            </p>
          </div>

          {/* Hoje */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '10px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#EF4444' }}>🔴 HOJE (Até 24h)</span>
              <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700 }}>{deadlinesToday.length} Ocorrências</span>
            </div>
            {deadlinesToday.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Nenhum prazo fatal vencendo nas próximas 24h.</p>
            ) : (
              deadlinesToday.map(d => (
                <div key={d.id} style={{ fontSize: '12px', color: '#F8FAFC' }}>
                  • {d.title} ({d.client})
                </div>
              ))
            )}
          </div>

          {/* 3 Dias */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '10px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#F59E0B' }}>🟡 PRÓXIMOS 3 DIAS</span>
              <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700 }}>{deadlines3Days.length} Licitações</span>
            </div>
            {deadlines3Days.map(d => (
              <div 
                key={d.id} 
                onClick={() => onSelectOpportunity && onSelectOpportunity(d)}
                style={{ 
                  fontSize: '12px', 
                  color: '#CBD5E1', 
                  cursor: 'pointer',
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
                }}
              >
                • <strong>{d.title}</strong> — Restam {d.daysLeft} dias ({d.estimatedValue})
              </div>
            ))}
          </div>

          {/* 7 Dias */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '10px',
            padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#60A5FA' }}>🔵 PRÓXIMOS 7 DIAS</span>
              <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700 }}>{deadlines7Days.length} Licitações</span>
            </div>
            {deadlines7Days.map(d => (
              <div 
                key={d.id} 
                onClick={() => onSelectOpportunity && onSelectOpportunity(d)}
                style={{ 
                  fontSize: '12px', 
                  color: '#CBD5E1', 
                  cursor: 'pointer',
                  padding: '4px 0'
                }}
              >
                • {d.title} — {d.daysLeft} dias restantes
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
