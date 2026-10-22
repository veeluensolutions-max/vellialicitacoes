import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight, 
  Building2, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  FileCode2, 
  Cpu, 
  Layers, 
  Bot 
} from 'lucide-react';
import { EditalPdfParserService } from '../services/edital/editalPdfParserService';
import { OpportunityService } from '../services/opportunityService';
import { opportunityRepository } from '../services/opportunityRepository';
import { EventBus, VELLIA_EVENTS } from '../services/eventBus';
import './EditalUploadParserModal.css';

const SAMPLE_TEXT_EXCELENCIA = `PREGÃO ELETRÔNICO Nº 7004489912 - PETROBRAS
ÓRGÃO: Petróleo Brasileiro S.A. - Refinaria Abreu e Lima (RNEST)
LOCAL: Ipojuca - Pernambuco
DATA DE ENCERRAMENTO: 28/10/2026 às 14:00h
VALOR ESTIMADO: R$ 1.850.000,00

1. DO OBJETO
1.1. Contratação de serviços de engenharia ambiental para medição, coleta e monitoramento contínuo de emissões atmosféricas em fontes estacionárias, dutos e chaminés industriais, incluindo amostragem isocinética e emissão de laudos técnicos de conformidade com os padrões da Resolução CONAMA nº 491/2018 e diretrizes da CPRH.

2. DA HABILITAÇÃO E QUALIFICAÇÃO TÉCNICA
2.1. Registro no CREA da pessoa jurídica e do Responsável Técnico com ART específica.
2.2. Comprovação de aptidão técnica (CAT) para serviços de amostragem isocinética e avaliação de pluma de poluentes.
2.3. Certidões de regularidade fiscal (CND Federal, Estadual, FGTS e CNDT) válidas na data da sessão.`;

const SAMPLE_TEXT_VEELUEN = `LICITAÇÃO ELETRÔNICA PETRONECT Nº 7004491122
CONTRATANTE: Transpetro - Petrobras Transporte S.A. - Terminal de Suape
MUNICÍPIO: Cabo de Santo Agostinho - PE
DATA LIMITE PARA PROPOSTAS: 31/10/2026 às 11:00h
ORÇAMENTO ESTIMADO: R$ 2.400.000,00

DO OBJETO:
Contratação de empresa especializada em engenharia sanitária e mecânica para operação, manutenção preventiva e corretiva de Estação de Tratamento de Efluentes (ETE), contemplando descarte de efluentes industriais, skids de dosagem química, decantadores e adequação a vasos de pressão conforme Norma Regulamentadora NR-13.

EXIGÊNCIAS TÉCNICAS:
- Registro no CREA e Responsável Técnico com atribuições no CONFEA.
- Atestado de capacidade técnica comprovando operação de ETE com vazão superior a 15 m³/h.
- Cumprimento rigoroso das normas de segurança operacional da Transpetro.`;

export default function EditalUploadParserModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onOpenAnalysisAfterSave 
}) {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'paste'
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  
  // Pipeline de Parsing
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [parseError, setParseError] = useState(null);

  // Resultado Extraído & Editável
  const [parsedData, setParsedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Lidar com seleção de arquivo via input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Drag and Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Executar Pipeline de Leitura e Parsing
  const processSelectedFile = async (file) => {
    setSelectedFile(file);
    setParseError(null);
    setParsedData(null);
    setIsProcessing(true);

    try {
      setProcessingStep('1/4 - Lendo arquivo e decodificando streams...');
      setProgressPercent(25);

      const fileResult = await EditalPdfParserService.extractTextFromFile(file);

      if (fileResult.isScannedOrEncrypted && !fileResult.rawText) {
        setIsProcessing(false);
        setParseError(fileResult.notice);
        setInputMode('paste');
        return;
      }

      setProcessingStep('2/4 - Identificando número, órgão, prazos e objeto...');
      setProgressPercent(50);
      await new Promise(r => setTimeout(r, 300));

      setProcessingStep('3/4 - Extraindo requisitos técnicos e contratuais...');
      setProgressPercent(75);
      await new Promise(r => setTimeout(r, 300));

      const parsed = EditalPdfParserService.parseEditalText(fileResult.rawText, file.name);

      setProcessingStep('4/4 - Calculando aderência com o catálogo técnico Vellia...');
      setProgressPercent(100);
      await new Promise(r => setTimeout(r, 350));

      setParsedData(parsed);
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      setParseError(err.message || 'Falha ao processar arquivo.');
    }
  };

  // Processar texto colado
  const handleProcessPastedText = async () => {
    if (!pastedText.trim()) {
      setParseError('Cole o texto do edital ou termo de referência para continuar.');
      return;
    }

    setParseError(null);
    setParsedData(null);
    setIsProcessing(true);

    try {
      setProcessingStep('1/3 - Analisando estrutura textual do edital...');
      setProgressPercent(33);
      await new Promise(r => setTimeout(r, 250));

      setProcessingStep('2/3 - Extraindo dados contratuais e requisitos...');
      setProgressPercent(66);
      await new Promise(r => setTimeout(r, 250));

      const parsed = EditalPdfParserService.parseEditalText(pastedText, 'edital_colado.txt');

      setProcessingStep('3/3 - Calculando aderência semântica...');
      setProgressPercent(100);
      await new Promise(r => setTimeout(r, 250));

      setParsedData(parsed);
      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      setParseError(err.message || 'Falha ao processar texto.');
    }
  };

  // Salvar no Banco de Oportunidades do Vellia
  const handleSaveOpportunity = (openAnalysis = false) => {
    if (!parsedData) return;
    setIsSaving(true);

    try {
      const enriched = OpportunityService.enrichOpportunity({
        ...parsedData,
        sourceOrigin: 'Parser de Edital PDF'
      }, 'Parser de Edital PDF');

      // Salva no repositório oficial
      opportunityRepository.add(enriched);
      EventBus.emit(VELLIA_EVENTS.OPPORTUNITIES_UPDATED, enriched);

      setIsSaving(false);
      setSavedSuccess(true);

      setTimeout(() => {
        if (onSuccess) onSuccess(enriched);
        if (openAnalysis && onOpenAnalysisAfterSave) {
          onOpenAnalysisAfterSave(enriched.id || enriched.number);
        }
        handleResetAndClose();
      }, 700);
    } catch (err) {
      setIsSaving(false);
      setParseError(`Erro ao salvar no banco: ${err.message}`);
    }
  };

  const handleResetAndClose = () => {
    setSelectedFile(null);
    setPastedText('');
    setParsedData(null);
    setIsProcessing(false);
    setParseError(null);
    setSavedSuccess(false);
    onClose();
  };

  return (
    <div className="edital-parser-overlay" onClick={handleResetAndClose}>
      <div className="edital-parser-container" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="edital-parser-header">
          <div className="edital-parser-title-group">
            <div className="edital-parser-icon-wrap">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="edital-parser-title">
                Leitor & Parser Inteligente de Editais
                <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 6px', borderRadius: '4px' }}>
                  IA SEMÂNTICA
                </span>
              </h2>
              <p className="edital-parser-subtitle">
                Arraste um PDF ou cole o texto do edital para extração instantânea de objeto, prazos e aderência técnica.
              </p>
            </div>
          </div>
          <button className="edital-parser-close" onClick={handleResetAndClose}>
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div className="edital-parser-body">
          {/* Alternador de Modo */}
          {!parsedData && (
            <div className="edital-mode-tabs">
              <button 
                type="button"
                className={`edital-mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
                onClick={() => setInputMode('upload')}
              >
                <Upload size={14} />
                <span>Upload de Arquivo (PDF / DOCX)</span>
              </button>
              <button 
                type="button"
                className={`edital-mode-btn ${inputMode === 'paste' ? 'active' : ''}`}
                onClick={() => setInputMode('paste')}
              >
                <FileText size={14} />
                <span>Colar Texto do Edital</span>
              </button>
            </div>
          )}

          {/* Mensagem de Erro */}
          {parseError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} color="#EF4444" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Etapa 1: Área de Entrada (quando ainda não processado) */}
          {!parsedData && !isProcessing && inputMode === 'upload' && (
            <>
              <div 
                className={`edital-dropzone ${isDragOver ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".pdf,.txt,.docx,.doc,.html,.json"
                  onChange={handleFileChange}
                />
                <div className="dropzone-icon-circle">
                  <Upload size={28} />
                </div>
                <p className="dropzone-main-text">
                  Arraste e solte o Edital ou Termo de Referência aqui
                </p>
                <p className="dropzone-sub-text">
                  Ou clique para selecionar um arquivo do seu computador
                </p>
                <div className="dropzone-badge-list">
                  <span className="dropzone-badge">.PDF</span>
                  <span className="dropzone-badge">.DOCX</span>
                  <span className="dropzone-badge">.TXT</span>
                  <span className="dropzone-badge">.HTML</span>
                </div>
              </div>

              {/* Amostras Rápidas */}
              <div className="edital-samples-row">
                <span>Ou experimente com um edital de exemplo:</span>
                <button 
                  type="button" 
                  className="sample-chip"
                  onClick={() => {
                    setInputMode('paste');
                    setPastedText(SAMPLE_TEXT_EXCELENCIA);
                  }}
                >
                  ⚡ Petrobras RNEST (Emissões • Excelência)
                </button>
                <button 
                  type="button" 
                  className="sample-chip"
                  onClick={() => {
                    setInputMode('paste');
                    setPastedText(SAMPLE_TEXT_VEELUEN);
                  }}
                >
                  ⚡ Transpetro Suape (ETE / NR-13 • Veeluen)
                </button>
              </div>
            </>
          )}

          {!parsedData && !isProcessing && inputMode === 'paste' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea 
                className="edital-paste-area"
                placeholder="Cole aqui o texto completo ou trecho relevante do Edital / Termo de Referência..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="edital-samples-row">
                  <span>Exemplos rápidos:</span>
                  <button 
                    type="button" 
                    className="sample-chip"
                    onClick={() => setPastedText(SAMPLE_TEXT_EXCELENCIA)}
                  >
                    Petrobras RNEST
                  </button>
                  <button 
                    type="button" 
                    className="sample-chip"
                    onClick={() => setPastedText(SAMPLE_TEXT_VEELUEN)}
                  >
                    Transpetro ETE
                  </button>
                </div>
                <button 
                  type="button" 
                  className="btn-parser-save"
                  onClick={handleProcessPastedText}
                >
                  <Sparkles size={14} />
                  <span>Processar Texto</span>
                </button>
              </div>
            </div>
          )}

          {/* Etapa 2: Pipeline Visual em Execução */}
          {isProcessing && (
            <div className="edital-parsing-pipeline">
              <RefreshCw size={36} className="pipeline-spinner" />
              <p className="pipeline-step-text">{processingStep}</p>
              <div className="pipeline-progress-bar">
                <div className="pipeline-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Cruzando dados com normas CONAMA, NR-13, portais de compras e catálogo das empresas.
              </span>
            </div>
          )}

          {/* Etapa 3: Resultado Extraído & Aderência */}
          {parsedData && (
            <div className="parsed-result-card">
              {/* Header do Card de Resultado */}
              <div className="result-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', background: 'rgba(14, 165, 233, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      {parsedData.portal}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#CBD5E1', fontWeight: 600 }}>
                      Nº {parsedData.number}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: '6px 0 0 0' }}>
                    {parsedData.title}
                  </h3>
                  {/* Badge da Empresa Recomendada */}
                  <div 
                    className="company-assignment-badge"
                    style={{
                      background: parsedData.recommendedCompany?.includes('Excelência') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                      border: `1px solid ${parsedData.recommendedCompany?.includes('Excelência') ? '#10B981' : '#38BDF8'}`,
                      color: parsedData.recommendedCompany?.includes('Excelência') ? '#34D399' : '#38BDF8'
                    }}
                  >
                    <Building2 size={13} />
                    <span>Empresa Recomendada: <strong>{parsedData.recommendedCompany}</strong></span>
                  </div>
                </div>

                {/* Badge de Score Semântico */}
                <div className="result-score-badge">
                  <div className="score-number" style={{ color: (parsedData.score || 0) >= 80 ? '#10B981' : '#F59E0B' }}>
                    {parsedData.score}%
                  </div>
                  <div 
                    className="score-tag"
                    style={{
                      background: (parsedData.score || 0) >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: (parsedData.score || 0) >= 80 ? '#34D399' : '#FBBF24'
                    }}
                  >
                    {(parsedData.score || 0) >= 90 ? 'Crítica' : (parsedData.score || 0) >= 70 ? 'Alta Aderência' : 'Média'}
                  </div>
                </div>
              </div>

              {/* Grid de Campos Extraídos e Editáveis */}
              <div className="result-form-grid">
                <div className="result-field-group">
                  <label className="result-field-label">Órgão Contratante</label>
                  <input 
                    type="text" 
                    className="result-input" 
                    value={parsedData.client || ''} 
                    onChange={(e) => setParsedData({ ...parsedData, client: e.target.value })}
                  />
                </div>
                <div className="result-field-group">
                  <label className="result-field-label">Modalidade</label>
                  <input 
                    type="text" 
                    className="result-input" 
                    value={parsedData.modality || ''} 
                    onChange={(e) => setParsedData({ ...parsedData, modality: e.target.value })}
                  />
                </div>

                <div className="result-field-group">
                  <label className="result-field-label">Valor Estimado</label>
                  <input 
                    type="text" 
                    className="result-input" 
                    value={parsedData.estimatedValue || ''} 
                    onChange={(e) => setParsedData({ ...parsedData, estimatedValue: e.target.value })}
                  />
                </div>

                <div className="result-field-group">
                  <label className="result-field-label">Data de Encerramento (Prazo)</label>
                  <input 
                    type="text" 
                    className="result-input" 
                    value={parsedData.endDate || ''} 
                    onChange={(e) => setParsedData({ ...parsedData, endDate: e.target.value })}
                  />
                </div>

                <div className="result-field-group full-width">
                  <label className="result-field-label">Objeto Sintetizado</label>
                  <textarea 
                    className="result-input" 
                    rows={3} 
                    value={parsedData.object || ''} 
                    onChange={(e) => setParsedData({ ...parsedData, object: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Requisitos Detectados */}
              {parsedData.requirementsPreview?.length > 0 && (
                <div>
                  <span className="result-field-label">Requisitos e Exigências Identificadas</span>
                  <div className="requirements-tag-cloud">
                    {parsedData.requirementsPreview.map((req, i) => (
                      <span key={i} className="req-pill">
                        <strong>[{req.type}]</strong> {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="edital-parser-footer">
          <button type="button" className="btn-parser-cancel" onClick={handleResetAndClose}>
            {parsedData ? 'Descartar' : 'Fechar'}
          </button>

          {parsedData && (
            <>
              <button 
                type="button" 
                className="btn-parser-cancel"
                onClick={() => {
                  setParsedData(null);
                  setSelectedFile(null);
                  setPastedText('');
                }}
              >
                Ler Outro Arquivo
              </button>

              <button 
                type="button" 
                className="btn-parser-save"
                onClick={() => handleSaveOpportunity(false)}
                disabled={isSaving}
              >
                {isSaving ? <RefreshCw size={14} className="pipeline-spinner" /> : <CheckCircle2 size={15} />}
                <span>Salvar no Radar</span>
              </button>

              <button 
                type="button" 
                className="btn-parser-save"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderColor: '#10B981' }}
                onClick={() => handleSaveOpportunity(true)}
                disabled={isSaving}
              >
                <ArrowRight size={15} />
                <span>Salvar e Abrir Análise</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
