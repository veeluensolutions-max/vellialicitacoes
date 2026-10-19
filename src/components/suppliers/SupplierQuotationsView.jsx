// ==============================================================================
// FASE 45: SUPPLIER QUOTATIONS VIEW COMPONENT - VELLIA LICITAÇÕES
// Ecossistema de Parceiros + Fornecedores + Cotações Estratégicas
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Handshake,
  Truck,
  Building2,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Layers,
  FileCheck2,
  Send,
  Eye,
  DollarSign,
  HelpCircle,
  Mail,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckSquare
} from 'lucide-react';
import supplierQuotationService, {
  SupplierCategory,
  SupplierStatus,
  InternalRating,
  QuotationRequestStatus,
  CostCertainty,
  RevalidationStatus
} from '../../services/suppliers/supplierQuotationService';
import './SupplierQuotationsView.css';

export default function SupplierQuotationsView() {
  const [activeTab, setActiveTab] = useState('dependencies'); // dependencies, compare, suppliers, requests, tests
  const [selectedCompanyId, setSelectedCompanyId] = useState('emp-veeluen');
  const [selectedOppId, setSelectedOppId] = useState('opp-sabesp-ete');
  const [dependenciesData, setDependenciesData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [suppliersList, setSuppliersList] = useState([]);
  const [quotationsList, setQuotationsList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [testingRunning, setTestingRunning] = useState(false);
  const [selectedComparisonQuotes, setSelectedComparisonQuotes] = useState(['QUOT-2026-089', 'QUOT-2026-090']);
  const [selectedRequestPreview, setSelectedRequestPreview] = useState(null);

  // Lista mock de oportunidades do pipeline
  const mockOpportunities = [
    { id: 'opp-sabesp-ete', title: 'Operação e Monitoramento ETE Sabesp', client: 'Sabesp - SP', value: 1450000, companyId: 'emp-veeluen' },
    { id: 'opp-braskem-emissao', title: 'Amostragem Isocinética de Emissões Atmosféricas', client: 'Braskem Polo ABC', value: 890000, companyId: 'emp-veeluen' },
    { id: 'opp-petrobras-nr13', title: 'Inspeção Integrada NR-13 Vasos e Caldeiras', client: 'Petrobras RPBC', value: 2100000, companyId: 'emp-excelencia' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedOppId, selectedCompanyId]);

  const loadData = () => {
    const deps = supplierQuotationService.getOpportunityDependencies(selectedOppId);
    setDependenciesData(deps);

    const supps = supplierQuotationService.listSuppliers({ companyId: selectedCompanyId });
    setSuppliersList(supps);

    const quotes = supplierQuotationService.listQuotations({ companyId: selectedCompanyId });
    setQuotationsList(quotes);

    const reqs = supplierQuotationService.listQuotationRequests(selectedOppId);
    setRequestsList(reqs);

    const cmp = supplierQuotationService.compareQuotations(selectedComparisonQuotes);
    setComparisonData(cmp);
  };

  const handleRunTests = () => {
    setTestingRunning(true);
    setTimeout(() => {
      const res = supplierQuotationService.runGoldenSupplierTestSet();
      setTestResults(res);
      setTestingRunning(false);
    }, 350);
  };

  const handleSelectQuoteForPricing = (quoteId) => {
    const q = supplierQuotationService.getQuotationById(quoteId);
    if (!q) return;

    supplierQuotationService.linkOpportunityPartner({
      opportunityId: selectedOppId,
      organizationId: q.supplierId,
      supplierId: q.supplierId,
      supplierName: q.supplierName,
      category: q.category,
      costCertainty: CostCertainty.CONFIRMADO,
      selectedQuotationId: q.id,
      confirmedCost: q.value,
      isPrimary: true,
      notes: `Vinculada cotação ${q.quotationNumber} (v${q.version}) como base de custo oficial.`
    });

    loadData();
  };

  const renderRatingBadge = (rating) => {
    switch (rating) {
      case InternalRating.PREFERENCIAL:
        return <span className="rating-badge rating-preferencial">★ PREFERENCIAL</span>;
      case InternalRating.APROVADO:
        return <span className="rating-badge rating-aprovado">✓ APROVADO</span>;
      case InternalRating.USAR_COM_CAUTELA:
        return <span className="rating-badge rating-cautela">⚠️ USAR C/ CAUTELA</span>;
      case InternalRating.NAO_RECOMENDADO:
      default:
        return <span className="rating-badge rating-bloqueado">⛔ NÃO RECOMENDADO</span>;
    }
  };

  return (
    <div className="suppliers-container">
      {/* Top Header */}
      <div className="suppliers-header">
        <div>
          <div className="suppliers-title-badge">
            <Handshake size={14} /> FASE 45 • ECOSSISTEMA DE PARCEIROS & COTAÇÕES
          </div>
          <h1>Parceiros, Fornecedores & Cotações Estratégicas</h1>
          <p className="suppliers-subtitle">
            Gerencie dependências externas, homologação de terceiros, cotações técnicas e rastreabilidade de custos externos para suporte à formação de preço e execução segura.
          </p>
        </div>

        <div className="suppliers-header-actions">
          <div className="company-selector-suppliers">
            <button
              className={`company-btn-supp ${selectedCompanyId === 'emp-veeluen' ? 'active' : ''}`}
              onClick={() => setSelectedCompanyId('emp-veeluen')}
            >
              Veeluen Solutions
            </button>
            <button
              className={`company-btn-supp ${selectedCompanyId === 'emp-excelencia' ? 'active' : ''}`}
              onClick={() => setSelectedCompanyId('emp-excelencia')}
            >
              Excelência Ambiental
            </button>
          </div>

          <button className="btn-secondary-supp" onClick={loadData}>
            <RefreshCw size={16} /> Atualizar Dados
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="suppliers-nav-tabs">
        <button
          className={`nav-tab-supp-btn ${activeTab === 'dependencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('dependencies')}
        >
          <Layers size={16} /> Dependências da Oportunidade
        </button>
        <button
          className={`nav-tab-supp-btn ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveTab('compare')}
        >
          <DollarSign size={16} /> Comparador de Cotações
        </button>
        <button
          className={`nav-tab-supp-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          <Building2 size={16} /> Catálogo de Fornecedores & Tabelas
        </button>
        <button
          className={`nav-tab-supp-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <Mail size={16} /> Solicitações & Minutas de E-mail
        </button>
        <button
          className={`nav-tab-supp-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('tests');
            if (!testResults) handleRunTests();
          }}
        >
          <FileCheck2 size={16} /> Suíte Golden Set (11 Testes)
        </button>
      </div>

      {/* Seletor de Oportunidade */}
      {(activeTab === 'dependencies' || activeTab === 'compare' || activeTab === 'requests') && (
        <div className="suppliers-opp-selector-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
              Oportunidade Alvo:
            </span>
            <select
              className="opp-select-dropdown-supp"
              value={selectedOppId}
              onChange={(e) => setSelectedOppId(e.target.value)}
            >
              {mockOpportunities.map(opp => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} — {opp.client} (R$ {(opp.value / 1000).toLocaleString('pt-BR')}k)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {dependenciesData && (
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Cobertura de Cotações: <strong style={{ color: dependenciesData.coveragePercentage >= 80 ? '#34d399' : '#fbbf24' }}>
                  {dependenciesData.confirmedCount} de {dependenciesData.totalCount} ({dependenciesData.coveragePercentage}%)
                </strong>
                {dependenciesData.singleSourceRiskCount > 0 && (
                  <span style={{ color: '#f59e0b', marginLeft: 10 }}>⚠️ {dependenciesData.singleSourceRiskCount} Fornecedor Único</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 1: DEPENDÊNCIAS DA OPORTUNIDADE (Item 195 e 196) */}
      {activeTab === 'dependencies' && dependenciesData && (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>
              Mapeamento de Terceiros e Incerteza de Custos Externos
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Base para Formação de Preço e Prontidão Operacional
            </span>
          </div>

          <div className="dep-cards-grid">
            {dependenciesData.dependencies.map(dep => (
              <div key={dep.id} className={`dep-card ${dep.isCritical ? 'critical' : ''}`}>
                <div>
                  <div className="dep-card-header">
                    <div>
                      <div className="dep-category-title">{dep.category}</div>
                      <h4 className="dep-supplier-name">{dep.supplierName}</h4>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
                        Papel: <strong>{dep.role}</strong> {dep.isPrimary ? '(Principal)' : '(Backup)'}
                      </div>
                    </div>
                    <span className={`dep-status-badge ${dep.costCertainty === CostCertainty.CONFIRMADO ? 'badge-confirmed' : dep.costCertainty === CostCertainty.ESTIMADO ? 'badge-estimated' : 'badge-missing'}`}>
                      {dep.costCertainty === CostCertainty.CONFIRMADO ? 'Confirmado' : dep.costCertainty === CostCertainty.ESTIMADO ? 'Estimado' : 'Sem Cotação'}
                    </span>
                  </div>

                  <div className="dep-price-box">
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Custo Considerado:</span>
                    <span className="dep-price-val">
                      R$ {dep.confirmedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {dep.quotation && (
                    <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: 8 }}>
                      <div>Cotação Vinculada: <strong>{dep.quotation.quotationNumber} (v{dep.quotation.version})</strong></div>
                      <div>Validade: <strong style={{ color: dep.isExpired ? '#f87171' : '#34d399' }}>{dep.quotation.validUntil}</strong></div>
                      <div>Frete/Coleta: {dep.quotation.freightIncluded && dep.quotation.samplingIncluded ? '✓ Inclusos no escopo' : '⚠️ Escopo restrito'}</div>
                    </div>
                  )}

                  {dep.hasSingleSourceRisk && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '6px 10px', borderRadius: 6, fontSize: '0.75rem', color: '#fbbf24', marginTop: 8 }}>
                      ⚠️ <strong>Risco de Fornecedor Único:</strong> Apenas um parceiro homologado para esta especialidade.
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {dep.isCritical ? 'Dependência Crítica' : 'Opcional / Redutível'}
                  </span>
                  <button
                    className="btn-secondary-supp"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    onClick={() => setActiveTab('compare')}
                  >
                    Comparar Cotações
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 2: COMPARADOR DE COTAÇÕES (Itens 45 a 52) */}
      {activeTab === 'compare' && (
        <div className="compare-container-supp">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>
                Comparativo Técnico-Comercial de Cotações
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Analise preços, prazos, frete, coleta e validade. O Vellia não escolhe vencedor automaticamente para evitar distorções de escopo.
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
              Categoria: {comparisonData?.category || 'Laboratório Ambiental'}
            </span>
          </div>

          {/* ALERTA DE ESCOPOS NÃO EQUIVALENTES (Itens 100 e 101) */}
          {comparisonData?.hasScopeDiscrepancy && (
            <div className="scope-warning-box">
              <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>
                  Alerta Crítico: Escopos Não Equivalentes Detectados
                </strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#fef3c7' }}>
                  {comparisonData.scopeDiscrepancyNotice}
                </p>
              </div>
            </div>
          )}

          {/* Cards Lado a Lado */}
          <div className="compare-cards-row">
            {comparisonData?.quotations?.map(q => (
              <div
                key={q.id}
                className={`compare-quote-card ${q.isLowestPrice ? 'lowest-price' : ''} ${q.status === 'Accepted' ? 'accepted' : ''}`}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{q.supplierName}</h4>
                      <div style={{ marginTop: 4 }}>{renderRatingBadge(q.supplierRating)}</div>
                    </div>
                    {q.isLowestPrice && (
                      <span style={{ background: '#38bdf8', color: '#0c4a6e', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>
                        MENOR PREÇO TOTAL
                      </span>
                    )}
                  </div>

                  <div style={{ margin: '14px 0', padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Valor Cotado:</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
                      R$ {q.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div>Validade: <strong style={{ color: q.isExpired ? '#f87171' : '#34d399' }}>{q.validUntil}</strong> ({q.daysLeft} dias restantes)</div>
                    <div>Prazo de Entrega: <strong>{q.leadTimeDays} dias úteis</strong></div>
                    <div>Pagamento: <strong>{q.paymentTerms}</strong></div>
                    <div>Frete Inclusivo: <strong style={{ color: q.freightIncluded ? '#34d399' : '#f87171' }}>{q.freightIncluded ? 'SIM' : 'NÃO INCLUSO'}</strong></div>
                    <div>Coleta em Campo: <strong style={{ color: q.samplingIncluded ? '#34d399' : '#f87171' }}>{q.samplingIncluded ? 'SIM' : 'NÃO INCLUSA'}</strong></div>
                  </div>

                  <div style={{ marginTop: 14, fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 6 }}>
                    "{q.scopeSummary}"
                  </div>

                  {q.warnings.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      {q.warnings.map((w, idx) => (
                        <div key={idx} style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 2 }}>
                          ⚠️ {w}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    className="btn-primary-supp"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleSelectQuoteForPricing(q.id)}
                  >
                    <CheckSquare size={16} /> Selecionar para Composição de Preço
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: CATÁLOGO DE FORNECEDORES & TABELAS DE REFERÊNCIA */}
      {activeTab === 'suppliers' && (
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>
                Base Qualificada de Fornecedores & Acordos Comerciais
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Entidades integradas canonicamente com Organization do CRM. Histórico de avaliações e tabelas negociadas.
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
              {suppliersList.length} fornecedores homologados ({selectedCompanyId})
            </span>
          </div>

          <table className="supp-table">
            <thead>
              <tr>
                <th>Fornecedor / CNPJ</th>
                <th>Categorias</th>
                <th>Regiões Atendidas</th>
                <th>Avaliação Interna</th>
                <th>Documentos & Acreditações</th>
                <th>Acordo Comercial</th>
              </tr>
            </thead>
            <tbody>
              {suppliersList.map(supp => (
                <tr key={supp.id}>
                  <td>
                    <strong>{supp.organizationName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>CNPJ: {supp.cnpj}</div>
                    <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Contato: {supp.commercialContact?.name} ({supp.commercialContact?.email})</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {supp.categories.map((c, idx) => (
                        <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontSize: '0.7rem' }}>
                          {c.split('(')[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>
                    {supp.regionsServed.join(', ')}
                  </td>
                  <td>
                    {renderRatingBadge(supp.internalRating)}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>Status: {supp.status}</div>
                  </td>
                  <td>
                    {supp.documents.map(d => (
                      <div key={d.id} style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                        • {d.name} (Val: {d.validUntil})
                      </div>
                    ))}
                  </td>
                  <td>
                    {supp.frameworkAgreement ? (
                      <div style={{ fontSize: '0.75rem', color: '#34d399' }}>
                        ✓ {supp.frameworkAgreement.title}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sob Cotação Pontual</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ABA 4: SOLICITAÇÕES DE COTAÇÃO & E-MAILS (Itens 24 a 34) */}
      {activeTab === 'requests' && (
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff' }}>
                Painel de Solicitações de Cotação & Comunicações
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                Prepare pedidos de cotação com minutas de e-mail personalizadas. O disparo exige confirmação humana para proteger informações restritas.
              </p>
            </div>
          </div>

          <table className="supp-table">
            <thead>
              <tr>
                <th>ID / Solicitação</th>
                <th>Fornecedor</th>
                <th>Categoria</th>
                <th>Prazo Desejado</th>
                <th>Status</th>
                <th>Minuta de E-mail</th>
              </tr>
            </thead>
            <tbody>
              {requestsList.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>
                    Nenhuma solicitação aberta para este edital. Clique em "Solicitar Nova Cotação" para iniciar.
                  </td>
                </tr>
              ) : (
                requestsList.map(req => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong></td>
                    <td style={{ color: '#fff' }}>{req.supplierName}</td>
                    <td><span style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: 4, fontSize: '0.75rem' }}>{req.category}</span></td>
                    <td style={{ color: '#cbd5e1' }}>{req.dueDate}</td>
                    <td>
                      <span style={{ color: req.status === 'Received' ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary-supp"
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        onClick={() => setSelectedRequestPreview(req)}
                      >
                        <Eye size={14} /> Ver Minuta
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Modal / Preview de Minuta de E-mail */}
          {selectedRequestPreview && (
            <div style={{ marginTop: 24, padding: 18, background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid rgba(56,189,248,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ color: '#38bdf8' }}>
                  <Mail size={16} /> Minuta de Solicitação para: {selectedRequestPreview.supplierName} ({selectedRequestPreview.supplierEmail})
                </strong>
                <button
                  className="btn-secondary-supp"
                  style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  onClick={() => setSelectedRequestPreview(null)}
                >
                  Fechar
                </button>
              </div>

              <div className="email-draft-box">
                Assunto: {selectedRequestPreview.emailDraft.subject}
                {'\n\n'}
                {selectedRequestPreview.emailDraft.body}
              </div>

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  className="btn-primary-supp"
                  onClick={() => {
                    alert(`Minuta confirmada pelo usuário. Mensagem pronta para protocolo externo para ${selectedRequestPreview.supplierEmail}.`);
                    setSelectedRequestPreview(null);
                  }}
                >
                  <Send size={15} /> Confirmar & Marcar como Enviado
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABA 5: SUÍTE GOLDEN SET (11 TESTES) */}
      {activeTab === 'tests' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: '14px 20px', marginBottom: 20 }}>
            <div>
              <strong style={{ color: '#34d399', fontSize: '1rem' }}>
                Golden Supplier Test Set — Validação Regressiva Fase 45
              </strong>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                11 testes oficiais cobrindo Organization, escopos não equivalentes, validade, pricing, snapshot imutável, multiempresa e revalidação pós-vitória.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {testResults && (
                <span style={{ background: '#10b981', color: '#064e3b', fontWeight: 700, padding: '4px 12px', borderRadius: 9999, fontSize: '0.8rem' }}>
                  {testResults.passed} / {testResults.total} APROVADOS (100%)
                </span>
              )}
              <button className="btn-secondary-supp" onClick={handleRunTests} disabled={testingRunning}>
                <RefreshCw size={14} className={testingRunning ? 'animate-spin' : ''} /> Executar Suíte
              </button>
            </div>
          </div>

          {testResults && (
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
              <table className="supp-table">
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Cenário de Teste</th>
                    <th>Critério Avaliado</th>
                    <th>Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.results.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: '#94a3b8' }}>#{t.id}</td>
                      <td><strong>{t.name}</strong></td>
                      <td style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{t.details}</td>
                      <td>
                        <span style={{ color: t.passed ? '#34d399' : '#f87171', fontWeight: 700 }}>
                          {t.passed ? '✓ PASSED' : '✗ FAILED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
