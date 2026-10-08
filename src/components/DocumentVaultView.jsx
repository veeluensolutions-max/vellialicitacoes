import React, { useState, useMemo } from 'react';
import { 
  FolderLock, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Sparkles, 
  Building2, 
  Layers, 
  Users, 
  Wrench, 
  FileSignature, 
  Send, 
  Eye, 
  CheckCircle2, 
  HelpCircle, 
  Flame, 
  ChevronRight, 
  Download, 
  History, 
  Scale, 
  Info, 
  Check, 
  Award, 
  TrendingUp,
  Tag,
  Link as LinkIcon
} from 'lucide-react';
import DocumentVaultService, { 
  DocumentCategory, 
  DocumentSubCategory, 
  DocumentStatus, 
  AttestationStrengthTier,
  IssueSeverity
} from '../services/vault/documentVaultService';
import './DocumentVaultView.css';

export default function DocumentVaultView() {
  // Filtros Globais
  const [selectedCompany, setSelectedCompany] = useState('ALL'); // 'ALL' | 'excelencia-ambiental' | 'veeluen-solutions'
  const [activeTab, setActiveTab] = useState('documentos'); // 'documentos' | 'atestados' | 'arts' | 'equipe' | 'equipamentos' | 'matriz' | 'pendencias' | 'assistente' | 'auditoria'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Estados de dados carregados
  const [docsList, setDocsList] = useState(() => DocumentVaultService.listDocuments());
  const [attestationsList, setAttestationsList] = useState(() => DocumentVaultService.listAttestations());
  const [artsList, setArtsList] = useState(() => DocumentVaultService.listARTs());
  const [catsList, setCatsList] = useState(() => DocumentVaultService.listCATs());
  const [personnelList, setPersonnelList] = useState(() => DocumentVaultService.listPersonnel());
  const [equipmentList, setEquipmentList] = useState(() => DocumentVaultService.listEquipment());
  const [auditLogs, setAuditLogs] = useState(() => DocumentVaultService.listAuditLogs());

  // Modal de Upload Inteligente com Preview (Item 10)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(1); // 1 = Arquivo, 2 = Extração IA & Preview, 3 = Confirmado
  const [uploadFormData, setUploadFormData] = useState({
    companyId: 'excelencia-ambiental',
    name: 'Certidao_Estadual_PE_2026.pdf',
    category: DocumentCategory.FISCAL,
    subCategory: DocumentSubCategory.CERTIDAO_ESTADUAL,
    description: 'Certidão Negativa de Débitos Estaduais da Fazenda de Pernambuco.',
    issuer: 'Secretaria da Fazenda de Pernambuco (SEFAZ-PE)',
    documentNumber: 'SEFAZ-PE-2026-9921',
    issueDate: '01/10/2026',
    expiryDate: '31/03/2027',
    extractedConfidence: '98% (Alta Fidelidade)',
    tags: ['Estadual', 'SEFAZ', 'PE']
  });

  // Modal de Visualizador de Documento
  const [viewingDoc, setViewingDoc] = useState(null);

  // Assistente IA do Cofre Documental (Item 47 e 48)
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'assistant',
      text: 'Olá! Sou o Assistente Especialista do Cofre Documental do Vellia Licitações. Posso verificar validades de certidões, atestados para licitações, ARTs vinculadas, responsáveis técnicos e calibrações de equipamentos. O que você gostaria de consultar?'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Recarregar dados
  const reloadData = () => {
    setDocsList(DocumentVaultService.listDocuments());
    setAttestationsList(DocumentVaultService.listAttestations());
    setArtsList(DocumentVaultService.listARTs());
    setCatsList(DocumentVaultService.listCATs());
    setPersonnelList(DocumentVaultService.listPersonnel());
    setEquipmentList(DocumentVaultService.listEquipment());
    setAuditLogs(DocumentVaultService.listAuditLogs());
  };

  // Relatório de Saúde Documental (Itens 44, 45, 46)
  const healthReport = useMemo(() => {
    return DocumentVaultService.getDocumentHealthReport(selectedCompany);
  }, [selectedCompany, docsList]);

  // Matriz de Capacidade
  const capabilityMatrix = useMemo(() => {
    return DocumentVaultService.getCapabilityMatrix();
  }, [attestationsList, personnelList, equipmentList, docsList]);

  // Pendências de Habilitação (Item 40)
  const pendingIssues = useMemo(() => {
    return DocumentVaultService.getPendingIssuesList();
  }, [docsList, equipmentList]);

  // Filtragem dos Documentos
  const filteredDocs = useMemo(() => {
    return docsList.filter(d => {
      if (selectedCompany !== 'ALL' && d.companyId !== selectedCompany) return false;
      if (filterCategory !== 'ALL' && d.category !== filterCategory) return false;
      if (filterStatus !== 'ALL' && d.calculatedStatus !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = d.name?.toLowerCase().includes(q);
        const matchNum = d.documentNumber?.toLowerCase().includes(q);
        const matchIssuer = d.issuer?.toLowerCase().includes(q);
        const matchDesc = d.description?.toLowerCase().includes(q);
        const matchTags = d.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchNum && !matchIssuer && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [docsList, selectedCompany, filterCategory, filterStatus, searchQuery]);

  // Filtragem de Atestados
  const filteredAttestations = useMemo(() => {
    return attestationsList.filter(a => {
      if (selectedCompany !== 'ALL' && a.companyId !== selectedCompany) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchClient = a.client?.toLowerCase().includes(q);
        const matchObj = a.object?.toLowerCase().includes(q);
        const matchServ = a.serviceDescription?.toLowerCase().includes(q);
        if (!matchClient && !matchObj && !matchServ) return false;
      }
      return true;
    });
  }, [attestationsList, selectedCompany, searchQuery]);

  // Enviar pergunta ao Assistente IA
  const handleSendChat = (textToSend) => {
    const q = textToSend || chatInput;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const resp = DocumentVaultService.askDocumentVault(q);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: resp.answer,
          sources: resp.sources
        }
      ]);
      setIsTyping(false);
    }, 550);
  };

  // Salvar documento após preview humano (Item 10)
  const handleConfirmUpload = (e) => {
    e.preventDefault();
    DocumentVaultService.addDocument(uploadFormData, 'Carlos Silveira (Licitações)');
    setShowUploadModal(false);
    setUploadStep(1);
    reloadData();
  };

  // Helper de badges
  const getStatusBadge = (status) => {
    switch (status) {
      case DocumentStatus.VALIDO:
        return <span className="vault-status-pill pill-valido"><CheckCircle2 size={12} /> Válido</span>;
      case DocumentStatus.ATENCAO:
        return <span className="vault-status-pill pill-atencao"><Clock size={12} /> Atenção (Vence em breve)</span>;
      case DocumentStatus.VENCE_EM_BREVE:
        return <span className="vault-status-pill pill-vence-breve"><AlertTriangle size={12} /> Vence em &lt; 15 dias</span>;
      case DocumentStatus.VENCIDO:
        return <span className="vault-status-pill pill-vencido"><XCircle size={12} /> Vencido</span>;
      case DocumentStatus.SEM_VALIDADE:
        return <span className="vault-status-pill pill-sem-val"><Info size={12} /> Sem Validade</span>;
      default:
        return <span className="vault-status-pill">{status}</span>;
    }
  };

  const getStrengthBadge = (tier) => {
    if (tier.includes('Muito forte')) {
      return <span className="strength-badge tier-muito-forte"><Award size={13} /> {tier}</span>;
    }
    if (tier.includes('Forte')) {
      return <span className="strength-badge tier-forte"><Check size={13} /> {tier}</span>;
    }
    return <span className="strength-badge tier-moderado">{tier}</span>;
  };

  return (
    <div className="document-vault-view">
      
      {/* CABEÇALHO EXECUTIVO & SELEÇÃO DE EMPRESA */}
      <header className="vault-header">
        <div className="vh-left">
          <div className="vh-badge-tag">
            <FolderLock size={14} />
            <span>BANCO INTELIGENTE DE CAPACIDADE & DOCUMENTOS • FASE 9</span>
          </div>
          <h2 className="vh-title">Cofre Documental, Atestados e Certidões</h2>
          <p className="vh-sub">
            Gestão unificada de documentos jurídicos, fiscais, técnicos, acervo de atestados, ARTs/CATs, equipe e calibração de instrumentos.
          </p>
        </div>

        <div className="vh-right">
          {/* Seletor de Empresa (Item 1) */}
          <div className="company-toggle-wrap">
            <span className="toggle-lbl">Empresa Ativa:</span>
            <div className="company-buttons-group">
              <button 
                className={`btn-company-tab ${selectedCompany === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCompany('ALL')}
              >
                Todas as Empresas
              </button>
              <button 
                className={`btn-company-tab ${selectedCompany === 'excelencia-ambiental' ? 'active' : ''}`}
                onClick={() => setSelectedCompany('excelencia-ambiental')}
              >
                Excelência Ambiental
              </button>
              <button 
                className={`btn-company-tab ${selectedCompany === 'veeluen-solutions' ? 'active' : ''}`}
                onClick={() => setSelectedCompany('veeluen-solutions')}
              >
                Veeluen Solutions
              </button>
            </div>
          </div>

          <button className="btn-vault-upload" onClick={() => { setUploadStep(1); setShowUploadModal(true); }}>
            <Upload size={14} />
            <span>Upload com Extração IA</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD DE DOCUMENTAÇÃO & SEMÁFORO DE SAÚDE (ITENS 7, 44, 45, 46) */}
      <section className="vault-dashboard-strip">
        <div className={`health-semaphore-card semaforo-${healthReport.semaphore.toLowerCase()}`}>
          <div className="hsc-icon-row">
            <div className="semaphore-circle" />
            <span className="hsc-title">Semáforo Documental: <strong>{healthReport.semaphore}</strong></span>
          </div>
          <div className="hsc-score-val">{healthReport.healthPercentage}%</div>
          <p className="hsc-text">{healthReport.semaphoreText}</p>
        </div>

        {/* 6 Cards Métricos (Item 7) */}
        <div className="vault-metric-card">
          <span className="vmc-lbl">Documentos Válidos</span>
          <span className="vmc-val text-teal">{healthReport.valid}</span>
          <span className="vmc-sub">Total de {healthReport.total} indexados</span>
        </div>

        <div className="vault-metric-card">
          <span className="vmc-lbl">Vencendo em 30 Dias</span>
          <span className="vmc-val text-amber">{healthReport.expiring30d}</span>
          <span className="vmc-sub">Requerem atenção preventiva</span>
        </div>

        <div className="vault-metric-card">
          <span className="vmc-lbl">Vencendo em 7 Dias</span>
          <span className="vmc-val text-critical">{healthReport.expiring7d}</span>
          <span className="vmc-sub">Prioridade imediata</span>
        </div>

        <div className="vault-metric-card">
          <span className="vmc-lbl">Documentos Vencidos</span>
          <span className="vmc-val text-red">{healthReport.expired}</span>
          <span className="vmc-sub">Impedem participação</span>
        </div>

        <div className="vault-metric-card">
          <span className="vmc-lbl">Atestados de Capacidade</span>
          <span className="vmc-val text-blue">{attestationsList.length}</span>
          <span className="vmc-sub">{healthReport.strongAttestations} com Força &gt; 75%</span>
        </div>

        <div className="vault-metric-card">
          <span className="vmc-lbl">ARTs Registradas</span>
          <span className="vmc-val text-purple">{healthReport.totalArts}</span>
          <span className="vmc-sub">Vinculadas a contratos e CATs</span>
        </div>
      </section>

      {/* NAVEGAÇÃO ENTRE ABAS DO COFRE (ITEM 41) */}
      <nav className="vault-nav-tabs">
        <button 
          className={`vtab-btn ${activeTab === 'documentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('documentos')}
        >
          <FolderLock size={15} />
          <span>1. Documentos ({filteredDocs.length})</span>
        </button>

        <button 
          className={`vtab-btn ${activeTab === 'atestados' ? 'active' : ''}`}
          onClick={() => setActiveTab('atestados')}
        >
          <Award size={15} />
          <span>2. Atestados Técnicos ({filteredAttestations.length})</span>
        </button>

        <button 
          className={`vtab-btn ${activeTab === 'arts' ? 'active' : ''}`}
          onClick={() => setActiveTab('arts')}
        >
          <FileSignature size={15} />
          <span>3. ARTs & CATs ({artsList.length})</span>
        </button>

        <button 
          className={`vtab-btn ${activeTab === 'equipe' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipe')}
        >
          <Users size={15} />
          <span>4. Equipe Técnica ({personnelList.length})</span>
        </button>

        <button 
          className={`vtab-btn ${activeTab === 'equipamentos' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipamentos')}
        >
          <Wrench size={15} />
          <span>5. Equipamentos & RBC ({equipmentList.length})</span>
        </button>

        <button 
          className={`vtab-btn ${activeTab === 'matriz' ? 'active' : ''}`}
          onClick={() => setActiveTab('matriz')}
        >
          <TrendingUp size={15} />
          <span>6. Matriz de Capacidade</span>
        </button>

        <button 
          className={`vtab-btn ${activeTab === 'pendencias' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendencias')}
        >
          <AlertTriangle size={15} />
          <span>7. O que está faltando?</span>
          {pendingIssues.length > 0 && (
            <span className="vtab-alert-pill">{pendingIssues.length}</span>
          )}
        </button>

        <button 
          className={`vtab-btn ${activeTab === 'assistente' ? 'active' : ''}`}
          onClick={() => setActiveTab('assistente')}
        >
          <Sparkles size={15} />
          <span>8. IA Documental</span>
        </button>

        <button 
          className={`vtab-btn ${activeTab === 'auditoria' ? 'active' : ''}`}
          onClick={() => setActiveTab('auditoria')}
        >
          <History size={15} />
          <span>9. Auditoria & Logs</span>
        </button>
      </nav>

      {/* CORPO PRINCIPAL COM CONTEÚDO DAS ABAS */}
      <main className="vault-content-body">
        
        {/* ABA 1: DOCUMENTOS (JURÍDICOS, FISCAIS, ECONÔMICOS, SST) */}
        {activeTab === 'documentos' && (
          <div className="tab-pane-docs">
            {/* Toolbar de Busca e Filtros (Itens 8 e 9) */}
            <div className="vault-filter-toolbar">
              <div className="vft-search-box">
                <Search size={15} className="vft-search-icon" />
                <input 
                  type="text" 
                  placeholder="Buscar documento por nome, número, órgão emissor, tags ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="vft-dropdowns">
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="vft-select"
                >
                  <option value="ALL">Todas as Categorias</option>
                  {Object.values(DocumentCategory).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="vft-select"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value={DocumentStatus.VALIDO}>Válidos</option>
                  <option value={DocumentStatus.ATENCAO}>Atenção (16–30d)</option>
                  <option value={DocumentStatus.VENCE_EM_BREVE}>Vence em Breve (&lt;15d)</option>
                  <option value={DocumentStatus.VENCIDO}>Vencidos</option>
                  <option value={DocumentStatus.SEM_VALIDADE}>Sem Validade Definida</option>
                </select>
              </div>
            </div>

            {/* Tabela Estruturada de Documentos */}
            <div className="vault-table-container">
              <table className="vault-main-table">
                <thead>
                  <tr>
                    <th>Documento & Empresa</th>
                    <th>Categoria / Subcategoria</th>
                    <th>Órgão Emissor & Número</th>
                    <th style={{ width: '130px' }}>Data de Validade</th>
                    <th style={{ width: '140px' }}>Status</th>
                    <th style={{ width: '90px' }}>Versão</th>
                    <th style={{ width: '120px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-vault-cell">
                        Nenhum documento localizado com os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="vault-doc-row">
                        <td>
                          <div className="vdr-title-box">
                            <FileText size={18} className="text-teal" />
                            <div>
                              <strong>{doc.name}</strong>
                              <span className="vdr-company-sub">{doc.companyName} • {doc.fileSize}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="vdr-cat-box">
                            <span className="vdr-cat-badge">{doc.category}</span>
                            <span className="vdr-subcat-text">{doc.subCategory}</span>
                          </div>
                        </td>

                        <td>
                          <div className="vdr-issuer-box">
                            <span>{doc.issuer}</span>
                            <span className="vdr-num-mono">{doc.documentNumber}</span>
                          </div>
                        </td>

                        <td>
                          <div className="vdr-expiry-box">
                            <strong>{doc.expiryDate || 'Sem vencimento'}</strong>
                            {doc.daysUntilExpiry !== null && (
                              <span className={`days-pill ${doc.daysUntilExpiry <= 15 ? 'pill-urgent' : 'pill-ok'}`}>
                                {doc.daysUntilExpiry < 0 ? `${Math.abs(doc.daysUntilExpiry)}d vencido` : `${doc.daysUntilExpiry}d restantes`}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          {getStatusBadge(doc.calculatedStatus)}
                        </td>

                        <td>
                          <span className="ver-pill">{doc.version}</span>
                        </td>

                        <td>
                          <div className="vdr-actions">
                            <button 
                              className="btn-vdr-view" 
                              onClick={() => setViewingDoc(doc)}
                              title="Visualizar documento completo"
                            >
                              <Eye size={13} />
                              <span>Ver</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 2: ATESTADOS DE CAPACIDADE TÉCNICA (ITENS 15 A 24) */}
        {activeTab === 'atestados' && (
          <div className="tab-pane-atestados">
            <div className="pane-header-actions">
              <div>
                <h3>Acervo Estruturado de Atestados de Capacidade Técnica</h3>
                <p className="pane-sub">
                  Comprovação de serviços contínuos, volumes, ARTs vinculadas e score de qualidade técnica para participação em licitações.
                </p>
              </div>
            </div>

            <div className="attestations-grid">
              {filteredAttestations.map((att) => (
                <div key={att.id} className="attestation-vault-card">
                  <div className="avc-top">
                    <div className="avc-client-info">
                      <span className="avc-company-owner">{att.companyName}</span>
                      <h4>{att.client}</h4>
                      <span className="avc-cnpj">CNPJ Contratante: {att.clientCnpj}</span>
                    </div>

                    <div className="avc-strength-box">
                      <div className="avc-score-num">{att.qualityScore}%</div>
                      <span className="avc-score-lbl">Força do Atestado</span>
                      {getStrengthBadge(att.qualityTier)}
                    </div>
                  </div>

                  <p className="avc-object">
                    <strong>Objeto:</strong> {att.object}
                  </p>

                  <div className="avc-service-desc-box">
                    <strong>Descrição dos Serviços Comprovados:</strong>
                    <p>{att.serviceDescription}</p>
                  </div>

                  <div className="avc-metrics-row">
                    <div className="amr-item">
                      <span className="amr-lbl">Período Comprovado:</span>
                      <span className="amr-val">{att.durationMonths} meses ({att.startDate} a {att.endDate})</span>
                    </div>
                    <div className="amr-item">
                      <span className="amr-lbl">Volume Executado:</span>
                      <span className="amr-val">{att.quantity} {att.unit} ({att.hours}h)</span>
                    </div>
                    <div className="amr-item">
                      <span className="amr-lbl">Local de Execução:</span>
                      <span className="amr-val">{att.location}</span>
                    </div>
                  </div>

                  {/* Vínculo Bidirecional: ART, Responsável e CAT (Itens 25, 26, 27) */}
                  <div className="avc-vinculos-strip">
                    <div className="vinculo-chip">
                      <FileSignature size={12} className="text-teal" />
                      <span>ART: <strong>{att.artNumber}</strong></span>
                    </div>
                    <div className="vinculo-chip">
                      <Award size={12} className="text-purple" />
                      <span>CAT: <strong>{att.catNumber}</strong></span>
                    </div>
                    <div className="vinculo-chip">
                      <Users size={12} className="text-blue" />
                      <span>Resp. Técnico: <strong>{att.responsibleTechnical} ({att.creaRegistration})</strong></span>
                    </div>
                  </div>

                  {/* Serviços do Catálogo Relacionados (Item 17) */}
                  <div className="avc-services-tags">
                    <span className="ast-lbl">Serviços Vinculados no Catálogo:</span>
                    <div className="ast-chips-list">
                      {att.relatedServices?.map((srv, sIdx) => (
                        <span key={sIdx} className="service-tag-pill">{srv}</span>
                      ))}
                    </div>
                  </div>

                  <div className="avc-footer">
                    <span className="avc-audited-text">
                      <CheckCircle2 size={12} className="text-emerald" /> Revisado manualmente por {att.reviewedBy}
                    </span>
                    <button 
                      className="btn-view-att-doc"
                      onClick={() => setViewingDoc({
                        name: att.fileName,
                        companyName: att.companyName,
                        category: DocumentCategory.TECNICO,
                        subCategory: DocumentSubCategory.ATESTADO_CAPACIDADE,
                        description: att.object,
                        issuer: att.client,
                        documentNumber: att.id,
                        extractedText: att.serviceDescription,
                        fileSize: att.fileSize,
                        version: 'v1.0'
                      })}
                    >
                      <Eye size={12} />
                      <span>Ver Documento</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: ARTs & CATs (ITENS 25, 26, 27) */}
        {activeTab === 'arts' && (
          <div className="tab-pane-arts">
            <div className="pane-header-actions">
              <div>
                <h3>Anotações de Responsabilidade Técnica (ART) e CATs</h3>
                <p className="pane-sub">
                  Vínculos formais registrados no CREA conectando atestados, responsáveis técnicos e contratos executados.
                </p>
              </div>
            </div>

            <div className="arts-table-wrap">
              <table className="vault-main-table">
                <thead>
                  <tr>
                    <th>Número da ART</th>
                    <th>Empresa & Responsável Técnico</th>
                    <th>CREA / Registro</th>
                    <th>Objeto da Anotação</th>
                    <th>Atestado Vinculado</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {artsList.map((art) => (
                    <tr key={art.number}>
                      <td>
                        <div className="art-num-cell">
                          <FileSignature size={16} className="text-teal" />
                          <strong>{art.number}</strong>
                        </div>
                      </td>

                      <td>
                        <div>
                          <strong>{art.responsibleTechnical}</strong>
                          <span className="company-sub-tag">{art.companyName}</span>
                        </div>
                      </td>

                      <td>
                        <span className="crea-pill">{art.crea}</span>
                      </td>

                      <td>
                        <p className="art-obj-desc">{art.object}</p>
                      </td>

                      <td>
                        <span className="art-linked-atest">
                          <LinkIcon size={11} /> {art.certificateRelatedId}
                        </span>
                      </td>

                      <td>
                        <span className="art-status-badge">{art.status}</span>
                      </td>

                      <td>
                        <button 
                          className="btn-vdr-view"
                          onClick={() => setViewingDoc({
                            name: art.fileName,
                            companyName: art.companyName,
                            category: DocumentCategory.TECNICO,
                            subCategory: DocumentSubCategory.ART,
                            description: art.object,
                            issuer: 'CREA Regional',
                            documentNumber: art.number,
                            extractedText: art.object,
                            fileSize: art.fileSize,
                            version: 'v1.0'
                          })}
                        >
                          <Eye size={12} />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4: EQUIPE TÉCNICA & RESPONSÁVEIS (ITENS 28, 29, 30) */}
        {activeTab === 'equipe' && (
          <div className="tab-pane-equipe">
            <div className="pane-header-actions">
              <div>
                <h3>Quadro de Responsáveis Técnicos e Especialistas</h3>
                <p className="pane-sub">
                  Profissionais habilitados no CREA/CRQ com certificações de segurança (NR-10, NR-13, NR-33, NR-35) e currículos cadastrados.
                </p>
              </div>
            </div>

            <div className="personnel-grid">
              {personnelList.map((prof) => (
                <div key={prof.id} className="personnel-card">
                  <div className="pc-header">
                    <div className="pc-avatar">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4>{prof.name}</h4>
                      <span className="pc-role">{prof.role}</span>
                      <span className="pc-company">{prof.companyName}</span>
                    </div>
                  </div>

                  <div className="pc-reg-badge">
                    <span>Registro: <strong>{prof.registration}</strong></span>
                  </div>

                  <p className="pc-resume">"{prof.resume}"</p>

                  <div className="pc-certifications-box">
                    <span className="pc-cert-title">Certificações de Segurança & NRs:</span>
                    <div className="cert-chips-list">
                      {prof.certifications?.map((c, idx) => (
                        <div key={idx} className="cert-item-chip">
                          <ShieldCheck size={12} className="text-emerald" />
                          <span>{c.name} — Vence: {c.expiryDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pc-availability-strip">
                    <CheckCircle2 size={13} className="text-teal" />
                    <span>{prof.availability}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 5: EQUIPAMENTOS & CALIBRAÇÃO RBC (ITENS 31, 32, 33) */}
        {activeTab === 'equipamentos' && (
          <div className="tab-pane-equipamentos">
            <div className="pane-header-actions">
              <div>
                <h3>Instrumentação & Certificados de Calibração RBC/Inmetro</h3>
                <p className="pane-sub">
                  Equipamentos específicos para medições ambientais, laudos e amostragem de chaminé com controle rigoroso de validade.
                </p>
              </div>
            </div>

            <div className="equipment-grid">
              {equipmentList.map((eq) => (
                <div key={eq.id} className="equipment-vault-card">
                  <div className="eqc-top">
                    <div className="eqc-icon">
                      <Wrench size={18} />
                    </div>
                    <div className="eqc-name-box">
                      <h4>{eq.name}</h4>
                      <span className="eqc-model">{eq.manufacturer} • {eq.model}</span>
                      <span className="eqc-serial">Nº Série: {eq.serialNumber}</span>
                    </div>
                  </div>

                  <div className="eqc-calib-box">
                    <div className="ecb-row">
                      <span>Última Calibração:</span>
                      <strong>{eq.lastCalibrationDate}</strong>
                    </div>
                    <div className="ecb-row">
                      <span>Próxima Calibração:</span>
                      <strong className={eq.status?.includes('vence em breve') ? 'text-amber' : 'text-teal'}>
                        {eq.nextCalibrationDate}
                      </strong>
                    </div>
                    <div className="ecb-cert-info">
                      <Award size={12} className="text-teal" />
                      <span>{eq.calibrationCertificate}</span>
                    </div>
                  </div>

                  <div className="eqc-services-list">
                    <span className="esl-lbl">Serviços que utilizam este instrumento:</span>
                    <div className="esl-chips">
                      {eq.relatedServices?.map((s, idx) => (
                        <span key={idx} className="equip-serv-pill">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="eqc-footer">
                    <span className={`eq-status-badge ${eq.status?.includes('vence em breve') ? 'badge-warn' : 'badge-ok'}`}>
                      {eq.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 6: MATRIZ DE CAPACIDADE TÉCNICA (ITENS 34, 35, 36) */}
        {activeTab === 'matriz' && (
          <div className="tab-pane-matriz">
            <div className="pane-header-actions">
              <div>
                <h3>Matriz de Aptidão e Capability Score por Serviço</h3>
                <p className="pane-sub">
                  Cruzamento automático entre o catálogo de serviços, acervo de atestados, profissionais habilitados e equipamentos em calibração.
                </p>
              </div>
            </div>

            <div className="matrix-table-wrap">
              <table className="vault-main-table">
                <thead>
                  <tr>
                    <th>Serviço do Catálogo</th>
                    <th>Empresa Responsável</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Atestados</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Responsáveis</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Equipamentos</th>
                    <th>Documentação</th>
                    <th style={{ width: '150px' }}>Capability Score</th>
                    <th style={{ width: '140px' }}>Aptidão Geral</th>
                  </tr>
                </thead>
                <tbody>
                  {capabilityMatrix.map((item) => (
                    <tr key={item.serviceId}>
                      <td>
                        <strong>{item.serviceName}</strong>
                        <span className="matrix-cat-sub">{item.category}</span>
                      </td>

                      <td>
                        <span className="company-badge-pill">{item.companyName}</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="count-pill-green">{item.attestationsCount} atestados</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="count-pill-blue">{item.teamCount} técnicos</span>
                      </td>

                      <td style={{ textAlign: 'center' }}>
                        <span className="count-pill-purple">{item.equipmentCount} itens</span>
                      </td>

                      <td>
                        <span className="doc-check-tag">
                          <CheckCircle2 size={12} className="text-emerald" /> {item.documentationStatus}
                        </span>
                      </td>

                      <td>
                        <div className="matrix-score-bar">
                          <span className="msb-val">{item.capabilityScore}%</span>
                          <div className="msb-track">
                            <div className="msb-fill" style={{ width: `${item.capabilityScore}%` }} />
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`aptidao-badge ${item.status === 'APTIDÃO ALTA' ? 'apt-alta' : 'apt-media'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 7: O QUE ESTÁ FALTANDO? (PENDÊNCIAS PRIORIZADAS - ITEM 40) */}
        {activeTab === 'pendencias' && (
          <div className="tab-pane-pendencias">
            <div className="pane-header-actions">
              <div>
                <h3>Pendências de Documentação para Participação em Licitações</h3>
                <p className="pane-sub">
                  Painel de pendências ordenado por criticidade para evitar inabilitação de propostas em certames públicos.
                </p>
              </div>
            </div>

            <div className="pending-issues-list">
              {pendingIssues.map((issue) => (
                <div key={issue.id} className={`issue-card issue-border-${issue.severity.toLowerCase()}`}>
                  <div className="ic-header">
                    <span className={`issue-sev-tag sev-${issue.severity.toLowerCase()}`}>
                      {issue.severity === IssueSeverity.CRITICO && <Flame size={12} />}
                      {issue.severity === IssueSeverity.ALTO && <AlertTriangle size={12} />}
                      {issue.severity}
                    </span>
                    <span className="ic-company">{issue.company} • {issue.category}</span>
                  </div>

                  <h4 className="ic-title">{issue.title}</h4>
                  
                  <div className="ic-action-box">
                    <strong>Ação Obrigatória:</strong>
                    <p>{issue.action}</p>
                  </div>

                  <div className="ic-footer">
                    <span className="ic-deadline">Prazo Recomendado: <strong>{issue.deadline}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 8: IA DOCUMENTAL (ASSISTENTE DO COFRE - ITENS 47 E 48) */}
        {activeTab === 'assistente' && (
          <div className="tab-pane-assistente">
            <div className="chat-vault-box">
              <div className="cvb-header">
                <div className="cvb-title">
                  <Sparkles size={16} className="text-teal" />
                  <h4>Assistente de Inteligência do Cofre Documental</h4>
                </div>
                <span className="cvb-grounding-tag">
                  <ShieldCheck size={12} /> Respostas estritas no acervo cadastrado (Sem alucinação)
                </span>
              </div>

              {/* Mensagens */}
              <div className="cvb-messages-stream">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`cvb-message-row ${msg.sender === 'user' ? 'msg-user' : 'msg-assistant'}`}>
                    <div className="cvb-bubble">
                      <p>{msg.text}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="cvb-sources">
                          <span className="cs-lbl">Documentos Auditados:</span>
                          {msg.sources.map((s, sIdx) => (
                            <span key={sIdx} className="cs-tag">{s.name} ({s.type})</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="cvb-message-row msg-assistant">
                    <div className="cvb-bubble typing-bubble">
                      <span>Varrendo certidões, atestados e registros do cofre...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões Rápidos de Perguntas Típicas (Item 47) */}
              <div className="quick-vault-questions">
                <button onClick={() => handleSendChat('Temos atestado de isocinética?')}>
                  Temos atestado de isocinética?
                </button>
                <button onClick={() => handleSendChat('Qual certidão vence primeiro?')}>
                  Qual certidão vence primeiro?
                </button>
                <button onClick={() => handleSendChat('Temos ART relacionada a ETE?')}>
                  Temos ART relacionada a ETE?
                </button>
                <button onClick={() => handleSendChat('Existe algum equipamento com calibração vencida?')}>
                  Calibração de equipamentos?
                </button>
                <button onClick={() => handleSendChat('Quem são nossos responsáveis técnicos no CREA?')}>
                  Responsáveis técnicos CREA?
                </button>
              </div>

              {/* Barra de Envio */}
              <div className="cvb-input-bar">
                <input 
                  type="text" 
                  placeholder="Pergunte qualquer dúvida sobre atestados, certidões ou equipamentos..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                />
                <button className="btn-send-vault" onClick={() => handleSendChat()} disabled={!chatInput.trim()}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ABA 9: AUDITORIA & LOGS (ITEM 43) */}
        {activeTab === 'auditoria' && (
          <div className="tab-pane-auditoria">
            <div className="pane-header-actions">
              <div>
                <h3>Trilha de Auditoria e Histórico de Ações</h3>
                <p className="pane-sub">
                  Rastreabilidade completa de uploads, alterações, substituições e validações de documentos corporativos.
                </p>
              </div>
            </div>

            <div className="audit-timeline-list">
              {auditLogs.map((log) => (
                <div key={log.id} className="audit-timeline-item">
                  <div className="atl-time">{log.formattedTime}</div>
                  <div className="atl-content">
                    <strong>{log.action} — por {log.user}</strong>
                    <p>{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* MODAL DE UPLOAD INTELIGENTE COM EXTRAÇÃO E CONFIRMAÇÃO (ITEM 10) */}
      {showUploadModal && (
        <div className="vault-modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="vault-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vmc-header">
              <div className="vmc-title-box">
                <Sparkles size={16} className="text-teal" />
                <h4>Upload Inteligente com Extração Automática de Metadados</h4>
              </div>
              <button className="vmc-close" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>

            <form onSubmit={handleConfirmUpload} className="vmc-form">
              {uploadStep === 1 && (
                <div className="step-dropzone-box">
                  <Upload size={32} className="text-teal" />
                  <h4>Selecione o arquivo (PDF, DOC, DOCX)</h4>
                  <p>O pipeline Vellia extrairá automaticamente número, datas de emissão/validade e órgão emissor.</p>
                  <input 
                    type="file" 
                    id="docFileInput" 
                    className="file-input-hidden" 
                    onChange={() => setUploadStep(2)}
                  />
                  <button 
                    type="button" 
                    className="btn-select-file"
                    onClick={() => setUploadStep(2)}
                  >
                    Simular Envio do Documento (SEFAZ-PE)
                  </button>
                </div>
              )}

              {uploadStep === 2 && (
                <div className="step-preview-box">
                  <div className="preview-alert-banner">
                    <CheckCircle2 size={16} className="text-emerald" />
                    <span><strong>Extração Concluída:</strong> Revise e ajuste os dados extraídos antes de confirmar no cofre.</span>
                  </div>

                  <div className="preview-fields-grid">
                    <div className="pfg-field">
                      <label>Empresa Pertencente:</label>
                      <select 
                        value={uploadFormData.companyId}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, companyId: e.target.value })}
                      >
                        <option value="excelencia-ambiental">Excelência Ambiental</option>
                        <option value="veeluen-solutions">Veeluen Solutions</option>
                      </select>
                    </div>

                    <div className="pfg-field">
                      <label>Nome do Arquivo:</label>
                      <input 
                        type="text" 
                        value={uploadFormData.name}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="pfg-field">
                      <label>Categoria:</label>
                      <select 
                        value={uploadFormData.category}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                      >
                        {Object.values(DocumentCategory).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pfg-field">
                      <label>Subcategoria:</label>
                      <input 
                        type="text" 
                        value={uploadFormData.subCategory}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, subCategory: e.target.value })}
                      />
                    </div>

                    <div className="pfg-field">
                      <label>Órgão Emissor:</label>
                      <input 
                        type="text" 
                        value={uploadFormData.issuer}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, issuer: e.target.value })}
                      />
                    </div>

                    <div className="pfg-field">
                      <label>Número do Registro / Certidão:</label>
                      <input 
                        type="text" 
                        value={uploadFormData.documentNumber}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, documentNumber: e.target.value })}
                      />
                    </div>

                    <div className="pfg-field">
                      <label>Data de Emissão:</label>
                      <input 
                        type="text" 
                        value={uploadFormData.issueDate}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, issueDate: e.target.value })}
                      />
                    </div>

                    <div className="pfg-field">
                      <label>Data de Validade (Vencimento):</label>
                      <input 
                        type="text" 
                        value={uploadFormData.expiryDate}
                        onChange={(e) => setUploadFormData({ ...uploadFormData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="vmc-actions">
                    <button type="button" className="btn-vmc-cancel" onClick={() => setShowUploadModal(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn-vmc-confirm">
                      <Check size={14} />
                      <span>Confirmar e Indexar no Cofre</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO DE DOCUMENTO */}
      {viewingDoc && (
        <div className="vault-modal-backdrop" onClick={() => setViewingDoc(null)}>
          <div className="vault-modal-card vmc-doc-detail" onClick={(e) => e.stopPropagation()}>
            <div className="vmc-header">
              <div className="vmc-title-box">
                <FileText size={16} className="text-teal" />
                <h4>{viewingDoc.name}</h4>
              </div>
              <button className="vmc-close" onClick={() => setViewingDoc(null)}>✕</button>
            </div>

            <div className="doc-detail-body">
              <div className="ddb-meta-grid">
                <div><span>Empresa:</span> <strong>{viewingDoc.companyName}</strong></div>
                <div><span>Categoria:</span> <strong>{viewingDoc.category} ({viewingDoc.subCategory})</strong></div>
                <div><span>Órgão Emissor:</span> <strong>{viewingDoc.issuer}</strong></div>
                <div><span>Número:</span> <strong>{viewingDoc.documentNumber}</strong></div>
                <div><span>Validade:</span> <strong>{viewingDoc.expiryDate || 'Sem validade definida'}</strong></div>
                <div><span>Tamanho:</span> <strong>{viewingDoc.fileSize}</strong></div>
              </div>

              <div className="ddb-text-box">
                <span className="dtb-lbl">Texto Integral Transcrito (OCR / Extração de Texto):</span>
                <p className="dtb-content">{viewingDoc.extractedText}</p>
              </div>

              {viewingDoc.hash && (
                <div className="ddb-hash-row">
                  <span>Hash Criptográfico SHA-256:</span>
                  <code>{viewingDoc.hash}</code>
                </div>
              )}
            </div>

            <div className="vmc-actions">
              <button className="btn-vmc-confirm" onClick={() => setViewingDoc(null)}>
                Fechar Visualizador
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
