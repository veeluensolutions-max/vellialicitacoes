/**
 * VELLIA LICITAÇÕES — CONECTOR OFICIAL COMPRAS.GOV.BR (100% DADOS REAIS)
 * Sem dados fictícios ou mocks.
 */

import { COMPRAS_GOV_BREAKER } from './circuitBreaker.js';
import { ComprasGovLiveCollectorService } from '../comprasgov/comprasGovLiveCollectorService.js';

// Zero dados fictícios
export const MOCK_COMPRAS_GOV_RECORDS = [];

export class ComprasGovConnector {
  static async checkHealth() {
    const startTime = Date.now();
    try {
      if (!COMPRAS_GOV_BREAKER.canRequest()) {
        return {
          status: 'DEGRADED',
          message: 'Circuit Breaker do Compras.gov.br ativo.',
          latencyMs: 0,
          timestamp: new Date().toISOString()
        };
      }

      const liveCheck = await ComprasGovLiveCollectorService.testLiveConnection();
      COMPRAS_GOV_BREAKER.recordSuccess();

      return {
        status: liveCheck.success ? 'ONLINE' : 'DEGRADED',
        message: liveCheck.message,
        latencyMs: liveCheck.latencyMs,
        version: 'v2.0.0-cgov-realtime',
        timestamp: new Date().toISOString()
      };
    } catch (err) {
      COMPRAS_GOV_BREAKER.recordFailure(err);
      return {
        status: 'OFFLINE',
        message: `Falha na API Compras.gov: ${err.message}`,
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  static async fetchOpportunities({
    uf = null,
    page = 1,
    pageSize = 20
  } = {}) {
    if (!COMPRAS_GOV_BREAKER.canRequest()) {
      throw new Error('ComprasGovConnector: Requisição em pausa temporária.');
    }

    try {
      let records = await ComprasGovLiveCollectorService.collectLiveOpportunities();
      if (!Array.isArray(records)) records = [];

      if (uf && uf !== 'ALL' && uf !== 'BR') {
        records = records.filter(r => r.uf === uf);
      }

      const totalRecords = records.length;
      const totalPages = Math.ceil(totalRecords / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

      COMPRAS_GOV_BREAKER.recordSuccess();

      return {
        success: true,
        source: 'Compras.gov.br',
        page,
        pageSize,
        totalRecords,
        totalPages,
        data: paginatedRecords,
        fetchedAt: new Date().toISOString()
      };
    } catch (err) {
      COMPRAS_GOV_BREAKER.recordFailure(err);
      throw new Error(`ComprasGovConnector: Falha ao consultar Dados Abertos Compras.gov: ${err.message}`);
    }
  }

  static async getPreviewRecords() {
    const res = await this.fetchOpportunities({ page: 1, pageSize: 10 });
    return res.data;
  }
}
