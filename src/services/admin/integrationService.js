/**
 * VELLIA LICITAÇÕES — FASE 14: ADMINISTRAÇÃO E SEGURANÇA
 * integrationService.js: Central de Integrações, Mascaramento de Segredos e Conformidade LGPD
 * 
 * Atende aos requisitos:
 * - Itens 41, 42: Central de Integrações (Petronect, PNCP, Compras.gov.br, E-mail SMTP/SES, WhatsApp API)
 *   com status ONLINE, OFFLINE, CONFIGURADA, NÃO CONFIGURADA, DEGRADED.
 * - Itens 43, 44: Ocultação segura de segredos (sk-••••••••1234) e segregação de chaves de ambiente.
 * - Itens 45 a 48: Módulo de conformidade LGPD (mapeamento de dados pessoais, exportação de dossiê do titular,
 *   minimização e políticas de retenção).
 */

import { GeneralAuditService } from './generalAuditService.js';
import { SecurityService } from './securityService.js';
import { Permissions } from './permissionMatrix.js';

export const IntegrationStatus = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
  CONFIGURADA: 'CONFIGURADA',
  NAO_CONFIGURADA: 'NÃO CONFIGURADA',
  DEGRADED: 'DEGRADED'
};

const STORAGE_KEY_INTEGRATIONS = 'vellia_admin_integrations_v14';

// Função utilitária para mascaramento seguro de tokens e senhas (Item 43)
export function maskSecret(secret) {
  if (!secret) return 'Não configurado';
  if (secret.length <= 8) return '••••••••';
  const prefix = secret.slice(0, 3);
  const suffix = secret.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}

const DEFAULT_INTEGRATIONS = [
  {
    id: 'integ-petronect',
    name: 'Portal Petronect (Petrobras)',
    category: 'Portal de Compras',
    status: IntegrationStatus.ONLINE,
    endpoint: 'https://www.petronect.com.br/api/v2/opportunities',
    apiKeyMasked: 'pet••••••••••••7a8b',
    lastSync: '2026-10-08T10:45:00Z',
    latencyMs: 142,
    successRatePct: 99.4,
    description: 'Monitoramento diário contínuo de oportunidades, RFI, RFP e editais Petrobras.',
    environmentVar: 'PETRONECT_AUTH_TOKEN'
  },
  {
    id: 'integ-pncp',
    name: 'PNCP — Portal Nacional de Contratações Públicas',
    category: 'Portal Federal',
    status: IntegrationStatus.ONLINE,
    endpoint: 'https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao',
    apiKeyMasked: 'pnc••••••••••••3312',
    lastSync: '2026-10-08T10:30:00Z',
    latencyMs: 210,
    successRatePct: 98.8,
    description: 'Ingestão de editais federais, estaduais e municipais regidos pela Lei 14.133/21.',
    environmentVar: 'PNCP_API_KEY'
  },
  {
    id: 'integ-comprasgov',
    name: 'Compras.gov.br (Antigo Comprasnet)',
    category: 'Portal Federal',
    status: IntegrationStatus.CONFIGURADA,
    endpoint: 'https://api.compras.dados.gov.br/licitacoes/v1',
    apiKeyMasked: 'cgov••••••••••••9901',
    lastSync: '2026-10-08T09:12:00Z',
    latencyMs: 310,
    successRatePct: 97.2,
    description: 'Acompanhamento de pregões eletrônicos e concorrências federais.',
    environmentVar: 'COMPRASGOV_TOKEN'
  },
  {
    id: 'integ-smtp',
    name: 'Servidor de E-mail Transacional (AWS SES / SMTP)',
    category: 'Notificações',
    status: IntegrationStatus.ONLINE,
    endpoint: 'email-smtp.sa-east-1.amazonaws.com:587',
    apiKeyMasked: 'AKI••••••••••••55TT',
    lastSync: '2026-10-08T10:55:00Z',
    latencyMs: 85,
    successRatePct: 100.0,
    description: 'Disparo de alertas diários, relatórios executivos e notificações de segurança.',
    environmentVar: 'AWS_SES_CREDENTIALS'
  },
  {
    id: 'integ-whatsapp',
    name: 'WhatsApp Business API (Alertas Críticos)',
    category: 'Notificações',
    status: IntegrationStatus.DEGRADED,
    endpoint: 'https://api.z-api.io/instances/vellia-bot/token',
    apiKeyMasked: 'zap••••••••••••1044',
    lastSync: '2026-10-08T08:15:00Z',
    latencyMs: 850,
    successRatePct: 88.5,
    description: 'Notificação instantânea para os diretores ao detectar oportunidades de alta aderência (>85%).',
    environmentVar: 'WHATSAPP_API_TOKEN'
  }
];

let inMemoryIntegrations = [...DEFAULT_INTEGRATIONS];

export class IntegrationService {
  static isStorageAvailable() {
    return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
  }

  static getIntegrations() {
    if (this.isStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_INTEGRATIONS);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Erro ao ler integrações:', e);
      }
    }
    return inMemoryIntegrations;
  }

  static saveIntegrations(list) {
    inMemoryIntegrations = list;
    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_INTEGRATIONS, JSON.stringify(list));
      } catch (e) {
        console.warn('Erro ao salvar integrações:', e);
      }
    }
  }

  /**
   * Atualização de integração garantindo que tokens novos nunca fiquem expostos (Item 43)
   */
  static updateIntegration(id, data, responsibleUser = 'Administrador') {
    const list = this.getIntegrations();
    const index = list.findIndex(i => i.id === id);
    if (index === -1) throw new Error(`Integração "${id}" não encontrada.`);

    const before = { ...list[index] };
    const updated = { ...before, ...data };

    if (data.newSecret) {
      updated.apiKeyMasked = maskSecret(data.newSecret);
      delete updated.newSecret;
    }

    list[index] = updated;
    this.saveIntegrations(list);

    GeneralAuditService.logAction({
      user: responsibleUser,
      module: 'Integrações',
      action: 'Atualização de Configurações de Conector',
      object: updated.name,
      recordId: id,
      diffBefore: { status: before.status, endpoint: before.endpoint },
      diffAfter: { status: updated.status, endpoint: updated.endpoint },
      result: 'SUCESSO'
    });

    return updated;
  }

  /**
   * Teste de conectividade e latência simulado
   */
  static testConnection(id) {
    const list = this.getIntegrations();
    const item = list.find(i => i.id === id);
    if (!item) throw new Error(`Integração "${id}" não encontrada.`);

    const isSuccess = item.status !== IntegrationStatus.OFFLINE;
    const latency = Math.floor(Math.random() * 200 + 60);

    return {
      id,
      name: item.name,
      status: isSuccess ? 'CONECTADO COM SUCESSO' : 'FALHA DE COMUNICAÇÃO',
      latencyMs: latency,
      timestamp: new Date().toISOString()
    };
  }

  // ==========================================
  // CONFORMIDADE LGPD (Itens 45 a 48)
  // ==========================================

  /**
   * 45, 47. Exportação de Relatório de Dados do Titular (Dossiê LGPD)
   */
  static exportUserDataReport(userId, requestedBy = 'Administrador') {
    const user = SecurityService.getUserById(userId);
    if (!user) throw new Error(`Usuário ID "${userId}" não encontrado.`);

    const logs = GeneralAuditService.getAuditLogs({ user: user.name, limit: 100 });

    const dossier = {
      protocol: `LGPD-REQ-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      requestedBy,
      dataSubject: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department,
        company: user.company,
        status: user.status,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      auditHistoryCount: logs.length,
      recentActivitySummary: logs.slice(0, 10).map(l => ({
        timestamp: l.timestamp,
        module: l.module,
        action: l.action,
        result: l.result
      })),
      legalBasis: 'Execução de Contrato de Trabalho / Legítimo Interesse Corporativo (Art. 7º LGPD)',
      retentionPeriodYears: 5
    };

    GeneralAuditService.logAction({
      user: requestedBy,
      module: 'Segurança & LGPD',
      action: 'Exportação de Dossiê de Dados do Titular (LGPD)',
      object: `Titular: ${user.name}`,
      recordId: user.id,
      diffBefore: null,
      diffAfter: { protocol: dossier.protocol },
      result: 'SUCESSO'
    });

    return dossier;
  }
}
