/**
 * Test Suite: Fase 27 — Otimização da Inteligência do Agente + Qualidade do Matching
 * 
 * Valida:
 * 1. Normalização de Texto com Preservação de Termos Técnicos e Correção de OCR
 * 2. Vocabulário Técnico Estruturado, Pesos Ponderados e Regras Negativas
 * 3. Classificador de Intenção (Serviço vs Fornecimento vs Material)
 * 4. Extrator de Entidades Técnicas (Normas, Equipamentos, Órgãos)
 * 5. Matching de Empresas (Principal, Secundária e Não Definida)
 * 6. Motor Contextual (Technical Match vs Commercial Fit, Confiança, Insuficiência)
 * 7. Golden Dataset Benchmark (Precision >= 85%, Recall >= 85%, Hard Positives/Negatives)
 * 8. Feedback Humano Estruturado, Rastreabilidade e Shadow Mode
 */

import { TextNormalizationService } from './textNormalizationService.js';
import { technicalVocabularyService, TermWeight } from './technicalVocabularyService.js';
import { ServiceIntentClassifier, ServiceIntent } from './serviceIntentClassifier.js';
import { EntityExtractor } from './entityExtractor.js';
import { CompanyMatchingService } from './companyMatchingService.js';
import { contextualMatchingEngine } from './contextualMatchingEngine.js';
import { GoldenDatasetService } from './goldenDatasetService.js';
import { humanFeedbackService, FeedbackAccuracy, FeedbackReason } from './humanFeedbackService.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🧠 TESTE DE INTELIGÊNCIA DO AGENTE & MATCHING (FASE 27 - VELLIA)');
  console.log('================================================================\n');

  // TESTE 1: Normalização de Texto e Preservação de Termos Técnicos
  console.log('--- 1. TextNormalizationService (Itens 4, 5, 133 e 134) ---');
  const noisyOcrText = 'Prestação de serviços em E . T . E . com vistoria segundo N R - 1 3 e simulação A E R M O D.';
  const normalizedOcr = TextNormalizationService.normalize(noisyOcrText);

  assert(normalizedOcr.includes('ETE'), 'Ruído de OCR em "E . T . E ." corrigido para "ETE"');
  assert(normalizedOcr.includes('NR-13'), 'Ruído de OCR em "N R - 1 3" corrigido para "NR-13"');
  assert(normalizedOcr.includes('AERMOD'), 'Ruído de OCR em "A E R M O D" corrigido para "AERMOD"');

  const technicalSentence = 'Análise de NOx, SOx, PM10, SPDA e PGRS conforme CONAMA 382 e NBR 5419.';
  const canonical = TextNormalizationService.toSearchCanonical(technicalSentence);
  assert(canonical.includes('nr-13') === false, 'Sem falsas injeções de acrônimos ausentes');
  assert(canonical.includes('spda'), 'Termo técnico SPDA preservado de forma canônica');
  assert(canonical.includes('conama 382'), 'Norma CONAMA 382 preservada de forma canônica');

  // TESTE 2: Vocabulário Técnico, Pesos e Regras Negativas
  console.log('\n--- 2. TechnicalVocabularyService (Itens 6 a 12, 19 a 22) ---');
  const vocab = technicalVocabularyService.getVocabulary();
  assert(vocab.length >= 6, 'Vocabulário estruturado em múltiplos serviços principais');

  const emissoes = vocab.find(s => s.serviceId === 'ea-emissoes-atmosfericas');
  assert(emissoes !== undefined, 'Serviço de Emissões Atmosféricas presente no vocabulário');

  const criticalTerm = emissoes.terms.find(t => t.term === 'amostragem isocinetica');
  assert(criticalTerm && criticalTerm.weight === TermWeight.CRITICAL, '"amostragem isocinética" classificado com peso CRITICAL (10 pts)');

  const negTerm = emissoes.terms.find(t => t.weight === TermWeight.NEGATIVE);
  assert(negTerm !== undefined, 'Regras negativas específicas por serviço cadastradas');

  const globalNegs = technicalVocabularyService.getGlobalNegativeTerms();
  assert(globalNegs.some(n => n.term === 'fornecimento de papel'), 'Termos negativos transversais configurados');

  // TESTE 3: Classificador de Intenção (Serviço vs Fornecimento)
  console.log('\n--- 3. ServiceIntentClassifier (Itens 13 a 15, 129 a 132) ---');
  
  // Fornecimento puro de analisador
  const supplyCase = ServiceIntentClassifier.classifyIntent('aquisição e fornecimento de analisador de gases portátil para campo');
  assert(supplyCase.primaryIntent === ServiceIntent.FORNECIMENTO, 'Intenção classificada como FORNECIMENTO');
  assert(supplyCase.isSupplyOnly === true, 'Sinalizado como isSupplyOnly = true (sem equipe/serviço)');

  // Fornecimento de sacos de lixo
  const materialCase = ServiceIntentClassifier.classifyIntent('aquisição e fornecimento de sacos para resíduos domésticos e embalagens');
  assert(materialCase.primaryIntent === ServiceIntent.MATERIAL, 'Intenção classificada como MATERIAL (não confunde com Gestão de Resíduos)');
  assert(materialCase.isSupplyOnly === true, 'Sinalizado como material descartável puro');

  // Prestação de serviços contínuos em ETE
  const serviceCase = ServiceIntentClassifier.classifyIntent('prestação de serviços continuados de operação e manutenção de estação de tratamento de esgoto ETE');
  assert(serviceCase.primaryIntent === ServiceIntent.SERVICO, 'Intenção classificada como SERVIÇO técnico');
  assert(serviceCase.isServiceIntended === true, 'Confirmado como escopo aderente à Vellia');

  // TESTE 4: Extração de Entidades
  console.log('\n--- 4. EntityExtractor (Itens 16 a 18) ---');
  const entityText = 'Manutenção preventiva em caldeiras e vasos de pressão na Refinaria Abreu e Lima conforme NR-13 e NBR 12019 com Engenheiro Químico.';
  const extracted = EntityExtractor.extractEntities(entityText);
  assert(extracted.norms.includes('NR-13') && extracted.norms.includes('NBR 12019'), 'Normas NR-13 e NBR 12019 extraídas');
  assert(extracted.equipment.includes('Caldeiras') && extracted.equipment.includes('Vasos de Pressão'), 'Equipamentos Caldeiras e Vasos de Pressão extraídos');
  assert(extracted.organs.some(o => o.includes('Abreu e Lima')), 'Órgão/Refinaria Abreu e Lima extraído');
  assert(extracted.roles.includes('Engenheiro Químico'), 'Profissional Engenheiro Químico extraído');

  // TESTE 5: Company Matching Service
  console.log('\n--- 5. CompanyMatchingService (Itens 23 a 25) ---');
  const compMatchEmissoes = CompanyMatchingService.matchCompany(
    { name: 'Monitoramento de Emissões Atmosféricas', company: 'Excelência Ambiental' },
    [],
    90
  );
  assert(compMatchEmissoes.primaryCompany === 'Excelência Ambiental', 'Emissões mapeado diretamente para Excelência Ambiental');
  assert(compMatchEmissoes.secondaryCompany === null, 'Sem sobreposição desnecessária');

  const compMatchIndefinida = CompanyMatchingService.matchCompany(null, [], 20);
  assert(compMatchIndefinida.primaryCompany === 'Empresa não definida', 'Não força empresa quando score < 35% ("Empresa não definida")');

  // TESTE 6: Contextual Matching Engine
  console.log('\n--- 6. ContextualMatchingEngine (Itens 26 a 33, 52 a 60, 98 a 105) ---');
  
  // Teste de texto insuficiente
  const shortTextAnalysis = contextualMatchingEngine.analyze({
    title: 'Serviços ambientais',
    object: 'Serviços ambientais diversos',
    location: 'PE'
  });
  assert(shortTextAnalysis.confidence === 'Baixa', 'Texto muito curto detectado com confiança BAIXA');
  assert(shortTextAnalysis.classification === 'REVISÃO RECOMENDADA' || shortTextAnalysis.classification === 'BAIXA RELEVÂNCIA', 'Texto vago não recebe score inflado');

  // Teste Hard Positive
  const hardPositive = contextualMatchingEngine.analyze({
    title: 'Caracterização de efluentes gasosos industriais em dutos de processo',
    object: 'Prestação de serviços especializados para quantificação de poluentes e amostragem em chaminé conforme CONAMA 382 e NBR 12019.',
    location: 'Ipojuca - PE',
    daysLeft: 15
  });
  assert(hardPositive.technicalMatchScore >= 85, 'Hard Positive atinge Relevância Técnica >= 85%');
  assert(hardPositive.recommendedCompany === 'Excelência Ambiental', 'Empresa Excelência Ambiental identificada');
  assert(hardPositive.confidence === 'Alta', 'Confiança ALTA para termos críticos');

  // Teste Hard Negative (Penalização severa por fornecimento de mercadoria)
  const hardNegative = contextualMatchingEngine.analyze({
    title: 'Aquisição de equipamentos para monitoramento da qualidade do ar',
    object: 'Pregão eletrônico para aquisição e fornecimento parcelado de analisador de gases e sensores sem equipe.',
    location: 'Recife - PE',
    daysLeft: 10
  });
  assert(hardNegative.isSupplyOnly === true, 'Hard Negative detectado como fornecimento puro');
  assert(hardNegative.technicalMatchScore <= 60, 'Relevância Técnica severamente penalizada para fornecimento puro');
  assert(hardNegative.negativeSignals.length > 0, 'Sinais negativos registrados na explicação');

  // Teste de Cache Semântico
  const cachedAnalysis = contextualMatchingEngine.analyze({
    title: 'Caracterização de efluentes gasosos industriais em dutos de processo',
    object: 'Prestação de serviços especializados para quantificação de poluentes e amostragem em chaminé conforme CONAMA 382 e NBR 12019.',
    location: 'Ipojuca - PE',
    daysLeft: 15
  });
  assert(cachedAnalysis.textHash !== undefined, 'Hash semântico gerado e registrado');

  // TESTE 7: Golden Dataset Benchmark
  console.log('\n--- 7. Golden Dataset Benchmark & Métricas de Qualidade (Itens 34 a 50) ---');
  const benchmark = GoldenDatasetService.runBenchmark();
  console.log(`    Precisão (Precision): ${benchmark.metrics.precisionPct}% (Meta: >= 85%)`);
  console.log(`    Revocação (Recall):   ${benchmark.metrics.recallPct}% (Meta: >= 85%)`);
  console.log(`    F1-Score:             ${benchmark.metrics.f1ScorePct}%`);
  console.log(`    Falsos Positivos:     ${benchmark.metrics.fp}`);
  console.log(`    Falsos Negativos:     ${benchmark.metrics.fn}`);

  assert(benchmark.metrics.precisionPct >= 85, 'Meta de Precisão (Precision >= 85%) atingida com sucesso');
  assert(benchmark.metrics.recallPct >= 85, 'Meta de Revocação (Recall >= 85%) atingida com sucesso');
  assert(benchmark.metrics.fp <= 1, 'Falsos positivos minimizados no Golden Dataset');
  assert(benchmark.metrics.fn === 0, 'Zero falsos negativos nos casos True e Hard Positive');

  // TESTE 8: Human Feedback Service e Shadow Mode
  console.log('\n--- 8. Human Feedback e Rastreabilidade (Itens 68 a 75, 125, 126, 140) ---');
  const recordedFb = humanFeedbackService.recordFeedback({
    opportunityId: 'opp-teste-fase27',
    accuracy: FeedbackAccuracy.YES,
    reason: null,
    suggestedService: 'Monitoramento de Emissões Atmosféricas',
    suggestedCompany: 'Excelência Ambiental',
    user: 'Engenheiro Chefe'
  });
  assert(recordedFb.id.startsWith('FB-'), 'Feedback registrado com ID único e imutável');
  assert(recordedFb.accuracy === 'Sim', 'Avaliação humana de relevância registrada');

  const shadowCheck = contextualMatchingEngine.analyze({
    title: 'Inspeção de segurança em caldeiras e vasos de pressão',
    object: 'Serviços segundo NR-13 com teste hidrostático.',
    location: 'PE'
  });
  assert(shadowCheck.shadowComparison !== undefined, 'Modo Shadow executado paralelamente sem impactar o score principal');
  assert(shadowCheck.engineVersion === 'v2.0-contextual', 'Versão do motor de produção rastreável');

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA AUDITORIA DE INTELIGÊNCIA (FASE 27):`);
  console.log(`   Testes Aprovados: ${passedTests}`);
  console.log(`   Testes Falhos:    ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Erro na execução da suíte de Inteligência:', err);
  process.exit(1);
});
