/**
 * VELLIA LICITAÇÕES — FASE 62: PARTNER & CONSORTIUM INTELLIGENCE
 * partnerStrategyData.js: Dados Semente Fatuais e Históricos de Parcerias e Consórcios
 * 
 * Vinculados à realidade operacional de Veeluen Solutions e Excelência Ambiental:
 * - Reutiliza organizações cadastradas e perfis de fornecedores/parceiros
 * - Extração factual de regras de editais (documento, página, cláusula)
 * - Gaps operacionais conectados à Fase 44
 */

import {
  ParticipationType,
  ParticipationStructureStatus,
  EditalRuleStatus,
  GapCategory,
  PartnerRole,
  CommercialStructureType,
  CommercialTermsStatus,
  PartnerConfirmationStatus,
  PartnerCommitmentStatus,
  CommitmentEvidenceType,
  GovernanceComplexity,
  ExclusivityType
} from './partnerStrategyModels.js';

// Base de Parceiros Estruturados Cadastrados no Ecossistema
export const initialRegisteredPartners = [
  {
    id: 'PARTNER-001',
    organizationId: 'ORG-SUP-001',
    companyName: 'LabAmbiental Nordeste S/A',
    cnpj: '08.912.441/0001-92',
    roles: ['Laboratório Ambiental', 'Parceiro Técnico'],
    region: 'Pernambuco e Paraíba (Laboratório Central no Recife)',
    categories: ['Análises Físico-Químicas e Microbiológicas', 'Ensaios ISO 17025'],
    capabilities: [
      {
        description: 'Análises cromatográficas e espectrofotometria acreditada Cgcre/INMETRO',
        evidenceType: 'CERTIFICATE',
        evidenceRef: 'Certificado de Acreditação CRL-0482 (Validade: 2028)',
        isConfirmed: true
      },
      {
        description: 'Atestado de ensaios laboratoriais em efluentes petroquímicos',
        evidenceType: 'ATESTADO',
        evidenceRef: 'CAT CREA-PE nº 2023-90812 (Braskem)',
        isConfirmed: true
      }
    ],
    documents: [
      { name: 'Certidão Conjunta Federal / PGFN', validUntil: '2027-04-30', isExpired: false },
      { name: 'Certidão Estadual PE', validUntil: '2027-03-15', isExpired: false },
      { name: 'Acreditação INMETRO ISO 17025', validUntil: '2028-11-20', isExpired: false }
    ],
    history: {
      pastOpportunitiesCount: 4,
      successfulContracts: 3,
      avgDeliveryRating: 9.4,
      issuesReported: 0,
      notes: 'Parceiro recorrente em análises laboratoriais para contratos de ETE em Suape.'
    },
    defaultAvailability: 'ALTA'
  },
  {
    id: 'PARTNER-002',
    organizationId: 'ORG-SUP-002',
    companyName: 'TecnoGases & Calibrações Ltda',
    cnpj: '14.281.993/0001-18',
    roles: ['Parceiro Técnico', 'Locadora de Equipamentos'],
    region: 'Pernambuco (Suape / Ipojuca)',
    categories: ['Emissões Atmosféricas', 'Calibração RBC', 'Equipamentos Isocinéticos'],
    capabilities: [
      {
        description: 'Sondas isocinéticas para amostragem em chaminés industriais acima de 40m',
        evidenceType: 'CAT',
        evidenceRef: 'CAT CREA-RJ nº 2022-77412 (Refinaria Duque de Caxias - REDUC)',
        isConfirmed: true
      },
      {
        description: 'Analisador multigás contínuo calibrado na Rede Brasileira de Calibração (RBC)',
        evidenceType: 'CERTIFICATE',
        evidenceRef: 'Certificado RBC nº 2026-8819 (Validade: 2027-08)',
        isConfirmed: true
      }
    ],
    documents: [
      { name: 'Certidão Conjunta Federal', validUntil: '2027-05-10', isExpired: false },
      { name: 'Registro no CREA-PE', validUntil: '2027-12-31', isExpired: false }
    ],
    history: {
      pastOpportunitiesCount: 2,
      successfulContracts: 2,
      avgDeliveryRating: 8.8,
      issuesReported: 0,
      notes: 'Excelente suporte em paradas programadas de manutenção.'
    },
    defaultAvailability: 'CONFIRMAR_DISPONIBILIDADE'
  },
  {
    id: 'PARTNER-003',
    organizationId: 'ORG-SUP-003',
    companyName: 'GeoAmb Engenharia e Perícias Ltda',
    cnpj: '18.490.112/0001-33',
    roles: ['Parceiro Técnico', 'Prestador Especializado'],
    region: 'Paraíba (Base em João Pessoa / Pitimbu)',
    categories: ['Engenharia Especializada', 'Topografia e Licenciamento Local'],
    capabilities: [
      {
        description: 'Responsabilidade técnica com ART local para licenciamento SUDEMA-PB',
        evidenceType: 'ART',
        evidenceRef: 'ART CREA-PB nº 2024-551982',
        isConfirmed: true
      },
      {
        description: 'Base de apoio de campo com caminhonete traçada 4x4 e sonômetros classe 1',
        evidenceType: 'ATESTADO',
        evidenceRef: 'Contrato de prestação Polo Cerâmico PB 2024',
        isConfirmed: true
      }
    ],
    documents: [
      { name: 'Certidão Federal / INSS', validUntil: '2027-02-28', isExpired: false },
      { name: 'Certidão Estadual PB', validUntil: '2027-06-30', isExpired: false }
    ],
    history: {
      pastOpportunitiesCount: 1,
      successfulContracts: 1,
      avgDeliveryRating: 8.5,
      issuesReported: 0,
      notes: 'Base física estratégica para operações na Paraíba sem custo de hotelaria.'
    },
    defaultAvailability: 'ALTA'
  },
  {
    id: 'PARTNER-004',
    organizationId: 'ORG-SUP-004',
    companyName: 'InovaQuímica Soluções Eireli',
    cnpj: '22.331.884/0001-77',
    roles: ['Fornecedor', 'Subcontratado'],
    region: 'Pernambuco e Alagoas',
    categories: ['Tratamento e Destinação de Resíduos Classe I/II', 'Materiais e Insumos Operacionais'],
    capabilities: [
      {
        description: 'Fornecimento e dosagem de polímeros catiônicos e coagulantes de alta performance',
        evidenceType: 'ATESTADO',
        evidenceRef: 'Atestado de fornecimento contínuo para ETE Termopernambuco',
        isConfirmed: true
      }
    ],
    documents: [
      { name: 'Licença de Operação CPRH para transporte químico', validUntil: '2027-09-10', isExpired: false },
      { name: 'Certidões Negativas Fiscais', validUntil: '2027-01-31', isExpired: false }
    ],
    history: {
      pastOpportunitiesCount: 3,
      successfulContracts: 3,
      avgDeliveryRating: 9.0,
      issuesReported: 0,
      notes: 'Parceiro preferencial para insumos químicos de tratamento de efluentes.'
    },
    defaultAvailability: 'ALTA'
  },
  {
    id: 'PARTNER-005',
    organizationId: 'ORG-SUP-005',
    companyName: 'BioSonda Ensaios Ambientais',
    cnpj: '31.109.845/0001-60',
    roles: ['Parceiro Técnico'],
    region: 'Bahia e Sergipe',
    categories: ['Emissões Atmosféricas', 'Análises Ambientais'],
    capabilities: [
      {
        description: 'Amostragem em dutos industriais (Autodeclaração sem atestado indexado)',
        evidenceType: 'AUTODECLARACAO', // 81. Teste: sem evidência auditável não é considerado completo!
        evidenceRef: 'Declarado em proposta comercial',
        isConfirmed: false
      }
    ],
    documents: [
      { name: 'Certidão Conjunta Federal', validUntil: '2027-04-15', isExpired: false }
    ],
    history: {
      pastOpportunitiesCount: 0,
      successfulContracts: 0,
      avgDeliveryRating: 7.0,
      issuesReported: 0,
      notes: 'Parceiro em homologação preliminar.'
    },
    defaultAvailability: 'A_CONFIRMAR'
  },
  {
    id: 'PARTNER-006',
    organizationId: 'ORG-SUP-006',
    companyName: 'VencidaDocs Engenharia Ltda',
    cnpj: '44.819.201/0001-09',
    roles: ['Subcontratado'],
    region: 'Pernambuco',
    categories: ['Topografia e Batimetria'],
    capabilities: [
      {
        description: 'Levantamento batimétrico em bacias de decantação',
        evidenceType: 'ATESTADO',
        evidenceRef: 'CAT CREA-PE 2021-0091',
        isConfirmed: true
      }
    ],
    documents: [
      { name: 'Certidão Negativa de Débitos Trabalhistas (CNDT)', validUntil: '2025-12-31', isExpired: true } // VENCIDA!
    ],
    history: {
      pastOpportunitiesCount: 1,
      successfulContracts: 1,
      avgDeliveryRating: 7.5,
      issuesReported: 1,
      notes: 'Possui certidão trabalhista vencida na base.'
    },
    defaultAvailability: 'BAIXA'
  }
];

// Oportunidades com Regras de Edital e Estruturas Estratégicas de Participação
export const initialParticipationStructures = [
  {
    id: 'PART-STRUCT-001',
    opportunityId: '7004321234',
    opportunityTitle: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
    client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    type: ParticipationType.CONSORTIUM,
    status: ParticipationStructureStatus.APPROVED,
    version: 1,
    createdAt: '2026-10-10T14:00:00Z',
    createdBy: 'Clarice Mendes (Diretoria Comercial)',
    editalRules: {
      consortium: {
        status: EditalRuleStatus.CONDITIONAL,
        details: 'Permitida a participação em consórcio de até 2 (duas) empresas. A empresa líder deve deter no mínimo 51% de participação e apresentar atestado compatível com o item principal.',
        evidenceDoc: 'Edital de Licitação Eletrônica nº 7004321234',
        page: 18,
        clause: 'Cláusula 6.2 - Da Participação em Consórcio',
        jointQualification: 'Admite-se o somatório de quantitativos técnicos das consorciadas.'
      },
      subcontracting: {
        status: EditalRuleStatus.CONDITIONAL,
        details: 'Permitida subcontratação de até 30% do valor global, restrita a análises laboratoriais e transporte de amostras. Vedada subcontratação do escopo nuclear de amostragem isocinética.',
        evidenceDoc: 'Edital 7004321234 - Anexo I (Termo de Referência)',
        page: 24,
        clause: 'Cláusula 9.1 - Da Subcontratação'
      }
    },
    gaps: [
      {
        id: 'GAP-RNEST-01',
        category: GapCategory.QUANTITATIVE_CAPACITY,
        description: 'Exigência de comprovação de 80 campanhas de amostragem isocinética simultâneas. Excelência possui acervo próprio para 55 campanhas.',
        gapMagnitude: 'Faltam 25 campanhas para atingir o mínimo habilitatório',
        canBeCoveredByPartner: true,
        recommendedMechanism: 'CONSÓRCIO (Somatório de acervo de consorciadas expressamente admitido pela Cláusula 6.2)'
      },
      {
        id: 'GAP-RNEST-02',
        category: GapCategory.CERTIFICATION,
        description: 'Exigência de acreditação laboratorial Cgcre/INMETRO ISO 17025 para ensaios de hidrocarbonetos policíclicos aromáticos (HPAs).',
        gapMagnitude: 'Excelência terceiriza esta análise por não possuir cromatógrafo de massa próprio',
        canBeCoveredByPartner: true,
        recommendedMechanism: 'SUBCONTRATAÇÃO AUTORIZADA DE LABORATÓRIO'
      }
    ],
    partnerRequirementProfile: {
      requiredCapabilities: [
        'Atestado de amostragem isocinética de chaminé comprovando pelo menos 25 campanhas',
        'Laboratório acreditado ISO 17025 pelo INMETRO para HPAs e compostos voláteis'
      ],
      requiredCertificates: ['ISO 17025 Cgcre', 'CREA Pessoa Jurídica Ativo'],
      requiredExperience: 'Experiência prévia em refinarias de petróleo ou polo petroquímico',
      requiredEquipment: 'Sondas de amostragem aquecidas EPA 5 e lavadores de gases',
      region: 'Pernambuco (Suape / RMR)',
      availabilityWindow: 'Início em Dez/2026 com mobilização em 15 dias',
      criticality: 'CRÍTICA (Habilitatória)'
    },
    selectedPartners: [
      {
        partnerId: 'PARTNER-002',
        companyName: 'TecnoGases & Calibrações Ltda',
        role: PartnerRole.TECHNICAL_PARTNER,
        scope: 'Fornecimento de 2 sondas EPA 5 sobressalentes e somatório de 30 campanhas isocinéticas no consórcio',
        confirmationStatus: PartnerConfirmationStatus.CONFIRMED,
        confirmedAt: '2026-10-12T16:30:00Z',
        exclusivity: ExclusivityType.AGREED
      },
      {
        partnerId: 'PARTNER-001',
        companyName: 'LabAmbiental Nordeste S/A',
        role: PartnerRole.SUBCONTRACTOR,
        scope: 'Execução de análises laboratoriais acreditadas ISO 17025 com prazo de entrega de 5 dias úteis',
        confirmationStatus: PartnerConfirmationStatus.CONFIRMED,
        confirmedAt: '2026-10-11T10:15:00Z',
        exclusivity: ExclusivityType.NONE
      }
    ],
    responsibilityMatrix: [
      { scope: 'Coordenação Geral e Interface Petrobras', ourCompany: '100% (Líder)', partner: '0%' },
      { scope: 'Amostragem Isocinética em Campo', ourCompany: '70% da equipe', partner: '30% (Apoio TecnoGases)' },
      { scope: 'Análises Laboratoriais ISO 17025', ourCompany: '0%', partner: '100% (LabAmbiental)' },
      { scope: 'Elaboração e Assinatura de Relatórios CPRH', ourCompany: '100% (Responsável Técnico)', partner: '0%' },
      { scope: 'Aporte de Atestados Técnicos Habilitatórios', ourCompany: '55 campanhas', partner: '30 campanhas (TecnoGases)' }
    ],
    commercialTerms: {
      structureType: CommercialStructureType.REVENUE_SHARE,
      status: CommercialTermsStatus.AGREED,
      ourSharePct: 72,
      partnerSharePct: 28,
      subcontractorCostFixed: 145000,
      notes: 'TecnoGases assume 28% da receita líquida do lote de amostragem e 28% dos custos diretos.',
      humanConfirmed: true,
      confirmedBy: 'Henrique Veeluen',
      confirmedAt: '2026-10-14T11:00:00Z'
    },
    scenariosComparison: {
      solo: {
        feasible: false,
        capabilityScore: 68,
        marginPct: 0,
        riskLevel: 'CRÍTICO (Inabilitação Certa por Falta de Atestado)',
        readinessPct: 55,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Impossível concorrer solo. O certame exige 80 campanhas comprovadas e a empresa só possui 55.'
      },
      partnerSupport: {
        feasible: false,
        capabilityScore: 78,
        marginPct: 18.5,
        riskLevel: 'ALTO (Locação de equipamento não supre a falta de CAT habilitatória)',
        readinessPct: 70,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Apenas alugar sondas não transfere atestados para habilitação.'
      },
      consortium: {
        feasible: true,
        capabilityScore: 98,
        marginPct: 16.2,
        riskLevel: 'MODERADO (Risco mitigado por consórcio formal e liderança mantida)',
        readinessPct: 96,
        complexity: GovernanceComplexity.MEDIUM,
        tradeOffNotes: 'Consórcio com TecnoGases resolve 100% do gap habilitatório com margem líquida sustentável de 16.2%.'
      }
    },
    governanceComplexity: GovernanceComplexity.MEDIUM,
    risks: {
      dependencyRisk: 'MODERADO (TecnoGases é parceiro exclusivo; backup identificado: LabAmbiental)',
      availabilityRisk: 'BAIXO (Disponibilidade confirmada por escrito)',
      documentationRisk: 'BAIXO (Documentos verificados no cofre, válidos até 2027)',
      performanceRisk: 'BAIXO (Histórico com 2 contratos bem-sucedidos)',
      commercialRisk: 'MODERADO (Margem de 16.2% é ligeiramente inferior à margem típica de 20%, compensada pelo valor vultoso de R$ 2.45M)'
    },
    commitments: [
      {
        id: 'COMM-001',
        partnerId: 'PARTNER-002',
        partnerName: 'TecnoGases & Calibrações Ltda',
        role: PartnerRole.TECHNICAL_PARTNER,
        status: PartnerCommitmentStatus.CONFIRMED,
        evidenceType: CommitmentEvidenceType.AGREEMENT,
        evidenceDocRef: 'MOU Pré-Consorcial assinado em 12/10/2026',
        confirmedAt: '2026-10-12T16:30:00Z',
        expiry: '2026-12-31T23:59:59Z'
      }
    ]
  },
  {
    id: 'PART-STRUCT-002',
    opportunityId: '7004319802',
    opportunityTitle: 'Serviços continuados de operação e manutenção de ETE e tratamento de efluentes',
    client: 'Transpetro - Terminal Aquaviário de Suape',
    companyId: 'veeluen',
    companyName: 'Veeluen Solutions',
    type: ParticipationType.SUBCONTRACTING,
    status: ParticipationStructureStatus.APPROVED,
    version: 1,
    createdAt: '2026-10-08T09:00:00Z',
    createdBy: 'Henrique Veeluen',
    editalRules: {
      consortium: {
        status: EditalRuleStatus.NOT_ALLOWED, // 17. Consórcio VEDADO!
        details: 'É expressamente vedada a participação de pessoas jurídicas reunidas em consórcio.',
        evidenceDoc: 'Edital Transpetro nº 7004319802',
        page: 9,
        clause: 'Cláusula 3.1 - Dos Impedimentos de Participação'
      },
      subcontracting: {
        status: EditalRuleStatus.CONDITIONAL,
        details: 'Permitida a subcontratação restrita aos serviços de: (a) análises físico-químicas e microbiológicas diárias de controle de efluente tratado; (b) transporte e destinação final de lodo desidratado em aterro industrial licenciado.',
        evidenceDoc: 'Termo de Referência Transpetro Suape',
        page: 14,
        clause: 'Cláusula 5.8 - Da Subcontratação'
      }
    },
    gaps: [
      {
        id: 'GAP-SUAPE-01',
        category: GapCategory.EQUIPMENT,
        description: 'Transporte de lodo Classe I em caminhão tanque a vácuo com MTR/CPRH.',
        gapMagnitude: 'Veeluen não possui caminhão tanque próprio permanente em Suape',
        canBeCoveredByPartner: true,
        recommendedMechanism: 'SUBCONTRATAÇÃO FORMAL DE TRANSPORTE E DESTINAÇÃO (Permitida pela Cláusula 5.8)'
      }
    ],
    partnerRequirementProfile: {
      requiredCapabilities: ['Transporte de resíduos perigosos com MTR homologado na CPRH', 'Destinação em aterro industrial'],
      requiredCertificates: ['Licença de Operação CPRH para transporte', 'Certificado ambiental'],
      requiredExperience: 'Operações em terminais portuários',
      requiredEquipment: 'Caminhão vácuo 12m³ com certificação INMETRO',
      region: 'Ipojuca - PE',
      availabilityWindow: 'Imediato',
      criticality: 'MODERADA'
    },
    selectedPartners: [
      {
        partnerId: 'PARTNER-004',
        companyName: 'InovaQuímica Soluções Eireli',
        role: PartnerRole.SUBCONTRACTOR,
        scope: 'Transporte sob demanda de lodo desidratado e destinação com emissão de CDF',
        confirmationStatus: PartnerConfirmationStatus.CONFIRMED,
        confirmedAt: '2026-10-09T14:00:00Z',
        exclusivity: ExclusivityType.NONE
      }
    ],
    responsibilityMatrix: [
      { scope: 'Operação da ETE e Tratamento Biológico', ourCompany: '100% (Veeluen)', partner: '0%' },
      { scope: 'Manutenção Eletromecânica das Bombas', ourCompany: '100% (Veeluen)', partner: '0%' },
      { scope: 'Transporte e Destinação do Lodo', ourCompany: 'Fiscalização e emissão de MTR', partner: 'Execução física (InovaQuímica)' }
    ],
    commercialTerms: {
      structureType: CommercialStructureType.FIXED_COST,
      status: CommercialTermsStatus.AGREED,
      ourSharePct: 91,
      partnerSharePct: 9,
      subcontractorCostFixed: 340000,
      notes: 'Subcontratação dentro do limite estipulado no edital (9% do valor global de R$ 3.82M).',
      humanConfirmed: true,
      confirmedBy: 'Henrique Veeluen',
      confirmedAt: '2026-10-10T08:30:00Z'
    },
    scenariosComparison: {
      solo: {
        feasible: false,
        capabilityScore: 82,
        marginPct: 24.0,
        riskLevel: 'ALTO (Sem caminhão vácuo homologado para transporte perigoso)',
        readinessPct: 78,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Participar 100% solo exigiria comprar caminhão vácuo por R$ 650k.'
      },
      subcontracting: {
        feasible: true,
        capabilityScore: 96,
        marginPct: 21.8,
        riskLevel: 'BAIXO (InovaQuímica possui licença CPRH e base a 12km do terminal)',
        readinessPct: 98,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Subcontratação autorizada pelo edital garante prontidão total com margem de 21.8%.'
      },
      consortium: {
        feasible: false,
        capabilityScore: 0,
        marginPct: 0,
        riskLevel: 'INABILITAÇÃO CERTA (Consórcio vedado pela Cláusula 3.1 do Edital)',
        readinessPct: 0,
        complexity: GovernanceComplexity.HIGH,
        tradeOffNotes: 'NÃO RECOMENDADO: Edital proíbe consórcio categoricamente.'
      }
    },
    governanceComplexity: GovernanceComplexity.LOW,
    risks: {
      dependencyRisk: 'BAIXO (Existem 3 fornecedores locais de caminhão vácuo em Suape)',
      availabilityRisk: 'BAIXO (Atendimento quinzenal programado)',
      documentationRisk: 'BAIXO (Licença de operação válida)',
      performanceRisk: 'BAIXO (Histórico excelente)',
      commercialRisk: 'BAIXO (Custo cotado fixo por viagem)'
    },
    commitments: [
      {
        id: 'COMM-002',
        partnerId: 'PARTNER-004',
        partnerName: 'InovaQuímica Soluções Eireli',
        role: PartnerRole.SUBCONTRACTOR,
        status: PartnerCommitmentStatus.CONFIRMED,
        evidenceType: CommitmentEvidenceType.DECLARATION,
        evidenceDocRef: 'Cotação formal nº 2026-081 e Carta de Anuência de Transporte',
        confirmedAt: '2026-10-09T14:00:00Z',
        expiry: '2027-01-31T23:59:59Z'
      }
    ]
  },
  {
    id: 'PART-STRUCT-003',
    opportunityId: 'OPP-CAAPORA-PB',
    opportunityTitle: 'Monitoramento contínuo de emissões e ruído industrial no Polo Caaporã',
    client: 'Consórcio de Indústrias Cimenteiras e Cerâmicas da Paraíba',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    type: ParticipationType.TO_EVALUATE,
    status: ParticipationStructureStatus.UNDER_REVIEW,
    version: 1,
    createdAt: '2026-10-15T11:00:00Z',
    createdBy: 'Clarice Mendes',
    editalRules: {
      consortium: {
        status: EditalRuleStatus.ALLOWED,
        details: 'Permitida a participação em consórcio sem restrição de número de partes.',
        evidenceDoc: 'Edital Caaporã 04/2026',
        page: 11,
        clause: 'Cláusula 4.1'
      },
      subcontracting: {
        status: EditalRuleStatus.ALLOWED,
        details: 'Subcontratação autorizada até 40% do contrato.',
        evidenceDoc: 'Edital Caaporã 04/2026',
        page: 15,
        clause: 'Cláusula 6.3'
      }
    },
    gaps: [
      {
        id: 'GAP-CAAPORA-01',
        category: GapCategory.REGIONAL_PRESENCE,
        description: 'Exigência de tempo de resposta em campo inferior a 3 horas e ART perante o CREA-PB.',
        gapMagnitude: 'Sede da Excelência fica no Recife (deslocamento de 1h45 a 2h30 conforme tráfego)',
        canBeCoveredByPartner: true,
        recommendedMechanism: 'PARCEIRO LOCAL (GeoAmb Engenharia sediada em João Pessoa)'
      }
    ],
    partnerRequirementProfile: {
      requiredCapabilities: ['Apoio operacional local com equipe técnica na Paraíba', 'ART CREA-PB ativa'],
      requiredCertificates: ['CREA-PB'],
      requiredExperience: 'Atuação na região metropolitana de João Pessoa ou litoral sul PB',
      requiredEquipment: 'Veículo 4x4',
      region: 'Paraíba',
      availabilityWindow: 'Novembro/2026',
      criticality: 'MODERADA'
    },
    selectedPartners: [
      {
        partnerId: 'PARTNER-003',
        companyName: 'GeoAmb Engenharia e Perícias Ltda',
        role: PartnerRole.OPERATIONAL_PARTNER,
        scope: 'Suporte de campo rápido e apoio de base operacional em Pitimbu/Caaporã',
        confirmationStatus: PartnerConfirmationStatus.INTERESTED,
        confirmedAt: null,
        exclusivity: ExclusivityType.REQUESTED
      }
    ],
    responsibilityMatrix: [
      { scope: 'Coordenação e Calibração dos Equipamentos', ourCompany: '100% (Excelência)', partner: '0%' },
      { scope: 'Pronto Atendimento de Campo (<3h)', ourCompany: 'Backup', partner: '100% (GeoAmb)' }
    ],
    commercialTerms: {
      structureType: CommercialStructureType.FIXED_COST,
      status: CommercialTermsStatus.NEGOTIATING,
      ourSharePct: 80,
      partnerSharePct: 20,
      subcontractorCostFixed: 95000,
      notes: 'Em negociação de valor por campanha de medição.',
      humanConfirmed: false
    },
    scenariosComparison: {
      solo: {
        feasible: true,
        capabilityScore: 85,
        marginPct: 25.0,
        riskLevel: 'MODERADO (Risco de descumprir SLA de 3h em dias de chuva/tráfego na BR-101)',
        readinessPct: 80,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Solo é viável mas possui risco logístico.'
      },
      partnerSupport: {
        feasible: true,
        capabilityScore: 95,
        marginPct: 20.5,
        riskLevel: 'BAIXO (GeoAmb garante base local a 30 minutos das fábricas)',
        readinessPct: 95,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Apoio operacional da GeoAmb elimina o risco logístico com perda de apenas 4.5 p.p. de margem.'
      },
      consortium: {
        feasible: true,
        capabilityScore: 96,
        marginPct: 18.0,
        riskLevel: 'MODERADO (Complexidade de governança desnecessária para contrato privado)',
        readinessPct: 95,
        complexity: GovernanceComplexity.HIGH,
        tradeOffNotes: 'Consórcio formal é desnecessário; subcontratação é mais ágil.'
      }
    },
    governanceComplexity: GovernanceComplexity.LOW,
    risks: {
      dependencyRisk: 'MODERADO (Depende da confirmação da GeoAmb)',
      availabilityRisk: 'BAIXO',
      documentationRisk: 'BAIXO',
      performanceRisk: 'BAIXO',
      commercialRisk: 'BAIXO'
    },
    commitments: []
  },
  {
    id: 'PART-STRUCT-004',
    opportunityId: 'OPP-SUDEMA-AMBIGUOUS',
    opportunityTitle: 'Elaboração de inventário estadual de emissões de GEE',
    client: 'SUDEMA - Superintendência de Administração do Meio Ambiente da PB',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    type: ParticipationType.TO_EVALUATE,
    status: ParticipationStructureStatus.DRAFT,
    version: 1,
    createdAt: '2026-10-18T15:00:00Z',
    createdBy: 'Clarice Mendes',
    editalRules: {
      consortium: {
        status: EditalRuleStatus.UNCLEAR, // 16 e 189. Cláusula ambígua -> Revisão jurídica recomendada!
        details: 'A Cláusula 2.3 do Edital menciona "vedada a constituição de consórcio exceto para microempresas", porém o Anexo III (Minuta do Contrato) contém cláusula padrão de consórcio admitindo somatório de capital social.',
        evidenceDoc: 'Edital SUDEMA-PB 12/2026',
        page: 7,
        clause: 'Cláusula 2.3 x Anexo III Cláusula 14.1',
        alertLegalReview: 'REVISÃO JURÍDICA RECOMENDADA: Cláusula ambígua e contraditória entre edital e minuta contratual. Não assumir viabilidade jurídica de consórcio antes de parecer ou pedido formal de esclarecimento ao pregoeiro.'
      },
      subcontracting: {
        status: EditalRuleStatus.CONDITIONAL,
        details: 'Permitida até 25% para estudos meteorológicos.',
        evidenceDoc: 'Edital SUDEMA-PB 12/2026',
        page: 9,
        clause: 'Cláusula 3.5'
      }
    },
    gaps: [
      {
        id: 'GAP-SUDEMA-01',
        category: GapCategory.TECHNICAL_CAPACITY,
        description: 'Modelagem atmosférica regional com modelo WRF-Chem.',
        gapMagnitude: 'Excelência não possui licença do cluster computacional para WRF',
        canBeCoveredByPartner: true,
        recommendedMechanism: 'CONSULTORIA ESPECIALIZADA'
      }
    ],
    partnerRequirementProfile: {
      requiredCapabilities: ['Modelagem matemática atmosférica WRF'],
      requiredCertificates: ['Doutorado/Mestrado em Meteorologia'],
      requiredExperience: 'Modelagem de dispersão em macroescala',
      requiredEquipment: 'Cluster computacional',
      region: 'Nacional',
      availabilityWindow: 'Dez/2026',
      criticality: 'ALTA'
    },
    selectedPartners: [],
    responsibilityMatrix: [],
    commercialTerms: {
      structureType: CommercialStructureType.FIXED_COST,
      status: CommercialTermsStatus.DRAFT,
      ourSharePct: 75,
      partnerSharePct: 25,
      subcontractorCostFixed: 60000,
      notes: 'Estimativa preliminar',
      humanConfirmed: false
    },
    scenariosComparison: {
      solo: {
        feasible: false,
        capabilityScore: 50,
        marginPct: 0,
        riskLevel: 'CRÍTICO',
        readinessPct: 40,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Falta modelador WRF experiente.'
      },
      partnerSupport: {
        feasible: true,
        capabilityScore: 92,
        marginPct: 22.0,
        riskLevel: 'MODERADO',
        readinessPct: 90,
        complexity: GovernanceComplexity.MEDIUM,
        tradeOffNotes: 'Especialista acadêmico pode fornecer a modelagem.'
      },
      consortium: {
        feasible: false,
        capabilityScore: 0,
        marginPct: 0,
        riskLevel: 'JURIDICAMENTE INCERTO (Cláusula ambígua)',
        readinessPct: 0,
        complexity: GovernanceComplexity.HIGH,
        tradeOffNotes: 'Submeter consórcio com edital contraditório traz risco alto de impugnação ou desclassificação.'
      }
    },
    governanceComplexity: GovernanceComplexity.HIGH,
    risks: {
      dependencyRisk: 'ALTO (Risco de indefinição jurídica)',
      availabilityRisk: 'MODERADO',
      documentationRisk: 'ALTO (Cláusula ambígua)',
      performanceRisk: 'BAIXO',
      commercialRisk: 'MODERADO'
    },
    commitments: []
  }
];

// Lacunas Estratégicas de Rede (Network Gaps)
export const initialNetworkGaps = [
  {
    id: 'NET-GAP-001',
    category: 'Laboratório Especializado',
    region: 'Paraíba / Rio Grande do Norte',
    description: 'Carência de laboratório acreditado pelo INMETRO para análise de dioxinas e furanos e amostragem isocinética pesada no interior da PB.',
    strategicImpact: 'Limita a expansão autônoma no polo cimenteiro e cerâmico de Caaporã.',
    suggestedAction: 'Qualificar laboratório de apoio em Campina Grande ou Recife com acordo operacional formal.'
  },
  {
    id: 'NET-GAP-002',
    category: 'Logística de Campo e Hidrojateamento',
    region: 'Bahia (Polo de Camaçari)',
    description: 'Falta de frota de caminhão vácuo e hidrojateamento com licenciamento INEMA na Bahia.',
    strategicImpact: 'Oportunidades em Camaçari exigem subcontratação local ou frete excessivo de PE para BA.',
    suggestedAction: 'Mapear e cadastrar transportadores ambientais qualificados em Salvador e Camaçari.'
  }
];
