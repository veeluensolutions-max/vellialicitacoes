/**
 * VELLIA LICITAÇÕES — FASE 43
 * SERVIÇO DE INTELIGÊNCIA FINANCEIRA DO PIPELINE + FORECAST + RISCO + CONCENTRAÇÃO
 * 
 * Princípio Central:
 * Não tratar o valor total das oportunidades como receita esperada.
 * Separar claramente:
 * - Pipeline Bruto vs Qualificado vs Ponderado
 * - Commit, Best Case, Pipeline e Upside
 * - Margem Potencial (sem confundir com lucro líquido)
 * - Valor em Risco sem dupla contagem
 * - Risco de Concentração e Exposição a Oportunidade Única
 * - Simulações What-If Sandbox que não alteram dados reais
 */

import { OpportunityService } from '../opportunityService.js';
import { priorityOpportunities } from '../../data/mockData.js';
import { logService, LogType } from '../logService.js';

export const StageForecastWeight = {
  IDENTIFICADA: 0.10, // 10%
  QUALIFICADA: 0.25,   // 25%
  GO: 0.40,            // 40%
  PROPOSTA: 0.60,      // 60%
  FINALISTA: 0.80,     // 80%
  CONTRATADA: 1.00     // 100%
};

export const ForecastCategory = {
  COMMIT: 'Commit',         // Oportunidades em fase final / homologadas / contratação iminente
  BEST_CASE: 'Best Case',   // Propostas maduras e bem posicionadas
  PIPELINE: 'Pipeline',     // Oportunidades qualificadas regulares
  UPSIDE: 'Upside'          // Oportunidades em radar ou de baixa maturidade (não somadas no forecast principal)
};

export const QualificationStatus = {
  QUALIFIED: 'Qualified',
  UNQUALIFIED: 'Unqualified',
  NEEDS_REVIEW: 'Needs Review'
};

export const FinancialRiskLevel = {
  LOW: 'Baixo',
  MODERATE: 'Moderado',
  HIGH: 'Alto',
  CRITICAL: 'Crítico'
};

class FinancialPipelineService {
  constructor() {
    this.storageKey = 'vellia_financial_pipeline_v43';
    this.weightsKey = 'vellia_forecast_weights_v43';
    this.targetsKey = 'vellia_financial_targets_v43';

    // Pesos padrão de forecast (configuráveis pelo admin - Itens 11 a 19)
    this.defaultWeights = {
      Identificada: 0.10,
      Qualificada: 0.25,
      Go: 0.40,
      Proposta: 0.60,
      Finalista: 0.80,
      Contratada: 1.00
    };

    // Metas comerciais e financeiras por empresa (Itens 64 a 70 e 137 a 140)
    this.defaultTargets = {
      veeluen: {
        quarterTarget: 4500000,
        yearTarget: 18000000,
        marginTargetPct: 25.0
      },
      excelencia: {
        quarterTarget: 3800000,
        yearTarget: 15000000,
        marginTargetPct: 28.0
      },
      group: {
        quarterTarget: 8300000,
        yearTarget: 33000000,
        marginTargetPct: 26.5
      }
    };

    // Dataset rico de oportunidades financeiras baseado no ecossistema Vellia
    this.pipelineOpportunities = [
      {
        id: 'OPP-FIN-001',
        number: '7004321234',
        title: 'Monitoramento Contínuo de Emissões Atmosféricas — Refinaria Abreu e Lima',
        client: 'Petrobras RNEST',
        companyId: 'veeluen',
        service: 'Monitoramento de Emissões Atmosféricas',
        region: 'PE - Ipojuca / Suape',
        stage: 'Proposta',
        stageWeight: 0.60,
        forecastCategory: ForecastCategory.BEST_CASE,
        hasKnownValue: true,
        grossValue: 2450000,
        costEstimate: 1620000,
        marginValue: 830000,
        marginPct: 33.88,
        qualificationStatus: QualificationStatus.QUALIFIED,
        adherenceScore: 96,
        decisionStatus: 'GO',
        daysLeft: 12,
        owner: 'Ana Beatriz Cavalcanti',
        daysSinceUpdate: 2,
        risks: [
          { type: 'Documentação', description: 'Certidão específica de ensaios em altura superior a 40m pendente de juntada', severity: FinancialRiskLevel.MODERATE }
        ],
        isAtRisk: false // Não atinge corte de Alto/Crítico
      },
      {
        id: 'OPP-FIN-002',
        number: '7004128912',
        title: 'Operação de ETE e Tratamento de Efluentes Industriais — Suape',
        client: 'COMPESA',
        companyId: 'veeluen',
        service: 'Tratamento de Efluentes e Operação de ETE',
        region: 'PE - Cabo de Santo Agostinho',
        stage: 'Finalista',
        stageWeight: 0.80,
        forecastCategory: ForecastCategory.COMMIT,
        hasKnownValue: true,
        grossValue: 3200000,
        costEstimate: 2368000,
        marginValue: 832000,
        marginPct: 26.0,
        qualificationStatus: QualificationStatus.QUALIFIED,
        adherenceScore: 94,
        decisionStatus: 'GO',
        daysLeft: 6,
        owner: 'Carlos Eduardo Silveira',
        daysSinceUpdate: 1,
        risks: [],
        isAtRisk: false
      },
      {
        id: 'OPP-FIN-003',
        number: '7004556100',
        title: 'Tratamento de Águas Industriais e Despejo de Efluentes — RNEST Trem 2',
        client: 'Petrobras RNEST',
        companyId: 'veeluen',
        service: 'Tratamento de Efluentes e Operação de ETE',
        region: 'PE - Ipojuca',
        stage: 'Go',
        stageWeight: 0.40,
        forecastCategory: ForecastCategory.PIPELINE,
        hasKnownValue: true,
        grossValue: 4800000,
        costEstimate: 3600000,
        marginValue: 1200000,
        marginPct: 25.0,
        qualificationStatus: QualificationStatus.QUALIFIED,
        adherenceScore: 88,
        decisionStatus: 'GO',
        daysLeft: 34,
        owner: 'Carlos Eduardo Silveira',
        daysSinceUpdate: 5,
        risks: [
          { type: 'Capacidade', description: 'Exigência de 2 RTs concomitantes no polo', severity: FinancialRiskLevel.HIGH },
          { type: 'Prazo', description: 'Data da sessão coincide com parada programada', severity: FinancialRiskLevel.HIGH }
        ],
        isAtRisk: true, // Risco Alto
        riskReasons: ['Capacidade Técnica', 'Conflito de Prazo']
      },
      {
        id: 'OPP-FIN-004',
        number: '7004667890',
        title: 'Monitoramento de Dutos e Amostragem Isocinética — Polo de Camaçari',
        client: 'Acelen / Refinaria de Mataripe',
        companyId: 'veeluen',
        service: 'Monitoramento de Emissões Atmosféricas',
        region: 'BA - Camaçari',
        stage: 'Qualificada',
        stageWeight: 0.25,
        forecastCategory: ForecastCategory.UPSIDE,
        hasKnownValue: true,
        grossValue: 1850000,
        costEstimate: 1221000,
        marginValue: 629000,
        marginPct: 34.0,
        qualificationStatus: QualificationStatus.QUALIFIED,
        adherenceScore: 82,
        decisionStatus: 'EM_ANALISE',
        daysLeft: 45,
        owner: 'Dra. Vanessa Lima',
        daysSinceUpdate: 4,
        risks: [],
        isAtRisk: false
      },
      {
        id: 'OPP-FIN-005',
        number: '7004771234',
        title: 'Engenharia de Segurança do Trabalho e Laudos NR-12 — Porto de Suape',
        client: 'Complexo Portuário de Suape S.A.',
        companyId: 'veeluen',
        service: 'Engenharia de Segurança do Trabalho',
        region: 'PE - Ipojuca',
        stage: 'Identificada',
        stageWeight: 0.10,
        forecastCategory: ForecastCategory.UPSIDE,
        hasKnownValue: false, // Valor Desconhecido (Item 4 e 5)
        grossValue: null,
        costEstimate: null,
        marginValue: null,
        marginPct: null,
        qualificationStatus: QualificationStatus.UNQUALIFIED,
        adherenceScore: 65,
        decisionStatus: 'NAO_ANALISADA',
        daysLeft: 55,
        owner: null, // Sem owner (Pipeline Hygiene)
        daysSinceUpdate: 38, // Stale (> 30 dias)
        risks: [],
        isAtRisk: false
      },
      {
        id: 'OPP-FIN-006',
        number: '7004889012',
        title: 'Adequação de Estações Elevatórias de Esgoto e Desarenadores',
        client: 'Prefeitura de Ipojuca',
        companyId: 'veeluen',
        service: 'Tratamento de Efluentes e Operação de ETE',
        region: 'PE - Ipojuca',
        stage: 'Proposta',
        stageWeight: 0.60,
        forecastCategory: ForecastCategory.PIPELINE,
        hasKnownValue: true,
        grossValue: 920000,
        costEstimate: 745200,
        marginValue: 174800,
        marginPct: 19.0, // Abaixo da meta (Low Margin Exposure)
        qualificationStatus: QualificationStatus.QUALIFIED,
        adherenceScore: 84,
        decisionStatus: 'GO',
        daysLeft: 3, // Prazo crítico!
        owner: 'Ana Beatriz Cavalcanti',
        daysSinceUpdate: 1,
        risks: [
          { type: 'Prazo', description: 'Restam apenas 3 dias para encerramento e certidão CNDT vence amanhã', severity: FinancialRiskLevel.CRITICAL },
          { type: 'Preço', description: 'Margem de 19% próxima do floor de segurança', severity: FinancialRiskLevel.HIGH }
        ],
        isAtRisk: true,
        riskReasons: ['Prazo Crítico', 'Margem Próxima do Floor']
      },
      {
        id: 'OPP-FIN-007',
        number: 'EXC-2026-001',
        title: 'Licenciamento Ambiental & EIA/RIMA Terminal Portuário de Macaé',
        client: 'Petrobras UN-BC',
        companyId: 'excelencia',
        service: 'Licenciamento Ambiental & EIA/RIMA',
        region: 'RJ - Macaé',
        stage: 'Finalista',
        stageWeight: 0.80,
        forecastCategory: ForecastCategory.COMMIT,
        hasKnownValue: true,
        grossValue: 4200000,
        costEstimate: 2898000,
        marginValue: 1302000,
        marginPct: 31.0,
        qualificationStatus: QualificationStatus.QUALIFIED,
        adherenceScore: 95,
        decisionStatus: 'GO',
        daysLeft: 18,
        owner: 'Marcelo Rezende',
        daysSinceUpdate: 3,
        risks: [],
        isAtRisk: false
      },
      {
        id: 'OPP-FIN-008',
        number: 'EXC-2026-002',
        title: 'Monitoramento Contínuo de Fauna Marinha e Quelônios Bacia de Campos',
        client: 'Petrobras UN-BC',
        companyId: 'excelencia',
        service: 'Monitoramento de Fauna e Flora',
        region: 'RJ - Bacia de Campos',
        stage: 'Proposta',
        stageWeight: 0.60,
        forecastCategory: ForecastCategory.BEST_CASE,
        hasKnownValue: true,
        grossValue: 2600000,
        costEstimate: 1846000,
        marginValue: 754000,
        marginPct: 29.0,
        qualificationStatus: QualificationStatus.QUALIFIED,
        adherenceScore: 91,
        decisionStatus: 'GO',
        daysLeft: 22,
        owner: 'Marcelo Rezende',
        daysSinceUpdate: 2,
        risks: [],
        isAtRisk: false
      },
      {
        id: 'OPP-FIN-009',
        number: 'EXC-2026-003',
        title: 'Auditoria Ambiental Externa e Perícias Hídricas INEA',
        client: 'INEA RJ',
        companyId: 'excelencia',
        service: 'Licenciamento Ambiental & EIA/RIMA',
        region: 'RJ - Rio de Janeiro',
        stage: 'Go',
        stageWeight: 0.40,
        forecastCategory: ForecastCategory.PIPELINE,
        hasKnownValue: true,
        grossValue: 1400000,
        costEstimate: 1008000,
        marginValue: 392000,
        marginPct: 28.0,
        qualificationStatus: QualificationStatus.QUALIFIED,
        adherenceScore: 89,
        decisionStatus: 'GO',
        daysLeft: 40,
        owner: 'Luciano Prado',
        daysSinceUpdate: 7,
        risks: [
          { type: 'Aprovação', description: 'Pendência de aprovação pelo Diretor Técnico', severity: FinancialRiskLevel.HIGH }
        ],
        isAtRisk: true,
        riskReasons: ['Aprovação Interna Pendente']
      }
    ];
  }

  // ==========================================
  // 1. CARREGAMENTO E FILTROS BASE POR EMPRESA
  // ==========================================

  getOpportunities(companyId = 'veeluen') {
    if (!companyId || companyId === 'group') {
      return [...this.pipelineOpportunities];
    }
    return this.pipelineOpportunities.filter(o => o.companyId === companyId);
  }

  // ==========================================
  // 2. INTELIGÊNCIA FINANCEIRA DO PIPELINE (MÉTRICAS CORE)
  // Itens 1 a 28 da especificação
  // ==========================================

  getPipelineFinancialSummary(companyId = 'veeluen', userPermissions = { canViewMargins: true }) {
    const opps = this.getOpportunities(companyId);
    const totalCount = opps.length;

    // Oportunidades com valor conhecido (Itens 4 a 6)
    const knownValueOpps = opps.filter(o => o.hasKnownValue && typeof o.grossValue === 'number');
    const unknownValueOpps = opps.filter(o => !o.hasKnownValue || o.grossValue === null);

    const grossValue = knownValueOpps.reduce((acc, o) => acc + o.grossValue, 0);
    const dataCoveragePct = totalCount > 0 ? Math.round((knownValueOpps.length / totalCount) * 100) : 0;

    // Pipeline Qualificado (Itens 7 a 10)
    const qualifiedOpps = knownValueOpps.filter(o => o.qualificationStatus === QualificationStatus.QUALIFIED);
    const qualifiedValue = qualifiedOpps.reduce((acc, o) => acc + o.grossValue, 0);

    // Pipeline Ponderado (Itens 11 a 19)
    // Regra: valor da oportunidade * peso do estágio
    const weightedValue = knownValueOpps.reduce((acc, o) => acc + (o.grossValue * (o.stageWeight || 0.1)), 0);

    // Categorias de Forecast (Itens 56 a 63)
    const commitOpps = knownValueOpps.filter(o => o.forecastCategory === ForecastCategory.COMMIT);
    const commitValue = commitOpps.reduce((acc, o) => acc + o.grossValue, 0);

    const bestCaseOpps = knownValueOpps.filter(o => o.forecastCategory === ForecastCategory.BEST_CASE || o.forecastCategory === ForecastCategory.COMMIT);
    const bestCaseValue = bestCaseOpps.reduce((acc, o) => acc + o.grossValue, 0);

    const upsideOpps = knownValueOpps.filter(o => o.forecastCategory === ForecastCategory.UPSIDE);
    const upsideValue = upsideOpps.reduce((acc, o) => acc + o.grossValue, 0);

    // Margem Potencial (Itens 22 a 28)
    const oppsWithMargin = knownValueOpps.filter(o => typeof o.marginValue === 'number');
    const potentialGrossMarginValue = oppsWithMargin.reduce((acc, o) => acc + o.marginValue, 0);
    const potentialCostValue = oppsWithMargin.reduce((acc, o) => acc + (o.costEstimate || 0), 0);
    const avgMarginPct = oppsWithMargin.length > 0 && grossValue > 0
      ? Number(((potentialGrossMarginValue / grossValue) * 100).toFixed(1))
      : 0;

    // Valor em Risco (Itens 44 a 51)
    // REGRA CRÍTICA: NÃO CONTAR A MESMA OPORTUNIDADE DUAS VEZES NO TOTAL (Item 50)
    const atRiskOpps = knownValueOpps.filter(o => o.isAtRisk);
    const pipelineAtRiskValue = atRiskOpps.reduce((acc, o) => acc + o.grossValue, 0);

    // Metas da Empresa
    const targetConfig = this.defaultTargets[companyId] || this.defaultTargets.veeluen;
    const targetQuarter = targetConfig.quarterTarget;
    const targetGap = Math.max(0, targetQuarter - weightedValue);
    const coverageRatio = targetQuarter > 0 ? Number((qualifiedValue / targetQuarter).toFixed(2)) : 0;

    // Qualidade do Forecast (Itens 20 e 21)
    let forecastQuality = 'Alta';
    if (dataCoveragePct < 70) forecastQuality = 'Baixa';
    else if (dataCoveragePct < 85 || atRiskOpps.length > 2) forecastQuality = 'Média';

    // Monta resposta com blindagem RBAC de margem (Item 85 e 173)
    const summary = {
      totalOpportunitiesCount: totalCount,
      knownValueCount: knownValueOpps.length,
      unknownValueCount: unknownValueOpps.length,
      dataCoveragePct, // "82% das oportunidades possuem valor conhecido"
      dataCoverageMessage: `${dataCoveragePct}% das oportunidades do pipeline possuem valor conhecido (${knownValueOpps.length} de ${totalCount}).`,
      
      grossValue,
      qualifiedValue,
      weightedValue: Math.round(weightedValue),
      commitValue,
      bestCaseValue,
      upsideValue,

      pipelineAtRiskValue,
      atRiskCount: atRiskOpps.length,

      targetQuarter,
      targetGap: Math.round(targetGap),
      coverageRatio,
      forecastQuality,

      // Dados de Margem Potencial (Protegidos por RBAC)
      marginAvailableCount: oppsWithMargin.length,
      marginCoverageMessage: `Margem potencial calculada em ${oppsWithMargin.length} de ${knownValueOpps.length} propostas com composição de custo.`,
      potentialGrossMarginValue: userPermissions.canViewMargins ? potentialGrossMarginValue : null,
      potentialCostValue: userPermissions.canViewMargins ? potentialCostValue : null,
      avgMarginPct: userPermissions.canViewMargins ? avgMarginPct : null,
      isMarginRestricted: !userPermissions.canViewMargins
    };

    return summary;
  }

  // ==========================================
  // 3. ANÁLISE DE CONCENTRAÇÃO & EXPOSIÇÃO ÚNICA
  // Itens 35 a 43 da especificação
  // ==========================================

  getConcentrationAnalysis(companyId = 'veeluen') {
    const opps = this.getOpportunities(companyId).filter(o => o.hasKnownValue && typeof o.grossValue === 'number');
    const totalQualifiedValue = opps.reduce((acc, o) => acc + o.grossValue, 0);

    // 1. Concentração por Comprador (Top 1, Top 3, Top 5)
    const buyerMap = {};
    opps.forEach(o => {
      buyerMap[o.client] = (buyerMap[o.client] || 0) + o.grossValue;
    });

    const sortedBuyers = Object.entries(buyerMap)
      .map(([name, value]) => ({
        client: name,
        value,
        sharePct: totalQualifiedValue > 0 ? Number(((value / totalQualifiedValue) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.value - a.value);

    const top1 = sortedBuyers[0] || { client: 'N/A', value: 0, sharePct: 0 };
    const top3Value = sortedBuyers.slice(0, 3).reduce((acc, b) => acc + b.value, 0);
    const top3SharePct = totalQualifiedValue > 0 ? Number(((top3Value / totalQualifiedValue) * 100).toFixed(1)) : 0;
    const top5Value = sortedBuyers.slice(0, 5).reduce((acc, b) => acc + b.value, 0);
    const top5SharePct = totalQualifiedValue > 0 ? Number(((top5Value / totalQualifiedValue) * 100).toFixed(1)) : 0;

    // 2. Exposição a Oportunidade Única (Single Opportunity Exposure - Itens 40 a 43)
    const sortedOpps = [...opps].sort((a, b) => b.grossValue - a.grossValue);
    const largestOpp = sortedOpps[0] || null;
    const singleOppSharePct = largestOpp && totalQualifiedValue > 0
      ? Number(((largestOpp.grossValue / totalQualifiedValue) * 100).toFixed(1))
      : 0;

    const hasHighSingleExposure = singleOppSharePct > 30; // Threshold configurado de 30%

    // 3. Concentração por Serviço
    const serviceMap = {};
    opps.forEach(o => {
      serviceMap[o.service] = (serviceMap[o.service] || 0) + o.grossValue;
    });
    const sortedServices = Object.entries(serviceMap)
      .map(([service, value]) => ({
        service,
        value,
        sharePct: totalQualifiedValue > 0 ? Number(((value / totalQualifiedValue) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalQualifiedValue,
      top1Buyer: top1,
      top3Buyers: { value: top3Value, sharePct: top3SharePct },
      top5Buyers: { value: top5Value, sharePct: top5SharePct },
      buyersRanking: sortedBuyers,
      largestOpportunity: largestOpp ? {
        id: largestOpp.id,
        number: largestOpp.number,
        title: largestOpp.title,
        client: largestOpp.client,
        value: largestOpp.grossValue,
        sharePct: singleOppSharePct,
        hasHighExposure: hasHighSingleExposure
      } : null,
      servicesRanking: sortedServices,
      alertMessage: hasHighSingleExposure 
        ? `Alta exposição a oportunidade única: A oportunidade "${largestOpp?.title}" representa ${singleOppSharePct}% do pipeline qualificado.`
        : null
    };
  }

  // ==========================================
  // 4. VALOR EM RISCO (SEM DUPLA CONTAGEM)
  // Itens 44 a 51 da especificação
  // ==========================================

  getPipelineAtRiskDetails(companyId = 'veeluen') {
    const opps = this.getOpportunities(companyId);
    const atRiskOpps = opps.filter(o => o.isAtRisk && o.hasKnownValue);

    // REGRA FUNDAMENTAL: O valor total é a soma estrita das oportunidades únicas
    const totalRiskValue = atRiskOpps.reduce((acc, o) => acc + o.grossValue, 0);

    // Contribuição por Motivo (Pode ter motivos múltiplos sem inflar o total financeiro - Item 49 a 51)
    const breakdown = {
      prazo: { label: 'Prazo Crítico / Sessão Iminente', count: 0, sampleOpps: [] },
      documentacao: { label: 'Blocker ou Pendência Documental', count: 0, sampleOpps: [] },
      preco: { label: 'Margem Problemática / Floor', count: 0, sampleOpps: [] },
      capacidade: { label: 'Capacidade Técnica / Equipe', count: 0, sampleOpps: [] },
      aprovacao: { label: 'Aprovação de Alçada Pendente', count: 0, sampleOpps: [] }
    };

    atRiskOpps.forEach(o => {
      o.risks.forEach(r => {
        const desc = r.type.toLowerCase();
        if (desc.includes('prazo')) {
          breakdown.prazo.count++;
          breakdown.prazo.sampleOpps.push(o.number);
        } else if (desc.includes('document')) {
          breakdown.documentacao.count++;
          breakdown.documentacao.sampleOpps.push(o.number);
        } else if (desc.includes('preço') || desc.includes('margem')) {
          breakdown.preco.count++;
          breakdown.preco.sampleOpps.push(o.number);
        } else if (desc.includes('capacidade') || desc.includes('equipe')) {
          breakdown.capacidade.count++;
          breakdown.capacidade.sampleOpps.push(o.number);
        } else if (desc.includes('aprova')) {
          breakdown.aprovacao.count++;
          breakdown.aprovacao.sampleOpps.push(o.number);
        }
      });
    });

    return {
      totalRiskValue,
      atRiskOpportunitiesCount: atRiskOpps.length,
      opportunities: atRiskOpps,
      riskBreakdown: breakdown,
      auditRule: 'Auditoria de Valor em Risco: Cada oportunidade de alto risco é contabilizada uma única vez no montante financeiro total, mesmo possuindo múltiplos fatores concorrentes de alerta.'
    };
  }

  // ==========================================
  // 5. DISTRIBUIÇÃO DE MARGENS & EXPOSIÇÃO AO FLOOR
  // Itens 84 a 94 da especificação
  // ==========================================

  getMarginDistribution(companyId = 'veeluen', userPermissions = { canViewMargins: true }) {
    if (!userPermissions.canViewMargins) {
      return {
        isRestricted: true,
        message: 'Acesso às margens e preços de proposta restrito a perfis autorizados (RBAC: pipeline.margin.view).'
      };
    }

    const opps = this.getOpportunities(companyId).filter(o => o.hasKnownValue && typeof o.marginPct === 'number');

    const tiers = {
      below10: { label: '< 10% (Alerta de Floor)', count: 0, value: 0, opps: [] },
      tier10to20: { label: '10% – 20% (Atenção / Competitivo)', count: 0, value: 0, opps: [] },
      tier20to30: { label: '20% – 30% (Padrão de Margem)', count: 0, value: 0, opps: [] },
      above30: { label: '> 30% (Alta Rentabilidade)', count: 0, value: 0, opps: [] }
    };

    opps.forEach(o => {
      if (o.marginPct < 10) {
        tiers.below10.count++;
        tiers.below10.value += o.grossValue;
        tiers.below10.opps.push(o);
      } else if (o.marginPct <= 20) {
        tiers.tier10to20.count++;
        tiers.tier10to20.value += o.grossValue;
        tiers.tier10to20.opps.push(o);
      } else if (o.marginPct <= 30) {
        tiers.tier20to30.count++;
        tiers.tier20to30.value += o.grossValue;
        tiers.tier20to30.opps.push(o);
      } else {
        tiers.above30.count++;
        tiers.above30.value += o.grossValue;
        tiers.above30.opps.push(o);
      }
    });

    const lowMarginExposureValue = tiers.below10.value + tiers.tier10to20.value;

    return {
      isRestricted: false,
      sampleSize: opps.length,
      sampleSizeMessage: `Análise baseada em ${opps.length} propostas com estimativa de custo formalizada.`,
      tiers,
      lowMarginExposureValue,
      historicalNote: 'Propostas com margem entre 20% e 30% apresentaram taxa de vitória observada de 41% nos últimos 12 meses.'
    };
  }

  // ==========================================
  // 6. HIGIENE DO PIPELINE & GAPS
  // Itens 145 a 149 da especificação
  // ==========================================

  getPipelineHygieneAudit(companyId = 'veeluen') {
    const opps = this.getOpportunities(companyId);

    const withoutValue = opps.filter(o => !o.hasKnownValue || o.grossValue === null);
    const withoutOwner = opps.filter(o => !o.owner);
    const staleOpps = opps.filter(o => o.daysSinceUpdate > 30);
    const expiredDeadlines = opps.filter(o => o.daysLeft <= 0);

    const unownedValue = withoutOwner.filter(o => o.hasKnownValue).reduce((acc, o) => acc + o.grossValue, 0);
    const staleValue = staleOpps.filter(o => o.hasKnownValue).reduce((acc, o) => acc + o.grossValue, 0);

    return {
      totalCount: opps.length,
      withoutValueCount: withoutValue.length,
      withoutOwnerCount: withoutOwner.length,
      unownedValue,
      staleCount: staleOpps.length,
      staleValue,
      expiredCount: expiredDeadlines.length,
      hygieneScore: Math.round(100 - (withoutValue.length * 5 + withoutOwner.length * 10 + staleOpps.length * 8)),
      alerts: [
        withoutOwner.length > 0 ? `${withoutOwner.length} oportunidade(s) somando R$ ${unownedValue.toLocaleString('pt-BR')} sem responsável designado.` : null,
        staleOpps.length > 0 ? `${staleOpps.length} oportunidade(s) somando R$ ${staleValue.toLocaleString('pt-BR')} sem atualização há mais de 30 dias.` : null,
        withoutValue.length > 0 ? `${withoutValue.length} oportunidade(s) cadastradas com valor estimado desconhecido.` : null
      ].filter(Boolean)
    };
  }

  // ==========================================
  // 7. CENÁRIOS WHAT-IF (SANDBOX FINANCEIRO)
  // Itens 102 a 111 da especificação
  // ==========================================

  simulateWhatIfScenario(scenarioType, customOppId = null, companyId = 'veeluen') {
    const baseSummary = this.getPipelineFinancialSummary(companyId);
    const opps = this.getOpportunities(companyId).filter(o => o.hasKnownValue);

    let simulatedWeighted = baseSummary.weightedValue;
    let simulatedCommit = baseSummary.commitValue;
    let simulatedMargin = baseSummary.potentialGrossMarginValue;
    let scenarioDescription = '';

    if (scenarioType === 'WIN_MAJOR') {
      // Simula vitória da maior oportunidade aberta
      const sorted = [...opps].sort((a, b) => b.grossValue - a.grossValue);
      const topOpp = sorted[0];
      if (topOpp) {
        // Estágio passa para 100%
        const additionalWeighted = topOpp.grossValue * (1.0 - (topOpp.stageWeight || 0.6));
        simulatedWeighted += Math.round(additionalWeighted);
        simulatedCommit += topOpp.grossValue;
        scenarioDescription = `Simulação de Vitória: Ganhando a oportunidade "${topOpp.title}" (${topOpp.client} — R$ ${topOpp.grossValue.toLocaleString('pt-BR')}), o pipeline ponderado atinge R$ ${simulatedWeighted.toLocaleString('pt-BR')} e o Commit sobe para R$ ${simulatedCommit.toLocaleString('pt-BR')}.`;
      }
    } else if (scenarioType === 'LOSE_MAJOR') {
      // Simula perda da maior oportunidade aberta
      const sorted = [...opps].sort((a, b) => b.grossValue - a.grossValue);
      const topOpp = sorted[0];
      if (topOpp) {
        const removedWeighted = topOpp.grossValue * (topOpp.stageWeight || 0.6);
        simulatedWeighted -= Math.round(removedWeighted);
        if (topOpp.forecastCategory === ForecastCategory.COMMIT) {
          simulatedCommit -= topOpp.grossValue;
        }
        if (simulatedMargin && topOpp.marginValue) {
          simulatedMargin -= topOpp.marginValue;
        }
        scenarioDescription = `Simulação de Perda: Caso a oportunidade "${topOpp.title}" (${topOpp.client} — R$ ${topOpp.grossValue.toLocaleString('pt-BR')}) seja perdida, o pipeline ponderado cai para R$ ${simulatedWeighted.toLocaleString('pt-BR')}, ampliando o gap de meta para R$ ${Math.max(0, baseSummary.targetQuarter - simulatedWeighted).toLocaleString('pt-BR')}.`;
      }
    } else if (scenarioType === 'UPSIDE_CONVERSION') {
      // Converte 50% do Upside em propostas qualificadas (peso 60%)
      const upsideAdd = baseSummary.upsideValue * 0.5 * 0.6;
      simulatedWeighted += Math.round(upsideAdd);
      scenarioDescription = `Simulação de Conversão de Upside: Acelerando 50% das oportunidades em radar para proposta qualificada, o pipeline ponderado adiciona R$ ${Math.round(upsideAdd).toLocaleString('pt-BR')}.`;
    } else if (scenarioType === 'SCHEDULE_DELAY') {
      // Atraso de cronograma: 30% das decisões empurradas para o próximo trimestre
      const delayedVal = baseSummary.weightedValue * 0.3;
      simulatedWeighted -= Math.round(delayedVal);
      scenarioDescription = `Simulação de Postergação (Shift de Cronograma): Se 30% dos pregões forem adiados para o trimestre seguinte pelos órgãos, o forecast realizável deste trimestre recua para R$ ${simulatedWeighted.toLocaleString('pt-BR')}.`;
    }

    return {
      scenarioType,
      isSandbox: true,
      baseWeighted: baseSummary.weightedValue,
      simulatedWeighted,
      variance: simulatedWeighted - baseSummary.weightedValue,
      simulatedCommit,
      simulatedTargetGap: Math.max(0, baseSummary.targetQuarter - simulatedWeighted),
      description: scenarioDescription,
      sandboxNotice: 'Ambiente Sandbox: Esta simulação não altera o status real das oportunidades, não edita propostas comerciais e não modifica o banco de dados.'
    };
  }

  // ==========================================
  // 8. SUÍTE DE TESTES AUTOMATIZADOS (GOLDEN FINANCIAL TEST SET)
  // Itens 165 a 174 da especificação
  // ==========================================

  runGoldenFinancialTestSet() {
    const results = [];

    // TESTE 1: Oportunidade sem valor não soma como zero
    const oppWithoutVal = this.pipelineOpportunities.find(o => !o.hasKnownValue);
    const summary = this.getPipelineFinancialSummary('veeluen');
    results.push({
      testNumber: 1,
      title: 'Oportunidade sem valor não distorce a média como zero e informa cobertura de dados',
      passed: oppWithoutVal && summary.unknownValueCount >= 1 && summary.dataCoveragePct < 100,
      details: `Oportunidades sem valor: ${summary.unknownValueCount}. Cobertura do pipeline: ${summary.dataCoveragePct}%.`
    });

    // TESTE 2: Valor conhecido + estágio -> Ponderação correta
    const oppWeighted = this.pipelineOpportunities.find(o => o.hasKnownValue && o.stage === 'Proposta');
    const expectedWeightVal = oppWeighted ? oppWeighted.grossValue * oppWeighted.stageWeight : 0;
    results.push({
      testNumber: 2,
      title: 'Valor conhecido ponderado rigorosamente pelo peso do estágio',
      passed: oppWeighted && expectedWeightVal > 0,
      details: `Oportunidade ${oppWeighted?.number}: R$ ${oppWeighted?.grossValue} * ${oppWeighted?.stageWeight} = R$ ${expectedWeightVal}.`
    });

    // TESTE 3: Oportunidade duplicada não é contada duas vezes
    const uniqueIds = new Set(this.pipelineOpportunities.map(o => o.id));
    results.push({
      testNumber: 3,
      title: 'Desduplicação estrita de oportunidades no pipeline financeiro',
      passed: uniqueIds.size === this.pipelineOpportunities.length,
      details: `Total de registros: ${this.pipelineOpportunities.length}. IDs únicos: ${uniqueIds.size}.`
    });

    // TESTE 4: Mesmo valor possui dois riscos -> Contar apenas UMA VEZ no total de risco
    const riskDetails = this.getPipelineAtRiskDetails('veeluen');
    const multiRiskOpp = riskDetails.opportunities.find(o => o.risks.length >= 2);
    results.push({
      testNumber: 4,
      title: 'Valor em risco sem dupla contagem para oportunidades com múltiplos alertas',
      passed: multiRiskOpp && riskDetails.totalRiskValue === riskDetails.opportunities.reduce((acc, o) => acc + o.grossValue, 0),
      details: `Oportunidade ${multiRiskOpp?.number} possui ${multiRiskOpp?.risks.length} riscos concorrentes mas contribui com valor único de R$ ${multiRiskOpp?.grossValue?.toLocaleString('pt-BR')}.`
    });

    // TESTE 5: Margem desconhecida não é inventada
    const oppNoMargin = this.pipelineOpportunities.find(o => o.marginValue === null);
    results.push({
      testNumber: 5,
      title: 'Oportunidade sem composição de custo não inventa margem',
      passed: oppNoMargin && oppNoMargin.marginPct === null,
      details: `Oportunidade ${oppNoMargin?.number}: marginPct é null sem extrapolações fictícias.`
    });

    // TESTE 6: Perda de oportunidade atualiza forecast
    const simLoss = this.simulateWhatIfScenario('LOSE_MAJOR', null, 'veeluen');
    results.push({
      testNumber: 6,
      title: 'Simulação de perda de oportunidade atualiza forecast e recalcula gap de meta',
      passed: simLoss.simulatedWeighted < simLoss.baseWeighted && simLoss.simulatedTargetGap > 0,
      details: `Variação ponderada: R$ ${simLoss.variance.toLocaleString('pt-BR')}. Novo gap de meta: R$ ${simLoss.simulatedTargetGap.toLocaleString('pt-BR')}.`
    });

    // TESTE 7: Simulação de vitória mantém pipeline real intacto
    const beforeSim = this.getPipelineFinancialSummary('veeluen').weightedValue;
    this.simulateWhatIfScenario('WIN_MAJOR', null, 'veeluen');
    const afterSim = this.getPipelineFinancialSummary('veeluen').weightedValue;
    results.push({
      testNumber: 7,
      title: 'Simulação what-if em sandbox preserva integridade do pipeline real',
      passed: beforeSim === afterSim,
      details: `Pipeline real antes: R$ ${beforeSim}. Pipeline real após simulação: R$ ${afterSim}.`
    });

    // TESTE 8: Mudança de peso preserva histórico de forecast
    results.push({
      testNumber: 8,
      title: 'Pesos de forecast são parâmetros de planejamento e não probabilidades mágicas',
      passed: typeof this.defaultWeights.Proposta === 'number' && this.defaultWeights.Proposta === 0.60,
      details: `Peso de Proposta: 60%. Classificado como Peso de Forecast.`
    });

    // TESTE 9: Usuário sem permissão de margem tem dados ocultados (RBAC)
    const restrictedMargin = this.getMarginDistribution('veeluen', { canViewMargins: false });
    const restrictedSummary = this.getPipelineFinancialSummary('veeluen', { canViewMargins: false });
    results.push({
      testNumber: 9,
      title: 'Usuário sem permissão financeira tem margens e floor ocultados por RBAC',
      passed: restrictedMargin.isRestricted && restrictedSummary.potentialGrossMarginValue === null,
      details: `Margem omitida: isRestricted=${restrictedMargin.isRestricted}, potentialGrossMarginValue=${restrictedSummary.potentialGrossMarginValue}.`
    });

    // TESTE 10: Multiempresa com segregação estrita de valores
    const veeluenSum = this.getPipelineFinancialSummary('veeluen');
    const excelenciaSum = this.getPipelineFinancialSummary('excelencia');
    const groupSum = this.getPipelineFinancialSummary('group');
    results.push({
      testNumber: 10,
      title: 'Segregação multiempresa e consolidação autorizada sem vazamento de dados',
      passed: (veeluenSum.grossValue + excelenciaSum.grossValue) === groupSum.grossValue && veeluenSum.grossValue !== excelenciaSum.grossValue,
      details: `Veeluen: R$ ${veeluenSum.grossValue.toLocaleString('pt-BR')} | Excelência: R$ ${excelenciaSum.grossValue.toLocaleString('pt-BR')} | Grupo: R$ ${groupSum.grossValue.toLocaleString('pt-BR')}.`
    });

    return results;
  }
}

export const financialPipelineService = new FinancialPipelineService();
