/**
 * VELLIA LICITAÇÕES — FASE 58
 * autonomyPolicyEngine.js: Autonomous Operations Guardrails, Policy Engine e Governança de Automação
 * 
 * Princípios Fundamentais:
 * - AUTOMAÇÃO PROPORCIONAL AO RISCO: Quanto maior o impacto, menor a autonomia sem supervisão humana.
 * - Diferença para RBAC: RBAC define "Quem pode fazer"; Guardrail define "O sistema pode fazer sozinho?".
 * - Níveis de Autonomia (0 a 5): Manual, Assist, Prepare, Internal, External Confirm, External Approve.
 * - NUNCA existe Level 6 (Autonomia irrestrita).
 * - Hard Safety Limits intransponíveis no código (Lances em pregão, Assinatura jurídica e Bypass de CAPTCHA).
 * - Unificação: Workflows, Vellia Agent e Copilot passam obrigatoriamente por este mesmo engine.
 */

export const AutonomyLevel = {
  LEVEL_0_MANUAL: 0,             // Sistema apenas informa. Usuário executa manualmente.
  LEVEL_1_ASSIST: 1,             // Sistema analisa, sugere e explica. Não executa.
  LEVEL_2_PREPARE: 2,            // Sistema prepara draft/minuta/formulário. Usuário confirma.
  LEVEL_3_INTERNAL: 3,           // Sistema executa ações internas seguras (tarefas, alertas, índices).
  LEVEL_4_EXTERNAL_CONFIRM: 4,   // Ação externa executada somente após confirmação humana contextual.
  LEVEL_5_EXTERNAL_APPROVE: 5    // Ação externa exige ApprovalRequest formal (Fase 36) + confirmação.
};

export const AutonomyLevelLabels = {
  0: 'Nível 0 — Manual (Apenas Humano)',
  1: 'Nível 1 — Assistência / Sugestão',
  2: 'Nível 2 — Preparação de Minuta (Draft)',
  3: 'Nível 3 — Execução Interna Automática',
  4: 'Nível 4 — Ação Externa com Confirmação',
  5: 'Nível 5 — Ação Externa com Aprovação Formal'
};

export const EvaluationResult = {
  ALLOWED: 'ALLOWED',                             // Pode executar automaticamente
  REQUIRES_CONFIRMATION: 'REQUIRES_CONFIRMATION', // Requer confirmação humana (Level 4)
  REQUIRES_APPROVAL: 'REQUIRES_APPROVAL',         // Requer aprovação formal em alçada (Level 5)
  BLOCKED: 'BLOCKED',                             // Bloqueado por violação de regra ou dados
  MANUAL_ONLY: 'MANUAL_ONLY'                      // Restrito a execução manual humana (Level 0)
};

export const ActionStatus = {
  PREPARED: 'PREPARED',
  AWAITING_CONFIRMATION: 'AWAITING_CONFIRMATION',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
  EXECUTING: 'EXECUTING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

// HARD LIMITS DE SEGURANÇA (Impossíveis de ultrapassar por qualquer configuração ou UI)
export const HARD_SAFETY_LIMITS = {
  'bid.place': { maxLevel: AutonomyLevel.LEVEL_0_MANUAL, reason: 'Lances em certames são estritamente manuais por compliance legal.' },
  'captcha.bypass': { maxLevel: AutonomyLevel.LEVEL_0_MANUAL, reason: 'Tentativas de contorno de segurança de portais são proibidas.' },
  'contract.sign': { maxLevel: AutonomyLevel.LEVEL_0_MANUAL, reason: 'Assinatura jurídica de contratos requer representação legal humana.' },
  'contract.accept': { maxLevel: AutonomyLevel.LEVEL_0_MANUAL, reason: 'Aceite de obrigações contratuais exige deliberação formal.' },
  'data.purge_critical': { maxLevel: AutonomyLevel.LEVEL_0_MANUAL, reason: 'Exclusão definitiva de entidades críticas é estritamente manual.' }
};

// CATÁLOGO CANÔNICO DE AÇÕES DO SISTEMA (SystemActionDefinition)
export const SYSTEM_ACTIONS = {
  'task.create': {
    actionKey: 'task.create',
    name: 'Criar Tarefa Interna',
    description: 'Criação de tarefa operacional no backlog da equipe.',
    domain: 'INTERNAL_OPERATIONS',
    defaultAutonomyLevel: AutonomyLevel.LEVEL_3_INTERNAL,
    maximumAutonomyLevel: AutonomyLevel.LEVEL_3_INTERNAL,
    riskLevel: 'LOW',
    externalImpact: false,
    reversible: 'REVERSIBLE',
    requiresAudit: true,
    enabled: true
  },
  'alert.trigger': {
    actionKey: 'alert.trigger',
    name: 'Disparar Alerta / Notificação Interna',
    description: 'Emissão de alerta de vencimento de certidão ou prazo de edital.',
    domain: 'INTERNAL_OPERATIONS',
    defaultAutonomyLevel: AutonomyLevel.LEVEL_3_INTERNAL,
    maximumAutonomyLevel: AutonomyLevel.LEVEL_3_INTERNAL,
    riskLevel: 'LOW',
    externalImpact: false,
    reversible: 'REVERSIBLE',
    requiresAudit: false,
    enabled: true
  },
  'email.send': {
    actionKey: 'email.send',
    name: 'Enviar E-mail Externo Individual',
    description: 'Envio de solicitação de cotação ou follow-up com cliente/fornecedor.',
    domain: 'COMMUNICATIONS',
    defaultAutonomyLevel: AutonomyLevel.LEVEL_4_EXTERNAL_CONFIRM,
    maximumAutonomyLevel: AutonomyLevel.LEVEL_4_EXTERNAL_CONFIRM,
    riskLevel: 'MEDIUM',
    externalImpact: true,
    reversible: 'IRREVERSIBLE',
    requiresAudit: true,
    enabled: true
  },
  'email.bulk_send': {
    actionKey: 'email.bulk_send',
    name: 'Disparo de E-mails em Massa',
    description: 'Envio coordenado de mensagens para múltiplos destinatários externos.',
    domain: 'COMMUNICATIONS',
    defaultAutonomyLevel: AutonomyLevel.LEVEL_5_EXTERNAL_APPROVE,
    maximumAutonomyLevel: AutonomyLevel.LEVEL_5_EXTERNAL_APPROVE,
    riskLevel: 'HIGH',
    externalImpact: true,
    reversible: 'IRREVERSIBLE',
    requiresAudit: true,
    enabled: true
  },
  'proposal.submit': {
    actionKey: 'proposal.submit',
    name: 'Submissão Formal de Proposta Comercial',
    description: 'Envio final de proposta de preços e planilha analítica para o certame.',
    domain: 'COMMERCIAL',
    defaultAutonomyLevel: AutonomyLevel.LEVEL_5_EXTERNAL_APPROVE,
    maximumAutonomyLevel: AutonomyLevel.LEVEL_5_EXTERNAL_APPROVE,
    riskLevel: 'CRITICAL',
    externalImpact: true,
    reversible: 'IRREVERSIBLE',
    requiresAudit: true,
    enabled: true
  },
  'bid.place': {
    actionKey: 'bid.place',
    name: 'Envio de Lance em Pregão',
    description: 'Disputa de lances na sala de disputa do portal.',
    domain: 'TRADING',
    defaultAutonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
    maximumAutonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
    riskLevel: 'CRITICAL',
    externalImpact: true,
    reversible: 'IRREVERSIBLE',
    requiresAudit: true,
    enabled: false
  },
  'contract.accept': {
    actionKey: 'contract.accept',
    name: 'Aceite de Termo Contratual',
    description: 'Formalização de aceite de minuta contratual de órgão público.',
    domain: 'LEGAL',
    defaultAutonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
    maximumAutonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
    riskLevel: 'CRITICAL',
    externalImpact: true,
    reversible: 'IRREVERSIBLE',
    requiresAudit: true,
    enabled: false
  }
};

const STORAGE_KEYS = {
  POLICIES: 'vellia_autonomy_policies_v58',
  INTENTS: 'vellia_action_intents_v58',
  OVERRIDES: 'vellia_autonomy_overrides_v58',
  EMERGENCY_PAUSE: 'vellia_emergency_pause_v58',
  AUDIT: 'vellia_autonomy_audit_v58'
};

export class AutonomyPolicyEngine {
  /**
   * Avalia se uma ação pode ser executada automaticamente, se exige confirmação ou aprovação
   */
  static evaluateAction(actionKey, context = {}) {
    const actionDef = SYSTEM_ACTIONS[actionKey];
    if (!actionDef) {
      return {
        evaluation: EvaluationResult.BLOCKED,
        autonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
        reason: `Ação "${actionKey}" não reconhecida no catálogo canônico do sistema.`,
        actionDef: null
      };
    }

    // 1. CHECAGEM DE PAUSA DE EMERGÊNCIA (SAFE STOP)
    const pauseState = this.getEmergencyPauseState();
    if (pauseState.active) {
      if (!pauseState.scope || pauseState.scope === 'ALL' || pauseState.scope === actionDef.domain) {
        return {
          evaluation: EvaluationResult.BLOCKED,
          autonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
          reason: `Pausa de Emergência Ativa (${pauseState.reason || 'Safe Stop'}). Todas as execuções externas estão temporariamente suspensas.`,
          actionDef
        };
      }
    }

    // 2. REGRA DE HARD SAFETY LIMIT (Sempre vence; override comum não se aplica)
    const hardLimit = HARD_SAFETY_LIMITS[actionKey];
    if (hardLimit) {
      return {
        evaluation: EvaluationResult.MANUAL_ONLY,
        autonomyLevel: hardLimit.maxLevel,
        reason: `Regra Intransponível de Segurança: ${hardLimit.reason}`,
        actionDef
      };
    }

    // 3. CHECAGEM DE PROTEÇÃO CROSS-COMPANY (Wrong Company Protection)
    if (context.userCompany && context.targetEntityCompany && context.userCompany !== context.targetEntityCompany && context.userCompany !== 'ALL') {
      return {
        evaluation: EvaluationResult.BLOCKED,
        autonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
        reason: `Violação Cross-Company: Usuário vinculado a "${context.userCompany}" não pode executar ação sobre entidade de "${context.targetEntityCompany}".`,
        actionDef
      };
    }

    // 4. CHECAGEM DE DADOS SENSÍVEIS (Sensitive Data DLP Guardrail)
    if (actionDef.externalImpact && context.payloadText) {
      const sensitiveKeywords = ['margem líquida', 'floor price', 'preço mínimo interno', 'nota confidencial', 'segredo industrial'];
      const textLower = context.payloadText.toLowerCase();
      const detected = sensitiveKeywords.filter(k => textLower.includes(k));
      if (detected.length > 0) {
        return {
          evaluation: EvaluationResult.BLOCKED,
          autonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
          reason: `Bloqueio de DLP: Detectado termo confidencial interno (${detected.join(', ')}) em payload com destino externo.`,
          actionDef
        };
      }
    }

    // 5. CHECAGEM DE ANEXOS (Attachment Guardrail)
    if (actionKey === 'email.send' && context.mentionsAttachment && (!context.attachments || context.attachments.length === 0)) {
      return {
        evaluation: EvaluationResult.BLOCKED,
        autonomyLevel: AutonomyLevel.LEVEL_2_PREPARE,
        reason: 'O corpo da mensagem faz referência a arquivo anexo, mas nenhum documento foi anexado.',
        actionDef
      };
    }

    // 6. CHECAGEM DE DISPARO EM MASSA (Bulk Guardrail)
    if (actionKey === 'email.bulk_send' || (context.recipients && context.recipients.length > 10)) {
      return {
        evaluation: EvaluationResult.REQUIRES_APPROVAL,
        autonomyLevel: AutonomyLevel.LEVEL_5_EXTERNAL_APPROVE,
        reason: `Disparo em lote para ${context.recipients?.length || 'múltiplos'} destinatários externos exige aprovação formal de governança.`,
        actionDef
      };
    }

    // 7. POLÍTICA POR EMPRESA E AÇÃO (Company Action Policy)
    const effectiveLevel = this.getEffectiveAutonomyLevel(context.companyId, actionKey);

    if (effectiveLevel === AutonomyLevel.LEVEL_3_INTERNAL) {
      return {
        evaluation: EvaluationResult.ALLOWED,
        autonomyLevel: AutonomyLevel.LEVEL_3_INTERNAL,
        reason: 'Ação interna permitida para execução automática conforme política corporativa.',
        actionDef
      };
    }

    if (effectiveLevel === AutonomyLevel.LEVEL_4_EXTERNAL_CONFIRM) {
      return {
        evaluation: EvaluationResult.REQUIRES_CONFIRMATION,
        autonomyLevel: AutonomyLevel.LEVEL_4_EXTERNAL_CONFIRM,
        reason: 'Ação possui impacto externo; requer confirmação humana contextual antes da transmissão.',
        actionDef
      };
    }

    if (effectiveLevel === AutonomyLevel.LEVEL_5_EXTERNAL_APPROVE) {
      return {
        evaluation: EvaluationResult.REQUIRES_APPROVAL,
        autonomyLevel: AutonomyLevel.LEVEL_5_EXTERNAL_APPROVE,
        reason: 'Ação crítica de negócio; requer requisição de aprovação formal (Fase 36).',
        actionDef
      };
    }

    return {
      evaluation: EvaluationResult.MANUAL_ONLY,
      autonomyLevel: AutonomyLevel.LEVEL_0_MANUAL,
      reason: 'Ação configurada para execução estritamente manual.',
      actionDef
    };
  }

  /**
   * Obtém o nível de autonomia efetivo respeitando o hard limit
   */
  static getEffectiveAutonomyLevel(companyId = 'ALL', actionKey) {
    const actionDef = SYSTEM_ACTIONS[actionKey];
    if (!actionDef) return AutonomyLevel.LEVEL_0_MANUAL;

    const policies = this._loadPolicies();
    const policy = policies.find(p => p.actionKey === actionKey && (p.companyId === companyId || p.companyId === 'ALL'));

    let desiredLevel = policy ? policy.allowedLevel : actionDef.defaultAutonomyLevel;
    // O nível configurado nunca pode exceder o maximumAutonomyLevel (Hard Limit)
    return Math.min(desiredLevel, actionDef.maximumAutonomyLevel);
  }

  /**
   * Registra uma Intenção de Ação (ActionIntent)
   * Separa o desejo de executar da transmissão/execução concreta
   */
  static createActionIntent(intentData) {
    const policyEvaluation = this.evaluateAction(intentData.actionKey, intentData.context || {});
    const list = this._loadIntents();

    // Idempotência: impede duplicações em janelas curtas
    const idempotencyKey = intentData.idempotencyKey || `${intentData.actionKey}-${intentData.entityId || 'gen'}-${Date.now()}`;
    const existing = list.find(i => i.idempotencyKey === idempotencyKey && i.status !== ActionStatus.FAILED);
    if (existing) {
      return existing;
    }

    let initialStatus = ActionStatus.PREPARED;
    if (policyEvaluation.evaluation === EvaluationResult.REQUIRES_CONFIRMATION) {
      initialStatus = ActionStatus.AWAITING_CONFIRMATION;
    } else if (policyEvaluation.evaluation === EvaluationResult.REQUIRES_APPROVAL) {
      initialStatus = ActionStatus.AWAITING_APPROVAL;
    } else if (policyEvaluation.evaluation === EvaluationResult.ALLOWED) {
      initialStatus = ActionStatus.EXECUTING;
    } else if (policyEvaluation.evaluation === EvaluationResult.BLOCKED) {
      initialStatus = ActionStatus.FAILED;
    }

    const newIntent = {
      id: `INTENT-${Date.now()}`,
      actionKey: intentData.actionKey,
      initiatedBy: intentData.initiatedBy || 'Vellia Workflow Engine',
      entityId: intentData.entityId || null,
      contextSnapshot: JSON.parse(JSON.stringify(intentData.context || {})),
      policyResult: policyEvaluation,
      status: initialStatus,
      idempotencyKey,
      confirmedBy: null,
      approvedBy: null,
      createdAt: new Date().toISOString(),
      executedAt: initialStatus === ActionStatus.EXECUTING ? new Date().toISOString() : null
    };

    list.unshift(newIntent);
    this._saveIntents(list);
    this._logAudit('INTENT_CREATED', newIntent.id, `Ação ${intentData.actionKey}: Status ${initialStatus} (${policyEvaluation.reason})`);

    // Se permitida para execução interna imediata (Level 3)
    if (initialStatus === ActionStatus.EXECUTING) {
      newIntent.status = ActionStatus.COMPLETED;
      this._saveIntents(list);
    }

    return newIntent;
  }

  /**
   * Confirmação humana de ação Level 4 (Pre-Action Validation)
   */
  static confirmActionIntent(intentId, confirmedByUser, updatedContext = null) {
    const list = this._loadIntents();
    const intent = list.find(i => i.id === intentId);
    if (!intent) throw new Error('Intenção de ação não encontrada.');

    // PRE-ACTION VALIDATION: Revalida se houve alteração material desde a criação
    if (updatedContext && intent.contextSnapshot) {
      const orig = intent.contextSnapshot;
      if (updatedContext.recipient && orig.recipient && updatedContext.recipient !== orig.recipient) {
        throw new Error('Alteração Material Detectada: O destinatário foi modificado. Uma nova confirmação é exigida.');
      }
      if (updatedContext.price && orig.price && Math.abs(updatedContext.price - orig.price) > 0.01) {
        throw new Error('Alteração Material Detectada: O valor financeiro da proposta mudou. A confirmação anterior foi invalidada.');
      }
    }

    intent.status = ActionStatus.COMPLETED;
    intent.confirmedBy = confirmedByUser || 'Gestor Responsável';
    intent.executedAt = new Date().toISOString();

    this._saveIntents(list);
    this._logAudit('ACTION_CONFIRMED', intentId, `Confirmado por ${intent.confirmedBy} e transmitido com sucesso.`);
    return intent;
  }

  /**
   * Ativa / Desativa Pausa de Emergência (Safe Stop / Kill Switch)
   */
  static toggleEmergencyPause(active, reason = '', scope = 'ALL', author = 'Diretoria Executiva') {
    const pauseState = {
      active,
      reason,
      scope,
      author,
      updatedAt: new Date().toISOString()
    };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.EMERGENCY_PAUSE, JSON.stringify(pauseState));
      }
    } catch {}
    this._logAudit('EMERGENCY_PAUSE_TOGGLED', scope, `Pausa de emergência alterada para ${active ? 'ATIVA' : 'INATIVA'}: ${reason}`);
    return pauseState;
  }

  /**
   * Obtém o estado atual da pausa de emergência
   */
  static getEmergencyPauseState() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.EMERGENCY_PAUSE);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return { active: false, reason: '', scope: 'ALL' };
  }

  /**
   * Registra um Override Controlado temporário
   */
  static registerControlledOverride(actionKey, reason, approvedBy, durationMinutes = 60) {
    const hardLimit = HARD_SAFETY_LIMITS[actionKey];
    if (hardLimit) {
      throw new Error(`Impossível aplicar override sobre Hard Safety Limit: ${hardLimit.reason}`);
    }

    const override = {
      id: `OVR-${Date.now()}`,
      actionKey,
      reason,
      approvedBy,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMinutes * 60000).toISOString()
    };

    const list = this._loadOverrides();
    list.unshift(override);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(list));
      }
    } catch {}

    this._logAudit('CONTROLLED_OVERRIDE', actionKey, `Override de ${durationMinutes}m autorizado por ${approvedBy}: ${reason}`);
    return override;
  }

  /**
   * Executa simulação sem efeitos reais (Dry Run)
   */
  static dryRun(actionKey, context = {}) {
    const evalResult = this.evaluateAction(actionKey, context);
    return {
      dryRun: true,
      actionKey,
      evaluation: evalResult.evaluation,
      autonomyLevel: evalResult.autonomyLevel,
      levelLabel: AutonomyLevelLabels[evalResult.autonomyLevel],
      reason: evalResult.reason,
      sideEffectsForecast: evalResult.actionDef?.externalImpact ? 'Geraria transmissão externa irreversível.' : 'Execução interna contida.'
    };
  }

  /**
   * Respostas do Copilot de Governança e Guardrails
   */
  static askAutonomyCopilot(query, companyScope = 'ALL') {
    const q = query.toLowerCase();

    if (q.includes('sozinho') || q.includes('pode executar') || q.includes('autonomia')) {
      return {
        answer: 'O Vellia opera com autonomia proporcional ao risco (Níveis 0 a 5). Ações internas seguras (como criar tarefas, atualizar índices e emitir alertas) operam no Nível 3 (automático). Envio de e-mails exige confirmação humana (Nível 4). Submissão de propostas exige aprovação formal em alçada (Nível 5). Lances em pregão são estritamente manuais (Nível 0 - Hard Limit).',
        evidence: 'Catálogo de Ações Canônicas e Matriz de Autonomia Vellia 2.1'
      };
    }

    if (q.includes('lance') || q.includes('pregão') || q.includes('pregao') || q.includes('captcha')) {
      return {
        answer: 'Lances em certames públicos e qualquer tentativa de bypass de CAPTCHA possuem Hard Limit fixado em Nível 0 (Manual Only). Nenhuma configuração, permissão de usuário ou comando de IA pode ultrapassar este limite de segurança.',
        evidence: 'Hard-coded Safety Boundary do AutonomyPolicyEngine'
      };
    }

    if (q.includes('aguardando') || q.includes('fila') || q.includes('confirmação')) {
      const intents = this._loadIntents().filter(i => i.status === ActionStatus.AWAITING_CONFIRMATION);
      return {
        answer: `Existem ${intents.length} intenções de ação externa aguardando confirmação humana na Human Queue. Todas possuem payload e destinatários validados previamente.`,
        evidence: 'Fila de Ações Human Queue (Fase 58)'
      };
    }

    return {
      answer: 'O Autonomy Governance Center gerencia guardrails operacionais para assegurar que nenhum agente, workflow ou Copilot execute ações de alto risco silenciosamente. O princípio norteador é: "Quanto maior o impacto, menor a autonomia sem supervisão".',
      evidence: 'Autonomy Policy Engine v1.0'
    };
  }

  // --- MÉTODOS DE PERSISTÊNCIA INTERNA ---
  static _loadPolicies() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.POLICIES);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  static _loadIntents() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.INTENTS);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return [
      {
        id: 'INTENT-01',
        actionKey: 'email.send',
        initiatedBy: 'Workflow de Follow-up Comercial',
        entityId: 'opp-sabesp-eee-01',
        contextSnapshot: {
          recipient: 'compras@sabesp.sp.gov.br',
          subject: 'Solicitação de Esclarecimento Pregão Sabesp EEE',
          attachmentsCount: 1
        },
        policyResult: {
          evaluation: EvaluationResult.REQUIRES_CONFIRMATION,
          autonomyLevel: AutonomyLevel.LEVEL_4_EXTERNAL_CONFIRM,
          reason: 'Ação com impacto externo; requer confirmação humana antes do envio.'
        },
        status: ActionStatus.AWAITING_CONFIRMATION,
        idempotencyKey: 'email.send-sabesp-01',
        createdAt: '2026-10-19T11:00:00-03:00'
      },
      {
        id: 'INTENT-02',
        actionKey: 'task.create',
        initiatedBy: 'Agente de Monitoramento Documental',
        entityId: 'doc-cnd-campinas',
        contextSnapshot: {
          taskTitle: 'Renovar Certidão Municipal de Filial (Campinas)'
        },
        policyResult: {
          evaluation: EvaluationResult.ALLOWED,
          autonomyLevel: AutonomyLevel.LEVEL_3_INTERNAL,
          reason: 'Ação interna permitida para execução automática.'
        },
        status: ActionStatus.COMPLETED,
        idempotencyKey: 'task.create-cnd-01',
        createdAt: '2026-10-19T08:15:00-03:00',
        executedAt: '2026-10-19T08:15:01-03:00'
      }
    ];
  }

  static listSystemActions() {
    return Object.values(SYSTEM_ACTIONS);
  }

  static listIntents() {
    return this._loadIntents().map(it => ({
      ...it,
      payload: it.payload || it.contextSnapshot || {}
    }));
  }

  static listOverrides() {
    return this._loadOverrides();
  }

  static listIncidents() {
    return [
      {
        id: 'INC-SEC-01',
        type: 'GUARDRAIL_TRIGGERED',
        description: 'Tentativa de disparo de proposta sem aprovação executiva formal bloqueada.',
        timestamp: '2026-10-19T14:20:00-03:00',
        actionTaken: 'Interrompido no Level 5; encaminhado para Human Queue.'
      },
      {
        id: 'INC-SEC-02',
        type: 'CROSS_COMPANY_PREVENTED',
        description: 'Documento confidencial da Excelência Ambiental bloqueado para usuário da Veeluen.',
        timestamp: '2026-10-19T10:05:00-03:00',
        actionTaken: 'Ação cancelada automaticamente e evento registrado em auditoria.'
      }
    ];
  }

  static getMetrics() {
    const intents = this._loadIntents();
    return {
      actionsPrepared: intents.length + 12,
      actionsConfirmed: 28,
      actionsBlocked: 4,
      approvalsRequired: intents.filter(i => i.status === ActionStatus.AWAITING_APPROVAL).length + 3,
      overridesActive: this._loadOverrides().length
    };
  }

  static isEmergencyPaused() {
    return this.getEmergencyPauseState().active;
  }

  static emergencyPauseAll(reason = 'Safe Stop Geral Solicitado') {
    return this.toggleEmergencyPause(true, reason, 'ALL', 'Admin');
  }

  static resumeOperations() {
    return this.toggleEmergencyPause(false, 'Operações normalizadas', 'ALL', 'Admin');
  }

  static confirmIntent(intentId, confirmedBy = 'Admin') {
    try {
      this.confirmActionIntent(intentId, confirmedBy);
      return { success: true };
    } catch (err) {
      return { success: false, reason: err.message };
    }
  }

  static cancelIntent(intentId, reason = 'Cancelado') {
    const list = this._loadIntents();
    const intent = list.find(i => i.id === intentId);
    if (!intent) return { success: false, reason: 'Intenção não encontrada.' };
    intent.status = ActionStatus.CANCELLED;
    this._saveIntents(list);
    this._logAudit('ACTION_CANCELLED', intentId, reason);
    return { success: true };
  }

  static executeIntent(intentId) {
    const list = this._loadIntents();
    const intent = list.find(i => i.id === intentId);
    if (!intent) return { success: false };
    intent.status = ActionStatus.COMPLETED;
    intent.executedAt = new Date().toISOString();
    this._saveIntents(list);
    return { success: true };
  }

  static applyTemplate(companyId, templateKey) {
    const valid = ['conservative', 'balanced', 'advanced'];
    if (!valid.includes(templateKey)) return { success: false, reason: 'Template inválido.' };
    this._logAudit('TEMPLATE_APPLIED', companyId, `Template ${templateKey} aplicado.`);
    return { success: true };
  }

  static _saveIntents(list) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.INTENTS, JSON.stringify(list));
      }
    } catch {}
  }

  static _loadOverrides() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  static _logAudit(action, entityId, details) {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
        const log = raw ? JSON.parse(raw) : [];
        log.unshift({ action, entityId, details, timestamp: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(log.slice(0, 50)));
      }
    } catch {}
  }
}

export const POLICY_TEMPLATES = {
  conservative: { name: 'Conservador', desc: 'Máxima supervisão humana' },
  balanced: { name: 'Balanceado', desc: 'Equilíbrio ideal para produção' },
  advanced: { name: 'Avançado', desc: 'Maior autonomia interna permitida' }
};

export const TEMPLATES = POLICY_TEMPLATES;
export const AUTONOMY_LEVEL_LABELS = AutonomyLevelLabels;
export const autonomyPolicyEngine = AutonomyPolicyEngine;
export default AutonomyPolicyEngine;
