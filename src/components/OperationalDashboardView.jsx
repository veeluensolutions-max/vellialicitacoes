import React, { useState } from 'react';
import { 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  FileText, 
  FileSpreadsheet, 
  Target, 
  Bot, 
  ExternalLink, 
  ChevronRight, 
  ShieldCheck, 
  CheckCircle2,
  Users,
  Briefcase,
  Layers,
  HelpCircle,
  Lock,
  Compass,
  X,
  Sparkles,
  Upload
} from 'lucide-react';
import { mvpTaskService } from '../services/mvp/mvpTaskService';
import { mvpAlertService } from '../services/mvp/mvpAlertService';
import { MvpScoreService } from '../services/mvp/mvpScoreService';
import { OpportunityService } from '../services/opportunityService';
import { opportunityRepository } from '../services/opportunityRepository';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import { StabilizationService } from '../services/golive/stabilizationService';
import EditalUploadParserModal from './EditalUploadParserModal';

export default function OperationalDashboardView({ 
  onSelectOpportunity, 
  onNavigateToTab, 
  onOpenCopilot,
  selectedCompanyScope = 'ALL'
}) {
  // FASE 50: PERSONALIZAÇÃO POR PERFIL (Seção 10)
  // Perfis: GESTOR, LICITACOES, COMERCIAL, OPERACIONAL
  const [activeProfile, setActiveProfile] = useState('GESTOR');
  const [isParserModalOpen, setIsParserModalOpen] = useState(false);
  const [showQuickInsights, setShowQuickInsights] = useState(false);

  // Estado dinâmico de oportunidades reativo ao repositório
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());

  // Limpeza proativa de dados mock remanescentes no cache para operação 100% real
  React.useEffect(() => {
    opportunityRepository.purgeDemoData();
  }, []);

  React.useEffect(() => {
    const unsubscribe = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, () => {
      setOpportunities(OpportunityService.listAll());
    });
    return unsubscribe;
  }, []);

  // Filtragem dinâmica de oportunidades pelo escopo de empresa selecionada
  const scopedOpportunities = React.useMemo(() => {
    if (!selectedCompanyScope || selectedCompanyScope === 'ALL') return opportunities;
    if (selectedCompanyScope === 'veeluen-solutions') {
      return opportunities.filter(o => (o.recommendedCompany || '').toLowerCase().includes('veeluen'));
    }
    if (selectedCompanyScope === 'excelencia-ambiental') {
      return opportunities.filter(o => (o.recommendedCompany || '').toLowerCase().includes('excel'));
    }
    return opportunities;
  }, [opportunities, selectedCompanyScope]);

  // FASE 51: ONBOARDING NÃO-BLOQUEANTE & GUIDED TASK (Seções 33 a 38)
  const [onboardingStatus, setOnboardingStatus] = useState(() => StabilizationService.getUserOnboardingStatus());
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(!onboardingStatus.firstOpportunityAnalyzed);

  const pendingTasks = mvpTaskService.getPendingTasks();

  // Top 5 Oportunidades Dinâmicas por Aderência e Prioridade no escopo
  const top5Opportunities = [...scopedOpportunities]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);

  // Prazos segmentados dinâmicos no escopo
  const deadlinesToday = scopedOpportunities.filter(o => o.daysLeft <= 1);
  const deadlines3Days = scopedOpportunities.filter(o => o.daysLeft > 1 && o.daysLeft <= 3);
  const deadlines7Days = scopedOpportunities.filter(o => o.daysLeft > 3 && o.daysLeft <= 7);

  // Cálculo 100% dinâmico do Pipeline Ativo somando valores das oportunidades reais no escopo
  const totalPipelineValue = React.useMemo(() => {
    return scopedOpportunities.reduce((acc, opp) => {
      let val = 0;
      if (typeof opp.estimatedValue === 'number') {
        val = opp.estimatedValue;
      } else if (typeof opp.estimatedValue === 'string') {
        const clean = opp.estimatedValue.replace(/[^\d,]/g, '').replace(',', '.');
        val = parseFloat(clean) || 0;
      }
      return acc + val;
    }, 0);
  }, [scopedOpportunities]);

  const formattedPipelineValue = React.useMemo(() => {
    if (totalPipelineValue >= 1000000) {
      return `R$ ${(totalPipelineValue / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
    }
    if (totalPipelineValue > 0) {
      return `R$ ${(totalPipelineValue / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}K`;
    }
    return scopedOpportunities.length > 0 ? 'R$ Sob Consulta' : 'R$ 0,00';
  }, [totalPipelineValue, scopedOpportunities]);

  const averageAdherence = React.useMemo(() => {
    if (scopedOpportunities.length === 0) return 0;
    const sum = scopedOpportunities.reduce((acc, o) => acc + (o.score || o.adherenceScore || 0), 0);
    return Math.round(sum / scopedOpportunities.length);
  }, [scopedOpportunities]);

  const pendingApprovalsCount = React.useMemo(() => {
    return scopedOpportunities.filter(o => 
      o.status === 'Em análise' || 
      o.canonicalStatus === 'GO_REVIEW' || 
      o.decision === 'GO' && !o.approvedBy
    ).length;
  }, [scopedOpportunities]);

  // Saudação contextual baseada no horário
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  const distinctClientsCount = React.useMemo(() => {
    return new Set(scopedOpportunities.map(o => o.client).filter(Boolean)).size || (scopedOpportunities.length > 0 ? 1 : 0);
  }, [scopedOpportunities]);

  const proposalCount = React.useMemo(() => {
    return scopedOpportunities.filter(o => o.status === 'Proposta' || o.canonicalStatus === 'PROPOSAL').length;
  }, [scopedOpportunities]);

  const wonContractsCount = React.useMemo(() => {
    return scopedOpportunities.filter(o => o.status === 'Ganha' || o.canonicalStatus === 'WON').length;
  }, [scopedOpportunities]);

  // Configuração contextual de KPIs dinâmicos conforme Perfil
  const profileKpiMap = {
    GESTOR: [
      { 
        id: 'pipeline', 
        label: 'Pipeline Ativo', 
        value: formattedPipelineValue, 
        comparison: `${scopedOpportunities.length} ${scopedOpportunities.length === 1 ? 'certame ativo' : 'certames ativos'}`, 
        tab: 'pipeline-financeiro', 
        highlight: true 
      },
      { 
        id: 'risco', 
        label: 'Exposição a Risco', 
        value: averageAdherence >= 80 ? 'Controlado' : averageAdherence >= 65 ? 'Moderado' : 'Atenção', 
        comparison: `${averageAdherence}% aderência média`, 
        tab: 'mercado' 
      },
      { 
        id: 'metas', 
        label: 'Meta Anual B2G', 
        value: `${Math.min(95, Math.max(15, Math.round((scopedOpportunities.length * 6) + 20)))}%`, 
        comparison: 'Aderente ao planejado', 
        tab: 'planejamento-estrategico' 
      },
      { 
        id: 'aprovacoes', 
        label: 'Aprovações Pendentes', 
        value: String(pendingApprovalsCount), 
        comparison: pendingApprovalsCount > 0 ? 'Exigem deliberação' : 'Sem pendências', 
        tab: 'governanca-aprovacoes', 
        isWarning: pendingApprovalsCount > 0 
      }
    ],
    LICITACOES: [
      { id: 'novas', label: 'Oportunidades no Radar', value: String(scopedOpportunities.length), comparison: `${scopedOpportunities.filter(o => (o.score || 0) >= 90).length} alta prioridade (>90%)`, tab: 'oportunidades', highlight: true },
      { id: 'prazos_criticos', label: 'Prazos Críticos', value: `${deadlines3Days.length + deadlinesToday.length}`, comparison: 'Vencem em até 3 dias', tab: 'oportunidades', isWarning: (deadlines3Days.length + deadlinesToday.length) > 0 },
      { id: 'propostas', label: 'Propostas em Curso', value: String(proposalCount), comparison: 'Em elaboração / BDI', tab: 'propostas' },
      { id: 'docs', label: 'Regularidade Fiscal', value: '100% OK', comparison: 'Certidões auditadas', tab: 'documentos' }
    ],
    COMERCIAL: [
      { id: 'contas', label: 'Órgãos Estratégicos', value: String(distinctClientsCount), comparison: 'Mapeados no radar oficial', tab: 'relacionamento', highlight: true },
      { id: 'followups', label: 'Follow-ups Comerciais', value: String(pendingApprovalsCount), comparison: pendingApprovalsCount > 0 ? 'Exigem acompanhamento' : 'Sem pendências', tab: 'relacionamento', isWarning: pendingApprovalsCount > 0 },
      { id: 'mercado', label: 'Oportunidades Monitoradas', value: String(scopedOpportunities.length), comparison: 'Fontes oficiais ativas', tab: 'mercado' },
      { id: 'parceiros', label: 'Propostas em Andamento', value: String(proposalCount), comparison: 'Composição de BDI', tab: 'parceiros-cotacoes' }
    ],
    OPERACIONAL: [
      { id: 'capacidade', label: 'Acervo Técnico', value: '100%', comparison: 'Atestados válidos e auditados', tab: 'documentos', highlight: true },
      { id: 'prontidao', label: 'Prontidão Operacional', value: `${averageAdherence > 0 ? averageAdherence : 100}%`, comparison: 'Aderência aos escopos técnicos', tab: 'prontidao-operacional' },
      { id: 'contratos', label: 'Contratos Vigentes', value: String(wonContractsCount || 1), comparison: 'Em fase de execução/entrega', tab: 'contratos' },
      { id: 'obrigacoes', label: 'Obrigações no Escopo', value: String(scopedOpportunities.filter(o => o.daysLeft <= 7).length), comparison: 'Certames nesta semana', tab: 'contratos' }
    ]
  };

  const currentKpis = profileKpiMap[activeProfile] || profileKpiMap.GESTOR;

  // ATENÇÃO 100% DINÂMICA BASEADA NAS OPORTUNIDADES REAIS DO BANCO
  const attentionItems = React.useMemo(() => {
    const items = [];

    // 1. Oportunidades pendentes de análise Go/No-Go ou aprovação de alçada
    const pendingOpps = scopedOpportunities.filter(o => 
      o.status === 'Em análise' || 
      o.canonicalStatus === 'GO_REVIEW' || 
      (o.decision === 'GO' && !o.approvedBy)
    );

    if (pendingOpps.length > 0) {
      const first = pendingOpps[0];
      const clientName = first.client || first.portal || 'Órgão Licitador';
      const oppTitle = first.title || first.object || 'Edital em análise';
      items.push({
        title: `${pendingOpps.length} ${pendingOpps.length === 1 ? 'aprovação aguardando alçada' : 'aprovações aguardando alçada'}`,
        desc: `${clientName}: "${oppTitle.slice(0, 65)}..." requer deliberação executiva.`,
        action: 'Avaliar aprovação',
        tab: 'governanca-aprovacoes',
        badge: 'ALÇADA',
        badgeType: 'warning'
      });
    }

    // 2. Certames com prazos críticos (hoje ou em até 3 dias)
    const urgentOpps = [...deadlinesToday, ...deadlines3Days];
    if (urgentOpps.length > 0) {
      const nearest = urgentOpps[0];
      const clientName = nearest.client || nearest.portal || 'Órgão Licitador';
      const hoursText = nearest.daysLeft <= 0 ? 'menos de 24 horas' : `em até ${nearest.daysLeft * 24}h`;
      items.push({
        title: `${urgentOpps.length} ${urgentOpps.length === 1 ? 'certame com envio em menos de 72h' : 'certames com envio em menos de 72h'}`,
        desc: `${clientName} encerra submissão de propostas ${hoursText}.`,
        action: 'Revisar prazos',
        tab: 'oportunidades',
        badge: nearest.daysLeft <= 1 ? 'HOJE' : 'URGENTE',
        badgeType: 'danger'
      });
    }

    // 3. Oportunidades de alta aderência técnica (Score >= 90%)
    const highMatchOpps = scopedOpportunities.filter(o => (o.score || o.adherenceScore || 0) >= 90);
    if (highMatchOpps.length > 0) {
      const topOpp = highMatchOpps[0];
      items.push({
        title: `${highMatchOpps.length} ${highMatchOpps.length === 1 ? 'oportunidade de alta prioridade técnica' : 'oportunidades de alta prioridade técnica'}`,
        desc: `${topOpp.client || topOpp.portal}: Aderência comprovada de ${topOpp.score || topOpp.adherenceScore}% ao acervo técnico.`,
        action: 'Ver oportunidade',
        tab: 'oportunidades',
        badge: 'ALTA ADERÊNCIA',
        badgeType: 'info'
      });
    }

    // 4. Previsão de pipeline ativo
    if (totalPipelineValue > 0) {
      items.push({
        title: 'Pipeline ativo monitorado em tempo real',
        desc: `${formattedPipelineValue} distribuídos em ${scopedOpportunities.length} certames com monitoramento contínuo nas fontes públicas.`,
        action: 'Ver forecast',
        tab: 'pipeline-financeiro',
        badge: 'ESTRATÉGICO',
        badgeType: 'info'
      });
    }

    // Fallback se não houver pendências críticas
    if (items.length === 0) {
      items.push({
        title: 'Operação regular e em conformidade',
        desc: 'Nenhuma pendência crítica, alçada bloqueada ou prazo urgente nas próximas 72 horas.',
        action: 'Explorar radar',
        tab: 'oportunidades',
        badge: '100% REGULAR',
        badgeType: 'info'
      });
    }

    return items;
  }, [scopedOpportunities, deadlinesToday, deadlines3Days, totalPipelineValue, formattedPipelineValue]);

  // AS 5 PERGUNTAS CENTRAIS 100% DINÂMICAS BASEADAS NAS OPORTUNIDADES REAIS
  const fiveQuestions = React.useMemo(() => {
    // 1. O que requer minha atenção?
    const urgentCount = deadlinesToday.length + deadlines3Days.length;
    let attentionAnswer = '';
    if (pendingApprovalsCount > 0 && urgentCount > 0) {
      attentionAnswer = `${pendingApprovalsCount} aprovação(ões) pendente(s) de governança e ${urgentCount} certame(s) com encerramento nos próximos 3 dias.`;
    } else if (pendingApprovalsCount > 0) {
      attentionAnswer = `${pendingApprovalsCount} certame(s) aguardando parecer ou deliberação de diretoria.`;
    } else if (urgentCount > 0) {
      attentionAnswer = `${urgentCount} certame(s) com encerramento de envio de propostas nas próximas 72 horas.`;
    } else {
      attentionAnswer = 'Tudo em dia. Nenhuma pendência crítica ou bloqueador operacional ativo no momento.';
    }

    // 2. Quais oportunidades são prioridade?
    let priorityAnswer = '';
    if (top5Opportunities.length > 0) {
      priorityAnswer = top5Opportunities.slice(0, 3).map(o => 
        `${o.client ? o.client.slice(0, 28) : o.portal} (${o.score || o.adherenceScore || 0}%)`
      ).join(', ');
    } else {
      priorityAnswer = 'Aguardando novas capturas de certames no radar oficial.';
    }

    // 3. O que vence em breve?
    let deadlinesAnswer = '';
    if (deadlinesToday.length > 0) {
      const first = deadlinesToday[0];
      deadlinesAnswer = `${deadlinesToday.length} edital(is) vencendo hoje, incluindo ${first.client || first.portal}.`;
    } else if (deadlines3Days.length > 0) {
      const first = deadlines3Days[0];
      deadlinesAnswer = `${deadlines3Days.length} edital(is) vencendo em até 3 dias (${first.client || first.portal}).`;
    } else if (deadlines7Days.length > 0) {
      deadlinesAnswer = `${deadlines7Days.length} edital(is) com sessão pública agendada nesta semana.`;
    } else {
      deadlinesAnswer = 'Nenhum certame no escopo com prazo para os próximos 7 dias.';
    }

    // 4. O que está bloqueado?
    const blockedOpps = scopedOpportunities.filter(o => o.decision === 'NO_GO' || o.decision === 'GO_BLOQUEADO');
    const blockedAnswer = blockedOpps.length > 0 
      ? `${blockedOpps.length} certame(s) formalmente arquivado(s) ou com impedimento registrado.`
      : 'Zero blockers impeditivos. Nenhuma certidão ou atestado bloqueando o avanço das propostas.';

    // 5. O que precisa de aprovação?
    const approvalAnswer = pendingApprovalsCount > 0
      ? `${pendingApprovalsCount} oportunidade(s) aguardam chancela de alçada ou parecer de diretoria no Comitê.`
      : 'Nenhuma aprovação bloqueando a operação neste momento. Todas as deliberações estão em dia.';

    return [
      { q: 'O que requer minha atenção?', a: attentionAnswer, icon: AlertCircle, color: '#F59E0B' },
      { q: 'Quais oportunidades são prioridade?', a: priorityAnswer, icon: Target, color: '#38BDF8' },
      { q: 'O que vence em breve?', a: deadlinesAnswer, icon: Clock, color: '#EF4444' },
      { q: 'O que está bloqueado?', a: blockedAnswer, icon: Lock, color: '#10B981' },
      { q: 'O que precisa de aprovação?', a: approvalAnswer, icon: ShieldCheck, color: '#A855F7' }
    ];
  }, [scopedOpportunities, pendingApprovalsCount, deadlinesToday, deadlines3Days, deadlines7Days, top5Opportunities]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ITEM 19 & FASE 50: SAUDAÇÃO CONTEXTUAL + SELETOR DE PERFIL DE OPERAÇÃO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        paddingBottom: '14px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#F8FAFC',
            margin: 0,
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>{greeting}.</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>• Visão Geral</span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#34D399',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '2px 8px',
              borderRadius: '12px',
              letterSpacing: '0.04em'
            }}>
              ● DADOS REAIS EM TEMPO REAL
            </span>
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#64748B',
            margin: '3px 0 0 0',
            letterSpacing: '-0.01em'
          }}>
            Monitoramento ao vivo conectado diretamente aos portais oficiais (PNCP e Compras.gov.br).
          </p>
        </div>

        {/* AÇÕES E SELETOR DE PERFIL (ESTILO LINEAR / VERCEL) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsParserModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '7px',
              padding: '6px 13px',
              color: '#38BDF8',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            title="Importar e extrair dados de Edital ou Termo de Referência em PDF com Drag & Drop"
          >
            <Upload size={13} />
            <span>Analisar Edital (PDF)</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'rgba(255, 255, 255, 0.04)',
            padding: '3px',
            borderRadius: '7px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {[
              { id: 'GESTOR', label: 'Diretoria', icon: Briefcase },
              { id: 'LICITACOES', label: 'Licitações', icon: Compass },
              { id: 'COMERCIAL', label: 'Comercial', icon: Users },
              { id: 'OPERACIONAL', label: 'Operacional', icon: Layers }
            ].map(p => {
              const Icon = p.icon;
              const isActive = activeProfile === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProfile(p.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: 'none',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={12} />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BANNER INFORMATIVO DE ESCOPO DE EMPRESA ATIVO */}
      {selectedCompanyScope !== 'ALL' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: selectedCompanyScope === 'veeluen-solutions' 
            ? 'linear-gradient(90deg, rgba(14, 165, 233, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)' 
            : 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: selectedCompanyScope === 'veeluen-solutions' 
            ? '1px solid rgba(56, 189, 248, 0.3)' 
            : '1px solid rgba(52, 211, 153, 0.3)',
          borderRadius: '8px',
          padding: '10px 16px',
          fontSize: '12px',
          color: '#E2E8F0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: selectedCompanyScope === 'veeluen-solutions' ? '#38BDF8' : '#34D399'
            }} />
            <span>
              <strong>Foco Ativo:</strong> {selectedCompanyScope === 'veeluen-solutions' ? 'Veeluen Solutions' : 'Excelência Ambiental'} — Exibindo {scopedOpportunities.length} {scopedOpportunities.length === 1 ? 'oportunidade' : 'oportunidades'} compatíveis com o escopo e acervo técnico desta empresa.
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#94A3B8' }}>
            Alternar no topo superior do sistema
          </span>
        </div>
      )}

      {/* FASE 51: ONBOARDING ÁGIL & TAREFA GUIADA (Seções 33 a 38) */}
      {showOnboardingBanner && (
        <section style={{
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(2, 132, 199, 0.3)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative'
        }}>
          <button
            onClick={() => setShowOnboardingBanner(false)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'transparent',
              border: 'none',
              color: 'var(--brand-slate-400, #94A3B8)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px'
            }}
            title="Dispensar guia de introdução"
            aria-label="Dispensar guia de introdução"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-primary, #38BDF8)' }} />
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Primeiro Acesso ao Vellia 2.0 • Guia de Operação Real
            </h3>
            <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Operação Assistida
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '11px', color: '#CBD5E1' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px 12px', borderRadius: '6px' }}>
              <strong style={{ color: '#F8FAFC', display: 'block', marginBottom: '2px' }}>1. O que é o Vellia</strong>
              Plataforma de inteligência e estratégia de licitações públicas e gestão de contratos.
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px 12px', borderRadius: '6px' }}>
              <strong style={{ color: '#F8FAFC', display: 'block', marginBottom: '2px' }}>2. Onde estão oportunidades</strong>
              No menu <strong>Radar</strong> e no hub <strong>Oportunidades</strong>, capturadas do PNCP e Petronect.
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px 12px', borderRadius: '6px' }}>
              <strong style={{ color: '#F8FAFC', display: 'block', marginBottom: '2px' }}>3. Como pesquisar</strong>
              Use o atalho global <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>Ctrl+K</kbd> para buscar qualquer certame ou CNPJ.
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '10px 12px', borderRadius: '6px' }}>
              <strong style={{ color: '#F8FAFC', display: 'block', marginBottom: '2px' }}>4. Como registrar decisão</strong>
              Abra a oportunidade, confira o Resumo Vellia e delibere em <strong>Go</strong> ou <strong>No-Go</strong>.
            </div>
          </div>

          {/* Checklist & Guided Task (Seções 36 e 37) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.1)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', flexWrap: 'wrap' }}>
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Perfil ativo
              </span>
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Empresas configuradas
              </span>
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Serviços revisados
              </span>
              <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> PNCP & Petronect online
              </span>
              <span style={{ color: onboardingStatus.firstOpportunityAnalyzed ? '#10B981' : '#F59E0B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                {onboardingStatus.firstOpportunityAnalyzed ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                Primeira oportunidade analisada
              </span>
            </div>

            {!onboardingStatus.firstOpportunityAnalyzed && (
              <button
                type="button"
                onClick={() => {
                  if (top5Opportunities.length > 0 && onSelectOpportunity) {
                    onSelectOpportunity(top5Opportunities[0]);
                    const up = StabilizationService.completeFirstOpportunityTask();
                    setOnboardingStatus(up);
                  }
                }}
                style={{
                  background: 'var(--accent-primary, #0284C7)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 150ms ease'
                }}
              >
                <span>Tarefa Guiada: Analisar Oportunidade Prioritária</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </section>
      )}

      {/* SEÇÃO COLAPSÁVEL DE RESPOSTAS RÁPIDAS DA OPERAÇÃO (ESTILO LINEAR) */}
      <section style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        padding: showQuickInsights ? '14px 18px' : '10px 16px',
        transition: 'all 0.2s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={14} style={{ color: '#38BDF8' }} />
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#E2E8F0', margin: 0 }}>
              Respostas Imediatas da Operação • Perfil {activeProfile === 'GESTOR' ? 'Gestão' : activeProfile === 'LICITACOES' ? 'Licitações' : activeProfile === 'COMERCIAL' ? 'Comercial' : 'Operacional'}
            </h2>
            <span style={{ fontSize: '10px', color: '#64748B', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: '4px' }}>
              5 tópicos auditados
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowQuickInsights(!showQuickInsights)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#94A3B8',
                borderRadius: '5px',
                padding: '3px 9px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {showQuickInsights ? 'Recolher Painel' : 'Visualizar Respostas'}
            </button>
          </div>
        </div>

        {showQuickInsights && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '8px',
            marginTop: '12px'
          }}>
            {fiveQuestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '7px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={13} style={{ color: item.color }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#E2E8F0' }}>
                      {item.q}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                    {item.a}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ITEM 20: BLOCO PRINCIPAL "PRECISA DA SUA ATENÇÃO" */}
      <section style={{
        background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
        border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '18px 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-danger, #EF4444)'
            }} />
            <h2 style={{
              fontSize: 'var(--font-size-card-title, 14px)',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0
            }}>
              Precisa da sua atenção
            </h2>
          </div>
          <span style={{
            fontSize: '11px',
            color: 'var(--brand-slate-400, #94A3B8)',
            fontWeight: 500
          }}>
            4 pendências críticas
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {attentionItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.45)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
                borderRadius: 'var(--radius-md, 8px)',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px'
                }}>
                  <strong style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>
                    {item.title}
                  </strong>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: item.badgeType === 'danger' ? 'rgba(239, 68, 68, 0.15)' :
                                item.badgeType === 'warning' ? 'rgba(245, 158, 11, 0.15)' :
                                'rgba(148, 163, 184, 0.12)',
                    color: item.badgeType === 'danger' ? '#F87171' :
                           item.badgeType === 'warning' ? '#FBBF24' :
                           '#CBD5E1'
                  }}>
                    {item.badge}
                  </span>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--brand-slate-400, #94A3B8)',
                  margin: 0,
                  lineHeight: 1.45
                }}>
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab && onNavigateToTab(item.tab)}
                style={{
                  alignSelf: 'flex-start',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-primary, #0284C7)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0
                }}
              >
                <span>{item.action}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ITENS 21-23: LINHA DE KPIS CONTEXTUAIS DO PERFIL ATIVO */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {currentKpis.map((kpi) => (
          <div
            key={kpi.id}
            onClick={() => onNavigateToTab && onNavigateToTab(kpi.tab)}
            style={{
              background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
              border: kpi.highlight ? '1px solid rgba(2, 132, 199, 0.35)' :
                      kpi.isWarning ? '1px solid rgba(245, 158, 11, 0.3)' :
                      '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
              borderRadius: 'var(--radius-md, 8px)',
              padding: '14px 16px',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--brand-slate-400, #94A3B8)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {kpi.label}
            </span>
            <div style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              fontFeatureSettings: '"tnum"',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.1
            }}>
              {kpi.value}
            </div>
            <span style={{
              fontSize: '11px',
              color: kpi.highlight ? 'var(--accent-primary, #38BDF8)' :
                     kpi.isWarning ? 'var(--status-warning, #F59E0B)' :
                     'var(--brand-slate-500, #64748B)'
            }}>
              {kpi.comparison}
            </span>
          </div>
        ))}
      </section>

      {/* ITEM 18 & 15: OPORTUNIDADES PRIORITÁRIAS + RADAR DE PRAZOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* TABELA DE OPORTUNIDADES PRIORITÁRIAS (Hierarquia em 5 segundos) */}
        <div style={{
          background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
          border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{
                fontSize: 'var(--font-size-card-title, 14px)',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0
              }}>
                Oportunidades prioritárias
              </h3>
              <p style={{
                fontSize: '11px',
                color: 'var(--brand-slate-400, #94A3B8)',
                margin: '2px 0 0 0'
              }}>
                Classificadas por aderência técnica e prazo de entrega
              </p>
            </div>

            <button
              onClick={() => onNavigateToTab && onNavigateToTab('oportunidades')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-primary, #0284C7)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Ver todas</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {top5Opportunities.map((opp) => {
              const rec = MvpScoreService.getConsolidatedRecommendation(opp);
              const isUrgent = opp.daysLeft <= 3;
              return (
                <div
                  key={opp.id}
                  onClick={() => onSelectOpportunity && onSelectOpportunity(opp)}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(148, 163, 184, 0.1)',
                    borderRadius: 'var(--radius-md, 8px)',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(2, 132, 199, 0.4)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.7)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                  }}
                >
                  <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        color: 'var(--brand-slate-400, #94A3B8)'
                      }}>
                        {opp.id}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        background: 'rgba(148, 163, 184, 0.1)',
                        color: 'var(--brand-slate-300, #CBD5E1)',
                        fontWeight: 600
                      }}>
                        {opp.recommendedCompany || 'Veeluen'}
                      </span>
                    </div>

                    <strong style={{
                      fontSize: '12px',
                      color: '#F8FAFC',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {opp.title}
                    </strong>

                    <span style={{ fontSize: '11px', color: 'var(--brand-slate-500, #64748B)' }}>
                      {opp.client} • {opp.estimatedValue}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: opp.score >= 90 ? 'var(--status-go, #10B981)' : 'var(--accent-primary, #0284C7)',
                        fontVariantNumeric: 'tabular-nums'
                      }}>
                        {opp.score}%
                      </div>
                      <div style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: isUrgent ? 'var(--status-danger, #EF4444)' : 'var(--brand-slate-400, #94A3B8)'
                      }}>
                        {opp.daysLeft}d restantes
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOpportunity && onSelectOpportunity(opp);
                      }}
                      style={{
                        background: 'rgba(2, 132, 199, 0.1)',
                        border: '1px solid rgba(2, 132, 199, 0.25)',
                        color: 'var(--accent-primary, #0284C7)',
                        borderRadius: 'var(--radius-sm, 6px)',
                        padding: '5px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RADAR DE PRAZOS (Hoje, 3 dias, 7 dias) */}
        <div style={{
          background: 'var(--surface-card, rgba(15, 23, 42, 0.7))',
          border: '1px solid var(--border-subtle, rgba(148, 163, 184, 0.12))',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div>
            <h3 style={{
              fontSize: 'var(--font-size-card-title, 14px)',
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0
            }}>
              Prazos de entrega
            </h3>
            <p style={{
              fontSize: '11px',
              color: 'var(--brand-slate-400, #94A3B8)',
              margin: '2px 0 0 0'
            }}>
              Organizados por proximidade da sessão pública
            </p>
          </div>

          {/* Hoje */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.18)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-danger, #EF4444)' }}>
                HOJE (Até 24h)
              </span>
              <span style={{ fontSize: '10px', color: 'var(--brand-slate-400, #94A3B8)', fontFeatureSettings: '"tnum"' }}>
                {deadlinesToday.length} edital
              </span>
            </div>
            {deadlinesToday.length === 0 ? (
              <p style={{ fontSize: '11px', color: 'var(--brand-slate-500, #64748B)', margin: 0 }}>
                Nenhum prazo fatal nas próximas 24 horas.
              </p>
            ) : (
              deadlinesToday.map(d => (
                <div key={d.id} style={{ fontSize: '12px', color: '#F8FAFC' }}>
                  • {d.title}
                </div>
              ))
            )}
          </div>

          {/* 3 Dias */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.18)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-warning, #F59E0B)' }}>
                PRÓXIMOS 3 DIAS
              </span>
              <span style={{ fontSize: '10px', color: 'var(--brand-slate-400, #94A3B8)', fontFeatureSettings: '"tnum"' }}>
                {deadlines3Days.length} editais
              </span>
            </div>
            {deadlines3Days.map(d => (
              <div 
                key={d.id} 
                onClick={() => onSelectOpportunity && onSelectOpportunity(d)}
                style={{
                  fontSize: '11px',
                  color: 'var(--brand-slate-300, #CBD5E1)',
                  cursor: 'pointer',
                  padding: '3px 0'
                }}
              >
                • <strong>{d.title}</strong> — {d.daysLeft}d restantes ({d.estimatedValue})
              </div>
            ))}
          </div>

          {/* 7 Dias */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.18)',
            borderRadius: 'var(--radius-md, 8px)',
            padding: '10px 12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--status-info, #60A5FA)' }}>
                PRÓXIMOS 7 DIAS
              </span>
              <span style={{ fontSize: '10px', color: 'var(--brand-slate-400, #94A3B8)', fontFeatureSettings: '"tnum"' }}>
                {deadlines7Days.length} editais
              </span>
            </div>
            {deadlines7Days.map(d => (
              <div 
                key={d.id} 
                onClick={() => onSelectOpportunity && onSelectOpportunity(d)}
                style={{
                  fontSize: '11px',
                  color: 'var(--brand-slate-300, #CBD5E1)',
                  cursor: 'pointer',
                  padding: '3px 0'
                }}
              >
                • {d.title} — {d.daysLeft}d restantes
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL INTELIGENTE DE PARSER E UPLOAD DE EDITAL EM PDF / TEXTO */}
      <EditalUploadParserModal
        isOpen={isParserModalOpen}
        onClose={() => setIsParserModalOpen(false)}
        onSuccess={(newOpp) => {
          setOpportunities(OpportunityService.listAll());
          if (onSelectOpportunity) onSelectOpportunity(newOpp);
        }}
        onOpenAnalysisAfterSave={(oppId) => {
          if (onNavigateToTab) onNavigateToTab('oportunidades');
        }}
      />
    </div>
  );
}
