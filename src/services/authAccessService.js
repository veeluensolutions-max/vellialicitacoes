/**
 * VELLIA LICITAÇÕES — SERVIÇO DE CRIAÇÃO E GESTÃO DE LOGINS DE ACESSO
 * Gerencia credenciais de acesso à ferramenta, perfis de permissão e escopo por empresa.
 */

import { EventBus } from './eventBus.js';

const USERS_STORAGE_KEY = 'vellia_access_logins_v1';
const SESSION_STORAGE_KEY = 'vellia_active_auth_session_v1';
const LOGIN_REQUIRED_KEY = 'vellia_login_gate_enabled_v1';

export const ACCESS_ROLES = [
  {
    id: 'ADMIN',
    label: 'Administrador Total',
    description: 'Acesso completo ao Radar, Editais, Portais Conectados e Criação de Logins.'
  },
  {
    id: 'DIRETORIA',
    label: 'Diretoria / Gestão',
    description: 'Decisões de Concorrer/Descartar, Radar de Serviços, Editais e Portais.'
  },
  {
    id: 'ANALISTA',
    label: 'Analista de Licitações',
    description: 'Operação do Radar, análise de editais, anotações técnicas e acompanhamento.'
  },
  {
    id: 'VISUALIZADOR',
    label: 'Visualizador',
    description: 'Consulta ao Radar de Serviços e visualização dos editais abertos.'
  }
];

export const COMPANY_ACCESS_SCOPES = [
  { id: 'ALL', label: 'Ambas as Empresas (Veeluen & Excelência)' },
  { id: 'veeluen-solutions', label: 'Apenas Veeluen Solutions' },
  { id: 'excelencia-ambiental', label: 'Apenas Excelência Ambiental' }
];

const INITIAL_ADMIN_USER = {
  id: 'usr-master-admin',
  name: 'Administrador Vellia',
  login: 'admin@vellia.com.br',
  password: 'Vellia@2026',
  role: 'ADMIN',
  roleLabel: 'Administrador Total',
  companyScope: 'ALL',
  companyScopeLabel: 'Ambas as Empresas (Veeluen & Excelência)',
  department: 'Diretoria / Administração',
  status: 'ATIVO',
  isMaster: true,
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

class AuthAccessService {
  constructor() {
    this.users = this.loadUsers();
  }

  loadUsers() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([INITIAL_ADMIN_USER]));
      }
    } catch (e) {
      console.warn('Erro ao carregar logins de acesso:', e);
    }
    return [INITIAL_ADMIN_USER];
  }

  saveUsers(users) {
    this.users = users;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
      EventBus.emit('vellia-access-users-updated', { users: this.users });
    } catch (e) {
      console.warn('Erro ao salvar logins de acesso:', e);
    }
  }

  getUsers() {
    return [...this.users];
  }

  getCurrentSession() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          if (session && session.userId) {
            const existing = this.users.find(u => u.id === session.userId && u.status === 'ATIVO');
            if (existing) return existing;
          }
        }
        // Se o bloqueio de tela não foi acionado manualmente, inicia logado no Administrador principal
        const gateLocked = window.localStorage.getItem(LOGIN_REQUIRED_KEY) === 'LOCKED';
        if (!gateLocked) {
          const fallbackAdmin = this.users.find(u => u.status === 'ATIVO') || INITIAL_ADMIN_USER;
          window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            userId: fallbackAdmin.id,
            loginAt: new Date().toISOString()
          }));
          return fallbackAdmin;
        }
      }
    } catch {}
    return null;
  }

  authenticate(loginInput, passwordInput) {
    const cleanLogin = String(loginInput || '').trim().toLowerCase();
    const cleanPass = String(passwordInput || '').trim();

    if (!cleanLogin || !cleanPass) {
      return { success: false, message: 'Informe o login/e-mail e a senha de acesso.' };
    }

    const userIndex = this.users.findIndex(
      u => u.login.toLowerCase() === cleanLogin || u.name.toLowerCase() === cleanLogin
    );

    if (userIndex === -1) {
      return { success: false, message: 'Login ou e-mail não encontrado.' };
    }

    const user = this.users[userIndex];

    if (user.status !== 'ATIVO') {
      return { success: false, message: 'Este login está temporariamente bloqueado/inativo.' };
    }

    if (user.password !== cleanPass) {
      return { success: false, message: 'Senha incorreta. Verifique suas credenciais.' };
    }

    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };
    this.users[userIndex] = updatedUser;
    this.saveUsers(this.users);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(LOGIN_REQUIRED_KEY, 'UNLOCKED');
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
          userId: updatedUser.id,
          loginAt: new Date().toISOString()
        }));
      }
    } catch {}

    EventBus.emit('vellia-auth-session-changed', { user: updatedUser });
    return { success: true, user: updatedUser };
  }

  logout() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        window.localStorage.setItem(LOGIN_REQUIRED_KEY, 'LOCKED');
      }
    } catch {}
    EventBus.emit('vellia-auth-session-changed', { user: null });
  }

  createUser({ name, login, password, role = 'ANALISTA', companyScope = 'ALL', department = '' }) {
    const cleanName = String(name || '').trim();
    const cleanLogin = String(login || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanName) throw new Error('Informe o nome do usuário.');
    if (!cleanLogin) throw new Error('Informe o e-mail ou nome de login.');
    if (!cleanPassword || cleanPassword.length < 4) {
      throw new Error('A senha deve ter pelo menos 4 caracteres.');
    }

    if (this.users.some(u => u.login.toLowerCase() === cleanLogin)) {
      throw new Error(`O login "${cleanLogin}" já está cadastrado.`);
    }

    const roleMeta = ACCESS_ROLES.find(r => r.id === role) || ACCESS_ROLES[2];
    const scopeMeta = COMPANY_ACCESS_SCOPES.find(s => s.id === companyScope) || COMPANY_ACCESS_SCOPES[0];

    const newUser = {
      id: `usr-${Date.now().toString(36)}`,
      name: cleanName,
      login: cleanLogin,
      password: cleanPassword,
      role: roleMeta.id,
      roleLabel: roleMeta.label,
      companyScope: scopeMeta.id,
      companyScopeLabel: scopeMeta.label,
      department: String(department || '').trim() || 'Licitações & Comercial',
      status: 'ATIVO',
      isMaster: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    this.users.push(newUser);
    this.saveUsers(this.users);
    return newUser;
  }

  updateUser(id, fields) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    const current = this.users[idx];
    const nextRole = fields.role || current.role;
    const nextScope = fields.companyScope || current.companyScope;
    const roleMeta = ACCESS_ROLES.find(r => r.id === nextRole) || ACCESS_ROLES[2];
    const scopeMeta = COMPANY_ACCESS_SCOPES.find(s => s.id === nextScope) || COMPANY_ACCESS_SCOPES[0];

    this.users[idx] = {
      ...current,
      ...fields,
      role: roleMeta.id,
      roleLabel: roleMeta.label,
      companyScope: scopeMeta.id,
      companyScopeLabel: scopeMeta.label
    };

    this.saveUsers(this.users);
    return this.users[idx];
  }

  toggleStatus(id) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    if (this.users[idx].isMaster && this.users.filter(u => u.status === 'ATIVO').length <= 1) {
      throw new Error('Não é possível bloquear o único administrador ativo.');
    }
    const nextStatus = this.users[idx].status === 'ATIVO' ? 'BLOQUEADO' : 'ATIVO';
    this.users[idx] = { ...this.users[idx], status: nextStatus };
    this.saveUsers(this.users);
    return this.users[idx];
  }

  deleteUser(id) {
    const target = this.users.find(u => u.id === id);
    if (!target) return false;
    if (target.isMaster && this.users.length <= 1) {
      throw new Error('Não é possível remover o administrador principal.');
    }
    this.users = this.users.filter(u => u.id !== id);
    this.saveUsers(this.users);
    return true;
  }
}

export const authAccessService = new AuthAccessService();
export default authAccessService;
