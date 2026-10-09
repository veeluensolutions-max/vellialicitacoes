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
  Sparkles, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Clock,
  Share2,
  FileSearch,
  Scale,
  FileSpreadsheet,
  Trophy,
  Bot,
  AlertCircle,
  Check,
  ArrowRight
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { DecisionService } from '../services/decision/decisionService';
import { ProposalService } from '../services/proposal/proposalService';
import { ResultsIntelligenceService } from '../services/results/resultsIntelligenceService';
import { MvpScoreService } from '../services/mvp/mvpScoreService';
import ProposalDetailView from './ProposalDetailView';
import EditalAnalysisModal from './EditalAnalysisModal';
import GlobalCopilotModal from './GlobalCopilotModal';
import './OpportunityDrawer.css';

export default function OpportunityDrawer({ opportunity, onClose }) {
  if (!opportunity) return null;

  const [activeTab, setActiveTab] = useState('resumo'); // 'resumo' | 'analise' | 'habilitacao' | 'decisao' | 'documentos' | 'historico'
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [activeProposalId, setActiveProposalId] = useState(null);
  
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
      'Decisão registrada diretamente via painel da oportunidade (Fase 24 MVP)',
      'Equipe Comercial Vellia'
    );
    setCurrentDecision(decisionType);
    setDecisionFeedback(`Decisão ${decisionType} registrada com sucesso no Vellia.`);
    setTimeout(() => setDecisionFeedback(null), 3000);
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px', width: '92vw' }}>
        
        {/* TOPO: RESUMO IMEDIATO (Item 18) */}
        <div className="drawer-header" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)' }}>
          <div className="drawer-header-left" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="drawer-code mono">{opportunity.id}</span>
                <span className="drawer-portal-pill">{opportunity.portal}</span>
                <span className="drawer-modality-pill">{opportunity.modality || 'Pregão Eletrônico'}</span>
                <span style={{
                  fontSize: '11px',
                  background: currentDecision === 'GO' ? 'rgba(16, 185, 129, 0.15)' : currentDecision === 'NO-GO' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: currentDecision === 'GO' ? '#10B981' : currentDecision === 'NO-GO' ? '#EF4444' : '#F59E0B',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  {currentDecision === 'GO' ? 'GO CONFIRMADO' : currentDecision === 'NO-GO' ? 'NO-GO' : 'EM ANÁLISE'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowCopilotModal(true)}
                  style={{
                    background: 'rgba(0, 229, 201, 0.12)',
                    border: '1px solid rgba(0, 229, 201, 0.3)',
                    color: '#00E5C9',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Perguntar dúvidas ao Vellia sobre este edital"
                >
                  <Bot size={14} />
                  <span>Perguntar ao Vellia</span>
                </button>

                <button 
                  className="drawer-close-btn" 
                  onClick={onClose}
                  aria-label="Fechar painel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <h2 className="drawer-title" style={{ fontSize: '18px', lineHeight: 1.3 }}>
              {opportunity.title}
            </h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#94A3B8' }}>
              <span>Contratante: <strong style={{ color: '#F8FAFC' }}>{opportunity.client}</strong></span>
              <span>Empresa Recomendada: <strong style={{ color: '#00E5C9' }}>{opportunity.recommendedCompany || 'Veeluen Solutions'}</strong></span>
              <span>Valor Est.: <strong style={{ color: '#F8FAFC' }}>{opportunity.estimatedValue}</strong></span>
              <span>Prazo: <strong style={{ color: opportunity.daysLeft <= 3 ? '#EF4444' : '#F8FAFC' }}>{opportunity.daysLeft} dias restantes</strong></span>
            </div>
          </div>
        </div>

        {/* ITEM 19 & 21: BLOCO CONSOLIDADO “RECOMENDAÇÃO VELLIA” (Aderência, Capacidade, Decisão, Risco) */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          padding: '16px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Aderência */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>1. Aderência</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#00E5C9' }}>{recommendation.adherence}%</span>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Match IA</span>
            </div>
          </div>

          {/* Capacidade */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>2. Capacidade</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#3B82F6' }}>{recommendation.capability}%</span>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Habilitação</span>
            </div>
          </div>

          {/* Decisão Recomendada */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>3. Decisão Sugerida</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              color: recommendation.decisionColor,
              marginTop: '4px'
            }}>
              {recommendation.decisionLabel}
            </span>
          </div>

          {/* Risco (Complementar) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>Risco Operacional</span>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              color: recommendation.riskColor,
              marginTop: '4px'
            }}>
              {recommendation.riskTier} ({recommendation.riskScore}%)
            </span>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS CONSOLIDADAS (Item 17: Resumo, Análise, Habilitação, Decisão, Documentos, Histórico) */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '0 20px',
          overflowX: 'auto',
          gap: '4px'
        }}>
          {[
            { id: 'resumo', label: 'Resumo & Ação' },
            { id: 'analise', label: 'Análise de Edital' },
            { id: 'habilitacao', label: 'Habilitação & Capacidade' },
            { id: 'decisao', label: 'Decisão GO / NO-GO' },
            { id: 'documentos', label: 'Documentos' },
            { id: 'historico', label: 'Histórico & Inteligência' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #00E5C9' : '2px solid transparent',
                color: activeTab === tab.id ? '#00E5C9' : '#94A3B8',
                padding: '12px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CORPO DO PAINEL */}
        <div className="drawer-body" style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          
          {decisionFeedback && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#10B981',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{decisionFeedback}</span>
            </div>
          )}

          {/* ABA RESUMO: VISÃO GERAL + TOMADA DE DECISÃO IN-PLACE + PENDÊNCIAS */}
          {activeTab === 'resumo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* ITEM 23 & 24: BOTÃO PRINCIPAL CLARO: TOMAR DECISÃO IN-PLACE */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(0, 229, 201, 0.3)',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scale size={18} style={{ color: '#00E5C9' }} />
                    <strong style={{ fontSize: '14px', color: '#FFF' }}>Tomar Decisão Estratégica</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0 0' }}>
                    Decida diretamente sem navegar para outra tela. Atualiza o pipeline imediatamente.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleMakeDecision('GO')}
                    style={{
                      background: currentDecision === 'GO' ? '#10B981' : 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid #10B981',
                      color: currentDecision === 'GO' ? '#FFF' : '#10B981',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Check size={14} />
                    <span>GO</span>
                  </button>

                  <button
                    onClick={() => handleMakeDecision('GO_PENDENCIAS')}
                    style={{
                      background: currentDecision === 'GO_PENDENCIAS' ? '#F59E0B' : 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid #F59E0B',
                      color: currentDecision === 'GO_PENDENCIAS' ? '#FFF' : '#F59E0B',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    GO com pendências
                  </button>

                  <button
                    onClick={() => handleMakeDecision('NO-GO')}
                    style={{
                      background: currentDecision === 'NO-GO' ? '#EF4444' : 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid #EF4444',
                      color: currentDecision === 'NO-GO' ? '#FFF' : '#EF4444',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    NO-GO
                  </button>
                </div>
              </div>

              {/* ITEM 25: SEÇÃO ÚNICA “O QUE FALTA?” (PENDÊNCIAS) */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(148, 163, 184, 0.15)',
                borderRadius: '12px',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertCircle size={16} style={{ color: '#F59E0B' }} />
                  <strong style={{ fontSize: '13px', color: '#FFF' }}>O que falta? (Pendências Críticas)</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', padding: '6px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    <span>• Documentos: Certidão de regularidade fiscal e trabalhista</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>Em dia</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', padding: '6px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    <span>• Atestados: Comprovação de 500h de monitoramento ambiental</span>
                    <span style={{ color: '#10B981', fontWeight: 700 }}>CAT 4892 Vinculada</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', padding: '6px 0', borderBottom: '1px solid rgba(148, 163, 184, 0.08)' }}>
                    <span>• Tarefas: Revisão de BDI e formação de preço</span>
                    <span style={{ color: '#F59E0B', fontWeight: 700 }}>Aguardando Comercial</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#CBD5E1', padding: '6px 0' }}>
                    <span>• Prazos: Prazo final para envio no portal Petronect</span>
                    <span style={{ color: opportunity.daysLeft <= 3 ? '#EF4444' : '#00E5C9', fontWeight: 700 }}>{opportunity.daysLeft} dias restantes</span>
                  </div>
                </div>
              </div>

              {/* ITEM 26: BOTÃO DESTACADO: VER ANÁLISE COMPLETA DO EDITAL */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '12px' }}>
                <button
                  onClick={() => setShowAnalysisModal(true)}
                  style={{
                    background: 'rgba(0, 229, 201, 0.15)',
                    border: '1px solid rgba(0, 229, 201, 0.4)',
                    color: '#00E5C9',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileSearch size={16} />
                  <span>Ver análise completa do edital</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          )}

          {/* ABA ANÁLISE DE EDITAL */}
          {activeTab === 'analise' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#FFF' }}>Objeto e Escopo Detalhado</h4>
                <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                  {opportunity.description || opportunity.title}
                </p>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#FFF' }}>Cláusulas Relevantes e Vistoria</h4>
                <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                  • Visita Técnica: Facultativa com declaração formal assinada por Responsável Técnico.<br />
                  • Garantia de Proposta: 1% do valor estimado.<br />
                  • Regime de Execução: Empreitada por preço unitário.
                </p>
              </div>

              <button
                onClick={() => setShowAnalysisModal(true)}
                style={{
                  background: '#1E3A8A',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  alignSelf: 'flex-start'
                }}
              >
                Abrir Modal de Análise Completa
              </button>
            </div>
          )}

          {/* ABA HABILITAÇÃO */}
          {activeTab === 'habilitacao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#FFF' }}>Habilitação Jurídica e Fiscal</h4>
                <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>
                  CND Federal, CNDT e Certidão de Falência devidamente auditadas pelo Centro de Capacidade Vellia.
                </p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#FFF' }}>Qualificação Técnico-Operacional</h4>
                <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0 }}>
                  Atestados vinculados à empresa <strong>{opportunity.recommendedCompany || 'Veeluen Solutions'}</strong> satisfazem 100% da métrica de quantitativos mínimos do edital.
                </p>
              </div>
            </div>
          )}

          {/* ABA DECISÃO */}
          {activeTab === 'decisao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#FFF' }}>Decisão Vigente</h4>
                <p style={{ fontSize: '13px', color: '#CBD5E1', margin: 0 }}>
                  Status Atual: <strong style={{ color: currentDecision === 'GO' ? '#10B981' : '#F59E0B' }}>{currentDecision}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleMakeDecision('GO')}
                  style={{
                    background: '#10B981',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Registrar GO
                </button>
                <button
                  onClick={() => handleMakeDecision('GO_PENDENCIAS')}
                  style={{
                    background: '#F59E0B',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  GO com Pendências
                </button>
                <button
                  onClick={() => handleMakeDecision('NO-GO')}
                  style={{
                    background: '#EF4444',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Registrar NO-GO
                </button>
              </div>
            </div>
          )}

          {/* ABA DOCUMENTOS */}
          {activeTab === 'documentos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#FFF' }}>Arquivos do Edital Indexados</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: '#00E5C9' }}>📄 Edital_Petrobras_Bacia_Santos_2026.pdf (4.2 MB)</span>
                  <span style={{ color: '#00E5C9' }}>📄 Termo_de_Referencia_Anexo_I.pdf (1.8 MB)</span>
                  <span style={{ color: '#00E5C9' }}>📄 Planilha_de_Precos_Proposta.xlsx (540 KB)</span>
                </div>
              </div>
            </div>
          )}

          {/* ABA HISTÓRICO */}
          {activeTab === 'historico' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.15)' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#FFF' }}>Trilha de Auditoria & Decisões</h4>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                  • Oportunidade capturada no Petronect via coletor automático.<br />
                  • Aderência calculada pelo Motor Semântico em {recommendation.adherence}%.<br />
                  • Decisão registrada por equipe comercial.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Análise Completa de Edital (Item 26) */}
      <EditalAnalysisModal
        opportunityId={opportunity.id}
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      />

      {/* Copilot Contextualizado (Item 43 a 46) */}
      <GlobalCopilotModal
        isOpen={showCopilotModal}
        onClose={() => setShowCopilotModal(false)}
        activeOpportunity={opportunity}
        currentModule="oportunidade"
      />
    </div>
  );
}
