import React from 'react';
import { 
  Search, 
  Menu, 
  RefreshCw, 
  RotateCcw
} from 'lucide-react';
import './Header.css';

export default function Header({ 
  searchQuery = '', 
  setSearchQuery, 
  onToggleMobile,
  lastUpdatedText,
  onRefresh,
  isSyncing = false,
  selectedCompanyScope = 'ALL',
  onSelectCompanyScope,
  onSearchSubmit
}) {
  const handleManualRefresh = () => {
    if (onRefresh && !isSyncing) onRefresh();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="app-header">
      {/* Esquerda: Menu Mobile + Título */}
      <div className="header-left">
        <button 
          className="mobile-menu-trigger" 
          onClick={onToggleMobile}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-context">
          <div className="header-breadcrumbs">
            <span className="crumb-system">Vellia Licitações</span>
            <span className="crumb-divider">•</span>
            <span className="crumb-active">Veeluen Solutions & Excelência Ambiental</span>
          </div>
          <h1 className="header-title">Radar de Serviços & Editais para Concorrer</h1>
        </div>
      </div>

      {/* Centro: Seletor de Empresa (Todas | Veeluen Solutions | Excelência Ambiental) */}
      <div className="company-scope-selector">
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'ALL' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('ALL')}
          title="Ver editais das duas empresas"
        >
          Todas as Empresas
        </button>
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'veeluen-solutions' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('veeluen-solutions')}
          title="Filtrar para Veeluen Solutions"
        >
          Veeluen Solutions
        </button>
        <button
          type="button"
          className={`scope-btn ${selectedCompanyScope === 'excelencia-ambiental' ? 'active' : ''}`}
          onClick={() => onSelectCompanyScope && onSelectCompanyScope('excelencia-ambiental')}
          title="Filtrar para Excelência Ambiental"
        >
          Excelência Ambiental
        </button>
      </div>

      {/* Busca Direta de Serviços ou Editais */}
      <div className="header-search-wrapper" style={{ cursor: 'text' }}>
        <Search size={14} className="search-icon" />
        <input
          type="text"
          className="header-search-input"
          placeholder="Buscar por serviço, edital, órgão ou cidade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery && setSearchQuery('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
            title="Limpar busca"
          >
            <RotateCcw size={12} />
          </button>
        )}
      </div>

      {/* Direita: Botão Objetivo de Atualizar / Buscar Editais */}
      <div className="header-right">
        {lastUpdatedText && (
          <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
            Atualizado: {lastUpdatedText}
          </span>
        )}
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isSyncing}
          style={{
            background: isSyncing ? 'rgba(2, 132, 199, 0.4)' : '#0284C7',
            color: '#FFFFFF',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: isSyncing ? 'wait' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
          title="Varre PNCP, Compras.gov.br e Petronect em busca de novos editais alinhados às duas empresas"
        >
          <RefreshCw size={14} className={isSyncing ? 'spinning' : ''} />
          <span>{isSyncing ? 'Buscando Editais...' : 'Buscar Novos Editais'}</span>
        </button>
      </div>
    </header>
  );
}
