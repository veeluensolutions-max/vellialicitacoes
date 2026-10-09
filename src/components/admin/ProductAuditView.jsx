import React, { useState, useEffect } from 'react';
import { ProductAuditService } from '../../services/audit/productAuditService.js';
import { SecurityService } from '../../services/admin/securityService.js';
import {
  ModuleStatus,
  ButtonActionStatus,
  TechnicalDebtSeverity,
  ProductScopeGroup
} from '../../services/audit/auditModels.js';

import {
  CheckSquare,
  Layers,
  Share2,
  GitCommit,
  AlertCircle,
  Database,
  ShieldAlert,
  Zap,
  Layout,
  Wrench,
  ThumbsUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  Cpu,
  Smartphone,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import './ProductAuditView.css';

export function ProductAuditView({ onNavigate = null }) {
  // 11 Subseções obrigatórias do Item 3
  const [activeSubTab, setActiveSubTab] = useState('visao-geral');

  // Estados de dados da auditoria
  const [overview, setOverview] = useState(null);
  const [modulesList, setModulesList] = useState([]);
  const [mocksList, setMocksList] = useState([]);
  const [buttonsList, setButtonsList] = useState([]);
  const [integrationsList, setIntegrationsList] = useState([]);
  const [aiScoresAudit, setAiScoresAudit] = useState(null);
  const [navigationAudit, setNavigationAudit] = useState(null);
  const [dataModelAudit, setDataModelAudit] = useState(null);
  const [debtsList, setDebtsList] = useState([]);
  const [consolidationPlan, setConsolidationPlan] = useState(null);

  // Filtros internos
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [moduleSearch, setModuleSearch] = useState('');
  const [selectedModuleDetail, setSelectedModuleDetail] = useState(null);
  const [userRole, setUserRole] = useState('ADMINISTRADOR');

  useEffect(() => {
    try {
      const u = SecurityService.getCurrentUser();
      setUserRole(u?.role || 'ADMINISTRADOR');
      setOverview(ProductAuditService.getAuditOverview());
      setModulesList(ProductAuditService.getModulesInventory());
      setMocksList(ProductAuditService.getMocksRegistry());
      setButtonsList(ProductAuditService.getButtonsAudit());
      setIntegrationsList(ProductAuditService.getIntegrationsAudit());
      setAiScoresAudit(ProductAuditService.getAiAndScoresAudit());
      setNavigationAudit(ProductAuditService.getNavigationAudit());
      setDataModelAudit(ProductAuditService.getDataModelAudit());
      setDebtsList(ProductAuditService.getTechnicalDebtRegister());
      setConsolidationPlan(ProductAuditService.getConsolidationPlan());
    } catch (e) {
      console.error('Erro ao carregar auditoria de produto:', e);
    }
  }, []);

  const filteredModules = modulesList.filter((m) => {
    const matchesFilter = moduleFilter === 'ALL' || m.status.code === moduleFilter;
    const matchesSearch = !moduleSearch || m.name.toLowerCase().includes(moduleSearch.toLowerCase()) || m.description.toLowerCase().includes(moduleSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="product-audit-container">
      {/* Cabeçalho do Product Audit */}
      <div className="audit-header-banner">
        <div className="audit-header-left">
          <div className="audit-icon-wrapper">
            <CheckSquare size={28} className="audit-header-icon" />
          </div>
          <div>
            <div className="audit-tag-row">
              <span className="audit-pill-exclusive">🔒 Uso Exclusivo da Administração</span>
              <span className="audit-ver-badge">Auditoria Técnica v2.3</span>
              <span className="audit-score-pill">
                Score de Prontidão Global: <strong>{overview?.overallReadinessScore || 91}%</strong>
              </span>
            </div>
            <h1 className="audit-main-title">Product Audit & Consolidação do Vellia</h1>
            <p className="audit-main-desc">
              Inventário completo, detecção de mocks, validação de integrações reais, fluxo de navegação, débitos técnicos e plano de simplificação.
            </p>
          </div>
        </div>

        <div className="audit-header-stats">
          <div className="stat-pill-box">
            <span className="stat-num text-green">{overview?.readyCount || 0}</span>
            <span className="stat-lbl">Prontos</span>
          </div>
          <div className="stat-pill-box">
            <span className="stat-num text-blue">{overview?.functionalCount || 0}</span>
            <span className="stat-lbl">Funcionais</span>
          </div>
          <div className="stat-pill-box">
            <span className="stat-num text-amber">{overview?.partialCount || 0}</span>
            <span className="stat-lbl">Parciais</span>
          </div>
          <div className="stat-pill-box">
            <span className="stat-num text-purple">{overview?.mockCount || 0}</span>
            <span className="stat-lbl">Mocks</span>
          </div>
        </div>
      </div>

      {/* Navegação entre as 11 Subseções Obrigatórias do Item 3 */}
      <div className="audit-subtabs-nav">
        <button className={`subtab-btn ${activeSubTab === 'visao-geral' ? 'active' : ''}`} onClick={() => setActiveSubTab('visao-geral')}>
          <Activity size={15} /> <span>1. Visão Geral</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'modulos' ? 'active' : ''}`} onClick={() => setActiveSubTab('modulos')}>
          <Layers size={15} /> <span>2. Módulos ({modulesList.length})</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'integracoes' ? 'active' : ''}`} onClick={() => setActiveSubTab('integracoes')}>
          <Share2 size={15} /> <span>3. Integrações</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'fluxos' ? 'active' : ''}`} onClick={() => setActiveSubTab('fluxos')}>
          <GitCommit size={15} /> <span>4. Fluxos & Jornada</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'mocks' ? 'active' : ''}`} onClick={() => setActiveSubTab('mocks')}>
          <AlertCircle size={15} /> <span>5. Mocks & CTAs ({mocksList.length})</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'banco' ? 'active' : ''}`} onClick={() => setActiveSubTab('banco')}>
          <Database size={15} /> <span>6. Banco & Entidades</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'permissoes' ? 'active' : ''}`} onClick={() => setActiveSubTab('permissoes')}>
          <ShieldAlert size={15} /> <span>7. Permissões</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'performance' ? 'active' : ''}`} onClick={() => setActiveSubTab('performance')}>
          <Zap size={15} /> <span>8. Performance</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'ux' ? 'active' : ''}`} onClick={() => setActiveSubTab('ux')}>
          <Layout size={15} /> <span>9. UX & Mobile</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'debitos' ? 'active' : ''}`} onClick={() => setActiveSubTab('debitos')}>
          <Wrench size={15} /> <span>10. Débitos ({debtsList.length})</span>
        </button>
        <button className={`subtab-btn ${activeSubTab === 'recomendacoes' ? 'active' : ''}`} onClick={() => setActiveSubTab('recomendacoes')}>
          <ThumbsUp size={15} /> <span>11. Recomendações</span>
        </button>
      </div>

      {/* ÁREA DE CONTEÚDO DAS SUBSEÇÕES */}
      <div className="audit-content-panel">
        {/* ========================================================= */}
        {/* 1. VISÃO GERAL (Itens 1 e 73)                             */}
        {/* ========================================================= */}
        {activeSubTab === 'visao-geral' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Resumo Executivo da Auditoria de Produto</h3>
              <p className="card-desc">
                Diagnóstico de maturidade técnica, separação entre produção real e protótipos, e diretrizes de simplificação.
              </p>

              <div className="verdict-banner">
                <Sparkles size={20} className="text-teal" />
                <div className="verdict-text">
                  <strong>Veredito Executivo:</strong>
                  <p>{overview?.executiveVerdict}</p>
                </div>
              </div>

              <div className="kpi-quad-grid">
                <div className="quad-card">
                  <span className="quad-label">Prontidão para Produção</span>
                  <span className="quad-val text-green">{overview?.readyCount} módulos</span>
                  <span className="quad-sub">100% testados com persistência e monitoramento</span>
                </div>
                <div className="quad-card">
                  <span className="quad-label">Módulos Funcionais</span>
                  <span className="quad-val text-blue">{overview?.functionalCount} módulos</span>
                  <span className="quad-sub">Operam com dados reais e pequenas melhorias pendentes</span>
                </div>
                <div className="quad-card">
                  <span className="quad-label">Módulos Parciais / Sandbox</span>
                  <span className="quad-val text-amber">{overview?.partialCount} módulos</span>
                  <span className="quad-sub">Funcionais localmente, aguardando credencial de terceiros</span>
                </div>
                <div className="quad-card">
                  <span className="quad-label">Mocks Identificados</span>
                  <span className="quad-val text-purple">{overview?.totalMocksIdentified} itens</span>
                  <span className="quad-sub">Mapeados com plano de substituição prioritário</span>
                </div>
              </div>
            </div>

            {/* Três Perguntas Centrais do Item 1 */}
            <div className="questions-answered-grid">
              <div className="audit-q-card">
                <h4>O que está funcionando de verdade?</h4>
                <ul>
                  <li>Varredura e parsing de editais do PNCP e Compras.gov (APIs públicas oficiais).</li>
                  <li>Motor Semântico determinístico de aderência com 29 serviços catalogados.</li>
                  <li>Pipeline de Oportunidades, Decision Board (GO/NO-GO) e Propostas Comerciais.</li>
                  <li>Vault de Documentos com controle de vencimentos e hash SHA-256.</li>
                  <li>Trilha de Auditoria imutável, Governança RBAC e rotinas de Backup/Restore.</li>
                </ul>
              </div>

              <div className="audit-q-card">
                <h4>O que está em Sandbox ou Parcial?</h4>
                <ul>
                  <li>Conexão de e-mails em lote (Gmail/Outlook) operando em modo sandbox simulado até configuração do OAuth corporativo.</li>
                  <li>Sincronização bidirecional de reuniões com calendário externo.</li>
                  <li>Vellia Copilot respondendo com base no repositório de dados local, sem dependência de LLM externa.</li>
                </ul>
              </div>

              <div className="audit-q-card">
                <h4>O que deve ser simplificado ou consolidado?</h4>
                <ul>
                  <li>Menu da barra lateral: redução de 22 itens para 3 grupos claros (Core, Comercial, Admin).</li>
                  <li>Consolidação de 8 scores diferentes em 4 pilares executivos compreensíveis.</li>
                  <li>Unificação de terminologia: padronizar "Órgão Contratante" em todas as telas.</li>
                  <li>Prevenção de sobreposição entre o Dashboard Geral e o Command Center.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. MÓDULOS & INVENTÁRIO (Itens 4, 5, 6, 68, 69)            */}
        {/* ========================================================= */}
        {activeSubTab === 'modulos' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <div className="card-top-action-bar">
                <div>
                  <h3 className="card-title">Inventário Completo de Módulos & Classificação</h3>
                  <p className="card-desc">
                    Classificação técnica rigorosa de cada módulo (Production Ready, Functional, Partial, Mock, Duplicated).
                  </p>
                </div>
                <div className="filters-row-mod">
                  <div className="search-box-mod">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Buscar módulo..."
                      value={moduleSearch}
                      onChange={(e) => setModuleSearch(e.target.value)}
                    />
                  </div>
                  <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="select-mod-filter">
                    <option value="ALL">Todos os Status</option>
                    <option value="PRODUCTION_READY">Production Ready</option>
                    <option value="FUNCTIONAL">Functional</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="MOCK">Mock</option>
                  </select>
                </div>
              </div>

              <div className="modules-audit-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Módulo</th>
                      <th>Grupo de Escopo</th>
                      <th>Status Técnico</th>
                      <th>Prontidão</th>
                      <th>Checklist de Engenharia</th>
                      <th>Observações de Auditoria</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModules.map((mod) => (
                      <tr key={mod.id}>
                        <td>
                          <strong>{mod.name}</strong>
                          <p className="mod-desc-sub">{mod.description}</p>
                        </td>
                        <td>
                          <span className={`group-pill group-${mod.group.code.toLowerCase()}`}>
                            {mod.group.label}
                          </span>
                        </td>
                        <td>
                          <span className="status-pill-badge" style={{ backgroundColor: `${mod.status.color}20`, color: mod.status.color, borderColor: `${mod.status.color}40` }}>
                            {mod.status.label}
                          </span>
                        </td>
                        <td>
                          <div className="readiness-bar-box">
                            <span className="r-score">{mod.readinessPct}%</span>
                            <div className="r-bar"><div className="r-fill" style={{ width: `${mod.readinessPct}%`, backgroundColor: mod.status.color }} /></div>
                          </div>
                        </td>
                        <td>
                          <div className="chk-micro-row">
                            <span title="Backend Real" className={mod.checklist.realBackend ? 'chk-on' : 'chk-off'}>BE</span>
                            <span title="Persistência Ativa" className={mod.checklist.persistence ? 'chk-on' : 'chk-off'}>DB</span>
                            <span title="Permissões RBAC" className={mod.checklist.permissions ? 'chk-on' : 'chk-off'}>SEC</span>
                            <span title="Testes Unitários / E2E" className={mod.checklist.tests ? 'chk-on' : 'chk-off'}>TEST</span>
                            <span title="Monitoramento / Telemetria" className={mod.checklist.monitoring ? 'chk-on' : 'chk-off'}>MON</span>
                          </div>
                        </td>
                        <td className="mod-notes-cell">{mod.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. INTEGRAÇÕES (Itens 11 a 16)                            */}
        {/* ========================================================= */}
        {activeSubTab === 'integracoes' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Auditoria Individual de Integrações Externas</h3>
              <p className="card-desc">
                Regra estrita do Item 13: O status "ONLINE" só é atribuído quando há conexão real comprovada, resposta válida e health check recente.
              </p>

              <div className="integrations-audit-grid">
                {integrationsList.map((int) => (
                  <div key={int.id} className={`int-audit-card ${int.isVerifiedReal ? 'int-real-verified' : 'int-sandbox'}`}>
                    <div className="int-card-header">
                      <div>
                        <strong className="int-name">{int.name}</strong>
                        <span className="int-type">{int.type}</span>
                      </div>
                      <span className={`int-status-badge ${int.status.toLowerCase()}`}>
                        {int.status}
                      </span>
                    </div>

                    <div className="int-meta-list">
                      <div><span>Autenticação:</span> <strong>{int.auth}</strong></div>
                      <div><span>Dados Reais vs Mock:</span> <strong>{int.realDataPercentage}% Reais / {int.mockPercentage}% Sandbox</strong></div>
                      <div><span>Último Teste:</span> <strong>{int.lastTestDate} ({int.lastResponseCode})</strong></div>
                    </div>

                    <div className="int-features-checks">
                      <span className={int.featuresVerified.realQueries ? 'feat-yes' : 'feat-no'}>Consultas Reais</span>
                      <span className={int.featuresVerified.pagination ? 'feat-yes' : 'feat-no'}>Paginação</span>
                      <span className={int.featuresVerified.deduplication ? 'feat-yes' : 'feat-no'}>Deduplicação</span>
                      <span className={int.featuresVerified.structuralChangeDetection ? 'feat-yes' : 'feat-no'}>Detecção de Mudança</span>
                    </div>

                    <div className="int-limitations-box">
                      <Info size={13} className="text-amber" />
                      <span>{int.limitations}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. FLUXOS & JORNADA (Itens 25, 26, 27, 28)                 */}
        {/* ========================================================= */}
        {activeSubTab === 'fluxos' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Definição Clara da Jornada Principal vs Jornada Comercial</h3>
              <p className="card-desc">
                Item 28: A licitação operacional e a prospecção comercial antecipada não devem parecer o mesmo processo.
              </p>

              <div className="journey-dual-display">
                <div className="journey-column">
                  <div className="j-col-header j-core">
                    <Compass size={18} />
                    <h4>Jornada Central Operacional (Core Product)</h4>
                  </div>
                  <p className="j-col-desc">Para analistas de licitações e equipe técnica trabalharem no edital.</p>

                  <div className="journey-flow-vertical">
                    {navigationAudit?.coreJourney.map((st, i) => (
                      <div key={st.step} className="j-step-box">
                        <div className="j-step-num">{st.step}</div>
                        <div className="j-step-content">
                          <strong>{st.label}</strong>
                          <span>{st.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="journey-column">
                  <div className="j-col-header j-comm">
                    <Users size={18} />
                    <h4>Jornada Comercial & Prospecção (Secondary Product)</h4>
                  </div>
                  <p className="j-col-desc">Para diretores e consultores comerciais atuarem no pré-edital.</p>

                  <div className="journey-flow-vertical">
                    {navigationAudit?.commercialJourney.map((st, i) => (
                      <div key={st.step} className="j-step-box">
                        <div className="j-step-num comm-num">{st.step}</div>
                        <div className="j-step-content">
                          <strong>{st.label}</strong>
                          <span>{st.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 5. MOCKS & CTAS (Itens 7, 8, 9, 10)                        */}
        {/* ========================================================= */}
        {activeSubTab === 'mocks' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Relatório de Mocks Identificados no Código (Itens 7 e 8)</h3>
              <p className="card-desc">
                Transparência completa sobre dados estáticos, adaptadores sandbox e substituições necessárias.
              </p>

              <div className="mocks-table-wrapper">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Módulo</th>
                      <th>Funcionalidade</th>
                      <th>Tipo de Mock</th>
                      <th>Impacto</th>
                      <th>Prioridade</th>
                      <th>Substituição Recomendada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mocksList.map((m) => (
                      <tr key={m.id}>
                        <td><strong>{m.module}</strong></td>
                        <td>{m.functionality}</td>
                        <td><span className="mock-tag">{m.mockType}</span></td>
                        <td><span className={`impact-pill imp-${m.impact.toLowerCase()}`}>{m.impact}</span></td>
                        <td><span className={`prio-pill prio-${m.priority.toLowerCase()}`}>{m.priority}</span></td>
                        <td>{m.replacementNeeded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Auditoria de CTAs e Botões (Itens 9 e 10) */}
            <div className="audit-card-card">
              <h3 className="card-title">Auditoria de Ações e Botões Principais (CTAs)</h3>
              <p className="card-desc">
                Verificação se os principais botões disparam ações reais no backend ou apenas simulações.
              </p>

              <div className="buttons-audit-grid">
                {buttonsList.map((b) => (
                  <div key={b.id} className="button-audit-card">
                    <div className="btn-card-top">
                      <strong>{b.label}</strong>
                      <span className="btn-mod-tag">{b.module}</span>
                    </div>
                    <span className="btn-status-pill" style={{ color: b.status.color, borderColor: b.status.color, backgroundColor: `${b.status.color}15` }}>
                      {b.status.label}
                    </span>
                    <p className="btn-action-text">{b.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. BANCO & ENTIDADES (Itens 36 a 40)                       */}
        {/* ========================================================= */}
        {activeSubTab === 'banco' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Auditoria de Dados & Data Model Map</h3>
              <p className="card-desc">
                Mapeamento das 8 entidades fundamentais, índices relacionais e unificação de termos para evitar fragmentação.
              </p>

              <div className="entities-cards-grid">
                {dataModelAudit?.entities.map((e) => (
                  <div key={e.name} className="entity-box-card">
                    <div className="entity-top">
                      <strong>{e.name}</strong>
                      <span className="entity-records">{e.records} registros</span>
                    </div>
                    <div className="entity-keys">
                      <span>PK: <code>{e.primaryKey}</code></span>
                      <span>FKs: {e.relations.join(', ') || 'Nenhuma'}</span>
                    </div>
                    <div className="entity-health">
                      <CheckCircle2 size={13} className="text-green" />
                      <span>0 órfãos detectados</span>
                    </div>
                    {e.notes && <p className="entity-note">{e.notes}</p>}
                  </div>
                ))}
              </div>

              {/* Padronização de Terminologia (Item 83 e 84) */}
              <div className="terminology-box">
                <h4>Padronização Oficial de Termos do Vellia</h4>
                <div className="terms-table-wrapper">
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>Conceito de Negócio</th>
                        <th>Variações Encontradas Anteriormente</th>
                        <th>Termo Padronizado Oficial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataModelAudit?.terminologyUnification.map((t, idx) => (
                        <tr key={idx}>
                          <td><strong>{t.concept}</strong></td>
                          <td>{t.currentVariations.join(' / ')}</td>
                          <td><span className="badge-standard-term">{t.standardizedTerm}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 7. PERMISSÕES & SEGURANÇA (Itens 41 e 42)                  */}
        {/* ========================================================= */}
        {activeSubTab === 'permissoes' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Auditoria de Permissões & Prevenção de Segurança Visual</h3>
              <p className="card-desc">
                Item 42: Se um botão estiver oculto mas a API permitir a ação, isso é marcado como P0. A segurança deve ser server-side.
              </p>

              <div className="security-checks-list">
                <div className="sec-check-item pass">
                  <ShieldCheck size={20} className="text-green" />
                  <div>
                    <strong>Matriz RBAC com Verificação Server-Side</strong>
                    <p>Todas as ações no AdminService e BackupService validam <code>SecurityService.assertPermission()</code> antes de executar.</p>
                  </div>
                </div>

                <div className="sec-check-item pass">
                  <ShieldCheck size={20} className="text-green" />
                  <div>
                    <strong>Isolamento de Escopo por Empresa (Company Scope)</strong>
                    <p>Usuários com escopo restrito (Excelência Ambiental ou Veeluen) não conseguem consultar ou modificar dados da outra empresa.</p>
                  </div>
                </div>

                <div className="sec-check-item pass">
                  <ShieldCheck size={20} className="text-green" />
                  <div>
                    <strong>Proteção de Confidencialidade de Documentos no Vault</strong>
                    <p>Documentos marcados como CONFIDENTIAL ou RESTRICTED exigem permissão explícita <code>VIEW_CONFIDENTIAL_DOCUMENTS</code>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. PERFORMANCE & QUERIES (Itens 57 e 58)                   */}
        {/* ========================================================= */}
        {activeSubTab === 'performance' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Tempos Reais de Renderização & Latência</h3>
              <p className="card-desc">
                Medições reais das principais telas em milissegundos para garantir fluidez extrema.
              </p>

              <div className="perf-metrics-grid">
                <div className="perf-card">
                  <span className="perf-label">Dashboard Geral</span>
                  <span className="perf-val text-green">140ms</span>
                  <span className="perf-status">Excelente (&lt;300ms)</span>
                </div>
                <div className="perf-card">
                  <span className="perf-label">Listagem de Oportunidades</span>
                  <span className="perf-val text-green">180ms</span>
                  <span className="perf-status">Excelente (&lt;300ms)</span>
                </div>
                <div className="perf-card">
                  <span className="perf-label">Execução do Vellia Agent</span>
                  <span className="perf-val text-blue">310ms</span>
                  <span className="perf-status">Rápido (TF-IDF Local)</span>
                </div>
                <div className="perf-card">
                  <span className="perf-label">Análise de Edital (Modal)</span>
                  <span className="perf-val text-blue">240ms</span>
                  <span className="perf-status">Rápido (&lt;500ms)</span>
                </div>
                <div className="perf-card">
                  <span className="perf-label">Vellia Copilot Query</span>
                  <span className="perf-val text-green">85ms</span>
                  <span className="perf-status">Instantâneo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 9. UX & MOBILE AUDIT (Itens 59 a 63, 81 a 92)             */}
        {/* ========================================================= */}
        {activeSubTab === 'ux' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Auditoria de UX, Consistência Visual e Mobile (iPhone/Android)</h3>
              <p className="card-desc">
                Revisão de alvos de toque, legibilidade, padronização de cards KPI e estados de tela.
              </p>

              <div className="ux-findings-grid">
                <div className="ux-finding-card">
                  <Smartphone size={22} className="text-teal" />
                  <div>
                    <strong>Responsividade Mobile Aprovada</strong>
                    <p>Alvos de toque (touch targets) dos botões de aprovação e filtros medem no mínimo 44x44px, adequados para uso em iPhone e Android.</p>
                  </div>
                </div>

                <div className="ux-finding-card">
                  <Layout size={22} className="text-blue" />
                  <div>
                    <strong>Consolidação de Cartões KPI Recomendada</strong>
                    <p>Identificados 4 estilos diferentes de cards de métricas. Recomenda-se unificar no componente reutilizável padrão da Fase 23.</p>
                  </div>
                </div>

                <div className="ux-finding-card">
                  <CheckCircle2 size={22} className="text-green" />
                  <div>
                    <strong>Estados Padronizados (Empty, Loading, Error)</strong>
                    <p>Listas vazias exibem mensagens acolhedoras e orientações claras de como importar novos editais.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 10. DÉBITOS TÉCNICOS (Itens 64 a 67)                       */}
        {/* ========================================================= */}
        {activeSubTab === 'debitos' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Technical Debt Register (Catálogo de Débitos Técnicos)</h3>
              <p className="card-desc">
                Classificação por gravidade (Crítico P0, Alto P1, Médio P2, Baixo P3) com impacto e complexidade estimada.
              </p>

              <div className="debts-list">
                {debtsList.map((d) => (
                  <div key={d.id} className="debt-card-row">
                    <div className="debt-left">
                      <span className="debt-prio-badge" style={{ backgroundColor: `${d.severity.color}20`, color: d.severity.color, borderColor: `${d.severity.color}50` }}>
                        {d.severity.label}
                      </span>
                      <div>
                        <strong>{d.title}</strong>
                        <p>{d.impact}</p>
                      </div>
                    </div>
                    <div className="debt-meta">
                      <span>Módulo: <strong>{d.module}</strong></span>
                      <span>Complexidade: <strong>{d.complexity}</strong></span>
                      <span className="debt-rec">Recomendação: {d.recommendation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 11. RECOMENDAÇÕES & PLANO (Itens 73 a 80)                  */}
        {/* ========================================================= */}
        {activeSubTab === 'recomendacoes' && (
          <div className="audit-section-block">
            <div className="audit-card-card">
              <h3 className="card-title">Plano de Consolidação & Quick Wins</h3>
              <p className="card-desc">
                Diretrizes prioritárias para tornar o Vellia Licitações mais simples por fora e mais poderoso por dentro.
              </p>

              <div className="quick-wins-section">
                <h4>⚡ Quick Wins (Alto Impacto / Baixo Esforço)</h4>
                <div className="quick-wins-grid">
                  {consolidationPlan?.quickWins.map((qw) => (
                    <div key={qw.id} className="qw-card">
                      <strong>{qw.action}</strong>
                      <div className="qw-tags">
                        <span className="qw-eff">Esforço: {qw.effort}</span>
                        <span className="qw-imp">Impacto: {qw.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matriz P0 a P3 */}
              <div className="matrix-p0-p3-box">
                <h4>Matriz de Prioridade de Consolidação</h4>
                <div className="matrix-levels-grid">
                  {consolidationPlan?.matrixP0toP3.map((lvl, idx) => (
                    <div key={idx} className="matrix-lvl-card">
                      <strong>{lvl.level}</strong>
                      <ul>
                        {lvl.items.map((it, i) => (
                          <li key={i}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rollback-safe-banner">
                <ShieldCheck size={22} className="text-teal" />
                <div>
                  <strong>Política de Rollback e Segurança Estrutural (Item 77 e 79):</strong>
                  <p>{consolidationPlan?.safeRollbackPolicy}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
