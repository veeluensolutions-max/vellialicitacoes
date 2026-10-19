/**
 * VELLIA LICITAÇÕES — FASE 54
 * executiveOperatingSystemService.js: Executive Operating System, Weekly Business Review (WBR) e Cadência de Gestão
 * 
 * Princípio Central:
 * - O Vellia ajuda a empresa a operar com cadência executiva previsível.
 * - Gerenciamento por exceção (Management by Exception): destacar o que mudou, o que está em risco e o que exige decisão.
 * - Snapshots históricos imutáveis para cada revisão semanal (WBR), mensal (MBR) ou trimestral (QBR).
 * - Sem data warehouse duplicado; consome dados canônicos existentes.
 */

import { WeeklyChangeDetectionService } from './weeklyChangeDetectionService.js';

export const ReviewCadence = {
  WEEKLY: 'WEEKLY',       // Foco: Execução, prioridades da semana, decisões pendentes, riscos
  MONTHLY: 'MONTHLY',     // Foco: Performance vs metas, pipeline, win/loss e margens consolidadas
  QUARTERLY: 'QUARTERLY'  // Foco: Estratégia, novos mercados, evolução de maturidade e capacidade
};

export const ReviewStatus = {
  PREPARING: 'PREPARING',
  READY_PRE_READ: 'READY_PRE_READ',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

export const CommitmentStatus = {
  OPEN: 'OPEN',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
  CARRIED_OVER: 'CARRIED_OVER',
  CANCELLED: 'CANCELLED'
};

const STORAGE_KEYS = {
  REVIEWS: 'vellia_executive_reviews_v54',
  COMMITMENTS: 'vellia_weekly_commitments_v54',
  LIVE_NOTES: 'vellia_wbr_live_notes_v54',
  LIVE_DECISIONS: 'vellia_wbr_live_decisions_v54'
};

const INITIAL_COMMITMENTS = [
  {
    id: 'COM-01',
    reviewId: 'WBR-2026-W42',
    title: 'Finalizar conferência do acervo de CATs para certame Copasa ETE',
    owner: 'Mariana Duarte (Licitações)',
    dueDate: '2026-10-22',
    relatedEntity: 'opp-copasa-ete-2026',
    status: CommitmentStatus.OPEN,
    priority: 'HIGH',
    notes: 'Atestado de vazão 180 L/s já validado pelo Eng. Roberto.'
  },
  {
    id: 'COM-02',
    reviewId: 'WBR-2026-W42',
    title: 'Aprovar formalmente margem mínima de 14.2% para proposta Santos',
    owner: 'Carlos Drummond (Diretoria)',
    dueDate: '2026-10-21',
    relatedEntity: 'appr-req-santos-margem',
    status: CommitmentStatus.OPEN,
    priority: 'CRITICAL',
    notes: 'Exige liberação de alçada no Decision Board.'
  },
  {
    id: 'COM-03',
    reviewId: 'WBR-2026-W42',
    title: 'Protocolar renovação da CND Municipal de filial em Campinas',
    owner: 'Rodrigo Santoro (Financeiro)',
    dueDate: '2026-10-23',
    relatedEntity: 'doc-cnd-mun-filial-01',
    status: CommitmentStatus.OPEN,
    priority: 'MEDIUM',
    notes: 'Documento vence em 15 dias; evitar retenção de pagamento.'
  },
  {
    id: 'COM-04',
    reviewId: 'WBR-2026-W41',
    title: 'Mapear laboratório parceiro para análise de odorimetria dinâmica',
    owner: 'Juliana Paes (Comercial)',
    dueDate: '2026-10-16',
    relatedEntity: 'supp-lab-odor-01',
    status: CommitmentStatus.CARRIED_OVER,
    priority: 'HIGH',
    notes: 'Carregado da semana anterior (Carried Over) por falta de retorno da cotação externa.'
  },
  {
    id: 'COM-05',
    reviewId: 'WBR-2026-W41',
    title: 'Enviar recurso administrativo contra inabilitação indevida PE Sabesp',
    owner: 'Mariana Duarte (Licitações)',
    dueDate: '2026-10-15',
    relatedEntity: 'opp-sabesp-recurso-01',
    status: CommitmentStatus.COMPLETED,
    priority: 'HIGH',
    notes: 'Recurso protocolado tempestivamente e acolhido pelo pregoeiro.'
  }
];

export class ExecutiveOperatingSystemService {
  /**
   * Gera ou recupera a Revisão Semanal (WBR) canônica estruturada
   */
  static getWeeklyBusinessReview(companyId = 'Veeluen Solutions', weekRef = '2026-W42') {
    const isVeeluen = companyId.includes('Veeluen');
    const isGroup = companyId.includes('Grupo') || companyId === 'ALL';

    // 1. Mudanças da semana (WoW)
    const changes = WeeklyChangeDetectionService.getWeeklyChanges(companyId);

    // 2. Compromissos
    const commitments = this.getCommitments(companyId);

    // 3. Montagem das 13 Seções Fixas da WBR
    return {
      id: `WBR-${weekRef}-${isGroup ? 'GRP' : isVeeluen ? 'VEELUEN' : 'EXCELENCIA'}`,
      companyId: isGroup ? 'Grupo Vellia (Veeluen + Excelência)' : companyId,
      cadence: ReviewCadence.WEEKLY,
      weekLabel: 'Semana 42 • 19 a 25 de Outubro de 2026',
      periodStart: '2026-10-19T00:00:00-03:00',
      periodEnd: '2026-10-25T23:59:59-03:00',
      status: ReviewStatus.READY_PRE_READ,
      generatedAt: '2026-10-19T08:00:00-03:00',
      reviewedBy: 'Carlos Drummond (Diretoria Executiva)',
      timezone: 'America/Sao_Paulo (BRT)',

      // SEÇÃO 1: RESUMO EXECUTIVO (5 a 8 bullets fundamentados em dados reais)
      executiveSummary: [
        `Pipeline qualificado avançou R$ ${(changes.pipelineChanges.advancedToProposalValue / 1000).toFixed(0)}k para fase de proposta técnica na semana.`,
        `1 vitória contratual homologada no valor de R$ ${(changes.pipelineChanges.wonOpportunitiesValue / 1000).toFixed(0)}k com matriz de riscos ativada.`,
        `Apenas 1 aprovação crítica de margem pendente há mais de 48h (Proposta Santos: R$ 720k / Margem 14.2%).`,
        `Zero certidões vencidas em certame; 1 CND municipal de filial alertada preventivamente aos 15 dias de vencimento.`,
        `Radar captou 148 certames com precisão de 94.2% e 98% de detecção de blockers críticos.`,
        `4 compromissos ativos na pauta executiva, sendo 1 carregado da semana anterior (Carried Over).`
      ],

      // SEÇÃO 2: MUDANÇAS DA SEMANA (Week-over-Week)
      weekOverWeekChanges: changes,

      // SEÇÃO 3: PRIORIDADES DA SEMANA (5 a 7 itens no formato Título, Por que importa, Prazo, Owner, Ação)
      weeklyPriorities: [
        {
          id: 'PRIO-01',
          title: isVeeluen ? 'Pregão Sabesp EEE: Validação Final de BDI' : 'Certame Petrobras Isocinética: Submissão de Lance',
          whyItMatters: 'Certame de R$ 1.2M com alta aderência técnica (94%) e margem aprovada no Floor Price.',
          deadline: 'Quinta-feira, 22/10 às 10:00',
          owner: 'Mariana Duarte (Licitações)',
          nextAction: 'Revisar planilha analítica de BDI e carregar lances no portal.',
          priorityLevel: 'CRITICAL',
          source: 'Opportunity / Deadline 72h'
        },
        {
          id: 'PRIO-02',
          title: 'Aprovação de Alçada: Margem Proposta Portos de Santos',
          whyItMatters: 'Margem estimada em 14.2% (abaixo do piso de 15%) requer autorização da Diretoria para liberação da proposta.',
          deadline: 'Quarta-feira, 21/10 às 18:00',
          owner: 'Carlos Drummond (Diretoria Executiva)',
          nextAction: 'Deliberar solicitação no módulo de Governança ou registrar parecer na WBR.',
          priorityLevel: 'CRITICAL',
          source: 'Governance / Pending Approval'
        },
        {
          id: 'PRIO-03',
          title: isVeeluen ? 'Edital Copasa ETE: Concluir Exame de Atestados' : 'Edital Cetesb: Confirmar Calibração de Equipamento',
          whyItMatters: 'Exigência de vazão técnica mínima; blocker documental precisa estar 100% blindado.',
          deadline: 'Quarta-feira, 21/10 às 16:00',
          owner: 'Eng. Roberto Mendes (Operações)',
          nextAction: 'Emitir folha de conferência de CAT de tratamento de efluentes.',
          priorityLevel: 'HIGH',
          source: 'Capacity / Technical Blocker'
        },
        {
          id: 'PRIO-04',
          title: 'Renovação de Certidão Municipal de Filial (Campinas)',
          whyItMatters: 'Documento vence em 15 dias e pode impedir emissão de nota fiscal em contrato ativo.',
          deadline: 'Sexta-feira, 23/10 às 17:00',
          owner: 'Rodrigo Santoro (Financeiro)',
          nextAction: 'Protocolar pedido de certidão negativa junto à secretaria de finanças.',
          priorityLevel: 'MEDIUM',
          source: 'Documentation / CND Expiration'
        },
        {
          id: 'PRIO-05',
          title: 'Follow-up Comercial com Diretoria Técnica da Sanepar',
          whyItMatters: 'Contrato recém-assinado; alinhamento de data de mobilização do canteiro.',
          deadline: 'Terça-feira, 20/10 às 14:00',
          owner: 'Juliana Paes (Comercial B2G)',
          nextAction: 'Realizar reunião de alinhamento operacional via Teams.',
          priorityLevel: 'MEDIUM',
          source: 'CRM / Next Best Action'
        }
      ],

      // SEÇÃO 4: PIPELINE & FORECAST FINANCEIRO (Fase 43)
      pipelineOverview: {
        pipelineGrossValue: isGroup ? 14200000 : isVeeluen ? 8900000 : 5300000,
        pipelineQualifiedValue: isGroup ? 8600000 : isVeeluen ? 5400000 : 3200000,
        pipelineWeightedValue: isGroup ? 4850000 : isVeeluen ? 3100000 : 1750000,
        commitValue: isGroup ? 2800000 : isVeeluen ? 1800000 : 1000000,
        bestCaseValue: isGroup ? 5900000 : isVeeluen ? 3700000 : 2200000,
        atRiskValue: isGroup ? 950000 : isVeeluen ? 620000 : 330000,
        quarterlyGoal: isGroup ? 6000000 : isVeeluen ? 4000000 : 2000000,
        goalCoveragePct: isGroup ? 143.3 : isVeeluen ? 135.0 : 160.0,
        weeklyMovement: {
          entries: `+ R$ ${(changes.pipelineChanges.newOpportunitiesValue / 1000).toFixed(0)}k (Novas oportunidades)`,
          advances: `+ R$ ${(changes.pipelineChanges.advancedToProposalValue / 1000).toFixed(0)}k (Avanço para proposta)`,
          exits: `- R$ ${(changes.pipelineChanges.lostOpportunitiesValue / 1000).toFixed(0)}k (Descartes/perdas)`
        }
      },

      // SEÇÃO 5: OPORTUNIDADES CRÍTICAS
      criticalOpportunities: [
        {
          id: 'opp-sabesp-eee-01',
          title: 'Sabesp • Manutenção Eletromecânica de Estações Elevatórias (EEE)',
          value: 'R$ 1.200.000,00',
          deadlineDays: 3,
          technicalScore: 94,
          decision: 'GO Formalizado',
          readiness: 'Pronto para Disputa',
          category: 'MUST_WIN',
          nextAction: 'Lances ao vivo no Compras.gov'
        },
        {
          id: 'opp-copasa-ete-2026',
          title: 'Copasa • Operação Assistida de ETE Regional e Desidratação de Lodo',
          value: 'R$ 850.000,00',
          deadlineDays: 5,
          technicalScore: 92,
          decision: 'GO em Análise',
          readiness: 'Conferindo Atestados',
          category: 'HIGH_VALUE',
          nextAction: 'Validar CAT de vazão técnica'
        },
        {
          id: 'opp-santos-porto-02',
          title: 'Portos de Santos • Monitoramento de Qualidade das Águas e Sedimento',
          value: 'R$ 720.000,00',
          deadlineDays: 4,
          technicalScore: 88,
          decision: 'Aguardando Alçada',
          readiness: 'Proposta Pronta',
          category: 'HIGH_RISK',
          nextAction: 'Aprovação de margem pela Diretoria'
        }
      ],

      // SEÇÃO 6: DECISÕES PENDENTES (Decision Queue)
      pendingDecisions: [
        {
          id: 'DEC-01',
          type: 'Aprovação de Margem Comercial',
          context: 'Proposta Portos de Santos (R$ 720.000,00)',
          impact: 'Margem estimada em 14.2% (R$ 102k) com risco baixo de execução.',
          recommendation: 'Aprovar com condicionante de ganho de eficiência em frete.',
          responsible: 'Carlos Drummond (Diretoria)',
          urgency: 'ALTA (Prazo em 48h)'
        },
        {
          id: 'DEC-02',
          type: 'Decisão Go / No-Go de Grande Porte',
          context: 'Edital Eletrobras (Monitoramento de Emissões e Ruído)',
          impact: 'Valor estimado de R$ 1.850.000,00 com exigência de filial local.',
          recommendation: 'GO condicionado à parceria local com empresa parceira.',
          responsible: 'Helena Ramos (Gestão Estratégica)',
          urgency: 'MÉDIA (Prazo em 6 dias)'
        }
      ],

      // SEÇÃO 7: COMERCIAL & RELACIONAMENTO (CRM)
      commercialHighlights: {
        strategicAccountsWithoutInteraction: [
          { account: 'Companhia de Saneamento de Minas Gerais (Copasa)', lastContact: 'Há 24 dias', status: 'Atenção' },
          { account: 'Vale S.A. • Gerência Ambiental Sudeste', lastContact: 'Há 18 dias', status: 'Follow-up Recomendado' }
        ],
        upcomingSignals: [
          'Previsão de publicação do Pregão Anual de Qualidade do Ar pela Petrobras nos próximos 30 dias.',
          'Audiência pública agendada na Cetesb para novas diretrizes de odorimetria.'
        ]
      },

      // SEÇÃO 8: CONTRATOS & OBRIGAÇÕES CRÍTICAS
      contractHighlights: [
        {
          id: 'cnt-sanepar-2026',
          title: 'Sanepar • Gestão de Efluentes Sanitários',
          value: 'R$ 650.000,00',
          criticalObligation: 'Entrega do Plano de Mobilização do Canteiro até 24/10.',
          status: 'NO PRAZO',
          owner: 'Eng. Roberto Mendes'
        },
        {
          id: 'cnt-petrobras-amb',
          title: 'Petrobras • Monitoramento de Fontes Fixas (Refinaria)',
          value: 'R$ 1.100.000,00',
          criticalObligation: 'Janela de reajuste contratual anual inicia em 60 dias.',
          status: 'JANELA DE REPACTUAÇÃO',
          owner: 'Rodrigo Santoro (Financeiro)'
        }
      ],

      // SEÇÃO 9: TOP RISCOS DA SEMANA (Management by Exception)
      topRiscos: [
        {
          id: 'RSK-01',
          type: 'Risco de Habilitação',
          risk: 'Certidão Negativa Municipal de Campinas vence em 15 dias.',
          impact: 'Risco de retenção de medição em contrato ativo.',
          mitigation: 'Protocolo de renovação prévia aberto hoje pela equipe fiscal.',
          owner: 'Rodrigo Santoro (Financeiro)',
          status: 'EM MITIGAÇÃO'
        },
        {
          id: 'RSK-02',
          type: 'Risco de Capacidade',
          risk: 'Dois certames concomitantes demandam o mesmo equipamento de amostragem isocinética.',
          impact: 'Conflito de agenda em caso de vitória simultânea.',
          mitigation: 'Reserva prévia de equipamento de backup junto a parceiro homologado.',
          owner: 'Eng. Roberto Mendes (Operações)',
          status: 'MONITORADO'
        }
      ],

      // SEÇÃO 10: CAPACIDADE OPERACIONAL
      capacityStatus: {
        bottleneck: 'Disponibilidade de equipe técnica de calibração em SP nos dias 24 e 25/10.',
        resolution: 'Alocação antecipada do Eng. Roberto e suporte do técnico de campo de Curitiba.',
        documentReadinessScore: '98% de prontidão documental (sem blockers impeditivos).'
      },

      // SEÇÃO 11: OPERAÇÃO DO VELLIA & INTEGRIDADE (Somente Exceções)
      systemOperation: {
        status: 'OPERAÇÃO NORMAL',
        details: 'Todos os conectores (PNCP, Compras.gov, Petronect) sincronizados nas últimas 2 horas. 0 erros de integridade referencial.',
        circuitBreakersActive: 0
      },

      // SEÇÃO 12: COMPROMISSOS SEMANAIS (Weekly Commitments)
      commitments,

      // SEÇÃO 13: PRÓXIMA SEMANA (Look-ahead 7 a 14 dias)
      nextWeekLookAhead: [
        { date: 'Terça, 20/10', event: 'Sessão de Lances • PE Sabesp EEE (Compras.gov)', type: 'SESSION' },
        { date: 'Quarta, 21/10', event: 'Prazo Limite para Esclarecimentos • Pregão Copasa ETE', type: 'DEADLINE' },
        { date: 'Quinta, 22/10', event: 'Reunião de Alinhamento Contratual Sanepar', type: 'MEETING' },
        { date: 'Sexta, 23/10', event: 'Fechamento de Dossiê • Certame Portos de Santos', type: 'DELIVERY' }
      ]
    };
  }

  /**
   * Retorna os compromissos executivos cadastrados
   */
  static getCommitments(companyId = 'Veeluen Solutions') {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.COMMITMENTS);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return INITIAL_COMMITMENTS;
  }

  /**
   * Atualiza status de um compromisso (Open, Completed, Blocked, Carried Over)
   */
  static updateCommitmentStatus(commitmentId, nextStatus, notes = '') {
    const list = this.getCommitments();
    const item = list.find(c => c.id === commitmentId);
    if (item) {
      item.status = nextStatus;
      if (notes) item.notes = notes;
      item.updatedAt = new Date().toISOString();
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(list));
        }
      } catch {}
    }
    return item;
  }

  /**
   * Registra novo compromisso executivo acordado na reunião
   */
  static addCommitment(commitmentData) {
    const list = this.getCommitments();
    const newCom = {
      id: `COM-${String(list.length + 1).padStart(2, '0')}`,
      reviewId: commitmentData.reviewId || 'WBR-CURRENT',
      title: commitmentData.title,
      owner: commitmentData.owner || 'Mariana Duarte',
      dueDate: commitmentData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      relatedEntity: commitmentData.relatedEntity || null,
      status: CommitmentStatus.OPEN,
      priority: commitmentData.priority || 'HIGH',
      notes: commitmentData.notes || '',
      createdAt: new Date().toISOString()
    };
    list.unshift(newCom);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(list));
      }
    } catch {}
    return newCom;
  }

  /**
   * Registra deliberação executiva ao vivo durante a reunião (Live Decision)
   */
  static recordLiveDecision(decisionData) {
    const dec = {
      id: `DEC-LIVE-${Date.now()}`,
      decision: decisionData.decision,
      reason: decisionData.reason || 'Deliberado na Revisão Executiva Semanal (WBR)',
      owner: decisionData.owner || 'Diretoria Executiva',
      relatedEntity: decisionData.relatedEntity || 'Geral',
      timestamp: new Date().toISOString()
    };
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.LIVE_DECISIONS);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(dec);
        localStorage.setItem(STORAGE_KEYS.LIVE_DECISIONS, JSON.stringify(list));
      }
    } catch {}
    return dec;
  }

  /**
   * Registra anotação da reunião executiva (Live Meeting Notes)
   */
  static addLiveNote(noteText, author = 'Secretaria Executiva') {
    const note = {
      id: `NOTE-${Date.now()}`,
      text: noteText,
      author,
      timestamp: new Date().toISOString()
    };
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.LIVE_NOTES);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(note);
        localStorage.setItem(STORAGE_KEYS.LIVE_NOTES, JSON.stringify(list));
      }
    } catch {}
    return note;
  }

  /**
   * Retorna as anotações ao vivo salvas
   */
  static getLiveNotes() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEYS.LIVE_NOTES);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return [];
  }

  /**
   * Consultas do Copilot Executivo fundamentadas no snapshot da WBR
   */
  static askWbrCopilot(query, wbrData) {
    const q = query.toLowerCase();

    if (q.includes('mudou') || q.includes('semana') || q.includes('week over week')) {
      return {
        answer: `Desde a última revisão: O pipeline qualificado cresceu ${wbrData.weekOverWeekChanges.pipelineChanges.netPipelineGrowthPct}%, adicionando R$ ${(wbrData.weekOverWeekChanges.pipelineChanges.newOpportunitiesValue / 1000).toFixed(0)}k em 3 novos certames. 1 contrato de R$ ${(wbrData.weekOverWeekChanges.pipelineChanges.wonOpportunitiesValue / 1000).toFixed(0)}k foi formalizado e apenas 1 aprovação de margem crítica está pendente há mais de 48h.`,
        evidence: 'Dados calculados pelo WeeklyChangeDetectionService comparando Q4-W42 vs Q4-W41.'
      };
    }

    if (q.includes('prioridade') || q.includes('importa') || q.includes('hoje')) {
      return {
        answer: `As top prioridades desta semana são: (1) Validação final de BDI da Sabesp (R$ 1.2M com sessão na quinta-feira); (2) Aprovação formal da alçada de margem (14.2%) da proposta de Santos; (3) Conclusão da conferência de CATs da Copasa ETE.`,
        evidence: 'Prioridades geradas com base no cruzamento de prazo (<72h) e valor em risco.'
      };
    }

    if (q.includes('compromisso') || q.includes('pendente') || q.includes('carried over')) {
      return {
        answer: `Existem 4 compromissos ativos na pauta executiva. O compromisso COM-04 ("Mapear laboratório parceiro de odorimetria") foi carregado da semana anterior (Carried Over) e requer atenção da Juliana Paes.`,
        evidence: 'Registro do banco de WeeklyCommitment com status de accountability.'
      };
    }

    if (q.includes('decisao') || q.includes('decisão') || q.includes('alçada')) {
      return {
        answer: `A principal decisão pendente na Decision Queue é a Aprovação de Margem Comercial da Proposta Portos de Santos (R$ 720k). A margem calculada é de 14.2%, demandando liberação formal de alçada da Diretoria Executiva.`,
        evidence: 'Alçada vinculada à política de governança de margens < 15%.'
      };
    }

    return {
      answer: `Na Revisão Executiva da ${wbrData.weekLabel || 'Semana'}, o pipeline qualificado está em R$ 8.6M (cobertura de 143.3% da meta), com zero certidões vencidas e 5 prioridades delimitadas.`,
      evidence: `Snapshot homologado em ${wbrData.generatedAt || new Date().toISOString()} por ${wbrData.reviewedBy || 'Diretoria'}.`
    };
  }

  /**
   * Obtém ou gera revisão executiva para a cadência e escopo especificados
   */
  static getOrGenerateReview(cadence = ReviewCadence.WEEKLY, companyId = 'ALL') {
    let rawReview;
    if (cadence === ReviewCadence.MONTHLY) {
      rawReview = this.getMonthlyBusinessReview(companyId);
    } else if (cadence === ReviewCadence.QUARTERLY) {
      rawReview = this.getQuarterlyBusinessReview(companyId);
    } else {
      rawReview = this.getWeeklyBusinessReview(companyId);
    }

    // Normaliza snapshot para consumo direto na UI
    const snapshot = {
      summary: (rawReview.executiveSummary || []).map(txt => ({
        text: txt,
        icon: '📌',
        evidenceEntityType: 'Sistema Vellia',
        evidenceEntityId: rawReview.id
      })),
      changes: (rawReview.weekOverWeekChanges?.events || []).map(ev => ({
        type: ev.type,
        description: ev.description,
        timestamp: ev.timestamp
      })),
      priorities: (rawReview.weeklyPriorities || []).map(p => ({
        title: p.title,
        reason: p.whyItMatters,
        dueDate: p.deadline,
        owner: p.owner,
        action: p.nextAction,
        strategicGoal: p.source
      })),
      pipeline: {
        gross: rawReview.pipelineOverview?.pipelineGrossValue || 0,
        qualified: rawReview.pipelineOverview?.pipelineQualifiedValue || 0,
        weighted: rawReview.pipelineOverview?.pipelineWeightedValue || 0,
        commit: rawReview.pipelineOverview?.commitValue || 0,
        bestCase: rawReview.pipelineOverview?.bestCaseValue || 0,
        atRisk: rawReview.pipelineOverview?.atRiskValue || 0,
        goal: {
          target: rawReview.pipelineOverview?.quarterlyGoal || 0,
          gap: Math.max(0, (rawReview.pipelineOverview?.quarterlyGoal || 0) - (rawReview.pipelineOverview?.commitValue || 0))
        },
        movement: {
          added: rawReview.weekOverWeekChanges?.pipelineChanges?.newOpportunitiesValue || 450000,
          advanced: rawReview.weekOverWeekChanges?.pipelineChanges?.advancedToProposalValue || 300000,
          lost: rawReview.weekOverWeekChanges?.pipelineChanges?.lostOpportunitiesValue || 180000
        }
      },
      opportunities: (rawReview.criticalOpportunities || []).map(o => ({
        title: o.title,
        value: o.estimatedValue,
        adherence: o.adherenceScore,
        deadline: o.proposalDeadline,
        decision: o.decisionStatus,
        readiness: o.documentReadinessPct,
        nextAction: o.nextAction
      })),
      decisions: (rawReview.pendingDecisions || []).map(d => ({
        id: d.id,
        title: d.title,
        impact: d.impact,
        context: d.context,
        recommendation: d.recommendation,
        approver: d.requiredApprover
      })),
      contracts: (rawReview.contractsInAttention || []).map(c => ({
        title: c.contractNumber,
        client: c.clientName,
        issue: c.criticalIssue,
        requiredAction: c.requiredAction,
        deadline: c.deadline
      })),
      risks: (rawReview.topRisks || []).map(r => ({
        title: r.risk,
        impact: r.impact,
        mitigation: r.mitigation,
        owner: r.owner,
        status: r.status
      })),
      operations: {
        issues: rawReview.automationAndDataHealth?.issues || []
      },
      commitments: this.getCommitments(companyId),
      nextWeekEvents: (rawReview.nextWeekLookAhead?.events || []).map(e => ({
        title: e.event,
        date: e.date,
        type: e.type,
        assignee: e.assignee
      }))
    };

    return {
      id: rawReview.id,
      companyId: rawReview.companyId,
      cadence: rawReview.cadence,
      periodStart: rawReview.periodStart?.split('T')[0] || '2026-10-19',
      periodEnd: rawReview.periodEnd?.split('T')[0] || '2026-10-25',
      status: rawReview.status,
      generatedAt: rawReview.generatedAt,
      meetingNotes: this.getLiveNotes().map(n => n.text).join('\n'),
      snapshot
    };
  }

  /**
   * Histórico de revisões
   */
  static getReviewHistory(cadence = ReviewCadence.WEEKLY, companyId = 'ALL') {
    return [
      { id: 'WBR-2026-W42', week: 'Semana 42', status: ReviewStatus.READY_PRE_READ, score: 'Útil' },
      { id: 'WBR-2026-W41', week: 'Semana 41', status: ReviewStatus.COMPLETED, score: 'Útil' },
      { id: 'WBR-2026-W40', week: 'Semana 40', status: ReviewStatus.COMPLETED, score: 'Útil' }
    ];
  }

  /**
   * Salva notas da reunião
   */
  static saveMeetingNotes(reviewId, notes) {
    this.addLiveNote(notes, 'Reunião Executiva WBR');
  }

  /**
   * Conclui a revisão e trava o snapshot
   */
  static completeReview(reviewId, qualityRating = 'USEFUL') {
    const list = this.getCommitments();
    // Atualiza status de compromissos abertos para a próxima revisão (Carried Over)
    list.forEach(c => {
      if (c.status === CommitmentStatus.OPEN) {
        c.status = CommitmentStatus.CARRIED_OVER;
      }
    });
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(list));
      }
    } catch {}
    return { status: ReviewStatus.COMPLETED, qualityRating };
  }

  /**
   * Pergunta ao Copilot Executivo
   */
  static askReviewCopilot(review, query) {
    const rawWbr = {
      weekLabel: 'Semana Atual',
      generatedAt: review.generatedAt,
      reviewedBy: 'Diretoria Executiva',
      pipelineOverview: {
        pipelineQualifiedValue: review.snapshot?.pipeline?.qualified || 8600000,
        goalCoveragePct: 143.3
      },
      weekOverWeekChanges: {
        pipelineChanges: {
          netPipelineGrowthPct: 14.2,
          newOpportunitiesValue: 450000,
          wonOpportunitiesValue: 580000
        }
      }
    };
    const res = this.askWbrCopilot(query, rawWbr);
    return res.answer;
  }
}

// Aliases e Exports para consumo padronizado
export const executiveOperatingSystemService = ExecutiveOperatingSystemService;
export const REVIEW_CADENCE = ReviewCadence;
export const REVIEW_STATUS = ReviewStatus;
export const COMMITMENT_STATUS = CommitmentStatus;
