/**
 * VELLIA LICITAÇÕES — FASE 28: INTELIGÊNCIA DOCUMENTAL AVANÇADA
 * DocumentAuditService.js
 * 
 * Responsável por:
 * 1. Fila de Revisão Documental (Low Confidence Queue & Hard Blockers)
 * 2. Aprovação em lote (Bulk Review) protegida (bloqueia aprovação cega de blockers)
 * 3. Registro de Override Humano com histórico e justificativa
 * 4. Geração de Tarefas Acionáveis a partir de pendências (Task Generation)
 * 5. Handoff para Montagem do Pacote de Habilitação / Proposta (Package Builder)
 */

import { mvpTaskService } from '../mvp/mvpTaskService.js';
import { logService, LogType } from '../logService.js';

const AUDIT_STORAGE_KEY = 'vellia_document_review_audit_v1';

export class DocumentAuditService {
  /**
   * Obtém o log histórico de auditoria
   */
  static getAuditLog(opportunityNumber) {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return list.filter(item => !opportunityNumber || String(item.opportunityNumber) === String(opportunityNumber));
    } catch {
      return [];
    }
  }

  /**
   * Registra um Override Humano formal
   */
  static recordHumanOverride({
    opportunityNumber,
    requirementId,
    requirementTitle,
    previousStatus,
    newStatus,
    reviewer = 'Especialista em Licitações (Usuário)',
    justification = ''
  }) {
    const entry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      opportunityNumber: String(opportunityNumber),
      requirementId,
      requirementTitle,
      previousStatus,
      newStatus,
      reviewer,
      justification,
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('pt-BR')
    };

    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(entry);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
    } catch (e) {
      console.warn('Erro ao salvar auditoria de revisão:', e);
    }

    logService.addLog(LogType.MANUAL, `Override humano no requisito ${requirementTitle}: ${previousStatus} -> ${newStatus}`, {
      opportunityNumber,
      reviewer,
      justification
    });

    return entry;
  }

  /**
   * Aprovação em Lote (Bulk Review)
   * Bloqueia automaticamente blockers para evitar aprovações acidentais sem visualização
   */
  static approveBatch(opportunityNumber, requirementIds = [], requirements = [], reviewer = 'Especialista em Licitações') {
    const results = {
      approvedCount: 0,
      blockedCount: 0,
      approvedIds: [],
      blockedIds: []
    };

    requirementIds.forEach(id => {
      const req = requirements.find(r => r.id === id);
      if (!req) return;

      // Proteção de segurança: Blockers exigem confirmação individual e visualização
      if (req.isHardBlocker) {
        results.blockedCount++;
        results.blockedIds.push(id);
      } else {
        results.approvedCount++;
        results.approvedIds.push(id);
        this.recordHumanOverride({
          opportunityNumber,
          requirementId: id,
          requirementTitle: req.title,
          previousStatus: req.status || 'PENDENTE',
          newStatus: 'ATENDIDO',
          reviewer,
          justification: 'Aprovação validada em lote para itens de alta confiança e conformidade comprovada.'
        });
      }
    });

    return results;
  }

  /**
   * Converte uma pendência documental ou blocker em Tarefa Operacional no sistema
   */
  static createTaskFromPendingItem(opportunityNumber, pendingItem) {
    const title = `[Documental] ${pendingItem.title || pendingItem.item || 'Regularizar Pendência de Habilitação'}`;
    const description = `Ação requerida para atender edital ${opportunityNumber}: ${pendingItem.action || pendingItem.details || 'Apresentar documento comprobatório'}`;

    try {
      if (mvpTaskService && typeof mvpTaskService.createTask === 'function') {
        const task = mvpTaskService.createTask({
          title,
          description,
          priority: pendingItem.isHardBlocker ? 'CRITICA' : 'ALTA',
          opportunityNumber: String(opportunityNumber),
          category: 'HABILITACAO_DOCUMENTAL',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        });
        return task;
      }
    } catch (e) {
      console.warn('Erro ao chamar mvpTaskService:', e);
    }

    return {
      id: `task-doc-${Date.now()}`,
      title,
      description,
      status: 'CRIADA'
    };
  }

  /**
   * Monta o checklist do Pacote de Habilitação para Handoff da Proposta
   */
  static buildHabilitationPackage(requirements = [], matchingResults = []) {
    const packageItems = requirements.map(req => {
      const match = matchingResults.find(m => m.requirementId === req.id);
      return {
        requirementId: req.id,
        category: req.category,
        title: req.title,
        obligatoriness: req.obligatoriness,
        isHardBlocker: req.isHardBlocker,
        status: match ? match.matchStatus : 'PENDENTE',
        documentToAttach: match?.evidenceChain?.proofDocument || 'Pendente de indicação',
        locationInDossier: match?.evidenceChain?.documentLocation || 'Acervo Geral',
        verified: match?.matchStatus === 'COMPROVADO TOTALMENTE'
      };
    });

    const isComplete = packageItems.every(p => p.verified || p.obligatoriness !== 'MANDATORY');

    return {
      status: isComplete ? 'COMPLETO' : 'PENDENTE DE DOCUMENTAÇÃO',
      totalItems: packageItems.length,
      verifiedCount: packageItems.filter(p => p.verified).length,
      pendingCount: packageItems.filter(p => !p.verified).length,
      items: packageItems
    };
  }
}
export default DocumentAuditService;
