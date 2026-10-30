/**
 * VELLIA LICITAÇÕES - SOURCE REPOSITORY (PORTAIS CONECTADOS & PREFEITURAS)
 * Gerencia os portais nacionais, estatais, plataformas municipais e sites de prefeituras conectados ao Vellia.
 */

import { EventBus } from './eventBus.js';

const SOURCES_STORAGE_KEY = 'vellia_sources_db_v2';

export const DEFAULT_CONNECTED_PORTALS = [
  {
    id: 'source-pncp',
    name: 'PNCP — Portal Nacional de Contratações Públicas',
    shortName: 'PNCP',
    category: 'NACIONAL',
    type: 'API Oficial Nacional (Federal, Estadual e Municipal)',
    status: 'Conectado',
    baseUrl: 'https://pncp.gov.br/app/editais',
    uf: 'BR',
    city: 'Nacional (27 UFs)',
    esfera: 'ALL',
    searchFilter: '',
    lastSync: 'Sincronizado em tempo real',
    lastSuccess: new Date().toISOString(),
    isActive: true,
    isCore: true,
    description: 'Base centralizadora obrigatória da Nova Lei de Licitações (Lei 14.133/2021) para União, Estados e Prefeituras.'
  },
  {
    id: 'source-comprasgov',
    name: 'Compras.gov.br (Comprasnet)',
    shortName: 'Compras.gov.br',
    category: 'FEDERAL',
    type: 'Portal de Compras do Governo Federal e Municípios Aderentes',
    status: 'Conectado',
    baseUrl: 'https://www.gov.br/compras/pt-br',
    uf: 'BR',
    city: 'Nacional',
    esfera: 'F',
    searchFilter: 'comprasnet',
    lastSync: 'Sincronizado em tempo real',
    lastSuccess: new Date().toISOString(),
    isActive: true,
    isCore: true,
    description: 'Pregões eletrônicos e dispensas eletrônicas de órgãos federais, forças armadas, universidades e prefeituras conveniadas.'
  },
  {
    id: 'source-petronect',
    name: 'Petronect (Petrobras & Transpetro)',
    shortName: 'Petronect',
    category: 'ESTATAL',
    type: 'Portal Corporativo Estatal (Grupo Petrobras)',
    status: 'Conectado',
    baseUrl: 'https://www.petronect.com.br/portalpublico',
    uf: 'BR',
    city: 'Refinarias, Terminais e Unidades Operacionais',
    esfera: 'E',
    searchFilter: 'Petrobras',
    lastSync: 'Sincronizado em tempo real',
    lastSuccess: new Date().toISOString(),
    isActive: true,
    isCore: true,
    description: 'Licitações eletrônicas (Lei 13.303) da Petrobras, Transpetro e subsidiárias para engenharia, NR-13, ETE e meio ambiente.'
  },
  {
    id: 'source-prefeituras-br',
    name: 'Rede Nacional de Prefeituras & SAAEs (Municípios)',
    shortName: 'Prefeituras / Municipal',
    category: 'PREFEITURA',
    type: 'Portais de Prefeituras, Secretarias Municipais e Autarquias (SAAE/SANEAR)',
    status: 'Conectado',
    baseUrl: 'https://pncp.gov.br/app/editais',
    uf: 'BR',
    city: 'Todos os Municípios Brasileiros',
    esfera: 'M',
    searchFilter: 'MUNICIPIO',
    lastSync: 'Sincronizado em tempo real',
    lastSuccess: new Date().toISOString(),
    isActive: true,
    isCore: true,
    description: 'Captura editais de serviços publicados por Prefeituras Municipais e Serviços Autônomos de Água e Esgoto (SAAE) em todo o Brasil.'
  },
  {
    id: 'source-portal-compras-publicas',
    name: 'Portal de Compras Públicas (Rede de Prefeituras)',
    shortName: 'Portal de Compras Públicas',
    category: 'PLATAFORMA_MUNICIPAL',
    type: 'Plataforma de Licitações Municipais (+2.500 Prefeituras)',
    status: 'Conectado',
    baseUrl: 'https://www.portaldecompraspublicas.com.br',
    uf: 'BR',
    city: 'Municípios Conveniados',
    esfera: 'M',
    searchFilter: 'portaldecompraspublicas',
    lastSync: 'Sincronizado em tempo real',
    lastSuccess: new Date().toISOString(),
    isActive: true,
    isCore: false,
    description: 'Plataforma utilizada por milhares de prefeituras brasileiras para pregões eletrônicos de engenharia, saneamento e meio ambiente.'
  },
  {
    id: 'source-bll-licitanet',
    name: 'BLL Compras / Licitanet / BNC (Portais Municipais)',
    shortName: 'BLL / Licitanet / BNC',
    category: 'PLATAFORMA_MUNICIPAL',
    type: 'Bolsas de Licitações Municipais e Estaduais',
    status: 'Conectado',
    baseUrl: 'https://bll.org.br',
    uf: 'BR',
    city: 'Municípios Conveniados',
    esfera: 'M',
    searchFilter: 'bll',
    lastSync: 'Sincronizado em tempo real',
    lastSuccess: new Date().toISOString(),
    isActive: true,
    isCore: false,
    description: 'Conector para editais de prefeituras operados via BLL Compras, Licitanet e Bolsa Nacional de Compras (BNC).'
  }
];

export const QUICK_PREFEITURA_SUGGESTIONS = [
  {
    name: 'Prefeitura Municipal de Ipojuca - PE',
    shortName: 'Prefeitura de Ipojuca - PE',
    category: 'PREFEITURA',
    type: 'Portal de Licitações Municipal (Polo Suape / PE)',
    baseUrl: 'https://www.ipojuca.pe.gov.br',
    uf: 'PE',
    city: 'Ipojuca',
    esfera: 'M',
    searchFilter: 'Ipojuca',
    description: 'Monitoramento de editais de engenharia, saneamento e meio ambiente do município de Ipojuca - PE.'
  },
  {
    name: 'Prefeitura do Recife - PE (Portal de Licitações)',
    shortName: 'Prefeitura do Recife - PE',
    category: 'PREFEITURA',
    type: 'Portal de Compras e Licitações do Recife',
    baseUrl: 'https://recife.pe.gov.br',
    uf: 'PE',
    city: 'Recife',
    esfera: 'M',
    searchFilter: 'Recife',
    description: 'Monitoramento de licitações da Prefeitura do Recife, EMLURB e autarquias municipais.'
  },
  {
    name: 'Prefeitura Municipal de Camaçari - BA',
    shortName: 'Prefeitura de Camaçari - BA',
    category: 'PREFEITURA',
    type: 'Portal de Compras Municipal (Polo Industrial Camaçari)',
    baseUrl: 'https://www.camacari.ba.gov.br',
    uf: 'BA',
    city: 'Camaçari',
    esfera: 'M',
    searchFilter: 'Camacari',
    description: 'Monitoramento de editais municipais no Polo Industrial de Camaçari - BA.'
  },
  {
    name: 'Prefeitura Municipal de Macaé - RJ',
    shortName: 'Prefeitura de Macaé - RJ',
    category: 'PREFEITURA',
    type: 'Portal de Licitações Municipal (Polo Offshore)',
    baseUrl: 'https://www.macae.rj.gov.br',
    uf: 'RJ',
    city: 'Macaé',
    esfera: 'M',
    searchFilter: 'Macae',
    description: 'Editais de serviços de engenharia, ETE e monitoramento ambiental em Macaé - RJ.'
  },
  {
    name: 'Licitações-e (Banco do Brasil — Prefeituras & Estados)',
    shortName: 'Licitações-e (BB)',
    category: 'PLATAFORMA_MUNICIPAL',
    type: 'Sistema Eletrônico de Licitações do Banco do Brasil',
    baseUrl: 'https://www.licitacoes-e.com.br',
    uf: 'BR',
    city: 'Nacional (Prefeituras e Governos Estaduais)',
    esfera: 'ALL',
    searchFilter: 'licitacoes-e',
    description: 'Editais de prefeituras, companhias estaduais de saneamento e órgãos públicos que operam pelo Licitações-e.'
  }
];

export class SourceRepository {
  constructor() {
    this.sources = this.init();
  }

  init() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(SOURCES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar fontes:', e);
    }

    this.save(DEFAULT_CONNECTED_PORTALS);
    return [...DEFAULT_CONNECTED_PORTALS];
  }

  save(data) {
    try {
      this.sources = data;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(SOURCES_STORAGE_KEY, JSON.stringify(data));
      }
      EventBus.emit('vellia-sources-updated', { sources: this.sources });
    } catch (e) {
      console.warn('Erro ao salvar fontes:', e);
    }
  }

  getAll() {
    return [...this.sources];
  }

  getActive() {
    return this.sources.filter(s => s.isActive !== false);
  }

  getById(id) {
    return this.sources.find(s => s.id === id || s.name.toLowerCase() === String(id).toLowerCase()) || null;
  }

  addSource(newPortal) {
    const id = newPortal.id || `source-custom-${Date.now()}`;
    const entry = {
      id,
      name: (newPortal.name || 'Novo Portal Municipal').trim(),
      shortName: (newPortal.shortName || newPortal.name || 'Prefeitura').trim(),
      category: newPortal.category || 'PREFEITURA',
      type: newPortal.type || 'Portal de Licitações de Prefeitura Municipal',
      status: 'Conectado',
      baseUrl: (newPortal.baseUrl || 'https://pncp.gov.br/app/editais').trim(),
      uf: (newPortal.uf || 'BR').toUpperCase(),
      city: (newPortal.city || 'Município').trim(),
      cnpj: (newPortal.cnpj || '').replace(/\D/g, ''),
      esfera: newPortal.esfera || 'M',
      searchFilter: (newPortal.searchFilter || newPortal.city || newPortal.name || '').trim(),
      lastSync: 'Conectado agora',
      lastSuccess: new Date().toISOString(),
      isActive: true,
      isCore: false,
      description: newPortal.description || `Integração direta para busca de editais de serviços em ${newPortal.city || newPortal.name}.`
    };

    this.sources.push(entry);
    this.save(this.sources);
    return entry;
  }

  update(id, updatedFields) {
    const idx = this.sources.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.sources[idx] = { ...this.sources[idx], ...updatedFields };
    this.save(this.sources);
    return this.sources[idx];
  }

  toggleActive(id) {
    const idx = this.sources.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const nextActive = !this.sources[idx].isActive;
    this.sources[idx] = {
      ...this.sources[idx],
      isActive: nextActive,
      status: nextActive ? 'Conectado' : 'Pausado'
    };
    this.save(this.sources);
    return this.sources[idx];
  }

  removeSource(id) {
    const target = this.getById(id);
    if (!target || target.isCore) return false;
    this.sources = this.sources.filter(s => s.id !== id);
    this.save(this.sources);
    return true;
  }
}

export const sourceRepository = new SourceRepository();
