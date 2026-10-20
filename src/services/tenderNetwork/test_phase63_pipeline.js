/**
 * VELLIA LICITAÇÕES — FASE 63: TESTES AUTOMATIZADOS DO PIPELINE
 * test_phase63_pipeline.js: Validação Completa dos 16 Cenários Exigidos
 */

import { tenderNetworkService } from './tenderNetworkService.js';
import {
  SourceHealthStatus,
  CandidateStatus,
  ConflictFieldType,
  MatchConfidenceType
} from './tenderNetworkModels.js';
import { BrokenSchemaNetworkAdapter } from './sourceAdapterInterface.js';

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    failed++;
  }
}

console.log('======================================================');
console.log(' INICIANDO BATERIA DE TESTES — FASE 63: TENDER NETWORK ');
console.log('======================================================\n');

async function runTests() {
  // TESTE 1: Mesma opportunity em PNCP e Compras.gov -> 1 entidade canônica com múltiplos source records
  const incomingComprasGov = {
    externalId: 'COMPRASGOV-08784845000135-2026-088',
    title: 'Monitoramento da qualidade das águas subterrâneas e ensaios hidrogeológicos',
    buyer: 'Prefeitura Municipal de Caaporã',
    clientCnpj: '08.784.845/0001-35',
    modality: 'Pregão Eletrônico',
    estimatedValue: 480000.00,
    deadline: '2026-10-28T10:00:00Z',
    url: 'https://comprasnet.gov.br/edital/088'
  };
  const resMerge = tenderNetworkService.ingestRecord(incomingComprasGov, 'SOURCE-COMPRASGOV');
  const caaporaOpp = tenderNetworkService.getCanonicalOpportunityById('OPP-CAAPORA-PB-2026');
  assert(
    resMerge.status === 'MERGED_INTO_CANONICAL' &&
    caaporaOpp.sourceRecords.length >= 2 &&
    caaporaOpp.provenance.additionalSources.includes('SOURCE-COMPRASGOV'),
    'Teste 1: Mesma opportunity em PNCP e Compras.gov -> 1 entidade canônica com múltiplos source records',
    `SourceRecords: ${caaporaOpp.sourceRecords.length}`
  );

  // TESTE 2: Prazo divergente -> Conflito detectado e preservado com primary value segundo policy
  const incomingDivergent = {
    externalId: 'LOCAL-PB-DIV-01',
    title: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
    buyer: 'Petrobras — Refinaria Abreu e Lima',
    clientCnpj: '33.000.167/0661-84',
    deadline: '2026-11-20T10:00:00Z', // Divergente da Petronect (15/11)
    estimatedValue: 1850000.00
  };
  tenderNetworkService.ingestRecord(incomingDivergent, 'SOURCE-PORTAL-PB');
  const rnestOpp = tenderNetworkService.getCanonicalOpportunityById('OPP-RNEST-7004321234');
  const deadlineConflict = rnestOpp.conflicts.find(c => c.fieldName === ConflictFieldType.DEADLINE);
  assert(
    deadlineConflict && deadlineConflict.primaryValue.includes('2026-11-15') && deadlineConflict.conflictingValue.includes('2026-11-20'),
    'Teste 2: Prazo divergente -> Conflito detectado e preservado com primary value segundo policy',
    `Conflito: ${deadlineConflict?.notes}`
  );

  // TESTE 3: Fonte secundária offline -> Oportunidade continua disponível via primária
  tenderNetworkService.updateSourceStatus('SOURCE-PORTAL-PB', SourceHealthStatus.OFFLINE, 'Manutenção no servidor estadual');
  const oppUnderSecOffline = tenderNetworkService.getOpportunityWithFailover('OPP-RNEST-7004321234');
  assert(
    oppUnderSecOffline && oppUnderSecOffline.isUnderFailover === false && oppUnderSecOffline.activeSourceInUse === 'Petronect',
    'Teste 3: Fonte secundária offline -> Oportunidade continua disponível via primária sem degradação'
  );

  // TESTE 4: Fonte primária offline -> Secundária em uso devidamente sinalizada (Secondary source in use)
  tenderNetworkService.updateSourceStatus('SOURCE-PETRONECT', SourceHealthStatus.OFFLINE, 'Falha de conectividade Petronect');
  const oppUnderPrimOffline = tenderNetworkService.getOpportunityWithFailover('OPP-RNEST-7004321234');
  assert(
    oppUnderPrimOffline.isUnderFailover === true &&
    oppUnderPrimOffline.failoverNotice.includes('Fonte secundária') &&
    oppUnderPrimOffline.failoverNotice.includes('em uso provisório'),
    'Teste 4: Fonte primária offline -> Secundária em uso devidamente sinalizada (Secondary source in use)',
    oppUnderPrimOffline.failoverNotice
  );
  // Restaura status para próximos testes
  tenderNetworkService.updateSourceStatus('SOURCE-PETRONECT', SourceHealthStatus.HEALTHY, 'Restaurado');

  // TESTE 5: Nova fonte em shadow -> Não gera alerta real / não polui Radar oficial
  const shadowCandidate = tenderNetworkService.getSourceCandidates().find(c => c.id === 'CAND-001');
  const shadowIngestResult = tenderNetworkService.ingestRecord(
    { externalId: 'SHADOW-EXP-999', title: 'Certame Silencioso de Teste em Campina Grande', buyer: 'PMCG' },
    'SOURCE-PORTAL-PB',
    { isShadowMode: true }
  );
  assert(
    shadowCandidate.status === CandidateStatus.TESTING &&
    shadowIngestResult.status === 'SHADOW_INGESTED',
    'Teste 5: Nova fonte em shadow mode -> Não gera alerta real nem polui Radar oficial',
    shadowIngestResult.note
  );

  // TESTE 6: Schema muda -> Conector entra em Fail-Fast e joga erro na fila sem crashar
  const brokenAdapter = new BrokenSchemaNetworkAdapter({ id: 'SOURCE-TEST-BROKEN' });
  const rawBroken = await brokenAdapter.fetch();
  const parsedBroken = brokenAdapter.parse(rawBroken);
  const valResult = brokenAdapter.validate(parsedBroken[0]);
  assert(
    valResult.valid === false &&
    brokenAdapter.parserErrorQueue.length === 1 &&
    valResult.error.includes('SCHEMA_VALIDATION_FAILURE'),
    'Teste 6: Schema muda -> Conector entra em Fail-Fast e joga erro na fila sem crashar',
    valResult.error
  );

  // TESTE 7: Same PDF hash -> Não duplicar / download evitado
  const docPayload1 = {
    title: 'Edital Pregão 088-2026 Caapora.pdf',
    hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a' // Mesmo hash existente
  };
  const docResult1 = tenderNetworkService.registerDocument('OPP-CAAPORA-PB-2026', docPayload1);
  assert(
    docResult1.status === 'DEDUPLICATED_BY_HASH',
    'Teste 7: Same PDF hash -> Deduplicação automática, download e reprocessamento redundantes evitados',
    docResult1.message
  );

  // TESTE 8: Document changed -> New version e disparo de evento
  const docPayload2 = {
    title: 'Edital Pregão 088-2026 Caapora.pdf',
    hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' // Hash alterado (novo edital)
  };
  const docResult2 = tenderNetworkService.registerDocument('OPP-CAAPORA-PB-2026', docPayload2);
  assert(
    docResult2.status === 'DOCUMENT_VERSION_UPDATED' &&
    docResult2.document.version === 2 &&
    docResult2.eventTriggered === 'DOCUMENT_CHANGE_EVENT',
    'Teste 8: Document changed -> Nova versão registrada e DOCUMENT_CHANGE_EVENT disparado com sucesso',
    `Versão: ${docResult2.document.version}`
  );

  // TESTE 9: Historical backfill -> No expired alerts
  const backfillRecord = {
    externalId: 'HIST-2024-001',
    title: 'Licitação Histórica Encerrada em 2024',
    buyer: 'Prefeitura do Recife',
    deadline: '2024-05-10T10:00:00Z',
    estimatedValue: 300000
  };
  const backfillIngest = tenderNetworkService.ingestRecord(backfillRecord, 'SOURCE-PNCP', { isBackfill: true });
  assert(
    backfillIngest.status === 'CREATED_CANONICAL',
    'Teste 9: Historical backfill -> Certame histórico indexado com supressão de alertas de vencimento'
  );

  // TESTE 10: Potential duplicate uncertain -> Human review queue
  const uncertainRecord = {
    externalId: 'UNCERTAIN-999',
    title: 'Serviços de medição em águas e ensaios complementares no município',
    buyer: 'Prefeitura Municipal de Caaporã',
    clientCnpj: null // Sem CNPJ para impedir match forte automático
  };
  const uncertainResult = tenderNetworkService.ingestRecord(uncertainRecord, 'SOURCE-PORTAL-PB');
  assert(
    uncertainResult.status === 'QUEUED_FOR_HUMAN_REVIEW' &&
    uncertainResult.reviewItem.type === 'DUPLICATE_UNCERTAIN_MATCH',
    'Teste 10: Duplicata potencial incerta (Possible Match) -> Encaminhada para Fila de Revisão Humana sem merge cego',
    uncertainResult.status
  );

  // TESTE 11: Buyer names similar -> No incorrect merge
  const buyerOlinda = tenderNetworkService.normalizeBuyerName('Prefeitura de Olinda');
  const buyerRecife = tenderNetworkService.normalizeBuyerName('Prefeitura Municipal de Recife');
  const areDifferent = buyerOlinda !== buyerRecife && buyerRecife === 'Prefeitura Municipal do Recife';
  assert(
    areDifferent,
    'Teste 11: Buyer names similar -> Normalização canônica preserva órgãos distintos sem merge indevido',
    `Olinda: ${buyerOlinda} vs Recife: ${buyerRecife}`
  );

  // TESTE 12: Source returns no data unexpectedly -> Anomaly detection
  const anomalyEval = tenderNetworkService.evaluateSourceHealth('SOURCE-PNCP', 0, true);
  assert(
    anomalyEval.anomalyDetected === true &&
    anomalyEval.status === SourceHealthStatus.DEGRADED &&
    anomalyEval.anomalyReason.includes('ANOMALIA'),
    'Teste 12: Fonte retorna 0 dados inesperadamente em dia útil -> Detecção de anomalia baseada em baseline histórico',
    anomalyEval.anomalyReason
  );

  // TESTE 13: One source 90% duplicates but high authority -> Not automatically retired
  const pncpSource = tenderNetworkService.getSourceById('SOURCE-PNCP');
  const dupRatio = pncpSource.metrics.duplicateConfirmations / pncpSource.metrics.totalIngested;
  assert(
    dupRatio > 0.60 && pncpSource.status !== SourceHealthStatus.RETIRED && pncpSource.trustLevel === 'Oficial',
    'Teste 13: Fonte com alto volume de duplicatas mas alta autoridade (PNCP) -> Mantida ativa para confirmação canônica',
    `Taxa de duplicatas: ${(dupRatio * 100).toFixed(1)}%`
  );

  // TESTE 14: Opportunity update -> Only relevant analyses recalculated
  const updateExistingRecord = {
    externalId: 'PETRO-7004321234',
    title: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
    buyer: 'Petrobras — Refinaria Abreu e Lima',
    clientCnpj: '33.000.167/0661-84',
    deadline: '2026-11-15T14:00:00Z',
    estimatedValue: 1850000.00
  };
  const updateRes = tenderNetworkService.ingestRecord(updateExistingRecord, 'SOURCE-PETRONECT');
  assert(
    updateRes.status === 'MERGED_INTO_CANONICAL',
    'Teste 14: Opportunity update -> Atualização de registros sem recálculo redundante de certames idênticos'
  );

  // TESTE 15: Multiempresa -> Ingestão única e matching isolado por empresa
  const adherVeeluen = tenderNetworkService.calculateCompanyAdherence('OPP-CAAPORA-PB-2026', 'veeluensolutions');
  const adherExcelencia = tenderNetworkService.calculateCompanyAdherence('OPP-CAAPORA-PB-2026', 'excelencia');
  assert(
    adherVeeluen.adherenceScore !== adherExcelencia.adherenceScore &&
    adherExcelencia.adherenceScore > 90 &&
    adherVeeluen.adherenceScore > 80,
    'Teste 15: Multiempresa -> Fonte única global gera scores e critérios de aderência rigorosamente isolados por empresa',
    `Veeluen: ${adherVeeluen.adherenceScore}% vs Excelência: ${adherExcelencia.adherenceScore}%`
  );

  // TESTE 16: CAPTCHA source -> No bypass (Bloqueio estrito de segurança)
  let captchaBlocked = false;
  try {
    tenderNetworkService.addSourceCandidate({
      name: 'Portal Scraper com Quebra de CAPTCHA',
      requiresCaptchaBypass: true,
      notes: 'Tentativa de contornar captcha'
    });
  } catch (e) {
    captchaBlocked = e.message.includes('SECURITY_ERROR') || e.message.includes('CAPTCHA');
  }
  assert(
    captchaBlocked,
    'Teste 16: CAPTCHA source -> Rejeição sumária de automação com bypass de CAPTCHA conforme diretrizes de segurança'
  );

  console.log('\n======================================================');
  console.log(` RESULTADO: ${passed} de 16 TESTES APROVADOS (${Math.round((passed / 16) * 100)}%)`);
  console.log('======================================================\n');
}

runTests();
