import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Key, 
  Cpu, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  ExternalLink,
  Bot,
  Zap,
  Info
} from 'lucide-react';
import { AiModelProviderService, AI_PROVIDERS } from '../../services/ai/aiModelProviderService';
import './AiProviderSettingsModal.css';

export default function AiProviderSettingsModal({ isOpen, onClose, onSaveSuccess }) {
  const [config, setConfig] = useState(() => AiModelProviderService.getConfig());
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(AiModelProviderService.getConfig());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (newProvider) => {
    setConfig(prev => ({ ...prev, provider: newProvider }));
    setTestResult(null);
  };

  const handleSave = () => {
    AiModelProviderService.saveConfig(config);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onSaveSuccess) onSaveSuccess(config);
      onClose();
    }, 900);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const activeKey = config.provider === AI_PROVIDERS.GEMINI ? config.geminiApiKey : config.openaiApiKey;
      const activeModel = config.provider === AI_PROVIDERS.GEMINI ? config.geminiModel : config.openaiModel;
      
      const res = await AiModelProviderService.testConnection({
        provider: config.provider,
        apiKey: activeKey,
        model: activeModel
      });
      setTestResult(res);
    } catch (err) {
      setTestResult({
        success: false,
        latencyMs: 0,
        message: err.message || 'Falha ao conectar com o provedor de IA'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isGemini = config.provider === AI_PROVIDERS.GEMINI;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <div className="ai-badge-icon">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3>Configuração de Inteligência Artificial Generativa</h3>
              <p>Conecte o Vellia ao Google Gemini ou OpenAI para auditoria de editais e Copilot de Licitações</p>
            </div>
          </div>
          <button className="ai-modal-close" onClick={onClose} title="Fechar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo */}
        <div className="ai-modal-body">
          {/* Seletor de Provedor */}
          <div className="ai-form-group">
            <label className="ai-label">Provedor de IA em Nuvem</label>
            <div className="ai-provider-cards">
              <div 
                className={`ai-provider-card ${isGemini ? 'active' : ''}`}
                onClick={() => handleProviderChange(AI_PROVIDERS.GEMINI)}
              >
                <div className="provider-header">
                  <div className="provider-icon-badge gemini">
                    <Sparkles className="w-5 h-5 text-purple-300" />
                  </div>
                  <div>
                    <h4>Google Gemini</h4>
                    <span className="badge-tag tag-gemini">Recomendado • Alta Janela</span>
                  </div>
                </div>
                <p>Suporta leitura de editais inteiros em PDF (até 1M de tokens) com o Gemini 1.5 Pro ou Flash.</p>
              </div>

              <div 
                className={`ai-provider-card ${!isGemini ? 'active' : ''}`}
                onClick={() => handleProviderChange(AI_PROVIDERS.OPENAI)}
              >
                <div className="provider-header">
                  <div className="provider-icon-badge openai">
                    <Bot className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h4>OpenAI</h4>
                    <span className="badge-tag tag-openai">GPT-4o & GPT-4o Mini</span>
                  </div>
                </div>
                <p>Excelente raciocínio lógico e conformidade jurídica estrita para redação de recursos e impugnações.</p>
              </div>
            </div>
          </div>

          {/* Modelo Selecionado */}
          <div className="ai-form-group">
            <label className="ai-label">Modelo Selecionado</label>
            {isGemini ? (
              <select 
                className="ai-select"
                value={config.geminiModel}
                onChange={e => setConfig(prev => ({ ...prev, geminiModel: e.target.value }))}
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash (Ultra Rápido • Custo Otimizado)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (Máxima Precisão Jurídica • 2M Contexto)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Nova Geração Multimodal)</option>
              </select>
            ) : (
              <select 
                className="ai-select"
                value={config.openaiModel}
                onChange={e => setConfig(prev => ({ ...prev, openaiModel: e.target.value }))}
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Leve, Rápido e Econômico)</option>
                <option value="gpt-4o">gpt-4o (Omni Flagship de Alta Capacidade)</option>
              </select>
            )}
          </div>

          {/* Chave de API */}
          <div className="ai-form-group">
            <div className="label-with-link">
              <label className="ai-label">
                <Key className="w-4 h-4 text-slate-400" />
                Chave de API ({isGemini ? 'Google AI Studio' : 'OpenAI Platform'})
              </label>
              <a 
                href={isGemini ? "https://aistudio.google.com/app/apikey" : "https://platform.openai.com/api-keys"} 
                target="_blank" 
                rel="noreferrer"
                className="get-key-link"
              >
                Obter chave de API <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="input-with-button">
              <input 
                type={showKey ? "text" : "password"} 
                className="ai-input"
                placeholder={isGemini ? "AIzaSy..." : "sk-proj-..."}
                value={isGemini ? (config.geminiApiKey || '') : (config.openaiApiKey || '')}
                onChange={e => {
                  const val = e.target.value;
                  setConfig(prev => isGemini ? ({ ...prev, geminiApiKey: val }) : ({ ...prev, openaiApiKey: val }));
                  setTestResult(null);
                }}
              />
              <button 
                type="button" 
                className="ai-btn-ghost"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? 'Ocultar' : 'Exibir'}
              </button>
            </div>
            <span className="ai-help-text">
              Sua chave fica criptografada localmente no navegador e nunca é exposta publicamente.
            </span>
          </div>

          {/* Parâmetros de Inferência */}
          <div className="ai-parameters-grid">
            <div className="ai-form-group">
              <label className="ai-label">
                <Sliders className="w-4 h-4 text-slate-400" />
                Temperatura: <strong>{config.temperature}</strong>
              </label>
              <input 
                type="range" 
                min="0.0" 
                max="0.8" 
                step="0.05"
                className="ai-range"
                value={config.temperature}
                onChange={e => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              />
              <span className="ai-help-text">Baixa (0.1 - 0.2) garante fidelidade estrita ao edital sem alucinações.</span>
            </div>

            <div className="ai-form-group">
              <label className="ai-label">
                <Cpu className="w-4 h-4 text-slate-400" />
                Tokens Máximos de Resposta
              </label>
              <input 
                type="number" 
                className="ai-input"
                min="500"
                max="8000"
                step="500"
                value={config.maxTokens}
                onChange={e => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value, 10) || 2000 }))}
              />
              <span className="ai-help-text">Espaço reservado para respostas longas e pareceres.</span>
            </div>
          </div>

          {/* Feedback de Teste */}
          {testResult && (
            <div className={`ai-test-banner ${testResult.success ? 'success' : 'error'}`}>
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong>Conexão Concluída com Sucesso! ({testResult.latencyMs}ms)</strong>
                    <p>{testResult.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <strong>Falha na Autenticação / Conexão</strong>
                    <p>{testResult.message}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Nota de Fallback Automático */}
          <div className="ai-info-callout">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <p>
              <strong>Resiliência Híbrida:</strong> Mesmo que você fique sem internet ou a API atinja limites de quota, o Vellia ativará instantaneamente o motor heurístico local de engenharia, garantindo que o fluxo de licitações nunca seja interrompido.
            </p>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="ai-modal-footer">
          <button 
            type="button" 
            className="ai-btn ai-btn-test"
            onClick={handleTestConnection}
            disabled={isTesting}
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testando Conexão...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                Testar Chave de API
              </>
            )}
          </button>

          <div className="footer-right-actions">
            <button type="button" className="ai-btn ai-btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button 
              type="button" 
              className={`ai-btn ai-btn-primary ${saveSuccess ? 'btn-success' : ''}`}
              onClick={handleSave}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Salvo com Sucesso!
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Salvar Preferências
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
