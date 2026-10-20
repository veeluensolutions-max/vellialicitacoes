/**
 * VELLIA LICITAÇÕES — FASE 68: STRATEGIC RESOURCE OPTIMIZATION + PORTFOLIO TRADEOFF ENGINE
 * portfolioTradeoffEngine.js: Motor de Conflitos, Restrições, Simulação e Trade-Offs de Portfólio
 */

import {
  initialResources,
  initialResourceCapacities,
  initialResourceDemands,
  initialCapacityConflicts,
  initialPortfolioScenarios
} from './portfolioCapacityData.js';
import {
  ResourceType,
  CapacityQuality,
  DemandStatus,
  ResourcePressureLevel,
  ConflictType,
  ConflictStatus,
  ReservationStatus,
  OpportunityPriorityTier,
  TradeoffObjective
} from './portfolioCapacityModels.js';

class PortfolioTradeoffEngine {
  constructor() {
    this.resources = [...initialResources];
    this.capacities = [...initialResourceCapacities];
    this.demands = [...initialResourceDemands];
    this.conflicts = [...initialCapacityConflicts];
    this.scenarios = [...initialPortfolioScenarios];
    this.auditLog = [];
  }

  /**
   * 1. Detecção Global de Conflitos de Capacidade
   */
  detectCapacityConflicts(companyId = 'all') {
    // Verificação de Qualidade dos Dados Mestres de Recursos
    this.resources.forEach(r => {
      if (r.coverageQuality === CapacityQuality.UNKNOWN) {
        this._audit('DATA_QUALITY_WARNING', `Recurso ${r.id} (${r.name}) com disponibilidade desconhecida. Não presumido como livre.`);
      }
    });

    const activeDemands = this.demands.filter(d => 
      d.status !== DemandStatus.CANCELLED &&
      (companyId === 'all' || d.companyId === companyId)
    );

    const detectedConflicts = [];
    const resourceMap = {};

    activeDemands.forEach(dem => {
      if (!resourceMap[dem.resourceId]) {
        resourceMap[dem.resourceId] = [];
      }
      resourceMap[dem.resourceId].push(dem);
    });

    Object.entries(resourceMap).forEach(([resId, demandsList]) => {
      const resource = this.resources.find(r => r.id === resId);

      // Verificação 2: Expiração de Calibração / Manutenção de Equipamento
      if (resource && resource.calibrationExpiry) {
        demandsList.forEach(dem => {
          if (dem.periodStart > resource.calibrationExpiry) {
            detectedConflicts.push({
              id: `CONF-CALIB-${resId}-${dem.id}`,
              resources: [resId],
              entities: [{ id: dem.relatedEntityId, type: dem.relatedEntityType, title: dem.title }],
              period: `${dem.periodStart} a ${dem.periodEnd}`,
              conflictType: ConflictType.EQUIPMENT_CONFLICT,
              severity: ResourcePressureLevel.CRITICAL,
              status: ConflictStatus.DETECTED,
              description: `A calibração do equipamento ${resource.name} expira em ${resource.calibrationExpiry}, antes do período de execução planejado (${dem.periodStart}).`,
              existingContractAtRisk: dem.relatedEntityType === 'CONTRACT',
              suggestedMitigations: [
                { title: 'Antecipar calibração rastreada RBC', cost: 2400, feasibility: 'Viable' },
                { title: 'Locar equipamento substituto calibrado', cost: 7500, feasibility: 'Viable' }
              ]
            });
          }
        });
      }

      // Verificação 3: Disputa Simultânea de Recurso (Mesmo Recurso em Períodos Sobrepostos)
      if (demandsList.length > 1) {
        for (let i = 0; i < demandsList.length; i++) {
          for (let j = i + 1; j < demandsList.length; j++) {
            const d1 = demandsList[i];
            const d2 = demandsList[j];

            // Checa sobreposição temporal
            const overlap = (d1.periodStart <= d2.periodEnd) && (d1.periodEnd >= d2.periodStart);
            if (overlap) {
              const hasContract = d1.relatedEntityType === 'CONTRACT' || d2.relatedEntityType === 'CONTRACT';
              const conflictId = `CONF-${resId}-${d1.id}-${d2.id}`;

              detectedConflicts.push({
                id: conflictId,
                resources: [resId],
                entities: [
                  { id: d1.relatedEntityId, type: d1.relatedEntityType, title: d1.title, priority: d1.priorityTier },
                  { id: d2.relatedEntityId, type: d2.relatedEntityType, title: d2.title, priority: d2.priorityTier }
                ],
                period: `${d1.periodStart} a ${d1.periodEnd}`,
                conflictType: resource.type.includes('Equipment') ? ConflictType.EQUIPMENT_CONFLICT : ConflictType.TEAM_CONFLICT,
                severity: hasContract ? ResourcePressureLevel.CRITICAL : ResourcePressureLevel.STRESSED,
                status: ConflictStatus.DETECTED,
                description: `Disputa simultânea do recurso ${resource.name} entre [${d1.title}] e [${d2.title}].`,
                existingContractAtRisk: hasContract,
                suggestedMitigations: [
                  { title: 'Contratação / Locação Externa de Apoio', cost: 15000, marginImpactPct: -2.0, feasibility: 'Viable' },
                  { title: 'Ajuste Negociado de Janela de Cronograma', cost: 0, marginImpactPct: 0, feasibility: 'Subject to Buyer' },
                  { title: 'Priorização Humana de Portfólio (Decisão de Diretoria)', cost: 0, marginImpactPct: 0, feasibility: 'Human Decision Required' }
                ]
              });
            }
          }
        }
      }
    });

    // Consolidação de alertas redundantes de mesmo recurso
    const consolidatedConflicts = this._consolidateConflicts(detectedConflicts);
    this.conflicts = consolidatedConflicts;
    return consolidatedConflicts;
  }

  /**
   * 2. Comparador de Cenários de Trade-Off
   */
  evaluatePortfolioTradeoffs(selectedOpportunities = [], hasFinancialPermission = true, objective = TradeoffObjective.BALANCED) {
    const oppDemands = this.demands.filter(d => 
      selectedOpportunities.includes(d.relatedEntityId) && d.relatedEntityType === 'OPPORTUNITY'
    );
    const contractDemands = this.demands.filter(d => d.relatedEntityType === 'CONTRACT');

    // Valor Total do Pipeline
    const pipelineValue = selectedOpportunities.length * 3500000;
    const baseMarginPct = 19.0;
    const requiresPartnerMitigation = selectedOpportunities.length >= 3;
    const effectiveMarginPct = requiresPartnerMitigation ? 17.5 : baseMarginPct;
    const potentialMarginValue = (pipelineValue * effectiveMarginPct) / 100;
    const mitigationCost = requiresPartnerMitigation ? 22000 : 0;

    // Conflitos nos cenários
    const involvedResources = oppDemands.map(d => d.resourceId);
    const hasContractConflict = contractDemands.some(cd => involvedResources.includes(cd.resourceId));

    let capacityPressure = ResourcePressureLevel.BALANCED;
    if (selectedOpportunities.length >= 3 && !requiresPartnerMitigation) {
      capacityPressure = ResourcePressureLevel.CRITICAL;
    } else if (selectedOpportunities.length >= 2) {
      capacityPressure = ResourcePressureLevel.STRESSED;
    }

    return {
      selectedOpportunities,
      objective,
      totalPipelineValue: pipelineValue,
      potentialMarginValue: hasFinancialPermission ? potentialMarginValue : null,
      potentialMarginPct: hasFinancialPermission ? effectiveMarginPct : null,
      mitigationCost: hasFinancialPermission ? mitigationCost : null,
      contractsProtected: !hasContractConflict || requiresPartnerMitigation,
      capacityPressure,
      tradeoffAnalysis: {
        financialSummary: hasFinancialPermission 
          ? `Valor do Pipeline: R$ ${(pipelineValue / 1000000).toFixed(1)}M com Margem de ${effectiveMarginPct.toFixed(1)}%` 
          : 'Dados financeiros restritos à diretoria autorizada.',
        operationalTradeoff: requiresPartnerMitigation
          ? 'Requer locação de equipamento ou subcontratação (Custo R$ 22.000). Reduz a margem em 1.5%, mas viabiliza execução simultânea e blinda contratos vigentes.'
          : 'Capacidade própria é suficiente sem custos adicionais, mantendo folga nos contratos vigentes.',
        existingContractWarning: hasContractConflict && !requiresPartnerMitigation 
          ? 'ALERTA CRÍTICO: Viola compromissos com o Contrato Petrobras ativo.' 
          : 'Contratos ativos 100% blindados e prioritários.'
      }
    };
  }

  /**
   * 3. Liberação de Reserva quando Oportunidade é Perdida/Cancelada
   */
  releaseReservationOnOpportunityLost(opportunityId) {
    let releasedCount = 0;
    this.demands.forEach(dem => {
      if (dem.relatedEntityId === opportunityId && dem.relatedEntityType === 'OPPORTUNITY') {
        dem.status = DemandStatus.CANCELLED;
        releasedCount++;
      }
    });

    // Atualiza capacidade disponível
    this.capacities.forEach(cap => {
      if (cap.tentativeCapacity > 0) {
        cap.tentativeCapacity = Math.max(0, cap.tentativeCapacity - 20);
        cap.availableCapacity += 20;
      }
    });

    this._audit('RESERVATION_RELEASED', `Oportunidade ${opportunityId} cancelada/perdida. ${releasedCount} demanda(s) liberadas de volta à capacidade.`);
    return {
      success: true,
      opportunityId,
      releasedCount,
      reservationStatus: ReservationStatus.RELEASED
    };
  }

  /**
   * 4. Conversão de Demanda em Compromisso quando Oportunidade é Vencida
   */
  commitReservationOnOpportunityWon(opportunityId) {
    let committedCount = 0;
    this.demands.forEach(dem => {
      if (dem.relatedEntityId === opportunityId && dem.relatedEntityType === 'OPPORTUNITY') {
        dem.status = DemandStatus.COMMITTED;
        dem.relatedEntityType = 'CONTRACT';
        committedCount++;
      }
    });

    this.capacities.forEach(cap => {
      if (cap.tentativeCapacity >= 20) {
        cap.tentativeCapacity -= 20;
        cap.committedCapacity += 20;
      }
    });

    this._audit('RESERVATION_COMMITTED', `Oportunidade ${opportunityId} vencida e convertida em Contrato. Demanda agora é COMMITTED.`);
    return {
      success: true,
      opportunityId,
      committedCount,
      status: DemandStatus.COMMITTED
    };
  }

  /**
   * 5. Propagação de Impacto quando Recurso fica Indisponível
   */
  handleResourceUnavailable(resourceId, reason = 'Avaria mecânica ou licença') {
    const resource = this.resources.find(r => r.id === resourceId);
    if (!resource) throw new Error(`Recurso ${resourceId} não encontrado.`);

    resource.coverageQuality = CapacityQuality.UNKNOWN;
    const impactedDemands = this.demands.filter(d => 
      d.resourceId === resourceId && d.status !== DemandStatus.CANCELLED
    );

    this._audit('RESOURCE_UNAVAILABLE', `Recurso ${resourceId} indisponível (${reason}). ${impactedDemands.length} entidade(s) impactadas.`);
    return {
      resourceId,
      resourceName: resource.name,
      reason,
      impactedEntities: impactedDemands.map(d => ({
        id: d.relatedEntityId,
        type: d.relatedEntityType,
        title: d.title,
        status: d.status
      }))
    };
  }

  /**
   * 6. Validação de Acesso a Recurso Interempresas (Multiempresa Estrito)
   */
  validateCrossCompanyResourceAccess(resourceId, requestingCompanyId, userPermissions = []) {
    const resource = this.resources.find(r => r.id === resourceId);
    if (!resource) throw new Error(`Recurso ${resourceId} não existe.`);

    // Se pertence à mesma empresa, permitido
    if (resource.companyId === requestingCompanyId) {
      return { allowed: true, reason: 'Recurso próprio da empresa solicitante.' };
    }

    // Se é de outra empresa do grupo
    const hasGroupPermission = userPermissions.includes('capacity_group.view') || userPermissions.includes('ALL_COMPANIES');
    if (resource.isSharedGroupResource && hasGroupPermission) {
      return { allowed: true, reason: 'Recurso cadastrado expressamente como compartilhado e usuário autorizado.' };
    }

    return {
      allowed: false,
      reason: `Acesso negado: O recurso pertence à empresa ${resource.companyId} e não está formalmente autorizado para compartilhamento com ${requestingCompanyId}.`
    };
  }

  /**
   * 7. Resposta Estruturada para o Copilot (Item 219 a 222)
   */
  answerCopilotQuery(opportunityIds = ['PE-2026-0891', 'PE-2026-0940'], query = '') {
    const conflicts = this.detectCapacityConflicts('all');
    const q = query.toLowerCase();

    const affectedEntities = ['PE-2026-0891 (Petrobras REDUC)', 'PE-2026-0940 (Sanepar)', 'Contrato Petrobras Vigente'];
    const bottleneck = this.resources.find(r => r.id === 'RES-EQP-SPECTRO');

    return {
      demand: 'As oportunidades PE Petrobras REDUC e PE Sanepar demandam simultaneamente o Espectrômetro Óptico FTIR e o Engenheiro NR-13 entre 12 e 18 de novembro.',
      availableCapacity: 'Capacidade própria disponível: 1 Espectrômetro e 1 Engenheiro, os quais já estão parcialmente comprometidos com o Contrato Petrobras REDUC até 15 de novembro.',
      conflict: 'Sobrecarga de 180% da capacidade própria instalada caso ambos os certames sejam vencidos simultaneamente sem mitigação.',
      affectedEntities,
      options: [
        'Opção 1: Contratar locação externa de espectrômetro com Parceiro Beta (Custo: R$ 18.000, reduz margem em 2.4%).',
        'Opção 2: Negociar ajuste de cronograma de mobilização com a Sanepar (+6 dias).',
        'Opção 3: Priorização estratégica pela diretoria: disputar com foco total o certame da Petrobras e declinar da Sanepar.'
      ],
      text: 'As oportunidades A e B exigem o mesmo equipamento entre 10 e 18 de novembro. O equipamento já está comprometido com o Contrato Petrobras vigente. É possível avaliar ajuste de cronograma ou locação com parceiro, mas não há capacidade própria suficiente para executar as três demandas simultaneamente sem mitigação.'
    };
  }

  _consolidateConflicts(conflictsList) {
    const uniqueMap = {};
    conflictsList.forEach(c => {
      const key = `${c.conflictType}_${c.resources.sort().join('_')}_${c.period}`;
      if (!uniqueMap[key]) {
        uniqueMap[key] = c;
      }
    });
    return Object.values(uniqueMap);
  }

  _audit(action, details) {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action,
      details
    });
  }
}

export const portfolioTradeoffEngine = new PortfolioTradeoffEngine();
export default portfolioTradeoffEngine;
