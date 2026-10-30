import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { authAccessService } from '../services/authAccessService';

export default function LoginView({ onLoginSuccess }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = authAccessService.authenticate(login, password);
    if (!res.success) {
      setErrorMsg(res.message || 'Credenciais inválidas.');
      return;
    }
    if (onLoginSuccess) {
      onLoginSuccess(res.user);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #0f172a 0%, #020617 100%)',
      padding: '20px',
      color: '#f8fafc'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        borderRadius: '16px',
        padding: '32px 28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Identidade Visual Vellia */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            margin: '0 auto 14px auto',
            borderRadius: '14px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(56, 189, 248, 0.2)'
          }}>
            <img
              src="/favicon.png"
              alt="Vellia Licitações"
              style={{ width: '60px', height: '60px', objectFit: 'contain' }}
            />
          </div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.02em' }}>
            VELLIA <span style={{ color: '#38bdf8' }}>LICITAÇÕES</span>
          </h1>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8' }}>
            Veeluen Solutions & Excelência Ambiental
          </p>
        </div>

        {errorMsg && (
          <div style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(127, 29, 29, 0.45)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            color: '#fca5a5',
            fontSize: '0.82rem',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              E-mail ou Login de Acesso
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#020617',
              border: '1px solid rgba(148, 163, 184, 0.24)',
              borderRadius: '10px',
              padding: '11px 14px'
            }}>
              <User size={16} color="#64748b" />
              <input
                type="text"
                required
                placeholder="Ex: admin@vellia.com.br"
                value={login}
                onChange={e => setLogin(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  width: '100%'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
              Senha de Acesso
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#020617',
              border: '1px solid rgba(148, 163, 184, 0.24)',
              borderRadius: '10px',
              padding: '11px 14px'
            }}>
              <Lock size={16} color="#64748b" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                placeholder="Digite sua senha..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex'
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '12px 18px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7, #10b981)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)'
            }}
          >
            <span>Entrar na Ferramenta</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{
          marginTop: '22px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(148, 163, 184, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Acesso restrito a colaboradores autorizados</span>
        </div>
      </div>
    </div>
  );
}
