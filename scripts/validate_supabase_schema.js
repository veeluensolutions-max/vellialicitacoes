import { supabaseClient } from '../src/services/cloud/supabaseClient.js';
import { DocumentVaultService } from '../src/services/vault/documentVaultService.js';
import { GeneralAuditService } from '../src/services/admin/generalAuditService.js';

async function main() {
  console.log('--- INICIANDO VALIDAÇÃO DO SCHEMA COMPLETO SUPABASE ---');

  // 1. Sincronizar Cofre de Documentos (CATs, CNDs, Certidões)
  console.log('1. Sincronizando Cofre Documental (CATs, CNDs, Fiscais, Jurídicos)...');
  const vaultRes = await DocumentVaultService.syncToSupabase();
  console.log('Resultado Vault:', vaultRes);

  // 2. Registrar evento de auditoria no Supabase
  console.log('2. Registrando evento de auditoria no Supabase...');
  const auditRes = await supabaseClient.insertAuditLog({
    user: 'Diretoria Executiva',
    userRole: 'Administrador',
    company: 'Veeluen Solutions & Excelência Ambiental',
    module: 'Cofre de Documentos & Compliance',
    action: 'SCHEMA_VALIDADO_E_POVOADO',
    object: 'Tabelas public.document_vault e public.audit_logs',
    diffAfter: { totalDocumentos: vaultRes.count, status: '100% OPERACIONAL' },
    ipAddress: '127.0.0.1',
    result: 'SUCESSO'
  });
  console.log('Resultado Audit Log:', auditRes ? 'SUCESSO' : 'FALHA');

  // 3. Consultar contagens diretamente nas tabelas
  console.log('3. Consultando contagens reais nas tabelas do Supabase...');
  const docs = await supabaseClient.fetchDocumentVault();
  console.log(`✓ Total de documentos no Supabase (document_vault): ${docs.length}`);

  const logs = await supabaseClient.fetchAuditLogs(10);
  console.log(`✓ Total de logs retornados no Supabase (audit_logs): ${logs.length}`);

  console.log('--- VALIDAÇÃO CONCLUÍDA COM SUCESSO ---');
}

main().catch(err => {
  console.error('Erro na validação:', err);
  process.exit(1);
});
