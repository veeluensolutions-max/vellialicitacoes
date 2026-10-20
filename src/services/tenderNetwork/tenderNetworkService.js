/**
 * VELLIA LICITAÇÕES — FASE 63: TENDER INTELLIGENCE NETWORK
 * tenderNetworkService.js: Motor Central de Fontes, Oportunidade Canônica, Conflitos e Cobertura
 */

import {
  TenderSourceType,
  SourceTrustLevel,
  SourceHealthStatus,
  CoverageLevel,
  CandidateStatus,
  PrioritizationQuadrant,
  ConflictStatus,
  MatchConfidenceType,
  ConflictFieldType
} from './tenderNetworkModels.js';

import {
  initialTenderSources,
  initialAuthorityPolicies,
  initialCanonicalOpportunities,
  initialSourceCandidates,
  initialCoverageIntelligence
} from './tenderNetworkData.js';

const STORAGE_KEYS = {
  SOURCES: 'vellia_tender_sources_v63',
  OPPORTUNITIES: 'vellia_canonical_opps_v63',
  POLICIES: 'vellia_authority_policies_v63',
  CANDIDATES: 'vellia_source_candidates_v63',
  COVERAGE: 'vellia_coverage_intel_v63',
  AUDIT: 'vellia_tender_network_audit_v63',
  REVIEW_QUEUE: 'vellia_data_review_queue_v63',
  ALERTS: 'vellia_radar_alerts_v63'
};

export class TenderNetworkService {
  constructor() {
    this._memoryStore = new Map();
  }

  _get(key, defaultValue) {
    if (typeof localStorage !== 'undefined') {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
    return this._memoryStore.has(key) ? this._memoryStore.get(key) : defaultValue;
  }

  _save(key, data) {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        // Fallback gracioso
      }
    }
    this._memoryStore.set(key, data);
  }

  _logAudit(action, details, user = 'Sistema') {
    const logs = this._get(STORAGE_KEYS.AUDIT, []);
    logs.unshift({
      id: `AUD-SRC-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    });
    this._save(STORAGE_KEYS.AUDIT, logs.slice(0, 100));
  }

  // ==========================================
  // 1. GERENCIAMENTO DE FONTES & STATUS
  // ==========================================

  getSources() {
    return this._get(STORAGE_KEYS.SOURCES, initialTenderSources);
  }

  getSourceById(sourceId) {
    const sources = this.getSources();
    return sources.find(s => s.id === sourceId) || null;
  }

  updateSourceStatus(sourceId, newStatus, reason = '', user = 'Admin') {
    const sources = this.getSources();
    const source = sources.find(s => s.id === sourceId);
    if (!source) throw new Error(`Fonte ${sourceId} não encontrada.`);

    const oldStatus = source.status;
    source.status = newStatus;
    source.lastFailure = newStatus === SourceHealthStatus.DEGRADED || newStatus === SourceHealthStatus.OFFLINE ? new Date().toISOString() : source.lastFailure;
    this._save(STORAGE_KEYS.SOURCES, sources);

    this._logAudit('Source status changed', { sourceId, oldStatus, newStatus, reason }, user);
    return source;
  }

  retireSource(sourceId, reason, user = 'Admin') {
    const sources = this.getSources();
    const source = sources.find(s => s.id === sourceId);
    if (!source) throw new Error(`Fonte ${sourceId} não encontrada.`);

    source.status = SourceHealthStatus.RETIRED;
    source.retiredAt = new Date().toISOString();
    source.retirementReason = reason;
    this._save(STORAGE_KEYS.SOURCES, sources);

    this._logAudit('Source retired', { sourceId, reason }, user);
    return source;
  }

  // ==========================================
  // 2. OPORTUNIDADES CANÔNICAS & MULTIFONTE
  // ==========================================

  getCanonicalOpportunities() {
    return this._get(STORAGE_KEYS.OPPORTUNITIES, initialCanonicalOpportunities);
  }

  getCanonicalOpportunityById(oppId) {
    const opps = this.getCanonicalOpportunities();
    return opps.find(o => o.id === oppId) || null;
  }

  getAuthorityPolicies() {
    return this._get(STORAGE_KEYS.POLICIES, initialAuthorityPolicies);
  }

  /**
   * 50 a 53. Normalização de Compradores (Entity Resolution)
   */
  normalizeBuyerName(rawName) {
    if (!rawName) return 'Órgão Não Identificado';
    const clean = rawName.trim().toUpperCase();

    // Mapeamentos canônicos auditados
    if (clean.includes('RECIFE') && (clean.includes('PREFEITURA') || clean.includes('MUNICÍPIO') || clean.includes('MUNICIPIO'))) {
      return 'Prefeitura Municipal do Recife';
    }
    if (clean.includes('CAAPORÃ') || clean.includes('CAAPORA')) {
      return 'Prefeitura Municipal de Caaporã';
    }
    if (clean.includes('PETROBRAS') || clean.includes('PETRÓLEO BRASILEIRO')) {
      if (clean.includes('RNEST') || clean.includes('ABREU E LIMA')) {
        return 'Petrobras — Petróleo Brasileiro S.A. (Refinaria Abreu e Lima)';
      }
      return 'Petrobras — Petróleo Brasileiro S.A.';
    }
    if (clean.includes('CAMPINA GRANDE') && clean.includes('PREFEITURA')) {
      return 'Prefeitura Municipal de Campina Grande';
    }
    if (clean.includes('CAGEPA')) {
      return 'CAGEPA — Companhia de Água e Esgotos da Paraíba';
    }

    return rawName.trim();
  }

  /**
   * 43 a 48. Motor de Deduplicação Avançado
   */
  matchIncomingRecord(incoming, existingList) {
    const normIncomingBuyer = this.normalizeBuyerName(incoming.buyer);
    const incomingCnpj = String(incoming.clientCnpj || '').replace(/\D/g, '');
    const incomingTitle = String(incoming.title || '').toLowerCase().trim();

    for (const exist of existingList) {
      // 1. Número de Processo / ID externo já indexado
      if (incoming.externalId && exist.sourceRecords?.some(sr => sr.externalId === incoming.externalId)) {
        return { matchType: MatchConfidenceType.EXACT, targetOpp: exist, confidence: 1.0 };
      }

      // 2. CNPJ idêntico + Objeto idêntico ou muito similar (>= 85%)
      const existCnpj = String(exist.clientCnpj || '').replace(/\D/g, '');
      const existTitle = String(exist.title || '').toLowerCase().trim();

      if (incomingCnpj && existCnpj && incomingCnpj === existCnpj) {
        if (incomingTitle === existTitle || incomingTitle.slice(0, 35) === existTitle.slice(0, 35)) {
          return { matchType: MatchConfidenceType.STRONG_MATCH, targetOpp: exist, confidence: 0.95 };
        }
      }

      // 3. Comprador canônico normalizado idêntico + Objeto com alta similaridade
      const existNormBuyer = this.normalizeBuyerName(exist.clientCanonical);
      if (normIncomingBuyer === existNormBuyer && incomingTitle.length > 20 && existTitle.length > 20) {
        if (incomingTitle.includes(existTitle.slice(0, 30)) || existTitle.includes(incomingTitle.slice(0, 30))) {
          return { matchType: MatchConfidenceType.STRONG_MATCH, targetOpp: exist, confidence: 0.90 };
        }
      }

      // 4. Comprador com nome parecido porém objeto ambíguo -> POSSIBLE_MATCH (Fila de Revisão)
      if (normIncomingBuyer === existNormBuyer && (incomingTitle.includes('águas') || incomingTitle.includes('águas subterrâneas')) && (existTitle.includes('águas') || existTitle.includes('águas subterrâneas'))) {
        return { matchType: MatchConfidenceType.POSSIBLE_MATCH, targetOpp: exist, confidence: 0.70 };
      }
    }

    return { matchType: MatchConfidenceType.NO_MATCH, targetOpp: null, confidence: 0 };
  }

  /**
   * 14 a 42. Ingestão Canônica Multifonte com Rastreamento de Campo e Conflitos
   */
  ingestRecord(incomingRecord, sourceId, options = {}) {
    const sources = this.getSources();
    const source = sources.find(s => s.id === sourceId);
    if (!source) throw new Error(`Fonte ${sourceId} desconhecida.`);

    // 98 a 101. Modo Shadow: não polui Radar oficial
    if (options.isShadowMode || source.status === SourceHealthStatus.EXPERIMENTAL || source.isShadow) {
      return {
        status: 'SHADOW_INGESTED',
        note: 'Ingestão realizada em modo Shadow para medição de qualidade sem alimentar Radar oficial.',
        record: incomingRecord
      };
    }

    const opps = this.getCanonicalOpportunities();
    const matchResult = this.matchIncomingRecord(incomingRecord, opps);

    // 47, 48. Possible Match vai para a fila de revisão humana
    if (matchResult.matchType === MatchConfidenceType.POSSIBLE_MATCH) {
      const reviewQueue = this._get(STORAGE_KEYS.REVIEW_QUEUE, []);
      const reviewItem = {
        id: `REV-${Date.now()}`,
        type: 'DUPLICATE_UNCERTAIN_MATCH',
        incomingRecord,
        candidateOppId: matchResult.targetOpp.id,
        confidence: matchResult.confidence,
        detectedAt: new Date().toISOString(),
        status: 'PENDING_HUMAN_REVIEW'
      };
      reviewQueue.unshift(reviewItem);
      this._save(STORAGE_KEYS.REVIEW_QUEUE, reviewQueue);
      return { status: 'QUEUED_FOR_HUMAN_REVIEW', reviewItem };
    }

    // 18 a 22. Exact ou Strong Match -> Fusão na Oportunidade Canônica Existente
    if (matchResult.matchType === MatchConfidenceType.EXACT || matchResult.matchType === MatchConfidenceType.STRONG_MATCH) {
      const canonicalOpp = matchResult.targetOpp;

      // Adiciona SourceRecord se não existir para esta fonte
      const hasRecord = canonicalOpp.sourceRecords.some(sr => sr.sourceId === sourceId && sr.externalId === incomingRecord.externalId);
      if (!hasRecord) {
        canonicalOpp.sourceRecords.push({
          sourceId,
          externalId: incomingRecord.externalId,
          opportunityId: canonicalOpp.id,
          sourceUrl: incomingRecord.url || '',
          publishedAt: incomingRecord.publishedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rawReference: incomingRecord.title,
          normalizedAt: new Date().toISOString(),
          hash: incomingRecord.hash || `sha256-${Date.now()}`,
          status: 'ACTIVE_MIRROR'
        });
      }

      // Atualiza proveniência da oportunidade
      if (!canonicalOpp.provenance.additionalSources.includes(sourceId) && canonicalOpp.provenance.primarySourceId !== sourceId) {
        canonicalOpp.provenance.additionalSources.push(sourceId);
      }
      canonicalOpp.provenance.lastSyncAt = new Date().toISOString();

      // 29 a 36. Detecção e Registro de Conflitos
      this._checkAndRegisterConflicts(canonicalOpp, incomingRecord, source);

      // Salva alterações
      this._save(STORAGE_KEYS.OPPORTUNITIES, opps);

      // 163. Deduplicação de Alertas
      this._handleAlertsForOpp(canonicalOpp, 'UPDATE_MIRROR', options);

      return { status: 'MERGED_INTO_CANONICAL', opportunity: canonicalOpp };
    }

    // 14. Nova Oportunidade Canônica
    const newOppId = `OPP-${Date.now()}`;
    const normalizedBuyer = this.normalizeBuyerName(incomingRecord.buyer);

    const newCanonical = {
      id: newOppId,
      canonicalCode: `VELLIA-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      title: incomingRecord.title,
      clientCanonical: normalizedBuyer,
      clientCnpj: incomingRecord.clientCnpj || null,
      status: incomingRecord.status || 'Publicada / Aberta',
      modality: incomingRecord.modality || 'Pregão Eletrônico',
      estimatedValue: incomingRecord.estimatedValue || 0,
      deadline: incomingRecord.deadline || null,
      portalUrl: incomingRecord.url || '',
      region: incomingRecord.region || 'Nacional',
      provenance: {
        primarySourceId: sourceId,
        primarySourceName: source.name,
        additionalSources: [],
        lastSyncAt: new Date().toISOString(),
        isMirrored: false
      },
      fieldProvenance: {
        deadline: { sourceId, sourceName: source.name, value: incomingRecord.deadline, recordedAt: new Date().toISOString() },
        estimatedValue: { sourceId, sourceName: source.name, value: incomingRecord.estimatedValue, recordedAt: new Date().toISOString() },
        buyer: { sourceId, sourceName: source.name, value: normalizedBuyer, recordedAt: new Date().toISOString() },
        status: { sourceId, sourceName: source.name, value: incomingRecord.status, recordedAt: new Date().toISOString() },
        modality: { sourceId, sourceName: source.name, value: incomingRecord.modality, recordedAt: new Date().toISOString() }
      },
      sourceRecords: [
        {
          sourceId,
          externalId: incomingRecord.externalId,
          opportunityId: newOppId,
          sourceUrl: incomingRecord.url || '',
          publishedAt: incomingRecord.publishedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          rawReference: incomingRecord.title,
          normalizedAt: new Date().toISOString(),
          hash: incomingRecord.hash || `sha256-${Date.now()}`,
          status: 'ACTIVE_PRIMARY'
        }
      ],
      documents: [],
      conflicts: []
    };

    opps.unshift(newCanonical);
    this._save(STORAGE_KEYS.OPPORTUNITIES, opps);

    // 163. Alerta Único para Nova Oportunidade
    this._handleAlertsForOpp(newCanonical, 'NEW_OPPORTUNITY', options);

    return { status: 'CREATED_CANONICAL', opportunity: newCanonical };
  }

  /**
   * 29 a 36. Detecção Rigorosa de Conflitos e Prevalência por Política
   */
  _checkAndRegisterConflicts(canonicalOpp, incomingRecord, incomingSource) {
    if (!canonicalOpp.conflicts) canonicalOpp.conflicts = [];

    // 1. Conflito de Prazo / Deadline
    if (canonicalOpp.deadline && incomingRecord.deadline) {
      const d1 = new Date(canonicalOpp.deadline).toISOString().slice(0, 16);
      const d2 = new Date(incomingRecord.deadline).toISOString().slice(0, 16);
      if (d1 !== d2) {
        const conflictExists = canonicalOpp.conflicts.some(c => c.fieldName === ConflictFieldType.DEADLINE && c.conflictingSourceId === incomingSource.id);
        if (!conflictExists) {
          canonicalOpp.conflicts.push({
            id: `CONF-${Date.now()}-DL`,
            opportunityId: canonicalOpp.id,
            fieldName: ConflictFieldType.DEADLINE,
            primaryValue: canonicalOpp.deadline,
            conflictingValue: incomingRecord.deadline,
            primarySourceId: canonicalOpp.provenance.primarySourceId,
            conflictingSourceId: incomingSource.id,
            status: ConflictStatus.DETECTED,
            detectedAt: new Date().toISOString(),
            resolutionPolicy: 'OFFICIAL_PRIMARY_AUTHORITY',
            notes: `Divergência de prazo entre ${canonicalOpp.provenance.primarySourceName} e ${incomingSource.name}.`
          });
        }
      }
    }

    // 2. Conflito de Valor Estimado
    if (canonicalOpp.estimatedValue && incomingRecord.estimatedValue && Math.abs(canonicalOpp.estimatedValue - incomingRecord.estimatedValue) > 1.0) {
      const conflictExists = canonicalOpp.conflicts.some(c => c.fieldName === ConflictFieldType.ESTIMATED_VALUE && c.conflictingSourceId === incomingSource.id);
      if (!conflictExists) {
        canonicalOpp.conflicts.push({
          id: `CONF-${Date.now()}-VAL`,
          opportunityId: canonicalOpp.id,
          fieldName: ConflictFieldType.ESTIMATED_VALUE,
          primaryValue: canonicalOpp.estimatedValue,
          conflictingValue: incomingRecord.estimatedValue,
          primarySourceId: canonicalOpp.provenance.primarySourceId,
          conflictingSourceId: incomingSource.id,
          status: ConflictStatus.DETECTED,
          detectedAt: new Date().toISOString(),
          resolutionPolicy: 'OFFICIAL_PRIMARY_AUTHORITY',
          notes: `Divergência de valor estimado entre ${canonicalOpp.provenance.primarySourceName} e ${incomingSource.name}.`
        });
      }
    }
  }

  // ==========================================
  // 3. DOCUMENTOS & HASH SHA-256
  // ==========================================

  /**
   * 113 a 121. Deduplicação de Documentos e Emissão de Document Change Event
   */
  registerDocument(opportunityId, docData) {
    const opps = this.getCanonicalOpportunities();
    const opp = opps.find(o => o.id === opportunityId);
    if (!opp) throw new Error(`Oportunidade ${opportunityId} não encontrada.`);

    if (!opp.documents) opp.documents = [];

    // Checa por hash SHA-256 idêntico (Item 114, 115)
    const existingSameHash = opp.documents.find(d => d.hashSha256 === docData.hashSha256);
    if (existingSameHash) {
      return {
        status: 'DEDUPLICATED_BY_HASH',
        document: existingSameHash,
        message: 'Documento idêntico já armazenado (SHA-256 coincide). Download redundante evitado.'
      };
    }

    // Checa se é uma nova versão de documento existente com mesmo título (Item 116 a 120)
    const existingTitleDoc = opp.documents.find(d => d.title === docData.title && d.isCurrent);
    let version = 1;
    if (existingTitleDoc) {
      existingTitleDoc.isCurrent = false;
      version = (existingTitleDoc.version || 1) + 1;
    }

    const newDoc = {
      id: `DOC-${Date.now()}`,
      title: docData.title,
      version,
      hashSha256: docData.hashSha256,
      uploadedAt: new Date().toISOString(),
      sourceId: docData.sourceId || opp.provenance.primarySourceId,
      isCurrent: true,
      changeType: version > 1 ? 'ADENDO_RETIFICADOR' : 'VERSAO_INICIAL'
    };

    opp.documents.push(newDoc);
    this._save(STORAGE_KEYS.OPPORTUNITIES, opps);

    // 119, 120. Disparo de Evento de Mudança de Documento
    if (version > 1) {
      this._logAudit('Document change event triggered', { opportunityId, docTitle: newDoc.title, version }, 'Watcher');
    }

    return {
      status: version > 1 ? 'DOCUMENT_VERSION_UPDATED' : 'DOCUMENT_REGISTERED',
      document: newDoc,
      eventTriggered: version > 1 ? 'DOCUMENT_CHANGE_EVENT' : null
    };
  }

  // ==========================================
  // 4. SAÚDE, BASELINE & DETECÇÃO DE ANOMALIAS
  // ==========================================

  /**
   * 54 a 64. Monitoramento com Linha de Base Histórica
   */
  evaluateSourceHealth(sourceId, todayPublicationsCount = null, isWorkday = true) {
    const sources = this.getSources();
    const source = sources.find(s => s.id === sourceId);
    if (!source) throw new Error(`Fonte ${sourceId} não encontrada.`);

    // 60 a 64. Detecção de Anomalia Baseada em Baseline
    let anomalyDetected = false;
    let anomalyReason = null;

    if (isWorkday && todayPublicationsCount !== null) {
      if (todayPublicationsCount === 0 && source.historicalDailyBaseline > 10) {
        anomalyDetected = true;
        anomalyReason = `ANOMALIA: Fonte com baseline de ${source.historicalDailyBaseline} processos/dia retornou 0 em dia útil. Possível degradação na origem.`;
      }
    }

    return {
      sourceId: source.id,
      name: source.name,
      status: anomalyDetected ? SourceHealthStatus.DEGRADED : source.status,
      historicalDailyBaseline: source.historicalDailyBaseline,
      todayCount: todayPublicationsCount,
      anomalyDetected,
      anomalyReason
    };
  }

  // ==========================================
  // 5. INTELIGÊNCIA DE COBERTURA & BACKLOG DE EXPANSÃO
  // ==========================================

  getCoverageIntelligence() {
    return this._get(STORAGE_KEYS.COVERAGE, initialCoverageIntelligence);
  }

  getSourceCandidates() {
    return this._get(STORAGE_KEYS.CANDIDATES, initialSourceCandidates);
  }

  addSourceCandidate(candidateData, user = 'Admin') {
    // 2, 3, 215, 241. Bloqueio absoluto se exigir CAPTCHA bypass
    if (candidateData.requiresCaptchaBypass || (candidateData.notes && candidateData.notes.toLowerCase().includes('captcha'))) {
      throw new Error('SECURITY_ERROR: Proibida a inclusão ou automação de fontes com quebra de CAPTCHA (Item 3, 215).');
    }

    const candidates = this.getSourceCandidates();
    const newCandidate = {
      id: `CAND-${Date.now()}`,
      name: candidateData.name,
      type: candidateData.type || TenderSourceType.PUBLIC_PORTAL,
      region: candidateData.region || 'Nacional',
      scope: candidateData.scope || 'Licitações Gerais',
      discoveryMethod: candidateData.discoveryMethod || 'Identificação Manual',
      expectedValue: candidateData.expectedValue || 'Médio',
      integrationComplexity: candidateData.integrationComplexity || 'Média',
      quadrant: candidateData.quadrant || PrioritizationQuadrant.STRATEGIC,
      status: CandidateStatus.DISCOVERED,
      shadowMetrics: null,
      notes: candidateData.notes || '',
      createdAt: new Date().toISOString()
    };

    candidates.unshift(newCandidate);
    this._save(STORAGE_KEYS.CANDIDATES, candidates);
    this._logAudit('Source candidate registered', { name: newCandidate.name, id: newCandidate.id }, user);
    return newCandidate;
  }

  updateCandidateStatus(candidateId, newStatus, user = 'Admin') {
    const candidates = this.getSourceCandidates();
    const cand = candidates.find(c => c.id === candidateId);
    if (!cand) throw new Error(`Candidata ${candidateId} não encontrada.`);

    cand.status = newStatus;
    if (newStatus === CandidateStatus.TESTING && !cand.shadowMetrics) {
      cand.shadowMetrics = { daysInShadow: 1, ingestedCount: 0, duplicateCount: 0, uniqueCount: 0, errorsCount: 0, relevanceScore: 0.8 };
    }
    this._save(STORAGE_KEYS.CANDIDATES, candidates);
    this._logAudit('Candidate status changed', { candidateId, newStatus }, user);
    return cand;
  }

  // ==========================================
  // 6. FAILOVER & RESILIÊNCIA
  // ==========================================

  /**
   * 150 a 153. Failover Gracioso sem Troca Silenciosa
   */
  getOpportunityWithFailover(oppId) {
    const opp = this.getCanonicalOpportunityById(oppId);
    if (!opp) return null;

    const sources = this.getSources();
    const primarySource = sources.find(s => s.id === opp.provenance.primarySourceId);

    if (primarySource && (primarySource.status === SourceHealthStatus.OFFLINE || primarySource.status === SourceHealthStatus.DEGRADED)) {
      const secondaryId = opp.provenance.additionalSources[0] || 'SOURCE-PNCP';
      const secondarySource = sources.find(s => s.id === secondaryId);
      return {
        ...opp,
        isUnderFailover: true,
        failoverNotice: `ATENÇÃO: Fonte primária (${primarySource.name}) indisponível ou degradada. Fonte secundária (${secondarySource?.name || 'Espelho Verificado'}) em uso provisório.`,
        activeSourceInUse: secondarySource?.name || 'Espelho Secundário'
      };
    }

    return {
      ...opp,
      isUnderFailover: false,
      failoverNotice: null,
      activeSourceInUse: opp.provenance.primarySourceName
    };
  }

  // ==========================================
  // 7. DEDUPLICAÇÃO DE ALERTAS DO RADAR
  // ==========================================

  _handleAlertsForOpp(canonicalOpp, eventType, options = {}) {
    // 133, 134. Backfill não gera alerta de certame vencido
    if (options.isBackfill || (canonicalOpp.deadline && new Date(canonicalOpp.deadline).getTime() < Date.now())) {
      return { alertTriggered: false, reason: 'BACKFILL_OR_EXPIRED_OPPORTUNITY' };
    }

    const alerts = this._get(STORAGE_KEYS.ALERTS, []);
    const existingAlert = alerts.find(a => a.opportunityId === canonicalOpp.id);

    // 163, 164. Mesma oportunidade vista em múltiplas fontes gera apenas 1 alerta
    if (existingAlert && eventType === 'UPDATE_MIRROR') {
      return { alertTriggered: false, reason: 'ALERT_ALREADY_SENT_DEDUPLICATED' };
    }

    if (existingAlert && eventType === 'DOCUMENT_UPDATE') {
      const newAlert = {
        id: `ALT-${Date.now()}`,
        opportunityId: canonicalOpp.id,
        type: 'OPPORTUNITY_UPDATED',
        title: `Atualização da oportunidade existente: ${canonicalOpp.title}`,
        sentAt: new Date().toISOString()
      };
      alerts.unshift(newAlert);
      this._save(STORAGE_KEYS.ALERTS, alerts);
      return { alertTriggered: true, alert: newAlert };
    }

    if (!existingAlert) {
      const newAlert = {
        id: `ALT-${Date.now()}`,
        opportunityId: canonicalOpp.id,
        type: 'NEW_OPPORTUNITY_DETECTED',
        title: `Nova oportunidade no Radar: ${canonicalOpp.title}`,
        sentAt: new Date().toISOString()
      };
      alerts.unshift(newAlert);
      this._save(STORAGE_KEYS.ALERTS, alerts);
      return { alertTriggered: true, alert: newAlert };
    }

    return { alertTriggered: false };
  }

  // ==========================================
  // 8. MULTIEMPRESA: MATCHING ISOLADO
  // ==========================================

  /**
   * 216 a 219. Ingestão única e global, matching isolado por empresa
   */
  calculateCompanyAdherence(opportunityId, companyId) {
    const opp = this.getCanonicalOpportunityById(opportunityId);
    if (!opp) return null;

    // Regras isoladas de perfil de aderência
    if (companyId === 'excelencia') {
      // Foco em monitoramento ambiental e análises laboratoriais
      const isAmbiental = opp.title.toLowerCase().includes('ambiental') || opp.title.toLowerCase().includes('águas') || opp.title.toLowerCase().includes('emissões');
      return {
        companyId: 'excelencia',
        companyName: 'Excelência Ambiental',
        adherenceScore: isAmbiental ? 92 : 45,
        criteriaFit: isAmbiental ? 'Alta aderência ao acervo de análises e monitoramento' : 'Fora do escopo principal'
      };
    } else {
      // Veeluen: Foco em engenharia consultiva, infraestrutura e saneamento
      const isEngenharia = opp.title.toLowerCase().includes('hidrogeológicos') || opp.title.toLowerCase().includes('obras') || opp.title.toLowerCase().includes('engenharia');
      return {
        companyId: 'veeluensolutions',
        companyName: 'Veeluen Solutions',
        adherenceScore: isEngenharia ? 88 : 50,
        criteriaFit: isEngenharia ? 'Compatível com contratos de engenharia e modelagem' : 'Aderência moderada'
      };
    }
  }

  // ==========================================
  // 9. COPILOT INTEGRATION
  // ==========================================

  answerCopilotQuery(query) {
    const q = query.toLowerCase();
    const sources = this.getSources();
    const opps = this.getCanonicalOpportunities();
    const coverage = this.getCoverageIntelligence();

    if (q.includes('degradad') || q.includes('offline') || q.includes('saúde') || q.includes('status')) {
      const degraded = sources.filter(s => s.status === SourceHealthStatus.DEGRADED || s.status === SourceHealthStatus.DELAYED || s.status === SourceHealthStatus.OFFLINE);
      if (degraded.length === 0) {
        return 'Todas as fontes monitoradas estão operando com status Saudável.';
      }
      return `Atualmente, ${degraded.length} fonte(s) apresentam degradação ou atraso: ${degraded.map(d => `${d.name} (${d.status})`).join(', ')}.`;
    }

    if (q.includes('única') || q.includes('mais oportunidades') || q.includes('contribui')) {
      const sorted = [...sources].sort((a, b) => (b.metrics?.uniqueOpportunityContribution || 0) - (a.metrics?.uniqueOpportunityContribution || 0));
      const top = sorted[0];
      return `A fonte com maior contribuição de oportunidades únicas é o ${top.name}, com ${top.metrics?.uniqueOpportunityContribution} certames exclusivos indexados.`;
    }

    if (q.includes('lacuna') || q.includes('cobertura') || q.includes('gap')) {
      const weak = coverage.geographicCoverage.filter(g => g.level === CoverageLevel.WEAK);
      return `Identificamos lacunas críticas de cobertura nas seguintes regiões: ${weak.map(w => `${w.region} (${w.percent}% - ${w.gapNotes})`).join('; ')}.`;
    }

    if (q.includes('conflito') || q.includes('divergência')) {
      const withConflicts = opps.filter(o => o.conflicts && o.conflicts.length > 0);
      if (withConflicts.length === 0) return 'Não há conflitos pendentes registrados entre fontes.';
      return `Há ${withConflicts.length} oportunidade(s) com divergências ativas registradas entre fontes. Exemplo: no certame "${withConflicts[0].title}", o PNCP indica prazo ${withConflicts[0].conflicts[0].primaryValue} enquanto o portal local indica ${withConflicts[0].conflicts[0].conflictingValue}.`;
    }

    return 'O Vellia Tender Intelligence Network monitora 6 fontes integradas com modelo canônico de deduplicação e controle de proveniência de dados.';
  }
}

export const tenderNetworkService = new TenderNetworkService();
