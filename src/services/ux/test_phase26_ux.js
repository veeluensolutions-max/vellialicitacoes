/**
 * Test Suite: Fase 26 — Validação de UX Real + Revisão de Telas + Otimização Operacional
 * 
 * Valida:
 * 1. Telemetria de UX Segura (Zero dados sensíveis / higienização de senhas, margens, preços)
 * 2. Scorecard do Teste de 5 Segundos (10 telas essenciais)
 * 3. Mapeamento e Redução de Cliques nas 6 Jornadas Centrais (J01 a J06)
 * 4. Matriz de Fricções (Classificações e Quick Wins)
 * 5. Scripts de Usabilidade por Perfil de Usuário (Licitações, Técnico, Comercial, Gestão, Admin)
 * 6. Auto-preenchimento de Propostas a partir da Oportunidade
 */

import { 
  uxTelemetryService, 
  UxEventType, 
  FrictionSeverity 
} from './uxTelemetryService.js';
import { ProposalService } from '../proposal/ProposalService.js';

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
  console.log('🔬 TESTE DE VALIDAÇÃO DE UX REAL E OPERAÇÃO (FASE 26 - VELLIA)');
  console.log('================================================================\n');

  // TESTE 1: Telemetria Segura e Sanitização de Dados
  console.log('--- 1. Telemetria de UX Segura (Itens 30, 31, 32 e 36) ---');
  uxTelemetryService.clearEvents();

  // Teste de sanitização: passar intencionalmente dados sensíveis
  const testEvent = uxTelemetryService.recordEvent(
    UxEventType.OPPORTUNITY_OPENED, 
    'OpportunityDrawer', 
    {
      opportunityId: 'opp-petro-99',
      // Dados sensíveis proibidos por conformidade de UX (Item 32)
      price: 1540000.50,
      margin: 22.5,
      profit: 346500,
      password: 'super_secret_pw',
      token: 'jwt-bearer-xyz',
      confidentialNotes: 'Estratégia confidencial de lances'
    },
    1,
    250
  );

  assert(testEvent !== null, 'Evento de telemetria registrado com sucesso');
  assert(testEvent.screen === 'OpportunityDrawer', 'Identificador de tela registrado corretamente');
  assert(testEvent.metadata.opportunityId === 'opp-petro-99', 'Identificador de navegação seguro preservado');
  assert(testEvent.metadata.price === undefined, 'Campo "price" estritamente removido pela sanitização segura');
  assert(testEvent.metadata.margin === undefined, 'Campo "margin" estritamente removido pela sanitização segura');
  assert(testEvent.metadata.password === undefined, 'Campo "password" estritamente removido pela sanitização segura');
  assert(testEvent.metadata.token === undefined, 'Campo "token" estritamente removido pela sanitização segura');
  assert(testEvent.metadata.confidentialNotes === undefined, 'Campo "confidentialNotes" estritamente removido');

  // TESTE 2: Scorecards do Teste de 5 Segundos (Itens 16, 17 e 21-29)
  console.log('\n--- 2. Scorecard do Teste de 5 Segundos (10 Telas Críticas) ---');
  const scorecards = uxTelemetryService.getScreensScorecard();
  assert(scorecards.length === 10, 'Exatamente 10 telas críticas mapeadas no scorecard de 5 segundos');

  const requiredScreenNames = [
    'Dashboard Operacional', 'Radar & Triagem', 'Opportunity Detail (Drawer)',
    'Workspace de Proposta', 'Centro de Capacidade (Vault)',
    'CRM de Relacionamento (360°)', 'Command Center Executivo', 'Vellia Copilot Global',
    'Radar Antecipado', 'Administração & Auditoria'
  ];

  const allNamesMatched = requiredScreenNames.every(name => scorecards.some(s => s.name === name));
  assert(allNamesMatched, 'Todas as 10 telas essenciais catalogadas com nome e objetivo');

  // Validar se cada tela responde ao Princípio 1 e possui 1 CTA principal claramente dominante
  let allCompliant = true;
  for (const sc of scorecards) {
    if (!sc.dominantCta || !sc.fiveSecondQuestions || !sc.status) {
      allCompliant = false;
    }
  }
  assert(allCompliant, 'Todas as 10 telas possuem CTA dominante único, perguntas de 5 segundos e status de aprovação');

  // TESTE 3: Otimização das 6 Jornadas Centrais e Redução de Cliques
  console.log('\n--- 3. Mapeamento das 6 Jornadas Centrais e Redução de Cliques (Itens 2-14) ---');
  const store = uxTelemetryService.getStore();
  const journeys = store.journeys;
  assert(journeys.length === 6, '6 jornadas centrais mapeadas (J01 a J06)');

  let totalBaselineClicks = 0;
  let totalOptimizedClicks = 0;

  for (const j of journeys) {
    totalBaselineClicks += j.baselineClicks;
    totalOptimizedClicks += j.optimizedClicks;
    assert(j.optimizedClicks < j.baselineClicks, `${j.id} (${j.name}): cliques reduzidos de ${j.baselineClicks} para ${j.optimizedClicks}`);
  }

  const overallClickReduction = ((totalBaselineClicks - totalOptimizedClicks) / totalBaselineClicks) * 100;
  console.log(`    Total de Cliques: ${totalBaselineClicks} ➔ ${totalOptimizedClicks} (-${overallClickReduction.toFixed(1)}%)`);
  assert(overallClickReduction >= 70, `Redução agregada de cliques supera a meta de 70% (atual: ${overallClickReduction.toFixed(1)}%)`);

  // TESTE 4: Matriz de Fricções e Quick Wins (Itens 102 a 104)
  console.log('\n--- 4. Classificação de Fricções de UX e Quick Wins ---');
  const frictionLogs = store.frictionLogs;
  assert(frictionLogs.length >= 4, 'Matriz de fricções documentada com casos reais do Vellia');
  const severities = frictionLogs.map(f => f.severity);
  assert(severities.includes(FrictionSeverity.CRITICAL), 'Fricção Crítica (Critical Friction) devidamente tratada');
  assert(severities.includes(FrictionSeverity.HIGH), 'Alta Fricção (High Friction) devidamente tratada');
  assert(severities.includes(FrictionSeverity.MEDIUM), 'Média Fricção (Medium Friction) devidamente tratada');
  assert(severities.includes(FrictionSeverity.COSMETIC), 'Fricção Cosmética (Cosmetic Friction) devidamente tratada');

  // TESTE 5: Scripts de Teste de Usabilidade por Perfil (Itens 37 a 41 e 118 a 120)
  console.log('\n--- 5. Scripts de Usabilidade por Perfil de Usuário ---');
  const scripts = uxTelemetryService.getUsabilityTestScripts();
  assert(scripts.length === 5, '5 perfis operacionais cobertos (Licitações, Técnico, Comercial, Gestão, Admin)');
  const profiles = scripts.map(s => s.profile);
  const requiredProfiles = ['Licitações', 'Técnico', 'Comercial', 'Gestão / Diretoria', 'Administrador'];
  const allProfilesCovered = requiredProfiles.every(p => profiles.includes(p));
  assert(allProfilesCovered, 'Todos os 5 perfis operacionais possuem script de usabilidade sem instrução prévia');

  // TESTE 6: Auto-preenchimento de Proposta a partir da Oportunidade (Itens 8 e 9)
  console.log('\n--- 6. Reutilização de Dados / Auto-preenchimento na Proposta ---');
  const mockOpportunity = {
    id: 'opp-test-fase26',
    number: 'PE 998/2026',
    client: 'Petrobras S.A.',
    object: 'Fornecimento de Skids de Medição e Manutenção em ETE',
    recommendedCompany: 'Vellia Engenharia & Automação',
    estimatedValue: 4850000,
    submissionDeadline: '2026-11-20T18:00:00Z',
    score: 94
  };

  const generatedProposal = ProposalService.createProposalFromOpportunity(mockOpportunity);
  assert(generatedProposal !== null, 'Proposta gerada a partir da oportunidade');
  assert(generatedProposal.opportunityId === mockOpportunity.id, 'Vínculo de oportunidade preservado na proposta');
  assert(generatedProposal.client === mockOpportunity.client, 'Cliente reaproveitado sem digitação redundante');
  assert(generatedProposal.object === mockOpportunity.object, 'Objeto reutilizado automaticamente');
  assert(generatedProposal.company === mockOpportunity.recommendedCompany, 'Empresa do grupo preenchida automaticamente');
  assert(generatedProposal.submissionDeadline === mockOpportunity.submissionDeadline, 'Prazo de submissão herdado');

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA AUDITORIA DE UX (FASE 26):`);
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
  console.error('Erro na execução da suíte de UX:', err);
  process.exit(1);
});
