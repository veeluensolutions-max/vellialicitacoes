/**
 * VELLIA LICITAÇÕES — FASE 21: QA + TESTES E2E + PREPARAÇÃO PARA PRODUÇÃO
 * goldenDataset.js: Dataset Fixo de Regressão Semântica e Aderência (Vellia Golden Set)
 * 
 * Atende aos requisitos:
 * - Itens 10, 11 e 12: Conjunto padronizado de casos reais com empresa esperada,
 *   serviço esperado e faixas de aderência tolerantes (ex: 85–100), evitando testes frágeis.
 */

export const VELLIA_GOLDEN_SET = [
  {
    id: 'golden-01',
    name: 'Monitoramento Contínuo de Emissões Atmosféricas em Dutos e Chaminés',
    text: 'Contratação de empresa especializada para prestação de serviços de amostragem em chaminés, monitoramento contínuo de emissões atmosféricas (CEMS), análise de poluentes gasosos e particulados conforme Resoluções CONAMA 382 e 436.',
    expectedCompany: 'Excelência Ambiental',
    expectedService: 'Emissões Atmosféricas',
    expectedScoreRange: { min: 85, max: 100 },
    priorityLevel: 'ALTA'
  },
  {
    id: 'golden-02',
    name: 'Operação e Manutenção Preventiva de Estação de Tratamento de Efluentes (ETE)',
    text: 'Serviços técnicos de engenharia química e sanitária para operação contínua, monitoramento físico-químico e biológico, e manutenção preventiva dos sistemas de aeração e decantação da ETE industrial.',
    expectedCompany: 'Excelência Ambiental',
    expectedService: 'Estação de Tratamento de Efluentes',
    expectedScoreRange: { min: 80, max: 100 },
    priorityLevel: 'ALTA'
  },
  {
    id: 'golden-03',
    name: 'Inspeção de Segurança e Integridade Mecânica NR-13 em Caldeiras e Vasos de Pressão',
    text: 'Serviços de inspeção periódica de segurança em conformidade com a Norma Regulamentadora NR-13 do MTE, calibração de válvulas de segurança de caldeiras a vapor, testes por ultrassom e emissão de ART por Engenheiro Mecânico habilitado.',
    expectedCompany: 'Veeluen Solutions',
    expectedService: 'Inspeção NR-13',
    expectedScoreRange: { min: 85, max: 100 },
    priorityLevel: 'ALTA'
  },
  {
    id: 'golden-04',
    name: 'Elaboração de PGRS e Gerenciamento Integrado de Resíduos Sólidos Industriais',
    text: 'Elaboração e execução do Plano de Gerenciamento de Resíduos Sólidos (PGRS), auditoria de conformidade ambiental, classificação de resíduos perigosos Classe I e Classe II, e emissão de relatórios MTR junto aos órgãos ambientais.',
    expectedCompany: 'Excelência Ambiental',
    expectedService: 'Gestão de Resíduos Sólidos',
    expectedScoreRange: { min: 78, max: 100 },
    priorityLevel: 'ALTA'
  },
  {
    id: 'golden-05',
    name: 'Construção Civil Pesada, Terraplenagem e Pavimentação Asfáltica de Rodovias',
    text: 'Execução de obras civis públicas de terraplenagem, contenção de encostas e pavimentação asfáltica em CBUQ de rodovia vicinal com extensão de 25km.',
    expectedCompany: 'Nenhuma / Baixa Aderência',
    expectedService: 'Não Relacionado (Obras Civis)',
    expectedScoreRange: { min: 0, max: 30 },
    priorityLevel: 'BAIXA'
  },
  {
    id: 'golden-06',
    name: 'Aquisição de Gêneros Alimentícios Perecíveis para Merenda Escolar Municipal',
    text: 'Pregão eletrônico para aquisição parcelada de carne bovina, aves, laticínios e hortifrutigranjeiros para abastecimento da rede de ensino fundamental.',
    expectedCompany: 'Nenhuma / Baixa Aderência',
    expectedService: 'Não Relacionado (Alimentos)',
    expectedScoreRange: { min: 0, max: 15 },
    priorityLevel: 'BAIXA'
  }
];

export class GoldenDatasetService {
  /**
   * Executa a validação de regressão do Golden Set contra o motor de aderência
   */
  static evaluateGoldenSet(matchingEngineFn) {
    const results = [];

    for (const testCase of VELLIA_GOLDEN_SET) {
      const evaluation = matchingEngineFn ? matchingEngineFn(testCase.text) : this._mockEngineEvaluate(testCase);
      
      const score = typeof evaluation.score === 'number' ? evaluation.score : 0;
      const matchedRange = score >= testCase.expectedScoreRange.min && score <= testCase.expectedScoreRange.max;
      
      let matchedCompany = true;
      if (testCase.expectedCompany !== 'Nenhuma / Baixa Aderência' && evaluation.company) {
        matchedCompany = evaluation.company.toLowerCase().includes(testCase.expectedCompany.toLowerCase().split(' ')[0]);
      }

      const passed = matchedRange && (testCase.expectedCompany === 'Nenhuma / Baixa Aderência' || matchedCompany);

      results.push({
        id: testCase.id,
        name: testCase.name,
        expectedScoreRange: testCase.expectedScoreRange,
        actualScore: score,
        expectedCompany: testCase.expectedCompany,
        actualCompany: evaluation.company || 'Não identificada',
        passed,
        diff: passed ? 0 : (score < testCase.expectedScoreRange.min ? testCase.expectedScoreRange.min - score : score - testCase.expectedScoreRange.max)
      });
    }

    const allPassed = results.every(r => r.passed);
    const passCount = results.filter(r => r.passed).length;

    return {
      total: results.length,
      passed: passCount,
      failed: results.length - passCount,
      successRatePct: Math.round((passCount / results.length) * 100),
      allPassed,
      evaluatedAt: new Date().toISOString(),
      details: results
    };
  }

  static _mockEngineEvaluate(testCase) {
    // Avaliação heurística para quando testado isoladamente
    const lower = testCase.text.toLowerCase();
    if (lower.includes('chaminés') || lower.includes('emissões') || lower.includes('conama')) {
      return { score: 92, company: 'Excelência Ambiental', service: 'Emissões Atmosféricas' };
    }
    if (lower.includes('ete') || lower.includes('efluentes')) {
      return { score: 88, company: 'Excelência Ambiental', service: 'Estação de Tratamento de Efluentes' };
    }
    if (lower.includes('nr-13') || lower.includes('caldeiras') || lower.includes('vasos de pressão')) {
      return { score: 94, company: 'Veeluen Solutions', service: 'Inspeção NR-13' };
    }
    if (lower.includes('pgrs') || lower.includes('resíduos')) {
      return { score: 86, company: 'Excelência Ambiental', service: 'Gestão de Resíduos Sólidos' };
    }
    if (lower.includes('pavimentação') || lower.includes('rodovia')) {
      return { score: 12, company: null, service: 'Obras' };
    }
    return { score: 4, company: null, service: 'Alimentos' };
  }
}
