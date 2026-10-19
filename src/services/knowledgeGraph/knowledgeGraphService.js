/**
 * VELLIA LICITAÇÕES — FASE 39
 * KNOWLEDGE GRAPH SERVICE (Rede de Conhecimento Empresarial Conectada)
 * 
 * Princípio Central:
 * O Vellia funciona como uma rede de conhecimento conectada onde:
 * "Tudo pode ser encontrado. Tudo pode ser relacionado. Tudo pode ser rastreado."
 * 
 * Suporta relações canônicas, proveniência (data lineage), status de confiança
 * (CONFIRMED, INFERRED, SUGGESTED) e visualização de grafo contextual local.
 */

export const RelationType = {
  ORGANIZATION_HAS_CONTACT: 'HAS_CONTACT',
  ORGANIZATION_HAS_OPPORTUNITY: 'HAS_OPPORTUNITY',
  OPPORTUNITY_HAS_PROPOSAL: 'HAS_PROPOSAL',
  OPPORTUNITY_REQUIRES: 'REQUIRES',
  REQUIREMENT_SUPPORTED_BY: 'SUPPORTED_BY',
  ATTESTATION_HAS_ART: 'HAS_ART',
  ATTESTATION_HAS_CAT: 'HAS_CAT',
  PROPOSAL_USES_DOSSIER: 'USES_DOSSIER',
  RESULT_GENERATES_CONTRACT: 'GENERATES_CONTRACT',
  CONTRACT_ORIGINATED_FROM: 'ORIGINATED_FROM',
  CONTRACT_MAY_GENERATE: 'MAY_GENERATE_SIGNAL',
  FUTURE_SIGNAL_DERIVED_FROM: 'DERIVED_FROM',
  DECISION_APPLIES_TO: 'APPLIES_TO',
  LESSON_DERIVED_FROM: 'DERIVED_FROM',
  LESSON_APPLIES_TO: 'APPLIES_TO',
  CONTACT_WORKS_AT: 'WORKS_AT',
  OPPORTUNITY_RELATES_TO_SERVICE: 'RELATES_TO_SERVICE',
  OPPORTUNITY_ASSIGNED_TO_COMPANY: 'ASSIGNED_TO_COMPANY'
};

export const RelationStatus = {
  CONFIRMED: 'CONFIRMED', // Confirmado por humano ou origem documental oficial
  INFERRED: 'INFERRED',   // Inferido por motor de regras ou workflow
  SUGGESTED: 'SUGGESTED'  // Sugerido por semântica de IA com necessidade de validação
};

export const EntityCategory = {
  ORGANIZATION: 'ORGANIZATION',
  CONTACT: 'CONTACT',
  OPPORTUNITY: 'OPPORTUNITY',
  PROPOSAL: 'PROPOSAL',
  CONTRACT: 'CONTRACT',
  DOCUMENT: 'DOCUMENT',
  ATTESTATION: 'ATTESTATION',
  ART_CAT: 'ART_CAT',
  REQUIREMENT: 'REQUIREMENT',
  DECISION: 'DECISION',
  SERVICE: 'SERVICE',
  DOSSIER: 'DOSSIER',
  COMPANY: 'COMPANY',
  LESSON_LEARNED: 'LESSON_LEARNED'
};

const STORAGE_KEY_GRAPH = 'vellia_knowledge_graph_v39';

class KnowledgeGraphService {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.initDefaultGraph();
  }

  initDefaultGraph() {
    const saved = localStorage.getItem(STORAGE_KEY_GRAPH);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.edges) {
          this.nodes = new Map(Object.entries(parsed.nodes));
          this.edges = parsed.edges;
          return;
        }
      } catch (e) {
        console.warn('Erro ao carregar grafo do localStorage, inicializando defaults', e);
      }
    }

    this.buildSeedGraph();
    this.saveState();
  }

  saveState() {
    try {
      const serialized = {
        nodes: Object.fromEntries(this.nodes),
        edges: this.edges,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY_GRAPH, JSON.stringify(serialized));
    } catch (e) {
      console.warn('Não foi possível persistir grafo em localStorage', e);
    }
  }

  addNode(id, type, label, data = {}) {
    this.nodes.set(id, {
      id,
      type,
      label,
      data,
      companyScope: data.companyScope || 'Veeluen',
      updatedAt: new Date().toISOString()
    });
  }

  addEdge(sourceId, targetId, relationType, options = {}) {
    // Evita duplicatas exatas
    const exists = this.edges.some(
      e => e.source === sourceId && e.target === targetId && e.type === relationType
    );
    if (!exists) {
      this.edges.push({
        id: `EDGE-${sourceId}-${relationType}-${targetId}`,
        source: sourceId,
        target: targetId,
        type: relationType,
        status: options.status || RelationStatus.CONFIRMED,
        confidence: options.confidence ?? 1.0,
        sourceOrigin: options.sourceOrigin || 'Sistema Vellia',
        provenance: options.provenance || {
          extractedAt: new Date().toISOString(),
          confirmedBy: options.confirmedBy || 'Sistema Integrado'
        },
        validFrom: options.validFrom || new Date().toISOString(),
        validTo: options.validTo || null
      });
    }
  }

  buildSeedGraph() {
    // 1. Organizações
    this.addNode('ORG-PETROBRAS-RNEST', EntityCategory.ORGANIZATION, 'Petrobras — Refinaria Abreu e Lima (RNEST)', {
      cnpj: '33.000.167/0842-88',
      segment: 'Óleo e Gás',
      city: 'Ipojuca - PE',
      companyScope: 'Veeluen',
      strategicTier: 'Estratégico'
    });

    this.addNode('ORG-UFPE', EntityCategory.ORGANIZATION, 'Universidade Federal de Pernambuco (UFPE)', {
      cnpj: '24.134.488/0001-08',
      segment: 'Educação Superior',
      city: 'Recife - PE',
      companyScope: 'Excelência',
      strategicTier: 'Alta Prioridade'
    });

    this.addNode('ORG-COMPESA', EntityCategory.ORGANIZATION, 'COMPESA — Companhia Pernambucana de Saneamento', {
      cnpj: '09.769.035/0001-64',
      segment: 'Saneamento / Água',
      city: 'Recife - PE',
      companyScope: 'Veeluen',
      strategicTier: 'Estratégico'
    });

    // 2. Contatos
    this.addNode('CONT-MARCELO-PETROBRAS', EntityCategory.CONTACT, 'Eng. Marcelo Cavalcanti', {
      role: 'Gerente de Manutenção Industrial',
      email: 'marcelo.cavalcanti@petrobras.com.br',
      phone: '(81) 98844-3321',
      orgId: 'ORG-PETROBRAS-RNEST'
    });
    this.addEdge('ORG-PETROBRAS-RNEST', 'CONT-MARCELO-PETROBRAS', RelationType.ORGANIZATION_HAS_CONTACT);
    this.addEdge('CONT-MARCELO-PETROBRAS', 'ORG-PETROBRAS-RNEST', RelationType.CONTACT_WORKS_AT);

    this.addNode('CONT-DRA-REGINA-UFPE', EntityCategory.CONTACT, 'Profa. Dra. Regina Vasconcelos', {
      role: 'Diretora do Dpto. de Engenharia Química',
      email: 'regina.vasconcelos@ufpe.br',
      phone: '(81) 2126-8012',
      orgId: 'ORG-UFPE'
    });
    this.addEdge('ORG-UFPE', 'CONT-DRA-REGINA-UFPE', RelationType.ORGANIZATION_HAS_CONTACT);
    this.addEdge('CONT-DRA-REGINA-UFPE', 'ORG-UFPE', RelationType.CONTACT_WORKS_AT);

    // 3. Oportunidades
    this.addNode('OPP-2026-7841', EntityCategory.OPPORTUNITY, 'PE 048/2026 — Monitoramento de Emissões Atmosféricas (RNEST)', {
      portalNumber: '7004128956',
      source: 'Petronect',
      client: 'Petrobras',
      value: 2450000,
      deadline: '8 dias',
      companyScope: 'Veeluen'
    });
    this.addEdge('ORG-PETROBRAS-RNEST', 'OPP-2026-7841', RelationType.ORGANIZATION_HAS_OPPORTUNITY);

    this.addNode('OPP-2026-9021', EntityCategory.OPPORTUNITY, 'PE 014/2026 — O&M de ETE Industrial Compacta', {
      portalNumber: '90023/2026',
      source: 'PNCP',
      client: 'COMPESA',
      value: 1850000,
      deadline: '4 dias',
      companyScope: 'Veeluen'
    });
    this.addEdge('ORG-COMPESA', 'OPP-2026-9021', RelationType.ORGANIZATION_HAS_OPPORTUNITY);

    // 4. Propostas
    this.addNode('PROP-2026-7841-A', EntityCategory.PROPOSAL, 'Proposta Comercial Vellia — PE 048/2026 RNEST', {
      status: 'Aprovada na Governança',
      totalValue: 2280000,
      margin: 21.4,
      floorPrice: 2009000
    });
    this.addEdge('OPP-2026-7841', 'PROP-2026-7841-A', RelationType.OPPORTUNITY_HAS_PROPOSAL);

    // 5. Contratos Ativos & Conquistados
    this.addNode('CONT-2025-089', EntityCategory.CONTRACT, 'Contrato CT-4600058912/2025 — Inspeção NR-13 RNEST', {
      client: 'Petrobras',
      value: 1980000,
      vigencyEnd: '2027-04-15',
      status: 'Em vigência',
      companyScope: 'Veeluen'
    });
    this.addEdge('CONT-2025-089', 'OPP-2026-7841', RelationType.CONTRACT_MAY_GENERATE, {
      status: RelationStatus.CONFIRMED,
      sourceOrigin: 'Radar Antecipado / Fase 31'
    });
    this.addEdge('ORG-PETROBRAS-RNEST', 'CONT-2025-089', RelationType.RESULT_GENERATES_CONTRACT);

    // 6. Requisitos & Documentos Probatórios (Document Evidence)
    this.addNode('REQ-EMISSOES-ISOCINETICA', EntityCategory.REQUIREMENT, 'Requisito Editalício: Amostragem Isocinética de Dutos conforme EPA 5 / NBR 12019', {
      severity: 'Eliminatório',
      itemClause: 'Item 7.4.2 do Termo de Referência'
    });
    this.addEdge('OPP-2026-7841', 'REQ-EMISSOES-ISOCINETICA', RelationType.OPPORTUNITY_REQUIRES);

    this.addNode('DOC-ATEST-EMISSOES-2024', EntityCategory.ATTESTATION, 'Atestado de Capacidade Técnica — Braskem S/A (Dutos e Chaminés Industriais)', {
      issuer: 'Braskem S/A',
      registeredCrea: 'CREA-PE nº 2024-00918',
      validity: 'Permanente',
      volume: '148 campanhas isocinéticas'
    });
    this.addEdge('REQ-EMISSOES-ISOCINETICA', 'DOC-ATEST-EMISSOES-2024', RelationType.REQUIREMENT_SUPPORTED_BY, {
      status: RelationStatus.CONFIRMED,
      confidence: 0.98,
      provenance: {
        page: 4,
        section: 'Cláusula de Qualificação Técnica',
        confirmedBy: 'Dr. Henrique Veeluen (Diretoria)'
      }
    });

    this.addNode('ART-2024-BRASKEM', EntityCategory.ART_CAT, 'ART de Execução CREA-PE nº 2024-889128', {
      responsibleEngineer: 'Eng. Roberto Mendes (CREA 45.891-D/PE)',
      activity: 'Supervisão de Medições Atmosféricas'
    });
    this.addEdge('DOC-ATEST-EMISSOES-2024', 'ART-2024-BRASKEM', RelationType.ATTESTATION_HAS_ART);

    // 7. Decisão de Governança
    this.addNode('DEC-GO-7841', EntityCategory.DECISION, 'Decisão Go/No-Go: GO Estratégico com Reserva de Margem', {
      approvedBy: 'Comitê Executivo (Dr. Henrique + Roberto Mendes)',
      decidedAt: '2026-10-12T15:30:00Z',
      adherenceScore: 94
    });
    this.addEdge('DEC-GO-7841', 'OPP-2026-7841', RelationType.DECISION_APPLIES_TO);

    // Relação sugerida (SUGGESTED) para demonstrar resolução e auto-linking
    this.addEdge('ORG-UFPE', 'REQ-EMISSOES-ISOCINETICA', RelationType.OPPORTUNITY_REQUIRES, {
      status: RelationStatus.SUGGESTED,
      confidence: 0.72,
      sourceOrigin: 'Motor Semântico / Fase 39'
    });

    // 8. FASE 47: Lições Aprendidas & Closed-Loop Learning (Itens 83 & 84)
    this.addNode('LSN-001', EntityCategory.LESSON_LEARNED, 'Lição Aprovada: Custo Adicional de Mobilização Interestadual', {
      category: 'Pricing',
      status: 'Approved',
      service: 'Tratamento de Efluentes e Operação de ETE',
      recommendation: 'Adicionar contingência de 15% na mobilização de equipamentos para contratos fora de PE.'
    });
    this.addEdge('LSN-001', 'CTR-2026-PETRO-091', RelationType.LESSON_DERIVED_FROM, {
      status: RelationStatus.CONFIRMED,
      confidence: 1.0,
      sourceOrigin: 'ContractPerformanceReview / Fase 47'
    });
    this.addEdge('LSN-001', 'SRV-ETE-INDUSTRIAL', RelationType.LESSON_APPLIES_TO, {
      status: RelationStatus.CONFIRMED,
      confidence: 1.0,
      sourceOrigin: 'Governança de Aprendizado Vellia'
    });

    this.addNode('LSN-002', EntityCategory.LESSON_LEARNED, 'Lição Aprovada: Amostragem Duplicada para Testes Laboratoriais Críticos', {
      category: 'Operations',
      status: 'Approved',
      service: 'Monitoramento Contínuo de Emissões Atmosféricas',
      recommendation: 'Prever amostragem em duplicidade para evitar repetição de campanhas isocinéticas.'
    });
    this.addEdge('LSN-002', 'CTR-2026-PETRO-091', RelationType.LESSON_DERIVED_FROM, {
      status: RelationStatus.CONFIRMED,
      confidence: 1.0,
      sourceOrigin: 'ContractPerformanceReview / Fase 47'
    });
    this.addEdge('LSN-002', 'SRV-EMISSOES-ATMOSFERICAS', RelationType.LESSON_APPLIES_TO, {
      status: RelationStatus.CONFIRMED,
      confidence: 1.0,
      sourceOrigin: 'Governança de Aprendizado Vellia'
    });
  }

  getNode(id) {
    return this.nodes.get(id) || null;
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  getEdges() {
    return [...this.edges];
  }

  /**
   * Obtém a rede contextual local para uma entidade específica (Item 51 & 52)
   * Retorna os nós vizinhos (1º e 2º grau) e arestas associadas.
   */
  getLocalContextualGraph(centerId, depth = 1) {
    const centerNode = this.nodes.get(centerId);
    if (!centerNode) return { nodes: [], edges: [] };

    const visitedNodeIds = new Set([centerId]);
    const matchedEdges = [];

    // Nível 1
    this.edges.forEach(edge => {
      if (edge.source === centerId) {
        visitedNodeIds.add(edge.target);
        matchedEdges.push(edge);
      } else if (edge.target === centerId) {
        visitedNodeIds.add(edge.source);
        matchedEdges.push(edge);
      }
    });

    // Nível 2 (se solicitado)
    if (depth > 1) {
      const level1Ids = Array.from(visitedNodeIds);
      this.edges.forEach(edge => {
        if (level1Ids.includes(edge.source) && !visitedNodeIds.has(edge.target)) {
          visitedNodeIds.add(edge.target);
          matchedEdges.push(edge);
        } else if (level1Ids.includes(edge.target) && !visitedNodeIds.has(edge.source)) {
          visitedNodeIds.add(edge.source);
          matchedEdges.push(edge);
        }
      });
    }

    const resultNodes = Array.from(visitedNodeIds)
      .map(id => this.nodes.get(id))
      .filter(Boolean);

    return {
      centerNode,
      nodes: resultNodes,
      edges: matchedEdges
    };
  }

  /**
   * Rastreabilidade "Como chegamos aqui?" (Item 58 a 62)
   * Reconstrói a cadeia de derivação causal de um contrato ou oportunidade
   */
  getTraceabilityChain(entityId) {
    const chain = [];
    let currentId = entityId;
    let safetyCounter = 0;

    while (currentId && safetyCounter < 6) {
      safetyCounter++;
      const node = this.nodes.get(currentId);
      if (!node) break;

      chain.push(node);

      // Procura aresta de causalidade reversa
      const incomingCausalEdge = this.edges.find(
        e => e.target === currentId && [
          RelationType.CONTRACT_ORIGINATED_FROM,
          RelationType.RESULT_GENERATES_CONTRACT,
          RelationType.OPPORTUNITY_HAS_PROPOSAL,
          RelationType.ORGANIZATION_HAS_OPPORTUNITY,
          RelationType.CONTRACT_MAY_GENERATE,
          RelationType.DECISION_APPLIES_TO
        ].includes(e.type)
      );

      if (incomingCausalEdge) {
        currentId = incomingCausalEdge.source;
      } else {
        // Tenta achar na outra direção se modelada como ORIGINATED_FROM
        const reverseEdge = this.edges.find(
          e => e.source === currentId && e.type === RelationType.CONTRACT_ORIGINATED_FROM
        );
        currentId = reverseEdge ? reverseEdge.target : null;
      }
    }

    return chain;
  }

  /**
   * Obtém itens relacionados diretamente agrupados por categoria (Item 64 a 66)
   */
  getRelatedItems(entityId) {
    const connectedEdges = this.edges.filter(
      e => e.source === entityId || e.target === entityId
    );

    const related = {
      organizations: [],
      contacts: [],
      opportunities: [],
      proposals: [],
      contracts: [],
      documents: [],
      requirements: [],
      decisions: []
    };

    connectedEdges.forEach(edge => {
      const neighborId = edge.source === entityId ? edge.target : edge.source;
      const neighbor = this.nodes.get(neighborId);
      if (!neighbor) return;

      const itemWithMeta = {
        ...neighbor,
        relationType: edge.type,
        relationStatus: edge.status,
        confidence: edge.confidence,
        provenance: edge.provenance
      };

      switch (neighbor.type) {
        case EntityCategory.ORGANIZATION:
          related.organizations.push(itemWithMeta);
          break;
        case EntityCategory.CONTACT:
          related.contacts.push(itemWithMeta);
          break;
        case EntityCategory.OPPORTUNITY:
          related.opportunities.push(itemWithMeta);
          break;
        case EntityCategory.PROPOSAL:
          related.proposals.push(itemWithMeta);
          break;
        case EntityCategory.CONTRACT:
          related.contracts.push(itemWithMeta);
          break;
        case EntityCategory.DOCUMENT:
        case EntityCategory.ATTESTATION:
        case EntityCategory.ART_CAT:
          related.documents.push(itemWithMeta);
          break;
        case EntityCategory.REQUIREMENT:
          related.requirements.push(itemWithMeta);
          break;
        case EntityCategory.DECISION:
          related.decisions.push(itemWithMeta);
          break;
        default:
          break;
      }
    });

    return related;
  }

  /**
   * Resolução de Entidades & Aliases (Itens 70 a 83)
   */
  getEntityAliases() {
    return [
      {
        canonicalId: 'ORG-PETROBRAS-RNEST',
        canonicalName: 'Petrobras — Refinaria Abreu e Lima (RNEST)',
        cnpj: '33.000.167/0842-88',
        aliases: [
          'PETROBRAS',
          'Petróleo Brasileiro S.A.',
          'Petroleo Brasileiro SA',
          'RNEST',
          'Refinaria Abreu e Lima',
          'Petrobras Transporte S.A. - Transpetro'
        ],
        duplicateCandidates: [
          { name: 'Petrobras S/A E&P Bacia de Santos', cnpj: '33.000.167/0001-01', similarity: 0.92, reason: 'Mesma raiz de CNPJ e denominação corporativa' }
        ]
      },
      {
        canonicalId: 'ORG-COMPESA',
        canonicalName: 'COMPESA — Companhia Pernambucana de Saneamento',
        cnpj: '09.769.035/0001-64',
        aliases: [
          'COMPESA',
          'Companhia Pernambucana de Saneamento',
          'Cia Pernambucana de Saneamento'
        ],
        duplicateCandidates: []
      },
      {
        canonicalId: 'ORG-UFPE',
        canonicalName: 'Universidade Federal de Pernambuco (UFPE)',
        cnpj: '24.134.488/0001-08',
        aliases: [
          'UFPE',
          'Univ Federal de Pernambuco',
          'Universidade Federal PE'
        ],
        duplicateCandidates: []
      }
    ];
  }

  /**
   * Realiza o Merge seguro de duas entidades (Item 74 a 77)
   */
  mergeEntities(sourceId, targetCanonicalId, confirmedByUser) {
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetCanonicalId);
    if (!sourceNode || !targetNode) {
      throw new Error('Entidades inválidas para merge');
    }

    // Migra arestas da source para o target
    this.edges.forEach(edge => {
      if (edge.source === sourceId) edge.source = targetCanonicalId;
      if (edge.target === sourceId) edge.target = targetCanonicalId;
    });

    // Registra alias no target
    if (!targetNode.data.aliases) targetNode.data.aliases = [];
    targetNode.data.aliases.push(sourceNode.label);

    // Marca source como merged
    sourceNode.mergedInto = targetCanonicalId;
    sourceNode.mergedAt = new Date().toISOString();
    sourceNode.mergedBy = confirmedByUser;

    this.saveState();

    return {
      success: true,
      canonicalId: targetCanonicalId,
      message: `Entidade ${sourceNode.label} foi unificada com sucesso em ${targetNode.label}.`
    };
  }
}

export const knowledgeGraphService = new KnowledgeGraphService();
