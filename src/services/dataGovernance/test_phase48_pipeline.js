/**
 * VELLIA LICITAÇÕES — SUÍTE DE TESTES AUTOMATIZADOS DA FASE 48
 * DATA GOVERNANCE + QUALIDADE DE DADOS + CONFIABILIDADE DA INTELIGÊNCIA
 * 
 * Executa os 12 testes automatizados exigidos:
 * 1. Duas oportunidades idênticas em fontes diferentes -> Dedup correto
 * 2. Mesma organização com nome diferente -> Possível duplicidade detectada
 * 3. Datas divergentes de sessão -> Conflict criado sem sobrescrita silenciosa
 * 4. Adendo mais recente -> Prazo atualizado com rastreabilidade de origem
 * 5. OCR com baixa confiança -> Revisão humana obrigatória e Quality Gate bloqueado
 * 6. Usuário corrige dado -> Original preservado para fins de auditoria (Manual Override)
 * 7. Dado crítico muda -> Análise derivada marcada como STALE
 * 8. Fonte offline / degradada -> Freshness e aviso refletidos com transparência
 * 9. Usuário sem acesso financeiro -> Não consegue visualizar proveniência restrita
 * 10. Merge de organização -> Relações e aliases canônicos preservados
 * 11. Rollback / correção de merge auditado
 * 12. Teste Multiempresa -> Isolamento estrito entre Veeluen Solutions e Excelência Ambiental
 */

import { dataGovernanceService } from './dataGovernanceService.js';

console.log('\n================================================================');
console.log('🚀 INICIANDO TESTE PIPELINE FASE 48 — VELLIA LICITAÇÕES');
console.log('================================================================\n');

try {
  const result = dataGovernanceService.runPhase48AutomatedTests();
  
  result.logs.forEach(log => console.log(log));

  if (!result.passed) {
    console.error(`\n❌ FALHA NA SUÍTE: Apenas ${result.passedCount} de ${result.totalTests} passaram.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 SUCESSO ABSOLUTO: Todos os ${result.totalTests} testes da Fase 48 passaram com 100% de êxito!`);
    process.exit(0);
  }
} catch (error) {
  console.error('\n❌ ERRO CRÍTICO NA EXECUÇÃO DA SUÍTE:', error);
  process.exit(1);
}
