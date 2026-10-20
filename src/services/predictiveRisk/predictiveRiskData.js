/**
 * VELLIA LICITAÇÕES — FASE 66: PREDICTIVE READINESS & RISK FORECASTING
 * predictiveRiskData.js: Registro de Modelos, Avaliações Preditivas Semente e Snapshots Históricos
 */

import {
  PredictiveRiskTarget,
  PredictiveRiskLevel,
  RiskTrajectory,
  ModelStatus,
  ConfidenceLevel,
  HumanAssessmentStatus
} from './predictiveRiskModels.js';

// 102 a 114. Registro de Modelos Preditivos de Risco (PredictiveModelRegistry)
export const initialModelRegistry = [
  {
    modelKey: 'MODEL-NO-SUBMISSION-V2',
    name: 'Classificador Interpretável de Não-Submissão Operacional',
    version: 'v2.1',
    target: PredictiveRiskTarget.NO_SUBMISSION,
    status: ModelStatus.PRODUCTION,
    algorithm: 'Decision Tree Calibrada com Regularização de Profundidade',
    trainingPeriod: '2024-Q1 a 2025-Q4',
    validationPeriod: '2026-Q1 a 2026-Q2',
    approvedAt: '2026-07-15T10:00:00Z',
    approvedBy: 'Colegiado de Governança de IA & Diretoria Comercial',
    metrics: {
      precision: 0.86,
      recall: 0.89,
      brierScore: 0.12, // Bem calibrado (< 0.15)
      deterministicBaselineGainPct: 14.2, // Supera regra simples em 14%
      earlyWarningMedianHours: 36
    },
    featuresUsed: [
      'timeToDeadlineHours',
      'criticalBlockersCount',
      'pricingGateStatus',
      'partnerConfirmedFlag',
      'missingCriticalDocsCount'
    ],
    limitations: 'Menor sensibilidade para certames com menos de 12h entre publicação e submissão.'
  },
  {
    modelKey: 'MODEL-LATE-READINESS-V1',
    name: 'Previsor de Prontidão Tardia (< T-24h)',
    version: 'v1.4',
    target: PredictiveRiskTarget.LATE_READINESS,
    status: ModelStatus.PRODUCTION,
    algorithm: 'Regressão Logística Regularizada com Splines de Tempo',
    trainingPeriod: '2024-Q2 a 2025-Q4',
    validationPeriod: '2026-Q1 a 2026-Q2',
    approvedAt: '2026-06-20T14:30:00Z',
    approvedBy: 'Comitê de Operações',
    metrics: {
      precision: 0.83,
      recall: 0.85,
      brierScore: 0.14,
      deterministicBaselineGainPct: 11.5,
      earlyWarningMedianHours: 42
    },
    featuresUsed: [
      'queueAgingHours',
      'pendingApprovalsCount',
      'readinessLeadTimeTrend',
      'certificationGapsCount'
    ],
    limitations: 'Calibrado primariamente para licitações estaduais e federais com mais de 5 dias úteis de edital.'
  },
  {
    modelKey: 'MODEL-CRITICAL-BLOCKER-V1',
    name: 'Previsor de Persistência de Blocker Crítico a T-24h',
    version: 'v1.0-shadow',
    target: PredictiveRiskTarget.CRITICAL_BLOCKER_T24,
    status: ModelStatus.SHADOW, // 106 a 109. Em modo Shadow (Não alerta usuário final)
    algorithm: 'Modelo Survival Time-to-Event com Hazard Ratio',
    trainingPeriod: '2025-Q1 a 2025-Q4',
    validationPeriod: '2026-Q2 a 2026-Q3 (Em andamento)',
    approvedAt: null,
    approvedBy: 'Aguardando validação com 30 casos de teste',
    metrics: {
      precision: 0.79,
      recall: 0.81,
      brierScore: 0.16,
      deterministicBaselineGainPct: 8.0,
      earlyWarningMedianHours: 48
    },
    featuresUsed: [
      'blockerCategory',
      'blockerResolutionLeadTimeHistorical',
      'thirdPartyDependencyFlag'
    ],
    limitations: 'Em teste paralelo silencioso frente à regra determinística.'
  },
  {
    modelKey: 'MODEL-APPROVAL-DELAY-V1',
    name: 'Previsor de Atraso de Alçada Comercial & Preço',
    version: 'v1.2',
    target: PredictiveRiskTarget.APPROVAL_DELAY,
    status: ModelStatus.PRODUCTION,
    algorithm: 'Regra Estatística Bayesiana Process-First',
    trainingPeriod: '2024-Q3 a 2025-Q4',
    validationPeriod: '2026-Q1',
    approvedAt: '2026-05-10T11:00:00Z',
    approvedBy: 'Diretoria de Risco e Alçadas',
    metrics: {
      precision: 0.88,
      recall: 0.84,
      brierScore: 0.11,
      deterministicBaselineGainPct: 12.0,
      earlyWarningMedianHours: 24
    },
    featuresUsed: [
      'approvalQueueAgeHours',
      'marginWaiverRequiredFlag',
      'historicalApprovalLeadTimeHours'
    ],
    limitations: 'Considera estritamente variáveis de fila e processo; nenhuma característica individual de gestor é utilizada.'
  },
  {
    modelKey: 'MODEL-CONSORTIUM-EXPERIMENTAL',
    name: 'Modelo Experimental de Risco de Consórcios Complexos',
    version: 'v0.3-alpha',
    target: PredictiveRiskTarget.NO_SUBMISSION,
    status: ModelStatus.EXPERIMENTAL, // 7 a 11. Dados Insuficientes -> Não pode ser ativado!
    algorithm: 'Random Forest Experimental',
    trainingPeriod: '2026-Q1',
    validationPeriod: null,
    approvedAt: null,
    approvedBy: null,
    metrics: {
      sampleSize: 4, // Amostra ínfima (4 certames)
      precision: 0.50,
      recall: 0.50,
      brierScore: 0.35,
      isInsufficientData: true
    },
    featuresUsed: ['partnerCount', 'sharedScopeRatio'],
    limitations: 'BLOQUEADO PELO MODEL READINESS GATE: Amostra insuficiente (< 20 certames) para previsão confiável.'
  }
];

// 23 a 34. Avaliações Preditivas Ativas por Oportunidade (PredictiveRiskAssessment)
export const initialRiskAssessments = [
  {
    id: 'PRA-001',
    bidProcessId: 'PROC-SABESP-2026-044',
    canonicalCode: 'SP-SABESP-2026-044',
    title: 'Operação e manutenção de estações elevatórias de esgoto Sabesp',
    companyId: 'veeluensolutions',
    companyName: 'Veeluen Solutions',
    deadline: '2026-10-21T09:00:00Z',
    hoursToDeadline: 18,
    riskTarget: PredictiveRiskTarget.NO_SUBMISSION,
    riskLevel: PredictiveRiskLevel.CRITICAL, // 24. CRÍTICO
    riskTrajectory: RiskTrajectory.WORSENING, // 67 a 72. Deteriorando!
    confidence: ConfidenceLevel.HIGH,
    dataCoveragePct: 92,
    modelVersion: 'v2.1 (MODEL-NO-SUBMISSION-V2)',
    generatedAt: '2026-10-20T10:00:00Z',
    validUntil: '2026-10-21T09:00:00Z',
    // 30 a 33. Top Drivers Observáveis (Máximo 3-5)
    topDrivers: [
      {
        factor: 'Alçada Comercial Pendente a menos de 24h',
        group: 'Alçadas & Aprovações',
        observation: 'Aprovação de margem e preço ainda não concluída com prazo final em 18h.'
      },
      {
        factor: 'Gargalo Documental Ativo',
        group: 'Prontidão Documental',
        observation: 'Certidão Municipal de Filial com emissão pendente no órgão emissor.'
      },
      {
        factor: 'Lead Time Histórico de Aprovação Superior à Janela',
        group: 'Tempo & Prazos',
        observation: 'Fila de aprovação de alçada com média histórica de 22h versus 18h disponíveis.'
      }
    ],
    // 67 a 73. Timeline de Evolução do Risco
    riskTimeline: [
      { timestamp: '2026-10-18T10:00:00Z', level: PredictiveRiskLevel.MODERATE, triggerEvent: 'Criação do Processo no Bid Lifecycle' },
      { timestamp: '2026-10-19T14:00:00Z', level: PredictiveRiskLevel.HIGH, triggerEvent: 'Prazo residual atingiu T-40h sem aprovação de preço' },
      { timestamp: '2026-10-20T10:00:00Z', level: PredictiveRiskLevel.CRITICAL, triggerEvent: 'Alçada pendente a T-18h com certidão não anexada' }
    ],
    // 137 a 142. Ação Sugerida Orientada a Processo
    suggestedMitigation: 'Escalar imediatamente a aprovação de alçada de margem junto à Diretoria Executiva e priorizar despacho da certidão de filial.',
    // 177 a 182. Controle Humano & Discordância Concorrente
    humanOverride: {
      status: HumanAssessmentStatus.DIFFERS,
      humanLevel: PredictiveRiskLevel.HIGH,
      notes: 'Diretoria agendou deliberação extraordinária para as 14h; risco operacional é alto mas intervenção está em andamento.',
      evaluatedBy: 'Carlos Eduardo (Gerência Comercial)',
      evaluatedAt: '2026-10-20T10:30:00Z'
    },
    featuresSnapshot: {
      timeToDeadlineHours: 18,
      criticalBlockersCount: 2,
      pricingGateStatus: 'PENDING_APPROVAL',
      partnerConfirmedFlag: true,
      missingCriticalDocsCount: 1
    }
  },
  {
    id: 'PRA-002',
    bidProcessId: 'PROC-RNEST-7004321234',
    canonicalCode: 'PE-RNEST-2026-004',
    title: 'Monitoramento de emissões atmosféricas em dutos e chaminés RNEST',
    companyId: 'excelencia',
    companyName: 'Excelência Ambiental',
    deadline: '2026-11-15T14:00:00Z',
    hoursToDeadline: 620,
    riskTarget: PredictiveRiskTarget.LATE_READINESS,
    riskLevel: PredictiveRiskLevel.MODERATE,
    riskTrajectory: RiskTrajectory.IMPROVING, // Melhorando!
    confidence: ConfidenceLevel.HIGH,
    dataCoveragePct: 96,
    modelVersion: 'v1.4 (MODEL-LATE-READINESS-V1)',
    generatedAt: '2026-10-20T09:00:00Z',
    validUntil: '2026-10-25T09:00:00Z',
    topDrivers: [
      {
        factor: 'Estrutura de Consórcio Formalizada',
        group: 'Estratégia de Parceiros',
        observation: 'Parceiro BioSonda com compromisso formalizado e evidências técnicas conferidas.'
      },
      {
        factor: 'Prazo Amplo para Submissão',
        group: 'Tempo & Prazos',
        observation: 'Mais de 25 dias úteis até a data de abertura do certame no portal.'
      },
      {
        factor: 'Atestados Técnicos Pré-Indexados',
        group: 'Prontidão Documental',
        observation: '100% dos requisitos de capacidade com lastro em atestados auditados no Document Vault.'
      }
    ],
    riskTimeline: [
      { timestamp: '2026-10-10T14:00:00Z', level: PredictiveRiskLevel.HIGH, triggerEvent: 'Definição da necessidade de consórcio para atestado de amostragem' },
      { timestamp: '2026-10-16T11:00:00Z', level: PredictiveRiskLevel.MODERATE, triggerEvent: 'Formalização de pré-contrato com parceiro técnico e validação de certidões' }
    ],
    suggestedMitigation: 'Manter cronograma de fechamento de proposta comercial e validar minuta final de consórcio até T-72h.',
    humanOverride: {
      status: HumanAssessmentStatus.AGREED,
      humanLevel: PredictiveRiskLevel.MODERATE,
      notes: 'Concordância plena. Processo sob controle das áreas técnica e jurídica.',
      evaluatedBy: 'Clarice Mendes (Diretoria)',
      evaluatedAt: '2026-10-18T16:00:00Z'
    },
    featuresSnapshot: {
      timeToDeadlineHours: 620,
      criticalBlockersCount: 0,
      pricingGateStatus: 'IN_PREPARATION',
      partnerConfirmedFlag: true,
      missingCriticalDocsCount: 0
    }
  },
  {
    id: 'PRA-003',
    bidProcessId: 'PROC-CAAPORA-PB-2026',
    canonicalCode: 'PB-CAAPORA-2026-088',
    title: 'Monitoramento da qualidade das águas subterrâneas em Caaporã',
    companyId: 'veeluensolutions',
    companyName: 'Veeluen Solutions',
    deadline: '2026-10-28T10:00:00Z',
    hoursToDeadline: 192,
    riskTarget: PredictiveRiskTarget.NO_SUBMISSION,
    riskLevel: PredictiveRiskLevel.HIGH,
    riskTrajectory: RiskTrajectory.STABLE,
    confidence: ConfidenceLevel.MEDIUM, // Cobertura média por conflito de datas
    dataCoveragePct: 68,
    modelVersion: 'v2.1 (MODEL-NO-SUBMISSION-V2)',
    generatedAt: '2026-10-20T10:15:00Z',
    validUntil: '2026-10-24T10:00:00Z',
    topDrivers: [
      {
        factor: 'Divergência de Prazos entre Portais',
        group: 'Qualidade da Informação',
        observation: 'Conflito ativo: PNCP indica 28/10 enquanto Portal Estadual PB indica 25/10.'
      },
      {
        factor: 'Parceiro Laboratorial Pendente de Confirmação',
        group: 'Estratégia de Parceiros',
        observation: 'Proposta de ensaios laboratoriais solicitada mas sem confirmação formal assinada.'
      },
      {
        factor: 'Falta de Definição de Responsável pela Submissão',
        group: 'Processo & Alçadas',
        observation: 'Workflow sem operador atribuído para acompanhamento da sessão de lances.'
      }
    ],
    riskTimeline: [
      { timestamp: '2026-10-18T14:00:00Z', level: PredictiveRiskLevel.HIGH, triggerEvent: 'Detecção de conflito de datas entre fontes e pendência de parceiro' }
    ],
    suggestedMitigation: 'Resolver conflito de prazo no Portal PB e obter confirmação formal de proposta do laboratório parceiro nas próximas 24h.',
    humanOverride: {
      status: HumanAssessmentStatus.NOT_REVIEWED,
      humanLevel: null,
      notes: null,
      evaluatedBy: null,
      evaluatedAt: null
    },
    featuresSnapshot: {
      timeToDeadlineHours: 192,
      criticalBlockersCount: 1,
      pricingGateStatus: 'PENDING_QUOTE',
      partnerConfirmedFlag: false,
      missingCriticalDocsCount: 0
    }
  }
];
