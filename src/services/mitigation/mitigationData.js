/**
 * VELLIA LICITAÇÕES — FASE 67: PRESCRIPTIVE RISK MITIGATION + RECOVERY PLANNER
 * mitigationData.js: Dados Canônicos, Planos de Mitigação, Opções e Casos Históricos
 */

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

export const initialMitigationPlans = [
  {
    id: 'RMP-2026-001',
    companyId: 'veeluen',
    relatedEntityType: 'OPPORTUNITY',
    relatedEntityId: 'PE-2026-0891',
    opportunityTitle: 'Pregão Eletrônico 2026/0891 — Petrobras REDUC (Instrumentação e Automação)',
    riskType: 'Risco de Não-Submissão & Blocker Crítico',
    riskLevel: 'Crítico (Critical)',
    status: PlanStatus.UNDER_REVIEW,
    createdAt: '2026-10-20T08:30:00Z',
    createdBy: 'MitigationPlannerEngine',
    validUntil: '2026-10-21T02:00:00Z',
    sourceRiskAssessmentId: 'PRA-2026-001',
    version: 1,
    recoveryWindow: {
      status: RecoveryWindowStatus.NARROW,
      hoursRemaining: 18,
      reason: 'Prazo limite em 18h com 2 gargalos no caminho crítico (Atestado e Aprovação Comercial).',
      earlyInterventionInsight: 'Em T-72h havia 4 opções viáveis; agora restam apenas 2 opções acionáveis.'
    },
    rootCause: {
      primaryDriver: 'Atraso na validação do parceiro e pendência de aprovação comercial',
      isConfirmed: false,
      note: 'Possível causa primária inferida pelo cruzamento de dependências de pricing e atestados.'
    },
    options: [
      {
        id: 'OPT-01',
        planId: 'RMP-2026-001',
        title: 'Acionar Validação Expressa de Parceiro Subcontratado (Parceiro Alpha)',
        description: 'Confirmar disponibilidade e escopo técnico com o parceiro primário homologado para emissão do atestado de capacidade.',
        type: OptionType.PARTNER_ACTION,
        expectedImpact: ExpectedImpact.HIGH,
        effort: EffortLevel.MEDIUM,
        urgency: UrgencyLevel.IMMEDIATE,
        dependencies: ['Disponibilidade do Diretor Técnico do Parceiro'],
        unlocks: ['Pricing Gate', 'Technical Readiness Gate', 'Commercial Approval'],
        leverageCount: 3, // Desbloqueia 3 etapas
        riskReduction: 'Reduz risco de Crítico para Moderado',
        residualRisk: 'Moderado (Moderate)',
        requiresApproval: true,
        estimatedDurationHours: 4,
        viability: OptionViability.VIABLE,
        cost: {
          amount: null, // Custo não precificado previamente
          source: CostSource.UNKNOWN,
          note: 'Sem custo adicional além do contrato padrão de parceria.'
        },
        crossImpact: {
          hasImpact: false,
          details: 'Nenhum conflito identificado com outros contratos ativos.'
        },
        fallbackOptionId: 'OPT-02',
        status: 'SUGGESTED'
      },
      {
        id: 'OPT-02',
        planId: 'RMP-2026-001',
        title: 'Ativar Parceiro de Contingência (Parceiro Beta Engenharia)',
        description: 'Acionar segundo parceiro homologado para fornecimento da cotação e comprovação técnica caso o primário não responda até 14h.',
        type: OptionType.ALTERNATIVE_STRATEGY,
        expectedImpact: ExpectedImpact.HIGH,
        effort: EffortLevel.HIGH,
        urgency: UrgencyLevel.HIGH,
        dependencies: ['Confirmação de indisponibilidade formal do Parceiro Alpha'],
        unlocks: ['Pricing Gate', 'Technical Readiness Gate'],
        leverageCount: 2,
        riskReduction: 'Reduz risco de Crítico para Alto',
        residualRisk: 'Alto (High)',
        requiresApproval: true,
        estimatedDurationHours: 6,
        viability: OptionViability.VIABLE,
        cost: {
          amount: 15000,
          source: CostSource.QUOTATION,
          note: 'Taxa de mobilização urgente cotada formalmente.'
        },
        crossImpact: {
          hasImpact: true,
          details: 'Engenheiro responsável pelo Parceiro Beta está alocado no Contrato Sabesp EEE Norte. Requer alinhamento de agenda.'
        },
        fallbackOptionId: null,
        status: 'FALLBACK'
      },
      {
        id: 'OPT-03',
        planId: 'RMP-2026-001',
        title: 'Emitir Nova Certidão/Atestado no CREA em Regime de Urgência',
        description: 'Solicitar emissão e registro de novo atestado de acervo técnico perante o conselho regional.',
        type: OptionType.DOCUMENT_RESOLUTION,
        expectedImpact: ExpectedImpact.HIGH,
        effort: EffortLevel.HIGH,
        urgency: UrgencyLevel.IMMEDIATE,
        dependencies: ['Protocolo junto ao conselho regional'],
        unlocks: ['Habilitação Técnica'],
        leverageCount: 1,
        riskReduction: 'Incerteza temporal elevada',
        residualRisk: 'Crítico (Critical)',
        requiresApproval: false,
        estimatedDurationHours: 48, // Prazo excede o deadline de 18h
        viability: OptionViability.UNLIKELY,
        cost: {
          amount: 450,
          source: CostSource.HISTORICAL,
          note: 'Taxa pública padrão de expedição rápida.'
        },
        crossImpact: {
          hasImpact: false,
          details: 'Sem impacto cruzado em outros contratos.'
        },
        fallbackOptionId: null,
        status: 'UNFEASIBLE_TIME'
      },
      {
        id: 'OPT-04',
        planId: 'RMP-2026-001',
        title: 'Revisão de Participação & Retirada Estratégica (Strategic Withdrawal)',
        description: 'Avaliar formalmente no comitê de diretoria a retirada da participação (NO-GO tardio) para evitar submissão desqualificada.',
        type: OptionType.WITHDRAWAL_REVIEW,
        expectedImpact: ExpectedImpact.MEDIUM,
        effort: EffortLevel.LOW,
        urgency: UrgencyLevel.HIGH,
        dependencies: ['Deliberação unânime da Diretoria Executiva'],
        unlocks: ['Liberação imediata de capacidade da equipe'],
        leverageCount: 1,
        riskReduction: 'Elimina risco de desclassificação manchando histórico',
        residualRisk: 'Baixo (Low)',
        requiresApproval: true,
        estimatedDurationHours: 1,
        viability: OptionViability.VIABLE,
        cost: {
          amount: 0,
          source: CostSource.MANUAL_ASSUMPTION,
          note: 'Apenas custo de oportunidade do certame.'
        },
        crossImpact: {
          hasImpact: false,
          details: 'Libera recursos para focar no Pregão Sabesp.'
        },
        fallbackOptionId: null,
        status: 'STRATEGIC_ALTERNATIVE'
      }
    ],
    chosenPlanSequence: {
      now: [
        {
          id: 'ACT-01',
          mitigationPlanId: 'RMP-2026-001',
          title: 'Notificar Parceiro Alpha para envio do anexo técnico até 14:00',
          owner: 'Coordenação de Parcerias',
          dueDate: 'Hoje 14:00',
          dependency: 'Nenhuma',
          status: ActionStatus.IN_PROGRESS,
          actionType: OptionType.PARTNER_ACTION,
          linkedEntity: 'Parceiro Alpha'
        }
      ],
      next: [
        {
          id: 'ACT-02',
          mitigationPlanId: 'RMP-2026-001',
          title: 'Rodar planilha final de custos e encaminhar para aprovação comercial',
          owner: 'Gestor de Precificação',
          dueDate: 'Hoje 16:00',
          dependency: 'ACT-01',
          status: ActionStatus.PENDING,
          actionType: OptionType.PRICING_REVIEW,
          linkedEntity: 'Planilha de Margem'
        },
        {
          id: 'ACT-03',
          mitigationPlanId: 'RMP-2026-001',
          title: 'Submeter proposta no portal Petronect',
          owner: 'Especialista em Licitações',
          dueDate: 'Hoje 20:00',
          dependency: 'ACT-02',
          status: ActionStatus.PENDING,
          actionType: OptionType.DOCUMENT_RESOLUTION,
          linkedEntity: 'Petronect'
        }
      ],
      parallel: [
        {
          id: 'ACT-04',
          mitigationPlanId: 'RMP-2026-001',
          title: 'Pré-preencher e validar declarações complementares no cofre documental',
          owner: 'Analista de Documentos',
          dueDate: 'Hoje 15:00',
          dependency: 'Nenhuma',
          status: ActionStatus.IN_PROGRESS,
          actionType: OptionType.DOCUMENT_RESOLUTION,
          linkedEntity: 'Cofre Documental'
        }
      ],
      fallback: [
        {
          id: 'ACT-FB-01',
          mitigationPlanId: 'RMP-2026-001',
          title: 'Se Parceiro Alpha não confirmar até 14:00, convocar comitê para acionar Parceiro Beta',
          owner: 'Diretor de Operações',
          dueDate: 'Hoje 14:15',
          dependency: 'Falha de ACT-01',
          status: ActionStatus.PENDING,
          actionType: OptionType.ALTERNATIVE_STRATEGY,
          linkedEntity: 'Parceiro Beta'
        }
      ]
    }
  },
  {
    id: 'RMP-2026-002',
    companyId: 'excelencia',
    relatedEntityType: 'OPPORTUNITY',
    relatedEntityId: 'PE-2026-0902',
    opportunityTitle: 'Pregão Eletrônico 2026/0902 — Sabesp ETE Barueri (Monitoramento Ambiental)',
    riskType: 'Risco Documental & Alçada de Aprovação',
    riskLevel: 'Crítico (Critical)',
    status: PlanStatus.APPROVED,
    createdAt: '2026-10-20T09:00:00Z',
    createdBy: 'MitigationPlannerEngine',
    validUntil: '2026-10-20T23:00:00Z',
    sourceRiskAssessmentId: 'PRA-2026-002',
    version: 1,
    recoveryWindow: {
      status: RecoveryWindowStatus.CRITICAL,
      hoursRemaining: 14,
      reason: 'Certidão CND municipal vencida a 14h da abertura da sessão pública.',
      earlyInterventionInsight: 'Janela em estado crítico; certidão alternativa precisa ser emitida nas próximas 3h.'
    },
    rootCause: {
      primaryDriver: 'Débito tributário municipal em discussão administrativa não baixado no sistema fazendário',
      isConfirmed: true,
      note: 'Confirmado pelo departamento contábil e jurídico.'
    },
    options: [
      {
        id: 'OPT-201',
        planId: 'RMP-2026-002',
        title: 'Emitir Certidão Positiva com Efeito de Negativa (CPEN) via Protocolo',
        description: 'Apresentar certidão com efeito de negativa amparada na certidão de regularidade fiscal emitida pela prefeitura.',
        type: OptionType.DOCUMENT_RESOLUTION,
        expectedImpact: ExpectedImpact.HIGH,
        effort: EffortLevel.MEDIUM,
        urgency: UrgencyLevel.IMMEDIATE,
        dependencies: ['Protocolo judicial/administrativo vigente'],
        unlocks: ['Habilitação Fiscal'],
        leverageCount: 2,
        riskReduction: 'Reduz risco de Crítico para Baixo',
        residualRisk: 'Baixo (Low)',
        requiresApproval: false,
        estimatedDurationHours: 2,
        viability: OptionViability.VIABLE,
        cost: {
          amount: 0,
          source: CostSource.HISTORICAL,
          note: 'Emissão eletrônica gratuita.'
        },
        crossImpact: {
          hasImpact: false,
          details: 'Beneficia todas as licitações em curso da Excelência Ambiental.'
        },
        fallbackOptionId: null,
        status: 'SELECTED'
      }
    ],
    chosenPlanSequence: {
      now: [
        {
          id: 'ACT-201',
          mitigationPlanId: 'RMP-2026-002',
          title: 'Baixar e anexar CPEN autenticada digitalmente no vault',
          owner: 'Jurídico & Compliance',
          dueDate: 'Hoje 11:30',
          dependency: 'Nenhuma',
          status: ActionStatus.COMPLETED,
          actionType: OptionType.DOCUMENT_RESOLUTION,
          linkedEntity: 'Vault Documental'
        }
      ],
      next: [],
      parallel: [],
      fallback: []
    }
  }
];

export const historicalMitigations = [
  {
    id: 'HIST-MIT-01',
    opportunityId: 'PE-2025-0512',
    riskType: 'Bloqueio de Parceiro Subcontratado',
    mitigationUsed: 'Ativação de Parceiro de Contingência Homologado',
    leadTimeHours: 16,
    effectiveness: MitigationEffectiveness.EFFECTIVE,
    restoredReadiness: true,
    submissionSuccessful: true,
    winLossOutcome: 'WON',
    notes: 'A ativação do segundo parceiro em T-16h permitiu fechar o pricing e submeter com 4h de antecedência.'
  },
  {
    id: 'HIST-MIT-02',
    opportunityId: 'PE-2025-0610',
    riskType: 'Gargalo de Aprovação de Alçada de Preço',
    mitigationUsed: 'Escalação Emergencial de Alçada com Diretoria',
    leadTimeHours: 6,
    effectiveness: MitigationEffectiveness.EFFECTIVE,
    restoredReadiness: true,
    submissionSuccessful: true,
    winLossOutcome: 'LOST',
    notes: 'Mitigação foi 100% eficaz para viabilizar a submissão, embora o certame tenha sido perdido por R$ 12.000 no lance.'
  },
  {
    id: 'HIST-MIT-03',
    opportunityId: 'PE-2025-0720',
    riskType: 'Solicitação de Atestado Tardio',
    mitigationUsed: 'Tentativa de Obtenção de CAT em 12h',
    leadTimeHours: 8,
    effectiveness: MitigationEffectiveness.INEFFECTIVE,
    restoredReadiness: false,
    submissionSuccessful: false,
    winLossOutcome: 'DISQUALIFIED',
    notes: 'Prazo foi insuficiente perante o conselho regional; gerou aprendizado que CAT exige no mínimo 48h úteis.'
  }
];
