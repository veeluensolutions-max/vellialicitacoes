/**
 * VELLIA LICITAÇÕES — FASE 24
 * mvpTaskService.js
 * 
 * Centralização do modelo único de Tarefa (Task).
 * Substitui modelos concorrentes e descentralizados.
 * Utilizado por: Propostas, CRM, Documentos e Oportunidades.
 */

const STORAGE_KEY = 'vellia_consolidated_tasks_v1';

const INITIAL_TASKS = [
  {
    id: 'TSK-101',
    title: 'Analisar edital de Licenciamento da Bacia de Santos',
    source: 'OPPORTUNITY',
    sourceId: '7004218902',
    priority: 'ALTA',
    status: 'PENDENTE',
    dueDate: 'Hoje',
    daysUntilDue: 0,
    assignee: 'Eng. Roberto Silva',
    department: 'Licitações'
  },
  {
    id: 'TSK-102',
    title: 'Revisar planilha orçamentária Petrobras Búzios',
    source: 'PROPOSAL',
    sourceId: 'PROP-7004218902',
    priority: 'ALTA',
    status: 'EM_ANDAMENTO',
    dueDate: 'Em 2 dias',
    daysUntilDue: 2,
    assignee: 'Mariana Lima',
    department: 'Comercial'
  },
  {
    id: 'TSK-103',
    title: 'Renovar Certidão Negativa Federal - Veeluen Solutions',
    source: 'DOCUMENT',
    sourceId: 'DOC-CND-01',
    priority: 'MEDIA',
    status: 'PENDENTE',
    dueDate: 'Em 5 dias',
    daysUntilDue: 5,
    assignee: 'Carlos Mendes',
    department: 'Jurídico'
  },
  {
    id: 'TSK-104',
    title: 'Follow-up de alinhamento com Pregoeiro Petrobras (UN-BS)',
    source: 'CRM',
    sourceId: 'ORG-PETROBRAS-01',
    priority: 'MEDIA',
    status: 'ATRASADA',
    dueDate: 'Ontem',
    daysUntilDue: -1,
    assignee: 'Mariana Lima',
    department: 'Comercial'
  },
  {
    id: 'TSK-105',
    title: 'Validar ARTs do acervo técnico de Georreferenciamento',
    source: 'DOCUMENT',
    sourceId: 'DOC-ART-88',
    priority: 'BAIXA',
    status: 'PENDENTE',
    dueDate: 'Em 7 dias',
    daysUntilDue: 7,
    assignee: 'Eng. Roberto Silva',
    department: 'Técnico'
  }
];

class MvpTaskService {
  constructor() {
    this.tasks = this.loadTasks();
  }

  loadTasks() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao carregar tasks locais:', e);
    }
    return [...INITIAL_TASKS];
  }

  saveTasks() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
      }
    } catch (e) {
      console.warn('Erro ao salvar tasks:', e);
    }
  }

  getAllTasks() {
    return [...this.tasks];
  }

  getTasksBySource(source, sourceId = null) {
    return this.tasks.filter(t => {
      if (t.source !== source) return false;
      if (sourceId && t.sourceId !== sourceId) return false;
      return true;
    });
  }

  getPendingTasks() {
    return this.tasks.filter(t => t.status !== 'CONCLUIDA');
  }

  getUrgentTasks() {
    return this.tasks.filter(t => t.status !== 'CONCLUIDA' && t.daysUntilDue <= 2);
  }

  createTask(data) {
    const newTask = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      title: data.title || 'Nova Tarefa',
      source: data.source || 'OPPORTUNITY',
      sourceId: data.sourceId || '',
      priority: data.priority || 'MEDIA',
      status: 'PENDENTE',
      dueDate: data.dueDate || 'Hoje',
      daysUntilDue: data.daysUntilDue ?? 1,
      assignee: data.assignee || 'Equipe Vellia',
      department: data.department || 'Geral',
      createdAt: new Date().toISOString()
    };
    this.tasks.unshift(newTask);
    this.saveTasks();
    return newTask;
  }

  updateTaskStatus(id, newStatus) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
      this.saveTasks();
    }
    return task;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    return true;
  }
}

export const mvpTaskService = new MvpTaskService();
