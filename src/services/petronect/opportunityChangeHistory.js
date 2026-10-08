/**
 * VELLIA LICITAÇÕES - OPPORTUNITY CHANGE HISTORY (FASE 6)
 * Registro de histórico de alterações de campos em oportunidades (ex: prorrogação de prazo, alteração de valor ou escopo).
 */

const CHANGE_HISTORY_STORAGE_KEY = 'vellia_opp_change_history_v1';

export class OpportunityChangeHistoryService {
  static getHistory() {
    try {
      const data = localStorage.getItem(CHANGE_HISTORY_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Erro ao carregar histórico de alterações:', e);
    }
    return [
      {
        id: 'ch-seed-1',
        opportunityNumber: '7004321234',
        field: 'Data de Encerramento',
        previousValue: '12/10/2026',
        newValue: '19/10/2026',
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
        source: 'Petronect (Aditivo Oficial de Prazo)',
        observation: 'Prorrogação de 7 dias concedida pela Comissão de Licitação da Petrobras.'
      }
    ];
  }

  static saveHistory(list) {
    try {
      localStorage.setItem(CHANGE_HISTORY_STORAGE_KEY, JSON.stringify(list.slice(0, 500)));
    } catch (e) {
      console.warn('Erro ao salvar histórico de alterações:', e);
    }
  }

  static recordChange({ opportunityNumber, field, previousValue, newValue, source = 'Petronect', observation = '' }) {
    if (previousValue === newValue) return null;

    const list = this.getHistory();
    const entry = {
      id: `ch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      opportunityNumber,
      field,
      previousValue: String(previousValue || 'Vazio'),
      newValue: String(newValue || 'Vazio'),
      date: new Date().toISOString(),
      source,
      observation
    };

    list.unshift(entry);
    this.saveHistory(list);
    return entry;
  }

  static getByOpportunity(opportunityNumber) {
    return this.getHistory().filter(h => h.opportunityNumber === String(opportunityNumber));
  }
}
