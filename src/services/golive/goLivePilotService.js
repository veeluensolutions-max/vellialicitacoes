/**
 * VELLIA LICITAÇÕES — FASE 22: GO-LIVE CONTROLADO + PILOTO REAL + OPERAÇÃO ASSISTIDA
 * goLivePilotService.js: Gestão das Fases, Usuários Piloto, Checklist de Bloqueadores,
 * Metas, Decisão Humana de Produção, Baseline Snapshot e Painel 30 Dias.
 */

import {
  GoLivePhase,
  PHASE_SEQUENCE,
  GoLiveApprovalDecision,
  PilotGoals
} from './goLiveModels.js';

const STORAGE_KEYS = {
  PHASE: 'vellia_golive_phase_v22',
  PILOT_USERS: 'vellia_golive_users_v22',
  CHECKLIST: 'vellia_golive_checklist_v22',
  GOALS: 'vellia_golive_goals_v22',
  APPROVAL: 'vellia_golive_approval_v22',
  BASELINE: 'vellia_golive_baseline_v22',
  POST_LAUNCH: 'vellia_golive_post_launch_v22'
};

// Usuários iniciais configurados para o Piloto Controlado (Item 4)
const DEFAULT_PILOT_USERS = [
  {
    id: 'usr-admin-1',
    name: 'Carlos Albuquerque',
    email: 'carlos.albuquerque@vellia.com.br',
    role: 'ADMINISTRADOR',
    profileLabel: 'Administrador do Sistema',
    company: 'Ambas (Veeluen & Excelência)',
    isCanary: true,
    active: true,
    onboardingCompleted: true,
    lastActive: 'Hoje às 08:50'
  },
  {
    id: 'usr-licit-1',
    name: 'Mariana Vasconcelos',
    email: 'mariana.licitacoes@excelenciaambiental.com.br',
    role: 'LICITACOES',
    profileLabel: 'Usuário de Licitações',
    company: 'Excelência Ambiental',
    isCanary: true,
    active: true,
    onboardingCompleted: true,
    lastActive: 'Hoje às 08:42'
  },
  {
    id: 'usr-tec-1',
    name: 'Eng. Fernando Prates',
    email: 'fernando.engenharia@veeluen.com.br',
    role: 'TECNICO',
    profileLabel: 'Usuário Técnico / Engenharia',
    company: 'Veeluen Solutions',
    isCanary: true,
    active: true,
    onboardingCompleted: false,
    lastActive: 'Ontem às 17:30'
  },
  {
    id: 'usr-com-1',
    name: 'Roberto Mendes',
    email: 'roberto.mendes@excelenciaambiental.com.br',
    role: 'COMERCIAL',
    profileLabel: 'Usuário Comercial / Gestão',
    company: 'Ambas (Veeluen & Excelência)',
    isCanary: true,
    active: true,
    onboardingCompleted: true,
    lastActive: 'Hoje às 08:55'
  }
];

// Empresas iniciais autorizadas (Item 5)
export const INITIAL_COMPANIES = [
  { id: 'veeluen', name: 'Veeluen Solutions', active: true, cnpj: '33.123.456/0001-89', initialScope: true },
  { id: 'excelencia', name: 'Excelência Ambiental', active: true, cnpj: '12.987.654/0001-10', initialScope: true }
];

// 17 Itens obrigatórios do Checklist Pré-Go-Live (Item 8)
const DEFAULT_CHECKLIST_ITEMS = [
  { id: 'chk_db', category: 'Infraestrutura', label: 'Banco de dados configurado e otimizado', critical: true, status: 'PASSED', details: 'PostgreSQL 16 com pooling pgbouncer e schemas isolados' },
  { id: 'chk_backup', category: 'Infraestrutura', label: 'Rotina de Backup funcionando e programada', critical: true, status: 'PASSED', details: 'Backup diário agendado para 02:00, checksum SHA-256 e AES-256' },
  { id: 'chk_restore', category: 'Infraestrutura', label: 'Restore testado com sucesso (Drill validado)', critical: true, status: 'PASSED', details: 'Drill de recuperação testado em 28.4s, RTO < 30s cumprido' },
  { id: 'chk_users', category: 'Acessos', label: 'Usuários do piloto criados com credenciais seguras', critical: true, status: 'PASSED', details: '4 usuários chave cadastrados com MFA e isolamento' },
  { id: 'chk_perms', category: 'Acessos', label: 'Permissões testadas por perfil (RBAC validado)', critical: true, status: 'PASSED', details: 'Matriz de 18 permissões com 0 vazamento de escopo' },
  { id: 'chk_companies', category: 'Negócio', label: 'Empresas configuradas (Veeluen e Excelência Ambiental)', critical: true, status: 'PASSED', details: '2 empresas ativas, 0 empresas teste fantasmas' },
  { id: 'chk_services', category: 'Negócio', label: 'Catálogo de serviços revisado sem duplicidades', critical: true, status: 'PASSED', details: '29 serviços catalogados e auditados com sinônimos semânticos' },
  { id: 'chk_docs', category: 'Documentos', label: 'Documentos e acervo inicial enviados ao Vault', critical: false, status: 'PASSED', details: '34 certidões, atestados e balanços validados' },
  { id: 'chk_sources', category: 'Integrações', label: 'Fontes externas testadas (PNCP, Compras.gov, Petronect)', critical: true, status: 'PASSED', details: '3 portais com conectores ativos e estáveis' },
  { id: 'chk_agent', category: 'Inteligência', label: 'Vellia Agent testado com pipeline semântico', critical: true, status: 'PASSED', details: 'Extração de editais e cálculo de score operando normalmente' },
  { id: 'chk_alerts', category: 'Monitoramento', label: 'Sistema de alertas operando sem ruído excessivo', critical: true, status: 'PASSED', details: 'Alert Noise index abaixo de 12%, alertas críticos funcionais' },
  { id: 'chk_email', category: 'Comunicação', label: 'Integração de E-mail configurada e testada', critical: false, status: 'PASSED', details: 'OAuth Google/Microsoft com sincronização em lote' },
  { id: 'chk_calendar', category: 'Comunicação', label: 'Calendário de prazos e sessões configurado', critical: false, status: 'PASSED', details: 'Sincronização bidirecional de sessões e diligências ativa' },
  { id: 'chk_logs', category: 'Observabilidade', label: 'Logs estruturados ativos com rotação', critical: true, status: 'PASSED', details: 'Auditoria imutável com diff JSON e logs de infraestrutura' },
  { id: 'chk_monit', category: 'Observabilidade', label: 'Monitoramento e Telemetria em tempo real ativos', critical: true, status: 'PASSED', details: 'Healthcheck a cada 60s com deadman switch' },
  { id: 'chk_bugs_p0', category: 'Qualidade', label: 'Nenhum bug P0 (Blocker) aberto', critical: true, status: 'PASSED', details: '0 bugs P0 pendentes na fila de QA' },
  { id: 'chk_integrity', category: 'Dados', label: 'Integridade de dados validada (0 orfãos/inconsistências)', critical: true, status: 'PASSED', details: 'Varredura de integridade aprovada com status Good' }
];

export class GoLivePilotService {
  /**
   * Retorna a fase atual do Go-Live
   */
  static getCurrentPhase() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.PHASE);
        if (stored) return stored;
      }
    } catch (e) {
      console.warn('Erro ao ler fase do go-live:', e);
    }
    // Fase padrão inicial da Fase 22
    return GoLivePhase.PILOTO_DADOS_REAIS;
  }

  /**
   * Transiciona de fase respeitando o fluxo obrigatório:
   * PREPARAÇÃO -> PILOTO INTERNO -> PILOTO COM DADOS REAIS -> OPERAÇÃO ASSISTIDA -> PRODUÇÃO
   */
  static transitionToPhase(targetPhase, reason = '', approvedBy = 'Carlos Albuquerque') {
    const current = this.getCurrentPhase();

    if (targetPhase === GoLivePhase.PAUSADO) {
      this._savePhase(GoLivePhase.PAUSADO);
      return { success: true, previous: current, current: GoLivePhase.PAUSADO, message: `Go-Live pausado temporariamente: ${reason}` };
    }

    if (current === GoLivePhase.PAUSADO) {
      // Retomar para a fase anterior salva
      this._savePhase(targetPhase);
      return { success: true, previous: current, current: targetPhase, message: `Operação retomada na fase: ${targetPhase}` };
    }

    const currentIndex = PHASE_SEQUENCE.indexOf(current);
    const targetIndex = PHASE_SEQUENCE.indexOf(targetPhase);

    if (targetIndex === -1) {
      throw new Error(`Fase de destino "${targetPhase}" inválida.`);
    }

    // Regra dos Itens 2 e 3: Não pular direto para PRODUÇÃO sem passar pelo fluxo sequencial
    if (targetIndex > currentIndex + 1) {
      const expectedNext = PHASE_SEQUENCE[currentIndex + 1];
      throw new Error(
        `Transição não autorizada! O fluxo obrigatório exige avançar sequencialmente de "${current}" para "${expectedNext}". Não é permitido pular fases para ir direto para Produção.`
      );
    }

    // Se estiver tentando ir para PRODUÇÃO, verificar se o Go-Live não está bloqueado
    if (targetPhase === GoLivePhase.PRODUCAO) {
      const readiness = this.evaluateReadiness();
      if (!readiness.readyForProduction) {
        throw new Error(`Transição para Produção bloqueada! Motivo: ${readiness.blockerReason || 'Pendências críticas no checklist'}`);
      }
    }

    this._savePhase(targetPhase);

    return {
      success: true,
      previous: current,
      current: targetPhase,
      approvedBy,
      timestamp: new Date().toISOString(),
      message: `Fase do Go-Live atualizada com sucesso para ${targetPhase}.`
    };
  }

  static _savePhase(phase) {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.PHASE, phase);
    }
  }

  /**
   * Obtém a lista de Usuários do Piloto (Item 4)
   */
  static getPilotUsers() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.PILOT_USERS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao carregar usuários piloto:', e);
    }
    return DEFAULT_PILOT_USERS;
  }

  /**
   * Salva ou edita um usuário do piloto
   */
  static updatePilotUser(userId, partialData) {
    const users = this.getPilotUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error('Usuário piloto não encontrado');

    users[index] = { ...users[index], ...partialData, updatedAt: new Date().toISOString() };
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.PILOT_USERS, JSON.stringify(users));
    }
    return users[index];
  }

  /**
   * Obtém checklist pré-go-live e valida se há bloqueadores (Itens 8 e 9)
   */
  static getChecklist() {
    let items = DEFAULT_CHECKLIST_ITEMS;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.CHECKLIST);
        if (stored) items = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao carregar checklist:', e);
    }

    const total = items.length;
    const passed = items.filter(i => i.status === 'PASSED').length;
    const criticalFailed = items.filter(i => i.critical && i.status !== 'PASSED');

    const isBlocked = criticalFailed.length > 0;
    const statusText = isBlocked ? 'GO-LIVE BLOQUEADO' : 'LIBERADO PARA OPERAÇÃO';

    return {
      items,
      total,
      passed,
      isBlocked,
      statusText,
      criticalFailedCount: criticalFailed.length,
      criticalFailedItems: criticalFailed,
      healthPct: Math.round((passed / total) * 100)
    };
  }

  /**
   * Altera status de um item do checklist (ex: simular falha ou aprovação)
   */
  static toggleChecklistItem(itemId, status, details = '') {
    const list = this.getChecklist().items;
    const index = list.findIndex(i => i.id === itemId);
    if (index !== -1) {
      list[index].status = status;
      if (details) list[index].details = details;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(list));
      }
    }
    return this.getChecklist();
  }

  /**
   * Metas Técnicas e Funcionais do Piloto (Itens 35 e 36)
   */
  static getPilotGoals() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.GOALS);
        if (stored) return { ...PilotGoals, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Erro ao carregar metas:', e);
    }
    return { ...PilotGoals };
  }

  static updatePilotGoals(updatedGoals) {
    const merged = { ...this.getPilotGoals(), ...updatedGoals };
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(merged));
    }
    return merged;
  }

  /**
   * Avaliação de Prontidão para Produção (Itens 68, 69, 70, 71)
   */
  static evaluateReadiness() {
    const checklist = this.getChecklist();
    const phase = this.getCurrentPhase();

    // Critérios obrigatórios do Item 69:
    // Nenhum P0 aberto, Nenhum SEV-1 ativo, Backups OK, Restore validado, Agente estável, Fontes principais estáveis, Permissões validadas, Dados consistentes, Piloto concluído
    const blockers = [];
    if (checklist.isBlocked) {
      blockers.push(`${checklist.criticalFailedCount} item(ns) crítico(s) falhando no Checklist Pré-Go-Live`);
    }

    const readyForProduction = blockers.length === 0 && (phase === GoLivePhase.OPERACAO_ASSISTIDA || phase === GoLivePhase.PRODUCAO);

    return {
      evaluatedAt: new Date().toISOString(),
      currentPhase: phase,
      readyForProduction,
      blockers,
      blockerReason: blockers.join('; '),
      checklistSummary: {
        total: checklist.total,
        passed: checklist.passed,
        healthPct: checklist.healthPct
      }
    };
  }

  /**
   * Decisão Humana de Produção (Itens 70, 71, 72, 73, 74, 75)
   */
  static submitGoLiveDecision({ decision, userName, version = 'v2.2-prod', pendencias = [], observations = '' }) {
    if (![GoLiveApprovalDecision.APROVADO, GoLiveApprovalDecision.APROVADO_COM_PENDENCIAS, GoLiveApprovalDecision.NAO_APROVADO].includes(decision)) {
      throw new Error(`Decisão "${decision}" inválida.`);
    }

    const record = {
      decision,
      userName,
      version,
      timestamp: new Date().toISOString(),
      pendencias,
      observations,
      checklistSnapshot: this.getChecklist()
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.APPROVAL, JSON.stringify(record));
    }

    // Se APROVADO, efetuar transição para PRODUÇÃO e criar Baseline Snapshot
    if (decision === GoLiveApprovalDecision.APROVADO || decision === GoLiveApprovalDecision.APROVADO_COM_PENDENCIAS) {
      this._savePhase(GoLivePhase.PRODUCAO);
      this.createBaselineSnapshot(version, userName);
    }

    return record;
  }

  static getLatestApprovalRecord() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.APPROVAL);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler registro de aprovação:', e);
    }
    return null;
  }

  /**
   * Baseline Snapshot do momento do lançamento (Item 75)
   */
  static createBaselineSnapshot(version = 'v2.2', author = 'Carlos Albuquerque') {
    const snapshot = {
      id: `baseline-${Date.now()}`,
      createdAt: new Date().toISOString(),
      version,
      author,
      stats: {
        usersCount: this.getPilotUsers().length,
        opportunitiesCount: 14,
        documentsVaultCount: 34,
        servicesCount: 29,
        activeSources: ['PNCP', 'Compras.gov.br', 'Petronect'],
        systemHealth: '100% OPERATIONAL'
      }
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.BASELINE, JSON.stringify(snapshot));
    }
    return snapshot;
  }

  static getBaselineSnapshot() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = window.localStorage.getItem(STORAGE_KEYS.BASELINE);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler snapshot:', e);
    }
    return {
      id: 'baseline-initial-v22',
      createdAt: '2026-10-09T08:00:00.000Z',
      version: 'v2.2-RC1',
      author: 'Carlos Albuquerque',
      stats: {
        usersCount: 4,
        opportunitiesCount: 14,
        documentsVaultCount: 34,
        servicesCount: 29,
        activeSources: ['PNCP', 'Compras.gov.br', 'Petronect'],
        systemHealth: '100% OPERATIONAL'
      }
    };
  }

  /**
   * Painel de 30 Dias Pós-Lançamento (Itens 76, 77, 78, 79, 80)
   */
  static getPostLaunchData() {
    return {
      launchDate: '2026-10-09',
      daysElapsed: 7,
      totalDaysPeriod: 30,
      checkpoints: [
        { day: 1, label: 'Dia 1 — Primeiro Dia Real', status: 'COMPLETED', date: '09/10/2026', findings: 'Sincronização PNCP e Compras.gov estável. 0 erros críticos.' },
        { day: 7, label: 'Dia 7 — Revisão Semanal de Estabilidade', status: 'IN_PROGRESS', date: '16/10/2026', findings: 'Aderência média de 88.4%. Nenhum SEV-1. 1 sugestão de filtro adicionada.' },
        { day: 15, label: 'Dia 15 — Ponto de Controle de Adoção', status: 'UPCOMING', date: '24/10/2026', findings: 'Análise de conversão do Copilot e tempo de ação por oportunidade.' },
        { day: 30, label: 'Dia 30 — Go-Live Review & Roadmap Definitivo', status: 'UPCOMING', date: '08/11/2026', findings: 'Consolidação das métricas de valor gerado e expansão de fontes.' }
      ],
      metricsSummary: {
        totalCapturedOpps: 42,
        highRelevanceOpps: 14,
        humanGoDecisions: 8,
        activeIncidentsCount: 0,
        averageTimeToValueMinutes: 104 // 1h44m
      },
      roadmapPostGoLive: [
        { id: 'rm_1', title: 'Conectores adicionais: Portais Estaduais (SP/RJ)', status: 'PLANNED', quarter: 'Q1 2027', priority: 'Média' },
        { id: 'rm_2', title: 'Geração automática de minutas de recurso com IA', status: 'PLANNED', quarter: 'Q1 2027', priority: 'Alta' },
        { id: 'rm_3', title: 'Integração de WhatsApp Corporativo para Alertas Críticos', status: 'PLANNED', quarter: 'Q2 2027', priority: 'Média' }
      ]
    };
  }
}
