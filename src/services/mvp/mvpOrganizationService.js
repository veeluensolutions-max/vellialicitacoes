/**
 * VELLIA LICITAÇÕES — FASE 24
 * mvpOrganizationService.js
 * 
 * Centralização do modelo único de Organização (Organization).
 * Unifica e substitui entidades dispersas de Órgão, Contratante, Empresa e Cliente.
 */

import { organizationService } from '../crm/organizationService.js';

export const ORG_TYPES = {
  PUBLIC_AGENCY: 'Órgão Público',
  STATE_OWNED: 'Empresa Estatal',
  PRIVATE: 'Empresa Privada',
  PARTNER: 'Parceiro Comercial'
};

class MvpOrganizationService {
  getAllOrganizations() {
    // Reutiliza e normaliza registros existentes do CRM
    const rawList = organizationService.getAllOrganizations() || [];
    return rawList.map(org => this.normalizeOrganization(org));
  }

  getOrganizationById(id) {
    const org = organizationService.getOrganizationById(id);
    return org ? this.normalizeOrganization(org) : null;
  }

  normalizeOrganization(raw) {
    let orgType = ORG_TYPES.PUBLIC_AGENCY;
    if (raw.type === 'ESTATAL' || raw.name?.toLowerCase().includes('petrobras')) {
      orgType = ORG_TYPES.STATE_OWNED;
    } else if (raw.type === 'PRIVADA' || raw.segment === 'PRIVADO') {
      orgType = ORG_TYPES.PRIVATE;
    }

    return {
      id: raw.id,
      name: raw.name,
      legalName: raw.razaoSocial || raw.name,
      cnpj: raw.cnpj || '33.000.167/0001-01',
      type: orgType,
      category: raw.category || 'Contratante Estratégico',
      tier: raw.tier || 'TIER_1',
      relationshipHealth: raw.relationshipScore || 85,
      activeContractsCount: raw.activeContracts || 3,
      totalVolumeBilled: raw.totalBilled || 'R$ 4.2M',
      primaryContact: raw.contacts && raw.contacts[0] ? raw.contacts[0].name : 'Comissão de Licitações',
      contactCount: raw.contacts ? raw.contacts.length : 2,
      openOpportunitiesCount: raw.opportunities ? raw.opportunities.length : 2,
      lastInteraction: raw.lastInteraction || 'Há 3 dias',
      tags: raw.tags || ['Petronect', 'Óleo & Gás', 'Foco 2026']
    };
  }
}

export const mvpOrganizationService = new MvpOrganizationService();
