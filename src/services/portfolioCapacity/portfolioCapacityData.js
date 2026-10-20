/**
 * VELLIA LICITAÇÕES — FASE 68: STRATEGIC RESOURCE OPTIMIZATION + PORTFOLIO TRADEOFF ENGINE
 * portfolioCapacityData.js: Dados Canônicos de Recursos, Capacidades, Demandas e Conflitos
 */

import {
  ResourceType,
  CapacityQuality,
  DemandStatus,
  DemandConfidence,
  ResourcePressureLevel,
  ConflictType,
  ConflictStatus,
  ReservationStatus,
  OpportunityPriorityTier
} from './portfolioCapacityModels.js';

export const initialResources = [
  {
    id: 'RES-ENG-NR13',
    name: 'Engenheiro Mecânico / Inspetor NR-13',
    type: ResourceType.PEOPLE_ROLE,
    companyId: 'veeluen',
    isSharedGroupResource: false,
    unit: 'Profissional',
    description: 'Engenheiro com certificação ativa para inspeção de vasos de pressão e caldeiras conforme NR-13.',
    coverageQuality: CapacityQuality.CONFIRMED,
    calibrationExpiry: null
  },
  {
    id: 'RES-SPEC-ENV',
    name: 'Químico / Biólogo Sênior Habilitado CRQ/CRBio',
    type: ResourceType.PEOPLE_ROLE,
    companyId: 'excelencia',
    isSharedGroupResource: false,
    unit: 'Profissional',
    description: 'Responsável técnico para laudos ambientais e monitoramento de efluentes industriais.',
    coverageQuality: CapacityQuality.CONFIRMED,
    calibrationExpiry: null
  },
  {
    id: 'RES-EQP-SPECTRO',
    name: 'Espectrômetro Óptico Portátil FTIR para Emissões',
    type: ResourceType.EQUIPMENT,
    companyId: 'veeluen',
    isSharedGroupResource: true, // Recurso compartilhado autorizado entre empresas
    unit: 'Equipamento',
    description: 'Analisador multiespectral para medição contínua de gases em refinarias e plantas industriais.',
    coverageQuality: CapacityQuality.CONFIRMED,
    calibrationExpiry: '2026-11-05', // Calibração expira em 5 de novembro (antes da execução de 10/11)!
    maintenanceWindow: '2026-11-06 a 2026-11-09'
  },
  {
    id: 'RES-TEAM-ETE',
    name: 'Equipe Especializada em Operação de ETE/ETA',
    type: ResourceType.TEAM,
    companyId: 'excelencia',
    isSharedGroupResource: false,
    unit: 'Equipe (4 Técnicos)',
    description: 'Equipe treinada para operação de estações de tratamento de esgoto e efluentes sanitários.',
    coverageQuality: CapacityQuality.CONFIRMED,
    calibrationExpiry: null
  },
  {
    id: 'RES-PARTNER-LAB',
    name: 'Laboratório Terceirizado para Análise Cromatográfica',
    type: ResourceType.PARTNER_CAPACITY,
    companyId: 'veeluen',
    isSharedGroupResource: false,
    unit: 'Lote de Amostras (Max 80/mês)',
    description: 'Capacidade contratada com parceiro homologado para análises laboratoriais complexas.',
    coverageQuality: CapacityQuality.ESTIMATED, // Estimada por cotação
    calibrationExpiry: null
  },
  {
    id: 'RES-VEH-VACUUM',
    name: 'Caminhão Vácuo e Alta Pressão 15m³',
    type: ResourceType.VEHICLE,
    companyId: 'veeluen',
    isSharedGroupResource: false,
    unit: 'Veículo',
    description: 'Caminhão pesado para desassoreamento e limpeza de lagoas e separadores API.',
    coverageQuality: CapacityQuality.UNKNOWN, // Disponibilidade sob checagem de mecânica
    calibrationExpiry: null
  }
];

export const initialResourceCapacities = [
  {
    resourceId: 'RES-ENG-NR13',
    companyId: 'veeluen',
    period: '2026-11',
    totalCapacity: 160, // Horas no mês
    committedCapacity: 90, // Comprometido com Contrato Petrobras REDUC
    tentativeCapacity: 60, // Disputado por PE-2026-0891 e PE-2026-0940
    bufferCapacity: 24, // Buffer de contingência (15%)
    availableCapacity: 10,
    pressureLevel: ResourcePressureLevel.CRITICAL,
    quality: CapacityQuality.CONFIRMED,
    lastUpdated: '2026-10-20T10:00:00Z'
  },
  {
    resourceId: 'RES-EQP-SPECTRO',
    companyId: 'veeluen',
    period: '2026-11',
    totalCapacity: 30, // Dias no mês
    committedCapacity: 15, // Alocado no Contrato Petrobras
    tentativeCapacity: 14, // Disputado por 2 certames simultâneos
    bufferCapacity: 4, // 4 dias de reserva
    availableCapacity: 1,
    pressureLevel: ResourcePressureLevel.CRITICAL,
    quality: CapacityQuality.CONFIRMED,
    lastUpdated: '2026-10-20T10:00:00Z'
  },
  {
    resourceId: 'RES-TEAM-ETE',
    companyId: 'excelencia',
    period: '2026-11',
    totalCapacity: 160,
    committedCapacity: 100, // Contrato Sabesp Norte
    tentativeCapacity: 45, // PE-2026-0902
    bufferCapacity: 24,
    availableCapacity: 15,
    pressureLevel: ResourcePressureLevel.STRESSED,
    quality: CapacityQuality.CONFIRMED,
    lastUpdated: '2026-10-20T10:00:00Z'
  },
  {
    resourceId: 'RES-SPEC-ENV',
    companyId: 'excelencia',
    period: '2026-11',
    totalCapacity: 160,
    committedCapacity: 80,
    tentativeCapacity: 30,
    bufferCapacity: 24,
    availableCapacity: 50,
    pressureLevel: ResourcePressureLevel.BALANCED,
    quality: CapacityQuality.CONFIRMED,
    lastUpdated: '2026-10-20T10:00:00Z'
  }
];

export const initialResourceDemands = [
  // 1. Demandas de Contratos Vigentes (Committed - Precedência Absoluta)
  {
    id: 'DEM-CONT-01',
    relatedEntityType: 'CONTRACT',
    relatedEntityId: 'CONT-PETRO-2024',
    title: 'Contrato Petrobras REDUC Manutenção Contínua',
    companyId: 'veeluen',
    resourceId: 'RES-ENG-NR13',
    quantity: 1,
    periodStart: '2026-11-01',
    periodEnd: '2026-11-30',
    criticality: 'CRITICAL',
    status: DemandStatus.COMMITTED,
    confidence: DemandConfidence.HIGH,
    source: 'Contrato Vigente Cláusula 4.2'
  },
  {
    id: 'DEM-CONT-02',
    relatedEntityType: 'CONTRACT',
    relatedEntityId: 'CONT-PETRO-2024',
    title: 'Contrato Petrobras REDUC Manutenção Contínua',
    companyId: 'veeluen',
    resourceId: 'RES-EQP-SPECTRO',
    quantity: 1,
    periodStart: '2026-11-01',
    periodEnd: '2026-11-15',
    criticality: 'CRITICAL',
    status: DemandStatus.COMMITTED,
    confidence: DemandConfidence.HIGH,
    source: 'Contrato Vigente Cronograma Anexo III'
  },
  {
    id: 'DEM-CONT-03',
    relatedEntityType: 'CONTRACT',
    relatedEntityId: 'CONT-SABESP-2025',
    title: 'Contrato Sabesp Elevatória Norte',
    companyId: 'excelencia',
    resourceId: 'RES-TEAM-ETE',
    quantity: 1,
    periodStart: '2026-11-01',
    periodEnd: '2026-11-30',
    criticality: 'CRITICAL',
    status: DemandStatus.COMMITTED,
    confidence: DemandConfidence.HIGH,
    source: 'Ordem de Serviço 104/2026'
  },

  // 2. Demandas de Oportunidades em Fase Avançada (Expected / Potential)
  {
    id: 'DEM-OPP-01',
    relatedEntityType: 'OPPORTUNITY',
    relatedEntityId: 'PE-2026-0891',
    title: 'PE 2026/0891 — Petrobras REDUC Automação (R$ 3.80M)',
    priorityTier: OpportunityPriorityTier.MUST_WIN,
    companyId: 'veeluen',
    resourceId: 'RES-ENG-NR13',
    quantity: 1,
    periodStart: '2026-11-10',
    periodEnd: '2026-11-20',
    criticality: 'HIGH',
    status: DemandStatus.EXPECTED,
    confidence: DemandConfidence.HIGH,
    source: 'Edital de Licitação Item 7.3'
  },
  {
    id: 'DEM-OPP-02',
    relatedEntityType: 'OPPORTUNITY',
    relatedEntityId: 'PE-2026-0891',
    title: 'PE 2026/0891 — Petrobras REDUC Automação (R$ 3.80M)',
    priorityTier: OpportunityPriorityTier.MUST_WIN,
    companyId: 'veeluen',
    resourceId: 'RES-EQP-SPECTRO',
    quantity: 1,
    periodStart: '2026-11-10',
    periodEnd: '2026-11-18',
    criticality: 'CRITICAL',
    status: DemandStatus.EXPECTED,
    confidence: DemandConfidence.HIGH,
    source: 'Termo de Referência Exigência Técnica'
  },
  {
    id: 'DEM-OPP-03',
    relatedEntityType: 'OPPORTUNITY',
    relatedEntityId: 'PE-2026-0940',
    title: 'PE 2026/0940 — Sanepar Saneamento (R$ 2.45M)',
    priorityTier: OpportunityPriorityTier.MUST_WIN, // Ambas marcadas como Must Win pelo humano!
    companyId: 'veeluen',
    resourceId: 'RES-ENG-NR13',
    quantity: 1,
    periodStart: '2026-11-12',
    periodEnd: '2026-11-22',
    criticality: 'HIGH',
    status: DemandStatus.EXPECTED,
    confidence: DemandConfidence.MEDIUM,
    source: 'Edital Sanepar Item 8'
  },
  {
    id: 'DEM-OPP-04',
    relatedEntityType: 'OPPORTUNITY',
    relatedEntityId: 'PE-2026-0940',
    title: 'PE 2026/0940 — Sanepar Saneamento (R$ 2.45M)',
    priorityTier: OpportunityPriorityTier.MUST_WIN,
    companyId: 'veeluen',
    resourceId: 'RES-EQP-SPECTRO',
    quantity: 1,
    periodStart: '2026-11-14',
    periodEnd: '2026-11-20',
    criticality: 'CRITICAL',
    status: DemandStatus.EXPECTED,
    confidence: DemandConfidence.MEDIUM,
    source: 'Anexo de Equipamentos Sanepar'
  },
  {
    id: 'DEM-OPP-05',
    relatedEntityType: 'OPPORTUNITY',
    relatedEntityId: 'PE-2026-0902',
    title: 'PE 2026/0902 — Sabesp ETE Barueri (R$ 4.25M)',
    priorityTier: OpportunityPriorityTier.STRATEGIC,
    companyId: 'excelencia',
    resourceId: 'RES-TEAM-ETE',
    quantity: 1,
    periodStart: '2026-11-15',
    periodEnd: '2026-11-28',
    criticality: 'HIGH',
    status: DemandStatus.EXPECTED,
    confidence: DemandConfidence.HIGH,
    source: 'Edital Sabesp Lote 1'
  }
];

export const initialCapacityConflicts = [
  {
    id: 'CONF-2026-01',
    resources: ['RES-EQP-SPECTRO', 'RES-ENG-NR13'],
    entities: [
      { id: 'CONT-PETRO-2024', type: 'CONTRACT', title: 'Contrato Petrobras REDUC' },
      { id: 'PE-2026-0891', type: 'OPPORTUNITY', title: 'PE Petrobras REDUC (Must Win)' },
      { id: 'PE-2026-0940', type: 'OPPORTUNITY', title: 'PE Sanepar (Must Win)' }
    ],
    period: '2026-11-12 a 2026-11-18',
    conflictType: ConflictType.EQUIPMENT_CONFLICT,
    severity: ResourcePressureLevel.CRITICAL,
    status: ConflictStatus.DETECTED,
    description: 'O Espectrômetro FTIR e o Engenheiro NR-13 estão com demanda simultânea para o Contrato Petrobras vigente e para duas oportunidades de alta prioridade (PE REDUC e PE Sanepar).',
    existingContractAtRisk: true,
    suggestedMitigations: [
      {
        id: 'MIT-CONF-01',
        title: 'Locação Emergencial de Espectrômetro com Parceiro Beta',
        cost: 18000,
        marginImpactPct: -2.4,
        feasibility: 'Viable'
      },
      {
        id: 'MIT-CONF-02',
        title: 'Ajuste de Cronograma de Amostragem perante a Sanepar (+6 dias)',
        cost: 0,
        marginImpactPct: 0,
        feasibility: 'Subject to Buyer Approval'
      },
      {
        id: 'MIT-CONF-03',
        title: 'Priorizar PE Petrobras REDUC e declinar participação no PE Sanepar',
        cost: 0,
        marginImpactPct: 0,
        feasibility: 'Human Decision Required'
      }
    ]
  }
];

export const initialPortfolioScenarios = [
  {
    id: 'SCEN-BALANCED',
    name: 'Cenário 1: Crescimento Equilibrado (A + B com Locação)',
    opportunities: ['PE-2026-0891', 'PE-2026-0902', 'PE-2026-0940'],
    totalPipelineValue: 10500000,
    potentialMarginValue: 1890000,
    potentialMarginPct: 18.0,
    capacityPressure: ResourcePressureLevel.STRESSED,
    mitigationCost: 18000,
    contractsProtected: true,
    strategicFitScore: 92,
    tradeoffSummary: 'Persegue as três maiores oportunidades contratando locação externa para o espectrômetro. Preserva margem saudável de 18% e não ameaça o contrato vigente.',
    objectiveAlignment: 'Recomendado para maximização de receita com risco controlado.'
  },
  {
    id: 'SCEN-CONSERVATIVE',
    name: 'Cenário 2: Conservador / Blindagem Total (A + C sem Custo Adicional)',
    opportunities: ['PE-2026-0891', 'PE-2026-0902'],
    totalPipelineValue: 8050000,
    potentialMarginValue: 1530000,
    potentialMarginPct: 19.0,
    capacityPressure: ResourcePressureLevel.BALANCED,
    mitigationCost: 0,
    contractsProtected: true,
    strategicFitScore: 88,
    tradeoffSummary: 'Abre mão do certame da Sanepar. Foco total em Petrobras e Sabesp com 100% de capacidade própria confirmada e folga de 24h na equipe.',
    objectiveAlignment: 'Ideal se a prioridade for zero custo emergencial e estabilidade operacional.'
  },
  {
    id: 'SCEN-AGGRESSIVE',
    name: 'Cenário 3: Expansão Agressiva de Portfólio (Sem Mitigação)',
    opportunities: ['PE-2026-0891', 'PE-2026-0940', 'PE-2026-0902'],
    totalPipelineValue: 10500000,
    potentialMarginValue: 1995000,
    potentialMarginPct: 19.0,
    capacityPressure: ResourcePressureLevel.CRITICAL,
    mitigationCost: 0,
    contractsProtected: false, // VIOLA HARD CONSTRAINT DO CONTRATO VIGENTE!
    strategicFitScore: 94,
    tradeoffSummary: 'Tenta executar todas as propostas sem contratar parceiro adicional. Gera sobrecarga severa no Contrato Petrobras e alto risco de atraso na entrega técnica.',
    objectiveAlignment: 'Não recomendado: Viola compromisso com cliente contratual ativo.'
  }
];
