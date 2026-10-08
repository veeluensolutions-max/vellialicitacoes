/**
 * VELLIA LICITAÇÕES — FASE 19: INTEGRAÇÕES REAIS DE E-MAIL + CALENDÁRIO
 * productivityModels.js: Enums, Tipos e Estruturas de Dados do Módulo de Produtividade
 */

// 1. Tipos de Provedores de Integração
export const IntegrationProviderType = {
  GMAIL: 'GMAIL',
  MICROSOFT_MAIL: 'MICROSOFT_MAIL',
  GOOGLE_CALENDAR: 'GOOGLE_CALENDAR',
  MICROSOFT_CALENDAR: 'MICROSOFT_CALENDAR'
};

// 2. Status da Conexão / Integração (Item 67)
export const ConnectionStatus = {
  CONECTADO: 'Conectado',
  SINCRONIZANDO: 'Sincronizando',
  ERRO: 'Erro',
  TOKEN_EXPIRADO: 'Token expirado',
  PERMISSAO_REVOGADA: 'Permissão revogada',
  DESCONECTADO: 'Desconectado'
};

// 3. Escopo de Sincronização de E-mail (Item 9, 72)
export const EmailSyncScope = {
  ALL_RELEVANT: 'ALL_RELEVANT',               // Todas as mensagens com relevância comercial
  CRM_CONTACTS_ONLY: 'CRM_CONTACTS_ONLY',     // Apenas e-mails de contatos cadastrados no CRM
  STARRED_ONLY: 'STARRED_ONLY'                // Somente marcadas/sinalizadas pelo usuário
};

// 4. Nível de Confiança no Matching de Oportunidades (Item 13)
export const ConfidenceLevel = {
  ALTA: 'Alta confiança',       // Número exato de edital/licitação ou referência formal explícita
  MEDIA: 'Média confiança',     // Contratante + serviço reconhecido no assunto/corpo
  BAIXA: 'Baixa confiança'      // Menção contextual vaga (exige confirmação humana)
};

// 5. Estados da Fila de Envio de E-mail (Item 34)
export const EmailQueueStatus = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SENT: 'Sent',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
  BOUNCED: 'Bounced'
};

// 6. Categorias Visuais de Eventos no Calendário (Item 50)
export const CalendarEventCategory = {
  REUNIAO: 'Reunião',
  LICITACAO: 'Licitação',
  FOLLOW_UP: 'Follow-up',
  PRAZO_CRITICO: 'Prazo crítico',
  VISITA_TECNICA: 'Visita técnica'
};

// 7. Status do Evento no Calendário
export const EventStatus = {
  CONFIRMED: 'Confirmado',
  TENTATIVE: 'Tentativa',
  CANCELLED: 'Cancelado'
};

// 8. Plataformas de Videoconferência (Item 42)
export const VideoConferenceType = {
  GOOGLE_MEET: 'Google Meet',
  MICROSOFT_TEAMS: 'Microsoft Teams',
  NONE: 'Presencial / Sem link'
};

// 9. Permissões Granulares da Fase 19 (Item 70)
export const ProductivityPermissions = {
  EMAIL_CONNECT: 'email.connect',
  EMAIL_READ: 'email.read',
  EMAIL_SEND: 'email.send',
  EMAIL_MANAGE: 'email.manage',
  CALENDAR_CONNECT: 'calendar.connect',
  CALENDAR_READ: 'calendar.read',
  CALENDAR_CREATE: 'calendar.create',
  CALENDAR_EDIT: 'calendar.edit'
};

// 10. Helper para mascaramento de tokens (Itens 4 e 69)
export function maskToken(token) {
  if (!token) return 'Não configurado';
  if (token.length <= 10) return '••••••••';
  const prefix = token.slice(0, 4);
  const suffix = token.slice(-4);
  return `${prefix}••••••••••••${suffix}`;
}
