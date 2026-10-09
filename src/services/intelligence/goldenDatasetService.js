/**
 * VELLIA LICITAÇÕES — FASE 27: OTIMIZAÇÃO DA INTELIGÊNCIA DO AGENTE
 * goldenDatasetService.js: Vellia Golden Dataset com Casos Adversariais e Reais,
 * Cálculo Formal de Métricas de Inteligência (Precision, Recall, F1, FPR, FNR) e Benchmarks.
 * (Itens 34 a 50, 76 a 81, 129 a 132, 136 a 137, 148 a 150)
 */

import { contextualMatchingEngine } from './contextualMatchingEngine.js';

export const GoldenCategory = {
  TRUE_POSITIVE: 'True Positive',
  TRUE_NEGATIVE: 'True Negative',
  HARD_POSITIVE: 'Hard Positive',
  HARD_NEGATIVE: 'Hard Negative',
  AMBIGUOUS: 'Ambiguous'
};

export const HumanRelevanceLabel = {
  RELEVANT: 'Relevant',
  NOT_RELEVANT: 'Not Relevant',
  PARTIALLY_RELEVANT: 'Partially Relevant'
};

export const VELLIA_GOLDEN_DATASET = [
  // 1. TRUE POSITIVE (Clássico de Emissões)
  {
    id: 'GOLD-01',
    category: GoldenCategory.TRUE_POSITIVE,
    title: 'Monitoramento contínuo de fontes estacionárias e amostragem em chaminés',
    object: 'Contratação de empresa especializada para prestação de serviços de monitoramento de fontes estacionárias e amostragem em chaminés industriais com laudos conforme CONAMA 382 e NBR 12019.',
    location: 'Ipojuca - PE',
    portal: 'Petronect',
    humanRelevanceLabel: HumanRelevanceLabel.RELEVANT,
    humanServiceLabel: 'Monitoramento de Emissões Atmosféricas',
    humanCompanyLabel: 'Excelência Ambiental',
    notes: 'Caso clássico de alta aderência técnica.'
  },

  // 2. HARD POSITIVE (Formulação indireta / sem palavras óbvias no título)
  {
    id: 'GOLD-02',
    category: GoldenCategory.HARD_POSITIVE,
    title: 'Caracterização físico-química de correntes efluentes gasosas em dutos de processo',
    object: 'Execução de serviços técnicos de caracterização de efluentes gasosos industriais, quantificação de material particulado e gases de combustão (NOx, SOx, CO2) em dutos e chaminés de processo.',
    location: 'Suape - PE',
    portal: 'Petronect',
    humanRelevanceLabel: HumanRelevanceLabel.RELEVANT,
    humanServiceLabel: 'Monitoramento de Emissões Atmosféricas',
    humanCompanyLabel: 'Excelência Ambiental',
    notes: 'Hard Positive: Formulação indireta sem termo "emissões" no título, mas objeto é 100% aderente.'
  },

  // 3. HARD NEGATIVE (Palavras ambientais mas intenção é fornecimento puro de equipamento)
  {
    id: 'GOLD-03',
    category: GoldenCategory.HARD_NEGATIVE,
    title: 'Aquisição de analisadores portáteis e sensores para monitoramento da qualidade do ar',
    object: 'Pregão eletrônico para aquisição e fornecimento de analisadores de gases e estações compactas sensorizadas de qualidade do ar ambiente, sem operador ou prestação de serviço.',
    location: 'Recife - PE',
    portal: 'Compras.gov.br',
    humanRelevanceLabel: HumanRelevanceLabel.NOT_RELEVANT,
    humanServiceLabel: 'Nenhum (Fornecimento de Equipamentos)',
    humanCompanyLabel: 'Empresa não definida',
    notes: 'Hard Negative: Contém palavras ambientais, mas trata de compra pura de equipamentos e não prestação de serviço.'
  },

  // 4. HARD NEGATIVE (Resíduos no texto, mas é apenas fornecimento de embalagens descartáveis)
  {
    id: 'GOLD-04',
    category: GoldenCategory.HARD_NEGATIVE,
    title: 'Fornecimento de sacos plásticos para acondicionamento de resíduos e lixeiras',
    object: 'Registro de preços para aquisição e fornecimento parcelado de sacos plásticos reforçados para resíduos e lixeiras hospitalares.',
    location: 'Cabo de Santo Agostinho - PE',
    portal: 'Compras.gov.br',
    humanRelevanceLabel: HumanRelevanceLabel.NOT_RELEVANT,
    humanServiceLabel: 'Nenhum (Material de Expediente)',
    humanCompanyLabel: 'Empresa não definida',
    notes: 'Hard Negative: Não deve ser classificado como gestão ou tratamento de resíduos.'
  },

  // 5. TRUE POSITIVE (Saneamento & ETE)
  {
    id: 'GOLD-05',
    category: GoldenCategory.TRUE_POSITIVE,
    title: 'Operação continuada e manutenção do sistema de tratamento de efluentes e esgoto (ETE)',
    object: 'Prestação de serviços contínuos de operação de estação de tratamento de esgoto (ETE) com sistema de lodos ativados e desaguamento, com equipe residente e laudos conforme CONAMA 430.',
    location: 'Ipojuca - PE',
    portal: 'Petronect',
    humanRelevanceLabel: HumanRelevanceLabel.RELEVANT,
    humanServiceLabel: 'Operação e Manutenção de ETE',
    humanCompanyLabel: 'Veeluen Solutions',
    notes: 'Caso clássico de saneamento e tratamento de efluentes da Veeluen.'
  },

  // 6. TRUE POSITIVE (Engenharia Mecânica & NR-13)
  {
    id: 'GOLD-06',
    category: GoldenCategory.TRUE_POSITIVE,
    title: 'Inspeção de segurança periódica em caldeiras a vapor e vasos de pressão segundo NR-13',
    object: 'Serviços de inspeção de integridade estrutural, medição de espessura por ultrassom, teste hidrostático e cálculo de PMTA em vasos de pressão e caldeiras conforme Norma Regulamentadora NR-13.',
    location: 'Santos - SP',
    portal: 'Petronect',
    humanRelevanceLabel: HumanRelevanceLabel.RELEVANT,
    humanServiceLabel: 'NR-13 (Caldeiras e Vasos de Pressão)',
    humanCompanyLabel: 'Veeluen Solutions',
    notes: 'Caso clássico de NR-13.'
  },

  // 7. HARD POSITIVE (NR-13 com ruído de OCR e formulação alternativa)
  {
    id: 'GOLD-07',
    category: GoldenCategory.HARD_POSITIVE,
    title: 'Avaliação de integridade em geradores de vapor sob pressão e reservatórios industriais',
    object: 'Serviços técnicos de ensaios não destrutivos, calibração de válvulas de alívio e segurança e reconstituição de prontuário em equipamentos pressurizados atendendo a N.R. 13.',
    location: 'Macaé - RJ',
    portal: 'Petronect',
    humanRelevanceLabel: HumanRelevanceLabel.RELEVANT,
    humanServiceLabel: 'NR-13 (Caldeiras e Vasos de Pressão)',
    humanCompanyLabel: 'Veeluen Solutions',
    notes: 'Hard Positive com ruído de OCR "N.R. 13" e termos indiretos.'
  },

  // 8. TRUE NEGATIVE (Alimentação e Catering)
  {
    id: 'GOLD-08',
    category: GoldenCategory.TRUE_NEGATIVE,
    title: 'Prestação de serviços de alimentação e fornecimento de refeições coletivas',
    object: 'Contratação de empresa para preparo e fornecimento diário de refeições coletivas e coffee break para colaboradores em refinaria.',
    location: 'Ipojuca - PE',
    portal: 'Petronect',
    humanRelevanceLabel: HumanRelevanceLabel.NOT_RELEVANT,
    humanServiceLabel: 'Nenhum',
    humanCompanyLabel: 'Empresa não definida',
    notes: 'True Negative: Edital com contratante Petrobras, mas segmento alimentício.'
  },

  // 9. TRUE NEGATIVE (Material de Expediente e Papelaria)
  {
    id: 'GOLD-09',
    category: GoldenCategory.TRUE_NEGATIVE,
    title: 'Fornecimento de papel A4 e materiais de expediente diversos',
    object: 'Aquisição de papel formato A4 e itens de papelaria para escritórios administrativos.',
    location: 'Recife - PE',
    portal: 'Compras.gov.br',
    humanRelevanceLabel: HumanRelevanceLabel.NOT_RELEVANT,
    humanServiceLabel: 'Nenhum',
    humanCompanyLabel: 'Empresa não definida',
    notes: 'True Negative puro.'
  },

  // 10. AMBIGUOUS (Texto excessivamente curto e vago)
  {
    id: 'GOLD-10',
    category: GoldenCategory.AMBIGUOUS,
    title: 'Serviços ambientais',
    object: 'Prestação de serviços ambientais diversos para manutenção da unidade.',
    location: 'PE',
    portal: 'Petronect',
    humanRelevanceLabel: HumanRelevanceLabel.PARTIALLY_RELEVANT,
    humanServiceLabel: 'Serviço Não Identificado (Dados Insuficientes)',
    humanCompanyLabel: 'Empresa não definida',
    notes: 'Ambiguous: Descrição com dados insuficientes (confiança deve ser BAIXA).'
  }
];

export class GoldenDatasetService {
  /**
   * Executa o benchmark completo do Golden Dataset contra o motor contextual ativo
   */
  static runBenchmark() {
    let tp = 0; // Verdadeiro Positivo
    let tn = 0; // Verdadeiro Negativo
    let fp = 0; // Falso Positivo
    let fn = 0; // Falso Negativo
    const itemResults = [];

    for (const sample of VELLIA_GOLDEN_DATASET) {
      const analysis = contextualMatchingEngine.analyze({
        title: sample.title,
        object: sample.object,
        description: sample.object,
        location: sample.location,
        forcedPortal: sample.portal
      });

      // Critério de predição do modelo: relevante se Technical Match Score >= 65%
      const modelPredictedRelevant = analysis.technicalMatchScore >= 65;
      const isGroundTruthRelevant = sample.humanRelevanceLabel === HumanRelevanceLabel.RELEVANT;

      let matchType = '';
      if (modelPredictedRelevant && isGroundTruthRelevant) {
        tp++;
        matchType = 'TP';
      } else if (!modelPredictedRelevant && !isGroundTruthRelevant) {
        tn++;
        matchType = 'TN';
      } else if (modelPredictedRelevant && !isGroundTruthRelevant) {
        fp++;
        matchType = 'FP';
      } else {
        fn++;
        matchType = 'FN';
      }

      itemResults.push({
        id: sample.id,
        category: sample.category,
        title: sample.title,
        groundTruth: sample.humanRelevanceLabel,
        modelScore: analysis.technicalMatchScore,
        modelConfidence: analysis.confidence,
        modelPredictedService: analysis.primaryServiceName,
        modelPredictedCompany: analysis.recommendedCompany,
        modelPredictedRelevant,
        matchType,
        passed: (matchType === 'TP' || matchType === 'TN')
      });
    }

    // Cálculos de métricas estatísticas padrão (Itens 46 a 49)
    const precision = (tp + fp) > 0 ? (tp / (tp + fp)) * 100 : 0;
    const recall = (tp + fn) > 0 ? (tp / (tp + fn)) * 100 : 0;
    const f1Score = (precision + recall) > 0 ? (2 * (precision * recall)) / (precision + recall) : 0;
    const falsePositiveRate = (fp + tn) > 0 ? (fp / (fp + tn)) * 100 : 0;
    const falseNegativeRate = (fn + tp) > 0 ? (fn / (fn + tp)) * 100 : 0;
    const accuracy = ((tp + tn) / VELLIA_GOLDEN_DATASET.length) * 100;

    return {
      totalSamples: VELLIA_GOLDEN_DATASET.length,
      metrics: {
        tp,
        tn,
        fp,
        fn,
        precisionPct: Number(precision.toFixed(1)),
        recallPct: Number(recall.toFixed(1)),
        f1ScorePct: Number(f1Score.toFixed(1)),
        falsePositiveRatePct: Number(falsePositiveRate.toFixed(1)),
        falseNegativeRatePct: Number(falseNegativeRate.toFixed(1)),
        accuracyPct: Number(accuracy.toFixed(1))
      },
      qualityGoalsMet: {
        precisionTargetMet: precision >= 85,
        recallTargetMet: recall >= 85
      },
      itemResults
    };
  }

  /**
   * Retorna os exemplos do Golden Dataset
   */
  static getDataset() {
    return VELLIA_GOLDEN_DATASET;
  }
}
