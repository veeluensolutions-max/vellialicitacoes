import React, { useState } from 'react';
import { 
  Bot, 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  ShieldAlert, 
  Cpu, 
  Eye, 
  ArrowRight 
} from 'lucide-react';
import IntelligenceCopilotView from './IntelligenceCopilotView';
import CommandCenterView from './CommandCenterView';
import DailyReportView from './DailyReportView';
import { systemMetrics } from '../data/mockData';

export default function IntelligenceConsolidatedView({ 
  onSelectOpportunity, 
  initialSubTab = 'copilot' 
}) {
  const [subTab, setSubTab] = useState(initialSubTab);

  const subTabs = [
    { id: 'copilot', label: 'Vellia Copilot', icon: Bot, badge: 'IA Core' },
    { id: 'command-center', label: 'Command Center', icon: BarChart3, badge: 'Visão Executiva' },
    { id: 'performance', label: 'Performance & Métricas', icon: TrendingUp, badge: null }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Cabeçalho */}
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
              MÓDULO DE INTELIGÊNCIA VELLIA 1.0
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
              Copilot Cognitivo + Painel Executivo
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFF', margin: '0 0 4px 0' }}>
            Central de Inteligência Estratégica
          </h2>
          <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0 }}>
            Assistência analítica de editais, visão executiva de pipeline e inteligência de conversão comercial.
          </p>
        </div>

        {/* Abas */}
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

      {/* Renderização das sub-visões */}
      {subTab === 'copilot' && (
        <IntelligenceCopilotView onOpenOpportunityDetail={(oppNum) => {
          if (onSelectOpportunity) onSelectOpportunity({ id: oppNum, number: oppNum, title: 'Oportunidade ' + oppNum });
        }} />
      )}

      {subTab === 'command-center' && (
        <CommandCenterView onNavigateToDetail={(item) => {
          if (onSelectOpportunity) onSelectOpportunity(item);
        }} />
      )}

      {subTab === 'performance' && (
        <DailyReportView onOpenOpportunityDetail={(oppNum) => {
          if (onSelectOpportunity) onSelectOpportunity({ id: oppNum, number: oppNum, title: 'Oportunidade ' + oppNum });
        }} />
      )}
    </div>
  );
}
