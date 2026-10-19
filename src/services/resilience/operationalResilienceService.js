/**
 * VELLIA LICITACOES - FASE 49
 * SERVICO DE SEGURANCA OPERACIONAL + RESILIENCIA + CONTINUIDADE DE NEGOCIO
 * Principio Central: FAIL SAFE nao FAIL OPEN.
 * Falha isolada nao derruba a plataforma. Graceful Degradation explicita.
 * Retry idempotente. NEVER BLIND RETRY.
 */
import { logService, LogType } from '../logService.js';

export const CircuitBreakerState = { CLOSED:'Closed', OPEN:'Open', HALF_OPEN:'Half-Open' };
export const IncidentSeverity = { SEV_1:'SEV-1', SEV_2:'SEV-2', SEV_3:'SEV-3', SEV_4:'SEV-4' };
export const IncidentStatus = { INVESTIGATING:'Investigating', IDENTIFIED:'Identified', MITIGATING:'Mitigating', MONITORING:'Monitoring', RESOLVED:'Resolved' };
export const MaintenanceMode = { NONE:'None', READ_ONLY:'Read-Only', PARTIAL:'Partial', FULL:'Full-Maintenance' };
export const DLQAction = { INSPECT:'Inspect', RETRY:'Retry', RESOLVE:'Resolve', DISCARD:'Discard' };
export const JobStatus = { PENDING:'Pending', RUNNING:'Running', COMPLETED:'Completed', FAILED:'Failed', STUCK_SUSPECTED:'Stuck Suspected', RECOVERED:'Recovered' };

export const DEPENDENCY_MAP = [
  { service:'Document Analysis', domain:['Storage','AI Core','Database'], tier:'TIER-2', degradedBehavior:'Bloqueia nova extracao IA; documentos existentes acessiveis.', affectsModules:['Documentos','Analise de Edital','Proposta'] },
  { service:'Radar / PNCP Sync', domain:['Integrations','Database'], tier:'TIER-2', degradedBehavior:'Dados existentes permanecem. Nova sync: Pending. Missed Window ao retornar.', affectsModules:['Radar','Oportunidades','Early Radar'] },
  { service:'AI Semantic Engine', domain:['AI Core'], tier:'TIER-2', degradedBehavior:'Analises semanticas em fila. Visualizacao e filtros continuam. SEM resposta fake.', affectsModules:['Copilot','Analise Edital','Scoring'] },
  { service:'Authentication', domain:['Authentication'], tier:'TIER-1', degradedBehavior:'FAIL SAFE: bloqueia acesso se falhar. Sessoes ativas por TTL local.', affectsModules:['Todos os modulos'] },
  { service:'Database (Core)', domain:['Database'], tier:'TIER-1', degradedBehavior:'Escritas bloqueadas. NAO aceita escrita sem confirmacao.', affectsModules:['Oportunidades','Contratos','Propostas','CRM','Audit Log'] },
  { service:'Email Provider', domain:['Email'], tier:'TIER-3', degradedBehavior:'Status: Pending External Delivery. NAO marca como Sent. Retry com idempotencia.', affectsModules:['Comunicacoes','Alertas'] },
  { service:'Calendar Provider', domain:['Calendar'], tier:'TIER-3', degradedBehavior:'Evento mantido internamente. NAO afirma sync externa.', affectsModules:['Agenda'] },
  { service:'Search Provider', domain:['Search'], tier:'TIER-2', degradedBehavior:'Fallback para busca simples por campo.', affectsModules:['Busca Universal','Knowledge Graph'] },
  { service:'Storage (Documentos)', domain:['Storage'], tier:'TIER-1', degradedBehavior:'Upload bloqueado. Metadata preservada. NAO perde metadata por falha.', affectsModules:['Documentos','Document Vault'] },
  { service:'Audit Log Service', domain:['Audit Log'], tier:'TIER-1', degradedBehavior:'FAIL SAFE: Acoes criticas BLOQUEADAS se audit indisponivel. Override sem auditoria: NEGADO.', affectsModules:['Todas as acoes criticas','Aprovacoes'] },
  { service:'Job Queue / Workers', domain:['Queues'], tier:'TIER-2', degradedBehavior:'Jobs com lease/lock. Stuck jobs por heartbeat. Job nao desaparece se worker reiniciar.', affectsModules:['Workflows','Sincronizacao','Automacoes'] }
];

export const RUNBOOKS = [
  { id:'RB-DB-OUTAGE', title:'Runbook: Database Outage',
    symptom:'Escritas bloqueadas. Timeout em operacoes criticas.',
    impact:'Oportunidades, Contratos e Audit Log indisponiveis para escrita.',
    diagnosis:['Verificar Connection Pool. Testar conectividade de rede.'],
    mitigation:['1. Ativar modo Read-Only. 2. Nao aceitar escritas. 3. Notificar DBA.'],
    recovery:['1. Restaurar conectividade. 2. Validar integridade. 3. Processar backlog.'],
    validation:['Testar login, leitura e escrita. Confirmar Audit Log funcionando.'] },
  { id:'RB-AI-OUTAGE', title:'Runbook: AI Core Outage',
    symptom:'Analises semanticas falham. Copilot sem resposta generativa.',
    impact:'Dados estruturados continuam. Visualizacao e filtros funcionam. SEM resposta fake.',
    diagnosis:['Verificar CB-AI-CORE. Testar endpoint. Conferir quota.'],
    mitigation:['1. Desativar FF-AI-SEMANTIC. 2. Banner: Analise IA indisponivel. 3. Fila DLQ.'],
    recovery:['1. Reativar flags. 2. Processar DLQ. 3. Validar analise de referencia.'],
    validation:['Analise de edital de teste. Scoring calculado. Copilot respondendo.'] },
  { id:'RB-PNCP-OUTAGE', title:'Runbook: PNCP API Outage',
    symptom:'Sincronizacao PNCP falha. Nenhuma nova oportunidade importada.',
    impact:'Dados existentes permanecem. Nova sync: Pending. Missed Window ativado.',
    diagnosis:['Verificar CB-PNCP. Testar endpoint pncp.gov.br.'],
    mitigation:['1. Modo degradado: dados existentes continuam. 2. Banner de aviso.'],
    recovery:['1. Missed Window Detector recupera periodo. 2. Sync incremental. 3. DataQualityIssue se lacuna.'],
    validation:['Confirmar novas oportunidades sincronizadas.'] },
  { id:'RB-EMAIL-OUTAGE', title:'Runbook: Email Provider Outage',
    symptom:'Envios falham. Timeouts no SMTP.',
    impact:'Emails com status Pending External Delivery. NENHUM marcado como Sent.',
    diagnosis:['Verificar CB-EMAIL. Testar SMTP. Conferir DLQ.'],
    mitigation:['1. Mensagens mantidas. 2. NAO marcar como enviado. 3. Idempotency keys preservadas.'],
    recovery:['1. Retry com backoff. 2. Verificar idempotency key antes de reenviar.'],
    validation:['Email de teste entregue. DLQ limpa. Sem duplicacoes.'] },
  { id:'RB-STORAGE-OUTAGE', title:'Runbook: Storage Outage',
    symptom:'Upload falha. Leitura timeout.',
    impact:'Uploads bloqueados. Metadata preservada.',
    diagnosis:['Verificar CB-STORAGE. Testar acesso ao bucket.'],
    mitigation:['1. Bloquear upload. 2. Manter metadata. 3. Banner de aviso.'],
    recovery:['1. Restaurar acesso. 2. Processar uploads pendentes. 3. Validar hashes.'],
    validation:['Upload de teste. Hash verificado. Metadata integra.'] },
  { id:'RB-AUTH-INCIDENT', title:'Runbook: Authentication Incident',
    symptom:'Login falha. Sessoes expiradas. Token invalido.',
    impact:'TIER-1: Impacto total em todos os modulos.',
    diagnosis:['Verificar servico de autenticacao. Conferir rotacao de chaves.'],
    mitigation:['1. Sessoes por TTL local. 2. Break Glass auditado. 3. Revogar tokens.'],
    recovery:['1. Restaurar servico. 2. Forcr re-login suspeitas. 3. Auditar acessos.'],
    validation:['Login completo de teste. Auditoria verificada.'] },
  { id:'RB-QUEUE-BACKLOG', title:'Runbook: Queue Backlog',
    symptom:'Jobs acumulando. Alertas de fila. Workflows presos.',
    impact:'Atrasos em automacoes e notificacoes.',
    diagnosis:['Verificar tamanho da fila. Identificar jobs stuck.'],
    mitigation:['1. Pausar jobs nao criticos. 2. Priorizar TIER-1.'],
    recovery:['1. Aumentar workers. 2. Processar DLQ.'],
    validation:['Fila normalizada. Nenhum job Stuck Suspected.'] }
];

export const BACKUP_POLICY = {
  types: [
    { type:'Database', schedule:'Diario as 02:00 BRT', retention:'90 dias', rpo:'24h', rto:'4h', tier:'TIER-1', lastBackupAt:'2026-10-16T02:00:00-03:00', lastRestoreTestAt:'2026-10-01T10:00:00-03:00', restoreTestResult:'PASSED' },
    { type:'Critical Files', schedule:'Diario as 03:00 BRT', retention:'365 dias', rpo:'24h', rto:'6h', tier:'TIER-1', lastBackupAt:'2026-10-16T03:00:00-03:00', lastRestoreTestAt:'2026-10-01T11:00:00-03:00', restoreTestResult:'PASSED' },
    { type:'Configuration', schedule:'Semanal (Sextas 01:00 BRT)', retention:'180 dias', rpo:'7d', rto:'2h', tier:'TIER-2', lastBackupAt:'2026-10-11T01:00:00-03:00', lastRestoreTestAt:'2026-10-01T12:00:00-03:00', restoreTestResult:'PASSED' },
    { type:'Templates & Reports', schedule:'Semanal (Sextas 01:30 BRT)', retention:'90 dias', rpo:'7d', rto:'8h', tier:'TIER-3', lastBackupAt:'2026-10-11T01:30:00-03:00', lastRestoreTestAt:'2026-09-15T10:00:00-03:00', restoreTestResult:'PASSED' }
  ],
  principle:'Backup que nunca foi restaurado nao e garantia. Restore Test obrigatorio em ambiente isolado.',
  restoreDrillProcedure:[
    '1. Selecionar backup de referencia (retencao mediana).',
    '2. Restaurar em staging ISOLADO (NUNCA em producao).',
    '3. Validar: Database -> Login -> Oportunidades -> Documentos -> Workflows.',
    '4. Registrar resultado no Audit Log com hash do backup.',
    '5. Comunicar resultado via relatorio de Restore Test.'
  ]
};

export const SERVICE_CRITICALITY = [
  { tier:'TIER-1', label:'Tier 1 — Critico (FAIL SAFE)', color:'#DC2626',
    services:['Autenticacao','Database (Core)','Oportunidades','Documentos Criticos','Audit Log'],
    policy:'FAIL SAFE imediato. Manutencao exige Break Glass ou janela formal aprovada.' },
  { tier:'TIER-2', label:'Tier 2 — Alta Prioridade', color:'#D97706',
    services:['Radar','Workflows','Approvals','AI Engine','Search','Sincronizacoes'],
    policy:'Degradacao controlada. Fallback disponivel. Alertas automaticos.' },
  { tier:'TIER-3', label:'Tier 3 — Suporte', color:'#2563EB',
    services:['Analytics Secundarios','Relatorios Historicos','Email/Calendar External'],
    policy:'Degradacao aceitavel. Comunicacao ao usuario sem urgencia.' }
];

const CB0 = new Date().toISOString();
const INITIAL_CB = [
  { id:'CB-PNCP', name:'PNCP API', domain:'Integrations', state:'Closed', failureCount:0, failureThreshold:5, successThreshold:2, lastFailureAt:null, openedAt:null, halfOpenAt:null, recoveryWindowMs:30000, retryPolicy:'Safe', lastCheckedAt:CB0 },
  { id:'CB-PETRONECT', name:'Petronect Portal', domain:'Integrations', state:'Closed', failureCount:2, failureThreshold:5, successThreshold:2, lastFailureAt:new Date(Date.now()-40*60000).toISOString(), openedAt:null, halfOpenAt:null, recoveryWindowMs:30000, retryPolicy:'Safe', lastCheckedAt:CB0 },
  { id:'CB-AI-CORE', name:'AI Core (Gemini)', domain:'AI Core', state:'Closed', failureCount:0, failureThreshold:3, successThreshold:2, lastFailureAt:null, openedAt:null, halfOpenAt:null, recoveryWindowMs:60000, retryPolicy:'Safe', lastCheckedAt:CB0 },
  { id:'CB-EMAIL', name:'Email Provider (SMTP)', domain:'Email', state:'Closed', failureCount:0, failureThreshold:5, successThreshold:2, lastFailureAt:null, openedAt:null, halfOpenAt:null, recoveryWindowMs:120000, retryPolicy:'Restricted', lastCheckedAt:CB0 },
  { id:'CB-STORAGE', name:'Storage / Document Vault', domain:'Storage', state:'Closed', failureCount:0, failureThreshold:5, successThreshold:2, lastFailureAt:null, openedAt:null, halfOpenAt:null, recoveryWindowMs:30000, retryPolicy:'Safe', lastCheckedAt:CB0 }
];

const INITIAL_DLQ = [
  { id:'DLQ-001', type:'EVENT', name:'OpportunityScored OPP-2026-001',
    failedAt:new Date(Date.now()-2*3600000).toISOString(), attempts:3, maxAttempts:3,
    error:'AI Core timeout 30s. Circuit Breaker aberto em CB-AI-CORE.',
    idempotencyKey:'EVT-OPP-SCORED-2026001-20261015T142300Z',
    payload:{ opportunityId:'OPP-2026-001', event:'OpportunityScored' },
    status:'Dead', action:null, discardReason:null },
  { id:'DLQ-002', type:'JOB', name:'RadarSync PNCP Batch 2026-10-14',
    failedAt:new Date(Date.now()-6*3600000).toISOString(), attempts:2, maxAttempts:3,
    error:'PNCP offline. Janela perdida de 6h. DataQualityIssue gerado.',
    idempotencyKey:'JOB-RADAR-PNCP-20261014',
    payload:{ connector:'PNCP', windowStart:'2026-10-14T08:00:00Z', windowEnd:'2026-10-14T14:00:00Z' },
    status:'Dead', action:null, discardReason:null },
  { id:'DLQ-003', type:'INTEGRATION', name:'EmailNotification Prazo Petrobras RNEST',
    failedAt:new Date(Date.now()-90*60000).toISOString(), attempts:1, maxAttempts:3,
    error:'Email provider timeout. Idempotency key preservada para retry seguro.',
    idempotencyKey:'EMAIL-ALERT-OPP-2026-001-DEADLINE-20261016T140000Z',
    payload:{ to:'roberto@veeluen.com.br', subject:'Prazo: Petrobras RNEST em 3 dias', status:'Pending External Delivery' },
    status:'Dead', action:null, discardReason:null }
];

const INITIAL_JOBS = [
  { id:'JOB-RADAR-001', name:'RadarSync PNCP Diario', type:'SYNC', status:'Completed',
    startedAt:new Date(Date.now()-3*3600000).toISOString(), completedAt:new Date(Date.now()-2.8*3600000).toISOString(),
    heartbeatAt:new Date(Date.now()-2.8*3600000).toISOString(), leaseId:'LEASE-RADAR-001', stuckThresholdMs:30*60*1000,
    resultSummary:'14 oportunidades novas. 0 erros.' },
  { id:'JOB-DOCANALYSIS-002', name:'DocumentAnalysis Edital Petrobras RNEST', type:'AI_EXTRACTION', status:'Completed',
    startedAt:new Date(Date.now()-1*3600000).toISOString(), completedAt:new Date(Date.now()-0.7*3600000).toISOString(),
    heartbeatAt:new Date(Date.now()-0.7*3600000).toISOString(), leaseId:'LEASE-DOC-002', stuckThresholdMs:60*60*1000,
    resultSummary:'47 clausulas extraidas. Confianca: 96%.' },
  { id:'JOB-CONTRACTPERF-003', name:'ContractPerformanceReview CTR-2026-001', type:'INTERNAL_CALCULATION', status:'Running',
    startedAt:new Date(Date.now()-25*60000).toISOString(), completedAt:null,
    heartbeatAt:new Date(Date.now()-3*60000).toISOString(), leaseId:'LEASE-PERF-003', stuckThresholdMs:120*60*1000, resultSummary:null },
  { id:'JOB-EMAIL-NOTIFY-004', name:'EmailNotification Prazo Critico RNEST', type:'EXTERNAL_ACTION', status:'Failed',
    startedAt:new Date(Date.now()-90*60000).toISOString(), completedAt:null,
    heartbeatAt:new Date(Date.now()-89*60000).toISOString(), leaseId:'LEASE-EMAIL-004', stuckThresholdMs:10*60*1000,
    resultSummary:'Email provider timeout. Movido para DLQ-003 com idempotency key.' }
];

const INITIAL_INCIDENTS = [
  { id:'INC-2026-001', title:'PNCP API - Indisponibilidade de 6 horas',
    severity:'SEV-2', status:'Resolved',
    startedAt:'2026-10-14T08:00:00Z', resolvedAt:'2026-10-14T14:00:00Z', duration:'6h 00min',
    servicesAffected:['Radar','PNCP Sync','Early Radar'],
    impact:'Nenhuma nova oportunidade sincronizada. Dados existentes permaneceram. CRM, Documentos e Contratos sem impacto.',
    owner:'Roberto Mendes (Ops)',
    rootCause:'Manutencao nao anunciada do provedor PNCP.',
    resolution:'Sync incremental executado. 3 oportunidades recuperadas. DataQualityIssue gerado.',
    timeline:[
      { at:'2026-10-14T08:00:00Z', event:'Conector PNCP OFFLINE. Circuit Breaker aberto.' },
      { at:'2026-10-14T08:05:00Z', event:'Alerta SEV-2. Banner exibido para usuarios.' },
      { at:'2026-10-14T08:10:00Z', event:'Roberto Mendes como Incident Owner.' },
      { at:'2026-10-14T14:00:00Z', event:'PNCP retorna. Sync incremental. Circuit Breaker Half-Open.' },
      { at:'2026-10-14T14:12:00Z', event:'Sync confirmado. CB Closed. Incidente Resolvido.' }
    ],
    postmortem:{ required:true, completed:true,
      whatHappened:'Manutencao nao comunicada do provedor PNCP.',
      impact:'Janela de 6h sem sync. Dados nao perdidos.',
      cause:'Ausencia de comunicacao antecipada de manutencao.',
      fix:'Missed Window Detector funcionou. DataQualityIssue criado.',
      prevention:'Monitorar changelog do PNCP. Alarme de outage antecipado.' } },
  { id:'INC-2026-002', title:'Email Provider - Timeout em lote de notificacoes',
    severity:'SEV-3', status:'Resolved',
    startedAt:new Date(Date.now()-90*60000).toISOString(),
    resolvedAt:new Date(Date.now()-20*60000).toISOString(), duration:'1h 10min',
    servicesAffected:['Email','Notificacoes de Alerta'],
    impact:'E-mails Pending External Delivery. Nenhum marcado como Sent indevidamente. Idempotency preservada.',
    owner:'Sistema (Auto-detected)',
    rootCause:'Timeout do SMTP apos rate limit. Idempotency impediu duplicacao.',
    resolution:'Retry com backoff. Emails entregues. DLQ-003 resolvida.',
    timeline:[
      { at:new Date(Date.now()-90*60000).toISOString(), event:'Email provider timeout. Status: Pending External Delivery.' },
      { at:new Date(Date.now()-87*60000).toISOString(), event:'DLQ-003 criado. Idempotency key registrada.' },
      { at:new Date(Date.now()-20*60000).toISOString(), event:'Retry concluido. Email entregue. Incidente resolvido.' }
    ],
    postmortem:{ required:false, completed:false } }
];

const INITIAL_FLAGS = [
  { id:'FF-AI-SEMANTIC', name:'AI Semantic Analysis', enabled:true, scope:'GLOBAL', description:'Analise semantica por IA. Desativar se provider indisponivel.' },
  { id:'FF-PNCP-SYNC', name:'PNCP Auto-Sync', enabled:true, scope:'GLOBAL', description:'Sincronizacao automatica com PNCP.' },
  { id:'FF-PETRONECT-SYNC', name:'Petronect Auto-Sync', enabled:true, scope:'GLOBAL', description:'Sincronizacao automatica com Petronect.' },
  { id:'FF-EMAIL-ALERTS', name:'Email Alerts', enabled:true, scope:'GLOBAL', description:'Envio de alertas por email. Desativar se provider instavel.' },
  { id:'FF-CALENDAR-SYNC', name:'Calendar External Sync', enabled:true, scope:'GLOBAL', description:'Sincronizacao externa de calendario.' },
  { id:'FF-BULK-AI-BATCH', name:'Bulk AI Batch Processing', enabled:false, scope:'GLOBAL', description:'Processamento em lote IA. Desabilitado por padrao.' },
  { id:'FF-ADVANCED-SEARCH', name:'Advanced Semantic Search', enabled:true, scope:'GLOBAL', description:'Busca semantica. Fallback automatico para busca simples se offline.' }
];
