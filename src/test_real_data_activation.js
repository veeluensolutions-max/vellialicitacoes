/**
 * TESTE & EXECUÇÃO: REAL DATA ACTIVATION SCRIPT
 * Zera a base de dados local de teste, ativa os workers e sincroniza dados reais de todas as fontes.
 */

// Polyfill seguro e isolado antes dos imports dinâmicos
const storageMap = new Map();
const localStorageMock = {
  getItem: (key) => storageMap.get(key) || null,
  setItem: (key, val) => storageMap.set(key, String(val)),
  removeItem: (key) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  key: (i) => Array.from(storageMap.keys())[i] || null,
  get length() { return storageMap.size; }
};

try {
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true
  });
} catch (_) {
  globalThis.localStorage = localStorageMock;
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { origin: 'http://localhost:5173' },
    localStorage: localStorageMock
  };
}

async function run() {
  console.log('========================================================================');
  console.log('🚀 VELLIA LICITAÇÕES — ATIVAÇÃO E SINCRONIZAÇÃO EM TEMPO REAL');
  console.log(`Data e Hora: ${new Date().toLocaleString('pt-BR')}`);
  console.log('========================================================================\n');

  // Importação dinâmica após inicialização completa do ambiente
  const { RealDataActivationService } = await import('./services/system/realDataActivationService.js');
  const { opportunityRepository } = await import('./services/opportunityRepository.js');
  const { cndMonitoringService } = await import('./services/cnd/cndMonitoringService.js');

  console.log('1. Executando reset seguro de dados e ativação de fontes ao vivo...');
  const result = await RealDataActivationService.resetAndActivateRealData();

  console.log('\n📊 RELATÓRIO DE SINCRONIZAÇÃO EM TEMPO REAL:');
  console.log(`- Base zerada e limpa: ${result.cleared ? 'SIM' : 'NÃO'}`);
  console.log(`- Workers Ativados: ${result.workersActivated.join(', ')}`);
  console.log(`- Oportunidades Reais Ingeridas: ${result.totalOpportunities}`);
  console.log(`- Pipeline Ativo Calculado: R$ ${(result.totalPipelineValue / 1000000).toFixed(2)}M`);
  console.log(`- Auditoria CNDs Fiscal: ${result.cndsAudited ? '100% EXECUTADA' : 'PENDENTE'}`);
  console.log(`- Tempo Total de Execução: ${result.durationMs}ms`);

  console.log('\n🔍 FONTES CONECTADAS:');
  for (const [src, data] of Object.entries(result.sources)) {
    console.log(`  • ${src}: ${data.success ? `✅ SUCESSO (${data.captured} capturados, ${data.newCount} novos)` : `❌ ${data.error}`}`);
  }

  const allOpps = opportunityRepository.getAll();
  console.log(`\n📋 AMOSTRA DE CERTAMES REAIS EM BANCO (${allOpps.length} no total):`);
  allOpps.slice(0, 5).forEach((opp, i) => {
    console.log(`  [${i + 1}] [${opp.portal || opp.sourceOrigin}] ${opp.number} — ${opp.title?.slice(0, 60)}...`);
    console.log(`      Valor: ${opp.estimatedValue || 'Sob Consulta'} | Aderência: ${opp.score || 0}% | Empresa: ${opp.recommendedCompany}`);
  });

  const cndStatusVeeluen = cndMonitoringService.getCompanyCertificates('veeluen-solutions');
  const cndStatusExcelencia = cndMonitoringService.getCompanyCertificates('excelencia-ambiental');
  console.log('\n🛡️ REGULARIDADE FISCAL AUDITADA:');
  console.log(`  • Veeluen Solutions: ${cndStatusVeeluen.isEligibleForBidding ? '✅ APTO PARA LICITAR' : '⚠️ ALERTA'} (${cndStatusVeeluen.totalCertificates} certidões auditadas)`);
  console.log(`  • Excelência Ambiental: ${cndStatusExcelencia.isEligibleForBidding ? '✅ APTO PARA LICITAR' : '⚠️ ALERTA'} (${cndStatusExcelencia.totalCertificates} certidões auditadas)`);

  console.log('\n========================================================================');
  console.log('🎉 ATIVAÇÃO E SINCRONIZAÇÃO DE DADOS REAIS CONCLUÍDA COM SUCESSO!');
  console.log('========================================================================');

  // Encerra os workers e sai com sucesso
  process.exit(0);
}

run().catch(err => {
  console.error('Falha na ativação:', err);
  process.exit(1);
});
