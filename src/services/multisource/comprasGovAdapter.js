/**
 * VELLIA LICITAÇÕES — FASE 15: ARQUITETURA MULTIFONTE
 * comprasGovAdapter.js: Adaptador e Normalizador Compras.gov.br -> OpportunityDTO
 * 
 * Atende aos requisitos:
 * - Itens 13, 14: Normalização dos dados de Dados Abertos do Compras.gov.br para o OpportunityDTO canônico
 * - Item 19: Source Confidence Alta para a API oficial do Compras.gov.br
 */

import { createOpportunityDTO, SourceType, RecordType, SourceConfidence } from './opportunityDTO.js';

export class ComprasGovAdapter {
  static toDTO(raw) {
    if (!raw) return null;

    const externalId = raw.uasg && raw.numeroAviso
      ? `${raw.uasg}-${raw.numeroAviso.replace('/', '-')}`
      : `CGOV-${Date.now()}`;

    const contractor = raw.orgaoNome || `Órgão Federal UASG ${raw.uasg || ''}`;
    const contractorUnit = raw.uasg ? `UASG ${raw.uasg}` : '';
    const processNumber = raw.numeroProcesso || raw.numeroAviso || '';
    const object = raw.objeto || 'Objeto não especificado';
    const description = object;
    const title = `Compras.gov UASG ${raw.uasg || ''} — ${contractor}`.trim();
    const modality = raw.modalidade || 'Pregão Eletrônico';
    const publicationDate = raw.dataPublicacao || new Date().toISOString();
    const proposalStart = raw.dataAberturaProposta || publicationDate;
    const closingDate = raw.dataEncerramentoProposta || null;

    const state = raw.uf || 'PE';
    const city = raw.municipio || 'Recife';
    const location = `${city} - ${state}`;

    let estimatedValue = null;
    if (raw.valorEstimado !== undefined && raw.valorEstimado !== null) {
      estimatedValue = typeof raw.valorEstimado === 'number'
        ? `R$ ${raw.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : String(raw.valorEstimado);
    }

    const officialUrl = raw.linkEdital || `https://cnetmobile.estaleiro.serpro.gov.br/comprasnet-web/public/compras/acompanhamento-compra?compra=${raw.uasg || ''}`;

    return createOpportunityDTO({
      source: SourceType.COMPRAS_GOV,
      recordType: RecordType.OPPORTUNITY,
      externalId,
      processNumber,
      contractor,
      contractorUnit,
      title,
      object,
      description,
      modality,
      disputeMode: 'Aberto',
      judgmentCriteria: 'Menor Preço',
      legalFramework: 'Lei 14.133/2021',
      publicationDate,
      proposalStart,
      closingDate,
      estimatedValue,
      state,
      city,
      location,
      officialUrl,
      items: raw.itens || [],
      rawPayload: raw,
      confidence: SourceConfidence.HIGH
    });
  }

  static toEntity(dto) {
    if (!dto) return null;

    let daysLeft = 14;
    if (dto.closingDate) {
      const diff = new Date(dto.closingDate).getTime() - Date.now();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      id: `CGOV-${dto.externalId}`,
      number: dto.externalId,
      processNumber: dto.processNumber,
      portal: 'Compras.gov.br',
      client: dto.contractor,
      contractorUnit: dto.contractorUnit,
      title: dto.title,
      object: dto.object,
      description: dto.description,
      modality: dto.modality,
      disputeMode: dto.disputeMode,
      judgmentCriteria: dto.judgmentCriteria,
      legalFramework: dto.legalFramework,
      situation: 'Propostas Abertas',
      publishDate: dto.publicationDate,
      proposalStart: dto.proposalStart,
      endDate: dto.closingDate,
      daysLeft,
      estimatedValue: dto.estimatedValue,
      location: dto.location,
      state: dto.state,
      city: dto.city,
      url: dto.officialUrl,
      officialPortalUrl: dto.officialUrl,
      items: dto.items,
      primarySource: 'Compras.gov.br',
      sources: ['Compras.gov.br'],
      sourceConfidence: dto.confidence,
      hasDiscrepancy: false,
      discrepancyDetails: null
    };
  }
}
