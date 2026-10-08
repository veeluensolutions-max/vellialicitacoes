/**
 * VELLIA LICITAÇÕES - LOG SERVICE (FASE 5)
 * Gerenciamento centralizado de logs de auditoria, ingestão e inteligência.
 */

const LOGS_STORAGE_KEY = 'vellia_system_logs';

export const LogType = {
  IMPORT: 'IMPORT',
  UPDATE: 'UPDATE',
  ERROR: 'ERROR',
  ANALYSIS: 'ANALYSIS',
  REPROCESS: 'REPROCESS',
  DUPLICATE: 'DUPLICATE',
  MANUAL: 'MANUAL',
  INGESTION: 'INGESTION',
  DECISION: 'DECISION'
};

class LogService {
  constructor() {
    this.logs = this.loadLogs();
  }

  loadLogs() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const data = window.localStorage.getItem(LOGS_STORAGE_KEY);
        if (data) return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Erro ao carregar logs do localStorage:', e);
    }
    return [
      {
        id: 'log-seed-1',
        type: LogType.INGESTION,
        message: 'Ambiente de monitoramento inicializado. Fonte Petronect configurada em modo Preparado.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        details: { portal: 'Petronect', status: 'Preparado' }
      },
      {
        id: 'log-seed-2',
        type: LogType.ANALYSIS,
        message: 'Motor de Aderência executado para o lote inicial do radar (6 oportunidades prioritárias).',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        details: { batchSize: 6, averageScore: 85 }
      }
    ];
  }

  saveLogs() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(this.logs.slice(0, 300)));
      }
    } catch (e) {
      console.warn('Erro ao salvar logs:', e);
    }
  }

  addLog(type, message, details = {}) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      details
    };
    this.logs.unshift(entry);
    this.saveLogs();
    return entry;
  }

  getLogs(limit = 50, filterType = null) {
    if (filterType) {
      return this.logs.filter(l => l.type === filterType).slice(0, limit);
    }
    return this.logs.slice(0, limit);
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
}

export const logService = new LogService();
