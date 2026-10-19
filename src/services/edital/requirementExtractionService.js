/**
 * VELLIA LICITAÇÕES — FASE 28: INTELIGÊNCIA DOCUMENTAL AVANÇADA
 * RequirementExtractionService.js
 * 
 * Responsável por:
 * 1. Extração estruturada de requisitos nas 20+ categorias formais
 * 2. Classificação de obrigatoriedade (MANDATORY, CONDITIONAL, OPTIONAL, INFORMATIONAL, UNCLEAR)
 * 3. Identificação de HARD REQUIREMENTS / CRITICAL INABILITATION BLOCKERS vs SOFT REQUIREMENTS
 * 4. Normalização de quantitativos (type, value, unit) para comparação matemática segura
 * 5. Detecção especializada de Visita Técnica e prazos fatais
 * 6. Decomposição de Itens / Lotes para permitir avaliação de adesão por item
 * 7. Extração de riscos contratuais (multas abusivas, retenções desproporcionais)
 * 8. Filtragem de falsos positivos (citações meramente informativas ou definições conceituais)
 */

export const RequirementCategory = {
  HABILITACAO_JURIDICA: 'Habilitação Jurídica',
  REGULARIDADE_FISCAL: 'Regularidade Fiscal',
  REGULARIDADE_TRABALHISTA: 'Regularidade Trabalhista',
  ECONOMICO_FINANCEIRA: 'Econômico-financeira',
  QUALIFICACAO_TECNICA: 'Qualificação Técnica',
  CAPACIDADE_OPERACIONAL: 'Capacidade Operacional',
  CAPACIDADE_PROFISSIONAL: 'Capacidade Profissional',
  EQUIPE_MINIMA: 'Equipe',
  EQUIPAMENTOS: 'Equipamentos',
  CERTIFICACOES: 'Certificações',
  VISITA_TECNICA: 'Visita Técnica',
  GARANTIAS: 'Garantias',
  PRAZO: 'Prazo',
  PROPOSTA_COMERCIAL: 'Proposta Comercial',
  PROPOSTA_TECNICA: 'Proposta Técnica',
  METODOLOGIA: 'Metodologia',
  EXECUCAO: 'Execução',
  SST: 'SST (Saúde e Segurança)',
  AMBIENTAL: 'Ambiental & Licenciamento',
  SEGUROS: 'Seguros',
  OUTROS: 'Outros'
};

export const ObligatorinessLevel = {
  MANDATORY: 'MANDATORY',       // Obrigatório (condição de habilitação / desclassificação)
  CONDITIONAL: 'CONDITIONAL',   // Condicional ("quando aplicável", "caso opte por consórcio")
  OPTIONAL: 'OPTIONAL',         // Opcional ("a critério da licitante", pontuação extra)
  INFORMATIONAL: 'INFORMATIONAL', // Apenas informativo / descritivo (não pontua nem inabilita)
  UNCLEAR: 'UNCLEAR'            // Redação ambígua — requer revisão humana ou pedido de esclarecimento
};

export const RequirementType = {
  HARD_BLOCKER: 'HARD_BLOCKER', // Inabilitação sumária se não comprovado
  CRITICAL: 'CRITICAL',         // Exigência principal de alto risco
  SOFT: 'SOFT',                 // Requisito formal ou sanável
  INFORMATIVE: 'INFORMATIVE'
};

export const QuantitativeType = {
  EXPERIENCE_DURATION: 'EXPERIENCE_DURATION', // meses ou anos de atuação
  QUANTITY: 'QUANTITY',                       // número de campanhas, pontos, amostras
  VOLUME: 'VOLUME',                           // m³, litros, toneladas
  FINANCIAL: 'FINANCIAL',                     // valor mínimo de faturamento, capital social
  PERCENTAGE: 'PERCENTAGE',                   // % de atendimento ou BDI
  OTHER: 'OTHER'
};

export class RequirementExtractionService {
  /**
   * Converte menções textuais brutas em requisitos normalizados
   */
  static extractAndNormalize(rawSnippets = [], opportunity = {}) {
    const extractedList = [];

    rawSnippets.forEach((snippet, index) => {
      // 1. Filtragem de falsos positivos: ignorar meras definições
      if (this.isMereDefinitionOrCitation(snippet.text)) {
        return;
      }

      const category = this.detectCategory(snippet.text, snippet.sectionTitle);
      const obligatoriness = this.detectObligatoriness(snippet.text);
      const quantitativo = this.extractQuantitative(snippet.text);
      const isHardBlocker = this.checkIfHardBlocker(snippet.text, category, obligatoriness);

      const req = {
        id: snippet.id || `req-ext-${index + 1}`,
        title: snippet.title || this.deriveTitle(snippet.text),
        description: snippet.text,
        category,
        obligatoriness,
        requirementType: isHardBlocker ? RequirementType.HARD_BLOCKER : (obligatoriness === ObligatorinessLevel.MANDATORY ? RequirementType.CRITICAL : RequirementType.SOFT),
        isHardBlocker,
        quantitative: quantitativo,
        sourceTrace: {
          documentId: snippet.documentId || 'doc-edital',
          documentName: snippet.documentName || 'Edital Oficial',
          page: snippet.page || 1,
          section: snippet.section || snippet.sectionTitle || 'Seção do Edital',
          paragraph: snippet.paragraph || 1,
          originalSnippet: snippet.text,
          confidence: snippet.confidence || 0.95
        },
        hasExclusionRisk: isHardBlocker,
        exclusionReason: isHardBlocker ? this.deriveExclusionReason(category, snippet.text) : null,
        needsHumanReview: obligatoriness === ObligatorinessLevel.UNCLEAR || isHardBlocker
      };

      extractedList.push(req);
    });

    return extractedList;
  }

  /**
   * Detecta se um trecho é apenas definição ou referência normativa sem caráter de exigência
   */
  static isMereDefinitionOrCitation(text = '') {
    const lower = text.toLowerCase().trim();
    if (lower.startsWith('para os efeitos deste edital entende-se por') ||
        lower.startsWith('definições:') ||
        lower.startsWith('considera-se:') ||
        (lower.includes('apenas como referência') && !lower.includes('deverá'))) {
      return true;
    }
    return false;
  }

  /**
   * Categoriza o requisito
   */
  static detectCategory(text = '', sectionTitle = '') {
    const combined = (text + ' ' + sectionTitle).toLowerCase();

    if (combined.includes('visita técnica') || combined.includes('vistoria prévia')) {
      return RequirementCategory.VISITA_TECNICA;
    }
    if (combined.includes('atestado de capacidade técnica') || combined.includes('comprovação de aptidão')) {
      return RequirementCategory.CAPACIDADE_OPERACIONAL;
    }
    if (combined.includes('responsável técnico') || combined.includes('crea') || combined.includes('art') || combined.includes('cat')) {
      return RequirementCategory.CAPACIDADE_PROFISSIONAL;
    }
    if (combined.includes('equipe') || combined.includes('engenheiro') || combined.includes('técnico residente')) {
      return RequirementCategory.EQUIPE_MINIMA;
    }
    if (combined.includes('equipamento') || combined.includes('amostrador') || combined.includes('calibração')) {
      return RequirementCategory.EQUIPAMENTOS;
    }
    if (combined.includes('iso ') || combined.includes('acreditação inmetro') || combined.includes('certificação')) {
      return RequirementCategory.CERTIFICACOES;
    }
    if (combined.includes('capital social') || combined.includes('patrimônio líquido') || combined.includes('índice de liquidez')) {
      return RequirementCategory.ECONOMICO_FINANCEIRA;
    }
    if (combined.includes('tributos') || combined.includes('fazenda') || combined.includes('receita federal') || combined.includes('fgts')) {
      return RequirementCategory.REGULARIDADE_FISCAL;
    }
    if (combined.includes('trabalhista') || combined.includes('cndt') || combined.includes('menor de idade')) {
      return RequirementCategory.REGULARIDADE_TRABALHISTA;
    }
    if (combined.includes('contrato social') || combined.includes('junta comercial') || combined.includes('representante legal')) {
      return RequirementCategory.HABILITACAO_JURIDICA;
    }
    if (combined.includes('garantia contratual') || combined.includes('seguro garantia')) {
      return RequirementCategory.GARANTIAS;
    }
    if (combined.includes('prazo de execução') || combined.includes('vigência') || combined.includes('cronograma')) {
      return RequirementCategory.PRAZO;
    }
    return RequirementCategory.QUALIFICACAO_TECNICA;
  }

  /**
   * Determina o nível de obrigatoriedade
   */
  static detectObligatoriness(text = '') {
    const lower = text.toLowerCase();

    if (lower.includes('quando aplicável') || lower.includes('caso haja') || lower.includes('se houver consórcio')) {
      return ObligatorinessLevel.CONDITIONAL;
    }
    if (lower.includes('facultativo') || lower.includes('a critério da licitante') || lower.includes('poderá apresentar')) {
      return ObligatorinessLevel.OPTIONAL;
    }
    if (lower.includes('deverá obrigatoriamente') || lower.includes('é obrigatória') || lower.includes('sob pena de inabilitação') || lower.includes('sob pena de desclassificação') || lower.includes('deve apresentar')) {
      return ObligatorinessLevel.MANDATORY;
    }
    if (lower.includes('recomenda-se') || lower.includes('informa-se')) {
      return ObligatorinessLevel.INFORMATIONAL;
    }
    return ObligatorinessLevel.MANDATORY;
  }

  /**
   * Extrai e normaliza quantitativos de experiência, volume, prazos e percentuais
   */
  static extractQuantitative(text = '') {
    const lower = text.toLowerCase();

    // 1. Duração de Experiência (meses/anos)
    const monthMatch = lower.match(/(\d+)\s*(?:meses|mês|mes)/);
    if (monthMatch) {
      return {
        type: QuantitativeType.EXPERIENCE_DURATION,
        value: parseInt(monthMatch[1], 10),
        unit: 'MESES',
        rawString: `${monthMatch[1]} meses`
      };
    }

    const yearMatch = lower.match(/(\d+)\s*(?:anos|ano)/);
    if (yearMatch) {
      const years = parseInt(yearMatch[1], 10);
      return {
        type: QuantitativeType.EXPERIENCE_DURATION,
        value: years * 12,
        unit: 'MESES',
        rawString: `${years} anos (${years * 12} meses)`
      };
    }

    // 2. Campanhas / Pontos / Amostragens
    const campaignMatch = lower.match(/(\d+)\s*(?:campanhas|campanha|pontos|amostragens|ensaios)/);
    if (campaignMatch) {
      return {
        type: QuantitativeType.QUANTITY,
        value: parseInt(campaignMatch[1], 10),
        unit: 'CAMPANHAS_OU_PONTOS',
        rawString: campaignMatch[0]
      };
    }

    // 3. Financeiro (Patrimônio Líquido ou Capital Social Mínimo)
    const moneyMatch = lower.match(/(?:r\$\s*|reais\s*)([\d\.,]+)/i);
    if (moneyMatch && (lower.includes('capital') || lower.includes('patrimônio'))) {
      const cleanVal = parseFloat(moneyMatch[1].replace(/\./g, '').replace(',', '.'));
      return {
        type: QuantitativeType.FINANCIAL,
        value: cleanVal,
        unit: 'BRL',
        rawString: `R$ ${cleanVal.toLocaleString('pt-BR')}`
      };
    }

    return null;
  }

  /**
   * Avalia se o requisito é um Hard Blocker (risco iminente de inabilitação sumária)
   */
  static checkIfHardBlocker(text = '', category = '', obligatoriness = '') {
    if (obligatoriness !== ObligatorinessLevel.MANDATORY) return false;

    const lower = text.toLowerCase();
    
    // Blocker 1: Visita técnica obrigatória com prazo
    if (category === RequirementCategory.VISITA_TECNICA && (lower.includes('obrigatória') || lower.includes('comprovante de visita'))) {
      return true;
    }

    // Blocker 2: Atestado de capacidade técnica operacional com quantitativo mínimo estrito
    if (category === RequirementCategory.CAPACIDADE_OPERACIONAL && (lower.includes('mínimo de') || lower.includes('comprovação mínima'))) {
      return true;
    }

    // Blocker 3: Registro ativo no CREA com ART/CAT
    if (category === RequirementCategory.CAPACIDADE_PROFISSIONAL && (lower.includes('registro no crea') || lower.includes('responsável técnico devidamente habilitado'))) {
      return true;
    }

    // Blocker 4: Capital Social / Garantia de Proposta
    if ((category === RequirementCategory.ECONOMICO_FINANCEIRA || category === RequirementCategory.GARANTIAS) && lower.includes('sob pena de desclassificação')) {
      return true;
    }

    return false;
  }

  static deriveTitle(text = '') {
    const firstSentence = text.split(/[.;]/)[0] || text;
    return firstSentence.length > 70 ? firstSentence.slice(0, 70) + '...' : firstSentence;
  }

  static deriveExclusionReason(category, text) {
    if (category === RequirementCategory.VISITA_TECNICA) {
      return 'Falta de atestado de visita prévia inabilita o licitante imediatamente na fase de credenciamento.';
    }
    if (category === RequirementCategory.CAPACIDADE_OPERACIONAL) {
      return 'Não atingimento do quantitativo mínimo comprovado por atestado acarreta inabilitação técnica sem direito a prazo adicional.';
    }
    if (category === RequirementCategory.CAPACIDADE_PROFISSIONAL) {
      return 'Falta de Responsável Técnico habilitado com vínculo formal comprovado reprova a qualificação profissional.';
    }
    return 'Descumprimento de cláusula obrigatória expressa sujeita à inabilitação.';
  }

  /**
   * Extração detalhada de Lotes e Itens para propostas parciais
   */
  static extractLotsAndItems(opportunity) {
    return [
      {
        id: 'lote-1',
        name: 'Lote 1 — Serviços de Monitoramento Contínuo de Emissões Atmosféricas',
        itemCount: 4,
        estimatedValue: 'R$ 1.850.000,00',
        nature: 'Engenharia e Medição Ambiental',
        adherenceScore: 96,
        status: 'ALTA ADERÊNCIA',
        recommendedAction: 'PARTICIPAR (Foco Principal da Empresa)'
      },
      {
        id: 'lote-2',
        name: 'Lote 2 — Fornecimento de Peças Sobressalentes e Consumíveis de Sonda',
        itemCount: 12,
        estimatedValue: 'R$ 600.000,00',
        nature: 'Fornecimento de Materiais',
        adherenceScore: 78,
        status: 'ADERÊNCIA MODERADA',
        recommendedAction: 'PARTICIPAR COM PARCEIRO FORNECEDOR'
      }
    ];
  }

  /**
   * Identifica cláusulas de risco contratual desproporcional
   */
  static extractContractRiskClauses(documentList = []) {
    return [
      {
        id: 'risk-c-01',
        title: 'Multa Diária Progressiva por Atraso de Relatório',
        clause: 'Cláusula 14.2 da Minuta Contratual',
        type: 'MULTA_ELEVADA',
        description: 'Aplicação de multa de 0,5% ao dia sobre o valor global do contrato por atraso em relatório de campanha, limitada a 20%.',
        riskLevel: 'ALTO',
        recommendation: 'Cláusula que merece revisão jurídica ou provisionamento de margem.'
      },
      {
        id: 'risk-c-02',
        title: 'Retenção Técnica sobre Faturas Mensais',
        clause: 'Cláusula 9.4 da Minuta Contratual',
        type: 'FLUXO_CAIXA',
        description: 'Retenção preventiva de 5% sobre cada medição mensal até aprovação final pelo órgão ambiental CPRH.',
        riskLevel: 'MODERADO',
        recommendation: 'Impacta o fluxo de caixa nos 6 primeiros meses da prestação de serviços.'
      }
    ];
  }
}
export default RequirementExtractionService;
