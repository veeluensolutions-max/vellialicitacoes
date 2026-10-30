/**
 * VELLIA LICITAÇÕES - OPPORTUNITY REPOSITORY
 * Repositório com persistência em localStorage para o banco estruturado de oportunidades reais.
 * Calcula dias restantes dinamicamente em relação à data real de hoje e bloqueia dados fictícios/expirados.
 */

import { EventBus, VELLIA_EVENTS } from './eventBus.js';
import { cloudSyncService } from './cloud/cloudSyncService.js';
import { supabaseClient } from './cloud/supabaseClient.js';

const OPPORTUNITIES_STORAGE_KEY = 'vellia_opportunities_db_v3_real';
const LEGACY_STORAGE_KEYS = ['vellia_opportunities_db_v1', 'vellia_opportunities_db_v2'];

export class OpportunityRepository {
  constructor() {
    this.opportunities = this.init();
  }

  /**
   * Formata uma data ISO ou string para DD/MM/YYYY
   */
  static formatBrDate(dateStr) {
    if (!dateStr) return '';
    const s = String(dateStr).trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    }
    try {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    } catch {}
    return s;
  }

  /**
   * Calcula os dias restantes reais entre hoje (meia-noite local) e a data de encerramento
   * Retorna número negativo caso o edital já esteja vencido/encerrado.
   */
  static computeRealDaysLeft(endDateStr) {
    if (!endDateStr) return null;
    try {
      const s = String(endDateStr).trim();
      let targetDate = null;

      const brMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
      const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);

      if (brMatch) {
        targetDate = new Date(Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1]));
      } else if (isoMatch) {
        targetDate = new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
      } else {
        targetDate = new Date(s);
      }

      if (!targetDate || isNaN(targetDate.getTime())) return null;

      targetDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = targetDate.getTime() - today.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  }

  /**
   * Normaliza campos de data, serviço e recalcula daysLeft em tempo real
   */
  static normalizeItem(item) {
    if (!item) return item;
    const endDate = OpportunityRepository.formatBrDate(item.endDate || item.data_encerramento || '');
    const publishDate = OpportunityRepository.formatBrDate(item.publishDate || item.data_publicacao || '');
    const realDays = OpportunityRepository.computeRealDaysLeft(endDate);

    return {
      ...item,
      endDate: endDate || item.endDate,
      publishDate: publishDate || item.publishDate,
      daysLeft: realDays !== null ? Math.max(0, realDays) : 0,
      primaryService: item.primaryService || item.identifiedService || ''
    };
  }

  /**
   * Identifica se um item provém de sementes estáticas de demonstração/mock, duplicata legada ou edital já vencido
   */
  static isDemoItem(item) {
    if (!item) return true;
    const demoNumbers = [
      '7004321234', '7004319802', '7004318765', '7004315420', '7004312109', '7004309871',
      '7004390011', '7004390012', '7004390013', '7004390014', '7004390015',
      '7004390016', '7004390017', '7004390018', '7004390019', '7004390020',
      '7004410101', '7004410102', '7004410103', '7004410104', '7004410105',
      '7004410106', '7004410107', '7004410108', '7004410109', '7004410110',
      '7004389012', '7004356789', '7004423190', '7004400123', '7004376543', '7004391234',
      '102/2026', '540/2026', '88/2026', '312/2026',
      '00045/2026', '00018/2026', '00102/2026'
    ];
    const id = String(item.id || '');
    const num = String(item.number || '');
    const title = String(item.title || '');
    const url = String(item.url || '');

    if (demoNumbers.some(d => id.includes(d) || num === d || num.includes(d))) return true;
    if (/^7004[34]\d{5}$/.test(id) || /^7004[34]\d{5}$/.test(num)) return true;
    if (id.startsWith('CGOV-')) return true; // Evita duplicatas legadas do ComprasGov (já normalizadas como REAL-*)
    if (url.includes('petronect.com.br/portalpublico/70044')) return true;
    if (url.includes('petronect.com/portal')) return true;
    if (title.toLowerCase().includes('petrobras búzios') && title.toLowerCase().includes('margem')) return true;
    if (item.isDemo === true) return true;

    // Expurga editais cujo prazo de encerramento já passou em relação à data real de hoje
    const realDays = OpportunityRepository.computeRealDaysLeft(item.endDate || item.data_encerramento);
    if (realDays !== null && realDays < 0) return true;

    // Remove itens sem aderência mínima aos serviços das 2 empresas
    const score = Number(item.score || item.adherenceScore || 0);
    if (score > 0 && score < 38) return true;

    return false;
  }

  init() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        // Remove imediatamente chaves antigas que podiam conter mocks em cache no navegador
        for (const oldKey of LEGACY_STORAGE_KEYS) {
          try {
            window.localStorage.removeItem(oldKey);
          } catch {}
        }

        const stored = window.localStorage.getItem(OPPORTUNITIES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const realOnly = parsed
              .filter(item => !OpportunityRepository.isDemoItem(item))
              .map(item => OpportunityRepository.normalizeItem(item));

            if (realOnly.length !== parsed.length) {
              try {
                window.localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(realOnly));
              } catch {}
            }
            return realOnly;
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar do localStorage:', e);
    }

    return [];
  }

  /**
   * Expurga quaisquer itens remanescentes de simulação/mock ou vencidos e recalcula prazos reais
   */
  purgeDemoData() {
    if (typeof window !== 'undefined' && window.localStorage) {
      for (const oldKey of LEGACY_STORAGE_KEYS) {
        try {
          window.localStorage.removeItem(oldKey);
        } catch {}
      }
    }
    const before = this.opportunities.length;
    this.opportunities = this.opportunities
      .filter(item => !OpportunityRepository.isDemoItem(item))
      .map(item => OpportunityRepository.normalizeItem(item));
    this.save(this.opportunities);
    EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, {
      count: this.opportunities.length,
      opportunities: this.opportunities
    });
    return before - this.opportunities.length;
  }

  save(data) {
    try {
      const normalized = (Array.isArray(data) ? data : [])
        .filter(item => !OpportunityRepository.isDemoItem(item))
        .map(item => OpportunityRepository.normalizeItem(item));

      this.opportunities = normalized;
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(normalized));
      }
      EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, {
        count: normalized.length,
        opportunities: normalized
      });
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  }

  clear() {
    this.opportunities = [];
    this.save([]);
    return true;
  }

  replaceAll(newItems) {
    this.opportunities = Array.isArray(newItems) ? [...newItems] : [];
    this.save(this.opportunities);
    return this.opportunities;
  }

  getAll() {
    // Sempre garante que daysLeft reflita a data real do momento da leitura
    return this.opportunities
      .filter(item => !OpportunityRepository.isDemoItem(item))
      .map(item => OpportunityRepository.normalizeItem(item));
  }

  getById(id) {
    const found = this.opportunities.find(o => o.id === id || o.number === id);
    return found ? OpportunityRepository.normalizeItem(found) : null;
  }

  add(opportunity, skipCloudPush = false) {
    if (OpportunityRepository.isDemoItem(opportunity)) return null;
    const normalized = OpportunityRepository.normalizeItem(opportunity);
    this.opportunities.unshift(normalized);
    this.save(this.opportunities);
    if (!skipCloudPush) {
      cloudSyncService.pushLocalOpportunity(normalized).catch(() => {});
    }
    return normalized;
  }

  update(id, updatedFields, skipCloudPush = false) {
    const index = this.opportunities.findIndex(o => o.id === id || o.number === id);
    if (index === -1) return null;

    const existing = this.opportunities[index];
    const nowIso = new Date().toISOString();

    const merged = OpportunityRepository.normalizeItem({
      ...existing,
      ...updatedFields,
      lastUpdated: nowIso,
      history: [
        ...(existing.history || []),
        ...(updatedFields.historyEntry ? [updatedFields.historyEntry] : [])
      ]
    });

    delete merged.historyEntry;
    this.opportunities[index] = merged;
    this.save(this.opportunities);
    if (!skipCloudPush) {
      cloudSyncService.pushLocalOpportunity(merged).catch(() => {});
    }
    return merged;
  }

  remove(id) {
    this.opportunities = this.opportunities.filter(o => o.id !== id && o.number !== id);
    this.save(this.opportunities);
    supabaseClient.deleteOpportunity(id).catch(() => {});
    return true;
  }
}

export const opportunityRepository = new OpportunityRepository();
