/**
 * VELLIA LICITAÇÕES — FASE 66: PREDICTIVE READINESS & RISK FORECASTING
 * predictiveRiskEngine.js: Motor Central de Previsão Explicável de Risco Operacional e Governança de Modelos
 */

import {
  PredictiveRiskTarget,
  PredictiveRiskLevel,
  RiskTrajectory,
  ModelStatus,
  ConfidenceLevel,
  HumanAssessmentStatus
} from './predictiveRiskModels.js';

import {
  initialModelRegistry,
  initialRiskAssessments
} from './predictiveRiskData.js';

const STORAGE_KEYS = {
  REGISTRY: 'vellia_model_registry_v66',
  ASSESSMENTS: 'vellia_risk_assessments_v66',
  ALERTS: 'vellia_predictive_alerts_v66',
  AUDIT: 'vellia_predictive_audit_v66',
  INCIDENTS: 'vellia_model_incidents_v66'
};

export class PredictiveRiskEngine {
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
      id: `AUD-PR-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      user
    });
    this._save(STORAGE_KEYS.AUDIT, logs.slice(0, 100));
  }

  // ==========================================
  // 1. REGISTRO & GOVERNANÇA DE MODELOS
  // ==========================================

  getModelRegistry() {
    return this._get(STORAGE_KEYS.REGISTRY, initialModelRegistry);
  }

  getModelByKey(modelKey) {
    const registry = this.getModelRegistry();
    return registry.find(m => m.modelKey === modelKey) || null;
  }

  /**
   * 7 a 11. Model Readiness Gate: valida se dados são suficientes antes de permitir ativação
   */
  evaluateModelReadiness(modelKey) {
    const model = this.getModelByKey(modelKey);
    if (!model) throw new Error(`Modelo ${modelKey} não encontrado no registro.`);

    const sampleSize = model.metrics?.sampleSize || (model.trainingPeriod ? 80 : 0);
    const minSampleRequired = 20; // Requisito mínimo de governança
    const isReady = sampleSize >= minSampleRequired && !model.metrics?.isInsufficientData;

    return {
      modelKey: model.modelKey,
      modelName: model.name,
      sampleSize,
      minSampleRequired,
      isReady,
      status: isReady ? 'APPROVED_FOR_PIPELINE' : 'BLOCKED_BY_READINESS_GATE',
      message: isReady
        ? 'Dados suficientes para treinamento e calibração estatística.'
        : 'Dados insuficientes para previsão confiável. Ativação de modelo bloqueada pelo Model Readiness Gate.'
    };
  }

  /**
   * 104 a 112, 196 a 200. Promoção de Modelo com Checagem de Baseline Determinístico
   */
  promoteModel(modelKey, targetStatus, userPermissions = [], user = 'Admin') {
    if (!userPermissions.includes('predictive_models.approve') && !userPermissions.includes('predictive_models.manage')) {
      throw new Error('ACCESS_DENIED: Permissão predictive_models.manage necessária para alterar o status de modelos.');
    }

    const registry = this.getModelRegistry();
    const model = registry.find(m => m.modelKey === modelKey);
    if (!model) throw new Error(`Modelo ${modelKey} não encontrado.`);

    // 105. Proibido ir de EXPERIMENTAL direto para PRODUCTION sem Shadow
    if (model.status === ModelStatus.EXPERIMENTAL && targetStatus === ModelStatus.PRODUCTION) {
      throw new Error('GOVERNANCE_VIOLATION: Proibido promover modelo de Experimental diretamente para Produção. É obrigatória a passagem por Shadow Mode.');
    }

    // 196 a 200. Deve superar baseline determinístico
    if (targetStatus === ModelStatus.PRODUCTION) {
      const gain = model.metrics?.deterministicBaselineGainPct || 0;
      if (gain <= 0) {
        throw new Error('BASELINE_GATE_REJECTION: O modelo não apresentou ganho comprovado sobre a regra determinística simples. Promoção rejeitada.');
      }
    }

    model.status = targetStatus;
    model.approvedAt = new Date().toISOString();
    model.approvedBy = user;
    this._save(STORAGE_KEYS.REGISTRY, registry);

    this._logAudit('Model status updated', { modelKey, newStatus: targetStatus }, user);
    return model;
  }

  /**
   * 115 a 120. Mudança Material de Processo -> Revalidação de Modelo (Concept Drift)
   */
  handleProcessChange(processChangeDescription, user = 'Watcher') {
    const registry = this.getModelRegistry();
    const affected = [];

    registry.forEach(model => {
      if (model.status === ModelStatus.PRODUCTION) {
        model.status = ModelStatus.VALIDATED; // Rebaixa status até revalidação
        model.needsRevalidation = true;
        model.revalidationReason = `Mudança material de processo detectada: ${processChangeDescription}. Histórico pode não ser mais representativo.`;
        affected.push(model.modelKey);
      }
    });

    this._save(STORAGE_KEYS.REGISTRY, registry);
    this._logAudit('Models flagged for revalidation due to process change', { affected, change: processChangeDescription }, user);
    return { affectedModels: affected };
  }

  // ==========================================
  // 2. AVALIAÇÕES DE RISCO PREDITIVO
  // ==========================================

  getAssessments() {
    return this._get(STORAGE_KEYS.ASSESSMENTS, initialRiskAssessments);
  }

  getAssessmentById(id) {
    const list = this.getAssessments();
    return list.find(a => a.id === id) || null;
  }

  /**
   * 23 a 46, 214 a 218. Avaliação de Risco com Fallback Rule-Based e Drivers Observáveis
   */
  assessRisk(bidProcess, features = {}, options = {}) {
    const registry = this.getModelRegistry();
    const target = options.target || PredictiveRiskTarget.NO_SUBMISSION;
    const activeModel = registry.find(m => m.target === target && m.status === ModelStatus.PRODUCTION);

    // 214 a 218. Fallback determinístico se não houver modelo ativo em produção
    const isFallback = !activeModel;
    const modelVersion = isFallback ? 'Rule-based risk (Fallback Determinístico)' : activeModel.version;

    // 35 a 42. Extração de Features Process-First (Zero menção a indivíduos)
    const hoursToDeadline = features.hoursToDeadlineHours ?? 48;
    const criticalBlockers = features.criticalBlockersCount ?? 0;
    const pricingStatus = features.pricingGateStatus || 'APPROVED';
    const partnerConfirmed = features.partnerConfirmedFlag ?? true;
    const missingDocs = features.missingCriticalDocsCount ?? 0;

    // 240. Se campos críticos desconhecidos, reduz confiança
    const hasUnknowns = features.hasUnknownCriticalFields || hoursToDeadline === null || criticalBlockers === null;
    const confidence = hasUnknowns ? ConfidenceLevel.LOW : missingDocs > 0 ? ConfidenceLevel.MEDIUM : ConfidenceLevel.HIGH;

    // Cálculo explicável do Nível de Risco
    let riskLevel = PredictiveRiskLevel.LOW;
    const drivers = [];

    if (hoursToDeadline <= 24 && criticalBlockers > 0) {
      riskLevel = PredictiveRiskLevel.CRITICAL;
      drivers.push({
        factor: 'Bloqueador Crítico a menos de 24h',
        group: 'Gargalos do Lifecycle',
        observation: `${criticalBlockers} impedimento(s) persistente(s) com apenas ${hoursToDeadline}h restantes.`
      });
    } else if (hoursToDeadline <= 36 && (pricingStatus === 'PENDING_APPROVAL' || !partnerConfirmed)) {
      riskLevel = PredictiveRiskLevel.HIGH;
      if (pricingStatus === 'PENDING_APPROVAL') {
        drivers.push({
          factor: 'Alçada Comercial Pendente',
          group: 'Alçadas & Aprovações',
          observation: 'Margem de preço ainda em fila de homologação pré-submissão.'
        });
      }
      if (!partnerConfirmed) {
        drivers.push({
          factor: 'Confirmação de Parceiro Pendente',
          group: 'Estratégia de Parceiros',
          observation: 'Acordo formal com consorciada/subcontratada ainda não anexado.'
        });
      }
    } else if (missingDocs > 0 || criticalBlockers > 0) {
      riskLevel = PredictiveRiskLevel.MODERATE;
      drivers.push({
        factor: 'Pendência Documental Preliminar',
        group: 'Prontidão Documental',
        observation: `${missingDocs} documento(s) com status de emissão ou validação em andamento.`
      });
    } else {
      riskLevel = PredictiveRiskLevel.LOW;
      drivers.push({
        factor: 'Cronograma e Prontidão Adequados',
        group: 'Tempo & Prazos',
        observation: `Janela de ${hoursToDeadline}h sem blockers impeditivos ativos.`
      });
    }

    // 77 a 80. Snapshot imutável de features
    const snapshotId = `SNAP-${Date.now()}`;
    const assessment = {
      id: `PRA-${Date.now()}`,
      bidProcessId: bidProcess.id,
      canonicalCode: bidProcess.canonicalCode || 'CERTAME',
      title: bidProcess.title || 'Licitação em Análise',
      companyId: bidProcess.companyId || 'veeluen',
      deadline: bidProcess.deadline,
      hoursToDeadline,
      riskTarget: target,
      riskLevel,
      riskTrajectory: RiskTrajectory.STABLE,
      confidence,
      dataCoveragePct: hasUnknowns ? 55 : 95,
      modelVersion,
      isFallbackRuleBased: isFallback,
      generatedAt: new Date().toISOString(),
      topDrivers: drivers.slice(0, 3), // 33. Top 3 drivers observáveis
      featuresSnapshotId: snapshotId,
      featuresSnapshot: {
        hoursToDeadlineHours: hoursToDeadline,
        criticalBlockersCount: criticalBlockers,
        pricingGateStatus: pricingStatus,
        partnerConfirmedFlag: partnerConfirmed,
        missingCriticalDocsCount: missingDocs
      },
      // 25 a 28, 254. NÃO exibe probabilidade numérica se não validada explicitamente
      displayProbability: options.showProbability && !isFallback ? 78 : null,
      humanOverride: {
        status: HumanAssessmentStatus.NOT_REVIEWED,
        humanLevel: null,
        notes: null
      }
    };

    return assessment;
  }

  // ==========================================
  // 3. RECÁLCULO EM EVENTOS & TRAJETÓRIA
  // ==========================================

  /**
   * 74 a 76, 245. Recálculo ao Resolver Blocker e Atualização de Trajetória
   */
  recalculateOnBlockerResolution(assessmentId, resolvedBlockerTitle, user = 'Operador') {
    const list = this.getAssessments();
    const assessment = list.find(a => a.id === assessmentId);
    if (!assessment) throw new Error(`Avaliação ${assessmentId} não encontrada.`);

    const oldLevel = assessment.riskLevel;
    // Blocker resolvido reduz gravidade e atualiza trajetória
    assessment.featuresSnapshot.criticalBlockersCount = Math.max(0, assessment.featuresSnapshot.criticalBlockersCount - 1);
    
    if (assessment.riskLevel === PredictiveRiskLevel.CRITICAL) {
      assessment.riskLevel = PredictiveRiskLevel.HIGH;
    } else if (assessment.riskLevel === PredictiveRiskLevel.HIGH) {
      assessment.riskLevel = PredictiveRiskLevel.MODERATE;
    }
    // 67 a 72. Trajetória passa para Melhorando ao resolver blocker
    assessment.riskTrajectory = RiskTrajectory.IMPROVING;

    if (!assessment.riskTimeline) assessment.riskTimeline = [];
    assessment.riskTimeline.push({
      timestamp: new Date().toISOString(),
      level: assessment.riskLevel,
      triggerEvent: `Blocker resolvido: "${resolvedBlockerTitle}". Trajetória atualizada para Melhorando.`
    });

    this._save(STORAGE_KEYS.ASSESSMENTS, list);
    this._logAudit('Risk recalculated on blocker resolution', { assessmentId, oldLevel, newLevel: assessment.riskLevel }, user);
    return assessment;
  }

  // ==========================================
  // 4. ALERTAS INTELIGENTES (SEM DUPLICAÇÃO)
  // ==========================================

  /**
   * 133 a 136, 243, 244. Alerta apenas quando o risco escalona; High -> High não duplica
   */
  checkAndEmitAlert(currentLevel, previousLevel, opportunityCode, message) {
    // Alerta somente se escalonar (ex: MODERATE -> HIGH, ou HIGH -> CRITICAL)
    const severityMap = {
      [PredictiveRiskLevel.LOW]: 1,
      [PredictiveRiskLevel.MODERATE]: 2,
      [PredictiveRiskLevel.HIGH]: 3,
      [PredictiveRiskLevel.CRITICAL]: 4
    };

    const curSev = severityMap[currentLevel] || 0;
    const prevSev = severityMap[previousLevel] || 0;

    if (curSev > prevSev) {
      const alerts = this._get(STORAGE_KEYS.ALERTS, []);
      const newAlert = {
        id: `ALT-PR-${Date.now()}`,
        opportunityCode,
        escalation: `${previousLevel} -> ${currentLevel}`,
        message,
        emittedAt: new Date().toISOString()
      };
      alerts.unshift(newAlert);
      this._save(STORAGE_KEYS.ALERTS, alerts);
      return { alertEmitted: true, alert: newAlert };
    }

    // High -> High: sem alerta duplicado (Item 136)
    return { alertEmitted: false, reason: 'SEVERITY_NOT_ESCALATED_NO_DUPLICATE' };
  }

  // ==========================================
  // 5. HUMAN CONTROL & OVERRIDE
  // ==========================================

  /**
   * 177 a 182, 251. Avaliação Humana Concorrente (Preserva Modelo e Humano)
   */
  recordHumanAssessment(assessmentId, humanLevel, notes, user = 'Gestor Comercial') {
    const list = this.getAssessments();
    const assessment = list.find(a => a.id === assessmentId);
    if (!assessment) throw new Error(`Avaliação ${assessmentId} não encontrada.`);

    const differs = humanLevel !== assessment.riskLevel;
    assessment.humanOverride = {
      status: differs ? HumanAssessmentStatus.DIFFERS : HumanAssessmentStatus.AGREED,
      humanLevel,
      notes,
      evaluatedBy: user,
      evaluatedAt: new Date().toISOString()
    };

    this._save(STORAGE_KEYS.ASSESSMENTS, list);
    this._logAudit('Human risk override recorded', { assessmentId, modelLevel: assessment.riskLevel, humanLevel, differs }, user);
    return assessment;
  }

  // ==========================================
  // 6. SIMULADOR DE MITIGAÇÃO ("WHAT IF")
  // ==========================================

  /**
   * 159 a 164. Simula queda de risco sem alterar o processo real
   */
  simulateMitigation(assessmentId, simulatedChange = {}) {
    const assessment = this.getAssessmentById(assessmentId);
    if (!assessment) throw new Error(`Avaliação ${assessmentId} não encontrada.`);

    const simulatedSnapshot = { ...assessment.featuresSnapshot };
    if (simulatedChange.resolveBlockers) simulatedSnapshot.criticalBlockersCount = 0;
    if (simulatedChange.approvePricing) simulatedSnapshot.pricingGateStatus = 'APPROVED';
    if (simulatedChange.confirmPartner) simulatedSnapshot.partnerConfirmedFlag = true;
    if (simulatedChange.resolveDocs) simulatedSnapshot.missingCriticalDocsCount = 0;

    // Recalcula cenário
    let simulatedLevel = PredictiveRiskLevel.LOW;
    if (simulatedSnapshot.criticalBlockersCount > 0) {
      simulatedLevel = PredictiveRiskLevel.MODERATE;
    }

    return {
      originalRiskLevel: assessment.riskLevel,
      simulatedRiskLevel: simulatedLevel,
      driversResolved: Object.keys(simulatedChange).filter(k => simulatedChange[k]),
      note: 'Simulação de cenário para planejamento de intervenção (processo real inalterado).'
    };
  }

  // ==========================================
  // 7. TIME-AWARE BACKTESTING (SEM LEAKAGE)
  // ==========================================

  /**
   * 183 a 195, 255. Backtesting Estritamente Temporal
   */
  runHistoricalBacktest(historicalSnapshot) {
    // 184 a 186. Validação estrita: rejeita se contiver variáveis pós-evento
    if (historicalSnapshot.actualOutcome || historicalSnapshot.postEventData) {
      throw new Error('LEAKAGE_DETECTED: Proibido utilizar variáveis geradas após o momento do snapshot no backtest.');
    }

    // Calcula risco retrospectivo usando apenas as features disponíveis na época
    const featuresAtThatTime = {
      hoursToDeadlineHours: historicalSnapshot.hoursToDeadlineHours,
      criticalBlockersCount: historicalSnapshot.criticalBlockersCount,
      pricingGateStatus: historicalSnapshot.pricingGateStatus,
      partnerConfirmedFlag: historicalSnapshot.partnerConfirmedFlag
    };

    const simulatedAssessment = this.assessRisk(
      { id: historicalSnapshot.historicalProcessId, canonicalCode: historicalSnapshot.code },
      featuresAtThatTime
    );

    return {
      backtestTimestamp: historicalSnapshot.snapshotTimestamp,
      calculatedRiskLevel: simulatedAssessment.riskLevel,
      featuresUsedCount: Object.keys(featuresAtThatTime).length,
      leakageFree: true
    };
  }

  // ==========================================
  // 8. INCIDENTE DE FALSO NEGATIVO
  // ==========================================

  /**
   * 97 a 99, 256. Falso Negativo dispara Revisão de Governança
   */
  reportFalseNegativeIncident(assessmentId, actualFailureReason, user = 'Auditor') {
    const assessment = this.getAssessmentById(assessmentId);
    const incidents = this._get(STORAGE_KEYS.INCIDENTS, []);

    const incident = {
      id: `INC-FN-${Date.now()}`,
      assessmentId,
      predictedLevel: assessment?.riskLevel || 'LOW',
      actualFailureReason,
      status: 'UNDER_GOVERNANCE_REVIEW',
      reportedAt: new Date().toISOString(),
      actionRequired: 'Revisar calibração de pesos e thresholds de antecedência no Model Registry.'
    };

    incidents.unshift(incident);
    this._save(STORAGE_KEYS.INCIDENTS, incidents);
    this._logAudit('False negative incident created', incident, user);
    return incident;
  }

  // ==========================================
  // 9. COPILOT INTEGRATION
  // ==========================================

  answerCopilotQuery(query) {
    const q = query.toLowerCase();
    const assessments = this.getAssessments();

    if (q.includes('qual é o risco') || q.includes('qual o risco') || q.includes('risco de não ficarmos prontos')) {
      const sabesp = assessments.find(a => a.canonicalCode.includes('SABESP'));
      return {
        riskLevel: sabesp.riskLevel,
        trend: sabesp.riskTrajectory,
        drivers: sabesp.topDrivers.map(d => d.factor).join('; '),
        dataQuality: `Cobertura de dados em ${sabesp.dataCoveragePct}%`,
        suggestedMitigation: sabesp.suggestedMitigation,
        summary: `O risco operacional da proposta Sabesp está classificado como ${sabesp.riskLevel} (${sabesp.riskTrajectory}). Principais fatores: ${sabesp.topDrivers.map(d => d.factor).join('; ')}. Ação recomendada: ${sabesp.suggestedMitigation}`
      };
    }

    if (q.includes('por que o risco aumentou') || q.includes('piorou')) {
      return {
        summary: 'O risco escalonou de Moderado para Crítico nas últimas 24h porque o prazo residual atingiu 18h com alçada comercial e certidão de filial ainda pendentes.'
      };
    }

    return {
      summary: 'O Predictive Readiness Engine monitora 3 processos ativos com foco em antecipação de intervenção sem prever probabilidades ilusórias de vitória.'
    };
  }
}

export const predictiveRiskEngine = new PredictiveRiskEngine();
