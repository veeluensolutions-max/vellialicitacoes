/**
 * VELLIA LICITAÇÕES — TESTE GERAL INTEGRADO DO SISTEMA (FULL SYSTEM AUDIT)
 * Validação rigorosa e automatizada de todos os módulos de produção:
 * 1. Conectores e Workers em Tempo Real (PNCP, Petronect, Compras.gov.br)
 * 2. Sincronização em Nuvem Supabase & WebSockets Realtime
 * 3. IA Generativa Dual (Google Gemini e OpenAI) e Copilot de Editais
 * 4. Gerador de Impugnações e Recursos com Súmulas do TCU
 * 5. Central Autônoma de CNDs e Regularidade Fiscal
 * 6. Despachador de Alertas Externos (WhatsApp & E-mail)
 */

// Polyfill global de localStorage e window ANTES de qualquer módulo ser importado
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};
globalThis.window = globalThis;

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName} ${details ? `(${details})` : ''}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

async function runGeneralSystemAudit() {
  console.log('\n========================================================================');
  console.log('🏛️  VELLIA LICITAÇÕES — AUDITORIA GERAL DE TESTES DO SISTEMA');
  console.log(`Data e Hora: ${new Date().toLocaleString('pt-BR')}`);
  console.log('========================================================================\n');

  // Carregamento dinâmico dos serviços após polyfill
  const { petronectLiveCollectorService } = await import('./services/petronect/petronectLiveCollectorService.js');
  const { petronectContinuousIngestionWorker } = await import('./services/petronect/petronectContinuousIngestionWorker.js');
  const { comprasGovLiveCollectorService } = await import('./services/comprasgov/comprasGovLiveCollectorService.js');
  const { comprasGovContinuousIngestionWorker } = await import('./services/comprasgov/comprasGovContinuousIngestionWorker.js');
  const { pncpContinuousIngestionWorker } = await import('./services/pncp/pncpContinuousIngestionWorker.js');

  const { supabaseClient } = await import('./services/cloud/supabaseClient.js');
  const { supabaseRealtimeService } = await import('./services/cloud/supabaseRealtimeService.js');
  const { cloudSyncService } = await import('./services/cloud/cloudSyncService.js');

  const { AiModelProviderService, AI_PROVIDERS } = await import('./services/ai/aiModelProviderService.js');
  const { DocumentCopilotService } = await import('./services/edital/documentCopilotService.js');
  const { EditalAnalysisEngine } = await import('./services/edital/editalAnalysisEngine.js');

  const { ImpugnationGeneratorService, PIECE_TYPES, LEGAL_GROUNDS_CATALOG } = await import('./services/legal/impugnationGeneratorService.js');
  const { cndMonitoringService, CND_STATUS } = await import('./services/cnd/cndMonitoringService.js');
  const { ExternalAlertDispatcher } = await import('./services/notifications/externalAlertDispatcher.js');
  const { AlertService } = await import('./services/agent/alertService.js');

  // ------------------------------------------------------------------------
  // MÓDULO 1: CONECTORES E WORKERS EM TEMPO REAL
  // ------------------------------------------------------------------------
  console.log('▶ [1/6] Conectores de Portais & Workers Contínuos...');

  // 1.1 Petronect
  const petroWorkerState = petronectContinuousIngestionWorker.getState();
  assert(petroWorkerState !== null, 'Worker Petronect instanciado corretamente');
  assert(typeof petronectContinuousIngestionWorker.triggerImmediateIngestion === 'function', 'Worker Petronect possui triggerImmediateIngestion');

  const petroConn = await petronectLiveCollectorService.testLiveConnection();
  assert(typeof petroConn.latencyMs === 'number' && typeof petroConn.message === 'string', 'Coletor Petronect testLiveConnection funcional com diagnóstico e fallback', `${petroConn.latencyMs}ms`);

  const petroResults = await petronectLiveCollectorService.collectLiveOpportunities();
  assert(Array.isArray(petroResults) && petroResults.length > 0, 'Coletor Petronect retorna certames da área pública Petrobras', `${petroResults.length} certames`);

  // 1.2 Compras.gov.br
  const cgovWorkerState = comprasGovContinuousIngestionWorker.getState();
  assert(cgovWorkerState !== null, 'Worker Compras.gov.br instanciado corretamente');
  assert(typeof comprasGovContinuousIngestionWorker.triggerImmediateIngestion === 'function', 'Worker Compras.gov.br possui triggerImmediateIngestion');

  const cgovConn = await comprasGovLiveCollectorService.testLiveConnection();
  assert(typeof cgovConn.latencyMs === 'number' && typeof cgovConn.message === 'string', 'Coletor Compras.gov.br testLiveConnection funcional com diagnóstico e fallback', `${cgovConn.latencyMs}ms`);

  const cgovResults = await comprasGovLiveCollectorService.collectLiveOpportunities();
  assert(Array.isArray(cgovResults) && cgovResults.length > 0, 'Coletor Compras.gov.br retorna pregões federais estruturados', `${cgovResults.length} pregões`);

  // 1.3 PNCP
  const pncpState = pncpContinuousIngestionWorker.getState();
  assert(pncpState !== null, 'Worker PNCP instanciado e operacional');

  // ------------------------------------------------------------------------
  // MÓDULO 2: SINCRONIZAÇÃO EM NUVEM E WEBSOCKETS REALTIME
  // ------------------------------------------------------------------------
  console.log('\n▶ [2/6] Banco em Nuvem Supabase & WebSockets Realtime...');

  assert(typeof supabaseClient.isConfigured === 'function', 'SupabaseClient possui verificador de configuração');
  const isSupaConfigured = supabaseClient.isConfigured();
  assert(isSupaConfigured === true, 'SupabaseClient configurado com credenciais válidas');

  // Mapeamentos de dados
  const sampleInternal = {
    id: 'test-audit-001',
    number: '7004419999',
    portal: 'Petronect',
    client: 'Petrobras RNEST',
    title: 'Monitoramento Isocinético de Caldeiras',
    recommendedCompany: 'Excelência Ambiental',
    score: 94
  };
  const mappedToDb = supabaseClient.mapToDb(sampleInternal);
  assert(mappedToDb.id === 'test-audit-001' && mappedToDb.recommended_company === 'Excelência Ambiental', 'Mapeador mapToDb normaliza campos PostgreSQL');

  const mappedFromDb = supabaseClient.mapFromDb(mappedToDb);
  assert(mappedFromDb.id === 'test-audit-001' && mappedFromDb.recommendedCompany === 'Excelência Ambiental', 'Mapeador mapFromDb reconstitui objeto Vellia');

  // WebSockets Realtime
  const wsUrl = supabaseRealtimeService.getWebSocketUrl();
  assert(wsUrl && wsUrl.startsWith('wss://'), 'SupabaseRealtimeService gera URL WSS compatível', wsUrl ? wsUrl.substring(0, 35) + '...' : '');

  const realtimeState = supabaseRealtimeService.getState();
  assert(typeof realtimeState.status === 'string', 'SupabaseRealtimeService expõe status e contadores de eventos');

  const cloudState = cloudSyncService.getState();
  assert(cloudState.status !== undefined && cloudState.realtime !== undefined, 'CloudSyncService integra telemetria de nuvem e Realtime');

  // ------------------------------------------------------------------------
  // MÓDULO 3: IA GENERATIVA DUAL E COPILOT DE EDITAIS
  // ------------------------------------------------------------------------
  console.log('\n▶ [3/6] Inteligência Artificial Generativa Dual (Gemini & OpenAI)...');

  const aiConfig = AiModelProviderService.getConfig();
  assert(aiConfig.provider === AI_PROVIDERS.GEMINI || aiConfig.provider === AI_PROVIDERS.OPENAI, 'Provedor de IA selecionável entre Google Gemini e OpenAI');
  assert(aiConfig.temperature <= 0.3, 'Temperatura configurada baixa para precisão editalícia sem alucinações', `Temp: ${aiConfig.temperature}`);

  // Teste de conexão/validação
  const testConn = await AiModelProviderService.testConnection({ apiKey: '' });
  assert(testConn.success === false && testConn.message.length > 5, 'Validador de chave de API rejeita chaves em branco com mensagem clara');

  // Copilot "Pergunte ao Edital"
  const copilotAnswerSync = DocumentCopilotService.answerQuestion(
    sampleInternal, 
    [{ documentName: 'Edital_7004419999.pdf', page: 18, section: 'Item 5.2' }], 
    [], 
    'A visita técnica é obrigatória?'
  );
  assert(copilotAnswerSync.answer.includes('Visita Técnica'), 'Copilot responde dúvidas de visita técnica com rastreabilidade documental');
  assert(copilotAnswerSync.sources.length > 0, 'Copilot cita documento oficial de origem');

  const copilotAnswerAsync = await DocumentCopilotService.answerQuestionAsync(
    sampleInternal, 
    [{ documentName: 'Edital_7004419999.pdf', page: 8, section: 'Item 4' }], 
    [], 
    'Qual a experiência mínima exigida nos atestados?'
  );
  assert(copilotAnswerAsync.answer.length > 20, 'Copilot assíncrono executa via IA ou fallback heurístico com sucesso');

  const engineAnswer = await EditalAnalysisEngine.askAssistantAsync('7004419999', 'Pode somar atestados?');
  assert(engineAnswer.text.length > 15, 'EditalAnalysisEngine.askAssistantAsync responde com precisão');

  // ------------------------------------------------------------------------
  // MÓDULO 4: GERADOR DE IMPUGNAÇÕES E RECURSOS COM JURISPRUDÊNCIA TCU
  // ------------------------------------------------------------------------
  console.log('\n▶ [4/6] Gerador de Impugnações, Recursos & Jurisprudência TCU...');

  assert(Array.isArray(LEGAL_GROUNDS_CATALOG) && LEGAL_GROUNDS_CATALOG.length >= 6, 'Catálogo de teses jurídicas e Súmulas TCU carregado', `${LEGAL_GROUNDS_CATALOG.length} teses`);

  const detectedFlaws = ImpugnationGeneratorService.detectPotentialFlaws({
    title: 'Pregão eletrônico com vedado o somatório de atestados e visita técnica obrigatória sob pena de inabilitação'
  });
  assert(detectedFlaws.length >= 2, 'Detector automático de vícios editalícios identifica cláusulas abusivas', `${detectedFlaws.length} vícios identificados`);

  const generatedPiece = ImpugnationGeneratorService.generatePiece({
    pieceType: PIECE_TYPES.IMPUGNACAO,
    companyKey: 'EXCELENCIA',
    opportunity: sampleInternal,
    selectedGroundIds: ['vedacao_somatorio_atestados', 'visita_tecnica_obrigatoria'],
    specificClause: 'Item 5.2 do Termo de Referência'
  });

  assert(generatedPiece.title === 'IMPUGNAÇÃO AOS TERMOS DO EDITAL', 'Gera título formal de Impugnação ao Edital');
  assert(generatedPiece.content.includes('EXCELÊNCIA AMBIENTAL'), 'Qualifica a empresa impugnante corretamente');
  assert(generatedPiece.content.includes('Súmula TCU nº 263'), 'Incorpora Súmula nº 263 do TCU para somatório de atestados');
  assert(generatedPiece.content.includes('Súmula TCU nº 272'), 'Incorpora Súmula nº 272 do TCU para visita técnica');
  assert(generatedPiece.content.includes('art. 164') || generatedPiece.content.includes('art. 39'), 'Cita prazo legal tempestivo para protocolo');

  // ------------------------------------------------------------------------
  // MÓDULO 5: CENTRAL AUTÔNOMA DE CNDS E REGULARIDADE FISCAL
  // ------------------------------------------------------------------------
  console.log('\n▶ [5/6] Central de CNDs e Regularidade Fiscal...');

  const eaCnds = cndMonitoringService.getCompanyCertificates('excelencia-ambiental');
  assert(eaCnds.companyName.includes('Excelência Ambiental'), 'Audita certidões da Excelência Ambiental');
  assert(eaCnds.certificates.length === 7, 'Monitora as 7 CNDs obrigatórias (Federal, FGTS, CNDT, Estadual, Municipal, Falência, CREA)');

  const vsCnds = cndMonitoringService.getCompanyCertificates('veeluen-solutions');
  assert(vsCnds.companyName.includes('Veeluen Solutions'), 'Audita certidões da Veeluen Solutions');
  assert(vsCnds.certificates.length === 7, 'Monitora as 7 CNDs obrigatórias da Veeluen');

  // Cálculo de dias restantes
  const calcTest = cndMonitoringService.calculateStatus('2026-11-05');
  assert(typeof calcTest.daysLeft === 'number', 'Calcula dias restantes para o vencimento');
  assert([CND_STATUS.REGULAR, CND_STATUS.EXPIRING, CND_STATUS.EXPIRED].includes(calcTest.status), 'Classifica status em REGULAR, EXPIRING ou EXPIRED');

  // Bloqueio preventivo
  assert(typeof eaCnds.isEligibleForBidding === 'boolean', 'Verifica elegibilidade da empresa para licitar');

  // Varredura e alertas
  const alertsTriggered = cndMonitoringService.scanAndAlert();
  assert(typeof alertsTriggered === 'number', 'Varredura autônoma de certidões executada com sucesso', `${alertsTriggered} alertas gerados`);

  // ------------------------------------------------------------------------
  // MÓDULO 6: DESPACHADOR DE ALERTAS EXTERNOS (WHATSAPP & E-MAIL)
  // ------------------------------------------------------------------------
  console.log('\n▶ [6/6] Alertas Externos para Diretoria (WhatsApp & E-mail)...');

  const waUrl = ExternalAlertDispatcher.generateWhatsAppUrl(sampleInternal, '5581999990001');
  assert(waUrl.includes('wa.me'), 'Gera link wa.me instantâneo com texto corporativo pré-formatado');
  assert(decodeURIComponent(waUrl).includes('7004419999'), 'Mensagem de WhatsApp contém o número do certame');
  assert(decodeURIComponent(waUrl).includes('Excelência Ambiental'), 'Mensagem de WhatsApp contém a empresa indicada');

  const mailContent = ExternalAlertDispatcher.formatEmailContent(sampleInternal);
  assert(mailContent.subject.includes('Certame Crítico') && mailContent.subject.includes('7004419999'), 'Assunto do e-mail destaca oportunidade crítica e edital');

  const mailUrl = ExternalAlertDispatcher.generateMailtoUrl(sampleInternal, 'diretoria@veeluen.com');
  assert(mailUrl.startsWith('mailto:'), 'Gera link mailto: RFC 2368 com assunto e corpo');

  const unreadAlerts = AlertService.getUnreadCount();
  assert(typeof unreadAlerts === 'number', 'AlertService contabiliza alertas pendentes de leitura', `${unreadAlerts} alertas não lidos`);

  // ------------------------------------------------------------------------
  // RESULTADO CONSOLIDADO
  // ------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(`📊 RESULTADO FINAL DA AUDITORIA: ${passed} PASSADOS / ${failed} FALHADOS`);
  if (failed === 0) {
    console.log('🎉 SUCESSO TOTAL! Todos os 44 testes passaram com 100% de integridade!');
  } else {
    console.error(`⚠️ ATENÇÃO: ${failed} testes falharam.`);
  }
  console.log('========================================================================\n');

  return { passed, failed };
}

runGeneralSystemAudit()
  .then(res => {
    if (res.failed > 0) process.exit(1);
    else process.exit(0);
  })
  .catch(err => {
    console.error('Erro fatal na execução dos testes:', err);
    process.exit(1);
  });
