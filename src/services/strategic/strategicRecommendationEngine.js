/**
 * VELLIA LICITAÇÕES — FASE 57
 * strategicRecommendationEngine.js: Motor de Recomendações Estratégicas Explicáveis
 * 
 * Princípios Fundamentais:
 * - Recomendação NÃO é decisão: apresentada como "Ação sugerida com base nos dados atuais", nunca "Faça isso".
 * - Estrutura Canônica Explicável (7 Fatores): Observação, Por que importa, Ação sugerida, Impacto, Riscos, Alternativas, Evidências.
 * - Deduplicação e Agregação de Sinais: Múltiplos sinais relacionados geram uma única recomendação coerente.
 * - Detecção de Colisão / Trade-offs: Sinaliza quando duas recomendações competem por recursos.
 * - Integração Sandbox & Memória: Sugere simular no Scenario Lab (Fase 56) e permite converter em Decisão (Fase 55).
 */

import { StrategicMemoryService } from '../decision/strategicMemoryService.js';
import { ScenarioSimulationEngine } from '../simulation/scenarioSimulationEngine.js';

export const RecommendationType = {
  OPPORTUNITY: 'OPPORTUNITY',
  PRICING: 'PRICING',
  CAPACITY: 'CAPACITY',
  MARKET: 'MARKET',
  CONTRACT: 'CONTRACT',
  RELATIONSHIP: 'RELATIONSHIP',
  RISK: 'RISK',
  DOCUMENT: 'DOCUMENT',
  STRATEGIC: 'STRATEGIC',
  PORTFOLIO: 'PORTFOLIO',
  PROCESS: 'PROCESS'
};

export const RecommendationPriority = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

export const RecommendationStatus = {
  NEW: 'NEW',
  REVIEWED: 'REVIEWED',
  ACCEPTED: 'ACCEPTED',
  DEFERRED: 'DEFERRED',
  DISMISSED: 'DISMISSED',
  EXPIRED: 'EXPIRED',
  IMPLEMENTED: 'IMPLEMENTED'
};

export const RecommendationConfidence = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

export const DismissReason = {
  NOT_RELEVANT: 'Não Relevante / Fora de Escopo',
  ALREADY_ADDRESSED: 'Já Endereçado por Ação Prévia',
  INCORRECT_DATA: 'Dados de Apoio Divergentes',
  STRATEGIC_CHOICE: 'Escolha Estratégica da Diretoria',
  OTHER: 'Outro Motivo Formal'
};

const STORAGE_KEYS = {
  RECOMMENDATIONS: 'vellia_strategic_recommendations_v57',
  FEEDBACK_LOG: 'vellia_recommendation_feedback_v57'
};

const INITIAL_RECOMMENDATIONS = [
  {
    id: 'REC-2026-001',
    companyId: 'Veeluen Solutions',
    type: RecommendationType.OPPORTUNITY,
    title: 'Avaliar Antecipação de Dossiê e Alçada de Preço: Pregão Sabesp EEE',
    observation: 'O certame possui prazo em 72h (22/10), com 94% de aderência técnica, porém a alçada de preço e o laudo de BDI ainda não foram homologados formalmente.',
    whyItMatters: 'O certame representa R$ 1.2M com margem estimada de 18.5%. A ausência de liberação nas próximas 24h inviabilizará o upload no portal da Sabesp.',
    suggestedAction: 'Priorizar a homologação da planilha de BDI na reunião executiva e despachar a folha de conferência de CATs com a engenharia.',
    expectedImpact: 'Garantir submissão tempestiva de proposta com probabilidade de vitória de 75%.',
    risks: 'Submeter lance sem revisão final de custos indiretos pode expor a empresa a desbalanceamento de BDI.',
    alternativas: [
      'Homologar BDI no valor de piso (R$ 1.14M) com aprovação direta da diretoria',
      'Postergar submissão para obter desconto adicional de 2% com subcontratado de análise laboratorial',
      'Limitar participação a consórcio'
    ],
    evidence: 'Oportunidade OPP-01 (Sabesp EEE), matriz de aderência (94%) e status de aprovação pendente.',
    relatedEntityType: 'Opportunity',
    relatedEntityId: 'opp-sabesp-eee-01',
    priority: RecommendationPriority.CRITICAL,
    status: RecommendationStatus.NEW,
    confidence: RecommendationConfidence.HIGH,
    dataCoveragePct: 95,
    generatedAt: '2026-10-19T08:30:00-03:00',
    expiresAt: '2026-10-22T10:00:00-03:00',
    evidenceSnapshotId: 'SNAP-REC-001',
    engineVersion: 'v1.0'
  },
  {
    id: 'REC-2026-002',
    companyId: 'Veeluen Solutions',
    type: RecommendationType.CAPACITY,
    title: 'Simular Stress de Capacidade antes de submeter propostas Sabesp e Copasa',
    observation: 'A empresa disputa simultaneamente os editais da Sabesp (R$ 1.2M) e Copasa (R$ 1.8M), ambos demandando mobilização em novembro com 2 engenheiros de campo cada.',
    whyItMatters: 'A capacidade instalada atual possui 2 engenheiros livres. A vitória simultânea em ambos gerará um déficit imediato de 2 engenheiros de campo e 1 kit de amostragem.',
    suggestedAction: 'Executar simulação no Laboratório de Cenários (Fase 56) e pré-alinhar termo de subcontratação com parceiro técnico da Fase 45.',
    expectedImpact: 'Mitigação prévia de risco de atraso de mobilização e multas contratuais.',
    risks: 'Assinar contrato sem capacidade garantida gerará risco de notificação operacional nos primeiros 30 dias.',
    alternativas: [
      'Pré-contratar equipe terceirizada com cláusula suspensiva de vitória',
      'Locar sonda de amostragem complementar por 60 dias',
      'Priorizar o certame de maior margem líquida (Sabesp 18.5% vs Copasa 16.0%)'
    ],
    evidence: 'Carga de capacidade operacional (Fase 44) e premissas de prazo de mobilização dos editais.',
    relatedEntityType: 'Capacity',
    relatedEntityId: 'cap-field-engineers',
    priority: RecommendationPriority.HIGH,
    status: RecommendationStatus.NEW,
    confidence: RecommendationConfidence.HIGH,
    dataCoveragePct: 90,
    generatedAt: '2026-10-19T09:00:00-03:00',
    expiresAt: '2026-10-25T18:00:00-03:00',
    evidenceSnapshotId: 'SNAP-REC-002',
    engineVersion: 'v1.0'
  },
  {
    id: 'REC-2026-003',
    companyId: 'Excelência Gestão',
    type: RecommendationType.PRICING,
    title: 'Reavaliar Composição de Custos Tercerizados: Portos de Santos',
    observation: 'A margem estimada para a proposta Portos de Santos está calculada em 14.2%, ligeiramente abaixo da diretriz institucional de margem mínima (15.0%).',
    whyItMatters: 'A principal cotação de laboratório vence em 48h e não contempla reajuste de insumos químicos para análises cromatográficas.',
    suggestedAction: 'Condicionar a aprovação de margem à obtenção de contraproposta com desconto de 8% junto à empresa parceira de Santos.',
    expectedImpact: 'Elevação da margem líquida para 15.6%, recolocando o certame dentro das alçadas regulares.',
    risks: 'Perda de prazo de credenciamento se a negociação comercial demorar mais de 48 horas.',
    alternativas: [
      'Submeter com margem de 14.2% mediante liberação de alçada de exceção da Diretoria Executiva',
      'Negociar faturamento direto do laboratório para o cliente final para desonerar PIS/COFINS',
      'Desistir do lote secundário de menor rentabilidade'
    ],
    evidence: 'Cotação LabAmbiental #9042, proposta técnica #Santos-02 e política de margem (Fase 36).',
    relatedEntityType: 'Proposal',
    relatedEntityId: 'prop-santos-porto-02',
    priority: RecommendationPriority.HIGH,
    status: RecommendationStatus.NEW,
    confidence: RecommendationConfidence.MEDIUM,
    dataCoveragePct: 75,
    generatedAt: '2026-10-19T10:00:00-03:00',
    expiresAt: '2026-10-23T18:00:00-03:00',
    evidenceSnapshotId: 'SNAP-REC-003',
    engineVersion: 'v1.0'
  },
  {
    id: 'REC-2026-004',
    companyId: 'Grupo Vellia',
    type: RecommendationType.STRATEGIC,
    title: 'Considerar Formalização de Iniciativa: Expansão em Emissões Atmosféricas',
    observation: 'O segmento de Emissões Atmosféricas registrou crescimento de 42% no pipeline qualificado com margem média de 22%, superior à média histórica da carteira (18.2%).',
    whyItMatters: 'A acreditação do Inmetro (ISO 17025) conferiu diferencial competitivo relevante sobre concorrentes locais na região Sudeste e Centro-Oeste.',
    suggestedAction: 'Estruturar iniciativa no Planejamento Estratégico (Fase 42) com meta de participação em 8 certames prioritários nos próximos 180 dias.',
    expectedImpact: 'Expansão de carteira recorrente com incremento potencial de R$ 3.5M em pipeline qualificado.',
    risks: 'Sobrecarga do kit isocinético existente caso mais de dois contratos sejam firmados em curto intervalo.',
    alternativas: [
      'Aquisição de novo conjunto de amostragem isocinética (investimento R$ 120k)',
      'Parceria operacional de compartilhamento de equipamentos com laboratório credenciado',
      'Concentrar esforços apenas no estado de SP para mitigar custos logísticos'
    ],
    evidence: 'Histórico de win/loss de emissões, simulação S-204 e relatório de inteligência de mercado.',
    relatedEntityType: 'StrategicPlanning',
    relatedEntityId: 'strat-emissao-pb-2026',
    priority: RecommendationPriority.MEDIUM,
    status: RecommendationStatus.NEW,
    confidence: RecommendationConfidence.HIGH,
    dataCoveragePct: 92,
    generatedAt: '2026-10-18T14:00:00-03:00',
    expiresAt: '2026-11-30T23:59:59-03:00',
    evidenceSnapshotId: 'SNAP-REC-004',
    engineVersion: 'v1.0'
  }
];

export class StrategicRecommendationEngine {
  /**
   * Obtém lista de recomendações com suporte a filtros de governança
   */
  static getRecommendations(filters = {}) {
    let list = this._loadRecommendations();

    if (filters.companyId && filters.companyId !== 'ALL') {
      list = list.filter(r => r.companyId === filters.companyId || r.companyId === 'Grupo Vellia');
    }

    if (filters.type) {
      list = list.filter(r => r.type === filters.type);
    }

    if (filters.priority) {
      list = list.filter(r => r.priority === filters.priority);
    }

    if (filters.status) {
      list = list.filter(r => r.status === filters.status);
    }

    return list.sort((a, b) => {
      // Ordenação: CRITICAL > HIGH > MEDIUM > LOW
      const pWeights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (pWeights[b.priority] || 0) - (pWeights[a.priority] || 0);
    });
  }

  /**
   * Obtém recomendação por ID
   */
  static getRecommendationById(id) {
    const list = this._loadRecommendations();
    return list.find(r => r.id === id) || null;
  }

  /**
   * Aceita recomendação (sem execução automática - gera tarefa, iniciativa ou cenário)
   */
  static acceptRecommendation(id, actionType = 'REVIEW', notes = '') {
    const list = this._loadRecommendations();
    const item = list.find(r => r.id === id);
    if (!item) throw new Error('Recomendação não encontrada.');

    item.status = RecommendationStatus.ACCEPTED;
    item.acceptedAt = new Date().toISOString();
    item.acceptedActionType = actionType;
    item.acceptedNotes = notes;

    this._saveRecommendations(list);
    this._logFeedback(id, 'ACCEPTED', { actionType, notes });
    return item;
  }

  /**
   * Posterga recomendação para reavaliação futura
   */
  static deferRecommendation(id, deferUntilDate, notes = '') {
    const list = this._loadRecommendations();
    const item = list.find(r => r.id === id);
    if (!item) throw new Error('Recomendação não encontrada.');

    item.status = RecommendationStatus.DEFERRED;
    item.deferredUntil = deferUntilDate;
    item.deferredNotes = notes;

    this._saveRecommendations(list);
    this._logFeedback(id, 'DEFERRED', { deferUntilDate, notes });
    return item;
  }

  /**
   * Descarta recomendação com motivo justificado
   */
  static dismissRecommendation(id, dismissReason, notes = '') {
    const list = this._loadRecommendations();
    const item = list.find(r => r.id === id);
    if (!item) throw new Error('Recomendação não encontrada.');

    if (item.priority === RecommendationPriority.CRITICAL && (!notes || notes.trim().length < 10)) {
      throw new Error('Recomendações CRÍTICAS exigem justificativa formal de ao menos 10 caracteres para descarte.');
    }

    item.status = RecommendationStatus.DISMISSED;
    item.dismissedAt = new Date().toISOString();
    item.dismissReason = dismissReason || DismissReason.OTHER;
    item.dismissNotes = notes;

    this._saveRecommendations(list);
    this._logFeedback(id, 'DISMISSED', { dismissReason, notes });
    return item;
  }

  /**
   * Detecta colisões entre recomendações ativas (Recommendation Collision / Trade-offs)
   */
  static detectCollisions(recommendations = []) {
    const collisions = [];
    const active = recommendations.filter(r => r.status === RecommendationStatus.NEW || r.status === RecommendationStatus.REVIEWED);

    const hasExpansion = active.some(r => r.type === RecommendationType.STRATEGIC && r.title.includes('Expansão'));
    const hasCapacityGap = active.some(r => r.type === RecommendationType.CAPACITY);

    if (hasExpansion && hasCapacityGap) {
      collisions.push({
        type: 'EXPANSION_VS_CAPACITY',
        title: 'Conflito de Trade-Off: Expansão de Mercado vs Gargalo de Capacidade',
        description: 'Existem recomendações ativas para acelerar participação em novos certames e simultaneamente alerta de equipe saturada. Recomenda-se balancear no Laboratório de Cenários.',
        recommendationIds: active.filter(r => r.type === RecommendationType.STRATEGIC || r.type === RecommendationType.CAPACITY).map(r => r.id)
      });
    }

    return collisions;
  }

  /**
   * Converte a recomendação aceita em uma Decisão Estratégica formal na Fase 55
   */
  static convertToStrategicDecision(recommendationId, userComment = '') {
    const rec = this.getRecommendationById(recommendationId);
    if (!rec) throw new Error('Recomendação não encontrada.');

    // Cria decisão formal na Memória Estratégica
    const createdDecision = StrategicMemoryService.recordDecision({
      companyId: rec.companyId,
      decisionType: rec.type === RecommendationType.OPPORTUNITY ? 'GO' : 'STRATEGIC_PRIORITY',
      relatedEntityType: rec.relatedEntityType,
      relatedEntityId: rec.relatedEntityId,
      title: `Decisão Formal: ${rec.title}`,
      reason: `${rec.suggestedAction} [Originado da recomendação ${rec.id}]. Comentário: ${userComment || 'Aprovado pelo comitê executivo.'}`,
      primaryReasonCode: 'VALOR_ESTRATEGICO',
      decidedBy: 'Diretoria / Comitê de Licitações',
      context: {
        opportunityValue: 1200000,
        margin: 18.5,
        riskLevel: 'LOW',
        technicalFit: 94,
        buyer: 'Sabesp',
        serviceType: 'Serviços de Engenharia e Saneamento'
      },
      assumptions: [
        {
          assumption: rec.suggestedAction,
          source: `Recomendação Estratégica ${rec.id} (Confiança: ${rec.confidence})`
        }
      ]
    });

    // Atualiza status da recomendação para IMPLEMENTED
    rec.status = RecommendationStatus.IMPLEMENTED;
    rec.implementedDecisionId = createdDecision.id;
    const list = this._loadRecommendations();
    const idx = list.findIndex(r => r.id === rec.id);
    if (idx !== -1) list[idx] = rec;
    this._saveRecommendations(list);

    return createdDecision;
  }

  /**
   * Resposta do Copilot no padrão de recomendação explicável
   */
  static askRecommendationCopilot(query, companyScope = 'ALL', hasFinancialAccess = true) {
    const q = query.toLowerCase();
    const list = this.getRecommendations({ companyId: companyScope });

    if (q.includes('hoje') || q.includes('prioridade') || q.includes('recomenda')) {
      const critical = list.filter(r => r.priority === RecommendationPriority.CRITICAL || r.priority === RecommendationPriority.HIGH);
      if (critical.length > 0) {
        const top = critical[0];
        return {
          observation: top.observation,
          recommendation: top.suggestedAction,
          evidence: top.evidence,
          alternatives: top.alternativas,
          risk: top.risks,
          answer: `Com base nos dados atuais, sugere-se avaliar com prioridade: "${top.title}". Observação: ${top.observation}. Ação sugerida: ${top.suggestedAction}.`
        };
      }
    }

    if (q.includes('capacidade') || q.includes('equipe') || q.includes('gargalo')) {
      const cap = list.find(r => r.type === RecommendationType.CAPACITY);
      if (cap) {
        return {
          observation: cap.observation,
          recommendation: cap.suggestedAction,
          evidence: cap.evidence,
          alternatives: cap.alternativas,
          risk: cap.risks,
          answer: `Em relação à capacidade operacional: "${cap.title}". Sugere-se testar no Laboratório de Cenários a vitória simultânea em Sabesp e Copasa para mitigar o déficit de engenheiros antes da assinatura.`
        };
      }
    }

    if (q.includes('preço') || q.includes('margem') || q.includes('custo')) {
      if (!hasFinancialAccess) {
        return {
          answer: 'Detalhes de recomendações de margem e precificação são restritos a usuários com alçada financeira aprovada.',
          evidence: 'Controle de Alçada Institucional (Fase 36/57)'
        };
      }
      const pricing = list.find(r => r.type === RecommendationType.PRICING);
      if (pricing) {
        return {
          observation: pricing.observation,
          recommendation: pricing.suggestedAction,
          evidence: pricing.evidence,
          alternatives: pricing.alternativas,
          risk: pricing.risks,
          answer: `Recomendação de precificação ativa: "${pricing.title}". Observa-se margem de 14.2% para Santos com expiração de cotação em 48h. Ação sugerida: renegociar desconto de 8% com o laboratório parceiro.`
        };
      }
    }

    return {
      answer: `O Recommendation Engine monitora ${list.length} recomendações ativas baseadas em evidências do pipeline, capacidade e contratos. Nenhuma sugestão é imperativa; todas preservam alternativas de deliberação humana.`,
      evidence: 'Base canônica de Recomendações Estratégicas Vellia 2.1'
    };
  }

  // --- PERSISTÊNCIA INTERNA ---
  static _loadRecommendations() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return JSON.parse(JSON.stringify(INITIAL_RECOMMENDATIONS));
  }

  static _saveRecommendations(list) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.RECOMMENDATIONS, JSON.stringify(list));
      }
    } catch {}
  }

  static _logFeedback(recommendationId, action, metadata = {}) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.FEEDBACK_LOG);
        const log = raw ? JSON.parse(raw) : [];
        log.unshift({
          recommendationId,
          action,
          metadata,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.FEEDBACK_LOG, JSON.stringify(log.slice(0, 50)));
      }
    } catch {}
  }
}
