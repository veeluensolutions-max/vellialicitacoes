/**
 * VELLIA LICITAÇÕES — FASE 13: COPILOTO VELLIA
 * AuditService: Auditoria de Consultas, Decisões e Coleta de Feedback (Itens 46 e 47).
 * 
 * Regras:
 * - Registra toda interação do usuário com o Copilot.
 * - Armazena intenção detectada, módulos consultados, resumo da resposta e ações acionadas.
 * - Registra feedback (Útil / Não Útil) com comentário opcional para evolução do sistema.
 */

const AUDIT_STORAGE_KEY = 'vellia_copilot_audit_logs_v1';

const memoryLogs = [];

function getLogs() {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch {}
  return memoryLogs;
}

function saveLogs(logs) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    }
  } catch {}
  if (logs !== memoryLogs) {
    memoryLogs.length = 0;
    memoryLogs.push(...logs);
  }
}

export class AuditService {
  /**
   * Registra uma interação do copiloto
   */
  static logInteraction({
    user = 'Operador Comercial',
    role = 'GESTAO_COMERCIAL',
    query = '',
    intent = '',
    modulesConsulted = [],
    responseSummary = '',
    actionsAvailable = []
  }) {
    const logs = getLogs();
    const entry = {
      id: `audit-copilot-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      dateStr: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user,
      role,
      query,
      intent,
      modulesConsulted,
      responseSummary: responseSummary.substring(0, 300),
      actionsAvailable: actionsAvailable.map(a => a.label || a.id),
      feedback: null
    };

    logs.unshift(entry);
    saveLogs(logs.slice(0, 200)); // Mantém os últimos 200 logs
    return entry.id;
  }

  /**
   * Registra feedback do usuário sobre a utilidade da resposta (Item 47)
   */
  static recordFeedback(logId, isHelpful, comment = '') {
    const logs = getLogs();
    const item = logs.find(l => l.id === logId);
    if (item) {
      item.feedback = {
        isHelpful: !!isHelpful,
        comment: comment || '',
        recordedAt: new Date().toISOString()
      };
      saveLogs(logs);
      return true;
    }
    return false;
  }

  /**
   * Lista todos os logs de auditoria
   */
  static listLogs() {
    return getLogs();
  }

  /**
   * Limpa logs para testes
   */
  static clearLogs() {
    saveLogs([]);
  }
}

export default AuditService;
