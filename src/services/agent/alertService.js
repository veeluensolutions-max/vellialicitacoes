/**
 * VELLIA LICITAÇÕES - ALERT SERVICE (FASE 7)
 * Motor central de geração, rastreamento e configuração de alertas inteligentes.
 */

import { ExternalAlertDispatcher } from '../notifications/externalAlertDispatcher.js';

export const AlertType = {
  NEW_CRITICAL: 'NEW_CRITICAL',           // Nova oportunidade crítica
  NEW_RELEVANT: 'NEW_RELEVANT',           // Nova oportunidade relevante
  DEADLINE_SHORT: 'DEADLINE_SHORT',       // Prazo curto
  DEADLINE_CHANGED: 'DEADLINE_CHANGED',   // Alteração de prazo
  OPPORTUNITY_UPDATED: 'OPPORTUNITY_UPDATED', // Oportunidade atualizada
  DOCS_REQUIRED: 'DOCS_REQUIRED',         // Documento necessário futuramente
  SOURCE_ERROR: 'SOURCE_ERROR',           // Erro de fonte
  AGENT_FAILURE: 'AGENT_FAILURE'          // Falha do agente
};

export const AlertLevel = {
  CRITICAL: 'CRITICAL',       // Crítico (vermelho)
  HIGH: 'HIGH',               // Alta prioridade (laranja)
  IMPORTANT: 'IMPORTANT',     // Importante (âmbar)
  INFO: 'INFO'                // Informativo (azul)
};

const ALERTS_STORAGE_KEY = 'vellia_alerts_v1';
const RULES_STORAGE_KEY = 'vellia_alert_rules_v1';
const SENT_TRACKER_KEY = 'vellia_alerts_sent_tracker_v1';

const DEFAULT_RULES = {
  minAdherence: 80,                       // Aderência mínima para alerta relevante/crítico
  criticalThreshold: 90,                  // Limiar de oportunidade crítica
  deadlineThresholds: [15, 7, 3, 1],      // Dias para avisos de prazo
  notifyCriticalOnly: false,
  targetCompanies: ['ALL'],
  targetUFs: ['ALL'],
  soundEnabled: true,
  emailEnabled: true,
  whatsappEnabled: true
};

const INITIAL_ALERTS = [
  {
    id: 'alt-seed-1',
    type: AlertType.NEW_CRITICAL,
    level: AlertLevel.CRITICAL,
    title: '🔥 NOVA OPORTUNIDADE CRÍTICA — Petronect',
    opportunityNumber: '7004321234',
    opportunityTitle: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
    client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
    company: 'Excelência Ambiental',
    service: 'Monitoramento de emissões atmosféricas',
    adherence: 96,
    daysLeft: 12,
    message: 'Edital com 96% de aderência técnica publicado no Petronect. Recomenda-se triagem comercial imediata.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
    archived: false,
    portal: 'Petronect'
  },
  {
    id: 'alt-seed-2',
    type: AlertType.NEW_CRITICAL,
    level: AlertLevel.CRITICAL,
    title: '🔥 NOVA OPORTUNIDADE CRÍTICA — Transpetro',
    opportunityNumber: '7004319802',
    opportunityTitle: 'Serviços continuados de operação e manutenção de ETE e tratamento de efluentes',
    client: 'Transpetro - Terminal Aquaviário de Suape',
    company: 'Veeluen Solutions',
    service: 'Operação de ETE e Manutenção de ETE',
    adherence: 94,
    daysLeft: 15,
    message: 'Edital de alto valor estimado (R$ 3.820.000,00) compatível com o corpo técnico da Veeluen Solutions.',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    read: false,
    archived: false,
    portal: 'Petronect'
  },
  {
    id: 'alt-seed-3',
    type: AlertType.DEADLINE_SHORT,
    level: AlertLevel.HIGH,
    title: '⏰ PRAZO CURTO (8 DIAS) — Envio de Propostas',
    opportunityNumber: '7004318765',
    opportunityTitle: 'Inspeção e Manutenção Preventiva em Caldeiras e Vasos de Pressão (NR-13)',
    client: 'Petrobras - UO-BS Santos',
    company: 'Veeluen Solutions',
    service: 'Inspeção de Caldeiras e Vasos (NR-13)',
    adherence: 91,
    daysLeft: 8,
    message: 'A oportunidade encerra em 8 dias. Prazo para solicitação de esclarecimentos se aproxima.',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false,
    archived: false,
    portal: 'Petronect'
  },
  {
    id: 'alt-seed-4',
    type: AlertType.DEADLINE_CHANGED,
    level: AlertLevel.IMPORTANT,
    title: '📅 ALTERAÇÃO DE PRAZO — Prorrogação Concedida',
    opportunityNumber: '7004321234',
    opportunityTitle: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
    client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
    company: 'Excelência Ambiental',
    service: 'Monitoramento de emissões atmosféricas',
    adherence: 96,
    daysLeft: 12,
    message: 'A data limite de envio foi prorrogada de 12/10 para 19/10/2026 via Aditivo Oficial.',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    read: true,
    archived: false,
    portal: 'Petronect'
  }
];

export class AlertService {
  /**
   * Obtém a lista de alertas ativos (não arquivados)
   */
  static listAlerts(includeArchived = false) {
    try {
      const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
      let list = raw ? JSON.parse(raw) : INITIAL_ALERTS;
      if (!raw) {
        localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(INITIAL_ALERTS));
      }
      return includeArchived ? list : list.filter(a => !a.archived);
    } catch {
      return INITIAL_ALERTS;
    }
  }

  /**
   * Obtém contagem de alertas não lidos
   */
  static getUnreadCount() {
    return this.listAlerts(false).filter(a => !a.read).length;
  }

  /**
   * Salva a lista de alertas
   */
  static saveAlerts(list) {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(list.slice(0, 300)));
    } catch (e) {
      console.warn('Erro ao salvar alertas:', e);
    }
  }

  /**
   * Marca alerta como lido
   */
  static markAsRead(alertId) {
    const list = this.listAlerts(true);
    const updated = list.map(a => a.id === alertId ? { ...a, read: true } : a);
    this.saveAlerts(updated);
    return updated.filter(a => !a.archived);
  }

  /**
   * Marca todos os alertas como lidos
   */
  static markAllAsRead() {
    const list = this.listAlerts(true);
    const updated = list.map(a => ({ ...a, read: true }));
    this.saveAlerts(updated);
    return updated.filter(a => !a.archived);
  }

  /**
   * Arquiva alerta
   */
  static archiveAlert(alertId) {
    const list = this.listAlerts(true);
    const updated = list.map(a => a.id === alertId ? { ...a, archived: true } : a);
    this.saveAlerts(updated);
    return updated.filter(a => !a.archived);
  }

  /**
   * Cria novo alerta individual garantindo unicidade
   */
  static createAlert({
    type,
    level,
    title,
    opportunityNumber,
    opportunityTitle,
    client,
    company,
    service,
    adherence,
    daysLeft,
    message,
    portal = 'Petronect'
  }) {
    const list = this.listAlerts(true);
    const newAlert = {
      id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      level,
      title,
      opportunityNumber: String(opportunityNumber || ''),
      opportunityTitle: opportunityTitle || 'Edital Público',
      client: client || 'Petrobras',
      company: company || 'Vellia',
      service: service || 'Engenharia',
      adherence: Number(adherence) || 0,
      daysLeft: Number(daysLeft) || 0,
      message,
      portal,
      createdAt: new Date().toISOString(),
      read: false,
      archived: false
    };

    list.unshift(newAlert);
    this.saveAlerts(list);

    // Dispara notificação externa para WhatsApp e E-mail caso atenda à régua
    try {
      ExternalAlertDispatcher.dispatchAlert(newAlert);
    } catch (dispErr) {
      console.warn('[AlertService] Erro ao despachar alerta externo:', dispErr);
    }

    return newAlert;
  }

  /**
   * Analisa uma oportunidade e gera alertas automáticos com base nas regras configuradas
   */
  static evaluateOpportunity(opp, isNew = false, isUpdated = false) {
    const rules = this.getRules();
    const adherence = Number(opp.score) || 0;
    const daysLeft = Number(opp.daysLeft) !== undefined ? Number(opp.daysLeft) : 10;
    const oppNumber = String(opp.number || opp.id);
    const generated = [];

    // Tracker para evitar alertas repetidos (Fase 7 - Item 12)
    let tracker = {};
    try {
      tracker = JSON.parse(localStorage.getItem(SENT_TRACKER_KEY) || '{}');
    } catch {
      tracker = {};
    }

    // 1. Alerta de Oportunidade Nova Crítica ou Relevante (Item 11)
    if (isNew) {
      if (adherence >= rules.criticalThreshold || opp.priority === 'Crítica') {
        const key = `crit_${oppNumber}`;
        if (!tracker[key]) {
          const a = this.createAlert({
            type: AlertType.NEW_CRITICAL,
            level: AlertLevel.CRITICAL,
            title: `🔥 NOVA OPORTUNIDADE CRÍTICA — ${opp.portal || 'Petronect'}`,
            opportunityNumber: oppNumber,
            opportunityTitle: opp.title,
            client: opp.client,
            company: opp.recommendedCompany,
            service: opp.primaryService,
            adherence,
            daysLeft,
            message: `Edital com ${adherence}% de aderência para ${opp.recommendedCompany}. Prazo de ${daysLeft} dias.`
          });
          tracker[key] = new Date().toISOString();
          generated.push(a);
        }
      } else if (adherence >= rules.minAdherence) {
        const key = `rel_${oppNumber}`;
        if (!tracker[key]) {
          const a = this.createAlert({
            type: AlertType.NEW_RELEVANT,
            level: AlertLevel.HIGH,
            title: `⭐ NOVA OPORTUNIDADE RELEVANTE (${adherence}%)`,
            opportunityNumber: oppNumber,
            opportunityTitle: opp.title,
            client: opp.client,
            company: opp.recommendedCompany,
            service: opp.primaryService,
            adherence,
            daysLeft,
            message: `Aderência técnica de ${adherence}% compatível com o catálogo de serviços.`
          });
          tracker[key] = new Date().toISOString();
          generated.push(a);
        }
      }
    }

    // 2. Alerta de Prazo Curto (Item 12: 15, 7, 3, 1 dias)
    if (adherence >= 65) {
      for (const threshold of rules.deadlineThresholds) {
        if (daysLeft <= threshold) {
          const key = `deadline_${threshold}d_${oppNumber}`;
          if (!tracker[key]) {
            let level = AlertLevel.IMPORTANT;
            if (threshold <= 3) level = AlertLevel.CRITICAL;
            else if (threshold <= 7) level = AlertLevel.HIGH;

            const a = this.createAlert({
              type: AlertType.DEADLINE_SHORT,
              level,
              title: `⏰ ALERTA DE PRAZO: Faltam ${daysLeft} dia(s) para encerramento`,
              opportunityNumber: oppNumber,
              opportunityTitle: opp.title,
              client: opp.client,
              company: opp.recommendedCompany,
              service: opp.primaryService,
              adherence,
              daysLeft,
              message: `Oportunidade ${oppNumber} encerra propostas em ${daysLeft} dias (${opp.endDate}). Agilize a documentação!`
            });
            tracker[key] = new Date().toISOString();
            generated.push(a);
            break; // gera apenas para o threshold mais próximo
          }
        }
      }
    }

    try {
      localStorage.setItem(SENT_TRACKER_KEY, JSON.stringify(tracker));
    } catch {}

    return generated;
  }

  /**
   * Obtém as regras configuradas
   */
  static getRules() {
    try {
      const raw = localStorage.getItem(RULES_STORAGE_KEY);
      return raw ? { ...DEFAULT_RULES, ...JSON.parse(raw) } : DEFAULT_RULES;
    } catch {
      return DEFAULT_RULES;
    }
  }

  /**
   * Atualiza as regras configuradas
   */
  static updateRules(newRules) {
    const merged = { ...this.getRules(), ...newRules };
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('Erro ao salvar regras de alerta:', e);
    }
    return merged;
  }
}

export const alertService = AlertService;
export default AlertService;
