/**
 * TESTE DE VALIDAÇÃO DA FASE 12 — VELLIA LICITAÇÕES
 * Valida a integridade matemática e comportamental do motor de resultados,
 * inteligência de preços, concorrentes e assistente de performance.
 */

import { 
  ResultsIntelligenceService, 
  TenderOutcome, 
  LossCategory, 
  DataCompleteness 
} from './resultsIntelligenceService.js';

console.log('====================================================');
console.log('INICIANDO BATERIA DE TESTES — FASE 12 (RESULTADOS)');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Validar Inicialização de Dados Seed (Item 65)
ResultsIntelligenceService.initSeedData();
const allResults = ResultsIntelligenceService.listResults();
const allCompetitors = ResultsIntelligenceService.listCompetitors();

assert(allResults.length === 18, `Deve conter 18 resultados no seed histórico (encontrados: ${allResults.length})`);
assert(allCompetitors.length === 4, `Deve conter 4 concorrentes cadastrados oficialmente (encontrados: ${allCompetitors.length})`);

const wins = allResults.filter(r => r.outcome === TenderOutcome.GANHA);
const lossesByPrice = allResults.filter(r => r.outcome === TenderOutcome.PERDIDA && r.lossCategory === LossCategory.PRECO);
const ineligibilities = allResults.filter(r => r.outcome === TenderOutcome.INABILITADA);
const disqualifications = allResults.filter(r => r.outcome === TenderOutcome.DESCLASSIFICADA);

assert(wins.length === 5, `Deve conter exatamente 5 vitórias no histórico (encontradas: ${wins.length})`);
assert(lossesByPrice.length === 8, `Deve conter exatamente 8 derrotas por preço (encontradas: ${lossesByPrice.length})`);
assert(ineligibilities.length === 3, `Deve conter exatamente 3 perdas por inabilitação documental (encontradas: ${ineligibilities.length})`);
assert(disqualifications.length === 2, `Deve conter exatamente 2 desclassificações (encontradas: ${disqualifications.length})`);

// 2. Validar Métricas Executivas (Item 21, 22, 23, 39)
const metrics = ResultsIntelligenceService.getExecutiveMetrics('ALL');
console.log('\n--- Métricas Executivas Calculadas ---');
console.log(`Participações Válidas: ${metrics.validParticipations}`);
console.log(`Vitórias: ${metrics.totalWins}`);
console.log(`Win Rate: ${metrics.winRatePercent}%`);
console.log(`Taxa de Habilitação: ${metrics.qualificationRatePercent}%`);
console.log(`Valor Total Ganho: R$ ${metrics.totalWonValue.toLocaleString('pt-BR')}`);
console.log(`Ticket Médio Ganho: R$ ${metrics.avgWonTicket.toLocaleString('pt-BR')}`);
console.log(`Margem Média Ganha: ${metrics.avgWonMarginPercent}%\n`);

assert(metrics.totalWins === 5, 'Total de vitórias deve ser 5');
assert(metrics.validParticipations === 18, 'Participações válidas devem ser 18');
assert(metrics.winRatePercent === 27.8, `Win Rate deve ser 27.8% (encontrado: ${metrics.winRatePercent}%)`);
assert(metrics.qualificationRatePercent === 83.3, `Taxa de habilitação deve ser 83.3% (encontrado: ${metrics.qualificationRatePercent}%)`);
assert(metrics.totalWonValue === 2305000, `Valor ganho deve somar R$ 2.305.000 (encontrado: ${metrics.totalWonValue})`);
assert(metrics.avgWonTicket === 461000, `Ticket médio ganho deve ser R$ 461.000 (encontrado: ${metrics.avgWonTicket})`);
assert(metrics.avgWonMarginPercent === 24.7, `Margem média ganha deve ser 24.7% (encontrado: ${metrics.avgWonMarginPercent}%)`);

// 3. Validar Funil Comercial (Item 19 e 20)
const funnel = ResultsIntelligenceService.getCommercialFunnel('ALL');
assert(funnel.monitoredOpportunities === 1200, 'Funil: 1200 monitoradas');
assert(funnel.relevantOpportunities === 140, 'Funil: 140 relevantes');
assert(funnel.goDecisions === 42, 'Funil: 42 decisões GO');
assert(funnel.proposalsSent === 31, 'Funil: 31 propostas enviadas');
assert(funnel.validParticipations === 18, 'Funil: 18 participações com resultado final apurado');
assert(funnel.wins === 5, 'Funil: 5 vitórias');

// 4. Validar Análise de Motivos de Perda (Item 24)
const lossAnalysis = ResultsIntelligenceService.getLossReasonsAnalysis('ALL');
const priceLossReason = lossAnalysis.find(l => l.reason.includes('Preço'));
assert(priceLossReason && priceLossReason.count === 8, 'Motivo de perda "Preço" deve ter 8 ocorrências');
assert(priceLossReason && priceLossReason.percent === 61.5, `Percentual de perda por preço deve ser 61.5% (encontrado: ${priceLossReason?.percent}%)`);

// 5. Validar Inteligência de Preços e Benchmarks (Item 13, 14, 15, 35)
const priceIntelligence = ResultsIntelligenceService.getPriceIntelligence('ALL');
assert(priceIntelligence.benchmarks && priceIntelligence.benchmarks.length > 0, 'Deve gerar benchmarks por serviço');
const firstBenchmark = priceIntelligence.benchmarks[0];
assert(firstBenchmark && firstBenchmark.samplesCount > 0, 'Benchmark deve ter amostras');
assert(firstBenchmark && firstBenchmark.minPrice <= firstBenchmark.medianPrice, 'Benchmark: Min deve ser <= Mediana');
assert(firstBenchmark && firstBenchmark.medianPrice <= firstBenchmark.maxPrice, 'Benchmark: Mediana deve ser <= Max');

// 6. Validar Head-to-Head e Base de Concorrentes (Item 11, 45, 46)
const headToHeadList = ResultsIntelligenceService.getHeadToHead('ALL');
assert(headToHeadList.length === 4, 'Head-to-head deve conter os 4 concorrentes cadastrados');
const ambienteEVida = headToHeadList.find(c => c.name.includes('Ambiente & Vida') || c.tradeName.includes('Ambiente & Vida'));
assert(ambienteEVida && ambienteEVida.totalConfrontations > 0, `Ambiente & Vida deve ter confrontos registrados (encontrados: ${ambienteEVida?.totalConfrontations})`);

// 7. Validar Win Potential (Item 29, 30, 31, 32, 33)
const winPotentialETE = ResultsIntelligenceService.calculateWinPotential({
  primaryService: 'Operação de ETE e Efluentes Industriais',
  client: 'Petrobras - RNEST',
  location: 'Ipojuca - PE',
  score: 88
});

console.log('\n--- Cálculo do Win Potential ---');
console.log(`Score: ${winPotentialETE.score}/100`);
console.log(`Classificação: ${winPotentialETE.tier}`);
console.log(`Explicação: ${winPotentialETE.explanation}\n`);

assert(winPotentialETE.score >= 0 && winPotentialETE.score <= 100, 'Win Potential deve estar entre 0 e 100');
assert(winPotentialETE.tier.length > 0, 'Win Potential deve ter classificação textual (ex: Histórico Altamente Favorável)');
assert(winPotentialETE.explanation.length > 20, 'Win Potential deve conter explicação estruturada dos fatores');

// 8. Validar Assistente de Performance (Item 59 e 60)
const questions = [
  'Por que estamos perdendo?',
  'Qual serviço possui maior Win Rate?',
  'Qual concorrente aparece mais?',
  'Qual nossa faixa de preço mais competitiva?',
  'Em quais clientes temos melhor desempenho?',
  'Quais oportunidades deveríamos priorizar com base no histórico?'
];

console.log('--- Testando Perguntas Obrigatórias do Assistente de Performance ---');
questions.forEach(q => {
  const ans = ResultsIntelligenceService.askPerformanceAssistant(q);
  assert(ans && ans.reply.length > 50, `Assistente deve responder à pergunta: "${q}"`);
  assert(
    ans.reply.includes('[FATO]') && (ans.reply.includes('[CORRELAÇÃO]') || ans.reply.includes('[ESTIMATIVA]') || ans.reply.includes('[RECOMENDAÇÃO]')),
    `Resposta à pergunta "${q}" deve conter rigor técnico [FATO], [CORRELAÇÃO], [ESTIMATIVA] e [RECOMENDAÇÃO]`
  );
});

// 9. Validar Registro de Resultado Incompleto (Item 63 e 64)
const incompleteResult = ResultsIntelligenceService.saveResult({
  opportunityNumber: '7004999999',
  proposalId: 'PROP-7004999999-99',
  participatingCompany: 'Excelência Ambiental',
  client: 'Porto de Suape',
  service: 'Ruído Ambiental e Vibração',
  outcome: TenderOutcome.PERDIDA,
  ourPrice: 120000,
  winningCompany: null, // Desconhecido
  winningPrice: null // Desconhecido
}, 'Auditor de Teste');

assert(incompleteResult.completeness === DataCompleteness.INCOMPLETO, 'Resultado sem vencedor ou preço deve salvar como INCOMPLETO');
assert(incompleteResult.priceGapDisplay === 'Preço vencedor não identificado.', 'Sem preço vencedor não deve calcular gap numérico');

// 10. Validar Auditoria (Item 62)
const auditLogs = ResultsIntelligenceService.listAuditLogs();
assert(auditLogs.length > 0, 'Deve registrar log de auditoria após inserção de resultado');

console.log('\n====================================================');
console.log(`TODOS OS TESTES CONCLUÍDOS COM SUCESSO: ${passedTests}/${totalTests}`);
console.log('====================================================\n');
