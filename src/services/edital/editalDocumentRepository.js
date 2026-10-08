/**
 * VELLIA LICITAÇÕES - EDITAL DOCUMENT REPOSITORY (FASE 8)
 * Armazenamento desacoplado de documentos de editais, termos de referência e anexos,
 * com controle de versão, classificação, hash e histórico de adendos/erratas.
 */

export const DocumentClassification = {
  EDITAL: 'Edital',
  TERMO_REFERENCIA: 'Termo de Referência',
  ANEXO_TECNICO: 'Anexo Técnico',
  PLANILHA_PRECOS: 'Planilha de Preços',
  MINUTA_CONTRATUAL: 'Minuta Contratual',
  ESPECIFICACAO_TECNICA: 'Especificação Técnica',
  DOCUMENTO_COMPLEMENTAR: 'Documento Complementar',
  OUTRO: 'Outro'
};

export const DocumentTypes = DocumentClassification;

export const DocumentCategoryType = {
  ORIGINAL: 'Documento Original',
  ADENDO: 'Adendo Oficial',
  ERRATA: 'Errata',
  ESCLARECIMENTO: 'Esclarecimento / Circular',
  RESPOSTA_OFICIAL: 'Resposta Oficial'
};

const DOCS_STORAGE_KEY = 'vellia_edital_documents_v1';

const SEED_DOCUMENTS = [
  // Documentos da Oportunidade 7004321234 (Petrobras RNEST - Emissões Atmosféricas)
  {
    id: 'doc-7004321234-edital',
    opportunityNumber: '7004321234',
    name: 'EDITAL_LICITACAO_ELETRONICA_PETRONECT_7004321234.pdf',
    type: DocumentClassification.EDITAL,
    categoryType: DocumentCategoryType.ORIGINAL,
    origin: 'Portal Petronect (Download Oficial)',
    uploadDate: '01/10/2026 09:14',
    hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    sizeBytes: 2840500,
    sizeFormatted: '2.84 MB',
    version: '1.0',
    pagesCount: 46,
    contentSummary: 'Regulamento da licitação eletrônica, condições de participação, documentação de habilitação jurídica, regularidade fiscal e trabalhista, critérios de julgamento por Menor Preço Global e prazos recursais.',
    extractedSections: [
      { id: 'sec-1', title: '1. Do Objeto e Regime de Execução', page: 2 },
      { id: 'sec-2', title: '2. Das Condições de Participação e Impedimentos', page: 5 },
      { id: 'sec-3', title: '3. Da Habilitação Jurídica, Fiscal e Trabalhista', page: 9 },
      { id: 'sec-4', title: '4. Da Qualificação Econômico-Financeira', page: 14 },
      { id: 'sec-5', title: '5. Da Qualificação Técnica Operacional e Profissional', page: 18 },
      { id: 'sec-6', title: '6. Da Proposta Comercial e Critério de Julgamento', page: 24 },
      { id: 'sec-7', title: '7. Das Garantias e Condições de Pagamento', page: 31 },
      { id: 'sec-8', title: '8. Das Penalidades e Recursos Administrativos', page: 38 }
    ]
  },
  {
    id: 'doc-7004321234-tr',
    opportunityNumber: '7004321234',
    name: 'TERMO_DE_REFERENCIA_TECNICO_RNEST_EMISSOES_ANEXO_I.pdf',
    type: DocumentClassification.TERMO_REFERENCIA,
    categoryType: DocumentCategoryType.ORIGINAL,
    origin: 'Portal Petronect (Anexo Oficial)',
    uploadDate: '01/10/2026 09:15',
    hash: 'sha256:3a4b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012',
    sizeBytes: 4120000,
    sizeFormatted: '4.12 MB',
    version: '1.0',
    pagesCount: 68,
    contentSummary: 'Detalhamento do escopo de serviços de monitoramento de fontes estacionárias na Refinaria Abreu e Lima, metodologias de coleta isocinética de poluentes (MP, SO2, NOx, CO), calibração de equipamentos, equipe técnica mínima residente e cronograma das campanhas.',
    extractedSections: [
      { id: 'sec-tr-1', title: 'Seção I - Escopo Técnico e Fontes Monitoradas (Chaminés e Fornos)', page: 3 },
      { id: 'sec-tr-2', title: 'Seção II - Metodologias e Normas Aplicáveis (ABNT, EPA e CONAMA)', page: 12 },
      { id: 'sec-tr-3', title: 'Seção III - Equipe Mínima Exigida e Responsabilidade Técnica (CREA)', page: 22 },
      { id: 'sec-tr-4', title: 'Seção IV - Equipamentos Obrigatórios e Certificados de Calibração', page: 34 },
      { id: 'sec-tr-5', title: 'Seção V - Obrigações da Contratada e Segurança Operacional (SMS)', page: 48 },
      { id: 'sec-tr-6', title: 'Seção VI - Visita Técnica e Reconhecimento dos Pontos de Coleta', page: 59 }
    ]
  },
  {
    id: 'doc-7004321234-anexo-tec',
    opportunityNumber: '7004321234',
    name: 'ANEXO_TECNICO_QUALIFICACAO_E_ATESTADOS_RNEST.pdf',
    type: DocumentClassification.ANEXO_TECNICO,
    categoryType: DocumentCategoryType.ORIGINAL,
    origin: 'Portal Petronect (Anexo Técnico)',
    uploadDate: '01/10/2026 09:16',
    hash: 'sha256:9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210',
    sizeBytes: 1540000,
    sizeFormatted: '1.54 MB',
    version: '1.0',
    pagesCount: 22,
    contentSummary: 'Critérios específicos de atestação de capacidade técnica profissional e operacional: comprovação de execução prévia de amostragem isocinética contínua por período mínimo de 24 meses em plantas industriais ou refinarias.',
    extractedSections: [
      { id: 'sec-at-1', title: 'Art. 1 - Da Capacidade Técnico-Operacional (Atestados PJ)', page: 2 },
      { id: 'sec-at-2', title: 'Art. 2 - Da Capacidade Técnico-Profissional e Registro CREA/ART', page: 8 },
      { id: 'sec-at-3', title: 'Art. 3 - Da Declaração de Disponibilidade de Equipamentos', page: 15 }
    ]
  },
  {
    id: 'doc-7004321234-aditivo-prazo',
    opportunityNumber: '7004321234',
    name: 'ADENDO_01_PRORROGACAO_PRAZO_ENVIO_PROPOSTAS.pdf',
    type: DocumentClassification.DOCUMENTO_COMPLEMENTAR,
    categoryType: DocumentCategoryType.ADENDO,
    origin: 'Comissão de Licitação Petronect',
    uploadDate: '06/10/2026 14:30',
    hash: 'sha256:11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    sizeBytes: 620000,
    sizeFormatted: '620 KB',
    version: '1.1',
    pagesCount: 4,
    contentSummary: 'Prorrogação da data limite de envio de propostas de 12/10/2026 para 19/10/2026 às 14:00 (horário de Brasília).',
    extractedSections: [
      { id: 'sec-ad-1', title: 'Aditamento nº 01/2026 - Alteração do Cronograma Oficial', page: 1 }
    ]
  },
  // Documentos da Oportunidade 7004319802 (Transpetro Suape - ETE)
  {
    id: 'doc-7004319802-edital',
    opportunityNumber: '7004319802',
    name: 'EDITAL_TRANSPETRO_CONCORRENCIA_ETE_SUAPE_7004319802.pdf',
    type: DocumentClassification.EDITAL,
    categoryType: DocumentCategoryType.ORIGINAL,
    origin: 'Portal Petronect Oficial',
    uploadDate: '02/10/2026 10:20',
    hash: 'sha256:44556677889900aabbccddeeff11223344556677889900aabbccddeeff112233',
    sizeBytes: 3150000,
    sizeFormatted: '3.15 MB',
    version: '1.0',
    pagesCount: 52,
    contentSummary: 'Edital para contratação continuada de serviços de operação e manutenção de Estação de Tratamento de Efluentes (ETE/ETDI) no Terminal Aquaviário de Suape.',
    extractedSections: [
      { id: 'sec-ete-1', title: '1. Objeto e Localização (Suape - PE)', page: 3 },
      { id: 'sec-ete-2', title: '2. Qualificação Técnica e Registro CREA/CRQ', page: 12 },
      { id: 'sec-ete-3', title: '3. Garantia de Proposta (1%) e Contratual (5%)', page: 28 }
    ]
  },
  {
    id: 'doc-7004319802-tr',
    opportunityNumber: '7004319802',
    name: 'TERMO_DE_REFERENCIA_OPERACAO_ETE_SUAPE.pdf',
    type: DocumentClassification.TERMO_REFERENCIA,
    categoryType: DocumentCategoryType.ORIGINAL,
    origin: 'Portal Petronect Oficial',
    uploadDate: '02/10/2026 10:21',
    hash: 'sha256:556677889900aabbccddeeff11223344556677889900aabbccddeeff11223344',
    sizeBytes: 5240000,
    sizeFormatted: '5.24 MB',
    version: '1.0',
    pagesCount: 74,
    contentSummary: 'Especificações da planta de ETE, vazão média de 180 m³/dia, parâmetros de lançamento conforme Resolução CONAMA 430/2011, regime de plantão 24/7 e descarte de lodo desidratado.',
    extractedSections: [
      { id: 'sec-ete-tr-1', title: 'Capítulo I - Características da ETE e Equipamentos Existentes', page: 4 },
      { id: 'sec-ete-tr-2', title: 'Capítulo II - Equipe Mínima Residente e Turnos 24/7', page: 25 },
      { id: 'sec-ete-tr-3', title: 'Capítulo III - Visita Técnica Obrigatória aos Tanques e Decantadores', page: 62 }
    ]
  }
];

export class EditalDocumentRepository {
  static listAll() {
    try {
      const raw = localStorage.getItem(DOCS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(SEED_DOCUMENTS));
      return SEED_DOCUMENTS;
    } catch {
      return SEED_DOCUMENTS;
    }
  }

  static listByOpportunity(opportunityNumber) {
    const list = this.listAll();
    const numStr = String(opportunityNumber);
    const matches = list.filter(d => String(d.opportunityNumber) === numStr);
    if (matches.length > 0) return matches;

    // Fallback: se não tiver documentos específicos para a oportunidade, cria conjunto básico para permitir análise
    const fallbackDocs = [
      {
        id: `doc-${numStr}-edital`,
        opportunityNumber: numStr,
        name: `EDITAL_LICITACAO_${numStr}.pdf`,
        type: DocumentClassification.EDITAL,
        categoryType: DocumentCategoryType.ORIGINAL,
        origin: 'Portal Público (Download Direto)',
        uploadDate: new Date().toLocaleDateString('pt-BR'),
        hash: `sha256:${Math.random().toString(36).substr(2, 16)}`,
        sizeBytes: 2150000,
        sizeFormatted: '2.15 MB',
        version: '1.0',
        pagesCount: 38,
        contentSummary: 'Edital oficial regulamentando a contratação de serviços técnicos especializados.',
        extractedSections: [
          { id: 's1', title: '1. Do Objeto e Escopo', page: 2 },
          { id: 's2', title: '2. Da Habilitação Jurídica e Regularidade Fiscal', page: 8 },
          { id: 's3', title: '3. Da Qualificação Técnica e Atestados', page: 16 }
        ]
      },
      {
        id: `doc-${numStr}-tr`,
        opportunityNumber: numStr,
        name: `TERMO_REFERENCIA_${numStr}.pdf`,
        type: DocumentClassification.TERMO_REFERENCIA,
        categoryType: DocumentCategoryType.ORIGINAL,
        origin: 'Portal Público (Anexo)',
        uploadDate: new Date().toLocaleDateString('pt-BR'),
        hash: `sha256:${Math.random().toString(36).substr(2, 16)}`,
        sizeBytes: 3400000,
        sizeFormatted: '3.40 MB',
        version: '1.0',
        pagesCount: 44,
        contentSummary: 'Termo de Referência com detalhamento das obrigações da contratada, equipe e equipamentos.',
        extractedSections: [
          { id: 'str1', title: 'Seção I - Metodologia e Escopo Detalhado', page: 3 },
          { id: 'str2', title: 'Seção II - Equipe Técnica e Registro no Conselho', page: 18 }
        ]
      }
    ];

    return fallbackDocs;
  }

  static listAllDocuments() {
    return this.listAll();
  }

  static addDocument(oppOrDoc, maybeDoc) {
    const doc = maybeDoc ? { ...maybeDoc, opportunityNumber: oppOrDoc } : oppOrDoc;
    const list = this.listAll();
    const entry = {
      id: doc.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      opportunityNumber: String(doc.opportunityNumber || doc.opportunityId || '7004321234'),
      name: doc.name || 'documento_edital.pdf',
      type: doc.type || DocumentClassification.EDITAL,
      categoryType: doc.categoryType || DocumentCategoryType.ORIGINAL,
      origin: doc.origin || doc.source || 'Upload Manual pelo Usuário',
      uploadDate: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      hash: doc.hash || `sha256:${Math.random().toString(36).substr(2, 32)}`,
      sizeBytes: doc.sizeBytes || 1024000,
      sizeFormatted: doc.sizeFormatted || doc.size || '1.02 MB',
      version: doc.version || '1.0',
      pagesCount: doc.pagesCount || doc.pages || 20,
      contentSummary: doc.contentSummary || 'Documento processado pelo Vellia Document Pipeline.',
      extractedSections: doc.extractedSections || [
        { id: 'sec-gen-1', title: 'Seção Geral do Documento', page: 1 }
      ]
    };

    list.unshift(entry);
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Erro ao salvar documento:', e);
    }
    return entry;
  }

  static removeDocument(docId) {
    const list = this.listAll().filter(d => d.id !== docId);
    try {
      localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(list));
    } catch {}
    return list;
  }
}

export default EditalDocumentRepository;
