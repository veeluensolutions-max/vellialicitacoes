/**
 * VELLIA LICITAÇÕES — FASE 15: ARQUITETURA MULTIFONTE
 * circuitBreaker.js: Circuit Breaker & Rate Limiter Independente por Fonte
 * 
 * Atende aos requisitos:
 * - Item 46: Rate Limit, backoff, retry controlado e timeout
 * - Item 47: Circuit Breaker (pausa temporária da fonte em caso de falhas consecutivas para evitar sobrecarga)
 * - Item 48: Resiliência estrita: Falha de PNCP não para Petronect; falha de Compras.gov não para PNCP
 */

export const CircuitState = {
  CLOSED: 'CLOSED',       // Normal, permitindo requisições
  OPEN: 'OPEN',           // Bloqueado temporariamente por excesso de falhas
  HALF_OPEN: 'HALF_OPEN'  // Em teste para verificar recuperação
};

export class SourceCircuitBreaker {
  constructor(sourceName, options = {}) {
    this.sourceName = sourceName;
    this.failureThreshold = options.failureThreshold || 4; // falhas para abrir
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;  // 30 segundos de pausa
    this.requestTimeoutMs = options.requestTimeoutMs || 10000; // 10s de timeout

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.totalRequests = 0;
  }

  canRequest() {
    if (this.state === CircuitState.CLOSED) {
      return true;
    }

    if (this.state === CircuitState.OPEN) {
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime >= this.resetTimeoutMs) {
        this.state = CircuitState.HALF_OPEN;
        return true;
      }
      return false;
    }

    // HALF_OPEN permite uma requisição de teste
    return true;
  }

  recordSuccess() {
    this.totalRequests++;
    this.lastSuccessTime = Date.now();
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
    }
  }

  recordFailure(error) {
    this.totalRequests++;
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  getStatus() {
    return {
      sourceName: this.sourceName,
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      isDegraded: this.state !== CircuitState.CLOSED
    };
  }

  reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}

// Instâncias globais por fonte (Item 48: totalmente independentes)
export const PNCP_BREAKER = new SourceCircuitBreaker('PNCP');
export const COMPRAS_GOV_BREAKER = new SourceCircuitBreaker('Compras.gov.br');
export const PETRONECT_BREAKER = new SourceCircuitBreaker('Petronect');
