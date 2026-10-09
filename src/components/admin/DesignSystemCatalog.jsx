import React, { useState } from 'react';
import { 
  Check, 
  AlertTriangle, 
  Clock, 
  Info, 
  ArrowRight, 
  Search, 
  Bot, 
  FileText, 
  CheckCircle2, 
  Shield, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function DesignSystemCatalog() {
  const [activeTab, setActiveTab] = useState('buttons');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Topo do Catálogo */}
      <div style={{
        background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
        border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(2, 132, 199, 0.12)',
              color: 'var(--accent-primary, #0284C7)',
              letterSpacing: '0.05em'
            }}>
              DESIGN SYSTEM • VELLIA 1.0
            </span>
            <span style={{ fontSize: '12px', color: 'var(--brand-slate-400, #94A3B8)' }}>
              Filosofia "Quiet Intelligence"
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0' }}>
            Catálogo de Componentes & Design Tokens
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--brand-slate-300, #CBD5E1)', margin: 0 }}>
            Padronização visual de botões, cartões, badges, KPIs, tabelas e estados de feedback do SaaS.
          </p>
        </div>

        {/* Abas do Catálogo */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '8px' }}>
          {['buttons', 'badges', 'kpis', 'alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'var(--accent-primary, #0284C7)' : 'transparent',
                color: activeTab === tab ? '#FFFFFF' : 'var(--brand-slate-400, #94A3B8)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SEÇÃO BUTTONS */}
      {activeTab === 'buttons' && (
        <div style={{
          background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
          border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ fontSize: '15px', color: '#FFFFFF', margin: 0, fontWeight: 600 }}>Padronização de Botões</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
            {/* Primário */}
            <button style={{
              background: 'var(--accent-primary, #0284C7)',
              color: '#FFFFFF',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Botão Primário
            </button>

            {/* Secundário / Outline */}
            <button style={{
              background: 'rgba(148, 163, 184, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              color: 'var(--brand-slate-200, #E2E8F0)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Botão Secundário
            </button>

            {/* Sucesso / GO */}
            <button style={{
              background: 'var(--status-go, #10B981)',
              color: '#0B132B',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Check size={14} />
              <span>Decisão GO</span>
            </button>

            {/* Atenção / GO Pendências */}
            <button style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--status-warning, #F59E0B)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              GO com Pendências
            </button>

            {/* Perigo / NO-GO */}
            <button style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--status-danger, #EF4444)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-md, 8px)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              NO-GO
            </button>
          </div>
        </div>
      )}

      {/* SEÇÃO BADGES */}
      {activeTab === 'badges' && (
        <div style={{
          background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
          border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ fontSize: '15px', color: '#FFFFFF', margin: 0, fontWeight: 600 }}>Badges Semânticos Padronizados</h3>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--status-go, #10B981)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              GO (CONFIRMADO)
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--status-warning, #F59E0B)',
              border: '1px solid rgba(245, 158, 11, 0.25)'
            }}>
              GO COM PENDÊNCIAS
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--status-danger, #EF4444)',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}>
              NO-GO
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(2, 132, 199, 0.12)',
              color: 'var(--accent-primary, #0284C7)'
            }}>
              PETRONECT
            </span>

            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(148, 163, 184, 0.12)',
              color: 'var(--brand-slate-300, #CBD5E1)'
            }}>
              PNCP (BETA)
            </span>
          </div>
        </div>
      )}

      {/* SEÇÃO KPIS */}
      {activeTab === 'kpis' && (
        <div style={{
          background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
          border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ fontSize: '15px', color: '#FFFFFF', margin: 0, fontWeight: 600 }}>Cards de KPI Compactos</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div style={{
              background: 'rgba(30, 41, 59, 0.45)',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600, textTransform: 'uppercase' }}>
                Oportunidades analisadas
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
                14
              </div>
              <span style={{ fontSize: '11px', color: 'var(--accent-primary, #0284C7)' }}>
                +3 hoje
              </span>
            </div>

            <div style={{
              background: 'rgba(30, 41, 59, 0.45)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '11px', color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600, textTransform: 'uppercase' }}>
                Prazos críticos
              </span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
                3
              </div>
              <span style={{ fontSize: '11px', color: 'var(--status-warning, #F59E0B)' }}>
                Vencem em até 3d
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SEÇÃO ALERTS */}
      {activeTab === 'alerts' && (
        <div style={{
          background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
          border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '15px', color: '#FFFFFF', margin: 0, fontWeight: 600 }}>Feedback & Alertas Semânticos</h3>
          
          <div style={{
            background: 'var(--status-go-bg, rgba(16, 185, 129, 0.12))',
            border: '1px solid var(--status-go-border, rgba(16, 185, 129, 0.28))',
            color: 'var(--status-go-text, #34D399)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>Sucesso: Proposta sincronizada com comprovante gerado no Petronect.</span>
          </div>

          <div style={{
            background: 'var(--status-warning-bg, rgba(245, 158, 11, 0.12))',
            border: '1px solid var(--status-warning-border, rgba(245, 158, 11, 0.28))',
            color: 'var(--status-warning-text, #FBBF24)',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>Atenção: A certidão CND da Veeluen Solutions expira nos próximos 5 dias.</span>
          </div>
        </div>
      )}

    </div>
  );
}
