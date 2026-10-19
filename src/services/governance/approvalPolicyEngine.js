/**
 * VELLIA LICITAÇÕES — FASE 36
 * MOTOR DE POLÍTICAS DE ALÇADAS & GOVERNANÇA (ApprovalPolicyEngine)
 * 
 * Responsável por:
 * - Determinar os aprovadores e alçadas exigidas com base em Valor, Margem, Risco e Exceções
 * - Isolar regras por empresa (Veeluen Solutions vs Excelência Ambiental)
 * - Proibir auto-aprovação (Segregação de Funções)
 * - Exigir Override e Two-Person Rule para casos abaixo do Floor Price
 * - Simular políticas sem modificar dados reais (Policy Tester)
 */

import {
  ApprovalType,
  ApproverRole,
  ApprovalPriority,
  DecisionGate
} from './approvalTypes.js';

export const COMPANY_POLICIES = {
  'veeluen-matriz': {
    companyId: 'veeluen-matriz',
    companyName: 'Veeluen Solutions',
    version: '2.4.0',
    activeFrom: '2026-01-01',
    valueTiers: [
      { maxAmount: 100000, requiredRole: ApproverRole.GESTOR_COMERCIAL, label: 'Até R$ 100k: Gestor Comercial' },
      { maxAmount: 500000, requiredRole: ApproverRole.GERENCIA_LICITACOES, label: 'R$ 100k a R$ 500k: Gerência' },
      { maxAmount: Infinity, requiredRole: ApproverRole.DIRETORIA_EXECUTIVA, label: 'Acima de R$ 500k: Diretoria Executiva' }
    ],
    marginTiers: {
      targetMargin: 20.0,
      standardRole: ApproverRole.GESTOR_COMERCIAL,
      belowTargetRole: ApproverRole.CONTROLADORIA_FINANCEIRO,
      floorMargin: 12.0,
      floorRole: ApproverRole.DIRETORIA_EXECUTIVA,
      requiresFloorOverride: true,
      requiresTwoPersonRuleOnFloor: true
    },
    riskPolicy: {
      highRiskRole: ApproverRole.GERENCIA_LICITACOES,
      criticalRiskRole: ApproverRole.DIRETORIA_EXECUTIVA,
      blockerOverrideRole: ApproverRole.DIRETORIA_EXECUTIVA,
      minJustificationLength: 25
    },
    segregationOfDuties: {
      requesterCanApprove: false, // Regra estrita: quem prepara não aprova
      allowEmergencyBypass: false
    },
    slaHours: {
      normal: 24,
      urgent: 8,
      critical: 4
    }
  },

  'excelencia-ambiental': {
    companyId: 'excelencia-ambiental',
    companyName: 'Excelência Ambiental',
    version: '1.8.0',
    activeFrom: '2026-02-15',
    valueTiers: [
      { maxAmount: 50000, requiredRole: ApproverRole.GESTOR_COMERCIAL, label: 'Até R$ 50k: Gestor Comercial' },
      { maxAmount: 250000, requiredRole: ApproverRole.GERENCIA_LICITACOES, label: 'R$ 50k a R$ 250k: Gerência' },
      { maxAmount: Infinity, requiredRole: ApproverRole.DIRETORIA_EXECUTIVA, label: 'Acima de R$ 250k: Diretoria Executiva' }
    ],
    marginTiers: {
      targetMargin: 22.0,
      standardRole: ApproverRole.GESTOR_COMERCIAL,
      belowTargetRole: ApproverRole.CONTROLADORIA_FINANCEIRO,
      floorMargin: 14.0, // Floor mais conservador para serviços ambientais
      floorRole: ApproverRole.DIRETORIA_EXECUTIVA,
      requiresFloorOverride: true,
      requiresTwoPersonRuleOnFloor: true
    },
    riskPolicy: {
      highRiskRole: ApproverRole.GERENCIA_LICITACOES,
      criticalRiskRole: ApproverRole.DIRETORIA_EXECUTIVA,
      blockerOverrideRole: ApproverRole.DIRETORIA_EXECUTIVA,
      minJustificationLength: 30
    },
    segregationOfDuties: {
      requesterCanApprove: false,
      allowEmergencyBypass: false
    },
    slaHours: {
      normal: 20,
      urgent: 6,
      critical: 3
    }
  }
};

export class ApprovalPolicyEngine {
  /**
   * Obtém a política ativa para uma empresa
   */
  static getPolicyForCompany(companyId = 'veeluen-matriz') {
    return COMPANY_POLICIES[companyId] || COMPANY_POLICIES['veeluen-matriz'];
  }

  /**
   * Avalia a cadeia de aprovação necessária para uma decisão (Itens 7 a 43)
   */
  static evaluateApprovalRequirements({
    companyId = 'veeluen-matriz',
    approvalType,
    amount = 0,
    margin = 20.0,
    riskLevel = 'Baixo',
    hasBlocker = false,
    requestedBy = 'Analista Comercial',
    isEmergency = false
  }) {
    const policy = this.getPolicyForCompany(companyId);
    const requiredRoles = new Set();
    const justificationsNeeded = [];
    const flags = {
      isFloorOverride: false,
      isBlockerOverride: false,
      isTwoPersonRuleRequired: false,
      isCriticalSla: false
    };

    // 1. Avaliação por Tipo Específico
    if (approvalType === ApprovalType.GO_NO_GO) {
      if (amount > 500000 || riskLevel === 'Crítico' || hasBlocker) {
        requiredRoles.add(ApproverRole.DIRETORIA_EXECUTIVA);
      } else if (amount > 100000 || riskLevel === 'Alto') {
        requiredRoles.add(ApproverRole.GERENCIA_LICITACOES);
      } else {
        requiredRoles.add(ApproverRole.GESTOR_COMERCIAL);
      }
    }

    // 2. Avaliação por Valor Monetário
    for (const tier of policy.valueTiers) {
      if (amount <= tier.maxAmount) {
        requiredRoles.add(tier.requiredRole);
        break;
      }
    }

    // 3. Avaliação por Margem e Floor Price (Itens 9, 10, 118)
    if (margin < policy.marginTiers.floorMargin) {
      flags.isFloorOverride = true;
      flags.isTwoPersonRuleRequired = policy.marginTiers.requiresTwoPersonRuleOnFloor;
      requiredRoles.add(ApproverRole.CONTROLADORIA_FINANCEIRO);
      requiredRoles.add(ApproverRole.DIRETORIA_EXECUTIVA);
      justificationsNeeded.push(`Margem (${margin}%) abaixo do Floor institucional (${policy.marginTiers.floorMargin}%). Exige justificativa formal de Override da Diretoria.`);
    } else if (margin < policy.marginTiers.targetMargin) {
      requiredRoles.add(ApproverRole.CONTROLADORIA_FINANCEIRO);
      justificationsNeeded.push(`Margem (${margin}%) abaixo da meta de ${policy.marginTiers.targetMargin}%. Requer validação financeira.`);
    }

    // 4. Avaliação por Risco e Blocker Documental (Itens 13 a 19)
    if (hasBlocker || approvalType === ApprovalType.BLOCKER_OVERRIDE) {
      flags.isBlockerOverride = true;
      requiredRoles.add(policy.riskPolicy.blockerOverrideRole);
      justificationsNeeded.push('Pendência ou Blocker Documental detectado. Requer Exception Request com plano de mitigação.');
    } else if (riskLevel === 'Crítico' || approvalType === ApprovalType.RISCO_ELEVADO) {
      requiredRoles.add(policy.riskPolicy.criticalRiskRole);
      justificationsNeeded.push('Nível de Risco Crítico identificado no certame.');
    } else if (riskLevel === 'Alto') {
      requiredRoles.add(policy.riskPolicy.highRiskRole);
    }

    // 5. Determinação da Prioridade e SLA
    let priority = ApprovalPriority.MEDIA;
    let slaHours = policy.slaHours.normal;

    if (flags.isFloorOverride || flags.isBlockerOverride || riskLevel === 'Crítico' || isEmergency) {
      priority = ApprovalPriority.CRITICA;
      slaHours = policy.slaHours.critical;
      flags.isCriticalSla = true;
    } else if (amount > 500000 || riskLevel === 'Alto') {
      priority = ApprovalPriority.ALTA;
      slaHours = policy.slaHours.urgent;
    }

    // 6. Estruturação da Cadeia de Aprovação (Sequencial ou Paralela)
    const rolesArray = Array.from(requiredRoles);
    const sortedRoles = this.sortRolesByHierarchy(rolesArray);

    const approvalChain = {
      isSequential: sortedRoles.length > 1,
      mode: flags.isTwoPersonRuleRequired ? 'ALL_OF' : 'ANY_OF_HIGHEST',
      steps: sortedRoles.map((role, idx) => ({
        stepOrder: idx + 1,
        role,
        roleLabel: this.getRoleLabel(role),
        status: idx === 0 ? 'PENDING' : 'WAITING_PREVIOUS_STEP',
        assignedTo: this.getDefaultUserForRole(role, companyId)
      }))
    };

    return {
      companyId,
      companyName: policy.companyName,
      policyVersion: policy.version,
      requiredRoles: sortedRoles,
      primaryApproverRole: sortedRoles[sortedRoles.length - 1] || ApproverRole.GESTOR_COMERCIAL,
      primaryApproverUser: this.getDefaultUserForRole(sortedRoles[sortedRoles.length - 1], companyId),
      approvalChain,
      priority,
      slaHours,
      deadlineEstimate: new Date(Date.now() + slaHours * 3600 * 1000).toISOString(),
      flags,
      justificationsNeeded,
      minJustificationLength: policy.riskPolicy.minJustificationLength,
      segregationEnforced: !policy.segregationOfDuties.requesterCanApprove
    };
  }

  /**
   * Ordena papéis por senioridade hierárquica (Gestor -> Gerente -> Financeiro -> Diretoria)
   */
  static sortRolesByHierarchy(roles) {
    const hierarchyOrder = [
      ApproverRole.RESPONSAVEL_TECNICO,
      ApproverRole.GESTOR_COMERCIAL,
      ApproverRole.GERENCIA_LICITACOES,
      ApproverRole.CONTROLADORIA_FINANCEIRO,
      ApproverRole.DIRETORIA_EXECUTIVA,
      ApproverRole.ADMIN
    ];

    return roles.sort((a, b) => hierarchyOrder.indexOf(a) - hierarchyOrder.indexOf(b));
  }

  static getRoleLabel(role) {
    const map = {
      [ApproverRole.GESTOR_COMERCIAL]: 'Gestor Comercial',
      [ApproverRole.GERENCIA_LICITACOES]: 'Gerência de Licitações',
      [ApproverRole.CONTROLADORIA_FINANCEIRO]: 'Controladoria / Financeiro',
      [ApproverRole.RESPONSAVEL_TECNICO]: 'Responsável Técnico',
      [ApproverRole.DIRETORIA_EXECUTIVA]: 'Diretoria Executiva',
      [ApproverRole.ADMIN]: 'Administrador do Sistema'
    };
    return map[role] || role;
  }

  static getDefaultUserForRole(role, companyId = 'veeluen-matriz') {
    const usersMap = {
      [ApproverRole.GESTOR_COMERCIAL]: 'Carlos Silveira',
      [ApproverRole.GERENCIA_LICITACOES]: 'Mariana Castro',
      [ApproverRole.CONTROLADORIA_FINANCEIRO]: 'Eduardo Mendes (CFO)',
      [ApproverRole.RESPONSAVEL_TECNICO]: 'Dr. Roberto Albuquerque',
      [ApproverRole.DIRETORIA_EXECUTIVA]: 'Dr. Henrique Veeluen (Diretor Geral)',
      [ApproverRole.ADMIN]: 'Administrador Vellia'
    };
    return usersMap[role] || 'Comitê de Governança';
  }

  /**
   * Verifica se houve alteração material que invalida aprovação prévia (Itens 68 a 74)
   */
  static isMaterialChange(originalSnapshot, currentData) {
    if (!originalSnapshot || !currentData) return false;

    // Diferença de preço maior que 1.5%
    if (originalSnapshot.price && currentData.price) {
      const priceDiffPct = Math.abs((currentData.price - originalSnapshot.price) / originalSnapshot.price) * 100;
      if (priceDiffPct > 1.5) return true;
    }

    // Queda de margem maior que 0.5%
    if (originalSnapshot.margin && currentData.margin) {
      if ((originalSnapshot.margin - currentData.margin) > 0.5) return true;
    }

    // Mudança de escopo ou empresa concorrente
    if (originalSnapshot.companyId && currentData.companyId && originalSnapshot.companyId !== currentData.companyId) {
      return true;
    }

    // Novo blocker documental adicionado
    if (!originalSnapshot.hasBlocker && currentData.hasBlocker) {
      return true;
    }

    return false;
  }

  /**
   * Ferramenta de Simulação de Políticas (Policy Tester - Itens 107 a 110)
   */
  static simulatePolicyTester(params) {
    return this.evaluateApprovalRequirements(params);
  }
}
