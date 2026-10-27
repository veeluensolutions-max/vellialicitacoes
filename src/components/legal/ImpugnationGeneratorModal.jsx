import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Building2, 
  ShieldCheck, 
  BookOpen, 
  Send, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Gavel,
  Zap,
  Info
} from 'lucide-react';
import { 
  ImpugnationGeneratorService, 
  PIECE_TYPES, 
  LEGAL_GROUNDS_CATALOG, 
  COMPANIES_DATA 
} from '../../services/legal/impugnationGeneratorService.js';
import { AiModelProviderService } from '../../services/ai/aiModelProviderService.js';
import './ImpugnationGeneratorModal.css';

export default function ImpugnationGeneratorModal({ 
  isOpen, 
  onClose, 
  opportunity,
  requirements = [] 
}) {
  const [companyKey, setCompanyKey] = useState('VEELUEN');
  const [pieceType, setPieceType] = useState(PIECE_TYPES.IMPUGNACAO);
  const [specificClause, setSpecificClause] = useState('Item 5.2 — Qualificação Técnica');
  const [selectedGroundIds, setSelectedGroundIds] = useState(['vedacao_somatorio_atestados']);
  const [customFacts, setCustomFacts] = useState('');
  const [generatedPiece, setGeneratedPiece] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Inicializa com detecção automática de vícios do edital
  useEffect(() => {
    if (isOpen && opportunity) {
      const detected = ImpugnationGeneratorService.detectPotentialFlaws(opportunity, requirements);
      if (detected.length > 0) {
        setSelectedGroundIds(detected.map(d => d.id));
      }
      
      // Ajusta empresa padrão com base no perfil da oportunidade
      if (opportunity.recommendedCompany?.toLowerCase().includes('excelência') || opportunity.client?.toLowerCase().includes('petrobras')) {
        setCompanyKey('EXCELENCIA');
      } else {
        setCompanyKey('VEELUEN');
      }

      setGeneratedPiece(null);
      setCopied(false);
    }
  }, [isOpen, opportunity, requirements]);

  if (!isOpen || !opportunity) return null;

  const handleToggleGround = (id) => {
    setSelectedGroundIds(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(item => item !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleGenerate = async (useAi = false) => {
    setIsGenerating(true);
    setCopied(false);

    try {
      if (useAi && AiModelProviderService.isConfigured()) {
        const result = await ImpugnationGeneratorService.generatePieceWithAI({
          pieceType,
          companyKey,
          opportunity,
          selectedGroundIds,
          customFacts,
          specificClause
        });
        setGeneratedPiece(result);
      } else {
        const result = ImpugnationGeneratorService.generatePiece({
          pieceType,
          companyKey,
          opportunity,
          selectedGroundIds,
          customFacts,
          specificClause
        });
        setGeneratedPiece(result);
      }
    } catch (err) {
      console.warn('[ImpugnationGeneratorModal] Erro ao gerar minuta:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPiece?.content) return;
    navigator.clipboard.writeText(generatedPiece.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!generatedPiece?.content) return;
    const blob = new Blob([generatedPiece.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedNumber = (opportunity.number || 'certame').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${generatedPiece.title.replace(/\s+/g, '_')}_${sanitizedNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isAiReady = AiModelProviderService.isConfigured();

  return (
    <div className="impugn-modal-overlay" onClick={onClose}>
      <div className="impugn-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Cabeçalho */}
        <div className="impugn-header">
          <div className="impugn-title-area">
            <div className="impugn-icon-badge">
              <Scale size={22} className="text-teal-400" />
            </div>
            <div>
              <h3>Gerador de Impugnações & Recursos Administrativos</h3>
              <p>Redação jurídica automatizada com base na Lei 14.133/21, Lei 13.303/16 e Súmulas do TCU</p>
            </div>
          </div>
          <button className="impugn-close-btn" onClick={onClose} title="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Corpo com Split: Configuração à Esquerda, Minuta à Direita */}
        <div className="impugn-split-body">
          
          {/* Coluna Esquerda: Parâmetros Jurídicos */}
          <div className="impugn-config-col">
            
            {/* Oportunidade Alvo */}
            <div className="impugn-opp-summary">
              <div className="ios-badge">
                <Gavel size={13} />
                <span>Certame: #{opportunity.number || opportunity.id}</span>
              </div>
              <h4>{opportunity.client || 'Órgão Licitante'}</h4>
              <p>{opportunity.object || opportunity.title || 'Objeto do certame'}</p>
            </div>

            {/* Tipo de Peça */}
            <div className="impugn-section-block">
              <label className="impugn-section-title">Tipo de Peça Jurídica</label>
              <div className="piece-type-tabs">
                <button 
                  type="button"
                  className={`pt-tab ${pieceType === PIECE_TYPES.IMPUGNACAO ? 'active' : ''}`}
                  onClick={() => setPieceType(PIECE_TYPES.IMPUGNACAO)}
                >
                  <Scale size={13} />
                  <span>Impugnação ao Edital</span>
                </button>
                <button 
                  type="button"
                  className={`pt-tab ${pieceType === PIECE_TYPES.ESCLARECIMENTO ? 'active' : ''}`}
                  onClick={() => setPieceType(PIECE_TYPES.ESCLARECIMENTO)}
                >
                  <BookOpen size={13} />
                  <span>Pedido de Esclarecimento</span>
                </button>
                <button 
                  type="button"
                  className={`pt-tab ${pieceType === PIECE_TYPES.RECURSO ? 'active' : ''}`}
                  onClick={() => setPieceType(PIECE_TYPES.RECURSO)}
                >
                  <FileText size={13} />
                  <span>Recurso Hierárquico</span>
                </button>
              </div>
            </div>

            {/* Empresa Impugnante */}
            <div className="impugn-section-block">
              <label className="impugn-section-title">Empresa Peticionante (Consórcio)</label>
              <div className="company-selection-grid">
                <div 
                  className={`comp-card ${companyKey === 'VEELUEN' ? 'active' : ''}`}
                  onClick={() => setCompanyKey('VEELUEN')}
                >
                  <div className="comp-name">Veeluen Solutions</div>
                  <div className="comp-cnpj">CNPJ: 45.123.890/0001-44</div>
                  <span className="comp-tag tag-eng">Engenharia & Automação</span>
                </div>
                <div 
                  className={`comp-card ${companyKey === 'EXCELENCIA' ? 'active' : ''}`}
                  onClick={() => setCompanyKey('EXCELENCIA')}
                >
                  <div className="comp-name">Excelência Ambiental</div>
                  <div className="comp-cnpj">CNPJ: 38.987.654/0001-22</div>
                  <span className="comp-tag tag-amb">Monitoramento & Emissões</span>
                </div>
              </div>
            </div>

            {/* Cláusula Alvo */}
            <div className="impugn-section-block">
              <label className="impugn-section-title">Item / Cláusula do Edital Contestada</label>
              <input 
                type="text" 
                className="impugn-input"
                placeholder="Ex: Item 5.2 do TR ou Cláusula 4.1 do Edital"
                value={specificClause}
                onChange={e => setSpecificClause(e.target.value)}
              />
            </div>

            {/* Catálogo de Vícios & Súmulas TCU */}
            <div className="impugn-section-block">
              <label className="impugn-section-title">
                Teses Jurídicas & Vícios Editalícios Identificados
                <span className="counter-pill">{selectedGroundIds.length} selecionada(s)</span>
              </label>
              
              <div className="grounds-list">
                {LEGAL_GROUNDS_CATALOG.map((ground) => {
                  const isChecked = selectedGroundIds.includes(ground.id);
                  return (
                    <div 
                      key={ground.id}
                      className={`ground-item ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleToggleGround(ground.id)}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => {}} 
                        className="ground-checkbox"
                      />
                      <div className="ground-text-box">
                        <div className="gt-header">
                          <span className="gt-title">{ground.title}</span>
                          <span className={`gt-severity ${ground.severity.toLowerCase()}`}>
                            {ground.severity}
                          </span>
                        </div>
                        <p className="gt-desc">{ground.summary}</p>
                        <span className="gt-legal">{ground.articles}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fatos Específicos Adicionais */}
            <div className="impugn-section-block">
              <label className="impugn-section-title">Circunstâncias Fáticas Adicionais (Opcional)</label>
              <textarea 
                className="impugn-textarea"
                rows={3}
                placeholder="Insira detalhes práticos da restrição observada no edital..."
                value={customFacts}
                onChange={e => setCustomFacts(e.target.value)}
              />
            </div>

            {/* Botões de Ação para Gerar */}
            <div className="impugn-generate-actions">
              <button 
                type="button" 
                className="btn-gen-heuristic"
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
              >
                <Scale size={15} />
                <span>Gerar Minuta Padrão TCU</span>
              </button>

              <button 
                type="button" 
                className="btn-gen-ai"
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                title={isAiReady ? "Enriquecer peça com Google Gemini / OpenAI" : "Gera minuta jurídica estruturada"}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Redigindo Petição com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={15} className="text-yellow-300" />
                    <span>{isAiReady ? 'Redigir com IA Jurídica' : 'Gerar Petição Formal'}</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Coluna Direita: Visualizador da Petição */}
          <div className="impugn-preview-col">
            {generatedPiece ? (
              <div className="piece-display-container">
                <div className="piece-display-header">
                  <div className="pdh-info">
                    <h4>{generatedPiece.title}</h4>
                    <span className="pdh-badge">
                      {generatedPiece.isAiEnhanced 
                        ? `✨ Enriquecido por IA (${generatedPiece.aiModel})` 
                        : '⚖️ Minuta Jurídica Base TCU'}
                    </span>
                  </div>

                  <div className="pdh-actions">
                    <button 
                      type="button" 
                      className={`btn-piece-action ${copied ? 'copied' : ''}`}
                      onClick={handleCopy}
                      title="Copiar texto integral para a área de transferência"
                    >
                      {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                    </button>
                    
                    <button 
                      type="button" 
                      className="btn-piece-action"
                      onClick={handleDownload}
                      title="Baixar arquivo de texto pronto para protocolo"
                    >
                      <Download size={14} />
                      <span>Baixar .txt</span>
                    </button>
                  </div>
                </div>

                <div className="piece-paper-view">
                  <pre>{generatedPiece.content}</pre>
                </div>
              </div>
            ) : (
              <div className="piece-empty-state">
                <div className="empty-icon-wrap">
                  <Scale size={36} className="text-slate-500" />
                </div>
                <h4>Petição Jurídica Pronta para Elaboração</h4>
                <p>
                  Selecione as teses aplicáveis à esquerda e clique em <strong>"Gerar Minuta Padrão TCU"</strong> ou <strong>"Redigir com IA Jurídica"</strong> para produzir a peça formal pronta para protocolo no portal de licitação.
                </p>
                <div className="empty-checklist">
                  <div><CheckCircle2 size={14} className="text-teal-400" /> Preâmbulo formal e tempestividade (3 dias úteis)</div>
                  <div><CheckCircle2 size={14} className="text-teal-400" /> Enquadramento normativo (Lei 14.133/21 ou Lei 13.303/16)</div>
                  <div><CheckCircle2 size={14} className="text-teal-400" /> Citação direta de Súmulas e Acórdãos do TCU</div>
                  <div><CheckCircle2 size={14} className="text-teal-400" /> Pedidos expressos de retificação ou suspensão cautelar</div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
