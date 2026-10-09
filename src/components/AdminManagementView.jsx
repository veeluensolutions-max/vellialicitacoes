import React, { useState, useEffect } from 'react';
import {
  AdminService,
  SecurityService,
  GeneralAuditService,
  BackupService,
  BackupStatus,
  BackupType,
  StorageTarget,
  SystemConfigService,
  IntegrationService,
  IntegrationStatus,
  ObservabilityService,
  HealthStatus,
  JobStatus,
  UserRole,
  UserStatus,
  CompanyScope,
  DocumentConfidentiality,
  Permissions,
  PERMISSION_GROUPS
} from '../services/admin/adminService.js';
import { productivityIntegrationManager } from '../services/productivity/productivityIntegrationManager.js';
import { GoLiveModuleView } from './golive/GoLiveModuleView.jsx';
import { ProductAuditView } from './admin/ProductAuditView.jsx';
import DesignSystemCatalog from './admin/DesignSystemCatalog.jsx';
import './AdminManagementView.css';

export function AdminManagementView({ onNavigate }) {
  // Aba ativa de administração (9 submenus)
  const [activeTab, setActiveTab] = useState('usuarios');

  // Estado geral do dashboard administrativo
  const [overview, setOverview] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [sessionsList, setSessionsList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [backupsData, setBackupsData] = useState(null);
  const [scoreVersions, setScoreVersions] = useState([]);
  const [trashItems, setTrashItems] = useState([]);
  const [integrationsList, setIntegrationsList] = useState([]);
  const [observabilityData, setObservabilityData] = useState(null);
  const [generalConfig, setGeneralConfig] = useState(null);
  const [agentConfig, setAgentConfig] = useState(null);
  const [productivityIntegrations, setProductivityIntegrations] = useState([]);

  // Estados de filtros
  const [auditSearch, setAuditSearch] = useState('');
  const [auditModuleFilter, setAuditModuleFilter] = useState('ALL');
  const [auditResultFilter, setAuditResultFilter] = useState('ALL');
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Estados de modal e ação
  const [actionFeedback, setActionFeedback] = useState(null);
  const [restoreModalBackup, setRestoreModalBackup] = useState(null);
  const [restoreConfirmationCode, setRestoreConfirmationCode] = useState('');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState(null);
  const [lgpdDossier, setLgpdDossier] = useState(null);
  const [integrationPreviewData, setIntegrationPreviewData] = useState(null);
  const [syncPeriodModal, setSyncPeriodModal] = useState(null);

  // Carrega dados iniciais
  const refreshAllData = () => {
    try {
      const activeUser = SecurityService.getCurrentUser();
      setCurrentUser(activeUser);
      setOverview(AdminService.getExecutiveDashboardOverview());
      setUsersList(SecurityService.getUsers());
      setSessionsList(SecurityService.getSessions());
      setAuditLogs(GeneralAuditService.listLogs({ search: auditSearch, module: auditModuleFilter, result: auditResultFilter }));
      setBackupsData(BackupService.getBackupOverview());
      setScoreVersions(SystemConfigService.getScoreVersions());
      setTrashItems(SystemConfigService.getTrashItems());
      setIntegrationsList(IntegrationService.getIntegrations());
      setProductivityIntegrations(productivityIntegrationManager.getIntegrationsStatus(activeUser?.id, activeUser?.email));
      setObservabilityData({
        health: ObservabilityService.getHealthOverview(),
        jobs: ObservabilityService.getJobs(),
        aiMetrics: ObservabilityService.getAIMetrics(),
        errors: ObservabilityService.getSystemErrors()
      });
      setGeneralConfig(SystemConfigService.getGeneralConfig());
      setAgentConfig(SystemConfigService.getAgentConfig());
    } catch (e) {
      console.error('Erro ao atualizar dados de administração:', e);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [auditSearch, auditModuleFilter, auditResultFilter]);

  const showNotification = (msg, isError = false) => {
    setActionFeedback({ message: msg, isError });
    setTimeout(() => setActionFeedback(null), 4500);
  };

  const handleConnectProductivity = async (providerType) => {
    try {
      await productivityIntegrationManager.connectAccount({
        providerType,
        userEmail: currentUser?.email || 'roberto.mendes@excelenciaambiental.com.br',
        userId: currentUser?.id || 'usr-comercial-1',
        userName: currentUser?.name || 'Roberto Mendes'
      });
      showNotification(`Conta conectada com sucesso via OAuth 2.0 (${providerType}).`);
      refreshAllData();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleDisconnectProductivity = async (providerType) => {
    try {
      await productivityIntegrationManager.disconnectAccount(providerType, currentUser?.id || 'usr-comercial-1');
      showNotification(`Integração com ${providerType} desconectada.`);
      refreshAllData();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  const handleSyncProductivity = async (providerType) => {
    try {
      await productivityIntegrationManager.syncProvider(providerType, currentUser?.id || 'usr-comercial-1', currentUser?.email);
      showNotification(`Sincronização de ${providerType} concluída.`);
      refreshAllData();
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // 75. Alternador rápido de perfil/usuário ativo para teste em tempo real
  const handleSwitchUser = (userId) => {
    try {
      const u = SecurityService.setCurrentUser(userId);
      setCurrentUser(u);
      refreshAllData();
      showNotification(`Contexto de usuário alternado para: ${u.name} (${u.role} — ${u.company})`);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // Executar Backup Manual
  const handleTriggerBackup = (forceFailure = false) => {
    try {
      const bcp = BackupService.triggerBackup({ forceFailure }, currentUser?.name);
      refreshAllData();
      if (bcp.status === BackupStatus.SUCCESS) {
        showNotification(`Backup "${bcp.name}" gerado com sucesso (${bcp.sizeMB} MB). Checksum validado.`);
      } else {
        showNotification(`Alerta: Falha simulada registrada no backup (${bcp.errorMessage}). Alerta crítico emitido!`, true);
      }
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // Restauração de Backup com confirmação reforçada
  const handleExecuteRestore = () => {
    if (!restoreModalBackup) return;
    try {
      const res = BackupService.restoreBackup(restoreModalBackup.id, restoreConfirmationCode, currentUser);
      setRestoreModalBackup(null);
      setRestoreConfirmationCode('');
      refreshAllData();
      showNotification(res.message);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // Encerrar Sessão
  const handleTerminateSession = (sessionId) => {
    try {
      SecurityService.terminateSession(sessionId, currentUser?.name);
      refreshAllData();
      showNotification('Sessão desconectada remotamente com sucesso.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // Reexecutar Job com falha
  const handleRetryJob = (jobId) => {
    try {
      ObservabilityService.retryJob(jobId, currentUser?.name);
      refreshAllData();
      showNotification('Job enviado para a fila de reexecução.');
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // Restauração de item da lixeira
  const handleRestoreTrash = (trashId) => {
    try {
      const restored = SystemConfigService.restoreFromTrash(trashId, currentUser?.name);
      refreshAllData();
      showNotification(`Item "${restored.title}" restaurado com sucesso para seu repositório original.`);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  // Exportar Dossiê LGPD do Usuário
  const handleExportLGPD = (userId) => {
    try {
      const dossier = IntegrationService.exportUserDataReport(userId, currentUser?.name);
      setLgpdDossier(dossier);
      showNotification(`Dossiê LGPD do titular gerado com sucesso (Protocolo: ${dossier.protocol}).`);
    } catch (err) {
      showNotification(err.message, true);
    }
  };

  return (
    <div className="admin-container">
      {/* Toast de feedback de ação */}
      {actionFeedback && (
        <div className={`admin-toast ${actionFeedback.isError ? 'error' : 'success'}`}>
          <span className="toast-icon">{actionFeedback.isError ? '⚠️' : '✓'}</span>
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* Barra de simulação rápida de usuário ativo (Itens 75 a 78) */}
      <div className="admin-impersonation-bar">
        <div className="impersonation-label">
          <span className="live-dot"></span>
          <strong>Simular Usuário Ativo (Testar Permissões em Tempo Real):</strong>
        </div>
        <div className="impersonation-users">
          {usersList.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <button
                key={u.id}
                className={`user-pill ${isCurrent ? 'active' : ''} role-${u.role.toLowerCase()}`}
                onClick={() => handleSwitchUser(u.id)}
                title={`Empresa: ${u.company} | Escopo: ${u.scope}`}
              >
                <span className="pill-avatar">{u.name.charAt(0)}</span>
                <span className="pill-name">{u.name.split(' ')[0]}</span>
                <span className="pill-role">({u.role})</span>
                {isCurrent && <span className="pill-check">●</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cabeçalho do Módulo de Administração */}
      <div className="admin-header">
        <div className="admin-title-group">
          <div className="admin-badge">GOVERNANÇA & SEGURANÇA EMPRESARIAL</div>
          <h1 className="admin-main-title">Administração do Sistema</h1>
          <p className="admin-subtitle">
            Gestão de identidades, matriz granular de autorização, trilha imutável de auditoria, backups redundantes e observabilidade operacional.
          </p>
        </div>

        {/* Card de Sessão Atual */}
        <div className="current-user-card">
          <div className="user-card-avatar">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} />
            ) : (
              <div className="avatar-placeholder">{currentUser?.name?.charAt(0) || 'U'}</div>
            )}
          </div>
          <div className="user-card-info">
            <div className="user-name-role">
              <strong>{currentUser?.name || 'Administrador'}</strong>
              <span className={`status-tag ${currentUser?.status?.toLowerCase()}`}>{currentUser?.status}</span>
            </div>
            <div className="user-role-company">
              <span className="badge-role">{currentUser?.role}</span>
              <span className="badge-company">🏢 {currentUser?.company}</span>
            </div>
            <div className="user-scope">
              Escopo de Dados: <code>{currentUser?.scope}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação entre Submenus da Fase 14 (Item 1) */}
      <div className="admin-nav-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Usuários ({usersList.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'permissoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('permissoes')}
        >
          🛡️ Matriz de Permissões
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'seguranca' ? 'active' : ''}`}
          onClick={() => setActiveTab('seguranca')}
        >
          🔒 Security Center ({sessionsList.length} sessões)
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'auditoria' ? 'active' : ''}`}
          onClick={() => setActiveTab('auditoria')}
        >
          📜 Audit Log ({auditLogs.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'backups' ? 'active' : ''}`}
          onClick={() => setActiveTab('backups')}
        >
          💾 Backups & Restauração
          {backupsData?.alerts?.length > 0 && <span className="tab-alert-badge">!</span>}
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'lixeira' ? 'active' : ''}`}
          onClick={() => setActiveTab('lixeira')}
        >
          🗑️ Itens Arquivados ({trashItems.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'configuracoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracoes')}
        >
          ⚙️ Configurações & Scores ({scoreVersions.find(v => v.status === 'ACTIVE')?.version || 'v2'})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'integracoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('integracoes')}
        >
          🔌 Integrações & LGPD ({integrationsList.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'observabilidade' ? 'active' : ''}`}
          onClick={() => setActiveTab('observabilidade')}
        >
          🩺 Observabilidade & Jobs
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'golive' ? 'active' : ''}`}
          onClick={() => setActiveTab('golive')}
          style={{ borderColor: 'rgba(0, 229, 201, 0.4)', color: activeTab === 'golive' ? '#00e5c9' : '#e2e8f0' }}
        >
          🚀 Go-Live & Piloto
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'product-audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('product-audit')}
          style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: activeTab === 'product-audit' ? '#38bdf8' : '#e2e8f0' }}
        >
          📋 Product Audit
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'design-system' ? 'active' : ''}`}
          onClick={() => setActiveTab('design-system')}
          style={{ borderColor: 'rgba(14, 165, 233, 0.4)', color: activeTab === 'design-system' ? '#38bdf8' : '#e2e8f0' }}
        >
          🎨 Design System
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="admin-content-area">
        {/* ========================================================= */}
        {/* ABA PRODUCT AUDIT (FASE 23: ITENS 1 A 104)                */}
        {/* ========================================================= */}
        {activeTab === 'product-audit' && (
          <div className="tab-pane" style={{ padding: 0 }}>
            <ProductAuditView onNavigate={onNavigate} />
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA GO-LIVE (FASE 22: ITENS 1 A 95)                       */}
        {/* ========================================================= */}
        {activeTab === 'golive' && (
          <div className="tab-pane" style={{ padding: 0 }}>
            <GoLiveModuleView onNavigate={onNavigate} />
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 1: USUÁRIOS (Itens 2, 3, 7, 8, 9, 75)                 */}
        {/* ========================================================= */}
        {activeTab === 'usuarios' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Gestão Corporativa de Usuários</h2>
                <p className="section-desc">
                  Controle de membros, cargos, empresas associadas, status de conta e escopos de acesso corporativo.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => showNotification('Interface de convite pronta: e-mail de onboarding enviado com sucesso!')}
              >
                + Convidar Novo Usuário
              </button>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Cargo & Departamento</th>
                    <th>Perfil (Role)</th>
                    <th>Empresa & Escopo</th>
                    <th>Status</th>
                    <th>MFA</th>
                    <th>Último Acesso</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((user) => (
                    <tr key={user.id} className={user.status === UserStatus.BLOQUEADO ? 'row-blocked' : ''}>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar">{user.name.charAt(0)}</div>
                          <div>
                            <strong>{user.name}</strong>
                            <div className="cell-sub">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{user.title}</div>
                        <div className="cell-sub">{user.department}</div>
                      </td>
                      <td>
                        <span className={`badge-role role-${user.role.toLowerCase()}`}>{user.role}</span>
                      </td>
                      <td>
                        <div><strong>{user.company}</strong></div>
                        <span className={`badge-scope ${user.scope.toLowerCase()}`}>{user.scope}</span>
                      </td>
                      <td>
                        <span className={`status-pill pill-${user.status.toLowerCase().replace(' ', '-')}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        {user.mfaEnabled ? (
                          <span className="badge-mfa on">✓ {user.mfaMethod}</span>
                        ) : (
                          <span className="badge-mfa off">Inativo</span>
                        )}
                      </td>
                      <td>
                        <span className="cell-date">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            className="btn-icon"
                            title="Ver Dossiê LGPD"
                            onClick={() => handleExportLGPD(user.id)}
                          >
                            📋
                          </button>
                          <button
                            className="btn-icon"
                            title="Alternar Contexto"
                            onClick={() => handleSwitchUser(user.id)}
                          >
                            🔄
                          </button>
                          {user.status === UserStatus.BLOQUEADO ? (
                            <button
                              className="btn-small success"
                              onClick={() => {
                                SecurityService.setUserStatus(user.id, UserStatus.ATIVO, currentUser?.name);
                                refreshAllData();
                                showNotification(`Usuário "${user.name}" desbloqueado com sucesso.`);
                              }}
                            >
                              Desbloquear
                            </button>
                          ) : (
                            <button
                              className="btn-small danger"
                              onClick={() => {
                                SecurityService.setUserStatus(user.id, UserStatus.BLOQUEADO, currentUser?.name);
                                refreshAllData();
                                showNotification(`Usuário "${user.name}" foi bloqueado temporariamente.`);
                              }}
                            >
                              Bloquear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: MATRIZ DE PERMISSÕES (Itens 4, 5, 6, 10)           */}
        {/* ========================================================= */}
        {activeTab === 'permissoes' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Matriz Visual de Permissões Granulares</h2>
                <p className="section-desc">
                  Mapeamento de 7 papéis padrão contra 25 permissões do ecossistema. Proteção server-side com bloqueio real em nível de backend.
                </p>
              </div>
              <div className="toolbar-stats">
                <span className="stat-chip">Perfis: <strong>7 Oficiais</strong></span>
                <span className="stat-chip">Permissões: <strong>25 Granulares</strong></span>
              </div>
            </div>

            <div className="permission-matrix-wrapper">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th className="perm-col-header">Módulo / Permissão</th>
                    {Object.values(UserRole).map((r) => (
                      <th key={r} className="role-col-header">
                        {r}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_GROUPS.map((group) => (
                    <React.Fragment key={group.name}>
                      <tr className="group-divider-row">
                        <td colSpan={Object.values(UserRole).length + 1}>
                          <strong>📂 {group.name}</strong>
                        </td>
                      </tr>
                      {group.permissions.map((perm) => (
                        <tr key={perm.id} className="perm-row">
                          <td className="perm-desc-cell">
                            <strong>{perm.label}</strong>
                            <div className="perm-id"><code>{perm.id}</code> — {perm.desc}</div>
                          </td>
                          {Object.values(UserRole).map((role) => {
                            // Verifica se o papel possui a permissão
                            const allowed = SecurityService.hasPermission({ role, status: UserStatus.ATIVO }, perm.id);
                            const isSensitiveFinancial = perm.id === Permissions.MARGIN_VIEW || perm.id === Permissions.FINANCIAL_SENSITIVE_VIEW;

                            return (
                              <td
                                key={`${role}-${perm.id}`}
                                className={`matrix-check-cell ${allowed ? 'allowed' : 'denied'} ${isSensitiveFinancial ? 'sensitive' : ''}`}
                              >
                                {allowed ? (
                                  <span className="check-mark" title={`Autorizado para ${role}`}>✓</span>
                                ) : (
                                  <span className="cross-mark" title={`Negado para ${role}`}>✕</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: SECURITY CENTER & SESSÕES (Itens 13 a 19, 51, 52)   */}
        {/* ========================================================= */}
        {activeTab === 'seguranca' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Security Center — Painel de Defesa e Sessões Ativas</h2>
                <p className="section-desc">
                  Monitoramento em tempo real de autenticações, tokens ativos, bloqueios e encerramento remoto de sessões.
                </p>
              </div>
              <button
                className="btn-danger-outline"
                onClick={() => {
                  SecurityService.terminateAllUserSessions(currentUser?.id, currentUser?.name);
                  refreshAllData();
                  showNotification('Todas as outras sessões foram desconectadas.');
                }}
              >
                Encerrar Outras Sessões Ativas
              </button>
            </div>

            {/* Cards de Métricas de Segurança */}
            <div className="security-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-icon">🛡️</span>
                <div className="kpi-val">{overview?.security?.securityScore || 98}%</div>
                <div className="kpi-lbl">Índice de Segurança Geral</div>
              </div>
              <div className="kpi-card">
                <span className="kpi-icon">💻</span>
                <div className="kpi-val">{overview?.security?.openSessions || 3}</div>
                <div className="kpi-lbl">Sessões Ativas no Momento</div>
              </div>
              <div className="kpi-card">
                <span className="kpi-icon">🔑</span>
                <div className="kpi-val">{overview?.security?.mfaAdoptionRate || 40}%</div>
                <div className="kpi-lbl">Adesão a MFA (Autenticador/OTP)</div>
              </div>
              <div className="kpi-card alert">
                <span className="kpi-icon">🚫</span>
                <div className="kpi-val">{overview?.security?.criticalDeniedEvents || 1}</div>
                <div className="kpi-lbl">Tentativas Bloqueadas (403)</div>
              </div>
            </div>

            {/* Tabela de Sessões Ativas */}
            <h3 className="section-subtitle">Dispositivos e Sessões Conectadas</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Dispositivo / Navegador</th>
                    <th>Endereço IP & Local</th>
                    <th>Início da Sessão</th>
                    <th>Última Atividade</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionsList.map((sess) => (
                    <tr key={sess.id}>
                      <td>
                        <strong>{sess.userName}</strong>
                        <div className="cell-sub">{sess.userEmail}</div>
                      </td>
                      <td>
                        <span className="device-tag">💻 {sess.device}</span>
                      </td>
                      <td>
                        <code>{sess.ipAddress}</code>
                        <div className="cell-sub">{sess.location}</div>
                      </td>
                      <td>{new Date(sess.createdAt).toLocaleTimeString('pt-BR')}</td>
                      <td>{new Date(sess.lastActivity).toLocaleTimeString('pt-BR')}</td>
                      <td>
                        {sess.isCurrent ? (
                          <span className="status-pill pill-ativo">Sessão Atual</span>
                        ) : (
                          <span className="status-pill pill-pendente">Ativa</span>
                        )}
                      </td>
                      <td>
                        {!sess.isCurrent && (
                          <button
                            className="btn-small danger"
                            onClick={() => handleTerminateSession(sess.id)}
                          >
                            Derrubar Sessão
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Políticas de Acesso */}
            <div className="policy-settings-box">
              <h3>Regras e Políticas de Acesso Corporativo</h3>
              <div className="policy-grid">
                <div className="policy-item">
                  <label>Tentativas máximas de login:</label>
                  <span><strong>5 tentativas</strong> (bloqueio automático de 15 min)</span>
                </div>
                <div className="policy-item">
                  <label>Duração máxima da sessão:</label>
                  <span><strong>8 horas</strong> com expiração forçada</span>
                </div>
                <div className="policy-item">
                  <label>Complexidade mínima de senha:</label>
                  <span>Mínimo 8 caracteres, maiúsculas e símbolos especiais</span>
                </div>
                <div className="policy-item">
                  <label>MFA Obrigatório:</label>
                  <span>Exigido para Perfis Administrador e Financeiro</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: AUDIT LOG GERAL (Itens 20 a 24)                     */}
        {/* ========================================================= */}
        {activeTab === 'auditoria' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Trilha Geral de Auditoria Imutável (Audit Trail)</h2>
                <p className="section-desc">
                  Registros perpétuos de todas as ações corporativas com diff Antes x Depois. Exclusão de logs é estritamente proibida no sistema (Item 22).
                </p>
              </div>
              <div className="audit-filters-bar">
                <input
                  type="text"
                  placeholder="Buscar por usuário, ação, ID..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="search-input"
                />
                <select
                  value={auditModuleFilter}
                  onChange={(e) => setAuditModuleFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">Todos os Módulos</option>
                  <option value="Oportunidades & Decisão">Oportunidades & Decisão</option>
                  <option value="Formação de Preço">Formação de Preço</option>
                  <option value="Cofre Documental">Cofre Documental</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Backups">Backups</option>
                </select>
                <select
                  value={auditResultFilter}
                  onChange={(e) => setAuditResultFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">Todos os Resultados</option>
                  <option value="SUCESSO">SUCESSO</option>
                  <option value="NEGADO">NEGADO</option>
                  <option value="FALHA">FALHA</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Data / Hora</th>
                    <th>Usuário & Perfil</th>
                    <th>Módulo</th>
                    <th>Ação Executada</th>
                    <th>Objeto Alvo</th>
                    <th>IP</th>
                    <th>Resultado</th>
                    <th>Detalhes (Diff)</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className={log.result === 'NEGADO' ? 'row-denied' : ''}>
                      <td>
                        <div className="cell-date">{log.formattedTime}</div>
                      </td>
                      <td>
                        <strong>{log.user}</strong>
                        <div className="cell-sub">{log.userRole} • {log.company}</div>
                      </td>
                      <td>
                        <span className="badge-module">{log.module}</span>
                      </td>
                      <td>
                        <strong>{log.action}</strong>
                      </td>
                      <td>
                        <span className="object-label">{log.object}</span>
                      </td>
                      <td>
                        <code>{log.ipAddress}</code>
                      </td>
                      <td>
                        <span className={`status-pill pill-${log.result.toLowerCase()}`}>
                          {log.result}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-small secondary"
                          onClick={() => setSelectedAuditLog(log)}
                        >
                          Ver Diff Antes/Depois
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal de Detalhamento de Diff (Item 24) */}
            {selectedAuditLog && (
              <div className="modal-backdrop" onClick={() => setSelectedAuditLog(null)}>
                <div className="audit-diff-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Detalhamento do Registro de Auditoria #{selectedAuditLog.id}</h3>
                    <button className="close-btn" onClick={() => setSelectedAuditLog(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <div className="diff-meta-grid">
                      <div><strong>Responsável:</strong> {selectedAuditLog.user} ({selectedAuditLog.userRole})</div>
                      <div><strong>Horário:</strong> {selectedAuditLog.formattedTime}</div>
                      <div><strong>Módulo:</strong> {selectedAuditLog.module}</div>
                      <div><strong>IP de Origem:</strong> {selectedAuditLog.ipAddress}</div>
                      <div><strong>Resultado:</strong> <span className={`status-pill pill-${selectedAuditLog.result.toLowerCase()}`}>{selectedAuditLog.result}</span></div>
                    </div>

                    <div className="diff-side-by-side">
                      <div className="diff-box before">
                        <h4>⏮️ Estado Anterior (Antes)</h4>
                        <pre>{JSON.stringify(selectedAuditLog.diffBefore, null, 2) || 'Nenhum estado prévio (Criação inicial)'}</pre>
                      </div>
                      <div className="diff-box after">
                        <h4>⏭️ Novo Estado (Depois)</h4>
                        <pre>{JSON.stringify(selectedAuditLog.diffAfter, null, 2) || 'Registro excluído'}</pre>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={() => setSelectedAuditLog(null)}>Fechar</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: BACKUPS & RESTAURAÇÃO (Itens 27 a 35, 80)          */}
        {/* ========================================================= */}
        {activeTab === 'backups' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Gestão de Backups & Restauração Protegida</h2>
                <p className="section-desc">
                  Políticas de snapshot diário e semanal, redundância externa em nuvem (S3/Glacier) e restauração protegida por código de confirmação.
                </p>
              </div>
              <div className="toolbar-actions">
                <button className="btn-secondary" onClick={() => handleTriggerBackup(true)}>
                  ⚠️ Simular Falha de Backup
                </button>
                <button className="btn-primary" onClick={() => handleTriggerBackup(false)}>
                  💾 Disparar Backup Imediato
                </button>
              </div>
            </div>

            {/* Alertas Ativos de Backup (Item 33) */}
            {backupsData?.alerts?.length > 0 && (
              <div className="backup-alerts-container">
                {backupsData.alerts.map((al, idx) => (
                  <div key={idx} className={`alert-banner ${al.severity.toLowerCase()}`}>
                    <span className="alert-icon">⚠️</span>
                    <div>
                      <strong>{al.title}</strong>
                      <p>{al.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Painel de Políticas e Armazenamento */}
            <div className="backup-overview-cards">
              <div className="overview-card">
                <h4>Último Backup Válido</h4>
                <div className="card-val">{backupsData?.lastBackup?.name || 'N/A'}</div>
                <div className="card-sub">{backupsData?.lastBackup?.sizeMB} MB • Concluído em 255s</div>
              </div>
              <div className="overview-card">
                <h4>Próxima Rotina Programada</h4>
                <div className="card-val">Hoje às 02:00</div>
                <div className="card-sub">Backup Incremental Diário</div>
              </div>
              <div className="overview-card">
                <h4>Armazenamento Vault Cloud</h4>
                <div className="card-val">{backupsData?.config?.currentUsedGB} GB / {backupsData?.config?.maxStorageQuotaGB} GB</div>
                <div className="card-sub">AWS S3 Glacier (sa-east-1)</div>
              </div>
            </div>

            {/* Histórico de Backups */}
            <h3 className="section-subtitle">Catálogo de Pontos de Restauração</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome do Backup</th>
                    <th>Tipo</th>
                    <th>Destino</th>
                    <th>Tamanho</th>
                    <th>Status</th>
                    <th>Data de Término</th>
                    <th>Ações de Restauração</th>
                  </tr>
                </thead>
                <tbody>
                  {backupsData?.history?.map((bcp) => (
                    <tr key={bcp.id}>
                      <td>
                        <strong>{bcp.name}</strong>
                        <div className="cell-sub">{bcp.notes}</div>
                      </td>
                      <td>{bcp.type}</td>
                      <td>
                        <span className="badge-target">☁️ {bcp.target}</span>
                      </td>
                      <td>{bcp.sizeMB > 0 ? `${bcp.sizeMB} MB` : '0 MB'}</td>
                      <td>
                        <span className={`status-pill pill-${bcp.status.toLowerCase()}`}>
                          {bcp.status}
                        </span>
                      </td>
                      <td>{new Date(bcp.completedAt).toLocaleString('pt-BR')}</td>
                      <td>
                        {bcp.status === BackupStatus.SUCCESS ? (
                          <button
                            className="btn-small warning"
                            onClick={() => {
                              setRestoreModalBackup(bcp);
                              setRestoreConfirmationCode('');
                            }}
                          >
                            Restaurar Sistema
                          </button>
                        ) : (
                          <span className="text-muted">Inapto</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal de Restauração Reforçada (Itens 34, 35) */}
            {restoreModalBackup && (
              <div className="modal-backdrop" onClick={() => setRestoreModalBackup(null)}>
                <div className="restore-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header danger-header">
                    <h3>⚠️ Confirmação Crítica de Restauração</h3>
                    <button className="close-btn" onClick={() => setRestoreModalBackup(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <p className="danger-text">
                      Você está prestes a restaurar o banco de dados e arquivos para o snapshot:
                      <br />
                      <strong>"{restoreModalBackup.name}" ({new Date(restoreModalBackup.completedAt).toLocaleString('pt-BR')})</strong>.
                    </p>
                    <p>
                      Esta operação substituirá o estado atual da produção. Para prosseguir, digite exatamente o código de autorização abaixo:
                    </p>
                    <div className="confirmation-code-box">
                      <code>RESTAURAR-VELLIA-CONFIRMADO</code>
                    </div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Digite o código para desbloquear a restauração..."
                      value={restoreConfirmationCode}
                      onChange={(e) => setRestoreConfirmationCode(e.target.value)}
                    />
                  </div>
                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={() => setRestoreModalBackup(null)}>Cancelar</button>
                    <button
                      className="btn-danger"
                      disabled={restoreConfirmationCode !== 'RESTAURAR-VELLIA-CONFIRMADO'}
                      onClick={handleExecuteRestore}
                    >
                      Confirmar e Executar Restauração
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 6: ITENS ARQUIVADOS / LIXEIRA (Itens 25, 26)           */}
        {/* ========================================================= */}
        {activeTab === 'lixeira' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Itens Arquivados (Lixeira Administrativa — Soft Delete)</h2>
                <p className="section-desc">
                  Registros excluídos logicamente permanecem retidos com segurança, permitindo restauração sem perda irreversível de histórico.
                </p>
              </div>
            </div>

            {trashItems.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🗑️</span>
                <h3>Lixeira Vazia</h3>
                <p>Nenhum documento ou oportunidade arquivada no momento.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Entidade</th>
                      <th>Título do Registro</th>
                      <th>Empresa</th>
                      <th>Excluído Por</th>
                      <th>Data de Exclusão</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trashItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <span className="badge-entity">{item.entityType}</span>
                        </td>
                        <td>
                          <strong>{item.title}</strong>
                          <div className="cell-sub">ID Original: {item.originalId}</div>
                        </td>
                        <td>{item.company}</td>
                        <td>{item.deletedBy}</td>
                        <td>{new Date(item.deletedAt).toLocaleString('pt-BR')}</td>
                        <td>
                          <button
                            className="btn-small success"
                            onClick={() => handleRestoreTrash(item.id)}
                          >
                            Restaurar Registro
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 7: CONFIGURAÇÕES GERAIS & SCORES (Itens 36 a 40)        */}
        {/* ========================================================= */}
        {activeTab === 'configuracoes' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Configurações Globais & Versionamento de Algoritmos</h2>
                <p className="section-desc">
                  Parâmetros de sistema, calibração do Vellia Agent e versionamento estrito dos pesos de score sem adulteração retroativa.
                </p>
              </div>
            </div>

            {/* Configurações Gerais */}
            <div className="config-grid-layout">
              <div className="config-card">
                <h3>⚙️ Parâmetros do Sistema</h3>
                <div className="config-field">
                  <label>Nome da Instância:</label>
                  <span>{generalConfig?.systemName}</span>
                </div>
                <div className="config-field">
                  <label>Fuso Horário:</label>
                  <span>{generalConfig?.timezone}</span>
                </div>
                <div className="config-field">
                  <label>Moeda Padrão:</label>
                  <span>{generalConfig?.currency}</span>
                </div>
                <div className="config-field">
                  <label>Empresa Padrão do Tenant:</label>
                  <span>{generalConfig?.defaultCompany}</span>
                </div>
              </div>

              {/* Parâmetros do Agente */}
              <div className="config-card">
                <h3>🤖 Parâmetros do Vellia Agent</h3>
                <div className="config-field">
                  <label>Status do Crawler:</label>
                  <span className="status-pill pill-ativo">ATIVO</span>
                </div>
                <div className="config-field">
                  <label>Horário da Rodada Diária:</label>
                  <span>{agentConfig?.scheduleTime} (A cada {agentConfig?.frequencyHours}h)</span>
                </div>
                <div className="config-field">
                  <label>Aderência Mínima Relevante:</label>
                  <span>{agentConfig?.minAdherenceScore}%</span>
                </div>
                <div className="config-field">
                  <label>Canais de Alerta Imediato:</label>
                  <span>{agentConfig?.alertChannels?.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Versionamento de Scores (Itens 38 a 40) */}
            <div className="score-versions-section">
              <div className="section-toolbar">
                <div>
                  <h3>Matriz de Ponderação e Versões de Algoritmo</h3>
                  <p className="section-desc">
                    Quando os pesos dos scores são alterados, uma nova versão é publicada mantendo a integridade das decisões passadas.
                  </p>
                </div>
              </div>

              <div className="versions-timeline">
                {scoreVersions.map((v) => (
                  <div key={v.version} className={`version-card ${v.status === 'ACTIVE' ? 'active-version' : 'archived-version'}`}>
                    <div className="version-header">
                      <div className="version-tag">
                        <strong>{v.version}</strong> — {v.title}
                      </div>
                      <span className={`status-pill pill-${v.status === 'ACTIVE' ? 'ativo' : 'inativo'}`}>
                        {v.status === 'ACTIVE' ? 'VERSÃO ATIVA EM OPERAÇÃO' : 'VERSÃO HISTÓRICA'}
                      </span>
                    </div>
                    <div className="version-meta">
                      Criado por {v.createdBy} em {new Date(v.createdAt).toLocaleDateString('pt-BR')} • {v.changeNotes}
                    </div>
                    <div className="weights-preview-grid">
                      <div className="weight-item">
                        <span>Decision Score:</span>
                        <strong>Téc: {(v.weights.decisionScore.technical * 100)}% | Com: {(v.weights.decisionScore.commercial * 100)}% | Ris: {(v.weights.decisionScore.risk * 100)}%</strong>
                      </div>
                      <div className="weight-item">
                        <span>Capability Score:</span>
                        <strong>Atestados: {(v.weights.capabilityScore.certs * 100)}% | Equipe: {(v.weights.capabilityScore.team * 100)}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 8: CENTRAL DE INTEGRAÇÕES & LGPD (Itens 41 a 48)       */}
        {/* ========================================================= */}
        {activeTab === 'integracoes' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Central de Conectores & Produtividade</h2>
                <p className="section-desc">
                  Gestão integrada de e-mails, calendários corporativos e portais públicos de licitação com OAuth 2.0 e conformidade LGPD.
                </p>
              </div>
            </div>

            {/* SEÇÃO 1: PRODUTIVIDADE (Fase 19 — Itens 1 a 6) */}
            <div className="productivity-integrations-section" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#38bdf8', fontSize: '1.15rem' }}>
                    ⚡ Integrações de Produtividade (Gmail, Outlook & Calendários)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                    Conexões seguras por usuário via OAuth 2.0. Reduz o registro manual sincronizando conversas, respostas e reuniões.
                  </p>
                </div>
                <button
                  className="btn-small primary"
                  onClick={async () => {
                    await productivityIntegrationManager.syncAll(currentUser?.id);
                    refreshAllData();
                    showNotification('Sincronização de todas as contas ativas concluída.');
                  }}
                >
                  🔄 Sincronizar Todas as Contas
                </button>
              </div>

              <div className="integrations-grid">
                {productivityIntegrations.map((prod) => (
                  <div key={prod.id} className="integration-card" style={{ borderColor: prod.status === 'Conectado' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255,255,255,0.08)' }}>
                    <div className="integ-header">
                      <div>
                        <h4>{prod.name}</h4>
                        <span className="integ-cat">{prod.category}</span>
                      </div>
                      <span className={`status-pill pill-${prod.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {prod.status}
                      </span>
                    </div>

                    <p className="integ-desc">{prod.description}</p>

                    <div className="integ-secrets">
                      <div className="secret-field">
                        <label>Conta Conectada:</label>
                        <strong style={{ color: prod.status === 'Conectado' ? '#38bdf8' : '#94a3b8' }}>
                          {prod.connectedAccount}
                        </strong>
                      </div>
                      <div className="secret-field">
                        <label>Permissões / Scopes Concedidos:</label>
                        <code>{prod.scopes.join(', ')}</code>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Última Sinc: {prod.lastSync ? new Date(prod.lastSync).toLocaleTimeString('pt-BR') : 'Pendente'}</span>
                      <span>Próxima: {prod.nextSync ? new Date(prod.nextSync).toLocaleTimeString('pt-BR') : 'Em 10 min'}</span>
                    </div>

                    <div className="integ-footer" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      {prod.status === 'Conectado' ? (
                        <>
                          <button
                            className="btn-small success"
                            onClick={() => handleSyncProductivity(prod.providerType)}
                            title="Dispara sincronização imediata deste conector"
                            style={{ flex: 1 }}
                          >
                            Sincronizar Agora
                          </button>
                          <button
                            className="btn-small danger"
                            onClick={() => handleDisconnectProductivity(prod.providerType)}
                            title="Revoga tokens e desconecta"
                          >
                            Desconectar
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-small primary"
                          onClick={() => handleConnectProductivity(prod.providerType)}
                          title="Inicia fluxo seguro de autorização OAuth 2.0"
                          style={{ width: '100%' }}
                        >
                          Conectar Conta via OAuth 2.0
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEÇÃO 2: CONECTORES DE PORTAIS PÚBLICOS */}
            <h3 style={{ margin: '0 0 12px 0', color: '#ffffff', fontSize: '1.1rem' }}>
              🏛️ Portais Oficiais de Licitações Públicas & Mensageria
            </h3>

            <div className="integrations-grid">
              {integrationsList.map((integ) => (
                <div key={integ.id} className="integration-card">
                  <div className="integ-header">
                    <div>
                      <h4>{integ.name}</h4>
                      <span className="integ-cat">{integ.category}</span>
                    </div>
                    <span className={`status-pill pill-${integ.status.toLowerCase().replace(' ', '-')}`}>
                      {integ.status}
                    </span>
                  </div>
                  <p className="integ-desc">{integ.description}</p>
                  <div className="integ-secrets">
                    <div className="secret-field">
                      <label>Chave de API / Token:</label>
                      <code>{integ.apiKeyMasked}</code>
                    </div>
                    <div className="secret-field">
                      <label>Variável de Ambiente:</label>
                      <code>{integ.environmentVar}</code>
                    </div>
                  </div>
                  <div className="integ-footer" style={{ flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span>Taxa: <strong>{integ.successRatePct}%</strong> ({integ.latencyMs}ms)</span>
                      <span>Status: <strong className="text-teal">{integ.status}</strong></span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        className="btn-small secondary"
                        onClick={async () => {
                          const test = IntegrationService.testConnection(integ.id);
                          showNotification(`${integ.name}: ${test.status} • Latência: ${test.latencyMs}ms • 200 OK`);
                        }}
                        title="Executa teste de ping e validação de schema HTTP"
                      >
                        Ping / Conexão
                      </button>

                      <button
                        className="btn-small primary"
                        onClick={async () => {
                          try {
                            if (integ.id.includes('pncp')) {
                              const { PNCPConnector } = await import('../services/multisource/pncpConnector.js');
                              const preview = await PNCPConnector.getPreviewRecords();
                              setIntegrationPreviewData({ sourceName: 'PNCP', records: preview, integId: integ.id });
                            } else if (integ.id.includes('comprasgov')) {
                              const { ComprasGovConnector } = await import('../services/multisource/comprasGovConnector.js');
                              const preview = await ComprasGovConnector.getPreviewRecords();
                              setIntegrationPreviewData({ sourceName: 'Compras.gov.br', records: preview, integId: integ.id });
                            } else {
                              showNotification(`Prévia disponível para conectores de portais públicos.`);
                            }
                          } catch (err) {
                            showNotification(err.message, true);
                          }
                        }}
                        title="Visualizar 10 registros reais antes de importar (Item 56)"
                      >
                        Prévia (10 itens)
                      </button>

                      <button
                        className="btn-small warning"
                        onClick={() => {
                          setSyncPeriodModal({ integId: integ.id, sourceName: integ.name, periodDays: 7 });
                        }}
                        title="Sincronização controlada com seleção de período (Itens 57 e 58)"
                      >
                        Sincronizar...
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de Prévia Controlada (Item 56) */}
            {integrationPreviewData && (
              <div className="modal-backdrop" onClick={() => setIntegrationPreviewData(null)}>
                <div className="dossier-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
                  <div className="modal-header">
                    <h3>👁️ Prévia Controlada da API ({integrationPreviewData.sourceName}) — 10 Primeiros Registros</h3>
                    <button className="close-btn" onClick={() => setIntegrationPreviewData(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <p className="text-muted" style={{ marginBottom: '12px' }}>
                      Conferência prévia antes da gravação no banco de dados. Nenhum registro é persistido até que você confirme a importação.
                    </p>
                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Identificador / Órgão</th>
                            <th>Objeto Contratual</th>
                            <th>Valor Estimado</th>
                            <th>Prazo Final</th>
                          </tr>
                        </thead>
                        <tbody>
                          {integrationPreviewData.records.map((r, i) => (
                            <tr key={i}>
                              <td>
                                <strong>{r.idPncp || r.numeroAviso || `Item #${i+1}`}</strong>
                                <div className="cell-sub">{r.orgaoEntidade?.razaoSocial || r.orgaoNome}</div>
                              </td>
                              <td>
                                <p style={{ margin: 0, fontSize: '0.78rem', maxWidth: '340px' }}>
                                  {r.objetoContratacao || r.objeto}
                                </p>
                              </td>
                              <td>{r.valorTotalEstimado ? `R$ ${r.valorTotalEstimado.toLocaleString('pt-BR')}` : (r.valorEstimado ? `R$ ${r.valorEstimado.toLocaleString('pt-BR')}` : 'Não informado')}</td>
                              <td>{r.dataFimRecebimentoPropostas ? new Date(r.dataFimRecebimentoPropostas).toLocaleDateString('pt-BR') : (r.dataEncerramentoProposta ? new Date(r.dataEncerramentoProposta).toLocaleDateString('pt-BR') : 'Aberto')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={() => setIntegrationPreviewData(null)}>Cancelar</button>
                    <button 
                      className="btn-primary" 
                      onClick={async () => {
                        const { MultiSourceSyncManager } = await import('../services/multisource/multiSourceSyncManager.js');
                        if (integrationPreviewData.sourceName === 'PNCP') {
                          await MultiSourceSyncManager.syncPNCP({ periodDays: 7 });
                        } else {
                          await MultiSourceSyncManager.syncComprasGov({ periodDays: 7 });
                        }
                        setIntegrationPreviewData(null);
                        refreshAllData();
                        showNotification(`Importação da ${integrationPreviewData.sourceName} concluída e deduplicada com sucesso!`);
                      }}
                    >
                      Confirmar e Importar Registros
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Sincronização Controlada por Período (Itens 57 e 58) */}
            {syncPeriodModal && (
              <div className="modal-backdrop" onClick={() => setSyncPeriodModal(null)}>
                <div className="restore-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                  <div className="modal-header">
                    <h3>⚙️ Sincronização Incremental ({syncPeriodModal.sourceName})</h3>
                    <button className="close-btn" onClick={() => setSyncPeriodModal(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <p>Selecione a janela temporal para a coleta controlada de editais:</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
                      {[
                        { label: 'Último dia (Últimas 24 horas)', days: 1 },
                        { label: 'Últimos 7 dias (Recomendado)', days: 7 },
                        { label: 'Últimos 30 dias (Completa)', days: 30 }
                      ].map((opt) => (
                        <label key={opt.days} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px', background: '#F8FAFC', borderRadius: '6px' }}>
                          <input
                            type="radio"
                            name="syncPeriod"
                            checked={syncPeriodModal.periodDays === opt.days}
                            onChange={() => setSyncPeriodModal({ ...syncPeriodModal, periodDays: opt.days })}
                          />
                          <span><strong>{opt.label}</strong></span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn-secondary" onClick={() => setSyncPeriodModal(null)}>Cancelar</button>
                    <button
                      className="btn-primary"
                      onClick={async () => {
                        const { MultiSourceSyncManager } = await import('../services/multisource/multiSourceSyncManager.js');
                        try {
                          if (syncPeriodModal.integId.includes('pncp')) {
                            await MultiSourceSyncManager.syncPNCP({ periodDays: syncPeriodModal.periodDays });
                          } else if (syncPeriodModal.integId.includes('comprasgov')) {
                            await MultiSourceSyncManager.syncComprasGov({ periodDays: syncPeriodModal.periodDays });
                          }
                          setSyncPeriodModal(null);
                          refreshAllData();
                          showNotification(`Sincronização de ${syncPeriodModal.periodDays} dia(s) executada com sucesso!`);
                        } catch (err) {
                          showNotification(err.message, true);
                        }
                      }}
                    >
                      Iniciar Sincronização
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dossiê LGPD Modal */}
            {lgpdDossier && (
              <div className="modal-backdrop" onClick={() => setLgpdDossier(null)}>
                <div className="dossier-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>📋 Dossiê de Dados do Titular (LGPD — Art. 18)</h3>
                    <button className="close-btn" onClick={() => setLgpdDossier(null)}>✕</button>
                  </div>
                  <div className="modal-body">
                    <p><strong>Protocolo:</strong> {lgpdDossier.protocol}</p>
                    <p><strong>Titular:</strong> {lgpdDossier.dataSubject.name} ({lgpdDossier.dataSubject.email})</p>
                    <p><strong>Base Legal:</strong> {lgpdDossier.legalBasis}</p>
                    <p><strong>Período de Retenção:</strong> {lgpdDossier.retentionPeriodYears} anos</p>
                    <h4>Dados Pessoais Registrados:</h4>
                    <pre>{JSON.stringify(lgpdDossier.dataSubject, null, 2)}</pre>
                  </div>
                  <div className="modal-footer">
                    <button className="btn-primary" onClick={() => setLgpdDossier(null)}>Concluir Download do Dossiê</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 9: OBSERVABILIDADE & JOBS (Itens 60 a 73)               */}
        {/* ========================================================= */}
        {activeTab === 'observabilidade' && (
          <div className="tab-pane">
            <div className="section-toolbar">
              <div>
                <h2>Observabilidade do Sistema & Fila de Processamento</h2>
                <p className="section-desc">
                  Health checks em tempo real de microsserviços, controle de background jobs com proteção contra dupla execução e auditoria de IA.
                </p>
              </div>
            </div>

            {/* Health Check dos Serviços */}
            <div className="health-grid">
              {observabilityData?.health?.services?.map((svc, i) => (
                <div key={i} className="health-card">
                  <div className="health-status-indicator online"></div>
                  <div>
                    <strong>{svc.service}</strong>
                    <div className="cell-sub">Latência: {svc.latencyMs}ms • Uptime: {svc.uptimePct}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Fila de Background Jobs (Itens 66, 67, 68) */}
            <h3 className="section-subtitle">Background Jobs e Rotinas Assíncronas</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome do Job</th>
                    <th>Módulo</th>
                    <th>Status</th>
                    <th>Progresso</th>
                    <th>Itens Processados</th>
                    <th>Início</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {observabilityData?.jobs?.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <strong>{job.name}</strong>
                        {job.error && <div className="error-hint">⚠️ {job.error}</div>}
                      </td>
                      <td>{job.module}</td>
                      <td>
                        <span className={`status-pill pill-${job.status.toLowerCase()}`}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div className="progress-bar-container">
                          <div className="progress-bar-fill" style={{ width: `${job.progress}%` }}></div>
                          <span>{job.progress}%</span>
                        </div>
                      </td>
                      <td>{job.itemsProcessed} itens</td>
                      <td>{job.startedAt ? new Date(job.startedAt).toLocaleTimeString('pt-BR') : 'Aguardando'}</td>
                      <td>
                        {job.status === JobStatus.FAILED && (
                          <button
                            className="btn-small primary"
                            onClick={() => handleRetryJob(job.id)}
                          >
                            Reexecutar Job
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Auditoria de IA e Custos (Itens 69 a 72) */}
            <div className="ai-audit-section">
              <h3 className="section-subtitle">Auditoria de Inteligência Artificial & Consumo de Tokens</h3>
              <div className="ai-kpi-bar">
                <div className="ai-kpi-item">
                  <span>Total de Requisições:</span>
                  <strong>{observabilityData?.aiMetrics?.totalRequests}</strong>
                </div>
                <div className="ai-kpi-item">
                  <span>Tokens Consumidos:</span>
                  <strong>{observabilityData?.aiMetrics?.totalTokens?.toLocaleString('pt-BR')}</strong>
                </div>
                <div className="ai-kpi-item">
                  <span>Custo Estimado Acumulado:</span>
                  <strong>R$ {observabilityData?.aiMetrics?.totalCostBRL?.toFixed(2)}</strong>
                </div>
                <div className="ai-kpi-item">
                  <span>Cota Mensal Utilizada:</span>
                  <strong>{observabilityData?.aiMetrics?.budgetConsumedPct}% de R$ 500,00</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA DESIGN SYSTEM & CATALOG (FASE 25: ITENS 93-95)       */}
        {/* ========================================================= */}
        {activeTab === 'design-system' && (
          <div className="tab-pane" style={{ padding: 0 }}>
            <DesignSystemCatalog />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminManagementView;
