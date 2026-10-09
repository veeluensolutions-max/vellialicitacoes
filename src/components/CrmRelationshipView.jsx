import React, { useState, useEffect, useMemo } from 'react';
import { crmService } from '../services/crm/crmService.js';
import {
  OrganizationType,
  StrategicClassification,
  ContactRole,
  InfluenceLevel,
  InteractionType,
  FollowUpStatus,
  FollowUpPriority,
  PipelineStage,
  RelationshipTemperature
} from '../services/crm/crmModels.js';
import {
  Users,
  Building2,
  PhoneCall,
  Calendar,
  Kanban,
  Clock,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Star,
  ExternalLink,
  Mail,
  Phone,
  FileText,
  UserCheck,
  TrendingUp,
  Briefcase,
  Layers,
  Sparkles,
  ShieldCheck,
  Eye,
  Send,
  MessageSquare,
  Award,
  Flame,
  CheckSquare
} from 'lucide-react';
import { uxTelemetryService, UxEventType } from '../services/ux/uxTelemetryService';
import './CrmRelationshipView.css';

export default function CrmRelationshipView() {
  const [activeTab, setActiveTab] = useState('organizacoes'); // 'organizacoes' | 'contatos' | 'interacoes' | 'followups' | 'pipeline' | 'agenda'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassification, setSelectedClassification] = useState('ALL');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [selectedPipelineFilter, setSelectedPipelineFilter] = useState('ALL');

  // Dados reativos
  const [organizations, setOrganizations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [alerts, setAlerts] = useState({ today: [], overdue: [], tomorrow: [], next7Days: [] });
  const [pipelineCards, setPipelineCards] = useState([]);
  const [manualSignals, setManualSignals] = useState([]);
  const [executiveMetrics, setExecutiveMetrics] = useState({});
  const [weeklySummary, setWeeklySummary] = useState(null);

  // Modais
  const [selectedOrg360Id, setSelectedOrg360Id] = useState(null);
  const [isNewFollowUpModalOpen, setIsNewFollowUpModalOpen] = useState(false);
  const [isNewInteractionModalOpen, setIsNewInteractionModalOpen] = useState(false);
  const [isNewSignalModalOpen, setIsNewSignalModalOpen] = useState(false);

  // Formulários
  const [newFollowUpForm, setNewFollowUpForm] = useState({
    title: '',
    organizationId: '',
    contactName: '',
    responsible: 'Roberto Mendes (Diretor Comercial)',
    date: '2026-10-08',
    time: '14:00',
    priority: FollowUpPriority.ALTA,
    reason: ''
  });

  const [newInteractionForm, setNewInteractionForm] = useState({
    organizationId: '',
    contactName: '',
    internalResponsible: 'Roberto Mendes',
    type: InteractionType.REUNIAO,
    subject: '',
    summary: '',
    result: '',
    nextStep: ''
  });

  const [newSignalForm, setNewSignalForm] = useState({
    organizationId: '',
    contactName: '',
    title: '',
    service: 'Tratamento de Efluentes e Operação de ETE',
    estimatedValue: 500000,
    expectedHorizon: '1º Semestre de 2027',
    temperature: RelationshipTemperature.QUENTE,
    notes: ''
  });

  const loadData = () => {
    setOrganizations(crmService.getOrganizations());
    setContacts(crmService.getContacts());
    setInteractions(crmService.getInteractions());
    setFollowUps(crmService.getFollowUps());
    setAlerts(crmService.getFollowUpAlerts());
    setPipelineCards(crmService.getPipelineCards());
    setManualSignals(crmService.getManualSignals());
    setExecutiveMetrics(crmService.getExecutiveDashboardMetrics());
    setWeeklySummary(crmService.getWeeklyCommercialSummary());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleFavorite = (orgId) => {
    crmService.toggleFavoriteOrg(orgId);
    setOrganizations(crmService.getOrganizations());
  };

  const handleCompleteFollowUp = (id) => {
    crmService.updateFollowUpStatus(id, FollowUpStatus.CONCLUIDO);
    loadData();
  };

  const handleSaveFollowUp = (e) => {
    e.preventDefault();
    const org = organizations.find(o => o.id === newFollowUpForm.organizationId);
    crmService.addFollowUp({
      ...newFollowUpForm,
      organizationName: org ? org.name : 'Organização'
    });
    setIsNewFollowUpModalOpen(false);
    loadData();
  };

  const handleSaveInteraction = (e) => {
    e.preventDefault();
    const org = organizations.find(o => o.id === newInteractionForm.organizationId);
    crmService.addInteraction({
      ...newInteractionForm,
      organizationName: org ? org.name : 'Organização',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    });

    uxTelemetryService.recordEvent(
      UxEventType.FOLLOWUP_COMPLETED,
      'CrmRelationshipView',
      { orgId: newInteractionForm.organizationId, type: newInteractionForm.type },
      2
    );

    setIsNewInteractionModalOpen(false);
    loadData();
  };

  const handleSaveSignal = (e) => {
    e.preventDefault();
    const org = organizations.find(o => o.id === newSignalForm.organizationId);
    crmService.addManualSignal({
      ...newSignalForm,
      organizationName: org ? org.name : 'Organização'
    });
    setIsNewSignalModalOpen(false);
    loadData();
  };

  // Filtragem de Organizações
  const filteredOrgs = useMemo(() => {
    return organizations.filter(o => {
      const matchQuery = !searchQuery ||
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.segment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClassification === 'ALL' || o.strategicClassification === selectedClassification;
      return matchQuery && matchClass;
    });
  }, [organizations, searchQuery, selectedClassification]);

  // Filtragem de Contatos
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchQuery = !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.position.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = selectedRoleFilter === 'ALL' || c.role === selectedRoleFilter;
      return matchQuery && matchRole;
    });
  }, [contacts, searchQuery, selectedRoleFilter]);

  // Organização selecionada para Visão 360
  const org360Data = useMemo(() => {
    if (!selectedOrg360Id) return null;
    return crmService.getOrganization360(selectedOrg360Id);
  }, [selectedOrg360Id, organizations, interactions, followUps]);

  return (
    <div className="crm-container">
      {/* HEADER EXECUTIVO DO CRM */}
      <header className="crm-header">
        <div className="header-left">
          <div className="module-tag">
            <Users size={16} />
            <span>CRM de Relacionamento com Órgãos e Decisores</span>
          </div>
          <h1 className="header-title">Relacionamento & Prospecção B2G</h1>
          <p className="header-subtitle">
            Gestão institucional de contas públicas, mapeamento de decisores e inteligência preventiva pré-edital.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn-quick-action" onClick={() => setIsNewFollowUpModalOpen(true)}>
            <Clock size={16} />
            <span>Criar Follow-up</span>
          </button>
          <button className="btn-quick-action" onClick={() => setIsNewInteractionModalOpen(true)}>
            <MessageSquare size={16} />
            <span>Registrar Interação</span>
          </button>
          <button className="btn-quick-action highlight" onClick={() => setIsNewSignalModalOpen(true)}>
            <Flame size={16} />
            <span>Registrar Demanda / Sinal Manual</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD EXECUTIVO KPIS (Item 45) */}
      <section className="crm-kpi-grid">
        <div className="crm-kpi-card border-emerald">
          <div className="kpi-top">
            <span className="kpi-label">Contas Estratégicas</span>
            <Building2 size={18} className="text-emerald" />
          </div>
          <div className="kpi-value">{executiveMetrics.strategicOrgsCount || 0}</div>
          <div className="kpi-detail">Contas nucleares monitoradas</div>
        </div>

        <div className="crm-kpi-card border-rose">
          <div className="kpi-top">
            <span className="kpi-label">Follow-ups Críticos Hoje</span>
            <Clock size={18} className="text-rose" />
          </div>
          <div className="kpi-value">{alerts.today.length}</div>
          <div className="kpi-detail">
            {alerts.overdue.length > 0 && <span className="text-rose font-bold">{alerts.overdue.length} atrasado(s)</span>}
            {alerts.overdue.length === 0 && 'Nenhuma pendência atrasada'}
          </div>
        </div>

        <div className="crm-kpi-card border-indigo">
          <div className="kpi-top">
            <span className="kpi-label">Volume Potencial em Prospecção</span>
            <TrendingUp size={18} className="text-indigo" />
          </div>
          <div className="kpi-value">R$ {((executiveMetrics.totalPipelinePotentialVolume || 0) / 1000000).toFixed(1)}M</div>
          <div className="kpi-detail">Mapeado no Pipeline Comercial</div>
        </div>

        <div className="crm-kpi-card border-cyan">
          <div className="kpi-top">
            <span className="kpi-label">Reuniões & Contatos</span>
            <UserCheck size={18} className="text-cyan" />
          </div>
          <div className="kpi-value">{executiveMetrics.meetingsCompletedCount || 0}</div>
          <div className="kpi-detail">Reuniões técnicas / Visitas realizadas</div>
        </div>

        <div className="crm-kpi-card border-amber">
          <div className="kpi-top">
            <span className="kpi-label">Sinais Manuais Registrados</span>
            <Flame size={18} className="text-amber" />
          </div>
          <div className="kpi-value">{executiveMetrics.manualSignalsCount || 0}</div>
          <div className="kpi-detail">Demandas antecipadas por contato</div>
        </div>
      </section>

      {/* NAVEGAÇÃO DE SUBSEÇÕES (Item 1) */}
      <nav className="crm-nav">
        <button
          className={`crm-tab-btn ${activeTab === 'organizacoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('organizacoes')}
        >
          <Building2 size={17} />
          <span>Organizações ({organizations.length})</span>
        </button>

        <button
          className={`crm-tab-btn ${activeTab === 'contatos' ? 'active' : ''}`}
          onClick={() => setActiveTab('contatos')}
        >
          <Users size={17} />
          <span>Contatos ({contacts.length})</span>
        </button>

        <button
          className={`crm-tab-btn ${activeTab === 'followups' ? 'active' : ''}`}
          onClick={() => setActiveTab('followups')}
        >
          <Clock size={17} />
          <span>Follow-ups ({followUps.length})</span>
          {alerts.overdue.length > 0 && <span className="tab-badge-alert">{alerts.overdue.length}</span>}
        </button>

        <button
          className={`crm-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          <Kanban size={17} />
          <span>Pipeline Comercial</span>
        </button>

        <button
          className={`crm-tab-btn ${activeTab === 'interacoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('interacoes')}
        >
          <PhoneCall size={17} />
          <span>Interações & Histórico</span>
        </button>

        <button
          className={`crm-tab-btn ${activeTab === 'agenda' ? 'active' : ''}`}
          onClick={() => setActiveTab('agenda')}
        >
          <Calendar size={17} />
          <span>Agenda & Resumo Semanal</span>
        </button>
      </nav>

      {/* BARRA DE FILTROS */}
      <div className="crm-filter-bar">
        <div className="crm-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Pesquisar por órgão, contato, cargo ou serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'organizacoes' && (
          <div className="filter-selects">
            <label>Classificação:</label>
            <select value={selectedClassification} onChange={e => setSelectedClassification(e.target.value)}>
              <option value="ALL">Todas as classificações</option>
              <option value={StrategicClassification.ESTRATEGICO}>Estratégico</option>
              <option value={StrategicClassification.ALTA_PRIORIDADE}>Alta prioridade</option>
              <option value={StrategicClassification.POTENCIAL}>Potencial</option>
            </select>
          </div>
        )}

        {activeTab === 'contatos' && (
          <div className="filter-selects">
            <label>Papel do Contato:</label>
            <select value={selectedRoleFilter} onChange={e => setSelectedRoleFilter(e.target.value)}>
              <option value="ALL">Todos os papéis</option>
              <option value={ContactRole.DECISOR}>Decisor</option>
              <option value={ContactRole.INFLUENCIADOR}>Influenciador</option>
              <option value={ContactRole.TECNICO}>Técnico / Engenharia</option>
              <option value={ContactRole.COMPRAS}>Compras / Suprimentos</option>
              <option value={ContactRole.LICITACOES}>Licitações</option>
            </select>
          </div>
        )}
      </div>

      {/* CONTEÚDO DAS SUBSEÇÕES */}
      <main className="crm-tab-content">
        {/* SUBSEÇÃO 1: ORGANIZAÇÕES */}
        {activeTab === 'organizacoes' && (
          <section className="orgs-grid">
            {filteredOrgs.map(org => (
              <div key={org.id} className="org-card">
                <div className="org-card-top">
                  <div>
                    <div className="org-badges-row">
                      <span className={`badge-classification c-${org.strategicClassification.toLowerCase().replace(/\s+/g, '-')}`}>
                        {org.strategicClassification}
                      </span>
                      <span className="badge-type">{org.type}</span>
                    </div>
                    <h3 className="org-name" onClick={() => setSelectedOrg360Id(org.id)}>
                      {org.name}
                    </h3>
                    <span className="org-cnpj">CNPJ: {org.cnpj} • {org.city}/{org.state}</span>
                  </div>

                  <button
                    className={`btn-favorite ${org.isFavorite ? 'fav' : ''}`}
                    onClick={() => handleToggleFavorite(org.id)}
                    title="Favoritar Organização"
                  >
                    <Star size={18} fill={org.isFavorite ? '#f59e0b' : 'none'} />
                  </button>
                </div>

                <p className="org-desc">{org.description}</p>

                <div className="org-tags-list">
                  {org.tags.map((t, idx) => (
                    <span key={idx} className="org-tag-pill">{t}</span>
                  ))}
                </div>

                <div className="org-score-box">
                  <div className="score-left">
                    <span className="score-label">Relationship Score:</span>
                    <strong className="score-val" style={{ color: org.badgeColor }}>{org.relationshipScore}/100</strong>
                    <span className="score-tier">({org.relationshipTier})</span>
                  </div>
                  <div className="owner-box">
                    <span className="owner-label">Account Owner:</span>
                    <span className="owner-name">{org.accountOwner}</span>
                  </div>
                </div>

                <div className="org-card-footer">
                  <button className="btn-view-360" onClick={() => setSelectedOrg360Id(org.id)}>
                    <Eye size={16} />
                    <span>Ver Visão 360°</span>
                  </button>

                  <button
                    className="btn-new-followup-sm"
                    onClick={() => {
                      setNewFollowUpForm(prev => ({
                        ...prev,
                        organizationId: org.id,
                        title: `Follow-up com ${org.name}`
                      }));
                      setIsNewFollowUpModalOpen(true);
                    }}
                  >
                    <Clock size={15} />
                    <span>Follow-up</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* SUBSEÇÃO 2: CONTATOS */}
        {activeTab === 'contatos' && (
          <section className="contacts-table-container">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Nome do Profissional</th>
                  <th>Organização</th>
                  <th>Cargo / Área</th>
                  <th>Papel Funcional</th>
                  <th>Influência</th>
                  <th>Canais Profissionais</th>
                  <th>Último Contato</th>
                  <th>Responsável Interno</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="contact-name-cell">
                        <strong>{c.name}</strong>
                        <span className="subtext">{c.dataOrigin}</span>
                      </div>
                    </td>
                    <td>
                      <strong className="org-link" onClick={() => setSelectedOrg360Id(c.organizationId)}>
                        {c.organizationName}
                      </strong>
                    </td>
                    <td>
                      <div>{c.position}</div>
                      <span className="subtext">{c.department}</span>
                    </td>
                    <td>
                      <span className={`role-badge role-${c.role.toLowerCase()}`}>{c.role}</span>
                    </td>
                    <td>
                      <span className={`influence-tag inf-${c.influenceLevel.toLowerCase()}`}>{c.influenceLevel}</span>
                    </td>
                    <td>
                      <div className="contact-channels">
                        <a href={`mailto:${c.email}`} className="channel-link" title={c.email}><Mail size={14} /></a>
                        {c.phone && <a href={`tel:${c.phone}`} className="channel-link" title={c.phone}><Phone size={14} /></a>}
                        {c.linkedIn && <a href={c.linkedIn} target="_blank" rel="noreferrer" className="channel-link"><ExternalLink size={14} /></a>}
                      </div>
                    </td>
                    <td>
                      <div>{c.lastContactDate ? new Date(c.lastContactDate).toLocaleDateString('pt-BR') : '—'}</div>
                      <span className="subtext">Próximo: {c.nextContactDate || 'A definir'}</span>
                    </td>
                    <td>
                      <span className="subtext font-medium">{c.internalResponsible}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* SUBSEÇÃO 3: FOLLOW-UPS E ALERTAS (Itens 16, 17, 18) */}
        {activeTab === 'followups' && (
          <section className="followups-layout">
            <div className="alerts-callout-grid">
              <div className="alert-box overdue">
                <AlertTriangle size={18} />
                <div>
                  <strong>{alerts.overdue.length} Atrasado(s)</strong>
                  <span>Demandam atenção imediata</span>
                </div>
              </div>

              <div className="alert-box today">
                <Clock size={18} />
                <div>
                  <strong>{alerts.today.length} Para Hoje</strong>
                  <span>Agendados para 08/10/2026</span>
                </div>
              </div>

              <div className="alert-box tomorrow">
                <Calendar size={18} />
                <div>
                  <strong>{alerts.tomorrow.length} Para Amanhã</strong>
                  <span>Planejados para 09/10/2026</span>
                </div>
              </div>

              <div className="alert-box next-days">
                <Calendar size={18} />
                <div>
                  <strong>{alerts.next7Days.length} Próximos 7 Dias</strong>
                  <span>Atividades da semana</span>
                </div>
              </div>
            </div>

            <div className="followups-list">
              {followUps.map(f => (
                <div key={f.id} className={`followup-card status-${f.status.toLowerCase()}`}>
                  <div className="followup-left">
                    <div className="status-indicator-dot" />
                    <div>
                      <div className="followup-meta">
                        <span className={`priority-badge p-${f.priority.toLowerCase()}`}>{f.priority}</span>
                        <span className="followup-date">{new Date(f.date).toLocaleDateString('pt-BR')} às {f.time}</span>
                        <span className={`status-pill st-${f.status.toLowerCase()}`}>{f.status}</span>
                      </div>
                      <h4 className="followup-title">{f.title}</h4>
                      <p className="followup-reason">{f.reason}</p>
                      <div className="followup-org-contact">
                        <strong>{f.organizationName}</strong> • Contato: {f.contactName} • Resp: {f.responsible}
                      </div>
                    </div>
                  </div>

                  <div className="followup-actions">
                    {f.status !== FollowUpStatus.CONCLUIDO && (
                      <button className="btn-complete" onClick={() => handleCompleteFollowUp(f.id)}>
                        <CheckCircle2 size={16} />
                        <span>Concluir</span>
                      </button>
                    )}
                    {f.status === FollowUpStatus.CONCLUIDO && (
                      <span className="completed-label"><CheckCircle2 size={16} /> Concluído</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 4: PIPELINE COMERCIAL (KANBAN EM 10 ETAPAS) */}
        {activeTab === 'pipeline' && (
          <section className="pipeline-kanban-container">
            <div className="kanban-scrollable">
              {Object.values(PipelineStage).map(stage => {
                const stageCards = pipelineCards.filter(c => c.stage === stage);
                return (
                  <div key={stage} className="kanban-col">
                    <div className="kanban-col-header">
                      <span className="stage-name">{stage}</span>
                      <span className="stage-count">{stageCards.length}</span>
                    </div>

                    <div className="kanban-cards">
                      {stageCards.map(c => (
                        <div key={c.id} className="kanban-card">
                          <h4 className="card-org">{c.organizationName}</h4>
                          <span className="card-service">{c.service}</span>

                          <div className="card-val-row">
                            <span className="card-val">R$ {Number(c.potentialValue).toLocaleString('pt-BR')}</span>
                            <span className="card-score">Score: {c.potentialScore}</span>
                          </div>

                          <div className="card-next-action">
                            <strong>Próxima Ação:</strong>
                            <p>{c.nextAction}</p>
                            <span className="action-date">Data: {new Date(c.nextActionDate).toLocaleDateString('pt-BR')}</span>
                          </div>

                          {c.linkedOpportunityId && (
                            <div className="linked-tender-badge">
                              <CheckCircle2 size={13} />
                              <span>Licitação Vinculada: #{c.linkedOpportunityId}</span>
                            </div>
                          )}

                          <div className="card-footer">
                            <span className="card-resp">{c.responsible.split(' ')[0]}</span>
                            <span className="card-source">{c.leadSource}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 5: INTERAÇÕES & TIMELINE */}
        {activeTab === 'interacoes' && (
          <section className="interactions-container">
            <div className="interactions-timeline">
              {interactions.map(item => (
                <div key={item.id} className="interaction-timeline-item">
                  <div className="interaction-icon-box">
                    {item.type === InteractionType.REUNIAO && <UserCheck size={18} className="text-emerald" />}
                    {item.type === InteractionType.EMAIL && <Mail size={18} className="text-cyan" />}
                    {item.type === InteractionType.LIGACAO && <PhoneCall size={18} className="text-amber" />}
                    {item.type === InteractionType.WHATSAPP && <MessageSquare size={18} className="text-emerald" />}
                    {item.type === InteractionType.VISITA && <Building2 size={18} className="text-indigo" />}
                    {item.type === InteractionType.VIDEOCONFERENCIA && <UserCheck size={18} className="text-cyan" />}
                    {item.type === InteractionType.EVENTO && <Sparkles size={18} className="text-amber" />}
                  </div>

                  <div className="interaction-content-box">
                    <div className="interaction-top">
                      <div>
                        <span className="interaction-type-badge">{item.type}</span>
                        <h4 className="interaction-subject">{item.subject}</h4>
                      </div>
                      <span className="interaction-datetime">
                        {new Date(item.date).toLocaleDateString('pt-BR')} às {item.time}
                      </span>
                    </div>

                    <div className="interaction-parties">
                      <strong>{item.organizationName}</strong> • Contato: {item.contactName} • Resp. Vellia: {item.internalResponsible}
                    </div>

                    <p className="interaction-summary">{item.summary}</p>

                    <div className="interaction-outcomes">
                      <div className="outcome-col">
                        <strong>Resultado Observado:</strong>
                        <p>{item.result}</p>
                      </div>
                      <div className="outcome-col">
                        <strong>Próximo Passo / Follow-up:</strong>
                        <p>{item.nextStep}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SUBSEÇÃO 6: AGENDA COMERCIAL & RESUMO SEMANAL */}
        {activeTab === 'agenda' && weeklySummary && (
          <section className="agenda-weekly-container">
            <div className="weekly-summary-banner">
              <div className="summary-banner-top">
                <Sparkles size={20} className="text-cyan" />
                <div>
                  <h3>Resumo Comercial Semanal (Item 46)</h3>
                  <span>Período: {weeklySummary.period}</span>
                </div>
              </div>

              <div className="weekly-stats-row">
                <div className="stat-pill">
                  <strong>{weeklySummary.interactionsThisWeek}</strong>
                  <span>Interações na Semana</span>
                </div>
                <div className="stat-pill">
                  <strong>{weeklySummary.meetingsConducted}</strong>
                  <span>Reuniões Realizadas</span>
                </div>
                <div className="stat-pill">
                  <strong>{weeklySummary.completedFollowUps}</strong>
                  <span>Follow-ups Concluídos</span>
                </div>
                <div className="stat-pill text-rose">
                  <strong>{weeklySummary.pendingCriticalFollowUps}</strong>
                  <span>Ações Críticas / Urgentes</span>
                </div>
              </div>

              <div className="priority-orgs-box">
                <h4>Organizações com Ação Prioritária Recomendada:</h4>
                <div className="priority-orgs-grid">
                  {weeklySummary.priorityOrganizations.map((p, idx) => (
                    <div key={idx} className="priority-org-card">
                      <strong>{p.name}</strong>
                      <p>{p.reason}</p>
                      <span className="owner-tag">Owner: {p.owner}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SINAIS MANUAIS REGISTRADOS */}
            <div className="manual-signals-section">
              <div className="section-title-row">
                <Flame size={20} className="text-amber" />
                <h3>Demandas Identificadas & Sinais Comerciais Manuais (Itens 56, 57 e 58)</h3>
              </div>

              <div className="manual-signals-grid">
                {manualSignals.map(s => (
                  <div key={s.id} className="manual-signal-card">
                    <div className="signal-top">
                      <span className="signal-nature-badge">{s.nature}</span>
                      <span className={`signal-temp-badge temp-${s.temperature.toLowerCase()}`}>{s.temperature}</span>
                    </div>

                    <h4 className="signal-title">{s.title}</h4>
                    <span className="signal-org">{s.organizationName} • {s.service}</span>

                    <div className="signal-val-horizon">
                      <div>
                        <span className="subtext">Valor Potencial Estimado:</span>
                        <strong>R$ {Number(s.estimatedValue).toLocaleString('pt-BR')}</strong>
                      </div>
                      <div>
                        <span className="subtext">Horizonte Previsto:</span>
                        <strong>{s.expectedHorizon}</strong>
                      </div>
                    </div>

                    <p className="signal-notes">{s.notes}</p>
                    <div className="signal-footer">Registrado por: {s.registeredBy}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL: VISÃO 360° DA ORGANIZAÇÃO (ORGANIZATION 360 - Item 5 e 39) */}
      {selectedOrg360Id && org360Data && (
        <div className="modal-backdrop" onClick={() => setSelectedOrg360Id(null)}>
          <div className="crm-modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Visão 360° da Organização (Organization 360)</h2>
                <p>Radiografia institucional, mapa de relacionamento e inteligência pré-edital consolidada.</p>
              </div>
              <button className="btn-close" onClick={() => setSelectedOrg360Id(null)}>✕</button>
            </div>

            <div className="org360-body">
              {/* BANNER PRINCIPAL 360 — FICHA ESTRATÉGICA (FASE 25: ITENS 57-60) */}
              <div className="org360-top-banner">
                <div style={{ flex: 1 }}>
                  <div className="badges-row" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge-classification">{org360Data.organization.strategicClassification}</span>
                    <span className="badge-type">{org360Data.organization.type}</span>
                    <span style={{ fontSize: '11px', background: 'rgba(255, 255, 255, 0.08)', padding: '2px 8px', borderRadius: '4px', color: '#CBD5E1' }}>
                      {org360Data.organization.city}/{org360Data.organization.state}
                    </span>
                  </div>
                  <h3 className="org360-title" style={{ margin: '4px 0 6px 0', fontSize: '1.25rem', color: '#F8FAFC' }}>
                    {org360Data.organization.name}
                  </h3>
                  <div style={{ fontSize: '12.5px', color: '#94A3B8', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>CNPJ: <strong>{org360Data.organization.cnpj}</strong></span>
                    <span>Segmento: <strong>{org360Data.organization.type}</strong></span>
                    <span>Responsável: <strong style={{ color: '#38BDF8' }}>{org360Data.organization.accountOwner || 'Carlos Silveira'}</strong></span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    className="btn-quick-action highlight"
                    onClick={() => {
                      setNewInteractionForm(prev => ({
                        ...prev,
                        organizationId: org360Data.organization.id,
                        subject: `Contato com ${org360Data.organization.name}`
                      }));
                      setIsNewInteractionModalOpen(true);
                    }}
                    style={{
                      background: 'var(--color-brand-primary, #0284C7)',
                      color: '#FFF',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    <PhoneCall size={15} />
                    <span>Registrar contato</span>
                  </button>
                </div>

                <div className="org360-metrics-pills">
                  <div className="pill">
                    <span className="label">Força do Relacionamento:</span>
                    <strong className="val text-emerald">{org360Data.relationshipStrength.strength}/100</strong>
                    <span className="subval">{org360Data.relationshipStrength.label}</span>
                  </div>
                  <div className="pill">
                    <span className="label">Win Rate Histórico:</span>
                    <strong className="val text-cyan">{org360Data.winRate}%</strong>
                  </div>
                  <div className="pill">
                    <span className="label">Volume Contratual:</span>
                    <strong className="val">R$ {(org360Data.historicalVolume / 1000000).toFixed(1)}M</strong>
                  </div>
                </div>
              </div>

              {/* NEXT BEST ACTION RECOMENDADA (Item 41) */}
              <div className="next-best-action-card">
                <Sparkles size={20} className="nba-icon" />
                <div>
                  <strong>Próxima Melhor Ação Recomendada (Next Best Action):</strong>
                  <p>{org360Data.nextBestAction}</p>
                </div>
              </div>

              {/* MAPA DE RELACIONAMENTO (Item 12: Decisores, Influenciadores, Técnicos, Compras) */}
              <div className="relationship-map-section">
                <h4>Mapa de Relacionamento e Decisores (Item 12):</h4>
                <div className="map-columns-grid">
                  <div className="map-col">
                    <span className="map-col-title">Decisores / Diretoria</span>
                    {org360Data.relationshipMap.decisores.map(c => (
                      <div key={c.id} className="map-contact-chip">
                        <strong>{c.name}</strong>
                        <span>{c.position}</span>
                        <div className="chip-actions">
                          <a href={`mailto:${c.email}`}><Mail size={12} /></a>
                          {c.phone && <a href={`tel:${c.phone}`}><Phone size={12} /></a>}
                        </div>
                      </div>
                    ))}
                    {org360Data.relationshipMap.decisores.length === 0 && <span className="empty-chip">Nenhum mapeado</span>}
                  </div>

                  <div className="map-col">
                    <span className="map-col-title">Influenciadores</span>
                    {org360Data.relationshipMap.influenciadores.map(c => (
                      <div key={c.id} className="map-contact-chip">
                        <strong>{c.name}</strong>
                        <span>{c.position}</span>
                        <div className="chip-actions">
                          <a href={`mailto:${c.email}`}><Mail size={12} /></a>
                          {c.phone && <a href={`tel:${c.phone}`}><Phone size={12} /></a>}
                        </div>
                      </div>
                    ))}
                    {org360Data.relationshipMap.influenciadores.length === 0 && <span className="empty-chip">Nenhum mapeado</span>}
                  </div>

                  <div className="map-col">
                    <span className="map-col-title">Técnico / Engenharia</span>
                    {org360Data.relationshipMap.tecnicos.map(c => (
                      <div key={c.id} className="map-contact-chip">
                        <strong>{c.name}</strong>
                        <span>{c.position}</span>
                        <div className="chip-actions">
                          <a href={`mailto:${c.email}`}><Mail size={12} /></a>
                          {c.phone && <a href={`tel:${c.phone}`}><Phone size={12} /></a>}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="map-col">
                    <span className="map-col-title">Compras / Licitações</span>
                    {[...org360Data.relationshipMap.compras, ...org360Data.relationshipMap.licitacoes].map(c => (
                      <div key={c.id} className="map-contact-chip">
                        <strong>{c.name}</strong>
                        <span>{c.position}</span>
                        <div className="chip-actions">
                          <a href={`mailto:${c.email}`}><Mail size={12} /></a>
                          {c.phone && <a href={`tel:${c.phone}`}><Phone size={12} /></a>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SINAIS DO RADAR ANTECIPADO E CONTRATOS A VENCER (Item 6 e 40) */}
              <div className="org360-two-cols">
                <div className="sub-box">
                  <h4>Contratos Vigentes Monitorados a Vencer (Fase 16):</h4>
                  {org360Data.earlyRadar.expiringContracts.length > 0 ? (
                    org360Data.earlyRadar.expiringContracts.map(c => (
                      <div key={c.id} className="mini-item">
                        <div>
                          <strong>{c.relatedService}</strong>
                          <span className="subtext">Incumbente: {c.currentSupplier} • Vence em {c.estimatedDaysRemaining} dias</span>
                        </div>
                        <span className="text-amber font-bold">R$ {Number(c.initialValue).toLocaleString('pt-BR')}</span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">Nenhum contrato ativo próximo ao término.</p>
                  )}
                </div>

                <div className="sub-box">
                  <h4>Planejamentos (PCA) Identificados:</h4>
                  {org360Data.earlyRadar.pcas.length > 0 ? (
                    org360Data.earlyRadar.pcas.map(p => (
                      <div key={p.id} className="mini-item">
                        <div>
                          <strong>{p.plannedObject}</strong>
                          <span className="subtext">Previsão: {p.predictedDate || '2026/2027'}</span>
                        </div>
                        <span className="text-cyan font-bold">R$ {Number(p.estimatedValue).toLocaleString('pt-BR')}</span>
                      </div>
                    ))
                  ) : (
                    <p className="empty-text">Sem planejamentos cadastrados no momento.</p>
                  )}
                </div>
              </div>

              {/* TIMELINE DE INTERAÇÕES RECENTES */}
              <div className="sub-box mt-4">
                <h4>Histórico de Interações Recentes:</h4>
                <div className="mini-timeline">
                  {org360Data.interactions.slice(0, 4).map(i => (
                    <div key={i.id} className="mini-timeline-item">
                      <span className="date">{new Date(i.date).toLocaleDateString('pt-BR')}</span>
                      <strong>{i.type}: {i.subject}</strong>
                      <p>{i.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setSelectedOrg360Id(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR FOLLOW-UP */}
      {isNewFollowUpModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewFollowUpModalOpen(false)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Follow-up Comercial</h2>
              <button className="btn-close" onClick={() => setIsNewFollowUpModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="crm-form">
              <div className="form-group">
                <label>Organização Alvo:</label>
                <select
                  value={newFollowUpForm.organizationId}
                  onChange={e => setNewFollowUpForm({ ...newFollowUpForm, organizationId: e.target.value })}
                  required
                >
                  <option value="">Selecione a organização...</option>
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Título da Ação:</label>
                <input
                  type="text"
                  placeholder="Ex: Checar envio de certidões e modelo de edital"
                  value={newFollowUpForm.title}
                  onChange={e => setNewFollowUpForm({ ...newFollowUpForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data Agendada:</label>
                  <input
                    type="date"
                    value={newFollowUpForm.date}
                    onChange={e => setNewFollowUpForm({ ...newFollowUpForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Horário:</label>
                  <input
                    type="time"
                    value={newFollowUpForm.time}
                    onChange={e => setNewFollowUpForm({ ...newFollowUpForm, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Motivo / Objetivo Estratégico:</label>
                <textarea
                  rows="3"
                  placeholder="Descreva o objetivo do contato preventivo..."
                  value={newFollowUpForm.reason}
                  onChange={e => setNewFollowUpForm({ ...newFollowUpForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsNewFollowUpModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Registrar Follow-up</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR INTERAÇÃO */}
      {isNewInteractionModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewInteractionModalOpen(false)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Nova Interação Comercial</h2>
              <button className="btn-close" onClick={() => setIsNewInteractionModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveInteraction} className="crm-form">
              <div className="form-group">
                <label>Organização:</label>
                <select
                  value={newInteractionForm.organizationId}
                  onChange={e => setNewInteractionForm({ ...newInteractionForm, organizationId: e.target.value })}
                  required
                >
                  <option value="">Selecione a organização...</option>
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              {/* CONTEXTO ANTES DA AÇÃO (FASE 26: ITEM 12) */}
              {newInteractionForm.organizationId && (() => {
                const selectedOrg = organizations.find(o => o.id === newInteractionForm.organizationId);
                const lastInter = interactions.filter(i => i.organizationId === newInteractionForm.organizationId)[0];
                return (
                  <div style={{
                    background: 'rgba(2, 132, 199, 0.08)',
                    border: '1px solid rgba(2, 132, 199, 0.25)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    marginBottom: '12px',
                    fontSize: '11.5px'
                  }}>
                    <strong style={{ color: '#38BDF8', display: 'block', marginBottom: '4px' }}>
                      Contexto Prévio da Conta:
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: '#CBD5E1' }}>
                      <div>Último Contato: <strong style={{ color: '#F8FAFC' }}>{lastInter ? `${new Date(lastInter.date).toLocaleDateString('pt-BR')} (${lastInter.type})` : 'Sem histórico'}</strong></div>
                      <div>Próxima Ação: <strong style={{ color: '#F8FAFC' }}>{selectedOrg?.nextBestAction || 'Apresentação Técnica'}</strong></div>
                      <div>Oportunidade: <strong style={{ color: '#F8FAFC' }}>Edital Bacia de Santos</strong></div>
                      <div>Responsável: <strong style={{ color: '#F8FAFC' }}>{selectedOrg?.accountOwner || 'Carlos Silveira'}</strong></div>
                    </div>
                  </div>
                );
              })()}

              <div className="form-row">
                <div className="form-group">
                  <label>Canal da Interação:</label>
                  <select
                    value={newInteractionForm.type}
                    onChange={e => setNewInteractionForm({ ...newInteractionForm, type: e.target.value })}
                  >
                    {Object.values(InteractionType).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Contato no Órgão:</label>
                  <input
                    type="text"
                    placeholder="Nome do profissional"
                    value={newInteractionForm.contactName}
                    onChange={e => setNewInteractionForm({ ...newInteractionForm, contactName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Assunto / Pauta:</label>
                <input
                  type="text"
                  placeholder="Ex: Reunião técnica sobre O&M de ETE"
                  value={newInteractionForm.subject}
                  onChange={e => setNewInteractionForm({ ...newInteractionForm, subject: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Resumo dos Fatos Tratados:</label>
                <textarea
                  rows="3"
                  placeholder="O que foi discutido e apresentado..."
                  value={newInteractionForm.summary}
                  onChange={e => setNewInteractionForm({ ...newInteractionForm, summary: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Próximo Passo / Ação:</label>
                <input
                  type="text"
                  placeholder="Ex: Enviar portfólio de CATs até próxima terça"
                  value={newInteractionForm.nextStep}
                  onChange={e => setNewInteractionForm({ ...newInteractionForm, nextStep: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsNewInteractionModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Salvar no Histórico</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR SINAL MANUAL (Itens 56, 57, 58) */}
      {isNewSignalModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewSignalModalOpen(false)}>
          <div className="crm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registrar Demanda / Sinal Manual</h2>
              <button className="btn-close" onClick={() => setIsNewSignalModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveSignal} className="crm-form">
              <div className="signal-caution-notice">
                <ShieldCheck size={18} />
                <span>
                  <strong>Atenção Metodológica:</strong> Esta demanda será rotulada como
                  <em> "Informação comercial registrada manualmente"</em> e não será tratada como edital oficial publicado.
                </span>
              </div>

              <div className="form-group">
                <label>Organização:</label>
                <select
                  value={newSignalForm.organizationId}
                  onChange={e => setNewSignalForm({ ...newSignalForm, organizationId: e.target.value })}
                  required
                >
                  <option value="">Selecione a organização...</option>
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Título da Demanda Antecipada:</label>
                <input
                  type="text"
                  placeholder="Ex: Contratação de adequação de decantador da ETE"
                  value={newSignalForm.title}
                  onChange={e => setNewSignalForm({ ...newSignalForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor Estimado (R$):</label>
                  <input
                    type="number"
                    value={newSignalForm.estimatedValue}
                    onChange={e => setNewSignalForm({ ...newSignalForm, estimatedValue: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Horizonte Previsto:</label>
                  <input
                    type="text"
                    placeholder="Ex: 1º Trimestre de 2027"
                    value={newSignalForm.expectedHorizon}
                    onChange={e => setNewSignalForm({ ...newSignalForm, expectedHorizon: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Temperatura do Lead (Item 59):</label>
                <select
                  value={newSignalForm.temperature}
                  onChange={e => setNewSignalForm({ ...newSignalForm, temperature: e.target.value })}
                >
                  <option value={RelationshipTemperature.QUENTE}>Quente (Contato direto confirmou processo)</option>
                  <option value={RelationshipTemperature.MORNO}>Morno (Sondagem preliminar / Pesquisa mercadológica)</option>
                  <option value={RelationshipTemperature.FRIO}>Frio (Comentário informal)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Observações Comerciais:</label>
                <textarea
                  rows="3"
                  placeholder="Contexto da conversa, origem da informação..."
                  value={newSignalForm.notes}
                  onChange={e => setNewSignalForm({ ...newSignalForm, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsNewSignalModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save highlight">Registrar Sinal Manual</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
