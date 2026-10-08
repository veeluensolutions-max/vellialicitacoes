/**
 * VELLIA LICITAÇÕES — FASE 18
 * communicationModels.js
 * Modelos de dados, enums e algoritmos de cálculo para a Camada de Comunicação Assistida e Follow-up.
 */

export const CommunicationChannel = {
  EMAIL: 'E-mail',
  WHATSAPP: 'WhatsApp',
  LINKEDIN: 'LinkedIn',
  LIGACAO: 'Ligação',
  MENSAGEM_MANUAL: 'Mensagem manual',
  OUTRO: 'Outro'
};

export const CommunicationStatus = {
  RASCUNHO: 'Rascunho',
  AGUARDANDO_REVISAO: 'Aguardando revisão',
  APROVADA: 'Aprovada',
  COPIADA: 'Copiada',
  ENVIADA_MANUALMENTE: 'Enviada manualmente',
  RESPONDIDA: 'Respondida',
  SEM_RESPOSTA: 'Sem resposta',
  CANCELADA: 'Cancelada'
};

export const MessageType = {
  APRESENTACAO_INSTITUCIONAL: 'Apresentação institucional',
  PRIMEIRO_CONTATO: 'Primeiro contato',
  FOLLOW_UP: 'Follow-up',
  ENVIO_PORTFOLIO: 'Envio de portfólio',
  SOLICITACAO_REUNIAO: 'Solicitação de reunião',
  RETOMADA_CONTATO: 'Retomada de contato',
  ACOMPANHAMENTO_OPORTUNIDADE: 'Acompanhamento de oportunidade',
  CONTATO_PRE_EDITAL: 'Contato pré-edital',
  POS_REUNIAO: 'Pós-reunião',
  AGRADECIMENTO: 'Agradecimento'
};

export const ToneStyle = {
  FORMAL: 'Formal',
  CONSULTIVO: 'Consultivo',
  OBJETIVO: 'Objetivo',
  EXECUTIVO: 'Executivo',
  TECNICO: 'Técnico',
  COMERCIAL: 'Comercial'
};

export const MessageLength = {
  CURTO: 'Curto',
  MEDIO: 'Médio',
  DETALHADO: 'Detalhado'
};

export const CallToAction = {
  SOLICITAR_REUNIAO: 'Solicitar reunião',
  SOLICITAR_RETORNO: 'Solicitar retorno',
  APRESENTAR_SERVICO: 'Apresentar serviço',
  ENVIAR_PORTFOLIO: 'Enviar portfólio',
  AGENDAR_CONVERSA: 'Agendar conversa'
};

export const CommunicationOutcome = {
  RESPONDEU: 'Respondeu',
  SEM_INTERESSE: 'Sem interesse',
  SOLICITOU_PROPOSTA: 'Solicitou proposta',
  SOLICITOU_REUNIAO: 'Solicitou reunião',
  SOLICITOU_RETORNO_FUTURO: 'Solicitou retorno futuro',
  ENCAMINHOU_OUTRO_CONTATO: 'Encaminhou para outro contato'
};

export const FollowUpUrgency = {
  URGENTE: 'Urgente', // Score >= 85
  ALTA_PRIORIDADE: 'Alta prioridade', // Score 70-84
  NORMAL: 'Normal', // Score 50-69
  BAIXA: 'Baixa' // Score < 50
};

/**
 * Calcula o Follow-Up Score (0 a 100) e fornece explicação transparente (Itens 28, 29 e 30)
 * Fatores:
 * - Organização estratégica (Item 4 da Fase 17): até 25 pts
 * - Oportunidade ou sinal futuro relevante vinculado: até 25 pts
 * - Prazo de vencimento próximo (contrato ou follow-up atrasado): até 25 pts
 * - Dias sem interação recente (> 15 dias): até 15 pts
 * - Contato decisor com alta influência: até 10 pts
 */
export function calculateFollowUpScore(params = {}) {
  const {
    isStrategicOrg = false,
    hasRelatedOpportunityOrSignal = false,
    daysSinceLastContact = 0,
    isOverdue = false,
    daysOverdue = 0,
    isDecisionMaker = false
  } = params;

  let score = 0;
  const reasons = [];

  // 1. Organização Estratégica
  if (isStrategicOrg) {
    score += 25;
    reasons.push('Organização classificada como Conta Estratégica');
  }

  // 2. Oportunidade ou Sinal Futuro Vinculado
  if (hasRelatedOpportunityOrSignal) {
    score += 25;
    reasons.push('Existe oportunidade ou sinal futuro de contratação vinculado');
  }

  // 3. Atraso ou Prazos Críticos
  if (isOverdue) {
    const overdueBonus = Math.min(25, 15 + (daysOverdue * 2));
    score += overdueBonus;
    reasons.push(`Follow-up vencido há ${daysOverdue || 1} dia(s)`);
  }

  // 4. Tempo sem contato
  if (daysSinceLastContact >= 30) {
    score += 15;
    reasons.push(`Contato sem interação há ${daysSinceLastContact} dias`);
  } else if (daysSinceLastContact >= 15) {
    score += 10;
    reasons.push(`Contato sem interação há ${daysSinceLastContact} dias`);
  }

  // 5. Decisor
  if (isDecisionMaker) {
    score += 10;
    reasons.push('Contato é Decisor chave no órgão');
  }

  score = Math.min(100, Math.max(0, score));

  let urgency = FollowUpUrgency.BAIXA;
  let badgeColor = '#64748b';

  if (score >= 85) {
    urgency = FollowUpUrgency.URGENTE;
    badgeColor = '#ef4444';
  } else if (score >= 70) {
    urgency = FollowUpUrgency.ALTA_PRIORIDADE;
    badgeColor = '#f59e0b';
  } else if (score >= 50) {
    urgency = FollowUpUrgency.NORMAL;
    badgeColor = '#3b82f6';
  }

  return {
    score,
    urgency,
    badgeColor,
    explanation: reasons.join(' • ') || 'Follow-up de rotina preventiva.',
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Permissões Granulares de Comunicações (Item 55)
 */
export const CommunicationPermissions = {
  COMMUNICATIONS_VIEW: 'communications.view',
  COMMUNICATIONS_CREATE: 'communications.create',
  COMMUNICATIONS_APPROVE: 'communications.approve',
  COMMUNICATIONS_SEND: 'communications.send',
  COMMUNICATIONS_TEMPLATES_MANAGE: 'communications.templates.manage'
};
