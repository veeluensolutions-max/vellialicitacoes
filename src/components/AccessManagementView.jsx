import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  Ban,
  Trash2,
  LogOut,
  Building2,
  Sparkles,
  Lock,
  X
} from 'lucide-react';
import {
  authAccessService,
  ACCESS_ROLES,
  COMPANY_ACCESS_SCOPES
} from '../services/authAccessService';
import { EventBus } from '../services/eventBus';

export default function AccessManagementView({ currentUser, onLogout }) {
  const [users, setUsers] = useState(() => authAccessService.getUsers());
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPasswordUser, setEditingPasswordUser] = useState(null);
  const [newPassValue, setNewPassValue] = useState('');

  const [form, setForm] = useState({
    name: '',
    login: '',
    password: '',
    role: 'ANALISTA',
    companyScope: 'ALL',
    department: ''
  });
  const [showFormPass, setShowFormPass] = useState(true);

  const reloadUsers = () => {
    setUsers(authAccessService.getUsers());
  };

  useEffect(() => {
    const unsub = EventBus.subscribe('vellia-access-users-updated', reloadUsers);
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const notify = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const toggleShowPassword = (userId) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$!';
    let pass = 'Vellia@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm(prev => ({ ...prev, password: pass }));
  };

  const handleCreateLogin = (e) => {
    e.preventDefault();
    try {
      const created = authAccessService.createUser(form);
      reloadUsers();
      setForm({
        name: '',
        login: '',
        password: '',
        role: 'ANALISTA',
        companyScope: 'ALL',
        department: ''
      });
      setIsModalOpen(false);
      notify('success', `Login de acesso criado com sucesso para "${created.name}" (${created.login})!`);
    } catch (err) {
      notify('error', err.message || 'Erro ao criar login.');
    }
  };

  const handleCopyCredentials = (u) => {
    const text = `Acesso Vellia Licitações\nUsuário/E-mail: ${u.login}\nSenha: ${u.password}\nPerfil: ${u.roleLabel}\nEmpresa: ${u.companyScopeLabel}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    notify('success', `Credenciais de "${u.name}" copiadas para a área de transferência!`);
  };

  const handleToggleStatus = (u) => {
    try {
      const updated = authAccessService.toggleStatus(u.id);
      reloadUsers();
      notify(
        'info',
        updated.status === 'ATIVO'
          ? `Acesso de "${u.name}" reativado.`
          : `Acesso de "${u.name}" bloqueado.`
      );
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleDeleteUser = (u) => {
    try {
      authAccessService.deleteUser(u.id);
      reloadUsers();
      notify('info', `Login de "${u.name}" removido.`);
    } catch (err) {
      notify('error', err.message);
    }
  };

  const handleSaveNewPassword = (e) => {
    e.preventDefault();
    if (!editingPasswordUser || newPassValue.trim().length < 4) {
      notify('error', 'A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    authAccessService.updateUser(editingPasswordUser.id, { password: newPassValue.trim() });
    reloadUsers();
    notify('success', `Senha de "${editingPasswordUser.name}" atualizada com sucesso!`);
    setEditingPasswordUser(null);
    setNewPassValue('');
  };

  const activeUsersCount = users.filter(u => u.status === 'ATIVO').length;

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Notificação Flutuante */}
      {feedback && (
        <div style={{
          marginBottom: '18px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: feedback.type === 'success'
            ? 'rgba(6, 78, 59, 0.92)'
            : feedback.type === 'error'
            ? 'rgba(127, 29, 29, 0.92)'
            : 'rgba(15, 23, 42, 0.95)',
          border: feedback.type === 'success'
            ? '1px solid #10b981'
            : feedback.type === 'error'
            ? '1px solid #ef4444'
            : '1px solid #38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          color: '#ffffff'
        }}>
          <Sparkles size={16} color="#34d399" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* CABEÇALHO */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '22px',
        paddingBottom: '18px',
        borderBottom: '1px solid rgba(148, 163, 184, 0.14)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <KeyRound size={22} color="#38bdf8" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Criação de Login & Controle de Acesso
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
            Cadastre logins e senhas de acesso à ferramenta para a equipe da <strong>Veeluen Solutions</strong> e <strong>Excelência Ambiental</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(248, 113, 113, 0.35)',
                background: 'rgba(127, 29, 29, 0.25)',
                color: '#fca5a5',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={15} />
              <span>Bloquear / Ir para Tela de Login</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
            }}
          >
            <UserPlus size={16} />
            <span>Criar Novo Login de Acesso</span>
          </button>
        </div>
      </div>

      {/* INDICADORES DE ACESSO */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.78)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '12px',
          padding: '16px 18px'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Logins Ativos na Ferramenta
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981' }}>{activeUsersCount}</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>de {users.length} cadastrados</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.78)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '12px',
          padding: '16px 18px'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sessão Conectada Agora
          </div>
          <div style={{ marginTop: '6px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38bdf8' }}>
              {currentUser?.name || 'Administrador Vellia'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {currentUser?.login || 'admin@vellia.com.br'} • {currentUser?.roleLabel || 'Administrador Total'}
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.78)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '12px',
          padding: '16px 18px'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Escopo de Empresas
          </div>
          <div style={{ marginTop: '6px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Veeluen & Excelência Ambiental
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Permissão configurável por empresa em cada login
            </div>
          </div>
        </div>
      </div>

      {/* LISTA DE LOGINS CADASTRADOS */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.82)',
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="#10b981" />
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
              Logins Cadastrados ({users.length})
            </h2>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Clique em "Copiar Acesso" para enviar o login e senha ao usuário
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                background: 'rgba(2, 6, 23, 0.6)',
                borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                fontSize: '0.75rem',
                color: '#94a3b8',
                textTransform: 'uppercase'
              }}>
                <th style={{ padding: '13px 18px' }}>Usuário / Setor</th>
                <th style={{ padding: '13px 16px' }}>Login / E-mail</th>
                <th style={{ padding: '13px 16px' }}>Senha de Acesso</th>
                <th style={{ padding: '13px 16px' }}>Perfil</th>
                <th style={{ padding: '13px 16px' }}>Empresa Autorizada</th>
                <th style={{ padding: '13px 16px' }}>Status</th>
                <th style={{ padding: '13px 18px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isPassShown = Boolean(visiblePasswords[u.id]);
                const isActive = u.status === 'ATIVO';

                return (
                  <tr
                    key={u.id}
                    style={{
                      borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                      opacity: isActive ? 1 : 0.6
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        {u.department || 'Licitações & Comercial'}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '0.86rem', color: '#38bdf8', fontWeight: 600 }}>
                      {u.login}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'rgba(2, 6, 23, 0.7)',
                          border: '1px solid rgba(148, 163, 184, 0.16)',
                          color: isPassShown ? '#10b981' : '#94a3b8',
                          fontSize: '0.82rem'
                        }}>
                          {isPassShown ? u.password : '••••••••'}
                        </code>
                        <button
                          onClick={() => toggleShowPassword(u.id)}
                          title={isPassShown ? 'Ocultar senha' : 'Ver senha'}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {isPassShown ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: u.role === 'ADMIN' ? 'rgba(129, 140, 248, 0.14)' : 'rgba(56, 189, 248, 0.12)',
                        color: u.role === 'ADMIN' ? '#818cf8' : '#38bdf8'
                      }}>
                        {u.roleLabel}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        color: '#cbd5e1'
                      }}>
                        <Building2 size={14} color={u.companyScope === 'excelencia-ambiental' ? '#10b981' : '#38bdf8'} />
                        {u.companyScopeLabel}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.15)',
                        color: isActive ? '#10b981' : '#f87171'
                      }}>
                        {isActive ? 'Ativo' : 'Bloqueado'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleCopyCredentials(u)}
                          title="Copiar Login e Senha"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            background: 'rgba(56, 189, 248, 0.1)',
                            color: '#38bdf8',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Copy size={13} />
                          <span>Copiar Acesso</span>
                        </button>

                        <button
                          onClick={() => {
                            setEditingPasswordUser(u);
                            setNewPassValue(u.password);
                          }}
                          title="Alterar Senha"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            background: 'rgba(30, 41, 59, 0.7)',
                            color: '#e2e8f0',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Lock size={13} />
                          <span>Senha</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={isActive ? 'Bloquear login' : 'Ativar login'}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            background: 'rgba(15, 23, 42, 0.7)',
                            color: isActive ? '#10b981' : '#f59e0b',
                            cursor: 'pointer'
                          }}
                        >
                          {isActive ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                        </button>

                        {!u.isMaster && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Excluir login"
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid rgba(239, 68, 68, 0.25)',
                              background: 'rgba(127, 29, 29, 0.2)',
                              color: '#f87171',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CRIAÇÃO DE NOVO LOGIN */}
      {isModalOpen && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.82)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              color: '#f8fafc',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.65)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={20} color="#10b981" />
                <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 700 }}>
                  Criar Novo Login de Acesso
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Nome Completo do Usuário *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alexandre Silva"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: '#020617',
                    color: '#f8fafc',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    E-mail ou Usuário de Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: alexandre@veeluen.com.br"
                    value={form.login}
                    onChange={e => setForm({ ...form, login: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Cargo / Setor
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Diretoria Comercial"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#f8fafc',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                    Senha de Acesso *
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#38bdf8',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Gerar senha automática
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type={showFormPass ? 'text' : 'password'}
                    required
                    placeholder="Digite a senha de acesso..."
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#f8fafc',
                      fontSize: '0.86rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPass(!showFormPass)}
                    style={{
                      padding: '0 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                  >
                    {showFormPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Perfil de Permissão
                  </label>
                  <select
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#f8fafc',
                      fontSize: '0.84rem'
                    }}
                  >
                    {ACCESS_ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Empresa Autorizada
                  </label>
                  <select
                    value={form.companyScope}
                    onChange={e => setForm({ ...form, companyScope: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#f8fafc',
                      fontSize: '0.84rem'
                    }}
                  >
                    {COMPANY_ACCESS_SCOPES.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Salvar Login de Acesso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RÁPIDO PARA ALTERAR SENHA */}
      {editingPasswordUser && (
        <div
          onClick={() => setEditingPasswordUser(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.82)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '420px',
              padding: '22px',
              color: '#f8fafc'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.02rem' }}>
              Alterar Senha — {editingPasswordUser.name}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              Login: {editingPasswordUser.login}
            </p>
            <form onSubmit={handleSaveNewPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                required
                value={newPassValue}
                onChange={e => setNewPassValue(e.target.value)}
                placeholder="Digite a nova senha..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(148, 163, 184, 0.25)',
                  background: '#020617',
                  color: '#f8fafc',
                  fontSize: '0.86rem'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setEditingPasswordUser(null)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
