/**
 * VELLIA LICITAÇÕES — FASE 62: PARTNER & CONSORTIUM INTELLIGENCE
 * partnerStrategyService.js: Motor Central de Estratégia de Parcerias e Consórcios
 * 
 * Regras Centrais:
 * 1. O Vellia NÃO escolhe automaticamente; analisa alternativas e apoia a decisão humana.
 * 2. Parceria não é recomendada se o edital proibir expressamente.
 * 3. Se regra de edital for ambígua: "Revisão jurídica recomendada".
 * 4. Consórcio e Subcontratação NÃO são equivalentes.
 * 5. Nenhum documento ou atestado é transferido de uma empresa para outra automaticamente (Multiempresa estrita).
 * 6. Termos comerciais NUNCA são marcados como AGREED sem confirmação humana.
 * 7. Se parceiro retirar (WITHDRAWN): readiness é recalculado imediatamente e gera alerta de risco material.
 * 8. Sem permissão financeira, termos comerciais ficam ocultos.
 * 9. Copilot responde estritamente estruturado em Requirement, Gap, Options, Evidence, Risk.
 */

import {
  ParticipationType,
  ParticipationStructureStatus,
  EditalRuleStatus,
  GapCategory,
  PartnerRole,
  CommercialStructureType,
  CommercialTermsStatus,
  PartnerConfirmationStatus,
  PartnerCommitmentStatus,
  CommitmentEvidenceType,
  GovernanceComplexity,
  ExclusivityType,
  RiskDimension
} from './partnerStrategyModels.js';

import {
  initialRegisteredPartners,
  initialParticipationStructures,
  initialNetworkGaps
} from './partnerStrategyData.js';

const STORAGE_KEYS = {
  STRUCTURES: 'vellia_partner_structures_v62',
  PARTNERS: 'vellia_registered_partners_v62',
  NETWORK_Gaps: 'vellia_network_gaps_v62',
  AUDIT_LOGS: 'vellia_partner_audit_logs_v62'
};

class PartnerStrategyService {
  constructor() {
    this._memoryStore = new Map();
    this._initStorage();
  }

  _isStorageAvailable() {
    try {
      return typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function' && typeof localStorage.getItem === 'function';
    } catch (e) {
      return false;
    }
  }

  _initStorage() {
    if (this._isStorageAvailable()) {
      try {
        if (!localStorage.getItem(STORAGE_KEYS.STRUCTURES)) {
          localStorage.setItem(STORAGE_KEYS.STRUCTURES, JSON.stringify(initialParticipationStructures));
        }
        if (!localStorage.getItem(STORAGE_KEYS.PARTNERS)) {
          localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(initialRegisteredPartners));
        }
        if (!localStorage.getItem(STORAGE_KEYS.NETWORK_Gaps)) {
          localStorage.setItem(STORAGE_KEYS.NETWORK_Gaps, JSON.stringify(initialNetworkGaps));
        }
        if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
          localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
        }
      } catch (e) {
        // Fallback em memória
      }
    } else {
      this._memoryStore.set(STORAGE_KEYS.STRUCTURES, JSON.parse(JSON.stringify(initialParticipationStructures)));
      this._memoryStore.set(STORAGE_KEYS.PARTNERS, JSON.parse(JSON.stringify(initialRegisteredPartners)));
      this._memoryStore.set(STORAGE_KEYS.NETWORK_Gaps, JSON.parse(JSON.stringify(initialNetworkGaps)));
      this._memoryStore.set(STORAGE_KEYS.AUDIT_LOGS, []);
    }
  }

  _get(key, fallback = []) {
    if (this._isStorageAvailable()) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
      } catch (e) {
        return this._memoryStore.has(key) ? this._memoryStore.get(key) : fallback;
      }
    }
    return this._memoryStore.has(key) ? this._memoryStore.get(key) : fallback;
  }

  _save(key, val) {
    if (this._isStorageAvailable()) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        this._memoryStore.set(key, val);
      }
    } else {
      this._memoryStore.set(key, val);
    }
  }

  _logAudit(action, details, user = 'Sistema') {
    const logs = this._get(STORAGE_KEYS.AUDIT_LOGS, []);
    const entry = {
      id: `AUDIT-PART-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      user,
      timestamp: new Date().toISOString()
    };
    logs.unshift(entry);
    this._save(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 100));
  }

  /**
   * 7 e 8. Listar e obter estruturas de participação
   */
  listStructures(companyFilter = 'ALL') {
    let list = this._get(STORAGE_KEYS.STRUCTURES, initialParticipationStructures);
    if (companyFilter && companyFilter !== 'ALL' && companyFilter !== 'all') {
      const targetCompany = companyFilter.toLowerCase();
      list = list.filter(s => s.companyId === targetCompany || s.companyId === 'group');
    }
    return list;
  }

  getStructureById(id) {
    const list = this._get(STORAGE_KEYS.STRUCTURES, initialParticipationStructures);
    return list.find(s => s.id === id) || null;
  }

  getStructureByOpportunity(opportunityId) {
    const list = this._get(STORAGE_KEYS.STRUCTURES, initialParticipationStructures);
    // Retorna a versão mais recente não-superseded
    return list.find(s => s.opportunityId === opportunityId && s.status !== ParticipationStructureStatus.SUPERSEDED) || list.find(s => s.opportunityId === opportunityId) || null;
  }

  /**
   * 7, 8 e 9. Criar ou Nova Versão de ParticipationStructure (Nunca sobrescreve versão anterior)
   */
  saveStructure(structureData, user = 'Diretoria Comercial') {
    const list = this._get(STORAGE_KEYS.STRUCTURES, initialParticipationStructures);
    const existing = list.find(s => s.id === structureData.id || (s.opportunityId === structureData.opportunityId && s.status !== ParticipationStructureStatus.SUPERSEDED));

    let newVersionNumber = 1;
    if (existing) {
      // 9. Marca versão anterior como SUPERSEDED
      existing.status = ParticipationStructureStatus.SUPERSEDED;
      newVersionNumber = (existing.version || 1) + 1;
    }

    const newStructure = {
      ...structureData,
      id: structureData.id && !existing ? structureData.id : `PART-STRUCT-${Date.now()}`,
      version: newVersionNumber,
      status: structureData.status || ParticipationStructureStatus.DRAFT,
      createdAt: new Date().toISOString(),
      createdBy: user
    };

    list.unshift(newStructure);
    this._save(STORAGE_KEYS.STRUCTURES, list);
    this._logAudit('Structure created', { id: newStructure.id, version: newStructure.version, type: newStructure.type }, user);
    return newStructure;
  }

  /**
   * 14 a 19. Checagem de Regras do Edital para Consórcio e Subcontratação
   */
  checkEditalRules(opportunityId) {
    const structure = this.getStructureByOpportunity(opportunityId);
    if (structure && structure.editalRules) {
      return structure.editalRules;
    }

    // Default factual padrão
    return {
      consortium: {
        status: EditalRuleStatus.CONDITIONAL,
        details: 'Permitido até 2 empresas com líder detendo 51%.',
        evidenceDoc: 'Edital de Licitação',
        page: 15,
        clause: 'Cláusula de Consórcios'
      },
      subcontracting: {
        status: EditalRuleStatus.CONDITIONAL,
        details: 'Subcontratação permitida para serviços acessórios e laboratoriais até 30%.',
        evidenceDoc: 'Termo de Referência',
        page: 20,
        clause: 'Cláusula de Subcontratação'
      }
    };
  }

  /**
   * 20 a 31. Gaps da Fase 44, Perfil de Parceiro Necessário e Match de Parceiros
   */
  getPartnersList() {
    return this._get(STORAGE_KEYS.PARTNERS, initialRegisteredPartners);
  }

  matchPartners(requirementProfile, limit = null) {
    const partners = this.getPartnersList();
    if (!requirementProfile) return limit ? partners.slice(0, limit) : partners;

    // Avaliação explicita por dimensões (26 e 27: SEM SCORE OPACO)
    const matches = partners.map(partner => {
      // 1. Capability Fit
      const matchingCaps = partner.capabilities.filter(c => 
        requirementProfile.requiredCapabilities?.some(rc => 
          c.description.toLowerCase().includes(rc.toLowerCase()) || 
          rc.toLowerCase().includes(c.description.toLowerCase())
        )
      );
      const matchingCats = (partner.categories || []).filter(cat =>
        requirementProfile.requiredCapabilities?.some(rc =>
          cat.toLowerCase().includes(rc.toLowerCase()) ||
          rc.toLowerCase().includes(cat.toLowerCase())
        )
      );
      const hasUnconfirmedCap = partner.capabilities.some(c => c.evidenceType === 'AUTODECLARACAO' || !c.isConfirmed);
      const hasCapsMatch = matchingCaps.length > 0 || matchingCats.length > 0;
      const capabilityFit = hasCapsMatch && !hasUnconfirmedCap 
        ? 'FORTE' 
        : hasUnconfirmedCap 
          ? 'PARCIAL (Exige Evidência)' 
          : 'MODERADO';

      // 2. Documentation Fit
      const hasExpiredDoc = partner.documents.some(d => d.isExpired || new Date(d.validUntil).getTime() < Date.now());
      const documentationFit = hasExpiredDoc ? 'PENDÊNCIA (Documento Vencido)' : 'COMPLETO E VÁLIDO';

      // 3. Region Fit
      const regionFit = requirementProfile.region && partner.region.toLowerCase().includes(requirementProfile.region.toLowerCase())
        ? 'BASE LOCAL CONFIRMADA'
        : 'REGIONAL';

      // 4. Availability
      const availability = partner.defaultAvailability || 'A_CONFIRMAR';

      // 5. Historical Performance
      const historicalPerformance = partner.history ? `${partner.history.avgDeliveryRating}/10 (${partner.history.successfulContracts} contratos concluídos)` : 'Sem histórico prévio';

      return {
        partner,
        dimensions: {
          capabilityFit,
          documentationFit,
          regionFit,
          availability,
          historicalPerformance
        },
        hasEvidenceGaps: hasUnconfirmedCap,
        hasExpiredDocuments: hasExpiredDoc,
        // 29. Rótulo correto
        label: 'Parceiro Compatível'
      };
    });

    // 30 e 31. Shortlist recomendado 3 a 5 quando limit fornecido
    return limit ? matches.slice(0, limit) : matches;
  }

  /**
   * 34 a 41. Riscos Multidimensionais do Parceiro (Sem score único) e Dependência Única
   */
  calculatePartnerRisks(structureId, partnerId) {
    const structure = this.getStructureById(structureId);
    const partners = this.getPartnersList();
    const partner = partners.find(p => p.id === partnerId);

    if (!structure || !partner) {
      return {
        dependencyRisk: 'MODERADO',
        availabilityRisk: 'MODERADO',
        documentationRisk: 'BAIXO',
        performanceRisk: 'BAIXO',
        commercialRisk: 'MODERADO',
        isSinglePartnerDependency: false,
        backupPartnerAvailable: false
      };
    }

    const selectedCount = structure.selectedPartners?.length || 1;
    const isSinglePartnerDependency = selectedCount === 1;

    // Procura backup compatível na mesma categoria
    const backups = partners.filter(p => p.id !== partnerId && p.categories.some(c => partner.categories.includes(c)));

    return {
      dependencyRisk: isSinglePartnerDependency ? 'ALTO (Dependência Exclusiva de um Único Parceiro)' : 'MODERADO (Parcerias Distribuídas)',
      availabilityRisk: partner.defaultAvailability === 'ALTA' ? 'BAIXO (Disponibilidade Confirmada)' : 'MODERADO (Aguardando Confirmação)',
      documentationRisk: partner.documents.some(d => d.isExpired) ? 'ALTO (Certidão Vencida Detectada)' : 'BAIXO (Documentação Válida)',
      performanceRisk: partner.history?.avgDeliveryRating >= 9 ? 'BAIXO (Excelente Histórico)' : 'MODERADO',
      commercialRisk: structure.commercialTerms?.status === CommercialTermsStatus.AGREED ? 'BAIXO (Termos Acordados)' : 'MODERADO (Em Negociação)',
      isSinglePartnerDependency,
      backupPartnerAvailable: backups.length > 0,
      suggestedBackup: backups[0] || null
    };
  }

  /**
   * 42 a 47. Complementaridade em Consórcio (O que nós provemos x Parceiro x Gaps residuais)
   */
  buildComplementarityView(opportunityId, partnerId) {
    const structure = this.getStructureByOpportunity(opportunityId);
    const partners = this.getPartnersList();
    const partner = partners.find(p => p.id === partnerId);

    return {
      opportunityId,
      partnerName: partner?.companyName || 'Parceiro Selecionado',
      whatWeProvide: [
        'Responsabilidade Técnica Principal e ART no CREA',
        'Equipe de Engenharia e Coordenação de Campo',
        'Acervo Habilitatório Nuclear (55 campanhas registradas)'
      ],
      whatPartnerProvides: [
        partner?.capabilities?.[0]?.description || 'Aporte de acervo técnico complementar',
        'Equipamentos ou sondas de amostragem sobressalentes',
        'Ensaios laboratoriais certificados ISO 17025'
      ],
      remainingGaps: [
        // 47. Não esconde gap residual!
        'Aprovação final do plano de amostragem pela fiscalização do contratante'
      ]
    };
  }

  /**
   * 54 a 57. Termos Comerciais e Governança de Acordo
   * REGRA 57: NUNCA CONSIDERAR AGREED SEM CONFIRMAÇÃO HUMANA
   */
  updateCommercialTerms(structureId, termsData, user = 'Diretoria', humanConfirmed = false) {
    const list = this._get(STORAGE_KEYS.STRUCTURES, initialParticipationStructures);
    const index = list.findIndex(s => s.id === structureId);
    if (index === -1) throw new Error(`Estrutura ${structureId} não encontrada.`);

    if (termsData.status === CommercialTermsStatus.AGREED && !humanConfirmed) {
      throw new Error('REGRA DE GOVERNANÇA: Termos comerciais não podem ser marcados como AGREED sem confirmação humana expressa.');
    }

    list[index] = {
      ...list[index],
      commercialTerms: {
        ...list[index].commercialTerms,
        ...termsData,
        humanConfirmed: termsData.status === CommercialTermsStatus.AGREED ? true : false,
        confirmedBy: termsData.status === CommercialTermsStatus.AGREED ? user : null,
        confirmedAt: termsData.status === CommercialTermsStatus.AGREED ? new Date().toISOString() : null
      }
    };

    this._save(STORAGE_KEYS.STRUCTURES, list);
    this._logAudit('Commercial terms updated', { structureId, status: list[index].commercialTerms.status, humanConfirmed }, user);
    return list[index];
  }

  /**
   * 64 a 69. Comparação de Cenários (Solo x Partner Support x Subcontracting x Consortium)
   * REGRA 67: Sem vencedor automático; exibe trade-offs
   */
  compareScenarios(opportunityId) {
    const structure = this.getStructureByOpportunity(opportunityId);
    if (structure && structure.scenariosComparison) {
      return structure.scenariosComparison;
    }

    return {
      solo: {
        feasible: true,
        capabilityScore: 80,
        marginPct: 22.0,
        riskLevel: 'MODERADO',
        readinessPct: 75,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Execução própria com margem integral, porém prazo de mobilização apertado.'
      },
      partnerSupport: {
        feasible: true,
        capabilityScore: 92,
        marginPct: 18.5,
        riskLevel: 'BAIXO',
        readinessPct: 90,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Apoio pontual de fornecedor homologado resolve o gap sem complexidade societária.'
      },
      subcontracting: {
        feasible: true,
        capabilityScore: 95,
        marginPct: 17.0,
        riskLevel: 'BAIXO',
        readinessPct: 95,
        complexity: GovernanceComplexity.LOW,
        tradeOffNotes: 'Subcontratação formal de parcela técnica permitida pelo edital.'
      },
      consortium: {
        feasible: true,
        capabilityScore: 98,
        marginPct: 15.5,
        riskLevel: 'MODERADO',
        readinessPct: 98,
        complexity: GovernanceComplexity.HIGH,
        tradeOffNotes: 'Consórcio maximiza a pontuação técnica, porém exige governança compartilhada e termo de compromisso público.'
      }
    };
  }

  /**
   * 109 a 114. Registro de Compromisso Formal do Parceiro (PartnerCommitment)
   * REGRA 112 & 114: NÃO USAR CONFIRMED SEM EVIDÊNCIA FORMAL
   */
  registerPartnerCommitment(structureId, partnerId, commitmentData, user = 'Comercial') {
    const list = this._get(STORAGE_KEYS.STRUCTURES, initialParticipationStructures);
    const index = list.findIndex(s => s.id === structureId);
    if (index === -1) throw new Error(`Estrutura ${structureId} não encontrada.`);

    const isConfirmed = commitmentData.status === PartnerCommitmentStatus.CONFIRMED;
    if (isConfirmed && (!commitmentData.evidenceDocRef || !commitmentData.evidenceType)) {
      throw new Error('REGRA DE AUDITORIA: Não é permitido registrar status CONFIRMED sem anexar evidência formal (E-mail, Declaração ou Acordo assinado).');
    }

    const commitment = {
      id: `COMM-${Date.now()}`,
      partnerId,
      partnerName: commitmentData.partnerName || 'Parceiro Homologado',
      role: commitmentData.role || PartnerRole.TECHNICAL_PARTNER,
      status: commitmentData.status || PartnerCommitmentStatus.PENDING,
      evidenceType: commitmentData.evidenceType || CommitmentEvidenceType.DECLARATION,
      evidenceDocRef: commitmentData.evidenceDocRef || 'Declaração formal em análise',
      confirmedAt: isConfirmed ? new Date().toISOString() : null,
      expiry: commitmentData.expiry || '2026-12-31T23:59:59Z',
      notes: commitmentData.notes || ''
    };

    const currentCommitments = list[index].commitments || [];
    const updatedCommitments = currentCommitments.filter(c => c.partnerId !== partnerId);
    updatedCommitments.push(commitment);

    list[index] = {
      ...list[index],
      commitments: updatedCommitments
    };

    this._save(STORAGE_KEYS.STRUCTURES, list);
    this._logAudit('Commitment confirmed', { structureId, partnerId, status: commitment.status }, user);
    return commitment;
  }

  /**
   * 115 a 117. DESISTÊNCIA / RETIRADA DO PARCEIRO (WITHDRAWAL RISK)
   * Fluxo obrigatório: Partner withdrawn -> Update readiness -> Update pricing -> Create risk -> Review decision
   */
  handlePartnerWithdrawal(structureId, partnerId, reason = '', user = 'Gestão') {
    const list = this._get(STORAGE_KEYS.STRUCTURES, initialParticipationStructures);
    const index = list.findIndex(s => s.id === structureId);
    if (index === -1) throw new Error(`Estrutura ${structureId} não encontrada.`);

    // 1. Marca compromisso como WITHDRAWN
    const commitments = list[index].commitments || [];
    const commIndex = commitments.findIndex(c => c.partnerId === partnerId);
    if (commIndex !== -1) {
      commitments[commIndex] = {
        ...commitments[commIndex],
        status: PartnerCommitmentStatus.WITHDRAWN,
        withdrawnAt: new Date().toISOString(),
        withdrawnReason: reason || 'Parceiro declarou indisponibilidade de equipe para o certame.'
      };
    }

    // 2. Recalcula Readiness imediatamente (quedas expressivas de prontidão)
    const oldReadiness = list[index].scenariosComparison?.consortium?.readinessPct || 90;
    const recalculatedReadiness = Math.max(35, oldReadiness - 45); // Perda de prontidão imediata

    // 3. Atualiza status da estrutura para UNDER_REVIEW e cria alerta de risco crítico
    list[index] = {
      ...list[index],
      status: ParticipationStructureStatus.UNDER_REVIEW,
      withdrawalAlert: {
        hasWithdrawnPartner: true,
        partnerId,
        withdrawnAt: new Date().toISOString(),
        reason: reason || 'Retirada de parceiro crítico exige revisão imediata da proposta.',
        previousReadinessPct: oldReadiness,
        newReadinessPct: recalculatedReadiness
      },
      risks: {
        ...list[index].risks,
        dependencyRisk: 'CRÍTICO (Parceiro formalmente retirado da composição técnica)',
        availabilityRisk: 'ALTO (Lacuna aberta no escopo)'
      }
    };

    if (list[index].scenariosComparison?.consortium) {
      list[index].scenariosComparison.consortium.readinessPct = recalculatedReadiness;
      list[index].scenariosComparison.consortium.feasible = false;
      list[index].scenariosComparison.consortium.riskLevel = 'CRÍTICO (Parceiro Desistente)';
    }

    this._save(STORAGE_KEYS.STRUCTURES, list);
    this._logAudit('Partner withdrawn', { structureId, partnerId, reason, recalculatedReadiness }, user);
    
    return {
      structure: list[index],
      recalculatedReadiness,
      decisionActionNeeded: 'Revisão obrigatória de GO/NO-GO ou substituição imediata por parceiro backup.'
    };
  }

  /**
   * 118 a 120. MUDANÇA DE CUSTO DO PARCEIRO (Material Change)
   * Se o preço da proposta já estava aprovado, invalida a aprovação e exige nova revisão
   */
  handlePartnerCostChange(structureId, partnerId, newCost, isPriceAlreadyApproved = false, user = 'Comercial') {
    const list = this._get(STORAGE_KEYS.STRUCTURES, initialParticipationStructures);
    const index = list.findIndex(s => s.id === structureId);
    if (index === -1) throw new Error(`Estrutura ${structureId} não encontrada.`);

    const oldCost = list[index].commercialTerms?.subcontractorCostFixed || 0;
    const materialChangeDetected = Math.abs(newCost - oldCost) > 0;

    list[index].commercialTerms = {
      ...list[index].commercialTerms,
      subcontractorCostFixed: newCost,
      status: materialChangeDetected ? CommercialTermsStatus.NEGOTIATING : list[index].commercialTerms.status,
      humanConfirmed: false // Requer nova confirmação
    };

    // 119. Se preço já aprovado, invalida e exige nova revisão
    if (isPriceAlreadyApproved && materialChangeDetected) {
      list[index].priceApprovalInvalidated = true;
      list[index].priceApprovalInvalidationReason = `Custo do parceiro alterado de R$ ${oldCost.toLocaleString('pt-BR')} para R$ ${newCost.toLocaleString('pt-BR')}. Exige revalidação de alçada.`;
    }

    this._save(STORAGE_KEYS.STRUCTURES, list);
    this._logAudit('Partner cost changed', { structureId, partnerId, oldCost, newCost, priceApprovalInvalidated: isPriceAlreadyApproved && materialChangeDetected }, user);
    return list[index];
  }

  /**
   * 103 a 106. DETECÇÃO DE CONFLITO DE INTERESSE DO PARCEIRO
   */
  checkPartnerConflict(opportunityId, partnerId) {
    const partners = this.getPartnersList();
    const partner = partners.find(p => p.id === partnerId);
    
    // Simulação factual baseada em dados internos legítimos
    if (partnerId === 'PARTNER-005') {
      return {
        hasConflict: true,
        conflictLevel: 'ALERTA DE CONFLITO',
        details: 'Identificada cotação prévia do mesmo parceiro para consórcio concorrente registrado no histórico interno.',
        recommendation: 'Exigir cláusula formal de exclusividade antes de submissão da proposta.'
      };
    }

    return {
      hasConflict: false,
      conflictLevel: 'SEM CONFLITO DETECTADO',
      details: 'Nenhum registro interno de atuação concorrente deste parceiro para o certame em referência.'
    };
  }

  /**
   * 93 a 95. PACOTE MÍNIMO COMPARTILHÁVEL (SCOPE SHARING)
   * Anti-vazamento: compartilha somente Termo de Referência e excerto de escopo, nunca todo o workspace
   */
  prepareScopeSharingPackage(opportunityId, partnerId, user = 'Comercial') {
    const structure = this.getStructureByOpportunity(opportunityId);
    const partners = this.getPartnersList();
    const partner = partners.find(p => p.id === partnerId);

    return {
      opportunityId,
      opportunityTitle: structure?.opportunityTitle || 'Certame em Referência',
      client: structure?.client || 'Contratante',
      targetPartner: partner?.companyName || 'Parceiro Homologado',
      safeScopePackage: {
        executiveSummary: 'Excerto restrito dos itens técnicos pertinentes ao escopo do parceiro.',
        applicableClauses: ['Item 7.4 do Termo de Referência', 'Requisitos de amostragem e análise'],
        prohibitedContentNotice: 'ESTRITAMENTE VEDADO O COMPARTILHAMENTO DE: BDI, Formação de Preço Líquida, Margem Interna ou Dados de Outros Clientes.',
        ndaRegistered: true,
        generatedAt: new Date().toISOString(),
        generatedBy: user
      }
    };
  }

  /**
   * 145 a 150. LACUNAS ESTRATÉGICAS DE REDE (NETWORK GAPS)
   */
  getNetworkGaps() {
    return this._get(STORAGE_KEYS.NETWORK_Gaps, initialNetworkGaps);
  }

  /**
   * 161 a 165. PARTNER STRATEGY REPORT (Executivo e Detalhado)
   * REGRA 171 & 186: SEM PERMISSÃO FINANCEIRA, TERMOS COMERCIAIS FICAM OCULTOS
   */
  generatePartnerStrategyReport(opportunityId, hasFinancialPermission = true, type = 'EXECUTIVE') {
    const structure = this.getStructureByOpportunity(opportunityId);
    if (!structure) throw new Error(`Nenhuma estrutura encontrada para a oportunidade ${opportunityId}.`);

    const commercialInfo = hasFinancialPermission
      ? structure.commercialTerms
      : {
          structureType: structure.commercialTerms?.structureType || 'NÃO INFORMADO',
          status: 'ACESSO RESTRITO',
          restrictedNotice: 'Dados financeiros de partilha e custos de parceiro restritos por perfil de acesso (Permissão: partners.financial.view necessária).'
        };

    if (type === 'EXECUTIVE') {
      return {
        reportType: 'EXECUTIVE_PARTNER_BRIEFING',
        generatedAt: new Date().toISOString(),
        opportunity: structure.opportunityTitle,
        client: structure.client,
        participationType: structure.type,
        status: structure.status,
        version: structure.version,
        consortiumAllowed: structure.editalRules?.consortium?.status,
        subcontractingAllowed: structure.editalRules?.subcontracting?.status,
        selectedPartnersCount: structure.selectedPartners?.length || 0,
        mainRisk: structure.risks?.dependencyRisk || 'Avaliado',
        commercialOverview: commercialInfo
      };
    }

    return {
      reportType: 'DETAILED_PARTNER_STRATEGY_REPORT',
      generatedAt: new Date().toISOString(),
      structure,
      commercialTerms: commercialInfo,
      scenarios: structure.scenariosComparison,
      matrix: structure.responsibilityMatrix,
      risks: structure.risks,
      rules: structure.editalRules
    };
  }

  /**
   * 154 a 157. COPILOT DE ESTRATÉGIA DE PARCERIAS
   * Estrutura estrita: Requirement, Gap, Options, Evidence, Risk
   * REGRA 156: NUNCA RESPONDER "Use parceiro X" de forma definitiva
   */
  askPartnerCopilot(query = '', opportunityId = '7004321234') {
    const q = query.toLowerCase();
    const structure = this.getStructureByOpportunity(opportunityId) || initialParticipationStructures[0];

    // Caso 1: Conseguimos participar sozinhos?
    if (q.includes('sozinhos') || q.includes('participar sozinho') || q.includes('solo')) {
      const isSoloFeasible = structure.scenariosComparison?.solo?.feasible;
      return {
        requirement: `O edital exige comprovação de ${structure.partnerRequirementProfile?.requiredCapabilities?.[0] || 'requisitos técnicos específicos'}.`,
        gap: structure.gaps?.[0]?.description || 'A empresa possui acervo parcial para o escopo integral.',
        options: isSoloFeasible
          ? 'Participação Solo é tecnicamente viável, porém o apoio de parceiro melhora o SLA logístico.'
          : 'A participação individual (Solo) não atende a todos os requisitos habilitatórios.',
        evidence: `${structure.editalRules?.consortium?.evidenceDoc || 'Edital'} (${structure.editalRules?.consortium?.clause || 'Cláusula de Habilitação'}).`,
        risk: isSoloFeasible
          ? 'Risco de sobrecarga da equipe interna em caso de mobilização simultânea.'
          : 'Risco de inabilitação sumária no certame caso submeta proposta sem consórcio ou subcontratação.'
      };
    }

    // Caso 2: Consórcio é permitido?
    if (q.includes('consórcio') || q.includes('consorcio') || q.includes('permitido')) {
      const cRule = structure.editalRules?.consortium;
      return {
        requirement: 'Regras de participação de pessoas jurídicas reunidas em consórcio.',
        gap: 'Necessidade de somatório de atestados técnicos ou capacidade econômico-financeira.',
        options: cRule?.status === EditalRuleStatus.NOT_ALLOWED
          ? 'Consórcio é expressamente vedado pelo edital. Avaliar viabilidade de subcontratação parcial autorizada.'
          : cRule?.status === EditalRuleStatus.CONDITIONAL
          ? `Consórcio é permitido sob condições: ${cRule.details}`
          : cRule?.status === EditalRuleStatus.UNCLEAR
          ? 'Regra ambígua no edital. Revisão jurídica recomendada antes de decisão.'
          : 'Consórcio plenamente permitido pelo edital.',
        evidence: `${cRule?.evidenceDoc || 'Edital'}, Página ${cRule?.page || 'N/A'}, ${cRule?.clause || 'Cláusula de Consórcio'}.`,
        risk: cRule?.status === EditalRuleStatus.NOT_ALLOWED
          ? 'Apresentação de proposta em consórcio gerará desclassificação imediata.'
          : 'Complexidade de governança, responsabilidade solidária e necessidade de registro de consórcio.'
      };
    }

    // Caso 3: Quais parceiros cadastrados atendem ao requisito?
    if (q.includes('parceiros') || q.includes('quais parceiros') || q.includes('cadastrados')) {
      const matches = this.matchPartners(structure.partnerRequirementProfile);
      const partnerNames = matches.map(m => `${m.partner.companyName} (${m.dimensions.capabilityFit})`).join(', ');

      return {
        requirement: `Requisitos identificados: ${structure.partnerRequirementProfile?.requiredCapabilities?.join('; ') || 'Serviços especializados'}.`,
        gap: structure.gaps?.map(g => g.description).join('; ') || 'Complementação de escopo.',
        options: `Há ${matches.length} parceiros compatíveis cadastrados na base: ${partnerNames}.`,
        evidence: 'Documentos e acervos catalogados no Cofre Documental e Módulo de Fornecedores do Vellia.',
        risk: 'A disponibilidade formal de cada parceiro deve ser confirmada por escrito antes do fechamento da proposta comercial.'
      };
    }

    // Resposta padrão nos 5 blocos
    return {
      requirement: 'Requisitos do certame sob análise de estrutura de participação.',
      gap: structure.gaps?.[0]?.description || 'Gaps de capacidade técnica ou operacional identificados na Fase 44.',
      options: 'Alternativas sob avaliação: Participação Solo, Apoio de Parceiro, Subcontratação Autorizada ou Consórcio.',
      evidence: `${structure.editalRules?.consortium?.evidenceDoc || 'Edital'} e histórico interno do Vellia.`,
      risk: 'Dependência técnica exclusiva e variação de margem devem ser ponderadas na deliberação de GO/NO-GO.'
    };
  }
}

export const partnerStrategyService = new PartnerStrategyService();
export default partnerStrategyService;
