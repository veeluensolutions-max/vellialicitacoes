import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Power, 
  Clock, 
  Globe2, 
  Sparkles, 
  Flame, 
  Activity, 
  CalendarClock, 
  ArrowRight, 
  BarChart2, 
  Sliders,
  CheckCircle2,
  TrendingUp,
  Layers,
  RotateCw
} from 'lucide-react';
import { AgentOrchestrator, AgentStatus } from '../services/agent/agentOrchestrator';
import { AgentLogService } from '../services/agent/agentLogService';
import AgentExecutionModal from './AgentExecutionModal';
import './VelliaAgentCard.css';

export default function VelliaAgentCard({ onNavigateToReports, onNavigateToAlerts }) {
  const [config, setConfig] = useState(() => AgentOrchestrator.getConfig());
  const [status, setStatus] = useState(() => AgentOrchestrator.getStatus());
  const [activities, setActivities] = useState(() => AgentOrchestrator.getRecentActivities());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('MANUAL'); // 'MANUAL' | 'SIMULATION'

  const metrics30 = AgentLogService.getMetrics30Days();

  const handleToggleAgent = () => {
    const nextStatus = AgentOrchestrator.togglePause();
    setStatus(nextStatus);
    setConfig(AgentOrchestrator.getConfig());
  };

  const handleExecutionSuccess = () => {
    setConfig(AgentOrchestrator.getConfig());
    setStatus(AgentOrchestrator.getStatus());
    setActivities(AgentOrchestrator.getRecentActivities());
  };

  const getStatusDisplay = () => {
    switch (status) {
      case AgentStatus.RUNNING:
        return { label: 'Executando agora', pillClass: 'status-pill-running', dotClass: 'dot-running' };
      case AgentStatus.PAUSED:
        return { label: 'Agente pausado', pillClass: 'status-pill-paused', dotClass: 'dot-paused' };
      case AgentStatus.DEGRADED:
        return { label: 'Parcialmente operacional', pillClass: 'status-pill-degraded', dotClass: 'dot-degraded' };
      case AgentStatus.ERROR:
        return { label: 'Falha técnica', pillClass: 'status-pill-error', dotClass: 'dot-error' };
      case AgentStatus.ACTIVE:
      default:
        return { label: 'Agente ativo', pillClass: 'status-pill-active', dotClass: 'dot-active' };
    }
  };

  const st = getStatusDisplay();

  return (
    <div className="vellia-agent-section">
      <div className="agent-hero-card">
        {/* Topo do Card */}
        <div className="agent-card-top">
          <div className="agent-brand-col">
            <div className="agent-core-badge">
              <Bot size={26} className="text-teal" />
            </div>
            <div>
              <div className="agent-tag-line">
                <span className="agent-badge-title">NÚCLEO AUTÔNOMO</span>
                <span className={`agent-status-pill-hero ${st.pillClass}`}>
                  <span className={`agent-dot ${st.dotClass}`} />
                  {st.label}
                </span>
                <span className="agent-tz-badge">Recife (06:30)</span>
              </div>
              <h2 className="agent-main-headline">Vellia Agent — Monitoramento Contínuo</h2>
              <p className="agent-tag-desc">
                Inteligência autônoma que varre fontes públicas diariamente, analisa objetos, classifica aderência semântica e gera o Radar Diário.
              </p>
            </div>
          </div>

          <div className="agent-cta-group">
            <button 
              className="btn-agent-run-now"
              onClick={() => {
                setModalMode('MANUAL');
                setModalOpen(true);
              }}
              title="Dispara ciclo imediato do agente"
            >
              <Play size={15} fill="currentColor" />
              <span>Executar agente agora</span>
            </button>

            <button 
              className="btn-agent-simulate"
              onClick={() => {
                setModalMode('SIMULATION');
                setModalOpen(true);
              }}
              title="Simula a rotina matinal das 06:30 com oportunidade de teste (Item 45)"
            >
              <RotateCw size={14} />
              <span>Simular execução diária</span>
            </button>

            <button 
              className={`btn-agent-toggle ${status === AgentStatus.PAUSED ? 'is-paused' : ''}`}
              onClick={handleToggleAgent}
              title={status === AgentStatus.PAUSED ? 'Reativar monitoramento automático' : 'Pausar monitoramento'}
            >
              <Power size={14} />
              <span>{status === AgentStatus.PAUSED ? 'Reativar' : 'Pausar'}</span>
            </button>
          </div>
        </div>

        {/* Grade de Telemetria do Agente (Item 29) */}
        <div className="agent-telemetry-grid">
          <div className="telemetry-box">
            <div className="t-box-header">
              <span className="t-box-lbl">Última Execução</span>
              <Clock size={13} className="text-muted" />
            </div>
            <span className="t-box-val mono">{config.lastRunAt || '07/10/2026 às 06:30'}</span>
            <span className="t-box-sub text-green">Concluída com 100% de sucesso</span>
          </div>

          <div className="telemetry-box">
            <div className="t-box-header">
              <span className="t-box-lbl">Próxima Execução</span>
              <CalendarClock size={13} className="text-muted" />
            </div>
            <span className="t-box-val mono">{config.nextRunAt || 'Amanhã às 06:30'}</span>
            <span className="t-box-sub">Rotina diária automática ativa</span>
          </div>

          <div className="telemetry-box">
            <div className="t-box-header">
              <span className="t-box-lbl">Fontes Ativas</span>
              <Globe2 size={13} className="text-teal" />
            </div>
            <span className="t-box-val text-teal">1 ativa</span>
            <span className="t-box-sub">Petronect Público (Oficial)</span>
          </div>

          <div className="telemetry-box">
            <div className="t-box-header">
              <span className="t-box-lbl">Novas Hoje</span>
              <Sparkles size={13} className="text-blue" />
            </div>
            <span className="t-box-val text-blue">18</span>
            <span className="t-box-sub">identificadas e normalizadas</span>
          </div>

          <div className="telemetry-box">
            <div className="t-box-header">
              <span className="t-box-lbl">Prioridades Críticas</span>
              <Flame size={13} className="text-critical" />
            </div>
            <span className="t-box-val text-critical">2</span>
            <span className="t-box-sub">score de aderência &gt; 90%</span>
          </div>
        </div>

        {/* Divisão: Feed de Atividades Recentes + Painel dos Últimos 30 Dias (Itens 30, 36, 37) */}
        <div className="agent-dual-panel">
          {/* Coluna 1: Feed de Atividades Recentes (Item 30) */}
          <div className="panel-sub-card">
            <div className="sub-card-header">
              <div className="sub-card-title-group">
                <Activity size={16} className="text-teal" />
                <h4 className="sub-card-title">Atividade Recente do Agente</h4>
              </div>
              <span className="sub-card-tag">Feed em Tempo Real</span>
            </div>

            <div className="activity-feed-list">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="activity-item-row">
                  <span className="activity-time mono">{act.time}</span>
                  <div className="activity-dot-line">
                    <span className={`act-dot act-dot-${act.type}`} />
                    <span className="act-line" />
                  </div>
                  <p className="activity-text">{act.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 2: Painel dos Últimos 30 Dias (Itens 36 e 37) */}
          <div className="panel-sub-card">
            <div className="sub-card-header">
              <div className="sub-card-title-group">
                <BarChart2 size={16} className="text-indigo" />
                <h4 className="sub-card-title">Painel Consolidado (Últimos 30 Dias)</h4>
              </div>
              <span className="sub-card-tag">Histórico de Performance</span>
            </div>

            <div className="metrics-30-grid">
              <div className="mini-stat-cell">
                <span className="m-cell-lbl">Total Analisado</span>
                <span className="m-cell-val mono">{metrics30.totalAnalyzed}</span>
              </div>
              <div className="mini-stat-cell">
                <span className="m-cell-lbl">Total Relevante</span>
                <span className="m-cell-val mono text-teal">{metrics30.totalRelevant}</span>
              </div>
              <div className="mini-stat-cell">
                <span className="m-cell-lbl">Alta Prioridade</span>
                <span className="m-cell-val mono text-critical">{metrics30.totalCritical}</span>
              </div>
              <div className="mini-stat-cell">
                <span className="m-cell-lbl">Taxa de Relevância</span>
                <span className="m-cell-val mono text-indigo">{metrics30.relevanceRate}</span>
              </div>
            </div>

            {/* Gráfico Discreto e Leve de Serviços Mais Encontrados (Item 37) */}
            <div className="services-mini-chart">
              <span className="chart-label-sub">Serviços com maior volume capturado:</span>
              <div className="chart-bars-list">
                {metrics30.topServices.slice(0, 3).map((s, idx) => (
                  <div key={idx} className="chart-bar-item">
                    <div className="bar-info-row">
                      <span className="bar-name">{s.name}</span>
                      <span className="bar-count mono">{s.count} editais ({s.pct}%)</span>
                    </div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Execução Manual ou Simulação */}
      <AgentExecutionModal
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onExecutionCompleted={handleExecutionSuccess}
      />
    </div>
  );
}
