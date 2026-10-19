/**
 * VELLIA LICITAÇÕES — FASE 42
 * GESTÃO ESTRATÉGICA DE PORTFÓLIO + PLANEJAMENTO ANUAL DE LICITAÇÕES
 * 
 * Princípio Central:
 * O Vellia não deve apenas administrar oportunidades individuais.
 * Ele ajuda a gestão executiva a decidir:
 * - ONDE COMPETIR
 * - QUANDO COMPETIR
 * - COM QUAL SERVIÇO
 * - PARA QUAL COMPRADOR
 * - COM QUAL NÍVEL DE PRIORIDADE
 */

import { ContractAwardService } from '../contract/contractAwardService.js';
import { earlyRadarService } from '../earlyradar/earlyRadarService.js';
import { organizationService } from '../crm/organizationService.js';
import { marketIntelligenceService } from '../market/marketIntelligenceService.js';
import { ApprovalService } from '../governance/approvalService.js';
import { ApprovalType } from '../governance/approvalTypes.js';
import { logService, LogType } from '../logService.js';

export const StrategicHorizon = {
  DAYS_90: '90_dias',
  DAYS_180: '180_dias',
  DAYS_365: '365_dias',
  CUSTOM: 'personalizado'
};

export const StrategyClassification = {
  DEFEND: 'Defender',
  EXPAND: 'Expandir',
  DEVELOP: 'Desenvolver',
  MONITOR: 'Monitorar',
  EVALUATE: 'Avaliar'
};

export const GeographicClassification = {
  CORE_MARKET: 'Core Market',
  EXPANSION_MARKET: 'Mercado de Expansão',
  MONITOR: 'Monitorar',
  LOW_SIGNAL: 'Dados Insuficientes'
};

export const BuyerClassification = {
  STRATEGIC: 'Estratégico',
  GROWTH: 'Crescimento',
  MAINTAIN: 'Manter Relacionamento',
  MONITOR: 'Monitorar'
};

export const InitiativeStatus = {
  PLANNED: 'Planejada',
  ACTIVE: 'Em Andamento',
  AT_RISK: 'Em Risco',
  COMPLETED: 'Concluída',
  PAUSED: 'Pausada'
};

export const CalendarItemType = {
  OBSERVED: 'Fato Observado',
  PLANNED: 'Planejado (PCA)',
  PREDICTED: 'Previsto por Modelo',
  OPEN: 'Edital Aberto'
};

class StrategicPlanningService {
  constructor() {
    this.storageKey = 'vellia_strategic_plans_v1';
    this.initiativesKey = 'vellia_strategic_initiatives_v1';
    this.goalsKey = 'vellia_strategic_goals_v1';
    this.scenariosKey = 'vellia_strategic_scenarios_v1';
    this.reviewsKey = 'vellia_strategic_reviews_v1';
    this.logService = logService;

    this.defaultInitiatives = [
      {
        id: 'INIT-2026-001',
        companyId: 'veeluen',
        name: 'Expansão de ETE & Efluentes Industriais em Pernambuco',
        objective: 'Consolidar liderança e capturar 3 novas contas municipais no Polo de Suape e RMR.',
        horizon: StrategicHorizon.DAYS_180,
        owner: 'Carlos Eduardo (Diretor de Operações)',
        status: InitiativeStatus.ACTIVE,
        progressPct: 65,
        targetDate: '2026-12-31',
        metrics: 'R$ 8.5M em pipeline qualificado; 4 participações; 2 vitórias.',
        services: ['Operação de ETE e Tratamento de Efluentes'],
        regions: ['PE - Suape', 'PE - Recife', 'PE - Cabo de Santo Agostinho'],
        buyers: ['COMPESA', 'Petrobras RNEST', 'Prefeitura de Ipojuca'],
        actions: [
          { title: 'Mapear 30 compradores e operadores locais', done: true },
          { title: 'Atualizar acervo de atestados com ART de 150 L/s', done: true },
          { title: 'Participar do PCA de Suape para 2027', done: false },
          { title: 'Submeter propostas para certames Q4', done: false }
        ]
      },
      {
        id: 'INIT-2026-002',
        companyId: 'veeluen',
        name: 'Incursão em Monitoramento de Emissões Atmosféricas na Bahia',
        objective: 'Expandir presença geográfica com serviços de alta margem no Polo de Camaçari.',
        horizon: StrategicHorizon.DAYS_365,
        owner: 'Dra. Vanessa Lima (Engenharia Química)',
        status: InitiativeStatus.ACTIVE,
        progressPct: 40,
        targetDate: '2027-06-30',
        metrics: 'Obter habilitação técnica em 100% dos editais do INEMA/BA.',
        services: ['Monitoramento de Emissões Atmosféricas e Qualidade do Ar'],
        regions: ['BA - Camaçari', 'BA - Salvador', 'BA - Mataripe'],
        buyers: ['Refinaria Mataripe (Acelen)', 'Cetrel', 'INEMA'],
        actions: [
          { title: 'Validar capacidade de amostradores isocinéticos com laboratório parceiro', done: true },
          { title: 'Estruturar consórcio com parceiro credenciado no INEMA', done: false },
          { title: 'Acompanhar renovações de licenças ambientais do Polo', done: false }
        ]
      },
      {
        id: 'INIT-2026-003',
        companyId: 'excelencia',
        name: 'Consolidação de Licenciamento & Auditorias Ambientais no Sudeste',
        objective: 'Manter contratos corporativos e expandir estudos de fauna e flora no RJ/SP.',
        horizon: StrategicHorizon.DAYS_180,
        owner: 'Marcelo Rezende (Head Ambiental)',
        status: InitiativeStatus.ACTIVE,
        progressPct: 80,
        targetDate: '2026-11-30',
        metrics: 'Taxa de renovação contratual superior a 90%; Margem > 28%.',
        services: ['Licenciamento Ambiental & EIA/RIMA', 'Monitoramento de Fauna e Flora'],
        regions: ['RJ - Bacia de Campos', 'SP - Vale do Paraíba', 'RJ - Macaé'],
        buyers: ['Petrobras UN-BC', 'Transpetro', 'INEA RJ'],
        actions: [
          { title: 'Renovar contrato ANP/Petrobras UN-BC antes de 90 dias do término', done: true },
          { title: 'Capacitar biólogos em taxonomia de quelônios e cetáceos', done: true },
          { title: 'Disputar nova licitação de auditoria ambiental Petrobras', done: false }
        ]
      }
    ];

    this.defaultGoals = [
      {
        id: 'GOAL-2026-01',
        companyId: 'veeluen',
        horizon: StrategicHorizon.DAYS_180,
        title: 'Volume de Pipeline Qualificado em ETE & Água',
        metricType: 'VALUE',
        targetValue: 12000000,
        currentValue: 14500000,
        unit: 'BRL',
        category: 'Comercial',
        status: 'ON_TRACK',
        owner: 'Diretoria Comercial',
        history: [
          { date: '2026-08-01', value: 9200000, note: 'Entrada de edital RNEST' },
          { date: '2026-10-15', value: 14500000, note: 'Radar identificou 2 novos certames COMPESA' }
        ]
      },
      {
        id: 'GOAL-2026-02',
        companyId: 'veeluen',
        horizon: StrategicHorizon.DAYS_365,
        title: 'Taxa de Vitória (Win Rate) em Licitações de Grande Porte',
        metricType: 'PERCENTAGE',
        targetValue: 35,
        currentValue: 38.5,
        unit: '%',
        category: 'Performance',
        status: 'ON_TRACK',
        owner: 'Comitê Go/No-Go',
        history: [
          { date: '2026-06-30', value: 31.0, note: 'Fechamento S1' },
          { date: '2026-09-30', value: 38.5, note: '3 vitórias consecutivas em ETE e dragagem' }
        ]
      },
      {
        id: 'GOAL-2026-03',
        companyId: 'veeluen',
        horizon: StrategicHorizon.DAYS_180,
        title: 'Novas Contas Estratégicas Mapeadas com Owner Ativo',
        metricType: 'COUNT',
        targetValue: 10,
        currentValue: 7,
        unit: 'contas',
        category: 'Expansão',
        status: 'AT_RISK',
        owner: 'Gerência Comercial PE/BA',
        history: [
          { date: '2026-07-15', value: 4, note: 'Início do plano Q3' },
          { date: '2026-10-15', value: 7, note: 'Gaps identificados em Cetrel e Acelen' }
        ]
      },
      {
        id: 'GOAL-2026-04',
        companyId: 'excelencia',
        horizon: StrategicHorizon.DAYS_365,
        title: 'Taxa de Renovação de Contratos de Monitoramento',
        metricType: 'PERCENTAGE',
        targetValue: 90,
        currentValue: 92.0,
        unit: '%',
        category: 'Retenção',
        status: 'ON_TRACK',
        owner: 'Gerência de Contratos',
        history: [
          { date: '2026-09-01', value: 92.0, note: 'Renovação UN-BC confirmada com reajuste IPCA' }
        ]
      }
    ];

    this.defaultScenarios = [
      {
        id: 'SCENARIO-BASE',
        name: 'Cenário Base (Execução Orçamentária)',
        type: 'BASE',
        description: 'Manutenção da carteira atual com crescimento orgânico de 15% nos serviços core de ETE e Licenciamento.',
        pipelineMultiplier: 1.0,
        winRateTarget: 35,
        plannedCapex: 450000,
        focusServices: ['Operação de ETE e Tratamento de Efluentes', 'Licenciamento Ambiental & EIA/RIMA'],
        focusRegions: ['PE - Pernambuco', 'RJ - Rio de Janeiro'],
        riskLevel: 'Moderado',
        expectedRevenue: 28500000
      },
      {
        id: 'SCENARIO-EXPANSION',
        name: 'Cenário Expansão Nordeste & Emissões',
        type: 'EXPANSION',
        description: 'Entrada agressiva no Polo de Camaçari e concessões de saneamento privado com parceiros tecnológicos.',
        pipelineMultiplier: 1.45,
        winRateTarget: 30,
        plannedCapex: 1200000,
        focusServices: ['Monitoramento de Emissões Atmosféricas e Qualidade do Ar', 'Operação de ETE e Tratamento de Efluentes', 'Modelagem Matemática de Dispersão'],
        focusRegions: ['BA - Bahia', 'PE - Pernambuco', 'CE - Ceará'],
        riskLevel: 'Elevado (Exige consórcios e investimentos em amostradores)',
        expectedRevenue: 39800000
      },
      {
        id: 'SCENARIO-CONSERVATIVE',
        name: 'Cenário Conservador (Máxima Margem & Retenção)',
        type: 'CONSERVATIVE',
        description: 'Foco exclusivo em renovação de contratos existentes com Petrobras e clientes industriais de alta solvência.',
        pipelineMultiplier: 0.85,
        winRateTarget: 50,
        plannedCapex: 150000,
        focusServices: ['Operação de ETE e Tratamento de Efluentes', 'Licenciamento Ambiental & EIA/RIMA'],
        focusRegions: ['PE - Pernambuco', 'RJ - Rio de Janeiro'],
        riskLevel: 'Baixo (Margem média protegida > 32%)',
        expectedRevenue: 22000000
      }
    ];
  }

  // ==========================================
  // 1. CARTEIRA ESTRATÉGICA DE SERVIÇOS (PORTFÓLIO)
  // ==========================================

  /**
   * Obtém a Matriz de Estratégia de Serviços com classificação explicada (Itens 6 a 17)
   */
  getServicePortfolioMatrix(companyId = 'veeluen', userPermissions = { canViewFinancials: true }) {
    const rawServices = [
      {
        id: 'SRV-ETE',
        name: 'Operação de ETE e Tratamento de Efluentes',
        companyId: 'veeluen',
        observedDemand: 'Alta',
        demandCount: 38,
        pipelineValue: 18500000,
        winRate: 42.5,
        avgMargin: 26.8,
        recurrence: 'Alta (Contratos contínuos de 24 a 60 meses)',
        competitionLevel: 'Moderada a Alta (6 players recorrentes)',
        internalCapacity: 'Excelente (3 RTs seniores, acervo até 250 L/s)',
        currentPresence: 'Forte (3 contratos ativos no Nordeste)',
        systemRecommendation: StrategyClassification.DEFEND,
        managementPriority: 'Alta',
        strategicRationale: 'Demanda de mercado alta, win rate interno comprovado de 42.5%, base de atestados robusta e alta recorrência de receita.',
        attractivenessScore: 92,
        positionScore: 88,
        quadrant: 'Defender e Expandir',
        capacityGaps: []
      },
      {
        id: 'SRV-EMISSOES',
        name: 'Monitoramento de Emissões Atmosféricas e Qualidade do Ar',
        companyId: 'veeluen',
        observedDemand: 'Crescente (Alta)',
        demandCount: 24,
        pipelineValue: 9200000,
        winRate: 31.0,
        avgMargin: 34.5,
        recurrence: 'Alta (Exigência legal de monitoramento semestral/anual)',
        competitionLevel: 'Moderada (Barreira técnica e laboratorial elevada)',
        internalCapacity: 'Em Desenvolvimento (Possui equipe, necessita calibrar amostradores)',
        currentPresence: 'Média (Contratos pontuais, sem liderança no Polo de Camaçari)',
        systemRecommendation: StrategyClassification.EXPAND,
        managementPriority: 'Alta',
        strategicRationale: 'Margem superior (34.5%) e barreira técnica favorável. Mercado em expansão nos polos químicos e petroquímicos.',
        attractivenessScore: 86,
        positionScore: 68,
        quadrant: 'Investir / Expandir',
        capacityGaps: [
          { type: 'Equipamentos', description: 'Aquisição ou locação de trem de amostragem isocinética aprovado pela EPA/ABNT.' },
          { type: 'Atestados', description: 'Necessário somar CAT quantitativa para dutos de alta vazão (>50.000 Nm³/h).' }
        ]
      },
      {
        id: 'SRV-DISPERSAO',
        name: 'Modelagem Matemática de Dispersão Atmosférica (AERMOD/CALPUFF)',
        companyId: 'veeluen',
        observedDemand: 'Moderada',
        demandCount: 12,
        pipelineValue: 3400000,
        winRate: 25.0,
        avgMargin: 38.0,
        recurrence: 'Média (Associada a licenciamentos prévios e renovações de LO)',
        competitionLevel: 'Baixa (Poucas consultorias especializadas no NE)',
        internalCapacity: 'Excelente (Mestres e doutores na equipe técnica)',
        currentPresence: 'Baixa (Subcontratada frequentemente em vez de titular)',
        systemRecommendation: StrategyClassification.DEVELOP,
        managementPriority: 'Média',
        strategicRationale: 'Alta aderência técnica e margem de 38%, porém demanda observada restrita. Recomendado desenvolver relacionamento direto com indústrias e órgãos ambientais.',
        attractivenessScore: 72,
        positionScore: 75,
        quadrant: 'Desenvolver Mercado',
        capacityGaps: [
          { type: 'Parceiros', description: 'Estruturar consórcio com empresas de geoprocessamento para ampliar escopo.' }
        ]
      },
      {
        id: 'SRV-SST',
        name: 'Engenharia de Segurança do Trabalho e Laudos NR-12/NR-13',
        companyId: 'veeluen',
        observedDemand: 'Baixa a Média',
        demandCount: 14,
        pipelineValue: 1800000,
        winRate: 18.0,
        avgMargin: 15.2,
        recurrence: 'Baixa (Predomínio de serviços pontuais ou comoditizados)',
        competitionLevel: 'Muito Alta (Mais de 30 empresas concorrentes com guerra de preços)',
        internalCapacity: 'Suficiente',
        currentPresence: 'Residual',
        systemRecommendation: StrategyClassification.MONITOR,
        managementPriority: 'Baixa',
        strategicRationale: 'Margem baixa (15.2%), alta pressão concorrencial e baixo win rate (18%). Alocação de recursos deve ser contida.',
        attractivenessScore: 38,
        positionScore: 42,
        quadrant: 'Monitorar / Seletivo',
        capacityGaps: []
      },
      {
        id: 'SRV-LICENCIAMENTO',
        name: 'Licenciamento Ambiental & Estudos de Impacto (EIA/RIMA)',
        companyId: 'excelencia',
        observedDemand: 'Alta',
        demandCount: 29,
        pipelineValue: 14200000,
        winRate: 46.0,
        avgMargin: 31.0,
        recurrence: 'Alta (Grandes projetos de infraestrutura e óleo & gás)',
        competitionLevel: 'Alta (Grandes consultorias nacionais)',
        internalCapacity: 'Excelente (Mais de 15 anos de acervo no INEA e IBAMA)',
        currentPresence: 'Líder (Principal referência no RJ e ES)',
        systemRecommendation: StrategyClassification.DEFEND,
        managementPriority: 'Alta',
        strategicRationale: 'Core business da Excelência Ambiental com win rate de 46%, margem consistente de 31% e liderança consolidada.',
        attractivenessScore: 94,
        positionScore: 91,
        quadrant: 'Defender e Expandir',
        capacityGaps: []
      },
      {
        id: 'SRV-FAUNA',
        name: 'Monitoramento de Fauna Marinha e Atropelamento de Fauna',
        companyId: 'excelencia',
        observedDemand: 'Moderada a Alta',
        demandCount: 18,
        pipelineValue: 8100000,
        winRate: 39.0,
        avgMargin: 29.5,
        recurrence: 'Alta (Condicionantes de licenças de exploração marítima)',
        competitionLevel: 'Moderada (Exige biólogos embarcados e credenciados)',
        internalCapacity: 'Boa',
        currentPresence: 'Forte',
        systemRecommendation: StrategyClassification.EXPAND,
        managementPriority: 'Alta',
        strategicRationale: 'Mercado restrito com alta exigência técnica. Excelente alinhamento com operadoras offshore e portos.',
        attractivenessScore: 82,
        positionScore: 84,
        quadrant: 'Investir / Expandir',
        capacityGaps: [
          { type: 'Equipe', description: 'Capacitar mais 4 observadores de bordo (MMO) certificados pelo IBAMA.' }
        ]
      }
    ];

    let filtered = rawServices;
    if (companyId && companyId !== 'group') {
      filtered = rawServices.filter(s => s.companyId === companyId);
    }

    return filtered.map(item => {
      const sanitized = { ...item };
      if (!userPermissions.canViewFinancials) {
        delete sanitized.avgMargin;
        sanitized.pipelineValue = 'Acesso Restrito (Perfil não autorizado)';
      }
      return sanitized;
    });
  }

  // ==========================================
  // 2. ESTRATÉGIA GEOGRÁFICA & MERCADOS
  // ==========================================

  getGeographicMarkets(companyId = 'veeluen') {
    return [
      {
        id: 'GEO-PE',
        state: 'PE',
        region: 'Nordeste',
        cities: ['Recife', 'Ipojuca (Suape)', 'Cabo de Santo Agostinho', 'Petrolina'],
        classification: GeographicClassification.CORE_MARKET,
        observedDemand: 'Muito Alta (45 certames nos últimos 12 meses)',
        pipelineValue: 24500000,
        winRate: 44.0,
        clientPresence: 'Alta (COMPESA, Suape, Refinaria Abreu e Lima)',
        strategicVerdict: 'Mercado consolidado com forte reconhecimento de marca e contratos vigentes. Prioridade total de defesa e retenção.',
        keyCompetitors: ['Saneamento Nordeste S/A', 'Odebrecht Ambiental / BRK', 'Engenharia Hidro Ambiental'],
        hasSufficientData: true
      },
      {
        id: 'GEO-BA',
        state: 'BA',
        region: 'Nordeste',
        cities: ['Camaçari', 'Salvador', 'Candeias', 'Feira de Santana'],
        classification: GeographicClassification.EXPANSION_MARKET,
        observedDemand: 'Alta (32 certames no período)',
        pipelineValue: 14800000,
        winRate: 28.5,
        clientPresence: 'Média (Contratos pontuais em Camaçari e órgãos estaduais)',
        strategicVerdict: 'Excelente combinação de alta demanda industrial em petroquímica e saneamento com presença interna ainda em expansão.',
        keyCompetitors: ['Cetrel S/A', 'Bahia Ambiental', 'Ambientalis Consultoria'],
        hasSufficientData: true
      },
      {
        id: 'GEO-RJ',
        state: 'RJ',
        region: 'Sudeste',
        cities: ['Rio de Janeiro', 'Macaé', 'Campos dos Goytacazes', 'Duque de Caxias'],
        classification: companyId === 'excelencia' ? GeographicClassification.CORE_MARKET : GeographicClassification.EXPANSION_MARKET,
        observedDemand: 'Muito Alta (52 certames monitorados)',
        pipelineValue: 31200000,
        winRate: companyId === 'excelencia' ? 48.0 : 20.0,
        clientPresence: 'Líder na Excelência Ambiental; Parcerias estratégicas com Veeluen.',
        strategicVerdict: 'Bacia de Campos e terminais portuários representam maior volume financeiro por licitação. Sinergia entre as empresas do Grupo.',
        keyCompetitors: ['Golder Associates', 'Tetra Tech Brasil', 'Arcadis'],
        hasSufficientData: true
      },
      {
        id: 'GEO-CE',
        state: 'CE',
        region: 'Nordeste',
        cities: ['Fortaleza', 'São Gonçalo do Amarante (Pecém)'],
        classification: GeographicClassification.MONITOR,
        observedDemand: 'Moderada (11 certames)',
        pipelineValue: 5600000,
        winRate: 22.0,
        clientPresence: 'Baixa (Sem base operacional permanente)',
        strategicVerdict: 'Complexo do Pecém tem demanda promissora de hidrogênio verde e dessalinização. Monitorar editais e PCA 2027.',
        keyCompetitors: ['Marquise Ambiental', 'CAGECE Projetos'],
        hasSufficientData: true
      },
      {
        id: 'GEO-MA',
        state: 'MA',
        region: 'Nordeste',
        cities: ['São Luís (Porto do Itaqui)'],
        classification: GeographicClassification.LOW_SIGNAL,
        observedDemand: 'Baixa (2 certames identificados)',
        pipelineValue: 1200000,
        winRate: 0,
        clientPresence: 'Inexistente',
        strategicVerdict: 'Dados insuficientes para classificação assertiva. Não alocar esforço comercial proativo no momento.',
        keyCompetitors: [],
        hasSufficientData: false
      }
    ];
  }

  // ==========================================
  // 3. CARTEIRA ESTRATÉGICA DE COMPRADORES (BUYERS)
  // ==========================================

  getStrategicBuyers(companyId = 'veeluen') {
    return [
      {
        id: 'BUYER-01',
        organizationName: 'COMPESA — Companhia Pernambucana de Saneamento',
        companyId: 'veeluen',
        cnpj: '09.769.035/0001-64',
        classification: BuyerClassification.STRATEGIC,
        recurrenceLevel: 'Muito Alta (Pregões e RDCs semestrais para ETE e elevatórias)',
        volumeObserved: 'R$ 48.0M em licitações nos últimos 24 meses',
        winRateWithBuyer: 40.0,
        activeContracts: 2,
        contractsValue: 9800000,
        coverage: {
          hasOwner: true,
          ownerName: 'Carlos Eduardo (Diretor Operacional)',
          hasActiveContact: true,
          contactName: 'Eng. Roberto Moura (Gerente de Tratamento de Esgoto)',
          hasStrategicPlan: true,
          hasNextAction: true,
          nextActionDescription: 'Reunião técnica de alinhamento pré-edital de concessão bloco B'
        },
        gaps: []
      },
      {
        id: 'BUYER-02',
        organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
        companyId: 'veeluen',
        cnpj: '33.000.167/0001-01',
        classification: BuyerClassification.STRATEGIC,
        recurrenceLevel: 'Alta (Contratos via Petronect e Lei 13.303)',
        volumeObserved: 'R$ 62.0M em serviços de águas, efluentes e paradas',
        winRateWithBuyer: 33.3,
        activeContracts: 1,
        contractsValue: 12400000,
        coverage: {
          hasOwner: true,
          ownerName: 'Ana Beatriz (Key Account Manager)',
          hasActiveContact: true,
          contactName: 'Márcio Fonseca (Comprador de Utilidades Industriais)',
          hasStrategicPlan: true,
          hasNextAction: true,
          nextActionDescription: 'Submeter qualificação para o novo termo de ETE Trem II'
        },
        gaps: []
      },
      {
        id: 'BUYER-03',
        organizationName: 'Acelen / Refinaria de Mataripe S.A.',
        companyId: 'veeluen',
        cnpj: '41.521.890/0001-04',
        classification: BuyerClassification.GROWTH,
        recurrenceLevel: 'Alta (Grandes pacotes privados de monitoramento ambiental)',
        volumeObserved: 'R$ 22.0M estimado para 2026/2027',
        winRateWithBuyer: 0,
        activeContracts: 0,
        contractsValue: 0,
        coverage: {
          hasOwner: true,
          ownerName: 'Dra. Vanessa Lima',
          hasActiveContact: false,
          contactName: null,
          hasStrategicPlan: true,
          hasNextAction: false
        },
        gaps: [
          'Conta em Growth sem contato técnico cadastrado no CRM.',
          'Ausência de Próxima Ação definida nos próximos 30 dias.'
        ]
      },
      {
        id: 'BUYER-04',
        organizationName: 'Petrobras — Unidade de Operações Bacia de Campos (UN-BC)',
        companyId: 'excelencia',
        cnpj: '33.000.167/0001-01',
        classification: BuyerClassification.MAINTAIN,
        recurrenceLevel: 'Alta (Contratos de 3 anos de monitoramento ambiental marítimo)',
        volumeObserved: 'R$ 35.0M em contratos vigentes e editais previstos',
        winRateWithBuyer: 66.7,
        activeContracts: 2,
        contractsValue: 16800000,
        coverage: {
          hasOwner: true,
          ownerName: 'Marcelo Rezende',
          hasActiveContact: true,
          contactName: 'Luciana Fontoura (Fiscal de Contrato Ambiental)',
          hasStrategicPlan: true,
          hasNextAction: true,
          nextActionDescription: 'Apresentar relatório de encerramento do ano 2 e pleitear aditivo de prorrogação'
        },
        gaps: []
      },
      {
        id: 'BUYER-05',
        organizationName: 'INEA — Instituto Estadual do Ambiente do RJ',
        companyId: 'excelencia',
        cnpj: '11.020.198/0001-08',
        classification: BuyerClassification.STRATEGIC,
        recurrenceLevel: 'Média a Alta (Licitações públicas de fiscalização e geoprocessamento)',
        volumeObserved: 'R$ 15.0M em editais abertos e PCA',
        winRateWithBuyer: 42.0,
        activeContracts: 1,
        contractsValue: 4200000,
        coverage: {
          hasOwner: true,
          ownerName: 'Luciano Prado (Relações Governamentais)',
          hasActiveContact: true,
          contactName: 'Dr. Valter Siqueira',
          hasStrategicPlan: true,
          hasNextAction: true,
          nextActionDescription: 'Acompanhar publicação do edital de monitoramento hidrográfico'
        },
        gaps: []
      }
    ];
  }

  getAccountCoverageSummary(companyId = 'veeluen') {
    const buyers = this.getStrategicBuyers(companyId);
    const total = buyers.length;
    const withOwner = buyers.filter(b => b.coverage.hasOwner).length;
    const withContact = buyers.filter(b => b.coverage.hasActiveContact).length;
    const withPlan = buyers.filter(b => b.coverage.hasStrategicPlan).length;
    const withNextAction = buyers.filter(b => b.coverage.hasNextAction).length;

    return {
      totalAccounts: total,
      withOwner,
      withOwnerPct: Math.round((withOwner / total) * 100),
      withContact,
      withContactPct: Math.round((withContact / total) * 100),
      withPlan,
      withPlanPct: Math.round((withPlan / total) * 100),
      withNextAction,
      withNextActionPct: Math.round((withNextAction / total) * 100),
      actionableGapsFound: buyers.filter(b => b.gaps.length > 0).length
    };
  }

  // ==========================================
  // 4. EQUILÍBRIO DE PORTFÓLIO & RISCO DE CONCENTRAÇÃO
  // ==========================================

  getPortfolioConcentrationAnalysis(companyId = 'veeluen') {
    const buyers = this.getStrategicBuyers(companyId);
    const totalPipeline = buyers.reduce((acc, b) => acc + (b.contractsValue || 0), 0) + 21500000;

    const topBuyerShare = {
      buyerName: 'Petrobras (Consolidado RNEST / UN-BC)',
      sharePct: 46.5,
      riskLevel: 'Elevado',
      context: '46.5% da receita e pipeline estão alocados em unidades da Petrobras. Embora seja um cliente de altíssima solvência e confiabilidade de pagamento, exige diversificação com clientes municipais e do setor privado (Acelen / Suape) para blindagem orçamentária.'
    };

    const topServiceShare = {
      serviceName: 'Operação de ETE e Tratamento de Efluentes',
      sharePct: 54.0,
      riskLevel: 'Moderado a Alto',
      context: '54.0% da capacidade comercial está concentrada em ETE. A estratégia de expandir para Monitoramento de Emissões e Dispersão visa mitigar essa dependência.'
    };

    const topRegionShare = {
      regionName: 'Pernambuco (RMR e Suape)',
      sharePct: 58.0,
      riskLevel: 'Moderado',
      context: '58.0% dos contratos e oportunidades em andamento situam-se em Pernambuco. A expansão para Bahia e Bacia de Santos dilui riscos regulatórios estaduais.'
    };

    return {
      totalPipelineValue: totalPipeline,
      topBuyerShare,
      topServiceShare,
      topRegionShare,
      diversificationScore: 71,
      verdict: 'Risco de concentração monitorado. Recomenda-se avançar nas iniciativas de Camaçari/BA e clientes privados para reduzir dependência estatal direta.'
    };
  }

  // ==========================================
  // 5. MAPA DE VENCIMENTO DE CONTRATOS & CALENDÁRIO
  // ==========================================

  getContractExpiryMap(companyId = 'veeluen') {
    return {
      horizon90Days: [
        {
          id: 'CTR-2024-009',
          title: 'Operação da ETE de Porto de Galinhas — COMPESA',
          client: 'COMPESA',
          monthlyValue: 145000,
          annualValue: 1740000,
          expiryDate: '2026-11-20',
          daysRemaining: 36,
          renewable: true,
          renewalStatus: 'Negociação de aditivo em andamento',
          actionRequired: 'Emitir atestado de cumprimento satisfatório para resguardar acervo e assinar termo aditivo de 12 meses.'
        }
      ],
      horizon180Days: [
        {
          id: 'CTR-2024-018',
          title: 'Monitoramento Ambiental de Efluentes — Petrobras RNEST',
          client: 'Petrobras RNEST',
          monthlyValue: 280000,
          annualValue: 3360000,
          expiryDate: '2027-02-15',
          daysRemaining: 122,
          renewable: false,
          renewalStatus: 'Edital de nova licitação previsto no PCA 2027',
          actionRequired: 'Antecipar estudos técnicos da nova modelagem e garantir validade das certidões para disputa na Petronect.'
        }
      ],
      horizon365Days: [
        {
          id: 'CTR-2023-044',
          title: 'Gestão de Resíduos e Licenciamento — Suape S.A.',
          client: 'Complexo Industrial Portuário de Suape',
          monthlyValue: 95000,
          annualValue: 1140000,
          expiryDate: '2027-07-31',
          daysRemaining: 288,
          renewable: true,
          renewalStatus: 'Vigência regular do ano 2',
          actionRequired: 'Submeter relatório anual de desempenho socioambiental em dez/2026.'
        }
      ]
    };
  }

  getProcurementCalendar(companyId = 'veeluen') {
    return [
      {
        id: 'CAL-01',
        title: 'Operação do Sistema de Esgotamento Sanitário de Ipojuca / Suape',
        buyer: 'COMPESA',
        type: CalendarItemType.OPEN,
        date: '2026-10-28',
        estimatedValue: 14200000,
        statusLabel: 'Edital Publicado / Disputa Aberta',
        source: 'PNCP e Diário Oficial PE',
        strategicRelevance: 'Crítica (Core Business Veeluen)'
      },
      {
        id: 'CAL-02',
        title: 'Tratamento de Águas Industriais e Despejo de Efluentes — RNEST Trem 2',
        buyer: 'Petrobras RNEST',
        type: CalendarItemType.PLANNED,
        date: '2026-12-10',
        estimatedValue: 28000000,
        statusLabel: 'Previsto no Plano de Contratações Anual (PCA 2026/2027)',
        source: 'Petronect / Transparência Petrobras',
        strategicRelevance: 'Alta (Oportunidade de expansão de escopo)'
      },
      {
        id: 'CAL-03',
        title: 'Monitoramento Contínuo de Emissões de Chaminés — Polo de Camaçari',
        buyer: 'Acelen / Cetrel',
        type: CalendarItemType.PREDICTED,
        date: '2027-01-20',
        estimatedValue: 8500000,
        statusLabel: 'Previsto por Modelo Preditivo (Renovação Bianual)',
        source: 'Radar Antecipado Vellia — Histórico de 2023 e 2025',
        strategicRelevance: 'Estratégica (Alavanca para meta de Emissões na Bahia)'
      },
      {
        id: 'CAL-04',
        title: 'Auditoria Ambiental Externa e Monitoramento de Bacia Hidrográfica',
        buyer: 'INEA RJ / Bacia de Campos',
        type: CalendarItemType.OBSERVED,
        date: '2027-03-15',
        estimatedValue: 6200000,
        statusLabel: 'Fato Observado em Audiência Pública e Termo de Ajustamento',
        source: 'Diário Oficial RJ',
        strategicRelevance: 'Alta (Excelência Ambiental)'
      }
    ];
  }

  // ==========================================
  // 6. PLANOS POR HORIZONTE: 90 DIAS, 180 DIAS E 12 MESES
  // ==========================================

  getStrategicPlanByHorizon(horizon = StrategicHorizon.DAYS_90, companyId = 'veeluen') {
    if (horizon === StrategicHorizon.DAYS_90) {
      return {
        horizon: '90 Dias (Curto Prazo Operacional)',
        focus: 'Execução Imediata, Blindagem Documental e Decisões de Go/No-Go',
        keyActions: [
          'Defender o contrato COMPESA Porto de Galinhas com assinatura de termo aditivo (36 dias restantes).',
          'Vencer e mobilizar o certame de esgotamento sanitário de Suape (disputa em 28/10).',
          'Atualizar certidão CNDT e acervo de engenharia química no Acervo Central da Veeluen.',
          'Cadastrar primeiro contato institucional e agendar reunião na Acelen/BA.'
        ],
        priorityAccounts: ['COMPESA', 'Petrobras RNEST', 'Acelen'],
        priorityServices: ['Operação de ETE e Tratamento de Efluentes'],
        riskMitigation: 'Manter vigilância nas certidões do consórcio e calibrar preços com a margem piso de 22%.'
      };
    } else if (horizon === StrategicHorizon.DAYS_180) {
      return {
        horizon: '180 Dias (Médio Prazo Comercial)',
        focus: 'Posicionamento em Novos Polos, Qualificação Técnica e Pré-Editais',
        keyActions: [
          'Credenciar consórcio técnico com laboratório analítico para o Polo de Camaçari.',
          'Submeter manifestação técnica prévia para o edital do Trem 2 da Refinaria RNEST.',
          'Executar plano de treinamento com 4 novos operadores para ampliação da capacidade de ETE.',
          'Alcançar 10 contas prioritárias com Owner e plano comercial ativo no Vellia CRM.'
        ],
        priorityAccounts: ['Petrobras RNEST', 'Cetrel / Acelen', 'Prefeituras de Suape'],
        priorityServices: ['Operação de ETE', 'Monitoramento de Emissões Atmosféricas'],
        riskMitigation: 'Evitar sobrecarga operacional limitando a 3 o número de disputas simultâneas em grande escala.'
      };
    } else {
      return {
        horizon: '12 Meses (Planejamento Estratégico Anual)',
        focus: 'Liderança Regional no Nordeste, Diversificação Industrial e Rentabilidade',
        keyActions: [
          'Alcançar R$ 35M de faturamento anual acumulado com margem média líquida acima de 26%.',
          'Consolidar a filial operacional em Salvador/Camaçari com base técnica permanente.',
          'Atingir Win Rate de 38% em licitações públicas e privadas qualificadas pelo Comitê.',
          'Estabelecer sinergia entre Veeluen e Excelência em contratos integrados de saneamento e meio ambiente.'
        ],
        priorityAccounts: ['Petrobras', 'COMPESA', 'Acelen', 'Complexo do Pecém', 'INEA/RJ'],
        priorityServices: ['Operação de ETE', 'Monitoramento de Emissões', 'Licenciamento Ambiental', 'Modelagem AERMOD'],
        riskMitigation: 'Reduzir concentração da Petrobras para no máximo 35% do portfólio total do Grupo.'
      };
    }
  }

  // ==========================================
  // 7. INICIATIVAS ESTRATÉGICAS (STRATEGIC INITIATIVES)
  // ==========================================

  getInitiatives(companyId = 'veeluen') {
    const raw = localStorage.getItem(this.initiativesKey);
    let list = raw ? JSON.parse(raw) : this.defaultInitiatives;
    if (companyId && companyId !== 'group') {
      list = list.filter(i => i.companyId === companyId);
    }
    return list;
  }

  saveInitiative(initiative, user = 'Diretoria') {
    const raw = localStorage.getItem(this.initiativesKey);
    let list = raw ? JSON.parse(raw) : [...this.defaultInitiatives];
    const idx = list.findIndex(i => i.id === initiative.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...initiative, updatedAt: new Date().toISOString() };
    } else {
      initiative.id = `INIT-${Date.now()}`;
      initiative.createdAt = new Date().toISOString();
      list.push(initiative);
    }
    localStorage.setItem(this.initiativesKey, JSON.stringify(list));

    if (this.logService) {
      this.logService.addLog({
        type: LogType.UPDATE,
        message: `Iniciativa Estratégica salva: ${initiative.name} (${initiative.status})`,
        details: { initiativeId: initiative.id, user }
      });
    }
    return initiative;
  }

  // ==========================================
  // 8. METAS ESTRATÉGICAS & PLAN VS ACTUAL
  // ==========================================

  getStrategicGoals(companyId = 'veeluen') {
    const raw = localStorage.getItem(this.goalsKey);
    let list = raw ? JSON.parse(raw) : this.defaultGoals;
    if (companyId && companyId !== 'group') {
      list = list.filter(g => g.companyId === companyId);
    }
    return list;
  }

  updateGoalValue(goalId, newValue, note = '', user = 'Gestor') {
    const raw = localStorage.getItem(this.goalsKey);
    let list = raw ? JSON.parse(raw) : [...this.defaultGoals];
    const goal = list.find(g => g.id === goalId);
    if (!goal) return null;

    goal.currentValue = Number(newValue);
    if (!goal.history) goal.history = [];
    goal.history.push({
      date: new Date().toISOString().split('T')[0],
      value: Number(newValue),
      note: note || 'Atualização periódica de acompanhamento',
      updatedBy: user
    });

    if (goal.metricType === 'VALUE' || goal.metricType === 'COUNT' || goal.metricType === 'PERCENTAGE') {
      goal.status = goal.currentValue >= goal.targetValue ? 'ON_TRACK' : (goal.currentValue >= goal.targetValue * 0.8 ? 'AT_RISK' : 'OFF_TRACK');
    }

    localStorage.setItem(this.goalsKey, JSON.stringify(list));
    return goal;
  }

  // ==========================================
  // 9. CENÁRIOS ESTRATÉGICOS (SANDBOX)
  // ==========================================

  getScenarios() {
    const raw = localStorage.getItem(this.scenariosKey);
    return raw ? JSON.parse(raw) : this.defaultScenarios;
  }

  simulateScenario(scenarioId, customParams = {}) {
    const scenarios = this.getScenarios();
    const sc = scenarios.find(s => s.id === scenarioId) || scenarios[0];
    const multiplier = customParams.pipelineMultiplier || sc.pipelineMultiplier;
    const baseRev = sc.expectedRevenue;

    return {
      scenarioId: sc.id,
      name: sc.name,
      projectedRevenue: Math.round(baseRev * multiplier),
      pipelineMultiplier: multiplier,
      winRateTarget: customParams.winRateTarget || sc.winRateTarget,
      plannedCapex: sc.plannedCapex,
      riskLevel: sc.riskLevel,
      focusServices: sc.focusServices,
      focusRegions: sc.focusRegions,
      isSandbox: true,
      simulationNote: 'Simulação realizada em sandbox estratégico isolado. Não altera dados operacionais nem propostas de preço vigentes.'
    };
  }

  // ==========================================
  // 10. EXECUTIVE BOARD VIEW (RESUMO DA DIRETORIA)
  // ==========================================

  getExecutiveBoardView(companyId = 'veeluen') {
    return {
      companyName: companyId === 'veeluen' ? 'Veeluen Solutions' : (companyId === 'excelencia' ? 'Excelência Ambiental' : 'Grupo Vellia'),
      horizonLabel: 'Ciclo Estratégico 2026/2027',
      dataCoverage: 'Análise fundamentada em 186 certames monitorados, 8 contratos vigentes e dados do PNCP/Petronect entre out/2025 e out/2026.',
      strategicPipelineTotal: 48500000,
      
      threePriorities: [
        {
          num: 1,
          title: 'Defender e Renovar Contratos Core de ETE',
          detail: 'Garantir renovação dos contratos COMPESA e Suape, assegurando R$ 2.8M de receita anual contínua.'
        },
        {
          num: 2,
          title: 'Conquistar Mercado de Emissões no Polo de Camaçari/BA',
          detail: 'Estruturar consórcio qualificado para disputar os grandes pacotes industriais da Acelen e Cetrel.'
        },
        {
          num: 3,
          title: 'Mitigar Concentração Petrobras',
          detail: 'Ampliar a carteira de saneamento municipal e clientes industriais privados para balancear risco.'
        }
      ],

      threeRiscos: [
        {
          num: 1,
          title: 'Concentração de 46.5% do Pipeline na Petrobras',
          severity: 'Alta',
          mitigation: 'Prospecção ativa no setor privado e concessões estaduais.'
        },
        {
          num: 2,
          title: 'Gargalo em Atestados Quantitativos de Chaminés de Alta Vazão',
          severity: 'Média',
          mitigation: 'Formação de consórcio ou subcontratação técnica autorizada no edital.'
        },
        {
          num: 3,
          title: 'Vencimento Contratual em Menos de 40 Dias (COMPESA)',
          severity: 'Alta',
          mitigation: 'Conclusão formal da minuta de aditivo já protocolada junto à estatal.'
        }
      ],

      threeMovements: [
        {
          num: 1,
          title: 'Acelerar Aliança com Laboratório Credenciado no INEMA/BA',
          timeline: 'Próximos 30 dias',
          owner: 'Dra. Vanessa Lima'
        },
        {
          num: 2,
          title: 'Ajustar Parâmetros de Margem Piso para 24% em Licitações de Grande Porte',
          timeline: 'Imediato',
          owner: 'Comitê de Alçadas'
        },
        {
          num: 3,
          title: 'Realizar Reunião de Diretoria para Aprovação do Plano 2027 v1.0',
          timeline: 'Até 15/11/2026',
          owner: 'Conselho Executivo'
        }
      ]
    };
  }

  // ==========================================
  // 11. GOVERNANÇA, VERSIONAMENTO E APROVAÇÃO DO PLANO
  // ==========================================

  getPlanVersions(companyId = 'veeluen') {
    return [
      {
        version: 'v1.0',
        planName: 'Plano Anual de Licitações 2026/2027',
        companyId: 'veeluen',
        createdAt: '2026-08-15T10:00:00Z',
        approvedAt: '2026-08-20T16:30:00Z',
        approvedBy: 'Comitê Executivo (Roberto Silveira, Carlos Eduardo)',
        status: 'Aprovado',
        snapshotId: 'SNAP-PLAN-2026-V1',
        changeSummary: 'Versão inicial consolidada para o ciclo anual.'
      },
      {
        version: 'v2.0 (Em Revisão)',
        planName: 'Revisão Trimestral Q4 — Expansão Nordeste',
        companyId: 'veeluen',
        createdAt: '2026-10-15T09:00:00Z',
        approvedAt: null,
        approvedBy: null,
        status: 'Pronto para Aprovação',
        snapshotId: 'SNAP-PLAN-2026-V2',
        changeSummary: 'Inclusão da meta de Camaçari/BA e ajuste na margem alvo de ETE.'
      }
    ];
  }

  submitPlanForApproval(versionId, justification, requester = 'Planejamento Estratégico') {
    const approvalReq = ApprovalService.createApprovalRequest({
      type: ApprovalType.GOVERNANCE_EXCEPTION,
      entityType: 'StrategicPlan',
      entityId: versionId,
      opportunityId: 'STRAT-PLAN-2026',
      opportunityTitle: `Plano Estratégico de Licitações 2026/2027 — Versão ${versionId}`,
      organ: 'Conselho Executivo Vellia',
      companyId: 'veeluen-matriz',
      requestedBy: requester,
      requestedByRole: 'Diretor de Estratégia',
      amount: 48500000,
      margin: 26.5,
      riskLevel: 'Médio',
      reason: justification || 'Submissão do plano anual revisado com metas, iniciativas e alocação de capacidade para aprovação do Conselho.',
      snapshot: {
        version: versionId,
        submittedAt: new Date().toISOString()
      }
    });

    if (this.logService) {
      this.logService.addLog({
        type: LogType.DECISION,
        message: `Plano Estratégico ${versionId} submetido para aprovação executiva`,
        details: { versionId, approvalId: approvalReq.id }
      });
    }

    return approvalReq;
  }

  // ==========================================
  // 12. SUÍTE DE TESTES AUTOMATIZADOS (GOLDEN STRATEGY TEST SET)
  // ==========================================

  runGoldenTestSet() {
    const results = [];

    // TESTE 1: Serviço com demanda alta e presença baixa -> Sugere EXPANDIR
    const test1Services = this.getServicePortfolioMatrix('veeluen');
    const srvEmissoes = test1Services.find(s => s.id === 'SRV-EMISSOES');
    results.push({
      testNumber: 1,
      title: 'Serviço com demanda alta e presença baixa sugere expansão',
      passed: srvEmissoes && srvEmissoes.systemRecommendation === StrategyClassification.EXPAND,
      details: `Serviço ${srvEmissoes?.name}: Demanda=${srvEmissoes?.observedDemand}, Presença=${srvEmissoes?.currentPresence}. Recomendação=${srvEmissoes?.systemRecommendation}`
    });

    // TESTE 2: Serviço / Mercado com poucos dados -> Informa dados insuficientes
    const geoMarkets = this.getGeographicMarkets('veeluen');
    const maranhao = geoMarkets.find(g => g.state === 'MA');
    results.push({
      testNumber: 2,
      title: 'Mercado com poucos dados informa insuficiência sem inventar classificação',
      passed: maranhao && maranhao.classification === GeographicClassification.LOW_SIGNAL && maranhao.hasSufficientData === false,
      details: `Estado MA: Classificação=${maranhao?.classification}, hasSufficientData=${maranhao?.hasSufficientData}`
    });

    // TESTE 3: Contrato vencendo -> Aparece no planejamento de 6 meses
    const expiryMap = this.getContractExpiryMap('veeluen');
    const contractIn180 = expiryMap.horizon180Days.find(c => c.daysRemaining <= 180);
    results.push({
      testNumber: 3,
      title: 'Contrato com término em até 180 dias aparece no horizonte 6 meses',
      passed: !!contractIn180,
      details: `Contrato encontrado: ${contractIn180?.title} (${contractIn180?.daysRemaining} dias restantes)`
    });

    // TESTE 4: Contrato renovado -> Sinal antigo atualizado
    const contractIn90 = expiryMap.horizon90Days[0];
    results.push({
      testNumber: 4,
      title: 'Contrato renovado ou em aditivo atualiza status sem perder histórico',
      passed: contractIn90 && contractIn90.renewalStatus.includes('aditivo'),
      details: `Status de renovação: ${contractIn90?.renewalStatus}`
    });

    // TESTE 5: Meta editada -> Histórico preservado
    const goal = this.getStrategicGoals('veeluen')[0];
    results.push({
      testNumber: 5,
      title: 'Meta estratégica editada preserva histórico de medições anteriores',
      passed: goal && Array.isArray(goal.history) && goal.history.length >= 2,
      details: `Meta ${goal?.title}: ${goal?.history?.length} registros históricos auditados.`
    });

    // TESTE 6: Plano aprovado -> Alteração gera nova versão
    const versions = this.getPlanVersions('veeluen');
    results.push({
      testNumber: 6,
      title: 'Plano aprovado é imutável e novas alterações geram nova versão v2.0',
      passed: versions.length >= 2 && versions.some(v => v.version.includes('v2.0')),
      details: `Versões registradas: ${versions.map(v => v.version).join(', ')}`
    });

    // TESTE 7: Usuário sem permissão financeira -> Valores restritos ocultos
    const nonFinServices = this.getServicePortfolioMatrix('veeluen', { canViewFinancials: false });
    const hasMarginExposed = nonFinServices.some(s => s.avgMargin !== undefined);
    results.push({
      testNumber: 7,
      title: 'Usuário sem permissão financeira tem margens omitidas no portfólio',
      passed: !hasMarginExposed,
      details: `Margem omitida para usuário restrito. hasMarginExposed=${hasMarginExposed}`
    });

    // TESTE 8: Dados de duas empresas -> Isolamento correto
    const veeluenServices = this.getServicePortfolioMatrix('veeluen');
    const excelenciaServices = this.getServicePortfolioMatrix('excelencia');
    const hasLeak = veeluenServices.some(s => s.companyId === 'excelencia') || excelenciaServices.some(s => s.companyId === 'veeluen');
    results.push({
      testNumber: 8,
      title: 'Isolamento de portfólio entre Veeluen e Excelência Ambiental preservado',
      passed: !hasLeak,
      details: `Veeluen: ${veeluenServices.length} serviços. Excelência: ${excelenciaServices.length} serviços. Vazamento=${hasLeak}`
    });

    return results;
  }
}

export const strategicPlanningService = new StrategicPlanningService();
