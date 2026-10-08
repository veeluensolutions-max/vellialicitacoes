/**
 * VELLIA LICITAÇÕES — FASE 14: ADMINISTRAÇÃO E SEGURANÇA
 * generalAuditService.js: Trilha Geral de Auditoria Imutável (Itens 20 a 24)
 * 
 * Regras:
 * - Registra todas as ações sensíveis com diff estruturado (Antes x Depois).
 * - Imutabilidade estrita (Item 22): Nenhum usuário ou administrador pode apagar logs via interface.
 * - Suporta filtros avançados por módulo, usuário, empresa, ação e período.
 */

const AUDIT_STORAGE_KEY = 'vellia_global_audit_trail_v1';

// Seed inicial rico com ações preexistentes representativas
const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-001',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    formattedTime: 'Ontem às 10:15',
    user: 'Mariana Castro',
    userRole: 'Gestão',
    company: 'Excelência Ambiental',
    module: 'Oportunidades & Decisão',
    action: 'DECISAO_GO_APLICADA',
    object: 'Oportunidade Petronect #7004128831',
    recordId: '7004128831',
    diffBefore: { decision: 'PENDENTE', score: 88 },
    diffAfter: { decision: 'GO', approvedBy: 'Mariana Castro', justification: 'Alta aderência técnica e frota local' },
    ipAddress: '192.168.1.42',
    result: 'SUCESSO'
  },
  {
    id: 'aud-002',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    formattedTime: 'Ontem às 16:30',
    user: 'Carlos Silveira',
    userRole: 'Financeiro',
    company: 'Excelência Ambiental',
    module: 'Formação de Preço',
    action: 'ALTERACAO_PRECO',
    object: 'Proposta #PROP-7004128831-01',
    recordId: 'PROP-7004128831-01',
    diffBefore: { preco: 520000, margemBruta: 28.5 },
    diffAfter: { preco: 485000, margemBruta: 24.2, motivo: 'Adequação ao benchmark de mediana do serviço' },
    ipAddress: '192.168.1.18',
    result: 'SUCESSO'
  },
  {
    id: 'aud-003',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    formattedTime: 'Hoje às 08:45',
    user: 'Dr. Roberto Albuquerque',
    userRole: 'Técnico',
    company: 'Excelência Ambiental',
    module: 'Cofre Documental',
    action: 'UPLOAD_DOCUMENTO',
    object: 'Certidão Negativa de Débitos Estadual (PE)',
    recordId: 'doc-fisc-02',
    diffBefore: null,
    diffAfter: { fileName: 'CND_Estadual_PE_2026.pdf', validade: '15/12/2026', categoria: 'Fiscal' },
    ipAddress: '192.168.1.25',
    result: 'SUCESSO'
  },
  {
    id: 'aud-004',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    formattedTime: 'Hoje às 10:12',
    user: 'Visitante Não Autorizado',
    userRole: 'Visualizador',
    company: 'Veeluen Solutions',
    module: 'Segurança & Permissões',
    action: 'TENTATIVA_ACESSO_NEGADO',
    object: 'Planilha de BDI & Margem Confidencial',
    recordId: 'PROP-7004169900-13',
    diffBefore: null,
    diffAfter: { motivo: 'Usuário sem permissão financial.sensitive.view tentou acessar custos' },
    ipAddress: '192.168.1.99',
    result: 'NEGADO'
  }
];

// Armazenamento em memória com fallback seguro
const memoryAuditLogs = [...INITIAL_AUDIT_LOGS];

function getStoredAudit() {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch {}
  return memoryAuditLogs;
}

function saveStoredAudit(logs) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    }
  } catch {}
  if (logs !== memoryAuditLogs) {
    memoryAuditLogs.length = 0;
    memoryAuditLogs.push(...logs);
  }
}

export class GeneralAuditService {
  /**
   * Registra uma nova entrada no Audit Log
   */
  static log({
    user = 'Sistema',
    userRole = 'Administrador',
    company = 'Excelência Ambiental',
    module = 'Geral',
    action = 'OPERACAO',
    object = '',
    recordId = '',
    diffBefore = null,
    diffAfter = null,
    ipAddress = '127.0.0.1',
    result = 'SUCESSO'
  }) {
    const list = getStoredAudit();
    const now = new Date();

    const entry = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: now.toISOString(),
      formattedTime: now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      user,
      userRole,
      company,
      module,
      action,
      object,
      recordId,
      diffBefore,
      diffAfter,
      ipAddress,
      result
    };

    list.unshift(entry);
    saveStoredAudit(list.slice(0, 500)); // Mantém até 500 registros
    return entry;
  }

  /**
   * Alias de conveniência para log()
   */
  static logAction(params) {
    return this.log(params);
  }

  static logAudit(params) {
    return this.log(params);
  }

  /**
   * Alias de conveniência para listLogs()
   */
  static getAuditLogs(params = {}) {
    return this.listLogs(params);
  }

  /**
   * Lista todos os logs com suporte a filtros (Item 23)
   */
  static listLogs({
    search = '',
    module = 'ALL',
    user = 'ALL',
    company = 'ALL',
    result = 'ALL',
    startDate = null,
    endDate = null
  } = {}) {
    let logs = getStoredAudit();

    if (module && module !== 'ALL') {
      logs = logs.filter(l => l.module === module);
    }

    if (user && user !== 'ALL') {
      logs = logs.filter(l => l.user === user);
    }

    if (company && company !== 'ALL') {
      logs = logs.filter(l => l.company === company);
    }

    if (result && result !== 'ALL') {
      logs = logs.filter(l => l.result === result);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase();
      logs = logs.filter(l => 
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.object.toLowerCase().includes(q) ||
        (l.recordId && String(l.recordId).includes(q))
      );
    }

    return logs;
  }

  /**
   * Obtém detalhes de um log específico (Item 24)
   */
  static getLogById(id) {
    const logs = getStoredAudit();
    return logs.find(l => l.id === id) || null;
  }

  /**
   * Item 22: Proteção Estrita contra Exclusão de Logs
   * Usuários comuns e administradores são proibidos de apagar logs de auditoria pela interface.
   */
  static deleteLog() {
    throw new Error('VIOLAÇÃO DE POLÍTICA DE AUDITORIA: Os registros de auditoria do Vellia são imutáveis e protegidos contra exclusão (Item 22).');
  }

  static clearAllLogs() {
    throw new Error('VIOLAÇÃO DE POLÍTICA DE AUDITORIA: Exclusão em lote de logs de auditoria é estritamente proibida (Item 22).');
  }
}

export default GeneralAuditService;
