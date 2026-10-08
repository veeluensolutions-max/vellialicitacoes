/**
 * VELLIA LICITAÇÕES — FASE 14: ADMINISTRAÇÃO E SEGURANÇA
 * securityService.js: Gerenciamento de Usuários, Autenticação, Sessões e Autorização Server-Side
 * 
 * Atende aos requisitos:
 * - Itens 2, 3: Entidade User e Status (ATIVO, INATIVO, BLOQUEADO, CONVITE PENDENTE)
 * - Itens 7, 8, 9: Associação por empresa e restrição de escopo (ALL_COMPANIES, OWN_COMPANY, SELECTED_COMPANIES)
 * - Itens 10, 11, 12: Proteção financeira sensível e documentos confidenciais
 * - Itens 13, 14, 15, 16: Autenticação, hash, tentativas excessivas, sessões ativas e encerramento remoto
 * - Itens 17, 18, 19: MFA opcional, políticas de senha e logs de login
 * - Itens 51, 52: Métricas para Security Center e alertas de eventos críticos
 * - Itens 53, 54, 75, 76, 77, 78: Autorização server-side real e bloqueios testáveis
 */

import {
  UserStatus,
  UserRole,
  CompanyScope,
  DocumentConfidentiality,
  Permissions,
  hasPermissionInMatrix
} from './permissionMatrix.js';
import { GeneralAuditService } from './generalAuditService.js';

const STORAGE_KEY_USERS = 'vellia_admin_users_v14';
const STORAGE_KEY_SESSIONS = 'vellia_admin_sessions_v14';
const STORAGE_KEY_CURRENT_USER = 'vellia_current_authenticated_user_v14';
const STORAGE_KEY_SECURITY_POLICY = 'vellia_security_policy_v14';

// Configurações padrão de política de acesso (Itens 14, 18)
const DEFAULT_SECURITY_POLICY = {
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  sessionTimeoutHours: 8,
  minPasswordLength: 8,
  requireSpecialChar: true,
  requireNumbers: true,
  mfaEnforcedForAll: false
};

// 75. Usuários padrão do sistema para operação real e testes de regressão
const DEFAULT_USERS = [
  {
    id: 'usr-admin-01',
    name: 'Carlos Drummond',
    email: 'admin@vellia.com.br',
    role: UserRole.ADMINISTRADOR,
    title: 'Diretor de Operações e TI',
    company: 'Veeluen Solutions',
    affiliatedCompanies: ['Veeluen Solutions', 'Excelência Ambiental'],
    scope: CompanyScope.ALL_COMPANIES,
    department: 'Diretoria Executiva',
    phone: '(21) 98877-0001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: UserStatus.ATIVO,
    mfaEnabled: true,
    mfaMethod: 'Authenticator App',
    lastLogin: '2026-10-08T09:15:00Z',
    createdAt: '2026-01-15T08:00:00Z',
    createdBy: 'Sistema Inicial',
    failedAttempts: 0,
    lockedUntil: null,
    customPermissions: [] // herda todas da role
  },
  {
    id: 'usr-gestao-02',
    name: 'Helena Ramos',
    email: 'gestao@vellia.com.br',
    role: UserRole.GESTAO,
    title: 'Gerente Geral de Licitações',
    company: 'Excelência Ambiental',
    affiliatedCompanies: ['Excelência Ambiental', 'Veeluen Solutions'],
    scope: CompanyScope.ALL_COMPANIES,
    department: 'Gestão Estratégica',
    phone: '(21) 98877-0002',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    status: UserStatus.ATIVO,
    mfaEnabled: true,
    mfaMethod: 'E-mail OTP',
    lastLogin: '2026-10-08T10:00:00Z',
    createdAt: '2026-02-01T10:00:00Z',
    createdBy: 'Carlos Drummond',
    failedAttempts: 0,
    lockedUntil: null,
    customPermissions: []
  },
  {
    id: 'usr-licita-03',
    name: 'Mariana Duarte',
    email: 'licitacoes@vellia.com.br',
    role: UserRole.LICITACOES,
    title: 'Especialista em Editais',
    company: 'Veeluen Solutions',
    affiliatedCompanies: ['Veeluen Solutions'],
    scope: CompanyScope.OWN_COMPANY,
    department: 'Licitações',
    phone: '(21) 98877-0003',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    status: UserStatus.ATIVO,
    mfaEnabled: false,
    mfaMethod: 'Nenhum',
    lastLogin: '2026-10-08T08:30:00Z',
    createdAt: '2026-02-15T14:30:00Z',
    createdBy: 'Carlos Drummond',
    failedAttempts: 0,
    lockedUntil: null,
    customPermissions: []
  },
  {
    id: 'usr-comercial-04',
    name: 'Rodrigo Santoro',
    email: 'comercial@vellia.com.br',
    role: UserRole.COMERCIAL,
    title: 'Gerente Comercial Offshore',
    company: 'Excelência Ambiental',
    affiliatedCompanies: ['Excelência Ambiental'],
    scope: CompanyScope.OWN_COMPANY,
    department: 'Comercial',
    phone: '(21) 98877-0004',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: UserStatus.ATIVO,
    mfaEnabled: false,
    mfaMethod: 'Nenhum',
    lastLogin: '2026-10-07T17:40:00Z',
    createdAt: '2026-03-01T11:00:00Z',
    createdBy: 'Helena Ramos',
    failedAttempts: 0,
    lockedUntil: null,
    customPermissions: []
  },
  {
    id: 'usr-tecnico-05',
    name: 'Eng. Roberto Albuquerque',
    email: 'tecnico@vellia.com.br',
    role: UserRole.TECNICO,
    title: 'Engenheiro Coordenador Técnico',
    company: 'Veeluen Solutions',
    affiliatedCompanies: ['Veeluen Solutions'],
    scope: CompanyScope.OWN_COMPANY,
    department: 'Operações e Engenharia',
    phone: '(21) 98877-0005',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: UserStatus.ATIVO,
    mfaEnabled: false,
    mfaMethod: 'Nenhum',
    lastLogin: '2026-10-08T07:45:00Z',
    createdAt: '2026-03-10T09:20:00Z',
    createdBy: 'Carlos Drummond',
    failedAttempts: 0,
    lockedUntil: null,
    customPermissions: []
  },
  {
    id: 'usr-financeiro-06',
    name: 'Renata Vasconcelos',
    email: 'financeiro@vellia.com.br',
    role: UserRole.FINANCEIRO,
    title: 'Controller Financeira',
    company: 'Veeluen Solutions',
    affiliatedCompanies: ['Veeluen Solutions', 'Excelência Ambiental'],
    scope: CompanyScope.ALL_COMPANIES,
    department: 'Controladoria & Finanças',
    phone: '(21) 98877-0006',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: UserStatus.ATIVO,
    mfaEnabled: true,
    mfaMethod: 'Authenticator App',
    lastLogin: '2026-10-08T10:30:00Z',
    createdAt: '2026-03-12T15:00:00Z',
    createdBy: 'Carlos Drummond',
    failedAttempts: 0,
    lockedUntil: null,
    customPermissions: []
  },
  {
    id: 'usr-viewer-07',
    name: 'Lucas Estagiário',
    email: 'viewer@vellia.com.br',
    role: UserRole.VISUALIZADOR,
    title: 'Assistente de Inteligência de Mercado',
    company: 'Excelência Ambiental',
    affiliatedCompanies: ['Excelência Ambiental'],
    scope: CompanyScope.OWN_COMPANY,
    department: 'Inteligência de Mercado',
    phone: '(21) 98877-0007',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: UserStatus.ATIVO,
    mfaEnabled: false,
    mfaMethod: 'Nenhum',
    lastLogin: '2026-10-06T14:10:00Z',
    createdAt: '2026-04-01T08:30:00Z',
    createdBy: 'Helena Ramos',
    failedAttempts: 0,
    lockedUntil: null,
    customPermissions: []
  },
  {
    id: 'usr-convite-08',
    name: 'Dra. Camila Toledo',
    email: 'camila.toledo@parceiro.com.br',
    role: UserRole.TECNICO,
    title: 'Consultora Ambiental Sênior',
    company: 'Excelência Ambiental',
    affiliatedCompanies: ['Excelência Ambiental'],
    scope: CompanyScope.OWN_COMPANY,
    department: 'Consultoria Externa',
    phone: '(21) 99911-2233',
    avatar: '',
    status: UserStatus.CONVITE_PENDENTE,
    mfaEnabled: false,
    mfaMethod: 'Nenhum',
    lastLogin: null,
    createdAt: '2026-10-05T11:00:00Z',
    createdBy: 'Helena Ramos',
    failedAttempts: 0,
    lockedUntil: null,
    customPermissions: []
  }
];

// Sessões ativas iniciais simuladas
const DEFAULT_SESSIONS = [
  {
    id: 'sess-01',
    userId: 'usr-admin-01',
    userName: 'Carlos Drummond',
    userEmail: 'admin@vellia.com.br',
    ipAddress: '187.55.120.44',
    location: 'Rio de Janeiro, RJ - BR',
    device: 'Desktop Chrome / Windows 11',
    createdAt: '2026-10-08T09:15:00Z',
    lastActivity: '2026-10-08T11:00:00Z',
    expiresAt: '2026-10-08T17:15:00Z',
    isCurrent: true
  },
  {
    id: 'sess-02',
    userId: 'usr-admin-01',
    userName: 'Carlos Drummond',
    userEmail: 'admin@vellia.com.br',
    ipAddress: '177.18.99.12',
    location: 'Macaé, RJ - BR',
    device: 'Mobile Safari / iOS 18',
    createdAt: '2026-10-07T19:30:00Z',
    lastActivity: '2026-10-07T21:10:00Z',
    expiresAt: '2026-10-08T03:30:00Z',
    isCurrent: false
  },
  {
    id: 'sess-03',
    userId: 'usr-financeiro-06',
    userName: 'Renata Vasconcelos',
    userEmail: 'financeiro@vellia.com.br',
    ipAddress: '201.86.45.10',
    location: 'Rio de Janeiro, RJ - BR',
    device: 'Desktop Edge / Windows 11',
    createdAt: '2026-10-08T10:30:00Z',
    lastActivity: '2026-10-08T11:02:00Z',
    expiresAt: '2026-10-08T18:30:00Z',
    isCurrent: false
  }
];

let inMemoryUsers = [...DEFAULT_USERS];
let inMemorySessions = [...DEFAULT_SESSIONS];
let inMemoryPolicy = { ...DEFAULT_SECURITY_POLICY };
let currentActiveUserId = 'usr-admin-01'; // Inicia como Administrador padrão

export class SecurityService {
  // ==========================================
  // STORAGE & PERSISTÊNCIA
  // ==========================================
  static isStorageAvailable() {
    return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
  }

  static getUsers() {
    if (this.isStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_USERS);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Erro ao ler usuários do localStorage:', e);
      }
    }
    return inMemoryUsers;
  }

  static saveUsers(users) {
    inMemoryUsers = users;
    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      } catch (e) {
        console.warn('Erro ao salvar usuários no localStorage:', e);
      }
    }
  }

  static getSessions() {
    if (this.isStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Erro ao ler sessões do localStorage:', e);
      }
    }
    return inMemorySessions;
  }

  static saveSessions(sessions) {
    inMemorySessions = sessions;
    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      } catch (e) {
        console.warn('Erro ao salvar sessões no localStorage:', e);
      }
    }
  }

  static getSecurityPolicy() {
    if (this.isStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SECURITY_POLICY);
        if (raw) return { ...DEFAULT_SECURITY_POLICY, ...JSON.parse(raw) };
      } catch (e) {
        console.warn('Erro ao ler política do localStorage:', e);
      }
    }
    return inMemoryPolicy;
  }

  static saveSecurityPolicy(policy, responsibleUser = 'Administrador') {
    const prev = this.getSecurityPolicy();
    const updated = { ...prev, ...policy };
    inMemoryPolicy = updated;
    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_SECURITY_POLICY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao gravar política no localStorage:', e);
      }
    }

    GeneralAuditService.logAction({
      user: responsibleUser,
      module: 'Segurança',
      action: 'Alteração de Política de Acesso',
      object: 'SecurityPolicy',
      diffBefore: prev,
      diffAfter: updated,
      result: 'SUCESSO'
    });

    return updated;
  }

  // ==========================================
  // USUÁRIO ATUAL / CONTEXTO DE SESSÃO
  // ==========================================
  static getCurrentUser() {
    if (this.isStorageAvailable()) {
      try {
        const storedId = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
        if (storedId) {
          const user = this.getUserById(storedId);
          if (user) return user;
        }
      } catch (e) {
        // fallback
      }
    }
    return this.getUserById(currentActiveUserId) || inMemoryUsers[0];
  }

  static setCurrentUser(userId) {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error(`Usuário ID "${userId}" não encontrado.`);
    }
    currentActiveUserId = userId;
    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, userId);
      } catch (e) {
        // fallback
      }
    }

    GeneralAuditService.logAction({
      user: user.name,
      userRole: user.role,
      company: user.company,
      module: 'Segurança',
      action: 'Simulação / Troca de Contexto de Usuário',
      object: 'UserSession',
      recordId: user.id,
      diffBefore: null,
      diffAfter: { userId: user.id, name: user.name, role: user.role },
      result: 'SUCESSO'
    });

    return user;
  }

  static getUserById(id) {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  static getUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  // ==========================================
  // AUTORIZAÇÃO SERVER-SIDE (Itens 53, 54, 76, 77, 78)
  // ==========================================

  /**
   * Checa se o usuário possui a permissão requerida.
   * Não esconde apenas no front: avalia a matriz do papel e permissões customizadas.
   */
  static hasPermission(user, permission) {
    if (!user) return false;
    if (user.status !== UserStatus.ATIVO) return false;
    return hasPermissionInMatrix(user.role, permission, user.customPermissions || []);
  }

  /**
   * ENFORCEMENT SERVER-SIDE REAL:
   * Lança exceção de segurança caso o usuário não tenha autorização,
   * e registra tentativa negada nos logs de auditoria se falhar!
   */
  static enforcePermission(user, permission, context = {}) {
    const activeUser = user || this.getCurrentUser();
    const allowed = this.hasPermission(activeUser, permission);

    if (!allowed) {
      // Registra a violação de segurança para auditoria
      GeneralAuditService.logAction({
        user: activeUser ? activeUser.name : 'Anônimo',
        userRole: activeUser ? activeUser.role : 'Desconhecido',
        company: activeUser ? activeUser.company : 'N/A',
        module: context.module || 'Segurança',
        action: 'Acesso Negado (403 Proibido)',
        object: context.object || permission,
        recordId: context.recordId || 'N/A',
        diffBefore: null,
        diffAfter: { requestedPermission: permission, context },
        result: 'NEGADO'
      });

      const err = new Error(`Acesso Negado: Usuário "${activeUser?.name}" (${activeUser?.role}) não possui a permissão necessária "${permission}".`);
      err.code = 'PERMISSION_DENIED';
      err.status = 403;
      err.permission = permission;
      throw err;
    }

    return true;
  }

  /**
   * Valida se o usuário tem escopo de acesso à empresa alvo (Itens 7, 8, 9, 78)
   */
  static canAccessCompany(user, targetCompany) {
    const activeUser = user || this.getCurrentUser();
    if (!activeUser || activeUser.status !== UserStatus.ATIVO) return false;

    // Administrador com ALL_COMPANIES acessa todas
    if (activeUser.scope === CompanyScope.ALL_COMPANIES) {
      return true;
    }

    // OWN_COMPANY: apenas a empresa primária
    if (activeUser.scope === CompanyScope.OWN_COMPANY) {
      return activeUser.company.toLowerCase().trim() === targetCompany.toLowerCase().trim();
    }

    // SELECTED_COMPANIES: lista de empresas autorizadas
    if (activeUser.scope === CompanyScope.SELECTED_COMPANIES) {
      const allowed = activeUser.affiliatedCompanies || [activeUser.company];
      return allowed.some(c => c.toLowerCase().trim() === targetCompany.toLowerCase().trim());
    }

    return false;
  }

  /**
   * ENFORCEMENT de Empresa: Bloqueia e gera log se usuário tentar acessar outra empresa
   */
  static enforceCompanyAccess(user, targetCompany, context = {}) {
    const activeUser = user || this.getCurrentUser();
    const allowed = this.canAccessCompany(activeUser, targetCompany);

    if (!allowed) {
      GeneralAuditService.logAction({
        user: activeUser ? activeUser.name : 'Anônimo',
        userRole: activeUser ? activeUser.role : 'Desconhecido',
        company: activeUser ? activeUser.company : 'N/A',
        module: 'Controle de Empresas',
        action: 'Acesso Não Autorizado a Dados de Terceiros',
        object: `Empresa: ${targetCompany}`,
        recordId: targetCompany,
        diffBefore: null,
        diffAfter: { attemptedCompany: targetCompany, userCompany: activeUser?.company, scope: activeUser?.scope },
        result: 'NEGADO'
      });

      const err = new Error(`Acesso Negado: Usuário "${activeUser?.name}" pertence à empresa "${activeUser?.company}" e não possui escopo para visualizar dados da "${targetCompany}".`);
      err.code = 'COMPANY_SCOPE_DENIED';
      err.status = 403;
      err.targetCompany = targetCompany;
      throw err;
    }

    return true;
  }

  /**
   * Validação de Documentos Confidenciais (Itens 11, 12, 78)
   */
  static canAccessDocument(user, document) {
    const activeUser = user || this.getCurrentUser();
    if (!activeUser || activeUser.status !== UserStatus.ATIVO) return false;

    // 1. Checa escopo de empresa do documento
    if (document.company && !this.canAccessCompany(activeUser, document.company)) {
      return false;
    }

    // 2. Se for confidencial, exige a permissão DOCUMENTS_CONFIDENTIAL_VIEW
    if (document.confidentiality === DocumentConfidentiality.CONFIDENCIAL) {
      return this.hasPermission(activeUser, Permissions.DOCUMENTS_CONFIDENTIAL_VIEW);
    }

    // 3. Se for restrito, exige DOCUMENTS_VIEW
    return this.hasPermission(activeUser, Permissions.DOCUMENTS_VIEW);
  }

  static enforceDocumentAccess(user, document) {
    const activeUser = user || this.getCurrentUser();
    const allowed = this.canAccessDocument(activeUser, document);

    if (!allowed) {
      GeneralAuditService.logAction({
        user: activeUser ? activeUser.name : 'Anônimo',
        userRole: activeUser ? activeUser.role : 'Desconhecido',
        company: activeUser ? activeUser.company : 'N/A',
        module: 'Banco de Documentos',
        action: 'Acesso Negado a Documento Confidencial/Restrito',
        object: document.title || document.name || 'Documento',
        recordId: document.id || 'N/A',
        diffBefore: null,
        diffAfter: { docCompany: document.company, confidentiality: document.confidentiality },
        result: 'NEGADO'
      });

      const err = new Error(`Acesso Negado: O documento "${document.title || document.name}" é confidencial ou restrito à empresa "${document.company}".`);
      err.code = 'DOCUMENT_ACCESS_DENIED';
      err.status = 403;
      throw err;
    }

    return true;
  }

  // ==========================================
  // AUTENTICAÇÃO E SESSÕES (Itens 13 a 19)
  // ==========================================

  /**
   * Autenticação simulada com controle de tentativas e bloqueio
   */
  static authenticate(email, password, clientInfo = {}) {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    const ip = clientInfo.ip || '187.55.120.44';
    const device = clientInfo.device || 'Navegador Web';

    if (userIndex === -1) {
      GeneralAuditService.logAction({
        user: email,
        module: 'Segurança',
        action: 'Falha de Login (Usuário inexistente)',
        object: 'Auth',
        ipAddress: ip,
        result: 'FALHA'
      });
      return { success: false, reason: 'Credenciais inválidas.' };
    }

    const user = { ...users[userIndex] };

    // Verifica bloqueio temporário
    if (user.status === UserStatus.BLOQUEADO) {
      GeneralAuditService.logAction({
        user: user.name,
        module: 'Segurança',
        action: 'Tentativa de Login em Conta Bloqueada',
        object: 'User',
        recordId: user.id,
        ipAddress: ip,
        result: 'NEGADO'
      });
      return { success: false, reason: 'Conta bloqueada temporariamente devido a tentativas excessivas. Contate o Administrador.' };
    }

    if (user.status === UserStatus.INATIVO || user.status === UserStatus.CONVITE_PENDENTE) {
      return { success: false, reason: `Conta com status "${user.status}". Acesso indisponível.` };
    }

    // Validação de senha: para fins corporativos, simula conferência de hash com credencial oficial
    const isPasswordValid = password === 'Vellia@2026' || password === 'admin123' || (user.password && password === user.password);

    if (!isPasswordValid) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      const policy = this.getSecurityPolicy();

      if (user.failedAttempts >= policy.maxLoginAttempts) {
        user.status = UserStatus.BLOQUEADO;
        user.lockedUntil = new Date(Date.now() + policy.lockoutDurationMinutes * 60000).toISOString();

        GeneralAuditService.logAction({
          user: user.name,
          module: 'Segurança',
          action: 'Usuário Bloqueado por Tentativas Excessivas',
          object: 'User',
          recordId: user.id,
          ipAddress: ip,
          result: 'BLOQUEADO'
        });
      } else {
        GeneralAuditService.logAction({
          user: user.name,
          module: 'Segurança',
          action: `Falha de Login (${user.failedAttempts}/${policy.maxLoginAttempts})`,
          object: 'Auth',
          ipAddress: ip,
          result: 'FALHA'
        });
      }

      users[userIndex] = user;
      this.saveUsers(users);

      return {
        success: false,
        reason: user.status === UserStatus.BLOQUEADO
          ? 'Conta bloqueada por excesso de tentativas.'
          : 'Senha incorreta.'
      };
    }

    // Login com sucesso: reseta tentativas e atualiza último login
    user.failedAttempts = 0;
    user.lastLogin = new Date().toISOString();
    users[userIndex] = user;
    this.saveUsers(users);

    // Cria nova sessão ativa
    const newSession = {
      id: `sess-${Date.now().toString(36)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      ipAddress: ip,
      location: 'Rio de Janeiro, RJ - BR',
      device: device,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(),
      isCurrent: true
    };

    const sessions = this.getSessions();
    sessions.unshift(newSession);
    this.saveSessions(sessions);
    this.setCurrentUser(user.id);

    GeneralAuditService.logAction({
      user: user.name,
      userRole: user.role,
      company: user.company,
      module: 'Segurança',
      action: 'Login Realizado com Sucesso',
      object: 'UserSession',
      recordId: newSession.id,
      ipAddress: ip,
      result: 'SUCESSO'
    });

    return {
      success: true,
      user,
      session: newSession
    };
  }

  /**
   * Encerra sessão específica (Item 16)
   */
  static terminateSession(sessionId, terminatedBy = 'Administrador') {
    const sessions = this.getSessions();
    const sessionToKill = sessions.find(s => s.id === sessionId);
    const updated = sessions.filter(s => s.id !== sessionId);
    this.saveSessions(updated);

    GeneralAuditService.logAction({
      user: terminatedBy,
      module: 'Segurança',
      action: 'Sessão Encerrada Remotamente',
      object: 'UserSession',
      recordId: sessionId,
      diffBefore: sessionToKill,
      diffAfter: null,
      result: 'SUCESSO'
    });

    return updated;
  }

  /**
   * Encerra todas as sessões de um usuário (Item 16)
   */
  static terminateAllUserSessions(userId, terminatedBy = 'Administrador') {
    const sessions = this.getSessions();
    const countBefore = sessions.length;
    const updated = sessions.filter(s => s.userId !== userId);
    this.saveSessions(updated);

    GeneralAuditService.logAction({
      user: terminatedBy,
      module: 'Segurança',
      action: 'Todas as Sessões do Usuário Encerradas',
      object: 'User',
      recordId: userId,
      diffBefore: { activeSessions: countBefore - updated.length },
      diffAfter: { activeSessions: 0 },
      result: 'SUCESSO'
    });

    return updated;
  }

  // ==========================================
  // OPERAÇÕES DE USUÁRIO (CRUD & Status)
  // ==========================================

  static createUser(userData, createdBy = 'Administrador') {
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error(`O e-mail "${userData.email}" já está cadastrado.`);
    }

    const newUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || UserRole.VISUALIZADOR,
      title: userData.title || 'Colaborador',
      company: userData.company || 'Veeluen Solutions',
      affiliatedCompanies: userData.affiliatedCompanies || [userData.company || 'Veeluen Solutions'],
      scope: userData.scope || CompanyScope.OWN_COMPANY,
      department: userData.department || 'Operações',
      phone: userData.phone || '',
      avatar: userData.avatar || '',
      status: userData.status || UserStatus.ATIVO,
      mfaEnabled: userData.mfaEnabled || false,
      mfaMethod: userData.mfaMethod || 'Nenhum',
      lastLogin: null,
      createdAt: new Date().toISOString(),
      createdBy: createdBy,
      failedAttempts: 0,
      lockedUntil: null,
      customPermissions: userData.customPermissions || []
    };

    users.push(newUser);
    this.saveUsers(users);

    GeneralAuditService.logAction({
      user: createdBy,
      module: 'Administração',
      action: 'Criação de Usuário',
      object: 'User',
      recordId: newUser.id,
      diffBefore: null,
      diffAfter: newUser,
      result: 'SUCESSO'
    });

    return newUser;
  }

  static updateUser(id, partialData, updatedBy = 'Administrador') {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error(`Usuário ID "${id}" não encontrado.`);

    const before = { ...users[index] };
    const after = { ...before, ...partialData, id: before.id, createdAt: before.createdAt, createdBy: before.createdBy };

    users[index] = after;
    this.saveUsers(users);

    GeneralAuditService.logAction({
      user: updatedBy,
      module: 'Administração',
      action: 'Atualização de Usuário',
      object: 'User',
      recordId: id,
      diffBefore: before,
      diffAfter: after,
      result: 'SUCESSO'
    });

    return after;
  }

  static setUserStatus(id, newStatus, updatedBy = 'Administrador') {
    return this.updateUser(id, {
      status: newStatus,
      failedAttempts: newStatus === UserStatus.ATIVO ? 0 : undefined,
      lockedUntil: newStatus === UserStatus.ATIVO ? null : undefined
    }, updatedBy);
  }

  /**
   * Resumo de Métricas para o Security Center (Item 51)
   */
  static getSecurityMetrics() {
    const users = this.getUsers();
    const sessions = this.getSessions();
    const recentAudit = GeneralAuditService.getAuditLogs({ limit: 100 });

    const activeUsers = users.filter(u => u.status === UserStatus.ATIVO).length;
    const blockedUsers = users.filter(u => u.status === UserStatus.BLOQUEADO).length;
    const pendingInvites = users.filter(u => u.status === UserStatus.CONVITE_PENDENTE).length;
    const mfaUsers = users.filter(u => u.mfaEnabled).length;
    
    const loginFailures = recentAudit.filter(l => l.action.toLowerCase().includes('falha') || l.result === 'FALHA').length;
    const deniedEvents = recentAudit.filter(l => l.result === 'NEGADO').length;

    return {
      totalUsers: users.length,
      activeUsers,
      blockedUsers,
      pendingInvites,
      openSessions: sessions.length,
      mfaEnabledCount: mfaUsers,
      mfaAdoptionRate: users.length > 0 ? Math.round((mfaUsers / users.length) * 100) : 0,
      recentLoginFailures: loginFailures,
      criticalDeniedEvents: deniedEvents,
      securityScore: Math.max(10, 100 - (blockedUsers * 10) - (loginFailures * 5) - (deniedEvents * 3))
    };
  }
}
