/**
 * VELLIA LICITAÇÕES — FASE 17
 * organizationService.js
 * Gerenciamento de Organizações, Perfil 360°, Deduplicação Inteligente e Integração com o Radar.
 */

import {
  OrganizationType,
  StrategicClassification,
  calculateRelationshipOpportunityScore,
  calculateRelationshipStrength
} from './crmModels.js';

const STORAGE_KEY_ORGS = 'vellia_crm_organizations_v17';

export const INITIAL_ORGANIZATIONS = [
  {
    id: 'ORG-PETROBRAS-RNEST',
    name: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    corporateName: 'Petróleo Brasileiro S/A — RNEST',
    cnpj: '33.000.167/0842-88',
    type: OrganizationType.EMPRESA_PUBLICA,
    segment: 'Óleo e Gás / Refino',
    city: 'Ipojuca',
    state: 'PE',
    region: 'Nordeste',
    website: 'https://petrobras.com.br',
    phone: '(81) 3512-8000',
    email: 'contato.rnest@petrobras.com.br',
    description: 'Refinaria de grande porte em Ipojuca/PE com constantes demandas em SMS, O&M de ETEs industriais e testes de integridade NR-13.',
    notes: 'Conta corporativa nuclear da Vellia. Contrato da operadora incumbente HidroEco vence em 38 dias.',
    status: 'ATIVO',
    strategicClassification: StrategicClassification.ESTRATEGICO,
    accountOwner: 'Roberto Mendes (Diretor Comercial)',
    coOwners: ['Camila Torres (Engenheira)', 'Lucas Andrade (Técnico)'],
    tags: ['Petrobras', 'Estratégico', 'ETE', 'NR-13', 'Pernambuco'],
    isFavorite: true,
    historicalVolume: 84500000.00,
    hasRecurrence: true,
    leadSource: 'Petronect',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-10-08T10:00:00Z'
  },
  {
    id: 'ORG-UFPE',
    name: 'Universidade Federal de Pernambuco (UFPE)',
    corporateName: 'Universidade Federal de Pernambuco',
    cnpj: '24.134.488/0001-08',
    type: OrganizationType.UNIVERSIDADE,
    segment: 'Educação Superior e Pesquisa Federal',
    city: 'Recife',
    state: 'PE',
    region: 'Nordeste',
    website: 'https://www.ufpe.br',
    phone: '(81) 2126-8000',
    email: 'progest@ufpe.br',
    description: 'Universidade pública federal com campus em Recife, Vitória e Caruaru. Demanda contínua de monitoramento ambiental e gestão laboratorial.',
    notes: 'Concentração de contratações no 4º trimestre (novembro/dezembro) via PNCP/Compras.gov.br.',
    status: 'ATIVO',
    strategicClassification: StrategicClassification.ALTA_PRIORIDADE,
    accountOwner: 'Camila Torres (Engenheira Ambiental)',
    coOwners: ['Roberto Mendes'],
    tags: ['UFPE', 'Emissões', 'Pernambuco', 'MEC', 'Alta prioridade'],
    isFavorite: true,
    historicalVolume: 6800000.00,
    hasRecurrence: true,
    leadSource: 'PNCP',
    createdAt: '2026-02-15T11:00:00Z',
    updatedAt: '2026-10-08T11:30:00Z'
  },
  {
    id: 'ORG-COMPESA',
    name: 'Companhia Pernambucana de Saneamento (COMPESA)',
    corporateName: 'Companhia Pernambucana de Saneamento S/A',
    cnpj: '09.769.035/0001-64',
    type: OrganizationType.EMPRESA_PUBLICA,
    segment: 'Saneamento Básico e Recursos Hídricos',
    city: 'Recife',
    state: 'PE',
    region: 'Nordeste',
    website: 'https://www.compesa.com.br',
    phone: '(81) 3412-9000',
    email: 'licitacoes@compesa.com.br',
    description: 'Estatal estadual responsável pelo abastecimento de água e esgotamento sanitário em Pernambuco.',
    notes: 'Frequente licitante de inspeção NR-13 e laudos estruturais de caldeiras/elevatórias.',
    status: 'ATIVO',
    strategicClassification: StrategicClassification.ALTA_PRIORIDADE,
    accountOwner: 'Flávio Caldas (Eng. Mecânico)',
    coOwners: ['Roberto Mendes'],
    tags: ['COMPESA', 'NR-13', 'Saneamento', 'Pernambuco'],
    isFavorite: true,
    historicalVolume: 12400000.00,
    hasRecurrence: true,
    leadSource: 'Compras.gov.br',
    createdAt: '2026-03-01T14:20:00Z',
    updatedAt: '2026-10-07T16:00:00Z'
  },
  {
    id: 'ORG-SUAPE',
    name: 'Complexo Industrial Portuário de Suape',
    corporateName: 'Suape Complexo Industrial Portuário Governador Eraldo Gueiros',
    cnpj: '10.824.514/0001-44',
    type: OrganizationType.EMPRESA_PUBLICA,
    segment: 'Infraestrutura Portuária e Logística',
    city: 'Ipojuca',
    state: 'PE',
    region: 'Nordeste',
    website: 'https://www.suape.pe.gov.br',
    phone: '(81) 3527-5000',
    email: 'ouvidoria@suape.pe.gov.br',
    description: 'Hub portuário e polo industrial estratégico em Pernambuco com rigorosas exigências ambientais de destinação de resíduos.',
    notes: 'Oportunidade convertida recente no PNCP (Resíduos Perigosos Classe I).',
    status: 'ATIVO',
    strategicClassification: StrategicClassification.ESTRATEGICO,
    accountOwner: 'Roberto Mendes (Diretor Comercial)',
    coOwners: ['Camila Torres'],
    tags: ['Suape', 'Resíduos', 'Porto', 'Pernambuco', 'Estratégico'],
    isFavorite: true,
    historicalVolume: 9800000.00,
    hasRecurrence: true,
    leadSource: 'Relacionamento',
    createdAt: '2026-03-20T10:15:00Z',
    updatedAt: '2026-10-06T14:45:00Z'
  },
  {
    id: 'ORG-CHESF',
    name: 'Eletrobras Chesf',
    corporateName: 'Companhia Hidroelétrica do São Francisco',
    cnpj: '33.541.368/0001-16',
    type: OrganizationType.EMPRESA_PRIVADA,
    segment: 'Energia Elétrica / Geração e Transmissão',
    city: 'Recife',
    state: 'PE',
    region: 'Nordeste',
    website: 'https://www.chesf.com.br',
    phone: '(81) 3229-2000',
    email: 'suprimentos@chesf.com.br',
    description: 'Empresa do grupo Eletrobras com sede no Recife atuando em toda a bacia do São Francisco e Nordeste.',
    notes: 'Demanda recorrente de licenciamento ambiental, EIA/RIMA e monitoramento de ictiofauna.',
    status: 'ATIVO',
    strategicClassification: StrategicClassification.POTENCIAL,
    accountOwner: 'Camila Torres (Engenheira Ambiental)',
    coOwners: ['Lucas Andrade'],
    tags: ['Chesf', 'Energia', 'Estudos Ambientais', 'Nordeste'],
    isFavorite: false,
    historicalVolume: 15600000.00,
    hasRecurrence: false,
    leadSource: 'Prospecção manual',
    createdAt: '2026-04-05T08:30:00Z',
    updatedAt: '2026-10-05T09:20:00Z'
  }
];

class OrganizationService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[OrganizationService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[OrganizationService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_ORGS);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_ORGS, INITIAL_ORGANIZATIONS);
    }
  }

  /**
   * Retorna todas as organizações com enriquecimento do Relationship Opportunity Score
   */
  getAllOrganizations() {
    const list = this._safeGetStorage(STORAGE_KEY_ORGS) || INITIAL_ORGANIZATIONS;
    return list.map(org => {
      const scoreResult = calculateRelationshipOpportunityScore({
        futureSignalsCount: org.tags.includes('Estratégico') ? 2 : 1,
        historicalVolume: org.historicalVolume || 0,
        hasRecurrence: org.hasRecurrence,
        compatibleServicesCount: 3,
        hasExpiringContracts: true,
        isStrategicAccount: org.strategicClassification === StrategicClassification.ESTRATEGICO
      });

      return {
        ...org,
        relationshipScore: scoreResult.score,
        relationshipTier: scoreResult.tier,
        badgeColor: scoreResult.badgeColor
      };
    });
  }

  /**
   * Busca organização por ID
   */
  getOrganizationById(id) {
    if (!id) return null;
    const all = this.getAllOrganizations();
    return all.find(o => o.id === id) || null;
  }

  /**
   * Busca e resolve organização por CNPJ ou Nome (Item 7: Organização Automática e Deduplicação)
   */
  findOrCreateOrganization(queryData = {}) {
    const all = this.getAllOrganizations();
    const cnpjClean = (queryData.cnpj || '').replace(/[^\d]/g, '');
    const nameLower = (queryData.name || queryData.organ || '').toLowerCase().trim();

    // 1. Tenta correspondência exata por CNPJ
    if (cnpjClean.length >= 8) {
      const matchCnpj = all.find(o => o.cnpj.replace(/[^\d]/g, '').startsWith(cnpjClean.substring(0, 8)));
      if (matchCnpj) return { organization: matchCnpj, created: false };
    }

    // 2. Tenta correspondência por Nome / Órgão
    if (nameLower) {
      const matchName = all.find(o => 
        o.name.toLowerCase().includes(nameLower) ||
        nameLower.includes(o.name.toLowerCase()) ||
        o.corporateName.toLowerCase().includes(nameLower)
      );
      if (matchName) return { organization: matchName, created: false };
    }

    // 3. Não encontrada: cria nova organização com base nos dados fornecidos
    const newOrg = {
      id: `ORG-${Date.now()}`,
      name: queryData.name || queryData.organ || 'Nova Organização',
      corporateName: queryData.corporateName || queryData.name || 'Nova Organização',
      cnpj: queryData.cnpj || '00.000.000/0001-00',
      type: queryData.type || OrganizationType.ORGAO_PUBLICO,
      segment: queryData.segment || 'Serviços Públicos',
      city: queryData.city || 'Recife',
      state: queryData.state || 'PE',
      region: queryData.region || 'Nordeste',
      website: queryData.website || '',
      phone: queryData.phone || '',
      email: queryData.email || '',
      description: queryData.description || 'Cadastrada automaticamente a partir de oportunidade pública.',
      notes: queryData.notes || '',
      status: 'ATIVO',
      strategicClassification: queryData.strategicClassification || StrategicClassification.POTENCIAL,
      accountOwner: queryData.accountOwner || 'Camila Torres',
      coOwners: [],
      tags: queryData.tags || ['Novo Lead'],
      isFavorite: false,
      historicalVolume: Number(queryData.historicalVolume) || 0,
      hasRecurrence: false,
      leadSource: queryData.leadSource || 'Radar automático',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    all.push(newOrg);
    this._safeSetStorage(STORAGE_KEY_ORGS, all);
    return { organization: newOrg, created: true };
  }

  /**
   * Atualiza dados de uma organização existente
   */
  updateOrganization(id, patch = {}) {
    const all = this._safeGetStorage(STORAGE_KEY_ORGS) || INITIAL_ORGANIZATIONS;
    const index = all.findIndex(o => o.id === id);
    if (index >= 0) {
      all[index] = {
        ...all[index],
        ...patch,
        updatedAt: new Date().toISOString()
      };
      this._safeSetStorage(STORAGE_KEY_ORGS, all);
      return all[index];
    }
    return null;
  }

  /**
   * Alterna status de favorito
   */
  toggleFavorite(id) {
    const org = this.getOrganizationById(id);
    if (org) {
      this.updateOrganization(id, { isFavorite: !org.isFavorite });
      return !org.isFavorite;
    }
    return false;
  }

  /**
   * Resumo de Segmentação e Contadores
   */
  getOrganizationMetrics() {
    const all = this.getAllOrganizations();
    return {
      total: all.length,
      strategicCount: all.filter(o => o.strategicClassification === StrategicClassification.ESTRATEGICO).length,
      highPriorityCount: all.filter(o => o.strategicClassification === StrategicClassification.ALTA_PRIORIDADE).length,
      favoritesCount: all.filter(o => o.isFavorite).length,
      byType: all.reduce((acc, o) => {
        acc[o.type] = (acc[o.type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

export const organizationService = new OrganizationService();
