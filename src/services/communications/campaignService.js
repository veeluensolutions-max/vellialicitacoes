/**
 * VELLIA LICITAÇÕES — FASE 18
 * campaignService.js
 * Campanhas Assistidas por Segmento e Serviço, com Limites Anti-Spam e Aprovação em Lote.
 */

const STORAGE_KEY_CAMPAIGNS = 'vellia_assisted_campaigns_v18';

export const INITIAL_CAMPAIGNS = [
  {
    id: 'CMP-2026-ETE-PE',
    name: 'Campanha Assistida: Apresentação ETE e Saneamento Industrial — Pernambuco',
    service: 'Tratamento de Efluentes e Operação de ETE',
    targetRegion: 'Pernambuco',
    company: 'Excelência Ambiental',
    dailyLimit: 10,
    totalAudienceCount: 4,
    status: 'ATIVA',
    contactsList: [
      { contactId: 'CTC-PETRO-001', name: 'Eng. Marcelo Cavalcanti', org: 'Petrobras RNEST', status: 'APROVADA', messageDraft: 'Apresentação Institucional de ETE' },
      { contactId: 'CTC-SUAPE-001', name: 'Dr. Leonardo Gusmão', org: 'Porto de Suape', status: 'ENVIADA', messageDraft: 'Apresentação Técnica e MTR Digital' },
      { contactId: 'CTC-COMP-001', name: 'Eng. Fernando Bezerra', org: 'COMPESA', status: 'AGUARDANDO_REVISAO', messageDraft: 'Apresentação de Capacidade em Elevatórias' },
      { contactId: 'CTC-UFPE-002', name: 'Bárbara Lins', org: 'UFPE', status: 'AGUARDANDO_REVISAO', messageDraft: 'Apresentação de Gestão Hídrica' }
    ],
    createdAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'CMP-2026-NR13-NE',
    name: 'Campanha Assistida: Inspeção de Vasos de Pressão e Caldeiras NR-13',
    service: 'Inspeção e Conformidade NR-13',
    targetRegion: 'Nordeste',
    company: 'Veeluen Solutions',
    dailyLimit: 8,
    totalAudienceCount: 3,
    status: 'PLANEJADA',
    contactsList: [
      { contactId: 'CTC-PETRO-003', name: 'Carlos Eduardo Ramos', org: 'Petrobras RNEST', status: 'RASCUNHO', messageDraft: 'Catálogo de Ensaios Ultrassom NR-13' },
      { contactId: 'CTC-COMP-001', name: 'Eng. Fernando Bezerra', org: 'COMPESA', status: 'RASCUNHO', messageDraft: 'Memórias de Cálculo e Laudos Digitais' }
    ],
    createdAt: '2026-10-01T14:00:00Z'
  }
];

class CampaignService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[CampaignService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[CampaignService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_CAMPAIGNS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_CAMPAIGNS, INITIAL_CAMPAIGNS);
    }
  }

  getAllCampaigns() {
    return this._safeGetStorage(STORAGE_KEY_CAMPAIGNS) || INITIAL_CAMPAIGNS;
  }

  getCampaignById(id) {
    const all = this.getAllCampaigns();
    return all.find(c => c.id === id) || null;
  }

  /**
   * Aprovação em lote das mensagens da campanha (Item 65)
   */
  batchApproveCampaignMessages(campaignId) {
    const all = this.getAllCampaigns();
    const target = all.find(c => c.id === campaignId);
    if (target) {
      let approvedCount = 0;
      target.contactsList = target.contactsList.map(item => {
        if (item.status === 'AGUARDANDO_REVISAO' || item.status === 'RASCUNHO') {
          approvedCount++;
          return { ...item, status: 'APROVADA', approvedAt: new Date().toISOString() };
        }
        return item;
      });

      this._safeSetStorage(STORAGE_KEY_CAMPAIGNS, all);
      return { success: true, approvedCount };
    }
    return { success: false, approvedCount: 0 };
  }

  addCampaign(data = {}) {
    const all = this.getAllCampaigns();
    const newCamp = {
      id: data.id || `CMP-${Date.now()}`,
      name: data.name || 'Nova Campanha Assistida',
      service: data.service || 'Serviços de Engenharia',
      targetRegion: data.targetRegion || 'Pernambuco',
      company: data.company || 'Excelência Ambiental',
      dailyLimit: Number(data.dailyLimit) || 10,
      totalAudienceCount: data.contactsList ? data.contactsList.length : 0,
      status: data.status || 'PLANEJADA',
      contactsList: data.contactsList || [],
      createdAt: new Date().toISOString()
    };

    all.push(newCamp);
    this._safeSetStorage(STORAGE_KEY_CAMPAIGNS, all);
    return newCamp;
  }
}

export const campaignService = new CampaignService();
