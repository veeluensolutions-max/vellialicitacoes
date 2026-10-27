import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Upload, 
  Download, 
  Database, 
  Key, 
  X, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  Wifi
} from 'lucide-react';
import { cloudSyncService, CLOUD_SYNC_STATUS } from '../../services/cloud/cloudSyncService.js';
import { supabaseClient } from '../../services/cloud/supabaseClient.js';
import { supabaseRealtimeService, REALTIME_STATUS } from '../../services/cloud/supabaseRealtimeService.js';
import { EventBus } from '../../services/eventBus.js';
import './CloudSyncModal.css';

export default function CloudSyncModal({ isOpen, onClose }) {
  const [syncState, setSyncState] = useState(() => cloudSyncService.getState());
  const [urlInput, setUrlInput] = useState(supabaseClient.config.url || '');
  const [keyInput, setKeyInput] = useState(supabaseClient.config.anonKey || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [realtimeFeedback, setRealtimeFeedback] = useState(null);

  useEffect(() => {
    const handleUpdate = (state) => setSyncState(state);
    const handleRealtimeUpdate = () => setSyncState(cloudSyncService.getState());
    const unsub = EventBus.subscribe('vellia-cloud-sync-status-changed', handleUpdate);
    const unsubRt = EventBus.subscribe('vellia-supabase-realtime-status-changed', handleRealtimeUpdate);
    return () => {
      unsub();
      unsubRt();
    };
  }, []);

  if (!isOpen) return null;

  const handleSaveAndTest = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await cloudSyncService.updateCredentials(urlInput, keyInput);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Conexão validada com sucesso! Latência: ${res.latencyMs}ms.`
        });
      } else {
        setFeedback({
          type: 'error',
          message: `Falha ao conectar: ${res.message}`
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Erro: ${err.message}`
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    setFeedback(null);
    try {
      const res = await cloudSyncService.fullSyncUpload();
      setFeedback({
        type: 'success',
        message: `Upload concluído: ${res.count} oportunidades enviadas para a tabela public.opportunities!`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Falha no upload: ${err.message}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    setFeedback(null);
    try {
      const res = await cloudSyncService.fullSyncDownload();
      setFeedback({
        type: 'success',
        message: `Download concluído: ${res.count} oportunidades sincronizadas da nuvem para este computador!`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: `Falha no download: ${err.message}`
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopySqlSchema = () => {
    const sqlScript = `-- Schema Vellia Licitações 2.0
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    portal TEXT NOT NULL DEFAULT 'Petronect',
    client TEXT NOT NULL,
    title TEXT NOT NULL,
    object TEXT NOT NULL,
    description TEXT,
    modality TEXT DEFAULT 'Pregão Eletrônico',
    contract_type TEXT DEFAULT 'Prestação de Serviços Especializados',
    situation TEXT DEFAULT 'Publicada / Recebendo Propostas',
    publish_date TEXT,
    end_date TEXT,
    days_left INTEGER,
    state VARCHAR(2) DEFAULT 'PE',
    city TEXT DEFAULT 'Recife',
    location TEXT DEFAULT 'Recife - PE',
    estimated_value TEXT,
    url TEXT,
    capture_date TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Nova',
    canonical_status TEXT DEFAULT 'IDENTIFIED',
    decision TEXT,
    decision_reason TEXT,
    recommended_company TEXT NOT NULL DEFAULT 'Veeluen Solutions',
    company_scope TEXT NOT NULL DEFAULT 'ALL',
    primary_service TEXT,
    related_services JSONB DEFAULT '[]'::jsonb,
    score NUMERIC(5, 2) DEFAULT 0,
    score_tier TEXT DEFAULT 'LOW',
    priority TEXT DEFAULT 'Média',
    tags JSONB DEFAULT '[]'::jsonb,
    internal_notes TEXT,
    responsible_person TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    why_matches JSONB DEFAULT '[]'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    score_breakdown JSONB DEFAULT '{}'::jsonb,
    explanation_summary TEXT,
    source_origin TEXT DEFAULT 'PNCP / Petronect'
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Acesso completo" ON public.opportunities FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;`;

    navigator.clipboard?.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const isConnected = syncState.status === CLOUD_SYNC_STATUS.CONNECTED;

  return (
    <div className="cloud-sync-backdrop" onClick={onClose}>
      <div className="cloud-sync-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="cloud-sync-header">
          <div className="cloud-sync-title-area">
            <div className="cloud-sync-icon-badge">
              <Cloud size={20} />
            </div>
            <div>
              <h2 className="cloud-sync-title">Banco em Nuvem & Sincronização Multi-usuário</h2>
              <p className="cloud-sync-subtitle">
                Supabase / PostgreSQL • Sincronização contínua entre computadores da Diretoria e Equipe
              </p>
            </div>
          </div>
          <button className="cloud-sync-close-btn" onClick={onClose} title="Fechar">
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="cloud-sync-body">

          {/* Banner de Status */}
          <div className={`cloud-status-banner status-${syncState.status.toLowerCase()}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="cloud-pulse" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {isConnected ? 'Conectado à Nuvem (PostgreSQL Ativo)' : syncState.status === 'UNCONFIGURED' ? 'Modo Local / Offline (Sem Nuvem)' : syncState.status}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>
                  {isConnected 
                    ? `Latência: ${syncState.lastLatencyMs}ms • Última sincronização: ${syncState.lastSyncedAt ? new Date(syncState.lastSyncedAt).toLocaleTimeString('pt-BR') : 'Agora'}`
                    : 'Os dados residem localmente nesta máquina. Conecte ao Supabase para habilitar acesso multi-máquina.'}
                </div>
              </div>
            </div>

            {isConnected && (
              <button 
                type="button" 
                className="cloud-btn-secondary"
                onClick={handleDownloadAll}
                disabled={isDownloading}
                title="Puxar alterações mais recentes da nuvem"
              >
                <RefreshCw size={12} className={isDownloading ? 'spinning' : ''} />
                <span>Atualizar Agora</span>
              </button>
            )}
          </div>

          {/* Card de Monitoramento Realtime WebSockets */}
          {isConnected && (
            <div style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: syncState.realtime?.isSubscribed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  border: `1px solid ${syncState.realtime?.isSubscribed ? 'rgba(16, 185, 129, 0.35)' : 'rgba(234, 179, 8, 0.35)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: syncState.realtime?.isSubscribed ? '#34d399' : '#facc15'
                }}>
                  <Wifi size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Canal WebSocket Realtime:</span>
                    <span style={{ 
                      color: syncState.realtime?.isSubscribed ? '#34d399' : '#94a3b8',
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: syncState.realtime?.isSubscribed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.1)'
                    }}>
                      {syncState.realtime?.isSubscribed ? 'Ao Vivo (Subscrito)' : syncState.realtime?.status || 'Iniciando'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    Tabela: <code>public.opportunities</code> • Eventos recebidos: <strong>{syncState.realtime?.totalEventsReceived || 0}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="cloud-btn-secondary"
                style={{ fontSize: '11px', padding: '6px 10px' }}
                onClick={() => {
                  supabaseRealtimeService.sendBroadcast('ping_test', {
                    client: 'Vellia Licitações Diretoria',
                    timestamp: Date.now()
                  });
                  setRealtimeFeedback('Ping de broadcast enviado via WebSocket com sucesso!');
                  setTimeout(() => setRealtimeFeedback(null), 3000);
                }}
                disabled={!syncState.realtime?.isSubscribed}
                title="Envia sinal de teste via WebSocket para outros computadores conectados"
              >
                <Zap size={11} color="#facc15" />
                <span>Testar Broadcast</span>
              </button>
            </div>
          )}

          {realtimeFeedback && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle2 size={13} />
              <span>{realtimeFeedback}</span>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: feedback.type === 'success' ? '#34d399' : '#f87171',
              border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Formulário de Configuração Supabase */}
          <form className="cloud-form-card" onSubmit={handleSaveAndTest}>
            <div className="cloud-form-title">
              <Key size={14} />
              <span>Credenciais da Instância Supabase</span>
            </div>

            <div className="cloud-form-group">
              <label className="cloud-label">Project URL (Endpoint REST do Supabase)</label>
              <input
                type="url"
                className="cloud-input"
                placeholder="https://xyzabcdefghijklm.supabase.co"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                required
              />
            </div>

            <div className="cloud-form-group">
              <label className="cloud-label">API Key / Anon Public Key (Chave de Acesso)</label>
              <input
                type="password"
                className="cloud-input"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                required
              />
            </div>

            <div className="cloud-form-actions">
              <button
                type="submit"
                className="cloud-btn-primary"
                disabled={isSaving}
              >
                <Server size={13} className={isSaving ? 'spinning' : ''} />
                <span>{isSaving ? 'Testando Conexão...' : 'Salvar e Conectar'}</span>
              </button>
            </div>
          </form>

          {/* Ações de Sincronismo em Lote */}
          <div className="cloud-actions-grid">
            <div className="cloud-action-card">
              <div>
                <div className="cloud-action-card-title">
                  <Upload size={14} color="#38bdf8" />
                  <span>Subir Base Local para a Nuvem</span>
                </div>
                <p className="cloud-action-card-desc">
                  Faz o upload de todas as oportunidades salvas nesta máquina para a tabela <code>opportunities</code> do Supabase.
                </p>
              </div>
              <button
                type="button"
                className="cloud-btn-secondary"
                onClick={handleUploadAll}
                disabled={isUploading || !isConnected}
              >
                <Upload size={12} className={isUploading ? 'spinning' : ''} />
                <span>{isUploading ? 'Enviando...' : 'Fazer Upload Completo'}</span>
              </button>
            </div>

            <div className="cloud-action-card">
              <div>
                <div className="cloud-action-card-title">
                  <Download size={14} color="#34d399" />
                  <span>Baixar Base da Nuvem para o Local</span>
                </div>
                <p className="cloud-action-card-desc">
                  Substitui a base local pelos dados mais recentes registrados na nuvem por outros integrantes da equipe.
                </p>
              </div>
              <button
                type="button"
                className="cloud-btn-secondary"
                onClick={handleDownloadAll}
                disabled={isDownloading || !isConnected}
              >
                <Download size={12} className={isDownloading ? 'spinning' : ''} />
                <span>{isDownloading ? 'Baixando...' : 'Fazer Download'}</span>
              </button>
            </div>
          </div>

          {/* Caixa de Script SQL do Schema */}
          <div className="cloud-schema-box">
            <div className="cloud-schema-text">
              <strong>Arquivo Schema SQL:</strong> Disponível em <code>supabase_schema.sql</code> na raiz do projeto. Execute-o no SQL Editor do Supabase para criar as tabelas e políticas RLS.
            </div>
            <button
              type="button"
              className="cloud-btn-secondary"
              onClick={handleCopySqlSchema}
            >
              <Copy size={12} />
              <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
            </button>
          </div>

        </div>

        {/* Rodapé */}
        <div className="cloud-worker-footer">
          <div>
            Arquitetura Offline-First • Armazenamento local rápido com réplica distribuída em nuvem
          </div>
          <div>
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <span>Console Supabase</span>
              <ExternalLink size={11} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
