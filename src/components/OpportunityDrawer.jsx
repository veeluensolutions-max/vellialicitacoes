import React from 'react';
import { 
  X, 
  ExternalLink, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  ShieldCheck,
  ChevronRight,
  Clock,
  Share2,
  FileSearch,
  Scale,
  FileSpreadsheet,
  Trophy
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { DecisionService } from '../services/decision/decisionService';
import { ProposalService } from '../services/proposal/proposalService';
import { ResultsIntelligenceService } from '../services/results/resultsIntelligenceService';
import ProposalDetailView from './ProposalDetailView';
import EditalAnalysisModal from './EditalAnalysisModal';
import './OpportunityDrawer.css';

export default function OpportunityDrawer({ opportunity, onClose }) {
  if (!opportunity) return null;

  const [showAnalysisModal, setShowAnalysisModal] = React.useState(false);
  const [activeProposalId, setActiveProposalId] = React.useState(null);

  const isCritical = opportunity.score >= 90;
  const isHigh = opportunity.score >= 80 && opportunity.score < 90;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Topo do Drawer */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-code-row">
              <span className="drawer-code mono">{opportunity.id}</span>
              <span className="drawer-portal-pill">{opportunity.portal}</span>
              <span className="drawer-modality-pill">{opportunity.modality}</span>
            </div>
            <h2 className="drawer-title">{opportunity.title}</h2>
            <p className="drawer-client-name">{opportunity.client}</p>
          </div>

          <button 
            className="drawer-close-btn" 
            onClick={onClose}
            aria-label="Fechar painel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Indicador de Aderência em Destaque */}
        <div className="drawer-score-hero">
          <div className="score-hero-left">
            <div className="score-hero-circle">
              <span className="score-hero-number">{opportunity.score}%</span>
              <span className="score-hero-scale">de aderência</span>
            </div>
            <div className="score-hero-verdict">
              <div className="verdict-tag">
                <Sparkles size={14} />
                <span>
                  {opportunity.score >= 90 ? 'ALTAMENTE COMPATÍVEL' : 
                   opportunity.score >= 80 ? 'ALTA COMPATIBILIDADE' : 'BOA COMPATIBILIDADE'}
                </span>
              </div>
              <h3 className="verdict-headline">Recomendação Estratégica Positiva</h3>
              <p className="verdict-sub">
                Empresa indicada pelo agente: <strong>{opportunity.recommendedCompany}</strong>
              </p>
              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', background: 'rgba(0, 229, 201, 0.12)', color: '#00E5C9', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800 }}>
                  Capability Score: 92% (Aptidão Alta)
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Cofre Documental Vellia</span>
              </div>
            </div>
          </div>

          <div className="score-hero-quick-meta">
            <div className="quick-meta-item">
              <Clock size={14} />
              <span>
                Prazo: <strong>{opportunity.daysLeft} dias</strong>
                <span className={`urgency-pill-mini urgency-${OpportunityService.getDeadlineUrgency(opportunity.daysLeft).level}`}>
                  {OpportunityService.getDeadlineUrgency(opportunity.daysLeft).label}
                </span>
              </span>
            </div>
            <div className="quick-meta-item">
              <MapPin size={14} />
              <span>Local: <strong>{opportunity.location}</strong></span>
            </div>
            <div className="quick-meta-item">
              <DollarSign size={14} />
              <span>Valor Est.: <strong>{opportunity.estimatedValue}</strong></span>
            </div>
          </div>
        </div>

        {/* Corpo com Abas / Seções */}
        <div className="drawer-body">
          {/* FASE 10: NÚCLEO EXECUTIVO DE DECISÃO ESTRATÉGICA (GO/NO-GO) */}
          {(() => {
            const dec = DecisionService.calculateDecision(opportunity);
            const hum = DecisionService.getHumanDecision(opportunity.id || opportunity.number);
            if (!dec) return null;

            return (
              <div className="drawer-section" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', paddingBottom: '18px' }}>
                <div className="section-title-wrap">
                  <Scale size={16} style={{ color: '#00E5C9' }} />
                  <h4 className="section-title">Decisão Estratégica • GO / NO-GO (Fase 10)</h4>
                </div>

                <div className={`drawer-decision-summary-card ${dec.badgeClass}`} style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(148, 163, 184, 0.15)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: '#FFF',
                        fontFamily: 'monospace'
                      }}>
                        {dec.decisionScore}%
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(0, 229, 201, 0.15)',
                        color: '#00E5C9'
                      }}>
                        {dec.recommendationTier}
                      </span>
                    </div>

                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      Decisão Humana: <strong style={{ color: hum?.currentDecision === 'GO' ? '#10B981' : hum?.currentDecision === 'NO-GO' ? '#EF4444' : '#CBD5E1' }}>{hum?.currentDecision || 'Pendente'}</strong>
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                    {dec.recommendationReason}
                  </p>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#94A3B8', borderTop: '1px solid rgba(148, 163, 184, 0.1)', paddingTop: '8px' }}>
                    <span>Risco: <strong style={{ color: dec.risks.riskScore > 40 ? '#F59E0B' : '#10B981' }}>{dec.risks.riskScore}% ({dec.risks.riskTier})</strong></span>
                    <span>Margem: <strong style={{ color: '#00E5C9' }}>~{dec.commercial.cenarioProvavel?.margemPercentual || 22}%</strong></span>
                    <span>Esforço: <strong style={{ color: '#CBD5E1' }}>{dec.operationalEffort}</strong></span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* FASE 12: MEMÓRIA COMERCIAL & INTELIGÊNCIA DE VITÓRIA (WIN POTENTIAL) */}
          {(() => {
            const winPot = ResultsIntelligenceService.calculateWinPotential(opportunity);
            const history = ResultsIntelligenceService.listResults().filter(r => 
              r.opportunityNumber === String(opportunity.id || opportunity.number) ||
              (opportunity.client && r.client.toLowerCase().includes(opportunity.client.toLowerCase().substring(0, 8))) ||
              (opportunity.identifiedService && r.service.toLowerCase().includes(opportunity.identifiedService.toLowerCase().substring(0, 8)))
            );
            const prevMatch = history[0];

            return (
              <div className="drawer-section" style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.15)', paddingBottom: '18px' }}>
                <div className="section-title-wrap">
                  <Trophy size={16} style={{ color: '#F59E0B' }} />
                  <h4 className="section-title">Inteligência de Vitória • Win Potential (Fase 12)</h4>
                </div>

                <div style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginTop: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: '#F59E0B',
                        fontFamily: 'monospace'
                      }}>
                        {winPot.score}/100
                      </span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#F59E0B'
                      }}>
                        {winPot.tier}
                      </span>
                    </div>

                    <span style={{ fontSize: '10px', color: '#64748B' }}>
                      Indicador Histórico de Atratividade (Item 29)
                    </span>
                  </div>

                  <p style={{ fontSize: '11.5px', color: '#CBD5E1', margin: 0, lineHeight: 1.45 }}>
                    <strong>Fatores ponderados:</strong> {winPot.explanation}
                  </p>

                  {prevMatch && (
                    <div style={{ 
                      marginTop: '4px', 
                      background: 'rgba(30, 41, 59, 0.7)', 
                      padding: '8px 10px', 
                      borderRadius: '6px', 
                      fontSize: '11px',
                      color: '#94A3B8',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#E2E8F0', fontWeight: '600' }}>Precedente em {prevMatch.client}:</span>
                        <span style={{ 
                          fontWeight: '700',
                          color: prevMatch.outcome === 'GANHA' ? '#10B981' : '#EF4444' 
                        }}>
                          {prevMatch.outcome} (Colocação: {prevMatch.ourPlacement}º)
                        </span>
                      </div>
                      <div>
                        Vencedor: <strong style={{ color: '#FFF' }}>{prevMatch.winningCompany}</strong> • Preço: <strong style={{ color: '#00E5C9' }}>{prevMatch.winningPrice ? ResultsIntelligenceService.formatCurrency(prevMatch.winningPrice) : 'Não informado'}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* SEÇÃO DA FASE 4: EXPLICAÇÃO DA PONTUAÇÃO (MOTOR DE ADERÊNCIA) */}
          <div className="drawer-section">
            <div className="section-title-wrap">
              <Sparkles size={16} className="section-icon-ai" />
              <h4 className="section-title">Explicação da Pontuação ({opportunity.score}%)</h4>
            </div>
            <div className="summary-box">
              <p className="summary-text">
                A nota de <strong>{opportunity.score}%</strong> ({opportunity.score >= 90 ? 'Prioridade Crítica' : opportunity.score >= 80 ? 'Alta Aderência' : 'Boa Oportunidade'}) foi atribuída pela correlação técnica direta do objeto com a <strong>{opportunity.recommendedCompany}</strong> ({opportunity.identifiedService}), alto grau de correspondência de termos técnicos no edital, histórico e proximidade operacional em {opportunity.location}.
              </p>

              {/* Matriz de Pesos da Fase 4 */}
              <div className="engine-weights-mini-list">
                <div className="mini-weight-item">
                  <div className="m-w-header">
                    <span>Compatibilidade Técnica</span>
                    <strong>{opportunity.score >= 90 ? '40.0 / 40 pts' : '36.0 / 40 pts'}</strong>
                  </div>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: opportunity.score >= 90 ? '100%' : '90%' }} />
                  </div>
                </div>

                <div className="mini-weight-item">
                  <div className="m-w-header">
                    <span>Palavras e Termos Relacionados</span>
                    <strong>{opportunity.score >= 90 ? '15.0 / 15 pts' : '13.5 / 15 pts'}</strong>
                  </div>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: opportunity.score >= 90 ? '100%' : '90%' }} />
                  </div>
                </div>

                <div className="mini-weight-item">
                  <div className="m-w-header">
                    <span>Empresa Compatível</span>
                    <strong>15.0 / 15 pts</strong>
                  </div>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="mini-weight-item">
                  <div className="m-w-header">
                    <span>Região ({opportunity.location?.split('-')[1]?.trim() || 'PE'})</span>
                    <strong>{opportunity.location?.includes('PE') ? '10.0 / 10 pts' : '8.5 / 10 pts'}</strong>
                  </div>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: opportunity.location?.includes('PE') ? '100%' : '85%' }} />
                  </div>
                </div>

                <div className="mini-weight-item">
                  <div className="m-w-header">
                    <span>Prioridade Comercial</span>
                    <strong>{opportunity.score >= 90 ? '10.0 / 10 pts' : '9.0 / 10 pts'}</strong>
                  </div>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: opportunity.score >= 90 ? '100%' : '90%' }} />
                  </div>
                </div>

                <div className="mini-weight-item">
                  <div className="m-w-header">
                    <span>Prazo ({opportunity.daysLeft} dias)</span>
                    <strong>{opportunity.daysLeft >= 10 ? '9.0 / 10 pts' : '7.5 / 10 pts'}</strong>
                  </div>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: opportunity.daysLeft >= 10 ? '90%' : '75%' }} />
                  </div>
                </div>
              </div>

              <div className="summary-tags-row" style={{ marginTop: '12px' }}>
                <span className="summary-tag-label">Termos e Palavras Identificadas pelo Motor:</span>
                <div className="tag-chips">
                  {opportunity.matchedKeywords?.map((kw, i) => (
                    <span key={i} className="keyword-chip">{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Por que esta oportunidade combina conosco? */}
          <div className="drawer-section">
            <div className="section-title-wrap">
              <CheckCircle2 size={16} className="section-icon-match" />
              <h4 className="section-title">Por que esta oportunidade combina conosco?</h4>
            </div>
            <div className="reasons-list">
              {opportunity.whyMatches?.map((reason, idx) => (
                <div key={idx} className="reason-item">
                  <div className="reason-bullet" />
                  <p className="reason-text">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Possíveis Riscos e Pontos de Atenção */}
          <div className="drawer-section">
            <div className="section-title-wrap">
              <AlertTriangle size={16} className="section-icon-risk" />
              <h4 className="section-title">Possíveis Riscos & Pontos de Atenção</h4>
            </div>
            <div className="risks-list">
              {opportunity.risks?.map((risk, idx) => (
                <div key={idx} className="risk-item">
                  <span className="risk-badge-mini">Atenção</span>
                  <p className="risk-text">{risk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cronograma e Origem */}
          <div className="drawer-section">
            <div className="section-title-wrap">
              <FileText size={16} className="section-icon-doc" />
              <h4 className="section-title">Informações do Processo</h4>
            </div>
            <div className="metadata-table-grid">
              <div className="meta-grid-item">
                <span className="meta-lbl">Publicação</span>
                <span className="meta-val">{opportunity.publishDate}</span>
              </div>
              <div className="meta-grid-item">
                <span className="meta-lbl">Fechamento das Propostas</span>
                <span className="meta-val">{opportunity.endDate}</span>
              </div>
              <div className="meta-grid-item">
                <span className="meta-lbl">Portal de Origem</span>
                <span className="meta-val">{opportunity.portal} (Público)</span>
              </div>
              <div className="meta-grid-item">
                <span className="meta-lbl">Status Comercial</span>
                <span className="meta-val">{opportunity.status}</span>
              </div>
            </div>

            {opportunity.url && (
              <div className="drawer-external-link-row">
                <a 
                  href={opportunity.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-drawer-external-petronect"
                  title="Abrir a oportunidade original no portal oficial do Petronect"
                >
                  <ExternalLink size={14} />
                  <span>Ver oportunidade no Petronect</span>
                </a>
                <span className="drawer-external-note">
                  Acesso seguro ao edital público oficial. Propostas e lances formais ocorrem exclusivamente no portal Petronect.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé do Drawer com Ações */}
        <div className="drawer-footer">
          <div className="drawer-footer-left">
            <span className="capture-info">Capturada automaticamente pelo Vellia Agent</span>
          </div>
          <div className="drawer-footer-actions">
            <button className="btn-secondary-action" onClick={onClose}>
              Fechar
            </button>
            <button 
              className="btn-primary-action"
              onClick={() => setShowAnalysisModal(true)}
              style={{
                backgroundColor: 'rgba(0, 229, 201, 0.15)',
                borderColor: '#00E5C9',
                color: '#00E5C9'
              }}
            >
              <FileSearch size={15} />
              <span>Analisar Edital (IA)</span>
            </button>
            <button 
              className="btn-primary-action"
              onClick={() => {
                const existing = ProposalService.listAll().find(p => String(p.opportunityNumber) === String(opportunity.number || opportunity.id));
                if (existing) {
                  setActiveProposalId(existing.id);
                } else {
                  const created = ProposalService.createProposalFromOpportunity(opportunity);
                  setActiveProposalId(created.id);
                }
              }}
              style={{
                backgroundColor: '#00E5C9',
                borderColor: '#00E5C9',
                color: '#061124',
                fontWeight: '800'
              }}
            >
              <FileSpreadsheet size={15} />
              <span>Gestão da Proposta</span>
            </button>
          </div>
        </div>

        {/* Modal de Análise Inteligente de Edital */}
        <EditalAnalysisModal 
          opportunityId={opportunity.id}
          isOpen={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
        />

        {/* Central Operacional de Proposta (Fase 11) */}
        {activeProposalId && (
          <ProposalDetailView 
            proposalId={activeProposalId}
            onClose={() => setActiveProposalId(null)}
          />
        )}
      </div>
    </div>
  );
}
