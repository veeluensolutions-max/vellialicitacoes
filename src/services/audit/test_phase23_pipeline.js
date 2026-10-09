/**
 * VELLIA LICITAÇÕES — FASE 23: SUÍTE DE TESTES E VALIDAÇÃO INTEGRAL
 * test_phase23_pipeline.js: Executa a validação de todos os requisitos da Fase 23
 */

import { ProductAuditService } from './productAuditService.js';
import {
  ModuleStatus,
  ButtonActionStatus,
  TechnicalDebtSeverity,
  ProductScopeGroup
} from './auditModels.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    failed++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('   VELLIA LICITAÇÕES — TESTES INTEGRADOS DA FASE 23            ');
console.log('   AUDITORIA GERAL + SIMPLIFICAÇÃO + CONSOLIDAÇÃO DO PRODUTO   ');
console.log('================================================================\n');

// 1. Visão Geral da Auditoria (Item 1, 3 e 73)
console.log('--- 1. Visão Geral da Auditoria & Indicadores Globais ---');
const overview = ProductAuditService.getAuditOverview();
assert(overview.totalModules >= 15, `Módulos totais mapeados: ${overview.totalModules}`);
assert(overview.readyCount >= 5, `Módulos em Production Ready: ${overview.readyCount}`);
assert(overview.functionalCount >= 5, `Módulos Funcionais ativos: ${overview.functionalCount}`);
assert(overview.overallReadinessScore >= 80, `Score global de prontidão satisfatório (≥80%): ${overview.overallReadinessScore}%`);
assert(Boolean(overview.executiveVerdict), 'Veredito executivo fundamentado presente');

// 2. Inventário de Módulos & Classificação Estrita (Itens 4, 5, 6, 68, 69)
console.log('\n--- 2. Inventário de Módulos & Classificações Estritas ---');
const modules = ProductAuditService.getModulesInventory();
assert(modules.length >= 15, `Inventário com ${modules.length} módulos classificados`);
const validCodes = Object.keys(ModuleStatus);
assert(modules.every(m => validCodes.includes(m.status.code)), 'Todos os módulos possuem status válido do enum ModuleStatus');
const oppMod = modules.find(m => m.id === 'mod_oportunidades');
assert(oppMod && oppMod.status.code === 'PRODUCTION_READY', 'Módulo Oportunidades classificado como PRODUCTION_READY');
const copilotMod = modules.find(m => m.id === 'mod_copilot');
assert(copilotMod && copilotMod.status.code === 'PARTIAL', 'Módulo Copilot classificado transparentemente como PARTIAL (Item 35)');

// 3. Mapeamento de Mocks & Botões Sem Função (Itens 7 a 10)
console.log('\n--- 3. Mapeamento de Mocks & Auditoria de CTAs/Botões ---');
const mocks = ProductAuditService.getMocksRegistry();
assert(mocks.length >= 4, `Mocks mapeados detalhadamente: ${mocks.length}`);
assert(mocks.every(m => m.replacementNeeded && m.priority), 'Todos os mocks possuem plano de substituição e prioridade (P0 a P3)');

const buttons = ProductAuditService.getButtonsAudit();
assert(buttons.length >= 8, `Botões e CTAs auditados: ${buttons.length}`);
const validBtnStatus = Object.keys(ButtonActionStatus);
assert(buttons.every(b => validBtnStatus.includes(b.status.code)), 'Todos os botões classificados estritamente');
const syncBtn = buttons.find(b => b.id === 'btn_sync');
assert(syncBtn && syncBtn.status.code === 'FUNCIONAL', 'Botão Sincronizar (Header) auditado como FUNCIONAL');

// 4. Auditoria de Integrações & Regra de Status Real (Itens 11 a 16)
console.log('\n--- 4. Auditoria de Integrações & Validação Real ---');
const integrations = ProductAuditService.getIntegrationsAudit();
assert(integrations.length >= 6, `Total de integrações inspecionadas: ${integrations.length}`);
const pncp = integrations.find(i => i.id === 'int_pncp');
assert(pncp && pncp.status === 'ONLINE' && pncp.isVerifiedReal === true, 'PNCP online com consulta e paginação reais comprovadas (Item 15)');
const gmail = integrations.find(i => i.id === 'int_gmail');
assert(gmail && gmail.status === 'SANDBOX' && gmail.isVerifiedReal === false, 'Gmail categorizado como SANDBOX sem fingir ser ONLINE (Item 13)');
const petronect = integrations.find(i => i.id === 'int_petronect');
assert(petronect && petronect.featuresVerified.deduplication, 'Petronect com deduplicação e detecção de alteração estrutural ativas (Item 14)');

// 5. Auditoria de IA & Consolidação de Scores (Itens 17 a 23)
console.log('\n--- 5. Auditoria de IA & Proposta de Consolidação de Scores ---');
const aiScores = ProductAuditService.getAiAndScoresAudit();
assert(aiScores.aiNatureAnalysis.hasDeterministicConsistency === true, 'Motor semântico determinístico com resultado consistente para mesmo texto (Item 20)');
assert(aiScores.aiNatureAnalysis.isRuleBasedHeuristic === true, 'IA heurística/léxica identificada com transparência (Item 18)');
assert(aiScores.scoresInventory.length === 8, `8 scores inventariados: ${aiScores.scoresInventory.map(s => s.name).join(', ')}`);
assert(aiScores.consolidationProposal.proposedConsolidatedScores === 4, 'Proposta de consolidação reduz 8 scores para 4 pilares visuais (Itens 22 e 23)');

// 6. Auditoria do Menu & Jornada Principal vs Comercial (Itens 24 a 28, 96 a 100)
console.log('\n--- 6. Navegação, Jornadas Distintas & Grupos de Menu ---');
const nav = ProductAuditService.getNavigationAudit();
assert(nav.currentItemsCount === 22, `Menu atual de 22 itens identificado para simplificação: ${nav.currentItemsCount}`);
assert(nav.coreJourney.length === 7, `Jornada Central Operacional definida em 7 passos claros: ${nav.coreJourney.map(j => j.label).join(' → ')}`);
assert(nav.commercialJourney.length === 4, `Jornada Comercial separada em 4 passos: ${nav.commercialJourney.map(j => j.label).join(' → ')}`);
assert(nav.proposedNavigationGroups.length === 3, 'Menu reorganizado nos 3 grupos essenciais: Core, Comercial e Governança');
assert(Boolean(nav.profileLandingPages.LICITACOES && nav.profileLandingPages.COMERCIAL), 'Landing page inicial configurada por perfil (Item 100)');

// 7. Banco de Dados, Relações e Padronização de Termos (Itens 36 a 40, 83, 84)
console.log('\n--- 7. Banco de Dados, Data Model Map & Termos Padronizados ---');
const dbAudit = ProductAuditService.getDataModelAudit();
assert(dbAudit.entities.length === 8, `8 entidades fundamentais mapeadas no Data Model Map: ${dbAudit.entities.map(e => e.name).join(', ')}`);
assert(dbAudit.entities.every(e => e.orphans === 0), 'Zero foreign keys órfãs detectadas no banco');
assert(dbAudit.terminologyUnification.length >= 3, 'Padronização de terminologia definida (Órgão Contratante, Empresa Participante)');

// 8. Débitos Técnicos & Plano de Consolidação (Itens 64 a 67, 73 a 80)
console.log('\n--- 8. Technical Debt Register & Plano de Consolidação ---');
const debts = ProductAuditService.getTechnicalDebtRegister();
assert(debts.length >= 4, `Catálogo de Débitos Técnicos com ${debts.length} itens categorizados`);
const criticalDebts = debts.filter(d => d.severity.code === 'CRITICAL');
assert(criticalDebts.length > 0, `Débito Crítico P0 identificado para ação imediata: ${criticalDebts[0].title}`);

const plan = ProductAuditService.getConsolidationPlan();
assert(plan.quickWins.length >= 4, `Quick Wins mapeados com alto impacto e baixo esforço: ${plan.quickWins.length}`);
assert(plan.matrixP0toP3.length === 4, 'Matriz P0 a P3 estruturada com ações claras');
assert(Boolean(plan.safeRollbackPolicy), 'Política de rollback seguro e preservação da base existente confirmada');

console.log('\n================================================================');
console.log(` RESULTADO FINAL: ${passed} TESTES PASSARAM, ${failed} FALHARAM`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('>>> TODOS OS REQUISITOS DA FASE 23 AUDITADOS E VALIDADOS COM SUCESSO! <<<');
}
