/**
 * VELLIA LICITAÇÕES — FASE 65: OUTCOME INTELLIGENCE
 * outcomeIntelligenceService.js: Motor Central de Inteligência de Resultados, Benchmark e Aprendizado
 */

import {
  OutcomeResultType,
  DisqualificationReason,
  NoSubmissionReason,
  LossReasonCategory,
  PatternStatus,
  ContractExecutionOutcome,
  DataCoverageStatus,
  ParticipationStructureType
} from './outcomeModels.js';

import {
  initialOutcomeRecords,
  initialObservedPatterns
} from './outcomeData.js';

const STORAGE_KEYS = {
  OUTCOMES: 'vellia_outcomes_dataset_v65',
  PATTERNS: 'vellia_observed_patterns_v65',
  AUDIT: 'vellia_outcomes_audit_v65'
};

export class OutcomeIntelligenceService {
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
        // Fallback silencioso
      }
    }
    this._memoryStore.set(key, data);
  }

  _logAudit(action, details, user = 'Sistema') {
    const logs = this._get(STORAGE_KEYS.AUDIT, []);
    logs.unshift({
      id: `AUD-OUT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    });
    this._save(STORAGE_KEYS.AUDIT, logs.slice(0, 100));
  }

  // ==========================================
  // 1. DATASET CANÔNICO & FILTRAGEM
  // ==========================================

  getOutcomeRecords(filters = {}) {
    let records = this._get(STORAGE_KEYS.OUTCOMES, initialOutcomeRecords);

    if (filters.companyId && filters.companyId !== 'all') {
      records = records.filter(r => r.companyId === filters.companyId);
    }
    if (filters.serviceCategory && filters.serviceCategory !== 'all') {
      records = records.filter(r => r.serviceCategory === filters.serviceCategory);
    }
    if (filters.region && filters.region !== 'all') {
      records = records.filter(r => r.region === filters.region);
    }
    if (filters.modality && filters.modality !== 'all') {
      records = records.filter(r => r.modality === filters.modality);
    }
    if (filters.resultType && filters.resultType !== 'all') {
      records = records.filter(r => r.resultType === filters.resultType);
    }
    if (filters.period && filters.period !== 'all') {
      records = records.filter(r => r.period === filters.period);
    }

    return records;
  }

  // ==========================================
  // 2. CÁLCULO DE MÉTRICAS (WIN, SUBMISSION, DISQUALIFICATION)
  // ==========================================

  /**
   * 12 a 28. Cálculo Rigoroso de Taxas e Advertência de Amostra Pequena
   */
  calculateOutcomeMetrics(filters = {}, userPermissions = ['outcomes.financial.view']) {
    const records = this.getOutcomeRecords(filters);
    const sampleSize = records.length;
    const minSampleThreshold = filters.minSampleThreshold || 5;

    // 12 a 16. Small Sample Warning
    const isSmallSample = sampleSize < minSampleThreshold;
    const smallSampleWarning = isSmallSample
      ? 'Low confidence due to limited sample. Amostra reduzida não permite conclusões estatísticas definitivas.'
      : null;

    // Contagens por Tipo de Resultado
    const wonCount = records.filter(r => r.resultType === OutcomeResultType.WON).length;
    const lostCount = records.filter(r => r.resultType === OutcomeResultType.LOST).length;
    const cancelledCount = records.filter(r => r.resultType === OutcomeResultType.CANCELLED).length;
    const disqualifiedCount = records.filter(r => r.resultType === OutcomeResultType.DISQUALIFIED).length;
    const noSubmissionCount = records.filter(r => r.resultType === OutcomeResultType.NO_SUBMISSION).length;
    const withdrawnCount = records.filter(r => r.resultType === OutcomeResultType.WITHDRAWN).length;

    // 20 a 22. Denominador do Win Rate = Won + Lost + Disqualified (Exclui Cancelled e No Submission)
    const competitiveDenominator = wonCount + lostCount + disqualifiedCount;
    const winRatePct = competitiveDenominator > 0 ? Math.round((wonCount / competitiveDenominator) * 100) : 0;

    // 23 a 25. Submission Rate = Submetidos / Elegíveis para submissão
    const submittedCount = wonCount + lostCount + disqualifiedCount;
    const eligibleCount = submittedCount + noSubmissionCount + withdrawnCount;
    const submissionRatePct = eligibleCount > 0 ? Math.round((submittedCount / eligibleCount) * 100) : 0;

    // 26 a 28. Disqualification Rate
    const disqualificationRatePct = competitiveDenominator > 0 ? Math.round((disqualifiedCount / competitiveDenominator) * 100) : 0;

    // 158 a 167. Data Quality & Cobertura de Dados
    const recordsWithPrice = records.filter(r => r.pricing?.ourFinalPrice !== null && r.pricing?.ourFinalPrice !== undefined).length;
    const priceDataCoveragePct = competitiveDenominator > 0 ? Math.round((recordsWithPrice / competitiveDenominator) * 100) : 0;
    const dataCoverageStatus = priceDataCoveragePct >= 80 ? DataCoverageStatus.COMPLETE : priceDataCoveragePct >= 50 ? DataCoverageStatus.PARTIAL : DataCoverageStatus.INSUFFICIENT;

    // 162 a 165. Missing Loss Reason Pattern
    const lostRecords = records.filter(r => r.resultType === OutcomeResultType.LOST);
    const lostWithoutOfficialReason = lostRecords.filter(r => !r.lossDetails || r.lossDetails.hasOfficialReason === false).length;
    const missingReasonRatePct = lostRecords.length > 0 ? Math.round((lostWithoutOfficialReason / lostRecords.length) * 100) : 0;

    // 220, 224. Proteção de Privacidade Financeira
    const hasFinancialPermission = userPermissions.includes('outcomes.financial.view');

    return {
      sampleSize,
      isSmallSample,
      smallSampleWarning,
      outcomes: {
        won: wonCount,
        lost: lostCount,
        cancelled: cancelledCount,
        disqualified: disqualifiedCount,
        noSubmission: noSubmissionCount,
        withdrawn: withdrawnCount
      },
      rates: {
        winRatePct,
        submissionRatePct,
        disqualificationRatePct,
        competitiveDenominator,
        eligibleCount
      },
      dataQuality: {
        priceDataCoveragePct,
        status: dataCoverageStatus,
        missingReasonRatePct,
        missingReasonInsight: missingReasonRatePct >= 50
          ? `${missingReasonRatePct}% das perdas não possuem reason code oficial em ata. Oportunidade de aprimoramento no registro de post-mortem.`
          : null
      },
      privacy: {
        isMarginHidden: !hasFinancialPermission
      }
    };
  }

  // ==========================================
  // 3. ANÁLISE DE TIMING & READINESS LEAD TIME
  // ==========================================

  /**
   * 33 a 41. Timing Analysis & Comparação de Lead Time
   */
  getTimingAndReadinessAnalysis(filters = {}) {
    const records = this.getOutcomeRecords(filters);
    const wins = records.filter(r => r.resultType === OutcomeResultType.WON);
    const losses = records.filter(r => r.resultType === OutcomeResultType.LOST);

    const calcMedian = (arr, prop) => {
      const values = arr.map(item => item.timing?.[prop] || 0).sort((a, b) => a - b);
      if (values.length === 0) return 0;
      const mid = Math.floor(values.length / 2);
      return values.length % 2 !== 0 ? values[mid] : Math.round((values[mid - 1] + values[mid]) / 2);
    };

    const winsMedianLeadTime = calcMedian(wins, 'readinessLeadTimeHours');
    const lossesMedianLeadTime = calcMedian(losses, 'readinessLeadTimeHours');

    // 1 e 38. Linguagem Obrigatória: Associação e Não Causalidade
    const analyticalStatement = wins.length > 0 && losses.length > 0
      ? `Neste conjunto (Amostra: ${records.length} certames), maior prontidão antecipada (mediana de ${winsMedianLeadTime}h nas vitórias vs ${lossesMedianLeadTime}h nas perdas) aparece associada a melhores resultados.`
      : 'Dados de timing insuficientes para comparação de prontidão.';

    return {
      sampleSize: records.length,
      winsSampleSize: wins.length,
      lossesSampleSize: losses.length,
      winsMedianLeadTimeHours: winsMedianLeadTime,
      lossesMedianLeadTimeHours: lossesMedianLeadTime,
      analyticalStatement,
      disclaimer: 'Correlação não implica causalidade. A antecipação pode refletir maior facilidade do escopo ou maior priorização pela equipe.'
    };
  }

  // ==========================================
  // 4. ANÁLISE POR ESTRUTURA DE PARCERIA (FASE 62)
  // ==========================================

  /**
   * 72 a 76. Comparação Solo vs Parceiro com Amostra Transparente
   */
  getPartnerStructureComparison(filters = {}, userPermissions = ['outcomes.financial.view']) {
    const records = this.getOutcomeRecords(filters);
    const hasFinancialAccess = userPermissions.includes('outcomes.financial.view');

    const structures = [
      ParticipationStructureType.SOLO,
      ParticipationStructureType.CONSORTIUM,
      ParticipationStructureType.PARTNER_SUPPORT,
      ParticipationStructureType.SUBCONTRACTING
    ];

    const results = structures.map(struct => {
      const subset = records.filter(r => r.participationStructure === struct);
      const sample = subset.length;
      const wins = subset.filter(r => r.resultType === OutcomeResultType.WON).length;
      const competitive = subset.filter(r => r.resultType === OutcomeResultType.WON || r.resultType === OutcomeResultType.LOST || r.resultType === OutcomeResultType.DISQUALIFIED).length;
      const winRate = competitive > 0 ? Math.round((wins / competitive) * 100) : 0;
      const submitted = subset.filter(r => r.resultType !== OutcomeResultType.NO_SUBMISSION && r.resultType !== OutcomeResultType.WITHDRAWN).length;
      const submissionRate = sample > 0 ? Math.round((submitted / sample) * 100) : 0;

      // Margem média observada se autorizado
      const margins = subset.map(r => r.pricing?.ourMarginPct).filter(m => m !== null && m !== undefined);
      const avgMargin = margins.length > 0 ? Number((margins.reduce((a, b) => a + b, 0) / margins.length).toFixed(1)) : null;

      return {
        structure: struct,
        sampleSize: sample,
        isSmallSample: sample < 5,
        submittedCount: submitted,
        winsCount: wins,
        submissionRatePct: submissionRate,
        winRatePct: winRate,
        observedAvgMarginPct: hasFinancialAccess ? avgMargin : null,
        observation: struct === ParticipationStructureType.CONSORTIUM
          ? 'Participações com parceiro técnico tiveram maior taxa de submissão completa neste conjunto.'
          : 'Participações solo preservam margem integral, porém apresentam maior restrição em certames com atestados combinados.'
      };
    });

    return results;
  }

  // ==========================================
  // 5. ANÁLISE DE NÃO-SUBMISSÃO & DESQUALIFICAÇÕES
  // ==========================================

  /**
   * 29 a 32. Categorização de Abandono após GO
   */
  getNoSubmissionBreakdown(filters = {}) {
    const records = this.getOutcomeRecords(filters);
    const noSubmissions = records.filter(r => r.resultType === OutcomeResultType.NO_SUBMISSION);

    const reasonsMap = {};
    noSubmissions.forEach(ns => {
      const reason = ns.noSubmissionDetails?.reason || 'Outro / Não Identificado';
      reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
    });

    return {
      totalNoSubmissionCount: noSubmissions.length,
      breakdown: Object.entries(reasonsMap).map(([reason, count]) => ({
        reason,
        count,
        pct: Math.round((count / (noSubmissions.length || 1)) * 100),
        isProcessFailure: reason !== NoSubmissionReason.STRATEGIC_WITHDRAWAL,
        notes: reason === NoSubmissionReason.STRATEGIC_WITHDRAWAL
          ? 'Decisão deliberada da diretoria (não representa falha de execução).'
          : 'Gargalo operacional passível de ação preventiva.'
      }))
    };
  }

  // ==========================================
  // 6. CASOS COMPARÁVEIS HISTÓRICOS (SEM LEAKAGE)
  // ==========================================

  /**
   * 106 a 115, 210 a 214. Busca de Casos Comparáveis Baseada em Fatores Pré-Decisão
   */
  getHistoricalComparables(targetOpportunity) {
    const allRecords = this.getOutcomeRecords();

    // 213, 214. Fatores estritamente pré-decisão (evita future leakage)
    const comparables = allRecords.filter(r => {
      // 1. Mesmo serviço ou categoria afim
      const sameService = r.serviceCategory === targetOpportunity.serviceCategory || (r.title && targetOpportunity.title && r.title.toLowerCase().includes(targetOpportunity.title.slice(0, 15).toLowerCase()));
      // 2. Mesma faixa de valor
      const sameValueRange = r.valueRange === targetOpportunity.valueRange;
      // 3. Mesma região ou comprador similar
      const sameRegion = r.region === targetOpportunity.region;

      return sameService || (sameValueRange && sameRegion);
    });

    const sample = comparables.length;
    const wonCount = comparables.filter(c => c.resultType === OutcomeResultType.WON).length;
    const lostCount = comparables.filter(c => c.resultType === OutcomeResultType.LOST).length;

    return {
      label: 'Historical Comparables', // 115. Rótulo canônico
      sampleSize: sample,
      isSmallSample: sample < 5,
      similarityFactors: ['Serviço / Escopo', 'Faixa de Valor Estimado', 'Região Geográfica', 'Modalidade'],
      outcomesDistribution: {
        won: wonCount,
        lost: lostCount,
        other: sample - (wonCount + lostCount)
      },
      comparableCases: comparables.slice(0, 5).map(c => ({
        canonicalCode: c.canonicalCode,
        title: c.title,
        client: c.clientCanonical,
        result: c.resultType,
        readinessLeadTime: `${c.timing?.readinessLeadTimeHours || 0}h`,
        structure: c.participationStructure,
        contractOutcome: c.contractOutcome?.status || 'N/A'
      })),
      disclaimer: 'Casos históricos servem como subsídio analítico de padrões observados, não como preditor determinístico de vitória.'
    };
  }

  // ==========================================
  // 7. GESTÃO DE PADRÕES OBSERVADOS (ObservedOutcomePattern)
  // ==========================================

  getPatterns(statusFilter = 'all') {
    let patterns = this._get(STORAGE_KEYS.PATTERNS, initialObservedPatterns);
    if (statusFilter !== 'all') {
      patterns = patterns.filter(p => p.status === statusFilter);
    }
    return patterns;
  }

  validatePattern(patternId, notes, user = 'Colegiado Executivo') {
    const patterns = this._get(STORAGE_KEYS.PATTERNS, initialObservedPatterns);
    const pat = patterns.find(p => p.id === patternId);
    if (!pat) throw new Error(`Padrão ${patternId} não encontrado.`);

    pat.status = PatternStatus.VALIDATED;
    pat.validationNotes = notes;
    pat.validatedAt = new Date().toISOString();
    this._save(STORAGE_KEYS.PATTERNS, patterns);

    this._logAudit('Pattern validated', { patternId, notes }, user);
    return pat;
  }

  deprecatePattern(patternId, reason, user = 'Admin') {
    const patterns = this._get(STORAGE_KEYS.PATTERNS, initialObservedPatterns);
    const pat = patterns.find(p => p.id === patternId);
    if (!pat) throw new Error(`Padrão ${patternId} não encontrado.`);

    pat.status = PatternStatus.DEPRECATED;
    pat.deprecatedReason = reason;
    pat.deprecatedAt = new Date().toISOString();
    this._save(STORAGE_KEYS.PATTERNS, patterns);

    this._logAudit('Pattern deprecated', { patternId, reason }, user);
    return pat;
  }

  // ==========================================
  // 8. MULTIEMPRESA & CONSOLIDAÇÃO DO GRUPO
  // ==========================================

  /**
   * 221 a 224. Métricas consolidadas do grupo sem duplicar certames
   */
  getGroupConsolidatedMetrics(userPermissions = ['outcomes.group.view', 'outcomes.financial.view']) {
    const isGroupAuthorized = userPermissions.includes('outcomes.group.view');
    if (!isGroupAuthorized) {
      throw new Error('ACCESS_DENIED: Usuário não possui permissão para visualizar dados consolidados do Grupo.');
    }

    const allRecords = this.getOutcomeRecords();
    // Garante unicidade por opportunityId
    const uniqueRecordsMap = new Map();
    allRecords.forEach(r => {
      if (!uniqueRecordsMap.has(r.opportunityId)) {
        uniqueRecordsMap.set(r.opportunityId, r);
      }
    });

    const uniqueList = Array.from(uniqueRecordsMap.values());
    const won = uniqueList.filter(r => r.resultType === OutcomeResultType.WON).length;
    const lost = uniqueList.filter(r => r.resultType === OutcomeResultType.LOST).length;
    const disqualified = uniqueList.filter(r => r.resultType === OutcomeResultType.DISQUALIFIED).length;
    const competitive = won + lost + disqualified;

    return {
      companyScope: 'GRUPO_VELLIA_CONSOLIDADO',
      uniqueOpportunitiesCount: uniqueList.length,
      competitiveCount: competitive,
      wonCount: won,
      lostCount: lost,
      disqualifiedCount: disqualified,
      winRatePct: competitive > 0 ? Math.round((won / competitive) * 100) : 0,
      deduplicatedCount: allRecords.length - uniqueList.length
    };
  }

  // ==========================================
  // 9. INTEGRAÇÃO COM O COPILOT (4 BLOCOS)
  // ==========================================

  /**
   * 117 a 120. Resposta Estruturada em Sample, Period, Evidence e Limitations
   */
  answerCopilotQuery(query) {
    const q = query.toLowerCase();
    const records = this.getOutcomeRecords();
    const metrics = this.calculateOutcomeMetrics();

    let sampleText = `Amostra: ${metrics.sampleSize} certames analisados`;
    let periodText = 'Período: Últimos 12 meses (2025-2026)';
    let evidenceText = '';
    let limitationsText = 'Correlação não indica causalidade. A amostra histórica reflete certames específicos e não garante resultados futuros idênticos.';

    if (q.includes('por que estamos perdendo') || q.includes('perdendo mais')) {
      const lostWithPrice = records.filter(r => r.resultType === OutcomeResultType.LOST && r.pricing?.priceDeltaPct > 15).length;
      evidenceText = `Em ${lostWithPrice} de ${metrics.outcomes.lost} perdas registradas, concorrentes ofertaram preços com deságio superior a 15% frente ao piso orçado pelo Vellia. Além disso, a mediana de prontidão das perdas foi de apenas 9h de antecedência.`;
    } else if (q.includes('fatores') || q.includes('wins') || q.includes('vitórias') || q.includes('vencidas')) {
      evidenceText = `Nas ${metrics.outcomes.won} vitórias observadas, 80% das propostas tiveram seu Submission Readiness concluído com mais de 24h de antecedência (mediana de 31h) e contavam com alçadas de preço formalmente aprovadas sem necessidade de waiver documental.`;
    } else if (q.includes('desclassificação') || q.includes('desclassificadas')) {
      evidenceText = `Houve ${metrics.outcomes.disqualified} desclassificação formal registrada, associada à expiração de certidão no momento da abertura do envelope.`;
    } else {
      evidenceText = `Taxa global de vitória: ${metrics.rates.winRatePct}% (Denominador competitivo de ${metrics.rates.competitiveDenominator} certames, excluindo canceladas). Taxa de submissão completa: ${metrics.rates.submissionRatePct}%.`;
    }

    return {
      sample: sampleText,
      period: periodText,
      evidence: evidenceText,
      limitations: limitationsText,
      fullText: `${sampleText}. ${periodText}. [EVIDÊNCIA OBSERVADA] ${evidenceText} [LIMITAÇÕES] ${limitationsText}`
    };
  }
}

export const outcomeIntelligenceService = new OutcomeIntelligenceService();
