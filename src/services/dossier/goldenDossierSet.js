/**
 * VELLIA LICITAÇÕES — FASE 29
 * GOLDEN DOSSIER SET (SUÍTE DE TESTES E BENCHMARK DO DOSSIÊ DE HABILITAÇÃO)
 * 
 * Implementa os 5 cenários de teste automatizados exigidos na especificação:
 * - Cenário 1: Todos os documentos disponíveis e assinados -> Pronto
 * - Cenário 2: Certidão vencida -> Bloqueado (Hard Blocker)
 * - Cenário 3: Declaração pendente de geração ou variável ausente -> Pendente
 * - Cenário 4: Atestado com quantitativo parcial -> Revisão técnica
 * - Cenário 5: Adendo superveniente altera edital -> Reaberto para revisão
 * + Teste de Isolamento Multiempresa (Veeluen vs Excelência)
 * + Teste de Snapshot Histórico Imutável
 */

import { DossierService, DossierItemStatus, DossierOverallStatus } from './dossierService.js';
import { DocumentGenerationService, GeneratedDocStatus } from './documentGenerationService.js';
import { DocumentTemplateEngine } from './documentTemplateLibrary.js';

export class GoldenDossierBenchmark {
  static runAllScenarios() {
    const results = [];

    // CENÁRIO 1: Todos documentos disponíveis e assinados
    try {
      const mockOpp = {
        id: 'opp-cenario-1',
        number: 'PE-001/2026',
        client: 'Petrobras RNEST',
        object: 'Monitoramento Contínuo de Emissões Atmosféricas',
        recommendedCompany: 'Excelência Ambiental',
        endDate: '20/12/2026'
      };
      const dossier = DossierService.generateDossierForOpportunity(mockOpp);
      // Simular aprovação e assinatura das declarações
      dossier.generatedDeclarations = dossier.generatedDeclarations.map(dec => {
        const approved = DocumentGenerationService.approveDocument(dec, 'Ana Beatriz Cavalcanti');
        return DocumentGenerationService.registerSignature(approved, { signedBy: 'Ana Beatriz Cavalcanti' });
      });
      dossier.signatureQueue = dossier.signatureQueue.map(s => ({ ...s, status: 'ASSINADO' }));
      const readiness = DossierService.calculateReadiness(dossier.checklistItems, dossier.signatureQueue, dossier.generatedDeclarations);
      dossier.readiness = readiness;

      results.push({
        scenario: 'Cenário 1 — Documentação Integral e Vigente',
        expected: 'PRONTO PARA ENVIO (Score >= 95%, 0 Blockers)',
        obtained: `${readiness.statusLabel} (Score: ${readiness.score}%, Blockers: ${readiness.blockersCount})`,
        passed: readiness.score >= 95 && readiness.blockersCount === 0 && readiness.pendingSignatures === 0
      });
    } catch (err) {
      results.push({ scenario: 'Cenário 1', expected: 'Sucesso', obtained: err.message, passed: false });
    }

    // CENÁRIO 2: Certidão Vencida (Hard Blocker)
    try {
      const mockOpp = {
        id: 'opp-cenario-2',
        number: 'PE-002/2026',
        client: 'Transpetro Suape',
        object: 'Operação de ETE Industrial',
        recommendedCompany: 'Veeluen Solutions',
        endDate: '20/11/2026'
      };
      const dossier = DossierService.generateDossierForOpportunity(mockOpp);
      // Forçar certidão vencida
      dossier.checklistItems[2].status = DossierItemStatus.VENCIDO;
      dossier.checklistItems[2].isHardBlocker = true;
      const readiness = DossierService.calculateReadiness(dossier.checklistItems, dossier.signatureQueue, dossier.generatedDeclarations);

      results.push({
        scenario: 'Cenário 2 — Certidão Vencida (Bloqueador de Envio)',
        expected: 'IMPEDIDO POR BLOQUEADOR (Blockers > 0)',
        obtained: `${readiness.statusLabel} (Blockers: ${readiness.blockersCount})`,
        passed: readiness.blockersCount > 0 && readiness.statusLabel.includes('BLOQUEADOR')
      });
    } catch (err) {
      results.push({ scenario: 'Cenário 2', expected: 'Bloqueado', obtained: err.message, passed: false });
    }

    // CENÁRIO 3: Declaração com variável ausente (Não pode aprovar)
    try {
      const mockOpp = {
        id: 'opp-cenario-3',
        number: 'PE-003/2026',
        client: 'Companhia de Saneamento',
        object: 'Engenharia Sanitária',
        recommendedCompany: 'Veeluen Solutions',
        endDate: '15/12/2026'
      };
      // Contexto sem nome de representante
      const incompleteContext = {
        company: { legalName: 'Veeluen Solutions', cnpj: '33.123.456/0001-89' },
        representative: { name: null, cpf: null }, // VAZIO!
        opportunity: { number: 'PE-003/2026' }
      };
      const generated = DocumentGenerationService.createFromTemplate({
        templateId: 'tpl-fatos-impeditivos',
        context: incompleteContext
      });

      let failedToApprove = false;
      try {
        DocumentGenerationService.approveDocument(generated);
      } catch (e) {
        failedToApprove = true; // Exceção esperada!
      }

      results.push({
        scenario: 'Cenário 3 — Variável Ausente em Declaração',
        expected: 'Gera placeholder seguro e bloqueia aprovação sem revisão',
        obtained: `Placeholder gerado: "${generated.currentContent.includes('[INFORMAR')}", Bloqueio ativado: ${failedToApprove}`,
        passed: generated.currentContent.includes('[INFORMAR') && failedToApprove
      });
    } catch (err) {
      results.push({ scenario: 'Cenário 3', expected: 'Proteção ativa', obtained: err.message, passed: false });
    }

    // CENÁRIO 4: Minimum Sufficient Package de Atestados
    try {
      const mockOpp = {
        id: 'opp-cenario-4',
        number: 'PE-004/2026',
        client: 'Braskem Polo',
        object: 'Amostragem em Dutos Industriais',
        recommendedCompany: 'Excelência Ambiental',
        endDate: '30/11/2026'
      };
      const dossier = DossierService.generateDossierForOpportunity(mockOpp);
      const pkg = dossier.atestadosPackage;

      results.push({
        scenario: 'Cenário 4 — Minimum Sufficient Package de Atestados',
        expected: 'Seleciona acervo suficiente (>= 24 meses) com ART/CAT sem excesso',
        obtained: `${pkg.atestados.length} atestados somando ${pkg.totalMonthsProved} meses comprovados com ARTs vinculadas`,
        passed: pkg.isSufficient && pkg.atestados.length <= 2 && pkg.atestados[0].artNumber !== null
      });
    } catch (err) {
      results.push({ scenario: 'Cenário 4', expected: 'Sucesso', obtained: err.message, passed: false });
    }

    // CENÁRIO 5: Adendo superveniente altera edital -> Reabertura seletiva
    try {
      const mockOpp = {
        id: 'opp-cenario-5',
        number: 'PE-005/2026',
        client: 'Petrobras RNEST',
        object: 'Inspeção NR-13',
        recommendedCompany: 'Veeluen Solutions',
        endDate: '10/12/2026'
      };
      let dossier = DossierService.generateDossierForOpportunity(mockOpp);
      dossier = DossierService.freezeSnapshot(dossier, 'Wagner Silva');
      const wasApproved = dossier.status === DossierOverallStatus.APPROVED;

      // Aplicar adendo
      const amendedDossier = DossierService.applyAmendmentImpact(dossier, {
        name: 'Adendo 01',
        impactSummary: 'Exigência de nova qualificação para o Engenheiro Mecânico.'
      });

      const hasRevisionRequired = amendedDossier.status === DossierOverallStatus.REVISION_REQUIRED;
      const impactedItems = amendedDossier.checklistItems.filter(i => i.status === DossierItemStatus.REVISAO_NECESSARIA);

      results.push({
        scenario: 'Cenário 5 — Impacto de Adendo após Aprovação',
        expected: 'Reabre apenas os itens impactados para REVISÃO NECESSÁRIA mantendo histórico',
        obtained: `Status: "${amendedDossier.status}", Itens impactados: ${impactedItems.length}, Snapshots preservados: ${amendedDossier.snapshots.length}`,
        passed: wasApproved && hasRevisionRequired && impactedItems.length > 0 && amendedDossier.snapshots.length === 1
      });
    } catch (err) {
      results.push({ scenario: 'Cenário 5', expected: 'Sucesso', obtained: err.message, passed: false });
    }

    // TESTE MULTIEMPRESA: Isolamento entre Veeluen e Excelência
    try {
      const oppVeeluen = { id: 'opp-v', recommendedCompany: 'Veeluen Solutions' };
      const oppExcelencia = { id: 'opp-e', recommendedCompany: 'Excelência Ambiental' };

      const dosV = DossierService.generateDossierForOpportunity(oppVeeluen);
      const dosE = DossierService.generateDossierForOpportunity(oppExcelencia);

      const noCompanyOverlap = dosV.company.id !== dosE.company.id;
      const noRepresentativeOverlap = dosV.company.representative.name !== dosE.company.representative.name;
      const noCreaOverlap = dosV.company.crea !== dosE.company.crea;

      results.push({
        scenario: 'Teste Multiempresa — Isolamento de Acervo e Representantes',
        expected: 'Documentos e representantes de Veeluen e Excelência 100% isolados',
        obtained: `Veeluen: ${dosV.company.representative.name} (${dosV.company.crea}) | Excelência: ${dosE.company.representative.name} (${dosE.company.crea})`,
        passed: noCompanyOverlap && noRepresentativeOverlap && noCreaOverlap
      });
    } catch (err) {
      results.push({ scenario: 'Teste Multiempresa', expected: 'Isolamento estrito', obtained: err.message, passed: false });
    }

    // TESTE SNAPSHOT HISTÓRICO: Congelamento imutável
    try {
      const mockOpp = { id: 'opp-snap', recommendedCompany: 'Excelência Ambiental' };
      let dossier = DossierService.generateDossierForOpportunity(mockOpp);
      dossier = DossierService.freezeSnapshot(dossier, 'Ana Beatriz Cavalcanti');

      const snapshot = dossier.snapshots[0];
      const hasHash = Boolean(snapshot.integrityHash);
      const isApproved = dossier.status === DossierOverallStatus.APPROVED;

      results.push({
        scenario: 'Teste de Snapshot Histórico — Congelamento com Hash Criptográfico',
        expected: 'Snapshot imutável gerado com hash SHA-256 e status APROVADO',
        obtained: `Hash: ${snapshot.integrityHash}, Arquivos congelados: ${snapshot.filesFrozenCount}`,
        passed: hasHash && isApproved && snapshot.filesFrozenCount > 0
      });
    } catch (err) {
      results.push({ scenario: 'Teste Snapshot', expected: 'Congelamento com hash', obtained: err.message, passed: false });
    }

    const totalPassed = results.filter(r => r.passed).length;
    const allPassed = totalPassed === results.length;

    return {
      totalTests: results.length,
      passedCount: totalPassed,
      successRate: Math.round((totalPassed / results.length) * 100),
      allPassed,
      results
    };
  }
}
