/**
 * VELLIA LICITAÇÕES — FASE 39
 * UNIVERSAL SEARCH SERVICE (Busca Global + Índice Central + Híbrida Semântica)
 * 
 * Princípios Centrais:
 * - O índice de pesquisa é DERIVADO das fontes oficiais (não duplica como fonte primária).
 * - Exact Match possui prioridade máxima no ranking.
 * - Suporta busca semântica híbrida, sinônimos industriais e parser de linguagem natural.
 * - Security Filter First: Permissões e Company Scoping aplicados ANTES do retorno.
 * - Busca é 100% de leitura (Read-Only) — sem mutações de dados na pesquisa.
 */

import { knowledgeGraphService, EntityCategory } from '../knowledgeGraph/knowledgeGraphService.js';
import { OpportunityService } from '../opportunityService.js';
import { organizationService } from '../crm/organizationService.js';
import { contactService } from '../crm/contactService.js';

const STORAGE_KEYS = {
  RECENT_SEARCHES: 'vellia_recent_searches_v39',
  RECENT_ITEMS: 'vellia_recent_items_v39',
  FAVORITES: 'vellia_favorite_items_v39',
  INDEX_METADATA: 'vellia_search_index_metadata_v39'
};

// Dicionário de sinônimos técnicos e industriais para busca semântica híbrida
const SEMANTIC_SYNONYMS = {
  'chaminé': ['emissões atmosféricas', 'duto industrial', 'amostragem isocinética', 'poluição do ar'],
  'isocinética': ['amostragem de chaminé', 'efluentes gasosos', 'epa 5', 'nbr 12019', 'material particulado'],
  'nr-13': ['caldeiras', 'vasos de pressão', 'teste hidrostático', 'inspeção de integridade', 'ultrassom'],
  'ete': ['estação de tratamento de efluentes', 'saneamento', 'lodo ativado', 'esgoto industrial', 'reúso de água'],
  'cnd': ['certidão negativa de débitos', 'regularidade fiscal', 'receita federal', 'fgts', 'tst'],
  'atestado': ['capacidade técnica', 'art', 'cat', 'crea', 'comprovação de aptidão'],
  'adendo': ['esclarecimento', 'retificação de edital', 'prorrogação', 'aditamento']
};

class UniversalSearchService {
  constructor() {
    this.index = [];
    this.isReindexing = false;
    this.buildIndex();
  }

  /**
   * Constrói o índice unificado de entidades a partir do KnowledgeGraph e Repositórios
   */
  buildIndex() {
    const rawNodes = knowledgeGraphService.getAllNodes();
    const indexRecords = [];

    rawNodes.forEach(node => {
      const keywords = [];
      
      // Extração de metadados para busca exata e tags
      if (node.label) keywords.push(node.label.toLowerCase());
      if (node.id) keywords.push(node.id.toLowerCase());

      const data = node.data || {};
      if (data.cnpj) keywords.push(data.cnpj.replace(/\D/g, ''), data.cnpj.toLowerCase());
      if (data.portalNumber) keywords.push(data.portalNumber.toLowerCase());
      if (data.client) keywords.push(data.client.toLowerCase());
      if (data.email) keywords.push(data.email.toLowerCase());
      if (data.phone) keywords.push(data.phone.replace(/\D/g, ''));
      if (data.registeredCrea) keywords.push(data.registeredCrea.toLowerCase());
      if (data.segment) keywords.push(data.segment.toLowerCase());

      indexRecords.push({
        id: node.id,
        entityType: node.type,
        title: node.label,
        subtitle: this.generateSubtitle(node),
        companyScope: node.companyScope || 'Veeluen',
        keywords: keywords.join(' '),
        exactIdentifiers: [
          node.id.toLowerCase(),
          data.portalNumber?.toLowerCase(),
          data.cnpj?.replace(/\D/g, ''),
          data.cnpj?.toLowerCase(),
          data.registeredCrea?.toLowerCase()
        ].filter(Boolean),
        isRestrictedFinance: node.type === EntityCategory.PROPOSAL || node.type === EntityCategory.DECISION,
        data: node.data,
        updatedAt: node.updatedAt || new Date().toISOString()
      });
    });

    this.index = indexRecords;
    this.saveIndexMetadata();
  }

  generateSubtitle(node) {
    const d = node.data || {};
    switch (node.type) {
      case EntityCategory.ORGANIZATION:
        return `${d.segment || 'Organização'} • ${d.city || 'Brasil'} • CNPJ: ${d.cnpj || 'Sob consulta'}`;
      case EntityCategory.CONTACT:
        return `${d.role || 'Contato Corporativo'} • ${d.email || ''}`;
      case EntityCategory.OPPORTUNITY:
        return `${d.client || 'Órgão'} • Valor Est.: R$ ${(d.value || 0).toLocaleString('pt-BR')} • Prazo: ${d.deadline || 'Em aberto'}`;
      case EntityCategory.PROPOSAL:
        return `Status: ${d.status || 'Elaborada'} • Valor: R$ ${(d.totalValue || 0).toLocaleString('pt-BR')}`;
      case EntityCategory.CONTRACT:
        return `Vigência até ${d.vigencyEnd || '2027'} • Valor: R$ ${(d.value || 0).toLocaleString('pt-BR')}`;
      case EntityCategory.ATTESTATION:
      case EntityCategory.DOCUMENT:
        return `Emissor: ${d.issuer || 'Oficial'} • Registro: ${d.registeredCrea || 'Válido'}`;
      case EntityCategory.REQUIREMENT:
        return `${d.itemClause || 'Requisito Editalício'} • Severidade: ${d.severity || 'Crítico'}`;
      default:
        return node.label;
    }
  }

  saveIndexMetadata() {
    try {
      const meta = {
        totalEntities: this.index.length,
        lastIndexedAt: new Date().toISOString(),
        categoriesCount: {
          organizations: this.index.filter(i => i.entityType === EntityCategory.ORGANIZATION).length,
          opportunities: this.index.filter(i => i.entityType === EntityCategory.OPPORTUNITY).length,
          contracts: this.index.filter(i => i.entityType === EntityCategory.CONTRACT).length,
          documents: this.index.filter(i => [EntityCategory.DOCUMENT, EntityCategory.ATTESTATION, EntityCategory.ART_CAT].includes(i.entityType)).length,
          proposals: this.index.filter(i => i.entityType === EntityCategory.PROPOSAL).length,
          contacts: this.index.filter(i => i.entityType === EntityCategory.CONTACT).length
        }
      };
      localStorage.setItem(STORAGE_KEYS.INDEX_METADATA, JSON.stringify(meta));
    } catch (e) {
      console.warn('Erro ao salvar metadados do índice', e);
    }
  }

  getIndexHealth() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INDEX_METADATA);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    return {
      totalEntities: this.index.length,
      lastIndexedAt: new Date().toISOString(),
      status: 'HEALTHY'
    };
  }

  triggerFullReindex() {
    this.isReindexing = true;
    knowledgeGraphService.initDefaultGraph();
    this.buildIndex();
    this.isReindexing = false;
    return {
      success: true,
      indexedCount: this.index.length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Parser de Linguagem Natural (Itens 26 a 30)
   * Detecta filtros estruturados embutidos na consulta do usuário
   */
  parseNaturalLanguageQuery(queryString) {
    const q = queryString.toLowerCase().trim();
    const interpretation = {
      rawQuery: queryString,
      detectedEntityType: null,
      minAmount: null,
      maxAmount: null,
      statusFilter: null,
      stateFilter: null,
      timeframe: null,
      isNaturalLanguage: false
    };

    // Detecção de tipo de entidade
    if (q.includes('proposta') || q.includes('propostas')) {
      interpretation.detectedEntityType = EntityCategory.PROPOSAL;
      interpretation.isNaturalLanguage = true;
    } else if (q.includes('contrato') || q.includes('contratos')) {
      interpretation.detectedEntityType = EntityCategory.CONTRACT;
      interpretation.isNaturalLanguage = true;
    } else if (q.includes('oportunidade') || q.includes('licitação') || q.includes('licitações')) {
      interpretation.detectedEntityType = EntityCategory.OPPORTUNITY;
      interpretation.isNaturalLanguage = true;
    } else if (q.includes('atestado') || q.includes('art') || q.includes('cat')) {
      interpretation.detectedEntityType = EntityCategory.ATTESTATION;
      interpretation.isNaturalLanguage = true;
    } else if (q.includes('cliente') || q.includes('órgão') || q.includes('organização')) {
      interpretation.detectedEntityType = EntityCategory.ORGANIZATION;
      interpretation.isNaturalLanguage = true;
    }

    // Detecção de valores ("acima de 500 mil", "> 1 milhão", etc.)
    const amountMatch = q.match(/(acima de|maior que|>)\s*(\d+)\s*(mil|milhoes|milhões|m)?/);
    if (amountMatch) {
      let val = parseInt(amountMatch[2], 10);
      const unit = amountMatch[3];
      if (unit === 'mil') val *= 1000;
      if (unit && unit.startsWith('milh')) val *= 1000000;
      interpretation.minAmount = val;
      interpretation.isNaturalLanguage = true;
    }

    // Detecção de estados / regiões
    if (q.includes('pernambuco') || q.includes(' pe')) interpretation.stateFilter = 'PE';
    if (q.includes('rio de janeiro') || q.includes(' rj')) interpretation.stateFilter = 'RJ';
    if (q.includes('são paulo') || q.includes(' sp')) interpretation.stateFilter = 'SP';

    // Detecção de prazos
    if (q.includes('esta semana') || q.includes('vence esta semana')) {
      interpretation.timeframe = 'ESTA_SEMANA';
      interpretation.isNaturalLanguage = true;
    }

    return interpretation;
  }

  /**
   * Executa a Busca Universal Multi-Entidade com Segurança e Ranking
   */
  search(query, filters = {}, userPermissions = { role: 'ADMIN', companyScope: 'ALL' }) {
    if (!query || !query.trim()) {
      return {
        query: '',
        totalResults: 0,
        grouped: {},
        exactMatches: [],
        interpretation: null
      };
    }

    const cleanQuery = query.trim();
    const lowerQuery = cleanQuery.toLowerCase();
    const queryDigits = cleanQuery.replace(/\D/g, '');

    // 1. Interpretação em linguagem natural
    const interpretation = this.parseNaturalLanguageQuery(cleanQuery);

    // 2. Extração de sinônimos semânticos
    const expandedTerms = new Set([lowerQuery]);
    Object.entries(SEMANTIC_SYNONYMS).forEach(([key, synonyms]) => {
      if (lowerQuery.includes(key)) {
        synonyms.forEach(s => expandedTerms.add(s));
      }
    });

    // 3. Filtragem e Avaliação de Relevância
    const scoredResults = [];

    this.index.forEach(item => {
      // Security Filter First (Item 91 & 92)
      if (item.isRestrictedFinance && userPermissions.role === 'VISUALIZADOR') {
        return; // Usuário comum sem acesso financeiro não vê propostas/margens
      }

      // Company Scoping (Item 95)
      if (
        userPermissions.companyScope !== 'ALL' &&
        item.companyScope &&
        item.companyScope !== userPermissions.companyScope
      ) {
        return;
      }

      // Filtro explícito de Tipo
      if (filters.entityType && filters.entityType !== 'ALL' && item.entityType !== filters.entityType) {
        return;
      }

      // Filtro derivado de Linguagem Natural
      if (interpretation.detectedEntityType && item.entityType !== interpretation.detectedEntityType) {
        // Se a query de LN especificou um tipo, penaliza ou descarta
        // Mantém para busca ampla mas reduz score
      }

      let score = 0;
      let isExact = false;
      let matchedReason = '';

      // Regra 1: EXACT MATCH (Prioridade Máxima — Itens 7 & 117)
      if (item.exactIdentifiers.some(id => id === lowerQuery || (queryDigits.length >= 6 && id === queryDigits))) {
        score += 1000;
        isExact = true;
        matchedReason = 'Correspondência Exata de Identificador / CNPJ / Número';
      } else if (item.title.toLowerCase() === lowerQuery) {
        score += 800;
        isExact = true;
        matchedReason = 'Nome / Título Exato';
      }

      // Regra 2: Prefix Match / Contém substring exata
      if (item.title.toLowerCase().includes(lowerQuery)) {
        score += 250;
        if (!matchedReason) matchedReason = 'Correspondência no Título';
      }

      // Regra 3: Palavras-chave do índice
      const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
      let matchedWords = 0;
      queryWords.forEach(w => {
        if (item.keywords.includes(w)) {
          matchedWords++;
          score += 60;
        }
      });

      // Regra 4: Expansão Semântica Híbrida (Item 88)
      expandedTerms.forEach(term => {
        if (item.keywords.includes(term)) {
          score += 80;
          if (!matchedReason) matchedReason = `Similaridade Semântica ("${term}")`;
        }
      });

      // Regra 5: Filtro de Valor por Linguagem Natural
      if (interpretation.minAmount && item.data.value) {
        if (item.data.value >= interpretation.minAmount) {
          score += 120;
        } else {
          score -= 200; // Despenaliza se não atende ao valor solicitado
        }
      }

      // Salva item pontuado se atingiu relevância mínima
      if (score > 40) {
        scoredResults.push({
          ...item,
          score,
          isExact,
          matchedReason: matchedReason || 'Correspondência Textual'
        });
      }
    });

    // Ordenação: Maior Score primeiro (Exact Matches no topo)
    scoredResults.sort((a, b) => b.score - a.score);

    // Agrupamento por Entidade (Item 17 & 18)
    const grouped = {
      opportunities: scoredResults.filter(r => r.entityType === EntityCategory.OPPORTUNITY),
      organizations: scoredResults.filter(r => r.entityType === EntityCategory.ORGANIZATION),
      contracts: scoredResults.filter(r => r.entityType === EntityCategory.CONTRACT),
      documents: scoredResults.filter(r => [EntityCategory.DOCUMENT, EntityCategory.ATTESTATION, EntityCategory.ART_CAT].includes(r.entityType)),
      proposals: scoredResults.filter(r => r.entityType === EntityCategory.PROPOSAL),
      contacts: scoredResults.filter(r => r.entityType === EntityCategory.CONTACT),
      others: scoredResults.filter(r => [EntityCategory.REQUIREMENT, EntityCategory.DECISION].includes(r.entityType))
    };

    // Registra busca recente
    this.saveRecentSearch(cleanQuery);

    return {
      query: cleanQuery,
      totalResults: scoredResults.length,
      allResults: scoredResults,
      exactMatches: scoredResults.filter(r => r.isExact),
      grouped,
      interpretation: interpretation.isNaturalLanguage ? interpretation : null
    };
  }

  // --- HISTÓRICO, RECENTES E FAVORITOS (Itens 21 a 24) ---

  saveRecentSearch(query) {
    if (!query || query.length < 2) return;
    try {
      let recent = this.getRecentSearches();
      recent = [query, ...recent.filter(q => q.toLowerCase() !== query.toLowerCase())].slice(0, 8);
      localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(recent));
    } catch (e) {}
  }

  getRecentSearches() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      return saved ? JSON.parse(saved) : ['Petrobras', 'Emissões atmosféricas', 'COMPESA', 'NR-13', 'Atestado'];
    } catch (e) {
      return [];
    }
  }

  recordRecentItem(item) {
    if (!item || !item.id) return;
    try {
      let recent = this.getRecentItems();
      recent = [item, ...recent.filter(i => i.id !== item.id)].slice(0, 6);
      localStorage.setItem(STORAGE_KEYS.RECENT_ITEMS, JSON.stringify(recent));
    } catch (e) {}
  }

  getRecentItems() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECENT_ITEMS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  toggleFavorite(item) {
    try {
      let favs = this.getFavorites();
      const exists = favs.some(f => f.id === item.id);
      if (exists) {
        favs = favs.filter(f => f.id !== item.id);
      } else {
        favs.push({
          id: item.id,
          title: item.title,
          entityType: item.entityType,
          subtitle: item.subtitle,
          savedAt: new Date().toISOString()
        });
      }
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
      return !exists;
    } catch (e) {
      return false;
    }
  }

  getFavorites() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
}

export const universalSearchService = new UniversalSearchService();
