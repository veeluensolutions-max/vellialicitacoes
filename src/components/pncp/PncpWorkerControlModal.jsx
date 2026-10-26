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
  Radio
} from 'lucide-react';
import { pncpContinuousIngestionWorker, PNCP_WORKER_STATUS } from '../../services/pncp/pncpContinuousIngestionWorker.js';
import { PNCPConnector } from '../../services/multisource/pncpConnector.js';
import { EventBus } from '../../services/eventBus.js';
import './PncpWorkerControlModal.css';

export default function PncpWorkerControlModal({ isOpen, onClose }) {
  const [workerState, setWorkerState] = useState(() => pncpContinuousIngestionWorker.getState());
  const [isExecutingNow, setIsExecutingNow] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [timeUntilNext, setTimeUntilNext] = useState('');

  // Atualização em tempo real de eventos do Worker
  useEffect(() => {
    const handleStatusUpdate = (state) => {
      setWorkerState(state);
    };

    const unsub = EventBus.subscribe('vellia-pncp-worker-status-changed', handleStatusUpdate);
    return unsub;
  }, []);

  // Contagem regressiva para a próxima execução
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (!workerState.nextRunAt || workerState.status === PNCP_WORKER_STATUS.PAUSED) {
        setTimeUntilNext('Em espera (Pausado)');
        return;
      }

      const diff = new Date(workerState.nextRunAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeUntilNext('Executando agora...');
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
    if (workerState.status === PNCP_WORKER_STATUS.ACTIVE || workerState.status === PNCP_WORKER_STATUS.INGESTING) {
      pncpContinuousIngestionWorker.pause();
    } else {
      pncpContinuousIngestionWorker.start();
    }
    setWorkerState(pncpContinuousIngestionWorker.getState());
  };

  const handleExecuteNow = async () => {
    setIsExecutingNow(true);
    try {
      await pncpContinuousIngestionWorker.triggerImmediateIngestion();
      setWorkerState(pncpContinuousIngestionWorker.getState());
    } finally {
      setIsExecutingNow(false);
    }
  };

  const handleChangeFrequency = (e) => {
    const mins = Number(e.target.value);
    pncpContinuousIngestionWorker.setIntervalMinutes(mins);
    setWorkerState(pncpContinuousIngestionWorker.getState());
  };

  const handleTestHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await PNCPConnector.checkHealth();
      setHealthStatus(res);
    } catch (err) {
      setHealthStatus({ status: 'ERROR', message: err.message, latencyMs: 0 });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const isIngesting = workerState.status === PNCP_WORKER_STATUS.INGESTING || isExecutingNow;
  const isActive = workerState.status === PNCP_WORKER_STATUS.ACTIVE || isIngesting;

  return (
    <div className="pncp-worker-backdrop" onClick={onClose}>
      <div className="pncp-worker-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="pncp-worker-header">
          <div className="pncp-worker-title-area">
            <div className="pncp-worker-icon-badge">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="pncp-worker-title">Worker de Ingestão Contínua — PNCP Federal</h2>
              <p className="pncp-worker-subtitle">
                Varredura autônoma em background • Portal Nacional de Contratações Públicas
              </p>
            </div>
          </div>
          <button className="pncp-worker-close-btn" onClick={onClose} title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="pncp-worker-body">

          {/* Banner de Status Principal */}
          <div className={`pncp-status-banner status-${isIngesting ? 'ingesting' : isActive ? 'active' : 'paused'}`}>
            <div className="pncp-status-left">
              <div className="pncp-status-pulse" />
              <div>
                <div className="pncp-status-label">
                  {isIngesting ? 'Ingestão em Andamento' : isActive ? 'Worker Ativo em Background' : 'Worker Pausado'}
                </div>
                <div className="pncp-status-subtext">
                  {workerState.lastLogMessage || 'Operando normalmente sob supervisão autônoma.'}
                </div>
              </div>
            </div>

            <div className="pncp-actions-bar">
              <button 
                type="button" 
                className="pncp-secondary-action-btn"
                onClick={handleExecuteNow}
                disabled={isIngesting}
                title="Forçar ciclo de varredura imediato"
              >
                <RefreshCw size={13} className={isIngesting ? 'spinning' : ''} />
                <span>{isIngesting ? 'Varrendo...' : 'Executar Agora'}</span>
              </button>

              <button 
                type="button" 
                className={`pncp-primary-action-btn ${isActive ? 'btn-pause' : 'btn-start'}`}
                onClick={handleToggleWorker}
              >
                {isActive ? <Pause size={13} /> : <Play size={13} />}
                <span>{isActive ? 'Pausar Worker' : 'Ativar Worker'}</span>
              </button>
            </div>
          </div>

          {/* Grid de Métricas Operacionais */}
          <div className="pncp-metrics-grid">
            <div className="pncp-metric-card">
              <div className="pncp-metric-title">Próximo Ciclo</div>
              <div className="pncp-metric-val">{timeUntilNext || '--:--'}</div>
              <div className="pncp-metric-sub">
                Intervalo: {workerState.intervalMinutes}m
              </div>
            </div>

            <div className="pncp-metric-card">
              <div className="pncp-metric-title">Ciclos Executados</div>
              <div className="pncp-metric-val">{workerState.totalRuns || 0}</div>
              <div className="pncp-metric-sub">
                Último: {workerState.lastDurationMs ? `${workerState.lastDurationMs}ms` : '0ms'}
              </div>
            </div>

            <div className="pncp-metric-card">
              <div className="pncp-metric-title">Certames Ingeridos</div>
              <div className="pncp-metric-val">{workerState.totalCaptured || 0}</div>
              <div className="pncp-metric-sub">
                Novos: +{workerState.totalNew || 0}
              </div>
            </div>

            <div className="pncp-metric-card">
              <div className="pncp-metric-title">Alta Aderência</div>
              <div className="pncp-metric-val" style={{ color: '#38bdf8' }}>
                {workerState.totalRelevant || 0}
              </div>
              <div className="pncp-metric-sub">Aderência &ge; 75%</div>
            </div>
          </div>

          {/* Configuração de Frequência e Conexão */}
          <div className="pncp-config-box">
            <div>
              <div className="pncp-config-title">Frequência da Varredura Contínua</div>
              <div className="pncp-config-desc">
                Intervalo de tempo entre as consultas automáticas à API do PNCP.
              </div>
            </div>
            <div>
              <select 
                className="pncp-frequency-select"
                value={workerState.intervalMinutes}
                onChange={handleChangeFrequency}
              >
                <option value={2}>A cada 2 minutos (Teste Rápido)</option>
                <option value={5}>A cada 5 minutos (Recomendado)</option>
                <option value={15}>A cada 15 minutos (Padrão Corporativo)</option>
                <option value={30}>A cada 30 minutos</option>
                <option value={60}>A cada 1 hora</option>
                <option value={360}>A cada 6 horas</option>
              </select>
            </div>
          </div>

          {/* Conexão Oficial e Health Check */}
          <div className="pncp-config-box">
            <div>
              <div className="pncp-config-title">Conexão Oficial & Circuit Breaker</div>
              <div className="pncp-config-desc">
                Endpoint: <code>https://pncp.gov.br/api/consulta/v1</code> via proxy Vite <code>/api-pncp</code>
              </div>
              {healthStatus && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: healthStatus.status === 'ONLINE' ? '#34d399' : '#f87171' }}>
                  {healthStatus.status === 'ONLINE' ? '✓ ' : '⚠ '}
                  {healthStatus.message} ({healthStatus.latencyMs}ms)
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                className="pncp-secondary-action-btn"
                onClick={handleTestHealth}
                disabled={isCheckingHealth}
              >
                <Wifi size={13} className={isCheckingHealth ? 'spinning' : ''} />
                <span>{isCheckingHealth ? 'Testando...' : 'Testar Conexão'}</span>
              </button>
            </div>
          </div>

          {/* Histórico das Últimas Execuções */}
          <div className="pncp-history-section">
            <div className="pncp-section-title">
              <Clock size={14} />
              <span>Histórico de Ciclos Recentes</span>
            </div>

            <div className="pncp-history-table-wrapper">
              <table className="pncp-history-table">
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Fonte / Mecanismo</th>
                    <th>Duração</th>
                    <th>Escaneados</th>
                    <th>Novos</th>
                    <th>Relevantes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workerState.history && workerState.history.length > 0 ? (
                    workerState.history.slice(0, 6).map((h) => (
                      <tr key={h.id}>
                        <td>
                          {h.timestamp ? new Date(h.timestamp).toLocaleTimeString('pt-BR') : 'Agora'}
                        </td>
                        <td>{h.source || 'API PNCP'}</td>
                        <td>{h.durationMs ? `${h.durationMs}ms` : '--'}</td>
                        <td>{h.totalScanned || 0}</td>
                        <td style={{ fontWeight: 600, color: h.newCount > 0 ? '#34d399' : '#94a3b8' }}>
                          +{h.newCount || 0}
                        </td>
                        <td style={{ color: h.relevantCount > 0 ? '#38bdf8' : '#94a3b8' }}>
                          {h.relevantCount || 0}
                        </td>
                        <td>
                          <span className={h.status === 'SUCCESS' ? 'pncp-badge-success' : 'pncp-badge-error'}>
                            {h.status === 'SUCCESS' ? 'Sucesso' : 'Falha'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#64748b' }}>
                        Nenhum ciclo registrado nesta sessão ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Rodapé com Link Oficial */}
        <div className="pncp-worker-footer">
          <div>
            Portal Nacional de Contratações Públicas • Lei nº 14.133/2021
          </div>
          <div>
            <a 
              href="https://pncp.gov.br" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Abrir Portal PNCP</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
