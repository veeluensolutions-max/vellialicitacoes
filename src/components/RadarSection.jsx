import React from 'react';
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
import { radarData } from '../data/mockData';
import './RadarSection.css';

export default function RadarSection({ onSelectFilter }) {
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
                  <span className="portal-dot" /> {radarData.portal}
                </span>
                <span className="radar-window-badge">Últimas 24 horas</span>
              </div>
              <h2 className="radar-title">Monitoramento Ativo de Oportunidades Públicas</h2>
            </div>
          </div>

          <div className="radar-actions">
            <div className="radar-sync-status">
              <Activity size={14} className="sync-pulse-icon" />
              <span>{radarData.portalStatus}</span>
            </div>
          </div>
        </div>

        {/* Grade de Destaques das 24 Horas */}
        <div className="radar-grid-highlight">
          <div className="radar-stat-box box-analyzed">
            <div className="stat-box-label">Oportunidades analisadas</div>
            <div className="stat-box-value-row">
              <span className="stat-box-number">{radarData.analyzedTotal}</span>
              <span className="stat-box-sub">editais públicos</span>
            </div>
            <div className="stat-box-bar">
              <div className="stat-progress-bar" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="radar-stat-box box-related">
            <div className="stat-box-label">Relacionadas aos serviços</div>
            <div className="stat-box-value-row">
              <span className="stat-box-number text-teal">{radarData.relatedTotal}</span>
              <span className="stat-box-sub">match semântico positivo</span>
            </div>
            <div className="stat-box-bar">
              <div className="stat-progress-bar bg-teal" style={{ width: '75%' }} />
            </div>
          </div>

          <div className="radar-stat-box box-high-match">
            <div className="stat-box-label">Aderência superior a 70%</div>
            <div className="stat-box-value-row">
              <span className="stat-box-number text-indigo">{radarData.above70Total}</span>
              <span className="stat-box-sub">altamente recomendadas</span>
            </div>
            <div className="stat-box-bar">
              <div className="stat-progress-bar bg-indigo" style={{ width: '42%' }} />
            </div>
          </div>

          <div className="radar-stat-box box-critical">
            <div className="stat-box-label">Prioritárias (Ação imediata)</div>
            <div className="stat-box-value-row">
              <span className="stat-box-number text-critical">{radarData.priorityTotal}</span>
              <span className="stat-box-sub">score &gt; 90%</span>
            </div>
            <div className="stat-box-bar">
              <div className="stat-progress-bar bg-critical" style={{ width: '100%' }} />
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
              {radarData.tiers.map((tier, index) => (
                <div key={index} className="tier-item">
                  <div className="tier-info">
                    <span className="tier-label">{tier.label}</span>
                    <span className="tier-count">{tier.count} itens</span>
                  </div>
                  <div className="tier-progress-track">
                    <div 
                      className="tier-progress-fill" 
                      style={{ width: `${(tier.count / 14) * 100}%`, backgroundColor: tier.color }}
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
              {radarData.companyBreakdown.map((item, index) => (
                <div key={index} className="company-radar-item">
                  <div className="company-radar-left">
                    <div className="company-avatar-box">
                      {item.company.charAt(0)}
                    </div>
                    <div>
                      <h4 className="company-radar-name">{item.company}</h4>
                      <p className="company-radar-sub">
                        {item.company === 'Excelência Ambiental' 
                          ? 'Emissões, AERMOD, Isocinética, Qualidade do Ar'
                          : 'Operação/Manutenção ETE, NR-13 Caldeiras, Saneamento'}
                      </p>
                    </div>
                  </div>
                  <div className="company-radar-right">
                    <div className="company-stat-number">{item.count}</div>
                    <span className="company-stat-tag">Top: {item.topScore}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
