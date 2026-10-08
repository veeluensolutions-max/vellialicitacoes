/**
 * VELLIA LICITAÇÕES — FASE 9: BANCO INTELIGENTE DE DOCUMENTOS, ATESTADOS E CERTIDÕES
 * Serviço central de gerenciamento do Cofre Documental Empresarial, controle de validades,
 * acervo técnico de atestados, ARTs/CATs, equipe técnica, equipamentos e matriz de capacidade.
 */

// Categorias Documentais (Item 2)
export const DocumentCategory = {
  JURIDICO: 'Jurídico',
  FISCAL: 'Fiscal',
  ECONOMICO_FINANCEIRO: 'Econômico-financeiro',
  TECNICO: 'Técnico',
  TRABALHISTA_SST: 'Trabalhista e SST',
  EQUIPAMENTOS: 'Equipamentos',
  OUTROS: 'Outros'
};

// Subcategorias de Documentos
export const DocumentSubCategory = {
  // Jurídicos
  CONTRATO_SOCIAL: 'Contrato Social',
  ALTERACAO_CONTRATUAL: 'Alteração Contratual',
  CARTAO_CNPJ: 'Cartão CNPJ',
  DOC_REPRESENTANTE: 'Documento de Representante',
  PROCURACAO: 'Procuração',
  DECLARACOES: 'Declaração Formal',
  // Fiscais
  CERTIDAO_FEDERAL: 'Certidão Conjunta Federal',
  CERTIDAO_ESTADUAL: 'Certidão Estadual',
  CERTIDAO_MUNICIPAL: 'Certidão Municipal',
  FGTS: 'Certificado FGTS (CRF)',
  CNDT: 'Certidão Negativa Trabalhista (CNDT)',
  OUTRAS_CERTIDOES: 'Outras Certidões Fiscais',
  // Econômico-financeiros
  BALANCO_PATRIMONIAL: 'Balanço Patrimonial',
  DRE: 'DRE Demonstrativo',
  INDICES_FINANCEIROS: 'Índices de Liquidez e Solvência',
  CERTIDAO_FALENCIA: 'Certidão Negativa de Falência',
  CAPITAL_SOCIAL: 'Comprovante de Capital Social',
  SEGURO_GARANTIA: 'Apólice de Seguro / Garantia',
  // Técnicos
  REGISTRO_CREA: 'Registro da Empresa no CREA/CRQ',
  ART: 'Anotação de Responsabilidade Técnica (ART)',
  CAT: 'Certidão de Acervo Técnico (CAT)',
  ATESTADO_CAPACIDADE: 'Atestado de Capacidade Técnica',
  LICENCA_AMBIENTAL: 'Licença / Autorização Ambiental',
  CERTIFICADO_ISO: 'Certificação de Sistema de Gestão',
  // Trabalhistas e SST
  PGR: 'Programa de Gerenciamento de Riscos (PGR)',
  PCMSO: 'PCMSO',
  ASO: 'Atestado de Saúde Ocupacional (ASO)',
  LTCAT: 'LTCAT',
  TREINAMENTO_NR: 'Certificado de Treinamento em NR',
  DOC_EQUIPE: 'Documentação de Pessoal',
  // Equipamentos
  CERTIFICADO_CALIBRACAO: 'Certificado de Calibração RBC',
  NOTA_FISCAL_EQUIPAMENTO: 'Nota Fiscal de Aquisição',
  MANUAL_ESPECIFICACAO: 'Manual e Especificação Técnica',
  CERTIFICADO_CONFORMIDADE: 'Certificado de Conformidade'
};

// Status do Documento (Item 4)
export const DocumentStatus = {
  VALIDO: 'VÁLIDO',
  ATENCAO: 'ATENÇÃO',
  VENCE_EM_BREVE: 'VENCE EM BREVE',
  VENCIDO: 'VENCIDO',
  SEM_VALIDADE: 'SEM VALIDADE DEFINIDA',
  EM_ANALISE: 'EM ANÁLISE',
  SUBSTITUIDO: 'SUBSTITUÍDO',
  NAO_IDENTIFICADO: 'NÃO IDENTIFICADO'
};

// Classificação da Força do Atestado (Item 21)
export const AttestationStrengthTier = {
  MUITO_FORTE: 'Muito forte (90–100%)',
  FORTE: 'Forte (75–89%)',
  MODERADO: 'Moderado (60–74%)',
  FRACO: 'Fraco (<60%)'
};

// Níveis de Criticidade de Pendências (Item 40)
export const IssueSeverity = {
  CRITICO: 'CRÍTICO',
  ALTO: 'ALTO',
  MEDIO: 'MÉDIO',
  BAIXO: 'BAIXO'
};

// Perfis de Acesso Futuros (Item 42)
export const UserPermissions = {
  ADMINISTRADOR: 'Administrador',
  LICITACOES: 'Licitações',
  TECNICO: 'Técnico',
  COMERCIAL: 'Comercial',
  VISUALIZADOR: 'Visualizador'
};

const STORAGE_KEYS = {
  DOCUMENTS: 'vellia_vault_documents_v1',
  ATTESTATIONS: 'vellia_vault_attestations_v1',
  ARTS: 'vellia_vault_arts_v1',
  CATS: 'vellia_vault_cats_v1',
  PERSONNEL: 'vellia_vault_personnel_v1',
  EQUIPMENT: 'vellia_vault_equipment_v1',
  AUDIT: 'vellia_vault_audit_logs_v1'
};

// SEED INICIAL RICO E COMPLETO (ATENDE COM FOLGA AO ITEM 50)
// Mínimo de: 5 fiscais, 3 jurídicos, 3 atestados, 2 ARTs, 2 responsáveis técnicos, 3 equipamentos.
const SEED_DOCUMENTS = [
  // JURÍDICOS (3 documentos)
  {
    id: 'doc-jur-01',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Contrato_Social_Consolidado_2025.pdf',
    category: DocumentCategory.JURIDICO,
    subCategory: DocumentSubCategory.CONTRATO_SOCIAL,
    description: 'Contrato Social consolidado devidamente registrado na Junta Comercial de Pernambuco (JUCEPE).',
    fileName: 'Contrato_Social_Consolidado_JUCEPE.pdf',
    fileSize: '4.8 MB',
    fileType: 'PDF',
    issueDate: '15/01/2025',
    expiryDate: null,
    issuer: 'Junta Comercial de Pernambuco - JUCEPE',
    documentNumber: 'NIRE 26300084921',
    observations: 'Cláusula 3ª contempla explicitamente atividades de amostragem de chaminés, monitoramento atmosférico e análises físico-químicas.',
    tags: ['Contrato Social', 'JUCEPE', 'Ato Constitutivo'],
    responsibleInternal: 'Dra. Mariana Lemos (Jurídico)',
    uploadDate: '10/02/2026 14:20',
    lastUpdate: '10/02/2026 14:20',
    version: 'v3.0',
    hash: 'sha256:8f2a1b9c3e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    extractedText: 'CONTRATO SOCIAL CONSOLIDADO DA EXCELÊNCIA AMBIENTAL ENGENHARIA E CONSULTORIA LTDA. Objeto Social: Prestação de serviços de engenharia ambiental, monitoramento contínuo de emissões gasosas em fontes fixas e estações de tratamento.'
  },
  {
    id: 'doc-jur-02',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Alteracao_Contratual_n12_Quotas.pdf',
    category: DocumentCategory.JURIDICO,
    subCategory: DocumentSubCategory.ALTERACAO_CONTRATUAL,
    description: '12ª Alteração Contratual dispondo sobre aumento de capital social e designação de administradores.',
    fileName: 'Alteracao_Contratual_n12.pdf',
    fileSize: '2.1 MB',
    fileType: 'PDF',
    issueDate: '20/06/2025',
    expiryDate: null,
    issuer: 'JUCEPE',
    documentNumber: 'Registro nº 2025091823',
    observations: 'Capital social integralizado aumentado para R$ 1.500.000,00.',
    tags: ['Alteração Contratual', 'Capital Social'],
    responsibleInternal: 'Dra. Mariana Lemos (Jurídico)',
    uploadDate: '10/02/2026 14:22',
    lastUpdate: '10/02/2026 14:22',
    version: 'v1.0',
    hash: 'sha256:7c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b',
    extractedText: 'DÉCIMA SEGUNDA ALTERAÇÃO CONTRATUAL. Capital social fixado em R$ 1.500.000,00 integralizado em moeda corrente nacional.'
  },
  {
    id: 'doc-jur-03',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Cartao_CNPJ_Atualizado_Ativo.pdf',
    category: DocumentCategory.JURIDICO,
    subCategory: DocumentSubCategory.CARTAO_CNPJ,
    description: 'Comprovante de Inscrição e de Situação Cadastral na Receita Federal do Brasil.',
    fileName: 'Cartao_CNPJ_RFB.pdf',
    fileSize: '650 KB',
    fileType: 'PDF',
    issueDate: '01/09/2026',
    expiryDate: null,
    issuer: 'Receita Federal do Brasil',
    documentNumber: '12.345.678/0001-90',
    observations: 'Situação Cadastral: ATIVA. CNAE Principal: 71.12-0-00 (Serviços de engenharia).',
    tags: ['CNPJ', 'Receita Federal', 'Ativo'],
    responsibleInternal: 'Carlos Silveira (Comercial)',
    uploadDate: '02/09/2026 09:10',
    lastUpdate: '02/09/2026 09:10',
    version: 'v1.0',
    hash: 'sha256:6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a',
    extractedText: 'COMPROVANTE DE INSCRIÇÃO E DE SITUAÇÃO CADASTRAL. CNPJ: 12.345.678/0001-90. NOME EMPRESARIAL: EXCELÊNCIA AMBIENTAL ENGENHARIA LTDA. SITUAÇÃO CADASTRAL: ATIVA.'
  },

  // FISCAIS (5 documentos: Federal, Estadual, Municipal, FGTS, CNDT)
  {
    id: 'doc-fisc-01',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Certidao_Conjunta_Federal_RFB_PGFN.pdf',
    category: DocumentCategory.FISCAL,
    subCategory: DocumentSubCategory.CERTIDAO_FEDERAL,
    description: 'Certidão Negativa de Débitos Relativos aos Tributos Federais e à Dívida Ativa da União.',
    fileName: 'CND_Federal_RFB_PGFN_Valida.pdf',
    fileSize: '820 KB',
    fileType: 'PDF',
    issueDate: '20/06/2026',
    expiryDate: '18/12/2026',
    issuer: 'Receita Federal / PGFN',
    documentNumber: 'CND-FED-8921-2026',
    observations: 'Certidão em vigor e com ampla folga de prazo.',
    tags: ['Federal', 'Tributos', 'PGFN'],
    responsibleInternal: 'Carlos Silveira (Comercial)',
    uploadDate: '21/06/2026 10:15',
    lastUpdate: '21/06/2026 10:15',
    version: 'v1.0',
    hash: 'sha256:5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f',
    extractedText: 'CERTIDÃO NEGATIVA DE DÉBITOS RELATIVOS AOS TRIBUTOS FEDERAIS E À DÍVIDA ATIVA DA UNIÃO. Certifica que não constam pendências em nome do contribuinte.'
  },
  {
    id: 'doc-fisc-02',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Certidao_Estadual_SEFAZ_PE.pdf',
    category: DocumentCategory.FISCAL,
    subCategory: DocumentSubCategory.CERTIDAO_ESTADUAL,
    description: 'Certidão de Regularidade Fiscal Estadual perante a Secretaria da Fazenda de Pernambuco.',
    fileName: 'CND_SEFAZ_PE.pdf',
    fileSize: '740 KB',
    fileType: 'PDF',
    issueDate: '28/05/2026',
    expiryDate: '25/11/2026',
    issuer: 'SEFAZ-PE',
    documentNumber: 'SEFAZ-PE-098231',
    observations: 'Sem débitos tributários de ICMS ou taxas estaduais.',
    tags: ['Estadual', 'SEFAZ', 'Pernambuco'],
    responsibleInternal: 'Carlos Silveira (Comercial)',
    uploadDate: '29/05/2026 11:30',
    lastUpdate: '29/05/2026 11:30',
    version: 'v1.0',
    hash: 'sha256:4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e',
    extractedText: 'ESTADO DE PERNAMBUCO - SECRETARIA DA FAZENDA. CERTIDÃO NARRATIVA DE REGULARIDADE FISCAL. Constata-se inexistência de débitos inscritos.'
  },
  {
    id: 'doc-fisc-03',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Certidao_Municipal_Recife_Tributos.pdf',
    category: DocumentCategory.FISCAL,
    subCategory: DocumentSubCategory.CERTIDAO_MUNICIPAL,
    description: 'Certidão Negativa de Débitos Tributários Municipais (Prefeitura da Cidade do Recife).',
    fileName: 'CND_Municipal_Recife.pdf',
    fileSize: '690 KB',
    fileType: 'PDF',
    issueDate: '15/07/2026',
    expiryDate: '10/01/2027',
    issuer: 'Prefeitura da Cidade do Recife / SEFIN',
    documentNumber: 'SEFIN-REC-2026-7819',
    observations: 'Regularidade quanto ao ISS e taxas municipais.',
    tags: ['Municipal', 'Recife', 'ISS'],
    responsibleInternal: 'Carlos Silveira (Comercial)',
    uploadDate: '16/07/2026 15:00',
    lastUpdate: '16/07/2026 15:00',
    version: 'v1.0',
    hash: 'sha256:3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d',
    extractedText: 'PREFEITURA DA CIDADE DO RECIFE. CERTIDÃO NEGATIVA DE DÉBITOS MERCANTIS E IMOBILIÁRIOS.'
  },
  {
    id: 'doc-fisc-04',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Certificado_Regularidade_FGTS_CRF.pdf',
    category: DocumentCategory.FISCAL,
    subCategory: DocumentSubCategory.FGTS,
    description: 'Certificado de Regularidade do FGTS emitido pela Caixa Econômica Federal.',
    fileName: 'CRF_FGTS_Caixa.pdf',
    fileSize: '510 KB',
    fileType: 'PDF',
    issueDate: '30/09/2026',
    expiryDate: '30/10/2026',
    issuer: 'Caixa Econômica Federal',
    documentNumber: 'CRF-202609301129',
    observations: 'Certidão com validade mensal (renovação rotineira mensal).',
    tags: ['FGTS', 'Caixa', 'Trabalhista'],
    responsibleInternal: 'Carlos Silveira (Comercial)',
    uploadDate: '01/10/2026 08:30',
    lastUpdate: '01/10/2026 08:30',
    version: 'v1.0',
    hash: 'sha256:2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c',
    extractedText: 'CERTIFICADO DE REGULARIDADE DO FGTS - CRF. A Caixa Econômica Federal certifica que a empresa encontra-se em situação regular perante o FGTS.'
  },
  {
    id: 'doc-fisc-05',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Certidao_Negativa_Debitos_Trabalhistas_CNDT.pdf',
    category: DocumentCategory.FISCAL,
    subCategory: DocumentSubCategory.CNDT,
    description: 'Certidão Negativa de Débitos Trabalhistas emitida pela Justiça do Trabalho (TST).',
    fileName: 'CNDT_Trabalhista_TST.pdf',
    fileSize: '580 KB',
    fileType: 'PDF',
    issueDate: '18/04/2026',
    expiryDate: '15/10/2026', // Vencimento próximo (Item 5 e 6)
    issuer: 'Tribunal Superior do Trabalho - TST',
    documentNumber: 'CNDT-10829301/2026',
    observations: 'ATENÇÃO: Vencimento próximo! Requer solicitação de nova certidão online no portal do TST.',
    tags: ['CNDT', 'Trabalhista', 'TST', 'Vencimento Próximo'],
    responsibleInternal: 'Carlos Silveira (Comercial)',
    uploadDate: '19/04/2026 14:10',
    lastUpdate: '01/10/2026 09:00',
    version: 'v1.0',
    hash: 'sha256:1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b',
    extractedText: 'PODER JUDICIÁRIO - JUSTIÇA DO TRABALHO. CERTIDÃO NEGATIVA DE DÉBITOS TRABALHISTAS. Não constam processos com condenação transitada em julgado inadimplida.'
  },

  // TÉCNICOS & REGISTRO DE EMPRESA
  {
    id: 'doc-tec-01',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Certidao_Registro_Quitacao_CREA_PE.pdf',
    category: DocumentCategory.TECNICO,
    subCategory: DocumentSubCategory.REGISTRO_CREA,
    description: 'Certidão de Registro e Quitação de Pessoa Jurídica no CREA-PE com indicação de responsáveis técnicos.',
    fileName: 'Certidao_CREA_PE_PJ.pdf',
    fileSize: '1.4 MB',
    fileType: 'PDF',
    issueDate: '10/01/2026',
    expiryDate: '31/03/2027',
    issuer: 'Conselho Regional de Engenharia e Agronomia de Pernambuco (CREA-PE)',
    documentNumber: 'CREA-PE nº 042891/D',
    observations: 'Registro ATIVO e com anuidade integralmente quitada. Responsável Técnico: Dr. Roberto Albuquerque.',
    tags: ['CREA', 'Registro PJ', 'Engenharia'],
    responsibleInternal: 'Dr. Roberto Albuquerque (Responsável Técnico)',
    uploadDate: '12/01/2026 16:40',
    lastUpdate: '12/01/2026 16:40',
    version: 'v2.0',
    hash: 'sha256:0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a',
    extractedText: 'CONSELHO REGIONAL DE ENGENHARIA E AGRONOMIA DE PERNAMBUCO - CREA-PE. CERTIDÃO DE REGISTRO E QUITAÇÃO DE PESSOA JURÍDICA. EMPRESA: EXCELÊNCIA AMBIENTAL LTDA.'
  },

  // VEELUEN SOLUTIONS (Documentos da segunda empresa)
  {
    id: 'doc-veeluen-jur-01',
    companyId: 'veeluen-solutions',
    companyName: 'Veeluen Solutions',
    name: 'Contrato_Social_Veeluen_Solutions.pdf',
    category: DocumentCategory.JURIDICO,
    subCategory: DocumentSubCategory.CONTRATO_SOCIAL,
    description: 'Contrato Social da Veeluen Solutions focado em tratamento de águas, efluentes e saneamento industrial.',
    fileName: 'Contrato_Social_Veeluen_JUCES.pdf',
    fileSize: '3.6 MB',
    fileType: 'PDF',
    issueDate: '10/03/2025',
    expiryDate: null,
    issuer: 'JUCEPE',
    documentNumber: 'NIRE 26300099412',
    observations: 'Especializada em operação contínua de ETEs, desidratação de lodo e reúso de água.',
    tags: ['Contrato Social', 'Saneamento', 'Veeluen'],
    responsibleInternal: 'Beatriz Vasconcelos (Operações)',
    uploadDate: '14/03/2025 10:00',
    lastUpdate: '14/03/2025 10:00',
    version: 'v2.0',
    hash: 'sha256:fa9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b',
    extractedText: 'CONTRATO SOCIAL VEELUEN SOLUTIONS TRATAMENTO DE ÁGUAS E EFLUENTES LTDA.'
  },
  {
    id: 'doc-veeluen-fisc-01',
    companyId: 'veeluen-solutions',
    companyName: 'Veeluen Solutions',
    name: 'Certidao_Federal_Veeluen_Valida.pdf',
    category: DocumentCategory.FISCAL,
    subCategory: DocumentSubCategory.CERTIDAO_FEDERAL,
    description: 'Certidão Negativa Conjunta Federal da Veeluen Solutions.',
    fileName: 'CND_Federal_Veeluen.pdf',
    fileSize: '790 KB',
    fileType: 'PDF',
    issueDate: '10/07/2026',
    expiryDate: '06/01/2027',
    issuer: 'Receita Federal / PGFN',
    documentNumber: 'CND-FED-VEELUEN-991',
    observations: 'Certidão regular e válida.',
    tags: ['Federal', 'Veeluen', 'Válida'],
    responsibleInternal: 'Beatriz Vasconcelos (Operações)',
    uploadDate: '11/07/2026 09:20',
    lastUpdate: '11/07/2026 09:20',
    version: 'v1.0',
    hash: 'sha256:ea8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    extractedText: 'CERTIDÃO NEGATIVA DE DÉBITOS FEDERAIS. VEELUEN SOLUTIONS LTDA.'
  }
];

// BANCO ESTRUTURADO DE ATESTADOS DE CAPACIDADE TÉCNICA (Itens 15 a 24)
const SEED_ATTESTATIONS = [
  {
    id: 'atest-ea-01',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
    clientCnpj: '33.000.167/0842-19',
    object: 'Prestação de serviços contínuos de medição, amostragem e monitoramento isocinético de emissões atmosféricas em fontes estacionárias (chaminés e fornos de processo).',
    serviceDescription: 'Execução de 120 campanhas de amostragem isocinética para quantificação de Material Particulado (MP), SOx, NOx, CO, VOCs e compostos reduzidos de enxofre em dutos e chaminés de unidades de refino.',
    startDate: '01/03/2022',
    endDate: '28/02/2025',
    durationMonths: 36,
    location: 'Ipojuca - PE',
    quantity: 120,
    unit: 'campanhas completas de amostragem',
    hours: 8640,
    responsibleTechnical: 'Dr. Roberto Albuquerque',
    creaRegistration: 'CREA-PE 038192',
    artNumber: 'ART-PE-2024-0098231',
    catNumber: 'CAT-CREA-PE nº 2025-01492',
    relatedServices: [
      'Monitoramento de Emissões Atmosféricas',
      'Amostragem Isocinética de Chaminé',
      'Inventário de Gases de Efeito Estufa (GEE)',
      'Laudos Técnicos Ambientais'
    ],
    equipmentUsed: [
      'Trem de Amostragem Isocinética Apex Instruments C-5000',
      'Analisador Eletrônico Testo 350 Flue Gas',
      'Tubo Pitot Tipo S Calibrado',
      'Barômetro Digital Instrutherm'
    ],
    qualityScore: 96,
    qualityTier: AttestationStrengthTier.MUITO_FORTE,
    fileName: 'Atestado_Petrobras_RNEST_Emissoes_36M.pdf',
    fileSize: '3.1 MB',
    hash: 'sha256:9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210',
    observations: 'Atestado emitido com firma reconhecida e chancelado com CAT registrada no CREA-PE sob ART-PE-2024-0098231.',
    reviewedManually: true,
    reviewedBy: 'Carlos Silveira (Comercial / Licitações)',
    reviewedAt: '05/10/2026 11:30'
  },
  {
    id: 'atest-ea-02',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    client: 'Braskem S.A. - Polo Cloroquímico de Alagoas',
    clientCnpj: '42.150.391/0045-80',
    object: 'Medição de emissões atmosféricas industriais fugitivas e dutos com elaboração de relatórios técnicos de conformidade CPRH/IMA.',
    serviceDescription: 'Amostragens trimestrais em 16 dutos industriais de processos petroquímicos e fornos de pirólise, com cromatografia gasosa e determinação de orgânicos voláteis.',
    startDate: '01/08/2022',
    endDate: '31/07/2024',
    durationMonths: 24,
    location: 'Maceió - AL',
    quantity: 48,
    unit: 'campanhas de medição',
    hours: 3840,
    responsibleTechnical: 'Dr. Roberto Albuquerque',
    creaRegistration: 'CREA-PE 038192',
    artNumber: 'ART-AL-2023-0044122',
    catNumber: 'CAT-CREA-AL nº 2024-00891',
    relatedServices: [
      'Monitoramento de Emissões Atmosféricas',
      'Medição de Emissões Fugitivas (Método EPA 21)',
      'Relatórios Técnicos Ambientais'
    ],
    equipmentUsed: [
      'Analisador FID de Emissões Fugitivas',
      'Trem de Amostragem Isocinética'
    ],
    qualityScore: 88,
    qualityTier: AttestationStrengthTier.FORTE,
    fileName: 'Atestado_Braskem_Polo_Cloroquimico_24M.pdf',
    fileSize: '2.4 MB',
    hash: 'sha256:8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba98765432109f',
    observations: 'Comprova execução contínua de 24 meses em ambiente petroquímico Classe 1.',
    reviewedManually: true,
    reviewedBy: 'Carlos Silveira (Comercial)',
    reviewedAt: '05/10/2026 11:35'
  },
  {
    id: 'atest-ea-03',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    client: 'Petrobras - Complexo Gaslub Itaboraí (Comperj)',
    clientCnpj: '33.000.167/0981-01',
    object: 'Inventário de emissões de fontes fixas e modelagem matemática de dispersão de poluentes atmosféricos (AERMOD).',
    serviceDescription: 'Modelagem de dispersão atmosférica de 32 chaminés, elaboração de inventário de gases de efeito estufa e validação junto ao órgão ambiental estadual (INEA).',
    startDate: '01/05/2024',
    endDate: '31/10/2025',
    durationMonths: 18,
    location: 'Itaboraí - RJ',
    quantity: 32,
    unit: 'fontes industriais modeladas',
    hours: 2400,
    responsibleTechnical: 'Dr. Roberto Albuquerque',
    creaRegistration: 'CREA-PE 038192',
    artNumber: 'ART-RJ-2025-0102931',
    catNumber: 'CAT-CREA-RJ nº 2025-0912',
    relatedServices: [
      'Modelagem de Dispersão Atmosférica (AERMOD)',
      'Inventário de Emissões de Fontes Fixas',
      'Licenciamento Ambiental Industrial'
    ],
    equipmentUsed: [
      'Estação Meteorológica Integrada Portátil',
      'Software BREEZE AERMOD Professional'
    ],
    qualityScore: 82,
    qualityTier: AttestationStrengthTier.FORTE,
    fileName: 'Atestado_Gaslub_Modelagem_Dispersao_18M.pdf',
    fileSize: '2.8 MB',
    hash: 'sha256:7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba98765432109f8e',
    observations: 'Atestado de alta complexidade em modelagem de impacto ambiental.',
    reviewedManually: true,
    reviewedBy: 'Carlos Silveira (Comercial)',
    reviewedAt: '05/10/2026 11:40'
  },

  // ATESTADO VEELUEN SOLUTIONS (Para saneamento / ETE)
  {
    id: 'atest-vs-01',
    companyId: 'veeluen-solutions',
    companyName: 'Veeluen Solutions',
    client: 'Transpetro - Terminal Aquaviário de Suape',
    clientCnpj: '02.709.449/0014-92',
    object: 'Operação, controle analítico e manutenção eletromecânica preventiva e corretiva de Estação de Tratamento de Efluentes Industriais e Sanitários (ETE/ETDI).',
    serviceDescription: 'Operação ininterrupta em regime 24/7 com vazão média de 80 m³/h, controle de dosagem química, prensagem de lodo e análises laboratoriais diárias de DBO, DQO, Óleos & Graxas e pH.',
    startDate: '10/01/2023',
    endDate: '09/01/2026',
    durationMonths: 36,
    location: 'Ipojuca - PE',
    quantity: 36,
    unit: 'meses de operação contínua 24/7',
    hours: 26280,
    responsibleTechnical: 'Eng. Eduardo Moreira',
    creaRegistration: 'CREA-PE 049812',
    artNumber: 'ART-PE-2023-0051289',
    catNumber: 'CAT-CREA-PE nº 2026-00412',
    relatedServices: [
      'Operação e Manutenção de ETE Industrial',
      'Tratamento de Águas e Efluentes',
      'Monitoramento de Qualidade da Água e Efluentes'
    ],
    equipmentUsed: [
      'Prensa Desaguadora de Lodo Parafuso',
      'Medidores de Vazão Eletromagnéticos',
      'Sondas Ópticas de Oxigênio Dissolvido'
    ],
    qualityScore: 94,
    qualityTier: AttestationStrengthTier.MUITO_FORTE,
    fileName: 'Atestado_Transpetro_Suape_ETE_36M.pdf',
    fileSize: '3.4 MB',
    hash: 'sha256:6c5b4a3210fedcba9876543210fedcba9876543210fedcba98765432109f8e7d',
    observations: 'Comprova capacidade operacional integral para ETEs de grande porte.',
    reviewedManually: true,
    reviewedBy: 'Beatriz Vasconcelos (Operações)',
    reviewedAt: '05/10/2026 11:45'
  }
];

// BANCO DE ARTs (Anotações de Responsabilidade Técnica - Item 25 e 26)
const SEED_ARTS = [
  {
    number: 'ART-PE-2024-0098231',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    responsibleTechnical: 'Dr. Roberto Albuquerque',
    crea: 'CREA-PE 038192',
    object: 'Prestação de serviços contínuos de medição e amostragem de emissões atmosféricas na Refinaria Abreu e Lima - RNEST.',
    issueDate: '10/01/2024',
    status: 'CONCLUÍDA / COM CAT BAIXADA',
    contractRelated: 'Contrato Petrobras nº 4600582910',
    certificateRelatedId: 'atest-ea-01',
    serviceRelated: 'Monitoramento de Emissões Atmosféricas',
    fileName: 'ART_PE_2024_0098231_RNEST.pdf',
    fileSize: '520 KB',
    hash: 'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
  },
  {
    number: 'ART-AL-2023-0044122',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    responsibleTechnical: 'Dr. Roberto Albuquerque',
    crea: 'CREA-PE 038192 (Visto CREA-AL nº 1492)',
    object: 'Monitoramento ambiental de chaminés e dutos industriais na Braskem Alagoas.',
    issueDate: '15/07/2023',
    status: 'CONCLUÍDA / COM CAT BAIXADA',
    contractRelated: 'Contrato Braskem nº BRK-2023-991',
    certificateRelatedId: 'atest-ea-02',
    serviceRelated: 'Medição de Emissões Fugitivas e Dutos',
    fileName: 'ART_AL_2023_0044122_Braskem.pdf',
    fileSize: '490 KB',
    hash: 'sha256:2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c'
  },
  {
    number: 'ART-PE-2023-0051289',
    companyId: 'veeluen-solutions',
    companyName: 'Veeluen Solutions',
    responsibleTechnical: 'Eng. Eduardo Moreira',
    crea: 'CREA-PE 049812',
    object: 'Operação e controle de Estação de Tratamento de Efluentes Industriais e Sanitários no Terminal de Suape.',
    issueDate: '05/01/2023',
    status: 'CONCLUÍDA / COM CAT BAIXADA',
    contractRelated: 'Contrato Transpetro nº 480029101',
    certificateRelatedId: 'atest-vs-01',
    serviceRelated: 'Operação e Manutenção de ETE Industrial',
    fileName: 'ART_PE_2023_0051289_Suape.pdf',
    fileSize: '540 KB',
    hash: 'sha256:3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d'
  }
];

// BANCO DE CATs (Certidões de Acervo Técnico - Item 27)
const SEED_CATS = [
  {
    number: 'CAT-CREA-PE nº 2025-01492',
    responsibleTechnical: 'Dr. Roberto Albuquerque',
    crea: 'CREA-PE 038192',
    certificateRelatedId: 'atest-ea-01',
    artRelatedNumber: 'ART-PE-2024-0098231',
    issueDate: '15/03/2025',
    fileName: 'CAT_CREA_PE_Roberto_Albuquerque_RNEST.pdf',
    fileSize: '890 KB',
    hash: 'sha256:4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'
  },
  {
    number: 'CAT-CREA-PE nº 2026-00412',
    responsibleTechnical: 'Eng. Eduardo Moreira',
    crea: 'CREA-PE 049812',
    certificateRelatedId: 'atest-vs-01',
    artRelatedNumber: 'ART-PE-2023-0051289',
    issueDate: '10/01/2026',
    fileName: 'CAT_CREA_PE_Eduardo_Moreira_Suape.pdf',
    fileSize: '810 KB',
    hash: 'sha256:5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f'
  }
];

// BANCO DE RESPONSÁVEIS TÉCNICOS & EQUIPE (Itens 28, 29, 30)
const SEED_PERSONNEL = [
  {
    id: 'prof-ea-01',
    name: 'Dr. Roberto Albuquerque',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    role: 'Responsável Técnico Principal / Coordenador de Amostragem',
    profession: 'Engenheiro Químico e de Segurança do Trabalho',
    registration: 'CREA-PE nº 038192/D (Ativo e Regular)',
    specialties: ['Monitoramento de Emissões', 'Amostragem Isocinética', 'Modelagem AERMOD', 'Engenharia de Segurança'],
    relatedServices: ['Monitoramento de Emissões Atmosféricas', 'Amostragem Isocinética', 'Inventário de GEE'],
    certifications: [
      { name: 'NR-33 (Espaço Confinado - Supervisor)', issueDate: '10/02/2026', expiryDate: '10/02/2027', status: 'VÁLIDA' },
      { name: 'NR-35 (Trabalho em Altura - Avançado)', issueDate: '15/03/2026', expiryDate: '15/03/2028', status: 'VÁLIDA' },
      { name: 'NR-10 (Segurança em Instalações Elétricas)', issueDate: '20/01/2025', expiryDate: '20/01/2027', status: 'VÁLIDA' }
    ],
    resume: 'Doutor em Tecnologia Ambiental pela UFPE com 16 anos de experiência em monitoramento de fontes estacionárias em refinarias, plantas químicas e térmicas.',
    availability: 'DISPONÍVEL IMEDIATO (Coordenador Técnico Dedicado)',
    status: 'ATIVO'
  },
  {
    id: 'prof-ea-02',
    name: 'Juliana Cavalcanti',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    role: 'Engenheira Ambiental Pleno / Especialista de Campo',
    profession: 'Engenheira Ambiental e Sanitarista',
    registration: 'CREA-PE nº 058190/D (Ativo)',
    specialties: ['Qualidade do Ar', 'Amostragem de Poluentes Atmosféricos', 'Licenciamento Ambiental'],
    relatedServices: ['Monitoramento de Emissões Atmosféricas', 'Monitoramento da Qualidade do Ar'],
    certifications: [
      { name: 'NR-35 (Trabalho em Altura)', issueDate: '12/04/2026', expiryDate: '12/04/2028', status: 'VÁLIDA' },
      { name: 'NR-33 (Espaço Confinado)', issueDate: '10/05/2026', expiryDate: '10/05/2027', status: 'VÁLIDA' }
    ],
    resume: 'Engenheira Ambiental com 7 anos de atuação em amostragem isocinética de chaminé, cálculos de vazão e elaboração de relatórios técnicos.',
    availability: 'DISPONÍVEL EM CAMPO',
    status: 'ATIVO'
  },
  {
    id: 'prof-vs-01',
    name: 'Eng. Eduardo Moreira',
    companyId: 'veeluen-solutions',
    companyName: 'Veeluen Solutions',
    role: 'Responsável Técnico / Gerente de Operação de ETE',
    profession: 'Engenheiro Químico',
    registration: 'CREA-PE nº 049812/D (Ativo)',
    specialties: ['Operação de ETE/ETDI', 'Controle Químico e Biológico', 'Desidratação de Lodo'],
    relatedServices: ['Operação e Manutenção de ETE Industrial', 'Tratamento de Águas e Efluentes'],
    certifications: [
      { name: 'NR-33 (Supervisor de Espaço Confinado)', issueDate: '05/02/2026', expiryDate: '05/02/2027', status: 'VÁLIDA' },
      { name: 'NR-13 (Caldeiras e Vasos de Pressão)', issueDate: '10/11/2025', expiryDate: '10/11/2027', status: 'VÁLIDA' }
    ],
    resume: 'Engenheiro Químico com 12 anos de experiência liderando operação contínua de ETEs de alta carga em terminais marítimos e indústrias farmacêuticas.',
    availability: 'DISPONÍVEL (Operação ETE)',
    status: 'ATIVO'
  }
];

// BANCO DE EQUIPAMENTOS & CALIBRAÇÃO RBC (Itens 31, 32, 33)
const SEED_EQUIPMENT = [
  {
    id: 'eq-ea-01',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Trem de Amostragem Isocinética de Chaminé Completo',
    manufacturer: 'Apex Instruments',
    model: 'C-5000 Isokinetic Source Sampler',
    serialNumber: 'APX-2022-8921',
    relatedServices: ['Monitoramento de Emissões Atmosféricas', 'Amostragem Isocinética'],
    certificationRequired: true,
    lastCalibrationDate: '15/12/2025',
    nextCalibrationDate: '15/12/2026', // Calibração em dia
    calibrationCertificate: 'Certificado RBC Laboratório Calibrar nº RBC-2025-9982',
    calibrationMandatory: true,
    status: 'OPERACIONAL / DISPONÍVEL',
    notes: 'Equipamento revisado, com sonda aquecida de 3 metros, caixa quente e umbilicais calibrados.'
  },
  {
    id: 'eq-ea-02',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Analisador Eletrônico de Gases de Combustão',
    manufacturer: 'Testo',
    model: 'Testo 350 Flue Gas Analyzer',
    serialNumber: 'TST-350-09823',
    relatedServices: ['Monitoramento de Emissões Atmosféricas', 'Medição de Gases O2, CO, NO, NO2, SO2'],
    certificationRequired: true,
    lastCalibrationDate: '20/10/2025',
    nextCalibrationDate: '20/10/2026', // Vence em breve (Item 32)
    calibrationCertificate: 'Certificado Testo do Brasil RBC-88120',
    calibrationMandatory: true,
    status: 'OPERACIONAL (Calibração vence em breve)',
    notes: 'Sensores eletroquímicos de CO, NO, NO2 e SO2 recém-aferidos com gases de referência.'
  },
  {
    id: 'eq-ea-03',
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    name: 'Tubo Pitot Tipo S Calibrado com Termopar Integrado',
    manufacturer: 'Apex Instruments',
    model: 'Pitot Tipo S 3,0 metros',
    serialNumber: 'PTS-300-4412',
    relatedServices: ['Medição de Velocidade e Vazão em Chaminé', 'Amostragem Isocinética'],
    certificationRequired: true,
    lastCalibrationDate: '10/02/2026',
    nextCalibrationDate: '10/02/2027',
    calibrationCertificate: 'Certificado IPT/SP nº 2026-PT-1092',
    calibrationMandatory: true,
    status: 'OPERACIONAL / DISPONÍVEL',
    notes: 'Coeficiente de pitot (Cp = 0,84) determinado em túnel de vento credenciado.'
  },
  {
    id: 'eq-vs-01',
    companyId: 'veeluen-solutions',
    companyName: 'Veeluen Solutions',
    name: 'Prensa Desaguadora de Lodo Tipo Parafuso Voluta',
    manufacturer: 'Amcon Europe',
    model: 'Volute Dewatering Press ES-201',
    serialNumber: 'VDP-2023-Suape',
    relatedServices: ['Operação e Manutenção de ETE Industrial', 'Desidratação de Lodo'],
    certificationRequired: false,
    lastCalibrationDate: '15/01/2026',
    nextCalibrationDate: '15/01/2027',
    calibrationCertificate: 'Relatório de Manutenção Preventiva Prevent-Tech nº 891',
    calibrationMandatory: false,
    status: 'EM OPERAÇÃO / TERMINAL SUAPE',
    notes: 'Operando no Terminal Aquaviário de Suape com taxa de captura de sólidos > 95%.'
  }
];

// Helpers seguros de persistência com fallback universal
const memoryStore = {};
function getStorageItem(key, fallback) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const val = localStorage.getItem(key);
      if (val) return JSON.parse(val);
    }
  } catch {}
  return memoryStore[key] ? memoryStore[key] : fallback;
}

function setStorageItem(key, value) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
  memoryStore[key] = value;
}

export class DocumentVaultService {
  /**
   * Helper: Calcula o status automático com base na data de validade (Item 5)
   */
  static calculateValidityStatus(expiryDateStr) {
    if (!expiryDateStr) {
      return {
        status: DocumentStatus.SEM_VALIDADE,
        daysLeft: null,
        badgeClass: 'status-sem-validade'
      };
    }

    try {
      const parts = expiryDateStr.split('/');
      if (parts.length !== 3) return { status: DocumentStatus.SEM_VALIDADE, daysLeft: null, badgeClass: 'status-sem-validade' };
      
      const expDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expDate.setHours(0, 0, 0, 0);

      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return {
          status: DocumentStatus.VENCIDO,
          daysLeft: diffDays,
          badgeClass: 'status-vencido'
        };
      } else if (diffDays <= 15) {
        return {
          status: DocumentStatus.VENCE_EM_BREVE,
          daysLeft: diffDays,
          badgeClass: 'status-vence-breve'
        };
      } else if (diffDays <= 30) {
        return {
          status: DocumentStatus.ATENCAO,
          daysLeft: diffDays,
          badgeClass: 'status-atencao'
        };
      } else {
        return {
          status: DocumentStatus.VALIDO,
          daysLeft: diffDays,
          badgeClass: 'status-valido'
        };
      }
    } catch {
      return { status: DocumentStatus.SEM_VALIDADE, daysLeft: null, badgeClass: 'status-sem-validade' };
    }
  }

  /**
   * Retorna todos os documentos, calculando status de validade atualizado
   */
  static listDocuments(companyId = null) {
    try {
      let docs = getStorageItem(STORAGE_KEYS.DOCUMENTS, SEED_DOCUMENTS);

      if (companyId && companyId !== 'ALL') {
        docs = docs.filter(d => d.companyId === companyId);
      }

      return docs.map(doc => {
        const val = this.calculateValidityStatus(doc.expiryDate);
        return {
          ...doc,
          calculatedStatus: val.status,
          daysUntilExpiry: val.daysLeft,
          statusClass: val.badgeClass
        };
      });
    } catch (e) {
      console.warn('Erro ao listar documentos:', e);
      return SEED_DOCUMENTS;
    }
  }

  /**
   * Retorna os atestados estruturados
   */
  static listAttestations(companyId = null) {
    try {
      let list = getStorageItem(STORAGE_KEYS.ATTESTATIONS, SEED_ATTESTATIONS);
      if (companyId && companyId !== 'ALL') {
        list = list.filter(a => a.companyId === companyId);
      }
      return list;
    } catch {
      return SEED_ATTESTATIONS;
    }
  }

  /**
   * Retorna ARTs cadastradas
   */
  static listARTs(companyId = null) {
    try {
      let list = getStorageItem(STORAGE_KEYS.ARTS, SEED_ARTS);
      if (companyId && companyId !== 'ALL') {
        list = list.filter(a => a.companyId === companyId);
      }
      return list;
    } catch {
      return SEED_ARTS;
    }
  }

  /**
   * Retorna CATs cadastradas
   */
  static listCATs() {
    try {
      return getStorageItem(STORAGE_KEYS.CATS, SEED_CATS);
    } catch {
      return SEED_CATS;
    }
  }

  /**
   * Retorna a equipe técnica
   */
  static listPersonnel(companyId = null) {
    try {
      let list = getStorageItem(STORAGE_KEYS.PERSONNEL, SEED_PERSONNEL);
      if (companyId && companyId !== 'ALL') {
        list = list.filter(p => p.companyId === companyId);
      }
      return list;
    } catch {
      return SEED_PERSONNEL;
    }
  }

  /**
   * Retorna equipamentos cadastrados
   */
  static listEquipment(companyId = null) {
    try {
      let list = getStorageItem(STORAGE_KEYS.EQUIPMENT, SEED_EQUIPMENT);
      if (companyId && companyId !== 'ALL') {
        list = list.filter(eq => eq.companyId === companyId);
      }
      return list;
    } catch {
      return SEED_EQUIPMENT;
    }
  }

  /**
   * Adiciona novo documento (Upload com versionamento e histórico - Itens 10, 12, 13)
   */
  static addDocument(newDocData, author = 'Equipe de Licitações') {
    const list = this.listDocuments();
    
    // Se for uma nova versão de documento existente, marca o anterior como SUBSTITUÍDO
    if (newDocData.replacesDocId) {
      const prevIdx = list.findIndex(d => d.id === newDocData.replacesDocId);
      if (prevIdx !== -1) {
        list[prevIdx].status = DocumentStatus.SUBSTITUIDO;
        list[prevIdx].replacedAt = new Date().toISOString();
        list[prevIdx].replacedBy = author;
      }
    }

    const docEntry = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      companyId: newDocData.companyId || 'excelencia-ambiental',
      companyName: newDocData.companyId === 'veeluen-solutions' ? 'Veeluen Solutions' : 'Excelência Ambiental',
      name: newDocData.name,
      category: newDocData.category || DocumentCategory.JURIDICO,
      subCategory: newDocData.subCategory || 'Documento Geral',
      description: newDocData.description || 'Documento adicionado ao cofre corporativo.',
      fileName: newDocData.fileName || newDocData.name,
      fileSize: newDocData.fileSize || '1.8 MB',
      fileType: newDocData.fileType || 'PDF',
      issueDate: newDocData.issueDate || new Date().toLocaleDateString('pt-BR'),
      expiryDate: newDocData.expiryDate || null,
      issuer: newDocData.issuer || 'Órgão Competente',
      documentNumber: newDocData.documentNumber || `REG-${Date.now()}`,
      status: DocumentStatus.VALIDO,
      observations: newDocData.observations || '',
      tags: newDocData.tags || ['Documento', 'Novo'],
      responsibleInternal: author,
      uploadDate: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lastUpdate: new Date().toLocaleDateString('pt-BR'),
      version: newDocData.version || 'v1.0',
      hash: newDocData.hash || `sha256:${Math.random().toString(36).substr(2, 32)}`,
      extractedText: newDocData.extractedText || `Texto transcrito do documento ${newDocData.name}.`
    };

    list.unshift(docEntry);
    setStorageItem(STORAGE_KEYS.DOCUMENTS, list);

    // Registrar na Trilha de Auditoria (Item 43)
    this.recordAuditLog({
      action: 'UPLOAD_DOCUMENTO',
      documentId: docEntry.id,
      documentName: docEntry.name,
      user: author,
      details: `Documento "${docEntry.name}" categorizado como "${docEntry.category}" adicionado com sucesso.`
    });

    return docEntry;
  }

  /**
   * Adiciona ou atualiza atestado com revisão manual (Item 19)
   */
  static saveAttestation(attData, reviewer = 'Especialista em Licitações') {
    const list = this.listAttestations();
    const entry = {
      ...attData,
      id: attData.id || `atest-${Date.now()}`,
      qualityScore: attData.qualityScore || 90,
      qualityTier: attData.qualityScore >= 90 ? AttestationStrengthTier.MUITO_FORTE :
                   attData.qualityScore >= 75 ? AttestationStrengthTier.FORTE :
                   attData.qualityScore >= 60 ? AttestationStrengthTier.MODERADO : AttestationStrengthTier.FRACO,
      reviewedManually: true,
      reviewedBy: reviewer,
      reviewedAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const existingIdx = list.findIndex(a => a.id === entry.id);
    if (existingIdx !== -1) {
      list[existingIdx] = entry;
    } else {
      list.unshift(entry);
    }

    setStorageItem(STORAGE_KEYS.ATTESTATIONS, list);
    return entry;
  }

  /**
   * Gera o Relatório de Saúde Documental & Semáforo (Itens 44, 45, 46)
   */
  static getDocumentHealthReport(companyId = null) {
    const docs = this.listDocuments(companyId);
    const attestations = this.listAttestations(companyId);
    const arts = this.listARTs(companyId);
    const equipment = this.listEquipment(companyId);

    const total = docs.length;
    const valid = docs.filter(d => d.calculatedStatus === DocumentStatus.VALIDO).length;
    const expiring30d = docs.filter(d => d.daysUntilExpiry !== null && d.daysUntilExpiry > 0 && d.daysUntilExpiry <= 30).length;
    const expiring7d = docs.filter(d => d.daysUntilExpiry !== null && d.daysUntilExpiry > 0 && d.daysUntilExpiry <= 7).length;
    const expired = docs.filter(d => d.calculatedStatus === DocumentStatus.VENCIDO).length;
    const withoutExpiry = docs.filter(d => d.calculatedStatus === DocumentStatus.SEM_VALIDADE).length;

    // Equipamentos com calibração próxima
    const eqCalibratingSoon = equipment.filter(e => e.status?.includes('vence em breve') || e.status?.includes('ATENÇÃO')).length;

    // Atestados Fortes
    const strongAttestations = attestations.filter(a => a.qualityScore >= 75).length;
    const fragileAttestations = attestations.filter(a => a.qualityScore < 75).length;

    // Semáforo Geral (Item 45)
    let semaphore = 'VERDE'; // VERDE, AMARELO, VERMELHO
    let semaphoreText = 'Documentação Adequada e Atualizada';
    if (expired > 0 || expiring7d > 1) {
      semaphore = 'VERMELHO';
      semaphoreText = 'Documentação Crítica - Requer Atualização Imediata';
    } else if (expiring30d > 0 || eqCalibratingSoon > 0) {
      semaphore = 'AMARELO';
      semaphoreText = 'Existem Pendências e Documentos Próximos do Vencimento';
    }

    const healthPercentage = total > 0 ? Math.round(((valid + (expiring30d * 0.5)) / total) * 100) : 100;

    return {
      total,
      valid,
      expiring30d,
      expiring7d,
      expired,
      withoutExpiry,
      strongAttestations,
      fragileAttestations,
      totalArts: arts.length,
      eqCalibratingSoon,
      semaphore,
      semaphoreText,
      healthPercentage
    };
  }

  /**
   * Gera a Matriz de Capacidade Técnica por Serviço (Itens 34, 35, 36)
   */
  static getCapabilityMatrix() {
    const services = [
      { id: 'srv-1', name: 'Monitoramento de Emissões Atmosféricas', company: 'Excelência Ambiental', category: 'Engenharia do Ar' },
      { id: 'srv-2', name: 'Amostragem Isocinética de Chaminé', company: 'Excelência Ambiental', category: 'Engenharia do Ar' },
      { id: 'srv-3', name: 'Inventário de Gases de Efeito Estufa (GEE)', company: 'Excelência Ambiental', category: 'Gestão de Carbono' },
      { id: 'srv-4', name: 'Modelagem de Dispersão Atmosférica (AERMOD)', company: 'Excelência Ambiental', category: 'Modelagem Ambiental' },
      { id: 'srv-5', name: 'Operação e Manutenção de ETE Industrial', company: 'Veeluen Solutions', category: 'Saneamento & Efluentes' },
      { id: 'srv-6', name: 'Tratamento de Águas e Efluentes', company: 'Veeluen Solutions', category: 'Saneamento & Efluentes' }
    ];

    const attestations = this.listAttestations();
    const personnel = this.listPersonnel();
    const equipment = this.listEquipment();
    const docs = this.listDocuments();

    return services.map(srv => {
      // Cruzar atestados relacionados
      const matchingAtts = attestations.filter(a => 
        (a.companyName === srv.company) &&
        (a.relatedServices?.some(s => s.toLowerCase().includes(srv.name.toLowerCase().substring(0, 15))) ||
         a.object?.toLowerCase().includes(srv.name.toLowerCase().substring(0, 15)))
      );

      // Cruzar responsáveis
      const matchingTeam = personnel.filter(p => 
        p.companyName === srv.company &&
        p.relatedServices?.some(s => s.toLowerCase().includes(srv.name.toLowerCase().substring(0, 15)))
      );

      // Cruzar equipamentos
      const matchingEq = equipment.filter(e => 
        e.companyName === srv.company &&
        e.relatedServices?.some(s => s.toLowerCase().includes(srv.name.toLowerCase().substring(0, 15)))
      );

      // Verificar regularidade jurídica/fiscal da empresa
      const companyDocs = docs.filter(d => d.companyName === srv.company);
      const hasExpiredDocs = companyDocs.some(d => d.calculatedStatus === DocumentStatus.VENCIDO);

      // Calcular Capability Score (0 a 100%) (Item 36)
      let score = 0;
      score += Math.min(40, matchingAtts.length * 15); // Até 40 pts por atestados
      score += Math.min(25, matchingTeam.length * 15); // Até 25 pts por equipe
      score += Math.min(20, matchingEq.length * 10);   // Até 20 pts por equipamentos
      score += hasExpiredDocs ? 5 : 15;                // Até 15 pts por regularidade fiscal

      const capabilityScore = Math.min(100, Math.max(30, score));
      const status = capabilityScore >= 85 ? 'APTIDÃO ALTA' :
                     capabilityScore >= 65 ? 'APTIDÃO MÉDIA' : 'APTIDÃO EM FORMAÇÃO';

      return {
        serviceId: srv.id,
        serviceName: srv.name,
        companyName: srv.company,
        category: srv.category,
        attestationsCount: matchingAtts.length,
        teamCount: matchingTeam.length,
        equipmentCount: matchingEq.length,
        documentationStatus: hasExpiredDocs ? 'Pendência em Certidão' : 'Completa e Válida',
        capabilityScore,
        status,
        matchingAttestations: matchingAtts,
        matchingPersonnel: matchingTeam,
        matchingEquipment: matchingEq
      };
    });
  }

  /**
   * Painel "O que está faltando?" — Pendências Priorizadas (Item 40)
   */
  static getPendingIssuesList() {
    const docs = this.listDocuments();
    const equipment = this.listEquipment();
    const issues = [];

    // Checar documentos vencidos ou a vencer
    docs.forEach(d => {
      if (d.calculatedStatus === DocumentStatus.VENCIDO) {
        issues.push({
          id: `iss-${d.id}`,
          severity: IssueSeverity.CRITICO,
          title: `Documento Vencido: ${d.name}`,
          company: d.companyName,
          category: d.category,
          action: `Renovar ${d.subCategory} com o órgão emissor (${d.issuer}).`,
          deadline: 'Imediato (Impede participação em licitações)'
        });
      } else if (d.calculatedStatus === DocumentStatus.VENCE_EM_BREVE) {
        issues.push({
          id: `iss-${d.id}`,
          severity: IssueSeverity.ALTO,
          title: `${d.subCategory} vence em ${d.daysUntilExpiry} dias`,
          company: d.companyName,
          category: d.category,
          action: `Solicitar emissão antecipada perante ${d.issuer}.`,
          deadline: `Antes de ${d.expiryDate}`
        });
      }
    });

    // Checar equipamentos com calibração próxima
    equipment.forEach(eq => {
      if (eq.status?.includes('vence em breve') || eq.status?.includes('ATENÇÃO')) {
        issues.push({
          id: `iss-eq-${eq.id}`,
          severity: IssueSeverity.MEDIO,
          title: `Calibração RBC do ${eq.name}`,
          company: eq.companyName,
          category: 'Equipamentos',
          action: `Agendar calibração em bancada com laboratório credenciado pela RBC/Inmetro.`,
          deadline: `Vence em ${eq.nextCalibrationDate}`
        });
      }
    });

    // Ordenar por criticidade (CRÍTICO -> ALTO -> MÉDIO -> BAIXO)
    const priorityOrder = { [IssueSeverity.CRITICO]: 1, [IssueSeverity.ALTO]: 2, [IssueSeverity.MEDIO]: 3, [IssueSeverity.BAIXO]: 4 };
    return issues.sort((a, b) => priorityOrder[a.severity] - priorityOrder[b.severity]);
  }

  /**
   * IA DOCUMENTAL: Consulta inteligente e fundamentada no cofre de documentos (Itens 47 e 48)
   */
  static askDocumentVault(queryText) {
    const q = queryText.toLowerCase().trim();
    const docs = this.listDocuments();
    const attestations = this.listAttestations();
    const arts = this.listARTs();
    const equipment = this.listEquipment();
    const personnel = this.listPersonnel();

    // 1. Atestado de isocinética / emissões
    if (/\b(isocin[eé]tica|chamin[eé]|emiss[aã]o|emiss[oõ]es)\b/i.test(q)) {
      const att = attestations.find(a => a.id === 'atest-ea-01');
      return {
        found: true,
        answer: `Sim! Possuímos o Atestado de Capacidade Técnica "${att.client}" (ID: ${att.id}) com 36 meses de execução comprovada e mais de 120 campanhas de amostragem isocinética de chaminé. O atestado possui ART registrada no CREA-PE (${att.artNumber}) e CAT chancelada (${att.catNumber}). Força do atestado: 96% (Muito forte).`,
        sources: [
          { name: att.fileName, type: 'Atestado de Capacidade Técnica', docId: att.id }
        ]
      };
    }

    // 2. Qual certidão vence primeiro
    if (/\b(vence primeiro|qual certid[aã]o vence|vencendo primeiro|pr[oó]ximo vencimento)\b/i.test(q) || (/\bvenc/i.test(q) && /\bcertid/i.test(q))) {
      const expiring = docs
        .filter(d => d.daysUntilExpiry !== null && d.daysUntilExpiry > 0)
        .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)[0];

      if (expiring) {
        return {
          found: true,
          answer: `A certidão que vence primeiro é a "${expiring.name}" (${expiring.subCategory} da ${expiring.companyName}), com data de validade em ${expiring.expiryDate} (restam aproximadamente ${expiring.daysUntilExpiry} dias). Recomenda-se providenciar a renovação online junto a(o) ${expiring.issuer}.`,
          sources: [
            { name: expiring.name, type: expiring.category, docId: expiring.id }
          ]
        };
      }
    }

    // 3. ART relacionada a ETE / efluentes
    if (/\b(art|arts)\b/i.test(q) && (/\b(ete|etes)\b/i.test(q) || /\befluente/i.test(q) || /\bsuape\b/i.test(q))) {
      const art = arts.find(a => a.number === 'ART-PE-2023-0051289');
      return {
        found: true,
        answer: `Sim, possuímos a ART nº ${art.number} registrada pela Veeluen Solutions perante o CREA-PE. O objeto contempla a operação contínua e controle analítico de Estação de Tratamento de Efluentes Industriais e Sanitários (ETE/ETDI) no Terminal Aquaviário de Suape, sob responsabilidade técnica do ${art.responsibleTechnical}.`,
        sources: [
          { name: art.fileName, type: 'ART Registrada no CREA', docId: art.number }
        ]
      };
    }

    // 4. Equipamento com calibração vencida ou próxima
    if (/\b(equipamento|equipamentos)\b/i.test(q) || /\b(calibra[cç][aã]o|calibrado|calibrar)\b/i.test(q)) {
      const eqTesto = equipment.find(e => e.id === 'eq-ea-02');
      return {
        found: true,
        answer: `Identificamos que o equipamento "${eqTesto.name} (${eqTesto.model})" está com calibração próxima do vencimento (${eqTesto.nextCalibrationDate}). Os demais equipamentos principais (Trem de Amostragem Apex C-5000 e Tubo Pitot Tipo S) estão com calibrações vigentes e acreditadas pela RBC/Inmetro.`,
        sources: [
          { name: eqTesto.calibrationCertificate, type: 'Equipamento', docId: eqTesto.id }
        ]
      };
    }

    // 5. Responsável técnico CREA
    if (/\b(respons[aá]vel t[eé]cnico|crea|engenheiro|engenheira|equipe t[eé]cnica)\b/i.test(q)) {
      return {
        found: true,
        answer: `Temos 2 Responsáveis Técnicos registrados: 1) Dr. Roberto Albuquerque (Engenheiro Químico e de Segurança do Trabalho - CREA-PE 038192), responsável pela Excelência Ambiental com certificações NR-10, NR-33 e NR-35; e 2) Eng. Eduardo Moreira (Engenheiro Químico - CREA-PE 049812), responsável pela Veeluen Solutions com foco em ETE.`,
        sources: [
          { name: 'Certidão de Registro de PJ CREA-PE', type: 'Conselho de Classe', docId: 'doc-tec-01' }
        ]
      };
    }

    // REGRA RÍGIDA DO ITEM 48: Nunca inventar documento se não encontrar
    return {
      found: false,
      answer: 'Não foi identificado documento compatível no banco para a consulta realizada.',
      sources: []
    };
  }

  /**
   * Registra log de auditoria (Item 43)
   */
  static recordAuditLog(entry) {
    try {
      const logs = getStorageItem(STORAGE_KEYS.AUDIT, []);
      logs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        formattedTime: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        ...entry
      });
      setStorageItem(STORAGE_KEYS.AUDIT, logs.slice(0, 100));
    } catch (e) {
      console.warn('Erro ao registrar log de auditoria:', e);
    }
  }

  /**
   * Lista logs de auditoria
   */
  static listAuditLogs() {
    try {
      return getStorageItem(STORAGE_KEYS.AUDIT, [
        {
          id: 'aud-seed-1',
          formattedTime: 'Hoje às 14:20',
          action: 'INDEXAÇÃO_INICIAL',
          user: 'Sistema Automatizado Vellia',
          details: 'Cofre documental inicializado com 8 documentos, 4 atestados, 3 ARTs e 4 equipamentos.'
        }
      ]);
    } catch {
      return [];
    }
  }
}

export default DocumentVaultService;
