/**
 * VELLIA LICITAÇÕES — FASE 29
 * DOCUMENT GENERATION SERVICE (GERAÇÃO ASSISTIDA DE DOCUMENTOS)
 * 
 * Gerencia a criação, edição, preview, versionamento (v1, v2) e ciclo de vida
 * das declarações geradas a partir da biblioteca de modelos ou modelos do edital.
 * 
 * Status: DRAFT, UNDER_REVIEW, APPROVED, SIGNED, SUPERSEDED, REJECTED.
 */

import { DocumentTemplateEngine } from './documentTemplateLibrary.js';

export const GeneratedDocStatus = {
  DRAFT: 'DRAFT',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  SIGNED: 'SIGNED',
  SUPERSEDED: 'SUPERSEDED',
  REJECTED: 'REJECTED'
};

export class DocumentGenerationService {
  /**
   * Cria um novo documento a partir de um template e contexto corporativo.
   */
  static createFromTemplate({ templateId, context, author = 'Sistema Vellia (IA)' }) {
    const template = DocumentTemplateEngine.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Modelo documental não encontrado para o ID: ${templateId}`);
    }

    const { text, missingVariables, isComplete } = DocumentTemplateEngine.render(template.templateText, context);

    const docId = `gendoc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('pt-BR');

    const newDoc = {
      id: docId,
      templateId: template.id,
      title: template.title,
      category: template.category,
      source: template.source,
      status: GeneratedDocStatus.DRAFT,
      isComplete,
      missingVariables,
      currentVersion: 1,
      versions: [
        {
          versionNumber: 1,
          createdAt: nowIso,
          createdBy: author,
          summary: 'Versão inicial gerada a partir do modelo oficial',
          content: text
        }
      ],
      currentContent: text,
      approver: null,
      approvedAt: null,
      signature: {
        isSigned: false,
        signatureType: null, // 'DIGITAL_GOVBR', 'ICP_BRASIL', 'MANUAL_SCAN'
        signedBy: null,
        signedAt: null,
        certificateHash: null
      },
      tags: [template.category, 'Declaração Assistida', 'Fase 29']
    };

    return newDoc;
  }

  /**
   * Atualiza o conteúdo do documento gerando uma nova versão (ex: v2).
   * Nunca sobrescreve silenciosamente a versão anterior.
   */
  static updateContent(doc, newContent, author = 'Usuário', changeNote = 'Revisão textual') {
    if (!doc) throw new Error('Documento inválido para atualização.');
    if (doc.status === GeneratedDocStatus.APPROVED && !author.includes('Admin')) {
      throw new Error('Documento aprovado não pode ser editado sem antes reabrir a revisão.');
    }

    const nextVer = doc.currentVersion + 1;
    const nowIso = new Date().toISOString();

    // Checar se ainda existem placeholders não preenchidos
    const hasPlaceholders = /\[INFORMAR [^\]]+\]/.test(newContent);

    const updatedDoc = {
      ...doc,
      currentVersion: nextVer,
      currentContent: newContent,
      isComplete: !hasPlaceholders,
      status: GeneratedDocStatus.UNDER_REVIEW,
      versions: [
        ...doc.versions,
        {
          versionNumber: nextVer,
          createdAt: nowIso,
          createdBy: author,
          summary: `v${nextVer} — ${changeNote} (${author})`,
          content: newContent
        }
      ]
    };

    return updatedDoc;
  }

  /**
   * Aprova o documento se ele estiver completo e verificado por humano.
   */
  static approveDocument(doc, approverName = 'Wagner Silva (Responsável)') {
    if (!doc) throw new Error('Documento inválido.');
    
    // Regra da Fase 29: Se houver variável ausente/placeholder, não pode aprovar
    if (/\[INFORMAR [^\]]+\]/.test(doc.currentContent) || doc.missingVariables?.length > 0) {
      throw new Error('Não é possível aprovar documento com variáveis pendentes de preenchimento humano.');
    }

    const nowIso = new Date().toISOString();

    return {
      ...doc,
      status: GeneratedDocStatus.APPROVED,
      approver: approverName,
      approvedAt: nowIso
    };
  }

  /**
   * Registra a assinatura do documento pelo representante legal.
   */
  static registerSignature(doc, { signedBy, signatureType = 'DIGITAL_GOVBR', certificateHash = null }) {
    if (!doc) throw new Error('Documento inválido.');
    if (doc.status !== GeneratedDocStatus.APPROVED) {
      throw new Error('Apenas documentos com aprovação prévia podem receber assinatura formal.');
    }

    const nowIso = new Date().toISOString();

    return {
      ...doc,
      status: GeneratedDocStatus.SIGNED,
      signature: {
        isSigned: true,
        signatureType,
        signedBy: signedBy || 'Representante Legal da Empresa',
        signedAt: nowIso,
        certificateHash: certificateHash || `SHA256-${Math.random().toString(36).substr(2, 10).toUpperCase()}`
      }
    };
  }
}
