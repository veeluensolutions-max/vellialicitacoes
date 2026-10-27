import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  Database, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Sliders, 
  ExternalLink, 
  Zap, 
  Wifi,
  Radio,
  Flame,
  Building2
} from 'lucide-react';
import { comprasGovContinuousIngestionWorker, COMPRAS_GOV_WORKER_STATUS } from '../../services/comprasgov/comprasGovContinuousIngestionWorker.js';
import { ComprasGovConnector } from '../../services/multisource/comprasGovConnector.js';
import { EventBus } from '../../services/eventBus.js';
import './ComprasGovWorkerControlModal.css';

export default function ComprasGovWorkerControlModal({ isOpen, onClose }) {
  const [workerState, setWorkerState] = useState(() => comprasGovContinuousIngestionWorker.getState());
  const [isExecutingNow, setIsExecutingNow] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState('');

  // Atualização em tempo real de eventos do Worker
  useEffect(() => {
    const handleStatusUpdate = (state) => {
      setWorkerState(state);
    };

    const unsub = EventBus.subscribe('vellia-comprasgov-worker-status-changed', handleStatusUpdate);
    return unsub;
  }, []);

  // Contagem regressiva para a próxima execução
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (!workerState.nextRunAt || workerState.status === COMPRAS_GOV_WORKER_STATUS.PAUSED) {
        setTimeUntilNext('Em espera (Pausado)');
        return;
      }

      const diff = new Date(workerState.nextRunAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeUntilNext('Varrendo agora...');
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeUntilNext(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, workerState.nextRunAt, workerState.status]);

  if (!isOpen) return null;

  const handleToggleWorker = () => {
    if (workerState.status === COMPRAS_GOV_WORKER_STATUS.ACTIVE || workerState.status === COMPRAS_GOV_WORKER_STATUS.INGESTING) {
      comprasGovContinuousIngestionWorker.pause();
    } else {
      comprasGovContinuousIngestionWorker.start();
    }
    setWorkerState(comprasGovContinuousIngestionWorker.getState());
  };

  const handleExecuteNow = async () => {
    setIsExecutingNow(true);
    try {
      await comprasGovContinuousIngestionWorker.triggerImmediateIngestion();
      setWorkerState(comprasGovContinuousIngestionWorker.getState());
    } finally {
      setIsExecutingNow(false);
    }
  };

  const handleChangeFrequency = (e) => {
    const mins = Number(e.target.value);
    comprasGovContinuousIngestionWorker.setIntervalMinutes(mins);
    setWorkerState(comprasGovContinuousIngestionWorker.getState());
  };

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await ComprasGovConnector.checkHealth();
      setHealthStatus(res);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const isIngesting = workerState.status === COMPRAS_GOV_WORKER_STATUS.INGESTING || isExecutingNow;
  const isActive = workerState.status === COMPRAS_GOV_WORKER_STATUS.ACTIVE;

  return (
    <div className="cgov-worker-backdrop" onClick={onClose}>
      <div className="cgov-worker-modal" onClick={e => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="cgov-worker-header">
          <div className="cgov-worker-title-area">
            <div className="cgov-worker-icon-badge">
              <Building2 size={20} className={isIngesting ? 'spinning' : ''} />
            </div>
            <div>
              <h2 className="cgov-worker-title">Worker Autônomo Compras.gov.br (Comprasnet)</h2>
              <p className="cgov-worker-subtitle">Varredura de pregões eletrônicos federais, deduplicação e scoring de aderência</p>
            </div>
          </div>
          <button className="cgov-worker-close-btn" onClick={onClose} title="Fechar modal">
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="cgov-worker-body">
          {/* Status Geral em Destaque */}
          <div className={`cgov-worker-status-card status-${workerState.status.toLowerCase()}`}>
            <div className="status-main-col">
              <div className="status-indicator-row">
                <span className={`status-pill ${isActive ? 'pill-active' : isIngesting ? 'pill-ingesting' : 'pill-paused'}`}>
                  <span className="dot" />
                  {isIngesting ? 'Varrendo Compras.gov.br...' : isActive ? 'Operação Contínua Ativa' : 'Varredura Pausada'}
                </span>
                <span className="frequency-label">
                  <Clock size={13} />
                  Frequência: a cada {workerState.intervalMinutes} min
                </span>
              </div>
              <p className="status-log-text">{workerState.lastLogMessage}</p>
            </div>

            <div className="status-actions-col">
              <button 
                className={`btn-action-primary ${isActive || isIngesting ? 'btn-pause' : 'btn-start'}`}
                onClick={handleToggleWorker}
              >
                {isActive || isIngesting ? (
                  <>
                    <Pause size={15} /> Pausar Worker
                  </>
                ) : (
                  <>
                    <Play size={15} /> Ativar Worker
                  </>
                )}
              </button>

              <button 
                className="btn-action-secondary"
                onClick={handleExecuteNow}
                disabled={isIngesting}
              >
                <RefreshCw size={14} className={isIngesting ? 'spinning' : ''} />
                Varredura Imediata
              </button>
            </div>
          </div>

          {/* Grid de Métricas Operacionais */}
          <div className="cgov-metrics-grid">
            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-title">Próxima Varredura</span>
                <Clock size={15} className="metric-icon text-amber" />
              </div>
              <div className="metric-value">{timeUntilNext || '--:--'}</div>
              <div className="metric-sub">
                Última: {workerState.lastRunAt ? new Date(workerState.lastRunAt).toLocaleTimeString('pt-BR') : 'Ainda não executada'}
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-title">Total Capturado</span>
                <Database size={15} className="metric-icon text-blue" />
              </div>
              <div className="metric-value">{workerState.totalCaptured}</div>
              <div className="metric-sub">
                {workerState.totalRuns} ciclos de varredura executados
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-title">Novos Certames</span>
                <Zap size={15} className="metric-icon text-purple" />
              </div>
              <div className="metric-value text-purple">+{workerState.totalNew}</div>
              <div className="metric-sub">
                Deduplicados contra base existente
              </div>
            </div>

            <div className="metric-box">
              <div className="metric-header">
                <span className="metric-title">Alta Aderência</span>
                <Flame size={15} className="metric-icon text-emerald" />
              </div>
              <div className="metric-value text-emerald">{workerState.totalRelevant}</div>
              <div className="metric-sub">
                Score ≥ 75% (Veeluen / Excelência)
              </div>
            </div>
          </div>

          {/* Configuração de Frequência e Teste de Conexão */}
          <div className="cgov-settings-row">
            <div className="setting-control-group">
              <label className="setting-label">
                <Sliders size={14} /> Frequência de Varredura Automática:
              </label>
              <select 
                value={workerState.intervalMinutes} 
                onChange={handleChangeFrequency}
                className="select-frequency"
              >
                <option value="5">A cada 5 minutos (Mais frequente)</option>
                <option value="10">A cada 10 minutos</option>
                <option value="15">A cada 15 minutos (Recomendado)</option>
                <option value="30">A cada 30 minutos</option>
                <option value="60">A cada 1 hora</option>
              </select>
            </div>

            <button 
              className="btn-health-check"
              onClick={handleCheckHealth}
              disabled={isCheckingHealth}
            >
              <Wifi size={14} className={isCheckingHealth ? 'spinning' : ''} />
              {isCheckingHealth ? 'Testando conexão...' : 'Testar Conexão ao Vivo'}
            </button>
          </div>

          {/* Feedback do Health Check */}
          {healthStatus && (
            <div className={`health-feedback-card status-${healthStatus.status.toLowerCase()}`}>
              <div className="health-header">
                <div className="health-icon-title">
                  {healthStatus.status === 'ONLINE' ? (
                    <CheckCircle2 size={16} className="text-emerald" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber" />
                  )}
                  <strong>Diagnóstico de Acessibilidade Compras.gov:</strong>
                  <span className="health-status-badge">{healthStatus.status}</span>
                </div>
                <span className="health-latency">{healthStatus.latencyMs} ms de latência</span>
              </div>
              <p className="health-msg">{healthStatus.message}</p>
            </div>
          )}

          {/* Histórico das Últimas Execuções */}
          <div className="cgov-history-section">
            <div className="history-header">
              <span className="history-title">Histórico de Execuções Recentes</span>
              <span className="history-count">{workerState.history?.length || 0} registros auditados</span>
            </div>

            {(!workerState.history || workerState.history.length === 0) ? (
              <div className="history-empty">
                Nenhuma varredura registrada ainda. Clique em "Varredura Imediata" para rodar o primeiro ciclo ao vivo.
              </div>
            ) : (
              <div className="history-list">
                {workerState.history.map((run) => (
                  <div key={run.id} className="history-item">
                    <div className="h-left">
                      <span className={`h-status-dot ${run.status === 'Sucesso' ? 'dot-success' : 'dot-fail'}`} />
                      <div>
                        <div className="h-time">
                          {new Date(run.timestamp).toLocaleString('pt-BR')}
                        </div>
                        <div className="h-source">{run.source}</div>
                      </div>
                    </div>

                    <div className="h-right">
                      <div className="h-stat-pill">
                        Capturados: <strong>{run.totalScanned || 0}</strong>
                      </div>
                      <div className="h-stat-pill text-purple">
                        Novos: <strong>+{run.newCount || 0}</strong>
                      </div>
                      <div className="h-stat-pill text-emerald">
                        Relevantes: <strong>{run.relevantCount || 0}</strong>
                      </div>
                      <div className="h-duration">{run.durationMs || 0}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Informativo */}
        <div className="cgov-worker-footer">
          <div className="f-info">
            <ShieldCheck size={14} className="text-purple" />
            <span>
              Fonte: Portal Oficial de Compras do Governo Federal (<strong>Compras.gov.br / Comprasnet</strong> sob Lei 14.133/21).
            </span>
          </div>
          <button className="btn-close-footer" onClick={onClose}>
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
