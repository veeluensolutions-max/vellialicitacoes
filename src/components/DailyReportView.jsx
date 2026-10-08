import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Sparkles, 
  Flame, 
  Building2, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Share2, 
  Filter, 
  Layers, 
  ChevronRight, 
  ExternalLink,
  History,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { DailyReportService } from '../services/agent/dailyReportService';
import './DailyReportView.css';

export default function DailyReportView({ onOpenOpportunityDetail }) {
  const reportsList = DailyReportService.listReports();
  const [selectedReportId, setSelectedReportId] = useState(() => reportsList[0]?.id || 'report-2026-10-07');
  const [exportNotice, setExportNotice] = useState(false);

  const currentReport = DailyReportService.getReportById(selectedReportId);

  const handleExportClick = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  return (
    <div className="daily-report-module-container">
      {/* Topo do Módulo */}
      <div className="report-header-block">
        <div className="report-title-wrap">
          <div className="report-icon-box">
            <FileText size={24} className="text-teal" />
          </div>
          <div>
            <div className="report-tag-row">
              <span className="report-mod-tag">INTELIGÊNCIA EXECUTIVA</span>
              <span className={`report-status-badge ${currentReport.status === 'PARCIAL' ? 'status-partial' : 'status-integral'}`}>
                {currentReport.status === 'PARCIAL' ? '⚠️ Relatório Parcial' : '✓ Relatório Consolidado'}
              </span>
            </div>
            <h1 className="report-main-title">{currentReport.title}</h1>
            <p className="report-subtitle">
              Síntese diária automatizada das 06:30 com triagem de editais públicos, aderência semântica e matriz de decisão comercial.
            </p>
          </div>
        </div>

        {/* Ações e Seletor de Histórico */}
        <div className="report-header-actions">
          {/* Seletor de Datas Históricas (Item 40) */}
          <div className="date-selector-group">
            <Calendar size={15} className="text-muted" />
            <select 
              value={selectedReportId} 
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="report-date-select mono"
            >
              {reportsList.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.date} — {r.id === reportsList[0].id ? 'Hoje (Mais recente)' : 'Histórico anterior'}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="btn-export-future"
            onClick={handleExportClick}
            title="Exportação de relatório executivo"
          >
            <Download size={15} />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="export-future-banner">
          <ShieldCheck size={16} />
          <span>Estrutura de exportação preparada para PDF, Excel e envio por E-mail corporativo (conforme especificação da Fase 7).</span>
        </div>
      )}

      {/* BLOCO 1: RESUMO EXECUTIVO (Item 17) */}
      <div className="report-section-card">
        <div className="section-card-header">
          <h3 className="section-card-title">1. Resumo Executivo da Rodada</h3>
          <span className="section-card-sub">Fontes: {currentReport.sourcesSummary}</span>
        </div>

        <div className="summary-exec-grid">
          <div className="exec-card-item">
            <span className="e-card-lbl">Oportunidades analisadas</span>
            <span className="e-card-val mono">{currentReport.summary.analyzedTotal}</span>
            <span className="e-card-sub">varredura completa</span>
          </div>

          <div className="exec-card-item border-teal">
            <span className="e-card-lbl">Novas hoje</span>
            <span className="e-card-val mono text-teal">{currentReport.summary.newTotal}</span>
            <span className="e-card-sub">recém-publicadas</span>
          </div>

          <div className="exec-card-item">
            <span className="e-card-lbl">Atualizadas</span>
            <span className="e-card-val mono">{currentReport.summary.updatedTotal}</span>
            <span className="e-card-sub">aditivos / prazos</span>
          </div>

          <div className="exec-card-item border-blue">
            <span className="e-card-lbl">Relacionadas aos serviços</span>
            <span className="e-card-val mono text-blue">{currentReport.summary.relatedTotal}</span>
            <span className="e-card-sub">match semântico &gt; 50%</span>
          </div>

          <div className="exec-card-item border-indigo">
            <span className="e-card-lbl">Aderência ≥ 70%</span>
            <span className="e-card-val mono text-indigo">{currentReport.summary.above70Total}</span>
            <span className="e-card-sub">boas oportunidades</span>
          </div>

          <div className="exec-card-item border-purple">
            <span className="e-card-lbl">Aderência ≥ 80%</span>
            <span className="e-card-val mono text-purple">{currentReport.summary.above80Total}</span>
            <span className="e-card-sub">alta compatibilidade</span>
          </div>

          <div className="exec-card-item border-critical">
            <span className="e-card-lbl">Prioridade crítica</span>
            <span className="e-card-val mono text-critical">{currentReport.summary.criticalTotal}</span>
            <span className="e-card-sub">score &gt; 90%</span>
          </div>
        </div>
      </div>

      {/* BLOCO 2: DESTAQUES DO DIA COM RECOMMENDATION SCORE (Itens 18, 19, 25, 26, 27) */}
      <div className="report-section-card">
        <div className="section-card-header">
          <div className="header-title-with-badge">
            <Flame size={18} className="text-critical" />
            <h3 className="section-card-title">2. Destaques Prioritários do Dia (Top Oportunidades)</h3>
          </div>
          <span className="section-card-sub">Ordenadas por prioridade, recommendation score e prazo</span>
        </div>

        <div className="highlights-cards-list">
          {currentReport.topHighlights && currentReport.topHighlights.length > 0 ? (
            currentReport.topHighlights.map((opp, idx) => (
              <div key={opp.id || idx} className="highlight-report-card">
                <div className="h-card-top">
                  <div className="h-card-badge-row">
                    <span className="h-portal-pill">{opp.portal}</span>
                    <span className="h-number-pill mono">{opp.number}</span>
                    <span className={`h-priority-pill priority-${opp.priority?.toLowerCase()}`}>
                      {opp.priority}
                    </span>
                    <span className="h-deadline-pill">
                      <Clock size={12} /> {opp.daysLeft} dias restantes
                    </span>
                  </div>

                  <div className="h-scores-box">
                    <div className="h-adherence-pill">
                      <Sparkles size={12} />
                      <span>{opp.adherence}% Aderência</span>
                    </div>
                    <div className={`h-recommendation-pill rec-${opp.recommendationAction?.toLowerCase().replace(' ', '-')}`}>
                      <span>Recomendação: <strong>{opp.recommendationAction}</strong> ({opp.recommendationScore} pts)</span>
                    </div>
                  </div>
                </div>

                <h4 className="h-card-title">{opp.title}</h4>

                <div className="h-meta-flow">
                  <div className="h-meta-item">
                    <span className="lbl">Contratante:</span>
                    <span className="val">{opp.client}</span>
                  </div>
                  <div className="h-meta-item">
                    <span className="lbl">Serviço:</span>
                    <span className="val text-teal font-semibold">{opp.service}</span>
                  </div>
                  <div className="h-meta-item">
                    <span className="lbl">Empresa Indicada:</span>
                    <span className="val text-navy font-bold">{opp.company}</span>
                  </div>
                  {opp.estimatedValue && (
                    <div className="h-meta-item">
                      <span className="lbl">Valor Estimado:</span>
                      <span className="val mono font-semibold">{opp.estimatedValue}</span>
                    </div>
                  )}
                </div>

                <div className="h-rationale-box">
                  <span className="rationale-lbl">Parecer do Vellia Agent:</span>
                  <p className="rationale-text">{opp.recommendationSummary}</p>
                </div>

                <div className="h-card-footer">
                  <span className="h-footer-note">Recomendação estratégica calculada pelo RecommendationScoreService</span>
                  {onOpenOpportunityDetail && (
                    <button 
                      className="btn-open-highlight-opp"
                      onClick={() => onOpenOpportunityDetail(opp.number)}
                    >
                      <span>Abrir Oportunidade Completa</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="empty-highlights-text">Nenhuma oportunidade com destaque crítico no relatório selecionado.</p>
          )}
        </div>
      </div>

      {/* BLOCO 3 & 4: RESUMO POR EMPRESA & RESUMO POR SERVIÇO (Itens 20 e 21) */}
      <div className="report-dual-grid">
        {/* Resumo por Empresa (Item 20) */}
        <div className="report-section-card">
          <div className="section-card-header">
            <div className="header-title-with-badge">
              <Building2 size={16} className="text-teal" />
              <h3 className="section-card-title">3. Resumo por Empresa (Família Vellia)</h3>
            </div>
          </div>

          <div className="company-summary-cards">
            {currentReport.companyBreakdown?.map((comp, idx) => (
              <div key={idx} className="company-report-box">
                <div className="comp-box-header">
                  <div className="comp-avatar">{comp.company.charAt(0)}</div>
                  <div>
                    <h4 className="comp-name">{comp.company}</h4>
                    <span className="comp-sub">Melhor oportunidade: {comp.topOpportunity}</span>
                  </div>
                </div>

                <div className="comp-metrics-row">
                  <div className="comp-metric-item">
                    <span className="lbl">Novas:</span>
                    <span className="val mono">{comp.newCount}</span>
                  </div>
                  <div className="comp-metric-item">
                    <span className="lbl">Alta Aderência:</span>
                    <span className="val mono text-teal font-bold">{comp.highAdherenceCount}</span>
                  </div>
                  <div className="comp-metric-item">
                    <span className="lbl">Críticas:</span>
                    <span className="val mono text-critical font-bold">{comp.criticalCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo por Serviço (Item 21) */}
        <div className="report-section-card">
          <div className="section-card-header">
            <div className="header-title-with-badge">
              <Wrench size={16} className="text-indigo" />
              <h3 className="section-card-title">4. Resumo por Especialidade Técnica</h3>
            </div>
          </div>

          <div className="services-summary-list">
            {currentReport.serviceBreakdown?.map((s, idx) => (
              <div key={idx} className="service-summary-row">
                <div className="service-info-col">
                  <span className="service-name-text">{s.service}</span>
                  <span className="service-count-text mono">{s.count} licitações</span>
                </div>
                <div className="service-progress-track">
                  <div 
                    className="service-progress-fill" 
                    style={{ width: `${Math.min(100, s.count * 25)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BLOCO 5, 6 & 7: RADAR DE PRAZOS, BAIXA ADERÊNCIA E MUDANÇAS DETECTADAS (Itens 22, 23, 24) */}
      <div className="report-triple-grid">
        {/* Radar de Prazos (Item 23) */}
        <div className="report-sub-card">
          <div className="sub-header">
            <Clock size={16} className="text-amber" />
            <h4 className="sub-title">Radar de Prazos</h4>
          </div>
          <div className="deadlines-report-list">
            <div className="deadline-report-box border-crit">
              <span className="lbl">Encerrando em até 3 dias</span>
              <span className="val mono text-critical">{currentReport.deadlineRadar?.within3Days || 0}</span>
            </div>
            <div className="deadline-report-box border-urg">
              <span className="lbl">Encerrando em até 7 dias</span>
              <span className="val mono text-amber">{currentReport.deadlineRadar?.within7Days || 0}</span>
            </div>
            <div className="deadline-report-box border-atn">
              <span className="lbl">Encerrando em até 15 dias</span>
              <span className="val mono">{currentReport.deadlineRadar?.within15Days || 0}</span>
            </div>
          </div>
        </div>

        {/* Resumo de Baixa Aderência (Item 22) */}
        <div className="report-sub-card">
          <div className="sub-header">
            <Layers size={16} className="text-muted" />
            <h4 className="sub-title">Sem Relevância Comercial</h4>
          </div>
          <div className="low-adherence-box">
            <p className="low-desc">
              Editais capturados que não atendem aos critérios prioritários da Família Vellia (mantidos no banco para auditoria):
            </p>
            <div className="low-stat-row">
              <div className="low-stat">
                <span className="lbl">Baixa Aderência (&lt;50%):</span>
                <span className="val mono">{currentReport.summary.lowAdherenceTotal}</span>
              </div>
              <div className="low-stat">
                <span className="lbl">Descartáveis / No-Go:</span>
                <span className="val mono">{currentReport.summary.discardableTotal}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mudanças Detectadas (Item 24) */}
        <div className="report-sub-card">
          <div className="sub-header">
            <History size={16} className="text-blue" />
            <h4 className="sub-title">Mudanças Detectadas</h4>
          </div>
          <div className="changes-report-list">
            {currentReport.detectedChanges && currentReport.detectedChanges.length > 0 ? (
              currentReport.detectedChanges.map((ch, idx) => (
                <div key={idx} className="change-report-item">
                  <div className="ch-top">
                    <span className="ch-opp mono">Edital {ch.opportunityNumber}</span>
                    <span className="ch-field">{ch.field}</span>
                  </div>
                  <div className="ch-val-row">
                    <span className="ch-old text-strike">{ch.previousValue}</span>
                    <span className="ch-arrow">→</span>
                    <span className="ch-new text-green">{ch.newValue}</span>
                  </div>
                  <span className="ch-reason">{ch.reason}</span>
                </div>
              ))
            ) : (
              <p className="no-changes-text">Nenhum aditivo de prazo registrado nas últimas 24 horas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
