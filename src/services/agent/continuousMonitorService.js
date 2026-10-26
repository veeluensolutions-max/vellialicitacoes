/**
 * VELLIA LICITAÇÕES — SERVIÇO DE MONITORAMENTO CONTÍNUO EM BACKGROUND
 * Executa inspeções automáticas de prazos fatais de editais e validades de certidões/CNDs.
 */

import { OpportunityService } from '../opportunityService.js';
import { DocumentVaultService } from '../vault/documentVaultService.js';
import { AlertService, AlertType, AlertLevel } from './alertService.js';
import { EventBus, VELLIA_EVENTS } from '../eventBus.js';
import { tenderNotificationService } from '../notifications/tenderNotificationService.js';

class ContinuousMonitorService {
  constructor() {
    this.timerId = null;
    this.isRunning = false;
    this.lastInspectionAt = null;
    this.inspectionHistory = [];
  }

  /**
   * Converte string de data no formato DD/MM/YYYY ou YYYY-MM-DD para objeto Date
   */
  parseDate(dateStr) {
    if (!dateStr) return null;
    try {
      const parts = String(dateStr).split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
          // DD/MM/YYYY
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      }
      return new Date(dateStr);
    } catch {
      return null;
    }
  }

  /**
   * Toca um sinal sonoro sintetizado via Web Audio API (não necessita de arquivo de áudio externo)
   */
  playNotificationSound() {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // Ignora silenciosamente se o navegador bloquear autoplay de áudio
    }
  }

  /**
   * Executa a inspeção completa de prazos de editais e certidões
   */
  runInspection() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAlerts = AlertService.listAlerts(true);
    let alertsCreated = 0;

    // 1. INSPEÇÃO DE OPORTUNIDADES & PRAZOS DE SUBMISSÃO
    try {
      const opportunities = OpportunityService.listAll();
      for (const opp of opportunities) {
        const oppNumber = String(opp.number || opp.id);
        const days = opp.daysLeft !== undefined && opp.daysLeft !== null 
          ? opp.daysLeft 
          : OpportunityService.calculateDaysLeft(opp.endDate);

        // Alerta de Prazo Fatal (<= 1 dia)
        if (days <= 1 && days >= 0) {
          const alreadyNotified = existingAlerts.some(a => 
            a.opportunityNumber === oppNumber && 
            a.type === AlertType.DEADLINE_SHORT && 
            a.level === AlertLevel.CRITICAL
          );

          if (!alreadyNotified) {
            AlertService.createAlert({
              type: AlertType.DEADLINE_SHORT,
              level: AlertLevel.CRITICAL,
              title: `🚨 PRAZO FATAL (MENOS DE 24H) — #${oppNumber}`,
              opportunityNumber: oppNumber,
              opportunityTitle: opp.title || opp.object,
              client: opp.client,
              company: opp.recommendedCompany || 'Veeluen / Excelência Ambiental',
              service: opp.primaryService || opp.identifiedService,
              adherence: opp.score || 85,
              daysLeft: days,
              message: `O certame #${oppNumber} encerra em menos de 24 horas! Verifique envio de proposta e documentação imediatamente.`,
              portal: opp.portal || 'Petronect'
            });
            alertsCreated++;

            // Despacho corporativo automático se habilitado
            try {
              const settings = tenderNotificationService.getSettings();
              if (settings.autoEmailOnCriticalDeadline) {
                tenderNotificationService.dispatchEmail(opp, {
                  note: `[DISPARO AUTOMÁTICO] Menos de 24h para o encerramento do certame #${oppNumber}.`
                });
              }
            } catch (errNotif) {
              console.warn('[ContinuousMonitorService] Falha ao despachar notificação corporativa:', errNotif);
            }
          }
        } 
        // Alerta de Prazo Crítico (<= 3 dias)
        else if (days > 1 && days <= 3) {
          const alreadyNotified = existingAlerts.some(a => 
            a.opportunityNumber === oppNumber && 
            a.type === AlertType.DEADLINE_SHORT &&
            (a.message || '').includes('3 dias')
          );

          if (!alreadyNotified) {
            AlertService.createAlert({
              type: AlertType.DEADLINE_SHORT,
              level: AlertLevel.HIGH,
              title: `⏰ PRAZO CRÍTICO (${days} DIAS) — #${oppNumber}`,
              opportunityNumber: oppNumber,
              opportunityTitle: opp.title || opp.object,
              client: opp.client,
              company: opp.recommendedCompany || 'Veeluen / Excelência Ambiental',
              service: opp.primaryService || opp.identifiedService,
              adherence: opp.score || 85,
              daysLeft: days,
              message: `Faltam apenas ${days} dias para o encerramento do certame #${oppNumber} (${opp.client}).`,
              portal: opp.portal || 'Petronect'
            });
            alertsCreated++;
          }
        }
      }
    } catch (err) {
      console.warn('[ContinuousMonitorService] Erro ao inspecionar oportunidades:', err);
    }

    // 2. INSPEÇÃO DO COFRE DOCUMENTAL (CNDs, CATs e CERTIDÕES)
    try {
      const documents = DocumentVaultService.listDocuments();
      for (const doc of documents) {
        if (!doc.expiryDate) continue;
        const expiry = this.parseDate(doc.expiryDate);
        if (!expiry) continue;

        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const docId = doc.id || doc.documentNumber || doc.name;

        // Documento Vencido
        if (diffDays < 0) {
          const alreadyNotified = existingAlerts.some(a => 
            a.type === AlertType.DOCS_REQUIRED && 
            (a.message || '').includes(docId) &&
            a.level === AlertLevel.CRITICAL
          );

          if (!alreadyNotified) {
            AlertService.createAlert({
              type: AlertType.DOCS_REQUIRED,
              level: AlertLevel.CRITICAL,
              title: `❌ CERTIDÃO VENCIDA — ${doc.name}`,
              opportunityNumber: docId,
              opportunityTitle: doc.description || doc.name,
              client: doc.issuer || 'Órgão Emissor',
              company: doc.companyName || 'Empresa Cadastrada',
              service: 'Habilitação Jurídica e Fiscal',
              adherence: 0,
              daysLeft: 0,
              message: `A certidão "${doc.name}" (${docId}) da empresa ${doc.companyName} está VENCIDA desde ${doc.expiryDate}. Pode impedir participação em licitações!`,
              portal: 'Cofre de Documentos'
            });
            alertsCreated++;
          }
        } 
        // Documento a vencer em até 15 dias
        else if (diffDays <= 15) {
          const alreadyNotified = existingAlerts.some(a => 
            a.type === AlertType.DOCS_REQUIRED && 
            (a.message || '').includes(docId) &&
            a.level === AlertLevel.HIGH
          );

          if (!alreadyNotified) {
            AlertService.createAlert({
              type: AlertType.DOCS_REQUIRED,
              level: AlertLevel.HIGH,
              title: `⚠️ CERTIDÃO A VENCER (${diffDays} DIAS) — ${doc.name}`,
              opportunityNumber: docId,
              opportunityTitle: doc.description || doc.name,
              client: doc.issuer || 'Órgão Emissor',
              company: doc.companyName || 'Empresa Cadastrada',
              service: 'Habilitação Jurídica e Fiscal',
              adherence: 0,
              daysLeft: diffDays,
              message: `A certidão "${doc.name}" expira em ${diffDays} dias (${doc.expiryDate}). Providencie a renovação perante o emissor.`,
              portal: 'Cofre de Documentos'
            });
            alertsCreated++;
          }
        }
      }
    } catch (err) {
      console.warn('[ContinuousMonitorService] Erro ao inspecionar cofre documental:', err);
    }

    if (alertsCreated > 0) {
      this.playNotificationSound();
      EventBus.emit(VELLIA_EVENTS.ALERT_TRIGGERED, { alertsCreated });
    }

    this.lastInspectionAt = new Date().toISOString();
    return { alertsCreated, timestamp: this.lastInspectionAt };
  }

  /**
   * Inicia o monitoramento em background
   */
  start(intervalMs = 45000) {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Executa a primeira inspeção imediatamente
    this.runInspection();

    // Agenda execuções contínuas
    this.timerId = setInterval(() => {
      this.runInspection();
    }, intervalMs);
  }

  /**
   * Pausa o monitoramento
   */
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }
}

export const continuousMonitorService = new ContinuousMonitorService();
export default continuousMonitorService;
