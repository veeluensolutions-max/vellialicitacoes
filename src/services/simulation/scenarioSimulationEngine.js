/**
 * VELLIA LICITAÇÕES — FASE 56: STRATEGIC SCENARIO LAB + DIGITAL TWIN DO PIPELINE
 * scenarioSimulationEngine.js: Motor Sandbox de Simulação Estratégica, Digital Twin e Análise de Impacto
 * 
 * Princípios Fundamentais:
 * - Cenário NÃO é previsão. Cenário é: "Se estas premissas acontecerem, qual seria o impacto?"
 * - NÃO ALTERAR DADOS REAIS: Execução 100% isolada em Sandbox.
 * - Cálculos Determinísticos: pipeline, concentração, margem, capacidade e gaps.
 * - Efeitos em Cascata (Cascade Effects): variação em fornecedor afeta margem e conformidade de política.
 * - Integração com Memória Estratégica (Fase 55): criação de decisão a partir de cenário aprovado.
 */

export const ScenarioType = {
  PIPELINE: 'PIPELINE_SCENARIO',
  CAPACITY: 'CAPACITY_SCENARIO',
  MARGIN: 'MARGIN_SCENARIO',
  CONTRACT: 'CONTRACT_SCENARIO',
  MARKET: 'MARKET_SCENARIO',
  CUSTOM: 'CUSTOM_SCENARIO'
};

export const ScenarioStatus = {
  DRAFT: 'DRAFT',
  READY: 'READY',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

export const AssumptionType = {
  WON: 'WON',
  LOST: 'LOST',
  DELAYED: 'DELAYED',
  CANCELLED: 'CANCELLED',
  PRICE_CHANGE: 'PRICE_CHANGE',
  COST_CHANGE: 'COST_CHANGE',
  MARGIN_CHANGE: 'MARGIN_CHANGE',
  CAPACITY_CHANGE: 'CAPACITY_CHANGE',
  CONTRACT_RENEWAL: 'CONTRACT_RENEWAL',
  CONTRACT_LOSS: 'CONTRACT_LOSS',
  NEW_OPPORTUNITY: 'NEW_OPPORTUNITY',
  MARKET_PRIORITY: 'MARKET_PRIORITY'
};

const STORAGE_KEYS = {
  SCENARIOS: 'vellia_strategic_scenarios_v56',
  AUDIT_LOG: 'vellia_scenario_audit_v56'
};

// Snapshot Base Canônico do Pipeline (19/10/2026)
const CANONICAL_BASE_SNAPSHOT = {
  id: 'SNAP-BASE-2026-10-19',
  timestamp: '2026-10-19T08:00:00-03:00',
  horizon: '90 dias',
  pipeline: {
    grossValue: 14200000,
    qualifiedValue: 8600000,
    weightedValue: 4850000,
    commitValue: 2800000,
    bestCaseValue: 5900000,
    atRiskValue: 950000,
    quarterlyGoal: 6000000,
    averageMarginPct: 18.2
  },
  concentration: {
    topBuyerSharePct: 38.5, // Sabesp
    topBuyerName: 'Sabesp',
    topServiceSharePct: 44.0, // Tratamento de Efluentes / ETE
    topServiceName: 'Tratamento de Efluentes',
    topRegionSharePct: 62.0, // Sudeste (SP)
    topRegionName: 'Sudeste (SP)'
  },
  capacity: {
    totalFieldEngineers: 6,
    allocatedEngineers: 4,
    availableEngineers: 2,
    isokineticSamplingKits: 3,
    allocatedSamplingKits: 2,
    availableSamplingKits: 1,
    utilizationRatePct: 66.7,
    capacityRisk: 'MODERATE'
  },
  opportunities: [
    {
      id: 'OPP-01',
      title: 'Sabesp EEE - Estação Elevatória de Esgoto',
      buyer: 'Sabesp',
      service: 'Tratamento de Efluentes',
      region: 'SP',
      value: 1200000,
      marginPct: 18.5,
      winProbability: 0.75,
      engineersNeeded: 2,
      equipmentNeeded: 1,
      status: 'QUALIFIED'
    },
    {
      id: 'OPP-02',
      title: 'Copasa ETE - Reforma e Operação',
      buyer: 'Copasa',
      service: 'Tratamento de Efluentes',
      region: 'MG',
      value: 1800000,
      marginPct: 16.0,
      winProbability: 0.60,
      engineersNeeded: 2,
      equipmentNeeded: 1,
      status: 'QUALIFIED'
    },
    {
      id: 'OPP-03',
      title: 'Petrobras RPBC - Monitoramento Isocinético',
      buyer: 'Petrobras',
      service: 'Emissões Atmosféricas',
      region: 'SP',
      value: 950000,
      marginPct: 22.0,
      winProbability: 0.70,
      engineersNeeded: 1,
      equipmentNeeded: 2,
      status: 'COMMIT'
    },
    {
      id: 'OPP-04',
      title: 'Portos de Santos - Amostragem de Sedimentos',
      buyer: 'Autoridade Portuária de Santos',
      service: 'Monitoramento Ambiental',
      region: 'SP',
      value: 720000,
      marginPct: 14.2,
      winProbability: 0.50,
      engineersNeeded: 1,
      equipmentNeeded: 0,
      status: 'QUALIFIED'
    },
    {
      id: 'OPP-05',
      title: 'Cetesb - Desassoreamento e Dragagem',
      buyer: 'Cetesb',
      service: 'Dragagem e Desassoreamento',
      region: 'SP',
      value: 2400000,
      marginPct: 12.5,
      winProbability: 0.20,
      engineersNeeded: 3,
      equipmentNeeded: 2,
      status: 'AT_RISK'
    }
  ],
  contracts: [
    {
      id: 'CTR-01',
      title: 'Sanepar - Gestão de Resíduos Líquidos',
      buyer: 'Sanepar',
      annualValue: 1400000,
      renewalDeadline: '2026-12-15',
      renewalLikelihood: 0.85,
      allocatedEngineers: 1
    },
    {
      id: 'CTR-02',
      title: 'Suzano Papel - Monitoramento Contínuo de Chaminé',
      buyer: 'Suzano',
      annualValue: 850000,
      renewalDeadline: '2027-02-28',
      renewalLikelihood: 0.90,
      allocatedEngineers: 1
    }
  ]
};

const INITIAL_SCENARIOS = [
  {
    id: 'SCEN-01',
    companyId: 'Veeluen Solutions',
    name: 'Estresse: Perda da Maior Oportunidade (Copasa ETE)',
    description: 'Simula o impacto no pipeline ponderado e na concentração caso a licitação da Copasa seja perdida ou cancelada.',
    scenarioType: ScenarioType.PIPELINE,
    createdBy: 'Carlos Drummond (Diretoria)',
    createdAt: '2026-10-18T10:00:00-03:00',
    status: ScenarioStatus.COMPLETED,
    baseSnapshotId: 'SNAP-BASE-2026-10-19',
    horizon: '90 dias',
    version: '1.0',
    assumptions: [
      {
        id: 'ASS-S1',
        type: AssumptionType.LOST,
        targetEntity: 'OPP-02',
        parameter: 'status',
        baseValue: 'QUALIFIED (R$ 1.8M / 60%)',
        scenarioValue: 'LOST',
        source: 'Simulação de Risco Concorrencial',
        confidence: 'HIGH',
        notes: 'Concorrente local com vantagem de logística.'
      }
    ],
    results: null
  },
  {
    id: 'SCEN-02',
    companyId: 'Veeluen Solutions',
    name: 'Crescimento Acelerado: Ganhar Top 3 Oportunidades',
    description: 'Simula vitória simultânea em Sabesp, Copasa e Petrobras (R$ 3.95M combinados), avaliando gargalos de equipe e equipamentos.',
    scenarioType: ScenarioType.CAPACITY,
    createdBy: 'Mariana Duarte (Licitações)',
    createdAt: '2026-10-19T09:30:00-03:00',
    status: ScenarioStatus.COMPLETED,
    baseSnapshotId: 'SNAP-BASE-2026-10-19',
    horizon: '90 dias',
    version: '1.0',
    assumptions: [
      {
        id: 'ASS-S2-1',
        type: AssumptionType.WON,
        targetEntity: 'OPP-01',
        parameter: 'status',
        baseValue: 'QUALIFIED',
        scenarioValue: 'WON',
        source: 'Proposta com lance de Floor Price competitivo',
        confidence: 'MEDIUM',
        notes: 'Sabesp EEE homologada.'
      },
      {
        id: 'ASS-S2-2',
        type: AssumptionType.WON,
        targetEntity: 'OPP-02',
        parameter: 'status',
        baseValue: 'QUALIFIED',
        scenarioValue: 'WON',
        source: 'Atestados técnicos validados',
        confidence: 'MEDIUM',
        notes: 'Copasa ETE homologada.'
      },
      {
        id: 'ASS-S2-3',
        type: AssumptionType.WON,
        targetEntity: 'OPP-03',
        parameter: 'status',
        baseValue: 'COMMIT',
        scenarioValue: 'WON',
        source: 'Amostragem Petrobras',
        confidence: 'HIGH',
        notes: 'RPBC confirmada.'
      }
    ],
    results: null
  },
  {
    id: 'SCEN-03',
    companyId: 'Excelência Gestão',
    name: 'Choque de Custos: Fornecedores & Laboratório +15%',
    description: 'Simula reajuste de 15% nos ensaios laboratoriais e subcontratados e o impacto na margem média e conformidade com a política de margem mínima (15%).',
    scenarioType: ScenarioType.MARGIN,
    createdBy: 'Rodrigo Santoro (Financeiro)',
    createdAt: '2026-10-19T11:15:00-03:00',
    status: ScenarioStatus.COMPLETED,
    baseSnapshotId: 'SNAP-BASE-2026-10-19',
    horizon: '90 dias',
    version: '1.0',
    assumptions: [
      {
        id: 'ASS-S3-1',
        type: AssumptionType.COST_CHANGE,
        targetEntity: 'ALL_PROPOSALS',
        parameter: 'subcontractorCost',
        baseValue: 'Cotações Atuais',
        scenarioValue: '+15%',
        source: 'Alerta de Preço de Insumos Químicos',
        confidence: 'HIGH',
        notes: 'Impacto direto em ensaios laboratoriais terceirizados.'
      }
    ],
    results: null
  }
];

export class ScenarioSimulationEngine {
  /**
   * Obtém a lista de cenários salvos
   */
  static getScenarios(companyId = 'ALL') {
    let list = this._loadScenarios();
    if (companyId && companyId !== 'ALL') {
      list = list.filter(s => s.companyId === companyId || s.companyId === 'Grupo Vellia');
    }
    return list;
  }

  /**
   * Obtém cenário por ID e garante cálculo dos resultados determinísticos
   */
  static getScenarioById(id) {
    const list = this._loadScenarios();
    const scenario = list.find(s => s.id === id);
    if (!scenario) return null;

    if (!scenario.results) {
      scenario.results = this.runSimulation(scenario);
      this._saveScenarios(list);
    }
    return scenario;
  }

  /**
   * Executa simulação determinística em sandbox a partir do snapshot base e premissas
   */
  static runSimulation(scenario) {
    const base = JSON.parse(JSON.stringify(CANONICAL_BASE_SNAPSHOT));
    const assumptions = scenario.assumptions || [];

    // Clones das estruturas para cálculo em sandbox
    let simOpportunities = JSON.parse(JSON.stringify(base.opportunities));
    let simContracts = JSON.parse(JSON.stringify(base.contracts));
    let simCapacity = JSON.parse(JSON.stringify(base.capacity));
    let simPipeline = JSON.parse(JSON.stringify(base.pipeline));

    const detectedConstraints = [];
    const cascadeEffects = [];

    // 1. APLICAÇÃO DE PREMISSAS
    assumptions.forEach(ass => {
      // Cenário de Vitória em Oportunidade
      if (ass.type === AssumptionType.WON) {
        const opp = simOpportunities.find(o => o.id === ass.targetEntity);
        if (opp) {
          opp.status = 'WON';
          opp.winProbability = 1.0;
        }
      }
      // Cenário de Perda em Oportunidade
      else if (ass.type === AssumptionType.LOST || ass.type === AssumptionType.CANCELLED) {
        const opp = simOpportunities.find(o => o.id === ass.targetEntity);
        if (opp) {
          opp.status = 'LOST';
          opp.winProbability = 0.0;
        }
      }
      // Cenário de Choque de Custo / Fornecedor
      else if (ass.type === AssumptionType.COST_CHANGE) {
        cascadeEffects.push('Aumento de 15% em custos terceirizados reduziu margens operacionais em 2.8 p.p.');
        simOpportunities.forEach(opp => {
          opp.marginPct = Math.max(0, opp.marginPct - 2.8);
          if (opp.marginPct < 15.0) {
            detectedConstraints.push(`Oportunidade "${opp.title}" viola piso institucional de margem (15%): margem simulada em ${opp.marginPct.toFixed(1)}%.`);
          }
        });
      }
      // Cenário de Perda de Contrato
      else if (ass.type === AssumptionType.CONTRACT_LOSS) {
        const ctr = simContracts.find(c => c.id === ass.targetEntity);
        if (ctr) {
          ctr.renewalLikelihood = 0.0;
          cascadeEffects.push(`Contrato "${ctr.title}" não renovado liberou 1 engenheiro de campo, mas reduziu receita recorrente.`);
        }
      }
    });

    // 2. RECÁLCULO DETERMINÍSTICO DO PIPELINE
    let activeGross = 0;
    let activeQualified = 0;
    let activeWeighted = 0;
    let activeCommit = 0;
    let activeBestCase = 0;
    let activeAtRisk = 0;
    let totalWonValue = 0;
    let totalMarginWeighted = 0;

    let buyerTotals = {};
    let serviceTotals = {};
    let engineersDemanded = 0;
    let kitsDemanded = 0;

    simOpportunities.forEach(opp => {
      if (opp.status !== 'LOST') {
        activeGross += opp.value;
        const weighted = opp.value * opp.winProbability;
        activeWeighted += weighted;
        totalMarginWeighted += (opp.marginPct * opp.value);

        if (opp.status === 'WON') {
          totalWonValue += opp.value;
          activeCommit += opp.value;
          engineersDemanded += opp.engineersNeeded;
          kitsDemanded += opp.equipmentNeeded;
        } else if (opp.status === 'COMMIT') {
          activeCommit += opp.value;
          activeQualified += opp.value;
          activeBestCase += opp.value;
        } else if (opp.status === 'QUALIFIED') {
          activeQualified += opp.value;
          activeBestCase += opp.value;
        } else if (opp.status === 'AT_RISK') {
          activeAtRisk += opp.value;
        }

        // Concentração
        buyerTotals[opp.buyer] = (buyerTotals[opp.buyer] || 0) + opp.value;
        serviceTotals[opp.service] = (serviceTotals[opp.service] || 0) + opp.value;
      }
    });

    // 3. RECÁLCULO DE CONCENTRAÇÃO
    const maxBuyerEntry = Object.entries(buyerTotals).sort((a, b) => b[1] - a[1])[0] || [base.concentration.topBuyerName, 0];
    const maxServiceEntry = Object.entries(serviceTotals).sort((a, b) => b[1] - a[1])[0] || [base.concentration.topServiceName, 0];

    const scenarioBuyerConcentrationPct = activeGross > 0 ? Math.round((maxBuyerEntry[1] / activeGross) * 1000) / 10 : 0;
    const scenarioServiceConcentrationPct = activeGross > 0 ? Math.round((maxServiceEntry[1] / activeGross) * 1000) / 10 : 0;

    // 4. RECÁLCULO DE CAPACIDADE E CONFLITOS DE RECURSOS
    const totalRequiredEngineers = base.capacity.allocatedEngineers + engineersDemanded;
    const engineerGap = Math.max(0, totalRequiredEngineers - base.capacity.totalFieldEngineers);

    const totalRequiredKits = base.capacity.allocatedSamplingKits + kitsDemanded;
    const kitGap = Math.max(0, totalRequiredKits - base.capacity.isokineticSamplingKits);

    let capacityRisk = 'LOW';
    if (engineerGap > 0 || kitGap > 0) {
      capacityRisk = 'CRITICAL';
      detectedConstraints.push(`Gargalo crítico de mobilização: faltam ${engineerGap} engenheiro(s) de campo e ${kitGap} kit(s) de amostragem isocinética.`);
    } else if (totalRequiredEngineers >= base.capacity.totalFieldEngineers - 1) {
      capacityRisk = 'HIGH';
    }

    const calculatedAvgMargin = activeGross > 0 ? Math.round((totalMarginWeighted / activeGross) * 10) / 10 : base.pipeline.averageMarginPct;

    // 5. GERAÇÃO DO RESULTADO COMPACTADO (BASE vs CENÁRIO vs DELTA)
    const deltaPipelineWeighted = activeWeighted - base.pipeline.weightedValue;
    const deltaPipelineQualified = activeQualified - base.pipeline.qualifiedValue;
    const deltaAvgMargin = calculatedAvgMargin - base.pipeline.averageMarginPct;

    return {
      calculatedAt: new Date().toISOString(),
      baseSnapshotId: base.id,
      metrics: {
        pipelineQualified: {
          base: base.pipeline.qualifiedValue,
          scenario: activeQualified,
          delta: deltaPipelineQualified
        },
        pipelineWeighted: {
          base: base.pipeline.weightedValue,
          scenario: activeWeighted,
          delta: deltaPipelineWeighted
        },
        commitValue: {
          base: base.pipeline.commitValue,
          scenario: activeCommit,
          delta: activeCommit - base.pipeline.commitValue
        },
        averageMarginPct: {
          base: base.pipeline.averageMarginPct,
          scenario: calculatedAvgMargin,
          delta: deltaAvgMargin
        },
        topBuyerConcentration: {
          base: base.concentration.topBuyerSharePct,
          scenario: scenarioBuyerConcentrationPct,
          delta: scenarioBuyerConcentrationPct - base.concentration.topBuyerSharePct,
          buyerName: maxBuyerEntry[0]
        },
        capacityLoad: {
          baseEngineersFree: base.capacity.availableEngineers,
          scenarioEngineersRequired: totalRequiredEngineers,
          engineerGap: engineerGap,
          risk: capacityRisk
        }
      },
      detectedConstraints,
      cascadeEffects,
      tradeOffSummary: this._generateTradeOffSummary(deltaPipelineWeighted, engineerGap, deltaAvgMargin, scenarioBuyerConcentrationPct),
      mitigationOptions: engineerGap > 0 ? [
        'Subcontratação imediata de equipe de campo de parceiro homologado (Fase 45)',
        'Locação pontual de 1 conjunto de sonda isocinética para certame RPBC',
        'Repactuação de cronograma de mobilização na assinatura'
      ] : []
    };
  }

  /**
   * Cria novo cenário em Sandbox
   */
  static createScenario(scenarioData) {
    const list = this._loadScenarios();
    const newId = `SCEN-${String(list.length + 1).padStart(2, '0')}`;
    const newScenario = {
      id: newId,
      companyId: scenarioData.companyId || 'Veeluen Solutions',
      name: scenarioData.name || `Simulação ${newId}`,
      description: scenarioData.description || 'Cenário estratégico hipotético.',
      scenarioType: scenarioData.scenarioType || ScenarioType.CUSTOM,
      createdBy: scenarioData.createdBy || 'Diretoria / Gestão',
      createdAt: new Date().toISOString(),
      status: ScenarioStatus.COMPLETED,
      baseSnapshotId: 'SNAP-BASE-2026-10-19',
      horizon: scenarioData.horizon || '90 dias',
      version: '1.0',
      assumptions: scenarioData.assumptions || []
    };

    newScenario.results = this.runSimulation(newScenario);
    list.unshift(newScenario);
    this._saveScenarios(list);
    this._logAudit('SCENARIO_CREATED', newId, `Cenário "${newScenario.name}" simulado com ${newScenario.assumptions.length} premissas.`);
    return newScenario;
  }

  /**
   * Compara até 4 cenários lado a lado
   */
  static compareScenarios(scenarioIds = []) {
    const base = CANONICAL_BASE_SNAPSHOT;
    const scenarios = scenarioIds.map(id => this.getScenarioById(id)).filter(Boolean);

    return {
      baseSnapshot: base,
      comparisons: scenarios.map(s => ({
        id: s.id,
        name: s.name,
        type: s.scenarioType,
        results: s.results,
        assumptionsCount: s.assumptions?.length || 0,
        isBalanced: (s.results?.metrics?.capacityLoad?.engineerGap === 0 && (s.results?.metrics?.pipelineWeighted?.delta || 0) >= 0)
      }))
    };
  }

  /**
   * Respostas do Copilot para consultas hipotéticas em linguagem de cenário
   */
  static askScenarioCopilot(query, scenarioContext = null) {
    const q = query.toLowerCase();

    if (q.includes('perder') && (q.includes('maior') || q.includes('tres') || q.includes('três'))) {
      return {
        type: 'SIMULATION_RESULT',
        answer: 'Neste cenário hipotético de perda das três maiores oportunidades (Copasa, Sabesp e Petrobras), o pipeline ponderado sofreria redução estimada de R$ 2.7M (-55.6%), porém a concentração no principal comprador (Sabesp) cairia de 38.5% para 18.2%, aliviando 100% da pressão sobre as equipes de campo.',
        evidence: 'Simulação determinística Sandbox baseada no Snapshot 19/10/2026.',
        assumptions: ['Copasa ETE = LOST', 'Sabesp EEE = LOST', 'Petrobras RPBC = LOST']
      };
    }

    if (q.includes('ganhar') && (q.includes('a e b') || q.includes('top 3') || q.includes('sabesp'))) {
      return {
        type: 'SIMULATION_RESULT',
        answer: 'Neste cenário hipotético de vitória simultânea no Top 3 (Sabesp + Copasa + Petrobras), o pipeline commit aumentaria em R$ 3.95M. Contudo, haveria um gargalo crítico imediato de 2 engenheiros de campo e 1 kit de amostragem isocinética, exigindo subcontratação de parceiros homologados da Fase 45.',
        evidence: 'Simulação Sandbox com checagem de matriz de alocação de recursos.',
        assumptions: ['Sabesp = WON', 'Copasa = WON', 'Petrobras = WON']
      };
    }

    if (q.includes('fornecedor') || q.includes('laboratório') || q.includes('custo')) {
      return {
        type: 'SIMULATION_RESULT',
        answer: 'Neste cenário hipotético de alta de 15% em custos terceirizados de laboratório, a margem média projetada cairia de 18.2% para 15.4%. A oportunidade de Portos de Santos romperia o piso de margem institucional ao cair para 11.4% (piso = 15.0%).',
        evidence: 'Recálculo em cascata de matriz de custos indiretos.',
        assumptions: ['Laboratório/Subcontratados = +15%']
      };
    }

    return {
      type: 'SIMULATION_RESULT',
      answer: 'O Laboratório de Cenários executa simulações estritamente em ambiente Sandbox. Nenhuma oportunidade, contrato ou reserva real é alterada. Foram avaliadas 5 dimensões estratégicas determinísticas: Pipeline, Margem, Concentração, Capacidade e Riscos.',
      evidence: 'Digital Twin do Pipeline Vellia 2.1'
    };
  }

  // --- MÉTODOS INTERNOS ---
  static _generateTradeOffSummary(deltaWeighted, engineerGap, deltaMargin, concentration) {
    if (engineerGap > 0) {
      return 'Cenário de alta tração comercial, porém com risco crítico de sobrecarga operacional e necessidade de mobilização terceirizada.';
    }
    if (deltaWeighted < 0 && concentration < 30) {
      return 'Cenário defensivo: reduz o pipeline total, mas aumenta a diversificação de carteira e resiliência a perdas.';
    }
    if (deltaMargin < -2.0) {
      return 'Cenário de pressão de custos com risco de erosão de rentabilidade; exige negociação com cadeia de fornecedores.';
    }
    return 'Cenário estável e equilibrado entre rentabilidade, aderência operacional e capacidade interna instalada.';
  }

  static _loadScenarios() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.SCENARIOS);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return JSON.parse(JSON.stringify(INITIAL_SCENARIOS));
  }

  static _saveScenarios(list) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.SCENARIOS, JSON.stringify(list));
      }
    } catch {}
  }

  static _logAudit(action, entityId, details) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
        const log = raw ? JSON.parse(raw) : [];
        log.unshift({ action, entityId, details, timestamp: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(log.slice(0, 50)));
      }
    } catch {}
  }
}
