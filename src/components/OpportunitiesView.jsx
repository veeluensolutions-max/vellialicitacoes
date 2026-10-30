import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Clock, 
  Building2, 
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Globe2,
  XCircle
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import NewOpportunityModal from './NewOpportunityModal';
import PncpIntegrationModal from './PncpIntegrationModal';
import OpportunityDetailModal from './OpportunityDetailModal';
import './OpportunitiesView.css';

export default function OpportunitiesView({ 
  selectedCompanyScope = 'ALL',
  externalSearchQuery = '',
  onSelectCompanyScope
}) {
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isPncpModalOpen, setIsPncpModalOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

  // Filtros Diretos e Objetivos
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [filterPortal, setFilterPortal] = useState('ALL');
  const [filterCompany, setFilterCompany] = useState(() => {
    if (selectedCompanyScope === 'veeluen-solutions') return 'Veeluen Solutions';
    if (selectedCompanyScope === 'excelencia-ambiental') return 'Excelência Ambiental';
    return 'ALL';
  });
  const [decisionFilter, setDecisionFilter] = useState('ALL'); // 'ALL' | 'CONCORRER' | 'ANALISE' | 'DESCARTADOS'

  // Sincronizar busca do Header
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Sincronizar empresa com o seletor do Header
  useEffect(() => {
    if (!selectedCompanyScope || selectedCompanyScope === 'ALL') {
      setFilterCompany('ALL');
    } else if (selectedCompanyScope === 'veeluen-solutions') {
      setFilterCompany('Veeluen Solutions');
    } else if (selectedCompanyScope === 'excelencia-ambiental') {
      setFilterCompany('Excelência Ambiental');
    }
  }, [selectedCompanyScope]);

  // Listener para navegação vinda do Radar de Serviços
  useEffect(() => {
    const handleFilterFromRadar = (data) => {
      const payload = data?.detail || data;
      if (payload?.reset) {
        setFilterCompany('ALL');
        setFilterPortal('ALL');
        setDecisionFilter('ALL');
        setSearchQuery('');
      }
      if (payload?.company) {
        setFilterCompany(payload.company);
      }
      if (payload?.portal) {
        setFilterPortal(payload.portal);
      }
      if (payload?.decisionFilter) {
        setDecisionFilter(payload.decisionFilter);
      }
      if (payload?.searchQuery !== undefined) {
        setSearchQuery(payload.searchQuery);
      }
    };

    const unsub = EventBus.subscribe('vellia-filter-opportunities', handleFilterFromRadar);
    window.addEventListener('vellia-filter-opportunities', handleFilterFromRadar);

    return () => {
      if (typeof unsub === 'function') unsub();
      window.removeEventListener('vellia-filter-opportunities', handleFilterFromRadar);
    };
  }, []);

  const reloadData = () => {
    setOpportunities(OpportunityService.listAll());
  };

  useEffect(() => {
    const unsub = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, reloadData);
    return unsub;
  }, []);

  const isParticipating = (opp) => {
    return opp.decision === 'GO' || opp.status === 'Participando' || opp.status === 'Interessante' || opp.status === 'Go';
  };

  const isDiscarded = (opp) => {
    return opp.decision === 'NO-GO' || opp.status === 'Descartada' || opp.status === 'No-Go';
  };

  const handleQuickDecision = (e, opp, decisionType) => {
    e.stopPropagation();
    OpportunityService.recordDecision(opp.id, decisionType);
    reloadData();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterPortal('ALL');
    setFilterCompany('ALL');
    setDecisionFilter('ALL');
    if (onSelectCompanyScope) onSelectCompanyScope('ALL');
  };

  // Filtragem objetiva
  const filteredList = opportunities.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.number?.toLowerCase().includes(q) ||
        item.client?.toLowerCase().includes(q) ||
        item.object?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q) ||
        item.primaryService?.toLowerCase().includes(q) ||
        item.recommendedCompany?.toLowerCase().includes(q) ||
        item.location?.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filterPortal !== 'ALL' && item.portal !== filterPortal) return false;

    if (filterCompany !== 'ALL') {
      const comp = (item.recommendedCompany || '').toLowerCase();
      if (filterCompany === 'Veeluen Solutions' && !comp.includes('veeluen')) return false;
      if (filterCompany === 'Excelência Ambiental' && !comp.includes('excel')) return false;
    }

    if (decisionFilter === 'CONCORRER' && !isParticipating(item)) return false;
    if (decisionFilter === 'DESCARTADOS' && !isDiscarded(item)) return false;
    if (decisionFilter === 'ANALISE' && (isParticipating(item) || isDiscarded(item))) return false;

    return true;
  });

  // Contadores objetivos
  const totalCount = opportunities.length;
  const veeluenCount = opportunities.filter(o => (o.recommendedCompany || '').toLowerCase().includes('veeluen') || !o.recommendedCompany).length;
  const excelenciaCount = opportunities.filter(o => (o.recommendedCompany || '').toLowerCase().includes('excel')).length;
  const participatingCount = opportunities.filter(isParticipating).length;

  const hasActiveFilters = filterPortal !== 'ALL' || filterCompany !== 'ALL' || decisionFilter !== 'ALL' || Boolean(searchQuery.trim());

  return (
    <div className="opportunities-module-container" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* TOPO LIMPO DOS EDITAIS */}
      <div className="opp-header-block">
        <div className="opp-title-wrap">
          <div className="opp-icon-badge">
            <FileText size={22} className="text-teal" />
          </div>
          <div>
            <h1 className="opp-main-title" style={{ margin: '0 0 4px 0' }}>Editais das Licitações para Concorrer</h1>
            <p className="opp-subtitle" style={{ margin: 0 }}>
              Lista objetiva dos editais alinhados aos serviços da <strong>Veeluen Solutions</strong> e <strong>Excelência Ambiental</strong>.
            </p>
          </div>
        </div>

        <div className="opp-actions-row">
          <button 
            className="btn-action-outline btn-pncp-header-btn" 
            onClick={() => setIsPncpModalOpen(true)}
            title="Buscar editais na API oficial do PNCP"
          >
            <Globe2 size={15} className="text-emerald" />
            <span>Buscar no PNCP</span>
          </button>

          <button className="btn-action-primary" onClick={() => setIsNewModalOpen(true)}>
            <Plus size={15} />
            <span>Cadastrar Edital</span>
          </button>
        </div>
      </div>

      {/* 4 CARDS OBJETIVOS DE FILTRO RÁPIDO (TOTAL | VEELUEN | EXCELÊNCIA | PARA CONCORRER) */}
      <div className="opp-summary-cards">
        <div 
          className="summary-mini-card"
          onClick={handleResetFilters}
          style={{
            cursor: 'pointer',
            borderColor: filterCompany === 'ALL' && decisionFilter === 'ALL' ? '#38BDF8' : undefined
          }}
        >
          <span className="mini-card-lbl">Todos os Editais</span>
          <span className="mini-card-val">{totalCount}</span>
          <span className="mini-card-sub">Capturados nos portais</span>
        </div>

        <div 
          className="summary-mini-card border-blue"
          onClick={() => {
            setFilterCompany('Veeluen Solutions');
            setDecisionFilter('ALL');
            if (onSelectCompanyScope) onSelectCompanyScope('veeluen-solutions');
          }}
          style={{
            cursor: 'pointer',
            background: filterCompany === 'Veeluen Solutions' ? 'rgba(56, 189, 248, 0.12)' : undefined
          }}
        >
          <span className="mini-card-lbl">Veeluen Solutions</span>
          <span className="mini-card-val text-blue">{veeluenCount}</span>
          <span className="mini-card-sub">ETE, ETA, NR-13, Caldeiras</span>
        </div>

        <div 
          className="summary-mini-card border-green"
          onClick={() => {
            setFilterCompany('Excelência Ambiental');
            setDecisionFilter('ALL');
            if (onSelectCompanyScope) onSelectCompanyScope('excelencia-ambiental');
          }}
          style={{
            cursor: 'pointer',
            background: filterCompany === 'Excelência Ambiental' ? 'rgba(16, 185, 129, 0.12)' : undefined
          }}
        >
          <span className="mini-card-lbl">Excelência Ambiental</span>
          <span className="mini-card-val text-green">{excelenciaCount}</span>
          <span className="mini-card-sub">Emissões, Isocinética, Ar</span>
        </div>

        <div 
          className="summary-mini-card border-critical"
          onClick={() => {
            setDecisionFilter(decisionFilter === 'CONCORRER' ? 'ALL' : 'CONCORRER');
          }}
          style={{
            cursor: 'pointer',
            borderColor: '#10B981',
            background: decisionFilter === 'CONCORRER' ? 'rgba(16, 185, 129, 0.15)' : undefined
          }}
        >
          <span className="mini-card-lbl">Selecionados para Concorrer</span>
          <span className="mini-card-val" style={{ color: '#10B981' }}>{participatingCount}</span>
          <span className="mini-card-sub">Marcados para participação</span>
        </div>
      </div>

      {/* BARRA DE BUSCA E FILTROS DIRETOS */}
      <div style={{
        background: '#0F172A',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        borderRadius: '12px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Busca por texto/serviço */}
        <div style={{
          flex: 1,
          minWidth: '240px',
          display: 'flex',
          alignItems: 'center',
          background: '#1E293B',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: '8px',
          padding: '0 12px'
        }}>
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="Filtrar por serviço, número do edital, órgão ou objeto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F8FAFC',
              fontSize: '13px',
              padding: '9px 10px'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>

        {/* Filtro de Empresa */}
        <select
          value={filterCompany}
          onChange={(e) => {
            const val = e.target.value;
            setFilterCompany(val);
            if (onSelectCompanyScope) {
              if (val === 'Veeluen Solutions') onSelectCompanyScope('veeluen-solutions');
              else if (val === 'Excelência Ambiental') onSelectCompanyScope('excelencia-ambiental');
              else onSelectCompanyScope('ALL');
            }
          }}
          style={{
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '8px',
            padding: '9px 12px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <option value="ALL">Todas as Empresas</option>
          <option value="Veeluen Solutions">Veeluen Solutions</option>
          <option value="Excelência Ambiental">Excelência Ambiental</option>
        </select>

        {/* Filtro de Portal */}
        <select
          value={filterPortal}
          onChange={(e) => setFilterPortal(e.target.value)}
          style={{
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '8px',
            padding: '9px 12px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <option value="ALL">Todos os Portais</option>
          <option value="Petronect">Petronect</option>
          <option value="PNCP">PNCP</option>
          <option value="Compras.gov.br">Compras.gov.br</option>
        </select>

        {/* Filtro de Situação */}
        <select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value)}
          style={{
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '8px',
            padding: '9px 12px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <option value="ALL">Todas as Situações</option>
          <option value="CONCORRER">Para Concorrer ({participatingCount})</option>
          <option value="ANALISE">Em Análise</option>
          <option value="DESCARTADOS">Descartados</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: '#CBD5E1',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: '8px',
              padding: '9px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <RotateCcw size={12} />
            <span>Limpar</span>
          </button>
        )}
      </div>

      {/* TABELA OBJETIVA DE EDITAIS */}
      <div className="opportunities-table-card">
        <div className="table-wrapper">
          <table className="corporate-opp-table">
            <thead>
              <tr>
                <th>Edital / Portal</th>
                <th>Órgão / Local</th>
                <th>Objeto da Licitação</th>
                <th>Empresa & Serviço Alinhado</th>
                <th>Prazo & Valor</th>
                <th>Participação</th>
                <th className="th-action">Acesso ao Edital</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state-cell" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <p style={{ margin: 0, color: '#94A3B8', fontSize: '14px' }}>
                        Nenhum edital encontrado com os filtros selecionados.
                      </p>
                      <button 
                        type="button"
                        onClick={handleResetFilters}
                        style={{
                          background: '#0284C7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        Mostrar Todos os Editais ({opportunities.length})
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((opp) => {
                  const participating = isParticipating(opp);
                  const discarded = isDiscarded(opp);
                  const isExcel = (opp.recommendedCompany || '').toLowerCase().includes('excel');

                  return (
                    <tr 
                      key={opp.id} 
                      className="opp-row-hover"
                      onClick={() => setSelectedDetailId(opp.id)}
                      style={{
                        opacity: discarded ? 0.6 : 1,
                        background: participating ? 'rgba(16, 185, 129, 0.05)' : undefined
                      }}
                    >
                      {/* Edital & Portal */}
                      <td className="td-number">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="opp-num-text mono" style={{ fontWeight: 700, color: '#F8FAFC' }}>
                            #{opp.number}
                          </span>
                          <span className={`portal-badge-mini portal-${(opp.portal || 'petronect').toLowerCase().replace(/[^a-z]/g, '')}`} style={{ width: 'fit-content' }}>
                            {opp.portal}
                          </span>
                        </div>
                      </td>

                      {/* Órgão & Local */}
                      <td className="td-client">
                        <span className="client-text" title={opp.client} style={{ fontWeight: 600 }}>
                          {opp.client}
                        </span>
                        <span className="city-text">{opp.location}</span>
                      </td>

                      {/* Objeto */}
                      <td className="td-object" style={{ maxWidth: '380px' }}>
                        <p className="object-snippet" title={opp.object} style={{ margin: 0, lineHeight: 1.4 }}>
                          {opp.object}
                        </p>
                      </td>

                      {/* Empresa & Serviço */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            width: 'fit-content',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: isExcel ? 'rgba(16, 185, 129, 0.14)' : 'rgba(56, 189, 248, 0.14)',
                            color: isExcel ? '#34D399' : '#38BDF8',
                            border: isExcel ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)'
                          }}>
                            <Building2 size={11} />
                            {opp.recommendedCompany || 'Veeluen Solutions'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: 500 }}>
                            {opp.primaryService}
                          </span>
                        </div>
                      </td>

                      {/* Prazo & Valor */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: opp.daysLeft <= 3 ? 700 : 600,
                            color: opp.daysLeft <= 3 ? '#F87171' : '#F8FAFC',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={12} />
                            {opp.endDate} ({opp.daysLeft === 0 ? 'Hoje' : `${opp.daysLeft}d`})
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#94A3B8', fontFamily: 'monospace' }}>
                            {opp.estimatedValue || 'Sob consulta'}
                          </span>
                        </div>
                      </td>

                      {/* Decisão Direta: Concorrer / Descartar */}
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={(e) => handleQuickDecision(e, opp, participating ? 'EM_ANALISE' : 'GO')}
                            style={{
                              background: participating ? '#10B981' : 'rgba(16, 185, 129, 0.1)',
                              color: participating ? '#0F172A' : '#34D399',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Marcar edital para concorrer"
                          >
                            <CheckCircle2 size={12} />
                            <span>{participating ? 'Concorrendo' : 'Concorrer'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleQuickDecision(e, opp, discarded ? 'EM_ANALISE' : 'NO-GO')}
                            style={{
                              background: discarded ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                              color: discarded ? '#F87171' : '#64748B',
                              border: discarded ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(148, 163, 184, 0.2)',
                              borderRadius: '6px',
                              padding: '5px 8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                            title="Descartar edital"
                          >
                            <XCircle size={12} />
                            <span>{discarded ? 'Descartado' : 'Descartar'}</span>
                          </button>
                        </div>
                      </td>

                      {/* Ações: Abrir Portal Oficial + Detalhes */}
                      <td className="td-action" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {opp.url && (
                            <a
                              href={opp.url}
                              target="_blank"
                              rel="noreferrer noopener"
                              style={{
                                background: 'rgba(148, 163, 184, 0.12)',
                                border: '1px solid rgba(148, 163, 184, 0.28)',
                                color: '#F8FAFC',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              title="Abrir edital no portal oficial"
                            >
                              <ExternalLink size={12} />
                              <span>Portal</span>
                            </a>
                          )}

                          <button 
                            className="btn-open-analysis"
                            onClick={() => setSelectedDetailId(opp.id)}
                            style={{
                              background: 'rgba(2, 132, 199, 0.14)',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              color: '#38BDF8',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Ver Edital
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CADASTRO MANUAL */}
      <NewOpportunityModal 
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={() => reloadData()}
      />

      {/* MODAL DE CONSULTA PNCP */}
      <PncpIntegrationModal 
        isOpen={isPncpModalOpen}
        onClose={() => setIsPncpModalOpen(false)}
        onSuccess={() => reloadData()}
      />

      {/* MODAL LIMPO DE DETALHES DO EDITAL */}
      <OpportunityDetailModal 
        opportunityId={selectedDetailId}
        isOpen={!!selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
        onUpdated={() => reloadData()}
      />
    </div>
  );
}
