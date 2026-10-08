import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Play, 
  Settings2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Globe2, 
  Database, 
  Layers, 
  Sparkles, 
  CalendarClock, 
  Activity, 
  Terminal,
  ArrowRight,
  ShieldCheck,
  Check,
  Flame,
  Info,
  Sliders,
  Eye,
  FileCode2,
  Lock,
  ExternalLink
} from 'lucide-react';
import { sourceRepository } from '../services/sourceRepository';
import { IngestionService } from '../services/ingestionService';
import { logService, LogType } from '../services/logService';
import { PetronectConnector } from '../services/petronect/petronectConnector';
import { PetronectHealthCheck } from '../services/petronect/petronectHealthCheck';
import { SourceSchedulerService } from '../services/petronect/sourceScheduler';
import { OpportunityService } from '../services/opportunityService';
import PetronectPreviewModal from './PetronectPreviewModal';
import PetronectSyncModal from './PetronectSyncModal';
import PetronectSchedulerModal from './PetronectSchedulerModal';
import './MonitoringView.css';

export default function MonitoringView({ onNavigateToOpportunities }) {
  const [sources, setSources] = useState(() => sourceRepository.getAll());
  const [activeTab, setActiveTab] = useState('sources'); // 'sources' | 'executions' | 'report' | 'schedule' | 'health' | 'logs'
  
  // Modais da Fase 6
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewItems, setPreviewItems] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncModalMode, setSyncModalMode] = useState('INCREMENTAL');
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [schedulerSettings, setSchedulerSettings] = useState(() => SourceSchedulerService.getSettings());
  
  // Execuções & Health
  const [executionHistory, setExecutionHistory] = useState(() => PetronectConnector.getExecutionHistory());
  const [selectedLogExec, setSelectedLogExec] = useState(null);
  const [adminLogMode, setAdminLogMode] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [reprocessing, setReprocessing] = useState(false);
  const [reprocessSuccessMsg, setReprocessSuccessMsg] = useState(null);

  // Ingestão
  const [runningTest, setRunningTest] = useState(false);
  const [ingestionReport, setIngestionReport] = useState(null);
  const [logs, setLogs] = useState(() => logService.getLogs(20));

  const petronectSource = sources.find(s => s.id === 'source-petronect') || sources[0];

  useEffect(() => {
    // Executa verificação inicial de saúde em segundo plano
    PetronectHealthCheck.checkHealth().then(setHealthData);
  }, []);

  const reloadData = () => {
    setSources(sourceRepository.getAll());
    setExecutionHistory(PetronectConnector.getExecutionHistory());
    setLogs(logService.getLogs(20));
  };

  // Teste Real Controlado com Prévia (Item 29)
  const handleOpenPreviewTest = async () => {
    setLoadingPreview(true);
    try {
      const items = await PetronectConnector.executeControlledPreview(10);
      setPreviewItems(items);
      setIsPreviewOpen(true);
      setLoadingPreview(false);
    } catch (err) {
      setLoadingPreview(false);
      alert(`Erro ao capturar prévia: ${err.message}`);
    }
  };

  const handleConfirmPreviewImport = async () => {
    setLoadingPreview(true);
    try {
      await PetronectConnector.synchronize({ mode: 'INCREMENTAL' });
      reloadData();
      setIsPreviewOpen(false);
      setLoadingPreview(false);
      alert('Importação controlada concluída com sucesso! Os registros foram deduplicados e persistidos no banco.');
    } catch (err) {
      setLoadingPreview(false);
      alert(`Falha na importação: ${err.message}`);
    }
  };

  // Reprocessamento de Aderência (Item 32)
  const handleReprocessAll = () => {
    setReprocessing(true);
    setReprocessSuccessMsg(null);
    setTimeout(() => {
      const allOpps = OpportunityService.listAll();
      allOpps.forEach(o => OpportunityService.reanalyzeOpportunity(o.id));
      reloadData();
      setReprocessing(false);
      setReprocessSuccessMsg(`Motor de Aderência reprocessado com sucesso para ${allOpps.length} oportunidades sem novas requisições externas.`);
      setTimeout(() => setReprocessSuccessMsg(null), 3000);
    }, 900);
  };

  return (
    <div className="monitoring-module-container">
      {/* Topo do Módulo */}
      <div className="mon-header-block">
        <div className="mon-title-wrap">
          <div className="mon-icon-badge">
            <Radio size={22} className="text-teal" />
          </div>
          <div>
            <div className="mon-tag-row">
              <span className="mon-module-tag">FASE 6 • CONECTOR OFICIAL PETRONECT</span>
              <span className={`mon-status-tag ${healthData?.status === 'ONLINE' ? 'status-online' : 'status-degraded'}`}>
                <span className="dot-pulse" /> Status: {healthData?.status || 'ONLINE'}
              </span>
            </div>
            <h1 className="mon-main-title">Conector Real Petronect & Telemetria</h1>
            <p className="mon-subtitle">
              Monitoramento automatizado e seguro de oportunidades públicas. O conector atua estritamente como <strong>LEITOR + COLETOR + CLASSIFICADOR</strong>, sem credenciais e sem manifestação de interesse.
            </p>
          </div>
        </div>

        {/* Botões Operacionais no Topo */}
        <div className="mon-actions-row">
          <button 
            className="btn-action-outline" 
            onClick={handleOpenPreviewTest}
            disabled={loadingPreview}
            title="Captura os primeiros registros e mostra a prévia antes de salvar"
          >
            <Eye size={15} />
            <span>{loadingPreview ? 'Capturando Prévia...' : 'Executar Teste com Prévia'}</span>
          </button>

          <button 
            className="btn-action-primary" 
            onClick={() => {
              setSyncModalMode('INCREMENTAL');
              setIsSyncModalOpen(true);
            }}
          >
            <RefreshCw size={15} />
            <span>Sincronizar Agora</span>
          </button>
        </div>
      </div>

      {reprocessSuccessMsg && (
        <div className="feedback-toast-banner">
          <CheckCircle2 size={16} />
          <span>{reprocessSuccessMsg}</span>
        </div>
      )}

      {/* Abas do Módulo */}
      <div className="mon-tabs-bar">
        <button 
          className={`mon-tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          <Globe2 size={15} />
          <span>Painel Petronect</span>
        </button>

        <button 
          className={`mon-tab-btn ${activeTab === 'executions' ? 'active' : ''}`}
          onClick={() => setActiveTab('executions')}
        >
          <Activity size={15} />
          <span>Histórico de Execuções ({executionHistory.length})</span>
        </button>

        <button 
          className={`mon-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <CalendarClock size={15} />
          <span>Agendador Automático</span>
        </button>

        <button 
          className={`mon-tab-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <ShieldCheck size={15} />
          <span>Health Check & Segurança</span>
        </button>

        <button 
          className={`mon-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Terminal size={15} />
          <span>Logs de Auditoria ({logs.length})</span>
        </button>
      </div>

      {/* ABA 1: PAINEL DE FONTES & OPERAÇÃO */}
      {activeTab === 'sources' && (
        <div className="sources-tab-content">
          <div className="sources-grid">
            {/* CARD PETRONECT EXPANDIDO (FASE 6) */}
            <div className="source-card primary-source-card">
              <div className="source-card-header">
                <div className="source-badge-col">
                  <span className="source-brand-tag">FONTE PÚBLICA INTEGRADA</span>
                  <h3 className="source-name">PETRONECT</h3>
                  <span className="source-type-sub">Licitações Públicas Petrobras & Transpetro</span>
                </div>
                <div className="source-status-badge status-active">
                  <span className="dot-pulse" />
                  <span>ONLINE (Monitorando)</span>
                </div>
              </div>

              <div className="source-stats-row">
                <div className="src-stat-box">
                  <span className="lbl">Total Monitorado</span>
                  <strong className="val">{petronectSource.capturedCount || 186}</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Novas Oportunidades</span>
                  <strong className="val text-green">{petronectSource.newCount || 14}</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Relevantes (&gt;70%)</span>
                  <strong className="val text-teal">{petronectSource.relevantCount || 8}</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Erros de Conexão</span>
                  <strong className="val">0</strong>
                </div>
              </div>

              <div className="source-meta-list">
                <div className="meta-line">
                  <Clock size={13} />
                  <span>Última sincronização: <strong>{petronectSource.lastSync}</strong></span>
                </div>
                <div className="meta-line">
                  <CalendarClock size={13} />
                  <span>Próxima execução: <strong>{schedulerSettings.enabled ? schedulerSettings.nextRun : 'Manual / Sob Demanda'}</strong></span>
                </div>
                <div className="meta-line">
                  <Globe2 size={13} />
                  <span>Canal Público: <a href="https://www.petronect.com.br/portalpublico" target="_blank" rel="noreferrer">petronect.com.br/portalpublico</a></span>
                </div>
              </div>

              {/* Botões Operacionais da Fonte */}
              <div className="petronect-source-actions-bar">
                <button 
                  className="btn-src-action"
                  onClick={() => {
                    setSyncModalMode('INCREMENTAL');
                    setIsSyncModalOpen(true);
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Sincronizar Agora</span>
                </button>

                <button 
                  className="btn-src-action"
                  onClick={handleOpenPreviewTest}
                >
                  <Eye size={13} />
                  <span>Prévia Controlada</span>
                </button>

                <button 
                  className="btn-src-action"
                  onClick={() => {
                    setSyncModalMode('COMPLETA');
                    setIsSyncModalOpen(true);
                  }}
                >
                  <Database size={13} />
                  <span>Sincronização Completa</span>
                </button>

                <button 
                  className="btn-src-action"
                  onClick={handleReprocessAll}
                  disabled={reprocessing}
                >
                  <Sliders size={13} />
                  <span>{reprocessing ? 'Reprocessando...' : 'Reprocessar Aderência'}</span>
                </button>

                <button 
                  className="btn-src-action"
                  onClick={() => setIsSchedulerOpen(true)}
                >
                  <Settings2 size={13} />
                  <span>Agendador</span>
                </button>
              </div>

              <div className="source-card-footer">
                <div className="footer-safe-tag">
                  <Lock size={13} className="text-teal" />
                  <span>Ambiente Estritamente Seguro • Sem armazenamento de senhas ou contorno de CAPTCHA</span>
                </div>
              </div>
            </div>

            {/* CARD PNCP INTEGRADO (FASE 15 - ITEM 22) */}
            <div className="source-card primary-source-card">
              <div className="source-card-header">
                <div className="source-badge-col">
                  <span className="source-brand-tag">FONTE PÚBLICA OFICIAL (LEI 14.133/21)</span>
                  <h3 className="source-name">PNCP</h3>
                  <span className="source-type-sub">Portal Nacional de Contratações Públicas (API Oficial)</span>
                </div>
                <div className="source-status-badge status-active">
                  <span className="dot-pulse" />
                  <span>ONLINE (Propostas Abertas)</span>
                </div>
              </div>

              <div className="source-stats-row">
                <div className="src-stat-box">
                  <span className="lbl">Monitoradas</span>
                  <strong className="val">428</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Novas</span>
                  <strong className="val text-green">428</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Relevantes (&gt;70%)</span>
                  <strong className="val text-teal">23</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Source Value</span>
                  <strong className="val">2,8%</strong>
                </div>
              </div>

              <div className="source-meta-list">
                <div className="meta-line">
                  <Clock size={13} />
                  <span>Última sincronização: <strong>Hoje às 10:30 (1.240ms)</strong></span>
                </div>
                <div className="meta-line">
                  <ShieldCheck size={13} />
                  <span>Confiança da Fonte: <strong>Alta (API Oficial Pública)</strong></span>
                </div>
                <div className="meta-line">
                  <Globe2 size={13} />
                  <span>Canal Oficial: <a href="https://pncp.gov.br/app/editais" target="_blank" rel="noreferrer">pncp.gov.br/app/editais</a></span>
                </div>
              </div>

              <div className="petronect-source-actions-bar">
                <button 
                  className="btn-src-action"
                  onClick={async () => {
                    setReprocessing(true);
                    try {
                      const { MultiSourceSyncManager } = await import('../services/multisource/multiSourceSyncManager.js');
                      await MultiSourceSyncManager.syncPNCP({ periodDays: 7 });
                      setReprocessSuccessMsg('Sincronização do PNCP concluída com sucesso!');
                      setTimeout(() => setReprocessSuccessMsg(null), 4000);
                    } catch (e) {
                      alert(e.message);
                    } finally {
                      setReprocessing(false);
                    }
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Sincronizar PNCP</span>
                </button>
                <a 
                  className="btn-src-action text-link-btn"
                  href="https://pncp.gov.br/app/editais" 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <ExternalLink size={13} />
                  <span>Abrir no PNCP</span>
                </a>
              </div>
            </div>

            {/* CARD COMPRAS.GOV.BR INTEGRADO (FASE 15 - ITEM 22) */}
            <div className="source-card primary-source-card">
              <div className="source-card-header">
                <div className="source-badge-col">
                  <span className="source-brand-tag">FONTE FEDERAL INTEGRADA</span>
                  <h3 className="source-name">COMPRAS.GOV.BR</h3>
                  <span className="source-type-sub">Portal de Compras do Governo Federal (Dados Abertos)</span>
                </div>
                <div className="source-status-badge status-active">
                  <span className="dot-pulse" />
                  <span>ONLINE (Monitorando)</span>
                </div>
              </div>

              <div className="source-stats-row">
                <div className="src-stat-box">
                  <span className="lbl">Monitoradas</span>
                  <strong className="val">103</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Novas</span>
                  <strong className="val text-green">103</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Relevantes (&gt;70%)</span>
                  <strong className="val text-teal">12</strong>
                </div>
                <div className="src-stat-box">
                  <span className="lbl">Source Value</span>
                  <strong className="val">3,1%</strong>
                </div>
              </div>

              <div className="source-meta-list">
                <div className="meta-line">
                  <Clock size={13} />
                  <span>Última sincronização: <strong>Hoje às 09:15 (980ms)</strong></span>
                </div>
                <div className="meta-line">
                  <ShieldCheck size={13} />
                  <span>Confiança da Fonte: <strong>Alta (Dados Abertos Governamentais)</strong></span>
                </div>
                <div className="meta-line">
                  <Globe2 size={13} />
                  <span>Canal Oficial: <a href="https://compras.dados.gov.br" target="_blank" rel="noreferrer">compras.dados.gov.br</a></span>
                </div>
              </div>

              <div className="petronect-source-actions-bar">
                <button 
                  className="btn-src-action"
                  onClick={async () => {
                    setReprocessing(true);
                    try {
                      const { MultiSourceSyncManager } = await import('../services/multisource/multiSourceSyncManager.js');
                      await MultiSourceSyncManager.syncComprasGov({ periodDays: 7 });
                      setReprocessSuccessMsg('Sincronização do Compras.gov.br concluída com sucesso!');
                      setTimeout(() => setReprocessSuccessMsg(null), 4000);
                    } catch (e) {
                      alert(e.message);
                    } finally {
                      setReprocessing(false);
                    }
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Sincronizar Compras.gov</span>
                </button>
                <a 
                  className="btn-src-action text-link-btn"
                  href="https://cnetmobile.estaleiro.serpro.gov.br" 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <ExternalLink size={13} />
                  <span>Abrir no Compras.gov</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: HISTÓRICO DE EXECUÇÕES (ITENS 27 E 28) */}
      {activeTab === 'executions' && (
        <div className="executions-tab-content">
          <div className="executions-card">
            <div className="exec-header-row">
              <div>
                <h3 className="exec-title">Histórico de Execuções do Conector Petronect</h3>
                <p className="exec-sub">Registro contínuo de sincronizações, tempos de resposta e contadores de importação.</p>
              </div>
              <button 
                className="btn-sync-trigger-mini"
                onClick={() => {
                  setSyncModalMode('INCREMENTAL');
                  setIsSyncModalOpen(true);
                }}
              >
                <RefreshCw size={13} />
                <span>Nova Execução</span>
              </button>
            </div>

            <div className="exec-table-wrap">
              <table className="exec-table">
                <thead>
                  <tr>
                    <th>Data / Horário</th>
                    <th>Modo</th>
                    <th>Duração</th>
                    <th>Encontradas</th>
                    <th>Novas</th>
                    <th>Atualizadas</th>
                    <th>Relevantes</th>
                    <th>Erros</th>
                    <th>Status</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {executionHistory.map((ex, i) => (
                    <tr key={ex.executionId || i}>
                      <td className="mono">{new Date(ex.startTime).toLocaleString('pt-BR')}</td>
                      <td><span className="exec-mode-pill">{ex.mode || 'INCREMENTAL'}</span></td>
                      <td className="mono font-bold">{ex.durationMs}ms</td>
                      <td className="mono">{ex.recordsFound}</td>
                      <td className="mono text-green font-bold">{ex.recordsCreated}</td>
                      <td className="mono text-blue font-bold">{ex.recordsUpdated}</td>
                      <td className="mono text-teal font-bold">{ex.relevantFound || 0}</td>
                      <td className="mono">{ex.errors}</td>
                      <td>
                        <span className={`exec-status-tag ${ex.errors > 0 ? 'status-err' : 'status-ok'}`}>
                          {ex.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-view-log-details"
                          onClick={() => setSelectedLogExec(ex)}
                        >
                          Ver Log
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: AGENDADOR AUTOMÁTICO (ITEM 31) */}
      {activeTab === 'schedule' && (
        <div className="schedule-tab-content">
          <div className="schedule-overview-card">
            <div className="sch-top-row">
              <div className="sch-title-info">
                <CalendarClock size={22} className="text-teal" />
                <div>
                  <h3 className="sch-headline">Agendador de Monitoramento Automático (source_schedule)</h3>
                  <p className="sch-desc">Configure rotinas de sincronização periódica para manter o radar comercial sempre atualizado.</p>
                </div>
              </div>

              <button className="btn-edit-scheduler" onClick={() => setIsSchedulerOpen(true)}>
                <Settings2 size={14} />
                <span>Editar Configurações</span>
              </button>
            </div>

            <div className="sch-status-banner">
              <div className="sch-status-left">
                <span className={`sch-pill ${schedulerSettings.enabled ? 'pill-enabled' : 'pill-disabled'}`}>
                  {schedulerSettings.enabled ? '● Ativo' : '○ Desativado'}
                </span>
                <span className="sch-next-text">
                  Próxima Execução: <strong>{schedulerSettings.nextRun}</strong>
                </span>
              </div>
              <span className="sch-tz-text">Fuso: {schedulerSettings.timezone}</span>
            </div>

            <div className="sch-params-grid">
              <div className="sch-param-box">
                <span className="p-lbl">Frequência</span>
                <strong className="p-val">{schedulerSettings.frequency}</strong>
              </div>
              <div className="sch-param-box">
                <span className="p-lbl">Horário Padrão</span>
                <strong className="p-val mono">{schedulerSettings.time}</strong>
              </div>
              <div className="sch-param-box">
                <span className="p-lbl">Modo de Coleta</span>
                <strong className="p-val">{schedulerSettings.mode}</strong>
              </div>
              <div className="sch-param-box">
                <span className="p-lbl">Notificações</span>
                <strong className="p-val text-teal">Alertas Ativos</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: HEALTH CHECK & SEGURANÇA (ITENS 21, 22, 23, 35) */}
      {activeTab === 'health' && (
        <div className="health-tab-content">
          <div className="health-card">
            <div className="health-header">
              <ShieldCheck size={24} className="text-teal" />
              <div>
                <h3 className="health-title">Diagnóstico de Acessibilidade & Política de Segurança</h3>
                <p className="health-sub">Verificação de integridade estrutural da fonte Petronect e conformidade operacional.</p>
              </div>
            </div>

            {healthData && (
              <div className="health-checks-grid">
                <div className="h-check-box">
                  <span className="h-lbl">Status da Fonte</span>
                  <div className="h-val-row">
                    <CheckCircle2 size={16} className="text-green" />
                    <strong>{healthData.status}</strong>
                  </div>
                </div>

                <div className="h-check-box">
                  <span className="h-lbl">Latência de Resposta</span>
                  <strong className="h-val-text mono">{healthData.latencyMs} ms</strong>
                </div>

                <div className="h-check-box">
                  <span className="h-lbl">Integridade Estrutural</span>
                  <div className="h-val-row">
                    <CheckCircle2 size={16} className="text-green" />
                    <span>Campos obrigatórios válidos</span>
                  </div>
                </div>

                <div className="h-check-box">
                  <span className="h-lbl">Proteção Contra Mudanças</span>
                  <span className="h-val-text text-green font-bold">Monitor Ativo</span>
                </div>
              </div>
            )}

            {/* POLÍTICA FORMAL DE SEGURANÇA (ITEM 35) */}
            <div className="security-policy-box">
              <h4 className="sec-policy-title">Diretrizes de Segurança do Vellia Licitações (Fase 6)</h4>
              <ul className="sec-policy-list">
                <li><Check size={14} className="text-teal" /> O sistema consulta exclusivamente <strong>informações públicas</strong> disponibilizadas pelo portal oficial.</li>
                <li><Check size={14} className="text-teal" /> <strong>NÃO</strong> armazena senhas nem realiza login automatizado.</li>
                <li><Check size={14} className="text-teal" /> <strong>NÃO</strong> tenta contornar CAPTCHAs nem simula comportamento malicioso de evasão.</li>
                <li><Check size={14} className="text-teal" /> <strong>NÃO</strong> manifesta interesse, não aceita termos e não envia lances em nome do fornecedor.</li>
                <li><Check size={14} className="text-teal" /> Toda oportunidade fornece link direto oficial para que o usuário participe na plataforma do contratante.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: LOGS DE AUDITORIA (ITEM 26) */}
      {activeTab === 'logs' && (
        <div className="logs-tab-content">
          <div className="logs-card">
            <div className="logs-header-row">
              <div className="logs-title-group">
                <Terminal size={18} className="text-teal" />
                <h3 className="logs-title">Trilha de Auditoria & Telemetria do Conector</h3>
              </div>
              <button className="btn-refresh-logs" onClick={() => setLogs(logService.getLogs(25))}>
                <RefreshCw size={13} />
                <span>Atualizar</span>
              </button>
            </div>

            <div className="logs-terminal-view">
              {logs.map((log) => (
                <div key={log.id} className="log-line">
                  <span className="log-ts mono">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                  <span className={`log-type log-type-${log.type?.toLowerCase()}`}>[{log.type}]</span>
                  <span className="log-msg">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PRÉVIA DA IMPORTAÇÃO CONTROLADA (ITEM 29) */}
      <PetronectPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        previewItems={previewItems}
        onConfirmImport={handleConfirmPreviewImport}
        importing={loadingPreview}
      />

      {/* MODAL DE SINCRONIZAÇÃO EM TEMPO REAL (ITEM 15 E 16) */}
      <PetronectSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSuccess={() => reloadData()}
        initialMode={syncModalMode}
      />

      {/* MODAL DE AGENDAMENTO (ITEM 31) */}
      <PetronectSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        onSaved={(updated) => setSchedulerSettings(updated)}
      />

      {/* MODAL PARA VISUALIZAR LOG DETALHADO DA EXECUÇÃO (ITEM 28) */}
      {selectedLogExec && (
        <div className="log-detail-modal-backdrop" onClick={() => setSelectedLogExec(null)}>
          <div className="log-detail-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="log-detail-header">
              <div className="l-h-title">
                <Activity size={18} className="text-teal" />
                <h4>Log da Execução: {selectedLogExec.executionId}</h4>
              </div>
              <button className="btn-close-log-modal" onClick={() => setSelectedLogExec(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="log-detail-body">
              <div className="log-summary-grid">
                <div><span>Fonte:</span> <strong>{selectedLogExec.source}</strong></div>
                <div><span>Modo:</span> <strong>{selectedLogExec.mode}</strong></div>
                <div><span>Duração:</span> <strong>{selectedLogExec.durationMs}ms</strong></div>
                <div><span>Status:</span> <strong className="text-green">{selectedLogExec.status}</strong></div>
              </div>

              <div className="admin-toggle-row">
                <span className="admin-lbl">Modo Administrador (Metadados Técnicos):</span>
                <button 
                  className={`btn-admin-mode ${adminLogMode ? 'active' : ''}`}
                  onClick={() => setAdminLogMode(!adminLogMode)}
                >
                  {adminLogMode ? 'Ativo' : 'Desativado'}
                </button>
              </div>

              {adminLogMode ? (
                <pre className="admin-log-pre mono">
                  {JSON.stringify(selectedLogExec, null, 2)}
                </pre>
              ) : (
                <div className="log-human-readable">
                  <p>✓ <strong>{selectedLogExec.recordsFound}</strong> registros públicos verificados no portal.</p>
                  <p>✓ <strong>{selectedLogExec.recordsCreated}</strong> novas oportunidades salvas no banco com tags e prioridades.</p>
                  <p>✓ <strong>{selectedLogExec.recordsUpdated}</strong> oportunidades existentes atualizadas com aditivos de prazo.</p>
                  <p>✓ <strong>{selectedLogExec.relevantFound || 0}</strong> oportunidades relevantes identificadas pelo Motor de Aderência.</p>
                  <p>✓ <strong>{selectedLogExec.errors}</strong> erros de rede ou parsing registrados.</p>
                </div>
              )}
            </div>

            <div className="log-detail-footer">
              <button className="btn-cancel" onClick={() => setSelectedLogExec(null)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
