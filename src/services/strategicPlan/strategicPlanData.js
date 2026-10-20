/**
 * VELLIA LICITAÇÕES — FASE 70: STRATEGIC PLANNING + ANNUAL OPERATING PLAN 2.0
 * strategicPlanData.js: Dados Canônicos dos Planos Estratégicos Vivos para 2026
 */

import {
  PlanStatus,
  ObjectiveType,
  TargetType,
  TargetSource,
  AssumptionStatus,
  StrategicRiskCategory,
  PlanHealthStatus,
  StrategicBoundaryType,
  AlignmentCategory
} from './strategicPlanModels.js';

export const initialStrategicPlans = [
  {
    id: 'PLAN-2026-VEELUEN',
    companyId: 'veeluen',
    year: 2026,
    name: 'Plano Operacional Anual 2026 — Veeluen Solutions',
    status: PlanStatus.APPROVED,
    version: '1.0',
    createdAt: '2026-01-10T09:00:00Z',
    approvedAt: '2026-01-20T14:30:00Z',
    approvedBy: 'Diretoria Executiva Veeluen (Conselho)',
    reviewCadence: 'QBR (Quarterly Business Review)',
    strategicDirection: 'Consolidar liderança em Engenharia Diagnóstica e Monitoramento de Emissões no Nordeste e expandir presença na cadeia de Óleo, Gás e Energia.',
    
    // 3-5 Objetivos Estratégicos Canônicos
    objectives: [
      {
        id: 'OBJ-VLU-01',
        title: 'Expandir atuação em Emissões Atmosféricas e Medição FTIR',
        description: 'Ampliar a participação em certames industriais de alta complexidade com capacidade analítica própria.',
        type: ObjectiveType.CAPABILITY,
        owner: 'Diretoria de Operações & Engenharia',
        priority: 'ALTA',
        status: 'EM_ANDAMENTO',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        healthStatus: PlanHealthStatus.ATTENTION,
        healthReason: 'Pipeline qualificado atinge 58% da meta anual; investimento em equipamento FTIR aguarda aprovação final.',
        relatedInvestmentCaseId: 'EXP-2026-001',
        priorityAreas: {
          services: ['Emissões Atmosféricas', 'Isocinética de Gases'],
          regions: ['PE', 'BA'],
          buyers: ['Petrobras', 'Acelen', 'Braskem']
        },
        targets: [
          {
            id: 'TGT-VLU-01-A',
            metric: 'Pipeline Qualificado de Emissões',
            type: TargetType.QUALIFIED_PIPELINE_TARGET,
            targetValue: 8000000,
            unit: 'BRL',
            currentValue: 4640000,
            period: 'Anual (2026)',
            baseline: 3200000,
            status: 'GAP_SIGNIFICATIVO',
            source: TargetSource.STRATEGIC_DECISION,
            isFinancial: true
          },
          {
            id: 'TGT-VLU-01-B',
            metric: 'Certames Qualificados Submetidos',
            type: TargetType.MARKET_TARGET,
            targetValue: 8,
            unit: 'propostas',
            currentValue: 5,
            period: 'Anual (2026)',
            baseline: 3,
            status: 'EM_TRAJETORIA',
            source: TargetSource.HISTORICAL_BENCHMARK,
            isFinancial: false
          }
        ]
      },
      {
        id: 'OBJ-VLU-02',
        title: 'Aumentar presença em Compradores Logísticos e Portuários',
        description: 'Expandir a carteira em infraestrutura portuária e terminais de granéis líquidos em Suape e Aratu.',
        type: ObjectiveType.MARKET,
        owner: 'Gerência Comercial Industrial',
        priority: 'ALTA',
        status: 'EM_ANDAMENTO',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        healthStatus: PlanHealthStatus.ON_TRACK,
        healthReason: 'Demanda observada consistente e cobertura de pipeline de 84% com contratos âncora vigentes.',
        relatedInvestmentCaseId: null,
        priorityAreas: {
          services: ['Inspeção NR-13', 'Manutenção Industrial'],
          regions: ['PE', 'BA'],
          buyers: ['Suape', 'Transpetro', 'Tecon Suape']
        },
        targets: [
          {
            id: 'TGT-VLU-02-A',
            metric: 'Pipeline Qualificado Portuário',
            type: TargetType.QUALIFIED_PIPELINE_TARGET,
            targetValue: 6500000,
            unit: 'BRL',
            currentValue: 5460000,
            period: 'Anual (2026)',
            baseline: 4100000,
            status: 'ON_TRACK',
            source: TargetSource.MANUAL_EXECUTIVE,
            isFinancial: true
          }
        ]
      },
      {
        id: 'OBJ-VLU-03',
        title: 'Fortalecer Capacidade Técnica Própria em Caldeiras e NR-13',
        description: 'Desenvolver especialistas internos para eliminar subcontratação emergencial em paradas programadas.',
        type: ObjectiveType.CAPABILITY,
        owner: 'Gerência Técnica Operacional',
        priority: 'MEDIA',
        status: 'EM_ANDAMENTO',
        startDate: '2026-02-01',
        endDate: '2026-11-30',
        healthStatus: PlanHealthStatus.ON_TRACK,
        healthReason: 'Programa de qualificação de 2 engenheiros em andamento dentro do cronograma.',
        relatedInvestmentCaseId: 'EXP-2026-003',
        priorityAreas: {
          services: ['Inspeção NR-13', 'Ensaios Não-Destrutivos (END)'],
          regions: ['PE', 'AL', 'SE'],
          buyers: ['Usinas Sucroalcooleiras', 'Refinarias']
        },
        targets: [
          {
            id: 'TGT-VLU-03-A',
            metric: 'Engenheiros Certificados NR-13',
            type: TargetType.CAPABILITY_TARGET,
            targetValue: 2,
            unit: 'profissionais',
            currentValue: 1,
            period: '2026',
            baseline: 0,
            status: 'EM_TRAJETORIA',
            source: TargetSource.STRATEGIC_DECISION,
            isFinancial: false
          }
        ]
      },
      {
        id: 'OBJ-VLU-04',
        title: 'Reduzir Dependência de Parceiros Críticos de Instrumentação',
        description: 'Internalizar medição direta em projetos com margem apertada para preservar retorno financeiro.',
        type: ObjectiveType.PROCESS,
        owner: 'Gerência de Suprimentos & Parcerias',
        priority: 'MEDIA',
        status: 'EM_ANDAMENTO',
        startDate: '2026-03-01',
        endDate: '2026-12-31',
        healthStatus: PlanHealthStatus.ATTENTION,
        healthReason: 'Dependência de locador externo gerou atraso em 2 cotações no trimestre.',
        relatedInvestmentCaseId: 'EXP-2026-001',
        priorityAreas: {
          services: ['Emissões Atmosféricas', 'Análise Instrumental'],
          regions: ['PE'],
          buyers: ['Petrobras']
        },
        targets: [
          {
            id: 'TGT-VLU-04-A',
            metric: 'Índice de Execução Própria vs Externa',
            type: TargetType.PROCESS_TARGET,
            targetValue: 80,
            unit: '%',
            currentValue: 55,
            period: 'Anual (2026)',
            baseline: 45,
            status: 'GAP_SIGNIFICATIVO',
            source: TargetSource.STRATEGIC_DECISION,
            isFinancial: false
          }
        ]
      }
    ],

    // Premissas Estratégicas (com renovação contratual como assumption, não fato garantido)
    assumptions: [
      {
        id: 'ASSUMP-VLU-01',
        statement: 'Demanda industrial por monitoramento contínuo de emissões na RNEST e Suape permanecerá aquecida no segundo semestre de 2026.',
        category: 'Market Demand',
        status: AssumptionStatus.CONFIRMED,
        reviewDate: '2026-04-15',
        notes: 'Confirmado por 6 novos editais e consultas prévias publicadas no portal da Petrobras.'
      },
      {
        id: 'ASSUMP-VLU-02',
        statement: 'Contrato âncora RNEST-0891 de Manutenção Eletromecânica será renovado em Julho/2026 sem redução de escopo.',
        category: 'Contract Renewal',
        status: AssumptionStatus.OPEN,
        reviewDate: '2026-05-10',
        notes: 'Renovação é uma premissa de alto impacto financeiro; fiscal sinalizou interesse mas termo aditivo ainda em tramitação interna.'
      },
      {
        id: 'ASSUMP-VLU-03',
        statement: 'Custos de aquisição de analisador FTIR não sofrerão variação cambial acima de 8% até a aprovação formal do investimento.',
        category: 'Investment Cost',
        status: AssumptionStatus.PARTIALLY_CONFIRMED,
        reviewDate: '2026-03-30',
        notes: 'Cotação de fornecedor válida até fim de maio; risco cambial moderado.'
      }
    ],

    // Iniciativas Estratégicas Materiais (Poucas e objetivas)
    initiatives: [
      {
        id: 'INI-VLU-01',
        objectiveId: 'OBJ-VLU-01',
        title: 'Homologação Técnica de Fornecedores e Cotação Definitiva de Espectrômetro FTIR',
        owner: 'Engenharia Analítica',
        status: 'Active',
        targetDate: '2026-05-15',
        relatedEntities: ['EXP-2026-001', 'Petrobras RNEST']
      },
      {
        id: 'INI-VLU-02',
        objectiveId: 'OBJ-VLU-02',
        title: 'Mapeamento de Editais Antecipados (PCA) nos Portos de Suape e Aratu',
        owner: 'Comercial Estratégico',
        status: 'Active',
        targetDate: '2026-06-30',
        relatedEntities: ['Suape', 'Transpetro']
      },
      {
        id: 'INI-VLU-03',
        objectiveId: 'OBJ-VLU-03',
        title: 'Conclusão do Módulo 2 de Qualificação em Vasos de Pressão e Caldeiras',
        owner: 'Recursos Humanos & Engenharia',
        status: 'Active',
        targetDate: '2026-07-20',
        relatedEntities: ['Eng. Carlos Menezes', 'CREA-PE']
      }
    ],

    // Plano de Pipeline por Trimestre
    quarterlyPipelinePlan: {
      Q1: {
        qualifiedPipeline: 4200000,
        commit: 2100000,
        bestCase: 6300000,
        targetCoveragePct: 88,
        strategicOpportunitiesCount: 4
      },
      Q2: {
        qualifiedPipeline: 3800000,
        commit: 1800000,
        bestCase: 5900000,
        targetCoveragePct: 76,
        strategicOpportunitiesCount: 3
      },
      Q3: {
        qualifiedPipeline: 3100000,
        commit: 1200000,
        bestCase: 5200000,
        targetCoveragePct: 62,
        strategicOpportunitiesCount: 2
      },
      Q4: {
        qualifiedPipeline: 2900000,
        commit: 900000,
        bestCase: 4800000,
        targetCoveragePct: 58,
        strategicOpportunitiesCount: 2
      }
    },

    // Riscos Estratégicos que podem comprometer o plano
    strategicRisks: [
      {
        id: 'SRSK-VLU-01',
        title: 'Atraso na Deliberação de Compra do FTIR ameaça 2 certames de Q3',
        category: StrategicRiskCategory.CAPACITY,
        impact: 'ALTO',
        probability: 'MEDIA',
        mitigation: 'Pré-reserva de locação externa condicionada para mitigar risco de não-participação.',
        relatedObjectiveId: 'OBJ-VLU-01'
      },
      {
        id: 'SRSK-VLU-02',
        title: 'Concentração de 42% da Receita Contratual em único comprador (Petrobras)',
        category: StrategicRiskCategory.CONTRACT,
        impact: 'ALTO',
        probability: 'BAIXA',
        mitigation: 'Aceleração da prospecção nos portos privados e indústrias químicas de Camaçari.',
        relatedObjectiveId: 'OBJ-VLU-02'
      },
      {
        id: 'SRSK-VLU-03',
        title: 'Desvio Estratégico (Strategy Drift) em Oportunidades Civis Menores',
        category: StrategicRiskCategory.PIPELINE,
        impact: 'MEDIO',
        probability: 'MEDIA',
        mitigation: 'Filtro de alinhamento estratégico obrigatório no Go/No-Go com alçada para certames > R$ 500k.',
        relatedObjectiveId: 'OBJ-VLU-01'
      }
    ],

    // Fronteiras Estratégicas (Boundaries)
    boundaries: {
      [StrategicBoundaryType.PURSUUE]: [
        'Monitoramento de Emissões Atmosféricas e Gases Industriais',
        'Inspeção Técnica de Caldeiras e Vasos de Pressão (NR-13)',
        'Operação de Estações de Tratamento de Efluentes em Polos Industriais'
      ],
      [StrategicBoundaryType.SELECTIVELY_PURSUE]: [
        'Obras Civis de Reforma em Unidades Operacionais (Apenas com margem > 18%)',
        'Licitações fora de PE/BA/AL (Apenas se cliente for conta estratégica)'
      ],
      [StrategicBoundaryType.DO_NOT_PURSUE]: [
        'Fornecimento puro de materiais sem serviço técnico de engenharia',
        'Locação simples de caminhão vácuo sem operação técnica própria'
      ]
    },

    // Balanceamento Estratégico do Portfólio
    strategicBalance: {
      core: 70,       // 70%
      growth: 25,     // 25%
      experimental: 5 // 5%
    },

    // Histórico de Revisões do Plano
    revisionHistory: [
      {
        version: '1.0',
        date: '2026-01-20',
        author: 'Diretoria Executiva',
        reason: 'Aprovação formal do Plano Operacional Anual 2026'
      }
    ]
  },

  {
    id: 'PLAN-2026-EXCELENCIA',
    companyId: 'excelencia',
    year: 2026,
    name: 'Plano Operacional Anual 2026 — Excelência Ambiental',
    status: PlanStatus.APPROVED,
    version: '1.0',
    createdAt: '2026-01-12T10:00:00Z',
    approvedAt: '2026-01-22T16:00:00Z',
    approvedBy: 'Conselho Consultivo Excelência',
    reviewCadence: 'QBR (Quarterly Business Review)',
    strategicDirection: 'Consolidar operação de saneamento e tratamento de efluentes no Sudeste e expandir serviços analíticos ambientais para companhias estaduais de saneamento.',

    objectives: [
      {
        id: 'OBJ-EXC-01',
        title: 'Ampliar Contratos de Operação de ETEs na Região Metropolitana de SP',
        description: 'Conquistar novas concessões e contratos de operação contínua com Sabesp e consórcios municipais.',
        type: ObjectiveType.GROWTH,
        owner: 'Gerência Operacional SP',
        priority: 'ALTA',
        status: 'EM_ANDAMENTO',
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        healthStatus: PlanHealthStatus.ON_TRACK,
        healthReason: 'Pipeline qualificado de R$ 9.2M cobre 92% da meta com alta aderência técnica.',
        relatedInvestmentCaseId: null,
        priorityAreas: {
          services: ['Operação de ETE', 'Tratamento de Lodo'],
          regions: ['SP'],
          buyers: ['Sabesp', 'Sanasa', 'DAAE']
        },
        targets: [
          {
            id: 'TGT-EXC-01-A',
            metric: 'Pipeline Qualificado de Saneamento SP',
            type: TargetType.QUALIFIED_PIPELINE_TARGET,
            targetValue: 10000000,
            unit: 'BRL',
            currentValue: 9200000,
            period: 'Anual (2026)',
            baseline: 7500000,
            status: 'ON_TRACK',
            source: TargetSource.STRATEGIC_DECISION,
            isFinancial: true
          }
        ]
      },
      {
        id: 'OBJ-EXC-02',
        title: 'Acreditação Inmetro ISO 17025 para Laboratório de Ensaios Físico-Químicos',
        description: 'Internalizar análises de conformidade microbiológica e orgânica para reduzir custo laboratorial terceiro.',
        type: ObjectiveType.CAPABILITY,
        owner: 'Coordenação Laboratorial',
        priority: 'ALTA',
        status: 'EM_ANDAMENTO',
        startDate: '2026-02-01',
        endDate: '2026-10-31',
        healthStatus: PlanHealthStatus.ON_TRACK,
        healthReason: 'Auditoria documental interna concluída; inspeção formal agendada para Q3.',
        relatedInvestmentCaseId: 'EXP-2026-002',
        priorityAreas: {
          services: ['Laboratório de Efluentes', 'Análise de Água'],
          regions: ['SP', 'MG'],
          buyers: ['Sabesp', 'Indústrias Farmacêuticas']
        },
        targets: [
          {
            id: 'TGT-EXC-02-A',
            metric: 'Parâmetros Acreditados ISO 17025',
            type: TargetType.CAPABILITY_TARGET,
            targetValue: 24,
            unit: 'ensaios',
            currentValue: 18,
            period: '2026',
            baseline: 12,
            status: 'EM_TRAJETORIA',
            source: TargetSource.STRATEGIC_DECISION,
            isFinancial: false
          }
        ]
      }
    ],

    assumptions: [
      {
        id: 'ASSUMP-EXC-01',
        statement: 'Contrato de Operação ETE Barueri (Sabesp) manterá execução sem penalidades e aditivo de 12 meses será formalizado.',
        category: 'Contract Renewal',
        status: AssumptionStatus.CONFIRMED,
        reviewDate: '2026-04-10',
        notes: 'Avaliação de desempenho do fiscal registrou nota 9.8/10 no primeiro trimestre.'
      }
    ],

    initiatives: [
      {
        id: 'INI-EXC-01',
        objectiveId: 'OBJ-EXC-01',
        title: 'Elaboração do Plano de Mobilização para Pregão Sabesp Guarulhos',
        owner: 'Coordenação Técnica',
        status: 'Active',
        targetDate: '2026-05-30',
        relatedEntities: ['Sabesp', 'Pregão 2026-0902']
      }
    ],

    quarterlyPipelinePlan: {
      Q1: { qualifiedPipeline: 5100000, commit: 3200000, bestCase: 7000000, targetCoveragePct: 92, strategicOpportunitiesCount: 3 },
      Q2: { qualifiedPipeline: 4600000, commit: 2800000, bestCase: 6500000, targetCoveragePct: 88, strategicOpportunitiesCount: 3 },
      Q3: { qualifiedPipeline: 3900000, commit: 2100000, bestCase: 5800000, targetCoveragePct: 78, strategicOpportunitiesCount: 2 },
      Q4: { qualifiedPipeline: 3400000, commit: 1800000, bestCase: 5200000, targetCoveragePct: 72, strategicOpportunitiesCount: 2 }
    },

    strategicRisks: [
      {
        id: 'SRSK-EXC-01',
        title: 'Dependência de fornecedor químico de coagulantes com reajuste previsto',
        category: StrategicRiskCategory.FINANCIAL_PIPELINE,
        impact: 'MEDIO',
        probability: 'ALTA',
        mitigation: 'Qualificação de segundo fornecedor em Campinas para compras em lote.',
        relatedObjectiveId: 'OBJ-EXC-01'
      }
    ],

    boundaries: {
      [StrategicBoundaryType.PURSUUE]: [
        'Operação e Manutenção de Estações de Tratamento de Efluentes (ETE/ETA)',
        'Análises Laboratoriais e Monitoramento de Qualidade da Água'
      ],
      [StrategicBoundaryType.SELECTIVELY_PURSUE]: [
        'Desassoreamento de lagoas e dragagem ambiental'
      ],
      [StrategicBoundaryType.DO_NOT_PURSUE]: [
        'Varrição pública municipal e coleta de lixo urbano comum'
      ]
    },

    strategicBalance: {
      core: 75,
      growth: 20,
      experimental: 5
    },

    revisionHistory: [
      {
        version: '1.0',
        date: '2026-01-22',
        author: 'Conselho Consultivo',
        reason: 'Homologação do Plano Operacional 2026'
      }
    ]
  }
];
