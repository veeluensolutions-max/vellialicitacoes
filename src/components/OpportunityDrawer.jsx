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
  UserCheck,
  BookOpen,
  Sparkles,
  Download,
  FolderCheck
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { DecisionService } from '../services/decision/decisionService';
import { ProposalService } from '../services/proposal/proposalService';
import { ResultsIntelligenceService } from '../services/results/resultsIntelligenceService';
import { MvpScoreService } from '../services/mvp/mvpScoreService';
import { contractPerformanceService } from '../services/contract/contractPerformanceService';
import EditalAnalysisModal from './EditalAnalysisModal';
import GlobalCopilotModal from './GlobalCopilotModal';
import DossierModal from './DossierModal';
import TenderScheduleNotificationModal from './notifications/TenderScheduleNotificationModal';
import ImpugnationGeneratorModal from './legal/ImpugnationGeneratorModal';
import { DossierService } from '../services/dossier/dossierService.js';
import { ZipPackageService } from '../services/dossier/zipPackageService.js';
import { uxTelemetryService, UxEventType } from '../services/ux/uxTelemetryService';
import { contextualMatchingEngine } from '../services/intelligence/contextualMatchingEngine';
import { humanFeedbackService, FeedbackAccuracy, FeedbackReason } from '../services/intelligence/humanFeedbackService';
import { DocumentComplianceChecker } from '../services/vault/documentComplianceChecker';
import DataHealthBadge from './dataGovernance/DataHealthBadge';
import ContextualMetricHelp from './common/ContextualMetricHelp';
import QuickFeedbackWidget from './common/QuickFeedbackWidget';
import './OpportunityDrawer.css';

export default function OpportunityDrawer({ opportunity, onClose }) {
  if (!opportunity) return null;

  // ITEM 48: LIMITAR NÚMERO DE ABAS (Visão Geral, Análise, Documentos, Decisão, Histórico)
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showCopilotModal, setShowCopilotModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showImpugnModal, setShowImpugnModal] = useState(false);
  const [zipFeedback, setZipFeedback] = useState(null);
  
  // Decisão in-place reativa (Item 23 e 24)
  const [currentDecision, setCurrentDecision] = useState(() => {
    const hum = DecisionService.getHumanDecision(opportunity.id || opportunity.number);
    return hum ? hum.currentDecision : 'PENDENTE';
  });
  const [decisionFeedback, setDecisionFeedback] = useState(null);

  // Ação de download direto do Dossiê ZIP em 1 clique
  const handleDownloadDossierZip = () => {
    try {
      const generatedDossier = DossierService.generateDossierForOpportunity(opportunity);
      const res = ZipPackageService.downloadDossierZip(generatedDossier, opportunity);
      setZipFeedback(`Pacote ${res.filename} baixado com sucesso!`);
      setTimeout(() => setZipFeedback(null), 4000);
    } catch (err) {
      alert(`Erro ao exportar ZIP: ${err.message}`);
    }
  };

  // FASE 26: TELEMETRIA OPERACIONAL & TIME TO ACTION
  React.useEffect(() => {
    if (opportunity) {
      uxTelemetryService.recordEvent(
        UxEventType.OPPORTUNITY_OPENED, 
        'OpportunityDrawer', 
        { id: opportunity.id || opportunity.number, portal: opportunity.portal, score: opportunity.score },
        1
      );
      uxTelemetryService.startActionTimer(`opp_${opportunity.id || opportunity.number}`);
    }
  }, [opportunity?.id, opportunity?.number]);

  const recommendation = MvpScoreService.getConsolidatedRecommendation(opportunity);
  const canonicalStatusInfo = OpportunityService.getCanonicalStatusInfo(opportunity);

  // FASE 27: ANÁLISE CONTEXTUAL AVANÇADA (TECHNICAL MATCH, CONFIANÇA E INTENÇÃO)
  const contextualAnalysis = React.useMemo(() => {
    return contextualMatchingEngine.analyze({
      title: opportunity.title,
      object: opportunity.object,
      description: opportunity.description || opportunity.object,
      location: opportunity.location,
      daysLeft: opportunity.daysLeft,
      forcedPortal: opportunity.portal
    });
  }, [opportunity]);

  // FASE 47: CLOSED-LOOP LEARNING (LIÇÕES APRENDIDAS APROVADAS DE CONTRATOS ANTERIORES)
  const serviceName = contextualAnalysis.primaryServiceName || opportunity.serviceCategory || 'Tratamento de Efluentes e Operação de ETE';
  const companyScope = opportunity.company || contextualAnalysis.recommendedCompany || 'ALL';
  const applicableLessons = React.useMemo(() => {
    return contractPerformanceService.getApplicableLessons(serviceName, companyScope);
  }, [serviceName, companyScope]);
  const internalBenchmark = React.useMemo(() => {
    return contractPerformanceService.getInternalBenchmark(serviceName, companyScope);
  }, [serviceName, companyScope]);

  // Cruzamento automático de conformidade documental do cofre com o certame
  const compliance = React.useMemo(() => {
    return DocumentComplianceChecker.checkCompliance(opportunity);
  }, [opportunity]);

  const [humanFeedback, setHumanFeedback] = useState(() => {
    return humanFeedbackService.getFeedbackForOpportunity(opportunity.id || opportunity.number);
  });
  const [feedbackSavedMsg, setFeedbackSavedMsg] = useState(null);

  const handleRegisterFeedback = (accuracy, reason = null) => {
    const oppId = opportunity.id || opportunity.number;
    const fb = humanFeedbackService.recordFeedback({
      opportunityId: oppId,
      accuracy,
      reason,
      suggestedService: contextualAnalysis.primaryServiceName,
      suggestedCompany: contextualAnalysis.recommendedCompany
    });
    setHumanFeedback(fb);
    setFeedbackSavedMsg(`Feedback "${accuracy}" registrado.`);
    setTimeout(() => setFeedbackSavedMsg(null), 3000);
  };

  const handleMakeDecision = (decisionType) => {
    const oppId = opportunity.id || opportunity.number;
    const elapsedMs = uxTelemetryService.stopActionTimer(`opp_${oppId}`);
    uxTelemetryService.recordEvent(
      UxEventType.GO_DECISION,
      'OpportunityDrawer',
      { id: oppId, decision: decisionType },
      1,
      elapsedMs
    );

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
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('vellia-open-war-room', { detail: { opportunity } }));
                }}
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.3) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#FCA5A5',
                  borderRadius: 'var(--radius-sm, 6px)',
                  padding: '5px 11px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Abrir a Sala de Guerra da Licitação (FASE 30)"
              >
                <ShieldCheck size={13} color="#F87171" />
                <span>Sala de Guerra</span>
              </button>

              <button
                onClick={() => setShowScheduleModal(true)}
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  borderRadius: 'var(--radius-sm, 6px)',
                  padding: '5px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Agendar prazos no Google Calendar, baixar .ICS com alarmes e disparar alertas por e-mail"
              >
                <Calendar size={13} />
                <span>Agendar & Notificar</span>
              </button>

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

          {/* Linha 2: Título, Status Canônico e Contratante */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: '4px',
                background: canonicalStatusInfo.bg,
                color: canonicalStatusInfo.color,
                fontWeight: 700,
                border: `1px solid ${canonicalStatusInfo.color}40`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: canonicalStatusInfo.color }} />
                {canonicalStatusInfo.label}
              </span>

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
                { id: 'aprendizado', label: applicableLessons.length > 0 ? `Aprendizado (${applicableLessons.length})` : 'Aprendizado' },
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

                  {/* FASE 50: BLOCO PRINCIPAL "RESUMO VELLIA" (Seções 19 a 21: Por que importa, Principais riscos, Principais pendências, Próxima decisão) */}
                  <div style={{
                    background: 'rgba(2, 132, 199, 0.04)',
                    border: '1px solid rgba(2, 132, 199, 0.25)',
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(2, 132, 199, 0.15)', paddingBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bot size={16} style={{ color: 'var(--accent-primary, #0284C7)' }} />
                        <strong style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 700 }}>
                          Resumo Vellia • Síntese Operacional Grounded
                        </strong>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--accent-primary, #38BDF8)', fontWeight: 600, background: 'rgba(2, 132, 199, 0.12)', padding: '2px 8px', borderRadius: '4px' }}>
                        Evidências Reais
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                      {/* 1. Por que importa */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8', display: 'block', marginBottom: '4px' }}>
                          🎯 Por que importa
                        </span>
                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#E2E8F0', margin: 0 }}>
                          Aderência técnica de <strong>{contextualAnalysis.technicalMatchScore}%</strong> com o serviço <strong>{contextualAnalysis.primaryServiceName}</strong>. Objeto alinhado à empresa recomendada ({contextualAnalysis.recommendedCompany || opportunity.company || 'Veeluen'}) para {opportunity.client}.
                        </p>
                      </div>

                      {/* 2. Principais riscos */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: recommendation.riskTier === 'Baixo' ? '#10B981' : '#F59E0B', display: 'block', marginBottom: '4px' }}>
                          ⚠️ Principais riscos ({recommendation.riskTier})
                        </span>
                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#E2E8F0', margin: 0 }}>
                          {opportunity.daysLeft <= 3 ? `Prazo exíguo de submissão (${opportunity.daysLeft} dias restantes). ` : ''}
                          {recommendation.capability < 85 ? 'Exigência de atestado com dimensionamento técnico específico. ' : 'Habilitação técnica com respaldo nos atestados vigentes do acervo. '}
                          Risco contratual estimado em {recommendation.riskScore}/100 com governança ativa.
                        </p>
                      </div>

                      {/* 3. Principais pendências */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#FBBF24', display: 'block', marginBottom: '4px' }}>
                          📋 Principais pendências
                        </span>
                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#E2E8F0', margin: 0 }}>
                          {recommendation.pendingItems?.length > 0 
                            ? recommendation.pendingItems.map(p => `• ${p.label}`).join('; ')
                            : '• Validação de BDI e precificação comercial; conferência final de certidões conjuntas.'}
                        </p>
                      </div>

                      {/* 4. Próxima decisão */}
                      <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#34D399', display: 'block', marginBottom: '4px' }}>
                          🧭 Próxima decisão
                        </span>
                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#E2E8F0', margin: 0 }}>
                          {currentDecision === 'GO' 
                            ? 'Deliberação GO confirmada. Elaborar Proposta Comercial e verificar composição de BDI.'
                            : currentDecision === 'NO-GO'
                            ? 'Oportunidade desconsiderada por deliberação humana formal.'
                            : `Deliberação pendente no Decision Board. Recomendação calculada: ${recommendation.decisionLabel}.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FASE 52: QUICK FEEDBACK DE VALOR ("Isso ajudou?") */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
                    <QuickFeedbackWidget 
                      entityType="OpportunitySummary"
                      entityId={opportunity.id || opportunity.number}
                      prompt="A síntese deste edital ajudou na sua tomada de decisão?"
                    />
                  </div>

                  {/* PRONTIDÃO DE HABILITAÇÃO & COFRE DOCUMENTAL DINÂMICO */}
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: `1px solid ${compliance.overallStatus === 'IMPEDIMENTO' ? 'rgba(239, 68, 68, 0.35)' : compliance.overallStatus === 'ATENCAO' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(148, 163, 184, 0.12)'}`,
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} color={compliance.overallStatus === 'IMPEDIMENTO' ? '#EF4444' : compliance.overallStatus === 'ATENCAO' ? '#F59E0B' : '#10B981'} />
                        <strong style={{ fontSize: '13px', color: '#FFFFFF', fontWeight: 600 }}>
                          Prontidão de Habilitação ({compliance.companyName})
                        </strong>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: compliance.statusBadge.bg,
                        color: compliance.statusBadge.color
                      }}>
                        {compliance.statusBadge.label}
                      </span>
                    </div>

                    {/* Alerta de bloqueio ou atenção */}
                    {compliance.blockingIssues.length > 0 && (
                      <div style={{
                        background: compliance.overallStatus === 'IMPEDIMENTO' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        border: `1px solid ${compliance.overallStatus === 'IMPEDIMENTO' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        marginBottom: '10px',
                        fontSize: '11px',
                        color: compliance.overallStatus === 'IMPEDIMENTO' ? '#FCA5A5' : '#FDE68A',
                        lineHeight: 1.4
                      }}>
                        {compliance.blockingIssues.map((issue, idx) => (
                          <div key={idx}><strong>{issue.title}:</strong> {issue.desc}</div>
                        ))}
                      </div>
                    )}

                    {/* Lista das Certidões Reais do Cofre */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                      {compliance.certificates.map(cert => (
                        <div 
                          key={cert.key} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            fontSize: '11px', 
                            color: '#CBD5E1', 
                            padding: '4px 0', 
                            borderBottom: '1px solid rgba(148, 163, 184, 0.06)' 
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cert.statusColor }} />
                            {cert.nome}
                          </span>
                          <span style={{ color: cert.statusColor, fontWeight: 600 }}>
                            {cert.status} ({cert.validade})
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Atestado de Capacidade Técnica Vinculado */}
                    {compliance.attestation && (
                      <div style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        border: '1px solid rgba(148, 163, 184, 0.1)',
                        fontSize: '11px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ color: '#94A3B8' }}>Atestado Vinculado (CAT):</span>
                          <span style={{ color: '#38BDF8', fontWeight: 600 }}>Score {compliance.attestation.scoreBase}%</span>
                        </div>
                        <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{compliance.attestation.cliente}</div>
                        <div style={{ color: '#94A3B8', fontSize: '10px' }}>{compliance.attestation.artNumero} • {compliance.attestation.volume}</div>
                      </div>
                    )}

                    {/* BOTÕES DE AÇÃO: EXPORTAÇÃO EM 1 CLIQUE DO DOSSIÊ ZIP & VISUALIZAÇÃO */}
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleDownloadDossierZip}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                          border: '1px solid #38BDF8',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                          transition: 'all 150ms ease'
                        }}
                        title="Baixar ZIP estruturado com certidões do cofre, CATs e declarações oficiais da empresa"
                      >
                        <Download size={13} />
                        <span>Baixar Dossiê de Habilitação (ZIP)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDossierModal(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#CBD5E1',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Abrir checklist completo, assinaturas e visualização"
                      >
                        <FolderCheck size={13} />
                        <span>Ver Dossiê</span>
                      </button>
                    </div>

                    {/* Feedback Toast de ZIP */}
                    {zipFeedback && (
                      <div style={{
                        marginTop: '8px',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34D399',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <CheckCircle2 size={13} />
                        <span>{zipFeedback}</span>
                      </div>
                    )}
                  </div>

                  {/* FASE 47: CLOSED-LOOP LEARNING (ITENS 85 A 91) */}
                  {applicableLessons.length > 0 && (
                    <div style={{
                      background: 'rgba(56, 189, 248, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: 'var(--radius-md, 8px)',
                      padding: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <BookOpen size={16} style={{ color: '#38BDF8' }} />
                          <strong style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>
                            Aprendizado de Contratos Anteriores ({applicableLessons.length})
                          </strong>
                        </div>
                        <span style={{ fontSize: '10px', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          Fase 47 Closed-Loop
                        </span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--brand-slate-300, #CBD5E1)', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                        Lições aprovadas de contratos executados para <strong>{serviceName}</strong>:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {applicableLessons.slice(0, 2).map(lesson => (
                          <div key={lesson.id} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                              <strong style={{ color: '#F8FAFC' }}>{lesson.title}</strong>
                              <span style={{ color: '#38BDF8', fontWeight: 600 }}>{lesson.category}</span>
                            </div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{lesson.recommendation}</div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setActiveTab('aprendizado')}
                        style={{
                          marginTop: '10px',
                          background: 'transparent',
                          border: 'none',
                          color: '#38BDF8',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0
                        }}
                      >
                        <span>Ver todas as lições e referências internas</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  )}

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

                  {/* FASE 47: Pre-Bid Lessons no Go/No-Go (Item 88) */}
                  {applicableLessons.length > 0 && (
                    <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '14px', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <Sparkles size={14} color="#38BDF8" />
                        <strong style={{ fontSize: '12px', color: '#FFFFFF' }}>Lições de Execuções Anteriores no Go/No-Go:</strong>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {applicableLessons.map(l => (
                          <div key={l.id} style={{ fontSize: '11px', color: '#CBD5E1' }}>
                            • <strong style={{ color: '#38BDF8' }}>[{l.category}]</strong> {l.recommendation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'aprendizado' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: 'rgba(30, 41, 59, 0.35)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <BookOpen size={16} color="#38BDF8" />
                      <h4 style={{ margin: 0, fontSize: '13px', color: '#FFFFFF' }}>
                        Closed-Loop Learning: {serviceName}
                      </h4>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                      Lições de execução real estruturadas na Fase 47. Somente lições aprovadas pela Diretoria alimentam este painel.
                    </p>
                  </div>

                  {/* Benchmark Referência Interna (Item 131) */}
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Referência Interna do Histórico de Execução
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                      <div>
                        <span style={{ color: '#94A3B8' }}>Amostra de Contratos:</span>
                        <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{internalBenchmark.sampleSize} contrato(s) analisado(s)</div>
                      </div>
                      <div>
                        <span style={{ color: '#94A3B8' }}>Prazo Médio de Mobilização:</span>
                        <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{internalBenchmark.avgMobilizationDays}</div>
                      </div>
                    </div>
                    {internalBenchmark.isSmallSample && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: '4px' }}>
                        ⚠ {internalBenchmark.sampleWarning}
                      </div>
                    )}
                  </div>

                  {/* Lista de Lições */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                      Lições Aprovadas Aplicáveis ({applicableLessons.length})
                    </div>
                    {applicableLessons.length === 0 ? (
                      <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                        Nenhuma lição formal registrada para este escopo específico ainda.
                      </div>
                    ) : (
                      applicableLessons.map(l => (
                        <div key={l.id} style={{ background: 'rgba(30, 41, 59, 0.4)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '12px', color: '#F8FAFC' }}>{l.title}</strong>
                            <span style={{ fontSize: '10px', color: '#34D399', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              {l.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#CBD5E1', marginBottom: '4px' }}>{l.description}</div>
                          <div style={{ fontSize: '11px', color: '#38BDF8', background: 'rgba(56, 189, 248, 0.08)', padding: '6px 8px', borderRadius: '4px' }}>
                            <strong>Recomendação:</strong> {l.recommendation}
                          </div>
                        </div>
                      ))
                    )}
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

            {/* ITEM 43 & FASE 27: ADERÊNCIA TÉCNICA SEPARADA DE FIT COMERCIAL E CONFIANÇA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <span style={{ color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600 }}>Relevância Técnica</span>
                    <ContextualMetricHelp metricKey="ADERENCIA_TECNICA" />
                  </div>
                  <strong style={{ color: '#38BDF8', fontVariantNumeric: 'tabular-nums' }}>{contextualAnalysis.technicalMatchScore}%</strong>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${contextualAnalysis.technicalMatchScore}%`, height: '100%', background: '#38BDF8' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600 }}>Fit Comercial & Regional</span>
                  <strong style={{ color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>{contextualAnalysis.commercialFitScore}%</strong>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(148, 163, 184, 0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${contextualAnalysis.commercialFitScore}%`, height: '100%', background: '#10B981' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', paddingTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <span style={{ color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600 }}>Confiança do Agente:</span>
                  <ContextualMetricHelp metricKey="CONFIANCA_AGENTE" />
                </div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  background: contextualAnalysis.confidence === 'Alta' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: contextualAnalysis.confidence === 'Alta' ? '#34D399' : '#FBBF24'
                }}>
                  {contextualAnalysis.confidence}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                <span style={{ color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600 }}>Intenção:</span>
                <strong style={{ color: contextualAnalysis.isSupplyOnly ? '#F87171' : '#E2E8F0', fontSize: '11px' }}>
                  {contextualAnalysis.serviceIntent}
                </strong>
              </div>
            </div>

            {/* FASE 50: PAINEL LATERAL CANÔNICO DE METADADOS (Seção 18) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '11px',
              color: 'var(--brand-slate-400, #94A3B8)',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              paddingTop: '12px'
            }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--brand-slate-500, #64748B)', letterSpacing: '0.04em' }}>
                Resumo Cadastral Canônico
              </span>

              <div>
                Contratante: <strong style={{ color: '#F8FAFC' }}>{opportunity.client}</strong>
              </div>

              <div>
                Prazo: <strong style={{ color: isUrgent ? '#EF4444' : '#E2E8F0' }}>{opportunity.daysLeft} dias restantes</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Valor: <strong style={{ color: '#E2E8F0' }}>{opportunity.estimatedValue || 'Não divulgado'}</strong></span>
                <DataHealthBadge entityId={opportunity.id || opportunity.number} field="estimatedValue" value={opportunity.estimatedValue} size="xs" />
              </div>

              <div>
                Serviço: <strong style={{ color: '#E2E8F0' }}>{contextualAnalysis.primaryServiceName}</strong>
              </div>

              <div>
                Empresa: <strong style={{ color: '#E2E8F0' }}>{contextualAnalysis.recommendedCompany || opportunity.recommendedCompany || 'Veeluen'}</strong>
              </div>

              <div>
                Owner / Responsável: <strong style={{ color: '#E2E8F0' }}>{opportunity.responsible || 'Equipe Técnica Licitações'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Status:</span>
                <span style={{ color: canonicalStatusInfo.color, fontWeight: 700 }}>{canonicalStatusInfo.label}</span>
              </div>

              <div>
                Aderência Técnica: <strong style={{ color: '#38BDF8' }}>{contextualAnalysis.technicalMatchScore}%</strong>
              </div>

              <div>
                Capacidade Operacional: <strong style={{ color: '#10B981' }}>{recommendation.capability}%</strong>
              </div>

              <div>
                Risco: <strong style={{ color: recommendation.riskTier === 'Baixo' ? '#10B981' : '#F59E0B' }}>{recommendation.riskTier} ({recommendation.riskScore}/100)</strong>
              </div>

              <div style={{ background: 'rgba(2, 132, 199, 0.1)', border: '1px solid rgba(2, 132, 199, 0.25)', padding: '6px 8px', borderRadius: '4px', marginTop: '4px' }}>
                <span style={{ color: 'var(--accent-primary, #38BDF8)', fontWeight: 600 }}>Próxima Ação:</span>{' '}
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {currentDecision === 'GO' ? 'Elaborar Proposta Comercial' : currentDecision === 'NO-GO' ? 'Certame Arquivado' : 'Deliberar Go / No-Go'}
                </span>
              </div>
            </div>

            {/* WIDGET DE FEEDBACK HUMANO (FASE 27: ITENS 68 A 70) */}
            <div style={{
              borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              paddingTop: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--brand-slate-400, #94A3B8)', fontWeight: 600, textTransform: 'uppercase' }}>
                Feedback da Classificação
              </span>

              {feedbackSavedMsg && (
                <div style={{ fontSize: '11px', color: '#34D399', fontWeight: 600 }}>
                  ✓ {feedbackSavedMsg}
                </div>
              )}

              {humanFeedback ? (
                <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} color="#10B981" />
                  <span>Avaliado como: <strong>{humanFeedback.accuracy}</strong></span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#CBD5E1' }}>Essa análise foi precisa?</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      type="button"
                      onClick={() => handleRegisterFeedback(FeedbackAccuracy.YES)}
                      style={{
                        flex: 1,
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34D399',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Sim
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleRegisterFeedback(FeedbackAccuracy.PARTIAL, FeedbackReason.WRONG_SERVICE)}
                      style={{
                        flex: 1,
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#FBBF24',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Parcial
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleRegisterFeedback(FeedbackAccuracy.NO, FeedbackReason.IRRELEVANT)}
                      style={{
                        flex: 1,
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#F87171',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Não
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* TOMADA DE DECISÃO RÁPIDA IN-PLACE (FASE 26: ITENS 18 A 20) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)',
              paddingTop: '12px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brand-slate-300, #CBD5E1)', marginBottom: '4px' }}>
                Decisão da Oportunidade:
              </span>

              {/* CTA Dominante Único (Item 18) */}
              <button
                onClick={() => handleMakeDecision('GO')}
                style={{
                  background: currentDecision === 'GO' ? 'var(--status-go, #10B981)' : 'var(--color-brand-primary, #0284C7)',
                  color: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 10px rgba(2, 132, 199, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Check size={14} />
                <span>{currentDecision === 'GO' ? '✓ Participação Confirmada (GO)' : 'Tomar Decisão GO (Participar)'}</span>
              </button>

              {/* Ações Secundárias Sutis (Itens 19 e 20) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                <button
                  onClick={() => handleMakeDecision('GO_PENDENCIAS')}
                  style={{
                    background: currentDecision === 'GO_PENDENCIAS' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    color: '#FBBF24',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  GO c/ pendências
                </button>

                <button
                  onClick={() => handleMakeDecision('NO-GO')}
                  style={{
                    background: currentDecision === 'NO-GO' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#F87171',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Descartar (NO-GO)
                </button>
              </div>

              {/* AÇÃO DE CALENDÁRIO & ALERTAS CORPORATIVOS */}
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                style={{
                  background: 'rgba(56, 189, 248, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#38BDF8',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '8px',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
                title="Agendar prazos de impugnação, esclarecimento e sessão no Google Calendar e notificar equipe"
              >
                <Calendar size={13} />
                <span>Agendar Prazos & Notificar</span>
              </button>

              <button
                type="button"
                onClick={() => setShowImpugnModal(true)}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#fca5a5',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  width: '100%',
                  transition: 'all 0.15s ease'
                }}
                title="Gerar Petição Formal de Impugnação ao Edital com Súmulas do TCU e IA"
              >
                <Scale size={13} />
                <span>Gerar Minuta de Impugnação (TCU/IA)</span>
              </button>
            </div>

          </div>
        </div>

        {/* BARRA FIXA MOBILE / IPHONE (FASE 26: ITEM 82) */}
        <div className="mobile-sticky-decision-bar">
          <button 
            onClick={() => handleMakeDecision('GO')}
            style={{
              flex: 2,
              background: 'var(--status-go, #10B981)',
              color: '#070E1A',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Check size={16} />
            <span>Decidir GO</span>
          </button>
          <button 
            onClick={() => handleMakeDecision('NO-GO')}
            style={{
              flex: 1,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#F87171',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            NO-GO
          </button>
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

      {/* Dossiê Inteligente de Habilitação & Fila de Assinaturas */}
      <DossierModal
        opportunity={opportunity}
        isOpen={showDossierModal}
        onClose={() => setShowDossierModal(false)}
      />

      {/* Modal de Agendamento Google Calendar, .ICS e Notificação Corporativa */}
      <TenderScheduleNotificationModal
        opportunity={opportunity}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      {/* Modal de Geração de Impugnações e Recursos (TCU e IA) */}
      <ImpugnationGeneratorModal
        opportunity={opportunity}
        isOpen={showImpugnModal}
        onClose={() => setShowImpugnModal(false)}
      />
    </div>
  );
}
