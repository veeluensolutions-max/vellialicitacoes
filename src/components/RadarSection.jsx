import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Layers, 
  Activity, 
  Sparkles, 
  CheckCircle, 
  Building2, 
  ArrowRight,
  Flame,
  Globe2,
  Filter
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import './RadarSection.css';

export default function RadarSection({ onSelectFilter, onSelectCompany, onNavigateToOpportunities }) {
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());

  useEffect(() => {
    const unsub = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, () => {
      setOpportunities(OpportunityService.listAll());
    });
    return unsub;
  }, []);

  const handleCompanyClick = (companyName) => {
    const isExcel = (companyName || '').toLowerCase().includes('excel');
    const scope = isExcel ? 'excelencia-ambiental' : 'veeluen-solutions';
    const targetCompany = isExcel ? 'Excelência Ambiental' : 'Veeluen Solutions';

    if (onSelectCompany) {
      onSelectCompany(targetCompany);
    }
    if (onSelectFilter) {
      onSelectFilter({ company: targetCompany, companyScope: scope });
    }
    if (onNavigateToOpportunities) {
      onNavigateToOpportunities({ company: targetCompany, companyScope: scope });
    }

    // Disparo global de navegação e filtro
    window.dispatchEvent(new CustomEvent('vellia-navigate-tab', {
      detail: {
        tab: 'oportunidades',
        companyScope: scope,
        company: targetCompany
      }
    }));
  };

  const handleTierClick = (minScore) => {
    if (onSelectFilter) {
      onSelectFilter({ minScore });
    }
    window.dispatchEvent(new CustomEvent('vellia-navigate-tab', {
      detail: {
        tab: 'oportunidades',
        minScore
      }
    }));
  };

  const analyzedTotal = opportunities.length;
  const relatedTotal = opportunities.filter(o => (o.score || o.adherenceScore || 0) >= 50).length;
  const above70Total = opportunities.filter(o => (o.score || o.adherenceScore || 0) >= 70).length;
  const priorityTotal = opportunities.filter(o => (o.score || o.adherenceScore || 0) >= 90).length;

  const tiers = [
    { label: '90–100% (Prioridade Crítica)', count: priorityTotal, color: '#10B981' },
    { label: '80–89% (Alta Aderência)', count: opportunities.filter(o => { const s = o.score || o.adherenceScore || 0; return s >= 80 && s < 90; }).length, color: '#0EA5E9' },
    { label: '70–79% (Boa Oportunidade)', count: opportunities.filter(o => { const s = o.score || o.adherenceScore || 0; return s >= 70 && s < 80; }).length, color: '#6366F1' },
    { label: '50–69% (Em Análise)', count: opportunities.filter(o => { const s = o.score || o.adherenceScore || 0; return s >= 50 && s < 70; }).length, color: '#F59E0B' },
    { label: '< 50% (Baixa Aderência)', count: opportunities.filter(o => (o.score || o.adherenceScore || 0) < 50).length, color: '#94A3B8' }
  ];

  const excelOpps = opportunities.filter(o => (o.recommendedCompany || '').toLowerCase().includes('excel'));
  const veeluenOpps = opportunities.filter(o => (o.recommendedCompany || '').toLowerCase().includes('veeluen') || !o.recommendedCompany);

  const topExcel = excelOpps.reduce((max, o) => Math.max(max, o.score || o.adherenceScore || 0), 0);
  const topVeeluen = veeluenOpps.reduce((max, o) => Math.max(max, o.score || o.adherenceScore || 0), 0);

  const companyBreakdown = [
    { company: 'Excelência Ambiental', count: excelOpps.length, topScore: `${topExcel}%` },
    { company: 'Veeluen Solutions', count: veeluenOpps.length, topScore: `${topVeeluen}%` }
  ];

  const primaryPortal = opportunities.length > 0 && opportunities[0].portal ? opportunities[0].portal : 'PNCP / Compras.gov';

  return (
    <section className="radar-section-container">
      <div className="radar-card">
        {/* Topo do Radar */}
        <div className="radar-header">
          <div className="radar-title-group">
            <div className="radar-icon-badge">
              <Radar size={22} className="radar-rotating-icon" />
            </div>
            <div>
              <div className="radar-badge-row">
                <span className="radar-tag-main">RADAR DE OPORTUNIDADES</span>
                <span className="radar-portal-badge">
                  <span className="portal-dot" /> {primaryPortal}
                </span>
                <span className="radar-window-badge">Fontes Oficiais Ativas</span>
              </div>
              <h2 className="radar-title">Monitoramento Ativo de Oportunidades Públicas</h2>
            </div>
          </div>

          <div className="radar-actions">
            <div className="radar-sync-status">
              <Activity size={14} className="sync-pulse-icon" />
              <span>Conexão ativa e monitorando</span>
            </div>
          </div>
        </div>

        {/* Grade de Destaques das 24 Horas */}
        <div className="radar-grid-highlight">
          <div className="radar-stat-box box-analyzed">
            <div className="stat-box-label">Oportunidades no Radar</div>
            <div className="stat-box-value-row">
              <span className="stat-box-number">{analyzedTotal}</span>
              <span className="stat-box-sub">certames reais</span>
            </div>
            <div className="stat-box-bar">
              <div className="stat-progress-bar" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="radar-stat-box box-related">
            <div className="stat-box-label">Relacionadas aos serviços</div>
            <div className="stat-box-value-row">
              <span className="stat-box-number text-teal">{relatedTotal}</span>
              <span className="stat-box-sub">match semântico positivo</span>
            </div>
            <div className="stat-box-bar">
              <div className="stat-progress-bar bg-teal" style={{ width: `${analyzedTotal > 0 ? Math.round((relatedTotal / analyzedTotal) * 100) : 0}%` }} />
            </div>
          </div>

          <div className="radar-stat-box box-high-match">
            <div className="stat-box-label">Aderência superior a 70%</div>
            <div className="stat-box-value-row">
              <span className="stat-box-number text-indigo">{above70Total}</span>
              <span className="stat-box-sub">altamente recomendadas</span>
            </div>
            <div className="stat-box-bar">
              <div className="stat-progress-bar bg-indigo" style={{ width: `${analyzedTotal > 0 ? Math.round((above70Total / analyzedTotal) * 100) : 0}%` }} />
            </div>
          </div>

          <div className="radar-stat-box box-critical">
            <div className="stat-box-label">Prioritárias (Ação imediata)</div>
            <div className="stat-box-value-row">
              <span className="stat-box-number text-critical">{priorityTotal}</span>
              <span className="stat-box-sub">score &gt; 90%</span>
            </div>
            <div className="stat-box-bar">
              <div className="stat-progress-bar bg-critical" style={{ width: `${analyzedTotal > 0 ? Math.round((priorityTotal / analyzedTotal) * 100) : 0}%` }} />
            </div>
          </div>
        </div>

        {/* Distribuição por Faixas de Aderência e Por Empresa */}
        <div className="radar-breakdown-row">
          {/* Coluna 1: Distribuição por Escala de Aderência */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <div className="breakdown-title">
                <Layers size={16} />
                <span>Distribuição por Faixa de Aderência</span>
              </div>
              <span className="breakdown-pill">Classificação Semântica</span>
            </div>

            <div className="tier-list">
              {tiers.map((tier, index) => (
                <div 
                  key={index} 
                  className="tier-item clickable-tier"
                  onClick={() => handleTierClick(tier.minScore)}
                  title={`Clique para filtrar certames com aderência ${tier.label}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTierClick(tier.minScore); }}
                >
                  <div className="tier-info">
                    <span className="tier-label">{tier.label}</span>
                    <span className="tier-count">{tier.count} certames</span>
                  </div>
                  <div className="tier-progress-track">
                    <div 
                      className="tier-progress-fill" 
                      style={{ 
                        width: `${analyzedTotal > 0 ? Math.round((tier.count / analyzedTotal) * 100) : 0}%`, 
                        backgroundColor: tier.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 2: Empresas Recomendadas & Capacidade */}
          <div className="breakdown-card">
            <div className="breakdown-header">
              <div className="breakdown-title">
                <Building2 size={16} />
                <span>Oportunidades por Empresa Indicada</span>
              </div>
              <span className="breakdown-pill">Família Vellia</span>
            </div>

            <div className="company-radar-cards">
              {companyBreakdown.map((item, index) => {
                const isExcel = item.company.includes('Excelência');
                return (
                  <button
                    key={index}
                    type="button"
                    className={`company-radar-item ${isExcel ? 'excelencia' : 'veeluen'}`}
                    onClick={() => handleCompanyClick(item.company)}
                    title={`Clique para ver as ${item.count} oportunidades do dia para ${item.company}`}
                    aria-label={`Ver oportunidades do dia para ${item.company}`}
                  >
                    <div className="company-radar-left">
                      <div className={`company-avatar-box ${isExcel ? 'avatar-excel' : 'avatar-veeluen'}`}>
                        {item.company.charAt(0)}
                      </div>
                      <div className="company-info-text">
                        <h4 className="company-radar-name">{item.company}</h4>
                        <p className="company-radar-sub">
                          {isExcel 
                            ? 'Emissões, AERMOD, Isocinética, Qualidade do Ar'
                            : 'Operação/Manutenção ETE, NR-13 Caldeiras, Saneamento'}
                        </p>
                      </div>
                    </div>
                    <div className="company-radar-right">
                      <div className="company-stat-number">{item.count}</div>
                      <span className="company-stat-tag">Top: {item.topScore}</span>
                      <span className="company-action-hint">
                        Ver certames <ArrowRight size={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
