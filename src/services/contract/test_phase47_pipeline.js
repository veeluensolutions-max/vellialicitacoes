/**
 * VELLIA LICITAÇÕES — SUÍTE DE TESTES AUTOMATIZADOS DA FASE 47
 * INTELIGÊNCIA DE PERFORMANCE CONTRATUAL + APRENDIZADO PÓS-EXECUÇÃO + CLOSED-LOOP LEARNING
 * 
 * Executa os 12 testes automatizados exigidos:
 * 1. Custo planejado vs observado -> Comparação correta
 * 2. Dado observado ausente -> Proteção contra invenção de dados
 * 3. Risco previsto não aconteceu -> Registrado corretamente como mitigado
 * 4. Risco aconteceu e mitigação funcionou -> Status Effective
 * 5. Fornecedor teve desvio -> Feedback registrado com fatos objetivos
 * 6. Contrato concluído pode gerar atestado -> Workflow criado no Capability Loop
 * 7. Lesson Learned aprovada -> Aparece em oportunidade futura relacionada
 * 8. Lesson Learned ainda Draft -> NÃO influencia decisão oficial (governança)
 * 9. Usuário sem permissão financeira -> Custos e margens ocultos
 * 10. Amostra pequena -> Small Sample Warning exibido obrigatoriamente
 * 11. Contrato encerrado -> Snapshot final preservado sem recalcular histórico
 * 12. Teste Multiempresa -> Isolamento estrito entre Veeluen Solutions e Excelência Ambiental
 */

import { contractPerformanceService } from './contractPerformanceService.js';

console.log('\n================================================================');
console.log('🚀 INICIANDO TESTE PIPELINE FASE 47 — VELLIA LICITAÇÕES');
console.log('================================================================\n');

try {
  const result = contractPerformanceService.runPhase47AutomatedTests();
  
  result.logs.forEach(log => console.log(log));

  if (!result.passed) {
    console.error(`\n❌ FALHA NA SUÍTE: Apenas ${result.passedCount} de ${result.totalTests} passaram.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 SUCESSO ABSOLUTO: Todos os ${result.totalTests} testes da Fase 47 passaram com 100% de êxito!`);
    process.exit(0);
  }
} catch (error) {
  console.error('\n❌ ERRO CRÍTICO NA EXECUÇÃO DA SUÍTE:', error);
  process.exit(1);
}
