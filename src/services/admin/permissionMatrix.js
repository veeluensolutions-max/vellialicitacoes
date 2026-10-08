/**
 * VELLIA LICITAÇÕES — FASE 14: ADMINISTRAÇÃO E SEGURANÇA
 * permissionMatrix.js: Permissões Granulares, Perfis Padrão e Escopos de Empresa
 * 
 * Itens 2 a 12: Perfis de acesso padrão, permissões granulares, escopo por empresa
 * e classificação de confidencialidade de documentos.
 */

// 3. Status do Usuário
export const UserStatus = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  BLOQUEADO: 'BLOQUEADO',
  CONVITE_PENDENTE: 'CONVITE PENDENTE'
};

// 4. Perfis Padrão de Acesso
export const UserRole = {
  ADMINISTRADOR: 'Administrador',
  GESTAO: 'Gestão',
  LICITACOES: 'Licitações',
  COMERCIAL: 'Comercial',
  TECNICO: 'Técnico',
  FINANCEIRO: 'Financeiro',
  VISUALIZADOR: 'Visualizador'
};

// 9. Escopos de Acesso por Empresa
export const CompanyScope = {
  ALL_COMPANIES: 'ALL_COMPANIES',               // Ambas as empresas (Excelência Ambiental e Veeluen Solutions)
  OWN_COMPANY: 'OWN_COMPANY',                   // Apenas a empresa principal vinculada
  SELECTED_COMPANIES: 'SELECTED_COMPANIES'       // Empresas especificadas na lista do usuário
};

// 11. Classificação de Confidencialidade de Documentos
export const DocumentConfidentiality = {
  PUBLICO_INTERNO: 'Público interno',
  RESTRITO: 'Restrito',
  CONFIDENCIAL: 'Confidencial'
};

// 5. Permissões Granulares do Ecossistema
export const Permissions = {
  // Oportunidades
  OPPORTUNITY_VIEW: 'opportunity.view',
  OPPORTUNITY_CREATE: 'opportunity.create',
  OPPORTUNITY_EDIT: 'opportunity.edit',
  OPPORTUNITY_DELETE: 'opportunity.delete',
  
  // Decisão e Go/No-Go
  DECISION_VIEW: 'decision.view',
  DECISION_APPLY: 'decision.apply',
  
  // Propostas
  PROPOSAL_VIEW: 'proposal.view',
  PROPOSAL_CREATE: 'proposal.create',
  PROPOSAL_EDIT: 'proposal.edit',
  PROPOSAL_APPROVE: 'proposal.approve',
  PROPOSAL_SUBMIT: 'proposal.submit',
  
  // Financeiro & Preços (Itens 10, 76)
  PRICING_VIEW: 'pricing.view',
  PRICING_EDIT: 'pricing.edit',
  MARGIN_VIEW: 'margin.view',
  FINANCIAL_SENSITIVE_VIEW: 'financial.sensitive.view', // Custos, BDI, Margem líquida
  
  // Documentos & Atestados (Itens 11, 12, 78)
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_CONFIDENTIAL_VIEW: 'documents.confidential.view', // Visualizar docs confidenciais
  
  // Concorrentes & Inteligência
  COMPETITORS_VIEW: 'competitors.view',
  COMPETITORS_MANAGE: 'competitors.manage',
  RESULTS_VIEW: 'results.view',
  RESULTS_MANAGE: 'results.manage',
  
  // Vellia Copilot
  COPILOT_USE: 'copilot.use',

  // CRM de Relacionamento (Fase 17: Item 68)
  CRM_ORGANIZATION_VIEW: 'crm.organization.view',
  CRM_ORGANIZATION_EDIT: 'crm.organization.edit',
  CRM_CONTACT_VIEW: 'crm.contact.view',
  CRM_CONTACT_EDIT: 'crm.contact.edit',
  CRM_INTERACTION_CREATE: 'crm.interaction.create',
  CRM_FOLLOWUP_MANAGE: 'crm.followup.manage',
  CRM_PIPELINE_MANAGE: 'crm.pipeline.manage',

  // Automação de Comunicação & Follow-up Assistido (Fase 18: Item 55)
  COMMUNICATIONS_VIEW: 'communications.view',
  COMMUNICATIONS_CREATE: 'communications.create',
  COMMUNICATIONS_APPROVE: 'communications.approve',
  COMMUNICATIONS_SEND: 'communications.send',
  COMMUNICATIONS_TEMPLATES_MANAGE: 'communications.templates.manage',

  // Integrações Reais de E-mail & Calendário (Fase 19: Item 70)
  EMAIL_CONNECT: 'email.connect',
  EMAIL_READ: 'email.read',
  EMAIL_SEND: 'email.send',
  EMAIL_MANAGE: 'email.manage',
  CALENDAR_CONNECT: 'calendar.connect',
  CALENDAR_READ: 'calendar.read',
  CALENDAR_CREATE: 'calendar.create',
  CALENDAR_EDIT: 'calendar.edit',
  
  // Administração & Sistema (Itens 1 a 6)
  ADMIN_USERS: 'admin.users',
  ADMIN_PERMISSIONS: 'admin.permissions',
  ADMIN_SECURITY: 'admin.security',
  ADMIN_AUDIT: 'admin.audit',
  ADMIN_BACKUP: 'admin.backup',
  ADMIN_INTEGRATIONS: 'admin.integrations',
  ADMIN_SETTINGS: 'admin.settings',

  // Centro de Comando Executivo & Forecast (Fase 20: Item 78)
  EXECUTIVE_DASHBOARD_VIEW: 'executive.dashboard.view',
  FORECAST_VIEW: 'forecast.view',
  GOALS_VIEW: 'goals.view',
  GOALS_MANAGE: 'goals.manage',
  FINANCIAL_EXECUTIVE_VIEW: 'financial.executive.view'
};

// 6. Matriz Padrão de Permissões por Perfil
export const DEFAULT_ROLE_PERMISSIONS = {
  [UserRole.ADMINISTRADOR]: Object.values(Permissions), // Acesso Irrestrito
  
  [UserRole.GESTAO]: [
    Permissions.OPPORTUNITY_VIEW,
    Permissions.OPPORTUNITY_CREATE,
    Permissions.OPPORTUNITY_EDIT,
    Permissions.DECISION_VIEW,
    Permissions.DECISION_APPLY,
    Permissions.PROPOSAL_VIEW,
    Permissions.PROPOSAL_APPROVE,
    Permissions.PRICING_VIEW,
    Permissions.MARGIN_VIEW,
    Permissions.FINANCIAL_SENSITIVE_VIEW,
    Permissions.DOCUMENTS_VIEW,
    Permissions.DOCUMENTS_CONFIDENTIAL_VIEW,
    Permissions.COMPETITORS_VIEW,
    Permissions.EXECUTIVE_DASHBOARD_VIEW,
    Permissions.FORECAST_VIEW,
    Permissions.GOALS_VIEW,
    Permissions.GOALS_MANAGE,
    Permissions.FINANCIAL_EXECUTIVE_VIEW,
    Permissions.RESULTS_VIEW,
    Permissions.COPILOT_USE,
    Permissions.CRM_ORGANIZATION_VIEW,
    Permissions.CRM_ORGANIZATION_EDIT,
    Permissions.CRM_CONTACT_VIEW,
    Permissions.CRM_CONTACT_EDIT,
    Permissions.CRM_INTERACTION_CREATE,
    Permissions.CRM_FOLLOWUP_MANAGE,
    Permissions.CRM_PIPELINE_MANAGE,
    Permissions.COMMUNICATIONS_VIEW,
    Permissions.COMMUNICATIONS_CREATE,
    Permissions.COMMUNICATIONS_APPROVE,
    Permissions.COMMUNICATIONS_SEND,
    Permissions.COMMUNICATIONS_TEMPLATES_MANAGE,
    Permissions.EMAIL_CONNECT,
    Permissions.EMAIL_READ,
    Permissions.EMAIL_SEND,
    Permissions.EMAIL_MANAGE,
    Permissions.CALENDAR_CONNECT,
    Permissions.CALENDAR_READ,
    Permissions.CALENDAR_CREATE,
    Permissions.CALENDAR_EDIT,
    Permissions.ADMIN_AUDIT
  ],
  
  [UserRole.LICITACOES]: [
    Permissions.OPPORTUNITY_VIEW,
    Permissions.OPPORTUNITY_CREATE,
    Permissions.OPPORTUNITY_EDIT,
    Permissions.DECISION_VIEW,
    Permissions.DECISION_APPLY,
    Permissions.PROPOSAL_VIEW,
    Permissions.PROPOSAL_CREATE,
    Permissions.PROPOSAL_EDIT,
    Permissions.PROPOSAL_SUBMIT,
    Permissions.PRICING_VIEW,
    Permissions.DOCUMENTS_VIEW,
    Permissions.DOCUMENTS_UPLOAD,
    Permissions.COMPETITORS_VIEW,
    Permissions.RESULTS_VIEW,
    Permissions.RESULTS_MANAGE,
    Permissions.COPILOT_USE,
    Permissions.CRM_ORGANIZATION_VIEW,
    Permissions.CRM_CONTACT_VIEW
  ],
  
  [UserRole.COMERCIAL]: [
    Permissions.OPPORTUNITY_VIEW,
    Permissions.OPPORTUNITY_CREATE,
    Permissions.DECISION_VIEW,
    Permissions.DECISION_APPLY,
    Permissions.PROPOSAL_VIEW,
    Permissions.PROPOSAL_CREATE,
    Permissions.PRICING_VIEW,
    Permissions.MARGIN_VIEW,
    Permissions.COMPETITORS_VIEW,
    Permissions.RESULTS_VIEW,
    Permissions.COPILOT_USE,
    Permissions.CRM_ORGANIZATION_VIEW,
    Permissions.CRM_ORGANIZATION_EDIT,
    Permissions.CRM_CONTACT_VIEW,
    Permissions.CRM_CONTACT_EDIT,
    Permissions.CRM_INTERACTION_CREATE,
    Permissions.CRM_FOLLOWUP_MANAGE,
    Permissions.CRM_PIPELINE_MANAGE,
    Permissions.COMMUNICATIONS_VIEW,
    Permissions.COMMUNICATIONS_CREATE,
    Permissions.COMMUNICATIONS_SEND,
    Permissions.EMAIL_CONNECT,
    Permissions.EMAIL_READ,
    Permissions.EMAIL_SEND,
    Permissions.CALENDAR_CONNECT,
    Permissions.CALENDAR_READ,
    Permissions.CALENDAR_CREATE,
    Permissions.EXECUTIVE_DASHBOARD_VIEW,
    Permissions.FORECAST_VIEW,
    Permissions.GOALS_VIEW,
    Permissions.GOALS_MANAGE
  ],
  
  [UserRole.TECNICO]: [
    Permissions.OPPORTUNITY_VIEW,
    Permissions.DECISION_VIEW,
    Permissions.PROPOSAL_VIEW,
    Permissions.DOCUMENTS_VIEW,
    Permissions.DOCUMENTS_UPLOAD,
    Permissions.COPILOT_USE
    // NENHUM ACESSO A PRICING, MARGEM OU FINANCEIRO EXECUTIVO SENSÍVEL (Itens 76 e 84)
  ],
  
  [UserRole.FINANCEIRO]: [
    Permissions.OPPORTUNITY_VIEW,
    Permissions.PROPOSAL_VIEW,
    Permissions.PROPOSAL_APPROVE,
    Permissions.PRICING_VIEW,
    Permissions.PRICING_EDIT,
    Permissions.MARGIN_VIEW,
    Permissions.FINANCIAL_SENSITIVE_VIEW,
    Permissions.EXECUTIVE_DASHBOARD_VIEW,
    Permissions.FORECAST_VIEW,
    Permissions.FINANCIAL_EXECUTIVE_VIEW,
    Permissions.RESULTS_VIEW,
    Permissions.COPILOT_USE
  ],
  
  [UserRole.VISUALIZADOR]: [
    Permissions.OPPORTUNITY_VIEW,
    Permissions.PROPOSAL_VIEW,
    Permissions.DOCUMENTS_VIEW,
    Permissions.RESULTS_VIEW,
    Permissions.COPILOT_USE
    // APENAS LEITURA, SEM CRIAR/EDITAR/EXCLUIR (Item 77)
  ]
};

// Categorias visuais de permissões para a tela da Matriz de Permissões
export const PERMISSION_GROUPS = [
  {
    name: 'Oportunidades & Decisões',
    permissions: [
      { id: Permissions.OPPORTUNITY_VIEW, label: 'Visualizar Oportunidades', desc: 'Acesso ao radar e lista de editais' },
      { id: Permissions.OPPORTUNITY_CREATE, label: 'Criar Oportunidade Manual', desc: 'Cadastrar nova oportunidade no radar' },
      { id: Permissions.OPPORTUNITY_EDIT, label: 'Editar Oportunidade', desc: 'Modificar dados e requisitos do certame' },
      { id: Permissions.OPPORTUNITY_DELETE, label: 'Excluir Oportunidade', desc: 'Soft-delete de oportunidades' },
      { id: Permissions.DECISION_VIEW, label: 'Ver Decision Board', desc: 'Visualizar matriz de decisão e scores' },
      { id: Permissions.DECISION_APPLY, label: 'Aplicar Decisão GO/NO-GO', desc: 'Registrar decisão humana e justificativa' }
    ]
  },
  {
    name: 'Propostas & Envio',
    permissions: [
      { id: Permissions.PROPOSAL_VIEW, label: 'Visualizar Propostas', desc: 'Acesso às propostas em elaboração' },
      { id: Permissions.PROPOSAL_CREATE, label: 'Iniciar Proposta', desc: 'Transformar GO em proposta oficial' },
      { id: Permissions.PROPOSAL_EDIT, label: 'Editar Proposta & Tarefas', desc: 'Criar tarefas e anexar formulários' },
      { id: Permissions.PROPOSAL_APPROVE, label: 'Aprovar Proposta Técnica/Comercial', desc: 'Homologar parecer de prontidão' },
      { id: Permissions.PROPOSAL_SUBMIT, label: 'Emitir Protocolo de Envio', desc: 'Registrar submissão ao portal' }
    ]
  },
  {
    name: 'Finanças, Preços & Margens (Protegido)',
    permissions: [
      { id: Permissions.PRICING_VIEW, label: 'Ver Preço Final', desc: 'Visualizar preço total ofertado' },
      { id: Permissions.PRICING_EDIT, label: 'Editar Formação de Preço', desc: 'Alterar planilha de custos e composição' },
      { id: Permissions.MARGIN_VIEW, label: 'Visualizar Margem Bruta', desc: 'Ver percentuais de margem planejada' },
      { id: Permissions.FINANCIAL_SENSITIVE_VIEW, label: 'Acesso Financeiro Restrito', desc: 'Acesso a custos internos, BDI e markup' }
    ]
  },
  {
    name: 'Cofre Documental & Atestados',
    permissions: [
      { id: Permissions.DOCUMENTS_VIEW, label: 'Ver Documentos & Atestados', desc: 'Acesso ao cofre e equipe técnica' },
      { id: Permissions.DOCUMENTS_UPLOAD, label: 'Fazer Upload de Certidões/ARTs', desc: 'Inserir novos arquivos no cofre' },
      { id: Permissions.DOCUMENTS_DELETE, label: 'Excluir Documentos', desc: 'Enviar documentos para a lixeira' },
      { id: Permissions.DOCUMENTS_CONFIDENTIAL_VIEW, label: 'Ver Documentos Confidenciais', desc: 'Acessar contratos e balanços sigilosos' }
    ]
  },
  {
    name: 'Inteligência Competitiva & Copilot',
    permissions: [
      { id: Permissions.COMPETITORS_VIEW, label: 'Ver Concorrentes & Head-to-Head', desc: 'Consultar ranking de adversários' },
      { id: Permissions.COMPETITORS_MANAGE, label: 'Cadastrar Concorrente Oficial', desc: 'Adicionar concorrente de ata pública' },
      { id: Permissions.RESULTS_VIEW, label: 'Ver Resultados & Win Rate', desc: 'Consultar histórico de vitórias/derrotas' },
      { id: Permissions.RESULTS_MANAGE, label: 'Registrar Desfecho de Licitação', desc: 'Inserir vencedor, preço e motivos' },
      { id: Permissions.COPILOT_USE, label: 'Acesso ao Vellia Copilot', desc: 'Utilizar assistente executivo com IA' }
    ]
  },
  {
    name: 'Administração do Sistema',
    permissions: [
      { id: Permissions.ADMIN_USERS, label: 'Gerenciar Usuários & Sessões', desc: 'Criar contas e derrubar sessões' },
      { id: Permissions.ADMIN_PERMISSIONS, label: 'Gerenciar Matriz de Perfis', desc: 'Alterar permissões de acesso' },
      { id: Permissions.ADMIN_SECURITY, label: 'Security Center & Políticas', desc: 'Configurar MFA, tentativas e senhas' },
      { id: Permissions.ADMIN_AUDIT, label: 'Consultar Logs de Auditoria', desc: 'Visualizar trilha de auditoria completa' },
      { id: Permissions.ADMIN_BACKUP, label: 'Administrar Backups & Restauração', desc: 'Executar backups e restaurar' },
      { id: Permissions.ADMIN_INTEGRATIONS, label: 'Configurar Integrações & Portais', desc: 'Gerenciar credenciais e chaves API' },
      { id: Permissions.ADMIN_SETTINGS, label: 'Configurações Globais & Agente', desc: 'Versionamento de score e rotinas' }
    ]
  }
];

/**
 * Verifica se um perfil ou conjunto de permissões personalizadas possui a permissão requerida.
 */
export function hasPermissionInMatrix(role, permission, customPermissions = []) {
  if (role === UserRole.ADMINISTRADOR) return true;
  
  // Verifica se há override nas permissões customizadas
  if (customPermissions && customPermissions.includes(permission)) {
    return true;
  }
  
  const rolePermissions = DEFAULT_ROLE_PERMISSIONS[role] || [];
  return rolePermissions.includes(permission);
}
