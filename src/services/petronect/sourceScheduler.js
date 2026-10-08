/**
 * VELLIA LICITAÇÕES - SOURCE SCHEDULER (FASE 6)
 * Gestão de configuração e execução programada do monitoramento de fontes.
 */

const SCHEDULER_STORAGE_KEY = 'vellia_source_scheduler_v1';

export class SourceSchedulerService {
  static getSettings() {
    try {
      const data = localStorage.getItem(SCHEDULER_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Erro ao carregar scheduler settings:', e);
    }
    return {
      enabled: false,
      frequency: 'Diária', // 'Diária' | 'Duas vezes ao dia' | 'Personalizada'
      time: '06:30',
      customTimes: '06:30, 14:00',
      timezone: 'America/Recife (UTC-3)',
      mode: 'INCREMENTAL', // 'COMPLETA' | 'INCREMENTAL'
      notifyOnNewMatches: true,
      lastRun: null,
      nextRun: 'Aguardando ativação pelo gestor comercial'
    };
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(SCHEDULER_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Erro ao salvar scheduler settings:', e);
    }
  }

  static updateSettings(partial) {
    const current = this.getSettings();
    const updated = {
      ...current,
      ...partial,
      nextRun: partial.enabled !== false 
        ? `Hoje às ${partial.time || current.time} (${current.timezone})` 
        : 'Monitoramento automático desativado'
    };
    this.saveSettings(updated);
    return updated;
  }
}
