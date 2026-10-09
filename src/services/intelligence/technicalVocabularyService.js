/**
 * VELLIA LICITAÇÕES — FASE 27: OTIMIZAÇÃO DA INTELIGÊNCIA DO AGENTE
 * technicalVocabularyService.js: Vocabulário técnico estruturado com pesos graduados,
 * regras negativas contextuais, matriz de termos e versionamento.
 * (Itens 6 a 12, 19 a 22, 109 a 111)
 */

export const TermWeight = {
  CRITICAL: 10,   // Termos altamente distintivos que definem o serviço
  HIGH: 7,        // Termos técnicos fortemente correlacionados
  MEDIUM: 4,      // Termos contextuais do segmento
  LOW: 1,         // Termos gerais de apoio
  NEGATIVE: -8    // Termos que desqualificam ou sinalizam incompatibilidade de escopo
};

export const TermWeightLabel = {
  10: 'CRITICAL',
  7: 'HIGH',
  4: 'MEDIUM',
  1: 'LOW',
  [-8]: 'NEGATIVE'
};

// Termos negativos transversais que desqualificam qualquer oportunidade para serviços de engenharia/ambiental
export const GLOBAL_NEGATIVE_TERMS = [
  { term: 'fornecimento de papel', weight: TermWeight.NEGATIVE, reason: 'Material de expediente / insumos de escritório' },
  { term: 'material de expediente', weight: TermWeight.NEGATIVE, reason: 'Insumos administrativos sem escopo técnico' },
  { term: 'servico de alimentacao', weight: TermWeight.NEGATIVE, reason: 'Buffet / alimentação / catering' },
  { term: 'coffee break', weight: TermWeight.NEGATIVE, reason: 'Serviço de copa / eventos' },
  { term: 'refeicoes coletivas', weight: TermWeight.NEGATIVE, reason: 'Alimentação hospitalar ou industrial' },
  { term: 'transporte escolar', weight: TermWeight.NEGATIVE, reason: 'Transporte de passageiros' },
  { term: 'locacao de veiculos leves', weight: TermWeight.NEGATIVE, reason: 'Locação automotiva sem operação técnica' },
  { term: 'vigilancia patrimonial', weight: TermWeight.NEGATIVE, reason: 'Segurança armada/desarmada de portaria' },
  { term: 'limpeza predial e conservacao', weight: TermWeight.NEGATIVE, reason: 'Asseio e conservação predial simples' },
  { term: 'uniformes profissionais', weight: TermWeight.NEGATIVE, reason: 'Vestuário / confecção têxtil' },
  { term: 'sacos para residuos domesticos', weight: TermWeight.NEGATIVE, reason: 'Material plástico descartável' },
  { term: 'sacos de lixo', weight: TermWeight.NEGATIVE, reason: 'Fornecimento de embalagens' },
  { term: 'copos descartaveis', weight: TermWeight.NEGATIVE, reason: 'Utensílios descartáveis' }
];

// Base canônica do vocabulário técnico por serviço (Versão 2026.10-fase27)
const BASE_TECHNICAL_VOCABULARY = [
  // --- QUALIDADE DO AR & EMISSÕES (Excelência Ambiental) ---
  {
    serviceId: 'ea-emissoes-atmosfericas',
    serviceName: 'Monitoramento de Emissões Atmosféricas',
    company: 'Excelência Ambiental',
    terms: [
      { term: 'amostragem isocinetica', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'fontes estacionarias', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'chamine industrial', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'chamines', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'efluentes gasosos', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'gases de combustao', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'duto de exaustao', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'material particulado em duto', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'amostragem em duto', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'conama 382', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'nbr 12019', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'nbr 12020', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'epa 5', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'nox', weight: TermWeight.MEDIUM, type: 'composto' },
      { term: 'sox', weight: TermWeight.MEDIUM, type: 'composto' },
      { term: 'co2', weight: TermWeight.MEDIUM, type: 'composto' },
      { term: 'medicao de emissoes', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'monitoramento ambiental', weight: TermWeight.LOW, type: 'contextual' },
      { term: 'meio ambiente', weight: TermWeight.LOW, type: 'contextual' },
      // Regras negativas específicas
      { term: 'aquisicao de analisador de gases', weight: TermWeight.NEGATIVE, type: 'negativo' },
      { term: 'fornecimento de pecas para chamine', weight: TermWeight.NEGATIVE, type: 'negativo' }
    ]
  },
  {
    serviceId: 'ea-aermod',
    serviceName: 'AERMOD (Modelagem Matemática)',
    company: 'Excelência Ambiental',
    terms: [
      { term: 'aermod', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'aermet', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'aermap', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'calpuff', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'modelagem de dispersao atmosferica', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'simulacao de pluma', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'rosa dos ventos', weight: TermWeight.MEDIUM, type: 'contextual' },
      { term: 'dados meteorologicos', weight: TermWeight.MEDIUM, type: 'contextual' },
      { term: 'modelo regulatorio epa', weight: TermWeight.MEDIUM, type: 'norma' }
    ]
  },
  {
    serviceId: 'ea-qualidade-ar',
    serviceName: 'Qualidade do Ar',
    company: 'Excelência Ambiental',
    terms: [
      { term: 'estacao de qualidade do ar', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'qualidade do ar ambiente', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'conama 491', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'pm10', weight: TermWeight.HIGH, type: 'composto' },
      { term: 'pm2.5', weight: TermWeight.HIGH, type: 'composto' },
      { term: 'pts', weight: TermWeight.HIGH, type: 'composto' },
      { term: 'particulas inalaveis', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'monitoramento do ar', weight: TermWeight.MEDIUM, type: 'contextual' },
      { term: 'aquisicao de medidor de qualidade do ar', weight: TermWeight.NEGATIVE, type: 'negativo' }
    ]
  },
  {
    serviceId: 'ea-inventario-emissoes',
    serviceName: 'Inventário de Emissões Atmosféricas & GEE',
    company: 'Excelência Ambiental',
    terms: [
      { term: 'inventario de emissoes', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'inventario de gee', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'ghg protocol', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'fatores de emissao ap-42', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'pegada de carbono', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'gases de efeito estufa', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'balanco de emissoes', weight: TermWeight.MEDIUM, type: 'contextual' }
    ]
  },

  // --- TRATAMENTO DE EFLUENTES & SANEAMENTO (Veeluen Solutions) ---
  {
    serviceId: 'vs-ete',
    serviceName: 'Operação e Manutenção de ETE',
    company: 'Veeluen Solutions',
    terms: [
      { term: 'operacao de ete', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'estacao de tratamento de esgoto', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'estacao de tratamento de efluentes', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'tratamento de esgoto sanitario', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'lodo ativado', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'lodos ativados', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'decantador secundario', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'reator anaerobio', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'uasb', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'conama 430', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'efluentes liquidos', weight: TermWeight.MEDIUM, type: 'contextual' },
      { term: 'desaguamento de lodo', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'cloracao', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'efluente sanitario', weight: TermWeight.MEDIUM, type: 'contextual' },
      { term: 'saneamento basico', weight: TermWeight.LOW, type: 'contextual' },
      // Regras negativas específicas
      { term: 'fornecimento de bombas submersiveis avulsas', weight: TermWeight.NEGATIVE, type: 'negativo' },
      { term: 'venda de cloro granulado', weight: TermWeight.NEGATIVE, type: 'negativo' }
    ]
  },
  {
    serviceId: 'vs-eta',
    serviceName: 'Operação de ETA',
    company: 'Veeluen Solutions',
    terms: [
      { term: 'operacao de eta', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'estacao de tratamento de agua', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'coagulacao e floculacao', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'filtracao rapida', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'agua para consumo humano', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'portaria gm/ms 888', weight: TermWeight.HIGH, type: 'norma' },
      { term: 'clarificacao de agua', weight: TermWeight.MEDIUM, type: 'contextual' },
      { term: 'agua potavel', weight: TermWeight.LOW, type: 'contextual' }
    ]
  },

  // --- ENGENHARIA MECÂNICA & NR-13 (Veeluen Solutions) ---
  {
    serviceId: 'vs-nr13',
    serviceName: 'NR-13 (Caldeiras e Vasos de Pressão)',
    company: 'Veeluen Solutions',
    terms: [
      { term: 'nr-13', weight: TermWeight.CRITICAL, type: 'norma' },
      { term: 'inspecao de caldeiras', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'inspecao de vasos de pressao', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'vasos de pressao', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'caldeira a vapor', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'caldeira flamotubular', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'caldeira aquotubular', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'teste hidrostatico', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'medicao de espessura por ultrassom', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'pmta', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'valvula de seguranca', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'tubulacoes sob pressao', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'reservatorio de ar comprimido', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'autoclave', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'laudo nr-13', weight: TermWeight.HIGH, type: 'técnico' },
      // Regras negativas específicas
      { term: 'fornecimento de juntas de vedacao', weight: TermWeight.NEGATIVE, type: 'negativo' },
      { term: 'venda de manometros', weight: TermWeight.NEGATIVE, type: 'negativo' }
    ]
  },

  // --- ELÉTRICA & SPDA (Veeluen Solutions) ---
  {
    serviceId: 'vs-spda',
    serviceName: 'SPDA & Aterramento (NBR 5419)',
    company: 'Veeluen Solutions',
    terms: [
      { term: 'spda', weight: TermWeight.CRITICAL, type: 'técnico' },
      { term: 'nbr 5419', weight: TermWeight.CRITICAL, type: 'norma' },
      { term: 'descargas atmosfericas', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'malha de aterramento', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'laudo de spda', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'medicao ohmica', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'resistencia de aterramento', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'para-raios', weight: TermWeight.MEDIUM, type: 'contextual' },
      { term: 'subsistema de captacao', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'eletrico industrial', weight: TermWeight.LOW, type: 'contextual' }
    ]
  },

  // --- MANUTENÇÃO ELETROMECÂNICA INDUSTRIAL (Veeluen Solutions) ---
  {
    serviceId: 'vs-manutencao-industrial',
    serviceName: 'Manutenção Industrial & Eletromecânica',
    company: 'Veeluen Solutions',
    terms: [
      { term: 'manutencao eletromecanica', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'manutencao industrial', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'parada de manutencao', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'caldeiraria e tubulacao', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'montagem mecanica', weight: TermWeight.HIGH, type: 'técnico' },
      { term: 'soldagem qualificada', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'alinhamento a laser', weight: TermWeight.MEDIUM, type: 'técnico' },
      { term: 'instrumentacao industrial', weight: TermWeight.MEDIUM, type: 'técnico' }
    ]
  }
];

export class TechnicalVocabularyService {
  constructor() {
    this.storageKey = 'vellia_technical_vocabulary_v27';
    this.version = '2026.10-fase27';
    this.initStore();
  }

  /**
   * Inicializa ou carrega vocabulário customizável do armazenamento
   */
  initStore() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.storageKey);
        if (!stored) {
          window.localStorage.setItem(this.storageKey, JSON.stringify(BASE_TECHNICAL_VOCABULARY));
        }
      }
    } catch {}
  }

  /**
   * Obtém versão ativa do vocabulário (Item 21)
   */
  getVersion() {
    return this.version;
  }

  /**
   * Retorna todo o catálogo de vocabulário ativo por serviço
   */
  getVocabulary() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(this.storageKey);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return BASE_TECHNICAL_VOCABULARY;
  }

  /**
   * Retorna lista de termos globais negativos
   */
  getGlobalNegativeTerms() {
    return GLOBAL_NEGATIVE_TERMS;
  }

  /**
   * Atualiza ou adiciona termo na matriz de um serviço (Item 19 e 20)
   */
  saveTerm(serviceId, termData) {
    const vocab = this.getVocabulary();
    const service = vocab.find(s => s.serviceId === serviceId);
    if (!service) return false;

    const termNormalized = termData.term.toLowerCase().trim();
    const existingIndex = service.terms.findIndex(t => t.term === termNormalized);

    const updatedTerm = {
      term: termNormalized,
      weight: Number(termData.weight) || TermWeight.MEDIUM,
      type: termData.type || 'técnico',
      enabled: termData.enabled !== false
    };

    if (existingIndex >= 0) {
      service.terms[existingIndex] = updatedTerm;
    } else {
      service.terms.push(updatedTerm);
    }

    this._saveToStore(vocab);
    return true;
  }

  /**
   * Remove termo de um serviço
   */
  removeTerm(serviceId, termString) {
    const vocab = this.getVocabulary();
    const service = vocab.find(s => s.serviceId === serviceId);
    if (!service) return false;

    service.terms = service.terms.filter(t => t.term !== termString.toLowerCase().trim());
    this._saveToStore(vocab);
    return true;
  }

  /**
   * Restaura vocabulário padrão de fábrica
   */
  resetToDefaults() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(BASE_TECHNICAL_VOCABULARY));
      }
    } catch {}
    return BASE_TECHNICAL_VOCABULARY;
  }

  _saveToStore(data) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    } catch {}
  }
}

export const technicalVocabularyService = new TechnicalVocabularyService();
