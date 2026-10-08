/**
 * VELLIA LICITAÇÕES — FASE 16
 * buyingPatternService.js
 * Análise de perfis de compra, padrões temporais, recorrência e histórico de contratações por órgão.
 */

const STORAGE_KEY_BUYING_PATTERNS = 'vellia_buying_patterns_v16';

export const INITIAL_BUYING_PATTERNS = [
  {
    organId: 'PETROBRAS',
    organName: 'Petrobras — Petróleo Brasileiro S/A',
    organShort: 'Petrobras',
    state: 'RJ/PE/SP',
    totalTendersObserved: 28,
    totalVolumeObserved: 84500000.00,
    topServices: [
      { service: 'Tratamento de Efluentes e Operação de ETE', count: 7, averageValue: 3200000.00 },
      { service: 'Monitoramento de Emissões Atmosféricas', count: 5, averageValue: 1200000.00 },
      { service: 'Inspeção e Conformidade NR-13', count: 6, averageValue: 980000.00 },
      { service: 'Gestão e Destinação de Resíduos Perigosos', count: 4, averageValue: 2400000.00 }
    ],
    preferredModalities: ['Licitação Lei 13.303 (Petronect)', 'Dispensa Eletrônica'],
    commonContractMonths: [3, 4, 10, 11], // Março, Abril, Outubro, Novembro
    seasonalAnalysis: 'Concentração histórica de publicações no 4º trimestre (fechamento orçamentário anual de Capex/Opex) e início do 2º trimestre.',
    recurrenceInsight: 'Serviço de Operação de ETE e NR-13 com recorrência cíclica identificada a cada 24-36 meses por refinaria/unidade.',
    winningSuppliersHistory: [
      { supplier: 'HidroEco Saneamento Industrial Ltda.', contractsCount: 3, totalWon: 9800000.00, lastWonYear: 2023 },
      { supplier: 'Vellia Soluções em Engenharia', contractsCount: 2, totalWon: 4100000.00, lastWonYear: 2025 },
      { supplier: 'VellTech Caldeiraria e Inspeções', contractsCount: 2, totalWon: 1950000.00, lastWonYear: 2024 },
      { supplier: 'BioClean Engenharia', contractsCount: 1, totalWon: 850000.00, lastWonYear: 2023 }
    ],
    internalWinRate: 40.0, // 2 vitórias em 5 disputas participadas
    hasSufficientHistory: true
  },
  {
    organId: 'UFPE',
    organName: 'Universidade Federal de Pernambuco (UFPE)',
    organShort: 'UFPE',
    state: 'PE',
    totalTendersObserved: 14,
    totalVolumeObserved: 6800000.00,
    topServices: [
      { service: 'Monitoramento de Emissões Atmosféricas', count: 4, averageValue: 460000.00 },
      { service: 'Manutenção Preventiva de Laboratórios', count: 3, averageValue: 310000.00 },
      { service: 'Gestão de Resíduos Químicos', count: 3, averageValue: 520000.00 }
    ],
    preferredModalities: ['Pregão Eletrônico (Compras.gov.br / PNCP)'],
    commonContractMonths: [10, 11, 12],
    seasonalAnalysis: 'Concentração histórica marcante no 4º trimestre (novembro/dezembro) para empenho de dotações orçamentárias do MEC.',
    recurrenceInsight: 'Contratação de monitoramento de emissões com recorrência anual contínua identificada (2023, 2024, 2025, 2026).',
    winningSuppliersHistory: [
      { supplier: 'ArLimpo Engenharia Ambiental Eireli', contractsCount: 3, totalWon: 1350000.00, lastWonYear: 2024 },
      { supplier: 'Vellia Soluções em Engenharia', contractsCount: 1, totalWon: 480000.00, lastWonYear: 2025 }
    ],
    internalWinRate: 33.3,
    hasSufficientHistory: true
  },
  {
    organId: 'COMPESA',
    organName: 'Companhia Pernambucana de Saneamento (COMPESA)',
    organShort: 'COMPESA',
    state: 'PE',
    totalTendersObserved: 9,
    totalVolumeObserved: 12400000.00,
    topServices: [
      { service: 'Inspeção e Conformidade NR-13', count: 3, averageValue: 850000.00 },
      { service: 'Operação de Estações Elevatórias e ETE', count: 2, averageValue: 2900000.00 }
    ],
    preferredModalities: ['Pregão Eletrônico (PE Integrado / PNCP)'],
    commonContractMonths: [5, 6, 11],
    seasonalAnalysis: 'Distribuição semestral regular (meio de ano e final de exercício fiscal estadual).',
    recurrenceInsight: 'Inspeções regulatórias NR-13 renovadas bienalmente por exigência das normas de segurança do trabalho.',
    winningSuppliersHistory: [
      { supplier: 'VellTech Caldeiraria e Inspeções', contractsCount: 2, totalWon: 1750000.00, lastWonYear: 2022 },
      { supplier: 'SaneAqua Engenharia', contractsCount: 1, totalWon: 2900000.00, lastWonYear: 2024 }
    ],
    internalWinRate: 50.0,
    hasSufficientHistory: true
  },
  {
    organId: 'SUAPE',
    organName: 'Complexo Industrial Portuário de Suape',
    organShort: 'Porto de Suape',
    state: 'PE',
    totalTendersObserved: 8,
    totalVolumeObserved: 9800000.00,
    topServices: [
      { service: 'Gestão e Destinação de Resíduos Perigosos', count: 3, averageValue: 1600000.00 },
      { service: 'Monitoramento de Qualidade da Água Costeira', count: 2, averageValue: 1100000.00 }
    ],
    preferredModalities: ['Pregão Eletrônico (PNCP)'],
    commonContractMonths: [11, 12],
    seasonalAnalysis: 'Concentração acentuada entre novembro e dezembro.',
    recurrenceInsight: 'Gestão de resíduos e monitoramento ambiental com renovação ou licitação periódica a cada 24 meses.',
    winningSuppliersHistory: [
      { supplier: 'EcoDestino Soluções Ambientais S/A', contractsCount: 2, totalWon: 3200000.00, lastWonYear: 2023 }
    ],
    internalWinRate: 0.0,
    hasSufficientHistory: true
  },
  {
    organId: 'NOVO_ORGAO_ISOLADO',
    organName: 'Prefeitura Municipal de Ilha de Itamaracá',
    organShort: 'Pref. Itamaracá',
    state: 'PE',
    totalTendersObserved: 1,
    totalVolumeObserved: 110000.00,
    topServices: [
      { service: 'Limpeza de Canais', count: 1, averageValue: 110000.00 }
    ],
    preferredModalities: ['Dispensa'],
    commonContractMonths: [7],
    seasonalAnalysis: 'Histórico insuficiente para identificar padrão temporal consistente.',
    recurrenceInsight: 'Histórico insuficiente para identificar padrão de recorrência.',
    winningSuppliersHistory: [],
    internalWinRate: 0.0,
    hasSufficientHistory: false // Item 15 & 48: Poucos dados -> não inferir
  }
];

class BuyingPatternService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[BuyingPatternService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[BuyingPatternService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_BUYING_PATTERNS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_BUYING_PATTERNS, INITIAL_BUYING_PATTERNS);
    }
  }

  /**
   * Retorna todos os perfis de compra
   */
  getAllPatterns() {
    return this._safeGetStorage(STORAGE_KEY_BUYING_PATTERNS) || INITIAL_BUYING_PATTERNS;
  }

  /**
   * Busca perfil de contratação por nome ou identificador do órgão
   */
  getPatternByOrgan(organQuery) {
    if (!organQuery) return null;
    const all = this.getAllPatterns();
    const query = organQuery.toLowerCase().trim();
    return all.find(p => 
      p.organId.toLowerCase() === query ||
      p.organName.toLowerCase().includes(query) ||
      p.organShort.toLowerCase().includes(query)
    ) || null;
  }

  /**
   * Avalia a recorrência histórica de um serviço em um determinado órgão (Item 13, 14, 15)
   */
  analyzeServiceRecurrence(organName, serviceName) {
    const pattern = this.getPatternByOrgan(organName);
    if (!pattern || !pattern.hasSufficientHistory) {
      return {
        hasRecurrence: false,
        recurrenceCount: 0,
        insight: 'Histórico insuficiente para identificar padrão de recorrência.',
        evidenceLevel: 'Baixa evidência'
      };
    }

    const srvLower = (serviceName || '').toLowerCase();
    const match = pattern.topServices.find(s => s.service.toLowerCase().includes(srvLower) || srvLower.includes(s.service.toLowerCase()));

    if (!match || match.count < 2) {
      return {
        hasRecurrence: false,
        recurrenceCount: match ? match.count : 0,
        insight: 'Histórico insuficiente para identificar padrão de recorrência.',
        evidenceLevel: 'Baixa evidência'
      };
    }

    return {
      hasRecurrence: true,
      recurrenceCount: match.count,
      averageHistoricalValue: match.averageValue,
      insight: `Serviço com recorrência histórica comprovada (${match.count} contratações mapeadas no órgão).`,
      evidenceLevel: match.count >= 4 ? 'Alta evidência' : 'Média evidência'
    };
  }

  /**
   * Analisa padrão de sazonalidade e trimestre de publicação (Item 16)
   */
  analyzeTemporalSeasonality(organName) {
    const pattern = this.getPatternByOrgan(organName);
    if (!pattern || !pattern.hasSufficientHistory) {
      return {
        hasPattern: false,
        text: 'Histórico insuficiente para identificar padrão temporal de publicações.',
        isQ4Concentration: false
      };
    }

    const months = pattern.commonContractMonths || [];
    const q4Months = months.filter(m => m >= 10 && m <= 12).length;
    const isQ4 = q4Months >= 2;

    return {
      hasPattern: true,
      text: pattern.seasonalAnalysis,
      isQ4Concentration: isQ4,
      commonMonths: months
    };
  }
}

export const buyingPatternService = new BuyingPatternService();
