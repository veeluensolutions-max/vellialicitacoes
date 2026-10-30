/**
 * VELLIA LICITAÇÕES - OPPORTUNITY REPOSITORY (FASE 5)
 * Repositório com persistência em localStorage para o banco estruturado de oportunidades.
 */

import { analyzeOpportunityAdherence } from './semanticEngine.js';
import { TagService } from './tagService.js';
import { EventBus, VELLIA_EVENTS } from './eventBus.js';
import { cloudSyncService } from './cloud/cloudSyncService.js';
import { supabaseClient } from './cloud/supabaseClient.js';

const OPPORTUNITIES_STORAGE_KEY = 'vellia_opportunities_db_v2';

export class OpportunityRepository {
  constructor() {
    this.opportunities = this.init();
  }

  /**
   * Identifica se um item provém de sementes estáticas de demonstração/mock ou ruído sem aderência
   */
  static isDemoItem(item) {
    if (!item) return true;
    const demoNumbers = [
      '7004321234', '7004410101', '7004410102', '7004410103', '7004410104',
      '7004410105', '7004410106', '7004410107', '7004410108', '7004410109',
      '7004410110', '7004319802', '7004389012', '7004356789',
      '7004423190', '7004400123', '7004376543', '7004391234',
      '102/2026', '540/2026', '88/2026', '312/2026',
      '00045/2026', '00018/2026', '00102/2026'
    ];
    const id = String(item.id || '');
    const num = String(item.number || '');
    const title = String(item.title || '');
    const url = String(item.url || '');

    if (demoNumbers.some(d => id.includes(d) || num === d || num.includes(d))) return true;
    if (url.includes('petronect.com.br/portalpublico/70044')) return true;
    if (title.toLowerCase().includes('petrobras búzios') && title.toLowerCase().includes('margem')) return true;
    if (item.isDemo === true) return true;

    // Remove itens antigos de teste que não possuem relação com os serviços das 2 empresas
    const score = Number(item.score || item.adherenceScore || 0);
    if (score > 0 && score < 38) return true;

    return false;
  }

  init() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const stored = window.localStorage.getItem(OPPORTUNITIES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Expurgar itens que eram simulações/mockData para operar estritamente com dados reais
            const realOnly = parsed.filter(item => !OpportunityRepository.isDemoItem(item));
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

    // Em modo produção estrita: não injetar mais sementes mock. Iniciar limpo para dados reais das APIs
    return [];
  }

  /**
   * Expura quaisquer itens remanescentes de simulação/mock e notifica o sistema
   */
  purgeDemoData() {
    const before = this.opportunities.length;
    this.opportunities = this.opportunities.filter(item => !OpportunityRepository.isDemoItem(item));
    this.save(this.opportunities);
    EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, {
      count: this.opportunities.length,
      opportunities: this.opportunities
    });
    return before - this.opportunities.length;
  }

  save(data) {
    try {
      this.opportunities = data;
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(data));
      }
      // Emissão global para que todas as telas e dashboards reajam instantaneamente
      EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, {
        count: data.length,
        opportunities: data
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
    return [...this.opportunities];
  }

  getById(id) {
    return this.opportunities.find(o => o.id === id || o.number === id) || null;
  }

  add(opportunity, skipCloudPush = false) {
    this.opportunities.unshift(opportunity);
    this.save(this.opportunities);
    if (!skipCloudPush) {
      cloudSyncService.pushLocalOpportunity(opportunity).catch(() => {});
    }
    return opportunity;
  }

  update(id, updatedFields, skipCloudPush = false) {
    const index = this.opportunities.findIndex(o => o.id === id || o.number === id);
    if (index === -1) return null;

    const existing = this.opportunities[index];
    const nowIso = new Date().toISOString();

    const merged = {
      ...existing,
      ...updatedFields,
      lastUpdated: nowIso,
      history: [
        ...(existing.history || []),
        ...(updatedFields.historyEntry ? [updatedFields.historyEntry] : [])
      ]
    };

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
