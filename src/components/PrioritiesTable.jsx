import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  ExternalLink, 
  Flame, 
  ArrowRight, 
  Filter, 
  SlidersHorizontal,
  Search,
  Sparkles,
  MapPin,
  ChevronRight
} from 'lucide-react';
import './PrioritiesTable.css';

export default function PrioritiesTable({ 
  opportunities, 
  onSelectOpportunity,
  externalSearchQuery = ''
}) {
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterTier, setFilterTier] = useState('ALL');

  // Filtragem combinada
  const filteredList = opportunities.filter((item) => {
    // Filtro por busca de texto (global ou local)
    if (externalSearchQuery.trim()) {
      const q = externalSearchQuery.toLowerCase();
      const matchText = 
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.identifiedService.toLowerCase().includes(q) ||
        item.recommendedCompany.toLowerCase().includes(q) ||
        item.portal.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      if (!matchText) return false;
    }

    // Filtro por Empresa
    if (filterCompany !== 'ALL' && item.recommendedCompany !== filterCompany) {
      return false;
    }

    // Filtro por Aderência
    if (filterTier === 'CRITICAL' && item.score < 90) return false;
    if (filterTier === 'HIGH' && (item.score < 80 || item.score >= 90)) return false;
    if (filterTier === 'GOOD' && (item.score < 70 || item.score >= 80)) return false;

    return true;
  });

  const getScoreBadgeClass = (score) => {
    if (score >= 90) return 'badge-critical';
    if (score >= 80) return 'badge-high';
    if (score >= 70) return 'badge-good';
    if (score >= 50) return 'badge-review';
    return 'badge-low';
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Alta prioridade') return 'status-badge-critical';
    if (status === 'Em análise') return 'status-badge-review';
    return 'status-badge-neutral';
  };

  return (
    <div className="priorities-table-card">
      {/* Header da Tabela */}
      <div className="table-header-block">
        <div className="table-title-area">
          <div className="table-title-row">
            <h3 className="table-main-title">Oportunidades em Destaque & Prioridades</h3>
            <span className="results-count-pill">{filteredList.length} identificadas</span>
          </div>
          <p className="table-subtitle">
            Classificadas automaticamente pelo Motor de Aderência com base no catálogo de serviços
          </p>
        </div>

        {/* Filtros Rápidos */}
        <div className="table-controls-row">
          <div className="filter-group">
            <span className="filter-label">
              <Filter size={13} /> Empresa:
            </span>
            <button 
              className={`filter-btn ${filterCompany === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterCompany('ALL')}
            >
              Todas
            </button>
            <button 
              className={`filter-btn ${filterCompany === 'Excelência Ambiental' ? 'active' : ''}`}
              onClick={() => setFilterCompany('Excelência Ambiental')}
            >
              Excelência Ambiental
            </button>
            <button 
              className={`filter-btn ${filterCompany === 'Veeluen Solutions' ? 'active' : ''}`}
              onClick={() => setFilterCompany('Veeluen Solutions')}
            >
              Veeluen Solutions
            </button>
          </div>

          <div className="filter-group">
            <span className="filter-label">Aderência:</span>
            <button 
              className={`filter-btn ${filterTier === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterTier('ALL')}
            >
              Todas
            </button>
            <button 
              className={`filter-btn ${filterTier === 'CRITICAL' ? 'active' : ''}`}
              onClick={() => setFilterTier('CRITICAL')}
            >
              &gt; 90%
            </button>
            <button 
              className={`filter-btn ${filterTier === 'HIGH' ? 'active' : ''}`}
              onClick={() => setFilterTier('HIGH')}
            >
              80–89%
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo da Tabela */}
      <div className="table-responsive-wrapper">
        <table className="corporate-table">
          <thead>
            <tr>
              <th>Oportunidade</th>
              <th>Portal</th>
              <th>Serviço Identificado</th>
              <th>Empresa Indicada</th>
              <th>Aderência</th>
              <th>Prazo</th>
              <th>Status</th>
              <th className="th-action">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-table-state">
                  Nenhuma oportunidade encontrada com os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <tr 
                  key={item.id} 
                  className="table-row-hover"
                  onClick={() => onSelectOpportunity(item)}
                >
                  {/* Oportunidade */}
                  <td className="td-opportunity">
                    <div className="opp-code-wrap">
                      <span className="opp-code mono">{item.id}</span>
                      <span className="opp-location">
                        <MapPin size={11} /> {item.location}
                      </span>
                    </div>
                    <span className="opp-title-snippet" title={item.title}>
                      {item.title}
                    </span>
                  </td>

                  {/* Portal */}
                  <td>
                    <span className="portal-pill">
                      <span className="portal-indicator" />
                      {item.portal}
                    </span>
                  </td>

                  {/* Serviço Identificado */}
                  <td className="td-service">
                    <span className="service-name-text">
                      {item.identifiedService}
                    </span>
                    <span className="service-client-sub" title={item.client}>
                      {item.client}
                    </span>
                  </td>

                  {/* Empresa Indicada */}
                  <td>
                    <div className="company-badge-wrap">
                      <div className={`company-mini-dot ${item.recommendedCompany === 'Excelência Ambiental' ? 'dot-green' : 'dot-blue'}`} />
                      <span className="company-name-text">{item.recommendedCompany}</span>
                    </div>
                  </td>

                  {/* Aderência */}
                  <td>
                    <div className="score-cell-group">
                      <span className={`badge ${getScoreBadgeClass(item.score)}`}>
                        {item.score}%
                      </span>
                      <div className="score-mini-bar">
                        <div 
                          className="score-mini-fill" 
                          style={{ 
                            width: `${item.score}%`,
                            backgroundColor: item.score >= 90 ? '#10B981' : item.score >= 80 ? '#0EA5E9' : '#6366F1'
                          }} 
                        />
                      </div>
                    </div>
                  </td>

                  {/* Prazo */}
                  <td>
                    <div className="deadline-badge">
                      <Clock size={13} className="deadline-icon" />
                      <span className="deadline-text mono">{item.daysLeft} dias</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`status-pill ${getStatusBadgeClass(item.status)}`}>
                      {item.status === 'Alta prioridade' && <Flame size={12} />}
                      {item.status}
                    </span>
                  </td>

                  {/* Ação */}
                  <td className="td-action" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="btn-analyze"
                      onClick={() => onSelectOpportunity(item)}
                      title="Abrir análise detalhada"
                    >
                      <span>Analisar</span>
                      <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Rodapé da Tabela */}
      <div className="table-footer-bar">
        <div className="table-legend">
          <span className="legend-item"><span className="legend-dot dot-critical" /> &gt; 90% Prioridade Crítica</span>
          <span className="legend-item"><span className="legend-dot dot-high" /> 80–89% Alta Aderência</span>
          <span className="legend-item"><span className="legend-dot dot-good" /> 70–79% Boa Oportunidade</span>
        </div>
        <div className="table-pagination-info">
          Exibindo {filteredList.length} de {opportunities.length} oportunidades no radar
        </div>
      </div>
    </div>
  );
}
