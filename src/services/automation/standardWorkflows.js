/**
 * VELLIA LICITAÇÕES — FASE 37
 * CATÁLOGO DOS 20 WORKFLOWS PADRÃO DO SISTEMA (Standard Workflows Library)
 * 
 * Implementação das regras de negócio descritas nos itens 29 a 86.
 */

import { DomainEventType, ActionMode, WorkflowStatus } from './domainEvents.js';

export const STANDARD_WORKFLOWS = [
  // 1. Nova Oportunidade (Itens 29 a 32)
  {
    id: 'WF-01',
    name: 'Triagem Automática de Nova Oportunidade',
    description: 'Ao ingerir oportunidade, executa deduplicação, calcula score de aderência semântica e distribui para o Radar.',
    trigger: DomainEventType.OPPORTUNITY_CREATED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.2.0',
    conditions: [
      { field: 'payload.score', operator: '>=', value: 70, label: 'Score de aderência >= 70%' }
    ],
    actions: [
      { type: 'CREATE_RADAR_ENTRY', mode: ActionMode.AUTO, label: 'Registrar Oportunidade no Radar Diário' },
      { type: 'CREATE_ALERT', mode: ActionMode.AUTO, label: 'Alertar equipe comercial sobre certame de alta relevância' },
      { type: 'ROUTE_TO_COMPANY', mode: ActionMode.AUTO, label: 'Atribuir empresa do grupo conforme escopo técnico' }
    ]
  },

  // 2. Edital Adicionado (Itens 33 a 35)
  {
    id: 'WF-02',
    name: 'Extração e Diagnóstico de Requisitos de Edital',
    description: 'Ao anexar edital, analisa o termo de referência, extrai exigências de habilitação e detecta eventuais blockers.',
    trigger: DomainEventType.DOCUMENT_UPLOADED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.1.0',
    conditions: [
      { field: 'payload.documentType', operator: '==', value: 'EDITAL', label: 'Tipo do Documento é EDITAL' }
    ],
    actions: [
      { type: 'EXTRACT_REQUIREMENTS', mode: ActionMode.AUTO, label: 'Extrair requisitos de qualificação e sanções' },
      { type: 'CHECK_DOCUMENT_BLOCKERS', mode: ActionMode.AUTO, label: 'Cruzar com o Centro de Capacidade e alertar blockers' }
    ]
  },

  // 3. Adendo de Edital (Itens 36 a 39)
  {
    id: 'WF-03',
    name: 'Tratamento de Adendo e Retificação de Edital',
    description: 'Compara a nova versão do edital com a anterior, reprocessa requisitos alterados e atualiza o calendário se o prazo mudou.',
    trigger: DomainEventType.EDITAL_UPDATED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '2.0.0',
    conditions: [],
    actions: [
      { type: 'COMPARE_EDITAL_VERSIONS', mode: ActionMode.AUTO, label: 'Gerar diff de termos e requisitos alterados' },
      { type: 'UPDATE_CALENDAR_DEADLINE', mode: ActionMode.AUTO, label: 'Atualizar data da sessão no Calendário e Sala de Guerra' },
      { type: 'CREATE_CRITICAL_ALERT', mode: ActionMode.AUTO, label: 'Notificar Bid Owner sobre adendo publicado' }
    ]
  },

  // 4. Documento Vencendo (Itens 40 a 42)
  {
    id: 'WF-04',
    name: 'Prevenção de Vencimento de Certidões & Atestados',
    description: 'Quando certidão estiver a 30 dias do vencimento, identifica propostas ativas afetadas e gera tarefa de renovação.',
    trigger: DomainEventType.DOCUMENT_EXPIRING,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.3.0',
    conditions: [
      { field: 'payload.daysUntilExpiry', operator: '<=', value: 30, label: 'Vencimento <= 30 dias' }
    ],
    actions: [
      { type: 'IDENTIFY_AFFECTED_PROPOSALS', mode: ActionMode.AUTO, label: 'Mapear propostas que dependem desta certidão' },
      { type: 'CREATE_RENEWAL_TASK', mode: ActionMode.AUTO, label: 'Criar tarefa urgente para o Administrativo' },
      { type: 'CREATE_EXPIRY_ALERT', mode: ActionMode.AUTO, label: 'Emitir alerta no Command Center' }
    ]
  },

  // 5. Documento Atualizado (Itens 43 a 45)
  {
    id: 'WF-05',
    name: 'Sincronização de Nova Certidão com Dossiês Abertos',
    description: 'Quando uma nova certidão ou atestado for aprovado, revalida automaticamente todos os dossiês abertos.',
    trigger: DomainEventType.DOCUMENT_UPLOADED,
    isCritical: false,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [
      { field: 'payload.documentType', operator: '!=', value: 'EDITAL', label: 'Documento é Certidão/Atestado/Qualificação' }
    ],
    actions: [
      { type: 'UPDATE_CAPACITY_CENTER', mode: ActionMode.AUTO, label: 'Atualizar repositório no Centro de Capacidade' },
      { type: 'RESOLVE_DOSSIER_PENDENCIES', mode: ActionMode.AUTO, label: 'Sanar pendências compatíveis em dossiês abertos' }
    ]
  },

  // 6. GO Aprovado (Itens 46 a 48)
  {
    id: 'WF-06',
    name: 'Transição Pós-Decisão GO de Participação',
    description: 'Ao confirmar GO no certame, sugere criação de proposta comercial e monta o checklist inicial de entrega.',
    trigger: DomainEventType.GO_APPROVED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.4.0',
    conditions: [],
    actions: [
      { type: 'SUGGEST_PROPOSAL_CREATION', mode: ActionMode.AUTO, label: 'Instanciar proposta comercial em elaboração' },
      { type: 'GENERATE_INITIAL_CHECKLIST', mode: ActionMode.AUTO, label: 'Atribuir tarefas da equipe técnica e financeira' }
    ]
  },

  // 7. Proposta Criada (Item 49)
  {
    id: 'WF-07',
    name: 'Vínculo Inicial de Proposta & Dossiê',
    description: 'Ao criar proposta, vincula os requisitos do edital e anexa a versão preliminar do Dossiê de Habilitação.',
    trigger: DomainEventType.PROPOSAL_CREATED,
    isCritical: false,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [],
    actions: [
      { type: 'LINK_DOSSIER_VERSION', mode: ActionMode.AUTO, label: 'Vincular Dossiê do Centro de Capacidade' },
      { type: 'CREATE_PROPOSAL_TASKS', mode: ActionMode.AUTO, label: 'Cadastrar tarefas de cotação e composição de BDI' }
    ]
  },

  // 8. Preço Pronto (Itens 50 a 52)
  {
    id: 'WF-08',
    name: 'Roteamento Regulatório de Preço & Margem',
    description: 'Quando a formação de preço estiver concluída, se a margem exigir alçada, encaminha para Governança (Fase 36).',
    trigger: DomainEventType.PRICE_READY,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.2.0',
    conditions: [],
    actions: [
      { type: 'EVALUATE_APPROVAL_POLICY', mode: ActionMode.AUTO, label: 'Avaliar alçadas por valor e margem (Fase 36)' },
      { type: 'CREATE_APPROVAL_REQUEST', mode: ActionMode.AUTO, label: 'Gerar ApprovalRequest se exigir alçada' }
    ]
  },

  // 9. Preço Aprovado (Itens 53 a 55)
  {
    id: 'WF-09',
    name: 'Desbloqueio de Etapa Comercial Pós-Aprovação',
    description: 'Ao receber sign-off de preço na governança, libera a consolidação da proposta sem disparar envio externo.',
    trigger: DomainEventType.PRICE_APPROVED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.1.0',
    conditions: [],
    actions: [
      { type: 'UNLOCK_PROPOSAL_STAGE', mode: ActionMode.AUTO, label: 'Liberar etapa de conferência final' },
      { type: 'RECORD_TIMELINE_EVENT', mode: ActionMode.AUTO, label: 'Registrar aprovação de preço na Sala de Guerra' }
    ]
  },

  // 10. Dossiê Pronto (Itens 56 a 59)
  {
    id: 'WF-10',
    name: 'Sinalização de Prontidão Global da Proposta',
    description: 'Quando o Dossiê estiver 100%, se o Preço e a Técnica também estiverem aprovados, marca READY_FOR_FINAL_REVIEW.',
    trigger: DomainEventType.DOSSIER_READY,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [
      { field: 'payload.readinessPct', operator: '==', value: 100, label: 'Prontidão Documental = 100%' }
    ],
    actions: [
      { type: 'CHECK_GLOBAL_GATE_4', mode: ActionMode.AUTO, label: 'Verificar se Gate 4 (Envio) está liberado' },
      { type: 'UPDATE_WAR_ROOM_READINESS', mode: ActionMode.AUTO, label: 'Atualizar painel da Sala de Guerra' }
    ]
  },

  // 11. Prazo Próximo (< 24h) (Itens 60 a 63)
  {
    id: 'WF-11',
    name: 'Alerta Crítico de Proposta em Risco de Deadline',
    description: 'A 24 horas do encerramento da entrega, se a proposta não estiver protocolada, aciona alerta vermelho e escala gerência.',
    trigger: DomainEventType.OPPORTUNITY_DEADLINE_CHANGED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '2.1.0',
    conditions: [
      { field: 'payload.hoursUntilDeadline', operator: '<=', value: 24, label: 'Prazo restante <= 24 horas' },
      { field: 'payload.isSubmitted', operator: '==', value: false, label: 'Proposta ainda não submetida' }
    ],
    actions: [
      { type: 'TRIGGER_RED_ALERT', mode: ActionMode.AUTO, label: 'Emitir Alerta Vermelho de SLA' },
      { type: 'ESCALATE_OWNER_MANAGER', mode: ActionMode.AUTO, label: 'Escalar Gerente de Licitações e Bid Owner' }
    ]
  },

  // 12. Submissão Registrada (Itens 64 e 65)
  {
    id: 'WF-12',
    name: 'Congelamento de Snapshots Pós-Submissão',
    description: 'Ao confirmar protocolo de envio no portal, congela snapshots imutáveis e agenda o milestone da sessão pública.',
    trigger: DomainEventType.SUBMISSION_RECORDED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [],
    actions: [
      { type: 'FREEZE_PROPOSAL_SNAPSHOTS', mode: ActionMode.AUTO, label: 'Congelar snapshots imutáveis de preço e anexos' },
      { type: 'SCHEDULE_SESSION_MILESTONE', mode: ActionMode.AUTO, label: 'Agendar sessão de lances no Calendário' }
    ]
  },

  // 13. Sessão Próxima (< 2h) (Itens 66 a 68)
  {
    id: 'WF-13',
    name: 'Briefing Operacional Pré-Disputa de Lances',
    description: '2 horas antes da sessão de disputa, monta o Session Brief na Sala de Guerra sem submeter lances automáticos.',
    trigger: DomainEventType.SESSION_UPCOMING,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.2.0',
    conditions: [],
    actions: [
      { type: 'GENERATE_SESSION_BRIEF', mode: ActionMode.AUTO, label: 'Carregar concorrentes históricos e floor price' },
      { type: 'NOTIFY_WAR_ROOM_OPERATOR', mode: ActionMode.AUTO, label: 'Notificar operador designado da Sala de Guerra' }
    ]
  },

  // 14. Diligência Recebida (Itens 69 e 70)
  {
    id: 'WF-14',
    name: 'Abertura de Tarefa Crítica para Diligência de Pregoeiro',
    description: 'Ao receber intimação de diligência ou esclarecimento, abre tarefa com prazo urgente e notifica equipe jurídica/técnica.',
    trigger: DomainEventType.DILIGENCE_CREATED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [],
    actions: [
      { type: 'CREATE_CRITICAL_DILIGENCE_TASK', mode: ActionMode.AUTO, label: 'Criar tarefa com contagem regressiva de SLA' },
      { type: 'ALERT_LEGAL_TECHNICAL', mode: ActionMode.AUTO, label: 'Alertar Responsável Técnico e Jurídico' }
    ]
  },

  // 15. Resultado Ganho (Itens 71 a 73)
  {
    id: 'WF-15',
    name: 'Preparação de Handoff Pós-Vitória',
    description: 'Ao registrar vitória no certame, sugere criação da ficha de contrato e prepara o kit de adjudicação.',
    trigger: DomainEventType.RESULT_WON,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.3.0',
    conditions: [],
    actions: [
      { type: 'PREPARE_CONTRACT_HANDOFF', mode: ActionMode.AUTO, label: 'Preparar Handoff Package da Fase 31' },
      { type: 'NOTIFY_EXECUTIVE_BOARD', mode: ActionMode.AUTO, label: 'Notificar Diretoria sobre vitória' }
    ]
  },

  // 16. Contrato Assinado (Itens 74 e 75)
  {
    id: 'WF-16',
    name: 'Ativação Operacional de Contrato Conquistado',
    description: 'Ao registrar assinatura do contrato, aciona compromissos iniciais e transfere responsabilidade para Operações.',
    trigger: DomainEventType.CONTRACT_SIGNED,
    isCritical: true,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [],
    actions: [
      { type: 'ACTIVATE_OPERATIONAL_TASKS', mode: ActionMode.AUTO, label: 'Instanciar tarefas de mobilização e seguro garantia' },
      { type: 'INIT_CONTRACT_ALERTS', mode: ActionMode.AUTO, label: 'Cadastrar alertas de vencimento da apólice' }
    ]
  },

  // 17. Contrato Vencendo (Itens 76 a 78)
  {
    id: 'WF-17',
    name: 'Radar Antecipado de Renovação de Contrato',
    description: 'A 180 e 90 dias do término de vigência contratual, emite Renewal Signal para estudo comercial antecipado.',
    trigger: DomainEventType.CONTRACT_EXPIRING,
    isCritical: false,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.1.0',
    conditions: [
      { field: 'payload.daysUntilExpiry', operator: '<=', value: 180, label: 'Término em <= 180 dias' }
    ],
    actions: [
      { type: 'CREATE_RENEWAL_SIGNAL', mode: ActionMode.AUTO, label: 'Alimentar o Radar Antecipado com sinal de renovação' },
      { type: 'SUGGEST_ACCOUNT_PLAN', mode: ActionMode.AUTO, label: 'Sugerir reunião de relacionamento com o fiscal' }
    ]
  },

  // 18. Contato Respondeu (Itens 79 a 81)
  {
    id: 'WF-18',
    name: 'Atualização de Timeline de CRM por Resposta',
    description: 'Ao receber resposta de contato de órgão ou cliente, encerra o follow-up pendente e atualiza a timeline comercial.',
    trigger: DomainEventType.CONTACT_REPLIED,
    isCritical: false,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [],
    actions: [
      { type: 'CLOSE_PENDING_FOLLOWUP', mode: ActionMode.AUTO, label: 'Encerrar tarefa de follow-up em aberto' },
      { type: 'LOG_CRM_INTERACTION', mode: ActionMode.AUTO, label: 'Registrar interação na timeline da Organização' }
    ]
  },

  // 19. Follow-up Atrasado (Itens 82 e 83)
  {
    id: 'WF-19',
    name: 'Escalação de Follow-up Comercial em Atraso',
    description: 'Identifica follow-up comercial vencido há mais de 48h e prioriza na pauta, respeitando flags de "Do Not Contact".',
    trigger: DomainEventType.FOLLOWUP_OVERDUE,
    isCritical: false,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [
      { field: 'payload.doNotContact', operator: '!=', value: true, label: 'Cliente NÃO está marcado como Do Not Contact' }
    ],
    actions: [
      { type: 'ESCALATE_COMMERCIAL_TASK', mode: ActionMode.AUTO, label: 'Elevar prioridade da tarefa para Alta' },
      { type: 'NOTIFY_ACCOUNT_OWNER', mode: ActionMode.AUTO, label: 'Notificar responsável pela conta no CRM' }
    ]
  },

  // 20. Reunião Concluída (Itens 84 a 86)
  {
    id: 'WF-20',
    name: 'Cobrança de Ata Pós-Reunião Comercial',
    description: 'Após encerramento de reunião de relacionamento, gera prompt para o usuário registrar o resultado e sugere próximo passo.',
    trigger: DomainEventType.MEETING_COMPLETED,
    isCritical: false,
    companyId: 'GLOBAL',
    status: WorkflowStatus.ACTIVE,
    version: '1.0.0',
    conditions: [],
    actions: [
      { type: 'REQUEST_MEETING_DEBRIEF', mode: ActionMode.AUTO, label: 'Solicitar registro dos pontos acordados' },
      { type: 'SUGGEST_NEXT_BEST_ACTION', mode: ActionMode.AUTO, label: 'Chamar motor prescritivo da Fase 33' }
    ]
  }
];
