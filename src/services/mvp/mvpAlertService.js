/**
 * VELLIA LICITAÇÕES — FASE 24
 * mvpAlertService.js
 * 
 * Central Única de Alertas Operacionais.
 * Elimina duplicações de alertas entre módulos (Oportunidade, Prazo, Documento, Proposta, Sistema).
 */

const STORAGE_KEY = 'vellia_consolidated_alerts_v1';

const INITIAL_ALERTS = [
  {
    id: 'ALT-101',
    uniqueKey: 'PRAZO_OPP_7004218902',
    type: 'PRAZO',
    title: 'Prazo Crítico • Edital Petrobras Bacia de Santos',
    description: 'Restam apenas 3 dias para encerramento do prazo de envio de proposta.',
    severity: 'CRITICAL',
    source: 'OPPORTUNITY',
    sourceId: '7004218902',
    timestamp: 'Há 15 minutos',
    read: false,
    actionLabel: 'Ver Oportunidade',
    actionTarget: 'oportunidades'
  },
  {
    id: 'ALT-102',
    uniqueKey: 'OPP_NEW_7004218903',
    type: 'OPORTUNIDADE',
    title: 'Nova Oportunidade de Alta Aderência (94%)',
    description: 'Monitoramento Ambiental Búzios identificado no Petronect com match pleno.',
    severity: 'HIGH',
    source: 'RADAR',
    sourceId: '7004218903',
    timestamp: 'Há 1 hora',
    read: false,
    actionLabel: 'Analisar Agora',
    actionTarget: 'oportunidades'
  },
  {
    id: 'ALT-103',
    uniqueKey: 'DOC_EXP_CND_01',
    type: 'DOCUMENTO',
    title: 'Certidão Negativa Próxima ao Vencimento',
    description: 'CND Federal da Veeluen Solutions vence em 5 dias.',
    severity: 'MEDIUM',
    source: 'DOCUMENT',
    sourceId: 'DOC-CND-01',
    timestamp: 'Hoje às 08:30',
    read: false,
    actionLabel: 'Ir para Documentos',
    actionTarget: 'documentos'
  },
  {
    id: 'ALT-104',
    uniqueKey: 'PROP_REV_7004218902',
    type: 'PROPOSTA',
    title: 'Revisão de Margem Requerida',
    description: 'Proposta PROP-7004218902 aguarda aprovação de margem comercial de 24.5%.',
    severity: 'MEDIUM',
    source: 'PROPOSAL',
    sourceId: 'PROP-7004218902',
    timestamp: 'Hoje às 09:15',
    read: false,
    actionLabel: 'Revisar Proposta',
    actionTarget: 'propostas'
  }
];

class MvpAlertService {
  constructor() {
    this.alerts = this.loadAlerts();
  }

  loadAlerts() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao carregar alertas locais:', e);
    }
    return [...INITIAL_ALERTS];
  }

  saveAlerts() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.alerts));
      }
    } catch (e) {
      console.warn('Erro ao salvar alertas:', e);
    }
  }

  getAlerts(filterType = null) {
    if (filterType) {
      return this.alerts.filter(a => a.type === filterType);
    }
    return [...this.alerts];
  }

  getUnreadCount() {
    return this.alerts.filter(a => !a.read).length;
  }

  addAlert(alertData) {
    const key = alertData.uniqueKey || `${alertData.type}_${alertData.sourceId || Date.now()}`;
    const exists = this.alerts.find(a => a.uniqueKey === key);
    if (exists) {
      // Atualiza alerta existente sem duplicar
      Object.assign(exists, alertData, { timestamp: 'Atualizado agora' });
      this.saveAlerts();
      return exists;
    }

    const newAlert = {
      id: `ALT-${Date.now().toString().slice(-4)}`,
      uniqueKey: key,
      type: alertData.type || 'SISTEMA',
      title: alertData.title || 'Novo Alerta',
      description: alertData.description || '',
      severity: alertData.severity || 'MEDIUM',
      source: alertData.source || 'SISTEMA',
      sourceId: alertData.sourceId || '',
      timestamp: 'Agora mesmo',
      read: false,
      actionLabel: alertData.actionLabel || 'Visualizar',
      actionTarget: alertData.actionTarget || 'dashboard'
    };

    this.alerts.unshift(newAlert);
    this.saveAlerts();
    return newAlert;
  }

  markAsRead(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.read = true;
      this.saveAlerts();
    }
  }

  markAllAsRead() {
    this.alerts.forEach(a => { a.read = true; });
    this.saveAlerts();
  }
}

export const mvpAlertService = new MvpAlertService();
