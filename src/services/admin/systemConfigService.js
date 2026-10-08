/**
 * VELLIA LICITAÇÕES — FASE 14: ADMINISTRAÇÃO E SEGURANÇA
 * systemConfigService.js: Configurações Gerais, Parâmetros do Agente, Versionamento de Scores e Lixeira (Soft Delete)
 * 
 * Atende aos requisitos:
 * - Item 36: Configurações Gerais (Nome, Timezone, Idioma, Moeda, Formato de Data, Empresa Padrão, Horário do Agente)
 * - Item 37: Configurações do Vellia Agent (Ativar/Pausar, Horário, Frequência, Fontes, Aderência mínima, Alertas, Retries)
 * - Itens 38, 39, 40: Configurações e Pesos de Scores (Decision Score, Risk Score, Capability Score, Win Potential)
 *   com VERSIONAMENTO ESTRITO (v1, v2...) e preservação do histórico retroativo sem alteração indevida.
 * - Itens 25, 26: Exclusão lógica (Soft Delete) e Lixeira Administrativa (Itens Arquivados) com capacidade de restauração.
 */

import { GeneralAuditService } from './generalAuditService.js';
import { SecurityService } from './securityService.js';
import { Permissions } from './permissionMatrix.js';

const STORAGE_KEY_GENERAL_CONFIG = 'vellia_admin_general_config_v14';
const STORAGE_KEY_AGENT_CONFIG = 'vellia_admin_agent_config_v14';
const STORAGE_KEY_SCORE_VERSIONS = 'vellia_admin_score_versions_v14';
const STORAGE_KEY_TRASH_BIN = 'vellia_admin_trash_bin_v14';

// 36. Configurações Gerais Padrão
const DEFAULT_GENERAL_CONFIG = {
  systemName: 'Vellia Licitações',
  tagline: 'Plataforma Corporativa de Inteligência e Gestão de Licitações Públicas',
  timezone: 'America/Sao_Paulo (UTC-3)',
  language: 'pt-BR (Português do Brasil)',
  currency: 'BRL (R$)',
  dateFormat: 'DD/MM/YYYY HH:mm',
  defaultCompany: 'Veeluen Solutions',
  maintenanceMode: false,
  maintenanceMessage: 'Sistema em manutenção programada pela equipe técnica. Previsão de retorno em instantes.'
};

// 37. Parâmetros do Vellia Agent
const DEFAULT_AGENT_CONFIG = {
  enabled: true,
  scheduleTime: '06:00',
  frequencyHours: 4,
  minAdherenceScore: 70,
  activeSources: ['Petronect', 'PNCP', 'Compras.gov.br'],
  maxRetries: 3,
  retryDelaySeconds: 30,
  autoNotifyHighAdherence: true,
  highAdherenceThreshold: 85,
  alertChannels: ['In-App', 'E-mail', 'WhatsApp Bot']
};

// 38, 39. Pesos dos Algoritmos com Versionamento
const INITIAL_SCORE_VERSIONS = [
  {
    version: 'v1.0.0',
    title: 'Baseline Operacional (Fases 1 a 10)',
    createdAt: '2026-01-15T00:00:00Z',
    createdBy: 'Sistema Inicial',
    status: 'SUPERSEDED',
    weights: {
      decisionScore: { technical: 0.35, commercial: 0.35, risk: 0.30 },
      capabilityScore: { certs: 0.40, team: 0.30, equipment: 0.30 },
      riskScore: { penaltyScope: 0.35, fineRisk: 0.35, timeline: 0.30 },
      winPotential: { historicalPrice: 0.50, competitorVolume: 0.50 }
    },
    changeNotes: 'Versão inicial calibrada para testes iniciais.'
  },
  {
    version: 'v2.0.0',
    title: 'Matriz Ponderada Refinada — Atual Ativa',
    createdAt: '2026-08-01T10:00:00Z',
    createdBy: 'Carlos Drummond',
    status: 'ACTIVE',
    weights: {
      decisionScore: { technical: 0.40, commercial: 0.40, risk: 0.20 },
      capabilityScore: { certs: 0.45, team: 0.35, equipment: 0.20 },
      riskScore: { penaltyScope: 0.40, fineRisk: 0.35, timeline: 0.25 },
      winPotential: { historicalPrice: 0.60, competitorVolume: 0.40 }
    },
    changeNotes: 'Maior ênfase técnica e capacidade de atestados Petrobras/Petronect.'
  }
];

// 25, 26. Amostras iniciais de itens na lixeira (Soft Delete)
const INITIAL_TRASH_ITEMS = [
  {
    id: 'trash-doc-01',
    originalId: 'doc-antigo-99',
    entityType: 'Documento',
    title: 'Atestado de Visita Técnica Descontinuado 2024',
    company: 'Veeluen Solutions',
    deletedBy: 'Mariana Duarte',
    deletedAt: '2026-09-28T14:20:00Z',
    data: { id: 'doc-antigo-99', title: 'Atestado de Visita Técnica Descontinuado 2024', sizeMB: 1.4 }
  },
  {
    id: 'trash-opp-02',
    originalId: 'opp-petro-998',
    entityType: 'Oportunidade',
    title: 'Fornecimento de Skids Descartados por Incompatibilidade',
    company: 'Excelência Ambiental',
    deletedBy: 'Rodrigo Santoro',
    deletedAt: '2026-10-02T16:45:00Z',
    data: { id: 'opp-petro-998', title: 'Fornecimento de Skids Descartados por Incompatibilidade', value: 850000 }
  }
];

let inMemoryGeneralConfig = { ...DEFAULT_GENERAL_CONFIG };
let inMemoryAgentConfig = { ...DEFAULT_AGENT_CONFIG };
let inMemoryScoreVersions = [...INITIAL_SCORE_VERSIONS];
let inMemoryTrashBin = [...INITIAL_TRASH_ITEMS];

export class SystemConfigService {
  static isStorageAvailable() {
    return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function';
  }

  // ==========================================
  // CONFIGURAÇÕES GERAIS (Item 36)
  // ==========================================
  static getGeneralConfig() {
    if (this.isStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_GENERAL_CONFIG);
        if (raw) return { ...DEFAULT_GENERAL_CONFIG, ...JSON.parse(raw) };
      } catch (e) {
        console.warn('Erro ao ler general config:', e);
      }
    }
    return inMemoryGeneralConfig;
  }

  static updateGeneralConfig(updatedData, responsibleUser = 'Administrador') {
    const prev = this.getGeneralConfig();
    const merged = { ...prev, ...updatedData };
    inMemoryGeneralConfig = merged;

    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_GENERAL_CONFIG, JSON.stringify(merged));
      } catch (e) {
        console.warn('Erro ao salvar general config:', e);
      }
    }

    GeneralAuditService.logAction({
      user: responsibleUser,
      module: 'Configurações',
      action: 'Atualização de Configurações Gerais',
      object: 'GeneralConfig',
      diffBefore: prev,
      diffAfter: merged,
      result: 'SUCESSO'
    });

    return merged;
  }

  // ==========================================
  // CONFIGURAÇÕES DO AGENTE (Item 37)
  // ==========================================
  static getAgentConfig() {
    if (this.isStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_AGENT_CONFIG);
        if (raw) return { ...DEFAULT_AGENT_CONFIG, ...JSON.parse(raw) };
      } catch (e) {
        console.warn('Erro ao ler agent config:', e);
      }
    }
    return inMemoryAgentConfig;
  }

  static updateAgentConfig(updatedData, responsibleUser = 'Administrador') {
    const prev = this.getAgentConfig();
    const merged = { ...prev, ...updatedData };
    inMemoryAgentConfig = merged;

    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_AGENT_CONFIG, JSON.stringify(merged));
      } catch (e) {
        console.warn('Erro ao salvar agent config:', e);
      }
    }

    GeneralAuditService.logAction({
      user: responsibleUser,
      module: 'Vellia Agent',
      action: 'Atualização de Parâmetros do Agente',
      object: 'AgentConfig',
      diffBefore: prev,
      diffAfter: merged,
      result: 'SUCESSO'
    });

    return merged;
  }

  // ==========================================
  // VERSIONAMENTO DE SCORES & PESOS (Itens 38, 39, 40)
  // ==========================================
  static getScoreVersions() {
    if (this.isStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_SCORE_VERSIONS);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Erro ao ler versões de score:', e);
      }
    }
    return inMemoryScoreVersions;
  }

  static getActiveScoreVersion() {
    const versions = this.getScoreVersions();
    return versions.find(v => v.status === 'ACTIVE') || versions[versions.length - 1];
  }

  /**
   * 39, 40. Ao alterar pesos, NUNCA sobrescrever o histórico antigo.
   * Cria-se uma nova versão imutável (ex: v2.1.0, v3.0.0) e marca a anterior como SUPERSEDED.
   */
  static publishNewScoreVersion({ title, newWeights, changeNotes }, responsibleUser = 'Administrador') {
    const versions = this.getScoreVersions();
    const activeVersion = this.getActiveScoreVersion();

    // Calcula próxima versão
    const match = activeVersion.version.match(/v(\d+)\.(\d+)\.(\d+)/);
    const major = match ? parseInt(match[1]) : 2;
    const minor = match ? parseInt(match[2]) + 1 : 1;
    const nextVersionTag = `v${major}.${minor}.0`;

    // Marca anteriores como SUPERSEDED
    const updatedVersions = versions.map(v => ({
      ...v,
      status: v.status === 'ACTIVE' ? 'SUPERSEDED' : v.status
    }));

    const newVersionEntry = {
      version: nextVersionTag,
      title: title || `Calibração de Scores — ${nextVersionTag}`,
      createdAt: new Date().toISOString(),
      createdBy: responsibleUser,
      status: 'ACTIVE',
      weights: newWeights,
      changeNotes: changeNotes || 'Ajuste de pesos ponderados'
    };

    updatedVersions.push(newVersionEntry);
    inMemoryScoreVersions = updatedVersions;

    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_SCORE_VERSIONS, JSON.stringify(updatedVersions));
      } catch (e) {
        console.warn('Erro ao salvar nova versão de score:', e);
      }
    }

    GeneralAuditService.logAction({
      user: responsibleUser,
      module: 'Configurações de Score',
      action: 'Publicação de Nova Versão de Algoritmo de Score',
      object: `ScoreVersion: ${nextVersionTag}`,
      recordId: nextVersionTag,
      diffBefore: { previousActive: activeVersion.version, previousWeights: activeVersion.weights },
      diffAfter: { active: nextVersionTag, newWeights: newWeights },
      result: 'SUCESSO'
    });

    return newVersionEntry;
  }

  // ==========================================
  // EXCLUSÃO LÓGICA & LIXEIRA ADMINISTRATIVA (Itens 25, 26)
  // ==========================================
  static getTrashItems() {
    if (this.isStorageAvailable()) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_TRASH_BIN);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn('Erro ao ler lixeira:', e);
      }
    }
    return inMemoryTrashBin;
  }

  static saveTrashItems(items) {
    inMemoryTrashBin = items;
    if (this.isStorageAvailable()) {
      try {
        localStorage.setItem(STORAGE_KEY_TRASH_BIN, JSON.stringify(items));
      } catch (e) {
        console.warn('Erro ao salvar lixeira:', e);
      }
    }
  }

  /**
   * 25. Envia registro para exclusão lógica (soft delete)
   */
  static moveToTrash({ originalId, entityType, title, company, data }, responsibleUser = 'Administrador') {
    const items = this.getTrashItems();
    const trashEntry = {
      id: `trash-${Date.now().toString(36)}`,
      originalId,
      entityType,
      title,
      company: company || 'Veeluen Solutions',
      deletedBy: responsibleUser,
      deletedAt: new Date().toISOString(),
      data
    };

    items.unshift(trashEntry);
    this.saveTrashItems(items);

    GeneralAuditService.logAction({
      user: responsibleUser,
      module: 'Lixeira Administrativa',
      action: `Exclusão Lógica (${entityType})`,
      object: title,
      recordId: originalId,
      diffBefore: data,
      diffAfter: { softDeleted: true, trashId: trashEntry.id },
      result: 'SUCESSO'
    });

    return trashEntry;
  }

  /**
   * 26. Restaura item da lixeira
   */
  static restoreFromTrash(trashId, responsibleUser = 'Administrador') {
    const items = this.getTrashItems();
    const item = items.find(i => i.id === trashId);
    if (!item) throw new Error(`Item ID "${trashId}" não encontrado na lixeira.`);

    const remaining = items.filter(i => i.id !== trashId);
    this.saveTrashItems(remaining);

    GeneralAuditService.logAction({
      user: responsibleUser,
      module: 'Lixeira Administrativa',
      action: `Restauração de Item Arquivado (${item.entityType})`,
      object: item.title,
      recordId: item.originalId,
      diffBefore: { inTrash: true },
      diffAfter: { inTrash: false, restoredAt: new Date().toISOString() },
      result: 'SUCESSO'
    });

    return item;
  }
}
