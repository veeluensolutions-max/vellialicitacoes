/**
 * VELLIA LICITAÇÕES — FASE 69: STRATEGIC INVESTMENT & CAPABILITY EXPANSION PLANNER
 * capabilityInvestmentData.js: Dados Canônicos de Sinais, Casos de Investimento, Opções e Resultados
 */

import {
  SignalType,
  CapabilityType,
  InvestmentCaseStatus,
  ExpansionOptionType,
  CostSourceType,
  RootConstraintType,
  CapitalPriorityTier,
  PostInvestmentReviewPeriod
} from './capabilityInvestmentModels.js';

export const initialInvestmentSignals = [
  {
    id: 'SIG-2026-01',
    companyId: 'veeluen',
    signalType: SignalType.REPEATED_EQUIPMENT_BOTTLENECK,
    title: 'Gargalo Recorrente de Analisador Óptico FTIR para Emissões',
    frequency: 8, // Identificado como gargalo em 8 certames
    period: 'Últimos 12 meses (Nov/2025 - Out/2026)',
    affectedOpportunities: [
      { id: 'PE-2026-0891', buyer: 'Petrobras REDUC', value: 3800000 },
      { id: 'PE-2026-0940', buyer: 'Sanepar Saneamento', value: 2450000 },
      { id: 'PE-2026-0710', buyer: 'Braskem Polo ABC', value: 1850000 },
      { id: 'PE-2026-0640', buyer: 'Transpetro Dutos', value: 2100000 },
      { id: 'PE-2026-0520', buyer: 'Refinaria Gabriel Passos', value: 3200000 }
    ],
    affectedContracts: [
      { id: 'CONT-PETRO-2024', buyer: 'Petrobras REDUC', title: 'Manutenção Contínua' }
    ],
    pipelineValueAffected: 13400000, // R$ 13.4M de pipeline qualificado afetado
    strategicRelevance: 'Alto impacto: alinhado à meta de crescimento em óleo & gás e monitoramento de emissões industriais.',
    rootConstraint: RootConstraintType.CAPACITY_SHORTAGE,
    currentAssetUtilizationPct: 88, // Ativo atual com ocupação muito alta
    caseSuggested: true
  },
  {
    id: 'SIG-2026-02',
    companyId: 'veeluen',
    signalType: SignalType.REPEATED_STAFF_GAP,
    title: 'Gargalo Recorrente de Inspetor Mecânico Habilitado NR-13',
    frequency: 5,
    period: 'Últimos 8 meses',
    affectedOpportunities: [
      { id: 'PE-2026-0891', buyer: 'Petrobras REDUC', value: 3800000 },
      { id: 'PE-2026-0940', buyer: 'Sanepar', value: 2450000 }
    ],
    affectedContracts: [
      { id: 'CONT-PETRO-2024', buyer: 'Petrobras REDUC', title: 'Manutenção Contínua' }
    ],
    pipelineValueAffected: 6250000,
    strategicRelevance: 'Exigência normativa legal inafastável para laudos de integridade de vasos sob pressão.',
    rootConstraint: RootConstraintType.CERTIFICATION_ISSUE,
    currentAssetUtilizationPct: 92,
    caseSuggested: true
  },
  {
    id: 'SIG-2026-03',
    companyId: 'veeluen',
    signalType: SignalType.REPEATED_EQUIPMENT_BOTTLENECK,
    title: 'Incidente Isolado de Indisponibilidade de Bomba de Solo',
    frequency: 1, // Incidente isolado! Não justifica caso de investimento pesado
    period: 'Setembro / 2026',
    affectedOpportunities: [
      { id: 'PE-2026-0410', buyer: 'Cetesb', value: 450000 }
    ],
    affectedContracts: [],
    pipelineValueAffected: 450000,
    strategicRelevance: 'Baixa relevância estrutural: demanda pontual atendida por locação esporádica.',
    rootConstraint: RootConstraintType.AVAILABILITY_ISSUE,
    currentAssetUtilizationPct: 15,
    caseSuggested: false
  },
  {
    id: 'SIG-2026-04',
    companyId: 'veeluen',
    signalType: SignalType.OPERATIONAL_THROUGHPUT_CONSTRAINT,
    title: 'Apontamento de Gargalo em Caminhão Vácuo 15m³',
    frequency: 4,
    period: 'Últimos 6 meses',
    affectedOpportunities: [
      { id: 'PE-2026-0300', buyer: 'Sabesp', value: 1200000 }
    ],
    affectedContracts: [],
    pipelineValueAffected: 1200000,
    strategicRelevance: 'Equipamento existente com taxa de ocupação de apenas 28%. Gargalo é de escala de motorista e manutenção preventiva, e NÃO falta de caminhão.',
    rootConstraint: RootConstraintType.SCHEDULING_ISSUE, // Gargalo processual!
    currentAssetUtilizationPct: 28,
    caseSuggested: false // Não recomendar compra antes de corrigir o agendamento!
  }
];

export const initialInvestmentCases = [
  {
    id: 'CASE-2026-001',
    companyId: 'veeluen',
    title: 'Expansão da Capacidade Analítica de Emissões Atmosféricas e Gases Industriais',
    capabilityType: CapabilityType.EQUIPMENT,
    problemStatement: 'A existência de apenas 1 espectrômetro óptico portátil FTIR próprio limita a participação simultânea em licitações petroquímicas, gera sobreposição de demandas com contratos ativos e impõe custos emergenciais de locação externa.',
    status: InvestmentCaseStatus.SCENARIO_READY,
    strategicObjectiveId: 'OBJ-STRAT-01-EXPANSAO-EMISSOES',
    createdAt: '2026-10-15T09:00:00Z',
    createdBy: 'Diretoria de Operações & Engenharia',
    reviewDate: '2026-10-25T14:00:00Z',
    version: 1,
    capitalPriority: CapitalPriorityTier.NOW,
    sourceSignalId: 'SIG-2026-01',
    rootConstraint: RootConstraintType.CAPACITY_SHORTAGE,
    options: [
      {
        id: 'OPT-CASE-01-BUY',
        caseId: 'CASE-2026-001',
        type: ExpansionOptionType.BUY,
        title: 'Aquisição de Espectrômetro Óptico Portátil FTIR Dedicado (Capex)',
        description: 'Compra de analisador portátil completo com calibração RBC, kit de amostragem aquecida e garantia de fábrica de 24 meses.',
        estimatedCost: {
          upfront: 160000,
          recurringAnnual: 14000, // Calibração e seguro
          variablePerUse: 450, // Consumíveis
          source: CostSourceType.SUPPLIER_PROPOSAL,
          notes: 'Proposta comercial formal de distribuidor autorizado Thermo / ABB.'
        },
        leadTimeDays: 45,
        capacityGain: '+2 frentes de medição simultâneas em contratos de longo prazo.',
        duration: 'Ativo permanente (Vida útil estimada: 7 anos)',
        risks: 'Risco de subutilização caso o volume de certames de refino caia mais de 40% no ano seguinte.',
        dependencies: 'Aprovação de verba de investimento pelo Conselho de Administração.',
        breakEvenUses: 11, // Break-even após 11 utilizações frente ao custo de locação
        isMostBalanced: true,
        tradeOffNotes: 'Maior custo inicial (R$ 160.000), porém elimina custos repetidos de locação e assegura prontidão imediata para certames de alto valor.',
        status: 'READY_FOR_COMMITTEE'
      },
      {
        id: 'OPT-CASE-01-RENT',
        caseId: 'CASE-2026-001',
        type: ExpansionOptionType.RENT,
        title: 'Contrato Guarda-Chuva de Locação Comercial por Demanda (Opex)',
        description: 'Locação sob demanda com tarifa pré-negociada junto ao Parceiro Beta para mobilização em até 5 dias úteis.',
        estimatedCost: {
          upfront: 0,
          recurringAnnual: 0,
          variablePerUse: 15000, // Custo por mobilização de certame
          source: CostSourceType.QUOTATION,
          notes: 'Cotação prévia garantida em tabela de fornecedor homologado.'
        },
        leadTimeDays: 5,
        capacityGain: 'Atendimento pontual a certames sem imobilização de capital.',
        duration: 'Contrato comercial anual de fornecimento',
        risks: 'Risco de indisponibilidade do locador em janelas concorrentes e redução média de 2.2% na margem do certame.',
        dependencies: 'Aprovação prévia da dotação no comitê comercial.',
        breakEvenUses: null,
        isMostBalanced: false,
        tradeOffNotes: 'Zero investimento inicial, porém custo variável elevado (R$ 15.000 por certame) e dependência contínua de terceiro.',
        status: 'ALTERNATIVE'
      },
      {
        id: 'OPT-CASE-01-PARTNER',
        caseId: 'CASE-2026-001',
        type: ExpansionOptionType.PARTNER,
        title: 'Acordo Operacional de Parceria Estratégica com Subcontratação',
        description: 'Subcontratação técnica das medições de gases com laboratório credenciado, assumindo responsabilidade compartilhada.',
        estimatedCost: {
          upfront: 0,
          recurringAnnual: 0,
          variablePerUse: 22000,
          source: CostSourceType.HISTORICAL,
          notes: 'Média de pagamentos a laboratórios parceiros em 2025.'
        },
        leadTimeDays: 10,
        capacityGain: 'Acesso à capacidade técnica laboratorial externa.',
        duration: 'Por certame / projeto',
        risks: 'Alta dependência operacional, menor controle sobre os prazos de emissão dos laudos perante o órgão contratante.',
        dependencies: 'Permissão expressa de subcontratação no edital.',
        breakEvenUses: null,
        isMostBalanced: false,
        tradeOffNotes: 'Sem risco de ociosidade interna, mas consome maior fatia da rentabilidade da proposta.',
        status: 'ALTERNATIVE'
      },
      {
        id: 'OPT-CASE-01-DONOTHING',
        caseId: 'CASE-2026-001',
        type: ExpansionOptionType.DO_NOTHING,
        title: 'Manter Situação Atual (Não Expandir Capacidade)',
        description: 'Continuar operando com apenas 1 analisador FTIR, priorizando seletivamente apenas 1 certame por período.',
        estimatedCost: {
          upfront: 0,
          recurringAnnual: 0,
          variablePerUse: 0,
          source: CostSourceType.MANUAL_ASSUMPTION,
          notes: 'Nenhum desembolso financeiro.'
        },
        leadTimeDays: 0,
        capacityGain: 'Nenhum ganho. Capacidade permanece limitada a 1 frente simultânea.',
        duration: 'Indefinida',
        risks: 'Perda recorrente de janelas competitivas em certames de refino; limitação de crescimento em clientes estratégicos.',
        dependencies: 'Nenhuma',
        breakEvenUses: null,
        isMostBalanced: false,
        tradeOffNotes: 'Zero risco financeiro imediato, mas limita o pipeline qualificado disputável em até R$ 6.2M no ano.',
        status: 'BASE_SCENARIO'
      }
    ]
  },
  {
    id: 'CASE-2026-002',
    companyId: 'veeluen',
    title: 'Capacitação e Habilitação de Engenheiro Mecânico Residente em NR-13',
    capabilityType: CapabilityType.TRAINING,
    problemStatement: 'Concentração da responsabilidade técnica de inspeção em 1 único engenheiro sênior gera vulnerabilidade operacional em caso de licenças ou viagens de campo coincidentes.',
    status: InvestmentCaseStatus.APPROVED, // APROVADO, mas NÃO implementado até conclusão do curso e registro no conselho!
    strategicObjectiveId: 'OBJ-STRAT-02-QUALIFICACAO',
    createdAt: '2026-09-20T11:00:00Z',
    createdBy: 'Coordenação de Engenharia',
    reviewDate: '2026-11-10T10:00:00Z',
    version: 1,
    capitalPriority: CapitalPriorityTier.PREPARE,
    sourceSignalId: 'SIG-2026-02',
    rootConstraint: RootConstraintType.CERTIFICATION_ISSUE,
    options: [
      {
        id: 'OPT-CASE-02-TRAIN',
        caseId: 'CASE-2026-002',
        type: ExpansionOptionType.TRAIN,
        title: 'Curso de Especialização e Prova de Qualificação em Inspeção NR-13',
        description: 'Qualificação formal de engenheiro mecânico júnior da equipe própria junto a instituição credenciada pelo Confea/CREA.',
        estimatedCost: {
          upfront: 12500,
          recurringAnnual: 1800, // Anuidade complementar
          variablePerUse: 0,
          source: CostSourceType.QUOTATION,
          notes: 'Matrícula e taxas de exame de proficiência.'
        },
        leadTimeDays: 60,
        capacityGain: '+1 inspetor habilitado para atuação simultânea em campo.',
        duration: 'Permanente',
        risks: 'Tempo de formação de 60 dias requer planejamento antecipado.',
        dependencies: 'Conclusão satisfatória e registro da ART de cargo e função.',
        breakEvenUses: 2,
        isMostBalanced: true,
        tradeOffNotes: 'Retém conhecimento internamente a custo marginal muito inferior à contratação de um sênior novo no mercado.',
        status: 'APPROVED_FOR_EXECUTION'
      }
    ]
  }
];

export const initialInvestmentOutcomes = [
  {
    id: 'OUT-CASE-2025-01',
    caseId: 'CASE-2025-089',
    caseTitle: 'Aquisição de Medidor de Nível Sonoro Integrador Classe 1 (Sonômetro)',
    companyId: 'excelencia',
    capabilityType: CapabilityType.EQUIPMENT,
    reviewDate: '2026-09-30',
    reviewPeriod: PostInvestmentReviewPeriod.SIX_MONTHS,
    capacityImpact: 'Permitiu participação em 6 novos certames ambientais municipais com laudo acústico próprio.',
    utilizationObservedPct: 76,
    affectedOpportunitiesWonCount: 3,
    operationalImpact: 'Eliminou 100% dos atrasos decorrentes de locação externa e gerou R$ 1.85M de novos contratos executados.',
    economicBenefitRealized: 48000, // R$ 48.000 em locações evitadas em 6 meses
    assumptionsValidated: true,
    notes: 'Investimento atingiu o break-even projetado no quinto mês de operação em campo.'
  }
];
