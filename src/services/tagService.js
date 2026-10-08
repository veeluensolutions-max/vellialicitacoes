/**
 * VELLIA LICITAÇÕES - TAG SERVICE (FASE 5)
 * Geração automática de tags para oportunidades baseadas no objeto, localização e prazos.
 */

export class TagService {
  static generateTags(opp) {
    const tags = new Set();
    const text = `${opp.title} ${opp.object} ${opp.description || ''}`.toLowerCase();

    // Tags de Portal
    if (opp.portal) tags.add(opp.portal);

    // Tags Regionais
    if (opp.state) tags.add(opp.state.toUpperCase());
    if (opp.location && opp.location.includes('PE')) tags.add('Região Base (PE)');
    if (opp.location && (opp.location.includes('Suape') || opp.location.includes('Ipojuca'))) tags.add('Polo Suape');

    // Tags por Complexidade Técnica
    if (text.includes('isocinétic') || text.includes('chaminé')) tags.add('Isocinética');
    if (text.includes('aermod') || text.includes('dispersão')) tags.add('Modelagem AERMOD');
    if (text.includes('ete') || text.includes('esgoto') || text.includes('efluente')) tags.add('Saneamento / ETE');
    if (text.includes('nr-13') || text.includes('caldeira') || text.includes('vaso de pressão')) tags.add('NR-13');
    if (text.includes('offshore') || text.includes('plataforma') || text.includes('embarcação')) tags.add('Offshore');
    if (text.includes('refinaria') || text.includes('petrobras') || text.includes('rnest')) tags.add('Refinaria');
    if (text.includes('conama') || text.includes('licenciamento')) tags.add('Conformidade Ambiental');

    // Tags por Prazo
    const days = Number(opp.daysLeft);
    if (!isNaN(days)) {
      if (days <= 7) tags.add('🔥 Prazo Crítico');
      else if (days <= 14) tags.add('Prazo Médio');
      else tags.add('Prazo Amplo');
    }

    // Tags por Porte de Valor
    const val = Number(opp.estimatedValue) || 0;
    if (val >= 2000000) tags.add('Alto Valor (>2M)');
    else if (val >= 500000) tags.add('Porte Médio');

    // Tags por Empresa Indicada
    if (opp.recommendedCompany) {
      if (opp.recommendedCompany.includes('Excelência')) tags.add('Excelência Ambiental');
      if (opp.recommendedCompany.includes('Veeluen')) tags.add('Veeluen Solutions');
    }

    return Array.from(tags);
  }
}
