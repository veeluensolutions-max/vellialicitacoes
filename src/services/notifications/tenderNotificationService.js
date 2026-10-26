/**
 * VELLIA LICITAÇÕES — SERVIÇO DE NOTIFICAÇÃO E AGENDAMENTO DE PRAZOS
 * Integração com Google Calendar, Arquivos .ICS e Disparo de E-mails Corporativos.
 * Prazos da Lei nº 14.133/2021 (Nova Lei de Licitações):
 * - Impugnação de Edital: até 3 dias úteis antes da abertura da sessão.
 * - Pedidos de Esclarecimento: até 3 dias úteis antes da abertura da sessão.
 * - Sessão Pública de Disputa de Lances: data e horário fixados no edital.
 */

import { GeneralAuditService } from '../admin/generalAuditService.js';
import { logService, LogType } from '../logService.js';
import { EventBus } from '../eventBus.js';

const STORAGE_KEY_NOTIFICATION_SETTINGS = 'vellia_tender_notification_settings_v1';

export class TenderNotificationService {
  /**
   * Obtém configurações salvas de destinatários padrão
   */
  static getSettings() {
    const defaults = {
      recipients: [
        'licitacoes@veeluen.com',
        'diretoria@veeluen.com',
        'comercial@excelenciaambiental.com.br'
      ],
      autoEmailOnCriticalDeadline: true,
      autoEmailOnGoDecision: true,
      googleCalendarDefaultReminders: [1440, 120, 15] // minutos (24h, 2h, 15min)
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const stored = window.localStorage.getItem(STORAGE_KEY_NOTIFICATION_SETTINGS);
        if (stored) return { ...defaults, ...JSON.parse(stored) };
      }
    } catch {}
    return defaults;
  }

  static saveSettings(settings) {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(STORAGE_KEY_NOTIFICATION_SETTINGS, JSON.stringify(settings));
      }
    } catch {}
  }

  /**
   * Converte string de data no formato DD/MM/YYYY ou YYYY-MM-DD para objeto Date
   */
  static parseDate(dateStr) {
    if (!dateStr) return new Date();
    try {
      const parts = String(dateStr).split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          // DD/MM/YYYY
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      }
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  }

  /**
   * Subtrai dias úteis de uma data (ignora sábado e domingo)
   */
  static subtractBusinessDays(date, days) {
    const d = new Date(date);
    let count = 0;
    while (count < days) {
      d.setDate(d.getDate() - 1);
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
    }
    return d;
  }

  /**
   * Calcula todos os marcos e prazos fatais da oportunidade
   */
  static calculateMilestones(opportunity) {
    const sessionDate = this.parseDate(opportunity.endDate || opportunity.publishDate);
    sessionDate.setHours(9, 0, 0, 0); // Horário padrão de abertura: 09:00

    // Lei 14.133/2021: Impugnação e Esclarecimento até 3 dias úteis antes
    const clarificationDate = this.subtractBusinessDays(sessionDate, 3);
    clarificationDate.setHours(18, 0, 0, 0);

    const impugnationDate = this.subtractBusinessDays(sessionDate, 3);
    impugnationDate.setHours(18, 0, 0, 0);

    const proposalDeadlineDate = new Date(sessionDate);
    proposalDeadlineDate.setHours(8, 30, 0, 0);

    return {
      sessionDate,
      clarificationDate,
      impugnationDate,
      proposalDeadlineDate,
      formatted: {
        session: `${sessionDate.toLocaleDateString('pt-BR')} às ${sessionDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        clarification: `${clarificationDate.toLocaleDateString('pt-BR')} até às 18:00 (3 dias úteis antes)`,
        impugnation: `${impugnationDate.toLocaleDateString('pt-BR')} até às 18:00 (3 dias úteis antes)`,
        proposal: `${proposalDeadlineDate.toLocaleDateString('pt-BR')} até às 08:30`
      }
    };
  }

  /**
   * Formata data para formato de URL do Google Calendar: YYYYMMDDTHHMMSSZ
   */
  static formatGoogleCalendarIso(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
  }

  /**
   * Gera URL direta para adicionar evento no Google Calendar com 1 clique
   */
  static generateGoogleCalendarUrl(opportunity, milestoneKey = 'SESSION') {
    const milestones = this.calculateMilestones(opportunity);
    const oppNumber = opportunity.number || opportunity.id;
    const client = opportunity.client || 'Órgão Contratante';
    const object = opportunity.object || opportunity.title || 'Pregão Eletrônico';
    const portal = opportunity.portal || 'Petronect / PNCP';

    let title = '';
    let startDate = new Date();
    let endDate = new Date();
    let details = '';

    if (milestoneKey === 'IMPUGNATION') {
      title = `⚖️ PRAZO FATAL IMPUGNAÇÃO: Edital #${oppNumber} (${client})`;
      startDate = milestones.impugnationDate;
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora
      details = `PRAZO LIMITE PARA IMPUGNAÇÃO DO EDITAL (Art. 164 Lei 14.133/2021)
Órgão: ${client}
Número: #${oppNumber}
Objeto: ${object}
Portal: ${portal}
Empresa Indicada: ${opportunity.recommendedCompany || 'Veeluen Solutions'}
Aderência Técnica: ${opportunity.score || 85}%
Link Oficial: ${opportunity.url || 'https://pncp.gov.br'}

Protocolar a petição de impugnação perante a comissão/pregoeiro antes das 18:00.`;

    } else if (milestoneKey === 'CLARIFICATION') {
      title = `📝 PRAZO ESCLARECIMENTO: Edital #${oppNumber} (${client})`;
      startDate = milestones.clarificationDate;
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      details = `PRAZO LIMITE PARA PEDIDOS DE ESCLARECIMENTO (Art. 164 Lei 14.133/2021)
Órgão: ${client}
Número: #${oppNumber}
Objeto: ${object}
Portal: ${portal}
Empresa Indicada: ${opportunity.recommendedCompany || 'Veeluen Solutions'}
Link Oficial: ${opportunity.url || 'https://pncp.gov.br'}`;

    } else {
      // SESSÃO PÚBLICA DE DISPUTA (Padrão)
      title = `🏆 SESSÃO PÚBLICA / DISPUTA DE LANCES: #${oppNumber} (${client})`;
      startDate = milestones.sessionDate;
      endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 horas de sessão
      details = `ABERTURA DA DISPUTA DE LANCES / SESSÃO PÚBLICA DO PREGÃO
Órgão Contratante: ${client}
Certame: #${oppNumber} (${opportunity.modality || 'Pregão Eletrônico'})
Objeto: ${object}
Valor Estimado: ${opportunity.estimatedValue || 'Sob consulta'}
Portal: ${portal}
Empresa de Atendimento: ${opportunity.recommendedCompany || 'Veeluen Solutions'}
Aderência Técnica Vellia: ${opportunity.score || 85}%
Link de Acesso Direto: ${opportunity.url || 'https://pncp.gov.br'}

Instruções Operacionais:
1. Conectar na sala de disputa 15 minutos antes.
2. Certidões CNDs e CATs validadas no cofre documental.
3. Planilha de custos e BDI aprovada pela Diretoria.`;
    }

    const datesParam = `${this.formatGoogleCalendarIso(startDate)}/${this.formatGoogleCalendarIso(endDate)}`;

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: datesParam,
      details: details,
      location: portal,
      add: 'licitacoes@veeluen.com,diretoria@veeluen.com'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Gera e dispara download do arquivo .ICS padronizado (Outlook, Apple Calendar e Google)
   */
  static downloadIcsFile(opportunity) {
    const milestones = this.calculateMilestones(opportunity);
    const oppNumber = opportunity.number || opportunity.id;
    const client = opportunity.client || 'Órgão Contratante';
    const object = opportunity.object || opportunity.title || 'Pregão Eletrônico';
    const portal = opportunity.portal || 'Petronect / PNCP';

    const formatDateIcs = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
    };

    const sessionStart = milestones.sessionDate;
    const sessionEnd = new Date(sessionStart.getTime() + 3 * 3600000);
    const nowIso = formatDateIcs(new Date());

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Veeluen Solutions//Vellia Licitacoes 2.0//PT-BR
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:vellia-session-${oppNumber}-${Date.now()}@veeluen.com
DTSTAMP:${nowIso}
DTSTART:${formatDateIcs(sessionStart)}
DTEND:${formatDateIcs(sessionEnd)}
SUMMARY:🏆 SESSÃO PÚBLICA: #${oppNumber} (${client})
DESCRIPTION:Pregão: #${oppNumber}\\nÓrgão: ${client}\\nObjeto: ${object}\\nPortal: ${portal}\\nAderência: ${opportunity.score || 85}%\\nLink: ${opportunity.url || 'https://pncp.gov.br'}
LOCATION:${portal}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1440M
ACTION:DISPLAY
DESCRIPTION:Aviso 24 horas antes: Sessão pública amanhã #${oppNumber}
END:VALARM
BEGIN:VALARM
TRIGGER:-PT120M
ACTION:DISPLAY
DESCRIPTION:Aviso 2 horas antes: Sessão pública do certame #${oppNumber}
END:VALARM
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:AUDIO
DESCRIPTION:Atenção: Abertura de lances em 15 minutos!
END:VALARM
END:VEVENT
BEGIN:VEVENT
UID:vellia-impugnation-${oppNumber}-${Date.now()}@veeluen.com
DTSTAMP:${nowIso}
DTSTART:${formatDateIcs(milestones.impugnationDate)}
DTEND:${formatDateIcs(new Date(milestones.impugnationDate.getTime() + 3600000))}
SUMMARY:⚖️ PRAZO FINAL IMPUGNAÇÃO: #${oppNumber} (${client})
DESCRIPTION:Prazo limite legal para protocolar impugnação ao edital #${oppNumber}.\\nÓrgão: ${client}\\nLink: ${opportunity.url || 'https://pncp.gov.br'}
LOCATION:${portal}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT1440M
ACTION:DISPLAY
DESCRIPTION:Aviso: Último dia para impugnar o edital #${oppNumber}
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vellia_Licitacao_${oppNumber}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    logService.addLog(LogType.SYSTEM, `Arquivo .ICS de calendário gerado para o certame #${oppNumber}.`);
    return { success: true, filename: `Vellia_Licitacao_${oppNumber}.ics` };
  }

  /**
   * Constrói o conteúdo estruturado do E-mail de Alerta para a equipe
   */
  static buildEmailPayload(opportunity, customNote = '') {
    const milestones = this.calculateMilestones(opportunity);
    const oppNumber = opportunity.number || opportunity.id;
    const client = opportunity.client || 'Órgão Público';
    const object = opportunity.object || opportunity.title || 'Contratação Pública';
    const portal = opportunity.portal || 'Petronect / PNCP';
    const company = opportunity.recommendedCompany || 'Veeluen Solutions';
    const adherence = opportunity.score || 85;
    const value = opportunity.estimatedValue || 'Sob consulta';

    const subject = `🚨 [ALERTA LICITAÇÃO] #${oppNumber} — ${client} (${adherence}% Aderência)`;

    const bodyPlain = `Prezada Equipe de Licitações e Diretoria,

O sistema Vellia Licitações identificou prazos críticos para o certame abaixo:

ÓRGÃO CONTRATANTE: ${client}
NÚMERO DO CERTAME: #${oppNumber} (${opportunity.modality || 'Pregão Eletrônico'})
EMPRESA INDICADA: ${company}
ADERÊNCIA TÉCNICA: ${adherence}%
VALOR ESTIMADO: ${value}
PORTAL: ${portal}

OBJETO DO EDITAL:
${object}

--------------------------------------------------
CRONOGRAMA E PRAZOS FATAIS (LEI 14.133/2021):
--------------------------------------------------
1. PEDIDOS DE ESCLARECIMENTO: ${milestones.formatted.clarification}
2. IMPUGNAÇÃO DO EDITAL:     ${milestones.formatted.impugnation}
3. ENVIO DE PROPOSTA:        ${milestones.formatted.proposal}
4. SESSÃO PÚBLICA (DISPUTA): ${milestones.formatted.session}

LINK OFICIAL DO EDITAL:
${opportunity.url || 'https://pncp.gov.br'}

${customNote ? `OBSERVAÇÃO OPERACIONAL:\n${customNote}\n\n` : ''}
Atenciosamente,
Vellia Licitações 2.0 • Inteligência em Contratações Públicas`;

    return { subject, bodyPlain };
  }

  /**
   * Dispara o e-mail abrindo o cliente nativo (mailto:) ou via API corporativa
   */
  static dispatchEmail(opportunity, recipients = [], customNote = '') {
    const settings = this.getSettings();
    const finalRecipients = recipients.length > 0 ? recipients : settings.recipients;
    const payload = this.buildEmailPayload(opportunity, customNote);

    const toStr = finalRecipients.join(';');
    const mailtoUrl = `mailto:${encodeURIComponent(toStr)}?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent(payload.bodyPlain)}`;

    // Abre o cliente de e-mail local (Outlook / Thunderbird / Apple Mail / Gmail web)
    if (typeof window !== 'undefined') {
      window.location.href = mailtoUrl;
    }

    // Registra na Trilha de Auditoria LGPD
    GeneralAuditService.logAction({
      user: 'Vellia Notification Engine',
      module: 'Notificações & Agenda',
      action: 'Disparo de Alerta por E-mail',
      object: `Certame #${opportunity.number || opportunity.id}`,
      diffBefore: null,
      diffAfter: {
        recipients: finalRecipients,
        subject: payload.subject
      },
      result: 'SUCESSO'
    });

    logService.addLog(LogType.SYSTEM, `Alerta de e-mail disparado para ${finalRecipients.length} destinatários: #${opportunity.number}.`);

    return {
      success: true,
      recipients: finalRecipients,
      subject: payload.subject
    };
  }
}

export const tenderNotificationService = TenderNotificationService;
export default tenderNotificationService;
