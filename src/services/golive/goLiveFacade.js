/**
 * VELLIA LICITAÇÕES — FASE 22: GO-LIVE CONTROLADO + PILOTO REAL + OPERAÇÃO ASSISTIDA
 * goLiveFacade.js: Fachada Principal do Módulo de Go-Live
 */

import {
  GoLivePhase,
  PHASE_SEQUENCE,
  GoLiveApprovalDecision,
  IncidentSeverity,
  FeedbackType,
  PilotBacklogClassification,
  FeatureFlagStatus,
  DataHealthStatus,
  PilotGoals
} from './goLiveModels.js';

import { GoLivePilotService, INITIAL_COMPANIES } from './goLivePilotService.js';
import { AgentQualityService } from './agentQualityService.js';
import { IncidentManagementService } from './incidentManagementService.js';
import { PilotFeedbackService } from './pilotFeedbackService.js';
import {
  AssistedOperationService,
  OPERATIONAL_RUNBOOKS,
  OPERATIONAL_OWNERS,
  OPERATIONAL_MANUALS
} from './assistedOperationService.js';
import { DataIntegrityService } from './dataIntegrityService.js';
import { FirstSyncService, INITIAL_STABLE_SOURCES } from './firstSyncService.js';

export {
  GoLivePhase,
  PHASE_SEQUENCE,
  GoLiveApprovalDecision,
  IncidentSeverity,
  FeedbackType,
  PilotBacklogClassification,
  FeatureFlagStatus,
  DataHealthStatus,
  PilotGoals,
  GoLivePilotService,
  INITIAL_COMPANIES,
  AgentQualityService,
  IncidentManagementService,
  PilotFeedbackService,
  AssistedOperationService,
  OPERATIONAL_RUNBOOKS,
  OPERATIONAL_OWNERS,
  OPERATIONAL_MANUALS,
  DataIntegrityService,
  FirstSyncService,
  INITIAL_STABLE_SOURCES
};

export class GoLiveFacade {
  /**
   * Visão geral consolidada do Go-Live para dashboards rápidos
   */
  static getOverview() {
    const currentPhase = GoLivePilotService.getCurrentPhase();
    const checklist = GoLivePilotService.getChecklist();
    const pilotUsers = GoLivePilotService.getPilotUsers();
    const qualityMetrics = AgentQualityService.getQualityCenterMetrics();
    const incidentMetrics = IncidentManagementService.getIncidentMetrics();
    const surveyOverview = PilotFeedbackService.getSurveyOverview();
    const dailyReview = AssistedOperationService.getDailyHealthReview();
    const featureFreeze = AssistedOperationService.getFeatureFreezeStatus();
    const readiness = GoLivePilotService.evaluateReadiness();
    const pilotGoals = GoLivePilotService.getPilotGoals();

    return {
      currentPhase,
      isBlocked: checklist.isBlocked,
      statusText: checklist.statusText,
      checklist,
      pilotUsersCount: pilotUsers.length,
      qualityMetrics,
      incidentMetrics,
      surveyOverview,
      dailyReview,
      featureFreeze,
      readiness,
      pilotGoals
    };
  }
}
