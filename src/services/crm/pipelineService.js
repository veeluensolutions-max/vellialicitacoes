/**
 * VELLIA LICITAÇÕES — FASE 17
 * pipelineService.js
 * Gerenciamento do Funil Comercial (Pipeline Comercial B2G/B2B),
 * Kanban em 10 etapas, Next Best Action e Conversão para Licitação Real.
 */

import { PipelineStage, LeadSource } from './crmModels.js';

const STORAGE_KEY_PIPELINE = 'vellia_crm_pipeline_cards_v17';

export const INITIAL_PIPELINE_CARDS = [
  {
    id: 'PIPE-001',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras RNEST',
    contactName: 'Eng. Marcelo Cavalcanti',
    service: 'Tratamento de Efluentes e Operação de ETE',
    stage: PipelineStage.OPORTUNIDADE_FUTURA,
    responsible: 'Roberto Mendes (Diretor Comercial)',
    potentialValue: 3800000.00,
    potentialScore: 94,
    nextAction: 'Reunião de alinhamento prévio sobre exigência de engenheiro residente',
    nextActionDate: '2026-10-15',
    leadSource: LeadSource.RADAR_AUTOMATICO,
    relatedSignalId: 'SIG-2026-001',
    linkedOpportunityId: null, // Será preenchido quando a licitação for publicada
    nextBestAction: 'Contrato de ETE encerra em 38 dias. Recomenda-se validar acervo de CATs no CREA-PE e acompanhar o órgão.',
    createdAt: '2026-09-28T16:00:00Z'
  },
  {
    id: 'PIPE-002',
    organizationId: 'ORG-UFPE',
    organizationName: 'UFPE',
    contactName: 'Bárbara Lins',
    service: 'Monitoramento de Emissões Atmosféricas',
    stage: PipelineStage.RELACIONAMENTO,
    responsible: 'Camila Torres (Engenheira Ambiental)',
    potentialValue: 520000.00,
    potentialScore: 91,
    nextAction: 'Checagem de publicação do pré-edital de chaminés no PNCP',
    nextActionDate: '2026-10-08',
    leadSource: LeadSource.PNCP,
    relatedSignalId: 'SIG-2026-003',
    linkedOpportunityId: null,
    nextBestAction: 'Concentração histórica no 4º trimestre. Manter contato semanal para antecipar visita técnica.',
    createdAt: '2026-09-10T14:00:00Z'
  },
  {
    id: 'PIPE-003',
    organizationId: 'ORG-COMPESA',
    organizationName: 'COMPESA',
    contactName: 'Eng. Fernando Bezerra',
    service: 'Inspeção e Conformidade NR-13',
    stage: PipelineStage.PRIMEIRO_CONTATO,
    responsible: 'Flávio Caldas (Eng. Mecânico)',
    potentialValue: 890000.00,
    potentialScore: 88,
    nextAction: 'Apresentação de planilha técnica com laudos digitais integrados',
    nextActionDate: '2026-10-14',
    leadSource: LeadSource.COMPRAS_GOV,
    relatedSignalId: 'SIG-2026-005',
    linkedOpportunityId: null,
    nextBestAction: 'Contrato 401/2022 vence em 43 dias. Sondar se haverá prorrogação ou novo certame.',
    createdAt: '2026-09-25T11:00:00Z'
  },
  {
    id: 'PIPE-004',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Porto de Suape',
    contactName: 'Dr. Leonardo Gusmão',
    service: 'Gestão e Destinação de Resíduos Perigosos',
    stage: PipelineStage.LICITACAO_PUBLICADA,
    responsible: 'Roberto Mendes',
    potentialValue: 1650000.00,
    potentialScore: 95,
    nextAction: 'Preparação final de proposta de logística de resíduos Classe I',
    nextActionDate: '2026-10-09',
    leadSource: LeadSource.RELACIONAMENTO,
    relatedSignalId: 'SIG-2026-006',
    linkedOpportunityId: 'OPP-PNCP-2026-0991', // Já convertido em licitação aberta
    nextBestAction: 'Edital oficial publicado no PNCP. Alinhar com setor de custos a precificação do manifesto MTR.',
    createdAt: '2026-08-25T19:00:00Z'
  },
  {
    id: 'PIPE-005',
    organizationId: 'ORG-CHESF',
    organizationName: 'Eletrobras Chesf',
    contactName: 'Eng. Renato Fagundes',
    service: 'Licenciamento e Estudos de Ictiofauna',
    stage: PipelineStage.MAPEAMENTO,
    responsible: 'Camila Torres',
    potentialValue: 2100000.00,
    potentialScore: 78,
    nextAction: 'Mapeamento de currículos de biólogos especialistas em fauna aquática',
    nextActionDate: '2026-10-28',
    leadSource: LeadSource.PROSPECCAO_MANUAL,
    relatedSignalId: null,
    linkedOpportunityId: null,
    nextBestAction: 'Há 58 dias sem nova interação direta. Sugere-se sondagem do PCA 2027.',
    createdAt: '2026-08-10T14:00:00Z'
  }
];

class PipelineService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[PipelineService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[PipelineService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    const existing = this._safeGetStorage(STORAGE_KEY_PIPELINE);
    if (!existing || !Array.isArray(existing) || existing.length === 0) {
      this._safeSetStorage(STORAGE_KEY_PIPELINE, INITIAL_PIPELINE_CARDS);
    }
  }

  getAllPipelineCards() {
    return this._safeGetStorage(STORAGE_KEY_PIPELINE) || INITIAL_PIPELINE_CARDS;
  }

  /**
   * Altera a etapa de um card no Pipeline
   */
  updateCardStage(cardId, newStage) {
    const all = this.getAllPipelineCards();
    const target = all.find(c => c.id === cardId);
    if (target) {
      target.stage = newStage;
      target.updatedAt = new Date().toISOString();
      this._safeSetStorage(STORAGE_KEY_PIPELINE, all);
      return target;
    }
    return null;
  }

  /**
   * Converte oportunidade futura/relacionamento em licitação real (Item 24, 48, 72)
   * Vincula ao processo existente sem duplicar registros.
   */
  linkToOfficialTender(cardId, officialTenderId) {
    const all = this.getAllPipelineCards();
    const target = all.find(c => c.id === cardId);
    if (target) {
      target.stage = PipelineStage.LICITACAO_PUBLICADA;
      target.linkedOpportunityId = officialTenderId;
      target.nextBestAction = `Licitação oficial vinculada (#${officialTenderId}). Proceder para avaliação de GO/NO-GO e preparação de proposta.`;
      target.updatedAt = new Date().toISOString();
      this._safeSetStorage(STORAGE_KEY_PIPELINE, all);
      return target;
    }
    return null;
  }

  /**
   * Adiciona novo card no funil comercial
   */
  addPipelineCard(cardData = {}) {
    const all = this.getAllPipelineCards();
    const newCard = {
      id: cardData.id || `PIPE-${Date.now()}`,
      organizationId: cardData.organizationId || '',
      organizationName: cardData.organizationName || 'Organização Alvo',
      contactName: cardData.contactName || 'Contato Principal',
      service: cardData.service || 'Serviço de Engenharia',
      stage: cardData.stage || PipelineStage.MAPEAMENTO,
      responsible: cardData.responsible || 'Roberto Mendes',
      potentialValue: Number(cardData.potentialValue) || 500000,
      potentialScore: Number(cardData.potentialScore) || 75,
      nextAction: cardData.nextAction || 'Primeiro contato e mapeamento de demandas',
      nextActionDate: cardData.nextActionDate || '2026-10-15',
      leadSource: cardData.leadSource || LeadSource.RADAR_AUTOMATICO,
      relatedSignalId: cardData.relatedSignalId || null,
      linkedOpportunityId: null,
      nextBestAction: cardData.nextBestAction || 'Agendar reunião técnica de apresentação institucional.',
      createdAt: new Date().toISOString()
    };

    all.push(newCard);
    this._safeSetStorage(STORAGE_KEY_PIPELINE, all);
    return newCard;
  }
}

export const pipelineService = new PipelineService();
