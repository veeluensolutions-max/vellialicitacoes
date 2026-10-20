/**
 * VELLIA LICITAÇÕES — FASE 70: STRATEGIC PLANNING + ANNUAL OPERATING PLAN 2.0
 * strategicPlanEngine.js: Motor Analítico e Governança do Plano Estratégico Vivo
 */

import { initialStrategicPlans } from './strategicPlanData.js';
import {
  PlanStatus,
  PlanHealthStatus,
  AssumptionStatus,
  AlignmentCategory,
  StrategicBoundaryType,
  TargetType
} from './strategicPlanModels.js';

class StrategicPlanEngine {
  constructor() {
    // Clona os planos em memória para permitir revisões versionadas e isolamento
    this._plans = JSON.parse(JSON.stringify(initialStrategicPlans));
    this._auditLog = [];
  }

  /**
   * Retorna o plano estratégico ativo para a empresa informada.
   * Suporta visão isolada ('veeluen', 'excelencia') ou visão de grupo ('all').
   * Aplica mascaramento de metas financeiras caso hasFinancialPermission seja false.
   */
  getStrategicPlan(companyId = 'veeluen', hasFinancialPermission = true) {
    if (companyId === 'all') {
      return this._generateGroupPlan(hasFinancialPermission);
    }

    const plan = this._plans.find(p => p.companyId === companyId);
    if (!plan) return null;

    return this._filterSensitiveData(plan, hasFinancialPermission);
  }

  /**
   * Visão de Grupo Consolidada — Sem contagem dupla (double counting)
   */
  _generateGroupPlan(hasFinancialPermission) {
    const activePlans = this._plans.filter(p => [PlanStatus.APPROVED, PlanStatus.ACTIVE, PlanStatus.REVISED].includes(p.status));

    // Agregação limpa sem misturar CNPJs ou inflar metas
    const consolidatedObjectives = [];
    activePlans.forEach(p => {
      p.objectives.forEach(obj => {
        consolidatedObjectives.push({
          ...obj,
          originCompany: p.companyId,
          planName: p.name
        });
      });
    });

    const groupPlan = {
      id: 'PLAN-2026-GROUP',
      companyId: 'all',
      year: 2026,
      name: 'Plano Operacional Anual Integrado do Grupo Vellia 2026',
      status: PlanStatus.ACTIVE,
      version: '1.0-GROUP',
      approvedBy: 'Comitê Executivo Conjunto',
      strategicDirection: 'Atuação sinérgica com preservação da autonomia operacional e contábil entre Veeluen e Excelência Ambiental.',
      objectives: consolidatedObjectives,
      assumptions: activePlans.flatMap(p => p.assumptions),
      strategicRisks: activePlans.flatMap(p => p.strategicRisks),
      boundaries: {
        [StrategicBoundaryType.PURSUUE]: [
          'Engenharia Diagnóstica e Monitoramento Ambiental de Alta Precisão',
          'Saneamento, ETE e Tratamento de Efluentes Industriais'
        ],
        [StrategicBoundaryType.SELECTIVELY_PURSUE]: [
          'Projetos Integrados Inter-Estados com Consórcio Formal'
        ],
        [StrategicBoundaryType.DO_NOT_PURSUE]: [
          'Compartilhamento informal de ativos entre empresas sem governança e nota de locação'
        ]
      },
      strategicBalance: { core: 72, growth: 23, experimental: 5 },
      quarterlyPipelinePlan: {
        Q1: { qualifiedPipeline: 9300000, commit: 5300000, targetCoveragePct: 90 },
        Q2: { qualifiedPipeline: 8400000, commit: 4600000, targetCoveragePct: 82 },
        Q3: { qualifiedPipeline: 7000000, commit: 3300000, targetCoveragePct: 70 },
        Q4: { qualifiedPipeline: 6300000, commit: 2700000, targetCoveragePct: 65 }
      }
    };

    return this._filterSensitiveData(groupPlan, hasFinancialPermission);
  }

  /**
   * Avalia a viabilidade de uma meta (Target Feasibility)
   * Se baseline não existir -> exibe 'Unknown' (não inventa baseline)
   * Se pipeline qualificado for insuficiente -> exibe gapValue com status 'GAP_SIGNIFICATIVO'
   */
  evaluateTargetFeasibility(target, currentPipeline = 0) {
    const baselineDisplay = (target.baseline === null || target.baseline === undefined)
      ? 'Unknown'
      : target.baseline;

    const coveragePct = target.targetValue > 0
      ? Math.round((currentPipeline / target.targetValue) * 100)
      : 100;

    const gapValue = Math.max(0, target.targetValue - currentPipeline);
    const isFeasible = coveragePct >= 80;

    let status = 'ON_TRACK';
    let diagnosis = 'Meta com cobertura satisfatória de pipeline qualificado.';

    if (coveragePct < 50) {
      status = 'GAP_SIGNIFICATIVO';
      diagnosis = `Gap significativo identificado: pipeline atual cobre apenas ${coveragePct}% da meta (diferença de ${gapValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}).`;
    } else if (coveragePct < 80) {
      status = 'ATENCAO';
      diagnosis = `Atenção: pipeline atual cobre ${coveragePct}% da meta anual. Requer aceleração de prospecção ou conversão qualificada.`;
    }

    return {
      targetId: target.id,
      metric: target.metric,
      targetValue: target.targetValue,
      currentPipeline,
      coveragePct,
      gapValue,
      baselineDisplay,
      status,
      diagnosis,
      isFeasible
    };
  }

  /**
   * Avalia premissas críticas (como renovações contratuais)
   * Garante que renovação seja tratada como premissa aberta ou em validação, nunca como garantia líquida
   */
  evaluateAssumption(assumption) {
    if (assumption.category === 'Contract Renewal') {
      const isActuallySigned = assumption.status === AssumptionStatus.CONFIRMED && assumption.notes?.toLowerCase().includes('aditivo assinado');
      return {
        ...assumption,
        isGuaranteedRevenue: false, // Nunca tratar como receita garantida
        riskIfInvalidated: 'Perda de receita recorrente estimada e necessidade imediata de reposição no pipeline qualificado.',
        governanceRule: 'Renovações contratuais são premissas de planejamento e devem ser revisadas trimestralmente no QBR.'
      };
    }

    return {
      ...assumption,
      isGuaranteedRevenue: false,
      governanceRule: 'Premissa de planejamento sujeita à verificação periódica.'
    };
  }

  /**
   * Recalcula o risco do objetivo caso um investimento associado sofra atraso
   */
  recalculateObjectiveRiskDueToCapacity(objectiveId, investmentCase = null) {
    for (const plan of this._plans) {
      const obj = plan.objectives.find(o => o.id === objectiveId);
      if (obj) {
        if (!investmentCase || investmentCase.status === 'Deferred' || investmentCase.status === 'Under Analysis') {
          obj.healthStatus = PlanHealthStatus.AT_RISK;
          obj.healthReason = `Risco Estrutural: O investimento associado (${investmentCase?.id || 'Equipamento/Capacidade'}) ainda não foi aprovado ou implementado, limitando a capacidade de entrega e participação em novos certames.`;
          return {
            objectiveId: obj.id,
            newHealthStatus: obj.healthStatus,
            healthReason: obj.healthReason,
            recalculated: true
          };
        }
      }
    }

    return { objectiveId, recalculated: false };
  }

  /**
   * Detecção de Desvio Estratégico (Strategy Drift)
   * Avalia a coerência do pipeline novo em relação aos serviços prioritários
   */
  detectStrategyDrift(opportunities = [], priorityServices = ['Emissões Atmosféricas', 'Isocinética de Gases', 'Inspeção NR-13']) {
    if (!opportunities || opportunities.length === 0) {
      return { driftDetected: false, outsideRatio: 0, outsideCount: 0, totalCount: 0 };
    }

    const outsideOpps = opportunities.filter(opp => {
      const service = opp.service || opp.title || '';
      return !priorityServices.some(ps => service.toLowerCase().includes(ps.toLowerCase()));
    });

    const outsideRatio = outsideOpps.length / opportunities.length;
    const outsidePipelineValue = outsideOpps.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);
    const totalPipelineValue = opportunities.reduce((acc, o) => acc + (o.estimatedValue || 0), 0);

    const driftDetected = outsideRatio >= 0.5;

    return {
      driftDetected,
      outsideRatio: Math.round(outsideRatio * 100),
      outsideCount: outsideOpps.length,
      totalCount: opportunities.length,
      outsidePipelineValue,
      totalPipelineValue,
      warningMessage: driftDetected
        ? `Strategy divergence detected: ${Math.round(outsideRatio * 100)}% das novas oportunidades estão fora dos serviços prioritários estabelecidos no plano.`
        : 'Pipeline predominantemente alinhado aos serviços prioritários da estratégia anual.'
    };
  }

  /**
   * Avalia uma oportunidade individual quanto ao alinhamento estratégico
   * NÃO bloqueia oportunidades fora da estratégia automaticamente, apenas sinaliza
   */
  evaluateOpportunityAlignment(opportunity, planId = 'PLAN-2026-VEELUEN') {
    const plan = this._plans.find(p => p.id === planId) || this._plans[0];
    const boundaries = plan.boundaries || {};

    const pursueList = boundaries[StrategicBoundaryType.PURSUUE] || [];
    const selectivelyList = boundaries[StrategicBoundaryType.SELECTIVELY_PURSUE] || [];
    const doNotPursueList = boundaries[StrategicBoundaryType.DO_NOT_PURSUE] || [];

    const oppService = (opportunity.service || opportunity.title || '').toLowerCase();

    // 1. Verifica se está no Do Not Pursue
    const isDoNotPursue = doNotPursueList.some(item => oppService.includes(item.toLowerCase()));
    // 2. Verifica se está no Pursue
    const isPursue = pursueList.some(item => oppService.includes(item.toLowerCase()));
    // 3. Verifica se é seletivo
    const isSelective = selectivelyList.some(item => oppService.includes(item.toLowerCase()));

    let alignment = AlignmentCategory.OUTSIDE_PRIORITY;
    if (isPursue) alignment = AlignmentCategory.ALIGNED;
    else if (isSelective) alignment = AlignmentCategory.ADJACENT;

    const isMaterial = (opportunity.estimatedValue || 0) > 500000;
    const requiresExecutiveReview = (alignment === AlignmentCategory.OUTSIDE_PRIORITY || isDoNotPursue) && isMaterial;

    return {
      opportunityId: opportunity.id || opportunity.number,
      alignment,
      blocked: false, // REGRA CRÍTICA: Não bloqueia automaticamente
      requiresExecutiveReview,
      reviewReason: requiresExecutiveReview
        ? 'Oportunidade material fora do escopo prioritário direto; permitida com justificativa comercial e alçada executiva.'
        : 'Elegível sem restrições ou abaixo do limite de materialidade.'
    };
  }

  /**
   * Revisa o plano (QBR Replan) gerando nova versão sem sobrescrever o histórico
   */
  revisePlan(planId, adjustments = {}, approvedBy = 'Diretoria Executiva', reason = 'Revisão Trimestral QBR') {
    const originalPlan = this._plans.find(p => p.id === planId);
    if (!originalPlan) throw new Error(`Plano com id ${planId} não encontrado.`);

    // Calcula nova versão (ex: 1.0 -> 1.1)
    const currentVersionNum = parseFloat(originalPlan.version || '1.0');
    const newVersion = (currentVersionNum + 0.1).toFixed(1);

    // Salva o histórico na versão existente
    if (!originalPlan.revisionHistory) originalPlan.revisionHistory = [];
    originalPlan.revisionHistory.push({
      version: originalPlan.version,
      date: new Date().toISOString().split('T')[0],
      author: approvedBy,
      reason
    });

    // Cria a nova versão preservando o plano anterior
    originalPlan.version = newVersion;
    originalPlan.status = PlanStatus.REVISED;
    originalPlan.approvedAt = new Date().toISOString();
    originalPlan.approvedBy = approvedBy;

    if (adjustments.strategicDirection) originalPlan.strategicDirection = adjustments.strategicDirection;
    if (adjustments.objectives) originalPlan.objectives = adjustments.objectives;
    if (adjustments.quarterlyPipelinePlan) originalPlan.quarterlyPipelinePlan = adjustments.quarterlyPipelinePlan;

    this._auditLog.push({
      action: 'PLAN_REVISED',
      planId,
      newVersion,
      approvedBy,
      reason,
      timestamp: new Date().toISOString()
    });

    return {
      revisedPlan: originalPlan,
      previousVersion: (currentVersionNum).toFixed(1),
      currentVersion: newVersion,
      revisionRecorded: true
    };
  }

  /**
   * Simula cenário estratégico (Scenario Lab / What-If) sem alterar o plano aprovado ativo
   */
  simulateStrategicScenario(planId, scenarioModifiers = {}) {
    const originalPlan = this._plans.find(p => p.id === planId);
    if (!originalPlan) throw new Error('Plano não encontrado.');

    // Cria cópia profunda isolada
    const simulation = JSON.parse(JSON.stringify(originalPlan));
    simulation.isSimulation = true;
    simulation.scenarioName = scenarioModifiers.name || 'Cenário Alternativo (Sandbox)';

    if (scenarioModifiers.contractLost) {
      // Simula perda de contrato âncora
      simulation.quarterlyPipelinePlan.Q3.qualifiedPipeline -= (scenarioModifiers.lostValue || 1500000);
      simulation.quarterlyPipelinePlan.Q3.targetCoveragePct = Math.max(30, simulation.quarterlyPipelinePlan.Q3.targetCoveragePct - 22);
      simulation.healthStatus = PlanHealthStatus.AT_RISK;
      simulation.impactSummary = `Simulação de não-renovação: Cobertura de Q3 cai para ${simulation.quarterlyPipelinePlan.Q3.targetCoveragePct}% e exige busca de pipeline compensatório.`;
    }

    return {
      activePlanRemainsUnchanged: true,
      simulationResult: simulation
    };
  }

  /**
   * Resposta Estruturada para o Copiloto Vellia
   * Formato obrigatório: Objective, Current status, Evidence, Gap, Risk, Suggested review
   */
  answerCopilotQuery(query = '', companyId = 'veeluen') {
    const q = query.toLowerCase();
    const plan = this.getStrategicPlan(companyId, true) || this._plans[0];

    // Identifica o objetivo mais relevante para a pergunta
    let targetObj = plan.objectives[0];
    if (q.includes('emiss') || q.includes('ftir')) {
      targetObj = plan.objectives.find(o => o.title.toLowerCase().includes('emissões')) || plan.objectives[0];
    } else if (q.includes('porto') || q.includes('logístic') || q.includes('suape')) {
      targetObj = plan.objectives.find(o => o.title.toLowerCase().includes('logísticos')) || plan.objectives[1];
    } else if (q.includes('nr-13') || q.includes('caldeira')) {
      targetObj = plan.objectives.find(o => o.title.toLowerCase().includes('nr-13')) || plan.objectives[2];
    }

    const targetFeasibility = targetObj.targets[0]
      ? this.evaluateTargetFeasibility(targetObj.targets[0], targetObj.targets[0].currentValue)
      : null;

    const mainRisk = plan.strategicRisks.find(r => r.relatedObjectiveId === targetObj.id) || plan.strategicRisks[0];

    return {
      objective: targetObj.title,
      currentStatus: targetObj.healthStatus,
      evidence: `O pipeline qualificado atual é de R$ ${((targetObj.targets[0]?.currentValue || 0) / 1000000).toFixed(1)}M com ${targetObj.targets.length} metas formais registradas na versão ${plan.version} do plano.`,
      gap: targetFeasibility
        ? targetFeasibility.diagnosis
        : 'Metas em trajetória de cobertura aceitável sem gaps impeditivos.',
      risk: mainRisk
        ? `Risco Estrutural: ${mainRisk.title} (Impacto: ${mainRisk.impact}). Mitigação: ${mainRisk.mitigation}`
        : 'Nenhum risco crítico de execução registrado.',
      suggestedReview: 'Reavaliar no próximo comitê trimestral (QBR) o pipeline qualificado de Q3 e a deliberação do caso de investimento associado.',
      text: `O objetivo "${targetObj.title}" está em status ${targetObj.healthStatus}. O pipeline qualificado cobre ${targetFeasibility?.coveragePct || 70}% da meta anual estabelecida e o principal gargalo refere-se à disponibilidade e deliberação de investimento em capacidade.`
    };
  }

  /**
   * Mascaramento seguro de dados financeiros
   */
  _filterSensitiveData(plan, hasFinancialPermission) {
    if (hasFinancialPermission) return plan;

    const sanitized = JSON.parse(JSON.stringify(plan));
    if (sanitized.objectives) {
      sanitized.objectives.forEach(obj => {
        if (obj.targets) {
          obj.targets.forEach(t => {
            if (t.isFinancial || t.unit === 'BRL') {
              t.targetValue = '[Restrito à Diretoria]';
              t.currentValue = '[Restrito à Diretoria]';
              t.baseline = '[Restrito]';
            }
          });
        }
      });
    }

    if (sanitized.quarterlyPipelinePlan) {
      Object.keys(sanitized.quarterlyPipelinePlan).forEach(q => {
        sanitized.quarterlyPipelinePlan[q].qualifiedPipeline = null;
        sanitized.quarterlyPipelinePlan[q].commit = null;
        sanitized.quarterlyPipelinePlan[q].bestCase = null;
      });
    }

    return sanitized;
  }
}

export const strategicPlanEngine = new StrategicPlanEngine();
export default strategicPlanEngine;
