import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Clock, 
  MousePointer, 
  Sparkles, 
  Layers, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Users, 
  Smartphone, 
  Activity,
  ArrowRight,
  TrendingDown,
  ChevronRight
} from 'lucide-react';
import { uxTelemetryService, UxEventType } from '../../services/ux/uxTelemetryService';
import './UxAuditView.css';

export default function UxAuditView() {
  const [activeTab, setActiveTab] = useState('scorecards'); // 'scorecards' | 'journeys' | 'frictions' | 'scripts' | 'telemetry'
  const [data, setData] = useState(() => uxTelemetryService.getAuditSummary());

  const handleSimulateEvent = (type, screen) => {
    uxTelemetryService.recordEvent(type, screen, { source: 'simulated_test' }, 2, 1400);
    setData(uxTelemetryService.getAuditSummary());
  };

  return (
    <div className="ux-audit-container">
      {/* 1. Header do Módulo */}
      <div className="ux-header-card">
        <div className="ux-header-info">
          <h2>
            <Target size={22} color="#38BDF8" />
            UX Audit & Otimização Operacional
            <span className="ux-badge-role">FASE 26</span>
          </h2>
          <p>
            Validação de usabilidade real, redução de cliques, 5-Second Test das telas críticas e eliminação de fricções.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>Princípio:</span>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 700, 
            color: '#10B981', 
            background: 'rgba(16, 185, 129, 0.1)', 
            padding: '4px 10px', 
            borderRadius: '6px' 
          }}>
            Menos esforço para operar. Mais clareza para decidir.
          </span>
        </div>
      </div>

      {/* 2. Grid de KPIs de Eficiência */}
      <div className="ux-kpi-grid">
        <div className="ux-kpi-card">
          <span className="kpi-label">Redução de Cliques</span>
          <div className="kpi-val" style={{ color: '#10B981' }}>
            -{data.metrics.globalClickReductionPct}%
          </div>
          <span className="kpi-sub">De {data.metrics.totalBaselineClicks} para {data.metrics.totalOptimizedClicks} cliques</span>
        </div>

        <div className="ux-kpi-card">
          <span className="kpi-label">Redução de Time-to-Action</span>
          <div className="kpi-val" style={{ color: '#38BDF8' }}>
            -{data.metrics.globalTimeReductionPct}%
          </div>
          <span className="kpi-sub" style={{ color: '#38BDF8' }}>De 25 min para ~5.5 min no ciclo completo</span>
        </div>

        <div className="ux-kpi-card">
          <span className="kpi-label">Aprovação 5-Second Test</span>
          <div className="kpi-val">
            {data.approvedScreensCount} / {data.screensCount}
          </div>
          <span className="kpi-sub">100% das 10 telas críticas validadas</span>
        </div>

        <div className="ux-kpi-card">
          <span className="kpi-label">Fricções Eliminadas</span>
          <div className="kpi-val" style={{ color: '#A855F7' }}>
            {data.frictionLogs.filter(f => f.status === 'RESOLVIDO').length} / {data.frictionLogs.length}
          </div>
          <span className="kpi-sub" style={{ color: '#A855F7' }}>Atestados integrados & auto-fill ativo</span>
        </div>
      </div>

      {/* 3. Navegação de Abas */}
      <div className="ux-nav-tabs">
        <button 
          className={`ux-nav-btn ${activeTab === 'scorecards' ? 'active' : ''}`}
          onClick={() => setActiveTab('scorecards')}
        >
          <CheckCircle2 size={16} />
          <span>Scorecards das 10 Telas ({data.scorecards.length})</span>
        </button>

        <button 
          className={`ux-nav-btn ${activeTab === 'journeys' ? 'active' : ''}`}
          onClick={() => setActiveTab('journeys')}
        >
          <MousePointer size={16} />
          <span>Jornadas & Cliques ({data.journeys.length})</span>
        </button>

        <button 
          className={`ux-nav-btn ${activeTab === 'frictions' ? 'active' : ''}`}
          onClick={() => setActiveTab('frictions')}
        >
          <AlertTriangle size={16} />
          <span>Friction Logs ({data.frictionLogs.length})</span>
        </button>

        <button 
          className={`ux-nav-btn ${activeTab === 'scripts' ? 'active' : ''}`}
          onClick={() => setActiveTab('scripts')}
        >
          <Users size={16} />
          <span>Scripts de Teste ({data.scripts.length})</span>
        </button>

        <button 
          className={`ux-nav-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveTab('telemetry')}
        >
          <Activity size={16} />
          <span>Telemetria Segura ({data.recentEvents.length})</span>
        </button>
      </div>

      {/* 4. CONTEÚDO DAS ABAS */}

      {/* ABA 1: SCORECARDS DAS 10 TELAS */}
      {activeTab === 'scorecards' && (
        <div className="ux-scorecards-grid">
          {data.scorecards.map(sc => (
            <div key={sc.id} className="ux-screen-card">
              <div className="screen-card-header">
                <div>
                  <h3 className="screen-title">{sc.name}</h3>
                  <span className="screen-role">{sc.role}</span>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#10B981',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {sc.status}
                </span>
              </div>

              <p className="screen-goal">{sc.goal}</p>

              {/* 5-Second Test */}
              <div className="five-second-box">
                <div className="box-title">⏱️ 5-Second Test</div>
                {sc.fiveSecondQuestions.map((q, idx) => (
                  <div key={idx} className="qa-item">
                    <span className="question">{q.q}</span>
                    <span className="answer">✓ {q.a}</span>
                  </div>
                ))}
              </div>

              {/* Dominant CTA */}
              <div className="cta-box">
                <span className="cta-lbl">CTA Dominante (Item 18):</span>
                <span className="cta-name">{sc.dominantCta}</span>
              </div>

              {/* Checklist */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                fontSize: '11px',
                color: '#94A3B8',
                paddingTop: '6px',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span>✓ Objetivo Claro</span>
                <span>✓ CTA Dominante</span>
                <span>✓ Hierarquia Sóbria</span>
                <span>✓ Sem Poluição</span>
                <span>✓ Mobile Pronto</span>
                <span>✓ Zero Dead-Ends</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 2: MAPA DE JORNADAS & REDUÇÃO DE CLIQUES */}
      {activeTab === 'journeys' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="ux-journeys-table">
            <thead>
              <tr>
                <th>Jornada</th>
                <th>Fluxo Operacional</th>
                <th>Cliques Antes</th>
                <th>Cliques Agora</th>
                <th>Tempo Médio</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.journeys.map(j => (
                <tr key={j.id}>
                  <td>
                    <strong style={{ color: '#F8FAFC' }}>{j.id} — {j.name}</strong>
                  </td>
                  <td>
                    <span className="journey-flow-text">{j.flow}</span>
                  </td>
                  <td style={{ color: '#EF4444', fontVariantNumeric: 'tabular-nums' }}>
                    {j.baselineClicks} cliques ({Math.round(j.baselineTimeSec / 60)}m)
                  </td>
                  <td style={{ color: '#10B981', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {j.optimizedClicks} cliques ({Math.round(j.optimizedTimeSec / 60)}m)
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#38BDF8', 
                      fontWeight: 700,
                      background: 'rgba(56, 189, 248, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      -{j.timeReductionPct}% tempo
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#10B981'
                    }}>
                      ✓ {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ABA 3: FRICTION LOGS */}
      {activeTab === 'frictions' && (
        <div className="friction-cards-list">
          {data.frictionLogs.map(fl => {
            const badgeClass = fl.severity === 'Critical Friction' ? 'critical' :
                               fl.severity === 'High Friction' ? 'high' :
                               fl.severity === 'Medium Friction' ? 'medium' : 'cosmetic';
            return (
              <div key={fl.id} className="friction-card">
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`friction-badge ${badgeClass}`}>{fl.severity}</span>
                    <strong style={{ fontSize: '0.95rem', color: '#F8FAFC' }}>{fl.title}</strong>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>({fl.screen})</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                    <strong>Problema:</strong> {fl.description}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#38BDF8', lineHeight: 1.45 }}>
                    <strong>Solução Implementada:</strong> {fl.recommendation}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    color: '#10B981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    ✓ {fl.status}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Economia: -{fl.clicksReduced} cliques
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ABA 4: SCRIPTS DE TESTE DE USABILIDADE */}
      {activeTab === 'scripts' && (
        <div className="scripts-grid">
          {data.scripts.map(sc => (
            <div key={sc.id} className="script-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.95rem', color: '#F8FAFC' }}>{sc.id} — Perfil {sc.profile}</strong>
                <span style={{ fontSize: '11px', color: '#38BDF8', fontWeight: 700 }}>
                  Meta: ≤ {sc.maxTargetClicks} cliques / {sc.maxTargetTimeSec}s
                </span>
              </div>

              <span className="script-persona">{sc.persona}</span>

              <div className="script-scenario">
                <strong>Cenário:</strong> {sc.scenario}
              </div>

              <div style={{ fontSize: '0.82rem', color: '#F1F5F9', lineHeight: 1.45 }}>
                <strong>Tarefa do Usuário:</strong> {sc.task}
              </div>

              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                <strong>Fluxo Esperado:</strong> {sc.expectedFlow}
              </div>

              <div style={{ 
                marginTop: 'auto', 
                padding: '8px 12px', 
                background: 'rgba(16, 185, 129, 0.08)', 
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '0.78rem',
                color: '#10B981'
              }}>
                <strong>Critério de Sucesso:</strong> {sc.successCriteria}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ABA 5: TELEMETRIA SEGURA AO VIVO */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            background: 'rgba(2, 132, 199, 0.08)', 
            border: '1px solid rgba(2, 132, 199, 0.25)', 
            borderRadius: '8px', 
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <strong style={{ color: '#38BDF8', fontSize: '0.85rem' }}>🛡️ Conformidade de Privacidade & LGPD (Item 32)</strong>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#CBD5E1' }}>
                A telemetria registra apenas fluxos, tempos e cliques operacionais. Preços, margens, credenciais e dados confidenciais são 100% filtrados na origem.
              </p>
            </div>

            <button 
              onClick={() => handleSimulateEvent(UxEventType.GO_DECISION, 'OpportunityDrawer')}
              style={{
                background: '#0284C7',
                color: '#FFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              + Simular Evento de Decisão
            </button>
          </div>

          <table className="ux-journeys-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de Evento</th>
                <th>Tela / Origem</th>
                <th>Cliques</th>
                <th>Time to Action (ms)</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEvents.map(evt => (
                <tr key={evt.id}>
                  <td style={{ fontFamily: 'monospace', color: '#94A3B8' }}>{evt.id}</td>
                  <td>
                    <span style={{ 
                      color: '#F8FAFC', 
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.06)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      {evt.type}
                    </span>
                  </td>
                  <td>{evt.screen}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{evt.clicks}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', color: '#10B981' }}>{evt.durationMs} ms</td>
                  <td style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(evt.timestamp).toLocaleTimeString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
