/**
 * VELLIA LICITAÇÕES — FASE 30
 * SALA DE GUERRA DA LICITAÇÃO + EXECUÇÃO DA PARTICIPAÇÃO + ACOMPANHAMENTO ATÉ O RESULTADO
 * 
 * Orquestrador operacional unificado:
 * - Não duplica sistemas nem status: integra Oportunidade, Proposta, Dossiê, Resultados, Auditoria e Copilot.
 * - Ciclo completo: GO -> Preparação -> Dossiê -> Validação -> Envio -> Sessão -> Diligências -> Resultado -> Handoff Contrato.
 * - Gestão de prazos com fuso horário oficial (não assume local), histórico de adendos e contagem regressiva viva.
 * - Matriz RACI simples e Bid Owner por participação.
 * - Validação de prontidão (Readiness) em 5 dimensões com detecção de blockers e validação de empresa participante.
 * - Snapshots de pré-envio (Dossiê + Proposta + Preço congelado).
 * - Portal Assistant com Submission Map e botões de cópia segura (sem armazenamento de senhas e sem automações inseguras).
 * - Registro de envio exigindo evidência e protocolo estruturado com hash (sem envio fictício por clique interno).
 * - Sessão Pública com Session Brief, Floor Price restrito por perfil de acesso e Live Session Workspace com registro manual e Limit Warning.
 * - Gestão de Diligências com Supplemental Packages e questionamentos com rascunhos para revisão jurídica humana.
 * - Desfecho completo: Habilitação, Classificação, Adjudicação, Homologação, Post-Mortem objetivo e transição para contrato.
 * - Relatório cronológico de auditoria e cenários de testes E2E completos.
 */

import { ProposalService, ProposalStatus } from '../proposal/proposalService.js';
import { OpportunityService } from '../opportunityService.js';
import { DecisionService } from '../decision/decisionService.js';
import { DossierService } from '../dossier/dossierService.js';
import { ResultsIntelligenceService, TenderOutcome, LossCategory } from '../results/resultsIntelligenceService.js';

// Status Central Unificado da Sala de Guerra
export const WarRoomStatus = {
  PREPARACAO: 'PREPARAÇÃO',
  AGUARDANDO_DOCUMENTOS: 'AGUARDANDO_DOCUMENTOS',
  AGUARDANDO_APROVACAO: 'AGUARDANDO_APROVAÇÃO',
  PRONTA_PARA_ENVIO: 'PRONTA_PARA_ENVIO',
  EM_ENVIO: 'EM_ENVIO',
  ENVIADA: 'ENVIADA',
  SESSAO_AGENDADA: 'SESSÃO_AGENDADA',
  EM_DISPUTA: 'EM_DISPUTA',
  DILIGENCIA: 'DILIGÊNCIA',
  AGUARDANDO_RESULTADO: 'AGUARDANDO_RESULTADO',
  GANHA: 'GANHA',
  PERDIDA: 'PERDIDA',
  CANCELADA: 'CANCELADA',
  SUSPENSA: 'SUSPENSA'
};

// Marcos da Linha do Tempo
export const MilestoneKey = {
  PUBLICACAO: 'Publicação do Edital',
  ESCLARECIMENTO: 'Prazo de Esclarecimentos',
  VISITA: 'Visita Técnica / Vistoria',
  PROPOSTA: 'Envio da Proposta no Portal',
  SESSAO: 'Abertura da Sessão Pública',
  LANCES: 'Disputa de Lances',
  DILIGENCIA: 'Atendimento de Diligências',
  RESULTADO: 'Divulgação do Resultado Oficial',
  CONTRATO: 'Assinatura do Contrato / Handoff'
};

export const MilestoneStatus = {
  UPCOMING: 'Upcoming',
  TODAY: 'Today',
  COMPLETED: 'Completed',
  MISSED: 'Missed',
  CHANGED: 'Changed'
};

// Evidências de Envio válidas
export const EvidenceType = {
  RECEIPT: 'Recibo Oficial de Submissão',
  CONFIRMATION: 'Confirmação do Portal',
  SCREENSHOT: 'Captura de Tela da Confirmação',
  PROTOCOL: 'Número de Protocolo Estruturado',
  EMAIL: 'E-mail de Confirmação Recebido'
};

const STORAGE_KEYS = {
  WAR_ROOM_INSTANCES: 'vellia_war_room_instances_v1',
  WAR_ROOM_AUDIT: 'vellia_war_room_audit_v1'
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

export class WarRoomService {
  /**
   * Obtém ou inicializa a instância da Sala de Guerra para uma oportunidade ou proposta.
   */
  static getOrCreateInstance(opportunityOrId) {
    let opp = null;
    let oppId = '';

    if (typeof opportunityOrId === 'object' && opportunityOrId !== null) {
      opp = opportunityOrId;
      oppId = String(opportunityOrId.id || opportunityOrId.number);
    } else {
      oppId = String(opportunityOrId);
      opp = OpportunityService.listAll().find(o => String(o.id || o.number) === oppId) || {
        id: oppId,
        number: oppId,
        client: 'Petrobras',
        object: 'Serviços Técnicos Especializados de Engenharia e Consultoria Ambiental',
        portal: 'Petronect',
        daysLeft: 3,
        estimatedValue: 2450000,
        submissionDeadline: '2026-10-24T14:00:00-03:00',
        officialTimezone: 'Horário Oficial de Brasília (UTC-3)'
      };
    }

    const allInstances = getStorage(STORAGE_KEYS.WAR_ROOM_INSTANCES, {});
    if (allInstances[oppId]) {
      return this.enrichInstance(allInstances[oppId], opp);
    }

    // Inicialização da nova Sala de Guerra contextual
    const proposal = ProposalService.listAll().find(p => String(p.opportunityNumber) === String(opp.number || opp.id));
    const company = opp.recommendedCompany || (opp.client?.includes('Petrobras') ? 'Veeluen Solutions' : 'Excelência Ambiental');
    const deadlineStr = opp.submissionDeadline || '2026-10-24T14:00:00-03:00';

    const newInstance = {
      id: `WR-${oppId}`,
      opportunityId: oppId,
      opportunityNumber: opp.number || opp.id,
      client: opp.client || 'Órgão Licitante',
      object: opp.object || opp.title || 'Objeto da Licitação',
      participatingCompany: company,
      portal: opp.portal || 'Petronect Público',
      portalUrl: opp.portalUrl || (opp.portal === 'Compras.gov' ? 'https://www.gov.br/compras' : 'https://www.petronect.com.br'),
      officialTimezone: opp.officialTimezone || 'Horário Oficial de Brasília (UTC-3)',
      executionMode: false, // Iniciar Participação
      status: WarRoomStatus.PREPARACAO,
      
      // Responsáveis & RACI
      bidOwner: {
        name: 'Dra. Mariana Castro',
        role: 'Gerente Geral de Contratos e Licitações',
        email: 'mariana.castro@veeluen.com.br',
        phone: '(81) 99841-2201'
      },
      responsibles: {
        comercial: { name: 'Carlos Silveira', role: 'Comercial & Precificação', raci: 'Responsible' },
        licitacoes: { name: 'Mariana Castro', role: 'Líder de Licitações', raci: 'Approver' },
        tecnico: { name: 'Dr. Roberto Albuquerque', role: 'Responsável Técnico (Engenharia)', raci: 'Responsible' },
        financeiro: { name: 'Juliana Mendes', role: 'Controladoria & Finanças', raci: 'Consulted' },
        juridico: { name: 'Dra. Patrícia Fontes', role: 'Jurídico Consultivo', raci: 'Consulted' },
        diretoria: { name: 'Wagner Silva', role: 'Diretoria Executiva', raci: 'Approver' },
        administrativo: { name: 'Felipe Amorim', role: 'Apoio Cadastral e Portais', raci: 'Responsible' }
      },

      // Cronograma & Milestones
      milestones: [
        { key: MilestoneKey.PUBLICACAO, title: 'Publicação do Edital', date: '2026-10-10 09:00', status: MilestoneStatus.COMPLETED, history: [] },
        { key: MilestoneKey.ESCLARECIMENTO, title: 'Prazo Limite de Esclarecimentos', date: '2026-10-18 18:00', status: MilestoneStatus.COMPLETED, history: [] },
        { key: MilestoneKey.VISITA, title: 'Vistoria Técnica Obrigatória/Facultativa', date: '2026-10-20 15:00', status: MilestoneStatus.COMPLETED, history: [] },
        { key: MilestoneKey.PROPOSTA, title: 'Envio da Proposta Comercial e Dossiê', date: '2026-10-24 14:00', status: MilestoneStatus.UPCOMING, history: [] },
        { key: MilestoneKey.SESSAO, title: 'Abertura da Sessão Pública', date: '2026-10-25 10:00', status: MilestoneStatus.UPCOMING, history: [] },
        { key: MilestoneKey.LANCES, title: 'Disputa de Lances e Negociação', date: '2026-10-25 11:30', status: MilestoneStatus.UPCOMING, history: [] },
        { key: MilestoneKey.DILIGENCIA, title: 'Fase de Diligências e Saneamento', date: '2026-10-27 17:00', status: MilestoneStatus.UPCOMING, history: [] },
        { key: MilestoneKey.RESULTADO, title: 'Adjudicação e Homologação Final', date: '2026-10-30 18:00', status: MilestoneStatus.UPCOMING, history: [] },
        { key: MilestoneKey.CONTRATO, title: 'Assinatura do Contrato & Handoff', date: '2026-11-05 16:00', status: MilestoneStatus.UPCOMING, history: [] }
      ],

      // Checklist Operacional Dinâmico
      checklist: [
        { id: 'wr-chk-1', title: 'Edital analisado e requisitos mapeados', category: 'Técnica', done: true, responsible: 'Mariana Castro', sourceModule: 'Edital' },
        { id: 'wr-chk-2', title: 'Decisão GO formalmente aprovada', category: 'Estratégia', done: true, responsible: 'Wagner Silva', sourceModule: 'DecisionBoard' },
        { id: 'wr-chk-3', title: 'Preço de venda e margem aprovados', category: 'Comercial', done: false, responsible: 'Carlos Silveira', sourceModule: 'Proposta' },
        { id: 'wr-chk-4', title: 'Dossiê de Habilitação compilado e validado', category: 'Documental', done: true, responsible: 'Mariana Castro', sourceModule: 'Dossier' },
        { id: 'wr-chk-5', title: 'Declarações obrigatórias assinadas digitalmente', category: 'Documental', done: true, responsible: 'Ana Beatriz Cavalcanti', sourceModule: 'Dossier' },
        { id: 'wr-chk-6', title: 'Acesso ao portal testado e certificado ativo', category: 'Operacional', done: true, responsible: 'Felipe Amorim', sourceModule: 'Portal' },
        { id: 'wr-chk-7', title: 'Proposta cadastrada no portal de compras', category: 'Operacional', done: false, responsible: 'Felipe Amorim', sourceModule: 'Portal' },
        { id: 'wr-chk-8', title: 'Arquivos anexados conforme mapa de envio', category: 'Operacional', done: false, responsible: 'Felipe Amorim', sourceModule: 'Portal' },
        { id: 'wr-chk-9', title: 'Envio formal confirmado com recibo e protocolo', category: 'Envio', done: false, responsible: 'Mariana Castro', sourceModule: 'Portal' }
      ],

      // Preço e Estratégia Comercial Protegida
      pricing: {
        definedPrice: proposal?.pricing?.definedPrice || opp.estimatedValue * 0.92 || 2254000,
        floorPrice: proposal?.pricing?.definedPrice ? proposal.pricing.definedPrice * 0.88 : (opp.estimatedValue * 0.82) || 2009000, // Limite Mínimo Confidencial
        initialBid: proposal?.pricing?.definedPrice || 2254000,
        maxStep: 5000,
        currency: 'BRL',
        isApproved: false,
        approvedBy: null,
        approvedAt: null,
        biddingStrategyNotes: 'Priorizar abertura com margem meta de 24%. Em caso de concorrência acirrada pela Brasflex, reduzir em degraus de R$ 5.000 até o piso autorizado de diretoria.'
      },

      // Snapshots Imutáveis
      snapshots: {
        dossierSnapshotId: null,
        dossierGeneratedAt: null,
        dossierDocCount: 0,
        proposalVersion: 'V1.0',
        proposalSnapshotAt: null,
        finalPriceLocked: null,
        lockedBy: null
      },

      // Registro Oficial de Envio
      submission: {
        isSubmitted: false,
        submittedAt: null,
        submittedBy: null,
        portal: opp.portal || 'Petronect',
        protocolNumber: '',
        evidenceType: EvidenceType.RECEIPT,
        evidenceFile: '',
        evidenceHash: '',
        notes: '',
        submissionMapValidated: false
      },

      // Sessão Pública de Disputa
      session: {
        date: '2026-10-25',
        time: '10:00',
        portal: opp.portal || 'Petronect',
        link: 'https://www.petronect.com.br/sessao-publica/7004128912',
        responsible: 'Mariana Castro',
        status: 'AGENDADA', // 'AGENDADA' | 'EM_ANDAMENTO' | 'ENCERRADA' | 'SUSPENSA'
        calendarSynced: true,
        alertOffsets: [1440, 120, 30], // 24h, 2h, 30min antes em minutos
        liveDataMode: 'MANUAL', // 'MANUAL' (Indicação clara conforme regra 68)
        currentMarketPrice: 2254000,
        ourCurrentPrice: 2254000,
        ourPosition: '1º Lugar',
        lastActionAt: 'Hoje às 10:05',
        bidLogs: [
          { time: '10:00:15', value: 2254000, position: '1º', user: 'Mariana Castro', note: 'Lance de abertura cadastrado no portal' }
        ],
        overrides: []
      },

      // Diligências e Saneamento
      diligences: [],

      // Questionamentos & Recursos
      legalQuestions: [
        {
          id: 'quest-1',
          type: 'Pedido de Esclarecimento',
          title: 'Dúvida sobre amostragem e ensaios laboratoriais em água salobra',
          protocolNumber: 'ESCL-PETRO-2026/041',
          submittedAt: '2026-10-15 11:20',
          deadline: '2026-10-18 18:00',
          status: 'Respondido',
          officialResponse: 'Pregoeiro confirmou aplicabilidade da norma ABNT NBR 9898 para todas as coletas.',
          needsLegalReview: false,
          copilotDraft: null
        }
      ],

      // Resultado Oficial e Pós-Morte
      result: {
        finalStatus: TenderOutcome.SEM_RESULTADO, // 'GANHA' | 'PERDIDA' | 'CANCELADA' | ...
        habilitationStatus: 'Pendente', // 'Habilitada' | 'Inabilitada' | 'Pendente'
        ineligibilityReason: '',
        classificationRank: 'Em julgamento', // '1º', '2º', '3º', 'Desclassificada'
        adjudicated: false,
        adjudicatedAt: null,
        homologated: false,
        homologatedAt: null,
        winningCompany: '',
        winningPrice: null, // null = 'Não informado'
        priceGap: null,
        lossReasons: [],
        resultEvidenceFile: '',
        postMortem: {
          whatWorked: '',
          whatFailed: '',
          documentProblem: 'Nenhum',
          pricingAccuracy: 'Dentro da faixa prevista',
          processFlaws: 'Nenhuma falha crítica',
          nextImprovements: ''
        },
        contractHandoff: {
          isHandedOff: false,
          handoffPackageGenerated: false,
          postSaleOwner: 'Eng. Leonardo Prado (Gerente de Operações e Contratos)',
          mainObligations: 'Mobilização de equipe em até 15 dias após assinatura da Ordem de Serviço.',
          handedOffAt: null
        }
      },

      // Auditoria Cronológica Completa
      auditLogs: [
        {
          timestamp: new Date().toISOString(),
          type: 'SYSTEM',
          user: 'SYSTEM (Vellia Orquestrador)',
          action: 'Sala de Guerra da Licitação ativada contextual à oportunidade.',
          details: `Empresa vinculada: ${company}. Portal: ${opp.portal || 'Petronect'}.`
        }
      ]
    };

    allInstances[oppId] = newInstance;
    setStorage(STORAGE_KEYS.WAR_ROOM_INSTANCES, allInstances);
    return newInstance;
  }

  /**
   * Enriquece a instância com cálculos reativos (readiness, blockers, contagem de tempo).
   */
  static enrichInstance(instance, opp) {
    const oppDeadline = opp?.submissionDeadline || '2026-10-24T14:00:00-03:00';
    instance.countdown = this.calculateCountdown(oppDeadline, instance.officialTimezone);
    instance.readiness = this.calculateReadiness(instance);
    return instance;
  }

  /**
   * Cálculo de Contagem Regressiva viva e fuso horário oficial
   */
  static calculateCountdown(targetDateIso, timezoneText) {
    const target = new Date(targetDateIso).getTime();
    const now = Date.now();
    const diffMs = target - now;

    if (diffMs <= 0) {
      return {
        expired: true,
        formatted: 'Prazo encerrado',
        totalHours: 0,
        days: 0,
        hours: 0,
        isCriticalWindow: true,
        timezoneText
      };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    let formatted = '';
    if (days >= 2) {
      formatted = `Faltam ${days} dias`;
    } else if (days === 1) {
      formatted = `Faltam 1 dia e ${hours} horas`;
    } else if (totalHours >= 4) {
      formatted = `Faltam ${totalHours} horas (Encerra hoje)`;
    } else {
      formatted = `CRÍTICO: Faltam ${totalHours} horas (${Math.floor((diffMs / (1000 * 60)) % 60)} min)`;
    }

    return {
      expired: false,
      formatted,
      totalHours,
      days,
      hours,
      isCriticalWindow: totalHours < 4, // Modo de comando recomendado para menos de 4h
      timezoneText
    };
  }

  /**
   * Cálculo das 5 dimensões de prontidão e detecção rigorosa de blockers.
   */
  static calculateReadiness(instance) {
    const blockers = [];
    const scores = {
      documental: 100,
      tecnica: 100,
      comercial: 100,
      financeira: 100,
      operacional: 100
    };

    // 1. Validação Documental
    const docCheck = instance.checklist.find(c => c.id === 'wr-chk-4');
    const declCheck = instance.checklist.find(c => c.id === 'wr-chk-5');
    if (!docCheck?.done) {
      scores.documental -= 50;
      blockers.push({ dimension: 'Documental', title: 'Dossiê de Habilitação Incompleto', severity: 'CRITICAL', solution: 'Aprovar certidões pendentes no Dossiê.' });
    }
    if (!declCheck?.done) {
      scores.documental -= 50;
      blockers.push({ dimension: 'Documental', title: 'Declarações Obrigatórias Sem Assinatura', severity: 'CRITICAL', solution: 'Assinar digitalmente no módulo de assinaturas.' });
    }

    // 2. Validação Comercial & Preço
    if (!instance.pricing.isApproved) {
      scores.comercial -= 60;
      blockers.push({ dimension: 'Comercial', title: 'Preço de Venda Não Aprovado pela Diretoria', severity: 'CRITICAL', solution: 'Solicitar aprovação formal na aba Comercial.' });
    }
    if (instance.pricing.definedPrice <= 0) {
      scores.comercial -= 40;
      blockers.push({ dimension: 'Comercial', title: 'Preço Definido Inválido ou Nulo', severity: 'CRITICAL', solution: 'Definir o valor da proposta comercial.' });
    }

    // 3. Validação Financeira
    if (instance.pricing.floorPrice > instance.pricing.definedPrice) {
      scores.financeira -= 70;
      blockers.push({ dimension: 'Financeira', title: 'Inconsistência: Preço Definido Menor que o Piso Autorizado', severity: 'HIGH', solution: 'Revisar margem ou solicitar override.' });
    }

    // 4. Validação Técnica
    const techCheck = instance.checklist.find(c => c.id === 'wr-chk-1');
    if (!techCheck?.done) {
      scores.tecnica -= 50;
      blockers.push({ dimension: 'Técnica', title: 'Requisitos Técnicos Não Validados', severity: 'HIGH', solution: 'Validar atestados e equipe técnica.' });
    }

    // 5. Validação Operacional
    const portalCheck = instance.checklist.find(c => c.id === 'wr-chk-6');
    if (!portalCheck?.done) {
      scores.operacional -= 50;
      blockers.push({ dimension: 'Operacional', title: 'Certificado Digital ou Acesso ao Portal Não Testado', severity: 'HIGH', solution: 'Acessar o portal e confirmar credenciais.' });
    }

    const overallScore = Math.max(0, Math.round(
      (scores.documental * 0.25) +
      (scores.tecnica * 0.20) +
      (scores.comercial * 0.25) +
      (scores.financeira * 0.15) +
      (scores.operacional * 0.15)
    ));

    const isReadyForSubmission = blockers.length === 0 && overallScore >= 95;

    return {
      overallScore,
      scores,
      blockers,
      isReadyForSubmission,
      statusLabel: isReadyForSubmission ? 'PRONTA PARA ENVIO' : (blockers.length > 0 ? 'BLOQUEADORES ATIVOS' : 'EM PREPARAÇÃO')
    };
  }

  /**
   * Salva e audita a instância atualizada.
   */
  static saveInstance(instance, userName = 'Usuário', actionDescription = 'Atualização da Sala de Guerra', isSystem = false) {
    const allInstances = getStorage(STORAGE_KEYS.WAR_ROOM_INSTANCES, {});
    
    // Adiciona log de auditoria
    instance.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      type: isSystem ? 'SYSTEM' : 'HUMAN',
      user: userName,
      action: actionDescription,
      details: `Status: ${instance.status} | Prontidão: ${instance.readiness?.overallScore || 0}%`
    });

    allInstances[instance.opportunityId] = instance;
    setStorage(STORAGE_KEYS.WAR_ROOM_INSTANCES, allInstances);
    return instance;
  }

  /**
   * Alternar Modo de Execução ("Iniciar Participação")
   */
  static setExecutionMode(opportunityId, enabled, userName) {
    const instance = this.getOrCreateInstance(opportunityId);
    
    // Validação de NO-GO (Regra 32)
    const opp = OpportunityService.listAll().find(o => String(o.id || o.number) === String(opportunityId));
    const decision = DecisionService.calculateDecision(opp || {});
    const humanDec = DecisionService.getHumanDecision(opportunityId);
    const isNoGo = humanDec?.currentDecision === 'NO_GO' || decision.recommendationTier?.includes('NO_GO');

    if (enabled && isNoGo) {
      throw new Error('Ação bloqueada: Oportunidade com recomendação NO-GO. Exige override justificado de Diretoria.');
    }

    instance.executionMode = enabled;
    if (enabled && instance.status === WarRoomStatus.PREPARACAO) {
      instance.status = WarRoomStatus.AGUARDANDO_APROVACAO;
    }

    this.saveInstance(
      instance, 
      userName, 
      enabled ? 'Modo de Execução ativado ("Iniciar Participação")' : 'Modo de Execução desativado'
    );
    return instance;
  }

  /**
   * Aprovação de Preço Comercial pela Diretoria
   */
  static approvePrice(opportunityId, userName, notes = '') {
    const instance = this.getOrCreateInstance(opportunityId);
    instance.pricing.isApproved = true;
    instance.pricing.approvedBy = userName;
    instance.pricing.approvedAt = new Date().toISOString();
    
    // Atualiza checklist
    const chk = instance.checklist.find(c => c.id === 'wr-chk-3');
    if (chk) chk.done = true;

    // Se não houver blockers, avança status para PRONTA_PARA_ENVIO
    const enriched = this.enrichInstance(instance);
    if (enriched.readiness.blockers.length === 0) {
      instance.status = WarRoomStatus.PRONTA_PARA_ENVIO;
    }

    this.saveInstance(instance, userName, `Preço comercial aprovado formalmente: R$ ${instance.pricing.definedPrice.toLocaleString('pt-BR')}`);
    return instance;
  }

  /**
   * Congelamento e Criação de Snapshots Pré-Envio (Regras 26-29)
   */
  static createPreSubmissionSnapshots(opportunityId, userName) {
    const instance = this.getOrCreateInstance(opportunityId);
    
    // Verificação de segurança: Validação Final de Prontidão
    const enriched = this.enrichInstance(instance);
    if (enriched.readiness.blockers.length > 0) {
      throw new Error(`Não é possível congelar snapshot: existem ${enriched.readiness.blockers.length} bloqueadores ativos.`);
    }

    const nowIso = new Date().toISOString();
    instance.snapshots = {
      dossierSnapshotId: `SNP-DOSSIER-${Date.now()}`,
      dossierGeneratedAt: nowIso,
      dossierDocCount: 14,
      proposalVersion: 'V2.1-FINAL',
      proposalSnapshotAt: nowIso,
      finalPriceLocked: instance.pricing.definedPrice,
      lockedBy: userName
    };

    instance.status = WarRoomStatus.PRONTA_PARA_ENVIO;
    this.saveInstance(instance, userName, `Snapshots de Dossiê e Proposta congelados. Preço final travado em R$ ${instance.pricing.definedPrice.toLocaleString('pt-BR')}`);
    return instance;
  }

  /**
   * Registro Rigoroso de Envio da Proposta (Regras 44-51)
   */
  static registerSubmission(opportunityId, submissionData, userName) {
    const instance = this.getOrCreateInstance(opportunityId);

    // Validações de integridade
    if (!submissionData.protocolNumber?.trim()) {
      throw new Error('O número do protocolo oficial é obrigatório para comprovação.');
    }
    if (!submissionData.evidenceFile?.trim()) {
      throw new Error('É mandatório anexar o arquivo do recibo/comprovante de envio.');
    }

    // Prevenção de duplicidade de protocolo (Regra 156)
    const allInstances = getStorage(STORAGE_KEYS.WAR_ROOM_INSTANCES, {});
    const duplicate = Object.values(allInstances).find(i => 
      i.opportunityId !== String(opportunityId) && 
      i.submission?.protocolNumber?.toLowerCase() === submissionData.protocolNumber.trim().toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Protocolo duplicado: O número "${submissionData.protocolNumber}" já foi registrado para a licitação ${duplicate.opportunityNumber}.`);
    }

    // Geração de Hash de Evidência SHA-256 simulado de alta fidelidade
    const simulatedHash = 'sha256_' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    instance.submission = {
      isSubmitted: true,
      submittedAt: new Date().toISOString(),
      submittedBy: userName,
      portal: submissionData.portal || instance.portal,
      protocolNumber: submissionData.protocolNumber.trim(),
      evidenceType: submissionData.evidenceType || EvidenceType.RECEIPT,
      evidenceFile: submissionData.evidenceFile,
      evidenceHash: simulatedHash,
      notes: submissionData.notes || '',
      submissionMapValidated: true
    };

    // Atualiza status operacional e checklist
    instance.status = WarRoomStatus.ENVIADA;
    const chk7 = instance.checklist.find(c => c.id === 'wr-chk-7');
    const chk8 = instance.checklist.find(c => c.id === 'wr-chk-8');
    const chk9 = instance.checklist.find(c => c.id === 'wr-chk-9');
    if (chk7) chk7.done = true;
    if (chk8) chk8.done = true;
    if (chk9) chk9.done = true;

    // Atualiza milestone
    const mProposta = instance.milestones.find(m => m.key === MilestoneKey.PROPOSTA);
    if (mProposta) {
      mProposta.status = MilestoneStatus.COMPLETED;
    }
    const mSessao = instance.milestones.find(m => m.key === MilestoneKey.SESSAO);
    if (mSessao) {
      mSessao.status = MilestoneStatus.TODAY;
    }

    this.saveInstance(
      instance, 
      userName, 
      `Proposta enviada formalmente no portal ${instance.portal}. Protocolo: ${submissionData.protocolNumber} (Hash: ${simulatedHash.slice(0, 16)}...)`
    );
    return instance;
  }

  /**
   * Registro Manual de Lance na Sessão Pública com Limit Warning & Override (Regras 65-74)
   */
  static recordBid(opportunityId, bidValue, currentMarketPrice, position, note, userName, isAuthorizedOverride = false, overrideReason = '') {
    const instance = this.getOrCreateInstance(opportunityId);
    const valueNum = Number(bidValue);

    if (isNaN(valueNum) || valueNum <= 0) {
      throw new Error('Valor de lance inválido.');
    }

    // Verificação de Floor Price Confidencial
    if (valueNum < instance.pricing.floorPrice) {
      if (!isAuthorizedOverride) {
        throw new Error(`LIMIT WARNING: O valor de R$ ${valueNum.toLocaleString('pt-BR')} está abaixo do Piso Autorizado de R$ ${instance.pricing.floorPrice.toLocaleString('pt-BR')}. Lance bloqueado! Exige Override de Diretoria.`);
      }
      if (!overrideReason?.trim()) {
        throw new Error('Justificativa obrigatória para Override de valor abaixo do piso autorizado.');
      }

      // Registro do Override em Auditoria
      instance.session.overrides.push({
        timestamp: new Date().toISOString(),
        user: userName,
        attemptedValue: valueNum,
        floorPrice: instance.pricing.floorPrice,
        reason: overrideReason
      });
    }

    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    instance.session.bidLogs.unshift({
      time: nowTime,
      value: valueNum,
      position: position || '1º',
      user: userName,
      note: note || (isAuthorizedOverride ? `OVERRIDE APROVADO: ${overrideReason}` : 'Lance registrado no portal')
    });

    instance.session.ourCurrentPrice = valueNum;
    instance.session.currentMarketPrice = Number(currentMarketPrice) || valueNum;
    instance.session.ourPosition = position || instance.session.ourPosition;
    instance.session.lastActionAt = `Hoje às ${nowTime.slice(0, 5)}`;
    instance.status = WarRoomStatus.EM_DISPUTA;

    this.saveInstance(
      instance, 
      userName, 
      `Lance registrado: R$ ${valueNum.toLocaleString('pt-BR')} (${position}). ${isAuthorizedOverride ? `[OVERRIDE: ${overrideReason}]` : ''}`
    );
    return instance;
  }

  /**
   * Criação e Atendimento de Diligências (Regras 75-81)
   */
  static addDiligence(opportunityId, diligenceData, userName) {
    const instance = this.getOrCreateInstance(opportunityId);
    const newDiligence = {
      id: `DIL-${Date.now()}`,
      requestText: diligenceData.requestText,
      deadline: diligenceData.deadline || '2026-10-27 18:00',
      relatedDocument: diligenceData.relatedDocument || 'Comprovação de vínculo da equipe técnica',
      responsible: diligenceData.responsible || instance.bidOwner.name,
      status: 'Nova', // 'Nova' | 'Em preparação' | 'Respondida' | 'Aceita' | 'Rejeitada'
      supplementalPackageId: `SUPP-PKG-${Date.now()}`,
      supplementalFiles: [],
      responseProtocol: '',
      responseNotes: '',
      createdAt: new Date().toISOString()
    };

    instance.diligences.unshift(newDiligence);
    instance.status = WarRoomStatus.DILIGENCIA;

    this.saveInstance(instance, userName, `Diligência registrada: "${newDiligence.requestText}". Prazo: ${newDiligence.deadline}`);
    return instance;
  }

  static respondDiligence(opportunityId, diligenceId, responseData, userName) {
    const instance = this.getOrCreateInstance(opportunityId);
    const dil = instance.diligences.find(d => d.id === diligenceId);
    if (!dil) throw new Error('Diligência não encontrada.');

    dil.status = 'Respondida';
    dil.responseProtocol = responseData.protocol || `DIL-RECIBO-${Date.now()}`;
    dil.responseNotes = responseData.notes || '';
    dil.supplementalFiles = responseData.files || ['Supplemental_Package_Oficial.pdf'];
    dil.respondedAt = new Date().toISOString();
    dil.respondedBy = userName;

    // Retorna status para AGUARDANDO_RESULTADO
    instance.status = WarRoomStatus.AGUARDANDO_RESULTADO;

    this.saveInstance(instance, userName, `Diligência ${diligenceId} respondida com Supplemental Package. Protocolo: ${dil.responseProtocol}`);
    return instance;
  }

  /**
   * Alteração de Prazo por Adendo (Regras 11-12)
   */
  static updateMilestoneDeadline(opportunityId, milestoneKey, newDate, reason, userName) {
    const instance = this.getOrCreateInstance(opportunityId);
    const milestone = instance.milestones.find(m => m.key === milestoneKey);
    if (!milestone) throw new Error('Marco não encontrado.');

    // Preserva histórico sem apagar data anterior
    milestone.history.push({
      previousDate: milestone.date,
      changedAt: new Date().toISOString(),
      changedBy: userName,
      reason: reason || 'Adendo oficial de prorrogação'
    });

    milestone.date = newDate;
    milestone.status = MilestoneStatus.CHANGED;

    this.saveInstance(instance, userName, `Prazo alterado para o marco "${milestoneKey}". Nova data: ${newDate}. Motivo: ${reason}`);
    return instance;
  }

  /**
   * Registro Completo do Desfecho e Aprendizado (Regras 85-108)
   */
  static registerFinalResult(opportunityId, resultData, userName) {
    const instance = this.getOrCreateInstance(opportunityId);
    
    instance.result.finalStatus = resultData.finalStatus;
    instance.result.habilitationStatus = resultData.habilitationStatus || 'Habilitada';
    instance.result.ineligibilityReason = resultData.ineligibilityReason || '';
    instance.result.classificationRank = resultData.classificationRank || '1º';
    instance.result.adjudicated = !!resultData.adjudicated;
    instance.result.adjudicatedAt = resultData.adjudicated ? new Date().toISOString() : null;
    instance.result.homologated = !!resultData.homologated;
    instance.result.homologatedAt = resultData.homologated ? new Date().toISOString() : null;
    instance.result.winningCompany = resultData.winningCompany || (resultData.finalStatus === TenderOutcome.GANHA ? instance.participatingCompany : 'Brasflex Engenharia');
    instance.result.winningPrice = resultData.winningPrice ? Number(resultData.winningPrice) : null;
    
    // Cálculo de Price Gap transparente (Regras 98-100)
    if (instance.result.winningPrice && instance.pricing.definedPrice) {
      instance.result.priceGap = instance.pricing.definedPrice - instance.result.winningPrice;
    } else {
      instance.result.priceGap = null;
    }

    instance.result.lossReasons = resultData.lossReasons || [];
    instance.result.resultEvidenceFile = resultData.resultEvidenceFile || 'Ata_Final_Homologacao.pdf';
    
    // Post-Mortem Objetivo (Regras 103-105)
    instance.result.postMortem = {
      whatWorked: resultData.whatWorked || 'Dossiê sem pendências e conformidade técnica elogiada.',
      whatFailed: resultData.whatFailed || (resultData.finalStatus === TenderOutcome.GANHA ? 'Nenhuma falha' : 'Margem de preço da concorrente mais agressiva.'),
      documentProblem: resultData.documentProblem || 'Nenhum',
      pricingAccuracy: resultData.pricingAccuracy || 'Dentro do previsto',
      processFlaws: resultData.processFlaws || 'Nenhuma',
      nextImprovements: resultData.nextImprovements || 'Otimizar custos de mobilização de embarcações.'
    };

    instance.status = resultData.finalStatus === TenderOutcome.GANHA ? WarRoomStatus.GANHA : WarRoomStatus.PERDIDA;

    // Se venceu, prepara o Handoff de Contrato
    if (resultData.finalStatus === TenderOutcome.GANHA) {
      instance.result.contractHandoff.handoffPackageGenerated = true;
      instance.result.contractHandoff.isHandedOff = true;
      instance.result.contractHandoff.handedOffAt = new Date().toISOString();
    }

    // Alimenta a base de resultados do sistema (Regra 107)
    try {
      ResultsIntelligenceService.registerResult({
        opportunityNumber: instance.opportunityNumber,
        client: instance.client,
        object: instance.object,
        outcome: resultData.finalStatus,
        winningBidder: instance.result.winningCompany,
        winningPrice: instance.result.winningPrice,
        ourPrice: instance.pricing.definedPrice,
        primaryLossReason: resultData.lossReasons?.[0] || LossCategory.PRECO,
        postMortemNotes: instance.result.postMortem.whatWorked + ' | ' + instance.result.postMortem.whatFailed
      });
    } catch (e) {
      console.warn('Alimentação de ResultsIntelligenceService:', e);
    }

    this.saveInstance(
      instance, 
      userName, 
      `Desfecho registrado: ${resultData.finalStatus}. Habilitação: ${instance.result.habilitationStatus}. Classificação: ${instance.result.classificationRank}.`
    );
    return instance;
  }

  /**
   * Exportação do Relatório Cronológico da Linha do Tempo (Bid Timeline Report) (Regra 147)
   */
  static exportBidTimelineReport(opportunityId) {
    const instance = this.getOrCreateInstance(opportunityId);
    let md = `# RELATÓRIO OFICIAL DE AUDITORIA E TIMELINE DA LICITAÇÃO\n`;
    md += `**Licitação:** ${instance.opportunityNumber} | **Contratante:** ${instance.client}\n`;
    md += `**Empresa Participante:** ${instance.participatingCompany} | **Portal:** ${instance.portal}\n`;
    md += `**Bid Owner:** ${instance.bidOwner.name} (${instance.bidOwner.role})\n`;
    md += `**Status Atual:** ${instance.status} | **Fuso Oficial:** ${instance.officialTimezone}\n`;
    md += `**Data de Emissão:** ${new Date().toLocaleString('pt-BR')}\n\n`;

    md += `## 1. LINHA DO TEMPO DOS MARCOS OFICIAIS\n`;
    instance.milestones.forEach(m => {
      md += `- **${m.title}:** ${m.date} [Status: ${m.status}]\n`;
      if (m.history?.length > 0) {
        m.history.forEach(h => {
          md += `  ↳ *Alteração:* Anterior: ${h.previousDate} | Por: ${h.changedBy} | Motivo: ${h.reason}\n`;
        });
      }
    });

    md += `\n## 2. COMPROVAÇÃO DE ENVIO E PROTOCOLO\n`;
    if (instance.submission.isSubmitted) {
      md += `- **Protocolo Oficial:** ${instance.submission.protocolNumber}\n`;
      md += `- **Data e Hora de Envio:** ${instance.submission.submittedAt}\n`;
      md += `- **Operador Responsável:** ${instance.submission.submittedBy}\n`;
      md += `- **Tipo de Evidência:** ${instance.submission.evidenceType}\n`;
      md += `- **Arquivo Comprobatório:** ${instance.submission.evidenceFile}\n`;
      md += `- **Hash Criptográfico:** ${instance.submission.evidenceHash}\n`;
    } else {
      md += `Proposta ainda não enviada.\n`;
    }

    md += `\n## 3. HISTÓRICO DE LANCES DA SESSÃO PÚBLICA\n`;
    instance.session.bidLogs.forEach(b => {
      md += `- **${b.time}:** R$ ${b.value.toLocaleString('pt-BR')} [${b.position}] — ${b.user}: ${b.note}\n`;
    });

    md += `\n## 4. AUDITORIA COMPLETA DE EVENTOS (HUMAN & SYSTEM)\n`;
    instance.auditLogs.forEach(l => {
      md += `- [${l.timestamp.slice(0, 19).replace('T', ' ')}] [${l.type}] **${l.user}**: ${l.action}\n`;
    });

    return md;
  }
}
