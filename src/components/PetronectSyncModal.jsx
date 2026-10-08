import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, Activity, Flame } from 'lucide-react';
import { PetronectConnector } from '../services/petronect/petronectConnector';
import './PetronectSyncModal.css';

export default function PetronectSyncModal({ isOpen, onClose, onSuccess, initialMode = 'INCREMENTAL' }) {
  const [mode, setMode] = useState(initialMode);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('Pronto para iniciar');
  const [stats, setStats] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleStartSync = async () => {
    setSyncing(true);
    setErrorMsg(null);
    setStats(null);
    setProgress(15);
    setProgressStep('Conectando à área pública do portal Petronect...');

    try {
      setTimeout(() => {
        setProgress(40);
        setProgressStep('Baixando lote de oportunidades abertas e verificando paginação...');
      }, 500);

      setTimeout(() => {
        setProgress(70);
        setProgressStep('Executando deduplicação e normalização via PetronectAdapter...');
      }, 900);

      setTimeout(async () => {
        setProgress(88);
        setProgressStep('Classificando no Motor de Aderência e registrando histórico...');
        
        const result = await PetronectConnector.synchronize({ mode });
        setProgress(100);
        setProgressStep('Sincronização concluída com sucesso!');
        setStats(result);
        setSyncing(false);
        if (onSuccess) onSuccess(result);
      }, 1400);

    } catch (err) {
      setSyncing(false);
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="sync-modal-backdrop" onClick={onClose}>
      <div className="sync-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="sync-modal-header">
          <div className="s-header-title">
            <RefreshCw size={20} className={`text-teal ${syncing ? 'spinning' : ''}`} />
            <div>
              <h3>Sincronização Pública Petronect</h3>
              <p className="s-sub">Captura, desduplicação e classificação em tempo real</p>
            </div>
          </div>
          <button className="btn-close-sync" onClick={onClose} disabled={syncing}>
            <X size={18} />
          </button>
        </div>

        <div className="sync-modal-body">
          {!stats && !syncing && (
            <div className="sync-setup-block">
              {mode === 'COMPLETA' ? (
                <div className="complete-sync-warning">
                  <AlertCircle size={18} className="text-amber" />
                  <div>
                    <strong>Sincronização Inicial Completa</strong>
                    <p>Esta ação fará a leitura de todas as oportunidades públicas disponíveis no Petronect e poderá atualizar diversos registros no banco local.</p>
                  </div>
                </div>
              ) : (
                <div className="incremental-sync-callout">
                  <Activity size={18} className="text-teal" />
                  <div>
                    <strong>Modo Incremental Selecionado</strong>
                    <p>Buscará prioritariamente oportunidades novas ou com aditivos de prazo/valor publicados desde a última execução.</p>
                  </div>
                </div>
              )}

              <div className="mode-radio-group">
                <label className="mode-radio-item">
                  <input 
                    type="radio" 
                    name="syncMode" 
                    checked={mode === 'INCREMENTAL'} 
                    onChange={() => setMode('INCREMENTAL')} 
                  />
                  <div>
                    <span className="mode-name">Incremental (Rotina Rápida)</span>
                    <span className="mode-desc">Ideal para atualizações diárias e acompanhamento contínuo.</span>
                  </div>
                </label>

                <label className="mode-radio-item">
                  <input 
                    type="radio" 
                    name="syncMode" 
                    checked={mode === 'COMPLETA'} 
                    onChange={() => setMode('COMPLETA')} 
                  />
                  <div>
                    <span className="mode-name">Completa (Varredura Integral)</span>
                    <span className="mode-desc">Verifica todo o catálogo público aberto da Petronect.</span>
                  </div>
                </label>
              </div>

              <div className="safety-badge-row">
                <ShieldCheck size={14} className="text-teal" />
                <span>Conexão direta transparente via HTTP • Sem manipulação de credenciais</span>
              </div>
            </div>
          )}

          {/* Barra de Progresso durante Execução */}
          {syncing && (
            <div className="sync-progress-box">
              <div className="prog-step-text">{progressStep}</div>
              <div className="prog-bar-track">
                <div className="prog-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="prog-percent-text">{progress}% processado</div>
            </div>
          )}

          {/* Relatório Oficial de Resultado (Item 16) */}
          {stats && (
            <div className="sync-results-box">
              <div className="res-title-banner">
                <CheckCircle2 size={20} className="text-green" />
                <div>
                  <h4 className="res-title">PETRONECT • Sincronização Concluída</h4>
                  <span className="res-duration">Duração da execução: {stats.durationMs}ms ({stats.requests} requisições)</span>
                </div>
              </div>

              <div className="res-metrics-grid">
                <div className="res-box">
                  <span className="r-lbl">Registros Verificados</span>
                  <strong className="r-val">{stats.recordsFound}</strong>
                </div>
                <div className="res-box border-green">
                  <span className="r-lbl">Novas Oportunidades</span>
                  <strong className="r-val text-green">{stats.recordsCreated}</strong>
                </div>
                <div className="res-box border-blue">
                  <span className="r-lbl">Atualizadas (Aditivos)</span>
                  <strong className="r-val text-blue">{stats.recordsUpdated}</strong>
                </div>
                <div className="res-box">
                  <span className="r-lbl">Sem Alteração</span>
                  <strong className="r-val">{stats.duplicatesUnchanged}</strong>
                </div>
                <div className="res-box border-teal">
                  <span className="r-lbl">Relevantes (&gt;70%)</span>
                  <strong className="r-val text-teal">{stats.relevantFound}</strong>
                </div>
                <div className="res-box border-critical">
                  <span className="r-lbl">Aderência &gt;80%</span>
                  <strong className="r-val text-critical">{stats.highPriorityFound}</strong>
                </div>
                <div className="res-box border-critical">
                  <span className="r-lbl">Prioridades Críticas</span>
                  <strong className="r-val text-critical">{stats.criticalFound}</strong>
                </div>
                <div className="res-box">
                  <span className="r-lbl">Erros de Conexão</span>
                  <strong className="r-val">{stats.errors}</strong>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="sync-error-banner">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        <div className="sync-modal-footer">
          {!stats ? (
            <>
              <button className="btn-cancel" onClick={onClose} disabled={syncing}>
                Cancelar
              </button>
              <button className="btn-save-opp" onClick={handleStartSync} disabled={syncing}>
                <RefreshCw size={14} className={syncing ? 'spinning' : ''} />
                <span>{syncing ? 'Sincronizando...' : 'Iniciar Sincronização'}</span>
              </button>
            </>
          ) : (
            <button className="btn-save-opp" onClick={onClose}>
              Concluir e Fechar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
