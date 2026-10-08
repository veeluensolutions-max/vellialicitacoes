import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  Plus, 
  FileCode2, 
  LayoutList, 
  LayoutGrid, 
  Flame, 
  Clock, 
  Building2, 
  MapPin, 
  ArrowRight, 
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Tag,
  RefreshCw
} from 'lucide-react';
import { OpportunityService, OpportunityStatus, PriorityLevel } from '../services/opportunityService';
import { PCAService } from '../services/multisource/pcaService';
import NewOpportunityModal from './NewOpportunityModal';
import JsonImportModal from './JsonImportModal';
import OpportunityDetailModal from './OpportunityDetailModal';
import EditalAnalysisModal from './EditalAnalysisModal';
import { FileSearch } from 'lucide-react';
import './OpportunitiesView.css';

export default function OpportunitiesView({ onOpenDetailGlobal }) {
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [showPcaTab, setShowPcaTab] = useState(false);
  const [reanalyzingAll, setReanalyzingAll] = useState(false);
  const [reprocessFeedback, setReprocessFeedback] = useState(null);
  
  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [selectedEditalAnalysisId, setSelectedEditalAnalysisId] = useState(null);

  // Filtros Avançados
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPortal, setFilterPortal] = useState('ALL');
  const [filterCompany, setFilterCompany] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [filterState, setFilterState] = useState('ALL');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Recarregar dados quando houver mutação
  const reloadData = () => {
    setOpportunities(OpportunityService.listAll());
  };

  // Reprocessamento Global de Aderência (Fase 6 - Item 32)
  const handleReanalyzeAll = () => {
    setReanalyzingAll(true);
    setReprocessFeedback(null);
    setTimeout(() => {
      const res = OpportunityService.reanalyzeAllOpportunities();
      setOpportunities(OpportunityService.listAll());
      setReanalyzingAll(false);
      setReprocessFeedback(`${res.total} oportunidades recalculadas com sucesso pelo Motor de Aderência!`);
      setTimeout(() => setReprocessFeedback(null), 4000);
    }, 600);
  };

  // Filtragem combinada multidimensional
  const filteredList = opportunities.filter((item) => {
    // 1. Busca Inteligente (número, contratante, objeto, serviço, empresa, cidade, estado, termos, tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        item.number?.toLowerCase().includes(q) ||
        item.client?.toLowerCase().includes(q) ||
        item.object?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.primaryService?.toLowerCase().includes(q) ||
        item.recommendedCompany?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.state?.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q)) ||
        item.matchedKeywords?.some(k => k.toLowerCase().includes(q));
      if (!match) return false;
    }

    // 2. Filtro de Portal
    if (filterPortal !== 'ALL' && item.portal !== filterPortal) return false;

    // 3. Filtro de Empresa
    if (filterCompany !== 'ALL' && item.recommendedCompany !== filterCompany) return false;

    // 4. Filtro de Prioridade
    if (filterPriority !== 'ALL' && item.priority !== filterPriority) return false;

    // 5. Filtro de Status
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;

    // 6. Filtro de Aderência Mínima
    if (filterMinScore > 0 && item.score < filterMinScore) return false;

    // 7. Filtro de Estado
    if (filterState !== 'ALL' && item.state !== filterState) return false;

    return true;
  });

  // Estatísticas Rápidas
  const totalCount = opportunities.length;
  const criticalCount = opportunities.filter(o => o.priority === 'Crítica' || o.score >= 90).length;
  const inReviewCount = opportunities.filter(o => o.status === 'Em análise' || o.status === 'Interessante').length;
  const newCount = opportunities.filter(o => o.status === 'Nova').length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterPortal('ALL');
    setFilterCompany('ALL');
    setFilterPriority('ALL');
    setFilterStatus('ALL');
    setFilterMinScore(0);
    setFilterState('ALL');
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 90) return 'badge-critical';
    if (score >= 80) return 'badge-high';
    if (score >= 70) return 'badge-good';
    if (score >= 50) return 'badge-review';
    return 'badge-low';
  };

  const getPriorityBadgeClass = (priority) => {
    if (priority === 'Crítica') return 'priority-badge-critical';
    if (priority === 'Alta') return 'priority-badge-high';
    if (priority === 'Média') return 'priority-badge-medium';
    return 'priority-badge-low';
  };

  return (
    <div className="opportunities-module-container">
      {/* Topo do Módulo com Métricas e Ações */}
      <div className="opp-header-block">
        <div className="opp-title-wrap">
          <div className="opp-icon-badge">
            <Compass size={22} className="text-teal" />
          </div>
          <div>
            <div className="opp-tag-row">
              <span className="opp-module-tag">CENTRO OPERACIONAL</span>
              <span className="opp-count-tag">{totalCount} no banco estruturado</span>
            </div>
            <h1 className="opp-main-title">Banco de Oportunidades & Licitações</h1>
            <p className="opp-subtitle">
              Gestão de editais capturados, importados ou cadastrados manualmente com classificação semântica contínua.
            </p>
          </div>
        </div>

        {/* Botões de Ação no Topo */}
        <div className="opp-actions-row">
          <button 
            className="btn-action-outline btn-reanalyze-all"
            onClick={handleReanalyzeAll}
            disabled={reanalyzingAll}
            title="Recalcula a aderência técnica de todas as oportunidades salvas sem acessar a rede externa"
          >
            <RefreshCw size={14} className={reanalyzingAll ? 'spinning' : ''} />
            <span>{reanalyzingAll ? 'Reprocessando...' : 'Reprocessar Aderência'}</span>
          </button>

          <button className="btn-action-outline" onClick={() => setIsJsonModalOpen(true)}>
            <FileCode2 size={15} />
            <span>Importar JSON</span>
          </button>

          <button className="btn-action-primary" onClick={() => setIsNewModalOpen(true)}>
            <Plus size={15} />
            <span>Nova Oportunidade</span>
          </button>
        </div>
      </div>

      {/* Banner de Feedback de Reprocessamento */}
      {reprocessFeedback && (
        <div className="reprocess-success-banner">
          <CheckCircle2 size={16} />
          <span>{reprocessFeedback}</span>
        </div>
      )}

      {/* Cards de Métricas Rápidas */}
      <div className="opp-summary-cards">
        <div className="summary-mini-card">
          <span className="mini-card-lbl">Total no Banco</span>
          <span className="mini-card-val">{totalCount}</span>
          <span className="mini-card-sub">Editais registrados</span>
        </div>
        <div className="summary-mini-card border-critical">
          <span className="mini-card-lbl">Prioridade Crítica (&gt;90%)</span>
          <span className="mini-card-val text-critical">{criticalCount}</span>
          <span className="mini-card-sub">Ação prioritária</span>
        </div>
        <div className="summary-mini-card border-blue">
          <span className="mini-card-lbl">Em Análise / Triagem</span>
          <span className="mini-card-val text-blue">{inReviewCount}</span>
          <span className="mini-card-sub">Funil comercial</span>
        </div>
        <div className="summary-mini-card border-green">
          <span className="mini-card-lbl">Novas sem Parecer</span>
          <span className="mini-card-val text-green">{newCount}</span>
          <span className="mini-card-sub">Recém-capturadas</span>
        </div>
      </div>

      {/* Barra de Seleção Rápida por Portal / PCA (Fase 15 - Itens 30, 31, 40) */}
      <div className="portal-quick-filter-bar">
        <button 
          className={`portal-filter-btn ${filterPortal === 'ALL' && !showPcaTab ? 'active' : ''}`}
          onClick={() => { setFilterPortal('ALL'); setShowPcaTab(false); }}
        >
          <span>Todos os Portais</span>
          <span className="portal-count-badge">{totalCount}</span>
        </button>
        <button 
          className={`portal-filter-btn portal-petro ${filterPortal === 'Petronect' && !showPcaTab ? 'active' : ''}`}
          onClick={() => { setFilterPortal('Petronect'); setShowPcaTab(false); }}
        >
          <span className="dot-portal petro"></span>
          <span>Petronect</span>
          <span className="portal-count-badge">{opportunities.filter(o => o.portal === 'Petronect').length}</span>
        </button>
        <button 
          className={`portal-filter-btn portal-pncp ${filterPortal === 'PNCP' && !showPcaTab ? 'active' : ''}`}
          onClick={() => { setFilterPortal('PNCP'); setShowPcaTab(false); }}
        >
          <span className="dot-portal pncp"></span>
          <span>PNCP</span>
          <span className="portal-count-badge">{opportunities.filter(o => o.portal === 'PNCP').length}</span>
        </button>
        <button 
          className={`portal-filter-btn portal-cgov ${filterPortal === 'Compras.gov.br' && !showPcaTab ? 'active' : ''}`}
          onClick={() => { setFilterPortal('Compras.gov.br'); setShowPcaTab(false); }}
        >
          <span className="dot-portal cgov"></span>
          <span>Compras.gov.br</span>
          <span className="portal-count-badge">{opportunities.filter(o => o.portal === 'Compras.gov.br').length}</span>
        </button>
        <button 
          className={`portal-filter-btn portal-pca ${showPcaTab ? 'active' : ''}`}
          onClick={() => setShowPcaTab(true)}
          title="Compras públicas planejadas antes da abertura do edital (Item 40)"
        >
          <span>🔮 Radar Antecipado (PCA)</span>
          <span className="portal-count-badge">3 Futuras</span>
        </button>
      </div>

      {/* Barra de Busca Inteligente + Alternância de Visualização */}
      <div className="opp-toolbar-card">
        <div className="search-and-toggle-row">
          {/* Campo de Busca Inteligente */}
          <div className="smart-search-wrapper">
            <Search size={16} className="search-icon-smart" />
            <input 
              type="text" 
              placeholder="Buscar por número, contratante, objeto, serviço, empresa, cidade, estado ou tag..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="smart-search-input"
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          {/* Botões de Ação na Toolbar */}
          <div className="toolbar-controls-group">
            <button 
              className={`btn-filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter size={14} />
              <span>Filtros Avançados</span>
              <ChevronDown size={13} className={`chevron-filter ${showAdvancedFilters ? 'rotated' : ''}`} />
            </button>

            <div className="view-mode-toggle">
              <button 
                className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Visualização em Lista / Tabela"
              >
                <LayoutList size={16} />
              </button>
              <button 
                className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                onClick={() => setViewMode('cards')}
                title="Visualização em Cards"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Painel Expansível de Filtros Avançados Combinados */}
        {showAdvancedFilters && (
          <div className="advanced-filters-panel">
            <div className="filters-grid">
              <div className="filter-item">
                <label>Portal</label>
                <select value={filterPortal} onChange={(e) => setFilterPortal(e.target.value)}>
                  <option value="ALL">Todos os Portais</option>
                  <option value="Petronect">Petronect</option>
                  <option value="PNCP">PNCP</option>
                  <option value="Compras.gov.br">Compras.gov.br</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Empresa Recomendada</label>
                <select value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
                  <option value="ALL">Todas as Empresas</option>
                  <option value="Excelência Ambiental">Excelência Ambiental</option>
                  <option value="Veeluen Solutions">Veeluen Solutions</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Prioridade</label>
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                  <option value="ALL">Todas as Prioridades</option>
                  <option value="Crítica">Crítica (90-100%)</option>
                  <option value="Alta">Alta (80-89%)</option>
                  <option value="Média">Média (70-79%)</option>
                  <option value="Baixa">Baixa (50-69%)</option>
                  <option value="Muito baixa">Muito baixa (&lt;50%)</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Status Interno</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="ALL">Todos os Status</option>
                  {Object.values(OpportunityStatus).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Aderência Mínima</label>
                <select value={filterMinScore} onChange={(e) => setFilterMinScore(Number(e.target.value))}>
                  <option value={0}>Qualquer pontuação</option>
                  <option value={50}>Acima de 50%</option>
                  <option value={70}>Acima de 70% (Boa)</option>
                  <option value={80}>Acima de 80% (Alta)</option>
                  <option value={90}>Acima de 90% (Crítica)</option>
                </select>
              </div>

              <div className="filter-item">
                <label>Estado (UF)</label>
                <select value={filterState} onChange={(e) => setFilterState(e.target.value)}>
                  <option value="ALL">Todos os Estados</option>
                  <option value="PE">Pernambuco (PE)</option>
                  <option value="BA">Bahia (BA)</option>
                  <option value="SP">São Paulo (SP)</option>
                  <option value="MG">Minas Gerais (MG)</option>
                  <option value="RS">Rio Grande do Sul (RS)</option>
                  <option value="RJ">Rio de Janeiro (RJ)</option>
                </select>
              </div>
            </div>

            <div className="filters-bottom-row">
              <span className="results-badge">{filteredList.length} de {totalCount} oportunidades encontradas</span>
              <button className="btn-reset-filters" onClick={handleResetFilters}>
                <RotateCcw size={12} />
                <span>Limpar Filtros</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PAINEL EXPERIMENTAL DO RADAR ANTECIPADO (PCA) (Itens 38 a 41) */}
      {showPcaTab ? (
        <div className="pca-panel-card">
          <div className="pca-header-row">
            <div>
              <span className="pca-badge">🔮 RADAR ANTECIPADO • PLANO DE CONTRATAÇÕES ANUAL (PNCP)</span>
              <h2>Compras Públicas Planejadas (Pré-Edital)</h2>
              <p className="pca-subtitle">
                Identificação estratégica de aquisições previstas no orçamento de órgãos públicos antes da publicação oficial do edital.
              </p>
            </div>
            <button className="btn-action-outline" onClick={() => setShowPcaTab(false)}>
              Voltar para Licitações Abertas
            </button>
          </div>

          <div className="pca-grid">
            {PCAService.getPlannedPurchases().map((pca) => (
              <div key={pca.id} className="pca-item-card">
                <div className="pca-card-top">
                  <span className="pca-tag-natureza">{pca.natureza}</span>
                  <span className="pca-tag-alerta">{pca.alertaTipo}</span>
                </div>
                <h3 className="pca-item-title">{pca.titulo}</h3>
                <p className="pca-item-obj">{pca.objetoPlanejado}</p>
                
                <div className="pca-meta-grid">
                  <div><strong>Órgão:</strong> {pca.orgao}</div>
                  <div><strong>Previsão de Abertura:</strong> <span className="text-teal font-semibold">{pca.previsaoLicitacao}</span></div>
                  <div><strong>Valor Planejado:</strong> {pca.valorEstimado}</div>
                  <div><strong>Local:</strong> {pca.municipio} - {pca.estado}</div>
                </div>

                <div className="pca-card-footer">
                  <span className="pca-area-chip">🏷️ {pca.areaTecnica}</span>
                  <span className="pca-source-lbl">Fonte: {pca.portal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="opportunities-table-card">
          <div className="table-wrapper">
            <table className="corporate-opp-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Portal</th>
                  <th>Contratante</th>
                  <th>Objeto Resumido</th>
                  <th>Serviço Identificado</th>
                  <th>Empresa</th>
                  <th>Aderência</th>
                  <th>Prazo</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th className="th-action">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="empty-state-cell">
                      Nenhuma oportunidade encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((opp) => (
                    <tr 
                      key={opp.id} 
                      className="opp-row-hover"
                      onClick={() => setSelectedDetailId(opp.id)}
                    >
                      {/* Número */}
                      <td className="td-number">
                        <span className="opp-num-text mono">{opp.number}</span>
                      </td>

                      {/* Portal */}
                      <td>
                        <div className="portal-cell-wrap">
                          <span className={`portal-badge-mini portal-${(opp.portal || 'petronect').toLowerCase().replace(/[^a-z]/g, '')}`}>
                            {opp.portal}
                          </span>
                          {opp.sources && opp.sources.length > 1 && (
                            <span className="cross-source-badge" title={`Disponível em: ${opp.sources.join(', ')}`}>
                              +{opp.sources.length - 1} fonte
                            </span>
                          )}
                          {opp.hasDiscrepancy && (
                            <span className="discrepancy-badge" title="Divergência detectada entre portais oficiais">
                              ⚠️ Divergência
                            </span>
                          )}
                          {opp.deadlineChanged && (
                            <span className="deadline-badge" title={opp.deadlineChangeNotice}>
                              📅 Prazo alterado
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contratante */}
                      <td className="td-client">
                        <span className="client-text" title={opp.client}>{opp.client}</span>
                        <span className="city-text">{opp.location}</span>
                      </td>

                      {/* Objeto Resumido */}
                      <td className="td-object">
                        <p className="object-snippet" title={opp.object}>
                          {opp.object}
                        </p>
                      </td>

                      {/* Serviço */}
                      <td className="td-service-col">
                        <span className="service-text">{opp.primaryService}</span>
                      </td>

                      {/* Empresa */}
                      <td>
                        <span className="company-text-pill">{opp.recommendedCompany}</span>
                      </td>

                      {/* Aderência */}
                      <td>
                        <span className={`badge ${getScoreBadgeClass(opp.score)}`}>
                          {opp.score}%
                        </span>
                      </td>

                      {/* Prazo */}
                      <td>
                        {(() => {
                          const urg = OpportunityService.getDeadlineUrgency(opp.daysLeft);
                          return (
                            <span 
                              className={`deadline-col mono deadline-${urg.level}`} 
                              title={`Encerramento: ${opp.endDate} — ${urg.label} (${opp.daysLeft} dias restantes)`}
                            >
                              <Clock size={12} /> {opp.daysLeft}d
                            </span>
                          );
                        })()}
                      </td>

                      {/* Prioridade */}
                      <td>
                        <span className={`priority-tag ${getPriorityBadgeClass(opp.priority)}`}>
                          {opp.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className="status-tag-cell">{opp.status}</span>
                      </td>

                      {/* Ação */}
                      <td className="td-action" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-open-edital"
                            onClick={() => setSelectedEditalAnalysisId(opp.id)}
                            title="Abrir Análise Inteligente do Edital (Fase 8)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: 'rgba(0, 229, 201, 0.1)',
                              border: '1px solid rgba(0, 229, 201, 0.3)',
                              color: '#00E5C9',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <FileSearch size={13} />
                            <span>Edital</span>
                          </button>
                          <button 
                            className="btn-open-analysis"
                            onClick={() => setSelectedDetailId(opp.id)}
                            title="Abrir página completa da oportunidade"
                          >
                            <span>Detalhes</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RESULTADOS: CARDS RESUMIDOS */
        <div className="opportunities-cards-grid">
          {filteredList.length === 0 ? (
            <div className="empty-cards-state">
              Nenhuma oportunidade encontrada com os filtros selecionados.
            </div>
          ) : (
            filteredList.map((opp) => (
              <div 
                key={opp.id} 
                className="opp-card-item"
                onClick={() => setSelectedDetailId(opp.id)}
              >
                <div className="opp-card-header">
                  <div className="opp-card-meta-left">
                    <span className="opp-card-portal">{opp.portal}</span>
                    <span className="opp-card-num mono">{opp.number}</span>
                  </div>
                  <span className={`badge ${getScoreBadgeClass(opp.score)}`}>
                    {opp.score}%
                  </span>
                </div>

                <div className="opp-card-client-row">
                  <span className="opp-card-client">{opp.client}</span>
                  <span className="opp-card-loc"><MapPin size={11} /> {opp.location}</span>
                </div>

                <h4 className="opp-card-title">{opp.title}</h4>
                <p className="opp-card-desc">{opp.object}</p>

                <div className="opp-card-service-box">
                  <span className="service-lbl">Serviço Principal:</span>
                  <strong className="service-val">{opp.primaryService}</strong>
                  <span className="company-val">{opp.recommendedCompany}</span>
                </div>

                <div className="opp-card-footer">
                  <div className="opp-card-footer-left">
                    <span className="opp-card-deadline mono">
                      <Clock size={12} /> {opp.daysLeft} dias restantes
                    </span>
                    <span className={`priority-tag-mini ${getPriorityBadgeClass(opp.priority)}`}>
                      {opp.priority}
                    </span>
                  </div>

                  <button 
                    className="btn-card-analyze"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDetailId(opp.id);
                    }}
                  >
                    <span>Analisar</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL DE CADASTRO MANUAL */}
      <NewOpportunityModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => reloadData()}
      />

      {/* MODAL DE IMPORTAÇÃO POR JSON */}
      <JsonImportModal 
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        onSuccess={() => reloadData()}
      />

      {/* PÁGINA / MODAL INDIVIDUAL DA OPORTUNIDADE */}
      <OpportunityDetailModal 
        opportunityId={selectedDetailId}
        isOpen={!!selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
        onUpdated={() => reloadData()}
      />

      {/* MÓDULO INTELIGENTE DE ANÁLISE DE EDITAL (FASE 8) */}
      <EditalAnalysisModal 
        opportunityId={selectedEditalAnalysisId}
        isOpen={!!selectedEditalAnalysisId}
        onClose={() => setSelectedEditalAnalysisId(null)}
      />
    </div>
  );
}
