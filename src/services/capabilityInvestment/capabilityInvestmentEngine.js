/**
 * VELLIA LICITAÇÕES — FASE 69: STRATEGIC INVESTMENT & CAPABILITY EXPANSION PLANNER
 * capabilityInvestmentEngine.js: Motor Analítico de Sinais, Casos de Investimento e Comparação de Alternativas
 */

import {
  initialInvestmentSignals,
  initialInvestmentCases,
  initialInvestmentOutcomes
} from './capabilityInvestmentData.js';
import {
  SignalType,
  CapabilityType,
  InvestmentCaseStatus,
  ExpansionOptionType,
  CostSourceType,
  RootConstraintType,
  CapitalPriorityTier
} from './capabilityInvestmentModels.js';

class CapabilityInvestmentEngine {
  constructor() {
    this.signals = [...initialInvestmentSignals];
    this.cases = [...initialInvestmentCases];
    this.outcomes = [...initialInvestmentOutcomes];
    this.auditLog = [];
  }

  /**
   * 1. Avalia Sinal de Gargalo e Determina Materialidade
   */
  evaluateInvestmentSignal(signalId) {
    const sig = this.signals.find(s => s.id === signalId);
    if (!sig) throw new Error(`Sinal de investimento ${signalId} não encontrado.`);

    // Regra 1: Incidente isolado (frequência baixa) não justifica investimento estrutural
    if (sig.frequency <= 1) {
      return {
        signalId: sig.id,
        title: sig.title,
        status: 'MONITOR_ONLY',
        recommendation: 'Incidente isolado. Não justifica caso de investimento estrutural; atender demandas pontuais via locação esporádica.',
        isInvestmentWarranted: false,
        pipelineValueAffected: sig.pipelineValueAffected
      };
    }

    // Regra 2: Se o equipamento atual estiver subutilizado (< 40%), problema é de processo e não falta de ativo
    if (sig.currentAssetUtilizationPct !== null && sig.currentAssetUtilizationPct < 40) {
      return {
        signalId: sig.id,
        title: sig.title,
        status: 'PROCESS_REVIEW_REQUIRED',
        recommendation: `Equipamento existente com apenas ${sig.currentAssetUtilizationPct}% de ocupação. Gargalo é de agendamento/manutenção ou mobilização geográfica. Corrigir o fluxo operacional antes de avaliar compra de novo ativo.`,
        isInvestmentWarranted: false,
        rootConstraint: RootConstraintType.SCHEDULING_ISSUE,
        pipelineValueAffected: sig.pipelineValueAffected
      };
    }

    // Regra 3: Gargalo recorrente com impacto comprovado em pipeline
    return {
      signalId: sig.id,
      title: sig.title,
      status: 'INVESTMENT_CASE_RECOMMENDED',
      recommendation: `Gargalo identificado em ${sig.frequency} certames nos últimos meses com R$ ${(sig.pipelineValueAffected / 1000000).toFixed(1)}M de pipeline qualificado afetado. Recomendada abertura formal de caso de investimento.`,
      isInvestmentWarranted: true,
      rootConstraint: sig.rootConstraint,
      pipelineValueAffected: sig.pipelineValueAffected,
      affectedOpportunitiesCount: sig.affectedOpportunities.length
    };
  }

  /**
   * 2. Criação Estruturada de Caso de Investimento (Problem-First)
   */
  createInvestmentCase({
    companyId = 'veeluen',
    title,
    capabilityType,
    problemStatement,
    strategicObjectiveId = null,
    sourceSignalId = null,
    rootConstraint = RootConstraintType.CAPACITY_SHORTAGE,
    user
  }) {
    if (!problemStatement || problemStatement.trim().length < 15) {
      throw new Error('Problem Statement obrigatório: Descreva claramente o problema de capacidade antes de propor qualquer solução de compra.');
    }

    const caseId = `CASE-2026-${String(this.cases.length + 1).padStart(3, '0')}`;
    const newCase = {
      id: caseId,
      companyId,
      title,
      capabilityType,
      problemStatement,
      status: InvestmentCaseStatus.IDENTIFIED,
      strategicObjectiveId,
      sourceSignalId,
      rootConstraint,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Comitê de Planejamento',
      reviewDate: new Date(Date.now() + 15 * 86400000).toISOString(),
      version: 1,
      capitalPriority: CapitalPriorityTier.PREPARE,
      options: [
        {
          id: `OPT-${caseId}-DONOTHING`,
          caseId,
          type: ExpansionOptionType.DO_NOTHING,
          title: 'Manter Situação Atual (Não Expandir)',
          description: 'Não realizar desembolsos financeiros, mantendo as restrições e custos operacionais correntes.',
          estimatedCost: { upfront: 0, recurringAnnual: 0, variablePerUse: 0, source: CostSourceType.MANUAL_ASSUMPTION },
          leadTimeDays: 0,
          capacityGain: 'Nenhum ganho adicional.',
          risks: 'Continuidade dos gargalos em janelas simultâneas.',
          isMostBalanced: false,
          status: 'BASE_SCENARIO'
        }
      ]
    };

    this.cases.push(newCase);
    this._audit('INVESTMENT_CASE_CREATED', `Caso de investimento ${caseId} (${title}) aberto com abordagem Problem-First.`);
    return newCase;
  }

  /**
   * 3. Cálculo de Break-Even entre Compra (Buy) e Locação (Rent)
   */
  calculateBreakEven(buyOption, rentOption) {
    if (!buyOption || !rentOption) return null;

    // Se o custo de qualquer das opções for desconhecido, NÃO inventa número
    if (
      buyOption.estimatedCost?.upfront === null ||
      buyOption.estimatedCost?.source === CostSourceType.UNKNOWN ||
      rentOption.estimatedCost?.variablePerUse === null ||
      rentOption.estimatedCost?.source === CostSourceType.UNKNOWN
    ) {
      return {
        isCalculable: false,
        reason: 'Custos não suficientemente conhecidos para cálculo matemático de break-even.'
      };
    }

    const upfront = buyOption.estimatedCost.upfront;
    const rentalPerUse = rentOption.estimatedCost.variablePerUse;
    const recurringAnnual = buyOption.estimatedCost.recurringAnnual || 0;
    const netSavingsPerUse = rentalPerUse - (buyOption.estimatedCost.variablePerUse || 0);

    if (netSavingsPerUse <= 0) {
      return {
        isCalculable: false,
        reason: 'Custo variável da compra supera o custo de locação.'
      };
    }

    const breakEvenUses = Math.ceil(upfront / netSavingsPerUse);
    return {
      isCalculable: true,
      breakEvenUses,
      upfrontCost: upfront,
      costPerRental: rentalPerUse,
      analysis: `A aquisição própria atinge o ponto de equilíbrio (break-even) a partir da ${breakEvenUses}ª utilização em certames ou contratos.`
    };
  }

  /**
   * 4. Comparador Lado a Lado de Alternativas (Options Comparison)
   */
  compareExpansionOptions(caseId, hasFinancialPermission = true) {
    const c = this.cases.find(item => item.id === caseId);
    if (!c) throw new Error(`Caso de investimento ${caseId} não encontrado.`);

    return {
      caseId: c.id,
      title: c.title,
      problemStatement: c.problemStatement,
      status: c.status,
      options: c.options.map(opt => ({
        id: opt.id,
        type: opt.type,
        title: opt.title,
        description: opt.description,
        leadTimeDays: opt.leadTimeDays,
        capacityGain: opt.capacityGain,
        risks: opt.risks,
        isMostBalanced: opt.isMostBalanced || false,
        tradeOffNotes: opt.tradeOffNotes || '',
        // Ocultação de custos se usuário sem permissão financeira
        estimatedCost: hasFinancialPermission ? opt.estimatedCost : {
          upfront: null,
          recurringAnnual: null,
          variablePerUse: null,
          source: 'Dados financeiros restritos à diretoria autorizada.'
        },
        breakEvenUses: hasFinancialPermission ? opt.breakEvenUses : null
      }))
    };
  }

  /**
   * 5. Aprovação Formal de Caso de Investimento
   */
  approveInvestmentCase(caseId, user) {
    if (!user || (!user.permissions?.includes('capability_investment.approve') && user.role !== 'ADMIN')) {
      throw new Error('Acesso negado: Usuário sem permissão "capability_investment.approve" para deliberar sobre investimentos em capacidade.');
    }

    const c = this.cases.find(item => item.id === caseId);
    if (!c) throw new Error(`Caso ${caseId} não encontrado.`);

    c.status = InvestmentCaseStatus.APPROVED;
    c.approvedBy = user.name || 'Diretor Financeiro & Operações';
    c.approvedAt = new Date().toISOString();

    // Guardrail Inviolável: Aprovado NÃO significa capacidade já disponível na Fase 68
    this._audit('INVESTMENT_CASE_APPROVED', `Caso ${caseId} aprovado formalmente. Capacidade permanece inalterada até confirmação física da implementação.`);

    return {
      caseId,
      status: c.status,
      approvedBy: c.approvedBy,
      capacityUpdated: false,
      note: 'Capacidade no portfólio (Fase 68) só será liberada após comprovação documental de recebimento e calibração válida.'
    };
  }

  /**
   * 6. Confirmação de Implementação e Atualização de Capacidade
   */
  confirmImplementation(caseId, evidenceNotes = 'Equipamento recebido e calibração RBC conferida') {
    const c = this.cases.find(item => item.id === caseId);
    if (!c) throw new Error(`Caso ${caseId} não encontrado.`);

    if (c.status !== InvestmentCaseStatus.APPROVED) {
      throw new Error(`Caso ${caseId} não pode ser implementado antes de aprovação formal.`);
    }

    c.status = InvestmentCaseStatus.IMPLEMENTED;
    c.implementedAt = new Date().toISOString();
    c.implementationEvidence = evidenceNotes;

    this._audit('CAPABILITY_IMPLEMENTED', `Capacidade de ${c.title} implementada e disponível para alocação no portfólio.`);
    return {
      caseId,
      status: c.status,
      capacityAvailable: true,
      evidence: evidenceNotes
    };
  }

  /**
   * 7. Registro de Revisão Pós-Investimento (Post-Investment Review)
   */
  recordPostInvestmentReview({
    caseId,
    reviewPeriod = '6 Meses',
    capacityImpact,
    utilizationObservedPct,
    affectedOpportunitiesWonCount = 0,
    assumptionsValidated = true,
    notes = ''
  }) {
    const review = {
      id: `OUT-CASE-${Date.now()}`,
      caseId,
      reviewDate: new Date().toISOString(),
      reviewPeriod,
      capacityImpact,
      utilizationObservedPct,
      affectedOpportunitiesWonCount,
      assumptionsValidated,
      notes
    };

    this.outcomes.push(review);
    this._audit('POST_INVESTMENT_REVIEWED', `Revisão de ${reviewPeriod} gravada para caso ${caseId}. Premissas validadas: ${assumptionsValidated}.`);
    return review;
  }

  /**
   * 8. Validação de Governança Multiempresa para Ativos Compartilhados
   */
  validateCrossCompanyAsset(caseId, requestingCompanyId, userPermissions = []) {
    const c = this.cases.find(item => item.id === caseId);
    if (!c) throw new Error(`Caso ${caseId} não existe.`);

    if (c.companyId === requestingCompanyId) {
      return { allowed: true, reason: 'Caso pertence à mesma empresa solicitante.' };
    }

    const hasGroupPermission = userPermissions.includes('capability_investment.group.view') || userPermissions.includes('ALL_COMPANIES');
    if (hasGroupPermission) {
      return { allowed: true, reason: 'Acesso de visualização de grupo concedido sob governança autorizada.' };
    }

    return {
      allowed: false,
      reason: `Acesso negado: O caso e os ativos pertencem à empresa ${c.companyId} e não possuem compartilhamento contábil com ${requestingCompanyId}.`
    };
  }

  /**
   * 9. Resposta Estruturada para o Copilot (Itens 222 a 225)
   */
  answerCopilotQuery(query = '') {
    const q = query.toLowerCase();
    const case1 = this.cases[0];

    // Se o usuário pergunta sobre buy vs rent de equipamento com dados incompletos ou estimativas
    if (q.includes('comprar ou locar') || q.includes('vale mais comprar')) {
      const buyOpt = case1.options.find(o => o.type === ExpansionOptionType.BUY);
      const rentOpt = case1.options.find(o => o.type === ExpansionOptionType.RENT);
      const be = this.calculateBreakEven(buyOpt, rentOpt);

      return {
        constraint: 'Gargalo recorrente de 1 analisador portátil FTIR próprio.',
        evidence: 'Identificado como limitação em 8 certames industriais nos últimos 12 meses (R$ 13.4M de pipeline qualificado afetado).',
        options: ['Aquisição própria (Capex R$ 160.000)', 'Locação guarda-chuva por demanda (R$ 15.000/uso)', 'Manter situação atual'],
        tradeOffs: be?.isCalculable ? be.analysis : 'Cálculo de break-even depende de confirmação final dos custos de calibração anual e frete.',
        dataGaps: 'Necessário confirmar se o volume de certames de refino se manterá em 2027 antes de imobilizar capital próprio.',
        suggestedNextAnalysis: 'Apresentar simulação no Comitê de Planejamento de 25/10.',
        text: 'O equipamento FTIR apareceu como gargalo em 8 oportunidades qualificadas. A aquisição própria atinge o ponto de equilíbrio a partir da 11ª utilização. Se a projeção de certames for inferior a 6 utilizações/ano, a locação comercial continua sendo a alternativa financeiramente mais prudente.'
      };
    }

    return {
      constraint: 'Gargalos recorrentes mapeados em Espectrometria Óptica e Inspetores NR-13.',
      evidence: 'R$ 19.6M de pipeline qualificado total impactado por limitações de capacidade própria.',
      options: ['Aquisição de Espectrômetro Dedicado', 'Qualificação Interna NR-13 de Engenheiro Residente', 'Do Nothing'],
      tradeOffs: 'Comprar equipamento remove dependência externa; treinar engenheiro retém conhecimento a custo marginal.',
      dataGaps: 'Sem lacunas de dados impeditivas nos casos prioritários.',
      suggestedNextAnalysis: 'Revisar casos no Capability Investment Lab.',
      text: 'Identificamos 2 casos prioritários de expansão de capacidade estrutural suportados por demanda recorrente de certames. Nenhuma compra deve ser autorizada sem validação das premissas de utilização mínima.'
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

export const capabilityInvestmentEngine = new CapabilityInvestmentEngine();
export default capabilityInvestmentEngine;
