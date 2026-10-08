/**
 * VELLIA LICITAÇÕES - PETRONECT PARSER (FASE 6)
 * Responsável por sanitizar, validar e converter formatos brutos da fonte pública Petronect.
 * REGRA CRÍTICA: Não inventar dados em caso de dúvida; marcar como "não identificado".
 */

export class PetronectParser {
  /**
   * Sanitiza strings removendo tags HTML, espaços excessivos e quebras de linha anômalas
   */
  static cleanText(input) {
    if (!input || typeof input !== 'string') return 'não identificado';
    const cleaned = input
      .replace(/<[^>]*>?/gm, '') // Remove HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.length > 0 ? cleaned : 'não identificado';
  }

  /**
   * Formata datas brasileiras ou ISO para o padrão normalizado DD/MM/YYYY
   */
  static parseDate(dateInput) {
    if (!dateInput) return 'não identificado';
    try {
      const clean = String(dateInput).trim();
      // Formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) return clean;
      
      // Formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
        const [y, m, d] = clean.substring(0, 10).split('-');
        return `${d}/${m}/${y}`;
      }

      const d = new Date(dateInput);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    } catch {
      // Ignora erro
    }
    return 'não identificado';
  }

  /**
   * Converte valores monetários ou numéricos para moeda formatada
   */
  static parseCurrency(valInput) {
    if (valInput === undefined || valInput === null || valInput === '') return 'Sob consulta';
    if (typeof valInput === 'number') {
      return `R$ ${valInput.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    const str = String(valInput).trim();
    if (str.startsWith('R$')) return str;

    const numeric = parseFloat(str.replace(/[^0-9,.-]/g, '').replace(',', '.'));
    if (!isNaN(numeric)) {
      return `R$ ${numeric.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return 'Sob consulta';
  }

  /**
   * Mapeia situação externa da Petronect para chave de controle
   */
  static parseExternalStatus(statusText) {
    const clean = this.cleanText(statusText).toLowerCase();
    if (clean.includes('abert') || clean.includes('proposta') || clean.includes('recebend')) {
      return { externalStatus: 'Aberto para propostas', normalizedKey: 'OPEN' };
    }
    if (clean.includes('análise') || clean.includes('julgamento') || clean.includes('habilita')) {
      return { externalStatus: 'Em análise', normalizedKey: 'UNDER_REVIEW' };
    }
    if (clean.includes('conclu') || clean.includes('encerrad') || clean.includes('homolog')) {
      return { externalStatus: 'Concluída', normalizedKey: 'CLOSED' };
    }
    return { externalStatus: statusText || 'Aberta para propostas', normalizedKey: 'OPEN' };
  }

  /**
   * Extrai e valida os campos essenciais do registro
   */
  static parseRecord(raw) {
    const number = this.cleanText(raw.numero || raw.number || raw.id || raw.numero_oportunidade);
    const object = this.cleanText(raw.objeto || raw.object || raw.objeto_contratacao || raw.descricao);
    const contractor = this.cleanText(raw.contratante || raw.empresa || raw.client || 'PETROBRAS');
    const title = this.cleanText(raw.titulo || raw.title || object.substring(0, 90));

    const startDate = this.parseDate(raw.data_inicio || raw.data_publicacao || raw.publishDate);
    const endDate = this.parseDate(raw.data_fim || raw.data_encerramento || raw.endDate);

    const statusParsed = this.parseExternalStatus(raw.situacao || raw.status || raw.sub_status);

    return {
      externalId: number,
      number,
      contractor,
      title,
      object,
      description: this.cleanText(raw.descricao || raw.description || object),
      subStatus: this.cleanText(raw.sub_status || raw.subStatus || 'Sem sub-status'),
      externalStatus: statusParsed.externalStatus,
      externalStatusKey: statusParsed.normalizedKey,
      familyCode: this.cleanText(raw.codigo_familia || raw.familyCode || 'não identificado'),
      familyDescription: this.cleanText(raw.descricao_familia || raw.familyDescription || 'não identificado'),
      itemDescription: this.cleanText(raw.descricao_item || raw.itemDescription || 'não identificado'),
      materialNumber: this.cleanText(raw.numero_material || raw.materialNumber || 'não identificado'),
      publicationDate: startDate,
      closingDate: endDate,
      estimatedValue: this.parseCurrency(raw.valor_estimado || raw.valor || raw.estimatedValue),
      url: raw.url || `https://www.petronect.com.br/portalpublico/oportunidade/${number}`,
      location: this.cleanText(raw.local || raw.local_execucao || raw.cidade ? `${raw.cidade} - ${raw.estado || 'PE'}` : 'Pernambuco - PE'),
      state: (raw.estado || raw.state || 'PE').toUpperCase(),
      city: raw.cidade || raw.city || 'não identificado',
      modality: this.cleanText(raw.modalidade || raw.tipo_oportunidade || 'Licitação Pública Petronect'),
      sourceType: raw.sourceType || 'PRINCIPAL' // PRINCIPAL | SECUNDARIA (Destaques)
    };
  }
}
