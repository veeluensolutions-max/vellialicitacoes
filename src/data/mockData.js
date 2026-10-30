export const systemMetrics = {
  analyzedToday: 186,
  relevantToday: 14,
  highPriority: 2,
  inAnalysis: 5,
  proposalsInPrep: 3,
  activeParticipations: 4,
  lastSyncTime: '07/10/2026 às 06:30',
  currentDateFormatted: 'Quarta-feira, 07 de Outubro de 2026'
};

export const radarData = {
  portal: 'Petronect',
  portalStatus: 'Conexão ativa e monitorando',
  analyzedTotal: 186,
  relatedTotal: 14,
  above70Total: 6,
  priorityTotal: 2,
  tiers: [
    { label: '90–100% (Prioridade Crítica)', count: 2, percent: 14, color: '#10B981' },
    { label: '80–89% (Alta Aderência)', count: 2, percent: 14, color: '#0EA5E9' },
    { label: '70–79% (Boa Oportunidade)', count: 2, percent: 14, color: '#6366F1' },
    { label: '50–69% (Em Análise)', count: 4, percent: 29, color: '#F59E0B' },
    { label: '< 50% (Baixa Aderência)', count: 4, percent: 29, color: '#94A3B8' }
  ],
  companyBreakdown: [
    { company: 'Excelência Ambiental', count: 8, topScore: '96%' },
    { company: 'Veeluen Solutions', count: 6, topScore: '94%' }
  ]
};

// Base estática desativada: o sistema opera 100% com editais reais sincronizados em tempo real
export const priorityOpportunities = [];

export const notificationsList = [
  {
    id: 'notif-1',
    title: 'Nova Oportunidade Crítica Detectada',
    desc: 'Oportunidade 7004321234 (Petronect) com 96% de aderência identificada para Excelência Ambiental.',
    time: 'Há 12 minutos',
    type: 'critical',
    unread: true
  },
  {
    id: 'notif-2',
    title: 'Sincronização Petronect Concluída',
    desc: '186 oportunidades analisadas com sucesso. 14 novos itens relacionados aos serviços das empresas.',
    time: 'Hoje às 06:30',
    type: 'info',
    unread: true
  },
  {
    id: 'notif-3',
    title: 'Alerta de Prazo de Edital',
    desc: 'Oportunidade 7004318765 encerra o envio de propostas em 8 dias.',
    time: 'Ontem',
    type: 'warning',
    unread: false
  }
];

export const initialCompanies = [
  {
    id: 'excelencia-ambiental',
    name: 'Excelência Ambiental',
    cnpj: '18.423.901/0001-44',
    city: 'Recife',
    state: 'PE',
    segment: 'Engenharia & Consultoria Ambiental',
    contact: 'contato@excelenciaambiental.com.br',
    servicesCount: 11,
    activeMatches: 8,
    status: 'Ativa'
  },
  {
    id: 'veeluen-solutions',
    name: 'Veeluen Solutions',
    cnpj: '24.981.332/0001-18',
    city: 'Cabo de Santo Agostinho',
    state: 'PE',
    segment: 'Operação Industrial, Saneamento & SST',
    contact: 'comercial@veeluen.com.br',
    servicesCount: 18,
    activeMatches: 6,
    status: 'Ativa'
  }
];
