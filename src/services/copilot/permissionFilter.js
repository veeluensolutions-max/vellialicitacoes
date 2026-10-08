/**
 * VELLIA LICITAÇÕES — FASE 13 & 14: COPILOTO VELLIA
 * PermissionFilter: Controle de Acesso e Proteção de Dados Sensíveis (Itens 49 e 50).
 * 
 * Regras:
 * - Respeita as permissões granulares da Fase 14 (financial.sensitive.view, margin.view, etc).
 * - Perfis autorizados: Administrador, Gestão, Financeiro, Comercial (DIRETORIA, GESTAO_COMERCIAL).
 * - Perfil técnico e visualizador (ANALISTA_TECNICO, OPERACIONAL, TECNICO, VISUALIZADOR):
 *   Bloqueio estrito de margem e custos com a mensagem canônica (Item 49):
 *   "Você não possui permissão para visualizar informações financeiras desta proposta."
 * - Controle de ações do Copilot (Item 50): Valida permissão antes de aprovar GO, criar tarefa ou mudar status.
 */

export const UserRole = {
  DIRETORIA: 'DIRETORIA',
  GESTAO_COMERCIAL: 'GESTAO_COMERCIAL',
  ANALISTA_TECNICO: 'ANALISTA_TECNICO',
  OPERACIONAL: 'OPERACIONAL',
  // Perfis Fase 14
  ADMINISTRADOR: 'Administrador',
  GESTAO: 'Gestão',
  LICITACOES: 'Licitações',
  COMERCIAL: 'Comercial',
  TECNICO: 'Técnico',
  FINANCEIRO: 'Financeiro',
  VISUALIZADOR: 'Visualizador'
};

export class PermissionFilter {
  /**
   * Verifica se o papel ou usuário tem permissão para visualizar dados financeiros restritos (Itens 10, 49)
   */
  static canAccessFinancials(roleOrUser = UserRole.GESTAO_COMERCIAL) {
    if (!roleOrUser) return false;
    
    // Se for string de papel
    if (typeof roleOrUser === 'string') {
      const allowedRoles = [
        'DIRETORIA', 'GESTAO_COMERCIAL',
        'Administrador', 'Gestão', 'Financeiro', 'Comercial'
      ];
      return allowedRoles.includes(roleOrUser);
    }

    // Se for objeto de usuário
    if (typeof roleOrUser === 'object') {
      const role = roleOrUser.role;
      const allowedRoles = [
        'DIRETORIA', 'GESTAO_COMERCIAL',
        'Administrador', 'Gestão', 'Financeiro', 'Comercial'
      ];
      return allowedRoles.includes(role);
    }

    return false;
  }

  /**
   * 50. Controle de Ação do Copilot:
   * Valida se o usuário pode disparar ações via chat (Criar tarefa, Alterar status, Aprovar GO)
   */
  static canExecuteAction(actionType, roleOrUser = UserRole.GESTAO_COMERCIAL) {
    const role = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role;
    
    switch (actionType) {
      case 'APPROVE_GO':
      case 'APROVAR_GO':
        return ['Administrador', 'Gestão', 'DIRETORIA', 'GESTAO_COMERCIAL'].includes(role);

      case 'CREATE_TASK':
      case 'CRIAR_TAREFA':
      case 'ASSIGN_RESPONSIBLE':
      case 'CHANGE_STATUS':
        return ['Administrador', 'Gestão', 'Licitações', 'Comercial', 'Técnico', 'DIRETORIA', 'GESTAO_COMERCIAL'].includes(role);

      case 'EDIT_PRICING':
      case 'ALTERAR_PRECO':
        return ['Administrador', 'Financeiro', 'DIRETORIA'].includes(role);

      default:
        return false;
    }
  }

  /**
   * Filtra campos financeiros sensíveis de uma proposta ou resultado
   */
  static filterFinancialData(data, roleOrUser = UserRole.GESTAO_COMERCIAL) {
    if (!data) return data;
    if (this.canAccessFinancials(roleOrUser)) return data;

    const filtered = Array.isArray(data) ? [...data] : { ...data };

    if (Array.isArray(filtered)) {
      return filtered.map(item => this._sanitizeItem(item));
    }
    return this._sanitizeItem(filtered);
  }

  static _sanitizeItem(item) {
    if (!item || typeof item !== 'object') return item;
    const clean = { ...item };

    // Sanitizar campos restritos
    if (clean.pricing) {
      clean.pricing = {
        ...clean.pricing,
        directCosts: '*** [Restrito: Sem permissão financeira]',
        indirectCosts: '*** [Restrito]',
        taxesValue: '*** [Restrito]',
        markupPercent: '*** [Restrito]',
        targetMarginPercent: '*** [Restrito]',
        definedMarginPercent: '*** [Restrito]'
      };
    }

    if (clean.expectedMargin !== undefined) clean.expectedMargin = null;
    if (clean.avgMargin !== undefined) clean.avgMargin = null;
    if (clean.avgMarginPercent !== undefined) clean.avgMarginPercent = null;
    if (clean.avgWonMarginPercent !== undefined) clean.avgWonMarginPercent = null;
    if (clean.costEstimate !== undefined) clean.costEstimate = null;

    return clean;
  }

  /**
   * 49. Mensagem oficial quando usuário sem permissão financeira pergunta sobre margem
   */
  static getRestrictedNotice() {
    return '[AVISO DE SEGURANÇA]: Você não possui permissão para visualizar informações financeiras desta proposta (acesso a margem e custos é informação restrita).';
  }
}

export default PermissionFilter;
