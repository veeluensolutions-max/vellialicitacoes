/**
 * VELLIA LICITAÇÕES — FASE 31
 * GESTÃO PÓS-VITÓRIA + HANDOFF DO CONTRATO + INTELIGÊNCIA DE RENOVAÇÃO
 * 
 * Princípio Central:
 * O Vellia NÃO é um ERP nem gerenciador operacional complexo de ordens de serviço.
 * Ele atua como central estratégica comercial respondendo:
 * - O que ganhamos?
 * - O que foi prometido?
 * - Quem assumirá agora?
 * - Quais obrigações estratégicas no início?
 * - Quando esse contrato termina?
 * - Existe possibilidade de renovação?
 * - Quando devemos começar a trabalhar a próxima contratação?
 */

import { earlyRadarService } from '../earlyradar/earlyRadarService.js';
import { contractMonitoringService } from '../earlyradar/contractMonitoringService.js';
import { organizationService } from '../crm/organizationService.js';
import { contactService } from '../crm/contactService.js';

export const ContractType = {
  CONTRATO: 'Contrato',
  ATA_REGISTRO_PRECOS: 'Ata de Registro de Preços',
  ORDEM_SERVICO: 'Ordem de Serviço',
  FORNECIMENTO: 'Fornecimento',
  CONTRATO_RECORRENTE: 'Contrato recorrente',
  OUTRO: 'Outro'
};

export const ContractStatus = {
  AGUARDANDO_ASSINATURA: 'Aguardando assinatura',
  ASSINADO: 'Assinado',
  EM_VIGENCIA: 'Em vigência',
  SUSPENSO: 'Suspenso',
  ENCERRADO: 'Encerrado',
  RENOVADO: 'Renovado',
  RESCINDIDO: 'Rescindido'
};

export const ObligationCategory = {
  DOCUMENTAL: 'Documental',
  TECNICA: 'Técnica',
  COMERCIAL: 'Comercial',
  PRAZO: 'Prazo',
  SST: 'SST',
  AMBIENTAL: 'Ambiental',
  GARANTIA: 'Garantia',
  RELATORIO: 'Relatório',
  TREINAMENTO: 'Treinamento',
  MOBILIZACAO: 'Mobilização',
  OUTRO: 'Outro'
};

export const ObligationStatus = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  ATRASADA: 'Atrasada',
  NAO_APLICAVEL: 'Não aplicável'
};

export const ObligationRecurrence = {
  UNICA: 'Única',
  MENSAL: 'Mensal',
  TRIMESTRAL: 'Trimestral',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
  PERSONALIZADA: 'Personalizada'
};

export const ContractHealth = {
  SAUDAVEL: 'Saudável',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico'
};

export const RenewalLikelihood = {
  POSSIVEL_RENOVACAO: 'Possível renovação',
  NOVA_LICITACAO_PROVAVEL: 'Nova licitação provável',
  ENCERRAMENTO_PREVISTO: 'Encerramento previsto',
  INDETERMINADO: 'Indeterminado'
};

export const SignalStrength = {
  FORTE: 'Sinal Forte (PCA + Histórico Oficial)',
  MEDIO: 'Sinal Médio (Baseado em Vencimento)',
  BAIXO: 'Sinal Fraco / Indeterminado'
};

const STORAGE_KEYS = {
  CONTRACTS: 'vellia_contract_awards_v31',
  CONTRACT_AUDIT: 'vellia_contract_audit_v31'
};

const memoryStore = {};
function getStorage(key, fallback) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const val = localStorage.getItem(key);
      if (val) return JSON.parse(val);
    }
  } catch {}
  return memoryStore[key] ? memoryStore[key] : fallback;
}

function setStorage(key, value) {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {}
  memoryStore[key] = value;
}

export const INITIAL_CONTRACT_AWARDS = [
  {
    id: 'CTR-2026-PETRO-091',
    contractNumber: '4600612980/2026',
    ataNumber: 'ARP-042/2026',
    osNumber: 'OS-01/2026',
    opportunityNumber: '7004128912',
    client: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
    organ: 'Petrobras',
    participatingCompany: 'Veeluen Solutions',
    object: 'Prestação de serviços contínuos de operação, monitoramento e manutenção de ETE e tratamento de efluentes oleosos com emissão de laudos acreditados',
    primaryService: 'Tratamento de Efluentes e Operação de ETE',
    portal: 'Petronect Público',
    tenderModality: 'Pregão Eletrônico',
    
    // Valores (separado de faturamento!)
    originalValue: 2254000.00,
    amendmentsValue: 0.00,
    currentValue: 2254000.00,
    currency: 'BRL',
    
    // Vigência & Datas
    signatureDate: '2026-10-15',
    startDate: '2026-11-01',
    endDate: '2027-10-31',
    durationMonths: 12,
    
    type: ContractType.CONTRATO,
    status: ContractStatus.EM_VIGENCIA,
    healthStatus: ContractHealth.SAUDAVEL,

    // Fase Pós-Adjudicação
    postAdjudicationChecklist: [
      { id: 'pa-1', title: 'Apresentação de Garantia Contratual (Seguro-Garantia)', done: true, deadline: '2026-10-25', source: 'Edital Cláusula 14.1' },
      { id: 'pa-2', title: 'Comprovação de Dados Bancários para Crédito', done: true, deadline: '2026-10-20', source: 'Cadastro Petrobras' },
      { id: 'pa-3', title: 'Atualização de CNDs e Regularidade no SICAF/Petronect', done: true, deadline: '2026-10-22', source: 'Habilitação Fiscal' },
      { id: 'pa-4', title: 'Assinatura Digital do Instrumento Contratual', done: true, deadline: '2026-10-28', source: 'Contrato Oficial' },
      { id: 'pa-5', title: 'Envio da Documentação e ASO da Equipe Técnica', done: true, deadline: '2026-10-30', source: 'Mobilização SST' }
    ],

    // Handoff para a Operação
    handoff: {
      isCompleted: true,
      completedAt: '2026-10-16T14:30:00-03:00',
      owners: {
        contractOwner: 'Eng. Leonardo Prado (Gerente de Contratos)',
        operationalOwner: 'Marcelo Antunes (Coordenador de Operações)',
        technicalOwner: 'Dr. Roberto Albuquerque (Responsável Técnico CREA)',
        commercialOwner: 'Carlos Silveira (Gerente Comercial)'
      },
      checklist: [
        { id: 'hc-1', title: 'Contrato recebido e arquivado no cofre', done: true },
        { id: 'hc-2', title: 'Escopo validado com a equipe de campo', done: true },
        { id: 'hc-3', title: 'Proposta final vencedora disponibilizada', done: true },
        { id: 'hc-4', title: 'Documentos técnicos e CATs transferidos', done: true },
        { id: 'hc-5', title: 'Contato do fiscal e gestor do cliente definidos', done: true },
        { id: 'hc-6', title: 'Equipe de campo informada sobre metas', done: true },
        { id: 'hc-7', title: 'Prazo inicial de mobilização registrado', done: true },
        { id: 'hc-8', title: 'Obrigações críticas cadastradas no radar', done: true }
      ],
      documentPackage: [
        { name: 'Edital_Final_Petrobras_RNEST.pdf', type: 'Edital', path: 'vault/edital/7004128912.pdf' },
        { name: 'Termo_de_Referencia_Anexo_I.pdf', type: 'TR', path: 'vault/tr/7004128912_tr.pdf' },
        { name: 'Proposta_Comercial_Vencedora_Veeluen.pdf', type: 'Proposta', path: 'vault/proposals/prop_7004128912_v2.pdf' },
        { name: 'Dossier_Habilitacao_Compilado.pdf', type: 'Dossiê', path: 'vault/dossiers/dossier_7004128912.pdf' },
        { name: 'Contrato_Assinado_4600612980.pdf', type: 'Contrato', path: 'vault/contracts/ctr_4600612980.pdf' }
      ]
    },

    // Compromissos & Obrigações Contratuais Estratégicas
    obligations: [
      {
        id: 'ob-1',
        title: 'Manutenção de Garantia Contratual Vigente',
        category: ObligationCategory.GARANTIA,
        description: 'Apólice de Seguro-Garantia no valor de 5% do contrato renovada até o término da vigência.',
        sourceTrace: 'Contrato Cláusula 15 (Garantia de Execução) — Pág. 18',
        dueDate: '2027-10-31',
        recurrence: ObligationRecurrence.ANUAL,
        responsible: 'Juliana Mendes (Controladoria)',
        status: ObligationStatus.CONCLUIDA,
        isCritical: true
      },
      {
        id: 'ob-2',
        title: 'Emissão de Laudos Mensais de Conformidade de Efluentes',
        category: ObligationCategory.RELATORIO,
        description: 'Entrega de relatório técnico mensal com ensaios acreditados pelo Inmetro até o 5º dia útil.',
        sourceTrace: 'Termo de Referência Item 6.4 — Pág. 24',
        dueDate: '2026-12-05',
        recurrence: ObligationRecurrence.MENSAL,
        responsible: 'Dr. Roberto Albuquerque (Responsável Técnico)',
        status: ObligationStatus.EM_ANDAMENTO,
        isCritical: true
      },
      {
        id: 'ob-3',
        title: 'Mobilização Integral da Equipe e Embarcação',
        category: ObligationCategory.MOBILIZACAO,
        description: 'Apresentação in loco dos 4 operadores habilitados e certificados NR-33/NR-35.',
        sourceTrace: 'Contrato Cláusula 4.2 — Pág. 8',
        dueDate: '2026-11-15',
        recurrence: ObligationRecurrence.UNICA,
        responsible: 'Marcelo Antunes (Operações)',
        status: ObligationStatus.EM_ANDAMENTO,
        isCritical: true
      }
    ],

    // Aditivos Contratuais (ContractAmendment)
    amendments: [],

    // Contatos Vinculados (Reutilizados do CRM)
    contacts: [
      { name: 'Eng. Renato Meireles', role: 'Fiscal Técnico do Contrato', functionType: 'Fiscal', email: 'rmeireles@petrobras.com.br', phone: '(81) 3411-9200' },
      { name: 'Dr. Fernando Vasconcelos', role: 'Gestor Administrativo do Contrato', functionType: 'Gestor', email: 'fvasconcelos@petrobras.com.br', phone: '(81) 3411-9250' }
    ],

    // Inteligência de Renovação (Renewal Intelligence)
    renewalIntelligence: {
      expirationWindow: '180 dias',
      likelihood: RenewalLikelihood.POSSIVEL_RENOVACAO,
      sourceOfSignal: 'Contrato prevê prorrogação sucessiva por até 5 anos (Lei 13.303/2016). Histórico do órgão indica alta retenção de fornecedores pontuais.',
      signalStrength: SignalStrength.FORTE,
      linkedSignalId: 'SIG-RENEW-2027-PETRO-01',
      renewalPlan: {
        responsible: 'Carlos Silveira (Comercial)',
        strategy: 'Iniciar alinhamento com a fiscalização no 8º mês de vigência para emissão de atestado de capacidade técnica e protocolo de interesse na prorrogação com reajuste IPCA.',
        nextAction: 'Monitorar publicação do PCA e agendar reunião de alinhamento com o fiscal.',
        actionDate: '2027-05-15'
      },
      futureDocumentReadiness: {
        certificatesStatus: 'Válidas',
        technicalCapacitySufficient: true,
        teamAvailability: true,
        notes: 'Atestado de execução deste contrato gerará acervo técnico adicional de 12 meses.'
      }
    },

    // Extração Inteligente de Cláusulas Contratuais (da Fase 28)
    contractExtraction: {
      vigenciaClause: 'Cláusula Quarta — O prazo de vigência é de 12 meses, prorrogável nos termos da legislação vigente.',
      reajusteClause: 'Cláusula Sétima — Reajuste anual pelo índice IPCA/IBGE a contar da data de apresentação da proposta.',
      garantiaClause: 'Cláusula Décima Quinta — Garantia de execução correspondente a 5% (cinco por cento) do valor global.',
      penalidadesClause: 'Cláusula Vigésima Primeira — Multa moratória de 0,33% por dia de atraso injustificado até o limite de 10%.'
    },

    // Sugestões de Cross-Sell Internas (Item 83 a 85)
    crossSellSuggestions: [
      { service: 'Inspeção e Conformidade NR-13', relevance: 'Alta', reason: 'A Refinaria RNEST possui vasos de pressão e caldeiras vinculadas à área de utilidades.' },
      { service: 'Monitoramento de Emissões Atmosféricas', relevance: 'Média', reason: 'Unidade de craqueamento catalítico demanda medições periódicas semestrais.' }
    ],

    // Linha do Tempo do Contrato
    timeline: [
      { date: '2026-10-10', event: 'Vitória Homologada no Portal Petronect', author: 'Mariana Castro' },
      { date: '2026-10-15', event: 'Instrumento Contratual Assinado por Ambas as Partes', author: 'Diretoria Executiva' },
      { date: '2026-10-16', event: 'Handoff Executado Formalmente para a Equipe de Operações', author: 'Eng. Leonardo Prado' },
      { date: '2026-11-01', event: 'Início Oficial da Vigência dos Serviços', author: 'Marcelo Antunes' }
    ],

    // Auditoria
    auditLogs: [
      {
        timestamp: '2026-10-15T10:30:00-03:00',
        type: 'HUMAN',
        user: 'Mariana Castro',
        action: 'Contrato criado e registrado formalmente a partir da licitação nº 7004128912 ganha.',
        details: 'Valor adjudicado: R$ 2.254.000,00 | Empresa: Veeluen Solutions'
      }
    ],

    // Encerramento do Contrato
    closeout: {
      isClosed: false,
      closedAt: null,
      reason: '',
      lessonsLearned: ''
    }
  },
  {
    id: 'CTR-2025-COMPESA-104',
    contractNumber: '104/2025-DTE',
    ataNumber: 'N/A',
    osNumber: 'OS-08/2025',
    opportunityNumber: 'PE-0042-COMPESA',
    client: 'Companhia Pernambucana de Saneamento (COMPESA)',
    organ: 'COMPESA',
    participatingCompany: 'Excelência Ambiental',
    object: 'Serviços especializados de análises físico-químicas e microbiológicas em mananciais e ETAs da Região Metropolitana do Recife',
    primaryService: 'Análises Físico-Químicas e Microbiológicas de Água',
    portal: 'Portal de Compras PE',
    tenderModality: 'Pregão Eletrônico',
    originalValue: 1420000.00,
    amendmentsValue: 180000.00,
    currentValue: 1600000.00,
    currency: 'BRL',
    signatureDate: '2025-11-20',
    startDate: '2025-12-01',
    endDate: '2026-12-01', // Vence em ~47 dias!
    durationMonths: 12,
    type: ContractType.CONTRATO,
    status: ContractStatus.EM_VIGENCIA,
    healthStatus: ContractHealth.ATENCAO,
    postAdjudicationChecklist: [],
    handoff: {
      isCompleted: true,
      completedAt: '2025-11-22T10:00:00-03:00',
      owners: {
        contractOwner: 'Ana Beatriz Cavalcanti',
        operationalOwner: 'Dra. Patrícia Fontes',
        technicalOwner: 'Dr. Roberto Albuquerque',
        commercialOwner: 'Carlos Silveira'
      },
      checklist: [],
      documentPackage: []
    },
    obligations: [
      {
        id: 'ob-comp-1',
        title: 'Relatório Trimestral Consolidado de Qualidade de Mananciais',
        category: ObligationCategory.RELATORIO,
        description: 'Consolidação de parâmetros DBO, DQO e turbidez.',
        sourceTrace: 'Contrato Cláusula 6 — Pág. 12',
        dueDate: '2026-11-25',
        recurrence: ObligationRecurrence.TRIMESTRAL,
        responsible: 'Dra. Patrícia Fontes',
        status: ObligationStatus.PENDENTE,
        isCritical: true
      }
    ],
    amendments: [
      {
        number: '1º Termo Aditivo',
        type: 'Acréscimo de Valor e Quantitativos',
        date: '2026-06-10',
        financialImpact: 180000.00,
        durationImpactMonths: 0,
        documentName: 'Aditivo_01_Compesa_104_2025.pdf',
        notes: 'Inclusão de 15 pontos adicionais de coleta na Bacia do Capibaribe.'
      }
    ],
    contacts: [
      { name: 'Dr. Thiago Albuquerque', role: 'Gerente de Monitoramento COMPESA', functionType: 'Gestor', email: 'talbuquerque@compesa.com.br', phone: '(81) 3412-5500' }
    ],
    renewalIntelligence: {
      expirationWindow: '60 dias',
      likelihood: RenewalLikelihood.NOVA_LICITACAO_PROVAVEL,
      sourceOfSignal: 'Contrato atinge prazo improrrogável em 01/12/2026. COMPESA incluiu renovação no Plano de Contratações Anual 2027.',
      signalStrength: SignalStrength.FORTE,
      linkedSignalId: 'SIG-RENEW-COMPESA-2027',
      renewalPlan: {
        responsible: 'Carlos Silveira (Comercial)',
        strategy: 'Preparar documentação de habilitação e atestados atualizados. Contatar gerência de monitoramento para obter feedback do serviço prestado.',
        nextAction: 'Monitorar lançamento de edital no Portal de Compras PE.',
        actionDate: '2026-11-05'
      },
      futureDocumentReadiness: {
        certificatesStatus: 'Válidas',
        technicalCapacitySufficient: true,
        teamAvailability: true,
        notes: 'Certidão de acervo técnico com quantitativo 100% aderente.'
      }
    },
    contractExtraction: {
      vigenciaClause: 'Vigência de 12 meses improrrogável.',
      reajusteClause: 'Reajuste anual pelo IPCA.',
      garantiaClause: 'Garantia de 5% recolhida.',
      penalidadesClause: 'Cláusula padrão da Lei 14.133/2021.'
    },
    crossSellSuggestions: [
      { service: 'Gestão e Destinação de Lodo de ETE', relevance: 'Alta', reason: 'Desidratação e transporte de lodo de estações de tratamento de água.' }
    ],
    timeline: [
      { date: '2025-11-20', event: 'Contrato Assinado', author: 'Ana Beatriz Cavalcanti' },
      { date: '2026-06-10', event: '1º Termo Aditivo de Acréscimo (+R$ 180.000)', author: 'Wagner Silva' }
    ],
    auditLogs: [],
    closeout: { isClosed: false, closedAt: null, reason: '', lessonsLearned: '' }
  }
];

export class ContractAwardService {
  /**
   * Lista todos os contratos com suporte a filtros e cálculo de dias restantes.
   */
  static listAll(filters = {}) {
    let contracts = getStorage(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACT_AWARDS);
    
    // Atualiza dias restantes dinamicamente
    const now = new Date();
    contracts = contracts.map(c => {
      const end = new Date(c.endDate);
      const diffTime = end - now;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Avaliação transparente de saúde do contrato (Itens 56-59)
      let healthStatus = ContractHealth.SAUDAVEL;
      const hasOverdueObligations = c.obligations?.some(o => o.status === ObligationStatus.ATRASADA);
      if (hasOverdueObligations || daysRemaining < 30) {
        healthStatus = ContractHealth.CRITICO;
      } else if (daysRemaining < 90 || c.obligations?.some(o => o.status === ObligationStatus.PENDENTE && o.isCritical)) {
        healthStatus = ContractHealth.ATENCAO;
      }

      return {
        ...c,
        daysRemaining: Math.max(0, daysRemaining),
        healthStatus
      };
    });

    if (filters.search) {
      const q = filters.search.toLowerCase();
      contracts = contracts.filter(c => 
        c.client?.toLowerCase().includes(q) ||
        c.contractNumber?.toLowerCase().includes(q) ||
        c.object?.toLowerCase().includes(q) ||
        c.primaryService?.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      contracts = contracts.filter(c => c.status === filters.status);
    }

    if (filters.company && filters.company !== 'ALL') {
      contracts = contracts.filter(c => c.participatingCompany === filters.company);
    }

    if (filters.expiringSoon) {
      contracts = contracts.filter(c => c.daysRemaining <= 90 && c.status === ContractStatus.EM_VIGENCIA);
    }

    return contracts;
  }

  /**
   * Obtém contrato por ID
   */
  static getById(id) {
    const all = this.listAll();
    return all.find(c => c.id === id) || null;
  }

  /**
   * Sugestão e Criação de Contrato a partir de Oportunidade Ganha (Itens 4 e 5)
   */
  static createFromOpportunity(opportunity, initialData = {}, userName = 'Diretoria') {
    const all = getStorage(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACT_AWARDS);
    
    const oppId = String(opportunity.id || opportunity.number);
    const existing = all.find(c => String(c.opportunityNumber) === oppId);
    if (existing) {
      return existing;
    }

    const newId = `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const originalVal = Number(initialData.originalValue || opportunity.estimatedValue || 2000000);
    const company = opportunity.recommendedCompany || (opportunity.client?.includes('Petrobras') ? 'Veeluen Solutions' : 'Excelência Ambiental');

    const newContract = {
      id: newId,
      contractNumber: initialData.contractNumber || `${Math.floor(1000000000 + Math.random() * 9000000000)}/${new Date().getFullYear()}`,
      ataNumber: initialData.ataNumber || 'N/A',
      osNumber: initialData.osNumber || 'Aguardando emissão',
      opportunityNumber: oppId,
      client: opportunity.client || 'Órgão Licitante',
      organ: opportunity.client || 'Órgão Licitante',
      participatingCompany: company,
      object: opportunity.object || opportunity.title || 'Objeto do Contrato',
      primaryService: opportunity.primaryService || opportunity.object?.slice(0, 50) || 'Engenharia e Consultoria Ambiental',
      portal: opportunity.portal || 'Petronect Público',
      tenderModality: opportunity.modality || 'Pregão Eletrônico',
      
      originalValue: originalVal,
      amendmentsValue: 0.00,
      currentValue: originalVal,
      currency: 'BRL',
      
      signatureDate: initialData.signatureDate || null,
      startDate: initialData.startDate || null,
      endDate: initialData.endDate || null,
      durationMonths: initialData.durationMonths || 12,
      
      type: initialData.type || ContractType.CONTRATO,
      status: ContractStatus.AGUARDANDO_ASSINATURA, // Não assume assinado! (Item 9)
      healthStatus: ContractHealth.SAUDAVEL,

      postAdjudicationChecklist: [
        { id: 'pa-1', title: 'Apresentação de Garantia Contratual (Seguro ou Fiança)', done: false, deadline: 'Em até 10 dias úteis', source: 'Edital Cláusula de Garantia' },
        { id: 'pa-2', title: 'Atualização de Certidões Negativas no SICAF/Portal', done: true, deadline: 'Pré-assinatura', source: 'Habilitação Regular' },
        { id: 'pa-3', title: 'Cadastro de Dados Bancários para Ordem de Pagamento', done: false, deadline: 'Pré-assinatura', source: 'Financeiro' },
        { id: 'pa-4', title: 'Coleta de Assinatura Digital das Partes', done: false, deadline: 'Conforme convocação do órgão', source: 'Contrato Formal' },
        { id: 'pa-5', title: 'Apresentação da Equipe Técnica Designada e ASOs', done: false, deadline: 'Até a emissão da OS', source: 'Qualificação Técnica' }
      ],

      handoff: {
        isCompleted: false,
        completedAt: null,
        owners: {
          contractOwner: initialData.contractOwner || 'Eng. Leonardo Prado (Gerente de Contratos)',
          operationalOwner: initialData.operationalOwner || 'Marcelo Antunes (Coordenador de Operações)',
          technicalOwner: initialData.technicalOwner || 'Dr. Roberto Albuquerque (Responsável Técnico)',
          commercialOwner: userName
        },
        checklist: [
          { id: 'hc-1', title: 'Contrato recebido e validado com o edital', done: false },
          { id: 'hc-2', title: 'Escopo e quantitativos conferidos com a proposta comercial', done: false },
          { id: 'hc-3', title: 'Proposta vencedora disponibilizada para a equipe de campo', done: false },
          { id: 'hc-4', title: 'Atestados e CATs arquivados no cofre para futura renovação', done: false },
          { id: 'hc-5', title: 'Fiscal do contrato e gestor do órgão mapeados no CRM', done: false },
          { id: 'hc-6', title: 'Reunião de kickoff interna agendada', done: false }
        ],
        documentPackage: [
          { name: `Edital_${oppId}.pdf`, type: 'Edital', path: `vault/edital/${oppId}.pdf` },
          { name: `Proposta_Vencedora_${oppId}.pdf`, type: 'Proposta', path: `vault/proposals/${oppId}.pdf` },
          { name: `Dossier_Habilitacao_${oppId}.pdf`, type: 'Dossiê', path: `vault/dossiers/${oppId}.pdf` }
        ]
      },

      obligations: [
        {
          id: `ob-${Date.now()}-1`,
          title: 'Apresentar Garantia Contratual Formal',
          category: ObligationCategory.GARANTIA,
          description: 'Apresentação de seguro-garantia ou caução no percentual exigido pelo edital.',
          sourceTrace: 'Edital — Cláusula de Garantia',
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          recurrence: ObligationRecurrence.UNICA,
          responsible: 'Juliana Mendes (Controladoria)',
          status: ObligationStatus.PENDENTE,
          isCritical: true
        }
      ],

      amendments: [],
      contacts: [
        { name: 'Gestor de Contratos do Órgão', role: 'Gestor do Contrato', functionType: 'Gestor', email: 'contratos@orgao.gov.br', phone: 'Não informado' }
      ],

      renewalIntelligence: {
        expirationWindow: '180 dias',
        likelihood: RenewalLikelihood.POSSIVEL_RENOVACAO,
        sourceOfSignal: 'Contrato recém-adjudicado. Sinal inicial calculado a partir da vigência de 12 meses.',
        signalStrength: SignalStrength.MEDIO,
        linkedSignalId: `SIG-RENEW-${oppId}`,
        renewalPlan: {
          responsible: userName,
          strategy: 'Garantir excelência operacional no início para criar pontuação máxima na avaliação periódica do fornecedor.',
          nextAction: 'Monitorar publicação de extrato no Diário Oficial e agendar kickoff.',
          actionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
        },
        futureDocumentReadiness: {
          certificatesStatus: 'Válidas',
          technicalCapacitySufficient: true,
          teamAvailability: true,
          notes: 'Documentação do certame recente.'
        }
      },

      contractExtraction: {
        vigenciaClause: 'Vigência estimada de 12 meses a contar da publicação do extrato.',
        reajusteClause: 'Reajuste anual pelo índice oficial editalício.',
        garantiaClause: 'Exigência de garantia contratual de 5%.',
        penalidadesClause: 'Sanções administrativas previstas na Lei 14.133/2021.'
      },

      crossSellSuggestions: [
        { service: 'Laudos de Conformidade Ambiental', relevance: 'Alta', reason: 'Órgão com histórico recorrente de contratação de monitoramento.' }
      ],

      timeline: [
        { date: new Date().toISOString().slice(0, 10), event: 'Licitação Homologada e Registro de Contrato Criado', author: userName }
      ],

      auditLogs: [
        {
          timestamp: new Date().toISOString(),
          type: 'HUMAN',
          user: userName,
          action: 'Registro de Contrato inicializado a partir da vitória na oportunidade nº ' + oppId,
          details: `Valor contratado original: R$ ${originalVal.toLocaleString('pt-BR')}`
        }
      ],

      closeout: { isClosed: false, closedAt: null, reason: '', lessonsLearned: '' }
    };

    all.unshift(newContract);
    setStorage(STORAGE_KEYS.CONTRACTS, all);
    return newContract;
  }

  /**
   * Salva alterações do contrato com auditoria
   */
  static saveContract(contract, userName = 'Usuário', actionDescription = 'Atualização do contrato', isSystem = false) {
    const all = getStorage(STORAGE_KEYS.CONTRACTS, INITIAL_CONTRACT_AWARDS);
    const idx = all.findIndex(c => c.id === contract.id);

    contract.auditLogs = contract.auditLogs || [];
    contract.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      type: isSystem ? 'SYSTEM' : 'HUMAN',
      user: userName,
      action: actionDescription,
      details: `Status: ${contract.status} | Valor Atualizado: R$ ${contract.currentValue?.toLocaleString('pt-BR')}`
    });

    if (idx >= 0) {
      all[idx] = contract;
    } else {
      all.unshift(contract);
    }

    setStorage(STORAGE_KEYS.CONTRACTS, all);
    return contract;
  }

  /**
   * Conclui o Handoff do Contrato para a Operação (Itens 12 a 19)
   */
  static completeHandoff(contractId, owners, userName) {
    const contract = this.getById(contractId);
    if (!contract) throw new Error('Contrato não encontrado.');

    if (!owners.contractOwner?.trim() && !owners.operationalOwner?.trim()) {
      throw new Error('O Handoff só pode ser concluído após designar ao menos um Responsável Receptor da Operação (Item 18).');
    }

    contract.handoff.isCompleted = true;
    contract.handoff.completedAt = new Date().toISOString();
    contract.handoff.owners = {
      ...contract.handoff.owners,
      ...owners
    };

    // Marca todos os itens do checklist de handoff como concluídos
    contract.handoff.checklist.forEach(item => item.done = true);

    contract.timeline.push({
      date: new Date().toISOString().slice(0, 10),
      event: `Handoff Operacional concluído com sucesso. Responsável: ${owners.contractOwner || owners.operationalOwner}`,
      author: userName
    });

    return this.saveContract(contract, userName, 'Handoff formal para a operação concluído.');
  }

  /**
   * Registra a Assinatura e Início de Vigência do Contrato (Itens 8 e 9)
   */
  static registerSignatureAndStart(contractId, signatureData, userName) {
    const contract = this.getById(contractId);
    if (!contract) throw new Error('Contrato não encontrado.');

    contract.signatureDate = signatureData.signatureDate || new Date().toISOString().slice(0, 10);
    contract.startDate = signatureData.startDate || contract.signatureDate;
    
    // Cálculo automático de término se não informado
    if (signatureData.endDate) {
      contract.endDate = signatureData.endDate;
    } else if (contract.startDate && contract.durationMonths) {
      const start = new Date(contract.startDate);
      start.setMonth(start.getMonth() + Number(contract.durationMonths));
      contract.endDate = start.toISOString().slice(0, 10);
    }

    contract.contractNumber = signatureData.contractNumber || contract.contractNumber;
    contract.status = ContractStatus.EM_VIGENCIA;

    contract.timeline.push({
      date: contract.signatureDate,
      event: `Contrato assinado formalmente. Início da vigência: ${contract.startDate} | Término previsto: ${contract.endDate}`,
      author: userName
    });

    return this.saveContract(contract, userName, `Contrato assinado e colocado em vigência: ${contract.contractNumber}`);
  }

  /**
   * Adiciona Aditivo ao Contrato com Impacto em Prazo e Valor (Itens 38 a 41)
   */
  static addAmendment(contractId, amendmentData, userName) {
    const contract = this.getById(contractId);
    if (!contract) throw new Error('Contrato não encontrado.');

    const finImpact = Number(amendmentData.financialImpact) || 0;
    const durImpact = Number(amendmentData.durationImpactMonths) || 0;

    const newAmendment = {
      id: `AMD-${Date.now()}`,
      number: amendmentData.number || `${contract.amendments.length + 1}º Termo Aditivo`,
      type: amendmentData.type || 'Prorrogação de Prazo e Reajuste',
      date: amendmentData.date || new Date().toISOString().slice(0, 10),
      financialImpact: finImpact,
      durationImpactMonths: durImpact,
      documentName: amendmentData.documentName || 'Termo_Aditivo_Oficial.pdf',
      notes: amendmentData.notes || 'Aditivo acordado formalmente com o órgão contratante.'
    };

    contract.amendments.push(newAmendment);

    // Atualiza valor atualizado (sem alterar o original) (Item 41 e 45)
    contract.amendmentsValue += finImpact;
    contract.currentValue = contract.originalValue + contract.amendmentsValue;

    // Atualiza vigência final se houver prorrogação
    if (durImpact > 0 && contract.endDate) {
      const prevEnd = new Date(contract.endDate);
      prevEnd.setMonth(prevEnd.getMonth() + durImpact);
      const newEndDate = prevEnd.toISOString().slice(0, 10);
      
      contract.timeline.push({
        date: newAmendment.date,
        event: `${newAmendment.number}: Prazo prorrogado em +${durImpact} meses (Novo término: ${newEndDate})`,
        author: userName
      });

      contract.endDate = newEndDate;
      contract.durationMonths += durImpact;

      // Reprocessa Renewal Watch automaticamente (Item 106)
      contract.renewalIntelligence.sourceOfSignal = `Aditivo nº ${newAmendment.number} prorrogou término para ${newEndDate}. Renewal Watch atualizado.`;
    }

    if (finImpact !== 0) {
      contract.timeline.push({
        date: newAmendment.date,
        event: `${newAmendment.number}: Impacto financeiro de R$ ${finImpact.toLocaleString('pt-BR')} (Novo valor: R$ ${contract.currentValue.toLocaleString('pt-BR')})`,
        author: userName
      });
    }

    return this.saveContract(
      contract, 
      userName, 
      `Aditivo registrado: ${newAmendment.number} (+R$ ${finImpact.toLocaleString('pt-BR')}, +${durImpact} meses)`
    );
  }

  /**
   * Adiciona Obrigação Estratégica (Itens 23 a 34)
   */
  static addObligation(contractId, obligationData, userName) {
    const contract = this.getById(contractId);
    if (!contract) throw new Error('Contrato não encontrado.');

    const newObligation = {
      id: `OB-${Date.now()}`,
      title: obligationData.title,
      category: obligationData.category || ObligationCategory.DOCUMENTAL,
      description: obligationData.description || '',
      sourceTrace: obligationData.sourceTrace || 'Contrato Administrativo',
      dueDate: obligationData.dueDate,
      recurrence: obligationData.recurrence || ObligationRecurrence.UNICA,
      responsible: obligationData.responsible || contract.handoff.owners.operationalOwner,
      status: ObligationStatus.PENDENTE,
      isCritical: !!obligationData.isCritical
    };

    contract.obligations.push(newObligation);
    return this.saveContract(contract, userName, `Nova obrigação estratégica: "${newObligation.title}"`);
  }

  /**
   * Atualiza Status de Obrigação Contratual
   */
  static updateObligationStatus(contractId, obligationId, newStatus, userName) {
    const contract = this.getById(contractId);
    if (!contract) throw new Error('Contrato não encontrado.');

    const ob = contract.obligations.find(o => o.id === obligationId);
    if (!ob) throw new Error('Obrigação não encontrada.');

    ob.status = newStatus;
    return this.saveContract(contract, userName, `Obrigação "${ob.title}" atualizada para: ${newStatus}`);
  }

  /**
   * Envia Sinal de Renovação para o Radar Antecipado (Itens 71 a 75)
   */
  static sendSignalToEarlyRadar(contractId, userName) {
    const contract = this.getById(contractId);
    if (!contract) throw new Error('Contrato não encontrado.');

    const signalData = {
      organ: contract.client,
      organShort: contract.organ,
      state: 'PE',
      number: contract.contractNumber,
      object: `[RENOVAÇÃO PREVISTA] ${contract.object}`,
      relatedService: contract.primaryService,
      currentSupplier: contract.participatingCompany, // Nós somos o incumbente!
      isIncumbentKnown: true,
      initialValue: contract.currentValue,
      startDate: contract.startDate,
      endDate: contract.endDate,
      estimatedDaysRemaining: contract.daysRemaining,
      canBeExtended: contract.renewalIntelligence.likelihood === RenewalLikelihood.POSSIVEL_RENOVACAO,
      extensionNotes: contract.renewalIntelligence.sourceOfSignal,
      source: 'Vellia Licitações — Módulo de Contratos (FASE 31)',
      sourceUrl: '',
      status: 'MONITORANDO_RENOVACAO'
    };

    // Integração direta com contractMonitoringService existente
    try {
      contractMonitoringService.addExpiringContract(signalData);
    } catch (e) {
      console.warn('Integração com contractMonitoringService:', e);
    }

    contract.renewalIntelligence.linkedSignalId = `SIG-RADAR-${Date.now()}`;
    contract.timeline.push({
      date: new Date().toISOString().slice(0, 10),
      event: `Sinal de Renovação enviado para o Radar Antecipado. Monitorando nova contratação para ${contract.client}.`,
      author: userName
    });

    return this.saveContract(contract, userName, 'Sinal de renovação propagado para o Radar Antecipado.');
  }

  /**
   * Encerramento do Contrato (Contract Closeout) (Itens 112 a 116)
   */
  static closeContract(contractId, closeoutData, userName) {
    const contract = this.getById(contractId);
    if (!contract) throw new Error('Contrato não encontrado.');

    contract.status = closeoutData.wasRenewed ? ContractStatus.RENOVADO : ContractStatus.ENCERRADO;
    contract.closeout = {
      isClosed: true,
      closedAt: new Date().toISOString(),
      reason: closeoutData.reason || 'Conclusão regular do prazo contratual',
      lessonsLearned: closeoutData.lessonsLearned || 'Operação concluída com saldo comercial positivo.'
    };

    contract.timeline.push({
      date: new Date().toISOString().slice(0, 10),
      event: `Contrato encerrado formalmente. Desfecho: ${contract.status}. Motivo: ${contract.closeout.reason}`,
      author: userName
    });

    return this.saveContract(contract, userName, `Contrato encerrado (${contract.status}) com registro de lições aprendidas.`);
  }

  /**
   * Métricas Consolidadas para o Command Center (Itens 47 e 48)
   */
  static getCommandCenterMetrics() {
    const contracts = this.listAll();
    const active = contracts.filter(c => c.status === ContractStatus.EM_VIGENCIA);
    const awaitingSignature = contracts.filter(c => c.status === ContractStatus.AGUARDANDO_ASSINATURA);
    const expiringIn90Days = active.filter(c => c.daysRemaining <= 90);
    const potentialRenewals = active.filter(c => 
      c.renewalIntelligence?.likelihood === RenewalLikelihood.POSSIVEL_RENOVACAO ||
      c.renewalIntelligence?.likelihood === RenewalLikelihood.NOVA_LICITACAO_PROVAVEL
    );

    const totalActiveValue = active.reduce((acc, c) => acc + (c.currentValue || 0), 0);

    return {
      totalContracts: contracts.length,
      activeCount: active.length,
      awaitingSignatureCount: awaitingSignature.length,
      expiringIn90DaysCount: expiringIn90Days.length,
      potentialRenewalsCount: potentialRenewals.length,
      totalActiveValue,
      contractsList: contracts
    };
  }

  /**
   * Exportação do Handoff Report em Markdown (Itens 109 a 111)
   */
  static exportHandoffReport(contractId) {
    const c = this.getById(contractId);
    if (!c) return '';

    let md = `# RELATÓRIO OFICIAL DE HANDOFF DO CONTRATO\n`;
    md += `**Documento de Transição Comercial → Operacional**\n`;
    md += `*Emitido pelo Vellia Licitações em: ${new Date().toLocaleString('pt-BR')}*\n\n`;

    md += `## 1. DADOS DA CONTRATAÇÃO\n`;
    md += `- **Contratante:** ${c.client}\n`;
    md += `- **Empresa Executora:** ${c.participatingCompany}\n`;
    md += `- **Número do Contrato:** ${c.contractNumber || 'Aguardando assinatura'}\n`;
    md += `- **Número da Licitação de Origem:** ${c.opportunityNumber}\n`;
    md += `- **Objeto:** ${c.object}\n`;
    md += `- **Serviço Principal:** ${c.primaryService}\n`;
    md += `- **Valor Total Atualizado:** R$ ${(c.currentValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    md += `- **Vigência Oficial:** ${c.startDate || 'Não informado'} até ${c.endDate || 'Não informado'} (${c.durationMonths} meses)\n\n`;

    md += `## 2. EQUIPE RECEPTORA (HANDOFF OWNERS)\n`;
    md += `- **Responsável pelo Contrato:** ${c.handoff.owners.contractOwner || 'Não informado'}\n`;
    md += `- **Responsável Operacional:** ${c.handoff.owners.operationalOwner || 'Não informado'}\n`;
    md += `- **Responsável Técnico:** ${c.handoff.owners.technicalOwner || 'Não informado'}\n`;
    md += `- **Responsável Comercial:** ${c.handoff.owners.commercialOwner || 'Não informado'}\n\n`;

    md += `## 3. COMPROMISSOS E OBRIGAÇÕES ESTRATÉGICAS\n`;
    if (c.obligations && c.obligations.length > 0) {
      c.obligations.forEach(ob => {
        md += `- **[${ob.category}] ${ob.title}:** Vencimento em ${ob.dueDate} (${ob.recurrence}) | Resp: ${ob.responsible} | Status: ${ob.status}\n`;
        md += `  ↳ *Fonte:* ${ob.sourceTrace}\n`;
      });
    } else {
      md += `Nenhuma obrigação crítica cadastrada.\n`;
    }

    md += `\n## 4. DIRETRIZES DE RENOVAÇÃO & PRÓXIMA CONTRATAÇÃO\n`;
    md += `- **Probabilidade:** ${c.renewalIntelligence?.likelihood || 'Indeterminado'}\n`;
    md += `- **Base do Sinal:** ${c.renewalIntelligence?.sourceOfSignal || 'Não informado'}\n`;
    md += `- **Estratégia Recomendada:** ${c.renewalIntelligence?.renewalPlan?.strategy || 'Não informado'}\n`;

    return md;
  }
}
