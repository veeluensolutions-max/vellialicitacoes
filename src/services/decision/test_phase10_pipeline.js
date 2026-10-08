// Mock de localStorage para ambiente de terminal Node.js
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

import { 
  DecisionService, 
  DecisionTier, 
  NoGoReason, 
  RiskSeverity, 
  RiskCategory,
  OperationalEffortTier,
  CommercialViabilityTier 
} from './decisionService.js';
import { priorityOpportunities } from '../../data/mockData.js';

console.log('=== INICIANDO BATERIA DE TESTES — FASE 10 (GO/NO-GO INTELIGENTE + MATRIZ DE RISCO) ===\n');

// 1. Validar Pesos Configuráveis (Itens 3 e 52) — Soma deve ser exatamente 100%
console.log('1. Verificando Pesos Multicritério das 6 Dimensões:');
const weights = DecisionService.getWeights();
const sumWeights = weights.aderenciaTecnica +
                   weights.capacidadeHabilitacao +
                   weights.viabilidadeComercial +
                   weights.risco +
                   weights.prazo +
                   weights.interesseEstrategico;

console.log(` - Aderência Técnica: ${weights.aderenciaTecnica}%`);
console.log(` - Capacidade Habilitação: ${weights.capacidadeHabilitacao}%`);
console.log(` - Viabilidade Comercial: ${weights.viabilidadeComercial}%`);
console.log(` - Risco: ${weights.risco}%`);
console.log(` - Prazo: ${weights.prazo}%`);
console.log(` - Interesse Estratégico: ${weights.interesseEstrategico}%`);
console.log(` - Soma Total: ${sumWeights}% -> ${sumWeights === 100 ? '✅ 100% VÁLIDO' : '❌ INVÁLIDO'}`);

if (sumWeights !== 100) {
  console.error('ERRO: A soma dos pesos multicritério não é 100%!');
  process.exit(1);
}

// 2. Testar Cálculo do Decision Score e Faixas de Decisão (Itens 2, 4, 5)
console.log('\n2. Verificando Cálculo de Decision Score e Faixas:');
const sampleOpp = priorityOpportunities[0]; // RNEST Petrobras
const decision = DecisionService.calculateDecision(sampleOpp);

console.log(` - Oportunidade: #${sampleOpp.number} ("${sampleOpp.title}")`);
console.log(` - Decision Score: ${decision.decisionScore}%`);
console.log(` - Recomendação: ${decision.recommendationTier} (${decision.badgeClass})`);
console.log(` - Parecer da IA: ${decision.recommendationReason.substring(0, 80)}...`);

if (decision.decisionScore < 0 || decision.decisionScore > 100) {
  console.error('ERRO: Decision Score fora do intervalo 0-100%!');
  process.exit(1);
}

// 3. Testar Matriz de Risco 5x5 e Heatmap (Itens 8, 9, 10, 11, 12, 14, 15, 16)
console.log('\n3. Verificando Matriz de Risco 5x5:');
const risks = decision.risks;
console.log(` - Total de Riscos Avaliados: ${risks.risks.length}`);
console.log(` - Risk Score Global: ${risks.riskScore}% (${risks.riskTier})`);
console.log(` - Top 5 Riscos Identificados:`);
risks.top5.forEach((r, idx) => {
  console.log(`   ${idx + 1}. [${r.category}] ${r.title} | P:${r.probabilidade} × I:${r.impacto} = ${r.score} (${r.classification}) | Resp: ${r.responsavel}`);
  if (r.score !== r.probabilidade * r.impacto) {
    console.error(`ERRO: Cálculo de risco incorreto para ${r.id}!`);
    process.exit(1);
  }
});

// 4. Testar Viabilidade Comercial e 3 Cenários (Itens 17, 19, 20, 21, 22)
console.log('\n4. Verificando Viabilidade Comercial & 3 Cenários:');
const commercial = decision.commercial;
console.log(` - Tem Valor Definido: ${commercial.temValorDefinido ? 'SIM' : 'NÃO'}`);
console.log(` - Valor Estimado: ${commercial.valorEstimadoFormatado}`);
if (commercial.temValorDefinido) {
  console.log(`   * Cenário Conservador: Custo ${commercial.cenarioConservador.custoFormatado} | Margem: ${commercial.cenarioConservador.margemPercentual}% (${commercial.cenarioConservador.margemFormatada})`);
  console.log(`   * Cenário Provável: Custo ${commercial.cenarioProvavel.custoFormatado} | Margem: ${commercial.cenarioProvavel.margemPercentual}% (${commercial.cenarioProvavel.margemFormatada})`);
  console.log(`   * Cenário Otimista: Custo ${commercial.cenarioOtimista.custoFormatado} | Margem: ${commercial.cenarioOtimista.margemPercentual}% (${commercial.cenarioOtimista.margemFormatada})`);
}

// 5. Testar Bloqueadores Críticos (Itens 36 e 37)
console.log('\n5. Verificando Bloqueador Crítico (Regra de GO Bloqueado):');
const expiredOpp = {
  ...sampleOpp,
  id: 'opp-teste-expirada',
  daysLeft: 0 // Prazo encerrado
};
const decisionExpired = DecisionService.calculateDecision(expiredOpp);
console.log(` - Oportunidade com prazo encerrado resultou em: ${decisionExpired.recommendationTier}`);
if (decisionExpired.recommendationTier !== DecisionTier.GO_BLOQUEADO) {
  console.error('ERRO: Oportunidade com bloqueador crítico deveria retornar GO BLOQUEADO!');
  process.exit(1);
}
console.log(' - Bloqueador Crítico identificado com sucesso: ✅ APROVADO');

// 6. Testar Deliberação Humana e Histórico Imutável (Itens 6, 38, 39, 44, 45)
console.log('\n6. Testar Registro de Decisão Humana & Histórico:');
// Registrar primeiro GO
const dec1 = DecisionService.saveHumanDecision('7004289123', {
  decision: 'GO',
  justificativa: 'Escopo 100% aderente com equipe disponível.',
  decisionScore: 92,
  recommendationTier: 'GO PRIORITÁRIO'
}, 'Dr. Roberto Albuquerque');

console.log(` - Decisão 1 registrada: ${dec1.currentDecision} por ${dec1.lastAuthor}`);

// Alterar para NO-GO com motivo padronizado
const dec2 = DecisionService.saveHumanDecision('7004289123', {
  decision: 'NO-GO',
  justificativa: 'Análise de laboratório apontou inviabilidade de prazo.',
  noGoReason: NoGoReason.PRAZO_INVIAVEL,
  decisionScore: 92,
  recommendationTier: 'GO PRIORITÁRIO'
}, 'Mariana Castro');

console.log(` - Decisão 2 registrada: ${dec2.currentDecision} (Motivo: ${dec2.noGoReason}) por ${dec2.lastAuthor}`);
console.log(` - Quantidade de registros na linha do tempo: ${dec2.history.length} -> ${dec2.history.length === 2 ? '✅ HISTÓRICO PRESERVADO' : '❌ ERRO'}`);

// 7. Testar Funil Comercial e Métricas Gerenciais (Itens 40 a 43, 46)
console.log('\n7. Verificando Funil Comercial & Métricas:');
const metrics = DecisionService.getManagementMetrics(priorityOpportunities);
console.log(` - Oportunidades Analisadas: ${metrics.totalAnalisadas}`);
console.log(` - Taxa de GO: ${metrics.taxaGo}%`);
console.log(` - Funil: Oportunidades(${metrics.funnel.oportunidades}) -> GO(${metrics.funnel.goAprovado}) -> Propostas(${metrics.funnel.propostasEnviadas}) -> Vitórias(${metrics.funnel.vitoriasContrato})`);
console.log(` - Decisões da Semana: ${metrics.decisoesDaSemana.total} total (${metrics.decisoesDaSemana.go} GO, ${metrics.decisoesDaSemana.goPendencias} GO c/ Pendências, ${metrics.decisoesDaSemana.noGo} NO-GO)`);

// 8. Testar IA Gerencial (Assistente de Decisão com Fato/Estimativa/Recomendação) (Itens 49 e 50)
console.log('\n8. Testar Assistente de Decisão com IA Gerencial:');
const q1 = DecisionService.askDecisionAssistant('Quais oportunidades devemos priorizar hoje?');
console.log(` - Pergunta 1: "Quais oportunidades devemos priorizar hoje?"\n${q1.answer}\n`);

const q2 = DecisionService.askDecisionAssistant('Qual possui melhor relação risco x retorno?');
console.log(` - Pergunta 2: "Qual possui melhor relação risco x retorno?"\n${q2.answer}\n`);

const q3 = DecisionService.askDecisionAssistant('Por que recebemos NO-GO?');
console.log(` - Pergunta 3: "Por que recebemos NO-GO?"\n${q3.answer}\n`);

if (!q1.answer.includes('[FATO]') || !q1.answer.includes('[ESTIMATIVA]') || !q1.answer.includes('[RECOMENDAÇÃO]')) {
  console.error('ERRO: IA Gerencial não aplicou a separação estrita Fato / Estimativa / Recomendação!');
  process.exit(1);
}

console.log('=== TODOS OS TESTES DA FASE 10 PASSARAM COM 100% DE SUCESSO! ===');
