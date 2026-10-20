/**
 * VELLIA LICITAÇÕES — FASE 61: GROWTH & OPPORTUNITY EXPANSION ENGINE
 * growthData.js: Dados Semente Fatuais e Inteligência Base de Crescimento
 * 
 * Focado nas duas empresas:
 * 1. Excelência Ambiental: Monitoramento de Emissões Atmosféricas, Ruído Ambiental, Licenciamento, Qualidade do Ar
 * 2. Veeluen Solutions: Operação e Manutenção de ETE, PGRS, SPDA, NR-13, Engenharia Ambiental e Sanitária
 */

import {
  GrowthOpportunityType,
  GrowthOpportunityStatus,
  GrowthPipelineStage,
  GrowthPriority,
  GrowthConfidence,
  ExpansionQuadrant,
  GrowthActionType,
  EvidenceSourceType
} from './growthModels.js';

// Afinidadades Históricas de Serviços (com Sample Size obrigatório e verificação de amostra pequena)
export const initialServiceAffinities = [
  {
    primaryService: 'Operação e Manutenção de ETE',
    complementaryService: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS)',
    historicalCases: 8,
    sampleSize: 8, // Amostra robusta
    isSmallSample: false,
    affinityRate: 0.82,
    rationale: 'Organizações com plantas de tratamento de efluentes possuem geração contínua de lodos e resíduos industriais que exigem destinação homologada.',
    commonBuyers: ['Transpetro', 'Braskem', 'Petrobras RNEST', 'Termopernambuco']
  },
  {
    primaryService: 'Operação e Manutenção de ETE',
    complementaryService: 'Inspeção de Caldeiras e Vasos de Pressão (NR-13)',
    historicalCases: 2,
    sampleSize: 2, // Amostra pequena! Exige warning explícito
    isSmallSample: true,
    affinityRate: 0.40,
    rationale: 'Indústrias químicas com ETE frequentemente possuem compressores e vasos sob pressão, porém a correlação amostral histórica na base é de apenas 2 casos.',
    commonBuyers: ['Transpetro']
  },
  {
    primaryService: 'Operação e Manutenção de ETE',
    complementaryService: 'Laudo de SPDA & Aterramento Elétrico',
    historicalCases: 6,
    sampleSize: 6,
    isSmallSample: false,
    affinityRate: 0.75,
    rationale: 'Estações de tratamento possuem quadros elétricos em áreas classificadas e tanques metálicos sujeitos a descargas atmosféricas.',
    commonBuyers: ['Transpetro', 'Petrobras Suape', 'Termopernambuco']
  },
  {
    primaryService: 'Monitoramento de Emissões Atmosféricas',
    complementaryService: 'Monitoramento de Ruído Ambiental Contínuo',
    historicalCases: 9,
    sampleSize: 9,
    isSmallSample: false,
    affinityRate: 0.89,
    rationale: 'Mesma mobilização de campo e equipe técnica de medição ambiental com amostragem perimetral.',
    commonBuyers: ['Petrobras RNEST', 'Aena Brasil', 'Braskem']
  },
  {
    primaryService: 'Monitoramento de Emissões Atmosféricas',
    complementaryService: 'Monitoramento de Qualidade do Ar Perimetral (Adjacente)',
    historicalCases: 5,
    sampleSize: 5,
    isSmallSample: false,
    affinityRate: 0.70,
    rationale: 'Uso de estações automáticas perimetrais adjacentes às chaminés industriais com atestados técnicos conexos.',
    commonBuyers: ['Petrobras RNEST', 'Copergás']
  }
];

// Oportunidades de Crescimento Iniciais Estruturadas
export const initialGrowthOpportunities = [
  {
    id: 'GROWTH-2026-001',
    companyId: 'veeluen',
    companyName: 'Veeluen Solutions',
    type: GrowthOpportunityType.CROSS_SELL,
    title: 'Cross-sell de PGRS em Contrato Vigente de ETE no Terminal de Suape',
    targetOrganization: 'Transpetro - Terminal Aquaviário de Suape',
    targetService: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS)',
    targetRegion: 'Pernambuco (Ipojuca)',
    source: 'Contratos Vigentes + Histórico de Compras',
    status: GrowthOpportunityStatus.ACTION_PLANNED,
    pipelineStage: GrowthPipelineStage.ACTION_PLANNED,
    priority: GrowthPriority.NOW,
    confidence: GrowthConfidence.HIGH,
    createdAt: '2026-09-15T10:00:00Z',
    expiresAt: '2026-12-15T23:59:59Z',
    evidence: [
      {
        type: EvidenceSourceType.ACTIVE_CONTRACT,
        description: 'Contrato ativo CT-2024-8841 de Operação de ETE com excelente SLA de execução (98%).',
        date: '2026-09-01',
        source: 'Módulo de Contratos',
        weight: 'HIGH'
      },
      {
        type: EvidenceSourceType.RECURRING_OPPORTUNITY,
        description: 'Transpetro publicou aviso prévio no PCA para renovação da gestão de resíduos sólidos classe I e II.',
        date: '2026-09-10',
        source: 'Radar Antecipado / PCA',
        weight: 'HIGH'
      },
      {
        type: EvidenceSourceType.CRM_RELATIONSHIP,
        description: 'Relacionamento institucional ativo com a Gerência de SMS e Manutenção.',
        date: '2026-09-12',
        source: 'CRM de Relacionamento',
        weight: 'MEDIUM'
      }
    ],
    readiness: {
      technicalFit: 'ALTO',
      capacityStatus: 'DISPONÍVEL',
      acervoStatus: 'HOMOLOGADO',
      capacityNotes: 'Equipe de engenharia ambiental de Suape possui ociosidade de 25% para absorver a gestão de resíduos sem contratações adicionais.'
    },
    attractiveness: {
      demandLevel: 'ALTA',
      estimatedTicket: 'R$ 680.000,00',
      recurrence: 'CONTRATO ANUAL (12 A 24 MESES)',
      marginProfile: 'MÉDIA-ALTA (24% EBITDA ESTIMADO)',
      competitionLevel: 'MODERADA'
    },
    growthPlan: {
      objective: 'Apresentar proposta de expansão de escopo ou participar do edital específico de PGRS da Transpetro em Suape',
      target: 'Transpetro - Terminal de Suape',
      service: 'PGRS e Gestão de Resíduos Industriais',
      evidenceSummary: 'Contrato ativo de ETE + demanda publicada no PCA para resíduos classe I e II',
      action: 'Aproximação institucional estruturada com envio de portfólio de acervo técnico em resíduos',
      owner: 'Henrique Veeluen (Diretoria Técnica)',
      reviewDate: '2026-10-30',
      commercialTiming: 'Abordar 90 dias antes do término do contrato atual de resíduos da contratante (previsto para Nov/2026)'
    },
    quadrant: ExpansionQuadrant.PRIORITIZE
  },
  {
    id: 'GROWTH-2026-002',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    type: GrowthOpportunityType.NEW_REGION,
    title: 'Expansão Regional de Emissões Atmosféricas no Polo Industrial da Paraíba',
    targetOrganization: 'Polo Cerâmico e Químico de Caaporã / Pitimbu',
    targetService: 'Monitoramento de Emissões Atmosféricas e Qualidade do Ar',
    targetRegion: 'Paraíba (Litoral Sul / João Pessoa)',
    source: 'Market Intelligence + Radar de Editais SUDENE',
    status: GrowthOpportunityStatus.UNDER_REVIEW,
    pipelineStage: GrowthPipelineStage.IDENTIFIED,
    priority: GrowthPriority.BUILD,
    confidence: GrowthConfidence.HIGH,
    createdAt: '2026-09-20T14:30:00Z',
    expiresAt: '2026-12-30T23:59:59Z',
    evidence: [
      {
        type: EvidenceSourceType.MARKET_GROWTH,
        description: 'Órgão ambiental estadual (SUDEMA-PB) intensificou exigências de relatórios de fontes estacionárias para 14 plantas industriais.',
        date: '2026-09-18',
        source: 'Market Intelligence',
        weight: 'HIGH'
      },
      {
        type: EvidenceSourceType.RECURRING_OPPORTUNITY,
        description: 'Três processos licitatórios de órgãos mistos e indústrias estaduais na PB nos últimos 60 dias.',
        date: '2026-09-15',
        source: 'PNCP / Portais Públicos',
        weight: 'MEDIUM'
      }
    ],
    readiness: {
      technicalFit: 'MUITO ALTO',
      capacityStatus: 'PARCIAL',
      acervoStatus: 'COMPLETO',
      capacityNotes: 'Capacidade técnica e equipamentos disponíveis, porém logística de deslocamento diário exige parceria de apoio local ou base avançada em Goiana/Caaporã.'
    },
    attractiveness: {
      demandLevel: 'MUITO ALTA',
      estimatedTicket: 'R$ 1.450.000,00 (Cluster)',
      recurrence: 'RECORRENTE',
      marginProfile: 'ALTA (28% A 32%)',
      competitionLevel: 'BAIXA A MODERADA'
    },
    growthPlan: {
      objective: 'Estruturar logística de mobilização e credenciamento perante o órgão estadual da PB antes de disputas agressivas',
      target: 'Mercado Industrial PB',
      service: 'Emissões Atmosféricas e Amostragem Isocinética',
      evidenceSummary: 'Demanda crescente de conformidade SUDEMA + carência de laboratórios móveis certificados na PB',
      action: 'Qualificar parceiro de apoio logístico em João Pessoa ou Goiana e realizar visita institucional',
      owner: 'Clarice Mendes (Diretoria Comercial)',
      reviewDate: '2026-11-10',
      commercialTiming: 'Após fechamento do acordo logístico de campo'
    },
    quadrant: ExpansionQuadrant.DEVELOP_CAPABILITY
  },
  {
    id: 'GROWTH-2026-003',
    companyId: 'veeluen',
    companyName: 'Veeluen Solutions',
    type: GrowthOpportunityType.NEW_BUYER,
    title: 'Novo Comprador Homólogo: Termopernambuco S.A. (Perfil Simétrico a Transpetro)',
    targetOrganization: 'Termopernambuco S.A. (Complexo Portuário de Suape)',
    targetService: 'Operação de ETE e Gestão Hídrica Industrial',
    targetRegion: 'Pernambuco (Ipojuca)',
    source: 'Buyer Similarity Matcher (Market Intelligence)',
    status: GrowthOpportunityStatus.VALIDATED,
    pipelineStage: GrowthPipelineStage.VALIDATED,
    priority: GrowthPriority.NOW,
    confidence: GrowthConfidence.HIGH,
    createdAt: '2026-09-28T09:15:00Z',
    expiresAt: '2027-01-20T23:59:59Z',
    evidence: [
      {
        type: EvidenceSourceType.BUYER_PATTERN,
        description: 'Comprador opera no mesmo parque geográfico de Suape, contrata sob regime de medição quinzenal e possui requisitos de SMS Petrobras-grade.',
        date: '2026-09-25',
        source: 'Análise de Similaridade de Compradores',
        weight: 'HIGH'
      },
      {
        type: EvidenceSourceType.HISTORICAL_PURCHASE,
        description: 'Histórico de compras de R$ 2.8M em serviços de tratamento de efluentes no último triênio.',
        date: '2026-09-26',
        source: 'Market Intelligence',
        weight: 'HIGH'
      }
    ],
    readiness: {
      technicalFit: 'TOTAL',
      capacityStatus: 'ALTA PRONTIDÃO',
      acervoStatus: 'HOMOLOGADO',
      capacityNotes: 'Equipe e base operacional a 4km da planta industrial da Termopernambuco.'
    },
    attractiveness: {
      demandLevel: 'ALTA',
      estimatedTicket: 'R$ 1.800.000,00',
      recurrence: 'CONTRATO CONTINUADO DE 24 MESES',
      marginProfile: 'MÉDIA (22% EBITDA)',
      competitionLevel: 'MODERADA'
    },
    growthPlan: {
      objective: 'Cadastramento de fornecedor homologado e apresentação de atestados técnicos de Suape',
      target: 'Termopernambuco S.A.',
      service: 'Operação de ETE & Efluentes Industriais',
      evidenceSummary: 'Perfil 92% compatível com a operação atual da Transpetro Suape',
      action: 'Solicitar abertura de cadastro no portal corporativo e agendar reunião técnica institucional com gerência de utilidades',
      owner: 'Henrique Veeluen',
      reviewDate: '2026-10-25',
      commercialTiming: 'Anteceder a renovação bienal do contrato de utilidades da usina termoelétrica'
    },
    quadrant: ExpansionQuadrant.PRIORITIZE
  },
  {
    id: 'GROWTH-2026-004',
    companyId: 'veeluen',
    companyName: 'Veeluen Solutions',
    type: GrowthOpportunityType.NEW_SERVICE_MARKET,
    title: 'Demanda de Mercado em Inspeção de Vasos de Pressão (NR-13) com Gap de Capacidade',
    targetOrganization: 'Polo Petroquímico de Camaçari e Suape',
    targetService: 'Inspeção e Laudos Técnicos NR-13 (Vasos e Caldeiras)',
    targetRegion: 'Pernambuco e Bahia',
    source: 'Market Intelligence + Oportunidades do Radar',
    status: GrowthOpportunityStatus.IDENTIFIED,
    pipelineStage: GrowthPipelineStage.IDENTIFIED,
    priority: GrowthPriority.BUILD,
    confidence: GrowthConfidence.MEDIUM,
    createdAt: '2026-10-02T11:00:00Z',
    expiresAt: '2027-02-01T23:59:59Z',
    evidence: [
      {
        type: EvidenceSourceType.RECURRING_OPPORTUNITY,
        description: 'NR-13 figurou em 7 editais nos portais Petrobras e PNCP no último semestre com valores expressivos.',
        date: '2026-10-01',
        source: 'Radar Petronect / PNCP',
        weight: 'HIGH'
      }
    ],
    readiness: {
      technicalFit: 'MÉDIO',
      capacityStatus: 'CAPACIDADE LIMITADA (GAP IDENTIFICADO)',
      acervoStatus: 'ACERVO PARCIAL',
      capacityNotes: 'Atestados atuais cobrem apenas vasos de pequeno porte; demanda frequente exige PH (Profissional Habilitado Mecânico) sênior e ultrassom phased-array próprio.'
    },
    attractiveness: {
      demandLevel: 'MUITO ALTA',
      estimatedTicket: 'R$ 950.000,00 por contrato',
      recurrence: 'CONTRATOS ANUAIS DE PARADA',
      marginProfile: 'DADO NÃO AUDITADO NA BASE (Margem estimada em 18-22%)',
      competitionLevel: 'ALTA'
    },
    growthPlan: {
      objective: 'Fortalecer capacidade técnica e parcerias antes de disputar editais vultosos de NR-13',
      target: 'Mercado de Inspeção Mecânica',
      service: 'NR-13 Completa',
      evidenceSummary: 'Demanda observada relevante, porém prontidão interna restrita',
      action: 'Avaliar contratação de responsável técnico mecânico ou consórcio com empresa parceira de ensaios não destrutivos',
      owner: 'Clarice Mendes',
      reviewDate: '2026-11-20',
      commercialTiming: 'Aguardar fechamento de parceria técnica'
    },
    quadrant: ExpansionQuadrant.DEVELOP_CAPABILITY
  },
  {
    id: 'GROWTH-2026-005',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    type: GrowthOpportunityType.ADJACENT_MARKET,
    title: 'Mercado Adjacente: Monitoramento Contínuo de Ruído Perimetral em Terminais Aeroportuários',
    targetOrganization: 'Aena Brasil - Aeroporto Internacional do Recife',
    targetService: 'Monitoramento Contínuo de Ruído Aeronáutico e Ambiental',
    targetRegion: 'Pernambuco (Recife)',
    source: 'Oportunidades PNCP + Acervo Conexo',
    status: GrowthOpportunityStatus.UNDER_REVIEW,
    pipelineStage: GrowthPipelineStage.IDENTIFIED,
    priority: GrowthPriority.WATCH,
    confidence: GrowthConfidence.HIGH,
    createdAt: '2026-10-05T16:00:00Z',
    expiresAt: '2027-01-15T23:59:59Z',
    evidence: [
      {
        type: EvidenceSourceType.RELATED_SERVICE,
        description: 'Excelência Ambiental possui histórico consolidado em monitoramento de ruído industrial para Petrobras RNEST e conformidade CPRH.',
        date: '2026-10-04',
        source: 'Documentos & Acervo Vellia',
        weight: 'HIGH'
      },
      {
        type: EvidenceSourceType.RECURRING_OPPORTUNITY,
        description: 'Concessionária Aena possui plano diretor de ruído homologado pela ANAC com medições quadrimestrais obrigatórias.',
        date: '2026-10-03',
        source: 'Relatório Regulatório ANAC',
        weight: 'HIGH'
      }
    ],
    readiness: {
      technicalFit: 'ALTO',
      capacityStatus: 'DISPONÍVEL',
      acervoStatus: 'HOMOLOGADO',
      capacityNotes: 'Sonômetros tipo 1 com calibração RBC vigentes e equipe com proficiência em mapas de ruído computacionais (CadnaA).'
    },
    attractiveness: {
      demandLevel: 'MÉDIA',
      estimatedTicket: 'R$ 420.000,00',
      recurrence: 'CONTRATO ANUAL',
      marginProfile: 'ALTA (35% EBITDA)',
      competitionLevel: 'BAIXA (Poucos fornecedores com sonômetros integrados classe 1 na RMR)'
    },
    growthPlan: {
      objective: 'Posicionar a Excelência Ambiental como fornecedora homologada para as campanhas de ruído da Aena',
      target: 'Aena Brasil (Recife)',
      service: 'Ruído Perimetral e Mapas Acústicos',
      evidenceSummary: 'Equipamentos e atestados homologados para escopo análogo ao aeroportuário',
      action: 'Encaminhar credenciamento técnico institucional com portfólio de ensaios acústicos',
      owner: 'Clarice Mendes',
      reviewDate: '2026-11-05',
      commercialTiming: 'Campanha de atualização de ruído antes do final do ano letivo de voos'
    },
    quadrant: ExpansionQuadrant.PRIORITIZE
  },
  {
    id: 'GROWTH-2026-006',
    companyId: 'veeluen',
    companyName: 'Veeluen Solutions',
    type: GrowthOpportunityType.RENEWAL_EXPANSION,
    title: 'Renovação com Expansão de Escopo: Tratamento Químico em Contrato Petrobras RNEST',
    targetOrganization: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
    targetService: 'Operação de ETE + Tratamento Químico de Efluentes Oleosos',
    targetRegion: 'Pernambuco (Ipojuca)',
    source: 'Radar Antecipado de Vencimento de Contratos',
    status: GrowthOpportunityStatus.VALIDATED,
    pipelineStage: GrowthPipelineStage.ACTION_PLANNED,
    priority: GrowthPriority.NOW,
    confidence: GrowthConfidence.HIGH,
    createdAt: '2026-10-06T08:00:00Z',
    expiresAt: '2027-02-15T23:59:59Z',
    evidence: [
      {
        type: EvidenceSourceType.EXPIRY_SIGNAL,
        description: 'Contrato atual vence em 140 dias. Prazo ideal para posicionamento institucional e validação de aditivos ou novo certame.',
        date: '2026-10-05',
        source: 'Radar Antecipado Vellia',
        weight: 'HIGH'
      },
      {
        type: EvidenceSourceType.CRM_RELATIONSHIP,
        description: 'Índice de satisfação operacional registrado na fiscalização Petrobras de 9.4/10.',
        date: '2026-09-30',
        source: 'Módulo de Contratos & CRM',
        weight: 'HIGH'
      }
    ],
    readiness: {
      technicalFit: 'TOTAL',
      capacityStatus: 'ALTA PRONTIDÃO',
      acervoStatus: 'PLENO',
      capacityNotes: 'Equipe já mobilizada internamente na refinaria, facilitando ganho de escala marginal.'
    },
    attractiveness: {
      demandLevel: 'CRÍTICA',
      estimatedTicket: 'R$ 3.820.000,00',
      recurrence: 'CONTRATO CONTINUADO',
      marginProfile: 'MÉDIA (20% A 23%)',
      competitionLevel: 'ALTA'
    },
    growthPlan: {
      objective: 'Garantir retenção com inclusão de serviço complementar de polimento biológico',
      target: 'Petrobras RNEST',
      service: 'Operação e Polimento Químico de Efluentes',
      evidenceSummary: 'Vencimento em 140 dias + excelente avaliação técnica da fiscalização',
      action: 'Apresentar relatório de melhorias operacionais e ganhos de eficiência alcançados no ciclo vigente',
      owner: 'Henrique Veeluen',
      reviewDate: '2026-10-28',
      commercialTiming: 'Exatamente 120 dias antes do término da vigência'
    },
    quadrant: ExpansionQuadrant.PRIORITIZE
  }
];

// Dados Estruturados de Similaridade de Compradores (Fatores Transparentes sem Score Opaco)
export const initialTargetBuyers = [
  {
    organization: 'Termopernambuco S.A.',
    relevantServices: ['Operação de ETE', 'SPDA', 'Laudo de Conformidade de Efluentes'],
    similarityFactors: {
      industry: 'Geração de Energia / Termelétrica',
      region: 'Ipojuca - PE (Mesmo polo de Suape)',
      purchaseCategories: ['Utilidades Industriais', 'Tratamento de Água e Efluentes', 'Manutenção'],
      ticketRange: 'R$ 1.5M a R$ 3.0M anuais',
      frequency: 'Contratos continuados de 24 meses',
      contractType: 'Contratação privada com padrão de governança Petrobras-grade'
    },
    evidence: 'Demanda observada de R$ 2.8M no último triênio para utilidades e efluentes industriais.',
    lastKnownPurchase: 'Julho/2024 (Contrato de Efluentes)',
    futureSignal: 'Vencimento da contratação atual previsto para 1º Tri/2027.',
    relationshipStatus: 'SEM CONTATO COMERCIAL ATIVO (Alvo Prospectivo Qualificado)',
    watchlist: true,
    companyTarget: 'veeluen'
  },
  {
    organization: 'Braskem Q1 Polo Suape',
    relevantServices: ['Operação de ETE', 'PGRS', 'Monitoramento de Emissões'],
    similarityFactors: {
      industry: 'Petroquímica de Resinas',
      region: 'Ipojuca - PE',
      purchaseCategories: ['Gestão de Resíduos Perigosos', 'Emissões Atmosféricas', 'Efluentes Químicos'],
      ticketRange: 'R$ 800k a R$ 2.2M',
      frequency: 'Campanhas anuais e contratos de 36 meses',
      contractType: 'RFI/RFP Privada'
    },
    evidence: 'Demanda de licenciamento e tratamento de efluentes fenólicos homologada na CPRH.',
    lastKnownPurchase: 'Dezembro/2025 (PGRS Industrial)',
    futureSignal: 'Publicação de RFP para monitoramento perimetral prevista para Jan/2027.',
    relationshipStatus: 'CONTATO INICIAL REALIZADO (Reunião Técnica em 2025)',
    watchlist: true,
    companyTarget: 'group'
  },
  {
    organization: 'Aena Brasil (Aeroportos do Nordeste)',
    relevantServices: ['Ruído Ambiental', 'Licenciamento e Regularização', 'Gestão de Efluentes'],
    similarityFactors: {
      industry: 'Infraestrutura e Transportes',
      region: 'PE, PB, RN, AL (Cluster Nordeste)',
      purchaseCategories: ['Monitoramento Ambiental', 'Estudos Acústicos', 'Licenciamento'],
      ticketRange: 'R$ 300k a R$ 900k por aeroporto',
      frequency: 'Contratos anuais renováveis',
      contractType: 'Pregão Eletrônico Privado / Cotação Direta'
    },
    evidence: 'Exigência de planos acústicos pela ANAC para 6 aeroportos sob concessão no Nordeste.',
    lastKnownPurchase: 'Março/2025 (Medição Acústica Recife)',
    futureSignal: 'Nova rodada de contratações de sustentabilidade no 2º Tri/2027.',
    relationshipStatus: 'SEM RELACIONAMENTO FORMAL',
    watchlist: true,
    companyTarget: 'excelencia'
  },
  {
    organization: 'Copergás - Cia Pernambucana de Gás',
    relevantServices: ['Licenciamento Ambiental de Gasodutos', 'Emissões Fugitivas de Metano', 'SPDA'],
    similarityFactors: {
      industry: 'Distribuição de Gás Canalizado',
      region: 'Região Metropolitana do Recife e Agreste',
      purchaseCategories: ['Engenharia Ambiental', 'Inspeções de Faixa de Dutos', 'SMS'],
      ticketRange: 'R$ 500k a R$ 1.2M',
      frequency: 'Licitações públicas periódicas (Lei 13.303)',
      contractType: 'Licitação Eletrônica Pública'
    },
    evidence: 'Três editais lançados no portal PE Integrado para faixas de dutos em 2025.',
    lastKnownPurchase: 'Agosto/2025 (Monitoramento de Faixas)',
    futureSignal: 'Expansão do gasoduto no polo cerâmico com licitação prevista para 2027.',
    relationshipStatus: 'HOMOLOGAÇÃO EM AVALIAÇÃO',
    watchlist: false,
    companyTarget: 'excelencia'
  }
];

// Dados de Expansão Regional (com Checagem Obrigatória de Capacidade e Prontidão)
export const initialRegionalExpansions = [
  {
    region: 'Paraíba (Polo Industrial Caaporã / Pitimbu / Goiana PB)',
    demandLevel: 'ALTA',
    serviceTarget: 'Emissões Atmosféricas e Amostragem Isocinética',
    historicalOpportunities: 8,
    activeBuyersCount: 6,
    capacityStatus: 'CAPACIDADE TÉCNICA EXISTENTE, LOGÍSTICA EXIGE APOIO LOCAL',
    mobilizationReadiness: 'MODERADA (65/100)',
    competitionLevel: 'BAIXA A MODERADA (Falta de laboratórios locais credenciados)',
    readinessGap: 'Necessidade de base de apoio rápido em Goiana/Caaporã para evitar custos excessivos de diárias.',
    recommendationLabel: 'Região a Avaliar (Estruturar apoio operacional antes de expansão agressiva)',
    companyTarget: 'excelencia',
    status: 'ANALYZING',
    evidence: 'Exigências rigorosas da SUDEMA-PB e 8 licitações observadas nos últimos 12 meses.'
  },
  {
    region: 'Bahia (Polo Petroquímico de Camaçari / RLAM)',
    demandLevel: 'MUITO ALTA',
    serviceTarget: 'Operação de ETE e Tratamento de Efluentes Químicos',
    historicalOpportunities: 14,
    activeBuyersCount: 11,
    capacityStatus: 'CAPACIDADE TÉCNICA ALTA, DISTÂNCIA LOGÍSTICA REQUER PARCEIRO LOCAL',
    mobilizationReadiness: 'MÉDIA-BAIXA (48/100)',
    competitionLevel: 'ALTA (Presença de players tradicionais locais)',
    readinessGap: 'Falta de frota própria e equipe residente na Bahia; expansão direta sem parceiro gera risco de margem.',
    recommendationLabel: 'Desenvolver Parceria Estratégica antes de Investimento Direto',
    companyTarget: 'veeluen',
    status: 'WATCHING',
    evidence: 'Volume de contratações acima de R$ 18M no polo, porém custo de mobilização de PE para BA comprime a margem histórica de 24% para 12%.'
  },
  {
    region: 'Alagoas (Polo Cloroquímico de Marechal Deodoro)',
    demandLevel: 'MODERADA',
    serviceTarget: 'Monitoramento Ambiental & SPDA',
    historicalOpportunities: 4,
    activeBuyersCount: 3,
    capacityStatus: 'ALTA PRONTIDÃO LOGÍSTICA (Apoio via Suape em 2h de deslocamento)',
    mobilizationReadiness: 'ALTA (82/100)',
    competitionLevel: 'MODERADA',
    readinessGap: 'Volume de contratações esparso; focar em contratos pontuais sem custo fixo permanente.',
    recommendationLabel: 'Oportunidades Específicas / Mobilização Direta Sob Demanda',
    companyTarget: 'group',
    status: 'MONITORING',
    evidence: 'Plantas industriais químicas com paradas anuais de manutenção.'
  }
];

// Dados de Cobertura de Serviços Conhecida (Strategic Accounts & White Spaces)
// REGRA: Nunca chamar de Share of Wallet sem dados completos; usar Cobertura de Serviços Conhecida
export const initialStrategicAccountsCoverage = [
  {
    organization: 'Transpetro - Terminais Nordeste',
    observedCategoriesCount: 5, // Demanda total observada em 5 categorias
    activeCategoriesCount: 2,   // Atuamos em 2: Operação de ETE e Suporte Técnico Operacional
    knownCoveragePct: 40,       // 2 de 5 = 40% de cobertura conhecida
    activeServices: ['Operação de ETE', 'Manutenção Eletromecânica Básica'],
    whiteSpaces: [
      {
        service: 'Plano de Gerenciamento de Resíduos Sólidos (PGRS)',
        buyerUses: true,
        companyHasCapacity: true,
        currentlyProviding: false,
        priority: 'ALTA',
        notes: 'Demanda recorrente observada no PCA; Veeluen tem equipe técnica apta.'
      },
      {
        service: 'Laudo Pericial de SPDA e Malhas de Aterramento',
        buyerUses: true,
        companyHasCapacity: true,
        currentlyProviding: false,
        priority: 'MÉDIA',
        notes: 'Necessidade observada a cada 12 meses para renovação de seguro patrimonial.'
      },
      {
        service: 'Inspeção Especializada de Vasos de Pressão (NR-13)',
        buyerUses: true,
        companyHasCapacity: false, // Gap!
        currentlyProviding: false,
        priority: 'BAIXA (Exige desenvolvimento de capacidade)',
        notes: 'Comprador utiliza, mas Veeluen possui capacidade limitada nesta categoria.'
      }
    ],
    relationshipStrength: 'FORTE (Contratos vigentes com alta pontuação de fiscalização)',
    knownFutureSignals: 'Edital de resíduos industriais previsto para Nov/2026'
  },
  {
    organization: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
    observedCategoriesCount: 6,
    activeCategoriesCount: 2, // Atuamos em 2: Emissões Atmosféricas (Excelência) e Operação de ETE (Veeluen)
    knownCoveragePct: 33,
    activeServices: ['Monitoramento de Emissões Atmosféricas', 'Operação de ETE'],
    whiteSpaces: [
      {
        service: 'Monitoramento Contínuo de Ruído Ambiental Perimetral',
        buyerUses: true,
        companyHasCapacity: true,
        currentlyProviding: false,
        priority: 'ALTA',
        notes: 'Excelência Ambiental possui sonômetros calibrados e atestados para plantas petroquímicas.'
      },
      {
        service: 'Polimento Químico de Efluentes com Adição de Polímeros',
        buyerUses: true,
        companyHasCapacity: true,
        currentlyProviding: false,
        priority: 'ALTA',
        notes: 'Sinergia direta com o contrato de ETE da Veeluen em operação.'
      }
    ],
    relationshipStrength: 'ESTRATÉGICO / HISTÓRICO CONSOLIDADO',
    knownFutureSignals: 'Renovação da operação de ETE em 140 dias'
  }
];

// Concentração de Carteira (Para alertas estratégicos de diversificação)
export const initialConcentrationMetrics = {
  buyerConcentration: {
    topBuyerName: 'Petrobras & Transpetro (Grupo)',
    concentrationPct: 58, // 58% do faturamento concentrado em 1 grupo de compradores
    alertLevel: 'ALERTA DE CONCENTRAÇÃO ELEVADA',
    recommendation: 'Expandir base de compradores homologados para reduzir dependência do Sistema Petrobras (ex: Termopernambuco, Braskem, Aena).'
  },
  contractConcentration: {
    top3ContractsPct: 64,
    alertLevel: 'MODERADO',
    recommendation: 'Diversificar com contratos de médio porte (R$ 400k a R$ 800k) com clientes privados industriais.'
  },
  serviceConcentration: {
    topServiceName: 'Operação e Manutenção de ETE',
    concentrationPct: 52,
    alertLevel: 'MODERADO',
    recommendation: 'Aumentar participação de PGRS, Ruído e Estudos de Qualidade do Ar.'
  }
};
