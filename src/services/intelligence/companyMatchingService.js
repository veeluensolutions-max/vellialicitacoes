/**
 * VELLIA LICITAÇÕES — FASE 27: OTIMIZAÇÃO DA INTELIGÊNCIA DO AGENTE
 * companyMatchingService.js: Resolução de empresa participante indicada (Excelência Ambiental vs Veeluen Solutions),
 * sobreposição de competências e tratamento de empresa não definida sem forçar.
 * (Itens 23 a 25, 109 a 111)
 */

export const COMPANY_PROFILES = {
  EXCELENCIA_AMBIENTAL: {
    id: 'comp-ea',
    name: 'Excelência Ambiental',
    specialties: [
      'Monitoramento de Emissões Atmosféricas',
      'Amostragem Isocinética',
      'Qualidade do Ar',
      'AERMOD (Modelagem Matemática)',
      'Inventário de Emissões Atmosféricas & GEE',
      'Consultoria Ambiental',
      'Licenciamento Ambiental',
      'Ruído Ambiental (NBR 10151)'
    ],
    primaryKeywords: [
      'emissões', 'chaminé', 'isocinética', 'qualidade do ar', 'aermod',
      'poluentes atmosféricos', 'gases de combustão', 'conama 382', 'conama 491'
    ],
    headquarters: 'PE',
    logisticsReach: ['PE', 'AL', 'PB', 'RN', 'SE', 'BA', 'SP', 'RJ']
  },

  VEELUEN_SOLUTIONS: {
    id: 'comp-vs',
    name: 'Veeluen Solutions',
    specialties: [
      'Operação e Manutenção de ETE',
      'Operação de ETA',
      'Tratamento de Efluentes Sanitários e Industriais',
      'NR-13 (Caldeiras e Vasos de Pressão)',
      'Inspeção de Vasos de Pressão',
      'Inspeção de Caldeiras',
      'SPDA & Aterramento (NBR 5419)',
      'Sistemas de Gases Industriais',
      'Manutenção Industrial & Eletromecânica'
    ],
    primaryKeywords: [
      'ete', 'eta', 'esgoto', 'efluentes', 'caldeira', 'vasos de pressão',
      'nr-13', 'spda', 'aterramento', 'conama 430', 'eletromecânica'
    ],
    headquarters: 'PE',
    logisticsReach: ['PE', 'AL', 'PB', 'BA', 'SP', 'RJ', 'MG', 'ES']
  }
};

export class CompanyMatchingService {
  static getProfileVersion() {
    return 'v1.2-fase27';
  }

  /**
   * Determina empresa principal e secundária a partir dos serviços correspondentes identificados
   */
  static matchCompany(topService = null, secondaryServices = [], textAdherenceScore = 0) {
    // Regra 25: Se não houver compatibilidade clara (score muito baixo ou sem serviço reconhecido), não forçar empresa
    if (!topService || textAdherenceScore < 35) {
      return {
        primaryCompany: 'Empresa não definida',
        secondaryCompany: null,
        hasOverlap: false,
        reason: 'Baixa correlação técnica ou escopo indefinido; não há empresa do grupo com aderência inequívoca.'
      };
    }

    const primaryCompany = topService.company;
    let secondaryCompany = null;
    let hasOverlap = false;

    // Verificar se algum serviço secundário pertence à outra empresa do grupo
    const otherCompany = primaryCompany === 'Excelência Ambiental' ? 'Veeluen Solutions' : 'Excelência Ambiental';
    const hasOtherCompanyServices = secondaryServices.some(s => s.company === otherCompany && (s.matchScore || 0) >= 3);

    if (hasOtherCompanyServices) {
      secondaryCompany = otherCompany;
      hasOverlap = true;
    }

    const reason = hasOverlap
      ? `Empresa principal definida como "${primaryCompany}" devido ao escopo prioritário de "${topService.name}". Empresa secundária "${secondaryCompany}" identificada por sobreposição de serviços complementares.`
      : `Empresa definida como "${primaryCompany}" por especialidade e acervo técnico exclusivo em "${topService.name}".`;

    return {
      primaryCompany,
      secondaryCompany,
      hasOverlap,
      reason
    };
  }
}
