/**
 * VELLIA LICITAÇÕES — FASE 13: COPILOTO VELLIA
 * ConversationService: Histórico de Conversas, Favoritos e Sessões (Itens 42, 43 e 44).
 * 
 * Regras:
 * - Organiza conversas em: Hoje, Ontem, Últimos 7 dias e Arquivadas.
 * - Gera títulos automáticos contextuais para as conversas.
 * - Suporta favoritar conversas importantes e arquivamento.
 */

const CONVERSATIONS_STORAGE_KEY = 'vellia_copilot_conversations_v1';
const ACTIVE_CONVERSATION_KEY = 'vellia_copilot_active_conv_id_v1';

const memoryConversations = [];
let memoryActiveId = null;

function getStoredConversations() {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    }
  } catch {}
  return memoryConversations;
}

function saveStoredConversations(conversations) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    }
  } catch {}
  if (conversations !== memoryConversations) {
    memoryConversations.length = 0;
    memoryConversations.push(...conversations);
  }
}

export class ConversationService {
  /**
   * Cria uma nova conversa
   */
  static createConversation(title = 'Nova Consulta Executiva') {
    const list = getStoredConversations();
    const newConv = {
      id: `conv-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      isArchived: false,
      messages: []
    };

    list.unshift(newConv);
    saveStoredConversations(list);
    this.setActiveConversationId(newConv.id);
    return newConv;
  }

  /**
   * Obtém a conversa ativa ou cria uma padrão
   */
  static getActiveConversation() {
    const list = getStoredConversations();
    let activeId = memoryActiveId;
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const stored = localStorage.getItem(ACTIVE_CONVERSATION_KEY);
        if (stored) activeId = stored;
      }
    } catch {}

    let conv = list.find(c => c.id === activeId && !c.isArchived);
    if (!conv) {
      conv = list.find(c => !c.isArchived);
      if (!conv) {
        conv = this.createConversation('Consulta Inicial Vellia');
      }
    }
    return conv;
  }

  static setActiveConversationId(id) {
    memoryActiveId = id;
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
      }
    } catch {}
  }

  /**
   * Obtém conversa por ID
   */
  static getById(id) {
    const list = getStoredConversations();
    return list.find(c => c.id === id) || null;
  }

  /**
   * Adiciona mensagem a uma conversa
   */
  static addMessage(conversationId, message) {
    const list = getStoredConversations();
    const conv = list.find(c => c.id === conversationId);
    if (!conv) return null;

    const msgWithId = {
      id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...message
    };

    conv.messages.push(msgWithId);
    conv.updatedAt = new Date().toISOString();

    // Atualização de título inteligente no primeiro prompt do usuário
    if (conv.messages.filter(m => m.sender === 'user').length === 1 && message.sender === 'user') {
      conv.title = this.generateSmartTitle(message.text);
    }

    saveStoredConversations(list);
    return msgWithId;
  }

  /**
   * Gera título inteligente com base na pergunta
   */
  static generateSmartTitle(query = '') {
    const q = query.toLowerCase();
    const oppMatch = query.match(/\b(700\d{7}|\d{10})\b/);
    if (oppMatch) return `Análise Edital #${oppMatch[0]}`;
    if (q.includes('melhor oportunidade')) return 'Melhor Oportunidade Vellia';
    if (q.includes('venc') || q.includes('prazo')) return 'Prazos e Vencimentos';
    if (q.includes('document') || q.includes('certid') || q.includes('atestad')) return 'Consulta Documental e Atestados';
    if (q.includes('proposta') || q.includes('bloqueador')) return 'Status de Propostas e Bloqueios';
    if (q.includes('ete') || q.includes('efluente')) return 'Oportunidades de ETE';
    if (q.includes('emiss') || q.includes('atmosf')) return 'Emissões Atmosféricas';
    if (q.includes('petronect')) return 'Monitoramento Petronect';
    if (q.includes('concorrente') || q.includes('head-to-head')) return 'Análise de Concorrentes';
    if (q.includes('preço') || q.includes('benchmark')) return 'Inteligência de Preços';
    if (q.includes('briefing') || q.includes('hoje')) return 'Briefing Executivo';

    const clean = query.replace(/[?.,!]/g, '').trim();
    return clean.length > 30 ? clean.substring(0, 30) + '...' : clean || 'Consulta Executiva';
  }

  /**
   * Alterna status de favorito
   */
  static toggleFavorite(conversationId) {
    const list = getStoredConversations();
    const conv = list.find(c => c.id === conversationId);
    if (conv) {
      conv.isFavorite = !conv.isFavorite;
      saveStoredConversations(list);
      return conv.isFavorite;
    }
    return false;
  }

  /**
   * Arquiva conversa
   */
  static archiveConversation(conversationId) {
    const list = getStoredConversations();
    const conv = list.find(c => c.id === conversationId);
    if (conv) {
      conv.isArchived = true;
      saveStoredConversations(list);
      return true;
    }
    return false;
  }

  /**
   * Lista conversas agrupadas por período (Item 42)
   */
  static getGroupedConversations() {
    const list = getStoredConversations().filter(c => !c.isArchived);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - (24 * 60 * 60 * 1000);
    const startOf7Days = startOfToday - (7 * 24 * 60 * 60 * 1000);

    const grouped = {
      favorites: [],
      today: [],
      yesterday: [],
      last7Days: [],
      older: []
    };

    list.forEach(conv => {
      const convTime = new Date(conv.updatedAt || conv.createdAt).getTime();

      if (conv.isFavorite) {
        grouped.favorites.push(conv);
      }

      if (convTime >= startOfToday) {
        grouped.today.push(conv);
      } else if (convTime >= startOfYesterday) {
        grouped.yesterday.push(conv);
      } else if (convTime >= startOf7Days) {
        grouped.last7Days.push(conv);
      } else {
        grouped.older.push(conv);
      }
    });

    return grouped;
  }
}

export default ConversationService;
