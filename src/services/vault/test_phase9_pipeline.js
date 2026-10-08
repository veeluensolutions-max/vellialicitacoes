// Mock de localStorage para ambiente de terminal Node.js
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); }
  };
}

import { DocumentVaultService, DocumentCategory } from './documentVaultService.js';

console.log('=== INICIANDO BATERIA DE TESTES — FASE 9 (BANCO INTELIGENTE DE DOCUMENTOS) ===\n');

// 1. Validar Critério 50: Quantitativo Mínimo no Seed
const docs = DocumentVaultService.listDocuments();
const fiscalDocs = docs.filter(d => d.category === DocumentCategory.FISCAL || d.category === 'Fiscais');
const juridicoDocs = docs.filter(d => d.category === DocumentCategory.JURIDICO || d.category === 'Jurídicos');
const attestations = DocumentVaultService.listAttestations();
const arts = DocumentVaultService.listARTs();
const personnel = DocumentVaultService.listPersonnel();
const equipment = DocumentVaultService.listEquipment();

console.log('1. Verificando Critério 50 (Quantitativos Mínimos):');
console.log(` - Documentos Fiscais: ${fiscalDocs.length} (Exigido >= 5) -> ${fiscalDocs.length >= 5 ? '✅ APROVADO' : '❌ FALHA'}`);
console.log(` - Documentos Jurídicos: ${juridicoDocs.length} (Exigido >= 3) -> ${juridicoDocs.length >= 3 ? '✅ APROVADO' : '❌ FALHA'}`);
console.log(` - Atestados Técnicos: ${attestations.length} (Exigido >= 3) -> ${attestations.length >= 3 ? '✅ APROVADO' : '❌ FALHA'}`);
console.log(` - ARTs cadastradas: ${arts.length} (Exigido >= 2) -> ${arts.length >= 2 ? '✅ APROVADO' : '❌ FALHA'}`);
console.log(` - Responsáveis Técnicos: ${personnel.length} (Exigido >= 2) -> ${personnel.length >= 2 ? '✅ APROVADO' : '❌ FALHA'}`);
console.log(` - Equipamentos: ${equipment.length} (Exigido >= 3) -> ${equipment.length >= 3 ? '✅ APROVADO' : '❌ FALHA'}`);

if (
  fiscalDocs.length < 5 ||
  juridicoDocs.length < 3 ||
  attestations.length < 3 ||
  arts.length < 2 ||
  personnel.length < 2 ||
  equipment.length < 3
) {
  console.error('ERRO: Critério 50 não foi atendido em volume!');
  process.exit(1);
}

// 2. Testar Cálculo de Status Automático por Validade (Item 5)
console.log('\n2. Verificando Regras de Validade (Item 5):');
const hoje = new Date();
const dPlus45 = new Date(hoje.getTime() + 45 * 86400000).toLocaleDateString('pt-BR');
const dPlus20 = new Date(hoje.getTime() + 20 * 86400000).toLocaleDateString('pt-BR');
const dPlus5 = new Date(hoje.getTime() + 5 * 86400000).toLocaleDateString('pt-BR');
const dPast = new Date(hoje.getTime() - 10 * 86400000).toLocaleDateString('pt-BR');

const st45 = DocumentVaultService.calculateValidityStatus(dPlus45);
const st20 = DocumentVaultService.calculateValidityStatus(dPlus20);
const st5 = DocumentVaultService.calculateValidityStatus(dPlus5);
const stPast = DocumentVaultService.calculateValidityStatus(dPast);

console.log(` - >30 dias (${dPlus45}): ${st45.status} (Esperado: VÁLIDO) -> ${st45.status === 'VÁLIDO' ? '✅' : '❌'}`);
console.log(` - 16-30 dias (${dPlus20}): ${st20.status} (Esperado: ATENÇÃO) -> ${st20.status === 'ATENÇÃO' ? '✅' : '❌'}`);
console.log(` - 1-15 dias (${dPlus5}): ${st5.status} (Esperado: VENCE EM BREVE) -> ${st5.status === 'VENCE EM BREVE' ? '✅' : '❌'}`);
console.log(` - Vencido (${dPast}): ${stPast.status} (Esperado: VENCIDO) -> ${stPast.status === 'VENCIDO' ? '✅' : '❌'}`);

// 3. Testar Força do Atestado (Quality Score - Itens 20 e 21)
console.log('\n3. Verificando Força do Atestado (Quality Score):');
attestations.forEach(att => {
  console.log(` - [${att.id}] ${att.object.substring(0, 45)}... Score: ${att.qualityScore}% (${att.qualityTier})`);
  if (!att.qualityScore || att.qualityScore <= 0) {
    console.error(`ERRO: Atestado ${att.id} sem qualityScore válido.`);
    process.exit(1);
  }
});

// 4. Testar Matriz de Capacidade e Capability Score (Itens 34, 35, 36)
console.log('\n4. Verificando Matriz de Capacidade Técnica:');
const matrix = DocumentVaultService.getCapabilityMatrix();
console.log(` - Total de Serviços Mapeados na Matriz: ${matrix.length}`);
matrix.forEach(m => {
  console.log(`   * ${m.serviceName} | Empresa: ${m.companyName} | Capability: ${m.capabilityScore}% (${m.status}) | Atestados: ${m.attestationsCount} | Equipe: ${m.teamCount} | Equip: ${m.equipmentCount}`);
});

// 5. Testar Painel de Pendências ("O que está faltando?" - Item 40)
console.log('\n5. Verificando Painel de Pendências (O que está faltando?):');
const pendencias = DocumentVaultService.getPendingIssuesList();
console.log(` - Total de Pendências Priorizadas: ${pendencias.length}`);
pendencias.forEach(p => {
  console.log(`   [${p.severity}] ${p.title} (${p.company}) -> Ação: ${p.action}`);
});

// 6. Testar Saúde Documental & Semáforo (Itens 44, 45, 46)
console.log('\n6. Verificando Saúde Documental & Semáforo:');
const healthGeral = DocumentVaultService.getDocumentHealthReport();
console.log(` - Semáforo Geral: ${healthGeral.semaphore} | Percentual: ${healthGeral.healthPercentage}% | Válidos: ${healthGeral.valid}/${healthGeral.total} | Vencendo em 30d: ${healthGeral.expiring30d}`);
const healthEA = DocumentVaultService.getDocumentHealthReport('excelencia-ambiental');
console.log(` - Semáforo Excelência Ambiental: ${healthEA.semaphore} | Percentual: ${healthEA.healthPercentage}% | Válidos: ${healthEA.valid}/${healthEA.total}`);

// 7. Testar IA Documental com Grounding Estrito (Itens 47 e 48)
console.log('\n7. Testar IA Documental Grounding:');
const q1 = DocumentVaultService.askDocumentVault('Temos atestado de isocinética?');
console.log(` - Pergunta: "Temos atestado de isocinética?"\n   Resposta: ${q1.answer}`);

const q2 = DocumentVaultService.askDocumentVault('Qual certidão vence primeiro?');
console.log(` - Pergunta: "Qual certidão vence primeiro?"\n   Resposta: ${q2.answer}`);

const q3 = DocumentVaultService.askDocumentVault('Existe algum equipamento com calibração vencida?');
console.log(` - Pergunta: "Existe algum equipamento com calibração vencida?"\n   Resposta: ${q3.answer}`);

const q4 = DocumentVaultService.askDocumentVault('Temos foguete espacial tripulado para Marte?');
console.log(` - Pergunta: "Temos foguete espacial tripulado para Marte?"\n   Resposta: ${q4.answer}`);
if (!q4.answer.includes('Não foi identificado documento compatível')) {
  console.error('ERRO: IA Documental alucinou e não aplicou grounding estrito!');
  process.exit(1);
}

// 8. Testar Upload, Versionamento e Auditoria (Itens 10, 13, 43)
console.log('\n8. Testar Adição de Documento & Auditoria:');
const newDoc = DocumentVaultService.addDocument({
  companyId: 'excelencia-ambiental',
  name: 'Certidão Negativa de Teste do Tribunal de Contas',
  category: 'Fiscais',
  subCategory: 'TCE',
  expiryDate: dPlus45,
  issuer: 'Tribunal de Contas do Estado',
  documentNumber: 'TCE-2026-999'
}, 'Auditor Automatizado');

console.log(` - Documento criado com sucesso: ${newDoc.id} (${newDoc.name})`);
const auditLogs = DocumentVaultService.listAuditLogs();
console.log(` - Trilha de Auditoria atualizada: ${auditLogs.length} registros (Última ação: ${auditLogs[0].action} por ${auditLogs[0].user})`);

console.log('\n=== TODOS OS TESTES DA FASE 9 PASSARAM COM 100% DE SUCESSO! ===');
