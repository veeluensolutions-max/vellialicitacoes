/**
 * VELLIA LICITAÇÕES — FASE 17
 * interactionService.js
 * Gerenciamento de Interações Comerciais, Reuniões Estruturadas, Portfólios Enviados e Sinais Manuais.
 */

import { InteractionType, RelationshipTemperature } from './crmModels.js';

const STORAGE_KEY_INTERACTIONS = 'vellia_crm_interactions_v17';
const STORAGE_KEY_MANUAL_SIGNALS = 'vellia_crm_manual_signals_v17';
const STORAGE_KEY_PORTFOLIOS = 'vellia_crm_portfolios_v17';

export const INITIAL_INTERACTIONS = [
  // 1-4 Petrobras RNEST
  {
    id: 'INT-PETRO-001',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    contactId: 'CTC-PETRO-001',
    contactName: 'Eng. Marcelo Cavalcanti',
    internalResponsible: 'Roberto Mendes (Diretor Comercial)',
    type: InteractionType.REUNIAO,
    date: '2026-09-28',
    time: '14:30',
    subject: 'Apresentação Institucional de Capacidade Técnica de ETE Industrial',
    summary: 'Apresentamos o acervo técnico da Excelência Ambiental em estações físico-químicas e biológicas. O cliente destacou que o contrato vigente encerra em novembro/2026.',
    result: 'Reunião muito produtiva. Cliente solicitou envio detalhado das CATs de O&M de vazões superiores a 150 m³/h.',
    nextStep: 'Enviar compilação de atestados técnicos registrados no CREA-PE até 10/10.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-001', // Conecta ao sinal do Radar Antecipado
    relatedProposalId: null,
    createdAt: '2026-09-28T16:00:00Z'
  },
  {
    id: 'INT-PETRO-002',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    contactId: 'CTC-PETRO-001',
    contactName: 'Eng. Marcelo Cavalcanti',
    internalResponsible: 'Camila Torres',
    type: InteractionType.EMAIL,
    date: '2026-09-30',
    time: '10:15',
    subject: 'Envio de Portfólio Corporativo e Certidões Técnicas de ETE',
    summary: 'Disponibilizado link seguro para download do portfólio 2026 e acervo de 8 CATs da Excelência Ambiental.',
    result: 'E-mail respondido confirmando recebimento pela gerência de SMS.',
    nextStep: 'Acompanhar abertura do Termo de Referência no Petronect.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-001',
    relatedProposalId: null,
    createdAt: '2026-09-30T10:30:00Z'
  },
  {
    id: 'INT-PETRO-003',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    contactId: 'CTC-PETRO-002',
    contactName: 'Dra. Patrícia Albuquerque',
    internalResponsible: 'Camila Torres',
    type: InteractionType.LIGACAO,
    date: '2026-09-15',
    time: '16:00',
    subject: 'Alinhamento sobre critérios de qualificação jurídica no Petronect',
    summary: 'Esclarecimento sobre vigência cadastral do CRCC da Veeluen e da Excelência Ambiental.',
    result: 'Confirmado que o cadastro de ambas as empresas está 100% homologado e ativo.',
    nextStep: 'Checar certidões negativas mensalmente.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    relatedProposalId: null,
    createdAt: '2026-09-15T16:30:00Z'
  },
  {
    id: 'INT-PETRO-004',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    contactId: 'CTC-PETRO-003',
    contactName: 'Carlos Eduardo Ramos',
    internalResponsible: 'Flávio Caldas',
    type: InteractionType.WHATSAPP,
    date: '2026-08-20',
    time: '11:45',
    subject: 'Troca de referências técnicas sobre ensaios não destrutivos NR-13',
    summary: 'Contato informal técnico sobre normas ABNT NBR 15489 aplicadas a vasos de pressão.',
    result: 'Carlos indicou que a refinaria deve atualizar calibrações de válvulas no 1º semestre de 2027.',
    nextStep: 'Registrar demanda futura de inspeção.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    relatedProposalId: null,
    createdAt: '2026-08-20T12:00:00Z'
  },

  // 5-7 UFPE
  {
    id: 'INT-UFPE-001',
    organizationId: 'ORG-UFPE',
    organizationName: 'Universidade Federal de Pernambuco (UFPE)',
    contactId: 'CTC-UFPE-002',
    contactName: 'Bárbara Lins',
    internalResponsible: 'Camila Torres (Engenheira Ambiental)',
    type: InteractionType.VIDEOCONFERENCIA,
    date: '2026-10-02',
    time: '15:00',
    subject: 'Discussão técnica sobre métodos de amostragem isocinética de chaminés',
    summary: 'Apresentação dos equipamentos amostradores da Vellia e calibração acreditada pelo Inmetro/RBC.',
    result: 'Bárbara mencionou que a UFPE está concluindo o ETP do Pregão anual de emissões que deve ser publicado até novembro.',
    nextStep: 'Follow-up no início de novembro para checar publicação no PNCP.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-003',
    relatedProposalId: null,
    createdAt: '2026-10-02T16:00:00Z'
  },
  {
    id: 'INT-UFPE-002',
    organizationId: 'ORG-UFPE',
    organizationName: 'Universidade Federal de Pernambuco (UFPE)',
    contactId: 'CTC-UFPE-001',
    contactName: 'Prof. Dr. Ricardo Siqueira',
    internalResponsible: 'Roberto Mendes',
    type: InteractionType.REUNIAO,
    date: '2026-09-10',
    time: '10:00',
    subject: 'Visita institucional à PROGEST no Campus Recife',
    summary: 'Alinhamento sobre parcerias em P&D e cumprimento das condicionantes ambientais do CPRH.',
    result: 'Reitoria informou prioridade orçamentária do MEC para regularidade ambiental.',
    nextStep: 'Manter contato com a diretoria técnica de meio ambiente.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    relatedProposalId: null,
    createdAt: '2026-09-10T11:30:00Z'
  },
  {
    id: 'INT-UFPE-003',
    organizationId: 'ORG-UFPE',
    organizationName: 'Universidade Federal de Pernambuco (UFPE)',
    contactId: 'CTC-UFPE-002',
    contactName: 'Bárbara Lins',
    internalResponsible: 'Camila Torres',
    type: InteractionType.EMAIL,
    date: '2026-09-12',
    time: '09:30',
    subject: 'Envio de modelo de especificações técnicas para calibração de sondas',
    summary: 'Compartilhamento de subsídios técnicos de normas ABNT aplicáveis a fontes estacionárias.',
    result: 'Agradecimento enviado pela equipe da SINFRA.',
    nextStep: 'Acompanhar PCA 2026.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-003',
    relatedProposalId: null,
    createdAt: '2026-09-12T10:00:00Z'
  },

  // 8-10 COMPESA
  {
    id: 'INT-COMP-001',
    organizationId: 'ORG-COMPESA',
    organizationName: 'Companhia Pernambucana de Saneamento (COMPESA)',
    contactId: 'CTC-COMP-001',
    contactName: 'Eng. Fernando Bezerra',
    internalResponsible: 'Flávio Caldas (Eng. Mecânico)',
    type: InteractionType.REUNIAO,
    date: '2026-09-25',
    time: '11:00',
    subject: 'Reunião de alinhamento sobre ensaios hidrostáticos e ultrassom NR-13',
    summary: 'Discussão sobre histórico de falhas em caldeiras auxiliares. Apresentamos a solução integrada da Veeluen com emissão de laudos digitais.',
    result: 'Fernando informou que a Compesa está cotando preços no mercado para balizar termo de referência.',
    nextStep: 'Agendar demonstração técnica da plataforma de laudos em outubro.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-005',
    relatedProposalId: null,
    createdAt: '2026-09-25T12:30:00Z'
  },
  {
    id: 'INT-COMP-002',
    organizationId: 'ORG-COMPESA',
    organizationName: 'Companhia Pernambucana de Saneamento (COMPESA)',
    contactId: 'CTC-COMP-001',
    contactName: 'Eng. Fernando Bezerra',
    internalResponsible: 'Flávio Caldas',
    type: InteractionType.WHATSAPP,
    date: '2026-09-29',
    time: '14:20',
    subject: 'Confirmação de recebimento da tabela de referências de preços Sicro/Sinapi',
    summary: 'Envio de memórias de cálculo de custos horários de engenheiro sênior para apoio.',
    result: 'Recebido com agradecimento.',
    nextStep: 'Follow-up na semana de 14/10.',
    relatedOpportunityId: null,
    relatedSignalId: 'SIG-2026-005',
    relatedProposalId: null,
    createdAt: '2026-09-29T14:40:00Z'
  },
  {
    id: 'INT-COMP-003',
    organizationId: 'ORG-COMPESA',
    organizationName: 'Companhia Pernambucana de Saneamento (COMPESA)',
    contactId: 'CTC-COMP-002',
    contactName: 'Mariana Duarte',
    internalResponsible: 'Lucas Andrade',
    type: InteractionType.EMAIL,
    date: '2026-08-15',
    time: '10:00',
    subject: 'Esclarecimento sobre certidões de recuperação judicial para editais estaduais',
    summary: 'Consulta técnica formalizada sobre jurisprudência recente do TCE-PE.',
    result: 'Pregoeira informou aceitação de certidão positiva com plano homologado.',
    nextStep: 'Arquivar parecer interno no Cofre Documental.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    relatedProposalId: null,
    createdAt: '2026-08-15T10:45:00Z'
  },

  // 11-13 Porto de Suape
  {
    id: 'INT-SUAPE-001',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Complexo Industrial Portuário de Suape',
    contactId: 'CTC-SUAPE-001',
    contactName: 'Dr. Leonardo Gusmão',
    internalResponsible: 'Roberto Mendes (Diretor Comercial)',
    type: InteractionType.VISITA,
    date: '2026-09-30',
    time: '09:00',
    subject: 'Visita técnica ao Centro de Tratamento de Resíduos do Porto de Suape',
    summary: 'Vistoria das baias de armazenamento temporário de resíduos Classe I e área portuária.',
    result: 'Excelente alinhamento. Identificamos gargalos na logística reversa de embalagens contaminadas.',
    nextStep: 'Estruturar proposta técnica de logística integrada de resíduos.',
    relatedOpportunityId: 'OPP-PNCP-2026-0991',
    relatedSignalId: 'SIG-2026-006',
    relatedProposalId: 'PROP-2026-002',
    createdAt: '2026-09-30T12:00:00Z'
  },
  {
    id: 'INT-SUAPE-002',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Complexo Industrial Portuário de Suape',
    contactId: 'CTC-SUAPE-002',
    contactName: 'Juliana Fontes',
    internalResponsible: 'Camila Torres',
    type: InteractionType.VIDEOCONFERENCIA,
    date: '2026-09-18',
    time: '14:00',
    subject: 'Apresentação de soluções de rastreabilidade de manifesto MTR digital',
    summary: 'Demonstração de integração direta com os sistemas do CPRH e Ibama.',
    result: 'Juliana elogiou a conformidade do sistema e solicitou referências de clientes atendidos.',
    nextStep: 'Enviar portfólio institucional de gestão de resíduos.',
    relatedOpportunityId: 'OPP-PNCP-2026-0991',
    relatedSignalId: 'SIG-2026-006',
    relatedProposalId: null,
    createdAt: '2026-09-18T15:30:00Z'
  },
  {
    id: 'INT-SUAPE-003',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Complexo Industrial Portuário de Suape',
    contactId: 'CTC-SUAPE-001',
    contactName: 'Dr. Leonardo Gusmão',
    internalResponsible: 'Roberto Mendes',
    type: InteractionType.EVENTO,
    date: '2026-08-25',
    time: '18:00',
    subject: 'Encontro no Fórum Nordeste de Economia Azul e Portos Sustentáveis',
    summary: 'Conversa no estande da Fiepe sobre descarbonização das operações portuárias.',
    result: 'Leonardo convidou a Vellia para reunião em setembro.',
    nextStep: 'Agendar visita técnica.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    relatedProposalId: null,
    createdAt: '2026-08-25T19:00:00Z'
  },

  // 14-15 Chesf
  {
    id: 'INT-CHESF-001',
    organizationId: 'ORG-CHESF',
    organizationName: 'Eletrobras Chesf',
    contactId: 'CTC-CHESF-001',
    contactName: 'Eng. Renato Fagundes',
    internalResponsible: 'Camila Torres (Engenheira Ambiental)',
    type: InteractionType.REUNIAO,
    date: '2026-08-10',
    time: '14:00',
    subject: 'Reunião preliminar sobre estudos de fauna e flora no Baixo São Francisco',
    summary: 'Apresentação da equipe técnica de biólogos e oceanógrafos parceiros da Vellia.',
    result: 'Renato informou que o edital deve sair no início de 2027 com exigência de equipe multidisciplinar.',
    nextStep: 'Mapear especialistas e pesquisadores com CATs compatíveis.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    relatedProposalId: null,
    createdAt: '2026-08-10T16:00:00Z'
  },
  {
    id: 'INT-CHESF-002',
    organizationId: 'ORG-CHESF',
    organizationName: 'Eletrobras Chesf',
    contactId: 'CTC-CHESF-001',
    contactName: 'Eng. Renato Fagundes',
    internalResponsible: 'Camila Torres',
    type: InteractionType.EMAIL,
    date: '2026-08-12',
    time: '11:00',
    subject: 'Envio de currículos da equipe técnica para pré-validação',
    summary: 'Encaminhamento dos acervos técnicos e publicações científicas dos profissionais.',
    result: 'Recebimento confirmado pelo DGS.',
    nextStep: 'Aguardar publicação no PCA Chesf.',
    relatedOpportunityId: null,
    relatedSignalId: null,
    relatedProposalId: null,
    createdAt: '2026-08-12T11:45:00Z'
  }
];

export const INITIAL_MANUAL_SIGNALS = [
  {
    id: 'MAN-SIG-001',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    contactId: 'CTC-PETRO-001',
    contactName: 'Eng. Marcelo Cavalcanti',
    title: 'Previsão de contratação de adequação de decantador da ETE',
    service: 'Tratamento de Efluentes e Operação de ETE',
    estimatedValue: 1200000.00,
    expectedHorizon: '1º Trimestre de 2027',
    temperature: RelationshipTemperature.QUENTE,
    isManualSignal: true,
    nature: 'Informação comercial registrada manualmente (Contato direto)',
    notes: 'Contato informou durante reunião presencial que haverá necessidade de retrofit dos decantadores.',
    registeredBy: 'Roberto Mendes (Diretor Comercial)',
    createdAt: '2026-09-28T16:30:00Z'
  },
  {
    id: 'MAN-SIG-002',
    organizationId: 'ORG-COMPESA',
    organizationName: 'Companhia Pernambucana de Saneamento (COMPESA)',
    contactId: 'CTC-COMP-001',
    contactName: 'Eng. Fernando Bezerra',
    title: 'Pesquisa mercadológica de calibração NR-13 para novo certame',
    service: 'Inspeção e Conformidade NR-13',
    estimatedValue: 950000.00,
    expectedHorizon: 'Novembro de 2026',
    temperature: RelationshipTemperature.QUENTE,
    isManualSignal: true,
    nature: 'Informação comercial registrada manualmente (Sondagem técnica)',
    notes: 'Engenheiro confirmou que termo aditivo com a incumbente não será feito se houver vantajosidade em licitação nova.',
    registeredBy: 'Flávio Caldas (Eng. Mecânico)',
    createdAt: '2026-09-25T13:00:00Z'
  },
  {
    id: 'MAN-SIG-003',
    organizationId: 'ORG-UFPE',
    organizationName: 'Universidade Federal de Pernambuco (UFPE)',
    contactId: 'CTC-UFPE-002',
    contactName: 'Bárbara Lins',
    title: 'Necessidade de laudos de ruído ambiental perimetral no Campus Recife',
    service: 'Monitoramento Ambiental e Ruído',
    estimatedValue: 180000.00,
    expectedHorizon: 'Dezembro de 2026',
    temperature: RelationshipTemperature.MORNO,
    isManualSignal: true,
    nature: 'Informação comercial registrada manualmente',
    notes: 'Demanda levantada pela SINFRA para renovação do alvará municipal.',
    registeredBy: 'Camila Torres',
    createdAt: '2026-10-02T16:30:00Z'
  }
];

export const INITIAL_PORTFOLIOS = [
  {
    id: 'PORT-001',
    organizationId: 'ORG-PETROBRAS-RNEST',
    organizationName: 'Petrobras RNEST',
    contactName: 'Eng. Marcelo Cavalcanti',
    version: 'Portfólio Industrial Vellia v2026.2 (SMS & ETE)',
    servicesPresented: ['Tratamento de Efluentes e Operação de ETE', 'Inspeção NR-13', 'Amostragem de Emissões'],
    sentDate: '2026-09-30',
    responsible: 'Camila Torres',
    format: 'PDF Digital / Link Seguro com Rastreamento de Download'
  },
  {
    id: 'PORT-002',
    organizationId: 'ORG-SUAPE',
    organizationName: 'Porto de Suape',
    contactName: 'Juliana Fontes',
    version: 'Apresentação Executiva — Gestão Total de Resíduos Industriais Classe I',
    servicesPresented: ['Gestão de Resíduos Perigosos', 'Logística Reversa Portuária', 'MTR Digital'],
    sentDate: '2026-09-19',
    responsible: 'Camila Torres',
    format: 'PDF Digital / Link Seguro'
  }
];

class InteractionService {
  constructor() {
    this._ensureInitialized();
  }

  _safeGetStorage(key) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.warn(`[InteractionService] Erro ao ler ${key}:`, e);
      }
    }
    return null;
  }

  _safeSetStorage(key, val) {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        console.warn(`[InteractionService] Erro ao gravar ${key}:`, e);
      }
    }
  }

  _ensureInitialized() {
    if (!this._safeGetStorage(STORAGE_KEY_INTERACTIONS)) {
      this._safeSetStorage(STORAGE_KEY_INTERACTIONS, INITIAL_INTERACTIONS);
    }
    if (!this._safeGetStorage(STORAGE_KEY_MANUAL_SIGNALS)) {
      this._safeSetStorage(STORAGE_KEY_MANUAL_SIGNALS, INITIAL_MANUAL_SIGNALS);
    }
    if (!this._safeGetStorage(STORAGE_KEY_PORTFOLIOS)) {
      this._safeSetStorage(STORAGE_KEY_PORTFOLIOS, INITIAL_PORTFOLIOS);
    }
  }

  getAllInteractions() {
    return this._safeGetStorage(STORAGE_KEY_INTERACTIONS) || INITIAL_INTERACTIONS;
  }

  getInteractionsByOrganization(organizationId) {
    const all = this.getAllInteractions();
    return all
      .filter(i => i.organizationId === organizationId)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Cronológico decrescente
  }

  getInteractionsByContact(contactId) {
    const all = this.getAllInteractions();
    return all
      .filter(i => i.contactId === contactId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  addInteraction(data = {}) {
    const all = this.getAllInteractions();
    const newInteraction = {
      id: data.id || `INT-${Date.now()}`,
      organizationId: data.organizationId || '',
      organizationName: data.organizationName || '',
      contactId: data.contactId || '',
      contactName: data.contactName || '',
      internalResponsible: data.internalResponsible || 'Usuário Comercial',
      type: data.type || InteractionType.LIGACAO,
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toTimeString().slice(0, 5),
      subject: data.subject || 'Contato Comercial',
      summary: data.summary || '',
      result: data.result || '',
      nextStep: data.nextStep || '',
      relatedOpportunityId: data.relatedOpportunityId || null,
      relatedSignalId: data.relatedSignalId || null,
      relatedProposalId: data.relatedProposalId || null,
      createdAt: new Date().toISOString()
    };

    all.unshift(newInteraction);
    this._safeSetStorage(STORAGE_KEY_INTERACTIONS, all);
    return newInteraction;
  }

  // --- Sinais Manuais (Itens 56, 57, 58, 59) ---
  getAllManualSignals() {
    return this._safeGetStorage(STORAGE_KEY_MANUAL_SIGNALS) || INITIAL_MANUAL_SIGNALS;
  }

  addManualSignal(signalData = {}) {
    const all = this.getAllManualSignals();
    const newSignal = {
      id: signalData.id || `MAN-SIG-${Date.now()}`,
      organizationId: signalData.organizationId || '',
      organizationName: signalData.organizationName || '',
      contactId: signalData.contactId || '',
      contactName: signalData.contactName || '',
      title: signalData.title || 'Indício comercial manual',
      service: signalData.service || 'Serviço Geral',
      estimatedValue: Number(signalData.estimatedValue) || 0,
      expectedHorizon: signalData.expectedHorizon || 'Próximo Semestre',
      temperature: signalData.temperature || RelationshipTemperature.MORNO,
      isManualSignal: true,
      nature: 'Informação comercial registrada manualmente (Não constitui edital oficial)',
      notes: signalData.notes || '',
      registeredBy: signalData.registeredBy || 'Comercial Vellia',
      createdAt: new Date().toISOString()
    };

    all.unshift(newSignal);
    this._safeSetStorage(STORAGE_KEY_MANUAL_SIGNALS, all);
    return newSignal;
  }

  // --- Portfólios Enviados (Itens 52, 53) ---
  getAllPortfolios() {
    return this._safeGetStorage(STORAGE_KEY_PORTFOLIOS) || INITIAL_PORTFOLIOS;
  }

  registerSentPortfolio(data = {}) {
    const all = this.getAllPortfolios();
    const newEntry = {
      id: data.id || `PORT-${Date.now()}`,
      organizationId: data.organizationId || '',
      organizationName: data.organizationName || '',
      contactName: data.contactName || '',
      version: data.version || 'Portfólio Institucional Vellia 2026',
      servicesPresented: data.servicesPresented || [],
      sentDate: data.sentDate || new Date().toISOString().split('T')[0],
      responsible: data.responsible || 'Equipe Comercial',
      format: data.format || 'PDF Digital'
    };

    all.unshift(newEntry);
    this._safeSetStorage(STORAGE_KEY_PORTFOLIOS, all);
    return newEntry;
  }
}

export const interactionService = new InteractionService();
