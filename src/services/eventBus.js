/**
 * VELLIA LICITAÇÕES — BARRAMENTO REATIVO DE EVENTOS (EVENTBUS)
 * Permite sincronização instantânea de estado entre telas, componentes e serviços
 * sem dependências externas pesadas.
 */

export const VELLIA_EVENTS = {
  OPPORTUNITIES_UPDATED: 'vellia-opportunities-updated',
  SYNC_STARTED: 'vellia-sync-started',
  SYNC_COMPLETED: 'vellia-sync-completed',
  ALERT_TRIGGERED: 'vellia-alert-triggered',
  DECISION_UPDATED: 'vellia-decision-updated',
  PROPOSAL_UPDATED: 'vellia-proposal-updated',
  DOCUMENT_VAULT_UPDATED: 'vellia-document-vault-updated'
};

class VelliaEventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Inscreve um callback para um evento específico.
   * Retorna uma função de unsubscribe para uso em useEffect.
   */
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Também ouve eventos disparados via window.dispatchEvent
    const windowHandler = (e) => {
      try {
        callback(e.detail);
      } catch (err) {
        console.warn(`[EventBus] Erro ao processar evento ${event}:`, err);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(event, windowHandler);
    }

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener(event, windowHandler);
      }
    };
  }

  /**
   * Emite um evento para todos os ouvintes internos e dispara CustomEvent no window.
   */
  emit(event, data = {}) {
    const detail = {
      ...data,
      timestamp: Date.now()
    };

    // Disparo interno
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(cb => {
        try {
          cb(detail);
        } catch (err) {
          console.warn(`[EventBus] Erro ao executar callback de ${event}:`, err);
        }
      });
    }

    // Disparo no window global
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent(event, { detail }));
      } catch (err) {
        console.warn(`[EventBus] Erro ao disparar CustomEvent no window:`, err);
      }
    }
  }
}

export const EventBus = new VelliaEventBus();
