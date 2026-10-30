import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  PauseCircle,
  Trash2,
  MapPin,
  Building2,
  Landmark,
  FileText,
  X,
  Sparkles,
  Search
} from 'lucide-react';
import { sourceRepository, QUICK_PREFEITURA_SUGGESTIONS } from '../services/sourceRepository';
import { OpportunityService } from '../services/opportunityService';
import { PncpService } from '../services/pncp/pncpService';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';

const UF_LIST = [
  'BR', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ',
  'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const CATEGORY_META = {
  PREFEITURA: {
    label: 'Prefeitura / SAAE Municipal',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)'
  },
  PLATAFORMA_MUNICIPAL: {
    label: 'Plataforma de Prefeituras',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.3)'
  },
  NACIONAL: {
    label: 'Portal Nacional Oficial',
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.12)',
    border: 'rgba(129, 140, 248, 0.3)'
  },
  FEDERAL: {
    label: 'Governo Federal',
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.3)'
  },
  ESTATAL: {
    label: 'Portal Estatal / Petrobras',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)'
  }
};

export default function ConnectedPortalsView({ onNavigateToOpportunities, onRefreshAll, isGlobalSyncing = false }) {
  const [sources, setSources] = useState(() => sourceRepository.getAll());
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');
  const [syncingPortalId, setSyncingPortalId] = useState(null);
  const [feedbackBanner, setFeedbackBanner] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newPortalForm, setNewPortalForm] = useState({
    name: '',
    category: 'PREFEITURA',
    uf: 'PE',
    city: '',
    baseUrl: '',
    searchFilter: '',
    description: '',
    syncImmediately: true
  });

  const reloadAll = () => {
    setSources(sourceRepository.getAll());
    setOpportunities(OpportunityService.listAll());
  };

  useEffect(() => {
    const unsubOpps = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, reloadAll);
    const unsubSources = EventBus.subscribe('vellia-sources-updated', reloadAll);
    return () => {
      if (typeof unsubOpps === 'function') unsubOpps();
      if (typeof unsubSources === 'function') unsubSources();
    };
  }, []);

  const showFeedback = (type, message) => {
    setFeedbackBanner({ type, message });
    setTimeout(() => setFeedbackBanner(null), 4500);
  };

  // Conta quantos editais reais abertos correspondem a cada portal/prefeitura
  const countEditaisForPortal = (portal) => {
    if (!portal) return 0;
    const id = portal.id;

    if (id === 'source-pncp') {
      return opportunities.length;
    }
    if (id === 'source-comprasgov') {
      return opportunities.filter(o => (o.portal || '').toLowerCase().includes('compras.gov')).length;
    }
    if (id === 'source-petronect') {
      return opportunities.filter(o =>
        (o.portal || '').toLowerCase().includes('petronect') ||
        (o.client || '').toLowerCase().includes('petrobras') ||
        (o.client || '').toLowerCase().includes('transpetro')
      ).length;
    }
    if (id === 'source-prefeituras-br') {
      return opportunities.filter(o => {
        const clientUp = (o.client || '').toUpperCase();
        const portalUp = (o.portal || '').toUpperCase();
        return (
          o.isMunicipal === true ||
          o.esfera === 'M' ||
          portalUp.includes('PREFEITURA') ||
          clientUp.includes('MUNICIPIO') ||
          clientUp.includes('PREFEITURA') ||
          clientUp.includes('SAAE') ||
          clientUp.includes('SANEAR') ||
          clientUp.includes('AUTONOMO DE AGUA')
        );
      }).length;
    }
    if (id === 'source-portal-compras-publicas') {
      return opportunities.filter(o =>
        (o.portal || '').toLowerCase().includes('compras públicas') ||
        (o.url || '').toLowerCase().includes('portaldecompraspublicas')
      ).length;
    }
    if (id === 'source-bll-licitanet') {
      return opportunities.filter(o => {
        const u = (o.url || '').toLowerCase();
        const p = (o.portal || '').toLowerCase();
        return p.includes('bll') || p.includes('licitanet') || u.includes('bll') || u.includes('licitanet') || u.includes('bnc');
      }).length;
    }

    // Para prefeituras específicas adicionadas pelo usuário
    const cityKey = (portal.city || portal.searchFilter || '').trim().toLowerCase();
    const nameKey = (portal.shortName || portal.name || '').trim().toLowerCase();

    return opportunities.filter(o => {
      const loc = (o.location || '').toLowerCase();
      const cli = (o.client || '').toLowerCase();
      const prt = (o.portal || '').toLowerCase();
      if (cityKey && cityKey !== 'nacional' && (loc.includes(cityKey) || cli.includes(cityKey))) return true;
      if (nameKey && (prt.includes(nameKey) || cli.includes(nameKey))) return true;
      return false;
    }).length;
  };

  const handleSyncSinglePortal = async (portal) => {
    if (syncingPortalId) return;
    setSyncingPortalId(portal.id);
    showFeedback('info', `Sincronizando editais abertos em "${portal.name}"...`);

    try {
      const res = await PncpService.syncPortalOrPrefeituraRealTime(portal);
      const nowStr = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      sourceRepository.update(portal.id, {
        status: 'Conectado',
        isActive: true,
        lastSync: nowStr,
        lastSuccess: new Date().toISOString()
      });
      reloadAll();
      showFeedback(
        'success',
        `Sincronização concluída com "${portal.shortName || portal.name}": ${res.scanned} editais verificados (${res.added} novos adicionados).`
      );
    } catch (err) {
      showFeedback('error', `Aviso ao consultar "${portal.name}": ${err.message}`);
    } finally {
      setSyncingPortalId(null);
    }
  };

  const handleTogglePortal = (portal) => {
    const updated = sourceRepository.toggleActive(portal.id);
    reloadAll();
    showFeedback(
      'info',
      updated?.isActive
        ? `Portal "${portal.name}" ativado para busca de editais.`
        : `Portal "${portal.name}" pausado temporariamente.`
    );
  };

  const handleRemovePortal = (portal) => {
    if (portal.isCore) return;
    sourceRepository.removeSource(portal.id);
    reloadAll();
    showFeedback('info', `Portal "${portal.name}" removido da lista.`);
  };

  const handleQuickAddSuggestion = async (suggestion) => {
    const created = sourceRepository.addSource(suggestion);
    reloadAll();
    showFeedback('success', `"${created.name}" conectado! Buscando editais abertos...`);
    await handleSyncSinglePortal(created);
  };

  const handleCreateCustomPortal = async (e) => {
    e.preventDefault();
    if (!newPortalForm.name.trim()) return;

    const cityClean = newPortalForm.city.trim() || newPortalForm.name.replace(/prefeitura( municipal)?( de| do| da)?/i, '').trim();
    const created = sourceRepository.addSource({
      name: newPortalForm.name.trim(),
      shortName: newPortalForm.name.trim(),
      category: newPortalForm.category,
      type:
        newPortalForm.category === 'PREFEITURA'
          ? `Portal Oficial de Licitações — ${cityClean} (${newPortalForm.uf})`
          : 'Plataforma / Portal de Licitações de Serviços',
      uf: newPortalForm.uf,
      city: cityClean || 'Município',
      baseUrl: newPortalForm.baseUrl.trim() || 'https://pncp.gov.br/app/editais',
      searchFilter: newPortalForm.searchFilter.trim() || cityClean,
      description:
        newPortalForm.description.trim() ||
        `Monitoramento automático de licitações de serviços para Veeluen Solutions e Excelência Ambiental em ${cityClean} - ${newPortalForm.uf}.`
    });

    const shouldSync = newPortalForm.syncImmediately;
    setNewPortalForm({
      name: '',
      category: 'PREFEITURA',
      uf: 'PE',
      city: '',
      baseUrl: '',
      searchFilter: '',
      description: '',
      syncImmediately: true
    });
    setIsAddModalOpen(false);
    reloadAll();

    if (shouldSync) {
      await handleSyncSinglePortal(created);
    } else {
      showFeedback('success', `Portal "${created.name}" conectado com sucesso!`);
    }
  };

  const filteredSources = sources.filter(s => {
    if (categoryFilter === 'PREFEITURAS' && s.category !== 'PREFEITURA' && s.category !== 'PLATAFORMA_MUNICIPAL') {
      return false;
    }
    if (categoryFilter === 'NACIONAIS' && s.category !== 'NACIONAL' && s.category !== 'FEDERAL' && s.category !== 'ESTATAL') {
      return false;
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      return (
        (s.name || '').toLowerCase().includes(q) ||
        (s.city || '').toLowerCase().includes(q) ||
        (s.uf || '').toLowerCase().includes(q) ||
        (s.type || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = sources.filter(s => s.isActive !== false).length;
  const municipalCount = sources.filter(s => s.category === 'PREFEITURA' || s.category === 'PLATAFORMA_MUNICIPAL').length;

  // Filtra sugestões rápidas que ainda não estão cadastradas
  const availableSuggestions = QUICK_PREFEITURA_SUGGESTIONS.filter(
    sug => !sources.some(s => s.name.toLowerCase() === sug.name.toLowerCase())
  );

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Notificação Flutuante */}
      {feedbackBanner && (
        <div style={{
          marginBottom: '18px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: feedbackBanner.type === 'success'
            ? 'rgba(6, 78, 59, 0.9)'
            : feedbackBanner.type === 'error'
            ? 'rgba(127, 29, 29, 0.9)'
            : 'rgba(15, 23, 42, 0.95)',
          border: feedbackBanner.type === 'success'
            ? '1px solid #10b981'
            : feedbackBanner.type === 'error'
            ? '1px solid #ef4444'
            : '1px solid #38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.88rem',
          color: '#ffffff'
        }}>
          <Sparkles size={16} color="#34d399" />
          <span>{feedbackBanner.message}</span>
        </div>
      )}

      {/* CABEÇALHO PRINCIPAL */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '22px',
        paddingBottom: '18px',
        borderBottom: '1px solid rgba(148, 163, 184, 0.14)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Globe size={22} color="#38bdf8" />
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Portais Conectados & Prefeituras do Brasil
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
            Gerencie os portais oficiais integrados ao Vellia Licitações e conecte novos sites de Prefeituras e Autarquias Municipais (SAAE).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onRefreshAll && onRefreshAll()}
            disabled={isGlobalSyncing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#e2e8f0',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: isGlobalSyncing ? 'wait' : 'pointer'
            }}
          >
            <RefreshCw size={15} className={isGlobalSyncing ? 'spin' : ''} />
            <span>{isGlobalSyncing ? 'Sincronizando Portais...' : 'Sincronizar Todos'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: '0.86rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>Conectar Prefeitura / Novo Portal</span>
          </button>
        </div>
      </div>

      {/* RESUMO OBJETIVO DE CONECTIVIDADE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '14px',
        marginBottom: '22px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '12px',
          padding: '16px 18px'
        }}>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Portais Ativos Conectados
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981' }}>{activeCount}</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>de {sources.length} cadastrados</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '12px',
          padding: '16px 18px'
        }}>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Portais de Prefeituras & SAAE
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8' }}>{municipalCount}</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>conectores municipais integrados</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '12px',
          padding: '16px 18px'
        }}>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Editais Reais Abertos no Radar
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>{opportunities.length}</span>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>alinhados às 2 empresas</span>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS E BUSCA DE PORTAIS */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `Todos os Portais (${sources.length})` },
            { id: 'PREFEITURAS', label: `Prefeituras & Portais Municipais (${municipalCount})` },
            { id: 'NACIONAIS', label: 'Nacionais & Estatais (PNCP / Compras.gov / Petronect)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: categoryFilter === tab.id ? '1px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.18)',
                background: categoryFilter === tab.id ? 'rgba(56, 189, 248, 0.14)' : 'rgba(15, 23, 42, 0.6)',
                color: categoryFilter === tab.id ? '#38bdf8' : '#94a3b8'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '8px',
          padding: '7px 12px',
          minWidth: '260px'
        }}>
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Filtrar portal, prefeitura ou UF..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.83rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* GRID DE PORTAIS CONECTADOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {filteredSources.map(portal => {
          const catMeta = CATEGORY_META[portal.category] || CATEGORY_META.PREFEITURA;
          const editalCount = countEditaisForPortal(portal);
          const isSyncingThis = syncingPortalId === portal.id;
          const isActive = portal.isActive !== false;

          return (
            <div
              key={portal.id}
              style={{
                background: 'rgba(15, 23, 42, 0.82)',
                border: isActive
                  ? '1px solid rgba(148, 163, 184, 0.18)'
                  : '1px solid rgba(148, 163, 184, 0.08)',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: isActive ? 1 : 0.65,
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                {/* Topo do Card: Categoria + Status */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: catMeta.bg,
                    color: catMeta.color,
                    border: `1px solid ${catMeta.border}`
                  }}>
                    {catMeta.label}
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: isActive ? '#10b981' : '#94a3b8',
                    background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                    padding: '4px 10px',
                    borderRadius: '999px'
                  }}>
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: isActive ? '#10b981' : '#64748b'
                    }} />
                    {isActive ? 'Conectado' : 'Pausado'}
                  </span>
                </div>

                {/* Nome do Portal / Prefeitura */}
                <h3 style={{
                  fontSize: '1.02rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  margin: '0 0 6px 0',
                  lineHeight: 1.35
                }}>
                  {portal.name}
                </h3>

                {/* Localidade e Tipo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginBottom: '10px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#38bdf8" />
                    {portal.city} {portal.uf && portal.uf !== 'BR' ? `• ${portal.uf}` : ''}
                  </span>
                  <span>•</span>
                  <span>{portal.type}</span>
                </div>

                {/* Descrição */}
                <p style={{
                  fontSize: '0.82rem',
                  color: '#cbd5e1',
                  margin: '0 0 14px 0',
                  lineHeight: 1.45
                }}>
                  {portal.description}
                </p>
              </div>

              <div>
                {/* Faixa de Métricas do Portal */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(2, 6, 23, 0.55)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '14px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Editais Alinhados</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: editalCount > 0 ? '#10b981' : '#94a3b8' }}>
                      {editalCount} {editalCount === 1 ? 'edital aberto' : 'editais abertos'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Última Verificação</div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                      {portal.lastSync || 'Tempo real'}
                    </div>
                  </div>
                </div>

                {/* Botões de Ação do Card */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleSyncSinglePortal(portal)}
                      disabled={Boolean(syncingPortalId)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '7px',
                        border: '1px solid rgba(56, 189, 248, 0.35)',
                        background: 'rgba(56, 189, 248, 0.12)',
                        color: '#38bdf8',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: syncingPortalId ? 'wait' : 'pointer'
                      }}
                    >
                      <RefreshCw size={13} className={isSyncingThis ? 'spin' : ''} />
                      <span>{isSyncingThis ? 'Buscando...' : 'Sincronizar'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onNavigateToOpportunities) {
                          const q =
                            portal.id === 'source-pncp'
                              ? ''
                              : portal.id === 'source-prefeituras-br'
                              ? 'MUNICIPIO'
                              : portal.city && portal.city !== 'Nacional' && !portal.city.includes('Municípios')
                              ? portal.city
                              : portal.shortName || '';
                          onNavigateToOpportunities({ searchQuery: q });
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 12px',
                        borderRadius: '7px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        background: 'rgba(30, 41, 59, 0.7)',
                        color: '#e2e8f0',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <FileText size={13} />
                      <span>Ver Editais</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {portal.baseUrl && (
                      <a
                        href={portal.baseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir site oficial do portal/prefeitura"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '7px',
                          borderRadius: '7px',
                          border: '1px solid rgba(148, 163, 184, 0.18)',
                          background: 'rgba(15, 23, 42, 0.7)',
                          color: '#94a3b8'
                        }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}

                    <button
                      onClick={() => handleTogglePortal(portal)}
                      title={isActive ? 'Pausar conexão' : 'Ativar conexão'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '7px',
                        borderRadius: '7px',
                        border: '1px solid rgba(148, 163, 184, 0.18)',
                        background: 'rgba(15, 23, 42, 0.7)',
                        color: isActive ? '#10b981' : '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      {isActive ? <CheckCircle2 size={14} /> : <PauseCircle size={14} />}
                    </button>

                    {!portal.isCore && (
                      <button
                        onClick={() => handleRemovePortal(portal)}
                        title="Remover prefeitura/portal"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '7px',
                          borderRadius: '7px',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          background: 'rgba(127, 29, 29, 0.2)',
                          color: '#f87171',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SUGESTÕES RÁPIDAS DE PREFEITURAS E PORTAIS PARA CONECTAR COM 1 CLIQUE */}
      {availableSuggestions.length > 0 && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '12px',
          padding: '18px 20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Landmark size={18} color="#10b981" />
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Conexão Rápida de Prefeituras & Polos Industriais (1 Clique)
            </h3>
          </div>
          <p style={{ margin: '0 0 14px 0', fontSize: '0.82rem', color: '#94a3b8' }}>
            Adicione rapidamente portais de prefeituras estratégicas ou clique em <strong>"+ Conectar Prefeitura / Novo Portal"</strong> acima para cadastrar qualquer município do Brasil.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {availableSuggestions.map((sug, index) => (
              <button
                key={index}
                onClick={() => handleQuickAddSuggestion(sug)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: '#e2e8f0',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Plus size={14} color="#10b981" />
                <span>{sug.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PARA CONECTAR NOVA PREFEITURA OU PORTAL DE LICITAÇÕES */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#0f172a',
              border: '1px solid rgba(148, 163, 184, 0.22)',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              color: '#f8fafc',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building2 size={20} color="#10b981" />
                <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 700 }}>
                  Conectar Prefeitura ou Portal de Licitações
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomPortal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Nome da Prefeitura, SAAE ou Portal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prefeitura Municipal de Caruaru ou SAAE de Alagoinhas"
                  value={newPortalForm.name}
                  onChange={e => setNewPortalForm({ ...newPortalForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: '#020617',
                    color: '#f8fafc',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Tipo de Portal
                  </label>
                  <select
                    value={newPortalForm.category}
                    onChange={e => setNewPortalForm({ ...newPortalForm, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#f8fafc',
                      fontSize: '0.84rem'
                    }}
                  >
                    <option value="PREFEITURA">Prefeitura / SAAE</option>
                    <option value="PLATAFORMA_MUNICIPAL">Plataforma Municipal</option>
                    <option value="ESTATAL">Estatal / Companhia</option>
                    <option value="NACIONAL">Portal Nacional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    UF
                  </label>
                  <select
                    value={newPortalForm.uf}
                    onChange={e => setNewPortalForm({ ...newPortalForm, uf: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#f8fafc',
                      fontSize: '0.84rem'
                    }}
                  >
                    {UF_LIST.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Município / Cidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Caruaru"
                    value={newPortalForm.city}
                    onChange={e => setNewPortalForm({ ...newPortalForm, city: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                      background: '#020617',
                      color: '#f8fafc',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  URL do Site / Portal de Licitações da Prefeitura
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newPortalForm.baseUrl}
                  onChange={e => setNewPortalForm({ ...newPortalForm, baseUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: '#020617',
                    color: '#f8fafc',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Palavra-Chave do Órgão ou CNPJ (para varredura automática de editais)
                </label>
                <input
                  type="text"
                  placeholder="Ex: nome do município, SAAE ou CNPJ do órgão"
                  value={newPortalForm.searchFilter}
                  onChange={e => setNewPortalForm({ ...newPortalForm, searchFilter: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: '#020617',
                    color: '#f8fafc',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={newPortalForm.syncImmediately}
                  onChange={e => setNewPortalForm({ ...newPortalForm, syncImmediately: e.target.checked })}
                />
                <span>Buscar imediatamente editais abertos de serviços desta Prefeitura ao salvar</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Conectar Portal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

