/**
 * VELLIA LICITAÇÕES — FASE 60
 * executiveCockpitService.js: Executive Cockpit & Strategic Command Center 3.0
 * 
 * Princípios Fundamentais:
 * - MANAGEMENT BY EXCEPTION: Mostra apenas desvios, riscos, oportunidades relevantes, decisões e mudanças materiais.
 * - Bruto vs Qualificado vs Ponderado: Separação canônica de valores.
 * - Análise de Concentração: Top oportunidades e top buyers.
 * - Materiality Engine & Executive Insights: Filtra ruído e extrai no máximo 5 insights materiais.
 * - Multiempresa & Privacidade Financeira: Veeluen, Excelência e Visão Grupo (sem duplicidade).
 */

import { priorityOpportunities, systemMetrics } from '../../data/mockData';

export const Timeframe = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
};

class ExecutiveCockpitService {
  constructor() {
    this._cache = null;
    this._lastCalculated = null;
  }

  // Gera dados consolidados para o Cockpit Executivo
  getCockpitData(company = 'all', timeframe = 'month', hasFinancialPermission = true) {
    // 1. CARREGAR OPORTUNIDADES BASE
    const opps = priorityOpportunities.filter(o => {
      if (company === 'all') return true;
      if (company === 'excelencia') return o.company === 'excelencia' || o.buyer?.toLowerCase().includes('sabesp') || o.buyer?.toLowerCase().includes('saneamento');
      return o.company === 'veeluen' || !o.company || o.buyer?.toLowerCase().includes('petrobras');
    });

    // 2. CÁLCULO DE PIPELINE CANÔNICO
    // Bruto: soma total de valor estimado
    const grossPipeline = opps.reduce((acc, o) => acc + (o.estimatedValue || 1200000), 0);
    // Qualificado: aderência >= 75%
    const qualifiedOpps = opps.filter(o => (o.matchScore || 80) >= 75);
    const qualifiedPipeline = qualifiedOpps.reduce((acc, o) => acc + (o.estimatedValue || 1200000), 0);
    // Ponderado: valor * probabilidade (matchScore/100)
    const weightedPipeline = opps.reduce((acc, o) => {
      const prob = (o.matchScore || 70) / 100;
      return acc + ((o.estimatedValue || 1200000) * prob);
    }, 0);

    // Commit: oportunidades em fase avançada (Proposta Enviada / Julgamento) com alta probabilidade
    const commitOpps = opps.filter(o => o.status === 'Proposta Enviada' || (o.matchScore || 0) >= 90);
    const commitValue = commitOpps.reduce((acc, o) => acc + (o.estimatedValue || 1200000), 0);

    // Valor em Risco: oportunidades com riscos críticos de recurso, CND ou prazo
    const atRiskOpps = opps.filter(o => (o.riskLevel === 'ALTO' || o.riskLevel === 'CRÍTICO' || (o.matchScore || 0) < 70));
    const valueAtRisk = atRiskOpps.reduce((acc, o) => acc + (o.estimatedValue || 1200000), 0);

    // 3. ANÁLISE DE CONCENTRAÇÃO
    const sortedByValue = [...opps].sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
    const top3Opps = sortedByValue.slice(0, 3);
    const top3Value = top3Opps.reduce((acc, o) => acc + (o.estimatedValue || 1200000), 0);
    const top3ConcentrationPct = grossPipeline > 0 ? Math.round((top3Value / grossPipeline) * 100) : 0;

    // Concentração por Comprador Principal
    const buyerMap = {};
    opps.forEach(o => {
      const b = o.buyer || 'Outros Órgãos';
      buyerMap[b] = (buyerMap[b] || 0) + (o.estimatedValue || 1200000);
    });
    let topBuyer = 'Petrobras';
    let topBuyerVal = 0;
    Object.entries(buyerMap).forEach(([buyer, val]) => {
      if (val > topBuyerVal) {
        topBuyerVal = val;
        topBuyer = buyer;
      }
    });
    const topBuyerConcentrationPct = grossPipeline > 0 ? Math.round((topBuyerVal / grossPipeline) * 100) : 0;

    // 4. METAS & FORECAST
    // Se a empresa tiver meta configurada (Veeluen R$ 25M, Excelência R$ 15M, Grupo R$ 40M)
    const targets = {
      all: 40000000,
      veeluen: 25000000,
      excelencia: 15000000
    };
    const revenueTarget = targets[company] || 40000000;
    const targetCoveragePct = revenueTarget > 0 ? Math.round((weightedPipeline / revenueTarget) * 100) : 0;
    const forecastGap = Math.max(0, revenueTarget - commitValue);

    // 5. VALOR EM MOVIMENTO (ÚLTIMOS 7 DIAS)
    const valueMovement = {
      newIdentified: 1850000,
      advancedStage: 4200000,
      won: 980000,
      lost: 450000,
      atRiskDelta: 1200000
    };

    // 6. DECISÕES PENDENTES QUE PRECISAM DE VOCÊ (Ordenadas por Impacto + Urgência)
    const pendingDecisions = [
      {
        id: 'DEC-01',
        title: 'Aprovação de Margem e Preço Final',
        entityTitle: 'Pregão Sabesp EEE Guarulhos (R$ 4.250.000)',
        category: 'PRICE_APPROVAL',
        deadline: 'Amanhã às 09:00',
        urgency: 'CRITICAL',
        impact: 'R$ 4.25M em jogo • Margem proposta: 16.8% (Piso: 15.0%)',
        whyNow: 'Certame abre amanhã de manhã; sem aprovação formal o envio é bloqueado pelo Policy Engine (Fase 58).',
        alternativas: ['Aprovar com 16.8%', 'Elevar para 18.2% assumindo risco de preço', 'Desistir do lote']
      },
      {
        id: 'DEC-02',
        title: 'Decisão GO / NO-GO com Exceção de Capacidade',
        entityTitle: 'Contrato Petrobras Refinaria Duque de Caxias - Manutenção',
        category: 'GO_NO_GO',
        deadline: 'Em 2 dias',
        urgency: 'ATTENTION',
        impact: 'R$ 3.80M potencial • Exige mobilização de 2 engenheiros plenos',
        whyNow: 'Readiness operacional em 78%; necessário aprovar subcontratação pré-qualificada de instrumentação.',
        alternativas: ['Aprovar GO com subcontratação', 'Aguardar liberação de equipe interna', 'NO-GO formal']
      },
      {
        id: 'DEC-03',
        title: 'Aceite de Termo Aditivo Contratual',
        entityTitle: 'Contrato Sabesp Elevatória Norte - Supressão de 4.8%',
        category: 'CONTRACT_AMENDMENT',
        deadline: 'Em 5 dias',
        urgency: 'NORMAL',
        impact: 'Redução de R$ 94.000 no escopo global sem impacto na taxa de lucratividade',
        whyNow: 'Órgão notificou formalmente readequação orçamentária.',
        alternativas: ['Firmar termo aditivo amigável', 'Solicitar compensação de cronograma']
      }
    ];

    // 7. CONTRATOS VIGENTES & JANELAS DE RENOVAÇÃO
    const contractsSummary = {
      activeContractsCount: 18,
      totalContractValue: 28400000,
      atRiskCount: 2,
      renewalWindows: {
        within90Days: 2,
        within180Days: 4,
        beyond180Days: 12
      },
      criticalObligationAlert: 'Contrato REDUC: Medição técnica mensal deve ser protocolada até 24/10.'
    };

    // 8. TOP RISCOS ESTRATÉGICOS (Agregados por Exceção)
    const topRisks = [
      {
        id: 'RSK-01',
        title: 'Alta Concentração no Comprador Principal',
        category: 'MARKET_CONCENTRATION',
        impact: `${topBuyerConcentrationPct}% do pipeline concentrado em ${topBuyer}`,
        mitigation: 'Acelerar homologação e participação em certames da Sabesp e Sanepar.',
        owner: 'Diretoria Comercial',
        trend: 'ESTÁVEL'
      },
      {
        id: 'RSK-02',
        title: 'Gargalo de Certidão Municipal de Filial (Campinas)',
        category: 'COMPLIANCE',
        impact: 'Pode inabilitar proposta do Pregão 44/2026 em caso de vitória imediata',
        mitigation: 'Despacho com procurador municipal agendado para amanhã 11h.',
        owner: 'Jurídico & Compliance',
        trend: 'AGRAVADO'
      },
      {
        id: 'RSK-03',
        title: 'Pressão de Custo em Insumos de Tubulação',
        category: 'FINANCIAL_SUPPLIERS',
        impact: 'Fornecedor chave reajustou cotação em +4.2% para fornecimento especial',
        mitigation: 'Cotação alternativa aberta com parceiro de Minas Gerais.',
        owner: 'Suprimentos & Compras',
        trend: 'MITIGADO'
      }
    ];

    // 9. RECOMENDAÇÕES ESTRATÉGICAS EXPLICÁVEIS (Fase 57)
    const recommendations = [
      {
        id: 'REC-01',
        title: 'Priorizar Pregão Sabesp EEE Guarulhos',
        observation: 'Aderência técnica de 94% e baixa presença de concorrentes de grande porte na região metropolitana.',
        recommendation: 'Alocar equipe sênior na elaboração dos atestados e submeter com margem de 16.8%.',
        confidence: 91,
        whyItMatters: 'Representa 18% da meta do trimestre para a Excelência Ambiental.'
      },
      {
        id: 'REC-02',
        title: 'Antecipar Renegociação do Contrato de Efluentes',
        observation: 'Janela de renovação entra em 60 dias com histórico de execução 100% aprovada pelo fiscal.',
        recommendation: 'Agendar reunião estratégica com o gestor do contrato antes da publicação de nova licitação.',
        confidence: 88,
        whyItMatters: 'Renovação garante R$ 3.2M de receita contratada sem custo de aquisição.'
      }
    ];

    // 10. RESUMO EXECUTIVO VELLIA (MATERIALITY ENGINE — MÁXIMO 5 INSIGHTS)
    const executiveSummaryInsights = [
      {
        id: 'ins-01',
        type: 'CONCENTRATION',
        text: `As 3 maiores oportunidades respondem por ${top3ConcentrationPct}% de todo o pipeline da empresa.`,
        urgency: 'HIGH',
        linkTab: 'oportunidades'
      },
      {
        id: 'ins-02',
        type: 'DECISION',
        text: `Aprovação de preço do Pregão Sabesp (R$ 4.25M) vence amanhã às 09:00 e exige deliberação formal.`,
        urgency: 'CRITICAL',
        linkTab: 'governanca-aprovacoes'
      },
      {
        id: 'ins-03',
        type: 'PIPELINE_GROWTH',
        text: `Pipeline qualificado cresceu +R$ 1.85M nesta semana com 2 novas licitações captadas.`,
        urgency: 'NORMAL',
        linkTab: 'radar'
      },
      {
        id: 'ins-04',
        type: 'CONTRACT_RENEWAL',
        text: `2 contratos estratégicos entram na janela crítica de renovação nos próximos 90 dias.`,
        urgency: 'MEDIUM',
        linkTab: 'contratos'
      },
      {
        id: 'ins-05',
        type: 'GOAL_COVERAGE',
        text: `Cobertura da meta ponderada em ${targetCoveragePct}% do objetivo estabelecido para o trimestre.`,
        urgency: targetCoveragePct >= 80 ? 'NORMAL' : 'ATTENTION',
        linkTab: 'planejamento-estrategico'
      }
    ];

    // 11. O QUE MUDOU? (MOVIMENTOS RELEVANTES)
    const whatChanged = [
      { id: 'ch-01', date: 'Hoje 14:20', text: 'Nova oportunidade relevante identificada: Petrobras REDUC R$ 3.8M (Aderência 91%).' },
      { id: 'ch-02', date: 'Hoje 11:00', text: 'Margem do Pregão Sabesp revisada de 15.2% para 16.8% após cotação de válvulas.' },
      { id: 'ch-03', date: 'Ontem 17:40', text: 'Resultado homologado: Vitória no Pregão Sanasa Campinas (R$ 980.000).' },
      { id: 'ch-04', date: 'Ontem 10:15', text: 'Alerta de compliance: Certidão Municipal de Filial com vencimento em 7 dias.' }
    ];

    return {
      company,
      timeframe,
      dataFreshness: {
        lastUpdate: new Date().toLocaleTimeString('pt-BR'),
        isStale: false,
        coveragePct: 96
      },
      metrics: {
        grossPipeline,
        qualifiedPipeline,
        weightedPipeline,
        commitValue,
        valueAtRisk,
        activeContractsCount: contractsSummary.activeContractsCount,
        pendingDecisionsCount: pendingDecisions.length,
        revenueTarget,
        targetCoveragePct,
        forecastGap,
        top3ConcentrationPct,
        topBuyer,
        topBuyerConcentrationPct,
        // Dados de Margem (Ocultos se sem permissão)
        margin: hasFinancialPermission ? {
          averagePotentialMarginPct: 18.4,
          lowMarginExposure: 650000,
          atRiskMarginValue: 240000
        } : null
      },
      valueMovement,
      executiveSummaryInsights,
      whatChanged,
      pendingDecisions,
      topRisks,
      contractsSummary,
      recommendations,
      topOpportunities: top3Opps.map(o => ({
        id: o.id || o.number,
        buyer: o.buyer,
        title: o.title || o.service,
        estimatedValue: o.estimatedValue || 1200000,
        status: o.status,
        deadline: o.deadline || 'Em 5 dias',
        matchScore: o.matchScore || 85,
        riskLevel: o.riskLevel || 'MÉDIO',
        nextDecision: 'Aprovação de Proposta'
      }))
    };
  }

  // Assistente Copilot Executivo
  askExecutiveCopilot(question, company = 'all') {
    const q = (question || '').toLowerCase();
    const data = this.getCockpitData(company, 'month', true);

    if (q.includes('mudou') || q.includes('semana') || q.includes('recente')) {
      return {
        answer: `Esta semana tivemos 4 movimentos materiais: identificação de um certame Petrobras de R$ 3.8M, homologação de vitória na Sanasa (R$ 980k), reajuste de margem para o certame Sabesp (16.8%) e novo alerta de renovação de CND em Campinas. O pipeline qualificado expandiu em +R$ 1.85M.`,
        evidence: 'Materiality Engine • Últimos 7 dias'
      };
    }

    if (q.includes('risco') || q.includes('maiores riscos')) {
      return {
        answer: `Os 2 maiores riscos estratégicos são: 1) Concentração de ${data.metrics.topBuyerConcentrationPct}% do pipeline em ${data.metrics.topBuyer}; 2) Prazo crítico de vencimento de CND municipal que pode travar habilitação do Pregão Sabesp de amanhã.`,
        evidence: 'Risk Center & Compliance Matrix'
      };
    }

    if (q.includes('decisão') || q.includes('precisa de mim') || q.includes('hoje')) {
      return {
        answer: `A decisão mais crítica que precisa da diretoria hoje é a aprovação formal de preço e margem (16.8%) do Pregão Sabesp EEE Guarulhos (R$ 4.25M), cujo prazo encerra amanhã às 09:00. O Policy Engine bloqueia o despacho sem essa alçada.`,
        evidence: 'Decision Center & Autonomy Guardrails'
      };
    }

    if (q.includes('concentrado') || q.includes('pipeline') || q.includes('concentração')) {
      return {
        answer: `O pipeline ponderado soma R$ ${(data.metrics.weightedPipeline / 1000000).toFixed(1)}M. Existe alta concentração: as 3 maiores oportunidades representam ${data.metrics.top3ConcentrationPct}% do volume total, com a Petrobras respondendo por ${data.metrics.topBuyerConcentrationPct}%.`,
        evidence: 'Concentration Index & Forecast'
      };
    }

    return {
      answer: `Cockpit Executivo consolidado: Pipeline Ponderado de R$ ${(data.metrics.weightedPipeline / 1000000).toFixed(1)}M com ${data.metrics.targetCoveragePct}% de cobertura da meta. Temos ${data.metrics.pendingDecisionsCount} decisões pendentes prioritárias e 18 contratos ativos gerando previsibilidade.`,
      evidence: 'Executive Cockpit 3.0'
    };
  }

  // Gera o Executive Brief formatado (1 a 2 páginas para diretoria/conselho)
  generateExecutiveBrief(company = 'all') {
    const data = this.getCockpitData(company, 'month', true);
    return {
      generatedAt: new Date().toISOString(),
      companyName: company === 'all' ? 'Vellia Licitações — Visão Consolidada do Grupo' : (company === 'excelencia' ? 'Excelência Ambiental' : 'Veeluen Soluções'),
      headerSummary: `Resumo Executivo Estratégico gerado pelo Vellia AI. Pipeline Ponderado de R$ ${(data.metrics.weightedPipeline / 1000000).toFixed(2)}M com cobertura de meta em ${data.metrics.targetCoveragePct}%.`,
      topInsights: data.executiveSummaryInsights.map(i => i.text),
      pipelineOverview: {
        gross: `R$ ${(data.metrics.grossPipeline / 1000000).toFixed(2)}M`,
        qualified: `R$ ${(data.metrics.qualifiedPipeline / 1000000).toFixed(2)}M`,
        weighted: `R$ ${(data.metrics.weightedPipeline / 1000000).toFixed(2)}M`,
        commit: `R$ ${(data.metrics.commitValue / 1000000).toFixed(2)}M`
      },
      criticalDecisions: data.pendingDecisions.map(d => `${d.title} (${d.entityTitle}) — Prazo: ${d.deadline}`),
      strategicRisks: data.topRisks.map(r => `${r.title}: ${r.impact} [Mitigação: ${r.mitigation}]`),
      keyRecommendations: data.recommendations.map(r => `${r.title}: ${r.recommendation}`)
    };
  }
}

export const executiveCockpitService = new ExecutiveCockpitService();
export default executiveCockpitService;
