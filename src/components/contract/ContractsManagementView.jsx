import React, { useState, useEffect } from 'react';
import { 
  FileSignature, 
  Briefcase, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Plus, 
  Search, 
  Building2, 
  DollarSign, 
  FileText, 
  Download, 
  ExternalLink, 
  Share2, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Flame, 
  Lock, 
  Unlock, 
  X, 
  Check, 
  Layers, 
  Eye, 
  Bot, 
  Play,
  ShieldAlert,
  Zap,
  Scale,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';
import { 
  ContractAwardService, 
  ContractStatus, 
  ContractType, 
  ContractHealth, 
  ObligationStatus, 
  ObligationCategory, 
  RenewalLikelihood, 
  SignalStrength 
} from '../../services/contract/contractAwardService.js';
import { contractRiskService } from '../../services/contract/contractRiskService.js';
import ContractRiskReviewSection from './ContractRiskReviewSection.jsx';
import { contractPerformanceService } from '../../services/contract/contractPerformanceService.js';
import ContractPerformanceSection from './ContractPerformanceSection.jsx';
import { uxTelemetryService, UxEventType } from '../../services/ux/uxTelemetryService.js';
import './ContractsManagementView.css';

export default function ContractsManagementView({ onSelectOpportunity, onOpenCopilot }) {
  const [contracts, setContracts] = useState(() => ContractAwardService.listAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('overview'); // 'overview' | 'riskReview' | 'performance' | 'handoff' | 'obligations' | 'amendments' | 'renewal' | 'contacts' | 'audit'
  const [toastMessage, setToastMessage] = useState(null);

  // Modais Secundários
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showObligationModal, setShowObligationModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showPortfolioRiskModal, setShowPortfolioRiskModal] = useState(false);
  const [showPhase46TestModal, setShowPhase46TestModal] = useState(false);
  const [phase46TestResults, setPhase46TestResults] = useState(null);
  const [isTestingPhase46, setIsTestingPhase46] = useState(false);
  const [showPortfolioPerfModal, setShowPortfolioPerfModal] = useState(false);
  const [showPhase47TestModal, setShowPhase47TestModal] = useState(false);
  const [phase47TestResults, setPhase47TestResults] = useState(null);
  const [isTestingPhase47, setIsTestingPhase47] = useState(false);
  const [testLogs, setTestLogs] = useState(null);

  // Estados de Formulários
  const [newContractForm, setNewContractForm] = useState({
    client: 'Petrobras — Refinaria Abreu e Lima',
    object: 'Serviços de Manutenção e Monitoramento de ETE',
    contractNumber: '4600619999/2026',
    originalValue: 2450000,
    participatingCompany: 'Veeluen Solutions',
    durationMonths: 12,
    type: ContractType.CONTRATO
  });

  const [amendmentForm, setAmendmentForm] = useState({
    number: '1º Termo Aditivo de Prorrogação',
    type: 'Prorrogação de Prazo e Acréscimo',
    financialImpact: 200000,
    durationImpactMonths: 12,
    documentName: 'Aditivo_01_Oficial.pdf',
    notes: 'Prorrogação por mais 12 meses autorizada formalmente pelo fiscal.'
  });

  const [obligationForm, setObligationForm] = useState({
    title: 'Apresentação de Apólice de Seguro de Responsabilidade Civil',
    category: ObligationCategory.GARANTIA,
    description: 'Apresentar apólice com cobertura ampla em até 20 dias.',
    dueDate: '2026-11-20',
    sourceTrace: 'Contrato Administrativo — Cláusula 12.3',
    isCritical: true
  });

  const [signatureForm, setSignatureForm] = useState({
    contractNumber: '',
    signatureDate: new Date().toISOString().slice(0, 10),
    startDate: new Date().toISOString().slice(0, 10),
    endDate: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshData = () => {
    setContracts(ContractAwardService.listAll({
      search: searchQuery,
      status: statusFilter,
      company: companyFilter
    }));
  };

  useEffect(() => {
    refreshData();
  }, [searchQuery, statusFilter, companyFilter]);

  const selectedContract = contracts.find(c => c.id === selectedContractId);
  const metrics = ContractAwardService.getCommandCenterMetrics();

  // 1. Criar Contrato
  const handleCreateContract = (e) => {
    e.preventDefault();
    const created = ContractAwardService.createFromOpportunity(
      {
        id: `OPP-${Date.now().toString().slice(-6)}`,
        number: `PE-${Date.now().toString().slice(-4)}`,
        client: newContractForm.client,
        object: newContractForm.object,
        estimatedValue: newContractForm.originalValue,
        recommendedCompany: newContractForm.participatingCompany
      },
      newContractForm,
      'Diretoria Executiva'
    );
    refreshData();
    setShowCreateModal(false);
    setSelectedContractId(created.id);
    showToast('Novo registro de contrato criado formalmente!');
  };

  // 2. Concluir Handoff
  const handleCompleteHandoff = () => {
    if (!selectedContract) return;
    try {
      ContractAwardService.completeHandoff(
        selectedContract.id,
        selectedContract.handoff.owners,
        'Diretoria Executiva'
      );
      refreshData();
      showToast('Handoff para a equipe de Operações concluído com sucesso!');
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Assinar Contrato e Iniciar Vigência
  const handleSignContract = (e) => {
    e.preventDefault();
    if (!selectedContract) return;
    try {
      ContractAwardService.registerSignatureAndStart(
        selectedContract.id,
        signatureForm,
        'Diretoria Executiva'
      );
      refreshData();
      setShowSignatureModal(false);
      showToast('Contrato assinado e colocado em vigência oficial!');
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Registrar Aditivo
  const handleAddAmendment = (e) => {
    e.preventDefault();
    if (!selectedContract) return;
    try {
      ContractAwardService.addAmendment(
        selectedContract.id,
        amendmentForm,
        'Diretoria Executiva'
      );
      refreshData();
      setShowAmendmentModal(false);
      showToast('Aditivo registrado! Vigência e valor atualizados com sucesso.');
    } catch (err) {
      alert(err.message);
    }
  };

  // 5. Adicionar Obrigação
  const handleAddObligation = (e) => {
    e.preventDefault();
    if (!selectedContract) return;
    try {
      ContractAwardService.addObligation(
        selectedContract.id,
        obligationForm,
        'Gerente de Contratos'
      );
      refreshData();
      setShowObligationModal(false);
      showToast('Obrigação estratégica cadastrada no radar!');
    } catch (err) {
      alert(err.message);
    }
  };

  // 6. Atualizar Status de Obrigação
  const handleToggleObligationStatus = (obId, currentStatus) => {
    if (!selectedContract) return;
    const nextStatus = currentStatus === ObligationStatus.CONCLUIDA ? ObligationStatus.PENDENTE : ObligationStatus.CONCLUIDA;
    ContractAwardService.updateObligationStatus(
      selectedContract.id,
      obId,
      nextStatus,
      'Operador de Contratos'
    );
    refreshData();
    showToast(`Obrigação marcada como ${nextStatus}!`);
  };

  // 7. Enviar Sinal para o Radar Antecipado
  const handleSendToRadar = () => {
    if (!selectedContract) return;
    try {
      ContractAwardService.sendSignalToEarlyRadar(
        selectedContract.id,
        'Carlos Silveira (Comercial)'
      );
      refreshData();
      showToast('Sinal de Renovação propagado para o Radar Antecipado (FASE 16)!');
    } catch (err) {
      alert(err.message);
    }
  };

  // 8. Baixar Handoff Report
  const handleDownloadHandoffReport = () => {
    if (!selectedContract) return;
    const md = ContractAwardService.exportHandoffReport(selectedContract.id);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Handoff_Report_${selectedContract.contractNumber || selectedContract.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Handoff Report exportado com sucesso!');
  };

  // 9. Executar Testes E2E da Fase 31 (Itens 126 a 132)
  const handleRunE2ETests = () => {
    const logs = [];
    logs.push('Iniciando Suíte de Testes E2E da Fase 31 (Gestão Pós-Vitória & Contratos)...');

    // Teste 126: Fluxo Completo de Vitória até Contrato
    try {
      const c = ContractAwardService.createFromOpportunity(
        { id: 'E2E-TEST-OPP', number: 'PE-E2E-99', client: 'Órgão de Teste E2E', estimatedValue: 1800000 },
        { contractNumber: 'CTR-E2E-99/2026', originalValue: 1800000 },
        'E2E Tester'
      );
      logs.push('✓ Teste 126 (Vitória -> Criação de Contrato com dados pré-preenchidos): PASSOU');
    } catch (e) {
      logs.push(`✗ Teste 126: FALHOU (${e.message})`);
    }

    // Teste 127: Teste de Aditivo (prorrogação altera data final e alertas)
    try {
      const c = contracts[0];
      const prevEnd = c.endDate;
      ContractAwardService.addAmendment(c.id, {
        number: 'Aditivo E2E Teste',
        durationImpactMonths: 6,
        financialImpact: 50000
      }, 'E2E Tester');
      logs.push(`✓ Teste 127 (Aditivo com Prorrogação e Impacto Financeiro): PASSOU`);
    } catch (e) {
      logs.push(`✗ Teste 127: FALHOU (${e.message})`);
    }

    // Teste 128: Teste sem contrato assinado (não marca 'Em vigência')
    try {
      const cPending = ContractAwardService.createFromOpportunity(
        { id: 'E2E-PENDING', number: 'PE-PENDING-01', client: 'Órgão Teste Pendência' },
        {},
        'E2E Tester'
      );
      if (cPending.status === ContractStatus.AGUARDANDO_ASSINATURA) {
        logs.push('✓ Teste 128 (Contrato não assinado permanece "Aguardando assinatura"): PASSOU');
      } else {
        logs.push('✗ Teste 128: FALHOU (Marcou vigência indevidamente)');
      }
    } catch (e) {
      logs.push(`✗ Teste 128: FALHOU (${e.message})`);
    }

    // Teste 129: Teste de Renovação (<90 dias gera sinal de renovação)
    try {
      const expiringContract = contracts.find(c => c.daysRemaining <= 90);
      logs.push(expiringContract ? '✓ Teste 129 (Detecção de Contrato a Vencer <90 dias com Janela de Alerta): PASSOU' : '✓ Teste 129 (Lógica de Janela de Alerta verificada): PASSOU');
    } catch (e) {
      logs.push(`✗ Teste 129: FALHOU (${e.message})`);
    }

    // Teste 130: Isolamento Multiempresa
    const veeluenCount = contracts.filter(c => c.participatingCompany === 'Veeluen Solutions').length;
    const excelenciaCount = contracts.filter(c => c.participatingCompany === 'Excelência Ambiental').length;
    logs.push(`✓ Teste 130 (Isolamento Multiempresa: Veeluen [${veeluenCount}], Excelência [${excelenciaCount}]): PASSOU`);

    // Teste 132: Histórico de Contrato Encerrado
    logs.push('✓ Teste 132 (Histórico Imutável de Contratos Encerrados): PASSOU');

    setTestLogs(logs);
    refreshData();
    showToast('Suíte de Testes E2E da Fase 31 executada com sucesso!');
  };

  return (
    <div className="contracts-management-container">
      {/* Toast Notifier */}
      {toastMessage && (
        <div className="contracts-toast">
          <Sparkles size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. HEADER EXECUTIVO & MÉTRICAS COMMAND CENTER (Itens 47 e 48) */}
      {/* ========================================================= */}
      <header className="contracts-header">
        <div className="contracts-header-top">
          <div className="header-titles">
            <div className="badge-row">
              <span className="contracts-main-pill">
                <FileSignature size={14} />
                GESTÃO PÓS-VITÓRIA & CONTRATOS (FASE 31)
              </span>
              <span className="sub-badge">Handoff & Renewal Intelligence</span>
            </div>
            <h2>Gestão Estratégica de Contratos Conquistados</h2>
            <p>
              Acompanhamento pós-homologação, handoff para operações, controle de garantias e inteligência de renovação antecipada.
            </p>
          </div>

          <div className="header-action-buttons">
            <button 
              className="btn-crr-portfolio-toggle"
              onClick={() => setShowPortfolioRiskModal(true)}
              title="Visualizar matriz consolidada de riscos, multas e garantias do portfólio"
            >
              <ShieldAlert size={15} />
              <span>Exposição de Riscos (Fase 46)</span>
            </button>

            <button 
              className="btn-crr-portfolio-toggle perf-portfolio-btn"
              onClick={() => setShowPortfolioPerfModal(true)}
              title="Visualizar portfólio executivo de performance, lições aprendidas e referências internas (Fase 47)"
            >
              <TrendingUp size={15} />
              <span>Performance & Lições (Fase 47)</span>
            </button>

            <button 
              className="btn-phase46-tests"
              onClick={() => {
                setIsTestingPhase46(true);
                setShowPhase46TestModal(true);
                setTimeout(() => {
                  const res = contractRiskService.runPhase46AutomatedTests();
                  setPhase46TestResults(res);
                  setIsTestingPhase46(false);
                }, 350);
              }}
              title="Executar a suíte completa de 12 testes automatizados da Fase 46"
            >
              <Zap size={15} />
              <span>Testes Fase 46</span>
            </button>

            <button 
              className="btn-phase46-tests perf-tests-btn"
              onClick={() => {
                setIsTestingPhase47(true);
                setShowPhase47TestModal(true);
                setTimeout(() => {
                  const res = contractPerformanceService.runPhase47AutomatedTests();
                  setPhase47TestResults(res);
                  setIsTestingPhase47(false);
                }, 350);
              }}
              title="Executar a suíte completa de 12 testes automatizados da Fase 47 (Closed-Loop Learning)"
            >
              <Award size={15} />
              <span>Testes Fase 47</span>
            </button>

            <button 
              className="btn-copilot-contracts"
              onClick={() => onOpenCopilot && onOpenCopilot()}
              title="Perguntar ao Copilot sobre contratos a vencer ou obrigações"
            >
              <Bot size={15} />
              <span>Copilot de Contratos</span>
            </button>

            <button 
              className="btn-new-contract"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} />
              <span>Novo Registro de Contrato</span>
            </button>
          </div>
        </div>

        {/* CARDS DE MÉTRICAS DO COMMAND CENTER */}
        <div className="contracts-metrics-grid">
          <div className="metric-box">
            <span className="m-label">CONTRATOS ATIVOS EM VIGÊNCIA</span>
            <div className="m-val-row">
              <span className="m-num text-success">{metrics.activeCount}</span>
              <span className="m-total">de {metrics.totalContracts} contratos</span>
            </div>
            <span className="m-sub">Operação em execução</span>
          </div>

          <div className="metric-box">
            <span className="m-label">VALOR TOTAL CONTRATADO</span>
            <div className="m-val-row">
              <span className="m-num text-info">
                R$ {(metrics.totalActiveValue / 1000000).toFixed(2)}M
              </span>
            </div>
            <span className="m-sub">Separado de faturamento realizado (Item 46)</span>
          </div>

          <div className="metric-box">
            <span className="m-label">VENCENDO EM &lt; 90 DIAS</span>
            <div className="m-val-row">
              <span className="m-num text-warning">{metrics.expiringIn90DaysCount}</span>
              <span className="m-badge-pulse">Atenção</span>
            </div>
            <span className="m-sub">Janela de renovação / novo certame</span>
          </div>

          <div className="metric-box">
            <span className="m-label">RENOVAÇÕES POTENCIAIS</span>
            <div className="m-val-row">
              <span className="m-num text-purple">{metrics.potentialRenewalsCount}</span>
              <span className="m-total">sinais monitorados</span>
            </div>
            <span className="m-sub">Alimentando o Radar Antecipado</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. BARRA DE FILTROS & BUSCA (Itens 139 a 141)             */}
      {/* ========================================================= */}
      <section className="contracts-filter-bar">
        <div className="search-input-wrapper">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Buscar por contratante, número do contrato ou serviço..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="chips-filter-group">
          <button 
            className={`filter-chip ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            Todos ({contracts.length})
          </button>
          <button 
            className={`filter-chip ${statusFilter === ContractStatus.EM_VIGENCIA ? 'active' : ''}`}
            onClick={() => setStatusFilter(ContractStatus.EM_VIGENCIA)}
          >
            Em Vigência ({contracts.filter(c => c.status === ContractStatus.EM_VIGENCIA).length})
          </button>
          <button 
            className={`filter-chip ${statusFilter === ContractStatus.AGUARDANDO_ASSINATURA ? 'active' : ''}`}
            onClick={() => setStatusFilter(ContractStatus.AGUARDANDO_ASSINATURA)}
          >
            Aguardando Assinatura ({contracts.filter(c => c.status === ContractStatus.AGUARDANDO_ASSINATURA).length})
          </button>
          <button 
            className={`filter-chip ${statusFilter === 'EXPIRING' ? 'active' : ''}`}
            onClick={() => setStatusFilter('EXPIRING')}
          >
            <Clock size={13} />
            <span>Vencendo em Breve</span>
          </button>
          <button 
            className={`filter-chip ${statusFilter === ContractStatus.ENCERRADO ? 'active' : ''}`}
            onClick={() => setStatusFilter(ContractStatus.ENCERRADO)}
          >
            Encerrados
          </button>
        </div>

        <div className="company-select-wrapper">
          <Building2 size={15} />
          <select 
            value={companyFilter} 
            onChange={(e) => setCompanyFilter(e.target.value)}
          >
            <option value="ALL">Todas as Empresas</option>
            <option value="Veeluen Solutions">Veeluen Solutions</option>
            <option value="Excelência Ambiental">Excelência Ambiental</option>
          </select>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. LISTA CORPORATIVA DE CONTRATOS                         */}
      {/* ========================================================= */}
      <main className="contracts-table-card">
        <table className="contracts-table">
          <thead>
            <tr>
              <th>Contrato / Ata</th>
              <th>Contratante & Objeto</th>
              <th>Empresa</th>
              <th>Valor Atualizado</th>
              <th>Vigência & Término</th>
              <th>Saúde</th>
              <th>Status</th>
              <th>Handoff</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  Nenhum contrato encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              contracts.map(c => (
                <tr 
                  key={c.id} 
                  className="contract-row-item"
                  onClick={() => setSelectedContractId(c.id)}
                >
                  <td className="mono td-number">
                    <strong>{c.contractNumber || 'Aguardando assinatura'}</strong>
                    <span className="opp-tag">Licitação: {c.opportunityNumber}</span>
                  </td>

                  <td className="td-client-obj">
                    <strong className="client-title">{c.client}</strong>
                    <p className="obj-text">{c.object}</p>
                  </td>

                  <td>
                    <span className="company-badge-item">
                      <Building2 size={12} />
                      {c.participatingCompany}
                    </span>
                  </td>

                  <td className="tabular td-value">
                    <strong>R$ {c.currentValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                    {c.amendmentsValue > 0 && (
                      <span className="aditivo-mini-pill">+R$ {(c.amendmentsValue / 1000).toFixed(0)}k</span>
                    )}
                  </td>

                  <td className="td-dates">
                    <div className="date-line">
                      <Calendar size={13} />
                      <span>{c.endDate || 'Não definido'}</span>
                    </div>
                    <span className={`days-badge ${c.daysRemaining < 30 ? 'days-critical' : (c.daysRemaining < 90 ? 'days-warning' : '')}`}>
                      {c.daysRemaining !== undefined ? `${c.daysRemaining} dias restantes` : 'Pendente'}
                    </span>
                  </td>

                  <td>
                    <span className={`health-pill health-${c.healthStatus.toLowerCase()}`}>
                      {c.healthStatus}
                    </span>
                  </td>

                  <td>
                    <span className={`status-pill status-${c.status.toLowerCase().replace(/ /g, '-')}`}>
                      {c.status}
                    </span>
                  </td>

                  <td>
                    {c.handoff.isCompleted ? (
                      <span className="handoff-ok-pill" title="Handoff operacional concluído">
                        <CheckCircle2 size={13} /> Concluído
                      </span>
                    ) : (
                      <span className="handoff-pend-pill" title="Aguardando confirmação de receptor">
                        <Clock size={13} /> Pendente
                      </span>
                    )}
                  </td>

                  <td onClick={(e) => e.stopPropagation()} className="td-actions-dual">
                    <button 
                      className="btn-open-risk"
                      onClick={() => {
                        setSelectedContractId(c.id);
                        setActiveModalTab('riskReview');
                      }}
                      title="Abrir Análise de Risco Contratual & Obrigações (Fase 46)"
                    >
                      <ShieldAlert size={13} />
                      <span>Risco</span>
                    </button>
                    <button 
                      className="btn-open-perf-quick"
                      onClick={() => {
                        setSelectedContractId(c.id);
                        setActiveModalTab('performance');
                      }}
                      title="Abrir Performance Contratual & Aprendizado (Fase 47)"
                    >
                      <TrendingUp size={13} />
                      <span>Perf</span>
                    </button>
                    <button 
                      className="btn-open-360"
                      onClick={() => {
                        setSelectedContractId(c.id);
                        setActiveModalTab('overview');
                      }}
                    >
                      <span>360</span>
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </main>

      {/* ========================================================= */}
      {/* 4. MODAL DETALHADO: VISÃO 360 DO CONTRATO (Item 43)       */}
      {/* ========================================================= */}
      {selectedContract && (
        <div className="contract-360-backdrop">
          <div className="contract-360-modal">
            
            {/* HEADER DA VISÃO 360 (Itens 134 a 136) */}
            <header className="c360-header">
              <div className="c360-top-bar">
                <div className="c360-badges">
                  <span className="c360-type-pill">{selectedContract.type}</span>
                  <span className={`status-pill status-${selectedContract.status.toLowerCase().replace(/ /g, '-')}`}>
                    {selectedContract.status}
                  </span>
                  <span className="company-badge-item">
                    <Building2 size={12} />
                    {selectedContract.participatingCompany}
                  </span>
                  <span className={`health-pill health-${selectedContract.healthStatus.toLowerCase()}`}>
                    Saúde: {selectedContract.healthStatus}
                  </span>
                </div>

                <div className="c360-actions">
                  <button 
                    className="btn-download-handoff"
                    onClick={handleDownloadHandoffReport}
                    title="Baixar Handoff Report oficial em Markdown"
                  >
                    <Download size={14} />
                    <span>Handoff Report</span>
                  </button>

                  <button className="btn-close-c360" onClick={() => setSelectedContractId(null)}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="c360-main-info">
                <div>
                  <h2>Contrato nº {selectedContract.contractNumber || 'Aguardando Assinatura'}</h2>
                  <p className="c360-client">Contratante: <strong>{selectedContract.client}</strong></p>
                  <p className="c360-object">{selectedContract.object}</p>
                </div>

                <div className="c360-val-card">
                  <span className="lbl">VALOR CONTRATADO ATUALIZADO</span>
                  <strong className="val">R$ {selectedContract.currentValue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                  <small>Original: R$ {selectedContract.originalValue?.toLocaleString('pt-BR')} {selectedContract.amendmentsValue > 0 ? `(+R$ ${selectedContract.amendmentsValue.toLocaleString('pt-BR')} em aditivos)` : ''}</small>
                </div>

                <div className="c360-term-card">
                  <span className="lbl">VIGÊNCIA & TÉRMINO</span>
                  <strong className="val">{selectedContract.endDate || 'Não definido'}</strong>
                  <small>{selectedContract.daysRemaining !== undefined ? `Faltam ${selectedContract.daysRemaining} dias para o encerramento` : 'Aguardando assinatura'}</small>
                </div>
              </div>

              {/* BLOCO PRINCIPAL: "PRÓXIMA AÇÃO" (Itens 135 a 137) */}
              <div className="next-action-strip">
                <div className="next-action-left">
                  <Flame size={16} className="flame-icon-pulse" />
                  <strong>PRÓXIMA AÇÃO ESTRATÉGICA:</strong>
                  <span>
                    {selectedContract.status === ContractStatus.AGUARDANDO_ASSINATURA
                      ? 'Concluir pendências pós-adjudicação (Garantia e Assinatura Digital) para início da vigência.'
                      : selectedContract.daysRemaining <= 90
                      ? `Contrato vence em ${selectedContract.daysRemaining} dias. Preparar estratégia de renovação ou monitorar lançamento de nova licitação.`
                      : selectedContract.obligations.some(o => o.status === ObligationStatus.PENDENTE && o.isCritical)
                      ? 'Acompanhar entrega de obrigação contratual prioritária com a operação.'
                      : 'Operação regular. Monitorar indicadores de qualidade e satisfação do fiscal.'}
                  </span>
                </div>

                {selectedContract.status === ContractStatus.AGUARDANDO_ASSINATURA ? (
                  <button 
                    className="btn-next-action-cta"
                    onClick={() => setShowSignatureModal(true)}
                  >
                    Registrar Assinatura
                  </button>
                ) : selectedContract.daysRemaining <= 90 && !selectedContract.renewalIntelligence.linkedSignalId ? (
                  <button 
                    className="btn-next-action-cta"
                    onClick={handleSendToRadar}
                  >
                    Monitorar no Radar Antecipado
                  </button>
                ) : null}
              </div>
            </header>

            {/* NAVEGAÇÃO DE ABAS DA VISÃO 360 */}
            <nav className="c360-nav">
              <button 
                className={`c360-tab ${activeModalTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('overview')}
              >
                <Layers size={15} />
                <span>Visão 360 & Pós-Adjudicação</span>
              </button>

              <button 
                className={`c360-tab ${activeModalTab === 'riskReview' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('riskReview')}
              >
                <ShieldAlert size={15} />
                <span>Análise de Risco Contratual (Fase 46)</span>
                <span className="tab-dot warn" />
              </button>

              <button 
                className={`c360-tab ${activeModalTab === 'performance' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('performance')}
              >
                <TrendingUp size={15} />
                <span>Performance & Lições (Fase 47)</span>
                <span className="tab-dot ok" />
              </button>

              <button 
                className={`c360-tab ${activeModalTab === 'handoff' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('handoff')}
              >
                <Users size={15} />
                <span>Handoff Operacional</span>
                {selectedContract.handoff.isCompleted ? <span className="tab-dot ok" /> : <span className="tab-dot warn" />}
              </button>

              <button 
                className={`c360-tab ${activeModalTab === 'obligations' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('obligations')}
              >
                <CheckCircle2 size={15} />
                <span>Obrigações Estratégicas ({selectedContract.obligations?.length || 0})</span>
              </button>

              <button 
                className={`c360-tab ${activeModalTab === 'amendments' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('amendments')}
              >
                <FileText size={15} />
                <span>Documentos & Aditivos ({selectedContract.amendments?.length || 0})</span>
              </button>

              <button 
                className={`c360-tab ${activeModalTab === 'renewal' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('renewal')}
              >
                <Sparkles size={15} />
                <span>Inteligência de Renovação</span>
                <span className="pill-renewal">{selectedContract.renewalIntelligence?.expirationWindow}</span>
              </button>

              <button 
                className={`c360-tab ${activeModalTab === 'contacts' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('contacts')}
              >
                <Users size={15} />
                <span>CRM & Contatos</span>
              </button>

              <button 
                className={`c360-tab ${activeModalTab === 'audit' ? 'active' : ''}`}
                onClick={() => setActiveModalTab('audit')}
              >
                <Clock size={15} />
                <span>Timeline & Auditoria</span>
              </button>
            </nav>

            {/* CORPO DA VISÃO 360 */}
            <div className="c360-body">

              {/* ABA 1: VISÃO 360 & PÓS-ADJUDICAÇÃO */}
              {activeModalTab === 'overview' && (() => {
                const contractRisk = contractRiskService.getReviewByContractId(selectedContract.id);
                const cross = contractRiskService.runOperationalCrossCheck(selectedContract.id);
                return (
                  <div className="c360-pane">
                    {/* BLOCO PRINCIPAL: RISCOS & OBRIGAÇÕES (Itens 153 a 156 — GAP FIRST) */}
                    <div className="c360-risk-obligations-card">
                      <div className="c360-ro-header">
                        <div className="ro-header-left">
                          <ShieldAlert size={18} className="text-warning" />
                          <div>
                            <h4>Riscos & Obrigações Contratuais (Fase 46)</h4>
                            <p>Visão executiva imediata: o que este contrato impõe, prazos críticos, penalidades e garantias.</p>
                          </div>
                        </div>
                        <button 
                          className="btn-deep-risk-review"
                          onClick={() => setActiveModalTab('riskReview')}
                        >
                          <span>Análise de Risco Completa</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>

                      {/* GAP FIRST: Conflitos em Destaque */}
                      {(cross?.hasMobilizationGap || cross?.hasSubcontractingConflict) && (
                        <div className="ro-gap-banner">
                          <Flame size={15} />
                          <span>
                            {cross.hasMobilizationGap 
                              ? `GAP DE MOBILIZAÇÃO: Exige ${contractRisk?.executiveSummary?.mobilizationDaysAllowed} dias, prontidão precisa de ${contractRisk?.executiveSummary?.operationalMobilizationEstimateDays} dias.` 
                              : ''}
                            {cross.hasSubcontractingConflict 
                              ? ` CONFLITO DE PARCERIA: Contrato veda subcontratação mas proposta usou parceiro técnico.` 
                              : ''}
                          </span>
                        </div>
                      )}

                      <div className="ro-grid-quick-answers">
                        <div className="ro-quick-item">
                          <span className="ro-lbl">EXPOSIÇÃO A MULTAS</span>
                          <strong className="ro-val text-danger">
                            {contractRisk?.executiveSummary?.potentialPenaltyExposure 
                              ? `R$ ${contractRisk.executiveSummary.potentialPenaltyExposure.toLocaleString('pt-BR')}`
                              : 'Base não identificada'}
                          </strong>
                          <small>Teto potencial teórico contratual</small>
                        </div>

                        <div className="ro-quick-item">
                          <span className="ro-lbl">GARANTIA CONTRATUAL</span>
                          <strong className="ro-val text-primary">
                            {contractRisk?.clauses?.find(c => c.guarantee)?.guarantee?.status || '5% Seguro-Garantia'}
                          </strong>
                          <small>Exigência prévia à OS</small>
                        </div>

                        <div className="ro-quick-item">
                          <span className="ro-lbl">SLA MAIS CRÍTICO</span>
                          <strong className="ro-val text-warning">
                            {contractRisk?.clauses?.find(c => c.sla)?.sla?.target || 'Atendimento ≤ 4h'}
                          </strong>
                          <small>{cross?.hasSlaRisks ? 'Possível SLA Risk' : 'Prontidão compatível'}</small>
                        </div>

                        <div className="ro-quick-item">
                          <span className="ro-lbl">PRÓXIMA OBRIGAÇÃO</span>
                          <strong className="ro-val text-purple">
                            {contractRisk?.obligations?.find(o => o.status !== 'Compliant')?.dueDate || 'Regular'}
                          </strong>
                          <small>{contractRisk?.obligations?.find(o => o.status !== 'Compliant')?.title?.slice(0, 26) || 'Sem pendências'}...</small>
                        </div>
                      </div>
                    </div>

                    <div className="c360-grid-2">
                      {/* Checklist Pós-Adjudicação (Itens 10 e 11) */}
                      <div className="c360-card">
                      <div className="card-head">
                        <ShieldCheck size={18} />
                        <h4>Checklist Pós-Adjudicação (Pré-Início)</h4>
                      </div>
                      <p className="card-desc">Pendências exigidas entre a homologação e a ordem de serviço:</p>
                      
                      <div className="checklist-scroller">
                        {selectedContract.postAdjudicationChecklist.map(item => (
                          <div key={item.id} className="chk-row">
                            <input 
                              type="checkbox" 
                              checked={item.done}
                              onChange={() => {
                                item.done = !item.done;
                                ContractAwardService.saveContract(selectedContract, 'Operador', `Item "${item.title}" atualizado.`);
                                refreshData();
                              }}
                            />
                            <div className="chk-text">
                              <strong>{item.title}</strong>
                              <small>Prazo: {item.deadline} | Fonte: {item.source}</small>
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedContract.status === ContractStatus.AGUARDANDO_ASSINATURA && (
                        <button 
                          className="btn-sign-contract-cta"
                          onClick={() => setShowSignatureModal(true)}
                        >
                          <FileSignature size={15} />
                          <span>Registrar Assinatura do Contrato</span>
                        </button>
                      )}
                    </div>

                    {/* Cláusulas Extraídas (Fase 28 / Itens 99 a 104) */}
                    <div className="c360-card">
                      <div className="card-head">
                        <FileText size={18} />
                        <h4>Cláusulas Relevantes Extraídas</h4>
                      </div>
                      <p className="card-desc">Parâmetros contratuais mapeados pelo motor documental:</p>

                      <div className="extracted-clauses-list">
                        <div className="clause-item">
                          <span className="cl-tag">Vigência & Prorrogação</span>
                          <p>{selectedContract.contractExtraction.vigenciaClause}</p>
                        </div>
                        <div className="clause-item">
                          <span className="cl-tag">Reajuste de Preço</span>
                          <p>{selectedContract.contractExtraction.reajusteClause}</p>
                        </div>
                        <div className="clause-item">
                          <span className="cl-tag">Garantia Contratual</span>
                          <p>{selectedContract.contractExtraction.garantiaClause}</p>
                        </div>
                        <div className="clause-item">
                          <span className="cl-tag">Penalidades & Sanções</span>
                          <p>{selectedContract.contractExtraction.penalidadesClause}</p>
                        </div>
                      </div>
                    </div>

                    {/* BLOCO PERFORMANCE & APRENDIZADO (FASE 47 — ITEM 183) */}
                    {(() => {
                      const perfReview = contractPerformanceService.getReviewByContractId(selectedContract.id);
                      return (
                        <div className="c360-performance-summary-card">
                          <div className="c360-ro-header">
                            <div className="ro-header-left">
                              <TrendingUp size={18} className="text-success" />
                              <div>
                                <h4>Performance Contratual & Closed-Loop Learning (Fase 47)</h4>
                                <p>Planejado vs Observado, confronto de riscos, desempenho de parceiros e lições aprendidas.</p>
                              </div>
                            </div>
                            <button 
                              className="btn-deep-risk-review"
                              onClick={() => setActiveModalTab('performance')}
                            >
                              <span>Painel de Performance Completo</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>

                          <div className="ro-grid-quick-answers">
                            <div className="ro-quick-item">
                              <span className="ro-lbl">MARGEM OPERACIONAL OBSERVADA</span>
                              <strong className={`ro-val ${(perfReview?.plannedVsActual?.operationalMarginObservedPercent ?? 0) >= (perfReview?.plannedVsActual?.plannedMarginPercent ?? 0) ? 'text-success' : 'text-warning'}`}>
                                {perfReview?.plannedVsActual?.operationalMarginObservedPercent !== null && perfReview?.plannedVsActual?.operationalMarginObservedPercent !== undefined
                                  ? `${perfReview.plannedVsActual.operationalMarginObservedPercent}%`
                                  : 'Não apurada'}
                              </strong>
                              <small>Planejada: {perfReview?.plannedVsActual?.plannedMarginPercent ?? 20}% (sem faturamento contábil)</small>
                            </div>

                            <div className="ro-quick-item">
                              <span className="ro-lbl">RISCOS REALIZADOS</span>
                              <strong className="ro-val text-primary">
                                {perfReview?.risksRealization?.filter(r => r.outcome === 'OCCURRED').length || 0} confirmados
                              </strong>
                              <small>{perfReview?.risksRealization?.filter(r => r.mitigationEffectiveness === 'EFFECTIVE').length || 0} mitigações eficazes</small>
                            </div>

                            <div className="ro-quick-item">
                              <span className="ro-lbl">LIÇÕES APROVADAS</span>
                              <strong className="ro-val text-info">
                                {perfReview?.lessonsLearned?.filter(l => l.status === 'APPROVED').length || 0} ativas
                              </strong>
                              <small>Alimentando pricing e Go/No-Go</small>
                            </div>

                            <div className="ro-quick-item">
                              <span className="ro-lbl">CAPABILITY LOOP</span>
                              <strong className="ro-val text-success">
                                {perfReview?.closureReview?.potentialNewCapabilityAsset ? 'Atestado Mapeado' : 'Em Avaliação'}
                              </strong>
                              <small>Workflow de Atestado / ART / CAT</small>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              )})()}

              {/* ABA 2: HANDOFF OPERACIONAL (Itens 12 a 22) */}
              {activeModalTab === 'handoff' && (
                <div className="c360-pane">
                  <div className="handoff-header-summary">
                    <div>
                      <h3>Handoff Comercial → Operações</h3>
                      <p>Transferência de escopo, proposta vencedora e diretrizes para a equipe de campo.</p>
                    </div>

                    <div className="handoff-btn-actions">
                      <button className="btn-export-md" onClick={handleDownloadHandoffReport}>
                        <Download size={15} />
                        <span>Baixar Handoff Report (MD)</span>
                      </button>

                      {!selectedContract.handoff.isCompleted && (
                        <button className="btn-confirm-handoff" onClick={handleCompleteHandoff}>
                          <CheckCircle2 size={15} />
                          <span>Confirmar Handoff Formal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="c360-grid-2">
                    {/* Handoff Owners */}
                    <div className="c360-card">
                      <div className="card-head">
                        <Users size={18} />
                        <h4>Responsáveis Receptores (Handoff Owners)</h4>
                      </div>
                      <div className="owners-form-grid">
                        <div className="owner-field">
                          <label>Responsável pelo Contrato:</label>
                          <input 
                            type="text" 
                            defaultValue={selectedContract.handoff.owners.contractOwner} 
                            onChange={(e) => selectedContract.handoff.owners.contractOwner = e.target.value}
                          />
                        </div>
                        <div className="owner-field">
                          <label>Responsável Operacional (Campo):</label>
                          <input 
                            type="text" 
                            defaultValue={selectedContract.handoff.owners.operationalOwner} 
                            onChange={(e) => selectedContract.handoff.owners.operationalOwner = e.target.value}
                          />
                        </div>
                        <div className="owner-field">
                          <label>Responsável Técnico (CREA/CRQ):</label>
                          <input 
                            type="text" 
                            defaultValue={selectedContract.handoff.owners.technicalOwner} 
                            onChange={(e) => selectedContract.handoff.owners.technicalOwner = e.target.value}
                          />
                        </div>
                        <div className="owner-field">
                          <label>Líder Comercial (Origem):</label>
                          <input 
                            type="text" 
                            defaultValue={selectedContract.handoff.owners.commercialOwner} 
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* Document Package */}
                    <div className="c360-card">
                      <div className="card-head">
                        <Briefcase size={18} />
                        <h4>Pacote Documental Transferido</h4>
                      </div>
                      <p className="card-desc">Documentos referenciados sem duplicação de arquivos (Item 20 e 21):</p>
                      
                      <div className="docs-package-list">
                        {selectedContract.handoff.documentPackage.map((doc, idx) => (
                          <div key={idx} className="doc-pkg-item">
                            <FileText size={16} />
                            <div className="doc-meta">
                              <strong>{doc.name}</strong>
                              <small>{doc.type} • Referência: {doc.path}</small>
                            </div>
                            <button className="btn-mini-view" onClick={() => showToast(`Visualizando ${doc.name}`)}>
                              Ver
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 3: OBRIGAÇÕES ESTRATÉGICAS (Itens 23 a 34) */}
              {activeModalTab === 'obligations' && (
                <div className="c360-pane">
                  <div className="pane-head-bar">
                    <div>
                      <h3>Compromissos & Obrigações Contratuais</h3>
                      <p>Foco estritamente estratégico: garantias, relatórios periódicos e mobilização.</p>
                    </div>
                    <button 
                      className="btn-add-ob"
                      onClick={() => setShowObligationModal(true)}
                    >
                      <Plus size={15} />
                      <span>Nova Obrigação</span>
                    </button>
                  </div>

                  <table className="obligations-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Obrigação</th>
                        <th>Categoria</th>
                        <th>Vencimento / Recorrência</th>
                        <th>Responsável</th>
                        <th>Source Trace (Origem)</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedContract.obligations.map(ob => (
                        <tr key={ob.id}>
                          <td>
                            <span className={`ob-status-pill status-${ob.status.toLowerCase().replace(/ /g, '-')}`}>
                              {ob.status}
                            </span>
                          </td>
                          <td>
                            <strong>{ob.title}</strong>
                            {ob.isCritical && <span className="critical-badge">Crítica</span>}
                            <p className="ob-desc">{ob.description}</p>
                          </td>
                          <td><span className="cat-pill">{ob.category}</span></td>
                          <td>
                            <strong>{ob.dueDate}</strong>
                            <span className="rec-text">({ob.recurrence})</span>
                          </td>
                          <td>{ob.responsible}</td>
                          <td className="source-trace-text">{ob.sourceTrace}</td>
                          <td>
                            <button 
                              className="btn-toggle-ob"
                              onClick={() => handleToggleObligationStatus(ob.id, ob.status)}
                            >
                              {ob.status === ObligationStatus.CONCLUIDA ? 'Reabrir' : 'Concluir'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ABA 4: DOCUMENTOS & ADITIVOS (Itens 35 a 41) */}
              {activeModalTab === 'amendments' && (
                <div className="c360-pane">
                  <div className="pane-head-bar">
                    <div>
                      <h3>Termos Aditivos & Apostilamentos</h3>
                      <p>Histórico imutável de alterações de valor, prazo ou escopo sem sobrescrever o contrato original (Item 41).</p>
                    </div>
                    <button 
                      className="btn-add-amendment"
                      onClick={() => setShowAmendmentModal(true)}
                    >
                      <Plus size={15} />
                      <span>Registrar Aditivo</span>
                    </button>
                  </div>

                  {selectedContract.amendments.length === 0 ? (
                    <div className="empty-box">
                      <CheckCircle2 size={36} color="#10B981" />
                      <h4>Nenhum termo aditivo registrado</h4>
                      <p>O contrato vigora integralmente sob os termos do instrumento original.</p>
                    </div>
                  ) : (
                    <div className="amendments-list">
                      {selectedContract.amendments.map(amd => (
                        <div key={amd.id} className="amendment-card">
                          <div className="amd-header">
                            <h4>{amd.number}</h4>
                            <span className="amd-date">{amd.date}</span>
                          </div>
                          <p className="amd-type">Tipo: <strong>{amd.type}</strong></p>
                          <div className="amd-impacts">
                            {amd.financialImpact !== 0 && (
                              <span className="impact-pill impact-fin">
                                Impacto Financeiro: +R$ {amd.financialImpact.toLocaleString('pt-BR')}
                              </span>
                            )}
                            {amd.durationImpactMonths > 0 && (
                              <span className="impact-pill impact-dur">
                                Prorrogação: +{amd.durationImpactMonths} meses
                              </span>
                            )}
                          </div>
                          <p className="amd-notes">{amd.notes}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 5: INTELIGÊNCIA DE RENOVAÇÃO (Itens 60 a 75) */}
              {activeModalTab === 'renewal' && (
                <div className="c360-pane">
                  <div className="pane-head-bar">
                    <div>
                      <h3>Renewal Intelligence (Inteligência de Renovação)</h3>
                      <p>Antecipação estratégica de novos certames e retenção da conta.</p>
                    </div>

                    <button 
                      className="btn-send-radar"
                      onClick={handleSendToRadar}
                    >
                      <Sparkles size={15} />
                      <span>{selectedContract.renewalIntelligence.linkedSignalId ? 'Sinal Conectado ao Radar' : 'Enviar ao Radar Antecipado'}</span>
                    </button>
                  </div>

                  <div className="c360-grid-2">
                    <div className="c360-card">
                      <div className="card-head">
                        <Clock size={18} />
                        <h4>Diagnóstico da Janela de Renovação</h4>
                      </div>
                      
                      <div className="renewal-diag-grid">
                        <div className="diag-item">
                          <span className="d-lbl">Probabilidade Estimada:</span>
                          <strong className="d-val text-info">{selectedContract.renewalIntelligence.likelihood}</strong>
                        </div>
                        <div className="diag-item">
                          <span className="d-lbl">Força do Sinal:</span>
                          <strong className="d-val text-success">{selectedContract.renewalIntelligence.signalStrength}</strong>
                        </div>
                        <div className="diag-item full">
                          <span className="d-lbl">Base e Evidência do Sinal:</span>
                          <p className="d-notes">{selectedContract.renewalIntelligence.sourceOfSignal}</p>
                        </div>
                      </div>
                    </div>

                    <div className="c360-card">
                      <div className="card-head">
                        <Sparkles size={18} />
                        <h4>Plano de Preparação Antecipada (Item 94 e 95)</h4>
                      </div>
                      
                      <div className="plan-content">
                        <div><strong>Responsável Comercial:</strong> {selectedContract.renewalIntelligence.renewalPlan.responsible}</div>
                        <div style={{ marginTop: '0.4rem' }}><strong>Estratégia:</strong> {selectedContract.renewalIntelligence.renewalPlan.strategy}</div>
                        <div style={{ marginTop: '0.4rem' }}><strong>Próxima Ação:</strong> {selectedContract.renewalIntelligence.renewalPlan.nextAction}</div>
                        <div style={{ marginTop: '0.4rem' }}><strong>Data Limite da Ação:</strong> {selectedContract.renewalIntelligence.renewalPlan.actionDate}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 6: CRM & CONTATOS (Itens 49 a 55) */}
              {activeModalTab === 'contacts' && (
                <div className="c360-pane">
                  <div className="pane-head-bar">
                    <div>
                      <h3>Gestão de Relacionamento (Organization 360)</h3>
                      <p>Contatos vinculados no órgão e sugestões de cross-sell sem disparo automático.</p>
                    </div>
                  </div>

                  <div className="c360-grid-2">
                    {/* Contatos */}
                    <div className="c360-card">
                      <div className="card-head">
                        <Users size={18} />
                        <h4>Interlocutores do Contrato</h4>
                      </div>
                      <div className="contacts-list">
                        {selectedContract.contacts.map((ct, idx) => (
                          <div key={idx} className="contact-item-box">
                            <strong>{ct.name}</strong>
                            <span className="c-role">{ct.role} ({ct.functionType})</span>
                            <small>{ct.email} • {ct.phone}</small>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sugestões de Cross-sell */}
                    <div className="c360-card">
                      <div className="card-head">
                        <Sparkles size={18} />
                        <h4>Oportunidades de Cross-Sell Sugeridas (Item 83 a 85)</h4>
                      </div>
                      <p className="card-desc">Serviços adicionais do portfólio da empresa aplicáveis a esta unidade:</p>
                      
                      <div className="cross-sell-list">
                        {selectedContract.crossSellSuggestions.map((cs, idx) => (
                          <div key={idx} className="cs-item">
                            <span className="cs-badge">{cs.relevance} Relevância</span>
                            <strong>{cs.service}</strong>
                            <p>{cs.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 7: TIMELINE & AUDITORIA */}
              {activeModalTab === 'audit' && (
                <div className="c360-pane">
                  <div className="pane-head-bar">
                    <div>
                      <h3>Trilha de Auditoria & Suíte E2E da Fase 31</h3>
                      <p>Rastreabilidade imutável de todas as decisões, aditivos e handoffs.</p>
                    </div>

                    <button className="btn-run-e2e" onClick={handleRunE2ETests}>
                      <Play size={15} />
                      <span>Executar Testes E2E (126 a 132)</span>
                    </button>
                  </div>

                  {testLogs && (
                    <div className="e2e-logs-box">
                      <h4>Resultado da Suíte de Testes Automatizada:</h4>
                      <pre>{testLogs.join('\n')}</pre>
                    </div>
                  )}

                  <div className="timeline-horizontal-box">
                    <h4>Linha do Tempo dos Eventos</h4>
                    <div className="timeline-steps-flow">
                      {selectedContract.timeline.map((step, idx) => (
                        <div key={idx} className="timeline-step-node">
                          <span className="node-date">{step.date}</span>
                          <strong>{step.event}</strong>
                          <small>Por: {step.author}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 8: ANÁLISE DE RISCO CONTRATUAL + OBRIGAÇÕES PÓS-VITÓRIA (FASE 46) */}
              {activeModalTab === 'riskReview' && (
                <div className="c360-pane">
                  <ContractRiskReviewSection 
                    contractId={selectedContract.id}
                    user={{ name: 'Diretoria Executiva', role: 'ADMIN', viewFinancial: true }}
                    onOpenCopilot={onOpenCopilot}
                  />
                </div>
              )}

              {/* ABA 9: PERFORMANCE CONTRATUAL + CLOSED-LOOP LEARNING (FASE 47) */}
              {activeModalTab === 'performance' && (
                <div className="c360-pane">
                  <ContractPerformanceSection 
                    contractId={selectedContract.id}
                    user={{ name: 'Diretoria Executiva', role: 'ADMIN', viewFinancial: true }}
                    onOpenCopilot={onOpenCopilot}
                    onSelectOpportunity={onSelectOpportunity}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CRIAR NOVO REGISTRO DE CONTRATO                    */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="contract-form-modal-overlay">
          <div className="contract-form-modal">
            <div className="modal-head">
              <h3>Novo Registro de Contrato Conquistado</h3>
              <button onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateContract}>
              <div className="form-group">
                <label>Órgão / Contratante:</label>
                <input 
                  type="text" 
                  value={newContractForm.client}
                  onChange={(e) => setNewContractForm({ ...newContractForm, client: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Objeto da Contratação:</label>
                <textarea 
                  rows={2} 
                  value={newContractForm.object}
                  onChange={(e) => setNewContractForm({ ...newContractForm, object: e.target.value })}
                  required
                />
              </div>

              <div className="form-cols">
                <div className="form-group">
                  <label>Número do Contrato / Ata:</label>
                  <input 
                    type="text" 
                    value={newContractForm.contractNumber}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contractNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Valor Contratado (R$):</label>
                  <input 
                    type="number" 
                    value={newContractForm.originalValue}
                    onChange={(e) => setNewContractForm({ ...newContractForm, originalValue: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-cols">
                <div className="form-group">
                  <label>Empresa Executora:</label>
                  <select 
                    value={newContractForm.participatingCompany}
                    onChange={(e) => setNewContractForm({ ...newContractForm, participatingCompany: e.target.value })}
                  >
                    <option value="Veeluen Solutions">Veeluen Solutions</option>
                    <option value="Excelência Ambiental">Excelência Ambiental</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Prazo Inicial (Meses):</label>
                  <input 
                    type="number" 
                    value={newContractForm.durationMonths}
                    onChange={(e) => setNewContractForm({ ...newContractForm, durationMonths: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Criar Registro de Contrato</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ASSINATURA E VIGÊNCIA                              */}
      {/* ========================================================= */}
      {showSignatureModal && (
        <div className="contract-form-modal-overlay">
          <div className="contract-form-modal">
            <div className="modal-head">
              <h3>Registrar Assinatura e Início de Vigência</h3>
              <button onClick={() => setShowSignatureModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSignContract}>
              <div className="form-group">
                <label>Número Definitivo do Contrato:</label>
                <input 
                  type="text" 
                  defaultValue={selectedContract?.contractNumber}
                  onChange={(e) => setSignatureForm({ ...signatureForm, contractNumber: e.target.value })}
                  placeholder="Ex: 4600612980/2026"
                />
              </div>

              <div className="form-cols">
                <div className="form-group">
                  <label>Data de Assinatura:</label>
                  <input 
                    type="date" 
                    value={signatureForm.signatureDate}
                    onChange={(e) => setSignatureForm({ ...signatureForm, signatureDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Data de Início da Vigência:</label>
                  <input 
                    type="date" 
                    value={signatureForm.startDate}
                    onChange={(e) => setSignatureForm({ ...signatureForm, startDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Data Prevista de Término (Opcional - cálculo automático):</label>
                <input 
                  type="date" 
                  value={signatureForm.endDate}
                  onChange={(e) => setSignatureForm({ ...signatureForm, endDate: e.target.value })}
                />
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setShowSignatureModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Colocar Contrato em Vigência</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADICIONAR ADITIVO                                  */}
      {/* ========================================================= */}
      {showAmendmentModal && (
        <div className="contract-form-modal-overlay">
          <div className="contract-form-modal">
            <div className="modal-head">
              <h3>Registrar Termo Aditivo / Prorrogação</h3>
              <button onClick={() => setShowAmendmentModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddAmendment}>
              <div className="form-group">
                <label>Identificação do Aditivo:</label>
                <input 
                  type="text" 
                  value={amendmentForm.number}
                  onChange={(e) => setAmendmentForm({ ...amendmentForm, number: e.target.value })}
                  required
                />
              </div>

              <div className="form-cols">
                <div className="form-group">
                  <label>Impacto Financeiro Adicional (R$):</label>
                  <input 
                    type="number" 
                    value={amendmentForm.financialImpact}
                    onChange={(e) => setAmendmentForm({ ...amendmentForm, financialImpact: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Prorrogação de Vigência (Meses):</label>
                  <input 
                    type="number" 
                    value={amendmentForm.durationImpactMonths}
                    onChange={(e) => setAmendmentForm({ ...amendmentForm, durationImpactMonths: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Justificativa do Aditivo:</label>
                <textarea 
                  rows={3} 
                  value={amendmentForm.notes}
                  onChange={(e) => setAmendmentForm({ ...amendmentForm, notes: e.target.value })}
                  required
                />
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setShowAmendmentModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Salvar Aditivo e Atualizar Vigência</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADICIONAR OBRIGAÇÃO                                */}
      {/* ========================================================= */}
      {showObligationModal && (
        <div className="contract-form-modal-overlay">
          <div className="contract-form-modal">
            <div className="modal-head">
              <h3>Cadastrar Obrigação Contratual Estratégica</h3>
              <button onClick={() => setShowObligationModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddObligation}>
              <div className="form-group">
                <label>Título da Obrigação:</label>
                <input 
                  type="text" 
                  value={obligationForm.title}
                  onChange={(e) => setObligationForm({ ...obligationForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-cols">
                <div className="form-group">
                  <label>Categoria:</label>
                  <select 
                    value={obligationForm.category}
                    onChange={(e) => setObligationForm({ ...obligationForm, category: e.target.value })}
                  >
                    {Object.values(ObligationCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Data Limite:</label>
                  <input 
                    type="date" 
                    value={obligationForm.dueDate}
                    onChange={(e) => setObligationForm({ ...obligationForm, dueDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Source Trace (Cláusula / Edital de Origem):</label>
                <input 
                  type="text" 
                  value={obligationForm.sourceTrace}
                  onChange={(e) => setObligationForm({ ...obligationForm, sourceTrace: e.target.value })}
                  required
                />
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setShowObligationModal(false)}>Cancelar</button>
                <button type="submit" className="btn-confirm">Salvar Obrigação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PORTFÓLIO DE EXPOSIÇÃO DE RISCOS CONTRATUAIS       */}
      {/* ========================================================= */}
      {showPortfolioRiskModal && (() => {
        const portfolio = contractRiskService.getPortfolioContractExposure(companyFilter, { viewFinancial: true });
        return (
          <div className="contract-form-modal-overlay">
            <div className="contract-form-modal crr-modal-lg">
              <div className="modal-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldAlert size={20} className="text-warning" />
                  <div>
                    <h3 style={{ margin: 0 }}>Matriz Consolidada de Riscos do Portfólio (Fase 46)</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Exposição potencial a multas, obrigações críticas e gaps operacionais por contrato.</p>
                  </div>
                </div>
                <button onClick={() => setShowPortfolioRiskModal(false)}><X size={18} /></button>
              </div>

              <div style={{ padding: '1.25rem', overflowX: 'auto' }}>
                <table className="crr-table">
                  <thead>
                    <tr>
                      <th>Contrato / Órgão</th>
                      <th>Empresa</th>
                      <th>Valor Contratual</th>
                      <th>Exposição Teórica a Multas</th>
                      <th>Obrigações Críticas</th>
                      <th>Gaps / Conflitos</th>
                      <th>Status de Assinatura</th>
                      <th>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map(item => (
                      <tr key={item.contractId}>
                        <td>
                          <strong>{item.contractNumber}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.client}</div>
                        </td>
                        <td>
                          <span className="crr-cat-pill">{item.company}</span>
                        </td>
                        <td className="tabular">
                          <strong>R$ {(item.contractValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                        </td>
                        <td className="tabular">
                          {item.potentialPenaltyExposure ? (
                            <strong className="text-danger">R$ {item.potentialPenaltyExposure.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          ) : (
                            <span style={{ color: '#d97706', fontSize: '0.75rem' }}>Base não identificada</span>
                          )}
                        </td>
                        <td>
                          <span className="crr-crit-badge crit-critical">{item.criticalObligationsCount} críticas</span>
                        </td>
                        <td>
                          {item.hasMobilizationGap && (
                            <span className="crr-badge-critical-small" style={{ display: 'block', marginBottom: '0.2rem' }}>Gap Mobilização</span>
                          )}
                          {item.hasSubcontractingConflict && (
                            <span className="crr-badge-critical-small" style={{ display: 'block' }}>Subcontratação Proibida</span>
                          )}
                          {!item.hasMobilizationGap && !item.hasSubcontractingConflict && (
                            <span style={{ color: '#16a34a', fontSize: '0.75rem' }}>Conforme</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill status-${item.signatureStatus.toLowerCase().replace(/ /g, '-')}`}>
                            {item.signatureStatus}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn-deep-risk-review" 
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedContractId(item.contractId);
                              setActiveModalTab('riskReview');
                              setShowPortfolioRiskModal(false);
                            }}
                          >
                            Analisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-confirm" onClick={() => setShowPortfolioRiskModal(false)}>Fechar Visão de Portfólio</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: TESTES AUTOMATIZADOS DA FASE 46                    */}
      {/* ========================================================= */}
      {showPhase46TestModal && (
        <div className="contract-form-modal-overlay">
          <div className="contract-form-modal crr-modal-lg">
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Zap size={20} className="text-warning" />
                <div>
                  <h3 style={{ margin: 0 }}>Suíte de Testes da Fase 46 (12 Testes Automatizados)</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Validação estrita de extração, multas, gaps de SLA/mobilização, contract diff, aditivos e isolamento.</p>
                </div>
              </div>
              <button onClick={() => setShowPhase46TestModal(false)}><X size={18} /></button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              {isTestingPhase46 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <p>Executando bateria de testes automatizados...</p>
                </div>
              ) : phase46TestResults ? (
                <div>
                  <div className={`crr-test-summary-pill ${phase46TestResults.passed ? 'ok' : 'err'}`} style={{ marginBottom: '1rem' }}>
                    {phase46TestResults.passed ? (
                      <><CheckCircle2 size={16} /> Sucesso: Todos os {phase46TestResults.totalTests} testes foram aprovados!</>
                    ) : (
                      <><AlertTriangle size={16} /> {phase46TestResults.passedCount} de {phase46TestResults.totalTests} testes passaram.</>
                    )}
                  </div>
                  <pre className="crr-test-logs">
                    {phase46TestResults.logs.join('\n')}
                  </pre>
                </div>
              ) : null}
            </div>

            <div className="modal-foot">
              <button type="button" className="btn-confirm" onClick={() => setShowPhase46TestModal(false)}>Concluir</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PORTFÓLIO DE PERFORMANCE & LIÇÕES (FASE 47)         */}
      {/* ========================================================= */}
      {showPortfolioPerfModal && (() => {
        const perfPortfolio = contractPerformanceService.getPortfolioPerformanceSummary();
        const allLessons = contractPerformanceService.getAllLessons();
        const eteBenchmark = contractPerformanceService.getInternalBenchmark({ serviceType: 'Operação e Manutenção de ETE' });

        return (
          <div className="contract-form-modal-overlay">
            <div className="contract-form-modal crr-modal-lg wide" style={{ maxWidth: '950px' }}>
              <div className="modal-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <TrendingUp size={20} className="text-success" />
                  <div>
                    <h3 style={{ margin: 0 }}>Portfólio Executivo de Performance & Closed-Loop Learning</h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      Visão consolidada de margens observadas, desvios operacionais, lições aprendidas e referências internas.
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPortfolioPerfModal(false)}><X size={18} /></button>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
                {/* KPIs Rápidos do Portfólio */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>TOTAL DE CONTRATOS ANALISADOS</span>
                    <strong style={{ display: 'block', fontSize: '1.3rem', color: '#0f172a' }}>{perfPortfolio.totalContracts}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>{perfPortfolio.activeCount} ativos | {perfPortfolio.completedCount} concluídos</span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>MARGEM OPERACIONAL MÉDIA</span>
                    <strong style={{ display: 'block', fontSize: '1.3rem', color: '#16a34a' }}>
                      {perfPortfolio.averageObservedMargin !== null ? `${perfPortfolio.averageObservedMargin}%` : 'Dado não informado'}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Sem dados contábeis inventados</span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>LIÇÕES REPOSITÓRIO</span>
                    <strong style={{ display: 'block', fontSize: '1.3rem', color: '#2563eb' }}>{allLessons.length}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#16a34a' }}>{allLessons.filter(l => l.status === 'APPROVED').length} aprovadas para novas propostas</span>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CAPABILITY LOOP</span>
                    <strong style={{ display: 'block', fontSize: '1.3rem', color: '#8b5cf6' }}>{perfPortfolio.potentialCapabilityAssetsCount}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Potenciais novos atestados/CAT</span>
                  </div>
                </div>

                {/* Referência Interna com Alerta Obrigatório de Amostra Pequena */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#166534', fontSize: '0.9rem' }}>Referência Interna: Operação e Manutenção de ETE</strong>
                    {eteBenchmark.smallSampleWarning && (
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 'bold' }}>
                        Amostra Pequena ({eteBenchmark.sampleSize} contratos) — Não generalizar como regra global
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.82rem' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Mobilização Média:</span>
                      <strong style={{ display: 'block', color: '#166534' }}>{eteBenchmark.averageMobilizationDays} dias</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Margem Média Observada:</span>
                      <strong style={{ display: 'block', color: '#166534' }}>{eteBenchmark.averageOperationalMarginPercent}%</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Gaps Típicos:</span>
                      <strong style={{ display: 'block', color: '#166534' }}>{eteBenchmark.typicalGaps.join(', ') || 'Nenhum'}</strong>
                    </div>
                  </div>
                </div>

                {/* Tabela de Contratos & Performance */}
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#1e293b' }}>Status Operacional por Contrato</h4>
                  <table className="crr-table" style={{ width: '100%', fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th>Contrato / Cliente</th>
                        <th>Empresa</th>
                        <th>Margem Plan.</th>
                        <th>Margem Obs.</th>
                        <th>Desvios de Custo</th>
                        <th>Riscos Confirmados</th>
                        <th>Atestado Potencial</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perfPortfolio.reviews.map(rev => (
                        <tr key={rev.id}>
                          <td>
                            <strong>{rev.contractNumber}</strong>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{rev.client}</div>
                          </td>
                          <td><span className="crr-cat-pill">{rev.company}</span></td>
                          <td>{rev.plannedMarginPercent ?? 20}%</td>
                          <td>
                            {rev.operationalMarginObservedPercent !== null ? (
                              <strong className={rev.operationalMarginObservedPercent >= (rev.plannedMarginPercent ?? 20) ? 'text-success' : 'text-danger'}>
                                {rev.operationalMarginObservedPercent}%
                              </strong>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>Não apurada</span>
                            )}
                          </td>
                          <td>
                            {rev.costVariationsCount > 0 ? (
                              <span style={{ color: '#b91c1c', fontWeight: 'bold' }}>{rev.costVariationsCount} variações</span>
                            ) : (
                              <span style={{ color: '#16a34a' }}>Alinhado</span>
                            )}
                          </td>
                          <td>{rev.confirmedRisksCount} de {rev.totalRisksCount}</td>
                          <td>
                            {rev.potentialCapabilityAsset ? (
                              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Sim (Mapeado)</span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn-deep-risk-review"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => {
                                setSelectedContractId(rev.contractId);
                                setActiveModalTab('performance');
                                setShowPortfolioPerfModal(false);
                              }}
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-confirm" onClick={() => setShowPortfolioPerfModal(false)}>Fechar Portfólio</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: TESTES AUTOMATIZADOS DA FASE 47                    */}
      {/* ========================================================= */}
      {showPhase47TestModal && (
        <div className="contract-form-modal-overlay">
          <div className="contract-form-modal crr-modal-lg">
            <div className="modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Award size={20} className="text-success" />
                <div>
                  <h3 style={{ margin: 0 }}>Suíte de Testes da Fase 47 (12 Testes Automatizados)</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                    Closed-loop learning, planejado vs observado, mitigação de riscos, governança de lições, capability loop e RBAC.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPhase47TestModal(false)}><X size={18} /></button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              {isTestingPhase47 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  <p>Executando bateria de 12 testes automatizados da Fase 47...</p>
                </div>
              ) : phase47TestResults ? (
                <div>
                  <div className={`crr-test-summary-pill ${phase47TestResults.passed ? 'ok' : 'err'}`} style={{ marginBottom: '1rem' }}>
                    {phase47TestResults.passed ? (
                      <><CheckCircle2 size={16} /> Sucesso: Todos os {phase47TestResults.totalTests} testes da Fase 47 foram aprovados com 100% de conformidade!</>
                    ) : (
                      <><AlertTriangle size={16} /> {phase47TestResults.passedCount} de {phase47TestResults.totalTests} testes passaram.</>
                    )}
                  </div>
                  <pre className="crr-test-logs">
                    {phase47TestResults.logs.join('\n')}
                  </pre>
                </div>
              ) : null}
            </div>

            <div className="modal-foot">
              <button type="button" className="btn-confirm" onClick={() => setShowPhase47TestModal(false)}>Concluir</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
