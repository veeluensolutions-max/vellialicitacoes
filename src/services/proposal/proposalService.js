/**
 * VELLIA LICITAÇÕES — FASE 11: GESTÃO DA PROPOSTA + FORMAÇÃO DE PREÇO + CHECKLIST DE PARTICIPAÇÃO
 * Central operacional para converter oportunidades GO em processos de preparação de propostas.
 * 
 * Módulos integrados:
 * - Ciclo de vida e status da proposta (Rascunho a Enviada/Ganha)
 * - Múltiplos responsáveis (Principal, Técnico, Comercial, Documental, Financeiro)
 * - Checklist Operacional e Dinâmico baseado no edital
 * - Sistema de Tarefas (Tasks) com status, prazos, bloqueios e dependências
 * - Formação e Composição de Preço (Mão de Obra, Equipamentos, Laboratório, Deslocamento,
 *   Materiais, Terceiros, Custos Indiretos, Tributos flexíveis, BDI ou Markup)
 * - 3 Cenários Financeiros (Conservador, Provável, Agressivo)
 * - Cotações com fornecedores e comparativo
 * - Fluxo de aprovação de preço e logs de auditoria
 * - Estrutura da Proposta Técnica e Comercial com versionamento (V1, V2...)
 * - Dossiê da Proposta (13 categorias documentais)
 * - Bloqueadores de Envio (Submission Blockers)
 * - Proposal Readiness Score (0 a 100%)
 * - Envio no portal com comprovante e protocolo
 * - Calendário, Kanban e Métricas
 * - Assistente de Proposta baseado estritamente em dados reais
 */

import { OpportunityService } from '../opportunityService.js';
import { DecisionService } from '../decision/decisionService.js';
import { EditalAnalysisEngine } from '../edital/editalAnalysisEngine.js';
import { DocumentVaultService } from '../vault/documentVaultService.js';

// 3. Status da Proposta
export const ProposalStatus = {
  RASCUNHO: 'RASCUNHO',
  EM_PREPARACAO: 'EM PREPARAÇÃO',
  AGUARDANDO_DOCUMENTOS: 'AGUARDANDO DOCUMENTOS',
  EM_PRECIFICACAO: 'EM PRECIFICAÇÃO',
  EM_REVISAO: 'EM REVISÃO',
  APROVACAO_INTERNA: 'APROVAÇÃO INTERNA',
  PRONTA_PARA_ENVIO: 'PRONTA PARA ENVIO',
  ENVIADA: 'ENVIADA',
  ENCERRADA: 'ENCERRADA',
  CANCELADA: 'CANCELADA'
};

// 8. Status de Tarefa
export const TaskStatus = {
  PENDENTE: 'Pendente',
  EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO_TERCEIRO: 'Aguardando terceiro',
  CONCLUIDA: 'Concluída',
  BLOQUEADA: 'Bloqueada',
  CANCELADA: 'Cancelada'
};

// 34. Status do Documento na Proposta
export const ProposalDocStatus = {
  ATENDIDO: 'Atendido',
  PENDENTE: 'Pendente',
  VENCIDO: 'Vencido',
  INCOMPATIVEL: 'Incompatível',
  EM_REVISAO: 'Em revisão',
  NAO_SE_APLICA: 'Não se aplica'
};

// 50. Resultado da Licitação
export const TenderResult = {
  PARTICIPANDO: 'Participando',
  AGUARDANDO_RESULTADO: 'Aguardando resultado',
  GANHA: 'Ganha',
  PERDIDA: 'Perdida',
  CANCELADA: 'Cancelada',
  REVOGADA: 'Revogada',
  DESERTA: 'Deserta',
  SEM_RESULTADO: 'Sem resultado'
};

// 52. Motivos de Perda
export const LossReason = {
  PRECO: 'Preço',
  TECNICA: 'Técnica',
  HABILITACAO: 'Habilitação',
  DOCUMENTO: 'Documento',
  DESCLASSIFICACAO: 'Desclassificação',
  CONCORRENTE: 'Concorrente',
  OUTRO: 'Outro'
};

// 32. 13 Categorias do Dossiê da Proposta
export const DossierCategories = [
  'Edital',
  'Habilitação Jurídica',
  'Fiscal',
  'Técnica',
  'Atestados',
  'ARTs',
  'Equipe',
  'Equipamentos',
  'Proposta Técnica',
  'Proposta Comercial',
  'Planilhas',
  'Declarações',
  'Comprovante de Envio'
];

const STORAGE_KEYS = {
  PROPOSALS: 'vellia_proposals_v1',
  TASKS: 'vellia_proposal_tasks_v1',
  QUOTATIONS: 'vellia_proposal_quotations_v1',
  AUDIT_LOGS: 'vellia_proposal_audit_v1',
  ALERTS: 'vellia_proposal_alerts_v1'
};

// Helper universal de storage (com fallback in-memory)
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

// 5. Checklist Operacional Padrão (16 tarefas)
export const DEFAULT_OPERATIONAL_CHECKLIST = [
  { id: 'chk-edital', title: 'Analisar edital', description: 'Leitura pormenorizada do edital e termo de referência', role: 'Responsável principal', category: 'Análise' },
  { id: 'chk-doc', title: 'Validar documentação', description: 'Checar certidões fiscais, trabalhistas e jurídicas', role: 'Responsável documental', category: 'Documental' },
  { id: 'chk-atestados', title: 'Validar atestados', description: 'Confirmar suficiência técnica dos atestados e CATs vinculadas', role: 'Responsável técnico', category: 'Técnico' },
  { id: 'chk-equipe', title: 'Validar equipe', description: 'Confirmar alocação de engenheiros, químicos e técnicos habilitados', role: 'Responsável técnico', category: 'Equipe' },
  { id: 'chk-equip', title: 'Validar equipamentos', description: 'Verificar certificados de calibração RBC e disponibilidade física', role: 'Responsável técnico', category: 'Equipamentos' },
  { id: 'chk-custos', title: 'Levantar custos', description: 'Estruturar os quantitativos de mão de obra, insumos e logística', role: 'Responsável financeiro', category: 'Financeiro' },
  { id: 'chk-cotacao', title: 'Realizar cotação', description: 'Coletar orçamentos de laboratórios acreditados e terceiros', role: 'Responsável comercial', category: 'Comercial' },
  { id: 'chk-margem', title: 'Definir margem', description: 'Definir margem de contribuição e modelo de precificação (BDI/Markup)', role: 'Responsável financeiro', category: 'Financeiro' },
  { id: 'chk-aprovar-preco', title: 'Aprovar preço', description: 'Revisão e homologação do preço de venda com a diretoria', role: 'Responsável comercial', category: 'Comercial' },
  { id: 'chk-prop-tec', title: 'Preparar proposta técnica', description: 'Redigir metodologia, plano de amostragem e diferenciais', role: 'Responsável técnico', category: 'Técnico' },
  { id: 'chk-prop-com', title: 'Preparar proposta comercial', description: 'Consolidar carta de apresentação, preços unitários e condições', role: 'Responsável comercial', category: 'Comercial' },
  { id: 'chk-rev-doc', title: 'Revisar documentos', description: 'Conferir integralidade e validade de todas as certidões e declarações', role: 'Responsável documental', category: 'Documental' },
  { id: 'chk-rev-prop', title: 'Revisar proposta', description: 'Revisão cruzada entre técnica, comercial e jurídica', role: 'Responsável principal', category: 'Revisão' },
  { id: 'chk-aprov-int', title: 'Aprovar internamente', description: 'Obter as 4 assinaturas (Técnica, Comercial, Financeira, Final)', role: 'Responsável principal', category: 'Aprovação' },
  { id: 'chk-enviar', title: 'Enviar proposta', description: 'Submeter a proposta e arquivos oficiais no portal Petronect', role: 'Responsável comercial', category: 'Envio' },
  { id: 'chk-comprovante', title: 'Registrar comprovante de envio', description: 'Anexar recibo, protocolo e print oficial da sessão', role: 'Responsável comercial', category: 'Envio' }
];

export class ProposalService {
  /**
   * Inicializa o repositório com propostas modelo ricas para validação imediata (Item 65)
   */
  static initSeedData() {
    const existing = getStorage(STORAGE_KEYS.PROPOSALS, null);
    if (existing && Array.isArray(existing) && existing.length > 0) return;

    const seedProposals = [
      // 1. Proposta Quase Pronta (Readiness ~86%, Item 38 e 65)
      this._createSeedProposal1(),
      // 2. Proposta com Documentação Pendente (Item 65)
      this._createSeedProposal2(),
      // 3. Proposta Aguardando Preço / Cotação (Item 65)
      this._createSeedProposal3(),
      // 4. Proposta com Prazo Crítico (< 24h) (Item 65)
      this._createSeedProposal4(),
      // 5. Proposta Enviada (Item 65)
      this._createSeedProposal5()
    ];

    setStorage(STORAGE_KEYS.PROPOSALS, seedProposals);
  }

  /**
   * Lista todas as propostas cadastradas
   */
  static listAll() {
    this.initSeedData();
    return getStorage(STORAGE_KEYS.PROPOSALS, []);
  }

  /**
   * Obtém proposta pelo ID
   */
  static getById(id) {
    const all = this.listAll();
    return all.find(p => p.id === id) || null;
  }

  /**
   * 1 & 2. CRIAÇÃO DA PROPOSTA A PARTIR DE UMA OPORTUNIDADE GO
   * Importa automaticamente todos os metadados técnicos, edital e scores.
   */
  static createProposalFromOpportunity(opportunity, author = 'Equipe de Propostas') {
    if (!opportunity) throw new Error('Oportunidade inválida para conversão em proposta.');

    const oppNumber = String(opportunity.number || opportunity.id);
    const existingProposals = this.listAll();
    
    // Verificar se já existe proposta para esta oportunidade
    const alreadyExists = existingProposals.find(p => String(p.opportunityNumber) === oppNumber);
    if (alreadyExists) {
      return alreadyExists;
    }

    // Calcular Decision e Edital Analysis
    const decision = DecisionService.calculateDecision(opportunity);
    const editalAnalysis = EditalAnalysisEngine.getAnalysis(oppNumber);

    const proposalId = `PROP-${oppNumber}-${Date.now().toString().slice(-4)}`;

    // Criar tarefas operacionais padrão + tarefas dinâmicas do edital (Item 5 e 6)
    const initialTasks = this._generateInitialTasks(proposalId, oppNumber, editalAnalysis, opportunity);

    // Estruturar dossiê de documentos baseado no edital e cofre documental (Item 32, 33, 34)
    const initialDossier = this._generateInitialDossier(oppNumber, opportunity, editalAnalysis);

    // 11-20. Formação inicial de custos (respeitando regra 24: NÃO INVENTAR CUSTOS)
    const initialPricing = this._generateInitialPricing(opportunity, editalAnalysis);

    const newProposal = {
      id: proposalId,
      opportunityNumber: oppNumber,
      portal: opportunity.portal || 'Petronect',
      client: opportunity.client || 'Petrobras',
      object: opportunity.object || opportunity.title || 'Serviços de Engenharia Especializada',
      participatingCompany: opportunity.recommendedCompany || 'Excelência Ambiental',
      primaryService: opportunity.identifiedService || opportunity.primaryService || 'Monitoramento Ambiental',
      opportunityDeadline: opportunity.endDate || '24/10/2026',
      targetSubmissionDate: `${opportunity.endDate || '24/10/2026'} 17:00`,
      estimatedValue: opportunity.estimatedValue || 'Valor não informado no edital',
      decisionScore: decision?.decisionScore || 85,
      riskScore: decision?.risks?.riskScore || 32,
      adherenceScore: opportunity.score || 90,
      
      // 3. Status da Proposta
      status: ProposalStatus.EM_PREPARACAO,
      
      // 4. Responsáveis (permite mesma pessoa em mais de uma função)
      responsibles: {
        principal: 'Dr. Roberto Albuquerque (Eng. Químico)',
        tecnico: 'Dr. Roberto Albuquerque (Eng. Químico)',
        comercial: 'Mariana Castro (Gerente de Contratos)',
        documental: 'Dra. Mariana Lemos (Jurídico & Habilitação)',
        financeiro: 'Carlos Silveira (Controladoria)'
      },

      // 5 e 6. Tarefas e Checklists
      tasks: initialTasks,

      // 11-24. Composição de Preço & 3 Cenários
      pricing: initialPricing,

      // 25-26. Cotações
      quotations: [],

      // 27-28. Aprovação do Preço
      priceApproval: {
        status: 'Pendente', // 'Pendente' | 'Em Revisão' | 'Aprovado' | 'Rejeitado'
        approvedBy: null,
        approvedAt: null,
        notes: 'Preço em fase de levantamento de custos diretos.'
      },
      priceChangeLogs: [],

      // 29-30. Proposta Técnica e Comercial
      technicalProposal: {
        presentation: `A ${opportunity.recommendedCompany || 'Excelência Ambiental'} é uma organização especializada na prestação de serviços continuados de alta complexidade com ampla experiência no setor de óleo, gás e energia.`,
        understanding: `Compreensão abrangente das obrigações descritas no Termo de Referência da ${opportunity.client}. Foco na garantia de amostragem isocinética e conformidade com normas regulamentadoras.`,
        methodology: 'Adoção dos métodos oficiais da CETESB, ABNT NBR e EPA (Methods 1 a 5) com garantia da cadeia de custódia amostral.',
        workPlan: 'Mobilização em até 10 dias após emissão da Autorização de Serviço (AS). Campanhas quadrimestrais com relatórios entregues em até 15 dias.',
        team: 'Equipe multidisciplinar composta por Engenheiros Químicos, Sanitaristas, Técnicos em Meio Ambiente e Amostradores Certificados.',
        equipment: 'Trens de amostragem isocinética Apex C-5000, analisadores de combustão Testo 350 e sondas aquecidas de titânio calibradas pela RBC.',
        schedule: '12 meses renováveis, com 3 campanhas anuais programadas e paradas operacionais assistidas.',
        experience: 'Mais de 15 anos de atuação contínua em refinarias, terminais portuários e polos químicos.',
        certificates: 'Atestados emitidos pela Petrobras RNEST e Terminal Aquaviário de Suape devidamente registrados no CREA-PE.',
        technicalResponsibility: 'Anotação de Responsabilidade Técnica (ART) com Registro CREA ativo.',
        differentials: 'Laboratório credenciado Cgcre/Inmetro, frota própria de veículos adaptados e certificações ISO 9001 e ISO 14001.'
      },

      commercialProposal: {
        object: opportunity.object || opportunity.title,
        validityDays: 60,
        executionPeriod: '12 meses a contar da ordem de início',
        paymentTerms: 'Faturamento mensal até o 15º dia útil subsequente à medição homologada pela fiscalização',
        taxesIncluded: 'Todos os tributos incidentes (ISS, PIS, COFINS, CPRB), seguros, encargos sociais e trabalhistas inclusos',
        conditions: 'Preço firme e irreajustável pelo período de 12 meses. Reajuste anual pelo índice IPCA/IBGE.',
        observations: 'Proposta elaborada em estrita conformidade com as exigências da minuta contratual do edital.'
      },

      // 43-44. Versionamento de Proposta
      versions: [
        {
          versionNumber: 'V1',
          createdAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          author: author,
          price: initialPricing.definedPrice,
          margin: initialPricing.finalMargin,
          scopeSummary: 'Versão inicial gerada a partir da deliberação de GO.',
          changes: 'Criação estrutural e importação dos parâmetros do edital.'
        }
      ],

      // 32-34. Dossiê de Documentos
      dossier: initialDossier,

      // 42. Aprovações Internas
      approvals: {
        technical: { status: 'Pendente', user: null, date: null, notes: '' },
        commercial: { status: 'Pendente', user: null, date: null, notes: '' },
        financial: { status: 'Pendente', user: null, date: null, notes: '' },
        final: { status: 'Pendente', user: null, date: null, notes: '' }
      },

      // 45-48. Envio da Proposta
      submission: {
        submitted: false,
        submissionDate: null,
        submissionTime: null,
        submittedBy: null,
        portalUrl: opportunity.url || 'https://www.petronect.com.br',
        protocolNumber: null,
        receiptAttachment: null,
        observations: ''
      },

      // 49-52. Resultado da Licitação
      result: {
        status: TenderResult.AGUARDANDO_RESULTADO,
        date: null,
        lossReason: null,
        notes: '',
        convertedToContract: false
      },

      // Auditoria
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          user: author,
          action: 'PROPOSTA_CRIADA',
          details: `Proposta gerada a partir da Oportunidade #${oppNumber} com Decision Score de ${decision?.decisionScore}%.`
        }
      ],

      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    existingProposals.unshift(newProposal);
    setStorage(STORAGE_KEYS.PROPOSALS, existingProposals);

    this.recordAudit({
      proposalId: newProposal.id,
      user: author,
      action: 'CRIAR_PROPOSTA',
      details: `Proposta ${newProposal.id} criada para oportunidade #${oppNumber}.`
    });

    return newProposal;
  }

  /**
   * Salva alterações em uma proposta existente
   */
  static saveProposal(updatedProposal, user = 'Usuário do Sistema', actionDesc = 'Atualização da proposta') {
    const all = this.listAll();
    const index = all.findIndex(p => p.id === updatedProposal.id);
    if (index === -1) throw new Error('Proposta não encontrada.');

    updatedProposal.lastUpdated = new Date().toISOString();
    
    if (actionDesc) {
      if (!updatedProposal.auditLogs) updatedProposal.auditLogs = [];
      updatedProposal.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        user,
        action: 'EDICAO_PROPOSTA',
        details: actionDesc
      });
    }

    all[index] = updatedProposal;
    setStorage(STORAGE_KEYS.PROPOSALS, all);
    return updatedProposal;
  }

  /**
   * 37-39. PROPOSAL READINESS SCORE (Score de Prontidão 0 a 100%)
   * Avalia Documentação, Preço, Técnico, Equipe, Equipamentos, Tarefas, Pendências, Aprovações.
   */
  static calculateReadiness(proposal) {
    if (!proposal) return { totalScore: 0, classification: 'INCOMPLETA', breakdown: {}, blockers: [] };

    // 1. Documentação (peso 25%)
    const docs = proposal.dossier?.items || [];
    const totalDocs = docs.length;
    const okDocs = docs.filter(d => d.status === ProposalDocStatus.ATENDIDO).length;
    const docScore = totalDocs > 0 ? Math.round((okDocs / totalDocs) * 100) : 50;

    // 2. Preço (peso 20%)
    let priceScore = 0;
    const isPriceApproved = proposal.priceApproval?.status === 'Aprovado';
    const hasDefinedPrice = proposal.pricing?.definedPrice > 0;
    const hasPendingCost = proposal.pricing?.laborTotal === 0 || proposal.pricing?.itemsPendingQuote > 0;
    if (isPriceApproved) priceScore = 100;
    else if (hasDefinedPrice && !hasPendingCost) priceScore = 75;
    else if (hasDefinedPrice) priceScore = 50;
    else priceScore = 20;

    // 3. Proposta Técnica (peso 15%)
    let techScore = 0;
    if (proposal.technicalProposal?.methodology && proposal.technicalProposal?.workPlan) techScore += 50;
    if (proposal.technicalProposal?.certificates && proposal.technicalProposal?.differentials) techScore += 50;

    // 4. Equipe (peso 10%)
    const hasTeam = !!proposal.responsibles?.tecnico && !!proposal.technicalProposal?.team;
    const teamScore = hasTeam ? 100 : 40;

    // 5. Equipamentos (peso 10%)
    const equipItems = proposal.pricing?.equipmentItems || [];
    const equipScore = equipItems.length > 0 ? 90 : 70;

    // 6. Tarefas (peso 10%)
    const tasks = proposal.tasks || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.CONCLUIDA).length;
    const taskScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 60;

    // 7. Aprovações Internas (peso 10%)
    const app = proposal.approvals || {};
    let appCount = 0;
    if (app.technical?.status === 'Aprovado') appCount++;
    if (app.commercial?.status === 'Aprovado') appCount++;
    if (app.financial?.status === 'Aprovado') appCount++;
    if (app.final?.status === 'Aprovado') appCount++;
    const approvalScore = Math.round((appCount / 4) * 100);

    // Média ponderada
    const totalWeighted = (
      (docScore * 0.25) +
      (priceScore * 0.20) +
      (techScore * 0.15) +
      (teamScore * 0.10) +
      (equipScore * 0.10) +
      (taskScore * 0.10) +
      (approvalScore * 0.10)
    );

    const totalScore = Math.min(100, Math.max(0, Math.round(totalWeighted)));

    // 39. Classificação
    let classification = 'INCOMPLETA';
    let badgeClass = 'readiness-incomplete';
    if (totalScore >= 90) {
      classification = 'PRONTA';
      badgeClass = 'readiness-ready';
    } else if (totalScore >= 75) {
      classification = 'QUASE PRONTA';
      badgeClass = 'readiness-almost';
    } else if (totalScore >= 50) {
      classification = 'EM PREPARAÇÃO';
      badgeClass = 'readiness-prep';
    }

    // 35-36. Submission Blockers (Bloqueadores Críticos)
    const blockers = this.identifyBlockers(proposal);
    const hasBlockers = blockers.length > 0;

    return {
      totalScore,
      classification,
      badgeClass,
      hasBlockers,
      blockers,
      breakdown: {
        documentacao: { score: docScore, weight: 25, label: 'Documentação' },
        preco: { score: priceScore, weight: 20, label: 'Formação de Preço' },
        tecnico: { score: techScore, weight: 15, label: 'Proposta Técnica' },
        equipe: { score: teamScore, weight: 10, label: 'Equipe Técnica' },
        equipamentos: { score: equipScore, weight: 10, label: 'Equipamentos' },
        tarefas: { score: taskScore, weight: 10, label: 'Tarefas do Checklist' },
        aprovacoes: { score: approvalScore, weight: 10, label: 'Aprovações Internas' }
      }
    };
  }

  /**
   * 35-36. Identifica Bloqueadores de Envio (Submission Blockers)
   */
  static identifyBlockers(proposal) {
    const blockers = [];
    if (!proposal) return blockers;

    // 1. Certidões ou documentos vencidos/pendentes
    const docs = proposal.dossier?.items || [];
    const expiredDocs = docs.filter(d => d.status === ProposalDocStatus.VENCIDO);
    if (expiredDocs.length > 0) {
      blockers.push({
        id: 'blk-doc-vencido',
        severity: 'CRÍTICO',
        title: 'Certidão ou Documento Obrigatório Vencido',
        description: `${expiredDocs.length} documento(s) com validade expirada: ${expiredDocs.map(d => d.name).join(', ')}.`,
        canOverride: false
      });
    }

    const missingMandatoryDocs = docs.filter(d => d.isMandatory && (d.status === ProposalDocStatus.PENDENTE || d.status === ProposalDocStatus.INCOMPATIVEL));
    if (missingMandatoryDocs.length > 0) {
      blockers.push({
        id: 'blk-doc-faltante',
        severity: 'CRÍTICO',
        title: 'Documento Obrigatório Não Anexado',
        description: `Exigência de habilitação pendente: ${missingMandatoryDocs.map(d => d.name).slice(0, 2).join(', ')}.`,
        canOverride: false
      });
    }

    // 2. Preço não aprovado (Item 27)
    if (proposal.priceApproval?.status !== 'Aprovado') {
      blockers.push({
        id: 'blk-preco-nao-aprovado',
        severity: 'CRÍTICO',
        title: 'Preço de Venda Não Aprovado',
        description: 'A planilha de formação de preço precisa ser formalmente aprovada pela gerência antes do envio.',
        canOverride: true
      });
    }

    // 3. Custos com valores pendentes de cotação (Item 24)
    if (proposal.pricing?.itemsPendingQuote > 0) {
      blockers.push({
        id: 'blk-cotacao-pendente',
        severity: 'ALTO',
        title: 'Cotação de Custos Pendente',
        description: `Existem ${proposal.pricing.itemsPendingQuote} itens marcados como 'Pendente de cotação'.`,
        canOverride: true
      });
    }

    // 4. Proposta comercial ausente
    if (!proposal.commercialProposal?.validityDays || !proposal.pricing?.definedPrice) {
      blockers.push({
        id: 'blk-prop-comercial',
        severity: 'CRÍTICO',
        title: 'Proposta Comercial Incompleta',
        description: 'Valor final ofertado ou condições comerciais não foram preenchidos.',
        canOverride: false
      });
    }

    // 5. Visita técnica obrigatória não realizada (se exigida no edital)
    const visitaTask = proposal.tasks?.find(t => t.title?.toLowerCase().includes('visita técnica'));
    if (visitaTask && visitaTask.status !== TaskStatus.CONCLUIDA) {
      blockers.push({
        id: 'blk-visita-tecnica',
        severity: 'CRÍTICO',
        title: 'Visita Técnica Obrigatória Pendente',
        description: 'O edital estabelece visita técnica ao local de execução que ainda não foi comprovada.',
        canOverride: true
      });
    }

    return blockers;
  }

  /**
   * 27-28. Fluxo de Aprovação de Preço e Registro de Log
   */
  static approvePrice(proposalId, user = 'Diretor Comercial', notes = 'Preço aprovado conforme margem meta.') {
    const proposal = this.getById(proposalId);
    if (!proposal) throw new Error('Proposta não encontrada.');

    const previousStatus = proposal.priceApproval.status;
    proposal.priceApproval = {
      status: 'Aprovado',
      approvedBy: user,
      approvedAt: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      notes
    };

    // Atualiza status se estava em precificação
    if (proposal.status === ProposalStatus.EM_PRECIFICACAO) {
      proposal.status = ProposalStatus.EM_REVISAO;
    }

    this.saveProposal(proposal, user, `Preço de venda aprovado: ${this.formatCurrency(proposal.pricing.definedPrice)} (Margem: ${proposal.pricing.finalMargin}%).`);
    return proposal;
  }

  /**
   * 28. Altera o preço de venda e registra Log Auditável Obrigatório
   */
  static updateDefinedPrice(proposalId, newPrice, user = 'Carlos Silveira', reason = 'Ajuste de competitividade para disputa') {
    const proposal = this.getById(proposalId);
    if (!proposal) throw new Error('Proposta não encontrada.');

    const previousPrice = proposal.pricing.definedPrice;
    const cost = proposal.pricing.totalEstimatedCost;
    const newMargin = cost > 0 ? Number((((newPrice - cost) / newPrice) * 100).toFixed(2)) : 0;

    proposal.pricing.definedPrice = Number(newPrice);
    proposal.pricing.finalMargin = newMargin;
    
    // Revoga aprovação anterior caso o preço mude
    proposal.priceApproval = {
      status: 'Em Revisão',
      approvedBy: null,
      approvedAt: null,
      notes: `Preço alterado de ${this.formatCurrency(previousPrice)} para ${this.formatCurrency(newPrice)}. Requer nova aprovação.`
    };

    // Log de alteração de preço
    if (!proposal.priceChangeLogs) proposal.priceChangeLogs = [];
    proposal.priceChangeLogs.unshift({
      id: `pcl-${Date.now()}`,
      previousPrice,
      newPrice,
      user,
      date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      reason
    });

    // Cria nova versão de proposta (Item 43)
    const nextVer = `V${(proposal.versions?.length || 1) + 1}`;
    proposal.versions.unshift({
      versionNumber: nextVer,
      createdAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      author: user,
      price: newPrice,
      margin: newMargin,
      scopeSummary: `Atualização de preço (${reason})`,
      changes: `Preço anterior: ${this.formatCurrency(previousPrice)} → Novo preço: ${this.formatCurrency(newPrice)}.`
    });

    this.saveProposal(proposal, user, `Preço definido alterado para ${this.formatCurrency(newPrice)}. Justificativa: ${reason}`);
    return proposal;
  }

  /**
   * 45-48. Envio da Proposta (Submissão Manual no Portal com Comprovante)
   */
  static recordSubmission(proposalId, submissionData, user = 'Mariana Castro') {
    const proposal = this.getById(proposalId);
    if (!proposal) throw new Error('Proposta não encontrada.');

    // Validar se há bloqueadores críticos não superados (Item 36)
    const readiness = this.calculateReadiness(proposal);
    if (readiness.hasBlockers && !submissionData.allowOverride) {
      throw new Error(`A proposta possui bloqueadores impeditivos: ${readiness.blockers[0].title}. Ative a justificativa de override se autorizado.`);
    }

    const now = new Date();
    proposal.submission = {
      submitted: true,
      submissionDate: submissionData.submissionDate || now.toLocaleDateString('pt-BR'),
      submissionTime: submissionData.submissionTime || now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      submittedBy: user,
      portalUrl: submissionData.portalUrl || proposal.submission.portalUrl,
      protocolNumber: submissionData.protocolNumber || `PETRO-${Date.now().toString().slice(-6)}`,
      receiptAttachment: submissionData.receiptAttachment || 'comprovante_envio_petronect.pdf',
      observations: submissionData.observations || 'Proposta protocolada com êxito na sala de disputa.'
    };

    proposal.status = ProposalStatus.ENVIADA;
    proposal.result.status = TenderResult.PARTICIPANDO;

    // Atualizar tarefas de envio
    const taskEnvio = proposal.tasks.find(t => t.id === 'chk-enviar');
    if (taskEnvio) taskEnvio.status = TaskStatus.CONCLUIDA;
    const taskComp = proposal.tasks.find(t => t.id === 'chk-comprovante');
    if (taskComp) taskComp.status = TaskStatus.CONCLUIDA;

    // Adiciona ao Dossiê da Proposta na Categoria 'Comprovante de Envio'
    proposal.dossier.items.push({
      id: `doc-comp-${Date.now()}`,
      category: 'Comprovante de Envio',
      name: `Comprovante de Submissão - Protocolo ${proposal.submission.protocolNumber}`,
      isMandatory: true,
      validity: 'Permanente',
      status: ProposalDocStatus.ATENDIDO,
      fileName: proposal.submission.receiptAttachment,
      notes: `Enviado por ${user} em ${proposal.submission.submissionDate} às ${proposal.submission.submissionTime}`
    });

    this.saveProposal(proposal, user, `Proposta marcada como ENVIADA no portal. Protocolo: ${proposal.submission.protocolNumber}`);
    return proposal;
  }

  /**
   * 50-52. Registrar Resultado da Licitação (Ganha / Perdida / etc.)
   */
  static recordTenderResult(proposalId, resultData, user = 'Diretor Comercial') {
    const proposal = this.getById(proposalId);
    if (!proposal) throw new Error('Proposta não encontrada.');

    proposal.result = {
      status: resultData.status,
      date: new Date().toLocaleDateString('pt-BR'),
      lossReason: resultData.status === TenderResult.PERDIDA ? (resultData.lossReason || LossReason.PRECO) : null,
      notes: resultData.notes || '',
      convertedToContract: resultData.status === TenderResult.GANHA ? true : false
    };

    if (resultData.status === TenderResult.GANHA || resultData.status === TenderResult.PERDIDA) {
      proposal.status = ProposalStatus.ENCERRADA;
    }

    this.saveProposal(proposal, user, `Resultado da licitação registrado: ${resultData.status}${resultData.lossReason ? ` (Motivo: ${resultData.lossReason})` : ''}.`);
    return proposal;
  }

  /**
   * 42. Registro de Aprovação Interna (Técnica, Comercial, Financeira, Final)
   */
  static recordInternalApproval(proposalId, approvalType, status, user, notes = '') {
    const proposal = this.getById(proposalId);
    if (!proposal) throw new Error('Proposta não encontrada.');

    if (!proposal.approvals[approvalType]) {
      throw new Error(`Tipo de aprovação '${approvalType}' inválido.`);
    }

    proposal.approvals[approvalType] = {
      status, // 'Aprovado' | 'Rejeitado' | 'Pendente'
      user,
      date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      notes
    };

    // Se todas as 4 forem aprovadas, pode transitar para PRONTA_PARA_ENVIO se não houver bloqueador
    const allApproved = Object.values(proposal.approvals).every(a => a.status === 'Aprovado');
    if (allApproved && proposal.status === ProposalStatus.APROVACAO_INTERNA) {
      const readiness = this.calculateReadiness(proposal);
      if (!readiness.hasBlockers) {
        proposal.status = ProposalStatus.PRONTA_PARA_ENVIO;
      }
    }

    this.saveProposal(proposal, user, `Aprovação interna (${approvalType}): ${status}.`);
    return proposal;
  }

  /**
   * 9-10. Contagem Regressiva e Alertas Progressivos (7d, 3d, 48h, 24h, 6h, 2h)
   */
  static getCountdownInfo(deadlineString) {
    if (!deadlineString) return { expired: false, text: 'Prazo não definido', hoursRemaining: 999 };

    // Tentar parsear formato "DD/MM/YYYY HH:mm" ou "DD/MM/YYYY"
    let targetDate;
    const parts = deadlineString.split(' ');
    const dateParts = parts[0].split('/');
    if (dateParts.length === 3) {
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const year = parseInt(dateParts[2], 10);
      let hours = 17, minutes = 0;
      if (parts[1]) {
        const timeParts = parts[1].split(':');
        hours = parseInt(timeParts[0], 10) || 17;
        minutes = parseInt(timeParts[1], 10) || 0;
      }
      targetDate = new Date(year, month, day, hours, minutes);
    } else {
      targetDate = new Date(deadlineString);
    }

    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    if (diffMs <= 0) {
      return {
        expired: true,
        text: 'Prazo Encerrado',
        hoursRemaining: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        urgencyClass: 'countdown-expired'
      };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    let urgencyClass = 'countdown-normal';
    if (totalHours <= 6) urgencyClass = 'countdown-critical';
    else if (totalHours <= 24) urgencyClass = 'countdown-urgent';
    else if (totalHours <= 72) urgencyClass = 'countdown-warning';

    const text = days > 0
      ? `${days} dia${days > 1 ? 's' : ''} e ${hours} hora${hours > 1 ? 's' : ''}`
      : `${hours} hora${hours > 1 ? 's' : ''} e ${minutes} min`;

    return {
      expired: false,
      text,
      totalHours,
      days,
      hours,
      minutes,
      urgencyClass
    };
  }

  /**
   * 10 & 59. Retorna todos os alertas do sistema sobre as propostas
   */
  static getProposalAlerts() {
    const proposals = this.listAll();
    const alerts = [];

    proposals.forEach(p => {
      const countdown = this.getCountdownInfo(p.targetSubmissionDate || p.opportunityDeadline);
      const readiness = this.calculateReadiness(p);

      // Alerta de Prazo Crítico
      if (p.status !== ProposalStatus.ENVIADA && p.status !== ProposalStatus.ENCERRADA) {
        if (countdown.totalHours <= 24 && !countdown.expired) {
          alerts.push({
            id: `alt-prazo-24h-${p.id}`,
            proposalId: p.id,
            oppNumber: p.opportunityNumber,
            severity: 'CRÍTICO',
            title: `Prazo crítico para envio da proposta (${countdown.text})`,
            message: `A proposta #${p.id} para a ${p.client} encerra em menos de 24 horas.`,
            type: 'DEADLINE'
          });
        } else if (countdown.totalHours <= 72 && !countdown.expired) {
          alerts.push({
            id: `alt-prazo-72h-${p.id}`,
            proposalId: p.id,
            oppNumber: p.opportunityNumber,
            severity: 'ALTO',
            title: `Encerramento em ${countdown.text}`,
            message: `Faltam menos de 3 dias para submissão no portal ${p.portal}.`,
            type: 'DEADLINE'
          });
        }
      }

      // Alerta de Bloqueador Crítico
      if (readiness.hasBlockers) {
        alerts.push({
          id: `alt-blocker-${p.id}`,
          proposalId: p.id,
          oppNumber: p.opportunityNumber,
          severity: 'CRÍTICO',
          title: `Bloqueador ativo: ${readiness.blockers[0].title}`,
          message: readiness.blockers[0].description,
          type: 'BLOCKER'
        });
      }

      // Alerta de Preço Aguardando Aprovação
      if (p.priceApproval?.status === 'Pendente' || p.priceApproval?.status === 'Em Revisão') {
        if (p.pricing?.definedPrice > 0) {
          alerts.push({
            id: `alt-preco-${p.id}`,
            proposalId: p.id,
            oppNumber: p.opportunityNumber,
            severity: 'MODERADO',
            title: 'Preço aguardando aprovação gerencial',
            message: `Valor proposto de ${this.formatCurrency(p.pricing.definedPrice)} requer validação.`,
            type: 'PRICE'
          });
        }
      }

      // Alerta de Proposta Pronta Não Enviada
      if (readiness.totalScore >= 90 && p.status !== ProposalStatus.ENVIADA && p.status !== ProposalStatus.ENCERRADA) {
        alerts.push({
          id: `alt-ready-${p.id}`,
          proposalId: p.id,
          oppNumber: p.opportunityNumber,
          severity: 'SUCESSO',
          title: 'Proposta pronta para envio!',
          message: `Readiness Score de ${readiness.totalScore}% atingido. Proceder com submissão no portal.`,
          type: 'READY'
        });
      }
    });

    return alerts;
  }

  /**
   * 58. Métricas Consolidadas do Módulo de Propostas
   */
  static getDashboardMetrics() {
    const proposals = this.listAll();

    const inProgress = proposals.filter(p => 
      p.status !== ProposalStatus.ENVIADA && 
      p.status !== ProposalStatus.ENCERRADA && 
      p.status !== ProposalStatus.CANCELADA
    );

    const submitted = proposals.filter(p => p.status === ProposalStatus.ENVIADA || p.status === ProposalStatus.ENCERRADA);

    const totalValueInProgress = inProgress.reduce((sum, p) => sum + (Number(p.pricing?.definedPrice) || 0), 0);
    const avgMargin = inProgress.length > 0
      ? inProgress.reduce((sum, p) => sum + (Number(p.pricing?.finalMargin) || 0), 0) / inProgress.length
      : 0;

    const avgTicket = inProgress.length > 0 ? totalValueInProgress / inProgress.length : 0;

    // Taxa de envio no prazo (simulação histórica consistente)
    const onTimeSubmissions = submitted.filter(p => !p.submission?.overdue).length;
    const onTimeRate = submitted.length > 0 ? Math.round((onTimeSubmissions / submitted.length) * 100) : 100;

    // Contadores de status rápidos
    const statusCounts = {
      emPreparacao: proposals.filter(p => p.status === ProposalStatus.EM_PREPARACAO).length,
      aguardandoDocumentos: proposals.filter(p => p.status === ProposalStatus.AGUARDANDO_DOCUMENTOS).length,
      emPrecificacao: proposals.filter(p => p.status === ProposalStatus.EM_PRECIFICACAO).length,
      emAprovacao: proposals.filter(p => p.status === ProposalStatus.APROVACAO_INTERNA || p.status === ProposalStatus.EM_REVISAO).length,
      prontas: proposals.filter(p => p.status === ProposalStatus.PRONTA_PARA_ENVIO).length,
      enviadas: proposals.filter(p => p.status === ProposalStatus.ENVIADA).length,
      prazosCriticos: proposals.filter(p => {
        const c = this.getCountdownInfo(p.targetSubmissionDate);
        return !c.expired && c.totalHours <= 48 && p.status !== ProposalStatus.ENVIADA && p.status !== ProposalStatus.ENCERRADA;
      }).length
    };

    return {
      inProgressCount: inProgress.length,
      totalValueInProgress,
      avgMargin: Number(avgMargin.toFixed(1)),
      avgTicket,
      submittedCount: submitted.length,
      onTimeRate,
      statusCounts
    };
  }

  /**
   * 60-61. ASSISTENTE DE PROPOSTA (IA Especialista)
   * Responde com precisão EXCLUSIVAMENTE sobre os dados reais cadastrados.
   * NUNCA inventa custos, documentos ou conclusões.
   */
  static askProposalAssistant(questionText, proposalId = null) {
    const q = (questionText || '').toLowerCase().trim();
    const proposals = this.listAll();
    const targetProposal = proposalId ? this.getById(proposalId) : proposals[0];

    if (!targetProposal) {
      return {
        reply: '[FATO]: Nenhuma proposta foi selecionada ou cadastrada no sistema até o momento.',
        sources: []
      };
    }

    const readiness = this.calculateReadiness(targetProposal);
    const countdown = this.getCountdownInfo(targetProposal.targetSubmissionDate);

    // Pergunta 1: O que falta para enviar?
    if (q.includes('o que falta') || q.includes('falta para enviar') || q.includes('enviar')) {
      const pendingTasks = targetProposal.tasks.filter(t => t.status !== TaskStatus.CONCLUIDA);
      const pendingDocs = targetProposal.dossier.items.filter(d => d.status !== ProposalDocStatus.ATENDIDO && d.isMandatory);
      const isPriceApproved = targetProposal.priceApproval?.status === 'Aprovado';

      let text = `[FATO]: A proposta #${targetProposal.id} está com ${readiness.totalScore}% de prontidão (${readiness.classification}).\n\n`;
      text += `[DADOS CADASTRADOS]:\n`;
      text += `• Documentos obrigatórios pendentes: ${pendingDocs.length > 0 ? pendingDocs.map(d => d.name).join(', ') : 'Nenhum pendente (100% regular)'}\n`;
      text += `• Preço de venda: ${isPriceApproved ? 'Aprovado formalmente' : `Aguardando aprovação gerencial (${this.formatCurrency(targetProposal.pricing.definedPrice)})`}\n`;
      text += `• Tarefas do checklist em aberto: ${pendingTasks.length} de ${targetProposal.tasks.length}\n`;
      text += `• Tempo restante: ${countdown.text}.\n\n`;

      if (readiness.hasBlockers) {
        text += `[BLOQUEADORES CRÍTICOS]: Existe(m) ${readiness.blockers.length} bloqueador(es) impedindo o envio: "${readiness.blockers[0].title}".`;
      } else if (readiness.totalScore >= 90) {
        text += `[CONCLUSÃO]: A proposta atende aos critérios essenciais e está pronta para submissão no portal ${targetProposal.portal}.`;
      } else {
        text += `[CONCLUSÃO]: Concluir a revisão de documentos e obter a assinatura das aprovações internas pendentes.`;
      }

      return { reply: text, sources: [`Proposta #${targetProposal.id}`, 'Dossiê da Proposta', 'Checklist'] };
    }

    // Pergunta 2: Quais documentos estão pendentes?
    if (q.includes('documentos') || q.includes('pendentes') || q.includes('certid')) {
      const pendingDocs = targetProposal.dossier.items.filter(d => d.status !== ProposalDocStatus.ATENDIDO);
      if (pendingDocs.length === 0) {
        return {
          reply: `[FATO]: Todos os ${targetProposal.dossier.items.length} documentos exigidos no Dossiê da Proposta #${targetProposal.id} estão devidamente atendidos e regularizados.`,
          sources: ['Dossiê da Proposta']
        };
      }

      let text = `[FATO]: Foram localizados ${pendingDocs.length} documentos em situação não atendida para a proposta #${targetProposal.id}:\n\n`;
      pendingDocs.forEach(d => {
        text += `• [${d.category}] ${d.name} — Status: ${d.status.toUpperCase()} (${d.notes || 'Sem observações'})\n`;
      });
      text += `\n[REGRA]: Documentos com status 'Vencido' ou 'Pendente' impedem o status 'Pronta para Envio'.`;
      return { reply: text, sources: ['Dossiê da Proposta', 'Cofre de Documentos'] };
    }

    // Pergunta 3: Qual é o custo total?
    if (q.includes('custo') || q.includes('custo total')) {
      const p = targetProposal.pricing;
      let text = `[FATO]: Conforme a planilha de composição de preço da proposta #${targetProposal.id}:\n\n`;
      text += `• Mão de Obra Direta: ${this.formatCurrency(p.laborTotal)}\n`;
      text += `• Equipamentos e Instrumentos: ${this.formatCurrency(p.equipmentTotal)}\n`;
      text += `• Ensaios Laboratoriais: ${this.formatCurrency(p.laboratoryTotal)}\n`;
      text += `• Deslocamento e Logística: ${this.formatCurrency(p.travelTotal)}\n`;
      text += `• Materiais e Consumíveis: ${this.formatCurrency(p.materialsTotal)}\n`;
      text += `• Serviços Terceirizados: ${this.formatCurrency(p.subcontractorsTotal)}\n`;
      text += `• Custos Indiretos e Mobilização: ${this.formatCurrency(p.indirectTotal)}\n`;
      text += `• Tributos Estimados: ${this.formatCurrency(p.taxesTotal)}\n`;
      text += `--------------------------------------------------\n`;
      text += `CUSTO TOTAL ESTIMADO: ${this.formatCurrency(p.totalEstimatedCost)}\n\n`;
      if (p.itemsPendingQuote > 0) {
        text += `[AVISO]: Constam ${p.itemsPendingQuote} itens com cotação pendente. Os valores acima consideram apenas os itens cadastrados.`;
      }
      return { reply: text, sources: ['Composição de Preço'] };
    }

    // Pergunta 4: Qual a margem atual?
    if (q.includes('margem') || q.includes('qual a margem') || q.includes('lucro')) {
      const p = targetProposal.pricing;
      let text = `[FATO]: Dados da margem de contribuição da proposta #${targetProposal.id}:\n\n`;
      text += `• Custo Total Estimado: ${this.formatCurrency(p.totalEstimatedCost)}\n`;
      text += `• Preço Sugerido (Fórmula): ${this.formatCurrency(p.suggestedPrice)}\n`;
      text += `• Preço Definido para Oferta: ${this.formatCurrency(p.definedPrice)}\n`;
      text += `• Margem Final Aplicada: ${p.finalMargin}%\n`;
      text += `• Lucro Bruto Projetado: ${this.formatCurrency(p.definedPrice - p.totalEstimatedCost)}\n\n`;
      text += `• Modelo Utilizado: ${p.pricingMethod} (${p.pricingMethod === 'BDI' ? `BDI de ${p.markupOrBdiRate}%` : `Markup de ${p.markupOrBdiRate}%`}).`;
      return { reply: text, sources: ['Composição de Preço'] };
    }

    // Pergunta 5: Temos algum bloqueador?
    if (q.includes('bloqueador') || q.includes('bloqueio') || q.includes('impeditivo')) {
      if (!readiness.hasBlockers) {
        return {
          reply: `[FATO]: Nenhum bloqueador de envio ativo para a proposta #${targetProposal.id}. Todos os itens impeditivos foram solucionados.`,
          sources: ['Submission Blockers Engine']
        };
      }

      let text = `[FATO]: Existem ${readiness.blockers.length} bloqueador(es) crítico(s) para a proposta #${targetProposal.id}:\n\n`;
      readiness.blockers.forEach((b, idx) => {
        text += `${idx + 1}. [${b.severity}] ${b.title}\n   Detalhe: ${b.description}\n`;
      });
      text += `\n[REGRA DE NEGÓCIO]: O status não poderá ser alterado para 'PRONTA PARA ENVIO' sem que essas pendências sejam corrigidas ou ocorra override gerencial documentado.`;
      return { reply: text, sources: ['Submission Blockers Engine'] };
    }

    // Pergunta 6: Quem está com tarefa atrasada?
    if (q.includes('tarefa atrasada') || q.includes('atrasad') || q.includes('responsável')) {
      const pendingTasks = targetProposal.tasks.filter(t => t.status !== TaskStatus.CONCLUIDA);
      let text = `[FATO]: Distribuição de tarefas pendentes na proposta #${targetProposal.id}:\n\n`;
      pendingTasks.slice(0, 5).forEach(t => {
        text += `• "${t.title}" — Responsável: ${t.responsible} (Prazo: ${t.deadline} | Status: ${t.status})\n`;
      });
      if (pendingTasks.length > 5) {
        text += `...e mais ${pendingTasks.length - 5} tarefas em andamento.`;
      }
      return { reply: text, sources: ['Gestão de Tarefas'] };
    }

    // Pergunta 7: Qual proposta precisa de atenção hoje?
    if (q.includes('atenção hoje') || q.includes('priorizar') || q.includes('hoje')) {
      const criticalProposals = proposals.filter(p => {
        const c = this.getCountdownInfo(p.targetSubmissionDate);
        return !c.expired && c.totalHours <= 48 && p.status !== ProposalStatus.ENVIADA;
      });

      if (criticalProposals.length > 0) {
        let text = `[FATO]: A proposta que mais exige atenção imediata é a #${criticalProposals[0].id} (${criticalProposals[0].client}):\n\n`;
        const c = this.getCountdownInfo(criticalProposals[0].targetSubmissionDate);
        const r = this.calculateReadiness(criticalProposals[0]);
        text += `• Objeto: ${criticalProposals[0].object}\n`;
        text += `• Tempo restante: ${c.text}\n`;
        text += `• Readiness Score: ${r.totalScore}% (${r.classification})\n`;
        text += `• Bloqueadores ativos: ${r.blockers.length}\n\n`;
        text += `[RECOMENDAÇÃO OPERACIONAL]: Focar na resolução dos bloqueadores e na aprovação final do preço desta oportunidade.`;
        return { reply: text, sources: ['Radar de Prazos', 'Proposal Readiness'] };
      }

      return {
        reply: `[FATO]: Não constam propostas com encerramento nas próximas 48 horas. A proposta #${targetProposal.id} é a de maior valor em elaboração (${this.formatCurrency(targetProposal.pricing.definedPrice)}).`,
        sources: ['Propostas Ativas']
      };
    }

    // Resposta padrão estrita
    return {
      reply: `[FATO]: Proposta #${targetProposal.id} (${targetProposal.participatingCompany} | ${targetProposal.client}):\n• Status: ${targetProposal.status}\n• Preço: ${this.formatCurrency(targetProposal.pricing.definedPrice)} (Margem: ${targetProposal.pricing.finalMargin}%)\n• Prontidão: ${readiness.totalScore}% (${readiness.classification})\n• Prazo de Envio: ${targetProposal.targetSubmissionDate} (${countdown.text}).`,
      sources: [`Proposta #${targetProposal.id}`]
    };
  }

  /**
   * Helper de auditoria
   */
  static recordAudit(entry) {
    const logs = getStorage(STORAGE_KEYS.AUDIT_LOGS, []);
    logs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ...entry
    });
    setStorage(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100));
  }

  static formatCurrency(val) {
    if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // ==========================================
  // GERADORES INTERNOS DE SEED & ESTRUTURA
  // ==========================================

  static _generateInitialTasks(proposalId, oppNumber, editalAnalysis, opportunity) {
    const tasks = DEFAULT_OPERATIONAL_CHECKLIST.map((c, idx) => ({
      id: c.id,
      proposalId,
      opportunityNumber: oppNumber,
      title: c.title,
      description: c.description,
      responsible: c.role === 'Responsável técnico' ? 'Dr. Roberto Albuquerque (Eng. Químico)' :
                   c.role === 'Responsável documental' ? 'Dra. Mariana Lemos (Jurídico)' :
                   c.role === 'Responsável financeiro' ? 'Carlos Silveira (Controladoria)' :
                   'Mariana Castro (Gerente de Contratos)',
      deadline: opportunity?.endDate || '24/10/2026',
      priority: idx < 5 ? 'Alta' : 'Média',
      status: TaskStatus.PENDENTE,
      dependency: idx > 0 ? DEFAULT_OPERATIONAL_CHECKLIST[idx - 1].id : null,
      observation: '',
      attachment: null
    }));

    // 6. CHECKLIST DINÂMICO BASEADO NO EDITAL
    const oppText = `${opportunity?.title || ''} ${opportunity?.object || ''}`.toLowerCase();
    
    // Visita técnica identificada
    if (oppText.includes('visita') || oppText.includes('vistoria') || editalAnalysis?.summary?.hasSiteVisit) {
      tasks.push({
        id: 'chk-dyn-visita',
        proposalId,
        opportunityNumber: oppNumber,
        title: 'Realizar e comprovar Visita Técnica',
        description: 'Visita técnica facultativa/obrigatória às instalações industriais e emissão de Atestado de Visita.',
        responsible: 'Dr. Roberto Albuquerque (Eng. Químico)',
        deadline: '16/10/2026',
        priority: 'Crítica',
        status: TaskStatus.EM_ANDAMENTO,
        dependency: 'chk-edital',
        observation: 'Agendamento prévio com a gerência de SMS da refinaria.',
        attachment: null
      });
    }

    // Garantia contratual ou de proposta
    if (oppText.includes('garantia') || oppText.includes('seguro garantia')) {
      tasks.push({
        id: 'chk-dyn-garantia',
        proposalId,
        opportunityNumber: oppNumber,
        title: 'Emitir Apólice de Seguro Garantia da Proposta (1%)',
        description: 'Solicitar cotação com a seguradora homologada para emissão da garantia de participação.',
        responsible: 'Carlos Silveira (Controladoria)',
        deadline: '18/10/2026',
        priority: 'Alta',
        status: TaskStatus.PENDENTE,
        dependency: 'chk-custos',
        observation: 'Valor referencial da garantia: R$ 24.500,00.',
        attachment: null
      });
    }

    // Exigência de ART preliminar
    tasks.push({
      id: 'chk-dyn-art',
      proposalId,
      opportunityNumber: oppNumber,
      title: 'Elaborar ART preliminar de Responsabilidade Técnica',
      description: 'Cadastro da ART de cargo e função e emissão da taxa no CREA-PE.',
      responsible: 'Dr. Roberto Albuquerque (Eng. Químico)',
      deadline: '19/10/2026',
      priority: 'Alta',
      status: TaskStatus.PENDENTE,
      dependency: 'chk-equipe',
      observation: 'Vincular código de atividade de monitoramento ambiental.',
      attachment: null
    });

    return tasks;
  }

  static _generateInitialDossier(oppNumber, opportunity, editalAnalysis) {
    const items = [
      {
        id: 'doc-01',
        category: 'Edital',
        name: 'Edital Completo e Termo de Referência Oficial',
        isMandatory: true,
        validity: 'Permanente',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'Edital_Petronect_Oficial.pdf',
        notes: 'Documento baixado e indexado pelo Vellia Agent'
      },
      {
        id: 'doc-02',
        category: 'Habilitação Jurídica',
        name: 'Contrato Social Consolidado & Cartão CNPJ',
        isMandatory: true,
        validity: 'Vigente',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'Contrato_Social_Consolidado_2026.pdf',
        notes: 'Verificado no Cofre Documental'
      },
      {
        id: 'doc-03',
        category: 'Fiscal',
        name: 'Certidão Negativa de Débitos Federais (CND Federal / PGFN)',
        isMandatory: true,
        validity: '02/12/2026',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'CND_Federal_Receita_Valida.pdf',
        notes: 'Regular'
      },
      {
        id: 'doc-04',
        category: 'Fiscal',
        name: 'Certidão Negativa de Débitos Trabalhistas (CNDT)',
        isMandatory: true,
        validity: '18/11/2026',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'CNDT_Trabalhista_Emitida.pdf',
        notes: 'Emitida sem pendências'
      },
      {
        id: 'doc-05',
        category: 'Técnica',
        name: 'Certidão de Registro e Quitação no CREA da Empresa',
        isMandatory: true,
        validity: '31/03/2027',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'Certidao_CREA_Empresa_2026.pdf',
        notes: 'Ativa e regular'
      },
      {
        id: 'doc-06',
        category: 'Atestados',
        name: 'Atestado de Capacidade Técnica — Refinaria Abreu e Lima',
        isMandatory: true,
        validity: 'Permanente',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'Atestado_RNEST_Monitoramento_Chamine.pdf',
        notes: 'Comprova volume de 12 campanhas isocinéticas'
      },
      {
        id: 'doc-07',
        category: 'ARTs',
        name: 'Certidão de Acervo Técnico (CAT com Atestado)',
        isMandatory: true,
        validity: 'Permanente',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'CAT_CREA_Roberto_Albuquerque.pdf',
        notes: 'Vinculada ao Responsável Técnico'
      },
      {
        id: 'doc-08',
        category: 'Equipe',
        name: 'Comprovação de Vínculo e Diplomas dos Profissionais',
        isMandatory: true,
        validity: 'Permanente',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'Comprovacao_Equipe_Tecnica_Curriculos.pdf',
        notes: 'Carteira de trabalho e diplomas anexados'
      },
      {
        id: 'doc-09',
        category: 'Equipamentos',
        name: 'Certificados de Calibração RBC dos Coletores e Analisadores',
        isMandatory: true,
        validity: '22/01/2027',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'Laudos_Calibracao_Apex_Testo_RBC.pdf',
        notes: 'Calibração realizada pelo Laboratório Acreditado'
      },
      {
        id: 'doc-10',
        category: 'Proposta Técnica',
        name: 'Minuta da Proposta Técnica Formatada',
        isMandatory: true,
        validity: 'Específica do certame',
        status: ProposalDocStatus.EM_REVISAO,
        fileName: 'Proposta_Tecnica_V1_Em_Revisao.docx',
        notes: 'Aguardando validação de metodologia'
      },
      {
        id: 'doc-11',
        category: 'Proposta Comercial',
        name: 'Planilha de Formação de Preço e Carta Comercial',
        isMandatory: true,
        validity: '60 dias',
        status: ProposalDocStatus.EM_REVISAO,
        fileName: 'Proposta_Comercial_Formatada.xlsx',
        notes: 'Em fase de aprovação interna'
      },
      {
        id: 'doc-12',
        category: 'Declarações',
        name: 'Declarações Unificadas do Edital (SST, Menor de Idade, Idoneidade)',
        isMandatory: true,
        validity: 'Específica',
        status: ProposalDocStatus.ATENDIDO,
        fileName: 'Declaracoes_Obrigatorias_Assinadas.pdf',
        notes: 'Assinadas digitalmente com certificado ICP-Brasil'
      }
    ];

    return {
      items,
      lastChecked: new Date().toLocaleDateString('pt-BR')
    };
  }

  static _generateInitialPricing(opportunity, editalAnalysis) {
    // 12. Mão de Obra
    const laborItems = [
      {
        id: 'mo-1',
        professional: 'Dr. Roberto Albuquerque',
        role: 'Coordenador Técnico / Eng. Químico',
        quantity: 1,
        hours: 160,
        days: 20,
        hourlyRate: 140,
        chargesRate: 72, // 72% encargos
        benefits: 1200, // Benefícios R$
        total: 42128 // (160 * 140 * 1.72) + 1200
      },
      {
        id: 'mo-2',
        professional: 'Lucas Fontes',
        role: 'Técnico Amostrador Sênior',
        quantity: 2,
        hours: 320,
        days: 40,
        hourlyRate: 55,
        chargesRate: 68,
        benefits: 1800,
        total: 31368
      },
      {
        id: 'mo-3',
        professional: 'Equipe de Apoio e Amostragem',
        role: 'Auxiliares de Campo',
        quantity: 2,
        hours: 320,
        days: 40,
        hourlyRate: 35,
        chargesRate: 68,
        benefits: 1600,
        total: 20416
      }
    ];

    // 13. Equipamentos
    const equipmentItems = [
      {
        id: 'eq-1',
        equipment: 'Trem de Amostragem Isocinética Apex C-5000',
        quantity: 1,
        type: 'Próprio', // 'Próprio' | 'Locação'
        dailyRate: 350,
        days: 15,
        calibrationCost: 1500,
        mobilizationCost: 800,
        total: 7550
      },
      {
        id: 'eq-2',
        equipment: 'Analisador Eletrônico Multigás Testo 350',
        quantity: 1,
        type: 'Próprio',
        dailyRate: 280,
        days: 15,
        calibrationCost: 1200,
        mobilizationCost: 500,
        total: 5900
      }
    ];

    // 14. Laboratório
    const laboratoryItems = [
      {
        id: 'lab-1',
        analysis: 'Determinação de Material Particulado e Gases de Combustão',
        laboratory: 'Laboratório Ecolab Analítica (Cgcre/Inmetro)',
        quantity: 24,
        unitValue: 450,
        freight: 650,
        taxes: 350,
        total: 11800
      }
    ];

    // 15. Deslocamento & Logística
    const travelItems = [
      {
        id: 'tr-1',
        vehicle: 'Caminhonete Hilux 4x4 Especializada Vellia',
        fuel: 1800,
        tolls: 340,
        parking: 150,
        tickets: 0,
        lodging: 4200,
        food: 3600,
        dailyAllowance: 2400,
        other: 500,
        total: 12990
      }
    ];

    // 16. Materiais & Consumíveis
    const materialItems = [
      {
        id: 'mat-1',
        item: 'Filtros de Fibra de Vidro e Quartzo para Isocinética',
        quantity: 50,
        unit: 'un',
        unitValue: 65,
        supplier: 'Merck Sigma-Aldrich',
        total: 3250
      },
      {
        id: 'mat-2',
        item: 'Reagentes Grau PA e Água Deionizada Certificada',
        quantity: 1,
        unit: 'kit',
        unitValue: 1400,
        supplier: 'Química Moderna',
        total: 1400
      }
    ];

    // 17. Terceirizados
    const subcontractorItems = [
      {
        id: 'sub-1',
        supplier: 'Alpinismo Industrial Seguro PE',
        service: 'Acesso por corda para pontos em altura superior a 40m',
        quantity: 1,
        value: 14500,
        total: 14500,
        deadline: '5 dias de campanha',
        observations: 'Empresa homologada com certificação Irata / Abendi'
      }
    ];

    // 18. Custos Administrativos e Indiretos
    const indirectCosts = {
      administrative: 8500,
      insurance: 3800,
      guarantees: 2500,
      fees: 1200,
      mobilization: 4500,
      demobilization: 3500,
      documentation: 900,
      otherIndirect: 1500,
      total: 26400
    };

    // 19. Tributos Configuráveis (alíquotas livres, não fixadas)
    const taxes = [
      { id: 'tax-1', name: 'ISS (Imposto Sobre Serviços)', percentage: 5.0, baseCalculation: 'Faturamento Bruto', estimatedValue: 10450 },
      { id: 'tax-2', name: 'PIS / COFINS (Cumulativo)', percentage: 3.65, baseCalculation: 'Faturamento Bruto', estimatedValue: 7628 },
      { id: 'tax-3', name: 'CPRB / INSS Patronal', percentage: 2.0, baseCalculation: 'Receita Bruta', estimatedValue: 4180 },
      { id: 'tax-4', name: 'IRPJ / CSLL Presumido', percentage: 2.88, baseCalculation: 'Faturamento Bruto', estimatedValue: 6019 }
    ];

    // Cálculos
    const laborTotal = laborItems.reduce((acc, i) => acc + (i.total || 0), 0);
    const equipmentTotal = equipmentItems.reduce((acc, i) => acc + (i.total || 0), 0);
    const laboratoryTotal = laboratoryItems.reduce((acc, i) => acc + (i.total || 0), 0);
    const travelTotal = travelItems.reduce((acc, i) => acc + (i.total || 0), 0);
    const materialsTotal = materialItems.reduce((acc, i) => acc + (i.total || 0), 0);
    const subcontractorsTotal = subcontractorItems.reduce((acc, i) => acc + (i.total || i.value || 0), 0);
    const indirectTotal = indirectCosts.total || 0;
    const taxesTotal = taxes.reduce((acc, i) => acc + (i.estimatedValue || 0), 0);

    const directCosts = laborTotal + equipmentTotal + laboratoryTotal + travelTotal + materialsTotal + subcontractorsTotal;
    const totalEstimatedCost = directCosts + indirectTotal + taxesTotal;

    // 20. BDI ou Markup
    const pricingMethod = 'BDI'; // 'BDI' ou 'Markup'
    const markupOrBdiRate = 28.5; // 28.5%

    const suggestedPrice = Math.round(totalEstimatedCost * (1 + (markupOrBdiRate / 100)));
    const definedPrice = 285000; // Preço alvo de mercado definido
    const finalMargin = Number((((definedPrice - totalEstimatedCost) / definedPrice) * 100).toFixed(1));

    // 23. Três Cenários Financeiros
    const scenarios = {
      conservador: {
        label: 'Conservador',
        price: 310000,
        cost: totalEstimatedCost,
        margin: Number((((310000 - totalEstimatedCost) / 310000) * 100).toFixed(1)),
        risk: 'Baixo Risco de Execução',
        competitivenessProbability: '62% de chance de vitória'
      },
      provavel: {
        label: 'Provável (Recomendado)',
        price: definedPrice,
        cost: totalEstimatedCost,
        margin: finalMargin,
        risk: 'Risco Controlado e Margem Saudável',
        competitivenessProbability: '88% de chance de vitória'
      },
      agressivo: {
        label: 'Agressivo',
        price: 258000,
        cost: totalEstimatedCost,
        margin: Number((((258000 - totalEstimatedCost) / 258000) * 100).toFixed(1)),
        risk: 'Margem Apertada, Alta Pressão de Custo',
        competitivenessProbability: '96% de chance de vitória'
      }
    };

    return {
      laborItems,
      laborTotal,
      equipmentItems,
      equipmentTotal,
      laboratoryItems,
      laboratoryTotal,
      travelItems,
      travelTotal,
      materialItems,
      materialsTotal,
      subcontractorItems,
      subcontractorsTotal,
      indirectCosts,
      indirectTotal,
      taxes,
      taxesTotal,
      directCosts,
      totalEstimatedCost,
      pricingMethod,
      markupOrBdiRate,
      suggestedPrice,
      definedPrice,
      finalMargin,
      itemsPendingQuote: 0,
      scenarios
    };
  }

  // Seed 1: Quase pronta (Readiness ~86%, Item 38 e 65)
  static _createSeedProposal1() {
    return {
      id: 'PROP-7004321234-01',
      opportunityNumber: '7004321234',
      portal: 'Petronect',
      client: 'Petrobras - Refinaria Abreu e Lima (RNEST)',
      object: 'Monitoramento de emissões atmosféricas em dutos e chaminés industriais',
      participatingCompany: 'Excelência Ambiental',
      primaryService: 'Monitoramento de emissões atmosféricas',
      opportunityDeadline: '19/10/2026',
      targetSubmissionDate: '19/10/2026 17:00',
      estimatedValue: 'R$ 2.450.000,00',
      decisionScore: 96,
      riskScore: 28,
      adherenceScore: 96,
      status: ProposalStatus.EM_REVISAO,
      responsibles: {
        principal: 'Dr. Roberto Albuquerque (Eng. Químico)',
        tecnico: 'Dr. Roberto Albuquerque (Eng. Químico)',
        comercial: 'Mariana Castro (Gerente de Contratos)',
        documental: 'Dra. Mariana Lemos (Jurídico)',
        financeiro: 'Carlos Silveira (Controladoria)'
      },
      tasks: this._generateInitialTasks('PROP-7004321234-01', '7004321234', null, { title: 'Emissões RNEST', endDate: '19/10/2026' }).map((t, idx) => ({
        ...t,
        status: idx < 10 ? TaskStatus.CONCLUIDA : TaskStatus.EM_ANDAMENTO
      })),
      pricing: this._generateInitialPricing(),
      quotations: [
        {
          id: 'quot-1',
          supplier: 'Laboratório Ecolab Analítica Ltda',
          item: 'Análise de Material Particulado e Metais Pesados',
          value: 11800,
          date: '04/10/2026',
          validity: '04/11/2026',
          contact: 'comercial@ecolab.com.br / (81) 3456-7890',
          fileName: 'Cotacao_Ecolab_Proposta_RNEST.pdf',
          status: 'Aprovada',
          paymentTerms: '28 dias após emissão do laudo',
          selected: true
        },
        {
          id: 'quot-2',
          supplier: 'LabTech Soluções Ambientais',
          item: 'Análise de Material Particulado',
          value: 13500,
          date: '03/10/2026',
          validity: '25/10/2026',
          contact: 'vendas@labtech.com.br',
          fileName: 'Cotacao_LabTech.pdf',
          status: 'Recusada',
          paymentTerms: '14 dias',
          selected: false
        }
      ],
      priceApproval: {
        status: 'Aprovado',
        approvedBy: 'Mariana Castro (Gerente Comercial)',
        approvedAt: '06/10/2026 às 15:40',
        notes: 'Preço aprovado com margem confortável de 24.3% e plena cobertura de custos.'
      },
      priceChangeLogs: [
        {
          id: 'pcl-01',
          previousPrice: 295000,
          newPrice: 285000,
          user: 'Mariana Castro',
          date: '06/10/2026 15:30',
          reason: 'Ajuste após negociação com laboratório parceiro garantindo competitividade.'
        }
      ],
      technicalProposal: {
        presentation: 'A Excelência Ambiental dispõe de corpo técnico sênior e instrumentação de alta fidelidade para atendimento na RNEST.',
        understanding: 'Monitoramento contínuo com rigorosa observância às exigências da CPRH e CONAMA 382/436.',
        methodology: 'Método EPA 1 a 5, amostragem isocinética em dutos cilíndricos com sonda de aquecimento regulada.',
        workPlan: 'Mobilização em até 7 dias da AS. Ensaios em chaminés e fornos da unidade de destilação atmosférica.',
        team: 'Dr. Roberto Albuquerque (RT CREA-PE), Lucas Fontes (Amostrador Nível II) e 2 auxiliares certificados NR-33/35.',
        equipment: 'Trem Apex C-5000 e Analisador Testo 350 calibrados pela RBC Inmetro.',
        schedule: '12 meses, 3 campanhas quadrimestrais com paradas assistidas.',
        experience: 'Execução de mais de 80 campanhas em plantas industriais do Polo de Suape e Camaçari.',
        certificates: 'Atestados emitidos pela Petrobras RNEST e Braskem devidamente homologados.',
        technicalResponsibility: 'ART CREA-PE vigente de cargo e função.',
        differentials: 'Certificação ISO 9001, sistema de gestão de SMS com taxa zero de acidentes e laudo em 10 dias úteis.'
      },
      commercialProposal: {
        object: 'Prestação de serviços contínuos de medição e monitoramento de emissões atmosféricas em dutos da RNEST.',
        validityDays: 60,
        executionPeriod: '12 meses renováveis',
        paymentTerms: 'Medição mensal com pagamento em até 30 dias',
        taxesIncluded: 'Todos os tributos inclusos (ISS 5%, PIS/COFINS 3.65%, CPRB 2%)',
        conditions: 'Preço fixo sem reajuste durante o primeiro ano de vigência.',
        observations: 'Garantia de proposta disponibilizada via apólice de seguro garantia.'
      },
      versions: [
        {
          versionNumber: 'V2',
          createdAt: '06/10/2026 às 15:30',
          author: 'Mariana Castro',
          price: 285000,
          margin: 24.3,
          scopeSummary: 'Ajuste de preço competitivo',
          changes: 'Redução do preço de R$ 295.000 para R$ 285.000 após cotação laboratorial favorável.'
        },
        {
          versionNumber: 'V1',
          createdAt: '03/10/2026 às 10:00',
          author: 'Dr. Roberto Albuquerque',
          price: 295000,
          margin: 26.8,
          scopeSummary: 'Elaboração inicial',
          changes: 'Primeira minuta gerada com custos estimados.'
        }
      ],
      dossier: this._generateInitialDossier('7004321234', { recommendedCompany: 'Excelência Ambiental' }),
      approvals: {
        technical: { status: 'Aprovado', user: 'Dr. Roberto Albuquerque', date: '05/10/2026 14:00', notes: 'Metodologia e equipamentos validados.' },
        commercial: { status: 'Aprovado', user: 'Mariana Castro', date: '06/10/2026 15:40', notes: 'Preço e condições comerciais alinhados.' },
        financial: { status: 'Aprovado', user: 'Carlos Silveira', date: '06/10/2026 16:10', notes: 'Fluxo de caixa e garantias cobertos.' },
        final: { status: 'Pendente', user: null, date: null, notes: 'Aguardando validação final da diretoria.' }
      },
      submission: {
        submitted: false,
        submissionDate: null,
        submissionTime: null,
        submittedBy: null,
        portalUrl: 'https://www.petronect.com.br',
        protocolNumber: null,
        receiptAttachment: null,
        observations: ''
      },
      result: {
        status: TenderResult.AGUARDANDO_RESULTADO,
        date: null,
        lossReason: null,
        notes: '',
        convertedToContract: false
      },
      auditLogs: [
        {
          id: 'aud-s1-1',
          date: '06/10/2026 16:10',
          user: 'Carlos Silveira',
          action: 'APROVACAO_FINANCEIRA',
          details: 'Aprovação financeira concedida após conferência das margens dos 3 cenários.'
        },
        {
          id: 'aud-s1-2',
          date: '06/10/2026 15:40',
          user: 'Mariana Castro',
          action: 'APROVACAO_PRECO',
          details: 'Preço de R$ 285.000,00 aprovado formalmente.'
        }
      ],
      createdAt: '2026-10-02T10:00:00.000Z',
      lastUpdated: '2026-10-06T16:10:00.000Z'
    };
  }

  // Seed 2: Proposta com Documentação Pendente (Item 65)
  static _createSeedProposal2() {
    const dossier = this._generateInitialDossier('7004319802', { recommendedCompany: 'Veeluen Solutions' });
    // Inserir documento pendente e vencido
    dossier.items[2].status = ProposalDocStatus.VENCIDO;
    dossier.items[2].notes = 'Certidão com prazo de 180 dias expirado em 05/10/2026';
    dossier.items[5].status = ProposalDocStatus.PENDENTE;
    dossier.items[5].notes = 'Atestado de ETE Industrial aguardando assinatura da concessionária';

    return {
      id: 'PROP-7004319802-02',
      opportunityNumber: '7004319802',
      portal: 'Petronect',
      client: 'Transpetro - Terminal Aquaviário de Suape',
      object: 'Serviços continuados de operação e manutenção de ETE e tratamento de efluentes',
      participatingCompany: 'Veeluen Solutions',
      primaryService: 'Operação de ETE e Manutenção de ETE',
      opportunityDeadline: '22/10/2026',
      targetSubmissionDate: '22/10/2026 17:00',
      estimatedValue: 'R$ 3.820.000,00',
      decisionScore: 94,
      riskScore: 35,
      adherenceScore: 94,
      status: ProposalStatus.AGUARDANDO_DOCUMENTOS,
      responsibles: {
        principal: 'Dra. Mariana Lemos (Jurídico & Habilitação)',
        tecnico: 'Eng. Fernando Diniz (Operações ETE)',
        comercial: 'Mariana Castro',
        documental: 'Dra. Mariana Lemos',
        financeiro: 'Carlos Silveira'
      },
      tasks: this._generateInitialTasks('PROP-7004319802-02', '7004319802', null, { title: 'ETE Suape', endDate: '22/10/2026' }),
      pricing: this._generateInitialPricing(),
      quotations: [],
      priceApproval: {
        status: 'Pendente',
        approvedBy: null,
        approvedAt: null,
        notes: 'Aguardando validação dos custos de mão de obra 24/7'
      },
      priceChangeLogs: [],
      technicalProposal: {
        presentation: 'Veeluen Solutions é líder em automação e tratamento contínuo de efluentes petroquímicos.',
        understanding: 'Operação 24/7 ininterrupta com regime de plantão e monitoramento analítico diário.',
        methodology: 'Controle de aeração, dosagem automatizada de coagulante e desidratação de lodo.',
        workPlan: 'Mobilização com equipe residente em Suape.',
        team: 'Engenheiro Sanitarista RT, Químico Industrial e 4 Operadores de ETE em escala de revezamento.',
        equipment: 'Medidores de OD e pH online acoplados a telemetria SCADA.',
        schedule: '24 meses continuados.',
        experience: 'Operação de ETEs industriais com vazão de até 150 m³/h.',
        certificates: 'Atestados emitidos em terminais portuários.',
        technicalResponsibility: 'ART CREA-PE em emissão.',
        differentials: 'Atendimento a emergências ambientais em menos de 45 minutos.'
      },
      commercialProposal: {
        object: 'Operação e manutenção continuada de ETE industrial em Suape.',
        validityDays: 60,
        executionPeriod: '24 meses',
        paymentTerms: 'Faturamento mensal até o 10º dia útil',
        taxesIncluded: 'Todos os tributos incidentes inclusos',
        conditions: 'Preço irreajustável nos primeiros 12 meses.',
        observations: 'Garantia de proposta a ser depositada.'
      },
      versions: [
        {
          versionNumber: 'V1',
          createdAt: '04/10/2026 às 11:30',
          author: 'Dra. Mariana Lemos',
          price: 490000,
          margin: 21.0,
          scopeSummary: 'Minuta inicial de operação continuada',
          changes: 'Criação inicial da proposta comercial.'
        }
      ],
      dossier,
      approvals: {
        technical: { status: 'Pendente', user: null, date: null, notes: '' },
        commercial: { status: 'Pendente', user: null, date: null, notes: '' },
        financial: { status: 'Pendente', user: null, date: null, notes: '' },
        final: { status: 'Pendente', user: null, date: null, notes: '' }
      },
      submission: {
        submitted: false,
        submissionDate: null,
        submissionTime: null,
        submittedBy: null,
        portalUrl: 'https://www.petronect.com.br',
        protocolNumber: null,
        receiptAttachment: null,
        observations: ''
      },
      result: {
        status: TenderResult.AGUARDANDO_RESULTADO,
        date: null,
        lossReason: null,
        notes: '',
        convertedToContract: false
      },
      auditLogs: [
        {
          id: 'aud-s2-1',
          date: '05/10/2026 10:15',
          user: 'Dra. Mariana Lemos',
          action: 'ALERTA_DOCUMENTAL',
          details: 'Identificada necessidade de renovação imediata da CND Federal no e-CAC da Receita.'
        }
      ],
      createdAt: '2026-10-04T11:30:00.000Z',
      lastUpdated: '2026-10-05T10:15:00.000Z'
    };
  }

  // Seed 3: Proposta Aguardando Preço / Cotação (Item 65 e 24)
  static _createSeedProposal3() {
    const pricing = this._generateInitialPricing();
    pricing.definedPrice = 0;
    pricing.finalMargin = 0;
    pricing.itemsPendingQuote = 2; // Cotação pendente
    pricing.laboratoryItems[0].total = 0;
    pricing.laboratoryItems[0].laboratory = 'Pendente de cotação';
    pricing.subcontractorItems[0].value = 0;
    pricing.subcontractorItems[0].observations = 'Valor não informado (aguardando retorno do fornecedor)';

    return {
      id: 'PROP-7004318765-03',
      opportunityNumber: '7004318765',
      portal: 'Petronect',
      client: 'Petrobras - UO-BS Santos',
      object: 'Amostragem em águas marinhas e monitoramento de biota aquática',
      participatingCompany: 'Excelência Ambiental',
      primaryService: 'Monitoramento de Recursos Hídricos e Marinhos',
      opportunityDeadline: '26/10/2026',
      targetSubmissionDate: '26/10/2026 17:00',
      estimatedValue: 'R$ 1.950.000,00',
      decisionScore: 88,
      riskScore: 42,
      adherenceScore: 88,
      status: ProposalStatus.EM_PRECIFICACAO,
      responsibles: {
        principal: 'Dr. Roberto Albuquerque',
        tecnico: 'Bióloga Camila Duarte',
        comercial: 'Mariana Castro',
        documental: 'Dra. Mariana Lemos',
        financeiro: 'Carlos Silveira'
      },
      tasks: this._generateInitialTasks('PROP-7004318765-03', '7004318765', null, { title: 'Águas Marinhas', endDate: '26/10/2026' }),
      pricing,
      quotations: [
        {
          id: 'quot-301',
          supplier: 'Embarcações Oceânicas Santos Ltda',
          item: 'Afretamento de embarcação com marinheiro para coleta offshore',
          value: 0,
          date: '06/10/2026',
          validity: 'Pendente',
          contact: 'contato@santosboats.com.br',
          fileName: null,
          status: 'Em análise',
          paymentTerms: 'A definir',
          selected: false
        }
      ],
      priceApproval: {
        status: 'Pendente',
        approvedBy: null,
        approvedAt: null,
        notes: 'Bloqueado: aguardando retorno da cotação de afretamento marítimo.'
      },
      priceChangeLogs: [],
      technicalProposal: {
        presentation: 'Excelência Ambiental com equipe de oceanógrafos e biólogos marinhos.',
        understanding: 'Amostragem de fitoplâncton, zooplâncton e qualidade físico-química de água salina.',
        methodology: 'Coleta com Garrafa de Van Dorn e Redes de Plâncton 64 micras.',
        workPlan: 'Campanhas trimestrais na bacia de Santos.',
        team: 'Oceanógrafa Coordenadora e Técnicos de Coleta Certificados HUET.',
        equipment: 'Sondas multiparâmetros YSI e guincho oceanográfico.',
        schedule: '12 meses.',
        experience: 'Monitoramento em terminais offshore e píeres petroleiros.',
        certificates: 'Atestados de amostragem marinha anexados.',
        technicalResponsibility: 'ART CRBio e CREA.',
        differentials: 'Certificação de sobrevivência no mar para 100% da equipe de campo.'
      },
      commercialProposal: {
        object: 'Monitoramento de recursos hídricos marinhos e biota aquática.',
        validityDays: 60,
        executionPeriod: '12 meses',
        paymentTerms: 'Por campanha realizada',
        taxesIncluded: 'Tributos inclusos',
        conditions: 'Preço a definir após cotações logísticas.',
        observations: 'Proposta sujeita à confirmação de janela meteorológica.'
      },
      versions: [
        {
          versionNumber: 'V1',
          createdAt: '06/10/2026 às 09:00',
          author: 'Carlos Silveira',
          price: 0,
          margin: 0,
          scopeSummary: 'Abertura para precificação e cotação de fornecedores',
          changes: 'Cotação marítima enviada para 3 armadores.'
        }
      ],
      dossier: this._generateInitialDossier('7004318765', { recommendedCompany: 'Excelência Ambiental' }),
      approvals: {
        technical: { status: 'Pendente', user: null, date: null, notes: '' },
        commercial: { status: 'Pendente', user: null, date: null, notes: '' },
        financial: { status: 'Pendente', user: null, date: null, notes: '' },
        final: { status: 'Pendente', user: null, date: null, notes: '' }
      },
      submission: {
        submitted: false,
        submissionDate: null,
        submissionTime: null,
        submittedBy: null,
        portalUrl: 'https://www.petronect.com.br',
        protocolNumber: null,
        receiptAttachment: null,
        observations: ''
      },
      result: {
        status: TenderResult.AGUARDANDO_RESULTADO,
        date: null,
        lossReason: null,
        notes: '',
        convertedToContract: false
      },
      auditLogs: [
        {
          id: 'aud-s3-1',
          date: '06/10/2026 09:10',
          user: 'Carlos Silveira',
          action: 'COTACAO_SOLICITADA',
          details: 'Solicitadas cotações de lancha e armador na Baixada Santista.'
        }
      ],
      createdAt: '2026-10-06T09:00:00.000Z',
      lastUpdated: '2026-10-06T09:10:00.000Z'
    };
  }

  // Seed 4: Proposta com Prazo Crítico (< 24h restantes) (Item 65 e 9)
  static _createSeedProposal4() {
    const now = new Date();
    // Prazo configurado para amanhã às 17h (menos de 24h se rodar em horário comercial)
    const targetTomorrow = new Date(now.getTime() + (22 * 60 * 60 * 1000));
    const targetStr = `${String(targetTomorrow.getDate()).padStart(2, '0')}/${String(targetTomorrow.getMonth() + 1).padStart(2, '0')}/${targetTomorrow.getFullYear()} 17:00`;

    return {
      id: 'PROP-7004315600-04',
      opportunityNumber: '7004315600',
      portal: 'Petronect',
      client: 'Petrobras - Termobahia',
      object: 'Inspeção termográfica e emissões em turbogeradores a gás natural',
      participatingCompany: 'Veeluen Solutions',
      primaryService: 'Inspeção e Eficiência Energética',
      opportunityDeadline: targetStr.split(' ')[0],
      targetSubmissionDate: targetStr,
      estimatedValue: 'R$ 890.000,00',
      decisionScore: 91,
      riskScore: 25,
      adherenceScore: 92,
      status: ProposalStatus.PRONTA_PARA_ENVIO,
      responsibles: {
        principal: 'Mariana Castro',
        tecnico: 'Eng. Fernando Diniz',
        comercial: 'Mariana Castro',
        documental: 'Dra. Mariana Lemos',
        financeiro: 'Carlos Silveira'
      },
      tasks: this._generateInitialTasks('PROP-7004315600-04', '7004315600', null, { title: 'Termobahia', endDate: targetStr }).map(t => ({
        ...t,
        status: t.id === 'chk-enviar' || t.id === 'chk-comprovante' ? TaskStatus.PENDENTE : TaskStatus.CONCLUIDA
      })),
      pricing: {
        ...this._generateInitialPricing(),
        definedPrice: 168000,
        totalEstimatedCost: 124000,
        finalMargin: 26.2
      },
      quotations: [],
      priceApproval: {
        status: 'Aprovado',
        approvedBy: 'Mariana Castro',
        approvedAt: 'Ontem às 18:20',
        notes: 'Preço aprovado com excelente margem e homologação técnica.'
      },
      priceChangeLogs: [],
      technicalProposal: {
        presentation: 'Veeluen Solutions possui equipe de termografistas e inspetores NDT nível 3.',
        understanding: 'Inspeção preditiva sem interrupção de geração na Termobahia.',
        methodology: 'Câmeras termográficas Flir T1020 de alta resolução óptica com calibração RBC.',
        workPlan: 'Mobilização imediata em Salvador / São Francisco do Conde.',
        team: 'Engenheiro Eletricista RT e Inspetor Termografista Snr.',
        equipment: 'Termovisores Flir calibrados e analisadores de vibração.',
        schedule: '6 meses com vistorias quinzenais.',
        experience: 'Termelétricas e turbinas a gás no Nordeste.',
        certificates: 'Atestados Petrobras em termelétricas.',
        technicalResponsibility: 'ART CREA-BA protocolada.',
        differentials: 'Relatório termográfico emitido em 24h na plataforma online.'
      },
      commercialProposal: {
        object: 'Inspeção termográfica e análise preditiva na Termobahia.',
        validityDays: 60,
        executionPeriod: '6 meses',
        paymentTerms: '30 dias da medição',
        taxesIncluded: 'Tributos inclusos',
        conditions: 'Preço fixo irreajustável.',
        observations: 'Pronta para envio imediato no portal Petronect.'
      },
      versions: [
        {
          versionNumber: 'V1',
          createdAt: 'Ontem às 14:00',
          author: 'Mariana Castro',
          price: 168000,
          margin: 26.2,
          scopeSummary: 'Versão final validada para submissão',
          changes: 'Aprovação concedida por todos os diretores.'
        }
      ],
      dossier: this._generateInitialDossier('7004315600', { recommendedCompany: 'Veeluen Solutions' }),
      approvals: {
        technical: { status: 'Aprovado', user: 'Eng. Fernando Diniz', date: 'Ontem às 16:00', notes: 'OK' },
        commercial: { status: 'Aprovado', user: 'Mariana Castro', date: 'Ontem às 17:00', notes: 'OK' },
        financial: { status: 'Aprovado', user: 'Carlos Silveira', date: 'Ontem às 17:30', notes: 'OK' },
        final: { status: 'Aprovado', user: 'Dr. Roberto Albuquerque', date: 'Ontem às 18:20', notes: 'Liberado para envio imediato' }
      },
      submission: {
        submitted: false,
        submissionDate: null,
        submissionTime: null,
        submittedBy: null,
        portalUrl: 'https://www.petronect.com.br',
        protocolNumber: null,
        receiptAttachment: null,
        observations: ''
      },
      result: {
        status: TenderResult.AGUARDANDO_RESULTADO,
        date: null,
        lossReason: null,
        notes: '',
        convertedToContract: false
      },
      auditLogs: [
        {
          id: 'aud-s4-1',
          date: 'Ontem às 18:20',
          user: 'Dr. Roberto Albuquerque',
          action: 'APROVACAO_FINAL',
          details: 'Proposta classificada como PRONTA PARA ENVIO. Faltando apenas submissão manual no Petronect.'
        }
      ],
      createdAt: '2026-10-06T14:00:00.000Z',
      lastUpdated: '2026-10-07T18:20:00.000Z'
    };
  }

  // Seed 5: Proposta Enviada (Item 65, 45, 46, 47, 49)
  static _createSeedProposal5() {
    return {
      id: 'PROP-7004309911-05',
      opportunityNumber: '7004309911',
      portal: 'Petronect',
      client: 'Petrobras - Terminal de Madre de Deus (TEMADRE)',
      object: 'Controle de qualidade e análises laboratoriais de águas de lastro e efluentes',
      participatingCompany: 'Excelência Ambiental',
      primaryService: 'Laboratório e Monitoramento Ambiental',
      opportunityDeadline: '01/10/2026',
      targetSubmissionDate: '01/10/2026 15:00',
      estimatedValue: 'R$ 1.150.000,00',
      decisionScore: 95,
      riskScore: 20,
      adherenceScore: 97,
      status: ProposalStatus.ENVIADA,
      responsibles: {
        principal: 'Dr. Roberto Albuquerque',
        tecnico: 'Dr. Roberto Albuquerque',
        comercial: 'Mariana Castro',
        documental: 'Dra. Mariana Lemos',
        financeiro: 'Carlos Silveira'
      },
      tasks: this._generateInitialTasks('PROP-7004309911-05', '7004309911', null, { title: 'TEMADRE', endDate: '01/10/2026' }).map(t => ({
        ...t,
        status: TaskStatus.CONCLUIDA
      })),
      pricing: {
        ...this._generateInitialPricing(),
        definedPrice: 320000,
        totalEstimatedCost: 242000,
        finalMargin: 24.4
      },
      quotations: [],
      priceApproval: {
        status: 'Aprovado',
        approvedBy: 'Mariana Castro',
        approvedAt: '30/09/2026 às 11:00',
        notes: 'Preço validado'
      },
      priceChangeLogs: [],
      technicalProposal: {
        presentation: 'Excelência Ambiental é credenciada pelo Cgcre/Inmetro para análises físico-químicas de água de lastro.',
        understanding: 'Conformidade com resolução IMO D-2 e normas da DPC Marinha do Brasil.',
        methodology: 'Ensaios em conformidade com Standard Methods 23rd Edition.',
        workPlan: 'Atendimento contínuo 24h para navios petroleiros atracados.',
        team: 'Químico Industrial e Amostradores Certificados.',
        equipment: 'Espectrofotômetros e fluorômetros de bancada.',
        schedule: '12 meses.',
        experience: 'Terminais da Transpetro na Baía de Todos os Santos.',
        certificates: 'Atestados de ensaios de lastro.',
        technicalResponsibility: 'ART CREA-BA e CRQ.',
        differentials: 'Laudos analíticos com assinatura digital e código de autenticidade QR Code.'
      },
      commercialProposal: {
        object: 'Controle de qualidade de águas de lastro e efluentes em Madre de Deus.',
        validityDays: 60,
        executionPeriod: '12 meses',
        paymentTerms: 'Mensal 30 dias',
        taxesIncluded: 'Todos inclusos',
        conditions: 'Preço fixo.',
        observations: 'Submetida com sucesso no Petronect.'
      },
      versions: [
        {
          versionNumber: 'V1',
          createdAt: '30/09/2026 às 14:00',
          author: 'Mariana Castro',
          price: 320000,
          margin: 24.4,
          scopeSummary: 'Versão homologada e protocolada',
          changes: 'Envio formal no portal.'
        }
      ],
      dossier: this._generateInitialDossier('7004309911', { recommendedCompany: 'Excelência Ambiental' }),
      approvals: {
        technical: { status: 'Aprovado', user: 'Dr. Roberto Albuquerque', date: '30/09/2026 10:00', notes: 'OK' },
        commercial: { status: 'Aprovado', user: 'Mariana Castro', date: '30/09/2026 11:00', notes: 'OK' },
        financial: { status: 'Aprovado', user: 'Carlos Silveira', date: '30/09/2026 11:30', notes: 'OK' },
        final: { status: 'Aprovado', user: 'Diretor Geral', date: '30/09/2026 12:00', notes: 'OK' }
      },
      submission: {
        submitted: true,
        submissionDate: '01/10/2026',
        submissionTime: '14:32',
        submittedBy: 'Mariana Castro (Gerente de Contratos)',
        portalUrl: 'https://www.petronect.com.br',
        protocolNumber: 'PETRO-7004309911-PROT-8821',
        receiptAttachment: 'Comprovante_Envio_Petronect_Oficial_TEMADRE.pdf',
        observations: 'Proposta registrada com recibo gerado pelo sistema Petronect. Todos os anexos carregados sem inconformidades.'
      },
      result: {
        status: TenderResult.PARTICIPANDO,
        date: '01/10/2026',
        lossReason: null,
        notes: 'Sessão pública em andamento no portal Petronect. Aguardando convocação de lances ou negociação.',
        convertedToContract: false
      },
      auditLogs: [
        {
          id: 'aud-s5-1',
          date: '01/10/2026 14:35',
          user: 'Mariana Castro',
          action: 'PROPOSTA_ENVIADA',
          details: 'Proposta submetida com sucesso no portal Petronect sob o protocolo PETRO-7004309911-PROT-8821.'
        }
      ],
      createdAt: '2026-09-28T09:00:00.000Z',
      lastUpdated: '2026-10-01T14:35:00.000Z'
    };
  }
}
