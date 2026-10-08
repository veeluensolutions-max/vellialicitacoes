import React, { useState, useMemo } from 'react';
import { 
  FolderOpen, 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  ExternalLink, 
  Hash, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  Download
} from 'lucide-react';
import EditalDocumentRepository, { DocumentTypes } from '../services/edital/editalDocumentRepository';
import OpportunityService from '../services/opportunityService';
import './DocumentsManagementView.css';

export default function DocumentsManagementView({ onOpenEditalAnalysis }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedOppFilter, setSelectedOppFilter] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Formulário de Cadastro/Upload de Documento
  const [uploadForm, setUploadForm] = useState({
    opportunityId: '7004321234',
    name: '',
    type: DocumentTypes.EDITAL,
    source: 'Upload PDF',
    url: '',
    fileSize: '3.4 MB',
    pages: 24,
    version: 'v1.0'
  });

  const opportunitiesList = useMemo(() => OpportunityService.listAll(), []);

  // Obter todos os documentos associados a todas as oportunidades
  const [documentsList, setDocumentsList] = useState(() => {
    return EditalDocumentRepository.listAllDocuments();
  });

  const refreshDocs = () => {
    setDocumentsList(EditalDocumentRepository.listAllDocuments());
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.name || !uploadForm.opportunityId) return;

    EditalDocumentRepository.addDocument(uploadForm.opportunityId, {
      name: uploadForm.name,
      type: uploadForm.type,
      source: uploadForm.url ? 'URL Externa' : uploadForm.source,
      url: uploadForm.url,
      size: uploadForm.fileSize,
      pages: Number(uploadForm.pages) || 15,
      version: uploadForm.version || 'v1.0'
    });

    setShowUploadModal(false);
    setUploadForm({
      opportunityId: '7004321234',
      name: '',
      type: DocumentTypes.EDITAL,
      source: 'Upload PDF',
      url: '',
      fileSize: '3.4 MB',
      pages: 24,
      version: 'v1.0'
    });
    refreshDocs();
  };

  // Filtragem
  const filteredDocs = useMemo(() => {
    return documentsList.filter(doc => {
      if (selectedType !== 'ALL' && doc.type !== selectedType) return false;
      if (selectedOppFilter !== 'ALL' && doc.opportunityId !== selectedOppFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name?.toLowerCase().includes(q);
        const matchOpp = doc.opportunityNumber?.toLowerCase().includes(q) || doc.opportunityTitle?.toLowerCase().includes(q);
        const matchHash = doc.hash?.toLowerCase().includes(q);
        if (!matchName && !matchOpp && !matchHash) return false;
      }
      return true;
    });
  }, [documentsList, selectedType, selectedOppFilter, searchQuery]);

  return (
    <div className="docs-management-view">
      {/* HEADER DA PÁGINA */}
      <div className="docs-page-header">
        <div className="dph-left">
          <div className="dph-badge">
            <FolderOpen size={14} />
            <span>CENTRAL DE DOCUMENTAÇÃO DE EDITAIS • FASE 8</span>
          </div>
          <h2 className="dph-title">Gestão Documental & Arquivos de Licitações</h2>
          <p className="dph-sub">
            Repositório independente de Editais, Termos de Referência, Planilhas, Minutas e Erratas com integridade por Hash SHA-256 e versionamento.
          </p>
        </div>

        <div className="dph-actions">
          <button className="btn-upload-new-doc" onClick={() => setShowUploadModal(true)}>
            <Plus size={15} />
            <span>Novo Documento / Upload</span>
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMO DO ACERVO */}
      <div className="docs-stats-grid">
        <div className="doc-stat-card">
          <div className="dsc-icon icon-teal"><FolderOpen size={20} /></div>
          <div className="dsc-info">
            <span className="dsc-val">{documentsList.length}</span>
            <span className="dsc-lbl">Documentos Indexados</span>
          </div>
        </div>

        <div className="doc-stat-card">
          <div className="dsc-icon icon-blue"><FileText size={20} /></div>
          <div className="dsc-info">
            <span className="dsc-val">
              {documentsList.filter(d => d.type === DocumentTypes.EDITAL).length}
            </span>
            <span className="dsc-lbl">Editais Oficiais</span>
          </div>
        </div>

        <div className="doc-stat-card">
          <div className="dsc-icon icon-purple"><Layers size={20} /></div>
          <div className="dsc-info">
            <span className="dsc-val">
              {documentsList.filter(d => d.type === DocumentTypes.TERMO_REFERENCIA).length}
            </span>
            <span className="dsc-lbl">Termos de Referência</span>
          </div>
        </div>

        <div className="doc-stat-card">
          <div className="dsc-icon icon-amber"><ShieldCheck size={20} /></div>
          <div className="dsc-info">
            <span className="dsc-val">100%</span>
            <span className="dsc-lbl">Integridade SHA-256</span>
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS & BUSCA */}
      <div className="docs-filter-toolbar">
        <div className="docs-search-input-wrap">
          <Search size={15} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome do arquivo, número da oportunidade, título ou hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="docs-filters-group">
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="docs-select-filter"
          >
            <option value="ALL">Todos os Tipos</option>
            {Object.values(DocumentTypes).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select 
            value={selectedOppFilter} 
            onChange={(e) => setSelectedOppFilter(e.target.value)}
            className="docs-select-filter"
          >
            <option value="ALL">Todas as Oportunidades</option>
            {opportunitiesList.map(opp => (
              <option key={opp.id} value={opp.id}>
                {opp.number} — {opp.client}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABELA DE DOCUMENTOS */}
      <div className="docs-table-card">
        <table className="docs-inventory-table">
          <thead>
            <tr>
              <th>Documento & Origem</th>
              <th>Classificação</th>
              <th>Oportunidade Vinculada</th>
              <th style={{ width: '80px' }}>Versão</th>
              <th style={{ width: '90px' }}>Tamanho</th>
              <th>Hash Criptográfico (SHA-256)</th>
              <th style={{ width: '120px' }}>Data de Upload</th>
              <th style={{ width: '180px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-docs-row">
                  Nenhum documento encontrado com os critérios de filtro.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="doc-item-title-box">
                      <FileText size={18} className="text-teal" />
                      <div>
                        <strong>{doc.name}</strong>
                        <span className="doc-origin-text">Fonte: {doc.source} ({doc.pages} págs.)</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="doc-type-pill">{doc.type}</span>
                  </td>

                  <td>
                    <div className="doc-opp-link">
                      <span className="opp-num-bold">{doc.opportunityNumber}</span>
                      <span className="opp-title-truncate">{doc.opportunityTitle}</span>
                    </div>
                  </td>

                  <td>
                    <span className="doc-ver-badge">{doc.version}</span>
                  </td>

                  <td>{doc.size}</td>

                  <td>
                    <span className="doc-hash-text" title={doc.hash}>
                      {doc.hash?.substring(0, 14)}...
                    </span>
                  </td>

                  <td>{doc.uploadDate}</td>

                  <td style={{ textAlign: 'right' }}>
                    <div className="doc-actions-inline">
                      <button 
                        className="btn-action-analyze-edital"
                        onClick={() => onOpenEditalAnalysis && onOpenEditalAnalysis(doc.opportunityId)}
                        title="Abrir Análise Inteligente do Edital"
                      >
                        <Sparkles size={13} />
                        <span>Analisar Edital</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE UPLOAD DE NOVO ARQUIVO */}
      {showUploadModal && (
        <div className="upload-modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="umb-header">
              <h3>Upload & Classificação de Documento de Licitação</h3>
              <button className="umb-close" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} className="umb-form">
              <div className="umb-field">
                <label>Vincular à Oportunidade:</label>
                <select 
                  value={uploadForm.opportunityId}
                  onChange={(e) => setUploadForm({ ...uploadForm, opportunityId: e.target.value })}
                  required
                >
                  {opportunitiesList.map(opp => (
                    <option key={opp.id} value={opp.id}>
                      {opp.number} — {opp.client} ({opp.title})
                    </option>
                  ))}
                </select>
              </div>

              <div className="umb-field">
                <label>Nome do Arquivo / Título:</label>
                <input 
                  type="text" 
                  placeholder="Ex: Anexo_I_Especificacao_Tecnica_v2.pdf"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="umb-row-2">
                <div className="umb-field">
                  <label>Classificação Documental:</label>
                  <select 
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                  >
                    {Object.values(DocumentTypes).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="umb-field">
                  <label>Versão / Edição:</label>
                  <input 
                    type="text" 
                    value={uploadForm.version}
                    onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                  />
                </div>
              </div>

              <div className="umb-row-2">
                <div className="umb-field">
                  <label>Forma de Entrada / Origem:</label>
                  <select 
                    value={uploadForm.source}
                    onChange={(e) => setUploadForm({ ...uploadForm, source: e.target.value })}
                  >
                    <option value="Upload PDF">Upload PDF</option>
                    <option value="Upload DOCX">Upload DOC / DOCX</option>
                    <option value="URL de Documento">URL Externa de Documento</option>
                    <option value="Petronect Conector">Captura Direta Petronect</option>
                  </select>
                </div>

                <div className="umb-field">
                  <label>Tamanho do Arquivo:</label>
                  <input 
                    type="text" 
                    value={uploadForm.fileSize}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileSize: e.target.value })}
                  />
                </div>
              </div>

              {uploadForm.source === 'URL de Documento' && (
                <div className="umb-field">
                  <label>URL do Documento Oficial:</label>
                  <input 
                    type="url" 
                    placeholder="https://licitacoes.petronect.com.br/arquivos/..."
                    value={uploadForm.url}
                    onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                  />
                </div>
              )}

              <div className="umb-actions">
                <button type="button" className="btn-umb-cancel" onClick={() => setShowUploadModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-umb-confirm">
                  <Upload size={14} />
                  <span>Indexar no Repositório</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
