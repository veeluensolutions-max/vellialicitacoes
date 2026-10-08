/**
 * VELLIA LICITAÇÕES — FASE 15: ARQUITETURA MULTIFONTE
 * opportunityDTO.js: Modelo Canônico de DTO e Tipos de Registros Públicos
 * 
 * Atende aos requisitos:
 * - Item 1: Contrato unificado de transporte entre SourceConnector -> SourceAdapter -> IngestionService
 * - Item 6: Normalização para OpportunityDTO padrão
 * - Item 19: Níveis de Source Confidence (Alta, Média, Baixa)
 * - Item 39: Tipos de Registros (OPPORTUNITY, PLANNED_PURCHASE, CONTRACT, PRICE_REGISTRATION)
 */

export const RecordType = {
  OPPORTUNITY: 'OPPORTUNITY',                       // Licitação com recebimento de propostas aberto
  PLANNED_PURCHASE: 'PLANNED_PURCHASE',             // Plano de Contratações Anual (PCA - Radar Antecipado)
  CONTRACT: 'CONTRACT',                             // Contrato administrativo público vigente
  PRICE_REGISTRATION: 'PRICE_REGISTRATION'           // Ata de Registro de Preços (SRP)
};

export const SourceType = {
  PETRONECT: 'Petronect',
  PNCP: 'PNCP',
  COMPRAS_GOV: 'Compras.gov.br'
};

export const SourceConfidence = {
  HIGH: 'Alta (API Oficial / Portal Primário)',
  MEDIUM: 'Média (Portal Secundário / Diário Oficial)',
  LOW: 'Baixa (Agregador Terceirizado)'
};

/**
 * Cria um objeto padronizado OpportunityDTO
 */
export function createOpportunityDTO({
  source = SourceType.PNCP,
  recordType = RecordType.OPPORTUNITY,
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
  srp = false,
  items = [],
  rawPayload = {},
  confidence = SourceConfidence.HIGH
}) {
  return {
    source,
    recordType,
    externalId: String(externalId || ''),
    processNumber: processNumber || '',
    contractor: contractor || 'Órgão Público Não Informado',
    contractorCnpj: contractorCnpj ? String(contractorCnpj).replace(/\D/g, '') : '',
    contractorUnit: contractorUnit || '',
    title: title || object || 'Sem título informado',
    object: object || title || 'Sem objeto especificado',
    description: description || object || '',
    modality: modality || 'Não informada',
    disputeMode: disputeMode || 'Aberto',
    judgmentCriteria: judgmentCriteria || 'Menor Preço',
    legalFramework: legalFramework || 'Lei 14.133/2021',
    publicationDate: publicationDate || new Date().toISOString(),
    proposalStart: proposalStart || publicationDate || new Date().toISOString(),
    closingDate: closingDate || null,
    estimatedValue: estimatedValue || null,
    state: state ? String(state).toUpperCase() : 'BR',
    city: city || 'Não informada',
    location: location || `${city || 'Geral'} - ${state || 'BR'}`,
    officialUrl: officialUrl || '',
    srp: Boolean(srp),
    items: Array.isArray(items) ? items : [],
    confidence,
    capturedAt: new Date().toISOString(),
    // Dados originais de auditoria
    rawPayload
  };
}
