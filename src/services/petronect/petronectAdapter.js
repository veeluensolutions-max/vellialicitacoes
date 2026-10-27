/**
 * VELLIA LICITAÇÕES - PETRONECT ADAPTER (FASE 6)
 * Transforma dados parseados da Petronect no formato padrão OpportunityDTO e modelo de entidade Opportunity.
 */

import { PetronectParser } from './petronectParser.js';
import { OpportunityService } from '../opportunityService.js';
import { TagService } from '../tagService.js';
import { PETRONECT_CONFIG } from './petronectConfig.js';

export class PetronectAdapter {
  /**
   * Converte um registro para o DTO padrão estruturado
   */
  static toDTO(rawRecord) {
    const parsed = PetronectParser.parseRecord(rawRecord);
    return {
      source: 'PETRONECT',
      externalId: parsed.externalId,
      contractor: parsed.contractor,
      title: parsed.title,
      object: parsed.object,
      description: parsed.description,
      familyCode: parsed.familyCode,
      familyDescription: parsed.familyDescription,
      itemDescription: parsed.itemDescription,
      materialNumber: parsed.materialNumber,
      publicationDate: parsed.publicationDate,
      closingDate: parsed.closingDate,
      estimatedValue: parsed.estimatedValue,
      externalStatus: parsed.externalStatus,
      externalStatusKey: parsed.externalStatusKey,
      location: parsed.location,
      state: parsed.state,
      city: parsed.city,
      modality: parsed.modality,
      url: parsed.url,
      sourceType: parsed.sourceType,
      capturedAt: new Date().toISOString(),
      parserVersion: PETRONECT_CONFIG.PARSER_VERSION,
      connectorVersion: PETRONECT_CONFIG.CONNECTOR_VERSION
    };
  }

  /**
   * Converte o DTO para a entidade completa pronta para persistência e classificação
   */
  static toEntity(dto) {
    // Enriquecimento e execução do Motor de Aderência
    return OpportunityService.enrichOpportunity({
      id: `PETRO-${dto.externalId}`,
      number: dto.externalId,
      portal: 'Petronect',
      client: dto.contractor,
      title: dto.title,
      object: dto.object,
      description: dto.description,
      modality: dto.modality,
      situation: dto.externalStatus,
      publishDate: dto.publicationDate,
      endDate: dto.closingDate,
      location: dto.location,
      state: dto.state,
      city: dto.city,
      estimatedValue: dto.estimatedValue,
      url: dto.url,
      // Metadados específicos do conector
      externalStatus: dto.externalStatus,
      familyCode: dto.familyCode,
      familyDescription: dto.familyDescription,
      sourceType: dto.sourceType,
      connectorVersion: dto.connectorVersion,
      parserVersion: dto.parserVersion
    }, 'Petronect (Conector Oficial)');
  }
}
