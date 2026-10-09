import React from 'react';
import { 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  FileText, 
  FileSpreadsheet, 
  Target, 
  Bot,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
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

  // Top 5 Oportunidades por Aderência e Prioridade
  const top5Opportunities = [...priorityOpportunities]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);

  // Prazos segmentados
  const deadlinesToday = priorityOpportunities.filter(o => o.daysLeft <= 1);
  const deadlines3Days = priorityOpportunities.filter(o => o.daysLeft > 1 && o.daysLeft <= 3);
  const deadlines7Days = priorityOpportunities.filter(o => o.daysLeft > 3 && o.daysLeft <= 7);

  // Saudação contextual baseada no horário
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  // ITENS 21-23: TOP KPIs COMPACTOS COM NÚMEROS TABULARES
  const topKpis = [
    {
      id: 'novas',
      label: 'Novas hoje',
      value: '14',
      comparison: '+3 vs. ontem',
      tab: 'radar'
    },
    {
      id: 'alta_prioridade',
      label: 'Alta prioridade',
      value: '4',
      comparison: 'Aderência > 90%',
      tab: 'oportunidades',
      highlight: true
    },
    {
      id: 'propostas',
      label: 'Propostas em curso',
      value: '5',
      comparison: '2 em precificação',
      tab: 'propostas'
    },
    {
      id: 'prazos_criticos',
      label: 'Prazos críticos',
      value: '3',
      comparison: 'Vencem em até 3d',
      tab: 'oportunidades',
      isWarning: true
    },
    {
      id: 'pendencias',
      label: 'Pendências',
      value: pendingTasks.length,
      comparison: 'Exigem validação',
      tab: 'oportunidades'
    }
  ];

  // ITEM 20: BLOCO PRINCIPAL "PRECISA DA SUA ATENÇÃO"
  const attentionItems = [
    {
      title: '3 oportunidades aguardando análise',
      desc: 'Licenciamento Santos, Búzios e Auditoria Macaé estão sem decisão GO / NO-GO.',
      action: 'Analisar agora',
      tab: 'oportunidades',
      badge: 'URGENTE',
      badgeType: 'warning'
    },
    {
      title: '2 propostas com prazo curto',
      desc: 'Petrobras Búzios e Bacia de Santos encerram envio em 48 horas.',
      action: 'Revisar propostas',
      tab: 'propostas',
      badge: '48H',
      badgeType: 'danger'
    },
    {
      title: '1 documento precisa ser renovado',
      desc: 'CND Federal da Veeluen Solutions expira em 5 dias.',
      action: 'Ver certidão',
      tab: 'documentos',
      badge: '5 DIAS',
      badgeType: 'info'
    },
    {
      title: '1 follow-up pendente',
      desc: 'Retorno sobre esclarecimento técnico com comissão de licitação.',
      action: 'Abrir contato',
      tab: 'relacionamento',
      badge: 'COMERCIAL',
      badgeType: 'neutral'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ITEM 19: SAUDAÇÃO CONTEXTUAL (Quiet Intelligence: sem texto promocional) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--font-size-page-title, 20px)',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {greeting}.
          </h1>
          <p style={{
            fontSize: 'var(--font-size-body, 13px)',
            color: 'var(--brand-slate-400, #94A3B8)',
            margin: '4px 0 0 0'
          }}>
            Você tem <strong>4 itens</strong> que precisam de atenção hoje na operação.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '11px',
            color: 'var(--brand-slate-500, #64748B)',
            fontFeatureSettings: '"tnum"'
          }}>
            Petronect Público • Sincronizado há 12 min
          </span>
          <button
            onClick={() => onOpenCopilot && onOpenCopilot()}
            style={{
              background: 'rgba(2, 132, 199, 0.08)',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              color: 'var(--accent-primary, #0284C7)',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 150ms ease'
            }}
          >
            <Bot size={14} />
            <span>Perguntar ao Vellia</span>
          </button>
        </div>
      </div>

      {/* ITEM 20: BLOCO PRINCIPAL "PRECISA DA SUA ATENÇÃO" */}
      <section style={{
        background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
        border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '18px 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-danger, #EF4444)'
            }} />
            <h2 style={{
              fontSize: 'var(--font-size-card-title, 14px)',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0
            }}>
              Precisa da sua atenção
            </h2>
          </div>
          <span style={{
            fontSize: '11px',
            color: 'var(--brand-slate-400, #94A3B8)',
            fontWeight: 500
          }}>
            4 pendências críticas
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {attentionItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.45)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px'
                }}>
                  <strong style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>
                    {item.title}
                  </strong>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.badgeType === 'danger' ? 'rgba(239, 68, 68, 0.15)' :
                                item.badgeType === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                                'rgba(148, 163, 184, 0.12)',
                    color: item.badgeType === 'danger' ? '#F87171' :
                           item.badgeType === 'warning' ? '#FBBF24' :
                           '#CBD5E1'
                  }}>
                    {item.badge}
                  </span>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--brand-slate-400, #94A3B8)',
                  margin: 0,
                  lineHeight: 1.45
                }}>
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab && onNavigateToTab(item.tab)}
                style={{
                  alignSelf: 'flex-start',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary, #0284C7)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <span>{item.action}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ITENS 21-23: LINHA DE 5 KPIS COMPACTOS */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {topKpis.map((kpi) => (
          <div
            key={kpi.id}
            onClick={() => onNavigateToTab && onNavigateToTab(kpi.tab)}
            style={{
              background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
              border: kpi.highlight ? '1px solid rgba(2, 132, 199, 0.35)' :
                      kpi.isWarning ? '1px solid rgba(245, 158, 11, 0.3)' :
                      '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--brand-slate-400, #94A3B8)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {kpi.label}
            </span>
            <div style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              fontFeatureSettings: '"tnum"',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1
            }}>
              {kpi.value}
            </div>
            <span style={{
              fontSize: '11px',
              color: kpi.highlight ? 'var(--accent-primary, #38BDF8)' :
                     kpi.isWarning ? 'var(--status-warning, #F59E0B)' :
                     'var(--brand-slate-500, #64748B)'
            }}>
              {kpi.comparison}
            </span>
          </div>
        ))}
      </section>

      {/* ITEM 18 & 15: OPORTUNIDADES PRIORITÁRIAS + RADAR DE PRAZOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* TABELA DE OPORTUNIDADES PRIORITÁRIAS (Hierarquia em 5 segundos) */}
        <div style={{
          background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
          border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{
                fontSize: 'var(--font-size-card-title, 14px)',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0
              }}>
                Oportunidades prioritárias
              </h3>
              <p style={{
                fontSize: '11px',
                color: 'var(--brand-slate-400, #94A3B8)',
                margin: '2px 0 0 0'
              }}>
                Classificadas por aderência técnica e prazo de entrega
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('oportunidades')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary, #0284C7)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Ver todas</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {top5Opportunities.map((opp) => {
              const rec = MvpScoreService.getConsolidatedRecommendation(opp);
              const isUrgent = opp.daysLeft <= 3;
              return (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity && onSelectOpportunity(opp)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.4)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                  }}
                >
                  <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: 'var(--brand-slate-400, #94A3B8)'
                      }}>
                        {opp.id}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: 'rgba(148, 163, 184, 0.1)',
                        color: 'var(--brand-slate-300, #CBD5E1)',
                        fontWeight: 600
                      }}>
                        {opp.recommendedCompany || 'Veeluen'}
                      </span>
                    </div>

                    <strong style={{
                      fontSize: '12px',
                      color: '#F8FAFC',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {opp.title}
                    </strong>

                    <span style={{ fontSize: '11px', color: 'var(--brand-slate-500, #64748B)' }}>
                      {opp.client} • {opp.estimatedValue}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: opp.score >= 90 ? 'var(--status-go, #10B981)' : 'var(--accent-primary, #0284C7)',
                        fontVariantNumeric: 'tabular-nums'
                      }}>
                        {opp.score}%
                      </div>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: isUrgent ? 'var(--status-danger, #EF4444)' : 'var(--brand-slate-400, #94A3B8)'
                      }}>
                        {opp.daysLeft}d restantes
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOpportunity && onSelectOpportunity(opp);
                      }}
                      style={{
                        background: 'rgba(2, 132, 199, 0.1)',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        color: 'var(--accent-primary, #0284C7)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RADAR DE PRAZOS (Hoje, 3 dias, 7 dias) */}
        <div style={{
          background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
          border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <h3 style={{
              fontSize: 'var(--font-size-card-title, 14px)',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0
            }}>
              Prazos de entrega
            </h3>
            <p style={{
              fontSize: '11px',
              color: 'var(--brand-slate-400, #94A3B8)',
              margin: '2px 0 0 0'
            }}>
              Organizados por proximidade da sessão pública
            </p>
          </div>

          {/* Hoje */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.18)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-danger, #EF4444)' }}>
                HOJE (Até 24h)
              </span>
              <span style={{ fontSize: '10px', color: 'var(--brand-slate-400, #94A3B8)', fontFeatureSettings: '"tnum"' }}>
                {deadlinesToday.length} edital
              </span>
            </div>
            {deadlinesToday.length === 0 ? (
              <p style={{ fontSize: '11px', color: 'var(--brand-slate-500, #64748B)', margin: 0 }}>
                Nenhum prazo fatal nas próximas 24 horas.
              </p>
            ) : (
              deadlinesToday.map(d => (
                <div key={d.id} style={{ fontSize: '12px', color: '#F8FAFC' }}>
                  • {d.title}
                </div>
              ))
            )}
          </div>

          {/* 3 Dias */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.18)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-warning, #F59E0B)' }}>
                PRÓXIMOS 3 DIAS
              </span>
              <span style={{ fontSize: '10px', color: 'var(--brand-slate-400, #94A3B8)', fontFeatureSettings: '"tnum"' }}>
                {deadlines3Days.length} editais
              </span>
            </div>
            {deadlines3Days.map(d => (
              <div 
                key={d.id} 
                onClick={() => onSelectOpportunity && onSelectOpportunity(d)}
                style={{
                  fontSize: '11px',
                  color: 'var(--brand-slate-300, #CBD5E1)',
                  cursor: 'pointer',
                  padding: '3px 0'
                }}
              >
                • <strong>{d.title}</strong> — {d.daysLeft}d restantes ({d.estimatedValue})
              </div>
            ))}
          </div>

          {/* 7 Dias */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.18)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-info, #60A5FA)' }}>
                PRÓXIMOS 7 DIAS
              </span>
              <span style={{ fontSize: '10px', color: 'var(--brand-slate-400, #94A3B8)', fontFeatureSettings: '"tnum"' }}>
                {deadlines7Days.length} editais
              </span>
            </div>
            {deadlines7Days.map(d => (
              <div 
                key={d.id} 
                onClick={() => onSelectOpportunity && onSelectOpportunity(d)}
                style={{
                  fontSize: '11px',
                  color: 'var(--brand-slate-300, #CBD5E1)',
                  cursor: 'pointer',
                  padding: '3px 0'
                }}
              >
                • {d.title} — {d.daysLeft}d restantes
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
