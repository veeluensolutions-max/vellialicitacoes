/**
 * VELLIA LICITAÇÕES — FASE 13: COPILOTO VELLIA
 * SourceReferenceService: Rastreamento e Citação de Fontes Internas Oficiais (Itens 9 e 24).
 * 
 * Regras:
 * - Toda resposta deve indicar objetivamente de onde vieram os dados utilizados.
 * - Suporta referências a Editais (com seção e página), Oportunidades, Atestados, Matriz de Capacidade, Propostas e Resultados.
 * - Formatação executiva limpa, sem detalhes técnicos internos desnecessários.
 */

export const SourceType = {
  OPPORTUNITY: 'Oportunidade',
  EDITAL: 'Edital',
  CERTIFICATE: 'Atestado Técnico',
  DOCUMENT_VAULT: 'Cofre de Documentos',
  DECISION_ENGINE: 'Motor de Decisão (GO/NO-GO)',
  PROPOSAL: 'Gestão de Propostas',
  PRICE_INTELLIGENCE: 'Inteligência de Preços',
  RESULTS_HISTORY: 'Histórico de Resultados',
  COMPETITOR_DATABASE: 'Base Oficial de Concorrentes'
};

export class SourceReferenceService {
  /**
   * Constrói uma referência padronizada
   */
  static createReference(type, label, details = {}) {
    return {
      type,
      label,
      docId: details.docId || null,
      section: details.section || null,
      page: details.page || null,
      actionId: details.actionId || null,
      actionType: details.actionType || null
    };
  }

  /**
   * Formata a lista de referências para apresentação executiva
   */
  static formatSourcesForDisplay(sources = []) {
    if (!sources || sources.length === 0) return [];
    
    // Deduplica por label
    const seen = new Set();
    const unique = [];

    for (const src of sources) {
      const key = `${src.type}:${src.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(src);
      }
    }

    return unique;
  }
}

export default SourceReferenceService;
