/**
 * VELLIA LICITAÇÕES — FASE 14: SUÍTE DE TESTES E VALIDAÇÃO AUTOMATIZADA
 * test_phase14_pipeline.js: Executa a bateria de testes de conformidade dos Itens 75 a 81.
 * 
 * Cobre:
 * 1. Testes de permissão para Administrador, Licitações, Técnico, Financeiro e Visualizador (Item 75)
 * 2. TESTE CRÍTICO: Usuário técnico tentando acessar margem -> NEGADO (Item 76)
 * 3. TESTE CRÍTICO: Usuário visualizador tentando alterar oportunidade -> NEGADO (Item 77)
 * 4. TESTE CRÍTICO: Usuário sem acesso à Excelência Ambiental tentando abrir documento confidencial dela -> NEGADO (Item 78)
 * 5. TESTE DE AUDITORIA: Alteração de preço -> criação compulsória de audit log com diff antes e depois (Item 79)
 * 6. TESTE DE BACKUP: Simulação de backup com sucesso e backup com falha com disparo de alertas (Item 80)
 * 7. TESTE DE IMUTABILIDADE: Tentativa de exclusão de log de auditoria -> RECUSADA com exceção (Item 22)
 * 8. TESTE DE POLÍTICA DE SEGURANÇA: Bloqueio automático de usuário após tentativas excessivas (Item 14)
 * 9. TESTE DE VERSIONAMENTO DE SCORE: Publicação de nova versão sem adulteração do histórico (Itens 38 a 40)
 * 10. TESTE DE JOBS E LOCKS: Bloqueio de duplicidade concorrente (Item 68)
 */

import {
  AdminService,
  SecurityService,
  GeneralAuditService,
  BackupService,
  BackupStatus,
  SystemConfigService,
  IntegrationService,
  ObservabilityService,
  Permissions,
  UserRole,
  UserStatus,
  CompanyScope,
  DocumentConfidentiality,
  maskSecret
} from './adminService.js';

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
  console.log('🚀 INICIANDO TESTES DA FASE 14 — ADMINISTRAÇÃO, SEGURANÇA E AUDITORIA');
  console.log('================================================================\n');

  // Recupera os usuários padrão
  const users = SecurityService.getUsers();
  const adminUser = users.find(u => u.role === UserRole.ADMINISTRADOR);
  const tecnicoUser = users.find(u => u.role === UserRole.TECNICO && u.company === 'Veeluen Solutions');
  const viewerUser = users.find(u => u.role === UserRole.VISUALIZADOR);
  const financeiroUser = users.find(u => u.role === UserRole.FINANCEIRO);
  const licitaUser = users.find(u => u.role === UserRole.LICITACOES);

  // -------------------------------------------------------------
  // TESTE 1: USUÁRIOS E PERFIS PADRÃO (Itens 2, 4, 75)
  // -------------------------------------------------------------
  console.log('▶ [1] Verificação da criação e mapeamento de usuários por papel:');
  assert(adminUser !== undefined, 'Usuário Administrador cadastrado com sucesso');
  assert(tecnicoUser !== undefined, 'Usuário Técnico cadastrado com sucesso');
  assert(viewerUser !== undefined, 'Usuário Visualizador cadastrado com sucesso');
  assert(financeiroUser !== undefined, 'Usuário Financeiro cadastrado com sucesso');
  assert(licitaUser !== undefined, 'Usuário Licitações cadastrado com sucesso');

  // -------------------------------------------------------------
  // TESTE 2: TESTE CRÍTICO — TÉCNICO TENTANDO ACESSAR MARGEM -> NEGADO (Item 76)
  // -------------------------------------------------------------
  console.log('\n▶ [2] TESTE CRÍTICO (Item 76): Usuário Técnico tentando acessar margem financeira:');
  const tecnicoHasMarginPermission = SecurityService.hasPermission(tecnicoUser, Permissions.MARGIN_VIEW);
  assert(tecnicoHasMarginPermission === false, 'SecurityService.hasPermission retornou false para Técnico em margin.view');

  let accessBlocked = false;
  try {
    SecurityService.enforcePermission(tecnicoUser, Permissions.MARGIN_VIEW, {
      module: 'Formação de Preço',
      object: 'Proposta PR-2026-001'
    });
  } catch (err) {
    if (err.code === 'PERMISSION_DENIED') {
      accessBlocked = true;
    }
  }
  assert(accessBlocked === true, 'Acesso server-side foi NEGADO com exceção PERMISSION_DENIED (403)');

  // Usuário Financeiro deve ter acesso à margem
  const financeiroHasMargin = SecurityService.hasPermission(financeiroUser, Permissions.MARGIN_VIEW);
  assert(financeiroHasMargin === true, 'Usuário Financeiro possui acesso autorizado a margin.view');

  // -------------------------------------------------------------
  // TESTE 3: TESTE CRÍTICO — VISUALIZADOR TENTANDO ALTERAR OPORTUNIDADE -> NEGADO (Item 77)
  // -------------------------------------------------------------
  console.log('\n▶ [3] TESTE CRÍTICO (Item 77): Usuário Visualizador tentando alterar oportunidade:');
  const viewerCanEdit = SecurityService.hasPermission(viewerUser, Permissions.OPPORTUNITY_EDIT);
  assert(viewerCanEdit === false, 'Visualizador não possui permissão opportunity.edit');

  let editBlocked = false;
  try {
    SecurityService.enforcePermission(viewerUser, Permissions.OPPORTUNITY_EDIT, {
      module: 'Oportunidades',
      object: 'OPP-7004218991'
    });
  } catch (err) {
    if (err.code === 'PERMISSION_DENIED') {
      editBlocked = true;
    }
  }
  assert(editBlocked === true, 'Tentativa de alteração de oportunidade pelo Visualizador foi NEGADA no backend');

  // -------------------------------------------------------------
  // TESTE 4: TESTE CRÍTICO — USUÁRIO DE UMA EMPRESA ACESSANDO DOC CONFIDENCIAL DE OUTRA (Item 78)
  // -------------------------------------------------------------
  console.log('\n▶ [4] TESTE CRÍTICO (Item 78): Usuário sem acesso à Excelência tentando abrir documento confidencial dela:');
  
  // Criar ou usar usuário estritamente vinculado à Veeluen Solutions
  const userVeeluenOnly = {
    id: 'usr-veeluen-only',
    name: 'Operador Exclusivo Veeluen',
    role: UserRole.LICITACOES,
    company: 'Veeluen Solutions',
    affiliatedCompanies: ['Veeluen Solutions'],
    scope: CompanyScope.OWN_COMPANY,
    status: UserStatus.ATIVO
  };

  const docExcelenciaConfidential = {
    id: 'doc-conf-exc-01',
    title: 'Balanço Patrimonial Auditado e Estratégia de Lance',
    company: 'Excelência Ambiental',
    confidentiality: DocumentConfidentiality.CONFIDENCIAL
  };

  const canAccessDoc = SecurityService.canAccessDocument(userVeeluenOnly, docExcelenciaConfidential);
  assert(canAccessDoc === false, 'Acesso ao documento confidencial de outra empresa avaliado como FALSO');

  let docAccessBlocked = false;
  try {
    SecurityService.enforceDocumentAccess(userVeeluenOnly, docExcelenciaConfidential);
  } catch (err) {
    if (err.code === 'DOCUMENT_ACCESS_DENIED' || err.code === 'COMPANY_SCOPE_DENIED') {
      docAccessBlocked = true;
    }
  }
  assert(docAccessBlocked === true, 'EnforceDocumentAccess BLOQUEOU com segurança a leitura do documento de outra empresa');

  // Administrador com ALL_COMPANIES consegue acessar
  const adminCanAccess = SecurityService.canAccessDocument(adminUser, docExcelenciaConfidential);
  assert(adminCanAccess === true, 'Administrador com escopo ALL_COMPANIES acessa documento confidencial');

  // -------------------------------------------------------------
  // TESTE 5: TESTE DE AUDITORIA — ALTERAR PREÇO E GERAR LOG AUTOMÁTICO (Item 79)
  // -------------------------------------------------------------
  console.log('\n▶ [5] TESTE DE AUDITORIA (Item 79): Alteração de preço com log compulsório e diff antes/depois:');
  
  const initialLogCount = GeneralAuditService.getAuditLogs().length;

  const priceChangeLog = GeneralAuditService.logAction({
    user: 'Renata Vasconcelos',
    userRole: UserRole.FINANCEIRO,
    company: 'Veeluen Solutions',
    module: 'Formação de Preço',
    action: 'Alteração de Preço de Venda da Proposta',
    object: 'Proposta PR-2026-004 (Petrobras Gasoduto)',
    recordId: 'PR-2026-004',
    diffBefore: { precoTotal: 12500000.00, margemLiquidaPct: 18.5, bdiPct: 22.0 },
    diffAfter: { precoTotal: 11950000.00, margemLiquidaPct: 15.2, bdiPct: 19.8 },
    result: 'SUCESSO'
  });

  const updatedLogs = GeneralAuditService.getAuditLogs();
  assert(updatedLogs.length === initialLogCount + 1, 'Novo log de auditoria foi adicionado à trilha imutável');
  assert(priceChangeLog.diffBefore.precoTotal === 12500000.00, 'Valor anterior de preço registrado com precisão (R$ 12.500.000,00)');
  assert(priceChangeLog.diffAfter.precoTotal === 11950000.00, 'Valor novo de preço registrado com precisão (R$ 11.950.000,00)');
  assert(priceChangeLog.diffAfter.margemLiquidaPct === 15.2, 'Alteração de margem registrada no diff');

  // -------------------------------------------------------------
  // TESTE 6: IMUTABILIDADE DA AUDITORIA — NÃO APAGAR LOG (Item 22)
  // -------------------------------------------------------------
  console.log('\n▶ [6] TESTE DE IMUTABILIDADE (Item 22): Proteção contra exclusão de logs:');
  let deletionBlocked = false;
  try {
    GeneralAuditService.deleteLog(priceChangeLog.id);
  } catch (err) {
    if (err.message.toLowerCase().includes('imut')) {
      deletionBlocked = true;
    }
  }
  assert(deletionBlocked === true, 'GeneralAuditService.deleteLog BLOQUEOU exclusão de log (Erro de Imutabilidade emitido)');

  // -------------------------------------------------------------
  // TESTE 7: TESTE DE BACKUP — SUCESSO, FALHA E ALERTAS (Item 80, 27 a 33)
  // -------------------------------------------------------------
  console.log('\n▶ [7] TESTE DE BACKUP (Item 80): Simulação de backup bem-sucedido e com falha:');
  
  // Garantir usuário logado como admin para autorização do trigger
  SecurityService.setCurrentUser(adminUser.id);

  // Executa backup bem sucedido
  const successBackup = BackupService.triggerBackup({
    forceFailure: false
  });
  assert(successBackup.status === BackupStatus.SUCCESS, 'Backup executado com status SUCCESS');
  assert(successBackup.checksumSha256 !== null, 'Checksum SHA-256 gerado e verificado');

  // Executa backup com falha intencional
  const failedBackup = BackupService.triggerBackup({
    forceFailure: true
  });
  assert(failedBackup.status === BackupStatus.FAILED, 'Backup falho simulado com status FAILED');
  assert(failedBackup.errorMessage.includes('Timeout'), 'Mensagem de erro capturada com exatidão');

  // Verifica se o Overview disparou alerta crítico
  const overview = BackupService.getBackupOverview();
  const criticalAlert = overview.alerts.find(a => a.severity === 'CRITICAL');
  assert(criticalAlert !== undefined, 'Overview de Backup identificou a falha e disparou alerta de severidade CRITICAL');

  // -------------------------------------------------------------
  // TESTE 8: RESTAURAÇÃO PROTEGIDA COM CÓDIGO DUPLO (Itens 34, 35)
  // -------------------------------------------------------------
  console.log('\n▶ [8] TESTE DE RESTAURAÇÃO (Itens 34, 35): Exigência de confirmação reforçada:');
  let badRestoreBlocked = false;
  try {
    BackupService.restoreBackup(successBackup.id, 'CODIGO-ERRADO', adminUser);
  } catch (err) {
    if (err.code === 'INVALID_RESTORE_CONFIRMATION') {
      badRestoreBlocked = true;
    }
  }
  assert(badRestoreBlocked === true, 'Restauração sem código de confirmação correto foi recusada');

  const restoreResult = BackupService.restoreBackup(successBackup.id, 'RESTAURAR-VELLIA-CONFIRMADO', adminUser);
  assert(restoreResult.success === true, 'Restauração com código reforçado executada com sucesso e auditada');

  // -------------------------------------------------------------
  // TESTE 9: POLÍTICA DE SEGURANÇA & BLOQUEIO APÓS 5 TENTATIVAS (Itens 14, 18, 19)
  // -------------------------------------------------------------
  console.log('\n▶ [9] TESTE DE POLÍTICA DE SEGURANÇA: Bloqueio de usuário após falhas de login:');
  
  // Cria usuário temporário de teste
  const testUser = SecurityService.createUser({
    name: 'Teste Bloqueio Temporário',
    email: 'teste.lockout@vellia.com.br',
    role: UserRole.VISUALIZADOR,
    status: UserStatus.ATIVO
  });

  // Tenta 5 vezes com senha errada
  for (let i = 0; i < 5; i++) {
    SecurityService.authenticate('teste.lockout@vellia.com.br', 'senha_errada_xyz');
  }

  const updatedTestUser = SecurityService.getUserById(testUser.id);
  assert(updatedTestUser.status === UserStatus.BLOQUEADO, 'Usuário foi automaticamente BLOQUEADO após atingir o limite de tentativas');

  // -------------------------------------------------------------
  // TESTE 10: VERSIONAMENTO DE SCORES & PESOS (Itens 38, 39, 40)
  // -------------------------------------------------------------
  console.log('\n▶ [10] TESTE DE VERSIONAMENTO DE SCORE: Publicação de nova versão com histórico preservado:');
  
  const currentActive = SystemConfigService.getActiveScoreVersion();
  assert(currentActive.status === 'ACTIVE', 'Versão ativa identificada');

  const newVersion = SystemConfigService.publishNewScoreVersion({
    title: 'Calibração Q4 2026 — Foco em Petrobras Offshore',
    newWeights: {
      decisionScore: { technical: 0.45, commercial: 0.35, risk: 0.20 }
    },
    changeNotes: 'Aumento de peso técnico para concorrências do pré-sal'
  });

  assert(newVersion.status === 'ACTIVE', 'Nova versão publicada como ACTIVE');
  assert(newVersion.version === 'v2.1.0', `Versão incrementada corretamente: ${newVersion.version}`);

  const allVersions = SystemConfigService.getScoreVersions();
  const supersededVersion = allVersions.find(v => v.version === currentActive.version);
  assert(supersededVersion.status === 'SUPERSEDED', 'Versão anterior marcada como SUPERSEDED mantendo histórico intacto');

  // -------------------------------------------------------------
  // TESTE 11: CENTRAL DE INTEGRAÇÕES & MASCARAMENTO DE SEGREDOS (Itens 41, 43)
  // -------------------------------------------------------------
  console.log('\n▶ [11] TESTE DE INTEGRAÇÕES: Mascaramento seguro de chaves de API:');
  
  const secret = 'sk-proj-998877665544332211AABBCC';
  const masked = maskSecret(secret);
  assert(masked.startsWith('sk-') && masked.endsWith('BBCC') && masked.includes('••••'), `Segredo mascarado adequadamente: "${masked}"`);

  // -------------------------------------------------------------
  // TESTE 12: OBSERVABILIDADE, JOBS E LOCKS CONTRA DUPLA EXECUÇÃO (Itens 66, 68)
  // -------------------------------------------------------------
  console.log('\n▶ [12] TESTE DE JOBS E LOCKS: Proteção contra concorrência dupla:');
  
  ObservabilityService.acquireLock('SyncPetronectJob');
  let duplicatePrevented = false;
  try {
    ObservabilityService.acquireLock('SyncPetronectJob');
  } catch (err) {
    if (err.message.includes('Bloqueio de duplicidade')) {
      duplicatePrevented = true;
    }
  }
  assert(duplicatePrevented === true, 'Dupla execução concorrente do mesmo Job foi bloqueada com sucesso');
  ObservabilityService.releaseLock('SyncPetronectJob');

  // -------------------------------------------------------------
  // TESTE 13: EXCLUSÃO LÓGICA E LIXEIRA ADMINISTRATIVA (Itens 25, 26)
  // -------------------------------------------------------------
  console.log('\n▶ [13] TESTE DE LIXEIRA (Soft Delete e Restauração):');
  
  const trashEntry = SystemConfigService.moveToTrash({
    originalId: 'doc-teste-99',
    entityType: 'Documento',
    title: 'Atestado de Qualificação Técnica Teste',
    company: 'Veeluen Solutions',
    data: { sizeKB: 250 }
  });

  assert(trashEntry.id.startsWith('trash-'), 'Item arquivado na lixeira com exclusão lógica');
  
  const restored = SystemConfigService.restoreFromTrash(trashEntry.id);
  assert(restored.originalId === 'doc-teste-99', 'Item restaurado com sucesso da lixeira');

  // -------------------------------------------------------------
  // RESUMO GERAL
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 RESULTADO FINAL DA SUÍTE DE TESTES (FASE 14):`);
  console.log(`   Total de Testes: ${passed + failed}`);
  console.log(`   Sucessos (✓):     ${passed}`);
  console.log(`   Falhas (✗):       ${failed}`);
  console.log('================================================================\n');

  if (failed === 0) {
    console.log('🎉 TODOS OS TESTES DA FASE 14 PASSARAM COM 100% DE SUCESSO!\n');
    return true;
  } else {
    console.error(`🚨 ATENÇÃO: Houve ${failed} falha(s). Verifique os logs acima.\n`);
    return false;
  }
}

runTests().catch(err => {
  console.error('Erro fatal durante os testes:', err);
  process.exit(1);
});
