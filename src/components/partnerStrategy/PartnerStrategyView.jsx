import React, { useState, useEffect } from 'react';
import {
  Users,
  Handshake,
  ShieldCheck,
  AlertTriangle,
  Scale,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Eye,
  Send,
  Building,
  HelpCircle,
  RefreshCw,
  FileCheck,
  Lock,
  UserCheck,
  AlertOctagon,
  Download,
  Share2
} from 'lucide-react';

import { partnerStrategyService } from '../../services/partnerStrategy/partnerStrategyService.js';
import {
  ParticipationType,
  ParticipationStructureStatus,
  EditalRuleStatus,
  GapCategory,
  PartnerRole,
  CommercialStructureType,
  CommercialTermsStatus,
  PartnerConfirmationStatus,
  PartnerCommitmentStatus,
  CommitmentEvidenceType,
  GovernanceComplexity,
  ExclusivityType
} from '../../services/partnerStrategy/partnerStrategyModels.js';

import './PartnerStrategyView.css';

export default function PartnerStrategyView({
  currentUser = { 
    name: 'Diretoria Executiva', 
    role: 'ADMIN', 
    permissions: ['partners.strategy.view', 'partners.strategy.manage', 'consortium.view', 'consortium.manage', 'partners.financial.view'], 
    companyScope: 'ALL' 
  },
  onNavigateToTab
}) {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('7004321234');
  const [currentStructure, setCurrentStructure] = useState(null);
  const [activeArea, setActiveArea] = useState('structure'); // structure | gaps | partners | tradeoffs
  const [partnersMatches, setPartnersMatches] = useState([]);
  const [scenarios, setScenarios] = useState(null);
  const [networkGaps, setNetworkGaps] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modais
  const [commitmentModal, setCommitmentModal] = useState({ open: false, partner: null, status: PartnerCommitmentStatus.CONFIRMED, evidenceType: CommitmentEvidenceType.DECLARATION, evidenceDocRef: '', notes: '' });
  const [withdrawalModal, setWithdrawalModal] = useState({ open: false, partner: null, reason: '' });
  const [commercialModal, setCommercialModal] = useState({ open: false, terms: null, confirmed: false });
  const [scopeModal, setScopeModal] = useState({ open: false, data: null });
  const [reportModal, setReportModal] = useState({ open: false, type: 'EXECUTIVE', content: null });
  const [versionModal, setVersionModal] = useState({ open: false, type: ParticipationType.CONSORTIUM, notes: '' });

  const hasFinancialAccess = (currentUser.permissions || []).includes('partners.financial.view');

  const loadData = () => {
    const struct = partnerStrategyService.getStructureByOpportunity(selectedOpportunityId);
    setCurrentStructure(struct);

    if (struct) {
      setPartnersMatches(partnerStrategyService.matchPartners(struct.partnerRequirementProfile));
      setScenarios(partnerStrategyService.compareScenarios(selectedOpportunityId));
    } else {
      setPartnersMatches([]);
      setScenarios(null);
    }
    setNetworkGaps(partnerStrategyService.getNetworkGaps());
  };

  useEffect(() => {
    loadData();
  }, [selectedOpportunityId]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 7, 8 e 9. Criar ou Salvar Nova Versão da Estrutura
  const handleSaveNewVersion = () => {
    if (!currentStructure) return;
    try {
      const updated = partnerStrategyService.saveStructure({
        ...currentStructure,
        type: versionModal.type,
        status: ParticipationStructureStatus.UNDER_REVIEW,
        decisionNotes: versionModal.notes
      }, currentUser.name);

      showNotification(`Nova versão v${updated.version} criada com sucesso! Versão anterior arquivada.`);
      setVersionModal({ open: false, type: ParticipationType.CONSORTIUM, notes: '' });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 109 a 114. Confirmar Compromisso com Evidência
  const handleConfirmCommitment = () => {
    if (!commitmentModal.partner) return;
    try {
      partnerStrategyService.registerPartnerCommitment(currentStructure.id, commitmentModal.partner.partner.id, {
        partnerName: commitmentModal.partner.partner.companyName,
        status: commitmentModal.status,
        evidenceType: commitmentModal.evidenceType,
        evidenceDocRef: commitmentModal.evidenceDocRef,
        notes: commitmentModal.notes
      }, currentUser.name);

      showNotification(`Compromisso formal registrado com evidência auditável!`);
      setCommitmentModal({ open: false, partner: null, status: PartnerCommitmentStatus.CONFIRMED, evidenceType: CommitmentEvidenceType.DECLARATION, evidenceDocRef: '', notes: '' });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 115 a 117. Notificar Desistência / Retirada do Parceiro
  const handleConfirmWithdrawal = () => {
    if (!withdrawalModal.partner) return;
    try {
      const res = partnerStrategyService.handlePartnerWithdrawal(
        currentStructure.id,
        withdrawalModal.partner.partnerId,
        withdrawalModal.reason,
        currentUser.name
      );

      showNotification(`Alerta de desistência processado! Prontidão recalculada para ${res.recalculatedReadiness}%.`, 'error');
      setWithdrawalModal({ open: false, partner: null, reason: '' });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 54 a 57. Atualizar Termos Comerciais
  const handleSaveCommercialTerms = () => {
    if (!commercialModal.terms) return;
    try {
      partnerStrategyService.updateCommercialTerms(
        currentStructure.id,
        commercialModal.terms,
        currentUser.name,
        commercialModal.confirmed
      );

      showNotification(`Termos comerciais atualizados sob supervisão de governança.`);
      setCommercialModal({ open: false, terms: null, confirmed: false });
      loadData();
    } catch (e) {
      alert(e.message);
    }
  };

  // 93 a 95. Gerar Pacote Seguro de Escopo Mínimo
  const handleOpenScopeSharing = (partnerId) => {
    const pkg = partnerStrategyService.prepareScopeSharingPackage(selectedOpportunityId, partnerId, currentUser.name);
    setScopeModal({ open: true, data: pkg });
  };

  // 161 a 165. Gerar Relatório
  const handleOpenReport = (type) => {
    const rep = partnerStrategyService.generatePartnerStrategyReport(selectedOpportunityId, hasFinancialAccess, type);
    setReportModal({ open: true, type, content: rep });
  };

  const opportunitiesList = [
    { id: '7004321234', title: 'Petrobras RNEST — Monitoramento de Emissões (>40m)' },
    { id: '7004319802', title: 'Transpetro Suape — Operação de ETE & Efluentes' },
    { id: 'OPP-CAAPORA-PB', title: 'Polo Caaporã PB — Emissões e Ruído Industrial' },
    { id: 'OPP-SUDEMA-AMBIGUOUS', title: 'SUDEMA PB — Inventário Estadual de GEE (Regra Ambígua)' }
  ];

  return (
    <div className="partner-strategy-container">
      {/* Toast de Notificação */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header Executivo */}
      <div className="partner-header">
        <div className="partner-header-top">
          <div className="partner-title-group">
            <h1>
              <Handshake className="text-primary" size={26} />
              VELLIA ESTRATÉGIA DE PARCERIA & CONSÓRCIO
              <span className="partner-badge-live">Fase 62 • Partner Intelligence</span>
            </h1>
            <p>
              Análise estratégica e estruturada de participação conjunta (Solo vs. Apoio de Parceiro vs. Subcontratação vs. Consórcio) cruzando regras do edital, gaps operacionais, riscos de dependência e governança.
            </p>
          </div>

          <div className="partner-header-actions">
            {/* Seletor de Oportunidade */}
            <select
              className="opp-select-dropdown"
              value={selectedOpportunityId}
              onChange={(e) => setSelectedOpportunityId(e.target.value)}
            >
              {opportunitiesList.map(o => (
                <option key={o.id} value={o.id}>{o.title}</option>
              ))}
            </select>

            <button className="btn-header-action" onClick={() => setVersionModal({ open: true, type: currentStructure?.type || ParticipationType.CONSORTIUM, notes: '' })}>
              <Layers size={14} /> Nova Versão
            </button>
            <button className="btn-header-action" onClick={() => handleOpenReport('EXECUTIVE')}>
              <Download size={14} /> Relatório Executivo
            </button>
          </div>
        </div>

        {/* Alerta de Retirada de Parceiro se houver */}
        {currentStructure?.withdrawalAlert && (
          <div className="withdrawal-alert-banner mt-3">
            <AlertOctagon size={24} className="flex-shrink-0 text-danger" />
            <div>
              <strong>ALERTA CRÍTICO DE GOVERNANÇA:</strong> Parceiro desistente detectado nesta estrutura. Prontidão operacional reduzida de {currentStructure.withdrawalAlert.previousReadinessPct}% para {currentStructure.withdrawalAlert.newReadinessPct}%. 
              <span className="block mt-1">Motivo: {currentStructure.withdrawalAlert.reason}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navegação das 4 Áreas da Entrega */}
      <div className="partner-nav-tabs">
        <button
          className={`partner-tab-btn ${activeArea === 'structure' ? 'active' : ''}`}
          onClick={() => setActiveArea('structure')}
        >
          <Scale size={16} /> 1. STRUCTURE
          <span className="partner-tab-badge">{currentStructure?.type || 'Em Avaliação'} • v{currentStructure?.version || 1}</span>
        </button>

        <button
          className={`partner-tab-btn ${activeArea === 'gaps' ? 'active' : ''}`}
          onClick={() => setActiveArea('gaps')}
        >
          <AlertTriangle size={16} /> 2. GAPS & PERFIL
          <span className="partner-tab-badge">{currentStructure?.gaps?.length || 0} Gaps Mapeados</span>
        </button>

        <button
          className={`partner-tab-btn ${activeArea === 'partners' ? 'active' : ''}`}
          onClick={() => setActiveArea('partners')}
        >
          <Users size={16} /> 3. PARTNERS COMPATÍVEIS
          <span className="partner-tab-badge">{partnersMatches.length} Shortlist</span>
        </button>

        <button
          className={`partner-tab-btn ${activeArea === 'tradeoffs' ? 'active' : ''}`}
          onClick={() => setActiveArea('tradeoffs')}
        >
          <DollarSign size={16} /> 4. TRADE-OFFS & CENÁRIOS
          <span className="partner-tab-badge">Preço, Risco & Margem</span>
        </button>
      </div>

      {/* ÁREA 1: STRUCTURE (Estrutura, Regras do Edital & Governança) */}
      {activeArea === 'structure' && currentStructure && (
        <div className="partner-section-wrapper">
          <div className="section-hero-card-ps">
            <div>
              <h2>
                <Scale className="text-cyan-400" size={20} />
                Estrutura de Participação & Verificação de Regras do Edital
              </h2>
              <p>
                Classificação da modelagem de participação respaldada por evidências documentais extraídas do edital (página e cláusula).
              </p>
            </div>
            <div className="flex-row items-center gap-2">
              <span className={`rule-badge ${currentStructure.status.toLowerCase()}`}>
                Status: {currentStructure.status}
              </span>
              <span className="tag-company veeluen">
                Versão {currentStructure.version} ({new Date(currentStructure.createdAt).toLocaleDateString('pt-BR')})
              </span>
            </div>
          </div>

          <div className="partner-cards-grid">
            {/* Regra de Consórcio */}
            <div className="partner-card-ps">
              <div className="partner-card-top-ps">
                <h3 className="m-0 font-md">Regra de Consórcio no Edital</h3>
                <span className={`rule-badge ${currentStructure.editalRules?.consortium?.status.toLowerCase()}`}>
                  {currentStructure.editalRules?.consortium?.status}
                </span>
              </div>
              <div className="font-sm text-slate-200">
                {currentStructure.editalRules?.consortium?.details}
              </div>
              <div className="evidence-tag-box-ps">
                <strong>Evidência Documental:</strong> {currentStructure.editalRules?.consortium?.evidenceDoc} • Página {currentStructure.editalRules?.consortium?.page} • {currentStructure.editalRules?.consortium?.clause}
              </div>

              {/* Alerta de Ambiguidade Jurídica */}
              {currentStructure.editalRules?.consortium?.status === EditalRuleStatus.UNCLEAR && (
                <div className="legal-alert-box-ps">
                  <AlertOctagon size={20} className="flex-shrink-0 text-purple-400" />
                  <div>
                    <strong>{currentStructure.editalRules?.consortium?.alertLegalReview}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Regra de Subcontratação */}
            <div className="partner-card-ps">
              <div className="partner-card-top-ps">
                <h3 className="m-0 font-md">Regra de Subcontratação</h3>
                <span className={`rule-badge ${currentStructure.editalRules?.subcontracting?.status.toLowerCase()}`}>
                  {currentStructure.editalRules?.subcontracting?.status}
                </span>
              </div>
              <div className="font-sm text-slate-200">
                {currentStructure.editalRules?.subcontracting?.details}
              </div>
              <div className="evidence-tag-box-ps">
                <strong>Evidência Documental:</strong> {currentStructure.editalRules?.subcontracting?.evidenceDoc} • Página {currentStructure.editalRules?.subcontracting?.page} • {currentStructure.editalRules?.subcontracting?.clause}
              </div>
            </div>

            {/* Governança e Decisão da Estrutura */}
            <div className="partner-card-ps">
              <div className="partner-card-top-ps">
                <h3 className="m-0 font-md">Modelagem Atual Adotada</h3>
                <span className="tag-type">{currentStructure.type}</span>
              </div>
              <div className="font-xs text-muted">
                Responsável pelo Estudo: <strong>{currentStructure.createdBy}</strong>
              </div>
              <div className="p-2 bg-slate-800/50 rounded font-xs text-slate-300">
                Complexidade de Governança: <strong className="text-cyan-300">{currentStructure.governanceComplexity}</strong>
              </div>
              <div className="flex-row gap-2 mt-2">
                <button
                  className="btn-growth-action primary"
                  onClick={() => setVersionModal({ open: true, type: currentStructure.type, notes: '' })}
                >
                  Submeter Nova Versão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA 2: GAPS & PERFIL DO PARCEIRO */}
      {activeArea === 'gaps' && currentStructure && (
        <div className="partner-section-wrapper">
          <div className="section-hero-card-ps">
            <div>
              <h2>
                <AlertTriangle className="text-amber-400" size={20} />
                Diagnóstico de Gaps Operacionais & Perfil de Requisitos
              </h2>
              <p>
                Lacunas da Fase 44 que impedem a execução solo completa, gerando o perfil técnico exato exigido de qualquer parceiro candidato.
              </p>
            </div>
          </div>

          <div className="partner-cards-grid">
            {/* Lista de Gaps */}
            {currentStructure.gaps?.map((gap, i) => (
              <div key={i} className="partner-card-ps" style={{ borderLeft: '3px solid #f59e0b' }}>
                <div className="partner-card-top-ps">
                  <span className="tag-type">{gap.category}</span>
                  <span className="badge-tag-count">{gap.canBeCoveredByPartner ? '✓ Cobertura por Parceiro Viável' : '✕ Gap Incoberto'}</span>
                </div>
                <div className="font-sm font-bold text-slate-100">{gap.description}</div>
                <div className="font-xs text-slate-300">
                  <strong>Impacto:</strong> {gap.gapMagnitude}
                </div>
                <div className="evidence-tag-box-ps">
                  <strong>Mecanismo Recomendado:</strong> {gap.recommendedMechanism}
                </div>
              </div>
            ))}

            {/* Partner Requirement Profile */}
            {currentStructure.partnerRequirementProfile && (
              <div className="partner-card-ps" style={{ gridColumn: 'span 2' }}>
                <div className="partner-card-top-ps">
                  <h3 className="m-0 font-md flex-row items-center gap-2">
                    <Sparkles size={18} className="text-cyan-400" />
                    Perfil de Requisitos do Parceiro (PartnerRequirementProfile)
                  </h3>
                  <span className="badge-tag-count bg-cyan-500/20 text-cyan-300">
                    Criticidade: {currentStructure.partnerRequirementProfile.criticality}
                  </span>
                </div>
                <div className="font-xs text-muted mb-2">
                  Primeiro define-se a necessidade técnica e regulatória antes de associar empresas específicas:
                </div>
                <div className="responsibility-table-container">
                  <table className="responsibility-table">
                    <tbody>
                      <tr>
                        <td style={{ width: '220px' }}><strong>Capacidades Mínimas:</strong></td>
                        <td>{currentStructure.partnerRequirementProfile.requiredCapabilities?.join('; ')}</td>
                      </tr>
                      <tr>
                        <td><strong>Certidões & Registros:</strong></td>
                        <td>{currentStructure.partnerRequirementProfile.requiredCertificates?.join(', ')}</td>
                      </tr>
                      <tr>
                        <td><strong>Experiência Requerida:</strong></td>
                        <td>{currentStructure.partnerRequirementProfile.requiredExperience}</td>
                      </tr>
                      <tr>
                        <td><strong>Equipamentos de Campo:</strong></td>
                        <td>{currentStructure.partnerRequirementProfile.requiredEquipment}</td>
                      </tr>
                      <tr>
                        <td><strong>Região & Janela:</strong></td>
                        <td>{currentStructure.partnerRequirementProfile.region} • Janela: {currentStructure.partnerRequirementProfile.availabilityWindow}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ÁREA 3: PARTNERS COMPATÍVEIS */}
      {activeArea === 'partners' && (
        <div className="partner-section-wrapper">
          <div className="section-hero-card-ps">
            <div>
              <h2>
                <Users className="text-indigo-400" size={20} />
                Shortlist de Parceiros Compatíveis (Sem Score Opaco)
              </h2>
              <p>
                Avaliação transparente e explicável por dimensões factuais: Capacidade Técnica, Documentação Válida, Base Regional e Desempenho Histórico.
              </p>
            </div>
            <span className="tag-company veeluen">{partnersMatches.length} Parceiros Pré-qualificados</span>
          </div>

          <div className="partner-cards-grid">
            {partnersMatches.map((item, idx) => (
              <div key={idx} className="partner-card-ps">
                <div>
                  <div className="partner-card-top-ps">
                    <span className="tag-type">{item.partner.roles.join(', ')}</span>
                    <span className="badge-tag-count">{item.label}</span>
                  </div>
                  <h3 className="font-md font-bold text-slate-100 mt-2 mb-1">{item.partner.companyName}</h3>
                  <div className="font-xs text-muted mb-2">CNPJ: {item.partner.cnpj} • Base: {item.partner.region}</div>

                  {/* Dimensões Explícitas */}
                  <div className="p-2 bg-slate-800/40 rounded border border-slate-700/50 font-xs flex-col gap-1">
                    <div>• <strong>Capacidade Técnica:</strong> <span className="text-cyan-300">{item.dimensions.capabilityFit}</span></div>
                    <div>• <strong>Documentação:</strong> <span className={item.hasExpiredDocuments ? 'text-danger font-bold' : 'text-emerald-400'}>{item.dimensions.documentationFit}</span></div>
                    <div>• <strong>Aderência Regional:</strong> {item.dimensions.regionFit}</div>
                    <div>• <strong>Disponibilidade:</strong> {item.dimensions.availability}</div>
                    <div>• <strong>Histórico Interno:</strong> {item.dimensions.historicalPerformance}</div>
                  </div>

                  {/* Alerta de Documentação Vencida ou Autodeclaração */}
                  {item.hasExpiredDocuments && (
                    <div className="p-2 bg-red-950/40 rounded border border-red-500/40 font-xs text-red-300 mt-2">
                      ⚠️ Documento vencido detectado no cofre! Impede avanço sem renovação.
                    </div>
                  )}

                  {item.hasEvidenceGaps && (
                    <div className="p-2 bg-amber-950/40 rounded border border-amber-500/40 font-xs text-amber-300 mt-2">
                      ⚠️ Capacidade baseada em autodeclaração sem atestado auditado indexado.
                    </div>
                  )}
                </div>

                <div className="growth-card-actions">
                  <button
                    className="btn-growth-action primary"
                    onClick={() => setCommitmentModal({ open: true, partner: item, status: PartnerCommitmentStatus.CONFIRMED, evidenceType: CommitmentEvidenceType.DECLARATION, evidenceDocRef: '', notes: '' })}
                  >
                    <CheckCircle size={13} /> Registrar Compromisso Formal
                  </button>
                  <button
                    className="btn-growth-action"
                    onClick={() => handleOpenScopeSharing(item.partner.id)}
                  >
                    <Share2 size={13} /> Pacote de Escopo
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Lacunas Estratégicas de Rede (Network Gaps) */}
          <div className="section-hero-card-ps mt-3">
            <div>
              <h2>
                <Building className="text-cyan-400" size={20} />
                Lacunas Estratégicas de Rede (Network Gaps)
              </h2>
              <p>Mapeamento de especialidades e geografias onde a rede atual de parceiros é insuficiente.</p>
            </div>
          </div>

          <div className="partner-cards-grid">
            {networkGaps.map(ng => (
              <div key={ng.id} className="partner-card-ps" style={{ borderLeft: '3px solid #38bdf8' }}>
                <div className="partner-card-top-ps">
                  <span className="tag-type">{ng.category}</span>
                  <span className="badge-tag-count">{ng.region}</span>
                </div>
                <div className="font-sm font-bold text-slate-100">{ng.description}</div>
                <div className="font-xs text-slate-300"><strong>Impacto Estratégico:</strong> {ng.strategicImpact}</div>
                <div className="font-xs text-cyan-300 mt-1">💡 <strong>Ação Recomendada:</strong> {ng.suggestedAction}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ÁREA 4: TRADE-OFFS & CENÁRIOS */}
      {activeArea === 'tradeoffs' && currentStructure && (
        <div className="partner-section-wrapper">
          <div className="section-hero-card-ps">
            <div>
              <h2>
                <DollarSign className="text-emerald-400" size={20} />
                Trade-offs: Comparação de Cenários, Preço e Matriz de Responsabilidades
              </h2>
              <p>
                Análise comparativa imparcial entre Solo, Apoio de Parceiro, Subcontratação e Consórcio sem eleição de vencedor automático.
              </p>
            </div>
            {hasFinancialAccess && (
              <button
                className="btn-growth-action primary"
                onClick={() => setCommercialModal({ open: true, terms: currentStructure.commercialTerms, confirmed: currentStructure.commercialTerms?.humanConfirmed || false })}
              >
                <DollarSign size={13} /> Editar Termos Comerciais
              </button>
            )}
          </div>

          {/* Comparação de Cenários em 5 Dimensões */}
          {scenarios && (
            <div className="scenarios-grid-ps">
              {Object.entries(scenarios).map(([key, scn]) => (
                <div key={key} className={`scenario-box-ps ${scn.feasible ? 'viable' : 'unfeasible'}`}>
                  <div>
                    <div className="flex-row justify-between items-center mb-2">
                      <strong className="text-slate-100 uppercase font-md">{key}</strong>
                      <span className={`rule-badge ${scn.feasible ? 'allowed' : 'not_allowed'}`}>
                        {scn.feasible ? 'Viável' : 'Inviável / Risco Crítico'}
                      </span>
                    </div>

                    <div className="scenario-metric-row">
                      <span className="scenario-metric-label">Capacidade Técnica:</span>
                      <span className="scenario-metric-value">{scn.capabilityScore}/100</span>
                    </div>

                    {hasFinancialAccess ? (
                      <div className="scenario-metric-row">
                        <span className="scenario-metric-label">Margem Líquida Estimada:</span>
                        <span className="scenario-metric-value text-emerald-400">{scn.marginPct}%</span>
                      </div>
                    ) : (
                      <div className="scenario-metric-row">
                        <span className="scenario-metric-label">Margem Estimada:</span>
                        <span className="scenario-metric-value text-muted font-xs">Restrito (Sem Acesso Financeiro)</span>
                      </div>
                    )}

                    <div className="scenario-metric-row">
                      <span className="scenario-metric-label">Prontidão (Readiness):</span>
                      <span className="scenario-metric-value">{scn.readinessPct}%</span>
                    </div>

                    <div className="scenario-metric-row">
                      <span className="scenario-metric-label">Complexidade Governança:</span>
                      <span className="scenario-metric-value">{scn.complexity}</span>
                    </div>

                    <div className="p-2 bg-slate-800/40 rounded border border-slate-700/50 font-xs text-slate-300 mt-2">
                      <strong>Trade-off:</strong> {scn.tradeOffNotes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Matriz de Responsabilidades */}
          <div className="section-hero-card-ps mt-3">
            <div>
              <h2>
                <Scale className="text-cyan-400" size={20} />
                Matriz de Responsabilidades Operacionais e Técnicas
              </h2>
              <p>Delimitação clara de escopo, RT, atestados e equipamentos entre a empresa e os parceiros.</p>
            </div>
          </div>

          <div className="responsibility-table-container">
            <table className="responsibility-table">
              <thead>
                <tr>
                  <th>Frente de Escopo</th>
                  <th>Nossa Empresa (Líder / Executora)</th>
                  <th>Parceiro / Consorciada</th>
                </tr>
              </thead>
              <tbody>
                {currentStructure.responsibilityMatrix?.map((row, i) => (
                  <tr key={i}>
                    <td><strong>{row.scope}</strong></td>
                    <td className="text-cyan-300">{row.ourCompany}</td>
                    <td className="text-emerald-300">{row.partner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Gestão de Riscos & Botão de Simulação de Desistência */}
          <div className="partner-cards-grid mt-2">
            <div className="partner-card-ps" style={{ gridColumn: 'span 2' }}>
              <div className="partner-card-top-ps">
                <h3 className="m-0 font-md">Dimensões de Risco & Dependência Exclusiva</h3>
                <span className="badge-tag-count">{currentStructure.risks?.dependencyRisk}</span>
              </div>
              <div className="font-xs text-slate-300 flex-col gap-1 mt-1">
                <div>• <strong>Risco de Dependência:</strong> {currentStructure.risks?.dependencyRisk}</div>
                <div>• <strong>Risco de Disponibilidade:</strong> {currentStructure.risks?.availabilityRisk}</div>
                <div>• <strong>Risco Documental:</strong> {currentStructure.risks?.documentationRisk}</div>
                <div>• <strong>Risco Comercial:</strong> {currentStructure.risks?.commercialRisk}</div>
              </div>

              {/* Botão de Simulação de Desistência do Parceiro */}
              {currentStructure.selectedPartners?.length > 0 && (
                <div className="p-2 bg-slate-800/60 rounded border border-red-500/30 flex-row justify-between items-center mt-3">
                  <div className="font-xs text-red-300">
                    <strong>Simulação de Resiliência:</strong> O que acontece se o parceiro retirar seu compromisso formal?
                  </div>
                  <button
                    className="btn-growth-action danger"
                    onClick={() => setWithdrawalModal({ open: true, partner: currentStructure.selectedPartners[0], reason: '' })}
                  >
                    Simular Desistência do Parceiro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: REGISTRAR COMPROMISSO FORMAL */}
      {commitmentModal.open && commitmentModal.partner && (
        <div className="partner-modal-overlay">
          <div className="partner-modal-content">
            <div className="partner-modal-header">
              <h3>Registrar Compromisso Formal do Parceiro</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setCommitmentModal({ open: false, partner: null })}>
                ✕
              </button>
            </div>
            <div className="partner-modal-body">
              <p className="font-sm text-slate-300">
                Parceiro: <strong>{commitmentModal.partner.partner.companyName}</strong> para a oportunidade <strong>{currentStructure?.opportunityTitle}</strong>.
              </p>

              <div className="form-group-ps">
                <label>Status do Compromisso:</label>
                <select
                  value={commitmentModal.status}
                  onChange={(e) => setCommitmentModal({ ...commitmentModal, status: e.target.value })}
                >
                  <option value={PartnerCommitmentStatus.CONFIRMED}>Compromisso Formal Confirmado</option>
                  <option value={PartnerCommitmentStatus.PENDING}>Pendente de Assinatura</option>
                  <option value={PartnerCommitmentStatus.DRAFT}>Minuta Preliminar</option>
                </select>
              </div>

              <div className="form-group-ps">
                <label>Tipo de Evidência Auditável (Obrigatória para CONFIRMED):</label>
                <select
                  value={commitmentModal.evidenceType}
                  onChange={(e) => setCommitmentModal({ ...commitmentModal, evidenceType: e.target.value })}
                >
                  <option value={CommitmentEvidenceType.DECLARATION}>Declaração de Compromisso Firmada</option>
                  <option value={CommitmentEvidenceType.EMAIL}>E-mail Formal de Aceite do Diretor</option>
                  <option value={CommitmentEvidenceType.AGREEMENT}>MOU / Acordo Pré-Consorcial Assinado</option>
                </select>
              </div>

              <div className="form-group-ps">
                <label>Referência do Documento / Anexo:</label>
                <input
                  type="text"
                  placeholder="Ex: Carta de Anuência protocolada nº 2026-9901"
                  value={commitmentModal.evidenceDocRef}
                  onChange={(e) => setCommitmentModal({ ...commitmentModal, evidenceDocRef: e.target.value })}
                />
              </div>

              <div className="form-group-ps">
                <label>Notas e Condicionantes:</label>
                <textarea
                  placeholder="Descreva eventuais condições ou prazos..."
                  value={commitmentModal.notes}
                  onChange={(e) => setCommitmentModal({ ...commitmentModal, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="partner-modal-footer">
              <button className="btn-growth-action" onClick={() => setCommitmentModal({ open: false, partner: null })}>
                Cancelar
              </button>
              <button className="btn-growth-action primary" onClick={handleConfirmCommitment}>
                Salvar Compromisso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SIMULAÇÃO / REGISTRO DE DESISTÊNCIA DO PARCEIRO */}
      {withdrawalModal.open && withdrawalModal.partner && (
        <div className="partner-modal-overlay">
          <div className="partner-modal-content">
            <div className="partner-modal-header">
              <h3>Notificação de Desistência do Parceiro (Withdrawal)</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setWithdrawalModal({ open: false, partner: null })}>
                ✕
              </button>
            </div>
            <div className="partner-modal-body">
              <div className="withdrawal-alert-banner">
                <AlertOctagon size={24} className="flex-shrink-0" />
                <div>
                  <strong>FLUXO DE RESILIÊNCIA OPERACIONAL (Item 115):</strong> A retirada do parceiro recalculará a prontidão imediatamente, criará risco crítico e invalidará aprovações prévias da proposta.
                </div>
              </div>

              <p className="font-sm text-slate-300">
                Confirmar a retirada do parceiro <strong>{withdrawalModal.partner.companyName}</strong> da composição da oportunidade?
              </p>

              <div className="form-group-ps">
                <label>Motivo Declarado da Desistência:</label>
                <textarea
                  placeholder="Descreva o motivo formal apresentado pelo parceiro..."
                  value={withdrawalModal.reason}
                  onChange={(e) => setWithdrawalModal({ ...withdrawalModal, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="partner-modal-footer">
              <button className="btn-growth-action" onClick={() => setWithdrawalModal({ open: false, partner: null })}>
                Cancelar
              </button>
              <button className="btn-growth-action danger" onClick={handleConfirmWithdrawal}>
                Confirmar Retirada e Recalcular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PACOTE DE ESCOPO SEGURO (SCOPE SHARING) */}
      {scopeModal.open && scopeModal.data && (
        <div className="partner-modal-overlay">
          <div className="partner-modal-content">
            <div className="partner-modal-header">
              <h3>Pacote Mínimo Compartilhável com o Parceiro</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setScopeModal({ open: false, data: null })}>
                ✕
              </button>
            </div>
            <div className="partner-modal-body font-sm">
              <div className="p-2 bg-slate-800/60 rounded mb-2">
                <div><strong>Destinatário:</strong> {scopeModal.data.targetPartner}</div>
                <div><strong>Certame:</strong> {scopeModal.data.opportunityTitle} ({scopeModal.data.client})</div>
              </div>

              <div className="p-3 bg-red-950/30 rounded border border-red-500/40 text-red-300 font-xs mb-2">
                ⚠️ {scopeModal.data.safeScopePackage.prohibitedContentNotice}
              </div>

              <div className="form-group-ps">
                <label>Conteúdo Autorizado para Envio:</label>
                <div className="p-2 bg-slate-900 rounded border border-slate-700 font-xs text-slate-300">
                  • {scopeModal.data.safeScopePackage.executiveSummary}<br/>
                  • Cláusulas pertinentes: {scopeModal.data.safeScopePackage.applicableClauses.join(', ')}<br/>
                  • Registro de confidencialidade NDA: Ativo
                </div>
              </div>
            </div>
            <div className="partner-modal-footer">
              <button className="btn-growth-action primary" onClick={() => {
                showNotification('Pacote de escopo mínimo compartilhado sob supervisão do CRM.');
                setScopeModal({ open: false, data: null });
              }}>
                <Send size={14} /> Registrar Despacho Supervisionado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: NOVA VERSÃO DA ESTRUTURA */}
      {versionModal.open && (
        <div className="partner-modal-overlay">
          <div className="partner-modal-content">
            <div className="partner-modal-header">
              <h3>Criar Nova Versão da Estrutura de Participação</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setVersionModal({ open: false })}>
                ✕
              </button>
            </div>
            <div className="partner-modal-body">
              <p className="font-sm text-slate-300">
                Uma nova versão será gerada (v{(currentStructure?.version || 1) + 1}), preservando a versão anterior no histórico de auditoria com status <strong>SUPERSEDED</strong>.
              </p>

              <div className="form-group-ps">
                <label>Tipo de Participação:</label>
                <select
                  value={versionModal.type}
                  onChange={(e) => setVersionModal({ ...versionModal, type: e.target.value })}
                >
                  <option value={ParticipationType.SOLO}>Participação Solo (Própria)</option>
                  <option value={ParticipationType.PARTNER_SUPPORT}>Apoio de Fornecedor Pontual</option>
                  <option value={ParticipationType.SUBCONTRACTING}>Subcontratação Autorizada</option>
                  <option value={ParticipationType.CONSORTIUM}>Consórcio de Empresas</option>
                  <option value={ParticipationType.TO_EVALUATE}>Em Avaliação Preliminar</option>
                </select>
              </div>

              <div className="form-group-ps">
                <label>Justificativa da Mudança Estratégica:</label>
                <textarea
                  placeholder="Descreva o motivo da alteração de modelagem..."
                  value={versionModal.notes}
                  onChange={(e) => setVersionModal({ ...versionModal, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="partner-modal-footer">
              <button className="btn-growth-action" onClick={() => setVersionModal({ open: false })}>
                Cancelar
              </button>
              <button className="btn-growth-action primary" onClick={handleSaveNewVersion}>
                Salvar Nova Versão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RELATÓRIO ESTRATÉGICO */}
      {reportModal.open && reportModal.content && (
        <div className="partner-modal-overlay">
          <div className="partner-modal-content" style={{ maxWidth: '800px' }}>
            <div className="partner-modal-header">
              <h3>Relatório Estratégico de Parceria & Consórcio</h3>
              <button className="bg-transparent border-none text-slate-400 cursor-pointer" onClick={() => setReportModal({ open: false, content: null })}>
                ✕
              </button>
            </div>
            <div className="partner-modal-body font-sm">
              <div className="p-3 bg-slate-800/60 rounded mb-2">
                <div><strong>Oportunidade:</strong> {reportModal.content.opportunity || reportModal.content.structure?.opportunityTitle}</div>
                <div><strong>Cliente:</strong> {reportModal.content.client || reportModal.content.structure?.client}</div>
                <div><strong>Tipo Adotado:</strong> {reportModal.content.participationType || reportModal.content.structure?.type} (v{reportModal.content.version || reportModal.content.structure?.version})</div>
              </div>

              <div className="p-2 bg-slate-900 rounded border border-slate-700 font-xs flex-col gap-1">
                <div>• <strong>Consórcio Permitido:</strong> {reportModal.content.consortiumAllowed || reportModal.content.rules?.consortium?.status}</div>
                <div>• <strong>Subcontratação Permitida:</strong> {reportModal.content.subcontractingAllowed || reportModal.content.rules?.subcontracting?.status}</div>
                <div>• <strong>Principal Risco Mapeado:</strong> {reportModal.content.mainRisk || reportModal.content.risks?.dependencyRisk}</div>
                <div>• <strong>Status dos Termos Comerciais:</strong> {reportModal.content.commercialOverview?.status || reportModal.content.commercialTerms?.status}</div>
              </div>
            </div>
            <div className="partner-modal-footer">
              <button className="btn-growth-action primary" onClick={() => setReportModal({ open: false, content: null })}>
                Fechar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
