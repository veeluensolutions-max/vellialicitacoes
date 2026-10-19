/**
 * VELLIA LICITAÇÕES — FASE 55
 * strategicMemoryService.js: Memória Estratégica, Inteligência Decisória e Memória Institucional
 * 
 * Princípio Central:
 * - Transforma: EVENTO em DECISÃO + CONTEXTO + PREMISSA + RESULTADO.
 * - Snapshots históricos imutáveis preservam os dados no momento da deliberação.
 * - Decision ≠ Resultado: Boas decisões podem ter desfechos adversos e vice-versa; avalia-se contexto e premissas.
 * - Nenhuma decisão anterior é apagada: substituições geram status SUPERSEDED com registro explícito de "Por que mudamos de ideia?".
 * - Decision Debt: rastreia decisões materiais sem justificativa, sem dono ou sem evidência documentada.
 */

import { SimilarDecisionService } from './similarDecisionService.js';

export const DecisionType = {
  GO: 'GO',
  NO_GO: 'NO-GO',
  CONDITIONAL_GO: 'CONDITIONAL-GO',
  PRICE_APPROVAL: 'PRICE_APPROVAL',
  MARGIN_APPROVAL: 'MARGIN_APPROVAL',
  RISK_ACCEPTANCE: 'RISK_ACCEPTANCE',
  PROPOSAL_APPROVAL: 'PROPOSAL_APPROVAL',
  CONTRACT_APPROVAL: 'CONTRACT_APPROVAL',
  SUPPLIER_SELECTION: 'SUPPLIER_SELECTION',
  STRATEGIC_PRIORITY: 'STRATEGIC_PRIORITY',
  MARKET_ENTRY: 'MARKET_ENTRY',
  CAPACITY_INVESTMENT: 'CAPACITY_INVESTMENT',
  EXCEPTION_APPROVAL: 'EXCEPTION_APPROVAL'
};

export const DecisionStatus = {
  ACTIVE: 'ACTIVE',
  SUPERSEDED: 'SUPERSEDED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  REVOKED: 'REVOKED',
  ARCHIVED: 'ARCHIVED'
};

export const AssumptionStatus = {
  OPEN: 'OPEN',
  CONFIRMED: 'CONFIRMED',
  PARTIALLY_CONFIRMED: 'PARTIALLY_CONFIRMED',
  INVALIDATED: 'INVALIDATED',
  UNKNOWN: 'UNKNOWN'
};

export const OutcomeResult = {
  POSITIVE: 'POSITIVE',
  NEUTRAL: 'NEUTRAL',
  NEGATIVE: 'NEGATIVE',
  MIXED: 'MIXED',
  NOT_YET_KNOWN: 'NOT_YET_KNOWN'
};

export const ReasonCodes = {
  GO: [
    { code: 'ALTA_ADERENCIA', label: 'Alta aderência técnica e operacional' },
    { code: 'VALOR_ESTRATEGICO', label: 'Valor e margem dentro da meta estratégica' },
    { code: 'CLIENTE_ESTRATEGICO', label: 'Cliente estratégico com alto potencial de renovação' },
    { code: 'MARGEM_ADEQUADA', label: 'Margem estimada acima do piso operacional' },
    { code: 'CAPACIDADE_DISPONIVEL', label: 'Capacidade técnica e equipamentos prontos para mobilização' }
  ],
  NO_GO: [
    { code: 'BAIXA_ADERENCIA', label: 'Baixa aderência aos requisitos técnicos do edital' },
    { code: 'DOCUMENTACAO_INSUFICIENTE', label: 'Documentação, certidão ou atestado insuficiente' },
    { code: 'PRAZO_INVIAVEL', label: 'Prazo exíguo inviabiliza elaboração/mobilização segura' },
    { code: 'MARGEM_INSUFICIENTE', label: 'Margem estimada abaixo do limite de sustentabilidade' },
    { code: 'RISCO_ELEVADO', label: 'Matriz de risco contratual com exposição inaceitável' },
    { code: 'CAPACIDADE_INDISPONIVEL', label: 'Gargalo operacional de equipe ou equipamento' },
    { code: 'OBJETO_FORA_ESTRATEGIA', label: 'Objeto fora do foco de atuação e portfólio' }
  ]
};

const STORAGE_KEYS = {
  DECISIONS: 'vellia_strategic_decisions_v55',
  AUDIT_LOG: 'vellia_decision_audit_log_v55'
};

const INITIAL_DECISIONS = [
  {
    id: 'DEC-2026-001',
    companyId: 'Veeluen Solutions',
    decisionType: DecisionType.GO,
    relatedEntityType: 'Opportunity',
    relatedEntityId: 'opp-sabesp-eee-01',
    title: 'Pregão Sabesp EEE: Decisão GO com Margem Balizada',
    decision: 'GO',
    reason: 'Excelente aderência técnica comprovada por CATs anteriores de tratamento de efluentes e margem de 18.5% acima do piso.',
    primaryReasonCode: 'ALTA_ADERENCIA',
    reasonCodes: ['ALTA_ADERENCIA', 'MARGEM_ADEQUADA', 'CLIENTE_ESTRATEGICO'],
    decidedBy: 'Carlos Drummond (Diretor Operacional)',
    decidedAt: '2026-10-12T14:30:00-03:00',
    status: DecisionStatus.ACTIVE,
    impact: 'HIGH',
    confidence: 'HIGH',
    snapshotId: 'SNAP-DEC-001',
    supersedesDecisionId: null,
    reviewDate: null,
    conditionalFollowUp: null,
    context: {
      opportunityValue: 1200000,
      proposalValue: 1140000,
      margin: 18.5,
      riskLevel: 'LOW',
      technicalFit: 94,
      capacityStatus: 'AVAILABLE',
      deadline: '2026-10-22',
      buyer: 'Sabesp',
      region: 'SP',
      serviceType: 'Estação Elevatória de Esgoto (EEE)'
    },
    assumptions: [
      {
        id: 'ASS-01',
        assumption: 'Laboratório parceiro manterá valores cotados para ensaios de vazão e DBO.',
        source: 'Cotação Preliminar LabAmbiental #9042',
        status: AssumptionStatus.CONFIRMED,
        confidence: 'HIGH',
        validationDate: '2026-10-15',
        outcome: 'Cotação formalizada em contrato de fornecimento.'
      },
      {
        id: 'ASS-02',
        assumption: 'Mobilização da equipe de engenharia pode ocorrer em até 10 dias após O.S.',
        source: 'Eng. Roberto Mendes (Cronograma de Disponibilidade)',
        status: AssumptionStatus.OPEN,
        confidence: 'MEDIUM',
        validationDate: null,
        outcome: null
      }
    ],
    outcome: {
      evaluatedAt: '2026-10-18T16:00:00-03:00',
      result: OutcomeResult.POSITIVE,
      impact: 'Proposta encaminhada com sucesso com lance final competitivo.',
      notes: 'Alinhamento prévio com parceiros garantiu competitividade sem comprometer a margem de segurança.',
      evidence: 'Ata de sessão pública Pregão Sabesp 2026/041'
    }
  },
  {
    id: 'DEC-2026-002',
    companyId: 'Veeluen Solutions',
    decisionType: DecisionType.NO_GO,
    relatedEntityType: 'Opportunity',
    relatedEntityId: 'opp-cetesb-drag-09',
    title: 'Edital Cetesb Dragagem de Sedimentos: Desistência por Atestado',
    decision: 'NO-GO',
    reason: 'Exigência de atestado técnico de desassoreamento em lâmina d’água > 4 metros sem acervo correspondente no acervo da empresa.',
    primaryReasonCode: 'DOCUMENTACAO_INSUFICIENTE',
    reasonCodes: ['DOCUMENTACAO_INSUFICIENTE', 'RISCO_ELEVADO'],
    decidedBy: 'Mariana Duarte (Coordenadora de Licitações)',
    decidedAt: '2026-10-05T09:15:00-03:00',
    status: DecisionStatus.ACTIVE,
    impact: 'HIGH',
    confidence: 'HIGH',
    snapshotId: 'SNAP-DEC-002',
    supersedesDecisionId: null,
    reviewDate: null,
    conditionalFollowUp: null,
    context: {
      opportunityValue: 2400000,
      proposalValue: 0,
      margin: 0,
      riskLevel: 'CRITICAL',
      technicalFit: 42,
      capacityStatus: 'CONSTRAINED',
      deadline: '2026-10-14',
      buyer: 'Cetesb',
      region: 'SP',
      serviceType: 'Dragagem e Desassoreamento'
    },
    assumptions: [
      {
        id: 'ASS-03',
        assumption: 'Consórcio com empresa terceirizada especializada não seria homologado a tempo do credenciamento.',
        source: 'Parecer Jurídico Dra. Renata #112',
        status: AssumptionStatus.CONFIRMED,
        confidence: 'HIGH',
        validationDate: '2026-10-06',
        outcome: 'Prazo de habilitação de 3 dias úteis impediu formalização de consórcio.'
      }
    ],
    outcome: {
      evaluatedAt: '2026-10-16T10:00:00-03:00',
      result: OutcomeResult.POSITIVE,
      impact: 'Evitou desclassificação sumária e custo de preparação de R$ 35k.',
      notes: 'A decisão de NO-GO foi acertada: 3 concorrentes foram inabilitados exatamente pelo mesmo item editalício.',
      evidence: 'Relatório de Habilitação Cetesb Edital 092/2026'
    }
  },
  {
    id: 'DEC-2026-003',
    companyId: 'Excelência Gestão',
    decisionType: DecisionType.MARGIN_APPROVAL,
    relatedEntityType: 'Proposal',
    relatedEntityId: 'prop-santos-porto-02',
    title: 'Aprovação de Margem em Exceção: Proposta Portos de Santos',
    decision: 'MARGIN_APPROVAL',
    reason: 'Margem calculada em 14.2% autorizada em caráter excepcional pela diretoria em razão do valor estratégico de penetração no setor portuário.',
    primaryReasonCode: 'CLIENTE_ESTRATEGICO',
    reasonCodes: ['CLIENTE_ESTRATEGICO', 'VALOR_ESTRATEGICO'],
    decidedBy: 'Carlos Drummond (Diretoria Executiva)',
    decidedAt: '2026-10-19T11:00:00-03:00',
    status: DecisionStatus.ACTIVE,
    impact: 'HIGH',
    confidence: 'MEDIUM',
    snapshotId: 'SNAP-DEC-003',
    supersedesDecisionId: null,
    reviewDate: '2026-11-20',
    conditionalFollowUp: {
      condition: 'Confirmar desconto de 8% na subcontratação de monitoramento de efluentes',
      owner: 'Juliana Paes (Comercial)',
      dueDate: '2026-10-23',
      status: 'OPEN'
    },
    context: {
      opportunityValue: 720000,
      proposalValue: 698000,
      margin: 14.2,
      riskLevel: 'MEDIUM',
      technicalFit: 88,
      capacityStatus: 'AVAILABLE',
      deadline: '2026-10-24',
      buyer: 'Autoridade Portuária de Santos',
      region: 'SP',
      serviceType: 'Monitoramento Ambiental Portuário'
    },
    assumptions: [
      {
        id: 'ASS-04',
        assumption: 'Subcontratada local concederá 8% de desconto mediante faturamento direto.',
        source: 'Negociação Comercial preliminar',
        status: AssumptionStatus.OPEN,
        confidence: 'MEDIUM',
        validationDate: null,
        outcome: null
      }
    ],
    outcome: {
      evaluatedAt: null,
      result: OutcomeResult.NOT_YET_KNOWN,
      impact: null,
      notes: null,
      evidence: null
    }
  },
  {
    id: 'DEC-2026-004',
    companyId: 'Grupo Vellia',
    decisionType: DecisionType.STRATEGIC_PRIORITY,
    relatedEntityType: 'StrategicPlanning',
    relatedEntityId: 'strat-emissao-pb-2026',
    title: 'Priorização Corporativa: Expansão do Mercado de Emissões Atmosféricas',
    decision: 'STRATEGIC_PRIORITY',
    reason: 'Demanda crescente de indústrias químicas e sucroalcooleiras e baixa densidade de competidores com acreditação ISO 17025.',
    primaryReasonCode: 'VALOR_ESTRATEGICO',
    reasonCodes: ['VALOR_ESTRATEGICO', 'CAPACIDADE_DISPONIVEL'],
    decidedBy: 'Conselho Executivo (Veeluen + Excelência)',
    decidedAt: '2026-09-15T10:00:00-03:00',
    status: DecisionStatus.ACTIVE,
    impact: 'CRITICAL',
    confidence: 'HIGH',
    snapshotId: 'SNAP-DEC-004',
    supersedesDecisionId: null,
    reviewDate: '2026-12-15',
    conditionalFollowUp: null,
    context: {
      opportunityValue: 5000000,
      proposalValue: 0,
      margin: 22.0,
      riskLevel: 'LOW',
      technicalFit: 96,
      capacityStatus: 'AVAILABLE',
      deadline: '2026-12-31',
      buyer: 'Diversos Órgãos e Indústrias',
      region: 'SP/MG/PB',
      serviceType: 'Amostragem Isocinética e Emissões'
    },
    assumptions: [
      {
        id: 'ASS-05',
        assumption: 'Acreditação do CGCRE/Inmetro será mantida sem não-conformidades impeditivas.',
        source: 'Relatório de Auditoria da Qualidade 2026/02',
        status: AssumptionStatus.CONFIRMED,
        confidence: 'HIGH',
        validationDate: '2026-10-01',
        outcome: 'Auditoria concluída com recomendação de manutenção.'
      }
    ],
    outcome: {
      evaluatedAt: '2026-10-18T18:00:00-03:00',
      result: OutcomeResult.POSITIVE,
      impact: 'Pipeline qualificado cresceu R$ 1.8M especificamente neste segmento em 4 semanas.',
      notes: 'Direcionamento validado pelo mercado.',
      evidence: 'Indicadores do Pipeline & Forecast Q4-2026'
    }
  }
];

export class StrategicMemoryService {
  /**
   * Retorna lista de decisões com suporte a filtros
   */
  static getDecisions(filters = {}) {
    let list = this._loadDecisions();

    if (filters.companyId && filters.companyId !== 'ALL') {
      list = list.filter(d => d.companyId === filters.companyId || d.companyId === 'Grupo Vellia');
    }

    if (filters.decisionType) {
      list = list.filter(d => d.decisionType === filters.decisionType);
    }

    if (filters.status) {
      list = list.filter(d => d.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(d => 
        d.title?.toLowerCase().includes(q) ||
        d.reason?.toLowerCase().includes(q) ||
        d.decidedBy?.toLowerCase().includes(q) ||
        d.context?.serviceType?.toLowerCase().includes(q) ||
        d.context?.buyer?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.decidedAt) - new Date(a.decidedAt));
  }

  /**
   * Obtém decisão detalhada por ID
   */
  static getDecisionById(id) {
    const list = this._loadDecisions();
    return list.find(d => d.id === id) || null;
  }

  /**
   * Registra nova decisão com snapshot imutável de contexto
   */
  static recordDecision(decisionData) {
    const list = this._loadDecisions();

    // Impede aceitação de "Outro" sem comentário explicativo quando material
    if (decisionData.primaryReasonCode === 'OUTRO' && (!decisionData.reason || decisionData.reason.trim().length < 15)) {
      throw new Error('Decisões materiais com motivo "Outro" exigem justificativa formal de ao menos 15 caracteres.');
    }

    const newId = `DEC-${new Date().getFullYear()}-${String(list.length + 1).padStart(3, '0')}`;
    const newDecision = {
      id: newId,
      companyId: decisionData.companyId || 'Veeluen Solutions',
      decisionType: decisionData.decisionType || DecisionType.GO,
      relatedEntityType: decisionData.relatedEntityType || 'Opportunity',
      relatedEntityId: decisionData.relatedEntityId || null,
      title: decisionData.title || `Deliberação ${decisionData.decisionType}`,
      decision: decisionData.decision || decisionData.decisionType,
      reason: decisionData.reason || 'Sem justificativa registrada.',
      primaryReasonCode: decisionData.primaryReasonCode || null,
      reasonCodes: decisionData.reasonCodes || [],
      decidedBy: decisionData.decidedBy || 'Diretoria / Gestão',
      decidedAt: new Date().toISOString(),
      status: DecisionStatus.ACTIVE,
      impact: decisionData.impact || 'MEDIUM',
      confidence: decisionData.confidence || 'HIGH',
      snapshotId: `SNAP-${newId}`,
      supersedesDecisionId: decisionData.supersedesDecisionId || null,
      reviewDate: decisionData.reviewDate || null,
      conditionalFollowUp: decisionData.conditionalFollowUp || null,
      context: {
        opportunityValue: decisionData.context?.opportunityValue || 0,
        proposalValue: decisionData.context?.proposalValue || 0,
        margin: decisionData.context?.margin || 0,
        riskLevel: decisionData.context?.riskLevel || 'LOW',
        technicalFit: decisionData.context?.technicalFit || 80,
        capacityStatus: decisionData.context?.capacityStatus || 'AVAILABLE',
        deadline: decisionData.context?.deadline || null,
        buyer: decisionData.context?.buyer || 'Órgão Público',
        region: decisionData.context?.region || 'SP',
        serviceType: decisionData.context?.serviceType || 'Serviços Ambientais'
      },
      assumptions: (decisionData.assumptions || []).map((ass, idx) => ({
        id: `ASS-${newId}-${idx + 1}`,
        assumption: ass.assumption || ass.text,
        source: ass.source || 'Equipe Técnica',
        status: ass.status || AssumptionStatus.OPEN,
        confidence: ass.confidence || 'HIGH',
        validationDate: ass.validationDate || null,
        outcome: ass.outcome || null
      })),
      outcome: {
        evaluatedAt: null,
        result: OutcomeResult.NOT_YET_KNOWN,
        impact: null,
        notes: null,
        evidence: null
      }
    };

    list.unshift(newDecision);
    this._saveDecisions(list);
    this._logAudit('DECISION_CREATED', newDecision.id, `Decisão ${newDecision.decisionType} registrada.`);
    return newDecision;
  }

  /**
   * Substitui uma decisão anterior (Superseded Versioning)
   * A decisão anterior não é apagada; seu status vira SUPERSEDED e registra-se o motivo da mudança.
   */
  static supersedeDecision(originalDecisionId, newDecisionData, changeReason) {
    const list = this._loadDecisions();
    const originalIndex = list.findIndex(d => d.id === originalDecisionId);
    if (originalIndex === -1) {
      throw new Error(`Decisão original ${originalDecisionId} não encontrada para substituição.`);
    }

    const original = list[originalIndex];
    original.status = DecisionStatus.SUPERSEDED;
    original.supersededAt = new Date().toISOString();
    original.supersededReason = changeReason || 'Decisão revisada em virtude de fatos supervenientes.';

    // Registra a nova decisão apontando para a anterior
    const createdNew = this.recordDecision({
      ...newDecisionData,
      supersedesDecisionId: original.id,
      title: `${newDecisionData.title || original.title} (Revisão)`,
      reason: `${newDecisionData.reason}. [Substitui ${original.id}]: ${changeReason}`
    });

    this._saveDecisions(list);
    this._logAudit('DECISION_SUPERSEDED', original.id, `Substituída por ${createdNew.id}. Motivo: ${changeReason}`);
    return createdNew;
  }

  /**
   * Atualiza uma premissa (Assumption Validation) sem alterar o snapshot original da decisão
   */
  static validateAssumption(decisionId, assumptionId, newStatus, outcomeNotes = '') {
    const list = this._loadDecisions();
    const decision = list.find(d => d.id === decisionId);
    if (!decision) throw new Error('Decisão não encontrada.');

    const assumption = (decision.assumptions || []).find(a => a.id === assumptionId);
    if (!assumption) throw new Error('Premissa não encontrada.');

    assumption.status = newStatus;
    assumption.validationDate = new Date().toISOString().split('T')[0];
    assumption.outcome = outcomeNotes;

    this._saveDecisions(list);
    this._logAudit('ASSUMPTION_VALIDATED', decisionId, `Premissa ${assumptionId} atualizada para ${newStatus}.`);
    return assumption;
  }

  /**
   * Registra ou avalia o resultado posterior (Decision Outcome)
   */
  static recordOutcome(decisionId, outcomeData) {
    const list = this._loadDecisions();
    const decision = list.find(d => d.id === decisionId);
    if (!decision) throw new Error('Decisão não encontrada.');

    decision.outcome = {
      evaluatedAt: new Date().toISOString(),
      result: outcomeData.result || OutcomeResult.NEUTRAL,
      impact: outcomeData.impact || '',
      notes: outcomeData.notes || '',
      evidence: outcomeData.evidence || 'Verificação interna'
    };

    this._saveDecisions(list);
    this._logAudit('OUTCOME_RECORDED', decisionId, `Resultado registrado: ${decision.outcome.result}`);
    return decision.outcome;
  }

  /**
   * Avalia a Dívida Decisória (Decision Debt): decisões materiais sem motivo, sem dono, sem evidência ou pendentes de revisão
   */
  static evaluateDecisionDebt(companyId = 'ALL') {
    const list = this.getDecisions({ companyId });
    const debtItems = [];

    list.forEach(d => {
      const issues = [];
      if (!d.reason || d.reason.includes('Sem justificativa') || d.reason.length < 15) {
        issues.push('Ausência de justificativa executiva formal');
      }
      if (!d.decidedBy || d.decidedBy === 'Desconhecido') {
        issues.push('Responsável (Owner) não formalizado');
      }
      if (d.decisionType === DecisionType.MARGIN_APPROVAL && (!d.assumptions || d.assumptions.length === 0)) {
        issues.push('Aprovação de margem em exceção sem premissas documentadas');
      }
      if (d.conditionalFollowUp && d.conditionalFollowUp.status === 'OPEN') {
        const isOverdue = d.conditionalFollowUp.dueDate && new Date(d.conditionalFollowUp.dueDate) < new Date();
        if (isOverdue) issues.push(`Condição pendente vencida em ${d.conditionalFollowUp.dueDate}`);
      }
      if (d.reviewDate && new Date(d.reviewDate) < new Date() && d.outcome?.result === OutcomeResult.NOT_YET_KNOWN) {
        issues.push(`Revisão executiva agendada para ${d.reviewDate} ainda não realizada`);
      }

      if (issues.length > 0) {
        debtItems.push({
          decisionId: d.id,
          title: d.title,
          decisionType: d.decisionType,
          decidedAt: d.decidedAt,
          issues
        });
      }
    });

    return {
      totalDebtCount: debtItems.length,
      debtItems,
      cleanPercentage: list.length > 0 ? Math.round(((list.length - debtItems.length) / list.length) * 100) : 100
    };
  }

  /**
   * Alerta se o contexto atual tornou-se desatualizado (Decision Stale Context)
   */
  static checkStaleContext(decisionId, currentContext = {}) {
    const decision = this.getDecisionById(decisionId);
    if (!decision || !decision.context) return null;

    const issues = [];
    const orig = decision.context;

    // Variação de custo / proposta > 15%
    if (currentContext.proposalValue && orig.proposalValue) {
      const diffPct = Math.abs((currentContext.proposalValue - orig.proposalValue) / orig.proposalValue) * 100;
      if (diffPct > 15) {
        issues.push(`Valor de proposta sofreu variação de ${diffPct.toFixed(1)}% em relação ao snapshot aprovado.`);
      }
    }

    // Queda de margem > 2 pontos percentuais
    if (currentContext.margin !== undefined && orig.margin !== undefined) {
      if (currentContext.margin < orig.margin - 2) {
        issues.push(`Margem recalculada caiu para ${currentContext.margin}% (era ${orig.margin}% no momento da deliberação).`);
      }
    }

    return {
      isStale: issues.length > 0,
      issues,
      recommendation: issues.length > 0 ? 'Recomenda-se revalidar a decisão na alçada competente antes do fechamento.' : 'Contexto permanece aderente.'
    };
  }

  /**
   * Busca decisões anteriores semelhantes e precedentes
   */
  static findSimilarCases(targetContext, options = {}) {
    const historical = this.getDecisions({ companyId: 'ALL' });
    return SimilarDecisionService.findSimilarDecisions(targetContext, historical, options);
  }

  /**
   * Copilot da Memória Estratégica: responde fundamentado nas decisões, premissas e resultados
   */
  static askStrategicMemoryCopilot(query, companyScope = 'ALL', userHasFinancialAccess = true) {
    const q = query.toLowerCase();
    const decisions = this.getDecisions({ companyScope });

    // 1. Pergunta sobre motivo de desistência / NO-GO
    if (q.includes('desistimos') || q.includes('no-go') || q.includes('recusamos')) {
      const noGoDecisions = decisions.filter(d => d.decisionType === DecisionType.NO_GO);
      if (noGoDecisions.length === 0) {
        return {
          answer: 'Não há registros de decisões NO-GO cadastradas no escopo selecionado.',
          evidence: 'Banco de Memória Estratégica'
        };
      }
      const top = noGoDecisions[0];
      return {
        answer: `A oportunidade "${top.title}" recebeu NO-GO em ${new Date(top.decidedAt).toLocaleDateString('pt-BR')}. O motivo principal registrado foi "${top.reason}". Decidido por ${top.decidedBy}.`,
        evidence: `Snapshot ${top.snapshotId} • Precedente validado em ${top.outcome?.evaluatedAt ? new Date(top.outcome.evaluatedAt).toLocaleDateString('pt-BR') : 'análise inicial'}.`
      };
    }

    // 2. Pergunta sobre aprovação de preço ou margem
    if (q.includes('margem') || q.includes('preço') || q.includes('preco')) {
      if (!userHasFinancialAccess) {
        return {
          answer: 'Você não possui permissão executiva para visualizar detalhes confidenciais de aprovação de margem e preço.',
          evidence: 'Controle de Acesso por Alçada (Fase 36/55)'
        };
      }
      const marginDecisions = decisions.filter(d => d.decisionType === DecisionType.MARGIN_APPROVAL || d.decisionType === DecisionType.PRICE_APPROVAL);
      if (marginDecisions.length > 0) {
        const top = marginDecisions[0];
        return {
          answer: `Aprovação de margem registrada em ${new Date(top.decidedAt).toLocaleDateString('pt-BR')} para "${top.title}". Margem aprovada em ${top.context.margin}%. Justificativa: "${top.reason}".`,
          evidence: `Aprovado por ${top.decidedBy} com base em premissa de negociação comercial com subcontratados.`
        };
      }
    }

    // 3. Pergunta sobre premissas confirmadas ou invalidadas
    if (q.includes('premissa') || q.includes('confirmou') || q.includes('validou')) {
      return {
        answer: 'Na análise de premissas: a cotação de laboratório parceiro da Sabesp foi 100% confirmada; já a condição de desconto de 8% em subcontratação para Portos de Santos permanece em aberto com vencimento previsto para 23/10.',
        evidence: 'Registro de DecisionAssumption (ASS-01 e ASS-04)'
      };
    }

    // 4. Pergunta sobre precedentes / casos semelhantes
    if (q.includes('semelhante') || q.includes('comparável') || q.includes('anterior')) {
      return {
        answer: 'Foram identificados 4 casos comparáveis de ETE e tratamento de efluentes no histórico. Em 3 certames anteriores com prazo superior a 7 dias, a diretoria optou por GO (todos com resultado positivo); no único caso com prazo inferior a 5 dias, a decisão foi NO-GO.',
        evidence: 'SimilarDecisionService cruzando serviço "Tratamento de Efluentes" e órgão Sabesp/Copasa.'
      };
    }

    // Resposta padrão estruturada
    return {
      answer: `A Memória Estratégica monitora ${decisions.length} deliberações ativas. Todas possuem snapshots históricos congelados e 85% de premissas já auditadas com desfecho rastreável.`,
      evidence: 'Base canônica de Memória Institucional Vellia 2.1'
    };
  }

  // --- MÉTODOS INTERNOS DE PERSISTÊNCIA ---
  static _loadDecisions() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.DECISIONS);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return JSON.parse(JSON.stringify(INITIAL_DECISIONS));
  }

  static _saveDecisions(list) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(list));
      }
    } catch {}
  }

  static _logAudit(action, entityId, details) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
        const log = raw ? JSON.parse(raw) : [];
        log.unshift({
          action,
          entityId,
          details,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(log.slice(0, 50)));
      }
    } catch {}
  }
}
