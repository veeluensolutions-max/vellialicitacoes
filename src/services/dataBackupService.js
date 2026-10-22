/**
 * VELLIA LICITAÇÕES — SERVIÇO DE BACKUP E RESTAURAÇÃO DE DADOS
 * Garante persistência, portabilidade e segurança operacional completa da plataforma.
 */

import { EventBus, VELLIA_EVENTS } from './eventBus.js';

export const BACKUP_KEYS = [
  'vellia_opportunities_db_v2',
  'vellia_opportunity_decisions_v1',
  'vellia_proposals_v1',
  'vellia_vault_documents_v1',
  'vellia_vault_attestations_v1',
  'vellia_vault_arts_v1',
  'vellia_vault_cats_v1',
  'vellia_vault_personnel_v1',
  'vellia_vault_equipment_v1',
  'vellia_alerts_v1',
  'vellia_decision_audit_v1',
  'vellia_source_metrics_v15',
  'vellia_alert_rules_v1'
];

export class DataBackupService {
  /**
   * Gera e faz o download de um arquivo JSON com o snapshot completo de dados
   */
  static exportSnapshot() {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('Ambiente sem suporte a localStorage.');
    }

    const payload = {};
    const summary = {};

    BACKUP_KEYS.forEach(key => {
      try {
        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          payload[key] = parsed;
          summary[key] = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
        } else {
          payload[key] = null;
        }
      } catch (err) {
        console.warn(`[DataBackupService] Erro ao exportar chave ${key}:`, err);
      }
    });

    const now = new Date();
    const dateFormatted = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    const backupData = {
      app: 'Vellia Licitações',
      version: '2.0.0-Baseline',
      exportedAt: now.toISOString(),
      summary,
      payload
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `backup_vellia_licitacoes_${dateFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    return {
      success: true,
      filename: `backup_vellia_licitacoes_${dateFormatted}.json`,
      summary
    };
  }

  /**
   * Restaura um snapshot JSON no localStorage e atualiza os ouvintes do EventBus
   */
  static async importSnapshot(jsonContent) {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('Ambiente sem suporte a localStorage.');
    }

    let parsedData = null;
    if (typeof jsonContent === 'string') {
      try {
        parsedData = JSON.parse(jsonContent);
      } catch {
        throw new Error('Arquivo JSON inválido ou corrompido.');
      }
    } else if (typeof jsonContent === 'object' && jsonContent !== null) {
      parsedData = jsonContent;
    } else {
      throw new Error('Conteúdo do backup fornecido é inválido.');
    }

    const payload = parsedData.payload || parsedData;
    let importedKeys = 0;
    const restoredSummary = {};

    BACKUP_KEYS.forEach(key => {
      if (payload[key] !== undefined && payload[key] !== null) {
        try {
          localStorage.setItem(key, JSON.stringify(payload[key]));
          importedKeys++;
          restoredSummary[key] = Array.isArray(payload[key]) 
            ? payload[key].length 
            : typeof payload[key] === 'object' 
              ? Object.keys(payload[key]).length 
              : 1;
        } catch (err) {
          console.warn(`[DataBackupService] Erro ao restaurar ${key}:`, err);
        }
      }
    });

    if (importedKeys === 0) {
      throw new Error('Nenhum dado compatível do Vellia Licitações foi encontrado no arquivo.');
    }

    // Notifica todos os módulos reativos para recarregar o estado
    EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, { source: 'BACKUP_RESTORE' });
    EventBus.emit(VELLIA_EVENTS.DECISION_UPDATED, { source: 'BACKUP_RESTORE' });
    EventBus.emit(VELLIA_EVENTS.DOCUMENT_VAULT_UPDATED, { source: 'BACKUP_RESTORE' });
    EventBus.emit(VELLIA_EVENTS.PROPOSAL_UPDATED, { source: 'BACKUP_RESTORE' });

    return {
      success: true,
      importedKeys,
      summary: restoredSummary
    };
  }
}

export default DataBackupService;
