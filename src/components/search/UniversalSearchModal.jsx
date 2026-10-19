import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Building2, 
  Compass, 
  FileText, 
  FileSpreadsheet, 
  FileSignature, 
  User, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Star, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2, 
  HelpCircle, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  ChevronRight, 
  GitBranch, 
  Network,
  RefreshCw
} from 'lucide-react';
import { 
  universalSearchService 
} from '../../services/search/universalSearchService.js';
import { 
  knowledgeGraphService, 
  EntityCategory, 
  RelationStatus 
} from '../../services/knowledgeGraph/knowledgeGraphService.js';
import './UniversalSearchModal.css';

export default function UniversalSearchModal({ 
  isOpen, 
  onClose, 
  onNavigateTo, 
  currentUser = { role: 'ADMIN', companyScope: 'ALL' } 
}) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchResults, setSearchResults] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeViewMode, setActiveViewMode] = useState('split'); // split, graph, dedup
  const [copiedId, setCopiedId] = useState(null);
  const [localGraph, setLocalGraph] = useState(null);
  const [traceabilityChain, setTraceabilityChain] = useState([]);
  const [dedupList, setDedupList] = useState([]);
  const inputRef = useRef(null);

  // Carrega histórico e inicialização
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(universalSearchService.getRecentSearches());
      setRecentItems(universalSearchService.getRecentItems());
      setFavorites(universalSearchService.getFavorites());
      setDedupList(knowledgeGraphService.getEntityAliases());
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Executa a busca debounced
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      setSelectedEntity(null);
      return;
    }

    const timer = setTimeout(() => {
      const results = universalSearchService.search(
        query,
        { entityType: activeCategory },
        currentUser
      );
      setSearchResults(results);

      // Auto-seleciona o primeiro resultado para o Knowledge Panel
      if (results.allResults.length > 0) {
        handleSelectEntity(results.allResults[0]);
      } else {
        setSelectedEntity(null);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, activeCategory]);

  // Atualiza painel lateral de conhecimento quando seleciona entidade
  const handleSelectEntity = (item) => {
    setSelectedEntity(item);
    universalSearchService.recordRecentItem(item);
    setRecentItems(universalSearchService.getRecentItems());

    // Carrega grafo local e rastreabilidade
    const graph = knowledgeGraphService.getLocalContextualGraph(item.id, 2);
    setLocalGraph(graph);

    const chain = knowledgeGraphService.getTraceabilityChain(item.id);
    setTraceabilityChain(chain);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFav = (item, e) => {
    e.stopPropagation();
    universalSearchService.toggleFavorite(item);
    setFavorites(universalSearchService.getFavorites());
  };

  const handleOpenModule = (item) => {
    if (!item) return;
    onClose();
    if (onNavigateTo) {
      switch (item.entityType) {
        case EntityCategory.OPPORTUNITY:
          onNavigateTo('oportunidades', { id: item.id });
          break;
        case EntityCategory.ORGANIZATION:
        case EntityCategory.CONTACT:
          onNavigateTo('relacionamento', { id: item.id });
          break;
        case EntityCategory.CONTRACT:
          onNavigateTo('contratos', { id: item.id });
          break;
        case EntityCategory.PROPOSAL:
          onNavigateTo('propostas', { id: item.id });
          break;
        case EntityCategory.DOCUMENT:
        case EntityCategory.ATTESTATION:
        case EntityCategory.ART_CAT:
          onNavigateTo('documentos', { id: item.id });
          break;
        default:
          onNavigateTo('dashboard');
          break;
      }
    }
  };

  const handleReindex = () => {
    const res = universalSearchService.triggerFullReindex();
    alert(`Reindexação concluída: ${res.indexedCount} entidades indexadas com sucesso.`);
    setRecentSearches(universalSearchService.getRecentSearches());
  };

  if (!isOpen) return null;

  const isFavorite = (id) => favorites.some(f => f.id === id);

  return (
    <div className="universal-search-overlay" onClick={onClose}>
      <div className="universal-search-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* BARRA DE PESQUISA SUPERIOR */}
        <div className="search-input-header">
          <Search size={22} className="search-main-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-field-input"
            placeholder="Buscar oportunidades, organizações, documentos, propostas, contratos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <div className="search-header-badges">
            <span className="kbd-badge">ESC para fechar</span>
            <button className="btn-close-search" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* FILTROS E MODO DE VISUALIZAÇÃO */}
        <div className="search-filter-bar">
          <div className="filter-pills-row">
            <button 
              className={`filter-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveCategory('ALL')}
            >
              Todas as Entidades
            </button>
            <button 
              className={`filter-pill ${activeCategory === EntityCategory.OPPORTUNITY ? 'active' : ''}`}
              onClick={() => setActiveCategory(EntityCategory.OPPORTUNITY)}
            >
              Oportunidades
            </button>
            <button 
              className={`filter-pill ${activeCategory === EntityCategory.ORGANIZATION ? 'active' : ''}`}
              onClick={() => setActiveCategory(EntityCategory.ORGANIZATION)}
            >
              Organizações
            </button>
            <button 
              className={`filter-pill ${activeCategory === EntityCategory.CONTRACT ? 'active' : ''}`}
              onClick={() => setActiveCategory(EntityCategory.CONTRACT)}
            >
              Contratos
            </button>
            <button 
              className={`filter-pill ${activeCategory === EntityCategory.DOCUMENT ? 'active' : ''}`}
              onClick={() => setActiveCategory(EntityCategory.DOCUMENT)}
            >
              Documentos & Atestados
            </button>
            <button 
              className={`filter-pill ${activeCategory === EntityCategory.PROPOSAL ? 'active' : ''}`}
              onClick={() => setActiveCategory(EntityCategory.PROPOSAL)}
            >
              Propostas
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`graph-toggle-btn ${activeViewMode === 'graph' ? 'active' : ''}`}
              onClick={() => setActiveViewMode(activeViewMode === 'graph' ? 'split' : 'graph')}
              title="Alternar entre modo Lista e Knowledge Graph Interativo"
            >
              <Network size={14} /> {activeViewMode === 'graph' ? 'Ver em Lista' : 'Knowledge Graph'}
            </button>
            <button 
              className="filter-pill"
              onClick={() => setActiveViewMode(activeViewMode === 'dedup' ? 'split' : 'dedup')}
              title="Gerenciar duplicidades de entidades"
            >
              <GitBranch size={13} /> Duplicidades
            </button>
          </div>
        </div>

        {/* QUERY INTERPRETATION (Linguagem Natural) */}
        {searchResults && searchResults.interpretation && (
          <div className="natural-query-banner">
            <Sparkles size={16} />
            <span>Interpretação Semântica:</span>
            {searchResults.interpretation.detectedEntityType && (
              <span className="query-chip">Tipo: {searchResults.interpretation.detectedEntityType}</span>
            )}
            {searchResults.interpretation.minAmount && (
              <span className="query-chip">Valor &gt; R$ {searchResults.interpretation.minAmount.toLocaleString('pt-BR')}</span>
            )}
            {searchResults.interpretation.stateFilter && (
              <span className="query-chip">Estado: {searchResults.interpretation.stateFilter}</span>
            )}
            {searchResults.interpretation.timeframe && (
              <span className="query-chip">Prazo: {searchResults.interpretation.timeframe}</span>
            )}
          </div>
        )}

        {/* CORPO DO MODAL */}
        <div className="search-dialog-body">

          {/* MODO 1: RESUMO DE DUPLICIDADES (Entity Resolution) */}
          {activeViewMode === 'dedup' ? (
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <GitBranch size={18} className="text-cyan" /> Resolução de Entidades & Fila de Possíveis Duplicidades
                </h4>
                <button className="filter-pill" onClick={handleReindex}>
                  <RefreshCw size={13} /> Forçar Reindexação
                </button>
              </div>
              <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '20px' }}>
                O Vellia unifica automaticamente nomes corporativos, razões sociais e siglas em identidades canônicas seguras,
                impedindo a fragmentação do histórico comercial e da inteligência do cliente.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {dedupList.map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#38BDF8', fontSize: '14px' }}>{item.canonicalName}</strong>
                      <span style={{ fontSize: '11px', color: '#34D399', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        Entidade Canônica
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '10px' }}>
                      CNPJ Oficial: {item.cnpj}
                    </div>
                    <div style={{ fontSize: '12px', color: '#CBD5E1', marginBottom: '8px' }}>
                      <strong>Aliases Mapeados para Busca Universal:</strong> {item.aliases.join(', ')}
                    </div>
                    {item.duplicateCandidates && item.duplicateCandidates.length > 0 && (
                      <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
                        <span style={{ color: '#FBBF24', fontSize: '12px', fontWeight: 600 }}>Candidato a Unificação Detectado:</span>
                        <div style={{ fontSize: '12px', color: '#F8FAFC', marginTop: '4px' }}>
                          {item.duplicateCandidates[0].name} (CNPJ: {item.duplicateCandidates[0].cnpj}) — Similaridade: {(item.duplicateCandidates[0].similarity * 100).toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                          Motivo: {item.duplicateCandidates[0].reason}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : activeViewMode === 'graph' ? (
            /* MODO 2: KNOWLEDGE GRAPH INTERATIVO EXPANDIDO */
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ color: '#F8FAFC', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Network size={18} color="#C084FC" /> Grafo de Conhecimento Local Contextual
                </h4>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Nó Central: {selectedEntity ? selectedEntity.title : 'Selecione uma entidade'}
                </span>
              </div>

              {localGraph ? (
                <div className="graph-canvas-container" style={{ flex: 1, minHeight: '440px' }}>
                  <svg className="svg-graph" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                    {/* Linhas de conexão */}
                    {localGraph.edges.map((edge, idx) => {
                      const angle = (idx / (localGraph.edges.length || 1)) * 2 * Math.PI;
                      const targetX = 400 + Math.cos(angle) * 180;
                      const targetY = 200 + Math.sin(angle) * 120;
                      return (
                        <g key={edge.id || idx}>
                          <line
                            x1="400"
                            y1="200"
                            x2={targetX}
                            y2={targetY}
                            stroke={edge.status === RelationStatus.CONFIRMED ? '#38BDF8' : '#F59E0B'}
                            strokeWidth="2"
                            strokeDasharray={edge.status === RelationStatus.CONFIRMED ? 'none' : '4,4'}
                            opacity="0.6"
                          />
                          <text
                            x={(400 + targetX) / 2}
                            y={(200 + targetY) / 2 - 4}
                            fill="#94A3B8"
                            fontSize="9"
                            textAnchor="middle"
                          >
                            {edge.type}
                          </text>
                        </g>
                      );
                    })}

                    {/* Nó Central */}
                    <circle cx="400" cy="200" r="28" fill="#0284C7" stroke="#38BDF8" strokeWidth="3" />
                    <text x="400" y="204" fill="#FFFFFF" fontSize="11" fontWeight="700" textAnchor="middle">
                      {selectedEntity?.entityType?.slice(0, 3) || 'CENTRO'}
                    </text>

                    {/* Nós Periféricos Conectados */}
                    {localGraph.nodes.filter(n => n.id !== selectedEntity?.id).map((node, idx) => {
                      const angle = (idx / ((localGraph.nodes.length - 1) || 1)) * 2 * Math.PI;
                      const x = 400 + Math.cos(angle) * 180;
                      const y = 200 + Math.sin(angle) * 120;
                      const isOrg = node.type === EntityCategory.ORGANIZATION;
                      const isOpp = node.type === EntityCategory.OPPORTUNITY;

                      return (
                        <g key={node.id} style={{ cursor: 'pointer' }} onClick={() => handleSelectEntity(node)}>
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="20" 
                            fill={isOrg ? '#0369A1' : isOpp ? '#047857' : '#7C3AED'} 
                            stroke="#F8FAFC" 
                            strokeWidth="1.5" 
                          />
                          <text x={x} y={y + 4} fill="#F8FAFC" fontSize="10" textAnchor="middle">
                            {node.type.slice(0, 3)}
                          </text>
                          <text x={x} y={y + 32} fill="#CBD5E1" fontSize="10" textAnchor="middle">
                            {node.label.slice(0, 18)}...
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                <div className="search-empty-state">
                  <p>Selecione uma entidade para visualizar sua rede local de conexões.</p>
                </div>
              )}
            </div>
          ) : (
            /* MODO PADRÃO: LISTA DE RESULTADOS + KNOWLEDGE PANEL LATERAL */
            <>
              {/* COLUNA ESQUERDA: RESULTADOS OU ITENS RECENTES */}
              <div className="results-column">
                {!query.trim() ? (
                  <div className="search-empty-state">
                    <div>
                      <div className="section-caption">Consultas Recentes</div>
                      <div className="recent-searches-chips">
                        {recentSearches.map((rec, i) => (
                          <div key={i} className="recent-chip" onClick={() => setQuery(rec)}>
                            <Clock size={13} color="#64748B" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {recentItems.length > 0 && (
                      <div>
                        <div className="section-caption">Acessados Recentemente</div>
                        <div className="recent-items-list">
                          {recentItems.map((item) => (
                            <div key={item.id} className="recent-item-row" onClick={() => handleSelectEntity(item)}>
                              <Compass size={16} color="#38BDF8" />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>{item.title}</div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>{item.subtitle}</div>
                              </div>
                              <ChevronRight size={14} color="#64748B" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : searchResults && searchResults.totalResults === 0 ? (
                  <div className="search-empty-state" style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Search size={36} color="#475569" style={{ margin: '0 auto 12px' }} />
                    <h5 style={{ color: '#F8FAFC', margin: '0 0 6px' }}>Nenhum resultado encontrado</h5>
                    <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                      Verifique os termos digitados ou experimente pesquisar por número do processo, CNPJ ou sinônimos industriais.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {searchResults?.totalResults || 0} resultados encontrados para "{query}"
                      </span>
                    </div>

                    {/* Exibe lista de resultados */}
                    {searchResults?.allResults.map((item) => {
                      const isSel = selectedEntity?.id === item.id;
                      const isFav = isFavorite(item.id);

                      return (
                        <div 
                          key={item.id} 
                          className={`result-card-item ${isSel ? 'selected' : ''}`}
                          onClick={() => handleSelectEntity(item)}
                        >
                          <div className={`result-type-icon ${item.entityType.toLowerCase()}`}>
                            {item.entityType === EntityCategory.ORGANIZATION && <Building2 size={18} />}
                            {item.entityType === EntityCategory.OPPORTUNITY && <Compass size={18} />}
                            {item.entityType === EntityCategory.CONTRACT && <FileSignature size={18} />}
                            {item.entityType === EntityCategory.DOCUMENT && <FileText size={18} />}
                            {item.entityType === EntityCategory.ATTESTATION && <FileText size={18} />}
                            {item.entityType === EntityCategory.PROPOSAL && <FileSpreadsheet size={18} />}
                            {item.entityType === EntityCategory.CONTACT && <User size={18} />}
                          </div>

                          <div className="result-content">
                            <div className="result-top-line">
                              <span className="result-title">{item.title}</span>
                              {item.isExact && <span className="badge-exact">EXACT</span>}
                              {item.matchedReason.includes('Semântica') && (
                                <span className="badge-semantic">SEMÂNTICA</span>
                              )}
                            </div>
                            <div className="result-subtitle">{item.subtitle}</div>
                            <div className="result-meta-row">
                              <span>Empresa: {item.companyScope}</span>
                              <span>•</span>
                              <span>{item.matchedReason}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isFav ? '#FBBF24' : '#64748B' }}
                              onClick={(e) => handleToggleFav(item, e)}
                              title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                            >
                              <Star size={15} fill={isFav ? '#FBBF24' : 'none'} />
                            </button>
                            <button 
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(item.id);
                              }}
                              title="Copiar ID"
                            >
                              {copiedId === item.id ? <Check size={15} color="#34D399" /> : <Copy size={15} />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* COLUNA DIREITA: KNOWLEDGE PANEL LATERAL */}
              <div className="knowledge-column">
                {selectedEntity ? (
                  <div>
                    <div className="knowledge-panel-header">
                      <span className="kp-entity-badge">{selectedEntity.entityType}</span>
                      <h4 className="kp-title">{selectedEntity.title}</h4>
                      <p className="kp-subtitle">{selectedEntity.subtitle}</p>
                    </div>

                    {/* SEÇÃO 1: RASTREABILIDADE / COMO CHEGAMOS AQUI? */}
                    {traceabilityChain.length > 1 && (
                      <div className="kp-section">
                        <div className="kp-section-title">
                          <GitBranch size={14} className="text-cyan" /> Como Chegamos Aqui? (Rastreabilidade)
                        </div>
                        <div className="trace-chain-box">
                          {traceabilityChain.map((node, idx) => (
                            <div key={node.id} className="trace-step">
                              <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: '3px' }}>
                                {node.type}
                              </span>
                              <span>{node.label}</span>
                              {idx < traceabilityChain.length - 1 && (
                                <ArrowRight size={12} className="trace-step-arrow" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SEÇÃO 2: ITENS CONECTADOS NO GRAFO */}
                    <div className="kp-section">
                      <div className="kp-section-title">
                        <Network size={14} color="#C084FC" /> Relações Conectadas no Vellia
                      </div>

                      {localGraph && localGraph.edges.length > 0 ? (
                        <div className="kp-relations-list">
                          {localGraph.edges.map((edge) => {
                            const isSource = edge.source === selectedEntity.id;
                            const neighborId = isSource ? edge.target : edge.source;
                            const neighbor = localGraph.nodes.find(n => n.id === neighborId);
                            if (!neighbor) return null;

                            return (
                              <div 
                                key={edge.id} 
                                className="kp-relation-item"
                                onClick={() => handleSelectEntity(neighbor)}
                              >
                                <div className="kp-rel-left">
                                  <span className="kp-rel-type">{edge.type}</span>
                                  <span className="kp-rel-label">{neighbor.label.slice(0, 36)}...</span>
                                </div>
                                <span className={`kp-rel-status status-${edge.status.toLowerCase()}`}>
                                  {edge.status === RelationStatus.CONFIRMED ? 'Confirmado' : 'Sugerido'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#64748B', fontStyle: 'italic' }}>
                          Nenhuma relação direta conectada a este registro.
                        </div>
                      )}
                    </div>

                    {/* BOTÃO DE AÇÃO DIRETA */}
                    <button 
                      className="btn-open-entity-full"
                      style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                      onClick={() => handleOpenModule(selectedEntity)}
                    >
                      <ExternalLink size={14} /> Abrir Módulo Específico
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                    <Layers size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      Selecione um resultado da busca para visualizar o resumo 360°, conexões do Knowledge Graph e rastreabilidade causal.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="search-dialog-footer">
          <div className="footer-nav-hints">
            <div className="hint-item"><kbd>↑</kbd><kbd>↓</kbd> Navegar</div>
            <div className="hint-item"><kbd>Enter</kbd> Selecionar</div>
            <div className="hint-item"><kbd>Ctrl+K</kbd> Alternar Busca</div>
          </div>
          <div>
            <span>Vellia Knowledge Graph Engine v39.0 • 100% Auditável</span>
          </div>
        </div>

      </div>
    </div>
  );
}
