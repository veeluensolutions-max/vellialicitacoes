/**
 * VELLIA LICITAÇÕES — FASE 14: ADMINISTRAÇÃO E SEGURANÇA
 * adminService.js: Fachada Principal do Módulo de Administração
 * 
 * Centraliza e exporta todas as funcionalidades dos 6 sub-serviços da Fase 14:
 * 1. permissionMatrix.js: Matriz de Perfis, Permissões Granulares e Escopos
 * 2. generalAuditService.js: Trilha Geral de Auditoria Imutável com Diffs
 * 3. securityService.js: Usuários, Sessões, Autenticação e Autorização Server-Side
 * 4. backupService.js: Catálogo, Políticas, Alertas e Restauração Protegida
 * 5. systemConfigService.js: Configurações Gerais, Agente, Versionamento de Score e Lixeira
 * 6. integrationService.js: Conectores Externos, Mascaramento de Tokens e LGPD
 * 7. observabilityService.js: Saúde dos Serviços, Jobs, Locks e Auditoria de IA
 */

import {
  UserStatus,
  UserRole,
  CompanyScope,
  DocumentConfidentiality,
  Permissions,
  PERMISSION_GROUPS,
  DEFAULT_ROLE_PERMISSIONS,
  hasPermissionInMatrix
} from './permissionMatrix.js';

import { GeneralAuditService } from './generalAuditService.js';
import { SecurityService } from './securityService.js';
import { BackupService, BackupStatus, BackupType, StorageTarget } from './backupService.js';
import { SystemConfigService } from './systemConfigService.js';
import { IntegrationService, IntegrationStatus, maskSecret } from './integrationService.js';
import { ObservabilityService, HealthStatus, JobStatus } from './observabilityService.js';

export {
  UserStatus,
  UserRole,
  CompanyScope,
  DocumentConfidentiality,
  Permissions,
  PERMISSION_GROUPS,
  DEFAULT_ROLE_PERMISSIONS,
  hasPermissionInMatrix,
  GeneralAuditService,
  SecurityService,
  BackupService,
  BackupStatus,
  BackupType,
  StorageTarget,
  SystemConfigService,
  IntegrationService,
  IntegrationStatus,
  maskSecret,
  ObservabilityService,
  HealthStatus,
  JobStatus
};

export class AdminService {
  /**
   * 73. Painel Administrativo Executivo — Visão Consolidada de Toda a Governança
   */
  static getExecutiveDashboardOverview() {
    const secMetrics = SecurityService.getSecurityMetrics();
    const backupOverview = BackupService.getBackupOverview();
    const generalConfig = SystemConfigService.getGeneralConfig();
    const activeScoreVersion = SystemConfigService.getActiveScoreVersion();
    const healthOverview = ObservabilityService.getHealthOverview();
    const aiMetrics = ObservabilityService.getAIMetrics();
    const integrations = IntegrationService.getIntegrations();
    const trashItems = SystemConfigService.getTrashItems();
    const recentAudit = GeneralAuditService.getAuditLogs({ limit: 10 });
    const currentUser = SecurityService.getCurrentUser();

    return {
      currentUser,
      systemName: generalConfig.systemName,
      activeScoreVersion,
      security: secMetrics,
      backups: {
        total: backupOverview.totalBackups,
        lastBackup: backupOverview.lastBackup,
        nextScheduled: backupOverview.nextScheduledBackup,
        alerts: backupOverview.alerts
      },
      observability: {
        status: healthOverview.status,
        allHealthy: healthOverview.allHealthy,
        aiUsage: aiMetrics
      },
      integrations: {
        total: integrations.length,
        onlineCount: integrations.filter(i => i.status === IntegrationStatus.ONLINE).length,
        degradedCount: integrations.filter(i => i.status === IntegrationStatus.DEGRADED).length
      },
      trash: {
        count: trashItems.length
      },
      recentAudit
    };
  }
}
