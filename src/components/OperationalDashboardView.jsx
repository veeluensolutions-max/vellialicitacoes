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

  // Estado dinâmico de oportunidades reativo ao repositório
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());

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

  // Saudação contextual baseada no horário
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia' : currentHour < 18 ? 'Boa tarde' : 'Boa noite';

  // Configuração contextual de KPIs conforme Perfil (Fase 50 - Itens 10 e 11)
  const profileKpiMap = {
    GESTOR: [
      { id: 'pipeline', label: 'Pipeline Ativo', value: 'R$ 48,5M', comparison: `${scopedOpportunities.length} certames no escopo`, tab: 'pipeline-financeiro', highlight: true },
      { id: 'risco', label: 'Exposição a Risco', value: 'Moderado', comparison: '82% aderência média', tab: 'mercado' },
      { id: 'metas', label: 'Meta Anual B2G', value: '64%', comparison: 'R$ 31M conquistados', tab: 'planejamento-estrategico' },
      { id: 'aprovacoes', label: 'Aprovações Pendentes', value: '2', comparison: 'Exigem alçada formal', tab: 'governanca-aprovacoes', isWarning: true }
    ],
    LICITACOES: [
      { id: 'novas', label: 'Oportunidades no Radar', value: String(scopedOpportunities.length), comparison: `${scopedOpportunities.filter(o => (o.score || 0) >= 90).length} alta prioridade (>90%)`, tab: 'oportunidades', highlight: true },
      { id: 'prazos_criticos', label: 'Prazos Críticos', value: `${deadlines3Days.length + deadlinesToday.length}`, comparison: 'Vencem em até 3 dias', tab: 'oportunidades', isWarning: (deadlines3Days.length + deadlinesToday.length) > 0 },
      { id: 'propostas', label: 'Propostas em Curso', value: '5', comparison: '2 em precificação / BDI', tab: 'propostas' },
      { id: 'docs', label: 'Documentos a Vencer', value: '1', comparison: 'CND Federal (5 dias)', tab: 'documentos' }
    ],
    COMERCIAL: [
      { id: 'contas', label: 'Órgãos Estratégicos', value: '18', comparison: 'Petrobras, Transpetro, TJRJ', tab: 'relacionamento', highlight: true },
      { id: 'followups', label: 'Follow-ups Comerciais', value: '3', comparison: '1 atrasado', tab: 'relacionamento', isWarning: true },
      { id: 'mercado', label: 'Concorrentes Mapeados', value: '24', comparison: 'Preço médio monitorado', tab: 'mercado' },
      { id: 'parceiros', label: 'Cotações em Aberto', value: '6', comparison: 'Fornecedores terceiros', tab: 'parceiros-cotacoes' }
    ],
    OPERACIONAL: [
      { id: 'capacidade', label: 'Atestados Válidos', value: '34', comparison: '100% acervo auditado', tab: 'documentos', highlight: true },
      { id: 'prontidao', label: 'Prontidão Operacional', value: '92%', comparison: 'Equipe e skids disponíveis', tab: 'prontidao-operacional' },
      { id: 'contratos', label: 'Contratos Vigentes', value: '8', comparison: '3 em fase de entrega', tab: 'contratos' },
      { id: 'obrigacoes', label: 'Obrigações do Mês', value: '12', comparison: 'Relatórios e ARTs', tab: 'contratos' }
    ]
  };

  const currentKpis = profileKpiMap[activeProfile] || profileKpiMap.GESTOR;

  // FASE 50: ITENS DE ATENÇÃO CONFORME PERFIL
  const profileAttentionMap = {
    GESTOR: [
      { title: '2 aprovações de margem aguardando alçada', desc: 'Edital Petrobras Búzios requer autorização de diretoria para margem de 14.8%.', action: 'Avaliar aprovação', tab: 'governanca-aprovacoes', badge: 'ALÇADA', badgeType: 'warning' },
      { title: 'Previsão de fechamento trimestral', desc: 'R$ 18M em certames com probabilidade superior a 70% disputam este mês.', action: 'Ver forecast', tab: 'pipeline-financeiro', badge: 'ESTRATÉGICO', badgeType: 'info' }
    ],
    LICITACOES: [
      { title: '3 oportunidades aguardando análise Go/No-Go', desc: 'Licenciamento Santos, Búzios e Auditoria Macaé estão sem deliberação.', action: 'Analisar agora', tab: 'oportunidades', badge: 'URGENTE', badgeType: 'warning' },
      { title: '2 propostas com envio em menos de 48 horas', desc: 'Petrobras Búzios e Bacia de Santos encerram submissão em 48h.', action: 'Revisar propostas', tab: 'propostas', badge: '48H', badgeType: 'danger' },
      { title: 'CND Federal expira em 5 dias', desc: 'Certidão da Veeluen Solutions deve ser renovada no portal e-CAC.', action: 'Ver certidão', tab: 'documentos', badge: '5 DIAS', badgeType: 'info' }
    ],
    COMERCIAL: [
      { title: 'Esclarecimento técnico pendente com comissão', desc: 'Pregão TJRJ aguarda manifestação sobre questionamento protocolado.', action: 'Abrir CRM', tab: 'relacionamento', badge: 'COMERCIAL', badgeType: 'warning' },
      { title: '3 parceiros ainda não retornaram cotações de skids', desc: 'Item indispensável para composição de BDI na proposta da Transpetro.', action: 'Cobrar parceiros', tab: 'parceiros-cotacoes', badge: 'COTAÇÕES', badgeType: 'danger' }
    ],
    OPERACIONAL: [
      { title: 'Mobilização de equipe para contrato ganho', desc: 'Homologação concluída no certame #opp-102; equipe precisa ser alocada.', action: 'Ver contrato', tab: 'contratos', badge: 'HANDOFF', badgeType: 'warning' },
      { title: 'Emissão de CAT de desmobilização', desc: 'Contrato de ETE Macaé finalizado com sucesso; gerar novo atestado.', action: 'Gerar atestado', tab: 'documentos', badge: 'CAPACIDADE', badgeType: 'info' }
    ]
  };

  const attentionItems = profileAttentionMap[activeProfile] || profileAttentionMap.GESTOR;

  // FASE 50: AS 5 PERGUNTAS CENTRAIS DA HOME (Seção 9)
  const fiveQuestions = [
    {
      q: 'O que requer minha atenção?',
      a: activeProfile === 'GESTOR' ? '2 aprovações formais de margem comercial e 1 relatório de fechamento pendentes.' :
         activeProfile === 'LICITACOES' ? '3 certames sem decisão Go/No-Go e 2 propostas que vencem em 48h.' :
         activeProfile === 'COMERCIAL' ? '1 questionamento editalício no TJRJ e 3 cotações de fornecedores atrasadas.' :
         'Handoff do certame ganho #opp-102 e emissão da nova CAT de performance.',
      icon: AlertCircle,
      color: '#F59E0B'
    },
    {
      q: 'Quais oportunidades são prioridade?',
      a: 'Petrobras Búzios (Aderência 96%), Bacia de Santos (Aderência 94%) e ETE Macaé (Aderência 91%).',
      icon: Target,
      color: '#38BDF8'
    },
    {
      q: 'O que vence em breve?',
      a: 'Pregão Búzios encerra em 24h; Pregão Santos encerra em 48h; CND Federal expira em 5 dias.',
      icon: Clock,
      color: '#EF4444'
    },
    {
      q: 'O que está bloqueado?',
      a: 'Zero blockers impeditivos. Apenas 1 atestado complementar recomendado para maximizar pontuação técnica.',
      icon: Lock,
      color: '#10B981'
    },
    {
      q: 'O que precisa de aprovação?',
      a: activeProfile === 'GESTOR' || activeProfile === 'LICITACOES' ? 'Proposta comercial com BDI 22.5% para Búzios aguarda deliberação no comitê de governança.' : 'Nenhuma aprovação bloqueando a operação neste momento.',
      icon: ShieldCheck,
      color: '#A855F7'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* ITEM 19 & FASE 50: SAUDAÇÃO CONTEXTUAL + SELETOR DE PERFIL DE OPERAÇÃO */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '2px 8px', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.15)', color: '#38BDF8', fontWeight: 700 }}>
              Vellia 2.0 • Baseline
            </span>
            <span style={{ fontSize: '11px', color: 'var(--brand-slate-500, #64748B)' }}>
              Petronect Público • Sincronizado
            </span>
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-page-title, 20px)',
            fontWeight: 700,
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {greeting}.
          </h1>
        </div>

        {/* AÇÕES E SELETOR DE PERFIL (FASE 50 - SEÇÕES 10 E 11) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsParserModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              border: '1px solid #38BDF8',
              borderRadius: '8px',
              padding: '6px 14px',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
              transition: 'all 150ms ease'
            }}
            title="Importar e extrair dados de Edital ou Termo de Referência em PDF com Drag & Drop"
          >
            <Upload size={13} />
            <span>Analisar Edital (PDF)</span>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.15)'
          }}>
            {[
              { id: 'GESTOR', label: 'Gestor / Diretoria', icon: Briefcase },
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
                    gap: '6px',
                    background: isActive ? 'var(--accent-primary, #0284C7)' : 'transparent',
                    border: 'none',
                    color: isActive ? '#FFFFFF' : 'var(--brand-slate-400, #94A3B8)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                >
                  <Icon size={13} />
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

      {/* FASE 50: AS 5 PERGUNTAS CENTRAIS DA HOME (Seção 9) */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.35) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        borderRadius: 'var(--radius-lg, 12px)',
        padding: '16px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={15} style={{ color: 'var(--accent-primary, #0284C7)' }} />
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Respostas Imediatas da Operação • Perfil {activeProfile === 'GESTOR' ? 'Gestão' : activeProfile === 'LICITACOES' ? 'Licitações' : activeProfile === 'COMERCIAL' ? 'Comercial' : 'Operacional'}
            </h2>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--brand-slate-400, #94A3B8)' }}>
            Atualizado em tempo real com fontes auditadas
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '10px'
        }}>
          {fiveQuestions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.08)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={14} style={{ color: item.color }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#E2E8F0' }}>
                    {item.q}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--brand-slate-300, #CBD5E1)', margin: 0, lineHeight: 1.45 }}>
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>
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
