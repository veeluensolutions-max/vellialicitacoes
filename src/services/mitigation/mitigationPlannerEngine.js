/**
 * VELLIA LICITAÇÕES — FASE 67: PRESCRIPTIVE RISK MITIGATION + RECOVERY PLANNER
 * mitigationPlannerEngine.js: Motor Prescritivo de Mitigação, Recuperação e Simulação
 */

import {
  initialMitigationPlans,
  historicalMitigations
} from './mitigationData.js';
import {
  PlanStatus,
  OptionType,
  ExpectedImpact,
  EffortLevel,
  UrgencyLevel,
  OptionViability,
  RecoveryWindowStatus,
  ActionStatus,
  CostSource,
  MitigationEffectiveness
} from './mitigationModels.js';

class MitigationPlannerEngine {
  constructor() {
    this.plans = [...initialMitigationPlans];
    this.history = [...historicalMitigations];
    this.auditLog = [];
  }

  /**
   * 1. Gera ou Consolida Plano de Mitigação
   */
  generateMitigationPlan({
    opportunityId,
    opportunityTitle,
    companyId = 'veeluen',
    riskLevel = 'Crítico (Critical)',
    riskType = 'Risco de Não-Submissão',
    hoursToDeadline = 24,
    criticalBlockers = [],
    pendingApprovalsCount = 0,
    partnerConfirmed = false,
    capacityConflict = false,
    userPermissions = ['mitigation.manage']
  }) {
    // Janela de Recuperação (Recovery Window)
    let rwStatus = RecoveryWindowStatus.OPEN;
    if (hoursToDeadline <= 12) {
      rwStatus = RecoveryWindowStatus.CRITICAL;
    } else if (hoursToDeadline <= 36) {
      rwStatus = RecoveryWindowStatus.NARROW;
    }

    const planId = `RMP-2026-${String(this.plans.length + 1).padStart(3, '0')}`;
    const options = [];

    // Blocker de Parceiro / Subcontratação
    if (!partnerConfirmed) {
      const partnerOption = {
        id: `OPT-${planId}-01`,
        planId,
        title: 'Confirmação Formal e Homologação de Parceiro Técnico',
        description: 'Obter confirmação formal de disponibilidade e proposta técnica com parceiro primário homologado.',
        type: OptionType.PARTNER_ACTION,
        expectedImpact: ExpectedImpact.HIGH,
        effort: EffortLevel.MEDIUM,
        urgency: hoursToDeadline <= 18 ? UrgencyLevel.IMMEDIATE : UrgencyLevel.HIGH,
        dependencies: ['Disponibilidade do Diretor Técnico do Parceiro'],
        unlocks: ['Pricing Gate', 'Capacidade Operacional', 'Atestado Técnico'],
        leverageCount: 3,
        riskReduction: 'Reduz risco de Crítico para Moderado',
        residualRisk: 'Moderado (Moderate)',
        requiresApproval: true,
        estimatedDurationHours: 4,
        viability: 4 <= hoursToDeadline ? OptionViability.VIABLE : OptionViability.UNLIKELY,
        cost: {
          amount: null, // Custo não inventado se não houver cotação formal
          source: CostSource.UNKNOWN,
          note: 'Custo de mobilização padrão a ser confirmado.'
        },
        crossImpact: {
          hasImpact: capacityConflict,
          details: capacityConflict ? 'Possível sobreposição com equipe alocada em outro contrato ativo.' : 'Sem impacto cruzado detectado.'
        },
        fallbackOptionId: `OPT-${planId}-FB`,
        status: 'SUGGESTED'
      };
      options.push(partnerOption);

      // Fallback: Parceiro de contingência
      options.push({
        id: `OPT-${planId}-FB`,
        planId,
        title: 'Acionar Parceiro de Contingência Homologado (Plano B)',
        description: 'Substituição rápida por segundo parceiro cadastrado com capacidade técnica equivalente.',
        type: OptionType.ALTERNATIVE_STRATEGY,
        expectedImpact: ExpectedImpact.HIGH,
        effort: EffortLevel.HIGH,
        urgency: UrgencyLevel.HIGH,
        dependencies: ['Rejeição ou ausência de resposta do parceiro primário'],
        unlocks: ['Pricing Gate', 'Atestado Técnico'],
        leverageCount: 2,
        riskReduction: 'Reduz risco de Crítico para Alto',
        residualRisk: 'Alto (High)',
        requiresApproval: true,
        estimatedDurationHours: 8,
        viability: 8 <= hoursToDeadline ? OptionViability.VIABLE : OptionViability.UNLIKELY,
        cost: {
          amount: 12500,
          source: CostSource.QUOTATION,
          note: 'Cotação de prontidão emergencial.'
        },
        crossImpact: {
          hasImpact: false,
          details: 'Sem impacto cruzado em outros contratos.'
        },
        fallbackOptionId: null,
        status: 'FALLBACK'
      });
    }

    // Blocker de Documentação Crítica
    if (criticalBlockers.length > 0) {
      criticalBlockers.forEach((blk, idx) => {
        const isExpeditedCat = blk.toLowerCase().includes('cat') || blk.toLowerCase().includes('acervo');
        const durationHours = isExpeditedCat ? 48 : 2;

        options.push({
          id: `OPT-${planId}-DOC-${idx + 1}`,
          planId,
          title: `Tratamento Documental: ${blk}`,
          description: isExpeditedCat 
            ? 'Tentativa de expedição extraordinária de certidão de acervo técnico.' 
            : 'Substituição por declaração alternativa homologada ou emissão de CPEN.',
          type: OptionType.DOCUMENT_RESOLUTION,
          expectedImpact: ExpectedImpact.HIGH,
          effort: isExpeditedCat ? EffortLevel.HIGH : EffortLevel.LOW,
          urgency: UrgencyLevel.IMMEDIATE,
          dependencies: ['Disponibilidade do emissor do órgão competente'],
          unlocks: ['Habilitação Jurídica/Técnica'],
          leverageCount: 1,
          riskReduction: 'Remove blocker documental impeditivo',
          residualRisk: isExpeditedCat && durationHours > hoursToDeadline ? 'Crítico (Critical)' : 'Baixo (Low)',
          requiresApproval: false,
          estimatedDurationHours: durationHours,
          viability: durationHours <= hoursToDeadline ? OptionViability.VIABLE : OptionViability.UNLIKELY,
          cost: {
            amount: isExpeditedCat ? 350 : 0,
            source: CostSource.HISTORICAL,
            note: isExpeditedCat ? 'Taxa padrão de protocolo administrativo.' : 'Gratuito via internet.'
          },
          crossImpact: {
            hasImpact: false,
            details: 'Nenhum impacto em outras oportunidades.'
          },
          fallbackOptionId: null,
          status: durationHours <= hoursToDeadline ? 'SUGGESTED' : 'UNFEASIBLE_TIME'
        });
      });
    }

    // Blocker de Aprovações Pendentes
    if (pendingApprovalsCount > 0) {
      options.push({
        id: `OPT-${planId}-APP`,
        planId,
        title: 'Escalação Emergencial de Alçada de Aprovação',
        description: 'Notificar alçada superior conforme política de governança de aprovações da Fase 58.',
        type: OptionType.APPROVAL_ESCALATION,
        expectedImpact: ExpectedImpact.HIGH,
        effort: EffortLevel.LOW,
        urgency: UrgencyLevel.IMMEDIATE,
        dependencies: ['Disponibilidade do Diretor de Operações'],
        unlocks: ['Liberação para Submissão'],
        leverageCount: 2,
        riskReduction: 'Reduz risco de atraso de aprovação',
        residualRisk: 'Baixo (Low)',
        requiresApproval: true,
        estimatedDurationHours: 2,
        viability: 2 <= hoursToDeadline ? OptionViability.VIABLE : OptionViability.UNLIKELY,
        cost: {
          amount: 0,
          source: CostSource.MANUAL_ASSUMPTION,
          note: 'Sem custo financeiro adicional.'
        },
        crossImpact: {
          hasImpact: false,
          details: 'Sem impacto cruzado.'
        },
        fallbackOptionId: null,
        status: 'SUGGESTED'
      });
    }

    // Opção de Retirada Estratégica (Strategic Withdrawal)
    options.push({
      id: `OPT-${planId}-WITHDRAW`,
      planId,
      title: 'Avaliação de Retirada Estratégica (NO-GO Tardio Consciente)',
      description: 'Reavaliação deliberada pelo comitê para retirada formal, preservando histórico e capacidade da equipe.',
      type: OptionType.WITHDRAWAL_REVIEW,
      expectedImpact: ExpectedImpact.MEDIUM,
      effort: EffortLevel.LOW,
      urgency: UrgencyLevel.HIGH,
      dependencies: ['Decisão executiva formal da Diretoria'],
      unlocks: ['Deslocamento imediato de recursos para oportunidades prioritárias'],
      leverageCount: 1,
      riskReduction: 'Elimina risco de desclassificação e penalidades',
      residualRisk: 'Baixo (Low)',
      requiresApproval: true,
      estimatedDurationHours: 1,
      viability: OptionViability.VIABLE,
      cost: {
        amount: 0,
        source: CostSource.MANUAL_ASSUMPTION,
        note: 'Sem custo de penalidade editalícia.'
      },
      crossImpact: {
        hasImpact: false,
        details: 'Permite foco total em oportunidades com maior prontidão.'
      },
      fallbackOptionId: null,
      status: 'STRATEGIC_ALTERNATIVE'
    });

    // Construção do Plano com Sequência Operacional
    const viableOptions = options.filter(o => o.viability === OptionViability.VIABLE && o.status !== 'FALLBACK');
    const fallbackOptions = options.filter(o => o.status === 'FALLBACK');

    const newPlan = {
      id: planId,
      companyId,
      relatedEntityType: 'OPPORTUNITY',
      relatedEntityId: opportunityId,
      opportunityTitle,
      riskType,
      riskLevel,
      status: PlanStatus.DRAFT,
      createdAt: new Date().toISOString(),
      createdBy: 'MitigationPlannerEngine',
      validUntil: new Date(Date.now() + hoursToDeadline * 3600 * 1000).toISOString(),
      sourceRiskAssessmentId: `PRA-SRC-${opportunityId}`,
      version: 1,
      recoveryWindow: {
        status: rwStatus,
        hoursRemaining: hoursToDeadline,
        reason: `${hoursToDeadline}h restantes até a submissão com ${criticalBlockers.length} blocker(s) ativos.`,
        earlyInterventionInsight: hoursToDeadline >= 48 
          ? 'Janela ampla permite soluções estruturais sem custos emergenciais.' 
          : 'Janela restrita exige atuação rápida no caminho crítico.'
      },
      rootCause: {
        primaryDriver: criticalBlockers.length > 0 ? criticalBlockers[0] : 'Incerteza de processo',
        isConfirmed: false,
        note: 'Identificado como gargalo inicial pelo motor de regras.'
      },
      options,
      chosenPlanSequence: {
        now: viableOptions.slice(0, 1).map((opt, i) => ({
          id: `ACT-${planId}-0${i + 1}`,
          mitigationPlanId: planId,
          title: opt.title,
          owner: 'Coordenação Operacional',
          dueDate: `Em ${opt.estimatedDurationHours}h`,
          dependency: 'Nenhuma',
          status: ActionStatus.PENDING,
          actionType: opt.type,
          linkedEntity: opt.title
        })),
        next: viableOptions.slice(1, 2).map((opt, i) => ({
          id: `ACT-${planId}-0${i + 2}`,
          mitigationPlanId: planId,
          title: opt.title,
          owner: 'Especialista em Licitações',
          dueDate: `Em ${opt.estimatedDurationHours + 2}h`,
          dependency: `ACT-${planId}-01`,
          status: ActionStatus.PENDING,
          actionType: opt.type,
          linkedEntity: opt.title
        })),
        parallel: [
          {
            id: `ACT-${planId}-PAR-1`,
            mitigationPlanId: planId,
            title: 'Validar integridade de arquivos complementares no cofre documental',
            owner: 'Analista de Documentos',
            dueDate: 'Paralelo',
            dependency: 'Nenhuma',
            status: ActionStatus.IN_PROGRESS,
            actionType: OptionType.DOCUMENT_RESOLUTION,
            linkedEntity: 'Cofre Documental'
          }
        ],
        fallback: fallbackOptions.map((fb, i) => ({
          id: `ACT-FB-${planId}-0${i + 1}`,
          mitigationPlanId: planId,
          title: fb.title,
          owner: 'Diretor de Operações',
          dueDate: 'Se ação primária falhar',
          dependency: 'Falha da ação primária',
          status: ActionStatus.PENDING,
          actionType: fb.type,
          linkedEntity: fb.title
        }))
      }
    };

    this.plans.push(newPlan);
    this._audit('PLAN_CREATED', `Plano ${planId} gerado para oportunidade ${opportunityId}.`);
    return newPlan;
  }

  /**
   * 2. Simula Mitigação em Sandbox (Scenario Lab / What-If)
   */
  simulateMitigation(plan, selectedOptionId) {
    const opt = plan.options.find(o => o.id === selectedOptionId);
    if (!opt) {
      return {
        error: 'Opção não encontrada',
        projectedRiskLevel: plan.riskLevel,
        readinessDelta: '0%',
        criticalPathImpact: 'Inalterado'
      };
    }

    let projectedRisk = 'Moderado (Moderate)';
    let readinessDelta = '+25%';
    let criticalPathImpact = `Desbloqueia ${opt.leverageCount} etapa(s): ${opt.unlocks.join(', ')}`;

    if (opt.type === OptionType.WITHDRAWAL_REVIEW) {
      projectedRisk = 'Baixo (Low)';
      readinessDelta = 'N/A (Retirada Deliberada)';
      criticalPathImpact = 'Processo encerrado de forma controlada sem penalidade';
    } else if (opt.viability === OptionViability.UNLIKELY) {
      projectedRisk = plan.riskLevel;
      readinessDelta = '+0%';
      criticalPathImpact = 'Inviável no prazo remanescente — risco permanece crítico';
    }

    return {
      planId: plan.id,
      simulatedOption: opt.title,
      projectedRiskLevel: projectedRisk,
      readinessDelta,
      criticalPathImpact,
      residualRisk: opt.residualRisk,
      tradeOffs: {
        cost: opt.cost.amount !== null ? `R$ ${opt.cost.amount.toLocaleString('pt-BR')}` : 'Custo não identificado previamente',
        effort: opt.effort,
        crossImpact: opt.crossImpact.hasImpact ? opt.crossImpact.details : 'Sem impacto cruzado em outros projetos'
      },
      warning: 'Simulação preditiva baseada em regras de processo; não representa garantia de resultado.'
    };
  }

  /**
   * 3. Registra Conclusão de Ação e Recalcula Trajetória
   */
  recordActionCompletion(planId, actionId, completedBy = 'Operador') {
    const plan = this.plans.find(p => p.id === planId);
    if (!plan) throw new Error(`Plano ${planId} não encontrado.`);

    let actionFound = false;
    const allActions = [
      ...plan.chosenPlanSequence.now,
      ...plan.chosenPlanSequence.next,
      ...plan.chosenPlanSequence.parallel,
      ...plan.chosenPlanSequence.fallback
    ];

    allActions.forEach(act => {
      if (act.id === actionId) {
        act.status = ActionStatus.COMPLETED;
        act.completedBy = completedBy;
        act.completedAt = new Date().toISOString();
        actionFound = true;
      }
    });

    if (!actionFound) throw new Error(`Ação ${actionId} não encontrada no plano ${planId}.`);

    // Atualização de Risco após resolução
    const previousRisk = plan.riskLevel;
    if (plan.riskLevel.includes('Crítico') || plan.riskLevel.includes('Critical')) {
      plan.riskLevel = 'Moderado (Moderate)';
    } else if (plan.riskLevel.includes('Alto') || plan.riskLevel.includes('High')) {
      plan.riskLevel = 'Baixo (Low)';
    }

    this._audit('ACTION_COMPLETED', `Ação ${actionId} concluída. Risco recalculado de ${previousRisk} para ${plan.riskLevel}.`);

    return {
      plan,
      actionId,
      previousRisk,
      newRiskLevel: plan.riskLevel,
      trajectory: 'Melhorando (Improving)'
    };
  }

  /**
   * 4. Versionamento de Plano por Mudança Material de Contexto
   */
  versionPlanOnContextChange(planId, contextReason = 'Mudança material de prazo ou parceiro') {
    const currentPlan = this.plans.find(p => p.id === planId);
    if (!currentPlan) throw new Error(`Plano ${planId} não encontrado.`);

    // Marca o anterior como Superseded
    currentPlan.status = PlanStatus.EXPIRED;

    // Cria nova versão preservando o histórico
    const newVersionPlan = JSON.parse(JSON.stringify(currentPlan));
    newVersionPlan.version = currentPlan.version + 1;
    newVersionPlan.status = PlanStatus.UNDER_REVIEW;
    newVersionPlan.createdAt = new Date().toISOString();
    newVersionPlan.contextChangeNote = contextReason;

    this.plans.push(newVersionPlan);
    this._audit('PLAN_SUPERSEDED', `Plano ${planId} v${currentPlan.version} substituído pela v${newVersionPlan.version} devido a: ${contextReason}.`);

    return newVersionPlan;
  }

  /**
   * 5. Aprovação de Ação Material com Verificação Estrita de Permissão
   */
  approveMaterialAction(planId, actionId, user) {
    if (!user || !user.permissions || (!user.permissions.includes('mitigation.approve') && user.role !== 'ADMIN')) {
      throw new Error('Acesso negado: Usuário sem permissão "mitigation.approve" para autorizar ação material.');
    }

    const plan = this.plans.find(p => p.id === planId);
    if (!plan) throw new Error(`Plano ${planId} não encontrado.`);

    this._audit('MATERIAL_ACTION_APPROVED', `Ação ${actionId} no plano ${planId} aprovada por ${user.name || 'Gestor'}.`);

    return {
      success: true,
      planId,
      actionId,
      approvedBy: user.name || 'Gestor',
      status: 'Aprovada formalmente'
    };
  }

  /**
   * 6. Acionamento de Fallback com Controle Humano Obrigatório
   */
  triggerFallbackOption(planId, fallbackActionId, confirmedByUser) {
    if (!confirmedByUser) {
      throw new Error('Guardrail Ativo: Ações de contingência/fallback exigem confirmação humana expressa e não podem ser disparadas de forma autônoma.');
    }

    const plan = this.plans.find(p => p.id === planId);
    if (!plan) throw new Error(`Plano ${planId} não encontrado.`);

    const fbAction = plan.chosenPlanSequence.fallback.find(f => f.id === fallbackActionId);
    if (!fbAction) throw new Error(`Ação de fallback ${fallbackActionId} não encontrada.`);

    fbAction.status = ActionStatus.IN_PROGRESS;
    fbAction.triggeredBy = confirmedByUser;
    fbAction.triggeredAt = new Date().toISOString();

    this._audit('FALLBACK_ACTIVATED', `Fallback ${fallbackActionId} acionado por ${confirmedByUser}.`);

    return {
      success: true,
      planId,
      fallbackAction: fbAction
    };
  }

  /**
   * 7. Registro de Efetividade Pós-Evento (Separado de Win/Loss)
   */
  recordPostEventReview({
    planId,
    opportunityId,
    effectiveness = MitigationEffectiveness.EFFECTIVE,
    restoredReadiness = true,
    submissionSuccessful = true,
    winLossOutcome = 'WON',
    notes = ''
  }) {
    const review = {
      id: `HIST-MIT-${String(this.history.length + 1).padStart(2, '0')}`,
      planId,
      opportunityId,
      effectiveness,
      restoredReadiness,
      submissionSuccessful,
      winLossOutcome,
      notes,
      reviewedAt: new Date().toISOString()
    };

    this.history.push(review);
    this._audit('POST_EVENT_REVIEWED', `Revisão pós-evento gravada para ${opportunityId}. Efetividade: ${effectiveness} (Win/Loss: ${winLossOutcome}).`);
    return review;
  }

  /**
   * 8. Resposta Estruturada para o Copilot (Item 200 a 203)
   */
  answerCopilotQuery(opportunityId, query = '') {
    const plan = this.plans.find(p => p.relatedEntityId === opportunityId) || this.plans[0];
    const q = query.toLowerCase();

    const topViable = plan.options.find(o => o.viability === OptionViability.VIABLE) || plan.options[0];
    const fallback = plan.options.find(o => o.status === 'FALLBACK') || { title: 'Revisão estratégica da proposta' };

    let specificAnswer = '';
    if (q.includes('como reduzimos') || q.includes('qual ação tem maior impacto') || q.includes('qual acao tem maior impacto')) {
      specificAnswer = `A ação de maior alavancagem é "${topViable.title}", pois destrava ${topViable.unlocks.join(', ')} e reduz o risco residual para ${topViable.residualRisk}.`;
    } else if (q.includes('ainda dá tempo') || q.includes('ainda da tempo') || q.includes('recuperar')) {
      specificAnswer = `A janela de recuperação está classificada como ${plan.recoveryWindow.status} com ${plan.recoveryWindow.hoursRemaining}h restantes. Há tempo para intervenção se executada nas próximas horas.`;
    } else if (q.includes('plano b') || q.includes('fallback')) {
      specificAnswer = `O plano de contingência prevê: "${fallback.title}". Esta ação requer confirmação humana prévia.`;
    } else {
      specificAnswer = `Identificamos ${plan.options.length} alternativas no plano de recuperação. Ação recomendada: "${topViable.title}".`;
    }

    return {
      riskLevel: plan.riskLevel,
      recoveryWindow: `${plan.recoveryWindow.status} (${plan.recoveryWindow.hoursRemaining}h)`,
      topOptions: [topViable.title, fallback.title],
      tradeOffs: topViable.crossImpact.hasImpact ? topViable.crossImpact.details : 'Sem conflito de capacidade identificado.',
      suggestedNextStep: topViable.title,
      text: `${specificAnswer} Guardrail: A execução de contatos externos e aprovação de custos depende de decisão humana formal.`
    };
  }

  _audit(action, details) {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action,
      details
    });
  }
}

export const mitigationPlannerEngine = new MitigationPlannerEngine();
export default mitigationPlannerEngine;
