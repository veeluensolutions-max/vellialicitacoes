/**
 * VELLIA LICITAÇÕES — FASE 50
 * REGISTRO CENTRAL DE AGENTES CONSOLIDADOS (5 AGENTES CANÔNICOS)
 * 
 * Atende estritamente às Seções 86 a 90 da Fase 50:
 * "Consolidar agentes. Evitar 15 agentes pequenos ou multiagent teatral."
 * Agentes Canônicos Finais:
 * 1. Radar Agent (Descoberta, monitoramento e triagem de certames)
 * 2. Document Agent (Editais, requisitos, conformidade de atestados e dossiê)
 * 3. Commercial Agent (Precificação, BDI, cotações com fornecedores e propostas)
 * 4. Contract Agent (Handoff pós-vitória, acompanhamento de vigência, garantias e SLAs)
 * 5. System Agent (Governança, automações orientadas a eventos, trilha LGPD e segurança)
 */

export const AutonomyLevel = {
  LEVEL_0_MANUAL: 0, // Manual: Usuário executa tudo
  LEVEL_1_ASSIST: 1, // Assist: Sistema apenas recomenda
  LEVEL_2_PREPARE: 2, // Prepare: Sistema prepara minuta/análise; usuário confirma
  LEVEL_3_EXECUTE_INTERNAL: 3, // Execute Internal: Sistema executa ações internas seguras (tarefas, alertas, status)
  LEVEL_4_EXECUTE_EXTERNAL_WITH_APPROVAL: 4 // Execute External: Prepara ação externa e exige aprovação formal
};

export const AutonomyLevelLabels = {
  [AutonomyLevel.LEVEL_0_MANUAL]: 'Nível 0 — Manual (Usuário executa tudo)',
  [AutonomyLevel.LEVEL_1_ASSIST]: 'Nível 1 — Assistência (Recomendações)',
  [AutonomyLevel.LEVEL_2_PREPARE]: 'Nível 2 — Preparação (Usuário confirma)',
  [AutonomyLevel.LEVEL_3_EXECUTE_INTERNAL]: 'Nível 3 — Ações Internas Seguras (Automático)',
  [AutonomyLevel.LEVEL_4_EXECUTE_EXTERNAL_WITH_APPROVAL]: 'Nível 4 — Ação Externa com Aprovação Formal'
};

export const AgentOperationalStatus = {
  OPERATIONAL: 'OPERACIONAL',
  ATTENTION: 'ATENÇÃO',
  INTERVENTION_NEEDED: 'INTERVENÇÃO NECESSÁRIA',
  PAUSED: 'PAUSADO'
};

export const ExecutionStatus = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  WAITING_FOR_HUMAN: 'WAITING_FOR_HUMAN',
  COMPLETED: 'COMPLETED',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};

/**
 * HARD SAFETY LIMITS (Seção 125: Automation with Guardrails)
 * Ações que NUNCA podem ser executadas de forma 100% autônoma pelo sistema.
 */
export const HARD_SAFETY_LIMITS = [
  'Enviar proposta comercial final no portal público sem autorização humana expressa',
  'Submeter lance em sessão pública de pregão (Auto-bid terminantemente vedado)',
  'Aceitar cláusula contratual ou editalícia com renúncia ou assunção de penalidades sem parecer',
  'Realizar Override de Floor Price ou Blocker documental sem alçada de Diretoria',
  'Assinar digitalmente contrato, termo aditivo ou procuração jurídica',
  'Tomar decisão final de Go/No-Go sem confirmação da equipe deliberativa'
];

/**
 * Os 5 Agentes Canônicos Oficiais do Vellia 2.0 (Fase 50 - Itens 88 e 89)
 */
export const INITIAL_AGENT_REGISTRY = [
  {
    id: 'RADAR_AGENT',
    name: 'Radar Agent',
    fullName: 'Radar & Discovery Agent',
    description: 'Monitora continuamente PNCP, Compras.gov e Petronect, deduplica certames e calcula aderência semântica preliminar.',
    responsibility: 'Captura contínua de oportunidades, classificação de escopo e alimentação do Radar Diário e Antecipado.',
    companyScope: 'GLOBAL',
    status: AgentOperationalStatus.OPERATIONAL,
    autonomyLevel: AutonomyLevel.LEVEL_3_EXECUTE_INTERNAL,
    version: '2.5.0',
    lastExecution: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    nextExecution: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    dependencies: ['PNCP Connector', 'Petronect API', 'Semantic Engine', 'Deduplication Service'],
    capabilities: {
      canDoAlone: ['Buscar oportunidades públicas', 'Normalizar dados de certames', 'Calcular score semântico', 'Emitir alertas de novidades'],
      requiresConfirmation: ['Criar proposta inicial', 'Descartar oportunidade com score limítrofe'],
      strictlyProhibited: ['Decisão final de Go/No-Go', 'Submissão externa']
    }
  },
  {
    id: 'DOCUMENT_AGENT',
    name: 'Document Agent',
    fullName: 'Document & Dossier Agent',
    description: 'Processa editais com IA estruturada, extrai requisitos de qualificação técnica e audita atestados no Centro de Capacidade.',
    responsibility: 'Extração automatizada de exigências editalícias, auditoria de blockers e montagem do Dossiê de Habilitação.',
    companyScope: 'GLOBAL',
    status: AgentOperationalStatus.OPERATIONAL,
    autonomyLevel: AutonomyLevel.LEVEL_3_EXECUTE_INTERNAL,
    version: '2.5.0',
    lastExecution: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    nextExecution: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
    dependencies: ['Document Vault', 'Capacidade & Atestados CAT', 'Requirement Extractor'],
    capabilities: {
      canDoAlone: ['Extrair requisitos editalícios', 'Cruzar atestados e certidões', 'Calcular prontidão do dossiê'],
      requiresConfirmation: ['Solicitar renovação de certidão a terceiros', 'Aprovar exceção de documento com restrição'],
      strictlyProhibited: ['Ignorar blocker documental sem alçada formal', 'Assinar declarações']
    }
  },
  {
    id: 'COMMERCIAL_AGENT',
    name: 'Commercial Agent',
    fullName: 'Commercial & Pricing Agent',
    description: 'Consolida estratégia de precificação, BDI, cotações com fornecedores, análise de concorrentes e histórico regional.',
    responsibility: 'Simulação de sensibilidade de margem, proteção de Floor Price, acompanhamento de contas CRM e propostas.',
    companyScope: 'GLOBAL',
    status: AgentOperationalStatus.OPERATIONAL,
    autonomyLevel: AutonomyLevel.LEVEL_2_PREPARE,
    version: '2.5.0',
    lastExecution: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    nextExecution: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    dependencies: ['Pricing History Store', 'Supplier Quotes Service', 'CRM Store', 'Approval Engine'],
    capabilities: {
      canDoAlone: ['Calcular mediana observada e dispersão', 'Sinalizar risco de floor price', 'Detectar gaps de contato no CRM'],
      requiresConfirmation: ['Sugerir preço comercial final', 'Submeter proposta para alçada de governança'],
      strictlyProhibited: ['Aprovar margem abaixo do piso sem alçada', 'Enviar proposta com preço predatório']
    }
  },
  {
    id: 'CONTRACT_AGENT',
    name: 'Contract Agent',
    fullName: 'Contract & Performance Agent',
    description: 'Supervisiona a execução pós-vitória, monitora SLAs, garantias, prazos de renovação e gera atestados de performance (Closed-Loop).',
    responsibility: 'Handoff de contratos ganhos, prevenção de penalidades, acompanhamento de vigências e emissão de lições aprendidas.',
    companyScope: 'GLOBAL',
    status: AgentOperationalStatus.OPERATIONAL,
    autonomyLevel: AutonomyLevel.LEVEL_3_EXECUTE_INTERNAL,
    version: '2.5.0',
    lastExecution: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    nextExecution: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    dependencies: ['Contract Store', 'Performance Evaluation Service', 'Renewal Signals Engine'],
    capabilities: {
      canDoAlone: ['Monitorar prazos de vigência e garantias', 'Emitir alertas prévios de vencimento', 'Catalogar lições aprendidas'],
      requiresConfirmation: ['Sugerir aditivo de prazo ou reajuste de valor', 'Recomendar plano de ação corretivo'],
      strictlyProhibited: ['Firmar aditivos contratuais', 'Renovar contratos sem parecer jurídico']
    }
  },
  {
    id: 'SYSTEM_AGENT',
    name: 'System Agent',
    fullName: 'System & Governance Agent',
    description: 'Orquestra a esteira orientada a eventos, garante integridade de trilhas LGPD, conformidade de políticas e segurança operacional.',
    responsibility: 'Orquestração de workflows, trilha imutável de auditoria, monitoramento de saúde do sistema e observabilidade.',
    companyScope: 'GLOBAL',
    status: AgentOperationalStatus.OPERATIONAL,
    autonomyLevel: AutonomyLevel.LEVEL_3_EXECUTE_INTERNAL,
    version: '2.5.0',
    lastExecution: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    nextExecution: 'Event-driven (Tempo real)',
    dependencies: ['Event Bus', 'Audit Service', 'Security Policy Engine', 'Task Scheduler'],
    capabilities: {
      canDoAlone: ['Criar tarefas internas e atualizar status', 'Registrar logs imutáveis', 'Emitir alertas de degradação técnica'],
      requiresConfirmation: ['Escalação de governança para diretoria', 'Abertura de ApprovalRequest'],
      strictlyProhibited: ['Burlar matriz RBAC e alçadas de governança', 'Submissão de dados sem trilha']
    }
  }
];
