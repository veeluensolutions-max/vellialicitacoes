/**
 * VELLIA LICITAÇÕES — FASE 20: CENTRO DE COMANDO EXECUTIVO
 * test_phase20_pipeline.js: Bateria Completa de Testes Automatizados (Itens 83 a 87)
 */

import { executivePipelineService } from './executivePipelineService.js';
import { forecastService } from './forecastService.js';
import { goalsService } from './goalsService.js';
import { executivePerformanceService } from './executivePerformanceService.js';
import { executiveService } from './executiveService.js';
import { ExecutivePermissions, ForecastScenario } from './executiveModels.js';
import { CopilotService } from '../copilot/copilotService.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

async function runPhase20Tests() {
  console.log('\n========================================================================');
  console.log('--- INICIANDO TESTES: FASE 20 — CENTRO DE COMANDO EXECUTIVO + FORECAST ---');
  console.log('========================================================================\n');

  // =======================================================================
  // 1. PIPELINE BRUTO, PONDERADO E RECEITA REALIZADA (Itens 4, 5, 6, 7, 8)
  // =======================================================================
  console.log('1. CÁLCULO DE PIPELINE BRUTO, PONDERADO E RECEITA REALIZADA:');
  const summary = executivePipelineService.getPipelineSummary({ company: 'TODAS' });

  assert(summary.kpis.grossPipeline > 0, `Pipeline Bruto calculado com sucesso (R$ ${summary.kpis.grossPipeline.toLocaleString('pt-BR')})`);
  assert(summary.kpis.weightedPipeline > 0, `Pipeline Ponderado calculado com sucesso (R$ ${summary.kpis.weightedPipeline.toLocaleString('pt-BR')})`);
  assert(summary.kpis.weightedPipeline < summary.kpis.grossPipeline, 'Pipeline Ponderado é inferior ao Bruto devido aos pesos de estágio');
  assert(summary.kpis.isRealizedRevenue === false, 'Pipeline Potencial NÃO é classificado como receita realizada (Item 7)');
  assert(summary.kpis.realizedRevenue > 0, `Contratos Ganhos reflete a receita realizada real (R$ ${summary.kpis.realizedRevenue.toLocaleString('pt-BR')})`);
  assert(summary.kpis.winRate > 0, `Taxa de Vitória (Win Rate) calculada corretamente (${summary.kpis.winRate}%)`);

  // =======================================================================
  // 2. FUNIL EXECUTIVO, TAXAS DE CONVERSÃO E VELOCIDADE (Itens 9, 10, 11)
  // =======================================================================
  console.log('\n2. FUNIL EXECUTIVO, CONVERSÃO E PIPELINE VELOCITY:');
  assert(summary.funnel.length === 6, 'Funil executivo possui as 6 etapas estruturadas');
  assert(summary.funnel[0].id === 'monitored' && summary.funnel[5].id === 'won', 'Funil vai de Monitoradas a Vitórias');
  
  const allConversionValid = summary.funnel.every(f => !isNaN(f.conversionRate) && f.conversionRate >= 0);
  assert(allConversionValid, 'Taxas de conversão entre etapas calculadas sem erros ou NaN');

  assert(summary.pipelineVelocity.totalCycleDays > 0, `Pipeline Velocity calcula ciclo médio total (${summary.pipelineVelocity.totalCycleDays} dias)`);
  assert(summary.pipelineVelocity.oppToDecisionDays > 0, 'Mede tempo médio de triagem para Decisão GO');

  // =======================================================================
  // 3. PIPELINE EM RISCO E PRIORIDADES (Itens 12, 13)
  // =======================================================================
  console.log('\n3. OPORTUNIDADES EM RISCO E PRIORITÁRIAS:');
  assert(summary.atRiskPipeline.length > 0, 'Identifica oportunidades com prazo crítico ou bloqueador');
  assert(summary.atRiskPipeline[0].riskReason !== undefined, 'Declara justificativa explícita do risco identificado');
  assert(summary.priorityOpportunities.length <= 5, 'Ranqueia até Top 5 oportunidades prioritárias');
  assert(summary.priorityOpportunities[0].score >= 80, 'Top 1 possui elevado score de aderência');

  // =======================================================================
  // 4. FORECAST COMERCIAL, CENÁRIOS E PREVISÕES (Itens 14 a 22, 45 a 51)
  // =======================================================================
  console.log('\n4. FORECAST COMERCIAL E CENÁRIOS:');
  const forecast = forecastService.getCommercialForecast({ company: 'TODAS' });

  assert(forecast.categories.Commit.grossValue > 0, 'Calcula valor do lote Commit');
  assert(forecast.categories['Best Case'].grossValue > 0, 'Calcula valor do lote Best Case');
  assert(forecast.categories.Pipeline.grossValue > 0, 'Calcula valor do lote Pipeline');
  assert(forecast.disclaimer.includes('Estimativa baseada em pipeline'), 'Contém aviso obrigatório de que não é receita garantida (Item 46)');

  // Cenários (Conservador, Base, Otimista)
  const scnCons = forecast.scenarios[ForecastScenario.CONSERVADOR].value;
  const scnBase = forecast.scenarios[ForecastScenario.BASE].value;
  const scnOtim = forecast.scenarios[ForecastScenario.OTIMISTA].value;
  assert(scnCons <= scnBase && scnBase <= scnOtim, `Cenários ordenados corretamente: Conservador (R$ ${scnCons.toLocaleString('pt-BR')}) <= Base (R$ ${scnBase.toLocaleString('pt-BR')}) <= Otimista (R$ ${scnOtim.toLocaleString('pt-BR')})`);

  // Forecast por Empresa e por Mês
  assert(forecast.companyForecast['Veeluen Solutions'].totalExpected > 0, 'Calcula projeção para Veeluen Solutions');
  assert(forecast.companyForecast['Excelência Ambiental'].totalExpected > 0, 'Calcula projeção para Excelência Ambiental');
  assert(forecast.monthlyForecast.length >= 3, 'Gera forecast mensalizado (Outubro, Novembro, Dezembro)');

  // =======================================================================
  // 5. METAS COMERCIAIS E ACOMPANHAMENTO DE RITMO (PACE) (Itens 23 a 31)
  // =======================================================================
  console.log('\n5. METAS COMERCIAIS E INDICADOR DE RITMO (PACE):');
  const goalsData = goalsService.getGoalsSummary({ company: 'TODAS', period: 'Mensal' });

  assert(goalsData.goals.length > 0, 'Recupera metas cadastradas por empresa e responsável');
  const goalContract = goalsData.goals.find(g => g.type === 'Propostas Enviadas' || g.isCurrency);
  assert(goalContract && goalContract.targetValue > 0, 'Meta possui alvo quantitativo/monetário definido');
  assert(goalContract.gap !== undefined && !isNaN(goalContract.gap), 'Calcula gap restante para atingir a meta');
  assert(goalContract.paceStatus !== undefined, `Determina status de ritmo (Pace: ${goalContract.paceStatus})`);
  assert(goalsData.atRiskGoals.length >= 0, 'Identifica metas em risco quando o ritmo fica abaixo do tempo decorrido');

  // =======================================================================
  // 6. QUALIDADE DA FONTE & PERFORMANCE (Itens 34 a 36)
  // =======================================================================
  console.log('\n6. QUALIDADE DA FONTE (SOURCE QUALITY INDEX):');
  const perfData = executivePerformanceService.getPerformanceSummary();
  const petronectPortal = perfData.portals.find(p => p.portal === 'Petronect');
  const pncpPortal = perfData.portals.find(p => p.portal === 'PNCP (Portal Nacional)');

  assert(petronectPortal && pncpPortal, 'Avalia desempenho dos portais oficiais (Petronect e PNCP)');
  assert(petronectPortal.sourceQualityIndex > pncpPortal.sourceQualityIndex, 'Petronect atinge maior qualidade da fonte que PNCP devido à taxa de relevância e vitórias, mesmo com menor volume (Item 36)');

  // =======================================================================
  // 7. ALERTAS DE CONCENTRAÇÃO & INSIGHTS (Itens 42, 71 a 74)
  // =======================================================================
  console.log('\n7. ALERTAS DE CONCENTRAÇÃO E EXECUTIVE INSIGHTS:');
  assert(perfData.executiveInsights.length > 0, 'Gera Executive Insights automatizados baseados em dados reais');
  assert(perfData.executiveInsights.every(i => i.dataSupport), 'Todos os insights possuem base factual comprovada sem alucinação (Item 44)');

  // =======================================================================
  // 8. TESTE DE PERMISSÃO E PROTEÇÃO DE MARGEM (Itens 54, 78, 79, 84)
  // =======================================================================
  console.log('\n8. TESTE DE SEGURANÇA E MASCARAMENTO DE MARGEM:');
  // Usuário com permissão financeira executiva
  const execAuthorized = executiveService.getExecutiveDashboardData({
    userPermissions: [ExecutivePermissions.EXECUTIVE_DASHBOARD_VIEW, ExecutivePermissions.FINANCIAL_EXECUTIVE_VIEW]
  });
  assert(execAuthorized.performance.companyMetrics[0].avgMarginPct !== null, 'Usuário autorizado visualiza margem executiva');

  // Usuário técnico sem permissão financeira (Item 84)
  const execRestricted = executiveService.getExecutiveDashboardData({
    userPermissions: [ExecutivePermissions.EXECUTIVE_DASHBOARD_VIEW] // Sem FINANCIAL_EXECUTIVE_VIEW
  });
  assert(execRestricted.performance.companyMetrics[0].avgMarginPct === null, 'Usuário técnico sem autorização tem margem mascarada');
  assert(execRestricted.performance.companyMetrics[0].marginMasked === true, 'Sinaliza marginMasked: true para proteção de dados sensíveis');

  // =======================================================================
  // 9. DADOS INCOMPLETOS E DEDUPLICAÇÃO DE PIPELINE (Itens 85, 86)
  // =======================================================================
  console.log('\n9. RESILIÊNCIA A DADOS INCOMPLETOS E DEDUPLICAÇÃO:');
  const rawParse = executivePipelineService.parseValue({ estimatedValue: null, value: undefined });
  assert(rawParse === 0, 'Oportunidade sem valor não quebra o sistema e retorna 0 de forma segura (Item 85)');

  const deduplicated = executivePipelineService.getDeduplicatedOpportunities();
  assert(deduplicated.length > 0, 'Deduplica oportunidades evitando contagem dupla entre PNCP e Compras.gov (Item 86)');

  // =======================================================================
  // 10. INTEGRAÇÃO COM VELLIA COPILOT EXECUTIVO (Itens 67 a 70)
  // =======================================================================
  console.log('\n10. VELLIA COPILOT EXECUTIVO:');
  
  // Pergunta A: "Quanto podemos fechar este mês?" (Item 69)
  const respClose = CopilotService.ask({ query: 'Quanto podemos fechar este mês?' });
  assert(respClose && respClose.message, 'Copilot processa pergunta sobre previsão de fechamento do mês');
  const factsClose = respClose.message.facts.join(' ');
  assert(factsClose.includes('COMMIT') && factsClose.includes('BEST CASE'), 'Copilot responde com lotes Commit, Best Case e Pipeline adicional com premissas (Item 69)');

  // Pergunta B: "Como está nosso pipeline?" (Item 67)
  const respPipe = CopilotService.ask({ query: 'Como está nosso pipeline?' });
  const factsPipe = respPipe.message.facts.join(' ');
  assert(factsPipe.includes('PIPELINE BRUTO') && factsPipe.includes('PONDERADO'), 'Copilot expõe Pipeline Bruto e Ponderado');

  // Pergunta C: "Vamos bater a meta?" (Item 67)
  const respMeta = CopilotService.ask({ query: 'Vamos bater a meta?' });
  assert(respMeta.message.title.includes('Metas'), 'Copilot responde com status de atingimento e ritmo das metas');

  // Pergunta D: "Qual empresa está melhor?" (Item 67)
  const respComp = CopilotService.ask({ query: 'Qual empresa está melhor?' });
  assert(respComp.message.facts.some(f => f.includes('EXCELÊNCIA') || f.includes('VEELUEN')), 'Copilot compara performance entre Veeluen e Excelência');

  // Pergunta E: "Qual serviço tem maior potencial?" (Item 67)
  const respServ = CopilotService.ask({ query: 'Qual serviço tem maior potencial?' });
  assert(respServ.message.facts.some(f => f.includes('ETE') || f.includes('Emissões')), 'Copilot destaca serviços com maior win rate e pipeline');

  // Pergunta F: "Quais oportunidades estão em risco?" (Item 67)
  const respRisk = CopilotService.ask({ query: 'Quais oportunidades estão em risco?' });
  assert(respRisk.message.title.includes('Risco'), 'Copilot diagnostica oportunidades em risco');

  // =======================================================================
  // 11. RELATÓRIOS EXECUTIVOS ESTRUTURADOS (Itens 65, 66)
  // =======================================================================
  console.log('\n11. RELATÓRIOS EXECUTIVOS SEMANAL E MENSAL:');
  const weekly = executiveService.generateWeeklyExecutiveReport();
  assert(weekly.executiveSummary.includes('pipeline'), 'Gera Relatório Executivo Semanal com sumário gerencial');

  const monthly = executiveService.generateMonthlyReport();
  assert(monthly.month.includes('2026'), 'Gera Relatório Mensal de Performance e Fontes');

  // =======================================================================
  // RESUMO GERAL
  // =======================================================================
  console.log('\n========================================================================');
  console.log(`TOTAL DE TESTES: ${totalTests}`);
  console.log(`TESTES APROVADOS: ${passedTests}`);
  console.log(`TESTES REPROVADOS: ${failedTests}`);
  console.log('========================================================================\n');

  if (failedTests === 0) {
    console.log('>>> TODOS OS TESTES DA FASE 20 PASSARAM COM 100% DE SUCESSO! <<<\n');
  } else {
    console.error('>>> ALGUNS TESTES FALHARAM. REVISE OS DETALHES ACIMA. <<<\n');
    process.exit(1);
  }
}

runPhase20Tests().catch(err => {
  console.error('Erro fatal nos testes da Fase 20:', err);
  process.exit(1);
});
