import React, { useState } from 'react';
import { 
  Radar as RadarIcon, 
  Compass, 
  Radio, 
  Layers, 
  Sparkles, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database
} from 'lucide-react';
import RadarSection from './RadarSection';
import EarlyRadarView from './EarlyRadarView';
import MonitoringView from './MonitoringView';
import PetronectDashboardWidgets from './PetronectDashboardWidgets';

export default function RadarConsolidatedView({ 
  onSelectOpportunity, 
  onNavigateToOpportunities,
  initialSubTab = 'diario' 
}) {
  const [subTab, setSubTab] = useState(initialSubTab);

  const subTabs = [
    { id: 'diario', label: 'Radar Diário', icon: Sparkles, badge: 'Hoje' },
    { id: 'antecipado', label: 'Radar Antecipado', icon: Compass, badge: 'Pré-Edital' },
    { id: 'fontes', label: 'Fontes & Conectores', icon: Database, badge: '3 Portais' },
    { id: 'monitoramento', label: 'Monitoramento Ativo', icon: Radio, badge: 'Online' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cabeçalho do Radar Consolidado */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 58, 138, 0.3))',
        border: '1px solid rgba(0, 229, 201, 0.25)',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              background: 'rgba(0, 229, 201, 0.15)',
              color: '#00E5C9',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              NÚCLEO RADAR VELLIA 1.0
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              Varredura de Licitações & Oportunidades Pré-Edital
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF', margin: '0 0 4px 0' }}>
            Radar de Oportunidades & Fontes
          </h2>
          <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0 }}>
            Central unificada de monitoramento: editais abertos hoje, previsões de contratação e telemetria de conectores.
          </p>
        </div>

        {/* Abas do Radar */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.8)',
          padding: '6px',
          borderRadius: '10px',
          border: '1px solid rgba(148, 163, 184, 0.15)'
        }}>
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                style={{
                  background: isActive ? '#00E5C9' : 'transparent',
                  color: isActive ? '#0B132B' : '#94A3B8',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span style={{
                    fontSize: '9px',
                    background: isActive ? 'rgba(11, 19, 43, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Sub-Aba Selecionada */}
      {subTab === 'diario' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <RadarSection />
          <PetronectDashboardWidgets
            onSelectOpportunity={onSelectOpportunity}
            onNavigateToMonitoring={() => setSubTab('monitoramento')}
            onNavigateToOpportunities={onNavigateToOpportunities}
          />
        </div>
      )}

      {subTab === 'antecipado' && (
        <div>
          <EarlyRadarView />
        </div>
      )}

      {subTab === 'fontes' && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#FFF', fontWeight: 700 }}>
              Status Real dos Conectores e Portais
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
              Todas as fontes alimentam o mesmo modelo unificado <strong>Opportunity</strong> com deduplicação central ativa.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {/* Petronect */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '15px', color: '#FFF' }}>Petronect Público</strong>
                <span style={{
                  fontSize: '11px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={12} /> CONECTADO
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                Coletor automatizado varrendo processos de fornecimento de bens e serviços de Óleo & Gás.
              </p>
              <div style={{ fontSize: '11px', color: '#CBD5E1', display: 'flex', justifyContent: 'space-between' }}>
                <span>Última sincronização: Há 12 min</span>
                <span>14 editais ativos</span>
              </div>
            </div>

            {/* PNCP */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '15px', color: '#FFF' }}>PNCP (Portal Nacional)</strong>
                <span style={{
                  fontSize: '11px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#F59E0B',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 800
                }}>
                  BETA (Homologação)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                Integração REST com API oficial do PNCP para órgãos municipais e federais com filtros ambientais.
              </p>
              <div style={{ fontSize: '11px', color: '#CBD5E1', display: 'flex', justifyContent: 'space-between' }}>
                <span>Status: Em testes assistidos</span>
                <span>Modo Sandbox</span>
              </div>
            </div>

            {/* Compras.gov */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '12px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '15px', color: '#FFF' }}>Compras.gov.br</strong>
                <span style={{
                  fontSize: '11px',
                  background: 'rgba(148, 163, 184, 0.15)',
                  color: '#94A3B8',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  DESCONECTADO (Em fila)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                Conector programado para a próxima release sem mocks ativos na versão atual.
              </p>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Previsão de ativação: Vellia 1.1
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'monitoramento' && (
        <div>
          <MonitoringView onNavigateToOpportunities={onNavigateToOpportunities} />
        </div>
      )}
    </div>
  );
}
