/**
 * VELLIA LICITAÇÕES — FASE 17
 * crmModels.js
 * Modelos de dados, enums e algoritmos de pontuação para o CRM de Relacionamento.
 */

export const OrganizationType = {
  ORGAO_PUBLICO: 'Órgão Público',
  EMPRESA_PUBLICA: 'Empresa Pública',
  EMPRESA_PRIVADA: 'Empresa Privada',
  AUTARQUIA: 'Autarquia',
  FUNDACAO: 'Fundação',
  UNIVERSIDADE: 'Universidade',
  HOSPITAL: 'Hospital',
  INDUSTRIA: 'Indústria',
  PARCEIRO: 'Parceiro',
  FORNECEDOR: 'Fornecedor',
  OUTRO: 'Outro'
};

export const StrategicClassification = {
  ESTRATEGICO: 'Estratégico',
  ALTA_PRIORIDADE: 'Alta prioridade',
  POTENCIAL: 'Potencial',
  NORMAL: 'Normal',
  BAIXA_PRIORIDADE: 'Baixa prioridade'
};

export const ContactRole = {
  DECISOR: 'Decisor',
  INFLUENCIADOR: 'Influenciador',
  COMPRAS: 'Compras',
  LICITACOES: 'Licitações',
  TECNICO: 'Técnico',
  ENGENHARIA: 'Engenharia',
  MEIO_AMBIENTE: 'Meio Ambiente',
  SST: 'SST',
  FINANCEIRO: 'Financeiro',
  ADMINISTRATIVO: 'Administrativo',
  DIRETORIA: 'Diretoria',
  OUTRO: 'Outro'
};

export const InfluenceLevel = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa',
  NAO_IDENTIFICADA: 'Não identificada'
};

export const InteractionType = {
  LIGACAO: 'Ligação',
  EMAIL: 'E-mail',
  WHATSAPP: 'WhatsApp',
  REUNIAO: 'Reunião',
  VIDEOCONFERENCIA: 'Videoconferência',
  VISITA: 'Visita',
  EVENTO: 'Evento',
  LINKEDIN: 'LinkedIn',
  OUTRO: 'Outro'
};

export const FollowUpStatus = {
  PENDENTE: 'Pendente',
  HOJE: 'Hoje',
  ATRASADO: 'Atrasado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  REAGENDADO: 'Reagendado'
};

export const FollowUpPriority = {
  ALTA: 'Alta',
  MEDIA: 'Média',
  BAIXA: 'Baixa'
};

export const PipelineStage = {
  MAPEAMENTO: 'Mapeamento',
  CONTATO_IDENTIFICADO: 'Contato identificado',
  PRIMEIRO_CONTATO: 'Primeiro contato',
  RELACIONAMENTO: 'Relacionamento',
  REUNIAO: 'Reunião',
  OPORTUNIDADE_FUTURA: 'Oportunidade futura',
  LICITACAO_PUBLICADA: 'Licitação publicada',
  GO: 'GO',
  PROPOSTA: 'Proposta',
  RESULTADO: 'Resultado'
};

export const LeadSource = {
  RADAR_AUTOMATICO: 'Radar automático',
  PROSPECCAO_MANUAL: 'Prospecção manual',
  RELACIONAMENTO: 'Relacionamento',
  PETRONECT: 'Petronect',
  PNCP: 'PNCP',
  COMPRAS_GOV: 'Compras.gov.br',
  INDICACAO: 'Indicação',
  OUTRO: 'Outro'
};

export const RelationshipTemperature = {
  FRIO: 'Frio',
  MORNO: 'Morno',
  QUENTE: 'Quente'
};

/**
 * Calcula o Relationship Opportunity Score (0 a 100)
 * Requisitos Itens 25 e 26.
 * Fatores:
 * - Sinais futuros identificados (PCA/Contratos vigentes): até 30 pts
 * - Volume histórico contratual: até 20 pts
 * - Recorrência de aquisições: até 15 pts
 * - Serviços compatíveis (Aderência Vellia): até 15 pts
 * - Contratos a vencer nos próximos meses: até 10 pts
 * - Interesse estratégico da conta: até 10 pts
 */
export function calculateRelationshipOpportunityScore(params = {}) {
  const {
    futureSignalsCount = 0,
    historicalVolume = 0,
    hasRecurrence = false,
    compatibleServicesCount = 0,
    hasExpiringContracts = false,
    isStrategicAccount = false
  } = params;

  let score = 0;

  // 1. Sinais futuros
  if (futureSignalsCount >= 2) score += 30;
  else if (futureSignalsCount === 1) score += 20;

  // 2. Volume financeiro histórico
  if (historicalVolume >= 5000000) score += 20;
  else if (historicalVolume >= 1000000) score += 15;
  else if (historicalVolume >= 200000) score += 10;
  else if (historicalVolume > 0) score += 5;

  // 3. Recorrência
  if (hasRecurrence) score += 15;

  // 4. Serviços compatíveis
  if (compatibleServicesCount >= 3) score += 15;
  else if (compatibleServicesCount >= 1) score += 10;

  // 5. Contratos a vencer
  if (hasExpiringContracts) score += 10;

  // 6. Interesse estratégico
  if (isStrategicAccount) score += 10;

  score = Math.min(100, Math.max(0, score));

  let tier = 'Monitorar';
  let badgeColor = '#64748b';

  if (score >= 85) {
    tier = 'Prioridade máxima';
    badgeColor = '#10b981';
  } else if (score >= 70) {
    tier = 'Alta prioridade';
    badgeColor = '#3b82f6';
  } else if (score >= 50) {
    tier = 'Desenvolver relacionamento';
    badgeColor = '#f59e0b';
  }

  return {
    score,
    tier,
    badgeColor,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Calcula o indicador Relationship Strength (Força do Relacionamento, 0 a 100)
 * Requisitos Itens 27, 28, 29:
 * Representa atividade comercial registrada. Não infere "amizade" pessoal.
 * Considera:
 * - Quantidade de interações registradas: até 35 pts
 * - Recência do último contato (dias): até 30 pts
 * - Reuniões e visitas técnicas realizadas: até 20 pts
 * - Propostas ou histórico comercial positivo: até 15 pts
 */
export function calculateRelationshipStrength(params = {}) {
  const {
    interactionsCount = 0,
    daysSinceLastInteraction = 999,
    meetingsCount = 0,
    hasCommercialHistory = false
  } = params;

  let strength = 0;

  // Interações
  if (interactionsCount >= 10) strength += 35;
  else if (interactionsCount >= 5) strength += 25;
  else if (interactionsCount >= 2) strength += 15;
  else if (interactionsCount === 1) strength += 8;

  // Recência
  if (daysSinceLastInteraction <= 7) strength += 30;
  else if (daysSinceLastInteraction <= 15) strength += 25;
  else if (daysSinceLastInteraction <= 30) strength += 15;
  else if (daysSinceLastInteraction <= 60) strength += 8;

  // Reuniões presenciais ou videoconferências
  if (meetingsCount >= 3) strength += 20;
  else if (meetingsCount >= 1) strength += 12;

  // Histórico comercial (propostas enviadas ou contratos ganhos)
  if (hasCommercialHistory) strength += 15;

  strength = Math.min(100, Math.max(0, strength));

  let label = 'Em desenvolvimento';
  if (strength >= 80) label = 'Relacionamento Consolidado';
  else if (strength >= 60) label = 'Relacionamento Ativo';
  else if (strength >= 40) label = 'Contato Inicial / Em aquecimento';
  else label = 'Pouco ou nenhum contato';

  return {
    strength,
    label,
    daysSinceLastInteraction: daysSinceLastInteraction === 999 ? 'Sem contato registrado' : daysSinceLastInteraction
  };
}

/**
 * Permissões de CRM (Item 68)
 */
export const CrmPermissions = {
  ORGANIZATION_VIEW: 'crm.organization.view',
  ORGANIZATION_EDIT: 'crm.organization.edit',
  CONTACT_VIEW: 'crm.contact.view',
  CONTACT_EDIT: 'crm.contact.edit',
  INTERACTION_CREATE: 'crm.interaction.create',
  FOLLOWUP_MANAGE: 'crm.followup.manage',
  PIPELINE_MANAGE: 'crm.pipeline.manage'
};
