/**
 * VELLIA LICITAÇÕES — FASE 21: QA + OBSERVABILIDADE + PREPARAÇÃO PARA PRODUÇÃO
 * featureFlagsService.js: Gerenciador de Feature Flags e Rollout Gradual (Canary)
 * 
 * Atende aos requisitos:
 * - Itens 49 e 50: Habilitação e desabilitação dinâmica de funcionalidades operacionais
 *   (PNCP, Compras.gov, Copilot, E-mail, Calendário, Command Center) e ativação gradual.
 */

const STORAGE_KEY_FLAGS = 'vellia_feature_flags_v21';

const DEFAULT_FLAGS = {
  PNCP_SYNC_ENABLED: { enabled: true, description: 'Sincronização contínua com Portal Nacional de Contratações Públicas (PNCP)' },
  COMPRASGOV_SYNC_ENABLED: { enabled: true, description: 'Sincronização oficial com Compras.gov.br' },
  PETRONECT_SYNC_ENABLED: { enabled: true, description: 'Monitoramento do Portal Petronect (Petrobras/O&G)' },
  COPILOT_ENABLED: { enabled: true, description: 'Assistente Executivo e Operacional Vellia Copilot' },
  EMAIL_SYNC_ENABLED: { enabled: true, description: 'Sincronização bidirecional de e-mails (Gmail/Outlook)' },
  CALENDAR_SYNC_ENABLED: { enabled: true, description: 'Sincronização de reuniões e compromissos com Calendários' },
  EXECUTIVE_COMMAND_CENTER_ENABLED: { enabled: true, description: 'Módulo Command Center Executivo e Previsão de Pipeline' },
  EARLY_RADAR_PREDICTIONS: { enabled: true, description: 'Predição de editais futuros e contratos a vencer' },
  CANARY_ROLLOUT_PCT: { enabled: true, value: 100, description: 'Percentual de usuários aptos a receber novas versões em canary (0 a 100%)' }
};

export class FeatureFlagsService {
  static getFlags() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const stored = window.localStorage.getItem(STORAGE_KEY_FLAGS);
        if (stored) {
          return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
        }
      }
    } catch (e) {
      console.warn('Erro ao ler feature flags:', e);
    }
    return { ...DEFAULT_FLAGS };
  }

  static isEnabled(flagKey, userId = null) {
    const flags = this.getFlags();
    const flag = flags[flagKey];
    if (!flag) return false;

    // Se houver controle de canary rollout
    if (flagKey === 'CANARY_ROLLOUT_PCT') {
      const pct = flag.value ?? 100;
      if (!userId) return pct > 0;
      // Hash determinístico simples do userId para distribuição uniforme
      const charSum = String(userId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return (charSum % 100) < pct;
    }

    return Boolean(flag.enabled);
  }

  static setFlag(flagKey, enabledValue, modifiedBy = 'Admin') {
    const flags = this.getFlags();
    if (!flags[flagKey]) {
      flags[flagKey] = { description: `Feature Flag ${flagKey}` };
    }

    if (typeof enabledValue === 'boolean') {
      flags[flagKey].enabled = enabledValue;
    } else if (typeof enabledValue === 'object') {
      flags[flagKey] = { ...flags[flagKey], ...enabledValue };
    }

    flags[flagKey].lastModified = new Date().toISOString();
    flags[flagKey].lastModifiedBy = modifiedBy;

    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(STORAGE_KEY_FLAGS, JSON.stringify(flags));
      }
    } catch (e) {
      console.warn('Erro ao salvar feature flags:', e);
    }

    return flags[flagKey];
  }

  static resetDefaults() {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.removeItem === 'function') {
        window.localStorage.removeItem(STORAGE_KEY_FLAGS);
      }
    } catch (e) {
      console.warn('Erro ao resetar flags:', e);
    }
    return { ...DEFAULT_FLAGS };
  }
}
