/**
 * VELLIA LICITAÇÕES — FASE 63: TENDER INTELLIGENCE NETWORK
 * tenderNetworkData.js: Dados Semente Realistas para Fontes, Oportunidades Canônicas, Conflitos e Cobertura
 */

import {
  TenderSourceType,
  SourceTrustLevel,
  SourceHealthStatus,
  CoverageLevel,
  CandidateStatus,
  PrioritizationQuadrant,
  ConflictStatus,
  AuthenticationType,
  ConflictFieldType
} from './tenderNetworkModels.js';

// 4, 5, 8, 10. Fontes de Licitação Pré-Configuradas e Consolidadas
export const initialTenderSources = [
  {
    id: 'SOURCE-PNCP',
    name: 'PNCP — Portal Nacional de Contratações Públicas',
    sourceType: TenderSourceType.OFFICIAL_API,
    provider: 'Governo Federal / Ministério da Gestão (MGI)',
    coverage: CoverageLevel.STRONG,
    official: true,
    authenticationType: AuthenticationType.PUBLIC,
    status: SourceHealthStatus.HEALTHY,
    priority: 1,
    trustLevel: SourceTrustLevel.OFFICIAL,
    freshness: 'Tempo Real (< 15 min)',
    lastSync: '2026-10-20T10:00:00Z',
    lastSuccess: '2026-10-20T10:00:00Z',
    lastFailure: null,
    version: 'v2.1',
    endpointUrl: 'https://pncp.gov.br/api/consulta/v1/contratacoes/publicacao',
    historicalDailyBaseline: 140, // baseline diário em dias úteis
    metrics: {
      totalIngested: 8520,
      uniqueOpportunities: 2940,
      duplicateConfirmations: 5580,
      relevantCount: 380,
      noiseCount: 4200,
      uniqueOpportunityContribution: 2940,
      efficiencyRatio: 0.88
    },
    coverageDetails: {
      regions: ['Nacional', 'Federal', 'Todos os Estados'],
      buyerTypes: ['União', 'Autarquias Federais', 'Grandes Municípios Integrados'],
      modalities: ['Pregão Eletrônico', 'Concorrência', 'Dispensa Eletrônica']
    }
  },
  {
    id: 'SOURCE-COMPRASGOV',
    name: 'Compras.gov.br (Antigo Comprasnet / SIASG)',
    sourceType: TenderSourceType.OFFICIAL_API,
    provider: 'SERPRO / Secretaria de Gestão e Inovação',
    coverage: CoverageLevel.STRONG,
    official: true,
    authenticationType: AuthenticationType.AUTHENTICATED_OFFICIAL,
    status: SourceHealthStatus.HEALTHY,
    priority: 2,
    trustLevel: SourceTrustLevel.OFFICIAL,
    freshness: 'Atualização Horária (< 1h)',
    lastSync: '2026-10-20T09:30:00Z',
    lastSuccess: '2026-10-20T09:30:00Z',
    lastFailure: null,
    version: 'v3.0-serpro',
    endpointUrl: 'https://cnetmobile.estaleiro.serpro.gov.br/comprasnet-web/api/v1',
    historicalDailyBaseline: 95,
    metrics: {
      totalIngested: 6200,
      uniqueOpportunities: 890,
      duplicateConfirmations: 5310,
      relevantCount: 290,
      noiseCount: 3100,
      uniqueOpportunityContribution: 890,
      efficiencyRatio: 0.84
    },
    coverageDetails: {
      regions: ['Federal', 'Pernambuco', 'Bahia', 'Paraíba', 'Rio de Janeiro'],
      buyerTypes: ['Ministérios', 'Forças Armadas', 'Universidades Federais', 'IFs'],
      modalities: ['Pregão Eletrônico', 'Concorrência Eletrônica']
    }
  },
  {
    id: 'SOURCE-PETRONECT',
    name: 'Petronect — Portal de Compras Petrobras & Transpetro',
    sourceType: TenderSourceType.PUBLIC_PORTAL,
    provider: 'Petronect Informática S.A. / Grupo Petrobras',
    coverage: CoverageLevel.STRONG,
    official: true,
    authenticationType: AuthenticationType.PUBLIC,
    status: SourceHealthStatus.HEALTHY,
    priority: 3,
    trustLevel: SourceTrustLevel.VERIFIED,
    freshness: 'A cada 3 horas (< 3h)',
    lastSync: '2026-10-20T08:15:00Z',
    lastSuccess: '2026-10-20T08:15:00Z',
    lastFailure: null,
    version: 'v1.4',
    endpointUrl: 'https://www.petronect.com.br/portalpublico',
    historicalDailyBaseline: 18,
    metrics: {
      totalIngested: 450,
      uniqueOpportunities: 410,
      duplicateConfirmations: 40,
      relevantCount: 145,
      noiseCount: 110,
      uniqueOpportunityContribution: 410,
      efficiencyRatio: 0.94
    },
    coverageDetails: {
      regions: ['Pernambuco (Suape/RNEST)', 'Bahia (RLAM/Polo Camaçari)', 'Rio de Janeiro', 'Offshore'],
      buyerTypes: ['Petrobras', 'Transpetro', 'Subsidiárias'],
      modalities: ['Licitação Lei 13.303/2016', 'Convite Eletrônico', 'Cotação Direta']
    }
  },
  {
    id: 'SOURCE-PORTAL-PB',
    name: 'Portal de Compras Públicas da Paraíba',
    sourceType: TenderSourceType.PUBLIC_PORTAL,
    provider: 'Consórcio de Municípios e Estado da Paraíba',
    coverage: CoverageLevel.WEAK, // Lacuna identificada!
    official: false,
    authenticationType: AuthenticationType.PUBLIC,
    status: SourceHealthStatus.DELAYED,
    priority: 4,
    trustLevel: SourceTrustLevel.VERIFIED,
    freshness: 'Diária (> 24h)',
    lastSync: '2026-10-19T06:00:00Z',
    lastSuccess: '2026-10-19T06:00:00Z',
    lastFailure: null,
    version: 'v1.1',
    endpointUrl: 'https://www.compraspublicas.pb.gov.br/api',
    historicalDailyBaseline: 32,
    metrics: {
      totalIngested: 780,
      uniqueOpportunities: 260,
      duplicateConfirmations: 520,
      relevantCount: 42,
      noiseCount: 510,
      uniqueOpportunityContribution: 260,
      efficiencyRatio: 0.55
    },
    coverageDetails: {
      regions: ['Paraíba (João Pessoa, Campina Grande, Caaporã)'],
      buyerTypes: ['Prefeituras Municipais PB', 'Autarquias Estaduais PB'],
      modalities: ['Pregão Presencial', 'Pregão Eletrônico', 'Dispensa']
    }
  },
  {
    id: 'SOURCE-LICITACOES-E',
    name: 'Licitações-e (Banco do Brasil)',
    sourceType: TenderSourceType.PUBLIC_PORTAL,
    provider: 'Banco do Brasil S.A.',
    coverage: CoverageLevel.MODERATE,
    official: false,
    authenticationType: AuthenticationType.PUBLIC,
    status: SourceHealthStatus.HEALTHY,
    priority: 5,
    trustLevel: SourceTrustLevel.VERIFIED,
    freshness: 'A cada 6 horas (< 6h)',
    lastSync: '2026-10-20T07:00:00Z',
    lastSuccess: '2026-10-20T07:00:00Z',
    lastFailure: null,
    version: 'v2.0',
    endpointUrl: 'https://www.licitacoes-e.com.br/aop/pesquisa',
    historicalDailyBaseline: 65,
    metrics: {
      totalIngested: 2100,
      uniqueOpportunities: 490,
      duplicateConfirmations: 1610,
      relevantCount: 88,
      noiseCount: 1420,
      uniqueOpportunityContribution: 490,
      efficiencyRatio: 0.72
    },
    coverageDetails: {
      regions: ['Nordeste', 'Centro-Oeste', 'Sul'],
      buyerTypes: ['Sociedades de Economia Mista', 'Prefeituras Conveniadas BB'],
      modalities: ['Pregão Eletrônico BB']
    }
  },
  {
    id: 'SOURCE-DOM-PB',
    name: 'Diário Oficial dos Municípios da Paraíba (FAMUP)',
    sourceType: TenderSourceType.PUBLIC_FEED,
    provider: 'Federação das Associações de Municípios da Paraíba',
    coverage: CoverageLevel.WEAK,
    official: false,
    authenticationType: AuthenticationType.PUBLIC,
    status: SourceHealthStatus.DEGRADED,
    priority: 6,
    trustLevel: SourceTrustLevel.SECONDARY,
    freshness: 'Semanal (> 72h)',
    lastSync: '2026-10-18T18:00:00Z',
    lastSuccess: '2026-10-18T18:00:00Z',
    lastFailure: '2026-10-20T06:00:00Z',
    version: 'v0.9-rss',
    endpointUrl: 'https://www.diariomunicipal.com.br/famup/rss',
    historicalDailyBaseline: 24,
    metrics: {
      totalIngested: 620,
      uniqueOpportunities: 75,
      duplicateConfirmations: 545,
      relevantCount: 18,
      noiseCount: 480,
      uniqueOpportunityContribution: 75,
      efficiencyRatio: 0.38
    },
    coverageDetails: {
      regions: ['Municípios do Interior da Paraíba'],
      buyerTypes: ['Câmaras Municipais', 'Pequenas Prefeituras PB'],
      modalities: ['Avisos de Licitação em Texto']
    }
  }
];

// 26, 27. Políticas de Autoridade de Fontes (SourceAuthorityPolicy)
export const initialAuthorityPolicies = [
  {
    sourceType: TenderSourceType.OFFICIAL_API,
    authorityRank: 1, // Prevalece em caso de conflito
    freshnessWeight: 0.85,
    conflictPolicy: 'USE_AS_CANONICAL_PRIMARY_AND_LOG_CONFLICT',
    description: 'APIs federais e oficiais primárias possuem autoridade máxima para prazo e modalidades.'
  },
  {
    sourceType: TenderSourceType.PUBLIC_PORTAL,
    authorityRank: 2,
    freshnessWeight: 0.70,
    conflictPolicy: 'USE_IF_OFFICIAL_ABSENT_ELSE_FLAG_CONFLICT',
    description: 'Portais corporativos ou estaduais possuem precedência para certames locais e privados (ex: Petronect).'
  },
  {
    sourceType: TenderSourceType.PUBLIC_API,
    authorityRank: 3,
    freshnessWeight: 0.60,
    conflictPolicy: 'COMPLEMENTARY_DATA_ONLY',
    description: 'APIs públicas complementam dados de itens e anexos sem sobrescrever datas canônicas.'
  },
  {
    sourceType: TenderSourceType.PUBLIC_FEED,
    authorityRank: 4,
    freshnessWeight: 0.40,
    conflictPolicy: 'REQUIRE_HUMAN_CONFIRMATION',
    description: 'Feeds de texto secundários exigem conferência antes de alterar campos estruturados.'
  }
];

// 14 a 22. Oportunidades Canônicas com múltiplos SourceRecords, Proveniência e Conflitos
export const initialCanonicalOpportunities = [
  {
    id: 'OPP-RNEST-7004321234',
    canonicalCode: 'PE-RNEST-2026-004',
    title: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
    clientCanonical: 'Petrobras — Petróleo Brasileiro S.A. (Refinaria Abreu e Lima)',
    clientCnpj: '33.000.167/0661-84',
    status: 'Publicada / Aberta',
    modality: 'Licitação Lei 13.303/2016',
    estimatedValue: 1850000.00,
    deadline: '2026-11-15T14:00:00Z',
    portalUrl: 'https://www.petronect.com.br/portalpublico/licitacoes/7004321234',
    region: 'Pernambuco (Ipojuca - RNEST)',
    // 21. Proveniência da Oportunidade
    provenance: {
      primarySourceId: 'SOURCE-PETRONECT',
      primarySourceName: 'Petronect',
      additionalSources: ['SOURCE-PNCP'],
      lastSyncAt: '2026-10-20T08:15:00Z',
      isMirrored: true
    },
    // 38 a 42. Rastreabilidade por Campo Crítico (Field-Level Source Provenance)
    fieldProvenance: {
      deadline: { sourceId: 'SOURCE-PETRONECT', sourceName: 'Petronect', value: '2026-11-15T14:00:00Z', recordedAt: '2026-10-20T08:15:00Z' },
      estimatedValue: { sourceId: 'SOURCE-PNCP', sourceName: 'PNCP', value: 1850000.00, recordedAt: '2026-10-20T10:00:00Z' },
      buyer: { sourceId: 'SOURCE-PETRONECT', sourceName: 'Petronect', value: 'Petrobras — Refinaria Abreu e Lima', recordedAt: '2026-10-20T08:15:00Z' },
      status: { sourceId: 'SOURCE-PETRONECT', sourceName: 'Petronect', value: 'Publicada / Aberta', recordedAt: '2026-10-20T08:15:00Z' },
      modality: { sourceId: 'SOURCE-PETRONECT', sourceName: 'Petronect', value: 'Licitação Lei 13.303/2016', recordedAt: '2026-10-20T08:15:00Z' }
    },
    // 16, 17. Lista de SourceRecords individuais
    sourceRecords: [
      {
        sourceId: 'SOURCE-PETRONECT',
        externalId: 'PETRO-7004321234',
        opportunityId: 'OPP-RNEST-7004321234',
        sourceUrl: 'https://www.petronect.com.br/portalpublico/licitacoes/7004321234',
        publishedAt: '2026-10-05T09:00:00Z',
        updatedAt: '2026-10-20T08:15:00Z',
        rawReference: 'Oportunidade 7004321234 - Petrobras RNEST',
        normalizedAt: '2026-10-20T08:16:00Z',
        hash: 'sha256-a1b2c3d4e5f6071829',
        status: 'ACTIVE_PRIMARY'
      },
      {
        sourceId: 'SOURCE-PNCP',
        externalId: 'PNCP-33000167066184-1-000432-2026',
        opportunityId: 'OPP-RNEST-7004321234',
        sourceUrl: 'https://pncp.gov.br/app/editais/33000167066184/2026/432',
        publishedAt: '2026-10-06T11:30:00Z',
        updatedAt: '2026-10-20T10:00:00Z',
        rawReference: 'PNCP Contratação 33000167066184',
        normalizedAt: '2026-10-20T10:01:00Z',
        hash: 'sha256-f9e8d7c6b5a4132456',
        status: 'ACTIVE_MIRROR'
      }
    ],
    // 113 a 118. Documentos deduplicados por Hash SHA-256
    documents: [
      {
        id: 'DOC-RNEST-ED-01',
        title: 'Edital de Licitação Eletrônica 7004321234.pdf',
        version: 1,
        hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        uploadedAt: '2026-10-05T09:10:00Z',
        sourceId: 'SOURCE-PETRONECT',
        isCurrent: true
      },
      {
        id: 'DOC-RNEST-TR-01',
        title: 'Termo de Referência — Amostragem Isocinética.pdf',
        version: 1,
        hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        uploadedAt: '2026-10-05T09:12:00Z',
        sourceId: 'SOURCE-PETRONECT',
        isCurrent: true
      }
    ],
    conflicts: []
  },
  {
    id: 'OPP-CAAPORA-PB-2026',
    canonicalCode: 'PB-CAAPORA-2026-088',
    title: 'Monitoramento da qualidade das águas subterrâneas e ensaios hidrogeológicos',
    clientCanonical: 'Prefeitura Municipal de Caaporã',
    clientCnpj: '08.784.845/0001-35',
    status: 'Publicada / Em Aberto',
    modality: 'Pregão Eletrônico',
    estimatedValue: 480000.00,
    deadline: '2026-10-28T10:00:00Z', // Divergência com portal local (25/10 vs 28/10)!
    portalUrl: 'https://pncp.gov.br/app/editais/08784845000135/2026/88',
    region: 'Paraíba (Caaporã)',
    provenance: {
      primarySourceId: 'SOURCE-PNCP',
      primarySourceName: 'PNCP',
      additionalSources: ['SOURCE-PORTAL-PB', 'SOURCE-DOM-PB'],
      lastSyncAt: '2026-10-20T10:00:00Z',
      isMirrored: true
    },
    fieldProvenance: {
      deadline: { sourceId: 'SOURCE-PNCP', sourceName: 'PNCP (Oficial)', value: '2026-10-28T10:00:00Z', recordedAt: '2026-10-20T10:00:00Z' },
      estimatedValue: { sourceId: 'SOURCE-PORTAL-PB', sourceName: 'Portal PB', value: 480000.00, recordedAt: '2026-10-19T06:00:00Z' },
      buyer: { sourceId: 'SOURCE-PNCP', sourceName: 'PNCP', value: 'Prefeitura Municipal de Caaporã', recordedAt: '2026-10-20T10:00:00Z' },
      status: { sourceId: 'SOURCE-PNCP', sourceName: 'PNCP', value: 'Publicada / Em Aberto', recordedAt: '2026-10-20T10:00:00Z' },
      modality: { sourceId: 'SOURCE-PNCP', sourceName: 'PNCP', value: 'Pregão Eletrônico', recordedAt: '2026-10-20T10:00:00Z' }
    },
    sourceRecords: [
      {
        sourceId: 'SOURCE-PNCP',
        externalId: 'PNCP-08784845000135-2026-088',
        opportunityId: 'OPP-CAAPORA-PB-2026',
        sourceUrl: 'https://pncp.gov.br/app/editais/08784845000135/2026/88',
        publishedAt: '2026-10-12T14:00:00Z',
        updatedAt: '2026-10-20T10:00:00Z',
        rawReference: 'Edital PE 088/2026 Caaporã no PNCP',
        normalizedAt: '2026-10-20T10:02:00Z',
        hash: 'sha256-caa001122334455',
        status: 'ACTIVE_PRIMARY'
      },
      {
        sourceId: 'SOURCE-PORTAL-PB',
        externalId: 'PB-PORTAL-2026-CAAP-088',
        opportunityId: 'OPP-CAAPORA-PB-2026',
        sourceUrl: 'https://www.compraspublicas.pb.gov.br/editais/2026/088',
        publishedAt: '2026-10-11T16:00:00Z',
        updatedAt: '2026-10-19T06:00:00Z',
        rawReference: 'Aviso PE 088 no Portal PB',
        normalizedAt: '2026-10-19T06:05:00Z',
        hash: 'sha256-pb8899aabbcc',
        status: 'ACTIVE_SECONDARY'
      }
    ],
    documents: [
      {
        id: 'DOC-CAAP-01',
        title: 'Edital Pregão 088-2026 Caapora.pdf',
        version: 1,
        hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        uploadedAt: '2026-10-12T14:30:00Z',
        sourceId: 'SOURCE-PNCP',
        isCurrent: true
      }
    ],
    // 29 a 36. Conflitos detectados preservados sem sobrescrita silenciosa
    conflicts: [
      {
        id: 'CONF-001',
        opportunityId: 'OPP-CAAPORA-PB-2026',
        fieldName: ConflictFieldType.DEADLINE,
        primaryValue: '28/10/2026 10:00 (PNCP)',
        conflictingValue: '25/10/2026 10:00 (Portal PB)',
        primarySourceId: 'SOURCE-PNCP',
        conflictingSourceId: 'SOURCE-PORTAL-PB',
        status: ConflictStatus.DETECTED,
        detectedAt: '2026-10-20T10:02:00Z',
        resolutionPolicy: 'OFFICIAL_PRIMARY_AUTHORITY',
        notes: 'Divergência entre PNCP (prorrogado para 28/10) e Portal Local (consta ainda 25/10). PNCP mantido como valor canônico provisório aguardando conferência.'
      }
    ]
  }
];

// 86 a 94. Backlog de Expansão de Fontes (SourceCandidate) & Matriz de Priorização
export const initialSourceCandidates = [
  {
    id: 'CAND-001',
    name: 'Portal de Compras da Prefeitura de Campina Grande — PB',
    type: TenderSourceType.PUBLIC_PORTAL,
    region: 'Paraíba (Agreste)',
    scope: 'Licitações Municipais de Saneamento, Obras e Meio Ambiente',
    discoveryMethod: 'Detecção de Lacuna na Cobertura Regional da Paraíba (Fase 61 Growth)',
    expectedValue: 'Alto (Cobertura de 18 certames ambientais/ano no Agreste)',
    integrationComplexity: 'Baixa (API JSON aberta baseada em CKAN)',
    quadrant: PrioritizationQuadrant.QUICK_WIN,
    status: CandidateStatus.TESTING, // Shadow Mode
    shadowMetrics: {
      daysInShadow: 7,
      ingestedCount: 42,
      duplicateCount: 6,
      uniqueCount: 36,
      errorsCount: 0,
      relevanceScore: 0.82
    },
    notes: 'Roda em modo shadow; já demonstrou 36 oportunidades inéditas sem falhas de parse.'
  },
  {
    id: 'CAND-002',
    name: 'CAGEPA — Companhia de Água e Esgotos da Paraíba (Portal de Licitações)',
    type: TenderSourceType.PUBLIC_PORTAL,
    region: 'Paraíba (Estadual)',
    scope: 'Saneamento, Análises Laboratoriais e Drenagem',
    discoveryMethod: 'Mapeamento de Contratantes Recorrentes de Engenharia',
    expectedValue: 'Muito Alto (Alinhamento direto com Veeluen e Excelência)',
    integrationComplexity: 'Média (Portal próprio com autenticação pública e downloads diretos)',
    quadrant: PrioritizationQuadrant.STRATEGIC,
    status: CandidateStatus.APPROVED,
    shadowMetrics: null,
    notes: 'Aprovado pelo comitê técnico; conector em fase de especificação do adapter.'
  },
  {
    id: 'CAND-003',
    name: 'Portal Transparência dos Municípios de Sergipe',
    type: TenderSourceType.PUBLIC_FEED,
    region: 'Sergipe',
    scope: 'Licitações Municipais Gerais',
    discoveryMethod: 'Varredura de Portais do Nordeste',
    expectedValue: 'Baixo (Volume reduzido de certames ambientais/engenharia)',
    integrationComplexity: 'Baixa (Feed RSS genérico)',
    quadrant: PrioritizationQuadrant.LOW_PRIORITY,
    status: CandidateStatus.EVALUATING,
    shadowMetrics: null,
    notes: 'Avaliação em andamento; prioridade secundária frente aos gaps da Paraíba e Pernambuco.'
  },
  {
    id: 'CAND-004',
    name: 'Portal Restrito com CAPTCHA Obscuro — Fornecedor Privado Z',
    type: TenderSourceType.OTHER,
    region: 'Nacional',
    scope: 'Cotações Privadas de Compras',
    discoveryMethod: 'Sugestão Externa',
    expectedValue: 'Baixo',
    integrationComplexity: 'Alta (Exige bypass de CAPTCHA e automação de área logada sem API)',
    quadrant: PrioritizationQuadrant.AVOID,
    status: CandidateStatus.REJECTED,
    shadowMetrics: null,
    notes: 'REJEITADA CATEGORICAMENTE (Item 3, 215, 241): Política inegociável de segurança proíbe bypass de CAPTCHA ou quebra de autenticação.'
  }
];

// 65 a 71. Matriz de Inteligência de Cobertura de Fontes (Source Coverage)
export const initialCoverageIntelligence = {
  geographicCoverage: [
    { region: 'Nacional / Federal', level: CoverageLevel.STRONG, percent: 92, primarySources: ['PNCP', 'Compras.gov.br'], gapNotes: 'Excelente cobertura federal em órgãos diretos e estatais.' },
    { region: 'Pernambuco (RMR / Suape)', level: CoverageLevel.STRONG, percent: 88, primarySources: ['Petronect', 'PNCP', 'Compras.gov'], gapNotes: 'Forte presença em Suape, RNEST e Complexo Industrial.' },
    { region: 'Bahia (Salvador / Camaçari)', level: CoverageLevel.MODERATE, percent: 65, primarySources: ['Petronect', 'PNCP'], gapNotes: 'Boa cobertura industrial; cobertura média em prefeituras do interior.' },
    { region: 'Paraíba (Interior e Municípios)', level: CoverageLevel.WEAK, percent: 34, primarySources: ['Portal PB', 'DOM-PB'], gapNotes: 'LACUNA ESTRATÉGICA CRÍTICA: Menos de 40% dos certames municipais PB estão sendo capturados com prontidão.' },
    { region: 'Rio Grande do Norte', level: CoverageLevel.WEAK, percent: 28, primarySources: ['PNCP'], gapNotes: 'Baixa cobertura em órgãos estaduais do RN (CAERN, IDEMA).' }
  ],
  institutionalCoverage: [
    { buyerType: 'Empresas Estatais & Economia Mista (Petrobras, Transpetro, BB)', level: CoverageLevel.STRONG, percent: 95 },
    { buyerType: 'Órgãos Federais Diretos (Ministérios, Universidades, Forças Armadas)', level: CoverageLevel.STRONG, percent: 91 },
    { buyerType: 'Governos Estaduais & Secretarias de Meio Ambiente', level: CoverageLevel.MODERATE, percent: 58 },
    { buyerType: 'Prefeituras Municipais de Médio e Pequeno Porte', level: CoverageLevel.WEAK, percent: 36 }
  ]
};
