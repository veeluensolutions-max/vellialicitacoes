/**
 * VELLIA LICITAÇÕES — FASE 15: ARQUITETURA MULTIFONTE
 * pncpAdapter.js: Adaptador e Normalizador PNCP -> OpportunityDTO
 * 
 * Atende aos requisitos:
 * - Itens 5, 6: Normalização de todos os campos do PNCP para o OpportunityDTO canônico
 * - Item 7: Link oficial preservado (Abrir no PNCP)
 * - Item 19: Source Confidence Alta para a API oficial do PNCP
 */

import { createOpportunityDTO, SourceType, RecordType, SourceConfidence } from './opportunityDTO.js';

export class PNCPAdapter {
  /**
   * Converte o payload bruto do PNCP para o OpportunityDTO padrão
   */
  static toDTO(raw) {
    if (!raw) return null;

    const externalId = raw.idPncp || `${raw.orgaoEntidade?.cnpj}-${raw.anoContratacao}-${raw.numeroContratacao}`;
    const contractor = raw.orgaoEntidade?.razaoSocial || 'Órgão Público Federal/Estadual';
    const contractorCnpj = raw.orgaoEntidade?.cnpj || '';
    const contractorUnit = raw.unidadeOrgao?.nomeUnidade || '';
    const processNumber = raw.numeroProcesso || raw.numeroContratacao || '';
    const object = raw.objetoContratacao || 'Objeto não especificado no edital';
    const description = raw.informacaoComplementar || object;
    const title = `PNCP ${raw.numeroContratacao || ''} — ${contractor}`.trim();
    const modality = raw.modalidadeNome || 'Pregão Eletrônico';
    const disputeMode = raw.modoDisputaNome || 'Aberto';
    const judgmentCriteria = raw.criterioJulgamentoNome || 'Menor Preço';
    const legalFramework = raw.amparoLegal?.nome || 'Lei 14.133/2021';
    const publicationDate = raw.dataPublicacaoPncp || new Date().toISOString();
    const proposalStart = raw.dataInicioRecebimentoPropostas || publicationDate;
    const closingDate = raw.dataFimRecebimentoPropostas || null;

    const state = raw.unidadeFederativa?.sigla || 'PE';
    const city = raw.municipio?.nome || 'Recife';
    const location = `${city} - ${state}`;

    let estimatedValue = null;
    if (raw.valorTotalEstimado !== undefined && raw.valorTotalEstimado !== null) {
      estimatedValue = typeof raw.valorTotalEstimado === 'number'
        ? `R$ ${raw.valorTotalEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : String(raw.valorTotalEstimado);
    }

    const officialUrl = raw.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${contractorCnpj}/${raw.anoContratacao || 2026}/${raw.numeroContratacao || ''}`;

    return createOpportunityDTO({
      source: SourceType.PNCP,
      recordType: RecordType.OPPORTUNITY,
      externalId,
      processNumber,
      contractor,
      contractorCnpj,
      contractorUnit,
      title,
      object,
      description,
      modality,
      disputeMode,
      judgmentCriteria,
      legalFramework,
      publicationDate,
      proposalStart,
      closingDate,
      estimatedValue,
      state,
      city,
      location,
      officialUrl,
      srp: Boolean(raw.srp),
      items: raw.itens || [],
      rawPayload: raw,
      confidence: SourceConfidence.HIGH
    });
  }

  /**
   * Converte OpportunityDTO para a entidade padrão utilizada pelo OpportunityService e Motor de Aderência
   */
  static toEntity(dto) {
    if (!dto) return null;

    // Calcula dias restantes
    let daysLeft = 15;
    if (dto.closingDate) {
      const diff = new Date(dto.closingDate).getTime() - Date.now();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      id: `PNCP-${dto.externalId}`,
      number: dto.externalId,
      processNumber: dto.processNumber,
      portal: 'PNCP',
      client: dto.contractor,
      clientCnpj: dto.contractorCnpj,
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
      officialPortalUrl: dto.officialUrl, // Link explícito para "Abrir no PNCP"
      srp: dto.srp,
      items: dto.items,
      primarySource: 'PNCP',
      sources: ['PNCP'],
      sourceConfidence: dto.confidence,
      hasDiscrepancy: false,
      discrepancyDetails: null
    };
  }
}
