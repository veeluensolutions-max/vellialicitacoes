/**
 * VELLIA LICITAÇÕES — FASE 65: OUTCOME INTELLIGENCE
 * outcomeData.js: Dataset Analítico Canônico de Resultados de Participação e Execução
 */

import {
  OutcomeResultType,
  DisqualificationReason,
  NoSubmissionReason,
  LossReasonCategory,
  PatternStatus,
  ContractExecutionOutcome,
  ParticipationStructureType
} from './outcomeModels.js';

export const initialOutcomeRecords = [
  // 1. Vitórias com Antecipação (Readiness Lead Time Alto)
  {
    id: 'OUT-001',
    opportunityId: 'OPP-RNEST-7004321234',
    canonicalCode: 'PE-RNEST-2026-004',
    title: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
    clientCanonical: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    buyerType: 'Empresa Estatal (Petrobras)',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    serviceCategory: 'Emissões Atmosféricas',
    region: 'Pernambuco',
    modality: 'Licitação Lei 13.303/2016',
    estimatedValue: 1850000.00,
    valueRange: '> 1M',
    resultType: OutcomeResultType.WON,
    submissionDate: '2026-08-10T14:00:00Z',
    period: '2026-Q3',
    // Timing do Lifecycle
    timing: {
      timeToQualificationHours: 12,
      timeToGoDecisionHours: 18,
      timeToPricingHours: 24,
      readinessLeadTimeHours: 34, // Ficou pronta 34h antes do prazo final!
      submissionLeadTimeHours: 6
    },
    // Precificação
    pricing: {
      ourFinalPrice: 1720000.00,
      winningPrice: 1720000.00,
      priceDeltaPct: 0.0,
      ourMarginPct: 18.2,
      marginBand: '15-20%'
    },
    participationStructure: ParticipationStructureType.CONSORTIUM,
    partnerId: 'PARTNER-002',
    partnerName: 'SondaLab Analítica Nordeste',
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: true, // Blocker inicial resolvido antes da submissão
    hadWaivers: false,
    lossDetails: null,
    noSubmissionDetails: null,
    // Pós-Execução
    contractOutcome: {
      status: ContractExecutionOutcome.SUCCESSFUL,
      realizedMarginPct: 17.8,
      slaIncidentsCount: 0,
      notes: 'Contrato em execução com medições regulares aprovadas pela fiscalização da RNEST.'
    }
  },
  {
    id: 'OUT-002',
    opportunityId: 'OPP-SUDEMA-2026-012',
    canonicalCode: 'PB-SUDEMA-2026-012',
    title: 'Elaboração de Inventário Estadual de Fontes Emissoras e Qualidade do Ar',
    clientCanonical: 'SUDEMA — Superintendência de Administração do Meio Ambiente',
    buyerType: 'Autarquia Estadual de Meio Ambiente',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    serviceCategory: 'Inventários e Modelagem',
    region: 'Paraíba',
    modality: 'Concorrência Eletrônica',
    estimatedValue: 890000.00,
    valueRange: '500k-1M',
    resultType: OutcomeResultType.WON,
    submissionDate: '2026-06-15T10:00:00Z',
    period: '2026-Q2',
    timing: {
      timeToQualificationHours: 10,
      timeToGoDecisionHours: 20,
      timeToPricingHours: 18,
      readinessLeadTimeHours: 30, // 30h de antecedência
      submissionLeadTimeHours: 4
    },
    pricing: {
      ourFinalPrice: 830000.00,
      winningPrice: 830000.00,
      priceDeltaPct: 0.0,
      ourMarginPct: 16.5,
      marginBand: '15-20%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: false,
    hadWaivers: false,
    lossDetails: null,
    noSubmissionDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.SUCCESSFUL,
      realizedMarginPct: 16.1,
      slaIncidentsCount: 0,
      notes: 'Entregas de relatórios técnicos cumpridas rigorosamente no prazo.'
    }
  },
  {
    id: 'OUT-003',
    opportunityId: 'OPP-SUAPE-7004319802',
    canonicalCode: 'PE-SUAPE-2026-081',
    title: 'Monitoramento hidrogeológico e ensaios de vazão no Terminal Aquaviário',
    clientCanonical: 'Transpetro — Petrobras Transporte S.A. (Terminal de Suape)',
    buyerType: 'Empresa Estatal (Transpetro)',
    companyId: 'veeluensolutions',
    companyName: 'Veeluen Solutions',
    serviceCategory: 'Ensaios Hidrogeológicos',
    region: 'Pernambuco',
    modality: 'Licitação Lei 13.303/2016',
    estimatedValue: 1250000.00,
    valueRange: '> 1M',
    resultType: OutcomeResultType.WON,
    submissionDate: '2026-07-22T09:00:00Z',
    period: '2026-Q3',
    timing: {
      timeToQualificationHours: 8,
      timeToGoDecisionHours: 16,
      timeToPricingHours: 22,
      readinessLeadTimeHours: 28, // 28h de antecedência
      submissionLeadTimeHours: 5
    },
    pricing: {
      ourFinalPrice: 1190000.00,
      winningPrice: 1190000.00,
      priceDeltaPct: 0.0,
      ourMarginPct: 17.0,
      marginBand: '15-20%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: false,
    hadWaivers: false,
    lossDetails: null,
    noSubmissionDetails: null,
    // 146 a 149. "Win with execution deterioration" (Aprendizado pós-contrato)
    contractOutcome: {
      status: ContractExecutionOutcome.MARGIN_EROSION,
      realizedMarginPct: 7.4, // Margem caiu de 17% para 7.4%!
      slaIncidentsCount: 2,
      notes: 'Vitória legítima no certame, porém houve deterioração na execução devido a quebra inesperada de sonda em campo e custo adicional de mobilização.'
    }
  },

  // 2. Perdas Normais e "Disciplined Losses"
  {
    id: 'OUT-004',
    opportunityId: 'OPP-SABESP-2026-44',
    canonicalCode: 'SP-SABESP-2026-044',
    title: 'Operação e manutenção de estações elevatórias de esgoto na região metropolitana',
    clientCanonical: 'SABESP — Companhia de Saneamento Básico de SP',
    buyerType: 'Sociedade de Economia Mista Estadual',
    companyId: 'veeluensolutions',
    companyName: 'Veeluen Solutions',
    serviceCategory: 'Saneamento e EEE',
    region: 'São Paulo',
    modality: 'Pregão Eletrônico',
    estimatedValue: 4250000.00,
    valueRange: '> 1M',
    resultType: OutcomeResultType.LOST,
    submissionDate: '2026-05-18T10:00:00Z',
    period: '2026-Q2',
    timing: {
      timeToQualificationHours: 24,
      timeToGoDecisionHours: 48,
      timeToPricingHours: 36,
      readinessLeadTimeHours: 8, // Apenas 8h de antecedência!
      submissionLeadTimeHours: 1
    },
    pricing: {
      ourFinalPrice: 3850000.00,
      winningPrice: 3200000.00,
      priceDeltaPct: 20.3, // Preço do vencedor foi 20% menor
      ourMarginPct: 15.5,
      marginBand: '15-20%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: true,
    hadWaivers: false,
    // 141 a 145. Disciplined Loss: empresa preservou seu piso de margem (15.5%)
    lossDetails: {
      category: LossReasonCategory.OFFICIAL_REASON,
      reasonText: 'Concorrente apresentou proposta com margem presumida predatória (< 4%). Vellia optou por manter a disciplina financeira.',
      isDisciplinedLoss: true
    },
    noSubmissionDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.NOT_APPLICABLE,
      realizedMarginPct: null,
      slaIncidentsCount: 0,
      notes: null
    }
  },
  {
    id: 'OUT-005',
    opportunityId: 'OPP-COMPESA-2025-089',
    canonicalCode: 'PE-COMPESA-2025-089',
    title: 'Serviços de batimetria e topografia em reservatórios no Agreste',
    clientCanonical: 'COMPESA — Companhia Pernambucana de Saneamento',
    buyerType: 'Sociedade de Economia Mista Estadual',
    companyId: 'veeluensolutions',
    companyName: 'Veeluen Solutions',
    serviceCategory: 'Topografia e Batimetria',
    region: 'Pernambuco',
    modality: 'Pregão Eletrônico',
    estimatedValue: 340000.00,
    valueRange: '100-500k',
    resultType: OutcomeResultType.LOST,
    submissionDate: '2025-11-10T14:00:00Z',
    period: '2025-Q4',
    timing: {
      timeToQualificationHours: 18,
      timeToGoDecisionHours: 32,
      timeToPricingHours: 20,
      readinessLeadTimeHours: 9, // Lead time curto
      submissionLeadTimeHours: 2
    },
    pricing: {
      ourFinalPrice: 310000.00,
      winningPrice: 2950000.00,
      priceDeltaPct: 5.0,
      ourMarginPct: 13.5,
      marginBand: '10-15%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: false,
    hadWaivers: false,
    // Perda sem razão oficial registrada (para validar Teste 5 e Teste 13)
    lossDetails: {
      category: LossReasonCategory.INFERRED_SIGNAL,
      reasonText: 'Sem ata detalhada no portal. Sinal inferido por lance do concorrente.',
      hasOfficialReason: false
    },
    noSubmissionDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.NOT_APPLICABLE,
      realizedMarginPct: null,
      slaIncidentsCount: 0,
      notes: null
    }
  },

  // 3. Certame Cancelado / Anulado (NÃO é contabilizado como Lost)
  {
    id: 'OUT-006',
    opportunityId: 'OPP-CAERN-2026-CANCELLED',
    canonicalCode: 'RN-CAERN-2026-003',
    title: 'Monitoramento de efluentes industriais em estações de tratamento',
    clientCanonical: 'CAERN — Companhia de Águas e Esgotos do Rio Grande do Norte',
    buyerType: 'Sociedade de Economia Mista Estadual',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    serviceCategory: 'Efluentes Industriais',
    region: 'Rio Grande do Norte',
    modality: 'Pregão Eletrônico',
    estimatedValue: 620000.00,
    valueRange: '500k-1M',
    resultType: OutcomeResultType.CANCELLED, // 8, 9, 22. Revogada!
    submissionDate: '2026-03-12T10:00:00Z',
    period: '2026-Q1',
    timing: {
      timeToQualificationHours: 14,
      timeToGoDecisionHours: 22,
      timeToPricingHours: 20,
      readinessLeadTimeHours: 22,
      submissionLeadTimeHours: 3
    },
    pricing: {
      ourFinalPrice: 580000.00,
      winningPrice: null, // Cancelada pelo órgão
      priceDeltaPct: null,
      ourMarginPct: 16.0,
      marginBand: '15-20%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: false,
    hadWaivers: false,
    lossDetails: null,
    noSubmissionDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.NOT_APPLICABLE,
      realizedMarginPct: null,
      slaIncidentsCount: 0,
      notes: 'Certame revogado pelo órgão licitante devido a contingenciamento orçamentário.'
    }
  },

  // 4. Casos de Desclassificação (Disqualified)
  {
    id: 'OUT-007',
    opportunityId: 'OPP-RECIFE-2025-DISQ',
    canonicalCode: 'PE-PCR-2025-019',
    title: 'Auditoria ambiental e conformidade legal em bacias de drenagem urbana',
    clientCanonical: 'Prefeitura Municipal do Recife',
    buyerType: 'Prefeitura Municipal (Capital)',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    serviceCategory: 'Auditoria Ambiental',
    region: 'Pernambuco',
    modality: 'Tomada de Preços',
    estimatedValue: 410000.00,
    valueRange: '100-500k',
    resultType: OutcomeResultType.DISQUALIFIED,
    submissionDate: '2025-09-04T11:00:00Z',
    period: '2025-Q3',
    timing: {
      timeToQualificationHours: 28,
      timeToGoDecisionHours: 40,
      timeToPricingHours: 30,
      readinessLeadTimeHours: 4, // Prontidão de última hora!
      submissionLeadTimeHours: 1
    },
    pricing: {
      ourFinalPrice: 380000.00,
      winningPrice: 395000.00,
      priceDeltaPct: -3.8, // Preço teria vencido!
      ourMarginPct: 15.0,
      marginBand: '15-20%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'ATTENTION_RISK',
    hadBlockersInHistory: true,
    hadWaivers: true, // Waiver concedido que não sustentou
    disqualificationDetails: {
      reason: DisqualificationReason.DOCUMENT,
      details: 'Certidão Negativa de Falência com validade expirada na data de abertura do envelope.'
    },
    lossDetails: null,
    noSubmissionDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.NOT_APPLICABLE,
      realizedMarginPct: null,
      slaIncidentsCount: 0,
      notes: null
    }
  },

  // 5. Casos com Decisão GO que NÃO foram submetidos (No Submission)
  {
    id: 'OUT-008',
    opportunityId: 'OPP-CAAPORA-PB-2025-NOSUB',
    canonicalCode: 'PB-CAAPORA-2025-041',
    title: 'Ensaios geoquímicos e monitoramento de solo em área de mineração',
    clientCanonical: 'Prefeitura Municipal de Caaporã',
    buyerType: 'Prefeitura Municipal (Interior)',
    companyId: 'veeluensolutions',
    companyName: 'Veeluen Solutions',
    serviceCategory: 'Geotecnia e Solos',
    region: 'Paraíba',
    modality: 'Pregão Eletrônico',
    estimatedValue: 280000.00,
    valueRange: '100-500k',
    resultType: OutcomeResultType.NO_SUBMISSION, // 29 a 32. GO mas não submetida
    submissionDate: null,
    period: '2025-Q4',
    timing: {
      timeToQualificationHours: 12,
      timeToGoDecisionHours: 18,
      timeToPricingHours: 72, // Atraso de precificação!
      readinessLeadTimeHours: 0,
      submissionLeadTimeHours: 0
    },
    pricing: {
      ourFinalPrice: null, // Não chegou a fechar preço
      winningPrice: 260000.00,
      priceDeltaPct: null,
      ourMarginPct: null,
      marginBand: null
    },
    participationStructure: ParticipationStructureType.PARTNER_SUPPORT,
    partnerId: 'PARTNER-002',
    readinessStatusAtSubmission: 'BLOCKED',
    hadBlockersInHistory: true,
    hadWaivers: false,
    noSubmissionDetails: {
      reason: NoSubmissionReason.DOCUMENT_GAP,
      notes: 'Não submetida após GO: gargalo documental de atestado técnico de laboratório parceiro não emitido a tempo.'
    },
    lossDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.NOT_APPLICABLE,
      realizedMarginPct: null,
      slaIncidentsCount: 0,
      notes: null
    }
  },
  {
    id: 'OUT-009',
    opportunityId: 'OPP-BAHIA-RLAM-STRAT-WITHDRAW',
    canonicalCode: 'BA-RLAM-2026-009',
    title: 'Serviços de amostragem de água de lastro em terminais marítimos',
    clientCanonical: 'Acelen — Refinaria de Mataripe',
    buyerType: 'Empresa Privada / Industrial',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    serviceCategory: 'Análises Ambientais',
    region: 'Bahia',
    modality: 'Cotação Privada',
    estimatedValue: 480000.00,
    valueRange: '100-500k',
    resultType: OutcomeResultType.NO_SUBMISSION,
    submissionDate: null,
    period: '2026-Q1',
    timing: {
      timeToQualificationHours: 8,
      timeToGoDecisionHours: 12,
      timeToPricingHours: 16,
      readinessLeadTimeHours: 0,
      submissionLeadTimeHours: 0
    },
    pricing: {
      ourFinalPrice: 460000.00,
      winningPrice: null,
      priceDeltaPct: null,
      ourMarginPct: 14.0,
      marginBand: '10-15%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: false,
    hadWaivers: false,
    noSubmissionDetails: {
      reason: NoSubmissionReason.STRATEGIC_WITHDRAWAL, // 32. NÃO tratar como falha de processo!
      notes: 'Retirada estratégica deliberada: diretoria optou por priorizar edital concorrente da RNEST com maior margem.'
    },
    lossDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.NOT_APPLICABLE,
      realizedMarginPct: null,
      slaIncidentsCount: 0,
      notes: null
    }
  },

  // 6. Mais Casos para Composição de Amostra Estatística
  {
    id: 'OUT-010',
    opportunityId: 'OPP-JP-SEINFRA-2025',
    canonicalCode: 'PB-PMJP-2025-055',
    title: 'Estudos ambientais preliminares e EIA/RIMA para macrodrenagem',
    clientCanonical: 'Prefeitura Municipal de João Pessoa (SEINFRA)',
    buyerType: 'Prefeitura Municipal (Capital)',
    companyId: 'veeluensolutions',
    companyName: 'Veeluen Solutions',
    serviceCategory: 'Estudos Ambientais e EIA/RIMA',
    region: 'Paraíba',
    modality: 'Concorrência Pública',
    estimatedValue: 980000.00,
    valueRange: '500k-1M',
    resultType: OutcomeResultType.WON,
    submissionDate: '2025-10-14T10:00:00Z',
    period: '2025-Q4',
    timing: {
      timeToQualificationHours: 16,
      timeToGoDecisionHours: 24,
      timeToPricingHours: 20,
      readinessLeadTimeHours: 32, // Alto lead time
      submissionLeadTimeHours: 6
    },
    pricing: {
      ourFinalPrice: 920000.00,
      winningPrice: 920000.00,
      priceDeltaPct: 0.0,
      ourMarginPct: 17.5,
      marginBand: '15-20%'
    },
    participationStructure: ParticipationStructureType.CONSORTIUM,
    partnerId: 'PARTNER-001',
    partnerName: 'GeoTop Engenharia e Geotecnia Ltda',
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: false,
    hadWaivers: false,
    lossDetails: null,
    noSubmissionDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.SUCCESSFUL,
      realizedMarginPct: 17.0,
      slaIncidentsCount: 0,
      notes: 'Contrato concluído com êxito e atestado de capacidade técnica emitido pela SEINFRA.'
    }
  },
  {
    id: 'OUT-011',
    opportunityId: 'OPP-CHESF-2025-014',
    canonicalCode: 'PE-CHESF-2025-014',
    title: 'Inspeção e monitoramento de ictiofauna em reservatórios do São Francisco',
    clientCanonical: 'CHESF — Companhia Hidro Elétrica do São Francisco',
    buyerType: 'Empresa Estatal de Energia',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    serviceCategory: 'Monitoramento de Fauna Aquática',
    region: 'Pernambuco',
    modality: 'Pregão Eletrônico',
    estimatedValue: 560000.00,
    valueRange: '500k-1M',
    resultType: OutcomeResultType.LOST,
    submissionDate: '2025-08-20T14:00:00Z',
    period: '2025-Q3',
    timing: {
      timeToQualificationHours: 20,
      timeToGoDecisionHours: 36,
      timeToPricingHours: 28,
      readinessLeadTimeHours: 11, // Lead time curto
      submissionLeadTimeHours: 2
    },
    pricing: {
      ourFinalPrice: 530000.00,
      winningPrice: 485000.00,
      priceDeltaPct: 9.2,
      ourMarginPct: 14.2,
      marginBand: '10-15%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: false,
    hadWaivers: false,
    lossDetails: {
      category: LossReasonCategory.OFFICIAL_REASON,
      reasonText: 'Concorrente regional local de Paulo Afonso ofertou menor lance final na disputa aberta.',
      hasOfficialReason: true
    },
    noSubmissionDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.NOT_APPLICABLE,
      realizedMarginPct: null,
      slaIncidentsCount: 0,
      notes: null
    }
  },
  {
    id: 'OUT-012',
    opportunityId: 'OPP-BA-EMBASA-2025',
    canonicalCode: 'BA-EMBASA-2025-099',
    title: 'Análise de toxicidade de efluentes em estações de tratamento em Salvador',
    clientCanonical: 'EMBASA — Empresa Baiana de Águas e Saneamento',
    buyerType: 'Sociedade de Economia Mista Estadual',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    serviceCategory: 'Efluentes Industriais',
    region: 'Bahia',
    modality: 'Pregão Eletrônico',
    estimatedValue: 310000.00,
    valueRange: '100-500k',
    resultType: OutcomeResultType.LOST,
    submissionDate: '2025-07-05T09:00:00Z',
    period: '2025-Q3',
    timing: {
      timeToQualificationHours: 24,
      timeToGoDecisionHours: 40,
      timeToPricingHours: 32,
      readinessLeadTimeHours: 7, // Lead time muito curto
      submissionLeadTimeHours: 1
    },
    pricing: {
      ourFinalPrice: 298000.00,
      winningPrice: 275000.00,
      priceDeltaPct: 8.3,
      ourMarginPct: 13.0,
      marginBand: '10-15%'
    },
    participationStructure: ParticipationStructureType.SOLO,
    partnerId: null,
    readinessStatusAtSubmission: 'READY_COMPLETE',
    hadBlockersInHistory: true,
    hadWaivers: false,
    lossDetails: {
      category: LossReasonCategory.INTERNAL_ASSESSMENT,
      reasonText: 'Margem comercial pressionada por custos de frete rodoviário de amostras Salvador-Recife.',
      hasOfficialReason: false
    },
    noSubmissionDetails: null,
    contractOutcome: {
      status: ContractExecutionOutcome.NOT_APPLICABLE,
      realizedMarginPct: null,
      slaIncidentsCount: 0,
      notes: null
    }
  }
];

// 199 a 209. Padrões Observados Canônicos (ObservedOutcomePattern)
export const initialObservedPatterns = [
  {
    id: 'PAT-001',
    type: 'READINESS_TIMING',
    segment: 'Geral (Todos os Serviços)',
    observation: 'Maior antecedência na prontidão da proposta (Readiness Lead Time > 24h) aparece associada a melhores resultados de vitória (80% vs 20% no grupo com < 12h).',
    sampleSize: 12,
    period: 'Últimos 12 meses',
    confidenceLevel: 'ALTA (Repetição em múltiplos certames)',
    status: PatternStatus.VALIDATED,
    evidenceSnapshot: {
      winsMedianLeadTimeHours: 31,
      lossesMedianLeadTimeHours: 9,
      noSubmissionLeadTimeHours: 0
    },
    validationNotes: 'Padrão validado em colegiado executivo; equipes orientadas a concluir o Submission Readiness com mínimo de 24h de antecedência.'
  },
  {
    id: 'PAT-002',
    type: 'DISQUALIFICATION_ROOT_CAUSE',
    segment: 'Documentação & Acervo',
    observation: 'Gargalos documentais e certidões emitidas de última hora respondem pela totalidade dos casos de inabilitação formal e por 50% dos abandonos de submissão.',
    sampleSize: 8,
    period: 'Últimos 12 meses',
    confidenceLevel: 'ALTA (Observado com alta frequência)',
    status: PatternStatus.VALIDATED,
    evidenceSnapshot: {
      disqualificationDocPct: 100,
      noSubmissionDocGapPct: 50
    },
    validationNotes: 'Consistente com a implantação do Document Vault e do monitoramento contínuo de certidões.'
  },
  {
    id: 'PAT-003',
    type: 'PARTNER_COMPLEMENTARITY',
    segment: 'Consórcios & Parcerias',
    observation: 'Participações estruturadas em consórcio ou com parceiro técnico apresentaram maior taxa de submissão completa em certames de grande porte (> R$ 1M), sem abandono por falta de atestado.',
    sampleSize: 4,
    period: '2025-2026',
    confidenceLevel: 'MODERADA (Amostra em consolidação)',
    status: PatternStatus.CANDIDATE,
    evidenceSnapshot: {
      partnerSubmissionsCount: 4,
      partnerWinsCount: 3,
      partnerSubmissionRatePct: 100
    },
    validationNotes: 'Padrão promissor mas com amostra ainda limitada (4 certames); manter sob observação antes de formalizar em política.'
  },
  {
    id: 'PAT-004',
    type: 'LEGACY_WORKFLOW_DELAY',
    segment: 'Processo Antigo de Aprovação Manual',
    observation: 'Aprovações financeiras dependentes de despachos impressos geravam perda de 48h no ciclo de submissão.',
    sampleSize: 6,
    period: '2024 (Legado)',
    confidenceLevel: 'OBSOLETO (Processo superado)',
    status: PatternStatus.DEPRECATED, // 206 a 209. Padrão Decaído / Obsoleto
    evidenceSnapshot: {
      legacyDelayDays: 3.2,
      processVersion: 'v1.0-manual'
    },
    validationNotes: 'DEPRECATED: O processo foi automatizado pelo Policy Engine (Fase 58) e Approval Inbox (Fase 36); o gargalo histórico não é mais representativo da operação atual.'
  }
];
