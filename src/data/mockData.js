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

export const priorityOpportunities = [
  {
    id: '7004321234',
    portal: 'Petronect',
    client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
    title: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
    identifiedService: 'Monitoramento de emissões atmosféricas',
    recommendedCompany: 'Excelência Ambiental',
    score: 96,
    scoreBadgeText: '96% CRÍTICA',
    scoreTier: 'critical',
    daysLeft: 12,
    status: 'Alta prioridade',
    statusTier: 'critical',
    location: 'Ipojuca - PE',
    estimatedValue: 'R$ 2.450.000,00',
    modality: 'Licitação Eletrônica Petronect',
    publishDate: '01/10/2026',
    endDate: '19/10/2026',
    object: 'Contratação de serviços de medição e monitoramento contínuo de emissões atmosféricas, contemplando fontes estacionárias, amostragem isocinética e elaboração de relatórios técnicos para conformidade com normas CONAMA e CPRH.',
    whyMatches: [
      'Compatibilidade técnica altíssima com o escopo cadastrado da Excelência Ambiental',
      'Serviço com atestados técnicos comprovados em plantas industriais e refinarias',
      'Equipamentos de coleta isocinética e sondas calibradas disponíveis',
      'Responsável técnico habilitado no CREA-PE com ARTs prévias similares',
      'Região de atendimento plenamente coberta pela equipe técnica'
    ],
    risks: [
      'Exigência de atestado específico com amostragem em altura superior a 40m',
      'Prazo para apresentação de dúvidas e esclarecimentos vence em 5 dias',
      'Visita técnica facultativa recomendada para averiguação de pontos de amostragem'
    ],
    matchedKeywords: ['emissões atmosféricas', 'fontes estacionárias', 'amostragem isocinética', 'relatório CONAMA', 'poluentes']
  },
  {
    id: '7004319802',
    portal: 'Petronect',
    client: 'Transpetro - Terminal Aquaviário de Suape',
    title: 'Serviços continuados de operação e manutenção de ETE e tratamento de efluentes',
    identifiedService: 'Operação de ETE e Manutenção de ETE',
    recommendedCompany: 'Veeluen Solutions',
    score: 94,
    scoreBadgeText: '94% CRÍTICA',
    scoreTier: 'critical',
    daysLeft: 15,
    status: 'Alta prioridade',
    statusTier: 'critical',
    location: 'Ipojuca - PE',
    estimatedValue: 'R$ 3.820.000,00',
    modality: 'Concorrência Pública',
    publishDate: '02/10/2026',
    endDate: '22/10/2026',
    object: 'Prestação de serviços contínuos de operação, monitoramento de parâmetros físico-químicos e manutenção preventiva/corretiva de Estação de Tratamento de Efluentes Industriais e Sanitários (ETE/ETDI).',
    whyMatches: [
      'Especialidade core da Veeluen Solutions em gestão e operação de ETE industrial',
      'Equipe multidisciplinar habilitada com operadores certificados e químicos responsáveis',
      'Registro regular e ativo no CREA e histórico de conformidade com padrões de lançamento',
      'Capacidade de fornecimento de insumos químicos e sobressalentes operacionais'
    ],
    risks: [
      'Plantão 24/7 com equipe residente exigida no edital',
      'Garantia de proposta de 1% do valor estimado no momento do credenciamento'
    ],
    matchedKeywords: ['operação de ETE', 'efluentes sanitários', 'manutenção eletromecânica', 'descarte em conformidade']
  },
  {
    id: '7004318765',
    portal: 'Petronect',
    client: 'Petrobras - UO-BS Santos',
    title: 'Amostragem Isocinética de poluentes e caracterização de fontes gasosas',
    identifiedService: 'Amostragem Isocinética',
    recommendedCompany: 'Excelência Ambiental',
    score: 88,
    scoreBadgeText: '88% ALTA',
    scoreTier: 'high',
    daysLeft: 8,
    status: 'Alta prioridade',
    statusTier: 'critical',
    location: 'Santos - SP',
    estimatedValue: 'R$ 1.150.000,00',
    modality: 'Cotação Eletrônica',
    publishDate: '29/09/2026',
    endDate: '15/10/2026',
    object: 'Amostragem isocinética em chaminés de turbogeradores e caldeiras, com análise laboratorial acreditada pelo Inmetro/ISO 17025.',
    whyMatches: [
      'Equipamentos de medição calibrados pelo RBC disponíveis',
      'Conhecimento consolidado em metodologia EPA 5 e normas ABNT',
      'Engenheiros químicos especialistas em dispersão gasosa'
    ],
    risks: [
      'Prazo curto: apenas 8 dias restantes para fechamento das propostas',
      'Treinamento de embarque e segurança offshore pode ser requerido'
    ],
    matchedKeywords: ['amostragem isocinética', 'chaminés', 'turbogeradores', 'ISO 17025']
  },
  {
    id: '7004315420',
    portal: 'Petronect',
    client: 'Petrobras - Polo Catu',
    title: 'Inspeção e ensaios não destrutivos em caldeiras e vasos de pressão conforme NR-13',
    identifiedService: 'NR-13 e Inspeção de Caldeiras / Vasos',
    recommendedCompany: 'Veeluen Solutions',
    score: 85,
    scoreBadgeText: '85% ALTA',
    scoreTier: 'high',
    daysLeft: 18,
    status: 'Em análise',
    statusTier: 'review',
    location: 'Catu - BA',
    estimatedValue: 'R$ 890.000,00',
    modality: 'Licitação Eletrônica',
    publishDate: '03/10/2026',
    endDate: '25/10/2026',
    object: 'Serviços de inspeção periódica extraordinária e ensaios ultrassônicos em vasos sob pressão e caldeiras de processo.',
    whyMatches: [
      'Corpo técnico composto por Engenheiros Mecânicos habilitados como Profissionais Habilitados (PH) da NR-13',
      'Aparelhagem de ultrassom e medidores de espessura certificados',
      'Metodologia comprovada de emissão de prontuários e relatórios rastreáveis'
    ],
    risks: [
      'Necessidade de calibração recente dos aparelhos ultrassom antes da mobilização'
    ],
    matchedKeywords: ['NR-13', 'vasos de pressão', 'caldeira', 'ensaio não destrutivo', 'ultrassom']
  },
  {
    id: '7004312109',
    portal: 'Petronect',
    client: 'Petrobras - Termelétrica Canoas',
    title: 'Modelagem matemática de dispersão atmosférica (AERMOD) e avaliação de qualidade do ar',
    identifiedService: 'Modelagem de Dispersão Atmosférica (AERMOD)',
    recommendedCompany: 'Excelência Ambiental',
    score: 78,
    scoreBadgeText: '78% BOA',
    scoreTier: 'good',
    daysLeft: 21,
    status: 'Em análise',
    statusTier: 'review',
    location: 'Canoas - RS',
    estimatedValue: 'R$ 640.000,00',
    modality: 'Licitação Eletrônica',
    publishDate: '04/10/2026',
    endDate: '28/10/2026',
    object: 'Elaboração de estudos de dispersão de poluentes utilizando software AERMOD para renovação de Licença de Operação (LO).',
    whyMatches: [
      'Domínio avançado do modelo AERMOD e análise de estações meteorológicas',
      'Histórico de aprovação de estudos semelhantes em órgãos ambientais estaduais'
    ],
    risks: [
      'Exigência de dados meteorológicos históricos específicos de no mínimo 3 anos'
    ],
    matchedKeywords: ['AERMOD', 'dispersão atmosférica', 'qualidade do ar', 'licença de operação']
  },
  {
    id: '7004309871',
    portal: 'Petronect',
    client: 'Petrobras - Regap Betim',
    title: 'Adequação e manutenção corretiva de sistemas de tratamento de efluentes industriais',
    identifiedService: 'Tratamento de Efluentes e Manutenção',
    recommendedCompany: 'Veeluen Solutions',
    score: 74,
    scoreBadgeText: '74% BOA',
    scoreTier: 'good',
    daysLeft: 9,
    status: 'Em análise',
    statusTier: 'review',
    location: 'Betim - MG',
    estimatedValue: 'R$ 1.480.000,00',
    modality: 'Cotação Eletrônica',
    publishDate: '01/10/2026',
    endDate: '16/10/2026',
    object: 'Substituição de bombas submersíveis, difusores de ar e revisão dos decantadores secundários da ETE.',
    whyMatches: [
      'Expertise em intervenções eletromecânicas em sistemas de aeração e decantação',
      'Fornecedores qualificados de sobressalentes e válvulas'
    ],
    risks: [
      'Janela restrita de parada operacional exigindo execução aos finais de semana'
    ],
    matchedKeywords: ['efluentes industriais', 'bombas submersíveis', 'decantadores', 'manutenção ETE']
  }
];

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
