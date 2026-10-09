/**
 * VELLIA LICITAÇÕES — FASE 27: OTIMIZAÇÃO DA INTELIGÊNCIA DO AGENTE
 * entityExtractor.js: Extração estruturada de entidades técnicas (Normas, Equipamentos,
 * Órgãos, Atividades e Profissões) para enriquecimento semântico.
 * (Itens 16 a 18)
 */

export class EntityExtractor {
  /**
   * Extrai todas as entidades técnicas reconhecidas do texto da oportunidade
   */
  static extractEntities(text = '') {
    if (!text || typeof text !== 'string') {
      return {
        norms: [],
        equipment: [],
        organs: [],
        roles: [],
        activities: [],
        locations: []
      };
    }

    const lower = text.toLowerCase();

    // 1. NORMAS TÉCNICAS E REGULATÓRIAS
    const norms = [];
    const normPatterns = [
      { name: 'NR-13', regex: /\bnr[\s-]?13\b/i },
      { name: 'NR-10', regex: /\bnr[\s-]?10\b/i },
      { name: 'NR-12', regex: /\bnr[\s-]?12\b/i },
      { name: 'NR-33', regex: /\bnr[\s-]?33\b/i },
      { name: 'NR-35', regex: /\bnr[\s-]?35\b/i },
      { name: 'CONAMA 430', regex: /\bconama[\s-]?430\b/i },
      { name: 'CONAMA 382', regex: /\bconama[\s-]?382\b/i },
      { name: 'CONAMA 491', regex: /\bconama[\s-]?491\b/i },
      { name: 'CONAMA 357', regex: /\bconama[\s-]?357\b/i },
      { name: 'NBR 5419', regex: /\bnbr[\s-]?5419\b/i },
      { name: 'NBR 12019', regex: /\bnbr[\s-]?12019\b/i },
      { name: 'NBR 12020', regex: /\bnbr[\s-]?12020\b/i },
      { name: 'EPA Method 5', regex: /\bepa[\s-]?(method\s+)?5\b/i },
      { name: 'GHG Protocol', regex: /\bghg[\s-]?(protocol)?\b/i },
      { name: 'AP-42', regex: /\bap[\s-]?42\b/i },
      { name: 'Portaria GM/MS 888', regex: /\b(portaria\s+)?(gm\/ms\s+|ms\s+)?888\b/i }
    ];

    for (const np of normPatterns) {
      if (np.regex.test(lower)) {
        norms.push(np.name);
      }
    }

    // 2. EQUIPAMENTOS ESPECÍFICOS
    const equipment = [];
    const equipPatterns = [
      { name: 'Caldeiras', regex: /\bcaldeiras?\b/i },
      { name: 'Vasos de Pressão', regex: /\bvasos?\s+de\s+press[aã]o\b/i },
      { name: 'Chaminés / Dutos', regex: /\b(chamin[eé]s?|dutos?\s+de\s+exaust[aã]o)\b/i },
      { name: 'Reatores / Decantadores', regex: /\b(reator(es)?|decantador(es)?|uasb)\b/i },
      { name: 'Estações de Tratamento (ETE/ETA)', regex: /\b(estac[aã]o\s+de\s+tratamento|ete\b|eta\b)\b/i },
      { name: 'Autoclaves / Compressores', regex: /\b(autoclaves?|compressores?|reservat[oó]rios?\s+de\s+ar)\b/i },
      { name: 'Sistemas de Para-raios (SPDA)', regex: /\b(para-?raios?|malhas?\s+de\s+aterramento|spda\b)\b/i },
      { name: 'Skids de Processo', regex: /\bskids?\b/i }
    ];

    for (const ep of equipPatterns) {
      if (ep.regex.test(lower)) {
        equipment.push(ep.name);
      }
    }

    // 3. ÓRGÃOS E CONTRATANTES RECONHECIDOS
    const organs = [];
    const organPatterns = [
      { name: 'Petrobras S.A.', regex: /\bpetrobr[aá]s\b/i },
      { name: 'Transpetro', regex: /\btranspetro\b/i },
      { name: 'Refinaria Abreu e Lima (RNEST)', regex: /\b(rnest|abreu\s+e\s+lima)\b/i },
      { name: 'Refinaria de Paulínia (REPLAN)', regex: /\breplan\b/i },
      { name: 'Refinaria de Duque de Caxias (REDUC)', regex: /\breduc\b/i },
      { name: 'Complexo de Suape', regex: /\bsuape\b/i },
      { name: 'Compesa', regex: /\bcompesa\b/i },
      { name: 'Sabesp', regex: /\bsabesp\b/i },
      { name: 'Copasa', regex: /\bcopasa\b/i }
    ];

    for (const op of organPatterns) {
      if (op.regex.test(lower)) {
        organs.push(op.name);
      }
    }

    // 4. PROFISSÕES E ESPECIALIDADES
    const roles = [];
    const rolePatterns = [
      { name: 'Engenheiro Químico', regex: /\beng(enheiro)?\s+qu[ií]mic[ao]\b/i },
      { name: 'Engenheiro Mecânico', regex: /\beng(enheiro)?\s+mec[aâ]nic[ao]\b/i },
      { name: 'Engenheiro Ambiental', regex: /\beng(enheiro)?\s+ambiental\b/i },
      { name: 'Engenheiro de Segurança', regex: /\beng(enheiro)?\s+de\s+seguran[cç]a\b/i },
      { name: 'Técnico em Meio Ambiente', regex: /\bt[eé]cnic[ao]\s+em\s+meio\s+ambiente\b/i },
      { name: 'Técnico de Segurança do Trabalho', regex: /\bt[eé]cnic[ao]\s+de\s+seguran[cç]a\b/i }
    ];

    for (const rp of rolePatterns) {
      if (rp.regex.test(lower)) {
        roles.push(rp.name);
      }
    }

    // 5. ATIVIDADES TÉCNICAS DISTINTIVAS
    const activities = [];
    const actPatterns = [
      { name: 'Amostragem Isocinética', regex: /\bamostragem\s+isocin[eé]tica\b/i },
      { name: 'Inspeção de Segurança', regex: /\binspec[aã]o\s+de\s+seguran[cç]a\b/i },
      { name: 'Operação Continuada', regex: /\boperac[aã]o\s+continuada\b/i },
      { name: 'Modelagem Matemática', regex: /\bmodelagem\s+(matem[aá]tica|computacional|de\s+dispers[aã]o)\b/i },
      { name: 'Ensaio Hidrostático', regex: /\bensaio\s+hidrost[aá]tico\b/i },
      { name: 'Medição Ôhmica', regex: /\bmedi[cç][aã]o\s+[oô]hmica\b/i },
      { name: 'Inventário de GEE', regex: /\binvent[aá]rio\s+de\s+(gee|emiss[oõ]es)\b/i }
    ];

    for (const ap of actPatterns) {
      if (ap.regex.test(lower)) {
        activities.push(ap.name);
      }
    }

    return {
      norms: Array.from(new Set(norms)),
      equipment: Array.from(new Set(equipment)),
      organs: Array.from(new Set(organs)),
      roles: Array.from(new Set(roles)),
      activities: Array.from(new Set(activities))
    };
  }
}
