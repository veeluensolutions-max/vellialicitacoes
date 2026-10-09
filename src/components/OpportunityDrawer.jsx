import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Clock,
  FileSearch,
  Scale,
  FileSpreadsheet,
  Bot,
  AlertCircle,
  Check,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { DecisionService } from '../services/decision/decisionService';
import { ProposalService } from '../services/proposal/proposalService';
import { ResultsIntelligenceService } from '../services/results/resultsIntelligenceService';
import { MvpScoreService } from '../services/mvp/mvpScoreService';
import EditalAnalysisModal from './EditalAnalysisModal';
import GlobalCopilotModal from './GlobalCopilotModal';
import './OpportunityDrawer.css';

export default function OpportunityDrawer({ opportunity, onClose }) {
  if (!opportunity) return null;

  // ITEM 48: LIMITAR NÚMERO DE ABAS (Visão Geral, Análise, Documentos, Decisão, Histórico)
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  
  // Decisão in-place reativa (Item 23 e 24)
  const [currentDecision, setCurrentDecision] = useState(() => {
    const hum = DecisionService.getHumanDecision(opportunity.id || opportunity.number);
    return hum ? hum.currentDecision : 'PENDENTE';
  });
  const [decisionFeedback, setDecisionFeedback] = useState(null);

  const recommendation = MvpScoreService.getConsolidatedRecommendation(opportunity);

  const handleMakeDecision = (decisionType) => {
    const oppId = opportunity.id || opportunity.number;
    DecisionService.recordDecision(
      oppId,
      decisionType,
      'Decisão deliberada pela equipe de licitações',
      'Diretoria Técnica e Comercial'
    );
    setCurrentDecision(decisionType);
    setDecisionFeedback(`Decisão ${decisionType} registrada com sucesso.`);
    setTimeout(() => setDecisionFeedback(null), 3000);
  };

  const isUrgent = opportunity.daysLeft <= 3;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div 
        className="drawer-panel" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '960px', 
          width: '94vw',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'var(--surface-modal, #0F172A)'
        }}
      >
        
        {/* ITEM 40: HERO DA OPORTUNIDADE (Breadcrumb, número, contratante, badges, ações) */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Linha 1: Breadcrumb + Fechar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--brand-slate-400, #94A3B8)' }}>
              <span>Oportunidades</span>
              <span>/</span>
              <span style={{ color: 'var(--brand-slate-200, #E2E8F0)' }}>{opportunity.portal}</span>
              <span>/</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary, #0284C7)', fontWeight: 600 }}>{opportunity.id}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowCopilotModal(true)}
                style={{
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  color: 'var(--accent-primary, #0284C7)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Perguntar ao Vellia sobre este edital"
              >
                <Bot size={13} />
                <span>Perguntar ao Vellia</span>
              </button>

              <button 
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--brand-slate-400, #94A3B8)',
                  padding: '6px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                aria-label="Fechar painel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Linha 2: Título e Contratante */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(148, 163, 184, 0.12)',
                color: 'var(--brand-slate-300, #CBD5E1)',
                fontWeight: 600
              }}>
                {opportunity.portal}
              </span>
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(148, 163, 184, 0.08)',
                color: 'var(--brand-slate-400, #94A3B8)',
                fontWeight: 600
              }}>
                {opportunity.modality || 'Pregão Eletrônico'}
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isUrgent ? 'var(--status-danger, #EF4444)' : 'var(--brand-slate-400, #94A3B8)',
                marginLeft: 'auto',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {opportunity.daysLeft === 0 ? 'Encerra hoje' :
                 opportunity.daysLeft === 1 ? 'Encerra amanhã' :
                 `Prazo: ${opportunity.daysLeft} dias restantes`}
              </span>
            </div>

            <h1 style={{
              fontSize: '17px',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: '0 0 4px 0',
              lineHeight: 1.35
            }}>
              {opportunity.title}
            </h1>

            <div style={{ fontSize: '12px', color: 'var(--brand-slate-400, #94A3B8)' }}>
              Contratante: <strong style={{ color: '#F8FAFC' }}>{opportunity.client}</strong> • {opportunity.location || 'Brasil'}
            </div>
          </div>
        </div>

        {/* FEEDBACK DE AÇÃO SE HOUVER */}
        {decisionFeedback && (
          <div style={{
            background: 'var(--status-go-bg, rgba(16, 185, 129, 0.12))',
            borderBottom: '1px solid var(--status-go-border, rgba(16, 185, 129, 0.28))',
            color: 'var(--status-go-text, #34D399)',
            padding: '8px 24px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={14} />
            <span>{decisionFeedback}</span>
          </div>
        )}

        {/* ITEM 41 & 42: BLOCO PRINCIPAL (DIVISÃO EM CONTEÚDO + PAINEL LATERAL) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 280px',
          flex: 1,
          overflow: 'hidden'
        }}>
          
          {/* COLUNA ESQUERDA: CONTEÚDO PRINCIPAL (Item 45 a 48) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
            overflowY: 'auto'
          }}>
            
            {/* ITEM 48: NAVEGAÇÃO DE ABAS RESTRITAS (Visão Geral, Análise, Documentos, Decisão, Histórico) */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '0 20px',
              gap: '4px'
            }}>
              {[
                { id: 'visao_geral', label: 'Visão Geral' },
                { id: 'analise', label: 'Análise do Edital' },
                { id: 'documentos', label: 'Documentos' },
                { id: 'decisao', label: 'Decisão GO / NO-GO' },
                { id: 'historico', label: 'Histórico' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary, #0284C7)' : '2px solid transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : 'var(--brand-slate-400, #94A3B8)',
                    padding: '12px 14px',
                    fontSize: '12px',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 150ms ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTEÚDO DA ABA SELECIONADA */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {activeTab === 'visao_geral' && (
                <>
                  {/* ITEM 45: OBJETO COM BOA LEGIBILIDADE (Evitar caixas pequenas) */}
                  <div>
                    <h3 style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--brand-slate-400, #94A3B8)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      margin: '0 0 6px 0'
                    }}>
                      Objeto da Contratação
                    </h3>
                    <p style={{
                      fontSize: '13px',
                      lineHeight: 1.6,
                      color: '#E2E8F0',
                      margin: 0,
                      background: 'rgba(30, 41, 59, 0.35)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md, 8px)',
                      border: '1px solid rgba(148, 163, 184, 0.08)'
                    }}>
                      {opportunity.description || opportunity.title}
                    </p>
                  </div>

                  {/* ITEM 46: BLOCO "RESUMO VELLIA" (Inteligência confiável, sem neon) */}
                  <div style={{
                    background: 'rgba(2, 132, 199, 0.04)',
                    border: '1px solid rgba(2, 132, 199, 0.2)',
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Bot size={15} style={{ color: 'var(--accent-primary, #0284C7)' }} />
                      <strong style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>
                        Resumo Vellia
                      </strong>
                    </div>
                    <p style={{
                      fontSize: '12px',
                      lineHeight: 1.55,
                      color: 'var(--brand-slate-300, #CBD5E1)',
                      margin: 0
                    }}>
                      {recommendation.summary || 'Compatibilidade semântica elevada com o catálogo da empresa recomendada. Exigências técnicas e fiscais conferidas pelo Centro de Capacidade.'}
                    </p>
                  </div>

                  {/* ITEM 47: BLOCO "ANTES DE PARTICIPAR" (Lista priorizada) */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <AlertCircle size={15} style={{ color: 'var(--status-warning, #F59E0B)' }} />
                      <strong style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>
                        Antes de participar
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#E2E8F0', padding: '6px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                        <span>• Certidões fiscais e trabalhistas</span>
                        <span style={{ color: 'var(--status-go, #10B981)', fontWeight: 600 }}>Válidas</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#E2E8F0', padding: '6px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                        <span>• Atestado de capacidade técnica mínimo</span>
                        <span style={{ color: 'var(--status-go, #10B981)', fontWeight: 600 }}>Atendido (CAT 4892)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#E2E8F0', padding: '6px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                        <span>• Validação de BDI e precificação</span>
                        <span style={{ color: 'var(--status-warning, #F59E0B)', fontWeight: 600 }}>Aguardando análise</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#E2E8F0', padding: '6px 0' }}>
                        <span>• Visita técnica ao local</span>
                        <span style={{ color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 500 }}>Facultativa (Declaração)</span>
                      </div>
                    </div>
                  </div>

                  {/* Ação: Ver Análise Completa do Edital */}
                  <div>
                    <button
                      onClick={() => setShowAnalysisModal(true)}
                      style={{
                        background: 'rgba(148, 163, 184, 0.08)',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        color: 'var(--brand-slate-200, #E2E8F0)',
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-sm, 6px)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FileSearch size={14} />
                      <span>Ver análise completa do edital</span>
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'analise' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.35)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#FFFFFF' }}>Cláusulas Relevantes</h4>
                    <p style={{ fontSize: '12px', color: 'var(--brand-slate-300, #CBD5E1)', lineHeight: 1.5, margin: 0 }}>
                      Regime de execução por preço unitário. Garantia de proposta correspondente a 1% do valor estimado. Não há exigência de caução prévia para habilitação.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAnalysisModal(true)}
                    style={{
                      background: 'var(--accent-primary, #0284C7)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      alignSelf: 'flex-start'
                    }}
                  >
                    Abrir Relatório Completo do Edital
                  </button>
                </div>
              )}

              {activeTab === 'documentos' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.35)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <strong style={{ color: '#FFFFFF' }}>Documentos Anexos ao Edital:</strong>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--brand-slate-300, #CBD5E1)' }}>
                      <span>📄 Edital_Oficial_Petronect.pdf (4.2 MB)</span>
                      <span>📄 Termo_de_Referencia_Anexo_I.pdf (1.8 MB)</span>
                      <span>📊 Planilha_Estimativa_de_Custos.xlsx (540 KB)</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'decisao' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.35)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#FFFFFF' }}>Decisão Vigente</h4>
                    <p style={{ fontSize: '12px', color: 'var(--brand-slate-300, #CBD5E1)', margin: 0 }}>
                      Situação formal: <strong style={{ color: currentDecision === 'GO' ? 'var(--status-go)' : 'var(--status-warning)' }}>{currentDecision}</strong>
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'historico' && (
                <div style={{ fontSize: '12px', color: 'var(--brand-slate-400, #94A3B8)', lineHeight: 1.6 }}>
                  • Oportunidade indexada automaticamente via varredura do portal Petronect.<br />
                  • Aderência calculada em {recommendation.adherence}% com capacidade de {recommendation.capability}%.<br />
                  • Trilha de auditoria registrada sem inconformidades.
                </div>
              )}

            </div>
          </div>

          {/* ITEM 42: PAINEL LATERAL (Aderência, Capacidade, Recomendação, Prazo, Responsável) */}
          <div style={{
            padding: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            overflowY: 'auto'
          }}>
            
            {/* ITEM 44: RECOMENDAÇÃO EM DESTAQUE */}
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '14px'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600, textTransform: 'uppercase' }}>
                Recomendação
              </span>
              <div style={{
                fontSize: '13px',
                fontWeight: 800,
                color: recommendation.decisionColor,
                marginTop: '2px'
              }}>
                {recommendation.decisionLabel}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--brand-slate-400, #94A3B8)', margin: '4px 0 0 0' }}>
                2 itens precisam ser validados antes do envio.
              </p>
            </div>

            {/* ITEM 43: ADERÊNCIA E CAPACIDADE (Números simples, sem gráfico circular gigante) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600 }}>Aderência técnica</span>
                  <strong style={{ color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>{recommendation.adherence}%</strong>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${recommendation.adherence}%`, height: '100%', background: 'var(--accent-primary, #0284C7)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600 }}>Capacidade documental</span>
                  <strong style={{ color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>{recommendation.capability}%</strong>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${recommendation.capability}%`, height: '100%', background: 'var(--status-go, #10B981)' }} />
                </div>
              </div>
            </div>

            {/* METADADOS OPERACIONAIS */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '11px',
              color: 'var(--brand-slate-400, #94A3B8)',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              paddingTop: '12px'
            }}>
              <div>
                Empresa: <strong style={{ color: '#E2E8F0' }}>{opportunity.recommendedCompany || 'Veeluen'}</strong>
              </div>
              <div>
                Valor Estimado: <strong style={{ color: '#E2E8F0' }}>{opportunity.estimatedValue || 'Não divulgado'}</strong>
              </div>
              <div>
                Responsável: <strong style={{ color: '#E2E8F0' }}>Eng. Roberto Silva</strong>
              </div>
            </div>

            {/* TOMADA DE DECISÃO RÁPIDA IN-PLACE */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              paddingTop: '12px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-slate-300, #CBD5E1)', marginBottom: '4px' }}>
                Registrar parecer:
              </span>

              <button
                onClick={() => handleMakeDecision('GO')}
                style={{
                  background: currentDecision === 'GO' ? 'var(--status-go, #10B981)' : 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--status-go, #10B981)',
                  color: currentDecision === 'GO' ? '#0B132B' : 'var(--status-go, #10B981)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Check size={13} />
                <span>GO (Confirmar participação)</span>
              </button>

              <button
                onClick={() => handleMakeDecision('GO_PENDENCIAS')}
                style={{
                  background: currentDecision === 'GO_PENDENCIAS' ? 'var(--status-warning, #F59E0B)' : 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid var(--status-warning, #F59E0B)',
                  color: currentDecision === 'GO_PENDENCIAS' ? '#0B132B' : 'var(--status-warning, #F59E0B)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                GO com pendências
              </button>

              <button
                onClick={() => handleMakeDecision('NO-GO')}
                style={{
                  background: currentDecision === 'NO-GO' ? 'var(--status-danger, #EF4444)' : 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--status-danger, #EF4444)',
                  color: currentDecision === 'NO-GO' ? '#FFFFFF' : 'var(--status-danger, #EF4444)',
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                NO-GO (Descartar)
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Modal de Análise Completa de Edital */}
      <EditalAnalysisModal
        opportunityId={opportunity.id}
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      />

      {/* Copilot Contextualizado */}
      <GlobalCopilotModal
        isOpen={showCopilotModal}
        onClose={() => setShowCopilotModal(false)}
        activeOpportunity={opportunity}
        currentModule="oportunidade"
      />
    </div>
  );
}
