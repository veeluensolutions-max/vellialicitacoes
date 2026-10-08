/**
 * VELLIA LICITAÇÕES — FASE 19: INTEGRAÇÕES REAIS DE E-MAIL + CALENDÁRIO
 * productivityIntegrationManager.js: Gerenciador Central de Conexões, Tokens e Sincronização
 * (Itens 1, 3, 4, 5, 6, 61 a 68, 88, 89, 90)
 */

import {
  ConnectionStatus,
  IntegrationProviderType,
  maskToken
} from './productivityModels.js';
import { GmailProvider, MicrosoftMailProvider } from './emailProvider.js';
import { GoogleCalendarProvider, MicrosoftCalendarProvider } from './calendarProvider.js';
import { emailIntegrationService } from './emailIntegrationService.js';
import { calendarIntegrationService } from './calendarIntegrationService.js';
import { GeneralAuditService } from '../admin/generalAuditService.js';

const STORAGE_KEY_CONNECTIONS = 'vellia_productivity_connections_v19';

export class ProductivityIntegrationManager {
  constructor() {
    this.providers = {
      [IntegrationProviderType.GMAIL]: new GmailProvider(),
      [IntegrationProviderType.MICROSOFT_MAIL]: new MicrosoftMailProvider(),
      [IntegrationProviderType.GOOGLE_CALENDAR]: new GoogleCalendarProvider(),
      [IntegrationProviderType.MICROSOFT_CALENDAR]: new MicrosoftCalendarProvider()
    };

    this.connections = this._loadConnections();
  }

  // =========================================================================
  // 1. GERENCIAMENTO DE CONEXÕES & OAUTH (Itens 1, 3, 4, 5, 6)
  // =========================================================================

  /**
   * Retorna status de todas as integrações de produtividade para o usuário ativo
   */
  getIntegrationsStatus(userId = 'usr-comercial-1', userEmail = 'roberto.mendes@excelenciaambiental.com.br') {
    const list = [
      {
        id: IntegrationProviderType.GMAIL,
        name: 'Gmail (Google Workspace)',
        category: 'E-mail Corporativo',
        providerType: IntegrationProviderType.GMAIL,
        icon: 'Mail',
        scopes: ['gmail.readonly', 'gmail.send'],
        description: 'Sincronização de conversas comerciais com órgãos e envio seguro de propostas.',
        defaultUser: userEmail
      },
      {
        id: IntegrationProviderType.MICROSOFT_MAIL,
        name: 'Microsoft 365 / Outlook Mail',
        category: 'E-mail Corporativo',
        providerType: IntegrationProviderType.MICROSOFT_MAIL,
        icon: 'Mail',
        scopes: ['Mail.Read', 'Mail.Send'],
        description: 'Acompanhamento de trocas formais de e-mails via Microsoft Graph API.',
        defaultUser: userEmail
      },
      {
        id: IntegrationProviderType.GOOGLE_CALENDAR,
        name: 'Google Calendar',
        category: 'Calendário & Reuniões',
        providerType: IntegrationProviderType.GOOGLE_CALENDAR,
        icon: 'Calendar',
        scopes: ['calendar.events', 'calendar.readonly'],
        description: 'Sincronização de audiências, reuniões técnicas e geração automática de Google Meet.',
        defaultUser: userEmail
      },
      {
        id: IntegrationProviderType.MICROSOFT_CALENDAR,
        name: 'Microsoft Outlook Calendar',
        category: 'Calendário & Reuniões',
        providerType: IntegrationProviderType.MICROSOFT_CALENDAR,
        icon: 'Calendar',
        scopes: ['Calendars.ReadWrite', 'Calendars.Read'],
        description: 'Gestão de agenda executiva com geração automática de links Microsoft Teams.',
        defaultUser: userEmail
      }
    ];

    return list.map(item => {
      const conn = this.connections.find(c => c.providerType === item.providerType && c.userId === userId);
      return {
        ...item,
        status: conn ? conn.status : ConnectionStatus.DESCONECTADO,
        connectedAccount: conn ? conn.accountIdentifier : 'Nenhuma conta conectada',
        connectedAt: conn ? conn.connectedAt : null,
        lastSync: conn ? conn.lastSync : null,
        nextSync: conn ? conn.nextSync : null,
        tokenMasked: conn ? maskToken(conn.accessToken) : 'Não configurado',
        scopesGranted: conn ? conn.scopesGranted : [],
        hasError: conn ? !!conn.errorMessage : false,
        errorMessage: conn ? conn.errorMessage : null
      };
    });
  }

  listIntegrations(userId, userEmail) {
    return this.getIntegrationsStatus(userId, userEmail);
  }

  getProductivityMetrics() {
    return {
      emailMetrics: emailIntegrationService.getEmailMetrics(),
      calendarMetrics: calendarIntegrationService.getCalendarMetrics(),
      activeConnections: this.connections.filter(c => c.status === ConnectionStatus.CONECTADO).length
    };
  }

  /**
   * Conecta uma conta via OAuth 2.0 (Itens 3, 4, 6)
   */
  async connectAccount({ providerType, userEmail, userId = 'usr-comercial-1', userName = 'Roberto Mendes' }) {
    const provider = this.providers[providerType];
    if (!provider) throw new Error(`Provedor ${providerType} não suportado.`);

    let tokenData = {};
    if (provider.authenticate) {
      tokenData = await provider.authenticate({ userEmail, userId, authCode: 'simulated_oauth_code' });
    } else {
      tokenData = {
        accessToken: `tok_${Math.random().toString(36).substring(2, 12)}`,
        accountIdentifier: userEmail,
        scopesGranted: provider.scopes
      };
    }

    const nextSyncDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const newConn = {
      id: `conn-${providerType}-${userId}`,
      providerType,
      userId,
      accountIdentifier: userEmail,
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken || null,
      scopesGranted: tokenData.scopesGranted || provider.scopes,
      status: ConnectionStatus.CONECTADO,
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      nextSync: nextSyncDate,
      errorMessage: null
    };

    // Remove conexão prévia se houver
    this.connections = this.connections.filter(c => !(c.providerType === providerType && c.userId === userId));
    this.connections.push(newConn);
    this._saveConnections();

    // Auditoria (Item 71)
    GeneralAuditService.logAudit({
      user: userName,
      action: 'CONNECT_ACCOUNT',
      module: 'INTEGRATIONS',
      targetId: providerType,
      summary: `Conta ${userEmail} conectada com sucesso ao provedor ${providerType}.`
    });

    // Dispara primeira sincronização imediatamente
    await this.syncProvider(providerType, userId, userEmail);

    return newConn;
  }

  /**
   * Desconecta e revoga o token (Itens 1, 68)
   */
  async disconnectAccount(providerType, userId = 'usr-comercial-1') {
    const conn = this.connections.find(c => c.providerType === providerType && c.userId === userId);
    if (!conn) return;

    const provider = this.providers[providerType];
    if (provider && provider.revokeAccess) {
      await provider.revokeAccess(conn.accountIdentifier);
    }

    this.connections = this.connections.filter(c => !(c.providerType === providerType && c.userId === userId));
    this._saveConnections();

    GeneralAuditService.logAudit({
      user: 'Usuário',
      action: 'DISCONNECT_ACCOUNT',
      module: 'INTEGRATIONS',
      targetId: providerType,
      summary: `Conta ${conn.accountIdentifier} desconectada do provedor ${providerType}.`
    });
  }

  // =========================================================================
  // 2. JOBS DE SINCRONIZAÇÃO (Itens 61, 62, 66)
  // =========================================================================

  /**
   * Sincroniza um provedor específico
   */
  async syncProvider(providerType, userId = 'usr-comercial-1', userEmail = 'roberto.mendes@excelenciaambiental.com.br') {
    const conn = this.connections.find(c => c.providerType === providerType && c.userId === userId);
    if (!conn) {
      throw new Error(`Integração ${providerType} não está conectada para este usuário.`);
    }

    conn.status = ConnectionStatus.SINCRONIZANDO;
    this._saveConnections();

    try {
      if (providerType === IntegrationProviderType.GMAIL || providerType === IntegrationProviderType.MICROSOFT_MAIL) {
        // MailSyncJob (Item 61)
        const provider = this.providers[providerType];
        const incomingMsgs = await provider.fetchMessages({ userEmail: conn.accountIdentifier });
        emailIntegrationService.processIncomingMessages(incomingMsgs);
      } else if (providerType === IntegrationProviderType.GOOGLE_CALENDAR || providerType === IntegrationProviderType.MICROSOFT_CALENDAR) {
        // CalendarSyncJob (Item 61)
        const provider = this.providers[providerType];
        const incomingEvents = await provider.fetchEvents();
        calendarIntegrationService.processIncomingEvents(incomingEvents);
      }

      conn.status = ConnectionStatus.CONECTADO;
      conn.lastSync = new Date().toISOString();
      conn.nextSync = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      conn.errorMessage = null;
      this._saveConnections();

      return { success: true, providerType, syncedAt: conn.lastSync };
    } catch (err) {
      conn.status = ConnectionStatus.ERRO;
      conn.errorMessage = err.message;
      this._saveConnections();
      throw err;
    }
  }

  /**
   * Sincroniza todas as contas ativas do usuário
   */
  async syncAll(userId = 'usr-comercial-1') {
    const userConns = this.connections.filter(c => c.userId === userId);
    const results = [];
    for (const c of userConns) {
      try {
        const res = await this.syncProvider(c.providerType, c.userId, c.accountIdentifier);
        results.push(res);
      } catch (err) {
        results.push({ success: false, providerType: c.providerType, error: err.message });
      }
    }
    return results;
  }

  // =========================================================================
  // 3. PERSISTÊNCIA E INICIALIZAÇÃO
  // =========================================================================

  _loadConnections() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const stored = localStorage.getItem(STORAGE_KEY_CONNECTIONS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      // Ambiente sem suporte a storage
    }

    // Conexões padrão ativas para demonstração inicial
    return [
      {
        id: 'conn-GMAIL-usr-comercial-1',
        providerType: IntegrationProviderType.GMAIL,
        userId: 'usr-comercial-1',
        accountIdentifier: 'roberto.mendes@excelenciaambiental.com.br',
        accessToken: 'ya29.a0AfH6SM_prod_mock_token_7721',
        scopesGranted: ['gmail.readonly', 'gmail.send'],
        status: ConnectionStatus.CONECTADO,
        connectedAt: '2026-10-08T08:00:00Z',
        lastSync: '2026-10-08T10:30:00Z',
        nextSync: '2026-10-08T10:45:00Z',
        errorMessage: null
      },
      {
        id: 'conn-GOOGLE_CALENDAR-usr-comercial-1',
        providerType: IntegrationProviderType.GOOGLE_CALENDAR,
        userId: 'usr-comercial-1',
        accountIdentifier: 'roberto.mendes@excelenciaambiental.com.br',
        accessToken: 'ya29.a0AfH6SM_prod_mock_cal_token_8892',
        scopesGranted: ['calendar.events', 'calendar.readonly'],
        status: ConnectionStatus.CONECTADO,
        connectedAt: '2026-10-08T08:00:00Z',
        lastSync: '2026-10-08T10:30:00Z',
        nextSync: '2026-10-08T10:45:00Z',
        errorMessage: null
      }
    ];
  }

  _saveConnections() {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(this.connections));
      }
    } catch (e) {
      // Ambiente sem suporte a storage
    }
  }
}

export const productivityIntegrationManager = new ProductivityIntegrationManager();
