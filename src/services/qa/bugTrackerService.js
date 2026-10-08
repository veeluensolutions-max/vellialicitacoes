/**
 * VELLIA LICITAÇÕES — FASE 21: QA + OBSERVABILIDADE + PREPARAÇÃO PARA PRODUÇÃO
 * bugTrackerService.js: Rastreamento Interno de Bugs e Gestão de Severidade P0-P3
 * 
 * Atende aos requisitos:
 * - Itens 105 e 106: Central de bugs com campos (Bug, Severidade P0-P3, Status, Responsável, Versão)
 *   e ciclo de vida (Open, In Progress, Fixed, Verified, Closed).
 */

import { BugStatus, TestSeverity } from './qaModels.js';

const STORAGE_KEY_BUGS = 'vellia_bug_tracker_v21';

const INITIAL_BUGS = [
  {
    id: 'BUG-101',
    title: 'Ajuste de margem mínima para empresas sem custos indiretos detalhados',
    severity: TestSeverity.P2,
    status: BugStatus.FIXED,
    module: 'ProposalPricingService',
    responsible: 'Engenharia Financeira',
    version: 'v2.0.4',
    createdAt: '2026-10-06T10:00:00Z',
    resolvedAt: '2026-10-07T14:30:00Z',
    description: 'Quando uma proposta era gerada sem custos indiretos pré-cadastrados, a margem bruta não exibia aviso explicativo.'
  },
  {
    id: 'BUG-102',
    title: 'Sanitização de caracteres especiais em anexos do portal PNCP',
    severity: TestSeverity.P2,
    status: BugStatus.VERIFIED,
    module: 'PncpAdapter',
    responsible: 'Integrações',
    version: 'v2.0.5',
    createdAt: '2026-10-07T11:20:00Z',
    resolvedAt: '2026-10-08T09:00:00Z',
    description: 'Arquivos com acentuação no nome geravam alerta secundário no console antes do encode URI.'
  },
  {
    id: 'BUG-103',
    title: 'Refinamento visual de contraste no badge de alta prioridade',
    severity: TestSeverity.P3,
    status: BugStatus.CLOSED,
    module: 'CommandCenterView',
    responsible: 'Design System',
    version: 'v2.0.6',
    createdAt: '2026-10-08T10:00:00Z',
    resolvedAt: '2026-10-08T13:40:00Z',
    description: 'Aumentado contraste da cor de fundo para atendimento integral às diretrizes WCAG AA.'
  }
];

export class BugTrackerService {
  static getBugs(filters = {}) {
    let list = [...INITIAL_BUGS];

    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        const stored = window.localStorage.getItem(STORAGE_KEY_BUGS);
        if (stored) {
          list = JSON.parse(stored);
        }
      }
    } catch (e) {}

    if (filters.severity && filters.severity !== 'ALL') {
      list = list.filter(b => b.severity === filters.severity);
    }
    if (filters.status && filters.status !== 'ALL') {
      list = list.filter(b => b.status === filters.status);
    }
    if (filters.module && filters.module !== 'ALL') {
      list = list.filter(b => b.module === filters.module);
    }

    return list;
  }

  static getOpenP0Count() {
    const bugs = this.getBugs();
    return bugs.filter(b => b.severity === TestSeverity.P0 && (b.status === BugStatus.OPEN || b.status === BugStatus.IN_PROGRESS)).length;
  }

  static addBug({ title, severity = TestSeverity.P2, module = 'Geral', responsible = 'Não atribuído', description = '', version = 'v2.1.0' }) {
    const list = this.getBugs();
    const newBug = {
      id: `BUG-${Date.now().toString().slice(-4)}`,
      title,
      severity,
      status: BugStatus.OPEN,
      module,
      responsible,
      version,
      description,
      createdAt: new Date().toISOString(),
      resolvedAt: null
    };

    list.unshift(newBug);
    this._saveBugs(list);
    return newBug;
  }

  static updateBugStatus(bugId, newStatus, updatedBy = 'Admin') {
    const list = this.getBugs();
    const bug = list.find(b => b.id === bugId);
    if (!bug) return null;

    bug.status = newStatus;
    if (newStatus === BugStatus.FIXED || newStatus === BugStatus.VERIFIED || newStatus === BugStatus.CLOSED) {
      bug.resolvedAt = bug.resolvedAt || new Date().toISOString();
    }
    bug.lastUpdatedBy = updatedBy;

    this._saveBugs(list);
    return bug;
  }

  static _saveBugs(list) {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(STORAGE_KEY_BUGS, JSON.stringify(list));
      }
    } catch (e) {}
  }
}
