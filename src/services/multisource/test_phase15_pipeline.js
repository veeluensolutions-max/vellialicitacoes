/**
 * VELLIA LICITAÇÕES — FASE 15: SUÍTE DE TESTES E VALIDAÇÃO AUTOMATIZADA
 * test_phase15_pipeline.js: Executa testes de conformidade para PNCP, Compras.gov.br e Deduplicação Cross-Source
 * 
 * Atende aos requisitos:
 * - Itens 59, 60, 61: Testes de API, paginação, valores nulos, cross-source duplicate e divergência
 * - Itens 10, 11: Detecção e histórico de prazo alterado pelo órgão
 * - Itens 28, 48: Locks de concorrência e resiliência independente de fontes
 * - Itens 38 a 41: PCA classificado como oportunidade potencial futura sem alarme indevido
 */

import { PNCPConnector } from './pncpConnector.js';
import { PNCPAdapter } from './pncpAdapter.js';
import { ComprasGovConnector } from './comprasGovConnector.js';
import { ComprasGovAdapter } from './comprasGovAdapter.js';
import { CrossSourceDeduplicationService } from './crossSourceDeduplicationService.js';
import { MultiSourceSyncManager } from './multiSourceSyncManager.js';
import { PCAService } from './pcaService.js';
import { RecordType, SourceConfidence } from './opportunityDTO.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASSOU: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FALHOU: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🚀 INICIANDO TESTES DA FASE 15 — INTEGRAÇÃO COM PNCP + COMPRAS.GOV.BR');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TESTE 1: HEALTH CHECKS DAS FONTES (Itens 24 e 25)
  // -------------------------------------------------------------
  console.log('▶ [1] Health Check das APIs Públicas Oficiais:');
  const pncpHealth = await PNCPConnector.checkHealth();
  assert(pncpHealth.status === 'ONLINE', 'PNCP Health Check retornou status ONLINE');
  assert(pncpHealth.latencyMs > 0, `Latência do PNCP registrada com precisão (${pncpHealth.latencyMs}ms)`);

  const cgovHealth = await ComprasGovConnector.checkHealth();
  assert(cgovHealth.status === 'ONLINE', 'Compras.gov.br Health Check retornou status ONLINE');
  assert(cgovHealth.latencyMs > 0, `Latência do Compras.gov registrada (${cgovHealth.latencyMs}ms)`);

  // -------------------------------------------------------------
  // TESTE 2: NORMALIZAÇÃO PNCP -> OPPORTUNITY DTO (Itens 5 e 6)
  // -------------------------------------------------------------
  console.log('\n▶ [2] Normalização de Dados do PNCP:');
  const pncpRawRes = await PNCPConnector.fetchOpportunities({ page: 1, pageSize: 5 });
  assert(pncpRawRes.data.length > 0, 'PNCP retornou registros com sucesso');

  const rawSample = pncpRawRes.data[0];
  const dto = PNCPAdapter.toDTO(rawSample);
  assert(dto.source === 'PNCP', 'Source do DTO atribuído como PNCP');
  assert(dto.externalId.length > 0, `ID externo do PNCP capturado: ${dto.externalId}`);
  assert(dto.officialUrl.includes('pncp.gov.br'), `Link oficial para "Abrir no PNCP" validado: ${dto.officialUrl}`);
  assert(dto.confidence === SourceConfidence.HIGH, 'Source Confidence classificada como ALTA');

  const entity = PNCPAdapter.toEntity(dto);
  assert(entity.portal === 'PNCP', 'Entidade gerada com portal PNCP');
  assert(entity.daysLeft >= 0, `Dias restantes calculados adequadamente (${entity.daysLeft} dias)`);

  // -------------------------------------------------------------
  // TESTE 3: NORMALIZAÇÃO COMPRAS.GOV.BR (Itens 13 e 14)
  // -------------------------------------------------------------
  console.log('\n▶ [3] Normalização de Dados do Compras.gov.br:');
  const cgovRawRes = await ComprasGovConnector.fetchOpportunities({ page: 1, pageSize: 5 });
  assert(cgovRawRes.data.length > 0, 'Compras.gov retornou registros com sucesso');

  const cgovSample = cgovRawRes.data[0];
  const cgovDto = ComprasGovAdapter.toDTO(cgovSample);
  assert(cgovDto.source === 'Compras.gov.br', 'Source do DTO atribuído como Compras.gov.br');
  assert(cgovDto.contractor.length > 0, `Órgão do Compras.gov capturado: ${cgovDto.contractor}`);

  // -------------------------------------------------------------
  // TESTE 4: TESTE CRÍTICO — DEDUPLICAÇÃO CROSS-SOURCE (Item 60)
  // -------------------------------------------------------------
  console.log('\n▶ [4] TESTE CROSS-SOURCE (Item 60): Mesma contratação em PNCP e Compras.gov:');
  
  // Criamos o certame da COMPESA que está presente tanto no PNCP quanto no Compras.gov
  const compesaPncp = PNCPAdapter.toEntity(PNCPAdapter.toDTO(
    pncpRawRes.data.find(r => r.numeroProcesso === '0058.001920/2026-11')
  ));

  const compesaComprasGov = ComprasGovAdapter.toEntity(ComprasGovAdapter.toDTO(
    cgovRawRes.data.find(r => r.numeroProcesso === '0058.001920/2026-11')
  ));

  const matchResult = CrossSourceDeduplicationService.matchOpportunities(compesaComprasGov, compesaPncp);
  assert(matchResult.isMatch === true, 'Mecanismo identificou correspondência perfeita de processo entre PNCP e Compras.gov');

  // Executa o merge cross-source
  const mergedCompesa = CrossSourceDeduplicationService.mergeCrossSource(compesaPncp, compesaComprasGov);
  assert(mergedCompesa.sources.length === 2, `Oportunidade consolidada registrou 2 fontes (${mergedCompesa.sources.join(', ')})`);
  assert(mergedCompesa.sources.includes('PNCP') && mergedCompesa.sources.includes('Compras.gov.br'), 'Fontes incluem tanto PNCP quanto Compras.gov.br');

  // -------------------------------------------------------------
  // TESTE 5: TESTE CRÍTICO — DETECÇÃO DE DIVERGÊNCIA ENTRE FONTES (Item 61)
  // -------------------------------------------------------------
  console.log('\n▶ [5] TESTE DE DIVERGÊNCIA (Item 61): Detecção de datas divergentes entre portais:');
  
  const compesaWithDifferentDate = {
    ...compesaComprasGov,
    endDate: '2026-10-30T10:00:00Z' // PNCP informa 24/10, Compras.gov informa 30/10
  };

  const mergedWithDiscrepancy = CrossSourceDeduplicationService.mergeCrossSource(compesaPncp, compesaWithDifferentDate);
  assert(mergedWithDiscrepancy.hasDiscrepancy === true, 'Flag "hasDiscrepancy" ativada ao detectar datas de encerramento divergentes');
  assert(mergedWithDiscrepancy.discrepancyDetails.length > 0, 'Detalhes da divergência gravados estruturadamente para conferência executiva');
  assert(mergedWithDiscrepancy.discrepancyDetails[0].field === 'Data de Encerramento', 'Campo divergente identificado como Data de Encerramento');

  // -------------------------------------------------------------
  // TESTE 6: DETECÇÃO DE PRAZO ALTERADO PELO ÓRGÃO (Itens 10 e 11)
  // -------------------------------------------------------------
  console.log('\n▶ [6] DETECÇÃO DE PRAZO ALTERADO (Itens 10 e 11):');
  
  const existingDoc = {
    id: 'PNCP-01',
    portal: 'PNCP',
    endDate: '2026-10-15T10:00:00Z',
    history: []
  };

  const updatedDoc = {
    id: 'PNCP-01',
    portal: 'PNCP',
    endDate: '2026-10-22T10:00:00Z' // Novo prazo
  };

  const mergedDeadline = CrossSourceDeduplicationService.mergeCrossSource(existingDoc, updatedDoc);
  assert(mergedDeadline.deadlineChanged === true, 'Detecção de alteração de prazo efetuada com sucesso');
  assert(mergedDeadline.deadlineChangeNotice.includes('Prazo alterado pelo órgão'), 'Mensagem "Prazo alterado pelo órgão" gerada no histórico');

  // -------------------------------------------------------------
  // TESTE 7: PCA & RADAR ANTECIPADO (Itens 38 a 41)
  // -------------------------------------------------------------
  console.log('\n▶ [7] Plano de Contratações Anual (PCA / Radar Antecipado):');
  const pcaList = PCAService.getPlannedPurchases();
  assert(pcaList.length > 0, 'Planos de contratações anuais carregados');
  const pcaSample = pcaList[0];
  assert(pcaSample.recordType === RecordType.PLANNED_PURCHASE, 'Tipo de registro classificado como PLANNED_PURCHASE');
  assert(pcaSample.alertaTipo === 'Oportunidade potencial futura', 'Classificação de alerta suave: "Oportunidade potencial futura" (sem alarme crítico)');

  // -------------------------------------------------------------
  // TESTE 8: LOCKS INDEPENDENTES & RESILIÊNCIA MULTIFONTE (Itens 28 e 48)
  // -------------------------------------------------------------
  console.log('\n▶ [8] Locks Independentes e Resiliência de Fontes:');
  MultiSourceSyncManager.acquireLock('PNCP_SYNC');
  let duplicateLockBlocked = false;
  try {
    MultiSourceSyncManager.acquireLock('PNCP_SYNC');
  } catch (err) {
    duplicateLockBlocked = true;
  }
  assert(duplicateLockBlocked === true, 'Lock PNCP_SYNC bloqueou execução paralela concorrente da mesma fonte');
  MultiSourceSyncManager.releaseLock('PNCP_SYNC');

  // Lock do Compras.gov deve operar livremente e de forma independente
  let comprasLockAcquired = false;
  try {
    MultiSourceSyncManager.acquireLock('COMPRAS_SYNC');
    comprasLockAcquired = true;
  } finally {
    MultiSourceSyncManager.releaseLock('COMPRAS_SYNC');
  }
  assert(comprasLockAcquired === true, 'Lock COMPRAS_SYNC opera independentemente de PNCP');

  // -------------------------------------------------------------
  // TESTE 9: TRATAMENTO DE VALORES E ÓRGÃOS NULOS (Item 59)
  // -------------------------------------------------------------
  console.log('\n▶ [9] Resiliência a Dados Parciais / Nulos da API:');
  const nullDto = PNCPAdapter.toDTO({
    idPncp: 'TEST-NULL-99',
    objetoContratacao: null,
    orgaoEntidade: null,
    valorTotalEstimado: null
  });
  assert(nullDto.contractor === 'Órgão Público Federal/Estadual', 'Fallback aplicado com sucesso para órgão nulo');
  assert(nullDto.estimatedValue === null, 'Valor nulo tratado graciosamente sem lançar exceção');

  // -------------------------------------------------------------
  // RESUMO GERAL
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA SUÍTE DE TESTES (FASE 15):`);
  console.log(`   Total de Testes: ${passed + failed}`);
  console.log(`   Sucessos (✓):     ${passed}`);
  console.log(`   Falhas (✗):       ${failed}`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 TODOS OS TESTES DA FASE 15 PASSARAM COM 100% DE SUCESSO!\n');
    return true;
  } else {
    console.error(`🚨 Houve ${failed} falha(s). Verifique os logs acima.\n`);
    return false;
  }
}

runTests().catch(err => {
  console.error('Erro fatal durante os testes:', err);
  process.exit(1);
});
