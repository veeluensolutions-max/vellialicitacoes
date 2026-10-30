import React, { useState, useEffect } from 'react';
import { 
  Radar as RadarIcon, 
  Search, 
  Building2, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Globe2,
  FileText
} from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import { SERVICE_CATALOG } from '../services/semanticEngine';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import PncpIntegrationModal from './PncpIntegrationModal';
import OpportunityDetailModal from './OpportunityDetailModal';

export default function RadarConsolidatedView({ 
  onNavigateToOpportunities,
  selectedCompanyScope = 'ALL',
  searchQuery = '',
  setSearchQuery,
  onRefresh,
  isSyncing = false
}) {
  const [opportunities, setOpportunities] = useState(() => OpportunityService.listAll());
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [isPncpModalOpen, setIsPncpModalOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

  useEffect(() => {
    setLocalSearch(searchQuery || '');
  }, [searchQuery]);

  const reloadData = () => {
    setOpportunities(OpportunityService.listAll());
  };

  useEffect(() => {
    const unsub = EventBus.subscribe(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, reloadData);
    return unsub;
  }, []);

  // Serviços de cada empresa vindos do catálogo oficial
  const veeluenServices = SERVICE_CATALOG.filter(s => s.company === 'Veeluen Solutions');
  const excelenciaServices = SERVICE_CATALOG.filter(s => s.company === 'Excelência Ambiental');

  // Filtro rápido por texto se o usuário digitou algo na busca
  const matchesSearch = (opp) => {
    const q = (localSearch || '').trim().toLowerCase();
    if (!q) return true;
    return (
      (opp.number || '').toLowerCase().includes(q) ||
      (opp.client || '').toLowerCase().includes(q) ||
      (opp.object || '').toLowerCase().includes(q) ||
      (opp.title || '').toLowerCase().includes(q) ||
      (opp.primaryService || '').toLowerCase().includes(q) ||
      (opp.location || '').toLowerCase().includes(q)
    );
  };

  const veeluenOpps = opportunities.filter(
    o => ((o.recommendedCompany || '').toLowerCase().includes('veeluen') || !o.recommendedCompany) && matchesSearch(o)
  );
  const excelenciaOpps = opportunities.filter(
    o => (o.recommendedCompany || '').toLowerCase().includes('excel') && matchesSearch(o)
  );

  // Conta quantos editais batem com um serviço específico
  const countByService = (companyOpps, service) => {
    const sName = service.name.toLowerCase();
    return companyOpps.filter(opp => {
      const primary = (opp.primaryService || '').toLowerCase();
      const obj = (opp.object || '').toLowerCase();
      if (primary === sName || primary.includes(sName)) return true;
      return (service.keywords || []).some(kw => obj.includes(kw.toLowerCase()));
    }).length;
  };

  const isParticipating = (opp) => {
    return opp.decision === 'GO' || opp.status === 'Participando' || opp.status === 'Interessante' || opp.status === 'Go';
  };

  const handleToggleConcorrer = (e, opp) => {
    e.stopPropagation();
    const nextDecision = isParticipating(opp) ? 'EM_ANALISE' : 'GO';
    OpportunityService.recordDecision(opp.id, nextDecision);
    reloadData();
  };

  const handleServiceClick = (companyName, serviceName) => {
    const isExcel = companyName.toLowerCase().includes('excel');
    const scope = isExcel ? 'excelencia-ambiental' : 'veeluen-solutions';
    if (onNavigateToOpportunities) {
      onNavigateToOpportunities({
        company: companyName,
        companyScope: scope,
        searchQuery: serviceName
      });
    }
  };

  const handleCompanyEditaisClick = (companyName) => {
    const isExcel = companyName.toLowerCase().includes('excel');
    const scope = isExcel ? 'excelencia-ambiental' : 'veeluen-solutions';
    if (onNavigateToOpportunities) {
      onNavigateToOpportunities({
        company: companyName,
        companyScope: scope,
        searchQuery: ''
      });
    }
  };

  const handleSearchFormSubmit = (e) => {
    e.preventDefault();
    if (setSearchQuery) setSearchQuery(localSearch);
    if (onNavigateToOpportunities) {
      onNavigateToOpportunities({
        searchQuery: localSearch
      });
    }
  };

  const companiesToRender = [
    ...(selectedCompanyScope === 'ALL' || selectedCompanyScope === 'veeluen-solutions'
      ? [{
          id: 'veeluen-solutions',
          name: 'Veeluen Solutions',
          subtitle: 'Operação e Manutenção de ETE/ETA, Tratamento de Efluentes, NR-13, Caldeiras, Vasos de Pressão e SPDA',
          accent: '#38BDF8',
          accentBg: 'rgba(56, 189, 248, 0.1)',
          borderColor: 'rgba(56, 189, 248, 0.3)',
          services: veeluenServices,
          opps: veeluenOpps
        }]
      : []),
    ...(selectedCompanyScope === 'ALL' || selectedCompanyScope === 'excelencia-ambiental'
      ? [{
          id: 'excelencia-ambiental',
          name: 'Excelência Ambiental',
          subtitle: 'Emissões Atmosféricas, Amostragem Isocinética, Modelagem AERMOD, Qualidade do Ar, Ruído e Consultoria',
          accent: '#10B981',
          accentBg: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          services: excelenciaServices,
          opps: excelenciaOpps
        }]
      : [])
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* BARRA PRINCIPAL DO RADAR DE BUSCA DE SERVIÇOS */}
      <div style={{
        background: '#0F172A',
        border: '1px solid rgba(148, 163, 184, 0.18)',
        borderRadius: '14px',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(2, 132, 199, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38BDF8'
            }}>
              <RadarIcon size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', margin: '0 0 3px 0' }}>
                Radar de Busca de Serviços por Empresa
              </h2>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                Busque serviços alinhados à <strong>Veeluen Solutions</strong> e <strong>Excelência Ambiental</strong> nos portais Petronect, PNCP e Compras.gov.br.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setIsPncpModalOpen(true)}
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34D399',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Globe2 size={15} />
              <span>Busca Ao Vivo no PNCP</span>
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={() => onRefresh()}
                disabled={isSyncing}
                style={{
                  background: '#0284C7',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: isSyncing ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} className={isSyncing ? 'spinning' : ''} />
                <span>{isSyncing ? 'Varrendo Portais...' : 'Varrer Portais Agora'}</span>
              </button>
            )}
          </div>
        </div>

        {/* CAMPO DE BUSCA DIRETA DE SERVIÇOS */}
        <form onSubmit={handleSearchFormSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1,
            minWidth: '240px',
             position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#1E293B',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            borderRadius: '8px',
            padding: '0 12px'
          }}>
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                if (setSearchQuery) setSearchQuery(e.target.value);
              }}
              placeholder="Digite um serviço para buscar (ex: Operação de ETE, NR-13, Caldeiras, Emissões Atmosféricas, Isocinética)..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#F8FAFC',
                fontSize: '13px',
                padding: '10px 10px'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#334155',
              color: '#F8FAFC',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              borderRadius: '8px',
              padding: '0 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={15} />
            <span>Ver nos Editais ({veeluenOpps.length + excelenciaOpps.length})</span>
          </button>
        </form>
      </div>

      {/* PAINÉIS DAS 2 EMPRESAS: SERVIÇOS MONITORADOS + EDITAIS ALINHADOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: companiesToRender.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '20px'
      }}>
        {companiesToRender.map((comp) => {
          const goTotal = comp.opps.filter(isParticipating).length;
          const topEditais = comp.opps.slice(0, 5);

          return (
            <div
              key={comp.id}
              style={{
                background: '#0F172A',
                border: `1px solid ${comp.borderColor}`,
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px'
              }}
            >
              {/* Cabeçalho da Empresa */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px',
                borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
                paddingBottom: '14px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Building2 size={18} color={comp.accent} />
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#F8FAFC', margin: 0 }}>
                      {comp.name}
                    </h3>
                  </div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>
                    {comp.subtitle}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <div style={{
                    background: comp.accentBg,
                    border: `1px solid ${comp.borderColor}`,
                    borderRadius: '8px',
                    padding: '6px 12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: comp.accent, lineHeight: 1.1 }}>
                      {comp.opps.length}
                    </div>
                    <div style={{ fontSize: '10px', color: '#CBD5E1', fontWeight: 600 }}>
                      Editais
                    </div>
                  </div>

                  {goTotal > 0 && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#10B981', lineHeight: 1.1 }}>
                        {goTotal}
                      </div>
                      <div style={{ fontSize: '10px', color: '#A7F3D0', fontWeight: 600 }}>
                        Concorrendo
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Catálogo de Serviços Monitorados da Empresa */}
              <div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#94A3B8',
                  marginBottom: '10px'
                }}>
                  Serviços Monitorados no Radar (Clique para filtrar editais):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {comp.services.map((srv) => {
                    const count = countByService(comp.opps, srv);
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleServiceClick(comp.name, srv.name)}
                        style={{
                          background: count > 0 ? comp.accentBg : 'rgba(30, 41, 59, 0.7)',
                          border: count > 0 ? `1px solid ${comp.borderColor}` : '1px solid rgba(148, 163, 184, 0.15)',
                          color: count > 0 ? '#F8FAFC' : '#94A3B8',
                          borderRadius: '8px',
                          padding: '6px 11px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          transition: 'all 0.15s'
                        }}
                        title={srv.technicalDescription}
                      >
                        <span>{srv.name}</span>
                        <span style={{
                          background: count > 0 ? comp.accent : 'rgba(148, 163, 184, 0.2)',
                          color: count > 0 ? '#0F172A' : '#94A3B8',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '1px 6px',
                          borderRadius: '999px'
                        }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lista Direta dos Editais Alinhados à Empresa */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#94A3B8'
                  }}>
                    Editais para Concorrer ({comp.opps.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCompanyEditaisClick(comp.name)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: comp.accent,
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Ver todos de {comp.name}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {topEditais.length === 0 ? (
                  <div style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px dashed rgba(148, 163, 184, 0.2)',
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                    color: '#94A3B8',
                    fontSize: '13px'
                  }}>
                    Nenhum edital encontrado com o filtro atual.
                  </div>
                ) : (
                  topEditais.map((opp) => {
                    const participating = isParticipating(opp);
                    return (
                      <div
                        key={opp.id}
                        onClick={() => setSelectedDetailId(opp.id)}
                        style={{
                          background: participating ? 'rgba(16, 185, 129, 0.06)' : '#1E293B',
                          border: participating ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(148, 163, 184, 0.14)',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: 'rgba(2, 132, 199, 0.2)',
                              color: '#38BDF8'
                            }}>
                              {opp.portal}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#E2E8F0', fontFamily: 'monospace' }}>
                              #{opp.number}
                            </span>
                            <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                              • {opp.client} ({opp.location})
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '11px',
                              color: opp.daysLeft <= 3 ? '#F87171' : '#CBD5E1',
                              fontWeight: opp.daysLeft <= 3 ? 700 : 500,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Clock size={12} />
                              {opp.endDate} ({opp.daysLeft}d)
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 500, lineHeight: 1.4 }}>
                          {opp.object}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: comp.accent,
                            background: comp.accentBg,
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            Serviço: {opp.primaryService}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleToggleConcorrer(e, opp)}
                              style={{
                                background: participating ? '#10B981' : 'rgba(16, 185, 129, 0.12)',
                                color: participating ? '#0F172A' : '#34D399',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <CheckCircle2 size={12} />
                              <span>{participating ? 'Concorrendo' : 'Concorrer'}</span>
                            </button>

                            {opp.url && (
                              <a
                                href={opp.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                style={{
                                  background: 'rgba(148, 163, 184, 0.12)',
                                  color: '#E2E8F0',
                                  border: '1px solid rgba(148, 163, 184, 0.25)',
                                  borderRadius: '6px',
                                  padding: '4px 9px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                                title="Abrir edital no portal oficial"
                              >
                                <ExternalLink size={11} />
                                <span>Edital</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {comp.opps.length > 5 && (
                  <button
                    type="button"
                    onClick={() => handleCompanyEditaisClick(comp.name)}
                    style={{
                      background: 'rgba(30, 41, 59, 0.8)',
                      border: `1px solid ${comp.borderColor}`,
                      color: '#F8FAFC',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    Ver todos os {comp.opps.length} editais de {comp.name} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Busca Ao Vivo no PNCP */}
      <PncpIntegrationModal
        isOpen={isPncpModalOpen}
        onClose={() => setIsPncpModalOpen(false)}
        onSuccess={() => reloadData()}
      />

      {/* Modal Limpo de Detalhes do Edital */}
      <OpportunityDetailModal
        opportunityId={selectedDetailId}
        isOpen={!!selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
        onUpdated={() => reloadData()}
      />
    </div>
  );
}
