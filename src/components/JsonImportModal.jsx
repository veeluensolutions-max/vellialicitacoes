import React, { useState } from 'react';
import { X, FileCode2, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Copy, Layers } from 'lucide-react';
import { OpportunityService } from '../services/opportunityService';
import './JsonImportModal.css';

const DEFAULT_JSON_EXAMPLE = `{
  "portal": "Petronect",
  "numero": "7004489912",
  "contratante": "Petrobras - Refinaria Abreu e Lima",
  "titulo": "Serviços especializados de dispersão atmosférica e qualidade do ar",
  "objeto": "Modelagem matemática de dispersão atmosférica através do software AERMOD e avaliação contínua da qualidade do ar ambiente para atendimento ao CPRH.",
  "descricao": "Elaboração de estudos de pluma com dados meteorológicos de superfície e altitude.",
  "data_publicacao": "2026-10-07",
  "data_encerramento": "2026-10-26",
  "estado": "PE",
  "cidade": "Ipojuca",
  "valor_estimado": 650000,
  "url": "https://petronect.com/portal/7004489912"
}`;

export default function JsonImportModal({ isOpen, onClose, onSuccess }) {
  const [jsonText, setJsonText] = useState(DEFAULT_JSON_EXAMPLE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleImport = () => {
    setErrorMsg(null);
    setResult(null);
    setLoading(true);

    try {
      const res = OpportunityService.importFromJson(jsonText);
      setResult(res);
      setLoading(false);
      if (onSuccess) onSuccess(res);
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message);
    }
  };

  const handleLoadSample = (type) => {
    if (type === 'ete') {
      setJsonText(`{
  "portal": "Petronect",
  "numero": "7004491122",
  "contratante": "Transpetro - Terminal Suape",
  "titulo": "Operação e manutenção preventiva de ETE e descarte de efluentes sanitários",
  "objeto": "Operação, acompanhamento e manutenção preventiva e corretiva de sistema de tratamento de esgoto sanitário e efluentes industriais com controle de dosagem química e lodos ativados.",
  "descricao": "Fornecimento de equipe técnica residente para condução de ETE em regime contínuo.",
  "data_publicacao": "2026-10-07",
  "data_encerramento": "2026-10-28",
  "estado": "PE",
  "cidade": "Cabo de Santo Agostinho",
  "valor_estimado": 1950000,
  "url": "https://petronect.com/portal/7004491122"
}`);
    } else if (type === 'nr13') {
      setJsonText(`{
  "portal": "Petronect",
  "numero": "7004493344",
  "contratante": "Petrobras - UO-BS Santos",
  "titulo": "Inspeção de segurança em vasos de pressão e caldeiras conforme NR-13",
  "objeto": "Inspeção de segurança em vasos de pressão e equipamentos pressurizados com realização de ultrassom e ensaios não destrutivos.",
  "descricao": "Emissão de relatórios e reconstituição de prontuário por Engenheiro Mecânico Habilitado.",
  "data_publicacao": "2026-10-07",
  "data_encerramento": "2026-10-22",
  "estado": "SP",
  "cidade": "Santos",
  "valor_estimado": 720000,
  "url": "https://petronect.com/portal/7004493344"
}`);
    } else {
      setJsonText(DEFAULT_JSON_EXAMPLE);
    }
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container json-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <FileCode2 size={18} className="text-teal" />
            <h3>Importação Estruturada por JSON</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-form-body">
          <div className="form-info-callout">
            <Sparkles size={14} className="text-teal" />
            <span>
              Cole uma oportunidade individual ou uma lista de objetos JSON. O sistema executará <strong>remoção de duplicidades</strong>, cálculo de prazo, <strong>Motor de Aderência</strong> e geração de tags.
            </span>
          </div>

          <div className="json-samples-row">
            <span className="sample-label">Carregar Exemplo:</span>
            <button className="sample-btn" onClick={() => handleLoadSample('default')}>
              AERMOD / Ar (Excelência)
            </button>
            <button className="sample-btn" onClick={() => handleLoadSample('ete')}>
              ETE / Esgoto (Veeluen)
            </button>
            <button className="sample-btn" onClick={() => handleLoadSample('nr13')}>
              NR-13 / Vasos (Veeluen)
            </button>
          </div>

          <div className="form-field">
            <label>Payload JSON (Individual ou Array de Oportunidades)</label>
            <textarea
              className="modal-textarea json-editor mono"
              rows={11}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Cole seu JSON aqui..."
            />
          </div>

          {errorMsg && (
            <div className="feedback-banner error">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {result && (
            <div className="json-result-summary">
              <div className="result-summary-header">
                <CheckCircle2 size={16} className="text-teal" />
                <strong>Relatório de Processamento JSON</strong>
              </div>
              <div className="result-stats-pills">
                <span className="stat-pill">Recebidos: <strong>{result.received}</strong></span>
                <span className="stat-pill stat-new">Novos: <strong>{result.created}</strong></span>
                <span className="stat-pill stat-dup">Duplicados/Atualizados: <strong>{result.updated}</strong></span>
                {result.errors > 0 && <span className="stat-pill stat-err">Erros: <strong>{result.errors}</strong></span>}
              </div>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Fechar
            </button>
            <button type="button" className="btn-save-opp" onClick={handleImport} disabled={loading}>
              <RefreshCw size={14} className={loading ? 'spinning' : ''} />
              <span>{loading ? 'Processando e Analisando...' : 'Importar e Executar Motor'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
