/**
 * VELLIA LICITAÇÕES — FASE 61: GROWTH & OPPORTUNITY EXPANSION ENGINE
 * growthService.js: Motor Central de Inteligência de Crescimento e Expansão Comercial
 * 
 * Regras Centrais:
 * 1. Growth Opportunity != Procurement Opportunity
 * 2. Nunca marcar ACTIVE sem revisão humana expressa
 * 3. Nunca realizar abordagem comercial externa sem confirmação humana
 * 4. Toda oportunidade é baseada em evidências auditáveis (Evidence First)
 * 5. Não inventar demanda nem usar scores opacos
 * 6. Dados de margem ausentes não são tratados como zero
 * 7. Respeitar isolamento multiempresa e permissões granulares
 */

import {
  GrowthOpportunityType,
  GrowthOpportunityStatus,
  GrowthPipelineStage,
  GrowthPriority,
  GrowthConfidence,
  ExpansionQuadrant,
  GrowthActionType,
  RejectionReason,
  ConversionTargetType,
  GrowthOutcomeType
} from './growthModels.js';

import {
  initialGrowthOpportunities,
  initialServiceAffinities,
  initialTargetBuyers,
  initialRegionalExpansions,
  initialStrategicAccountsCoverage,
  initialConcentrationMetrics
} from './growthData.js';

const STORAGE_KEYS = {
  OPPORTUNITIES: 'vellia_growth_opportunities_v61',
  AFFINITIES: 'vellia_growth_affinities_v61',
  TARGET_BUYERS: 'vellia_growth_target_buyers_v61',
  REGIONAL: 'vellia_growth_regional_v61',
  ACCOUNTS_COVERAGE: 'vellia_growth_accounts_coverage_v61',
  AUDIT_LOGS: 'vellia_growth_audit_logs_v61',
  WATCHLIST: 'vellia_growth_watchlists_v61'
};

class GrowthService {
  constructor() {
    this._memoryStore = new Map();
    this._initStorage();
  }

  _isStorageAvailable() {
    try {
      return typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function' && typeof localStorage.getItem === 'function';
    } catch (e) {
      return false;
    }
  }

  _initStorage() {
    if (this._isStorageAvailable()) {
      try {
        if (!localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES)) {
          localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(initialGrowthOpportunities));
        }
        if (!localStorage.getItem(STORAGE_KEYS.AFFINITIES)) {
          localStorage.setItem(STORAGE_KEYS.AFFINITIES, JSON.stringify(initialServiceAffinities));
        }
        if (!localStorage.getItem(STORAGE_KEYS.TARGET_BUYERS)) {
          localStorage.setItem(STORAGE_KEYS.TARGET_BUYERS, JSON.stringify(initialTargetBuyers));
        }
        if (!localStorage.getItem(STORAGE_KEYS.REGIONAL)) {
          localStorage.setItem(STORAGE_KEYS.REGIONAL, JSON.stringify(initialRegionalExpansions));
        }
        if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS_COVERAGE)) {
          localStorage.setItem(STORAGE_KEYS.ACCOUNTS_COVERAGE, JSON.stringify(initialStrategicAccountsCoverage));
        }
        if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
        }
      } catch (e) {
        // Fallback em memória
      }
    } else {
      this._memoryStore.set(STORAGE_KEYS.OPPORTUNITIES, JSON.parse(JSON.stringify(initialGrowthOpportunities)));
      this._memoryStore.set(STORAGE_KEYS.AFFINITIES, JSON.parse(JSON.stringify(initialServiceAffinities)));
      this._memoryStore.set(STORAGE_KEYS.TARGET_BUYERS, JSON.parse(JSON.stringify(initialTargetBuyers)));
      this._memoryStore.set(STORAGE_KEYS.REGIONAL, JSON.parse(JSON.stringify(initialRegionalExpansions)));
      this._memoryStore.set(STORAGE_KEYS.ACCOUNTS_COVERAGE, JSON.parse(JSON.stringify(initialStrategicAccountsCoverage)));
      this._memoryStore.set(STORAGE_KEYS.AUDIT_LOGS, []);
    }
  }

  _get(key, fallback = []) {
    if (this._isStorageAvailable()) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      } catch (e) {
        return this._memoryStore.has(key) ? this._memoryStore.get(key) : fallback;
      }
    }
    return this._memoryStore.has(key) ? this._memoryStore.get(key) : fallback;
  }

  _save(key, val) {
    if (this._isStorageAvailable()) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        this._memoryStore.set(key, val);
      }
    } else {
      this._memoryStore.set(key, val);
    }
  }

  _logAudit(action, details, user = 'Sistema') {
    const logs = this._get(STORAGE_KEYS.AUDIT_LOGS, []);
    const entry = {
      id: `AUDIT-GROWTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      user,
      timestamp: new Date().toISOString()
    };
    logs.unshift(entry);
    this._save(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100));
  }

  /**
   * 170. GROWTH SIGNAL EXPIRY / FRESHNESS
   * Expira automaticamente sinais antigos com mais de 180 dias sem atualização.
   */
  _syncSignalsFreshness(opportunities, persist = false) {
    const now = new Date().getTime();
    let updated = false;

    const synced = opportunities.map(opp => {
      if (opp.expiresAt && opp.status !== GrowthOpportunityStatus.DISMISSED && opp.status !== GrowthOpportunityStatus.EXPIRED) {
        const expiryTime = new Date(opp.expiresAt).getTime();
        if (now > expiryTime) {
          updated = true;
          return {
            ...opp,
            status: GrowthOpportunityStatus.EXPIRED,
            expiredReason: 'Prazo limite do sinal expirou sem validação humana.'
          };
        }
      }
      return opp;
    });

    if (updated && persist) {
      this._save(STORAGE_KEYS.OPPORTUNITIES, synced);
    }
    return synced;
  }

  /**
   * 7. Listar oportunidades de crescimento filtradas por empresa e status
   */
  listGrowthOpportunities(companyFilter = 'ALL', statusFilter = null, typeFilter = null) {
    let list = this._get(STORAGE_KEYS.OPPORTUNITIES, initialGrowthOpportunities);
    list = this._syncSignalsFreshness(list);

    if (companyFilter && companyFilter !== 'ALL' && companyFilter !== 'all') {
      const targetCompany = companyFilter.toLowerCase();
      list = list.filter(o => o.companyId === targetCompany || o.companyId === 'group');
    }

    if (statusFilter && statusFilter !== 'ALL') {
      list = list.filter(o => o.status === statusFilter);
    }

    if (typeFilter && typeFilter !== 'ALL') {
      list = list.filter(o => o.type === typeFilter);
    }

    return list;
  }

  getGrowthOpportunityById(id) {
    const list = this._get(STORAGE_KEYS.OPPORTUNITIES, initialGrowthOpportunities);
    return list.find(o => o.id === id) || null;
  }

  /**
   * 10. Validação humana de oportunidade de crescimento
   */
  validateGrowthOpportunity(id, user = 'Diretoria / Gestão', notes = '') {
    const list = this._get(STORAGE_KEYS.OPPORTUNITIES, initialGrowthOpportunities);
    const index = list.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Oportunidade ${id} não encontrada.`);

    list[index] = {
      ...list[index],
      status: GrowthOpportunityStatus.VALIDATED,
      pipelineStage: GrowthPipelineStage.VALIDATED,
      validatedAt: new Date().toISOString(),
      validatedBy: user,
      validationNotes: notes || 'Oportunidade de crescimento validada após revisão de coerência de capacidade e demanda.'
    };

    this._save(STORAGE_KEYS.OPPORTUNITIES, list);
    this._logAudit('Growth Opportunity validated', { id, title: list[index].title, user, notes }, user);
    return list[index];
  }

  /**
   * 104. Mini Plano de Crescimento para oportunidade validada
   */
  planActionForOpportunity(id, growthPlanData, user = 'Diretoria') {
    const list = this._get(STORAGE_KEYS.OPPORTUNITIES, initialGrowthOpportunities);
    const index = list.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Oportunidade ${id} não encontrada.`);

    const updatedPlan = {
      objective: growthPlanData.objective || 'Explorar potencial comercial qualificado',
      target: growthPlanData.target || list[index].targetOrganization,
      service: growthPlanData.service || list[index].targetService,
      evidenceSummary: growthPlanData.evidenceSummary || 'Evidências estruturadas no Vellia',
      action: growthPlanData.action || GrowthActionType.RELATIONSHIP,
      owner: growthPlanData.owner || user,
      reviewDate: growthPlanData.reviewDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      commercialTiming: growthPlanData.commercialTiming || 'Conforme ciclo de compras do contratante'
    };

    list[index] = {
      ...list[index],
      status: GrowthOpportunityStatus.ACTION_PLANNED,
      pipelineStage: GrowthPipelineStage.ACTION_PLANNED,
      growthPlan: updatedPlan,
      actionPlannedAt: new Date().toISOString(),
      actionPlannedBy: user
    };

    this._save(STORAGE_KEYS.OPPORTUNITIES, list);
    this._logAudit('Action created', { id, title: list[index].title, plan: updatedPlan }, user);
    return list[index];
  }

  /**
   * 11. REGRA CRÍTICA: NÃO MARCAR ACTIVE SEM REVISÃO HUMANA
   */
  activateOpportunity(id, user = 'Diretoria', humanReviewConfirmed = false) {
    if (!humanReviewConfirmed) {
      throw new Error('REGRA DE GOVERNANÇA: É estritamente proibido marcar oportunidade como ACTIVE sem confirmação expressa de revisão humana.');
    }

    const list = this._get(STORAGE_KEYS.OPPORTUNITIES, initialGrowthOpportunities);
    const index = list.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Oportunidade ${id} não encontrada.`);

    list[index] = {
      ...list[index],
      status: GrowthOpportunityStatus.ACTIVE,
      pipelineStage: GrowthPipelineStage.ENGAGED,
      activatedAt: new Date().toISOString(),
      activatedBy: user,
      humanReviewConfirmed: true
    };

    this._save(STORAGE_KEYS.OPPORTUNITIES, list);
    this._logAudit('Growth Opportunity activated with human review', { id, title: list[index].title, user }, user);
    return list[index];
  }

  /**
   * 163. Rejeição com preservação estrita do motivo (Preserve Rejection Reason)
   */
  dismissOpportunity(id, rejectionReason, notes = '', user = 'Diretoria') {
    const list = this._get(STORAGE_KEYS.OPPORTUNITIES, initialGrowthOpportunities);
    const index = list.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Oportunidade ${id} não encontrada.`);

    const validReason = Object.values(RejectionReason).includes(rejectionReason)
      ? rejectionReason
      : RejectionReason.OTHER;

    list[index] = {
      ...list[index],
      status: GrowthOpportunityStatus.DISMISSED,
      pipelineStage: GrowthPipelineStage.CLOSED,
      rejectionReason: validReason,
      rejectionNotes: notes,
      dismissedAt: new Date().toISOString(),
      dismissedBy: user
    };

    this._save(STORAGE_KEYS.OPPORTUNITIES, list);
    this._logAudit('Growth Opportunity dismissed', { id, title: list[index].title, reason: validReason, notes }, user);
    return list[index];
  }

  /**
   * 152. CONVERSION LINK (Registrar entidade gerada sem duplicar nem confundir com licitação)
   */
  convertOpportunity(id, conversionType = ConversionTargetType.PROCUREMENT_OPPORTUNITY, details = {}, user = 'Diretoria') {
    const list = this._get(STORAGE_KEYS.OPPORTUNITIES, initialGrowthOpportunities);
    const index = list.findIndex(o => o.id === id);
    if (index === -1) throw new Error(`Oportunidade ${id} não encontrada.`);

    const generatedEntityId = details.entityId || `CONV-${Date.now()}`;
    const conversionLink = {
      targetType: conversionType,
      targetEntityId: generatedEntityId,
      entityTitle: details.title || list[index].title,
      convertedAt: new Date().toISOString(),
      convertedBy: user,
      notes: details.notes || 'Conversão de hipótese de crescimento validada em ação no pipeline correspondente.'
    };

    list[index] = {
      ...list[index],
      pipelineStage: GrowthPipelineStage.CONVERTED,
      status: GrowthOpportunityStatus.ACTION_PLANNED,
      conversionLink,
      outcome: GrowthOutcomeType.OPPORTUNITY_CREATED
    };

    this._save(STORAGE_KEYS.OPPORTUNITIES, list);
    this._logAudit('Growth Opportunity converted', { id, title: list[index].title, conversionLink }, user);
    return {
      growthOpportunity: list[index],
      conversionLink
    };
  }

  /**
   * 21 a 31. CROSS-SELL ENGINE (Afinidade Histórica, Amostra Obrigatória, Warning de Amostra Pequena)
   */
  getCrossSellAnalysis(companyFilter = 'ALL') {
    const affinities = this._get(STORAGE_KEYS.AFFINITIES, initialServiceAffinities);
    const opportunities = this.listGrowthOpportunities(companyFilter, null, GrowthOpportunityType.CROSS_SELL);
    const strategicAccounts = this._get(STORAGE_KEYS.ACCOUNTS_COVERAGE, initialStrategicAccountsCoverage);

    return {
      affinities: affinities.map(aff => ({
        ...aff,
        isSmallSample: aff.sampleSize < 3,
        sampleWarning: aff.sampleSize < 3
          ? 'ALERTA DE AMOSTRA PEQUENA: Correlação baseada em menos de 3 casos. Não utilizar como padrão isolado.'
          : null
      })),
      crossSellOpportunities: opportunities,
      accounts: strategicAccounts
    };
  }

  /**
   * 32 a 41. BUYER EXPANSION (Similaridade Estruturada sem Score Opaco)
   */
  getBuyerExpansion(companyFilter = 'ALL') {
    let buyers = this._get(STORAGE_KEYS.TARGET_BUYERS, initialTargetBuyers);
    if (companyFilter && companyFilter !== 'ALL' && companyFilter !== 'all') {
      const targetCompany = companyFilter.toLowerCase();
      buyers = buyers.filter(b => b.companyTarget === targetCompany || b.companyTarget === 'group');
    }
    return buyers;
  }

  toggleBuyerWatchlist(organizationName) {
    const buyers = this._get(STORAGE_KEYS.TARGET_BUYERS, initialTargetBuyers);
    const buyer = buyers.find(b => b.organization === organizationName);
    if (buyer) {
      buyer.watchlist = !buyer.watchlist;
      this._save(STORAGE_KEYS.TARGET_BUYERS, buyers);
      return buyer.watchlist;
    }
    return false;
  }

  /**
   * 42 a 48. REGIONAL EXPANSION (Com Capacity Check e Verificação de Prontidão Obrigatórios)
   */
  getRegionalExpansion(companyFilter = 'ALL') {
    let regions = this._get(STORAGE_KEYS.REGIONAL, initialRegionalExpansions);
    if (companyFilter && companyFilter !== 'ALL' && companyFilter !== 'all') {
      const targetCompany = companyFilter.toLowerCase();
      regions = regions.filter(r => r.companyTarget === targetCompany || r.companyTarget === 'group');
    }
    return regions;
  }

  /**
   * 49 a 56. SERVICE EXPANSION & ADJACENT MARKETS (Com verificação de Gap de Capacidade)
   */
  getServiceExpansion(companyFilter = 'ALL') {
    const allOpps = this.listGrowthOpportunities(companyFilter);
    const serviceOpps = allOpps.filter(o => 
      o.type === GrowthOpportunityType.NEW_SERVICE_MARKET || 
      o.type === GrowthOpportunityType.ADJACENT_MARKET
    );

    return {
      opportunities: serviceOpps,
      adjacentMarkets: serviceOpps.filter(o => o.type === GrowthOpportunityType.ADJACENT_MARKET),
      serviceGaps: serviceOpps.filter(o => o.readiness?.capacityStatus?.includes('GAP') || o.readiness?.capacityStatus?.includes('LIMITADA'))
    };
  }

  /**
   * 62 a 70. STRATEGIC ACCOUNTS & WHITE SPACE OPPORTUNITIES
   * Regra 65: Usar "Cobertura de Serviços Conhecida" em vez de Share of Wallet sem dados completos
   */
  getStrategicAccountsAndWhiteSpaces(companyFilter = 'ALL') {
    const accounts = this._get(STORAGE_KEYS.ACCOUNTS_COVERAGE, initialStrategicAccountsCoverage);
    
    // Extrai todas as White Space Opportunities legítimas
    const whiteSpaces = [];
    accounts.forEach(acc => {
      if (acc.whiteSpaces && Array.isArray(acc.whiteSpaces)) {
        acc.whiteSpaces.forEach(ws => {
          if (ws.buyerUses && ws.companyHasCapacity) {
            whiteSpaces.push({
              organization: acc.organization,
              service: ws.service,
              priority: ws.priority,
              notes: ws.notes,
              relationshipStrength: acc.relationshipStrength,
              knownCoveragePct: acc.knownCoveragePct
            });
          }
        });
      }
    });

    return {
      accounts,
      whiteSpaces
    };
  }

  /**
   * 79 a 87. MATRIZ DE EXPANSÃO (Atratividade de Mercado x Prontidão da Empresa)
   * Regra 84: Não usar dado ausente como zero.
   */
  getExpansionMatrix(companyFilter = 'ALL') {
    const opportunities = this.listGrowthOpportunities(companyFilter);

    const quadrants = {
      [ExpansionQuadrant.PRIORITIZE]: [],
      [ExpansionQuadrant.DEVELOP_CAPABILITY]: [],
      [ExpansionQuadrant.MONITOR]: [],
      [ExpansionQuadrant.LOW_PRIORITY]: []
    };

    opportunities.forEach(opp => {
      const quad = opp.quadrant || ExpansionQuadrant.MONITOR;
      if (quadrants[quad]) {
        quadrants[quad].push(opp);
      }
    });

    return {
      quadrants,
      summary: {
        total: opportunities.length,
        prioritizeCount: quadrants[ExpansionQuadrant.PRIORITIZE].length,
        developCapabilityCount: quadrants[ExpansionQuadrant.DEVELOP_CAPABILITY].length,
        monitorCount: quadrants[ExpansionQuadrant.MONITOR].length,
        lowPriorityCount: quadrants[ExpansionQuadrant.LOW_PRIORITY].length
      }
    };
  }

  /**
   * 123 a 128. Concentrações Estratégicas (Alertas para sugerir diversificação coerente)
   */
  getConcentrationAnalysis() {
    return initialConcentrationMetrics;
  }

  /**
   * 91 a 100. COMMERCIAL OUTREACH SUPERVISIONADA
   * REGRA 92 & 96: EXTERNAL OUTREACH SEMPRE EXIGE CONFIRMAÇÃO HUMANA! NÃO CRIAR SPAM ENGINE!
   * Basear em dados corporativos legítimos, sem dados pessoais sensíveis.
   */
  prepareCommercialOutreach(opportunityId) {
    const opp = this.getGrowthOpportunityById(opportunityId);
    if (!opp) throw new Error(`Oportunidade ${opportunityId} não encontrada.`);

    const timing = opp.growthPlan?.commercialTiming || 'Conforme publicação de edital ou término de contrato vigente';
    
    // Modelo institucional legítimo (Foco corporativo estrito, sem dados pessoais ou invasivos)
    const suggestedSubject = `Vellia / Apresentação Técnica Institucional: ${opp.targetService} — ${opp.targetOrganization}`;
    const suggestedBody = `Prezada equipe técnica de contratações da ${opp.targetOrganization},\n\n` +
      `Identificamos a relevância de suas operações industriais na região de ${opp.targetRegion} e a demanda contínua por serviços de excelência em ${opp.targetService}.\n\n` +
      `Nossa organização conta com atestados de capacidade técnica homologados perante os principais contratantes do setor, dispondo de corpo técnico habilitado e equipamentos calibrados com prontidão de atendimento.\n\n` +
      `Colocamo-nos à disposição para envio de nosso acervo técnico, certidões e esclarecimento de soluções em conformidade com as normas regulamentadoras aplicáveis.\n\n` +
      `Atenciosamente,\nDiretoria Comercial & Técnica\nVellia Licitações & Gestão de Contratos`;

    return {
      opportunityId: opp.id,
      targetOrganization: opp.targetOrganization,
      targetService: opp.targetService,
      suggestedTiming: timing,
      requiresHumanConfirmation: true,
      antiSpamNotice: 'AVISO DE GOVERNANÇA: Nenhuma mensagem será transmitida automaticamente. O envio depende de aprovação manual e canal formal do contratante.',
      outreachDraft: {
        subject: suggestedSubject,
        body: suggestedBody
      }
    };
  }

  confirmAndExecuteOutreach(opportunityId, outreachData, humanConfirmed = false, user = 'Comercial') {
    if (!humanConfirmed) {
      throw new Error('REGRA DE SEGURANÇA: Ação comercial externa exige confirmação humana expressa para prevenir envios não supervisionados.');
    }

    const list = this._get(STORAGE_KEYS.OPPORTUNITIES, initialGrowthOpportunities);
    const index = list.findIndex(o => o.id === opportunityId);
    if (index === -1) throw new Error(`Oportunidade ${opportunityId} não encontrada.`);

    list[index] = {
      ...list[index],
      pipelineStage: GrowthPipelineStage.ENGAGED,
      outreachSentAt: new Date().toISOString(),
      outreachSentBy: user,
      outreachContent: outreachData
    };

    this._save(STORAGE_KEYS.OPPORTUNITIES, list);
    this._logAudit('Commercial outreach approved and recorded', { opportunityId, user }, user);
    return list[index];
  }

  /**
   * 196 a 200. MULTIEMPRESA E SINERGIAS DE GRUPO COM CONTROLE DE PERMISSÃO
   */
  checkGroupSynergies(userPermissions = [], companyScope = 'ALL') {
    // REGRA 199: NÃO COMPARTILHAR DADOS SEM PERMISSÃO
    const hasGroupPerm = userPermissions.includes('growth.group.view') || companyScope === 'ALL_COMPANIES' || companyScope === 'ALL';
    if (!hasGroupPerm) {
      return {
        allowed: false,
        synergies: [],
        message: 'Acesso restrito: O usuário não possui a permissão [growth.group.view] para consolidar sinergias entre Veeluen e Excelência Ambiental.'
      };
    }

    const synergies = [
      {
        id: 'SYN-001',
        title: 'Sinergia Petrobras RNEST: Excelência Ambiental + Veeluen Solutions',
        description: 'Excelência Ambiental possui contrato de Emissões Atmosféricas na RNEST. Veeluen Solutions possui equipe de ETE já mobilizada. Possibilidade de oferta unificada de conformidade ambiental completa.',
        leadCompany: 'Excelência Ambiental',
        partnerCompany: 'Veeluen Solutions',
        client: 'Petrobras RNEST',
        status: 'AUTORIZADO',
        confidentialityLevel: 'CONFIDENCIAL'
      },
      {
        id: 'SYN-002',
        title: 'Sinergia Polo Suape: Transpetro ETE + PGRS + Monitoramento Perimetral',
        description: 'Veeluen detém a operação de ETE e pode articular com Excelência para relatórios integrados de ruído e efluentes.',
        leadCompany: 'Veeluen Solutions',
        partnerCompany: 'Excelência Ambiental',
        client: 'Transpetro Suape',
        status: 'EM AVALIAÇÃO',
        confidentialityLevel: 'CONFIDENCIAL'
      }
    ];

    return {
      allowed: true,
      synergies,
      message: 'Sinergias consolidadas do Grupo com governança de confidencialidade.'
    };
  }

  /**
   * 143 a 145. EXECUTIVE COCKPIT: BLOCO CRESCIMENTO (MOSTRAR NO MÁXIMO 3 OPORTUNIDADES)
   */
  getTopCockpitOpportunities(companyFilter = 'ALL', limit = 3) {
    const list = this.listGrowthOpportunities(companyFilter)
      .filter(o => o.status !== GrowthOpportunityStatus.DISMISSED && o.status !== GrowthOpportunityStatus.EXPIRED);

    // Prioriza 1 Novo Comprador, 1 Nova Região e 1 Cross-sell se disponíveis
    const crossSell = list.find(o => o.type === GrowthOpportunityType.CROSS_SELL);
    const newRegion = list.find(o => o.type === GrowthOpportunityType.NEW_REGION);
    const newBuyer = list.find(o => o.type === GrowthOpportunityType.NEW_BUYER);

    const curated = [];
    if (crossSell) curated.push(crossSell);
    if (newRegion && !curated.includes(newRegion)) curated.push(newRegion);
    if (newBuyer && !curated.includes(newBuyer)) curated.push(newBuyer);

    // Completa até o limite com as de prioridade NOW
    list.forEach(o => {
      if (curated.length < limit && !curated.includes(o)) {
        curated.push(o);
      }
    });

    return curated.slice(0, limit);
  }

  /**
   * 185 a 188. GROWTH OPPORTUNITY REPORT (Executivo e Detalhado)
   */
  generateGrowthReport(companyFilter = 'ALL', type = 'EXECUTIVE') {
    const opps = this.listGrowthOpportunities(companyFilter);
    const active = opps.filter(o => o.status !== GrowthOpportunityStatus.DISMISSED && o.status !== GrowthOpportunityStatus.EXPIRED);
    const matrix = this.getExpansionMatrix(companyFilter);
    const concentration = this.getConcentrationAnalysis();

    if (type === 'EXECUTIVE') {
      return {
        reportType: 'EXECUTIVE_BRIEFING',
        generatedAt: new Date().toISOString(),
        title: 'Relatório Executivo de Expansão & Crescimento Vellia',
        companyScope: companyFilter.toUpperCase(),
        totalOpportunities: active.length,
        topPriorities: this.getTopCockpitOpportunities(companyFilter, 3).map(o => ({
          title: o.title,
          type: o.type,
          organization: o.targetOrganization,
          service: o.targetService,
          region: o.targetRegion,
          confidence: o.confidence,
          priority: o.priority,
          readiness: o.readiness.capacityStatus
        })),
        concentrationAlerts: concentration.buyerConcentration,
        expansionMatrixSummary: matrix.summary
      };
    }

    return {
      reportType: 'DETAILED_AUDIT_REPORT',
      generatedAt: new Date().toISOString(),
      title: 'Dossiê Detalhado de Oportunidades de Expansão e Prontidão Técnica',
      companyScope: companyFilter.toUpperCase(),
      opportunities: active.map(o => ({
        id: o.id,
        title: o.title,
        type: o.type,
        status: o.status,
        pipelineStage: o.pipelineStage,
        targetOrganization: o.targetOrganization,
        targetService: o.targetService,
        targetRegion: o.targetRegion,
        evidence: o.evidence,
        readiness: o.readiness,
        attractiveness: o.attractiveness,
        growthPlan: o.growthPlan,
        rejectionReason: o.rejectionReason || null
      })),
      matrix,
      concentration
    };
  }

  /**
   * 161. EFETIVIDADE DO MOTOR DE CRESCIMENTO (Métricas do Pipeline)
   */
  getEffectivenessMetrics(companyFilter = 'ALL') {
    const list = this.listGrowthOpportunities(companyFilter);
    const identified = list.filter(o => o.pipelineStage === GrowthPipelineStage.IDENTIFIED).length;
    const validated = list.filter(o => o.pipelineStage === GrowthPipelineStage.VALIDATED).length;
    const actionPlanned = list.filter(o => o.pipelineStage === GrowthPipelineStage.ACTION_PLANNED).length;
    const engaged = list.filter(o => o.pipelineStage === GrowthPipelineStage.ENGAGED).length;
    const converted = list.filter(o => o.pipelineStage === GrowthPipelineStage.CONVERTED).length;
    const dismissed = list.filter(o => o.status === GrowthOpportunityStatus.DISMISSED).length;

    const rejectionBreakdown = {};
    list.filter(o => o.status === GrowthOpportunityStatus.DISMISSED).forEach(o => {
      const reason = o.rejectionReason || RejectionReason.OTHER;
      rejectionBreakdown[reason] = (rejectionBreakdown[reason] || 0) + 1;
    });

    return {
      total: list.length,
      identified,
      validated,
      actionPlanned,
      engaged,
      converted,
      dismissed,
      conversionRate: list.length > 0 ? Math.round((converted / list.length) * 100) : 0,
      rejectionBreakdown
    };
  }

  /**
   * 179 a 182. VELLIA GROWTH COPILOT
   * Resposta estruturada obrigatoriamente em:
   * Evidence, Opportunity, Readiness, Risk, Suggested Next Step.
   * REGRA 182: NÃO INVENTAR DEMANDA.
   */
  askGrowthCopilot(query = '', companyFilter = 'ALL') {
    const q = query.toLowerCase();
    const list = this.listGrowthOpportunities(companyFilter);

    // Caso 1: Potencial de Cross-sell
    if (q.includes('cross-sell') || q.includes('clientes atuais') || q.includes('complementares')) {
      const cs = list.find(o => o.type === GrowthOpportunityType.CROSS_SELL && o.status !== GrowthOpportunityStatus.DISMISSED);
      if (!cs) {
        return {
          evidence: 'Base de dados de contratos e histórico de compras consultada sem registros de sinal recente.',
          opportunity: 'Nenhuma oportunidade de cross-sell com evidência factual validada encontrada no momento.',
          readiness: 'Prontidão operacional aguardando surgimento de sinais de demanda.',
          risk: 'Risco de ofertar serviços sem necessidade identificada pelo cliente.',
          suggestedNextStep: 'Acompanhar publicações de Planos de Contratações Anuais (PCA) dos clientes no Radar Antecipado.'
        };
      }
      return {
        evidence: cs.evidence.map(e => `${e.source}: ${e.description}`).join(' | '),
        opportunity: `Sinais de cross-sell de ${cs.targetService} identificados na organização ${cs.targetOrganization}.`,
        readiness: `Aderência Técnica: ${cs.readiness.technicalFit}. Capacidade: ${cs.readiness.capacityStatus}. ${cs.readiness.capacityNotes}`,
        risk: `Nível de Competição: ${cs.attractiveness.competitionLevel}. Não classificar como oportunidade comercial certa antes de validação.`,
        suggestedNextStep: cs.growthPlan?.action || 'Realizar aproximação institucional e verificar término de contratos conexos do cliente.'
      };
    }

    // Caso 2: Onde existe maior potencial de crescimento / expansão
    if (q.includes('onde') || q.includes('maior potencial') || q.includes('crescer') || q.includes('expansão')) {
      const topOpps = this.getTopCockpitOpportunities(companyFilter, 1);
      if (topOpps.length === 0) {
        return {
          evidence: 'Sem sinais ativos suficientes no banco factual.',
          opportunity: 'Não foram geradas recomendações de expansão sem evidência de mercado.',
          readiness: 'Capacidade interna preservada para operações vigentes.',
          risk: 'Expansão sem dados consolidados acarreta custos de mobilização desnecessários.',
          suggestedNextStep: 'Continuar monitoramento de editais e contratações via PNCP e Petronect.'
        };
      }
      const top = topOpps[0];
      return {
        evidence: top.evidence.map(e => e.description).join('; '),
        opportunity: `${top.title} (${top.targetOrganization} em ${top.targetRegion}).`,
        readiness: `Prontidão: ${top.readiness.capacityStatus}. Atestados: ${top.readiness.acervoStatus}.`,
        risk: `Nível de Concorrência: ${top.attractiveness.competitionLevel}. Margem: ${top.attractiveness.marginProfile}.`,
        suggestedNextStep: `Executar o plano de crescimento: "${top.growthPlan?.objective || 'Avaliar capacidade antes de disputas agressivas'}".`
      };
    }

    // Caso 3: Demanda observada com gap de capacidade
    if (q.includes('capacidade') || q.includes('falta capacidade') || q.includes('gap')) {
      const gapOpp = list.find(o => o.readiness?.capacityStatus?.includes('GAP') || o.readiness?.capacityStatus?.includes('LIMITADA'));
      if (gapOpp) {
        return {
          evidence: gapOpp.evidence.map(e => e.description).join('; '),
          opportunity: `Demanda observada relevante em ${gapOpp.targetService} (${gapOpp.targetOrganization}).`,
          readiness: `ALERTA DE GAP: ${gapOpp.readiness.capacityStatus}. ${gapOpp.readiness.capacityNotes}`,
          risk: 'Risco de inexecução ou penalidades contratuais caso entre em disputa sem equipe habilitada e equipamentos próprios.',
          suggestedNextStep: 'Fortalecer capacidade técnica e parcerias estratégicas antes de participar de editais deste segmento.'
        };
      }
    }

    // Resposta padrão factual
    return {
      evidence: `Base factual do Vellia consultada com ${list.length} oportunidades de crescimento mapeadas.`,
      opportunity: 'Oportunidades de crescimento distribuídas entre Cross-sell, Novos Compradores, Expansão Regional e Serviços Adjacentes.',
      readiness: 'Prontidão avaliada individualmente considerando acervo, corpo técnico e logística de campo.',
      risk: 'Evitar dispersão de recursos comerciais em mercados sem evidência prévia de contratação.',
      suggestedNextStep: 'Acessar o módulo "Expansão & Crescimento" para revisar as hipóteses validadas pela Diretoria.'
    };
  }
}

export const growthService = new GrowthService();
export default growthService;
