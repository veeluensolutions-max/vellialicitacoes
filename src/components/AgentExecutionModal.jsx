import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Globe2, 
  Sparkles, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { AgentOrchestrator, AgentStatus } from '../services/agent/agentOrchestrator';
import './AgentExecutionModal.css';

export default function AgentExecutionModal({ isOpen, onClose, mode = 'MANUAL', onExecutionCompleted }) {
  if (!isOpen) return null;

  const [step, setStep] = useState('CONFIRM'); // 'CONFIRM' | 'RUNNING' | 'FINISHED' | 'ERROR'
  const [progress, setProgress] = useState({ step: 1, label: 'Iniciando rotina...', pct: 10 });
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const isSimulation = mode === 'SIMULATION';

  const handleStart = async () => {
    setStep('RUNNING');
    setProgress({ step: 1, label: 'Verificando fontes ativas e telemetria...', pct: 15 });

    try {
      let res;
      if (isSimulation) {
        res = await AgentOrchestrator.simulateDailyRun((prog) => setProgress(prog));
      } else {
        res = await AgentOrchestrator.runCycle('MANUAL', (prog) => setProgress(prog));
      }

      setResult(res);
      setStep('FINISHED');
      if (onExecutionCompleted) onExecutionCompleted(res);
    } catch (err) {
      setErrorMessage(err.message || 'Falha ao executar o ciclo do agente.');
      setStep('ERROR');
    }
  };

  return (
    <div className="agent-modal-backdrop" onClick={step === 'RUNNING' ? null : onClose}>
      <div className="agent-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Topo do Modal */}
        <div className="agent-modal-header">
          <div className="agent-modal-title-group">
            <div className={`agent-icon-badge ${step === 'RUNNING' ? 'badge-running' : ''}`}>
              <Bot size={22} className="text-teal" />
            </div>
            <div>
              <div className="agent-modal-badge-row">
                <span className="agent-pill-tag">VELLIA AGENT</span>
                <span className="agent-pill-mode">
                  {isSimulation ? 'Simulação de Rotina Matinal' : 'Execução Sob Demanda'}
                </span>
              </div>
              <h3 className="agent-modal-title">
                {isSimulation ? 'Simular Execução Diária do Agente' : 'Executar Agente de Monitoramento Agora'}
              </h3>
            </div>
          </div>

          {step !== 'RUNNING' && (
            <button className="agent-close-btn" onClick={onClose} aria-label="Fechar">
              <X size={20} />
            </button>
          )}
        </div>

        {/* CORPO: ETAPA 1 - CONFIRMAÇÃO */}
        {step === 'CONFIRM' && (
          <div className="agent-modal-body">
            <div className="agent-info-callout">
              <ShieldCheck size={20} className="text-teal flex-shrink-0" />
              <div>
                <h4 className="callout-heading">Confirmação de Execução Imediata</h4>
                <p className="callout-desc">
                  {isSimulation
                    ? 'Esta ação simulará o disparo automatizado das 06:30, inserindo uma oportunidade demonstrativa, reexecutando o Motor de Aderência, gerando novos alertas e atualizando o Radar Diário de Licitações.'
                    : 'Esta ação executará uma busca imediata nas fontes ativas públicas (Petronect), capturando editais abertos, deduplicando, aplicando o Motor de Aderência e atualizando os alertas.'}
                </p>
              </div>
            </div>

            <div className="agent-params-grid">
              <div className="param-item">
                <span className="param-lbl">Fonte Primária</span>
                <span className="param-val font-semibold">Petronect Público</span>
              </div>
              <div className="param-item">
                <span className="param-lbl">Modo de Coleta</span>
                <span className="param-val">Incremental Inteligente</span>
              </div>
              <div className="param-item">
                <span className="param-lbl">Filtro Semântico</span>
                <span className="param-val">Catálogo Vellia (29 Serviços)</span>
              </div>
              <div className="param-item">
                <span className="param-lbl">Critério de Alerta</span>
                <span className="param-val text-teal font-semibold">Aderência ≥ 80% ou Crítica</span>
              </div>
            </div>

            <div className="agent-modal-actions">
              <button className="btn-agent-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn-agent-primary" onClick={handleStart}>
                <Play size={16} fill="currentColor" />
                <span>Iniciar Execução do Agente</span>
              </button>
            </div>
          </div>
        )}

        {/* CORPO: ETAPA 2 - EM EXECUÇÃO */}
        {step === 'RUNNING' && (
          <div className="agent-modal-body">
            <div className="agent-running-center">
              <div className="agent-spinner-radar">
                <Bot size={36} className="agent-core-pulse text-teal" />
              </div>
              <h4 className="running-title">Vellia Agent em Ação</h4>
              <p className="running-subtitle">{progress.label}</p>

              {/* Barra de Progresso */}
              <div className="agent-progress-track">
                <div 
                  className="agent-progress-fill" 
                  style={{ width: `${progress.pct}%` }} 
                />
              </div>
              <span className="running-pct mono">{progress.pct}% concluído</span>
            </div>

            <div className="running-steps-list">
              <div className={`step-item ${progress.pct >= 15 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span>Verificação de conectividade e telemetria da fonte</span>
              </div>
              <div className={`step-item ${progress.pct >= 35 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span>Varredura pública no portal Petronect</span>
              </div>
              <div className={`step-item ${progress.pct >= 55 ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <span>Normalização e deduplicação de oportunidades</span>
              </div>
              <div className={`step-item ${progress.pct >= 75 ? 'active' : ''}`}>
                <span className="step-num">4</span>
                <span>Motor de Aderência, Recommendation Score e Alertas</span>
              </div>
              <div className={`step-item ${progress.pct >= 90 ? 'active' : ''}`}>
                <span className="step-num">5</span>
                <span>Geração do Radar Diário e consolidação métrica</span>
              </div>
            </div>
          </div>
        )}

        {/* CORPO: ETAPA 3 - CONCLUÍDO (RESUMO EXECUTIVO) */}
        {step === 'FINISHED' && result && (
          <div className="agent-modal-body">
            <div className="finished-banner-success">
              <CheckCircle2 size={24} className="text-green flex-shrink-0" />
              <div>
                <h4 className="finished-banner-title">Ciclo do Vellia Agent Concluído com Sucesso!</h4>
                <p className="finished-banner-desc">
                  Todas as etapas de varredura, classificação semântica e consolidação de alertas foram concluídas.
                </p>
              </div>
            </div>

            {/* Resumo Exigido no Item 5 da Especificação */}
            <div className="exec-summary-grid">
              <div className="exec-stat-box">
                <span className="lbl">Fontes Verificadas</span>
                <span className="val">{result.sourcesChecked?.length || 1}</span>
                <span className="sub">Petronect</span>
              </div>

              <div className="exec-stat-box">
                <span className="lbl">Oportunidades Analisadas</span>
                <span className="val">{result.recordsFound}</span>
                <span className="sub">editais processados</span>
              </div>

              <div className="exec-stat-box box-green">
                <span className="lbl">Novas Oportunidades</span>
                <span className="val text-teal">{result.recordsNew}</span>
                <span className="sub">inseridas no banco</span>
              </div>

              <div className="exec-stat-box">
                <span className="lbl">Atualizadas</span>
                <span className="val">{result.recordsUpdated}</span>
                <span className="sub">prazos / aditivos</span>
              </div>

              <div className="exec-stat-box box-indigo">
                <span className="lbl">Relevantes (&gt;70%)</span>
                <span className="val text-indigo">{result.relevantCount}</span>
                <span className="sub">match positivo</span>
              </div>

              <div className="exec-stat-box box-critical">
                <span className="lbl">Críticas (&gt;90%)</span>
                <span className="val text-critical">{result.criticalCount}</span>
                <span className="sub">ação prioritária</span>
              </div>

              <div className="exec-stat-box">
                <span className="lbl">Alertas Gerados</span>
                <span className="val text-amber">{result.alertsGenerated}</span>
                <span className="sub">na central</span>
              </div>

              <div className="exec-stat-box">
                <span className="lbl">Tempo Total</span>
                <span className="val mono">{(result.durationMs / 1000).toFixed(1)}s</span>
                <span className="sub">0 erros</span>
              </div>
            </div>

            <div className="agent-modal-actions">
              <button className="btn-agent-primary" onClick={onClose}>
                <span>Concluir e Ver Resultados</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* CORPO: ETAPA 4 - ERRO */}
        {step === 'ERROR' && (
          <div className="agent-modal-body">
            <div className="error-callout-box">
              <AlertTriangle size={24} className="text-critical" />
              <div>
                <h4 className="error-title">Interrupção no Ciclo do Agente</h4>
                <p className="error-desc">{errorMessage}</p>
              </div>
            </div>

            <div className="agent-modal-actions">
              <button className="btn-agent-secondary" onClick={onClose}>
                Fechar
              </button>
              <button className="btn-agent-primary" onClick={handleStart}>
                <RefreshCw size={15} />
                <span>Tentar Novamente</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
